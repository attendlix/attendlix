/**
 * ATTENDLIX Centralized WhatsApp Fallback Service
 * Supports:
 * 1. Zero-Cost Mode: Generates universal wa.me pre-filled deep links for 1-click dispatch.
 * 2. Webhook-Ready Mode: Emits structured payloads ready for Twilio / Meta WhatsApp Cloud API.
 */

export interface AbsentAlertParams {
  studentName: string;
  parentPhone: string;
  schoolName: string;
  date?: string;
  rollNo?: string;
  className?: string;
}

export interface FeeReminderParams {
  studentName: string;
  parentPhone: string;
  schoolName: string;
  month: string;
  amount: number;
  paymentPhone?: string;
}

export interface AnnouncementBroadcastParams {
  title: string;
  content: string;
  schoolName: string;
  recipientPhone?: string;
  audience?: string;
  priority?: "NORMAL" | "IMPORTANT" | "URGENT";
}

export interface CredentialsNoticeParams {
  name: string;
  identifier: string;
  password: string;
  role: string;
  schoolName: string;
  phone: string;
}

/**
 * Normalizes any Pakistani phone number format (e.g. 0300-1234567, 03211234567, +923001234567)
 * into WhatsApp standard format without leading zeros or plus signs (e.g. 923001234567).
 */
export function normalizePakistaniPhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("03")) {
    digits = "92" + digits.substring(1);
  } else if (digits.startsWith("3") && digits.length === 10) {
    digits = "92" + digits;
  }
  return digits;
}

// --------------------------------------------------------------------------
// 1. ZERO-COST MODE (wa.me Deep Links for 1-Click WhatsApp Opening)
// --------------------------------------------------------------------------

export function getAbsentAlertWhatsAppUrl(params: AbsentAlertParams): string {
  const phone = normalizePakistaniPhone(params.parentPhone);
  const dateStr = params.date || new Date().toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  
  const text = `Assalam-o-Alaikum,\n\nMohtaram Parent, aapka bacha *${params.studentName}* ${params.rollNo ? `(Roll #${params.rollNo})` : ""} aaj *${dateStr}* ko *${params.schoolName}* se GHAYR-HAZIR (ABSENT) mark hua hai.\n\nAgar koi pareshani ya waja hai to school idara ko muttala farmayein.\n\nShukriya,\n*${params.schoolName}*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function getFeeReminderWhatsAppUrl(params: FeeReminderParams): string {
  const phone = normalizePakistaniPhone(params.parentPhone);
  const formattedAmount = params.amount.toLocaleString();

  const text = `Assalam-o-Alaikum,\n\nMohtaram Parent of *${params.studentName}*,\n*${params.schoolName}* ki taraf se ittila hai ke *${params.month} 2026* ki fee *Rs. ${formattedAmount}* abhi tak pending hai.\n\nBaraye meharbani fee jald az jald school counter par ya online ada karein:\n📱 JazzCash / Easypaisa: *${params.paymentPhone || "0300-4567890"}*\n\nShukriya,\n*${params.schoolName} Accounts Desk*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function getAnnouncementWhatsAppUrl(params: AnnouncementBroadcastParams): string {
  const phone = params.recipientPhone ? normalizePakistaniPhone(params.recipientPhone) : "";

  const header = params.priority === "URGENT"
    ? `🚨 *URGENT NOTICE — ${params.schoolName}*`
    : params.priority === "IMPORTANT"
    ? `⚠️ *IMPORTANT UPDATE — ${params.schoolName}*`
    : `📢 *OFFICIAL NOTICE — ${params.schoolName}*`;

  const urgentPrefix = params.priority === "URGENT" ? "🚨 *URGENT NOTICE:* " : "";

  const text = `${header}\n\n*${urgentPrefix}${params.title}*\n\n${params.content}\n\nTamam parents aur staff baraye meharbani note farmayein.\n\nShukriya,\n*Principal / Administration*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function getCredentialsNoticeWhatsAppUrl(params: CredentialsNoticeParams): string {
  const phone = normalizePakistaniPhone(params.phone);

  const text = `Assalam-o-Alaikum *${params.name}*,\n\nAapka *${params.schoolName}* Attendlix portal account tayar hai.\n\n🔗 Login Link: https://attendlix.vercel.app/login\n👤 User ID: *${params.identifier}*\n🔑 Password: *${params.password}*\n💼 Role: *${params.role}*\n\nShukriya,\n*${params.schoolName}*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// --------------------------------------------------------------------------
// 2. WEBHOOK-READY MODE (Meta WhatsApp Cloud API / Twilio Payload Dispatch)
// --------------------------------------------------------------------------

export interface WhatsAppPayload {
  to: string;
  type: "template" | "text";
  templateName?: string;
  parameters: Record<string, any>;
  timestamp: string;
}

export async function dispatchWhatsAppWebhook(
  type: "ABSENT_ALERT" | "FEE_REMINDER" | "ANNOUNCEMENT",
  recipientPhone: string,
  parameters: Record<string, any>
): Promise<{ success: boolean; messageId: string; mode: "simulated" | "webhook" }> {
  const normalizedTo = normalizePakistaniPhone(recipientPhone);

  const payload: WhatsAppPayload = {
    to: normalizedTo,
    type: "template",
    templateName: type.toLowerCase(),
    parameters,
    timestamp: new Date().toISOString(),
  };

  // Check if an external WhatsApp gateway webhook URL is configured
  const webhookUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL : undefined;

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return { success: true, messageId: data.id || `wa_${Date.now()}`, mode: "webhook" };
    } catch (err) {
      console.warn("WhatsApp Webhook Dispatch error, falling back to simulated:", err);
    }
  }

  // Fallback simulation (reliable zero-cost local logging)
  console.log("[WhatsApp Engine Broadcast]:", payload);
  return {
    success: true,
    messageId: `sim_wa_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    mode: "simulated",
  };
}
