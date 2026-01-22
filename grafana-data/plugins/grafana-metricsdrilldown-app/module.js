/* [create-plugin] version: 5.26.9 */
/* [create-plugin] plugin: grafana-metricsdrilldown-app@1.0.28 */
define([
  "i18next",
  "react-router",
  "rxjs",
  "module",
  "@grafana/ui",
  "lodash",
  "react",
  "@emotion/css",
  "@grafana/data",
  "react-dom",
  "@grafana/runtime",
], (e, t, i, r, n, s, o, a, l, u, c) =>
  (() => {
    var h,
      d,
      f,
      p,
      m = {
        144: (e, t, i) => {
          "use strict";
          const r = i(5380);
          e.exports = (e, t, i) => r(e, t, i) > 0;
        },
        211: (t) => {
          "use strict";
          t.exports = e;
        },
        599: (e, t, i) => {
          "use strict";
          const r = i(5380);
          e.exports = (e, t, i) => r(e, t, i) < 0;
        },
        603: (e, t, i) => {
          "use strict";
          const r = i(2801);
          e.exports = (e, t) => e.sort((e, i) => r(e, i, t));
        },
        651: (e, t, i) => {
          "use strict";
          const r = i(8395);
          e.exports = (e, t) =>
            new r(e, t).set.map((e) =>
              e
                .map((e) => e.value)
                .join(" ")
                .trim()
                .split(" "),
            );
        },
        660: (e, t, i) => {
          "use strict";
          const r = i(5860);
          e.exports = (e, t) => {
            const i = r(e, null, !0),
              n = r(t, null, !0),
              s = i.compare(n);
            if (0 === s) return null;
            const o = s > 0,
              a = o ? i : n,
              l = o ? n : i,
              u = !!a.prerelease.length;
            if (!!l.prerelease.length && !u) {
              if (!l.patch && !l.minor) return "major";
              if (0 === l.compareMain(a)) return l.minor && !l.patch ? "minor" : "patch";
            }
            const c = u ? "pre" : "";
            return i.major !== n.major
              ? c + "major"
              : i.minor !== n.minor
                ? c + "minor"
                : i.patch !== n.patch
                  ? c + "patch"
                  : "prerelease";
          };
        },
        782: (e, t, i) => {
          "use strict";
          i.d(t, { U1: () => S });
          var r = i(7203);
          class n {
            constructor(e, t, i, r, n, s, o, a, l, u = 0, c) {
              ((this.p = e),
                (this.stack = t),
                (this.state = i),
                (this.reducePos = r),
                (this.pos = n),
                (this.score = s),
                (this.buffer = o),
                (this.bufferBase = a),
                (this.curContext = l),
                (this.lookAhead = u),
                (this.parent = c));
            }
            toString() {
              return `[${this.stack.filter((e, t) => t % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
            }
            static start(e, t, i = 0) {
              let r = e.parser.context;
              return new n(e, [], t, i, i, 0, [], 0, r ? new s(r, r.start) : null, 0, null);
            }
            get context() {
              return this.curContext ? this.curContext.context : null;
            }
            pushState(e, t) {
              (this.stack.push(this.state, t, this.bufferBase + this.buffer.length),
                (this.state = e));
            }
            reduce(e) {
              var t;
              let i = e >> 19,
                r = 65535 & e,
                { parser: n } = this.p,
                s = this.reducePos < this.pos - 25;
              s && this.setLookAhead(this.pos);
              let o = n.dynamicPrecedence(r);
              if ((o && (this.score += o), 0 == i))
                return (
                  this.pushState(n.getGoto(this.state, r, !0), this.reducePos),
                  r < n.minRepeatTerm &&
                    this.storeNode(r, this.reducePos, this.reducePos, s ? 8 : 4, !0),
                  void this.reduceContext(r, this.reducePos)
                );
              let a = this.stack.length - 3 * (i - 1) - (262144 & e ? 6 : 0),
                l = a ? this.stack[a - 2] : this.p.ranges[0].from,
                u = this.reducePos - l;
              u >= 2e3 &&
                !(null === (t = this.p.parser.nodeSet.types[r]) || void 0 === t
                  ? void 0
                  : t.isAnonymous) &&
                (l == this.p.lastBigReductionStart
                  ? (this.p.bigReductionCount++, (this.p.lastBigReductionSize = u))
                  : this.p.lastBigReductionSize < u &&
                    ((this.p.bigReductionCount = 1),
                    (this.p.lastBigReductionStart = l),
                    (this.p.lastBigReductionSize = u)));
              let c = a ? this.stack[a - 1] : 0,
                h = this.bufferBase + this.buffer.length - c;
              if (r < n.minRepeatTerm || 131072 & e) {
                let e = n.stateFlag(this.state, 1) ? this.pos : this.reducePos;
                this.storeNode(r, l, e, h + 4, !0);
              }
              if (262144 & e) this.state = this.stack[a];
              else {
                let e = this.stack[a - 3];
                this.state = n.getGoto(e, r, !0);
              }
              for (; this.stack.length > a; ) this.stack.pop();
              this.reduceContext(r, l);
            }
            storeNode(e, t, i, r = 4, n = !1) {
              if (
                0 == e &&
                (!this.stack.length ||
                  this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)
              ) {
                let e = this,
                  r = this.buffer.length;
                if (
                  (0 == r && e.parent && ((r = e.bufferBase - e.parent.bufferBase), (e = e.parent)),
                  r > 0 && 0 == e.buffer[r - 4] && e.buffer[r - 1] > -1)
                ) {
                  if (t == i) return;
                  if (e.buffer[r - 2] >= t) return void (e.buffer[r - 2] = i);
                }
              }
              if (n && this.pos != i) {
                let n = this.buffer.length;
                if (n > 0 && 0 != this.buffer[n - 4]) {
                  let e = !1;
                  for (let t = n; t > 0 && this.buffer[t - 2] > i; t -= 4)
                    if (this.buffer[t - 1] >= 0) {
                      e = !0;
                      break;
                    }
                  if (e)
                    for (; n > 0 && this.buffer[n - 2] > i; )
                      ((this.buffer[n] = this.buffer[n - 4]),
                        (this.buffer[n + 1] = this.buffer[n - 3]),
                        (this.buffer[n + 2] = this.buffer[n - 2]),
                        (this.buffer[n + 3] = this.buffer[n - 1]),
                        (n -= 4),
                        r > 4 && (r -= 4));
                }
                ((this.buffer[n] = e),
                  (this.buffer[n + 1] = t),
                  (this.buffer[n + 2] = i),
                  (this.buffer[n + 3] = r));
              } else this.buffer.push(e, t, i, r);
            }
            shift(e, t, i, r) {
              if (131072 & e) this.pushState(65535 & e, this.pos);
              else if (262144 & e)
                ((this.pos = r),
                  this.shiftContext(t, i),
                  t <= this.p.parser.maxNode && this.buffer.push(t, i, r, 4));
              else {
                let n = e,
                  { parser: s } = this.p;
                ((r > this.pos || t <= s.maxNode) &&
                  ((this.pos = r), s.stateFlag(n, 1) || (this.reducePos = r)),
                  this.pushState(n, i),
                  this.shiftContext(t, i),
                  t <= s.maxNode && this.buffer.push(t, i, r, 4));
              }
            }
            apply(e, t, i, r) {
              65536 & e ? this.reduce(e) : this.shift(e, t, i, r);
            }
            useNode(e, t) {
              let i = this.p.reused.length - 1;
              (i < 0 || this.p.reused[i] != e) && (this.p.reused.push(e), i++);
              let r = this.pos;
              ((this.reducePos = this.pos = r + e.length),
                this.pushState(t, r),
                this.buffer.push(i, r, this.reducePos, -1),
                this.curContext &&
                  this.updateContext(
                    this.curContext.tracker.reuse(
                      this.curContext.context,
                      e,
                      this,
                      this.p.stream.reset(this.pos - e.length),
                    ),
                  ));
            }
            split() {
              let e = this,
                t = e.buffer.length;
              for (; t > 0 && e.buffer[t - 2] > e.reducePos; ) t -= 4;
              let i = e.buffer.slice(t),
                r = e.bufferBase + t;
              for (; e && r == e.bufferBase; ) e = e.parent;
              return new n(
                this.p,
                this.stack.slice(),
                this.state,
                this.reducePos,
                this.pos,
                this.score,
                i,
                r,
                this.curContext,
                this.lookAhead,
                e,
              );
            }
            recoverByDelete(e, t) {
              let i = e <= this.p.parser.maxNode;
              (i && this.storeNode(e, this.pos, t, 4),
                this.storeNode(0, this.pos, t, i ? 8 : 4),
                (this.pos = this.reducePos = t),
                (this.score -= 190));
            }
            canShift(e) {
              for (let t = new o(this); ; ) {
                let i = this.p.parser.stateSlot(t.state, 4) || this.p.parser.hasAction(t.state, e);
                if (0 == i) return !1;
                if (!(65536 & i)) return !0;
                t.reduce(i);
              }
            }
            recoverByInsert(e) {
              if (this.stack.length >= 300) return [];
              let t = this.p.parser.nextStates(this.state);
              if (t.length > 8 || this.stack.length >= 120) {
                let i = [];
                for (let r, n = 0; n < t.length; n += 2)
                  (r = t[n + 1]) != this.state && this.p.parser.hasAction(r, e) && i.push(t[n], r);
                if (this.stack.length < 120)
                  for (let e = 0; i.length < 8 && e < t.length; e += 2) {
                    let r = t[e + 1];
                    i.some((e, t) => 1 & t && e == r) || i.push(t[e], r);
                  }
                t = i;
              }
              let i = [];
              for (let e = 0; e < t.length && i.length < 4; e += 2) {
                let r = t[e + 1];
                if (r == this.state) continue;
                let n = this.split();
                (n.pushState(r, this.pos),
                  n.storeNode(0, n.pos, n.pos, 4, !0),
                  n.shiftContext(t[e], this.pos),
                  (n.reducePos = this.pos),
                  (n.score -= 200),
                  i.push(n));
              }
              return i;
            }
            forceReduce() {
              let { parser: e } = this.p,
                t = e.stateSlot(this.state, 5);
              if (!(65536 & t)) return !1;
              if (!e.validAction(this.state, t)) {
                let i = t >> 19,
                  r = 65535 & t,
                  n = this.stack.length - 3 * i;
                if (n < 0 || e.getGoto(this.stack[n], r, !1) < 0) {
                  let e = this.findForcedReduction();
                  if (null == e) return !1;
                  t = e;
                }
                (this.storeNode(0, this.pos, this.pos, 4, !0), (this.score -= 100));
              }
              return ((this.reducePos = this.pos), this.reduce(t), !0);
            }
            findForcedReduction() {
              let { parser: e } = this.p,
                t = [],
                i = (r, n) => {
                  if (!t.includes(r))
                    return (
                      t.push(r),
                      e.allActions(r, (t) => {
                        if (393216 & t);
                        else if (65536 & t) {
                          let i = (t >> 19) - n;
                          if (i > 1) {
                            let r = 65535 & t,
                              n = this.stack.length - 3 * i;
                            if (n >= 0 && e.getGoto(this.stack[n], r, !1) >= 0)
                              return (i << 19) | 65536 | r;
                          }
                        } else {
                          let e = i(t, n + 1);
                          if (null != e) return e;
                        }
                      })
                    );
                };
              return i(this.state, 0);
            }
            forceAll() {
              for (; !this.p.parser.stateFlag(this.state, 2); )
                if (!this.forceReduce()) {
                  this.storeNode(0, this.pos, this.pos, 4, !0);
                  break;
                }
              return this;
            }
            get deadEnd() {
              if (3 != this.stack.length) return !1;
              let { parser: e } = this.p;
              return 65535 == e.data[e.stateSlot(this.state, 1)] && !e.stateSlot(this.state, 4);
            }
            restart() {
              (this.storeNode(0, this.pos, this.pos, 4, !0),
                (this.state = this.stack[0]),
                (this.stack.length = 0));
            }
            sameState(e) {
              if (this.state != e.state || this.stack.length != e.stack.length) return !1;
              for (let t = 0; t < this.stack.length; t += 3)
                if (this.stack[t] != e.stack[t]) return !1;
              return !0;
            }
            get parser() {
              return this.p.parser;
            }
            dialectEnabled(e) {
              return this.p.parser.dialect.flags[e];
            }
            shiftContext(e, t) {
              this.curContext &&
                this.updateContext(
                  this.curContext.tracker.shift(
                    this.curContext.context,
                    e,
                    this,
                    this.p.stream.reset(t),
                  ),
                );
            }
            reduceContext(e, t) {
              this.curContext &&
                this.updateContext(
                  this.curContext.tracker.reduce(
                    this.curContext.context,
                    e,
                    this,
                    this.p.stream.reset(t),
                  ),
                );
            }
            emitContext() {
              let e = this.buffer.length - 1;
              (e < 0 || -3 != this.buffer[e]) &&
                this.buffer.push(this.curContext.hash, this.pos, this.pos, -3);
            }
            emitLookAhead() {
              let e = this.buffer.length - 1;
              (e < 0 || -4 != this.buffer[e]) &&
                this.buffer.push(this.lookAhead, this.pos, this.pos, -4);
            }
            updateContext(e) {
              if (e != this.curContext.context) {
                let t = new s(this.curContext.tracker, e);
                (t.hash != this.curContext.hash && this.emitContext(), (this.curContext = t));
              }
            }
            setLookAhead(e) {
              e > this.lookAhead && (this.emitLookAhead(), (this.lookAhead = e));
            }
            close() {
              (this.curContext && this.curContext.tracker.strict && this.emitContext(),
                this.lookAhead > 0 && this.emitLookAhead());
            }
          }
          class s {
            constructor(e, t) {
              ((this.tracker = e), (this.context = t), (this.hash = e.strict ? e.hash(t) : 0));
            }
          }
          class o {
            constructor(e) {
              ((this.start = e),
                (this.state = e.state),
                (this.stack = e.stack),
                (this.base = this.stack.length));
            }
            reduce(e) {
              let t = 65535 & e,
                i = e >> 19;
              0 == i
                ? (this.stack == this.start.stack && (this.stack = this.stack.slice()),
                  this.stack.push(this.state, 0, 0),
                  (this.base += 3))
                : (this.base -= 3 * (i - 1));
              let r = this.start.p.parser.getGoto(this.stack[this.base - 3], t, !0);
              this.state = r;
            }
          }
          class a {
            constructor(e, t, i) {
              ((this.stack = e),
                (this.pos = t),
                (this.index = i),
                (this.buffer = e.buffer),
                0 == this.index && this.maybeNext());
            }
            static create(e, t = e.bufferBase + e.buffer.length) {
              return new a(e, t, t - e.bufferBase);
            }
            maybeNext() {
              let e = this.stack.parent;
              null != e &&
                ((this.index = this.stack.bufferBase - e.bufferBase),
                (this.stack = e),
                (this.buffer = e.buffer));
            }
            get id() {
              return this.buffer[this.index - 4];
            }
            get start() {
              return this.buffer[this.index - 3];
            }
            get end() {
              return this.buffer[this.index - 2];
            }
            get size() {
              return this.buffer[this.index - 1];
            }
            next() {
              ((this.index -= 4), (this.pos -= 4), 0 == this.index && this.maybeNext());
            }
            fork() {
              return new a(this.stack, this.pos, this.index);
            }
          }
          function l(e, t = Uint16Array) {
            if ("string" != typeof e) return e;
            let i = null;
            for (let r = 0, n = 0; r < e.length; ) {
              let s = 0;
              for (;;) {
                let t = e.charCodeAt(r++),
                  i = !1;
                if (126 == t) {
                  s = 65535;
                  break;
                }
                (t >= 92 && t--, t >= 34 && t--);
                let n = t - 32;
                if ((n >= 46 && ((n -= 46), (i = !0)), (s += n), i)) break;
                s *= 46;
              }
              i ? (i[n++] = s) : (i = new t(s));
            }
            return i;
          }
          class u {
            constructor() {
              ((this.start = -1),
                (this.value = -1),
                (this.end = -1),
                (this.extended = -1),
                (this.lookAhead = 0),
                (this.mask = 0),
                (this.context = 0));
            }
          }
          const c = new u();
          class h {
            constructor(e, t) {
              ((this.input = e),
                (this.ranges = t),
                (this.chunk = ""),
                (this.chunkOff = 0),
                (this.chunk2 = ""),
                (this.chunk2Pos = 0),
                (this.next = -1),
                (this.token = c),
                (this.rangeIndex = 0),
                (this.pos = this.chunkPos = t[0].from),
                (this.range = t[0]),
                (this.end = t[t.length - 1].to),
                this.readNext());
            }
            resolveOffset(e, t) {
              let i = this.range,
                r = this.rangeIndex,
                n = this.pos + e;
              for (; n < i.from; ) {
                if (!r) return null;
                let e = this.ranges[--r];
                ((n -= i.from - e.to), (i = e));
              }
              for (; t < 0 ? n > i.to : n >= i.to; ) {
                if (r == this.ranges.length - 1) return null;
                let e = this.ranges[++r];
                ((n += e.from - i.to), (i = e));
              }
              return n;
            }
            clipPos(e) {
              if (e >= this.range.from && e < this.range.to) return e;
              for (let t of this.ranges) if (t.to > e) return Math.max(e, t.from);
              return this.end;
            }
            peek(e) {
              let t,
                i,
                r = this.chunkOff + e;
              if (r >= 0 && r < this.chunk.length)
                ((t = this.pos + e), (i = this.chunk.charCodeAt(r)));
              else {
                let r = this.resolveOffset(e, 1);
                if (null == r) return -1;
                if (((t = r), t >= this.chunk2Pos && t < this.chunk2Pos + this.chunk2.length))
                  i = this.chunk2.charCodeAt(t - this.chunk2Pos);
                else {
                  let e = this.rangeIndex,
                    r = this.range;
                  for (; r.to <= t; ) r = this.ranges[++e];
                  ((this.chunk2 = this.input.chunk((this.chunk2Pos = t))),
                    t + this.chunk2.length > r.to && (this.chunk2 = this.chunk2.slice(0, r.to - t)),
                    (i = this.chunk2.charCodeAt(0)));
                }
              }
              return (t >= this.token.lookAhead && (this.token.lookAhead = t + 1), i);
            }
            acceptToken(e, t = 0) {
              let i = t ? this.resolveOffset(t, -1) : this.pos;
              if (null == i || i < this.token.start)
                throw new RangeError("Token end out of bounds");
              ((this.token.value = e), (this.token.end = i));
            }
            acceptTokenTo(e, t) {
              ((this.token.value = e), (this.token.end = t));
            }
            getChunk() {
              if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
                let { chunk: e, chunkPos: t } = this;
                ((this.chunk = this.chunk2),
                  (this.chunkPos = this.chunk2Pos),
                  (this.chunk2 = e),
                  (this.chunk2Pos = t),
                  (this.chunkOff = this.pos - this.chunkPos));
              } else {
                ((this.chunk2 = this.chunk), (this.chunk2Pos = this.chunkPos));
                let e = this.input.chunk(this.pos),
                  t = this.pos + e.length;
                ((this.chunk = t > this.range.to ? e.slice(0, this.range.to - this.pos) : e),
                  (this.chunkPos = this.pos),
                  (this.chunkOff = 0));
              }
            }
            readNext() {
              return this.chunkOff >= this.chunk.length &&
                (this.getChunk(), this.chunkOff == this.chunk.length)
                ? (this.next = -1)
                : (this.next = this.chunk.charCodeAt(this.chunkOff));
            }
            advance(e = 1) {
              for (this.chunkOff += e; this.pos + e >= this.range.to; ) {
                if (this.rangeIndex == this.ranges.length - 1) return this.setDone();
                ((e -= this.range.to - this.pos),
                  (this.range = this.ranges[++this.rangeIndex]),
                  (this.pos = this.range.from));
              }
              return (
                (this.pos += e),
                this.pos >= this.token.lookAhead && (this.token.lookAhead = this.pos + 1),
                this.readNext()
              );
            }
            setDone() {
              return (
                (this.pos = this.chunkPos = this.end),
                (this.range = this.ranges[(this.rangeIndex = this.ranges.length - 1)]),
                (this.chunk = ""),
                (this.next = -1)
              );
            }
            reset(e, t) {
              if (
                (t
                  ? ((this.token = t),
                    (t.start = e),
                    (t.lookAhead = e + 1),
                    (t.value = t.extended = -1))
                  : (this.token = c),
                this.pos != e)
              ) {
                if (((this.pos = e), e == this.end)) return (this.setDone(), this);
                for (; e < this.range.from; ) this.range = this.ranges[--this.rangeIndex];
                for (; e >= this.range.to; ) this.range = this.ranges[++this.rangeIndex];
                (e >= this.chunkPos && e < this.chunkPos + this.chunk.length
                  ? (this.chunkOff = e - this.chunkPos)
                  : ((this.chunk = ""), (this.chunkOff = 0)),
                  this.readNext());
              }
              return this;
            }
            read(e, t) {
              if (e >= this.chunkPos && t <= this.chunkPos + this.chunk.length)
                return this.chunk.slice(e - this.chunkPos, t - this.chunkPos);
              if (e >= this.chunk2Pos && t <= this.chunk2Pos + this.chunk2.length)
                return this.chunk2.slice(e - this.chunk2Pos, t - this.chunk2Pos);
              if (e >= this.range.from && t <= this.range.to) return this.input.read(e, t);
              let i = "";
              for (let r of this.ranges) {
                if (r.from >= t) break;
                r.to > e && (i += this.input.read(Math.max(r.from, e), Math.min(r.to, t)));
              }
              return i;
            }
          }
          class d {
            constructor(e, t) {
              ((this.data = e), (this.id = t));
            }
            token(e, t) {
              let { parser: i } = t.p;
              f(this.data, e, t, this.id, i.data, i.tokenPrecTable);
            }
          }
          d.prototype.contextual = d.prototype.fallback = d.prototype.extend = !1;
          d.prototype.fallback = d.prototype.extend = !1;
          function f(e, t, i, r, n, s) {
            let o = 0,
              a = 1 << r,
              { dialect: l } = i.p.parser;
            e: for (; 0 != (a & e[o]); ) {
              let i = e[o + 1];
              for (let r = o + 3; r < i; r += 2)
                if ((e[r + 1] & a) > 0) {
                  let i = e[r];
                  if (
                    l.allows(i) &&
                    (-1 == t.token.value || t.token.value == i || m(i, t.token.value, n, s))
                  ) {
                    t.acceptToken(i);
                    break;
                  }
                }
              let r = t.next,
                u = 0,
                c = e[o + 2];
              if (!(t.next < 0 && c > u && 65535 == e[i + 3 * c - 3])) {
                for (; u < c; ) {
                  let n = (u + c) >> 1,
                    s = i + n + (n << 1),
                    a = e[s],
                    l = e[s + 1] || 65536;
                  if (r < a) c = n;
                  else {
                    if (!(r >= l)) {
                      ((o = e[s + 2]), t.advance());
                      continue e;
                    }
                    u = n + 1;
                  }
                }
                break;
              }
              o = e[i + 3 * c - 1];
            }
          }
          function p(e, t, i) {
            for (let r, n = t; 65535 != (r = e[n]); n++) if (r == i) return n - t;
            return -1;
          }
          function m(e, t, i, r) {
            let n = p(i, r, t);
            return n < 0 || p(i, r, e) < n;
          }
          const g =
            "undefined" != typeof process && process.env && /\bparse\b/.test(process.env.LOG);
          let v = null;
          function b(e, t, i) {
            let n = e.cursor(r.Qj.IncludeAnonymous);
            for (n.moveTo(t); ; )
              if (!(i < 0 ? n.childBefore(t) : n.childAfter(t)))
                for (;;) {
                  if ((i < 0 ? n.to < t : n.from > t) && !n.type.isError)
                    return i < 0
                      ? Math.max(0, Math.min(n.to - 1, t - 25))
                      : Math.min(e.length, Math.max(n.from + 1, t + 25));
                  if (i < 0 ? n.prevSibling() : n.nextSibling()) break;
                  if (!n.parent()) return i < 0 ? 0 : e.length;
                }
          }
          class O {
            constructor(e, t) {
              ((this.fragments = e),
                (this.nodeSet = t),
                (this.i = 0),
                (this.fragment = null),
                (this.safeFrom = -1),
                (this.safeTo = -1),
                (this.trees = []),
                (this.start = []),
                (this.index = []),
                this.nextFragment());
            }
            nextFragment() {
              let e = (this.fragment =
                this.i == this.fragments.length ? null : this.fragments[this.i++]);
              if (e) {
                for (
                  this.safeFrom = e.openStart ? b(e.tree, e.from + e.offset, 1) - e.offset : e.from,
                    this.safeTo = e.openEnd ? b(e.tree, e.to + e.offset, -1) - e.offset : e.to;
                  this.trees.length;

                )
                  (this.trees.pop(), this.start.pop(), this.index.pop());
                (this.trees.push(e.tree),
                  this.start.push(-e.offset),
                  this.index.push(0),
                  (this.nextStart = this.safeFrom));
              } else this.nextStart = 1e9;
            }
            nodeAt(e) {
              if (e < this.nextStart) return null;
              for (; this.fragment && this.safeTo <= e; ) this.nextFragment();
              if (!this.fragment) return null;
              for (;;) {
                let t = this.trees.length - 1;
                if (t < 0) return (this.nextFragment(), null);
                let i = this.trees[t],
                  n = this.index[t];
                if (n == i.children.length) {
                  (this.trees.pop(), this.start.pop(), this.index.pop());
                  continue;
                }
                let s = i.children[n],
                  o = this.start[t] + i.positions[n];
                if (o > e) return ((this.nextStart = o), null);
                if (s instanceof r.PH) {
                  if (o == e) {
                    if (o < this.safeFrom) return null;
                    let e = o + s.length;
                    if (e <= this.safeTo) {
                      let t = s.prop(r.uY.lookAhead);
                      if (!t || e + t < this.fragment.to) return s;
                    }
                  }
                  (this.index[t]++,
                    o + s.length >= Math.max(this.safeFrom, e) &&
                      (this.trees.push(s), this.start.push(o), this.index.push(0)));
                } else (this.index[t]++, (this.nextStart = o + s.length));
              }
            }
          }
          class w {
            constructor(e, t) {
              ((this.stream = t),
                (this.tokens = []),
                (this.mainToken = null),
                (this.actions = []),
                (this.tokens = e.tokenizers.map((e) => new u())));
            }
            getActions(e) {
              let t = 0,
                i = null,
                { parser: r } = e.p,
                { tokenizers: n } = r,
                s = r.stateSlot(e.state, 3),
                o = e.curContext ? e.curContext.hash : 0,
                a = 0;
              for (let r = 0; r < n.length; r++) {
                if (!((1 << r) & s)) continue;
                let l = n[r],
                  u = this.tokens[r];
                if (
                  (!i || l.fallback) &&
                  ((l.contextual || u.start != e.pos || u.mask != s || u.context != o) &&
                    (this.updateCachedToken(u, l, e), (u.mask = s), (u.context = o)),
                  u.lookAhead > u.end + 25 && (a = Math.max(u.lookAhead, a)),
                  0 != u.value)
                ) {
                  let r = t;
                  if (
                    (u.extended > -1 && (t = this.addActions(e, u.extended, u.end, t)),
                    (t = this.addActions(e, u.value, u.end, t)),
                    !l.extend && ((i = u), t > r))
                  )
                    break;
                }
              }
              for (; this.actions.length > t; ) this.actions.pop();
              return (
                a && e.setLookAhead(a),
                i ||
                  e.pos != this.stream.end ||
                  ((i = new u()),
                  (i.value = e.p.parser.eofTerm),
                  (i.start = i.end = e.pos),
                  (t = this.addActions(e, i.value, i.end, t))),
                (this.mainToken = i),
                this.actions
              );
            }
            getMainToken(e) {
              if (this.mainToken) return this.mainToken;
              let t = new u(),
                { pos: i, p: r } = e;
              return (
                (t.start = i),
                (t.end = Math.min(i + 1, r.stream.end)),
                (t.value = i == r.stream.end ? r.parser.eofTerm : 0),
                t
              );
            }
            updateCachedToken(e, t, i) {
              let r = this.stream.clipPos(i.pos);
              if ((t.token(this.stream.reset(r, e), i), e.value > -1)) {
                let { parser: t } = i.p;
                for (let r = 0; r < t.specialized.length; r++)
                  if (t.specialized[r] == e.value) {
                    let n = t.specializers[r](this.stream.read(e.start, e.end), i);
                    if (n >= 0 && i.p.parser.dialect.allows(n >> 1)) {
                      1 & n ? (e.extended = n >> 1) : (e.value = n >> 1);
                      break;
                    }
                  }
              } else ((e.value = 0), (e.end = this.stream.clipPos(r + 1)));
            }
            putAction(e, t, i, r) {
              for (let t = 0; t < r; t += 3) if (this.actions[t] == e) return r;
              return ((this.actions[r++] = e), (this.actions[r++] = t), (this.actions[r++] = i), r);
            }
            addActions(e, t, i, r) {
              let { state: n } = e,
                { parser: s } = e.p,
                { data: o } = s;
              for (let e = 0; e < 2; e++)
                for (let a = s.stateSlot(n, e ? 2 : 1); ; a += 3) {
                  if (65535 == o[a]) {
                    if (1 != o[a + 1]) {
                      0 == r && 2 == o[a + 1] && (r = this.putAction(x(o, a + 2), t, i, r));
                      break;
                    }
                    a = x(o, a + 2);
                  }
                  o[a] == t && (r = this.putAction(x(o, a + 1), t, i, r));
                }
              return r;
            }
          }
          class $ {
            constructor(e, t, i, r) {
              ((this.parser = e),
                (this.input = t),
                (this.ranges = r),
                (this.recovering = 0),
                (this.nextStackID = 9812),
                (this.minStackPos = 0),
                (this.reused = []),
                (this.stoppedAt = null),
                (this.lastBigReductionStart = -1),
                (this.lastBigReductionSize = 0),
                (this.bigReductionCount = 0),
                (this.stream = new h(t, r)),
                (this.tokens = new w(e, this.stream)),
                (this.topTerm = e.top[1]));
              let { from: s } = r[0];
              ((this.stacks = [n.start(this, e.top[0], s)]),
                (this.fragments =
                  i.length && this.stream.end - s > 4 * e.bufferLength
                    ? new O(i, e.nodeSet)
                    : null));
            }
            get parsedPos() {
              return this.minStackPos;
            }
            advance() {
              let e,
                t,
                i = this.stacks,
                r = this.minStackPos,
                n = (this.stacks = []);
              if (this.bigReductionCount > 300 && 1 == i.length) {
                let [e] = i;
                for (
                  ;
                  e.forceReduce() &&
                  e.stack.length &&
                  e.stack[e.stack.length - 2] >= this.lastBigReductionStart;

                );
                this.bigReductionCount = this.lastBigReductionSize = 0;
              }
              for (let s = 0; s < i.length; s++) {
                let o = i[s];
                for (;;) {
                  if (((this.tokens.mainToken = null), o.pos > r)) n.push(o);
                  else {
                    if (this.advanceStack(o, n, i)) continue;
                    {
                      (e || ((e = []), (t = [])), e.push(o));
                      let i = this.tokens.getMainToken(o);
                      t.push(i.value, i.end);
                    }
                  }
                  break;
                }
              }
              if (!n.length) {
                let t =
                  e &&
                  (function (e) {
                    let t = null;
                    for (let i of e) {
                      let e = i.p.stoppedAt;
                      (i.pos == i.p.stream.end || (null != e && i.pos > e)) &&
                        i.p.parser.stateFlag(i.state, 2) &&
                        (!t || t.score < i.score) &&
                        (t = i);
                    }
                    return t;
                  })(e);
                if (t) return this.stackToTree(t);
                if (this.parser.strict) throw new SyntaxError("No parse at " + r);
                this.recovering || (this.recovering = 5);
              }
              if (this.recovering && e) {
                let i =
                  null != this.stoppedAt && e[0].pos > this.stoppedAt
                    ? e[0]
                    : this.runRecovery(e, t, n);
                if (i) return this.stackToTree(i.forceAll());
              }
              if (this.recovering) {
                let e = 1 == this.recovering ? 1 : 3 * this.recovering;
                if (n.length > e) for (n.sort((e, t) => t.score - e.score); n.length > e; ) n.pop();
                n.some((e) => e.reducePos > r) && this.recovering--;
              } else if (n.length > 1) {
                e: for (let e = 0; e < n.length - 1; e++) {
                  let t = n[e];
                  for (let i = e + 1; i < n.length; i++) {
                    let r = n[i];
                    if (t.sameState(r) || (t.buffer.length > 500 && r.buffer.length > 500)) {
                      if (!((t.score - r.score || t.buffer.length - r.buffer.length) > 0)) {
                        n.splice(e--, 1);
                        continue e;
                      }
                      n.splice(i--, 1);
                    }
                  }
                }
                n.length > 12 && n.splice(12, n.length - 12);
              }
              this.minStackPos = n[0].pos;
              for (let e = 1; e < n.length; e++)
                n[e].pos < this.minStackPos && (this.minStackPos = n[e].pos);
              return null;
            }
            stopAt(e) {
              if (null != this.stoppedAt && this.stoppedAt < e)
                throw new RangeError("Can't move stoppedAt forward");
              this.stoppedAt = e;
            }
            advanceStack(e, t, i) {
              let n = e.pos,
                { parser: s } = this;
              g && this.stackID(e);
              if (null != this.stoppedAt && n > this.stoppedAt) return e.forceReduce() ? e : null;
              if (this.fragments) {
                let t = e.curContext && e.curContext.tracker.strict,
                  i = t ? e.curContext.hash : 0;
                for (let o = this.fragments.nodeAt(n); o; ) {
                  let n =
                    this.parser.nodeSet.types[o.type.id] == o.type
                      ? s.getGoto(e.state, o.type.id)
                      : -1;
                  if (n > -1 && o.length && (!t || (o.prop(r.uY.contextHash) || 0) == i))
                    return (e.useNode(o, n), !0);
                  if (!(o instanceof r.PH) || 0 == o.children.length || o.positions[0] > 0) break;
                  let a = o.children[0];
                  if (!(a instanceof r.PH && 0 == o.positions[0])) break;
                  o = a;
                }
              }
              let o = s.stateSlot(e.state, 4);
              if (o > 0) return (e.reduce(o), !0);
              if (e.stack.length >= 8400) for (; e.stack.length > 6e3 && e.forceReduce(); );
              let a = this.tokens.getActions(e);
              for (let r = 0; r < a.length; ) {
                let s = a[r++],
                  o = a[r++],
                  l = a[r++],
                  u = r == a.length || !i,
                  c = u ? e : e.split(),
                  h = this.tokens.mainToken;
                if ((c.apply(s, o, h ? h.start : c.pos, l), u)) return !0;
                c.pos > n ? t.push(c) : i.push(c);
              }
              return !1;
            }
            advanceFully(e, t) {
              let i = e.pos;
              for (;;) {
                if (!this.advanceStack(e, null, null)) return !1;
                if (e.pos > i) return (y(e, t), !0);
              }
            }
            runRecovery(e, t, i) {
              let r = null,
                n = !1;
              for (let s = 0; s < e.length; s++) {
                let o = e[s],
                  a = t[s << 1],
                  l = t[1 + (s << 1)],
                  u = g ? this.stackID(o) + " -> " : "";
                if (o.deadEnd) {
                  if (n) continue;
                  if (((n = !0), o.restart(), this.advanceFully(o, i))) continue;
                }
                let c = o.split(),
                  h = u;
                for (let e = 0; c.forceReduce() && e < 10; e++) {
                  if (this.advanceFully(c, i)) break;
                  g && (h = this.stackID(c) + " -> ");
                }
                for (let e of o.recoverByInsert(a)) this.advanceFully(e, i);
                this.stream.end > o.pos
                  ? (l == o.pos && (l++, (a = 0)), o.recoverByDelete(a, l), y(o, i))
                  : (!r || r.score < o.score) && (r = o);
              }
              return r;
            }
            stackToTree(e) {
              return (
                e.close(),
                r.PH.build({
                  buffer: a.create(e),
                  nodeSet: this.parser.nodeSet,
                  topID: this.topTerm,
                  maxBufferLength: this.parser.bufferLength,
                  reused: this.reused,
                  start: this.ranges[0].from,
                  length: e.pos - this.ranges[0].from,
                  minRepeatType: this.parser.minRepeatTerm,
                })
              );
            }
            stackID(e) {
              let t = (v || (v = new WeakMap())).get(e);
              return (t || v.set(e, (t = String.fromCodePoint(this.nextStackID++))), t + e);
            }
          }
          function y(e, t) {
            for (let i = 0; i < t.length; i++) {
              let r = t[i];
              if (r.pos == e.pos && r.sameState(e))
                return void (t[i].score < e.score && (t[i] = e));
            }
            t.push(e);
          }
          class E {
            constructor(e, t, i) {
              ((this.source = e), (this.flags = t), (this.disabled = i));
            }
            allows(e) {
              return !this.disabled || 0 == this.disabled[e];
            }
          }
          class S extends r.iX {
            constructor(e) {
              if ((super(), (this.wrappers = []), 14 != e.version))
                throw new RangeError(
                  `Parser version (${e.version}) doesn't match runtime version (14)`,
                );
              let t = e.nodeNames.split(" ");
              this.minRepeatTerm = t.length;
              for (let i = 0; i < e.repeatNodeCount; i++) t.push("");
              let i = Object.keys(e.topRules).map((t) => e.topRules[t][1]),
                n = [];
              for (let e = 0; e < t.length; e++) n.push([]);
              function s(e, t, i) {
                n[e].push([t, t.deserialize(String(i))]);
              }
              if (e.nodeProps)
                for (let t of e.nodeProps) {
                  let e = t[0];
                  "string" == typeof e && (e = r.uY[e]);
                  for (let i = 1; i < t.length; ) {
                    let r = t[i++];
                    if (r >= 0) s(r, e, t[i++]);
                    else {
                      let n = t[i + -r];
                      for (let o = -r; o > 0; o--) s(t[i++], e, n);
                      i++;
                    }
                  }
                }
              ((this.nodeSet = new r.fI(
                t.map((t, s) =>
                  r.Z6.define({
                    name: s >= this.minRepeatTerm ? void 0 : t,
                    id: s,
                    props: n[s],
                    top: i.indexOf(s) > -1,
                    error: 0 == s,
                    skipped: e.skippedNodes && e.skippedNodes.indexOf(s) > -1,
                  }),
                ),
              )),
                e.propSources && (this.nodeSet = this.nodeSet.extend(...e.propSources)),
                (this.strict = !1),
                (this.bufferLength = r.cF));
              let o = l(e.tokenData);
              ((this.context = e.context),
                (this.specializerSpecs = e.specialized || []),
                (this.specialized = new Uint16Array(this.specializerSpecs.length)));
              for (let e = 0; e < this.specializerSpecs.length; e++)
                this.specialized[e] = this.specializerSpecs[e].term;
              ((this.specializers = this.specializerSpecs.map(k)),
                (this.states = l(e.states, Uint32Array)),
                (this.data = l(e.stateData)),
                (this.goto = l(e.goto)),
                (this.maxTerm = e.maxTerm),
                (this.tokenizers = e.tokenizers.map((e) =>
                  "number" == typeof e ? new d(o, e) : e,
                )),
                (this.topRules = e.topRules),
                (this.dialects = e.dialects || {}),
                (this.dynamicPrecedences = e.dynamicPrecedences || null),
                (this.tokenPrecTable = e.tokenPrec),
                (this.termNames = e.termNames || null),
                (this.maxNode = this.nodeSet.types.length - 1),
                (this.dialect = this.parseDialect()),
                (this.top = this.topRules[Object.keys(this.topRules)[0]]));
            }
            createParse(e, t, i) {
              let r = new $(this, e, t, i);
              for (let n of this.wrappers) r = n(r, e, t, i);
              return r;
            }
            getGoto(e, t, i = !1) {
              let r = this.goto;
              if (t >= r[0]) return -1;
              for (let n = r[t + 1]; ; ) {
                let t = r[n++],
                  s = 1 & t,
                  o = r[n++];
                if (s && i) return o;
                for (let i = n + (t >> 1); n < i; n++) if (r[n] == e) return o;
                if (s) return -1;
              }
            }
            hasAction(e, t) {
              let i = this.data;
              for (let r = 0; r < 2; r++)
                for (let n, s = this.stateSlot(e, r ? 2 : 1); ; s += 3) {
                  if (65535 == (n = i[s])) {
                    if (1 != i[s + 1]) {
                      if (2 == i[s + 1]) return x(i, s + 2);
                      break;
                    }
                    n = i[(s = x(i, s + 2))];
                  }
                  if (n == t || 0 == n) return x(i, s + 1);
                }
              return 0;
            }
            stateSlot(e, t) {
              return this.states[6 * e + t];
            }
            stateFlag(e, t) {
              return (this.stateSlot(e, 0) & t) > 0;
            }
            validAction(e, t) {
              return !!this.allActions(e, (e) => e == t || null);
            }
            allActions(e, t) {
              let i = this.stateSlot(e, 4),
                r = i ? t(i) : void 0;
              for (let i = this.stateSlot(e, 1); null == r; i += 3) {
                if (65535 == this.data[i]) {
                  if (1 != this.data[i + 1]) break;
                  i = x(this.data, i + 2);
                }
                r = t(x(this.data, i + 1));
              }
              return r;
            }
            nextStates(e) {
              let t = [];
              for (let i = this.stateSlot(e, 1); ; i += 3) {
                if (65535 == this.data[i]) {
                  if (1 != this.data[i + 1]) break;
                  i = x(this.data, i + 2);
                }
                if (!(1 & this.data[i + 2])) {
                  let e = this.data[i + 1];
                  t.some((t, i) => 1 & i && t == e) || t.push(this.data[i], e);
                }
              }
              return t;
            }
            configure(e) {
              let t = Object.assign(Object.create(S.prototype), this);
              if ((e.props && (t.nodeSet = this.nodeSet.extend(...e.props)), e.top)) {
                let i = this.topRules[e.top];
                if (!i) throw new RangeError(`Invalid top rule name ${e.top}`);
                t.top = i;
              }
              return (
                e.tokenizers &&
                  (t.tokenizers = this.tokenizers.map((t) => {
                    let i = e.tokenizers.find((e) => e.from == t);
                    return i ? i.to : t;
                  })),
                e.specializers &&
                  ((t.specializers = this.specializers.slice()),
                  (t.specializerSpecs = this.specializerSpecs.map((i, r) => {
                    let n = e.specializers.find((e) => e.from == i.external);
                    if (!n) return i;
                    let s = Object.assign(Object.assign({}, i), { external: n.to });
                    return ((t.specializers[r] = k(s)), s);
                  }))),
                e.contextTracker && (t.context = e.contextTracker),
                e.dialect && (t.dialect = this.parseDialect(e.dialect)),
                null != e.strict && (t.strict = e.strict),
                e.wrap && (t.wrappers = t.wrappers.concat(e.wrap)),
                null != e.bufferLength && (t.bufferLength = e.bufferLength),
                t
              );
            }
            hasWrappers() {
              return this.wrappers.length > 0;
            }
            getName(e) {
              return this.termNames
                ? this.termNames[e]
                : String((e <= this.maxNode && this.nodeSet.types[e].name) || e);
            }
            get eofTerm() {
              return this.maxNode + 1;
            }
            get topNode() {
              return this.nodeSet.types[this.top[1]];
            }
            dynamicPrecedence(e) {
              let t = this.dynamicPrecedences;
              return null == t ? 0 : t[e] || 0;
            }
            parseDialect(e) {
              let t = Object.keys(this.dialects),
                i = t.map(() => !1);
              if (e)
                for (let r of e.split(" ")) {
                  let e = t.indexOf(r);
                  e >= 0 && (i[e] = !0);
                }
              let r = null;
              for (let e = 0; e < t.length; e++)
                if (!i[e])
                  for (let i, n = this.dialects[t[e]]; 65535 != (i = this.data[n++]); )
                    (r || (r = new Uint8Array(this.maxTerm + 1)))[i] = 1;
              return new E(e, i, r);
            }
            static deserialize(e) {
              return new S(e);
            }
          }
          function x(e, t) {
            return e[t] | (e[t + 1] << 16);
          }
          function k(e) {
            if (e.external) {
              let t = e.extend ? 1 : 0;
              return (i, r) => (e.external(i, r) << 1) | t;
            }
            return e.get;
          }
        },
        1112: (e, t, i) => {
          "use strict";
          const r = i(8395);
          e.exports = (e, t, i) => ((e = new r(e, i)), (t = new r(t, i)), e.intersects(t, i));
        },
        1158: (e) => {
          "use strict";
          e.exports = class {
            constructor() {
              ((this.max = 1e3), (this.map = new Map()));
            }
            get(e) {
              const t = this.map.get(e);
              return void 0 === t ? void 0 : (this.map.delete(e), this.map.set(e, t), t);
            }
            delete(e) {
              return this.map.delete(e);
            }
            set(e, t) {
              if (!this.delete(e) && void 0 !== t) {
                if (this.map.size >= this.max) {
                  const e = this.map.keys().next().value;
                  this.delete(e);
                }
                this.map.set(e, t);
              }
              return this;
            }
          };
        },
        1159: (e) => {
          "use strict";
          e.exports = t;
        },
        1269: (e) => {
          "use strict";
          e.exports = i;
        },
        1308: (e) => {
          "use strict";
          e.exports = r;
        },
        1465: (e, t, i) => {
          "use strict";
          const r = i(1722),
            n = i(5380);
          e.exports = (e, t, i) => {
            const s = [];
            let o = null,
              a = null;
            const l = e.sort((e, t) => n(e, t, i));
            for (const e of l) {
              r(e, t, i) ? ((a = e), o || (o = e)) : (a && s.push([o, a]), (a = null), (o = null));
            }
            o && s.push([o, null]);
            const u = [];
            for (const [e, t] of s)
              e === t
                ? u.push(e)
                : t || e !== l[0]
                  ? t
                    ? e === l[0]
                      ? u.push(`<=${t}`)
                      : u.push(`${e} - ${t}`)
                    : u.push(`>=${e}`)
                  : u.push("*");
            const c = u.join(" || "),
              h = "string" == typeof t.raw ? t.raw : String(t);
            return c.length < h.length ? c : t;
          };
        },
        1617: (e, t, i) => {
          "use strict";
          const r = i(7944);
          e.exports = (e, t) => new r(e, t).patch;
        },
        1722: (e, t, i) => {
          "use strict";
          const r = i(8395);
          e.exports = (e, t, i) => {
            try {
              t = new r(t, i);
            } catch (e) {
              return !1;
            }
            return t.test(e);
          };
        },
        2007: (e) => {
          "use strict";
          e.exports = n;
        },
        2077: (e, t, i) => {
          "use strict";
          const r = i(5380);
          e.exports = (e, t, i) => r(e, t, i) >= 0;
        },
        2533: (e) => {
          "use strict";
          e.exports = JSON.parse('{"id":"grafana-metricsdrilldown-app"}');
        },
        2801: (e, t, i) => {
          "use strict";
          const r = i(7944);
          e.exports = (e, t, i) => {
            const n = new r(e, i),
              s = new r(t, i);
            return n.compare(s) || n.compareBuild(s);
          };
        },
        2862: (e, t, i) => {
          "use strict";
          const r = i(5380);
          e.exports = (e, t, i) => r(t, e, i);
        },
        2966: (e, t, i) => {
          "use strict";
          const r = i(7944);
          e.exports = (e, t) => new r(e, t).major;
        },
        3241: (e) => {
          "use strict";
          e.exports = s;
        },
        3489: (e, t, i) => {
          "use strict";
          const r = i(7944),
            n = i(8395),
            s = i(144);
          e.exports = (e, t) => {
            e = new n(e, t);
            let i = new r("0.0.0");
            if (e.test(i)) return i;
            if (((i = new r("0.0.0-0")), e.test(i))) return i;
            i = null;
            for (let t = 0; t < e.set.length; ++t) {
              const n = e.set[t];
              let o = null;
              (n.forEach((e) => {
                const t = new r(e.semver.version);
                switch (e.operator) {
                  case ">":
                    (0 === t.prerelease.length ? t.patch++ : t.prerelease.push(0),
                      (t.raw = t.format()));
                  case "":
                  case ">=":
                    (o && !s(t, o)) || (o = t);
                    break;
                  case "<":
                  case "<=":
                    break;
                  default:
                    throw new Error(`Unexpected operation: ${e.operator}`);
                }
              }),
                !o || (i && !s(i, o)) || (i = o));
            }
            return i && e.test(i) ? i : null;
          };
        },
        3498: (e, t, i) => {
          "use strict";
          i.d(t, { b: () => r });
          const r = { Trail: "trail", Drilldown: "drilldown" };
        },
        3781: (e, t, i) => {
          "use strict";
          i.d(t, {
            I8: () => y,
            kY: () => E,
            e6: () => w,
            Rk: () => $,
            PQ: () => O,
            Ge: () => m,
            $9: () => v,
          });
          var r = i(7781),
            n = i(8531);
          function s(e = [], t) {
            if (!t.multi && !t.includeAll)
              return (function (e) {
                if ("string" != typeof e) return e;
                if (n.config.featureToggles.prometheusSpecialCharsInLabelValues)
                  return /^\w+(=|!=|=~|!~)".*"$/.test(e)
                    ? e
                    : e.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
                return e.replace(/\\/g, "\\\\").replace(/'/g, "\\\\'");
              })(e);
            if ("string" == typeof e) return o(e);
            const i = e.map((e) => o(e));
            return 1 === i.length ? i[0] : "(" + i.join("|") + ")";
          }
          function o(e) {
            return "string" != typeof e
              ? e
              : n.config.featureToggles.prometheusSpecialCharsInLabelValues
                ? e
                    .replace(/\\/g, "\\\\\\\\")
                    .replace(/"/g, '\\\\\\"')
                    .replace(/[$^*{}\[\]\'+?.()|]/g, "\\\\$&")
                : e.replace(/\\/g, "\\\\\\\\").replace(/[$^*{}\[\]+?.()|]/g, "\\\\$&");
          }
          var a = i(9851),
            l = i(8943),
            u = i(3498),
            c = i(8705);
          const h = new RegExp("([a-zA-Z_]\\w*)(>|<|!~|=~|!=|=)(.+)");
          var d = i(6538);
          const f = "Grafana Metrics Drilldown",
            p = "|",
            m = [
              {
                title: `Open in ${f}`,
                description: `Open current query in the ${f} view`,
                category: "metrics-drilldown",
                icon: "gf-prometheus",
                path: $(u.b.Drilldown),
                targets: [
                  r.PluginExtensionPoints.DashboardPanelMenu,
                  r.PluginExtensionPoints.ExploreToolbarAction,
                  r.PluginExtensionPoints.AlertingRuleQueryEditor,
                  "grafana-assistant-app/navigateToDrilldown/v1",
                ],
                configure: function (e) {
                  if (void 0 === e) return;
                  if ("pluginId" in e && "timeseries" !== e.pluginId) return;
                  if (!e.targets.filter(S).length) return;
                  return { path: g(e) || $(u.b.Drilldown) };
                },
              },
              {
                targets: [
                  "grafana-metricsdrilldown-app/grafana-assistant-app/navigateToDrilldown/v0-alpha",
                ],
                title: "Navigate to metrics drilldown",
                description: "Build a url path to the metrics drilldown",
                path: $(u.b.Drilldown),
                configure: (e) => {
                  if (void 0 === e) return;
                  const {
                      navigateToMetrics: t,
                      datasource_uid: i,
                      label_filters: r,
                      metric: n,
                      start: s,
                      end: o,
                    } = e,
                    a = (function (e) {
                      if (!e) return [];
                      return e.map((e) => {
                        const t = (function (e) {
                          const [, t, i, r] = e.match(h) || [, "", "", ""];
                          return {
                            key: t.trim(),
                            value: r.replace(/['" ]/g, ""),
                            operator: i.trim(),
                          };
                        })(e);
                        return { label: t.key, op: t.operator, value: t.value };
                      });
                    })(r),
                    l = O(i, a, n, s, o),
                    c = t ? w(l) : void 0;
                  return { path: $(u.b.Drilldown, c) };
                },
              },
            ];
          function g(e) {
            var t;
            if (void 0 === e) return null;
            if ("pluginId" in e && "timeseries" !== e.pluginId) return null;
            const i = e.targets.filter(S);
            if (!i.length) return null;
            const r = i[0],
              o = (0, n.getTemplateSrv)(),
              a = o.replace(
                null === (t = r.datasource) || void 0 === t ? void 0 : t.uid,
                e.scopedVars,
              );
            if (!r.expr) return $(u.b.Drilldown);
            const l = o.replace(r.expr, e.scopedVars, s);
            try {
              const { metric: t, labels: i, hasErrors: r, errors: n } = v(l);
              r && c.v.warn(`PromQL query has parsing errors: ${n.join(", ")}`);
              const s =
                  "timeRange" in e &&
                  "object" == typeof e.timeRange &&
                  null != e.timeRange &&
                  "from" in e.timeRange &&
                  "to" in e.timeRange
                    ? e.timeRange
                    : void 0,
                o = w(O(a, i, t, null == s ? void 0 : s.from, null == s ? void 0 : s.to));
              return $(u.b.Drilldown, o);
            } catch (e) {
              return (
                c.v.error(new Error(`[Metrics Drilldown] Error parsing PromQL query: ${e}`)),
                $(u.b.Drilldown)
              );
            }
          }
          function v(e) {
            const t = a.K3.parse(e);
            let i = "";
            const r = [];
            let n = !1;
            const s = [];
            return (
              t.iterate({
                enter: (t) => {
                  var o;
                  if (t.type.isError || "⚠" === t.name) {
                    n = !0;
                    const i = e.slice(t.from, t.to),
                      r = i
                        ? `Parse error at position ${t.from}-${t.to}: "${i}"`
                        : `Parse error at position ${t.from}`;
                    s.push(r);
                  }
                  i ||
                    "Identifier" !== t.name ||
                    "VectorSelector" !==
                      (null === (o = t.node.parent) || void 0 === o ? void 0 : o.type.name) ||
                    (i = e.slice(t.from, t.to));
                  const a = (0, d.W)(t, e);
                  a && r.push(a);
                },
              }),
              { metric: i, labels: r, hasErrors: n, errors: s }
            );
          }
          function b(e) {
            return [y.Filters, `${e.label}${p}${e.op}${p}${x(e.value)}`];
          }
          function O(e, t, i, r, n) {
            return {
              datasource_uid: e,
              label_filters: null != t ? t : [],
              metric: i,
              start: r,
              end: n,
            };
          }
          function w(e) {
            const { metric: t, start: i, end: r, datasource_uid: n, label_filters: s } = e,
              o = null != s ? s : [];
            return E([
              [y.Metric, t],
              [y.TimeRangeFrom, i],
              [y.TimeRangeTo, r],
              [y.DatasourceId, n],
              ...o.map(b),
            ]);
          }
          function $(e, t) {
            const i = t ? `?${t.toString()}` : "";
            return `${l.G}/${e}${i}`;
          }
          const y = {
            TimeRangeFrom: "from",
            TimeRangeTo: "to",
            Metric: "metric",
            DatasourceId: "var-ds",
            Filters: "var-filters",
          };
          function E(e, t) {
            const i = new URLSearchParams(null == t ? void 0 : t.toString());
            return (
              e.forEach(([e, t]) => {
                t && i.append(e, t);
              }),
              i
            );
          }
          function S(e) {
            const { datasource: t } = e;
            return "prometheus" === (null == t ? void 0 : t.type);
          }
          function x(e) {
            return null == e ? "" : /\|/g[Symbol.replace](e, "__gfp__");
          }
        },
        3811: (e, t, i) => {
          "use strict";
          const r = i(6909),
            n = i(7659),
            s = i(144),
            o = i(2077),
            a = i(599),
            l = i(7092);
          e.exports = (e, t, i, u) => {
            switch (t) {
              case "===":
                return (
                  "object" == typeof e && (e = e.version),
                  "object" == typeof i && (i = i.version),
                  e === i
                );
              case "!==":
                return (
                  "object" == typeof e && (e = e.version),
                  "object" == typeof i && (i = i.version),
                  e !== i
                );
              case "":
              case "=":
              case "==":
                return r(e, i, u);
              case "!=":
                return n(e, i, u);
              case ">":
                return s(e, i, u);
              case ">=":
                return o(e, i, u);
              case "<":
                return a(e, i, u);
              case "<=":
                return l(e, i, u);
              default:
                throw new TypeError(`Invalid operator: ${t}`);
            }
          };
        },
        4031: (e) => {
          "use strict";
          const t = /^[0-9]+$/,
            i = (e, i) => {
              if ("number" == typeof e && "number" == typeof i) return e === i ? 0 : e < i ? -1 : 1;
              const r = t.test(e),
                n = t.test(i);
              return (
                r && n && ((e = +e), (i = +i)),
                e === i ? 0 : r && !n ? -1 : n && !r ? 1 : e < i ? -1 : 1
              );
            };
          e.exports = { compareIdentifiers: i, rcompareIdentifiers: (e, t) => i(t, e) };
        },
        4266: (e, t, i) => {
          "use strict";
          const r = i(5463);
          e.exports = (e, t, i) => r(e, t, "<", i);
        },
        4440: (e, t, i) => {
          "use strict";
          i.d(t, { UO: () => u, aQ: () => h, tS: () => p });
          var r = i(8531),
            n = i(8705);
          function s(e, t, i, r, n, s, o) {
            try {
              var a = e[s](o),
                l = a.value;
            } catch (e) {
              return void i(e);
            }
            a.done ? t(l) : Promise.resolve(l).then(r, n);
          }
          function o(e) {
            return function () {
              var t = this,
                i = arguments;
              return new Promise(function (r, n) {
                var o = e.apply(t, i);
                function a(e) {
                  s(o, r, n, a, l, "next", e);
                }
                function l(e) {
                  s(o, r, n, a, l, "throw", e);
                }
                a(void 0);
              });
            };
          }
          function a(e, t, i) {
            return (
              t in e
                ? Object.defineProperty(e, t, {
                    value: i,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  })
                : (e[t] = i),
              e
            );
          }
          const l = 3e3,
            u = (3).toFixed(0),
            c = /^grafana-[0-9a-z]+prometheus-datasource$/;
          function h(e) {
            return (
              "object" == typeof e &&
              null !== e &&
              "type" in e &&
              "string" == typeof e.type &&
              ("prometheus" === e.type || c.test(e.type)) &&
              "uid" in e &&
              "string" == typeof e.uid
            );
          }
          class d {
            getHealthyDataSources(e, t = 15) {
              return o(function* () {
                const i = this.cache.get(e);
                if (null == i ? void 0 : i.length) return i;
                let r = this.pendingRequests.get(e);
                r ||
                  ((r = this.fetchHealthyDataSources(e, t).finally(() => {
                    this.pendingRequests.delete(e);
                  })),
                  this.pendingRequests.set(e, r));
                const n = yield r;
                return (this.cache.set(e, n), n);
              }).call(this);
            }
            fetchHealthyDataSources(e, t) {
              return o(function* () {
                const i = [
                    ...(0, r.getDataSourceSrv)().getList({
                      logs: !0,
                      type: e,
                      filter: (e) => "grafana" !== e.uid,
                    }),
                  ]
                    .sort((e, t) =>
                      e.isDefault && !t.isDefault ? -1 : !e.isDefault && t.isDefault ? 1 : 0,
                    )
                    .slice(0, t),
                  s = [],
                  a = [];
                return (
                  yield Promise.all(
                    i.map((e) =>
                      o(function* () {
                        try {
                          const t = yield this.performHealthCheckWithTimeout(e.uid);
                          "OK" === (null == t ? void 0 : t.status)
                            ? s.push(e)
                            : "TIMEOUT" !== (null == t ? void 0 : t.status) && a.push(e);
                        } catch (t) {
                          a.push(e);
                        }
                      }).call(this),
                    ),
                  ),
                  a.length > 0 &&
                    n.v.warn(
                      `Found ${a.length} unhealthy ${e} data sources: ${a.map((e) => e.name).join(", ")}`,
                    ),
                  s
                );
              }).call(this);
            }
            performHealthCheckWithTimeout(e) {
              return o(function* () {
                const t = new AbortController(),
                  i = setTimeout(() => {
                    t.abort();
                  }, l);
                try {
                  const n = yield (0, r.getBackendSrv)().get(
                    `/api/datasources/uid/${e}/health`,
                    void 0,
                    void 0,
                    { showSuccessAlert: !1, showErrorAlert: !1, abortSignal: t.signal },
                  );
                  return (clearTimeout(i), n);
                } catch (e) {
                  if ((clearTimeout(i), e instanceof DOMException && "AbortError" === e.name))
                    return { status: "TIMEOUT" };
                  throw e;
                }
              })();
            }
            constructor() {
              (a(this, "pendingRequests", new Map()), a(this, "cache", new Map()));
            }
          }
          let f;
          function p() {
            return (f || (f = new d()), f);
          }
        },
        4696: (e, t, i) => {
          "use strict";
          i.d(t, { u: () => n });
          const r = [
            { regExp: /localhost/, environment: "local" },
            { regExp: /grafana-dev\.net/, environment: "dev" },
            { regExp: /grafana-ops\.net/, environment: "ops" },
            { regExp: /grafana\.net/, environment: "prod" },
          ];
          function n() {
            var e, t;
            if (
              !(null === (t = window) || void 0 === t || null === (e = t.location) || void 0 === e
                ? void 0
                : e.host)
            )
              return null;
            const i = r.find(({ regExp: e }) => e.test(window.location.host));
            return i ? i.environment : null;
          }
        },
        5176: (e, t, i) => {
          "use strict";
          i.d(t, { t: () => r });
          const r = "4d33c8ae9a99df06877b6a61bd929af03ac7246a";
        },
        5334: (e, t, i) => {
          "use strict";
          const r = i(7944),
            n = i(5860),
            { safeRe: s, t: o } = i(6850);
          e.exports = (e, t) => {
            if (e instanceof r) return e;
            if (("number" == typeof e && (e = String(e)), "string" != typeof e)) return null;
            let i = null;
            if ((t = t || {}).rtl) {
              const r = t.includePrerelease ? s[o.COERCERTLFULL] : s[o.COERCERTL];
              let n;
              for (; (n = r.exec(e)) && (!i || i.index + i[0].length !== e.length); )
                ((i && n.index + n[0].length === i.index + i[0].length) || (i = n),
                  (r.lastIndex = n.index + n[1].length + n[2].length));
              r.lastIndex = -1;
            } else i = e.match(t.includePrerelease ? s[o.COERCEFULL] : s[o.COERCE]);
            if (null === i) return null;
            const a = i[2],
              l = i[3] || "0",
              u = i[4] || "0",
              c = t.includePrerelease && i[5] ? `-${i[5]}` : "",
              h = t.includePrerelease && i[6] ? `+${i[6]}` : "";
            return n(`${a}.${l}.${u}${c}${h}`, t);
          };
        },
        5380: (e, t, i) => {
          "use strict";
          const r = i(7944);
          e.exports = (e, t, i) => new r(e, i).compare(new r(t, i));
        },
        5438: (e, t, i) => {
          "use strict";
          var r;
          (i.d(t, { $b: () => r, HT: () => s, Ic: () => n }),
            (function (e) {
              ((e.TRACE = "trace"),
                (e.DEBUG = "debug"),
                (e.INFO = "info"),
                (e.LOG = "log"),
                (e.WARN = "warn"),
                (e.ERROR = "error"));
            })(r || (r = {})));
          const n = r.LOG,
            s = [r.TRACE, r.DEBUG, r.INFO, r.LOG, r.WARN, r.ERROR];
        },
        5463: (e, t, i) => {
          "use strict";
          const r = i(7944),
            n = i(9524),
            { ANY: s } = n,
            o = i(8395),
            a = i(1722),
            l = i(144),
            u = i(599),
            c = i(7092),
            h = i(2077);
          e.exports = (e, t, i, d) => {
            let f, p, m, g, v;
            switch (((e = new r(e, d)), (t = new o(t, d)), i)) {
              case ">":
                ((f = l), (p = c), (m = u), (g = ">"), (v = ">="));
                break;
              case "<":
                ((f = u), (p = h), (m = l), (g = "<"), (v = "<="));
                break;
              default:
                throw new TypeError('Must provide a hilo val of "<" or ">"');
            }
            if (a(e, t, d)) return !1;
            for (let i = 0; i < t.set.length; ++i) {
              const r = t.set[i];
              let o = null,
                a = null;
              if (
                (r.forEach((e) => {
                  (e.semver === s && (e = new n(">=0.0.0")),
                    (o = o || e),
                    (a = a || e),
                    f(e.semver, o.semver, d) ? (o = e) : m(e.semver, a.semver, d) && (a = e));
                }),
                o.operator === g || o.operator === v)
              )
                return !1;
              if ((!a.operator || a.operator === g) && p(e, a.semver)) return !1;
              if (a.operator === v && m(e, a.semver)) return !1;
            }
            return !0;
          };
        },
        5860: (e, t, i) => {
          "use strict";
          const r = i(7944);
          e.exports = (e, t, i = !1) => {
            if (e instanceof r) return e;
            try {
              return new r(e, t);
            } catch (e) {
              if (!i) return null;
              throw e;
            }
          };
        },
        5955: (e, t, i) => {
          "use strict";
          const r = i(7944);
          e.exports = (e, t, i, n, s) => {
            "string" == typeof i && ((s = n), (n = i), (i = void 0));
            try {
              return new r(e instanceof r ? e.version : e, i).inc(t, n, s).version;
            } catch (e) {
              return null;
            }
          };
        },
        5959: (e) => {
          "use strict";
          e.exports = o;
        },
        5986: (e, t, i) => {
          "use strict";
          const r = i(7944);
          e.exports = (e, t) => new r(e, t).minor;
        },
        6033: (e, t, i) => {
          "use strict";
          const r = i(2801);
          e.exports = (e, t) => e.sort((e, i) => r(i, e, t));
        },
        6089: (e) => {
          "use strict";
          e.exports = a;
        },
        6538: (e, t, i) => {
          "use strict";
          i.d(t, { M: () => n, W: () => o });
          var r = i(9851);
          function n(e) {
            const t = r.K3.parse(e),
              i = new Set(),
              n = t.cursor();
            do {
              if (n.type.is("VectorSelector") && n.firstChild()) {
                do {
                  n.type.is("Identifier") && s(e, n, i);
                } while (n.nextSibling());
                n.parent();
              }
            } while (n.next());
            return Array.from(i);
          }
          function s(e, t, i) {
            const r = e.slice(t.from, t.to);
            r && i.add(r);
          }
          function o(e, t) {
            if ("UnquotedLabelMatcher" !== e.name) return null;
            let i = "",
              r = "",
              n = "";
            for (let s = e.node.firstChild; s; s = s.nextSibling)
              "LabelName" === s.type.name
                ? (i = t.slice(s.from, s.to))
                : "MatchOp" === s.type.name
                  ? (r = t.slice(s.from, s.to))
                  : "StringLiteral" === s.type.name && (n = t.slice(s.from + 1, s.to - 1));
            return i && r ? { label: i, op: r, value: n } : null;
          }
        },
        6660: function (e, t, i) {
          var r;
          !(function (n, s) {
            "use strict";
            var o = "function",
              a = "undefined",
              l = "object",
              u = "string",
              c = "major",
              h = "model",
              d = "name",
              f = "type",
              p = "vendor",
              m = "version",
              g = "architecture",
              v = "console",
              b = "mobile",
              O = "tablet",
              w = "smarttv",
              $ = "wearable",
              y = "embedded",
              E = "Amazon",
              S = "Apple",
              x = "ASUS",
              k = "BlackBerry",
              P = "Browser",
              T = "Chrome",
              I = "Firefox",
              R = "Google",
              A = "Huawei",
              N = "LG",
              _ = "Microsoft",
              L = "Motorola",
              C = "Opera",
              Q = "Samsung",
              X = "Sharp",
              D = "Sony",
              U = "Xiaomi",
              M = "Zebra",
              j = "Facebook",
              F = "Chromium OS",
              z = "Mac OS",
              q = " Browser",
              H = function (e) {
                for (var t = {}, i = 0; i < e.length; i++) t[e[i].toUpperCase()] = e[i];
                return t;
              },
              B = function (e, t) {
                return typeof e === u && -1 !== G(t).indexOf(G(e));
              },
              G = function (e) {
                return e.toLowerCase();
              },
              V = function (e, t) {
                if (typeof e === u)
                  return ((e = e.replace(/^\s\s*/, "")), typeof t === a ? e : e.substring(0, 500));
              },
              Y = function (e, t) {
                for (var i, r, n, a, u, c, h = 0; h < t.length && !u; ) {
                  var d = t[h],
                    f = t[h + 1];
                  for (i = r = 0; i < d.length && !u && d[i]; )
                    if ((u = d[i++].exec(e)))
                      for (n = 0; n < f.length; n++)
                        ((c = u[++r]),
                          typeof (a = f[n]) === l && a.length > 0
                            ? 2 === a.length
                              ? typeof a[1] == o
                                ? (this[a[0]] = a[1].call(this, c))
                                : (this[a[0]] = a[1])
                              : 3 === a.length
                                ? typeof a[1] !== o || (a[1].exec && a[1].test)
                                  ? (this[a[0]] = c ? c.replace(a[1], a[2]) : s)
                                  : (this[a[0]] = c ? a[1].call(this, c, a[2]) : s)
                                : 4 === a.length &&
                                  (this[a[0]] = c ? a[3].call(this, c.replace(a[1], a[2])) : s)
                            : (this[a] = c || s));
                  h += 2;
                }
              },
              W = function (e, t) {
                for (var i in t)
                  if (typeof t[i] === l && t[i].length > 0) {
                    for (var r = 0; r < t[i].length; r++)
                      if (B(t[i][r], e)) return "?" === i ? s : i;
                  } else if (B(t[i], e)) return "?" === i ? s : i;
                return t.hasOwnProperty("*") ? t["*"] : e;
              },
              Z = {
                ME: "4.90",
                "NT 3.11": "NT3.51",
                "NT 4.0": "NT4.0",
                2e3: "NT 5.0",
                XP: ["NT 5.1", "NT 5.2"],
                Vista: "NT 6.0",
                7: "NT 6.1",
                8: "NT 6.2",
                8.1: "NT 6.3",
                10: ["NT 6.4", "NT 10.0"],
                RT: "ARM",
              },
              K = {
                browser: [
                  [/\b(?:crmo|crios)\/([\w\.]+)/i],
                  [m, [d, "Chrome"]],
                  [/edg(?:e|ios|a)?\/([\w\.]+)/i],
                  [m, [d, "Edge"]],
                  [
                    /(opera mini)\/([-\w\.]+)/i,
                    /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
                    /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i,
                  ],
                  [d, m],
                  [/opios[\/ ]+([\w\.]+)/i],
                  [m, [d, C + " Mini"]],
                  [/\bop(?:rg)?x\/([\w\.]+)/i],
                  [m, [d, C + " GX"]],
                  [/\bopr\/([\w\.]+)/i],
                  [m, [d, C]],
                  [/\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i],
                  [m, [d, "Baidu"]],
                  [/\b(?:mxbrowser|mxios|myie2)\/?([-\w\.]*)\b/i],
                  [m, [d, "Maxthon"]],
                  [
                    /(kindle)\/([\w\.]+)/i,
                    /(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i,
                    /(avant|iemobile|slim(?:browser|boat|jet))[\/ ]?([\d\.]*)/i,
                    /(?:ms|\()(ie) ([\w\.]+)/i,
                    /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio|(?=comodo_)?dragon)\/([-\w\.]+)/i,
                    /(heytap|ovi|115)browser\/([\d\.]+)/i,
                    /(weibo)__([\d\.]+)/i,
                  ],
                  [d, m],
                  [/quark(?:pc)?\/([-\w\.]+)/i],
                  [m, [d, "Quark"]],
                  [/\bddg\/([\w\.]+)/i],
                  [m, [d, "DuckDuckGo"]],
                  [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],
                  [m, [d, "UC" + P]],
                  [
                    /microm.+\bqbcore\/([\w\.]+)/i,
                    /\bqbcore\/([\w\.]+).+microm/i,
                    /micromessenger\/([\w\.]+)/i,
                  ],
                  [m, [d, "WeChat"]],
                  [/konqueror\/([\w\.]+)/i],
                  [m, [d, "Konqueror"]],
                  [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],
                  [m, [d, "IE"]],
                  [/ya(?:search)?browser\/([\w\.]+)/i],
                  [m, [d, "Yandex"]],
                  [/slbrowser\/([\w\.]+)/i],
                  [m, [d, "Smart Lenovo " + P]],
                  [/(avast|avg)\/([\w\.]+)/i],
                  [[d, /(.+)/, "$1 Secure " + P], m],
                  [/\bfocus\/([\w\.]+)/i],
                  [m, [d, I + " Focus"]],
                  [/\bopt\/([\w\.]+)/i],
                  [m, [d, C + " Touch"]],
                  [/coc_coc\w+\/([\w\.]+)/i],
                  [m, [d, "Coc Coc"]],
                  [/dolfin\/([\w\.]+)/i],
                  [m, [d, "Dolphin"]],
                  [/coast\/([\w\.]+)/i],
                  [m, [d, C + " Coast"]],
                  [/miuibrowser\/([\w\.]+)/i],
                  [m, [d, "MIUI" + q]],
                  [/fxios\/([\w\.-]+)/i],
                  [m, [d, I]],
                  [/\bqihoobrowser\/?([\w\.]*)/i],
                  [m, [d, "360"]],
                  [/\b(qq)\/([\w\.]+)/i],
                  [[d, /(.+)/, "$1Browser"], m],
                  [/(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i],
                  [[d, /(.+)/, "$1" + q], m],
                  [/samsungbrowser\/([\w\.]+)/i],
                  [m, [d, Q + " Internet"]],
                  [/metasr[\/ ]?([\d\.]+)/i],
                  [m, [d, "Sogou Explorer"]],
                  [/(sogou)mo\w+\/([\d\.]+)/i],
                  [[d, "Sogou Mobile"], m],
                  [
                    /(electron)\/([\w\.]+) safari/i,
                    /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
                    /m?(qqbrowser|2345(?=browser|chrome|explorer))\w*[\/ ]?v?([\w\.]+)/i,
                  ],
                  [d, m],
                  [/(lbbrowser|rekonq)/i, /\[(linkedin)app\]/i],
                  [d],
                  [/ome\/([\w\.]+) \w* ?(iron) saf/i, /ome\/([\w\.]+).+qihu (360)[es]e/i],
                  [m, d],
                  [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],
                  [[d, j], m],
                  [
                    /(Klarna)\/([\w\.]+)/i,
                    /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
                    /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
                    /safari (line)\/([\w\.]+)/i,
                    /\b(line)\/([\w\.]+)\/iab/i,
                    /(alipay)client\/([\w\.]+)/i,
                    /(twitter)(?:and| f.+e\/([\w\.]+))/i,
                    /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i,
                  ],
                  [d, m],
                  [/\bgsa\/([\w\.]+) .*safari\//i],
                  [m, [d, "GSA"]],
                  [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i],
                  [m, [d, "TikTok"]],
                  [/headlesschrome(?:\/([\w\.]+)| )/i],
                  [m, [d, T + " Headless"]],
                  [/ wv\).+(chrome)\/([\w\.]+)/i],
                  [[d, T + " WebView"], m],
                  [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],
                  [m, [d, "Android " + P]],
                  [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],
                  [d, m],
                  [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i],
                  [m, [d, "Mobile Safari"]],
                  [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i],
                  [m, d],
                  [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],
                  [
                    d,
                    [
                      m,
                      W,
                      {
                        "1.0": "/8",
                        1.2: "/1",
                        1.3: "/3",
                        "2.0": "/412",
                        "2.0.2": "/416",
                        "2.0.3": "/417",
                        "2.0.4": "/419",
                        "?": "/",
                      },
                    ],
                  ],
                  [/(webkit|khtml)\/([\w\.]+)/i],
                  [d, m],
                  [/(navigator|netscape\d?)\/([-\w\.]+)/i],
                  [[d, "Netscape"], m],
                  [/(wolvic|librewolf)\/([\w\.]+)/i],
                  [d, m],
                  [/mobile vr; rv:([\w\.]+)\).+firefox/i],
                  [m, [d, I + " Reality"]],
                  [
                    /ekiohf.+(flow)\/([\w\.]+)/i,
                    /(swiftfox)/i,
                    /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i,
                    /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
                    /(firefox)\/([\w\.]+)/i,
                    /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
                    /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
                    /(links) \(([\w\.]+)/i,
                  ],
                  [d, [m, /_/g, "."]],
                  [/(cobalt)\/([\w\.]+)/i],
                  [d, [m, /master.|lts./, ""]],
                ],
                cpu: [
                  [/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i],
                  [[g, "amd64"]],
                  [/(ia32(?=;))/i],
                  [[g, G]],
                  [/((?:i[346]|x)86)[;\)]/i],
                  [[g, "ia32"]],
                  [/\b(aarch64|arm(v?8e?l?|_?64))\b/i],
                  [[g, "arm64"]],
                  [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],
                  [[g, "armhf"]],
                  [/windows (ce|mobile); ppc;/i],
                  [[g, "arm"]],
                  [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i],
                  [[g, /ower/, "", G]],
                  [/(sun4\w)[;\)]/i],
                  [[g, "sparc"]],
                  [
                    /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i,
                  ],
                  [[g, G]],
                ],
                device: [
                  [
                    /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i,
                  ],
                  [h, [p, Q], [f, O]],
                  [
                    /\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
                    /samsung[- ]((?!sm-[lr])[-\w]+)/i,
                    /sec-(sgh\w+)/i,
                  ],
                  [h, [p, Q], [f, b]],
                  [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],
                  [h, [p, S], [f, b]],
                  [
                    /\((ipad);[-\w\),; ]+apple/i,
                    /applecoremedia\/[\w\.]+ \((ipad)/i,
                    /\b(ipad)\d\d?,\d\d?[;\]].+ios/i,
                  ],
                  [h, [p, S], [f, O]],
                  [/(macintosh);/i],
                  [h, [p, S]],
                  [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],
                  [h, [p, X], [f, b]],
                  [/(?:honor)([-\w ]+)[;\)]/i],
                  [h, [p, "Honor"], [f, b]],
                  [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i],
                  [h, [p, A], [f, O]],
                  [
                    /(?:huawei)([-\w ]+)[;\)]/i,
                    /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i,
                  ],
                  [h, [p, A], [f, b]],
                  [
                    /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
                    /\b; (\w+) build\/hm\1/i,
                    /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
                    /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
                    /oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,
                    /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i,
                  ],
                  [
                    [h, /_/g, " "],
                    [p, U],
                    [f, b],
                  ],
                  [
                    /oid[^\)]+; (2\d{4}(283|rpbf)[cgl])( bui|\))/i,
                    /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i,
                  ],
                  [
                    [h, /_/g, " "],
                    [p, U],
                    [f, O],
                  ],
                  [
                    /; (\w+) bui.+ oppo/i,
                    /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i,
                  ],
                  [h, [p, "OPPO"], [f, b]],
                  [/\b(opd2\d{3}a?) bui/i],
                  [h, [p, "OPPO"], [f, O]],
                  [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i],
                  [h, [p, "Vivo"], [f, b]],
                  [/\b(rmx[1-3]\d{3})(?: bui|;|\))/i],
                  [h, [p, "Realme"], [f, b]],
                  [
                    /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
                    /\bmot(?:orola)?[- ](\w*)/i,
                    /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i,
                  ],
                  [h, [p, L], [f, b]],
                  [/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
                  [h, [p, L], [f, O]],
                  [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],
                  [h, [p, N], [f, O]],
                  [
                    /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
                    /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
                    /\blg-?([\d\w]+) bui/i,
                  ],
                  [h, [p, N], [f, b]],
                  [
                    /(ideatab[-\w ]+)/i,
                    /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i,
                  ],
                  [h, [p, "Lenovo"], [f, O]],
                  [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i],
                  [
                    [h, /_/g, " "],
                    [p, "Nokia"],
                    [f, b],
                  ],
                  [/(pixel c)\b/i],
                  [h, [p, R], [f, O]],
                  [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],
                  [h, [p, R], [f, b]],
                  [
                    /droid.+; (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i,
                  ],
                  [h, [p, D], [f, b]],
                  [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
                  [
                    [h, "Xperia Tablet"],
                    [p, D],
                    [f, O],
                  ],
                  [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],
                  [h, [p, "OnePlus"], [f, b]],
                  [
                    /(alexa)webm/i,
                    /(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i,
                    /(kf[a-z]+)( bui|\)).+silk\//i,
                  ],
                  [h, [p, E], [f, O]],
                  [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],
                  [
                    [h, /(.+)/g, "Fire Phone $1"],
                    [p, E],
                    [f, b],
                  ],
                  [/(playbook);[-\w\),; ]+(rim)/i],
                  [h, p, [f, O]],
                  [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i],
                  [h, [p, k], [f, b]],
                  [
                    /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i,
                  ],
                  [h, [p, x], [f, O]],
                  [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
                  [h, [p, x], [f, b]],
                  [/(nexus 9)/i],
                  [h, [p, "HTC"], [f, O]],
                  [
                    /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
                    /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
                    /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i,
                  ],
                  [p, [h, /_/g, " "], [f, b]],
                  [
                    /droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])\w*(\)| bui)/i,
                  ],
                  [h, [p, "TCL"], [f, O]],
                  [/(itel) ((\w+))/i],
                  [[p, G], h, [f, W, { tablet: ["p10001l", "w7001"], "*": "mobile" }]],
                  [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],
                  [h, [p, "Acer"], [f, O]],
                  [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i],
                  [h, [p, "Meizu"], [f, b]],
                  [/; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i],
                  [h, [p, "Ulefone"], [f, b]],
                  [/; (energy ?\w+)(?: bui|\))/i, /; energizer ([\w ]+)(?: bui|\))/i],
                  [h, [p, "Energizer"], [f, b]],
                  [/; cat (b35);/i, /; (b15q?|s22 flip|s48c|s62 pro)(?: bui|\))/i],
                  [h, [p, "Cat"], [f, b]],
                  [/((?:new )?andromax[\w- ]+)(?: bui|\))/i],
                  [h, [p, "Smartfren"], [f, b]],
                  [/droid.+; (a(?:015|06[35]|142p?))/i],
                  [h, [p, "Nothing"], [f, b]],
                  [
                    /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno|micromax|advan)[-_ ]?([-\w]*)/i,
                    /; (imo) ((?!tab)[\w ]+?)(?: bui|\))/i,
                    /(hp) ([\w ]+\w)/i,
                    /(asus)-?(\w+)/i,
                    /(microsoft); (lumia[\w ]+)/i,
                    /(lenovo)[-_ ]?([-\w]+)/i,
                    /(jolla)/i,
                    /(oppo) ?([\w ]+) bui/i,
                  ],
                  [p, h, [f, b]],
                  [
                    /(imo) (tab \w+)/i,
                    /(kobo)\s(ereader|touch)/i,
                    /(archos) (gamepad2?)/i,
                    /(hp).+(touchpad(?!.+tablet)|tablet)/i,
                    /(kindle)\/([\w\.]+)/i,
                    /(nook)[\w ]+build\/(\w+)/i,
                    /(dell) (strea[kpr\d ]*[\dko])/i,
                    /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
                    /(trinity)[- ]*(t\d{3}) bui/i,
                    /(gigaset)[- ]+(q\w{1,9}) bui/i,
                    /(vodafone) ([\w ]+)(?:\)| bui)/i,
                  ],
                  [p, h, [f, O]],
                  [/(surface duo)/i],
                  [h, [p, _], [f, O]],
                  [/droid [\d\.]+; (fp\du?)(?: b|\))/i],
                  [h, [p, "Fairphone"], [f, b]],
                  [/(u304aa)/i],
                  [h, [p, "AT&T"], [f, b]],
                  [/\bsie-(\w*)/i],
                  [h, [p, "Siemens"], [f, b]],
                  [/\b(rct\w+) b/i],
                  [h, [p, "RCA"], [f, O]],
                  [/\b(venue[\d ]{2,7}) b/i],
                  [h, [p, "Dell"], [f, O]],
                  [/\b(q(?:mv|ta)\w+) b/i],
                  [h, [p, "Verizon"], [f, O]],
                  [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],
                  [h, [p, "Barnes & Noble"], [f, O]],
                  [/\b(tm\d{3}\w+) b/i],
                  [h, [p, "NuVision"], [f, O]],
                  [/\b(k88) b/i],
                  [h, [p, "ZTE"], [f, O]],
                  [/\b(nx\d{3}j) b/i],
                  [h, [p, "ZTE"], [f, b]],
                  [/\b(gen\d{3}) b.+49h/i],
                  [h, [p, "Swiss"], [f, b]],
                  [/\b(zur\d{3}) b/i],
                  [h, [p, "Swiss"], [f, O]],
                  [/\b((zeki)?tb.*\b) b/i],
                  [h, [p, "Zeki"], [f, O]],
                  [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i],
                  [[p, "Dragon Touch"], h, [f, O]],
                  [/\b(ns-?\w{0,9}) b/i],
                  [h, [p, "Insignia"], [f, O]],
                  [/\b((nxa|next)-?\w{0,9}) b/i],
                  [h, [p, "NextBook"], [f, O]],
                  [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],
                  [[p, "Voice"], h, [f, b]],
                  [/\b(lvtel\-)?(v1[12]) b/i],
                  [[p, "LvTel"], h, [f, b]],
                  [/\b(ph-1) /i],
                  [h, [p, "Essential"], [f, b]],
                  [/\b(v(100md|700na|7011|917g).*\b) b/i],
                  [h, [p, "Envizen"], [f, O]],
                  [/\b(trio[-\w\. ]+) b/i],
                  [h, [p, "MachSpeed"], [f, O]],
                  [/\btu_(1491) b/i],
                  [h, [p, "Rotor"], [f, O]],
                  [/(shield[\w ]+) b/i],
                  [h, [p, "Nvidia"], [f, O]],
                  [/(sprint) (\w+)/i],
                  [p, h, [f, b]],
                  [/(kin\.[onetw]{3})/i],
                  [
                    [h, /\./g, " "],
                    [p, _],
                    [f, b],
                  ],
                  [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],
                  [h, [p, M], [f, O]],
                  [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
                  [h, [p, M], [f, b]],
                  [/smart-tv.+(samsung)/i],
                  [p, [f, w]],
                  [/hbbtv.+maple;(\d+)/i],
                  [
                    [h, /^/, "SmartTV"],
                    [p, Q],
                    [f, w],
                  ],
                  [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],
                  [
                    [p, N],
                    [f, w],
                  ],
                  [/(apple) ?tv/i],
                  [p, [h, S + " TV"], [f, w]],
                  [/crkey/i],
                  [
                    [h, T + "cast"],
                    [p, R],
                    [f, w],
                  ],
                  [/droid.+aft(\w+)( bui|\))/i],
                  [h, [p, E], [f, w]],
                  [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i],
                  [h, [p, X], [f, w]],
                  [/(bravia[\w ]+)( bui|\))/i],
                  [h, [p, D], [f, w]],
                  [/(mitv-\w{5}) bui/i],
                  [h, [p, U], [f, w]],
                  [/Hbbtv.*(technisat) (.*);/i],
                  [p, h, [f, w]],
                  [
                    /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,
                    /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i,
                  ],
                  [
                    [p, V],
                    [h, V],
                    [f, w],
                  ],
                  [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],
                  [[f, w]],
                  [/(ouya)/i, /(nintendo) ([wids3utch]+)/i],
                  [p, h, [f, v]],
                  [/droid.+; (shield) bui/i],
                  [h, [p, "Nvidia"], [f, v]],
                  [/(playstation [345portablevi]+)/i],
                  [h, [p, D], [f, v]],
                  [/\b(xbox(?: one)?(?!; xbox))[\); ]/i],
                  [h, [p, _], [f, v]],
                  [/\b(sm-[lr]\d\d[05][fnuw]?s?)\b/i],
                  [h, [p, Q], [f, $]],
                  [/((pebble))app/i],
                  [p, h, [f, $]],
                  [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i],
                  [h, [p, S], [f, $]],
                  [/droid.+; (glass) \d/i],
                  [h, [p, R], [f, $]],
                  [/droid.+; (wt63?0{2,3})\)/i],
                  [h, [p, M], [f, $]],
                  [/droid.+; (glass) \d/i],
                  [h, [p, R], [f, $]],
                  [/(pico) (4|neo3(?: link|pro)?)/i],
                  [p, h, [f, $]],
                  [/; (quest( \d| pro)?)/i],
                  [h, [p, j], [f, $]],
                  [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],
                  [p, [f, y]],
                  [/(aeobc)\b/i],
                  [h, [p, E], [f, y]],
                  [/droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i],
                  [h, [f, b]],
                  [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],
                  [h, [f, O]],
                  [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],
                  [[f, O]],
                  [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i],
                  [[f, b]],
                  [/(android[-\w\. ]{0,9});.+buil/i],
                  [h, [p, "Generic"]],
                ],
                engine: [
                  [/windows.+ edge\/([\w\.]+)/i],
                  [m, [d, "EdgeHTML"]],
                  [/(arkweb)\/([\w\.]+)/i],
                  [d, m],
                  [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],
                  [m, [d, "Blink"]],
                  [
                    /(presto)\/([\w\.]+)/i,
                    /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna|servo)\/([\w\.]+)/i,
                    /ekioh(flow)\/([\w\.]+)/i,
                    /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
                    /(icab)[\/ ]([23]\.[\d\.]+)/i,
                    /\b(libweb)/i,
                  ],
                  [d, m],
                  [/rv\:([\w\.]{1,9})\b.+(gecko)/i],
                  [m, d],
                ],
                os: [
                  [/microsoft (windows) (vista|xp)/i],
                  [d, m],
                  [/(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i],
                  [d, [m, W, Z]],
                  [
                    /windows nt 6\.2; (arm)/i,
                    /windows[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,
                    /(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i,
                  ],
                  [
                    [m, W, Z],
                    [d, "Windows"],
                  ],
                  [
                    /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
                    /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
                    /cfnetwork\/.+darwin/i,
                  ],
                  [
                    [m, /_/g, "."],
                    [d, "iOS"],
                  ],
                  [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i],
                  [
                    [d, z],
                    [m, /_/g, "."],
                  ],
                  [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i],
                  [m, d],
                  [
                    /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish|openharmony)[-\/ ]?([\w\.]*)/i,
                    /(blackberry)\w*\/([\w\.]*)/i,
                    /(tizen|kaios)[\/ ]([\w\.]+)/i,
                    /\((series40);/i,
                  ],
                  [d, m],
                  [/\(bb(10);/i],
                  [m, [d, k]],
                  [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i],
                  [m, [d, "Symbian"]],
                  [
                    /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i,
                  ],
                  [m, [d, I + " OS"]],
                  [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],
                  [m, [d, "webOS"]],
                  [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i],
                  [m, [d, "watchOS"]],
                  [/crkey\/([\d\.]+)/i],
                  [m, [d, T + "cast"]],
                  [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i],
                  [[d, F], m],
                  [
                    /panasonic;(viera)/i,
                    /(netrange)mmh/i,
                    /(nettv)\/(\d+\.[\w\.]+)/i,
                    /(nintendo|playstation) ([wids345portablevuch]+)/i,
                    /(xbox); +xbox ([^\);]+)/i,
                    /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
                    /(mint)[\/\(\) ]?(\w*)/i,
                    /(mageia|vectorlinux)[; ]/i,
                    /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
                    /(hurd|linux) ?([\w\.]*)/i,
                    /(gnu) ?([\w\.]*)/i,
                    /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
                    /(haiku) (\w+)/i,
                  ],
                  [d, m],
                  [/(sunos) ?([\w\.\d]*)/i],
                  [[d, "Solaris"], m],
                  [
                    /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
                    /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
                    /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
                    /(unix) ?([\w\.]*)/i,
                  ],
                  [d, m],
                ],
              },
              J = function (e, t) {
                if ((typeof e === l && ((t = e), (e = s)), !(this instanceof J)))
                  return new J(e, t).getResult();
                var i = typeof n !== a && n.navigator ? n.navigator : s,
                  r = e || (i && i.userAgent ? i.userAgent : ""),
                  v = i && i.userAgentData ? i.userAgentData : s,
                  w = t
                    ? (function (e, t) {
                        var i = {};
                        for (var r in e)
                          t[r] && t[r].length % 2 == 0 ? (i[r] = t[r].concat(e[r])) : (i[r] = e[r]);
                        return i;
                      })(K, t)
                    : K,
                  $ = i && i.userAgent == r;
                return (
                  (this.getBrowser = function () {
                    var e,
                      t = {};
                    return (
                      (t[d] = s),
                      (t[m] = s),
                      Y.call(t, r, w.browser),
                      (t[c] =
                        typeof (e = t[m]) === u ? e.replace(/[^\d\.]/g, "").split(".")[0] : s),
                      $ && i && i.brave && typeof i.brave.isBrave == o && (t[d] = "Brave"),
                      t
                    );
                  }),
                  (this.getCPU = function () {
                    var e = {};
                    return ((e[g] = s), Y.call(e, r, w.cpu), e);
                  }),
                  (this.getDevice = function () {
                    var e = {};
                    return (
                      (e[p] = s),
                      (e[h] = s),
                      (e[f] = s),
                      Y.call(e, r, w.device),
                      $ && !e[f] && v && v.mobile && (e[f] = b),
                      $ &&
                        "Macintosh" == e[h] &&
                        i &&
                        typeof i.standalone !== a &&
                        i.maxTouchPoints &&
                        i.maxTouchPoints > 2 &&
                        ((e[h] = "iPad"), (e[f] = O)),
                      e
                    );
                  }),
                  (this.getEngine = function () {
                    var e = {};
                    return ((e[d] = s), (e[m] = s), Y.call(e, r, w.engine), e);
                  }),
                  (this.getOS = function () {
                    var e = {};
                    return (
                      (e[d] = s),
                      (e[m] = s),
                      Y.call(e, r, w.os),
                      $ &&
                        !e[d] &&
                        v &&
                        v.platform &&
                        "Unknown" != v.platform &&
                        (e[d] = v.platform.replace(/chrome os/i, F).replace(/macos/i, z)),
                      e
                    );
                  }),
                  (this.getResult = function () {
                    return {
                      ua: this.getUA(),
                      browser: this.getBrowser(),
                      engine: this.getEngine(),
                      os: this.getOS(),
                      device: this.getDevice(),
                      cpu: this.getCPU(),
                    };
                  }),
                  (this.getUA = function () {
                    return r;
                  }),
                  (this.setUA = function (e) {
                    return ((r = typeof e === u && e.length > 500 ? V(e, 500) : e), this);
                  }),
                  this.setUA(r),
                  this
                );
              };
            ((J.VERSION = "1.0.40"),
              (J.BROWSER = H([d, m, c])),
              (J.CPU = H([g])),
              (J.DEVICE = H([h, p, f, v, b, w, O, $, y])),
              (J.ENGINE = J.OS = H([d, m])),
              typeof t !== a
                ? (e.exports && (t = e.exports = J), (t.UAParser = J))
                : i.amdO
                  ? (r = function () {
                      return J;
                    }.call(t, i, t, e)) === s || (e.exports = r)
                  : typeof n !== a && (n.UAParser = J));
            var ee = typeof n !== a && (n.jQuery || n.Zepto);
            if (ee && !ee.ua) {
              var te = new J();
              ((ee.ua = te.getResult()),
                (ee.ua.get = function () {
                  return te.getUA();
                }),
                (ee.ua.set = function (e) {
                  te.setUA(e);
                  var t = te.getResult();
                  for (var i in t) ee.ua[i] = t[i];
                }));
            }
          })("object" == typeof window ? window : this);
        },
        6850: (e, t, i) => {
          "use strict";
          const { MAX_SAFE_COMPONENT_LENGTH: r, MAX_SAFE_BUILD_LENGTH: n, MAX_LENGTH: s } = i(9630),
            o = i(9796),
            a = ((t = e.exports = {}).re = []),
            l = (t.safeRe = []),
            u = (t.src = []),
            c = (t.safeSrc = []),
            h = (t.t = {});
          let d = 0;
          const f = "[a-zA-Z0-9-]",
            p = [
              ["\\s", 1],
              ["\\d", s],
              [f, n],
            ],
            m = (e, t, i) => {
              const r = ((e) => {
                  for (const [t, i] of p)
                    e = e.split(`${t}*`).join(`${t}{0,${i}}`).split(`${t}+`).join(`${t}{1,${i}}`);
                  return e;
                })(t),
                n = d++;
              (o(e, n, t),
                (h[e] = n),
                (u[n] = t),
                (c[n] = r),
                (a[n] = new RegExp(t, i ? "g" : void 0)),
                (l[n] = new RegExp(r, i ? "g" : void 0)));
            };
          (m("NUMERICIDENTIFIER", "0|[1-9]\\d*"),
            m("NUMERICIDENTIFIERLOOSE", "\\d+"),
            m("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${f}*`),
            m(
              "MAINVERSION",
              `(${u[h.NUMERICIDENTIFIER]})\\.(${u[h.NUMERICIDENTIFIER]})\\.(${u[h.NUMERICIDENTIFIER]})`,
            ),
            m(
              "MAINVERSIONLOOSE",
              `(${u[h.NUMERICIDENTIFIERLOOSE]})\\.(${u[h.NUMERICIDENTIFIERLOOSE]})\\.(${u[h.NUMERICIDENTIFIERLOOSE]})`,
            ),
            m("PRERELEASEIDENTIFIER", `(?:${u[h.NONNUMERICIDENTIFIER]}|${u[h.NUMERICIDENTIFIER]})`),
            m(
              "PRERELEASEIDENTIFIERLOOSE",
              `(?:${u[h.NONNUMERICIDENTIFIER]}|${u[h.NUMERICIDENTIFIERLOOSE]})`,
            ),
            m(
              "PRERELEASE",
              `(?:-(${u[h.PRERELEASEIDENTIFIER]}(?:\\.${u[h.PRERELEASEIDENTIFIER]})*))`,
            ),
            m(
              "PRERELEASELOOSE",
              `(?:-?(${u[h.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[h.PRERELEASEIDENTIFIERLOOSE]})*))`,
            ),
            m("BUILDIDENTIFIER", `${f}+`),
            m("BUILD", `(?:\\+(${u[h.BUILDIDENTIFIER]}(?:\\.${u[h.BUILDIDENTIFIER]})*))`),
            m("FULLPLAIN", `v?${u[h.MAINVERSION]}${u[h.PRERELEASE]}?${u[h.BUILD]}?`),
            m("FULL", `^${u[h.FULLPLAIN]}$`),
            m(
              "LOOSEPLAIN",
              `[v=\\s]*${u[h.MAINVERSIONLOOSE]}${u[h.PRERELEASELOOSE]}?${u[h.BUILD]}?`,
            ),
            m("LOOSE", `^${u[h.LOOSEPLAIN]}$`),
            m("GTLT", "((?:<|>)?=?)"),
            m("XRANGEIDENTIFIERLOOSE", `${u[h.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),
            m("XRANGEIDENTIFIER", `${u[h.NUMERICIDENTIFIER]}|x|X|\\*`),
            m(
              "XRANGEPLAIN",
              `[v=\\s]*(${u[h.XRANGEIDENTIFIER]})(?:\\.(${u[h.XRANGEIDENTIFIER]})(?:\\.(${u[h.XRANGEIDENTIFIER]})(?:${u[h.PRERELEASE]})?${u[h.BUILD]}?)?)?`,
            ),
            m(
              "XRANGEPLAINLOOSE",
              `[v=\\s]*(${u[h.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[h.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[h.XRANGEIDENTIFIERLOOSE]})(?:${u[h.PRERELEASELOOSE]})?${u[h.BUILD]}?)?)?`,
            ),
            m("XRANGE", `^${u[h.GTLT]}\\s*${u[h.XRANGEPLAIN]}$`),
            m("XRANGELOOSE", `^${u[h.GTLT]}\\s*${u[h.XRANGEPLAINLOOSE]}$`),
            m("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`),
            m("COERCE", `${u[h.COERCEPLAIN]}(?:$|[^\\d])`),
            m(
              "COERCEFULL",
              u[h.COERCEPLAIN] + `(?:${u[h.PRERELEASE]})?` + `(?:${u[h.BUILD]})?(?:$|[^\\d])`,
            ),
            m("COERCERTL", u[h.COERCE], !0),
            m("COERCERTLFULL", u[h.COERCEFULL], !0),
            m("LONETILDE", "(?:~>?)"),
            m("TILDETRIM", `(\\s*)${u[h.LONETILDE]}\\s+`, !0),
            (t.tildeTrimReplace = "$1~"),
            m("TILDE", `^${u[h.LONETILDE]}${u[h.XRANGEPLAIN]}$`),
            m("TILDELOOSE", `^${u[h.LONETILDE]}${u[h.XRANGEPLAINLOOSE]}$`),
            m("LONECARET", "(?:\\^)"),
            m("CARETTRIM", `(\\s*)${u[h.LONECARET]}\\s+`, !0),
            (t.caretTrimReplace = "$1^"),
            m("CARET", `^${u[h.LONECARET]}${u[h.XRANGEPLAIN]}$`),
            m("CARETLOOSE", `^${u[h.LONECARET]}${u[h.XRANGEPLAINLOOSE]}$`),
            m("COMPARATORLOOSE", `^${u[h.GTLT]}\\s*(${u[h.LOOSEPLAIN]})$|^$`),
            m("COMPARATOR", `^${u[h.GTLT]}\\s*(${u[h.FULLPLAIN]})$|^$`),
            m(
              "COMPARATORTRIM",
              `(\\s*)${u[h.GTLT]}\\s*(${u[h.LOOSEPLAIN]}|${u[h.XRANGEPLAIN]})`,
              !0,
            ),
            (t.comparatorTrimReplace = "$1$2$3"),
            m("HYPHENRANGE", `^\\s*(${u[h.XRANGEPLAIN]})\\s+-\\s+(${u[h.XRANGEPLAIN]})\\s*$`),
            m(
              "HYPHENRANGELOOSE",
              `^\\s*(${u[h.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[h.XRANGEPLAINLOOSE]})\\s*$`,
            ),
            m("STAR", "(<|>)?=?\\s*\\*"),
            m("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"),
            m("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$"));
        },
        6909: (e, t, i) => {
          "use strict";
          const r = i(5380);
          e.exports = (e, t, i) => 0 === r(e, t, i);
        },
        7023: (e, t, i) => {
          "use strict";
          const r = i(5380);
          e.exports = (e, t) => r(e, t, !0);
        },
        7092: (e, t, i) => {
          "use strict";
          const r = i(5380);
          e.exports = (e, t, i) => r(e, t, i) <= 0;
        },
        7095: (e) => {
          "use strict";
          const t = Object.freeze({ loose: !0 }),
            i = Object.freeze({});
          e.exports = (e) => (e ? ("object" != typeof e ? t : e) : i);
        },
        7203: (e, t, i) => {
          "use strict";
          i.d(t, {
            PH: () => p,
            Qj: () => f,
            Z6: () => u,
            cF: () => r,
            fI: () => c,
            iX: () => N,
            uY: () => o,
          });
          const r = 1024;
          let n = 0;
          class s {
            constructor(e, t) {
              ((this.from = e), (this.to = t));
            }
          }
          class o {
            constructor(e = {}) {
              ((this.id = n++),
                (this.perNode = !!e.perNode),
                (this.deserialize =
                  e.deserialize ||
                  (() => {
                    throw new Error("This node type doesn't define a deserialize function");
                  })),
                (this.combine = e.combine || null));
            }
            add(e) {
              if (this.perNode) throw new RangeError("Can't add per-node props to node types");
              return (
                "function" != typeof e && (e = u.match(e)),
                (t) => {
                  let i = e(t);
                  return void 0 === i ? null : [this, i];
                }
              );
            }
          }
          ((o.closedBy = new o({ deserialize: (e) => e.split(" ") })),
            (o.openedBy = new o({ deserialize: (e) => e.split(" ") })),
            (o.group = new o({ deserialize: (e) => e.split(" ") })),
            (o.isolate = new o({
              deserialize: (e) => {
                if (e && "rtl" != e && "ltr" != e && "auto" != e)
                  throw new RangeError("Invalid value for isolate: " + e);
                return e || "auto";
              },
            })),
            (o.contextHash = new o({ perNode: !0 })),
            (o.lookAhead = new o({ perNode: !0 })),
            (o.mounted = new o({ perNode: !0 })));
          class a {
            constructor(e, t, i) {
              ((this.tree = e), (this.overlay = t), (this.parser = i));
            }
            static get(e) {
              return e && e.props && e.props[o.mounted.id];
            }
          }
          const l = Object.create(null);
          class u {
            constructor(e, t, i, r = 0) {
              ((this.name = e), (this.props = t), (this.id = i), (this.flags = r));
            }
            static define(e) {
              let t = e.props && e.props.length ? Object.create(null) : l,
                i =
                  (e.top ? 1 : 0) |
                  (e.skipped ? 2 : 0) |
                  (e.error ? 4 : 0) |
                  (null == e.name ? 8 : 0),
                r = new u(e.name || "", t, e.id, i);
              if (e.props)
                for (let i of e.props)
                  if ((Array.isArray(i) || (i = i(r)), i)) {
                    if (i[0].perNode)
                      throw new RangeError("Can't store a per-node prop on a node type");
                    t[i[0].id] = i[1];
                  }
              return r;
            }
            prop(e) {
              return this.props[e.id];
            }
            get isTop() {
              return (1 & this.flags) > 0;
            }
            get isSkipped() {
              return (2 & this.flags) > 0;
            }
            get isError() {
              return (4 & this.flags) > 0;
            }
            get isAnonymous() {
              return (8 & this.flags) > 0;
            }
            is(e) {
              if ("string" == typeof e) {
                if (this.name == e) return !0;
                let t = this.prop(o.group);
                return !!t && t.indexOf(e) > -1;
              }
              return this.id == e;
            }
            static match(e) {
              let t = Object.create(null);
              for (let i in e) for (let r of i.split(" ")) t[r] = e[i];
              return (e) => {
                for (let i = e.prop(o.group), r = -1; r < (i ? i.length : 0); r++) {
                  let n = t[r < 0 ? e.name : i[r]];
                  if (n) return n;
                }
              };
            }
          }
          u.none = new u("", Object.create(null), 0, 8);
          class c {
            constructor(e) {
              this.types = e;
              for (let t = 0; t < e.length; t++)
                if (e[t].id != t)
                  throw new RangeError(
                    "Node type ids should correspond to array positions when creating a node set",
                  );
            }
            extend(...e) {
              let t = [];
              for (let i of this.types) {
                let r = null;
                for (let t of e) {
                  let e = t(i);
                  if (e) {
                    r || (r = Object.assign({}, i.props));
                    let t = e[1],
                      n = e[0];
                    (n.combine && n.id in r && (t = n.combine(r[n.id], t)), (r[n.id] = t));
                  }
                }
                t.push(r ? new u(i.name, r, i.id, i.flags) : i);
              }
              return new c(t);
            }
          }
          const h = new WeakMap(),
            d = new WeakMap();
          var f;
          !(function (e) {
            ((e[(e.ExcludeBuffers = 1)] = "ExcludeBuffers"),
              (e[(e.IncludeAnonymous = 2)] = "IncludeAnonymous"),
              (e[(e.IgnoreMounts = 4)] = "IgnoreMounts"),
              (e[(e.IgnoreOverlays = 8)] = "IgnoreOverlays"));
          })(f || (f = {}));
          class p {
            constructor(e, t, i, r, n) {
              if (
                ((this.type = e),
                (this.children = t),
                (this.positions = i),
                (this.length = r),
                (this.props = null),
                n && n.length)
              ) {
                this.props = Object.create(null);
                for (let [e, t] of n) this.props["number" == typeof e ? e : e.id] = t;
              }
            }
            toString() {
              let e = a.get(this);
              if (e && !e.overlay) return e.tree.toString();
              let t = "";
              for (let e of this.children) {
                let i = e.toString();
                i && (t && (t += ","), (t += i));
              }
              return this.type.name
                ? (/\W/.test(this.type.name) && !this.type.isError
                    ? JSON.stringify(this.type.name)
                    : this.type.name) + (t.length ? "(" + t + ")" : "")
                : t;
            }
            cursor(e = 0) {
              return new P(this.topNode, e);
            }
            cursorAt(e, t = 0, i = 0) {
              let r = h.get(this) || this.topNode,
                n = new P(r);
              return (n.moveTo(e, t), h.set(this, n._tree), n);
            }
            get topNode() {
              return new w(this, 0, 0, null);
            }
            resolve(e, t = 0) {
              let i = b(h.get(this) || this.topNode, e, t, !1);
              return (h.set(this, i), i);
            }
            resolveInner(e, t = 0) {
              let i = b(d.get(this) || this.topNode, e, t, !0);
              return (d.set(this, i), i);
            }
            resolveStack(e, t = 0) {
              return (function (e, t, i) {
                let r = e.resolveInner(t, i),
                  n = null;
                for (let e = r instanceof w ? r : r.context.parent; e; e = e.parent)
                  if (e.index < 0) {
                    let s = e.parent;
                    ((n || (n = [r])).push(s.resolve(t, i)), (e = s));
                  } else {
                    let s = a.get(e.tree);
                    if (
                      s &&
                      s.overlay &&
                      s.overlay[0].from <= t &&
                      s.overlay[s.overlay.length - 1].to >= t
                    ) {
                      let o = new w(s.tree, s.overlay[0].from + e.from, -1, e);
                      (n || (n = [r])).push(b(o, t, i, !1));
                    }
                  }
                return n ? x(n) : r;
              })(this, e, t);
            }
            iterate(e) {
              let { enter: t, leave: i, from: r = 0, to: n = this.length } = e,
                s = e.mode || 0,
                o = (s & f.IncludeAnonymous) > 0;
              for (let e = this.cursor(s | f.IncludeAnonymous); ; ) {
                let s = !1;
                if (e.from <= n && e.to >= r && ((!o && e.type.isAnonymous) || !1 !== t(e))) {
                  if (e.firstChild()) continue;
                  s = !0;
                }
                for (; s && i && (o || !e.type.isAnonymous) && i(e), !e.nextSibling(); ) {
                  if (!e.parent()) return;
                  s = !0;
                }
              }
            }
            prop(e) {
              return e.perNode ? (this.props ? this.props[e.id] : void 0) : this.type.prop(e);
            }
            get propValues() {
              let e = [];
              if (this.props) for (let t in this.props) e.push([+t, this.props[t]]);
              return e;
            }
            balance(e = {}) {
              return this.children.length <= 8
                ? this
                : A(
                    u.none,
                    this.children,
                    this.positions,
                    0,
                    this.children.length,
                    0,
                    this.length,
                    (e, t, i) => new p(this.type, e, t, i, this.propValues),
                    e.makeTree || ((e, t, i) => new p(u.none, e, t, i)),
                  );
            }
            static build(e) {
              return (function (e) {
                var t;
                let {
                    buffer: i,
                    nodeSet: n,
                    maxBufferLength: s = r,
                    reused: a = [],
                    minRepeatType: l = n.types.length,
                  } = e,
                  u = Array.isArray(i) ? new m(i, i.length) : i,
                  c = n.types,
                  h = 0,
                  d = 0;
                function f(e, t, i, r, o, p) {
                  let { id: m, start: E, end: S, size: x } = u,
                    k = d,
                    P = h;
                  if (x < 0) {
                    if ((u.next(), -1 == x)) {
                      let t = a[m];
                      return (i.push(t), void r.push(E - e));
                    }
                    if (-3 == x) return void (h = m);
                    if (-4 == x) return void (d = m);
                    throw new RangeError(`Unrecognized record size: ${x}`);
                  }
                  let T,
                    I,
                    R = c[m],
                    N = E - e;
                  if (S - E <= s && (I = $(u.pos - t, o))) {
                    let t = new Uint16Array(I.size - I.skip),
                      i = u.pos - I.size,
                      r = t.length;
                    for (; u.pos > i; ) r = y(I.start, t, r);
                    ((T = new g(t, S - I.start, n)), (N = I.start - e));
                  } else {
                    let e = u.pos - x;
                    u.next();
                    let t = [],
                      i = [],
                      r = m >= l ? m : -1,
                      n = 0,
                      o = S;
                    for (; u.pos > e; )
                      r >= 0 && u.id == r && u.size >= 0
                        ? (u.end <= o - s &&
                            (O(t, i, E, n, u.end, o, r, k, P), (n = t.length), (o = u.end)),
                          u.next())
                        : p > 2500
                          ? v(E, e, t, i)
                          : f(E, e, t, i, r, p + 1);
                    if (
                      (r >= 0 && n > 0 && n < t.length && O(t, i, E, n, E, o, r, k, P),
                      t.reverse(),
                      i.reverse(),
                      r > -1 && n > 0)
                    ) {
                      let e = b(R, P);
                      T = A(R, t, i, 0, t.length, 0, S - E, e, e);
                    } else T = w(R, t, i, S - E, k - S, P);
                  }
                  (i.push(T), r.push(N));
                }
                function v(e, t, i, r) {
                  let o = [],
                    a = 0,
                    l = -1;
                  for (; u.pos > t; ) {
                    let { id: e, start: t, end: i, size: r } = u;
                    if (r > 4) u.next();
                    else {
                      if (l > -1 && t < l) break;
                      (l < 0 && (l = i - s), o.push(e, t, i), a++, u.next());
                    }
                  }
                  if (a) {
                    let t = new Uint16Array(4 * a),
                      s = o[o.length - 2];
                    for (let e = o.length - 3, i = 0; e >= 0; e -= 3)
                      ((t[i++] = o[e]),
                        (t[i++] = o[e + 1] - s),
                        (t[i++] = o[e + 2] - s),
                        (t[i++] = i));
                    (i.push(new g(t, o[2] - s, n)), r.push(s - e));
                  }
                }
                function b(e, t) {
                  return (i, r, n) => {
                    let s,
                      a,
                      l = 0,
                      u = i.length - 1;
                    if (u >= 0 && (s = i[u]) instanceof p) {
                      if (!u && s.type == e && s.length == n) return s;
                      (a = s.prop(o.lookAhead)) && (l = r[u] + s.length + a);
                    }
                    return w(e, i, r, n, l, t);
                  };
                }
                function O(e, t, i, r, s, o, a, l, u) {
                  let c = [],
                    h = [];
                  for (; e.length > r; ) (c.push(e.pop()), h.push(t.pop() + i - s));
                  (e.push(w(n.types[a], c, h, o - s, l - o, u)), t.push(s - i));
                }
                function w(e, t, i, r, n, s, a) {
                  if (s) {
                    let e = [o.contextHash, s];
                    a = a ? [e].concat(a) : [e];
                  }
                  if (n > 25) {
                    let e = [o.lookAhead, n];
                    a = a ? [e].concat(a) : [e];
                  }
                  return new p(e, t, i, r, a);
                }
                function $(e, t) {
                  let i = u.fork(),
                    r = 0,
                    n = 0,
                    o = 0,
                    a = i.end - s,
                    c = { size: 0, start: 0, skip: 0 };
                  e: for (let s = i.pos - e; i.pos > s; ) {
                    let e = i.size;
                    if (i.id == t && e >= 0) {
                      ((c.size = r), (c.start = n), (c.skip = o), (o += 4), (r += 4), i.next());
                      continue;
                    }
                    let u = i.pos - e;
                    if (e < 0 || u < s || i.start < a) break;
                    let h = i.id >= l ? 4 : 0,
                      d = i.start;
                    for (i.next(); i.pos > u; ) {
                      if (i.size < 0) {
                        if (-3 != i.size) break e;
                        h += 4;
                      } else i.id >= l && (h += 4);
                      i.next();
                    }
                    ((n = d), (r += e), (o += h));
                  }
                  return (
                    (t < 0 || r == e) && ((c.size = r), (c.start = n), (c.skip = o)),
                    c.size > 4 ? c : void 0
                  );
                }
                function y(e, t, i) {
                  let { id: r, start: n, end: s, size: o } = u;
                  if ((u.next(), o >= 0 && r < l)) {
                    let a = i;
                    if (o > 4) {
                      let r = u.pos - (o - 4);
                      for (; u.pos > r; ) i = y(e, t, i);
                    }
                    ((t[--i] = a), (t[--i] = s - e), (t[--i] = n - e), (t[--i] = r));
                  } else -3 == o ? (h = r) : -4 == o && (d = r);
                  return i;
                }
                let E = [],
                  S = [];
                for (; u.pos > 0; ) f(e.start || 0, e.bufferStart || 0, E, S, -1, 0);
                let x =
                  null !== (t = e.length) && void 0 !== t ? t : E.length ? S[0] + E[0].length : 0;
                return new p(c[e.topID], E.reverse(), S.reverse(), x);
              })(e);
            }
          }
          p.empty = new p(u.none, [], [], 0);
          class m {
            constructor(e, t) {
              ((this.buffer = e), (this.index = t));
            }
            get id() {
              return this.buffer[this.index - 4];
            }
            get start() {
              return this.buffer[this.index - 3];
            }
            get end() {
              return this.buffer[this.index - 2];
            }
            get size() {
              return this.buffer[this.index - 1];
            }
            get pos() {
              return this.index;
            }
            next() {
              this.index -= 4;
            }
            fork() {
              return new m(this.buffer, this.index);
            }
          }
          class g {
            constructor(e, t, i) {
              ((this.buffer = e), (this.length = t), (this.set = i));
            }
            get type() {
              return u.none;
            }
            toString() {
              let e = [];
              for (let t = 0; t < this.buffer.length; )
                (e.push(this.childString(t)), (t = this.buffer[t + 3]));
              return e.join(",");
            }
            childString(e) {
              let t = this.buffer[e],
                i = this.buffer[e + 3],
                r = this.set.types[t],
                n = r.name;
              if ((/\W/.test(n) && !r.isError && (n = JSON.stringify(n)), i == (e += 4))) return n;
              let s = [];
              for (; e < i; ) (s.push(this.childString(e)), (e = this.buffer[e + 3]));
              return n + "(" + s.join(",") + ")";
            }
            findChild(e, t, i, r, n) {
              let { buffer: s } = this,
                o = -1;
              for (
                let a = e;
                a != t && !(v(n, r, s[a + 1], s[a + 2]) && ((o = a), i > 0));
                a = s[a + 3]
              );
              return o;
            }
            slice(e, t, i) {
              let r = this.buffer,
                n = new Uint16Array(t - e),
                s = 0;
              for (let o = e, a = 0; o < t; ) {
                ((n[a++] = r[o++]), (n[a++] = r[o++] - i));
                let t = (n[a++] = r[o++] - i);
                ((n[a++] = r[o++] - e), (s = Math.max(s, t)));
              }
              return new g(n, s, this.set);
            }
          }
          function v(e, t, i, r) {
            switch (e) {
              case -2:
                return i < t;
              case -1:
                return r >= t && i < t;
              case 0:
                return i < t && r > t;
              case 1:
                return i <= t && r > t;
              case 2:
                return r > t;
              case 4:
                return !0;
            }
          }
          function b(e, t, i, r) {
            for (
              var n;
              e.from == e.to ||
              (i < 1 ? e.from >= t : e.from > t) ||
              (i > -1 ? e.to <= t : e.to < t);

            ) {
              let t = !r && e instanceof w && e.index < 0 ? null : e.parent;
              if (!t) return e;
              e = t;
            }
            let s = r ? 0 : f.IgnoreOverlays;
            if (r)
              for (let r = e, o = r.parent; o; r = o, o = r.parent)
                r instanceof w &&
                  r.index < 0 &&
                  (null === (n = o.enter(t, i, s)) || void 0 === n ? void 0 : n.from) != r.from &&
                  (e = o);
            for (;;) {
              let r = e.enter(t, i, s);
              if (!r) return e;
              e = r;
            }
          }
          class O {
            cursor(e = 0) {
              return new P(this, e);
            }
            getChild(e, t = null, i = null) {
              let r = $(this, e, t, i);
              return r.length ? r[0] : null;
            }
            getChildren(e, t = null, i = null) {
              return $(this, e, t, i);
            }
            resolve(e, t = 0) {
              return b(this, e, t, !1);
            }
            resolveInner(e, t = 0) {
              return b(this, e, t, !0);
            }
            matchContext(e) {
              return y(this.parent, e);
            }
            enterUnfinishedNodesBefore(e) {
              let t = this.childBefore(e),
                i = this;
              for (; t; ) {
                let e = t.lastChild;
                if (!e || e.to != t.to) break;
                e.type.isError && e.from == e.to ? ((i = t), (t = e.prevSibling)) : (t = e);
              }
              return i;
            }
            get node() {
              return this;
            }
            get next() {
              return this.parent;
            }
          }
          class w extends O {
            constructor(e, t, i, r) {
              (super(), (this._tree = e), (this.from = t), (this.index = i), (this._parent = r));
            }
            get type() {
              return this._tree.type;
            }
            get name() {
              return this._tree.type.name;
            }
            get to() {
              return this.from + this._tree.length;
            }
            nextChild(e, t, i, r, n = 0) {
              for (let s = this; ; ) {
                for (
                  let { children: o, positions: l } = s._tree, u = t > 0 ? o.length : -1;
                  e != u;
                  e += t
                ) {
                  let u = o[e],
                    c = l[e] + s.from;
                  if (v(r, i, c, c + u.length))
                    if (u instanceof g) {
                      if (n & f.ExcludeBuffers) continue;
                      let o = u.findChild(0, u.buffer.length, t, i - c, r);
                      if (o > -1) return new S(new E(s, u, e, c), null, o);
                    } else if (n & f.IncludeAnonymous || !u.type.isAnonymous || T(u)) {
                      let o;
                      if (!(n & f.IgnoreMounts) && (o = a.get(u)) && !o.overlay)
                        return new w(o.tree, c, e, s);
                      let l = new w(u, c, e, s);
                      return n & f.IncludeAnonymous || !l.type.isAnonymous
                        ? l
                        : l.nextChild(t < 0 ? u.children.length - 1 : 0, t, i, r);
                    }
                }
                if (n & f.IncludeAnonymous || !s.type.isAnonymous) return null;
                if (
                  ((e = s.index >= 0 ? s.index + t : t < 0 ? -1 : s._parent._tree.children.length),
                  (s = s._parent),
                  !s)
                )
                  return null;
              }
            }
            get firstChild() {
              return this.nextChild(0, 1, 0, 4);
            }
            get lastChild() {
              return this.nextChild(this._tree.children.length - 1, -1, 0, 4);
            }
            childAfter(e) {
              return this.nextChild(0, 1, e, 2);
            }
            childBefore(e) {
              return this.nextChild(this._tree.children.length - 1, -1, e, -2);
            }
            enter(e, t, i = 0) {
              let r;
              if (!(i & f.IgnoreOverlays) && (r = a.get(this._tree)) && r.overlay) {
                let i = e - this.from;
                for (let { from: e, to: n } of r.overlay)
                  if ((t > 0 ? e <= i : e < i) && (t < 0 ? n >= i : n > i))
                    return new w(r.tree, r.overlay[0].from + this.from, -1, this);
              }
              return this.nextChild(0, 1, e, t, i);
            }
            nextSignificantParent() {
              let e = this;
              for (; e.type.isAnonymous && e._parent; ) e = e._parent;
              return e;
            }
            get parent() {
              return this._parent ? this._parent.nextSignificantParent() : null;
            }
            get nextSibling() {
              return this._parent && this.index >= 0
                ? this._parent.nextChild(this.index + 1, 1, 0, 4)
                : null;
            }
            get prevSibling() {
              return this._parent && this.index >= 0
                ? this._parent.nextChild(this.index - 1, -1, 0, 4)
                : null;
            }
            get tree() {
              return this._tree;
            }
            toTree() {
              return this._tree;
            }
            toString() {
              return this._tree.toString();
            }
          }
          function $(e, t, i, r) {
            let n = e.cursor(),
              s = [];
            if (!n.firstChild()) return s;
            if (null != i)
              for (let e = !1; !e; ) if (((e = n.type.is(i)), !n.nextSibling())) return s;
            for (;;) {
              if (null != r && n.type.is(r)) return s;
              if ((n.type.is(t) && s.push(n.node), !n.nextSibling())) return null == r ? s : [];
            }
          }
          function y(e, t, i = t.length - 1) {
            for (let r = e; i >= 0; r = r.parent) {
              if (!r) return !1;
              if (!r.type.isAnonymous) {
                if (t[i] && t[i] != r.name) return !1;
                i--;
              }
            }
            return !0;
          }
          class E {
            constructor(e, t, i, r) {
              ((this.parent = e), (this.buffer = t), (this.index = i), (this.start = r));
            }
          }
          class S extends O {
            get name() {
              return this.type.name;
            }
            get from() {
              return this.context.start + this.context.buffer.buffer[this.index + 1];
            }
            get to() {
              return this.context.start + this.context.buffer.buffer[this.index + 2];
            }
            constructor(e, t, i) {
              (super(),
                (this.context = e),
                (this._parent = t),
                (this.index = i),
                (this.type = e.buffer.set.types[e.buffer.buffer[i]]));
            }
            child(e, t, i) {
              let { buffer: r } = this.context,
                n = r.findChild(
                  this.index + 4,
                  r.buffer[this.index + 3],
                  e,
                  t - this.context.start,
                  i,
                );
              return n < 0 ? null : new S(this.context, this, n);
            }
            get firstChild() {
              return this.child(1, 0, 4);
            }
            get lastChild() {
              return this.child(-1, 0, 4);
            }
            childAfter(e) {
              return this.child(1, e, 2);
            }
            childBefore(e) {
              return this.child(-1, e, -2);
            }
            enter(e, t, i = 0) {
              if (i & f.ExcludeBuffers) return null;
              let { buffer: r } = this.context,
                n = r.findChild(
                  this.index + 4,
                  r.buffer[this.index + 3],
                  t > 0 ? 1 : -1,
                  e - this.context.start,
                  t,
                );
              return n < 0 ? null : new S(this.context, this, n);
            }
            get parent() {
              return this._parent || this.context.parent.nextSignificantParent();
            }
            externalSibling(e) {
              return this._parent
                ? null
                : this.context.parent.nextChild(this.context.index + e, e, 0, 4);
            }
            get nextSibling() {
              let { buffer: e } = this.context,
                t = e.buffer[this.index + 3];
              return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length)
                ? new S(this.context, this._parent, t)
                : this.externalSibling(1);
            }
            get prevSibling() {
              let { buffer: e } = this.context,
                t = this._parent ? this._parent.index + 4 : 0;
              return this.index == t
                ? this.externalSibling(-1)
                : new S(this.context, this._parent, e.findChild(t, this.index, -1, 0, 4));
            }
            get tree() {
              return null;
            }
            toTree() {
              let e = [],
                t = [],
                { buffer: i } = this.context,
                r = this.index + 4,
                n = i.buffer[this.index + 3];
              if (n > r) {
                let s = i.buffer[this.index + 1];
                (e.push(i.slice(r, n, s)), t.push(0));
              }
              return new p(this.type, e, t, this.to - this.from);
            }
            toString() {
              return this.context.buffer.childString(this.index);
            }
          }
          function x(e) {
            if (!e.length) return null;
            let t = 0,
              i = e[0];
            for (let r = 1; r < e.length; r++) {
              let n = e[r];
              (n.from > i.from || n.to < i.to) && ((i = n), (t = r));
            }
            let r = i instanceof w && i.index < 0 ? null : i.parent,
              n = e.slice();
            return (r ? (n[t] = r) : n.splice(t, 1), new k(n, i));
          }
          class k {
            constructor(e, t) {
              ((this.heads = e), (this.node = t));
            }
            get next() {
              return x(this.heads);
            }
          }
          class P {
            get name() {
              return this.type.name;
            }
            constructor(e, t = 0) {
              if (
                ((this.mode = t),
                (this.buffer = null),
                (this.stack = []),
                (this.index = 0),
                (this.bufferNode = null),
                e instanceof w)
              )
                this.yieldNode(e);
              else {
                ((this._tree = e.context.parent), (this.buffer = e.context));
                for (let t = e._parent; t; t = t._parent) this.stack.unshift(t.index);
                ((this.bufferNode = e), this.yieldBuf(e.index));
              }
            }
            yieldNode(e) {
              return (
                !!e &&
                ((this._tree = e), (this.type = e.type), (this.from = e.from), (this.to = e.to), !0)
              );
            }
            yieldBuf(e, t) {
              this.index = e;
              let { start: i, buffer: r } = this.buffer;
              return (
                (this.type = t || r.set.types[r.buffer[e]]),
                (this.from = i + r.buffer[e + 1]),
                (this.to = i + r.buffer[e + 2]),
                !0
              );
            }
            yield(e) {
              return (
                !!e &&
                (e instanceof w
                  ? ((this.buffer = null), this.yieldNode(e))
                  : ((this.buffer = e.context), this.yieldBuf(e.index, e.type)))
              );
            }
            toString() {
              return this.buffer
                ? this.buffer.buffer.childString(this.index)
                : this._tree.toString();
            }
            enterChild(e, t, i) {
              if (!this.buffer)
                return this.yield(
                  this._tree.nextChild(
                    e < 0 ? this._tree._tree.children.length - 1 : 0,
                    e,
                    t,
                    i,
                    this.mode,
                  ),
                );
              let { buffer: r } = this.buffer,
                n = r.findChild(
                  this.index + 4,
                  r.buffer[this.index + 3],
                  e,
                  t - this.buffer.start,
                  i,
                );
              return !(n < 0) && (this.stack.push(this.index), this.yieldBuf(n));
            }
            firstChild() {
              return this.enterChild(1, 0, 4);
            }
            lastChild() {
              return this.enterChild(-1, 0, 4);
            }
            childAfter(e) {
              return this.enterChild(1, e, 2);
            }
            childBefore(e) {
              return this.enterChild(-1, e, -2);
            }
            enter(e, t, i = this.mode) {
              return this.buffer
                ? !(i & f.ExcludeBuffers) && this.enterChild(1, e, t)
                : this.yield(this._tree.enter(e, t, i));
            }
            parent() {
              if (!this.buffer)
                return this.yieldNode(
                  this.mode & f.IncludeAnonymous ? this._tree._parent : this._tree.parent,
                );
              if (this.stack.length) return this.yieldBuf(this.stack.pop());
              let e =
                this.mode & f.IncludeAnonymous
                  ? this.buffer.parent
                  : this.buffer.parent.nextSignificantParent();
              return ((this.buffer = null), this.yieldNode(e));
            }
            sibling(e) {
              if (!this.buffer)
                return (
                  !!this._tree._parent &&
                  this.yield(
                    this._tree.index < 0
                      ? null
                      : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode),
                  )
                );
              let { buffer: t } = this.buffer,
                i = this.stack.length - 1;
              if (e < 0) {
                let e = i < 0 ? 0 : this.stack[i] + 4;
                if (this.index != e) return this.yieldBuf(t.findChild(e, this.index, -1, 0, 4));
              } else {
                let e = t.buffer[this.index + 3];
                if (e < (i < 0 ? t.buffer.length : t.buffer[this.stack[i] + 3]))
                  return this.yieldBuf(e);
              }
              return (
                i < 0 &&
                this.yield(this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode))
              );
            }
            nextSibling() {
              return this.sibling(1);
            }
            prevSibling() {
              return this.sibling(-1);
            }
            atLastNode(e) {
              let t,
                i,
                { buffer: r } = this;
              if (r) {
                if (e > 0) {
                  if (this.index < r.buffer.buffer.length) return !1;
                } else
                  for (let e = 0; e < this.index; e++)
                    if (r.buffer.buffer[e + 3] < this.index) return !1;
                ({ index: t, parent: i } = r);
              } else ({ index: t, _parent: i } = this._tree);
              for (; i; { index: t, _parent: i } = i)
                if (t > -1)
                  for (let r = t + e, n = e < 0 ? -1 : i._tree.children.length; r != n; r += e) {
                    let e = i._tree.children[r];
                    if (
                      this.mode & f.IncludeAnonymous ||
                      e instanceof g ||
                      !e.type.isAnonymous ||
                      T(e)
                    )
                      return !1;
                  }
              return !0;
            }
            move(e, t) {
              if (t && this.enterChild(e, 0, 4)) return !0;
              for (;;) {
                if (this.sibling(e)) return !0;
                if (this.atLastNode(e) || !this.parent()) return !1;
              }
            }
            next(e = !0) {
              return this.move(1, e);
            }
            prev(e = !0) {
              return this.move(-1, e);
            }
            moveTo(e, t = 0) {
              for (
                ;
                (this.from == this.to ||
                  (t < 1 ? this.from >= e : this.from > e) ||
                  (t > -1 ? this.to <= e : this.to < e)) &&
                this.parent();

              );
              for (; this.enterChild(1, e, t); );
              return this;
            }
            get node() {
              if (!this.buffer) return this._tree;
              let e = this.bufferNode,
                t = null,
                i = 0;
              if (e && e.context == this.buffer)
                e: for (let r = this.index, n = this.stack.length; n >= 0; ) {
                  for (let s = e; s; s = s._parent)
                    if (s.index == r) {
                      if (r == this.index) return s;
                      ((t = s), (i = n + 1));
                      break e;
                    }
                  r = this.stack[--n];
                }
              for (let e = i; e < this.stack.length; e++) t = new S(this.buffer, t, this.stack[e]);
              return (this.bufferNode = new S(this.buffer, t, this.index));
            }
            get tree() {
              return this.buffer ? null : this._tree._tree;
            }
            iterate(e, t) {
              for (let i = 0; ; ) {
                let r = !1;
                if (this.type.isAnonymous || !1 !== e(this)) {
                  if (this.firstChild()) {
                    i++;
                    continue;
                  }
                  this.type.isAnonymous || (r = !0);
                }
                for (;;) {
                  if ((r && t && t(this), (r = this.type.isAnonymous), !i)) return;
                  if (this.nextSibling()) break;
                  (this.parent(), i--, (r = !0));
                }
              }
            }
            matchContext(e) {
              if (!this.buffer) return y(this.node.parent, e);
              let { buffer: t } = this.buffer,
                { types: i } = t.set;
              for (let r = e.length - 1, n = this.stack.length - 1; r >= 0; n--) {
                if (n < 0) return y(this._tree, e, r);
                let s = i[t.buffer[this.stack[n]]];
                if (!s.isAnonymous) {
                  if (e[r] && e[r] != s.name) return !1;
                  r--;
                }
              }
              return !0;
            }
          }
          function T(e) {
            return e.children.some((e) => e instanceof g || !e.type.isAnonymous || T(e));
          }
          const I = new WeakMap();
          function R(e, t) {
            if (!e.isAnonymous || t instanceof g || t.type != e) return 1;
            let i = I.get(t);
            if (null == i) {
              i = 1;
              for (let r of t.children) {
                if (r.type != e || !(r instanceof p)) {
                  i = 1;
                  break;
                }
                i += R(e, r);
              }
              I.set(t, i);
            }
            return i;
          }
          function A(e, t, i, r, n, s, o, a, l) {
            let u = 0;
            for (let i = r; i < n; i++) u += R(e, t[i]);
            let c = Math.ceil((1.5 * u) / 8),
              h = [],
              d = [];
            return (
              (function t(i, r, n, o, a) {
                for (let u = n; u < o; ) {
                  let n = u,
                    f = r[u],
                    p = R(e, i[u]);
                  for (u++; u < o; u++) {
                    let t = R(e, i[u]);
                    if (p + t >= c) break;
                    p += t;
                  }
                  if (u == n + 1) {
                    if (p > c) {
                      let e = i[n];
                      t(e.children, e.positions, 0, e.children.length, r[n] + a);
                      continue;
                    }
                    h.push(i[n]);
                  } else {
                    let t = r[u - 1] + i[u - 1].length - f;
                    h.push(A(e, i, r, n, u, f, t, null, l));
                  }
                  d.push(f + a - s);
                }
              })(t, i, r, n, 0),
              (a || l)(h, d, o)
            );
          }
          class N {
            startParse(e, t, i) {
              return (
                "string" == typeof e && (e = new _(e)),
                (i = i
                  ? i.length
                    ? i.map((e) => new s(e.from, e.to))
                    : [new s(0, 0)]
                  : [new s(0, e.length)]),
                this.createParse(e, t || [], i)
              );
            }
            parse(e, t, i) {
              let r = this.startParse(e, t, i);
              for (;;) {
                let e = r.advance();
                if (e) return e;
              }
            }
          }
          class _ {
            constructor(e) {
              this.string = e;
            }
            get length() {
              return this.string.length;
            }
            chunk(e) {
              return this.string.slice(e);
            }
            get lineChunks() {
              return !1;
            }
            read(e, t) {
              return this.string.slice(e, t);
            }
          }
          new o({ perNode: !0 });
        },
        7494: (e, t, i) => {
          "use strict";
          const r = i(8395);
          e.exports = (e, t) => {
            try {
              return new r(e, t).range || "*";
            } catch (e) {
              return null;
            }
          };
        },
        7645: (e, t, i) => {
          "use strict";
          const r = i(5860);
          e.exports = (e, t) => {
            const i = r(e, t);
            return i ? i.version : null;
          };
        },
        7659: (e, t, i) => {
          "use strict";
          const r = i(5380);
          e.exports = (e, t, i) => 0 !== r(e, t, i);
        },
        7781: (e) => {
          "use strict";
          e.exports = l;
        },
        7840: (e, t, i) => {
          "use strict";
          const r = i(7944),
            n = i(8395);
          e.exports = (e, t, i) => {
            let s = null,
              o = null,
              a = null;
            try {
              a = new n(t, i);
            } catch (e) {
              return null;
            }
            return (
              e.forEach((e) => {
                a.test(e) && ((s && -1 !== o.compare(e)) || ((s = e), (o = new r(s, i))));
              }),
              s
            );
          };
        },
        7871: (e, t, i) => {
          "use strict";
          const r = i(5463);
          e.exports = (e, t, i) => r(e, t, ">", i);
        },
        7930: (e, t, i) => {
          "use strict";
          const r = i(7944),
            n = i(8395);
          e.exports = (e, t, i) => {
            let s = null,
              o = null,
              a = null;
            try {
              a = new n(t, i);
            } catch (e) {
              return null;
            }
            return (
              e.forEach((e) => {
                a.test(e) && ((s && 1 !== o.compare(e)) || ((s = e), (o = new r(s, i))));
              }),
              s
            );
          };
        },
        7944: (e, t, i) => {
          "use strict";
          const r = i(9796),
            { MAX_LENGTH: n, MAX_SAFE_INTEGER: s } = i(9630),
            { safeRe: o, t: a } = i(6850),
            l = i(7095),
            { compareIdentifiers: u } = i(4031);
          class c {
            constructor(e, t) {
              if (((t = l(t)), e instanceof c)) {
                if (e.loose === !!t.loose && e.includePrerelease === !!t.includePrerelease)
                  return e;
                e = e.version;
              } else if ("string" != typeof e)
                throw new TypeError(`Invalid version. Must be a string. Got type "${typeof e}".`);
              if (e.length > n) throw new TypeError(`version is longer than ${n} characters`);
              (r("SemVer", e, t),
                (this.options = t),
                (this.loose = !!t.loose),
                (this.includePrerelease = !!t.includePrerelease));
              const i = e.trim().match(t.loose ? o[a.LOOSE] : o[a.FULL]);
              if (!i) throw new TypeError(`Invalid Version: ${e}`);
              if (
                ((this.raw = e),
                (this.major = +i[1]),
                (this.minor = +i[2]),
                (this.patch = +i[3]),
                this.major > s || this.major < 0)
              )
                throw new TypeError("Invalid major version");
              if (this.minor > s || this.minor < 0) throw new TypeError("Invalid minor version");
              if (this.patch > s || this.patch < 0) throw new TypeError("Invalid patch version");
              (i[4]
                ? (this.prerelease = i[4].split(".").map((e) => {
                    if (/^[0-9]+$/.test(e)) {
                      const t = +e;
                      if (t >= 0 && t < s) return t;
                    }
                    return e;
                  }))
                : (this.prerelease = []),
                (this.build = i[5] ? i[5].split(".") : []),
                this.format());
            }
            format() {
              return (
                (this.version = `${this.major}.${this.minor}.${this.patch}`),
                this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`),
                this.version
              );
            }
            toString() {
              return this.version;
            }
            compare(e) {
              if ((r("SemVer.compare", this.version, this.options, e), !(e instanceof c))) {
                if ("string" == typeof e && e === this.version) return 0;
                e = new c(e, this.options);
              }
              return e.version === this.version ? 0 : this.compareMain(e) || this.comparePre(e);
            }
            compareMain(e) {
              return (
                e instanceof c || (e = new c(e, this.options)),
                this.major < e.major
                  ? -1
                  : this.major > e.major
                    ? 1
                    : this.minor < e.minor
                      ? -1
                      : this.minor > e.minor
                        ? 1
                        : this.patch < e.patch
                          ? -1
                          : this.patch > e.patch
                            ? 1
                            : 0
              );
            }
            comparePre(e) {
              if (
                (e instanceof c || (e = new c(e, this.options)),
                this.prerelease.length && !e.prerelease.length)
              )
                return -1;
              if (!this.prerelease.length && e.prerelease.length) return 1;
              if (!this.prerelease.length && !e.prerelease.length) return 0;
              let t = 0;
              do {
                const i = this.prerelease[t],
                  n = e.prerelease[t];
                if ((r("prerelease compare", t, i, n), void 0 === i && void 0 === n)) return 0;
                if (void 0 === n) return 1;
                if (void 0 === i) return -1;
                if (i !== n) return u(i, n);
              } while (++t);
            }
            compareBuild(e) {
              e instanceof c || (e = new c(e, this.options));
              let t = 0;
              do {
                const i = this.build[t],
                  n = e.build[t];
                if ((r("build compare", t, i, n), void 0 === i && void 0 === n)) return 0;
                if (void 0 === n) return 1;
                if (void 0 === i) return -1;
                if (i !== n) return u(i, n);
              } while (++t);
            }
            inc(e, t, i) {
              if (e.startsWith("pre")) {
                if (!t && !1 === i)
                  throw new Error("invalid increment argument: identifier is empty");
                if (t) {
                  const e = `-${t}`.match(
                    this.options.loose ? o[a.PRERELEASELOOSE] : o[a.PRERELEASE],
                  );
                  if (!e || e[1] !== t) throw new Error(`invalid identifier: ${t}`);
                }
              }
              switch (e) {
                case "premajor":
                  ((this.prerelease.length = 0),
                    (this.patch = 0),
                    (this.minor = 0),
                    this.major++,
                    this.inc("pre", t, i));
                  break;
                case "preminor":
                  ((this.prerelease.length = 0),
                    (this.patch = 0),
                    this.minor++,
                    this.inc("pre", t, i));
                  break;
                case "prepatch":
                  ((this.prerelease.length = 0), this.inc("patch", t, i), this.inc("pre", t, i));
                  break;
                case "prerelease":
                  (0 === this.prerelease.length && this.inc("patch", t, i), this.inc("pre", t, i));
                  break;
                case "release":
                  if (0 === this.prerelease.length)
                    throw new Error(`version ${this.raw} is not a prerelease`);
                  this.prerelease.length = 0;
                  break;
                case "major":
                  ((0 === this.minor && 0 === this.patch && 0 !== this.prerelease.length) ||
                    this.major++,
                    (this.minor = 0),
                    (this.patch = 0),
                    (this.prerelease = []));
                  break;
                case "minor":
                  ((0 === this.patch && 0 !== this.prerelease.length) || this.minor++,
                    (this.patch = 0),
                    (this.prerelease = []));
                  break;
                case "patch":
                  (0 === this.prerelease.length && this.patch++, (this.prerelease = []));
                  break;
                case "pre": {
                  const e = Number(i) ? 1 : 0;
                  if (0 === this.prerelease.length) this.prerelease = [e];
                  else {
                    let r = this.prerelease.length;
                    for (; --r >= 0; )
                      "number" == typeof this.prerelease[r] && (this.prerelease[r]++, (r = -2));
                    if (-1 === r) {
                      if (t === this.prerelease.join(".") && !1 === i)
                        throw new Error("invalid increment argument: identifier already exists");
                      this.prerelease.push(e);
                    }
                  }
                  if (t) {
                    let r = [t, e];
                    (!1 === i && (r = [t]),
                      0 === u(this.prerelease[0], t)
                        ? isNaN(this.prerelease[1]) && (this.prerelease = r)
                        : (this.prerelease = r));
                  }
                  break;
                }
                default:
                  throw new Error(`invalid increment argument: ${e}`);
              }
              return (
                (this.raw = this.format()),
                this.build.length && (this.raw += `+${this.build.join(".")}`),
                this
              );
            }
          }
          e.exports = c;
        },
        7994: (e, t, i) => {
          "use strict";
          const r = i(5860);
          e.exports = (e, t) => {
            const i = r(e.trim().replace(/^[=v]+/, ""), t);
            return i ? i.version : null;
          };
        },
        8395: (e, t, i) => {
          "use strict";
          const r = /\s+/g;
          class n {
            constructor(e, t) {
              if (((t = o(t)), e instanceof n))
                return e.loose === !!t.loose && e.includePrerelease === !!t.includePrerelease
                  ? e
                  : new n(e.raw, t);
              if (e instanceof a)
                return ((this.raw = e.value), (this.set = [[e]]), (this.formatted = void 0), this);
              if (
                ((this.options = t),
                (this.loose = !!t.loose),
                (this.includePrerelease = !!t.includePrerelease),
                (this.raw = e.trim().replace(r, " ")),
                (this.set = this.raw
                  .split("||")
                  .map((e) => this.parseRange(e.trim()))
                  .filter((e) => e.length)),
                !this.set.length)
              )
                throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
              if (this.set.length > 1) {
                const e = this.set[0];
                if (((this.set = this.set.filter((e) => !v(e[0]))), 0 === this.set.length))
                  this.set = [e];
                else if (this.set.length > 1)
                  for (const e of this.set)
                    if (1 === e.length && b(e[0])) {
                      this.set = [e];
                      break;
                    }
              }
              this.formatted = void 0;
            }
            get range() {
              if (void 0 === this.formatted) {
                this.formatted = "";
                for (let e = 0; e < this.set.length; e++) {
                  e > 0 && (this.formatted += "||");
                  const t = this.set[e];
                  for (let e = 0; e < t.length; e++)
                    (e > 0 && (this.formatted += " "), (this.formatted += t[e].toString().trim()));
                }
              }
              return this.formatted;
            }
            format() {
              return this.range;
            }
            toString() {
              return this.range;
            }
            parseRange(e) {
              const t =
                  ((this.options.includePrerelease && m) | (this.options.loose && g)) + ":" + e,
                i = s.get(t);
              if (i) return i;
              const r = this.options.loose,
                n = r ? c[h.HYPHENRANGELOOSE] : c[h.HYPHENRANGE];
              ((e = e.replace(n, R(this.options.includePrerelease))),
                l("hyphen replace", e),
                (e = e.replace(c[h.COMPARATORTRIM], d)),
                l("comparator trim", e),
                (e = e.replace(c[h.TILDETRIM], f)),
                l("tilde trim", e),
                (e = e.replace(c[h.CARETTRIM], p)),
                l("caret trim", e));
              let o = e
                .split(" ")
                .map((e) => w(e, this.options))
                .join(" ")
                .split(/\s+/)
                .map((e) => I(e, this.options));
              (r &&
                (o = o.filter(
                  (e) => (
                    l("loose invalid filter", e, this.options),
                    !!e.match(c[h.COMPARATORLOOSE])
                  ),
                )),
                l("range list", o));
              const u = new Map(),
                b = o.map((e) => new a(e, this.options));
              for (const e of b) {
                if (v(e)) return [e];
                u.set(e.value, e);
              }
              u.size > 1 && u.has("") && u.delete("");
              const O = [...u.values()];
              return (s.set(t, O), O);
            }
            intersects(e, t) {
              if (!(e instanceof n)) throw new TypeError("a Range is required");
              return this.set.some(
                (i) =>
                  O(i, t) &&
                  e.set.some((e) => O(e, t) && i.every((i) => e.every((e) => i.intersects(e, t)))),
              );
            }
            test(e) {
              if (!e) return !1;
              if ("string" == typeof e)
                try {
                  e = new u(e, this.options);
                } catch (e) {
                  return !1;
                }
              for (let t = 0; t < this.set.length; t++)
                if (A(this.set[t], e, this.options)) return !0;
              return !1;
            }
          }
          e.exports = n;
          const s = new (i(1158))(),
            o = i(7095),
            a = i(9524),
            l = i(9796),
            u = i(7944),
            {
              safeRe: c,
              t: h,
              comparatorTrimReplace: d,
              tildeTrimReplace: f,
              caretTrimReplace: p,
            } = i(6850),
            { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: g } = i(9630),
            v = (e) => "<0.0.0-0" === e.value,
            b = (e) => "" === e.value,
            O = (e, t) => {
              let i = !0;
              const r = e.slice();
              let n = r.pop();
              for (; i && r.length; ) ((i = r.every((e) => n.intersects(e, t))), (n = r.pop()));
              return i;
            },
            w = (e, t) => (
              (e = e.replace(c[h.BUILD], "")),
              l("comp", e, t),
              (e = S(e, t)),
              l("caret", e),
              (e = y(e, t)),
              l("tildes", e),
              (e = k(e, t)),
              l("xrange", e),
              (e = T(e, t)),
              l("stars", e),
              e
            ),
            $ = (e) => !e || "x" === e.toLowerCase() || "*" === e,
            y = (e, t) =>
              e
                .trim()
                .split(/\s+/)
                .map((e) => E(e, t))
                .join(" "),
            E = (e, t) => {
              const i = t.loose ? c[h.TILDELOOSE] : c[h.TILDE];
              return e.replace(i, (t, i, r, n, s) => {
                let o;
                return (
                  l("tilde", e, t, i, r, n, s),
                  $(i)
                    ? (o = "")
                    : $(r)
                      ? (o = `>=${i}.0.0 <${+i + 1}.0.0-0`)
                      : $(n)
                        ? (o = `>=${i}.${r}.0 <${i}.${+r + 1}.0-0`)
                        : s
                          ? (l("replaceTilde pr", s),
                            (o = `>=${i}.${r}.${n}-${s} <${i}.${+r + 1}.0-0`))
                          : (o = `>=${i}.${r}.${n} <${i}.${+r + 1}.0-0`),
                  l("tilde return", o),
                  o
                );
              });
            },
            S = (e, t) =>
              e
                .trim()
                .split(/\s+/)
                .map((e) => x(e, t))
                .join(" "),
            x = (e, t) => {
              l("caret", e, t);
              const i = t.loose ? c[h.CARETLOOSE] : c[h.CARET],
                r = t.includePrerelease ? "-0" : "";
              return e.replace(i, (t, i, n, s, o) => {
                let a;
                return (
                  l("caret", e, t, i, n, s, o),
                  $(i)
                    ? (a = "")
                    : $(n)
                      ? (a = `>=${i}.0.0${r} <${+i + 1}.0.0-0`)
                      : $(s)
                        ? (a =
                            "0" === i
                              ? `>=${i}.${n}.0${r} <${i}.${+n + 1}.0-0`
                              : `>=${i}.${n}.0${r} <${+i + 1}.0.0-0`)
                        : o
                          ? (l("replaceCaret pr", o),
                            (a =
                              "0" === i
                                ? "0" === n
                                  ? `>=${i}.${n}.${s}-${o} <${i}.${n}.${+s + 1}-0`
                                  : `>=${i}.${n}.${s}-${o} <${i}.${+n + 1}.0-0`
                                : `>=${i}.${n}.${s}-${o} <${+i + 1}.0.0-0`))
                          : (l("no pr"),
                            (a =
                              "0" === i
                                ? "0" === n
                                  ? `>=${i}.${n}.${s}${r} <${i}.${n}.${+s + 1}-0`
                                  : `>=${i}.${n}.${s}${r} <${i}.${+n + 1}.0-0`
                                : `>=${i}.${n}.${s} <${+i + 1}.0.0-0`)),
                  l("caret return", a),
                  a
                );
              });
            },
            k = (e, t) => (
              l("replaceXRanges", e, t),
              e
                .split(/\s+/)
                .map((e) => P(e, t))
                .join(" ")
            ),
            P = (e, t) => {
              e = e.trim();
              const i = t.loose ? c[h.XRANGELOOSE] : c[h.XRANGE];
              return e.replace(i, (i, r, n, s, o, a) => {
                l("xRange", e, i, r, n, s, o, a);
                const u = $(n),
                  c = u || $(s),
                  h = c || $(o),
                  d = h;
                return (
                  "=" === r && d && (r = ""),
                  (a = t.includePrerelease ? "-0" : ""),
                  u
                    ? (i = ">" === r || "<" === r ? "<0.0.0-0" : "*")
                    : r && d
                      ? (c && (s = 0),
                        (o = 0),
                        ">" === r
                          ? ((r = ">="),
                            c ? ((n = +n + 1), (s = 0), (o = 0)) : ((s = +s + 1), (o = 0)))
                          : "<=" === r && ((r = "<"), c ? (n = +n + 1) : (s = +s + 1)),
                        "<" === r && (a = "-0"),
                        (i = `${r + n}.${s}.${o}${a}`))
                      : c
                        ? (i = `>=${n}.0.0${a} <${+n + 1}.0.0-0`)
                        : h && (i = `>=${n}.${s}.0${a} <${n}.${+s + 1}.0-0`),
                  l("xRange return", i),
                  i
                );
              });
            },
            T = (e, t) => (l("replaceStars", e, t), e.trim().replace(c[h.STAR], "")),
            I = (e, t) => (
              l("replaceGTE0", e, t),
              e.trim().replace(c[t.includePrerelease ? h.GTE0PRE : h.GTE0], "")
            ),
            R = (e) => (t, i, r, n, s, o, a, l, u, c, h, d) =>
              `${(i = $(r) ? "" : $(n) ? `>=${r}.0.0${e ? "-0" : ""}` : $(s) ? `>=${r}.${n}.0${e ? "-0" : ""}` : o ? `>=${i}` : `>=${i}${e ? "-0" : ""}`)} ${(l = $(u) ? "" : $(c) ? `<${+u + 1}.0.0-0` : $(h) ? `<${u}.${+c + 1}.0-0` : d ? `<=${u}.${c}.${h}-${d}` : e ? `<${u}.${c}.${+h + 1}-0` : `<=${l}`)}`.trim(),
            A = (e, t, i) => {
              for (let i = 0; i < e.length; i++) if (!e[i].test(t)) return !1;
              if (t.prerelease.length && !i.includePrerelease) {
                for (let i = 0; i < e.length; i++)
                  if (
                    (l(e[i].semver), e[i].semver !== a.ANY && e[i].semver.prerelease.length > 0)
                  ) {
                    const r = e[i].semver;
                    if (r.major === t.major && r.minor === t.minor && r.patch === t.patch)
                      return !0;
                  }
                return !1;
              }
              return !0;
            };
        },
        8398: (e) => {
          "use strict";
          e.exports = u;
        },
        8449: (e, t, i) => {
          "use strict";
          const r = i(6850),
            n = i(9630),
            s = i(7944),
            o = i(4031),
            a = i(5860),
            l = i(7645),
            u = i(7994),
            c = i(5955),
            h = i(660),
            d = i(2966),
            f = i(5986),
            p = i(1617),
            m = i(9613),
            g = i(5380),
            v = i(2862),
            b = i(7023),
            O = i(2801),
            w = i(603),
            $ = i(6033),
            y = i(144),
            E = i(599),
            S = i(6909),
            x = i(7659),
            k = i(2077),
            P = i(7092),
            T = i(3811),
            I = i(5334),
            R = i(9524),
            A = i(8395),
            N = i(1722),
            _ = i(651),
            L = i(7840),
            C = i(7930),
            Q = i(3489),
            X = i(7494),
            D = i(5463),
            U = i(7871),
            M = i(4266),
            j = i(1112),
            F = i(1465),
            z = i(9252);
          e.exports = {
            parse: a,
            valid: l,
            clean: u,
            inc: c,
            diff: h,
            major: d,
            minor: f,
            patch: p,
            prerelease: m,
            compare: g,
            rcompare: v,
            compareLoose: b,
            compareBuild: O,
            sort: w,
            rsort: $,
            gt: y,
            lt: E,
            eq: S,
            neq: x,
            gte: k,
            lte: P,
            cmp: T,
            coerce: I,
            Comparator: R,
            Range: A,
            satisfies: N,
            toComparators: _,
            maxSatisfying: L,
            minSatisfying: C,
            minVersion: Q,
            validRange: X,
            outside: D,
            gtr: U,
            ltr: M,
            intersects: j,
            simplifyRange: F,
            subset: z,
            SemVer: s,
            re: r.re,
            src: r.src,
            tokens: r.t,
            SEMVER_SPEC_VERSION: n.SEMVER_SPEC_VERSION,
            RELEASE_TYPES: n.RELEASE_TYPES,
            compareIdentifiers: o.compareIdentifiers,
            rcompareIdentifiers: o.rcompareIdentifiers,
          };
        },
        8531: (e) => {
          "use strict";
          e.exports = c;
        },
        8705: (e, t, i) => {
          "use strict";
          i.d(t, { v: () => f });
          var r = i(5438),
            n = i(9914),
            s = i(4696);
          function o(e, t) {
            if (t.has(e))
              throw new TypeError("Cannot initialize the same private elements twice on an object");
          }
          function a(e, t, i) {
            if (!t.has(e))
              throw new TypeError("attempted to " + i + " private field on non-instance");
            return t.get(e);
          }
          function l(e, t, i) {
            return (
              (function (e, t, i) {
                if (t.set) t.set.call(e, i);
                else {
                  if (!t.writable) throw new TypeError("attempted to set read only private field");
                  t.value = i;
                }
              })(e, a(e, t, "set"), i),
              i
            );
          }
          function u(e, t, i) {
            if (!t.has(e)) throw new TypeError("attempted to get private field on non-instance");
            return i;
          }
          var c = new WeakMap(),
            h = new WeakSet();
          function d(e, t) {
            var i;
            "prod" !==
              (function (e, t) {
                return t.get ? t.get.call(e) : t.value;
              })((i = this), a(i, c, "get")) && console[e](...t);
          }
          const f = new (class {
            trace() {
              var e;
              (u(this, h, d).call(this, "trace", []),
                null === (e = (0, n.n1)()) ||
                  void 0 === e ||
                  e.api.pushLog([], { level: r.$b.TRACE }));
            }
            debug(...e) {
              var t;
              (u(this, h, d).call(this, "debug", e),
                null === (t = (0, n.n1)()) ||
                  void 0 === t ||
                  t.api.pushLog(e, { level: r.$b.DEBUG }));
            }
            info(...e) {
              var t;
              (u(this, h, d).call(this, "info", e),
                null === (t = (0, n.n1)()) ||
                  void 0 === t ||
                  t.api.pushLog(e, { level: r.$b.INFO }));
            }
            log(...e) {
              var t;
              (u(this, h, d).call(this, "log", e),
                null === (t = (0, n.n1)()) ||
                  void 0 === t ||
                  t.api.pushLog(e, { level: r.$b.LOG }));
            }
            warn(...e) {
              var t;
              (u(this, h, d).call(this, "warn", e),
                null === (t = (0, n.n1)()) ||
                  void 0 === t ||
                  t.api.pushLog(e, { level: r.$b.WARN }));
            }
            error(e, t) {
              var i;
              (u(this, h, d).call(this, "error", [e]),
                t && u(this, h, d).call(this, "error", ["Error context", t]),
                null === (i = (0, n.n1)()) || void 0 === i || i.api.pushError(e, { context: t }));
            }
            constructor() {
              var e, t;
              (o((e = this), (t = h)),
                t.add(e),
                (function (e, t, i) {
                  (o(e, t), t.set(e, i));
                })(this, c, { writable: !0, value: void 0 }),
                l(this, c, (0, s.u)()));
            }
          })();
        },
        8943: (e, t, i) => {
          "use strict";
          i.d(t, { G: () => s, s: () => n });
          var r = i(2533);
          const n = r.id,
            s = `/a/${r.id}`;
        },
        9252: (e, t, i) => {
          "use strict";
          const r = i(8395),
            n = i(9524),
            { ANY: s } = n,
            o = i(1722),
            a = i(5380),
            l = [new n(">=0.0.0-0")],
            u = [new n(">=0.0.0")],
            c = (e, t, i) => {
              if (e === t) return !0;
              if (1 === e.length && e[0].semver === s) {
                if (1 === t.length && t[0].semver === s) return !0;
                e = i.includePrerelease ? l : u;
              }
              if (1 === t.length && t[0].semver === s) {
                if (i.includePrerelease) return !0;
                t = u;
              }
              const r = new Set();
              let n, c, f, p, m, g, v;
              for (const t of e)
                ">" === t.operator || ">=" === t.operator
                  ? (n = h(n, t, i))
                  : "<" === t.operator || "<=" === t.operator
                    ? (c = d(c, t, i))
                    : r.add(t.semver);
              if (r.size > 1) return null;
              if (n && c) {
                if (((f = a(n.semver, c.semver, i)), f > 0)) return null;
                if (0 === f && (">=" !== n.operator || "<=" !== c.operator)) return null;
              }
              for (const e of r) {
                if (n && !o(e, String(n), i)) return null;
                if (c && !o(e, String(c), i)) return null;
                for (const r of t) if (!o(e, String(r), i)) return !1;
                return !0;
              }
              let b = !(!c || i.includePrerelease || !c.semver.prerelease.length) && c.semver,
                O = !(!n || i.includePrerelease || !n.semver.prerelease.length) && n.semver;
              b &&
                1 === b.prerelease.length &&
                "<" === c.operator &&
                0 === b.prerelease[0] &&
                (b = !1);
              for (const e of t) {
                if (
                  ((v = v || ">" === e.operator || ">=" === e.operator),
                  (g = g || "<" === e.operator || "<=" === e.operator),
                  n)
                )
                  if (
                    (O &&
                      e.semver.prerelease &&
                      e.semver.prerelease.length &&
                      e.semver.major === O.major &&
                      e.semver.minor === O.minor &&
                      e.semver.patch === O.patch &&
                      (O = !1),
                    ">" === e.operator || ">=" === e.operator)
                  ) {
                    if (((p = h(n, e, i)), p === e && p !== n)) return !1;
                  } else if (">=" === n.operator && !o(n.semver, String(e), i)) return !1;
                if (c)
                  if (
                    (b &&
                      e.semver.prerelease &&
                      e.semver.prerelease.length &&
                      e.semver.major === b.major &&
                      e.semver.minor === b.minor &&
                      e.semver.patch === b.patch &&
                      (b = !1),
                    "<" === e.operator || "<=" === e.operator)
                  ) {
                    if (((m = d(c, e, i)), m === e && m !== c)) return !1;
                  } else if ("<=" === c.operator && !o(c.semver, String(e), i)) return !1;
                if (!e.operator && (c || n) && 0 !== f) return !1;
              }
              return !(n && g && !c && 0 !== f) && !(c && v && !n && 0 !== f) && !O && !b;
            },
            h = (e, t, i) => {
              if (!e) return t;
              const r = a(e.semver, t.semver, i);
              return r > 0 ? e : r < 0 || (">" === t.operator && ">=" === e.operator) ? t : e;
            },
            d = (e, t, i) => {
              if (!e) return t;
              const r = a(e.semver, t.semver, i);
              return r < 0 ? e : r > 0 || ("<" === t.operator && "<=" === e.operator) ? t : e;
            };
          e.exports = (e, t, i = {}) => {
            if (e === t) return !0;
            ((e = new r(e, i)), (t = new r(t, i)));
            let n = !1;
            e: for (const r of e.set) {
              for (const e of t.set) {
                const t = c(r, e, i);
                if (((n = n || null !== t), t)) continue e;
              }
              if (n) return !1;
            }
            return !0;
          };
        },
        9524: (e, t, i) => {
          "use strict";
          const r = Symbol("SemVer ANY");
          class n {
            static get ANY() {
              return r;
            }
            constructor(e, t) {
              if (((t = s(t)), e instanceof n)) {
                if (e.loose === !!t.loose) return e;
                e = e.value;
              }
              ((e = e.trim().split(/\s+/).join(" ")),
                u("comparator", e, t),
                (this.options = t),
                (this.loose = !!t.loose),
                this.parse(e),
                this.semver === r
                  ? (this.value = "")
                  : (this.value = this.operator + this.semver.version),
                u("comp", this));
            }
            parse(e) {
              const t = this.options.loose ? o[a.COMPARATORLOOSE] : o[a.COMPARATOR],
                i = e.match(t);
              if (!i) throw new TypeError(`Invalid comparator: ${e}`);
              ((this.operator = void 0 !== i[1] ? i[1] : ""),
                "=" === this.operator && (this.operator = ""),
                i[2] ? (this.semver = new c(i[2], this.options.loose)) : (this.semver = r));
            }
            toString() {
              return this.value;
            }
            test(e) {
              if ((u("Comparator.test", e, this.options.loose), this.semver === r || e === r))
                return !0;
              if ("string" == typeof e)
                try {
                  e = new c(e, this.options);
                } catch (e) {
                  return !1;
                }
              return l(e, this.operator, this.semver, this.options);
            }
            intersects(e, t) {
              if (!(e instanceof n)) throw new TypeError("a Comparator is required");
              return "" === this.operator
                ? "" === this.value || new h(e.value, t).test(this.value)
                : "" === e.operator
                  ? "" === e.value || new h(this.value, t).test(e.semver)
                  : (!(t = s(t)).includePrerelease ||
                      ("<0.0.0-0" !== this.value && "<0.0.0-0" !== e.value)) &&
                    !(
                      !t.includePrerelease &&
                      (this.value.startsWith("<0.0.0") || e.value.startsWith("<0.0.0"))
                    ) &&
                    (!(!this.operator.startsWith(">") || !e.operator.startsWith(">")) ||
                      !(!this.operator.startsWith("<") || !e.operator.startsWith("<")) ||
                      !(
                        this.semver.version !== e.semver.version ||
                        !this.operator.includes("=") ||
                        !e.operator.includes("=")
                      ) ||
                      !!(
                        l(this.semver, "<", e.semver, t) &&
                        this.operator.startsWith(">") &&
                        e.operator.startsWith("<")
                      ) ||
                      !!(
                        l(this.semver, ">", e.semver, t) &&
                        this.operator.startsWith("<") &&
                        e.operator.startsWith(">")
                      ));
            }
          }
          e.exports = n;
          const s = i(7095),
            { safeRe: o, t: a } = i(6850),
            l = i(3811),
            u = i(9796),
            c = i(7944),
            h = i(8395);
        },
        9613: (e, t, i) => {
          "use strict";
          const r = i(5860);
          e.exports = (e, t) => {
            const i = r(e, t);
            return i && i.prerelease.length ? i.prerelease : null;
          };
        },
        9630: (e) => {
          "use strict";
          const t = Number.MAX_SAFE_INTEGER || 9007199254740991;
          e.exports = {
            MAX_LENGTH: 256,
            MAX_SAFE_COMPONENT_LENGTH: 16,
            MAX_SAFE_BUILD_LENGTH: 250,
            MAX_SAFE_INTEGER: t,
            RELEASE_TYPES: [
              "major",
              "premajor",
              "minor",
              "preminor",
              "patch",
              "prepatch",
              "prerelease",
            ],
            SEMVER_SPEC_VERSION: "2.0.0",
            FLAG_INCLUDE_PRERELEASE: 1,
            FLAG_LOOSE: 2,
          };
        },
        9796: (e) => {
          "use strict";
          const t =
            "object" == typeof process &&
            process.env &&
            process.env.NODE_DEBUG &&
            /\bsemver\b/i.test(process.env.NODE_DEBUG)
              ? (...e) => console.error("SEMVER", ...e)
              : () => {};
          e.exports = t;
        },
        9851: (e, t, i) => {
          "use strict";
          i.d(t, { K3: () => _ });
          var r = i(782),
            n = i(7203);
          let s = 0;
          class o {
            constructor(e, t, i, r) {
              ((this.name = e),
                (this.set = t),
                (this.base = i),
                (this.modified = r),
                (this.id = s++));
            }
            toString() {
              let { name: e } = this;
              for (let t of this.modified) t.name && (e = `${t.name}(${e})`);
              return e;
            }
            static define(e, t) {
              let i = "string" == typeof e ? e : "?";
              if ((e instanceof o && (t = e), null == t ? void 0 : t.base))
                throw new Error("Can not derive from a modified tag");
              let r = new o(i, [], null, []);
              if ((r.set.push(r), t)) for (let e of t.set) r.set.push(e);
              return r;
            }
            static defineModifier(e) {
              let t = new l(e);
              return (e) =>
                e.modified.indexOf(t) > -1
                  ? e
                  : l.get(
                      e.base || e,
                      e.modified.concat(t).sort((e, t) => e.id - t.id),
                    );
            }
          }
          let a = 0;
          class l {
            constructor(e) {
              ((this.name = e), (this.instances = []), (this.id = a++));
            }
            static get(e, t) {
              if (!t.length) return e;
              let i = t[0].instances.find((i) => {
                return (
                  i.base == e &&
                  ((r = t), (n = i.modified), r.length == n.length && r.every((e, t) => e == n[t]))
                );
                var r, n;
              });
              if (i) return i;
              let r = [],
                n = new o(e.name, r, e, t);
              for (let e of t) e.instances.push(n);
              let s = (function (e) {
                let t = [[]];
                for (let i = 0; i < e.length; i++)
                  for (let r = 0, n = t.length; r < n; r++) t.push(t[r].concat(e[i]));
                return t.sort((e, t) => t.length - e.length);
              })(t);
              for (let t of e.set) if (!t.modified.length) for (let e of s) r.push(l.get(t, e));
              return n;
            }
          }
          const u = new n.uY();
          class c {
            constructor(e, t, i, r) {
              ((this.tags = e), (this.mode = t), (this.context = i), (this.next = r));
            }
            get opaque() {
              return 0 == this.mode;
            }
            get inherit() {
              return 1 == this.mode;
            }
            sort(e) {
              return !e || e.depth < this.depth
                ? ((this.next = e), this)
                : ((e.next = this.sort(e.next)), e);
            }
            get depth() {
              return this.context ? this.context.length : 0;
            }
          }
          c.empty = new c([], 2, null);
          const h = o.define,
            d = h(),
            f = h(),
            p = h(f),
            m = h(f),
            g = h(),
            v = h(g),
            b = h(g),
            O = h(),
            w = h(O),
            $ = h(),
            y = h(),
            E = h(),
            S = h(E),
            x = h(),
            k = {
              comment: d,
              lineComment: h(d),
              blockComment: h(d),
              docComment: h(d),
              name: f,
              variableName: h(f),
              typeName: p,
              tagName: h(p),
              propertyName: m,
              attributeName: h(m),
              className: h(f),
              labelName: h(f),
              namespace: h(f),
              macroName: h(f),
              literal: g,
              string: v,
              docString: h(v),
              character: h(v),
              attributeValue: h(v),
              number: b,
              integer: h(b),
              float: h(b),
              bool: h(g),
              regexp: h(g),
              escape: h(g),
              color: h(g),
              url: h(g),
              keyword: $,
              self: h($),
              null: h($),
              atom: h($),
              unit: h($),
              modifier: h($),
              operatorKeyword: h($),
              controlKeyword: h($),
              definitionKeyword: h($),
              moduleKeyword: h($),
              operator: y,
              derefOperator: h(y),
              arithmeticOperator: h(y),
              logicOperator: h(y),
              bitwiseOperator: h(y),
              compareOperator: h(y),
              updateOperator: h(y),
              definitionOperator: h(y),
              typeOperator: h(y),
              controlOperator: h(y),
              punctuation: E,
              separator: h(E),
              bracket: S,
              angleBracket: h(S),
              squareBracket: h(S),
              paren: h(S),
              brace: h(S),
              content: O,
              heading: w,
              heading1: h(w),
              heading2: h(w),
              heading3: h(w),
              heading4: h(w),
              heading5: h(w),
              heading6: h(w),
              contentSeparator: h(O),
              list: h(O),
              quote: h(O),
              emphasis: h(O),
              strong: h(O),
              link: h(O),
              monospace: h(O),
              strikethrough: h(O),
              inserted: h(),
              deleted: h(),
              changed: h(),
              invalid: h(),
              meta: x,
              documentMeta: h(x),
              annotation: h(x),
              processingInstruction: h(x),
              definition: o.defineModifier("definition"),
              constant: o.defineModifier("constant"),
              function: o.defineModifier("function"),
              standard: o.defineModifier("standard"),
              local: o.defineModifier("local"),
              special: o.defineModifier("special"),
            };
          for (let e in k) {
            let t = k[e];
            t instanceof o && (t.name = e);
          }
          !(function (e, t) {
            let i = Object.create(null);
            for (let t of e)
              if (Array.isArray(t.tag)) for (let e of t.tag) i[e.id] = t.class;
              else i[t.tag.id] = t.class;
            let { scope: r, all: n = null } = t || {};
          })([
            { tag: k.link, class: "tok-link" },
            { tag: k.heading, class: "tok-heading" },
            { tag: k.emphasis, class: "tok-emphasis" },
            { tag: k.strong, class: "tok-strong" },
            { tag: k.keyword, class: "tok-keyword" },
            { tag: k.atom, class: "tok-atom" },
            { tag: k.bool, class: "tok-bool" },
            { tag: k.url, class: "tok-url" },
            { tag: k.labelName, class: "tok-labelName" },
            { tag: k.inserted, class: "tok-inserted" },
            { tag: k.deleted, class: "tok-deleted" },
            { tag: k.literal, class: "tok-literal" },
            { tag: k.string, class: "tok-string" },
            { tag: k.number, class: "tok-number" },
            { tag: [k.regexp, k.escape, k.special(k.string)], class: "tok-string2" },
            { tag: k.variableName, class: "tok-variableName" },
            { tag: k.local(k.variableName), class: "tok-variableName tok-local" },
            { tag: k.definition(k.variableName), class: "tok-variableName tok-definition" },
            { tag: k.special(k.variableName), class: "tok-variableName2" },
            { tag: k.definition(k.propertyName), class: "tok-propertyName tok-definition" },
            { tag: k.typeName, class: "tok-typeName" },
            { tag: k.namespace, class: "tok-namespace" },
            { tag: k.className, class: "tok-className" },
            { tag: k.macroName, class: "tok-macroName" },
            { tag: k.propertyName, class: "tok-propertyName" },
            { tag: k.operator, class: "tok-operator" },
            { tag: k.comment, class: "tok-comment" },
            { tag: k.meta, class: "tok-meta" },
            { tag: k.invalid, class: "tok-invalid" },
            { tag: k.punctuation, class: "tok-punctuation" },
          ]);
          const P = {
              inf: 167,
              nan: 168,
              bool: 1,
              ignoring: 2,
              on: 3,
              group_left: 4,
              group_right: 5,
              offset: 6,
            },
            T = (e, t) => P[e.toLowerCase()] || -1,
            I = {
              avg: 8,
              atan2: 7,
              bottomk: 9,
              count: 10,
              count_values: 11,
              group: 12,
              max: 13,
              min: 14,
              quantile: 15,
              limitk: 16,
              limit_ratio: 17,
              stddev: 18,
              stdvar: 19,
              sum: 20,
              topk: 21,
              by: 22,
              without: 23,
              and: 24,
              or: 25,
              unless: 26,
              start: 27,
              end: 28,
              smoothed: 29,
              anchored: 30,
            },
            R = (e, t) => I[e.toLowerCase()] || -1,
            A = (function (e) {
              let t = Object.create(null);
              for (let i in e) {
                let r = e[i];
                Array.isArray(r) || (r = [r]);
                for (let e of i.split(" "))
                  if (e) {
                    let i = [],
                      n = 2,
                      s = e;
                    for (let t = 0; ; ) {
                      if ("..." == s && t > 0 && t + 3 == e.length) {
                        n = 1;
                        break;
                      }
                      let r = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(s);
                      if (!r) throw new RangeError("Invalid path: " + e);
                      if (
                        (i.push("*" == r[0] ? "" : '"' == r[0][0] ? JSON.parse(r[0]) : r[0]),
                        (t += r[0].length),
                        t == e.length)
                      )
                        break;
                      let o = e[t++];
                      if (t == e.length && "!" == o) {
                        n = 0;
                        break;
                      }
                      if ("/" != o) throw new RangeError("Invalid path: " + e);
                      s = e.slice(t);
                    }
                    let o = i.length - 1,
                      a = i[o];
                    if (!a) throw new RangeError("Invalid path: " + e);
                    let l = new c(r, n, o > 0 ? i.slice(0, o) : null);
                    t[a] = l.sort(t[a]);
                  }
              }
              return u.add(t);
            })({
              LineComment: k.comment,
              LabelName: k.labelName,
              StringLiteral: k.string,
              NumberDurationLiteral: k.number,
              NumberDurationLiteralInDurationContext: k.number,
              Identifier: k.variableName,
              "Abs Absent AbsentOverTime Acos Acosh Asin Asinh Atan Atanh AvgOverTime Ceil Changes Clamp ClampMax ClampMin Cos Cosh CountOverTime DaysInMonth DayOfMonth DayOfWeek DayOfYear Deg Delta Deriv Exp Floor HistogramAvg HistogramCount HistogramFraction HistogramQuantile HistogramSum DoubleExponentialSmoothing Hour Idelta Increase Irate LabelReplace LabelJoin LastOverTime Ln Log10 Log2 MaxOverTime MinOverTime Minute Month Pi PredictLinear PresentOverTime QuantileOverTime Rad Rate Resets Round Scalar Sgn Sin Sinh Sort SortDesc SortByLabel SortByLabelDesc Sqrt StddevOverTime StdvarOverTime SumOverTime Tan Tanh Time Timestamp Vector Year":
                k.function(k.variableName),
              "Avg Bottomk Count Count_values Group LimitK LimitRatio Max Min Quantile Stddev Stdvar Sum Topk":
                k.operatorKeyword,
              "By Without Bool On Ignoring GroupLeft GroupRight Offset Start End Smoothed Anchored":
                k.modifier,
              "And Unless Or": k.logicOperator,
              "Sub Add Mul Mod Div Atan2 Eql Neq Lte Lss Gte Gtr EqlRegex EqlSingle NeqRegex Pow At":
                k.operator,
              UnaryOp: k.arithmeticOperator,
              "( )": k.paren,
              "[ ]": k.squareBracket,
              "{ }": k.brace,
              "⚠": k.invalid,
            }),
            N = {
              __proto__: null,
              absent_over_time: 353,
              absent: 355,
              abs: 357,
              acos: 359,
              acosh: 361,
              asin: 363,
              asinh: 365,
              atan: 367,
              atanh: 369,
              avg_over_time: 371,
              ceil: 373,
              changes: 375,
              clamp: 377,
              clamp_max: 379,
              clamp_min: 381,
              cos: 383,
              cosh: 385,
              count_over_time: 387,
              days_in_month: 389,
              day_of_month: 391,
              day_of_week: 393,
              day_of_year: 395,
              deg: 397,
              delta: 399,
              deriv: 401,
              exp: 403,
              first_over_time: 405,
              floor: 407,
              histogram_count: 409,
              histogram_fraction: 411,
              histogram_quantile: 413,
              histogram_stddev: 415,
              histogram_stdvar: 417,
              histogram_sum: 419,
              histogram_avg: 421,
              double_exponential_smoothing: 423,
              hour: 425,
              idelta: 427,
              increase: 429,
              info: 431,
              irate: 433,
              label_replace: 435,
              label_join: 437,
              last_over_time: 439,
              ln: 441,
              log10: 443,
              log2: 445,
              mad_over_time: 447,
              max_over_time: 449,
              min_over_time: 451,
              ts_of_first_over_time: 453,
              ts_of_max_over_time: 455,
              ts_of_min_over_time: 457,
              ts_of_last_over_time: 459,
              minute: 461,
              month: 463,
              pi: 465,
              predict_linear: 467,
              present_over_time: 469,
              quantile_over_time: 471,
              rad: 473,
              rate: 475,
              resets: 477,
              round: 479,
              scalar: 481,
              sgn: 483,
              sin: 485,
              sinh: 487,
              sort: 489,
              sort_desc: 491,
              sort_by_label: 493,
              sort_by_label_desc: 495,
              sqrt: 497,
              stddev_over_time: 499,
              stdvar_over_time: 501,
              sum_over_time: 503,
              tan: 505,
              tanh: 507,
              timestamp: 509,
              time: 511,
              vector: 513,
              year: 515,
            },
            _ = r.U1.deserialize({
              version: 14,
              states:
                ":^OYQPOOO(TQPOOOOQO'#DO'#DOO(YQPO'#C}Q(eQQOOOOQO'#Dg'#DgO(`QPO'#DfOOQO'#Fa'#FaO)xQPO'#FhOYQPO'#FeOYQPO'#FgO0|QSO'#FjO1XQQO'#FiOOQO'#Fi'#FiOOQO'#F}'#F}OOQO'#Dh'#DhOOQO'#Dj'#DjOOQO'#Dk'#DkOOQO'#Dl'#DlOOQO'#Dm'#DmOOQO'#Dn'#DnOOQO'#Do'#DoOOQO'#Dp'#DpOOQO'#Dq'#DqOOQO'#Dr'#DrOOQO'#Ds'#DsOOQO'#Dt'#DtOOQO'#Du'#DuOOQO'#Dv'#DvOOQO'#Dw'#DwOOQO'#Dx'#DxOOQO'#Dy'#DyOOQO'#Dz'#DzOOQO'#D{'#D{OOQO'#D|'#D|OOQO'#D}'#D}OOQO'#EO'#EOOOQO'#EP'#EPOOQO'#EQ'#EQOOQO'#ER'#EROOQO'#ES'#ESOOQO'#ET'#ETOOQO'#EU'#EUOOQO'#EV'#EVOOQO'#EW'#EWOOQO'#EX'#EXOOQO'#EY'#EYOOQO'#EZ'#EZOOQO'#E['#E[OOQO'#E]'#E]OOQO'#E^'#E^OOQO'#E_'#E_OOQO'#E`'#E`OOQO'#Ea'#EaOOQO'#Eb'#EbOOQO'#Ec'#EcOOQO'#Ed'#EdOOQO'#Ee'#EeOOQO'#Ef'#EfOOQO'#Eg'#EgOOQO'#Eh'#EhOOQO'#Ei'#EiOOQO'#Ej'#EjOOQO'#Ek'#EkOOQO'#El'#ElOOQO'#Em'#EmOOQO'#En'#EnOOQO'#Eo'#EoOOQO'#Ep'#EpOOQO'#Eq'#EqOOQO'#Er'#ErOOQO'#Es'#EsOOQO'#Et'#EtOOQO'#Eu'#EuOOQO'#Ev'#EvOOQO'#Ew'#EwOOQO'#Ex'#ExOOQO'#Ey'#EyOOQO'#Ez'#EzOOQO'#E{'#E{OOQO'#E|'#E|OOQO'#E}'#E}OOQO'#FO'#FOOOQO'#FP'#FPOOQO'#FQ'#FQOOQO'#FR'#FROOQO'#FS'#FSOOQO'#FT'#FTOOQO'#FU'#FUOOQO'#FV'#FVOOQO'#FW'#FWOOQO'#FX'#FXOOQO'#FY'#FYOOQO'#FZ'#FZOOQO'#F['#F[OOQO'#F]'#F]OOQO'#F^'#F^QOQPOOO2xQPO'#DPO2}QPO'#DUO(`QPO,59iO3UQQO,59iO4xQPO,59qO4xQPO,59qO4xQPO,59qO4xQPO,59qO4xQPO,59qO;|QPO,5;yO;|QPO,5;|OOQO,5;},5;}OOQO,5<O,5<OO<_QPO,5<]OOQO,5:Q,5:QOOQO,5;{,5;{O<vQQO,5<PO<}QQO,5<ROOQO'#DS'#DSO>kQPO'#FkO>yQPO,5<UOOQO,5<U,5<UO?VQPO,5<UOOQO,5<T,5<TO?_QSO'#DQOOQO,59k,59kOOQO,59p,59pO?jQQO,59pOOQO1G/T1G/TOOQO'#DX'#DXO2xQPO'#DYOOQO'#GR'#GRO?tQPO'#GROYQPO1G/]OYQPO1G/]OYQPO1G/]OYQPO1G/]OYQPO1G/]OOQO'#F`'#F`OFuQPO'#F`OGQQSO1G1eOOQO1G1h1G1hOGYQPO'#FaOOQO'#Fs'#FsOOQO1G1w1G1wOGeQPO1G1wOOQO1G1k1G1kOOQO'#Fl'#FlOGjQPO,5<VOGoQPO,5<[OGtQSO1G1pOHPQPO1G1pOOQO1G1p1G1pOOQO,59l,59lOHXQPO,59lOYQPO'#FvOHaQPO1G/[OOQO1G/[1G/[OHiQPO,59tOOQO,5<m,5<mO!!zQQO7+$wO!#[QQO7+$wO!$vQQO7+$wO!%^QQO7+$wO!&uQQO7+$wOOQO,5;z,5;zOOQO7+'P7+'PO!'fQPO7+'WO!'mQPO7+'cOOQO1G1q1G1qOOQO1G1v1G1vO!'rQPO,5<cOOQO,5<c,5<cOOQO7+'[7+'[O!(WQSO7+'[OOQO-E9u-E9uO!(cQSO1G/WO!(nQPO1G/WOOQO1G/W1G/WO!(vQQO,5<bOOQO-E9t-E9tOOQO7+$v7+$vO!)QQPO1G/`OOQO<<Jr<<JrO!/{QPO<<JrOOQO<<J}<<J}OOQO<<Jv<<JvP!0QQSO'#FwOOQO,5<a,5<aOOQO7+$r7+$rO!0YQSO7+$rOOQO-E9s-E9sOOQO7+$z7+$zOOQOAN@^AN@^OOQO<<H^<<H^P!0eQSO'#Fu",
              stateData:
                "!0m~O$pOSoOS~OWQOXQOYQOZQO[QO]QO^QO_QO`QOaQObQOcQOdQOeQOw^O!][O$mVO$nVO$rXO$v_O$w`O$xaO$ybO$zcO${dO$|eO$}fO%OgO%PhO%QiO%RjO%SkO%TlO%UmO%VnO%WoO%XpO%YqO%ZrO%[sO%]tO%^uO%_vO%`wO%axO%byO%czO%d{O%e|O%f}O%g!OO%h!PO%i!QO%j!RO%k!SO%l!TO%m!UO%n!VO%o!WO%p!XO%q!YO%r!ZO%s![O%t!]O%u!^O%v!_O%w!`O%x!aO%y!bO%z!cO%{!dO%|!eO%}!fO&O!gO&P!hO&Q!iO&R!jO&S!kO&T!lO&U!mO&V!nO&W!oO&X!pO&Y!qO&Z!rO&[!sO&]!tO&^!uO&_!vO&`!wO&a!xO&b!yO&c!zO&d!{O&e!|O&f!}O&g#OO&h#PO&i#QO&j#RO&k#SO&mWO&nWO&oVO&rZO~O!]#TO~Of#UOg#UO$r#VO~OU#`OV#YOh#]Oi#^Oj#]Om#bOn#aOz#YO}#YO!O#YO!P#YO!Q#ZO!R#ZO!S#[O!T#[O!U#[O!V#[O!W#[O!X#[O$f#cO&l#_O~O$m#eO$n#eO&o#eOW$[XX$[XY$[XZ$[X[$[X]$[X^$[X_$[X`$[Xa$[Xb$[Xc$[Xd$[Xe$[Xw$[X!]$[X$m$[X$n$[X$r$[X$v$[X$w$[X$x$[X$y$[X$z$[X${$[X$|$[X$}$[X%O$[X%P$[X%Q$[X%R$[X%S$[X%T$[X%U$[X%V$[X%W$[X%X$[X%Y$[X%Z$[X%[$[X%]$[X%^$[X%_$[X%`$[X%a$[X%b$[X%c$[X%d$[X%e$[X%f$[X%g$[X%h$[X%i$[X%j$[X%k$[X%l$[X%m$[X%n$[X%o$[X%p$[X%q$[X%r$[X%s$[X%t$[X%u$[X%v$[X%w$[X%x$[X%y$[X%z$[X%{$[X%|$[X%}$[X&O$[X&P$[X&Q$[X&R$[X&S$[X&T$[X&U$[X&V$[X&W$[X&X$[X&Y$[X&Z$[X&[$[X&]$[X&^$[X&_$[X&`$[X&a$[X&b$[X&c$[X&d$[X&e$[X&f$[X&g$[X&h$[X&i$[X&j$[X&k$[X&m$[X&n$[X&o$[X&r$[X~Ou#iOw#hO&s#kO~O&rZOU$]XV$]Xh$]Xi$]Xj$]Xm$]Xn$]Xz$]X}$]X!O$]X!P$]X!Q$]X!R$]X!S$]X!T$]X!U$]X!V$]X!W$]X!X$]X$f$]X$l$]X&l$]X$t$]X$s$]X~O$r#nO~O$t#pO~PYOf#UOg#UOUqaVqahqaiqajqamqanqazqa}qa!Oqa!Pqa!Qqa!Rqa!Sqa!Tqa!Uqa!Vqa!Wqa!Xqa$fqa$lqa&lqa$tqa$sqa~OP#sOQ#tOR#tOW$uPX$uPY$uPZ$uP[$uP]$uP^$uP_$uP`$uPa$uPb$uPc$uPd$uPe$uPw$uP!]$uP$m$uP$n$uP$r$uP$v$uP$w$uP$x$uP$y$uP$z$uP${$uP$|$uP$}$uP%O$uP%P$uP%Q$uP%R$uP%S$uP%T$uP%U$uP%V$uP%W$uP%X$uP%Y$uP%Z$uP%[$uP%]$uP%^$uP%_$uP%`$uP%a$uP%b$uP%c$uP%d$uP%e$uP%f$uP%g$uP%h$uP%i$uP%j$uP%k$uP%l$uP%m$uP%n$uP%o$uP%p$uP%q$uP%r$uP%s$uP%t$uP%u$uP%v$uP%w$uP%x$uP%y$uP%z$uP%{$uP%|$uP%}$uP&O$uP&P$uP&Q$uP&R$uP&S$uP&T$uP&U$uP&V$uP&W$uP&X$uP&Y$uP&Z$uP&[$uP&]$uP&^$uP&_$uP&`$uP&a$uP&b$uP&c$uP&d$uP&e$uP&f$uP&g$uP&h$uP&i$uP&j$uP&k$uP&m$uP&n$uP&o$uP&r$uP~O$m#|O$n#|O&m#}O&n#}O&o#|O~Ok$ROl$RO$mVO$nVO&m$QO&n$QO&oVO~O$t$UO~P(eOz#YOU$ZaV$Zah$Zai$Zaj$Zam$Zan$Za}$Za!O$Za!P$Za!Q$Za!R$Za!S$Za!T$Za!U$Za!V$Za!W$Za!X$Za$f$Za$l$Za&l$Za$t$Za$s$Za~O!X$VO$a$VO$b$VO$c$VO~O!X$VO$a$VO$b$VO$c$VO$s$YO&s$[O~Ou$^Ow#hO$t$]O~O$s$_O$t$aO~P(eOQ#tOR#tOW$uXX$uXY$uXZ$uX[$uX]$uX^$uX_$uX`$uXa$uXb$uXc$uXd$uXe$uXw$uX!]$uX$m$uX$n$uX$r$uX$v$uX$w$uX$x$uX$y$uX$z$uX${$uX$|$uX$}$uX%O$uX%P$uX%Q$uX%R$uX%S$uX%T$uX%U$uX%V$uX%W$uX%X$uX%Y$uX%Z$uX%[$uX%]$uX%^$uX%_$uX%`$uX%a$uX%b$uX%c$uX%d$uX%e$uX%f$uX%g$uX%h$uX%i$uX%j$uX%k$uX%l$uX%m$uX%n$uX%o$uX%p$uX%q$uX%r$uX%s$uX%t$uX%u$uX%v$uX%w$uX%x$uX%y$uX%z$uX%{$uX%|$uX%}$uX&O$uX&P$uX&Q$uX&R$uX&S$uX&T$uX&U$uX&V$uX&W$uX&X$uX&Y$uX&Z$uX&[$uX&]$uX&^$uX&_$uX&`$uX&a$uX&b$uX&c$uX&d$uX&e$uX&f$uX&g$uX&h$uX&i$uX&j$uX&k$uX&m$uX&n$uX&o$uX&r$uX~O$m$iO$n$iO&o$iO~O&p$jO&q$kO~O$m#eO$n#eO&o#eO~O$r$lO~Ow$mO~Ow$nO~Ou#iOw#hO&s$qO~O$s$rO&s$qO~O$s$tO$t$vO~O$s$_O$t$yO~OS$zOT$zOW|aX|aY|aZ|a[|a]|a^|a_|a`|aa|ab|ac|ad|ae|aw|a!]|a$m|a$n|a$r|a$v|a$w|a$x|a$y|a$z|a${|a$||a$}|a%O|a%P|a%Q|a%R|a%S|a%T|a%U|a%V|a%W|a%X|a%Y|a%Z|a%[|a%]|a%^|a%_|a%`|a%a|a%b|a%c|a%d|a%e|a%f|a%g|a%h|a%i|a%j|a%k|a%l|a%m|a%n|a%o|a%p|a%q|a%r|a%s|a%t|a%u|a%v|a%w|a%x|a%y|a%z|a%{|a%||a%}|a&O|a&P|a&Q|a&R|a&S|a&T|a&U|a&V|a&W|a&X|a&Y|a&Z|a&[|a&]|a&^|a&_|a&`|a&a|a&b|a&c|a&d|a&e|a&f|a&g|a&h|a&i|a&j|a&k|a&m|a&n|a&o|a&r|a~Oz#YOUyqhyqiyqjyqmyqnyq!Qyq!Ryq!Syq!Tyq!Uyq!Vyq!Wyq!Xyq$fyq$lyq&lyq$tyq$syq~OVyq}yq!Oyq!Pyq~P! jOV#YO}#YO!O#YO!P#YO~P! jOV#YOz#YO}#YO!O#YO!P#YO!Q#ZO!R#ZOUyqhyqiyqjyqmyqnyq$fyq$lyq&lyq$tyq$syq~O!Syq!Tyq!Uyq!Vyq!Wyq!Xyq~P!#lO!S#[O!T#[O!U#[O!V#[O!W#[O!X#[O~P!#lOV#YOh#]Oj#]Oz#YO}#YO!O#YO!P#YO!Q#ZO!R#ZO!S#[O!T#[O!U#[O!V#[O!W#[O!X#[O~OUyqiyqmyqnyq$fyq$lyq&lyq$tyq$syq~P!%tO&p${O~P;|O$t$}O~O!X$VO$a$VO$b$VO$c$VO$s$ka&s$ka~Ou#iOw#hO&s%OO~Ou%QOw#hO$t%RO~O$s%SO$t%RO~O$s$ja$t$ja~P(eO$r#nOW|iX|iY|iZ|i[|i]|i^|i_|i`|ia|ib|ic|id|ie|iw|i!]|i$m|i$n|i$v|i$w|i$x|i$y|i$z|i${|i$||i$}|i%O|i%P|i%Q|i%R|i%S|i%T|i%U|i%V|i%W|i%X|i%Y|i%Z|i%[|i%]|i%^|i%_|i%`|i%a|i%b|i%c|i%d|i%e|i%f|i%g|i%h|i%i|i%j|i%k|i%l|i%m|i%n|i%o|i%p|i%q|i%r|i%s|i%t|i%u|i%v|i%w|i%x|i%y|i%z|i%{|i%||i%}|i&O|i&P|i&Q|i&R|i&S|i&T|i&U|i&V|i&W|i&X|i&Y|i&Z|i&[|i&]|i&^|i&_|i&`|i&a|i&b|i&c|i&d|i&e|i&f|i&g|i&h|i&i|i&j|i&k|i&m|i&n|i&o|i&r|i~O&p%VO~Ou#iOw#hO~Ou%QOw#hO$t%WO~Ou%QOw#hO~O",
              goto: "*P$vPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP$w%T%a%gP%pP&Q$wP&Z&bPPPPPPPPPPP$w&l&xP&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x&x$w'U'_$w$w$w$w$w$w'n$w'z(Z(cPPP(Z$wP(jP(m(s(yPPPPP)QPPP)pe^OXY#V#w#x#y#z#{$_eROXY#V#w#x#y#z#{$_Q#WRR#r#XQ#o#UQ$b#tR%U$zQ#jZQ$^#nU$o$Y$r%PV%Q$t%S%XQ#XRQ#dUR#r#WZ#v#Y#Z#[#]#^Y#u#Y#Z#[#]#^R$c#veUOXY#V#w#x#y#z#{$_eTOXY#V#w#x#y#z#{$_Q$O#_Q$P#`R$|$kd^OXY#V#w#x#y#z#{$_R$S#ceYOXY#V#w#x#y#z#{$_d]OXY#V#w#x#y#z#{$_R#m[Q#lZV$p$Y$r%PQ$W#iT$X#j$oR$T#cQ$u$^R%T$uQ$`#qR$x$`S$Z#j#lR$s$ZQSOQ#fXQ#gYQ#q#VQ$d#wQ$e#xQ$f#yQ$g#zQ$h#{R$w$_Q#w#YQ#x#ZQ#y#[Q#z#]R#{#^",
              nodeNames:
                "⚠ Bool Ignoring On GroupLeft GroupRight Offset Atan2 Avg Bottomk Count CountValues Group Max Min Quantile LimitK LimitRatio Stddev Stdvar Sum Topk By Without And Or Unless Start End Smoothed Anchored LineComment PromQL AggregateExpr AggregateOp AggregateModifier GroupingLabels LabelName QuotedLabelName StringLiteral FunctionCallBody BinaryExpr Pow BoolModifier MatchingModifierClause Mul Div Mod Add Sub Eql Gte Gtr Lte Lss Neq FunctionCall FunctionIdentifier AbsentOverTime Identifier Absent Abs Acos Acosh Asin Asinh Atan Atanh AvgOverTime Ceil Changes Clamp ClampMax ClampMin Cos Cosh CountOverTime DaysInMonth DayOfMonth DayOfWeek DayOfYear Deg Delta Deriv Exp FirstOverTime Floor HistogramCount HistogramFraction HistogramQuantile HistogramStdDev HistogramStdVar HistogramSum HistogramAvg DoubleExponentialSmoothing Hour Idelta Increase Info Irate LabelReplace LabelJoin LastOverTime Ln Log10 Log2 MadOverTime MaxOverTime MinOverTime TsOfFirstOverTime TsOfMaxOverTime TsOfMinOverTime TsOfLastOverTime Minute Month Pi PredictLinear PresentOverTime QuantileOverTime Rad Rate Resets Round Scalar Sgn Sin Sinh Sort SortDesc SortByLabel SortByLabelDesc Sqrt StddevOverTime StdvarOverTime SumOverTime Tan Tanh Timestamp Time Vector Year MatrixSelector NumberDurationLiteralInDurationContext NumberDurationLiteral OffsetExpr AnchoredExpr SmoothedExpr ParenExpr SubqueryExpr UnaryExpr UnaryOp VectorSelector LabelMatchers UnquotedLabelMatcher MatchOp EqlSingle EqlRegex NeqRegex QuotedLabelMatcher StepInvariantExpr At AtModifierPreprocessors MetricName",
              maxTerm: 265,
              nodeProps: [
                [
                  "group",
                  -14,
                  33,
                  39,
                  41,
                  56,
                  141,
                  143,
                  144,
                  145,
                  146,
                  147,
                  148,
                  149,
                  151,
                  159,
                  "Expr",
                ],
              ],
              propSources: [A],
              skippedNodes: [0, 31],
              repeatNodeCount: 3,
              tokenData:
                "4k~RwX^#lpq#lqr$ars$tst&luv'Twx'Yxy({yz)Qz{)V{|)[|})c}!O)h!O!P)o!P!Q*u!Q!R*z!R![+u![!]1O!^!_1z!_!`2X!`!a2n!b!c2{!c!}3Q!}#O3h#P#Q3m#Q#R3r#R#S3Q#S#T3w#T#o3Q#o#p4a#q#r4f#y#z#l$f$g#l#BY#BZ#l$IS$I_#l$I|$JO#l$JT$JU#l$KV$KW#l&FU&FV#l~#qY$p~X^#lpq#l#y#z#l$f$g#l#BY#BZ#l$IS$I_#l$I|$JO#l$JT$JU#l$KV$KW#l&FU&FV#l~$dQ!_!`$j#r#s$o~$oO!X~~$tO$c~~$yWw~OY$tZr$trs%cs#O$t#O#P%h#P;'S$t;'S;=`&f<%lO$t~%hOw~~%kRO;'S$t;'S;=`%t;=`O$t~%yXw~OY$tZr$trs%cs#O$t#O#P%h#P;'S$t;'S;=`&f;=`<%l$t<%lO$t~&iP;=`<%l$t~&qSo~OY&lZ;'S&l;'S;=`&}<%lO&l~'QP;=`<%l&l~'YO!P~~'_Ww~OY'YZw'Ywx%cx#O'Y#O#P'w#P;'S'Y;'S;=`(u<%lO'Y~'zRO;'S'Y;'S;=`(T;=`O'Y~(YXw~OY'YZw'Ywx%cx#O'Y#O#P'w#P;'S'Y;'S;=`(u;=`<%l'Y<%lO'Y~(xP;=`<%l'Y~)QO$r~~)VO$t~~)[O}~R)cO&nP!QQ~)hO$s~R)oO&mP!RQ~)rP!Q![)u~)zS&o~!Q![)u!g!h*W#R#S)o#X#Y*W~*ZR{|*d}!O*d!Q![*j~*gP!Q![*j~*oQ&o~!Q![*j#R#S*d~*zO!O~~+P[&o~!O!P)o!Q![+u!g!h*W#R#S,m#W#X-X#X#Y*W#[#]-p#a#b.U#g#h.x#k#l/Z#l#m0d#m#n/u~+zZ&o~!O!P)o!Q![+u!g!h*W#R#S,m#W#X-X#X#Y*W#[#]-p#a#b.U#g#h.x#k#l/Z#m#n/u~,pP!Q![,s~,xT&o~!O!P)o!Q![,s!g!h*W#R#S,m#X#Y*W~-^P&o~!Q![-a~-dS!Q![-a#[#]-p#a#b.U#g#h.x~-uP&o~!Q![-x~-{R!Q![-x#a#b.U#g#h.x~.ZQ&o~!Q![.a#g#h.s~.dR!Q![.a#a#b.m#g#h.x~.pP#g#h.s~.xO&o~~.}P&o~!Q![/Q~/TQ!Q![/Q#a#b.m~/`P&o~!Q![/c~/fT!Q![/c#W#X-X#[#]-p#a#b.U#g#h.x~/zP&o~!Q![/}~0QU!Q![/}#W#X-X#[#]-p#a#b.U#g#h.x#k#l/Z~0gR!Q![0p!c!i0p#T#Z0p~0uR&o~!Q![0p!c!i0p#T#Z0pV1VT&qS!]R!Q![1f![!]1f!c!}1f#R#S1f#T#o1fR1kT!]R!Q![1f![!]1f!c!}1f#R#S1f#T#o1f~2PP!W~!_!`2S~2XO!V~~2^Q$aP!_!`2d#r#s2iQ2iO!SQ~2nO$b~~2sP!U~!_!`2v~2{O!T~~3QO$f~V3XT!]RuS!Q![3Q![!]1f!c!}3Q#R#S3Q#T#o3Q~3mO&l~~3rO&p~~3wOz~~3zTO#S3w#S#T%c#T;'S3w;'S;=`4Z<%lO3w~4^P;=`<%l3w~4fO&r~~4kO&s~",
              tokenizers: [0, 1, 2],
              topRules: { PromQL: [0, 32], MetricName: [1, 162] },
              specialized: [
                { term: 59, get: (e, t) => T(e) << 1, external: T },
                { term: 59, get: (e, t) => (R(e) << 1) | 1, external: R, extend: !0 },
                { term: 59, get: (e) => N[e] || -1 },
              ],
              tokenPrec: 0,
            });
        },
        9914: (e, t, i) => {
          "use strict";
          var r;
          (i.d(t, { n1: () => yr, Js: () => Pr, gu: () => kr }),
            (function (e) {
              ((e.EXCEPTION = "exception"),
                (e.LOG = "log"),
                (e.MEASUREMENT = "measurement"),
                (e.TRACE = "trace"),
                (e.EVENT = "event"));
            })(r || (r = {})));
          const n = {
            [r.EXCEPTION]: "exceptions",
            [r.LOG]: "logs",
            [r.MEASUREMENT]: "measurements",
            [r.TRACE]: "traces",
            [r.EVENT]: "events",
          };
          function s(e, t) {
            return typeof e === t;
          }
          function o(e, t) {
            return Object.prototype.toString.call(e) === `[object ${t}]`;
          }
          function a(e, t) {
            try {
              return e instanceof t;
            } catch (e) {
              return !1;
            }
          }
          const l = (e) => s(e, "null"),
            u = (e) => s(e, "string"),
            c = (e) => (s(e, "number") && !isNaN(e)) || s(e, "bigint"),
            h = (e) => s(e, "boolean"),
            d = (e) => !l(e) && s(e, "object"),
            f = (e) => s(e, "function"),
            p = (e) => o(e, "Array"),
            m = "undefined" != typeof Event,
            g = "undefined" != typeof Error,
            v = (e) => g && a(e, Error);
          function b(e) {
            return (
              null == e || (p(e) || u(e) ? 0 === e.length : !!d(e) && 0 === Object.keys(e).length)
            );
          }
          function O(e = {}) {
            return JSON.stringify(
              null != e ? e : {},
              (function () {
                const e = new WeakSet();
                return function (t, i) {
                  if (d(i) && null !== i) {
                    if (e.has(i)) return null;
                    e.add(i);
                  }
                  return i;
                };
              })(),
            );
          }
          function w(e = {}) {
            const t = {};
            for (const [i, r] of Object.entries(e)) t[i] = d(r) && null !== r ? O(r) : String(r);
            return t;
          }
          function $() {
            return Date.now();
          }
          function y() {
            return new Date().toISOString();
          }
          function E(e) {
            return new Date(e).toISOString();
          }
          function S(e, t) {
            if (e === t) return !0;
            if (s(e, "number") && isNaN(e)) return s(t, "number") && isNaN(t);
            const i = p(e),
              r = p(t);
            if (i !== r) return !1;
            if (i && r) {
              const i = e.length;
              if (i !== t.length) return !1;
              for (let r = i; 0 !== r--; ) if (!S(e[r], t[r])) return !1;
              return !0;
            }
            const n = d(e),
              o = d(t);
            if (n !== o) return !1;
            if (e && t && n && o) {
              const i = Object.keys(e),
                r = Object.keys(t);
              if (i.length !== r.length) return !1;
              for (let e of i) if (!r.includes(e)) return !1;
              for (let r of i) if (!S(e[r], t[r])) return !1;
              return !0;
            }
            return !1;
          }
          class x {
            constructor() {
              this.subscribers = [];
            }
            subscribe(e) {
              return (this.subscribers.push(e), { unsubscribe: () => this.unsubscribe(e) });
            }
            unsubscribe(e) {
              this.subscribers = this.subscribers.filter((t) => t !== e);
            }
            notify(e) {
              this.subscribers.forEach((t) => t(e));
            }
            first() {
              const e = new x(),
                t = (t) => {
                  (e.notify(t), i.unsubscribe());
                },
                i = this.subscribe(t),
                r = e.unsubscribe.bind(e);
              return this.withUnsubscribeOverride(e, r, t);
            }
            takeWhile(e) {
              const t = new x(),
                i = (r) => {
                  e(r) ? t.notify(r) : t.unsubscribe(i);
                };
              this.subscribe(i);
              const r = t.unsubscribe.bind(t);
              return this.withUnsubscribeOverride(t, r, i);
            }
            filter(e) {
              const t = new x(),
                i = (i) => {
                  e(i) && t.notify(i);
                };
              this.subscribe(i);
              const r = t.unsubscribe.bind(t);
              return this.withUnsubscribeOverride(t, r, i);
            }
            merge(...e) {
              const t = new x(),
                i = [];
              e.forEach((e) => {
                const r = e.subscribe((e) => {
                  t.notify(e);
                });
                i.push(r);
              });
              const r = t.unsubscribeAll.bind(t);
              return (
                (t.unsubscribe = () => {
                  (i.forEach((e) => e.unsubscribe()), r());
                }),
                t
              );
            }
            withUnsubscribeOverride(e, t, i) {
              return (
                (e.unsubscribe = (e) => {
                  (t(e), this.unsubscribe(i));
                }),
                e
              );
            }
            unsubscribeAll() {
              this.subscribers = [];
            }
          }
          const k = "faroApiCall",
            P = "user_action_start",
            T = { Normal: "normal", Critical: "critical" };
          var I;
          !(function (e) {
            ((e[(e.Started = 0)] = "Started"),
              (e[(e.Halted = 1)] = "Halted"),
              (e[(e.Cancelled = 2)] = "Cancelled"),
              (e[(e.Ended = 3)] = "Ended"));
          })(I || (I = {}));
          const R =
            "undefined" != typeof globalThis
              ? globalThis
              : void 0 !== i.g
                ? i.g
                : "undefined" != typeof self
                  ? self
                  : void 0;
          const A = "_faroInternal";
          let N = {};
          function _(e, t, i, r, n, s, o) {
            return (
              t.debug("Initializing Faro"),
              (N = {
                api: s,
                config: i,
                instrumentations: o,
                internalLogger: t,
                metas: r,
                pause: n.pause,
                transports: n,
                unpatchedConsole: e,
                unpause: n.unpause,
              }),
              (function (e) {
                e.config.isolate
                  ? e.internalLogger.debug(
                      "Skipping registering internal Faro instance on global object",
                    )
                  : (e.internalLogger.debug("Registering internal Faro instance on global object"),
                    Object.defineProperty(R, A, {
                      configurable: !1,
                      enumerable: !1,
                      writable: !1,
                      value: e,
                    }));
              })(N),
              (function (e) {
                if (e.config.preventGlobalExposure)
                  e.internalLogger.debug(
                    "Skipping registering public Faro instance in the global scope",
                  );
                else {
                  if (
                    (e.internalLogger.debug(
                      `Registering public faro reference in the global scope using "${e.config.globalObjectKey}" key`,
                    ),
                    e.config.globalObjectKey in R)
                  )
                    return void e.internalLogger.warn(
                      `Skipping global registration due to key "${e.config.globalObjectKey}" being used already. Please set "globalObjectKey" to something else or set "preventGlobalExposure" to "true"`,
                    );
                  Object.defineProperty(R, e.config.globalObjectKey, {
                    configurable: !1,
                    writable: !1,
                    value: e,
                  });
                }
              })(N),
              N
            );
          }
          const L = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
          function C(e = 10) {
            return Array.from(Array(e))
              .map(() => L[Math.floor(59 * Math.random())])
              .join("");
          }
          class Q {
            constructor() {
              this.buffer = [];
            }
            addItem(e) {
              this.buffer.push(e);
            }
            flushBuffer(e) {
              if (f(e)) for (const t of this.buffer) e(t);
              this.buffer.length = 0;
            }
            size() {
              return this.buffer.length;
            }
          }
          class X extends x {
            constructor({
              name: e,
              parentId: t,
              trigger: i,
              transports: r,
              attributes: n,
              trackUserActionsExcludeItem: s,
              importance: o = T.Normal,
            }) {
              (super(),
                (this.name = e),
                (this.attributes = n),
                (this.id = C()),
                (this.trigger = i),
                (this.parentId = null != t ? t : this.id),
                (this.trackUserActionsExcludeItem = s),
                (this.importance = o),
                (this._itemBuffer = new Q()),
                (this._transports = r),
                (this._state = I.Started),
                this._start());
            }
            addItem(e) {
              return this._state === I.Started && (this._itemBuffer.addItem(e), !0);
            }
            _start() {
              ((this._state = I.Started), this._state === I.Started && (this.startTime = $()));
            }
            halt() {
              this._state === I.Started && ((this._state = I.Halted), this.notify(this._state));
            }
            cancel() {
              (this._state === I.Started && this._itemBuffer.flushBuffer(),
                (this._state = I.Cancelled),
                this.notify(this._state));
            }
            end() {
              if (this._state === I.Cancelled) return;
              const e = $(),
                t = e - this.startTime;
              ((this._state = I.Ended),
                this._itemBuffer.flushBuffer((e) => {
                  if (
                    (function (e, t) {
                      return (
                        (null == t ? void 0 : t(e)) ||
                        (e.type === r.MEASUREMENT && "web-vitals" === e.payload.type)
                      );
                    })(e, this.trackUserActionsExcludeItem)
                  )
                    return void this._transports.execute(e);
                  const t = Object.assign(Object.assign({}, e), {
                    payload: Object.assign(Object.assign({}, e.payload), {
                      action: { parentId: this.id, name: this.name },
                    }),
                  });
                  this._transports.execute(t);
                }),
                (this._state = I.Ended),
                this.notify(this._state),
                N.api.pushEvent(
                  "faro.user.action",
                  Object.assign(
                    {
                      userActionName: this.name,
                      userActionStartTime: this.startTime.toString(),
                      userActionEndTime: e.toString(),
                      userActionDuration: t.toString(),
                      userActionTrigger: this.trigger,
                      userActionImportance: this.importance,
                    },
                    w(this.attributes),
                  ),
                  void 0,
                  {
                    timestampOverwriteMs: this.startTime,
                    customPayloadTransformer: (e) => (
                      (e.action = { id: this.id, name: this.name }),
                      e
                    ),
                  },
                ));
            }
            getState() {
              return this._state;
            }
          }
          const D = new x();
          function U(e, t) {
            if (!e) return !1;
            return (null == e ? void 0 : e.getState()) === I.Started && (e.addItem(t), !0);
          }
          const M = "Error",
            j = (e) => e.map((e) => (d(e) ? O(e) : String(e))).join(" ");
          let F;
          function z({
            internalLogger: e,
            config: t,
            metas: i,
            transports: n,
            tracesApi: s,
            userActionsApi: o,
          }) {
            var a;
            e.debug("Initializing exceptions API");
            let c = null;
            F = null !== (a = t.parseStacktrace) && void 0 !== a ? a : F;
            const h = (t) => {
                (e.debug("Changing stacktrace parser"), (F = null != t ? t : F));
              },
              { ignoreErrors: f = [], preserveOriginalError: m } = t;
            return (
              h(t.parseStacktrace),
              {
                changeStacktraceParser: h,
                getStacktraceParser: () => F,
                pushError: (
                  a,
                  {
                    skipDedupe: h,
                    stackFrames: g,
                    type: $,
                    context: x,
                    spanContext: k,
                    timestampOverwriteMs: P,
                    originalError: T,
                  } = {},
                ) => {
                  if (
                    !(function (e, t) {
                      const { message: i, name: r, stack: n } = t;
                      return (
                        (s = e),
                        (o = i + " " + r + " " + n),
                        s.some((e) => (u(e) ? o.includes(e) : !!o.match(e)))
                      );
                      var s, o;
                    })(f, null != T ? T : a)
                  )
                    try {
                      const u = w(
                          Object.assign(
                            Object.assign(
                              {},
                              (function (e) {
                                let t = e.cause;
                                v(t)
                                  ? (t = e.cause.toString())
                                  : null !== t && (d(e.cause) || p(e.cause))
                                    ? (t = O(e.cause))
                                    : null != t && (t = e.cause.toString());
                                return null == t ? {} : { cause: t };
                              })(null != T ? T : a),
                            ),
                            null != x ? x : {},
                          ),
                        ),
                        f = {
                          meta: i.value,
                          payload: Object.assign(
                            Object.assign(
                              {
                                type: $ || a.name || M,
                                value: a.message,
                                timestamp: P ? E(P) : y(),
                                trace: k
                                  ? { trace_id: k.traceId, span_id: k.spanId }
                                  : s.getTraceContext(),
                              },
                              b(u) ? {} : { context: u },
                            ),
                            m ? { originalError: T } : {},
                          ),
                          type: r.EXCEPTION,
                        };
                      (null ==
                      (g = null != g ? g : a.stack ? (null == F ? void 0 : F(a).frames) : void 0)
                        ? void 0
                        : g.length) && (f.payload.stacktrace = { frames: g });
                      const I = {
                        type: f.payload.type,
                        value: f.payload.value,
                        stackTrace: f.payload.stacktrace,
                        context: f.payload.context,
                      };
                      if (!h && t.dedupe && !l(c) && S(I, c))
                        return void e.debug(
                          "Skipping error push because it is the same as the last one\n",
                          f.payload,
                        );
                      ((c = I),
                        e.debug("Pushing exception\n", f),
                        U(o.getActiveUserAction(), f) || n.execute(f));
                    } catch (t) {
                      e.error("Error pushing event", t);
                    }
                },
              }
            );
          }
          var q = i(5438);
          const H = (e) =>
            e
              .map((e) => {
                try {
                  return String(e);
                } catch (e) {
                  return "";
                }
              })
              .join(" ");
          function B(e, t, i, n, s) {
            t.debug("Initializing API");
            const o = (function ({ transports: e, internalLogger: t, config: i }) {
                var r;
                const n =
                  null === (r = i.userActionsInstrumentation) || void 0 === r
                    ? void 0
                    : r.excludeItem;
                let s;
                const o = () => s,
                  a = {
                    startUserAction: (i, r, a) => {
                      if (void 0 === o()) {
                        const t = new X({
                          name: i,
                          transports: e,
                          attributes: r,
                          trigger: (null == a ? void 0 : a.triggerName) || k,
                          importance: (null == a ? void 0 : a.importance) || T.Normal,
                          trackUserActionsExcludeItem: n,
                        });
                        return (
                          t
                            .filter((e) => [I.Ended, I.Cancelled].includes(e))
                            .first()
                            .subscribe(() => {
                              s = void 0;
                            }),
                          D.notify({ type: P, userAction: t }),
                          (s = t),
                          s
                        );
                      }
                      t.error(
                        "Attempted to create a new user action while one is already running. This is not possible.",
                      );
                    },
                    getActiveUserAction: o,
                  };
                return a;
              })({ transports: s, config: i, internalLogger: t }),
              a = (function (e, t, i, n, s) {
                let o;
                return (
                  t.debug("Initializing traces API"),
                  {
                    getOTEL: () => o,
                    getTraceContext: () => {
                      const e = null == o ? void 0 : o.trace.getSpanContext(o.context.active());
                      return e ? { trace_id: e.traceId, span_id: e.spanId } : void 0;
                    },
                    initOTEL: (e, i) => {
                      (t.debug("Initializing OpenTelemetry"), (o = { trace: e, context: i }));
                    },
                    isOTELInitialized: () => !!o,
                    pushTraces: (e) => {
                      try {
                        const i = { type: r.TRACE, payload: e, meta: n.value };
                        (t.debug("Pushing trace\n", i), s.execute(i));
                      } catch (e) {
                        t.error("Error pushing trace\n", e);
                      }
                    },
                  }
                );
              })(0, t, 0, n, s),
              c = {
                unpatchedConsole: e,
                internalLogger: t,
                userActionsApi: o,
                config: i,
                metas: n,
                transports: s,
                tracesApi: a,
              };
            return Object.assign(
              Object.assign(
                Object.assign(
                  Object.assign(
                    Object.assign(
                      Object.assign(Object.assign({}, a), z(c)),
                      (function ({ internalLogger: e, metas: t }) {
                        let i, r, n, s;
                        e.debug("Initializing meta API");
                        const o = (e) => {
                            (r && t.remove(r), (r = { user: e }), t.add(r));
                          },
                          a = (e, r) => {
                            var n;
                            const s = null == r ? void 0 : r.overrides,
                              o = s
                                ? {
                                    overrides: Object.assign(
                                      Object.assign(
                                        {},
                                        null === (n = null == i ? void 0 : i.session) ||
                                          void 0 === n
                                          ? void 0
                                          : n.overrides,
                                      ),
                                      s,
                                    ),
                                  }
                                : {};
                            (i && t.remove(i),
                              (i = {
                                session: Object.assign(Object.assign({}, b(e) ? void 0 : e), o),
                              }),
                              t.add(i));
                          },
                          l = () => t.value.session,
                          c = () => t.value.page;
                        return {
                          setUser: o,
                          resetUser: o,
                          setSession: a,
                          resetSession: a,
                          getSession: l,
                          setView: (e, i) => {
                            var r;
                            if (
                              ((null == i ? void 0 : i.overrides) &&
                                a(l(), { overrides: i.overrides }),
                              (null === (r = null == n ? void 0 : n.view) || void 0 === r
                                ? void 0
                                : r.name) === (null == e ? void 0 : e.name))
                            )
                              return;
                            const s = n;
                            ((n = { view: e }), t.add(n), s && t.remove(s));
                          },
                          getView: () => t.value.view,
                          setPage: (e) => {
                            var i;
                            const r = u(e)
                              ? Object.assign(
                                  Object.assign(
                                    {},
                                    null !== (i = null == s ? void 0 : s.page) && void 0 !== i
                                      ? i
                                      : c(),
                                  ),
                                  { id: e },
                                )
                              : e;
                            (s && t.remove(s), (s = { page: r }), t.add(s));
                          },
                          getPage: c,
                        };
                      })(c),
                    ),
                    (function ({
                      internalLogger: e,
                      config: t,
                      metas: i,
                      transports: n,
                      tracesApi: s,
                      userActionsApi: o,
                    }) {
                      var a;
                      e.debug("Initializing logs API");
                      let u = null;
                      const c = null !== (a = t.logArgsSerializer) && void 0 !== a ? a : H;
                      return {
                        pushLog: (
                          a,
                          {
                            context: h,
                            level: d,
                            skipDedupe: f,
                            spanContext: p,
                            timestampOverwriteMs: m,
                          } = {},
                        ) => {
                          try {
                            const g = w(h),
                              v = {
                                type: r.LOG,
                                payload: {
                                  message: c(a),
                                  level: null != d ? d : q.Ic,
                                  context: b(g) ? void 0 : g,
                                  timestamp: m ? E(m) : y(),
                                  trace: p
                                    ? { trace_id: p.traceId, span_id: p.spanId }
                                    : s.getTraceContext(),
                                },
                                meta: i.value,
                              },
                              O = {
                                message: v.payload.message,
                                level: v.payload.level,
                                context: v.payload.context,
                              };
                            if (!f && t.dedupe && !l(u) && S(O, u))
                              return void e.debug(
                                "Skipping log push because it is the same as the last one\n",
                                v.payload,
                              );
                            ((u = O),
                              e.debug("Pushing log\n", v),
                              U(o.getActiveUserAction(), v) || n.execute(v));
                          } catch (t) {
                            e.error("Error pushing log\n", t);
                          }
                        },
                      };
                    })(c),
                  ),
                  (function ({
                    internalLogger: e,
                    config: t,
                    metas: i,
                    transports: n,
                    tracesApi: s,
                    userActionsApi: o,
                  }) {
                    e.debug("Initializing measurements API");
                    let a = null;
                    return {
                      pushMeasurement: (
                        u,
                        { skipDedupe: c, context: h, spanContext: d, timestampOverwriteMs: f } = {},
                      ) => {
                        try {
                          const p = w(h),
                            m = {
                              type: r.MEASUREMENT,
                              payload: Object.assign(Object.assign({}, u), {
                                trace: d
                                  ? { trace_id: d.traceId, span_id: d.spanId }
                                  : s.getTraceContext(),
                                timestamp: f ? E(f) : y(),
                                context: b(p) ? void 0 : p,
                              }),
                              meta: i.value,
                            },
                            g = {
                              type: m.payload.type,
                              values: m.payload.values,
                              context: m.payload.context,
                            };
                          if (!c && t.dedupe && !l(a) && S(g, a))
                            return void e.debug(
                              "Skipping measurement push because it is the same as the last one\n",
                              m.payload,
                            );
                          ((a = g),
                            e.debug("Pushing measurement\n", m),
                            U(o.getActiveUserAction(), m) || n.execute(m));
                        } catch (t) {
                          e.error("Error pushing measurement\n", t);
                        }
                      },
                    };
                  })(c),
                ),
                (function ({
                  internalLogger: e,
                  config: t,
                  metas: i,
                  transports: n,
                  tracesApi: s,
                  userActionsApi: o,
                }) {
                  let a = null;
                  return {
                    pushEvent: (
                      u,
                      c,
                      h,
                      {
                        skipDedupe: d,
                        spanContext: f,
                        timestampOverwriteMs: p,
                        customPayloadTransformer: m = (e) => e,
                      } = {},
                    ) => {
                      try {
                        const g = w(c),
                          v = {
                            meta: i.value,
                            payload: m({
                              name: u,
                              domain: null != h ? h : t.eventDomain,
                              attributes: b(g) ? void 0 : g,
                              timestamp: p ? E(p) : y(),
                              trace: f
                                ? { trace_id: f.traceId, span_id: f.spanId }
                                : s.getTraceContext(),
                            }),
                            type: r.EVENT,
                          },
                          O = {
                            name: v.payload.name,
                            attributes: v.payload.attributes,
                            domain: v.payload.domain,
                          };
                        if (!d && t.dedupe && !l(a) && S(O, a))
                          return void e.debug(
                            "Skipping event push because it is the same as the last one\n",
                            v.payload,
                          );
                        ((a = O),
                          e.debug("Pushing event\n", v),
                          U(o.getActiveUserAction(), v) || n.execute(v));
                      } catch (t) {
                        e.error("Error pushing event", t);
                      }
                    },
                  };
                })(c),
              ),
              o,
            );
          }
          function G() {}
          var V;
          !(function (e) {
            ((e[(e.OFF = 0)] = "OFF"),
              (e[(e.ERROR = 1)] = "ERROR"),
              (e[(e.WARN = 2)] = "WARN"),
              (e[(e.INFO = 3)] = "INFO"),
              (e[(e.VERBOSE = 4)] = "VERBOSE"));
          })(V || (V = {}));
          const Y = { debug: G, error: G, info: G, prefix: "Faro", warn: G },
            W = V.ERROR,
            Z = Object.assign({}, console);
          function K(e = Z, t = W) {
            const i = Y;
            return (
              t > V.OFF &&
                ((i.error =
                  t >= V.ERROR
                    ? function (...t) {
                        e.error(`${i.prefix}\n`, ...t);
                      }
                    : G),
                (i.warn =
                  t >= V.WARN
                    ? function (...t) {
                        e.warn(`${i.prefix}\n`, ...t);
                      }
                    : G),
                (i.info =
                  t >= V.INFO
                    ? function (...t) {
                        e.info(`${i.prefix}\n`, ...t);
                      }
                    : G),
                (i.debug =
                  t >= V.VERBOSE
                    ? function (...t) {
                        e.debug(`${i.prefix}\n`, ...t);
                      }
                    : G)),
              i
            );
          }
          let J = Y;
          function ee(e, t) {
            return ((J = K(e, t.internalLoggerLevel)), J);
          }
          const te = "2.0.2";
          class ie {
            constructor(e, t) {
              var i, r;
              ((this.signalBuffer = []),
                (this.itemLimit =
                  null !== (i = null == t ? void 0 : t.itemLimit) && void 0 !== i ? i : 50),
                (this.sendTimeout =
                  null !== (r = null == t ? void 0 : t.sendTimeout) && void 0 !== r ? r : 250),
                (this.paused = (null == t ? void 0 : t.paused) || !1),
                (this.sendFn = e),
                (this.flushInterval = -1),
                this.paused || this.start(),
                document.addEventListener("visibilitychange", () => {
                  "hidden" === document.visibilityState && this.flush();
                }));
            }
            addItem(e) {
              this.paused ||
                (this.signalBuffer.push(e),
                this.signalBuffer.length >= this.itemLimit && this.flush());
            }
            start() {
              ((this.paused = !1),
                this.sendTimeout > 0 &&
                  (this.flushInterval = window.setInterval(() => this.flush(), this.sendTimeout)));
            }
            pause() {
              ((this.paused = !0), clearInterval(this.flushInterval));
            }
            groupItems(e) {
              const t = new Map();
              return (
                e.forEach((e) => {
                  const i = JSON.stringify(e.meta);
                  let r = t.get(i);
                  ((r = void 0 === r ? [e] : [...r, e]), t.set(i, r));
                }),
                Array.from(t.values())
              );
            }
            flush() {
              if (this.paused || 0 === this.signalBuffer.length) return;
              (this.groupItems(this.signalBuffer).forEach(this.sendFn), (this.signalBuffer = []));
            }
          }
          function re(e, t, i, r) {
            var n;
            t.debug("Initializing transports");
            const s = [];
            let o = i.paused,
              a = [];
            const l = (e) => {
                let t = e;
                for (const e of a) {
                  const r = t.map(e).filter(Boolean);
                  if (0 === r.length) return [];
                  t = ne(r, i);
                }
                return t;
              },
              u = (e) => {
                const i = l(e);
                if (0 !== i.length)
                  for (const e of s)
                    (t.debug(`Transporting item using ${e.name}\n`, i), e.isBatched() && e.send(i));
              };
            let c;
            (null === (n = i.batching) || void 0 === n ? void 0 : n.enabled) &&
              (c = new ie(u, {
                sendTimeout: i.batching.sendTimeout,
                itemLimit: i.batching.itemLimit,
                paused: o,
              }));
            return {
              add: (...n) => {
                (t.debug("Adding transports"),
                  n.forEach((n) => {
                    t.debug(`Adding "${n.name}" transport`);
                    s.some((e) => e === n)
                      ? t.warn(`Transport ${n.name} is already added`)
                      : ((n.unpatchedConsole = e),
                        (n.internalLogger = t),
                        (n.config = i),
                        (n.metas = r),
                        s.push(n));
                  }));
              },
              addBeforeSendHooks: (...e) => {
                (t.debug("Adding beforeSendHooks\n", a),
                  e.forEach((e) => {
                    e && a.push(e);
                  }));
              },
              getBeforeSendHooks: () => [...a],
              execute: (e) => {
                var r;
                o ||
                  ((null === (r = i.batching) || void 0 === r ? void 0 : r.enabled) &&
                    (null == c || c.addItem(e)),
                  ((e) => {
                    var r, n;
                    if (
                      (null === (r = i.batching) || void 0 === r ? void 0 : r.enabled) &&
                      s.every((e) => e.isBatched())
                    )
                      return;
                    const [o] = l([e]);
                    if (void 0 !== o)
                      for (const e of s)
                        (t.debug(`Transporting item using ${e.name}\n`, o),
                          e.isBatched()
                            ? (null === (n = i.batching) || void 0 === n ? void 0 : n.enabled) ||
                              e.send([o])
                            : e.send(o));
                  })(e));
              },
              isPaused: () => o,
              pause: () => {
                (t.debug("Pausing transports"), null == c || c.pause(), (o = !0));
              },
              remove: (...e) => {
                (t.debug("Removing transports"),
                  e.forEach((e) => {
                    t.debug(`Removing "${e.name}" transport`);
                    const i = s.indexOf(e);
                    -1 !== i ? s.splice(i, 1) : t.warn(`Transport "${e.name}" is not added`);
                  }));
              },
              removeBeforeSendHooks: (...e) => {
                a.filter((t) => !e.includes(t));
              },
              get transports() {
                return [...s];
              },
              unpause: () => {
                (t.debug("Unpausing transports"), null == c || c.start(), (o = !1));
              },
            };
          }
          function ne(e, t) {
            if (t.preserveOriginalError)
              for (const t of e) t.type === r.EXCEPTION && delete t.payload.originalError;
            return e;
          }
          let se = Z;
          function oe(e) {
            var t;
            return ((se = null !== (t = e.unpatchedConsole) && void 0 !== t ? t : se), se);
          }
          function ae(e) {
            const t = oe(e),
              i = ee(t, e);
            if (A in R && !e.isolate)
              return void i.error(
                'Faro is already registered. Either add instrumentations, transports etc. to the global faro instance or use the "isolate" property',
              );
            i.debug("Initializing");
            const r = (function (e, t) {
                let i = [],
                  r = [];
                const n = () => i.reduce((e, t) => Object.assign(e, f(t) ? t() : t), {}),
                  s = () => {
                    if (r.length) {
                      const e = n();
                      r.forEach((t) => t(e));
                    }
                  };
                return {
                  add: (...e) => {
                    (t.debug("Adding metas\n", e), i.push(...e), s());
                  },
                  remove: (...e) => {
                    (t.debug("Removing metas\n", e), (i = i.filter((t) => !e.includes(t))), s());
                  },
                  addListener: (e) => {
                    (t.debug("Adding metas listener\n", e), r.push(e));
                  },
                  removeListener: (e) => {
                    (t.debug("Removing metas listener\n", e), (r = r.filter((t) => t !== e)));
                  },
                  get value() {
                    return n();
                  },
                };
              })(0, i),
              n = re(t, i, e, r),
              s = B(t, i, e, r, n),
              o = (function (e, t, i, r, n, s) {
                t.debug("Initializing instrumentations");
                const o = [];
                return {
                  add: (...a) => {
                    (t.debug("Adding instrumentations"),
                      a.forEach((a) => {
                        (t.debug(`Adding "${a.name}" instrumentation`),
                          o.some((e) => e.name === a.name)
                            ? t.warn(`Instrumentation ${a.name} is already added`)
                            : ((a.unpatchedConsole = e),
                              (a.internalLogger = t),
                              (a.config = i),
                              (a.metas = r),
                              (a.transports = n),
                              (a.api = s),
                              o.push(a),
                              a.initialize()));
                      }));
                  },
                  get instrumentations() {
                    return [...o];
                  },
                  remove: (...e) => {
                    (t.debug("Removing instrumentations"),
                      e.forEach((e) => {
                        var i, r;
                        t.debug(`Removing "${e.name}" instrumentation`);
                        const n = o.reduce(
                          (t, i, r) => (null === t && i.name === e.name ? r : null),
                          null,
                        );
                        null !== n
                          ? (null === (r = (i = o[n]).destroy) || void 0 === r || r.call(i),
                            o.splice(n, 1))
                          : t.warn(`Instrumentation "${e.name}" is not added`);
                      }));
                  },
                };
              })(t, i, e, r, n, s),
              a = _(t, i, e, r, n, s, o);
            return (
              (function (e) {
                var t, i;
                const r = {
                  sdk: { version: te },
                  app: {
                    bundleId:
                      e.config.app.name &&
                      ((n = e.config.app.name), null == R ? void 0 : R[`__faroBundleId_${n}`]),
                  },
                };
                var n;
                const s =
                  null === (t = e.config.sessionTracking) || void 0 === t ? void 0 : t.session;
                (s && e.api.setSession(s),
                  e.config.app && (r.app = Object.assign(Object.assign({}, e.config.app), r.app)),
                  e.config.user && (r.user = e.config.user),
                  e.config.view && (r.view = e.config.view),
                  e.metas.add(r, ...(null !== (i = e.config.metas) && void 0 !== i ? i : [])));
              })(a),
              (function (e) {
                (e.transports.add(...e.config.transports),
                  e.transports.addBeforeSendHooks(e.config.beforeSend));
              })(a),
              (function (e) {
                e.instrumentations.add(...e.config.instrumentations);
              })(a),
              a
            );
          }
          const le = "faro",
            ue = { enabled: !0, sendTimeout: 250, itemLimit: 50 },
            ce = "browser",
            he = "\n",
            de = "eval",
            fe = "?",
            pe = "@",
            me =
              /^\s*at (?:(?![a-z]+:\/\/)([^(]+?) ?\((?:address at )?)?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
            ge = /\((\S*)(?::(\d+))(?::(\d+))\)/,
            ve = "eval",
            be = "address at ",
            Oe = be.length,
            we =
              /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension|safari-extension|safari-web-extension|capacitor)?:\/.*?|\[native code]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
            $e = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
            ye = " > eval",
            Ee = "safari-extension",
            Se = "safari-web-extension",
            xe = /Minified React error #\d+;/i;
          function ke(e, t, i, r) {
            const n = { filename: e || document.location.href, function: t || fe };
            return (void 0 !== i && (n.lineno = i), void 0 !== r && (n.colno = r), n);
          }
          function Pe(e, t) {
            const i = null == e ? void 0 : e.includes(Ee),
              r = !i && (null == e ? void 0 : e.includes(Se));
            return i || r
              ? [
                  (null == e ? void 0 : e.includes(pe)) ? e.split(pe)[0] : e,
                  i ? `${Ee}:${t}` : `${Se}:${t}`,
                ]
              : [e, t];
          }
          function Te(e) {
            let t = [];
            e.stacktrace
              ? (t = e.stacktrace.split(he).filter((e, t) => t % 2 == 0))
              : e.stack && (t = e.stack.split(he));
            const i = t.reduce((t, i, r) => {
              let n, s, o, a, l;
              if ((n = me.exec(i))) {
                if (
                  ((s = n[1]),
                  (o = n[2]),
                  (a = n[3]),
                  (l = n[4]),
                  null == o ? void 0 : o.startsWith(ve))
                ) {
                  const e = ge.exec(o);
                  e && ((o = e[1]), (a = e[2]), (l = e[3]));
                }
                ((o = (null == o ? void 0 : o.startsWith(be)) ? o.substring(Oe) : o),
                  ([s, o] = Pe(s, o)));
              } else if ((n = we.exec(i))) {
                if (((s = n[1]), (o = n[3]), (a = n[4]), (l = n[5]), o && o.includes(ye))) {
                  const e = $e.exec(o);
                  e && ((s = s || de), (o = e[1]), (a = e[2]));
                } else 0 === r && !l && c(e.columnNumber) && (l = String(e.columnNumber + 1));
                [s, o] = Pe(s, o);
              }
              return (
                (o || s) && t.push(ke(o, s, a ? Number(a) : void 0, l ? Number(l) : void 0)),
                t
              );
            }, []);
            return xe.test(e.message) ? i.slice(1) : i;
          }
          function Ie(e) {
            return { frames: Te(e) };
          }
          const Re = "com.grafana.faro.session",
            Ae = 9e5,
            Ne = { enabled: !0, persistent: !1, maxSessionPersistenceTime: Ae },
            _e = "data-faro-user-action-name";
          var Le = i(6660);
          const Ce = "unknown",
            Qe = () => {
              const e = new Le.UAParser(),
                { name: t, version: i } = e.getBrowser(),
                { name: r, version: n } = e.getOS(),
                s = e.getUA(),
                o = navigator.language,
                a = navigator.userAgent.includes("Mobi"),
                l = (function () {
                  if (!t || !i) return;
                  if ("userAgentData" in navigator && navigator.userAgentData)
                    return navigator.userAgentData.brands;
                  return;
                })();
              return {
                browser: {
                  name: null != t ? t : Ce,
                  version: null != i ? i : Ce,
                  os: `${null != r ? r : Ce} ${null != n ? n : Ce}`,
                  userAgent: null != s ? s : Ce,
                  language: null != o ? o : Ce,
                  mobile: a,
                  brands: null != l ? l : Ce,
                  viewportWidth: `${window.innerWidth}`,
                  viewportHeight: `${window.innerHeight}`,
                },
              };
            },
            Xe = () => {
              const e = window.k6;
              return {
                k6: Object.assign(
                  { isK6Browser: !0 },
                  (null == e ? void 0 : e.testRunId) && {
                    testRunId: null == e ? void 0 : e.testRunId,
                  },
                ),
              };
            };
          let De, Ue;
          function Me({ generatePageId: e, initialPageMeta: t } = {}) {
            return () => {
              const i = location.href;
              return (
                f(e) && De !== i && ((De = i), (Ue = e(location))),
                { page: Object.assign(Object.assign({ url: i }, Ue ? { id: Ue } : {}), t) }
              );
            };
          }
          class je {
            constructor() {
              ((this.unpatchedConsole = Z),
                (this.internalLogger = Y),
                (this.config = {}),
                (this.metas = {}));
            }
            logDebug(...e) {
              this.internalLogger.debug(`${this.name}\n`, ...e);
            }
            logInfo(...e) {
              this.internalLogger.info(`${this.name}\n`, ...e);
            }
            logWarn(...e) {
              this.internalLogger.warn(`${this.name}\n`, ...e);
            }
            logError(...e) {
              this.internalLogger.error(`${this.name}\n`, ...e);
            }
          }
          class Fe extends je {
            isBatched() {
              return !1;
            }
            getIgnoreUrls() {
              return [];
            }
          }
          function ze(e, t) {
            var i, r;
            if (void 0 === t) return e;
            if (void 0 === e) return { resourceSpans: t };
            const n = null === (i = e.resourceSpans) || void 0 === i ? void 0 : i[0];
            if (void 0 === n) return e;
            const s = (null == n ? void 0 : n.scopeSpans) || [],
              o =
                (null === (r = null == t ? void 0 : t[0]) || void 0 === r
                  ? void 0
                  : r.scopeSpans) || [];
            return Object.assign(Object.assign({}, e), {
              resourceSpans: [Object.assign(Object.assign({}, n), { scopeSpans: [...s, ...o] })],
            });
          }
          function qe(e, t) {
            let i,
              r = !1;
            const n = () => {
              null != i ? (e(...i), (i = null), setTimeout(n, t)) : (r = !1);
            };
            return (...s) => {
              r ? (i = s) : (e(...s), (r = !0), setTimeout(n, t));
            };
          }
          const He = "sessionStorage",
            Be = "localStorage";
          function Ge(e) {
            var t;
            try {
              let t;
              t = window[e];
              const i = "__faro_storage_test__";
              return (t.setItem(i, i), t.removeItem(i), !0);
            } catch (i) {
              return (
                null === (t = N.internalLogger) ||
                  void 0 === t ||
                  t.info(`Web storage of type ${e} is not available. Reason: ${i}`),
                !1
              );
            }
          }
          function Ve(e, t) {
            return Je(t) ? window[t].getItem(e) : null;
          }
          function Ye(e, t, i) {
            if (Je(i))
              try {
                window[i].setItem(e, t);
              } catch (e) {}
          }
          function We(e, t) {
            Je(t) && window[t].removeItem(e);
          }
          const Ze = Ge(Be),
            Ke = Ge(He);
          function Je(e) {
            return e === Be ? Ze : e === He && Ke;
          }
          const et = "session_start",
            tt = "session_resume",
            it = "service_name_override";
          function rt() {
            var e, t, i;
            const r = N.config.sessionTracking;
            let n =
              null !==
                (i =
                  null !==
                    (t =
                      null === (e = null == r ? void 0 : r.sampler) || void 0 === e
                        ? void 0
                        : e.call(r, { metas: N.metas.value })) && void 0 !== t
                    ? t
                    : null == r
                      ? void 0
                      : r.samplingRate) && void 0 !== i
                ? i
                : 1;
            if ("number" != typeof n) {
              n = 0;
            }
            return Math.random() < n;
          }
          function nt({ sessionId: e, started: t, lastActivity: i, isSampled: r = !0 } = {}) {
            var n, s;
            const o = $(),
              a =
                null ===
                  (s = null === (n = N.config) || void 0 === n ? void 0 : n.sessionTracking) ||
                void 0 === s
                  ? void 0
                  : s.generateSessionId;
            return (
              null == e && (e = "function" == typeof a ? a() : C()),
              {
                sessionId: e,
                lastActivity: null != i ? i : o,
                started: null != t ? t : o,
                isSampled: r,
              }
            );
          }
          function st(e) {
            if (null == e) return !1;
            const t = $();
            if (!(t - e.started < 144e5)) return !1;
            return t - e.lastActivity < Ae;
          }
          function ot({ fetchUserSession: e, storeUserSession: t }) {
            return function ({ forceSessionExtend: i } = { forceSessionExtend: !1 }) {
              var r, n, s;
              if (!e || !t) return;
              const o = N.config.sessionTracking,
                a = null == o ? void 0 : o.persistent;
              if ((a && !Ze) || (!a && !Ke)) return;
              const l = e();
              if (!1 === i && st(l)) t(Object.assign(Object.assign({}, l), { lastActivity: $() }));
              else {
                let e = at(nt({ isSampled: rt() }), l);
                (t(e),
                  null === (r = N.api) || void 0 === r || r.setSession(e.sessionMeta),
                  null === (n = null == o ? void 0 : o.onSessionChange) ||
                    void 0 === n ||
                    n.call(
                      o,
                      null !== (s = null == l ? void 0 : l.sessionMeta) && void 0 !== s ? s : null,
                      e.sessionMeta,
                    ));
              }
            };
          }
          function at(e, t) {
            var i, r, n, s, o, a, l;
            const u = Object.assign(Object.assign({}, e), {
                sessionMeta: {
                  id: e.sessionId,
                  attributes: Object.assign(
                    Object.assign(
                      Object.assign(
                        {},
                        null ===
                          (r =
                            null === (i = N.config.sessionTracking) || void 0 === i
                              ? void 0
                              : i.session) || void 0 === r
                          ? void 0
                          : r.attributes,
                      ),
                      null !==
                        (s =
                          null === (n = N.metas.value.session) || void 0 === n
                            ? void 0
                            : n.attributes) && void 0 !== s
                        ? s
                        : {},
                    ),
                    { isSampled: e.isSampled.toString() },
                  ),
                },
              }),
              c =
                null !==
                  (a =
                    null === (o = N.metas.value.session) || void 0 === o ? void 0 : o.overrides) &&
                void 0 !== a
                  ? a
                  : null === (l = null == t ? void 0 : t.sessionMeta) || void 0 === l
                    ? void 0
                    : l.overrides;
            b(c) || (u.sessionMeta.overrides = c);
            const h = null == t ? void 0 : t.sessionId;
            return (null != h && (u.sessionMeta.attributes.previousSession = h), u);
          }
          function lt({ fetchUserSession: e, storeUserSession: t }) {
            return function (i) {
              const r = i.session,
                n = e();
              let s = null == r ? void 0 : r.id;
              const o = null == r ? void 0 : r.attributes,
                a = null == r ? void 0 : r.overrides,
                l = null == n ? void 0 : n.sessionMeta,
                u = null == l ? void 0 : l.overrides,
                c = !!a && !S(a, u),
                h = !!o && !S(o, null == l ? void 0 : l.attributes);
              if ((!!r && s !== (null == n ? void 0 : n.sessionId)) || h || c) {
                const e = at(nt({ sessionId: s, isSampled: rt() }), n);
                (t(e),
                  (function (e, t = {}, i = {}) {
                    var r, n, s;
                    if (!e) return;
                    const o = t.serviceName,
                      a =
                        null !==
                          (s =
                            null !== (r = i.serviceName) && void 0 !== r
                              ? r
                              : null === (n = N.metas.value.app) || void 0 === n
                                ? void 0
                                : n.name) && void 0 !== s
                          ? s
                          : "";
                    o && o !== a && N.api.pushEvent(it, { serviceName: o, previousServiceName: a });
                  })(c, a, u),
                  N.api.setSession(e.sessionMeta));
              }
            };
          }
          class ut {
            constructor() {
              ((this.updateSession = qe(() => this.updateUserSession(), 1e3)),
                (this.updateUserSession = ot({
                  fetchUserSession: ut.fetchUserSession,
                  storeUserSession: ut.storeUserSession,
                })),
                this.init());
            }
            static removeUserSession() {
              We(Re, ut.storageTypeLocal);
            }
            static storeUserSession(e) {
              Ye(Re, O(e), ut.storageTypeLocal);
            }
            static fetchUserSession() {
              const e = Ve(Re, ut.storageTypeLocal);
              return e ? JSON.parse(e) : null;
            }
            init() {
              (document.addEventListener("visibilitychange", () => {
                "visible" === document.visibilityState && this.updateSession();
              }),
                N.metas.addListener(
                  lt({
                    fetchUserSession: ut.fetchUserSession,
                    storeUserSession: ut.storeUserSession,
                  }),
                ));
            }
          }
          ut.storageTypeLocal = Be;
          class ct {
            constructor() {
              ((this.updateSession = qe(() => this.updateUserSession(), 1e3)),
                (this.updateUserSession = ot({
                  fetchUserSession: ct.fetchUserSession,
                  storeUserSession: ct.storeUserSession,
                })),
                this.init());
            }
            static removeUserSession() {
              We(Re, ct.storageTypeSession);
            }
            static storeUserSession(e) {
              Ye(Re, O(e), ct.storageTypeSession);
            }
            static fetchUserSession() {
              const e = Ve(Re, ct.storageTypeSession);
              return e ? JSON.parse(e) : null;
            }
            init() {
              (document.addEventListener("visibilitychange", () => {
                "visible" === document.visibilityState && this.updateSession();
              }),
                N.metas.addListener(
                  lt({
                    fetchUserSession: ct.fetchUserSession,
                    storeUserSession: ct.storeUserSession,
                  }),
                ));
            }
          }
          function ht(e) {
            return (null == e ? void 0 : e.persistent) ? ut : ct;
          }
          ct.storageTypeSession = He;
          var dt = function (e, t, i, r) {
              return new (i || (i = Promise))(function (n, s) {
                function o(e) {
                  try {
                    l(r.next(e));
                  } catch (e) {
                    s(e);
                  }
                }
                function a(e) {
                  try {
                    l(r.throw(e));
                  } catch (e) {
                    s(e);
                  }
                }
                function l(e) {
                  var t;
                  e.done
                    ? n(e.value)
                    : ((t = e.value),
                      t instanceof i
                        ? t
                        : new i(function (e) {
                            e(t);
                          })).then(o, a);
                }
                l((r = r.apply(e, t || [])).next());
              });
            },
            ft = function (e, t) {
              var i = {};
              for (var r in e)
                Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (i[r] = e[r]);
              if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
                var n = 0;
                for (r = Object.getOwnPropertySymbols(e); n < r.length; n++)
                  t.indexOf(r[n]) < 0 &&
                    Object.prototype.propertyIsEnumerable.call(e, r[n]) &&
                    (i[r[n]] = e[r[n]]);
              }
              return i;
            };
          class pt extends Fe {
            constructor(e) {
              var t, i, r, n;
              (super(),
                (this.options = e),
                (this.name = "@grafana/faro-web-sdk:transport-fetch"),
                (this.version = te),
                (this.disabledUntil = new Date()),
                (this.rateLimitBackoffMs =
                  null !== (t = e.defaultRateLimitBackoffMs) && void 0 !== t ? t : 5e3),
                (this.getNow = null !== (i = e.getNow) && void 0 !== i ? i : () => Date.now()),
                (this.promiseBuffer = (function (e) {
                  const { size: t, concurrency: i } = e,
                    r = [];
                  let n = 0;
                  const s = () => {
                    if (n < i && r.length) {
                      const { producer: e, resolve: t, reject: i } = r.shift();
                      (n++,
                        e().then(
                          (e) => {
                            (n--, s(), t(e));
                          },
                          (e) => {
                            (n--, s(), i(e));
                          },
                        ));
                    }
                  };
                  return {
                    add: (e) => {
                      if (r.length + n >= t) throw new Error("Task buffer full");
                      return new Promise((t, i) => {
                        (r.push({ producer: e, resolve: t, reject: i }), s());
                      });
                    },
                  };
                })({
                  size: null !== (r = e.bufferSize) && void 0 !== r ? r : 30,
                  concurrency: null !== (n = e.concurrency) && void 0 !== n ? n : 5,
                })));
            }
            send(e) {
              return dt(this, void 0, void 0, function* () {
                try {
                  if (this.disabledUntil > new Date(this.getNow()))
                    return (
                      this.logWarn(
                        `Dropping transport item due to too many requests. Backoff until ${this.disabledUntil}`,
                      ),
                      Promise.resolve()
                    );
                  yield this.promiseBuffer.add(() => {
                    const t = JSON.stringify(
                        (function (e) {
                          let t = { meta: {} };
                          return (
                            void 0 !== e[0] && (t.meta = e[0].meta),
                            e.forEach((e) => {
                              switch (e.type) {
                                case r.LOG:
                                case r.EVENT:
                                case r.EXCEPTION:
                                case r.MEASUREMENT: {
                                  const i = n[e.type],
                                    r = t[i];
                                  t = Object.assign(Object.assign({}, t), {
                                    [i]: void 0 === r ? [e.payload] : [...r, e.payload],
                                  });
                                  break;
                                }
                                case r.TRACE:
                                  t = Object.assign(Object.assign({}, t), {
                                    traces: ze(t.traces, e.payload.resourceSpans),
                                  });
                              }
                            }),
                            t
                          );
                        })(e),
                      ),
                      { url: i, requestOptions: s, apiKey: o } = this.options,
                      a = null != s ? s : {},
                      { headers: l } = a,
                      u = ft(a, ["headers"]);
                    let c;
                    const h = this.metas.value.session;
                    return (
                      null != h && (c = h.id),
                      fetch(
                        i,
                        Object.assign(
                          {
                            method: "POST",
                            headers: Object.assign(
                              Object.assign(
                                Object.assign(
                                  { "Content-Type": "application/json" },
                                  null != l ? l : {},
                                ),
                                o ? { "x-api-key": o } : {},
                              ),
                              c ? { "x-faro-session-id": c } : {},
                            ),
                            body: t,
                            keepalive: t.length <= 6e4,
                          },
                          null != u ? u : {},
                        ),
                      )
                        .then((e) =>
                          dt(this, void 0, void 0, function* () {
                            if (202 === e.status) {
                              "invalid" === e.headers.get("X-Faro-Session-Status") &&
                                this.extendFaroSession(this.config, this.logDebug);
                            }
                            return (
                              429 === e.status &&
                                ((this.disabledUntil = this.getRetryAfterDate(e)),
                                this.logWarn(
                                  `Too many requests, backing off until ${this.disabledUntil}`,
                                )),
                              e.text().catch(G),
                              e
                            );
                          }),
                        )
                        .catch((e) => {
                          this.logError(
                            "Failed sending payload to the receiver\n",
                            JSON.parse(t),
                            e,
                          );
                        })
                    );
                  });
                } catch (e) {
                  this.logError(e);
                }
              });
            }
            getIgnoreUrls() {
              var e;
              return [this.options.url].concat(
                null !== (e = this.config.ignoreUrls) && void 0 !== e ? e : [],
              );
            }
            isBatched() {
              return !0;
            }
            getRetryAfterDate(e) {
              const t = this.getNow(),
                i = e.headers.get("Retry-After");
              if (i) {
                const e = Number(i);
                if (!isNaN(e)) return new Date(1e3 * e + t);
                const r = Date.parse(i);
                if (!isNaN(r)) return new Date(r);
              }
              return new Date(t + this.rateLimitBackoffMs);
            }
            extendFaroSession(e, t) {
              const i = "Session expired",
                r = e.sessionTracking;
              if (null == r ? void 0 : r.enabled) {
                const { fetchUserSession: e, storeUserSession: n } = ht(r);
                (ot({ fetchUserSession: e, storeUserSession: n })({ forceSessionExtend: !0 }),
                  t(`${i} created new session.`));
              } else t(`${i}.`);
            }
          }
          class mt extends je {
            constructor() {
              (super(...arguments), (this.api = {}), (this.transports = {}));
            }
          }
          const gt = "http-request-start",
            vt = "http-request-end";
          let bt, Ot;
          function wt() {
            return (
              bt || (bt = new x()),
              Ot ||
                ((Ot = new MutationObserver((e, t) => {
                  bt.notify({ type: "dom-mutation" });
                })),
                Ot.observe(document, {
                  attributes: !0,
                  childList: !0,
                  subtree: !0,
                  characterData: !0,
                })),
              bt
            );
          }
          function $t(e = "") {
            return N.transports.transports
              .flatMap((e) => e.getIgnoreUrls())
              .some((t) => e && null != e.match(t));
          }
          const yt = "fetch",
            Et = "xhr";
          let St,
            xt,
            kt,
            Pt = !1;
          function Tt() {
            if (St) return St;
            function e(e) {
              St.notify({ type: gt, request: e });
            }
            function t(e) {
              St.notify({ type: vt, request: e });
            }
            return (
              (St = new x()),
              Pt ||
                (!(function ({ onRequestEnd: e, onRequestStart: t }) {
                  kt || (kt = window.fetch);
                  window.fetch = function () {
                    var i, r;
                    const n =
                      null !==
                        (i = u((s = arguments[0]))
                          ? s
                          : s instanceof URL
                            ? s.href
                            : !b(s) && f(null == s ? void 0 : s.toString)
                              ? s.toString()
                              : void 0) && void 0 !== i
                        ? i
                        : "";
                    var s;
                    const o = $t(n),
                      a = (null !== (r = arguments[1]) && void 0 !== r ? r : {}).method,
                      l = C();
                    return (
                      o || t({ url: n, method: a, requestId: l, apiType: yt }),
                      kt
                        .apply(this, arguments)
                        .then((t) => (o || e({ url: n, method: a, requestId: l, apiType: yt }), t))
                        .catch((t) => {
                          throw (o || e({ url: n, method: a, requestId: l, apiType: yt }), t);
                        })
                    );
                  };
                })({ onRequestStart: e, onRequestEnd: t }),
                (function ({ onRequestStart: e, onRequestEnd: t }) {
                  xt || (xt = XMLHttpRequest.prototype.open);
                  XMLHttpRequest.prototype.open = function () {
                    const i = arguments[1],
                      r = $t(i),
                      n = arguments[0],
                      s = C();
                    (this.addEventListener("loadstart", function () {
                      r || e({ url: i, method: n, requestId: s, apiType: Et });
                    }),
                      this.addEventListener("load", function () {
                        r || t({ url: i, method: n, requestId: s, apiType: Et });
                      }),
                      this.addEventListener("error", function () {
                        r || t({ url: i, method: n, requestId: s, apiType: Et });
                      }),
                      this.addEventListener("abort", function () {
                        r || t({ url: i, method: n, requestId: s, apiType: Et });
                      }),
                      xt.apply(this, arguments));
                  };
                })({ onRequestStart: e, onRequestEnd: t }),
                (Pt = !0)),
              St
            );
          }
          const It = "com.grafana.faro.lastNavigationId",
            Rt = "resource",
            At = /^00-[a-f0-9]{32}-[a-f0-9]{16}-[0-9]{1,2}$/;
          function Nt(e = []) {
            for (const t of e)
              if ("traceparent" === t.name) {
                if (!At.test(t.description)) continue;
                const [, e, i] = t.description.split("-");
                if (null != e && null != i) return { traceId: e, spanId: i };
                break;
              }
          }
          function _t(e, t = {}) {
            for (const [i, r] of Object.entries(t)) {
              const t = e[i];
              return null != t && (p(r) ? r.includes(t) : t === r);
            }
            return !0;
          }
          function Lt(e) {
            const {
              connectEnd: t,
              connectStart: i,
              decodedBodySize: r,
              domainLookupEnd: n,
              domainLookupStart: s,
              duration: o,
              encodedBodySize: a,
              fetchStart: l,
              initiatorType: u,
              name: c,
              nextHopProtocol: h,
              redirectEnd: d,
              redirectStart: f,
              renderBlockingStatus: p,
              requestStart: m,
              responseEnd: g,
              responseStart: v,
              responseStatus: b,
              secureConnectionStart: O,
              transferSize: w,
              workerStart: $,
            } = e;
            return {
              name: c,
              duration: Qt(o),
              tcpHandshakeTime: Qt(t - i),
              dnsLookupTime: Qt(n - s),
              tlsNegotiationTime: Qt(t - O),
              responseStatus: Qt(b),
              redirectTime: Qt(d - f),
              requestTime: Qt(v - m),
              responseTime: Qt(g - v),
              fetchTime: Qt(g - l),
              serviceWorkerTime: Qt(l - $),
              decodedBodySize: Qt(r),
              encodedBodySize: Qt(a),
              cacheHitStatus: (function () {
                let e = "fullLoad";
                0 === w
                  ? r > 0 && (e = "cache")
                  : null != b
                    ? 304 === b && (e = "conditionalFetch")
                    : a > 0 && w < a && (e = "conditionalFetch");
                return e;
              })(),
              renderBlockingStatus: Qt(p),
              protocol: h,
              initiatorType: u,
              visibilityState: document.visibilityState,
              ttfb: Qt(v - m),
              transferSize: Qt(w),
            };
          }
          function Ct(e) {
            const {
                activationStart: t,
                domComplete: i,
                domContentLoadedEventEnd: r,
                domContentLoadedEventStart: n,
                domInteractive: s,
                fetchStart: o,
                loadEventEnd: a,
                loadEventStart: l,
                responseStart: u,
                type: c,
              } = e,
              h = (function () {
                var e;
                if (
                  null !=
                  (null === (e = performance.timing) || void 0 === e ? void 0 : e.domLoading)
                )
                  return performance.timing.domLoading - performance.timeOrigin;
                return null;
              })();
            return Object.assign(Object.assign({}, Lt(e)), {
              pageLoadTime: Qt(i - o),
              documentParsingTime: Qt(h ? s - h : null),
              domProcessingTime: Qt(i - s),
              domContentLoadHandlerTime: Qt(r - n),
              onLoadTime: Qt(a - l),
              ttfb: Qt(Math.max(u - (null != t ? t : 0), 0)),
              type: c,
            });
          }
          function Qt(e) {
            return null == e
              ? Ce
              : "number" == typeof e
                ? Math.round(e > 0 ? e : 0).toString()
                : e.toString();
          }
          const Xt = { initiatorType: ["xmlhttprequest", "fetch"] };
          var Dt = function (e, t, i, r) {
            return new (i || (i = Promise))(function (n, s) {
              function o(e) {
                try {
                  l(r.next(e));
                } catch (e) {
                  s(e);
                }
              }
              function a(e) {
                try {
                  l(r.throw(e));
                } catch (e) {
                  s(e);
                }
              }
              function l(e) {
                var t;
                e.done
                  ? n(e.value)
                  : ((t = e.value),
                    t instanceof i
                      ? t
                      : new i(function (e) {
                          e(t);
                        })).then(o, a);
              }
              l((r = r.apply(e, t || [])).next());
            });
          };
          const Ut = new x();
          class Mt extends mt {
            constructor() {
              (super(...arguments),
                (this.name = "@grafana/faro-web-sdk:instrumentation-performance"),
                (this.version = te));
            }
            initialize() {
              "PerformanceObserver" in window
                ? (function (e) {
                    if ("complete" === document.readyState) e();
                    else {
                      const t = () => {
                        "complete" === document.readyState &&
                          (e(), document.removeEventListener("readystatechange", t));
                      };
                      document.addEventListener("readystatechange", t);
                    }
                  })(() =>
                    Dt(this, void 0, void 0, function* () {
                      const e = this.api.pushEvent,
                        { faroNavigationId: t } = yield (function (e) {
                          let t;
                          const i = new Promise((e) => {
                            t = e;
                          });
                          return (
                            new PerformanceObserver((i) => {
                              var r;
                              const [n] = i.getEntries();
                              if (null == n || $t(n.name)) return;
                              const s = n.toJSON();
                              let o = Nt(null == s ? void 0 : s.serverTiming);
                              const a = null !== (r = Ve(It, He)) && void 0 !== r ? r : Ce,
                                l = Object.assign(Object.assign({}, Ct(s)), {
                                  faroNavigationId: C(),
                                  faroPreviousNavigationId: a,
                                });
                              (Ye(It, l.faroNavigationId, He),
                                e("faro.performance.navigation", l, void 0, {
                                  spanContext: o,
                                  timestampOverwriteMs: performance.timeOrigin + s.startTime,
                                }),
                                t(l));
                            }).observe({ type: "navigation", buffered: !0 }),
                            i
                          );
                        })(e);
                      null != t &&
                        (function (e, t, i) {
                          const r = N.config.trackResources;
                          new PerformanceObserver((n) => {
                            const s = n.getEntries();
                            for (const n of s) {
                              if ($t(n.name)) continue;
                              null == i || i.notify({ type: Rt });
                              const s = n.toJSON();
                              let o = Nt(null == s ? void 0 : s.serverTiming);
                              if ((null == r && _t(s, Xt)) || r) {
                                const i = Object.assign(Object.assign({}, Lt(s)), {
                                  faroNavigationId: e,
                                  faroResourceId: C(),
                                });
                                t("faro.performance.resource", i, void 0, {
                                  spanContext: o,
                                  timestampOverwriteMs: performance.timeOrigin + s.startTime,
                                });
                              }
                            }
                          }).observe({ type: Rt, buffered: !0 });
                        })(t, e, Ut);
                    }),
                  )
                : this.logDebug(
                    "performance observer not supported. Disable performance instrumentation.",
                  );
            }
          }
          let jt,
            Ft,
            zt = !1;
          function qt(e) {
            return e.type === vt;
          }
          class Ht {
            constructor(e) {
              ((this.userAction = e),
                (this.http = Tt()),
                (this.dom = wt()),
                (this.perf =
                  (jt || (jt = new x()),
                  zt ||
                    ((Ft = Ut.subscribe((e) => {
                      e.type === Rt && jt.notify({ type: "resource-entry" });
                    })),
                    (zt = !0)),
                  jt)),
                (this.isValid = !1),
                (this.runningRequests = new Map()));
            }
            attach() {
              ((this.allMonitorsSub = new x()
                .merge(this.http, this.dom, this.perf)
                .takeWhile(() => [I.Started, I.Halted].includes(this.userAction.getState()))
                .filter(
                  (e) =>
                    !!(
                      this.userAction.getState() !== I.Halted ||
                      (qt(e) && this.runningRequests.has(e.request.requestId))
                    ),
                )
                .subscribe((e) => {
                  ((function (e) {
                    return e.type === gt;
                  })(e) && this.runningRequests.set(e.request.requestId, e.request),
                    qt(e) && this.runningRequests.delete(e.request.requestId),
                    qt(e)
                      ? this.userAction.getState() === I.Halted &&
                        0 === this.runningRequests.size &&
                        this.endAction()
                      : (this.isValid || (this.isValid = !0), this.scheduleFollowUp()));
                })),
                (this.stateSub = this.userAction
                  .filter((e) => [I.Ended, I.Cancelled].includes(e))
                  .first()
                  .subscribe(() => this.cleanup())),
                this.scheduleFollowUp());
            }
            scheduleFollowUp() {
              (this.clearTimer(this.followUpTid),
                (this.followUpTid = setTimeout(() => {
                  this.userAction.getState() === I.Started && this.runningRequests.size > 0
                    ? this.haltAction()
                    : this.isValid
                      ? this.endAction()
                      : this.cancelAction();
                }, 100)));
            }
            haltAction() {
              this.userAction.getState() === I.Started &&
                (this.userAction.halt(), this.startHaltTimeout());
            }
            startHaltTimeout() {
              var e, t, i;
              (this.clearTimer(this.haltTid),
                (this.haltTid =
                  ((e = this.haltTid),
                  (t = () => {
                    this.userAction.getState() === I.Halted && this.endAction();
                  }),
                  (i = 1e4),
                  e && clearTimeout(e),
                  setTimeout(() => {
                    t();
                  }, i))));
            }
            endAction() {
              (this.userAction.end(), this.cleanup());
            }
            cancelAction() {
              (this.userAction.cancel(), this.cleanup());
            }
            cleanup() {
              var e, t;
              (this.clearTimer(this.followUpTid),
                this.clearTimer(this.haltTid),
                null === (e = this.allMonitorsSub) || void 0 === e || e.unsubscribe(),
                null === (t = this.stateSub) || void 0 === t || t.unsubscribe(),
                (this.allMonitorsSub = void 0),
                (this.stateSub = void 0),
                this.runningRequests.clear());
            }
            clearTimer(e) {
              e && clearTimeout(e);
            }
          }
          function Bt(e) {
            const { api: t, config: i } = e;
            function r(e) {
              new Ht(e).attach();
            }
            return {
              processUserEvent: function (e) {
                var n, s;
                const o = (function (e, t) {
                  const i = (function (e) {
                      const t = e.split("data-")[1],
                        i = null == t ? void 0 : t.replace(/-(.)/g, (e, t) => t.toUpperCase());
                      return null == i ? void 0 : i.replace(/-/g, "");
                    })(t),
                    r = e.dataset;
                  for (const e in r) if (e === i) return r[e];
                  return;
                })(
                  e.target,
                  null !==
                    (s =
                      null === (n = i.userActionsInstrumentation) || void 0 === n
                        ? void 0
                        : n.dataAttributeName) && void 0 !== s
                    ? s
                    : "faroUserActionName",
                );
                if (!o) return;
                const a = t.startUserAction(o, {}, { triggerName: e.type });
                a && r(a);
              },
              processUserActionStarted: r,
            };
          }
          class Gt extends mt {
            constructor() {
              (super(...arguments),
                (this.name = "@grafana/faro-web-sdk:instrumentation-user-action"),
                (this.version = te));
            }
            initialize() {
              const { processUserEvent: e, processUserActionStarted: t } = Bt(N);
              (window.addEventListener("pointerdown", e),
                window.addEventListener("keydown", (t) => {
                  [" ", "Enter"].includes(t.key) && e(t);
                }),
                (this._userActionSub = D.subscribe(({ type: e, userAction: i }) => {
                  "user_action_start" === e && t(i);
                })));
            }
            destroy() {
              var e;
              null === (e = this._userActionSub) || void 0 === e || e.unsubscribe();
            }
          }
          const Vt =
            /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;
          function Yt(e) {
            let t,
              i,
              r,
              n,
              s = [];
            if (((e) => o(e, "ErrorEvent"))(e) && e.error)
              ((t = e.error.message), (i = e.error.name), (s = Te(e.error)));
            else if ((r = ((e) => o(e, "DOMError"))(e)) || ((e) => o(e, "DOMException"))(e)) {
              const { name: n, message: s } = e;
              ((i = null != n ? n : r ? "DOMError" : "DOMException"), (t = s ? `${i}: ${s}` : i));
            } else
              v(e)
                ? ((t = e.message), (s = Te(e)))
                : (d(e) || (n = ((e) => m && a(e, Event))(e))) &&
                  ((i = n ? e.constructor.name : void 0),
                  (t = `Non-Error exception captured with keys: ${Object.keys(e)}`));
            return [t, i, s];
          }
          function Wt(e) {
            const [t, i, r, n, s] = e;
            let o,
              a,
              l = [];
            const c = u(t),
              h = ke(i, "?", r, n);
            return (
              s || !c
                ? (([o, a, l] = Yt(null != s ? s : t)), 0 === l.length && (l = [h]))
                : c &&
                  (([o, a] = (function (e) {
                    var t, i;
                    const r = e.match(Vt),
                      n = null !== (t = null == r ? void 0 : r[1]) && void 0 !== t ? t : M;
                    return [null !== (i = null == r ? void 0 : r[2]) && void 0 !== i ? i : e, n];
                  })(t)),
                  (l = [h])),
              { value: o, type: a, stackFrames: l }
            );
          }
          function Zt(e, t) {
            return v(e[0]) ? Wt(e) : { value: t(e) };
          }
          function Kt(e) {
            window.addEventListener("unhandledrejection", (t) => {
              var i, r;
              let n,
                s,
                o = t;
              o.reason
                ? (o = t.reason)
                : (null === (i = t.detail) || void 0 === i ? void 0 : i.reason) &&
                  (o = null === (r = t.detail) || void 0 === r ? void 0 : r.reason);
              let a = [];
              (((e) => !d(e) && !f(e))(o)
                ? ((n = `Non-Error promise rejection captured with value: ${String(o)}`),
                  (s = "UnhandledRejection"))
                : ([n, s, a] = Yt(o)),
                n && e.pushError(new Error(n), { type: s, stackFrames: a }));
            });
          }
          class Jt extends mt {
            constructor() {
              (super(...arguments),
                (this.name = "@grafana/faro-web-sdk:instrumentation-errors"),
                (this.version = te));
            }
            initialize() {
              (this.logDebug("Initializing"),
                (function (e) {
                  const t = window.onerror;
                  window.onerror = (...i) => {
                    try {
                      const { value: t, type: r, stackFrames: n } = Wt(i),
                        s = i[4];
                      if (t) {
                        const i = { type: r, stackFrames: n };
                        (null != s && (i.originalError = s), e.pushError(new Error(t), i));
                      }
                    } finally {
                      null == t || t.apply(window, i);
                    }
                  };
                })(this.api),
                Kt(this.api));
            }
          }
          class ei {
            t;
            o = 0;
            i = [];
            u(e) {
              if (e.hadRecentInput) return;
              const t = this.i[0],
                i = this.i.at(-1);
              (this.o &&
              t &&
              i &&
              e.startTime - i.startTime < 1e3 &&
              e.startTime - t.startTime < 5e3
                ? ((this.o += e.value), this.i.push(e))
                : ((this.o = e.value), (this.i = [e])),
                this.t?.(e));
            }
          }
          const ti = () => {
              const e = performance.getEntriesByType("navigation")[0];
              if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
            },
            ii = (e) => {
              if ("loading" === document.readyState) return "loading";
              {
                const t = ti();
                if (t) {
                  if (e < t.domInteractive) return "loading";
                  if (0 === t.domContentLoadedEventStart || e < t.domContentLoadedEventStart)
                    return "dom-interactive";
                  if (0 === t.domComplete || e < t.domComplete) return "dom-content-loaded";
                }
              }
              return "complete";
            },
            ri = (e) => {
              const t = e.nodeName;
              return 1 === e.nodeType ? t.toLowerCase() : t.toUpperCase().replace(/^#/, "");
            },
            ni = (e) => {
              let t = "";
              try {
                for (; 9 !== e?.nodeType; ) {
                  const i = e,
                    r = i.id ? "#" + i.id : [ri(i), ...Array.from(i.classList).sort()].join(".");
                  if (t.length + r.length > 99) return t || r;
                  if (((t = t ? r + ">" + t : r), i.id)) break;
                  e = i.parentNode;
                }
              } catch {}
              return t;
            },
            si = new WeakMap();
          function oi(e, t) {
            return (si.get(e) || si.set(e, new t()), si.get(e));
          }
          let ai = -1;
          const li = () => ai,
            ui = (e) => {
              addEventListener(
                "pageshow",
                (t) => {
                  t.persisted && ((ai = t.timeStamp), e(t));
                },
                !0,
              );
            },
            ci = (e, t, i, r) => {
              let n, s;
              return (o) => {
                t.value >= 0 &&
                  (o || r) &&
                  ((s = t.value - (n ?? 0)),
                  (s || void 0 === n) &&
                    ((n = t.value),
                    (t.delta = s),
                    (t.rating = ((e, t) =>
                      e > t[1] ? "poor" : e > t[0] ? "needs-improvement" : "good")(t.value, i)),
                    e(t)));
              };
            },
            hi = (e) => {
              requestAnimationFrame(() => requestAnimationFrame(() => e()));
            },
            di = () => {
              const e = ti();
              return e?.activationStart ?? 0;
            },
            fi = (e, t = -1) => {
              const i = ti();
              let r = "navigate";
              return (
                li() >= 0
                  ? (r = "back-forward-cache")
                  : i &&
                    (document.prerendering || di() > 0
                      ? (r = "prerender")
                      : document.wasDiscarded
                        ? (r = "restore")
                        : i.type && (r = i.type.replace(/_/g, "-"))),
                {
                  name: e,
                  value: t,
                  rating: "good",
                  delta: 0,
                  entries: [],
                  id: `v5-${Date.now()}-${Math.floor(8999999999999 * Math.random()) + 1e12}`,
                  navigationType: r,
                }
              );
            },
            pi = (e, t, i = {}) => {
              try {
                if (PerformanceObserver.supportedEntryTypes.includes(e)) {
                  const r = new PerformanceObserver((e) => {
                    Promise.resolve().then(() => {
                      t(e.getEntries());
                    });
                  });
                  return (r.observe({ type: e, buffered: !0, ...i }), r);
                }
              } catch {}
            },
            mi = (e) => {
              let t = !1;
              return () => {
                t || (e(), (t = !0));
              };
            };
          let gi = -1;
          const vi = new Set(),
            bi = () => ("hidden" !== document.visibilityState || document.prerendering ? 1 / 0 : 0),
            Oi = (e) => {
              if ("hidden" === document.visibilityState) {
                if ("visibilitychange" === e.type) for (const e of vi) e();
                isFinite(gi) ||
                  ((gi = "visibilitychange" === e.type ? e.timeStamp : 0),
                  removeEventListener("prerenderingchange", Oi, !0));
              }
            },
            wi = () => {
              if (gi < 0) {
                const e = di(),
                  t = document.prerendering
                    ? void 0
                    : globalThis.performance
                        .getEntriesByType("visibility-state")
                        .filter((t) => "hidden" === t.name && t.startTime > e)[0]?.startTime;
                ((gi = t ?? bi()),
                  addEventListener("visibilitychange", Oi, !0),
                  addEventListener("prerenderingchange", Oi, !0),
                  ui(() => {
                    setTimeout(() => {
                      gi = bi();
                    });
                  }));
              }
              return {
                get firstHiddenTime() {
                  return gi;
                },
                onHidden(e) {
                  vi.add(e);
                },
              };
            },
            $i = (e) => {
              document.prerendering ? addEventListener("prerenderingchange", () => e(), !0) : e();
            },
            yi = [1800, 3e3],
            Ei = (e, t = {}) => {
              $i(() => {
                const i = wi();
                let r,
                  n = fi("FCP");
                const s = pi("paint", (e) => {
                  for (const t of e)
                    "first-contentful-paint" === t.name &&
                      (s.disconnect(),
                      t.startTime < i.firstHiddenTime &&
                        ((n.value = Math.max(t.startTime - di(), 0)), n.entries.push(t), r(!0)));
                });
                s &&
                  ((r = ci(e, n, yi, t.reportAllChanges)),
                  ui((i) => {
                    ((n = fi("FCP")),
                      (r = ci(e, n, yi, t.reportAllChanges)),
                      hi(() => {
                        ((n.value = performance.now() - i.timeStamp), r(!0));
                      }));
                  }));
              });
            },
            Si = [0.1, 0.25],
            xi = (e) => e.find((e) => 1 === e.node?.nodeType) || e[0];
          let ki = 0,
            Pi = 1 / 0,
            Ti = 0;
          const Ii = (e) => {
            for (const t of e)
              t.interactionId &&
                ((Pi = Math.min(Pi, t.interactionId)),
                (Ti = Math.max(Ti, t.interactionId)),
                (ki = Ti ? (Ti - Pi) / 7 + 1 : 0));
          };
          let Ri;
          const Ai = () => (Ri ? ki : (performance.interactionCount ?? 0));
          let Ni = 0;
          class _i {
            l = [];
            h = new Map();
            m;
            p;
            v() {
              ((Ni = Ai()), (this.l.length = 0), this.h.clear());
            }
            M() {
              const e = Math.min(this.l.length - 1, Math.floor((Ai() - Ni) / 50));
              return this.l[e];
            }
            u(e) {
              if ((this.m?.(e), !e.interactionId && "first-input" !== e.entryType)) return;
              const t = this.l.at(-1);
              let i = this.h.get(e.interactionId);
              if (i || this.l.length < 10 || e.duration > t.T) {
                if (
                  (i
                    ? e.duration > i.T
                      ? ((i.entries = [e]), (i.T = e.duration))
                      : e.duration === i.T &&
                        e.startTime === i.entries[0].startTime &&
                        i.entries.push(e)
                    : ((i = { id: e.interactionId, entries: [e], T: e.duration }),
                      this.h.set(i.id, i),
                      this.l.push(i)),
                  this.l.sort((e, t) => t.T - e.T),
                  this.l.length > 10)
                ) {
                  const e = this.l.splice(10);
                  for (const t of e) this.h.delete(t.id);
                }
                this.p?.(i);
              }
            }
          }
          const Li = (e) => {
              const t = globalThis.requestIdleCallback || setTimeout;
              "hidden" === document.visibilityState
                ? e()
                : ((e = mi(e)),
                  addEventListener("visibilitychange", e, { once: !0, capture: !0 }),
                  t(() => {
                    (e(), removeEventListener("visibilitychange", e, { capture: !0 }));
                  }));
            },
            Ci = [200, 500],
            Qi = (e, t = {}) => {
              const i = oi((t = Object.assign({}, t)), _i);
              let r = [],
                n = [],
                s = 0;
              const o = new WeakMap(),
                a = new WeakMap();
              let l = !1;
              const u = () => {
                  l || (Li(c), (l = !0));
                },
                c = () => {
                  const e = i.l.map((e) => o.get(e.entries[0])),
                    t = n.length - 50;
                  n = n.filter((i, r) => r >= t || e.includes(i));
                  const a = new Set();
                  for (const e of n) {
                    const t = h(e.startTime, e.processingEnd);
                    for (const e of t) a.add(e);
                  }
                  const u = r.length - 1 - 50;
                  ((r = r.filter((e, t) => (e.startTime > s && t > u) || a.has(e))), (l = !1));
                };
              ((i.m = (e) => {
                const t = e.startTime + e.duration;
                let i;
                s = Math.max(s, e.processingEnd);
                for (let r = n.length - 1; r >= 0; r--) {
                  const s = n[r];
                  if (Math.abs(t - s.renderTime) <= 8) {
                    ((i = s),
                      (i.startTime = Math.min(e.startTime, i.startTime)),
                      (i.processingStart = Math.min(e.processingStart, i.processingStart)),
                      (i.processingEnd = Math.max(e.processingEnd, i.processingEnd)),
                      i.entries.push(e));
                    break;
                  }
                }
                (i ||
                  ((i = {
                    startTime: e.startTime,
                    processingStart: e.processingStart,
                    processingEnd: e.processingEnd,
                    renderTime: t,
                    entries: [e],
                  }),
                  n.push(i)),
                  (e.interactionId || "first-input" === e.entryType) && o.set(e, i),
                  u());
              }),
                (i.p = (e) => {
                  if (!a.get(e)) {
                    const i = e.entries[0].target;
                    if (i) {
                      const r = t.generateTarget?.(i) ?? ni(i);
                      a.set(e, r);
                    }
                  }
                }));
              const h = (e, t) => {
                  const i = [];
                  for (const n of r)
                    if (!(n.startTime + n.duration < e)) {
                      if (n.startTime > t) break;
                      i.push(n);
                    }
                  return i;
                },
                d = (e) => {
                  const t = e.entries[0],
                    r = o.get(t),
                    n = t.processingStart,
                    s = Math.max(t.startTime + t.duration, n),
                    l = Math.min(r.processingEnd, s),
                    u = r.entries.sort((e, t) => e.processingStart - t.processingStart),
                    c = h(t.startTime, l),
                    d = i.h.get(t.interactionId),
                    f = {
                      interactionTarget: a.get(d),
                      interactionType: t.name.startsWith("key") ? "keyboard" : "pointer",
                      interactionTime: t.startTime,
                      nextPaintTime: s,
                      processedEventEntries: u,
                      longAnimationFrameEntries: c,
                      inputDelay: n - t.startTime,
                      processingDuration: l - n,
                      presentationDelay: s - l,
                      loadState: ii(t.startTime),
                      longestScript: void 0,
                      totalScriptDuration: void 0,
                      totalStyleAndLayoutDuration: void 0,
                      totalPaintDuration: void 0,
                      totalUnattributedDuration: void 0,
                    };
                  return (
                    ((e) => {
                      if (!e.longAnimationFrameEntries?.length) return;
                      const t = e.interactionTime,
                        i = e.inputDelay,
                        r = e.processingDuration;
                      let n,
                        s,
                        o = 0,
                        a = 0,
                        l = 0,
                        u = 0;
                      for (const l of e.longAnimationFrameEntries) {
                        a = a + l.startTime + l.duration - l.styleAndLayoutStart;
                        for (const e of l.scripts) {
                          const l = e.startTime + e.duration;
                          if (l < t) continue;
                          const c = l - Math.max(t, e.startTime),
                            h = e.duration ? (c / e.duration) * e.forcedStyleAndLayoutDuration : 0;
                          ((o += c - h),
                            (a += h),
                            c > u &&
                              ((s =
                                e.startTime < t + i
                                  ? "input-delay"
                                  : e.startTime >= t + i + r
                                    ? "presentation-delay"
                                    : "processing-duration"),
                              (n = e),
                              (u = c)));
                        }
                      }
                      const c = e.longAnimationFrameEntries.at(-1),
                        h = c ? c.startTime + c.duration : 0;
                      (h >= t + i + r && (l = e.nextPaintTime - h),
                        n &&
                          s &&
                          (e.longestScript = { entry: n, subpart: s, intersectingDuration: u }),
                        (e.totalScriptDuration = o),
                        (e.totalStyleAndLayoutDuration = a),
                        (e.totalPaintDuration = l),
                        (e.totalUnattributedDuration = e.nextPaintTime - t - o - a - l));
                    })(f),
                    Object.assign(e, { attribution: f })
                  );
                };
              (pi("long-animation-frame", (e) => {
                ((r = r.concat(e)), u());
              }),
                ((e, t = {}) => {
                  if (
                    !globalThis.PerformanceEventTiming ||
                    !("interactionId" in PerformanceEventTiming.prototype)
                  )
                    return;
                  const i = wi();
                  $i(() => {
                    "interactionCount" in performance ||
                      Ri ||
                      (Ri = pi("event", Ii, { type: "event", buffered: !0, durationThreshold: 0 }));
                    let r,
                      n = fi("INP");
                    const s = oi(t, _i),
                      o = (e) => {
                        Li(() => {
                          for (const t of e) s.u(t);
                          const t = s.M();
                          t && t.T !== n.value && ((n.value = t.T), (n.entries = t.entries), r());
                        });
                      },
                      a = pi("event", o, { durationThreshold: t.durationThreshold ?? 40 });
                    ((r = ci(e, n, Ci, t.reportAllChanges)),
                      a &&
                        (a.observe({ type: "first-input", buffered: !0 }),
                        i.onHidden(() => {
                          (o(a.takeRecords()), r(!0));
                        }),
                        ui(() => {
                          (s.v(), (n = fi("INP")), (r = ci(e, n, Ci, t.reportAllChanges)));
                        })));
                  });
                })((t) => {
                  const i = d(t);
                  e(i);
                }, t));
            };
          class Xi {
            m;
            u(e) {
              this.m?.(e);
            }
          }
          const Di = [2500, 4e3],
            Ui = [800, 1800],
            Mi = (e) => {
              document.prerendering
                ? $i(() => Mi(e))
                : "complete" !== document.readyState
                  ? addEventListener("load", () => Mi(e), !0)
                  : setTimeout(e);
            },
            ji = "load_state",
            Fi = "time_to_first_byte";
          class zi {
            constructor(e, t) {
              ((this.corePushMeasurement = e), (this.webVitalConfig = t));
            }
            initialize() {
              (this.measureCLS(),
                this.measureFCP(),
                this.measureINP(),
                this.measureLCP(),
                this.measureTTFB());
            }
            measureCLS() {
              var e;
              ((e, t = {}) => {
                const i = oi((t = Object.assign({}, t)), ei),
                  r = new WeakMap();
                ((i.t = (e) => {
                  if (e?.sources?.length) {
                    const i = xi(e.sources),
                      n = i?.node;
                    if (n) {
                      const e = t.generateTarget?.(n) ?? ni(n);
                      r.set(i, e);
                    }
                  }
                }),
                  ((e, t = {}) => {
                    const i = wi();
                    Ei(
                      mi(() => {
                        let r,
                          n = fi("CLS", 0);
                        const s = oi(t, ei),
                          o = (e) => {
                            for (const t of e) s.u(t);
                            s.o > n.value && ((n.value = s.o), (n.entries = s.i), r());
                          },
                          a = pi("layout-shift", o);
                        a &&
                          ((r = ci(e, n, Si, t.reportAllChanges)),
                          i.onHidden(() => {
                            (o(a.takeRecords()), r(!0));
                          }),
                          ui(() => {
                            ((s.o = 0),
                              (n = fi("CLS", 0)),
                              (r = ci(e, n, Si, t.reportAllChanges)),
                              hi(() => r()));
                          }),
                          setTimeout(r));
                      }),
                    );
                  })((t) => {
                    const i = ((e) => {
                      let t = {};
                      if (e.entries.length) {
                        const i = e.entries.reduce((e, t) => (e.value > t.value ? e : t));
                        if (i?.sources?.length) {
                          const e = xi(i.sources);
                          e &&
                            (t = {
                              largestShiftTarget: r.get(e),
                              largestShiftTime: i.startTime,
                              largestShiftValue: i.value,
                              largestShiftSource: e,
                              largestShiftEntry: i,
                              loadState: ii(i.startTime),
                            });
                        }
                      }
                      return Object.assign(e, { attribution: t });
                    })(t);
                    e(i);
                  }, t));
              })(
                (e) => {
                  const {
                      loadState: t,
                      largestShiftValue: i,
                      largestShiftTime: r,
                      largestShiftTarget: n,
                    } = e.attribution,
                    s = this.buildInitialValues(e);
                  (this.addIfPresent(s, "largest_shift_value", i),
                    this.addIfPresent(s, "largest_shift_time", r));
                  const o = this.buildInitialContext(e);
                  (this.addIfPresent(o, ji, t),
                    this.addIfPresent(o, "largest_shift_target", n),
                    this.pushMeasurement(s, o));
                },
                {
                  reportAllChanges:
                    null === (e = this.webVitalConfig) || void 0 === e
                      ? void 0
                      : e.reportAllChanges,
                },
              );
            }
            measureFCP() {
              var e;
              ((e, t = {}) => {
                Ei((t) => {
                  const i = ((e) => {
                    let t = { timeToFirstByte: 0, firstByteToFCP: e.value, loadState: ii(li()) };
                    if (e.entries.length) {
                      const i = ti(),
                        r = e.entries.at(-1);
                      if (i) {
                        const n = i.activationStart || 0,
                          s = Math.max(0, i.responseStart - n);
                        t = {
                          timeToFirstByte: s,
                          firstByteToFCP: e.value - s,
                          loadState: ii(e.entries[0].startTime),
                          navigationEntry: i,
                          fcpEntry: r,
                        };
                      }
                    }
                    return Object.assign(e, { attribution: t });
                  })(t);
                  e(i);
                }, t);
              })(
                (e) => {
                  const { firstByteToFCP: t, timeToFirstByte: i, loadState: r } = e.attribution,
                    n = this.buildInitialValues(e);
                  (this.addIfPresent(n, "first_byte_to_fcp", t), this.addIfPresent(n, Fi, i));
                  const s = this.buildInitialContext(e);
                  (this.addIfPresent(s, ji, r), this.pushMeasurement(n, s));
                },
                {
                  reportAllChanges:
                    null === (e = this.webVitalConfig) || void 0 === e
                      ? void 0
                      : e.reportAllChanges,
                },
              );
            }
            measureINP() {
              var e;
              Qi(
                (e) => {
                  const {
                      interactionTime: t,
                      presentationDelay: i,
                      inputDelay: r,
                      processingDuration: n,
                      nextPaintTime: s,
                      loadState: o,
                      interactionTarget: a,
                      interactionType: l,
                    } = e.attribution,
                    u = this.buildInitialValues(e);
                  (this.addIfPresent(u, "interaction_time", t),
                    this.addIfPresent(u, "presentation_delay", i),
                    this.addIfPresent(u, "input_delay", r),
                    this.addIfPresent(u, "processing_duration", n),
                    this.addIfPresent(u, "next_paint_time", s));
                  const c = this.buildInitialContext(e);
                  (this.addIfPresent(c, ji, o),
                    this.addIfPresent(c, "interaction_target", a),
                    this.addIfPresent(c, "interaction_type", l),
                    this.pushMeasurement(u, c));
                },
                {
                  reportAllChanges:
                    null === (e = this.webVitalConfig) || void 0 === e
                      ? void 0
                      : e.reportAllChanges,
                },
              );
            }
            measureLCP() {
              var e;
              ((e, t = {}) => {
                const i = oi((t = Object.assign({}, t)), Xi),
                  r = new WeakMap();
                ((i.m = (e) => {
                  const i = e.element;
                  if (i) {
                    const n = t.generateTarget?.(i) ?? ni(i);
                    r.set(e, n);
                  }
                }),
                  ((e, t = {}) => {
                    $i(() => {
                      const i = wi();
                      let r,
                        n = fi("LCP");
                      const s = oi(t, Xi),
                        o = (e) => {
                          t.reportAllChanges || (e = e.slice(-1));
                          for (const t of e)
                            (s.u(t),
                              t.startTime < i.firstHiddenTime &&
                                ((n.value = Math.max(t.startTime - di(), 0)),
                                (n.entries = [t]),
                                r()));
                        },
                        a = pi("largest-contentful-paint", o);
                      if (a) {
                        r = ci(e, n, Di, t.reportAllChanges);
                        const i = mi(() => {
                            (o(a.takeRecords()), a.disconnect(), r(!0));
                          }),
                          s = (e) => {
                            e.isTrusted && (Li(i), removeEventListener(e.type, s, { capture: !0 }));
                          };
                        for (const e of ["keydown", "click", "visibilitychange"])
                          addEventListener(e, s, { capture: !0 });
                        ui((i) => {
                          ((n = fi("LCP")),
                            (r = ci(e, n, Di, t.reportAllChanges)),
                            hi(() => {
                              ((n.value = performance.now() - i.timeStamp), r(!0));
                            }));
                        });
                      }
                    });
                  })((t) => {
                    const i = ((e) => {
                      let t = {
                        timeToFirstByte: 0,
                        resourceLoadDelay: 0,
                        resourceLoadDuration: 0,
                        elementRenderDelay: e.value,
                      };
                      if (e.entries.length) {
                        const i = ti();
                        if (i) {
                          const n = i.activationStart || 0,
                            s = e.entries.at(-1),
                            o =
                              s.url &&
                              performance
                                .getEntriesByType("resource")
                                .filter((e) => e.name === s.url)[0],
                            a = Math.max(0, i.responseStart - n),
                            l = Math.max(a, o ? (o.requestStart || o.startTime) - n : 0),
                            u = Math.min(e.value, Math.max(l, o ? o.responseEnd - n : 0));
                          ((t = {
                            target: r.get(s),
                            timeToFirstByte: a,
                            resourceLoadDelay: l - a,
                            resourceLoadDuration: u - l,
                            elementRenderDelay: e.value - u,
                            navigationEntry: i,
                            lcpEntry: s,
                          }),
                            s.url && (t.url = s.url),
                            o && (t.lcpResourceEntry = o));
                        }
                      }
                      return Object.assign(e, { attribution: t });
                    })(t);
                    e(i);
                  }, t));
              })(
                (e) => {
                  const {
                      elementRenderDelay: t,
                      resourceLoadDelay: i,
                      resourceLoadDuration: r,
                      timeToFirstByte: n,
                      target: s,
                    } = e.attribution,
                    o = this.buildInitialValues(e);
                  (this.addIfPresent(o, "element_render_delay", t),
                    this.addIfPresent(o, "resource_load_delay", i),
                    this.addIfPresent(o, "resource_load_duration", r),
                    this.addIfPresent(o, Fi, n));
                  const a = this.buildInitialContext(e);
                  (this.addIfPresent(a, "element", s), this.pushMeasurement(o, a));
                },
                {
                  reportAllChanges:
                    null === (e = this.webVitalConfig) || void 0 === e
                      ? void 0
                      : e.reportAllChanges,
                },
              );
            }
            measureTTFB() {
              var e;
              ((e, t = {}) => {
                ((e, t = {}) => {
                  let i = fi("TTFB"),
                    r = ci(e, i, Ui, t.reportAllChanges);
                  Mi(() => {
                    const n = ti();
                    n &&
                      ((i.value = Math.max(n.responseStart - di(), 0)),
                      (i.entries = [n]),
                      r(!0),
                      ui(() => {
                        ((i = fi("TTFB", 0)), (r = ci(e, i, Ui, t.reportAllChanges)), r(!0));
                      }));
                  });
                })((t) => {
                  const i = ((e) => {
                    let t = {
                      waitingDuration: 0,
                      cacheDuration: 0,
                      dnsDuration: 0,
                      connectionDuration: 0,
                      requestDuration: 0,
                    };
                    if (e.entries.length) {
                      const i = e.entries[0],
                        r = i.activationStart || 0,
                        n = Math.max((i.workerStart || i.fetchStart) - r, 0),
                        s = Math.max(i.domainLookupStart - r, 0),
                        o = Math.max(i.connectStart - r, 0),
                        a = Math.max(i.connectEnd - r, 0);
                      t = {
                        waitingDuration: n,
                        cacheDuration: s - n,
                        dnsDuration: o - s,
                        connectionDuration: a - o,
                        requestDuration: e.value - a,
                        navigationEntry: i,
                      };
                    }
                    return Object.assign(e, { attribution: t });
                  })(t);
                  e(i);
                }, t);
              })(
                (e) => {
                  const {
                      dnsDuration: t,
                      connectionDuration: i,
                      requestDuration: r,
                      waitingDuration: n,
                      cacheDuration: s,
                    } = e.attribution,
                    o = this.buildInitialValues(e);
                  (this.addIfPresent(o, "dns_duration", t),
                    this.addIfPresent(o, "connection_duration", i),
                    this.addIfPresent(o, "request_duration", r),
                    this.addIfPresent(o, "waiting_duration", n),
                    this.addIfPresent(o, "cache_duration", s));
                  const a = this.buildInitialContext(e);
                  this.pushMeasurement(o, a);
                },
                {
                  reportAllChanges:
                    null === (e = this.webVitalConfig) || void 0 === e
                      ? void 0
                      : e.reportAllChanges,
                },
              );
            }
            buildInitialValues(e) {
              const t = e.name.toLowerCase();
              return { [t]: e.value, delta: e.delta };
            }
            buildInitialContext(e) {
              var t;
              const i = null !== (t = Ve(It, He)) && void 0 !== t ? t : Ce;
              return {
                id: e.id,
                rating: e.rating,
                navigation_type: e.navigationType,
                navigation_entry_id: i,
              };
            }
            pushMeasurement(e, t) {
              this.corePushMeasurement({ type: "web-vitals", values: e }, { context: t });
            }
            addIfPresent(e, t, i) {
              i && (e[t] = i);
            }
          }
          class qi extends mt {
            constructor() {
              (super(...arguments),
                (this.name = "@grafana/faro-web-sdk:instrumentation-web-vitals"),
                (this.version = te));
            }
            initialize() {
              this.logDebug("Initializing");
              new zi(this.api.pushMeasurement, this.config.webVitalsInstrumentation).initialize();
            }
          }
          class Hi extends mt {
            constructor() {
              (super(...arguments),
                (this.name = "@grafana/faro-web-sdk:instrumentation-session"),
                (this.version = te));
            }
            sendSessionStartEvent(e) {
              var t, i;
              const r = e.session;
              if (
                r &&
                r.id !== (null === (t = this.notifiedSession) || void 0 === t ? void 0 : t.id)
              ) {
                if (
                  this.notifiedSession &&
                  this.notifiedSession.id ===
                    (null === (i = r.attributes) || void 0 === i ? void 0 : i.previousSession)
                )
                  return (
                    this.api.pushEvent("session_extend", {}, void 0, { skipDedupe: !0 }),
                    void (this.notifiedSession = r)
                  );
                ((this.notifiedSession = r),
                  this.api.pushEvent(et, {}, void 0, { skipDedupe: !0 }));
              }
            }
            createInitialSession(e, t) {
              var i, r, n, s, o, a;
              let l,
                u,
                c = e.fetchUserSession();
              if (t.persistent && t.maxSessionPersistenceTime && c) {
                const e = $();
                c.lastActivity < e - t.maxSessionPersistenceTime &&
                  (ut.removeUserSession(), (c = null));
              }
              if (st(c)) {
                const e = null == c ? void 0 : c.sessionId;
                u = nt({
                  sessionId: e,
                  isSampled: c.isSampled || !1,
                  started: null == c ? void 0 : c.started,
                });
                const n = null == c ? void 0 : c.sessionMeta,
                  s = Object.assign(
                    Object.assign(
                      {},
                      null === (i = t.session) || void 0 === i ? void 0 : i.overrides,
                    ),
                    null == n ? void 0 : n.overrides,
                  );
                ((u.sessionMeta = Object.assign(Object.assign({}, t.session), {
                  id: e,
                  attributes: Object.assign(
                    Object.assign(
                      Object.assign(
                        {},
                        null === (r = t.session) || void 0 === r ? void 0 : r.attributes,
                      ),
                      null == n ? void 0 : n.attributes,
                    ),
                    { isSampled: u.isSampled.toString() },
                  ),
                  overrides: s,
                })),
                  (l = tt));
              } else {
                const e =
                  null !== (s = null === (n = t.session) || void 0 === n ? void 0 : n.id) &&
                  void 0 !== s
                    ? s
                    : (function (e) {
                        var t, i, r, n;
                        return {
                          id:
                            null !==
                              (n =
                                null ===
                                  (r =
                                    null ===
                                      (i =
                                        null === (t = N.config) || void 0 === t
                                          ? void 0
                                          : t.sessionTracking) || void 0 === i
                                      ? void 0
                                      : i.generateSessionId) || void 0 === r
                                  ? void 0
                                  : r.call(i)) && void 0 !== n
                              ? n
                              : C(),
                          attributes: e,
                        };
                      })().id;
                u = nt({ sessionId: e, isSampled: rt() });
                const i = null === (o = t.session) || void 0 === o ? void 0 : o.overrides;
                ((u.sessionMeta = Object.assign(
                  {
                    id: e,
                    attributes: Object.assign(
                      { isSampled: u.isSampled.toString() },
                      null === (a = t.session) || void 0 === a ? void 0 : a.attributes,
                    ),
                  },
                  i ? { overrides: i } : {},
                )),
                  (l = et));
              }
              return { initialSession: u, lifecycleType: l };
            }
            registerBeforeSendHook(e) {
              var t;
              const { updateSession: i } = new e();
              null === (t = this.transports) ||
                void 0 === t ||
                t.addBeforeSendHooks((e) => {
                  var t, r, n;
                  i();
                  const s = null === (t = e.meta.session) || void 0 === t ? void 0 : t.attributes;
                  if (s && "true" === (null == s ? void 0 : s.isSampled)) {
                    let t = JSON.parse(JSON.stringify(e));
                    const i = null === (r = t.meta.session) || void 0 === r ? void 0 : r.attributes;
                    return (
                      null == i || delete i.isSampled,
                      0 === Object.keys(null != i ? i : {}).length &&
                        (null === (n = t.meta.session) || void 0 === n || delete n.attributes),
                      t
                    );
                  }
                  return null;
                });
            }
            initialize() {
              this.logDebug("init session instrumentation");
              const e = this.config.sessionTracking;
              if (null == e ? void 0 : e.enabled) {
                const t = ht(e);
                this.registerBeforeSendHook(t);
                const { initialSession: i, lifecycleType: r } = this.createInitialSession(t, e);
                t.storeUserSession(i);
                const n = i.sessionMeta;
                ((this.notifiedSession = n),
                  this.api.setSession(n),
                  r === et && this.api.pushEvent(et, {}, void 0, { skipDedupe: !0 }),
                  r === tt && this.api.pushEvent(tt, {}, void 0, { skipDedupe: !0 }));
              }
              this.metas.addListener(this.sendSessionStartEvent.bind(this));
            }
          }
          class Bi extends mt {
            constructor() {
              (super(...arguments),
                (this.name = "@grafana/faro-web-sdk:instrumentation-view"),
                (this.version = te));
            }
            sendViewChangedEvent(e) {
              var t, i, r, n;
              const s = e.view;
              s &&
                s.name !== (null === (t = this.notifiedView) || void 0 === t ? void 0 : t.name) &&
                (this.api.pushEvent(
                  "view_changed",
                  {
                    fromView:
                      null !==
                        (r = null === (i = this.notifiedView) || void 0 === i ? void 0 : i.name) &&
                      void 0 !== r
                        ? r
                        : Ce,
                    toView: null !== (n = s.name) && void 0 !== n ? n : Ce,
                  },
                  void 0,
                  { skipDedupe: !0 },
                ),
                (this.notifiedView = s));
            }
            initialize() {
              this.metas.addListener(this.sendViewChangedEvent.bind(this));
            }
          }
          class Gi extends x {
            constructor(e, t) {
              var i, r, n, s;
              (super(),
                (this._tracking = !1),
                (this.eventsObservable = e),
                (this._options = {
                  inactivityMs:
                    null !== (i = null == t ? void 0 : t.inactivityMs) && void 0 !== i ? i : 100,
                  drainTimeoutMs:
                    null !== (r = null == t ? void 0 : t.drainTimeoutMs) && void 0 !== r ? r : 1e4,
                  isOperationStart:
                    null !== (n = null == t ? void 0 : t.isOperationStart) && void 0 !== n
                      ? n
                      : () => {},
                  isOperationEnd:
                    null !== (s = null == t ? void 0 : t.isOperationEnd) && void 0 !== s
                      ? s
                      : () => {},
                }),
                this._initialize());
            }
            _initialize() {
              this.eventsObservable
                .filter(() => this._tracking)
                .subscribe((e) => {
                  var t, i, r;
                  ((this._lastEventTime = Date.now()),
                    null === (t = this._currentEvents) || void 0 === t || t.push(e));
                  const n = this._options.isOperationStart(e);
                  n && (null === (i = this._activeOperations) || void 0 === i || i.set(n, !0));
                  const s = this._options.isOperationEnd(e);
                  (s && (null === (r = this._activeOperations) || void 0 === r || r.delete(s)),
                    this._scheduleInactivityCheck());
                });
            }
            startTracking() {
              this._tracking ||
                ((this._tracking = !0),
                (this._startTime = Date.now()),
                (this._lastEventTime = Date.now()),
                this.notify({ message: "tracking-started" }),
                (this._currentEvents = []),
                (this._activeOperations = new Map()),
                this._scheduleInactivityCheck());
            }
            stopTracking() {
              ((this._tracking = !1),
                this._clearTimer(this._inactivityTid),
                this._clearTimer(this._drainTid));
              let e = 0;
              ((e = this.hasActiveOperations()
                ? Date.now() - this._startTime
                : this._lastEventTime
                  ? this._lastEventTime - this._startTime
                  : 0),
                this.notify({
                  message: "tracking-ended",
                  events: this._currentEvents,
                  duration: e,
                }));
            }
            _scheduleInactivityCheck() {
              this._inactivityTid = Vi(
                this._inactivityTid,
                () => {
                  this.hasActiveOperations() ? this._startDrainTimeout() : this.stopTracking();
                },
                this._options.inactivityMs,
              );
            }
            _startDrainTimeout() {
              this._drainTid = Vi(
                this._drainTid,
                () => {
                  this.stopTracking();
                },
                this._options.drainTimeoutMs,
              );
            }
            hasActiveOperations() {
              return !!this._activeOperations && this._activeOperations.size > 0;
            }
            _clearTimer(e) {
              e && clearTimeout(e);
            }
          }
          function Vi(e, t, i) {
            return (
              e && clearTimeout(e),
              (e = setTimeout(() => {
                t();
              }, i))
            );
          }
          let Yi;
          const Wi = new Set(),
            Zi = new Map();
          let Ki,
            Ji,
            er,
            tr,
            ir,
            rr,
            nr,
            sr,
            or = !1;
          class ar extends mt {
            constructor() {
              (super(...arguments),
                (this.name = "@grafana/faro-web-sdk:instrumentation-navigation"),
                (this.version = te));
            }
            initialize() {
              const e = Tt(),
                t = wt(),
                i = (function () {
                  function e(e, t) {
                    const i = null != t ? t : location.href;
                    i !== Ji &&
                      (Ki.notify({ type: "url-change", from: Ji, to: i, trigger: e }), (Ji = i));
                  }
                  if ((Ki || ((Ki = new x()), (Ji = location.href)), !or))
                    if ("navigation" in window && "NavigateEvent" in window) {
                      ((nr = (t) => {
                        try {
                          const i = null == t ? void 0 : t.destination;
                          (null == i ? void 0 : i.sameDocument) &&
                            "string" == typeof i.url &&
                            e("navigate", i.url);
                        } catch (e) {}
                      }),
                        window.navigation.addEventListener("navigate", nr));
                      const t = window.NavigateEvent;
                      (t &&
                        t.prototype &&
                        "function" == typeof t.prototype.intercept &&
                        (sr || (sr = t.prototype.intercept),
                        (t.prototype.intercept = function (t) {
                          try {
                            const t = !!(null == this ? void 0 : this.canIntercept),
                              i = null == this ? void 0 : this.destination;
                            t &&
                              i &&
                              !1 === i.sameDocument &&
                              "string" == typeof i.url &&
                              e("navigate-intercept", i.url);
                          } catch (e) {}
                          return sr.call(this, t);
                        })),
                        (or = !0));
                    } else
                      (er || (er = window.history.pushState),
                        (window.history.pushState = function (...t) {
                          const i = er.apply(window.history, t);
                          return (e("pushState"), i);
                        }),
                        tr || (tr = window.history.replaceState),
                        (window.history.replaceState = function (...t) {
                          const i = tr.apply(window.history, t);
                          return (e("replaceState"), i);
                        }),
                        (ir = () => e("popstate")),
                        (rr = () => e("hashchange")),
                        window.addEventListener("popstate", ir),
                        window.addEventListener("hashchange", rr),
                        (or = !0));
                  return Ki;
                })(),
                r =
                  ((n = ["pointerdown", "keydown"]),
                  Yi || (Yi = new x()),
                  n.forEach((e) => {
                    if (!Wi.has(e)) {
                      const t = () => {
                        Yi.notify({ type: "interaction", name: e });
                      };
                      (window.addEventListener(e, t), Wi.add(e), Zi.set(e, t));
                    }
                  }),
                  Yi);
              var n;
              const s = new Gi(new x().merge(e, t, i), {
                inactivityMs: 100,
                drainTimeoutMs: 1e4,
                isOperationStart: (e) =>
                  (function (e) {
                    return e.type === gt;
                  })(e)
                    ? e.request.requestId
                    : void 0,
                isOperationEnd: (e) =>
                  (function (e) {
                    return e.type === vt;
                  })(e)
                    ? e.request.requestId
                    : void 0,
              });
              (s
                .filter((e) => "tracking-ended" === e.message)
                .subscribe((e) => {
                  var t, i, r;
                  if (
                    (null === (t = e.events) || void 0 === t
                      ? void 0
                      : t.some((e) => "url-change" === e.type)) &&
                    (null === (i = e.events) || void 0 === i
                      ? void 0
                      : i.some((e) => "dom-mutation" === e.type))
                  ) {
                    const t =
                      null === (r = e.events) || void 0 === r
                        ? void 0
                        : r.find((e) => "url-change" === e.type);
                    N.api.pushEvent("faro.navigation", {
                      fromUrl: null == t ? void 0 : t.from,
                      toUrl: null == t ? void 0 : t.to,
                      sameDocument: String(!0),
                      duration: e.duration,
                    });
                  }
                }),
                r.subscribe(() => {
                  s.startTracking();
                }));
            }
          }
          class lr extends mt {
            constructor() {
              (super(),
                (this.name = "@grafana/faro-web-sdk:instrumentation-csp"),
                (this.version = te));
            }
            initialize() {
              document.addEventListener(
                "securitypolicyviolation",
                this.securitypolicyviolationHandler.bind(this),
              );
            }
            destroy() {
              document.removeEventListener(
                "securitypolicyviolation",
                this.securitypolicyviolationHandler,
              );
            }
            securitypolicyviolationHandler(e) {
              this.api.pushEvent("securitypolicyviolation", w(e));
            }
          }
          class ur extends mt {
            constructor() {
              (super(...arguments),
                (this.name = "@grafana/faro-web-sdk:instrumentation-console"),
                (this.version = te),
                (this.errorSerializer = H));
            }
            initialize() {
              var e;
              const t = this.config.consoleInstrumentation,
                i =
                  (null == t ? void 0 : t.serializeErrors) ||
                  !!(null == t ? void 0 : t.errorSerializer);
              ((this.errorSerializer = i
                ? null !== (e = null == t ? void 0 : t.errorSerializer) && void 0 !== e
                  ? e
                  : j
                : H),
                q.HT.filter((e) => {
                  var i;
                  return !(
                    null !== (i = null == t ? void 0 : t.disabledLevels) && void 0 !== i
                      ? i
                      : ur.defaultDisabledLevels
                  ).includes(e);
                }).forEach((e) => {
                  console[e] = (...i) => {
                    try {
                      if (e !== q.$b.ERROR || (null == t ? void 0 : t.consoleErrorAsLog))
                        if (e === q.$b.ERROR && (null == t ? void 0 : t.consoleErrorAsLog)) {
                          const { value: t, type: r, stackFrames: n } = Zt(i, this.errorSerializer);
                          this.api.pushLog(t ? [ur.consoleErrorPrefix + t] : i, {
                            level: e,
                            context: {
                              value: null != t ? t : "",
                              type: null != r ? r : "",
                              stackFrames: (null == n ? void 0 : n.length) ? j(n) : "",
                            },
                          });
                        } else this.api.pushLog(i, { level: e });
                      else {
                        const { value: e, type: t, stackFrames: r } = Zt(i, this.errorSerializer);
                        if (e && !t && !r)
                          return void this.api.pushError(new Error(ur.consoleErrorPrefix + e));
                        this.api.pushError(new Error(ur.consoleErrorPrefix + e), {
                          type: t,
                          stackFrames: r,
                        });
                      }
                    } catch (e) {
                      this.logError(e);
                    } finally {
                      this.unpatchedConsole[e](...i);
                    }
                  };
                }));
            }
          }
          function cr(e = {}) {
            const t = [new Gt(), new Jt(), new qi(), new Hi(), new Bi(), new ar()];
            return (
              !1 !== e.enablePerformanceInstrumentation && t.unshift(new Mt()),
              !1 !== e.enableContentSecurityPolicyInstrumentation && t.push(new lr()),
              !1 !== e.captureConsole && t.push(new ur()),
              t
            );
          }
          ((ur.defaultDisabledLevels = [q.$b.DEBUG, q.$b.TRACE, q.$b.LOG]),
            (ur.consoleErrorPrefix = "console.error: "));
          var hr = function (e, t) {
            var i = {};
            for (var r in e)
              Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (i[r] = e[r]);
            if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
              var n = 0;
              for (r = Object.getOwnPropertySymbols(e); n < r.length; n++)
                t.indexOf(r[n]) < 0 &&
                  Object.prototype.propertyIsEnumerable.call(e, r[n]) &&
                  (i[r[n]] = e[r[n]]);
            }
            return i;
          };
          function dr(e, { experimental: t }) {
            var i;
            const r = null !== (i = null == t ? void 0 : t.trackNavigation) && void 0 !== i && i;
            return e.filter(
              (e) => !("@grafana/faro-web-sdk:instrumentation-navigation" === e.name && !r),
            );
          }
          function fr(e) {
            var t, i;
            const { page: r, generatePageId: n } =
                null !== (t = null == e ? void 0 : e.pageTracking) && void 0 !== t ? t : {},
              s = [
                Qe,
                Me({ generatePageId: n, initialPageMeta: r }),
                ...(null !== (i = e.metas) && void 0 !== i ? i : []),
              ];
            return d(null === window || void 0 === window ? void 0 : window.k6) ? [...s, Xe] : s;
          }
          function pr({ trackGeolocation: e, sessionTracking: t }) {
            var i;
            const r = {};
            return (
              h(e) && (r.geoLocationTrackingEnabled = e),
              b(r)
                ? {}
                : {
                    session: Object.assign(
                      Object.assign(
                        {},
                        null !== (i = null == t ? void 0 : t.session) && void 0 !== i ? i : {},
                      ),
                      { overrides: r },
                    ),
                  }
            );
          }
          function mr(e) {
            const t = (function (e) {
              var t, i, r, n, s;
              const o = [],
                a = K(e.unpatchedConsole, e.internalLoggerLevel);
              e.transports
                ? ((e.url || e.apiKey) &&
                    a.error('if "transports" is defined, "url" and "apiKey" should not be defined'),
                  o.push(...e.transports))
                : e.url
                  ? o.push(new pt({ url: e.url, apiKey: e.apiKey }))
                  : a.error('either "url" or "transports" must be defined');
              const {
                  dedupe: l = !0,
                  eventDomain: u = ce,
                  globalObjectKey: c = le,
                  instrumentations: h = cr(),
                  internalLoggerLevel: d = W,
                  isolate: f = !1,
                  logArgsSerializer: p = H,
                  metas: m = fr(e),
                  paused: g = !1,
                  preventGlobalExposure: v = !1,
                  unpatchedConsole: b = Z,
                  url: O,
                  experimental: w,
                } = e,
                $ = hr(e, [
                  "dedupe",
                  "eventDomain",
                  "globalObjectKey",
                  "instrumentations",
                  "internalLoggerLevel",
                  "isolate",
                  "logArgsSerializer",
                  "metas",
                  "paused",
                  "preventGlobalExposure",
                  "unpatchedConsole",
                  "url",
                  "experimental",
                ]),
                y = null !== (t = null == w ? void 0 : w.trackNavigation) && void 0 !== t && t,
                E = {
                  dataAttributeName:
                    null !==
                      (r =
                        null === (i = e.userActionsInstrumentation) || void 0 === i
                          ? void 0
                          : i.dataAttributeName) && void 0 !== r
                      ? r
                      : _e,
                  excludeItem:
                    null === (n = e.userActionsInstrumentation) || void 0 === n
                      ? void 0
                      : n.excludeItem,
                };
              return Object.assign(Object.assign({}, $), {
                batching: Object.assign(Object.assign({}, ue), e.batching),
                dedupe: l,
                globalObjectKey: c,
                instrumentations: dr(h, e),
                internalLoggerLevel: d,
                isolate: f,
                logArgsSerializer: p,
                metas: m,
                parseStacktrace: Ie,
                paused: g,
                preventGlobalExposure: v,
                transports: o,
                unpatchedConsole: b,
                eventDomain: u,
                ignoreUrls: [
                  ...(null !== (s = e.ignoreUrls) && void 0 !== s ? s : []),
                  ...(O ? [O] : []),
                  /\/collect(?:\/[\w]*)?$/,
                ],
                sessionTracking: Object.assign(
                  Object.assign(Object.assign({}, Ne), e.sessionTracking),
                  pr({ trackGeolocation: e.trackGeolocation, sessionTracking: e.sessionTracking }),
                ),
                userActionsInstrumentation: E,
                experimental: { trackNavigation: y },
              });
            })(e);
            if (t) return ae(t);
          }
          var gr = i(8531),
            vr = i(4696);
          const br = new Map([
            [
              "dev",
              {
                environment: "dev",
                appName: "grafana-metricsdrilldown-app-dev",
                faroUrl:
                  "https://faro-collector-ops-eu-south-0.grafana-ops.net/collect/8c57b32175ba39d35dfaccee7cd793c7",
              },
            ],
            [
              "ops",
              {
                environment: "ops",
                appName: "grafana-metricsdrilldown-app-ops",
                faroUrl:
                  "https://faro-collector-ops-eu-south-0.grafana-ops.net/collect/d65ab91eb9c5e8c51b474d9313ba28f4",
              },
            ],
            [
              "prod",
              {
                environment: "prod",
                appName: "grafana-metricsdrilldown-app-prod",
                faroUrl:
                  "https://faro-collector-ops-eu-south-0.grafana-ops.net/collect/0f4f1bbc97c9e2db4fa85ef75a559885",
              },
            ],
          ]);
          var Or = i(5176),
            wr = i(8943);
          let $r = null;
          const yr = () => $r,
            Er = (e) => ($r = e),
            Sr = [
              "ResizeObserver loop limit exceeded",
              "ResizeObserver loop completed",
              "Non-Error exception captured with keys",
              "Failed sending payload to the receiver",
            ],
            xr = new Set(Sr),
            kr = (e) => xr.has(e);
          function Pr() {
            if (yr()) return;
            const e = (function () {
              const e = (0, vr.u)();
              if (e && br.has(e)) return br.get(e);
            })();
            if (!e) return;
            const { environment: t, faroUrl: i, appName: r } = e,
              { apps: n, bootData: s } = gr.config,
              o = n[wr.s].version,
              a = s.user.email;
            Er(
              mr({
                url: i,
                app: { name: r, release: o, version: Or.t, environment: t },
                user: { email: a },
                ignoreErrors: Sr,
                instrumentations: [...cr({ captureConsole: !1 })],
                isolate: !0,
                beforeSend: (e) => {
                  var t, i;
                  return (null !==
                    (i = null === (t = e.meta.page) || void 0 === t ? void 0 : t.url) &&
                  void 0 !== i
                    ? i
                    : ""
                  ).includes(wr.G)
                    ? e
                    : null;
                },
              }),
            );
          }
        },
      },
      g = {};
    function v(e) {
      var t = g[e];
      if (void 0 !== t) return t.exports;
      var i = (g[e] = { id: e, loaded: !1, exports: {} });
      return (m[e].call(i.exports, i, i.exports, v), (i.loaded = !0), i.exports);
    }
    ((v.m = m),
      (v.amdO = {}),
      (v.n = (e) => {
        var t = e && e.__esModule ? () => e.default : () => e;
        return (v.d(t, { a: t }), t);
      }),
      (d = Object.getPrototypeOf ? (e) => Object.getPrototypeOf(e) : (e) => e.__proto__),
      (v.t = function (e, t) {
        if ((1 & t && (e = this(e)), 8 & t)) return e;
        if ("object" == typeof e && e) {
          if (4 & t && e.__esModule) return e;
          if (16 & t && "function" == typeof e.then) return e;
        }
        var i = Object.create(null);
        v.r(i);
        var r = {};
        h = h || [null, d({}), d([]), d(d)];
        for (
          var n = 2 & t && e;
          ("object" == typeof n || "function" == typeof n) && !~h.indexOf(n);
          n = d(n)
        )
          Object.getOwnPropertyNames(n).forEach((t) => (r[t] = () => e[t]));
        return ((r.default = () => e), v.d(i, r), i);
      }),
      (v.d = (e, t) => {
        for (var i in t)
          v.o(t, i) && !v.o(e, i) && Object.defineProperty(e, i, { enumerable: !0, get: t[i] });
      }),
      (v.f = {}),
      (v.e = (e) => Promise.all(Object.keys(v.f).reduce((t, i) => (v.f[i](e, t), t), []))),
      (v.u = (e) =>
        e +
        ".js?_cache=" +
        {
          2: "7101916049f818d58037",
          14: "78d2cf82b9223fc7c83b",
          64: "bfff71b84c3b67cff0fb",
          70: "2d1e37c1233024806300",
          74: "6a6cf4493168a4c4b2a0",
          150: "a9eae9ab36b5aa3a2e33",
          156: "dcd383229c5404d776bf",
          190: "a6f6d81aca619dd3f85e",
          204: "a5e1e43a30242b60d7bf",
          206: "130901d6a2dcaa8e3dfe",
          220: "f2309b411f0ae9855b9a",
          327: "62ce92e00bf3f37cfb9f",
          341: "8f9cffe8b5fc06dedcdc",
          353: "00ac2f1a6a55baf37ac5",
          452: "f9b334f400470b8ac4d9",
          494: "ff9b6a2075e35a07f4a4",
          497: "f5626109700b83156ec7",
          503: "201b25c5f9822f473e7d",
          509: "00e2bf5c44d39ba55b70",
          549: "79f2b0fd3610c8ad03b7",
          582: "a1556b2a2a05b8e0497f",
          591: "72d8c50f59d75a36ab7e",
          644: "14d38f9a6e5a99fbf61f",
          660: "b143f478b19fd3cf5886",
          697: "d2ab3d5c44c5aa5add66",
          728: "14a7052bbaac81bc3b4d",
          752: "0b264ba916a1692ed22a",
          767: "b4f9d973b92b7eab01ca",
          768: "0c7a32587e06d69ff2b1",
          792: "79c48dbde1c722d712fa",
          826: "b09652f7733d2a40775d",
          876: "1a7696652a5f03389ba7",
          935: "fd2b5fa0f235da53b5b0",
          944: "5da0375876db943a6756",
          980: "655996be379e3e595023",
        }[e]),
      (v.g = (function () {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || new Function("return this")();
        } catch (e) {
          if ("object" == typeof window) return window;
        }
      })()),
      (v.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
      (f = {}),
      (p = "grafana-metricsdrilldown-app:"),
      (v.l = (e, t, i, r) => {
        if (f[e]) f[e].push(t);
        else {
          var n, s;
          if (void 0 !== i)
            for (var o = document.getElementsByTagName("script"), a = 0; a < o.length; a++) {
              var l = o[a];
              if (l.getAttribute("src") == e || l.getAttribute("data-webpack") == p + i) {
                n = l;
                break;
              }
            }
          (n ||
            ((s = !0),
            ((n = document.createElement("script")).charset = "utf-8"),
            v.nc && n.setAttribute("nonce", v.nc),
            n.setAttribute("data-webpack", p + i),
            (n.src = e),
            0 !== n.src.indexOf(window.location.origin + "/") && (n.crossOrigin = "anonymous"),
            (n.integrity = v.sriHashes[r]),
            (n.crossOrigin = "anonymous")),
            (f[e] = [t]));
          var u = (t, i) => {
              ((n.onerror = n.onload = null), clearTimeout(c));
              var r = f[e];
              if (
                (delete f[e],
                n.parentNode && n.parentNode.removeChild(n),
                r && r.forEach((e) => e(i)),
                t)
              )
                return t(i);
            },
            c = setTimeout(u.bind(null, void 0, { type: "timeout", target: n }), 12e4);
          ((n.onerror = u.bind(null, n.onerror)),
            (n.onload = u.bind(null, n.onload)),
            s && document.head.appendChild(n));
        }
      }),
      (v.r = (e) => {
        ("undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 }));
      }),
      (v.nmd = (e) => ((e.paths = []), e.children || (e.children = []), e)),
      (v.p = "public/plugins/grafana-metricsdrilldown-app/"),
      (v.sriHashes = {
        2: "sha256-HkcJZErouD3WL+1stzs18OPSMsSF4QWoOp955TmukbM=",
        14: "sha256-LleEYD9ch9zjRIg6n3XN+E0W6c9HBVLc3m81UJ98ky8=",
        64: "sha256-+eS4ibapvl/wQIEzXmJ+plgMZyGFc61E0tfUHJLojSg=",
        70: "sha256-GaO4d6yeP+YB+9WyDAkUHHIJbSHxKfm7bwH09jrS8y8=",
        74: "sha256-SQr33/MDfoRAIyaGFvwvmFiatOFS+WCGRjvJlIrxRkk=",
        150: "sha256-9tz72qsU48mgerjaxGJNDp7uWJVhYs0SStgPNw9HDYM=",
        156: "sha256-Bo5PyLaQ8sgO6yPS4FhAlVlpOscfzI0pWdsqBDuIX20=",
        190: "sha256-12aRaPJrfy9ZI3DpnLCelye64bR7P1GdTfG6ANaqQPU=",
        204: "sha256-p1X6a7smlu+f/8C2aBj6QJ6PjfTi8/vBPx9yxt31+8g=",
        206: "sha256-gyUOFb+pbvMAsycBxAf4skP8MwlrWjwB39sLAXevptY=",
        220: "sha256-duXi/YNmlUSXYMogjs+hFWHIlg1xeMxhY+/bIWhN17U=",
        327: "sha256-K+kGzqXTSt1SmcvkrsIUOGFoVUwmxIZO84r0AzdhWj8=",
        341: "sha256-s4GbMhRpxmQwojCT+aM3qGDneWHezQj2pZakPoFYSZo=",
        353: "sha256-MkI5qRIuIcYI1RkPnv4wr6CLe6N2y8AI0jLJY48CdsY=",
        452: "sha256-HI/qNCR/LyqxaIt32lzLfqWKQr8r2egaUKSNNjCNVc0=",
        494: "sha256-RmDZflE/IAawD6r7s4I98u5NTa4iKg97GJfTDpOlJWc=",
        497: "sha256-dcrpDu/gOGx0+vptSMJi1kI5gq1Dxi7ONa9Qwj46Tc8=",
        503: "sha256-ic4QpZSNLDJPDkPFyjZX7zqHIVjblVoZZ+mtxL15G3Y=",
        509: "sha256-ilx5f7LSmaRgRL/dPEx/kYRnlcocxmo/iJLEUFGKK4s=",
        549: "sha256-zQex0nYwO7K6coUcUY9hJPiv/a/m7WSAEoFkKgrZD0M=",
        582: "sha256-ma5aIvogv/1lzEb7gT15yy1a2RIrGjJw1lzDuM1cbX8=",
        591: "sha256-aFeKURcdDlRpmIAImf0xoFCaEkdixTyfviao544ElvY=",
        644: "sha256-PSQxRXZiHRv2/UODxWqRoa3VK6GMjbSFZ5NkiBp/BvU=",
        660: "sha256-g6vlB8R7evXe2yFwTPWlRD8KU4t4elZAD8Nv4NKvi9M=",
        697: "sha256-qm318cH6+mW9IIRUnmJdaZAQ+KWSpnAxZoIq5EqcIwA=",
        728: "sha256-Zte/5hKQly3rrFrud4+j1dHAkIG3o1F5uuTIe7Co1Xs=",
        752: "sha256-LH9Qbhs8sKF/I29jAPEZiveVo86IrNKmi+ix14vWagw=",
        767: "sha256-n7PgmQw9FZEgqDgNgUg8D55Ub9UoOW7M/p4+brJKQpM=",
        768: "sha256-cWOAJywILVC6c+GvGfnOcTQiFaEpBeBU972iNb+b1C0=",
        792: "sha256-n9glSvUoslqv4tg53t94pHnbLrTU+AZ5rQm88Td1s2I=",
        826: "sha256-wJ3BQbvI6HTt9EISlXlMLJVtKGVoQK8zrWxySHS6P6g=",
        876: "sha256-CF4WCyKMUQ1b3Vg/29Y4tOR9PMVwY2LBcH66r1eX33U=",
        935: "sha256-J8V05dhQSxYGryvWbCN0Apf7U9O6vC9ywnCWfaWr7Sw=",
        944: "sha256-yhcd2tTsl4eyyVcdVbjqYyqQOmjkJ2NhaVW+Azyq0Io=",
        980: "sha256-hZBLmPqKcZ77U0udmW/Es1zyFtjLhND/jL80SJV0rqY=",
      }),
      (() => {
        v.b = ("undefined" != typeof document && document.baseURI) || self.location.href;
        var e = { 231: 0 };
        v.f.j = (t, i) => {
          var r = v.o(e, t) ? e[t] : void 0;
          if (0 !== r)
            if (r) i.push(r[2]);
            else {
              var n = new Promise((i, n) => (r = e[t] = [i, n]));
              i.push((r[2] = n));
              var s = v.p + v.u(t),
                o = new Error();
              v.l(
                s,
                (i) => {
                  if (v.o(e, t) && (0 !== (r = e[t]) && (e[t] = void 0), r)) {
                    var n = i && ("load" === i.type ? "missing" : i.type),
                      s = i && i.target && i.target.src;
                    ((o.message = "Loading chunk " + t + " failed.\n(" + n + ": " + s + ")"),
                      (o.name = "ChunkLoadError"),
                      (o.type = n),
                      (o.request = s),
                      r[1](o));
                  }
                },
                "chunk-" + t,
                t,
              );
            }
        };
        var t = (t, i) => {
            var r,
              n,
              [s, o, a] = i,
              l = 0;
            if (s.some((t) => 0 !== e[t])) {
              for (r in o) v.o(o, r) && (v.m[r] = o[r]);
              if (a) a(v);
            }
            for (t && t(i); l < s.length; l++)
              ((n = s[l]), v.o(e, n) && e[n] && e[n][0](), (e[n] = 0));
          },
          i = (self.webpackChunkgrafana_metricsdrilldown_app =
            self.webpackChunkgrafana_metricsdrilldown_app || []);
        (i.forEach(t.bind(null, 0)), (i.push = t.bind(null, i.push.bind(i))));
      })());
    var b = {};
    return (
      (() => {
        "use strict";
        (v.r(b), v.d(b, { plugin: () => I }));
        var e = v(1308),
          t = v.n(e);
        v.p =
          t() && t().uri
            ? t().uri.slice(0, t().uri.lastIndexOf("/") + 1)
            : "public/plugins/grafana-metricsdrilldown-app/";
        var i = v(7781),
          r = v(8531),
          n = v(2007),
          s = v(5959),
          o = v.n(s),
          a = v(8449);
        function l(e, t, i, r, n, s, o) {
          try {
            var a = e[s](o),
              l = a.value;
          } catch (e) {
            return void i(e);
          }
          a.done ? t(l) : Promise.resolve(l).then(r, n);
        }
        const u = (0, s.lazy)(() => {
          return ((e = function* () {
            const { initPluginTranslations: e } = yield Promise.all([v.e(591), v.e(503)]).then(
                v.bind(v, 5503),
              ),
              { loadResources: t } = yield Promise.all([v.e(591), v.e(14)]).then(v.bind(v, 3014));
            return (
              yield e("grafana-scenes", [t]),
              Promise.all([v.e(591), v.e(14), v.e(944), v.e(204), v.e(935), v.e(452)]).then(
                v.bind(v, 7452),
              )
            );
          }),
          function () {
            var t = this,
              i = arguments;
            return new Promise(function (r, n) {
              var s = e.apply(t, i);
              function o(e) {
                l(s, r, n, o, a, "next", e);
              }
              function a(e) {
                l(s, r, n, o, a, "throw", e);
              }
              o(void 0);
            });
          })();
          var e;
        });
        var c = v(2533);
        const h = {
          id: `${c.id}/label-breakdown-component/v1`,
          title: "Label Breakdown",
          description: "A metrics label breakdown view from the Metrics Drilldown app.",
          component: (e) =>
            o().createElement(
              s.Suspense,
              { fallback: o().createElement("div", null, "Loading...") },
              o().createElement(u, e),
            ),
        };
        function d(e, t, i, r, n, s, o) {
          try {
            var a = e[s](o),
              l = a.value;
          } catch (e) {
            return void i(e);
          }
          a.done ? t(l) : Promise.resolve(l).then(r, n);
        }
        const f = (0, s.lazy)(() => {
            return ((e = function* () {
              const { initPluginTranslations: e } = yield Promise.all([v.e(591), v.e(503)]).then(
                  v.bind(v, 5503),
                ),
                { loadResources: t } = yield Promise.all([v.e(591), v.e(14)]).then(v.bind(v, 3014));
              return (
                yield e("grafana-scenes", [t]),
                Promise.all([v.e(591), v.e(14), v.e(944), v.e(204), v.e(935), v.e(728)]).then(
                  v.bind(v, 3728),
                )
              );
            }),
            function () {
              var t = this,
                i = arguments;
              return new Promise(function (r, n) {
                var s = e.apply(t, i);
                function o(e) {
                  d(s, r, n, o, a, "next", e);
                }
                function a(e) {
                  d(s, r, n, o, a, "throw", e);
                }
                o(void 0);
              });
            })();
            var e;
          }),
          p = {
            id: `${c.id}/mini-breakdown-component/v1`,
            title: "Mini Label Breakdown Navigation",
            description:
              "A mini metrics label breakdown view from the Metrics Drilldown app used for navigation.",
            component: (e) =>
              o().createElement(
                s.Suspense,
                { fallback: o().createElement("div", null, "Loading...") },
                o().createElement(f, e),
              ),
          };
        function m(e, t, i, r, n, s, o) {
          try {
            var a = e[s](o),
              l = a.value;
          } catch (e) {
            return void i(e);
          }
          a.done ? t(l) : Promise.resolve(l).then(r, n);
        }
        const g = (0, s.lazy)(() => {
            return ((e = function* () {
              const { initPluginTranslations: e } = yield Promise.all([v.e(591), v.e(503)]).then(
                  v.bind(v, 5503),
                ),
                { loadResources: t } = yield Promise.all([v.e(591), v.e(14)]).then(v.bind(v, 3014));
              return (
                yield e("grafana-scenes", [t]),
                Promise.all([v.e(591), v.e(14), v.e(944), v.e(204), v.e(935), v.e(768)]).then(
                  v.bind(v, 4768),
                )
              );
            }),
            function () {
              var t = this,
                i = arguments;
              return new Promise(function (r, n) {
                var s = e.apply(t, i);
                function o(e) {
                  m(s, r, n, o, a, "next", e);
                }
                function a(e) {
                  m(s, r, n, o, a, "throw", e);
                }
                o(void 0);
              });
            })();
            var e;
          }),
          O = [
            h,
            p,
            {
              id: `${c.id}/knowledge-graph-insight-metrics/v1`,
              title: "Knowledge Graph Source Metrics",
              description: "Explore the underlying metrics related to a Knowledge Graph insight",
              component: (e) =>
                o().createElement(
                  s.Suspense,
                  { fallback: o().createElement("div", null, "Loading...") },
                  o().createElement(g, e),
                ),
            },
          ];
        var w = v(3781),
          $ = v(3498),
          y = v(4440);
        function E(e, t = $.b.Drilldown) {
          const i = (0, w.kY)([[w.I8.DatasourceId, e]]);
          return (0, w.Rk)(t, i);
        }
        const S = "Browse metrics in Grafana Metrics Drilldown",
          x = [
            {
              title: "Open in Metrics Drilldown",
              description: S,
              targets: [
                i.PluginExtensionPoints.DataSourceConfigActions,
                i.PluginExtensionPoints.DataSourceConfigStatus,
              ],
              icon: "drilldown",
              category: "metrics-drilldown",
              path: (0, w.Rk)($.b.Drilldown),
              configure: (e) => {
                var t, i;
                if (
                  (null == e || null === (t = e.dataSource) || void 0 === t ? void 0 : t.type) &&
                  (null == e || null === (i = e.dataSource) || void 0 === i ? void 0 : i.uid) &&
                  (0, y.aQ)(e.dataSource)
                )
                  return { path: E(e.dataSource.uid), description: S };
              },
            },
          ];
        var k = v(8705);
        function P(e, t, i, r, n, s, o) {
          try {
            var a = e[s](o),
              l = a.value;
          } catch (e) {
            return void i(e);
          }
          a.done ? t(l) : Promise.resolve(l).then(r, n);
        }
        const T = (0, s.lazy)(() => {
            return ((e = function* () {
              var e;
              const { initPluginTranslations: t } = yield Promise.all([v.e(591), v.e(503)]).then(
                  v.bind(v, 5503),
                ),
                { loadResources: i } = yield Promise.all([v.e(591), v.e(14)]).then(v.bind(v, 3014));
              yield t("grafana-scenes", [i]);
              const { loadResources: n } = yield v.e(752).then(v.bind(v, 7752)),
                s = (0, a.lt)(
                  (null === r.config ||
                  void 0 === r.config ||
                  null === (e = r.config.buildInfo) ||
                  void 0 === e
                    ? void 0
                    : e.version) || "0.0.0",
                  "12.1.0",
                )
                  ? [n]
                  : [];
              yield t(c.id, s);
              const { wasmSupported: o } = yield Promise.all([
                  v.e(591),
                  v.e(14),
                  v.e(944),
                  v.e(204),
                  v.e(935),
                ]).then(v.bind(v, 2290)),
                { default: l } = yield v.e(944).then(v.bind(v, 6944));
              if (o())
                try {
                  yield l();
                } catch (e) {
                  k.v.error(e, { message: "Error while initializing outlier detection" });
                }
              else k.v.warn("WASM not supported, outlier detection will not work");
              return Promise.all([
                v.e(591),
                v.e(14),
                v.e(944),
                v.e(204),
                v.e(792),
                v.e(935),
                v.e(509),
              ]).then(v.bind(v, 4509));
            }),
            function () {
              var t = this,
                i = arguments;
              return new Promise(function (r, n) {
                var s = e.apply(t, i);
                function o(e) {
                  P(s, r, n, o, a, "next", e);
                }
                function a(e) {
                  P(s, r, n, o, a, "throw", e);
                }
                o(void 0);
              });
            })();
            var e;
          }),
          I = new i.AppPlugin().setRootPage((e) =>
            o().createElement(
              s.Suspense,
              { fallback: o().createElement(n.LoadingPlaceholder, { text: "" }) },
              o().createElement(T, e),
            ),
          );
        for (const e of [...w.Ge, ...x]) I.addLink(e);
        for (const e of O) I.exposeComponent(e);
      })(),
      b
    );
  })());
//# sourceMappingURL=module.js.map
