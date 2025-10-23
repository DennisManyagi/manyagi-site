export const toArrayTags = (s) =>
  Array.from(
    new Set(
      String(s || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );

export const safeJSON = (s, fallback = {}) => {
  try {
    if (!s) return fallback;
    if (typeof s === 'object') return s;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

export const copyText = async (txt) => {
  try {
    await navigator.clipboard.writeText(txt);
    alert('Copied!');
  } catch {
    // ignore
  }
};
