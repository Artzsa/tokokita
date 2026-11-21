import { prisma } from "../src/lib/db";
import { cancelExpiredPendingOrders } from "../src/lib/order-status";
import { getSetting, setSetting } from "../src/lib/settings";
import { config, maskPhone, refreshConfig } from "./config";
import { getSocket } from "./login";

let processing = false;

async function handleBotCommand() {
  const command = await getSetting("bot_command");
  if (command !== "pairing") return;

  const socket = getSocket();
  if (!socket || config.dryRun) return;

  const attempts = Number(await getSetting("bot_pairing_attempts")) || 0;
  if (attempts >= 10) {
    await setSetting("bot_command", "");
    await setSetting("bot_pairing_attempts", "0");
    return;
  }

  try {
    const code = await socket.requestPairingCode(config.pairNumber);
    await setSetting("bot_pairing_code", code);
    await setSetting("bot_status", "waiting_pair");
    await setSetting("bot_command", "");
    await setSetting("bot_pairing_attempts", "0");
    console.log(`[bot] Kode pairing: ${code}`);
  } catch (error) {
    await setSetting("bot_pairing_attempts", String(attempts + 1));
    const message = error instanceof Error ? error.message : "Gagal minta kode";
    console.error("[bot] Gagal minta kode pairing:", message);
  }
}

export async function processOutbox() {
  if (processing) return;
  processing = true;

  try {
    await refreshConfig();
    await handleBotCommand();
    if (!config.notificationsEnabled) return;

    const pending = await prisma.notificationOutbox.findMany({
      where: { state: "pending", attempts: { lt: config.maxAttempts } },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const socket = getSocket();

    if (!config.dryRun && (!socket || !socket.user)) {
      console.log("[outbox] WhatsApp belum siap, pesan ditahan.");
      return;
    }

    for (const row of pending) {
      try {
        if (!config.dryRun) {
          if (!socket) throw new Error("WhatsApp belum tersambung.");
          const jid = `${row.phone.replace(/\D/g, "")}@s.whatsapp.net`;
          await socket.sendMessage(jid, { text: row.message });
        }
        await prisma.notificationOutbox.update({
          where: { id: row.id },
          data: { state: "sent", sentAt: new Date(), lastError: null },
        });
        console.log(`[outbox] terkirim ke ${maskPhone(row.phone)}`);
      } catch (error) {
        const attempts = row.attempts + 1;
        const message = error instanceof Error ? error.message : "Gagal mengirim";
        await prisma.notificationOutbox.update({
          where: { id: row.id },
          data: {
            attempts,
            state: attempts >= config.maxAttempts ? "failed" : "pending",
            lastError: message.slice(0, 300),
          },
        });
        console.error(`[outbox] gagal ke ${maskPhone(row.phone)}: ${message}`);
      }
    }
  } finally {
    processing = false;
  }
}

export async function sweepExpiredOrders() {
  const count = await cancelExpiredPendingOrders();
  if (count > 0) console.log(`[sweep] ${count} pesanan pending otomatis dibatalkan.`);
}
