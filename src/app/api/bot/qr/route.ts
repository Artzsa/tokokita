import QRCode from "qrcode";
import { getAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

export async function GET() {
  if (!(await getAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const qr = await getSetting("bot_qr");
  if (!qr) {
    return new Response("Belum ada QR", { status: 404 });
  }

  const svg = await QRCode.toString(qr, { type: "svg", margin: 1 });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
