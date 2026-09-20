const MIN_CHORD = 32;

function thin(points, tolerance) {
  if (!Array.isArray(points) || points.length < 2) {
    return Array.isArray(points) ? points.map(copyPoint) : [];
  }

  const src = points.map(copyPoint);
  const tol = Math.max(0, Number(tolerance) || 0);

  const closed =
    src.length >= 3 &&
    src[0].x === src[src.length - 1].x &&
    src[0].y === src[src.length - 1].y;

  const body = closed ? src.slice(0, -1) : src;
  const unique = dedupe(body);

  let chain;
  if (closed) {
    chain = unique.length < 3 ? unique : openRing(unique);
  } else {
    chain = unique;
  }

  if (chain.length < 3) return closeIfNeeded(chain, closed);

  const keep = new Uint8Array(chain.length);
  keep[0] = 1;
  keep[chain.length - 1] = 1;
  markSelfIntersections(chain, closed, keep);
  simplifyRange(chain, 0, chain.length - 1, tol, keep);

  const out = chain.filter((_, i) => keep[i]).map(copyPoint);
  return closeIfNeeded(out, closed);
}

function copyPoint(p) {
  return { x: p.x, y: p.y };
}

function dedupe(points) {
  const out = [];
  for (const p of points) {
    const prev = out[out.length - 1];
    if (!prev || prev.x !== p.x || prev.y !== p.y) out.push(copyPoint(p));
  }
  return out;
}

function openRing(points) {
  let start = 0;
  let maxSpread = -1;
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const next = points[(i + 1) % points.length];
    const spread = Math.hypot(next.x - prev.x, next.y - prev.y);
    if (spread > maxSpread) {
      maxSpread = spread;
      start = i;
    }
  }
  const rotated = [];
  for (let k = 0; k < points.length; k++) {
    rotated.push(points[(start + k) % points.length]);
  }
  return rotated;
}

function simplifyRange(points, first, last, tol, keep) {
  const a = points[first];
  const b = points[last];
  const chord = Math.hypot(b.x - a.x, b.y - a.y);

  let maxDist = -1;
  let index = -1;
  for (let i = first + 1; i < last; i++) {
    const dist = perpendicularDistance(points[i], a, b);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  const collinear = chord >= MIN_CHORD && maxDist <= tol;

  let protectedIndex = -1;
  if (!collinear) {
    for (let i = first + 1; i < last; i++) {
      if (keep[i]) {
        protectedIndex = i;
        break;
      }
    }
  }

  if (collinear) {
    if (protectedIndex === -1) return;
  } else {
    keep[index] = 1;
  }

  const split = collinear ? protectedIndex : index;
  if (split - first > 1) simplifyRange(points, first, split, tol, keep);
  if (last - split > 1) simplifyRange(points, split, last, tol, keep);
}

function perpendicularDistance(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / Math.sqrt(len2);
}

function markSelfIntersections(points, closed, keep) {
  const segments = [];
  const limit = closed ? points.length : points.length - 1;
  for (let i = 0; i < limit; i++) {
    segments.push([i, (i + 1) % points.length]);
  }
  for (let s = 0; s < segments.length; s++) {
    for (let t = s + 1; t < segments.length; t++) {
      const [i, j] = segments[s];
      const [k, l] = segments[t];
      if (i === k || i === l || j === k || j === l) continue;
      const pi = points[i];
      const pj = points[j];
      const pk = points[k];
      const pl = points[l];
      if (segmentsIntersect(pi, pj, pk, pl)) {
        [i, j, k, l].forEach(idx => {
          keep[idx] = 1;
        });
      }
    }
  }
}

function orientation(a, b, c) {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function onSegment(a, b, c) {
  return (
    Math.min(a.x, b.x) <= c.x &&
    c.x <= Math.max(a.x, b.x) &&
    Math.min(a.y, b.y) <= c.y &&
    c.y <= Math.max(a.y, b.y)
  );
}

function segmentsIntersect(p1, p2, p3, p4) {
  const d1 = orientation(p3, p4, p1);
  const d2 = orientation(p3, p4, p2);
  const d3 = orientation(p1, p2, p3);
  const d4 = orientation(p1, p2, p4);
  if (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  ) {
    return true;
  }
  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;
  return false;
}

function closeIfNeeded(points, closed) {
  if (!closed || points.length < 2) return points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first.x !== last.x || first.y !== last.y) {
    points.push(copyPoint(first));
  }
  return points;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { thin };
}
