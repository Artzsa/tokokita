import "dotenv/config";
import type { WAMessage } from "@whiskeysockets/baileys";
import { config, maskPhone, refreshConfig } from "./config";
import { getSettings } from "../src/lib/settings";
import { isKnownCustomer } from "./customers";
import { helpMessage } from "./faq";
import { getRules, matchRule } from "../src/lib/rules";
import { connect, getSocket } from "./login";
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

function messageText(message: WAMessage) {
  const content = message.message;
  if (!content) return "";
  if ("conversation" in content && content.conversation) {
    return content.conversation;
  }
  if ("extendedTextMessage" in content && content.extendedTextMessage?.text) {
    return content.extendedTextMessage.text;
  }
  return "";
}

async function handleIncoming(message: WAMessage) {
  const socket = getSocket();
  const jid = message.key.remoteJid;
  if (!socket || !jid || message.key.fromMe) return;
  if (jid.endsWith("@g.us") || jid === "status@broadcast") return;
  if (jid.includes("broadcast")) return;

  const sender = jid.split("@")[0].split(":")[0];

  const text = messageText(message).trim();
  if (!text) return;

  if (!(await isKnownCustomer(sender))) return;

  if (!withinRateLimit(sender)) {
    const state = rateLimits.get(sender);
    if (state?.warned) {
      await socket.sendMessage(
        jid,
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
    (await answerOrderLookup(text, sender)) ??
    rule?.answer ??
    (settings.welcomeMessage ? `${settings.welcomeMessage}\n\n${helpMessage()}` : helpMessage());
  const delay = 5000 + Math.floor(Math.random() * 10001);
  try {
    await socket.sendPresenceUpdate("composing", jid);
  } catch {
    // presence update opsional
  }
  await new Promise((resolve) => setTimeout(resolve, delay));
  await socket.sendMessage(jid, { text: reply }, { quoted: message });
  try {
    await socket.sendPresenceUpdate("paused", jid);
  } catch {
    // presence update opsional
  }
  console.log(`[chat] dibalas ke ${maskPhone(sender)} setelah ${delay} ms`);
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

async function main() {
  console.log("[bot] Menjalankan Toko Kita WhatsApp bot...");
  await refreshConfig();
  const socket = await connect();

  socket?.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const message of messages) {
      try {
        await handleIncoming(message);
      } catch (error) {
        console.error("[chat] gagal membalas:", error);
      }
    }
  });

  await sweepExpiredOrders();
  scheduleOutbox();
  sweepTimer = setInterval(() => {
    sweepExpiredOrders().catch((error) => console.error("[sweep] error:", error));
  }, config.sweepMs);

  console.log(
    `[bot] Siap. Poll outbox tiap ${config.pollMs} ms · whitelist ${config.allowedNumbers.length} nomor · dryRun=${config.dryRun}`,
  );

  process.on("unhandledRejection", (reason) => {
  console.error("[bot] unhandledRejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[bot] uncaughtException:", error);
});

process.on("SIGINT", () => {
    if (outboxTimer) clearTimeout(outboxTimer);
    if (sweepTimer) clearInterval(sweepTimer);
    console.log("[bot] Berhenti.");
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("[bot] gagal start:", error);
  process.exit(1);
});
