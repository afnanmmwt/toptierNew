import { getSession } from "@lib/session";
import { fetch_gateway } from "@src/actions";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    // 1. Get Stripe keys from your backend get_gateway API
    const stripe_cradencial = await fetch_gateway();

    if (!stripe_cradencial?.data) {
      throw new Error("Missing Stripe credentials data");
    }
    // Decode Base64 → JSON string
    const decodedString = Buffer.from(stripe_cradencial.data, "base64").toString("utf-8");

    // Parse it into an object
    const decodedData = JSON.parse(decodedString);


    if (!decodedData?.secret_key) {
      throw new Error("Stripe secret key missing in decoded data");
    }

    // 2. Initialize Stripe with decoded credentials
    const stripe = new Stripe(decodedData.secret_key, {
      apiVersion: decodedData.version || "2024-06-20",
    });

    // 3. Get user payment values
    const userinfo = (await getSession()) as any;
    const user_id = userinfo?.user?.user_id ?? "";

    const { amount, currency, email, booking_ref_no } = await req.json();

    if (!amount || !currency || !email || !booking_ref_no) {
      throw new Error("Missing required payment parameters");
    }

    // 4. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
    });
const origin = req.headers.get("origin")
    // 5. Generate invoice URL + token
    const invoiceUrl = `${origin}/hotels/invoice/${booking_ref_no}`;

    const tokenData = {
      booking_ref_no,
      price: amount,
      currency,
      invoice_url: invoiceUrl,
      module_type: "hotels",
      user_id,
      client_email: email,
    };

    const token = Buffer.from(JSON.stringify(tokenData)).toString("base64");

    // 6. Success URL
    const root = process.env.NEXT_PUBLIC_BASE_URL;
    const success_url = `${root}payment/success/?token=${token}&gateway=stripe&type=0&key=&trx_id=${paymentIntent.id}`;

    // 7. Send response
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id,
      success_url,
      token,
    });
  } catch (error: any) {
    console.error("Stripe Payment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
