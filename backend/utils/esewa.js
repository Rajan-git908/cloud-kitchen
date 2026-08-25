import crypto from "crypto";

export const generateEsewaSignature = (totalAmount, transactionUuid, productCode, secretKey) => {
  // Format must strictly match: total_amount=VALUE,transaction_uuid=VALUE,product_code=VALUE
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

  return crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");
};