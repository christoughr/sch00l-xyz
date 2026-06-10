/** Known browser-extension injection patterns that bypass copy/print blocks. */
const EXTENSION_MARKERS = [
  "chrome-extension://",
  "moz-extension://",
  "safari-extension://",
  "copyfish",
  "allow-copy",
  "enable right click",
  "supercopy",
  "absolute enable right click",
  "print friendly",
  "printwhatyoulike",
  "singlefile",
  "save page we",
  "__copyHelper",
  "__allowPasteExtension",
];

const SUSPICIOUS_GLOBALS = [
  "copyHelper",
  "AllowCopy",
  "EnableRightClick",
  "SuperCopy",
];

export function detectSuspiciousExtension(): string | null {
  if (typeof document === "undefined") return null;

  for (const marker of EXTENSION_MARKERS) {
    const nodes = document.querySelectorAll(
      `script[src*="${marker}"], link[href*="${marker}"], iframe[src*="${marker}"]`
    );
    if (nodes.length > 0) {
      return "A browser extension that copies or prints pages was detected.";
    }
  }

  const html = document.documentElement.outerHTML.slice(0, 500_000).toLowerCase();
  for (const marker of EXTENSION_MARKERS) {
    if (html.includes(marker.toLowerCase())) {
      return "Copy/print extension activity detected in the page.";
    }
  }

  const w = window as unknown as Record<string, unknown>;
  for (const g of SUSPICIOUS_GLOBALS) {
    if (g in w) {
      return `Extension hook "${g}" detected.`;
    }
  }

  return null;
}
