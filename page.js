const raw = [
  {x: 40, y: 180}, {x: 80, y: 180}, {x: 120, y: 176},
  {x: 200, y: 80}, {x: 280, y: 200}, {x: 200, y: 80},
  {x: 360, y: 180}, {x: 400, y: 180}, {x: 40, y: 180}
];
const kept = thin(raw, 1, 2);
const canvas = document.getElementById("c");
const g = canvas.getContext("2d");
function draw(pts, color) {
  if (!pts.length) return;
  g.strokeStyle = color;
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach(p => g.lineTo(p.x, p.y));
  g.stroke();
}
draw(raw, "#999");
draw(kept, "#c30");
