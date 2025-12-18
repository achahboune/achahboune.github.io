import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.email || !body?.company || !body?.message) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    // LOG (temporaire – OK pour Vercel)
    console.log("Pilot request:", body)

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
