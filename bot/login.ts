import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  useMultiFileAuthState as loadAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import { config } from "./config";

let currentSocket: WASocket | null = null;

export function getSocket() {
  return currentSocket;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestPairingWithRetry(sock: WASocket, number: string) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const code = await sock.requestPairingCode(number);
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
    console.log("[bot] mode DRY RUN — WhatsApp tidak dihubungkan.");
    return null;
  }

  const { state, saveCreds } = await loadAuthState(config.sessionDir);
  const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu("Toko Kita Bot"),
    markOnlineOnConnect: false,
  });
  currentSocket = sock;

  sock.ev.on("creds.update", saveCreds);

  let pairingRequested = false;

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr && config.loginMethod === "qr") {
      try {
        const ascii = await QRCode.toString(qr, { type: "terminal", small: true });
        console.log("\n[bot] Scan QR ini lewat WhatsApp → Perangkat tertaut:\n");
        console.log(ascii);
      } catch (error) {
        console.error("[bot] Gagal membuat QR:", error);
      }
    }

    if (
      connection === "connecting" &&
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
      console.log("[bot] WhatsApp tersambung.");
      return;
    }

    if (connection === "close") {
      const code = (lastDisconnect?.error as Boom | undefined)?.output
        ?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      currentSocket = null;

      if (loggedOut && state.creds.registered) {
        console.log("[bot] Sesi logout. Hapus folder session lalu scan lagi.");
        return;
      }

      const note =
        code === 428 ? "koneksi belum siap" : loggedOut ? "belum selesai pair" : "koneksi putus";
      console.log(`[bot] ${note}, menyambung ulang...`);
      await wait(8000);
      await connect();
    }
  });

  return sock;
}
