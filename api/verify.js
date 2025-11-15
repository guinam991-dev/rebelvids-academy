import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    // Secret key from Vercel Environment Variable
    const secret = process.env.RAZORPAY_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        error: "Server misconfigured. Missing RAZORPAY_SECRET",
      });
    }

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare signatures
    const isValid = expectedSignature === razorpay_signature;

    return res.json({ success: isValid });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
