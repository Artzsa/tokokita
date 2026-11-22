import { normalizeMessageContent, type WAMessage } from "@whiskeysockets/baileys";

export type SenderIdentity = {
  /** Nomor HP asli pengirim, tanpa `@...`. */
  phone: string;
  /** JID tujuan balasan (bisa `...@lid`). */
  replyJid: string;
  /** Identitas LID kalau ada, untuk log saja. */
  lid: string;
};

export function userFromJid(jid: string | null | undefined) {
  if (!jid) return "";
  return jid.split("@")[0].split(":")[0];
}

/**
 * WhatsApp kini mengirim chat lewat identitas LID (15 digit, `...@lid`).
 * Nomor HP asli dikirim di `senderPn`, jadi whitelist dan balasan harus
 * memakai nomor itu — bukan angka LID-nya.
 */
export function resolveSender(message: WAMessage): SenderIdentity {
  const remoteJid = message.key.remoteJid ?? "";
  const pnJid = message.key.senderPn ?? message.key.participantPn ?? "";
  const lidJid = message.key.senderLid ?? message.key.participantLid ?? "";
  const pnUser = userFromJid(pnJid);
  const lid = userFromJid(lidJid) || (remoteJid.endsWith("@lid") ? userFromJid(remoteJid) : "");

  // Balas ke JID asal chat: Baileys 6.7.x sudah mendukung kirim ke `@lid`,
  // dan sesi Signal untuk LID itu memang sudah tersedia.
  if (pnUser) {
    return { phone: pnUser, replyJid: remoteJid || pnJid, lid };
  }

  return {
    phone: userFromJid(remoteJid),
    replyJid: remoteJid,
    lid,
  };
}

export function messageText(message: WAMessage) {
  const content = normalizeMessageContent(message.message);
  if (!content) return "";
  if ("conversation" in content && content.conversation) {
    return content.conversation;
  }
  if ("extendedTextMessage" in content && content.extendedTextMessage?.text) {
    return content.extendedTextMessage.text;
  }
  return "";
}
