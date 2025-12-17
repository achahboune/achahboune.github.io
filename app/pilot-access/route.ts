import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, company, email, message } = body

    if (!company || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: process.env.PILOT_FROM_EMAIL!,
      to: [process.env.PILOT_TO_EMAIL!],
      subject: `New pilot request – ${company}`,
      replyTo: email,
      html: `
        <h2>New Pilot Access Request</h2>
        <p><b>Name:</b> ${name || "-"}</p>
        <p><b>Company:</b> ${company}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Pilot access error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
