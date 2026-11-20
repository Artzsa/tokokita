import { getAdmin } from "@/lib/auth";
import { getSetting, setSetting } from "@/lib/settings";

export async function POST() {
  if (!(await getAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pid = Number(await getSetting("bot_pid"));
  if (pid) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // proses sudah mati
    }
  }

  await setSetting("bot_pid", "");
  await setSetting("bot_status", "offline");
  await setSetting("bot_qr", "");
  await setSetting("bot_pairing_code", "");

  return Response.json({ ok: true });
}
