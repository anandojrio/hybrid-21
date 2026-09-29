export interface OutputFile {
  name: string
  type: string
  content: string
}

/**
 * Hands files to the user. On iPhone the share sheet is used ("Save to Files", AirDrop,
 * Mail); elsewhere a normal download. Returns false only when the user cancelled sharing.
 */
export async function saveFiles(files: OutputFile[]): Promise<boolean> {
  const blobs = files.map((f) => new File([f.content], f.name, { type: f.type }))
  const nav = globalThis.navigator as Navigator | undefined
  if (nav?.canShare?.({ files: blobs }) && isTouchDevice()) {
    try {
      await nav.share({ files: blobs })
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return false
      // Share failed for another reason; fall back to downloading.
    }
  }
  for (const file of blobs) download(file)
  return true
}

function isTouchDevice(): boolean {
  return globalThis.matchMedia?.('(pointer: coarse)').matches ?? false
}

function download(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
