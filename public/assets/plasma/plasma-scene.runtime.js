var e = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2
  },
  t = {
    ROTATE: 0,
    PAN: 1,
    DOLLY_PAN: 2,
    DOLLY_ROTATE: 3
  },
  n = 1e3,
  r = 1001,
  i = 1002,
  a = 1003,
  o = 1004,
  s = 1005,
  c = 1006,
  l = 1007,
  u = 1008,
  d = 1009,
  f = 1010,
  p = 1011,
  m = 1012,
  h = 1013,
  g = 1014,
  _ = 1015,
  v = 1016,
  y = 1017,
  b = 1018,
  x = 1020,
  S = 35902,
  C = 35899,
  w = 1021,
  T = 1022,
  E = 1023,
  D = 1026,
  O = 1027,
  k = 1028,
  A = 1029,
  j = 1030,
  M = 1031,
  N = 1033,
  P = 33776,
  F = 33777,
  I = 33778,
  ee = 33779,
  te = 35840,
  ne = 35841,
  re = 35842,
  L = 35843,
  R = 36196,
  ie = 37492,
  z = 37496,
  ae = 37488,
  oe = 37489,
  se = 37490,
  ce = 37491,
  le = 37808,
  ue = 37809,
  de = 37810,
  fe = 37811,
  pe = 37812,
  me = 37813,
  he = 37814,
  ge = 37815,
  _e = 37816,
  ve = 37817,
  ye = 37818,
  be = 37819,
  xe = 37820,
  Se = 37821,
  Ce = 36492,
  we = 36494,
  Te = 36495,
  B = 36283,
  Ee = 36284,
  De = 36285,
  Oe = 36286,
  V = 2300,
  ke = 2301,
  H = 2302,
  U = 2303,
  Ae = 2400,
  je = 2401,
  Me = 2402,
  Ne = 3200,
  Pe = 'srgb',
  Fe = 'srgb-linear',
  Ie = 'linear',
  Le = 'srgb',
  Re = 7680,
  ze = 35044,
  Be = 2e3;
function Ve(e) {
  for (let t = e.length - 1; t >= 0; --t) if (e[t] >= 65535) return !0;
  return !1;
}
function He(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function Ue(e) {
  return document.createElementNS('http://www.w3.org/1999/xhtml', e);
}
function We() {
  let e = Ue('canvas');
  return ((e.style.display = 'block'), e);
}
var Ge = {},
  Ke = null;
function qe(...e) {
  let t = 'THREE.' + e.shift();
  Ke ? Ke('log', t, ...e) : console.log(t, ...e);
}
function Je(e) {
  let t = e[0];
  if (typeof t == 'string' && t.startsWith('TSL:')) {
    let t = e[1];
    t && t.isStackTrace
      ? (e[0] += ' ' + t.getLocation())
      : (e[1] =
          'Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.');
  }
  return e;
}
function W(...e) {
  e = Je(e);
  let t = 'THREE.' + e.shift();
  if (Ke) Ke('warn', t, ...e);
  else {
    let n = e[0];
    n && n.isStackTrace ? console.warn(n.getError(t)) : console.warn(t, ...e);
  }
}
function G(...e) {
  e = Je(e);
  let t = 'THREE.' + e.shift();
  if (Ke) Ke('error', t, ...e);
  else {
    let n = e[0];
    n && n.isStackTrace ? console.error(n.getError(t)) : console.error(t, ...e);
  }
}
function Ye(...e) {
  let t = e.join(' ');
  t in Ge || ((Ge[t] = !0), W(...e));
}
function Xe(e, t, n) {
  return new Promise(function (r, i) {
    function a() {
      switch (e.clientWaitSync(t, e.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case e.WAIT_FAILED:
          i();
          break;
        case e.TIMEOUT_EXPIRED:
          setTimeout(a, n);
          break;
        default:
          r();
      }
    }
    setTimeout(a, n);
  });
}
var Ze = {
    0: 1,
    2: 6,
    4: 7,
    3: 5,
    1: 0,
    6: 2,
    7: 4,
    5: 3
  },
  Qe = class {
    addEventListener(e, t) {
      this._listeners === void 0 && (this._listeners = {});
      let n = this._listeners;
      (n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t));
    }
    hasEventListener(e, t) {
      let n = this._listeners;
      return n === void 0 ? !1 : n[e] !== void 0 && n[e].indexOf(t) !== -1;
    }
    removeEventListener(e, t) {
      let n = this._listeners;
      if (n === void 0) return;
      let r = n[e];
      if (r !== void 0) {
        let e = r.indexOf(t);
        e !== -1 && r.splice(e, 1);
      }
    }
    dispatchEvent(e) {
      let t = this._listeners;
      if (t === void 0) return;
      let n = t[e.type];
      if (n !== void 0) {
        e.target = this;
        let t = n.slice(0);
        for (let n = 0, r = t.length; n < r; n++) t[n].call(this, e);
        e.target = null;
      }
    }
  },
  $e =
    /* @__PURE__ */ '00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff'.split(
      '.'
    ),
  et = 1234567,
  tt = Math.PI / 180,
  nt = 180 / Math.PI;
function rt() {
  let e = (Math.random() * 4294967295) | 0,
    t = (Math.random() * 4294967295) | 0,
    n = (Math.random() * 4294967295) | 0,
    r = (Math.random() * 4294967295) | 0;
  return (
    $e[e & 255] +
    $e[(e >> 8) & 255] +
    $e[(e >> 16) & 255] +
    $e[(e >> 24) & 255] +
    '-' +
    $e[t & 255] +
    $e[(t >> 8) & 255] +
    '-' +
    $e[((t >> 16) & 15) | 64] +
    $e[(t >> 24) & 255] +
    '-' +
    $e[(n & 63) | 128] +
    $e[(n >> 8) & 255] +
    '-' +
    $e[(n >> 16) & 255] +
    $e[(n >> 24) & 255] +
    $e[r & 255] +
    $e[(r >> 8) & 255] +
    $e[(r >> 16) & 255] +
    $e[(r >> 24) & 255]
  ).toLowerCase();
}
function K(e, t, n) {
  return Math.max(t, Math.min(n, e));
}
function it(e, t) {
  return ((e % t) + t) % t;
}
function at(e, t, n, r, i) {
  return r + ((e - t) * (i - r)) / (n - t);
}
function ot(e, t, n) {
  return e === t ? 0 : (n - e) / (t - e);
}
function st(e, t, n) {
  return (1 - n) * e + n * t;
}
function ct(e, t, n, r) {
  return st(e, t, 1 - Math.exp(-n * r));
}
function lt(e, t = 1) {
  return t - Math.abs(it(e, t * 2) - t);
}
function ut(e, t, n) {
  return e <= t ? 0 : e >= n ? 1 : ((e = (e - t) / (n - t)), e * e * (3 - 2 * e));
}
function dt(e, t, n) {
  return e <= t ? 0 : e >= n ? 1 : ((e = (e - t) / (n - t)), e * e * e * (e * (e * 6 - 15) + 10));
}
function ft(e, t) {
  return e + Math.floor(Math.random() * (t - e + 1));
}
function pt(e, t) {
  return e + Math.random() * (t - e);
}
function mt(e) {
  return e * (0.5 - Math.random());
}
function ht(e) {
  e !== void 0 && (et = e);
  let t = (et += 1831565813);
  return (
    (t = Math.imul(t ^ (t >>> 15), t | 1)),
    (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)),
    ((t ^ (t >>> 14)) >>> 0) / 4294967296
  );
}
function gt(e) {
  return e * tt;
}
function _t(e) {
  return e * nt;
}
function vt(e) {
  return (e & (e - 1)) == 0 && e !== 0;
}
function yt(e) {
  return 2 ** Math.ceil(Math.log(e) / Math.LN2);
}
function bt(e) {
  return 2 ** Math.floor(Math.log(e) / Math.LN2);
}
function xt(e, t, n, r, i) {
  let a = Math.cos,
    o = Math.sin,
    s = a(n / 2),
    c = o(n / 2),
    l = a((t + r) / 2),
    u = o((t + r) / 2),
    d = a((t - r) / 2),
    f = o((t - r) / 2),
    p = a((r - t) / 2),
    m = o((r - t) / 2);
  switch (i) {
    case 'XYX':
      e.set(s * u, c * d, c * f, s * l);
      break;
    case 'YZY':
      e.set(c * f, s * u, c * d, s * l);
      break;
    case 'ZXZ':
      e.set(c * d, c * f, s * u, s * l);
      break;
    case 'XZX':
      e.set(s * u, c * m, c * p, s * l);
      break;
    case 'YXY':
      e.set(c * p, s * u, c * m, s * l);
      break;
    case 'ZYZ':
      e.set(c * m, c * p, s * u, s * l);
      break;
    default:
      W('MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: ' + i);
  }
}
function St(e, t) {
  switch (t.constructor) {
    case Float32Array:
      return e;
    case Uint32Array:
      return e / 4294967295;
    case Uint16Array:
      return e / 65535;
    case Uint8Array:
      return e / 255;
    case Int32Array:
      return Math.max(e / 2147483647, -1);
    case Int16Array:
      return Math.max(e / 32767, -1);
    case Int8Array:
      return Math.max(e / 127, -1);
    default:
      throw Error('Invalid component type.');
  }
}
function Ct(e, t) {
  switch (t.constructor) {
    case Float32Array:
      return e;
    case Uint32Array:
      return Math.round(e * 4294967295);
    case Uint16Array:
      return Math.round(e * 65535);
    case Uint8Array:
      return Math.round(e * 255);
    case Int32Array:
      return Math.round(e * 2147483647);
    case Int16Array:
      return Math.round(e * 32767);
    case Int8Array:
      return Math.round(e * 127);
    default:
      throw Error('Invalid component type.');
  }
}
var wt = {
    DEG2RAD: tt,
    RAD2DEG: nt,
    generateUUID: rt,
    clamp: K,
    euclideanModulo: it,
    mapLinear: at,
    inverseLerp: ot,
    lerp: st,
    damp: ct,
    pingpong: lt,
    smoothstep: ut,
    smootherstep: dt,
    randInt: ft,
    randFloat: pt,
    randFloatSpread: mt,
    seededRandom: ht,
    degToRad: gt,
    radToDeg: _t,
    isPowerOfTwo: vt,
    ceilPowerOfTwo: yt,
    floorPowerOfTwo: bt,
    setQuaternionFromProperEuler: xt,
    normalize: Ct,
    denormalize: St
  },
  q = class e {
    static {
      e.prototype.isVector2 = !0;
    }
    constructor(e = 0, t = 0) {
      ((this.x = e), (this.y = t));
    }
    get width() {
      return this.x;
    }
    set width(e) {
      this.x = e;
    }
    get height() {
      return this.y;
    }
    set height(e) {
      this.y = e;
    }
    set(e, t) {
      return ((this.x = e), (this.y = t), this);
    }
    setScalar(e) {
      return ((this.x = e), (this.y = e), this);
    }
    setX(e) {
      return ((this.x = e), this);
    }
    setY(e) {
      return ((this.y = e), this);
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        default:
          throw Error('index is out of range: ' + e);
      }
      return this;
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw Error('index is out of range: ' + e);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y);
    }
    copy(e) {
      return ((this.x = e.x), (this.y = e.y), this);
    }
    add(e) {
      return ((this.x += e.x), (this.y += e.y), this);
    }
    addScalar(e) {
      return ((this.x += e), (this.y += e), this);
    }
    addVectors(e, t) {
      return ((this.x = e.x + t.x), (this.y = e.y + t.y), this);
    }
    addScaledVector(e, t) {
      return ((this.x += e.x * t), (this.y += e.y * t), this);
    }
    sub(e) {
      return ((this.x -= e.x), (this.y -= e.y), this);
    }
    subScalar(e) {
      return ((this.x -= e), (this.y -= e), this);
    }
    subVectors(e, t) {
      return ((this.x = e.x - t.x), (this.y = e.y - t.y), this);
    }
    multiply(e) {
      return ((this.x *= e.x), (this.y *= e.y), this);
    }
    multiplyScalar(e) {
      return ((this.x *= e), (this.y *= e), this);
    }
    divide(e) {
      return ((this.x /= e.x), (this.y /= e.y), this);
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e);
    }
    applyMatrix3(e) {
      let t = this.x,
        n = this.y,
        r = e.elements;
      return ((this.x = r[0] * t + r[3] * n + r[6]), (this.y = r[1] * t + r[4] * n + r[7]), this);
    }
    min(e) {
      return ((this.x = Math.min(this.x, e.x)), (this.y = Math.min(this.y, e.y)), this);
    }
    max(e) {
      return ((this.x = Math.max(this.x, e.x)), (this.y = Math.max(this.y, e.y)), this);
    }
    clamp(e, t) {
      return ((this.x = K(this.x, e.x, t.x)), (this.y = K(this.y, e.y, t.y)), this);
    }
    clampScalar(e, t) {
      return ((this.x = K(this.x, e, t)), (this.y = K(this.y, e, t)), this);
    }
    clampLength(e, t) {
      let n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(K(n, e, t));
    }
    floor() {
      return ((this.x = Math.floor(this.x)), (this.y = Math.floor(this.y)), this);
    }
    ceil() {
      return ((this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), this);
    }
    round() {
      return ((this.x = Math.round(this.x)), (this.y = Math.round(this.y)), this);
    }
    roundToZero() {
      return ((this.x = Math.trunc(this.x)), (this.y = Math.trunc(this.y)), this);
    }
    negate() {
      return ((this.x = -this.x), (this.y = -this.y), this);
    }
    dot(e) {
      return this.x * e.x + this.y * e.y;
    }
    cross(e) {
      return this.x * e.y - this.y * e.x;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    angle() {
      return Math.atan2(-this.y, -this.x) + Math.PI;
    }
    angleTo(e) {
      let t = Math.sqrt(this.lengthSq() * e.lengthSq());
      if (t === 0) return Math.PI / 2;
      let n = this.dot(e) / t;
      return Math.acos(K(n, -1, 1));
    }
    distanceTo(e) {
      return Math.sqrt(this.distanceToSquared(e));
    }
    distanceToSquared(e) {
      let t = this.x - e.x,
        n = this.y - e.y;
      return t * t + n * n;
    }
    manhattanDistanceTo(e) {
      return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
    }
    setLength(e) {
      return this.normalize().multiplyScalar(e);
    }
    lerp(e, t) {
      return ((this.x += (e.x - this.x) * t), (this.y += (e.y - this.y) * t), this);
    }
    lerpVectors(e, t, n) {
      return ((this.x = e.x + (t.x - e.x) * n), (this.y = e.y + (t.y - e.y) * n), this);
    }
    equals(e) {
      return e.x === this.x && e.y === this.y;
    }
    fromArray(e, t = 0) {
      return ((this.x = e[t]), (this.y = e[t + 1]), this);
    }
    toArray(e = [], t = 0) {
      return ((e[t] = this.x), (e[t + 1] = this.y), e);
    }
    fromBufferAttribute(e, t) {
      return ((this.x = e.getX(t)), (this.y = e.getY(t)), this);
    }
    rotateAround(e, t) {
      let n = Math.cos(t),
        r = Math.sin(t),
        i = this.x - e.x,
        a = this.y - e.y;
      return ((this.x = i * n - a * r + e.x), (this.y = i * r + a * n + e.y), this);
    }
    random() {
      return ((this.x = Math.random()), (this.y = Math.random()), this);
    }
    *[Symbol.iterator]() {
      (yield this.x, yield this.y);
    }
  },
  Tt = class {
    constructor(e = 0, t = 0, n = 0, r = 1) {
      ((this.isQuaternion = !0), (this._x = e), (this._y = t), (this._z = n), (this._w = r));
    }
    static slerpFlat(e, t, n, r, i, a, o) {
      let s = n[r + 0],
        c = n[r + 1],
        l = n[r + 2],
        u = n[r + 3],
        d = i[a + 0],
        f = i[a + 1],
        p = i[a + 2],
        m = i[a + 3];
      if (u !== m || s !== d || c !== f || l !== p) {
        let e = s * d + c * f + l * p + u * m;
        e < 0 && ((d = -d), (f = -f), (p = -p), (m = -m), (e = -e));
        let t = 1 - o;
        if (e < 0.9995) {
          let n = Math.acos(e),
            r = Math.sin(n);
          ((t = Math.sin(t * n) / r),
            (o = Math.sin(o * n) / r),
            (s = s * t + d * o),
            (c = c * t + f * o),
            (l = l * t + p * o),
            (u = u * t + m * o));
        } else {
          ((s = s * t + d * o), (c = c * t + f * o), (l = l * t + p * o), (u = u * t + m * o));
          let e = 1 / Math.sqrt(s * s + c * c + l * l + u * u);
          ((s *= e), (c *= e), (l *= e), (u *= e));
        }
      }
      ((e[t] = s), (e[t + 1] = c), (e[t + 2] = l), (e[t + 3] = u));
    }
    static multiplyQuaternionsFlat(e, t, n, r, i, a) {
      let o = n[r],
        s = n[r + 1],
        c = n[r + 2],
        l = n[r + 3],
        u = i[a],
        d = i[a + 1],
        f = i[a + 2],
        p = i[a + 3];
      return (
        (e[t] = o * p + l * u + s * f - c * d),
        (e[t + 1] = s * p + l * d + c * u - o * f),
        (e[t + 2] = c * p + l * f + o * d - s * u),
        (e[t + 3] = l * p - o * u - s * d - c * f),
        e
      );
    }
    get x() {
      return this._x;
    }
    set x(e) {
      ((this._x = e), this._onChangeCallback());
    }
    get y() {
      return this._y;
    }
    set y(e) {
      ((this._y = e), this._onChangeCallback());
    }
    get z() {
      return this._z;
    }
    set z(e) {
      ((this._z = e), this._onChangeCallback());
    }
    get w() {
      return this._w;
    }
    set w(e) {
      ((this._w = e), this._onChangeCallback());
    }
    set(e, t, n, r) {
      return (
        (this._x = e), (this._y = t), (this._z = n), (this._w = r), this._onChangeCallback(), this
      );
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._w);
    }
    copy(e) {
      return (
        (this._x = e.x),
        (this._y = e.y),
        (this._z = e.z),
        (this._w = e.w),
        this._onChangeCallback(),
        this
      );
    }
    setFromEuler(e, t = !0) {
      let n = e._x,
        r = e._y,
        i = e._z,
        a = e._order,
        o = Math.cos,
        s = Math.sin,
        c = o(n / 2),
        l = o(r / 2),
        u = o(i / 2),
        d = s(n / 2),
        f = s(r / 2),
        p = s(i / 2);
      switch (a) {
        case 'XYZ':
          ((this._x = d * l * u + c * f * p),
            (this._y = c * f * u - d * l * p),
            (this._z = c * l * p + d * f * u),
            (this._w = c * l * u - d * f * p));
          break;
        case 'YXZ':
          ((this._x = d * l * u + c * f * p),
            (this._y = c * f * u - d * l * p),
            (this._z = c * l * p - d * f * u),
            (this._w = c * l * u + d * f * p));
          break;
        case 'ZXY':
          ((this._x = d * l * u - c * f * p),
            (this._y = c * f * u + d * l * p),
            (this._z = c * l * p + d * f * u),
            (this._w = c * l * u - d * f * p));
          break;
        case 'ZYX':
          ((this._x = d * l * u - c * f * p),
            (this._y = c * f * u + d * l * p),
            (this._z = c * l * p - d * f * u),
            (this._w = c * l * u + d * f * p));
          break;
        case 'YZX':
          ((this._x = d * l * u + c * f * p),
            (this._y = c * f * u + d * l * p),
            (this._z = c * l * p - d * f * u),
            (this._w = c * l * u - d * f * p));
          break;
        case 'XZY':
          ((this._x = d * l * u - c * f * p),
            (this._y = c * f * u - d * l * p),
            (this._z = c * l * p + d * f * u),
            (this._w = c * l * u + d * f * p));
          break;
        default:
          W('Quaternion: .setFromEuler() encountered an unknown order: ' + a);
      }
      return (t === !0 && this._onChangeCallback(), this);
    }
    setFromAxisAngle(e, t) {
      let n = t / 2,
        r = Math.sin(n);
      return (
        (this._x = e.x * r),
        (this._y = e.y * r),
        (this._z = e.z * r),
        (this._w = Math.cos(n)),
        this._onChangeCallback(),
        this
      );
    }
    setFromRotationMatrix(e) {
      let t = e.elements,
        n = t[0],
        r = t[4],
        i = t[8],
        a = t[1],
        o = t[5],
        s = t[9],
        c = t[2],
        l = t[6],
        u = t[10],
        d = n + o + u;
      if (d > 0) {
        let e = 0.5 / Math.sqrt(d + 1);
        ((this._w = 0.25 / e),
          (this._x = (l - s) * e),
          (this._y = (i - c) * e),
          (this._z = (a - r) * e));
      } else if (n > o && n > u) {
        let e = 2 * Math.sqrt(1 + n - o - u);
        ((this._w = (l - s) / e),
          (this._x = 0.25 * e),
          (this._y = (r + a) / e),
          (this._z = (i + c) / e));
      } else if (o > u) {
        let e = 2 * Math.sqrt(1 + o - n - u);
        ((this._w = (i - c) / e),
          (this._x = (r + a) / e),
          (this._y = 0.25 * e),
          (this._z = (s + l) / e));
      } else {
        let e = 2 * Math.sqrt(1 + u - n - o);
        ((this._w = (a - r) / e),
          (this._x = (i + c) / e),
          (this._y = (s + l) / e),
          (this._z = 0.25 * e));
      }
      return (this._onChangeCallback(), this);
    }
    setFromUnitVectors(e, t) {
      let n = e.dot(t) + 1;
      return (
        n < 1e-8
          ? ((n = 0),
            Math.abs(e.x) > Math.abs(e.z)
              ? ((this._x = -e.y), (this._y = e.x), (this._z = 0), (this._w = n))
              : ((this._x = 0), (this._y = -e.z), (this._z = e.y), (this._w = n)))
          : ((this._x = e.y * t.z - e.z * t.y),
            (this._y = e.z * t.x - e.x * t.z),
            (this._z = e.x * t.y - e.y * t.x),
            (this._w = n)),
        this.normalize()
      );
    }
    angleTo(e) {
      return 2 * Math.acos(Math.abs(K(this.dot(e), -1, 1)));
    }
    rotateTowards(e, t) {
      let n = this.angleTo(e);
      if (n === 0) return this;
      let r = Math.min(1, t / n);
      return (this.slerp(e, r), this);
    }
    identity() {
      return this.set(0, 0, 0, 1);
    }
    invert() {
      return this.conjugate();
    }
    conjugate() {
      return ((this._x *= -1), (this._y *= -1), (this._z *= -1), this._onChangeCallback(), this);
    }
    dot(e) {
      return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
    }
    lengthSq() {
      return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }
    length() {
      return Math.sqrt(
        this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w
      );
    }
    normalize() {
      let e = this.length();
      return (
        e === 0
          ? ((this._x = 0), (this._y = 0), (this._z = 0), (this._w = 1))
          : ((e = 1 / e), (this._x *= e), (this._y *= e), (this._z *= e), (this._w *= e)),
        this._onChangeCallback(),
        this
      );
    }
    multiply(e) {
      return this.multiplyQuaternions(this, e);
    }
    premultiply(e) {
      return this.multiplyQuaternions(e, this);
    }
    multiplyQuaternions(e, t) {
      let n = e._x,
        r = e._y,
        i = e._z,
        a = e._w,
        o = t._x,
        s = t._y,
        c = t._z,
        l = t._w;
      return (
        (this._x = n * l + a * o + r * c - i * s),
        (this._y = r * l + a * s + i * o - n * c),
        (this._z = i * l + a * c + n * s - r * o),
        (this._w = a * l - n * o - r * s - i * c),
        this._onChangeCallback(),
        this
      );
    }
    slerp(e, t) {
      let n = e._x,
        r = e._y,
        i = e._z,
        a = e._w,
        o = this.dot(e);
      o < 0 && ((n = -n), (r = -r), (i = -i), (a = -a), (o = -o));
      let s = 1 - t;
      if (o < 0.9995) {
        let e = Math.acos(o),
          c = Math.sin(e);
        ((s = Math.sin(s * e) / c),
          (t = Math.sin(t * e) / c),
          (this._x = this._x * s + n * t),
          (this._y = this._y * s + r * t),
          (this._z = this._z * s + i * t),
          (this._w = this._w * s + a * t),
          this._onChangeCallback());
      } else
        ((this._x = this._x * s + n * t),
          (this._y = this._y * s + r * t),
          (this._z = this._z * s + i * t),
          (this._w = this._w * s + a * t),
          this.normalize());
      return this;
    }
    slerpQuaternions(e, t, n) {
      return this.copy(e).slerp(t, n);
    }
    random() {
      let e = 2 * Math.PI * Math.random(),
        t = 2 * Math.PI * Math.random(),
        n = Math.random(),
        r = Math.sqrt(1 - n),
        i = Math.sqrt(n);
      return this.set(r * Math.sin(e), r * Math.cos(e), i * Math.sin(t), i * Math.cos(t));
    }
    equals(e) {
      return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
    }
    fromArray(e, t = 0) {
      return (
        (this._x = e[t]),
        (this._y = e[t + 1]),
        (this._z = e[t + 2]),
        (this._w = e[t + 3]),
        this._onChangeCallback(),
        this
      );
    }
    toArray(e = [], t = 0) {
      return (
        (e[t] = this._x), (e[t + 1] = this._y), (e[t + 2] = this._z), (e[t + 3] = this._w), e
      );
    }
    fromBufferAttribute(e, t) {
      return (
        (this._x = e.getX(t)),
        (this._y = e.getY(t)),
        (this._z = e.getZ(t)),
        (this._w = e.getW(t)),
        this._onChangeCallback(),
        this
      );
    }
    toJSON() {
      return this.toArray();
    }
    _onChange(e) {
      return ((this._onChangeCallback = e), this);
    }
    _onChangeCallback() {}
    *[Symbol.iterator]() {
      (yield this._x, yield this._y, yield this._z, yield this._w);
    }
  },
  J = class e {
    static {
      e.prototype.isVector3 = !0;
    }
    constructor(e = 0, t = 0, n = 0) {
      ((this.x = e), (this.y = t), (this.z = n));
    }
    set(e, t, n) {
      return (n === void 0 && (n = this.z), (this.x = e), (this.y = t), (this.z = n), this);
    }
    setScalar(e) {
      return ((this.x = e), (this.y = e), (this.z = e), this);
    }
    setX(e) {
      return ((this.x = e), this);
    }
    setY(e) {
      return ((this.y = e), this);
    }
    setZ(e) {
      return ((this.z = e), this);
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        case 2:
          this.z = t;
          break;
        default:
          throw Error('index is out of range: ' + e);
      }
      return this;
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw Error('index is out of range: ' + e);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z);
    }
    copy(e) {
      return ((this.x = e.x), (this.y = e.y), (this.z = e.z), this);
    }
    add(e) {
      return ((this.x += e.x), (this.y += e.y), (this.z += e.z), this);
    }
    addScalar(e) {
      return ((this.x += e), (this.y += e), (this.z += e), this);
    }
    addVectors(e, t) {
      return ((this.x = e.x + t.x), (this.y = e.y + t.y), (this.z = e.z + t.z), this);
    }
    addScaledVector(e, t) {
      return ((this.x += e.x * t), (this.y += e.y * t), (this.z += e.z * t), this);
    }
    sub(e) {
      return ((this.x -= e.x), (this.y -= e.y), (this.z -= e.z), this);
    }
    subScalar(e) {
      return ((this.x -= e), (this.y -= e), (this.z -= e), this);
    }
    subVectors(e, t) {
      return ((this.x = e.x - t.x), (this.y = e.y - t.y), (this.z = e.z - t.z), this);
    }
    multiply(e) {
      return ((this.x *= e.x), (this.y *= e.y), (this.z *= e.z), this);
    }
    multiplyScalar(e) {
      return ((this.x *= e), (this.y *= e), (this.z *= e), this);
    }
    multiplyVectors(e, t) {
      return ((this.x = e.x * t.x), (this.y = e.y * t.y), (this.z = e.z * t.z), this);
    }
    applyEuler(e) {
      return this.applyQuaternion(Dt.setFromEuler(e));
    }
    applyAxisAngle(e, t) {
      return this.applyQuaternion(Dt.setFromAxisAngle(e, t));
    }
    applyMatrix3(e) {
      let t = this.x,
        n = this.y,
        r = this.z,
        i = e.elements;
      return (
        (this.x = i[0] * t + i[3] * n + i[6] * r),
        (this.y = i[1] * t + i[4] * n + i[7] * r),
        (this.z = i[2] * t + i[5] * n + i[8] * r),
        this
      );
    }
    applyNormalMatrix(e) {
      return this.applyMatrix3(e).normalize();
    }
    applyMatrix4(e) {
      let t = this.x,
        n = this.y,
        r = this.z,
        i = e.elements,
        a = 1 / (i[3] * t + i[7] * n + i[11] * r + i[15]);
      return (
        (this.x = (i[0] * t + i[4] * n + i[8] * r + i[12]) * a),
        (this.y = (i[1] * t + i[5] * n + i[9] * r + i[13]) * a),
        (this.z = (i[2] * t + i[6] * n + i[10] * r + i[14]) * a),
        this
      );
    }
    applyQuaternion(e) {
      let t = this.x,
        n = this.y,
        r = this.z,
        i = e.x,
        a = e.y,
        o = e.z,
        s = e.w,
        c = 2 * (a * r - o * n),
        l = 2 * (o * t - i * r),
        u = 2 * (i * n - a * t);
      return (
        (this.x = t + s * c + a * u - o * l),
        (this.y = n + s * l + o * c - i * u),
        (this.z = r + s * u + i * l - a * c),
        this
      );
    }
    project(e) {
      return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
    }
    unproject(e) {
      return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
    }
    transformDirection(e) {
      let t = this.x,
        n = this.y,
        r = this.z,
        i = e.elements;
      return (
        (this.x = i[0] * t + i[4] * n + i[8] * r),
        (this.y = i[1] * t + i[5] * n + i[9] * r),
        (this.z = i[2] * t + i[6] * n + i[10] * r),
        this.normalize()
      );
    }
    divide(e) {
      return ((this.x /= e.x), (this.y /= e.y), (this.z /= e.z), this);
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e);
    }
    min(e) {
      return (
        (this.x = Math.min(this.x, e.x)),
        (this.y = Math.min(this.y, e.y)),
        (this.z = Math.min(this.z, e.z)),
        this
      );
    }
    max(e) {
      return (
        (this.x = Math.max(this.x, e.x)),
        (this.y = Math.max(this.y, e.y)),
        (this.z = Math.max(this.z, e.z)),
        this
      );
    }
    clamp(e, t) {
      return (
        (this.x = K(this.x, e.x, t.x)),
        (this.y = K(this.y, e.y, t.y)),
        (this.z = K(this.z, e.z, t.z)),
        this
      );
    }
    clampScalar(e, t) {
      return (
        (this.x = K(this.x, e, t)), (this.y = K(this.y, e, t)), (this.z = K(this.z, e, t)), this
      );
    }
    clampLength(e, t) {
      let n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(K(n, e, t));
    }
    floor() {
      return (
        (this.x = Math.floor(this.x)),
        (this.y = Math.floor(this.y)),
        (this.z = Math.floor(this.z)),
        this
      );
    }
    ceil() {
      return (
        (this.x = Math.ceil(this.x)),
        (this.y = Math.ceil(this.y)),
        (this.z = Math.ceil(this.z)),
        this
      );
    }
    round() {
      return (
        (this.x = Math.round(this.x)),
        (this.y = Math.round(this.y)),
        (this.z = Math.round(this.z)),
        this
      );
    }
    roundToZero() {
      return (
        (this.x = Math.trunc(this.x)),
        (this.y = Math.trunc(this.y)),
        (this.z = Math.trunc(this.z)),
        this
      );
    }
    negate() {
      return ((this.x = -this.x), (this.y = -this.y), (this.z = -this.z), this);
    }
    dot(e) {
      return this.x * e.x + this.y * e.y + this.z * e.z;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(e) {
      return this.normalize().multiplyScalar(e);
    }
    lerp(e, t) {
      return (
        (this.x += (e.x - this.x) * t),
        (this.y += (e.y - this.y) * t),
        (this.z += (e.z - this.z) * t),
        this
      );
    }
    lerpVectors(e, t, n) {
      return (
        (this.x = e.x + (t.x - e.x) * n),
        (this.y = e.y + (t.y - e.y) * n),
        (this.z = e.z + (t.z - e.z) * n),
        this
      );
    }
    cross(e) {
      return this.crossVectors(this, e);
    }
    crossVectors(e, t) {
      let n = e.x,
        r = e.y,
        i = e.z,
        a = t.x,
        o = t.y,
        s = t.z;
      return ((this.x = r * s - i * o), (this.y = i * a - n * s), (this.z = n * o - r * a), this);
    }
    projectOnVector(e) {
      let t = e.lengthSq();
      if (t === 0) return this.set(0, 0, 0);
      let n = e.dot(this) / t;
      return this.copy(e).multiplyScalar(n);
    }
    projectOnPlane(e) {
      return (Et.copy(this).projectOnVector(e), this.sub(Et));
    }
    reflect(e) {
      return this.sub(Et.copy(e).multiplyScalar(2 * this.dot(e)));
    }
    angleTo(e) {
      let t = Math.sqrt(this.lengthSq() * e.lengthSq());
      if (t === 0) return Math.PI / 2;
      let n = this.dot(e) / t;
      return Math.acos(K(n, -1, 1));
    }
    distanceTo(e) {
      return Math.sqrt(this.distanceToSquared(e));
    }
    distanceToSquared(e) {
      let t = this.x - e.x,
        n = this.y - e.y,
        r = this.z - e.z;
      return t * t + n * n + r * r;
    }
    manhattanDistanceTo(e) {
      return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
    }
    setFromSpherical(e) {
      return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
    }
    setFromSphericalCoords(e, t, n) {
      let r = Math.sin(t) * e;
      return (
        (this.x = r * Math.sin(n)), (this.y = Math.cos(t) * e), (this.z = r * Math.cos(n)), this
      );
    }
    setFromCylindrical(e) {
      return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
    }
    setFromCylindricalCoords(e, t, n) {
      return ((this.x = e * Math.sin(t)), (this.y = n), (this.z = e * Math.cos(t)), this);
    }
    setFromMatrixPosition(e) {
      let t = e.elements;
      return ((this.x = t[12]), (this.y = t[13]), (this.z = t[14]), this);
    }
    setFromMatrixScale(e) {
      let t = this.setFromMatrixColumn(e, 0).length(),
        n = this.setFromMatrixColumn(e, 1).length(),
        r = this.setFromMatrixColumn(e, 2).length();
      return ((this.x = t), (this.y = n), (this.z = r), this);
    }
    setFromMatrixColumn(e, t) {
      return this.fromArray(e.elements, t * 4);
    }
    setFromMatrix3Column(e, t) {
      return this.fromArray(e.elements, t * 3);
    }
    setFromEuler(e) {
      return ((this.x = e._x), (this.y = e._y), (this.z = e._z), this);
    }
    setFromColor(e) {
      return ((this.x = e.r), (this.y = e.g), (this.z = e.b), this);
    }
    equals(e) {
      return e.x === this.x && e.y === this.y && e.z === this.z;
    }
    fromArray(e, t = 0) {
      return ((this.x = e[t]), (this.y = e[t + 1]), (this.z = e[t + 2]), this);
    }
    toArray(e = [], t = 0) {
      return ((e[t] = this.x), (e[t + 1] = this.y), (e[t + 2] = this.z), e);
    }
    fromBufferAttribute(e, t) {
      return ((this.x = e.getX(t)), (this.y = e.getY(t)), (this.z = e.getZ(t)), this);
    }
    random() {
      return ((this.x = Math.random()), (this.y = Math.random()), (this.z = Math.random()), this);
    }
    randomDirection() {
      let e = Math.random() * Math.PI * 2,
        t = Math.random() * 2 - 1,
        n = Math.sqrt(1 - t * t);
      return ((this.x = n * Math.cos(e)), (this.y = t), (this.z = n * Math.sin(e)), this);
    }
    *[Symbol.iterator]() {
      (yield this.x, yield this.y, yield this.z);
    }
  },
  Et = /*@__PURE__*/ new J(),
  Dt = /*@__PURE__*/ new Tt(),
  Y = class e {
    static {
      e.prototype.isMatrix3 = !0;
    }
    constructor(e, t, n, r, i, a, o, s, c) {
      ((this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]),
        e !== void 0 && this.set(e, t, n, r, i, a, o, s, c));
    }
    set(e, t, n, r, i, a, o, s, c) {
      let l = this.elements;
      return (
        (l[0] = e),
        (l[1] = r),
        (l[2] = o),
        (l[3] = t),
        (l[4] = i),
        (l[5] = s),
        (l[6] = n),
        (l[7] = a),
        (l[8] = c),
        this
      );
    }
    identity() {
      return (this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this);
    }
    copy(e) {
      let t = this.elements,
        n = e.elements;
      return (
        (t[0] = n[0]),
        (t[1] = n[1]),
        (t[2] = n[2]),
        (t[3] = n[3]),
        (t[4] = n[4]),
        (t[5] = n[5]),
        (t[6] = n[6]),
        (t[7] = n[7]),
        (t[8] = n[8]),
        this
      );
    }
    extractBasis(e, t, n) {
      return (
        e.setFromMatrix3Column(this, 0),
        t.setFromMatrix3Column(this, 1),
        n.setFromMatrix3Column(this, 2),
        this
      );
    }
    setFromMatrix4(e) {
      let t = e.elements;
      return (this.set(t[0], t[4], t[8], t[1], t[5], t[9], t[2], t[6], t[10]), this);
    }
    multiply(e) {
      return this.multiplyMatrices(this, e);
    }
    premultiply(e) {
      return this.multiplyMatrices(e, this);
    }
    multiplyMatrices(e, t) {
      let n = e.elements,
        r = t.elements,
        i = this.elements,
        a = n[0],
        o = n[3],
        s = n[6],
        c = n[1],
        l = n[4],
        u = n[7],
        d = n[2],
        f = n[5],
        p = n[8],
        m = r[0],
        h = r[3],
        g = r[6],
        _ = r[1],
        v = r[4],
        y = r[7],
        b = r[2],
        x = r[5],
        S = r[8];
      return (
        (i[0] = a * m + o * _ + s * b),
        (i[3] = a * h + o * v + s * x),
        (i[6] = a * g + o * y + s * S),
        (i[1] = c * m + l * _ + u * b),
        (i[4] = c * h + l * v + u * x),
        (i[7] = c * g + l * y + u * S),
        (i[2] = d * m + f * _ + p * b),
        (i[5] = d * h + f * v + p * x),
        (i[8] = d * g + f * y + p * S),
        this
      );
    }
    multiplyScalar(e) {
      let t = this.elements;
      return (
        (t[0] *= e),
        (t[3] *= e),
        (t[6] *= e),
        (t[1] *= e),
        (t[4] *= e),
        (t[7] *= e),
        (t[2] *= e),
        (t[5] *= e),
        (t[8] *= e),
        this
      );
    }
    determinant() {
      let e = this.elements,
        t = e[0],
        n = e[1],
        r = e[2],
        i = e[3],
        a = e[4],
        o = e[5],
        s = e[6],
        c = e[7],
        l = e[8];
      return t * a * l - t * o * c - n * i * l + n * o * s + r * i * c - r * a * s;
    }
    invert() {
      let e = this.elements,
        t = e[0],
        n = e[1],
        r = e[2],
        i = e[3],
        a = e[4],
        o = e[5],
        s = e[6],
        c = e[7],
        l = e[8],
        u = l * a - o * c,
        d = o * s - l * i,
        f = c * i - a * s,
        p = t * u + n * d + r * f;
      if (p === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      let m = 1 / p;
      return (
        (e[0] = u * m),
        (e[1] = (r * c - l * n) * m),
        (e[2] = (o * n - r * a) * m),
        (e[3] = d * m),
        (e[4] = (l * t - r * s) * m),
        (e[5] = (r * i - o * t) * m),
        (e[6] = f * m),
        (e[7] = (n * s - c * t) * m),
        (e[8] = (a * t - n * i) * m),
        this
      );
    }
    transpose() {
      let e,
        t = this.elements;
      return (
        (e = t[1]),
        (t[1] = t[3]),
        (t[3] = e),
        (e = t[2]),
        (t[2] = t[6]),
        (t[6] = e),
        (e = t[5]),
        (t[5] = t[7]),
        (t[7] = e),
        this
      );
    }
    getNormalMatrix(e) {
      return this.setFromMatrix4(e).invert().transpose();
    }
    transposeIntoArray(e) {
      let t = this.elements;
      return (
        (e[0] = t[0]),
        (e[1] = t[3]),
        (e[2] = t[6]),
        (e[3] = t[1]),
        (e[4] = t[4]),
        (e[5] = t[7]),
        (e[6] = t[2]),
        (e[7] = t[5]),
        (e[8] = t[8]),
        this
      );
    }
    setUvTransform(e, t, n, r, i, a, o) {
      let s = Math.cos(i),
        c = Math.sin(i);
      return (
        this.set(
          n * s,
          n * c,
          -n * (s * a + c * o) + a + e,
          -r * c,
          r * s,
          -r * (-c * a + s * o) + o + t,
          0,
          0,
          1
        ),
        this
      );
    }
    scale(e, t) {
      return (this.premultiply(Ot.makeScale(e, t)), this);
    }
    rotate(e) {
      return (this.premultiply(Ot.makeRotation(-e)), this);
    }
    translate(e, t) {
      return (this.premultiply(Ot.makeTranslation(e, t)), this);
    }
    makeTranslation(e, t) {
      return (
        e.isVector2 ? this.set(1, 0, e.x, 0, 1, e.y, 0, 0, 1) : this.set(1, 0, e, 0, 1, t, 0, 0, 1),
        this
      );
    }
    makeRotation(e) {
      let t = Math.cos(e),
        n = Math.sin(e);
      return (this.set(t, -n, 0, n, t, 0, 0, 0, 1), this);
    }
    makeScale(e, t) {
      return (this.set(e, 0, 0, 0, t, 0, 0, 0, 1), this);
    }
    equals(e) {
      let t = this.elements,
        n = e.elements;
      for (let e = 0; e < 9; e++) if (t[e] !== n[e]) return !1;
      return !0;
    }
    fromArray(e, t = 0) {
      for (let n = 0; n < 9; n++) this.elements[n] = e[n + t];
      return this;
    }
    toArray(e = [], t = 0) {
      let n = this.elements;
      return (
        (e[t] = n[0]),
        (e[t + 1] = n[1]),
        (e[t + 2] = n[2]),
        (e[t + 3] = n[3]),
        (e[t + 4] = n[4]),
        (e[t + 5] = n[5]),
        (e[t + 6] = n[6]),
        (e[t + 7] = n[7]),
        (e[t + 8] = n[8]),
        e
      );
    }
    clone() {
      return new this.constructor().fromArray(this.elements);
    }
  },
  Ot = /*@__PURE__*/ new Y(),
  kt = /*@__PURE__*/ new Y().set(
    0.4123908,
    0.3575843,
    0.1804808,
    0.212639,
    0.7151687,
    0.0721923,
    0.0193308,
    0.1191948,
    0.9505322
  ),
  At = /*@__PURE__*/ new Y().set(
    3.2409699,
    -1.5373832,
    -0.4986108,
    -0.9692436,
    1.8759675,
    0.0415551,
    0.0556301,
    -0.203977,
    1.0569715
  );
function jt() {
  let e = {
      enabled: !0,
      workingColorSpace: Fe,
      spaces: {},
      convert: function (e, t, n) {
        return this.enabled === !1 || t === n || !t || !n
          ? e
          : (this.spaces[t].transfer === 'srgb' &&
              ((e.r = Nt(e.r)), (e.g = Nt(e.g)), (e.b = Nt(e.b))),
            this.spaces[t].primaries !== this.spaces[n].primaries &&
              (e.applyMatrix3(this.spaces[t].toXYZ), e.applyMatrix3(this.spaces[n].fromXYZ)),
            this.spaces[n].transfer === 'srgb' &&
              ((e.r = Pt(e.r)), (e.g = Pt(e.g)), (e.b = Pt(e.b))),
            e);
      },
      workingToColorSpace: function (e, t) {
        return this.convert(e, this.workingColorSpace, t);
      },
      colorSpaceToWorking: function (e, t) {
        return this.convert(e, t, this.workingColorSpace);
      },
      getPrimaries: function (e) {
        return this.spaces[e].primaries;
      },
      getTransfer: function (e) {
        return e === '' ? Ie : this.spaces[e].transfer;
      },
      getToneMappingMode: function (e) {
        return this.spaces[e].outputColorSpaceConfig.toneMappingMode || 'standard';
      },
      getLuminanceCoefficients: function (e, t = this.workingColorSpace) {
        return e.fromArray(this.spaces[t].luminanceCoefficients);
      },
      define: function (e) {
        Object.assign(this.spaces, e);
      },
      _getMatrix: function (e, t, n) {
        return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ);
      },
      _getDrawingBufferColorSpace: function (e) {
        return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace;
      },
      _getUnpackColorSpace: function (e = this.workingColorSpace) {
        return this.spaces[e].workingColorSpaceConfig.unpackColorSpace;
      },
      fromWorkingColorSpace: function (t, n) {
        return (
          Ye(
            'ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().'
          ),
          e.workingToColorSpace(t, n)
        );
      },
      toWorkingColorSpace: function (t, n) {
        return (
          Ye('ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().'),
          e.colorSpaceToWorking(t, n)
        );
      }
    },
    t = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06],
    n = [0.2126, 0.7152, 0.0722],
    r = [0.3127, 0.329];
  return (
    e.define({
      [Fe]: {
        primaries: t,
        whitePoint: r,
        transfer: Ie,
        toXYZ: kt,
        fromXYZ: At,
        luminanceCoefficients: n,
        workingColorSpaceConfig: { unpackColorSpace: Pe },
        outputColorSpaceConfig: { drawingBufferColorSpace: Pe }
      },
      [Pe]: {
        primaries: t,
        whitePoint: r,
        transfer: Le,
        toXYZ: kt,
        fromXYZ: At,
        luminanceCoefficients: n,
        outputColorSpaceConfig: { drawingBufferColorSpace: Pe }
      }
    }),
    e
  );
}
var Mt = /*@__PURE__*/ jt();
function Nt(e) {
  return e < 0.04045 ? e * 0.0773993808 : (e * 0.9478672986 + 0.0521327014) ** 2.4;
}
function Pt(e) {
  return e < 0.0031308 ? e * 12.92 : 1.055 * e ** 0.41666 - 0.055;
}
var Ft,
  It = class {
    static getDataURL(e, t = 'image/png') {
      if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > 'u') return e.src;
      let n;
      if (e instanceof HTMLCanvasElement) n = e;
      else {
        (Ft === void 0 && (Ft = Ue('canvas')), (Ft.width = e.width), (Ft.height = e.height));
        let t = Ft.getContext('2d');
        (e instanceof ImageData ? t.putImageData(e, 0, 0) : t.drawImage(e, 0, 0, e.width, e.height),
          (n = Ft));
      }
      return n.toDataURL(t);
    }
    static sRGBToLinear(e) {
      if (
        (typeof HTMLImageElement < 'u' && e instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement < 'u' && e instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap < 'u' && e instanceof ImageBitmap)
      ) {
        let t = Ue('canvas');
        ((t.width = e.width), (t.height = e.height));
        let n = t.getContext('2d');
        n.drawImage(e, 0, 0, e.width, e.height);
        let r = n.getImageData(0, 0, e.width, e.height),
          i = r.data;
        for (let e = 0; e < i.length; e++) i[e] = Nt(i[e] / 255) * 255;
        return (n.putImageData(r, 0, 0), t);
      } else if (e.data) {
        let t = e.data.slice(0);
        for (let e = 0; e < t.length; e++)
          t instanceof Uint8Array || t instanceof Uint8ClampedArray
            ? (t[e] = Math.floor(Nt(t[e] / 255) * 255))
            : (t[e] = Nt(t[e]));
        return {
          data: t,
          width: e.width,
          height: e.height
        };
      } else
        return (
          W(
            'ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.'
          ),
          e
        );
    }
  },
  Lt = 0,
  Rt = class {
    constructor(e = null) {
      ((this.isSource = !0),
        Object.defineProperty(this, 'id', { value: Lt++ }),
        (this.uuid = rt()),
        (this.data = e),
        (this.dataReady = !0),
        (this.version = 0));
    }
    getSize(e) {
      let t = this.data;
      return (
        typeof HTMLVideoElement < 'u' && t instanceof HTMLVideoElement
          ? e.set(t.videoWidth, t.videoHeight, 0)
          : typeof VideoFrame < 'u' && t instanceof VideoFrame
            ? e.set(t.displayWidth, t.displayHeight, 0)
            : t === null
              ? e.set(0, 0, 0)
              : e.set(t.width, t.height, t.depth || 0),
        e
      );
    }
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == 'string';
      if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
      let n = {
          uuid: this.uuid,
          url: ''
        },
        r = this.data;
      if (r !== null) {
        let e;
        if (Array.isArray(r)) {
          e = [];
          for (let t = 0, n = r.length; t < n; t++)
            r[t].isDataTexture ? e.push(zt(r[t].image)) : e.push(zt(r[t]));
        } else e = zt(r);
        n.url = e;
      }
      return (t || (e.images[this.uuid] = n), n);
    }
  };
function zt(e) {
  return (typeof HTMLImageElement < 'u' && e instanceof HTMLImageElement) ||
    (typeof HTMLCanvasElement < 'u' && e instanceof HTMLCanvasElement) ||
    (typeof ImageBitmap < 'u' && e instanceof ImageBitmap)
    ? It.getDataURL(e)
    : e.data
      ? {
          data: Array.from(e.data),
          width: e.width,
          height: e.height,
          type: e.data.constructor.name
        }
      : (W('Texture: Unable to serialize Texture.'), {});
}
var Bt = 0,
  Vt = /*@__PURE__*/ new J(),
  Ht = class e extends Qe {
    constructor(
      t = e.DEFAULT_IMAGE,
      n = e.DEFAULT_MAPPING,
      i = r,
      a = r,
      o = c,
      s = u,
      l = E,
      f = d,
      p = e.DEFAULT_ANISOTROPY,
      m = ''
    ) {
      (super(),
        (this.isTexture = !0),
        Object.defineProperty(this, 'id', { value: Bt++ }),
        (this.uuid = rt()),
        (this.name = ''),
        (this.source = new Rt(t)),
        (this.mipmaps = []),
        (this.mapping = n),
        (this.channel = 0),
        (this.wrapS = i),
        (this.wrapT = a),
        (this.magFilter = o),
        (this.minFilter = s),
        (this.anisotropy = p),
        (this.format = l),
        (this.internalFormat = null),
        (this.type = f),
        (this.offset = new q(0, 0)),
        (this.repeat = new q(1, 1)),
        (this.center = new q(0, 0)),
        (this.rotation = 0),
        (this.matrixAutoUpdate = !0),
        (this.matrix = new Y()),
        (this.generateMipmaps = !0),
        (this.premultiplyAlpha = !1),
        (this.flipY = !0),
        (this.unpackAlignment = 4),
        (this.colorSpace = m),
        (this.userData = {}),
        (this.updateRanges = []),
        (this.version = 0),
        (this.onUpdate = null),
        (this.renderTarget = null),
        (this.isRenderTargetTexture = !1),
        (this.isArrayTexture = !!(t && t.depth && t.depth > 1)),
        (this.pmremVersion = 0),
        (this.normalized = !1));
    }
    get width() {
      return this.source.getSize(Vt).x;
    }
    get height() {
      return this.source.getSize(Vt).y;
    }
    get depth() {
      return this.source.getSize(Vt).z;
    }
    get image() {
      return this.source.data;
    }
    set image(e) {
      this.source.data = e;
    }
    updateMatrix() {
      this.matrix.setUvTransform(
        this.offset.x,
        this.offset.y,
        this.repeat.x,
        this.repeat.y,
        this.rotation,
        this.center.x,
        this.center.y
      );
    }
    addUpdateRange(e, t) {
      this.updateRanges.push({
        start: e,
        count: t
      });
    }
    clearUpdateRanges() {
      this.updateRanges.length = 0;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return (
        (this.name = e.name),
        (this.source = e.source),
        (this.mipmaps = e.mipmaps.slice(0)),
        (this.mapping = e.mapping),
        (this.channel = e.channel),
        (this.wrapS = e.wrapS),
        (this.wrapT = e.wrapT),
        (this.magFilter = e.magFilter),
        (this.minFilter = e.minFilter),
        (this.anisotropy = e.anisotropy),
        (this.format = e.format),
        (this.internalFormat = e.internalFormat),
        (this.type = e.type),
        (this.normalized = e.normalized),
        this.offset.copy(e.offset),
        this.repeat.copy(e.repeat),
        this.center.copy(e.center),
        (this.rotation = e.rotation),
        (this.matrixAutoUpdate = e.matrixAutoUpdate),
        this.matrix.copy(e.matrix),
        (this.generateMipmaps = e.generateMipmaps),
        (this.premultiplyAlpha = e.premultiplyAlpha),
        (this.flipY = e.flipY),
        (this.unpackAlignment = e.unpackAlignment),
        (this.colorSpace = e.colorSpace),
        (this.renderTarget = e.renderTarget),
        (this.isRenderTargetTexture = e.isRenderTargetTexture),
        (this.isArrayTexture = e.isArrayTexture),
        (this.userData = JSON.parse(JSON.stringify(e.userData))),
        (this.needsUpdate = !0),
        this
      );
    }
    setValues(e) {
      for (let t in e) {
        let n = e[t];
        if (n === void 0) {
          W(`Texture.setValues(): parameter '${t}' has value of undefined.`);
          continue;
        }
        let r = this[t];
        if (r === void 0) {
          W(`Texture.setValues(): property '${t}' does not exist.`);
          continue;
        }
        (r && n && r.isVector2 && n.isVector2) ||
        (r && n && r.isVector3 && n.isVector3) ||
        (r && n && r.isMatrix3 && n.isMatrix3)
          ? r.copy(n)
          : (this[t] = n);
      }
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == 'string';
      if (!t && e.textures[this.uuid] !== void 0) return e.textures[this.uuid];
      let n = {
        metadata: {
          version: 4.7,
          type: 'Texture',
          generator: 'Texture.toJSON'
        },
        uuid: this.uuid,
        name: this.name,
        image: this.source.toJSON(e).uuid,
        mapping: this.mapping,
        channel: this.channel,
        repeat: [this.repeat.x, this.repeat.y],
        offset: [this.offset.x, this.offset.y],
        center: [this.center.x, this.center.y],
        rotation: this.rotation,
        wrap: [this.wrapS, this.wrapT],
        format: this.format,
        internalFormat: this.internalFormat,
        type: this.type,
        normalized: this.normalized,
        colorSpace: this.colorSpace,
        minFilter: this.minFilter,
        magFilter: this.magFilter,
        anisotropy: this.anisotropy,
        flipY: this.flipY,
        generateMipmaps: this.generateMipmaps,
        premultiplyAlpha: this.premultiplyAlpha,
        unpackAlignment: this.unpackAlignment
      };
      return (
        Object.keys(this.userData).length > 0 && (n.userData = this.userData),
        t || (e.textures[this.uuid] = n),
        n
      );
    }
    dispose() {
      this.dispatchEvent({ type: 'dispose' });
    }
    transformUv(e) {
      if (this.mapping !== 300) return e;
      if ((e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1))
        switch (this.wrapS) {
          case n:
            e.x -= Math.floor(e.x);
            break;
          case r:
            e.x = e.x < 0 ? 0 : 1;
            break;
          case i:
            Math.abs(Math.floor(e.x) % 2) === 1
              ? (e.x = Math.ceil(e.x) - e.x)
              : (e.x -= Math.floor(e.x));
            break;
        }
      if (e.y < 0 || e.y > 1)
        switch (this.wrapT) {
          case n:
            e.y -= Math.floor(e.y);
            break;
          case r:
            e.y = e.y < 0 ? 0 : 1;
            break;
          case i:
            Math.abs(Math.floor(e.y) % 2) === 1
              ? (e.y = Math.ceil(e.y) - e.y)
              : (e.y -= Math.floor(e.y));
            break;
        }
      return (this.flipY && (e.y = 1 - e.y), e);
    }
    set needsUpdate(e) {
      e === !0 && (this.version++, (this.source.needsUpdate = !0));
    }
    set needsPMREMUpdate(e) {
      e === !0 && this.pmremVersion++;
    }
  };
((Ht.DEFAULT_IMAGE = null), (Ht.DEFAULT_MAPPING = 300), (Ht.DEFAULT_ANISOTROPY = 1));
var Ut = class e {
    static {
      e.prototype.isVector4 = !0;
    }
    constructor(e = 0, t = 0, n = 0, r = 1) {
      ((this.x = e), (this.y = t), (this.z = n), (this.w = r));
    }
    get width() {
      return this.z;
    }
    set width(e) {
      this.z = e;
    }
    get height() {
      return this.w;
    }
    set height(e) {
      this.w = e;
    }
    set(e, t, n, r) {
      return ((this.x = e), (this.y = t), (this.z = n), (this.w = r), this);
    }
    setScalar(e) {
      return ((this.x = e), (this.y = e), (this.z = e), (this.w = e), this);
    }
    setX(e) {
      return ((this.x = e), this);
    }
    setY(e) {
      return ((this.y = e), this);
    }
    setZ(e) {
      return ((this.z = e), this);
    }
    setW(e) {
      return ((this.w = e), this);
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        case 2:
          this.z = t;
          break;
        case 3:
          this.w = t;
          break;
        default:
          throw Error('index is out of range: ' + e);
      }
      return this;
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        case 3:
          return this.w;
        default:
          throw Error('index is out of range: ' + e);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }
    copy(e) {
      return (
        (this.x = e.x), (this.y = e.y), (this.z = e.z), (this.w = e.w === void 0 ? 1 : e.w), this
      );
    }
    add(e) {
      return ((this.x += e.x), (this.y += e.y), (this.z += e.z), (this.w += e.w), this);
    }
    addScalar(e) {
      return ((this.x += e), (this.y += e), (this.z += e), (this.w += e), this);
    }
    addVectors(e, t) {
      return (
        (this.x = e.x + t.x), (this.y = e.y + t.y), (this.z = e.z + t.z), (this.w = e.w + t.w), this
      );
    }
    addScaledVector(e, t) {
      return (
        (this.x += e.x * t), (this.y += e.y * t), (this.z += e.z * t), (this.w += e.w * t), this
      );
    }
    sub(e) {
      return ((this.x -= e.x), (this.y -= e.y), (this.z -= e.z), (this.w -= e.w), this);
    }
    subScalar(e) {
      return ((this.x -= e), (this.y -= e), (this.z -= e), (this.w -= e), this);
    }
    subVectors(e, t) {
      return (
        (this.x = e.x - t.x), (this.y = e.y - t.y), (this.z = e.z - t.z), (this.w = e.w - t.w), this
      );
    }
    multiply(e) {
      return ((this.x *= e.x), (this.y *= e.y), (this.z *= e.z), (this.w *= e.w), this);
    }
    multiplyScalar(e) {
      return ((this.x *= e), (this.y *= e), (this.z *= e), (this.w *= e), this);
    }
    applyMatrix4(e) {
      let t = this.x,
        n = this.y,
        r = this.z,
        i = this.w,
        a = e.elements;
      return (
        (this.x = a[0] * t + a[4] * n + a[8] * r + a[12] * i),
        (this.y = a[1] * t + a[5] * n + a[9] * r + a[13] * i),
        (this.z = a[2] * t + a[6] * n + a[10] * r + a[14] * i),
        (this.w = a[3] * t + a[7] * n + a[11] * r + a[15] * i),
        this
      );
    }
    divide(e) {
      return ((this.x /= e.x), (this.y /= e.y), (this.z /= e.z), (this.w /= e.w), this);
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e);
    }
    setAxisAngleFromQuaternion(e) {
      this.w = 2 * Math.acos(e.w);
      let t = Math.sqrt(1 - e.w * e.w);
      return (
        t < 1e-4
          ? ((this.x = 1), (this.y = 0), (this.z = 0))
          : ((this.x = e.x / t), (this.y = e.y / t), (this.z = e.z / t)),
        this
      );
    }
    setAxisAngleFromRotationMatrix(e) {
      let t,
        n,
        r,
        i,
        a = 0.01,
        o = 0.1,
        s = e.elements,
        c = s[0],
        l = s[4],
        u = s[8],
        d = s[1],
        f = s[5],
        p = s[9],
        m = s[2],
        h = s[6],
        g = s[10];
      if (Math.abs(l - d) < a && Math.abs(u - m) < a && Math.abs(p - h) < a) {
        if (
          Math.abs(l + d) < o &&
          Math.abs(u + m) < o &&
          Math.abs(p + h) < o &&
          Math.abs(c + f + g - 3) < o
        )
          return (this.set(1, 0, 0, 0), this);
        t = Math.PI;
        let e = (c + 1) / 2,
          s = (f + 1) / 2,
          _ = (g + 1) / 2,
          v = (l + d) / 4,
          y = (u + m) / 4,
          b = (p + h) / 4;
        return (
          e > s && e > _
            ? e < a
              ? ((n = 0), (r = 0.707106781), (i = 0.707106781))
              : ((n = Math.sqrt(e)), (r = v / n), (i = y / n))
            : s > _
              ? s < a
                ? ((n = 0.707106781), (r = 0), (i = 0.707106781))
                : ((r = Math.sqrt(s)), (n = v / r), (i = b / r))
              : _ < a
                ? ((n = 0.707106781), (r = 0.707106781), (i = 0))
                : ((i = Math.sqrt(_)), (n = y / i), (r = b / i)),
          this.set(n, r, i, t),
          this
        );
      }
      let _ = Math.sqrt((h - p) * (h - p) + (u - m) * (u - m) + (d - l) * (d - l));
      return (
        Math.abs(_) < 0.001 && (_ = 1),
        (this.x = (h - p) / _),
        (this.y = (u - m) / _),
        (this.z = (d - l) / _),
        (this.w = Math.acos((c + f + g - 1) / 2)),
        this
      );
    }
    setFromMatrixPosition(e) {
      let t = e.elements;
      return ((this.x = t[12]), (this.y = t[13]), (this.z = t[14]), (this.w = t[15]), this);
    }
    min(e) {
      return (
        (this.x = Math.min(this.x, e.x)),
        (this.y = Math.min(this.y, e.y)),
        (this.z = Math.min(this.z, e.z)),
        (this.w = Math.min(this.w, e.w)),
        this
      );
    }
    max(e) {
      return (
        (this.x = Math.max(this.x, e.x)),
        (this.y = Math.max(this.y, e.y)),
        (this.z = Math.max(this.z, e.z)),
        (this.w = Math.max(this.w, e.w)),
        this
      );
    }
    clamp(e, t) {
      return (
        (this.x = K(this.x, e.x, t.x)),
        (this.y = K(this.y, e.y, t.y)),
        (this.z = K(this.z, e.z, t.z)),
        (this.w = K(this.w, e.w, t.w)),
        this
      );
    }
    clampScalar(e, t) {
      return (
        (this.x = K(this.x, e, t)),
        (this.y = K(this.y, e, t)),
        (this.z = K(this.z, e, t)),
        (this.w = K(this.w, e, t)),
        this
      );
    }
    clampLength(e, t) {
      let n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(K(n, e, t));
    }
    floor() {
      return (
        (this.x = Math.floor(this.x)),
        (this.y = Math.floor(this.y)),
        (this.z = Math.floor(this.z)),
        (this.w = Math.floor(this.w)),
        this
      );
    }
    ceil() {
      return (
        (this.x = Math.ceil(this.x)),
        (this.y = Math.ceil(this.y)),
        (this.z = Math.ceil(this.z)),
        (this.w = Math.ceil(this.w)),
        this
      );
    }
    round() {
      return (
        (this.x = Math.round(this.x)),
        (this.y = Math.round(this.y)),
        (this.z = Math.round(this.z)),
        (this.w = Math.round(this.w)),
        this
      );
    }
    roundToZero() {
      return (
        (this.x = Math.trunc(this.x)),
        (this.y = Math.trunc(this.y)),
        (this.z = Math.trunc(this.z)),
        (this.w = Math.trunc(this.w)),
        this
      );
    }
    negate() {
      return ((this.x = -this.x), (this.y = -this.y), (this.z = -this.z), (this.w = -this.w), this);
    }
    dot(e) {
      return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(e) {
      return this.normalize().multiplyScalar(e);
    }
    lerp(e, t) {
      return (
        (this.x += (e.x - this.x) * t),
        (this.y += (e.y - this.y) * t),
        (this.z += (e.z - this.z) * t),
        (this.w += (e.w - this.w) * t),
        this
      );
    }
    lerpVectors(e, t, n) {
      return (
        (this.x = e.x + (t.x - e.x) * n),
        (this.y = e.y + (t.y - e.y) * n),
        (this.z = e.z + (t.z - e.z) * n),
        (this.w = e.w + (t.w - e.w) * n),
        this
      );
    }
    equals(e) {
      return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
    }
    fromArray(e, t = 0) {
      return ((this.x = e[t]), (this.y = e[t + 1]), (this.z = e[t + 2]), (this.w = e[t + 3]), this);
    }
    toArray(e = [], t = 0) {
      return ((e[t] = this.x), (e[t + 1] = this.y), (e[t + 2] = this.z), (e[t + 3] = this.w), e);
    }
    fromBufferAttribute(e, t) {
      return (
        (this.x = e.getX(t)), (this.y = e.getY(t)), (this.z = e.getZ(t)), (this.w = e.getW(t)), this
      );
    }
    random() {
      return (
        (this.x = Math.random()),
        (this.y = Math.random()),
        (this.z = Math.random()),
        (this.w = Math.random()),
        this
      );
    }
    *[Symbol.iterator]() {
      (yield this.x, yield this.y, yield this.z, yield this.w);
    }
  },
  Wt = class extends Qe {
    constructor(e = 1, t = 1, n = {}) {
      (super(),
        (n = Object.assign(
          {
            generateMipmaps: !1,
            internalFormat: null,
            minFilter: c,
            depthBuffer: !0,
            stencilBuffer: !1,
            resolveDepthBuffer: !0,
            resolveStencilBuffer: !0,
            depthTexture: null,
            samples: 0,
            count: 1,
            depth: 1,
            multiview: !1
          },
          n
        )),
        (this.isRenderTarget = !0),
        (this.width = e),
        (this.height = t),
        (this.depth = n.depth),
        (this.scissor = new Ut(0, 0, e, t)),
        (this.scissorTest = !1),
        (this.viewport = new Ut(0, 0, e, t)),
        (this.textures = []));
      let r = new Ht({
          width: e,
          height: t,
          depth: n.depth
        }),
        i = n.count;
      for (let e = 0; e < i; e++)
        ((this.textures[e] = r.clone()),
          (this.textures[e].isRenderTargetTexture = !0),
          (this.textures[e].renderTarget = this));
      (this._setTextureOptions(n),
        (this.depthBuffer = n.depthBuffer),
        (this.stencilBuffer = n.stencilBuffer),
        (this.resolveDepthBuffer = n.resolveDepthBuffer),
        (this.resolveStencilBuffer = n.resolveStencilBuffer),
        (this._depthTexture = null),
        (this.depthTexture = n.depthTexture),
        (this.samples = n.samples),
        (this.multiview = n.multiview));
    }
    _setTextureOptions(e = {}) {
      let t = {
        minFilter: c,
        generateMipmaps: !1,
        flipY: !1,
        internalFormat: null
      };
      (e.mapping !== void 0 && (t.mapping = e.mapping),
        e.wrapS !== void 0 && (t.wrapS = e.wrapS),
        e.wrapT !== void 0 && (t.wrapT = e.wrapT),
        e.wrapR !== void 0 && (t.wrapR = e.wrapR),
        e.magFilter !== void 0 && (t.magFilter = e.magFilter),
        e.minFilter !== void 0 && (t.minFilter = e.minFilter),
        e.format !== void 0 && (t.format = e.format),
        e.type !== void 0 && (t.type = e.type),
        e.anisotropy !== void 0 && (t.anisotropy = e.anisotropy),
        e.colorSpace !== void 0 && (t.colorSpace = e.colorSpace),
        e.flipY !== void 0 && (t.flipY = e.flipY),
        e.generateMipmaps !== void 0 && (t.generateMipmaps = e.generateMipmaps),
        e.internalFormat !== void 0 && (t.internalFormat = e.internalFormat));
      for (let e = 0; e < this.textures.length; e++) this.textures[e].setValues(t);
    }
    get texture() {
      return this.textures[0];
    }
    set texture(e) {
      this.textures[0] = e;
    }
    set depthTexture(e) {
      (this._depthTexture !== null && (this._depthTexture.renderTarget = null),
        e !== null && (e.renderTarget = this),
        (this._depthTexture = e));
    }
    get depthTexture() {
      return this._depthTexture;
    }
    setSize(e, t, n = 1) {
      if (this.width !== e || this.height !== t || this.depth !== n) {
        ((this.width = e), (this.height = t), (this.depth = n));
        for (let r = 0, i = this.textures.length; r < i; r++)
          ((this.textures[r].image.width = e),
            (this.textures[r].image.height = t),
            (this.textures[r].image.depth = n),
            this.textures[r].isData3DTexture !== !0 &&
              (this.textures[r].isArrayTexture = this.textures[r].image.depth > 1));
        this.dispose();
      }
      (this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t));
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      ((this.width = e.width),
        (this.height = e.height),
        (this.depth = e.depth),
        this.scissor.copy(e.scissor),
        (this.scissorTest = e.scissorTest),
        this.viewport.copy(e.viewport),
        (this.textures.length = 0));
      for (let t = 0, n = e.textures.length; t < n; t++) {
        ((this.textures[t] = e.textures[t].clone()),
          (this.textures[t].isRenderTargetTexture = !0),
          (this.textures[t].renderTarget = this));
        let n = Object.assign({}, e.textures[t].image);
        this.textures[t].source = new Rt(n);
      }
      return (
        (this.depthBuffer = e.depthBuffer),
        (this.stencilBuffer = e.stencilBuffer),
        (this.resolveDepthBuffer = e.resolveDepthBuffer),
        (this.resolveStencilBuffer = e.resolveStencilBuffer),
        e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()),
        (this.samples = e.samples),
        (this.multiview = e.multiview),
        this
      );
    }
    dispose() {
      this.dispatchEvent({ type: 'dispose' });
    }
  },
  Gt = class extends Wt {
    constructor(e = 1, t = 1, n = {}) {
      (super(e, t, n), (this.isWebGLRenderTarget = !0));
    }
  },
  Kt = class extends Ht {
    constructor(e = null, t = 1, n = 1, i = 1) {
      (super(null),
        (this.isDataArrayTexture = !0),
        (this.image = {
          data: e,
          width: t,
          height: n,
          depth: i
        }),
        (this.magFilter = a),
        (this.minFilter = a),
        (this.wrapR = r),
        (this.generateMipmaps = !1),
        (this.flipY = !1),
        (this.unpackAlignment = 1),
        (this.layerUpdates = /* @__PURE__ */ new Set()));
    }
    addLayerUpdate(e) {
      this.layerUpdates.add(e);
    }
    clearLayerUpdates() {
      this.layerUpdates.clear();
    }
  },
  qt = class extends Ht {
    constructor(e = null, t = 1, n = 1, i = 1) {
      (super(null),
        (this.isData3DTexture = !0),
        (this.image = {
          data: e,
          width: t,
          height: n,
          depth: i
        }),
        (this.magFilter = a),
        (this.minFilter = a),
        (this.wrapR = r),
        (this.generateMipmaps = !1),
        (this.flipY = !1),
        (this.unpackAlignment = 1));
    }
  },
  Jt = class e {
    static {
      e.prototype.isMatrix4 = !0;
    }
    constructor(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) {
      ((this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        e !== void 0 && this.set(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h));
    }
    set(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) {
      let g = this.elements;
      return (
        (g[0] = e),
        (g[4] = t),
        (g[8] = n),
        (g[12] = r),
        (g[1] = i),
        (g[5] = a),
        (g[9] = o),
        (g[13] = s),
        (g[2] = c),
        (g[6] = l),
        (g[10] = u),
        (g[14] = d),
        (g[3] = f),
        (g[7] = p),
        (g[11] = m),
        (g[15] = h),
        this
      );
    }
    identity() {
      return (this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this);
    }
    clone() {
      return new e().fromArray(this.elements);
    }
    copy(e) {
      let t = this.elements,
        n = e.elements;
      return (
        (t[0] = n[0]),
        (t[1] = n[1]),
        (t[2] = n[2]),
        (t[3] = n[3]),
        (t[4] = n[4]),
        (t[5] = n[5]),
        (t[6] = n[6]),
        (t[7] = n[7]),
        (t[8] = n[8]),
        (t[9] = n[9]),
        (t[10] = n[10]),
        (t[11] = n[11]),
        (t[12] = n[12]),
        (t[13] = n[13]),
        (t[14] = n[14]),
        (t[15] = n[15]),
        this
      );
    }
    copyPosition(e) {
      let t = this.elements,
        n = e.elements;
      return ((t[12] = n[12]), (t[13] = n[13]), (t[14] = n[14]), this);
    }
    setFromMatrix3(e) {
      let t = e.elements;
      return (
        this.set(t[0], t[3], t[6], 0, t[1], t[4], t[7], 0, t[2], t[5], t[8], 0, 0, 0, 0, 1), this
      );
    }
    extractBasis(e, t, n) {
      return this.determinant() === 0
        ? (e.set(1, 0, 0), t.set(0, 1, 0), n.set(0, 0, 1), this)
        : (e.setFromMatrixColumn(this, 0),
          t.setFromMatrixColumn(this, 1),
          n.setFromMatrixColumn(this, 2),
          this);
    }
    makeBasis(e, t, n) {
      return (this.set(e.x, t.x, n.x, 0, e.y, t.y, n.y, 0, e.z, t.z, n.z, 0, 0, 0, 0, 1), this);
    }
    extractRotation(e) {
      if (e.determinant() === 0) return this.identity();
      let t = this.elements,
        n = e.elements,
        r = 1 / Yt.setFromMatrixColumn(e, 0).length(),
        i = 1 / Yt.setFromMatrixColumn(e, 1).length(),
        a = 1 / Yt.setFromMatrixColumn(e, 2).length();
      return (
        (t[0] = n[0] * r),
        (t[1] = n[1] * r),
        (t[2] = n[2] * r),
        (t[3] = 0),
        (t[4] = n[4] * i),
        (t[5] = n[5] * i),
        (t[6] = n[6] * i),
        (t[7] = 0),
        (t[8] = n[8] * a),
        (t[9] = n[9] * a),
        (t[10] = n[10] * a),
        (t[11] = 0),
        (t[12] = 0),
        (t[13] = 0),
        (t[14] = 0),
        (t[15] = 1),
        this
      );
    }
    makeRotationFromEuler(e) {
      let t = this.elements,
        n = e.x,
        r = e.y,
        i = e.z,
        a = Math.cos(n),
        o = Math.sin(n),
        s = Math.cos(r),
        c = Math.sin(r),
        l = Math.cos(i),
        u = Math.sin(i);
      if (e.order === 'XYZ') {
        let e = a * l,
          n = a * u,
          r = o * l,
          i = o * u;
        ((t[0] = s * l),
          (t[4] = -s * u),
          (t[8] = c),
          (t[1] = n + r * c),
          (t[5] = e - i * c),
          (t[9] = -o * s),
          (t[2] = i - e * c),
          (t[6] = r + n * c),
          (t[10] = a * s));
      } else if (e.order === 'YXZ') {
        let e = s * l,
          n = s * u,
          r = c * l,
          i = c * u;
        ((t[0] = e + i * o),
          (t[4] = r * o - n),
          (t[8] = a * c),
          (t[1] = a * u),
          (t[5] = a * l),
          (t[9] = -o),
          (t[2] = n * o - r),
          (t[6] = i + e * o),
          (t[10] = a * s));
      } else if (e.order === 'ZXY') {
        let e = s * l,
          n = s * u,
          r = c * l,
          i = c * u;
        ((t[0] = e - i * o),
          (t[4] = -a * u),
          (t[8] = r + n * o),
          (t[1] = n + r * o),
          (t[5] = a * l),
          (t[9] = i - e * o),
          (t[2] = -a * c),
          (t[6] = o),
          (t[10] = a * s));
      } else if (e.order === 'ZYX') {
        let e = a * l,
          n = a * u,
          r = o * l,
          i = o * u;
        ((t[0] = s * l),
          (t[4] = r * c - n),
          (t[8] = e * c + i),
          (t[1] = s * u),
          (t[5] = i * c + e),
          (t[9] = n * c - r),
          (t[2] = -c),
          (t[6] = o * s),
          (t[10] = a * s));
      } else if (e.order === 'YZX') {
        let e = a * s,
          n = a * c,
          r = o * s,
          i = o * c;
        ((t[0] = s * l),
          (t[4] = i - e * u),
          (t[8] = r * u + n),
          (t[1] = u),
          (t[5] = a * l),
          (t[9] = -o * l),
          (t[2] = -c * l),
          (t[6] = n * u + r),
          (t[10] = e - i * u));
      } else if (e.order === 'XZY') {
        let e = a * s,
          n = a * c,
          r = o * s,
          i = o * c;
        ((t[0] = s * l),
          (t[4] = -u),
          (t[8] = c * l),
          (t[1] = e * u + i),
          (t[5] = a * l),
          (t[9] = n * u - r),
          (t[2] = r * u - n),
          (t[6] = o * l),
          (t[10] = i * u + e));
      }
      return (
        (t[3] = 0),
        (t[7] = 0),
        (t[11] = 0),
        (t[12] = 0),
        (t[13] = 0),
        (t[14] = 0),
        (t[15] = 1),
        this
      );
    }
    makeRotationFromQuaternion(e) {
      return this.compose(Zt, e, Qt);
    }
    lookAt(e, t, n) {
      let r = this.elements;
      return (
        tn.subVectors(e, t),
        tn.lengthSq() === 0 && (tn.z = 1),
        tn.normalize(),
        $t.crossVectors(n, tn),
        $t.lengthSq() === 0 &&
          (Math.abs(n.z) === 1 ? (tn.x += 1e-4) : (tn.z += 1e-4),
          tn.normalize(),
          $t.crossVectors(n, tn)),
        $t.normalize(),
        en.crossVectors(tn, $t),
        (r[0] = $t.x),
        (r[4] = en.x),
        (r[8] = tn.x),
        (r[1] = $t.y),
        (r[5] = en.y),
        (r[9] = tn.y),
        (r[2] = $t.z),
        (r[6] = en.z),
        (r[10] = tn.z),
        this
      );
    }
    multiply(e) {
      return this.multiplyMatrices(this, e);
    }
    premultiply(e) {
      return this.multiplyMatrices(e, this);
    }
    multiplyMatrices(e, t) {
      let n = e.elements,
        r = t.elements,
        i = this.elements,
        a = n[0],
        o = n[4],
        s = n[8],
        c = n[12],
        l = n[1],
        u = n[5],
        d = n[9],
        f = n[13],
        p = n[2],
        m = n[6],
        h = n[10],
        g = n[14],
        _ = n[3],
        v = n[7],
        y = n[11],
        b = n[15],
        x = r[0],
        S = r[4],
        C = r[8],
        w = r[12],
        T = r[1],
        E = r[5],
        D = r[9],
        O = r[13],
        k = r[2],
        A = r[6],
        j = r[10],
        M = r[14],
        N = r[3],
        P = r[7],
        F = r[11],
        I = r[15];
      return (
        (i[0] = a * x + o * T + s * k + c * N),
        (i[4] = a * S + o * E + s * A + c * P),
        (i[8] = a * C + o * D + s * j + c * F),
        (i[12] = a * w + o * O + s * M + c * I),
        (i[1] = l * x + u * T + d * k + f * N),
        (i[5] = l * S + u * E + d * A + f * P),
        (i[9] = l * C + u * D + d * j + f * F),
        (i[13] = l * w + u * O + d * M + f * I),
        (i[2] = p * x + m * T + h * k + g * N),
        (i[6] = p * S + m * E + h * A + g * P),
        (i[10] = p * C + m * D + h * j + g * F),
        (i[14] = p * w + m * O + h * M + g * I),
        (i[3] = _ * x + v * T + y * k + b * N),
        (i[7] = _ * S + v * E + y * A + b * P),
        (i[11] = _ * C + v * D + y * j + b * F),
        (i[15] = _ * w + v * O + y * M + b * I),
        this
      );
    }
    multiplyScalar(e) {
      let t = this.elements;
      return (
        (t[0] *= e),
        (t[4] *= e),
        (t[8] *= e),
        (t[12] *= e),
        (t[1] *= e),
        (t[5] *= e),
        (t[9] *= e),
        (t[13] *= e),
        (t[2] *= e),
        (t[6] *= e),
        (t[10] *= e),
        (t[14] *= e),
        (t[3] *= e),
        (t[7] *= e),
        (t[11] *= e),
        (t[15] *= e),
        this
      );
    }
    determinant() {
      let e = this.elements,
        t = e[0],
        n = e[4],
        r = e[8],
        i = e[12],
        a = e[1],
        o = e[5],
        s = e[9],
        c = e[13],
        l = e[2],
        u = e[6],
        d = e[10],
        f = e[14],
        p = e[3],
        m = e[7],
        h = e[11],
        g = e[15],
        _ = s * f - c * d,
        v = o * f - c * u,
        y = o * d - s * u,
        b = a * f - c * l,
        x = a * d - s * l,
        S = a * u - o * l;
      return (
        t * (m * _ - h * v + g * y) -
        n * (p * _ - h * b + g * x) +
        r * (p * v - m * b + g * S) -
        i * (p * y - m * x + h * S)
      );
    }
    transpose() {
      let e = this.elements,
        t;
      return (
        (t = e[1]),
        (e[1] = e[4]),
        (e[4] = t),
        (t = e[2]),
        (e[2] = e[8]),
        (e[8] = t),
        (t = e[6]),
        (e[6] = e[9]),
        (e[9] = t),
        (t = e[3]),
        (e[3] = e[12]),
        (e[12] = t),
        (t = e[7]),
        (e[7] = e[13]),
        (e[13] = t),
        (t = e[11]),
        (e[11] = e[14]),
        (e[14] = t),
        this
      );
    }
    setPosition(e, t, n) {
      let r = this.elements;
      return (
        e.isVector3
          ? ((r[12] = e.x), (r[13] = e.y), (r[14] = e.z))
          : ((r[12] = e), (r[13] = t), (r[14] = n)),
        this
      );
    }
    invert() {
      let e = this.elements,
        t = e[0],
        n = e[1],
        r = e[2],
        i = e[3],
        a = e[4],
        o = e[5],
        s = e[6],
        c = e[7],
        l = e[8],
        u = e[9],
        d = e[10],
        f = e[11],
        p = e[12],
        m = e[13],
        h = e[14],
        g = e[15],
        _ = t * o - n * a,
        v = t * s - r * a,
        y = t * c - i * a,
        b = n * s - r * o,
        x = n * c - i * o,
        S = r * c - i * s,
        C = l * m - u * p,
        w = l * h - d * p,
        T = l * g - f * p,
        E = u * h - d * m,
        D = u * g - f * m,
        O = d * g - f * h,
        k = _ * O - v * D + y * E + b * T - x * w + S * C;
      if (k === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      let A = 1 / k;
      return (
        (e[0] = (o * O - s * D + c * E) * A),
        (e[1] = (r * D - n * O - i * E) * A),
        (e[2] = (m * S - h * x + g * b) * A),
        (e[3] = (d * x - u * S - f * b) * A),
        (e[4] = (s * T - a * O - c * w) * A),
        (e[5] = (t * O - r * T + i * w) * A),
        (e[6] = (h * y - p * S - g * v) * A),
        (e[7] = (l * S - d * y + f * v) * A),
        (e[8] = (a * D - o * T + c * C) * A),
        (e[9] = (n * T - t * D - i * C) * A),
        (e[10] = (p * x - m * y + g * _) * A),
        (e[11] = (u * y - l * x - f * _) * A),
        (e[12] = (o * w - a * E - s * C) * A),
        (e[13] = (t * E - n * w + r * C) * A),
        (e[14] = (m * v - p * b - h * _) * A),
        (e[15] = (l * b - u * v + d * _) * A),
        this
      );
    }
    scale(e) {
      let t = this.elements,
        n = e.x,
        r = e.y,
        i = e.z;
      return (
        (t[0] *= n),
        (t[4] *= r),
        (t[8] *= i),
        (t[1] *= n),
        (t[5] *= r),
        (t[9] *= i),
        (t[2] *= n),
        (t[6] *= r),
        (t[10] *= i),
        (t[3] *= n),
        (t[7] *= r),
        (t[11] *= i),
        this
      );
    }
    getMaxScaleOnAxis() {
      let e = this.elements,
        t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
        n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6],
        r = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
      return Math.sqrt(Math.max(t, n, r));
    }
    makeTranslation(e, t, n) {
      return (
        e.isVector3
          ? this.set(1, 0, 0, e.x, 0, 1, 0, e.y, 0, 0, 1, e.z, 0, 0, 0, 1)
          : this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, n, 0, 0, 0, 1),
        this
      );
    }
    makeRotationX(e) {
      let t = Math.cos(e),
        n = Math.sin(e);
      return (this.set(1, 0, 0, 0, 0, t, -n, 0, 0, n, t, 0, 0, 0, 0, 1), this);
    }
    makeRotationY(e) {
      let t = Math.cos(e),
        n = Math.sin(e);
      return (this.set(t, 0, n, 0, 0, 1, 0, 0, -n, 0, t, 0, 0, 0, 0, 1), this);
    }
    makeRotationZ(e) {
      let t = Math.cos(e),
        n = Math.sin(e);
      return (this.set(t, -n, 0, 0, n, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this);
    }
    makeRotationAxis(e, t) {
      let n = Math.cos(t),
        r = Math.sin(t),
        i = 1 - n,
        a = e.x,
        o = e.y,
        s = e.z,
        c = i * a,
        l = i * o;
      return (
        this.set(
          c * a + n,
          c * o - r * s,
          c * s + r * o,
          0,
          c * o + r * s,
          l * o + n,
          l * s - r * a,
          0,
          c * s - r * o,
          l * s + r * a,
          i * s * s + n,
          0,
          0,
          0,
          0,
          1
        ),
        this
      );
    }
    makeScale(e, t, n) {
      return (this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this);
    }
    makeShear(e, t, n, r, i, a) {
      return (this.set(1, n, i, 0, e, 1, a, 0, t, r, 1, 0, 0, 0, 0, 1), this);
    }
    compose(e, t, n) {
      let r = this.elements,
        i = t._x,
        a = t._y,
        o = t._z,
        s = t._w,
        c = i + i,
        l = a + a,
        u = o + o,
        d = i * c,
        f = i * l,
        p = i * u,
        m = a * l,
        h = a * u,
        g = o * u,
        _ = s * c,
        v = s * l,
        y = s * u,
        b = n.x,
        x = n.y,
        S = n.z;
      return (
        (r[0] = (1 - (m + g)) * b),
        (r[1] = (f + y) * b),
        (r[2] = (p - v) * b),
        (r[3] = 0),
        (r[4] = (f - y) * x),
        (r[5] = (1 - (d + g)) * x),
        (r[6] = (h + _) * x),
        (r[7] = 0),
        (r[8] = (p + v) * S),
        (r[9] = (h - _) * S),
        (r[10] = (1 - (d + m)) * S),
        (r[11] = 0),
        (r[12] = e.x),
        (r[13] = e.y),
        (r[14] = e.z),
        (r[15] = 1),
        this
      );
    }
    decompose(e, t, n) {
      let r = this.elements;
      ((e.x = r[12]), (e.y = r[13]), (e.z = r[14]));
      let i = this.determinant();
      if (i === 0) return (n.set(1, 1, 1), t.identity(), this);
      let a = Yt.set(r[0], r[1], r[2]).length(),
        o = Yt.set(r[4], r[5], r[6]).length(),
        s = Yt.set(r[8], r[9], r[10]).length();
      (i < 0 && (a = -a), Xt.copy(this));
      let c = 1 / a,
        l = 1 / o,
        u = 1 / s;
      return (
        (Xt.elements[0] *= c),
        (Xt.elements[1] *= c),
        (Xt.elements[2] *= c),
        (Xt.elements[4] *= l),
        (Xt.elements[5] *= l),
        (Xt.elements[6] *= l),
        (Xt.elements[8] *= u),
        (Xt.elements[9] *= u),
        (Xt.elements[10] *= u),
        t.setFromRotationMatrix(Xt),
        (n.x = a),
        (n.y = o),
        (n.z = s),
        this
      );
    }
    makePerspective(e, t, n, r, i, a, o = Be, s = !1) {
      let c = this.elements,
        l = (2 * i) / (t - e),
        u = (2 * i) / (n - r),
        d = (t + e) / (t - e),
        f = (n + r) / (n - r),
        p,
        m;
      if (s) ((p = i / (a - i)), (m = (a * i) / (a - i)));
      else if (o === 2e3) ((p = -(a + i) / (a - i)), (m = (-2 * a * i) / (a - i)));
      else if (o === 2001) ((p = -a / (a - i)), (m = (-a * i) / (a - i)));
      else throw Error('THREE.Matrix4.makePerspective(): Invalid coordinate system: ' + o);
      return (
        (c[0] = l),
        (c[4] = 0),
        (c[8] = d),
        (c[12] = 0),
        (c[1] = 0),
        (c[5] = u),
        (c[9] = f),
        (c[13] = 0),
        (c[2] = 0),
        (c[6] = 0),
        (c[10] = p),
        (c[14] = m),
        (c[3] = 0),
        (c[7] = 0),
        (c[11] = -1),
        (c[15] = 0),
        this
      );
    }
    makeOrthographic(e, t, n, r, i, a, o = Be, s = !1) {
      let c = this.elements,
        l = 2 / (t - e),
        u = 2 / (n - r),
        d = -(t + e) / (t - e),
        f = -(n + r) / (n - r),
        p,
        m;
      if (s) ((p = 1 / (a - i)), (m = a / (a - i)));
      else if (o === 2e3) ((p = -2 / (a - i)), (m = -(a + i) / (a - i)));
      else if (o === 2001) ((p = -1 / (a - i)), (m = -i / (a - i)));
      else throw Error('THREE.Matrix4.makeOrthographic(): Invalid coordinate system: ' + o);
      return (
        (c[0] = l),
        (c[4] = 0),
        (c[8] = 0),
        (c[12] = d),
        (c[1] = 0),
        (c[5] = u),
        (c[9] = 0),
        (c[13] = f),
        (c[2] = 0),
        (c[6] = 0),
        (c[10] = p),
        (c[14] = m),
        (c[3] = 0),
        (c[7] = 0),
        (c[11] = 0),
        (c[15] = 1),
        this
      );
    }
    equals(e) {
      let t = this.elements,
        n = e.elements;
      for (let e = 0; e < 16; e++) if (t[e] !== n[e]) return !1;
      return !0;
    }
    fromArray(e, t = 0) {
      for (let n = 0; n < 16; n++) this.elements[n] = e[n + t];
      return this;
    }
    toArray(e = [], t = 0) {
      let n = this.elements;
      return (
        (e[t] = n[0]),
        (e[t + 1] = n[1]),
        (e[t + 2] = n[2]),
        (e[t + 3] = n[3]),
        (e[t + 4] = n[4]),
        (e[t + 5] = n[5]),
        (e[t + 6] = n[6]),
        (e[t + 7] = n[7]),
        (e[t + 8] = n[8]),
        (e[t + 9] = n[9]),
        (e[t + 10] = n[10]),
        (e[t + 11] = n[11]),
        (e[t + 12] = n[12]),
        (e[t + 13] = n[13]),
        (e[t + 14] = n[14]),
        (e[t + 15] = n[15]),
        e
      );
    }
  },
  Yt = /*@__PURE__*/ new J(),
  Xt = /*@__PURE__*/ new Jt(),
  Zt = /*@__PURE__*/ new J(0, 0, 0),
  Qt = /*@__PURE__*/ new J(1, 1, 1),
  $t = /*@__PURE__*/ new J(),
  en = /*@__PURE__*/ new J(),
  tn = /*@__PURE__*/ new J(),
  nn = /*@__PURE__*/ new Jt(),
  rn = /*@__PURE__*/ new Tt(),
  an = class e {
    constructor(t = 0, n = 0, r = 0, i = e.DEFAULT_ORDER) {
      ((this.isEuler = !0), (this._x = t), (this._y = n), (this._z = r), (this._order = i));
    }
    get x() {
      return this._x;
    }
    set x(e) {
      ((this._x = e), this._onChangeCallback());
    }
    get y() {
      return this._y;
    }
    set y(e) {
      ((this._y = e), this._onChangeCallback());
    }
    get z() {
      return this._z;
    }
    set z(e) {
      ((this._z = e), this._onChangeCallback());
    }
    get order() {
      return this._order;
    }
    set order(e) {
      ((this._order = e), this._onChangeCallback());
    }
    set(e, t, n, r = this._order) {
      return (
        (this._x = e),
        (this._y = t),
        (this._z = n),
        (this._order = r),
        this._onChangeCallback(),
        this
      );
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._order);
    }
    copy(e) {
      return (
        (this._x = e._x),
        (this._y = e._y),
        (this._z = e._z),
        (this._order = e._order),
        this._onChangeCallback(),
        this
      );
    }
    setFromRotationMatrix(e, t = this._order, n = !0) {
      let r = e.elements,
        i = r[0],
        a = r[4],
        o = r[8],
        s = r[1],
        c = r[5],
        l = r[9],
        u = r[2],
        d = r[6],
        f = r[10];
      switch (t) {
        case 'XYZ':
          ((this._y = Math.asin(K(o, -1, 1))),
            Math.abs(o) < 0.9999999
              ? ((this._x = Math.atan2(-l, f)), (this._z = Math.atan2(-a, i)))
              : ((this._x = Math.atan2(d, c)), (this._z = 0)));
          break;
        case 'YXZ':
          ((this._x = Math.asin(-K(l, -1, 1))),
            Math.abs(l) < 0.9999999
              ? ((this._y = Math.atan2(o, f)), (this._z = Math.atan2(s, c)))
              : ((this._y = Math.atan2(-u, i)), (this._z = 0)));
          break;
        case 'ZXY':
          ((this._x = Math.asin(K(d, -1, 1))),
            Math.abs(d) < 0.9999999
              ? ((this._y = Math.atan2(-u, f)), (this._z = Math.atan2(-a, c)))
              : ((this._y = 0), (this._z = Math.atan2(s, i))));
          break;
        case 'ZYX':
          ((this._y = Math.asin(-K(u, -1, 1))),
            Math.abs(u) < 0.9999999
              ? ((this._x = Math.atan2(d, f)), (this._z = Math.atan2(s, i)))
              : ((this._x = 0), (this._z = Math.atan2(-a, c))));
          break;
        case 'YZX':
          ((this._z = Math.asin(K(s, -1, 1))),
            Math.abs(s) < 0.9999999
              ? ((this._x = Math.atan2(-l, c)), (this._y = Math.atan2(-u, i)))
              : ((this._x = 0), (this._y = Math.atan2(o, f))));
          break;
        case 'XZY':
          ((this._z = Math.asin(-K(a, -1, 1))),
            Math.abs(a) < 0.9999999
              ? ((this._x = Math.atan2(d, c)), (this._y = Math.atan2(o, i)))
              : ((this._x = Math.atan2(-l, f)), (this._y = 0)));
          break;
        default:
          W('Euler: .setFromRotationMatrix() encountered an unknown order: ' + t);
      }
      return ((this._order = t), n === !0 && this._onChangeCallback(), this);
    }
    setFromQuaternion(e, t, n) {
      return (nn.makeRotationFromQuaternion(e), this.setFromRotationMatrix(nn, t, n));
    }
    setFromVector3(e, t = this._order) {
      return this.set(e.x, e.y, e.z, t);
    }
    reorder(e) {
      return (rn.setFromEuler(this), this.setFromQuaternion(rn, e));
    }
    equals(e) {
      return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
    }
    fromArray(e) {
      return (
        (this._x = e[0]),
        (this._y = e[1]),
        (this._z = e[2]),
        e[3] !== void 0 && (this._order = e[3]),
        this._onChangeCallback(),
        this
      );
    }
    toArray(e = [], t = 0) {
      return (
        (e[t] = this._x), (e[t + 1] = this._y), (e[t + 2] = this._z), (e[t + 3] = this._order), e
      );
    }
    _onChange(e) {
      return ((this._onChangeCallback = e), this);
    }
    _onChangeCallback() {}
    *[Symbol.iterator]() {
      (yield this._x, yield this._y, yield this._z, yield this._order);
    }
  };
an.DEFAULT_ORDER = 'XYZ';
var on = class {
    constructor() {
      this.mask = 1;
    }
    set(e) {
      this.mask = ((1 << e) | 0) >>> 0;
    }
    enable(e) {
      this.mask |= (1 << e) | 0;
    }
    enableAll() {
      this.mask = -1;
    }
    toggle(e) {
      this.mask ^= (1 << e) | 0;
    }
    disable(e) {
      this.mask &= ~((1 << e) | 0);
    }
    disableAll() {
      this.mask = 0;
    }
    test(e) {
      return (this.mask & e.mask) !== 0;
    }
    isEnabled(e) {
      return (this.mask & ((1 << e) | 0)) != 0;
    }
  },
  sn = 0,
  cn = /*@__PURE__*/ new J(),
  ln = /*@__PURE__*/ new Tt(),
  un = /*@__PURE__*/ new Jt(),
  dn = /*@__PURE__*/ new J(),
  fn = /*@__PURE__*/ new J(),
  pn = /*@__PURE__*/ new J(),
  mn = /*@__PURE__*/ new Tt(),
  hn = /*@__PURE__*/ new J(1, 0, 0),
  gn = /*@__PURE__*/ new J(0, 1, 0),
  _n = /*@__PURE__*/ new J(0, 0, 1),
  vn = { type: 'added' },
  yn = { type: 'removed' },
  bn = {
    type: 'childadded',
    child: null
  },
  xn = {
    type: 'childremoved',
    child: null
  },
  Sn = class e extends Qe {
    constructor() {
      (super(),
        (this.isObject3D = !0),
        Object.defineProperty(this, 'id', { value: sn++ }),
        (this.uuid = rt()),
        (this.name = ''),
        (this.type = 'Object3D'),
        (this.parent = null),
        (this.children = []),
        (this.up = e.DEFAULT_UP.clone()));
      let t = new J(),
        n = new an(),
        r = new Tt(),
        i = new J(1, 1, 1);
      function a() {
        r.setFromEuler(n, !1);
      }
      function o() {
        n.setFromQuaternion(r, void 0, !1);
      }
      (n._onChange(a),
        r._onChange(o),
        Object.defineProperties(this, {
          position: {
            configurable: !0,
            enumerable: !0,
            value: t
          },
          rotation: {
            configurable: !0,
            enumerable: !0,
            value: n
          },
          quaternion: {
            configurable: !0,
            enumerable: !0,
            value: r
          },
          scale: {
            configurable: !0,
            enumerable: !0,
            value: i
          },
          modelViewMatrix: { value: new Jt() },
          normalMatrix: { value: new Y() }
        }),
        (this.matrix = new Jt()),
        (this.matrixWorld = new Jt()),
        (this.matrixAutoUpdate = e.DEFAULT_MATRIX_AUTO_UPDATE),
        (this.matrixWorldAutoUpdate = e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE),
        (this.matrixWorldNeedsUpdate = !1),
        (this.layers = new on()),
        (this.visible = !0),
        (this.castShadow = !1),
        (this.receiveShadow = !1),
        (this.frustumCulled = !0),
        (this.renderOrder = 0),
        (this.animations = []),
        (this.customDepthMaterial = void 0),
        (this.customDistanceMaterial = void 0),
        (this.static = !1),
        (this.userData = {}),
        (this.pivot = null));
    }
    onBeforeShadow() {}
    onAfterShadow() {}
    onBeforeRender() {}
    onAfterRender() {}
    applyMatrix4(e) {
      (this.matrixAutoUpdate && this.updateMatrix(),
        this.matrix.premultiply(e),
        this.matrix.decompose(this.position, this.quaternion, this.scale));
    }
    applyQuaternion(e) {
      return (this.quaternion.premultiply(e), this);
    }
    setRotationFromAxisAngle(e, t) {
      this.quaternion.setFromAxisAngle(e, t);
    }
    setRotationFromEuler(e) {
      this.quaternion.setFromEuler(e, !0);
    }
    setRotationFromMatrix(e) {
      this.quaternion.setFromRotationMatrix(e);
    }
    setRotationFromQuaternion(e) {
      this.quaternion.copy(e);
    }
    rotateOnAxis(e, t) {
      return (ln.setFromAxisAngle(e, t), this.quaternion.multiply(ln), this);
    }
    rotateOnWorldAxis(e, t) {
      return (ln.setFromAxisAngle(e, t), this.quaternion.premultiply(ln), this);
    }
    rotateX(e) {
      return this.rotateOnAxis(hn, e);
    }
    rotateY(e) {
      return this.rotateOnAxis(gn, e);
    }
    rotateZ(e) {
      return this.rotateOnAxis(_n, e);
    }
    translateOnAxis(e, t) {
      return (
        cn.copy(e).applyQuaternion(this.quaternion), this.position.add(cn.multiplyScalar(t)), this
      );
    }
    translateX(e) {
      return this.translateOnAxis(hn, e);
    }
    translateY(e) {
      return this.translateOnAxis(gn, e);
    }
    translateZ(e) {
      return this.translateOnAxis(_n, e);
    }
    localToWorld(e) {
      return (this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld));
    }
    worldToLocal(e) {
      return (this.updateWorldMatrix(!0, !1), e.applyMatrix4(un.copy(this.matrixWorld).invert()));
    }
    lookAt(e, t, n) {
      e.isVector3 ? dn.copy(e) : dn.set(e, t, n);
      let r = this.parent;
      (this.updateWorldMatrix(!0, !1),
        fn.setFromMatrixPosition(this.matrixWorld),
        this.isCamera || this.isLight ? un.lookAt(fn, dn, this.up) : un.lookAt(dn, fn, this.up),
        this.quaternion.setFromRotationMatrix(un),
        r &&
          (un.extractRotation(r.matrixWorld),
          ln.setFromRotationMatrix(un),
          this.quaternion.premultiply(ln.invert())));
    }
    add(e) {
      if (arguments.length > 1) {
        for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
        return this;
      }
      return e === this
        ? (G("Object3D.add: object can't be added as a child of itself.", e), this)
        : (e && e.isObject3D
            ? (e.removeFromParent(),
              (e.parent = this),
              this.children.push(e),
              e.dispatchEvent(vn),
              (bn.child = e),
              this.dispatchEvent(bn),
              (bn.child = null))
            : G('Object3D.add: object not an instance of THREE.Object3D.', e),
          this);
    }
    remove(e) {
      if (arguments.length > 1) {
        for (let e = 0; e < arguments.length; e++) this.remove(arguments[e]);
        return this;
      }
      let t = this.children.indexOf(e);
      return (
        t !== -1 &&
          ((e.parent = null),
          this.children.splice(t, 1),
          e.dispatchEvent(yn),
          (xn.child = e),
          this.dispatchEvent(xn),
          (xn.child = null)),
        this
      );
    }
    removeFromParent() {
      let e = this.parent;
      return (e !== null && e.remove(this), this);
    }
    clear() {
      return this.remove(...this.children);
    }
    attach(e) {
      return (
        this.updateWorldMatrix(!0, !1),
        un.copy(this.matrixWorld).invert(),
        e.parent !== null &&
          (e.parent.updateWorldMatrix(!0, !1), un.multiply(e.parent.matrixWorld)),
        e.applyMatrix4(un),
        e.removeFromParent(),
        (e.parent = this),
        this.children.push(e),
        e.updateWorldMatrix(!1, !0),
        e.dispatchEvent(vn),
        (bn.child = e),
        this.dispatchEvent(bn),
        (bn.child = null),
        this
      );
    }
    getObjectById(e) {
      return this.getObjectByProperty('id', e);
    }
    getObjectByName(e) {
      return this.getObjectByProperty('name', e);
    }
    getObjectByProperty(e, t) {
      if (this[e] === t) return this;
      for (let n = 0, r = this.children.length; n < r; n++) {
        let r = this.children[n].getObjectByProperty(e, t);
        if (r !== void 0) return r;
      }
    }
    getObjectsByProperty(e, t, n = []) {
      this[e] === t && n.push(this);
      let r = this.children;
      for (let i = 0, a = r.length; i < a; i++) r[i].getObjectsByProperty(e, t, n);
      return n;
    }
    getWorldPosition(e) {
      return (this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld));
    }
    getWorldQuaternion(e) {
      return (this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(fn, e, pn), e);
    }
    getWorldScale(e) {
      return (this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(fn, mn, e), e);
    }
    getWorldDirection(e) {
      this.updateWorldMatrix(!0, !1);
      let t = this.matrixWorld.elements;
      return e.set(t[8], t[9], t[10]).normalize();
    }
    raycast() {}
    traverse(e) {
      e(this);
      let t = this.children;
      for (let n = 0, r = t.length; n < r; n++) t[n].traverse(e);
    }
    traverseVisible(e) {
      if (this.visible === !1) return;
      e(this);
      let t = this.children;
      for (let n = 0, r = t.length; n < r; n++) t[n].traverseVisible(e);
    }
    traverseAncestors(e) {
      let t = this.parent;
      t !== null && (e(t), t.traverseAncestors(e));
    }
    updateMatrix() {
      this.matrix.compose(this.position, this.quaternion, this.scale);
      let e = this.pivot;
      if (e !== null) {
        let t = e.x,
          n = e.y,
          r = e.z,
          i = this.matrix.elements;
        ((i[12] += t - i[0] * t - i[4] * n - i[8] * r),
          (i[13] += n - i[1] * t - i[5] * n - i[9] * r),
          (i[14] += r - i[2] * t - i[6] * n - i[10] * r));
      }
      this.matrixWorldNeedsUpdate = !0;
    }
    updateMatrixWorld(e) {
      (this.matrixAutoUpdate && this.updateMatrix(),
        (this.matrixWorldNeedsUpdate || e) &&
          (this.matrixWorldAutoUpdate === !0 &&
            (this.parent === null
              ? this.matrixWorld.copy(this.matrix)
              : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)),
          (this.matrixWorldNeedsUpdate = !1),
          (e = !0)));
      let t = this.children;
      for (let n = 0, r = t.length; n < r; n++) t[n].updateMatrixWorld(e);
    }
    updateWorldMatrix(e, t) {
      let n = this.parent;
      if (
        (e === !0 && n !== null && n.updateWorldMatrix(!0, !1),
        this.matrixAutoUpdate && this.updateMatrix(),
        this.matrixWorldAutoUpdate === !0 &&
          (this.parent === null
            ? this.matrixWorld.copy(this.matrix)
            : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)),
        t === !0)
      ) {
        let e = this.children;
        for (let t = 0, n = e.length; t < n; t++) e[t].updateWorldMatrix(!1, !0);
      }
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == 'string',
        n = {};
      t &&
        ((e = {
          geometries: {},
          materials: {},
          textures: {},
          images: {},
          shapes: {},
          skeletons: {},
          animations: {},
          nodes: {}
        }),
        (n.metadata = {
          version: 4.7,
          type: 'Object',
          generator: 'Object3D.toJSON'
        }));
      let r = {};
      ((r.uuid = this.uuid),
        (r.type = this.type),
        this.name !== '' && (r.name = this.name),
        this.castShadow === !0 && (r.castShadow = !0),
        this.receiveShadow === !0 && (r.receiveShadow = !0),
        this.visible === !1 && (r.visible = !1),
        this.frustumCulled === !1 && (r.frustumCulled = !1),
        this.renderOrder !== 0 && (r.renderOrder = this.renderOrder),
        this.static !== !1 && (r.static = this.static),
        Object.keys(this.userData).length > 0 && (r.userData = this.userData),
        (r.layers = this.layers.mask),
        (r.matrix = this.matrix.toArray()),
        (r.up = this.up.toArray()),
        this.pivot !== null && (r.pivot = this.pivot.toArray()),
        this.matrixAutoUpdate === !1 && (r.matrixAutoUpdate = !1),
        this.morphTargetDictionary !== void 0 &&
          (r.morphTargetDictionary = Object.assign({}, this.morphTargetDictionary)),
        this.morphTargetInfluences !== void 0 &&
          (r.morphTargetInfluences = this.morphTargetInfluences.slice()),
        this.isInstancedMesh &&
          ((r.type = 'InstancedMesh'),
          (r.count = this.count),
          (r.instanceMatrix = this.instanceMatrix.toJSON()),
          this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())),
        this.isBatchedMesh &&
          ((r.type = 'BatchedMesh'),
          (r.perObjectFrustumCulled = this.perObjectFrustumCulled),
          (r.sortObjects = this.sortObjects),
          (r.drawRanges = this._drawRanges),
          (r.reservedRanges = this._reservedRanges),
          (r.geometryInfo = this._geometryInfo.map((e) => ({
            ...e,
            boundingBox: e.boundingBox ? e.boundingBox.toJSON() : void 0,
            boundingSphere: e.boundingSphere ? e.boundingSphere.toJSON() : void 0
          }))),
          (r.instanceInfo = this._instanceInfo.map((e) => ({ ...e }))),
          (r.availableInstanceIds = this._availableInstanceIds.slice()),
          (r.availableGeometryIds = this._availableGeometryIds.slice()),
          (r.nextIndexStart = this._nextIndexStart),
          (r.nextVertexStart = this._nextVertexStart),
          (r.geometryCount = this._geometryCount),
          (r.maxInstanceCount = this._maxInstanceCount),
          (r.maxVertexCount = this._maxVertexCount),
          (r.maxIndexCount = this._maxIndexCount),
          (r.geometryInitialized = this._geometryInitialized),
          (r.matricesTexture = this._matricesTexture.toJSON(e)),
          (r.indirectTexture = this._indirectTexture.toJSON(e)),
          this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(e)),
          this.boundingSphere !== null && (r.boundingSphere = this.boundingSphere.toJSON()),
          this.boundingBox !== null && (r.boundingBox = this.boundingBox.toJSON())));
      function i(t, n) {
        return (t[n.uuid] === void 0 && (t[n.uuid] = n.toJSON(e)), n.uuid);
      }
      if (this.isScene)
        (this.background &&
          (this.background.isColor
            ? (r.background = this.background.toJSON())
            : this.background.isTexture && (r.background = this.background.toJSON(e).uuid)),
          this.environment &&
            this.environment.isTexture &&
            this.environment.isRenderTargetTexture !== !0 &&
            (r.environment = this.environment.toJSON(e).uuid));
      else if (this.isMesh || this.isLine || this.isPoints) {
        r.geometry = i(e.geometries, this.geometry);
        let t = this.geometry.parameters;
        if (t !== void 0 && t.shapes !== void 0) {
          let n = t.shapes;
          if (Array.isArray(n))
            for (let t = 0, r = n.length; t < r; t++) {
              let r = n[t];
              i(e.shapes, r);
            }
          else i(e.shapes, n);
        }
      }
      if (
        (this.isSkinnedMesh &&
          ((r.bindMode = this.bindMode),
          (r.bindMatrix = this.bindMatrix.toArray()),
          this.skeleton !== void 0 &&
            (i(e.skeletons, this.skeleton), (r.skeleton = this.skeleton.uuid))),
        this.material !== void 0)
      )
        if (Array.isArray(this.material)) {
          let t = [];
          for (let n = 0, r = this.material.length; n < r; n++)
            t.push(i(e.materials, this.material[n]));
          r.material = t;
        } else r.material = i(e.materials, this.material);
      if (this.children.length > 0) {
        r.children = [];
        for (let t = 0; t < this.children.length; t++)
          r.children.push(this.children[t].toJSON(e).object);
      }
      if (this.animations.length > 0) {
        r.animations = [];
        for (let t = 0; t < this.animations.length; t++) {
          let n = this.animations[t];
          r.animations.push(i(e.animations, n));
        }
      }
      if (t) {
        let t = a(e.geometries),
          r = a(e.materials),
          i = a(e.textures),
          o = a(e.images),
          s = a(e.shapes),
          c = a(e.skeletons),
          l = a(e.animations),
          u = a(e.nodes);
        (t.length > 0 && (n.geometries = t),
          r.length > 0 && (n.materials = r),
          i.length > 0 && (n.textures = i),
          o.length > 0 && (n.images = o),
          s.length > 0 && (n.shapes = s),
          c.length > 0 && (n.skeletons = c),
          l.length > 0 && (n.animations = l),
          u.length > 0 && (n.nodes = u));
      }
      return ((n.object = r), n);
      function a(e) {
        let t = [];
        for (let n in e) {
          let r = e[n];
          (delete r.metadata, t.push(r));
        }
        return t;
      }
    }
    clone(e) {
      return new this.constructor().copy(this, e);
    }
    copy(e, t = !0) {
      if (
        ((this.name = e.name),
        this.up.copy(e.up),
        this.position.copy(e.position),
        (this.rotation.order = e.rotation.order),
        this.quaternion.copy(e.quaternion),
        this.scale.copy(e.scale),
        (this.pivot = e.pivot === null ? null : e.pivot.clone()),
        this.matrix.copy(e.matrix),
        this.matrixWorld.copy(e.matrixWorld),
        (this.matrixAutoUpdate = e.matrixAutoUpdate),
        (this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate),
        (this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate),
        (this.layers.mask = e.layers.mask),
        (this.visible = e.visible),
        (this.castShadow = e.castShadow),
        (this.receiveShadow = e.receiveShadow),
        (this.frustumCulled = e.frustumCulled),
        (this.renderOrder = e.renderOrder),
        (this.static = e.static),
        (this.animations = e.animations.slice()),
        (this.userData = JSON.parse(JSON.stringify(e.userData))),
        t === !0)
      )
        for (let t = 0; t < e.children.length; t++) {
          let n = e.children[t];
          this.add(n.clone());
        }
      return this;
    }
  };
((Sn.DEFAULT_UP = /*@__PURE__*/ new J(0, 1, 0)),
  (Sn.DEFAULT_MATRIX_AUTO_UPDATE = !0),
  (Sn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0));
var Cn = class extends Sn {
    constructor() {
      (super(), (this.isGroup = !0), (this.type = 'Group'));
    }
  },
  wn = { type: 'move' },
  Tn = class {
    constructor() {
      ((this._targetRay = null), (this._grip = null), (this._hand = null));
    }
    getHandSpace() {
      return (
        this._hand === null &&
          ((this._hand = new Cn()),
          (this._hand.matrixAutoUpdate = !1),
          (this._hand.visible = !1),
          (this._hand.joints = {}),
          (this._hand.inputState = { pinching: !1 })),
        this._hand
      );
    }
    getTargetRaySpace() {
      return (
        this._targetRay === null &&
          ((this._targetRay = new Cn()),
          (this._targetRay.matrixAutoUpdate = !1),
          (this._targetRay.visible = !1),
          (this._targetRay.hasLinearVelocity = !1),
          (this._targetRay.linearVelocity = new J()),
          (this._targetRay.hasAngularVelocity = !1),
          (this._targetRay.angularVelocity = new J())),
        this._targetRay
      );
    }
    getGripSpace() {
      return (
        this._grip === null &&
          ((this._grip = new Cn()),
          (this._grip.matrixAutoUpdate = !1),
          (this._grip.visible = !1),
          (this._grip.hasLinearVelocity = !1),
          (this._grip.linearVelocity = new J()),
          (this._grip.hasAngularVelocity = !1),
          (this._grip.angularVelocity = new J()),
          (this._grip.eventsEnabled = !1)),
        this._grip
      );
    }
    dispatchEvent(e) {
      return (
        this._targetRay !== null && this._targetRay.dispatchEvent(e),
        this._grip !== null && this._grip.dispatchEvent(e),
        this._hand !== null && this._hand.dispatchEvent(e),
        this
      );
    }
    connect(e) {
      if (e && e.hand) {
        let t = this._hand;
        if (t) for (let n of e.hand.values()) this._getHandJoint(t, n);
      }
      return (
        this.dispatchEvent({
          type: 'connected',
          data: e
        }),
        this
      );
    }
    disconnect(e) {
      return (
        this.dispatchEvent({
          type: 'disconnected',
          data: e
        }),
        this._targetRay !== null && (this._targetRay.visible = !1),
        this._grip !== null && (this._grip.visible = !1),
        this._hand !== null && (this._hand.visible = !1),
        this
      );
    }
    update(e, t, n) {
      let r = null,
        i = null,
        a = null,
        o = this._targetRay,
        s = this._grip,
        c = this._hand;
      if (e && t.session.visibilityState !== 'visible-blurred') {
        if (c && e.hand) {
          a = !0;
          for (let r of e.hand.values()) {
            let e = t.getJointPose(r, n),
              i = this._getHandJoint(c, r);
            (e !== null &&
              (i.matrix.fromArray(e.transform.matrix),
              i.matrix.decompose(i.position, i.rotation, i.scale),
              (i.matrixWorldNeedsUpdate = !0),
              (i.jointRadius = e.radius)),
              (i.visible = e !== null));
          }
          let r = c.joints['index-finger-tip'],
            i = c.joints['thumb-tip'],
            o = r.position.distanceTo(i.position);
          c.inputState.pinching && o > 0.025
            ? ((c.inputState.pinching = !1),
              this.dispatchEvent({
                type: 'pinchend',
                handedness: e.handedness,
                target: this
              }))
            : !c.inputState.pinching &&
              o <= 0.015 &&
              ((c.inputState.pinching = !0),
              this.dispatchEvent({
                type: 'pinchstart',
                handedness: e.handedness,
                target: this
              }));
        } else
          s !== null &&
            e.gripSpace &&
            ((i = t.getPose(e.gripSpace, n)),
            i !== null &&
              (s.matrix.fromArray(i.transform.matrix),
              s.matrix.decompose(s.position, s.rotation, s.scale),
              (s.matrixWorldNeedsUpdate = !0),
              i.linearVelocity
                ? ((s.hasLinearVelocity = !0), s.linearVelocity.copy(i.linearVelocity))
                : (s.hasLinearVelocity = !1),
              i.angularVelocity
                ? ((s.hasAngularVelocity = !0), s.angularVelocity.copy(i.angularVelocity))
                : (s.hasAngularVelocity = !1),
              s.eventsEnabled &&
                s.dispatchEvent({
                  type: 'gripUpdated',
                  data: e,
                  target: this
                })));
        o !== null &&
          ((r = t.getPose(e.targetRaySpace, n)),
          r === null && i !== null && (r = i),
          r !== null &&
            (o.matrix.fromArray(r.transform.matrix),
            o.matrix.decompose(o.position, o.rotation, o.scale),
            (o.matrixWorldNeedsUpdate = !0),
            r.linearVelocity
              ? ((o.hasLinearVelocity = !0), o.linearVelocity.copy(r.linearVelocity))
              : (o.hasLinearVelocity = !1),
            r.angularVelocity
              ? ((o.hasAngularVelocity = !0), o.angularVelocity.copy(r.angularVelocity))
              : (o.hasAngularVelocity = !1),
            this.dispatchEvent(wn)));
      }
      return (
        o !== null && (o.visible = r !== null),
        s !== null && (s.visible = i !== null),
        c !== null && (c.visible = a !== null),
        this
      );
    }
    _getHandJoint(e, t) {
      if (e.joints[t.jointName] === void 0) {
        let n = new Cn();
        ((n.matrixAutoUpdate = !1), (n.visible = !1), (e.joints[t.jointName] = n), e.add(n));
      }
      return e.joints[t.jointName];
    }
  },
  En = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  },
  Dn = {
    h: 0,
    s: 0,
    l: 0
  },
  On = {
    h: 0,
    s: 0,
    l: 0
  };
function kn(e, t, n) {
  return (
    n < 0 && (n += 1),
    n > 1 && --n,
    n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * 6 * (2 / 3 - n) : e
  );
}
var X = class {
    constructor(e, t, n) {
      return ((this.isColor = !0), (this.r = 1), (this.g = 1), (this.b = 1), this.set(e, t, n));
    }
    set(e, t, n) {
      if (t === void 0 && n === void 0) {
        let t = e;
        t && t.isColor
          ? this.copy(t)
          : typeof t == 'number'
            ? this.setHex(t)
            : typeof t == 'string' && this.setStyle(t);
      } else this.setRGB(e, t, n);
      return this;
    }
    setScalar(e) {
      return ((this.r = e), (this.g = e), (this.b = e), this);
    }
    setHex(e, t = Pe) {
      return (
        (e = Math.floor(e)),
        (this.r = ((e >> 16) & 255) / 255),
        (this.g = ((e >> 8) & 255) / 255),
        (this.b = (e & 255) / 255),
        Mt.colorSpaceToWorking(this, t),
        this
      );
    }
    setRGB(e, t, n, r = Mt.workingColorSpace) {
      return ((this.r = e), (this.g = t), (this.b = n), Mt.colorSpaceToWorking(this, r), this);
    }
    setHSL(e, t, n, r = Mt.workingColorSpace) {
      if (((e = it(e, 1)), (t = K(t, 0, 1)), (n = K(n, 0, 1)), t === 0))
        this.r = this.g = this.b = n;
      else {
        let r = n <= 0.5 ? n * (1 + t) : n + t - n * t,
          i = 2 * n - r;
        ((this.r = kn(i, r, e + 1 / 3)), (this.g = kn(i, r, e)), (this.b = kn(i, r, e - 1 / 3)));
      }
      return (Mt.colorSpaceToWorking(this, r), this);
    }
    setStyle(e, t = Pe) {
      function n(t) {
        t !== void 0 &&
          parseFloat(t) < 1 &&
          W('Color: Alpha component of ' + e + ' will be ignored.');
      }
      let r;
      if ((r = /^(\w+)\(([^\)]*)\)/.exec(e))) {
        let i,
          a = r[1],
          o = r[2];
        switch (a) {
          case 'rgb':
          case 'rgba':
            if ((i = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)))
              return (
                n(i[4]),
                this.setRGB(
                  Math.min(255, parseInt(i[1], 10)) / 255,
                  Math.min(255, parseInt(i[2], 10)) / 255,
                  Math.min(255, parseInt(i[3], 10)) / 255,
                  t
                )
              );
            if ((i = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)))
              return (
                n(i[4]),
                this.setRGB(
                  Math.min(100, parseInt(i[1], 10)) / 100,
                  Math.min(100, parseInt(i[2], 10)) / 100,
                  Math.min(100, parseInt(i[3], 10)) / 100,
                  t
                )
              );
            break;
          case 'hsl':
          case 'hsla':
            if (
              (i =
                /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                  o
                ))
            )
              return (
                n(i[4]),
                this.setHSL(
                  parseFloat(i[1]) / 360,
                  parseFloat(i[2]) / 100,
                  parseFloat(i[3]) / 100,
                  t
                )
              );
            break;
          default:
            W('Color: Unknown color model ' + e);
        }
      } else if ((r = /^\#([A-Fa-f\d]+)$/.exec(e))) {
        let n = r[1],
          i = n.length;
        if (i === 3)
          return this.setRGB(
            parseInt(n.charAt(0), 16) / 15,
            parseInt(n.charAt(1), 16) / 15,
            parseInt(n.charAt(2), 16) / 15,
            t
          );
        if (i === 6) return this.setHex(parseInt(n, 16), t);
        W('Color: Invalid hex color ' + e);
      } else if (e && e.length > 0) return this.setColorName(e, t);
      return this;
    }
    setColorName(e, t = Pe) {
      let n = En[e.toLowerCase()];
      return (n === void 0 ? W('Color: Unknown color ' + e) : this.setHex(n, t), this);
    }
    clone() {
      return new this.constructor(this.r, this.g, this.b);
    }
    copy(e) {
      return ((this.r = e.r), (this.g = e.g), (this.b = e.b), this);
    }
    copySRGBToLinear(e) {
      return ((this.r = Nt(e.r)), (this.g = Nt(e.g)), (this.b = Nt(e.b)), this);
    }
    copyLinearToSRGB(e) {
      return ((this.r = Pt(e.r)), (this.g = Pt(e.g)), (this.b = Pt(e.b)), this);
    }
    convertSRGBToLinear() {
      return (this.copySRGBToLinear(this), this);
    }
    convertLinearToSRGB() {
      return (this.copyLinearToSRGB(this), this);
    }
    getHex(e = Pe) {
      return (
        Mt.workingToColorSpace(An.copy(this), e),
        Math.round(K(An.r * 255, 0, 255)) * 65536 +
          Math.round(K(An.g * 255, 0, 255)) * 256 +
          Math.round(K(An.b * 255, 0, 255))
      );
    }
    getHexString(e = Pe) {
      return ('000000' + this.getHex(e).toString(16)).slice(-6);
    }
    getHSL(e, t = Mt.workingColorSpace) {
      Mt.workingToColorSpace(An.copy(this), t);
      let n = An.r,
        r = An.g,
        i = An.b,
        a = Math.max(n, r, i),
        o = Math.min(n, r, i),
        s,
        c,
        l = (o + a) / 2;
      if (o === a) ((s = 0), (c = 0));
      else {
        let e = a - o;
        switch (((c = l <= 0.5 ? e / (a + o) : e / (2 - a - o)), a)) {
          case n:
            s = (r - i) / e + (r < i ? 6 : 0);
            break;
          case r:
            s = (i - n) / e + 2;
            break;
          case i:
            s = (n - r) / e + 4;
            break;
        }
        s /= 6;
      }
      return ((e.h = s), (e.s = c), (e.l = l), e);
    }
    getRGB(e, t = Mt.workingColorSpace) {
      return (
        Mt.workingToColorSpace(An.copy(this), t), (e.r = An.r), (e.g = An.g), (e.b = An.b), e
      );
    }
    getStyle(e = Pe) {
      Mt.workingToColorSpace(An.copy(this), e);
      let t = An.r,
        n = An.g,
        r = An.b;
      return e === 'srgb'
        ? `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(r * 255)})`
        : `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`;
    }
    offsetHSL(e, t, n) {
      return (this.getHSL(Dn), this.setHSL(Dn.h + e, Dn.s + t, Dn.l + n));
    }
    add(e) {
      return ((this.r += e.r), (this.g += e.g), (this.b += e.b), this);
    }
    addColors(e, t) {
      return ((this.r = e.r + t.r), (this.g = e.g + t.g), (this.b = e.b + t.b), this);
    }
    addScalar(e) {
      return ((this.r += e), (this.g += e), (this.b += e), this);
    }
    sub(e) {
      return (
        (this.r = Math.max(0, this.r - e.r)),
        (this.g = Math.max(0, this.g - e.g)),
        (this.b = Math.max(0, this.b - e.b)),
        this
      );
    }
    multiply(e) {
      return ((this.r *= e.r), (this.g *= e.g), (this.b *= e.b), this);
    }
    multiplyScalar(e) {
      return ((this.r *= e), (this.g *= e), (this.b *= e), this);
    }
    lerp(e, t) {
      return (
        (this.r += (e.r - this.r) * t),
        (this.g += (e.g - this.g) * t),
        (this.b += (e.b - this.b) * t),
        this
      );
    }
    lerpColors(e, t, n) {
      return (
        (this.r = e.r + (t.r - e.r) * n),
        (this.g = e.g + (t.g - e.g) * n),
        (this.b = e.b + (t.b - e.b) * n),
        this
      );
    }
    lerpHSL(e, t) {
      (this.getHSL(Dn), e.getHSL(On));
      let n = st(Dn.h, On.h, t),
        r = st(Dn.s, On.s, t),
        i = st(Dn.l, On.l, t);
      return (this.setHSL(n, r, i), this);
    }
    setFromVector3(e) {
      return ((this.r = e.x), (this.g = e.y), (this.b = e.z), this);
    }
    applyMatrix3(e) {
      let t = this.r,
        n = this.g,
        r = this.b,
        i = e.elements;
      return (
        (this.r = i[0] * t + i[3] * n + i[6] * r),
        (this.g = i[1] * t + i[4] * n + i[7] * r),
        (this.b = i[2] * t + i[5] * n + i[8] * r),
        this
      );
    }
    equals(e) {
      return e.r === this.r && e.g === this.g && e.b === this.b;
    }
    fromArray(e, t = 0) {
      return ((this.r = e[t]), (this.g = e[t + 1]), (this.b = e[t + 2]), this);
    }
    toArray(e = [], t = 0) {
      return ((e[t] = this.r), (e[t + 1] = this.g), (e[t + 2] = this.b), e);
    }
    fromBufferAttribute(e, t) {
      return ((this.r = e.getX(t)), (this.g = e.getY(t)), (this.b = e.getZ(t)), this);
    }
    toJSON() {
      return this.getHex();
    }
    *[Symbol.iterator]() {
      (yield this.r, yield this.g, yield this.b);
    }
  },
  An = /*@__PURE__*/ new X();
X.NAMES = En;
var jn = class extends Sn {
    constructor() {
      (super(),
        (this.isScene = !0),
        (this.type = 'Scene'),
        (this.background = null),
        (this.environment = null),
        (this.fog = null),
        (this.backgroundBlurriness = 0),
        (this.backgroundIntensity = 1),
        (this.backgroundRotation = new an()),
        (this.environmentIntensity = 1),
        (this.environmentRotation = new an()),
        (this.overrideMaterial = null),
        typeof __THREE_DEVTOOLS__ < 'u' &&
          __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this })));
    }
    copy(e, t) {
      return (
        super.copy(e, t),
        e.background !== null && (this.background = e.background.clone()),
        e.environment !== null && (this.environment = e.environment.clone()),
        e.fog !== null && (this.fog = e.fog.clone()),
        (this.backgroundBlurriness = e.backgroundBlurriness),
        (this.backgroundIntensity = e.backgroundIntensity),
        this.backgroundRotation.copy(e.backgroundRotation),
        (this.environmentIntensity = e.environmentIntensity),
        this.environmentRotation.copy(e.environmentRotation),
        e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()),
        (this.matrixAutoUpdate = e.matrixAutoUpdate),
        this
      );
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return (
        this.fog !== null && (t.object.fog = this.fog.toJSON()),
        this.backgroundBlurriness > 0 &&
          (t.object.backgroundBlurriness = this.backgroundBlurriness),
        this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity),
        (t.object.backgroundRotation = this.backgroundRotation.toArray()),
        this.environmentIntensity !== 1 &&
          (t.object.environmentIntensity = this.environmentIntensity),
        (t.object.environmentRotation = this.environmentRotation.toArray()),
        t
      );
    }
  },
  Mn = /*@__PURE__*/ new J(),
  Nn = /*@__PURE__*/ new J(),
  Pn = /*@__PURE__*/ new J(),
  Fn = /*@__PURE__*/ new J(),
  In = /*@__PURE__*/ new J(),
  Ln = /*@__PURE__*/ new J(),
  Rn = /*@__PURE__*/ new J(),
  zn = /*@__PURE__*/ new J(),
  Bn = /*@__PURE__*/ new J(),
  Vn = /*@__PURE__*/ new J(),
  Hn = /*@__PURE__*/ new Ut(),
  Un = /*@__PURE__*/ new Ut(),
  Wn = /*@__PURE__*/ new Ut(),
  Gn = class e {
    constructor(e = new J(), t = new J(), n = new J()) {
      ((this.a = e), (this.b = t), (this.c = n));
    }
    static getNormal(e, t, n, r) {
      (r.subVectors(n, t), Mn.subVectors(e, t), r.cross(Mn));
      let i = r.lengthSq();
      return i > 0 ? r.multiplyScalar(1 / Math.sqrt(i)) : r.set(0, 0, 0);
    }
    static getBarycoord(e, t, n, r, i) {
      (Mn.subVectors(r, t), Nn.subVectors(n, t), Pn.subVectors(e, t));
      let a = Mn.dot(Mn),
        o = Mn.dot(Nn),
        s = Mn.dot(Pn),
        c = Nn.dot(Nn),
        l = Nn.dot(Pn),
        u = a * c - o * o;
      if (u === 0) return (i.set(0, 0, 0), null);
      let d = 1 / u,
        f = (c * s - o * l) * d,
        p = (a * l - o * s) * d;
      return i.set(1 - f - p, p, f);
    }
    static containsPoint(e, t, n, r) {
      return this.getBarycoord(e, t, n, r, Fn) === null
        ? !1
        : Fn.x >= 0 && Fn.y >= 0 && Fn.x + Fn.y <= 1;
    }
    static getInterpolation(e, t, n, r, i, a, o, s) {
      return this.getBarycoord(e, t, n, r, Fn) === null
        ? ((s.x = 0), (s.y = 0), 'z' in s && (s.z = 0), 'w' in s && (s.w = 0), null)
        : (s.setScalar(0),
          s.addScaledVector(i, Fn.x),
          s.addScaledVector(a, Fn.y),
          s.addScaledVector(o, Fn.z),
          s);
    }
    static getInterpolatedAttribute(e, t, n, r, i, a) {
      return (
        Hn.setScalar(0),
        Un.setScalar(0),
        Wn.setScalar(0),
        Hn.fromBufferAttribute(e, t),
        Un.fromBufferAttribute(e, n),
        Wn.fromBufferAttribute(e, r),
        a.setScalar(0),
        a.addScaledVector(Hn, i.x),
        a.addScaledVector(Un, i.y),
        a.addScaledVector(Wn, i.z),
        a
      );
    }
    static isFrontFacing(e, t, n, r) {
      return (Mn.subVectors(n, t), Nn.subVectors(e, t), Mn.cross(Nn).dot(r) < 0);
    }
    set(e, t, n) {
      return (this.a.copy(e), this.b.copy(t), this.c.copy(n), this);
    }
    setFromPointsAndIndices(e, t, n, r) {
      return (this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[r]), this);
    }
    setFromAttributeAndIndices(e, t, n, r) {
      return (
        this.a.fromBufferAttribute(e, t),
        this.b.fromBufferAttribute(e, n),
        this.c.fromBufferAttribute(e, r),
        this
      );
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return (this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this);
    }
    getArea() {
      return (
        Mn.subVectors(this.c, this.b), Nn.subVectors(this.a, this.b), Mn.cross(Nn).length() * 0.5
      );
    }
    getMidpoint(e) {
      return e
        .addVectors(this.a, this.b)
        .add(this.c)
        .multiplyScalar(1 / 3);
    }
    getNormal(t) {
      return e.getNormal(this.a, this.b, this.c, t);
    }
    getPlane(e) {
      return e.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    getBarycoord(t, n) {
      return e.getBarycoord(t, this.a, this.b, this.c, n);
    }
    getInterpolation(t, n, r, i, a) {
      return e.getInterpolation(t, this.a, this.b, this.c, n, r, i, a);
    }
    containsPoint(t) {
      return e.containsPoint(t, this.a, this.b, this.c);
    }
    isFrontFacing(t) {
      return e.isFrontFacing(this.a, this.b, this.c, t);
    }
    intersectsBox(e) {
      return e.intersectsTriangle(this);
    }
    closestPointToPoint(e, t) {
      let n = this.a,
        r = this.b,
        i = this.c,
        a,
        o;
      (In.subVectors(r, n), Ln.subVectors(i, n), zn.subVectors(e, n));
      let s = In.dot(zn),
        c = Ln.dot(zn);
      if (s <= 0 && c <= 0) return t.copy(n);
      Bn.subVectors(e, r);
      let l = In.dot(Bn),
        u = Ln.dot(Bn);
      if (l >= 0 && u <= l) return t.copy(r);
      let d = s * u - l * c;
      if (d <= 0 && s >= 0 && l <= 0) return ((a = s / (s - l)), t.copy(n).addScaledVector(In, a));
      Vn.subVectors(e, i);
      let f = In.dot(Vn),
        p = Ln.dot(Vn);
      if (p >= 0 && f <= p) return t.copy(i);
      let m = f * c - s * p;
      if (m <= 0 && c >= 0 && p <= 0) return ((o = c / (c - p)), t.copy(n).addScaledVector(Ln, o));
      let h = l * p - f * u;
      if (h <= 0 && u - l >= 0 && f - p >= 0)
        return (
          Rn.subVectors(i, r), (o = (u - l) / (u - l + (f - p))), t.copy(r).addScaledVector(Rn, o)
        );
      let g = 1 / (h + m + d);
      return ((a = m * g), (o = d * g), t.copy(n).addScaledVector(In, a).addScaledVector(Ln, o));
    }
    equals(e) {
      return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
    }
  },
  Kn = class {
    constructor(
      e = new J(Infinity, Infinity, Infinity),
      t = new J(-Infinity, -Infinity, -Infinity)
    ) {
      ((this.isBox3 = !0), (this.min = e), (this.max = t));
    }
    set(e, t) {
      return (this.min.copy(e), this.max.copy(t), this);
    }
    setFromArray(e) {
      this.makeEmpty();
      for (let t = 0, n = e.length; t < n; t += 3) this.expandByPoint(Jn.fromArray(e, t));
      return this;
    }
    setFromBufferAttribute(e) {
      this.makeEmpty();
      for (let t = 0, n = e.count; t < n; t++) this.expandByPoint(Jn.fromBufferAttribute(e, t));
      return this;
    }
    setFromPoints(e) {
      this.makeEmpty();
      for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
      return this;
    }
    setFromCenterAndSize(e, t) {
      let n = Jn.copy(t).multiplyScalar(0.5);
      return (this.min.copy(e).sub(n), this.max.copy(e).add(n), this);
    }
    setFromObject(e, t = !1) {
      return (this.makeEmpty(), this.expandByObject(e, t));
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return (this.min.copy(e.min), this.max.copy(e.max), this);
    }
    makeEmpty() {
      return (
        (this.min.x = this.min.y = this.min.z = Infinity),
        (this.max.x = this.max.y = this.max.z = -Infinity),
        this
      );
    }
    isEmpty() {
      return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
    }
    getCenter(e) {
      return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    getSize(e) {
      return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
    }
    expandByPoint(e) {
      return (this.min.min(e), this.max.max(e), this);
    }
    expandByVector(e) {
      return (this.min.sub(e), this.max.add(e), this);
    }
    expandByScalar(e) {
      return (this.min.addScalar(-e), this.max.addScalar(e), this);
    }
    expandByObject(e, t = !1) {
      e.updateWorldMatrix(!1, !1);
      let n = e.geometry;
      if (n !== void 0) {
        let r = n.getAttribute('position');
        if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0)
          for (let t = 0, n = r.count; t < n; t++)
            (e.isMesh === !0 ? e.getVertexPosition(t, Jn) : Jn.fromBufferAttribute(r, t),
              Jn.applyMatrix4(e.matrixWorld),
              this.expandByPoint(Jn));
        else
          (e.boundingBox === void 0
            ? (n.boundingBox === null && n.computeBoundingBox(), Yn.copy(n.boundingBox))
            : (e.boundingBox === null && e.computeBoundingBox(), Yn.copy(e.boundingBox)),
            Yn.applyMatrix4(e.matrixWorld),
            this.union(Yn));
      }
      let r = e.children;
      for (let e = 0, n = r.length; e < n; e++) this.expandByObject(r[e], t);
      return this;
    }
    containsPoint(e) {
      return (
        e.x >= this.min.x &&
        e.x <= this.max.x &&
        e.y >= this.min.y &&
        e.y <= this.max.y &&
        e.z >= this.min.z &&
        e.z <= this.max.z
      );
    }
    containsBox(e) {
      return (
        this.min.x <= e.min.x &&
        e.max.x <= this.max.x &&
        this.min.y <= e.min.y &&
        e.max.y <= this.max.y &&
        this.min.z <= e.min.z &&
        e.max.z <= this.max.z
      );
    }
    getParameter(e, t) {
      return t.set(
        (e.x - this.min.x) / (this.max.x - this.min.x),
        (e.y - this.min.y) / (this.max.y - this.min.y),
        (e.z - this.min.z) / (this.max.z - this.min.z)
      );
    }
    intersectsBox(e) {
      return (
        e.max.x >= this.min.x &&
        e.min.x <= this.max.x &&
        e.max.y >= this.min.y &&
        e.min.y <= this.max.y &&
        e.max.z >= this.min.z &&
        e.min.z <= this.max.z
      );
    }
    intersectsSphere(e) {
      return (this.clampPoint(e.center, Jn), Jn.distanceToSquared(e.center) <= e.radius * e.radius);
    }
    intersectsPlane(e) {
      let t, n;
      return (
        e.normal.x > 0
          ? ((t = e.normal.x * this.min.x), (n = e.normal.x * this.max.x))
          : ((t = e.normal.x * this.max.x), (n = e.normal.x * this.min.x)),
        e.normal.y > 0
          ? ((t += e.normal.y * this.min.y), (n += e.normal.y * this.max.y))
          : ((t += e.normal.y * this.max.y), (n += e.normal.y * this.min.y)),
        e.normal.z > 0
          ? ((t += e.normal.z * this.min.z), (n += e.normal.z * this.max.z))
          : ((t += e.normal.z * this.max.z), (n += e.normal.z * this.min.z)),
        t <= -e.constant && n >= -e.constant
      );
    }
    intersectsTriangle(e) {
      if (this.isEmpty()) return !1;
      (this.getCenter(nr),
        rr.subVectors(this.max, nr),
        Xn.subVectors(e.a, nr),
        Zn.subVectors(e.b, nr),
        Qn.subVectors(e.c, nr),
        $n.subVectors(Zn, Xn),
        er.subVectors(Qn, Zn),
        tr.subVectors(Xn, Qn));
      let t = [
        0,
        -$n.z,
        $n.y,
        0,
        -er.z,
        er.y,
        0,
        -tr.z,
        tr.y,
        $n.z,
        0,
        -$n.x,
        er.z,
        0,
        -er.x,
        tr.z,
        0,
        -tr.x,
        -$n.y,
        $n.x,
        0,
        -er.y,
        er.x,
        0,
        -tr.y,
        tr.x,
        0
      ];
      return !or(t, Xn, Zn, Qn, rr) || ((t = [1, 0, 0, 0, 1, 0, 0, 0, 1]), !or(t, Xn, Zn, Qn, rr))
        ? !1
        : (ir.crossVectors($n, er), (t = [ir.x, ir.y, ir.z]), or(t, Xn, Zn, Qn, rr));
    }
    clampPoint(e, t) {
      return t.copy(e).clamp(this.min, this.max);
    }
    distanceToPoint(e) {
      return this.clampPoint(e, Jn).distanceTo(e);
    }
    getBoundingSphere(e) {
      return (
        this.isEmpty()
          ? e.makeEmpty()
          : (this.getCenter(e.center), (e.radius = this.getSize(Jn).length() * 0.5)),
        e
      );
    }
    intersect(e) {
      return (this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this);
    }
    union(e) {
      return (this.min.min(e.min), this.max.max(e.max), this);
    }
    applyMatrix4(e) {
      return this.isEmpty()
        ? this
        : (qn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e),
          qn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e),
          qn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e),
          qn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e),
          qn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e),
          qn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e),
          qn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e),
          qn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e),
          this.setFromPoints(qn),
          this);
    }
    translate(e) {
      return (this.min.add(e), this.max.add(e), this);
    }
    equals(e) {
      return e.min.equals(this.min) && e.max.equals(this.max);
    }
    toJSON() {
      return {
        min: this.min.toArray(),
        max: this.max.toArray()
      };
    }
    fromJSON(e) {
      return (this.min.fromArray(e.min), this.max.fromArray(e.max), this);
    }
  },
  qn = [
    /*@__PURE__*/ new J(),
    /*@__PURE__*/ new J(),
    /*@__PURE__*/ new J(),
    /*@__PURE__*/ new J(),
    /*@__PURE__*/ new J(),
    /*@__PURE__*/ new J(),
    /*@__PURE__*/ new J(),
    /*@__PURE__*/ new J()
  ],
  Jn = /*@__PURE__*/ new J(),
  Yn = /*@__PURE__*/ new Kn(),
  Xn = /*@__PURE__*/ new J(),
  Zn = /*@__PURE__*/ new J(),
  Qn = /*@__PURE__*/ new J(),
  $n = /*@__PURE__*/ new J(),
  er = /*@__PURE__*/ new J(),
  tr = /*@__PURE__*/ new J(),
  nr = /*@__PURE__*/ new J(),
  rr = /*@__PURE__*/ new J(),
  ir = /*@__PURE__*/ new J(),
  ar = /*@__PURE__*/ new J();
function or(e, t, n, r, i) {
  for (let a = 0, o = e.length - 3; a <= o; a += 3) {
    ar.fromArray(e, a);
    let o = i.x * Math.abs(ar.x) + i.y * Math.abs(ar.y) + i.z * Math.abs(ar.z),
      s = t.dot(ar),
      c = n.dot(ar),
      l = r.dot(ar);
    if (Math.max(-Math.max(s, c, l), Math.min(s, c, l)) > o) return !1;
  }
  return !0;
}
var sr = /*@__PURE__*/ new J(),
  cr = /*@__PURE__*/ new q(),
  lr = 0,
  ur = class extends Qe {
    constructor(e, t, n = !1) {
      if ((super(), Array.isArray(e)))
        throw TypeError('THREE.BufferAttribute: array should be a Typed Array.');
      ((this.isBufferAttribute = !0),
        Object.defineProperty(this, 'id', { value: lr++ }),
        (this.name = ''),
        (this.array = e),
        (this.itemSize = t),
        (this.count = e === void 0 ? 0 : e.length / t),
        (this.normalized = n),
        (this.usage = ze),
        (this.updateRanges = []),
        (this.gpuType = _),
        (this.version = 0));
    }
    onUploadCallback() {}
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
    setUsage(e) {
      return ((this.usage = e), this);
    }
    addUpdateRange(e, t) {
      this.updateRanges.push({
        start: e,
        count: t
      });
    }
    clearUpdateRanges() {
      this.updateRanges.length = 0;
    }
    copy(e) {
      return (
        (this.name = e.name),
        (this.array = new e.array.constructor(e.array)),
        (this.itemSize = e.itemSize),
        (this.count = e.count),
        (this.normalized = e.normalized),
        (this.usage = e.usage),
        (this.gpuType = e.gpuType),
        this
      );
    }
    copyAt(e, t, n) {
      ((e *= this.itemSize), (n *= t.itemSize));
      for (let r = 0, i = this.itemSize; r < i; r++) this.array[e + r] = t.array[n + r];
      return this;
    }
    copyArray(e) {
      return (this.array.set(e), this);
    }
    applyMatrix3(e) {
      if (this.itemSize === 2)
        for (let t = 0, n = this.count; t < n; t++)
          (cr.fromBufferAttribute(this, t), cr.applyMatrix3(e), this.setXY(t, cr.x, cr.y));
      else if (this.itemSize === 3)
        for (let t = 0, n = this.count; t < n; t++)
          (sr.fromBufferAttribute(this, t), sr.applyMatrix3(e), this.setXYZ(t, sr.x, sr.y, sr.z));
      return this;
    }
    applyMatrix4(e) {
      for (let t = 0, n = this.count; t < n; t++)
        (sr.fromBufferAttribute(this, t), sr.applyMatrix4(e), this.setXYZ(t, sr.x, sr.y, sr.z));
      return this;
    }
    applyNormalMatrix(e) {
      for (let t = 0, n = this.count; t < n; t++)
        (sr.fromBufferAttribute(this, t),
          sr.applyNormalMatrix(e),
          this.setXYZ(t, sr.x, sr.y, sr.z));
      return this;
    }
    transformDirection(e) {
      for (let t = 0, n = this.count; t < n; t++)
        (sr.fromBufferAttribute(this, t),
          sr.transformDirection(e),
          this.setXYZ(t, sr.x, sr.y, sr.z));
      return this;
    }
    set(e, t = 0) {
      return (this.array.set(e, t), this);
    }
    getComponent(e, t) {
      let n = this.array[e * this.itemSize + t];
      return (this.normalized && (n = St(n, this.array)), n);
    }
    setComponent(e, t, n) {
      return (
        this.normalized && (n = Ct(n, this.array)), (this.array[e * this.itemSize + t] = n), this
      );
    }
    getX(e) {
      let t = this.array[e * this.itemSize];
      return (this.normalized && (t = St(t, this.array)), t);
    }
    setX(e, t) {
      return (
        this.normalized && (t = Ct(t, this.array)), (this.array[e * this.itemSize] = t), this
      );
    }
    getY(e) {
      let t = this.array[e * this.itemSize + 1];
      return (this.normalized && (t = St(t, this.array)), t);
    }
    setY(e, t) {
      return (
        this.normalized && (t = Ct(t, this.array)), (this.array[e * this.itemSize + 1] = t), this
      );
    }
    getZ(e) {
      let t = this.array[e * this.itemSize + 2];
      return (this.normalized && (t = St(t, this.array)), t);
    }
    setZ(e, t) {
      return (
        this.normalized && (t = Ct(t, this.array)), (this.array[e * this.itemSize + 2] = t), this
      );
    }
    getW(e) {
      let t = this.array[e * this.itemSize + 3];
      return (this.normalized && (t = St(t, this.array)), t);
    }
    setW(e, t) {
      return (
        this.normalized && (t = Ct(t, this.array)), (this.array[e * this.itemSize + 3] = t), this
      );
    }
    setXY(e, t, n) {
      return (
        (e *= this.itemSize),
        this.normalized && ((t = Ct(t, this.array)), (n = Ct(n, this.array))),
        (this.array[e + 0] = t),
        (this.array[e + 1] = n),
        this
      );
    }
    setXYZ(e, t, n, r) {
      return (
        (e *= this.itemSize),
        this.normalized &&
          ((t = Ct(t, this.array)), (n = Ct(n, this.array)), (r = Ct(r, this.array))),
        (this.array[e + 0] = t),
        (this.array[e + 1] = n),
        (this.array[e + 2] = r),
        this
      );
    }
    setXYZW(e, t, n, r, i) {
      return (
        (e *= this.itemSize),
        this.normalized &&
          ((t = Ct(t, this.array)),
          (n = Ct(n, this.array)),
          (r = Ct(r, this.array)),
          (i = Ct(i, this.array))),
        (this.array[e + 0] = t),
        (this.array[e + 1] = n),
        (this.array[e + 2] = r),
        (this.array[e + 3] = i),
        this
      );
    }
    onUpload(e) {
      return ((this.onUploadCallback = e), this);
    }
    clone() {
      return new this.constructor(this.array, this.itemSize).copy(this);
    }
    toJSON() {
      let e = {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.from(this.array),
        normalized: this.normalized
      };
      return (
        this.name !== '' && (e.name = this.name), this.usage !== 35044 && (e.usage = this.usage), e
      );
    }
    dispose() {
      this.dispatchEvent({ type: 'dispose' });
    }
  },
  dr = class extends ur {
    constructor(e, t, n) {
      super(new Uint16Array(e), t, n);
    }
  },
  fr = class extends ur {
    constructor(e, t, n) {
      super(new Uint32Array(e), t, n);
    }
  },
  pr = class extends ur {
    constructor(e, t, n) {
      super(new Float32Array(e), t, n);
    }
  },
  mr = /*@__PURE__*/ new Kn(),
  hr = /*@__PURE__*/ new J(),
  gr = /*@__PURE__*/ new J(),
  _r = class {
    constructor(e = new J(), t = -1) {
      ((this.isSphere = !0), (this.center = e), (this.radius = t));
    }
    set(e, t) {
      return (this.center.copy(e), (this.radius = t), this);
    }
    setFromPoints(e, t) {
      let n = this.center;
      t === void 0 ? mr.setFromPoints(e).getCenter(n) : n.copy(t);
      let r = 0;
      for (let t = 0, i = e.length; t < i; t++) r = Math.max(r, n.distanceToSquared(e[t]));
      return ((this.radius = Math.sqrt(r)), this);
    }
    copy(e) {
      return (this.center.copy(e.center), (this.radius = e.radius), this);
    }
    isEmpty() {
      return this.radius < 0;
    }
    makeEmpty() {
      return (this.center.set(0, 0, 0), (this.radius = -1), this);
    }
    containsPoint(e) {
      return e.distanceToSquared(this.center) <= this.radius * this.radius;
    }
    distanceToPoint(e) {
      return e.distanceTo(this.center) - this.radius;
    }
    intersectsSphere(e) {
      let t = this.radius + e.radius;
      return e.center.distanceToSquared(this.center) <= t * t;
    }
    intersectsBox(e) {
      return e.intersectsSphere(this);
    }
    intersectsPlane(e) {
      return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
    }
    clampPoint(e, t) {
      let n = this.center.distanceToSquared(e);
      return (
        t.copy(e),
        n > this.radius * this.radius &&
          (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)),
        t
      );
    }
    getBoundingBox(e) {
      return this.isEmpty()
        ? (e.makeEmpty(), e)
        : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
    }
    applyMatrix4(e) {
      return (this.center.applyMatrix4(e), (this.radius *= e.getMaxScaleOnAxis()), this);
    }
    translate(e) {
      return (this.center.add(e), this);
    }
    expandByPoint(e) {
      if (this.isEmpty()) return (this.center.copy(e), (this.radius = 0), this);
      hr.subVectors(e, this.center);
      let t = hr.lengthSq();
      if (t > this.radius * this.radius) {
        let e = Math.sqrt(t),
          n = (e - this.radius) * 0.5;
        (this.center.addScaledVector(hr, n / e), (this.radius += n));
      }
      return this;
    }
    union(e) {
      return e.isEmpty()
        ? this
        : this.isEmpty()
          ? (this.copy(e), this)
          : (this.center.equals(e.center) === !0
              ? (this.radius = Math.max(this.radius, e.radius))
              : (gr.subVectors(e.center, this.center).setLength(e.radius),
                this.expandByPoint(hr.copy(e.center).add(gr)),
                this.expandByPoint(hr.copy(e.center).sub(gr))),
            this);
    }
    equals(e) {
      return e.center.equals(this.center) && e.radius === this.radius;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    toJSON() {
      return {
        radius: this.radius,
        center: this.center.toArray()
      };
    }
    fromJSON(e) {
      return ((this.radius = e.radius), this.center.fromArray(e.center), this);
    }
  },
  vr = 0,
  yr = /*@__PURE__*/ new Jt(),
  br = /*@__PURE__*/ new Sn(),
  xr = /*@__PURE__*/ new J(),
  Sr = /*@__PURE__*/ new Kn(),
  Cr = /*@__PURE__*/ new Kn(),
  wr = /*@__PURE__*/ new J(),
  Tr = class e extends Qe {
    constructor() {
      (super(),
        (this.isBufferGeometry = !0),
        Object.defineProperty(this, 'id', { value: vr++ }),
        (this.uuid = rt()),
        (this.name = ''),
        (this.type = 'BufferGeometry'),
        (this.index = null),
        (this.indirect = null),
        (this.indirectOffset = 0),
        (this.attributes = {}),
        (this.morphAttributes = {}),
        (this.morphTargetsRelative = !1),
        (this.groups = []),
        (this.boundingBox = null),
        (this.boundingSphere = null),
        (this.drawRange = {
          start: 0,
          count: Infinity
        }),
        (this.userData = {}));
    }
    getIndex() {
      return this.index;
    }
    setIndex(e) {
      return (
        Array.isArray(e) ? (this.index = new (Ve(e) ? fr : dr)(e, 1)) : (this.index = e), this
      );
    }
    setIndirect(e, t = 0) {
      return ((this.indirect = e), (this.indirectOffset = t), this);
    }
    getIndirect() {
      return this.indirect;
    }
    getAttribute(e) {
      return this.attributes[e];
    }
    setAttribute(e, t) {
      return ((this.attributes[e] = t), this);
    }
    deleteAttribute(e) {
      return (delete this.attributes[e], this);
    }
    hasAttribute(e) {
      return this.attributes[e] !== void 0;
    }
    addGroup(e, t, n = 0) {
      this.groups.push({
        start: e,
        count: t,
        materialIndex: n
      });
    }
    clearGroups() {
      this.groups = [];
    }
    setDrawRange(e, t) {
      ((this.drawRange.start = e), (this.drawRange.count = t));
    }
    applyMatrix4(e) {
      let t = this.attributes.position;
      t !== void 0 && (t.applyMatrix4(e), (t.needsUpdate = !0));
      let n = this.attributes.normal;
      if (n !== void 0) {
        let t = new Y().getNormalMatrix(e);
        (n.applyNormalMatrix(t), (n.needsUpdate = !0));
      }
      let r = this.attributes.tangent;
      return (
        r !== void 0 && (r.transformDirection(e), (r.needsUpdate = !0)),
        this.boundingBox !== null && this.computeBoundingBox(),
        this.boundingSphere !== null && this.computeBoundingSphere(),
        this
      );
    }
    applyQuaternion(e) {
      return (yr.makeRotationFromQuaternion(e), this.applyMatrix4(yr), this);
    }
    rotateX(e) {
      return (yr.makeRotationX(e), this.applyMatrix4(yr), this);
    }
    rotateY(e) {
      return (yr.makeRotationY(e), this.applyMatrix4(yr), this);
    }
    rotateZ(e) {
      return (yr.makeRotationZ(e), this.applyMatrix4(yr), this);
    }
    translate(e, t, n) {
      return (yr.makeTranslation(e, t, n), this.applyMatrix4(yr), this);
    }
    scale(e, t, n) {
      return (yr.makeScale(e, t, n), this.applyMatrix4(yr), this);
    }
    lookAt(e) {
      return (br.lookAt(e), br.updateMatrix(), this.applyMatrix4(br.matrix), this);
    }
    center() {
      return (
        this.computeBoundingBox(),
        this.boundingBox.getCenter(xr).negate(),
        this.translate(xr.x, xr.y, xr.z),
        this
      );
    }
    setFromPoints(e) {
      let t = this.getAttribute('position');
      if (t === void 0) {
        let t = [];
        for (let n = 0, r = e.length; n < r; n++) {
          let r = e[n];
          t.push(r.x, r.y, r.z || 0);
        }
        this.setAttribute('position', new pr(t, 3));
      } else {
        let n = Math.min(e.length, t.count);
        for (let r = 0; r < n; r++) {
          let n = e[r];
          t.setXYZ(r, n.x, n.y, n.z || 0);
        }
        (e.length > t.count &&
          W(
            'BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.'
          ),
          (t.needsUpdate = !0));
      }
      return this;
    }
    computeBoundingBox() {
      this.boundingBox === null && (this.boundingBox = new Kn());
      let e = this.attributes.position,
        t = this.morphAttributes.position;
      if (e && e.isGLBufferAttribute) {
        (G(
          'BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.',
          this
        ),
          this.boundingBox.set(
            new J(-Infinity, -Infinity, -Infinity),
            new J(Infinity, Infinity, Infinity)
          ));
        return;
      }
      if (e !== void 0) {
        if ((this.boundingBox.setFromBufferAttribute(e), t))
          for (let e = 0, n = t.length; e < n; e++) {
            let n = t[e];
            (Sr.setFromBufferAttribute(n),
              this.morphTargetsRelative
                ? (wr.addVectors(this.boundingBox.min, Sr.min),
                  this.boundingBox.expandByPoint(wr),
                  wr.addVectors(this.boundingBox.max, Sr.max),
                  this.boundingBox.expandByPoint(wr))
                : (this.boundingBox.expandByPoint(Sr.min), this.boundingBox.expandByPoint(Sr.max)));
          }
      } else this.boundingBox.makeEmpty();
      (isNaN(this.boundingBox.min.x) ||
        isNaN(this.boundingBox.min.y) ||
        isNaN(this.boundingBox.min.z)) &&
        G(
          'BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',
          this
        );
    }
    computeBoundingSphere() {
      this.boundingSphere === null && (this.boundingSphere = new _r());
      let e = this.attributes.position,
        t = this.morphAttributes.position;
      if (e && e.isGLBufferAttribute) {
        (G(
          'BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.',
          this
        ),
          this.boundingSphere.set(new J(), Infinity));
        return;
      }
      if (e) {
        let n = this.boundingSphere.center;
        if ((Sr.setFromBufferAttribute(e), t))
          for (let e = 0, n = t.length; e < n; e++) {
            let n = t[e];
            (Cr.setFromBufferAttribute(n),
              this.morphTargetsRelative
                ? (wr.addVectors(Sr.min, Cr.min),
                  Sr.expandByPoint(wr),
                  wr.addVectors(Sr.max, Cr.max),
                  Sr.expandByPoint(wr))
                : (Sr.expandByPoint(Cr.min), Sr.expandByPoint(Cr.max)));
          }
        Sr.getCenter(n);
        let r = 0;
        for (let t = 0, i = e.count; t < i; t++)
          (wr.fromBufferAttribute(e, t), (r = Math.max(r, n.distanceToSquared(wr))));
        if (t)
          for (let i = 0, a = t.length; i < a; i++) {
            let a = t[i],
              o = this.morphTargetsRelative;
            for (let t = 0, i = a.count; t < i; t++)
              (wr.fromBufferAttribute(a, t),
                o && (xr.fromBufferAttribute(e, t), wr.add(xr)),
                (r = Math.max(r, n.distanceToSquared(wr))));
          }
        ((this.boundingSphere.radius = Math.sqrt(r)),
          isNaN(this.boundingSphere.radius) &&
            G(
              'BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',
              this
            ));
      }
    }
    computeTangents() {
      let e = this.index,
        t = this.attributes;
      if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
        G(
          'BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)'
        );
        return;
      }
      let n = t.position,
        r = t.normal,
        i = t.uv;
      this.hasAttribute('tangent') === !1 &&
        this.setAttribute('tangent', new ur(new Float32Array(4 * n.count), 4));
      let a = this.getAttribute('tangent'),
        o = [],
        s = [];
      for (let e = 0; e < n.count; e++) ((o[e] = new J()), (s[e] = new J()));
      let c = new J(),
        l = new J(),
        u = new J(),
        d = new q(),
        f = new q(),
        p = new q(),
        m = new J(),
        h = new J();
      function g(e, t, r) {
        (c.fromBufferAttribute(n, e),
          l.fromBufferAttribute(n, t),
          u.fromBufferAttribute(n, r),
          d.fromBufferAttribute(i, e),
          f.fromBufferAttribute(i, t),
          p.fromBufferAttribute(i, r),
          l.sub(c),
          u.sub(c),
          f.sub(d),
          p.sub(d));
        let a = 1 / (f.x * p.y - p.x * f.y);
        isFinite(a) &&
          (m.copy(l).multiplyScalar(p.y).addScaledVector(u, -f.y).multiplyScalar(a),
          h.copy(u).multiplyScalar(f.x).addScaledVector(l, -p.x).multiplyScalar(a),
          o[e].add(m),
          o[t].add(m),
          o[r].add(m),
          s[e].add(h),
          s[t].add(h),
          s[r].add(h));
      }
      let _ = this.groups;
      _.length === 0 &&
        (_ = [
          {
            start: 0,
            count: e.count
          }
        ]);
      for (let t = 0, n = _.length; t < n; ++t) {
        let n = _[t],
          r = n.start,
          i = n.count;
        for (let t = r, n = r + i; t < n; t += 3) g(e.getX(t + 0), e.getX(t + 1), e.getX(t + 2));
      }
      let v = new J(),
        y = new J(),
        b = new J(),
        x = new J();
      function S(e) {
        (b.fromBufferAttribute(r, e), x.copy(b));
        let t = o[e];
        (v.copy(t), v.sub(b.multiplyScalar(b.dot(t))).normalize(), y.crossVectors(x, t));
        let n = y.dot(s[e]) < 0 ? -1 : 1;
        a.setXYZW(e, v.x, v.y, v.z, n);
      }
      for (let t = 0, n = _.length; t < n; ++t) {
        let n = _[t],
          r = n.start,
          i = n.count;
        for (let t = r, n = r + i; t < n; t += 3)
          (S(e.getX(t + 0)), S(e.getX(t + 1)), S(e.getX(t + 2)));
      }
    }
    computeVertexNormals() {
      let e = this.index,
        t = this.getAttribute('position');
      if (t !== void 0) {
        let n = this.getAttribute('normal');
        if (n === void 0)
          ((n = new ur(new Float32Array(t.count * 3), 3)), this.setAttribute('normal', n));
        else for (let e = 0, t = n.count; e < t; e++) n.setXYZ(e, 0, 0, 0);
        let r = new J(),
          i = new J(),
          a = new J(),
          o = new J(),
          s = new J(),
          c = new J(),
          l = new J(),
          u = new J();
        if (e)
          for (let d = 0, f = e.count; d < f; d += 3) {
            let f = e.getX(d + 0),
              p = e.getX(d + 1),
              m = e.getX(d + 2);
            (r.fromBufferAttribute(t, f),
              i.fromBufferAttribute(t, p),
              a.fromBufferAttribute(t, m),
              l.subVectors(a, i),
              u.subVectors(r, i),
              l.cross(u),
              o.fromBufferAttribute(n, f),
              s.fromBufferAttribute(n, p),
              c.fromBufferAttribute(n, m),
              o.add(l),
              s.add(l),
              c.add(l),
              n.setXYZ(f, o.x, o.y, o.z),
              n.setXYZ(p, s.x, s.y, s.z),
              n.setXYZ(m, c.x, c.y, c.z));
          }
        else
          for (let e = 0, o = t.count; e < o; e += 3)
            (r.fromBufferAttribute(t, e + 0),
              i.fromBufferAttribute(t, e + 1),
              a.fromBufferAttribute(t, e + 2),
              l.subVectors(a, i),
              u.subVectors(r, i),
              l.cross(u),
              n.setXYZ(e + 0, l.x, l.y, l.z),
              n.setXYZ(e + 1, l.x, l.y, l.z),
              n.setXYZ(e + 2, l.x, l.y, l.z));
        (this.normalizeNormals(), (n.needsUpdate = !0));
      }
    }
    normalizeNormals() {
      let e = this.attributes.normal;
      for (let t = 0, n = e.count; t < n; t++)
        (wr.fromBufferAttribute(e, t), wr.normalize(), e.setXYZ(t, wr.x, wr.y, wr.z));
    }
    toNonIndexed() {
      function t(e, t) {
        let n = e.array,
          r = e.itemSize,
          i = e.normalized,
          a = new n.constructor(t.length * r),
          o = 0,
          s = 0;
        for (let i = 0, c = t.length; i < c; i++) {
          o = e.isInterleavedBufferAttribute ? t[i] * e.data.stride + e.offset : t[i] * r;
          for (let e = 0; e < r; e++) a[s++] = n[o++];
        }
        return new ur(a, r, i);
      }
      if (this.index === null)
        return (W('BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.'), this);
      let n = new e(),
        r = this.index.array,
        i = this.attributes;
      for (let e in i) {
        let a = i[e],
          o = t(a, r);
        n.setAttribute(e, o);
      }
      let a = this.morphAttributes;
      for (let e in a) {
        let i = [],
          o = a[e];
        for (let e = 0, n = o.length; e < n; e++) {
          let n = o[e],
            a = t(n, r);
          i.push(a);
        }
        n.morphAttributes[e] = i;
      }
      n.morphTargetsRelative = this.morphTargetsRelative;
      let o = this.groups;
      for (let e = 0, t = o.length; e < t; e++) {
        let t = o[e];
        n.addGroup(t.start, t.count, t.materialIndex);
      }
      return n;
    }
    toJSON() {
      let e = {
        metadata: {
          version: 4.7,
          type: 'BufferGeometry',
          generator: 'BufferGeometry.toJSON'
        }
      };
      if (
        ((e.uuid = this.uuid),
        (e.type = this.type),
        this.name !== '' && (e.name = this.name),
        Object.keys(this.userData).length > 0 && (e.userData = this.userData),
        this.parameters !== void 0)
      ) {
        let t = this.parameters;
        for (let n in t) t[n] !== void 0 && (e[n] = t[n]);
        return e;
      }
      e.data = { attributes: {} };
      let t = this.index;
      t !== null &&
        (e.data.index = {
          type: t.array.constructor.name,
          array: Array.prototype.slice.call(t.array)
        });
      let n = this.attributes;
      for (let t in n) {
        let r = n[t];
        e.data.attributes[t] = r.toJSON(e.data);
      }
      let r = {},
        i = !1;
      for (let t in this.morphAttributes) {
        let n = this.morphAttributes[t],
          a = [];
        for (let t = 0, r = n.length; t < r; t++) {
          let r = n[t];
          a.push(r.toJSON(e.data));
        }
        a.length > 0 && ((r[t] = a), (i = !0));
      }
      i &&
        ((e.data.morphAttributes = r), (e.data.morphTargetsRelative = this.morphTargetsRelative));
      let a = this.groups;
      a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
      let o = this.boundingSphere;
      return (o !== null && (e.data.boundingSphere = o.toJSON()), e);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      ((this.index = null),
        (this.attributes = {}),
        (this.morphAttributes = {}),
        (this.groups = []),
        (this.boundingBox = null),
        (this.boundingSphere = null));
      let t = {};
      this.name = e.name;
      let n = e.index;
      n !== null && this.setIndex(n.clone());
      let r = e.attributes;
      for (let e in r) {
        let n = r[e];
        this.setAttribute(e, n.clone(t));
      }
      let i = e.morphAttributes;
      for (let e in i) {
        let n = [],
          r = i[e];
        for (let e = 0, i = r.length; e < i; e++) n.push(r[e].clone(t));
        this.morphAttributes[e] = n;
      }
      this.morphTargetsRelative = e.morphTargetsRelative;
      let a = e.groups;
      for (let e = 0, t = a.length; e < t; e++) {
        let t = a[e];
        this.addGroup(t.start, t.count, t.materialIndex);
      }
      let o = e.boundingBox;
      o !== null && (this.boundingBox = o.clone());
      let s = e.boundingSphere;
      return (
        s !== null && (this.boundingSphere = s.clone()),
        (this.drawRange.start = e.drawRange.start),
        (this.drawRange.count = e.drawRange.count),
        (this.userData = e.userData),
        this
      );
    }
    dispose() {
      this.dispatchEvent({ type: 'dispose' });
    }
  },
  Er = 0,
  Dr = class extends Qe {
    constructor() {
      (super(),
        (this.isMaterial = !0),
        Object.defineProperty(this, 'id', { value: Er++ }),
        (this.uuid = rt()),
        (this.name = ''),
        (this.type = 'Material'),
        (this.blending = 1),
        (this.side = 0),
        (this.vertexColors = !1),
        (this.opacity = 1),
        (this.transparent = !1),
        (this.alphaHash = !1),
        (this.blendSrc = 204),
        (this.blendDst = 205),
        (this.blendEquation = 100),
        (this.blendSrcAlpha = null),
        (this.blendDstAlpha = null),
        (this.blendEquationAlpha = null),
        (this.blendColor = new X(0, 0, 0)),
        (this.blendAlpha = 0),
        (this.depthFunc = 3),
        (this.depthTest = !0),
        (this.depthWrite = !0),
        (this.stencilWriteMask = 255),
        (this.stencilFunc = 519),
        (this.stencilRef = 0),
        (this.stencilFuncMask = 255),
        (this.stencilFail = Re),
        (this.stencilZFail = Re),
        (this.stencilZPass = Re),
        (this.stencilWrite = !1),
        (this.clippingPlanes = null),
        (this.clipIntersection = !1),
        (this.clipShadows = !1),
        (this.shadowSide = null),
        (this.colorWrite = !0),
        (this.precision = null),
        (this.polygonOffset = !1),
        (this.polygonOffsetFactor = 0),
        (this.polygonOffsetUnits = 0),
        (this.dithering = !1),
        (this.alphaToCoverage = !1),
        (this.premultipliedAlpha = !1),
        (this.forceSinglePass = !1),
        (this.allowOverride = !0),
        (this.visible = !0),
        (this.toneMapped = !0),
        (this.userData = {}),
        (this.version = 0),
        (this._alphaTest = 0));
    }
    get alphaTest() {
      return this._alphaTest;
    }
    set alphaTest(e) {
      (this._alphaTest > 0 != e > 0 && this.version++, (this._alphaTest = e));
    }
    onBeforeRender() {}
    onBeforeCompile() {}
    customProgramCacheKey() {
      return this.onBeforeCompile.toString();
    }
    setValues(e) {
      if (e !== void 0)
        for (let t in e) {
          let n = e[t];
          if (n === void 0) {
            W(`Material: parameter '${t}' has value of undefined.`);
            continue;
          }
          let r = this[t];
          if (r === void 0) {
            W(`Material: '${t}' is not a property of THREE.${this.type}.`);
            continue;
          }
          r && r.isColor
            ? r.set(n)
            : r && r.isVector3 && n && n.isVector3
              ? r.copy(n)
              : (this[t] = n);
        }
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == 'string';
      t &&
        (e = {
          textures: {},
          images: {}
        });
      let n = {
        metadata: {
          version: 4.7,
          type: 'Material',
          generator: 'Material.toJSON'
        }
      };
      ((n.uuid = this.uuid),
        (n.type = this.type),
        this.name !== '' && (n.name = this.name),
        this.color && this.color.isColor && (n.color = this.color.getHex()),
        this.roughness !== void 0 && (n.roughness = this.roughness),
        this.metalness !== void 0 && (n.metalness = this.metalness),
        this.sheen !== void 0 && (n.sheen = this.sheen),
        this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()),
        this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness),
        this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()),
        this.emissiveIntensity !== void 0 &&
          this.emissiveIntensity !== 1 &&
          (n.emissiveIntensity = this.emissiveIntensity),
        this.specular && this.specular.isColor && (n.specular = this.specular.getHex()),
        this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity),
        this.specularColor &&
          this.specularColor.isColor &&
          (n.specularColor = this.specularColor.getHex()),
        this.shininess !== void 0 && (n.shininess = this.shininess),
        this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat),
        this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness),
        this.clearcoatMap &&
          this.clearcoatMap.isTexture &&
          (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid),
        this.clearcoatRoughnessMap &&
          this.clearcoatRoughnessMap.isTexture &&
          (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid),
        this.clearcoatNormalMap &&
          this.clearcoatNormalMap.isTexture &&
          ((n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid),
          (n.clearcoatNormalScale = this.clearcoatNormalScale.toArray())),
        this.sheenColorMap &&
          this.sheenColorMap.isTexture &&
          (n.sheenColorMap = this.sheenColorMap.toJSON(e).uuid),
        this.sheenRoughnessMap &&
          this.sheenRoughnessMap.isTexture &&
          (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(e).uuid),
        this.dispersion !== void 0 && (n.dispersion = this.dispersion),
        this.iridescence !== void 0 && (n.iridescence = this.iridescence),
        this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR),
        this.iridescenceThicknessRange !== void 0 &&
          (n.iridescenceThicknessRange = this.iridescenceThicknessRange),
        this.iridescenceMap &&
          this.iridescenceMap.isTexture &&
          (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid),
        this.iridescenceThicknessMap &&
          this.iridescenceThicknessMap.isTexture &&
          (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid),
        this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy),
        this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation),
        this.anisotropyMap &&
          this.anisotropyMap.isTexture &&
          (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid),
        this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid),
        this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid),
        this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid),
        this.lightMap &&
          this.lightMap.isTexture &&
          ((n.lightMap = this.lightMap.toJSON(e).uuid),
          (n.lightMapIntensity = this.lightMapIntensity)),
        this.aoMap &&
          this.aoMap.isTexture &&
          ((n.aoMap = this.aoMap.toJSON(e).uuid), (n.aoMapIntensity = this.aoMapIntensity)),
        this.bumpMap &&
          this.bumpMap.isTexture &&
          ((n.bumpMap = this.bumpMap.toJSON(e).uuid), (n.bumpScale = this.bumpScale)),
        this.normalMap &&
          this.normalMap.isTexture &&
          ((n.normalMap = this.normalMap.toJSON(e).uuid),
          (n.normalMapType = this.normalMapType),
          (n.normalScale = this.normalScale.toArray())),
        this.displacementMap &&
          this.displacementMap.isTexture &&
          ((n.displacementMap = this.displacementMap.toJSON(e).uuid),
          (n.displacementScale = this.displacementScale),
          (n.displacementBias = this.displacementBias)),
        this.roughnessMap &&
          this.roughnessMap.isTexture &&
          (n.roughnessMap = this.roughnessMap.toJSON(e).uuid),
        this.metalnessMap &&
          this.metalnessMap.isTexture &&
          (n.metalnessMap = this.metalnessMap.toJSON(e).uuid),
        this.emissiveMap &&
          this.emissiveMap.isTexture &&
          (n.emissiveMap = this.emissiveMap.toJSON(e).uuid),
        this.specularMap &&
          this.specularMap.isTexture &&
          (n.specularMap = this.specularMap.toJSON(e).uuid),
        this.specularIntensityMap &&
          this.specularIntensityMap.isTexture &&
          (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid),
        this.specularColorMap &&
          this.specularColorMap.isTexture &&
          (n.specularColorMap = this.specularColorMap.toJSON(e).uuid),
        this.envMap &&
          this.envMap.isTexture &&
          ((n.envMap = this.envMap.toJSON(e).uuid),
          this.combine !== void 0 && (n.combine = this.combine)),
        this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()),
        this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity),
        this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity),
        this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio),
        this.gradientMap &&
          this.gradientMap.isTexture &&
          (n.gradientMap = this.gradientMap.toJSON(e).uuid),
        this.transmission !== void 0 && (n.transmission = this.transmission),
        this.transmissionMap &&
          this.transmissionMap.isTexture &&
          (n.transmissionMap = this.transmissionMap.toJSON(e).uuid),
        this.thickness !== void 0 && (n.thickness = this.thickness),
        this.thicknessMap &&
          this.thicknessMap.isTexture &&
          (n.thicknessMap = this.thicknessMap.toJSON(e).uuid),
        this.attenuationDistance !== void 0 &&
          this.attenuationDistance !== Infinity &&
          (n.attenuationDistance = this.attenuationDistance),
        this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()),
        this.size !== void 0 && (n.size = this.size),
        this.shadowSide !== null && (n.shadowSide = this.shadowSide),
        this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation),
        this.blending !== 1 && (n.blending = this.blending),
        this.side !== 0 && (n.side = this.side),
        this.vertexColors === !0 && (n.vertexColors = !0),
        this.opacity < 1 && (n.opacity = this.opacity),
        this.transparent === !0 && (n.transparent = !0),
        this.blendSrc !== 204 && (n.blendSrc = this.blendSrc),
        this.blendDst !== 205 && (n.blendDst = this.blendDst),
        this.blendEquation !== 100 && (n.blendEquation = this.blendEquation),
        this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha),
        this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha),
        this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha),
        this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()),
        this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha),
        this.depthFunc !== 3 && (n.depthFunc = this.depthFunc),
        this.depthTest === !1 && (n.depthTest = this.depthTest),
        this.depthWrite === !1 && (n.depthWrite = this.depthWrite),
        this.colorWrite === !1 && (n.colorWrite = this.colorWrite),
        this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask),
        this.stencilFunc !== 519 && (n.stencilFunc = this.stencilFunc),
        this.stencilRef !== 0 && (n.stencilRef = this.stencilRef),
        this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask),
        this.stencilFail !== 7680 && (n.stencilFail = this.stencilFail),
        this.stencilZFail !== 7680 && (n.stencilZFail = this.stencilZFail),
        this.stencilZPass !== 7680 && (n.stencilZPass = this.stencilZPass),
        this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite),
        this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation),
        this.polygonOffset === !0 && (n.polygonOffset = !0),
        this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor),
        this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits),
        this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth),
        this.dashSize !== void 0 && (n.dashSize = this.dashSize),
        this.gapSize !== void 0 && (n.gapSize = this.gapSize),
        this.scale !== void 0 && (n.scale = this.scale),
        this.dithering === !0 && (n.dithering = !0),
        this.alphaTest > 0 && (n.alphaTest = this.alphaTest),
        this.alphaHash === !0 && (n.alphaHash = !0),
        this.alphaToCoverage === !0 && (n.alphaToCoverage = !0),
        this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0),
        this.forceSinglePass === !0 && (n.forceSinglePass = !0),
        this.allowOverride === !1 && (n.allowOverride = !1),
        this.wireframe === !0 && (n.wireframe = !0),
        this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth),
        this.wireframeLinecap !== 'round' && (n.wireframeLinecap = this.wireframeLinecap),
        this.wireframeLinejoin !== 'round' && (n.wireframeLinejoin = this.wireframeLinejoin),
        this.flatShading === !0 && (n.flatShading = !0),
        this.visible === !1 && (n.visible = !1),
        this.toneMapped === !1 && (n.toneMapped = !1),
        this.fog === !1 && (n.fog = !1),
        Object.keys(this.userData).length > 0 && (n.userData = this.userData));
      function r(e) {
        let t = [];
        for (let n in e) {
          let r = e[n];
          (delete r.metadata, t.push(r));
        }
        return t;
      }
      if (t) {
        let t = r(e.textures),
          i = r(e.images);
        (t.length > 0 && (n.textures = t), i.length > 0 && (n.images = i));
      }
      return n;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      ((this.name = e.name),
        (this.blending = e.blending),
        (this.side = e.side),
        (this.vertexColors = e.vertexColors),
        (this.opacity = e.opacity),
        (this.transparent = e.transparent),
        (this.blendSrc = e.blendSrc),
        (this.blendDst = e.blendDst),
        (this.blendEquation = e.blendEquation),
        (this.blendSrcAlpha = e.blendSrcAlpha),
        (this.blendDstAlpha = e.blendDstAlpha),
        (this.blendEquationAlpha = e.blendEquationAlpha),
        this.blendColor.copy(e.blendColor),
        (this.blendAlpha = e.blendAlpha),
        (this.depthFunc = e.depthFunc),
        (this.depthTest = e.depthTest),
        (this.depthWrite = e.depthWrite),
        (this.stencilWriteMask = e.stencilWriteMask),
        (this.stencilFunc = e.stencilFunc),
        (this.stencilRef = e.stencilRef),
        (this.stencilFuncMask = e.stencilFuncMask),
        (this.stencilFail = e.stencilFail),
        (this.stencilZFail = e.stencilZFail),
        (this.stencilZPass = e.stencilZPass),
        (this.stencilWrite = e.stencilWrite));
      let t = e.clippingPlanes,
        n = null;
      if (t !== null) {
        let e = t.length;
        n = Array(e);
        for (let r = 0; r !== e; ++r) n[r] = t[r].clone();
      }
      return (
        (this.clippingPlanes = n),
        (this.clipIntersection = e.clipIntersection),
        (this.clipShadows = e.clipShadows),
        (this.shadowSide = e.shadowSide),
        (this.colorWrite = e.colorWrite),
        (this.precision = e.precision),
        (this.polygonOffset = e.polygonOffset),
        (this.polygonOffsetFactor = e.polygonOffsetFactor),
        (this.polygonOffsetUnits = e.polygonOffsetUnits),
        (this.dithering = e.dithering),
        (this.alphaTest = e.alphaTest),
        (this.alphaHash = e.alphaHash),
        (this.alphaToCoverage = e.alphaToCoverage),
        (this.premultipliedAlpha = e.premultipliedAlpha),
        (this.forceSinglePass = e.forceSinglePass),
        (this.allowOverride = e.allowOverride),
        (this.visible = e.visible),
        (this.toneMapped = e.toneMapped),
        (this.userData = JSON.parse(JSON.stringify(e.userData))),
        this
      );
    }
    dispose() {
      this.dispatchEvent({ type: 'dispose' });
    }
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
  },
  Or = /*@__PURE__*/ new J(),
  kr = /*@__PURE__*/ new J(),
  Ar = /*@__PURE__*/ new J(),
  jr = /*@__PURE__*/ new J(),
  Mr = /*@__PURE__*/ new J(),
  Nr = /*@__PURE__*/ new J(),
  Pr = /*@__PURE__*/ new J(),
  Fr = class {
    constructor(e = new J(), t = new J(0, 0, -1)) {
      ((this.origin = e), (this.direction = t));
    }
    set(e, t) {
      return (this.origin.copy(e), this.direction.copy(t), this);
    }
    copy(e) {
      return (this.origin.copy(e.origin), this.direction.copy(e.direction), this);
    }
    at(e, t) {
      return t.copy(this.origin).addScaledVector(this.direction, e);
    }
    lookAt(e) {
      return (this.direction.copy(e).sub(this.origin).normalize(), this);
    }
    recast(e) {
      return (this.origin.copy(this.at(e, Or)), this);
    }
    closestPointToPoint(e, t) {
      t.subVectors(e, this.origin);
      let n = t.dot(this.direction);
      return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
    }
    distanceToPoint(e) {
      return Math.sqrt(this.distanceSqToPoint(e));
    }
    distanceSqToPoint(e) {
      let t = Or.subVectors(e, this.origin).dot(this.direction);
      return t < 0
        ? this.origin.distanceToSquared(e)
        : (Or.copy(this.origin).addScaledVector(this.direction, t), Or.distanceToSquared(e));
    }
    distanceSqToSegment(e, t, n, r) {
      (kr.copy(e).add(t).multiplyScalar(0.5),
        Ar.copy(t).sub(e).normalize(),
        jr.copy(this.origin).sub(kr));
      let i = e.distanceTo(t) * 0.5,
        a = -this.direction.dot(Ar),
        o = jr.dot(this.direction),
        s = -jr.dot(Ar),
        c = jr.lengthSq(),
        l = Math.abs(1 - a * a),
        u,
        d,
        f,
        p;
      if (l > 0)
        if (((u = a * s - o), (d = a * o - s), (p = i * l), u >= 0))
          if (d >= -p)
            if (d <= p) {
              let e = 1 / l;
              ((u *= e), (d *= e), (f = u * (u + a * d + 2 * o) + d * (a * u + d + 2 * s) + c));
            } else ((d = i), (u = Math.max(0, -(a * d + o))), (f = -u * u + d * (d + 2 * s) + c));
          else ((d = -i), (u = Math.max(0, -(a * d + o))), (f = -u * u + d * (d + 2 * s) + c));
        else
          d <= -p
            ? ((u = Math.max(0, -(-a * i + o))),
              (d = u > 0 ? -i : Math.min(Math.max(-i, -s), i)),
              (f = -u * u + d * (d + 2 * s) + c))
            : d <= p
              ? ((u = 0), (d = Math.min(Math.max(-i, -s), i)), (f = d * (d + 2 * s) + c))
              : ((u = Math.max(0, -(a * i + o))),
                (d = u > 0 ? i : Math.min(Math.max(-i, -s), i)),
                (f = -u * u + d * (d + 2 * s) + c));
      else
        ((d = a > 0 ? -i : i), (u = Math.max(0, -(a * d + o))), (f = -u * u + d * (d + 2 * s) + c));
      return (
        n && n.copy(this.origin).addScaledVector(this.direction, u),
        r && r.copy(kr).addScaledVector(Ar, d),
        f
      );
    }
    intersectSphere(e, t) {
      Or.subVectors(e.center, this.origin);
      let n = Or.dot(this.direction),
        r = Or.dot(Or) - n * n,
        i = e.radius * e.radius;
      if (r > i) return null;
      let a = Math.sqrt(i - r),
        o = n - a,
        s = n + a;
      return s < 0 ? null : o < 0 ? this.at(s, t) : this.at(o, t);
    }
    intersectsSphere(e) {
      return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius;
    }
    distanceToPlane(e) {
      let t = e.normal.dot(this.direction);
      if (t === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
      let n = -(this.origin.dot(e.normal) + e.constant) / t;
      return n >= 0 ? n : null;
    }
    intersectPlane(e, t) {
      let n = this.distanceToPlane(e);
      return n === null ? null : this.at(n, t);
    }
    intersectsPlane(e) {
      let t = e.distanceToPoint(this.origin);
      return t === 0 || e.normal.dot(this.direction) * t < 0;
    }
    intersectBox(e, t) {
      let n,
        r,
        i,
        a,
        o,
        s,
        c = 1 / this.direction.x,
        l = 1 / this.direction.y,
        u = 1 / this.direction.z,
        d = this.origin;
      return (
        c >= 0
          ? ((n = (e.min.x - d.x) * c), (r = (e.max.x - d.x) * c))
          : ((n = (e.max.x - d.x) * c), (r = (e.min.x - d.x) * c)),
        l >= 0
          ? ((i = (e.min.y - d.y) * l), (a = (e.max.y - d.y) * l))
          : ((i = (e.max.y - d.y) * l), (a = (e.min.y - d.y) * l)),
        n > a ||
        i > r ||
        ((i > n || isNaN(n)) && (n = i),
        (a < r || isNaN(r)) && (r = a),
        u >= 0
          ? ((o = (e.min.z - d.z) * u), (s = (e.max.z - d.z) * u))
          : ((o = (e.max.z - d.z) * u), (s = (e.min.z - d.z) * u)),
        n > s || o > r) ||
        ((o > n || n !== n) && (n = o), (s < r || r !== r) && (r = s), r < 0)
          ? null
          : this.at(n >= 0 ? n : r, t)
      );
    }
    intersectsBox(e) {
      return this.intersectBox(e, Or) !== null;
    }
    intersectTriangle(e, t, n, r, i) {
      (Mr.subVectors(t, e), Nr.subVectors(n, e), Pr.crossVectors(Mr, Nr));
      let a = this.direction.dot(Pr),
        o;
      if (a > 0) {
        if (r) return null;
        o = 1;
      } else if (a < 0) ((o = -1), (a = -a));
      else return null;
      jr.subVectors(this.origin, e);
      let s = o * this.direction.dot(Nr.crossVectors(jr, Nr));
      if (s < 0) return null;
      let c = o * this.direction.dot(Mr.cross(jr));
      if (c < 0 || s + c > a) return null;
      let l = -o * jr.dot(Pr);
      return l < 0 ? null : this.at(l / a, i);
    }
    applyMatrix4(e) {
      return (this.origin.applyMatrix4(e), this.direction.transformDirection(e), this);
    }
    equals(e) {
      return e.origin.equals(this.origin) && e.direction.equals(this.direction);
    }
    clone() {
      return new this.constructor().copy(this);
    }
  },
  Ir = class extends Dr {
    constructor(e) {
      (super(),
        (this.isMeshBasicMaterial = !0),
        (this.type = 'MeshBasicMaterial'),
        (this.color = new X(16777215)),
        (this.map = null),
        (this.lightMap = null),
        (this.lightMapIntensity = 1),
        (this.aoMap = null),
        (this.aoMapIntensity = 1),
        (this.specularMap = null),
        (this.alphaMap = null),
        (this.envMap = null),
        (this.envMapRotation = new an()),
        (this.combine = 0),
        (this.reflectivity = 1),
        (this.refractionRatio = 0.98),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.wireframeLinecap = 'round'),
        (this.wireframeLinejoin = 'round'),
        (this.fog = !0),
        this.setValues(e));
    }
    copy(e) {
      return (
        super.copy(e),
        this.color.copy(e.color),
        (this.map = e.map),
        (this.lightMap = e.lightMap),
        (this.lightMapIntensity = e.lightMapIntensity),
        (this.aoMap = e.aoMap),
        (this.aoMapIntensity = e.aoMapIntensity),
        (this.specularMap = e.specularMap),
        (this.alphaMap = e.alphaMap),
        (this.envMap = e.envMap),
        this.envMapRotation.copy(e.envMapRotation),
        (this.combine = e.combine),
        (this.reflectivity = e.reflectivity),
        (this.refractionRatio = e.refractionRatio),
        (this.wireframe = e.wireframe),
        (this.wireframeLinewidth = e.wireframeLinewidth),
        (this.wireframeLinecap = e.wireframeLinecap),
        (this.wireframeLinejoin = e.wireframeLinejoin),
        (this.fog = e.fog),
        this
      );
    }
  },
  Lr = /*@__PURE__*/ new Jt(),
  Rr = /*@__PURE__*/ new Fr(),
  zr = /*@__PURE__*/ new _r(),
  Br = /*@__PURE__*/ new J(),
  Vr = /*@__PURE__*/ new J(),
  Hr = /*@__PURE__*/ new J(),
  Ur = /*@__PURE__*/ new J(),
  Wr = /*@__PURE__*/ new J(),
  Gr = /*@__PURE__*/ new J(),
  Kr = /*@__PURE__*/ new J(),
  qr = /*@__PURE__*/ new J(),
  Jr = class extends Sn {
    constructor(e = new Tr(), t = new Ir()) {
      (super(),
        (this.isMesh = !0),
        (this.type = 'Mesh'),
        (this.geometry = e),
        (this.material = t),
        (this.morphTargetDictionary = void 0),
        (this.morphTargetInfluences = void 0),
        (this.count = 1),
        this.updateMorphTargets());
    }
    copy(e, t) {
      return (
        super.copy(e, t),
        e.morphTargetInfluences !== void 0 &&
          (this.morphTargetInfluences = e.morphTargetInfluences.slice()),
        e.morphTargetDictionary !== void 0 &&
          (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)),
        (this.material = Array.isArray(e.material) ? e.material.slice() : e.material),
        (this.geometry = e.geometry),
        this
      );
    }
    updateMorphTargets() {
      let e = this.geometry.morphAttributes,
        t = Object.keys(e);
      if (t.length > 0) {
        let n = e[t[0]];
        if (n !== void 0) {
          ((this.morphTargetInfluences = []), (this.morphTargetDictionary = {}));
          for (let e = 0, t = n.length; e < t; e++) {
            let t = n[e].name || String(e);
            (this.morphTargetInfluences.push(0), (this.morphTargetDictionary[t] = e));
          }
        }
      }
    }
    getVertexPosition(e, t) {
      let n = this.geometry,
        r = n.attributes.position,
        i = n.morphAttributes.position,
        a = n.morphTargetsRelative;
      t.fromBufferAttribute(r, e);
      let o = this.morphTargetInfluences;
      if (i && o) {
        Gr.set(0, 0, 0);
        for (let n = 0, r = i.length; n < r; n++) {
          let r = o[n],
            s = i[n];
          r !== 0 &&
            (Wr.fromBufferAttribute(s, e),
            a ? Gr.addScaledVector(Wr, r) : Gr.addScaledVector(Wr.sub(t), r));
        }
        t.add(Gr);
      }
      return t;
    }
    raycast(e, t) {
      let n = this.geometry,
        r = this.material,
        i = this.matrixWorld;
      r !== void 0 &&
        (n.boundingSphere === null && n.computeBoundingSphere(),
        zr.copy(n.boundingSphere),
        zr.applyMatrix4(i),
        Rr.copy(e.ray).recast(e.near),
        !(
          zr.containsPoint(Rr.origin) === !1 &&
          (Rr.intersectSphere(zr, Br) === null ||
            Rr.origin.distanceToSquared(Br) > (e.far - e.near) ** 2)
        ) &&
          (Lr.copy(i).invert(),
          Rr.copy(e.ray).applyMatrix4(Lr),
          !(n.boundingBox !== null && Rr.intersectsBox(n.boundingBox) === !1) &&
            this._computeIntersections(e, t, Rr)));
    }
    _computeIntersections(e, t, n) {
      let r,
        i = this.geometry,
        a = this.material,
        o = i.index,
        s = i.attributes.position,
        c = i.attributes.uv,
        l = i.attributes.uv1,
        u = i.attributes.normal,
        d = i.groups,
        f = i.drawRange;
      if (o !== null)
        if (Array.isArray(a))
          for (let i = 0, s = d.length; i < s; i++) {
            let s = d[i],
              p = a[s.materialIndex],
              m = Math.max(s.start, f.start),
              h = Math.min(o.count, Math.min(s.start + s.count, f.start + f.count));
            for (let i = m, a = h; i < a; i += 3) {
              let a = o.getX(i),
                d = o.getX(i + 1),
                f = o.getX(i + 2);
              ((r = Xr(this, p, e, n, c, l, u, a, d, f)),
                r &&
                  ((r.faceIndex = Math.floor(i / 3)),
                  (r.face.materialIndex = s.materialIndex),
                  t.push(r)));
            }
          }
        else {
          let i = Math.max(0, f.start),
            s = Math.min(o.count, f.start + f.count);
          for (let d = i, f = s; d < f; d += 3) {
            let i = o.getX(d),
              s = o.getX(d + 1),
              f = o.getX(d + 2);
            ((r = Xr(this, a, e, n, c, l, u, i, s, f)),
              r && ((r.faceIndex = Math.floor(d / 3)), t.push(r)));
          }
        }
      else if (s !== void 0)
        if (Array.isArray(a))
          for (let i = 0, o = d.length; i < o; i++) {
            let o = d[i],
              p = a[o.materialIndex],
              m = Math.max(o.start, f.start),
              h = Math.min(s.count, Math.min(o.start + o.count, f.start + f.count));
            for (let i = m, a = h; i < a; i += 3) {
              let a = i,
                s = i + 1,
                d = i + 2;
              ((r = Xr(this, p, e, n, c, l, u, a, s, d)),
                r &&
                  ((r.faceIndex = Math.floor(i / 3)),
                  (r.face.materialIndex = o.materialIndex),
                  t.push(r)));
            }
          }
        else {
          let i = Math.max(0, f.start),
            o = Math.min(s.count, f.start + f.count);
          for (let s = i, d = o; s < d; s += 3) {
            let i = s,
              o = s + 1,
              d = s + 2;
            ((r = Xr(this, a, e, n, c, l, u, i, o, d)),
              r && ((r.faceIndex = Math.floor(s / 3)), t.push(r)));
          }
        }
    }
  };
function Yr(e, t, n, r, i, a, o, s) {
  let c;
  if (
    ((c =
      t.side === 1
        ? r.intersectTriangle(o, a, i, !0, s)
        : r.intersectTriangle(i, a, o, t.side === 0, s)),
    c === null)
  )
    return null;
  (qr.copy(s), qr.applyMatrix4(e.matrixWorld));
  let l = n.ray.origin.distanceTo(qr);
  return l < n.near || l > n.far
    ? null
    : {
        distance: l,
        point: qr.clone(),
        object: e
      };
}
function Xr(e, t, n, r, i, a, o, s, c, l) {
  (e.getVertexPosition(s, Vr), e.getVertexPosition(c, Hr), e.getVertexPosition(l, Ur));
  let u = Yr(e, t, n, r, Vr, Hr, Ur, Kr);
  if (u) {
    let e = new J();
    (Gn.getBarycoord(Kr, Vr, Hr, Ur, e),
      i && (u.uv = Gn.getInterpolatedAttribute(i, s, c, l, e, new q())),
      a && (u.uv1 = Gn.getInterpolatedAttribute(a, s, c, l, e, new q())),
      o &&
        ((u.normal = Gn.getInterpolatedAttribute(o, s, c, l, e, new J())),
        u.normal.dot(r.direction) > 0 && u.normal.multiplyScalar(-1)));
    let t = {
      a: s,
      b: c,
      c: l,
      normal: new J(),
      materialIndex: 0
    };
    (Gn.getNormal(Vr, Hr, Ur, t.normal), (u.face = t), (u.barycoord = e));
  }
  return u;
}
var Zr = class extends Ht {
    constructor(e = null, t = 1, n = 1, r, i, o, s, c, l = a, u = a, d, f) {
      (super(null, o, s, c, l, u, r, i, d, f),
        (this.isDataTexture = !0),
        (this.image = {
          data: e,
          width: t,
          height: n
        }),
        (this.generateMipmaps = !1),
        (this.flipY = !1),
        (this.unpackAlignment = 1));
    }
  },
  Qr = class extends ur {
    constructor(e, t, n, r = 1) {
      (super(e, t, n), (this.isInstancedBufferAttribute = !0), (this.meshPerAttribute = r));
    }
    copy(e) {
      return (super.copy(e), (this.meshPerAttribute = e.meshPerAttribute), this);
    }
    toJSON() {
      let e = super.toJSON();
      return ((e.meshPerAttribute = this.meshPerAttribute), (e.isInstancedBufferAttribute = !0), e);
    }
  },
  $r = /*@__PURE__*/ new Jt(),
  ei = /*@__PURE__*/ new Jt(),
  ti = [],
  ni = /*@__PURE__*/ new Kn(),
  ri = /*@__PURE__*/ new Jt(),
  ii = /*@__PURE__*/ new Jr(),
  ai = /*@__PURE__*/ new _r(),
  oi = class extends Jr {
    constructor(e, t, n) {
      (super(e, t),
        (this.isInstancedMesh = !0),
        (this.instanceMatrix = new Qr(new Float32Array(n * 16), 16)),
        (this.previousInstanceMatrix = null),
        (this.instanceColor = null),
        (this.morphTexture = null),
        (this.count = n),
        (this.boundingBox = null),
        (this.boundingSphere = null));
      for (let e = 0; e < n; e++) this.setMatrixAt(e, ri);
    }
    computeBoundingBox() {
      let e = this.geometry,
        t = this.count;
      (this.boundingBox === null && (this.boundingBox = new Kn()),
        e.boundingBox === null && e.computeBoundingBox(),
        this.boundingBox.makeEmpty());
      for (let n = 0; n < t; n++)
        (this.getMatrixAt(n, $r),
          ni.copy(e.boundingBox).applyMatrix4($r),
          this.boundingBox.union(ni));
    }
    computeBoundingSphere() {
      let e = this.geometry,
        t = this.count;
      (this.boundingSphere === null && (this.boundingSphere = new _r()),
        e.boundingSphere === null && e.computeBoundingSphere(),
        this.boundingSphere.makeEmpty());
      for (let n = 0; n < t; n++)
        (this.getMatrixAt(n, $r),
          ai.copy(e.boundingSphere).applyMatrix4($r),
          this.boundingSphere.union(ai));
    }
    copy(e, t) {
      return (
        super.copy(e, t),
        this.instanceMatrix.copy(e.instanceMatrix),
        e.previousInstanceMatrix !== null &&
          (this.previousInstanceMatrix = e.previousInstanceMatrix.clone()),
        e.morphTexture !== null && (this.morphTexture = e.morphTexture.clone()),
        e.instanceColor !== null && (this.instanceColor = e.instanceColor.clone()),
        (this.count = e.count),
        e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()),
        e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()),
        this
      );
    }
    getColorAt(e, t) {
      return this.instanceColor === null
        ? t.setRGB(1, 1, 1)
        : t.fromArray(this.instanceColor.array, e * 3);
    }
    getMatrixAt(e, t) {
      return t.fromArray(this.instanceMatrix.array, e * 16);
    }
    getMorphAt(e, t) {
      let n = t.morphTargetInfluences,
        r = this.morphTexture.source.data.data,
        i = e * (n.length + 1) + 1;
      for (let e = 0; e < n.length; e++) n[e] = r[i + e];
    }
    raycast(e, t) {
      let n = this.matrixWorld,
        r = this.count;
      if (
        ((ii.geometry = this.geometry),
        (ii.material = this.material),
        ii.material !== void 0 &&
          (this.boundingSphere === null && this.computeBoundingSphere(),
          ai.copy(this.boundingSphere),
          ai.applyMatrix4(n),
          e.ray.intersectsSphere(ai) !== !1))
      )
        for (let i = 0; i < r; i++) {
          (this.getMatrixAt(i, $r),
            ei.multiplyMatrices(n, $r),
            (ii.matrixWorld = ei),
            ii.raycast(e, ti));
          for (let e = 0, n = ti.length; e < n; e++) {
            let n = ti[e];
            ((n.instanceId = i), (n.object = this), t.push(n));
          }
          ti.length = 0;
        }
    }
    setColorAt(e, t) {
      return (
        this.instanceColor === null &&
          (this.instanceColor = new Qr(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)),
        t.toArray(this.instanceColor.array, e * 3),
        this
      );
    }
    setMatrixAt(e, t) {
      return (t.toArray(this.instanceMatrix.array, e * 16), this);
    }
    setMorphAt(e, t) {
      let n = t.morphTargetInfluences,
        r = n.length + 1;
      this.morphTexture === null &&
        (this.morphTexture = new Zr(new Float32Array(r * this.count), r, this.count, k, _));
      let i = this.morphTexture.source.data.data,
        a = 0;
      for (let e = 0; e < n.length; e++) a += n[e];
      let o = this.geometry.morphTargetsRelative ? 1 : 1 - a,
        s = r * e;
      return ((i[s] = o), i.set(n, s + 1), this);
    }
    updateMorphTargets() {}
    dispose() {
      (this.dispatchEvent({ type: 'dispose' }),
        this.morphTexture !== null && (this.morphTexture.dispose(), (this.morphTexture = null)));
    }
  },
  si = /*@__PURE__*/ new J(),
  ci = /*@__PURE__*/ new J(),
  li = /*@__PURE__*/ new Y(),
  ui = class {
    constructor(e = new J(1, 0, 0), t = 0) {
      ((this.isPlane = !0), (this.normal = e), (this.constant = t));
    }
    set(e, t) {
      return (this.normal.copy(e), (this.constant = t), this);
    }
    setComponents(e, t, n, r) {
      return (this.normal.set(e, t, n), (this.constant = r), this);
    }
    setFromNormalAndCoplanarPoint(e, t) {
      return (this.normal.copy(e), (this.constant = -t.dot(this.normal)), this);
    }
    setFromCoplanarPoints(e, t, n) {
      let r = si.subVectors(n, t).cross(ci.subVectors(e, t)).normalize();
      return (this.setFromNormalAndCoplanarPoint(r, e), this);
    }
    copy(e) {
      return (this.normal.copy(e.normal), (this.constant = e.constant), this);
    }
    normalize() {
      let e = 1 / this.normal.length();
      return (this.normal.multiplyScalar(e), (this.constant *= e), this);
    }
    negate() {
      return ((this.constant *= -1), this.normal.negate(), this);
    }
    distanceToPoint(e) {
      return this.normal.dot(e) + this.constant;
    }
    distanceToSphere(e) {
      return this.distanceToPoint(e.center) - e.radius;
    }
    projectPoint(e, t) {
      return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
    }
    intersectLine(e, t, n = !0) {
      let r = e.delta(si),
        i = this.normal.dot(r);
      if (i === 0) return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
      let a = -(e.start.dot(this.normal) + this.constant) / i;
      return n === !0 && (a < 0 || a > 1) ? null : t.copy(e.start).addScaledVector(r, a);
    }
    intersectsLine(e) {
      let t = this.distanceToPoint(e.start),
        n = this.distanceToPoint(e.end);
      return (t < 0 && n > 0) || (n < 0 && t > 0);
    }
    intersectsBox(e) {
      return e.intersectsPlane(this);
    }
    intersectsSphere(e) {
      return e.intersectsPlane(this);
    }
    coplanarPoint(e) {
      return e.copy(this.normal).multiplyScalar(-this.constant);
    }
    applyMatrix4(e, t) {
      let n = t || li.getNormalMatrix(e),
        r = this.coplanarPoint(si).applyMatrix4(e),
        i = this.normal.applyMatrix3(n).normalize();
      return ((this.constant = -r.dot(i)), this);
    }
    translate(e) {
      return ((this.constant -= e.dot(this.normal)), this);
    }
    equals(e) {
      return e.normal.equals(this.normal) && e.constant === this.constant;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  },
  di = /*@__PURE__*/ new _r(),
  fi = /*@__PURE__*/ new q(0.5, 0.5),
  pi = /*@__PURE__*/ new J(),
  mi = class {
    constructor(
      e = new ui(),
      t = new ui(),
      n = new ui(),
      r = new ui(),
      i = new ui(),
      a = new ui()
    ) {
      this.planes = [e, t, n, r, i, a];
    }
    set(e, t, n, r, i, a) {
      let o = this.planes;
      return (
        o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(r), o[4].copy(i), o[5].copy(a), this
      );
    }
    copy(e) {
      let t = this.planes;
      for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
      return this;
    }
    setFromProjectionMatrix(e, t = Be, n = !1) {
      let r = this.planes,
        i = e.elements,
        a = i[0],
        o = i[1],
        s = i[2],
        c = i[3],
        l = i[4],
        u = i[5],
        d = i[6],
        f = i[7],
        p = i[8],
        m = i[9],
        h = i[10],
        g = i[11],
        _ = i[12],
        v = i[13],
        y = i[14],
        b = i[15];
      if (
        (r[0].setComponents(c - a, f - l, g - p, b - _).normalize(),
        r[1].setComponents(c + a, f + l, g + p, b + _).normalize(),
        r[2].setComponents(c + o, f + u, g + m, b + v).normalize(),
        r[3].setComponents(c - o, f - u, g - m, b - v).normalize(),
        n)
      )
        (r[4].setComponents(s, d, h, y).normalize(),
          r[5].setComponents(c - s, f - d, g - h, b - y).normalize());
      else if ((r[4].setComponents(c - s, f - d, g - h, b - y).normalize(), t === 2e3))
        r[5].setComponents(c + s, f + d, g + h, b + y).normalize();
      else if (t === 2001) r[5].setComponents(s, d, h, y).normalize();
      else throw Error('THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: ' + t);
      return this;
    }
    intersectsObject(e) {
      if (e.boundingSphere !== void 0)
        (e.boundingSphere === null && e.computeBoundingSphere(),
          di.copy(e.boundingSphere).applyMatrix4(e.matrixWorld));
      else {
        let t = e.geometry;
        (t.boundingSphere === null && t.computeBoundingSphere(),
          di.copy(t.boundingSphere).applyMatrix4(e.matrixWorld));
      }
      return this.intersectsSphere(di);
    }
    intersectsSprite(e) {
      return (
        di.center.set(0, 0, 0),
        (di.radius = 0.7071067811865476 + fi.distanceTo(e.center)),
        di.applyMatrix4(e.matrixWorld),
        this.intersectsSphere(di)
      );
    }
    intersectsSphere(e) {
      let t = this.planes,
        n = e.center,
        r = -e.radius;
      for (let e = 0; e < 6; e++) if (t[e].distanceToPoint(n) < r) return !1;
      return !0;
    }
    intersectsBox(e) {
      let t = this.planes;
      for (let n = 0; n < 6; n++) {
        let r = t[n];
        if (
          ((pi.x = r.normal.x > 0 ? e.max.x : e.min.x),
          (pi.y = r.normal.y > 0 ? e.max.y : e.min.y),
          (pi.z = r.normal.z > 0 ? e.max.z : e.min.z),
          r.distanceToPoint(pi) < 0)
        )
          return !1;
      }
      return !0;
    }
    containsPoint(e) {
      let t = this.planes;
      for (let n = 0; n < 6; n++) if (t[n].distanceToPoint(e) < 0) return !1;
      return !0;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  },
  hi = class extends Ht {
    constructor(e = [], t = 301, n, r, i, a, o, s, c, l) {
      (super(e, t, n, r, i, a, o, s, c, l), (this.isCubeTexture = !0), (this.flipY = !1));
    }
    get images() {
      return this.image;
    }
    set images(e) {
      this.image = e;
    }
  },
  gi = class extends Ht {
    constructor(e, t, n, r, i, a, o, s, c) {
      (super(e, t, n, r, i, a, o, s, c), (this.isCanvasTexture = !0), (this.needsUpdate = !0));
    }
  },
  _i = class extends Ht {
    constructor(e, t, n = g, r, i, o, s = a, c = a, l, u = D, d = 1) {
      if (u !== 1026 && u !== 1027)
        throw Error(
          'DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat'
        );
      (super(
        {
          width: e,
          height: t,
          depth: d
        },
        r,
        i,
        o,
        s,
        c,
        u,
        n,
        l
      ),
        (this.isDepthTexture = !0),
        (this.flipY = !1),
        (this.generateMipmaps = !1),
        (this.compareFunction = null));
    }
    copy(e) {
      return (
        super.copy(e),
        (this.source = new Rt(Object.assign({}, e.image))),
        (this.compareFunction = e.compareFunction),
        this
      );
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return (this.compareFunction !== null && (t.compareFunction = this.compareFunction), t);
    }
  },
  vi = class extends _i {
    constructor(e, t = g, n = 301, r, i, o = a, s = a, c, l = D) {
      let u = {
          width: e,
          height: e,
          depth: 1
        },
        d = [u, u, u, u, u, u];
      (super(e, e, t, n, r, i, o, s, c, l),
        (this.image = d),
        (this.isCubeDepthTexture = !0),
        (this.isCubeTexture = !0));
    }
    get images() {
      return this.image;
    }
    set images(e) {
      this.image = e;
    }
  },
  yi = class extends Ht {
    constructor(e = null) {
      (super(), (this.sourceTexture = e), (this.isExternalTexture = !0));
    }
    copy(e) {
      return (super.copy(e), (this.sourceTexture = e.sourceTexture), this);
    }
  },
  bi = class e extends Tr {
    constructor(e = 1, t = 1, n = 1, r = 1, i = 1, a = 1) {
      (super(),
        (this.type = 'BoxGeometry'),
        (this.parameters = {
          width: e,
          height: t,
          depth: n,
          widthSegments: r,
          heightSegments: i,
          depthSegments: a
        }));
      let o = this;
      ((r = Math.floor(r)), (i = Math.floor(i)), (a = Math.floor(a)));
      let s = [],
        c = [],
        l = [],
        u = [],
        d = 0,
        f = 0;
      (p('z', 'y', 'x', -1, -1, n, t, e, a, i, 0),
        p('z', 'y', 'x', 1, -1, n, t, -e, a, i, 1),
        p('x', 'z', 'y', 1, 1, e, n, t, r, a, 2),
        p('x', 'z', 'y', 1, -1, e, n, -t, r, a, 3),
        p('x', 'y', 'z', 1, -1, e, t, n, r, i, 4),
        p('x', 'y', 'z', -1, -1, e, t, -n, r, i, 5),
        this.setIndex(s),
        this.setAttribute('position', new pr(c, 3)),
        this.setAttribute('normal', new pr(l, 3)),
        this.setAttribute('uv', new pr(u, 2)));
      function p(e, t, n, r, i, a, p, m, h, g, _) {
        let v = a / h,
          y = p / g,
          b = a / 2,
          x = p / 2,
          S = m / 2,
          C = h + 1,
          w = g + 1,
          T = 0,
          E = 0,
          D = new J();
        for (let a = 0; a < w; a++) {
          let o = a * y - x;
          for (let s = 0; s < C; s++)
            ((D[e] = (s * v - b) * r),
              (D[t] = o * i),
              (D[n] = S),
              c.push(D.x, D.y, D.z),
              (D[e] = 0),
              (D[t] = 0),
              (D[n] = m > 0 ? 1 : -1),
              l.push(D.x, D.y, D.z),
              u.push(s / h),
              u.push(1 - a / g),
              (T += 1));
        }
        for (let e = 0; e < g; e++)
          for (let t = 0; t < h; t++) {
            let n = d + t + C * e,
              r = d + t + C * (e + 1),
              i = d + (t + 1) + C * (e + 1),
              a = d + (t + 1) + C * e;
            (s.push(n, r, a), s.push(r, i, a), (E += 6));
          }
        (o.addGroup(f, E, _), (f += E), (d += T));
      }
    }
    copy(e) {
      return (super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this);
    }
    static fromJSON(t) {
      return new e(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
    }
  },
  xi = class e extends Tr {
    constructor(e = 1, t = 1, n = 1, r = 32, i = 1, a = !1, o = 0, s = Math.PI * 2) {
      (super(),
        (this.type = 'CylinderGeometry'),
        (this.parameters = {
          radiusTop: e,
          radiusBottom: t,
          height: n,
          radialSegments: r,
          heightSegments: i,
          openEnded: a,
          thetaStart: o,
          thetaLength: s
        }));
      let c = this;
      ((r = Math.floor(r)), (i = Math.floor(i)));
      let l = [],
        u = [],
        d = [],
        f = [],
        p = 0,
        m = [],
        h = n / 2,
        g = 0;
      (_(),
        a === !1 && (e > 0 && v(!0), t > 0 && v(!1)),
        this.setIndex(l),
        this.setAttribute('position', new pr(u, 3)),
        this.setAttribute('normal', new pr(d, 3)),
        this.setAttribute('uv', new pr(f, 2)));
      function _() {
        let a = new J(),
          _ = new J(),
          v = 0,
          y = (t - e) / n;
        for (let c = 0; c <= i; c++) {
          let l = [],
            g = c / i,
            v = g * (t - e) + e;
          for (let e = 0; e <= r; e++) {
            let t = e / r,
              i = t * s + o,
              c = Math.sin(i),
              m = Math.cos(i);
            ((_.x = v * c),
              (_.y = -g * n + h),
              (_.z = v * m),
              u.push(_.x, _.y, _.z),
              a.set(c, y, m).normalize(),
              d.push(a.x, a.y, a.z),
              f.push(t, 1 - g),
              l.push(p++));
          }
          m.push(l);
        }
        for (let n = 0; n < r; n++)
          for (let r = 0; r < i; r++) {
            let a = m[r][n],
              o = m[r + 1][n],
              s = m[r + 1][n + 1],
              c = m[r][n + 1];
            ((e > 0 || r !== 0) && (l.push(a, o, c), (v += 3)),
              (t > 0 || r !== i - 1) && (l.push(o, s, c), (v += 3)));
          }
        (c.addGroup(g, v, 0), (g += v));
      }
      function v(n) {
        let i = p,
          a = new q(),
          m = new J(),
          _ = 0,
          v = n === !0 ? e : t,
          y = n === !0 ? 1 : -1;
        for (let e = 1; e <= r; e++) (u.push(0, h * y, 0), d.push(0, y, 0), f.push(0.5, 0.5), p++);
        let b = p;
        for (let e = 0; e <= r; e++) {
          let t = (e / r) * s + o,
            n = Math.cos(t),
            i = Math.sin(t);
          ((m.x = v * i),
            (m.y = h * y),
            (m.z = v * n),
            u.push(m.x, m.y, m.z),
            d.push(0, y, 0),
            (a.x = n * 0.5 + 0.5),
            (a.y = i * 0.5 * y + 0.5),
            f.push(a.x, a.y),
            p++);
        }
        for (let e = 0; e < r; e++) {
          let t = i + e,
            r = b + e;
          (n === !0 ? l.push(r, r + 1, t) : l.push(r + 1, r, t), (_ += 3));
        }
        (c.addGroup(g, _, n === !0 ? 1 : 2), (g += _));
      }
    }
    copy(e) {
      return (super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this);
    }
    static fromJSON(t) {
      return new e(
        t.radiusTop,
        t.radiusBottom,
        t.height,
        t.radialSegments,
        t.heightSegments,
        t.openEnded,
        t.thetaStart,
        t.thetaLength
      );
    }
  },
  Si = class {
    constructor() {
      ((this.type = 'Curve'),
        (this.arcLengthDivisions = 200),
        (this.needsUpdate = !1),
        (this.cacheArcLengths = null));
    }
    getPoint() {
      W('Curve: .getPoint() not implemented.');
    }
    getPointAt(e, t) {
      let n = this.getUtoTmapping(e);
      return this.getPoint(n, t);
    }
    getPoints(e = 5) {
      let t = [];
      for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
      return t;
    }
    getSpacedPoints(e = 5) {
      let t = [];
      for (let n = 0; n <= e; n++) t.push(this.getPointAt(n / e));
      return t;
    }
    getLength() {
      let e = this.getLengths();
      return e[e.length - 1];
    }
    getLengths(e = this.arcLengthDivisions) {
      if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate)
        return this.cacheArcLengths;
      this.needsUpdate = !1;
      let t = [],
        n,
        r = this.getPoint(0),
        i = 0;
      t.push(0);
      for (let a = 1; a <= e; a++)
        ((n = this.getPoint(a / e)), (i += n.distanceTo(r)), t.push(i), (r = n));
      return ((this.cacheArcLengths = t), t);
    }
    updateArcLengths() {
      ((this.needsUpdate = !0), this.getLengths());
    }
    getUtoTmapping(e, t = null) {
      let n = this.getLengths(),
        r = 0,
        i = n.length,
        a;
      a = t || e * n[i - 1];
      let o = 0,
        s = i - 1,
        c;
      for (; o <= s; )
        if (((r = Math.floor(o + (s - o) / 2)), (c = n[r] - a), c < 0)) o = r + 1;
        else if (c > 0) s = r - 1;
        else {
          s = r;
          break;
        }
      if (((r = s), n[r] === a)) return r / (i - 1);
      let l = n[r],
        u = n[r + 1] - l,
        d = (a - l) / u;
      return (r + d) / (i - 1);
    }
    getTangent(e, t) {
      let n = 1e-4,
        r = e - n,
        i = e + n;
      (r < 0 && (r = 0), i > 1 && (i = 1));
      let a = this.getPoint(r),
        o = this.getPoint(i),
        s = t || (a.isVector2 ? new q() : new J());
      return (s.copy(o).sub(a).normalize(), s);
    }
    getTangentAt(e, t) {
      let n = this.getUtoTmapping(e);
      return this.getTangent(n, t);
    }
    computeFrenetFrames(e, t = !1) {
      let n = new J(),
        r = [],
        i = [],
        a = [],
        o = new J(),
        s = new Jt();
      for (let t = 0; t <= e; t++) {
        let n = t / e;
        r[t] = this.getTangentAt(n, new J());
      }
      ((i[0] = new J()), (a[0] = new J()));
      let c = Number.MAX_VALUE,
        l = Math.abs(r[0].x),
        u = Math.abs(r[0].y),
        d = Math.abs(r[0].z);
      (l <= c && ((c = l), n.set(1, 0, 0)),
        u <= c && ((c = u), n.set(0, 1, 0)),
        d <= c && n.set(0, 0, 1),
        o.crossVectors(r[0], n).normalize(),
        i[0].crossVectors(r[0], o),
        a[0].crossVectors(r[0], i[0]));
      for (let t = 1; t <= e; t++) {
        if (
          ((i[t] = i[t - 1].clone()),
          (a[t] = a[t - 1].clone()),
          o.crossVectors(r[t - 1], r[t]),
          o.length() > 2 ** -52)
        ) {
          o.normalize();
          let e = Math.acos(K(r[t - 1].dot(r[t]), -1, 1));
          i[t].applyMatrix4(s.makeRotationAxis(o, e));
        }
        a[t].crossVectors(r[t], i[t]);
      }
      if (t === !0) {
        let t = Math.acos(K(i[0].dot(i[e]), -1, 1));
        ((t /= e), r[0].dot(o.crossVectors(i[0], i[e])) > 0 && (t = -t));
        for (let n = 1; n <= e; n++)
          (i[n].applyMatrix4(s.makeRotationAxis(r[n], t * n)), a[n].crossVectors(r[n], i[n]));
      }
      return {
        tangents: r,
        normals: i,
        binormals: a
      };
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return ((this.arcLengthDivisions = e.arcLengthDivisions), this);
    }
    toJSON() {
      let e = {
        metadata: {
          version: 4.7,
          type: 'Curve',
          generator: 'Curve.toJSON'
        }
      };
      return ((e.arcLengthDivisions = this.arcLengthDivisions), (e.type = this.type), e);
    }
    fromJSON(e) {
      return ((this.arcLengthDivisions = e.arcLengthDivisions), this);
    }
  },
  Ci = class extends Si {
    constructor(e = 0, t = 0, n = 1, r = 1, i = 0, a = Math.PI * 2, o = !1, s = 0) {
      (super(),
        (this.isEllipseCurve = !0),
        (this.type = 'EllipseCurve'),
        (this.aX = e),
        (this.aY = t),
        (this.xRadius = n),
        (this.yRadius = r),
        (this.aStartAngle = i),
        (this.aEndAngle = a),
        (this.aClockwise = o),
        (this.aRotation = s));
    }
    getPoint(e, t = new q()) {
      let n = t,
        r = Math.PI * 2,
        i = this.aEndAngle - this.aStartAngle,
        a = Math.abs(i) < 2 ** -52;
      for (; i < 0; ) i += r;
      for (; i > r; ) i -= r;
      (i < 2 ** -52 && (i = a ? 0 : r),
        this.aClockwise === !0 && !a && (i === r ? (i = -r) : (i -= r)));
      let o = this.aStartAngle + e * i,
        s = this.aX + this.xRadius * Math.cos(o),
        c = this.aY + this.yRadius * Math.sin(o);
      if (this.aRotation !== 0) {
        let e = Math.cos(this.aRotation),
          t = Math.sin(this.aRotation),
          n = s - this.aX,
          r = c - this.aY;
        ((s = n * e - r * t + this.aX), (c = n * t + r * e + this.aY));
      }
      return n.set(s, c);
    }
    copy(e) {
      return (
        super.copy(e),
        (this.aX = e.aX),
        (this.aY = e.aY),
        (this.xRadius = e.xRadius),
        (this.yRadius = e.yRadius),
        (this.aStartAngle = e.aStartAngle),
        (this.aEndAngle = e.aEndAngle),
        (this.aClockwise = e.aClockwise),
        (this.aRotation = e.aRotation),
        this
      );
    }
    toJSON() {
      let e = super.toJSON();
      return (
        (e.aX = this.aX),
        (e.aY = this.aY),
        (e.xRadius = this.xRadius),
        (e.yRadius = this.yRadius),
        (e.aStartAngle = this.aStartAngle),
        (e.aEndAngle = this.aEndAngle),
        (e.aClockwise = this.aClockwise),
        (e.aRotation = this.aRotation),
        e
      );
    }
    fromJSON(e) {
      return (
        super.fromJSON(e),
        (this.aX = e.aX),
        (this.aY = e.aY),
        (this.xRadius = e.xRadius),
        (this.yRadius = e.yRadius),
        (this.aStartAngle = e.aStartAngle),
        (this.aEndAngle = e.aEndAngle),
        (this.aClockwise = e.aClockwise),
        (this.aRotation = e.aRotation),
        this
      );
    }
  },
  wi = class extends Ci {
    constructor(e, t, n, r, i, a) {
      (super(e, t, n, n, r, i, a), (this.isArcCurve = !0), (this.type = 'ArcCurve'));
    }
  };
function Ti() {
  let e = 0,
    t = 0,
    n = 0,
    r = 0;
  function i(i, a, o, s) {
    ((e = i), (t = o), (n = -3 * i + 3 * a - 2 * o - s), (r = 2 * i - 2 * a + o + s));
  }
  return {
    initCatmullRom: function (e, t, n, r, a) {
      i(t, n, a * (n - e), a * (r - t));
    },
    initNonuniformCatmullRom: function (e, t, n, r, a, o, s) {
      let c = (t - e) / a - (n - e) / (a + o) + (n - t) / o,
        l = (n - t) / o - (r - t) / (o + s) + (r - n) / s;
      ((c *= o), (l *= o), i(t, n, c, l));
    },
    calc: function (i) {
      let a = i * i,
        o = a * i;
      return e + t * i + n * a + r * o;
    }
  };
}
var Ei = /*@__PURE__*/ new J(),
  Di = /*@__PURE__*/ new J(),
  Oi = /*@__PURE__*/ new Ti(),
  ki = /*@__PURE__*/ new Ti(),
  Ai = /*@__PURE__*/ new Ti(),
  ji = class extends Si {
    constructor(e = [], t = !1, n = 'centripetal', r = 0.5) {
      (super(),
        (this.isCatmullRomCurve3 = !0),
        (this.type = 'CatmullRomCurve3'),
        (this.points = e),
        (this.closed = t),
        (this.curveType = n),
        (this.tension = r));
    }
    getPoint(e, t = new J()) {
      let n = t,
        r = this.points,
        i = r.length,
        a = (i - +!this.closed) * e,
        o = Math.floor(a),
        s = a - o;
      this.closed
        ? (o += o > 0 ? 0 : (Math.floor(Math.abs(o) / i) + 1) * i)
        : s === 0 && o === i - 1 && ((o = i - 2), (s = 1));
      let c, l;
      this.closed || o > 0 ? (c = r[(o - 1) % i]) : (Di.subVectors(r[0], r[1]).add(r[0]), (c = Di));
      let u = r[o % i],
        d = r[(o + 1) % i];
      if (
        (this.closed || o + 2 < i
          ? (l = r[(o + 2) % i])
          : (Ei.subVectors(r[i - 1], r[i - 2]).add(r[i - 1]), (l = Ei)),
        this.curveType === 'centripetal' || this.curveType === 'chordal')
      ) {
        let e = this.curveType === 'chordal' ? 0.5 : 0.25,
          t = c.distanceToSquared(u) ** +e,
          n = u.distanceToSquared(d) ** +e,
          r = d.distanceToSquared(l) ** +e;
        (n < 1e-4 && (n = 1),
          t < 1e-4 && (t = n),
          r < 1e-4 && (r = n),
          Oi.initNonuniformCatmullRom(c.x, u.x, d.x, l.x, t, n, r),
          ki.initNonuniformCatmullRom(c.y, u.y, d.y, l.y, t, n, r),
          Ai.initNonuniformCatmullRom(c.z, u.z, d.z, l.z, t, n, r));
      } else
        this.curveType === 'catmullrom' &&
          (Oi.initCatmullRom(c.x, u.x, d.x, l.x, this.tension),
          ki.initCatmullRom(c.y, u.y, d.y, l.y, this.tension),
          Ai.initCatmullRom(c.z, u.z, d.z, l.z, this.tension));
      return (n.set(Oi.calc(s), ki.calc(s), Ai.calc(s)), n);
    }
    copy(e) {
      (super.copy(e), (this.points = []));
      for (let t = 0, n = e.points.length; t < n; t++) {
        let n = e.points[t];
        this.points.push(n.clone());
      }
      return (
        (this.closed = e.closed), (this.curveType = e.curveType), (this.tension = e.tension), this
      );
    }
    toJSON() {
      let e = super.toJSON();
      e.points = [];
      for (let t = 0, n = this.points.length; t < n; t++) {
        let n = this.points[t];
        e.points.push(n.toArray());
      }
      return (
        (e.closed = this.closed), (e.curveType = this.curveType), (e.tension = this.tension), e
      );
    }
    fromJSON(e) {
      (super.fromJSON(e), (this.points = []));
      for (let t = 0, n = e.points.length; t < n; t++) {
        let n = e.points[t];
        this.points.push(new J().fromArray(n));
      }
      return (
        (this.closed = e.closed), (this.curveType = e.curveType), (this.tension = e.tension), this
      );
    }
  };
function Mi(e, t, n, r, i) {
  let a = (r - t) * 0.5,
    o = (i - n) * 0.5,
    s = e * e,
    c = e * s;
  return (2 * n - 2 * r + a + o) * c + (-3 * n + 3 * r - 2 * a - o) * s + a * e + n;
}
function Ni(e, t) {
  let n = 1 - e;
  return n * n * t;
}
function Pi(e, t) {
  return 2 * (1 - e) * e * t;
}
function Fi(e, t) {
  return e * e * t;
}
function Ii(e, t, n, r) {
  return Ni(e, t) + Pi(e, n) + Fi(e, r);
}
function Li(e, t) {
  let n = 1 - e;
  return n * n * n * t;
}
function Ri(e, t) {
  let n = 1 - e;
  return 3 * n * n * e * t;
}
function zi(e, t) {
  return 3 * (1 - e) * e * e * t;
}
function Bi(e, t) {
  return e * e * e * t;
}
function Vi(e, t, n, r, i) {
  return Li(e, t) + Ri(e, n) + zi(e, r) + Bi(e, i);
}
var Hi = class extends Si {
    constructor(e = new q(), t = new q(), n = new q(), r = new q()) {
      (super(),
        (this.isCubicBezierCurve = !0),
        (this.type = 'CubicBezierCurve'),
        (this.v0 = e),
        (this.v1 = t),
        (this.v2 = n),
        (this.v3 = r));
    }
    getPoint(e, t = new q()) {
      let n = t,
        r = this.v0,
        i = this.v1,
        a = this.v2,
        o = this.v3;
      return (n.set(Vi(e, r.x, i.x, a.x, o.x), Vi(e, r.y, i.y, a.y, o.y)), n);
    }
    copy(e) {
      return (
        super.copy(e),
        this.v0.copy(e.v0),
        this.v1.copy(e.v1),
        this.v2.copy(e.v2),
        this.v3.copy(e.v3),
        this
      );
    }
    toJSON() {
      let e = super.toJSON();
      return (
        (e.v0 = this.v0.toArray()),
        (e.v1 = this.v1.toArray()),
        (e.v2 = this.v2.toArray()),
        (e.v3 = this.v3.toArray()),
        e
      );
    }
    fromJSON(e) {
      return (
        super.fromJSON(e),
        this.v0.fromArray(e.v0),
        this.v1.fromArray(e.v1),
        this.v2.fromArray(e.v2),
        this.v3.fromArray(e.v3),
        this
      );
    }
  },
  Ui = class extends Si {
    constructor(e = new J(), t = new J(), n = new J(), r = new J()) {
      (super(),
        (this.isCubicBezierCurve3 = !0),
        (this.type = 'CubicBezierCurve3'),
        (this.v0 = e),
        (this.v1 = t),
        (this.v2 = n),
        (this.v3 = r));
    }
    getPoint(e, t = new J()) {
      let n = t,
        r = this.v0,
        i = this.v1,
        a = this.v2,
        o = this.v3;
      return (
        n.set(Vi(e, r.x, i.x, a.x, o.x), Vi(e, r.y, i.y, a.y, o.y), Vi(e, r.z, i.z, a.z, o.z)), n
      );
    }
    copy(e) {
      return (
        super.copy(e),
        this.v0.copy(e.v0),
        this.v1.copy(e.v1),
        this.v2.copy(e.v2),
        this.v3.copy(e.v3),
        this
      );
    }
    toJSON() {
      let e = super.toJSON();
      return (
        (e.v0 = this.v0.toArray()),
        (e.v1 = this.v1.toArray()),
        (e.v2 = this.v2.toArray()),
        (e.v3 = this.v3.toArray()),
        e
      );
    }
    fromJSON(e) {
      return (
        super.fromJSON(e),
        this.v0.fromArray(e.v0),
        this.v1.fromArray(e.v1),
        this.v2.fromArray(e.v2),
        this.v3.fromArray(e.v3),
        this
      );
    }
  },
  Wi = class extends Si {
    constructor(e = new q(), t = new q()) {
      (super(), (this.isLineCurve = !0), (this.type = 'LineCurve'), (this.v1 = e), (this.v2 = t));
    }
    getPoint(e, t = new q()) {
      let n = t;
      return (
        e === 1
          ? n.copy(this.v2)
          : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(e).add(this.v1)),
        n
      );
    }
    getPointAt(e, t) {
      return this.getPoint(e, t);
    }
    getTangent(e, t = new q()) {
      return t.subVectors(this.v2, this.v1).normalize();
    }
    getTangentAt(e, t) {
      return this.getTangent(e, t);
    }
    copy(e) {
      return (super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this);
    }
    toJSON() {
      let e = super.toJSON();
      return ((e.v1 = this.v1.toArray()), (e.v2 = this.v2.toArray()), e);
    }
    fromJSON(e) {
      return (super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this);
    }
  },
  Gi = class extends Si {
    constructor(e = new J(), t = new J()) {
      (super(), (this.isLineCurve3 = !0), (this.type = 'LineCurve3'), (this.v1 = e), (this.v2 = t));
    }
    getPoint(e, t = new J()) {
      let n = t;
      return (
        e === 1
          ? n.copy(this.v2)
          : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(e).add(this.v1)),
        n
      );
    }
    getPointAt(e, t) {
      return this.getPoint(e, t);
    }
    getTangent(e, t = new J()) {
      return t.subVectors(this.v2, this.v1).normalize();
    }
    getTangentAt(e, t) {
      return this.getTangent(e, t);
    }
    copy(e) {
      return (super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this);
    }
    toJSON() {
      let e = super.toJSON();
      return ((e.v1 = this.v1.toArray()), (e.v2 = this.v2.toArray()), e);
    }
    fromJSON(e) {
      return (super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this);
    }
  },
  Ki = class extends Si {
    constructor(e = new q(), t = new q(), n = new q()) {
      (super(),
        (this.isQuadraticBezierCurve = !0),
        (this.type = 'QuadraticBezierCurve'),
        (this.v0 = e),
        (this.v1 = t),
        (this.v2 = n));
    }
    getPoint(e, t = new q()) {
      let n = t,
        r = this.v0,
        i = this.v1,
        a = this.v2;
      return (n.set(Ii(e, r.x, i.x, a.x), Ii(e, r.y, i.y, a.y)), n);
    }
    copy(e) {
      return (super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this);
    }
    toJSON() {
      let e = super.toJSON();
      return (
        (e.v0 = this.v0.toArray()), (e.v1 = this.v1.toArray()), (e.v2 = this.v2.toArray()), e
      );
    }
    fromJSON(e) {
      return (
        super.fromJSON(e),
        this.v0.fromArray(e.v0),
        this.v1.fromArray(e.v1),
        this.v2.fromArray(e.v2),
        this
      );
    }
  },
  qi = class extends Si {
    constructor(e = new J(), t = new J(), n = new J()) {
      (super(),
        (this.isQuadraticBezierCurve3 = !0),
        (this.type = 'QuadraticBezierCurve3'),
        (this.v0 = e),
        (this.v1 = t),
        (this.v2 = n));
    }
    getPoint(e, t = new J()) {
      let n = t,
        r = this.v0,
        i = this.v1,
        a = this.v2;
      return (n.set(Ii(e, r.x, i.x, a.x), Ii(e, r.y, i.y, a.y), Ii(e, r.z, i.z, a.z)), n);
    }
    copy(e) {
      return (super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this);
    }
    toJSON() {
      let e = super.toJSON();
      return (
        (e.v0 = this.v0.toArray()), (e.v1 = this.v1.toArray()), (e.v2 = this.v2.toArray()), e
      );
    }
    fromJSON(e) {
      return (
        super.fromJSON(e),
        this.v0.fromArray(e.v0),
        this.v1.fromArray(e.v1),
        this.v2.fromArray(e.v2),
        this
      );
    }
  },
  Ji = class extends Si {
    constructor(e = []) {
      (super(), (this.isSplineCurve = !0), (this.type = 'SplineCurve'), (this.points = e));
    }
    getPoint(e, t = new q()) {
      let n = t,
        r = this.points,
        i = (r.length - 1) * e,
        a = Math.floor(i),
        o = i - a,
        s = r[a === 0 ? a : a - 1],
        c = r[a],
        l = r[a > r.length - 2 ? r.length - 1 : a + 1],
        u = r[a > r.length - 3 ? r.length - 1 : a + 2];
      return (n.set(Mi(o, s.x, c.x, l.x, u.x), Mi(o, s.y, c.y, l.y, u.y)), n);
    }
    copy(e) {
      (super.copy(e), (this.points = []));
      for (let t = 0, n = e.points.length; t < n; t++) {
        let n = e.points[t];
        this.points.push(n.clone());
      }
      return this;
    }
    toJSON() {
      let e = super.toJSON();
      e.points = [];
      for (let t = 0, n = this.points.length; t < n; t++) {
        let n = this.points[t];
        e.points.push(n.toArray());
      }
      return e;
    }
    fromJSON(e) {
      (super.fromJSON(e), (this.points = []));
      for (let t = 0, n = e.points.length; t < n; t++) {
        let n = e.points[t];
        this.points.push(new q().fromArray(n));
      }
      return this;
    }
  },
  Yi = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    ArcCurve: wi,
    CatmullRomCurve3: ji,
    CubicBezierCurve: Hi,
    CubicBezierCurve3: Ui,
    EllipseCurve: Ci,
    LineCurve: Wi,
    LineCurve3: Gi,
    QuadraticBezierCurve: Ki,
    QuadraticBezierCurve3: qi,
    SplineCurve: Ji
  }),
  Xi = class extends Si {
    constructor() {
      (super(), (this.type = 'CurvePath'), (this.curves = []), (this.autoClose = !1));
    }
    add(e) {
      this.curves.push(e);
    }
    closePath() {
      let e = this.curves[0].getPoint(0),
        t = this.curves[this.curves.length - 1].getPoint(1);
      if (!e.equals(t)) {
        let n = e.isVector2 === !0 ? 'LineCurve' : 'LineCurve3';
        this.curves.push(new Yi[n](t, e));
      }
      return this;
    }
    getPoint(e, t) {
      let n = e * this.getLength(),
        r = this.getCurveLengths(),
        i = 0;
      for (; i < r.length; ) {
        if (r[i] >= n) {
          let e = r[i] - n,
            a = this.curves[i],
            o = a.getLength(),
            s = o === 0 ? 0 : 1 - e / o;
          return a.getPointAt(s, t);
        }
        i++;
      }
      return null;
    }
    getLength() {
      let e = this.getCurveLengths();
      return e[e.length - 1];
    }
    updateArcLengths() {
      ((this.needsUpdate = !0), (this.cacheLengths = null), this.getCurveLengths());
    }
    getCurveLengths() {
      if (this.cacheLengths && this.cacheLengths.length === this.curves.length)
        return this.cacheLengths;
      let e = [],
        t = 0;
      for (let n = 0, r = this.curves.length; n < r; n++)
        ((t += this.curves[n].getLength()), e.push(t));
      return ((this.cacheLengths = e), e);
    }
    getSpacedPoints(e = 40) {
      let t = [];
      for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
      return (this.autoClose && t.push(t[0]), t);
    }
    getPoints(e = 12) {
      let t = [],
        n;
      for (let r = 0, i = this.curves; r < i.length; r++) {
        let a = i[r],
          o = a.isEllipseCurve
            ? e * 2
            : a.isLineCurve || a.isLineCurve3
              ? 1
              : a.isSplineCurve
                ? e * a.points.length
                : e,
          s = a.getPoints(o);
        for (let e = 0; e < s.length; e++) {
          let r = s[e];
          (n && n.equals(r)) || (t.push(r), (n = r));
        }
      }
      return (this.autoClose && t.length > 1 && !t[t.length - 1].equals(t[0]) && t.push(t[0]), t);
    }
    copy(e) {
      (super.copy(e), (this.curves = []));
      for (let t = 0, n = e.curves.length; t < n; t++) {
        let n = e.curves[t];
        this.curves.push(n.clone());
      }
      return ((this.autoClose = e.autoClose), this);
    }
    toJSON() {
      let e = super.toJSON();
      ((e.autoClose = this.autoClose), (e.curves = []));
      for (let t = 0, n = this.curves.length; t < n; t++) {
        let n = this.curves[t];
        e.curves.push(n.toJSON());
      }
      return e;
    }
    fromJSON(e) {
      (super.fromJSON(e), (this.autoClose = e.autoClose), (this.curves = []));
      for (let t = 0, n = e.curves.length; t < n; t++) {
        let n = e.curves[t];
        this.curves.push(new Yi[n.type]().fromJSON(n));
      }
      return this;
    }
  },
  Zi = class extends Xi {
    constructor(e) {
      (super(), (this.type = 'Path'), (this.currentPoint = new q()), e && this.setFromPoints(e));
    }
    setFromPoints(e) {
      this.moveTo(e[0].x, e[0].y);
      for (let t = 1, n = e.length; t < n; t++) this.lineTo(e[t].x, e[t].y);
      return this;
    }
    moveTo(e, t) {
      return (this.currentPoint.set(e, t), this);
    }
    lineTo(e, t) {
      let n = new Wi(this.currentPoint.clone(), new q(e, t));
      return (this.curves.push(n), this.currentPoint.set(e, t), this);
    }
    quadraticCurveTo(e, t, n, r) {
      let i = new Ki(this.currentPoint.clone(), new q(e, t), new q(n, r));
      return (this.curves.push(i), this.currentPoint.set(n, r), this);
    }
    bezierCurveTo(e, t, n, r, i, a) {
      let o = new Hi(this.currentPoint.clone(), new q(e, t), new q(n, r), new q(i, a));
      return (this.curves.push(o), this.currentPoint.set(i, a), this);
    }
    splineThru(e) {
      let t = new Ji([this.currentPoint.clone()].concat(e));
      return (this.curves.push(t), this.currentPoint.copy(e[e.length - 1]), this);
    }
    arc(e, t, n, r, i, a) {
      let o = this.currentPoint.x,
        s = this.currentPoint.y;
      return (this.absarc(e + o, t + s, n, r, i, a), this);
    }
    absarc(e, t, n, r, i, a) {
      return (this.absellipse(e, t, n, n, r, i, a), this);
    }
    ellipse(e, t, n, r, i, a, o, s) {
      let c = this.currentPoint.x,
        l = this.currentPoint.y;
      return (this.absellipse(e + c, t + l, n, r, i, a, o, s), this);
    }
    absellipse(e, t, n, r, i, a, o, s) {
      let c = new Ci(e, t, n, r, i, a, o, s);
      if (this.curves.length > 0) {
        let e = c.getPoint(0);
        e.equals(this.currentPoint) || this.lineTo(e.x, e.y);
      }
      this.curves.push(c);
      let l = c.getPoint(1);
      return (this.currentPoint.copy(l), this);
    }
    copy(e) {
      return (super.copy(e), this.currentPoint.copy(e.currentPoint), this);
    }
    toJSON() {
      let e = super.toJSON();
      return ((e.currentPoint = this.currentPoint.toArray()), e);
    }
    fromJSON(e) {
      return (super.fromJSON(e), this.currentPoint.fromArray(e.currentPoint), this);
    }
  },
  Qi = class extends Zi {
    constructor(e) {
      (super(e), (this.uuid = rt()), (this.type = 'Shape'), (this.holes = []));
    }
    getPointsHoles(e) {
      let t = [];
      for (let n = 0, r = this.holes.length; n < r; n++) t[n] = this.holes[n].getPoints(e);
      return t;
    }
    extractPoints(e) {
      return {
        shape: this.getPoints(e),
        holes: this.getPointsHoles(e)
      };
    }
    copy(e) {
      (super.copy(e), (this.holes = []));
      for (let t = 0, n = e.holes.length; t < n; t++) {
        let n = e.holes[t];
        this.holes.push(n.clone());
      }
      return this;
    }
    toJSON() {
      let e = super.toJSON();
      ((e.uuid = this.uuid), (e.holes = []));
      for (let t = 0, n = this.holes.length; t < n; t++) {
        let n = this.holes[t];
        e.holes.push(n.toJSON());
      }
      return e;
    }
    fromJSON(e) {
      (super.fromJSON(e), (this.uuid = e.uuid), (this.holes = []));
      for (let t = 0, n = e.holes.length; t < n; t++) {
        let n = e.holes[t];
        this.holes.push(new Zi().fromJSON(n));
      }
      return this;
    }
  };
function $i(e, t, n = 2) {
  let r = t && t.length,
    i = r ? t[0] * n : e.length,
    a = ea(e, 0, i, n, !0),
    o = [];
  if (!a || a.next === a.prev) return o;
  let s, c, l;
  if ((r && (a = sa(e, t, a, n)), e.length > 80 * n)) {
    ((s = e[0]), (c = e[1]));
    let t = s,
      r = c;
    for (let a = n; a < i; a += n) {
      let n = e[a],
        i = e[a + 1];
      (n < s && (s = n), i < c && (c = i), n > t && (t = n), i > r && (r = i));
    }
    ((l = Math.max(t - s, r - c)), (l = l === 0 ? 0 : 32767 / l));
  }
  return (na(a, o, n, s, c, l, 0), o);
}
function ea(e, t, n, r, i) {
  let a;
  if (i === ja(e, t, n, r) > 0)
    for (let i = t; i < n; i += r) a = Oa((i / r) | 0, e[i], e[i + 1], a);
  else for (let i = n - r; i >= t; i -= r) a = Oa((i / r) | 0, e[i], e[i + 1], a);
  return (a && ba(a, a.next) && (ka(a), (a = a.next)), a);
}
function ta(e, t) {
  if (!e) return e;
  t ||= e;
  let n = e,
    r;
  do
    if (((r = !1), !n.steiner && (ba(n, n.next) || ya(n.prev, n, n.next) === 0))) {
      if ((ka(n), (n = t = n.prev), n === n.next)) break;
      r = !0;
    } else n = n.next;
  while (r || n !== t);
  return t;
}
function na(e, t, n, r, i, a, o) {
  if (!e) return;
  !o && a && fa(e, r, i, a);
  let s = e;
  for (; e.prev !== e.next; ) {
    let c = e.prev,
      l = e.next;
    if (a ? ia(e, r, i, a) : ra(e)) {
      (t.push(c.i, e.i, l.i), ka(e), (e = l.next), (s = l.next));
      continue;
    }
    if (((e = l), e === s)) {
      o
        ? o === 1
          ? ((e = aa(ta(e), t)), na(e, t, n, r, i, a, 2))
          : o === 2 && oa(e, t, n, r, i, a)
        : na(ta(e), t, n, r, i, a, 1);
      break;
    }
  }
}
function ra(e) {
  let t = e.prev,
    n = e,
    r = e.next;
  if (ya(t, n, r) >= 0) return !1;
  let i = t.x,
    a = n.x,
    o = r.x,
    s = t.y,
    c = n.y,
    l = r.y,
    u = Math.min(i, a, o),
    d = Math.min(s, c, l),
    f = Math.max(i, a, o),
    p = Math.max(s, c, l),
    m = r.next;
  for (; m !== t; ) {
    if (
      m.x >= u &&
      m.x <= f &&
      m.y >= d &&
      m.y <= p &&
      _a(i, s, a, c, o, l, m.x, m.y) &&
      ya(m.prev, m, m.next) >= 0
    )
      return !1;
    m = m.next;
  }
  return !0;
}
function ia(e, t, n, r) {
  let i = e.prev,
    a = e,
    o = e.next;
  if (ya(i, a, o) >= 0) return !1;
  let s = i.x,
    c = a.x,
    l = o.x,
    u = i.y,
    d = a.y,
    f = o.y,
    p = Math.min(s, c, l),
    m = Math.min(u, d, f),
    h = Math.max(s, c, l),
    g = Math.max(u, d, f),
    _ = ma(p, m, t, n, r),
    v = ma(h, g, t, n, r),
    y = e.prevZ,
    b = e.nextZ;
  for (; y && y.z >= _ && b && b.z <= v; ) {
    if (
      (y.x >= p &&
        y.x <= h &&
        y.y >= m &&
        y.y <= g &&
        y !== i &&
        y !== o &&
        _a(s, u, c, d, l, f, y.x, y.y) &&
        ya(y.prev, y, y.next) >= 0) ||
      ((y = y.prevZ),
      b.x >= p &&
        b.x <= h &&
        b.y >= m &&
        b.y <= g &&
        b !== i &&
        b !== o &&
        _a(s, u, c, d, l, f, b.x, b.y) &&
        ya(b.prev, b, b.next) >= 0)
    )
      return !1;
    b = b.nextZ;
  }
  for (; y && y.z >= _; ) {
    if (
      y.x >= p &&
      y.x <= h &&
      y.y >= m &&
      y.y <= g &&
      y !== i &&
      y !== o &&
      _a(s, u, c, d, l, f, y.x, y.y) &&
      ya(y.prev, y, y.next) >= 0
    )
      return !1;
    y = y.prevZ;
  }
  for (; b && b.z <= v; ) {
    if (
      b.x >= p &&
      b.x <= h &&
      b.y >= m &&
      b.y <= g &&
      b !== i &&
      b !== o &&
      _a(s, u, c, d, l, f, b.x, b.y) &&
      ya(b.prev, b, b.next) >= 0
    )
      return !1;
    b = b.nextZ;
  }
  return !0;
}
function aa(e, t) {
  let n = e;
  do {
    let r = n.prev,
      i = n.next.next;
    (!ba(r, i) &&
      xa(r, n, n.next, i) &&
      Ta(r, i) &&
      Ta(i, r) &&
      (t.push(r.i, n.i, i.i), ka(n), ka(n.next), (n = e = i)),
      (n = n.next));
  } while (n !== e);
  return ta(n);
}
function oa(e, t, n, r, i, a) {
  let o = e;
  do {
    let e = o.next.next;
    for (; e !== o.prev; ) {
      if (o.i !== e.i && va(o, e)) {
        let s = Da(o, e);
        ((o = ta(o, o.next)),
          (s = ta(s, s.next)),
          na(o, t, n, r, i, a, 0),
          na(s, t, n, r, i, a, 0));
        return;
      }
      e = e.next;
    }
    o = o.next;
  } while (o !== e);
}
function sa(e, t, n, r) {
  let i = [];
  for (let n = 0, a = t.length; n < a; n++) {
    let o = ea(e, t[n] * r, n < a - 1 ? t[n + 1] * r : e.length, r, !1);
    (o === o.next && (o.steiner = !0), i.push(ha(o)));
  }
  i.sort(ca);
  for (let e = 0; e < i.length; e++) n = la(i[e], n);
  return n;
}
function ca(e, t) {
  let n = e.x - t.x;
  return (
    n === 0 &&
      ((n = e.y - t.y),
      n === 0 && (n = (e.next.y - e.y) / (e.next.x - e.x) - (t.next.y - t.y) / (t.next.x - t.x))),
    n
  );
}
function la(e, t) {
  let n = ua(e, t);
  if (!n) return t;
  let r = Da(n, e);
  return (ta(r, r.next), ta(n, n.next));
}
function ua(e, t) {
  let n = t,
    r = e.x,
    i = e.y,
    a = -Infinity,
    o;
  if (ba(e, n)) return n;
  do {
    if (ba(e, n.next)) return n.next;
    if (i <= n.y && i >= n.next.y && n.next.y !== n.y) {
      let e = n.x + ((i - n.y) * (n.next.x - n.x)) / (n.next.y - n.y);
      if (e <= r && e > a && ((a = e), (o = n.x < n.next.x ? n : n.next), e === r)) return o;
    }
    n = n.next;
  } while (n !== t);
  if (!o) return null;
  let s = o,
    c = o.x,
    l = o.y,
    u = Infinity;
  n = o;
  do {
    if (
      r >= n.x &&
      n.x >= c &&
      r !== n.x &&
      ga(i < l ? r : a, i, c, l, i < l ? a : r, i, n.x, n.y)
    ) {
      let t = Math.abs(i - n.y) / (r - n.x);
      Ta(n, e) &&
        (t < u || (t === u && (n.x > o.x || (n.x === o.x && da(o, n))))) &&
        ((o = n), (u = t));
    }
    n = n.next;
  } while (n !== s);
  return o;
}
function da(e, t) {
  return ya(e.prev, e, t.prev) < 0 && ya(t.next, e, e.next) < 0;
}
function fa(e, t, n, r) {
  let i = e;
  do
    (i.z === 0 && (i.z = ma(i.x, i.y, t, n, r)),
      (i.prevZ = i.prev),
      (i.nextZ = i.next),
      (i = i.next));
  while (i !== e);
  ((i.prevZ.nextZ = null), (i.prevZ = null), pa(i));
}
function pa(e) {
  let t,
    n = 1;
  do {
    let r = e,
      i;
    e = null;
    let a = null;
    for (t = 0; r; ) {
      t++;
      let o = r,
        s = 0;
      for (let e = 0; e < n && (s++, (o = o.nextZ), o); e++);
      let c = n;
      for (; s > 0 || (c > 0 && o); )
        (s !== 0 && (c === 0 || !o || r.z <= o.z)
          ? ((i = r), (r = r.nextZ), s--)
          : ((i = o), (o = o.nextZ), c--),
          a ? (a.nextZ = i) : (e = i),
          (i.prevZ = a),
          (a = i));
      r = o;
    }
    ((a.nextZ = null), (n *= 2));
  } while (t > 1);
  return e;
}
function ma(e, t, n, r, i) {
  return (
    (e = ((e - n) * i) | 0),
    (t = ((t - r) * i) | 0),
    (e = (e | (e << 8)) & 16711935),
    (e = (e | (e << 4)) & 252645135),
    (e = (e | (e << 2)) & 858993459),
    (e = (e | (e << 1)) & 1431655765),
    (t = (t | (t << 8)) & 16711935),
    (t = (t | (t << 4)) & 252645135),
    (t = (t | (t << 2)) & 858993459),
    (t = (t | (t << 1)) & 1431655765),
    e | (t << 1)
  );
}
function ha(e) {
  let t = e,
    n = e;
  do ((t.x < n.x || (t.x === n.x && t.y < n.y)) && (n = t), (t = t.next));
  while (t !== e);
  return n;
}
function ga(e, t, n, r, i, a, o, s) {
  return (
    (i - o) * (t - s) >= (e - o) * (a - s) &&
    (e - o) * (r - s) >= (n - o) * (t - s) &&
    (n - o) * (a - s) >= (i - o) * (r - s)
  );
}
function _a(e, t, n, r, i, a, o, s) {
  return !(e === o && t === s) && ga(e, t, n, r, i, a, o, s);
}
function va(e, t) {
  return (
    e.next.i !== t.i &&
    e.prev.i !== t.i &&
    !wa(e, t) &&
    ((Ta(e, t) && Ta(t, e) && Ea(e, t) && (ya(e.prev, e, t.prev) || ya(e, t.prev, t))) ||
      (ba(e, t) && ya(e.prev, e, e.next) > 0 && ya(t.prev, t, t.next) > 0))
  );
}
function ya(e, t, n) {
  return (t.y - e.y) * (n.x - t.x) - (t.x - e.x) * (n.y - t.y);
}
function ba(e, t) {
  return e.x === t.x && e.y === t.y;
}
function xa(e, t, n, r) {
  let i = Ca(ya(e, t, n)),
    a = Ca(ya(e, t, r)),
    o = Ca(ya(n, r, e)),
    s = Ca(ya(n, r, t));
  return !!(
    (i !== a && o !== s) ||
    (i === 0 && Sa(e, n, t)) ||
    (a === 0 && Sa(e, r, t)) ||
    (o === 0 && Sa(n, e, r)) ||
    (s === 0 && Sa(n, t, r))
  );
}
function Sa(e, t, n) {
  return (
    t.x <= Math.max(e.x, n.x) &&
    t.x >= Math.min(e.x, n.x) &&
    t.y <= Math.max(e.y, n.y) &&
    t.y >= Math.min(e.y, n.y)
  );
}
function Ca(e) {
  return e > 0 ? 1 : e < 0 ? -1 : 0;
}
function wa(e, t) {
  let n = e;
  do {
    if (n.i !== e.i && n.next.i !== e.i && n.i !== t.i && n.next.i !== t.i && xa(n, n.next, e, t))
      return !0;
    n = n.next;
  } while (n !== e);
  return !1;
}
function Ta(e, t) {
  return ya(e.prev, e, e.next) < 0
    ? ya(e, t, e.next) >= 0 && ya(e, e.prev, t) >= 0
    : ya(e, t, e.prev) < 0 || ya(e, e.next, t) < 0;
}
function Ea(e, t) {
  let n = e,
    r = !1,
    i = (e.x + t.x) / 2,
    a = (e.y + t.y) / 2;
  do
    (n.y > a != n.next.y > a &&
      n.next.y !== n.y &&
      i < ((n.next.x - n.x) * (a - n.y)) / (n.next.y - n.y) + n.x &&
      (r = !r),
      (n = n.next));
  while (n !== e);
  return r;
}
function Da(e, t) {
  let n = Aa(e.i, e.x, e.y),
    r = Aa(t.i, t.x, t.y),
    i = e.next,
    a = t.prev;
  return (
    (e.next = t),
    (t.prev = e),
    (n.next = i),
    (i.prev = n),
    (r.next = n),
    (n.prev = r),
    (a.next = r),
    (r.prev = a),
    r
  );
}
function Oa(e, t, n, r) {
  let i = Aa(e, t, n);
  return (
    r
      ? ((i.next = r.next), (i.prev = r), (r.next.prev = i), (r.next = i))
      : ((i.prev = i), (i.next = i)),
    i
  );
}
function ka(e) {
  ((e.next.prev = e.prev),
    (e.prev.next = e.next),
    e.prevZ && (e.prevZ.nextZ = e.nextZ),
    e.nextZ && (e.nextZ.prevZ = e.prevZ));
}
function Aa(e, t, n) {
  return {
    i: e,
    x: t,
    y: n,
    prev: null,
    next: null,
    z: 0,
    prevZ: null,
    nextZ: null,
    steiner: !1
  };
}
function ja(e, t, n, r) {
  let i = 0;
  for (let a = t, o = n - r; a < n; a += r) ((i += (e[o] - e[a]) * (e[a + 1] + e[o + 1])), (o = a));
  return i;
}
var Ma = class {
    static triangulate(e, t, n = 2) {
      return $i(e, t, n);
    }
  },
  Na = class e {
    static area(e) {
      let t = e.length,
        n = 0;
      for (let r = t - 1, i = 0; i < t; r = i++) n += e[r].x * e[i].y - e[i].x * e[r].y;
      return n * 0.5;
    }
    static isClockWise(t) {
      return e.area(t) < 0;
    }
    static triangulateShape(e, t) {
      let n = [],
        r = [],
        i = [];
      (Pa(e), Fa(n, e));
      let a = e.length;
      t.forEach(Pa);
      for (let e = 0; e < t.length; e++) (r.push(a), (a += t[e].length), Fa(n, t[e]));
      let o = Ma.triangulate(n, r);
      for (let e = 0; e < o.length; e += 3) i.push(o.slice(e, e + 3));
      return i;
    }
  };
function Pa(e) {
  let t = e.length;
  t > 2 && e[t - 1].equals(e[0]) && e.pop();
}
function Fa(e, t) {
  for (let n = 0; n < t.length; n++) (e.push(t[n].x), e.push(t[n].y));
}
var Ia = class e extends Tr {
    constructor(
      e = new Qi([new q(0.5, 0.5), new q(-0.5, 0.5), new q(-0.5, -0.5), new q(0.5, -0.5)]),
      t = {}
    ) {
      (super(),
        (this.type = 'ExtrudeGeometry'),
        (this.parameters = {
          shapes: e,
          options: t
        }),
        (e = Array.isArray(e) ? e : [e]));
      let n = this,
        r = [],
        i = [];
      for (let t = 0, n = e.length; t < n; t++) {
        let n = e[t];
        a(n);
      }
      (this.setAttribute('position', new pr(r, 3)),
        this.setAttribute('uv', new pr(i, 2)),
        this.computeVertexNormals());
      function a(e) {
        let a = [],
          o = t.curveSegments === void 0 ? 12 : t.curveSegments,
          s = t.steps === void 0 ? 1 : t.steps,
          c = t.depth === void 0 ? 1 : t.depth,
          l = t.bevelEnabled === void 0 ? !0 : t.bevelEnabled,
          u = t.bevelThickness === void 0 ? 0.2 : t.bevelThickness,
          d = t.bevelSize === void 0 ? u - 0.1 : t.bevelSize,
          f = t.bevelOffset === void 0 ? 0 : t.bevelOffset,
          p = t.bevelSegments === void 0 ? 3 : t.bevelSegments,
          m = t.extrudePath,
          h = t.UVGenerator === void 0 ? La : t.UVGenerator,
          g,
          _ = !1,
          v,
          y,
          b,
          x;
        if (m) {
          ((g = m.getSpacedPoints(s)), (_ = !0), (l = !1));
          let e = m.isCatmullRomCurve3 ? m.closed : !1;
          ((v = m.computeFrenetFrames(s, e)), (y = new J()), (b = new J()), (x = new J()));
        }
        l || ((p = 0), (u = 0), (d = 0), (f = 0));
        let S = e.extractPoints(o),
          C = S.shape,
          w = S.holes;
        if (!Na.isClockWise(C)) {
          C = C.reverse();
          for (let e = 0, t = w.length; e < t; e++) {
            let t = w[e];
            Na.isClockWise(t) && (w[e] = t.reverse());
          }
        }
        function T(e) {
          let t = e[0];
          for (let n = 1; n <= e.length; n++) {
            let r = n % e.length,
              i = e[r],
              a = i.x - t.x,
              o = i.y - t.y,
              s = a * a + o * o,
              c = Math.max(Math.abs(i.x), Math.abs(i.y), Math.abs(t.x), Math.abs(t.y));
            if (s <= 10000000000000001e-36 * c * c) {
              (e.splice(r, 1), n--);
              continue;
            }
            t = i;
          }
        }
        (T(C), w.forEach(T));
        let E = w.length,
          D = C;
        for (let e = 0; e < E; e++) {
          let t = w[e];
          C = C.concat(t);
        }
        function O(e, t, n) {
          return (t || G('ExtrudeGeometry: vec does not exist'), e.clone().addScaledVector(t, n));
        }
        let k = C.length;
        function A(e, t, n) {
          let r,
            i,
            a,
            o = e.x - t.x,
            s = e.y - t.y,
            c = n.x - e.x,
            l = n.y - e.y,
            u = o * o + s * s,
            d = o * l - s * c;
          if (Math.abs(d) > 2 ** -52) {
            let d = Math.sqrt(u),
              f = Math.sqrt(c * c + l * l),
              p = t.x - s / d,
              m = t.y + o / d,
              h = n.x - l / f,
              g = n.y + c / f,
              _ = ((h - p) * l - (g - m) * c) / (o * l - s * c);
            ((r = p + o * _ - e.x), (i = m + s * _ - e.y));
            let v = r * r + i * i;
            if (v <= 2) return new q(r, i);
            a = Math.sqrt(v / 2);
          } else {
            let e = !1;
            (o > 2 ** -52
              ? c > 2 ** -52 && (e = !0)
              : o < -(2 ** -52)
                ? c < -(2 ** -52) && (e = !0)
                : Math.sign(s) === Math.sign(l) && (e = !0),
              e
                ? ((r = -s), (i = o), (a = Math.sqrt(u)))
                : ((r = o), (i = s), (a = Math.sqrt(u / 2))));
          }
          return new q(r / a, i / a);
        }
        let j = [];
        for (let e = 0, t = D.length, n = t - 1, r = e + 1; e < t; e++, n++, r++)
          (n === t && (n = 0), r === t && (r = 0), (j[e] = A(D[e], D[n], D[r])));
        let M = [],
          N,
          P = j.concat();
        for (let e = 0, t = E; e < t; e++) {
          let t = w[e];
          N = [];
          for (let e = 0, n = t.length, r = n - 1, i = e + 1; e < n; e++, r++, i++)
            (r === n && (r = 0), i === n && (i = 0), (N[e] = A(t[e], t[r], t[i])));
          (M.push(N), (P = P.concat(N)));
        }
        let F;
        if (p === 0) F = Na.triangulateShape(D, w);
        else {
          let e = [],
            t = [];
          for (let n = 0; n < p; n++) {
            let r = n / p,
              i = u * Math.cos((r * Math.PI) / 2),
              a = d * Math.sin((r * Math.PI) / 2) + f;
            for (let t = 0, n = D.length; t < n; t++) {
              let n = O(D[t], j[t], a);
              (L(n.x, n.y, -i), r === 0 && e.push(n));
            }
            for (let e = 0, n = E; e < n; e++) {
              let n = w[e];
              N = M[e];
              let o = [];
              for (let e = 0, t = n.length; e < t; e++) {
                let t = O(n[e], N[e], a);
                (L(t.x, t.y, -i), r === 0 && o.push(t));
              }
              r === 0 && t.push(o);
            }
          }
          F = Na.triangulateShape(e, t);
        }
        let I = F.length,
          ee = d + f;
        for (let e = 0; e < k; e++) {
          let t = l ? O(C[e], P[e], ee) : C[e];
          _
            ? (b.copy(v.normals[0]).multiplyScalar(t.x),
              y.copy(v.binormals[0]).multiplyScalar(t.y),
              x.copy(g[0]).add(b).add(y),
              L(x.x, x.y, x.z))
            : L(t.x, t.y, 0);
        }
        for (let e = 1; e <= s; e++)
          for (let t = 0; t < k; t++) {
            let n = l ? O(C[t], P[t], ee) : C[t];
            _
              ? (b.copy(v.normals[e]).multiplyScalar(n.x),
                y.copy(v.binormals[e]).multiplyScalar(n.y),
                x.copy(g[e]).add(b).add(y),
                L(x.x, x.y, x.z))
              : L(n.x, n.y, (c / s) * e);
          }
        for (let e = p - 1; e >= 0; e--) {
          let t = e / p,
            n = u * Math.cos((t * Math.PI) / 2),
            r = d * Math.sin((t * Math.PI) / 2) + f;
          for (let e = 0, t = D.length; e < t; e++) {
            let t = O(D[e], j[e], r);
            L(t.x, t.y, c + n);
          }
          for (let e = 0, t = w.length; e < t; e++) {
            let t = w[e];
            N = M[e];
            for (let e = 0, i = t.length; e < i; e++) {
              let i = O(t[e], N[e], r);
              _ ? L(i.x, i.y + g[s - 1].y, g[s - 1].x + n) : L(i.x, i.y, c + n);
            }
          }
        }
        (te(), ne());
        function te() {
          let e = r.length / 3;
          if (l) {
            let e = 0,
              t = k * e;
            for (let e = 0; e < I; e++) {
              let n = F[e];
              R(n[2] + t, n[1] + t, n[0] + t);
            }
            ((e = s + p * 2), (t = k * e));
            for (let e = 0; e < I; e++) {
              let n = F[e];
              R(n[0] + t, n[1] + t, n[2] + t);
            }
          } else {
            for (let e = 0; e < I; e++) {
              let t = F[e];
              R(t[2], t[1], t[0]);
            }
            for (let e = 0; e < I; e++) {
              let t = F[e];
              R(t[0] + k * s, t[1] + k * s, t[2] + k * s);
            }
          }
          n.addGroup(e, r.length / 3 - e, 0);
        }
        function ne() {
          let e = r.length / 3,
            t = 0;
          (re(D, t), (t += D.length));
          for (let e = 0, n = w.length; e < n; e++) {
            let n = w[e];
            (re(n, t), (t += n.length));
          }
          n.addGroup(e, r.length / 3 - e, 1);
        }
        function re(e, t) {
          let n = e.length;
          for (; --n >= 0; ) {
            let r = n,
              i = n - 1;
            i < 0 && (i = e.length - 1);
            for (let e = 0, n = s + p * 2; e < n; e++) {
              let n = k * e,
                a = k * (e + 1);
              ie(t + r + n, t + i + n, t + i + a, t + r + a);
            }
          }
        }
        function L(e, t, n) {
          (a.push(e), a.push(t), a.push(n));
        }
        function R(e, t, i) {
          (z(e), z(t), z(i));
          let a = r.length / 3,
            o = h.generateTopUV(n, r, a - 3, a - 2, a - 1);
          (ae(o[0]), ae(o[1]), ae(o[2]));
        }
        function ie(e, t, i, a) {
          (z(e), z(t), z(a), z(t), z(i), z(a));
          let o = r.length / 3,
            s = h.generateSideWallUV(n, r, o - 6, o - 3, o - 2, o - 1);
          (ae(s[0]), ae(s[1]), ae(s[3]), ae(s[1]), ae(s[2]), ae(s[3]));
        }
        function z(e) {
          (r.push(a[e * 3 + 0]), r.push(a[e * 3 + 1]), r.push(a[e * 3 + 2]));
        }
        function ae(e) {
          (i.push(e.x), i.push(e.y));
        }
      }
    }
    copy(e) {
      return (super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this);
    }
    toJSON() {
      let e = super.toJSON(),
        t = this.parameters.shapes,
        n = this.parameters.options;
      return Ra(t, n, e);
    }
    static fromJSON(t, n) {
      let r = [];
      for (let e = 0, i = t.shapes.length; e < i; e++) {
        let i = n[t.shapes[e]];
        r.push(i);
      }
      let i = t.options.extrudePath;
      return (
        i !== void 0 && (t.options.extrudePath = new Yi[i.type]().fromJSON(i)), new e(r, t.options)
      );
    }
  },
  La = {
    generateTopUV: function (e, t, n, r, i) {
      let a = t[n * 3],
        o = t[n * 3 + 1],
        s = t[r * 3],
        c = t[r * 3 + 1],
        l = t[i * 3],
        u = t[i * 3 + 1];
      return [new q(a, o), new q(s, c), new q(l, u)];
    },
    generateSideWallUV: function (e, t, n, r, i, a) {
      let o = t[n * 3],
        s = t[n * 3 + 1],
        c = t[n * 3 + 2],
        l = t[r * 3],
        u = t[r * 3 + 1],
        d = t[r * 3 + 2],
        f = t[i * 3],
        p = t[i * 3 + 1],
        m = t[i * 3 + 2],
        h = t[a * 3],
        g = t[a * 3 + 1],
        _ = t[a * 3 + 2];
      return Math.abs(s - u) < Math.abs(o - l)
        ? [new q(o, 1 - c), new q(l, 1 - d), new q(f, 1 - m), new q(h, 1 - _)]
        : [new q(s, 1 - c), new q(u, 1 - d), new q(p, 1 - m), new q(g, 1 - _)];
    }
  };
function Ra(e, t, n) {
  if (((n.shapes = []), Array.isArray(e)))
    for (let t = 0, r = e.length; t < r; t++) {
      let r = e[t];
      n.shapes.push(r.uuid);
    }
  else n.shapes.push(e.uuid);
  return (
    (n.options = Object.assign({}, t)),
    t.extrudePath !== void 0 && (n.options.extrudePath = t.extrudePath.toJSON()),
    n
  );
}
var za = class e extends Tr {
    constructor(e = 1, t = 1, n = 1, r = 1) {
      (super(),
        (this.type = 'PlaneGeometry'),
        (this.parameters = {
          width: e,
          height: t,
          widthSegments: n,
          heightSegments: r
        }));
      let i = e / 2,
        a = t / 2,
        o = Math.floor(n),
        s = Math.floor(r),
        c = o + 1,
        l = s + 1,
        u = e / o,
        d = t / s,
        f = [],
        p = [],
        m = [],
        h = [];
      for (let e = 0; e < l; e++) {
        let t = e * d - a;
        for (let n = 0; n < c; n++) {
          let r = n * u - i;
          (p.push(r, -t, 0), m.push(0, 0, 1), h.push(n / o), h.push(1 - e / s));
        }
      }
      for (let e = 0; e < s; e++)
        for (let t = 0; t < o; t++) {
          let n = t + c * e,
            r = t + c * (e + 1),
            i = t + 1 + c * (e + 1),
            a = t + 1 + c * e;
          (f.push(n, r, a), f.push(r, i, a));
        }
      (this.setIndex(f),
        this.setAttribute('position', new pr(p, 3)),
        this.setAttribute('normal', new pr(m, 3)),
        this.setAttribute('uv', new pr(h, 2)));
    }
    copy(e) {
      return (super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this);
    }
    static fromJSON(t) {
      return new e(t.width, t.height, t.widthSegments, t.heightSegments);
    }
  },
  Ba = class e extends Tr {
    constructor(e = 1, t = 32, n = 16, r = 0, i = Math.PI * 2, a = 0, o = Math.PI) {
      (super(),
        (this.type = 'SphereGeometry'),
        (this.parameters = {
          radius: e,
          widthSegments: t,
          heightSegments: n,
          phiStart: r,
          phiLength: i,
          thetaStart: a,
          thetaLength: o
        }),
        (t = Math.max(3, Math.floor(t))),
        (n = Math.max(2, Math.floor(n))));
      let s = Math.min(a + o, Math.PI),
        c = 0,
        l = [],
        u = new J(),
        d = new J(),
        f = [],
        p = [],
        m = [],
        h = [];
      for (let f = 0; f <= n; f++) {
        let g = [],
          _ = f / n,
          v = 0;
        f === 0 && a === 0 ? (v = 0.5 / t) : f === n && s === Math.PI && (v = -0.5 / t);
        for (let n = 0; n <= t; n++) {
          let s = n / t;
          ((u.x = -e * Math.cos(r + s * i) * Math.sin(a + _ * o)),
            (u.y = e * Math.cos(a + _ * o)),
            (u.z = e * Math.sin(r + s * i) * Math.sin(a + _ * o)),
            p.push(u.x, u.y, u.z),
            d.copy(u).normalize(),
            m.push(d.x, d.y, d.z),
            h.push(s + v, 1 - _),
            g.push(c++));
        }
        l.push(g);
      }
      for (let e = 0; e < n; e++)
        for (let r = 0; r < t; r++) {
          let t = l[e][r + 1],
            i = l[e][r],
            o = l[e + 1][r],
            c = l[e + 1][r + 1];
          ((e !== 0 || a > 0) && f.push(t, i, c), (e !== n - 1 || s < Math.PI) && f.push(i, o, c));
        }
      (this.setIndex(f),
        this.setAttribute('position', new pr(p, 3)),
        this.setAttribute('normal', new pr(m, 3)),
        this.setAttribute('uv', new pr(h, 2)));
    }
    copy(e) {
      return (super.copy(e), (this.parameters = Object.assign({}, e.parameters)), this);
    }
    static fromJSON(t) {
      return new e(
        t.radius,
        t.widthSegments,
        t.heightSegments,
        t.phiStart,
        t.phiLength,
        t.thetaStart,
        t.thetaLength
      );
    }
  };
function Va(e) {
  let t = {};
  for (let n in e) {
    t[n] = {};
    for (let r in e[n]) {
      let i = e[n][r];
      if (Ua(i))
        i.isRenderTargetTexture
          ? (W(
              'UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().'
            ),
            (t[n][r] = null))
          : (t[n][r] = i.clone());
      else if (Array.isArray(i))
        if (Ua(i[0])) {
          let e = [];
          for (let t = 0, n = i.length; t < n; t++) e[t] = i[t].clone();
          t[n][r] = e;
        } else t[n][r] = i.slice();
      else t[n][r] = i;
    }
  }
  return t;
}
function Ha(e) {
  let t = {};
  for (let n = 0; n < e.length; n++) {
    let r = Va(e[n]);
    for (let e in r) t[e] = r[e];
  }
  return t;
}
function Ua(e) {
  return (
    e &&
    (e.isColor ||
      e.isMatrix3 ||
      e.isMatrix4 ||
      e.isVector2 ||
      e.isVector3 ||
      e.isVector4 ||
      e.isTexture ||
      e.isQuaternion)
  );
}
function Wa(e) {
  let t = [];
  for (let n = 0; n < e.length; n++) t.push(e[n].clone());
  return t;
}
function Ga(e) {
  let t = e.getRenderTarget();
  return t === null
    ? e.outputColorSpace
    : t.isXRRenderTarget === !0
      ? t.texture.colorSpace
      : Mt.workingColorSpace;
}
var Ka = {
    clone: Va,
    merge: Ha
  },
  qa =
    'void main() {\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}',
  Ja = 'void main() {\n	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}',
  Ya = class extends Dr {
    constructor(e) {
      (super(),
        (this.isShaderMaterial = !0),
        (this.type = 'ShaderMaterial'),
        (this.defines = {}),
        (this.uniforms = {}),
        (this.uniformsGroups = []),
        (this.vertexShader = qa),
        (this.fragmentShader = Ja),
        (this.linewidth = 1),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.fog = !1),
        (this.lights = !1),
        (this.clipping = !1),
        (this.forceSinglePass = !0),
        (this.extensions = {
          clipCullDistance: !1,
          multiDraw: !1
        }),
        (this.defaultAttributeValues = {
          color: [1, 1, 1],
          uv: [0, 0],
          uv1: [0, 0]
        }),
        (this.index0AttributeName = void 0),
        (this.uniformsNeedUpdate = !1),
        (this.glslVersion = null),
        e !== void 0 && this.setValues(e));
    }
    copy(e) {
      return (
        super.copy(e),
        (this.fragmentShader = e.fragmentShader),
        (this.vertexShader = e.vertexShader),
        (this.uniforms = Va(e.uniforms)),
        (this.uniformsGroups = Wa(e.uniformsGroups)),
        (this.defines = Object.assign({}, e.defines)),
        (this.wireframe = e.wireframe),
        (this.wireframeLinewidth = e.wireframeLinewidth),
        (this.fog = e.fog),
        (this.lights = e.lights),
        (this.clipping = e.clipping),
        (this.extensions = Object.assign({}, e.extensions)),
        (this.glslVersion = e.glslVersion),
        (this.defaultAttributeValues = Object.assign({}, e.defaultAttributeValues)),
        (this.index0AttributeName = e.index0AttributeName),
        (this.uniformsNeedUpdate = e.uniformsNeedUpdate),
        this
      );
    }
    toJSON(e) {
      let t = super.toJSON(e);
      ((t.glslVersion = this.glslVersion), (t.uniforms = {}));
      for (let n in this.uniforms) {
        let r = this.uniforms[n].value;
        r && r.isTexture
          ? (t.uniforms[n] = {
              type: 't',
              value: r.toJSON(e).uuid
            })
          : r && r.isColor
            ? (t.uniforms[n] = {
                type: 'c',
                value: r.getHex()
              })
            : r && r.isVector2
              ? (t.uniforms[n] = {
                  type: 'v2',
                  value: r.toArray()
                })
              : r && r.isVector3
                ? (t.uniforms[n] = {
                    type: 'v3',
                    value: r.toArray()
                  })
                : r && r.isVector4
                  ? (t.uniforms[n] = {
                      type: 'v4',
                      value: r.toArray()
                    })
                  : r && r.isMatrix3
                    ? (t.uniforms[n] = {
                        type: 'm3',
                        value: r.toArray()
                      })
                    : r && r.isMatrix4
                      ? (t.uniforms[n] = {
                          type: 'm4',
                          value: r.toArray()
                        })
                      : (t.uniforms[n] = { value: r });
      }
      (Object.keys(this.defines).length > 0 && (t.defines = this.defines),
        (t.vertexShader = this.vertexShader),
        (t.fragmentShader = this.fragmentShader),
        (t.lights = this.lights),
        (t.clipping = this.clipping));
      let n = {};
      for (let e in this.extensions) this.extensions[e] === !0 && (n[e] = !0);
      return (Object.keys(n).length > 0 && (t.extensions = n), t);
    }
  },
  Xa = class extends Ya {
    constructor(e) {
      (super(e), (this.isRawShaderMaterial = !0), (this.type = 'RawShaderMaterial'));
    }
  },
  Za = class extends Dr {
    constructor(e) {
      (super(),
        (this.isMeshStandardMaterial = !0),
        (this.type = 'MeshStandardMaterial'),
        (this.defines = { STANDARD: '' }),
        (this.color = new X(16777215)),
        (this.roughness = 1),
        (this.metalness = 0),
        (this.map = null),
        (this.lightMap = null),
        (this.lightMapIntensity = 1),
        (this.aoMap = null),
        (this.aoMapIntensity = 1),
        (this.emissive = new X(0)),
        (this.emissiveIntensity = 1),
        (this.emissiveMap = null),
        (this.bumpMap = null),
        (this.bumpScale = 1),
        (this.normalMap = null),
        (this.normalMapType = 0),
        (this.normalScale = new q(1, 1)),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.roughnessMap = null),
        (this.metalnessMap = null),
        (this.alphaMap = null),
        (this.envMap = null),
        (this.envMapRotation = new an()),
        (this.envMapIntensity = 1),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.wireframeLinecap = 'round'),
        (this.wireframeLinejoin = 'round'),
        (this.flatShading = !1),
        (this.fog = !0),
        this.setValues(e));
    }
    copy(e) {
      return (
        super.copy(e),
        (this.defines = { STANDARD: '' }),
        this.color.copy(e.color),
        (this.roughness = e.roughness),
        (this.metalness = e.metalness),
        (this.map = e.map),
        (this.lightMap = e.lightMap),
        (this.lightMapIntensity = e.lightMapIntensity),
        (this.aoMap = e.aoMap),
        (this.aoMapIntensity = e.aoMapIntensity),
        this.emissive.copy(e.emissive),
        (this.emissiveMap = e.emissiveMap),
        (this.emissiveIntensity = e.emissiveIntensity),
        (this.bumpMap = e.bumpMap),
        (this.bumpScale = e.bumpScale),
        (this.normalMap = e.normalMap),
        (this.normalMapType = e.normalMapType),
        this.normalScale.copy(e.normalScale),
        (this.displacementMap = e.displacementMap),
        (this.displacementScale = e.displacementScale),
        (this.displacementBias = e.displacementBias),
        (this.roughnessMap = e.roughnessMap),
        (this.metalnessMap = e.metalnessMap),
        (this.alphaMap = e.alphaMap),
        (this.envMap = e.envMap),
        this.envMapRotation.copy(e.envMapRotation),
        (this.envMapIntensity = e.envMapIntensity),
        (this.wireframe = e.wireframe),
        (this.wireframeLinewidth = e.wireframeLinewidth),
        (this.wireframeLinecap = e.wireframeLinecap),
        (this.wireframeLinejoin = e.wireframeLinejoin),
        (this.flatShading = e.flatShading),
        (this.fog = e.fog),
        this
      );
    }
  },
  Qa = class extends Za {
    constructor(e) {
      (super(),
        (this.isMeshPhysicalMaterial = !0),
        (this.defines = {
          STANDARD: '',
          PHYSICAL: ''
        }),
        (this.type = 'MeshPhysicalMaterial'),
        (this.anisotropyRotation = 0),
        (this.anisotropyMap = null),
        (this.clearcoatMap = null),
        (this.clearcoatRoughness = 0),
        (this.clearcoatRoughnessMap = null),
        (this.clearcoatNormalScale = new q(1, 1)),
        (this.clearcoatNormalMap = null),
        (this.ior = 1.5),
        Object.defineProperty(this, 'reflectivity', {
          get: function () {
            return K((2.5 * (this.ior - 1)) / (this.ior + 1), 0, 1);
          },
          set: function (e) {
            this.ior = (1 + 0.4 * e) / (1 - 0.4 * e);
          }
        }),
        (this.iridescenceMap = null),
        (this.iridescenceIOR = 1.3),
        (this.iridescenceThicknessRange = [100, 400]),
        (this.iridescenceThicknessMap = null),
        (this.sheenColor = new X(0)),
        (this.sheenColorMap = null),
        (this.sheenRoughness = 1),
        (this.sheenRoughnessMap = null),
        (this.transmissionMap = null),
        (this.thickness = 0),
        (this.thicknessMap = null),
        (this.attenuationDistance = Infinity),
        (this.attenuationColor = new X(1, 1, 1)),
        (this.specularIntensity = 1),
        (this.specularIntensityMap = null),
        (this.specularColor = new X(1, 1, 1)),
        (this.specularColorMap = null),
        (this._anisotropy = 0),
        (this._clearcoat = 0),
        (this._dispersion = 0),
        (this._iridescence = 0),
        (this._sheen = 0),
        (this._transmission = 0),
        this.setValues(e));
    }
    get anisotropy() {
      return this._anisotropy;
    }
    set anisotropy(e) {
      (this._anisotropy > 0 != e > 0 && this.version++, (this._anisotropy = e));
    }
    get clearcoat() {
      return this._clearcoat;
    }
    set clearcoat(e) {
      (this._clearcoat > 0 != e > 0 && this.version++, (this._clearcoat = e));
    }
    get iridescence() {
      return this._iridescence;
    }
    set iridescence(e) {
      (this._iridescence > 0 != e > 0 && this.version++, (this._iridescence = e));
    }
    get dispersion() {
      return this._dispersion;
    }
    set dispersion(e) {
      (this._dispersion > 0 != e > 0 && this.version++, (this._dispersion = e));
    }
    get sheen() {
      return this._sheen;
    }
    set sheen(e) {
      (this._sheen > 0 != e > 0 && this.version++, (this._sheen = e));
    }
    get transmission() {
      return this._transmission;
    }
    set transmission(e) {
      (this._transmission > 0 != e > 0 && this.version++, (this._transmission = e));
    }
    copy(e) {
      return (
        super.copy(e),
        (this.defines = {
          STANDARD: '',
          PHYSICAL: ''
        }),
        (this.anisotropy = e.anisotropy),
        (this.anisotropyRotation = e.anisotropyRotation),
        (this.anisotropyMap = e.anisotropyMap),
        (this.clearcoat = e.clearcoat),
        (this.clearcoatMap = e.clearcoatMap),
        (this.clearcoatRoughness = e.clearcoatRoughness),
        (this.clearcoatRoughnessMap = e.clearcoatRoughnessMap),
        (this.clearcoatNormalMap = e.clearcoatNormalMap),
        this.clearcoatNormalScale.copy(e.clearcoatNormalScale),
        (this.dispersion = e.dispersion),
        (this.ior = e.ior),
        (this.iridescence = e.iridescence),
        (this.iridescenceMap = e.iridescenceMap),
        (this.iridescenceIOR = e.iridescenceIOR),
        (this.iridescenceThicknessRange = [...e.iridescenceThicknessRange]),
        (this.iridescenceThicknessMap = e.iridescenceThicknessMap),
        (this.sheen = e.sheen),
        this.sheenColor.copy(e.sheenColor),
        (this.sheenColorMap = e.sheenColorMap),
        (this.sheenRoughness = e.sheenRoughness),
        (this.sheenRoughnessMap = e.sheenRoughnessMap),
        (this.transmission = e.transmission),
        (this.transmissionMap = e.transmissionMap),
        (this.thickness = e.thickness),
        (this.thicknessMap = e.thicknessMap),
        (this.attenuationDistance = e.attenuationDistance),
        this.attenuationColor.copy(e.attenuationColor),
        (this.specularIntensity = e.specularIntensity),
        (this.specularIntensityMap = e.specularIntensityMap),
        this.specularColor.copy(e.specularColor),
        (this.specularColorMap = e.specularColorMap),
        this
      );
    }
  },
  $a = class extends Dr {
    constructor(e) {
      (super(),
        (this.isMeshLambertMaterial = !0),
        (this.type = 'MeshLambertMaterial'),
        (this.color = new X(16777215)),
        (this.map = null),
        (this.lightMap = null),
        (this.lightMapIntensity = 1),
        (this.aoMap = null),
        (this.aoMapIntensity = 1),
        (this.emissive = new X(0)),
        (this.emissiveIntensity = 1),
        (this.emissiveMap = null),
        (this.bumpMap = null),
        (this.bumpScale = 1),
        (this.normalMap = null),
        (this.normalMapType = 0),
        (this.normalScale = new q(1, 1)),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.specularMap = null),
        (this.alphaMap = null),
        (this.envMap = null),
        (this.envMapRotation = new an()),
        (this.combine = 0),
        (this.reflectivity = 1),
        (this.envMapIntensity = 1),
        (this.refractionRatio = 0.98),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.wireframeLinecap = 'round'),
        (this.wireframeLinejoin = 'round'),
        (this.flatShading = !1),
        (this.fog = !0),
        this.setValues(e));
    }
    copy(e) {
      return (
        super.copy(e),
        this.color.copy(e.color),
        (this.map = e.map),
        (this.lightMap = e.lightMap),
        (this.lightMapIntensity = e.lightMapIntensity),
        (this.aoMap = e.aoMap),
        (this.aoMapIntensity = e.aoMapIntensity),
        this.emissive.copy(e.emissive),
        (this.emissiveMap = e.emissiveMap),
        (this.emissiveIntensity = e.emissiveIntensity),
        (this.bumpMap = e.bumpMap),
        (this.bumpScale = e.bumpScale),
        (this.normalMap = e.normalMap),
        (this.normalMapType = e.normalMapType),
        this.normalScale.copy(e.normalScale),
        (this.displacementMap = e.displacementMap),
        (this.displacementScale = e.displacementScale),
        (this.displacementBias = e.displacementBias),
        (this.specularMap = e.specularMap),
        (this.alphaMap = e.alphaMap),
        (this.envMap = e.envMap),
        this.envMapRotation.copy(e.envMapRotation),
        (this.combine = e.combine),
        (this.reflectivity = e.reflectivity),
        (this.envMapIntensity = e.envMapIntensity),
        (this.refractionRatio = e.refractionRatio),
        (this.wireframe = e.wireframe),
        (this.wireframeLinewidth = e.wireframeLinewidth),
        (this.wireframeLinecap = e.wireframeLinecap),
        (this.wireframeLinejoin = e.wireframeLinejoin),
        (this.flatShading = e.flatShading),
        (this.fog = e.fog),
        this
      );
    }
  },
  eo = class extends Dr {
    constructor(e) {
      (super(),
        (this.isMeshDepthMaterial = !0),
        (this.type = 'MeshDepthMaterial'),
        (this.depthPacking = Ne),
        (this.map = null),
        (this.alphaMap = null),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        this.setValues(e));
    }
    copy(e) {
      return (
        super.copy(e),
        (this.depthPacking = e.depthPacking),
        (this.map = e.map),
        (this.alphaMap = e.alphaMap),
        (this.displacementMap = e.displacementMap),
        (this.displacementScale = e.displacementScale),
        (this.displacementBias = e.displacementBias),
        (this.wireframe = e.wireframe),
        (this.wireframeLinewidth = e.wireframeLinewidth),
        this
      );
    }
  },
  to = class extends Dr {
    constructor(e) {
      (super(),
        (this.isMeshDistanceMaterial = !0),
        (this.type = 'MeshDistanceMaterial'),
        (this.map = null),
        (this.alphaMap = null),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        this.setValues(e));
    }
    copy(e) {
      return (
        super.copy(e),
        (this.map = e.map),
        (this.alphaMap = e.alphaMap),
        (this.displacementMap = e.displacementMap),
        (this.displacementScale = e.displacementScale),
        (this.displacementBias = e.displacementBias),
        this
      );
    }
  },
  no = class extends Dr {
    constructor(e) {
      (super(),
        (this.isMeshMatcapMaterial = !0),
        (this.defines = { MATCAP: '' }),
        (this.type = 'MeshMatcapMaterial'),
        (this.color = new X(16777215)),
        (this.matcap = null),
        (this.map = null),
        (this.bumpMap = null),
        (this.bumpScale = 1),
        (this.normalMap = null),
        (this.normalMapType = 0),
        (this.normalScale = new q(1, 1)),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.alphaMap = null),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.flatShading = !1),
        (this.fog = !0),
        this.setValues(e));
    }
    copy(e) {
      return (
        super.copy(e),
        (this.defines = { MATCAP: '' }),
        this.color.copy(e.color),
        (this.matcap = e.matcap),
        (this.map = e.map),
        (this.bumpMap = e.bumpMap),
        (this.bumpScale = e.bumpScale),
        (this.normalMap = e.normalMap),
        (this.normalMapType = e.normalMapType),
        this.normalScale.copy(e.normalScale),
        (this.displacementMap = e.displacementMap),
        (this.displacementScale = e.displacementScale),
        (this.displacementBias = e.displacementBias),
        (this.alphaMap = e.alphaMap),
        (this.wireframe = e.wireframe),
        (this.wireframeLinewidth = e.wireframeLinewidth),
        (this.flatShading = e.flatShading),
        (this.fog = e.fog),
        this
      );
    }
  };
function ro(e, t) {
  return !e || e.constructor === t
    ? e
    : typeof t.BYTES_PER_ELEMENT == 'number'
      ? new t(e)
      : Array.prototype.slice.call(e);
}
var io = class {
    constructor(e, t, n, r) {
      ((this.parameterPositions = e),
        (this._cachedIndex = 0),
        (this.resultBuffer = r === void 0 ? new t.constructor(n) : r),
        (this.sampleValues = t),
        (this.valueSize = n),
        (this.settings = null),
        (this.DefaultSettings_ = {}));
    }
    evaluate(e) {
      let t = this.parameterPositions,
        n = this._cachedIndex,
        r = t[n],
        i = t[n - 1];
      validate_interval: {
        seek: {
          let a;
          linear_scan: {
            forward_scan: if (!(e < r)) {
              for (let a = n + 2; ; ) {
                if (r === void 0) {
                  if (e < i) break forward_scan;
                  return ((n = t.length), (this._cachedIndex = n), this.copySampleValue_(n - 1));
                }
                if (n === a) break;
                if (((i = r), (r = t[++n]), e < r)) break seek;
              }
              a = t.length;
              break linear_scan;
            }
            if (!(e >= i)) {
              let o = t[1];
              e < o && ((n = 2), (i = o));
              for (let a = n - 2; ; ) {
                if (i === void 0) return ((this._cachedIndex = 0), this.copySampleValue_(0));
                if (n === a) break;
                if (((r = i), (i = t[--n - 1]), e >= i)) break seek;
              }
              ((a = n), (n = 0));
              break linear_scan;
            }
            break validate_interval;
          }
          for (; n < a; ) {
            let r = (n + a) >>> 1;
            e < t[r] ? (a = r) : (n = r + 1);
          }
          if (((r = t[n]), (i = t[n - 1]), i === void 0))
            return ((this._cachedIndex = 0), this.copySampleValue_(0));
          if (r === void 0)
            return ((n = t.length), (this._cachedIndex = n), this.copySampleValue_(n - 1));
        }
        ((this._cachedIndex = n), this.intervalChanged_(n, i, r));
      }
      return this.interpolate_(n, i, e, r);
    }
    getSettings_() {
      return this.settings || this.DefaultSettings_;
    }
    copySampleValue_(e) {
      let t = this.resultBuffer,
        n = this.sampleValues,
        r = this.valueSize,
        i = e * r;
      for (let e = 0; e !== r; ++e) t[e] = n[i + e];
      return t;
    }
    interpolate_() {
      throw Error('call to abstract method');
    }
    intervalChanged_() {}
  },
  ao = class extends io {
    constructor(e, t, n, r) {
      (super(e, t, n, r),
        (this._weightPrev = -0),
        (this._offsetPrev = -0),
        (this._weightNext = -0),
        (this._offsetNext = -0),
        (this.DefaultSettings_ = {
          endingStart: Ae,
          endingEnd: Ae
        }));
    }
    intervalChanged_(e, t, n) {
      let r = this.parameterPositions,
        i = e - 2,
        a = e + 1,
        o = r[i],
        s = r[a];
      if (o === void 0)
        switch (this.getSettings_().endingStart) {
          case je:
            ((i = e), (o = 2 * t - n));
            break;
          case Me:
            ((i = r.length - 2), (o = t + r[i] - r[i + 1]));
            break;
          default:
            ((i = e), (o = n));
        }
      if (s === void 0)
        switch (this.getSettings_().endingEnd) {
          case je:
            ((a = e), (s = 2 * n - t));
            break;
          case Me:
            ((a = 1), (s = n + r[1] - r[0]));
            break;
          default:
            ((a = e - 1), (s = t));
        }
      let c = (n - t) * 0.5,
        l = this.valueSize;
      ((this._weightPrev = c / (t - o)),
        (this._weightNext = c / (s - n)),
        (this._offsetPrev = i * l),
        (this._offsetNext = a * l));
    }
    interpolate_(e, t, n, r) {
      let i = this.resultBuffer,
        a = this.sampleValues,
        o = this.valueSize,
        s = e * o,
        c = s - o,
        l = this._offsetPrev,
        u = this._offsetNext,
        d = this._weightPrev,
        f = this._weightNext,
        p = (n - t) / (r - t),
        m = p * p,
        h = m * p,
        g = -d * h + 2 * d * m - d * p,
        _ = (1 + d) * h + (-1.5 - 2 * d) * m + (-0.5 + d) * p + 1,
        v = (-1 - f) * h + (1.5 + f) * m + 0.5 * p,
        y = f * h - f * m;
      for (let e = 0; e !== o; ++e)
        i[e] = g * a[l + e] + _ * a[c + e] + v * a[s + e] + y * a[u + e];
      return i;
    }
  },
  oo = class extends io {
    constructor(e, t, n, r) {
      super(e, t, n, r);
    }
    interpolate_(e, t, n, r) {
      let i = this.resultBuffer,
        a = this.sampleValues,
        o = this.valueSize,
        s = e * o,
        c = s - o,
        l = (n - t) / (r - t),
        u = 1 - l;
      for (let e = 0; e !== o; ++e) i[e] = a[c + e] * u + a[s + e] * l;
      return i;
    }
  },
  so = class extends io {
    constructor(e, t, n, r) {
      super(e, t, n, r);
    }
    interpolate_(e) {
      return this.copySampleValue_(e - 1);
    }
  },
  co = class extends io {
    interpolate_(e, t, n, r) {
      let i = this.resultBuffer,
        a = this.sampleValues,
        o = this.valueSize,
        s = e * o,
        c = s - o,
        l = this.settings || this.DefaultSettings_,
        u = l.inTangents,
        d = l.outTangents;
      if (!u || !d) {
        let e = (n - t) / (r - t),
          l = 1 - e;
        for (let t = 0; t !== o; ++t) i[t] = a[c + t] * l + a[s + t] * e;
        return i;
      }
      let f = o * 2,
        p = e - 1;
      for (let l = 0; l !== o; ++l) {
        let o = a[c + l],
          m = a[s + l],
          h = p * f + l * 2,
          g = d[h],
          _ = d[h + 1],
          v = e * f + l * 2,
          y = u[v],
          b = u[v + 1],
          x = (n - t) / (r - t),
          S,
          C,
          w,
          T,
          E;
        for (let e = 0; e < 8; e++) {
          ((S = x * x), (C = S * x), (w = 1 - x), (T = w * w), (E = T * w));
          let e = E * t + 3 * T * x * g + 3 * w * S * y + C * r - n;
          if (Math.abs(e) < 1e-10) break;
          let i = 3 * T * (g - t) + 6 * w * x * (y - g) + 3 * S * (r - y);
          if (Math.abs(i) < 1e-10) break;
          ((x -= e / i), (x = Math.max(0, Math.min(1, x))));
        }
        i[l] = E * o + 3 * T * x * _ + 3 * w * S * b + C * m;
      }
      return i;
    }
  },
  lo = class {
    constructor(e, t, n, r) {
      if (e === void 0) throw Error('THREE.KeyframeTrack: track name is undefined');
      if (t === void 0 || t.length === 0)
        throw Error('THREE.KeyframeTrack: no keyframes in track named ' + e);
      ((this.name = e),
        (this.times = ro(t, this.TimeBufferType)),
        (this.values = ro(n, this.ValueBufferType)),
        this.setInterpolation(r || this.DefaultInterpolation));
    }
    static toJSON(e) {
      let t = e.constructor,
        n;
      if (t.toJSON !== this.toJSON) n = t.toJSON(e);
      else {
        n = {
          name: e.name,
          times: ro(e.times, Array),
          values: ro(e.values, Array)
        };
        let t = e.getInterpolation();
        t !== e.DefaultInterpolation && (n.interpolation = t);
      }
      return ((n.type = e.ValueTypeName), n);
    }
    InterpolantFactoryMethodDiscrete(e) {
      return new so(this.times, this.values, this.getValueSize(), e);
    }
    InterpolantFactoryMethodLinear(e) {
      return new oo(this.times, this.values, this.getValueSize(), e);
    }
    InterpolantFactoryMethodSmooth(e) {
      return new ao(this.times, this.values, this.getValueSize(), e);
    }
    InterpolantFactoryMethodBezier(e) {
      let t = new co(this.times, this.values, this.getValueSize(), e);
      return (this.settings && (t.settings = this.settings), t);
    }
    setInterpolation(e) {
      let t;
      switch (e) {
        case V:
          t = this.InterpolantFactoryMethodDiscrete;
          break;
        case ke:
          t = this.InterpolantFactoryMethodLinear;
          break;
        case H:
          t = this.InterpolantFactoryMethodSmooth;
          break;
        case U:
          t = this.InterpolantFactoryMethodBezier;
          break;
      }
      if (t === void 0) {
        let t =
          'unsupported interpolation for ' +
          this.ValueTypeName +
          ' keyframe track named ' +
          this.name;
        if (this.createInterpolant === void 0)
          if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
          else throw Error(t);
        return (W('KeyframeTrack:', t), this);
      }
      return ((this.createInterpolant = t), this);
    }
    getInterpolation() {
      switch (this.createInterpolant) {
        case this.InterpolantFactoryMethodDiscrete:
          return V;
        case this.InterpolantFactoryMethodLinear:
          return ke;
        case this.InterpolantFactoryMethodSmooth:
          return H;
        case this.InterpolantFactoryMethodBezier:
          return U;
      }
    }
    getValueSize() {
      return this.values.length / this.times.length;
    }
    shift(e) {
      if (e !== 0) {
        let t = this.times;
        for (let n = 0, r = t.length; n !== r; ++n) t[n] += e;
      }
      return this;
    }
    scale(e) {
      if (e !== 1) {
        let t = this.times;
        for (let n = 0, r = t.length; n !== r; ++n) t[n] *= e;
      }
      return this;
    }
    trim(e, t) {
      let n = this.times,
        r = n.length,
        i = 0,
        a = r - 1;
      for (; i !== r && n[i] < e; ) ++i;
      for (; a !== -1 && n[a] > t; ) --a;
      if ((++a, i !== 0 || a !== r)) {
        i >= a && ((a = Math.max(a, 1)), (i = a - 1));
        let e = this.getValueSize();
        ((this.times = n.slice(i, a)), (this.values = this.values.slice(i * e, a * e)));
      }
      return this;
    }
    validate() {
      let e = !0,
        t = this.getValueSize();
      t - Math.floor(t) !== 0 && (G('KeyframeTrack: Invalid value size in track.', this), (e = !1));
      let n = this.times,
        r = this.values,
        i = n.length;
      i === 0 && (G('KeyframeTrack: Track is empty.', this), (e = !1));
      let a = null;
      for (let t = 0; t !== i; t++) {
        let r = n[t];
        if (typeof r == 'number' && isNaN(r)) {
          (G('KeyframeTrack: Time is not a valid number.', this, t, r), (e = !1));
          break;
        }
        if (a !== null && a > r) {
          (G('KeyframeTrack: Out of order keys.', this, t, r, a), (e = !1));
          break;
        }
        a = r;
      }
      if (r !== void 0 && He(r))
        for (let t = 0, n = r.length; t !== n; ++t) {
          let n = r[t];
          if (isNaN(n)) {
            (G('KeyframeTrack: Value is not a valid number.', this, t, n), (e = !1));
            break;
          }
        }
      return e;
    }
    optimize() {
      let e = this.times.slice(),
        t = this.values.slice(),
        n = this.getValueSize(),
        r = this.getInterpolation() === H,
        i = e.length - 1,
        a = 1;
      for (let o = 1; o < i; ++o) {
        let i = !1,
          s = e[o];
        if (s !== e[o + 1] && (o !== 1 || s !== e[0]))
          if (r) i = !0;
          else {
            let e = o * n,
              r = e - n,
              a = e + n;
            for (let o = 0; o !== n; ++o) {
              let n = t[e + o];
              if (n !== t[r + o] || n !== t[a + o]) {
                i = !0;
                break;
              }
            }
          }
        if (i) {
          if (o !== a) {
            e[a] = e[o];
            let r = o * n,
              i = a * n;
            for (let e = 0; e !== n; ++e) t[i + e] = t[r + e];
          }
          ++a;
        }
      }
      if (i > 0) {
        e[a] = e[i];
        for (let e = i * n, r = a * n, o = 0; o !== n; ++o) t[r + o] = t[e + o];
        ++a;
      }
      return (
        a === e.length
          ? ((this.times = e), (this.values = t))
          : ((this.times = e.slice(0, a)), (this.values = t.slice(0, a * n))),
        this
      );
    }
    clone() {
      let e = this.times.slice(),
        t = this.values.slice(),
        n = this.constructor,
        r = new n(this.name, e, t);
      return ((r.createInterpolant = this.createInterpolant), r);
    }
  };
((lo.prototype.ValueTypeName = ''),
  (lo.prototype.TimeBufferType = Float32Array),
  (lo.prototype.ValueBufferType = Float32Array),
  (lo.prototype.DefaultInterpolation = ke));
var uo = class extends lo {
  constructor(e, t, n) {
    super(e, t, n);
  }
};
((uo.prototype.ValueTypeName = 'bool'),
  (uo.prototype.ValueBufferType = Array),
  (uo.prototype.DefaultInterpolation = V),
  (uo.prototype.InterpolantFactoryMethodLinear = void 0),
  (uo.prototype.InterpolantFactoryMethodSmooth = void 0));
var fo = class extends lo {
  constructor(e, t, n, r) {
    super(e, t, n, r);
  }
};
fo.prototype.ValueTypeName = 'color';
var po = class extends lo {
  constructor(e, t, n, r) {
    super(e, t, n, r);
  }
};
po.prototype.ValueTypeName = 'number';
var mo = class extends io {
    constructor(e, t, n, r) {
      super(e, t, n, r);
    }
    interpolate_(e, t, n, r) {
      let i = this.resultBuffer,
        a = this.sampleValues,
        o = this.valueSize,
        s = (n - t) / (r - t),
        c = e * o;
      for (let e = c + o; c !== e; c += 4) Tt.slerpFlat(i, 0, a, c - o, a, c, s);
      return i;
    }
  },
  ho = class extends lo {
    constructor(e, t, n, r) {
      super(e, t, n, r);
    }
    InterpolantFactoryMethodLinear(e) {
      return new mo(this.times, this.values, this.getValueSize(), e);
    }
  };
((ho.prototype.ValueTypeName = 'quaternion'),
  (ho.prototype.InterpolantFactoryMethodSmooth = void 0));
var go = class extends lo {
  constructor(e, t, n) {
    super(e, t, n);
  }
};
((go.prototype.ValueTypeName = 'string'),
  (go.prototype.ValueBufferType = Array),
  (go.prototype.DefaultInterpolation = V),
  (go.prototype.InterpolantFactoryMethodLinear = void 0),
  (go.prototype.InterpolantFactoryMethodSmooth = void 0));
var _o = class extends lo {
  constructor(e, t, n, r) {
    super(e, t, n, r);
  }
};
_o.prototype.ValueTypeName = 'vector';
var vo = {
  enabled: !1,
  files: {},
  add: function (e, t) {
    this.enabled !== !1 && (yo(e) || (this.files[e] = t));
  },
  get: function (e) {
    if (this.enabled !== !1 && !yo(e)) return this.files[e];
  },
  remove: function (e) {
    delete this.files[e];
  },
  clear: function () {
    this.files = {};
  }
};
function yo(e) {
  try {
    let t = e.slice(e.indexOf(':') + 1);
    return new URL(t).protocol === 'blob:';
  } catch {
    return !1;
  }
}
var bo = /*@__PURE__*/ new (class {
    constructor(e, t, n) {
      let r = this,
        i = !1,
        a = 0,
        o = 0,
        s,
        c = [];
      ((this.onStart = void 0),
        (this.onLoad = e),
        (this.onProgress = t),
        (this.onError = n),
        (this._abortController = null),
        (this.itemStart = function (e) {
          (o++, i === !1 && r.onStart !== void 0 && r.onStart(e, a, o), (i = !0));
        }),
        (this.itemEnd = function (e) {
          (a++,
            r.onProgress !== void 0 && r.onProgress(e, a, o),
            a === o && ((i = !1), r.onLoad !== void 0 && r.onLoad()));
        }),
        (this.itemError = function (e) {
          r.onError !== void 0 && r.onError(e);
        }),
        (this.resolveURL = function (e) {
          return s ? s(e) : e;
        }),
        (this.setURLModifier = function (e) {
          return ((s = e), this);
        }),
        (this.addHandler = function (e, t) {
          return (c.push(e, t), this);
        }),
        (this.removeHandler = function (e) {
          let t = c.indexOf(e);
          return (t !== -1 && c.splice(t, 2), this);
        }),
        (this.getHandler = function (e) {
          for (let t = 0, n = c.length; t < n; t += 2) {
            let n = c[t],
              r = c[t + 1];
            if ((n.global && (n.lastIndex = 0), n.test(e))) return r;
          }
          return null;
        }),
        (this.abort = function () {
          return (this.abortController.abort(), (this._abortController = null), this);
        }));
    }
    get abortController() {
      return ((this._abortController ||= new AbortController()), this._abortController);
    }
  })(),
  xo = class {
    constructor(e) {
      ((this.manager = e === void 0 ? bo : e),
        (this.crossOrigin = 'anonymous'),
        (this.withCredentials = !1),
        (this.path = ''),
        (this.resourcePath = ''),
        (this.requestHeader = {}),
        typeof __THREE_DEVTOOLS__ < 'u' &&
          __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this })));
    }
    load() {}
    loadAsync(e, t) {
      let n = this;
      return new Promise(function (r, i) {
        n.load(e, r, t, i);
      });
    }
    parse() {}
    setCrossOrigin(e) {
      return ((this.crossOrigin = e), this);
    }
    setWithCredentials(e) {
      return ((this.withCredentials = e), this);
    }
    setPath(e) {
      return ((this.path = e), this);
    }
    setResourcePath(e) {
      return ((this.resourcePath = e), this);
    }
    setRequestHeader(e) {
      return ((this.requestHeader = e), this);
    }
    abort() {
      return this;
    }
  };
xo.DEFAULT_MATERIAL_NAME = '__DEFAULT';
var So = {},
  Co = class extends Error {
    constructor(e, t) {
      (super(e), (this.response = t));
    }
  },
  wo = class extends xo {
    constructor(e) {
      (super(e),
        (this.mimeType = ''),
        (this.responseType = ''),
        (this._abortController = new AbortController()));
    }
    load(e, t, n, r) {
      (e === void 0 && (e = ''),
        this.path !== void 0 && (e = this.path + e),
        (e = this.manager.resolveURL(e)));
      let i = vo.get(`file:${e}`);
      if (i !== void 0) {
        (this.manager.itemStart(e),
          setTimeout(() => {
            (t && t(i), this.manager.itemEnd(e));
          }, 0));
        return;
      }
      if (So[e] !== void 0) {
        So[e].push({
          onLoad: t,
          onProgress: n,
          onError: r
        });
        return;
      }
      ((So[e] = []),
        So[e].push({
          onLoad: t,
          onProgress: n,
          onError: r
        }));
      let a = new Request(e, {
          headers: new Headers(this.requestHeader),
          credentials: this.withCredentials ? 'include' : 'same-origin',
          signal:
            typeof AbortSignal.any == 'function'
              ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal])
              : this._abortController.signal
        }),
        o = this.mimeType,
        s = this.responseType;
      (fetch(a)
        .then((t) => {
          if (t.status === 200 || t.status === 0) {
            if (
              (t.status === 0 && W('FileLoader: HTTP Status 0 received.'),
              typeof ReadableStream > 'u' || t.body === void 0 || t.body.getReader === void 0)
            )
              return t;
            let n = So[e],
              r = t.body.getReader(),
              i = t.headers.get('X-File-Size') || t.headers.get('Content-Length'),
              a = i ? parseInt(i) : 0,
              o = a !== 0,
              s = 0,
              c = new ReadableStream({
                start(e) {
                  t();
                  function t() {
                    r.read().then(
                      ({ done: r, value: i }) => {
                        if (r) e.close();
                        else {
                          s += i.byteLength;
                          let r = new ProgressEvent('progress', {
                            lengthComputable: o,
                            loaded: s,
                            total: a
                          });
                          for (let e = 0, t = n.length; e < t; e++) {
                            let t = n[e];
                            t.onProgress && t.onProgress(r);
                          }
                          (e.enqueue(i), t());
                        }
                      },
                      (t) => {
                        e.error(t);
                      }
                    );
                  }
                }
              });
            return new Response(c);
          } else
            throw new Co(`fetch for "${t.url}" responded with ${t.status}: ${t.statusText}`, t);
        })
        .then((e) => {
          switch (s) {
            case 'arraybuffer':
              return e.arrayBuffer();
            case 'blob':
              return e.blob();
            case 'document':
              return e.text().then((e) => new DOMParser().parseFromString(e, o));
            case 'json':
              return e.json();
            default:
              if (o === '') return e.text();
              {
                let t = /charset="?([^;"\s]*)"?/i.exec(o),
                  n = t && t[1] ? t[1].toLowerCase() : void 0,
                  r = new TextDecoder(n);
                return e.arrayBuffer().then((e) => r.decode(e));
              }
          }
        })
        .then((t) => {
          vo.add(`file:${e}`, t);
          let n = So[e];
          delete So[e];
          for (let e = 0, r = n.length; e < r; e++) {
            let r = n[e];
            r.onLoad && r.onLoad(t);
          }
        })
        .catch((t) => {
          let n = So[e];
          if (n === void 0) throw (this.manager.itemError(e), t);
          delete So[e];
          for (let e = 0, r = n.length; e < r; e++) {
            let r = n[e];
            r.onError && r.onError(t);
          }
          this.manager.itemError(e);
        })
        .finally(() => {
          this.manager.itemEnd(e);
        }),
        this.manager.itemStart(e));
    }
    setResponseType(e) {
      return ((this.responseType = e), this);
    }
    setMimeType(e) {
      return ((this.mimeType = e), this);
    }
    abort() {
      return (this._abortController.abort(), (this._abortController = new AbortController()), this);
    }
  },
  To = class extends Sn {
    constructor(e, t = 1) {
      (super(),
        (this.isLight = !0),
        (this.type = 'Light'),
        (this.color = new X(e)),
        (this.intensity = t));
    }
    dispose() {
      this.dispatchEvent({ type: 'dispose' });
    }
    copy(e, t) {
      return (super.copy(e, t), this.color.copy(e.color), (this.intensity = e.intensity), this);
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return ((t.object.color = this.color.getHex()), (t.object.intensity = this.intensity), t);
    }
  },
  Eo = /*@__PURE__*/ new Jt(),
  Do = /*@__PURE__*/ new J(),
  Oo = /*@__PURE__*/ new J(),
  ko = class {
    constructor(e) {
      ((this.camera = e),
        (this.intensity = 1),
        (this.bias = 0),
        (this.biasNode = null),
        (this.normalBias = 0),
        (this.radius = 1),
        (this.blurSamples = 8),
        (this.mapSize = new q(512, 512)),
        (this.mapType = d),
        (this.map = null),
        (this.mapPass = null),
        (this.matrix = new Jt()),
        (this.autoUpdate = !0),
        (this.needsUpdate = !1),
        (this._frustum = new mi()),
        (this._frameExtents = new q(1, 1)),
        (this._viewportCount = 1),
        (this._viewports = [new Ut(0, 0, 1, 1)]));
    }
    getViewportCount() {
      return this._viewportCount;
    }
    getFrustum() {
      return this._frustum;
    }
    updateMatrices(e) {
      let t = this.camera,
        n = this.matrix;
      (Do.setFromMatrixPosition(e.matrixWorld),
        t.position.copy(Do),
        Oo.setFromMatrixPosition(e.target.matrixWorld),
        t.lookAt(Oo),
        t.updateMatrixWorld(),
        Eo.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse),
        this._frustum.setFromProjectionMatrix(Eo, t.coordinateSystem, t.reversedDepth),
        t.coordinateSystem === 2001 || t.reversedDepth
          ? n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0, 0, 1)
          : n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1),
        n.multiply(Eo));
    }
    getViewport(e) {
      return this._viewports[e];
    }
    getFrameExtents() {
      return this._frameExtents;
    }
    dispose() {
      (this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose());
    }
    copy(e) {
      return (
        (this.camera = e.camera.clone()),
        (this.intensity = e.intensity),
        (this.bias = e.bias),
        (this.radius = e.radius),
        (this.autoUpdate = e.autoUpdate),
        (this.needsUpdate = e.needsUpdate),
        (this.normalBias = e.normalBias),
        (this.blurSamples = e.blurSamples),
        this.mapSize.copy(e.mapSize),
        (this.biasNode = e.biasNode),
        this
      );
    }
    clone() {
      return new this.constructor().copy(this);
    }
    toJSON() {
      let e = {};
      return (
        this.intensity !== 1 && (e.intensity = this.intensity),
        this.bias !== 0 && (e.bias = this.bias),
        this.normalBias !== 0 && (e.normalBias = this.normalBias),
        this.radius !== 1 && (e.radius = this.radius),
        (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()),
        (e.camera = this.camera.toJSON(!1).object),
        delete e.camera.matrix,
        e
      );
    }
  },
  Ao = /*@__PURE__*/ new J(),
  jo = /*@__PURE__*/ new Tt(),
  Mo = /*@__PURE__*/ new J(),
  No = class extends Sn {
    constructor() {
      (super(),
        (this.isCamera = !0),
        (this.type = 'Camera'),
        (this.matrixWorldInverse = new Jt()),
        (this.projectionMatrix = new Jt()),
        (this.projectionMatrixInverse = new Jt()),
        (this.coordinateSystem = Be),
        (this._reversedDepth = !1));
    }
    get reversedDepth() {
      return this._reversedDepth;
    }
    copy(e, t) {
      return (
        super.copy(e, t),
        this.matrixWorldInverse.copy(e.matrixWorldInverse),
        this.projectionMatrix.copy(e.projectionMatrix),
        this.projectionMatrixInverse.copy(e.projectionMatrixInverse),
        (this.coordinateSystem = e.coordinateSystem),
        this
      );
    }
    getWorldDirection(e) {
      return super.getWorldDirection(e).negate();
    }
    updateMatrixWorld(e) {
      (super.updateMatrixWorld(e),
        this.matrixWorld.decompose(Ao, jo, Mo),
        Mo.x === 1 && Mo.y === 1 && Mo.z === 1
          ? this.matrixWorldInverse.copy(this.matrixWorld).invert()
          : this.matrixWorldInverse.compose(Ao, jo, Mo.set(1, 1, 1)).invert());
    }
    updateWorldMatrix(e, t) {
      (super.updateWorldMatrix(e, t),
        this.matrixWorld.decompose(Ao, jo, Mo),
        Mo.x === 1 && Mo.y === 1 && Mo.z === 1
          ? this.matrixWorldInverse.copy(this.matrixWorld).invert()
          : this.matrixWorldInverse.compose(Ao, jo, Mo.set(1, 1, 1)).invert());
    }
    clone() {
      return new this.constructor().copy(this);
    }
  },
  Po = /*@__PURE__*/ new J(),
  Fo = /*@__PURE__*/ new q(),
  Io = /*@__PURE__*/ new q(),
  Lo = class extends No {
    constructor(e = 50, t = 1, n = 0.1, r = 2e3) {
      (super(),
        (this.isPerspectiveCamera = !0),
        (this.type = 'PerspectiveCamera'),
        (this.fov = e),
        (this.zoom = 1),
        (this.near = n),
        (this.far = r),
        (this.focus = 10),
        (this.aspect = t),
        (this.view = null),
        (this.filmGauge = 35),
        (this.filmOffset = 0),
        this.updateProjectionMatrix());
    }
    copy(e, t) {
      return (
        super.copy(e, t),
        (this.fov = e.fov),
        (this.zoom = e.zoom),
        (this.near = e.near),
        (this.far = e.far),
        (this.focus = e.focus),
        (this.aspect = e.aspect),
        (this.view = e.view === null ? null : Object.assign({}, e.view)),
        (this.filmGauge = e.filmGauge),
        (this.filmOffset = e.filmOffset),
        this
      );
    }
    setFocalLength(e) {
      let t = (0.5 * this.getFilmHeight()) / e;
      ((this.fov = nt * 2 * Math.atan(t)), this.updateProjectionMatrix());
    }
    getFocalLength() {
      let e = Math.tan(tt * 0.5 * this.fov);
      return (0.5 * this.getFilmHeight()) / e;
    }
    getEffectiveFOV() {
      return nt * 2 * Math.atan(Math.tan(tt * 0.5 * this.fov) / this.zoom);
    }
    getFilmWidth() {
      return this.filmGauge * Math.min(this.aspect, 1);
    }
    getFilmHeight() {
      return this.filmGauge / Math.max(this.aspect, 1);
    }
    getViewBounds(e, t, n) {
      (Po.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse),
        t.set(Po.x, Po.y).multiplyScalar(-e / Po.z),
        Po.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse),
        n.set(Po.x, Po.y).multiplyScalar(-e / Po.z));
    }
    getViewSize(e, t) {
      return (this.getViewBounds(e, Fo, Io), t.subVectors(Io, Fo));
    }
    setViewOffset(e, t, n, r, i, a) {
      ((this.aspect = e / t),
        this.view === null &&
          (this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1
          }),
        (this.view.enabled = !0),
        (this.view.fullWidth = e),
        (this.view.fullHeight = t),
        (this.view.offsetX = n),
        (this.view.offsetY = r),
        (this.view.width = i),
        (this.view.height = a),
        this.updateProjectionMatrix());
    }
    clearViewOffset() {
      (this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix());
    }
    updateProjectionMatrix() {
      let e = this.near,
        t = (e * Math.tan(tt * 0.5 * this.fov)) / this.zoom,
        n = 2 * t,
        r = this.aspect * n,
        i = -0.5 * r,
        a = this.view;
      if (this.view !== null && this.view.enabled) {
        let e = a.fullWidth,
          o = a.fullHeight;
        ((i += (a.offsetX * r) / e),
          (t -= (a.offsetY * n) / o),
          (r *= a.width / e),
          (n *= a.height / o));
      }
      let o = this.filmOffset;
      (o !== 0 && (i += (e * o) / this.getFilmWidth()),
        this.projectionMatrix.makePerspective(
          i,
          i + r,
          t,
          t - n,
          e,
          this.far,
          this.coordinateSystem,
          this.reversedDepth
        ),
        this.projectionMatrixInverse.copy(this.projectionMatrix).invert());
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return (
        (t.object.fov = this.fov),
        (t.object.zoom = this.zoom),
        (t.object.near = this.near),
        (t.object.far = this.far),
        (t.object.focus = this.focus),
        (t.object.aspect = this.aspect),
        this.view !== null && (t.object.view = Object.assign({}, this.view)),
        (t.object.filmGauge = this.filmGauge),
        (t.object.filmOffset = this.filmOffset),
        t
      );
    }
  },
  Ro = class extends ko {
    constructor() {
      (super(new Lo(90, 1, 0.5, 500)), (this.isPointLightShadow = !0));
    }
  },
  zo = class extends To {
    constructor(e, t, n = 0, r = 2) {
      (super(e, t),
        (this.isPointLight = !0),
        (this.type = 'PointLight'),
        (this.distance = n),
        (this.decay = r),
        (this.shadow = new Ro()));
    }
    get power() {
      return this.intensity * 4 * Math.PI;
    }
    set power(e) {
      this.intensity = e / (4 * Math.PI);
    }
    dispose() {
      (super.dispose(), this.shadow.dispose());
    }
    copy(e, t) {
      return (
        super.copy(e, t),
        (this.distance = e.distance),
        (this.decay = e.decay),
        (this.shadow = e.shadow.clone()),
        this
      );
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return (
        (t.object.distance = this.distance),
        (t.object.decay = this.decay),
        (t.object.shadow = this.shadow.toJSON()),
        t
      );
    }
  },
  Bo = class extends No {
    constructor(e = -1, t = 1, n = 1, r = -1, i = 0.1, a = 2e3) {
      (super(),
        (this.isOrthographicCamera = !0),
        (this.type = 'OrthographicCamera'),
        (this.zoom = 1),
        (this.view = null),
        (this.left = e),
        (this.right = t),
        (this.top = n),
        (this.bottom = r),
        (this.near = i),
        (this.far = a),
        this.updateProjectionMatrix());
    }
    copy(e, t) {
      return (
        super.copy(e, t),
        (this.left = e.left),
        (this.right = e.right),
        (this.top = e.top),
        (this.bottom = e.bottom),
        (this.near = e.near),
        (this.far = e.far),
        (this.zoom = e.zoom),
        (this.view = e.view === null ? null : Object.assign({}, e.view)),
        this
      );
    }
    setViewOffset(e, t, n, r, i, a) {
      (this.view === null &&
        (this.view = {
          enabled: !0,
          fullWidth: 1,
          fullHeight: 1,
          offsetX: 0,
          offsetY: 0,
          width: 1,
          height: 1
        }),
        (this.view.enabled = !0),
        (this.view.fullWidth = e),
        (this.view.fullHeight = t),
        (this.view.offsetX = n),
        (this.view.offsetY = r),
        (this.view.width = i),
        (this.view.height = a),
        this.updateProjectionMatrix());
    }
    clearViewOffset() {
      (this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix());
    }
    updateProjectionMatrix() {
      let e = (this.right - this.left) / (2 * this.zoom),
        t = (this.top - this.bottom) / (2 * this.zoom),
        n = (this.right + this.left) / 2,
        r = (this.top + this.bottom) / 2,
        i = n - e,
        a = n + e,
        o = r + t,
        s = r - t;
      if (this.view !== null && this.view.enabled) {
        let e = (this.right - this.left) / this.view.fullWidth / this.zoom,
          t = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
        ((i += e * this.view.offsetX),
          (a = i + e * this.view.width),
          (o -= t * this.view.offsetY),
          (s = o - t * this.view.height));
      }
      (this.projectionMatrix.makeOrthographic(
        i,
        a,
        o,
        s,
        this.near,
        this.far,
        this.coordinateSystem,
        this.reversedDepth
      ),
        this.projectionMatrixInverse.copy(this.projectionMatrix).invert());
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return (
        (t.object.zoom = this.zoom),
        (t.object.left = this.left),
        (t.object.right = this.right),
        (t.object.top = this.top),
        (t.object.bottom = this.bottom),
        (t.object.near = this.near),
        (t.object.far = this.far),
        this.view !== null && (t.object.view = Object.assign({}, this.view)),
        t
      );
    }
  },
  Vo = class extends ko {
    constructor() {
      (super(new Bo(-5, 5, 5, -5, 0.5, 500)), (this.isDirectionalLightShadow = !0));
    }
  },
  Ho = class extends To {
    constructor(e, t) {
      (super(e, t),
        (this.isDirectionalLight = !0),
        (this.type = 'DirectionalLight'),
        this.position.copy(Sn.DEFAULT_UP),
        this.updateMatrix(),
        (this.target = new Sn()),
        (this.shadow = new Vo()));
    }
    dispose() {
      (super.dispose(), this.shadow.dispose());
    }
    copy(e) {
      return (
        super.copy(e), (this.target = e.target.clone()), (this.shadow = e.shadow.clone()), this
      );
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return ((t.object.shadow = this.shadow.toJSON()), (t.object.target = this.target.uuid), t);
    }
  },
  Uo = class extends To {
    constructor(e, t) {
      (super(e, t), (this.isAmbientLight = !0), (this.type = 'AmbientLight'));
    }
  },
  Wo = -90,
  Go = 1,
  Ko = class extends Sn {
    constructor(e, t, n) {
      (super(),
        (this.type = 'CubeCamera'),
        (this.renderTarget = n),
        (this.coordinateSystem = null),
        (this.activeMipmapLevel = 0));
      let r = new Lo(Wo, Go, e, t);
      ((r.layers = this.layers), this.add(r));
      let i = new Lo(Wo, Go, e, t);
      ((i.layers = this.layers), this.add(i));
      let a = new Lo(Wo, Go, e, t);
      ((a.layers = this.layers), this.add(a));
      let o = new Lo(Wo, Go, e, t);
      ((o.layers = this.layers), this.add(o));
      let s = new Lo(Wo, Go, e, t);
      ((s.layers = this.layers), this.add(s));
      let c = new Lo(Wo, Go, e, t);
      ((c.layers = this.layers), this.add(c));
    }
    updateCoordinateSystem() {
      let e = this.coordinateSystem,
        t = this.children.concat(),
        [n, r, i, a, o, s] = t;
      for (let e of t) this.remove(e);
      if (e === 2e3)
        (n.up.set(0, 1, 0),
          n.lookAt(1, 0, 0),
          r.up.set(0, 1, 0),
          r.lookAt(-1, 0, 0),
          i.up.set(0, 0, -1),
          i.lookAt(0, 1, 0),
          a.up.set(0, 0, 1),
          a.lookAt(0, -1, 0),
          o.up.set(0, 1, 0),
          o.lookAt(0, 0, 1),
          s.up.set(0, 1, 0),
          s.lookAt(0, 0, -1));
      else if (e === 2001)
        (n.up.set(0, -1, 0),
          n.lookAt(-1, 0, 0),
          r.up.set(0, -1, 0),
          r.lookAt(1, 0, 0),
          i.up.set(0, 0, 1),
          i.lookAt(0, 1, 0),
          a.up.set(0, 0, -1),
          a.lookAt(0, -1, 0),
          o.up.set(0, -1, 0),
          o.lookAt(0, 0, 1),
          s.up.set(0, -1, 0),
          s.lookAt(0, 0, -1));
      else
        throw Error('THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: ' + e);
      for (let e of t) (this.add(e), e.updateMatrixWorld());
    }
    update(e, t) {
      this.parent === null && this.updateMatrixWorld();
      let { renderTarget: n, activeMipmapLevel: r } = this;
      this.coordinateSystem !== e.coordinateSystem &&
        ((this.coordinateSystem = e.coordinateSystem), this.updateCoordinateSystem());
      let [i, a, o, s, c, l] = this.children,
        u = e.getRenderTarget(),
        d = e.getActiveCubeFace(),
        f = e.getActiveMipmapLevel(),
        p = e.xr.enabled;
      e.xr.enabled = !1;
      let m = n.texture.generateMipmaps;
      n.texture.generateMipmaps = !1;
      let h = !1;
      ((h = e.isWebGLRenderer === !0 ? e.state.buffers.depth.getReversed() : e.reversedDepthBuffer),
        e.setRenderTarget(n, 0, r),
        h && e.autoClear === !1 && e.clearDepth(),
        e.render(t, i),
        e.setRenderTarget(n, 1, r),
        h && e.autoClear === !1 && e.clearDepth(),
        e.render(t, a),
        e.setRenderTarget(n, 2, r),
        h && e.autoClear === !1 && e.clearDepth(),
        e.render(t, o),
        e.setRenderTarget(n, 3, r),
        h && e.autoClear === !1 && e.clearDepth(),
        e.render(t, s),
        e.setRenderTarget(n, 4, r),
        h && e.autoClear === !1 && e.clearDepth(),
        e.render(t, c),
        (n.texture.generateMipmaps = m),
        e.setRenderTarget(n, 5, r),
        h && e.autoClear === !1 && e.clearDepth(),
        e.render(t, l),
        e.setRenderTarget(u, d, f),
        (e.xr.enabled = p),
        (n.texture.needsPMREMUpdate = !0));
    }
  },
  qo = class extends Lo {
    constructor(e = []) {
      (super(), (this.isArrayCamera = !0), (this.isMultiViewCamera = !1), (this.cameras = e));
    }
  },
  Jo = class {
    constructor() {
      ((this._previousTime = 0),
        (this._currentTime = 0),
        (this._startTime = performance.now()),
        (this._delta = 0),
        (this._elapsed = 0),
        (this._timescale = 1),
        (this._document = null),
        (this._pageVisibilityHandler = null));
    }
    connect(e) {
      ((this._document = e),
        e.hidden !== void 0 &&
          ((this._pageVisibilityHandler = Yo.bind(this)),
          e.addEventListener('visibilitychange', this._pageVisibilityHandler, !1)));
    }
    disconnect() {
      (this._pageVisibilityHandler !== null &&
        (this._document.removeEventListener('visibilitychange', this._pageVisibilityHandler),
        (this._pageVisibilityHandler = null)),
        (this._document = null));
    }
    getDelta() {
      return this._delta / 1e3;
    }
    getElapsed() {
      return this._elapsed / 1e3;
    }
    getTimescale() {
      return this._timescale;
    }
    setTimescale(e) {
      return ((this._timescale = e), this);
    }
    reset() {
      return ((this._currentTime = performance.now() - this._startTime), this);
    }
    dispose() {
      this.disconnect();
    }
    update(e) {
      return (
        this._pageVisibilityHandler !== null && this._document.hidden === !0
          ? (this._delta = 0)
          : ((this._previousTime = this._currentTime),
            (this._currentTime = (e === void 0 ? performance.now() : e) - this._startTime),
            (this._delta = (this._currentTime - this._previousTime) * this._timescale),
            (this._elapsed += this._delta)),
        this
      );
    }
  };
function Yo() {
  this._document.hidden === !1 && this.reset();
}
var Xo = '\\[\\]\\.:\\/',
  Zo = /* @__PURE__ */ RegExp('[\\[\\]\\.:\\/]', 'g'),
  Qo = '[^\\[\\]\\.:\\/]',
  $o = '[^' + Xo.replace('\\.', '') + ']',
  es = /*@__PURE__*/ '((?:WC+[\\/:])*)'.replace('WC', Qo),
  ts = /*@__PURE__*/ '(WCOD+)?'.replace('WCOD', $o),
  ns = /*@__PURE__*/ '(?:\\.(WC+)(?:\\[(.+)\\])?)?'.replace('WC', Qo),
  rs = /*@__PURE__*/ '\\.(WC+)(?:\\[(.+)\\])?'.replace('WC', Qo),
  is = RegExp('^' + es + ts + ns + rs + '$'),
  as = ['material', 'materials', 'bones', 'map'],
  os = class {
    constructor(e, t, n) {
      let r = n || ss.parseTrackName(t);
      ((this._targetGroup = e), (this._bindings = e.subscribe_(t, r)));
    }
    getValue(e, t) {
      this.bind();
      let n = this._targetGroup.nCachedObjects_,
        r = this._bindings[n];
      r !== void 0 && r.getValue(e, t);
    }
    setValue(e, t) {
      let n = this._bindings;
      for (let r = this._targetGroup.nCachedObjects_, i = n.length; r !== i; ++r)
        n[r].setValue(e, t);
    }
    bind() {
      let e = this._bindings;
      for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].bind();
    }
    unbind() {
      let e = this._bindings;
      for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].unbind();
    }
  },
  ss = class e {
    constructor(t, n, r) {
      ((this.path = n),
        (this.parsedPath = r || e.parseTrackName(n)),
        (this.node = e.findNode(t, this.parsedPath.nodeName)),
        (this.rootNode = t),
        (this.getValue = this._getValue_unbound),
        (this.setValue = this._setValue_unbound));
    }
    static create(t, n, r) {
      return t && t.isAnimationObjectGroup ? new e.Composite(t, n, r) : new e(t, n, r);
    }
    static sanitizeNodeName(e) {
      return e.replace(/\s/g, '_').replace(Zo, '');
    }
    static parseTrackName(e) {
      let t = is.exec(e);
      if (t === null) throw Error('PropertyBinding: Cannot parse trackName: ' + e);
      let n = {
          nodeName: t[2],
          objectName: t[3],
          objectIndex: t[4],
          propertyName: t[5],
          propertyIndex: t[6]
        },
        r = n.nodeName && n.nodeName.lastIndexOf('.');
      if (r !== void 0 && r !== -1) {
        let e = n.nodeName.substring(r + 1);
        as.indexOf(e) !== -1 && ((n.nodeName = n.nodeName.substring(0, r)), (n.objectName = e));
      }
      if (n.propertyName === null || n.propertyName.length === 0)
        throw Error('PropertyBinding: can not parse propertyName from trackName: ' + e);
      return n;
    }
    static findNode(e, t) {
      if (t === void 0 || t === '' || t === '.' || t === -1 || t === e.name || t === e.uuid)
        return e;
      if (e.skeleton) {
        let n = e.skeleton.getBoneByName(t);
        if (n !== void 0) return n;
      }
      if (e.children) {
        let n = function (e) {
            for (let r = 0; r < e.length; r++) {
              let i = e[r];
              if (i.name === t || i.uuid === t) return i;
              let a = n(i.children);
              if (a) return a;
            }
            return null;
          },
          r = n(e.children);
        if (r) return r;
      }
      return null;
    }
    _getValue_unavailable() {}
    _setValue_unavailable() {}
    _getValue_direct(e, t) {
      e[t] = this.targetObject[this.propertyName];
    }
    _getValue_array(e, t) {
      let n = this.resolvedProperty;
      for (let r = 0, i = n.length; r !== i; ++r) e[t++] = n[r];
    }
    _getValue_arrayElement(e, t) {
      e[t] = this.resolvedProperty[this.propertyIndex];
    }
    _getValue_toArray(e, t) {
      this.resolvedProperty.toArray(e, t);
    }
    _setValue_direct(e, t) {
      this.targetObject[this.propertyName] = e[t];
    }
    _setValue_direct_setNeedsUpdate(e, t) {
      ((this.targetObject[this.propertyName] = e[t]), (this.targetObject.needsUpdate = !0));
    }
    _setValue_direct_setMatrixWorldNeedsUpdate(e, t) {
      ((this.targetObject[this.propertyName] = e[t]),
        (this.targetObject.matrixWorldNeedsUpdate = !0));
    }
    _setValue_array(e, t) {
      let n = this.resolvedProperty;
      for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
    }
    _setValue_array_setNeedsUpdate(e, t) {
      let n = this.resolvedProperty;
      for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
      this.targetObject.needsUpdate = !0;
    }
    _setValue_array_setMatrixWorldNeedsUpdate(e, t) {
      let n = this.resolvedProperty;
      for (let r = 0, i = n.length; r !== i; ++r) n[r] = e[t++];
      this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    _setValue_arrayElement(e, t) {
      this.resolvedProperty[this.propertyIndex] = e[t];
    }
    _setValue_arrayElement_setNeedsUpdate(e, t) {
      ((this.resolvedProperty[this.propertyIndex] = e[t]), (this.targetObject.needsUpdate = !0));
    }
    _setValue_arrayElement_setMatrixWorldNeedsUpdate(e, t) {
      ((this.resolvedProperty[this.propertyIndex] = e[t]),
        (this.targetObject.matrixWorldNeedsUpdate = !0));
    }
    _setValue_fromArray(e, t) {
      this.resolvedProperty.fromArray(e, t);
    }
    _setValue_fromArray_setNeedsUpdate(e, t) {
      (this.resolvedProperty.fromArray(e, t), (this.targetObject.needsUpdate = !0));
    }
    _setValue_fromArray_setMatrixWorldNeedsUpdate(e, t) {
      (this.resolvedProperty.fromArray(e, t), (this.targetObject.matrixWorldNeedsUpdate = !0));
    }
    _getValue_unbound(e, t) {
      (this.bind(), this.getValue(e, t));
    }
    _setValue_unbound(e, t) {
      (this.bind(), this.setValue(e, t));
    }
    bind() {
      let t = this.node,
        n = this.parsedPath,
        r = n.objectName,
        i = n.propertyName,
        a = n.propertyIndex;
      if (
        (t || ((t = e.findNode(this.rootNode, n.nodeName)), (this.node = t)),
        (this.getValue = this._getValue_unavailable),
        (this.setValue = this._setValue_unavailable),
        !t)
      ) {
        W('PropertyBinding: No target node found for track: ' + this.path + '.');
        return;
      }
      if (r) {
        let e = n.objectIndex;
        switch (r) {
          case 'materials':
            if (!t.material) {
              G(
                'PropertyBinding: Can not bind to material as node does not have a material.',
                this
              );
              return;
            }
            if (!t.material.materials) {
              G(
                'PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.',
                this
              );
              return;
            }
            t = t.material.materials;
            break;
          case 'bones':
            if (!t.skeleton) {
              G('PropertyBinding: Can not bind to bones as node does not have a skeleton.', this);
              return;
            }
            t = t.skeleton.bones;
            for (let n = 0; n < t.length; n++)
              if (t[n].name === e) {
                e = n;
                break;
              }
            break;
          case 'map':
            if ('map' in t) {
              t = t.map;
              break;
            }
            if (!t.material) {
              G(
                'PropertyBinding: Can not bind to material as node does not have a material.',
                this
              );
              return;
            }
            if (!t.material.map) {
              G(
                'PropertyBinding: Can not bind to material.map as node.material does not have a map.',
                this
              );
              return;
            }
            t = t.material.map;
            break;
          default:
            if (t[r] === void 0) {
              G('PropertyBinding: Can not bind to objectName of node undefined.', this);
              return;
            }
            t = t[r];
        }
        if (e !== void 0) {
          if (t[e] === void 0) {
            G(
              'PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.',
              this,
              t
            );
            return;
          }
          t = t[e];
        }
      }
      let o = t[i];
      if (o === void 0) {
        let e = n.nodeName;
        G(
          'PropertyBinding: Trying to update property for track: ' +
            e +
            '.' +
            i +
            " but it wasn't found.",
          t
        );
        return;
      }
      let s = this.Versioning.None;
      ((this.targetObject = t),
        t.isMaterial === !0
          ? (s = this.Versioning.NeedsUpdate)
          : t.isObject3D === !0 && (s = this.Versioning.MatrixWorldNeedsUpdate));
      let c = this.BindingType.Direct;
      if (a !== void 0) {
        if (i === 'morphTargetInfluences') {
          if (!t.geometry) {
            G(
              'PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.',
              this
            );
            return;
          }
          if (!t.geometry.morphAttributes) {
            G(
              'PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.',
              this
            );
            return;
          }
          t.morphTargetDictionary[a] !== void 0 && (a = t.morphTargetDictionary[a]);
        }
        ((c = this.BindingType.ArrayElement),
          (this.resolvedProperty = o),
          (this.propertyIndex = a));
      } else
        o.fromArray !== void 0 && o.toArray !== void 0
          ? ((c = this.BindingType.HasFromToArray), (this.resolvedProperty = o))
          : Array.isArray(o)
            ? ((c = this.BindingType.EntireArray), (this.resolvedProperty = o))
            : (this.propertyName = i);
      ((this.getValue = this.GetterByBindingType[c]),
        (this.setValue = this.SetterByBindingTypeAndVersioning[c][s]));
    }
    unbind() {
      ((this.node = null),
        (this.getValue = this._getValue_unbound),
        (this.setValue = this._setValue_unbound));
    }
  };
((ss.Composite = os),
  (ss.prototype.BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
  }),
  (ss.prototype.Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
  }),
  (ss.prototype.GetterByBindingType = [
    ss.prototype._getValue_direct,
    ss.prototype._getValue_array,
    ss.prototype._getValue_arrayElement,
    ss.prototype._getValue_toArray
  ]),
  (ss.prototype.SetterByBindingTypeAndVersioning = [
    [
      ss.prototype._setValue_direct,
      ss.prototype._setValue_direct_setNeedsUpdate,
      ss.prototype._setValue_direct_setMatrixWorldNeedsUpdate
    ],
    [
      ss.prototype._setValue_array,
      ss.prototype._setValue_array_setNeedsUpdate,
      ss.prototype._setValue_array_setMatrixWorldNeedsUpdate
    ],
    [
      ss.prototype._setValue_arrayElement,
      ss.prototype._setValue_arrayElement_setNeedsUpdate,
      ss.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
    ],
    [
      ss.prototype._setValue_fromArray,
      ss.prototype._setValue_fromArray_setNeedsUpdate,
      ss.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
    ]
  ]));
var cs = class {
    constructor(e = !0) {
      ((this.autoStart = e),
        (this.startTime = 0),
        (this.oldTime = 0),
        (this.elapsedTime = 0),
        (this.running = !1),
        W('Clock: This module has been deprecated. Please use THREE.Timer instead.'));
    }
    start() {
      ((this.startTime = performance.now()),
        (this.oldTime = this.startTime),
        (this.elapsedTime = 0),
        (this.running = !0));
    }
    stop() {
      (this.getElapsedTime(), (this.running = !1), (this.autoStart = !1));
    }
    getElapsedTime() {
      return (this.getDelta(), this.elapsedTime);
    }
    getDelta() {
      let e = 0;
      if (this.autoStart && !this.running) return (this.start(), 0);
      if (this.running) {
        let t = performance.now();
        ((e = (t - this.oldTime) / 1e3), (this.oldTime = t), (this.elapsedTime += e));
      }
      return e;
    }
  },
  ls = class {
    constructor(e = 1, t = 0, n = 0) {
      ((this.radius = e), (this.phi = t), (this.theta = n));
    }
    set(e, t, n) {
      return ((this.radius = e), (this.phi = t), (this.theta = n), this);
    }
    copy(e) {
      return ((this.radius = e.radius), (this.phi = e.phi), (this.theta = e.theta), this);
    }
    makeSafe() {
      let e = 1e-6;
      return ((this.phi = K(this.phi, e, Math.PI - e)), this);
    }
    setFromVector3(e) {
      return this.setFromCartesianCoords(e.x, e.y, e.z);
    }
    setFromCartesianCoords(e, t, n) {
      return (
        (this.radius = Math.sqrt(e * e + t * t + n * n)),
        this.radius === 0
          ? ((this.theta = 0), (this.phi = 0))
          : ((this.theta = Math.atan2(e, n)), (this.phi = Math.acos(K(t / this.radius, -1, 1)))),
        this
      );
    }
    clone() {
      return new this.constructor().copy(this);
    }
  };
(class e {
  static {
    e.prototype.isMatrix2 = !0;
  }
  constructor(e, t, n, r) {
    ((this.elements = [1, 0, 0, 1]), e !== void 0 && this.set(e, t, n, r));
  }
  identity() {
    return (this.set(1, 0, 0, 1), this);
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 4; n++) this.elements[n] = e[n + t];
    return this;
  }
  set(e, t, n, r) {
    let i = this.elements;
    return ((i[0] = e), (i[2] = t), (i[1] = n), (i[3] = r), this);
  }
});
var us = /*@__PURE__*/ new q(),
  ds = class {
    constructor(e = new q(Infinity, Infinity), t = new q(-Infinity, -Infinity)) {
      ((this.isBox2 = !0), (this.min = e), (this.max = t));
    }
    set(e, t) {
      return (this.min.copy(e), this.max.copy(t), this);
    }
    setFromPoints(e) {
      this.makeEmpty();
      for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
      return this;
    }
    setFromCenterAndSize(e, t) {
      let n = us.copy(t).multiplyScalar(0.5);
      return (this.min.copy(e).sub(n), this.max.copy(e).add(n), this);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return (this.min.copy(e.min), this.max.copy(e.max), this);
    }
    makeEmpty() {
      return ((this.min.x = this.min.y = Infinity), (this.max.x = this.max.y = -Infinity), this);
    }
    isEmpty() {
      return this.max.x < this.min.x || this.max.y < this.min.y;
    }
    getCenter(e) {
      return this.isEmpty() ? e.set(0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    getSize(e) {
      return this.isEmpty() ? e.set(0, 0) : e.subVectors(this.max, this.min);
    }
    expandByPoint(e) {
      return (this.min.min(e), this.max.max(e), this);
    }
    expandByVector(e) {
      return (this.min.sub(e), this.max.add(e), this);
    }
    expandByScalar(e) {
      return (this.min.addScalar(-e), this.max.addScalar(e), this);
    }
    containsPoint(e) {
      return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y;
    }
    containsBox(e) {
      return (
        this.min.x <= e.min.x &&
        e.max.x <= this.max.x &&
        this.min.y <= e.min.y &&
        e.max.y <= this.max.y
      );
    }
    getParameter(e, t) {
      return t.set(
        (e.x - this.min.x) / (this.max.x - this.min.x),
        (e.y - this.min.y) / (this.max.y - this.min.y)
      );
    }
    intersectsBox(e) {
      return (
        e.max.x >= this.min.x &&
        e.min.x <= this.max.x &&
        e.max.y >= this.min.y &&
        e.min.y <= this.max.y
      );
    }
    clampPoint(e, t) {
      return t.copy(e).clamp(this.min, this.max);
    }
    distanceToPoint(e) {
      return this.clampPoint(e, us).distanceTo(e);
    }
    intersect(e) {
      return (this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this);
    }
    union(e) {
      return (this.min.min(e.min), this.max.max(e.max), this);
    }
    translate(e) {
      return (this.min.add(e), this.max.add(e), this);
    }
    equals(e) {
      return e.min.equals(this.min) && e.max.equals(this.max);
    }
  },
  fs = class {
    constructor() {
      ((this.type = 'ShapePath'),
        (this.color = new X()),
        (this.subPaths = []),
        (this.currentPath = null));
    }
    moveTo(e, t) {
      return (
        (this.currentPath = new Zi()),
        this.subPaths.push(this.currentPath),
        this.currentPath.moveTo(e, t),
        this
      );
    }
    lineTo(e, t) {
      return (this.currentPath.lineTo(e, t), this);
    }
    quadraticCurveTo(e, t, n, r) {
      return (this.currentPath.quadraticCurveTo(e, t, n, r), this);
    }
    bezierCurveTo(e, t, n, r, i, a) {
      return (this.currentPath.bezierCurveTo(e, t, n, r, i, a), this);
    }
    splineThru(e) {
      return (this.currentPath.splineThru(e), this);
    }
    toShapes(e) {
      function t(e) {
        let t = [];
        for (let n = 0, r = e.length; n < r; n++) {
          let r = e[n],
            i = new Qi();
          ((i.curves = r.curves), t.push(i));
        }
        return t;
      }
      function n(e, t) {
        let n = t.length,
          r = !1;
        for (let i = n - 1, a = 0; a < n; i = a++) {
          let n = t[i],
            o = t[a],
            s = o.x - n.x,
            c = o.y - n.y;
          if (Math.abs(c) > 2 ** -52) {
            if ((c < 0 && ((n = t[a]), (s = -s), (o = t[i]), (c = -c)), e.y < n.y || e.y > o.y))
              continue;
            if (e.y === n.y) {
              if (e.x === n.x) return !0;
            } else {
              let t = c * (e.x - n.x) - s * (e.y - n.y);
              if (t === 0) return !0;
              if (t < 0) continue;
              r = !r;
            }
          } else {
            if (e.y !== n.y) continue;
            if ((o.x <= e.x && e.x <= n.x) || (n.x <= e.x && e.x <= o.x)) return !0;
          }
        }
        return r;
      }
      let r = Na.isClockWise,
        i = this.subPaths;
      if (i.length === 0) return [];
      let a,
        o,
        s,
        c = [];
      if (i.length === 1) return ((o = i[0]), (s = new Qi()), (s.curves = o.curves), c.push(s), c);
      let l = !r(i[0].getPoints());
      l = e ? !l : l;
      let u = [],
        d = [],
        f = [],
        p = 0,
        m;
      ((d[p] = void 0), (f[p] = []));
      for (let t = 0, n = i.length; t < n; t++)
        ((o = i[t]),
          (m = o.getPoints()),
          (a = r(m)),
          (a = e ? !a : a),
          a
            ? (!l && d[p] && p++,
              (d[p] = {
                s: new Qi(),
                p: m
              }),
              (d[p].s.curves = o.curves),
              l && p++,
              (f[p] = []))
            : f[p].push({
                h: o,
                p: m[0]
              }));
      if (!d[0]) return t(i);
      if (d.length > 1) {
        let e = !1,
          t = 0;
        for (let e = 0, t = d.length; e < t; e++) u[e] = [];
        for (let r = 0, i = d.length; r < i; r++) {
          let i = f[r];
          for (let a = 0; a < i.length; a++) {
            let o = i[a],
              s = !0;
            for (let i = 0; i < d.length; i++)
              n(o.p, d[i].p) && (r !== i && t++, s ? ((s = !1), u[i].push(o)) : (e = !0));
            s && u[r].push(o);
          }
        }
        t > 0 && e === !1 && (f = u);
      }
      let h;
      for (let e = 0, t = d.length; e < t; e++) {
        ((s = d[e].s), c.push(s), (h = f[e]));
        for (let e = 0, t = h.length; e < t; e++) s.holes.push(h[e].h);
      }
      return c;
    }
  },
  ps = class extends Qe {
    constructor(e, t = null) {
      (super(),
        (this.object = e),
        (this.domElement = t),
        (this.enabled = !0),
        (this.state = -1),
        (this.keys = {}),
        (this.mouseButtons = {
          LEFT: null,
          MIDDLE: null,
          RIGHT: null
        }),
        (this.touches = {
          ONE: null,
          TWO: null
        }));
    }
    connect(e) {
      if (e === void 0) {
        W('Controls: connect() now requires an element.');
        return;
      }
      (this.domElement !== null && this.disconnect(), (this.domElement = e));
    }
    disconnect() {}
    dispose() {}
    update() {}
  };
function ms(e, t, n, r) {
  let i = hs(r);
  switch (n) {
    case w:
      return e * t;
    case k:
      return ((e * t) / i.components) * i.byteLength;
    case A:
      return ((e * t) / i.components) * i.byteLength;
    case j:
      return ((e * t * 2) / i.components) * i.byteLength;
    case M:
      return ((e * t * 2) / i.components) * i.byteLength;
    case T:
      return ((e * t * 3) / i.components) * i.byteLength;
    case E:
      return ((e * t * 4) / i.components) * i.byteLength;
    case N:
      return ((e * t * 4) / i.components) * i.byteLength;
    case P:
    case F:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case I:
    case ee:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case ne:
    case L:
      return (Math.max(e, 16) * Math.max(t, 8)) / 4;
    case te:
    case re:
      return (Math.max(e, 8) * Math.max(t, 8)) / 2;
    case R:
    case ie:
    case ae:
    case oe:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case z:
    case se:
    case ce:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case le:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case ue:
      return Math.floor((e + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case de:
      return Math.floor((e + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case fe:
      return Math.floor((e + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case pe:
      return Math.floor((e + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case me:
      return Math.floor((e + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case he:
      return Math.floor((e + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case ge:
      return Math.floor((e + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case _e:
      return Math.floor((e + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case ve:
      return Math.floor((e + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case ye:
      return Math.floor((e + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case be:
      return Math.floor((e + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case xe:
      return Math.floor((e + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case Se:
      return Math.floor((e + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case Ce:
    case we:
    case Te:
      return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
    case B:
    case Ee:
      return Math.ceil(e / 4) * Math.ceil(t / 4) * 8;
    case De:
    case Oe:
      return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
  }
  throw Error(`Unable to determine texture byte length for ${n} format.`);
}
function hs(e) {
  switch (e) {
    case d:
    case f:
      return {
        byteLength: 1,
        components: 1
      };
    case m:
    case p:
    case v:
      return {
        byteLength: 2,
        components: 1
      };
    case y:
    case b:
      return {
        byteLength: 2,
        components: 4
      };
    case g:
    case h:
    case _:
      return {
        byteLength: 4,
        components: 1
      };
    case S:
    case C:
      return {
        byteLength: 4,
        components: 3
      };
  }
  throw Error(`Unknown texture type ${e}.`);
}
(typeof __THREE_DEVTOOLS__ < 'u' &&
  __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('register', { detail: { revision: '184' } })),
  typeof window < 'u' &&
    (window.__THREE__
      ? W('WARNING: Multiple instances of Three.js being imported.')
      : (window.__THREE__ = '184')));
//#endregion
//#region node_modules/three/build/three.module.js
function gs() {
  let e = null,
    t = !1,
    n = null,
    r = null;
  function i(t, a) {
    (n(t, a), (r = e.requestAnimationFrame(i)));
  }
  return {
    start: function () {
      t !== !0 && n !== null && e !== null && ((r = e.requestAnimationFrame(i)), (t = !0));
    },
    stop: function () {
      (e !== null && e.cancelAnimationFrame(r), (t = !1));
    },
    setAnimationLoop: function (e) {
      n = e;
    },
    setContext: function (t) {
      e = t;
    }
  };
}
function _s(e) {
  let t = /* @__PURE__ */ new WeakMap();
  function n(t, n) {
    let r = t.array,
      i = t.usage,
      a = r.byteLength,
      o = e.createBuffer();
    (e.bindBuffer(n, o), e.bufferData(n, r, i), t.onUploadCallback());
    let s;
    if (r instanceof Float32Array) s = e.FLOAT;
    else if (typeof Float16Array < 'u' && r instanceof Float16Array) s = e.HALF_FLOAT;
    else if (r instanceof Uint16Array)
      s = t.isFloat16BufferAttribute ? e.HALF_FLOAT : e.UNSIGNED_SHORT;
    else if (r instanceof Int16Array) s = e.SHORT;
    else if (r instanceof Uint32Array) s = e.UNSIGNED_INT;
    else if (r instanceof Int32Array) s = e.INT;
    else if (r instanceof Int8Array) s = e.BYTE;
    else if (r instanceof Uint8Array) s = e.UNSIGNED_BYTE;
    else if (r instanceof Uint8ClampedArray) s = e.UNSIGNED_BYTE;
    else throw Error('THREE.WebGLAttributes: Unsupported buffer data format: ' + r);
    return {
      buffer: o,
      type: s,
      bytesPerElement: r.BYTES_PER_ELEMENT,
      version: t.version,
      size: a
    };
  }
  function r(t, n, r) {
    let i = n.array,
      a = n.updateRanges;
    if ((e.bindBuffer(r, t), a.length === 0)) e.bufferSubData(r, 0, i);
    else {
      a.sort((e, t) => e.start - t.start);
      let t = 0;
      for (let e = 1; e < a.length; e++) {
        let n = a[t],
          r = a[e];
        r.start <= n.start + n.count + 1
          ? (n.count = Math.max(n.count, r.start + r.count - n.start))
          : (++t, (a[t] = r));
      }
      a.length = t + 1;
      for (let t = 0, n = a.length; t < n; t++) {
        let n = a[t];
        e.bufferSubData(r, n.start * i.BYTES_PER_ELEMENT, i, n.start, n.count);
      }
      n.clearUpdateRanges();
    }
    n.onUploadCallback();
  }
  function i(e) {
    return (e.isInterleavedBufferAttribute && (e = e.data), t.get(e));
  }
  function a(n) {
    n.isInterleavedBufferAttribute && (n = n.data);
    let r = t.get(n);
    r && (e.deleteBuffer(r.buffer), t.delete(n));
  }
  function o(e, i) {
    if ((e.isInterleavedBufferAttribute && (e = e.data), e.isGLBufferAttribute)) {
      let n = t.get(e);
      (!n || n.version < e.version) &&
        t.set(e, {
          buffer: e.buffer,
          type: e.type,
          bytesPerElement: e.elementSize,
          version: e.version
        });
      return;
    }
    let a = t.get(e);
    if (a === void 0) t.set(e, n(e, i));
    else if (a.version < e.version) {
      if (a.size !== e.array.byteLength)
        throw Error(
          "THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported."
        );
      (r(a.buffer, e, i), (a.version = e.version));
    }
  }
  return {
    get: i,
    remove: a,
    update: o
  };
}
var Z = {
    alphahash_fragment:
      '#ifdef USE_ALPHAHASH\n	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;\n#endif',
    alphahash_pars_fragment:
      '#ifdef USE_ALPHAHASH\n	const float ALPHA_HASH_SCALE = 0.05;\n	float hash2D( vec2 value ) {\n		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );\n	}\n	float hash3D( vec3 value ) {\n		return hash2D( vec2( hash2D( value.xy ), value.z ) );\n	}\n	float getAlphaHashThreshold( vec3 position ) {\n		float maxDeriv = max(\n			length( dFdx( position.xyz ) ),\n			length( dFdy( position.xyz ) )\n		);\n		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );\n		vec2 pixScales = vec2(\n			exp2( floor( log2( pixScale ) ) ),\n			exp2( ceil( log2( pixScale ) ) )\n		);\n		vec2 alpha = vec2(\n			hash3D( floor( pixScales.x * position.xyz ) ),\n			hash3D( floor( pixScales.y * position.xyz ) )\n		);\n		float lerpFactor = fract( log2( pixScale ) );\n		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;\n		float a = min( lerpFactor, 1.0 - lerpFactor );\n		vec3 cases = vec3(\n			x * x / ( 2.0 * a * ( 1.0 - a ) ),\n			( x - 0.5 * a ) / ( 1.0 - a ),\n			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )\n		);\n		float threshold = ( x < ( 1.0 - a ) )\n			? ( ( x < a ) ? cases.x : cases.y )\n			: cases.z;\n		return clamp( threshold , 1.0e-6, 1.0 );\n	}\n#endif',
    alphamap_fragment:
      '#ifdef USE_ALPHAMAP\n	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;\n#endif',
    alphamap_pars_fragment: '#ifdef USE_ALPHAMAP\n	uniform sampler2D alphaMap;\n#endif',
    alphatest_fragment:
      '#ifdef USE_ALPHATEST\n	#ifdef ALPHA_TO_COVERAGE\n	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );\n	if ( diffuseColor.a == 0.0 ) discard;\n	#else\n	if ( diffuseColor.a < alphaTest ) discard;\n	#endif\n#endif',
    alphatest_pars_fragment: '#ifdef USE_ALPHATEST\n	uniform float alphaTest;\n#endif',
    aomap_fragment:
      '#ifdef USE_AOMAP\n	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;\n	reflectedLight.indirectDiffuse *= ambientOcclusion;\n	#if defined( USE_CLEARCOAT ) \n		clearcoatSpecularIndirect *= ambientOcclusion;\n	#endif\n	#if defined( USE_SHEEN ) \n		sheenSpecularIndirect *= ambientOcclusion;\n	#endif\n	#if defined( USE_ENVMAP ) && defined( STANDARD )\n		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );\n		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );\n	#endif\n#endif',
    aomap_pars_fragment:
      '#ifdef USE_AOMAP\n	uniform sampler2D aoMap;\n	uniform float aoMapIntensity;\n#endif',
    batching_pars_vertex:
      '#ifdef USE_BATCHING\n	#if ! defined( GL_ANGLE_multi_draw )\n	#define gl_DrawID _gl_DrawID\n	uniform int _gl_DrawID;\n	#endif\n	uniform highp sampler2D batchingTexture;\n	uniform highp usampler2D batchingIdTexture;\n	mat4 getBatchingMatrix( const in float i ) {\n		int size = textureSize( batchingTexture, 0 ).x;\n		int j = int( i ) * 4;\n		int x = j % size;\n		int y = j / size;\n		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );\n		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );\n		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );\n		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );\n		return mat4( v1, v2, v3, v4 );\n	}\n	float getIndirectIndex( const in int i ) {\n		int size = textureSize( batchingIdTexture, 0 ).x;\n		int x = i % size;\n		int y = i / size;\n		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );\n	}\n#endif\n#ifdef USE_BATCHING_COLOR\n	uniform sampler2D batchingColorTexture;\n	vec4 getBatchingColor( const in float i ) {\n		int size = textureSize( batchingColorTexture, 0 ).x;\n		int j = int( i );\n		int x = j % size;\n		int y = j / size;\n		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );\n	}\n#endif',
    batching_vertex:
      '#ifdef USE_BATCHING\n	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );\n#endif',
    begin_vertex:
      'vec3 transformed = vec3( position );\n#ifdef USE_ALPHAHASH\n	vPosition = vec3( position );\n#endif',
    beginnormal_vertex:
      'vec3 objectNormal = vec3( normal );\n#ifdef USE_TANGENT\n	vec3 objectTangent = vec3( tangent.xyz );\n#endif',
    bsdfs:
      'float G_BlinnPhong_Implicit( ) {\n	return 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float dotVH = saturate( dot( viewDir, halfDir ) );\n	vec3 F = F_Schlick( specularColor, 1.0, dotVH );\n	float G = G_BlinnPhong_Implicit( );\n	float D = D_BlinnPhong( shininess, dotNH );\n	return F * ( G * D );\n} // validated',
    iridescence_fragment:
      '#ifdef USE_IRIDESCENCE\n	const mat3 XYZ_TO_REC709 = mat3(\n		 3.2404542, -0.9692660,  0.0556434,\n		-1.5371385,  1.8760108, -0.2040259,\n		-0.4985314,  0.0415560,  1.0572252\n	);\n	vec3 Fresnel0ToIor( vec3 fresnel0 ) {\n		vec3 sqrtF0 = sqrt( fresnel0 );\n		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );\n	}\n	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {\n		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );\n	}\n	float IorToFresnel0( float transmittedIor, float incidentIor ) {\n		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));\n	}\n	vec3 evalSensitivity( float OPD, vec3 shift ) {\n		float phase = 2.0 * PI * OPD * 1.0e-9;\n		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );\n		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );\n		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );\n		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );\n		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );\n		xyz /= 1.0685e-7;\n		vec3 rgb = XYZ_TO_REC709 * xyz;\n		return rgb;\n	}\n	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {\n		vec3 I;\n		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );\n		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );\n		float cosTheta2Sq = 1.0 - sinTheta2Sq;\n		if ( cosTheta2Sq < 0.0 ) {\n			return vec3( 1.0 );\n		}\n		float cosTheta2 = sqrt( cosTheta2Sq );\n		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );\n		float R12 = F_Schlick( R0, 1.0, cosTheta1 );\n		float T121 = 1.0 - R12;\n		float phi12 = 0.0;\n		if ( iridescenceIOR < outsideIOR ) phi12 = PI;\n		float phi21 = PI - phi12;\n		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );\n		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );\n		vec3 phi23 = vec3( 0.0 );\n		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;\n		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;\n		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;\n		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;\n		vec3 phi = vec3( phi21 ) + phi23;\n		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );\n		vec3 r123 = sqrt( R123 );\n		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );\n		vec3 C0 = R12 + Rs;\n		I = C0;\n		vec3 Cm = Rs - T121;\n		for ( int m = 1; m <= 2; ++ m ) {\n			Cm *= r123;\n			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );\n			I += Cm * Sm;\n		}\n		return max( I, vec3( 0.0 ) );\n	}\n#endif',
    bumpmap_pars_fragment:
      '#ifdef USE_BUMPMAP\n	uniform sampler2D bumpMap;\n	uniform float bumpScale;\n	vec2 dHdxy_fwd() {\n		vec2 dSTdx = dFdx( vBumpMapUv );\n		vec2 dSTdy = dFdy( vBumpMapUv );\n		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;\n		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;\n		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;\n		return vec2( dBx, dBy );\n	}\n	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {\n		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );\n		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );\n		vec3 vN = surf_norm;\n		vec3 R1 = cross( vSigmaY, vN );\n		vec3 R2 = cross( vN, vSigmaX );\n		float fDet = dot( vSigmaX, R1 ) * faceDirection;\n		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n		return normalize( abs( fDet ) * surf_norm - vGrad );\n	}\n#endif',
    clipping_planes_fragment:
      '#if NUM_CLIPPING_PLANES > 0\n	vec4 plane;\n	#ifdef ALPHA_TO_COVERAGE\n		float distanceToPlane, distanceGradient;\n		float clipOpacity = 1.0;\n		#pragma unroll_loop_start\n		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n			plane = clippingPlanes[ i ];\n			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;\n			distanceGradient = fwidth( distanceToPlane ) / 2.0;\n			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );\n			if ( clipOpacity == 0.0 ) discard;\n		}\n		#pragma unroll_loop_end\n		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n			float unionClipOpacity = 1.0;\n			#pragma unroll_loop_start\n			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n				plane = clippingPlanes[ i ];\n				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;\n				distanceGradient = fwidth( distanceToPlane ) / 2.0;\n				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );\n			}\n			#pragma unroll_loop_end\n			clipOpacity *= 1.0 - unionClipOpacity;\n		#endif\n		diffuseColor.a *= clipOpacity;\n		if ( diffuseColor.a == 0.0 ) discard;\n	#else\n		#pragma unroll_loop_start\n		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n			plane = clippingPlanes[ i ];\n			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;\n		}\n		#pragma unroll_loop_end\n		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n			bool clipped = true;\n			#pragma unroll_loop_start\n			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n				plane = clippingPlanes[ i ];\n				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;\n			}\n			#pragma unroll_loop_end\n			if ( clipped ) discard;\n		#endif\n	#endif\n#endif',
    clipping_planes_pars_fragment:
      '#if NUM_CLIPPING_PLANES > 0\n	varying vec3 vClipPosition;\n	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif',
    clipping_planes_pars_vertex:
      '#if NUM_CLIPPING_PLANES > 0\n	varying vec3 vClipPosition;\n#endif',
    clipping_planes_vertex:
      '#if NUM_CLIPPING_PLANES > 0\n	vClipPosition = - mvPosition.xyz;\n#endif',
    color_fragment:
      '#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n	diffuseColor *= vColor;\n#endif',
    color_pars_fragment:
      '#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n	varying vec4 vColor;\n#endif',
    color_pars_vertex:
      '#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )\n	varying vec4 vColor;\n#endif',
    color_vertex:
      '#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )\n	vColor = vec4( 1.0 );\n#endif\n#ifdef USE_COLOR_ALPHA\n	vColor *= color;\n#elif defined( USE_COLOR )\n	vColor.rgb *= color;\n#endif\n#ifdef USE_INSTANCING_COLOR\n	vColor.rgb *= instanceColor.rgb;\n#endif\n#ifdef USE_BATCHING_COLOR\n	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );\n#endif',
    common:
      '#define PI 3.141592653589793\n#define PI2 6.283185307179586\n#define PI_HALF 1.5707963267948966\n#define RECIPROCAL_PI 0.3183098861837907\n#define RECIPROCAL_PI2 0.15915494309189535\n#define EPSILON 1e-6\n#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\n#define whiteComplement( a ) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nvec3 pow2( const in vec3 x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }\nfloat average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }\nhighp float rand( const in vec2 uv ) {\n	const highp float a = 12.9898, b = 78.233, c = 43758.5453;\n	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n	return fract( sin( sn ) * c );\n}\n#ifdef HIGH_PRECISION\n	float precisionSafeLength( vec3 v ) { return length( v ); }\n#else\n	float precisionSafeLength( vec3 v ) {\n		float maxComponent = max3( abs( v ) );\n		return length( v / maxComponent ) * maxComponent;\n	}\n#endif\nstruct IncidentLight {\n	vec3 color;\n	vec3 direction;\n	bool visible;\n};\nstruct ReflectedLight {\n	vec3 directDiffuse;\n	vec3 directSpecular;\n	vec3 indirectDiffuse;\n	vec3 indirectSpecular;\n};\n#ifdef USE_ALPHAHASH\n	varying vec3 vPosition;\n#endif\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\nbool isPerspectiveMatrix( mat4 m ) {\n	return m[ 2 ][ 3 ] == - 1.0;\n}\nvec2 equirectUv( in vec3 dir ) {\n	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;\n	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n	return vec2( u, v );\n}\nvec3 BRDF_Lambert( const in vec3 diffuseColor ) {\n	return RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {\n	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n}\nfloat F_Schlick( const in float f0, const in float f90, const in float dotVH ) {\n	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n} // validated',
    cube_uv_reflection_fragment:
      '#ifdef ENVMAP_TYPE_CUBE_UV\n	#define cubeUV_minMipLevel 4.0\n	#define cubeUV_minTileSize 16.0\n	float getFace( vec3 direction ) {\n		vec3 absDirection = abs( direction );\n		float face = - 1.0;\n		if ( absDirection.x > absDirection.z ) {\n			if ( absDirection.x > absDirection.y )\n				face = direction.x > 0.0 ? 0.0 : 3.0;\n			else\n				face = direction.y > 0.0 ? 1.0 : 4.0;\n		} else {\n			if ( absDirection.z > absDirection.y )\n				face = direction.z > 0.0 ? 2.0 : 5.0;\n			else\n				face = direction.y > 0.0 ? 1.0 : 4.0;\n		}\n		return face;\n	}\n	vec2 getUV( vec3 direction, float face ) {\n		vec2 uv;\n		if ( face == 0.0 ) {\n			uv = vec2( direction.z, direction.y ) / abs( direction.x );\n		} else if ( face == 1.0 ) {\n			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );\n		} else if ( face == 2.0 ) {\n			uv = vec2( - direction.x, direction.y ) / abs( direction.z );\n		} else if ( face == 3.0 ) {\n			uv = vec2( - direction.z, direction.y ) / abs( direction.x );\n		} else if ( face == 4.0 ) {\n			uv = vec2( - direction.x, direction.z ) / abs( direction.y );\n		} else {\n			uv = vec2( direction.x, direction.y ) / abs( direction.z );\n		}\n		return 0.5 * ( uv + 1.0 );\n	}\n	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {\n		float face = getFace( direction );\n		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );\n		mipInt = max( mipInt, cubeUV_minMipLevel );\n		float faceSize = exp2( mipInt );\n		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;\n		if ( face > 2.0 ) {\n			uv.y += faceSize;\n			face -= 3.0;\n		}\n		uv.x += face * faceSize;\n		uv.x += filterInt * 3.0 * cubeUV_minTileSize;\n		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );\n		uv.x *= CUBEUV_TEXEL_WIDTH;\n		uv.y *= CUBEUV_TEXEL_HEIGHT;\n		#ifdef texture2DGradEXT\n			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;\n		#else\n			return texture2D( envMap, uv ).rgb;\n		#endif\n	}\n	#define cubeUV_r0 1.0\n	#define cubeUV_m0 - 2.0\n	#define cubeUV_r1 0.8\n	#define cubeUV_m1 - 1.0\n	#define cubeUV_r4 0.4\n	#define cubeUV_m4 2.0\n	#define cubeUV_r5 0.305\n	#define cubeUV_m5 3.0\n	#define cubeUV_r6 0.21\n	#define cubeUV_m6 4.0\n	float roughnessToMip( float roughness ) {\n		float mip = 0.0;\n		if ( roughness >= cubeUV_r1 ) {\n			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;\n		} else if ( roughness >= cubeUV_r4 ) {\n			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;\n		} else if ( roughness >= cubeUV_r5 ) {\n			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;\n		} else if ( roughness >= cubeUV_r6 ) {\n			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;\n		} else {\n			mip = - 2.0 * log2( 1.16 * roughness );		}\n		return mip;\n	}\n	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {\n		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );\n		float mipF = fract( mip );\n		float mipInt = floor( mip );\n		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );\n		if ( mipF == 0.0 ) {\n			return vec4( color0, 1.0 );\n		} else {\n			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );\n			return vec4( mix( color0, color1, mipF ), 1.0 );\n		}\n	}\n#endif',
    defaultnormal_vertex:
      'vec3 transformedNormal = objectNormal;\n#ifdef USE_TANGENT\n	vec3 transformedTangent = objectTangent;\n#endif\n#ifdef USE_BATCHING\n	mat3 bm = mat3( batchingMatrix );\n	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );\n	transformedNormal = bm * transformedNormal;\n	#ifdef USE_TANGENT\n		transformedTangent = bm * transformedTangent;\n	#endif\n#endif\n#ifdef USE_INSTANCING\n	mat3 im = mat3( instanceMatrix );\n	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );\n	transformedNormal = im * transformedNormal;\n	#ifdef USE_TANGENT\n		transformedTangent = im * transformedTangent;\n	#endif\n#endif\ntransformedNormal = normalMatrix * transformedNormal;\n#ifdef FLIP_SIDED\n	transformedNormal = - transformedNormal;\n#endif\n#ifdef USE_TANGENT\n	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;\n	#ifdef FLIP_SIDED\n		transformedTangent = - transformedTangent;\n	#endif\n#endif',
    displacementmap_pars_vertex:
      '#ifdef USE_DISPLACEMENTMAP\n	uniform sampler2D displacementMap;\n	uniform float displacementScale;\n	uniform float displacementBias;\n#endif',
    displacementmap_vertex:
      '#ifdef USE_DISPLACEMENTMAP\n	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );\n#endif',
    emissivemap_fragment:
      '#ifdef USE_EMISSIVEMAP\n	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );\n	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE\n		emissiveColor = sRGBTransferEOTF( emissiveColor );\n	#endif\n	totalEmissiveRadiance *= emissiveColor.rgb;\n#endif',
    emissivemap_pars_fragment: '#ifdef USE_EMISSIVEMAP\n	uniform sampler2D emissiveMap;\n#endif',
    colorspace_fragment: 'gl_FragColor = linearToOutputTexel( gl_FragColor );',
    colorspace_pars_fragment:
      'vec4 LinearTransferOETF( in vec4 value ) {\n	return value;\n}\nvec4 sRGBTransferEOTF( in vec4 value ) {\n	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );\n}\nvec4 sRGBTransferOETF( in vec4 value ) {\n	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );\n}',
    envmap_fragment:
      '#ifdef USE_ENVMAP\n	#ifdef ENV_WORLDPOS\n		vec3 cameraToFrag;\n		if ( isOrthographic ) {\n			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n		} else {\n			cameraToFrag = normalize( vWorldPosition - cameraPosition );\n		}\n		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vec3 reflectVec = reflect( cameraToFrag, worldNormal );\n		#else\n			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );\n		#endif\n	#else\n		vec3 reflectVec = vReflect;\n	#endif\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );\n		#ifdef ENVMAP_BLENDING_MULTIPLY\n			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n		#elif defined( ENVMAP_BLENDING_MIX )\n			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n		#elif defined( ENVMAP_BLENDING_ADD )\n			outgoingLight += envColor.xyz * specularStrength * reflectivity;\n		#endif\n	#endif\n#endif',
    envmap_common_pars_fragment:
      '#ifdef USE_ENVMAP\n	uniform float envMapIntensity;\n	uniform mat3 envMapRotation;\n	#ifdef ENVMAP_TYPE_CUBE\n		uniform samplerCube envMap;\n	#else\n		uniform sampler2D envMap;\n	#endif\n#endif',
    envmap_pars_fragment:
      '#ifdef USE_ENVMAP\n	uniform float reflectivity;\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n		#define ENV_WORLDPOS\n	#endif\n	#ifdef ENV_WORLDPOS\n		varying vec3 vWorldPosition;\n		uniform float refractionRatio;\n	#else\n		varying vec3 vReflect;\n	#endif\n#endif',
    envmap_pars_vertex:
      '#ifdef USE_ENVMAP\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n		#define ENV_WORLDPOS\n	#endif\n	#ifdef ENV_WORLDPOS\n		\n		varying vec3 vWorldPosition;\n	#else\n		varying vec3 vReflect;\n		uniform float refractionRatio;\n	#endif\n#endif',
    envmap_physical_pars_fragment:
      '#ifdef USE_ENVMAP\n	vec3 getIBLIrradiance( const in vec3 normal ) {\n		#ifdef ENVMAP_TYPE_CUBE_UV\n			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );\n			return PI * envMapColor.rgb * envMapIntensity;\n		#else\n			return vec3( 0.0 );\n		#endif\n	}\n	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {\n		#ifdef ENVMAP_TYPE_CUBE_UV\n			vec3 reflectVec = reflect( - viewDir, normal );\n			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );\n			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );\n			return envMapColor.rgb * envMapIntensity;\n		#else\n			return vec3( 0.0 );\n		#endif\n	}\n	#ifdef USE_ANISOTROPY\n		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {\n			#ifdef ENVMAP_TYPE_CUBE_UV\n				vec3 bentNormal = cross( bitangent, viewDir );\n				bentNormal = normalize( cross( bentNormal, bitangent ) );\n				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );\n				return getIBLRadiance( viewDir, bentNormal, roughness );\n			#else\n				return vec3( 0.0 );\n			#endif\n		}\n	#endif\n#endif',
    envmap_vertex:
      '#ifdef USE_ENVMAP\n	#ifdef ENV_WORLDPOS\n		vWorldPosition = worldPosition.xyz;\n	#else\n		vec3 cameraToVertex;\n		if ( isOrthographic ) {\n			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n		} else {\n			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n		}\n		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vReflect = reflect( cameraToVertex, worldNormal );\n		#else\n			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n		#endif\n	#endif\n#endif',
    fog_vertex: '#ifdef USE_FOG\n	vFogDepth = - mvPosition.z;\n#endif',
    fog_pars_vertex: '#ifdef USE_FOG\n	varying float vFogDepth;\n#endif',
    fog_fragment:
      '#ifdef USE_FOG\n	#ifdef FOG_EXP2\n		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );\n	#else\n		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );\n	#endif\n	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif',
    fog_pars_fragment:
      '#ifdef USE_FOG\n	uniform vec3 fogColor;\n	varying float vFogDepth;\n	#ifdef FOG_EXP2\n		uniform float fogDensity;\n	#else\n		uniform float fogNear;\n		uniform float fogFar;\n	#endif\n#endif',
    gradientmap_pars_fragment:
      '#ifdef USE_GRADIENTMAP\n	uniform sampler2D gradientMap;\n#endif\nvec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {\n	float dotNL = dot( normal, lightDirection );\n	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );\n	#ifdef USE_GRADIENTMAP\n		return vec3( texture2D( gradientMap, coord ).r );\n	#else\n		vec2 fw = fwidth( coord ) * 0.5;\n		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );\n	#endif\n}',
    lightmap_pars_fragment:
      '#ifdef USE_LIGHTMAP\n	uniform sampler2D lightMap;\n	uniform float lightMapIntensity;\n#endif',
    lights_lambert_fragment:
      'LambertMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularStrength = specularStrength;',
    lights_lambert_pars_fragment:
      'varying vec3 vViewPosition;\nstruct LambertMaterial {\n	vec3 diffuseColor;\n	float specularStrength;\n};\nvoid RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_Lambert\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert',
    lights_pars_begin:
      'uniform bool receiveShadow;\nuniform vec3 ambientLightColor;\n#if defined( USE_LIGHT_PROBES )\n	uniform vec3 lightProbe[ 9 ];\n#endif\nvec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {\n	float x = normal.x, y = normal.y, z = normal.z;\n	vec3 result = shCoefficients[ 0 ] * 0.886227;\n	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;\n	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;\n	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;\n	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;\n	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;\n	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );\n	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;\n	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );\n	return result;\n}\nvec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {\n	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );\n	return irradiance;\n}\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n	vec3 irradiance = ambientLightColor;\n	return irradiance;\n}\nfloat getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n	if ( cutoffDistance > 0.0 ) {\n		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n	}\n	return distanceFalloff;\n}\nfloat getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {\n	return smoothstep( coneCosine, penumbraCosine, angleCosine );\n}\n#if NUM_DIR_LIGHTS > 0\n	struct DirectionalLight {\n		vec3 direction;\n		vec3 color;\n	};\n	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {\n		light.color = directionalLight.color;\n		light.direction = directionalLight.direction;\n		light.visible = true;\n	}\n#endif\n#if NUM_POINT_LIGHTS > 0\n	struct PointLight {\n		vec3 position;\n		vec3 color;\n		float distance;\n		float decay;\n	};\n	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {\n		vec3 lVector = pointLight.position - geometryPosition;\n		light.direction = normalize( lVector );\n		float lightDistance = length( lVector );\n		light.color = pointLight.color;\n		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );\n		light.visible = ( light.color != vec3( 0.0 ) );\n	}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n	struct SpotLight {\n		vec3 position;\n		vec3 direction;\n		vec3 color;\n		float distance;\n		float decay;\n		float coneCos;\n		float penumbraCos;\n	};\n	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {\n		vec3 lVector = spotLight.position - geometryPosition;\n		light.direction = normalize( lVector );\n		float angleCos = dot( light.direction, spotLight.direction );\n		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n		if ( spotAttenuation > 0.0 ) {\n			float lightDistance = length( lVector );\n			light.color = spotLight.color * spotAttenuation;\n			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );\n			light.visible = ( light.color != vec3( 0.0 ) );\n		} else {\n			light.color = vec3( 0.0 );\n			light.visible = false;\n		}\n	}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n	struct RectAreaLight {\n		vec3 color;\n		vec3 position;\n		vec3 halfWidth;\n		vec3 halfHeight;\n	};\n	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;\n	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n	struct HemisphereLight {\n		vec3 direction;\n		vec3 skyColor;\n		vec3 groundColor;\n	};\n	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {\n		float dotNL = dot( normal, hemiLight.direction );\n		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n		return irradiance;\n	}\n#endif\n#include <lightprobes_pars_fragment>',
    lights_toon_fragment: 'ToonMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;',
    lights_toon_pars_fragment:
      'varying vec3 vViewPosition;\nstruct ToonMaterial {\n	vec3 diffuseColor;\n};\nvoid RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_Toon\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon',
    lights_phong_fragment:
      'BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;',
    lights_phong_pars_fragment:
      'varying vec3 vViewPosition;\nstruct BlinnPhongMaterial {\n	vec3 diffuseColor;\n	vec3 specularColor;\n	float specularShininess;\n	float specularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_BlinnPhong\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong',
    lights_physical_fragment:
      'PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nmaterial.metalness = metalnessFactor;\nvec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );\nfloat geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );\nmaterial.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;\nmaterial.roughness = min( material.roughness, 1.0 );\n#ifdef IOR\n	material.ior = ior;\n	#ifdef USE_SPECULAR\n		float specularIntensityFactor = specularIntensity;\n		vec3 specularColorFactor = specularColor;\n		#ifdef USE_SPECULAR_COLORMAP\n			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;\n		#endif\n		#ifdef USE_SPECULAR_INTENSITYMAP\n			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;\n		#endif\n		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );\n	#else\n		float specularIntensityFactor = 1.0;\n		vec3 specularColorFactor = vec3( 1.0 );\n		material.specularF90 = 1.0;\n	#endif\n	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;\n	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );\n#else\n	material.specularColor = vec3( 0.04 );\n	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );\n	material.specularF90 = 1.0;\n#endif\n#ifdef USE_CLEARCOAT\n	material.clearcoat = clearcoat;\n	material.clearcoatRoughness = clearcoatRoughness;\n	material.clearcoatF0 = vec3( 0.04 );\n	material.clearcoatF90 = 1.0;\n	#ifdef USE_CLEARCOATMAP\n		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;\n	#endif\n	#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;\n	#endif\n	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );\n	material.clearcoatRoughness += geometryRoughness;\n	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );\n#endif\n#ifdef USE_DISPERSION\n	material.dispersion = dispersion;\n#endif\n#ifdef USE_IRIDESCENCE\n	material.iridescence = iridescence;\n	material.iridescenceIOR = iridescenceIOR;\n	#ifdef USE_IRIDESCENCEMAP\n		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;\n	#endif\n	#ifdef USE_IRIDESCENCE_THICKNESSMAP\n		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;\n	#else\n		material.iridescenceThickness = iridescenceThicknessMaximum;\n	#endif\n#endif\n#ifdef USE_SHEEN\n	material.sheenColor = sheenColor;\n	#ifdef USE_SHEEN_COLORMAP\n		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;\n	#endif\n	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );\n	#ifdef USE_SHEEN_ROUGHNESSMAP\n		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;\n	#endif\n#endif\n#ifdef USE_ANISOTROPY\n	#ifdef USE_ANISOTROPYMAP\n		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );\n		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;\n		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;\n	#else\n		vec2 anisotropyV = anisotropyVector;\n	#endif\n	material.anisotropy = length( anisotropyV );\n	if( material.anisotropy == 0.0 ) {\n		anisotropyV = vec2( 1.0, 0.0 );\n	} else {\n		anisotropyV /= material.anisotropy;\n		material.anisotropy = saturate( material.anisotropy );\n	}\n	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );\n	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;\n	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;\n#endif',
    lights_physical_pars_fragment:
      'uniform sampler2D dfgLUT;\nstruct PhysicalMaterial {\n	vec3 diffuseColor;\n	vec3 diffuseContribution;\n	vec3 specularColor;\n	vec3 specularColorBlended;\n	float roughness;\n	float metalness;\n	float specularF90;\n	float dispersion;\n	#ifdef USE_CLEARCOAT\n		float clearcoat;\n		float clearcoatRoughness;\n		vec3 clearcoatF0;\n		float clearcoatF90;\n	#endif\n	#ifdef USE_IRIDESCENCE\n		float iridescence;\n		float iridescenceIOR;\n		float iridescenceThickness;\n		vec3 iridescenceFresnel;\n		vec3 iridescenceF0;\n		vec3 iridescenceFresnelDielectric;\n		vec3 iridescenceFresnelMetallic;\n	#endif\n	#ifdef USE_SHEEN\n		vec3 sheenColor;\n		float sheenRoughness;\n	#endif\n	#ifdef IOR\n		float ior;\n	#endif\n	#ifdef USE_TRANSMISSION\n		float transmission;\n		float transmissionAlpha;\n		float thickness;\n		float attenuationDistance;\n		vec3 attenuationColor;\n	#endif\n	#ifdef USE_ANISOTROPY\n		float anisotropy;\n		float alphaT;\n		vec3 anisotropyT;\n		vec3 anisotropyB;\n	#endif\n};\nvec3 clearcoatSpecularDirect = vec3( 0.0 );\nvec3 clearcoatSpecularIndirect = vec3( 0.0 );\nvec3 sheenSpecularDirect = vec3( 0.0 );\nvec3 sheenSpecularIndirect = vec3(0.0 );\nvec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {\n    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );\n    float x2 = x * x;\n    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );\n    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );\n}\nfloat V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n	float a2 = pow2( alpha );\n	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n	return 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n	float a2 = pow2( alpha );\n	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n	return RECIPROCAL_PI * a2 / pow2( denom );\n}\n#ifdef USE_ANISOTROPY\n	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {\n		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );\n		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );\n		return 0.5 / max( gv + gl, EPSILON );\n	}\n	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {\n		float a2 = alphaT * alphaB;\n		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );\n		highp float v2 = dot( v, v );\n		float w2 = a2 / v2;\n		return RECIPROCAL_PI * a2 * pow2 ( w2 );\n	}\n#endif\n#ifdef USE_CLEARCOAT\n	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {\n		vec3 f0 = material.clearcoatF0;\n		float f90 = material.clearcoatF90;\n		float roughness = material.clearcoatRoughness;\n		float alpha = pow2( roughness );\n		vec3 halfDir = normalize( lightDir + viewDir );\n		float dotNL = saturate( dot( normal, lightDir ) );\n		float dotNV = saturate( dot( normal, viewDir ) );\n		float dotNH = saturate( dot( normal, halfDir ) );\n		float dotVH = saturate( dot( viewDir, halfDir ) );\n		vec3 F = F_Schlick( f0, f90, dotVH );\n		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n		float D = D_GGX( alpha, dotNH );\n		return F * ( V * D );\n	}\n#endif\nvec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {\n	vec3 f0 = material.specularColorBlended;\n	float f90 = material.specularF90;\n	float roughness = material.roughness;\n	float alpha = pow2( roughness );\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNL = saturate( dot( normal, lightDir ) );\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float dotVH = saturate( dot( viewDir, halfDir ) );\n	vec3 F = F_Schlick( f0, f90, dotVH );\n	#ifdef USE_IRIDESCENCE\n		F = mix( F, material.iridescenceFresnel, material.iridescence );\n	#endif\n	#ifdef USE_ANISOTROPY\n		float dotTL = dot( material.anisotropyT, lightDir );\n		float dotTV = dot( material.anisotropyT, viewDir );\n		float dotTH = dot( material.anisotropyT, halfDir );\n		float dotBL = dot( material.anisotropyB, lightDir );\n		float dotBV = dot( material.anisotropyB, viewDir );\n		float dotBH = dot( material.anisotropyB, halfDir );\n		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );\n		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );\n	#else\n		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n		float D = D_GGX( alpha, dotNH );\n	#endif\n	return F * ( V * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n	const float LUT_SIZE = 64.0;\n	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n	const float LUT_BIAS = 0.5 / LUT_SIZE;\n	float dotNV = saturate( dot( N, V ) );\n	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );\n	uv = uv * LUT_SCALE + LUT_BIAS;\n	return uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n	float l = length( f );\n	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n	float x = dot( v1, v2 );\n	float y = abs( x );\n	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;\n	float b = 3.4175940 + ( 4.1616724 + y ) * y;\n	float v = a / b;\n	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;\n	return cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n	vec3 lightNormal = cross( v1, v2 );\n	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n	vec3 T1, T2;\n	T1 = normalize( V - N * dot( V, N ) );\n	T2 = - cross( N, T1 );\n	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );\n	vec3 coords[ 4 ];\n	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n	coords[ 0 ] = normalize( coords[ 0 ] );\n	coords[ 1 ] = normalize( coords[ 1 ] );\n	coords[ 2 ] = normalize( coords[ 2 ] );\n	coords[ 3 ] = normalize( coords[ 3 ] );\n	vec3 vectorFormFactor = vec3( 0.0 );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );\n	return vec3( result );\n}\n#if defined( USE_SHEEN )\nfloat D_Charlie( float roughness, float dotNH ) {\n	float alpha = pow2( roughness );\n	float invAlpha = 1.0 / alpha;\n	float cos2h = dotNH * dotNH;\n	float sin2h = max( 1.0 - cos2h, 0.0078125 );\n	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );\n}\nfloat V_Neubelt( float dotNV, float dotNL ) {\n	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );\n}\nvec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {\n	vec3 halfDir = normalize( lightDir + viewDir );\n	float dotNL = saturate( dot( normal, lightDir ) );\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float dotNH = saturate( dot( normal, halfDir ) );\n	float D = D_Charlie( sheenRoughness, dotNH );\n	float V = V_Neubelt( dotNV, dotNL );\n	return sheenColor * ( D * V );\n}\n#endif\nfloat IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {\n	float dotNV = saturate( dot( normal, viewDir ) );\n	float r2 = roughness * roughness;\n	float rInv = 1.0 / ( roughness + 0.1 );\n	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;\n	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;\n	float DG = exp( a * dotNV + b );\n	return saturate( DG );\n}\nvec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {\n	float dotNV = saturate( dot( normal, viewDir ) );\n	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;\n	return specularColor * fab.x + specularF90 * fab.y;\n}\n#ifdef USE_IRIDESCENCE\nvoid computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#else\nvoid computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#endif\n	float dotNV = saturate( dot( normal, viewDir ) );\n	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;\n	#ifdef USE_IRIDESCENCE\n		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );\n	#else\n		vec3 Fr = specularColor;\n	#endif\n	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;\n	float Ess = fab.x + fab.y;\n	float Ems = 1.0 - Ess;\n	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );\n	singleScatter += FssEss;\n	multiScatter += Fms * Ems;\n}\nvec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {\n	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );\n	float dotNL = saturate( dot( normal, lightDir ) );\n	float dotNV = saturate( dot( normal, viewDir ) );\n	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;\n	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;\n	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;\n	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;\n	float Ess_V = dfgV.x + dfgV.y;\n	float Ess_L = dfgL.x + dfgL.y;\n	float Ems_V = 1.0 - Ess_V;\n	float Ems_L = 1.0 - Ess_L;\n	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;\n	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );\n	float compensationFactor = Ems_V * Ems_L;\n	vec3 multiScatter = Fms * compensationFactor;\n	return singleScatter + multiScatter;\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n		vec3 normal = geometryNormal;\n		vec3 viewDir = geometryViewDir;\n		vec3 position = geometryPosition;\n		vec3 lightPos = rectAreaLight.position;\n		vec3 halfWidth = rectAreaLight.halfWidth;\n		vec3 halfHeight = rectAreaLight.halfHeight;\n		vec3 lightColor = rectAreaLight.color;\n		float roughness = material.roughness;\n		vec3 rectCoords[ 4 ];\n		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;\n		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;\n		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;\n		vec2 uv = LTC_Uv( normal, viewDir, roughness );\n		vec4 t1 = texture2D( ltc_1, uv );\n		vec4 t2 = texture2D( ltc_2, uv );\n		mat3 mInv = mat3(\n			vec3( t1.x, 0, t1.y ),\n			vec3(    0, 1,    0 ),\n			vec3( t1.z, 0, t1.w )\n		);\n		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );\n		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );\n		#ifdef USE_CLEARCOAT\n			vec3 Ncc = geometryClearcoatNormal;\n			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );\n			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );\n			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );\n			mat3 mInvClearcoat = mat3(\n				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),\n				vec3(             0, 1,             0 ),\n				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )\n			);\n			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;\n			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );\n		#endif\n	}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	#ifdef USE_CLEARCOAT\n		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );\n		vec3 ccIrradiance = dotNLcc * directLight.color;\n		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );\n	#endif\n	#ifdef USE_SHEEN\n \n 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );\n \n 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );\n \n 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );\n \n 		irradiance *= sheenEnergyComp;\n \n 	#endif\n	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );\n	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );\n	#ifdef USE_SHEEN\n		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;\n		diffuse *= sheenEnergyComp;\n	#endif\n	reflectedLight.indirectDiffuse += diffuse;\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {\n	#ifdef USE_CLEARCOAT\n		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );\n	#endif\n	#ifdef USE_SHEEN\n		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;\n 	#endif\n	vec3 singleScatteringDielectric = vec3( 0.0 );\n	vec3 multiScatteringDielectric = vec3( 0.0 );\n	vec3 singleScatteringMetallic = vec3( 0.0 );\n	vec3 multiScatteringMetallic = vec3( 0.0 );\n	#ifdef USE_IRIDESCENCE\n		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );\n		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );\n	#else\n		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );\n		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );\n	#endif\n	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );\n	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );\n	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;\n	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );\n	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;\n	vec3 indirectSpecular = radiance * singleScattering;\n	indirectSpecular += multiScattering * cosineWeightedIrradiance;\n	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;\n	#ifdef USE_SHEEN\n		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );\n		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;\n		indirectSpecular *= sheenEnergyComp;\n		indirectDiffuse *= sheenEnergyComp;\n	#endif\n	reflectedLight.indirectSpecular += indirectSpecular;\n	reflectedLight.indirectDiffuse += indirectDiffuse;\n}\n#define RE_Direct				RE_Direct_Physical\n#define RE_Direct_RectArea		RE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular		RE_IndirectSpecular_Physical\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}',
    lights_fragment_begin:
      '\nvec3 geometryPosition = - vViewPosition;\nvec3 geometryNormal = normal;\nvec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\nvec3 geometryClearcoatNormal = vec3( 0.0 );\n#ifdef USE_CLEARCOAT\n	geometryClearcoatNormal = clearcoatNormal;\n#endif\n#ifdef USE_IRIDESCENCE\n	float dotNVi = saturate( dot( normal, geometryViewDir ) );\n	if ( material.iridescenceThickness == 0.0 ) {\n		material.iridescence = 0.0;\n	} else {\n		material.iridescence = saturate( material.iridescence );\n	}\n	if ( material.iridescence > 0.0 ) {\n		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );\n		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );\n		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );\n		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );\n	}\n#endif\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n	PointLight pointLight;\n	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n	PointLightShadow pointLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n		pointLight = pointLights[ i ];\n		getPointLightInfo( pointLight, geometryPosition, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )\n		pointLightShadow = pointLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n	SpotLight spotLight;\n	vec4 spotColor;\n	vec3 spotLightCoord;\n	bool inSpotLightMap;\n	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n	SpotLightShadow spotLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n		spotLight = spotLights[ i ];\n		getSpotLightInfo( spotLight, geometryPosition, directLight );\n		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX\n		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS\n		#else\n		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n		#endif\n		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )\n			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;\n			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );\n			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );\n			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;\n		#endif\n		#undef SPOT_LIGHT_MAP_INDEX\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n		spotLightShadow = spotLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n	DirectionalLight directionalLight;\n	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n	DirectionalLightShadow directionalLightShadow;\n	#endif\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n		directionalLight = directionalLights[ i ];\n		getDirectionalLightInfo( directionalLight, directLight );\n		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n		directionalLightShadow = directionalLightShadows[ i ];\n		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n	RectAreaLight rectAreaLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n		rectAreaLight = rectAreaLights[ i ];\n		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n	}\n	#pragma unroll_loop_end\n#endif\n#if defined( RE_IndirectDiffuse )\n	vec3 iblIrradiance = vec3( 0.0 );\n	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n	#if defined( USE_LIGHT_PROBES )\n		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );\n	#endif\n	#if ( NUM_HEMI_LIGHTS > 0 )\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );\n		}\n		#pragma unroll_loop_end\n	#endif\n	#ifdef USE_LIGHT_PROBES_GRID\n		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;\n		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );\n		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );\n	#endif\n#endif\n#if defined( RE_IndirectSpecular )\n	vec3 radiance = vec3( 0.0 );\n	vec3 clearcoatRadiance = vec3( 0.0 );\n#endif',
    lights_fragment_maps:
      '#if defined( RE_IndirectDiffuse )\n	#ifdef USE_LIGHTMAP\n		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;\n		irradiance += lightMapIrradiance;\n	#endif\n	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )\n		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )\n			iblIrradiance += getIBLIrradiance( geometryNormal );\n		#endif\n	#endif\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n	#ifdef USE_ANISOTROPY\n		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );\n	#else\n		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );\n	#endif\n	#ifdef USE_CLEARCOAT\n		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );\n	#endif\n#endif',
    lights_fragment_end:
      '#if defined( RE_IndirectDiffuse )\n	#if defined( LAMBERT ) || defined( PHONG )\n		irradiance += iblIrradiance;\n	#endif\n	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n#endif\n#if defined( RE_IndirectSpecular )\n	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n#endif',
    lightprobes_pars_fragment:
      '#ifdef USE_LIGHT_PROBES_GRID\nuniform highp sampler3D probesSH;\nuniform vec3 probesMin;\nuniform vec3 probesMax;\nuniform vec3 probesResolution;\nvec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {\n	vec3 res = probesResolution;\n	vec3 gridRange = probesMax - probesMin;\n	vec3 resMinusOne = res - 1.0;\n	vec3 probeSpacing = gridRange / resMinusOne;\n	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;\n	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );\n	uvw = uvw * resMinusOne / res + 0.5 / res;\n	float nz          = res.z;\n	float paddedSlices = nz + 2.0;\n	float atlasDepth  = 7.0 * paddedSlices;\n	float uvZBase     = uvw.z * nz + 1.0;\n	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );\n	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );\n	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );\n	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );\n	vec3 c0 = s0.xyz;\n	vec3 c1 = vec3( s0.w, s1.xy );\n	vec3 c2 = vec3( s1.zw, s2.x );\n	vec3 c3 = s2.yzw;\n	vec3 c4 = s3.xyz;\n	vec3 c5 = vec3( s3.w, s4.xy );\n	vec3 c6 = vec3( s4.zw, s5.x );\n	vec3 c7 = s5.yzw;\n	vec3 c8 = s6.xyz;\n	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;\n	vec3 result = c0 * 0.886227;\n	result += c1 * 2.0 * 0.511664 * y;\n	result += c2 * 2.0 * 0.511664 * z;\n	result += c3 * 2.0 * 0.511664 * x;\n	result += c4 * 2.0 * 0.429043 * x * y;\n	result += c5 * 2.0 * 0.429043 * y * z;\n	result += c6 * ( 0.743125 * z * z - 0.247708 );\n	result += c7 * 2.0 * 0.429043 * x * z;\n	result += c8 * 0.429043 * ( x * x - y * y );\n	return max( result, vec3( 0.0 ) );\n}\n#endif',
    logdepthbuf_fragment:
      '#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )\n	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif',
    logdepthbuf_pars_fragment:
      '#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )\n	uniform float logDepthBufFC;\n	varying float vFragDepth;\n	varying float vIsPerspective;\n#endif',
    logdepthbuf_pars_vertex:
      '#ifdef USE_LOGARITHMIC_DEPTH_BUFFER\n	varying float vFragDepth;\n	varying float vIsPerspective;\n#endif',
    logdepthbuf_vertex:
      '#ifdef USE_LOGARITHMIC_DEPTH_BUFFER\n	vFragDepth = 1.0 + gl_Position.w;\n	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );\n#endif',
    map_fragment:
      '#ifdef USE_MAP\n	vec4 sampledDiffuseColor = texture2D( map, vMapUv );\n	#ifdef DECODE_VIDEO_TEXTURE\n		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );\n	#endif\n	diffuseColor *= sampledDiffuseColor;\n#endif',
    map_pars_fragment: '#ifdef USE_MAP\n	uniform sampler2D map;\n#endif',
    map_particle_fragment:
      '#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n	#if defined( USE_POINTS_UV )\n		vec2 uv = vUv;\n	#else\n		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;\n	#endif\n#endif\n#ifdef USE_MAP\n	diffuseColor *= texture2D( map, uv );\n#endif\n#ifdef USE_ALPHAMAP\n	diffuseColor.a *= texture2D( alphaMap, uv ).g;\n#endif',
    map_particle_pars_fragment:
      '#if defined( USE_POINTS_UV )\n	varying vec2 vUv;\n#else\n	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n		uniform mat3 uvTransform;\n	#endif\n#endif\n#ifdef USE_MAP\n	uniform sampler2D map;\n#endif\n#ifdef USE_ALPHAMAP\n	uniform sampler2D alphaMap;\n#endif',
    metalnessmap_fragment:
      'float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );\n	metalnessFactor *= texelMetalness.b;\n#endif',
    metalnessmap_pars_fragment:
      '#ifdef USE_METALNESSMAP\n	uniform sampler2D metalnessMap;\n#endif',
    morphinstance_vertex:
      '#ifdef USE_INSTANCING_MORPH\n	float morphTargetInfluences[ MORPHTARGETS_COUNT ];\n	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;\n	}\n#endif',
    morphcolor_vertex:
      '#if defined( USE_MORPHCOLORS )\n	vColor *= morphTargetBaseInfluence;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		#if defined( USE_COLOR_ALPHA )\n			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];\n		#elif defined( USE_COLOR )\n			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];\n		#endif\n	}\n#endif',
    morphnormal_vertex:
      '#ifdef USE_MORPHNORMALS\n	objectNormal *= morphTargetBaseInfluence;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];\n	}\n#endif',
    morphtarget_pars_vertex:
      '#ifdef USE_MORPHTARGETS\n	#ifndef USE_INSTANCING_MORPH\n		uniform float morphTargetBaseInfluence;\n		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];\n	#endif\n	uniform sampler2DArray morphTargetsTexture;\n	uniform ivec2 morphTargetsTextureSize;\n	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {\n		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;\n		int y = texelIndex / morphTargetsTextureSize.x;\n		int x = texelIndex - y * morphTargetsTextureSize.x;\n		ivec3 morphUV = ivec3( x, y, morphTargetIndex );\n		return texelFetch( morphTargetsTexture, morphUV, 0 );\n	}\n#endif',
    morphtarget_vertex:
      '#ifdef USE_MORPHTARGETS\n	transformed *= morphTargetBaseInfluence;\n	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];\n	}\n#endif',
    normal_fragment_begin:
      'float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;\n#ifdef FLAT_SHADED\n	vec3 fdx = dFdx( vViewPosition );\n	vec3 fdy = dFdy( vViewPosition );\n	vec3 normal = normalize( cross( fdx, fdy ) );\n#else\n	vec3 normal = normalize( vNormal );\n	#ifdef DOUBLE_SIDED\n		normal *= faceDirection;\n	#endif\n#endif\n#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )\n	#ifdef USE_TANGENT\n		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n	#else\n		mat3 tbn = getTangentFrame( - vViewPosition, normal,\n		#if defined( USE_NORMALMAP )\n			vNormalMapUv\n		#elif defined( USE_CLEARCOAT_NORMALMAP )\n			vClearcoatNormalMapUv\n		#else\n			vUv\n		#endif\n		);\n	#endif\n	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )\n		tbn[0] *= faceDirection;\n		tbn[1] *= faceDirection;\n	#endif\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	#ifdef USE_TANGENT\n		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n	#else\n		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );\n	#endif\n	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )\n		tbn2[0] *= faceDirection;\n		tbn2[1] *= faceDirection;\n	#endif\n#endif\nvec3 nonPerturbedNormal = normal;',
    normal_fragment_maps:
      '#ifdef USE_NORMALMAP_OBJECTSPACE\n	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n	#ifdef FLIP_SIDED\n		normal = - normal;\n	#endif\n	#ifdef DOUBLE_SIDED\n		normal = normal * faceDirection;\n	#endif\n	normal = normalize( normalMatrix * normal );\n#elif defined( USE_NORMALMAP_TANGENTSPACE )\n	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n	#if defined( USE_PACKED_NORMALMAP )\n		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );\n	#endif\n	mapN.xy *= normalScale;\n	normal = normalize( tbn * mapN );\n#elif defined( USE_BUMPMAP )\n	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );\n#endif',
    normal_pars_fragment:
      '#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n	#ifdef USE_TANGENT\n		varying vec3 vTangent;\n		varying vec3 vBitangent;\n	#endif\n#endif',
    normal_pars_vertex:
      '#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n	#ifdef USE_TANGENT\n		varying vec3 vTangent;\n		varying vec3 vBitangent;\n	#endif\n#endif',
    normal_vertex:
      '#ifndef FLAT_SHADED\n	vNormal = normalize( transformedNormal );\n	#ifdef USE_TANGENT\n		vTangent = normalize( transformedTangent );\n		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );\n	#endif\n#endif',
    normalmap_pars_fragment:
      '#ifdef USE_NORMALMAP\n	uniform sampler2D normalMap;\n	uniform vec2 normalScale;\n#endif\n#ifdef USE_NORMALMAP_OBJECTSPACE\n	uniform mat3 normalMatrix;\n#endif\n#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )\n	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {\n		vec3 q0 = dFdx( eye_pos.xyz );\n		vec3 q1 = dFdy( eye_pos.xyz );\n		vec2 st0 = dFdx( uv.st );\n		vec2 st1 = dFdy( uv.st );\n		vec3 N = surf_norm;\n		vec3 q1perp = cross( q1, N );\n		vec3 q0perp = cross( N, q0 );\n		vec3 T = q1perp * st0.x + q0perp * st1.x;\n		vec3 B = q1perp * st0.y + q0perp * st1.y;\n		float det = max( dot( T, T ), dot( B, B ) );\n		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );\n		return mat3( T * scale, B * scale, N );\n	}\n#endif',
    clearcoat_normal_fragment_begin:
      '#ifdef USE_CLEARCOAT\n	vec3 clearcoatNormal = nonPerturbedNormal;\n#endif',
    clearcoat_normal_fragment_maps:
      '#ifdef USE_CLEARCOAT_NORMALMAP\n	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;\n	clearcoatMapN.xy *= clearcoatNormalScale;\n	clearcoatNormal = normalize( tbn2 * clearcoatMapN );\n#endif',
    clearcoat_pars_fragment:
      '#ifdef USE_CLEARCOATMAP\n	uniform sampler2D clearcoatMap;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	uniform sampler2D clearcoatNormalMap;\n	uniform vec2 clearcoatNormalScale;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	uniform sampler2D clearcoatRoughnessMap;\n#endif',
    iridescence_pars_fragment:
      '#ifdef USE_IRIDESCENCEMAP\n	uniform sampler2D iridescenceMap;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	uniform sampler2D iridescenceThicknessMap;\n#endif',
    opaque_fragment:
      '#ifdef OPAQUE\ndiffuseColor.a = 1.0;\n#endif\n#ifdef USE_TRANSMISSION\ndiffuseColor.a *= material.transmissionAlpha;\n#endif\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );',
    packing:
      'vec3 packNormalToRGB( const in vec3 normal ) {\n	return normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n	return 2.0 * rgb.xyz - 1.0;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;\nconst float Inv255 = 1. / 255.;\nconst vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );\nconst vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );\nconst vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );\nconst vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );\nvec4 packDepthToRGBA( const in float v ) {\n	if( v <= 0.0 )\n		return vec4( 0., 0., 0., 0. );\n	if( v >= 1.0 )\n		return vec4( 1., 1., 1., 1. );\n	float vuf;\n	float af = modf( v * PackFactors.a, vuf );\n	float bf = modf( vuf * ShiftRight8, vuf );\n	float gf = modf( vuf * ShiftRight8, vuf );\n	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );\n}\nvec3 packDepthToRGB( const in float v ) {\n	if( v <= 0.0 )\n		return vec3( 0., 0., 0. );\n	if( v >= 1.0 )\n		return vec3( 1., 1., 1. );\n	float vuf;\n	float bf = modf( v * PackFactors.b, vuf );\n	float gf = modf( vuf * ShiftRight8, vuf );\n	return vec3( vuf * Inv255, gf * PackUpscale, bf );\n}\nvec2 packDepthToRG( const in float v ) {\n	if( v <= 0.0 )\n		return vec2( 0., 0. );\n	if( v >= 1.0 )\n		return vec2( 1., 1. );\n	float vuf;\n	float gf = modf( v * 256., vuf );\n	return vec2( vuf * Inv255, gf );\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n	return dot( v, UnpackFactors4 );\n}\nfloat unpackRGBToDepth( const in vec3 v ) {\n	return dot( v, UnpackFactors3 );\n}\nfloat unpackRGToDepth( const in vec2 v ) {\n	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;\n}\nvec4 pack2HalfToRGBA( const in vec2 v ) {\n	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );\n	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );\n}\nvec2 unpackRGBATo2Half( const in vec4 v ) {\n	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n	return ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {\n	#ifdef USE_REVERSED_DEPTH_BUFFER\n	\n		return depth * ( far - near ) - far;\n	#else\n		return depth * ( near - far ) - near;\n	#endif\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {\n	\n	#ifdef USE_REVERSED_DEPTH_BUFFER\n		return ( near * far ) / ( ( near - far ) * depth - near );\n	#else\n		return ( near * far ) / ( ( far - near ) * depth - far );\n	#endif\n}',
    premultiplied_alpha_fragment:
      '#ifdef PREMULTIPLIED_ALPHA\n	gl_FragColor.rgb *= gl_FragColor.a;\n#endif',
    project_vertex:
      'vec4 mvPosition = vec4( transformed, 1.0 );\n#ifdef USE_BATCHING\n	mvPosition = batchingMatrix * mvPosition;\n#endif\n#ifdef USE_INSTANCING\n	mvPosition = instanceMatrix * mvPosition;\n#endif\nmvPosition = modelViewMatrix * mvPosition;\ngl_Position = projectionMatrix * mvPosition;',
    dithering_fragment:
      '#ifdef DITHERING\n	gl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif',
    dithering_pars_fragment:
      '#ifdef DITHERING\n	vec3 dithering( vec3 color ) {\n		float grid_position = rand( gl_FragCoord.xy );\n		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n		return color + dither_shift_RGB;\n	}\n#endif',
    roughnessmap_fragment:
      'float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );\n	roughnessFactor *= texelRoughness.g;\n#endif',
    roughnessmap_pars_fragment:
      '#ifdef USE_ROUGHNESSMAP\n	uniform sampler2D roughnessMap;\n#endif',
    shadowmap_pars_fragment:
      '#if NUM_SPOT_LIGHT_COORDS > 0\n	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#if NUM_SPOT_LIGHT_MAPS > 0\n	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];\n#endif\n#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n		#else\n			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n		#endif\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n		struct DirectionalLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n		#else\n			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n		#endif\n		struct SpotLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		#if defined( SHADOWMAP_TYPE_PCF )\n			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n		#elif defined( SHADOWMAP_TYPE_BASIC )\n			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n		#endif\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n		struct PointLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n			float shadowCameraNear;\n			float shadowCameraFar;\n		};\n		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n	#endif\n	#if defined( SHADOWMAP_TYPE_PCF )\n		float interleavedGradientNoise( vec2 position ) {\n			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );\n		}\n		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {\n			const float goldenAngle = 2.399963229728653;\n			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );\n			float theta = float( sampleIndex ) * goldenAngle + phi;\n			return vec2( cos( theta ), sin( theta ) ) * r;\n		}\n	#endif\n	#if defined( SHADOWMAP_TYPE_PCF )\n		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n			float shadow = 1.0;\n			shadowCoord.xyz /= shadowCoord.w;\n			shadowCoord.z += shadowBias;\n			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n			if ( frustumTest ) {\n				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n				float radius = shadowRadius * texelSize.x;\n				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;\n				shadow = (\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +\n					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )\n				) * 0.2;\n			}\n			return mix( 1.0, shadow, shadowIntensity );\n		}\n	#elif defined( SHADOWMAP_TYPE_VSM )\n		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n			float shadow = 1.0;\n			shadowCoord.xyz /= shadowCoord.w;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				shadowCoord.z -= shadowBias;\n			#else\n				shadowCoord.z += shadowBias;\n			#endif\n			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n			if ( frustumTest ) {\n				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;\n				float mean = distribution.x;\n				float variance = distribution.y * distribution.y;\n				#ifdef USE_REVERSED_DEPTH_BUFFER\n					float hard_shadow = step( mean, shadowCoord.z );\n				#else\n					float hard_shadow = step( shadowCoord.z, mean );\n				#endif\n				\n				if ( hard_shadow == 1.0 ) {\n					shadow = 1.0;\n				} else {\n					variance = max( variance, 0.0000001 );\n					float d = shadowCoord.z - mean;\n					float p_max = variance / ( variance + d * d );\n					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );\n					shadow = max( hard_shadow, p_max );\n				}\n			}\n			return mix( 1.0, shadow, shadowIntensity );\n		}\n	#else\n		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n			float shadow = 1.0;\n			shadowCoord.xyz /= shadowCoord.w;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				shadowCoord.z -= shadowBias;\n			#else\n				shadowCoord.z += shadowBias;\n			#endif\n			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n			if ( frustumTest ) {\n				float depth = texture2D( shadowMap, shadowCoord.xy ).r;\n				#ifdef USE_REVERSED_DEPTH_BUFFER\n					shadow = step( depth, shadowCoord.z );\n				#else\n					shadow = step( shadowCoord.z, depth );\n				#endif\n			}\n			return mix( 1.0, shadow, shadowIntensity );\n		}\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n	#if defined( SHADOWMAP_TYPE_PCF )\n	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n		float shadow = 1.0;\n		vec3 lightToPosition = shadowCoord.xyz;\n		vec3 bd3D = normalize( lightToPosition );\n		vec3 absVec = abs( lightToPosition );\n		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );\n		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );\n				dp -= shadowBias;\n			#else\n				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );\n				dp += shadowBias;\n			#endif\n			float texelSize = shadowRadius / shadowMapSize.x;\n			vec3 absDir = abs( bd3D );\n			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );\n			tangent = normalize( cross( bd3D, tangent ) );\n			vec3 bitangent = cross( bd3D, tangent );\n			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;\n			vec2 sample0 = vogelDiskSample( 0, 5, phi );\n			vec2 sample1 = vogelDiskSample( 1, 5, phi );\n			vec2 sample2 = vogelDiskSample( 2, 5, phi );\n			vec2 sample3 = vogelDiskSample( 3, 5, phi );\n			vec2 sample4 = vogelDiskSample( 4, 5, phi );\n			shadow = (\n				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +\n				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +\n				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +\n				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +\n				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )\n			) * 0.2;\n		}\n		return mix( 1.0, shadow, shadowIntensity );\n	}\n	#elif defined( SHADOWMAP_TYPE_BASIC )\n	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n		float shadow = 1.0;\n		vec3 lightToPosition = shadowCoord.xyz;\n		vec3 absVec = abs( lightToPosition );\n		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );\n		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {\n			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );\n			dp += shadowBias;\n			vec3 bd3D = normalize( lightToPosition );\n			float depth = textureCube( shadowMap, bd3D ).r;\n			#ifdef USE_REVERSED_DEPTH_BUFFER\n				depth = 1.0 - depth;\n			#endif\n			shadow = step( dp, depth );\n		}\n		return mix( 1.0, shadow, shadowIntensity );\n	}\n	#endif\n	#endif\n#endif',
    shadowmap_pars_vertex:
      '#if NUM_SPOT_LIGHT_COORDS > 0\n	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];\n	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n		struct DirectionalLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n		struct SpotLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n		};\n		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n		struct PointLightShadow {\n			float shadowIntensity;\n			float shadowBias;\n			float shadowNormalBias;\n			float shadowRadius;\n			vec2 shadowMapSize;\n			float shadowCameraNear;\n			float shadowCameraFar;\n		};\n		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n	#endif\n#endif',
    shadowmap_vertex:
      '#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )\n	#ifdef HAS_NORMAL\n		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n	#else\n		vec3 shadowWorldNormal = vec3( 0.0 );\n	#endif\n	vec4 shadowWorldPosition;\n#endif\n#if defined( USE_SHADOWMAP )\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );\n			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;\n		}\n		#pragma unroll_loop_end\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0\n		#pragma unroll_loop_start\n		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );\n			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;\n		}\n		#pragma unroll_loop_end\n	#endif\n#endif\n#if NUM_SPOT_LIGHT_COORDS > 0\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {\n		shadowWorldPosition = worldPosition;\n		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;\n		#endif\n		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;\n	}\n	#pragma unroll_loop_end\n#endif',
    shadowmask_pars_fragment:
      'float getShadowMask() {\n	float shadow = 1.0;\n	#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHT_SHADOWS > 0\n	DirectionalLightShadow directionalLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n		directionalLight = directionalLightShadows[ i ];\n		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_SPOT_LIGHT_SHADOWS > 0\n	SpotLightShadow spotLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {\n		spotLight = spotLightShadows[ i ];\n		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )\n	PointLightShadow pointLight;\n	#pragma unroll_loop_start\n	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n		pointLight = pointLightShadows[ i ];\n		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;\n	}\n	#pragma unroll_loop_end\n	#endif\n	#endif\n	return shadow;\n}',
    skinbase_vertex:
      '#ifdef USE_SKINNING\n	mat4 boneMatX = getBoneMatrix( skinIndex.x );\n	mat4 boneMatY = getBoneMatrix( skinIndex.y );\n	mat4 boneMatZ = getBoneMatrix( skinIndex.z );\n	mat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif',
    skinning_pars_vertex:
      '#ifdef USE_SKINNING\n	uniform mat4 bindMatrix;\n	uniform mat4 bindMatrixInverse;\n	uniform highp sampler2D boneTexture;\n	mat4 getBoneMatrix( const in float i ) {\n		int size = textureSize( boneTexture, 0 ).x;\n		int j = int( i ) * 4;\n		int x = j % size;\n		int y = j / size;\n		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );\n		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );\n		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );\n		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );\n		return mat4( v1, v2, v3, v4 );\n	}\n#endif',
    skinning_vertex:
      '#ifdef USE_SKINNING\n	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n	vec4 skinned = vec4( 0.0 );\n	skinned += boneMatX * skinVertex * skinWeight.x;\n	skinned += boneMatY * skinVertex * skinWeight.y;\n	skinned += boneMatZ * skinVertex * skinWeight.z;\n	skinned += boneMatW * skinVertex * skinWeight.w;\n	transformed = ( bindMatrixInverse * skinned ).xyz;\n#endif',
    skinnormal_vertex:
      '#ifdef USE_SKINNING\n	mat4 skinMatrix = mat4( 0.0 );\n	skinMatrix += skinWeight.x * boneMatX;\n	skinMatrix += skinWeight.y * boneMatY;\n	skinMatrix += skinWeight.z * boneMatZ;\n	skinMatrix += skinWeight.w * boneMatW;\n	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;\n	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n	#ifdef USE_TANGENT\n		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n	#endif\n#endif',
    specularmap_fragment:
      'float specularStrength;\n#ifdef USE_SPECULARMAP\n	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );\n	specularStrength = texelSpecular.r;\n#else\n	specularStrength = 1.0;\n#endif',
    specularmap_pars_fragment: '#ifdef USE_SPECULARMAP\n	uniform sampler2D specularMap;\n#endif',
    tonemapping_fragment:
      '#if defined( TONE_MAPPING )\n	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif',
    tonemapping_pars_fragment:
      '#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\nuniform float toneMappingExposure;\nvec3 LinearToneMapping( vec3 color ) {\n	return saturate( toneMappingExposure * color );\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n	color *= toneMappingExposure;\n	return saturate( color / ( vec3( 1.0 ) + color ) );\n}\nvec3 CineonToneMapping( vec3 color ) {\n	color *= toneMappingExposure;\n	color = max( vec3( 0.0 ), color - 0.004 );\n	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\nvec3 RRTAndODTFit( vec3 v ) {\n	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;\n	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;\n	return a / b;\n}\nvec3 ACESFilmicToneMapping( vec3 color ) {\n	const mat3 ACESInputMat = mat3(\n		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),\n		vec3( 0.04823, 0.01566, 0.83777 )\n	);\n	const mat3 ACESOutputMat = mat3(\n		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),\n		vec3( -0.07367, -0.00605,  1.07602 )\n	);\n	color *= toneMappingExposure / 0.6;\n	color = ACESInputMat * color;\n	color = RRTAndODTFit( color );\n	color = ACESOutputMat * color;\n	return saturate( color );\n}\nconst mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(\n	vec3( 1.6605, - 0.1246, - 0.0182 ),\n	vec3( - 0.5876, 1.1329, - 0.1006 ),\n	vec3( - 0.0728, - 0.0083, 1.1187 )\n);\nconst mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(\n	vec3( 0.6274, 0.0691, 0.0164 ),\n	vec3( 0.3293, 0.9195, 0.0880 ),\n	vec3( 0.0433, 0.0113, 0.8956 )\n);\nvec3 agxDefaultContrastApprox( vec3 x ) {\n	vec3 x2 = x * x;\n	vec3 x4 = x2 * x2;\n	return + 15.5 * x4 * x2\n		- 40.14 * x4 * x\n		+ 31.96 * x4\n		- 6.868 * x2 * x\n		+ 0.4298 * x2\n		+ 0.1191 * x\n		- 0.00232;\n}\nvec3 AgXToneMapping( vec3 color ) {\n	const mat3 AgXInsetMatrix = mat3(\n		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),\n		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),\n		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )\n	);\n	const mat3 AgXOutsetMatrix = mat3(\n		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),\n		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),\n		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )\n	);\n	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;\n	color *= toneMappingExposure;\n	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;\n	color = AgXInsetMatrix * color;\n	color = max( color, 1e-10 );	color = log2( color );\n	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );\n	color = clamp( color, 0.0, 1.0 );\n	color = agxDefaultContrastApprox( color );\n	color = AgXOutsetMatrix * color;\n	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );\n	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;\n	color = clamp( color, 0.0, 1.0 );\n	return color;\n}\nvec3 NeutralToneMapping( vec3 color ) {\n	const float StartCompression = 0.8 - 0.04;\n	const float Desaturation = 0.15;\n	color *= toneMappingExposure;\n	float x = min( color.r, min( color.g, color.b ) );\n	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;\n	color -= offset;\n	float peak = max( color.r, max( color.g, color.b ) );\n	if ( peak < StartCompression ) return color;\n	float d = 1. - StartCompression;\n	float newPeak = 1. - d * d / ( peak + d - StartCompression );\n	color *= newPeak / peak;\n	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );\n	return mix( color, vec3( newPeak ), g );\n}\nvec3 CustomToneMapping( vec3 color ) { return color; }',
    transmission_fragment:
      '#ifdef USE_TRANSMISSION\n	material.transmission = transmission;\n	material.transmissionAlpha = 1.0;\n	material.thickness = thickness;\n	material.attenuationDistance = attenuationDistance;\n	material.attenuationColor = attenuationColor;\n	#ifdef USE_TRANSMISSIONMAP\n		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;\n	#endif\n	#ifdef USE_THICKNESSMAP\n		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;\n	#endif\n	vec3 pos = vWorldPosition;\n	vec3 v = normalize( cameraPosition - pos );\n	vec3 n = inverseTransformDirection( normal, viewMatrix );\n	vec4 transmitted = getIBLVolumeRefraction(\n		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,\n		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,\n		material.attenuationColor, material.attenuationDistance );\n	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );\n	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );\n#endif',
    transmission_pars_fragment:
      '#ifdef USE_TRANSMISSION\n	uniform float transmission;\n	uniform float thickness;\n	uniform float attenuationDistance;\n	uniform vec3 attenuationColor;\n	#ifdef USE_TRANSMISSIONMAP\n		uniform sampler2D transmissionMap;\n	#endif\n	#ifdef USE_THICKNESSMAP\n		uniform sampler2D thicknessMap;\n	#endif\n	uniform vec2 transmissionSamplerSize;\n	uniform sampler2D transmissionSamplerMap;\n	uniform mat4 modelMatrix;\n	uniform mat4 projectionMatrix;\n	varying vec3 vWorldPosition;\n	float w0( float a ) {\n		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );\n	}\n	float w1( float a ) {\n		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );\n	}\n	float w2( float a ){\n		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );\n	}\n	float w3( float a ) {\n		return ( 1.0 / 6.0 ) * ( a * a * a );\n	}\n	float g0( float a ) {\n		return w0( a ) + w1( a );\n	}\n	float g1( float a ) {\n		return w2( a ) + w3( a );\n	}\n	float h0( float a ) {\n		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );\n	}\n	float h1( float a ) {\n		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );\n	}\n	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {\n		uv = uv * texelSize.zw + 0.5;\n		vec2 iuv = floor( uv );\n		vec2 fuv = fract( uv );\n		float g0x = g0( fuv.x );\n		float g1x = g1( fuv.x );\n		float h0x = h0( fuv.x );\n		float h1x = h1( fuv.x );\n		float h0y = h0( fuv.y );\n		float h1y = h1( fuv.y );\n		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +\n			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );\n	}\n	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {\n		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );\n		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );\n		vec2 fLodSizeInv = 1.0 / fLodSize;\n		vec2 cLodSizeInv = 1.0 / cLodSize;\n		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );\n		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );\n		return mix( fSample, cSample, fract( lod ) );\n	}\n	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {\n		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );\n		vec3 modelScale;\n		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );\n		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );\n		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );\n		return normalize( refractionVector ) * thickness * modelScale;\n	}\n	float applyIorToRoughness( const in float roughness, const in float ior ) {\n		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );\n	}\n	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {\n		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );\n		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );\n	}\n	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {\n		if ( isinf( attenuationDistance ) ) {\n			return vec3( 1.0 );\n		} else {\n			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;\n			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;\n		}\n	}\n	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,\n		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,\n		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,\n		const in vec3 attenuationColor, const in float attenuationDistance ) {\n		vec4 transmittedLight;\n		vec3 transmittance;\n		#ifdef USE_DISPERSION\n			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;\n			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );\n			for ( int i = 0; i < 3; i ++ ) {\n				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );\n				vec3 refractedRayExit = position + transmissionRay;\n				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n				vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n				refractionCoords += 1.0;\n				refractionCoords /= 2.0;\n				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );\n				transmittedLight[ i ] = transmissionSample[ i ];\n				transmittedLight.a += transmissionSample.a;\n				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];\n			}\n			transmittedLight.a /= 3.0;\n		#else\n			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );\n			vec3 refractedRayExit = position + transmissionRay;\n			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n			vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n			refractionCoords += 1.0;\n			refractionCoords /= 2.0;\n			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );\n			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );\n		#endif\n		vec3 attenuatedColor = transmittance * transmittedLight.rgb;\n		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );\n		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;\n		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );\n	}\n#endif',
    uv_pars_fragment:
      '#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	varying vec2 vUv;\n#endif\n#ifdef USE_MAP\n	varying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n	varying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n	varying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n	varying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n	varying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n	varying vec2 vNormalMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n	varying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n	varying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	varying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	varying vec2 vAnisotropyMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n	varying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	varying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	varying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	varying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	varying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	varying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	varying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n	varying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	varying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	varying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	uniform mat3 transmissionMapTransform;\n	varying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n	uniform mat3 thicknessMapTransform;\n	varying vec2 vThicknessMapUv;\n#endif',
    uv_pars_vertex:
      '#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	varying vec2 vUv;\n#endif\n#ifdef USE_MAP\n	uniform mat3 mapTransform;\n	varying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n	uniform mat3 alphaMapTransform;\n	varying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n	uniform mat3 lightMapTransform;\n	varying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n	uniform mat3 aoMapTransform;\n	varying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n	uniform mat3 bumpMapTransform;\n	varying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n	uniform mat3 normalMapTransform;\n	varying vec2 vNormalMapUv;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n	uniform mat3 displacementMapTransform;\n	varying vec2 vDisplacementMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n	uniform mat3 emissiveMapTransform;\n	varying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n	uniform mat3 metalnessMapTransform;\n	varying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	uniform mat3 roughnessMapTransform;\n	varying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	uniform mat3 anisotropyMapTransform;\n	varying vec2 vAnisotropyMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n	uniform mat3 clearcoatMapTransform;\n	varying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	uniform mat3 clearcoatNormalMapTransform;\n	varying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	uniform mat3 clearcoatRoughnessMapTransform;\n	varying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	uniform mat3 sheenColorMapTransform;\n	varying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	uniform mat3 sheenRoughnessMapTransform;\n	varying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	uniform mat3 iridescenceMapTransform;\n	varying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	uniform mat3 iridescenceThicknessMapTransform;\n	varying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n	uniform mat3 specularMapTransform;\n	varying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	uniform mat3 specularColorMapTransform;\n	varying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	uniform mat3 specularIntensityMapTransform;\n	varying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	uniform mat3 transmissionMapTransform;\n	varying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n	uniform mat3 thicknessMapTransform;\n	varying vec2 vThicknessMapUv;\n#endif',
    uv_vertex:
      '#if defined( USE_UV ) || defined( USE_ANISOTROPY )\n	vUv = vec3( uv, 1 ).xy;\n#endif\n#ifdef USE_MAP\n	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ALPHAMAP\n	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_LIGHTMAP\n	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_AOMAP\n	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_BUMPMAP\n	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_NORMALMAP\n	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_EMISSIVEMAP\n	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_METALNESSMAP\n	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ROUGHNESSMAP\n	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ANISOTROPYMAP\n	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOATMAP\n	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULARMAP\n	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_THICKNESSMAP\n	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;\n#endif',
    worldpos_vertex:
      '#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0\n	vec4 worldPosition = vec4( transformed, 1.0 );\n	#ifdef USE_BATCHING\n		worldPosition = batchingMatrix * worldPosition;\n	#endif\n	#ifdef USE_INSTANCING\n		worldPosition = instanceMatrix * worldPosition;\n	#endif\n	worldPosition = modelMatrix * worldPosition;\n#endif',
    background_vert:
      'varying vec2 vUv;\nuniform mat3 uvTransform;\nvoid main() {\n	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n	gl_Position = vec4( position.xy, 1.0, 1.0 );\n}',
    background_frag:
      'uniform sampler2D t2D;\nuniform float backgroundIntensity;\nvarying vec2 vUv;\nvoid main() {\n	vec4 texColor = texture2D( t2D, vUv );\n	#ifdef DECODE_VIDEO_TEXTURE\n		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );\n	#endif\n	texColor.rgb *= backgroundIntensity;\n	gl_FragColor = texColor;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}',
    backgroundCube_vert:
      'varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n	gl_Position.z = gl_Position.w;\n}',
    backgroundCube_frag:
      '#ifdef ENVMAP_TYPE_CUBE\n	uniform samplerCube envMap;\n#elif defined( ENVMAP_TYPE_CUBE_UV )\n	uniform sampler2D envMap;\n#endif\nuniform float backgroundBlurriness;\nuniform float backgroundIntensity;\nuniform mat3 backgroundRotation;\nvarying vec3 vWorldDirection;\n#include <cube_uv_reflection_fragment>\nvoid main() {\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );\n	#elif defined( ENVMAP_TYPE_CUBE_UV )\n		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );\n	#else\n		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n	#endif\n	texColor.rgb *= backgroundIntensity;\n	gl_FragColor = texColor;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}',
    cube_vert:
      'varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n	gl_Position.z = gl_Position.w;\n}',
    cube_frag:
      'uniform samplerCube tCube;\nuniform float tFlip;\nuniform float opacity;\nvarying vec3 vWorldDirection;\nvoid main() {\n	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );\n	gl_FragColor = texColor;\n	gl_FragColor.a *= opacity;\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}',
    depth_vert:
      '#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <skinbase_vertex>\n	#include <morphinstance_vertex>\n	#ifdef USE_DISPLACEMENTMAP\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vHighPrecisionZW = gl_Position.zw;\n}',
    depth_frag:
      '#if DEPTH_PACKING == 3200\n	uniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n	vec4 diffuseColor = vec4( 1.0 );\n	#include <clipping_planes_fragment>\n	#if DEPTH_PACKING == 3200\n		diffuseColor.a = opacity;\n	#endif\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <logdepthbuf_fragment>\n	#ifdef USE_REVERSED_DEPTH_BUFFER\n		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];\n	#else\n		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;\n	#endif\n	#if DEPTH_PACKING == 3200\n		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );\n	#elif DEPTH_PACKING == 3201\n		gl_FragColor = packDepthToRGBA( fragCoordZ );\n	#elif DEPTH_PACKING == 3202\n		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );\n	#elif DEPTH_PACKING == 3203\n		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );\n	#endif\n}',
    distance_vert:
      '#define DISTANCE\nvarying vec3 vWorldPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <skinbase_vertex>\n	#include <morphinstance_vertex>\n	#ifdef USE_DISPLACEMENTMAP\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <worldpos_vertex>\n	#include <clipping_planes_vertex>\n	vWorldPosition = worldPosition.xyz;\n}',
    distance_frag:
      '#define DISTANCE\nuniform vec3 referencePosition;\nuniform float nearDistance;\nuniform float farDistance;\nvarying vec3 vWorldPosition;\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main () {\n	vec4 diffuseColor = vec4( 1.0 );\n	#include <clipping_planes_fragment>\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	float dist = length( vWorldPosition - referencePosition );\n	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );\n	dist = saturate( dist );\n	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );\n}',
    equirect_vert:
      'varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vWorldDirection = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n}',
    equirect_frag:
      'uniform sampler2D tEquirect;\nvarying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n	vec3 direction = normalize( vWorldDirection );\n	vec2 sampleUV = equirectUv( direction );\n	gl_FragColor = texture2D( tEquirect, sampleUV );\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n}',
    linedashed_vert:
      'uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	vLineDistance = scale * lineDistance;\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n}',
    linedashed_frag:
      'uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	if ( mod( vLineDistance, totalSize ) > dashSize ) {\n		discard;\n	}\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}',
    meshbasic_vert:
      '#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )\n		#include <beginnormal_vertex>\n		#include <morphnormal_vertex>\n		#include <skinbase_vertex>\n		#include <skinnormal_vertex>\n		#include <defaultnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <fog_vertex>\n}',
    meshbasic_frag:
      'uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	#ifdef USE_LIGHTMAP\n		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;\n	#else\n		reflectedLight.indirectDiffuse += vec3( 1.0 );\n	#endif\n	#include <aomap_fragment>\n	reflectedLight.indirectDiffuse *= diffuseColor.rgb;\n	vec3 outgoingLight = reflectedLight.indirectDiffuse;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}',
    meshlambert_vert:
      '#define LAMBERT\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}',
    meshlambert_frag:
      '#define LAMBERT\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_lambert_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_lambert_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}',
    meshmatcap_vert:
      '#define MATCAP\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n	vViewPosition = - mvPosition.xyz;\n}',
    meshmatcap_frag:
      '#define MATCAP\nuniform vec3 diffuse;\nuniform float opacity;\nuniform sampler2D matcap;\nvarying vec3 vViewPosition;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	vec3 viewDir = normalize( vViewPosition );\n	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );\n	vec3 y = cross( viewDir, x );\n	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;\n	#ifdef USE_MATCAP\n		vec4 matcapColor = texture2D( matcap, uv );\n	#else\n		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );\n	#endif\n	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}',
    meshnormal_vert:
      '#define NORMAL\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	varying vec3 vViewPosition;\n#endif\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphinstance_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	vViewPosition = - mvPosition.xyz;\n#endif\n}',
    meshnormal_frag:
      '#define NORMAL\nuniform float opacity;\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n	varying vec3 vViewPosition;\n#endif\n#include <uv_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );\n	#include <clipping_planes_fragment>\n	#include <logdepthbuf_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );\n	#ifdef OPAQUE\n		gl_FragColor.a = 1.0;\n	#endif\n}',
    meshphong_vert:
      '#define PHONG\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphinstance_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}',
    meshphong_frag:
      '#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <specularmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_phong_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n	#include <envmap_fragment>\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}',
    meshphysical_vert:
      '#define STANDARD\nvarying vec3 vViewPosition;\n#ifdef USE_TRANSMISSION\n	varying vec3 vWorldPosition;\n#endif\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n#ifdef USE_TRANSMISSION\n	vWorldPosition = worldPosition.xyz;\n#endif\n}',
    meshphysical_frag:
      '#define STANDARD\n#ifdef PHYSICAL\n	#define IOR\n	#define USE_SPECULAR\n#endif\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifdef IOR\n	uniform float ior;\n#endif\n#ifdef USE_SPECULAR\n	uniform float specularIntensity;\n	uniform vec3 specularColor;\n	#ifdef USE_SPECULAR_COLORMAP\n		uniform sampler2D specularColorMap;\n	#endif\n	#ifdef USE_SPECULAR_INTENSITYMAP\n		uniform sampler2D specularIntensityMap;\n	#endif\n#endif\n#ifdef USE_CLEARCOAT\n	uniform float clearcoat;\n	uniform float clearcoatRoughness;\n#endif\n#ifdef USE_DISPERSION\n	uniform float dispersion;\n#endif\n#ifdef USE_IRIDESCENCE\n	uniform float iridescence;\n	uniform float iridescenceIOR;\n	uniform float iridescenceThicknessMinimum;\n	uniform float iridescenceThicknessMaximum;\n#endif\n#ifdef USE_SHEEN\n	uniform vec3 sheenColor;\n	uniform float sheenRoughness;\n	#ifdef USE_SHEEN_COLORMAP\n		uniform sampler2D sheenColorMap;\n	#endif\n	#ifdef USE_SHEEN_ROUGHNESSMAP\n		uniform sampler2D sheenRoughnessMap;\n	#endif\n#endif\n#ifdef USE_ANISOTROPY\n	uniform vec2 anisotropyVector;\n	#ifdef USE_ANISOTROPYMAP\n		uniform sampler2D anisotropyMap;\n	#endif\n#endif\nvarying vec3 vViewPosition;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <iridescence_fragment>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_physical_pars_fragment>\n#include <transmission_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <clearcoat_pars_fragment>\n#include <iridescence_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <roughnessmap_fragment>\n	#include <metalnessmap_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <clearcoat_normal_fragment_begin>\n	#include <clearcoat_normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_physical_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n	#include <transmission_fragment>\n	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;\n	#ifdef USE_SHEEN\n \n		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;\n \n 	#endif\n	#ifdef USE_CLEARCOAT\n		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );\n		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );\n		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;\n	#endif\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}',
    meshtoon_vert:
      '#define TOON\nvarying vec3 vViewPosition;\n#include <common>\n#include <batching_pars_vertex>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <normal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <displacementmap_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}',
    meshtoon_frag:
      '#define TOON\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <gradientmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_toon_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	#include <normal_fragment_begin>\n	#include <normal_fragment_maps>\n	#include <emissivemap_fragment>\n	#include <lights_toon_fragment>\n	#include <lights_fragment_begin>\n	#include <lights_fragment_maps>\n	#include <lights_fragment_end>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n	#include <dithering_fragment>\n}',
    points_vert:
      'uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n#ifdef USE_POINTS_UV\n	varying vec2 vUv;\n	uniform mat3 uvTransform;\n#endif\nvoid main() {\n	#ifdef USE_POINTS_UV\n		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n	#endif\n	#include <color_vertex>\n	#include <morphinstance_vertex>\n	#include <morphcolor_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <project_vertex>\n	gl_PointSize = size;\n	#ifdef USE_SIZEATTENUATION\n		bool isPerspective = isPerspectiveMatrix( projectionMatrix );\n		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );\n	#endif\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <fog_vertex>\n}',
    points_frag:
      'uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_particle_fragment>\n	#include <color_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}',
    shadow_vert:
      '#include <common>\n#include <batching_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <shadowmap_pars_vertex>\nvoid main() {\n	#include <batching_vertex>\n	#include <beginnormal_vertex>\n	#include <morphinstance_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n	#include <fog_vertex>\n}',
    shadow_frag:
      'uniform vec3 color;\nuniform float opacity;\n#include <common>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <logdepthbuf_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n	#include <logdepthbuf_fragment>\n	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n	#include <premultiplied_alpha_fragment>\n}',
    sprite_vert:
      'uniform float rotation;\nuniform vec2 center;\n#include <common>\n#include <uv_pars_vertex>\n#include <fog_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	vec4 mvPosition = modelViewMatrix[ 3 ];\n	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );\n	#ifndef USE_SIZEATTENUATION\n		bool isPerspective = isPerspectiveMatrix( projectionMatrix );\n		if ( isPerspective ) scale *= - mvPosition.z;\n	#endif\n	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;\n	vec2 rotatedPosition;\n	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\n	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\n	mvPosition.xy += rotatedPosition;\n	gl_Position = projectionMatrix * mvPosition;\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <fog_vertex>\n}',
    sprite_frag:
      'uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <alphahash_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <clipping_planes_fragment>\n	vec3 outgoingLight = vec3( 0.0 );\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <alphahash_fragment>\n	outgoingLight = diffuseColor.rgb;\n	#include <opaque_fragment>\n	#include <tonemapping_fragment>\n	#include <colorspace_fragment>\n	#include <fog_fragment>\n}'
  },
  Q = {
    common: {
      diffuse: { value: /*@__PURE__*/ new X(16777215) },
      opacity: { value: 1 },
      map: { value: null },
      mapTransform: { value: /*@__PURE__*/ new Y() },
      alphaMap: { value: null },
      alphaMapTransform: { value: /*@__PURE__*/ new Y() },
      alphaTest: { value: 0 }
    },
    specularmap: {
      specularMap: { value: null },
      specularMapTransform: { value: /*@__PURE__*/ new Y() }
    },
    envmap: {
      envMap: { value: null },
      envMapRotation: { value: /*@__PURE__*/ new Y() },
      reflectivity: { value: 1 },
      ior: { value: 1.5 },
      refractionRatio: { value: 0.98 },
      dfgLUT: { value: null }
    },
    aomap: {
      aoMap: { value: null },
      aoMapIntensity: { value: 1 },
      aoMapTransform: { value: /*@__PURE__*/ new Y() }
    },
    lightmap: {
      lightMap: { value: null },
      lightMapIntensity: { value: 1 },
      lightMapTransform: { value: /*@__PURE__*/ new Y() }
    },
    bumpmap: {
      bumpMap: { value: null },
      bumpMapTransform: { value: /*@__PURE__*/ new Y() },
      bumpScale: { value: 1 }
    },
    normalmap: {
      normalMap: { value: null },
      normalMapTransform: { value: /*@__PURE__*/ new Y() },
      normalScale: { value: /*@__PURE__*/ new q(1, 1) }
    },
    displacementmap: {
      displacementMap: { value: null },
      displacementMapTransform: { value: /*@__PURE__*/ new Y() },
      displacementScale: { value: 1 },
      displacementBias: { value: 0 }
    },
    emissivemap: {
      emissiveMap: { value: null },
      emissiveMapTransform: { value: /*@__PURE__*/ new Y() }
    },
    metalnessmap: {
      metalnessMap: { value: null },
      metalnessMapTransform: { value: /*@__PURE__*/ new Y() }
    },
    roughnessmap: {
      roughnessMap: { value: null },
      roughnessMapTransform: { value: /*@__PURE__*/ new Y() }
    },
    gradientmap: { gradientMap: { value: null } },
    fog: {
      fogDensity: { value: 25e-5 },
      fogNear: { value: 1 },
      fogFar: { value: 2e3 },
      fogColor: { value: /*@__PURE__*/ new X(16777215) }
    },
    lights: {
      ambientLightColor: { value: [] },
      lightProbe: { value: [] },
      directionalLights: {
        value: [],
        properties: {
          direction: {},
          color: {}
        }
      },
      directionalLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {}
        }
      },
      directionalShadowMatrix: { value: [] },
      spotLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          direction: {},
          distance: {},
          coneCos: {},
          penumbraCos: {},
          decay: {}
        }
      },
      spotLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {}
        }
      },
      spotLightMap: { value: [] },
      spotLightMatrix: { value: [] },
      pointLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          decay: {},
          distance: {}
        }
      },
      pointLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
          shadowCameraNear: {},
          shadowCameraFar: {}
        }
      },
      pointShadowMatrix: { value: [] },
      hemisphereLights: {
        value: [],
        properties: {
          direction: {},
          skyColor: {},
          groundColor: {}
        }
      },
      rectAreaLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          width: {},
          height: {}
        }
      },
      ltc_1: { value: null },
      ltc_2: { value: null },
      probesSH: { value: null },
      probesMin: { value: /*@__PURE__*/ new J() },
      probesMax: { value: /*@__PURE__*/ new J() },
      probesResolution: { value: /*@__PURE__*/ new J() }
    },
    points: {
      diffuse: { value: /*@__PURE__*/ new X(16777215) },
      opacity: { value: 1 },
      size: { value: 1 },
      scale: { value: 1 },
      map: { value: null },
      alphaMap: { value: null },
      alphaMapTransform: { value: /*@__PURE__*/ new Y() },
      alphaTest: { value: 0 },
      uvTransform: { value: /*@__PURE__*/ new Y() }
    },
    sprite: {
      diffuse: { value: /*@__PURE__*/ new X(16777215) },
      opacity: { value: 1 },
      center: { value: /*@__PURE__*/ new q(0.5, 0.5) },
      rotation: { value: 0 },
      map: { value: null },
      mapTransform: { value: /*@__PURE__*/ new Y() },
      alphaMap: { value: null },
      alphaMapTransform: { value: /*@__PURE__*/ new Y() },
      alphaTest: { value: 0 }
    }
  },
  vs = {
    basic: {
      uniforms: /*@__PURE__*/ Ha([Q.common, Q.specularmap, Q.envmap, Q.aomap, Q.lightmap, Q.fog]),
      vertexShader: Z.meshbasic_vert,
      fragmentShader: Z.meshbasic_frag
    },
    lambert: {
      uniforms: /*@__PURE__*/ Ha([
        Q.common,
        Q.specularmap,
        Q.envmap,
        Q.aomap,
        Q.lightmap,
        Q.emissivemap,
        Q.bumpmap,
        Q.normalmap,
        Q.displacementmap,
        Q.fog,
        Q.lights,
        {
          emissive: { value: /*@__PURE__*/ new X(0) },
          envMapIntensity: { value: 1 }
        }
      ]),
      vertexShader: Z.meshlambert_vert,
      fragmentShader: Z.meshlambert_frag
    },
    phong: {
      uniforms: /*@__PURE__*/ Ha([
        Q.common,
        Q.specularmap,
        Q.envmap,
        Q.aomap,
        Q.lightmap,
        Q.emissivemap,
        Q.bumpmap,
        Q.normalmap,
        Q.displacementmap,
        Q.fog,
        Q.lights,
        {
          emissive: { value: /*@__PURE__*/ new X(0) },
          specular: { value: /*@__PURE__*/ new X(1118481) },
          shininess: { value: 30 },
          envMapIntensity: { value: 1 }
        }
      ]),
      vertexShader: Z.meshphong_vert,
      fragmentShader: Z.meshphong_frag
    },
    standard: {
      uniforms: /*@__PURE__*/ Ha([
        Q.common,
        Q.envmap,
        Q.aomap,
        Q.lightmap,
        Q.emissivemap,
        Q.bumpmap,
        Q.normalmap,
        Q.displacementmap,
        Q.roughnessmap,
        Q.metalnessmap,
        Q.fog,
        Q.lights,
        {
          emissive: { value: /*@__PURE__*/ new X(0) },
          roughness: { value: 1 },
          metalness: { value: 0 },
          envMapIntensity: { value: 1 }
        }
      ]),
      vertexShader: Z.meshphysical_vert,
      fragmentShader: Z.meshphysical_frag
    },
    toon: {
      uniforms: /*@__PURE__*/ Ha([
        Q.common,
        Q.aomap,
        Q.lightmap,
        Q.emissivemap,
        Q.bumpmap,
        Q.normalmap,
        Q.displacementmap,
        Q.gradientmap,
        Q.fog,
        Q.lights,
        { emissive: { value: /*@__PURE__*/ new X(0) } }
      ]),
      vertexShader: Z.meshtoon_vert,
      fragmentShader: Z.meshtoon_frag
    },
    matcap: {
      uniforms: /*@__PURE__*/ Ha([
        Q.common,
        Q.bumpmap,
        Q.normalmap,
        Q.displacementmap,
        Q.fog,
        { matcap: { value: null } }
      ]),
      vertexShader: Z.meshmatcap_vert,
      fragmentShader: Z.meshmatcap_frag
    },
    points: {
      uniforms: /*@__PURE__*/ Ha([Q.points, Q.fog]),
      vertexShader: Z.points_vert,
      fragmentShader: Z.points_frag
    },
    dashed: {
      uniforms: /*@__PURE__*/ Ha([
        Q.common,
        Q.fog,
        {
          scale: { value: 1 },
          dashSize: { value: 1 },
          totalSize: { value: 2 }
        }
      ]),
      vertexShader: Z.linedashed_vert,
      fragmentShader: Z.linedashed_frag
    },
    depth: {
      uniforms: /*@__PURE__*/ Ha([Q.common, Q.displacementmap]),
      vertexShader: Z.depth_vert,
      fragmentShader: Z.depth_frag
    },
    normal: {
      uniforms: /*@__PURE__*/ Ha([
        Q.common,
        Q.bumpmap,
        Q.normalmap,
        Q.displacementmap,
        { opacity: { value: 1 } }
      ]),
      vertexShader: Z.meshnormal_vert,
      fragmentShader: Z.meshnormal_frag
    },
    sprite: {
      uniforms: /*@__PURE__*/ Ha([Q.sprite, Q.fog]),
      vertexShader: Z.sprite_vert,
      fragmentShader: Z.sprite_frag
    },
    background: {
      uniforms: {
        uvTransform: { value: /*@__PURE__*/ new Y() },
        t2D: { value: null },
        backgroundIntensity: { value: 1 }
      },
      vertexShader: Z.background_vert,
      fragmentShader: Z.background_frag
    },
    backgroundCube: {
      uniforms: {
        envMap: { value: null },
        backgroundBlurriness: { value: 0 },
        backgroundIntensity: { value: 1 },
        backgroundRotation: { value: /*@__PURE__*/ new Y() }
      },
      vertexShader: Z.backgroundCube_vert,
      fragmentShader: Z.backgroundCube_frag
    },
    cube: {
      uniforms: {
        tCube: { value: null },
        tFlip: { value: -1 },
        opacity: { value: 1 }
      },
      vertexShader: Z.cube_vert,
      fragmentShader: Z.cube_frag
    },
    equirect: {
      uniforms: { tEquirect: { value: null } },
      vertexShader: Z.equirect_vert,
      fragmentShader: Z.equirect_frag
    },
    distance: {
      uniforms: /*@__PURE__*/ Ha([
        Q.common,
        Q.displacementmap,
        {
          referencePosition: { value: /*@__PURE__*/ new J() },
          nearDistance: { value: 1 },
          farDistance: { value: 1e3 }
        }
      ]),
      vertexShader: Z.distance_vert,
      fragmentShader: Z.distance_frag
    },
    shadow: {
      uniforms: /*@__PURE__*/ Ha([
        Q.lights,
        Q.fog,
        {
          color: { value: /*@__PURE__*/ new X(0) },
          opacity: { value: 1 }
        }
      ]),
      vertexShader: Z.shadow_vert,
      fragmentShader: Z.shadow_frag
    }
  };
vs.physical = {
  uniforms: /*@__PURE__*/ Ha([
    vs.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /*@__PURE__*/ new Y() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /*@__PURE__*/ new Y() },
      clearcoatNormalScale: { value: /*@__PURE__*/ new q(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /*@__PURE__*/ new Y() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /*@__PURE__*/ new Y() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /*@__PURE__*/ new Y() },
      sheen: { value: 0 },
      sheenColor: { value: /*@__PURE__*/ new X(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /*@__PURE__*/ new Y() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /*@__PURE__*/ new Y() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /*@__PURE__*/ new Y() },
      transmissionSamplerSize: { value: /*@__PURE__*/ new q() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /*@__PURE__*/ new Y() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /*@__PURE__*/ new X(0) },
      specularColor: { value: /*@__PURE__*/ new X(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /*@__PURE__*/ new Y() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /*@__PURE__*/ new Y() },
      anisotropyVector: { value: /*@__PURE__*/ new q() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /*@__PURE__*/ new Y() }
    }
  ]),
  vertexShader: Z.meshphysical_vert,
  fragmentShader: Z.meshphysical_frag
};
var ys = {
    r: 0,
    b: 0,
    g: 0
  },
  bs = /*@__PURE__*/ new Jt(),
  xs = /*@__PURE__*/ new Y();
xs.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);
function Ss(e, t, n, r, i, a) {
  let o = new X(0),
    s = i === !0 ? 0 : 1,
    c,
    l,
    u = null,
    d = 0,
    f = null;
  function p(e) {
    let n = e.isScene === !0 ? e.background : null;
    if (n && n.isTexture) {
      let r = e.backgroundBlurriness > 0;
      n = t.get(n, r);
    }
    return n;
  }
  function m(t) {
    let r = !1,
      i = p(t);
    i === null ? g(o, s) : i && i.isColor && (g(i, 1), (r = !0));
    let c = e.xr.getEnvironmentBlendMode();
    (c === 'additive'
      ? n.buffers.color.setClear(0, 0, 0, 1, a)
      : c === 'alpha-blend' && n.buffers.color.setClear(0, 0, 0, 0, a),
      (e.autoClear || r) &&
        (n.buffers.depth.setTest(!0),
        n.buffers.depth.setMask(!0),
        n.buffers.color.setMask(!0),
        e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil)));
  }
  function h(t, n) {
    let i = p(n);
    i && (i.isCubeTexture || i.mapping === 306)
      ? (l === void 0 &&
          ((l = new Jr(
            new bi(1, 1, 1),
            new Ya({
              name: 'BackgroundCubeMaterial',
              uniforms: Va(vs.backgroundCube.uniforms),
              vertexShader: vs.backgroundCube.vertexShader,
              fragmentShader: vs.backgroundCube.fragmentShader,
              side: 1,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1
            })
          )),
          l.geometry.deleteAttribute('normal'),
          l.geometry.deleteAttribute('uv'),
          (l.onBeforeRender = function (e, t, n) {
            this.matrixWorld.copyPosition(n.matrixWorld);
          }),
          Object.defineProperty(l.material, 'envMap', {
            get: function () {
              return this.uniforms.envMap.value;
            }
          }),
          r.update(l)),
        (l.material.uniforms.envMap.value = i),
        (l.material.uniforms.backgroundBlurriness.value = n.backgroundBlurriness),
        (l.material.uniforms.backgroundIntensity.value = n.backgroundIntensity),
        l.material.uniforms.backgroundRotation.value
          .setFromMatrix4(bs.makeRotationFromEuler(n.backgroundRotation))
          .transpose(),
        i.isCubeTexture &&
          i.isRenderTargetTexture === !1 &&
          l.material.uniforms.backgroundRotation.value.premultiply(xs),
        (l.material.toneMapped = Mt.getTransfer(i.colorSpace) !== Le),
        (u !== i || d !== i.version || f !== e.toneMapping) &&
          ((l.material.needsUpdate = !0), (u = i), (d = i.version), (f = e.toneMapping)),
        l.layers.enableAll(),
        t.unshift(l, l.geometry, l.material, 0, 0, null))
      : i &&
        i.isTexture &&
        (c === void 0 &&
          ((c = new Jr(
            new za(2, 2),
            new Ya({
              name: 'BackgroundMaterial',
              uniforms: Va(vs.background.uniforms),
              vertexShader: vs.background.vertexShader,
              fragmentShader: vs.background.fragmentShader,
              side: 0,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1
            })
          )),
          c.geometry.deleteAttribute('normal'),
          Object.defineProperty(c.material, 'map', {
            get: function () {
              return this.uniforms.t2D.value;
            }
          }),
          r.update(c)),
        (c.material.uniforms.t2D.value = i),
        (c.material.uniforms.backgroundIntensity.value = n.backgroundIntensity),
        (c.material.toneMapped = Mt.getTransfer(i.colorSpace) !== Le),
        i.matrixAutoUpdate === !0 && i.updateMatrix(),
        c.material.uniforms.uvTransform.value.copy(i.matrix),
        (u !== i || d !== i.version || f !== e.toneMapping) &&
          ((c.material.needsUpdate = !0), (u = i), (d = i.version), (f = e.toneMapping)),
        c.layers.enableAll(),
        t.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function g(t, r) {
    (t.getRGB(ys, Ga(e)), n.buffers.color.setClear(ys.r, ys.g, ys.b, r, a));
  }
  function _() {
    (l !== void 0 && (l.geometry.dispose(), l.material.dispose(), (l = void 0)),
      c !== void 0 && (c.geometry.dispose(), c.material.dispose(), (c = void 0)));
  }
  return {
    getClearColor: function () {
      return o;
    },
    setClearColor: function (e, t = 1) {
      (o.set(e), (s = t), g(o, s));
    },
    getClearAlpha: function () {
      return s;
    },
    setClearAlpha: function (e) {
      ((s = e), g(o, s));
    },
    render: m,
    addToRenderList: h,
    dispose: _
  };
}
function Cs(e, t) {
  let n = e.getParameter(e.MAX_VERTEX_ATTRIBS),
    r = {},
    i = f(null),
    a = i,
    o = !1;
  function s(n, r, i, s, c) {
    let u = !1,
      f = d(n, s, i, r);
    (a !== f && ((a = f), l(a.object)),
      (u = p(n, s, i, c)),
      u && m(n, s, i, c),
      c !== null && t.update(c, e.ELEMENT_ARRAY_BUFFER),
      (u || o) &&
        ((o = !1),
        b(n, r, i, s),
        c !== null && e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, t.get(c).buffer)));
  }
  function c() {
    return e.createVertexArray();
  }
  function l(t) {
    return e.bindVertexArray(t);
  }
  function u(t) {
    return e.deleteVertexArray(t);
  }
  function d(e, t, n, i) {
    let a = i.wireframe === !0,
      o = r[t.id];
    o === void 0 && ((o = {}), (r[t.id] = o));
    let s = e.isInstancedMesh === !0 ? e.id : 0,
      l = o[s];
    l === void 0 && ((l = {}), (o[s] = l));
    let u = l[n.id];
    u === void 0 && ((u = {}), (l[n.id] = u));
    let d = u[a];
    return (d === void 0 && ((d = f(c())), (u[a] = d)), d);
  }
  function f(e) {
    let t = [],
      r = [],
      i = [];
    for (let e = 0; e < n; e++) ((t[e] = 0), (r[e] = 0), (i[e] = 0));
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: t,
      enabledAttributes: r,
      attributeDivisors: i,
      object: e,
      attributes: {},
      index: null
    };
  }
  function p(e, t, n, r) {
    let i = a.attributes,
      o = t.attributes,
      s = 0,
      c = n.getAttributes();
    for (let t in c)
      if (c[t].location >= 0) {
        let n = i[t],
          r = o[t];
        if (
          (r === void 0 &&
            (t === 'instanceMatrix' && e.instanceMatrix && (r = e.instanceMatrix),
            t === 'instanceColor' && e.instanceColor && (r = e.instanceColor)),
          n === void 0 || n.attribute !== r || (r && n.data !== r.data))
        )
          return !0;
        s++;
      }
    return a.attributesNum !== s || a.index !== r;
  }
  function m(e, t, n, r) {
    let i = {},
      o = t.attributes,
      s = 0,
      c = n.getAttributes();
    for (let t in c)
      if (c[t].location >= 0) {
        let n = o[t];
        n === void 0 &&
          (t === 'instanceMatrix' && e.instanceMatrix && (n = e.instanceMatrix),
          t === 'instanceColor' && e.instanceColor && (n = e.instanceColor));
        let r = {};
        ((r.attribute = n), n && n.data && (r.data = n.data), (i[t] = r), s++);
      }
    ((a.attributes = i), (a.attributesNum = s), (a.index = r));
  }
  function h() {
    let e = a.newAttributes;
    for (let t = 0, n = e.length; t < n; t++) e[t] = 0;
  }
  function g(e) {
    _(e, 0);
  }
  function _(t, n) {
    let r = a.newAttributes,
      i = a.enabledAttributes,
      o = a.attributeDivisors;
    ((r[t] = 1),
      i[t] === 0 && (e.enableVertexAttribArray(t), (i[t] = 1)),
      o[t] !== n && (e.vertexAttribDivisor(t, n), (o[t] = n)));
  }
  function v() {
    let t = a.newAttributes,
      n = a.enabledAttributes;
    for (let r = 0, i = n.length; r < i; r++)
      n[r] !== t[r] && (e.disableVertexAttribArray(r), (n[r] = 0));
  }
  function y(t, n, r, i, a, o, s) {
    s === !0 ? e.vertexAttribIPointer(t, n, r, a, o) : e.vertexAttribPointer(t, n, r, i, a, o);
  }
  function b(n, r, i, a) {
    h();
    let o = a.attributes,
      s = i.getAttributes(),
      c = r.defaultAttributeValues;
    for (let r in s) {
      let i = s[r];
      if (i.location >= 0) {
        let s = o[r];
        if (
          (s === void 0 &&
            (r === 'instanceMatrix' && n.instanceMatrix && (s = n.instanceMatrix),
            r === 'instanceColor' && n.instanceColor && (s = n.instanceColor)),
          s !== void 0)
        ) {
          let r = s.normalized,
            o = s.itemSize,
            c = t.get(s);
          if (c === void 0) continue;
          let l = c.buffer,
            u = c.type,
            d = c.bytesPerElement,
            f = u === e.INT || u === e.UNSIGNED_INT || s.gpuType === 1013;
          if (s.isInterleavedBufferAttribute) {
            let t = s.data,
              c = t.stride,
              p = s.offset;
            if (t.isInstancedInterleavedBuffer) {
              for (let e = 0; e < i.locationSize; e++) _(i.location + e, t.meshPerAttribute);
              n.isInstancedMesh !== !0 &&
                a._maxInstanceCount === void 0 &&
                (a._maxInstanceCount = t.meshPerAttribute * t.count);
            } else for (let e = 0; e < i.locationSize; e++) g(i.location + e);
            e.bindBuffer(e.ARRAY_BUFFER, l);
            for (let e = 0; e < i.locationSize; e++)
              y(
                i.location + e,
                o / i.locationSize,
                u,
                r,
                c * d,
                (p + (o / i.locationSize) * e) * d,
                f
              );
          } else {
            if (s.isInstancedBufferAttribute) {
              for (let e = 0; e < i.locationSize; e++) _(i.location + e, s.meshPerAttribute);
              n.isInstancedMesh !== !0 &&
                a._maxInstanceCount === void 0 &&
                (a._maxInstanceCount = s.meshPerAttribute * s.count);
            } else for (let e = 0; e < i.locationSize; e++) g(i.location + e);
            e.bindBuffer(e.ARRAY_BUFFER, l);
            for (let e = 0; e < i.locationSize; e++)
              y(i.location + e, o / i.locationSize, u, r, o * d, (o / i.locationSize) * e * d, f);
          }
        } else if (c !== void 0) {
          let t = c[r];
          if (t !== void 0)
            switch (t.length) {
              case 2:
                e.vertexAttrib2fv(i.location, t);
                break;
              case 3:
                e.vertexAttrib3fv(i.location, t);
                break;
              case 4:
                e.vertexAttrib4fv(i.location, t);
                break;
              default:
                e.vertexAttrib1fv(i.location, t);
            }
        }
      }
    }
    v();
  }
  function x() {
    T();
    for (let e in r) {
      let t = r[e];
      for (let e in t) {
        let n = t[e];
        for (let e in n) {
          let t = n[e];
          for (let e in t) (u(t[e].object), delete t[e]);
          delete n[e];
        }
      }
      delete r[e];
    }
  }
  function S(e) {
    if (r[e.id] === void 0) return;
    let t = r[e.id];
    for (let e in t) {
      let n = t[e];
      for (let e in n) {
        let t = n[e];
        for (let e in t) (u(t[e].object), delete t[e]);
        delete n[e];
      }
    }
    delete r[e.id];
  }
  function C(e) {
    for (let t in r) {
      let n = r[t];
      for (let t in n) {
        let r = n[t];
        if (r[e.id] === void 0) continue;
        let i = r[e.id];
        for (let e in i) (u(i[e].object), delete i[e]);
        delete r[e.id];
      }
    }
  }
  function w(e) {
    for (let t in r) {
      let n = r[t],
        i = e.isInstancedMesh === !0 ? e.id : 0,
        a = n[i];
      if (a !== void 0) {
        for (let e in a) {
          let t = a[e];
          for (let e in t) (u(t[e].object), delete t[e]);
          delete a[e];
        }
        (delete n[i], Object.keys(n).length === 0 && delete r[t]);
      }
    }
  }
  function T() {
    (E(), (o = !0), a !== i && ((a = i), l(a.object)));
  }
  function E() {
    ((i.geometry = null), (i.program = null), (i.wireframe = !1));
  }
  return {
    setup: s,
    reset: T,
    resetDefaultState: E,
    dispose: x,
    releaseStatesOfGeometry: S,
    releaseStatesOfObject: w,
    releaseStatesOfProgram: C,
    initAttributes: h,
    enableAttribute: g,
    disableUnusedAttributes: v
  };
}
function ws(e, t, n) {
  let r;
  function i(e) {
    r = e;
  }
  function a(t, i) {
    (e.drawArrays(r, t, i), n.update(i, r, 1));
  }
  function o(t, i, a) {
    a !== 0 && (e.drawArraysInstanced(r, t, i, a), n.update(i, r, a));
  }
  function s(e, i, a) {
    if (a === 0) return;
    t.get('WEBGL_multi_draw').multiDrawArraysWEBGL(r, e, 0, i, 0, a);
    let o = 0;
    for (let e = 0; e < a; e++) o += i[e];
    n.update(o, r, 1);
  }
  ((this.setMode = i), (this.render = a), (this.renderInstances = o), (this.renderMultiDraw = s));
}
function Ts(e, t, n, r) {
  let i;
  function a() {
    if (i !== void 0) return i;
    if (t.has('EXT_texture_filter_anisotropic') === !0) {
      let n = t.get('EXT_texture_filter_anisotropic');
      i = e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else i = 0;
    return i;
  }
  function o(t) {
    return !(t !== 1023 && r.convert(t) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function s(n) {
    let i = n === 1016 && (t.has('EXT_color_buffer_half_float') || t.has('EXT_color_buffer_float'));
    return !(
      n !== 1009 &&
      r.convert(n) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE) &&
      n !== 1015 &&
      !i
    );
  }
  function c(t) {
    if (t === 'highp') {
      if (
        e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).precision > 0 &&
        e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).precision > 0
      )
        return 'highp';
      t = 'mediump';
    }
    return t === 'mediump' &&
      e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).precision > 0 &&
      e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).precision > 0
      ? 'mediump'
      : 'lowp';
  }
  let l = n.precision === void 0 ? 'highp' : n.precision,
    u = c(l);
  u !== l && (W('WebGLRenderer:', l, 'not supported, using', u, 'instead.'), (l = u));
  let d = n.logarithmicDepthBuffer === !0,
    f = n.reversedDepthBuffer === !0 && t.has('EXT_clip_control');
  n.reversedDepthBuffer === !0 &&
    f === !1 &&
    W(
      'WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.'
    );
  let p = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),
    m = e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    h = e.getParameter(e.MAX_TEXTURE_SIZE),
    g = e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),
    _ = e.getParameter(e.MAX_VERTEX_ATTRIBS),
    v = e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),
    y = e.getParameter(e.MAX_VARYING_VECTORS),
    b = e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),
    x = e.getParameter(e.MAX_SAMPLES),
    S = e.getParameter(e.SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: a,
    getMaxPrecision: c,
    textureFormatReadable: o,
    textureTypeReadable: s,
    precision: l,
    logarithmicDepthBuffer: d,
    reversedDepthBuffer: f,
    maxTextures: p,
    maxVertexTextures: m,
    maxTextureSize: h,
    maxCubemapSize: g,
    maxAttributes: _,
    maxVertexUniforms: v,
    maxVaryings: y,
    maxFragmentUniforms: b,
    maxSamples: x,
    samples: S
  };
}
function Es(e) {
  let t = this,
    n = null,
    r = 0,
    i = !1,
    a = !1,
    o = new ui(),
    s = new Y(),
    c = {
      value: null,
      needsUpdate: !1
    };
  ((this.uniform = c),
    (this.numPlanes = 0),
    (this.numIntersection = 0),
    (this.init = function (e, t) {
      let n = e.length !== 0 || t || r !== 0 || i;
      return ((i = t), (r = e.length), n);
    }),
    (this.beginShadows = function () {
      ((a = !0), u(null));
    }),
    (this.endShadows = function () {
      a = !1;
    }),
    (this.setGlobalState = function (e, t) {
      n = u(e, t, 0);
    }),
    (this.setState = function (t, o, s) {
      let d = t.clippingPlanes,
        f = t.clipIntersection,
        p = t.clipShadows,
        m = e.get(t);
      if (!i || d === null || d.length === 0 || (a && !p)) a ? u(null) : l();
      else {
        let e = a ? 0 : r,
          t = e * 4,
          i = m.clippingState || null;
        ((c.value = i), (i = u(d, o, t, s)));
        for (let e = 0; e !== t; ++e) i[e] = n[e];
        ((m.clippingState = i),
          (this.numIntersection = f ? this.numPlanes : 0),
          (this.numPlanes += e));
      }
    }));
  function l() {
    (c.value !== n && ((c.value = n), (c.needsUpdate = r > 0)),
      (t.numPlanes = r),
      (t.numIntersection = 0));
  }
  function u(e, n, r, i) {
    let a = e === null ? 0 : e.length,
      l = null;
    if (a !== 0) {
      if (((l = c.value), i !== !0 || l === null)) {
        let t = r + a * 4,
          i = n.matrixWorldInverse;
        (s.getNormalMatrix(i), (l === null || l.length < t) && (l = new Float32Array(t)));
        for (let t = 0, n = r; t !== a; ++t, n += 4)
          (o.copy(e[t]).applyMatrix4(i, s), o.normal.toArray(l, n), (l[n + 3] = o.constant));
      }
      ((c.value = l), (c.needsUpdate = !0));
    }
    return ((t.numPlanes = a), (t.numIntersection = 0), l);
  }
}
var Ds = 4,
  Os = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582],
  ks = 20,
  As = 256,
  js = /*@__PURE__*/ new Bo(),
  Ms = /*@__PURE__*/ new X(),
  Ns = null,
  Ps = 0,
  Fs = 0,
  Is = !1,
  Ls = /*@__PURE__*/ new J(),
  Rs = class {
    constructor(e) {
      ((this._renderer = e),
        (this._pingPongRenderTarget = null),
        (this._lodMax = 0),
        (this._cubeSize = 0),
        (this._sizeLods = []),
        (this._sigmas = []),
        (this._lodMeshes = []),
        (this._backgroundBox = null),
        (this._cubemapMaterial = null),
        (this._equirectMaterial = null),
        (this._blurMaterial = null),
        (this._ggxMaterial = null));
    }
    fromScene(e, t = 0, n = 0.1, r = 100, i = {}) {
      let { size: a = 256, position: o = Ls } = i;
      ((Ns = this._renderer.getRenderTarget()),
        (Ps = this._renderer.getActiveCubeFace()),
        (Fs = this._renderer.getActiveMipmapLevel()),
        (Is = this._renderer.xr.enabled),
        (this._renderer.xr.enabled = !1),
        this._setSize(a));
      let s = this._allocateTargets();
      return (
        (s.depthBuffer = !0),
        this._sceneToCubeUV(e, n, r, s, o),
        t > 0 && this._blur(s, 0, 0, t),
        this._applyPMREM(s),
        this._cleanup(s),
        s
      );
    }
    fromEquirectangular(e, t = null) {
      return this._fromTexture(e, t);
    }
    fromCubemap(e, t = null) {
      return this._fromTexture(e, t);
    }
    compileCubemapShader() {
      this._cubemapMaterial === null &&
        ((this._cubemapMaterial = Gs()), this._compileMaterial(this._cubemapMaterial));
    }
    compileEquirectangularShader() {
      this._equirectMaterial === null &&
        ((this._equirectMaterial = Ws()), this._compileMaterial(this._equirectMaterial));
    }
    dispose() {
      (this._dispose(),
        this._cubemapMaterial !== null && this._cubemapMaterial.dispose(),
        this._equirectMaterial !== null && this._equirectMaterial.dispose(),
        this._backgroundBox !== null &&
          (this._backgroundBox.geometry.dispose(), this._backgroundBox.material.dispose()));
    }
    _setSize(e) {
      ((this._lodMax = Math.floor(Math.log2(e))), (this._cubeSize = 2 ** this._lodMax));
    }
    _dispose() {
      (this._blurMaterial !== null && this._blurMaterial.dispose(),
        this._ggxMaterial !== null && this._ggxMaterial.dispose(),
        this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose());
      for (let e = 0; e < this._lodMeshes.length; e++) this._lodMeshes[e].geometry.dispose();
    }
    _cleanup(e) {
      (this._renderer.setRenderTarget(Ns, Ps, Fs),
        (this._renderer.xr.enabled = Is),
        (e.scissorTest = !1),
        Vs(e, 0, 0, e.width, e.height));
    }
    _fromTexture(e, t) {
      (e.mapping === 301 || e.mapping === 302
        ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width)
        : this._setSize(e.image.width / 4),
        (Ns = this._renderer.getRenderTarget()),
        (Ps = this._renderer.getActiveCubeFace()),
        (Fs = this._renderer.getActiveMipmapLevel()),
        (Is = this._renderer.xr.enabled),
        (this._renderer.xr.enabled = !1));
      let n = t || this._allocateTargets();
      return (this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n);
    }
    _allocateTargets() {
      let e = 3 * Math.max(this._cubeSize, 112),
        t = 4 * this._cubeSize,
        n = {
          magFilter: c,
          minFilter: c,
          generateMipmaps: !1,
          type: v,
          format: E,
          colorSpace: Fe,
          depthBuffer: !1
        },
        r = Bs(e, t, n);
      if (
        this._pingPongRenderTarget === null ||
        this._pingPongRenderTarget.width !== e ||
        this._pingPongRenderTarget.height !== t
      ) {
        (this._pingPongRenderTarget !== null && this._dispose(),
          (this._pingPongRenderTarget = Bs(e, t, n)));
        let { _lodMax: r } = this;
        (({ lodMeshes: this._lodMeshes, sizeLods: this._sizeLods, sigmas: this._sigmas } = zs(r)),
          (this._blurMaterial = Us(r, e, t)),
          (this._ggxMaterial = Hs(r, e, t)));
      }
      return r;
    }
    _compileMaterial(e) {
      let t = new Jr(new Tr(), e);
      this._renderer.compile(t, js);
    }
    _sceneToCubeUV(e, t, n, r, i) {
      let a = new Lo(90, 1, t, n),
        o = [1, -1, 1, 1, 1, 1],
        s = [1, 1, 1, -1, -1, -1],
        c = this._renderer,
        l = c.autoClear,
        u = c.toneMapping;
      (c.getClearColor(Ms),
        (c.toneMapping = 0),
        (c.autoClear = !1),
        c.state.buffers.depth.getReversed() &&
          (c.setRenderTarget(r), c.clearDepth(), c.setRenderTarget(null)),
        this._backgroundBox === null &&
          (this._backgroundBox = new Jr(
            new bi(),
            new Ir({
              name: 'PMREM.Background',
              side: 1,
              depthWrite: !1,
              depthTest: !1
            })
          )));
      let d = this._backgroundBox,
        f = d.material,
        p = !1,
        m = e.background;
      m
        ? m.isColor && (f.color.copy(m), (e.background = null), (p = !0))
        : (f.color.copy(Ms), (p = !0));
      for (let t = 0; t < 6; t++) {
        let n = t % 3;
        n === 0
          ? (a.up.set(0, o[t], 0), a.position.set(i.x, i.y, i.z), a.lookAt(i.x + s[t], i.y, i.z))
          : n === 1
            ? (a.up.set(0, 0, o[t]), a.position.set(i.x, i.y, i.z), a.lookAt(i.x, i.y + s[t], i.z))
            : (a.up.set(0, o[t], 0), a.position.set(i.x, i.y, i.z), a.lookAt(i.x, i.y, i.z + s[t]));
        let l = this._cubeSize;
        (Vs(r, n * l, t > 2 ? l : 0, l, l),
          c.setRenderTarget(r),
          p && c.render(d, a),
          c.render(e, a));
      }
      ((c.toneMapping = u), (c.autoClear = l), (e.background = m));
    }
    _textureToCubeUV(e, t) {
      let n = this._renderer,
        r = e.mapping === 301 || e.mapping === 302;
      r
        ? (this._cubemapMaterial === null && (this._cubemapMaterial = Gs()),
          (this._cubemapMaterial.uniforms.flipEnvMap.value =
            e.isRenderTargetTexture === !1 ? -1 : 1))
        : this._equirectMaterial === null && (this._equirectMaterial = Ws());
      let i = r ? this._cubemapMaterial : this._equirectMaterial,
        a = this._lodMeshes[0];
      a.material = i;
      let o = i.uniforms;
      o.envMap.value = e;
      let s = this._cubeSize;
      (Vs(t, 0, 0, 3 * s, 2 * s), n.setRenderTarget(t), n.render(a, js));
    }
    _applyPMREM(e) {
      let t = this._renderer,
        n = t.autoClear;
      t.autoClear = !1;
      let r = this._lodMeshes.length;
      for (let t = 1; t < r; t++) this._applyGGXFilter(e, t - 1, t);
      t.autoClear = n;
    }
    _applyGGXFilter(e, t, n) {
      let r = this._renderer,
        i = this._pingPongRenderTarget,
        a = this._ggxMaterial,
        o = this._lodMeshes[n];
      o.material = a;
      let s = a.uniforms,
        c = n / (this._lodMeshes.length - 1),
        l = t / (this._lodMeshes.length - 1),
        u = Math.sqrt(c * c - l * l) * (0 + c * 1.25),
        { _lodMax: d } = this,
        f = this._sizeLods[n],
        p = 3 * f * (n > d - Ds ? n - d + Ds : 0),
        m = 4 * (this._cubeSize - f);
      ((s.envMap.value = e.texture),
        (s.roughness.value = u),
        (s.mipInt.value = d - t),
        Vs(i, p, m, 3 * f, 2 * f),
        r.setRenderTarget(i),
        r.render(o, js),
        (s.envMap.value = i.texture),
        (s.roughness.value = 0),
        (s.mipInt.value = d - n),
        Vs(e, p, m, 3 * f, 2 * f),
        r.setRenderTarget(e),
        r.render(o, js));
    }
    _blur(e, t, n, r, i) {
      let a = this._pingPongRenderTarget;
      (this._halfBlur(e, a, t, n, r, 'latitudinal', i),
        this._halfBlur(a, e, n, n, r, 'longitudinal', i));
    }
    _halfBlur(e, t, n, r, i, a, o) {
      let s = this._renderer,
        c = this._blurMaterial;
      a !== 'latitudinal' &&
        a !== 'longitudinal' &&
        G('blur direction must be either latitudinal or longitudinal!');
      let l = this._lodMeshes[r];
      l.material = c;
      let u = c.uniforms,
        d = this._sizeLods[n] - 1,
        f = isFinite(i) ? Math.PI / (2 * d) : (2 * Math.PI) / (2 * ks - 1),
        p = i / f,
        m = isFinite(i) ? 1 + Math.floor(3 * p) : ks;
      m > ks &&
        W(
          `sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ks}`
        );
      let h = [],
        g = 0;
      for (let e = 0; e < ks; ++e) {
        let t = e / p,
          n = Math.exp((-t * t) / 2);
        (h.push(n), e === 0 ? (g += n) : e < m && (g += 2 * n));
      }
      for (let e = 0; e < h.length; e++) h[e] = h[e] / g;
      ((u.envMap.value = e.texture),
        (u.samples.value = m),
        (u.weights.value = h),
        (u.latitudinal.value = a === 'latitudinal'),
        o && (u.poleAxis.value = o));
      let { _lodMax: _ } = this;
      ((u.dTheta.value = f), (u.mipInt.value = _ - n));
      let v = this._sizeLods[r];
      (Vs(t, 3 * v * (r > _ - Ds ? r - _ + Ds : 0), 4 * (this._cubeSize - v), 3 * v, 2 * v),
        s.setRenderTarget(t),
        s.render(l, js));
    }
  };
function zs(e) {
  let t = [],
    n = [],
    r = [],
    i = e,
    a = e - Ds + 1 + Os.length;
  for (let o = 0; o < a; o++) {
    let a = 2 ** i;
    t.push(a);
    let s = 1 / a;
    (o > e - Ds ? (s = Os[o - e + Ds - 1]) : o === 0 && (s = 0), n.push(s));
    let c = 1 / (a - 2),
      l = -c,
      u = 1 + c,
      d = [l, l, u, l, u, u, l, l, u, u, l, u],
      f = new Float32Array(108),
      p = new Float32Array(72),
      m = new Float32Array(36);
    for (let e = 0; e < 6; e++) {
      let t = ((e % 3) * 2) / 3 - 1,
        n = e > 2 ? 0 : -1,
        r = [
          t,
          n,
          0,
          t + 2 / 3,
          n,
          0,
          t + 2 / 3,
          n + 1,
          0,
          t,
          n,
          0,
          t + 2 / 3,
          n + 1,
          0,
          t,
          n + 1,
          0
        ];
      (f.set(r, 18 * e), p.set(d, 12 * e));
      let i = [e, e, e, e, e, e];
      m.set(i, 6 * e);
    }
    let h = new Tr();
    (h.setAttribute('position', new ur(f, 3)),
      h.setAttribute('uv', new ur(p, 2)),
      h.setAttribute('faceIndex', new ur(m, 1)),
      r.push(new Jr(h, null)),
      i > Ds && i--);
  }
  return {
    lodMeshes: r,
    sizeLods: t,
    sigmas: n
  };
}
function Bs(e, t, n) {
  let r = new Gt(e, t, n);
  return ((r.texture.mapping = 306), (r.texture.name = 'PMREM.cubeUv'), (r.scissorTest = !0), r);
}
function Vs(e, t, n, r, i) {
  (e.viewport.set(t, n, r, i), e.scissor.set(t, n, r, i));
}
function Hs(e, t, n) {
  return new Ya({
    name: 'PMREMGGXConvolution',
    defines: {
      GGX_SAMPLES: As,
      CUBEUV_TEXEL_WIDTH: 1 / t,
      CUBEUV_TEXEL_HEIGHT: 1 / n,
      CUBEUV_MAX_MIP: `${e}.0`
    },
    uniforms: {
      envMap: { value: null },
      roughness: { value: 0 },
      mipInt: { value: 0 }
    },
    vertexShader: Ks(),
    fragmentShader:
      '\n\n			precision highp float;\n			precision highp int;\n\n			varying vec3 vOutputDirection;\n\n			uniform sampler2D envMap;\n			uniform float roughness;\n			uniform float mipInt;\n\n			#define ENVMAP_TYPE_CUBE_UV\n			#include <cube_uv_reflection_fragment>\n\n			#define PI 3.14159265359\n\n			// Van der Corput radical inverse\n			float radicalInverse_VdC(uint bits) {\n				bits = (bits << 16u) | (bits >> 16u);\n				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);\n				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);\n				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);\n				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);\n				return float(bits) * 2.3283064365386963e-10; // / 0x100000000\n			}\n\n			// Hammersley sequence\n			vec2 hammersley(uint i, uint N) {\n				return vec2(float(i) / float(N), radicalInverse_VdC(i));\n			}\n\n			// GGX VNDF importance sampling (Eric Heitz 2018)\n			// "Sampling the GGX Distribution of Visible Normals"\n			// https://jcgt.org/published/0007/04/01/\n			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {\n				float alpha = roughness * roughness;\n\n				// Section 4.1: Orthonormal basis\n				vec3 T1 = vec3(1.0, 0.0, 0.0);\n				vec3 T2 = cross(V, T1);\n\n				// Section 4.2: Parameterization of projected area\n				float r = sqrt(Xi.x);\n				float phi = 2.0 * PI * Xi.y;\n				float t1 = r * cos(phi);\n				float t2 = r * sin(phi);\n				float s = 0.5 * (1.0 + V.z);\n				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;\n\n				// Section 4.3: Reprojection onto hemisphere\n				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;\n\n				// Section 3.4: Transform back to ellipsoid configuration\n				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));\n			}\n\n			void main() {\n				vec3 N = normalize(vOutputDirection);\n				vec3 V = N; // Assume view direction equals normal for pre-filtering\n\n				vec3 prefilteredColor = vec3(0.0);\n				float totalWeight = 0.0;\n\n				// For very low roughness, just sample the environment directly\n				if (roughness < 0.001) {\n					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);\n					return;\n				}\n\n				// Tangent space basis for VNDF sampling\n				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);\n				vec3 tangent = normalize(cross(up, N));\n				vec3 bitangent = cross(N, tangent);\n\n				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {\n					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));\n\n					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)\n					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);\n\n					// Transform H back to world space\n					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);\n					vec3 L = normalize(2.0 * dot(V, H) * H - V);\n\n					float NdotL = max(dot(N, L), 0.0);\n\n					if(NdotL > 0.0) {\n						// Sample environment at fixed mip level\n						// VNDF importance sampling handles the distribution filtering\n						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);\n\n						// Weight by NdotL for the split-sum approximation\n						// VNDF PDF naturally accounts for the visible microfacet distribution\n						prefilteredColor += sampleColor * NdotL;\n						totalWeight += NdotL;\n					}\n				}\n\n				if (totalWeight > 0.0) {\n					prefilteredColor = prefilteredColor / totalWeight;\n				}\n\n				gl_FragColor = vec4(prefilteredColor, 1.0);\n			}\n		',
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Us(e, t, n) {
  let r = new Float32Array(ks),
    i = new J(0, 1, 0);
  return new Ya({
    name: 'SphericalGaussianBlur',
    defines: {
      n: ks,
      CUBEUV_TEXEL_WIDTH: 1 / t,
      CUBEUV_TEXEL_HEIGHT: 1 / n,
      CUBEUV_MAX_MIP: `${e}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: r },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: i }
    },
    vertexShader: Ks(),
    fragmentShader:
      "\n\n			precision mediump float;\n			precision mediump int;\n\n			varying vec3 vOutputDirection;\n\n			uniform sampler2D envMap;\n			uniform int samples;\n			uniform float weights[ n ];\n			uniform bool latitudinal;\n			uniform float dTheta;\n			uniform float mipInt;\n			uniform vec3 poleAxis;\n\n			#define ENVMAP_TYPE_CUBE_UV\n			#include <cube_uv_reflection_fragment>\n\n			vec3 getSample( float theta, vec3 axis ) {\n\n				float cosTheta = cos( theta );\n				// Rodrigues' axis-angle rotation\n				vec3 sampleDirection = vOutputDirection * cosTheta\n					+ cross( axis, vOutputDirection ) * sin( theta )\n					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );\n\n				return bilinearCubeUV( envMap, sampleDirection, mipInt );\n\n			}\n\n			void main() {\n\n				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );\n\n				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {\n\n					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );\n\n				}\n\n				axis = normalize( axis );\n\n				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );\n\n				for ( int i = 1; i < n; i++ ) {\n\n					if ( i >= samples ) {\n\n						break;\n\n					}\n\n					float theta = dTheta * float( i );\n					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );\n					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );\n\n				}\n\n			}\n		",
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Ws() {
  return new Ya({
    name: 'EquirectangularToCubeUV',
    uniforms: { envMap: { value: null } },
    vertexShader: Ks(),
    fragmentShader:
      '\n\n			precision mediump float;\n			precision mediump int;\n\n			varying vec3 vOutputDirection;\n\n			uniform sampler2D envMap;\n\n			#include <common>\n\n			void main() {\n\n				vec3 outputDirection = normalize( vOutputDirection );\n				vec2 uv = equirectUv( outputDirection );\n\n				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );\n\n			}\n		',
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Gs() {
  return new Ya({
    name: 'CubemapToCubeUV',
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: Ks(),
    fragmentShader:
      '\n\n			precision mediump float;\n			precision mediump int;\n\n			uniform float flipEnvMap;\n\n			varying vec3 vOutputDirection;\n\n			uniform samplerCube envMap;\n\n			void main() {\n\n				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );\n\n			}\n		',
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Ks() {
  return '\n\n		precision mediump float;\n		precision mediump int;\n\n		attribute float faceIndex;\n\n		varying vec3 vOutputDirection;\n\n		// RH coordinate system; PMREM face-indexing convention\n		vec3 getDirection( vec2 uv, float face ) {\n\n			uv = 2.0 * uv - 1.0;\n\n			vec3 direction = vec3( uv, 1.0 );\n\n			if ( face == 0.0 ) {\n\n				direction = direction.zyx; // ( 1, v, u ) pos x\n\n			} else if ( face == 1.0 ) {\n\n				direction = direction.xzy;\n				direction.xz *= -1.0; // ( -u, 1, -v ) pos y\n\n			} else if ( face == 2.0 ) {\n\n				direction.x *= -1.0; // ( -u, v, 1 ) pos z\n\n			} else if ( face == 3.0 ) {\n\n				direction = direction.zyx;\n				direction.xz *= -1.0; // ( -1, v, -u ) neg x\n\n			} else if ( face == 4.0 ) {\n\n				direction = direction.xzy;\n				direction.xy *= -1.0; // ( -u, -1, v ) neg y\n\n			} else if ( face == 5.0 ) {\n\n				direction.z *= -1.0; // ( u, v, -1 ) neg z\n\n			}\n\n			return direction;\n\n		}\n\n		void main() {\n\n			vOutputDirection = getDirection( uv, faceIndex );\n			gl_Position = vec4( position, 1.0 );\n\n		}\n	';
}
var qs = class extends Gt {
  constructor(e = 1, t = {}) {
    (super(e, e, t), (this.isWebGLCubeRenderTarget = !0));
    let n = {
        width: e,
        height: e,
        depth: 1
      },
      r = [n, n, n, n, n, n];
    ((this.texture = new hi(r)),
      this._setTextureOptions(t),
      (this.texture.isRenderTargetTexture = !0));
  }
  fromEquirectangularTexture(e, t) {
    ((this.texture.type = t.type),
      (this.texture.colorSpace = t.colorSpace),
      (this.texture.generateMipmaps = t.generateMipmaps),
      (this.texture.minFilter = t.minFilter),
      (this.texture.magFilter = t.magFilter));
    let n = {
        uniforms: { tEquirect: { value: null } },
        vertexShader:
          '\n\n				varying vec3 vWorldDirection;\n\n				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\n					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n\n				}\n\n				void main() {\n\n					vWorldDirection = transformDirection( position, modelMatrix );\n\n					#include <begin_vertex>\n					#include <project_vertex>\n\n				}\n			',
        fragmentShader:
          '\n\n				uniform sampler2D tEquirect;\n\n				varying vec3 vWorldDirection;\n\n				#include <common>\n\n				void main() {\n\n					vec3 direction = normalize( vWorldDirection );\n\n					vec2 sampleUV = equirectUv( direction );\n\n					gl_FragColor = texture2D( tEquirect, sampleUV );\n\n				}\n			'
      },
      r = new bi(5, 5, 5),
      i = new Ya({
        name: 'CubemapFromEquirect',
        uniforms: Va(n.uniforms),
        vertexShader: n.vertexShader,
        fragmentShader: n.fragmentShader,
        side: 1,
        blending: 0
      });
    i.uniforms.tEquirect.value = t;
    let a = new Jr(r, i),
      o = t.minFilter;
    return (
      t.minFilter === 1008 && (t.minFilter = c),
      new Ko(1, 10, this).update(e, a),
      (t.minFilter = o),
      a.geometry.dispose(),
      a.material.dispose(),
      this
    );
  }
  clear(e, t = !0, n = !0, r = !0) {
    let i = e.getRenderTarget();
    for (let i = 0; i < 6; i++) (e.setRenderTarget(this, i), e.clear(t, n, r));
    e.setRenderTarget(i);
  }
};
function Js(e) {
  let t = /* @__PURE__ */ new WeakMap(),
    n = /* @__PURE__ */ new WeakMap(),
    r = null;
  function i(e, t = !1) {
    return e == null ? null : t ? o(e) : a(e);
  }
  function a(n) {
    if (n && n.isTexture) {
      let r = n.mapping;
      if (r === 303 || r === 304)
        if (t.has(n)) {
          let e = t.get(n).texture;
          return s(e, n.mapping);
        } else {
          let r = n.image;
          if (r && r.height > 0) {
            let i = new qs(r.height);
            return (
              i.fromEquirectangularTexture(e, n),
              t.set(n, i),
              n.addEventListener('dispose', l),
              s(i.texture, n.mapping)
            );
          } else return null;
        }
    }
    return n;
  }
  function o(t) {
    if (t && t.isTexture) {
      let i = t.mapping,
        a = i === 303 || i === 304,
        o = i === 301 || i === 302;
      if (a || o) {
        let i = n.get(t),
          s = i === void 0 ? 0 : i.texture.pmremVersion;
        if (t.isRenderTargetTexture && t.pmremVersion !== s)
          return (
            r === null && (r = new Rs(e)),
            (i = a ? r.fromEquirectangular(t, i) : r.fromCubemap(t, i)),
            (i.texture.pmremVersion = t.pmremVersion),
            n.set(t, i),
            i.texture
          );
        if (i !== void 0) return i.texture;
        {
          let s = t.image;
          return (a && s && s.height > 0) || (o && s && c(s))
            ? (r === null && (r = new Rs(e)),
              (i = a ? r.fromEquirectangular(t) : r.fromCubemap(t)),
              (i.texture.pmremVersion = t.pmremVersion),
              n.set(t, i),
              t.addEventListener('dispose', u),
              i.texture)
            : null;
        }
      }
    }
    return t;
  }
  function s(e, t) {
    return (t === 303 ? (e.mapping = 301) : t === 304 && (e.mapping = 302), e);
  }
  function c(e) {
    let t = 0;
    for (let n = 0; n < 6; n++) e[n] !== void 0 && t++;
    return t === 6;
  }
  function l(e) {
    let n = e.target;
    n.removeEventListener('dispose', l);
    let r = t.get(n);
    r !== void 0 && (t.delete(n), r.dispose());
  }
  function u(e) {
    let t = e.target;
    t.removeEventListener('dispose', u);
    let r = n.get(t);
    r !== void 0 && (n.delete(t), r.dispose());
  }
  function d() {
    ((t = /* @__PURE__ */ new WeakMap()),
      (n = /* @__PURE__ */ new WeakMap()),
      r !== null && (r.dispose(), (r = null)));
  }
  return {
    get: i,
    dispose: d
  };
}
function Ys(e) {
  let t = {};
  function n(n) {
    if (t[n] !== void 0) return t[n];
    let r = e.getExtension(n);
    return ((t[n] = r), r);
  }
  return {
    has: function (e) {
      return n(e) !== null;
    },
    init: function () {
      (n('EXT_color_buffer_float'),
        n('WEBGL_clip_cull_distance'),
        n('OES_texture_float_linear'),
        n('EXT_color_buffer_half_float'),
        n('WEBGL_multisampled_render_to_texture'),
        n('WEBGL_render_shared_exponent'));
    },
    get: function (e) {
      let t = n(e);
      return (t === null && Ye('WebGLRenderer: ' + e + ' extension not supported.'), t);
    }
  };
}
function Xs(e, t, n, r) {
  let i = {},
    a = /* @__PURE__ */ new WeakMap();
  function o(e) {
    let s = e.target;
    s.index !== null && t.remove(s.index);
    for (let e in s.attributes) t.remove(s.attributes[e]);
    (s.removeEventListener('dispose', o), delete i[s.id]);
    let c = a.get(s);
    (c && (t.remove(c), a.delete(s)),
      r.releaseStatesOfGeometry(s),
      s.isInstancedBufferGeometry === !0 && delete s._maxInstanceCount,
      n.memory.geometries--);
  }
  function s(e, t) {
    return i[t.id] === !0
      ? t
      : (t.addEventListener('dispose', o), (i[t.id] = !0), n.memory.geometries++, t);
  }
  function c(n) {
    let r = n.attributes;
    for (let n in r) t.update(r[n], e.ARRAY_BUFFER);
  }
  function l(e) {
    let n = [],
      r = e.index,
      i = e.attributes.position,
      o = 0;
    if (i === void 0) return;
    if (r !== null) {
      let e = r.array;
      o = r.version;
      for (let t = 0, r = e.length; t < r; t += 3) {
        let r = e[t + 0],
          i = e[t + 1],
          a = e[t + 2];
        n.push(r, i, i, a, a, r);
      }
    } else {
      let e = i.array;
      o = i.version;
      for (let t = 0, r = e.length / 3 - 1; t < r; t += 3) {
        let e = t + 0,
          r = t + 1,
          i = t + 2;
        n.push(e, r, r, i, i, e);
      }
    }
    let s = new (i.count >= 65535 ? fr : dr)(n, 1);
    s.version = o;
    let c = a.get(e);
    (c && t.remove(c), a.set(e, s));
  }
  function u(e) {
    let t = a.get(e);
    if (t) {
      let n = e.index;
      n !== null && t.version < n.version && l(e);
    } else l(e);
    return a.get(e);
  }
  return {
    get: s,
    update: c,
    getWireframeAttribute: u
  };
}
function Zs(e, t, n) {
  let r;
  function i(e) {
    r = e;
  }
  let a, o;
  function s(e) {
    ((a = e.type), (o = e.bytesPerElement));
  }
  function c(t, i) {
    (e.drawElements(r, i, a, t * o), n.update(i, r, 1));
  }
  function l(t, i, s) {
    s !== 0 && (e.drawElementsInstanced(r, i, a, t * o, s), n.update(i, r, s));
  }
  function u(e, i, o) {
    if (o === 0) return;
    t.get('WEBGL_multi_draw').multiDrawElementsWEBGL(r, i, 0, a, e, 0, o);
    let s = 0;
    for (let e = 0; e < o; e++) s += i[e];
    n.update(s, r, 1);
  }
  ((this.setMode = i),
    (this.setIndex = s),
    (this.render = c),
    (this.renderInstances = l),
    (this.renderMultiDraw = u));
}
function Qs(e) {
  let t = {
      geometries: 0,
      textures: 0
    },
    n = {
      frame: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
  function r(t, r, i) {
    switch ((n.calls++, r)) {
      case e.TRIANGLES:
        n.triangles += (t / 3) * i;
        break;
      case e.LINES:
        n.lines += (t / 2) * i;
        break;
      case e.LINE_STRIP:
        n.lines += i * (t - 1);
        break;
      case e.LINE_LOOP:
        n.lines += i * t;
        break;
      case e.POINTS:
        n.points += i * t;
        break;
      default:
        G('WebGLInfo: Unknown draw mode:', r);
        break;
    }
  }
  function i() {
    ((n.calls = 0), (n.triangles = 0), (n.points = 0), (n.lines = 0));
  }
  return {
    memory: t,
    render: n,
    programs: null,
    autoReset: !0,
    reset: i,
    update: r
  };
}
function $s(e, t, n) {
  let r = /* @__PURE__ */ new WeakMap(),
    i = new Ut();
  function a(a, o, s) {
    let c = a.morphTargetInfluences,
      l = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color,
      u = l === void 0 ? 0 : l.length,
      d = r.get(o);
    if (d === void 0 || d.count !== u) {
      d !== void 0 && d.texture.dispose();
      let e = o.morphAttributes.position !== void 0,
        n = o.morphAttributes.normal !== void 0,
        a = o.morphAttributes.color !== void 0,
        s = o.morphAttributes.position || [],
        c = o.morphAttributes.normal || [],
        l = o.morphAttributes.color || [],
        f = 0;
      (e === !0 && (f = 1), n === !0 && (f = 2), a === !0 && (f = 3));
      let p = o.attributes.position.count * f,
        m = 1;
      p > t.maxTextureSize && ((m = Math.ceil(p / t.maxTextureSize)), (p = t.maxTextureSize));
      let h = new Float32Array(p * m * 4 * u),
        g = new Kt(h, p, m, u);
      ((g.type = _), (g.needsUpdate = !0));
      let v = f * 4;
      for (let t = 0; t < u; t++) {
        let r = s[t],
          o = c[t],
          u = l[t],
          d = p * m * 4 * t;
        for (let t = 0; t < r.count; t++) {
          let s = t * v;
          (e === !0 &&
            (i.fromBufferAttribute(r, t),
            (h[d + s + 0] = i.x),
            (h[d + s + 1] = i.y),
            (h[d + s + 2] = i.z),
            (h[d + s + 3] = 0)),
            n === !0 &&
              (i.fromBufferAttribute(o, t),
              (h[d + s + 4] = i.x),
              (h[d + s + 5] = i.y),
              (h[d + s + 6] = i.z),
              (h[d + s + 7] = 0)),
            a === !0 &&
              (i.fromBufferAttribute(u, t),
              (h[d + s + 8] = i.x),
              (h[d + s + 9] = i.y),
              (h[d + s + 10] = i.z),
              (h[d + s + 11] = u.itemSize === 4 ? i.w : 1)));
        }
      }
      ((d = {
        count: u,
        texture: g,
        size: new q(p, m)
      }),
        r.set(o, d));
      function y() {
        (g.dispose(), r.delete(o), o.removeEventListener('dispose', y));
      }
      o.addEventListener('dispose', y);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      s.getUniforms().setValue(e, 'morphTexture', a.morphTexture, n);
    else {
      let t = 0;
      for (let e = 0; e < c.length; e++) t += c[e];
      let n = o.morphTargetsRelative ? 1 : 1 - t;
      (s.getUniforms().setValue(e, 'morphTargetBaseInfluence', n),
        s.getUniforms().setValue(e, 'morphTargetInfluences', c));
    }
    (s.getUniforms().setValue(e, 'morphTargetsTexture', d.texture, n),
      s.getUniforms().setValue(e, 'morphTargetsTextureSize', d.size));
  }
  return { update: a };
}
function ec(e, t, n, r, i) {
  let a = /* @__PURE__ */ new WeakMap();
  function o(r) {
    let o = i.render.frame,
      s = r.geometry,
      l = t.get(r, s);
    if (
      (a.get(l) !== o && (t.update(l), a.set(l, o)),
      r.isInstancedMesh &&
        (r.hasEventListener('dispose', c) === !1 && r.addEventListener('dispose', c),
        a.get(r) !== o &&
          (n.update(r.instanceMatrix, e.ARRAY_BUFFER),
          r.instanceColor !== null && n.update(r.instanceColor, e.ARRAY_BUFFER),
          a.set(r, o))),
      r.isSkinnedMesh)
    ) {
      let e = r.skeleton;
      a.get(e) !== o && (e.update(), a.set(e, o));
    }
    return l;
  }
  function s() {
    a = /* @__PURE__ */ new WeakMap();
  }
  function c(e) {
    let t = e.target;
    (t.removeEventListener('dispose', c),
      r.releaseStatesOfObject(t),
      n.remove(t.instanceMatrix),
      t.instanceColor !== null && n.remove(t.instanceColor));
  }
  return {
    update: o,
    dispose: s
  };
}
var tc = {
  1: 'LINEAR_TONE_MAPPING',
  2: 'REINHARD_TONE_MAPPING',
  3: 'CINEON_TONE_MAPPING',
  4: 'ACES_FILMIC_TONE_MAPPING',
  6: 'AGX_TONE_MAPPING',
  7: 'NEUTRAL_TONE_MAPPING',
  5: 'CUSTOM_TONE_MAPPING'
};
function nc(e, t, n, r, i) {
  let a = new Gt(t, n, {
      type: e,
      depthBuffer: r,
      stencilBuffer: i,
      depthTexture: r ? new _i(t, n) : void 0
    }),
    o = new Gt(t, n, {
      type: v,
      depthBuffer: !1,
      stencilBuffer: !1
    }),
    s = new Tr();
  (s.setAttribute('position', new pr([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)),
    s.setAttribute('uv', new pr([0, 2, 0, 0, 2, 0], 2)));
  let c = new Xa({
      uniforms: { tDiffuse: { value: null } },
      vertexShader:
        '\n			precision highp float;\n\n			uniform mat4 modelViewMatrix;\n			uniform mat4 projectionMatrix;\n\n			attribute vec3 position;\n			attribute vec2 uv;\n\n			varying vec2 vUv;\n\n			void main() {\n				vUv = uv;\n				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n			}',
      fragmentShader:
        '\n			precision highp float;\n\n			uniform sampler2D tDiffuse;\n\n			varying vec2 vUv;\n\n			#include <tonemapping_pars_fragment>\n			#include <colorspace_pars_fragment>\n\n			void main() {\n				gl_FragColor = texture2D( tDiffuse, vUv );\n\n				#ifdef LINEAR_TONE_MAPPING\n					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );\n				#elif defined( REINHARD_TONE_MAPPING )\n					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );\n				#elif defined( CINEON_TONE_MAPPING )\n					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );\n				#elif defined( ACES_FILMIC_TONE_MAPPING )\n					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );\n				#elif defined( AGX_TONE_MAPPING )\n					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );\n				#elif defined( NEUTRAL_TONE_MAPPING )\n					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );\n				#elif defined( CUSTOM_TONE_MAPPING )\n					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );\n				#endif\n\n				#ifdef SRGB_TRANSFER\n					gl_FragColor = sRGBTransferOETF( gl_FragColor );\n				#endif\n			}',
      depthTest: !1,
      depthWrite: !1
    }),
    l = new Jr(s, c),
    u = new Bo(-1, 1, 1, -1, 0, 1),
    d = null,
    f = null,
    p = !1,
    m,
    h = null,
    g = [],
    _ = !1;
  ((this.setSize = function (e, t) {
    (a.setSize(e, t), o.setSize(e, t));
    for (let n = 0; n < g.length; n++) {
      let r = g[n];
      r.setSize && r.setSize(e, t);
    }
  }),
    (this.setEffects = function (e) {
      ((g = e), (_ = g.length > 0 && g[0].isRenderPass === !0));
      let t = a.width,
        n = a.height;
      for (let e = 0; e < g.length; e++) {
        let r = g[e];
        r.setSize && r.setSize(t, n);
      }
    }),
    (this.begin = function (e, t) {
      if (p || (e.toneMapping === 0 && g.length === 0)) return !1;
      if (((h = t), t !== null)) {
        let e = t.width,
          n = t.height;
        (a.width !== e || a.height !== n) && this.setSize(e, n);
      }
      return (_ === !1 && e.setRenderTarget(a), (m = e.toneMapping), (e.toneMapping = 0), !0);
    }),
    (this.hasRenderPass = function () {
      return _;
    }),
    (this.end = function (e, t) {
      ((e.toneMapping = m), (p = !0));
      let n = a,
        r = o;
      for (let i = 0; i < g.length; i++) {
        let a = g[i];
        if (a.enabled !== !1 && (a.render(e, r, n, t), a.needsSwap !== !1)) {
          let e = n;
          ((n = r), (r = e));
        }
      }
      if (d !== e.outputColorSpace || f !== e.toneMapping) {
        ((d = e.outputColorSpace),
          (f = e.toneMapping),
          (c.defines = {}),
          Mt.getTransfer(d) === 'srgb' && (c.defines.SRGB_TRANSFER = ''));
        let t = tc[f];
        (t && (c.defines[t] = ''), (c.needsUpdate = !0));
      }
      ((c.uniforms.tDiffuse.value = n.texture),
        e.setRenderTarget(h),
        e.render(l, u),
        (h = null),
        (p = !1));
    }),
    (this.isCompositing = function () {
      return p;
    }),
    (this.dispose = function () {
      (a.depthTexture && a.depthTexture.dispose(),
        a.dispose(),
        o.dispose(),
        s.dispose(),
        c.dispose());
    }));
}
var rc = /*@__PURE__*/ new Ht(),
  ic = /*@__PURE__*/ new _i(1, 1),
  ac = /*@__PURE__*/ new Kt(),
  oc = /*@__PURE__*/ new qt(),
  sc = /*@__PURE__*/ new hi(),
  cc = [],
  lc = [],
  uc = new Float32Array(16),
  dc = new Float32Array(9),
  fc = new Float32Array(4);
function pc(e, t, n) {
  let r = e[0];
  if (r <= 0 || r > 0) return e;
  let i = t * n,
    a = cc[i];
  if ((a === void 0 && ((a = new Float32Array(i)), (cc[i] = a)), t !== 0)) {
    r.toArray(a, 0);
    for (let r = 1, i = 0; r !== t; ++r) ((i += n), e[r].toArray(a, i));
  }
  return a;
}
function mc(e, t) {
  if (e.length !== t.length) return !1;
  for (let n = 0, r = e.length; n < r; n++) if (e[n] !== t[n]) return !1;
  return !0;
}
function hc(e, t) {
  for (let n = 0, r = t.length; n < r; n++) e[n] = t[n];
}
function gc(e, t) {
  let n = lc[t];
  n === void 0 && ((n = new Int32Array(t)), (lc[t] = n));
  for (let r = 0; r !== t; ++r) n[r] = e.allocateTextureUnit();
  return n;
}
function _c(e, t) {
  let n = this.cache;
  n[0] !== t && (e.uniform1f(this.addr, t), (n[0] = t));
}
function vc(e, t) {
  let n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y) &&
      (e.uniform2f(this.addr, t.x, t.y), (n[0] = t.x), (n[1] = t.y));
  else {
    if (mc(n, t)) return;
    (e.uniform2fv(this.addr, t), hc(n, t));
  }
}
function yc(e, t) {
  let n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) &&
      (e.uniform3f(this.addr, t.x, t.y, t.z), (n[0] = t.x), (n[1] = t.y), (n[2] = t.z));
  else if (t.r !== void 0)
    (n[0] !== t.r || n[1] !== t.g || n[2] !== t.b) &&
      (e.uniform3f(this.addr, t.r, t.g, t.b), (n[0] = t.r), (n[1] = t.g), (n[2] = t.b));
  else {
    if (mc(n, t)) return;
    (e.uniform3fv(this.addr, t), hc(n, t));
  }
}
function bc(e, t) {
  let n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) &&
      (e.uniform4f(this.addr, t.x, t.y, t.z, t.w),
      (n[0] = t.x),
      (n[1] = t.y),
      (n[2] = t.z),
      (n[3] = t.w));
  else {
    if (mc(n, t)) return;
    (e.uniform4fv(this.addr, t), hc(n, t));
  }
}
function xc(e, t) {
  let n = this.cache,
    r = t.elements;
  if (r === void 0) {
    if (mc(n, t)) return;
    (e.uniformMatrix2fv(this.addr, !1, t), hc(n, t));
  } else {
    if (mc(n, r)) return;
    (fc.set(r), e.uniformMatrix2fv(this.addr, !1, fc), hc(n, r));
  }
}
function Sc(e, t) {
  let n = this.cache,
    r = t.elements;
  if (r === void 0) {
    if (mc(n, t)) return;
    (e.uniformMatrix3fv(this.addr, !1, t), hc(n, t));
  } else {
    if (mc(n, r)) return;
    (dc.set(r), e.uniformMatrix3fv(this.addr, !1, dc), hc(n, r));
  }
}
function Cc(e, t) {
  let n = this.cache,
    r = t.elements;
  if (r === void 0) {
    if (mc(n, t)) return;
    (e.uniformMatrix4fv(this.addr, !1, t), hc(n, t));
  } else {
    if (mc(n, r)) return;
    (uc.set(r), e.uniformMatrix4fv(this.addr, !1, uc), hc(n, r));
  }
}
function wc(e, t) {
  let n = this.cache;
  n[0] !== t && (e.uniform1i(this.addr, t), (n[0] = t));
}
function Tc(e, t) {
  let n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y) &&
      (e.uniform2i(this.addr, t.x, t.y), (n[0] = t.x), (n[1] = t.y));
  else {
    if (mc(n, t)) return;
    (e.uniform2iv(this.addr, t), hc(n, t));
  }
}
function Ec(e, t) {
  let n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) &&
      (e.uniform3i(this.addr, t.x, t.y, t.z), (n[0] = t.x), (n[1] = t.y), (n[2] = t.z));
  else {
    if (mc(n, t)) return;
    (e.uniform3iv(this.addr, t), hc(n, t));
  }
}
function Dc(e, t) {
  let n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) &&
      (e.uniform4i(this.addr, t.x, t.y, t.z, t.w),
      (n[0] = t.x),
      (n[1] = t.y),
      (n[2] = t.z),
      (n[3] = t.w));
  else {
    if (mc(n, t)) return;
    (e.uniform4iv(this.addr, t), hc(n, t));
  }
}
function Oc(e, t) {
  let n = this.cache;
  n[0] !== t && (e.uniform1ui(this.addr, t), (n[0] = t));
}
function kc(e, t) {
  let n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y) &&
      (e.uniform2ui(this.addr, t.x, t.y), (n[0] = t.x), (n[1] = t.y));
  else {
    if (mc(n, t)) return;
    (e.uniform2uiv(this.addr, t), hc(n, t));
  }
}
function Ac(e, t) {
  let n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) &&
      (e.uniform3ui(this.addr, t.x, t.y, t.z), (n[0] = t.x), (n[1] = t.y), (n[2] = t.z));
  else {
    if (mc(n, t)) return;
    (e.uniform3uiv(this.addr, t), hc(n, t));
  }
}
function jc(e, t) {
  let n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) &&
      (e.uniform4ui(this.addr, t.x, t.y, t.z, t.w),
      (n[0] = t.x),
      (n[1] = t.y),
      (n[2] = t.z),
      (n[3] = t.w));
  else {
    if (mc(n, t)) return;
    (e.uniform4uiv(this.addr, t), hc(n, t));
  }
}
function Mc(e, t, n) {
  let r = this.cache,
    i = n.allocateTextureUnit();
  r[0] !== i && (e.uniform1i(this.addr, i), (r[0] = i));
  let a;
  (this.type === e.SAMPLER_2D_SHADOW
    ? ((ic.compareFunction = n.isReversedDepthBuffer() ? 518 : 515), (a = ic))
    : (a = rc),
    n.setTexture2D(t || a, i));
}
function Nc(e, t, n) {
  let r = this.cache,
    i = n.allocateTextureUnit();
  (r[0] !== i && (e.uniform1i(this.addr, i), (r[0] = i)), n.setTexture3D(t || oc, i));
}
function Pc(e, t, n) {
  let r = this.cache,
    i = n.allocateTextureUnit();
  (r[0] !== i && (e.uniform1i(this.addr, i), (r[0] = i)), n.setTextureCube(t || sc, i));
}
function Fc(e, t, n) {
  let r = this.cache,
    i = n.allocateTextureUnit();
  (r[0] !== i && (e.uniform1i(this.addr, i), (r[0] = i)), n.setTexture2DArray(t || ac, i));
}
function Ic(e) {
  switch (e) {
    case 5126:
      return _c;
    case 35664:
      return vc;
    case 35665:
      return yc;
    case 35666:
      return bc;
    case 35674:
      return xc;
    case 35675:
      return Sc;
    case 35676:
      return Cc;
    case 5124:
    case 35670:
      return wc;
    case 35667:
    case 35671:
      return Tc;
    case 35668:
    case 35672:
      return Ec;
    case 35669:
    case 35673:
      return Dc;
    case 5125:
      return Oc;
    case 36294:
      return kc;
    case 36295:
      return Ac;
    case 36296:
      return jc;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Mc;
    case 35679:
    case 36299:
    case 36307:
      return Nc;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Pc;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Fc;
  }
}
function Lc(e, t) {
  e.uniform1fv(this.addr, t);
}
function Rc(e, t) {
  let n = pc(t, this.size, 2);
  e.uniform2fv(this.addr, n);
}
function zc(e, t) {
  let n = pc(t, this.size, 3);
  e.uniform3fv(this.addr, n);
}
function Bc(e, t) {
  let n = pc(t, this.size, 4);
  e.uniform4fv(this.addr, n);
}
function Vc(e, t) {
  let n = pc(t, this.size, 4);
  e.uniformMatrix2fv(this.addr, !1, n);
}
function Hc(e, t) {
  let n = pc(t, this.size, 9);
  e.uniformMatrix3fv(this.addr, !1, n);
}
function Uc(e, t) {
  let n = pc(t, this.size, 16);
  e.uniformMatrix4fv(this.addr, !1, n);
}
function Wc(e, t) {
  e.uniform1iv(this.addr, t);
}
function Gc(e, t) {
  e.uniform2iv(this.addr, t);
}
function Kc(e, t) {
  e.uniform3iv(this.addr, t);
}
function qc(e, t) {
  e.uniform4iv(this.addr, t);
}
function Jc(e, t) {
  e.uniform1uiv(this.addr, t);
}
function Yc(e, t) {
  e.uniform2uiv(this.addr, t);
}
function Xc(e, t) {
  e.uniform3uiv(this.addr, t);
}
function Zc(e, t) {
  e.uniform4uiv(this.addr, t);
}
function Qc(e, t, n) {
  let r = this.cache,
    i = t.length,
    a = gc(n, i);
  mc(r, a) || (e.uniform1iv(this.addr, a), hc(r, a));
  let o;
  o = this.type === e.SAMPLER_2D_SHADOW ? ic : rc;
  for (let e = 0; e !== i; ++e) n.setTexture2D(t[e] || o, a[e]);
}
function $c(e, t, n) {
  let r = this.cache,
    i = t.length,
    a = gc(n, i);
  mc(r, a) || (e.uniform1iv(this.addr, a), hc(r, a));
  for (let e = 0; e !== i; ++e) n.setTexture3D(t[e] || oc, a[e]);
}
function el(e, t, n) {
  let r = this.cache,
    i = t.length,
    a = gc(n, i);
  mc(r, a) || (e.uniform1iv(this.addr, a), hc(r, a));
  for (let e = 0; e !== i; ++e) n.setTextureCube(t[e] || sc, a[e]);
}
function tl(e, t, n) {
  let r = this.cache,
    i = t.length,
    a = gc(n, i);
  mc(r, a) || (e.uniform1iv(this.addr, a), hc(r, a));
  for (let e = 0; e !== i; ++e) n.setTexture2DArray(t[e] || ac, a[e]);
}
function nl(e) {
  switch (e) {
    case 5126:
      return Lc;
    case 35664:
      return Rc;
    case 35665:
      return zc;
    case 35666:
      return Bc;
    case 35674:
      return Vc;
    case 35675:
      return Hc;
    case 35676:
      return Uc;
    case 5124:
    case 35670:
      return Wc;
    case 35667:
    case 35671:
      return Gc;
    case 35668:
    case 35672:
      return Kc;
    case 35669:
    case 35673:
      return qc;
    case 5125:
      return Jc;
    case 36294:
      return Yc;
    case 36295:
      return Xc;
    case 36296:
      return Zc;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Qc;
    case 35679:
    case 36299:
    case 36307:
      return $c;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return el;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return tl;
  }
}
var rl = class {
    constructor(e, t, n) {
      ((this.id = e),
        (this.addr = n),
        (this.cache = []),
        (this.type = t.type),
        (this.setValue = Ic(t.type)));
    }
  },
  il = class {
    constructor(e, t, n) {
      ((this.id = e),
        (this.addr = n),
        (this.cache = []),
        (this.type = t.type),
        (this.size = t.size),
        (this.setValue = nl(t.type)));
    }
  },
  al = class {
    constructor(e) {
      ((this.id = e), (this.seq = []), (this.map = {}));
    }
    setValue(e, t, n) {
      let r = this.seq;
      for (let i = 0, a = r.length; i !== a; ++i) {
        let a = r[i];
        a.setValue(e, t[a.id], n);
      }
    }
  },
  ol = /(\w+)(\])?(\[|\.)?/g;
function sl(e, t) {
  (e.seq.push(t), (e.map[t.id] = t));
}
function cl(e, t, n) {
  let r = e.name,
    i = r.length;
  for (ol.lastIndex = 0; ; ) {
    let a = ol.exec(r),
      o = ol.lastIndex,
      s = a[1],
      c = a[2] === ']',
      l = a[3];
    if ((c && (s |= 0), l === void 0 || (l === '[' && o + 2 === i))) {
      sl(n, l === void 0 ? new rl(s, e, t) : new il(s, e, t));
      break;
    } else {
      let e = n.map[s];
      (e === void 0 && ((e = new al(s)), sl(n, e)), (n = e));
    }
  }
}
var ll = class {
  constructor(e, t) {
    ((this.seq = []), (this.map = {}));
    let n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let r = 0; r < n; ++r) {
      let n = e.getActiveUniform(t, r);
      cl(n, e.getUniformLocation(t, n.name), this);
    }
    let r = [],
      i = [];
    for (let t of this.seq)
      t.type === e.SAMPLER_2D_SHADOW ||
      t.type === e.SAMPLER_CUBE_SHADOW ||
      t.type === e.SAMPLER_2D_ARRAY_SHADOW
        ? r.push(t)
        : i.push(t);
    r.length > 0 && (this.seq = r.concat(i));
  }
  setValue(e, t, n, r) {
    let i = this.map[t];
    i !== void 0 && i.setValue(e, n, r);
  }
  setOptional(e, t, n) {
    let r = t[n];
    r !== void 0 && this.setValue(e, n, r);
  }
  static upload(e, t, n, r) {
    for (let i = 0, a = t.length; i !== a; ++i) {
      let a = t[i],
        o = n[a.id];
      o.needsUpdate !== !1 && a.setValue(e, o.value, r);
    }
  }
  static seqWithValue(e, t) {
    let n = [];
    for (let r = 0, i = e.length; r !== i; ++r) {
      let i = e[r];
      i.id in t && n.push(i);
    }
    return n;
  }
};
function ul(e, t, n) {
  let r = e.createShader(t);
  return (e.shaderSource(r, n), e.compileShader(r), r);
}
var dl = 37297,
  fl = 0;
function pl(e, t) {
  let n = e.split('\n'),
    r = [],
    i = Math.max(t - 6, 0),
    a = Math.min(t + 6, n.length);
  for (let e = i; e < a; e++) {
    let i = e + 1;
    r.push(`${i === t ? '>' : ' '} ${i}: ${n[e]}`);
  }
  return r.join('\n');
}
var ml = /*@__PURE__*/ new Y();
function hl(e) {
  Mt._getMatrix(ml, Mt.workingColorSpace, e);
  let t = `mat3( ${ml.elements.map((e) => e.toFixed(4))} )`;
  switch (Mt.getTransfer(e)) {
    case Ie:
      return [t, 'LinearTransferOETF'];
    case Le:
      return [t, 'sRGBTransferOETF'];
    default:
      return (W('WebGLProgram: Unsupported color space: ', e), [t, 'LinearTransferOETF']);
  }
}
function gl(e, t, n) {
  let r = e.getShaderParameter(t, e.COMPILE_STATUS),
    i = (e.getShaderInfoLog(t) || '').trim();
  if (r && i === '') return '';
  let a = /ERROR: 0:(\d+)/.exec(i);
  if (a) {
    let r = parseInt(a[1]);
    return n.toUpperCase() + '\n\n' + i + '\n\n' + pl(e.getShaderSource(t), r);
  } else return i;
}
function _l(e, t) {
  let n = hl(t);
  return [
    `vec4 ${e}( vec4 value ) {`,
    `	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,
    '}'
  ].join('\n');
}
var vl = {
  1: 'Linear',
  2: 'Reinhard',
  3: 'Cineon',
  4: 'ACESFilmic',
  6: 'AgX',
  7: 'Neutral',
  5: 'Custom'
};
function yl(e, t) {
  let n = vl[t];
  return n === void 0
    ? (W('WebGLProgram: Unsupported toneMapping:', t),
      'vec3 ' + e + '( vec3 color ) { return LinearToneMapping( color ); }')
    : 'vec3 ' + e + '( vec3 color ) { return ' + n + 'ToneMapping( color ); }';
}
var bl = /*@__PURE__*/ new J();
function xl() {
  return (
    Mt.getLuminanceCoefficients(bl),
    [
      'float luminance( const in vec3 rgb ) {',
      `	const vec3 weights = vec3( ${bl.x.toFixed(4)}, ${bl.y.toFixed(4)}, ${bl.z.toFixed(4)} );`,
      '	return dot( weights, rgb );',
      '}'
    ].join('\n')
  );
}
function Sl(e) {
  return [
    e.extensionClipCullDistance ? '#extension GL_ANGLE_clip_cull_distance : require' : '',
    e.extensionMultiDraw ? '#extension GL_ANGLE_multi_draw : require' : ''
  ]
    .filter(Tl)
    .join('\n');
}
function Cl(e) {
  let t = [];
  for (let n in e) {
    let r = e[n];
    r !== !1 && t.push('#define ' + n + ' ' + r);
  }
  return t.join('\n');
}
function wl(e, t) {
  let n = {},
    r = e.getProgramParameter(t, e.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < r; i++) {
    let r = e.getActiveAttrib(t, i),
      a = r.name,
      o = 1;
    (r.type === e.FLOAT_MAT2 && (o = 2),
      r.type === e.FLOAT_MAT3 && (o = 3),
      r.type === e.FLOAT_MAT4 && (o = 4),
      (n[a] = {
        type: r.type,
        location: e.getAttribLocation(t, a),
        locationSize: o
      }));
  }
  return n;
}
function Tl(e) {
  return e !== '';
}
function El(e, t) {
  let n = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return e
    .replace(/NUM_DIR_LIGHTS/g, t.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights)
    .replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps)
    .replace(/NUM_SPOT_LIGHT_COORDS/g, n)
    .replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights)
    .replace(/NUM_POINT_LIGHTS/g, t.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights)
    .replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows)
    .replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps)
    .replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows)
    .replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function Dl(e, t) {
  return e
    .replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes)
    .replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
var Ol = /^[ \t]*#include +<([\w\d./]+)>/gm;
function kl(e) {
  return e.replace(Ol, jl);
}
var Al = /* @__PURE__ */ new Map();
function jl(e, t) {
  let n = Z[t];
  if (n === void 0) {
    let e = Al.get(t);
    if (e !== void 0)
      ((n = Z[e]),
        W('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, e));
    else throw Error('Can not resolve #include <' + t + '>');
  }
  return kl(n);
}
var Ml =
  /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Nl(e) {
  return e.replace(Ml, Pl);
}
function Pl(e, t, n, r) {
  let i = '';
  for (let e = parseInt(t); e < parseInt(n); e++)
    i += r.replace(/\[\s*i\s*\]/g, '[ ' + e + ' ]').replace(/UNROLLED_LOOP_INDEX/g, e);
  return i;
}
function Fl(e) {
  let t = `precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;
  return (
    e.precision === 'highp'
      ? (t += '\n#define HIGH_PRECISION')
      : e.precision === 'mediump'
        ? (t += '\n#define MEDIUM_PRECISION')
        : e.precision === 'lowp' && (t += '\n#define LOW_PRECISION'),
    t
  );
}
var Il = {
  1: 'SHADOWMAP_TYPE_PCF',
  3: 'SHADOWMAP_TYPE_VSM'
};
function Ll(e) {
  return Il[e.shadowMapType] || 'SHADOWMAP_TYPE_BASIC';
}
var Rl = {
  301: 'ENVMAP_TYPE_CUBE',
  302: 'ENVMAP_TYPE_CUBE',
  306: 'ENVMAP_TYPE_CUBE_UV'
};
function zl(e) {
  return e.envMap === !1 ? 'ENVMAP_TYPE_CUBE' : Rl[e.envMapMode] || 'ENVMAP_TYPE_CUBE';
}
var Bl = { 302: 'ENVMAP_MODE_REFRACTION' };
function Vl(e) {
  return e.envMap === !1 ? 'ENVMAP_MODE_REFLECTION' : Bl[e.envMapMode] || 'ENVMAP_MODE_REFLECTION';
}
var Hl = {
  0: 'ENVMAP_BLENDING_MULTIPLY',
  1: 'ENVMAP_BLENDING_MIX',
  2: 'ENVMAP_BLENDING_ADD'
};
function Ul(e) {
  return e.envMap === !1 ? 'ENVMAP_BLENDING_NONE' : Hl[e.combine] || 'ENVMAP_BLENDING_NONE';
}
function Wl(e) {
  let t = e.envMapCubeUVHeight;
  if (t === null) return null;
  let n = Math.log2(t) - 2,
    r = 1 / t;
  return {
    texelWidth: 1 / (3 * Math.max(2 ** n, 112)),
    texelHeight: r,
    maxMip: n
  };
}
function Gl(e, t, n, r) {
  let i = e.getContext(),
    a = n.defines,
    o = n.vertexShader,
    s = n.fragmentShader,
    c = Ll(n),
    l = zl(n),
    u = Vl(n),
    d = Ul(n),
    f = Wl(n),
    p = Sl(n),
    m = Cl(a),
    h = i.createProgram(),
    g,
    _,
    v = n.glslVersion ? '#version ' + n.glslVersion + '\n' : '';
  (n.isRawShaderMaterial
    ? ((g = ['#define SHADER_TYPE ' + n.shaderType, '#define SHADER_NAME ' + n.shaderName, m]
        .filter(Tl)
        .join('\n')),
      g.length > 0 && (g += '\n'),
      (_ = ['#define SHADER_TYPE ' + n.shaderType, '#define SHADER_NAME ' + n.shaderName, m]
        .filter(Tl)
        .join('\n')),
      _.length > 0 && (_ += '\n'))
    : ((g = [
        Fl(n),
        '#define SHADER_TYPE ' + n.shaderType,
        '#define SHADER_NAME ' + n.shaderName,
        m,
        n.extensionClipCullDistance ? '#define USE_CLIP_DISTANCE' : '',
        n.batching ? '#define USE_BATCHING' : '',
        n.batchingColor ? '#define USE_BATCHING_COLOR' : '',
        n.instancing ? '#define USE_INSTANCING' : '',
        n.instancingColor ? '#define USE_INSTANCING_COLOR' : '',
        n.instancingMorph ? '#define USE_INSTANCING_MORPH' : '',
        n.useFog && n.fog ? '#define USE_FOG' : '',
        n.useFog && n.fogExp2 ? '#define FOG_EXP2' : '',
        n.map ? '#define USE_MAP' : '',
        n.envMap ? '#define USE_ENVMAP' : '',
        n.envMap ? '#define ' + u : '',
        n.lightMap ? '#define USE_LIGHTMAP' : '',
        n.aoMap ? '#define USE_AOMAP' : '',
        n.bumpMap ? '#define USE_BUMPMAP' : '',
        n.normalMap ? '#define USE_NORMALMAP' : '',
        n.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
        n.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
        n.displacementMap ? '#define USE_DISPLACEMENTMAP' : '',
        n.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
        n.anisotropy ? '#define USE_ANISOTROPY' : '',
        n.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',
        n.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
        n.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
        n.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',
        n.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
        n.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',
        n.specularMap ? '#define USE_SPECULARMAP' : '',
        n.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
        n.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',
        n.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        n.metalnessMap ? '#define USE_METALNESSMAP' : '',
        n.alphaMap ? '#define USE_ALPHAMAP' : '',
        n.alphaHash ? '#define USE_ALPHAHASH' : '',
        n.transmission ? '#define USE_TRANSMISSION' : '',
        n.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
        n.thicknessMap ? '#define USE_THICKNESSMAP' : '',
        n.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
        n.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',
        n.mapUv ? '#define MAP_UV ' + n.mapUv : '',
        n.alphaMapUv ? '#define ALPHAMAP_UV ' + n.alphaMapUv : '',
        n.lightMapUv ? '#define LIGHTMAP_UV ' + n.lightMapUv : '',
        n.aoMapUv ? '#define AOMAP_UV ' + n.aoMapUv : '',
        n.emissiveMapUv ? '#define EMISSIVEMAP_UV ' + n.emissiveMapUv : '',
        n.bumpMapUv ? '#define BUMPMAP_UV ' + n.bumpMapUv : '',
        n.normalMapUv ? '#define NORMALMAP_UV ' + n.normalMapUv : '',
        n.displacementMapUv ? '#define DISPLACEMENTMAP_UV ' + n.displacementMapUv : '',
        n.metalnessMapUv ? '#define METALNESSMAP_UV ' + n.metalnessMapUv : '',
        n.roughnessMapUv ? '#define ROUGHNESSMAP_UV ' + n.roughnessMapUv : '',
        n.anisotropyMapUv ? '#define ANISOTROPYMAP_UV ' + n.anisotropyMapUv : '',
        n.clearcoatMapUv ? '#define CLEARCOATMAP_UV ' + n.clearcoatMapUv : '',
        n.clearcoatNormalMapUv ? '#define CLEARCOAT_NORMALMAP_UV ' + n.clearcoatNormalMapUv : '',
        n.clearcoatRoughnessMapUv
          ? '#define CLEARCOAT_ROUGHNESSMAP_UV ' + n.clearcoatRoughnessMapUv
          : '',
        n.iridescenceMapUv ? '#define IRIDESCENCEMAP_UV ' + n.iridescenceMapUv : '',
        n.iridescenceThicknessMapUv
          ? '#define IRIDESCENCE_THICKNESSMAP_UV ' + n.iridescenceThicknessMapUv
          : '',
        n.sheenColorMapUv ? '#define SHEEN_COLORMAP_UV ' + n.sheenColorMapUv : '',
        n.sheenRoughnessMapUv ? '#define SHEEN_ROUGHNESSMAP_UV ' + n.sheenRoughnessMapUv : '',
        n.specularMapUv ? '#define SPECULARMAP_UV ' + n.specularMapUv : '',
        n.specularColorMapUv ? '#define SPECULAR_COLORMAP_UV ' + n.specularColorMapUv : '',
        n.specularIntensityMapUv
          ? '#define SPECULAR_INTENSITYMAP_UV ' + n.specularIntensityMapUv
          : '',
        n.transmissionMapUv ? '#define TRANSMISSIONMAP_UV ' + n.transmissionMapUv : '',
        n.thicknessMapUv ? '#define THICKNESSMAP_UV ' + n.thicknessMapUv : '',
        n.vertexTangents && n.flatShading === !1 ? '#define USE_TANGENT' : '',
        n.vertexNormals ? '#define HAS_NORMAL' : '',
        n.vertexColors ? '#define USE_COLOR' : '',
        n.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
        n.vertexUv1s ? '#define USE_UV1' : '',
        n.vertexUv2s ? '#define USE_UV2' : '',
        n.vertexUv3s ? '#define USE_UV3' : '',
        n.pointsUvs ? '#define USE_POINTS_UV' : '',
        n.flatShading ? '#define FLAT_SHADED' : '',
        n.skinning ? '#define USE_SKINNING' : '',
        n.morphTargets ? '#define USE_MORPHTARGETS' : '',
        n.morphNormals && n.flatShading === !1 ? '#define USE_MORPHNORMALS' : '',
        n.morphColors ? '#define USE_MORPHCOLORS' : '',
        n.morphTargetsCount > 0
          ? '#define MORPHTARGETS_TEXTURE_STRIDE ' + n.morphTextureStride
          : '',
        n.morphTargetsCount > 0 ? '#define MORPHTARGETS_COUNT ' + n.morphTargetsCount : '',
        n.doubleSided ? '#define DOUBLE_SIDED' : '',
        n.flipSided ? '#define FLIP_SIDED' : '',
        n.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        n.shadowMapEnabled ? '#define ' + c : '',
        n.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',
        n.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',
        n.logarithmicDepthBuffer ? '#define USE_LOGARITHMIC_DEPTH_BUFFER' : '',
        n.reversedDepthBuffer ? '#define USE_REVERSED_DEPTH_BUFFER' : '',
        'uniform mat4 modelMatrix;',
        'uniform mat4 modelViewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 viewMatrix;',
        'uniform mat3 normalMatrix;',
        'uniform vec3 cameraPosition;',
        'uniform bool isOrthographic;',
        '#ifdef USE_INSTANCING',
        '	attribute mat4 instanceMatrix;',
        '#endif',
        '#ifdef USE_INSTANCING_COLOR',
        '	attribute vec3 instanceColor;',
        '#endif',
        '#ifdef USE_INSTANCING_MORPH',
        '	uniform sampler2D morphTexture;',
        '#endif',
        'attribute vec3 position;',
        'attribute vec3 normal;',
        'attribute vec2 uv;',
        '#ifdef USE_UV1',
        '	attribute vec2 uv1;',
        '#endif',
        '#ifdef USE_UV2',
        '	attribute vec2 uv2;',
        '#endif',
        '#ifdef USE_UV3',
        '	attribute vec2 uv3;',
        '#endif',
        '#ifdef USE_TANGENT',
        '	attribute vec4 tangent;',
        '#endif',
        '#if defined( USE_COLOR_ALPHA )',
        '	attribute vec4 color;',
        '#elif defined( USE_COLOR )',
        '	attribute vec3 color;',
        '#endif',
        '#ifdef USE_SKINNING',
        '	attribute vec4 skinIndex;',
        '	attribute vec4 skinWeight;',
        '#endif',
        '\n'
      ]
        .filter(Tl)
        .join('\n')),
      (_ = [
        Fl(n),
        '#define SHADER_TYPE ' + n.shaderType,
        '#define SHADER_NAME ' + n.shaderName,
        m,
        n.useFog && n.fog ? '#define USE_FOG' : '',
        n.useFog && n.fogExp2 ? '#define FOG_EXP2' : '',
        n.alphaToCoverage ? '#define ALPHA_TO_COVERAGE' : '',
        n.map ? '#define USE_MAP' : '',
        n.matcap ? '#define USE_MATCAP' : '',
        n.envMap ? '#define USE_ENVMAP' : '',
        n.envMap ? '#define ' + l : '',
        n.envMap ? '#define ' + u : '',
        n.envMap ? '#define ' + d : '',
        f ? '#define CUBEUV_TEXEL_WIDTH ' + f.texelWidth : '',
        f ? '#define CUBEUV_TEXEL_HEIGHT ' + f.texelHeight : '',
        f ? '#define CUBEUV_MAX_MIP ' + f.maxMip + '.0' : '',
        n.lightMap ? '#define USE_LIGHTMAP' : '',
        n.aoMap ? '#define USE_AOMAP' : '',
        n.bumpMap ? '#define USE_BUMPMAP' : '',
        n.normalMap ? '#define USE_NORMALMAP' : '',
        n.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
        n.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
        n.packedNormalMap ? '#define USE_PACKED_NORMALMAP' : '',
        n.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
        n.anisotropy ? '#define USE_ANISOTROPY' : '',
        n.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',
        n.clearcoat ? '#define USE_CLEARCOAT' : '',
        n.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
        n.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
        n.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',
        n.dispersion ? '#define USE_DISPERSION' : '',
        n.iridescence ? '#define USE_IRIDESCENCE' : '',
        n.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
        n.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',
        n.specularMap ? '#define USE_SPECULARMAP' : '',
        n.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
        n.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',
        n.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        n.metalnessMap ? '#define USE_METALNESSMAP' : '',
        n.alphaMap ? '#define USE_ALPHAMAP' : '',
        n.alphaTest ? '#define USE_ALPHATEST' : '',
        n.alphaHash ? '#define USE_ALPHAHASH' : '',
        n.sheen ? '#define USE_SHEEN' : '',
        n.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
        n.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',
        n.transmission ? '#define USE_TRANSMISSION' : '',
        n.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
        n.thicknessMap ? '#define USE_THICKNESSMAP' : '',
        n.vertexTangents && n.flatShading === !1 ? '#define USE_TANGENT' : '',
        n.vertexColors || n.instancingColor ? '#define USE_COLOR' : '',
        n.vertexAlphas || n.batchingColor ? '#define USE_COLOR_ALPHA' : '',
        n.vertexUv1s ? '#define USE_UV1' : '',
        n.vertexUv2s ? '#define USE_UV2' : '',
        n.vertexUv3s ? '#define USE_UV3' : '',
        n.pointsUvs ? '#define USE_POINTS_UV' : '',
        n.gradientMap ? '#define USE_GRADIENTMAP' : '',
        n.flatShading ? '#define FLAT_SHADED' : '',
        n.doubleSided ? '#define DOUBLE_SIDED' : '',
        n.flipSided ? '#define FLIP_SIDED' : '',
        n.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        n.shadowMapEnabled ? '#define ' + c : '',
        n.premultipliedAlpha ? '#define PREMULTIPLIED_ALPHA' : '',
        n.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',
        n.numLightProbeGrids > 0 ? '#define USE_LIGHT_PROBES_GRID' : '',
        n.decodeVideoTexture ? '#define DECODE_VIDEO_TEXTURE' : '',
        n.decodeVideoTextureEmissive ? '#define DECODE_VIDEO_TEXTURE_EMISSIVE' : '',
        n.logarithmicDepthBuffer ? '#define USE_LOGARITHMIC_DEPTH_BUFFER' : '',
        n.reversedDepthBuffer ? '#define USE_REVERSED_DEPTH_BUFFER' : '',
        'uniform mat4 viewMatrix;',
        'uniform vec3 cameraPosition;',
        'uniform bool isOrthographic;',
        n.toneMapping === 0 ? '' : '#define TONE_MAPPING',
        n.toneMapping === 0 ? '' : Z.tonemapping_pars_fragment,
        n.toneMapping === 0 ? '' : yl('toneMapping', n.toneMapping),
        n.dithering ? '#define DITHERING' : '',
        n.opaque ? '#define OPAQUE' : '',
        Z.colorspace_pars_fragment,
        _l('linearToOutputTexel', n.outputColorSpace),
        xl(),
        n.useDepthPacking ? '#define DEPTH_PACKING ' + n.depthPacking : '',
        '\n'
      ]
        .filter(Tl)
        .join('\n'))),
    (o = kl(o)),
    (o = El(o, n)),
    (o = Dl(o, n)),
    (s = kl(s)),
    (s = El(s, n)),
    (s = Dl(s, n)),
    (o = Nl(o)),
    (s = Nl(s)),
    n.isRawShaderMaterial !== !0 &&
      ((v = '#version 300 es\n'),
      (g =
        [p, '#define attribute in', '#define varying out', '#define texture2D texture'].join('\n') +
        '\n' +
        g),
      (_ =
        [
          '#define varying in',
          n.glslVersion === '300 es' ? '' : 'layout(location = 0) out highp vec4 pc_fragColor;',
          n.glslVersion === '300 es' ? '' : '#define gl_FragColor pc_fragColor',
          '#define gl_FragDepthEXT gl_FragDepth',
          '#define texture2D texture',
          '#define textureCube texture',
          '#define texture2DProj textureProj',
          '#define texture2DLodEXT textureLod',
          '#define texture2DProjLodEXT textureProjLod',
          '#define textureCubeLodEXT textureLod',
          '#define texture2DGradEXT textureGrad',
          '#define texture2DProjGradEXT textureProjGrad',
          '#define textureCubeGradEXT textureGrad'
        ].join('\n') +
        '\n' +
        _)));
  let y = v + g + o,
    b = v + _ + s,
    x = ul(i, i.VERTEX_SHADER, y),
    S = ul(i, i.FRAGMENT_SHADER, b);
  (i.attachShader(h, x),
    i.attachShader(h, S),
    n.index0AttributeName === void 0
      ? n.morphTargets === !0 && i.bindAttribLocation(h, 0, 'position')
      : i.bindAttribLocation(h, 0, n.index0AttributeName),
    i.linkProgram(h));
  function C(t) {
    if (e.debug.checkShaderErrors) {
      let n = i.getProgramInfoLog(h) || '',
        r = i.getShaderInfoLog(x) || '',
        a = i.getShaderInfoLog(S) || '',
        o = n.trim(),
        s = r.trim(),
        c = a.trim(),
        l = !0,
        u = !0;
      if (i.getProgramParameter(h, i.LINK_STATUS) === !1)
        if (((l = !1), typeof e.debug.onShaderError == 'function'))
          e.debug.onShaderError(i, h, x, S);
        else {
          let e = gl(i, x, 'vertex'),
            n = gl(i, S, 'fragment');
          G(
            'THREE.WebGLProgram: Shader Error ' +
              i.getError() +
              ' - VALIDATE_STATUS ' +
              i.getProgramParameter(h, i.VALIDATE_STATUS) +
              '\n\nMaterial Name: ' +
              t.name +
              '\nMaterial Type: ' +
              t.type +
              '\n\nProgram Info Log: ' +
              o +
              '\n' +
              e +
              '\n' +
              n
          );
        }
      else o === '' ? (s === '' || c === '') && (u = !1) : W('WebGLProgram: Program Info Log:', o);
      u &&
        (t.diagnostics = {
          runnable: l,
          programLog: o,
          vertexShader: {
            log: s,
            prefix: g
          },
          fragmentShader: {
            log: c,
            prefix: _
          }
        });
    }
    (i.deleteShader(x), i.deleteShader(S), (w = new ll(i, h)), (T = wl(i, h)));
  }
  let w;
  this.getUniforms = function () {
    return (w === void 0 && C(this), w);
  };
  let T;
  this.getAttributes = function () {
    return (T === void 0 && C(this), T);
  };
  let E = n.rendererExtensionParallelShaderCompile === !1;
  return (
    (this.isReady = function () {
      return (E === !1 && (E = i.getProgramParameter(h, dl)), E);
    }),
    (this.destroy = function () {
      (r.releaseStatesOfProgram(this), i.deleteProgram(h), (this.program = void 0));
    }),
    (this.type = n.shaderType),
    (this.name = n.shaderName),
    (this.id = fl++),
    (this.cacheKey = t),
    (this.usedTimes = 1),
    (this.program = h),
    (this.vertexShader = x),
    (this.fragmentShader = S),
    this
  );
}
var Kl = 0,
  ql = class {
    constructor() {
      ((this.shaderCache = /* @__PURE__ */ new Map()),
        (this.materialCache = /* @__PURE__ */ new Map()));
    }
    update(e) {
      let t = e.vertexShader,
        n = e.fragmentShader,
        r = this._getShaderStage(t),
        i = this._getShaderStage(n),
        a = this._getShaderCacheForMaterial(e);
      return (
        a.has(r) === !1 && (a.add(r), r.usedTimes++),
        a.has(i) === !1 && (a.add(i), i.usedTimes++),
        this
      );
    }
    remove(e) {
      let t = this.materialCache.get(e);
      for (let e of t) (e.usedTimes--, e.usedTimes === 0 && this.shaderCache.delete(e.code));
      return (this.materialCache.delete(e), this);
    }
    getVertexShaderID(e) {
      return this._getShaderStage(e.vertexShader).id;
    }
    getFragmentShaderID(e) {
      return this._getShaderStage(e.fragmentShader).id;
    }
    dispose() {
      (this.shaderCache.clear(), this.materialCache.clear());
    }
    _getShaderCacheForMaterial(e) {
      let t = this.materialCache,
        n = t.get(e);
      return (n === void 0 && ((n = /* @__PURE__ */ new Set()), t.set(e, n)), n);
    }
    _getShaderStage(e) {
      let t = this.shaderCache,
        n = t.get(e);
      return (n === void 0 && ((n = new Jl(e)), t.set(e, n)), n);
    }
  },
  Jl = class {
    constructor(e) {
      ((this.id = Kl++), (this.code = e), (this.usedTimes = 0));
    }
  };
function Yl(e) {
  return e === 1030 || e === 37490 || e === 36285;
}
function Xl(e, t, n, r, i, a) {
  let o = new on(),
    s = new ql(),
    c = /* @__PURE__ */ new Set(),
    l = [],
    u = /* @__PURE__ */ new Map(),
    d = r.logarithmicDepthBuffer,
    f = r.precision,
    p = {
      MeshDepthMaterial: 'depth',
      MeshDistanceMaterial: 'distance',
      MeshNormalMaterial: 'normal',
      MeshBasicMaterial: 'basic',
      MeshLambertMaterial: 'lambert',
      MeshPhongMaterial: 'phong',
      MeshToonMaterial: 'toon',
      MeshStandardMaterial: 'physical',
      MeshPhysicalMaterial: 'physical',
      MeshMatcapMaterial: 'matcap',
      LineBasicMaterial: 'basic',
      LineDashedMaterial: 'dashed',
      PointsMaterial: 'points',
      ShadowMaterial: 'shadow',
      SpriteMaterial: 'sprite'
    };
  function m(e) {
    return (c.add(e), e === 0 ? 'uv' : `uv${e}`);
  }
  function h(i, o, l, u, h, g) {
    let _ = u.fog,
      v = h.geometry,
      y =
        i.isMeshStandardMaterial || i.isMeshLambertMaterial || i.isMeshPhongMaterial
          ? u.environment
          : null,
      b =
        i.isMeshStandardMaterial ||
        (i.isMeshLambertMaterial && !i.envMap) ||
        (i.isMeshPhongMaterial && !i.envMap),
      x = t.get(i.envMap || y, b),
      S = x && x.mapping === 306 ? x.image.height : null,
      C = p[i.type];
    i.precision !== null &&
      ((f = r.getMaxPrecision(i.precision)),
      f !== i.precision &&
        W('WebGLProgram.getParameters:', i.precision, 'not supported, using', f, 'instead.'));
    let w = v.morphAttributes.position || v.morphAttributes.normal || v.morphAttributes.color,
      T = w === void 0 ? 0 : w.length,
      E = 0;
    (v.morphAttributes.position !== void 0 && (E = 1),
      v.morphAttributes.normal !== void 0 && (E = 2),
      v.morphAttributes.color !== void 0 && (E = 3));
    let D, O, k, A;
    if (C) {
      let e = vs[C];
      ((D = e.vertexShader), (O = e.fragmentShader));
    } else
      ((D = i.vertexShader),
        (O = i.fragmentShader),
        s.update(i),
        (k = s.getVertexShaderID(i)),
        (A = s.getFragmentShaderID(i)));
    let j = e.getRenderTarget(),
      M = e.state.buffers.depth.getReversed(),
      N = h.isInstancedMesh === !0,
      P = h.isBatchedMesh === !0,
      F = !!i.map,
      I = !!i.matcap,
      ee = !!x,
      te = !!i.aoMap,
      ne = !!i.lightMap,
      re = !!i.bumpMap,
      L = !!i.normalMap,
      R = !!i.displacementMap,
      ie = !!i.emissiveMap,
      z = !!i.metalnessMap,
      ae = !!i.roughnessMap,
      oe = i.anisotropy > 0,
      se = i.clearcoat > 0,
      ce = i.dispersion > 0,
      le = i.iridescence > 0,
      ue = i.sheen > 0,
      de = i.transmission > 0,
      fe = oe && !!i.anisotropyMap,
      pe = se && !!i.clearcoatMap,
      me = se && !!i.clearcoatNormalMap,
      he = se && !!i.clearcoatRoughnessMap,
      ge = le && !!i.iridescenceMap,
      _e = le && !!i.iridescenceThicknessMap,
      ve = ue && !!i.sheenColorMap,
      ye = ue && !!i.sheenRoughnessMap,
      be = !!i.specularMap,
      xe = !!i.specularColorMap,
      Se = !!i.specularIntensityMap,
      Ce = de && !!i.transmissionMap,
      we = de && !!i.thicknessMap,
      Te = !!i.gradientMap,
      B = !!i.alphaMap,
      Ee = i.alphaTest > 0,
      De = !!i.alphaHash,
      Oe = !!i.extensions,
      V = 0;
    i.toneMapped && (j === null || j.isXRRenderTarget === !0) && (V = e.toneMapping);
    let ke = {
      shaderID: C,
      shaderType: i.type,
      shaderName: i.name,
      vertexShader: D,
      fragmentShader: O,
      defines: i.defines,
      customVertexShaderID: k,
      customFragmentShaderID: A,
      isRawShaderMaterial: i.isRawShaderMaterial === !0,
      glslVersion: i.glslVersion,
      precision: f,
      batching: P,
      batchingColor: P && h._colorsTexture !== null,
      instancing: N,
      instancingColor: N && h.instanceColor !== null,
      instancingMorph: N && h.morphTexture !== null,
      outputColorSpace:
        j === null
          ? e.outputColorSpace
          : j.isXRRenderTarget === !0
            ? j.texture.colorSpace
            : Mt.workingColorSpace,
      alphaToCoverage: !!i.alphaToCoverage,
      map: F,
      matcap: I,
      envMap: ee,
      envMapMode: ee && x.mapping,
      envMapCubeUVHeight: S,
      aoMap: te,
      lightMap: ne,
      bumpMap: re,
      normalMap: L,
      displacementMap: R,
      emissiveMap: ie,
      normalMapObjectSpace: L && i.normalMapType === 1,
      normalMapTangentSpace: L && i.normalMapType === 0,
      packedNormalMap: L && i.normalMapType === 0 && Yl(i.normalMap.format),
      metalnessMap: z,
      roughnessMap: ae,
      anisotropy: oe,
      anisotropyMap: fe,
      clearcoat: se,
      clearcoatMap: pe,
      clearcoatNormalMap: me,
      clearcoatRoughnessMap: he,
      dispersion: ce,
      iridescence: le,
      iridescenceMap: ge,
      iridescenceThicknessMap: _e,
      sheen: ue,
      sheenColorMap: ve,
      sheenRoughnessMap: ye,
      specularMap: be,
      specularColorMap: xe,
      specularIntensityMap: Se,
      transmission: de,
      transmissionMap: Ce,
      thicknessMap: we,
      gradientMap: Te,
      opaque: i.transparent === !1 && i.blending === 1 && i.alphaToCoverage === !1,
      alphaMap: B,
      alphaTest: Ee,
      alphaHash: De,
      combine: i.combine,
      mapUv: F && m(i.map.channel),
      aoMapUv: te && m(i.aoMap.channel),
      lightMapUv: ne && m(i.lightMap.channel),
      bumpMapUv: re && m(i.bumpMap.channel),
      normalMapUv: L && m(i.normalMap.channel),
      displacementMapUv: R && m(i.displacementMap.channel),
      emissiveMapUv: ie && m(i.emissiveMap.channel),
      metalnessMapUv: z && m(i.metalnessMap.channel),
      roughnessMapUv: ae && m(i.roughnessMap.channel),
      anisotropyMapUv: fe && m(i.anisotropyMap.channel),
      clearcoatMapUv: pe && m(i.clearcoatMap.channel),
      clearcoatNormalMapUv: me && m(i.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: he && m(i.clearcoatRoughnessMap.channel),
      iridescenceMapUv: ge && m(i.iridescenceMap.channel),
      iridescenceThicknessMapUv: _e && m(i.iridescenceThicknessMap.channel),
      sheenColorMapUv: ve && m(i.sheenColorMap.channel),
      sheenRoughnessMapUv: ye && m(i.sheenRoughnessMap.channel),
      specularMapUv: be && m(i.specularMap.channel),
      specularColorMapUv: xe && m(i.specularColorMap.channel),
      specularIntensityMapUv: Se && m(i.specularIntensityMap.channel),
      transmissionMapUv: Ce && m(i.transmissionMap.channel),
      thicknessMapUv: we && m(i.thicknessMap.channel),
      alphaMapUv: B && m(i.alphaMap.channel),
      vertexTangents: !!v.attributes.tangent && (L || oe),
      vertexNormals: !!v.attributes.normal,
      vertexColors: i.vertexColors,
      vertexAlphas:
        i.vertexColors === !0 && !!v.attributes.color && v.attributes.color.itemSize === 4,
      pointsUvs: h.isPoints === !0 && !!v.attributes.uv && (F || B),
      fog: !!_,
      useFog: i.fog === !0,
      fogExp2: !!_ && _.isFogExp2,
      flatShading:
        i.wireframe === !1 &&
        (i.flatShading === !0 ||
          (v.attributes.normal === void 0 &&
            L === !1 &&
            (i.isMeshLambertMaterial ||
              i.isMeshPhongMaterial ||
              i.isMeshStandardMaterial ||
              i.isMeshPhysicalMaterial))),
      sizeAttenuation: i.sizeAttenuation === !0,
      logarithmicDepthBuffer: d,
      reversedDepthBuffer: M,
      skinning: h.isSkinnedMesh === !0,
      morphTargets: v.morphAttributes.position !== void 0,
      morphNormals: v.morphAttributes.normal !== void 0,
      morphColors: v.morphAttributes.color !== void 0,
      morphTargetsCount: T,
      morphTextureStride: E,
      numDirLights: o.directional.length,
      numPointLights: o.point.length,
      numSpotLights: o.spot.length,
      numSpotLightMaps: o.spotLightMap.length,
      numRectAreaLights: o.rectArea.length,
      numHemiLights: o.hemi.length,
      numDirLightShadows: o.directionalShadowMap.length,
      numPointLightShadows: o.pointShadowMap.length,
      numSpotLightShadows: o.spotShadowMap.length,
      numSpotLightShadowsWithMaps: o.numSpotLightShadowsWithMaps,
      numLightProbes: o.numLightProbes,
      numLightProbeGrids: g.length,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: i.dithering,
      shadowMapEnabled: e.shadowMap.enabled && l.length > 0,
      shadowMapType: e.shadowMap.type,
      toneMapping: V,
      decodeVideoTexture:
        F && i.map.isVideoTexture === !0 && Mt.getTransfer(i.map.colorSpace) === 'srgb',
      decodeVideoTextureEmissive:
        ie &&
        i.emissiveMap.isVideoTexture === !0 &&
        Mt.getTransfer(i.emissiveMap.colorSpace) === 'srgb',
      premultipliedAlpha: i.premultipliedAlpha,
      doubleSided: i.side === 2,
      flipSided: i.side === 1,
      useDepthPacking: i.depthPacking >= 0,
      depthPacking: i.depthPacking || 0,
      index0AttributeName: i.index0AttributeName,
      extensionClipCullDistance:
        Oe && i.extensions.clipCullDistance === !0 && n.has('WEBGL_clip_cull_distance'),
      extensionMultiDraw: ((Oe && i.extensions.multiDraw === !0) || P) && n.has('WEBGL_multi_draw'),
      rendererExtensionParallelShaderCompile: n.has('KHR_parallel_shader_compile'),
      customProgramCacheKey: i.customProgramCacheKey()
    };
    return (
      (ke.vertexUv1s = c.has(1)),
      (ke.vertexUv2s = c.has(2)),
      (ke.vertexUv3s = c.has(3)),
      c.clear(),
      ke
    );
  }
  function g(t) {
    let n = [];
    if (
      (t.shaderID
        ? n.push(t.shaderID)
        : (n.push(t.customVertexShaderID), n.push(t.customFragmentShaderID)),
      t.defines !== void 0)
    )
      for (let e in t.defines) (n.push(e), n.push(t.defines[e]));
    return (
      t.isRawShaderMaterial === !1 && (_(n, t), v(n, t), n.push(e.outputColorSpace)),
      n.push(t.customProgramCacheKey),
      n.join()
    );
  }
  function _(e, t) {
    (e.push(t.precision),
      e.push(t.outputColorSpace),
      e.push(t.envMapMode),
      e.push(t.envMapCubeUVHeight),
      e.push(t.mapUv),
      e.push(t.alphaMapUv),
      e.push(t.lightMapUv),
      e.push(t.aoMapUv),
      e.push(t.bumpMapUv),
      e.push(t.normalMapUv),
      e.push(t.displacementMapUv),
      e.push(t.emissiveMapUv),
      e.push(t.metalnessMapUv),
      e.push(t.roughnessMapUv),
      e.push(t.anisotropyMapUv),
      e.push(t.clearcoatMapUv),
      e.push(t.clearcoatNormalMapUv),
      e.push(t.clearcoatRoughnessMapUv),
      e.push(t.iridescenceMapUv),
      e.push(t.iridescenceThicknessMapUv),
      e.push(t.sheenColorMapUv),
      e.push(t.sheenRoughnessMapUv),
      e.push(t.specularMapUv),
      e.push(t.specularColorMapUv),
      e.push(t.specularIntensityMapUv),
      e.push(t.transmissionMapUv),
      e.push(t.thicknessMapUv),
      e.push(t.combine),
      e.push(t.fogExp2),
      e.push(t.sizeAttenuation),
      e.push(t.morphTargetsCount),
      e.push(t.morphAttributeCount),
      e.push(t.numDirLights),
      e.push(t.numPointLights),
      e.push(t.numSpotLights),
      e.push(t.numSpotLightMaps),
      e.push(t.numHemiLights),
      e.push(t.numRectAreaLights),
      e.push(t.numDirLightShadows),
      e.push(t.numPointLightShadows),
      e.push(t.numSpotLightShadows),
      e.push(t.numSpotLightShadowsWithMaps),
      e.push(t.numLightProbes),
      e.push(t.shadowMapType),
      e.push(t.toneMapping),
      e.push(t.numClippingPlanes),
      e.push(t.numClipIntersection),
      e.push(t.depthPacking));
  }
  function v(e, t) {
    (o.disableAll(),
      t.instancing && o.enable(0),
      t.instancingColor && o.enable(1),
      t.instancingMorph && o.enable(2),
      t.matcap && o.enable(3),
      t.envMap && o.enable(4),
      t.normalMapObjectSpace && o.enable(5),
      t.normalMapTangentSpace && o.enable(6),
      t.clearcoat && o.enable(7),
      t.iridescence && o.enable(8),
      t.alphaTest && o.enable(9),
      t.vertexColors && o.enable(10),
      t.vertexAlphas && o.enable(11),
      t.vertexUv1s && o.enable(12),
      t.vertexUv2s && o.enable(13),
      t.vertexUv3s && o.enable(14),
      t.vertexTangents && o.enable(15),
      t.anisotropy && o.enable(16),
      t.alphaHash && o.enable(17),
      t.batching && o.enable(18),
      t.dispersion && o.enable(19),
      t.batchingColor && o.enable(20),
      t.gradientMap && o.enable(21),
      t.packedNormalMap && o.enable(22),
      t.vertexNormals && o.enable(23),
      e.push(o.mask),
      o.disableAll(),
      t.fog && o.enable(0),
      t.useFog && o.enable(1),
      t.flatShading && o.enable(2),
      t.logarithmicDepthBuffer && o.enable(3),
      t.reversedDepthBuffer && o.enable(4),
      t.skinning && o.enable(5),
      t.morphTargets && o.enable(6),
      t.morphNormals && o.enable(7),
      t.morphColors && o.enable(8),
      t.premultipliedAlpha && o.enable(9),
      t.shadowMapEnabled && o.enable(10),
      t.doubleSided && o.enable(11),
      t.flipSided && o.enable(12),
      t.useDepthPacking && o.enable(13),
      t.dithering && o.enable(14),
      t.transmission && o.enable(15),
      t.sheen && o.enable(16),
      t.opaque && o.enable(17),
      t.pointsUvs && o.enable(18),
      t.decodeVideoTexture && o.enable(19),
      t.decodeVideoTextureEmissive && o.enable(20),
      t.alphaToCoverage && o.enable(21),
      t.numLightProbeGrids > 0 && o.enable(22),
      e.push(o.mask));
  }
  function y(e) {
    let t = p[e.type],
      n;
    if (t) {
      let e = vs[t];
      n = Ka.clone(e.uniforms);
    } else n = e.uniforms;
    return n;
  }
  function b(t, n) {
    let r = u.get(n);
    return (r === void 0 ? ((r = new Gl(e, n, t, i)), l.push(r), u.set(n, r)) : ++r.usedTimes, r);
  }
  function x(e) {
    if (--e.usedTimes === 0) {
      let t = l.indexOf(e);
      ((l[t] = l[l.length - 1]), l.pop(), u.delete(e.cacheKey), e.destroy());
    }
  }
  function S(e) {
    s.remove(e);
  }
  function C() {
    s.dispose();
  }
  return {
    getParameters: h,
    getProgramCacheKey: g,
    getUniforms: y,
    acquireProgram: b,
    releaseProgram: x,
    releaseShaderCache: S,
    programs: l,
    dispose: C
  };
}
function Zl() {
  let e = /* @__PURE__ */ new WeakMap();
  function t(t) {
    return e.has(t);
  }
  function n(t) {
    let n = e.get(t);
    return (n === void 0 && ((n = {}), e.set(t, n)), n);
  }
  function r(t) {
    e.delete(t);
  }
  function i(t, n, r) {
    e.get(t)[n] = r;
  }
  function a() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    has: t,
    get: n,
    remove: r,
    update: i,
    dispose: a
  };
}
function Ql(e, t) {
  return e.groupOrder === t.groupOrder
    ? e.renderOrder === t.renderOrder
      ? e.material.id === t.material.id
        ? e.materialVariant === t.materialVariant
          ? e.z === t.z
            ? e.id - t.id
            : e.z - t.z
          : e.materialVariant - t.materialVariant
        : e.material.id - t.material.id
      : e.renderOrder - t.renderOrder
    : e.groupOrder - t.groupOrder;
}
function $l(e, t) {
  return e.groupOrder === t.groupOrder
    ? e.renderOrder === t.renderOrder
      ? e.z === t.z
        ? e.id - t.id
        : t.z - e.z
      : e.renderOrder - t.renderOrder
    : e.groupOrder - t.groupOrder;
}
function eu() {
  let e = [],
    t = 0,
    n = [],
    r = [],
    i = [];
  function a() {
    ((t = 0), (n.length = 0), (r.length = 0), (i.length = 0));
  }
  function o(e) {
    let t = 0;
    return (e.isInstancedMesh && (t += 2), e.isSkinnedMesh && (t += 1), t);
  }
  function s(n, r, i, a, s, c) {
    let l = e[t];
    return (
      l === void 0
        ? ((l = {
            id: n.id,
            object: n,
            geometry: r,
            material: i,
            materialVariant: o(n),
            groupOrder: a,
            renderOrder: n.renderOrder,
            z: s,
            group: c
          }),
          (e[t] = l))
        : ((l.id = n.id),
          (l.object = n),
          (l.geometry = r),
          (l.material = i),
          (l.materialVariant = o(n)),
          (l.groupOrder = a),
          (l.renderOrder = n.renderOrder),
          (l.z = s),
          (l.group = c)),
      t++,
      l
    );
  }
  function c(e, t, a, o, c, l) {
    let u = s(e, t, a, o, c, l);
    a.transmission > 0 ? r.push(u) : a.transparent === !0 ? i.push(u) : n.push(u);
  }
  function l(e, t, a, o, c, l) {
    let u = s(e, t, a, o, c, l);
    a.transmission > 0 ? r.unshift(u) : a.transparent === !0 ? i.unshift(u) : n.unshift(u);
  }
  function u(e, t) {
    (n.length > 1 && n.sort(e || Ql),
      r.length > 1 && r.sort(t || $l),
      i.length > 1 && i.sort(t || $l));
  }
  function d() {
    for (let n = t, r = e.length; n < r; n++) {
      let t = e[n];
      if (t.id === null) break;
      ((t.id = null),
        (t.object = null),
        (t.geometry = null),
        (t.material = null),
        (t.group = null));
    }
  }
  return {
    opaque: n,
    transmissive: r,
    transparent: i,
    init: a,
    push: c,
    unshift: l,
    finish: d,
    sort: u
  };
}
function tu() {
  let e = /* @__PURE__ */ new WeakMap();
  function t(t, n) {
    let r = e.get(t),
      i;
    return (
      r === void 0
        ? ((i = new eu()), e.set(t, [i]))
        : n >= r.length
          ? ((i = new eu()), r.push(i))
          : (i = r[n]),
      i
    );
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
function nu() {
  let e = {};
  return {
    get: function (t) {
      if (e[t.id] !== void 0) return e[t.id];
      let n;
      switch (t.type) {
        case 'DirectionalLight':
          n = {
            direction: new J(),
            color: new X()
          };
          break;
        case 'SpotLight':
          n = {
            position: new J(),
            direction: new J(),
            color: new X(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case 'PointLight':
          n = {
            position: new J(),
            color: new X(),
            distance: 0,
            decay: 0
          };
          break;
        case 'HemisphereLight':
          n = {
            direction: new J(),
            skyColor: new X(),
            groundColor: new X()
          };
          break;
        case 'RectAreaLight':
          n = {
            color: new X(),
            position: new J(),
            halfWidth: new J(),
            halfHeight: new J()
          };
          break;
      }
      return ((e[t.id] = n), n);
    }
  };
}
function ru() {
  let e = {};
  return {
    get: function (t) {
      if (e[t.id] !== void 0) return e[t.id];
      let n;
      switch (t.type) {
        case 'DirectionalLight':
          n = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new q()
          };
          break;
        case 'SpotLight':
          n = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new q()
          };
          break;
        case 'PointLight':
          n = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new q(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return ((e[t.id] = n), n);
    }
  };
}
var iu = 0;
function au(e, t) {
  return (t.castShadow ? 2 : 0) - (e.castShadow ? 2 : 0) + +!!t.map - !!e.map;
}
function ou(e) {
  let t = new nu(),
    n = ru(),
    r = {
      version: 0,
      hash: {
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1,
        numLightProbes: -1
      },
      ambient: [0, 0, 0],
      probe: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0
    };
  for (let e = 0; e < 9; e++) r.probe.push(new J());
  let i = new J(),
    a = new Jt(),
    o = new Jt();
  function s(i) {
    let a = 0,
      o = 0,
      s = 0;
    for (let e = 0; e < 9; e++) r.probe[e].set(0, 0, 0);
    let c = 0,
      l = 0,
      u = 0,
      d = 0,
      f = 0,
      p = 0,
      m = 0,
      h = 0,
      g = 0,
      _ = 0,
      v = 0;
    i.sort(au);
    for (let e = 0, y = i.length; e < y; e++) {
      let y = i[e],
        b = y.color,
        x = y.intensity,
        S = y.distance,
        C = null;
      if (
        (y.shadow &&
          y.shadow.map &&
          (C =
            y.shadow.map.texture.format === 1030
              ? y.shadow.map.texture
              : y.shadow.map.depthTexture || y.shadow.map.texture),
        y.isAmbientLight)
      )
        ((a += b.r * x), (o += b.g * x), (s += b.b * x));
      else if (y.isLightProbe) {
        for (let e = 0; e < 9; e++) r.probe[e].addScaledVector(y.sh.coefficients[e], x);
        v++;
      } else if (y.isDirectionalLight) {
        let e = t.get(y);
        if ((e.color.copy(y.color).multiplyScalar(y.intensity), y.castShadow)) {
          let e = y.shadow,
            t = n.get(y);
          ((t.shadowIntensity = e.intensity),
            (t.shadowBias = e.bias),
            (t.shadowNormalBias = e.normalBias),
            (t.shadowRadius = e.radius),
            (t.shadowMapSize = e.mapSize),
            (r.directionalShadow[c] = t),
            (r.directionalShadowMap[c] = C),
            (r.directionalShadowMatrix[c] = y.shadow.matrix),
            p++);
        }
        ((r.directional[c] = e), c++);
      } else if (y.isSpotLight) {
        let e = t.get(y);
        (e.position.setFromMatrixPosition(y.matrixWorld),
          e.color.copy(b).multiplyScalar(x),
          (e.distance = S),
          (e.coneCos = Math.cos(y.angle)),
          (e.penumbraCos = Math.cos(y.angle * (1 - y.penumbra))),
          (e.decay = y.decay),
          (r.spot[u] = e));
        let i = y.shadow;
        if (
          (y.map && ((r.spotLightMap[g] = y.map), g++, i.updateMatrices(y), y.castShadow && _++),
          (r.spotLightMatrix[u] = i.matrix),
          y.castShadow)
        ) {
          let e = n.get(y);
          ((e.shadowIntensity = i.intensity),
            (e.shadowBias = i.bias),
            (e.shadowNormalBias = i.normalBias),
            (e.shadowRadius = i.radius),
            (e.shadowMapSize = i.mapSize),
            (r.spotShadow[u] = e),
            (r.spotShadowMap[u] = C),
            h++);
        }
        u++;
      } else if (y.isRectAreaLight) {
        let e = t.get(y);
        (e.color.copy(b).multiplyScalar(x),
          e.halfWidth.set(y.width * 0.5, 0, 0),
          e.halfHeight.set(0, y.height * 0.5, 0),
          (r.rectArea[d] = e),
          d++);
      } else if (y.isPointLight) {
        let e = t.get(y);
        if (
          (e.color.copy(y.color).multiplyScalar(y.intensity),
          (e.distance = y.distance),
          (e.decay = y.decay),
          y.castShadow)
        ) {
          let e = y.shadow,
            t = n.get(y);
          ((t.shadowIntensity = e.intensity),
            (t.shadowBias = e.bias),
            (t.shadowNormalBias = e.normalBias),
            (t.shadowRadius = e.radius),
            (t.shadowMapSize = e.mapSize),
            (t.shadowCameraNear = e.camera.near),
            (t.shadowCameraFar = e.camera.far),
            (r.pointShadow[l] = t),
            (r.pointShadowMap[l] = C),
            (r.pointShadowMatrix[l] = y.shadow.matrix),
            m++);
        }
        ((r.point[l] = e), l++);
      } else if (y.isHemisphereLight) {
        let e = t.get(y);
        (e.skyColor.copy(y.color).multiplyScalar(x),
          e.groundColor.copy(y.groundColor).multiplyScalar(x),
          (r.hemi[f] = e),
          f++);
      }
    }
    (d > 0 &&
      (e.has('OES_texture_float_linear') === !0
        ? ((r.rectAreaLTC1 = Q.LTC_FLOAT_1), (r.rectAreaLTC2 = Q.LTC_FLOAT_2))
        : ((r.rectAreaLTC1 = Q.LTC_HALF_1), (r.rectAreaLTC2 = Q.LTC_HALF_2))),
      (r.ambient[0] = a),
      (r.ambient[1] = o),
      (r.ambient[2] = s));
    let y = r.hash;
    (y.directionalLength !== c ||
      y.pointLength !== l ||
      y.spotLength !== u ||
      y.rectAreaLength !== d ||
      y.hemiLength !== f ||
      y.numDirectionalShadows !== p ||
      y.numPointShadows !== m ||
      y.numSpotShadows !== h ||
      y.numSpotMaps !== g ||
      y.numLightProbes !== v) &&
      ((r.directional.length = c),
      (r.spot.length = u),
      (r.rectArea.length = d),
      (r.point.length = l),
      (r.hemi.length = f),
      (r.directionalShadow.length = p),
      (r.directionalShadowMap.length = p),
      (r.pointShadow.length = m),
      (r.pointShadowMap.length = m),
      (r.spotShadow.length = h),
      (r.spotShadowMap.length = h),
      (r.directionalShadowMatrix.length = p),
      (r.pointShadowMatrix.length = m),
      (r.spotLightMatrix.length = h + g - _),
      (r.spotLightMap.length = g),
      (r.numSpotLightShadowsWithMaps = _),
      (r.numLightProbes = v),
      (y.directionalLength = c),
      (y.pointLength = l),
      (y.spotLength = u),
      (y.rectAreaLength = d),
      (y.hemiLength = f),
      (y.numDirectionalShadows = p),
      (y.numPointShadows = m),
      (y.numSpotShadows = h),
      (y.numSpotMaps = g),
      (y.numLightProbes = v),
      (r.version = iu++));
  }
  function c(e, t) {
    let n = 0,
      s = 0,
      c = 0,
      l = 0,
      u = 0,
      d = t.matrixWorldInverse;
    for (let t = 0, f = e.length; t < f; t++) {
      let f = e[t];
      if (f.isDirectionalLight) {
        let e = r.directional[n];
        (e.direction.setFromMatrixPosition(f.matrixWorld),
          i.setFromMatrixPosition(f.target.matrixWorld),
          e.direction.sub(i),
          e.direction.transformDirection(d),
          n++);
      } else if (f.isSpotLight) {
        let e = r.spot[c];
        (e.position.setFromMatrixPosition(f.matrixWorld),
          e.position.applyMatrix4(d),
          e.direction.setFromMatrixPosition(f.matrixWorld),
          i.setFromMatrixPosition(f.target.matrixWorld),
          e.direction.sub(i),
          e.direction.transformDirection(d),
          c++);
      } else if (f.isRectAreaLight) {
        let e = r.rectArea[l];
        (e.position.setFromMatrixPosition(f.matrixWorld),
          e.position.applyMatrix4(d),
          o.identity(),
          a.copy(f.matrixWorld),
          a.premultiply(d),
          o.extractRotation(a),
          e.halfWidth.set(f.width * 0.5, 0, 0),
          e.halfHeight.set(0, f.height * 0.5, 0),
          e.halfWidth.applyMatrix4(o),
          e.halfHeight.applyMatrix4(o),
          l++);
      } else if (f.isPointLight) {
        let e = r.point[s];
        (e.position.setFromMatrixPosition(f.matrixWorld), e.position.applyMatrix4(d), s++);
      } else if (f.isHemisphereLight) {
        let e = r.hemi[u];
        (e.direction.setFromMatrixPosition(f.matrixWorld), e.direction.transformDirection(d), u++);
      }
    }
  }
  return {
    setup: s,
    setupView: c,
    state: r
  };
}
function su(e) {
  let t = new ou(e),
    n = [],
    r = [],
    i = [];
  function a(e) {
    ((d.camera = e), (n.length = 0), (r.length = 0), (i.length = 0));
  }
  function o(e) {
    n.push(e);
  }
  function s(e) {
    r.push(e);
  }
  function c(e) {
    i.push(e);
  }
  function l() {
    t.setup(n);
  }
  function u(e) {
    t.setupView(n, e);
  }
  let d = {
    lightsArray: n,
    shadowsArray: r,
    lightProbeGridArray: i,
    camera: null,
    lights: t,
    transmissionRenderTarget: {},
    textureUnits: 0
  };
  return {
    init: a,
    state: d,
    setupLights: l,
    setupLightsView: u,
    pushLight: o,
    pushShadow: s,
    pushLightProbeGrid: c
  };
}
function cu(e) {
  let t = /* @__PURE__ */ new WeakMap();
  function n(n, r = 0) {
    let i = t.get(n),
      a;
    return (
      i === void 0
        ? ((a = new su(e)), t.set(n, [a]))
        : r >= i.length
          ? ((a = new su(e)), i.push(a))
          : (a = i[r]),
      a
    );
  }
  function r() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: r
  };
}
var lu = 'void main() {\n	gl_Position = vec4( position, 1.0 );\n}',
  uu =
    'uniform sampler2D shadow_pass;\nuniform vec2 resolution;\nuniform float radius;\nvoid main() {\n	const float samples = float( VSM_SAMPLES );\n	float mean = 0.0;\n	float squared_mean = 0.0;\n	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );\n	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;\n	for ( float i = 0.0; i < samples; i ++ ) {\n		float uvOffset = uvStart + i * uvStride;\n		#ifdef HORIZONTAL_PASS\n			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;\n			mean += distribution.x;\n			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;\n		#else\n			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;\n			mean += depth;\n			squared_mean += depth * depth;\n		#endif\n	}\n	mean = mean / samples;\n	squared_mean = squared_mean / samples;\n	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );\n	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );\n}',
  du = [
    /*@__PURE__*/ new J(1, 0, 0),
    /*@__PURE__*/ new J(-1, 0, 0),
    /*@__PURE__*/ new J(0, 1, 0),
    /*@__PURE__*/ new J(0, -1, 0),
    /*@__PURE__*/ new J(0, 0, 1),
    /*@__PURE__*/ new J(0, 0, -1)
  ],
  fu = [
    /*@__PURE__*/ new J(0, -1, 0),
    /*@__PURE__*/ new J(0, -1, 0),
    /*@__PURE__*/ new J(0, 0, 1),
    /*@__PURE__*/ new J(0, 0, -1),
    /*@__PURE__*/ new J(0, -1, 0),
    /*@__PURE__*/ new J(0, -1, 0)
  ],
  pu = /*@__PURE__*/ new Jt(),
  mu = /*@__PURE__*/ new J(),
  hu = /*@__PURE__*/ new J();
function gu(e, t, n) {
  let r = new mi(),
    i = new q(),
    o = new q(),
    s = new Ut(),
    l = new eo(),
    u = new to(),
    d = {},
    f = n.maxTextureSize,
    p = {
      0: 1,
      1: 0,
      2: 2
    },
    m = new Ya({
      defines: { VSM_SAMPLES: 8 },
      uniforms: {
        shadow_pass: { value: null },
        resolution: { value: new q() },
        radius: { value: 4 }
      },
      vertexShader: lu,
      fragmentShader: uu
    }),
    h = m.clone();
  h.defines.HORIZONTAL_PASS = 1;
  let y = new Tr();
  y.setAttribute('position', new ur(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3));
  let b = new Jr(y, m),
    x = this;
  ((this.enabled = !1), (this.autoUpdate = !0), (this.needsUpdate = !1), (this.type = 1));
  let S = this.type;
  this.render = function (t, n, l) {
    if (x.enabled === !1 || (x.autoUpdate === !1 && x.needsUpdate === !1) || t.length === 0) return;
    this.type === 2 &&
      (W('WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.'),
      (this.type = 1));
    let u = e.getRenderTarget(),
      d = e.getActiveCubeFace(),
      p = e.getActiveMipmapLevel(),
      m = e.state;
    (m.setBlending(0),
      m.buffers.depth.getReversed() === !0
        ? m.buffers.color.setClear(0, 0, 0, 0)
        : m.buffers.color.setClear(1, 1, 1, 1),
      m.buffers.depth.setTest(!0),
      m.setScissorTest(!1));
    let h = S !== this.type;
    h &&
      n.traverse(function (e) {
        e.material &&
          (Array.isArray(e.material)
            ? e.material.forEach((e) => (e.needsUpdate = !0))
            : (e.material.needsUpdate = !0));
      });
    for (let u = 0, d = t.length; u < d; u++) {
      let d = t[u],
        p = d.shadow;
      if (p === void 0) {
        W('WebGLShadowMap:', d, 'has no shadow.');
        continue;
      }
      if (p.autoUpdate === !1 && p.needsUpdate === !1) continue;
      i.copy(p.mapSize);
      let y = p.getFrameExtents();
      (i.multiply(y),
        o.copy(p.mapSize),
        (i.x > f || i.y > f) &&
          (i.x > f && ((o.x = Math.floor(f / y.x)), (i.x = o.x * y.x), (p.mapSize.x = o.x)),
          i.y > f && ((o.y = Math.floor(f / y.y)), (i.y = o.y * y.y), (p.mapSize.y = o.y))));
      let b = e.state.buffers.depth.getReversed();
      if (((p.camera._reversedDepth = b), p.map === null || h === !0)) {
        if (
          (p.map !== null &&
            (p.map.depthTexture !== null &&
              (p.map.depthTexture.dispose(), (p.map.depthTexture = null)),
            p.map.dispose()),
          this.type === 3)
        ) {
          if (d.isPointLight) {
            W(
              'WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.'
            );
            continue;
          }
          ((p.map = new Gt(i.x, i.y, {
            format: j,
            type: v,
            minFilter: c,
            magFilter: c,
            generateMipmaps: !1
          })),
            (p.map.texture.name = d.name + '.shadowMap'),
            (p.map.depthTexture = new _i(i.x, i.y, _)),
            (p.map.depthTexture.name = d.name + '.shadowMapDepth'),
            (p.map.depthTexture.format = D),
            (p.map.depthTexture.compareFunction = null),
            (p.map.depthTexture.minFilter = a),
            (p.map.depthTexture.magFilter = a));
        } else
          (d.isPointLight
            ? ((p.map = new qs(i.x)), (p.map.depthTexture = new vi(i.x, g)))
            : ((p.map = new Gt(i.x, i.y)), (p.map.depthTexture = new _i(i.x, i.y, g))),
            (p.map.depthTexture.name = d.name + '.shadowMap'),
            (p.map.depthTexture.format = D),
            this.type === 1
              ? ((p.map.depthTexture.compareFunction = b ? 518 : 515),
                (p.map.depthTexture.minFilter = c),
                (p.map.depthTexture.magFilter = c))
              : ((p.map.depthTexture.compareFunction = null),
                (p.map.depthTexture.minFilter = a),
                (p.map.depthTexture.magFilter = a)));
        p.camera.updateProjectionMatrix();
      }
      let x = p.map.isWebGLCubeRenderTarget ? 6 : 1;
      for (let t = 0; t < x; t++) {
        if (p.map.isWebGLCubeRenderTarget) (e.setRenderTarget(p.map, t), e.clear());
        else {
          t === 0 && (e.setRenderTarget(p.map), e.clear());
          let n = p.getViewport(t);
          (s.set(o.x * n.x, o.y * n.y, o.x * n.z, o.y * n.w), m.viewport(s));
        }
        if (d.isPointLight) {
          let e = p.camera,
            n = p.matrix,
            r = d.distance || e.far;
          (r !== e.far && ((e.far = r), e.updateProjectionMatrix()),
            mu.setFromMatrixPosition(d.matrixWorld),
            e.position.copy(mu),
            hu.copy(e.position),
            hu.add(du[t]),
            e.up.copy(fu[t]),
            e.lookAt(hu),
            e.updateMatrixWorld(),
            n.makeTranslation(-mu.x, -mu.y, -mu.z),
            pu.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse),
            p._frustum.setFromProjectionMatrix(pu, e.coordinateSystem, e.reversedDepth));
        } else p.updateMatrices(d);
        ((r = p.getFrustum()), T(n, l, p.camera, d, this.type));
      }
      (p.isPointLightShadow !== !0 && this.type === 3 && C(p, l), (p.needsUpdate = !1));
    }
    ((S = this.type), (x.needsUpdate = !1), e.setRenderTarget(u, d, p));
  };
  function C(n, r) {
    let a = t.update(b);
    (m.defines.VSM_SAMPLES !== n.blurSamples &&
      ((m.defines.VSM_SAMPLES = n.blurSamples),
      (h.defines.VSM_SAMPLES = n.blurSamples),
      (m.needsUpdate = !0),
      (h.needsUpdate = !0)),
      n.mapPass === null &&
        (n.mapPass = new Gt(i.x, i.y, {
          format: j,
          type: v
        })),
      (m.uniforms.shadow_pass.value = n.map.depthTexture),
      (m.uniforms.resolution.value = n.mapSize),
      (m.uniforms.radius.value = n.radius),
      e.setRenderTarget(n.mapPass),
      e.clear(),
      e.renderBufferDirect(r, null, a, m, b, null),
      (h.uniforms.shadow_pass.value = n.mapPass.texture),
      (h.uniforms.resolution.value = n.mapSize),
      (h.uniforms.radius.value = n.radius),
      e.setRenderTarget(n.map),
      e.clear(),
      e.renderBufferDirect(r, null, a, h, b, null));
  }
  function w(t, n, r, i) {
    let a = null,
      o = r.isPointLight === !0 ? t.customDistanceMaterial : t.customDepthMaterial;
    if (o !== void 0) a = o;
    else if (
      ((a = r.isPointLight === !0 ? u : l),
      (e.localClippingEnabled &&
        n.clipShadows === !0 &&
        Array.isArray(n.clippingPlanes) &&
        n.clippingPlanes.length !== 0) ||
        (n.displacementMap && n.displacementScale !== 0) ||
        (n.alphaMap && n.alphaTest > 0) ||
        (n.map && n.alphaTest > 0) ||
        n.alphaToCoverage === !0)
    ) {
      let e = a.uuid,
        t = n.uuid,
        r = d[e];
      r === void 0 && ((r = {}), (d[e] = r));
      let i = r[t];
      (i === void 0 && ((i = a.clone()), (r[t] = i), n.addEventListener('dispose', E)), (a = i));
    }
    if (
      ((a.visible = n.visible),
      (a.wireframe = n.wireframe),
      i === 3
        ? (a.side = n.shadowSide === null ? n.side : n.shadowSide)
        : (a.side = n.shadowSide === null ? p[n.side] : n.shadowSide),
      (a.alphaMap = n.alphaMap),
      (a.alphaTest = n.alphaToCoverage === !0 ? 0.5 : n.alphaTest),
      (a.map = n.map),
      (a.clipShadows = n.clipShadows),
      (a.clippingPlanes = n.clippingPlanes),
      (a.clipIntersection = n.clipIntersection),
      (a.displacementMap = n.displacementMap),
      (a.displacementScale = n.displacementScale),
      (a.displacementBias = n.displacementBias),
      (a.wireframeLinewidth = n.wireframeLinewidth),
      (a.linewidth = n.linewidth),
      r.isPointLight === !0 && a.isMeshDistanceMaterial === !0)
    ) {
      let t = e.properties.get(a);
      t.light = r;
    }
    return a;
  }
  function T(n, i, a, o, s) {
    if (n.visible === !1) return;
    if (
      n.layers.test(i.layers) &&
      (n.isMesh || n.isLine || n.isPoints) &&
      (n.castShadow || (n.receiveShadow && s === 3)) &&
      (!n.frustumCulled || r.intersectsObject(n))
    ) {
      n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse, n.matrixWorld);
      let r = t.update(n),
        c = n.material;
      if (Array.isArray(c)) {
        let t = r.groups;
        for (let l = 0, u = t.length; l < u; l++) {
          let u = t[l],
            d = c[u.materialIndex];
          if (d && d.visible) {
            let t = w(n, d, o, s);
            (n.onBeforeShadow(e, n, i, a, r, t, u),
              e.renderBufferDirect(a, null, r, t, n, u),
              n.onAfterShadow(e, n, i, a, r, t, u));
          }
        }
      } else if (c.visible) {
        let t = w(n, c, o, s);
        (n.onBeforeShadow(e, n, i, a, r, t, null),
          e.renderBufferDirect(a, null, r, t, n, null),
          n.onAfterShadow(e, n, i, a, r, t, null));
      }
    }
    let c = n.children;
    for (let e = 0, t = c.length; e < t; e++) T(c[e], i, a, o, s);
  }
  function E(e) {
    e.target.removeEventListener('dispose', E);
    for (let t in d) {
      let n = d[t],
        r = e.target.uuid;
      r in n && (n[r].dispose(), delete n[r]);
    }
  }
}
function _u(e, t) {
  function n() {
    let t = !1,
      n = new Ut(),
      r = null,
      i = new Ut(0, 0, 0, 0);
    return {
      setMask: function (n) {
        r !== n && !t && (e.colorMask(n, n, n, n), (r = n));
      },
      setLocked: function (e) {
        t = e;
      },
      setClear: function (t, r, a, o, s) {
        (s === !0 && ((t *= o), (r *= o), (a *= o)),
          n.set(t, r, a, o),
          i.equals(n) === !1 && (e.clearColor(t, r, a, o), i.copy(n)));
      },
      reset: function () {
        ((t = !1), (r = null), i.set(-1, 0, 0, 0));
      }
    };
  }
  function r() {
    let n = !1,
      r = !1,
      i = null,
      a = null,
      o = null;
    return {
      setReversed: function (e) {
        if (r !== e) {
          let n = t.get('EXT_clip_control');
          (e
            ? n.clipControlEXT(n.LOWER_LEFT_EXT, n.ZERO_TO_ONE_EXT)
            : n.clipControlEXT(n.LOWER_LEFT_EXT, n.NEGATIVE_ONE_TO_ONE_EXT),
            (r = e));
          let i = o;
          ((o = null), this.setClear(i));
        }
      },
      getReversed: function () {
        return r;
      },
      setTest: function (t) {
        t ? z(e.DEPTH_TEST) : ae(e.DEPTH_TEST);
      },
      setMask: function (t) {
        i !== t && !n && (e.depthMask(t), (i = t));
      },
      setFunc: function (t) {
        if ((r && (t = Ze[t]), a !== t)) {
          switch (t) {
            case 0:
              e.depthFunc(e.NEVER);
              break;
            case 1:
              e.depthFunc(e.ALWAYS);
              break;
            case 2:
              e.depthFunc(e.LESS);
              break;
            case 3:
              e.depthFunc(e.LEQUAL);
              break;
            case 4:
              e.depthFunc(e.EQUAL);
              break;
            case 5:
              e.depthFunc(e.GEQUAL);
              break;
            case 6:
              e.depthFunc(e.GREATER);
              break;
            case 7:
              e.depthFunc(e.NOTEQUAL);
              break;
            default:
              e.depthFunc(e.LEQUAL);
          }
          a = t;
        }
      },
      setLocked: function (e) {
        n = e;
      },
      setClear: function (t) {
        o !== t && ((o = t), r && (t = 1 - t), e.clearDepth(t));
      },
      reset: function () {
        ((n = !1), (i = null), (a = null), (o = null), (r = !1));
      }
    };
  }
  function i() {
    let t = !1,
      n = null,
      r = null,
      i = null,
      a = null,
      o = null,
      s = null,
      c = null,
      l = null;
    return {
      setTest: function (n) {
        t || (n ? z(e.STENCIL_TEST) : ae(e.STENCIL_TEST));
      },
      setMask: function (r) {
        n !== r && !t && (e.stencilMask(r), (n = r));
      },
      setFunc: function (t, n, o) {
        (r !== t || i !== n || a !== o) && (e.stencilFunc(t, n, o), (r = t), (i = n), (a = o));
      },
      setOp: function (t, n, r) {
        (o !== t || s !== n || c !== r) && (e.stencilOp(t, n, r), (o = t), (s = n), (c = r));
      },
      setLocked: function (e) {
        t = e;
      },
      setClear: function (t) {
        l !== t && (e.clearStencil(t), (l = t));
      },
      reset: function () {
        ((t = !1),
          (n = null),
          (r = null),
          (i = null),
          (a = null),
          (o = null),
          (s = null),
          (c = null),
          (l = null));
      }
    };
  }
  let a = new n(),
    o = new r(),
    s = new i(),
    c = /* @__PURE__ */ new WeakMap(),
    l = /* @__PURE__ */ new WeakMap(),
    u = {},
    d = {},
    f = {},
    p = /* @__PURE__ */ new WeakMap(),
    m = [],
    h = null,
    g = !1,
    _ = null,
    v = null,
    y = null,
    b = null,
    x = null,
    S = null,
    C = null,
    w = new X(0, 0, 0),
    T = 0,
    E = !1,
    D = null,
    O = null,
    k = null,
    A = null,
    j = null,
    M = e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
    N = !1,
    P = 0,
    F = e.getParameter(e.VERSION);
  F.indexOf('WebGL') === -1
    ? F.indexOf('OpenGL ES') !== -1 &&
      ((P = parseFloat(/^OpenGL ES (\d)/.exec(F)[1])), (N = P >= 2))
    : ((P = parseFloat(/^WebGL (\d)/.exec(F)[1])), (N = P >= 1));
  let I = null,
    ee = {},
    te = e.getParameter(e.SCISSOR_BOX),
    ne = e.getParameter(e.VIEWPORT),
    re = new Ut().fromArray(te),
    L = new Ut().fromArray(ne);
  function R(t, n, r, i) {
    let a = new Uint8Array(4),
      o = e.createTexture();
    (e.bindTexture(t, o),
      e.texParameteri(t, e.TEXTURE_MIN_FILTER, e.NEAREST),
      e.texParameteri(t, e.TEXTURE_MAG_FILTER, e.NEAREST));
    for (let o = 0; o < r; o++)
      t === e.TEXTURE_3D || t === e.TEXTURE_2D_ARRAY
        ? e.texImage3D(n, 0, e.RGBA, 1, 1, i, 0, e.RGBA, e.UNSIGNED_BYTE, a)
        : e.texImage2D(n + o, 0, e.RGBA, 1, 1, 0, e.RGBA, e.UNSIGNED_BYTE, a);
    return o;
  }
  let ie = {};
  ((ie[e.TEXTURE_2D] = R(e.TEXTURE_2D, e.TEXTURE_2D, 1)),
    (ie[e.TEXTURE_CUBE_MAP] = R(e.TEXTURE_CUBE_MAP, e.TEXTURE_CUBE_MAP_POSITIVE_X, 6)),
    (ie[e.TEXTURE_2D_ARRAY] = R(e.TEXTURE_2D_ARRAY, e.TEXTURE_2D_ARRAY, 1, 1)),
    (ie[e.TEXTURE_3D] = R(e.TEXTURE_3D, e.TEXTURE_3D, 1, 1)),
    a.setClear(0, 0, 0, 1),
    o.setClear(1),
    s.setClear(0),
    z(e.DEPTH_TEST),
    o.setFunc(3),
    pe(!1),
    me(1),
    z(e.CULL_FACE),
    de(0));
  function z(t) {
    u[t] !== !0 && (e.enable(t), (u[t] = !0));
  }
  function ae(t) {
    u[t] !== !1 && (e.disable(t), (u[t] = !1));
  }
  function oe(t, n) {
    return f[t] === n
      ? !1
      : (e.bindFramebuffer(t, n),
        (f[t] = n),
        t === e.DRAW_FRAMEBUFFER && (f[e.FRAMEBUFFER] = n),
        t === e.FRAMEBUFFER && (f[e.DRAW_FRAMEBUFFER] = n),
        !0);
  }
  function se(t, n) {
    let r = m,
      i = !1;
    if (t) {
      ((r = p.get(n)), r === void 0 && ((r = []), p.set(n, r)));
      let a = t.textures;
      if (r.length !== a.length || r[0] !== e.COLOR_ATTACHMENT0) {
        for (let t = 0, n = a.length; t < n; t++) r[t] = e.COLOR_ATTACHMENT0 + t;
        ((r.length = a.length), (i = !0));
      }
    } else r[0] !== e.BACK && ((r[0] = e.BACK), (i = !0));
    i && e.drawBuffers(r);
  }
  function ce(t) {
    return h === t ? !1 : (e.useProgram(t), (h = t), !0);
  }
  let le = {
    100: e.FUNC_ADD,
    101: e.FUNC_SUBTRACT,
    102: e.FUNC_REVERSE_SUBTRACT
  };
  ((le[103] = e.MIN), (le[104] = e.MAX));
  let ue = {
    200: e.ZERO,
    201: e.ONE,
    202: e.SRC_COLOR,
    204: e.SRC_ALPHA,
    210: e.SRC_ALPHA_SATURATE,
    208: e.DST_COLOR,
    206: e.DST_ALPHA,
    203: e.ONE_MINUS_SRC_COLOR,
    205: e.ONE_MINUS_SRC_ALPHA,
    209: e.ONE_MINUS_DST_COLOR,
    207: e.ONE_MINUS_DST_ALPHA,
    211: e.CONSTANT_COLOR,
    212: e.ONE_MINUS_CONSTANT_COLOR,
    213: e.CONSTANT_ALPHA,
    214: e.ONE_MINUS_CONSTANT_ALPHA
  };
  function de(t, n, r, i, a, o, s, c, l, u) {
    if (t === 0) {
      g === !0 && (ae(e.BLEND), (g = !1));
      return;
    }
    if ((g === !1 && (z(e.BLEND), (g = !0)), t !== 5)) {
      if (t !== _ || u !== E) {
        if (((v !== 100 || x !== 100) && (e.blendEquation(e.FUNC_ADD), (v = 100), (x = 100)), u))
          switch (t) {
            case 1:
              e.blendFuncSeparate(e.ONE, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
              break;
            case 2:
              e.blendFunc(e.ONE, e.ONE);
              break;
            case 3:
              e.blendFuncSeparate(e.ZERO, e.ONE_MINUS_SRC_COLOR, e.ZERO, e.ONE);
              break;
            case 4:
              e.blendFuncSeparate(e.DST_COLOR, e.ONE_MINUS_SRC_ALPHA, e.ZERO, e.ONE);
              break;
            default:
              G('WebGLState: Invalid blending: ', t);
              break;
          }
        else
          switch (t) {
            case 1:
              e.blendFuncSeparate(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
              break;
            case 2:
              e.blendFuncSeparate(e.SRC_ALPHA, e.ONE, e.ONE, e.ONE);
              break;
            case 3:
              G('WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true');
              break;
            case 4:
              G('WebGLState: MultiplyBlending requires material.premultipliedAlpha = true');
              break;
            default:
              G('WebGLState: Invalid blending: ', t);
              break;
          }
        ((y = null), (b = null), (S = null), (C = null), w.set(0, 0, 0), (T = 0), (_ = t), (E = u));
      }
      return;
    }
    ((a ||= n),
      (o ||= r),
      (s ||= i),
      (n !== v || a !== x) && (e.blendEquationSeparate(le[n], le[a]), (v = n), (x = a)),
      (r !== y || i !== b || o !== S || s !== C) &&
        (e.blendFuncSeparate(ue[r], ue[i], ue[o], ue[s]), (y = r), (b = i), (S = o), (C = s)),
      (c.equals(w) === !1 || l !== T) && (e.blendColor(c.r, c.g, c.b, l), w.copy(c), (T = l)),
      (_ = t),
      (E = !1));
  }
  function fe(t, n) {
    t.side === 2 ? ae(e.CULL_FACE) : z(e.CULL_FACE);
    let r = t.side === 1;
    (n && (r = !r),
      pe(r),
      t.blending === 1 && t.transparent === !1
        ? de(0)
        : de(
            t.blending,
            t.blendEquation,
            t.blendSrc,
            t.blendDst,
            t.blendEquationAlpha,
            t.blendSrcAlpha,
            t.blendDstAlpha,
            t.blendColor,
            t.blendAlpha,
            t.premultipliedAlpha
          ),
      o.setFunc(t.depthFunc),
      o.setTest(t.depthTest),
      o.setMask(t.depthWrite),
      a.setMask(t.colorWrite));
    let i = t.stencilWrite;
    (s.setTest(i),
      i &&
        (s.setMask(t.stencilWriteMask),
        s.setFunc(t.stencilFunc, t.stencilRef, t.stencilFuncMask),
        s.setOp(t.stencilFail, t.stencilZFail, t.stencilZPass)),
      ge(t.polygonOffset, t.polygonOffsetFactor, t.polygonOffsetUnits),
      t.alphaToCoverage === !0 ? z(e.SAMPLE_ALPHA_TO_COVERAGE) : ae(e.SAMPLE_ALPHA_TO_COVERAGE));
  }
  function pe(t) {
    D !== t && (t ? e.frontFace(e.CW) : e.frontFace(e.CCW), (D = t));
  }
  function me(t) {
    (t === 0
      ? ae(e.CULL_FACE)
      : (z(e.CULL_FACE),
        t !== O &&
          (t === 1
            ? e.cullFace(e.BACK)
            : t === 2
              ? e.cullFace(e.FRONT)
              : e.cullFace(e.FRONT_AND_BACK))),
      (O = t));
  }
  function he(t) {
    t !== k && (N && e.lineWidth(t), (k = t));
  }
  function ge(t, n, r) {
    t
      ? (z(e.POLYGON_OFFSET_FILL),
        (A !== n || j !== r) &&
          ((A = n), (j = r), o.getReversed() && (n = -n), e.polygonOffset(n, r)))
      : ae(e.POLYGON_OFFSET_FILL);
  }
  function _e(t) {
    t ? z(e.SCISSOR_TEST) : ae(e.SCISSOR_TEST);
  }
  function ve(t) {
    (t === void 0 && (t = e.TEXTURE0 + M - 1), I !== t && (e.activeTexture(t), (I = t)));
  }
  function ye(t, n, r) {
    r === void 0 && (r = I === null ? e.TEXTURE0 + M - 1 : I);
    let i = ee[r];
    (i === void 0 &&
      ((i = {
        type: void 0,
        texture: void 0
      }),
      (ee[r] = i)),
      (i.type !== t || i.texture !== n) &&
        (I !== r && (e.activeTexture(r), (I = r)),
        e.bindTexture(t, n || ie[t]),
        (i.type = t),
        (i.texture = n)));
  }
  function be() {
    let t = ee[I];
    t !== void 0 &&
      t.type !== void 0 &&
      (e.bindTexture(t.type, null), (t.type = void 0), (t.texture = void 0));
  }
  function xe() {
    try {
      e.compressedTexImage2D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function Se() {
    try {
      e.compressedTexImage3D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function Ce() {
    try {
      e.texSubImage2D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function we() {
    try {
      e.texSubImage3D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function Te() {
    try {
      e.compressedTexSubImage2D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function B() {
    try {
      e.compressedTexSubImage3D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function Ee() {
    try {
      e.texStorage2D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function De() {
    try {
      e.texStorage3D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function Oe() {
    try {
      e.texImage2D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function V() {
    try {
      e.texImage3D(...arguments);
    } catch (e) {
      G('WebGLState:', e);
    }
  }
  function ke(t) {
    return d[t] === void 0 ? e.getParameter(t) : d[t];
  }
  function H(t, n) {
    d[t] !== n && (e.pixelStorei(t, n), (d[t] = n));
  }
  function U(t) {
    re.equals(t) === !1 && (e.scissor(t.x, t.y, t.z, t.w), re.copy(t));
  }
  function Ae(t) {
    L.equals(t) === !1 && (e.viewport(t.x, t.y, t.z, t.w), L.copy(t));
  }
  function je(t, n) {
    let r = l.get(n);
    r === void 0 && ((r = /* @__PURE__ */ new WeakMap()), l.set(n, r));
    let i = r.get(t);
    i === void 0 && ((i = e.getUniformBlockIndex(n, t.name)), r.set(t, i));
  }
  function Me(t, n) {
    let r = l.get(n).get(t);
    c.get(n) !== r && (e.uniformBlockBinding(n, r, t.__bindingPointIndex), c.set(n, r));
  }
  function Ne() {
    (e.disable(e.BLEND),
      e.disable(e.CULL_FACE),
      e.disable(e.DEPTH_TEST),
      e.disable(e.POLYGON_OFFSET_FILL),
      e.disable(e.SCISSOR_TEST),
      e.disable(e.STENCIL_TEST),
      e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),
      e.blendEquation(e.FUNC_ADD),
      e.blendFunc(e.ONE, e.ZERO),
      e.blendFuncSeparate(e.ONE, e.ZERO, e.ONE, e.ZERO),
      e.blendColor(0, 0, 0, 0),
      e.colorMask(!0, !0, !0, !0),
      e.clearColor(0, 0, 0, 0),
      e.depthMask(!0),
      e.depthFunc(e.LESS),
      o.setReversed(!1),
      e.clearDepth(1),
      e.stencilMask(4294967295),
      e.stencilFunc(e.ALWAYS, 0, 4294967295),
      e.stencilOp(e.KEEP, e.KEEP, e.KEEP),
      e.clearStencil(0),
      e.cullFace(e.BACK),
      e.frontFace(e.CCW),
      e.polygonOffset(0, 0),
      e.activeTexture(e.TEXTURE0),
      e.bindFramebuffer(e.FRAMEBUFFER, null),
      e.bindFramebuffer(e.DRAW_FRAMEBUFFER, null),
      e.bindFramebuffer(e.READ_FRAMEBUFFER, null),
      e.useProgram(null),
      e.lineWidth(1),
      e.scissor(0, 0, e.canvas.width, e.canvas.height),
      e.viewport(0, 0, e.canvas.width, e.canvas.height),
      e.pixelStorei(e.PACK_ALIGNMENT, 4),
      e.pixelStorei(e.UNPACK_ALIGNMENT, 4),
      e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !1),
      e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1),
      e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, e.BROWSER_DEFAULT_WEBGL),
      e.pixelStorei(e.PACK_ROW_LENGTH, 0),
      e.pixelStorei(e.PACK_SKIP_PIXELS, 0),
      e.pixelStorei(e.PACK_SKIP_ROWS, 0),
      e.pixelStorei(e.UNPACK_ROW_LENGTH, 0),
      e.pixelStorei(e.UNPACK_IMAGE_HEIGHT, 0),
      e.pixelStorei(e.UNPACK_SKIP_PIXELS, 0),
      e.pixelStorei(e.UNPACK_SKIP_ROWS, 0),
      e.pixelStorei(e.UNPACK_SKIP_IMAGES, 0),
      (u = {}),
      (d = {}),
      (I = null),
      (ee = {}),
      (f = {}),
      (p = /* @__PURE__ */ new WeakMap()),
      (m = []),
      (h = null),
      (g = !1),
      (_ = null),
      (v = null),
      (y = null),
      (b = null),
      (x = null),
      (S = null),
      (C = null),
      (w = new X(0, 0, 0)),
      (T = 0),
      (E = !1),
      (D = null),
      (O = null),
      (k = null),
      (A = null),
      (j = null),
      re.set(0, 0, e.canvas.width, e.canvas.height),
      L.set(0, 0, e.canvas.width, e.canvas.height),
      a.reset(),
      o.reset(),
      s.reset());
  }
  return {
    buffers: {
      color: a,
      depth: o,
      stencil: s
    },
    enable: z,
    disable: ae,
    bindFramebuffer: oe,
    drawBuffers: se,
    useProgram: ce,
    setBlending: de,
    setMaterial: fe,
    setFlipSided: pe,
    setCullFace: me,
    setLineWidth: he,
    setPolygonOffset: ge,
    setScissorTest: _e,
    activeTexture: ve,
    bindTexture: ye,
    unbindTexture: be,
    compressedTexImage2D: xe,
    compressedTexImage3D: Se,
    texImage2D: Oe,
    texImage3D: V,
    pixelStorei: H,
    getParameter: ke,
    updateUBOMapping: je,
    uniformBlockBinding: Me,
    texStorage2D: Ee,
    texStorage3D: De,
    texSubImage2D: Ce,
    texSubImage3D: we,
    compressedTexSubImage2D: Te,
    compressedTexSubImage3D: B,
    scissor: U,
    viewport: Ae,
    reset: Ne
  };
}
function vu(e, t, d, f, p, m, h) {
  let g = t.has('WEBGL_multisampled_render_to_texture')
      ? t.get('WEBGL_multisampled_render_to_texture')
      : null,
    _ = typeof navigator > 'u' ? !1 : /OculusBrowser/g.test(navigator.userAgent),
    v = new q(),
    y = /* @__PURE__ */ new WeakMap(),
    b = /* @__PURE__ */ new Set(),
    x,
    S = /* @__PURE__ */ new WeakMap(),
    C = !1;
  try {
    C = typeof OffscreenCanvas < 'u' && new OffscreenCanvas(1, 1).getContext('2d') !== null;
  } catch {}
  function w(e, t) {
    return C ? new OffscreenCanvas(e, t) : Ue('canvas');
  }
  function T(e, t, n) {
    let r = 1,
      i = ke(e);
    if (((i.width > n || i.height > n) && (r = n / Math.max(i.width, i.height)), r < 1))
      if (
        (typeof HTMLImageElement < 'u' && e instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement < 'u' && e instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap < 'u' && e instanceof ImageBitmap) ||
        (typeof VideoFrame < 'u' && e instanceof VideoFrame)
      ) {
        let n = Math.floor(r * i.width),
          a = Math.floor(r * i.height);
        x === void 0 && (x = w(n, a));
        let o = t ? w(n, a) : x;
        return (
          (o.width = n),
          (o.height = a),
          o.getContext('2d').drawImage(e, 0, 0, n, a),
          W(
            'WebGLRenderer: Texture has been resized from (' +
              i.width +
              'x' +
              i.height +
              ') to (' +
              n +
              'x' +
              a +
              ').'
          ),
          o
        );
      } else
        return (
          'data' in e &&
            W('WebGLRenderer: Image in DataTexture is too big (' + i.width + 'x' + i.height + ').'),
          e
        );
    return e;
  }
  function E(e) {
    return e.generateMipmaps;
  }
  function D(t) {
    e.generateMipmap(t);
  }
  function k(t) {
    return t.isWebGLCubeRenderTarget
      ? e.TEXTURE_CUBE_MAP
      : t.isWebGL3DRenderTarget
        ? e.TEXTURE_3D
        : t.isWebGLArrayRenderTarget || t.isCompressedArrayTexture
          ? e.TEXTURE_2D_ARRAY
          : e.TEXTURE_2D;
  }
  function A(n, r, i, a, o, s = !1) {
    if (n !== null) {
      if (e[n] !== void 0) return e[n];
      W("WebGLRenderer: Attempt to use non-existing WebGL internal format '" + n + "'");
    }
    let c;
    a &&
      ((c = t.get('EXT_texture_norm16')),
      c ||
        W('WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension'));
    let l = r;
    if (
      (r === e.RED &&
        (i === e.FLOAT && (l = e.R32F),
        i === e.HALF_FLOAT && (l = e.R16F),
        i === e.UNSIGNED_BYTE && (l = e.R8),
        i === e.UNSIGNED_SHORT && c && (l = c.R16_EXT),
        i === e.SHORT && c && (l = c.R16_SNORM_EXT)),
      r === e.RED_INTEGER &&
        (i === e.UNSIGNED_BYTE && (l = e.R8UI),
        i === e.UNSIGNED_SHORT && (l = e.R16UI),
        i === e.UNSIGNED_INT && (l = e.R32UI),
        i === e.BYTE && (l = e.R8I),
        i === e.SHORT && (l = e.R16I),
        i === e.INT && (l = e.R32I)),
      r === e.RG &&
        (i === e.FLOAT && (l = e.RG32F),
        i === e.HALF_FLOAT && (l = e.RG16F),
        i === e.UNSIGNED_BYTE && (l = e.RG8),
        i === e.UNSIGNED_SHORT && c && (l = c.RG16_EXT),
        i === e.SHORT && c && (l = c.RG16_SNORM_EXT)),
      r === e.RG_INTEGER &&
        (i === e.UNSIGNED_BYTE && (l = e.RG8UI),
        i === e.UNSIGNED_SHORT && (l = e.RG16UI),
        i === e.UNSIGNED_INT && (l = e.RG32UI),
        i === e.BYTE && (l = e.RG8I),
        i === e.SHORT && (l = e.RG16I),
        i === e.INT && (l = e.RG32I)),
      r === e.RGB_INTEGER &&
        (i === e.UNSIGNED_BYTE && (l = e.RGB8UI),
        i === e.UNSIGNED_SHORT && (l = e.RGB16UI),
        i === e.UNSIGNED_INT && (l = e.RGB32UI),
        i === e.BYTE && (l = e.RGB8I),
        i === e.SHORT && (l = e.RGB16I),
        i === e.INT && (l = e.RGB32I)),
      r === e.RGBA_INTEGER &&
        (i === e.UNSIGNED_BYTE && (l = e.RGBA8UI),
        i === e.UNSIGNED_SHORT && (l = e.RGBA16UI),
        i === e.UNSIGNED_INT && (l = e.RGBA32UI),
        i === e.BYTE && (l = e.RGBA8I),
        i === e.SHORT && (l = e.RGBA16I),
        i === e.INT && (l = e.RGBA32I)),
      r === e.RGB &&
        (i === e.UNSIGNED_SHORT && c && (l = c.RGB16_EXT),
        i === e.SHORT && c && (l = c.RGB16_SNORM_EXT),
        i === e.UNSIGNED_INT_5_9_9_9_REV && (l = e.RGB9_E5),
        i === e.UNSIGNED_INT_10F_11F_11F_REV && (l = e.R11F_G11F_B10F)),
      r === e.RGBA)
    ) {
      let t = s ? Ie : Mt.getTransfer(o);
      (i === e.FLOAT && (l = e.RGBA32F),
        i === e.HALF_FLOAT && (l = e.RGBA16F),
        i === e.UNSIGNED_BYTE && (l = t === 'srgb' ? e.SRGB8_ALPHA8 : e.RGBA8),
        i === e.UNSIGNED_SHORT && c && (l = c.RGBA16_EXT),
        i === e.SHORT && c && (l = c.RGBA16_SNORM_EXT),
        i === e.UNSIGNED_SHORT_4_4_4_4 && (l = e.RGBA4),
        i === e.UNSIGNED_SHORT_5_5_5_1 && (l = e.RGB5_A1));
    }
    return (
      (l === e.R16F ||
        l === e.R32F ||
        l === e.RG16F ||
        l === e.RG32F ||
        l === e.RGBA16F ||
        l === e.RGBA32F) &&
        t.get('EXT_color_buffer_float'),
      l
    );
  }
  function j(t, n) {
    let r;
    return (
      t
        ? n === null || n === 1014 || n === 1020
          ? (r = e.DEPTH24_STENCIL8)
          : n === 1015
            ? (r = e.DEPTH32F_STENCIL8)
            : n === 1012 &&
              ((r = e.DEPTH24_STENCIL8),
              W(
                'DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.'
              ))
        : n === null || n === 1014 || n === 1020
          ? (r = e.DEPTH_COMPONENT24)
          : n === 1015
            ? (r = e.DEPTH_COMPONENT32F)
            : n === 1012 && (r = e.DEPTH_COMPONENT16),
      r
    );
  }
  function M(e, t) {
    return E(e) === !0 || (e.isFramebufferTexture && e.minFilter !== 1003 && e.minFilter !== 1006)
      ? Math.log2(Math.max(t.width, t.height)) + 1
      : e.mipmaps !== void 0 && e.mipmaps.length > 0
        ? e.mipmaps.length
        : e.isCompressedTexture && Array.isArray(e.image)
          ? t.mipmaps.length
          : 1;
  }
  function N(e) {
    let t = e.target;
    (t.removeEventListener('dispose', N),
      F(t),
      t.isVideoTexture && y.delete(t),
      t.isHTMLTexture && b.delete(t));
  }
  function P(e) {
    let t = e.target;
    (t.removeEventListener('dispose', P), ee(t));
  }
  function F(e) {
    let t = f.get(e);
    if (t.__webglInit === void 0) return;
    let n = e.source,
      r = S.get(n);
    if (r) {
      let i = r[t.__cacheKey];
      (i.usedTimes--, i.usedTimes === 0 && I(e), Object.keys(r).length === 0 && S.delete(n));
    }
    f.remove(e);
  }
  function I(t) {
    let n = f.get(t);
    e.deleteTexture(n.__webglTexture);
    let r = t.source,
      i = S.get(r);
    (delete i[n.__cacheKey], h.memory.textures--);
  }
  function ee(t) {
    let n = f.get(t);
    if (
      (t.depthTexture && (t.depthTexture.dispose(), f.remove(t.depthTexture)),
      t.isWebGLCubeRenderTarget)
    )
      for (let t = 0; t < 6; t++) {
        if (Array.isArray(n.__webglFramebuffer[t]))
          for (let r = 0; r < n.__webglFramebuffer[t].length; r++)
            e.deleteFramebuffer(n.__webglFramebuffer[t][r]);
        else e.deleteFramebuffer(n.__webglFramebuffer[t]);
        n.__webglDepthbuffer && e.deleteRenderbuffer(n.__webglDepthbuffer[t]);
      }
    else {
      if (Array.isArray(n.__webglFramebuffer))
        for (let t = 0; t < n.__webglFramebuffer.length; t++)
          e.deleteFramebuffer(n.__webglFramebuffer[t]);
      else e.deleteFramebuffer(n.__webglFramebuffer);
      if (
        (n.__webglDepthbuffer && e.deleteRenderbuffer(n.__webglDepthbuffer),
        n.__webglMultisampledFramebuffer && e.deleteFramebuffer(n.__webglMultisampledFramebuffer),
        n.__webglColorRenderbuffer)
      )
        for (let t = 0; t < n.__webglColorRenderbuffer.length; t++)
          n.__webglColorRenderbuffer[t] && e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);
      n.__webglDepthRenderbuffer && e.deleteRenderbuffer(n.__webglDepthRenderbuffer);
    }
    let r = t.textures;
    for (let t = 0, n = r.length; t < n; t++) {
      let n = f.get(r[t]);
      (n.__webglTexture && (e.deleteTexture(n.__webglTexture), h.memory.textures--),
        f.remove(r[t]));
    }
    f.remove(t);
  }
  let te = 0;
  function ne() {
    te = 0;
  }
  function re() {
    return te;
  }
  function L(e) {
    te = e;
  }
  function R() {
    let e = te;
    return (
      e >= p.maxTextures &&
        W(
          'WebGLTextures: Trying to use ' +
            e +
            ' texture units while this GPU supports only ' +
            p.maxTextures
        ),
      (te += 1),
      e
    );
  }
  function ie(e) {
    let t = [];
    return (
      t.push(e.wrapS),
      t.push(e.wrapT),
      t.push(e.wrapR || 0),
      t.push(e.magFilter),
      t.push(e.minFilter),
      t.push(e.anisotropy),
      t.push(e.internalFormat),
      t.push(e.format),
      t.push(e.type),
      t.push(e.generateMipmaps),
      t.push(e.premultiplyAlpha),
      t.push(e.flipY),
      t.push(e.unpackAlignment),
      t.push(e.colorSpace),
      t.join()
    );
  }
  function z(t, n) {
    let r = f.get(t);
    if (
      (t.isVideoTexture && Oe(t),
      t.isRenderTargetTexture === !1 &&
        t.isExternalTexture !== !0 &&
        t.version > 0 &&
        r.__version !== t.version)
    ) {
      let e = t.image;
      if (e === null) W('WebGLRenderer: Texture marked for update but no image data found.');
      else if (e.complete === !1)
        W('WebGLRenderer: Texture marked for update but image is incomplete');
      else {
        he(r, t, n);
        return;
      }
    } else t.isExternalTexture && (r.__webglTexture = t.sourceTexture ? t.sourceTexture : null);
    d.bindTexture(e.TEXTURE_2D, r.__webglTexture, e.TEXTURE0 + n);
  }
  function ae(t, n) {
    let r = f.get(t);
    if (t.isRenderTargetTexture === !1 && t.version > 0 && r.__version !== t.version) {
      he(r, t, n);
      return;
    } else t.isExternalTexture && (r.__webglTexture = t.sourceTexture ? t.sourceTexture : null);
    d.bindTexture(e.TEXTURE_2D_ARRAY, r.__webglTexture, e.TEXTURE0 + n);
  }
  function oe(t, n) {
    let r = f.get(t);
    if (t.isRenderTargetTexture === !1 && t.version > 0 && r.__version !== t.version) {
      he(r, t, n);
      return;
    }
    d.bindTexture(e.TEXTURE_3D, r.__webglTexture, e.TEXTURE0 + n);
  }
  function se(t, n) {
    let r = f.get(t);
    if (t.isCubeDepthTexture !== !0 && t.version > 0 && r.__version !== t.version) {
      ge(r, t, n);
      return;
    }
    d.bindTexture(e.TEXTURE_CUBE_MAP, r.__webglTexture, e.TEXTURE0 + n);
  }
  let ce = {
      [n]: e.REPEAT,
      [r]: e.CLAMP_TO_EDGE,
      [i]: e.MIRRORED_REPEAT
    },
    le = {
      [a]: e.NEAREST,
      [o]: e.NEAREST_MIPMAP_NEAREST,
      [s]: e.NEAREST_MIPMAP_LINEAR,
      [c]: e.LINEAR,
      [l]: e.LINEAR_MIPMAP_NEAREST,
      [u]: e.LINEAR_MIPMAP_LINEAR
    },
    ue = {
      512: e.NEVER,
      519: e.ALWAYS,
      513: e.LESS,
      515: e.LEQUAL,
      514: e.EQUAL,
      518: e.GEQUAL,
      516: e.GREATER,
      517: e.NOTEQUAL
    };
  function de(n, r) {
    if (
      (r.type === 1015 &&
        t.has('OES_texture_float_linear') === !1 &&
        (r.magFilter === 1006 ||
          r.magFilter === 1007 ||
          r.magFilter === 1005 ||
          r.magFilter === 1008 ||
          r.minFilter === 1006 ||
          r.minFilter === 1007 ||
          r.minFilter === 1005 ||
          r.minFilter === 1008) &&
        W(
          'WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.'
        ),
      e.texParameteri(n, e.TEXTURE_WRAP_S, ce[r.wrapS]),
      e.texParameteri(n, e.TEXTURE_WRAP_T, ce[r.wrapT]),
      (n === e.TEXTURE_3D || n === e.TEXTURE_2D_ARRAY) &&
        e.texParameteri(n, e.TEXTURE_WRAP_R, ce[r.wrapR]),
      e.texParameteri(n, e.TEXTURE_MAG_FILTER, le[r.magFilter]),
      e.texParameteri(n, e.TEXTURE_MIN_FILTER, le[r.minFilter]),
      r.compareFunction &&
        (e.texParameteri(n, e.TEXTURE_COMPARE_MODE, e.COMPARE_REF_TO_TEXTURE),
        e.texParameteri(n, e.TEXTURE_COMPARE_FUNC, ue[r.compareFunction])),
      t.has('EXT_texture_filter_anisotropic') === !0)
    ) {
      if (
        r.magFilter === 1003 ||
        (r.minFilter !== 1005 && r.minFilter !== 1008) ||
        (r.type === 1015 && t.has('OES_texture_float_linear') === !1)
      )
        return;
      if (r.anisotropy > 1 || f.get(r).__currentAnisotropy) {
        let i = t.get('EXT_texture_filter_anisotropic');
        (e.texParameterf(
          n,
          i.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(r.anisotropy, p.getMaxAnisotropy())
        ),
          (f.get(r).__currentAnisotropy = r.anisotropy));
      }
    }
  }
  function fe(t, n) {
    let r = !1;
    t.__webglInit === void 0 && ((t.__webglInit = !0), n.addEventListener('dispose', N));
    let i = n.source,
      a = S.get(i);
    a === void 0 && ((a = {}), S.set(i, a));
    let o = ie(n);
    if (o !== t.__cacheKey) {
      (a[o] === void 0 &&
        ((a[o] = {
          texture: e.createTexture(),
          usedTimes: 0
        }),
        h.memory.textures++,
        (r = !0)),
        a[o].usedTimes++);
      let i = a[t.__cacheKey];
      (i !== void 0 && (a[t.__cacheKey].usedTimes--, i.usedTimes === 0 && I(n)),
        (t.__cacheKey = o),
        (t.__webglTexture = a[o].texture));
    }
    return r;
  }
  function pe(e, t, n) {
    return Math.floor(Math.floor(e / n) / t);
  }
  function me(t, n, r, i) {
    let a = t.updateRanges;
    if (a.length === 0) d.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, n.width, n.height, r, i, n.data);
    else {
      a.sort((e, t) => e.start - t.start);
      let o = 0;
      for (let e = 1; e < a.length; e++) {
        let t = a[o],
          r = a[e],
          i = t.start + t.count,
          s = pe(r.start, n.width, 4),
          c = pe(t.start, n.width, 4);
        r.start <= i + 1 && s === c && pe(r.start + r.count - 1, n.width, 4) === s
          ? (t.count = Math.max(t.count, r.start + r.count - t.start))
          : (++o, (a[o] = r));
      }
      a.length = o + 1;
      let s = d.getParameter(e.UNPACK_ROW_LENGTH),
        c = d.getParameter(e.UNPACK_SKIP_PIXELS),
        l = d.getParameter(e.UNPACK_SKIP_ROWS);
      d.pixelStorei(e.UNPACK_ROW_LENGTH, n.width);
      for (let t = 0, o = a.length; t < o; t++) {
        let o = a[t],
          s = Math.floor(o.start / 4),
          c = Math.ceil(o.count / 4),
          l = s % n.width,
          u = Math.floor(s / n.width),
          f = c;
        (d.pixelStorei(e.UNPACK_SKIP_PIXELS, l),
          d.pixelStorei(e.UNPACK_SKIP_ROWS, u),
          d.texSubImage2D(e.TEXTURE_2D, 0, l, u, f, 1, r, i, n.data));
      }
      (t.clearUpdateRanges(),
        d.pixelStorei(e.UNPACK_ROW_LENGTH, s),
        d.pixelStorei(e.UNPACK_SKIP_PIXELS, c),
        d.pixelStorei(e.UNPACK_SKIP_ROWS, l));
    }
  }
  function he(t, n, r) {
    let i = e.TEXTURE_2D;
    ((n.isDataArrayTexture || n.isCompressedArrayTexture) && (i = e.TEXTURE_2D_ARRAY),
      n.isData3DTexture && (i = e.TEXTURE_3D));
    let a = fe(t, n),
      o = n.source;
    d.bindTexture(i, t.__webglTexture, e.TEXTURE0 + r);
    let s = f.get(o);
    if (o.version !== s.__version || a === !0) {
      if (
        (d.activeTexture(e.TEXTURE0 + r),
        !(typeof ImageBitmap < 'u' && n.image instanceof ImageBitmap))
      ) {
        let t = Mt.getPrimaries(Mt.workingColorSpace),
          r = n.colorSpace === '' ? null : Mt.getPrimaries(n.colorSpace),
          i = n.colorSpace === '' || t === r ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
        (d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, n.flipY),
          d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, n.premultiplyAlpha),
          d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, i));
      }
      d.pixelStorei(e.UNPACK_ALIGNMENT, n.unpackAlignment);
      let t = T(n.image, !1, p.maxTextureSize);
      t = V(n, t);
      let c = m.convert(n.format, n.colorSpace),
        l = m.convert(n.type),
        u = A(n.internalFormat, c, l, n.normalized, n.colorSpace, n.isVideoTexture);
      de(i, n);
      let f,
        h = n.mipmaps,
        g = n.isVideoTexture !== !0,
        _ = s.__version === void 0 || a === !0,
        v = o.dataReady,
        y = M(n, t);
      if (n.isDepthTexture)
        ((u = j(n.format === O, n.type)),
          _ &&
            (g
              ? d.texStorage2D(e.TEXTURE_2D, 1, u, t.width, t.height)
              : d.texImage2D(e.TEXTURE_2D, 0, u, t.width, t.height, 0, c, l, null)));
      else if (n.isDataTexture)
        if (h.length > 0) {
          g && _ && d.texStorage2D(e.TEXTURE_2D, y, u, h[0].width, h[0].height);
          for (let t = 0, n = h.length; t < n; t++)
            ((f = h[t]),
              g
                ? v && d.texSubImage2D(e.TEXTURE_2D, t, 0, 0, f.width, f.height, c, l, f.data)
                : d.texImage2D(e.TEXTURE_2D, t, u, f.width, f.height, 0, c, l, f.data));
          n.generateMipmaps = !1;
        } else
          g
            ? (_ && d.texStorage2D(e.TEXTURE_2D, y, u, t.width, t.height), v && me(n, t, c, l))
            : d.texImage2D(e.TEXTURE_2D, 0, u, t.width, t.height, 0, c, l, t.data);
      else if (n.isCompressedTexture)
        if (n.isCompressedArrayTexture) {
          g && _ && d.texStorage3D(e.TEXTURE_2D_ARRAY, y, u, h[0].width, h[0].height, t.depth);
          for (let r = 0, i = h.length; r < i; r++)
            if (((f = h[r]), n.format !== 1023))
              if (c !== null)
                if (g) {
                  if (v)
                    if (n.layerUpdates.size > 0) {
                      let t = ms(f.width, f.height, n.format, n.type);
                      for (let i of n.layerUpdates) {
                        let n = f.data.subarray(
                          (i * t) / f.data.BYTES_PER_ELEMENT,
                          ((i + 1) * t) / f.data.BYTES_PER_ELEMENT
                        );
                        d.compressedTexSubImage3D(
                          e.TEXTURE_2D_ARRAY,
                          r,
                          0,
                          0,
                          i,
                          f.width,
                          f.height,
                          1,
                          c,
                          n
                        );
                      }
                      n.clearLayerUpdates();
                    } else
                      d.compressedTexSubImage3D(
                        e.TEXTURE_2D_ARRAY,
                        r,
                        0,
                        0,
                        0,
                        f.width,
                        f.height,
                        t.depth,
                        c,
                        f.data
                      );
                } else
                  d.compressedTexImage3D(
                    e.TEXTURE_2D_ARRAY,
                    r,
                    u,
                    f.width,
                    f.height,
                    t.depth,
                    0,
                    f.data,
                    0,
                    0
                  );
              else
                W(
                  'WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()'
                );
            else
              g
                ? v &&
                  d.texSubImage3D(
                    e.TEXTURE_2D_ARRAY,
                    r,
                    0,
                    0,
                    0,
                    f.width,
                    f.height,
                    t.depth,
                    c,
                    l,
                    f.data
                  )
                : d.texImage3D(
                    e.TEXTURE_2D_ARRAY,
                    r,
                    u,
                    f.width,
                    f.height,
                    t.depth,
                    0,
                    c,
                    l,
                    f.data
                  );
        } else {
          g && _ && d.texStorage2D(e.TEXTURE_2D, y, u, h[0].width, h[0].height);
          for (let t = 0, r = h.length; t < r; t++)
            ((f = h[t]),
              n.format === 1023
                ? g
                  ? v && d.texSubImage2D(e.TEXTURE_2D, t, 0, 0, f.width, f.height, c, l, f.data)
                  : d.texImage2D(e.TEXTURE_2D, t, u, f.width, f.height, 0, c, l, f.data)
                : c === null
                  ? W(
                      'WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()'
                    )
                  : g
                    ? v &&
                      d.compressedTexSubImage2D(e.TEXTURE_2D, t, 0, 0, f.width, f.height, c, f.data)
                    : d.compressedTexImage2D(e.TEXTURE_2D, t, u, f.width, f.height, 0, f.data));
        }
      else if (n.isDataArrayTexture)
        if (g) {
          if ((_ && d.texStorage3D(e.TEXTURE_2D_ARRAY, y, u, t.width, t.height, t.depth), v))
            if (n.layerUpdates.size > 0) {
              let r = ms(t.width, t.height, n.format, n.type);
              for (let i of n.layerUpdates) {
                let n = t.data.subarray(
                  (i * r) / t.data.BYTES_PER_ELEMENT,
                  ((i + 1) * r) / t.data.BYTES_PER_ELEMENT
                );
                d.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, i, t.width, t.height, 1, c, l, n);
              }
              n.clearLayerUpdates();
            } else
              d.texSubImage3D(
                e.TEXTURE_2D_ARRAY,
                0,
                0,
                0,
                0,
                t.width,
                t.height,
                t.depth,
                c,
                l,
                t.data
              );
        } else d.texImage3D(e.TEXTURE_2D_ARRAY, 0, u, t.width, t.height, t.depth, 0, c, l, t.data);
      else if (n.isData3DTexture)
        g
          ? (_ && d.texStorage3D(e.TEXTURE_3D, y, u, t.width, t.height, t.depth),
            v &&
              d.texSubImage3D(e.TEXTURE_3D, 0, 0, 0, 0, t.width, t.height, t.depth, c, l, t.data))
          : d.texImage3D(e.TEXTURE_3D, 0, u, t.width, t.height, t.depth, 0, c, l, t.data);
      else if (n.isFramebufferTexture) {
        if (_)
          if (g) d.texStorage2D(e.TEXTURE_2D, y, u, t.width, t.height);
          else {
            let n = t.width,
              r = t.height;
            for (let t = 0; t < y; t++)
              (d.texImage2D(e.TEXTURE_2D, t, u, n, r, 0, c, l, null), (n >>= 1), (r >>= 1));
          }
      } else if (n.isHTMLTexture) {
        if ('texElementImage2D' in e) {
          let r = e.canvas;
          if (
            (r.hasAttribute('layoutsubtree') || r.setAttribute('layoutsubtree', 'true'),
            t.parentNode !== r)
          ) {
            (r.appendChild(t),
              b.add(n),
              (r.onpaint = (e) => {
                let t = e.changedElements;
                for (let e of b) t.includes(e.image) && (e.needsUpdate = !0);
              }),
              r.requestPaint());
            return;
          }
          let i = e.RGBA,
            a = e.RGBA,
            o = e.UNSIGNED_BYTE;
          (e.texElementImage2D(e.TEXTURE_2D, 0, i, a, o, t),
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR),
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE),
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE));
        }
      } else if (h.length > 0) {
        if (g && _) {
          let t = ke(h[0]);
          d.texStorage2D(e.TEXTURE_2D, y, u, t.width, t.height);
        }
        for (let t = 0, n = h.length; t < n; t++)
          ((f = h[t]),
            g
              ? v && d.texSubImage2D(e.TEXTURE_2D, t, 0, 0, c, l, f)
              : d.texImage2D(e.TEXTURE_2D, t, u, c, l, f));
        n.generateMipmaps = !1;
      } else if (g) {
        if (_) {
          let n = ke(t);
          d.texStorage2D(e.TEXTURE_2D, y, u, n.width, n.height);
        }
        v && d.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, c, l, t);
      } else d.texImage2D(e.TEXTURE_2D, 0, u, c, l, t);
      (E(n) && D(i), (s.__version = o.version), n.onUpdate && n.onUpdate(n));
    }
    t.__version = n.version;
  }
  function ge(t, n, r) {
    if (n.image.length !== 6) return;
    let i = fe(t, n),
      a = n.source;
    d.bindTexture(e.TEXTURE_CUBE_MAP, t.__webglTexture, e.TEXTURE0 + r);
    let o = f.get(a);
    if (a.version !== o.__version || i === !0) {
      d.activeTexture(e.TEXTURE0 + r);
      let t = Mt.getPrimaries(Mt.workingColorSpace),
        s = n.colorSpace === '' ? null : Mt.getPrimaries(n.colorSpace),
        c = n.colorSpace === '' || t === s ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
      (d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, n.flipY),
        d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, n.premultiplyAlpha),
        d.pixelStorei(e.UNPACK_ALIGNMENT, n.unpackAlignment),
        d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, c));
      let l = n.isCompressedTexture || n.image[0].isCompressedTexture,
        u = n.image[0] && n.image[0].isDataTexture,
        f = [];
      for (let e = 0; e < 6; e++)
        (!l && !u
          ? (f[e] = T(n.image[e], !0, p.maxCubemapSize))
          : (f[e] = u ? n.image[e].image : n.image[e]),
          (f[e] = V(n, f[e])));
      let h = f[0],
        g = m.convert(n.format, n.colorSpace),
        _ = m.convert(n.type),
        v = A(n.internalFormat, g, _, n.normalized, n.colorSpace),
        y = n.isVideoTexture !== !0,
        b = o.__version === void 0 || i === !0,
        x = a.dataReady,
        S = M(n, h);
      de(e.TEXTURE_CUBE_MAP, n);
      let C;
      if (l) {
        y && b && d.texStorage2D(e.TEXTURE_CUBE_MAP, S, v, h.width, h.height);
        for (let t = 0; t < 6; t++) {
          C = f[t].mipmaps;
          for (let r = 0; r < C.length; r++) {
            let i = C[r];
            n.format === 1023
              ? y
                ? x &&
                  d.texSubImage2D(
                    e.TEXTURE_CUBE_MAP_POSITIVE_X + t,
                    r,
                    0,
                    0,
                    i.width,
                    i.height,
                    g,
                    _,
                    i.data
                  )
                : d.texImage2D(
                    e.TEXTURE_CUBE_MAP_POSITIVE_X + t,
                    r,
                    v,
                    i.width,
                    i.height,
                    0,
                    g,
                    _,
                    i.data
                  )
              : g === null
                ? W(
                    'WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()'
                  )
                : y
                  ? x &&
                    d.compressedTexSubImage2D(
                      e.TEXTURE_CUBE_MAP_POSITIVE_X + t,
                      r,
                      0,
                      0,
                      i.width,
                      i.height,
                      g,
                      i.data
                    )
                  : d.compressedTexImage2D(
                      e.TEXTURE_CUBE_MAP_POSITIVE_X + t,
                      r,
                      v,
                      i.width,
                      i.height,
                      0,
                      i.data
                    );
          }
        }
      } else {
        if (((C = n.mipmaps), y && b)) {
          C.length > 0 && S++;
          let t = ke(f[0]);
          d.texStorage2D(e.TEXTURE_CUBE_MAP, S, v, t.width, t.height);
        }
        for (let t = 0; t < 6; t++)
          if (u) {
            y
              ? x &&
                d.texSubImage2D(
                  e.TEXTURE_CUBE_MAP_POSITIVE_X + t,
                  0,
                  0,
                  0,
                  f[t].width,
                  f[t].height,
                  g,
                  _,
                  f[t].data
                )
              : d.texImage2D(
                  e.TEXTURE_CUBE_MAP_POSITIVE_X + t,
                  0,
                  v,
                  f[t].width,
                  f[t].height,
                  0,
                  g,
                  _,
                  f[t].data
                );
            for (let n = 0; n < C.length; n++) {
              let r = C[n].image[t].image;
              y
                ? x &&
                  d.texSubImage2D(
                    e.TEXTURE_CUBE_MAP_POSITIVE_X + t,
                    n + 1,
                    0,
                    0,
                    r.width,
                    r.height,
                    g,
                    _,
                    r.data
                  )
                : d.texImage2D(
                    e.TEXTURE_CUBE_MAP_POSITIVE_X + t,
                    n + 1,
                    v,
                    r.width,
                    r.height,
                    0,
                    g,
                    _,
                    r.data
                  );
            }
          } else {
            y
              ? x && d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, 0, 0, g, _, f[t])
              : d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, v, g, _, f[t]);
            for (let n = 0; n < C.length; n++) {
              let r = C[n];
              y
                ? x &&
                  d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, n + 1, 0, 0, g, _, r.image[t])
                : d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + t, n + 1, v, g, _, r.image[t]);
            }
          }
      }
      (E(n) && D(e.TEXTURE_CUBE_MAP), (o.__version = a.version), n.onUpdate && n.onUpdate(n));
    }
    t.__version = n.version;
  }
  function _e(t, n, r, i, a, o) {
    let s = m.convert(r.format, r.colorSpace),
      c = m.convert(r.type),
      l = A(r.internalFormat, s, c, r.normalized, r.colorSpace),
      u = f.get(n),
      p = f.get(r);
    if (((p.__renderTarget = n), !u.__hasExternalTextures)) {
      let t = Math.max(1, n.width >> o),
        r = Math.max(1, n.height >> o);
      a === e.TEXTURE_3D || a === e.TEXTURE_2D_ARRAY
        ? d.texImage3D(a, o, l, t, r, n.depth, 0, s, c, null)
        : d.texImage2D(a, o, l, t, r, 0, s, c, null);
    }
    (d.bindFramebuffer(e.FRAMEBUFFER, t),
      De(n)
        ? g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, i, a, p.__webglTexture, 0, Ee(n))
        : (a === e.TEXTURE_2D ||
            (a >= e.TEXTURE_CUBE_MAP_POSITIVE_X && a <= e.TEXTURE_CUBE_MAP_NEGATIVE_Z)) &&
          e.framebufferTexture2D(e.FRAMEBUFFER, i, a, p.__webglTexture, o),
      d.bindFramebuffer(e.FRAMEBUFFER, null));
  }
  function ve(t, n, r) {
    if ((e.bindRenderbuffer(e.RENDERBUFFER, t), n.depthBuffer)) {
      let i = n.depthTexture,
        a = i && i.isDepthTexture ? i.type : null,
        o = j(n.stencilBuffer, a),
        s = n.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
      (De(n)
        ? g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, Ee(n), o, n.width, n.height)
        : r
          ? e.renderbufferStorageMultisample(e.RENDERBUFFER, Ee(n), o, n.width, n.height)
          : e.renderbufferStorage(e.RENDERBUFFER, o, n.width, n.height),
        e.framebufferRenderbuffer(e.FRAMEBUFFER, s, e.RENDERBUFFER, t));
    } else {
      let t = n.textures;
      for (let i = 0; i < t.length; i++) {
        let a = t[i],
          o = m.convert(a.format, a.colorSpace),
          s = m.convert(a.type),
          c = A(a.internalFormat, o, s, a.normalized, a.colorSpace);
        De(n)
          ? g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, Ee(n), c, n.width, n.height)
          : r
            ? e.renderbufferStorageMultisample(e.RENDERBUFFER, Ee(n), c, n.width, n.height)
            : e.renderbufferStorage(e.RENDERBUFFER, c, n.width, n.height);
      }
    }
    e.bindRenderbuffer(e.RENDERBUFFER, null);
  }
  function ye(t, n, r) {
    let i = n.isWebGLCubeRenderTarget === !0;
    if ((d.bindFramebuffer(e.FRAMEBUFFER, t), !(n.depthTexture && n.depthTexture.isDepthTexture)))
      throw Error('renderTarget.depthTexture must be an instance of THREE.DepthTexture');
    let a = f.get(n.depthTexture);
    if (
      ((a.__renderTarget = n),
      (!a.__webglTexture ||
        n.depthTexture.image.width !== n.width ||
        n.depthTexture.image.height !== n.height) &&
        ((n.depthTexture.image.width = n.width),
        (n.depthTexture.image.height = n.height),
        (n.depthTexture.needsUpdate = !0)),
      i)
    ) {
      if (
        (a.__webglInit === void 0 &&
          ((a.__webglInit = !0), n.depthTexture.addEventListener('dispose', N)),
        a.__webglTexture === void 0)
      ) {
        ((a.__webglTexture = e.createTexture()),
          d.bindTexture(e.TEXTURE_CUBE_MAP, a.__webglTexture),
          de(e.TEXTURE_CUBE_MAP, n.depthTexture));
        let t = m.convert(n.depthTexture.format),
          r = m.convert(n.depthTexture.type),
          i;
        n.depthTexture.format === 1026
          ? (i = e.DEPTH_COMPONENT24)
          : n.depthTexture.format === 1027 && (i = e.DEPTH24_STENCIL8);
        for (let a = 0; a < 6; a++)
          e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + a, 0, i, n.width, n.height, 0, t, r, null);
      }
    } else z(n.depthTexture, 0);
    let o = a.__webglTexture,
      s = Ee(n),
      c = i ? e.TEXTURE_CUBE_MAP_POSITIVE_X + r : e.TEXTURE_2D,
      l = n.depthTexture.format === 1027 ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
    if (n.depthTexture.format === 1026)
      De(n)
        ? g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, l, c, o, 0, s)
        : e.framebufferTexture2D(e.FRAMEBUFFER, l, c, o, 0);
    else if (n.depthTexture.format === 1027)
      De(n)
        ? g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, l, c, o, 0, s)
        : e.framebufferTexture2D(e.FRAMEBUFFER, l, c, o, 0);
    else throw Error('Unknown depthTexture format');
  }
  function be(t) {
    let n = f.get(t),
      r = t.isWebGLCubeRenderTarget === !0;
    if (n.__boundDepthTexture !== t.depthTexture) {
      let e = t.depthTexture;
      if ((n.__depthDisposeCallback && n.__depthDisposeCallback(), e)) {
        let t = () => {
          (delete n.__boundDepthTexture,
            delete n.__depthDisposeCallback,
            e.removeEventListener('dispose', t));
        };
        (e.addEventListener('dispose', t), (n.__depthDisposeCallback = t));
      }
      n.__boundDepthTexture = e;
    }
    if (t.depthTexture && !n.__autoAllocateDepthBuffer)
      if (r) for (let e = 0; e < 6; e++) ye(n.__webglFramebuffer[e], t, e);
      else {
        let e = t.texture.mipmaps;
        e && e.length > 0 ? ye(n.__webglFramebuffer[0], t, 0) : ye(n.__webglFramebuffer, t, 0);
      }
    else if (r) {
      n.__webglDepthbuffer = [];
      for (let r = 0; r < 6; r++)
        if (
          (d.bindFramebuffer(e.FRAMEBUFFER, n.__webglFramebuffer[r]),
          n.__webglDepthbuffer[r] === void 0)
        )
          ((n.__webglDepthbuffer[r] = e.createRenderbuffer()), ve(n.__webglDepthbuffer[r], t, !1));
        else {
          let i = t.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT,
            a = n.__webglDepthbuffer[r];
          (e.bindRenderbuffer(e.RENDERBUFFER, a),
            e.framebufferRenderbuffer(e.FRAMEBUFFER, i, e.RENDERBUFFER, a));
        }
    } else {
      let r = t.texture.mipmaps;
      if (
        (r && r.length > 0
          ? d.bindFramebuffer(e.FRAMEBUFFER, n.__webglFramebuffer[0])
          : d.bindFramebuffer(e.FRAMEBUFFER, n.__webglFramebuffer),
        n.__webglDepthbuffer === void 0)
      )
        ((n.__webglDepthbuffer = e.createRenderbuffer()), ve(n.__webglDepthbuffer, t, !1));
      else {
        let r = t.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT,
          i = n.__webglDepthbuffer;
        (e.bindRenderbuffer(e.RENDERBUFFER, i),
          e.framebufferRenderbuffer(e.FRAMEBUFFER, r, e.RENDERBUFFER, i));
      }
    }
    d.bindFramebuffer(e.FRAMEBUFFER, null);
  }
  function xe(t, n, r) {
    let i = f.get(t);
    (n !== void 0 && _e(i.__webglFramebuffer, t, t.texture, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, 0),
      r !== void 0 && be(t));
  }
  function Se(t) {
    let n = t.texture,
      r = f.get(t),
      i = f.get(n);
    t.addEventListener('dispose', P);
    let a = t.textures,
      o = t.isWebGLCubeRenderTarget === !0,
      s = a.length > 1;
    if (
      (s ||
        (i.__webglTexture === void 0 && (i.__webglTexture = e.createTexture()),
        (i.__version = n.version),
        h.memory.textures++),
      o)
    ) {
      r.__webglFramebuffer = [];
      for (let t = 0; t < 6; t++)
        if (n.mipmaps && n.mipmaps.length > 0) {
          r.__webglFramebuffer[t] = [];
          for (let i = 0; i < n.mipmaps.length; i++)
            r.__webglFramebuffer[t][i] = e.createFramebuffer();
        } else r.__webglFramebuffer[t] = e.createFramebuffer();
    } else {
      if (n.mipmaps && n.mipmaps.length > 0) {
        r.__webglFramebuffer = [];
        for (let t = 0; t < n.mipmaps.length; t++) r.__webglFramebuffer[t] = e.createFramebuffer();
      } else r.__webglFramebuffer = e.createFramebuffer();
      if (s)
        for (let t = 0, n = a.length; t < n; t++) {
          let n = f.get(a[t]);
          n.__webglTexture === void 0 &&
            ((n.__webglTexture = e.createTexture()), h.memory.textures++);
        }
      if (t.samples > 0 && De(t) === !1) {
        ((r.__webglMultisampledFramebuffer = e.createFramebuffer()),
          (r.__webglColorRenderbuffer = []),
          d.bindFramebuffer(e.FRAMEBUFFER, r.__webglMultisampledFramebuffer));
        for (let n = 0; n < a.length; n++) {
          let i = a[n];
          ((r.__webglColorRenderbuffer[n] = e.createRenderbuffer()),
            e.bindRenderbuffer(e.RENDERBUFFER, r.__webglColorRenderbuffer[n]));
          let o = m.convert(i.format, i.colorSpace),
            s = m.convert(i.type),
            c = A(i.internalFormat, o, s, i.normalized, i.colorSpace, t.isXRRenderTarget === !0),
            l = Ee(t);
          (e.renderbufferStorageMultisample(e.RENDERBUFFER, l, c, t.width, t.height),
            e.framebufferRenderbuffer(
              e.FRAMEBUFFER,
              e.COLOR_ATTACHMENT0 + n,
              e.RENDERBUFFER,
              r.__webglColorRenderbuffer[n]
            ));
        }
        (e.bindRenderbuffer(e.RENDERBUFFER, null),
          t.depthBuffer &&
            ((r.__webglDepthRenderbuffer = e.createRenderbuffer()),
            ve(r.__webglDepthRenderbuffer, t, !0)),
          d.bindFramebuffer(e.FRAMEBUFFER, null));
      }
    }
    if (o) {
      (d.bindTexture(e.TEXTURE_CUBE_MAP, i.__webglTexture), de(e.TEXTURE_CUBE_MAP, n));
      for (let i = 0; i < 6; i++)
        if (n.mipmaps && n.mipmaps.length > 0)
          for (let a = 0; a < n.mipmaps.length; a++)
            _e(
              r.__webglFramebuffer[i][a],
              t,
              n,
              e.COLOR_ATTACHMENT0,
              e.TEXTURE_CUBE_MAP_POSITIVE_X + i,
              a
            );
        else
          _e(
            r.__webglFramebuffer[i],
            t,
            n,
            e.COLOR_ATTACHMENT0,
            e.TEXTURE_CUBE_MAP_POSITIVE_X + i,
            0
          );
      (E(n) && D(e.TEXTURE_CUBE_MAP), d.unbindTexture());
    } else if (s) {
      for (let n = 0, i = a.length; n < i; n++) {
        let i = a[n],
          o = f.get(i),
          s = e.TEXTURE_2D;
        ((t.isWebGL3DRenderTarget || t.isWebGLArrayRenderTarget) &&
          (s = t.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY),
          d.bindTexture(s, o.__webglTexture),
          de(s, i),
          _e(r.__webglFramebuffer, t, i, e.COLOR_ATTACHMENT0 + n, s, 0),
          E(i) && D(s));
      }
      d.unbindTexture();
    } else {
      let a = e.TEXTURE_2D;
      if (
        ((t.isWebGL3DRenderTarget || t.isWebGLArrayRenderTarget) &&
          (a = t.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY),
        d.bindTexture(a, i.__webglTexture),
        de(a, n),
        n.mipmaps && n.mipmaps.length > 0)
      )
        for (let i = 0; i < n.mipmaps.length; i++)
          _e(r.__webglFramebuffer[i], t, n, e.COLOR_ATTACHMENT0, a, i);
      else _e(r.__webglFramebuffer, t, n, e.COLOR_ATTACHMENT0, a, 0);
      (E(n) && D(a), d.unbindTexture());
    }
    t.depthBuffer && be(t);
  }
  function Ce(e) {
    let t = e.textures;
    for (let n = 0, r = t.length; n < r; n++) {
      let r = t[n];
      if (E(r)) {
        let t = k(e),
          n = f.get(r).__webglTexture;
        (d.bindTexture(t, n), D(t), d.unbindTexture());
      }
    }
  }
  let we = [],
    Te = [];
  function B(t) {
    if (t.samples > 0) {
      if (De(t) === !1) {
        let n = t.textures,
          r = t.width,
          i = t.height,
          a = e.COLOR_BUFFER_BIT,
          o = t.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT,
          s = f.get(t),
          c = n.length > 1;
        if (c)
          for (let t = 0; t < n.length; t++)
            (d.bindFramebuffer(e.FRAMEBUFFER, s.__webglMultisampledFramebuffer),
              e.framebufferRenderbuffer(
                e.FRAMEBUFFER,
                e.COLOR_ATTACHMENT0 + t,
                e.RENDERBUFFER,
                null
              ),
              d.bindFramebuffer(e.FRAMEBUFFER, s.__webglFramebuffer),
              e.framebufferTexture2D(
                e.DRAW_FRAMEBUFFER,
                e.COLOR_ATTACHMENT0 + t,
                e.TEXTURE_2D,
                null,
                0
              ));
        d.bindFramebuffer(e.READ_FRAMEBUFFER, s.__webglMultisampledFramebuffer);
        let l = t.texture.mipmaps;
        l && l.length > 0
          ? d.bindFramebuffer(e.DRAW_FRAMEBUFFER, s.__webglFramebuffer[0])
          : d.bindFramebuffer(e.DRAW_FRAMEBUFFER, s.__webglFramebuffer);
        for (let l = 0; l < n.length; l++) {
          if (
            (t.resolveDepthBuffer &&
              (t.depthBuffer && (a |= e.DEPTH_BUFFER_BIT),
              t.stencilBuffer && t.resolveStencilBuffer && (a |= e.STENCIL_BUFFER_BIT)),
            c)
          ) {
            e.framebufferRenderbuffer(
              e.READ_FRAMEBUFFER,
              e.COLOR_ATTACHMENT0,
              e.RENDERBUFFER,
              s.__webglColorRenderbuffer[l]
            );
            let t = f.get(n[l]).__webglTexture;
            e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, t, 0);
          }
          (e.blitFramebuffer(0, 0, r, i, 0, 0, r, i, a, e.NEAREST),
            _ === !0 &&
              ((we.length = 0),
              (Te.length = 0),
              we.push(e.COLOR_ATTACHMENT0 + l),
              t.depthBuffer &&
                t.resolveDepthBuffer === !1 &&
                (we.push(o), Te.push(o), e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, Te)),
              e.invalidateFramebuffer(e.READ_FRAMEBUFFER, we)));
        }
        if (
          (d.bindFramebuffer(e.READ_FRAMEBUFFER, null),
          d.bindFramebuffer(e.DRAW_FRAMEBUFFER, null),
          c)
        )
          for (let t = 0; t < n.length; t++) {
            (d.bindFramebuffer(e.FRAMEBUFFER, s.__webglMultisampledFramebuffer),
              e.framebufferRenderbuffer(
                e.FRAMEBUFFER,
                e.COLOR_ATTACHMENT0 + t,
                e.RENDERBUFFER,
                s.__webglColorRenderbuffer[t]
              ));
            let r = f.get(n[t]).__webglTexture;
            (d.bindFramebuffer(e.FRAMEBUFFER, s.__webglFramebuffer),
              e.framebufferTexture2D(
                e.DRAW_FRAMEBUFFER,
                e.COLOR_ATTACHMENT0 + t,
                e.TEXTURE_2D,
                r,
                0
              ));
          }
        d.bindFramebuffer(e.DRAW_FRAMEBUFFER, s.__webglMultisampledFramebuffer);
      } else if (t.depthBuffer && t.resolveDepthBuffer === !1 && _) {
        let n = t.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
        e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, [n]);
      }
    }
  }
  function Ee(e) {
    return Math.min(p.maxSamples, e.samples);
  }
  function De(e) {
    let n = f.get(e);
    return (
      e.samples > 0 &&
      t.has('WEBGL_multisampled_render_to_texture') === !0 &&
      n.__useRenderToTexture !== !1
    );
  }
  function Oe(e) {
    let t = h.render.frame;
    y.get(e) !== t && (y.set(e, t), e.update());
  }
  function V(e, t) {
    let n = e.colorSpace,
      r = e.format,
      i = e.type;
    return (
      e.isCompressedTexture === !0 ||
        e.isVideoTexture === !0 ||
        (n !== 'srgb-linear' &&
          n !== '' &&
          (Mt.getTransfer(n) === 'srgb'
            ? (r !== 1023 || i !== 1009) &&
              W('WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.')
            : G('WebGLTextures: Unsupported texture color space:', n))),
      t
    );
  }
  function ke(e) {
    return (
      typeof HTMLImageElement < 'u' && e instanceof HTMLImageElement
        ? ((v.width = e.naturalWidth || e.width), (v.height = e.naturalHeight || e.height))
        : typeof VideoFrame < 'u' && e instanceof VideoFrame
          ? ((v.width = e.displayWidth), (v.height = e.displayHeight))
          : ((v.width = e.width), (v.height = e.height)),
      v
    );
  }
  ((this.allocateTextureUnit = R),
    (this.resetTextureUnits = ne),
    (this.getTextureUnits = re),
    (this.setTextureUnits = L),
    (this.setTexture2D = z),
    (this.setTexture2DArray = ae),
    (this.setTexture3D = oe),
    (this.setTextureCube = se),
    (this.rebindTextures = xe),
    (this.setupRenderTarget = Se),
    (this.updateRenderTargetMipmap = Ce),
    (this.updateMultisampleRenderTarget = B),
    (this.setupDepthRenderbuffer = be),
    (this.setupFrameBufferTexture = _e),
    (this.useMultisampledRTT = De),
    (this.isReversedDepthBuffer = function () {
      return d.buffers.depth.getReversed();
    }));
}
function yu(e, t) {
  function n(n, r = '') {
    let i,
      a = Mt.getTransfer(r);
    if (n === 1009) return e.UNSIGNED_BYTE;
    if (n === 1017) return e.UNSIGNED_SHORT_4_4_4_4;
    if (n === 1018) return e.UNSIGNED_SHORT_5_5_5_1;
    if (n === 35902) return e.UNSIGNED_INT_5_9_9_9_REV;
    if (n === 35899) return e.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === 1010) return e.BYTE;
    if (n === 1011) return e.SHORT;
    if (n === 1012) return e.UNSIGNED_SHORT;
    if (n === 1013) return e.INT;
    if (n === 1014) return e.UNSIGNED_INT;
    if (n === 1015) return e.FLOAT;
    if (n === 1016) return e.HALF_FLOAT;
    if (n === 1021) return e.ALPHA;
    if (n === 1022) return e.RGB;
    if (n === 1023) return e.RGBA;
    if (n === 1026) return e.DEPTH_COMPONENT;
    if (n === 1027) return e.DEPTH_STENCIL;
    if (n === 1028) return e.RED;
    if (n === 1029) return e.RED_INTEGER;
    if (n === 1030) return e.RG;
    if (n === 1031) return e.RG_INTEGER;
    if (n === 1033) return e.RGBA_INTEGER;
    if (n === 33776 || n === 33777 || n === 33778 || n === 33779)
      if (a === 'srgb')
        if (((i = t.get('WEBGL_compressed_texture_s3tc_srgb')), i !== null)) {
          if (n === 33776) return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === 33777) return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === 33778) return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === 33779) return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else return null;
      else if (((i = t.get('WEBGL_compressed_texture_s3tc')), i !== null)) {
        if (n === 33776) return i.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === 33777) return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === 33778) return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === 33779) return i.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else return null;
    if (n === 35840 || n === 35841 || n === 35842 || n === 35843)
      if (((i = t.get('WEBGL_compressed_texture_pvrtc')), i !== null)) {
        if (n === 35840) return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === 35841) return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === 35842) return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === 35843) return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else return null;
    if (
      n === 36196 ||
      n === 37492 ||
      n === 37496 ||
      n === 37488 ||
      n === 37489 ||
      n === 37490 ||
      n === 37491
    )
      if (((i = t.get('WEBGL_compressed_texture_etc')), i !== null)) {
        if (n === 36196 || n === 37492)
          return a === 'srgb' ? i.COMPRESSED_SRGB8_ETC2 : i.COMPRESSED_RGB8_ETC2;
        if (n === 37496)
          return a === 'srgb' ? i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : i.COMPRESSED_RGBA8_ETC2_EAC;
        if (n === 37488) return i.COMPRESSED_R11_EAC;
        if (n === 37489) return i.COMPRESSED_SIGNED_R11_EAC;
        if (n === 37490) return i.COMPRESSED_RG11_EAC;
        if (n === 37491) return i.COMPRESSED_SIGNED_RG11_EAC;
      } else return null;
    if (
      n === 37808 ||
      n === 37809 ||
      n === 37810 ||
      n === 37811 ||
      n === 37812 ||
      n === 37813 ||
      n === 37814 ||
      n === 37815 ||
      n === 37816 ||
      n === 37817 ||
      n === 37818 ||
      n === 37819 ||
      n === 37820 ||
      n === 37821
    )
      if (((i = t.get('WEBGL_compressed_texture_astc')), i !== null)) {
        if (n === 37808)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR
            : i.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === 37809)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR
            : i.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === 37810)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR
            : i.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === 37811)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR
            : i.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === 37812)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR
            : i.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === 37813)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR
            : i.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === 37814)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR
            : i.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === 37815)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR
            : i.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === 37816)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR
            : i.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === 37817)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR
            : i.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === 37818)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR
            : i.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === 37819)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR
            : i.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === 37820)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR
            : i.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === 37821)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR
            : i.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else return null;
    if (n === 36492 || n === 36494 || n === 36495)
      if (((i = t.get('EXT_texture_compression_bptc')), i !== null)) {
        if (n === 36492)
          return a === 'srgb'
            ? i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT
            : i.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === 36494) return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === 36495) return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else return null;
    if (n === 36283 || n === 36284 || n === 36285 || n === 36286)
      if (((i = t.get('EXT_texture_compression_rgtc')), i !== null)) {
        if (n === 36283) return i.COMPRESSED_RED_RGTC1_EXT;
        if (n === 36284) return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === 36285) return i.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === 36286) return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else return null;
    return n === 1020 ? e.UNSIGNED_INT_24_8 : e[n] === void 0 ? null : e[n];
  }
  return { convert: n };
}
var bu = '\nvoid main() {\n\n	gl_Position = vec4( position, 1.0 );\n\n}',
  xu =
    '\nuniform sampler2DArray depthColor;\nuniform float depthWidth;\nuniform float depthHeight;\n\nvoid main() {\n\n	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );\n\n	if ( coord.x >= 1.0 ) {\n\n		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;\n\n	} else {\n\n		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;\n\n	}\n\n}',
  Su = class {
    constructor() {
      ((this.texture = null), (this.mesh = null), (this.depthNear = 0), (this.depthFar = 0));
    }
    init(e, t) {
      if (this.texture === null) {
        let n = new yi(e.texture);
        ((e.depthNear !== t.depthNear || e.depthFar !== t.depthFar) &&
          ((this.depthNear = e.depthNear), (this.depthFar = e.depthFar)),
          (this.texture = n));
      }
    }
    getMesh(e) {
      if (this.texture !== null && this.mesh === null) {
        let t = e.cameras[0].viewport,
          n = new Ya({
            vertexShader: bu,
            fragmentShader: xu,
            uniforms: {
              depthColor: { value: this.texture },
              depthWidth: { value: t.z },
              depthHeight: { value: t.w }
            }
          });
        this.mesh = new Jr(new za(20, 20), n);
      }
      return this.mesh;
    }
    reset() {
      ((this.texture = null), (this.mesh = null));
    }
    getDepthTexture() {
      return this.texture;
    }
  },
  Cu = class extends Qe {
    constructor(e, t) {
      super();
      let n = this,
        r = null,
        i = 1,
        a = null,
        o = 'local-floor',
        s = 1,
        c = null,
        l = null,
        u = null,
        f = null,
        p = null,
        m = null,
        h = typeof XRWebGLBinding < 'u',
        _ = new Su(),
        v = {},
        y = t.getContextAttributes(),
        b = null,
        S = null,
        C = [],
        w = [],
        T = new q(),
        k = null,
        A = new Lo();
      A.viewport = new Ut();
      let j = new Lo();
      j.viewport = new Ut();
      let M = [A, j],
        N = new qo(),
        P = null,
        F = null;
      ((this.cameraAutoUpdate = !0),
        (this.enabled = !1),
        (this.isPresenting = !1),
        (this.getController = function (e) {
          let t = C[e];
          return (t === void 0 && ((t = new Tn()), (C[e] = t)), t.getTargetRaySpace());
        }),
        (this.getControllerGrip = function (e) {
          let t = C[e];
          return (t === void 0 && ((t = new Tn()), (C[e] = t)), t.getGripSpace());
        }),
        (this.getHand = function (e) {
          let t = C[e];
          return (t === void 0 && ((t = new Tn()), (C[e] = t)), t.getHandSpace());
        }));
      function I(e) {
        let t = w.indexOf(e.inputSource);
        if (t === -1) return;
        let n = C[t];
        n !== void 0 &&
          (n.update(e.inputSource, e.frame, c || a),
          n.dispatchEvent({
            type: e.type,
            data: e.inputSource
          }));
      }
      function ee() {
        (r.removeEventListener('select', I),
          r.removeEventListener('selectstart', I),
          r.removeEventListener('selectend', I),
          r.removeEventListener('squeeze', I),
          r.removeEventListener('squeezestart', I),
          r.removeEventListener('squeezeend', I),
          r.removeEventListener('end', ee),
          r.removeEventListener('inputsourceschange', te));
        for (let e = 0; e < C.length; e++) {
          let t = w[e];
          t !== null && ((w[e] = null), C[e].disconnect(t));
        }
        ((P = null), (F = null), _.reset());
        for (let e in v) delete v[e];
        (e.setRenderTarget(b),
          (p = null),
          (f = null),
          (u = null),
          (r = null),
          (S = null),
          oe.stop(),
          (n.isPresenting = !1),
          e.setPixelRatio(k),
          e.setSize(T.width, T.height, !1),
          n.dispatchEvent({ type: 'sessionend' }));
      }
      ((this.setFramebufferScaleFactor = function (e) {
        ((i = e),
          n.isPresenting === !0 &&
            W('WebXRManager: Cannot change framebuffer scale while presenting.'));
      }),
        (this.setReferenceSpaceType = function (e) {
          ((o = e),
            n.isPresenting === !0 &&
              W('WebXRManager: Cannot change reference space type while presenting.'));
        }),
        (this.getReferenceSpace = function () {
          return c || a;
        }),
        (this.setReferenceSpace = function (e) {
          c = e;
        }),
        (this.getBaseLayer = function () {
          return f === null ? p : f;
        }),
        (this.getBinding = function () {
          return (u === null && h && (u = new XRWebGLBinding(r, t)), u);
        }),
        (this.getFrame = function () {
          return m;
        }),
        (this.getSession = function () {
          return r;
        }),
        (this.setSession = async function (l) {
          if (((r = l), r !== null)) {
            if (
              ((b = e.getRenderTarget()),
              r.addEventListener('select', I),
              r.addEventListener('selectstart', I),
              r.addEventListener('selectend', I),
              r.addEventListener('squeeze', I),
              r.addEventListener('squeezestart', I),
              r.addEventListener('squeezeend', I),
              r.addEventListener('end', ee),
              r.addEventListener('inputsourceschange', te),
              y.xrCompatible !== !0 && (await t.makeXRCompatible()),
              (k = e.getPixelRatio()),
              e.getSize(T),
              h && 'createProjectionLayer' in XRWebGLBinding.prototype)
            ) {
              let n = null,
                a = null,
                o = null;
              y.depth &&
                ((o = y.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24),
                (n = y.stencil ? O : D),
                (a = y.stencil ? x : g));
              let s = {
                colorFormat: t.RGBA8,
                depthFormat: o,
                scaleFactor: i
              };
              ((u = this.getBinding()),
                (f = u.createProjectionLayer(s)),
                r.updateRenderState({ layers: [f] }),
                e.setPixelRatio(1),
                e.setSize(f.textureWidth, f.textureHeight, !1),
                (S = new Gt(f.textureWidth, f.textureHeight, {
                  format: E,
                  type: d,
                  depthTexture: new _i(
                    f.textureWidth,
                    f.textureHeight,
                    a,
                    void 0,
                    void 0,
                    void 0,
                    void 0,
                    void 0,
                    void 0,
                    n
                  ),
                  stencilBuffer: y.stencil,
                  colorSpace: e.outputColorSpace,
                  samples: y.antialias ? 4 : 0,
                  resolveDepthBuffer: f.ignoreDepthValues === !1,
                  resolveStencilBuffer: f.ignoreDepthValues === !1
                })));
            } else {
              let n = {
                antialias: y.antialias,
                alpha: !0,
                depth: y.depth,
                stencil: y.stencil,
                framebufferScaleFactor: i
              };
              ((p = new XRWebGLLayer(r, t, n)),
                r.updateRenderState({ baseLayer: p }),
                e.setPixelRatio(1),
                e.setSize(p.framebufferWidth, p.framebufferHeight, !1),
                (S = new Gt(p.framebufferWidth, p.framebufferHeight, {
                  format: E,
                  type: d,
                  colorSpace: e.outputColorSpace,
                  stencilBuffer: y.stencil,
                  resolveDepthBuffer: p.ignoreDepthValues === !1,
                  resolveStencilBuffer: p.ignoreDepthValues === !1
                })));
            }
            ((S.isXRRenderTarget = !0),
              this.setFoveation(s),
              (c = null),
              (a = await r.requestReferenceSpace(o)),
              oe.setContext(r),
              oe.start(),
              (n.isPresenting = !0),
              n.dispatchEvent({ type: 'sessionstart' }));
          }
        }),
        (this.getEnvironmentBlendMode = function () {
          if (r !== null) return r.environmentBlendMode;
        }),
        (this.getDepthTexture = function () {
          return _.getDepthTexture();
        }));
      function te(e) {
        for (let t = 0; t < e.removed.length; t++) {
          let n = e.removed[t],
            r = w.indexOf(n);
          r >= 0 && ((w[r] = null), C[r].disconnect(n));
        }
        for (let t = 0; t < e.added.length; t++) {
          let n = e.added[t],
            r = w.indexOf(n);
          if (r === -1) {
            for (let e = 0; e < C.length; e++)
              if (e >= w.length) {
                (w.push(n), (r = e));
                break;
              } else if (w[e] === null) {
                ((w[e] = n), (r = e));
                break;
              }
            if (r === -1) break;
          }
          let i = C[r];
          i && i.connect(n);
        }
      }
      let ne = new J(),
        re = new J();
      function L(e, t, n) {
        (ne.setFromMatrixPosition(t.matrixWorld), re.setFromMatrixPosition(n.matrixWorld));
        let r = ne.distanceTo(re),
          i = t.projectionMatrix.elements,
          a = n.projectionMatrix.elements,
          o = i[14] / (i[10] - 1),
          s = i[14] / (i[10] + 1),
          c = (i[9] + 1) / i[5],
          l = (i[9] - 1) / i[5],
          u = (i[8] - 1) / i[0],
          d = (a[8] + 1) / a[0],
          f = o * u,
          p = o * d,
          m = r / (-u + d),
          h = m * -u;
        if (
          (t.matrixWorld.decompose(e.position, e.quaternion, e.scale),
          e.translateX(h),
          e.translateZ(m),
          e.matrixWorld.compose(e.position, e.quaternion, e.scale),
          e.matrixWorldInverse.copy(e.matrixWorld).invert(),
          i[10] === -1)
        )
          (e.projectionMatrix.copy(t.projectionMatrix),
            e.projectionMatrixInverse.copy(t.projectionMatrixInverse));
        else {
          let t = o + m,
            n = s + m,
            i = f - h,
            a = p + (r - h),
            u = ((c * s) / n) * t,
            d = ((l * s) / n) * t;
          (e.projectionMatrix.makePerspective(i, a, u, d, t, n),
            e.projectionMatrixInverse.copy(e.projectionMatrix).invert());
        }
      }
      function R(e, t) {
        (t === null
          ? e.matrixWorld.copy(e.matrix)
          : e.matrixWorld.multiplyMatrices(t.matrixWorld, e.matrix),
          e.matrixWorldInverse.copy(e.matrixWorld).invert());
      }
      this.updateCamera = function (e) {
        if (r === null) return;
        let t = e.near,
          n = e.far;
        (_.texture !== null &&
          (_.depthNear > 0 && (t = _.depthNear), _.depthFar > 0 && (n = _.depthFar)),
          (N.near = j.near = A.near = t),
          (N.far = j.far = A.far = n),
          (P !== N.near || F !== N.far) &&
            (r.updateRenderState({
              depthNear: N.near,
              depthFar: N.far
            }),
            (P = N.near),
            (F = N.far)),
          (N.layers.mask = e.layers.mask | 6),
          (A.layers.mask = N.layers.mask & -5),
          (j.layers.mask = N.layers.mask & -3));
        let i = e.parent,
          a = N.cameras;
        R(N, i);
        for (let e = 0; e < a.length; e++) R(a[e], i);
        (a.length === 2 ? L(N, A, j) : N.projectionMatrix.copy(A.projectionMatrix), ie(e, N, i));
      };
      function ie(e, t, n) {
        (n === null
          ? e.matrix.copy(t.matrixWorld)
          : (e.matrix.copy(n.matrixWorld), e.matrix.invert(), e.matrix.multiply(t.matrixWorld)),
          e.matrix.decompose(e.position, e.quaternion, e.scale),
          e.updateMatrixWorld(!0),
          e.projectionMatrix.copy(t.projectionMatrix),
          e.projectionMatrixInverse.copy(t.projectionMatrixInverse),
          e.isPerspectiveCamera &&
            ((e.fov = nt * 2 * Math.atan(1 / e.projectionMatrix.elements[5])), (e.zoom = 1)));
      }
      ((this.getCamera = function () {
        return N;
      }),
        (this.getFoveation = function () {
          if (!(f === null && p === null)) return s;
        }),
        (this.setFoveation = function (e) {
          ((s = e),
            f !== null && (f.fixedFoveation = e),
            p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = e));
        }),
        (this.hasDepthSensing = function () {
          return _.texture !== null;
        }),
        (this.getDepthSensingMesh = function () {
          return _.getMesh(N);
        }),
        (this.getCameraTexture = function (e) {
          return v[e];
        }));
      let z = null;
      function ae(t, i) {
        if (((l = i.getViewerPose(c || a)), (m = i), l !== null)) {
          let t = l.views;
          p !== null && (e.setRenderTargetFramebuffer(S, p.framebuffer), e.setRenderTarget(S));
          let i = !1;
          t.length !== N.cameras.length && ((N.cameras.length = 0), (i = !0));
          for (let n = 0; n < t.length; n++) {
            let r = t[n],
              a = null;
            if (p !== null) a = p.getViewport(r);
            else {
              let t = u.getViewSubImage(f, r);
              ((a = t.viewport),
                n === 0 &&
                  (e.setRenderTargetTextures(S, t.colorTexture, t.depthStencilTexture),
                  e.setRenderTarget(S)));
            }
            let o = M[n];
            (o === void 0 &&
              ((o = new Lo()), o.layers.enable(n), (o.viewport = new Ut()), (M[n] = o)),
              o.matrix.fromArray(r.transform.matrix),
              o.matrix.decompose(o.position, o.quaternion, o.scale),
              o.projectionMatrix.fromArray(r.projectionMatrix),
              o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),
              o.viewport.set(a.x, a.y, a.width, a.height),
              n === 0 &&
                (N.matrix.copy(o.matrix), N.matrix.decompose(N.position, N.quaternion, N.scale)),
              i === !0 && N.cameras.push(o));
          }
          let a = r.enabledFeatures;
          if (a && a.includes('depth-sensing') && r.depthUsage == 'gpu-optimized' && h) {
            u = n.getBinding();
            let e = u.getDepthInformation(t[0]);
            e && e.isValid && e.texture && _.init(e, r.renderState);
          }
          if (a && a.includes('camera-access') && h) {
            (e.state.unbindTexture(), (u = n.getBinding()));
            for (let e = 0; e < t.length; e++) {
              let n = t[e].camera;
              if (n) {
                let e = v[n];
                e || ((e = new yi()), (v[n] = e));
                let t = u.getCameraImage(n);
                e.sourceTexture = t;
              }
            }
          }
        }
        for (let e = 0; e < C.length; e++) {
          let t = w[e],
            n = C[e];
          t !== null && n !== void 0 && n.update(t, i, c || a);
        }
        (z && z(t, i),
          i.detectedPlanes &&
            n.dispatchEvent({
              type: 'planesdetected',
              data: i
            }),
          (m = null));
      }
      let oe = new gs();
      (oe.setAnimationLoop(ae),
        (this.setAnimationLoop = function (e) {
          z = e;
        }),
        (this.dispose = function () {}));
    }
  },
  wu = /*@__PURE__*/ new Jt(),
  Tu = /*@__PURE__*/ new Y();
Tu.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);
function Eu(e, t) {
  function n(e, t) {
    (e.matrixAutoUpdate === !0 && e.updateMatrix(), t.value.copy(e.matrix));
  }
  function r(t, n) {
    (n.color.getRGB(t.fogColor.value, Ga(e)),
      n.isFog
        ? ((t.fogNear.value = n.near), (t.fogFar.value = n.far))
        : n.isFogExp2 && (t.fogDensity.value = n.density));
  }
  function i(e, t, n, r, i) {
    t.isNodeMaterial
      ? (t.uniformsNeedUpdate = !1)
      : t.isMeshBasicMaterial
        ? a(e, t)
        : t.isMeshLambertMaterial
          ? (a(e, t), t.envMap && (e.envMapIntensity.value = t.envMapIntensity))
          : t.isMeshToonMaterial
            ? (a(e, t), d(e, t))
            : t.isMeshPhongMaterial
              ? (a(e, t), u(e, t), t.envMap && (e.envMapIntensity.value = t.envMapIntensity))
              : t.isMeshStandardMaterial
                ? (a(e, t), f(e, t), t.isMeshPhysicalMaterial && p(e, t, i))
                : t.isMeshMatcapMaterial
                  ? (a(e, t), m(e, t))
                  : t.isMeshDepthMaterial
                    ? a(e, t)
                    : t.isMeshDistanceMaterial
                      ? (a(e, t), h(e, t))
                      : t.isMeshNormalMaterial
                        ? a(e, t)
                        : t.isLineBasicMaterial
                          ? (o(e, t), t.isLineDashedMaterial && s(e, t))
                          : t.isPointsMaterial
                            ? c(e, t, n, r)
                            : t.isSpriteMaterial
                              ? l(e, t)
                              : t.isShadowMaterial
                                ? (e.color.value.copy(t.color), (e.opacity.value = t.opacity))
                                : t.isShaderMaterial && (t.uniformsNeedUpdate = !1);
  }
  function a(e, r) {
    ((e.opacity.value = r.opacity),
      r.color && e.diffuse.value.copy(r.color),
      r.emissive && e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),
      r.map && ((e.map.value = r.map), n(r.map, e.mapTransform)),
      r.alphaMap && ((e.alphaMap.value = r.alphaMap), n(r.alphaMap, e.alphaMapTransform)),
      r.bumpMap &&
        ((e.bumpMap.value = r.bumpMap),
        n(r.bumpMap, e.bumpMapTransform),
        (e.bumpScale.value = r.bumpScale),
        r.side === 1 && (e.bumpScale.value *= -1)),
      r.normalMap &&
        ((e.normalMap.value = r.normalMap),
        n(r.normalMap, e.normalMapTransform),
        e.normalScale.value.copy(r.normalScale),
        r.side === 1 && e.normalScale.value.negate()),
      r.displacementMap &&
        ((e.displacementMap.value = r.displacementMap),
        n(r.displacementMap, e.displacementMapTransform),
        (e.displacementScale.value = r.displacementScale),
        (e.displacementBias.value = r.displacementBias)),
      r.emissiveMap &&
        ((e.emissiveMap.value = r.emissiveMap), n(r.emissiveMap, e.emissiveMapTransform)),
      r.specularMap &&
        ((e.specularMap.value = r.specularMap), n(r.specularMap, e.specularMapTransform)),
      r.alphaTest > 0 && (e.alphaTest.value = r.alphaTest));
    let i = t.get(r),
      a = i.envMap,
      o = i.envMapRotation;
    (a &&
      ((e.envMap.value = a),
      e.envMapRotation.value.setFromMatrix4(wu.makeRotationFromEuler(o)).transpose(),
      a.isCubeTexture && a.isRenderTargetTexture === !1 && e.envMapRotation.value.premultiply(Tu),
      (e.reflectivity.value = r.reflectivity),
      (e.ior.value = r.ior),
      (e.refractionRatio.value = r.refractionRatio)),
      r.lightMap &&
        ((e.lightMap.value = r.lightMap),
        (e.lightMapIntensity.value = r.lightMapIntensity),
        n(r.lightMap, e.lightMapTransform)),
      r.aoMap &&
        ((e.aoMap.value = r.aoMap),
        (e.aoMapIntensity.value = r.aoMapIntensity),
        n(r.aoMap, e.aoMapTransform)));
  }
  function o(e, t) {
    (e.diffuse.value.copy(t.color),
      (e.opacity.value = t.opacity),
      t.map && ((e.map.value = t.map), n(t.map, e.mapTransform)));
  }
  function s(e, t) {
    ((e.dashSize.value = t.dashSize),
      (e.totalSize.value = t.dashSize + t.gapSize),
      (e.scale.value = t.scale));
  }
  function c(e, t, r, i) {
    (e.diffuse.value.copy(t.color),
      (e.opacity.value = t.opacity),
      (e.size.value = t.size * r),
      (e.scale.value = i * 0.5),
      t.map && ((e.map.value = t.map), n(t.map, e.uvTransform)),
      t.alphaMap && ((e.alphaMap.value = t.alphaMap), n(t.alphaMap, e.alphaMapTransform)),
      t.alphaTest > 0 && (e.alphaTest.value = t.alphaTest));
  }
  function l(e, t) {
    (e.diffuse.value.copy(t.color),
      (e.opacity.value = t.opacity),
      (e.rotation.value = t.rotation),
      t.map && ((e.map.value = t.map), n(t.map, e.mapTransform)),
      t.alphaMap && ((e.alphaMap.value = t.alphaMap), n(t.alphaMap, e.alphaMapTransform)),
      t.alphaTest > 0 && (e.alphaTest.value = t.alphaTest));
  }
  function u(e, t) {
    (e.specular.value.copy(t.specular), (e.shininess.value = Math.max(t.shininess, 1e-4)));
  }
  function d(e, t) {
    t.gradientMap && (e.gradientMap.value = t.gradientMap);
  }
  function f(e, t) {
    ((e.metalness.value = t.metalness),
      t.metalnessMap &&
        ((e.metalnessMap.value = t.metalnessMap), n(t.metalnessMap, e.metalnessMapTransform)),
      (e.roughness.value = t.roughness),
      t.roughnessMap &&
        ((e.roughnessMap.value = t.roughnessMap), n(t.roughnessMap, e.roughnessMapTransform)),
      t.envMap && (e.envMapIntensity.value = t.envMapIntensity));
  }
  function p(e, t, r) {
    ((e.ior.value = t.ior),
      t.sheen > 0 &&
        (e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),
        (e.sheenRoughness.value = t.sheenRoughness),
        t.sheenColorMap &&
          ((e.sheenColorMap.value = t.sheenColorMap), n(t.sheenColorMap, e.sheenColorMapTransform)),
        t.sheenRoughnessMap &&
          ((e.sheenRoughnessMap.value = t.sheenRoughnessMap),
          n(t.sheenRoughnessMap, e.sheenRoughnessMapTransform))),
      t.clearcoat > 0 &&
        ((e.clearcoat.value = t.clearcoat),
        (e.clearcoatRoughness.value = t.clearcoatRoughness),
        t.clearcoatMap &&
          ((e.clearcoatMap.value = t.clearcoatMap), n(t.clearcoatMap, e.clearcoatMapTransform)),
        t.clearcoatRoughnessMap &&
          ((e.clearcoatRoughnessMap.value = t.clearcoatRoughnessMap),
          n(t.clearcoatRoughnessMap, e.clearcoatRoughnessMapTransform)),
        t.clearcoatNormalMap &&
          ((e.clearcoatNormalMap.value = t.clearcoatNormalMap),
          n(t.clearcoatNormalMap, e.clearcoatNormalMapTransform),
          e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),
          t.side === 1 && e.clearcoatNormalScale.value.negate())),
      t.dispersion > 0 && (e.dispersion.value = t.dispersion),
      t.iridescence > 0 &&
        ((e.iridescence.value = t.iridescence),
        (e.iridescenceIOR.value = t.iridescenceIOR),
        (e.iridescenceThicknessMinimum.value = t.iridescenceThicknessRange[0]),
        (e.iridescenceThicknessMaximum.value = t.iridescenceThicknessRange[1]),
        t.iridescenceMap &&
          ((e.iridescenceMap.value = t.iridescenceMap),
          n(t.iridescenceMap, e.iridescenceMapTransform)),
        t.iridescenceThicknessMap &&
          ((e.iridescenceThicknessMap.value = t.iridescenceThicknessMap),
          n(t.iridescenceThicknessMap, e.iridescenceThicknessMapTransform))),
      t.transmission > 0 &&
        ((e.transmission.value = t.transmission),
        (e.transmissionSamplerMap.value = r.texture),
        e.transmissionSamplerSize.value.set(r.width, r.height),
        t.transmissionMap &&
          ((e.transmissionMap.value = t.transmissionMap),
          n(t.transmissionMap, e.transmissionMapTransform)),
        (e.thickness.value = t.thickness),
        t.thicknessMap &&
          ((e.thicknessMap.value = t.thicknessMap), n(t.thicknessMap, e.thicknessMapTransform)),
        (e.attenuationDistance.value = t.attenuationDistance),
        e.attenuationColor.value.copy(t.attenuationColor)),
      t.anisotropy > 0 &&
        (e.anisotropyVector.value.set(
          t.anisotropy * Math.cos(t.anisotropyRotation),
          t.anisotropy * Math.sin(t.anisotropyRotation)
        ),
        t.anisotropyMap &&
          ((e.anisotropyMap.value = t.anisotropyMap),
          n(t.anisotropyMap, e.anisotropyMapTransform))),
      (e.specularIntensity.value = t.specularIntensity),
      e.specularColor.value.copy(t.specularColor),
      t.specularColorMap &&
        ((e.specularColorMap.value = t.specularColorMap),
        n(t.specularColorMap, e.specularColorMapTransform)),
      t.specularIntensityMap &&
        ((e.specularIntensityMap.value = t.specularIntensityMap),
        n(t.specularIntensityMap, e.specularIntensityMapTransform)));
  }
  function m(e, t) {
    t.matcap && (e.matcap.value = t.matcap);
  }
  function h(e, n) {
    let r = t.get(n).light;
    (e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),
      (e.nearDistance.value = r.shadow.camera.near),
      (e.farDistance.value = r.shadow.camera.far));
  }
  return {
    refreshFogUniforms: r,
    refreshMaterialUniforms: i
  };
}
function Du(e, t, n, r) {
  let i = {},
    a = {},
    o = [],
    s = e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);
  function c(e, t) {
    let n = t.program;
    r.uniformBlockBinding(e, n);
  }
  function l(e, n) {
    let o = i[e.id];
    o === void 0 && (m(e), (o = u(e)), (i[e.id] = o), e.addEventListener('dispose', g));
    let s = n.program;
    r.updateUBOMapping(e, s);
    let c = t.render.frame;
    a[e.id] !== c && (f(e), (a[e.id] = c));
  }
  function u(t) {
    let n = d();
    t.__bindingPointIndex = n;
    let r = e.createBuffer(),
      i = t.__size,
      a = t.usage;
    return (
      e.bindBuffer(e.UNIFORM_BUFFER, r),
      e.bufferData(e.UNIFORM_BUFFER, i, a),
      e.bindBuffer(e.UNIFORM_BUFFER, null),
      e.bindBufferBase(e.UNIFORM_BUFFER, n, r),
      r
    );
  }
  function d() {
    for (let e = 0; e < s; e++) if (o.indexOf(e) === -1) return (o.push(e), e);
    return (
      G('WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.'), 0
    );
  }
  function f(t) {
    let n = i[t.id],
      r = t.uniforms,
      a = t.__cache;
    e.bindBuffer(e.UNIFORM_BUFFER, n);
    for (let t = 0, n = r.length; t < n; t++) {
      let n = Array.isArray(r[t]) ? r[t] : [r[t]];
      for (let r = 0, i = n.length; r < i; r++) {
        let i = n[r];
        if (p(i, t, r, a) === !0) {
          let t = i.__offset,
            n = Array.isArray(i.value) ? i.value : [i.value],
            r = 0;
          for (let a = 0; a < n.length; a++) {
            let o = n[a],
              s = h(o);
            typeof o == 'number' || typeof o == 'boolean'
              ? ((i.__data[0] = o), e.bufferSubData(e.UNIFORM_BUFFER, t + r, i.__data))
              : o.isMatrix3
                ? ((i.__data[0] = o.elements[0]),
                  (i.__data[1] = o.elements[1]),
                  (i.__data[2] = o.elements[2]),
                  (i.__data[3] = 0),
                  (i.__data[4] = o.elements[3]),
                  (i.__data[5] = o.elements[4]),
                  (i.__data[6] = o.elements[5]),
                  (i.__data[7] = 0),
                  (i.__data[8] = o.elements[6]),
                  (i.__data[9] = o.elements[7]),
                  (i.__data[10] = o.elements[8]),
                  (i.__data[11] = 0))
                : ArrayBuffer.isView(o)
                  ? i.__data.set(new o.constructor(o.buffer, o.byteOffset, i.__data.length))
                  : (o.toArray(i.__data, r), (r += s.storage / Float32Array.BYTES_PER_ELEMENT));
          }
          e.bufferSubData(e.UNIFORM_BUFFER, t, i.__data);
        }
      }
    }
    e.bindBuffer(e.UNIFORM_BUFFER, null);
  }
  function p(e, t, n, r) {
    let i = e.value,
      a = t + '_' + n;
    if (r[a] === void 0)
      return (
        typeof i == 'number' || typeof i == 'boolean'
          ? (r[a] = i)
          : ArrayBuffer.isView(i)
            ? (r[a] = i.slice())
            : (r[a] = i.clone()),
        !0
      );
    {
      let e = r[a];
      if (typeof i == 'number' || typeof i == 'boolean') {
        if (e !== i) return ((r[a] = i), !0);
      } else if (ArrayBuffer.isView(i)) return !0;
      else if (e.equals(i) === !1) return (e.copy(i), !0);
    }
    return !1;
  }
  function m(e) {
    let t = e.uniforms,
      n = 0;
    for (let e = 0, r = t.length; e < r; e++) {
      let r = Array.isArray(t[e]) ? t[e] : [t[e]];
      for (let e = 0, t = r.length; e < t; e++) {
        let t = r[e],
          i = Array.isArray(t.value) ? t.value : [t.value];
        for (let e = 0, r = i.length; e < r; e++) {
          let r = i[e],
            a = h(r),
            o = n % 16,
            s = o % a.boundary,
            c = o + s;
          ((n += s),
            c !== 0 && 16 - c < a.storage && (n += 16 - c),
            (t.__data = new Float32Array(a.storage / Float32Array.BYTES_PER_ELEMENT)),
            (t.__offset = n),
            (n += a.storage));
        }
      }
    }
    let r = n % 16;
    return (r > 0 && (n += 16 - r), (e.__size = n), (e.__cache = {}), this);
  }
  function h(e) {
    let t = {
      boundary: 0,
      storage: 0
    };
    return (
      typeof e == 'number' || typeof e == 'boolean'
        ? ((t.boundary = 4), (t.storage = 4))
        : e.isVector2
          ? ((t.boundary = 8), (t.storage = 8))
          : e.isVector3 || e.isColor
            ? ((t.boundary = 16), (t.storage = 12))
            : e.isVector4
              ? ((t.boundary = 16), (t.storage = 16))
              : e.isMatrix3
                ? ((t.boundary = 48), (t.storage = 48))
                : e.isMatrix4
                  ? ((t.boundary = 64), (t.storage = 64))
                  : e.isTexture
                    ? W('WebGLRenderer: Texture samplers can not be part of an uniforms group.')
                    : ArrayBuffer.isView(e)
                      ? ((t.boundary = 16), (t.storage = e.byteLength))
                      : W('WebGLRenderer: Unsupported uniform value type.', e),
      t
    );
  }
  function g(t) {
    let n = t.target;
    n.removeEventListener('dispose', g);
    let r = o.indexOf(n.__bindingPointIndex);
    (o.splice(r, 1), e.deleteBuffer(i[n.id]), delete i[n.id], delete a[n.id]);
  }
  function _() {
    for (let t in i) e.deleteBuffer(i[t]);
    ((o = []), (i = {}), (a = {}));
  }
  return {
    bind: c,
    update: l,
    dispose: _
  };
}
var Ou = new Uint16Array([
    12469, 15057, 12620, 14925, 13266, 14620, 13807, 14376, 14323, 13990, 14545, 13625, 14713,
    13328, 14840, 12882, 14931, 12528, 14996, 12233, 15039, 11829, 15066, 11525, 15080, 11295,
    15085, 10976, 15082, 10705, 15073, 10495, 13880, 14564, 13898, 14542, 13977, 14430, 14158,
    14124, 14393, 13732, 14556, 13410, 14702, 12996, 14814, 12596, 14891, 12291, 14937, 11834,
    14957, 11489, 14958, 11194, 14943, 10803, 14921, 10506, 14893, 10278, 14858, 9960, 14484, 14039,
    14487, 14025, 14499, 13941, 14524, 13740, 14574, 13468, 14654, 13106, 14743, 12678, 14818,
    12344, 14867, 11893, 14889, 11509, 14893, 11180, 14881, 10751, 14852, 10428, 14812, 10128,
    14765, 9754, 14712, 9466, 14764, 13480, 14764, 13475, 14766, 13440, 14766, 13347, 14769, 13070,
    14786, 12713, 14816, 12387, 14844, 11957, 14860, 11549, 14868, 11215, 14855, 10751, 14825,
    10403, 14782, 10044, 14729, 9651, 14666, 9352, 14599, 9029, 14967, 12835, 14966, 12831, 14963,
    12804, 14954, 12723, 14936, 12564, 14917, 12347, 14900, 11958, 14886, 11569, 14878, 11247,
    14859, 10765, 14828, 10401, 14784, 10011, 14727, 9600, 14660, 9289, 14586, 8893, 14508, 8533,
    15111, 12234, 15110, 12234, 15104, 12216, 15092, 12156, 15067, 12010, 15028, 11776, 14981,
    11500, 14942, 11205, 14902, 10752, 14861, 10393, 14812, 9991, 14752, 9570, 14682, 9252, 14603,
    8808, 14519, 8445, 14431, 8145, 15209, 11449, 15208, 11451, 15202, 11451, 15190, 11438, 15163,
    11384, 15117, 11274, 15055, 10979, 14994, 10648, 14932, 10343, 14871, 9936, 14803, 9532, 14729,
    9218, 14645, 8742, 14556, 8381, 14461, 8020, 14365, 7603, 15273, 10603, 15272, 10607, 15267,
    10619, 15256, 10631, 15231, 10614, 15182, 10535, 15118, 10389, 15042, 10167, 14963, 9787, 14883,
    9447, 14800, 9115, 14710, 8665, 14615, 8318, 14514, 7911, 14411, 7507, 14279, 7198, 15314, 9675,
    15313, 9683, 15309, 9712, 15298, 9759, 15277, 9797, 15229, 9773, 15166, 9668, 15084, 9487,
    14995, 9274, 14898, 8910, 14800, 8539, 14697, 8234, 14590, 7790, 14479, 7409, 14367, 7067,
    14178, 6621, 15337, 8619, 15337, 8631, 15333, 8677, 15325, 8769, 15305, 8871, 15264, 8940,
    15202, 8909, 15119, 8775, 15022, 8565, 14916, 8328, 14804, 8009, 14688, 7614, 14569, 7287,
    14448, 6888, 14321, 6483, 14088, 6171, 15350, 7402, 15350, 7419, 15347, 7480, 15340, 7613,
    15322, 7804, 15287, 7973, 15229, 8057, 15148, 8012, 15046, 7846, 14933, 7611, 14810, 7357,
    14682, 7069, 14552, 6656, 14421, 6316, 14251, 5948, 14007, 5528, 15356, 5942, 15356, 5977,
    15353, 6119, 15348, 6294, 15332, 6551, 15302, 6824, 15249, 7044, 15171, 7122, 15070, 7050,
    14949, 6861, 14818, 6611, 14679, 6349, 14538, 6067, 14398, 5651, 14189, 5311, 13935, 4958,
    15359, 4123, 15359, 4153, 15356, 4296, 15353, 4646, 15338, 5160, 15311, 5508, 15263, 5829,
    15188, 6042, 15088, 6094, 14966, 6001, 14826, 5796, 14678, 5543, 14527, 5287, 14377, 4985,
    14133, 4586, 13869, 4257, 15360, 1563, 15360, 1642, 15358, 2076, 15354, 2636, 15341, 3350,
    15317, 4019, 15273, 4429, 15203, 4732, 15105, 4911, 14981, 4932, 14836, 4818, 14679, 4621,
    14517, 4386, 14359, 4156, 14083, 3795, 13808, 3437, 15360, 122, 15360, 137, 15358, 285, 15355,
    636, 15344, 1274, 15322, 2177, 15281, 2765, 15215, 3223, 15120, 3451, 14995, 3569, 14846, 3567,
    14681, 3466, 14511, 3305, 14344, 3121, 14037, 2800, 13753, 2467, 15360, 0, 15360, 1, 15359, 21,
    15355, 89, 15346, 253, 15325, 479, 15287, 796, 15225, 1148, 15133, 1492, 15008, 1749, 14856,
    1882, 14685, 1886, 14506, 1783, 14324, 1608, 13996, 1398, 13702, 1183
  ]),
  ku = null;
function Au() {
  return (
    ku === null &&
      ((ku = new Zr(Ou, 16, 16, j, v)),
      (ku.name = 'DFG_LUT'),
      (ku.minFilter = c),
      (ku.magFilter = c),
      (ku.wrapS = r),
      (ku.wrapT = r),
      (ku.generateMipmaps = !1),
      (ku.needsUpdate = !0)),
    ku
  );
}
var ju = class {
    constructor(e = {}) {
      let {
        canvas: t = We(),
        context: n = null,
        depth: r = !0,
        stencil: i = !1,
        alpha: a = !1,
        antialias: o = !1,
        premultipliedAlpha: s = !0,
        preserveDrawingBuffer: c = !1,
        powerPreference: l = 'default',
        failIfMajorPerformanceCaveat: f = !1,
        reversedDepthBuffer: p = !1,
        outputBufferType: h = d
      } = e;
      this.isWebGLRenderer = !0;
      let _;
      if (n !== null) {
        if (typeof WebGLRenderingContext < 'u' && n instanceof WebGLRenderingContext)
          throw Error('THREE.WebGLRenderer: WebGL 1 is not supported since r163.');
        _ = n.getContextAttributes().alpha;
      } else _ = a;
      let S = h,
        C = new Set([N, M, A]),
        w = new Set([d, g, m, x, y, b]),
        T = new Uint32Array(4),
        E = new Int32Array(4),
        D = new J(),
        O = null,
        k = null,
        j = [],
        P = [],
        F = null;
      ((this.domElement = t),
        (this.debug = {
          checkShaderErrors: !0,
          onShaderError: null
        }),
        (this.autoClear = !0),
        (this.autoClearColor = !0),
        (this.autoClearDepth = !0),
        (this.autoClearStencil = !0),
        (this.sortObjects = !0),
        (this.clippingPlanes = []),
        (this.localClippingEnabled = !1),
        (this.toneMapping = 0),
        (this.toneMappingExposure = 1),
        (this.transmissionResolutionScale = 1));
      let I = this,
        ee = !1,
        te = null;
      this._outputColorSpace = Pe;
      let ne = 0,
        re = 0,
        L = null,
        R = -1,
        ie = null,
        z = new Ut(),
        ae = new Ut(),
        oe = null,
        se = new X(0),
        ce = 0,
        le = t.width,
        ue = t.height,
        de = 1,
        fe = null,
        pe = null,
        me = new Ut(0, 0, le, ue),
        he = new Ut(0, 0, le, ue),
        ge = !1,
        _e = new mi(),
        ve = !1,
        ye = !1,
        be = new Jt(),
        xe = new J(),
        Se = new Ut(),
        Ce = {
          background: null,
          fog: null,
          environment: null,
          overrideMaterial: null,
          isScene: !0
        },
        we = !1;
      function Te() {
        return L === null ? de : 1;
      }
      let B = n;
      function Ee(e, n) {
        return t.getContext(e, n);
      }
      try {
        let e = {
          alpha: !0,
          depth: r,
          stencil: i,
          antialias: o,
          premultipliedAlpha: s,
          preserveDrawingBuffer: c,
          powerPreference: l,
          failIfMajorPerformanceCaveat: f
        };
        if (
          ('setAttribute' in t && t.setAttribute('data-engine', 'three.js r184'),
          t.addEventListener('webglcontextlost', et, !1),
          t.addEventListener('webglcontextrestored', tt, !1),
          t.addEventListener('webglcontextcreationerror', nt, !1),
          B === null)
        ) {
          let t = 'webgl2';
          if (((B = Ee(t, e)), B === null))
            throw Ee(t)
              ? Error('Error creating WebGL context with your selected attributes.')
              : Error('Error creating WebGL context.');
        }
      } catch (e) {
        throw (G('WebGLRenderer: ' + e.message), e);
      }
      let De, Oe, V, ke, H, U, Ae, je, Me, Ne, Fe, Ie, Le, Re, ze, Ve, He, Ue, Ge, Ke, Je, Ye, Ze;
      function Qe() {
        ((De = new Ys(B)),
          De.init(),
          (Je = new yu(B, De)),
          (Oe = new Ts(B, De, e, Je)),
          (V = new _u(B, De)),
          Oe.reversedDepthBuffer && p && V.buffers.depth.setReversed(!0),
          (ke = new Qs(B)),
          (H = new Zl()),
          (U = new vu(B, De, V, H, Oe, Je, ke)),
          (Ae = new Js(I)),
          (je = new _s(B)),
          (Ye = new Cs(B, je)),
          (Me = new Xs(B, je, ke, Ye)),
          (Ne = new ec(B, Me, je, Ye, ke)),
          (Ue = new $s(B, Oe, U)),
          (ze = new Es(H)),
          (Fe = new Xl(I, Ae, De, Oe, Ye, ze)),
          (Ie = new Eu(I, H)),
          (Le = new tu()),
          (Re = new cu(De)),
          (He = new Ss(I, Ae, V, Ne, _, s)),
          (Ve = new gu(I, Ne, Oe)),
          (Ze = new Du(B, ke, Oe, V)),
          (Ge = new ws(B, De, ke)),
          (Ke = new Zs(B, De, ke)),
          (ke.programs = Fe.programs),
          (I.capabilities = Oe),
          (I.extensions = De),
          (I.properties = H),
          (I.renderLists = Le),
          (I.shadowMap = Ve),
          (I.state = V),
          (I.info = ke));
      }
      (Qe(), S !== 1009 && (F = new nc(S, t.width, t.height, r, i)));
      let $e = new Cu(I, B);
      ((this.xr = $e),
        (this.getContext = function () {
          return B;
        }),
        (this.getContextAttributes = function () {
          return B.getContextAttributes();
        }),
        (this.forceContextLoss = function () {
          let e = De.get('WEBGL_lose_context');
          e && e.loseContext();
        }),
        (this.forceContextRestore = function () {
          let e = De.get('WEBGL_lose_context');
          e && e.restoreContext();
        }),
        (this.getPixelRatio = function () {
          return de;
        }),
        (this.setPixelRatio = function (e) {
          e !== void 0 && ((de = e), this.setSize(le, ue, !1));
        }),
        (this.getSize = function (e) {
          return e.set(le, ue);
        }),
        (this.setSize = function (e, n, r = !0) {
          if ($e.isPresenting) {
            W("WebGLRenderer: Can't change size while VR device is presenting.");
            return;
          }
          ((le = e),
            (ue = n),
            (t.width = Math.floor(e * de)),
            (t.height = Math.floor(n * de)),
            r === !0 && ((t.style.width = e + 'px'), (t.style.height = n + 'px')),
            F !== null && F.setSize(t.width, t.height),
            this.setViewport(0, 0, e, n));
        }),
        (this.getDrawingBufferSize = function (e) {
          return e.set(le * de, ue * de).floor();
        }),
        (this.setDrawingBufferSize = function (e, n, r) {
          ((le = e),
            (ue = n),
            (de = r),
            (t.width = Math.floor(e * r)),
            (t.height = Math.floor(n * r)),
            this.setViewport(0, 0, e, n));
        }),
        (this.setEffects = function (e) {
          if (S === 1009) {
            G(
              'THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.'
            );
            return;
          }
          if (e) {
            for (let t = 0; t < e.length; t++)
              if (e[t].isOutputPass === !0) {
                W(
                  'THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.'
                );
                break;
              }
          }
          F.setEffects(e || []);
        }),
        (this.getCurrentViewport = function (e) {
          return e.copy(z);
        }),
        (this.getViewport = function (e) {
          return e.copy(me);
        }),
        (this.setViewport = function (e, t, n, r) {
          (e.isVector4 ? me.set(e.x, e.y, e.z, e.w) : me.set(e, t, n, r),
            V.viewport(z.copy(me).multiplyScalar(de).round()));
        }),
        (this.getScissor = function (e) {
          return e.copy(he);
        }),
        (this.setScissor = function (e, t, n, r) {
          (e.isVector4 ? he.set(e.x, e.y, e.z, e.w) : he.set(e, t, n, r),
            V.scissor(ae.copy(he).multiplyScalar(de).round()));
        }),
        (this.getScissorTest = function () {
          return ge;
        }),
        (this.setScissorTest = function (e) {
          V.setScissorTest((ge = e));
        }),
        (this.setOpaqueSort = function (e) {
          fe = e;
        }),
        (this.setTransparentSort = function (e) {
          pe = e;
        }),
        (this.getClearColor = function (e) {
          return e.copy(He.getClearColor());
        }),
        (this.setClearColor = function () {
          He.setClearColor(...arguments);
        }),
        (this.getClearAlpha = function () {
          return He.getClearAlpha();
        }),
        (this.setClearAlpha = function () {
          He.setClearAlpha(...arguments);
        }),
        (this.clear = function (e = !0, t = !0, n = !0) {
          let r = 0;
          if (e) {
            let e = !1;
            if (L !== null) {
              let t = L.texture.format;
              e = C.has(t);
            }
            if (e) {
              let e = L.texture.type,
                t = w.has(e),
                n = He.getClearColor(),
                r = He.getClearAlpha(),
                i = n.r,
                a = n.g,
                o = n.b;
              t
                ? ((T[0] = i), (T[1] = a), (T[2] = o), (T[3] = r), B.clearBufferuiv(B.COLOR, 0, T))
                : ((E[0] = i), (E[1] = a), (E[2] = o), (E[3] = r), B.clearBufferiv(B.COLOR, 0, E));
            } else r |= B.COLOR_BUFFER_BIT;
          }
          (t && ((r |= B.DEPTH_BUFFER_BIT), this.state.buffers.depth.setMask(!0)),
            n && ((r |= B.STENCIL_BUFFER_BIT), this.state.buffers.stencil.setMask(4294967295)),
            r !== 0 && B.clear(r));
        }),
        (this.clearColor = function () {
          this.clear(!0, !1, !1);
        }),
        (this.clearDepth = function () {
          this.clear(!1, !0, !1);
        }),
        (this.clearStencil = function () {
          this.clear(!1, !1, !0);
        }),
        (this.setNodesHandler = function (e) {
          (e.setRenderer(this), (te = e));
        }),
        (this.dispose = function () {
          (t.removeEventListener('webglcontextlost', et, !1),
            t.removeEventListener('webglcontextrestored', tt, !1),
            t.removeEventListener('webglcontextcreationerror', nt, !1),
            He.dispose(),
            Le.dispose(),
            Re.dispose(),
            H.dispose(),
            Ae.dispose(),
            Ne.dispose(),
            Ye.dispose(),
            Ze.dispose(),
            Fe.dispose(),
            $e.dispose(),
            $e.removeEventListener('sessionstart', ct),
            $e.removeEventListener('sessionend', lt),
            ut.stop());
        }));
      function et(e) {
        (e.preventDefault(), qe('WebGLRenderer: Context Lost.'), (ee = !0));
      }
      function tt() {
        (qe('WebGLRenderer: Context Restored.'), (ee = !1));
        let e = ke.autoReset,
          t = Ve.enabled,
          n = Ve.autoUpdate,
          r = Ve.needsUpdate,
          i = Ve.type;
        (Qe(),
          (ke.autoReset = e),
          (Ve.enabled = t),
          (Ve.autoUpdate = n),
          (Ve.needsUpdate = r),
          (Ve.type = i));
      }
      function nt(e) {
        G('WebGLRenderer: A WebGL context could not be created. Reason: ', e.statusMessage);
      }
      function rt(e) {
        let t = e.target;
        (t.removeEventListener('dispose', rt), K(t));
      }
      function K(e) {
        (it(e), H.remove(e));
      }
      function it(e) {
        let t = H.get(e).programs;
        t !== void 0 &&
          (t.forEach(function (e) {
            Fe.releaseProgram(e);
          }),
          e.isShaderMaterial && Fe.releaseShaderCache(e));
      }
      this.renderBufferDirect = function (e, t, n, r, i, a) {
        t === null && (t = Ce);
        let o = i.isMesh && i.matrixWorld.determinant() < 0,
          s = bt(e, t, n, r, i);
        V.setMaterial(r, o);
        let c = n.index,
          l = 1;
        if (r.wireframe === !0) {
          if (((c = Me.getWireframeAttribute(n)), c === void 0)) return;
          l = 2;
        }
        let u = n.drawRange,
          d = n.attributes.position,
          f = u.start * l,
          p = (u.start + u.count) * l;
        (a !== null && ((f = Math.max(f, a.start * l)), (p = Math.min(p, (a.start + a.count) * l))),
          c === null
            ? d != null && ((f = Math.max(f, 0)), (p = Math.min(p, d.count)))
            : ((f = Math.max(f, 0)), (p = Math.min(p, c.count))));
        let m = p - f;
        if (m < 0 || m === Infinity) return;
        Ye.setup(i, r, s, n, c);
        let h,
          g = Ge;
        if ((c !== null && ((h = je.get(c)), (g = Ke), g.setIndex(h)), i.isMesh))
          r.wireframe === !0
            ? (V.setLineWidth(r.wireframeLinewidth * Te()), g.setMode(B.LINES))
            : g.setMode(B.TRIANGLES);
        else if (i.isLine) {
          let e = r.linewidth;
          (e === void 0 && (e = 1),
            V.setLineWidth(e * Te()),
            i.isLineSegments
              ? g.setMode(B.LINES)
              : i.isLineLoop
                ? g.setMode(B.LINE_LOOP)
                : g.setMode(B.LINE_STRIP));
        } else i.isPoints ? g.setMode(B.POINTS) : i.isSprite && g.setMode(B.TRIANGLES);
        if (i.isBatchedMesh)
          if (De.get('WEBGL_multi_draw'))
            g.renderMultiDraw(i._multiDrawStarts, i._multiDrawCounts, i._multiDrawCount);
          else {
            let e = i._multiDrawStarts,
              t = i._multiDrawCounts,
              n = i._multiDrawCount,
              a = c ? je.get(c).bytesPerElement : 1,
              o = H.get(r).currentProgram.getUniforms();
            for (let r = 0; r < n; r++) (o.setValue(B, '_gl_DrawID', r), g.render(e[r] / a, t[r]));
          }
        else if (i.isInstancedMesh) g.renderInstances(f, m, i.count);
        else if (n.isInstancedBufferGeometry) {
          let e = n._maxInstanceCount === void 0 ? Infinity : n._maxInstanceCount,
            t = Math.min(n.instanceCount, e);
          g.renderInstances(f, m, t);
        } else g.render(f, m);
      };
      function at(e, t, n) {
        e.transparent === !0 && e.side === 2 && e.forceSinglePass === !1
          ? ((e.side = 1),
            (e.needsUpdate = !0),
            gt(e, t, n),
            (e.side = 0),
            (e.needsUpdate = !0),
            gt(e, t, n),
            (e.side = 2))
          : gt(e, t, n);
      }
      ((this.compile = function (e, t, n = null) {
        (n === null && (n = e),
          (k = Re.get(n)),
          k.init(t),
          P.push(k),
          n.traverseVisible(function (e) {
            e.isLight &&
              e.layers.test(t.layers) &&
              (k.pushLight(e), e.castShadow && k.pushShadow(e));
          }),
          e !== n &&
            e.traverseVisible(function (e) {
              e.isLight &&
                e.layers.test(t.layers) &&
                (k.pushLight(e), e.castShadow && k.pushShadow(e));
            }),
          k.setupLights());
        let r = /* @__PURE__ */ new Set();
        return (
          e.traverse(function (e) {
            if (!(e.isMesh || e.isPoints || e.isLine || e.isSprite)) return;
            let t = e.material;
            if (t)
              if (Array.isArray(t))
                for (let i = 0; i < t.length; i++) {
                  let a = t[i];
                  (at(a, n, e), r.add(a));
                }
              else (at(t, n, e), r.add(t));
          }),
          (k = P.pop()),
          r
        );
      }),
        (this.compileAsync = function (e, t, n = null) {
          let r = this.compile(e, t, n);
          return new Promise((t) => {
            function n() {
              if (
                (r.forEach(function (e) {
                  H.get(e).currentProgram.isReady() && r.delete(e);
                }),
                r.size === 0)
              ) {
                t(e);
                return;
              }
              setTimeout(n, 10);
            }
            De.get('KHR_parallel_shader_compile') === null ? setTimeout(n, 10) : n();
          });
        }));
      let ot = null;
      function st(e) {
        ot && ot(e);
      }
      function ct() {
        ut.stop();
      }
      function lt() {
        ut.start();
      }
      let ut = new gs();
      (ut.setAnimationLoop(st),
        typeof self < 'u' && ut.setContext(self),
        (this.setAnimationLoop = function (e) {
          ((ot = e), $e.setAnimationLoop(e), e === null ? ut.stop() : ut.start());
        }),
        $e.addEventListener('sessionstart', ct),
        $e.addEventListener('sessionend', lt),
        (this.render = function (e, t) {
          if (t !== void 0 && t.isCamera !== !0) {
            G('WebGLRenderer.render: camera is not an instance of THREE.Camera.');
            return;
          }
          if (ee === !0) return;
          te !== null && te.renderStart(e, t);
          let n = $e.enabled === !0 && $e.isPresenting === !0,
            r = F !== null && (L === null || n) && F.begin(I, L);
          if (
            (e.matrixWorldAutoUpdate === !0 && e.updateMatrixWorld(),
            t.parent === null && t.matrixWorldAutoUpdate === !0 && t.updateMatrixWorld(),
            $e.enabled === !0 &&
              $e.isPresenting === !0 &&
              (F === null || F.isCompositing() === !1) &&
              ($e.cameraAutoUpdate === !0 && $e.updateCamera(t), (t = $e.getCamera())),
            e.isScene === !0 && e.onBeforeRender(I, e, t, L),
            (k = Re.get(e, P.length)),
            k.init(t),
            (k.state.textureUnits = U.getTextureUnits()),
            P.push(k),
            be.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse),
            _e.setFromProjectionMatrix(be, Be, t.reversedDepth),
            (ye = this.localClippingEnabled),
            (ve = ze.init(this.clippingPlanes, ye)),
            (O = Le.get(e, j.length)),
            O.init(),
            j.push(O),
            $e.enabled === !0 && $e.isPresenting === !0)
          ) {
            let e = I.xr.getDepthSensingMesh();
            e !== null && dt(e, t, -Infinity, I.sortObjects);
          }
          (dt(e, t, 0, I.sortObjects),
            O.finish(),
            I.sortObjects === !0 && O.sort(fe, pe),
            (we = $e.enabled === !1 || $e.isPresenting === !1 || $e.hasDepthSensing() === !1),
            we && He.addToRenderList(O, e),
            this.info.render.frame++,
            ve === !0 && ze.beginShadows());
          let i = k.state.shadowsArray;
          if (
            (Ve.render(i, e, t),
            ve === !0 && ze.endShadows(),
            this.info.autoReset === !0 && this.info.reset(),
            (r && F.hasRenderPass()) === !1)
          ) {
            let n = O.opaque,
              r = O.transmissive;
            if ((k.setupLights(), t.isArrayCamera)) {
              let i = t.cameras;
              if (r.length > 0)
                for (let t = 0, a = i.length; t < a; t++) {
                  let a = i[t];
                  pt(n, r, e, a);
                }
              we && He.render(e);
              for (let t = 0, n = i.length; t < n; t++) {
                let n = i[t];
                ft(O, e, n, n.viewport);
              }
            } else (r.length > 0 && pt(n, r, e, t), we && He.render(e), ft(O, e, t));
          }
          (L !== null &&
            re === 0 &&
            (U.updateMultisampleRenderTarget(L), U.updateRenderTargetMipmap(L)),
            r && F.end(I),
            e.isScene === !0 && e.onAfterRender(I, e, t),
            Ye.resetDefaultState(),
            (R = -1),
            (ie = null),
            P.pop(),
            P.length > 0
              ? ((k = P[P.length - 1]),
                U.setTextureUnits(k.state.textureUnits),
                ve === !0 && ze.setGlobalState(I.clippingPlanes, k.state.camera))
              : (k = null),
            j.pop(),
            (O = j.length > 0 ? j[j.length - 1] : null),
            te !== null && te.renderEnd());
        }));
      function dt(e, t, n, r) {
        if (e.visible === !1) return;
        if (e.layers.test(t.layers)) {
          if (e.isGroup) n = e.renderOrder;
          else if (e.isLOD) e.autoUpdate === !0 && e.update(t);
          else if (e.isLightProbeGrid) k.pushLightProbeGrid(e);
          else if (e.isLight) (k.pushLight(e), e.castShadow && k.pushShadow(e));
          else if (e.isSprite) {
            if (!e.frustumCulled || _e.intersectsSprite(e)) {
              r && Se.setFromMatrixPosition(e.matrixWorld).applyMatrix4(be);
              let t = Ne.update(e),
                i = e.material;
              i.visible && O.push(e, t, i, n, Se.z, null);
            }
          } else if (
            (e.isMesh || e.isLine || e.isPoints) &&
            (!e.frustumCulled || _e.intersectsObject(e))
          ) {
            let t = Ne.update(e),
              i = e.material;
            if (
              (r &&
                (e.boundingSphere === void 0
                  ? (t.boundingSphere === null && t.computeBoundingSphere(),
                    Se.copy(t.boundingSphere.center))
                  : (e.boundingSphere === null && e.computeBoundingSphere(),
                    Se.copy(e.boundingSphere.center)),
                Se.applyMatrix4(e.matrixWorld).applyMatrix4(be)),
              Array.isArray(i))
            ) {
              let r = t.groups;
              for (let a = 0, o = r.length; a < o; a++) {
                let o = r[a],
                  s = i[o.materialIndex];
                s && s.visible && O.push(e, t, s, n, Se.z, o);
              }
            } else i.visible && O.push(e, t, i, n, Se.z, null);
          }
        }
        let i = e.children;
        for (let e = 0, a = i.length; e < a; e++) dt(i[e], t, n, r);
      }
      function ft(e, t, n, r) {
        let { opaque: i, transmissive: a, transparent: o } = e;
        (k.setupLightsView(n),
          ve === !0 && ze.setGlobalState(I.clippingPlanes, n),
          r && V.viewport(z.copy(r)),
          i.length > 0 && mt(i, t, n),
          a.length > 0 && mt(a, t, n),
          o.length > 0 && mt(o, t, n),
          V.buffers.depth.setTest(!0),
          V.buffers.depth.setMask(!0),
          V.buffers.color.setMask(!0),
          V.setPolygonOffset(!1));
      }
      function pt(e, t, n, r) {
        if ((n.isScene === !0 ? n.overrideMaterial : null) !== null) return;
        if (k.state.transmissionRenderTarget[r.id] === void 0) {
          let e = De.has('EXT_color_buffer_half_float') || De.has('EXT_color_buffer_float');
          k.state.transmissionRenderTarget[r.id] = new Gt(1, 1, {
            generateMipmaps: !0,
            type: e ? v : d,
            minFilter: u,
            samples: Math.max(4, Oe.samples),
            stencilBuffer: i,
            resolveDepthBuffer: !1,
            resolveStencilBuffer: !1,
            colorSpace: Mt.workingColorSpace
          });
        }
        let a = k.state.transmissionRenderTarget[r.id],
          o = r.viewport || z;
        a.setSize(o.z * I.transmissionResolutionScale, o.w * I.transmissionResolutionScale);
        let s = I.getRenderTarget(),
          c = I.getActiveCubeFace(),
          l = I.getActiveMipmapLevel();
        (I.setRenderTarget(a),
          I.getClearColor(se),
          (ce = I.getClearAlpha()),
          ce < 1 && I.setClearColor(16777215, 0.5),
          I.clear(),
          we && He.render(n));
        let f = I.toneMapping;
        I.toneMapping = 0;
        let p = r.viewport;
        if (
          (r.viewport !== void 0 && (r.viewport = void 0),
          k.setupLightsView(r),
          ve === !0 && ze.setGlobalState(I.clippingPlanes, r),
          mt(e, n, r),
          U.updateMultisampleRenderTarget(a),
          U.updateRenderTargetMipmap(a),
          De.has('WEBGL_multisampled_render_to_texture') === !1)
        ) {
          let e = !1;
          for (let i = 0, a = t.length; i < a; i++) {
            let { object: a, geometry: o, material: s, group: c } = t[i];
            if (s.side === 2 && a.layers.test(r.layers)) {
              let t = s.side;
              ((s.side = 1),
                (s.needsUpdate = !0),
                ht(a, n, r, o, s, c),
                (s.side = t),
                (s.needsUpdate = !0),
                (e = !0));
            }
          }
          e === !0 && (U.updateMultisampleRenderTarget(a), U.updateRenderTargetMipmap(a));
        }
        (I.setRenderTarget(s, c, l),
          I.setClearColor(se, ce),
          p !== void 0 && (r.viewport = p),
          (I.toneMapping = f));
      }
      function mt(e, t, n) {
        let r = t.isScene === !0 ? t.overrideMaterial : null;
        for (let i = 0, a = e.length; i < a; i++) {
          let a = e[i],
            { object: o, geometry: s, group: c } = a,
            l = a.material;
          (l.allowOverride === !0 && r !== null && (l = r),
            o.layers.test(n.layers) && ht(o, t, n, s, l, c));
        }
      }
      function ht(e, t, n, r, i, a) {
        (e.onBeforeRender(I, t, n, r, i, a),
          e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse, e.matrixWorld),
          e.normalMatrix.getNormalMatrix(e.modelViewMatrix),
          i.onBeforeRender(I, t, n, r, e, a),
          i.transparent === !0 && i.side === 2 && i.forceSinglePass === !1
            ? ((i.side = 1),
              (i.needsUpdate = !0),
              I.renderBufferDirect(n, t, r, i, e, a),
              (i.side = 0),
              (i.needsUpdate = !0),
              I.renderBufferDirect(n, t, r, i, e, a),
              (i.side = 2))
            : I.renderBufferDirect(n, t, r, i, e, a),
          e.onAfterRender(I, t, n, r, i, a));
      }
      function gt(e, t, n) {
        t.isScene !== !0 && (t = Ce);
        let r = H.get(e),
          i = k.state.lights,
          a = k.state.shadowsArray,
          o = i.state.version,
          s = Fe.getParameters(e, i.state, a, t, n, k.state.lightProbeGridArray),
          c = Fe.getProgramCacheKey(s),
          l = r.programs;
        ((r.environment =
          e.isMeshStandardMaterial || e.isMeshLambertMaterial || e.isMeshPhongMaterial
            ? t.environment
            : null),
          (r.fog = t.fog));
        let u =
          e.isMeshStandardMaterial ||
          (e.isMeshLambertMaterial && !e.envMap) ||
          (e.isMeshPhongMaterial && !e.envMap);
        ((r.envMap = Ae.get(e.envMap || r.environment, u)),
          (r.envMapRotation =
            r.environment !== null && e.envMap === null ? t.environmentRotation : e.envMapRotation),
          l === void 0 &&
            (e.addEventListener('dispose', rt), (l = /* @__PURE__ */ new Map()), (r.programs = l)));
        let d = l.get(c);
        if (d !== void 0) {
          if (r.currentProgram === d && r.lightsStateVersion === o) return (vt(e, s), d);
        } else
          ((s.uniforms = Fe.getUniforms(e)),
            te !== null && e.isNodeMaterial && te.build(e, n, s),
            e.onBeforeCompile(s, I),
            (d = Fe.acquireProgram(s, c)),
            l.set(c, d),
            (r.uniforms = s.uniforms));
        let f = r.uniforms;
        return (
          ((!e.isShaderMaterial && !e.isRawShaderMaterial) || e.clipping === !0) &&
            (f.clippingPlanes = ze.uniform),
          vt(e, s),
          (r.needsLights = St(e)),
          (r.lightsStateVersion = o),
          r.needsLights &&
            ((f.ambientLightColor.value = i.state.ambient),
            (f.lightProbe.value = i.state.probe),
            (f.directionalLights.value = i.state.directional),
            (f.directionalLightShadows.value = i.state.directionalShadow),
            (f.spotLights.value = i.state.spot),
            (f.spotLightShadows.value = i.state.spotShadow),
            (f.rectAreaLights.value = i.state.rectArea),
            (f.ltc_1.value = i.state.rectAreaLTC1),
            (f.ltc_2.value = i.state.rectAreaLTC2),
            (f.pointLights.value = i.state.point),
            (f.pointLightShadows.value = i.state.pointShadow),
            (f.hemisphereLights.value = i.state.hemi),
            (f.directionalShadowMatrix.value = i.state.directionalShadowMatrix),
            (f.spotLightMatrix.value = i.state.spotLightMatrix),
            (f.spotLightMap.value = i.state.spotLightMap),
            (f.pointShadowMatrix.value = i.state.pointShadowMatrix)),
          (r.lightProbeGrid = k.state.lightProbeGridArray.length > 0),
          (r.currentProgram = d),
          (r.uniformsList = null),
          d
        );
      }
      function _t(e) {
        if (e.uniformsList === null) {
          let t = e.currentProgram.getUniforms();
          e.uniformsList = ll.seqWithValue(t.seq, e.uniforms);
        }
        return e.uniformsList;
      }
      function vt(e, t) {
        let n = H.get(e);
        ((n.outputColorSpace = t.outputColorSpace),
          (n.batching = t.batching),
          (n.batchingColor = t.batchingColor),
          (n.instancing = t.instancing),
          (n.instancingColor = t.instancingColor),
          (n.instancingMorph = t.instancingMorph),
          (n.skinning = t.skinning),
          (n.morphTargets = t.morphTargets),
          (n.morphNormals = t.morphNormals),
          (n.morphColors = t.morphColors),
          (n.morphTargetsCount = t.morphTargetsCount),
          (n.numClippingPlanes = t.numClippingPlanes),
          (n.numIntersection = t.numClipIntersection),
          (n.vertexAlphas = t.vertexAlphas),
          (n.vertexTangents = t.vertexTangents),
          (n.toneMapping = t.toneMapping));
      }
      function yt(e, t) {
        if (e.length === 0) return null;
        if (e.length === 1) return e[0].texture === null ? null : e[0];
        D.setFromMatrixPosition(t.matrixWorld);
        for (let t = 0, n = e.length; t < n; t++) {
          let n = e[t];
          if (n.texture !== null && n.boundingBox.containsPoint(D)) return n;
        }
        return null;
      }
      function bt(e, t, n, r, i) {
        (t.isScene !== !0 && (t = Ce), U.resetTextureUnits());
        let a = t.fog,
          o =
            r.isMeshStandardMaterial || r.isMeshLambertMaterial || r.isMeshPhongMaterial
              ? t.environment
              : null,
          s =
            L === null
              ? I.outputColorSpace
              : L.isXRRenderTarget === !0
                ? L.texture.colorSpace
                : Mt.workingColorSpace,
          c =
            r.isMeshStandardMaterial ||
            (r.isMeshLambertMaterial && !r.envMap) ||
            (r.isMeshPhongMaterial && !r.envMap),
          l = Ae.get(r.envMap || o, c),
          u = r.vertexColors === !0 && !!n.attributes.color && n.attributes.color.itemSize === 4,
          d = !!n.attributes.tangent && (!!r.normalMap || r.anisotropy > 0),
          f = !!n.morphAttributes.position,
          p = !!n.morphAttributes.normal,
          m = !!n.morphAttributes.color,
          h = 0;
        r.toneMapped && (L === null || L.isXRRenderTarget === !0) && (h = I.toneMapping);
        let g = n.morphAttributes.position || n.morphAttributes.normal || n.morphAttributes.color,
          _ = g === void 0 ? 0 : g.length,
          v = H.get(r),
          y = k.state.lights;
        if (ve === !0 && (ye === !0 || e !== ie)) {
          let t = e === ie && r.id === R;
          ze.setState(r, e, t);
        }
        let b = !1;
        r.version === v.__version
          ? v.needsLights && v.lightsStateVersion !== y.state.version
            ? (b = !0)
            : v.outputColorSpace === s
              ? (i.isBatchedMesh && v.batching === !1) ||
                (!i.isBatchedMesh && v.batching === !0) ||
                (i.isBatchedMesh && v.batchingColor === !0 && i.colorTexture === null) ||
                (i.isBatchedMesh && v.batchingColor === !1 && i.colorTexture !== null) ||
                (i.isInstancedMesh && v.instancing === !1) ||
                (!i.isInstancedMesh && v.instancing === !0) ||
                (i.isSkinnedMesh && v.skinning === !1) ||
                (!i.isSkinnedMesh && v.skinning === !0) ||
                (i.isInstancedMesh && v.instancingColor === !0 && i.instanceColor === null) ||
                (i.isInstancedMesh && v.instancingColor === !1 && i.instanceColor !== null) ||
                (i.isInstancedMesh && v.instancingMorph === !0 && i.morphTexture === null) ||
                (i.isInstancedMesh && v.instancingMorph === !1 && i.morphTexture !== null)
                ? (b = !0)
                : v.envMap === l
                  ? (r.fog === !0 && v.fog !== a) ||
                    (v.numClippingPlanes !== void 0 &&
                      (v.numClippingPlanes !== ze.numPlanes ||
                        v.numIntersection !== ze.numIntersection))
                    ? (b = !0)
                    : v.vertexAlphas === u &&
                        v.vertexTangents === d &&
                        v.morphTargets === f &&
                        v.morphNormals === p &&
                        v.morphColors === m &&
                        v.toneMapping === h &&
                        v.morphTargetsCount === _
                      ? !!v.lightProbeGrid != k.state.lightProbeGridArray.length > 0 && (b = !0)
                      : (b = !0)
                  : (b = !0)
              : (b = !0)
          : ((b = !0), (v.__version = r.version));
        let x = v.currentProgram;
        b === !0 && ((x = gt(r, t, i)), te && r.isNodeMaterial && te.onUpdateProgram(r, x, v));
        let S = !1,
          C = !1,
          w = !1,
          T = x.getUniforms(),
          E = v.uniforms;
        if (
          (V.useProgram(x.program) && ((S = !0), (C = !0), (w = !0)),
          r.id !== R && ((R = r.id), (C = !0)),
          v.needsLights)
        ) {
          let e = yt(k.state.lightProbeGridArray, i);
          v.lightProbeGrid !== e && ((v.lightProbeGrid = e), (C = !0));
        }
        if (S || ie !== e) {
          (V.buffers.depth.getReversed() &&
            e.reversedDepth !== !0 &&
            ((e._reversedDepth = !0), e.updateProjectionMatrix()),
            T.setValue(B, 'projectionMatrix', e.projectionMatrix),
            T.setValue(B, 'viewMatrix', e.matrixWorldInverse));
          let t = T.map.cameraPosition;
          (t !== void 0 && t.setValue(B, xe.setFromMatrixPosition(e.matrixWorld)),
            Oe.logarithmicDepthBuffer &&
              T.setValue(B, 'logDepthBufFC', 2 / (Math.log(e.far + 1) / Math.LN2)),
            (r.isMeshPhongMaterial ||
              r.isMeshToonMaterial ||
              r.isMeshLambertMaterial ||
              r.isMeshBasicMaterial ||
              r.isMeshStandardMaterial ||
              r.isShaderMaterial) &&
              T.setValue(B, 'isOrthographic', e.isOrthographicCamera === !0),
            ie !== e && ((ie = e), (C = !0), (w = !0)));
        }
        if (
          (v.needsLights &&
            (y.state.directionalShadowMap.length > 0 &&
              T.setValue(B, 'directionalShadowMap', y.state.directionalShadowMap, U),
            y.state.spotShadowMap.length > 0 &&
              T.setValue(B, 'spotShadowMap', y.state.spotShadowMap, U),
            y.state.pointShadowMap.length > 0 &&
              T.setValue(B, 'pointShadowMap', y.state.pointShadowMap, U)),
          i.isSkinnedMesh)
        ) {
          (T.setOptional(B, i, 'bindMatrix'), T.setOptional(B, i, 'bindMatrixInverse'));
          let e = i.skeleton;
          e &&
            (e.boneTexture === null && e.computeBoneTexture(),
            T.setValue(B, 'boneTexture', e.boneTexture, U));
        }
        i.isBatchedMesh &&
          (T.setOptional(B, i, 'batchingTexture'),
          T.setValue(B, 'batchingTexture', i._matricesTexture, U),
          T.setOptional(B, i, 'batchingIdTexture'),
          T.setValue(B, 'batchingIdTexture', i._indirectTexture, U),
          T.setOptional(B, i, 'batchingColorTexture'),
          i._colorsTexture !== null && T.setValue(B, 'batchingColorTexture', i._colorsTexture, U));
        let D = n.morphAttributes;
        if (
          ((D.position !== void 0 || D.normal !== void 0 || D.color !== void 0) &&
            Ue.update(i, n, x),
          (C || v.receiveShadow !== i.receiveShadow) &&
            ((v.receiveShadow = i.receiveShadow), T.setValue(B, 'receiveShadow', i.receiveShadow)),
          (r.isMeshStandardMaterial || r.isMeshLambertMaterial || r.isMeshPhongMaterial) &&
            r.envMap === null &&
            t.environment !== null &&
            (E.envMapIntensity.value = t.environmentIntensity),
          E.dfgLUT !== void 0 && (E.dfgLUT.value = Au()),
          C)
        ) {
          if (
            (T.setValue(B, 'toneMappingExposure', I.toneMappingExposure),
            v.needsLights && xt(E, w),
            a && r.fog === !0 && Ie.refreshFogUniforms(E, a),
            Ie.refreshMaterialUniforms(E, r, de, ue, k.state.transmissionRenderTarget[e.id]),
            v.needsLights && v.lightProbeGrid)
          ) {
            let e = v.lightProbeGrid;
            ((E.probesSH.value = e.texture),
              E.probesMin.value.copy(e.boundingBox.min),
              E.probesMax.value.copy(e.boundingBox.max),
              E.probesResolution.value.copy(e.resolution));
          }
          ll.upload(B, _t(v), E, U);
        }
        if (
          (r.isShaderMaterial &&
            r.uniformsNeedUpdate === !0 &&
            (ll.upload(B, _t(v), E, U), (r.uniformsNeedUpdate = !1)),
          r.isSpriteMaterial && T.setValue(B, 'center', i.center),
          T.setValue(B, 'modelViewMatrix', i.modelViewMatrix),
          T.setValue(B, 'normalMatrix', i.normalMatrix),
          T.setValue(B, 'modelMatrix', i.matrixWorld),
          r.uniformsGroups !== void 0)
        ) {
          let e = r.uniformsGroups;
          for (let t = 0, n = e.length; t < n; t++) {
            let n = e[t];
            (Ze.update(n, x), Ze.bind(n, x));
          }
        }
        return x;
      }
      function xt(e, t) {
        ((e.ambientLightColor.needsUpdate = t),
          (e.lightProbe.needsUpdate = t),
          (e.directionalLights.needsUpdate = t),
          (e.directionalLightShadows.needsUpdate = t),
          (e.pointLights.needsUpdate = t),
          (e.pointLightShadows.needsUpdate = t),
          (e.spotLights.needsUpdate = t),
          (e.spotLightShadows.needsUpdate = t),
          (e.rectAreaLights.needsUpdate = t),
          (e.hemisphereLights.needsUpdate = t));
      }
      function St(e) {
        return (
          e.isMeshLambertMaterial ||
          e.isMeshToonMaterial ||
          e.isMeshPhongMaterial ||
          e.isMeshStandardMaterial ||
          e.isShadowMaterial ||
          (e.isShaderMaterial && e.lights === !0)
        );
      }
      ((this.getActiveCubeFace = function () {
        return ne;
      }),
        (this.getActiveMipmapLevel = function () {
          return re;
        }),
        (this.getRenderTarget = function () {
          return L;
        }),
        (this.setRenderTargetTextures = function (e, t, n) {
          let r = H.get(e);
          ((r.__autoAllocateDepthBuffer = e.resolveDepthBuffer === !1),
            r.__autoAllocateDepthBuffer === !1 && (r.__useRenderToTexture = !1),
            (H.get(e.texture).__webglTexture = t),
            (H.get(e.depthTexture).__webglTexture = r.__autoAllocateDepthBuffer ? void 0 : n),
            (r.__hasExternalTextures = !0));
        }),
        (this.setRenderTargetFramebuffer = function (e, t) {
          let n = H.get(e);
          ((n.__webglFramebuffer = t), (n.__useDefaultFramebuffer = t === void 0));
        }));
      let Ct = B.createFramebuffer();
      ((this.setRenderTarget = function (e, t = 0, n = 0) {
        ((L = e), (ne = t), (re = n));
        let r = null,
          i = !1,
          a = !1;
        if (e) {
          let o = H.get(e);
          if (o.__useDefaultFramebuffer !== void 0) {
            (V.bindFramebuffer(B.FRAMEBUFFER, o.__webglFramebuffer),
              z.copy(e.viewport),
              ae.copy(e.scissor),
              (oe = e.scissorTest),
              V.viewport(z),
              V.scissor(ae),
              V.setScissorTest(oe),
              (R = -1));
            return;
          } else if (o.__webglFramebuffer === void 0) U.setupRenderTarget(e);
          else if (o.__hasExternalTextures)
            U.rebindTextures(
              e,
              H.get(e.texture).__webglTexture,
              H.get(e.depthTexture).__webglTexture
            );
          else if (e.depthBuffer) {
            let t = e.depthTexture;
            if (o.__boundDepthTexture !== t) {
              if (
                t !== null &&
                H.has(t) &&
                (e.width !== t.image.width || e.height !== t.image.height)
              )
                throw Error(
                  'WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.'
                );
              U.setupDepthRenderbuffer(e);
            }
          }
          let s = e.texture;
          (s.isData3DTexture || s.isDataArrayTexture || s.isCompressedArrayTexture) && (a = !0);
          let c = H.get(e).__webglFramebuffer;
          (e.isWebGLCubeRenderTarget
            ? ((r = Array.isArray(c[t]) ? c[t][n] : c[t]), (i = !0))
            : (r =
                e.samples > 0 && U.useMultisampledRTT(e) === !1
                  ? H.get(e).__webglMultisampledFramebuffer
                  : Array.isArray(c)
                    ? c[n]
                    : c),
            z.copy(e.viewport),
            ae.copy(e.scissor),
            (oe = e.scissorTest));
        } else
          (z.copy(me).multiplyScalar(de).floor(),
            ae.copy(he).multiplyScalar(de).floor(),
            (oe = ge));
        if (
          (n !== 0 && (r = Ct),
          V.bindFramebuffer(B.FRAMEBUFFER, r) && V.drawBuffers(e, r),
          V.viewport(z),
          V.scissor(ae),
          V.setScissorTest(oe),
          i)
        ) {
          let r = H.get(e.texture);
          B.framebufferTexture2D(
            B.FRAMEBUFFER,
            B.COLOR_ATTACHMENT0,
            B.TEXTURE_CUBE_MAP_POSITIVE_X + t,
            r.__webglTexture,
            n
          );
        } else if (a) {
          let r = t;
          for (let t = 0; t < e.textures.length; t++) {
            let i = H.get(e.textures[t]);
            B.framebufferTextureLayer(
              B.FRAMEBUFFER,
              B.COLOR_ATTACHMENT0 + t,
              i.__webglTexture,
              n,
              r
            );
          }
        } else if (e !== null && n !== 0) {
          let t = H.get(e.texture);
          B.framebufferTexture2D(
            B.FRAMEBUFFER,
            B.COLOR_ATTACHMENT0,
            B.TEXTURE_2D,
            t.__webglTexture,
            n
          );
        }
        R = -1;
      }),
        (this.readRenderTargetPixels = function (e, t, n, r, i, a, o, s = 0) {
          if (!(e && e.isWebGLRenderTarget)) {
            G('WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.');
            return;
          }
          let c = H.get(e).__webglFramebuffer;
          if ((e.isWebGLCubeRenderTarget && o !== void 0 && (c = c[o]), c)) {
            V.bindFramebuffer(B.FRAMEBUFFER, c);
            try {
              let o = e.textures[s],
                c = o.format,
                l = o.type;
              if (
                (e.textures.length > 1 && B.readBuffer(B.COLOR_ATTACHMENT0 + s),
                !Oe.textureFormatReadable(c))
              ) {
                G(
                  'WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.'
                );
                return;
              }
              if (!Oe.textureTypeReadable(l)) {
                G(
                  'WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.'
                );
                return;
              }
              t >= 0 &&
                t <= e.width - r &&
                n >= 0 &&
                n <= e.height - i &&
                B.readPixels(t, n, r, i, Je.convert(c), Je.convert(l), a);
            } finally {
              let e = L === null ? null : H.get(L).__webglFramebuffer;
              V.bindFramebuffer(B.FRAMEBUFFER, e);
            }
          }
        }),
        (this.readRenderTargetPixelsAsync = async function (e, t, n, r, i, a, o, s = 0) {
          if (!(e && e.isWebGLRenderTarget))
            throw Error(
              'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.'
            );
          let c = H.get(e).__webglFramebuffer;
          if ((e.isWebGLCubeRenderTarget && o !== void 0 && (c = c[o]), c))
            if (t >= 0 && t <= e.width - r && n >= 0 && n <= e.height - i) {
              V.bindFramebuffer(B.FRAMEBUFFER, c);
              let o = e.textures[s],
                l = o.format,
                u = o.type;
              if (
                (e.textures.length > 1 && B.readBuffer(B.COLOR_ATTACHMENT0 + s),
                !Oe.textureFormatReadable(l))
              )
                throw Error(
                  'THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.'
                );
              if (!Oe.textureTypeReadable(u))
                throw Error(
                  'THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.'
                );
              let d = B.createBuffer();
              (B.bindBuffer(B.PIXEL_PACK_BUFFER, d),
                B.bufferData(B.PIXEL_PACK_BUFFER, a.byteLength, B.STREAM_READ),
                B.readPixels(t, n, r, i, Je.convert(l), Je.convert(u), 0));
              let f = L === null ? null : H.get(L).__webglFramebuffer;
              V.bindFramebuffer(B.FRAMEBUFFER, f);
              let p = B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE, 0);
              return (
                B.flush(),
                await Xe(B, p, 4),
                B.bindBuffer(B.PIXEL_PACK_BUFFER, d),
                B.getBufferSubData(B.PIXEL_PACK_BUFFER, 0, a),
                B.deleteBuffer(d),
                B.deleteSync(p),
                a
              );
            } else
              throw Error(
                'THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.'
              );
        }),
        (this.copyFramebufferToTexture = function (e, t = null, n = 0) {
          let r = 2 ** -n,
            i = Math.floor(e.image.width * r),
            a = Math.floor(e.image.height * r),
            o = t === null ? 0 : t.x,
            s = t === null ? 0 : t.y;
          (U.setTexture2D(e, 0),
            B.copyTexSubImage2D(B.TEXTURE_2D, n, 0, 0, o, s, i, a),
            V.unbindTexture());
        }));
      let wt = B.createFramebuffer(),
        q = B.createFramebuffer();
      ((this.copyTextureToTexture = function (e, t, n = null, r = null, i = 0, a = 0) {
        let o,
          s,
          c,
          l,
          u,
          d,
          f,
          p,
          m,
          h = e.isCompressedTexture ? e.mipmaps[a] : e.image;
        if (n !== null)
          ((o = n.max.x - n.min.x),
            (s = n.max.y - n.min.y),
            (c = n.isBox3 ? n.max.z - n.min.z : 1),
            (l = n.min.x),
            (u = n.min.y),
            (d = n.isBox3 ? n.min.z : 0));
        else {
          let t = 2 ** -i;
          ((o = Math.floor(h.width * t)),
            (s = Math.floor(h.height * t)),
            (c = e.isDataArrayTexture ? h.depth : e.isData3DTexture ? Math.floor(h.depth * t) : 1),
            (l = 0),
            (u = 0),
            (d = 0));
        }
        r === null ? ((f = 0), (p = 0), (m = 0)) : ((f = r.x), (p = r.y), (m = r.z));
        let g = Je.convert(t.format),
          _ = Je.convert(t.type),
          v;
        (t.isData3DTexture
          ? (U.setTexture3D(t, 0), (v = B.TEXTURE_3D))
          : t.isDataArrayTexture || t.isCompressedArrayTexture
            ? (U.setTexture2DArray(t, 0), (v = B.TEXTURE_2D_ARRAY))
            : (U.setTexture2D(t, 0), (v = B.TEXTURE_2D)),
          V.activeTexture(B.TEXTURE0),
          V.pixelStorei(B.UNPACK_FLIP_Y_WEBGL, t.flipY),
          V.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL, t.premultiplyAlpha),
          V.pixelStorei(B.UNPACK_ALIGNMENT, t.unpackAlignment));
        let y = V.getParameter(B.UNPACK_ROW_LENGTH),
          b = V.getParameter(B.UNPACK_IMAGE_HEIGHT),
          x = V.getParameter(B.UNPACK_SKIP_PIXELS),
          S = V.getParameter(B.UNPACK_SKIP_ROWS),
          C = V.getParameter(B.UNPACK_SKIP_IMAGES);
        (V.pixelStorei(B.UNPACK_ROW_LENGTH, h.width),
          V.pixelStorei(B.UNPACK_IMAGE_HEIGHT, h.height),
          V.pixelStorei(B.UNPACK_SKIP_PIXELS, l),
          V.pixelStorei(B.UNPACK_SKIP_ROWS, u),
          V.pixelStorei(B.UNPACK_SKIP_IMAGES, d));
        let w = e.isDataArrayTexture || e.isData3DTexture,
          T = t.isDataArrayTexture || t.isData3DTexture;
        if (e.isDepthTexture) {
          let n = H.get(e),
            r = H.get(t),
            h = H.get(n.__renderTarget),
            g = H.get(r.__renderTarget);
          (V.bindFramebuffer(B.READ_FRAMEBUFFER, h.__webglFramebuffer),
            V.bindFramebuffer(B.DRAW_FRAMEBUFFER, g.__webglFramebuffer));
          for (let n = 0; n < c; n++)
            (w &&
              (B.framebufferTextureLayer(
                B.READ_FRAMEBUFFER,
                B.COLOR_ATTACHMENT0,
                H.get(e).__webglTexture,
                i,
                d + n
              ),
              B.framebufferTextureLayer(
                B.DRAW_FRAMEBUFFER,
                B.COLOR_ATTACHMENT0,
                H.get(t).__webglTexture,
                a,
                m + n
              )),
              B.blitFramebuffer(l, u, o, s, f, p, o, s, B.DEPTH_BUFFER_BIT, B.NEAREST));
          (V.bindFramebuffer(B.READ_FRAMEBUFFER, null),
            V.bindFramebuffer(B.DRAW_FRAMEBUFFER, null));
        } else if (i !== 0 || e.isRenderTargetTexture || H.has(e)) {
          let n = H.get(e),
            r = H.get(t);
          (V.bindFramebuffer(B.READ_FRAMEBUFFER, wt), V.bindFramebuffer(B.DRAW_FRAMEBUFFER, q));
          for (let e = 0; e < c; e++)
            (w
              ? B.framebufferTextureLayer(
                  B.READ_FRAMEBUFFER,
                  B.COLOR_ATTACHMENT0,
                  n.__webglTexture,
                  i,
                  d + e
                )
              : B.framebufferTexture2D(
                  B.READ_FRAMEBUFFER,
                  B.COLOR_ATTACHMENT0,
                  B.TEXTURE_2D,
                  n.__webglTexture,
                  i
                ),
              T
                ? B.framebufferTextureLayer(
                    B.DRAW_FRAMEBUFFER,
                    B.COLOR_ATTACHMENT0,
                    r.__webglTexture,
                    a,
                    m + e
                  )
                : B.framebufferTexture2D(
                    B.DRAW_FRAMEBUFFER,
                    B.COLOR_ATTACHMENT0,
                    B.TEXTURE_2D,
                    r.__webglTexture,
                    a
                  ),
              i === 0
                ? T
                  ? B.copyTexSubImage3D(v, a, f, p, m + e, l, u, o, s)
                  : B.copyTexSubImage2D(v, a, f, p, l, u, o, s)
                : B.blitFramebuffer(l, u, o, s, f, p, o, s, B.COLOR_BUFFER_BIT, B.NEAREST));
          (V.bindFramebuffer(B.READ_FRAMEBUFFER, null),
            V.bindFramebuffer(B.DRAW_FRAMEBUFFER, null));
        } else
          T
            ? e.isDataTexture || e.isData3DTexture
              ? B.texSubImage3D(v, a, f, p, m, o, s, c, g, _, h.data)
              : t.isCompressedArrayTexture
                ? B.compressedTexSubImage3D(v, a, f, p, m, o, s, c, g, h.data)
                : B.texSubImage3D(v, a, f, p, m, o, s, c, g, _, h)
            : e.isDataTexture
              ? B.texSubImage2D(B.TEXTURE_2D, a, f, p, o, s, g, _, h.data)
              : e.isCompressedTexture
                ? B.compressedTexSubImage2D(B.TEXTURE_2D, a, f, p, h.width, h.height, g, h.data)
                : B.texSubImage2D(B.TEXTURE_2D, a, f, p, o, s, g, _, h);
        (V.pixelStorei(B.UNPACK_ROW_LENGTH, y),
          V.pixelStorei(B.UNPACK_IMAGE_HEIGHT, b),
          V.pixelStorei(B.UNPACK_SKIP_PIXELS, x),
          V.pixelStorei(B.UNPACK_SKIP_ROWS, S),
          V.pixelStorei(B.UNPACK_SKIP_IMAGES, C),
          a === 0 && t.generateMipmaps && B.generateMipmap(v),
          V.unbindTexture());
      }),
        (this.initRenderTarget = function (e) {
          H.get(e).__webglFramebuffer === void 0 && U.setupRenderTarget(e);
        }),
        (this.initTexture = function (e) {
          (e.isCubeTexture
            ? U.setTextureCube(e, 0)
            : e.isData3DTexture
              ? U.setTexture3D(e, 0)
              : e.isDataArrayTexture || e.isCompressedArrayTexture
                ? U.setTexture2DArray(e, 0)
                : U.setTexture2D(e, 0),
            V.unbindTexture());
        }),
        (this.resetState = function () {
          ((ne = 0), (re = 0), (L = null), V.reset(), Ye.reset());
        }),
        typeof __THREE_DEVTOOLS__ < 'u' &&
          __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this })));
    }
    get coordinateSystem() {
      return Be;
    }
    get outputColorSpace() {
      return this._outputColorSpace;
    }
    set outputColorSpace(e) {
      this._outputColorSpace = e;
      let t = this.getContext();
      ((t.drawingBufferColorSpace = Mt._getDrawingBufferColorSpace(e)),
        (t.unpackColorSpace = Mt._getUnpackColorSpace()));
    }
  },
  Mu = { type: 'change' },
  Nu = { type: 'start' },
  Pu = { type: 'end' },
  Fu = new Fr(),
  Iu = new ui(),
  Lu = Math.cos(70 * wt.DEG2RAD),
  Ru = new J(),
  zu = 2 * Math.PI,
  Bu = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  },
  Vu = 1e-6,
  Hu = class extends ps {
    constructor(n, r = null) {
      (super(n, r),
        (this.state = Bu.NONE),
        (this.target = new J()),
        (this.cursor = new J()),
        (this.minDistance = 0),
        (this.maxDistance = Infinity),
        (this.minZoom = 0),
        (this.maxZoom = Infinity),
        (this.minTargetRadius = 0),
        (this.maxTargetRadius = Infinity),
        (this.minPolarAngle = 0),
        (this.maxPolarAngle = Math.PI),
        (this.minAzimuthAngle = -Infinity),
        (this.maxAzimuthAngle = Infinity),
        (this.enableDamping = !1),
        (this.dampingFactor = 0.05),
        (this.enableZoom = !0),
        (this.zoomSpeed = 1),
        (this.enableRotate = !0),
        (this.rotateSpeed = 1),
        (this.keyRotateSpeed = 1),
        (this.enablePan = !0),
        (this.panSpeed = 1),
        (this.screenSpacePanning = !0),
        (this.keyPanSpeed = 7),
        (this.zoomToCursor = !1),
        (this.autoRotate = !1),
        (this.autoRotateSpeed = 2),
        (this.keys = {
          LEFT: 'ArrowLeft',
          UP: 'ArrowUp',
          RIGHT: 'ArrowRight',
          BOTTOM: 'ArrowDown'
        }),
        (this.mouseButtons = {
          LEFT: e.ROTATE,
          MIDDLE: e.DOLLY,
          RIGHT: e.PAN
        }),
        (this.touches = {
          ONE: t.ROTATE,
          TWO: t.DOLLY_PAN
        }),
        (this.target0 = this.target.clone()),
        (this.position0 = this.object.position.clone()),
        (this.zoom0 = this.object.zoom),
        (this._cursorStyle = 'auto'),
        (this._domElementKeyEvents = null),
        (this._lastPosition = new J()),
        (this._lastQuaternion = new Tt()),
        (this._lastTargetPosition = new J()),
        (this._quat = new Tt().setFromUnitVectors(n.up, new J(0, 1, 0))),
        (this._quatInverse = this._quat.clone().invert()),
        (this._spherical = new ls()),
        (this._sphericalDelta = new ls()),
        (this._scale = 1),
        (this._panOffset = new J()),
        (this._rotateStart = new q()),
        (this._rotateEnd = new q()),
        (this._rotateDelta = new q()),
        (this._panStart = new q()),
        (this._panEnd = new q()),
        (this._panDelta = new q()),
        (this._dollyStart = new q()),
        (this._dollyEnd = new q()),
        (this._dollyDelta = new q()),
        (this._dollyDirection = new J()),
        (this._mouse = new q()),
        (this._performCursorZoom = !1),
        (this._pointers = []),
        (this._pointerPositions = {}),
        (this._controlActive = !1),
        (this._onPointerMove = Wu.bind(this)),
        (this._onPointerDown = Uu.bind(this)),
        (this._onPointerUp = Gu.bind(this)),
        (this._onContextMenu = Qu.bind(this)),
        (this._onMouseWheel = Ju.bind(this)),
        (this._onKeyDown = Yu.bind(this)),
        (this._onTouchStart = Xu.bind(this)),
        (this._onTouchMove = Zu.bind(this)),
        (this._onMouseDown = Ku.bind(this)),
        (this._onMouseMove = qu.bind(this)),
        (this._interceptControlDown = $u.bind(this)),
        (this._interceptControlUp = ed.bind(this)),
        this.domElement !== null && this.connect(this.domElement),
        this.update());
    }
    set cursorStyle(e) {
      ((this._cursorStyle = e),
        e === 'grab'
          ? (this.domElement.style.cursor = 'grab')
          : (this.domElement.style.cursor = 'auto'));
    }
    get cursorStyle() {
      return this._cursorStyle;
    }
    connect(e) {
      (super.connect(e),
        this.domElement.addEventListener('pointerdown', this._onPointerDown),
        this.domElement.addEventListener('pointercancel', this._onPointerUp),
        this.domElement.addEventListener('contextmenu', this._onContextMenu),
        this.domElement.addEventListener('wheel', this._onMouseWheel, { passive: !1 }),
        this.domElement.getRootNode().addEventListener('keydown', this._interceptControlDown, {
          passive: !0,
          capture: !0
        }),
        (this.domElement.style.touchAction = 'none'));
    }
    disconnect() {
      (this.domElement.removeEventListener('pointerdown', this._onPointerDown),
        this.domElement.ownerDocument.removeEventListener('pointermove', this._onPointerMove),
        this.domElement.ownerDocument.removeEventListener('pointerup', this._onPointerUp),
        this.domElement.removeEventListener('pointercancel', this._onPointerUp),
        this.domElement.removeEventListener('wheel', this._onMouseWheel),
        this.domElement.removeEventListener('contextmenu', this._onContextMenu),
        this.stopListenToKeyEvents(),
        this.domElement
          .getRootNode()
          .removeEventListener('keydown', this._interceptControlDown, { capture: !0 }),
        (this.domElement.style.touchAction = ''));
    }
    dispose() {
      this.disconnect();
    }
    getPolarAngle() {
      return this._spherical.phi;
    }
    getAzimuthalAngle() {
      return this._spherical.theta;
    }
    getDistance() {
      return this.object.position.distanceTo(this.target);
    }
    listenToKeyEvents(e) {
      (e.addEventListener('keydown', this._onKeyDown), (this._domElementKeyEvents = e));
    }
    stopListenToKeyEvents() {
      this._domElementKeyEvents !== null &&
        (this._domElementKeyEvents.removeEventListener('keydown', this._onKeyDown),
        (this._domElementKeyEvents = null));
    }
    saveState() {
      (this.target0.copy(this.target),
        this.position0.copy(this.object.position),
        (this.zoom0 = this.object.zoom));
    }
    reset() {
      (this.target.copy(this.target0),
        this.object.position.copy(this.position0),
        (this.object.zoom = this.zoom0),
        this.object.updateProjectionMatrix(),
        this.dispatchEvent(Mu),
        this.update(),
        (this.state = Bu.NONE));
    }
    pan(e, t) {
      (this._pan(e, t), this.update());
    }
    dollyIn(e) {
      (this._dollyIn(e), this.update());
    }
    dollyOut(e) {
      (this._dollyOut(e), this.update());
    }
    rotateLeft(e) {
      (this._rotateLeft(e), this.update());
    }
    rotateUp(e) {
      (this._rotateUp(e), this.update());
    }
    update(e = null) {
      let t = this.object.position;
      (Ru.copy(t).sub(this.target),
        Ru.applyQuaternion(this._quat),
        this._spherical.setFromVector3(Ru),
        this.autoRotate &&
          this.state === Bu.NONE &&
          this._rotateLeft(this._getAutoRotationAngle(e)),
        this.enableDamping
          ? ((this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor),
            (this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor))
          : ((this._spherical.theta += this._sphericalDelta.theta),
            (this._spherical.phi += this._sphericalDelta.phi)));
      let n = this.minAzimuthAngle,
        r = this.maxAzimuthAngle;
      (isFinite(n) &&
        isFinite(r) &&
        (n < -Math.PI ? (n += zu) : n > Math.PI && (n -= zu),
        r < -Math.PI ? (r += zu) : r > Math.PI && (r -= zu),
        n <= r
          ? (this._spherical.theta = Math.max(n, Math.min(r, this._spherical.theta)))
          : (this._spherical.theta =
              this._spherical.theta > (n + r) / 2
                ? Math.max(n, this._spherical.theta)
                : Math.min(r, this._spherical.theta))),
        (this._spherical.phi = Math.max(
          this.minPolarAngle,
          Math.min(this.maxPolarAngle, this._spherical.phi)
        )),
        this._spherical.makeSafe(),
        this.enableDamping === !0
          ? this.target.addScaledVector(this._panOffset, this.dampingFactor)
          : this.target.add(this._panOffset),
        this.target.sub(this.cursor),
        this.target.clampLength(this.minTargetRadius, this.maxTargetRadius),
        this.target.add(this.cursor));
      let i = !1;
      if ((this.zoomToCursor && this._performCursorZoom) || this.object.isOrthographicCamera)
        this._spherical.radius = this._clampDistance(this._spherical.radius);
      else {
        let e = this._spherical.radius;
        ((this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale)),
          (i = e != this._spherical.radius));
      }
      if (
        (Ru.setFromSpherical(this._spherical),
        Ru.applyQuaternion(this._quatInverse),
        t.copy(this.target).add(Ru),
        this.object.lookAt(this.target),
        this.enableDamping === !0
          ? ((this._sphericalDelta.theta *= 1 - this.dampingFactor),
            (this._sphericalDelta.phi *= 1 - this.dampingFactor),
            this._panOffset.multiplyScalar(1 - this.dampingFactor))
          : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)),
        this.zoomToCursor && this._performCursorZoom)
      ) {
        let e = null;
        if (this.object.isPerspectiveCamera) {
          let t = Ru.length();
          e = this._clampDistance(t * this._scale);
          let n = t - e;
          (this.object.position.addScaledVector(this._dollyDirection, n),
            this.object.updateMatrixWorld(),
            (i = !!n));
        } else if (this.object.isOrthographicCamera) {
          let t = new J(this._mouse.x, this._mouse.y, 0);
          t.unproject(this.object);
          let n = this.object.zoom;
          ((this.object.zoom = Math.max(
            this.minZoom,
            Math.min(this.maxZoom, this.object.zoom / this._scale)
          )),
            this.object.updateProjectionMatrix(),
            (i = n !== this.object.zoom));
          let r = new J(this._mouse.x, this._mouse.y, 0);
          (r.unproject(this.object),
            this.object.position.sub(r).add(t),
            this.object.updateMatrixWorld(),
            (e = Ru.length()));
        } else
          (console.warn(
            'WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.'
          ),
            (this.zoomToCursor = !1));
        e !== null &&
          (this.screenSpacePanning
            ? this.target
                .set(0, 0, -1)
                .transformDirection(this.object.matrix)
                .multiplyScalar(e)
                .add(this.object.position)
            : (Fu.origin.copy(this.object.position),
              Fu.direction.set(0, 0, -1).transformDirection(this.object.matrix),
              Math.abs(this.object.up.dot(Fu.direction)) < Lu
                ? this.object.lookAt(this.target)
                : (Iu.setFromNormalAndCoplanarPoint(this.object.up, this.target),
                  Fu.intersectPlane(Iu, this.target))));
      } else if (this.object.isOrthographicCamera) {
        let e = this.object.zoom;
        ((this.object.zoom = Math.max(
          this.minZoom,
          Math.min(this.maxZoom, this.object.zoom / this._scale)
        )),
          e !== this.object.zoom && (this.object.updateProjectionMatrix(), (i = !0)));
      }
      return (
        (this._scale = 1),
        (this._performCursorZoom = !1),
        i ||
        this._lastPosition.distanceToSquared(this.object.position) > Vu ||
        8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Vu ||
        this._lastTargetPosition.distanceToSquared(this.target) > Vu
          ? (this.dispatchEvent(Mu),
            this._lastPosition.copy(this.object.position),
            this._lastQuaternion.copy(this.object.quaternion),
            this._lastTargetPosition.copy(this.target),
            !0)
          : !1
      );
    }
    _getAutoRotationAngle(e) {
      return e === null
        ? (zu / 60 / 60) * this.autoRotateSpeed
        : (zu / 60) * this.autoRotateSpeed * e;
    }
    _getZoomScale(e) {
      let t = Math.abs(e * 0.01);
      return 0.95 ** (this.zoomSpeed * t);
    }
    _rotateLeft(e) {
      this._sphericalDelta.theta -= e;
    }
    _rotateUp(e) {
      this._sphericalDelta.phi -= e;
    }
    _panLeft(e, t) {
      (Ru.setFromMatrixColumn(t, 0), Ru.multiplyScalar(-e), this._panOffset.add(Ru));
    }
    _panUp(e, t) {
      (this.screenSpacePanning === !0
        ? Ru.setFromMatrixColumn(t, 1)
        : (Ru.setFromMatrixColumn(t, 0), Ru.crossVectors(this.object.up, Ru)),
        Ru.multiplyScalar(e),
        this._panOffset.add(Ru));
    }
    _pan(e, t) {
      let n = this.domElement;
      if (this.object.isPerspectiveCamera) {
        let r = this.object.position;
        Ru.copy(r).sub(this.target);
        let i = Ru.length();
        ((i *= Math.tan(((this.object.fov / 2) * Math.PI) / 180)),
          this._panLeft((2 * e * i) / n.clientHeight, this.object.matrix),
          this._panUp((2 * t * i) / n.clientHeight, this.object.matrix));
      } else
        this.object.isOrthographicCamera
          ? (this._panLeft(
              (e * (this.object.right - this.object.left)) / this.object.zoom / n.clientWidth,
              this.object.matrix
            ),
            this._panUp(
              (t * (this.object.top - this.object.bottom)) / this.object.zoom / n.clientHeight,
              this.object.matrix
            ))
          : (console.warn(
              'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.'
            ),
            (this.enablePan = !1));
    }
    _dollyOut(e) {
      this.object.isPerspectiveCamera || this.object.isOrthographicCamera
        ? (this._scale /= e)
        : (console.warn(
            'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.'
          ),
          (this.enableZoom = !1));
    }
    _dollyIn(e) {
      this.object.isPerspectiveCamera || this.object.isOrthographicCamera
        ? (this._scale *= e)
        : (console.warn(
            'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.'
          ),
          (this.enableZoom = !1));
    }
    _updateZoomParameters(e, t) {
      if (!this.zoomToCursor) return;
      this._performCursorZoom = !0;
      let n = this.domElement.getBoundingClientRect(),
        r = e - n.left,
        i = t - n.top,
        a = n.width,
        o = n.height;
      ((this._mouse.x = (r / a) * 2 - 1),
        (this._mouse.y = -(i / o) * 2 + 1),
        this._dollyDirection
          .set(this._mouse.x, this._mouse.y, 1)
          .unproject(this.object)
          .sub(this.object.position)
          .normalize());
    }
    _clampDistance(e) {
      return Math.max(this.minDistance, Math.min(this.maxDistance, e));
    }
    _handleMouseDownRotate(e) {
      this._rotateStart.set(e.clientX, e.clientY);
    }
    _handleMouseDownDolly(e) {
      (this._updateZoomParameters(e.clientX, e.clientX),
        this._dollyStart.set(e.clientX, e.clientY));
    }
    _handleMouseDownPan(e) {
      this._panStart.set(e.clientX, e.clientY);
    }
    _handleMouseMoveRotate(e) {
      (this._rotateEnd.set(e.clientX, e.clientY),
        this._rotateDelta
          .subVectors(this._rotateEnd, this._rotateStart)
          .multiplyScalar(this.rotateSpeed));
      let t = this.domElement;
      (this._rotateLeft((zu * this._rotateDelta.x) / t.clientHeight),
        this._rotateUp((zu * this._rotateDelta.y) / t.clientHeight),
        this._rotateStart.copy(this._rotateEnd),
        this.update());
    }
    _handleMouseMoveDolly(e) {
      (this._dollyEnd.set(e.clientX, e.clientY),
        this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart),
        this._dollyDelta.y > 0
          ? this._dollyOut(this._getZoomScale(this._dollyDelta.y))
          : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)),
        this._dollyStart.copy(this._dollyEnd),
        this.update());
    }
    _handleMouseMovePan(e) {
      (this._panEnd.set(e.clientX, e.clientY),
        this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed),
        this._pan(this._panDelta.x, this._panDelta.y),
        this._panStart.copy(this._panEnd),
        this.update());
    }
    _handleMouseWheel(e) {
      (this._updateZoomParameters(e.clientX, e.clientY),
        e.deltaY < 0
          ? this._dollyIn(this._getZoomScale(e.deltaY))
          : e.deltaY > 0 && this._dollyOut(this._getZoomScale(e.deltaY)),
        this.update());
    }
    _handleKeyDown(e) {
      let t = !1;
      switch (e.code) {
        case this.keys.UP:
          (e.ctrlKey || e.metaKey || e.shiftKey
            ? this.enableRotate &&
              this._rotateUp((zu * this.keyRotateSpeed) / this.domElement.clientHeight)
            : this.enablePan && this._pan(0, this.keyPanSpeed),
            (t = !0));
          break;
        case this.keys.BOTTOM:
          (e.ctrlKey || e.metaKey || e.shiftKey
            ? this.enableRotate &&
              this._rotateUp((-zu * this.keyRotateSpeed) / this.domElement.clientHeight)
            : this.enablePan && this._pan(0, -this.keyPanSpeed),
            (t = !0));
          break;
        case this.keys.LEFT:
          (e.ctrlKey || e.metaKey || e.shiftKey
            ? this.enableRotate &&
              this._rotateLeft((zu * this.keyRotateSpeed) / this.domElement.clientHeight)
            : this.enablePan && this._pan(this.keyPanSpeed, 0),
            (t = !0));
          break;
        case this.keys.RIGHT:
          (e.ctrlKey || e.metaKey || e.shiftKey
            ? this.enableRotate &&
              this._rotateLeft((-zu * this.keyRotateSpeed) / this.domElement.clientHeight)
            : this.enablePan && this._pan(-this.keyPanSpeed, 0),
            (t = !0));
          break;
      }
      t && (e.preventDefault(), this.update());
    }
    _handleTouchStartRotate(e) {
      if (this._pointers.length === 1) this._rotateStart.set(e.pageX, e.pageY);
      else {
        let t = this._getSecondPointerPosition(e),
          n = 0.5 * (e.pageX + t.x),
          r = 0.5 * (e.pageY + t.y);
        this._rotateStart.set(n, r);
      }
    }
    _handleTouchStartPan(e) {
      if (this._pointers.length === 1) this._panStart.set(e.pageX, e.pageY);
      else {
        let t = this._getSecondPointerPosition(e),
          n = 0.5 * (e.pageX + t.x),
          r = 0.5 * (e.pageY + t.y);
        this._panStart.set(n, r);
      }
    }
    _handleTouchStartDolly(e) {
      let t = this._getSecondPointerPosition(e),
        n = e.pageX - t.x,
        r = e.pageY - t.y,
        i = Math.sqrt(n * n + r * r);
      this._dollyStart.set(0, i);
    }
    _handleTouchStartDollyPan(e) {
      (this.enableZoom && this._handleTouchStartDolly(e),
        this.enablePan && this._handleTouchStartPan(e));
    }
    _handleTouchStartDollyRotate(e) {
      (this.enableZoom && this._handleTouchStartDolly(e),
        this.enableRotate && this._handleTouchStartRotate(e));
    }
    _handleTouchMoveRotate(e) {
      if (this._pointers.length == 1) this._rotateEnd.set(e.pageX, e.pageY);
      else {
        let t = this._getSecondPointerPosition(e),
          n = 0.5 * (e.pageX + t.x),
          r = 0.5 * (e.pageY + t.y);
        this._rotateEnd.set(n, r);
      }
      this._rotateDelta
        .subVectors(this._rotateEnd, this._rotateStart)
        .multiplyScalar(this.rotateSpeed);
      let t = this.domElement;
      (this._rotateLeft((zu * this._rotateDelta.x) / t.clientHeight),
        this._rotateUp((zu * this._rotateDelta.y) / t.clientHeight),
        this._rotateStart.copy(this._rotateEnd));
    }
    _handleTouchMovePan(e) {
      if (this._pointers.length === 1) this._panEnd.set(e.pageX, e.pageY);
      else {
        let t = this._getSecondPointerPosition(e),
          n = 0.5 * (e.pageX + t.x),
          r = 0.5 * (e.pageY + t.y);
        this._panEnd.set(n, r);
      }
      (this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed),
        this._pan(this._panDelta.x, this._panDelta.y),
        this._panStart.copy(this._panEnd));
    }
    _handleTouchMoveDolly(e) {
      let t = this._getSecondPointerPosition(e),
        n = e.pageX - t.x,
        r = e.pageY - t.y,
        i = Math.sqrt(n * n + r * r);
      (this._dollyEnd.set(0, i),
        this._dollyDelta.set(0, (this._dollyEnd.y / this._dollyStart.y) ** +this.zoomSpeed),
        this._dollyOut(this._dollyDelta.y),
        this._dollyStart.copy(this._dollyEnd));
      let a = (e.pageX + t.x) * 0.5,
        o = (e.pageY + t.y) * 0.5;
      this._updateZoomParameters(a, o);
    }
    _handleTouchMoveDollyPan(e) {
      (this.enableZoom && this._handleTouchMoveDolly(e),
        this.enablePan && this._handleTouchMovePan(e));
    }
    _handleTouchMoveDollyRotate(e) {
      (this.enableZoom && this._handleTouchMoveDolly(e),
        this.enableRotate && this._handleTouchMoveRotate(e));
    }
    _addPointer(e) {
      this._pointers.push(e.pointerId);
    }
    _removePointer(e) {
      delete this._pointerPositions[e.pointerId];
      for (let t = 0; t < this._pointers.length; t++)
        if (this._pointers[t] == e.pointerId) {
          this._pointers.splice(t, 1);
          return;
        }
    }
    _isTrackingPointer(e) {
      for (let t = 0; t < this._pointers.length; t++)
        if (this._pointers[t] == e.pointerId) return !0;
      return !1;
    }
    _trackPointer(e) {
      let t = this._pointerPositions[e.pointerId];
      (t === void 0 && ((t = new q()), (this._pointerPositions[e.pointerId] = t)),
        t.set(e.pageX, e.pageY));
    }
    _getSecondPointerPosition(e) {
      let t = e.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
      return this._pointerPositions[t];
    }
    _customWheelEvent(e) {
      let t = e.deltaMode,
        n = {
          clientX: e.clientX,
          clientY: e.clientY,
          deltaY: e.deltaY
        };
      switch (t) {
        case 1:
          n.deltaY *= 16;
          break;
        case 2:
          n.deltaY *= 100;
          break;
      }
      return (e.ctrlKey && !this._controlActive && (n.deltaY *= 10), n);
    }
  };
function Uu(e) {
  this.enabled !== !1 &&
    (this._pointers.length === 0 &&
      (this.domElement.setPointerCapture(e.pointerId),
      this.domElement.ownerDocument.addEventListener('pointermove', this._onPointerMove),
      this.domElement.ownerDocument.addEventListener('pointerup', this._onPointerUp)),
    !this._isTrackingPointer(e) &&
      (this._addPointer(e),
      e.pointerType === 'touch' ? this._onTouchStart(e) : this._onMouseDown(e),
      this._cursorStyle === 'grab' && (this.domElement.style.cursor = 'grabbing')));
}
function Wu(e) {
  this.enabled !== !1 && (e.pointerType === 'touch' ? this._onTouchMove(e) : this._onMouseMove(e));
}
function Gu(e) {
  switch ((this._removePointer(e), this._pointers.length)) {
    case 0:
      (this.domElement.releasePointerCapture(e.pointerId),
        this.domElement.ownerDocument.removeEventListener('pointermove', this._onPointerMove),
        this.domElement.ownerDocument.removeEventListener('pointerup', this._onPointerUp),
        this.dispatchEvent(Pu),
        (this.state = Bu.NONE),
        this._cursorStyle === 'grab' && (this.domElement.style.cursor = 'grab'));
      break;
    case 1:
      let t = this._pointers[0],
        n = this._pointerPositions[t];
      this._onTouchStart({
        pointerId: t,
        pageX: n.x,
        pageY: n.y
      });
      break;
  }
}
function Ku(t) {
  let n;
  switch (t.button) {
    case 0:
      n = this.mouseButtons.LEFT;
      break;
    case 1:
      n = this.mouseButtons.MIDDLE;
      break;
    case 2:
      n = this.mouseButtons.RIGHT;
      break;
    default:
      n = -1;
  }
  switch (n) {
    case e.DOLLY:
      if (this.enableZoom === !1) return;
      (this._handleMouseDownDolly(t), (this.state = Bu.DOLLY));
      break;
    case e.ROTATE:
      if (t.ctrlKey || t.metaKey || t.shiftKey) {
        if (this.enablePan === !1) return;
        (this._handleMouseDownPan(t), (this.state = Bu.PAN));
      } else {
        if (this.enableRotate === !1) return;
        (this._handleMouseDownRotate(t), (this.state = Bu.ROTATE));
      }
      break;
    case e.PAN:
      if (t.ctrlKey || t.metaKey || t.shiftKey) {
        if (this.enableRotate === !1) return;
        (this._handleMouseDownRotate(t), (this.state = Bu.ROTATE));
      } else {
        if (this.enablePan === !1) return;
        (this._handleMouseDownPan(t), (this.state = Bu.PAN));
      }
      break;
    default:
      this.state = Bu.NONE;
  }
  this.state !== Bu.NONE && this.dispatchEvent(Nu);
}
function qu(e) {
  switch (this.state) {
    case Bu.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(e);
      break;
    case Bu.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(e);
      break;
    case Bu.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(e);
      break;
  }
}
function Ju(e) {
  this.enabled === !1 ||
    this.enableZoom === !1 ||
    this.state !== Bu.NONE ||
    (e.preventDefault(),
    this.dispatchEvent(Nu),
    this._handleMouseWheel(this._customWheelEvent(e)),
    this.dispatchEvent(Pu));
}
function Yu(e) {
  this.enabled !== !1 && this._handleKeyDown(e);
}
function Xu(e) {
  switch ((this._trackPointer(e), this._pointers.length)) {
    case 1:
      switch (this.touches.ONE) {
        case t.ROTATE:
          if (this.enableRotate === !1) return;
          (this._handleTouchStartRotate(e), (this.state = Bu.TOUCH_ROTATE));
          break;
        case t.PAN:
          if (this.enablePan === !1) return;
          (this._handleTouchStartPan(e), (this.state = Bu.TOUCH_PAN));
          break;
        default:
          this.state = Bu.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case t.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          (this._handleTouchStartDollyPan(e), (this.state = Bu.TOUCH_DOLLY_PAN));
          break;
        case t.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          (this._handleTouchStartDollyRotate(e), (this.state = Bu.TOUCH_DOLLY_ROTATE));
          break;
        default:
          this.state = Bu.NONE;
      }
      break;
    default:
      this.state = Bu.NONE;
  }
  this.state !== Bu.NONE && this.dispatchEvent(Nu);
}
function Zu(e) {
  switch ((this._trackPointer(e), this.state)) {
    case Bu.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      (this._handleTouchMoveRotate(e), this.update());
      break;
    case Bu.TOUCH_PAN:
      if (this.enablePan === !1) return;
      (this._handleTouchMovePan(e), this.update());
      break;
    case Bu.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      (this._handleTouchMoveDollyPan(e), this.update());
      break;
    case Bu.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      (this._handleTouchMoveDollyRotate(e), this.update());
      break;
    default:
      this.state = Bu.NONE;
  }
}
function Qu(e) {
  this.enabled !== !1 && e.preventDefault();
}
function $u(e) {
  e.key === 'Control' &&
    ((this._controlActive = !0),
    this.domElement.getRootNode().addEventListener('keyup', this._interceptControlUp, {
      passive: !0,
      capture: !0
    }));
}
function ed(e) {
  e.key === 'Control' &&
    ((this._controlActive = !1),
    this.domElement.getRootNode().removeEventListener('keyup', this._interceptControlUp, {
      passive: !0,
      capture: !0
    }));
}
//#endregion
//#region node_modules/three/examples/jsm/environments/RoomEnvironment.js
var td = class extends jn {
  constructor() {
    (super(), (this.name = 'RoomEnvironment'), (this.position.y = -3.5));
    let e = new bi();
    e.deleteAttribute('uv');
    let t = new Za({ side: 1 }),
      n = new Za(),
      r = new zo(16777215, 900, 28, 2);
    (r.position.set(0.418, 16.199, 0.3), this.add(r));
    let i = new Jr(e, t);
    (i.position.set(-0.757, 13.219, 0.717), i.scale.set(31.713, 28.305, 28.591), this.add(i));
    let a = new oi(e, n, 6),
      o = new Sn();
    (o.position.set(-10.906, 2.009, 1.846),
      o.rotation.set(0, -0.195, 0),
      o.scale.set(2.328, 7.905, 4.651),
      o.updateMatrix(),
      a.setMatrixAt(0, o.matrix),
      o.position.set(-5.607, -0.754, -0.758),
      o.rotation.set(0, 0.994, 0),
      o.scale.set(1.97, 1.534, 3.955),
      o.updateMatrix(),
      a.setMatrixAt(1, o.matrix),
      o.position.set(6.167, 0.857, 7.803),
      o.rotation.set(0, 0.561, 0),
      o.scale.set(3.927, 6.285, 3.687),
      o.updateMatrix(),
      a.setMatrixAt(2, o.matrix),
      o.position.set(-2.017, 0.018, 6.124),
      o.rotation.set(0, 0.333, 0),
      o.scale.set(2.002, 4.566, 2.064),
      o.updateMatrix(),
      a.setMatrixAt(3, o.matrix),
      o.position.set(2.291, -0.756, -2.621),
      o.rotation.set(0, -0.286, 0),
      o.scale.set(1.546, 1.552, 1.496),
      o.updateMatrix(),
      a.setMatrixAt(4, o.matrix),
      o.position.set(-2.193, -0.369, -5.547),
      o.rotation.set(0, 0.516, 0),
      o.scale.set(3.875, 3.487, 2.986),
      o.updateMatrix(),
      a.setMatrixAt(5, o.matrix),
      this.add(a));
    let s = new Jr(e, nd(50));
    (s.position.set(-16.116, 14.37, 8.208), s.scale.set(0.1, 2.428, 2.739), this.add(s));
    let c = new Jr(e, nd(50));
    (c.position.set(-16.109, 18.021, -8.207), c.scale.set(0.1, 2.425, 2.751), this.add(c));
    let l = new Jr(e, nd(17));
    (l.position.set(14.904, 12.198, -1.832), l.scale.set(0.15, 4.265, 6.331), this.add(l));
    let u = new Jr(e, nd(43));
    (u.position.set(-0.462, 8.89, 14.52), u.scale.set(4.38, 5.441, 0.088), this.add(u));
    let d = new Jr(e, nd(20));
    (d.position.set(3.235, 11.486, -12.541), d.scale.set(2.5, 2, 0.1), this.add(d));
    let f = new Jr(e, nd(100));
    (f.position.set(0, 20, 0), f.scale.set(1, 0.1, 1), this.add(f));
  }
  dispose() {
    let e = /* @__PURE__ */ new Set();
    this.traverse((t) => {
      t.isMesh && (e.add(t.geometry), e.add(t.material));
    });
    for (let t of e) t.dispose();
  }
};
function nd(e) {
  return new $a({
    color: 0,
    emissive: 16777215,
    emissiveIntensity: e
  });
}
//#endregion
//#region node_modules/three/examples/jsm/shaders/CopyShader.js
var rd = {
    name: 'CopyShader',
    uniforms: {
      tDiffuse: { value: null },
      opacity: { value: 1 }
    },
    vertexShader:
      '\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vUv = uv;\n			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n		}',
    fragmentShader:
      '\n\n		uniform float opacity;\n\n		uniform sampler2D tDiffuse;\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vec4 texel = texture2D( tDiffuse, vUv );\n			gl_FragColor = opacity * texel;\n\n\n		}'
  },
  id = class {
    constructor() {
      ((this.isPass = !0),
        (this.enabled = !0),
        (this.needsSwap = !0),
        (this.clear = !1),
        (this.renderToScreen = !1));
    }
    setSize() {}
    render() {
      console.error('THREE.Pass: .render() must be implemented in derived pass.');
    }
    dispose() {}
  },
  ad = new Bo(-1, 1, 1, -1, 0, 1),
  od = new (class extends Tr {
    constructor() {
      (super(),
        this.setAttribute('position', new pr([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)),
        this.setAttribute('uv', new pr([0, 2, 0, 0, 2, 0], 2)));
    }
  })(),
  sd = class {
    constructor(e) {
      this._mesh = new Jr(od, e);
    }
    dispose() {
      this._mesh.geometry.dispose();
    }
    render(e) {
      e.render(this._mesh, ad);
    }
    get material() {
      return this._mesh.material;
    }
    set material(e) {
      this._mesh.material = e;
    }
  },
  cd = class extends id {
    constructor(e, t = 'tDiffuse') {
      (super(),
        (this.textureID = t),
        (this.uniforms = null),
        (this.material = null),
        e instanceof Ya
          ? ((this.uniforms = e.uniforms), (this.material = e))
          : e &&
            ((this.uniforms = Ka.clone(e.uniforms)),
            (this.material = new Ya({
              name: e.name === void 0 ? 'unspecified' : e.name,
              defines: Object.assign({}, e.defines),
              uniforms: this.uniforms,
              vertexShader: e.vertexShader,
              fragmentShader: e.fragmentShader
            }))),
        (this._fsQuad = new sd(this.material)));
    }
    render(e, t, n) {
      (this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = n.texture),
        (this._fsQuad.material = this.material),
        this.renderToScreen
          ? (e.setRenderTarget(null), this._fsQuad.render(e))
          : (e.setRenderTarget(t),
            this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil),
            this._fsQuad.render(e)));
    }
    dispose() {
      (this.material.dispose(), this._fsQuad.dispose());
    }
  },
  ld = class extends id {
    constructor(e, t) {
      (super(),
        (this.scene = e),
        (this.camera = t),
        (this.clear = !0),
        (this.needsSwap = !1),
        (this.inverse = !1));
    }
    render(e, t, n) {
      let r = e.getContext(),
        i = e.state;
      (i.buffers.color.setMask(!1),
        i.buffers.depth.setMask(!1),
        i.buffers.color.setLocked(!0),
        i.buffers.depth.setLocked(!0));
      let a, o;
      (this.inverse ? ((a = 0), (o = 1)) : ((a = 1), (o = 0)),
        i.buffers.stencil.setTest(!0),
        i.buffers.stencil.setOp(r.REPLACE, r.REPLACE, r.REPLACE),
        i.buffers.stencil.setFunc(r.ALWAYS, a, 4294967295),
        i.buffers.stencil.setClear(o),
        i.buffers.stencil.setLocked(!0),
        e.setRenderTarget(n),
        this.clear && e.clear(),
        e.render(this.scene, this.camera),
        e.setRenderTarget(t),
        this.clear && e.clear(),
        e.render(this.scene, this.camera),
        i.buffers.color.setLocked(!1),
        i.buffers.depth.setLocked(!1),
        i.buffers.color.setMask(!0),
        i.buffers.depth.setMask(!0),
        i.buffers.stencil.setLocked(!1),
        i.buffers.stencil.setFunc(r.EQUAL, 1, 4294967295),
        i.buffers.stencil.setOp(r.KEEP, r.KEEP, r.KEEP),
        i.buffers.stencil.setLocked(!0));
    }
  },
  ud = class extends id {
    constructor() {
      (super(), (this.needsSwap = !1));
    }
    render(e) {
      (e.state.buffers.stencil.setLocked(!1), e.state.buffers.stencil.setTest(!1));
    }
  },
  dd = class {
    constructor(e, t) {
      if (((this.renderer = e), (this._pixelRatio = e.getPixelRatio()), t === void 0)) {
        let n = e.getSize(new q());
        ((this._width = n.width),
          (this._height = n.height),
          (t = new Gt(this._width * this._pixelRatio, this._height * this._pixelRatio, {
            type: v
          })),
          (t.texture.name = 'EffectComposer.rt1'));
      } else ((this._width = t.width), (this._height = t.height));
      ((this.renderTarget1 = t),
        (this.renderTarget2 = t.clone()),
        (this.renderTarget2.texture.name = 'EffectComposer.rt2'),
        (this.writeBuffer = this.renderTarget1),
        (this.readBuffer = this.renderTarget2),
        (this.renderToScreen = !0),
        (this.passes = []),
        (this.copyPass = new cd(rd)),
        (this.copyPass.material.blending = 0),
        (this.timer = new Jo()));
    }
    swapBuffers() {
      let e = this.readBuffer;
      ((this.readBuffer = this.writeBuffer), (this.writeBuffer = e));
    }
    addPass(e) {
      (this.passes.push(e),
        e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio));
    }
    insertPass(e, t) {
      (this.passes.splice(t, 0, e),
        e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio));
    }
    removePass(e) {
      let t = this.passes.indexOf(e);
      t !== -1 && this.passes.splice(t, 1);
    }
    isLastEnabledPass(e) {
      for (let t = e + 1; t < this.passes.length; t++) if (this.passes[t].enabled) return !1;
      return !0;
    }
    render(e) {
      (this.timer.update(), e === void 0 && (e = this.timer.getDelta()));
      let t = this.renderer.getRenderTarget(),
        n = !1;
      for (let t = 0, r = this.passes.length; t < r; t++) {
        let r = this.passes[t];
        if (r.enabled !== !1) {
          if (
            ((r.renderToScreen = this.renderToScreen && this.isLastEnabledPass(t)),
            r.render(this.renderer, this.writeBuffer, this.readBuffer, e, n),
            r.needsSwap)
          ) {
            if (n) {
              let t = this.renderer.getContext(),
                n = this.renderer.state.buffers.stencil;
              (n.setFunc(t.NOTEQUAL, 1, 4294967295),
                this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e),
                n.setFunc(t.EQUAL, 1, 4294967295));
            }
            this.swapBuffers();
          }
          ld !== void 0 && (r instanceof ld ? (n = !0) : r instanceof ud && (n = !1));
        }
      }
      this.renderer.setRenderTarget(t);
    }
    reset(e) {
      if (e === void 0) {
        let t = this.renderer.getSize(new q());
        ((this._pixelRatio = this.renderer.getPixelRatio()),
          (this._width = t.width),
          (this._height = t.height),
          (e = this.renderTarget1.clone()),
          e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio));
      }
      (this.renderTarget1.dispose(),
        this.renderTarget2.dispose(),
        (this.renderTarget1 = e),
        (this.renderTarget2 = e.clone()),
        (this.writeBuffer = this.renderTarget1),
        (this.readBuffer = this.renderTarget2));
    }
    setSize(e, t) {
      ((this._width = e), (this._height = t));
      let n = this._width * this._pixelRatio,
        r = this._height * this._pixelRatio;
      (this.renderTarget1.setSize(n, r), this.renderTarget2.setSize(n, r));
      for (let e = 0; e < this.passes.length; e++) this.passes[e].setSize(n, r);
    }
    setPixelRatio(e) {
      ((this._pixelRatio = e), this.setSize(this._width, this._height));
    }
    dispose() {
      (this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose());
    }
  },
  fd = class extends id {
    constructor(e, t, n = null, r = null, i = null) {
      (super(),
        (this.scene = e),
        (this.camera = t),
        (this.overrideMaterial = n),
        (this.clearColor = r),
        (this.clearAlpha = i),
        (this.clear = !0),
        (this.clearDepth = !1),
        (this.needsSwap = !1),
        (this.isRenderPass = !0),
        (this._oldClearColor = new X()));
    }
    render(e, t, n) {
      let r = e.autoClear;
      e.autoClear = !1;
      let i, a;
      (this.overrideMaterial !== null &&
        ((a = this.scene.overrideMaterial), (this.scene.overrideMaterial = this.overrideMaterial)),
        this.clearColor !== null &&
          (e.getClearColor(this._oldClearColor),
          e.setClearColor(this.clearColor, e.getClearAlpha())),
        this.clearAlpha !== null && ((i = e.getClearAlpha()), e.setClearAlpha(this.clearAlpha)),
        this.clearDepth == 1 && e.clearDepth(),
        e.setRenderTarget(this.renderToScreen ? null : n),
        this.clear === !0 && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil),
        e.render(this.scene, this.camera),
        this.clearColor !== null && e.setClearColor(this._oldClearColor),
        this.clearAlpha !== null && e.setClearAlpha(i),
        this.overrideMaterial !== null && (this.scene.overrideMaterial = a),
        (e.autoClear = r));
    }
  },
  pd = {
    name: 'LuminosityHighPassShader',
    uniforms: {
      tDiffuse: { value: null },
      luminosityThreshold: { value: 1 },
      smoothWidth: { value: 1 },
      defaultColor: { value: new X(0) },
      defaultOpacity: { value: 0 }
    },
    vertexShader:
      '\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vUv = uv;\n\n			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n		}',
    fragmentShader:
      '\n\n		uniform sampler2D tDiffuse;\n		uniform vec3 defaultColor;\n		uniform float defaultOpacity;\n		uniform float luminosityThreshold;\n		uniform float smoothWidth;\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vec4 texel = texture2D( tDiffuse, vUv );\n\n			float v = luminance( texel.xyz );\n\n			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );\n\n			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );\n\n			gl_FragColor = mix( outputColor, texel, alpha );\n\n		}'
  },
  md = class e extends id {
    constructor(e, t = 1, n, r) {
      (super(),
        (this.strength = t),
        (this.radius = n),
        (this.threshold = r),
        (this.resolution = e === void 0 ? new q(256, 256) : new q(e.x, e.y)),
        (this.clearColor = new X(0, 0, 0)),
        (this.needsSwap = !1),
        (this.renderTargetsHorizontal = []),
        (this.renderTargetsVertical = []),
        (this.nMips = 5));
      let i = Math.round(this.resolution.x / 2),
        a = Math.round(this.resolution.y / 2);
      ((this.renderTargetBright = new Gt(i, a, { type: v })),
        (this.renderTargetBright.texture.name = 'UnrealBloomPass.bright'),
        (this.renderTargetBright.texture.generateMipmaps = !1));
      for (let e = 0; e < this.nMips; e++) {
        let t = new Gt(i, a, { type: v });
        ((t.texture.name = 'UnrealBloomPass.h' + e),
          (t.texture.generateMipmaps = !1),
          this.renderTargetsHorizontal.push(t));
        let n = new Gt(i, a, { type: v });
        ((n.texture.name = 'UnrealBloomPass.v' + e),
          (n.texture.generateMipmaps = !1),
          this.renderTargetsVertical.push(n),
          (i = Math.round(i / 2)),
          (a = Math.round(a / 2)));
      }
      let o = pd;
      ((this.highPassUniforms = Ka.clone(o.uniforms)),
        (this.highPassUniforms.luminosityThreshold.value = r),
        (this.highPassUniforms.smoothWidth.value = 0.01),
        (this.materialHighPassFilter = new Ya({
          uniforms: this.highPassUniforms,
          vertexShader: o.vertexShader,
          fragmentShader: o.fragmentShader
        })),
        (this.separableBlurMaterials = []));
      let s = [6, 10, 14, 18, 22];
      ((i = Math.round(this.resolution.x / 2)), (a = Math.round(this.resolution.y / 2)));
      for (let e = 0; e < this.nMips; e++)
        (this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),
          (this.separableBlurMaterials[e].uniforms.invSize.value = new q(1 / i, 1 / a)),
          (i = Math.round(i / 2)),
          (a = Math.round(a / 2)));
      ((this.compositeMaterial = this._getCompositeMaterial(this.nMips)),
        (this.compositeMaterial.uniforms.blurTexture1.value =
          this.renderTargetsVertical[0].texture),
        (this.compositeMaterial.uniforms.blurTexture2.value =
          this.renderTargetsVertical[1].texture),
        (this.compositeMaterial.uniforms.blurTexture3.value =
          this.renderTargetsVertical[2].texture),
        (this.compositeMaterial.uniforms.blurTexture4.value =
          this.renderTargetsVertical[3].texture),
        (this.compositeMaterial.uniforms.blurTexture5.value =
          this.renderTargetsVertical[4].texture),
        (this.compositeMaterial.uniforms.bloomStrength.value = t),
        (this.compositeMaterial.uniforms.bloomRadius.value = 0.1));
      let c = [1, 0.8, 0.6, 0.4, 0.2];
      ((this.compositeMaterial.uniforms.bloomFactors.value = c),
        (this.bloomTintColors = [
          new J(1, 1, 1),
          new J(1, 1, 1),
          new J(1, 1, 1),
          new J(1, 1, 1),
          new J(1, 1, 1)
        ]),
        (this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors),
        (this.copyUniforms = Ka.clone(rd.uniforms)),
        (this.blendMaterial = new Ya({
          uniforms: this.copyUniforms,
          vertexShader: rd.vertexShader,
          fragmentShader: rd.fragmentShader,
          premultipliedAlpha: !0,
          blending: 2,
          depthTest: !1,
          depthWrite: !1,
          transparent: !0
        })),
        (this._oldClearColor = new X()),
        (this._oldClearAlpha = 1),
        (this._basic = new Ir()),
        (this._fsQuad = new sd(null)));
    }
    dispose() {
      for (let e = 0; e < this.renderTargetsHorizontal.length; e++)
        this.renderTargetsHorizontal[e].dispose();
      for (let e = 0; e < this.renderTargetsVertical.length; e++)
        this.renderTargetsVertical[e].dispose();
      this.renderTargetBright.dispose();
      for (let e = 0; e < this.separableBlurMaterials.length; e++)
        this.separableBlurMaterials[e].dispose();
      (this.compositeMaterial.dispose(),
        this.blendMaterial.dispose(),
        this._basic.dispose(),
        this._fsQuad.dispose());
    }
    setSize(e, t) {
      let n = Math.round(e / 2),
        r = Math.round(t / 2);
      this.renderTargetBright.setSize(n, r);
      for (let e = 0; e < this.nMips; e++)
        (this.renderTargetsHorizontal[e].setSize(n, r),
          this.renderTargetsVertical[e].setSize(n, r),
          (this.separableBlurMaterials[e].uniforms.invSize.value = new q(1 / n, 1 / r)),
          (n = Math.round(n / 2)),
          (r = Math.round(r / 2)));
    }
    render(t, n, r, i, a) {
      (t.getClearColor(this._oldClearColor), (this._oldClearAlpha = t.getClearAlpha()));
      let o = t.autoClear;
      ((t.autoClear = !1),
        t.setClearColor(this.clearColor, 0),
        a && t.state.buffers.stencil.setTest(!1),
        this.renderToScreen &&
          ((this._fsQuad.material = this._basic),
          (this._basic.map = r.texture),
          t.setRenderTarget(null),
          t.clear(),
          this._fsQuad.render(t)),
        (this.highPassUniforms.tDiffuse.value = r.texture),
        (this.highPassUniforms.luminosityThreshold.value = this.threshold),
        (this._fsQuad.material = this.materialHighPassFilter),
        t.setRenderTarget(this.renderTargetBright),
        t.clear(),
        this._fsQuad.render(t));
      let s = this.renderTargetBright;
      for (let n = 0; n < this.nMips; n++)
        ((this._fsQuad.material = this.separableBlurMaterials[n]),
          (this.separableBlurMaterials[n].uniforms.colorTexture.value = s.texture),
          (this.separableBlurMaterials[n].uniforms.direction.value = e.BlurDirectionX),
          t.setRenderTarget(this.renderTargetsHorizontal[n]),
          t.clear(),
          this._fsQuad.render(t),
          (this.separableBlurMaterials[n].uniforms.colorTexture.value =
            this.renderTargetsHorizontal[n].texture),
          (this.separableBlurMaterials[n].uniforms.direction.value = e.BlurDirectionY),
          t.setRenderTarget(this.renderTargetsVertical[n]),
          t.clear(),
          this._fsQuad.render(t),
          (s = this.renderTargetsVertical[n]));
      ((this._fsQuad.material = this.compositeMaterial),
        (this.compositeMaterial.uniforms.bloomStrength.value = this.strength),
        (this.compositeMaterial.uniforms.bloomRadius.value = this.radius),
        (this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors),
        t.setRenderTarget(this.renderTargetsHorizontal[0]),
        t.clear(),
        this._fsQuad.render(t),
        (this._fsQuad.material = this.blendMaterial),
        (this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture),
        a && t.state.buffers.stencil.setTest(!0),
        this.renderToScreen
          ? (t.setRenderTarget(null), this._fsQuad.render(t))
          : (t.setRenderTarget(r), this._fsQuad.render(t)),
        t.setClearColor(this._oldClearColor, this._oldClearAlpha),
        (t.autoClear = o));
    }
    _getSeparableBlurMaterial(e) {
      let t = [],
        n = e / 3;
      for (let r = 0; r < e; r++) t.push((0.39894 * Math.exp((-0.5 * r * r) / (n * n))) / n);
      return new Ya({
        defines: { KERNEL_RADIUS: e },
        uniforms: {
          colorTexture: { value: null },
          invSize: { value: new q(0.5, 0.5) },
          direction: { value: new q(0.5, 0.5) },
          gaussianCoefficients: { value: t }
        },
        vertexShader:
          '\n\n				varying vec2 vUv;\n\n				void main() {\n\n					vUv = uv;\n					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n				}',
        fragmentShader:
          '\n\n				#include <common>\n\n				varying vec2 vUv;\n\n				uniform sampler2D colorTexture;\n				uniform vec2 invSize;\n				uniform vec2 direction;\n				uniform float gaussianCoefficients[KERNEL_RADIUS];\n\n				void main() {\n\n					float weightSum = gaussianCoefficients[0];\n					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;\n\n					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {\n\n						float x = float( i );\n						float w = gaussianCoefficients[i];\n						vec2 uvOffset = direction * invSize * x;\n						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;\n						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;\n						diffuseSum += ( sample1 + sample2 ) * w;\n\n					}\n\n					gl_FragColor = vec4( diffuseSum, 1.0 );\n\n				}'
      });
    }
    _getCompositeMaterial(e) {
      return new Ya({
        defines: { NUM_MIPS: e },
        uniforms: {
          blurTexture1: { value: null },
          blurTexture2: { value: null },
          blurTexture3: { value: null },
          blurTexture4: { value: null },
          blurTexture5: { value: null },
          bloomStrength: { value: 1 },
          bloomFactors: { value: null },
          bloomTintColors: { value: null },
          bloomRadius: { value: 0 }
        },
        vertexShader:
          '\n\n				varying vec2 vUv;\n\n				void main() {\n\n					vUv = uv;\n					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n				}',
        fragmentShader:
          '\n\n				varying vec2 vUv;\n\n				uniform sampler2D blurTexture1;\n				uniform sampler2D blurTexture2;\n				uniform sampler2D blurTexture3;\n				uniform sampler2D blurTexture4;\n				uniform sampler2D blurTexture5;\n				uniform float bloomStrength;\n				uniform float bloomRadius;\n				uniform float bloomFactors[NUM_MIPS];\n				uniform vec3 bloomTintColors[NUM_MIPS];\n\n				float lerpBloomFactor( const in float factor ) {\n\n					float mirrorFactor = 1.2 - factor;\n					return mix( factor, mirrorFactor, bloomRadius );\n\n				}\n\n				void main() {\n\n					// 3.0 for backwards compatibility with previous alpha-based intensity\n					vec3 bloom = 3.0 * bloomStrength * (\n						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +\n						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +\n						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +\n						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +\n						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb\n					);\n\n					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );\n					gl_FragColor = vec4( bloom, bloomAlpha );\n\n				}'
      });
    }
  };
((md.BlurDirectionX = new q(1, 0)), (md.BlurDirectionY = new q(0, 1)));
//#endregion
//#region node_modules/three/examples/jsm/loaders/SVGLoader.js
var hd = Pe,
  gd = class e extends xo {
    constructor(e) {
      (super(e), (this.defaultDPI = 90), (this.defaultUnit = 'px'));
    }
    load(e, t, n, r) {
      let i = this,
        a = new wo(i.manager);
      (a.setPath(i.path),
        a.setRequestHeader(i.requestHeader),
        a.setWithCredentials(i.withCredentials),
        a.load(
          e,
          function (n) {
            try {
              t(i.parse(n));
            } catch (t) {
              (r ? r(t) : console.error(t), i.manager.itemError(e));
            }
          },
          n,
          r
        ));
    }
    parse(e) {
      let t = this;
      function n(e, t) {
        if (e.nodeType !== 1) return;
        let a = y(e),
          o = !1,
          m = null;
        switch (e.nodeName) {
          case 'svg':
            t = p(e, t);
            break;
          case 'style':
            i(e);
            break;
          case 'g':
            t = p(e, t);
            break;
          case 'path':
            ((t = p(e, t)), e.hasAttribute('d') && (m = r(e)));
            break;
          case 'rect':
            ((t = p(e, t)), (m = s(e)));
            break;
          case 'polygon':
            ((t = p(e, t)), (m = c(e)));
            break;
          case 'polyline':
            ((t = p(e, t)), (m = l(e)));
            break;
          case 'circle':
            ((t = p(e, t)), (m = u(e)));
            break;
          case 'ellipse':
            ((t = p(e, t)), (m = d(e)));
            break;
          case 'line':
            ((t = p(e, t)), (m = f(e)));
            break;
          case 'defs':
            o = !0;
            break;
          case 'use':
            t = p(e, t);
            let a = (e.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '').substring(1),
              h = e.viewportElement.getElementById(a);
            h
              ? n(h, t)
              : console.warn("SVGLoader: 'use node' references non-existent node id: " + a);
            break;
          default:
        }
        m &&
          (t.fill !== void 0 && t.fill !== 'none' && m.color.setStyle(t.fill, hd),
          x(m, I),
          D.push(m),
          (m.userData = {
            node: e,
            style: t
          }));
        let h = e.childNodes;
        for (let e = 0; e < h.length; e++) {
          let r = h[e];
          (o && r.nodeName !== 'style' && r.nodeName !== 'defs') || n(r, t);
        }
        a && (k.pop(), k.length > 0 ? I.copy(k[k.length - 1]) : I.identity());
      }
      function r(e) {
        let t = new fs(),
          n = new q(),
          r = new q(),
          i = new q(),
          o = !0,
          s = !1,
          c = e.getAttribute('d');
        if (c === '' || c === 'none') return null;
        let l = c.match(/[a-df-z][^a-df-z]*/gi);
        for (let e = 0, c = l.length; e < c; e++) {
          let c = l[e],
            u = c.charAt(0),
            d = c.slice(1).trim();
          o === !0 && ((s = !0), (o = !1));
          let f;
          switch (u) {
            case 'M':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 2)
                ((n.x = f[e + 0]),
                  (n.y = f[e + 1]),
                  (r.x = n.x),
                  (r.y = n.y),
                  e === 0 ? t.moveTo(n.x, n.y) : t.lineTo(n.x, n.y),
                  e === 0 && i.copy(n));
              break;
            case 'H':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e++)
                ((n.x = f[e]),
                  (r.x = n.x),
                  (r.y = n.y),
                  t.lineTo(n.x, n.y),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'V':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e++)
                ((n.y = f[e]),
                  (r.x = n.x),
                  (r.y = n.y),
                  t.lineTo(n.x, n.y),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'L':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 2)
                ((n.x = f[e + 0]),
                  (n.y = f[e + 1]),
                  (r.x = n.x),
                  (r.y = n.y),
                  t.lineTo(n.x, n.y),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'C':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 6)
                (t.bezierCurveTo(f[e + 0], f[e + 1], f[e + 2], f[e + 3], f[e + 4], f[e + 5]),
                  (r.x = f[e + 2]),
                  (r.y = f[e + 3]),
                  (n.x = f[e + 4]),
                  (n.y = f[e + 5]),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'S':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 4)
                (t.bezierCurveTo(m(n.x, r.x), m(n.y, r.y), f[e + 0], f[e + 1], f[e + 2], f[e + 3]),
                  (r.x = f[e + 0]),
                  (r.y = f[e + 1]),
                  (n.x = f[e + 2]),
                  (n.y = f[e + 3]),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'Q':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 4)
                (t.quadraticCurveTo(f[e + 0], f[e + 1], f[e + 2], f[e + 3]),
                  (r.x = f[e + 0]),
                  (r.y = f[e + 1]),
                  (n.x = f[e + 2]),
                  (n.y = f[e + 3]),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'T':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 2) {
                let a = m(n.x, r.x),
                  o = m(n.y, r.y);
                (t.quadraticCurveTo(a, o, f[e + 0], f[e + 1]),
                  (r.x = a),
                  (r.y = o),
                  (n.x = f[e + 0]),
                  (n.y = f[e + 1]),
                  e === 0 && s === !0 && i.copy(n));
              }
              break;
            case 'A':
              f = h(d, [3, 4], 7);
              for (let e = 0, o = f.length; e < o; e += 7) {
                if (f[e + 5] == n.x && f[e + 6] == n.y) continue;
                let o = n.clone();
                ((n.x = f[e + 5]),
                  (n.y = f[e + 6]),
                  (r.x = n.x),
                  (r.y = n.y),
                  a(t, f[e], f[e + 1], f[e + 2], f[e + 3], f[e + 4], o, n),
                  e === 0 && s === !0 && i.copy(n));
              }
              break;
            case 'm':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 2)
                ((n.x += f[e + 0]),
                  (n.y += f[e + 1]),
                  (r.x = n.x),
                  (r.y = n.y),
                  e === 0 ? t.moveTo(n.x, n.y) : t.lineTo(n.x, n.y),
                  e === 0 && i.copy(n));
              break;
            case 'h':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e++)
                ((n.x += f[e]),
                  (r.x = n.x),
                  (r.y = n.y),
                  t.lineTo(n.x, n.y),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'v':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e++)
                ((n.y += f[e]),
                  (r.x = n.x),
                  (r.y = n.y),
                  t.lineTo(n.x, n.y),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'l':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 2)
                ((n.x += f[e + 0]),
                  (n.y += f[e + 1]),
                  (r.x = n.x),
                  (r.y = n.y),
                  t.lineTo(n.x, n.y),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'c':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 6)
                (t.bezierCurveTo(
                  n.x + f[e + 0],
                  n.y + f[e + 1],
                  n.x + f[e + 2],
                  n.y + f[e + 3],
                  n.x + f[e + 4],
                  n.y + f[e + 5]
                ),
                  (r.x = n.x + f[e + 2]),
                  (r.y = n.y + f[e + 3]),
                  (n.x += f[e + 4]),
                  (n.y += f[e + 5]),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 's':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 4)
                (t.bezierCurveTo(
                  m(n.x, r.x),
                  m(n.y, r.y),
                  n.x + f[e + 0],
                  n.y + f[e + 1],
                  n.x + f[e + 2],
                  n.y + f[e + 3]
                ),
                  (r.x = n.x + f[e + 0]),
                  (r.y = n.y + f[e + 1]),
                  (n.x += f[e + 2]),
                  (n.y += f[e + 3]),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 'q':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 4)
                (t.quadraticCurveTo(n.x + f[e + 0], n.y + f[e + 1], n.x + f[e + 2], n.y + f[e + 3]),
                  (r.x = n.x + f[e + 0]),
                  (r.y = n.y + f[e + 1]),
                  (n.x += f[e + 2]),
                  (n.y += f[e + 3]),
                  e === 0 && s === !0 && i.copy(n));
              break;
            case 't':
              f = h(d);
              for (let e = 0, a = f.length; e < a; e += 2) {
                let a = m(n.x, r.x),
                  o = m(n.y, r.y);
                (t.quadraticCurveTo(a, o, n.x + f[e + 0], n.y + f[e + 1]),
                  (r.x = a),
                  (r.y = o),
                  (n.x += f[e + 0]),
                  (n.y += f[e + 1]),
                  e === 0 && s === !0 && i.copy(n));
              }
              break;
            case 'a':
              f = h(d, [3, 4], 7);
              for (let e = 0, o = f.length; e < o; e += 7) {
                if (f[e + 5] == 0 && f[e + 6] == 0) continue;
                let o = n.clone();
                ((n.x += f[e + 5]),
                  (n.y += f[e + 6]),
                  (r.x = n.x),
                  (r.y = n.y),
                  a(t, f[e], f[e + 1], f[e + 2], f[e + 3], f[e + 4], o, n),
                  e === 0 && s === !0 && i.copy(n));
              }
              break;
            case 'Z':
            case 'z':
              ((t.currentPath.autoClose = !0),
                t.currentPath.curves.length > 0 &&
                  (n.copy(i), t.currentPath.currentPoint.copy(n), (o = !0)));
              break;
            default:
              console.warn(c);
          }
          s = !1;
        }
        return t;
      }
      function i(e) {
        if (!(!e.sheet || !e.sheet.cssRules || !e.sheet.cssRules.length))
          for (let t = 0; t < e.sheet.cssRules.length; t++) {
            let n = e.sheet.cssRules[t];
            if (n.type !== 1) continue;
            let r = n.selectorText
              .split(/,/gm)
              .filter(Boolean)
              .map((e) => e.trim());
            for (let e = 0; e < r.length; e++) {
              let t = Object.fromEntries(Object.entries(n.style).filter(([, e]) => e !== ''));
              O[r[e]] = Object.assign(O[r[e]] || {}, t);
            }
          }
      }
      function a(e, t, n, r, i, a, s, c) {
        if (t == 0 || n == 0) {
          e.lineTo(c.x, c.y);
          return;
        }
        ((r = (r * Math.PI) / 180), (t = Math.abs(t)), (n = Math.abs(n)));
        let l = (s.x - c.x) / 2,
          u = (s.y - c.y) / 2,
          d = Math.cos(r) * l + Math.sin(r) * u,
          f = -Math.sin(r) * l + Math.cos(r) * u,
          p = t * t,
          m = n * n,
          h = d * d,
          g = f * f,
          _ = h / p + g / m;
        if (_ > 1) {
          let e = Math.sqrt(_);
          ((t = e * t), (n = e * n), (p = t * t), (m = n * n));
        }
        let v = p * g + m * h,
          y = (p * m - v) / v,
          b = Math.sqrt(Math.max(0, y));
        i === a && (b = -b);
        let x = (b * t * f) / n,
          S = (-b * n * d) / t,
          C = Math.cos(r) * x - Math.sin(r) * S + (s.x + c.x) / 2,
          w = Math.sin(r) * x + Math.cos(r) * S + (s.y + c.y) / 2,
          T = o(1, 0, (d - x) / t, (f - S) / n),
          E = o((d - x) / t, (f - S) / n, (-d - x) / t, (-f - S) / n) % (Math.PI * 2);
        e.currentPath.absellipse(C, w, t, n, T, T + E, a === 0, r);
      }
      function o(e, t, n, r) {
        let i = e * n + t * r,
          a = Math.sqrt(e * e + t * t) * Math.sqrt(n * n + r * r),
          o = Math.acos(Math.max(-1, Math.min(1, i / a)));
        return (e * r - t * n < 0 && (o = -o), o);
      }
      function s(e) {
        let t = v(e.getAttribute('x') || 0),
          n = v(e.getAttribute('y') || 0),
          r = v(e.getAttribute('rx') || e.getAttribute('ry') || 0),
          i = v(e.getAttribute('ry') || e.getAttribute('rx') || 0),
          a = v(e.getAttribute('width')),
          o = v(e.getAttribute('height')),
          s = 0.448084975506,
          c = new fs();
        return (
          c.moveTo(t + r, n),
          c.lineTo(t + a - r, n),
          (r !== 0 || i !== 0) && c.bezierCurveTo(t + a - r * s, n, t + a, n + i * s, t + a, n + i),
          c.lineTo(t + a, n + o - i),
          (r !== 0 || i !== 0) &&
            c.bezierCurveTo(t + a, n + o - i * s, t + a - r * s, n + o, t + a - r, n + o),
          c.lineTo(t + r, n + o),
          (r !== 0 || i !== 0) && c.bezierCurveTo(t + r * s, n + o, t, n + o - i * s, t, n + o - i),
          c.lineTo(t, n + i),
          (r !== 0 || i !== 0) && c.bezierCurveTo(t, n + i * s, t + r * s, n, t + r, n),
          c
        );
      }
      function c(e) {
        function t(e, t, n) {
          let a = v(t),
            o = v(n);
          (i === 0 ? r.moveTo(a, o) : r.lineTo(a, o), i++);
        }
        let n = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g,
          r = new fs(),
          i = 0;
        return (e.getAttribute('points').replace(n, t), (r.currentPath.autoClose = !0), r);
      }
      function l(e) {
        function t(e, t, n) {
          let a = v(t),
            o = v(n);
          (i === 0 ? r.moveTo(a, o) : r.lineTo(a, o), i++);
        }
        let n = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g,
          r = new fs(),
          i = 0;
        return (e.getAttribute('points').replace(n, t), (r.currentPath.autoClose = !1), r);
      }
      function u(e) {
        let t = v(e.getAttribute('cx') || 0),
          n = v(e.getAttribute('cy') || 0),
          r = v(e.getAttribute('r') || 0),
          i = new Zi();
        i.absarc(t, n, r, 0, Math.PI * 2);
        let a = new fs();
        return (a.subPaths.push(i), a);
      }
      function d(e) {
        let t = v(e.getAttribute('cx') || 0),
          n = v(e.getAttribute('cy') || 0),
          r = v(e.getAttribute('rx') || 0),
          i = v(e.getAttribute('ry') || 0),
          a = new Zi();
        a.absellipse(t, n, r, i, 0, Math.PI * 2);
        let o = new fs();
        return (o.subPaths.push(a), o);
      }
      function f(e) {
        let t = v(e.getAttribute('x1') || 0),
          n = v(e.getAttribute('y1') || 0),
          r = v(e.getAttribute('x2') || 0),
          i = v(e.getAttribute('y2') || 0),
          a = new fs();
        return (a.moveTo(t, n), a.lineTo(r, i), (a.currentPath.autoClose = !1), a);
      }
      function p(e, t) {
        t = Object.assign({}, t);
        let n = {};
        if (e.hasAttribute('class')) {
          let t = e
            .getAttribute('class')
            .split(/\s/)
            .filter(Boolean)
            .map((e) => e.trim());
          for (let e = 0; e < t.length; e++) n = Object.assign(n, O['.' + t[e]]);
        }
        e.hasAttribute('id') && (n = Object.assign(n, O['#' + e.getAttribute('id')]));
        function r(r, i, a) {
          (a === void 0 &&
            (a = function (e) {
              return (
                e.startsWith('url') &&
                  console.warn('SVGLoader: url access in attributes is not implemented.'),
                e
              );
            }),
            e.hasAttribute(r) && (t[i] = a(e.getAttribute(r))),
            n[i] && (t[i] = a(n[i])),
            e.style && e.style[r] !== '' && (t[i] = a(e.style[r])));
        }
        function i(e) {
          return Math.max(0, Math.min(1, v(e)));
        }
        function a(e) {
          return Math.max(0, v(e));
        }
        return (
          r('fill', 'fill'),
          r('fill-opacity', 'fillOpacity', i),
          r('fill-rule', 'fillRule'),
          r('opacity', 'opacity', i),
          r('stroke', 'stroke'),
          r('stroke-opacity', 'strokeOpacity', i),
          r('stroke-width', 'strokeWidth', a),
          r('stroke-linejoin', 'strokeLineJoin'),
          r('stroke-linecap', 'strokeLineCap'),
          r('stroke-miterlimit', 'strokeMiterLimit', a),
          r('visibility', 'visibility'),
          t
        );
      }
      function m(e, t) {
        return e - (t - e);
      }
      function h(e, t, n) {
        if (typeof e != 'string') throw TypeError('Invalid input: ' + typeof e);
        let r = {
            SEPARATOR: /[ \t\r\n\,.\-+]/,
            WHITESPACE: /[ \t\r\n]/,
            DIGIT: /[\d]/,
            SIGN: /[-+]/,
            POINT: /\./,
            COMMA: /,/,
            EXP: /e/i,
            FLAGS: /[01]/
          },
          i = 0,
          a = !0,
          o = '',
          s = '',
          c = [];
        function l(e, t, n) {
          let r = /* @__PURE__ */ SyntaxError(
            'Unexpected character "' + e + '" at index ' + t + '.'
          );
          throw ((r.partial = n), r);
        }
        function u() {
          (o !== '' && (s === '' ? c.push(Number(o)) : c.push(Number(o) * 10 ** Number(s))),
            (o = ''),
            (s = ''));
        }
        let d,
          f = e.length;
        for (let p = 0; p < f; p++) {
          if (((d = e[p]), Array.isArray(t) && t.includes(c.length % n) && r.FLAGS.test(d))) {
            ((i = 1), (o = d), u());
            continue;
          }
          if (i === 0) {
            if (r.WHITESPACE.test(d)) continue;
            if (r.DIGIT.test(d) || r.SIGN.test(d)) {
              ((i = 1), (o = d));
              continue;
            }
            if (r.POINT.test(d)) {
              ((i = 2), (o = d));
              continue;
            }
            r.COMMA.test(d) && (a && l(d, p, c), (a = !0));
          }
          if (i === 1) {
            if (r.DIGIT.test(d)) {
              o += d;
              continue;
            }
            if (r.POINT.test(d)) {
              ((o += d), (i = 2));
              continue;
            }
            if (r.EXP.test(d)) {
              i = 3;
              continue;
            }
            r.SIGN.test(d) && o.length === 1 && r.SIGN.test(o[0]) && l(d, p, c);
          }
          if (i === 2) {
            if (r.DIGIT.test(d)) {
              o += d;
              continue;
            }
            if (r.EXP.test(d)) {
              i = 3;
              continue;
            }
            r.POINT.test(d) && o[o.length - 1] === '.' && l(d, p, c);
          }
          if (i === 3) {
            if (r.DIGIT.test(d)) {
              s += d;
              continue;
            }
            if (r.SIGN.test(d)) {
              if (s === '') {
                s += d;
                continue;
              }
              s.length === 1 && r.SIGN.test(s) && l(d, p, c);
            }
          }
          r.WHITESPACE.test(d)
            ? (u(), (i = 0), (a = !1))
            : r.COMMA.test(d)
              ? (u(), (i = 0), (a = !0))
              : r.SIGN.test(d)
                ? (u(), (i = 1), (o = d))
                : r.POINT.test(d)
                  ? (u(), (i = 2), (o = d))
                  : l(d, p, c);
        }
        return (u(), c);
      }
      let g = ['mm', 'cm', 'in', 'pt', 'pc', 'px'],
        _ = {
          mm: {
            mm: 1,
            cm: 0.1,
            in: 1 / 25.4,
            pt: 72 / 25.4,
            pc: 6 / 25.4,
            px: -1
          },
          cm: {
            mm: 10,
            cm: 1,
            in: 1 / 2.54,
            pt: 72 / 2.54,
            pc: 6 / 2.54,
            px: -1
          },
          in: {
            mm: 25.4,
            cm: 2.54,
            in: 1,
            pt: 72,
            pc: 6,
            px: -1
          },
          pt: {
            mm: 25.4 / 72,
            cm: 2.54 / 72,
            in: 1 / 72,
            pt: 1,
            pc: 6 / 72,
            px: -1
          },
          pc: {
            mm: 25.4 / 6,
            cm: 2.54 / 6,
            in: 1 / 6,
            pt: 72 / 6,
            pc: 1,
            px: -1
          },
          px: { px: 1 }
        };
      function v(e) {
        let n = 'px';
        if (typeof e == 'string' || e instanceof String)
          for (let t = 0, r = g.length; t < r; t++) {
            let r = g[t];
            if (e.endsWith(r)) {
              ((n = r), (e = e.substring(0, e.length - r.length)));
              break;
            }
          }
        let r;
        return (
          n === 'px' && t.defaultUnit !== 'px'
            ? (r = _.in[t.defaultUnit] / t.defaultDPI)
            : ((r = _[n][t.defaultUnit]), r < 0 && (r = _[n].in * t.defaultDPI)),
          r * parseFloat(e)
        );
      }
      function y(e) {
        if (
          !(
            e.hasAttribute('transform') ||
            (e.nodeName === 'use' && (e.hasAttribute('x') || e.hasAttribute('y')))
          )
        )
          return null;
        let t = b(e);
        return (k.length > 0 && t.premultiply(k[k.length - 1]), I.copy(t), k.push(t), t);
      }
      function b(e) {
        let t = new Y(),
          n = A;
        if (e.nodeName === 'use' && (e.hasAttribute('x') || e.hasAttribute('y'))) {
          let n = v(e.getAttribute('x') || 0),
            r = v(e.getAttribute('y') || 0);
          t.translate(n, r);
        }
        if (e.hasAttribute('transform')) {
          let r = e.getAttribute('transform').split(')');
          for (let e = r.length - 1; e >= 0; e--) {
            let i = r[e].trim();
            if (i === '') continue;
            let a = i.indexOf('('),
              o = i.length;
            if (a > 0 && a < o) {
              let e = i.slice(0, a),
                t = h(i.slice(a + 1));
              switch ((n.identity(), e)) {
                case 'translate':
                  if (t.length >= 1) {
                    let e = t[0],
                      r = 0;
                    (t.length >= 2 && (r = t[1]), n.translate(e, r));
                  }
                  break;
                case 'rotate':
                  if (t.length >= 1) {
                    let e = 0,
                      r = 0,
                      i = 0;
                    ((e = (t[0] * Math.PI) / 180),
                      t.length >= 3 && ((r = t[1]), (i = t[2])),
                      j.makeTranslation(-r, -i),
                      M.makeRotation(e),
                      N.multiplyMatrices(M, j),
                      j.makeTranslation(r, i),
                      n.multiplyMatrices(j, N));
                  }
                  break;
                case 'scale':
                  if (t.length >= 1) {
                    let e = t[0],
                      r = e;
                    (t.length >= 2 && (r = t[1]), n.scale(e, r));
                  }
                  break;
                case 'skewX':
                  t.length === 1 && n.set(1, Math.tan((t[0] * Math.PI) / 180), 0, 0, 1, 0, 0, 0, 1);
                  break;
                case 'skewY':
                  t.length === 1 && n.set(1, 0, 0, Math.tan((t[0] * Math.PI) / 180), 1, 0, 0, 0, 1);
                  break;
                case 'matrix':
                  t.length === 6 && n.set(t[0], t[2], t[4], t[1], t[3], t[5], 0, 0, 1);
                  break;
              }
            }
            t.premultiply(n);
          }
        }
        return t;
      }
      function x(e, t) {
        function n(e) {
          (F.set(e.x, e.y, 1).applyMatrix3(t), e.set(F.x, F.y));
        }
        function r(e) {
          let n = e.xRadius,
            r = e.yRadius,
            i = Math.cos(e.aRotation),
            a = Math.sin(e.aRotation),
            o = new J(n * i, n * a, 0),
            s = new J(-r * a, r * i, 0),
            c = o.applyMatrix3(t),
            l = s.applyMatrix3(t),
            u = A.set(c.x, l.x, 0, c.y, l.y, 0, 0, 0, 1),
            d = j.copy(u).invert(),
            f = M.copy(d).transpose().multiply(d).elements,
            p = E(f[0], f[1], f[4]),
            m = Math.sqrt(p.rt1),
            h = Math.sqrt(p.rt2);
          if (
            ((e.xRadius = 1 / m),
            (e.yRadius = 1 / h),
            (e.aRotation = Math.atan2(p.sn, p.cs)),
            !((e.aEndAngle - e.aStartAngle) % (2 * Math.PI) < 2 ** -52))
          ) {
            let n = j.set(m, 0, 0, 0, h, 0, 0, 0, 1),
              r = M.set(p.cs, p.sn, 0, -p.sn, p.cs, 0, 0, 0, 1),
              i = n.multiply(r).multiply(u),
              a = (e) => {
                let { x: t, y: n } = new J(Math.cos(e), Math.sin(e), 0).applyMatrix3(i);
                return Math.atan2(n, t);
              };
            ((e.aStartAngle = a(e.aStartAngle)),
              (e.aEndAngle = a(e.aEndAngle)),
              S(t) && (e.aClockwise = !e.aClockwise));
          }
        }
        function i(e) {
          let n = w(t),
            r = T(t);
          ((e.xRadius *= n), (e.yRadius *= r));
          let i =
            n > 2 ** -52
              ? Math.atan2(t.elements[1], t.elements[0])
              : Math.atan2(-t.elements[3], t.elements[4]);
          ((e.aRotation += i),
            S(t) && ((e.aStartAngle *= -1), (e.aEndAngle *= -1), (e.aClockwise = !e.aClockwise)));
        }
        let a = e.subPaths;
        for (let e = 0, o = a.length; e < o; e++) {
          let o = a[e].curves;
          for (let e = 0; e < o.length; e++) {
            let a = o[e];
            a.isLineCurve
              ? (n(a.v1), n(a.v2))
              : a.isCubicBezierCurve
                ? (n(a.v0), n(a.v1), n(a.v2), n(a.v3))
                : a.isQuadraticBezierCurve
                  ? (n(a.v0), n(a.v1), n(a.v2))
                  : a.isEllipseCurve &&
                    (P.set(a.aX, a.aY), n(P), (a.aX = P.x), (a.aY = P.y), C(t) ? r(a) : i(a));
          }
        }
      }
      function S(e) {
        let t = e.elements;
        return t[0] * t[4] - t[1] * t[3] < 0;
      }
      function C(e) {
        let t = e.elements,
          n = t[0] * t[3] + t[1] * t[4];
        if (n === 0) return !1;
        let r = w(e),
          i = T(e);
        return Math.abs(n / (r * i)) > 2 ** -52;
      }
      function w(e) {
        let t = e.elements;
        return Math.sqrt(t[0] * t[0] + t[1] * t[1]);
      }
      function T(e) {
        let t = e.elements;
        return Math.sqrt(t[3] * t[3] + t[4] * t[4]);
      }
      function E(e, t, n) {
        let r,
          i,
          a,
          o,
          s,
          c = e + n,
          l = e - n,
          u = Math.sqrt(l * l + 4 * t * t);
        return (
          c > 0
            ? ((r = 0.5 * (c + u)), (s = 1 / r), (i = e * s * n - t * s * t))
            : c < 0
              ? (i = 0.5 * (c - u))
              : ((r = 0.5 * u), (i = -0.5 * u)),
          (a = l > 0 ? l + u : l - u),
          Math.abs(a) > 2 * Math.abs(t)
            ? ((s = (-2 * t) / a), (o = 1 / Math.sqrt(1 + s * s)), (a = s * o))
            : Math.abs(t) === 0
              ? ((a = 1), (o = 0))
              : ((s = (-0.5 * a) / t), (a = 1 / Math.sqrt(1 + s * s)), (o = s * a)),
          l > 0 && ((s = a), (a = -o), (o = s)),
          {
            rt1: r,
            rt2: i,
            cs: a,
            sn: o
          }
        );
      }
      let D = [],
        O = {},
        k = [],
        A = new Y(),
        j = new Y(),
        M = new Y(),
        N = new Y(),
        P = new q(),
        F = new J(),
        I = new Y(),
        ee = new DOMParser().parseFromString(e, 'image/svg+xml');
      return (
        n(ee.documentElement, {
          fill: '#000',
          fillOpacity: 1,
          strokeOpacity: 1,
          strokeWidth: 1,
          strokeLineJoin: 'miter',
          strokeLineCap: 'butt',
          strokeMiterLimit: 4
        }),
        {
          paths: D,
          xml: ee.documentElement
        }
      );
    }
    static createShapes(e) {
      let t = 999999999,
        n = {
          ORIGIN: 0,
          DESTINATION: 1,
          BETWEEN: 2,
          LEFT: 3,
          RIGHT: 4,
          BEHIND: 5,
          BEYOND: 6
        },
        r = {
          loc: n.ORIGIN,
          t: 0
        };
      function i(e, t, i, o) {
        let s = e.x,
          c = t.x,
          l = i.x,
          u = o.x,
          d = e.y,
          f = t.y,
          p = i.y,
          m = o.y,
          h = (u - l) * (d - p) - (m - p) * (s - l),
          g = (c - s) * (d - p) - (f - d) * (s - l),
          _ = (m - p) * (c - s) - (u - l) * (f - d),
          v = h / _,
          y = g / _;
        if ((_ === 0 && h !== 0) || v <= 0 || v >= 1 || y < 0 || y > 1) return null;
        if (h === 0 && _ === 0) {
          for (let l = 0; l < 2; l++)
            if ((a(l === 0 ? i : o, e, t), r.loc == n.ORIGIN)) {
              let e = l === 0 ? i : o;
              return {
                x: e.x,
                y: e.y,
                t: r.t
              };
            } else if (r.loc == n.BETWEEN)
              return {
                x: +(s + r.t * (c - s)).toPrecision(10),
                y: +(d + r.t * (f - d)).toPrecision(10),
                t: r.t
              };
          return null;
        } else {
          for (let s = 0; s < 2; s++)
            if ((a(s === 0 ? i : o, e, t), r.loc == n.ORIGIN)) {
              let e = s === 0 ? i : o;
              return {
                x: e.x,
                y: e.y,
                t: r.t
              };
            }
          return {
            x: +(s + v * (c - s)).toPrecision(10),
            y: +(d + v * (f - d)).toPrecision(10),
            t: v
          };
        }
      }
      function a(e, t, i) {
        let a = i.x - t.x,
          o = i.y - t.y,
          s = e.x - t.x,
          c = e.y - t.y,
          l = a * c - s * o;
        if (e.x === t.x && e.y === t.y) {
          ((r.loc = n.ORIGIN), (r.t = 0));
          return;
        }
        if (e.x === i.x && e.y === i.y) {
          ((r.loc = n.DESTINATION), (r.t = 1));
          return;
        }
        if (l < -(2 ** -52)) {
          r.loc = n.LEFT;
          return;
        }
        if (l > 2 ** -52) {
          r.loc = n.RIGHT;
          return;
        }
        if (a * s < 0 || o * c < 0) {
          r.loc = n.BEHIND;
          return;
        }
        if (Math.sqrt(a * a + o * o) < Math.sqrt(s * s + c * c)) {
          r.loc = n.BEYOND;
          return;
        }
        let u;
        ((u = a === 0 ? c / o : s / a), (r.loc = n.BETWEEN), (r.t = u));
      }
      function o(e, t) {
        let n = [],
          r = [];
        for (let a = 1; a < e.length; a++) {
          let o = e[a - 1],
            s = e[a];
          for (let e = 1; e < t.length; e++) {
            let a = t[e - 1],
              c = t[e],
              l = i(o, s, a, c);
            l !== null &&
              n.find((e) => e.t <= l.t + 2 ** -52 && e.t >= l.t - 2 ** -52) === void 0 &&
              (n.push(l), r.push(new q(l.x, l.y)));
          }
        }
        return r;
      }
      function s(e, t, n) {
        let r = new q();
        t.getCenter(r);
        let i = [];
        return (
          n.forEach((t) => {
            t.boundingBox.containsPoint(r) &&
              o(e, t.points).forEach((e) => {
                i.push({
                  identifier: t.identifier,
                  isCW: t.isCW,
                  point: e
                });
              });
          }),
          i.sort((e, t) => e.point.x - t.point.x),
          i
        );
      }
      function c(e, t, n, r, i) {
        (i == null || i === '') && (i = 'nonzero');
        let a = new q();
        e.boundingBox.getCenter(a);
        let o = s([new q(n, a.y), new q(r, a.y)], e.boundingBox, t);
        o.sort((e, t) => e.point.x - t.point.x);
        let c = [],
          l = [];
        o.forEach((t) => {
          t.identifier === e.identifier ? c.push(t) : l.push(t);
        });
        let u = c[0].point.x,
          d = [],
          f = 0;
        for (; f < l.length && l[f].point.x < u; )
          (d.length > 0 && d[d.length - 1] === l[f].identifier ? d.pop() : d.push(l[f].identifier),
            f++);
        if ((d.push(e.identifier), i === 'evenodd')) {
          let t = d.length % 2 == 0,
            n = d[d.length - 2];
          return {
            identifier: e.identifier,
            isHole: t,
            for: n
          };
        } else if (i === 'nonzero') {
          let n = !0,
            r = null,
            i = null;
          for (let e = 0; e < d.length; e++) {
            let a = d[e];
            n
              ? ((i = t[a].isCW), (n = !1), (r = a))
              : i !== t[a].isCW && ((i = t[a].isCW), (n = !0));
          }
          return {
            identifier: e.identifier,
            isHole: n,
            for: r
          };
        } else console.warn('fill-rule: "' + i + '" is currently not implemented.');
      }
      let l = t,
        u = -999999999,
        d = e.subPaths.map((e) => {
          let n = e.getPoints(),
            r = -999999999,
            i = t,
            a = -999999999,
            o = t;
          for (let e = 0; e < n.length; e++) {
            let t = n[e];
            (t.y > r && (r = t.y),
              t.y < i && (i = t.y),
              t.x > a && (a = t.x),
              t.x < o && (o = t.x));
          }
          return (
            u <= a && (u = a + 1),
            l >= o && (l = o - 1),
            {
              curves: e.curves,
              points: n,
              isCW: Na.isClockWise(n),
              identifier: -1,
              boundingBox: new ds(new q(o, i), new q(a, r))
            }
          );
        });
      d = d.filter((e) => e.points.length > 1);
      for (let e = 0; e < d.length; e++) d[e].identifier = e;
      let f = d.map((t) => c(t, d, l, u, e.userData ? e.userData.style.fillRule : void 0)),
        p = [];
      return (
        d.forEach((e) => {
          if (!f[e.identifier].isHole) {
            let t = new Qi();
            ((t.curves = e.curves),
              f
                .filter((t) => t.isHole && t.for === e.identifier)
                .forEach((e) => {
                  let n = d[e.identifier],
                    r = new Zi();
                  ((r.curves = n.curves), t.holes.push(r));
                }),
              p.push(t));
          }
        }),
        p
      );
    }
    static getStrokeStyle(e, t, n, r, i) {
      return (
        (e = e === void 0 ? 1 : e),
        (t = t === void 0 ? '#000' : t),
        (n = n === void 0 ? 'miter' : n),
        (r = r === void 0 ? 'butt' : r),
        (i = i === void 0 ? 4 : i),
        {
          strokeColor: t,
          strokeWidth: e,
          strokeLineJoin: n,
          strokeLineCap: r,
          strokeMiterLimit: i
        }
      );
    }
    static pointsToStroke(t, n, r, i) {
      let a = [],
        o = [],
        s = [];
      if (e.pointsToStrokeWithBuffers(t, n, r, i, a, o, s) === 0) return null;
      let c = new Tr();
      return (
        c.setAttribute('position', new pr(a, 3)),
        c.setAttribute('normal', new pr(o, 3)),
        c.setAttribute('uv', new pr(s, 2)),
        c
      );
    }
    static pointsToStrokeWithBuffers(e, t, n, r, i, a, o, s) {
      let c = new q(),
        l = new q(),
        u = new q(),
        d = new q(),
        f = new q(),
        p = new q(),
        m = new q(),
        h = new q(),
        g = new q(),
        _ = new q(),
        v = new q(),
        y = new q(),
        b = new q(),
        x = new q(),
        S = new q(),
        C = new q(),
        w = new q();
      ((n = n === void 0 ? 12 : n),
        (r = r === void 0 ? 0.001 : r),
        (s = s === void 0 ? 0 : s),
        (e = ce(e)));
      let T = e.length;
      if (T < 2) return 0;
      let E = e[0].equals(e[T - 1]),
        D,
        O = e[0],
        k,
        A = t.strokeWidth / 2,
        j = 1 / (T - 1),
        M = 0,
        N,
        P,
        F,
        I,
        ee = !1,
        te = 0,
        ne = s * 3,
        re = s * 2;
      (L(e[0], e[1], c).multiplyScalar(A),
        h.copy(e[0]).sub(c),
        g.copy(e[0]).add(c),
        _.copy(h),
        v.copy(g));
      for (let n = 1; n < T; n++) {
        ((D = e[n]), (k = n === T - 1 ? (E ? e[1] : void 0) : e[n + 1]));
        let r = c;
        if (
          (L(O, D, r),
          u.copy(r).multiplyScalar(A),
          y.copy(D).sub(u),
          b.copy(D).add(u),
          (N = M + j),
          (P = !1),
          k !== void 0)
        ) {
          (L(D, k, l),
            u.copy(l).multiplyScalar(A),
            x.copy(D).sub(u),
            S.copy(D).add(u),
            (F = !0),
            u.subVectors(k, O),
            r.dot(u) < 0 && (F = !1),
            n === 1 && (ee = F),
            u.subVectors(k, D),
            u.normalize());
          let e = Math.abs(r.dot(u));
          if (e > 2 ** -52) {
            let n = A / e;
            (u.multiplyScalar(-n),
              d.subVectors(D, O),
              f.copy(d).setLength(n).add(u),
              C.copy(f).negate());
            let r = f.length(),
              i = d.length();
            (d.divideScalar(i), p.subVectors(k, D));
            let a = p.length();
            switch (
              (p.divideScalar(a),
              d.dot(C) < i && p.dot(C) < a && (P = !0),
              w.copy(f).add(D),
              C.add(D),
              (I = !1),
              P ? (F ? (S.copy(C), b.copy(C)) : (x.copy(C), y.copy(C))) : z(),
              t.strokeLineJoin)
            ) {
              case 'bevel':
                ae(F, P, N);
                break;
              case 'round':
                (oe(F, P), F ? ie(D, y, x, N, 0) : ie(D, S, b, N, 1));
                break;
              default:
                let e = (A * t.strokeMiterLimit) / r;
                if (e < 1)
                  if (t.strokeLineJoin !== 'miter-clip') {
                    ae(F, P, N);
                    break;
                  } else
                    (oe(F, P),
                      F
                        ? (p.subVectors(w, y).multiplyScalar(e).add(y),
                          m.subVectors(w, x).multiplyScalar(e).add(x),
                          R(y, N, 0),
                          R(p, N, 0),
                          R(D, N, 0.5),
                          R(D, N, 0.5),
                          R(p, N, 0),
                          R(m, N, 0),
                          R(D, N, 0.5),
                          R(m, N, 0),
                          R(x, N, 0))
                        : (p.subVectors(w, b).multiplyScalar(e).add(b),
                          m.subVectors(w, S).multiplyScalar(e).add(S),
                          R(b, N, 1),
                          R(p, N, 1),
                          R(D, N, 0.5),
                          R(D, N, 0.5),
                          R(p, N, 1),
                          R(m, N, 1),
                          R(D, N, 0.5),
                          R(m, N, 1),
                          R(S, N, 1)));
                else
                  (P
                    ? (F
                        ? (R(g, M, 1), R(h, M, 0), R(w, N, 0), R(g, M, 1), R(w, N, 0), R(C, N, 1))
                        : (R(g, M, 1), R(h, M, 0), R(w, N, 1), R(h, M, 0), R(C, N, 0), R(w, N, 1)),
                      F ? x.copy(w) : S.copy(w))
                    : F
                      ? (R(y, N, 0), R(w, N, 0), R(D, N, 0.5), R(D, N, 0.5), R(w, N, 0), R(x, N, 0))
                      : (R(b, N, 1),
                        R(w, N, 1),
                        R(D, N, 0.5),
                        R(D, N, 0.5),
                        R(w, N, 1),
                        R(S, N, 1)),
                    (I = !0));
                break;
            }
          } else z();
        } else z();
        (!E && n === T - 1 && se(e[0], _, v, F, !0, M), (M = N), (O = D), h.copy(x), g.copy(S));
      }
      if (!E) se(D, y, b, F, !1, N);
      else if (P && i) {
        let e = w,
          t = C;
        (ee !== F && ((e = C), (t = w)),
          F
            ? (I || ee) && (t.toArray(i, 0), t.toArray(i, 9), I && e.toArray(i, 3))
            : (I || !ee) && (t.toArray(i, 3), t.toArray(i, 9), I && e.toArray(i, 0)));
      }
      return te;
      function L(e, t, n) {
        return (n.subVectors(t, e), n.set(-n.y, n.x).normalize());
      }
      function R(e, t, n) {
        (i &&
          ((i[ne] = e.x),
          (i[ne + 1] = e.y),
          (i[ne + 2] = 0),
          a && ((a[ne] = 0), (a[ne + 1] = 0), (a[ne + 2] = 1)),
          (ne += 3),
          o && ((o[re] = t), (o[re + 1] = n), (re += 2))),
          (te += 3));
      }
      function ie(e, t, r, i, a) {
        (c.copy(t).sub(e).normalize(), l.copy(r).sub(e).normalize());
        let o = Math.PI,
          s = c.dot(l);
        (Math.abs(s) < 1 && (o = Math.abs(Math.acos(s))), (o /= n), u.copy(t));
        for (let t = 0, r = n - 1; t < r; t++)
          (d.copy(u).rotateAround(e, o), R(u, i, a), R(d, i, a), R(e, i, 0.5), u.copy(d));
        (R(u, i, a), R(r, i, a), R(e, i, 0.5));
      }
      function z() {
        (R(g, M, 1), R(h, M, 0), R(y, N, 0), R(g, M, 1), R(y, N, 0), R(b, N, 1));
      }
      function ae(e, t, n) {
        t
          ? e
            ? (R(g, M, 1),
              R(h, M, 0),
              R(y, N, 0),
              R(g, M, 1),
              R(y, N, 0),
              R(C, N, 1),
              R(y, n, 0),
              R(x, n, 0),
              R(C, n, 0.5))
            : (R(g, M, 1),
              R(h, M, 0),
              R(b, N, 1),
              R(h, M, 0),
              R(C, N, 0),
              R(b, N, 1),
              R(b, n, 1),
              R(C, n, 0),
              R(S, n, 1))
          : e
            ? (R(y, n, 0), R(x, n, 0), R(D, n, 0.5))
            : (R(b, n, 1), R(S, n, 0), R(D, n, 0.5));
      }
      function oe(e, t) {
        t &&
          (e
            ? (R(g, M, 1),
              R(h, M, 0),
              R(y, N, 0),
              R(g, M, 1),
              R(y, N, 0),
              R(C, N, 1),
              R(y, M, 0),
              R(D, N, 0.5),
              R(C, N, 1),
              R(D, N, 0.5),
              R(x, M, 0),
              R(C, N, 1))
            : (R(g, M, 1),
              R(h, M, 0),
              R(b, N, 1),
              R(h, M, 0),
              R(C, N, 0),
              R(b, N, 1),
              R(b, M, 1),
              R(C, N, 0),
              R(D, N, 0.5),
              R(D, N, 0.5),
              R(C, N, 0),
              R(S, M, 1)));
      }
      function se(e, n, r, a, s, f) {
        switch (t.strokeLineCap) {
          case 'round':
            s ? ie(e, r, n, f, 0.5) : ie(e, n, r, f, 0.5);
            break;
          case 'square':
            if (s)
              (c.subVectors(n, e),
                l.set(c.y, -c.x),
                u.addVectors(c, l).add(e),
                d.subVectors(l, c).add(e),
                a
                  ? (u.toArray(i, 3), d.toArray(i, 0), d.toArray(i, 9))
                  : (u.toArray(i, 3),
                    o[7] === 1 ? d.toArray(i, 9) : u.toArray(i, 9),
                    d.toArray(i, 0)));
            else {
              (c.subVectors(r, e),
                l.set(c.y, -c.x),
                u.addVectors(c, l).add(e),
                d.subVectors(l, c).add(e));
              let t = i.length;
              a
                ? (u.toArray(i, t - 3), d.toArray(i, t - 6), d.toArray(i, t - 12))
                : (d.toArray(i, t - 6), u.toArray(i, t - 3), d.toArray(i, t - 12));
            }
            break;
          default:
            break;
        }
      }
      function ce(e) {
        let t = !1;
        for (let n = 1, i = e.length - 1; n < i; n++)
          if (e[n].distanceTo(e[n + 1]) < r) {
            t = !0;
            break;
          }
        if (!t) return e;
        let n = [];
        n.push(e[0]);
        for (let t = 1, i = e.length - 1; t < i; t++)
          e[t].distanceTo(e[t + 1]) >= r && n.push(e[t]);
        return (n.push(e[e.length - 1]), n);
      }
    }
  },
  _d = {
    interactionMode: 'autoRotate',
    autoRotateSpeed: 0.12,
    floatAmplitude: 8,
    floatSpeed: 0.8,
    cursorMaxYaw: 24,
    cursorMaxPitch: 14,
    cursorResponse: 7,
    cursorReturnResponse: 4,
    cursorOrbitSpeed: 0.75,
    cursorTarget: 'element',
    enableRewind: !0,
    rewindIdleTime: 2,
    rewindSpeed: 1.5
  },
  vd = (e, t, n) => Math.min(Math.max(e, t), n),
  $ = (e, t) => {
    let n = Number(e);
    return Number.isFinite(n) ? n : t;
  },
  yd = (e) => (Math.PI / 180) * e,
  bd = (e) => Math.atan2(Math.sin(e), Math.cos(e)),
  xd = (e) => (Object.is(e, -0) ? 0 : e),
  Sd = (e, t) => {
    let n = Math.max(0, $(e, 0)),
      r = Math.max(0, $(t, 0));
    return vd(1 - Math.exp(-n * r), 0, 1);
  },
  Cd = (e, t, n, r) => {
    let i = Sd(n, r);
    return e + (t - e) * i;
  },
  wd = (e, t, n) => {
    let r = Math.max(1, $(n?.width, 1)),
      i = Math.max(1, $(n?.height, 1)),
      a = $(n?.left, 0),
      o = $(n?.top, 0),
      s = ((e - a) / r) * 2 - 1,
      c = -(((t - o) / i) * 2 - 1);
    return {
      x: xd(vd(s, -1, 1)),
      y: xd(vd(c, -1, 1))
    };
  },
  Td = (e, t, n) =>
    n ? e >= n.left && e <= n.left + n.width && t >= n.top && t <= n.top + n.height : !1,
  Ed = (e, t, n) => ({
    yaw: e.x * yd($(t, _d.cursorMaxYaw)),
    pitch: -e.y * yd($(n, _d.cursorMaxPitch))
  }),
  Dd = (e, t = _d.cursorOrbitSpeed) => {
    let n = Math.PI * 2 * $(t, _d.cursorOrbitSpeed);
    return {
      yaw: xd(e.x * n),
      pitch: xd(-e.y * n)
    };
  },
  Od = (e, t, n) => ({
    yaw: e.yaw + t.yaw * n,
    pitch: e.pitch + t.pitch * n
  }),
  kd = class {
    constructor() {
      ((this.history = []),
        (this.idleTimer = 0),
        (this.isRewinding = !1),
        (this.initialState = null));
    }
    setInitialState(e, t) {
      this.initialState = {
        position: e.clone(),
        quaternion: t.clone()
      };
    }
    update(e, t, n, r) {
      let i = r.enableRewind ?? _d.enableRewind,
        a = r.rewindIdleTime ?? _d.rewindIdleTime,
        o = r.rewindSpeed ?? _d.rewindSpeed;
      if (!i) return ((this.history.length = 0), (this.idleTimer = 0), (this.isRewinding = !1), !1);
      if (e)
        return (
          this.history.push({
            position: t.position.clone(),
            quaternion: t.quaternion.clone()
          }),
          this.history.length > 1800 && this.history.shift(),
          (this.idleTimer = 0),
          (this.isRewinding = !1),
          !1
        );
      if (
        (this.history.length > 0 &&
          !this.isRewinding &&
          ((this.idleTimer += n), this.idleTimer >= a && (this.isRewinding = !0)),
        this.isRewinding)
      ) {
        let e = Math.max(1, Math.round((n / (1 / 60)) * o)),
          r;
        for (let t = 0; t < e; t++) this.history.length > 0 && (r = this.history.pop());
        if (r) {
          let e = t.position.length();
          (t.position.copy(r.position).setLength(e), t.quaternion.copy(r.quaternion));
        }
        if (this.history.length === 0 && ((this.isRewinding = !1), this.initialState)) {
          let e = t.position.length();
          (t.position.copy(this.initialState.position).setLength(e),
            t.quaternion.copy(this.initialState.quaternion));
        }
        return !0;
      }
      return !1;
    }
  },
  Ad = (e) => ({
    svgInput: e.geometry?.source?.svg ?? '',
    geometryMode: e.geometry?.mode ?? 'Hollow Skeleton (Wireframe)',
    outlineThickness: $(e.geometry?.outlineThickness, 2),
    stackingStyle: e.geometry?.stackingStyle ?? 'Embossed',
    layerSpacing: $(e.geometry?.layerSpacing, 1),
    depth: $(e.geometry?.depth, 40),
    bevelScale: $(e.geometry?.bevelScale, 1),
    materialPreset: e.material?.preset ?? 'Holographic Metal',
    colorSource: e.material?.colorSource ?? 'Original',
    modelColor: e.material?.modelColor ?? '#ffffff',
    adaptiveMaterial: e.material?.adaptiveMaterial ?? !0,
    manualMaterialColor: e.material?.manualMaterialColor ?? '#00ff00',
    holoSpectrum: $(e.material?.holoSpectrum, 0.5),
    metalness: $(e.material?.metalness, 0.85),
    roughness: $(e.material?.roughness, 0.15),
    customTextureData: e.material?.customTexture?.included ? e.material.customTexture.data : null,
    ambientIntensity: $(e.lighting?.ambientIntensity, 0.5),
    syncLightsWithBg: e.lighting?.syncLightsWithBg ?? !1,
    keyLightColor: e.lighting?.keyLightColor ?? '#ffffff',
    fillLightColor: e.lighting?.fillLightColor ?? '#aaccff',
    keyLightIntensity: $(e.lighting?.keyLightIntensity, 1),
    fillLightIntensity: $(e.lighting?.fillLightIntensity, 0.8),
    rimColor: e.lighting?.rimColor ?? '#ff00ff',
    lightDirection: e.lighting?.lightDirection ?? {
      x: -0.5,
      y: 0.5,
      z: 0.7071
    },
    bgType: e.environment?.bgType ?? 'Radial',
    bgColor: e.environment?.bgColor ?? '#111111',
    bgColor2: e.environment?.bgColor2 ?? '#000000',
    bgGradientColors: e.environment?.bgGradientColors ?? ['#111111', '#000000'],
    bgGradientAngle: $(e.environment?.bgGradientAngle, 45),
    bloomStrength: $(e.render?.bloomStrength, 0.4)
  }),
  jd = new Set([
    'Holographic Glass',
    'Holographic Metal',
    'Implosion Core',
    'Sci-Fi Hologram',
    'Digital Glitch',
    'Synthwave Neon'
  ]),
  Md = (e, t) => {
    let n = t.materialPreset ?? 'Default',
      r = new X(t.manualMaterialColor || t.modelColor || e);
    if (n === 'Custom Texture') return (r.set(16777215), r);
    if (t.manualMaterialColor) {
      r.set(t.manualMaterialColor);
    } else if (t.modelColor) {
      r.set(t.modelColor);
    } else {
      r.set('#38bdf8');
    }
    return r;
  },
  Nd =
    '\n    varying vec3 vNormal;\n    varying vec3 vPosition;\n    varying vec3 vLocalPosition;\n    void main() {\n        #ifdef USE_INSTANCING\n            vec4 tPos = instanceMatrix * vec4(position, 1.0);\n            vec3 tNormal = mat3(instanceMatrix) * normal;\n        #else\n            vec4 tPos = vec4(position, 1.0);\n            vec3 tNormal = normal;\n        #endif\n        vNormal = normalize(normalMatrix * tNormal);\n        vPosition = (modelViewMatrix * tPos).xyz;\n        vLocalPosition = tPos.xyz;\n        gl_Position = projectionMatrix * vec4(vPosition, 1.0);\n    }\n',
  Pd =
    '\n    uniform float time;\n    uniform vec3 baseColor;\n    varying vec3 vNormal;\n    varying vec3 vPosition;\n    varying vec3 vLocalPosition;\n    float hash(float n) { return fract(sin(n) * 1e4); }\n    float noise(vec3 x) {\n        vec3 step = vec3(110.0, 241.0, 171.0);\n        vec3 i = floor(x);\n        vec3 f = fract(x);\n        float n = dot(i, step);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        return mix(mix(mix(hash(n + dot(step, vec3(0.0, 0.0, 0.0))), hash(n + dot(step, vec3(1.0, 0.0, 0.0))), u.x),\n                       mix(hash(n + dot(step, vec3(0.0, 1.0, 0.0))), hash(n + dot(step, vec3(1.0, 1.0, 0.0))), u.x), u.y),\n                   mix(mix(hash(n + dot(step, vec3(0.0, 0.0, 1.0))), hash(n + dot(step, vec3(1.0, 0.0, 1.0))), u.x),\n                       mix(hash(n + dot(step, vec3(0.0, 1.0, 1.0))), hash(n + dot(step, vec3(1.0, 1.0, 1.0))), u.x), u.y), u.z);\n    }\n    void main() {\n        vec3 viewDir = normalize(-vPosition);\n        float fresnel = clamp(1.0 - dot(viewDir, vNormal), 0.0, 1.0);\n        float n1 = noise(vPosition * 0.1 + time * 1.5);\n        float n2 = noise(vPosition * 0.15 - time * 2.0);\n        float wave = sin(vPosition.y * 0.05 + time * 4.0) * 0.5 + 0.5;\n        float intensity = pow(fresnel, 2.5) * 4.0;\n        intensity += pow(n1 * n2, 1.5) * 8.0;\n        intensity *= wave;\n        vec3 glowColor = baseColor * intensity;\n        float core = pow(max(dot(viewDir, vNormal), 0.0), 6.0) * 2.5;\n        gl_FragColor = vec4(glowColor + vec3(core), 1.0);\n    }\n',
  Fd =
    '\n    varying vec3 vNormal;\n    varying vec3 vPos;\n    void main() {\n        #ifdef USE_INSTANCING\n            vec4 tPos = instanceMatrix * vec4(position, 1.0);\n        #else\n            vec4 tPos = vec4(position, 1.0);\n        #endif\n        #ifdef USE_INSTANCING\n            vec3 tNormal = mat3(instanceMatrix) * normal;\n        #else\n            vec3 tNormal = normal;\n        #endif\n        vNormal = normalize(normalMatrix * tNormal);\n        vPos = (modelViewMatrix * tPos).xyz;\n        gl_Position = projectionMatrix * vec4(vPos, 1.0);\n    }\n',
  Id =
    '\n    uniform float time;\n    uniform vec3 baseColor;\n    varying vec3 vNormal;\n    varying vec3 vPos;\n    void main() {\n        vec3 viewDir = normalize(-vPos);\n        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);\n        float gridX = smoothstep(0.42, 0.5, abs(fract(vPos.x * 0.15 + time * 0.3) - 0.5));\n        float gridY = smoothstep(0.42, 0.5, abs(fract(vPos.y * 0.15 - time * 0.2) - 0.5));\n        float grid = max(gridX, gridY);\n        vec3 neonPink = vec3(1.0, 0.1, 0.8);\n        vec3 neonCyan = vec3(0.0, 1.0, 0.9);\n        vec3 gridColor = mix(neonPink, neonCyan, sin(time * 0.5) * 0.5 + 0.5);\n        vec3 col = mix(baseColor * 0.15, gridColor * 1.5, grid);\n        col += fresnel * neonCyan * 0.8;\n        gl_FragColor = vec4(col, 1.0);\n    }\n',
  Ld =
    '\n    uniform float time;\n    varying vec3 vNormal;\n    varying vec3 vPos;\n    varying vec2 vUv;\n    float hash(float n) { return fract(sin(n) * 43758.5453); }\n    void main() {\n        #ifdef USE_INSTANCING\n            vec4 tPos = instanceMatrix * vec4(position, 1.0);\n        #else\n            vec4 tPos = vec4(position, 1.0);\n        #endif\n        #ifdef USE_INSTANCING\n            vec3 tNormal = mat3(instanceMatrix) * normal;\n        #else\n            vec3 tNormal = normal;\n        #endif\n        vNormal = normalize(normalMatrix * tNormal);\n        vec3 pos = tPos.xyz;\n        float trigger = step(0.92, fract(sin(floor(time * 4.0)) * 43758.5453));\n        pos.x += trigger * (hash(floor(time * 17.0) + tPos.y * 0.01) - 0.5) * 15.0;\n        vPos = (modelViewMatrix * vec4(pos, 1.0)).xyz;\n        vUv = vPos.xy;\n        gl_Position = projectionMatrix * vec4(vPos, 1.0);\n    }\n',
  Rd =
    '\n    uniform float time;\n    uniform vec3 baseColor;\n    varying vec3 vNormal;\n    varying vec3 vPos;\n    varying vec2 vUv;\n    float hash(float n) { return fract(sin(n) * 43758.5453); }\n    void main() {\n        vec3 viewDir = normalize(-vPos);\n        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 1.5);\n        float trigger = step(0.85, fract(sin(floor(time * 5.0)) * 43758.5453));\n        vec3 col = baseColor * (0.6 + fresnel * 0.8);\n        float scanline = sin(vUv.y * 3.0) * 0.15 + 0.85;\n        col *= scanline;\n        if(trigger > 0.0) {\n            float band = step(0.5, fract(vUv.y * 0.3 + hash(floor(time * 7.0)) * 10.0));\n            vec3 rgbShift = band > 0.0 ? vec3(1.0, 0.0, 0.3) : vec3(0.0, 0.3, 1.0);\n            col = mix(col, rgbShift * 1.5, 0.7);\n        }\n        gl_FragColor = vec4(col, 1.0);\n    }\n',
  zd =
    '\n    varying vec3 vPos;\n    varying vec3 vNormal;\n    void main() {\n        #ifdef USE_INSTANCING\n            vec4 tPos = instanceMatrix * vec4(position, 1.0);\n        #else\n            vec4 tPos = vec4(position, 1.0);\n        #endif\n        #ifdef USE_INSTANCING\n            vec3 tNormal = mat3(instanceMatrix) * normal;\n        #else\n            vec3 tNormal = normal;\n        #endif\n        vNormal = normalize(normalMatrix * tNormal);\n        vPos = (modelViewMatrix * tPos).xyz;\n        gl_Position = projectionMatrix * vec4(vPos, 1.0);\n    }\n',
  Bd =
    '\n    uniform float time;\n    varying vec3 vPos;\n    varying vec3 vNormal;\n    float hash(vec3 p) {\n        p = fract(p * vec3(443.897, 441.423, 437.195));\n        p += dot(p, p.yzx + 19.19);\n        return fract((p.x + p.y) * p.z);\n    }\n    void main() {\n        vec3 viewDir = normalize(-vPos);\n        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);\n        vec3 pos = vPos * 0.5;\n        vec3 col = vec3(0.02, 0.0, 0.05);\n        for(float i=0.0; i<80.0; i++){\n            vec3 starPos = vec3(\n                hash(vec3(i, i*1.3, i*1.7)),\n                hash(vec3(i*2.1, i, i*0.7)),\n                hash(vec3(i*0.3, i*2.3, i))\n            ) - 0.5;\n            starPos *= 120.0;\n            starPos.z += time * 2.0;\n            starPos = mod(starPos + 60.0, 120.0) - 60.0;\n            float d = length(pos - starPos);\n            float star = 0.08 / (d + 0.1);\n            star = pow(star, 1.5);\n            vec3 starCol = vec3(\n                0.5 + 0.5 * sin(i * 0.7),\n                0.5 + 0.5 * cos(i * 1.1),\n                0.8 + 0.2 * sin(i * 0.3)\n            );\n            col += star * starCol * 0.15;\n        }\n        col += fresnel * vec3(0.2, 0.1, 0.5);\n        float nebula = sin(vPos.x * 0.1 + time) * sin(vPos.y * 0.12 - time * 0.7) * 0.5 + 0.5;\n        col += nebula * vec3(0.15, 0.0, 0.2);\n        gl_FragColor = vec4(col, 1.0);\n    }\n',
  Vd =
    '\n    varying vec3 vNormal;\n    varying vec3 vPos;\n    void main() {\n        #ifdef USE_INSTANCING\n            vec4 tPos = instanceMatrix * vec4(position, 1.0);\n        #else\n            vec4 tPos = vec4(position, 1.0);\n        #endif\n        #ifdef USE_INSTANCING\n            vec3 tNormal = mat3(instanceMatrix) * normal;\n        #else\n            vec3 tNormal = normal;\n        #endif\n        vNormal = normalize(normalMatrix * tNormal);\n        vPos = (modelViewMatrix * tPos).xyz;\n        gl_Position = projectionMatrix * vec4(vPos, 1.0);\n    }\n',
  Hd =
    '\n    uniform float time;\n    uniform vec3 baseColor;\n    varying vec3 vNormal;\n    varying vec3 vPos;\n    void main() {\n        vec3 viewDir = normalize(-vPos);\n        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 1.5);\n        float scanline = sin(vPos.y * 2.0 - time * 5.0) * 0.5 + 0.5;\n        scanline = pow(scanline, 3.0);\n        float edge = fresnel * 2.0;\n        float fill = 0.15 + scanline * 0.4;\n        float brightness = fill + edge;\n        vec3 holoColor = baseColor * brightness;\n        holoColor += vec3(0.0, fresnel * 0.3, fresnel * 0.2);\n        float flicker = 0.95 + 0.05 * sin(time * 30.0);\n        gl_FragColor = vec4(holoColor * flicker, 1.0);\n    }\n',
  Ud = (e, t, n, { envMap: r, customTexture: i } = {}) => {
    let a = n.materialPreset ?? 'Default',
      o = Md(e, n),
      s = a === 'Holographic Glass',
      c = a === 'Matte Metal',
      l = a === 'Holographic Metal',
      u;
    if (a === 'Custom Texture' && i)
      u = new no({
        color: o,
        matcap: i,
        side: 2
      });
    else if (a === 'Implosion Core')
      u = new Ya({
        uniforms: {
          time: { value: 0 },
          baseColor: { value: o }
        },
        vertexShader: Nd,
        fragmentShader: Pd,
        transparent: !0,
        side: 2
      });
    else if (a === 'Liquid Gold')
      u = new Qa({
        color: 16766720,
        metalness: 1,
        roughness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0,
        envMap: r ?? null,
        envMapIntensity: 2.5,
        reflectivity: 1,
        side: 2
      });
    else if (a === 'Synthwave Neon')
      u = new Ya({
        uniforms: {
          time: { value: 0 },
          baseColor: { value: o.clone().multiplyScalar(1) }
        },
        vertexShader: Fd,
        fragmentShader: Id,
        side: 2
      });
    else if (a === 'Digital Glitch')
      u = new Ya({
        uniforms: {
          time: { value: 0 },
          baseColor: { value: o }
        },
        vertexShader: Ld,
        fragmentShader: Rd,
        side: 2
      });
    else if (a === 'Cosmic Void')
      u = new Ya({
        uniforms: { time: { value: 0 } },
        vertexShader: zd,
        fragmentShader: Bd,
        side: 2
      });
    else if (a === 'Sci-Fi Hologram')
      u = new Ya({
        uniforms: {
          time: { value: 0 },
          baseColor: { value: o }
        },
        vertexShader: Vd,
        fragmentShader: Hd,
        side: 2
      });
    else {
      let e = 300 + $(n.holoSpectrum, 0.5) * 700;
      u = new Qa({
        color: o,
        metalness: s ? 0.1 : c ? 0.9 : l || a === 'Custom Texture' ? 1 : $(n.metalness, 0.85),
        roughness: s ? 0.05 : c ? 0.5 : l || a === 'Custom Texture' ? 0.2 : $(n.roughness, 0.15),
        reflectivity: 1,
        clearcoat: s ? 1 : c ? 0 : l ? 1 : 0.5,
        clearcoatRoughness: 0.1,
        envMap: r ?? null,
        envMapIntensity: 1.5,
        side: 2,
        transmission: +!!s,
        thickness: s ? 2 : 0,
        ior: 1.5,
        iridescence: s ? 1 : 0,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400]
      });
    }
    return ((u.userData = { originalColor: new X(t || e) }), u);
  },
  Wd = (e) => {
    if (e.bgType === 'Transparent')
      return {
        background: null,
        clearAlpha: 0
      };
    if (e.bgType === 'Solid')
      return {
        background: new X(e.bgColor).convertLinearToSRGB(),
        clearAlpha: 1
      };
    let t = document.createElement('Canvas');
    ((t.width = 1024), (t.height = 1024));
    let n = t.getContext('2d');
    if (e.bgType === 'Radial') {
      let t = n.createRadialGradient(512, 512, 0, 512, 512, 724);
      (t.addColorStop(0, e.bgColor),
        t.addColorStop(1, e.bgColor2),
        (n.fillStyle = t),
        n.fillRect(0, 0, 1024, 1024));
    } else {
      let t = ($(e.bgGradientAngle, 45) - 90) * (Math.PI / 180),
        r = 512 - Math.cos(t) * 724,
        i = 512 - Math.sin(t) * 724,
        a = 512 + Math.cos(t) * 724,
        o = 512 + Math.sin(t) * 724,
        s = n.createLinearGradient(r, i, a, o),
        c = e.bgGradientColors?.length > 0 ? e.bgGradientColors : ['#111111', '#000000'];
      if (c.length === 1) (s.addColorStop(0, c[0]), s.addColorStop(1, c[0]));
      else {
        let e = 1 / (c.length - 1);
        c.forEach((t, n) => s.addColorStop(n * e, t));
      }
      ((n.fillStyle = s), n.fillRect(0, 0, 1024, 1024));
    }
    let r = new gi(t);
    return (
      (r.colorSpace = ''),
      (r.needsUpdate = !0),
      {
        background: r,
        clearAlpha: 1
      }
    );
  },
  Gd = (e) => {
    let t = e.syncLightsWithBg && e.bgGradientColors?.length > 0;
    return {
      keyColor: t ? e.bgGradientColors[0] || e.bgColor : e.keyLightColor,
      fillColor: t
        ? e.bgGradientColors[e.bgGradientColors.length - 1] || e.bgColor2
        : e.fillLightColor
    };
  },
  Kd = (e, t) => {
    if (e.length < 2) return null;
    let n = e[0].distanceTo(e[e.length - 1]) < 1e-4,
      r = n ? e.slice(0, -1) : e,
      i = r.length,
      a = [],
      o = [];
    for (let e = 0; e < i; e++) {
      let s = r[e === 0 ? (n ? i - 1 : 0) : e - 1],
        c = r[e],
        l = r[e === i - 1 ? (n ? 0 : i - 1) : e + 1];
      (e === 0 && !n && (s = new q().subVectors(c, new q().subVectors(l, c))),
        e === i - 1 && !n && (l = new q().addVectors(c, new q().subVectors(c, s))));
      let u = new q().subVectors(c, s).normalize(),
        d = new q().subVectors(l, c).normalize(),
        f = new q().addVectors(u, d).normalize();
      f.lengthSq() < 0.001 && (f = u.clone());
      let p = new q(-f.y, f.x),
        m = new q(-u.y, u.x),
        h = p.dot(m),
        g = 1 / Math.max(h, 0.1),
        _ = t * Math.min(g, 2.5);
      (a.push(new q(c.x + p.x * _, c.y + p.y * _)), o.push(new q(c.x - p.x * _, c.y - p.y * _)));
    }
    if (n) {
      (a.push(a[0].clone()), o.push(o[0].clone()));
      let e = new Qi(a);
      return (e.holes.push(new Zi(o.reverse())), e);
    }
    let s = new Qi(a);
    for (let e = o.length - 1; e >= 0; e--) s.lineTo(o[e].x, o[e].y);
    return (s.closePath(), s);
  },
  qd = (e, t, n) => {
    if (!e || e.length === 0) return null;
    let r = new Cn(),
      i = $(t.bevelScale, 1),
      a = $(t.layerSpacing, 1),
      o = 0,
      s = 0;
    if (
      (e.forEach((e) => {
        let c = e.userData.style,
          l = c.fill !== void 0 && c.fill !== 'none',
          u = c.stroke !== void 0 && c.stroke !== 'none',
          d = t.geometryMode === 'Hollow Skeleton (Wireframe)',
          f = t.geometryMode === 'Force Filled' || (t.geometryMode === 'Smart Auto' && l),
          p = t.geometryMode === 'Force Outline' || d || (t.geometryMode === 'Smart Auto' && u);
        if (
          (t.geometryMode === 'Smart Auto' && !l && !u && (f = !0), d && ((f = !1), (p = !0)), f)
        ) {
          let l = t.modelColor;
          t.colorSource === 'Original' && c.fill && c.fill !== 'none'
            ? (l = c.fill)
            : t.colorSource === 'Original' && e.color && (l = e.color);
          let u = n(l, l),
            d = [];
          try {
            d = gd.createShapes ? gd.createShapes(e) : e.toShapes(!0);
          } catch {
            d = e.toShapes(!0);
          }
          t.geometryMode === 'Force Filled' &&
            d.forEach((e) => {
              e.holes = [];
            });
          let f = $(t.depth, 40),
            p = 0;
          t.stackingStyle === 'Stacked'
            ? (p = o)
            : t.stackingStyle === 'Embossed'
              ? (f += s)
              : t.stackingStyle === 'Flush' && (p = o);
          let m = {
            depth: f,
            bevelEnabled: i > 0,
            bevelThickness: 4 * i,
            bevelSize: 3 * i,
            bevelSegments: 8
          };
          (d.forEach((e) => {
            try {
              let t = new Jr(new Ia(e, m), u);
              ((t.position.z = p), (t.castShadow = !0), (t.receiveShadow = !0), r.add(t));
            } catch {}
          }),
            t.stackingStyle === 'Stacked'
              ? (o += a)
              : t.stackingStyle === 'Embossed'
                ? (s += a)
                : t.stackingStyle === 'Flush' && (o += 0.05));
        }
        if (p) {
          let l = t.modelColor;
          t.colorSource === 'Original' &&
            (c.stroke && c.stroke !== 'none'
              ? (l = c.stroke)
              : d && c.fill && c.fill !== 'none'
                ? (l = c.fill)
                : e.color && (l = e.color));
          let u = n(l, l),
            f = $(t.outlineThickness, 2);
          if (!d && c.strokeWidth !== void 0) {
            let e = parseFloat(c.strokeWidth);
            !isNaN(e) && e > 0 && (f = e);
          }
          let p = $(t.depth, 40),
            m = 0;
          if (
            (t.stackingStyle === 'Stacked'
              ? (m = o)
              : t.stackingStyle === 'Embossed'
                ? (p += s)
                : t.stackingStyle === 'Flush' && (m = o),
            d)
          ) {
            let n = [];
            if (
              (e.subPaths.forEach((e) => {
                let t = e.getPoints(12);
                t.length > 1 && n.push(t);
              }),
              n.length > 0)
            ) {
              let e = 0,
                i = 0;
              n.forEach((t) => {
                ((e += t.length), (i += t.length - 1));
              });
              let a = new xi(1, 1, 1, 8, 1, !1),
                o = new Ba(1, 8, 8),
                s = new oi(a, u, i),
                c = new oi(o, u, e);
              ((s.castShadow = !0),
                (s.receiveShadow = !0),
                (c.castShadow = !0),
                (c.receiveShadow = !0));
              let l = new Sn(),
                d = new J(0, 1, 0),
                h = 0,
                g = 0,
                _ = (f / 2) * (1 + $(t.bevelScale, 1) * 0.2),
                v = Math.max(_, p / 2),
                y = m + p / 2;
              (n.forEach((e) => {
                for (let t = 0; t < e.length; t++) {
                  let n = e[t];
                  if (
                    (l.position.set(n.x, n.y, y),
                    l.scale.set(_, _, v),
                    l.quaternion.identity(),
                    l.updateMatrix(),
                    c.setMatrixAt(g++, l.matrix),
                    t < e.length - 1)
                  ) {
                    let r = e[t + 1],
                      i = n.distanceTo(r),
                      a = new J(r.x - n.x, r.y - n.y, 0).normalize(),
                      o = new J((n.x + r.x) / 2, (n.y + r.y) / 2, y);
                    (l.position.copy(o),
                      l.quaternion.setFromUnitVectors(d, a),
                      l.scale.set(_, i, v),
                      l.updateMatrix(),
                      s.setMatrixAt(h++, l.matrix));
                  }
                }
              }),
                (s.instanceMatrix.needsUpdate = !0),
                (c.instanceMatrix.needsUpdate = !0),
                r.add(s),
                r.add(c));
            }
          } else {
            let t = {
              depth: p,
              bevelEnabled: i > 0,
              bevelThickness: 4 * i,
              bevelSize: 3 * i,
              bevelSegments: 8
            };
            e.subPaths.forEach((e) => {
              let n = Kd(e.getPoints(12), f / 2);
              if (n)
                try {
                  let e = new Jr(new Ia(n, t), u);
                  ((e.position.z = m), (e.castShadow = !0), (e.receiveShadow = !0), r.add(e));
                } catch {}
            });
          }
          t.stackingStyle === 'Stacked'
            ? (o += a)
            : t.stackingStyle === 'Embossed'
              ? (s += a)
              : t.stackingStyle === 'Flush' && (o += 0.05);
        }
      }),
      r.children.length === 0)
    )
      return null;
    let c = new Kn().setFromObject(r),
      l = new J();
    (c.getCenter(l), r.position.sub(l));
    let u = new Cn();
    u.add(r);
    let d = new Kn().setFromObject(u),
      f = new J();
    d.getSize(f);
    let p = 100 / (Math.max(f.x, f.y, f.z) || 1);
    return (u.scale.set(p, -p, p), u);
  },
  Jd = (e) => {
    if (!e || typeof e != 'string') return [];
    try {
      return new gd().parse(e).paths ?? [];
    } catch {
      return [];
    }
  },
  Yd =
    '\n    :host {\n        display: block;\n        width: 100%;\n        height: 100%;\n        overflow: visible;\n    }\n\n    canvas {\n        display: block;\n        width: 100%;\n        height: 100%;\n        overflow: visible;\n    }\n\n    .stage {\n        width: 100%;\n        height: 100%;\n        overflow: visible;\n    }\n\n    .status {\n        display: grid;\n        place-items: center;\n        width: 100%;\n        height: 100%;\n        color: rgba(255, 255, 255, 0.75);\n        font: 12px/1.4 ui-sans-serif, system-ui, sans-serif;\n        text-align: center;\n    }\n',
  Xd = {
    auto: 'autoRotate',
    look: 'cursorFollow',
    360: 'cursorOrbit',
    orbit: 'cursorOrbit',
    cursorOrbit: 'cursorOrbit',
    cursorFollow: 'cursorFollow',
    autoRotate: 'autoRotate'
  },
  Zd = (e) => {
    if (!e) return null;
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  },
  Qd = (e, t) => {
    let n = Xd[t];
    return n
      ? {
          ...e,
          motion: {
            ...e.motion,
            mode: n
          }
        }
      : e;
  },
  $d = (e) => {
    let t = e.motion ?? {};
    return {
      mode: t.mode ?? _d.interactionMode,
      autoRotate: { speed: $(t.autoRotate?.speed, _d.autoRotateSpeed) },
      float: {
        amplitude: $(t.float?.amplitude, _d.floatAmplitude),
        speed: $(t.float?.speed, _d.floatSpeed)
      },
      cursor: {
        maxYawDeg: $(t.cursor?.maxYawDeg, _d.cursorMaxYaw),
        maxPitchDeg: $(t.cursor?.maxPitchDeg, _d.cursorMaxPitch),
        response: $(t.cursor?.response, _d.cursorResponse),
        returnResponse: $(t.cursor?.returnResponse, _d.cursorReturnResponse),
        orbitSpeed: $(t.cursor?.orbitSpeed, _d.cursorOrbitSpeed),
        target: t.cursor?.target ?? _d.cursorTarget
      },
      rewind: {
        enabled: t.rewind?.enabled ?? _d.enableRewind,
        idleTime: $(t.rewind?.idleTime, _d.rewindIdleTime),
        speed: $(t.rewind?.speed, _d.rewindSpeed)
      }
    };
  },
  ef = (e, t, n, { background: r } = {}) => {
    let i = $d(n),
      a = Ad(n),
      o = new ju({
        alpha: !0,
        antialias: !0,
        powerPreference: 'high-performance'
      });
    (o.setPixelRatio(Math.min(window.devicePixelRatio, 2)),
      o.setSize(t.clientWidth, t.clientHeight),
      (o.shadowMap.enabled = !0),
      (o.shadowMap.type = 2),
      (o.outputColorSpace = Pe),
      (o.toneMapping = 4),
      (o.toneMappingExposure = 1.2),
      o.setClearColor(0, 0),
      t.replaceChildren(o.domElement));
    let s = new jn();
    (r ??
      (n.render?.transparentBackground || n.environment?.bgType === 'Transparent'
        ? 'transparent'
        : 'scene')) === 'transparent' && (a.bgType = 'Transparent');
    let { background: c, clearAlpha: l } = Wd(a);
    (c !== null && (s.background = c), o.setClearColor(0, l));
    let u = new Lo(45, t.clientWidth / t.clientHeight, 0.1, 5e3);
    n.camera?.position ? u.position.fromArray(n.camera.position) : u.position.set(0, 0, 300);
    let d = new Rs(o),
      f = new td(),
      p = d.fromScene(f).texture;
    s.environment = p;
    let { keyColor: m, fillColor: h } = Gd(a),
      g = new Uo(16777215, $(a.ambientIntensity, 0.5)),
      _ = new Ho(m, $(a.keyLightIntensity, 1));
    if (a.lightDirection?.z !== void 0) {
      let { x: e, y: t, z: n } = a.lightDirection;
      _.position.set(e * 250, t * 250, n * 250);
    } else _.position.set(100, 200, 150);
    ((_.castShadow = !0),
      (_.shadow.mapSize.width = 2048),
      (_.shadow.mapSize.height = 2048),
      (_.shadow.camera.near = 0.5),
      (_.shadow.camera.far = 1e3),
      (_.shadow.camera.left = -200),
      (_.shadow.camera.right = 200),
      (_.shadow.camera.top = 200),
      (_.shadow.camera.bottom = -200),
      (_.shadow.bias = -5e-4));
    let v = new Ho(h, $(a.fillLightIntensity, 0.8));
    v.position.set(-100, 50, -100);
    let y = new zo(a.rimColor, 1.5, 800, 2);
    y.position.set(200, -100, 100);
    let b = new zo(a.rimColor, 1.2, 800, 2);
    (b.position.set(-200, 100, -100), s.add(g, _, v, y, b));
    let x = new Cn(),
      S = a.customTextureData
        ? (() => {
            let e = new Ht(),
              t = new Image();
            return (
              (t.onload = () => {
                ((e.image = t), (e.colorSpace = Pe), (e.needsUpdate = !0));
              }),
              (t.src = a.customTextureData),
              e
            );
          })()
        : null,
      C = qd(Jd(a.svgInput), a, (e, t) =>
        Ud(e, t, a, {
          envMap: p,
          customTexture: S
        })
      );
    (C && x.add(C), s.add(x));
    let w = null;
    if (a.bgType !== 'Transparent') {
      w = new dd(o);
      let T = new fd(s, u);
      ((T.clearColor = new X(0, 0, 0)),
        (T.clearAlpha = 0),
        w.addPass(T),
        w.addPass(new md(new q(t.clientWidth, t.clientHeight), $(a.bloomStrength, 0.4), 0.5, 0.2)));
      let E = new cd(rd);
      ((E.material.transparent = !0), (E.material.blending = 0), w.addPass(E));
    }
    let D = new Hu(u, o.domElement);
    ((D.enableDamping = !0),
      (D.dampingFactor = 0.05),
      (D.minDistance = 50),
      (D.maxDistance = 1e3),
      (D.enablePan = !1),
      (D.enableZoom = !1),
      n.camera?.target && (D.target.fromArray(n.camera.target), D.update()));
    let O = !1;
    (D.addEventListener('start', () => {
      O = !0;
    }),
      D.addEventListener('end', () => {
        O = !1;
      }));
    let k = {
        active: !1,
        target: {
          x: 0,
          y: 0
        }
      },
      A = {
        yaw: x.rotation.y,
        pitch: x.rotation.x
      },
      j = () =>
        i.cursor.target === 'viewport'
          ? {
              left: 0,
              top: 0,
              width: window.innerWidth,
              height: window.innerHeight
            }
          : t.getBoundingClientRect(),
      M = (e) => {
        let t = j(),
          n = i.cursor.target === 'viewport' || Td(e.clientX, e.clientY, t);
        ((k.active = n),
          (k.target = n
            ? wd(e.clientX, e.clientY, t)
            : {
                x: 0,
                y: 0
              }));
      },
      N = () => {
        i.cursor.target === 'element' &&
          ((k.active = !1),
          (k.target = {
            x: 0,
            y: 0
          }));
      };
    (window.addEventListener('pointermove', M, { passive: !0 }),
      e.addEventListener('pointerleave', N));
    let P = () => {
        let t = Math.max(1, e.clientWidth),
          n = Math.max(1, e.clientHeight);
        ((u.aspect = t / n),
          u.updateProjectionMatrix(),
          o.setPixelRatio(Math.min(window.devicePixelRatio, 2)),
          o.setSize(t, n),
          w?.setSize(t, n));
      },
      F = new ResizeObserver(P);
    F.observe(e);
    let I = new cs(),
      ee = 0,
      te = new kd();
    te.setInitialState(u.position, u.quaternion);
    let ne = () => {
      ee = requestAnimationFrame(ne);
      let e = Math.min(I.getDelta(), 0.1),
        t = I.elapsedTime,
        n = k.active
          ? k.target
          : {
              x: 0,
              y: 0
            },
        r = Ed(n, i.cursor.maxYawDeg, i.cursor.maxPitchDeg),
        a = k.active ? i.cursor.response : i.cursor.returnResponse;
      if (
        ((x.position.y = Math.sin(t * i.float.speed) * i.float.amplitude),
        i.mode === 'cursorFollow' && !O)
      )
        ((A.yaw = x.rotation.y),
          (A.pitch = x.rotation.x),
          (x.rotation.x = Cd(bd(x.rotation.x), r.pitch, a, e)),
          (x.rotation.y = Cd(bd(x.rotation.y), r.yaw, a, e)));
      else if (i.mode === 'cursorOrbit' && !O) {
        let t = Od(A, Dd(n, i.cursor.orbitSpeed), e);
        ((A.yaw = t.yaw),
          (A.pitch = t.pitch),
          (x.rotation.x = Cd(x.rotation.x, A.pitch + r.pitch, a, e)),
          (x.rotation.y = Cd(x.rotation.y, A.yaw + r.yaw, a, e)));
      } else
        (i.mode === 'cursorOrbit'
          ? ((A.yaw = x.rotation.y), (A.pitch = x.rotation.x))
          : (x.rotation.x = Cd(bd(x.rotation.x), 0, i.cursor.returnResponse, e)),
          i.mode === 'autoRotate' && !O
            ? (x.rotation.y += i.autoRotate.speed * e)
            : i.mode === 'cursorFollow' &&
              (x.rotation.y = Cd(bd(x.rotation.y), 0, i.cursor.returnResponse, e)));
      x.traverse((e) => {
        e.isMesh && e.material?.uniforms?.time && (e.material.uniforms.time.value = t);
      });
      let c = te.update(O, u, e, {
        enableRewind: i.rewind.enabled,
        rewindIdleTime: i.rewind.idleTime,
        rewindSpeed: i.rewind.speed
      });
      ((D.enabled = !c), c || D.update(), w ? w.render() : o.render(s, u));
    };
    return (
      P(),
      ne(),
      () => {
        (cancelAnimationFrame(ee),
          window.removeEventListener('pointermove', M),
          e.removeEventListener('pointerleave', N),
          F.disconnect(),
          D.dispose(),
          w?.dispose?.(),
          o.dispose(),
          d.dispose(),
          f.dispose(),
          t.replaceChildren());
      }
    );
  };
const __PLASMA_CACHE = new Map();
const tf = class extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'config', 'motion', 'background'];
  }
  constructor() {
    (super(),
      this.attachShadow({ mode: 'open' }),
      (this.shadowRoot.innerHTML = `<style>${Yd}</style><div class="stage"></div>`),
      (this.stage = this.shadowRoot.querySelector('.stage')),
      (this.cleanup = null),
      (this.loadToken = 0));
  }
  connectedCallback() {
    this.load();
  }
  disconnectedCallback() {
    this.destroy();
  }
  attributeChangedCallback() {
    this.isConnected && this.load();
  }
  destroy() {
    ((this.cleanup &&= (this.cleanup(), null)), this.stage.replaceChildren());
  }
  async load() {
    let e = ++this.loadToken;
    this.destroy();
    try {
      let t = Zd(this.getAttribute('config')),
        n = this.getAttribute('src');
      if (!t && !n) throw Error('Add a src or config attribute.');
      let r =
        t ??
        (__PLASMA_CACHE.has(n)
          ? __PLASMA_CACHE.get(n)
          : await fetch(n).then((e) => {
              if (!e.ok) throw Error(`Failed to load scene: ${e.status}`);
              return e.json();
            }));
      if (n && r) __PLASMA_CACHE.set(n, r);
      if (e !== this.loadToken) return;
      let i = Qd(r, this.getAttribute('motion'));
      this.cleanup = ef(this, this.stage, i, { background: this.getAttribute('background') });
      this.dataset.ready = 'true';
      this.dispatchEvent(new CustomEvent('plasma-ready', { bubbles: true, composed: true }));
    } catch (t) {
      if (e !== this.loadToken) return;
    }
  }
};
customElements.get('plasma-scene') || customElements.define('plasma-scene', tf);
//#endregion
export { tf as PlasmaSceneElement };
