import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      company,
      name,
      email,
      phone,
      industry,
      message,
    } = body

    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: Number(process.env.ZOHO_SMTP_PORT),
      secure: false, // TLS
      auth: {
        user: process.env.ZOHO_SMTP_USER,
        pass: process.env.ZOHO_SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.PILOT_FROM_EMAIL,
      to: process.env.PILOT_TO_EMAIL,
      subject: "🚀 New Enthalpy Pilot Access Request",
      html: `
        <h2>New Pilot Request</h2>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Industry:</strong> ${industry}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Pilot request error:", error)
    return NextResponse.json(
      { success: false, error: "Email sending failed" },
      { status: 500 }
    )
  }
}
