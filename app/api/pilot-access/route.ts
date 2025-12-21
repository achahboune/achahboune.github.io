import { NextResponse } from "next/server"
import { Resend } from "resend"

export const runtime = "nodejs"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

type PilotBody = {
  name?: string
  company?: string
  email?: string
  message?: string
  website?: string // honeypot
}

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PilotBody

    // honeypot anti-spam (si rempli => on "fait semblant" que c'est OK)
    if (body.website && String(body.website).trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders })
    }

    const name = String(body.name || "").trim()
    const company = String(body.company || "").trim()
    const email = String(body.email || "").trim()
    const message = String(body.message || "").trim()

    if (!company) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400, headers: corsHeaders })
    }
    if (!email) {
      return NextResponse.json({ error: "Work email is required." }, { status: 400, headers: corsHeaders })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400, headers: corsHeaders })
    }
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400, headers: corsHeaders })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error("Missing RESEND_API_KEY in env")

    const resend = new Resend(apiKey)

    const toInternal = process.env.PILOT_TO_EMAIL || "contact@enthalpy.site"
    // IMPORTANT: mets ici un sender vérifié dans Resend (ou laisse celui-ci pour tester)
    const from = process.env.PILOT_FROM_EMAIL || "Enthalpy <onboarding@resend.dev>"

    const subject = `Pilot access request — ${company}`
    const text = `New pilot access request

Name: ${name || "-"}
Company: ${company}
Email: ${email}

Message:
${message}
`

    // email interne
    await resend.emails.send({
      from,
      to: [toInternal],
      replyTo: email,
      subject,
      text,
    })

    // email de confirmation (optionnel)
    try {
      await resend.emails.send({
        from,
        to: [email],
        subject: "Enthalpy — Pilot access request received",
        text: `Thanks! We received your request.

Company: ${company}
Message: ${message}

We’ll get back to you shortly.`,
      })
    } catch (e) {
      console.warn("CONFIRMATION_EMAIL_FAILED", e)
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders })
  } catch (err: any) {
    console.error("PILOT_ACCESS_ERROR", err)
    return NextResponse.json(
      { error: err?.message || "Email sending failed" },
      { status: 500, headers: corsHeaders }
    )
  }
}
