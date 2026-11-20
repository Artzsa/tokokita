import { Boom } from "@hapi/boom";
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

export async function connect(): Promise<WASocket | null> {
  if (config.dryRun) {
    console.log("[bot] mode DRY RUN — WhatsApp tidak dihubungkan.");
    return null;
  }

  const { state, saveCreds } = await loadAuthState(config.sessionDir);
  const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu("Toko Kita Bot"),
    printQRInTerminal: config.loginMethod === "qr",
    markOnlineOnConnect: false,
  });
  currentSocket = sock;

  sock.ev.on("creds.update", saveCreds);

  if (
    config.loginMethod === "pairing" &&
    !state.creds.registered &&
    config.pairNumber
  ) {
    try {
      const code = await sock.requestPairingCode(config.pairNumber);
      console.log(`[bot] Kode pairing: ${code}`);
    } catch (error) {
      console.error("[bot] Gagal minta kode pairing:", error);
    }
  }

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) console.log("[bot] Scan QR ini lewat WhatsApp → Perangkat tertaut.");

    if (connection === "open") {
      console.log("[bot] WhatsApp tersambung.");
      return;
    }

    if (connection === "close") {
      const code = (lastDisconnect?.error as Boom | undefined)?.output
        ?.statusCode;
      currentSocket = null;
      if (code === DisconnectReason.loggedOut) {
        console.log("[bot] Sesi logout. Hapus folder session lalu scan lagi.");
        return;
      }
      console.log("[bot] Koneksi putus, menyambung ulang...");
      await connect();
    }
  });

  return sock;
}
