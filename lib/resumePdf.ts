"use client"

/**
 * ATS-oriented PDF from server-generated resume HTML (print-friendly layout).
 */
export async function downloadResumePdfFromHtml(html: string, filename = "resume.pdf"): Promise<void> {
  if (typeof window === "undefined" || !html?.trim()) return

  const mod: any = await import("html2pdf.js")
  const html2pdf: () => any = mod.default || mod

  const iframe = document.createElement("iframe")
  iframe.setAttribute("title", "resume-print")
  iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:816px;min-height:1056px;border:0;"

  document.body.appendChild(iframe)
  const doc = iframe.contentDocument
  if (!doc) {
    document.body.removeChild(iframe)
    return
  }
  doc.open()
  doc.write(html)
  doc.close()

  const source = doc.body
  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: "jpeg" as const, quality: 0.96 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    pagebreak: { mode: ["css", "legacy"] },
  }

  try {
    await html2pdf().from(source).set(opt).save()
  } finally {
    document.body.removeChild(iframe)
  }
}
