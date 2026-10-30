const crypto = require("crypto");
const https = require("https");

// Minimal Razorpay client (no SDK dependency): create order + verify signature.
const isConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const createRazorpayOrder = ({ amountPaise, receipt, notes }) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes });
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const req = https.request(
      {
        hostname: "api.razorpay.com",
        path: "/v1/orders",
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (res.statusCode >= 400) return reject(new Error(json?.error?.description || "Razorpay order failed"));
            resolve(json);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });

const verifySignature = ({ razorpayOrderId, razorpayPaymentId, signature }) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = { isConfigured, createRazorpayOrder, verifySignature };
