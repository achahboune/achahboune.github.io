import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const name = (body?.name ?? "").toString().trim()
    const company = (body?.company ?? "").toString().trim()
    const email = (body?.email ?? "").toString().trim()
    const message = (body?.message ?? "").toString().trim()

    if (!company || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const TO = process.env.PILOT_TO_EMAIL || "contact@enthalpy.site"
    const FROM = process.env.PILOT_FROM_EMAIL || "onboarding@resend.dev"

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 })
    }

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.5">
        <h2>New pilot access request</h2>
        <p><b>Name:</b> ${escapeHtml(name || "-")}</p>
        <p><b>Company:</b> ${escapeHtml(company)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      </div>
    `

    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `Pilot access request — ${company}`,
        reply_to: email,
        html,
      }),
    })

    if (!send.ok) {
      const errText = await send.text().catch(() => "")
      console.log("RESEND_ERROR_STATUS:", send.status)
      console.log("RESEND_ERROR_BODY:", errText)
      return NextResponse.json(
        { error: "Email sending failed", details: errText },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    console.log("API_ERROR:", e?.message || e)
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
