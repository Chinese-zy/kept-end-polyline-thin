const raw = [
  // 写死的演示点：开头叠了一个重复点；前半截是几乎贴直线的短段；
  // 中间 (300,60) 出现两次构成自交；整体是闭合环。
  {x: 40, y: 300}, {x: 40, y: 300}, {x: 100, y: 299}, {x: 100, y: 299},
  {x: 160, y: 300}, {x: 230, y: 296}, {x: 230, y: 296},
  {x: 300, y: 60}, {x: 380, y: 300}, {x: 300, y: 60},
  {x: 460, y: 300}, {x: 490, y: 302}, {x: 520, y: 300}, {x: 40, y: 300}
];
// zoom 不再参与容差，缩放到任意倍数结果一致。
const kept = thin(raw, 5, 2);
const canvas = document.getElementById("c");
const g = canvas.getContext("2d");
function draw(pts, color) {
  if (!pts.length) return;
  g.strokeStyle = color;
  g.lineWidth = color === "#c30" ? 2.5 : 1;
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach(p => g.lineTo(p.x, p.y));
  g.stroke();
}

function mark(pts, color, radius, label) {
  pts.forEach((p, i) => {
    g.fillStyle = color;
    g.strokeStyle = color;
    g.beginPath();
    g.arc(p.x, p.y, radius, 0, Math.PI * 2);
    g.fillStyle = color === "#fff" ? "#fff" : color;
    g.fill();
    if (color === "#fff") {
      g.beginPath();
      g.arc(p.x, p.y, radius, 0, Math.PI * 2);
      g.stroke();
    }
    if (label && i === 0) {
      g.fillStyle = "#06c";
      g.fillText(label, p.x + 6, p.y - 8);
    }
  });
}

draw(raw, "#999");
draw(kept, "#c30");

// 贴线的短段点：保留下来的中间点用空心红点标出。
mark(kept.slice(1, -1), "#fff", 4);
// 两端点 / 闭合环的头尾（同一点）用蓝点标出，证明端点还在、环没拆开。
mark([kept[0], kept[kept.length - 1]], "#06c", 5, "端点 / 环闭合点");

const closed = kept.length > 1 &&
  kept[0].x === kept[kept.length - 1].x &&
  kept[0].y === kept[kept.length - 1].y;
g.fillStyle = "#333";
g.fillText(
  closed ? "闭合环：头尾为同一点，抽稀后仍闭合" : "开放折线：两端点均保留",
  12, 24
);
g.fillStyle = "#666";
g.fillText(`原始 ${raw.length} 点 → 保留 ${kept.length} 点（含环闭合点）`, 12, 344);
