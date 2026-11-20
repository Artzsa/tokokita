import { prisma } from "../src/lib/db";
import { cancelExpiredPendingOrders } from "../src/lib/order-status";
import { config, maskPhone, refreshConfig } from "./config";
import { getSocket } from "./login";

let processing = false;

export async function processOutbox() {
  if (processing) return;
  processing = true;

  try {
    await refreshConfig();
    if (!config.notificationsEnabled) return;

    const pending = await prisma.notificationOutbox.findMany({
      where: { state: "pending", attempts: { lt: config.maxAttempts } },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const socket = getSocket();

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
