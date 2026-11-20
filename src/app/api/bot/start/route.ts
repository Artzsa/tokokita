import { spawn } from "node:child_process";
import path from "node:path";
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

export async function POST() {
  if (!(await getAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingPid = Number(await getSetting("bot_pid"));
  if (isAlive(existingPid)) {
    return Response.json({ ok: true, pid: existingPid, alreadyRunning: true });
  }

  const cli = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
  const child = spawn(
    process.execPath,
    [cli, "bot/index.ts"],
    {
      cwd: process.cwd(),
      env: process.env,
      detached: true,
      stdio: "ignore",
    },
  );
  child.unref();

  await setSetting("bot_pid", String(child.pid ?? ""));
  await setSetting("bot_status", "starting");
  await setSetting("bot_command", "");

  return Response.json({ ok: true, pid: child.pid ?? null });
}
