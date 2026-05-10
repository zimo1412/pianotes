/** True for CJK unified ideographs and related punctuation commonly paired with 汉字. */
export function isCjkCodePoint(cp) {
  if (cp >= 0x4e00 && cp <= 0x9fff) return true;
  if (cp >= 0x3400 && cp <= 0x4dbf) return true;
  if (cp >= 0xf900 && cp <= 0xfaff) return true;
  if (cp >= 0x3040 && cp <= 0x309f) return true;
  if (cp >= 0x30a0 && cp <= 0x30ff) return true;
  if (cp >= 0x3000 && cp <= 0x303f) return true;
  if (cp >= 0xff00 && cp <= 0xffef) return true;
  return false;
}

export function isCjkChar(ch) {
  const cp = ch.codePointAt(0);
  return cp !== undefined && isCjkCodePoint(cp);
}

/**
 * Split a string into alternating Latin/other vs CJK runs for per-script font sizing.
 */
export function segmentMixedScript(str) {
  if (str == null || str === '') return [];
  const segments = [];
  let buf = '';
  let cur = null;
  for (const ch of str) {
    const t = isCjkChar(ch) ? 'cjk' : 'lat';
    if (cur !== null && t !== cur && buf !== '') {
      segments.push({ type: cur, text: buf });
      buf = '';
    }
    cur = t;
    buf += ch;
  }
  if (buf !== '') segments.push({ type: cur, text: buf });
  return segments;
}
