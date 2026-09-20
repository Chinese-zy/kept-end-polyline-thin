function thin(points, tolerance) {
  const src = points || [];
  // 起手先快照一份：算到一半原数组/原点被改掉，也按这份算完。
  const snap = src.map(p => ({ x: p.x, y: p.y }));
  if (snap.length < 2) return snap;

  const first = snap[0];
  const last = snap[snap.length - 1];
  const closed = first.x === last.x && first.y === last.y;
  const body0 = closed ? snap.slice(0, -1) : snap.slice();

  // 折叠叠在一起的重复点（环在首尾接缝处也算相邻）。
  const body = [];
  const anchors = new Set();
  for (let i = 0; i < body0.length; i++) {
    const p = body0[i];
    const q = body[(body.length - 1 + body.length) % body.length];
    if (body.length && q.x === p.x && q.y === p.y) {
      // 被重复点挤掉了：留一个副本作为锚点，重复点本身只留一个。
      anchors.add(body.length - 1);
      continue;
    }
    body.push(p);
  }
  if (closed && body.length > 1) {
    const head = body[0];
    const tail = body[body.length - 1];
    if (head.x === tail.x && head.y === tail.y) body.pop();
  }

  if (body.length < 3) {
    const out = body.map(p => ({ x: p.x, y: p.y }));
    if (closed) out.push({ x: out[0].x, y: out[0].y });
    return out;
  }

  // 固定容差的 Douglas–Peucker，与画面缩放（zoom）无关；顺序不倒置。
  const tol = Math.max(0, tolerance || 0);
  const kept = new Set(anchors);
  kept.add(0);
  kept.add(body.length - 1);
  const stack = [[0, body.length - 1]];
  while (stack.length) {
    const [lo, hi] = stack.pop();
    const a = body[lo];
    const c = body[hi];
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    const segLen2 = dx * dx + dy * dy;
    let maxD2 = -1;
    let maxIdx = -1;
    for (let i = lo + 1; i < hi; i++) {
      const p = body[i];
      let d2;
      if (segLen2 === 0) {
        const ex = p.x - a.x;
        const ey = p.y - a.y;
        d2 = ex * ex + ey * ey;
      } else {
        const cross = (p.x - a.x) * dy - dx * (p.y - a.y);
        d2 = (cross * cross) / segLen2;
      }
      if (d2 > maxD2) {
        maxD2 = d2;
        maxIdx = i;
      }
    }
    if (maxIdx >= 0 && maxD2 > tol * tol) {
      kept.add(maxIdx);
      stack.push([lo, maxIdx]);
      stack.push([maxIdx, hi]);
    }
  }

  const out = [];
  for (let i = 0; i < body.length; i++) {
    if (kept.has(i)) out.push({ x: body[i].x, y: body[i].y });
  }
  // 闭合环把头点以独立对象补回，环不被拆开。
  if (closed) out.push({ x: out[0].x, y: out[0].y });
  return out;
}
if (typeof module !== "undefined") module.exports = { thin };
