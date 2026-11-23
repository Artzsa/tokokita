import { Boom } from "@hapi/boom";
import { rm } from "node:fs/promises";
import QRCode from "qrcode";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState as loadAuthState,
  type MessageUpsertType,
  type WAMessage,
  type WASocket,
} from "@whiskeysockets/baileys";
import { setSetting } from "../src/lib/settings";
import { config } from "./config";

export type ChatUpsert = { messages: WAMessage[]; type: MessageUpsertType };

let currentSocket: WASocket | null = null;
let reconnectCount = 0;
let chatListener: ((args: ChatUpsert) => void) | null = null;

export function getSocket() {
  return currentSocket;
}

/**
 * Didaftarkan sekali dari index.ts. Setiap socket baru (termasuk setelah
 * reconnect) memasang listener ini lagi, supaya bot tidak "connected tapi diam".
 */
export function setChatListener(listener: (args: ChatUpsert) => void) {
  chatListener = listener;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWhatsAppVersion(): Promise<[number, number, number]> {
  try {
    const { version } = await fetchLatestBaileysVersion();
    if (version) return version;
  } catch {
    // pakai fallback di bawah
  }
  return [2, 3000, 1033893291];
}

async function requestPairingWithRetry(sock: WASocket, number: string) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const code = await sock.requestPairingCode(number);
      await setSetting("bot_pairing_code", code);
      await setSetting("bot_status", "waiting_pair");
      await setSetting("bot_command", "");
      console.log(`[bot] Kode pairing: ${code}`);
      return;
    } catch (error) {
      const status = (error as Boom | undefined)?.output?.statusCode;
      if (attempt === 5) {
        console.error(
          `[bot] Gagal minta kode pairing (status ${status ?? "unknown"}):`,
          error,
        );
        return;
      }
      await wait(1000);
    }
  }
}

export async function connect(): Promise<WASocket | null> {
  if (config.dryRun) {
    console.log("[bot] mode DRY RUN: WhatsApp tidak dihubungkan.");
    return null;
  }

  const { state, saveCreds } = await loadAuthState(config.sessionDir);
  const version = await getWhatsAppVersion();
  const ownLidUser = state.creds.me?.lid?.split(":")[0].split("@")[0] ?? "";
  const sock = makeWASocket({
    auth: state,
    version,
    browser: Browsers.ubuntu("Toko Kita Bot"),
    markOnlineOnConnect: false,
    /**
     * Pesan dari LID bot sendiri (chat "message yourself") tidak bisa
     * didekripsi dan memicu retry receipt terus-menerus. Abaikan sebelum
     * dekripsi supaya log tidak banjir dan koneksi tidak sibuk.
     */
    shouldIgnoreJid: (jid) => {
      if (!ownLidUser) return false;
      return (
        jid === `${ownLidUser}@lid` ||
        jid === `${ownLidUser}@s.whatsapp.net`
      );
    },
  });
  currentSocket = sock;

  sock.ev.on("messages.upsert", (args) => {
    chatListener?.(args);
  });

  sock.ev.on("creds.update", saveCreds);

  let pairingRequested = false;

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    try {
    if (qr && config.loginMethod === "qr") {
      await setSetting("bot_qr", qr);
      await setSetting("bot_status", "waiting_scan");
      try {
        const ascii = await QRCode.toString(qr, { type: "terminal", small: true });
        console.log("\n[bot] Scan QR ini lewat WhatsApp → Perangkat tertaut:\n");
        console.log(ascii);
      } catch (error) {
        console.error("[bot] Gagal membuat QR:", error);
      }
    }

    if (
      qr &&
      config.loginMethod === "pairing" &&
      !state.creds.registered &&
      config.pairNumber &&
      !pairingRequested
    ) {
      pairingRequested = true;
      await requestPairingWithRetry(sock, config.pairNumber);
      return;
    }

    if (connection === "open") {
      reconnectCount = 0;
      await setSetting("bot_status", "connected");
      await setSetting("bot_qr", "");
      await setSetting("bot_pairing_code", "");
      console.log("[bot] WhatsApp tersambung.");
      return;
    }

    if (connection === "close") {
      const code = (lastDisconnect?.error as Boom | undefined)?.output
        ?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      currentSocket = null;
      await setSetting("bot_status", "disconnected");
      await setSetting("bot_qr", "");

      if (reconnectCount >= 5) {
        console.log("[bot] Reconnect gagal berulang. Butuh tindakan manual.");
        await setSetting("bot_status", "offline");
        return;
      }
      reconnectCount += 1;

      if (loggedOut) {
        console.log("[bot] Sesi terputus/terlepas. Menghapus sesi lama lalu membuat QR baru...");
        await rm(config.sessionDir, { recursive: true, force: true }).catch(() => null);
        await setSetting("bot_status", "reconnecting");
        await wait(2000);
        await connect();
        return;
      }

      const note = code === 428 ? "koneksi belum siap" : "koneksi putus";
      console.log(`[bot] ${note}, menyambung ulang...`);
      await wait(8000);
      await connect();
    }
    } catch (error) {
      console.error("[bot] connection.update error:", error);
    }
  });

  return sock;
}
