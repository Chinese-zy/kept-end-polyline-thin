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

test("开放折线两端点必须保留，中间长直线上的贴线点才抽掉", () => {
  const pts = [
    {x: 0, y: 0},
    {x: 30, y: 0},
    {x: 60, y: 1},
    {x: 90, y: 0},
    {x: 120, y: 0},
  ];
  const out = thin(pts, 1.2, 5);
  assert.deepEqual(out[0], {x: 0, y: 0});
  assert.deepEqual(out[out.length - 1], {x: 120, y: 0});
  assert.equal(out.some(p => p.x === 60 && p.y === 1), false);
});

test("短的贴线段整段保留，不会因为短而被整段扔掉", () => {
  const pts = [
    {x: 0, y: 0},
    {x: 8, y: 0},
    {x: 16, y: 1},
    {x: 24, y: 0},
  ];
  const out = thin(pts, 2, 10);
  assert.ok(out.some(p => p.x === 8 && p.y === 0));
  assert.ok(out.some(p => p.x === 16 && p.y === 1));
});

test("自交的折线，交叉处的点保留", () => {
  const pts = [
    {x: 0, y: 0},
    {x: 100, y: 100},
    {x: 0, y: 100},
    {x: 100, y: 0},
  ];
  const out = thin(pts, 5, 2);
  assert.equal(out.length, 4);
  assert.deepEqual(out, pts);
});

test("共线叠在一起的连续重复点被收掉，非重复点一个不丢", () => {
  const pts = [
    {x: 0, y: 0},
    {x: 0, y: 0},
    {x: 30, y: 0},
    {x: 30, y: 0},
    {x: 30, y: 0},
    {x: 60, y: 0},
  ];
  const out = thin(pts, 1.2, 1);
  assert.deepEqual(out, [
    {x: 0, y: 0},
    {x: 60, y: 0},
  ]);
  assert.equal(out.length, 2);
});

test("点的先后顺序不会被倒过来，结果是输入的有序子集", () => {
  const pts = [
    {x: 0, y: 0},
    {x: 40, y: 3},
    {x: 80, y: 0},
    {x: 120, y: 20},
    {x: 160, y: 0},
  ];
  const out = thin(pts, 1.2, 3);
  const xs = out.map(p => p.x);
  assert.deepEqual(xs, [...xs].sort((m, n) => m - n));
  for (const p of out) {
    assert.ok(pts.some(q => q.x === p.x && q.y === p.y));
  }
});

test("两个点的退化输入不被清空", () => {
  assert.deepEqual(thin([{x: 1, y: 2}, {x: 3, y: 4}], 1, 9),
    [{x: 1, y: 2}, {x: 3, y: 4}]);
});
