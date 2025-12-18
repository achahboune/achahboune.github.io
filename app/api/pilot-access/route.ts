import { NextResponse } from "next/server"
import { Resend } from "resend"

export const runtime = "nodejs" // ✅ safe pour libs + emails

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

function json(data: any, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: corsHeaders,
  })
}

function log(label: string, data?: any) {
  console.log(`[PILOT_ACCESS] ${label}`, data ?? "")
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// ✅ évite le 405 quand tu ouvres l’URL dans le navigateur
export function GET() {
  return json({ ok: true, message: "Use POST /api/pilot-access" })
}

export async function POST(req: Request) {
  try {
    log("REQUEST_RECEIVED")

    const body = await req.json().catch(() => ({}))

    // Honeypot anti-bot
    if (body?.website && String(body.website).trim().length > 0) {
      log("HONEYPOT_BLOCKED")
      return json({ ok: true })
    }

    const name = String(body?.name ?? "").trim()
    const company = String(body?.company ?? "").trim()
    const email = String(body?.email ?? "").trim()
    const message = String(body?.message ?? "").trim()

    log("BODY_PARSED", { name: name || "-", company, email, messageLen: message.length })

    if (!company || !email || !message) {
      return json({ error: "Missing fields: company, email, message" }, { status: 400 })
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return json({ error: "Invalid email" }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.PILOT_TO_EMAIL

    // ✅ fallback si ton domaine Resend n’est pas encore vérifié
    const from =
      process.env.PILOT_FROM_EMAIL?.trim() ||
      "onboarding@resend.dev" // <- marche toujours

    if (!apiKey) return json({ error: "Server misconfig: RESEND_API_KEY missing" }, { status: 500 })
    if (!to) return json({ error: "Server misconfig: PILOT_TO_EMAIL missing" }, { status: 500 })

    const resend = new Resend(apiKey)

    // Email admin (toi)
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Pilot request — ${company}`,
      text:
        `Name: ${name || "-"}\n` +
        `Company: ${company}\n` +
        `Email: ${email}\n\n` +
        `Message:\n${message}\n`,
    })

    log("ADMIN_EMAIL_SENT")

    // Confirmation client (optionnel)
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Enthalpy — pilot request received",
        text: `Thanks${name ? " " + name : ""}! We received your request and will reply shortly.\n\n— Enthalpy`,
      })
      log("CONFIRM_EMAIL_SENT")
    } catch (e: any) {
      console.warn("[PILOT_ACCESS] CONFIRMATION_EMAIL_FAILED", e?.message || e)
    }

    return json({ ok: true })
  } catch (err: any) {
    console.error("[PILOT_ACCESS] ERROR", err)

    // Si Resend renvoie domaine non vérifié, on renvoie un message clair
    const msg = String(err?.message || "")
    if (msg.includes("domain") && msg.includes("not verified")) {
      return json(
        { error: "Resend: domain not verified. Verify your domain or set PILOT_FROM_EMAIL=onboarding@resend.dev" },
        { status: 403 }
      )
    }

    return json({ error: err?.message || "Email sending failed" }, { status: 500 })
  }
}
