import db from "../models/db.js";
import { generateEsewaSignature } from "../utils/esewa.js";

export const initiateEsewaPayment = (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  db.query("SELECT * FROM orders WHERE id = ?", [order_id], (err, results) => {
    if (err || !results.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = results[0];
    
    // eSewa requires exactly two decimal places (e.g., "250.00")
    const totalAmount = Number(order.total).toFixed(2);
    const transactionUuid = `${order.id}-${Date.now()}`;
    const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

    const signature = generateEsewaSignature(
      totalAmount,
      transactionUuid,
      productCode,
      secretKey
    );

    const clientUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    res.json({
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${clientUrl}/payment-success`,
      failure_url: `${clientUrl}/checkout`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
      esewa_url: process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    });
  });
};

export const verifyEsewaPayment = (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: "Response payload missing" });
  }

  try {
    // Decode eSewa's base64 response string
    const decodedString = Buffer.from(data, "base64").toString("utf-8");
    const decodedData = JSON.parse(decodedString);

    const { total_amount, transaction_uuid, product_code, signature, status } = decodedData;
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

    const expectedSignature = generateEsewaSignature(
      total_amount,
      transaction_uuid,
      product_code,
      secretKey
    );

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: "Signature verification failed" });
    }

    if (status !== "COMPLETE") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Extract original Database Order ID from "ORDERID-TIMESTAMP" string
    const orderId = transaction_uuid.split("-")[0];

    db.query(
      "UPDATE orders SET status = 'Preparing' WHERE id = ?",
      [orderId],
      (err) => {
        if (err) return res.status(500).json({ error: "Database update error" });
        res.json({ message: "Payment success", order_id: orderId });
      }
    );
  } catch (err) {
    return res.status(500).json({ error: "Invalid payload format" });
  }
};