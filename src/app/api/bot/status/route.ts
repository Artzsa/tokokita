import { createHash } from "node:crypto";
import { getAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

function isAlive(pid: number) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await getAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [status, qr, pairingCode, pid, method, dryRun] = await Promise.all([
    getSetting("bot_status"),
    getSetting("bot_qr"),
    getSetting("bot_pairing_code"),
    getSetting("bot_pid"),
    getSetting("loginMethod"),
    getSetting("dryRun"),
  ]);

  return Response.json({
    status: status || "offline",
    hasQr: Boolean(qr),
    qrVersion: qr
      ? createHash("sha1").update(qr).digest("hex").slice(0, 8)
      : "",
    pairingCode,
    running: isAlive(Number(pid)),
    method: method || "qr",
    dryRun: dryRun === "true",
  });
}
