// PDF magic bytes: %PDF  (0x25 0x50 0x44 0x46)
const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46])

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

/**
 * Validates a file is a genuine PDF by checking:
 *  1. MIME type reported by the browser
 *  2. File size
 *  3. Actual magic bytes at the start of the binary
 *
 * Note: this is a client-side defence-in-depth measure.
 * The server must perform its own independent validation.
 */
export async function validatePdf(file) {
  if (file.type !== 'application/pdf') {
    return { ok: false, error: `"${safeLabel(file.name)}" is not a PDF file. Only PDF documents are accepted.` }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: `"${safeLabel(file.name)}" exceeds the 10 MB size limit.` }
  }

  if (file.size < 5) {
    return { ok: false, error: `"${safeLabel(file.name)}" is too small to be a valid PDF.` }
  }

  const buffer = await file.slice(0, 4).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const hasMagic = PDF_MAGIC.every((b, i) => bytes[i] === b)

  if (!hasMagic) {
    return {
      ok: false,
      error: `"${safeLabel(file.name)}" does not appear to be a valid PDF. The file may be corrupted or its extension may have been changed.`,
    }
  }

  return { ok: true, error: null }
}

export function fmtSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// Truncates and strips special characters so filenames are safe to show in UI strings.
// React JSX already escapes values, but this keeps error message text clean.
function safeLabel(name) {
  return String(name).replace(/[<>&"']/g, '').slice(0, 60)
}
