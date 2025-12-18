import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    // Honeypot anti-bot
    if (body?.website && String(body.website).trim().length > 0) {
      return NextResponse.json({ ok: true })
    }

    const name = String(body?.name || "").trim()
    const company = String(body?.company || "").trim()
    const email = String(body?.email || "").trim()
    const message = String(body?.message || "").trim()

    if (!company) return NextResponse.json({ error: "Company is required" }, { status: 400 })
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 })

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const PILOT_TO_EMAIL = process.env.PILOT_TO_EMAIL || "contact@enthalpy.site"
    const PILOT_FROM_EMAIL = process.env.PILOT_FROM_EMAIL || "Enthalpy <onboarding@resend.dev>"

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 })
    }

    const subject = `Pilot access request — ${company}`
    const html = `
      <div style="font-family: Inter, system-ui, Arial; line-height:1.5">
        <h2 style="margin:0 0 10px 0;">New pilot request</h2>
        <p><b>Name:</b> ${escapeHtml(name || "-")}</p>
        <p><b>Company:</b> ${escapeHtml(company)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      </div>
    `

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: PILOT_FROM_EMAIL,
        to: [PILOT_TO_EMAIL],
        reply_to: email, // utile même si from = resend.dev
        subject,
        html,
      }),
    })

    const data = await r.json().catch(() => ({}))

    if (!r.ok) {
      // Renvoie l’erreur exacte à ton UI (tu la verras)
      return NextResponse.json(
        { error: data?.message || "Email sending failed", resend: data },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
