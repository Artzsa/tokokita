import { getAdmin } from "@/lib/auth";
import { getSetting, setSetting } from "@/lib/settings";

function isAlive(pid: number) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST() {
  if (!(await getAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [pid, method] = await Promise.all([
    getSetting("bot_pid"),
    getSetting("loginMethod"),
  ]);
  if (!isAlive(Number(pid))) {
    return Response.json({ error: "Bot belum berjalan." }, { status: 400 });
  }
  if (method !== "pairing") {
    return Response.json(
      { error: "Ubah metode login ke Pairing code dulu." },
      { status: 400 },
    );
  }

  await setSetting("bot_pairing_code", "");
  await setSetting("bot_pairing_attempts", "0");
  await setSetting("bot_command", "pairing");

  for (let i = 0; i < 15; i += 1) {
    await wait(1000);
    const code = await getSetting("bot_pairing_code");
    if (code) {
      return Response.json({ ok: true, code });
    }
  }

  return Response.json(
    { error: "Kode pairing tidak muncul. Coba lagi." },
    { status: 408 },
  );
}
