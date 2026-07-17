import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Remove.bg API key not configured" }, { status: 500 })
    }

    const apiForm = new FormData()
    apiForm.append("image_file", file, file.name)
    apiForm.append("size", "auto")

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: apiForm,
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Remove.bg API error: ${res.status} - ${text}` }, { status: res.status })
    }

    const blob = await res.blob()
    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^.]+$/, "")}_no_bg.png"`,
        "Content-Length": blob.size.toString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Background removal failed" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const maxDuration = 30
