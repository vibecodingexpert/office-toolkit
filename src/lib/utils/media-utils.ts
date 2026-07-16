import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

let ffmpeg: FFmpeg | null = null
let loaded = false

export async function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg()
    ffmpeg.on("log", ({ message }) => {
      if (message.includes("Error")) console.error("FFmpeg:", message)
    })
  }
  if (!loaded) {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    })
    loaded = true
  }
  return ffmpeg
}

export async function trimVideo(file: File, start: number, duration: number): Promise<Blob> {
  const ff = await getFFmpeg()
  const input = "input" + getExt(file.name)
  const output = "output" + getExt(file.name)
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec([
    "-i", input,
    "-ss", String(start),
    "-t", String(duration),
    "-c", "copy",
    output,
  ])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: file.type })
}

export async function mergeVideos(files: File[]): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(files[0].name)
  const listFile = "files.txt"
  const inputNames: string[] = []
  for (let i = 0; i < files.length; i++) {
    const name = `input${i}${ext}`
    await ff.writeFile(name, await fetchFile(files[i]))
    inputNames.push(name)
  }
  const content = inputNames.map((n) => `file '${n}'`).join("\n")
  await ff.writeFile(listFile, new TextEncoder().encode(content))
  const output = `merged${ext}`
  await ff.exec(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", output])
  const data = await ff.readFile(output)
  for (const n of [...inputNames, listFile, output]) {
    try { await ff.deleteFile(n) } catch {}
  }
  return new Blob([data as BlobPart], { type: files[0].type })
}

export async function extractAudioFromVideo(file: File): Promise<Blob> {
  const ff = await getFFmpeg()
  const input = "input" + getExt(file.name)
  const output = "output.mp3"
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec(["-i", input, "-vn", "-acodec", "libmp3lame", output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: "audio/mpeg" })
}

export async function muteVideo(file: File): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = "muted" + ext
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec(["-i", input, "-an", "-c:v", "copy", output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: file.type })
}

export async function videoToGif(file: File, start: number, duration: number): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = "output.gif"
  await ff.writeFile(input, await fetchFile(file))
  const fps = 10
  await ff.exec([
    "-i", input,
    "-ss", String(start),
    "-t", String(duration),
    "-vf", `fps=${fps},scale=480:-1:flags=lanczos`,
    "-loop", "0",
    output,
  ])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: "image/gif" })
}

export async function gifToMp4(file: File): Promise<Blob> {
  const ff = await getFFmpeg()
  const input = "input.gif"
  const output = "output.mp4"
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec(["-i", input, "-movflags", "faststart", "-pix_fmt", "yuv420p", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: "video/mp4" })
}

export async function addWatermarkToVideo(file: File, watermarkText: string): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = "watermarked" + ext
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec([
    "-i", input,
    "-vf", `drawtext=text='${watermarkText.replace(/'/g, "\\'")}':fontsize=24:fontcolor=white@0.5:x=10:y=10`,
    "-codec:a", "copy",
    output,
  ])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: file.type })
}

export async function compressVideo(file: File): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = "compressed" + ext
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec(["-i", input, "-vcodec", "libx264", "-crf", "28", "-preset", "fast", output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: file.type })
}

export async function resizeVideo(file: File, width: number): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = "resized" + ext
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec(["-i", input, "-vf", `scale=${width}:-2`, "-c:a", "copy", output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: file.type })
}

export async function rotateVideo(file: File, rotation: "90" | "180" | "270"): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = "rotated" + ext
  await ff.writeFile(input, await fetchFile(file))
  const transpose = { "90": "1", "180": "2,transpose=2", "270": "2" }[rotation]
  await ff.exec(["-i", input, "-vf", `transpose=${transpose}`, "-c:a", "copy", output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: file.type })
}

export async function convertAudio(file: File, format: "mp3" | "wav" | "ogg" | "aac"): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = `output.${format}`
  await ff.writeFile(input, await fetchFile(file))
  const codec = format === "mp3" ? "libmp3lame" : format === "aac" ? "aac" : format === "ogg" ? "libvorbis" : "pcm_s16le"
  await ff.exec(["-i", input, "-acodec", codec, output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  const mimeTypes: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    aac: "audio/aac",
  }
  return new Blob([data as BlobPart], { type: mimeTypes[format] || "audio/mpeg" })
}

export async function mergeAudio(files: File[]): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(files[0].name)
  const listFile = "audio_files.txt"
  const inputNames: string[] = []
  for (let i = 0; i < files.length; i++) {
    const name = `audio${i}${ext}`
    await ff.writeFile(name, await fetchFile(files[i]))
    inputNames.push(name)
  }
  const content = inputNames.map((n) => `file '${n}'`).join("\n")
  await ff.writeFile(listFile, new TextEncoder().encode(content))
  const output = `merged${ext}`
  await ff.exec(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", output])
  const data = await ff.readFile(output)
  for (const n of [...inputNames, listFile, output]) {
    try { await ff.deleteFile(n) } catch {}
  }
  return new Blob([data as BlobPart], { type: files[0].type })
}

export async function cutAudio(file: File, start: number, duration: number): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = "cut" + ext
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec(["-i", input, "-ss", String(start), "-t", String(duration), "-c", "copy", output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: file.type })
}

export async function changeVolume(file: File, volume: number): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = "volume" + ext
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec(["-i", input, "-af", `volume=${volume}`, "-c:v", "copy", output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: file.type })
}

export async function removeNoise(file: File): Promise<Blob> {
  const ff = await getFFmpeg()
  const ext = getExt(file.name)
  const input = "input" + ext
  const output = "denoised" + ext
  await ff.writeFile(input, await fetchFile(file))
  await ff.exec(["-i", input, "-af", "afftdn=nf=-25", "-c:v", "copy", output])
  const data = await ff.readFile(output)
  await ff.deleteFile(input)
  await ff.deleteFile(output)
  return new Blob([data as BlobPart], { type: file.type })
}

function getExt(name: string): string {
  const ext = name.split(".").pop()
  return ext ? `.${ext}` : ".mp4"
}
