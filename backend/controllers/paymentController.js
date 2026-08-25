import db from "../models/db.js";
import crypto from "crypto";
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
  // Support payload sent via query param or body
  const data = req.body?.data || req.query?.data;

  if (!data) {
    return res.status(400).json({ error: "Response payload missing" });
  }

  try {
    // 1. Decode eSewa's base64 string
    const decodedString = Buffer.from(data, "base64").toString("utf-8");
    const decodedData = JSON.parse(decodedString);

    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature
    } = decodedData;

    if (status !== "COMPLETE") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

    // 2. Build verification signature dynamically from signed_field_names
    const map = {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names
    };

    const signatureString = signed_field_names
      .split(",")
      .map((field) => `${field}=${map[field]}`)
      .join(",");

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(signatureString)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.error("Signature Mismatch:", { expectedSignature, receivedSignature: signature, signatureString });
      return res.status(400).json({ error: "Signature verification failed" });
    }

    // 3. Extract Order ID
    const orderId = transaction_uuid.split("-")[0];

    // 4. Update Database Order
    db.query(
      "UPDATE orders SET status = 'Preparing', payment_status = 'Completed' WHERE id = ?",
      [orderId],
      (err) => {
        if (err) {
          console.error("Database update error:", err);
          return res.status(500).json({ error: "Database update error" });
        }

        // Also update payments tracking table safely
        db.query(
          "UPDATE payments SET status = 'Completed', transaction_code = ? WHERE order_id = ?",
          [transaction_code, orderId],
          (payErr) => {
            if (payErr) {
              console.error("Payment log update error:", payErr);
            }
            return res.json({ message: "Payment verified successfully", order_id: orderId });
          }
        );
      }
    );
  } catch (err) {
    console.error("Verification processing error:", err);
    return res.status(400).json({ error: "Invalid payload or parsing error" });
  }
};