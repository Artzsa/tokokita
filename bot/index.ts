import "dotenv/config";
import type { WAMessage } from "@whiskeysockets/baileys";
import { config, maskPhone, normalizePhone } from "./config";
import { answerFaq, helpMessage } from "./faq";
import { connect, getSocket } from "./login";
import { answerOrderLookup } from "./orders";
import { processOutbox, sweepExpiredOrders } from "./outbox";

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

  const sender = jid.split("@")[0];
  if (!config.allowedNumbers.includes(normalizePhone(sender))) return;

  const text = messageText(message).trim();
  if (!text) return;

  const reply =
    (await answerOrderLookup(text, sender)) ?? answerFaq(text) ?? helpMessage();
  await socket.sendMessage(jid, { text: reply }, { quoted: message });
  console.log(`[chat] dibalas ke ${maskPhone(sender)}`);
}

async function main() {
  console.log("[bot] Menjalankan Toko Kita WhatsApp bot...");
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
  const outboxTimer = setInterval(() => {
    processOutbox().catch((error) => console.error("[outbox] error:", error));
  }, config.pollMs);
  const sweepTimer = setInterval(() => {
    sweepExpiredOrders().catch((error) => console.error("[sweep] error:", error));
  }, config.sweepMs);

  console.log(
    `[bot] Siap. Poll outbox tiap ${config.pollMs} ms · whitelist ${config.allowedNumbers.length} nomor · dryRun=${config.dryRun}`,
  );

  process.on("SIGINT", () => {
    clearInterval(outboxTimer);
    clearInterval(sweepTimer);
    console.log("[bot] Berhenti.");
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("[bot] gagal start:", error);
  process.exit(1);
});
