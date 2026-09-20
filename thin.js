function thin(points, tolerance, zoom) {
  const tol = tolerance * (zoom || 1);
  const src = points;
  if (src.length < 2) return [];
  const first = src[0];
  const last = src[src.length - 1];
  const closed = first.x === last.x && first.y === last.y;
  const body = closed ? src.slice(0, -1) : src.slice();
  const out = [];
  for (let i = 1; i < body.length - 1; i++) {
    const a = body[i - 1];
    const b = body[i];
    const c = body[i + 1];
    if (b.x === a.x && b.y === a.y) {
      out.push(b);
      continue;
    }
    const area = Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
    const len = Math.hypot(c.x - a.x, c.y - a.y);
    if (len < 48 && area <= tol * 6) continue;
    out.push(b);
  }
  return out;
}
if (typeof module !== "undefined") module.exports = { thin };
