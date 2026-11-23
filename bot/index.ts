import "dotenv/config";
import type { WAMessage } from "@whiskeysockets/baileys";
import { config, maskPhone, refreshConfig } from "./config";
// Whitelist pelanggan dinonaktifkan: bot membalas semua nomor.
import { getSettings, setSetting } from "../src/lib/settings";
import { helpMessage } from "./faq";
import { getRules, matchRule } from "../src/lib/rules";
import { messageText, resolveSender } from "./incoming";
import { connect, getSocket, setChatListener, type ChatUpsert } from "./login";
import { answerOrderLookup } from "./orders";
import { processOutbox, sweepExpiredOrders } from "./outbox";

const rateLimits = new Map<string, { count: number; resetAt: number; warned: boolean }>();

function withinRateLimit(sender: string) {
  const now = Date.now();
  const state = rateLimits.get(sender);
  if (!state || state.resetAt <= now) {
    rateLimits.set(sender, { count: 1, resetAt: now + 60_000, warned: false });
    return true;
  }
  if (state.count >= 5) {
    if (!state.warned) {
      state.warned = true;
      return false;
    }
    return false;
  }
  state.count += 1;
  return true;
}

async function handleIncoming(message: WAMessage) {
  const socket = getSocket();
  const jid = message.key.remoteJid;
  const sender = resolveSender(message);
  const text = messageText(message).trim();
  const meta = `jid=${jid || "-"} pn=${sender.phone || "-"} lid=${sender.lid || "-"}`;

  console.log(
    `[chat] masuk: ${meta} fromMe=${message.key.fromMe} text=${JSON.stringify(text).slice(0, 60)}`,
  );

  if (!socket || !jid || message.key.fromMe) {
    console.log(
      `[chat] diabaikan: ${meta} alasan=${!socket ? "socket kosong" : message.key.fromMe ? "fromMe (pesan bot sendiri)" : "jid kosong"}`,
    );
    return;
  }
  if (jid.endsWith("@g.us") || jid === "status@broadcast" || jid.includes("broadcast")) {
    console.log(`[chat] diabaikan: ${meta} alasan=grup/broadcast`);
    return;
  }
  if (!text) {
    console.log(`[chat] diabaikan: ${meta} alasan=pesan bukan teks`);
    return;
  }
  if (!sender.phone) {
    console.log(`[chat] diabaikan: ${meta} alasan=identitas pengirim tidak diketahui`);
    return;
  }

  if (!withinRateLimit(sender.phone)) {
    console.log(`[chat] diabaikan: ${meta} alasan=rate-limit`);
    const state = rateLimits.get(sender.phone);
    if (state?.warned) {
      await socket.sendMessage(
        sender.replyJid,
        { text: "Terlalu banyak pesan dalam waktu singkat. Tunggu sebentar ya." },
        { quoted: message },
      );
    }
    return;
  }

  const rules = await getRules();
  const rule = matchRule(text, rules);
  const settings = await getSettings();
  const reply =
    (await answerOrderLookup(text, sender.phone)) ??
    rule?.answer ??
    (settings.welcomeMessage ? `${settings.welcomeMessage}\n\n${helpMessage()}` : helpMessage());
  const delay = 5000 + Math.floor(Math.random() * 10001);
  try {
    await socket.sendPresenceUpdate("composing", sender.replyJid);
  } catch {
    // presence update opsional
  }
  await new Promise((resolve) => setTimeout(resolve, delay));
  await socket.sendMessage(sender.replyJid, { text: reply }, { quoted: message });
  try {
    await socket.sendPresenceUpdate("paused", sender.replyJid);
  } catch {
    // presence update opsional
  }
  console.log(
    `[chat] dibalas ke ${maskPhone(sender.phone)} lewat ${sender.replyJid} setelah ${delay} ms`,
  );
}

let outboxTimer: NodeJS.Timeout | null = null;
let sweepTimer: NodeJS.Timeout | null = null;

function scheduleOutbox() {
  outboxTimer = setTimeout(async () => {
    try {
      await processOutbox();
    } catch (error) {
      console.error("[outbox] error:", error);
    }
    scheduleOutbox();
  }, config.pollMs);
}

async function handleUpsert({ messages, type }: ChatUpsert) {
  console.log(`[chat] event upsert type=${type} jumlah=${messages.length}`);
  if (type !== "notify") return;
  for (const message of messages) {
    try {
      await handleIncoming(message);
    } catch (error) {
      console.error("[chat] gagal membalas:", error);
    }
  }
}

async function main() {
  console.log("[bot] Menjalankan Toko Kita WhatsApp bot...");
  await refreshConfig();
  await setSetting("bot_pid", String(process.pid));
  await setSetting("bot_status", "starting");
  setChatListener((args) => {
    void handleUpsert(args);
  });
  await connect();

  await sweepExpiredOrders();
  scheduleOutbox();
  sweepTimer = setInterval(() => {
    sweepExpiredOrders().catch((error) => console.error("[sweep] error:", error));
  }, config.sweepMs);

  console.log(
    `[bot] Siap. Poll outbox tiap ${config.pollMs} ms · membalas semua nomor · dryRun=${config.dryRun}`,
  );

  process.on("unhandledRejection", (reason) => {
    console.error("[bot] unhandledRejection:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("[bot] uncaughtException:", error);
  });

  const shutdown = async () => {
    if (outboxTimer) clearTimeout(outboxTimer);
    if (sweepTimer) clearInterval(sweepTimer);
    console.log("[bot] Berhenti.");
    await setSetting("bot_pid", "").catch(() => undefined);
    await setSetting("bot_status", "offline").catch(() => undefined);
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

main().catch((error) => {
  console.error("[bot] gagal start:", error);
  process.exit(1);
});
