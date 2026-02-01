/**
 * Optional Backend API client for enhanced AI processing
 * Set NEXT_PUBLIC_API_URL to enable (e.g. http://localhost:8000)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function enhanceImage(blob: Blob): Promise<Blob | null> {
  if (!API_URL) return null;
  try {
    const form = new FormData();
    form.append('file', blob, 'image.jpg');
    const res = await fetch(`${API_URL}/api/enhance`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

export async function portraitBlurFromBackend(
  blob: Blob,
  blurStrength = 10
): Promise<Blob | null> {
  if (!API_URL) return null;
  try {
    const form = new FormData();
    form.append('file', blob, 'image.jpg');
    form.append('blur_strength', String(blurStrength));
    const res = await fetch(`${API_URL}/api/portrait-blur`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

export async function detectFacesFromBackend(blob: Blob) {
  if (!API_URL) return [];
  try {
    const form = new FormData();
    form.append('file', blob, 'image.jpg');
    const res = await fetch(`${API_URL}/api/face-detect`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.faces || [];
  } catch {
    return [];
  }
}

export async function detectScene(blob: Blob) {
  if (!API_URL) return null;
  try {
    const form = new FormData();
    form.append('file', blob, 'image.jpg');
    const res = await fetch(`${API_URL}/api/scene-detect`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
