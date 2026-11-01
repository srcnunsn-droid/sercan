// Export/import helpers. In claude.ai the frame blocks <a download>; the `downloads` capability asks the viewer.
import { capability } from './runtime';

export async function saveFile(filename: string, data: string | Blob, mime = 'application/json'): Promise<'saved' | 'declined' | 'fallback'> {
  const dl = await capability<any>('downloads');
  if (dl) {
    try { await dl.save({ filename, data: typeof data === 'string' ? new Blob([data], { type: mime }) : data }); return 'saved'; } catch { return 'declined'; }
  }
  try {
    const url = URL.createObjectURL(typeof data === 'string' ? new Blob([data], { type: mime }) : data);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return 'fallback';
  } catch { return 'declined'; }
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

export function readFileText(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsText(file); });
}
