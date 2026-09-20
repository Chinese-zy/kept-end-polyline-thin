const TOL = 2;

const panels = [
  {
    title: "闭合环：头尾同点，抽完仍是环；短的贴线小段还在",
    closed: true,
    points: [
      {x: 60, y: 200},
      {x: 72, y: 200},
      {x: 86, y: 202},
      {x: 180, y: 60},
      {x: 280, y: 190},
      {x: 60, y: 200},
    ],
  },
  {
    title: "开放折线：两端点钉住；长直线上的贴线点抽掉，短贴线段留下",
    closed: false,
    points: [
      {x: 40, y: 210},
      {x: 60, y: 210},
      {x: 78, y: 208},
      {x: 150, y: 70},
      {x: 220, y: 212},
      {x: 255, y: 212},
      {x: 290, y: 210},
    ],
  },
  {
    title: "自交折线：交叉处的点保留；共线重复点收掉",
    closed: false,
    points: [
      {x: 40, y: 60},
      {x: 40, y: 60},
      {x: 290, y: 220},
      {x: 40, y: 220},
      {x: 290, y: 60},
    ],
  },
];

const canvas = document.getElementById("c");
const g = canvas.getContext("2d");
const PANEL_W = 340;
const PANEL_H = 270;

panels.forEach((panel, idx) => {
  panel.kept = thin(panel.points.map(p => ({...p})), TOL, idx + 1);
});

function drawPanel(panel, ox, oy) {
  g.save();
  g.translate(ox, oy);

  g.strokeStyle = "#ddd";
  g.strokeRect(0.5, 0.5, PANEL_W - 1, PANEL_H - 1);

  g.fillStyle = "#333";
  g.font = "12px sans-serif";
  const parts = panel.title.split("；");
  parts.forEach((line, i) => g.fillText(line, 10, 18 + i * 15));

  g.save();
  g.translate(0, 28);

  drawPath(g, panel.points, panel.closed, "#bbb", 6);
  drawPath(g, panel.kept, panel.closed, "#c30", 2);

  g.fillStyle = "#999";
  panel.points.forEach((p, i) => {
    const dup = i > 0 &&
      p.x === panel.points[i - 1].x && p.y === panel.points[i - 1].y;
    if (dup) return;
    dot(g, p, 2.5, "#999");
  });

  panel.kept.forEach(p => dot(g, p, 4.5, "#c30"));

  const first = panel.kept[0];
  const last = panel.kept[panel.kept.length - 1];
  if (first) {
    ring(g, first, 8, "#0a7");
    g.fillStyle = "#0a7";
    g.font = "11px sans-serif";
    g.fillText("起点", first.x + 8, first.y - 8);
  }
  if (last && !panel.closed) {
    ring(g, last, 8, "#06c");
    g.fillStyle = "#06c";
    g.font = "11px sans-serif";
    g.fillText("终点", last.x + 8, last.y + 16);
  }
  if (panel.closed && first && last &&
      first.x === last.x && first.y === last.y) {
    g.fillStyle = "#0a7";
    g.font = "11px sans-serif";
    g.fillText("终点=起点，环闭合", first.x + 8, first.y + 16);
  }

  g.restore();
  g.restore();
}

function drawPath(ctx, pts, closed, color, width) {
  if (pts.length < 1) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  if (closed) ctx.closePath();
  ctx.stroke();
}

function dot(ctx, p, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ring(ctx, p, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
}

panels.forEach((panel, idx) => {
  drawPanel(panel, 10 + idx * (PANEL_W + 10), 10);
});

g.fillStyle = "#333";
g.font = "12px sans-serif";
g.fillText(
  "灰：原始写死点折线（含重复共线点）　红：抽稀结果　绿/蓝圈：起终点。容差固定，不随缩放变化。",
  10, PANEL_H + 32
);
