// pages/api/getipaddress.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const xff = req.headers["x-forwarded-for"] as string | undefined;
    let ip = "";

    if (xff) {
      ip = xff.split(",")[0].trim();
    } else if (req.socket?.remoteAddress) {
      ip = req.socket.remoteAddress || "";
    }

    if (ip?.startsWith("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    }

    res.status(200).json({ success: true, ip });
  } catch (error: any) {
    console.error("IP fetch error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
