const test = require("node:test");
const assert = require("node:assert/strict");
const { thin } = require("../thin.js");

const ring = [
  {x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 0},
  {x: 20, y: 1}, {x: 30, y: 40}, {x: 0, y: 0}
];

test("端点还在，短的贴线段还在，闭合环没被拆开", () => {
  const out = thin(ring.map(p => ({...p})), 1.2, 3);
  assert.deepEqual(out[0], {x: 0, y: 0});
  assert.deepEqual(out[out.length - 1], {x: 0, y: 0});
  assert.ok(out.some(p => p.x === 20 && p.y === 1));
  assert.equal(out.filter(p => p.x === 10 && p.y === 0).length, 1);
});

test("缩放不改抽稀结果，算的时候改原数组也不影响", () => {
  const pts = ring.map(p => ({...p}));
  const a = thin(pts, 1.2, 1);
  pts[2].x = 999;
  const again = ring.map(p => ({...p}));
  const b = thin(again, 1.2, 4);
  assert.deepEqual(a, b);
});
