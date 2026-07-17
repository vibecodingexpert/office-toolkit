const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || ""

export function isPythonBackendAvailable(): boolean {
  return !!PYTHON_BACKEND_URL
}

export function getPythonBackendUrl(): string {
  return PYTHON_BACKEND_URL
}

export async function callPythonBackend(
  endpoint: string,
  formData: FormData,
  signal?: AbortSignal,
): Promise<Response> {
  const url = `${PYTHON_BACKEND_URL}${endpoint}`
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    signal,
  })
  return res
}

export async function checkPythonBackendHealth(): Promise<boolean> {
  if (!PYTHON_BACKEND_URL) return false
  try {
    const res = await fetch(`${PYTHON_BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}
