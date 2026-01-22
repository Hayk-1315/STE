/*! For license information please see 14.js.LICENSE.txt */
(self.webpackChunkgrafana_metricsdrilldown_app =
  self.webpackChunkgrafana_metricsdrilldown_app || []).push([
  [14],
  {
    362: (e, t, n) => {
      "use strict";
      var r = n(6441);
      function a() {}
      function i() {}
      ((i.resetWarningCache = a),
        (e.exports = function () {
          function e(e, t, n, a, i, o) {
            if (o !== r) {
              var s = new Error(
                "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types",
              );
              throw ((s.name = "Invariant Violation"), s);
            }
          }
          function t() {
            return e;
          }
          e.isRequired = e;
          var n = {
            array: e,
            bigint: e,
            bool: e,
            func: e,
            number: e,
            object: e,
            string: e,
            symbol: e,
            any: e,
            arrayOf: t,
            element: e,
            elementType: e,
            instanceOf: t,
            node: e,
            objectOf: t,
            oneOf: t,
            oneOfType: t,
            shape: t,
            exact: t,
            checkPropTypes: i,
            resetWarningCache: a,
          };
          return ((n.PropTypes = n), n);
        }));
    },
    402: (e, t, n) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.canDragX = function (e) {
          return "both" === e.props.axis || "x" === e.props.axis;
        }),
        (t.canDragY = function (e) {
          return "both" === e.props.axis || "y" === e.props.axis;
        }),
        (t.createCoreData = function (e, t, n) {
          const a = !(0, r.isNum)(e.lastX),
            o = i(e);
          return a
            ? { node: o, deltaX: 0, deltaY: 0, lastX: t, lastY: n, x: t, y: n }
            : {
                node: o,
                deltaX: t - e.lastX,
                deltaY: n - e.lastY,
                lastX: e.lastX,
                lastY: e.lastY,
                x: t,
                y: n,
              };
        }),
        (t.createDraggableData = function (e, t) {
          const n = e.props.scale;
          return {
            node: t.node,
            x: e.state.x + t.deltaX / n,
            y: e.state.y + t.deltaY / n,
            deltaX: t.deltaX / n,
            deltaY: t.deltaY / n,
            lastX: e.state.x,
            lastY: e.state.y,
          };
        }),
        (t.getBoundPosition = function (e, t, n) {
          if (!e.props.bounds) return [t, n];
          let { bounds: o } = e.props;
          o =
            "string" == typeof o
              ? o
              : (function (e) {
                  return { left: e.left, top: e.top, right: e.right, bottom: e.bottom };
                })(o);
          const s = i(e);
          if ("string" == typeof o) {
            const { ownerDocument: e } = s,
              t = e.defaultView;
            let n;
            if ("parent" === o) n = s.parentNode;
            else {
              n = s.getRootNode().querySelector(o);
            }
            if (!(n instanceof t.HTMLElement))
              throw new Error('Bounds selector "' + o + '" could not find an element.');
            const i = n,
              l = t.getComputedStyle(s),
              u = t.getComputedStyle(i);
            o = {
              left: -s.offsetLeft + (0, r.int)(u.paddingLeft) + (0, r.int)(l.marginLeft),
              top: -s.offsetTop + (0, r.int)(u.paddingTop) + (0, r.int)(l.marginTop),
              right:
                (0, a.innerWidth)(i) -
                (0, a.outerWidth)(s) -
                s.offsetLeft +
                (0, r.int)(u.paddingRight) -
                (0, r.int)(l.marginRight),
              bottom:
                (0, a.innerHeight)(i) -
                (0, a.outerHeight)(s) -
                s.offsetTop +
                (0, r.int)(u.paddingBottom) -
                (0, r.int)(l.marginBottom),
            };
          }
          (0, r.isNum)(o.right) && (t = Math.min(t, o.right));
          (0, r.isNum)(o.bottom) && (n = Math.min(n, o.bottom));
          (0, r.isNum)(o.left) && (t = Math.max(t, o.left));
          (0, r.isNum)(o.top) && (n = Math.max(n, o.top));
          return [t, n];
        }),
        (t.getControlPosition = function (e, t, n) {
          const r = "number" == typeof t ? (0, a.getTouch)(e, t) : null;
          if ("number" == typeof t && !r) return null;
          const o = i(n),
            s = n.props.offsetParent || o.offsetParent || o.ownerDocument.body;
          return (0, a.offsetXYFromParent)(r || e, s, n.props.scale);
        }),
        (t.snapToGrid = function (e, t, n) {
          const r = Math.round(t / e[0]) * e[0],
            a = Math.round(n / e[1]) * e[1];
          return [r, a];
        }));
      var r = n(6732),
        a = n(2837);
      function i(e) {
        const t = e.findDOMNode();
        if (!t) throw new Error("<DraggableCore>: Unmounted during event!");
        return t;
      }
    },
    414: (e, t, n) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.bottom = d),
        (t.childrenEqual = function (e, t) {
          return (0, r.default)(
            a.default.Children.map(e, function (e) {
              return null == e ? void 0 : e.key;
            }),
            a.default.Children.map(t, function (e) {
              return null == e ? void 0 : e.key;
            }),
          );
        }),
        (t.cloneLayout = p),
        (t.cloneLayoutItem = f),
        (t.collides = g),
        (t.compact = v),
        (t.compactItem = w),
        (t.compactType = function (e) {
          var t = e || {},
            n = t.verticalCompact,
            r = t.compactType;
          return !1 === n ? null : r;
        }),
        (t.correctBounds = S),
        (t.fastPositionEqual = function (e, t) {
          return (
            e.left === t.left && e.top === t.top && e.width === t.width && e.height === t.height
          );
        }),
        (t.fastRGLPropsEqual = void 0),
        (t.getAllCollisions = C),
        (t.getFirstCollision = _),
        (t.getLayoutItem = x),
        (t.getStatics = O),
        (t.modifyLayout = h),
        (t.moveElement = R),
        (t.moveElementAwayFromCollision = k),
        (t.noop = void 0),
        (t.perc = function (e) {
          return 100 * e + "%";
        }),
        (t.setTopLeft = function (e) {
          var t = e.top,
            n = e.left,
            r = e.width,
            a = e.height;
          return {
            top: "".concat(t, "px"),
            left: "".concat(n, "px"),
            width: "".concat(r, "px"),
            height: "".concat(a, "px"),
            position: "absolute",
          };
        }),
        (t.setTransform = function (e) {
          var t = e.top,
            n = e.left,
            r = e.width,
            a = e.height,
            i = "translate(".concat(n, "px,").concat(t, "px)");
          return {
            transform: i,
            WebkitTransform: i,
            MozTransform: i,
            msTransform: i,
            OTransform: i,
            width: "".concat(r, "px"),
            height: "".concat(a, "px"),
            position: "absolute",
          };
        }),
        (t.sortLayoutItems = E),
        (t.sortLayoutItemsByColRow = D),
        (t.sortLayoutItemsByRowCol = T),
        (t.synchronizeLayoutWithChildren = function (e, t, n, r, i) {
          e = e || [];
          var o = [];
          a.default.Children.forEach(t, function (t) {
            if (null != (null == t ? void 0 : t.key)) {
              var n = x(e, String(t.key));
              if (n) o.push(f(n));
              else {
                !u &&
                  t.props._grid &&
                  console.warn(
                    "`_grid` properties on children have been deprecated as of React 15.2. Please use `data-grid` or add your properties directly to the `layout`.",
                  );
                var r = t.props["data-grid"] || t.props._grid;
                r
                  ? (u || P([r], "ReactGridLayout.children"),
                    o.push(f(s(s({}, r), {}, { i: t.key }))))
                  : o.push(f({ w: 1, h: 1, x: 0, y: d(o), i: String(t.key) }));
              }
            }
          });
          var l = S(o, { cols: n });
          return i ? l : v(l, r, n);
        }),
        (t.validateLayout = P),
        (t.withLayoutItem = function (e, t, n) {
          var r = x(e, t);
          return r ? ((r = n(f(r))), [(e = h(e, r)), r]) : [e, null];
        }));
      var r = i(n(7842)),
        a = i(n(5959));
      function i(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function o(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          (t &&
            (r = r.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, r));
        }
        return n;
      }
      function s(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? o(Object(n), !0).forEach(function (t) {
                l(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : o(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function l(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
      var u = !0,
        c = !1;
      function d(e) {
        for (var t, n = 0, r = 0, a = e.length; r < a; r++) (t = e[r].y + e[r].h) > n && (n = t);
        return n;
      }
      function p(e) {
        for (var t = Array(e.length), n = 0, r = e.length; n < r; n++) t[n] = f(e[n]);
        return t;
      }
      function h(e, t) {
        for (var n = Array(e.length), r = 0, a = e.length; r < a; r++)
          t.i === e[r].i ? (n[r] = t) : (n[r] = e[r]);
        return n;
      }
      function f(e) {
        return {
          w: e.w,
          h: e.h,
          x: e.x,
          y: e.y,
          i: e.i,
          minW: e.minW,
          maxW: e.maxW,
          minH: e.minH,
          maxH: e.maxH,
          moved: Boolean(e.moved),
          static: Boolean(e.static),
          isDraggable: e.isDraggable,
          isResizable: e.isResizable,
          resizeHandles: e.resizeHandles,
          isBounded: e.isBounded,
        };
      }
      var m = n(7434);
      function g(e, t) {
        return (
          e.i !== t.i &&
          !(e.x + e.w <= t.x) &&
          !(e.x >= t.x + t.w) &&
          !(e.y + e.h <= t.y) &&
          !(e.y >= t.y + t.h)
        );
      }
      function v(e, t, n) {
        for (var r = O(e), a = E(e, t), i = Array(e.length), o = 0, s = a.length; o < s; o++) {
          var l = f(a[o]);
          (l.static || ((l = w(r, l, t, n, a)), r.push(l)),
            (i[e.indexOf(a[o])] = l),
            (l.moved = !1));
        }
        return i;
      }
      t.fastRGLPropsEqual = m;
      var b = { x: "w", y: "h" };
      function y(e, t, n, r) {
        var a = b[r];
        t[r] += 1;
        for (
          var i =
            e
              .map(function (e) {
                return e.i;
              })
              .indexOf(t.i) + 1;
          i < e.length;
          i++
        ) {
          var o = e[i];
          if (!o.static) {
            if (o.y > t.y + t.h) break;
            g(t, o) && y(e, o, n + t[a], r);
          }
        }
        t[r] = n;
      }
      function w(e, t, n, r, a) {
        var i,
          o = "horizontal" === n;
        if ("vertical" === n) for (t.y = Math.min(d(e), t.y); t.y > 0 && !_(e, t); ) t.y--;
        else if (o) for (; t.x > 0 && !_(e, t); ) t.x--;
        for (; (i = _(e, t)); )
          (o ? y(a, t, i.x + i.w, "x") : y(a, t, i.y + i.h, "y"),
            o && t.x + t.w > r && ((t.x = r - t.w), t.y++));
        return ((t.y = Math.max(t.y, 0)), (t.x = Math.max(t.x, 0)), t);
      }
      function S(e, t) {
        for (var n = O(e), r = 0, a = e.length; r < a; r++) {
          var i = e[r];
          if (
            (i.x + i.w > t.cols && (i.x = t.cols - i.w),
            i.x < 0 && ((i.x = 0), (i.w = t.cols)),
            i.static)
          )
            for (; _(n, i); ) i.y++;
          else n.push(i);
        }
        return e;
      }
      function x(e, t) {
        for (var n = 0, r = e.length; n < r; n++) if (e[n].i === t) return e[n];
      }
      function _(e, t) {
        for (var n = 0, r = e.length; n < r; n++) if (g(e[n], t)) return e[n];
      }
      function C(e, t) {
        return e.filter(function (e) {
          return g(e, t);
        });
      }
      function O(e) {
        return e.filter(function (e) {
          return e.static;
        });
      }
      function R(e, t, n, r, a, i, o, s, l) {
        if (t.static && !0 !== t.isDraggable) return e;
        if (t.y === r && t.x === n) return e;
        A(
          "Moving element "
            .concat(t.i, " to [")
            .concat(String(n), ",")
            .concat(String(r), "] from [")
            .concat(t.x, ",")
            .concat(t.y, "]"),
        );
        var u = t.x,
          c = t.y;
        ("number" == typeof n && (t.x = n), "number" == typeof r && (t.y = r), (t.moved = !0));
        var d = E(e, o);
        ("vertical" === o && "number" == typeof r
          ? c >= r
          : "horizontal" === o && "number" == typeof n && u >= n) && (d = d.reverse());
        var h = C(d, t),
          f = h.length > 0;
        if (f && l) return p(e);
        if (f && i)
          return (
            A("Collision prevented on ".concat(t.i, ", reverting.")),
            (t.x = u),
            (t.y = c),
            (t.moved = !1),
            e
          );
        for (var m = 0, g = h.length; m < g; m++) {
          var v = h[m];
          (A(
            "Resolving collision between "
              .concat(t.i, " at [")
              .concat(t.x, ",")
              .concat(t.y, "] and ")
              .concat(v.i, " at [")
              .concat(v.x, ",")
              .concat(v.y, "]"),
          ),
            v.moved || (e = v.static ? k(e, v, t, a, o, s) : k(e, t, v, a, o, s)));
        }
        return e;
      }
      function k(e, t, n, r, a, i) {
        var o = "horizontal" === a,
          s = "horizontal" !== a,
          l = t.static;
        if (r) {
          r = !1;
          var u = {
            x: o ? Math.max(t.x - n.w, 0) : n.x,
            y: s ? Math.max(t.y - n.h, 0) : n.y,
            w: n.w,
            h: n.h,
            i: "-1",
          };
          if (!_(e, u))
            return (
              A(
                "Doing reverse collision on "
                  .concat(n.i, " up to [")
                  .concat(u.x, ",")
                  .concat(u.y, "]."),
              ),
              R(e, n, o ? u.x : void 0, s ? u.y : void 0, r, l, a, i)
            );
        }
        return R(e, n, o ? n.x + 1 : void 0, s ? n.y + 1 : void 0, r, l, a, i);
      }
      function E(e, t) {
        return "horizontal" === t ? D(e) : "vertical" === t ? T(e) : e;
      }
      function T(e) {
        return e.slice(0).sort(function (e, t) {
          return e.y > t.y || (e.y === t.y && e.x > t.x) ? 1 : e.y === t.y && e.x === t.x ? 0 : -1;
        });
      }
      function D(e) {
        return e.slice(0).sort(function (e, t) {
          return e.x > t.x || (e.x === t.x && e.y > t.y) ? 1 : -1;
        });
      }
      function P(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "Layout",
          n = ["x", "y", "w", "h"];
        if (!Array.isArray(e)) throw new Error(t + " must be an array!");
        for (var r = 0, a = e.length; r < a; r++)
          for (var i = e[r], o = 0; o < n.length; o++)
            if ("number" != typeof i[n[o]])
              throw new Error(
                "ReactGridLayout: " + t + "[" + r + "]." + n[o] + " must be a number!",
              );
      }
      function A() {
        var e;
        c && (e = console).log.apply(e, arguments);
      }
      t.noop = function () {};
    },
    544: (e, t, n) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.findOrGenerateResponsiveLayout = function (e, t, n, i, o, s) {
          if (e[n]) return (0, r.cloneLayout)(e[n]);
          for (var l = e[i], u = a(t), c = u.slice(u.indexOf(n)), d = 0, p = c.length; d < p; d++) {
            var h = c[d];
            if (e[h]) {
              l = e[h];
              break;
            }
          }
          return (
            (l = (0, r.cloneLayout)(l || [])),
            (0, r.compact)((0, r.correctBounds)(l, { cols: o }), s, o)
          );
        }),
        (t.getBreakpointFromWidth = function (e, t) {
          for (var n = a(e), r = n[0], i = 1, o = n.length; i < o; i++) {
            var s = n[i];
            t > e[s] && (r = s);
          }
          return r;
        }),
        (t.getColsFromBreakpoint = function (e, t) {
          if (!t[e])
            throw new Error(
              "ResponsiveReactGridLayout: `cols` entry for breakpoint " + e + " is missing!",
            );
          return t[e];
        }),
        (t.sortBreakpoints = a));
      var r = n(414);
      function a(e) {
        return Object.keys(e).sort(function (t, n) {
          return e[t] - e[n];
        });
      }
    },
    906: (e, t) => {
      "use strict";
      function n(e) {
        var t = e.margin,
          n = e.containerPadding,
          r = e.containerWidth,
          a = e.cols;
        return (r - t[0] * (a - 1) - 2 * n[0]) / a;
      }
      function r(e, t, n) {
        return Number.isFinite(e) ? Math.round(t * e + Math.max(0, e - 1) * n) : e;
      }
      function a(e, t, n) {
        return Math.max(Math.min(e, n), t);
      }
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.calcGridColWidth = n),
        (t.calcGridItemPosition = function (e, t, a, i, o, s) {
          var l = e.margin,
            u = e.containerPadding,
            c = e.rowHeight,
            d = n(e),
            p = {};
          s && s.resizing
            ? ((p.width = Math.round(s.resizing.width)), (p.height = Math.round(s.resizing.height)))
            : ((p.width = r(i, d, l[0])), (p.height = r(o, c, l[1])));
          s && s.dragging
            ? ((p.top = Math.round(s.dragging.top)), (p.left = Math.round(s.dragging.left)))
            : ((p.top = Math.round((c + l[1]) * a + u[1])),
              (p.left = Math.round((d + l[0]) * t + u[0])));
          return p;
        }),
        (t.calcGridItemWHPx = r),
        (t.calcWH = function (e, t, r, i, o) {
          var s = e.margin,
            l = e.maxRows,
            u = e.cols,
            c = e.rowHeight,
            d = n(e),
            p = Math.round((t + s[0]) / (d + s[0])),
            h = Math.round((r + s[1]) / (c + s[1]));
          return ((p = a(p, 0, u - i)), (h = a(h, 0, l - o)), { w: p, h });
        }),
        (t.calcXY = function (e, t, r, i, o) {
          var s = e.margin,
            l = e.cols,
            u = e.rowHeight,
            c = e.maxRows,
            d = n(e),
            p = Math.round((r - s[0]) / (d + s[0])),
            h = Math.round((t - s[1]) / (u + s[1]));
          return ((p = a(p, 0, l - i)), (h = a(h, 0, c - o)), { x: p, y: h });
        }),
        (t.clamp = a));
    },
    936: (e, t, n) => {
      "use strict";
      ((e.exports = function () {
        throw new Error(
          "Don't instantiate Resizable directly! Use require('react-resizable').Resizable",
        );
      }),
        (e.exports.Resizable = n(1794).default),
        (e.exports.ResizableBox = n(6609).default));
    },
    1060: (e, t, n) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }), (t.default = void 0));
      var r = (function (e, t) {
          if ("function" == typeof WeakMap)
            var n = new WeakMap(),
              r = new WeakMap();
          return (function (e, t) {
            if (!t && e && e.__esModule) return e;
            var a,
              i,
              o = { __proto__: null, default: e };
            if (null === e || ("object" != typeof e && "function" != typeof e)) return o;
            if ((a = t ? r : n)) {
              if (a.has(e)) return a.get(e);
              a.set(e, o);
            }
            for (const t in e)
              "default" !== t &&
                {}.hasOwnProperty.call(e, t) &&
                ((i = (a = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) &&
                (i.get || i.set)
                  ? a(o, t, i)
                  : (o[t] = e[t]));
            return o;
          })(e, t);
        })(n(5959)),
        a = c(n(2688)),
        i = c(n(8398)),
        o = n(2837),
        s = n(402),
        l = n(6732),
        u = c(n(7988));
      function c(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function d(e, t, n) {
        return (
          (t = (function (e) {
            var t = (function (e, t) {
              if ("object" != typeof e || !e) return e;
              var n = e[Symbol.toPrimitive];
              if (void 0 !== n) {
                var r = n.call(e, t || "default");
                if ("object" != typeof r) return r;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return ("string" === t ? String : Number)(e);
            })(e, "string");
            return "symbol" == typeof t ? t : t + "";
          })(t)) in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
      const p = { start: "touchstart", move: "touchmove", stop: "touchend" },
        h = { start: "mousedown", move: "mousemove", stop: "mouseup" };
      let f = h;
      class m extends r.Component {
        constructor() {
          (super(...arguments),
            d(this, "dragging", !1),
            d(this, "lastX", NaN),
            d(this, "lastY", NaN),
            d(this, "touchIdentifier", null),
            d(this, "mounted", !1),
            d(this, "handleDragStart", (e) => {
              if (
                (this.props.onMouseDown(e),
                !this.props.allowAnyClick && "number" == typeof e.button && 0 !== e.button)
              )
                return !1;
              const t = this.findDOMNode();
              if (!t || !t.ownerDocument || !t.ownerDocument.body)
                throw new Error("<DraggableCore> not mounted on DragStart!");
              const { ownerDocument: n } = t;
              if (
                this.props.disabled ||
                !(e.target instanceof n.defaultView.Node) ||
                (this.props.handle &&
                  !(0, o.matchesSelectorAndParentsTo)(e.target, this.props.handle, t)) ||
                (this.props.cancel &&
                  (0, o.matchesSelectorAndParentsTo)(e.target, this.props.cancel, t))
              )
                return;
              "touchstart" !== e.type || this.props.allowMobileScroll || e.preventDefault();
              const r = (0, o.getTouchIdentifier)(e);
              this.touchIdentifier = r;
              const a = (0, s.getControlPosition)(e, r, this);
              if (null == a) return;
              const { x: i, y: l } = a,
                c = (0, s.createCoreData)(this, i, l);
              ((0, u.default)("DraggableCore: handleDragStart: %j", c),
                (0, u.default)("calling", this.props.onStart));
              !1 !== this.props.onStart(e, c) &&
                !1 !== this.mounted &&
                (this.props.enableUserSelectHack && (0, o.addUserSelectStyles)(n),
                (this.dragging = !0),
                (this.lastX = i),
                (this.lastY = l),
                (0, o.addEvent)(n, f.move, this.handleDrag),
                (0, o.addEvent)(n, f.stop, this.handleDragStop));
            }),
            d(this, "handleDrag", (e) => {
              const t = (0, s.getControlPosition)(e, this.touchIdentifier, this);
              if (null == t) return;
              let { x: n, y: r } = t;
              if (Array.isArray(this.props.grid)) {
                let e = n - this.lastX,
                  t = r - this.lastY;
                if ((([e, t] = (0, s.snapToGrid)(this.props.grid, e, t)), !e && !t)) return;
                ((n = this.lastX + e), (r = this.lastY + t));
              }
              const a = (0, s.createCoreData)(this, n, r);
              (0, u.default)("DraggableCore: handleDrag: %j", a);
              if (!1 !== this.props.onDrag(e, a) && !1 !== this.mounted)
                ((this.lastX = n), (this.lastY = r));
              else
                try {
                  this.handleDragStop(new MouseEvent("mouseup"));
                } catch (e) {
                  const t = document.createEvent("MouseEvents");
                  (t.initMouseEvent(
                    "mouseup",
                    !0,
                    !0,
                    window,
                    0,
                    0,
                    0,
                    0,
                    0,
                    !1,
                    !1,
                    !1,
                    !1,
                    0,
                    null,
                  ),
                    this.handleDragStop(t));
                }
            }),
            d(this, "handleDragStop", (e) => {
              if (!this.dragging) return;
              const t = (0, s.getControlPosition)(e, this.touchIdentifier, this);
              if (null == t) return;
              let { x: n, y: r } = t;
              if (Array.isArray(this.props.grid)) {
                let e = n - this.lastX || 0,
                  t = r - this.lastY || 0;
                (([e, t] = (0, s.snapToGrid)(this.props.grid, e, t)),
                  (n = this.lastX + e),
                  (r = this.lastY + t));
              }
              const a = (0, s.createCoreData)(this, n, r);
              if (!1 === this.props.onStop(e, a) || !1 === this.mounted) return !1;
              const i = this.findDOMNode();
              (i &&
                this.props.enableUserSelectHack &&
                (0, o.scheduleRemoveUserSelectStyles)(i.ownerDocument),
                (0, u.default)("DraggableCore: handleDragStop: %j", a),
                (this.dragging = !1),
                (this.lastX = NaN),
                (this.lastY = NaN),
                i &&
                  ((0, u.default)("DraggableCore: Removing handlers"),
                  (0, o.removeEvent)(i.ownerDocument, f.move, this.handleDrag),
                  (0, o.removeEvent)(i.ownerDocument, f.stop, this.handleDragStop)));
            }),
            d(this, "onMouseDown", (e) => ((f = h), this.handleDragStart(e))),
            d(this, "onMouseUp", (e) => ((f = h), this.handleDragStop(e))),
            d(this, "onTouchStart", (e) => ((f = p), this.handleDragStart(e))),
            d(this, "onTouchEnd", (e) => ((f = p), this.handleDragStop(e))));
        }
        componentDidMount() {
          this.mounted = !0;
          const e = this.findDOMNode();
          e && (0, o.addEvent)(e, p.start, this.onTouchStart, { passive: !1 });
        }
        componentWillUnmount() {
          this.mounted = !1;
          const e = this.findDOMNode();
          if (e) {
            const { ownerDocument: t } = e;
            ((0, o.removeEvent)(t, h.move, this.handleDrag),
              (0, o.removeEvent)(t, p.move, this.handleDrag),
              (0, o.removeEvent)(t, h.stop, this.handleDragStop),
              (0, o.removeEvent)(t, p.stop, this.handleDragStop),
              (0, o.removeEvent)(e, p.start, this.onTouchStart, { passive: !1 }),
              this.props.enableUserSelectHack && (0, o.scheduleRemoveUserSelectStyles)(t));
          }
        }
        findDOMNode() {
          return this.props?.nodeRef ? this.props?.nodeRef?.current : i.default.findDOMNode(this);
        }
        render() {
          return r.cloneElement(r.Children.only(this.props.children), {
            onMouseDown: this.onMouseDown,
            onMouseUp: this.onMouseUp,
            onTouchEnd: this.onTouchEnd,
          });
        }
      }
      ((t.default = m),
        d(m, "displayName", "DraggableCore"),
        d(m, "propTypes", {
          allowAnyClick: a.default.bool,
          allowMobileScroll: a.default.bool,
          children: a.default.node.isRequired,
          disabled: a.default.bool,
          enableUserSelectHack: a.default.bool,
          offsetParent: function (e, t) {
            if (e[t] && 1 !== e[t].nodeType)
              throw new Error("Draggable's offsetParent must be a DOM Node.");
          },
          grid: a.default.arrayOf(a.default.number),
          handle: a.default.string,
          cancel: a.default.string,
          nodeRef: a.default.object,
          onStart: a.default.func,
          onDrag: a.default.func,
          onStop: a.default.func,
          onMouseDown: a.default.func,
          scale: a.default.number,
          className: l.dontSetMe,
          style: l.dontSetMe,
          transform: l.dontSetMe,
        }),
        d(m, "defaultProps", {
          allowAnyClick: !1,
          allowMobileScroll: !1,
          disabled: !1,
          enableUserSelectHack: !0,
          onStart: function () {},
          onDrag: function () {},
          onStop: function () {},
          onMouseDown: function () {},
          scale: 1,
        }));
    },
    1625: (e, t, n) => {
      "use strict";
      n.d(t, { $N: () => a, $m: () => s, ob: () => o, vp: () => l, xB: () => i, yL: () => r });
      var r = ((e) => ((e.Always = "always"), (e.Auto = "auto"), (e.Never = "never"), e))(r || {});
      var a = ((e) => ((e.Multi = "multi"), (e.None = "none"), (e.Single = "single"), e))(a || {}),
        i = ((e) => ((e.Ascending = "asc"), (e.Descending = "desc"), (e.None = "none"), e))(
          i || {},
        );
      var o = ((e) => (
          (e.Actions = "actions"),
          (e.Auto = "auto"),
          (e.BasicGauge = "basic"),
          (e.ColorBackground = "color-background"),
          (e.ColorBackgroundSolid = "color-background-solid"),
          (e.ColorText = "color-text"),
          (e.Custom = "custom"),
          (e.DataLinks = "data-links"),
          (e.Gauge = "gauge"),
          (e.Geo = "geo"),
          (e.GradientGauge = "gradient-gauge"),
          (e.Image = "image"),
          (e.JSONView = "json-view"),
          (e.LcdGauge = "lcd-gauge"),
          (e.Markdown = "markdown"),
          (e.Pill = "pill"),
          (e.Sparkline = "sparkline"),
          e
        ))(o || {}),
        s = ((e) => (
          (e.CSV = "csv"),
          (e.CustomQueryParam = "customqueryparam"),
          (e.Date = "date"),
          (e.Distributed = "distributed"),
          (e.DoubleQuote = "doublequote"),
          (e.Glob = "glob"),
          (e.HTML = "html"),
          (e.JSON = "json"),
          (e.Join = "join"),
          (e.Lucene = "lucene"),
          (e.PercentEncode = "percentencode"),
          (e.Pipe = "pipe"),
          (e.QueryParam = "queryparam"),
          (e.Raw = "raw"),
          (e.Regex = "regex"),
          (e.SQLString = "sqlstring"),
          (e.SingleQuote = "singlequote"),
          (e.Text = "text"),
          (e.UriEncode = "uriencode"),
          e
        ))(s || {});
      const l = "browser";
    },
    1794: (e, t, n) => {
      "use strict";
      ((t.__esModule = !0), (t.default = void 0));
      var r = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e)) return { default: e };
          var n = l(t);
          if (n && n.has(e)) return n.get(e);
          var r = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var i in e)
            if ("default" !== i && Object.prototype.hasOwnProperty.call(e, i)) {
              var o = a ? Object.getOwnPropertyDescriptor(e, i) : null;
              o && (o.get || o.set) ? Object.defineProperty(r, i, o) : (r[i] = e[i]);
            }
          ((r.default = e), n && n.set(e, r));
          return r;
        })(n(5959)),
        a = n(8230),
        i = n(9954),
        o = n(6333),
        s = [
          "children",
          "className",
          "draggableOpts",
          "width",
          "height",
          "handle",
          "handleSize",
          "lockAspectRatio",
          "axis",
          "minConstraints",
          "maxConstraints",
          "onResize",
          "onResizeStop",
          "onResizeStart",
          "resizeHandles",
          "transformScale",
        ];
      function l(e) {
        if ("function" != typeof WeakMap) return null;
        var t = new WeakMap(),
          n = new WeakMap();
        return (l = function (e) {
          return e ? n : t;
        })(e);
      }
      function u() {
        return (
          (u = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
              }),
          u.apply(this, arguments)
        );
      }
      function c(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          (t &&
            (r = r.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, r));
        }
        return n;
      }
      function d(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? c(Object(n), !0).forEach(function (t) {
                p(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : c(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function p(e, t, n) {
        return (
          (t = (function (e) {
            var t = (function (e, t) {
              if ("object" != typeof e || null === e) return e;
              var n = e[Symbol.toPrimitive];
              if (void 0 !== n) {
                var r = n.call(e, t || "default");
                if ("object" != typeof r) return r;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return ("string" === t ? String : Number)(e);
            })(e, "string");
            return "symbol" == typeof t ? t : String(t);
          })(t)) in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
      function h(e, t) {
        return (
          (h = Object.setPrototypeOf
            ? Object.setPrototypeOf.bind()
            : function (e, t) {
                return ((e.__proto__ = t), e);
              }),
          h(e, t)
        );
      }
      var f = (function (e) {
        var t, n;
        function o() {
          for (var t, n = arguments.length, r = new Array(n), a = 0; a < n; a++)
            r[a] = arguments[a];
          return (
            ((t = e.call.apply(e, [this].concat(r)) || this).handleRefs = {}),
            (t.lastHandleRect = null),
            (t.slack = null),
            t
          );
        }
        ((n = e),
          ((t = o).prototype = Object.create(n.prototype)),
          (t.prototype.constructor = t),
          h(t, n));
        var l = o.prototype;
        return (
          (l.componentWillUnmount = function () {
            this.resetData();
          }),
          (l.resetData = function () {
            this.lastHandleRect = this.slack = null;
          }),
          (l.runConstraints = function (e, t) {
            var n = this.props,
              r = n.minConstraints,
              a = n.maxConstraints,
              i = n.lockAspectRatio;
            if (!r && !a && !i) return [e, t];
            if (i) {
              var o = this.props.width / this.props.height,
                s = e - this.props.width,
                l = t - this.props.height;
              Math.abs(s) > Math.abs(l * o) ? (t = e / o) : (e = t * o);
            }
            var u = e,
              c = t,
              d = this.slack || [0, 0],
              p = d[0],
              h = d[1];
            return (
              (e += p),
              (t += h),
              r && ((e = Math.max(r[0], e)), (t = Math.max(r[1], t))),
              a && ((e = Math.min(a[0], e)), (t = Math.min(a[1], t))),
              (this.slack = [p + (u - e), h + (c - t)]),
              [e, t]
            );
          }),
          (l.resizeHandler = function (e, t) {
            var n = this;
            return function (r, a) {
              var i = a.node,
                o = a.deltaX,
                s = a.deltaY;
              "onResizeStart" === e && n.resetData();
              var l = ("both" === n.props.axis || "x" === n.props.axis) && "n" !== t && "s" !== t,
                u = ("both" === n.props.axis || "y" === n.props.axis) && "e" !== t && "w" !== t;
              if (l || u) {
                var c = t[0],
                  d = t[t.length - 1],
                  p = i.getBoundingClientRect();
                if (null != n.lastHandleRect) {
                  if ("w" === d) o += p.left - n.lastHandleRect.left;
                  if ("n" === c) s += p.top - n.lastHandleRect.top;
                }
                ((n.lastHandleRect = p), "w" === d && (o = -o), "n" === c && (s = -s));
                var h = n.props.width + (l ? o / n.props.transformScale : 0),
                  f = n.props.height + (u ? s / n.props.transformScale : 0),
                  m = n.runConstraints(h, f);
                ((h = m[0]), (f = m[1]));
                var g = h !== n.props.width || f !== n.props.height,
                  v = "function" == typeof n.props[e] ? n.props[e] : null;
                (v &&
                  !("onResize" === e && !g) &&
                  (null == r.persist || r.persist(),
                  v(r, { node: i, size: { width: h, height: f }, handle: t })),
                  "onResizeStop" === e && n.resetData());
              }
            };
          }),
          (l.renderResizeHandle = function (e, t) {
            var n = this.props.handle;
            if (!n)
              return r.createElement("span", {
                className: "react-resizable-handle react-resizable-handle-" + e,
                ref: t,
              });
            if ("function" == typeof n) return n(e, t);
            var a = d({ ref: t }, "string" == typeof n.type ? {} : { handleAxis: e });
            return r.cloneElement(n, a);
          }),
          (l.render = function () {
            var e = this,
              t = this.props,
              n = t.children,
              o = t.className,
              l = t.draggableOpts,
              c =
                (t.width,
                t.height,
                t.handle,
                t.handleSize,
                t.lockAspectRatio,
                t.axis,
                t.minConstraints,
                t.maxConstraints,
                t.onResize,
                t.onResizeStop,
                t.onResizeStart,
                t.resizeHandles),
              p =
                (t.transformScale,
                (function (e, t) {
                  if (null == e) return {};
                  var n,
                    r,
                    a = {},
                    i = Object.keys(e);
                  for (r = 0; r < i.length; r++) ((n = i[r]), t.indexOf(n) >= 0 || (a[n] = e[n]));
                  return a;
                })(t, s));
            return (0, i.cloneElement)(
              n,
              d(
                d({}, p),
                {},
                {
                  className: (o ? o + " " : "") + "react-resizable",
                  children: [].concat(
                    n.props.children,
                    c.map(function (t) {
                      var n,
                        i = null != (n = e.handleRefs[t]) ? n : (e.handleRefs[t] = r.createRef());
                      return r.createElement(
                        a.DraggableCore,
                        u({}, l, {
                          nodeRef: i,
                          key: "resizableHandle-" + t,
                          onStop: e.resizeHandler("onResizeStop", t),
                          onStart: e.resizeHandler("onResizeStart", t),
                          onDrag: e.resizeHandler("onResize", t),
                        }),
                        e.renderResizeHandle(t, i),
                      );
                    }),
                  ),
                },
              ),
            );
          }),
          o
        );
      })(r.Component);
      ((t.default = f),
        (f.propTypes = o.resizableProps),
        (f.defaultProps = {
          axis: "both",
          handleSize: [20, 20],
          lockAspectRatio: !1,
          minConstraints: [20, 20],
          maxConstraints: [1 / 0, 1 / 0],
          resizeHandles: ["se"],
          transformScale: 1,
        }));
    },
    2245: (e, t, n) => {
      "use strict";
      n.d(t, { zL: () => a });
      var r = n(6145),
        a = ((e) => (
          (e[(e.dontHide = 0)] = "dontHide"),
          (e[(e.hideLabel = 1)] = "hideLabel"),
          (e[(e.hideVariable = 2)] = "hideVariable"),
          (e[(e.inControlsMenu = 3)] = "inControlsMenu"),
          e
        ))(a || {});
      r.rw;
    },
    2548: (e, t, n) => {
      ((e.exports = n(9482).default),
        (e.exports.utils = n(414)),
        (e.exports.Responsive = n(4636).default),
        (e.exports.Responsive.utils = n(544)),
        (e.exports.WidthProvider = n(6805).default));
    },
    2688: (e, t, n) => {
      e.exports = n(362)();
    },
    2837: (e, t, n) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.addClassName = u),
        (t.addEvent = function (e, t, n, r) {
          if (!e) return;
          const a = { capture: !0, ...r };
          e.addEventListener
            ? e.addEventListener(t, n, a)
            : e.attachEvent
              ? e.attachEvent("on" + t, n)
              : (e["on" + t] = n);
        }),
        (t.addUserSelectStyles = function (e) {
          if (!e) return;
          let t = e.getElementById("react-draggable-style-el");
          t ||
            ((t = e.createElement("style")),
            (t.type = "text/css"),
            (t.id = "react-draggable-style-el"),
            (t.innerHTML =
              ".react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n"),
            (t.innerHTML +=
              ".react-draggable-transparent-selection *::selection {all: inherit;}\n"),
            e.getElementsByTagName("head")[0].appendChild(t));
          e.body && u(e.body, "react-draggable-transparent-selection");
        }),
        (t.createCSSTransform = function (e, t) {
          const n = s(e, t, "px");
          return { [(0, a.browserPrefixToKey)("transform", a.default)]: n };
        }),
        (t.createSVGTransform = function (e, t) {
          return s(e, t, "");
        }),
        (t.getTouch = function (e, t) {
          return (
            (e.targetTouches && (0, r.findInArray)(e.targetTouches, (e) => t === e.identifier)) ||
            (e.changedTouches && (0, r.findInArray)(e.changedTouches, (e) => t === e.identifier))
          );
        }),
        (t.getTouchIdentifier = function (e) {
          if (e.targetTouches && e.targetTouches[0]) return e.targetTouches[0].identifier;
          if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
        }),
        (t.getTranslation = s),
        (t.innerHeight = function (e) {
          let t = e.clientHeight;
          const n = e.ownerDocument.defaultView.getComputedStyle(e);
          return ((t -= (0, r.int)(n.paddingTop)), (t -= (0, r.int)(n.paddingBottom)), t);
        }),
        (t.innerWidth = function (e) {
          let t = e.clientWidth;
          const n = e.ownerDocument.defaultView.getComputedStyle(e);
          return ((t -= (0, r.int)(n.paddingLeft)), (t -= (0, r.int)(n.paddingRight)), t);
        }),
        (t.matchesSelector = o),
        (t.matchesSelectorAndParentsTo = function (e, t, n) {
          let r = e;
          do {
            if (o(r, t)) return !0;
            if (r === n) return !1;
            r = r.parentNode;
          } while (r);
          return !1;
        }),
        (t.offsetXYFromParent = function (e, t, n) {
          const r = t === t.ownerDocument.body ? { left: 0, top: 0 } : t.getBoundingClientRect(),
            a = (e.clientX + t.scrollLeft - r.left) / n,
            i = (e.clientY + t.scrollTop - r.top) / n;
          return { x: a, y: i };
        }),
        (t.outerHeight = function (e) {
          let t = e.clientHeight;
          const n = e.ownerDocument.defaultView.getComputedStyle(e);
          return ((t += (0, r.int)(n.borderTopWidth)), (t += (0, r.int)(n.borderBottomWidth)), t);
        }),
        (t.outerWidth = function (e) {
          let t = e.clientWidth;
          const n = e.ownerDocument.defaultView.getComputedStyle(e);
          return ((t += (0, r.int)(n.borderLeftWidth)), (t += (0, r.int)(n.borderRightWidth)), t);
        }),
        (t.removeClassName = c),
        (t.removeEvent = function (e, t, n, r) {
          if (!e) return;
          const a = { capture: !0, ...r };
          e.removeEventListener
            ? e.removeEventListener(t, n, a)
            : e.detachEvent
              ? e.detachEvent("on" + t, n)
              : (e["on" + t] = null);
        }),
        (t.scheduleRemoveUserSelectStyles = function (e) {
          window.requestAnimationFrame
            ? window.requestAnimationFrame(() => {
                l(e);
              })
            : l(e);
        }));
      var r = n(6732),
        a = (function (e, t) {
          if ("function" == typeof WeakMap)
            var n = new WeakMap(),
              r = new WeakMap();
          return (function (e, t) {
            if (!t && e && e.__esModule) return e;
            var a,
              i,
              o = { __proto__: null, default: e };
            if (null === e || ("object" != typeof e && "function" != typeof e)) return o;
            if ((a = t ? r : n)) {
              if (a.has(e)) return a.get(e);
              a.set(e, o);
            }
            for (const t in e)
              "default" !== t &&
                {}.hasOwnProperty.call(e, t) &&
                ((i = (a = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) &&
                (i.get || i.set)
                  ? a(o, t, i)
                  : (o[t] = e[t]));
            return o;
          })(e, t);
        })(n(7350));
      let i = "";
      function o(e, t) {
        return (
          i ||
            (i = (0, r.findInArray)(
              [
                "matches",
                "webkitMatchesSelector",
                "mozMatchesSelector",
                "msMatchesSelector",
                "oMatchesSelector",
              ],
              function (t) {
                return (0, r.isFunction)(e[t]);
              },
            )),
          !!(0, r.isFunction)(e[i]) && e[i](t)
        );
      }
      function s(e, t, n) {
        let { x: r, y: a } = e,
          i = `translate(${r}${n},${a}${n})`;
        if (t) {
          i =
            `translate(${`${"string" == typeof t.x ? t.x : t.x + n}`}, ${`${"string" == typeof t.y ? t.y : t.y + n}`})` +
            i;
        }
        return i;
      }
      function l(e) {
        if (e)
          try {
            if ((e.body && c(e.body, "react-draggable-transparent-selection"), e.selection))
              e.selection.empty();
            else {
              const t = (e.defaultView || window).getSelection();
              t && "Caret" !== t.type && t.removeAllRanges();
            }
          } catch (e) {}
      }
      function u(e, t) {
        e.classList
          ? e.classList.add(t)
          : e.className.match(new RegExp(`(?:^|\\s)${t}(?!\\S)`)) || (e.className += ` ${t}`);
      }
      function c(e, t) {
        e.classList
          ? e.classList.remove(t)
          : (e.className = e.className.replace(new RegExp(`(?:^|\\s)${t}(?!\\S)`, "g"), ""));
      }
    },
    3014: (e, t, n) => {
      "use strict";
      (n.r(t),
        n.d(t, {
          AdHocFiltersComboboxRenderer: () => Us,
          AdHocFiltersVariable: () => el,
          AdHocFiltersVariableController: () => Xs,
          ConstantVariable: () => Dl,
          ControlsLabel: () => br,
          CustomVariable: () => rd,
          DataProviderProxy: () => Hc,
          DataSourceVariable: () => od,
          EmbeddedScene: () => Ed,
          FieldConfigBuilder: () => bh,
          FieldConfigBuilders: () => kh,
          FieldConfigOverridesBuilder: () => vh,
          GroupByVariable: () => En,
          IntervalVariable: () => md,
          LazyLoader: () => Bn,
          LocalValueVariable: () => au,
          MultiOrSingleValueSelect: () => hn,
          MultiValueVariable: () => Je,
          NestedScene: () => Zd,
          NewSceneObjectAddedEvent: () => _d,
          PATH_ID_SEPARATOR: () => iu,
          PanelBuilders: () => Sh,
          PanelOptionsBuilders: () => Rh,
          QueryVariable: () => Ql,
          RuntimeDataSource: () => L,
          SafeSerializableSceneObject: () => wn,
          SceneApp: () => Vp,
          SceneAppPage: () => Qp,
          SceneByFrameRepeater: () => yp,
          SceneByVariableRepeater: () => wp,
          SceneCSSGridItem: () => Rp,
          SceneCSSGridLayout: () => Op,
          SceneCanvasText: () => Jd,
          SceneControlsSpacer: () => Sp,
          SceneDataLayerBase: () => Bu,
          SceneDataLayerControls: () => Uc,
          SceneDataLayerSet: () => pr,
          SceneDataLayerSetBase: () => dr,
          SceneDataNode: () => ie,
          SceneDataTransformer: () => hr,
          SceneDebugger: () => Wp,
          SceneFlexItem: () => _p,
          SceneFlexLayout: () => xp,
          SceneGridItem: () => Vd,
          SceneGridLayout: () => Ud,
          SceneGridLayoutDragStartEvent: () => Wd,
          SceneGridRow: () => Kd,
          SceneObjectBase: () => P,
          SceneObjectRef: () => D,
          SceneObjectStateChangedEvent: () => O,
          SceneObjectUrlSyncConfig: () => se,
          SceneQueryRunner: () => dl,
          SceneReactObject: () => jp,
          SceneRefreshPicker: () => up,
          SceneTimePicker: () => rp,
          SceneTimeRange: () => ye,
          SceneTimeRangeCompare: () => gp,
          SceneTimeRangeTransformerBase: () => $c,
          SceneTimeZoneOverride: () => Wc,
          SceneToolbarButton: () => ep,
          SceneToolbarInput: () => tp,
          SceneVariableSet: () => ed,
          SceneVariableValueChangedEvent: () => Oe,
          ScopesVariable: () => Yl,
          SplitLayout: () => Ip,
          SwitchVariable: () => ad,
          TestVariable: () => pd,
          TextBoxVariable: () => fd,
          UrlSyncContextProvider: () => kd,
          UrlSyncManager: () => Cd,
          UserActionEvent: () => R,
          VariableDependencyConfig: () => Pl,
          VariableValueControl: () => Jc,
          VariableValueSelectWrapper: () => Kc,
          VariableValueSelectors: () => Qc,
          VizConfigBuilder: () => xh,
          VizConfigBuilders: () => _h,
          VizPanel: () => fr,
          VizPanelBuilder: () => wh,
          VizPanelExploreButton: () => Id,
          VizPanelMenu: () => Dd,
          behaviors: () => r,
          dataLayers: () => i,
          escapeUrlPipeDelimiters: () => Sl,
          formatRegistry: () => Ae,
          getExploreURL: () => Ad,
          isCustomVariableValue: () => Re,
          isDataLayer: () => ct,
          isDataRequestEnricher: () => lt,
          isFiltersRequestEnricher: () => ut,
          isSceneObject: () => st,
          loadResources: () => Oh,
          performanceUtils: () => a,
          registerQueryWithController: () => mt,
          registerRuntimeDataSource: () => j,
          sceneGraph: () => ru,
          sceneUtils: () => Eh,
          useSceneApp: () => Fp,
          useSceneObjectState: () => A,
          useUrlSync: () => Rd,
          writePerformanceLog: () => lu,
        }));
      var r = {};
      (n.r(r),
        n.d(r, {
          ActWhenVariableChanged: () => su,
          CursorSync: () => ar,
          LiveNowTimer: () => lr,
          SceneInteractionTracker: () => Rn,
          SceneQueryController: () => te,
        }));
      var a = {};
      (n.r(a), n.d(a, { SceneRenderProfiler: () => Fu, getScenePerformanceTracker: () => ft }));
      var i = {};
      (n.r(i), n.d(i, { AnnotationsDataLayer: () => Bc }));
      var o = n(1159),
        s = n(7781),
        l = n(8531);
      function u(e, t, n) {
        const r = { ...t };
        if (n) for (const e of Object.keys(r)) n.includes(e) || delete r[e];
        return s.urlUtil.renderUrl(s.locationUtil.assureBaseUrl(e), r);
      }
      function c(e) {
        const t = (0, o.useParams)(),
          n = (0, o.useLocation)();
        return {
          params: t,
          isExact: null !== (0, o.matchPath)({ path: e, caseSensitive: !1, end: !0 }, n.pathname),
          path: n.pathname,
          url: n.pathname,
        };
      }
      const d = new Map();
      var p = n(5959),
        h = n.t(p, 2),
        f = n.n(p),
        m = n(1269);
      const g = {
        randomUUID:
          "undefined" != typeof crypto && crypto.randomUUID && crypto.randomUUID.bind(crypto),
      };
      let v;
      const b = new Uint8Array(16);
      function y() {
        if (
          !v &&
          ((v =
            "undefined" != typeof crypto &&
            crypto.getRandomValues &&
            crypto.getRandomValues.bind(crypto)),
          !v)
        )
          throw new Error(
            "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported",
          );
        return v(b);
      }
      const w = [];
      for (let e = 0; e < 256; ++e) w.push((e + 256).toString(16).slice(1));
      function S(e, t = 0) {
        return (
          w[e[t + 0]] +
          w[e[t + 1]] +
          w[e[t + 2]] +
          w[e[t + 3]] +
          "-" +
          w[e[t + 4]] +
          w[e[t + 5]] +
          "-" +
          w[e[t + 6]] +
          w[e[t + 7]] +
          "-" +
          w[e[t + 8]] +
          w[e[t + 9]] +
          "-" +
          w[e[t + 10]] +
          w[e[t + 11]] +
          w[e[t + 12]] +
          w[e[t + 13]] +
          w[e[t + 14]] +
          w[e[t + 15]]
        );
      }
      const x = function (e, t, n) {
        if (g.randomUUID && !t && !e) return g.randomUUID();
        const r = (e = e || {}).random || (e.rng || y)();
        if (((r[6] = (15 & r[6]) | 64), (r[8] = (63 & r[8]) | 128), t)) {
          n = n || 0;
          for (let e = 0; e < 16; ++e) t[n + e] = r[e];
          return t;
        }
        return S(r);
      };
      const _ = f().memo(function ({ model: e, ...t }) {
        var n;
        const r = null != (n = e.constructor.Component) ? n : C,
          [a, i] = (0, p.useState)(0);
        return (
          (0, p.useEffect)(() => {
            const t = e.activate();
            return (i((e) => e + 1), t);
          }, [e]),
          e.isActive || e.renderBeforeActivation ? f().createElement(r, { ...t, model: e }) : null
        );
      });
      function C(e) {
        return null;
      }
      class O extends s.BusEventWithPayload {}
      O.type = "scene-object-state-change";
      class R extends s.BusEventWithPayload {}
      R.type = "scene-object-user-action";
      var k,
        E = (e) => {
          throw TypeError(e);
        },
        T = (e, t, n) => t.has(e) || E("Cannot " + n);
      class D {
        constructor(e) {
          var t, n, r;
          ((t = this),
            (n = k).has(t)
              ? E("Cannot add the same private member more than once")
              : n instanceof WeakSet
                ? n.add(t)
                : n.set(t, r),
            ((e, t, n) => {
              (T(e, t, "write to private field"), t.set(e, n));
            })(this, k, e));
        }
        resolve() {
          return (T((e = this), (t = k), "read from private field"), n ? n.call(e) : t.get(e));
          var e, t, n;
        }
      }
      k = new WeakMap();
      class P {
        constructor(e) {
          ((this._isActive = !1),
            (this._activationHandlers = []),
            (this._deactivationHandlers = new Map()),
            (this._subs = new m.Subscription()),
            (this._refCount = 0),
            (this._renderBeforeActivation = !1),
            e.key || (e.key = x()),
            (this._events = new s.EventBusSrv()),
            (this._state = Object.freeze(e)),
            this._setParent(this._state));
        }
        get state() {
          return this._state;
        }
        get isActive() {
          return this._isActive;
        }
        get renderBeforeActivation() {
          return this._renderBeforeActivation;
        }
        get parent() {
          return this._parent;
        }
        get variableDependency() {
          return this._variableDependency;
        }
        get urlSync() {
          return this._urlSync;
        }
        get Component() {
          return _;
        }
        _setParent(e) {
          I(e, (e) => {
            (e._parent &&
              e._parent !== this &&
              console.warn(
                "SceneObject already has a parent set that is different from the new parent. You cannot share the same SceneObject instance in multiple scenes or in multiple different places of the same scene graph. Use SceneObject.clone() to duplicate a SceneObject or store a state key reference and use sceneGraph.findObject to locate it.",
                e,
                this,
              ),
              (e._parent = this));
          });
        }
        clearParent() {
          this._parent = void 0;
        }
        subscribeToState(e) {
          return this._events.subscribe(O, (t) => {
            t.payload.changedObject === this && e(t.payload.newState, t.payload.prevState);
          });
        }
        subscribeToEvent(e, t) {
          return this._events.subscribe(e, t);
        }
        setState(e) {
          const t = this._state,
            n = { ...this._state, ...e };
          ((this._state = Object.freeze(n)),
            this._setParent(e),
            this._handleActivationOfChangedStateProps(t, n),
            this.publishEvent(
              new O({ prevState: t, newState: n, partialUpdate: e, changedObject: this }),
              !0,
            ));
        }
        _handleActivationOfChangedStateProps(e, t) {
          this.isActive &&
            (e.$behaviors !== t.$behaviors &&
              this._handleChangedBehaviors(e.$behaviors, t.$behaviors),
            e.$data !== t.$data && this._handleChangedStateActivation(e.$data, t.$data),
            e.$variables !== t.$variables &&
              this._handleChangedStateActivation(e.$variables, t.$variables),
            e.$timeRange !== t.$timeRange &&
              this._handleChangedStateActivation(e.$timeRange, t.$timeRange));
        }
        _handleChangedStateActivation(e, t) {
          if (e) {
            const t = this._deactivationHandlers.get(e);
            t && (t(), this._deactivationHandlers.delete(e));
          }
          t && this._deactivationHandlers.set(t, t.activate());
        }
        _handleChangedBehaviors(e, t) {
          if (e)
            for (const n of e)
              if (!t || !t.includes(n)) {
                const e = this._deactivationHandlers.get(n);
                e && (e(), this._deactivationHandlers.delete(n));
              }
          if (t) for (const n of t) (e && e.includes(n)) || this._activateBehavior(n);
        }
        publishEvent(e, t) {
          (this._events.publish(e), t && this.parent && this.parent.publishEvent(e, t));
        }
        getRoot() {
          return this._parent ? this._parent.getRoot() : this;
        }
        _internalActivate() {
          this._isActive = !0;
          const { $data: e, $variables: t, $timeRange: n, $behaviors: r } = this.state;
          if (
            (this._activationHandlers.forEach((e) => {
              const t = e();
              t && this._deactivationHandlers.set(t, t);
            }),
            n && !n.isActive && this._deactivationHandlers.set(n, n.activate()),
            t && !t.isActive && this._deactivationHandlers.set(t, t.activate()),
            e && !e.isActive && this._deactivationHandlers.set(e, e.activate()),
            r)
          )
            for (const e of r) this._activateBehavior(e);
        }
        _activateBehavior(e) {
          if (e instanceof P) this._deactivationHandlers.set(e, e.activate());
          else if ("function" == typeof e) {
            const t = e(this);
            t && this._deactivationHandlers.set(e, t);
          }
        }
        activate() {
          (this.isActive || this._internalActivate(), this._refCount++);
          let e = !1;
          return () => {
            if ((this._refCount--, e)) {
              throw new Error(
                "SceneObject cancelation handler returned by activate() called a second time",
              );
            }
            ((e = !0), 0 === this._refCount && this._internalDeactivate());
          };
        }
        _internalDeactivate() {
          this._isActive = !1;
          for (let e of this._deactivationHandlers.values()) e();
          (this._deactivationHandlers.clear(),
            this._events.removeAllListeners(),
            this._subs.unsubscribe(),
            (this._subs = new m.Subscription()));
        }
        useState() {
          return A(this);
        }
        forceRender() {
          this.setState({});
        }
        clone(e) {
          return (function (e, t) {
            const n = M(e.state, t);
            return new e.constructor(n);
          })(this, e);
        }
        addActivationHandler(e) {
          this._activationHandlers.push(e);
        }
        forEachChild(e) {
          I(this.state, e);
        }
        getRef() {
          return (this._ref || (this._ref = new D(this)), this._ref);
        }
        toJSON() {
          return {
            type: Object.getPrototypeOf(this).constructor.name,
            isActive: this.isActive,
            state: this.state,
          };
        }
      }
      function A(e, t) {
        var n;
        const [r, a] = (0, p.useState)(e.state),
          i = e.state,
          o = null != (n = null == t ? void 0 : t.shouldActivateOrKeepAlive) && n;
        return (
          (0, p.useEffect)(() => {
            let t;
            o && (t = e.activate());
            const n = e.subscribeToState((e) => {
              a(e);
            });
            return (
              e.state !== i && a(e.state),
              () => {
                (n.unsubscribe(), t && t());
              }
            );
          }, [e, o]),
          e.state
        );
      }
      function I(e, t) {
        for (const n of Object.values(e)) {
          if (n instanceof P) {
            if (!1 === t(n)) break;
          }
          if (Array.isArray(n)) {
            let e = !1;
            for (const r of n)
              if (r instanceof P) {
                if (!1 === t(r)) {
                  e = !0;
                  break;
                }
              }
            if (e) break;
          }
        }
      }
      var V = n(3241);
      function M(e, t) {
        const n = { ...e };
        Object.assign(n, t);
        for (const e in n) {
          if (t && void 0 !== t[e]) continue;
          const r = n[e];
          if (r instanceof D) console.warn("Cloning object with SceneObjectRef");
          else if (r instanceof P) n[e] = r.clone();
          else if (Array.isArray(r)) {
            const t = [];
            for (const e of r)
              e instanceof P
                ? t.push(e.clone())
                : "object" == typeof e
                  ? t.push((0, V.cloneDeep)(e))
                  : t.push(e);
            n[e] = t;
          } else n[e] = "object" == typeof r ? (0, V.cloneDeep)(r) : r;
        }
        return n;
      }
      class L extends s.DataSourceApi {
        constructor(e, t) {
          super({
            name: "RuntimeDataSource-" + e,
            uid: t,
            type: e,
            id: 1,
            readOnly: !0,
            jsonData: {},
            access: "direct",
            meta: {
              id: e,
              name: "RuntimeDataSource-" + e,
              type: s.PluginType.datasource,
              info: {
                author: { name: "" },
                description: "",
                links: [],
                logos: { large: "", small: "" },
                screenshots: [],
                updated: "",
                version: "",
              },
              module: "",
              baseUrl: "",
            },
          });
        }
        testDatasource() {
          return Promise.resolve({});
        }
      }
      const F = new Map();
      function j({ dataSource: e }) {
        if (F.has(e.uid))
          throw new Error(`A runtime data source with uid ${e.uid} has already been registered`);
        F.set(e.uid, e);
      }
      const N = ["from", "to", "timezone"];
      class B {
        constructor(e) {
          ((this.index = new Map()),
            (this.options = {
              namespace: (null == e ? void 0 : e.namespace) || "",
              excludeFromNamespace: (null == e ? void 0 : e.excludeFromNamespace) || N,
            }));
        }
        getOptions() {
          return this.options;
        }
        getNamespacedKey(e) {
          return this.options.namespace && !this.options.excludeFromNamespace.includes(e)
            ? `${this.options.namespace}-${e}`
            : e;
        }
        getUniqueKey(e, t) {
          const n = this.getNamespacedKey(e),
            r = this.index.get(n);
          if (!r) return (this.index.set(n, [t]), n);
          let a = r.findIndex((e) => e === t);
          return (
            -1 === a &&
              (!(function (e) {
                for (let t = 0; t < e.length; t++) {
                  z(e[t]) && (e.splice(t, 1), t--);
                }
              })(r, t.getRoot()),
              r.push(t),
              (a = r.length - 1)),
            a > 0 ? `${n}-${a + 1}` : n
          );
        }
        clear() {
          this.index.clear();
        }
      }
      function z(e, t) {
        if (!e.parent) return !1;
        let n = !1;
        return (
          e.parent.forEachChild((t) => {
            if (t === e) return ((n = !0), !1);
          }),
          !n || z(e.parent)
        );
      }
      function $(e, t) {
        const n = new B(t),
          r = {},
          a = (e) => {
            if (e.urlSync) {
              const t = e.urlSync.getUrlState();
              for (const [a, i] of Object.entries(t))
                if (null != i) {
                  const t = n.getUniqueKey(a, e);
                  r[t] = i;
                }
            }
            e.forEachChild(a);
          };
        return (a(e), r);
      }
      function W(e, t, n, r) {
        (r || H(e, t, n),
          e.forEachChild((e) => {
            H(e, t, n);
          }),
          e.forEachChild((e) => W(e, t, n, !0)));
      }
      function H(e, t, n) {
        if (e.urlSync) {
          const r = {},
            a = e.urlSync.getUrlState();
          for (const i of e.urlSync.getKeys()) {
            const o = n.getUniqueKey(i, e),
              s = t.getAll(o),
              l = a[i];
            U(s, l) ||
              (s.length > 0 ? (Array.isArray(l) ? (r[i] = s) : (r[i] = s[0])) : (r[i] = null));
          }
          Object.keys(r).length > 0 && e.urlSync.updateFromUrl(r);
        }
      }
      function U(e, t) {
        return (
          (0 === e.length && null == t) ||
          (Array.isArray(t) || 1 !== (null == e ? void 0 : e.length)
            ? (0 === (null == t ? void 0 : t.length) && null === e) || (0, V.isEqual)(e, t)
            : t === e[0])
        );
      }
      function q(e, t) {
        const n = t.state.$variables;
        if (!n) return t.parent ? q(e, t.parent) : null;
        const r = n.getByName(e);
        return r || (t.parent ? q(e, t.parent) : null);
      }
      function G(e, t, ...n) {
        let r = !1;
        "undefined" != typeof window &&
          (r = "true" === localStorage.getItem("grafana.debug.scenes"));
      }
      var Q,
        K,
        Y = (e) => {
          throw TypeError(e);
        },
        Z = (e, t, n) => t.has(e) || Y("Cannot " + n),
        X = (e, t, n) => (Z(e, t, "read from private field"), n ? n.call(e) : t.get(e)),
        J = (e, t, n) =>
          t.has(e)
            ? Y("Cannot add the same private member more than once")
            : t instanceof WeakSet
              ? t.add(e)
              : t.set(e, n);
      function ee(e) {
        return "isQueryController" in e;
      }
      class te extends P {
        constructor(e = {}, t) {
          (super({ ...e, isRunning: !1 }),
            (this.profiler = t),
            (this.isQueryController = !0),
            J(this, Q, new Set()),
            J(this, K, null),
            (this.runningQueriesCount = () => X(this, Q).size),
            t && ((this.profiler = t), t.setQueryController(this)),
            this.addActivationHandler(() => {
              var e;
              return (
                null == (e = this.profiler) || e.setQueryController(this),
                () => X(this, Q).clear()
              );
            }));
        }
        startProfile(e) {
          var t;
          this.state.enableProfiling && (null == (t = this.profiler) || t.startProfile(e));
        }
        cancelProfile() {
          var e;
          null == (e = this.profiler) || e.cancelProfile();
        }
        queryStarted(e) {
          (X(this, Q).add(e),
            this.changeRunningQueryCount(1, e),
            this.state.isRunning || this.setState({ isRunning: !0 }));
        }
        queryCompleted(e) {
          X(this, Q).has(e) &&
            (X(this, Q).delete(e),
            this.changeRunningQueryCount(-1),
            0 === X(this, Q).size && this.setState({ isRunning: !1 }));
        }
        changeRunningQueryCount(e, t) {
          var n, r, a, i, o, s, l;
          ((window.__grafanaRunningQueryCount =
            (null != (n = window.__grafanaRunningQueryCount) ? n : 0) + e),
            1 === e &&
              this.state.enableProfiling &&
              (t && (null == (r = this.profiler) || r.addCrumb(`${t.type}`)),
              (null == (a = this.profiler) ? void 0 : a.isTailRecording()) &&
                (G(), null == (i = this.profiler) || i.cancelTailRecording())),
            this.state.enableProfiling &&
              (X(this, K) && cancelAnimationFrame(X(this, K)),
              (o = this),
              (s = K),
              (l = requestAnimationFrame(() => {
                var e;
                null == (e = this.profiler) || e.tryCompletingProfile();
              })),
              Z(o, s, "write to private field"),
              s.set(o, l)));
        }
        cancelAll() {
          var e;
          for (const t of X(this, Q).values()) null == (e = t.cancel) || e.call(t);
        }
      }
      function ne(e) {
        let t = e;
        for (; t; ) {
          if (t.state.$behaviors) for (const e of t.state.$behaviors) if (ee(e)) return e;
          t = t.parent;
        }
      }
      ((Q = new WeakMap()), (K = new WeakMap()));
      var re = n(1625);
      re.ob.Auto;
      var ae = ((e) => (
        (e.NotStarted = "NotStarted"),
        (e.Loading = "Loading"),
        (e.Streaming = "Streaming"),
        (e.Done = "Done"),
        (e.Error = "Error"),
        e
      ))(ae || {});
      class ie extends P {
        constructor(e) {
          super({ data: oe, ...e });
        }
        getResultsStream() {
          const e = { origin: this, data: this.state.data };
          return (0, m.of)(e);
        }
      }
      const oe = { state: ae.Done, series: [], timeRange: (0, s.getDefaultTimeRange)() };
      class se {
        constructor(e, t) {
          ((this._sceneObject = e),
            (this._nextChangeShouldAddHistoryStep = !1),
            (this._keys = t.keys));
        }
        getKeys() {
          return "function" == typeof this._keys ? this._keys() : this._keys;
        }
        getUrlState() {
          return this._sceneObject.getUrlState();
        }
        updateFromUrl(e) {
          this._sceneObject.updateFromUrl(e);
        }
        shouldCreateHistoryStep(e) {
          return this._nextChangeShouldAddHistoryStep;
        }
        performBrowserHistoryAction(e) {
          ((this._nextChangeShouldAddHistoryStep = !0),
            e(),
            (this._nextChangeShouldAddHistoryStep = !1));
        }
      }
      function le(e, t) {
        let n,
          r = e;
        for (; r && !n; ) ((n = t(r)), (r = r.parent));
        return n;
      }
      const ue = /^\d+[yYmMsSwWhHdD]$/;
      function ce(e) {
        if ("string" != typeof e) return null;
        if (-1 !== e.indexOf("now")) return e;
        if (ue.test(e)) return e;
        if (8 === e.length) {
          const t = (0, s.toUtc)(e, "YYYYMMDD");
          if (t.isValid()) return t.toISOString();
        } else if (15 === e.length) {
          const t = (0, s.toUtc)(e, "YYYYMMDDTHHmmss");
          if (t.isValid()) return t.toISOString();
        } else if (19 === e.length) {
          const t = (0, s.toUtc)(e, "YYYY-MM-DD HH:mm:ss");
          if (t.isValid()) return t.toISOString();
        } else if (24 === e.length) {
          return (0, s.toUtc)(e).toISOString();
        }
        const t = parseInt(e, 10);
        return isNaN(t) ? null : (0, s.toUtc)(t).toISOString();
      }
      function de(e, t, n, r, a, i) {
        const o = a && "now" === t,
          l = Date.now();
        i &&
          (function (e) {
            e !== pe && ((pe = e), (0, s.setWeekStart)(e));
          })(i);
        const u = (e, t) =>
          s.dateMath.toDateTime
            ? s.dateMath.toDateTime(e, t)
            : s.dateMath.parse(e, t.roundUp, t.timezone, t.fiscalYearStartMonth);
        return {
          to: u(o ? "now-" + a : t, { roundUp: !0, timezone: n, fiscalYearStartMonth: r, now: l }),
          from: u(e, { roundUp: !1, timezone: n, fiscalYearStartMonth: r, now: l }),
          raw: { from: e, to: t },
        };
      }
      let pe;
      function he(e, t, n) {
        if ((0, s.isDateTime)(e)) return e.isValid();
        if (s.dateMath.isMathString(e)) return s.dateMath.isValid(e);
        return (0, s.dateTimeParse)(e, { roundUp: t, timeZone: n }).isValid();
      }
      const fe = "refresh",
        me = "filter_removed",
        ge = "filter_changed",
        ve = "variable_value_changed",
        be = "groupby_dimensions";
      class ye extends P {
        constructor(e = {}) {
          var t;
          const n = e.from && he(e.from) ? e.from : "now-6h",
            r = e.to && he(e.to) ? e.to : "now",
            a = we(e.timeZone);
          (super({
            from: n,
            to: r,
            timeZone: a,
            value: de(
              n,
              r,
              a || (0, s.getTimeZone)(),
              e.fiscalYearStartMonth,
              e.UNSAFE_nowDelay,
              e.weekStart,
            ),
            refreshOnActivate: null != (t = e.refreshOnActivate) ? t : { percent: 10 },
            ...e,
          }),
            (this._urlSync = new se(this, {
              keys: ["from", "to", "timezone", "time", "time.window"],
            })),
            (this.onTimeRangeChange = (e) => {
              const t = {};
              if (
                ("string" == typeof e.raw.from
                  ? (t.from = e.raw.from)
                  : (t.from = e.raw.from.toISOString()),
                "string" == typeof e.raw.to ? (t.to = e.raw.to) : (t.to = e.raw.to.toISOString()),
                (t.value = de(
                  t.from,
                  t.to,
                  this.getTimeZone(),
                  this.state.fiscalYearStartMonth,
                  this.state.UNSAFE_nowDelay,
                  this.state.weekStart,
                )),
                t.from !== this.state.from || t.to !== this.state.to)
              ) {
                const e = ne(this);
                (null == e || e.startProfile("time_range_change"),
                  this._urlSync.performBrowserHistoryAction(() => {
                    this.setState(t);
                  }));
              }
            }),
            (this.onTimeZoneChange = (e) => {
              this._urlSync.performBrowserHistoryAction(() => {
                var t;
                const n = null != (t = we(e)) ? t : re.vp,
                  r = de(
                    this.state.from,
                    this.state.to,
                    n,
                    this.state.fiscalYearStartMonth,
                    this.state.UNSAFE_nowDelay,
                    this.state.weekStart,
                  );
                this.setState({ timeZone: n, value: r });
              });
            }),
            (this.onRefresh = () => {
              (this.refreshRange(0), this.publishEvent(new l.RefreshEvent(), !0));
            }),
            this.addActivationHandler(this._onActivate.bind(this)));
        }
        _onActivate() {
          if (!this.state.timeZone) {
            const e = this.getTimeZoneSource();
            e !== this &&
              this._subs.add(
                e.subscribeToState((e, t) => {
                  void 0 !== e.timeZone && e.timeZone !== t.timeZone && this.refreshRange(0);
                }),
              );
          }
          return (
            s.rangeUtil.isRelativeTimeRange(this.state.value.raw) && this.refreshIfStale(),
            () => {
              this.state.weekStart && (0, s.setWeekStart)(l.config.bootData.user.weekStart);
            }
          );
        }
        refreshIfStale() {
          var e, t, n, r;
          let a;
          (void 0 !==
            (null == (t = null == (e = this.state) ? void 0 : e.refreshOnActivate)
              ? void 0
              : t.percent) &&
            (a = this.calculatePercentOfInterval(this.state.refreshOnActivate.percent)),
            void 0 !==
              (null == (r = null == (n = this.state) ? void 0 : n.refreshOnActivate)
                ? void 0
                : r.afterMs) &&
              (a = Math.min(this.state.refreshOnActivate.afterMs, null != a ? a : 1 / 0)),
            void 0 !== a && this.refreshRange(a));
        }
        getTimeZoneSource() {
          if (!this.parent || !this.parent.parent) return this;
          const e = le(this.parent.parent, (e) => {
            if (e.state.$timeRange && e.state.$timeRange.state.timeZone) return e.state.$timeRange;
          });
          return e || this;
        }
        refreshRange(e) {
          var t;
          const n = de(
            this.state.from,
            this.state.to,
            null != (t = this.state.timeZone) ? t : (0, s.getTimeZone)(),
            this.state.fiscalYearStartMonth,
            this.state.UNSAFE_nowDelay,
            this.state.weekStart,
          );
          n.to.diff(this.state.value.to, "milliseconds") >= e && this.setState({ value: n });
        }
        calculatePercentOfInterval(e) {
          const t = this.state.value.to.diff(this.state.value.from, "milliseconds");
          return Math.ceil((t / 100) * e);
        }
        getTimeZone() {
          if (this.state.timeZone && we(this.state.timeZone)) return this.state.timeZone;
          const e = this.getTimeZoneSource();
          return e !== this && we(e.state.timeZone) ? e.state.timeZone : (0, s.getTimeZone)();
        }
        getUrlState() {
          const e = l.locationService.getSearchObject(),
            t = { from: this.state.from, to: this.state.to, timezone: this.getTimeZone() };
          return (e.time && e["time.window"] && ((t.time = null), (t["time.window"] = null)), t);
        }
        updateFromUrl(e) {
          var t, n, r;
          const a = {};
          let i = ce(e.from),
            o = ce(e.to);
          if (e.time && e["time.window"]) {
            const t = (function (e, t) {
              const n = isNaN(Date.parse(e)) ? parseInt(e, 10) : Date.parse(e);
              let r;
              r =
                t.match(/^\d+$/) && parseInt(t, 10) ? parseInt(t, 10) : s.rangeUtil.intervalToMs(t);
              return {
                from: (0, s.toUtc)(n - r / 2).toISOString(),
                to: (0, s.toUtc)(n + r / 2).toISOString(),
              };
            })(
              Array.isArray(e.time) ? e.time[0] : e.time,
              Array.isArray(e["time.window"]) ? e["time.window"][0] : e["time.window"],
            );
            (t.from && he(t.from) && (i = t.from), t.to && he(t.to) && (o = t.to));
          }
          if (
            (i && he(i) && (a.from = i),
            o && he(o) && (a.to = o),
            "string" == typeof e.timezone && (a.timeZone = "" !== e.timezone ? e.timezone : void 0),
            0 !== Object.keys(a).length)
          )
            return (
              (a.value = de(
                null != (t = a.from) ? t : this.state.from,
                null != (n = a.to) ? n : this.state.to,
                null != (r = a.timeZone) ? r : this.getTimeZone(),
                this.state.fiscalYearStartMonth,
                this.state.UNSAFE_nowDelay,
                this.state.weekStart,
              )),
              this.setState(a)
            );
        }
      }
      function we(e) {
        if (void 0 !== e)
          return (0, V.isEmpty)(e)
            ? l.config.bootData.user.timezone
            : e === re.vp || (0, s.getZone)(e)
              ? e
              : void G();
      }
      const Se = new ie(),
        xe = new ye();
      const _e = new (class extends P {
        constructor() {
          super({ variables: [] });
        }
        getByName(e) {}
        isVariableLoadingOrWaitingToUpdate(e) {
          return !1;
        }
      })();
      function Ce(e) {
        var t;
        return null != (t = le(e, (e) => e.state.$timeRange)) ? t : xe;
      }
      class Oe extends s.BusEventWithPayload {}
      function Re(e) {
        return "object" == typeof e && "formatter" in e;
      }
      Oe.type = "scene-variable-changed-value";
      let ke,
        Ee = {};
      function Te(e) {
        const t = Ee[e];
        return t || (Ee[e] = (0, V.property)(e));
      }
      class De {
        constructor(e, t) {
          this.state = { name: e, value: t, type: "scopedvar" };
        }
        getValue(e) {
          let { value: t } = this.state,
            n = t.value;
          return (
            (n = e ? Te(e)(t.value) : t.value),
            "string" === n || "number" === n || "boolean" === n ? n : String(n)
          );
        }
        getValueText() {
          const { value: e } = this.state;
          return null != e.text ? String(e.text) : String(e);
        }
      }
      var Pe = n(5591);
      const Ae = new s.Registry(() => {
        const e = [
          {
            id: re.$m.Lucene,
            name: "Lucene",
            description:
              "Values are lucene escaped and multi-valued variables generate an OR expression",
            formatter: (e) => {
              if ("string" == typeof e) return Ie(e);
              if (Array.isArray(e)) {
                if (0 === e.length) return "__empty__";
                return "(" + (0, V.map)(e, (e) => '"' + Ie(e) + '"').join(" OR ") + ")";
              }
              return Ie(`${e}`);
            },
          },
          {
            id: re.$m.Raw,
            name: "raw",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.keep-value-as-is",
              "Keep value as is",
            ),
            formatter: (e) => String(e),
          },
          {
            id: re.$m.Regex,
            name: "Regex",
            description:
              "Values are regex escaped and multi-valued variables generate a (<value>|<value>) expression",
            formatter: (e) => {
              if ("string" == typeof e) return (0, s.escapeRegex)(e);
              if (Array.isArray(e)) {
                const t = e.map((e) =>
                  "string" == typeof e ? (0, s.escapeRegex)(e) : (0, s.escapeRegex)(String(e)),
                );
                return 1 === t.length ? t[0] : "(" + t.join("|") + ")";
              }
              return (0, s.escapeRegex)(`${e}`);
            },
          },
          {
            id: re.$m.Pipe,
            name: "Pipe",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.values-are-separated-by-character",
              "Values are separated by | character",
            ),
            formatter: (e) => ("string" == typeof e ? e : Array.isArray(e) ? e.join("|") : `${e}`),
          },
          {
            id: re.$m.Distributed,
            name: "Distributed",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.multiple-values-are-formatted-like-variablevalue",
              "Multiple values are formatted like variable=value",
            ),
            formatter: (e, t, n) =>
              "string" == typeof e
                ? e
                : Array.isArray(e)
                  ? ((e = (0, V.map)(e, (e, t) => (0 !== t ? n.state.name + "=" + e : e))),
                    e.join(","))
                  : `${e}`,
          },
          {
            id: re.$m.CSV,
            name: "Csv",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.commaseparated-values",
              "Comma-separated values",
            ),
            formatter: (e) =>
              "string" == typeof e ? e : (0, V.isArray)(e) ? e.join(",") : String(e),
          },
          {
            id: re.$m.HTML,
            name: "HTML",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.html-escaping-of-values",
              "HTML escaping of values",
            ),
            formatter: (e) =>
              "string" == typeof e
                ? s.textUtil.escapeHtml(e)
                : (0, V.isArray)(e)
                  ? s.textUtil.escapeHtml(e.join(", "))
                  : s.textUtil.escapeHtml(String(e)),
          },
          {
            id: re.$m.JSON,
            name: "JSON",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.json-stringify-value",
              "JSON stringify value",
            ),
            formatter: (e) => ("string" == typeof e ? e : JSON.stringify(e)),
          },
          {
            id: re.$m.PercentEncode,
            name: "Percent encode",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.useful-for-url-escaping-values",
              "Useful for URL escaping values",
            ),
            formatter: (e) => ((0, V.isArray)(e) ? Ve("{" + e.join(",") + "}") : Ve(e)),
          },
          {
            id: re.$m.SingleQuote,
            name: "Single quote",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.single-quoted-values",
              "Single quoted values",
            ),
            formatter: (e) => {
              const t = new RegExp("'", "g");
              if ((0, V.isArray)(e))
                return (0, V.map)(e, (e) => `'${(0, V.replace)(e, t, "\\'")}'`).join(",");
              let n = "string" == typeof e ? e : String(e);
              return `'${(0, V.replace)(n, t, "\\'")}'`;
            },
          },
          {
            id: re.$m.DoubleQuote,
            name: "Double quote",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.double-quoted-values",
              "Double quoted values",
            ),
            formatter: (e) => {
              const t = new RegExp('"', "g");
              if ((0, V.isArray)(e))
                return (0, V.map)(e, (e) => `"${(0, V.replace)(e, t, '\\"')}"`).join(",");
              let n = "string" == typeof e ? e : String(e);
              return `"${(0, V.replace)(n, t, '\\"')}"`;
            },
          },
          {
            id: re.$m.SQLString,
            name: "SQL string",
            description:
              "SQL string quoting and commas for use in IN statements and other scenarios",
            formatter: Be,
          },
          {
            id: "join",
            name: "Join",
            description: "Join values with a comma",
            formatter: (e, t) => {
              var n;
              if ((0, V.isArray)(e)) {
                const r = null != (n = t[0]) ? n : ",";
                return e.join(r);
              }
              return String(e);
            },
          },
          {
            id: re.$m.Date,
            name: "Date",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.format-date-in-different-ways",
              "Format date in different ways",
            ),
            formatter: (e, t) => {
              var n;
              let r = NaN;
              if (
                ("number" == typeof e ? (r = e) : "string" == typeof e && (r = parseInt(e, 10)),
                isNaN(r))
              )
                return "NaN";
              const a = null != (n = t[0]) ? n : "iso";
              switch (a) {
                case "ms":
                  return String(e);
                case "seconds":
                  return `${Math.round(r / 1e3)}`;
                case "iso":
                  return (0, s.dateTime)(r).toISOString();
                default:
                  return (t || []).length > 1
                    ? (0, s.dateTime)(r).format(t.join(":"))
                    : (0, s.dateTime)(r).format(a);
              }
            },
          },
          {
            id: re.$m.Glob,
            name: "Glob",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.format-multivalued-variables-using-syntax-example",
              "Format multi-valued variables using glob syntax, example {value1,value2}",
            ),
            formatter: (e) =>
              (0, V.isArray)(e) && e.length > 1 ? "{" + e.join(",") + "}" : String(e),
          },
          {
            id: re.$m.Text,
            name: "Text",
            description:
              "Format variables in their text representation. Example in multi-variable scenario A + B + C.",
            formatter: (e, t, n) => (n.getValueText ? n.getValueText() : String(e)),
          },
          {
            id: re.$m.QueryParam,
            name: "Query parameter",
            description:
              "Format variables as URL parameters. Example in multi-variable scenario A + B + C => var-foo=A&var-foo=B&var-foo=C.",
            formatter: (e, t, n) => {
              if (n.urlSync) {
                const e = n.urlSync.getUrlState();
                return s.urlUtil.toUrlParams(e);
              }
              return Array.isArray(e)
                ? e.map((e) => Fe(n.state.name, e)).join("&")
                : Fe(n.state.name, e);
            },
          },
          {
            id: "customqueryparam",
            name: "Custom query parameter",
            description:
              "Format variables as URL parameters with custom name and value prefix. Example in multi-variable scenario A + B + C => p-foo=x-A&p-foo=x-B&p-foo=x-C.",
            formatter: (e, t, n) => {
              const r = Ve(t[0] || n.state.name),
                a = Ve(t[1] || "");
              return Array.isArray(e) ? e.map((e) => je(r, e, a)).join("&") : je(r, e, a);
            },
          },
          {
            id: re.$m.UriEncode,
            name: "Percent encode as URI",
            description: (0, Pe.t)(
              "grafana-scenes.variables.format-registry.formats.description.useful-escaping-values-taking-syntax-characters",
              "Useful for URL escaping values, taking into URI syntax characters",
            ),
            formatter: (e) => ((0, V.isArray)(e) ? Me("{" + e.join(",") + "}") : Me(e)),
          },
        ];
        return e;
      });
      function Ie(e) {
        return !1 === isNaN(+e)
          ? e
          : e.replace(/([\!\*\+\-\=<>\s\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g, "\\$1");
      }
      function Ve(e) {
        return ("object" == typeof e && (e = String(e)), Le(encodeURIComponent(e)));
      }
      const Me = (e) => Le(encodeURI(String(e))),
        Le = (e) => e.replace(/[!'()*]/g, (e) => "%" + e.charCodeAt(0).toString(16).toUpperCase());
      function Fe(e, t) {
        return `var-${e}=${Ve(t)}`;
      }
      function je(e, t, n = "") {
        return `${e}=${n}${Ve(t)}`;
      }
      const Ne = { "'": "''", '"': '\\"' };
      function Be(e) {
        const t = new RegExp("'|\"", "g");
        if ((0, V.isArray)(e))
          return (0, V.map)(
            e,
            (e) =>
              `'${(0, V.replace)(e, t, (e) => {
                var t;
                return null != (t = Ne[e]) ? t : "";
              })}'`,
          ).join(",");
        let n = "string" == typeof e ? e : String(e);
        return `'${(0, V.replace)(n, t, (e) => {
          var t;
          return null != (t = Ne[e]) ? t : "";
        })}'`;
      }
      const ze = "All",
        $e = "$__all",
        We = "$__auto",
        He = /\$(\w+)|\[\[(\w+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^\}]+))?(?::([^\}]+))?}/g,
        Ue = "__searchFilter",
        qe = "__scopes";
      class Ge {
        constructor(e) {
          this._value = e;
        }
        formatter() {
          return this._value;
        }
      }
      class Qe {
        constructor(e, t) {
          ((this.state = { name: e, type: "time_macro" }), (this._sceneObject = t));
        }
        getValue() {
          const e = Ce(this._sceneObject);
          return "__from" === this.state.name
            ? e.state.value.from.valueOf()
            : e.state.value.to.valueOf();
        }
        getValueText() {
          const e = Ce(this._sceneObject);
          return "__from" === this.state.name
            ? (0, s.dateTimeFormat)(e.state.value.from, { timeZone: e.getTimeZone() })
            : (0, s.dateTimeFormat)(e.state.value.to, { timeZone: e.getTimeZone() });
        }
      }
      class Ke {
        constructor(e, t, n) {
          ((this.state = { name: e, type: "time_macro", match: n }), (this._sceneObject = t));
        }
        getValue() {
          var e;
          const t = Xl(this._sceneObject);
          if (t) {
            const n = null == (e = t.state.data) ? void 0 : e.request;
            return n
              ? "__interval_ms" === this.state.name
                ? n.intervalMs
                : n.interval
              : this.state.match;
          }
          return this.state.match;
        }
      }
      function Ye(e, t) {
        e.setState(t);
      }
      function Ze() {
        return l.useLocationService ? (0, l.useLocationService)() : l.locationService;
      }
      function Xe(e) {
        let t = e;
        do {
          if ("repeatSourceKey" in t.state && t.state.repeatSourceKey) return !0;
          t = t.parent;
        } while (t);
        return !1;
      }
      class Je extends P {
        constructor() {
          (super(...arguments), (this._urlSync = new et(this)));
        }
        validateAndUpdate() {
          return this.getValueOptions({}).pipe(
            (0, m.map)((e) => (this.updateValueGivenNewOptions(e), {})),
          );
        }
        onCancel() {
          this.setStateHelper({ loading: !1 });
          const e = this.parent;
          null == e || e.cancel(this);
        }
        updateValueGivenNewOptions(e) {
          const { value: t, text: n, options: r } = this.state,
            a = this.getStateUpdateGivenNewOptions(e, t, n);
          (this.interceptStateUpdateAfterValidation(a),
            this.setStateHelper(a),
            (a.value !== t || a.text !== n || (this.hasAllValue() && !(0, V.isEqual)(e, r))) &&
              this.publishEvent(new Oe(this), !0));
        }
        getStateUpdateGivenNewOptions(e, t, n) {
          const r = { options: e, loading: !1, value: t, text: n };
          if (0 === e.length)
            return (
              this.state.defaultToAll || this.state.includeAll
                ? ((r.value = $e), (r.text = ze))
                : this.state.isMulti
                  ? ((r.value = []), (r.text = []))
                  : ((r.value = ""), (r.text = "")),
              r
            );
          if (this.hasAllValue())
            return (
              this.state.includeAll
                ? (r.text = ze)
                : ((r.value = e[0].value),
                  (r.text = e[0].label),
                  this.state.isMulti && ((r.value = [r.value]), (r.text = [r.text]))),
              r
            );
          if (this.state.isMulti) {
            const a = (Array.isArray(t) ? t : [t]).filter((t) => e.find((e) => e.value === t)),
              i = a.map((t) => e.find((e) => e.value === t).label);
            if (0 === a.length) {
              const t = this.getDefaultMultiState(e);
              ((r.value = t.value), (r.text = t.text));
            } else ((0, V.isEqual)(a, t) || (r.value = a), (0, V.isEqual)(i, n) || (r.text = i));
            return r;
          }
          let a = (function (e, t, n) {
            let r;
            for (const a of n) {
              if (a.value === e) return a;
              a.label === t && (r = a);
            }
            return r;
          })(t, n, e);
          if (a) ((r.text = a.label), (r.value = a.value));
          else {
            const t = this.getDefaultSingleState(e);
            ((r.value = t.value), (r.text = t.text));
          }
          return r;
        }
        interceptStateUpdateAfterValidation(e) {
          const t = e.value === $e && this.state.text === ze;
          (this.skipNextValidation &&
            e.value !== this.state.value &&
            e.text !== this.state.text &&
            !t &&
            ((e.value = this.state.value), (e.text = this.state.text)),
            (this.skipNextValidation = !1));
        }
        getValue(e) {
          let t = this.state.value;
          if (this.hasAllValue()) {
            if (this.state.allValue) return new tt(this.state.allValue, this);
            t = this.state.options.map((e) => e.value);
          }
          if (null != e && Array.isArray(t)) {
            const n = parseInt(e, 10);
            if (!isNaN(n) && n >= 0 && n < t.length) return t[n];
          }
          return t;
        }
        getValueText() {
          return this.hasAllValue()
            ? ze
            : Array.isArray(this.state.text)
              ? this.state.text.join(" + ")
              : String(this.state.text);
        }
        hasAllValue() {
          const e = this.state.value;
          return e === $e || (Array.isArray(e) && e[0] === $e);
        }
        getDefaultMultiState(e) {
          return this.state.defaultToAll
            ? { value: [$e], text: [ze] }
            : e.length > 0
              ? { value: [e[0].value], text: [e[0].label] }
              : { value: [], text: [] };
        }
        getDefaultSingleState(e) {
          return this.state.defaultToAll
            ? { value: $e, text: ze }
            : e.length > 0
              ? { value: e[0].value, text: e[0].label }
              : { value: "", text: "" };
        }
        changeValueTo(e, t, n = !1) {
          var r, a;
          if (e === this.state.value && t === this.state.text) return;
          if (
            (t ||
              (t = Array.isArray(e)
                ? e.map((e) => this.findLabelTextForValue(e))
                : this.findLabelTextForValue(e)),
            Array.isArray(e))
          ) {
            if (0 === e.length) {
              const n = this.getDefaultMultiState(this.state.options);
              ((e = n.value), (t = n.text));
            }
            e[e.length - 1] === $e
              ? ((e = [$e]), (t = [ze]))
              : e[0] === $e && e.length > 1 && (e.shift(), Array.isArray(t) && t.shift());
          }
          if ((0, V.isEqual)(e, this.state.value) && (0, V.isEqual)(t, this.state.text)) return;
          const i = () => this.setStateHelper({ value: e, text: t, loading: !1 });
          if (n) {
            const e = ne(this);
            (null == e || e.startProfile(ve),
              null == (a = (r = this._urlSync).performBrowserHistoryAction) || a.call(r, i));
          } else i();
          this.publishEvent(new Oe(this), !0);
        }
        findLabelTextForValue(e) {
          if (e === $e) return ze;
          const t = this.state.options.find((t) => t.value === e);
          if (t) return t.label;
          const n = this.state.options.find((t) => t.label === e);
          return n ? n.label : e;
        }
        setStateHelper(e) {
          Ye(this, e);
        }
        getOptionsForSelect(e = !0) {
          let t = this.state.options;
          if (
            (this.state.includeAll && (t = [{ value: $e, label: ze }, ...t]),
            e && !Array.isArray(this.state.value))
          ) {
            t.find((e) => e.value === this.state.value) ||
              (t = [{ value: this.state.value, label: String(this.state.text) }, ...t]);
          }
          return t;
        }
        refreshOptions() {
          this.getValueOptions({}).subscribe((e) => {
            this.updateValueGivenNewOptions(e);
          });
        }
      }
      class et {
        constructor(e) {
          ((this._sceneObject = e), (this._nextChangeShouldAddHistoryStep = !1));
        }
        getKey() {
          return `var-${this._sceneObject.state.name}`;
        }
        getKeys() {
          return this._sceneObject.state.skipUrlSync ? [] : [this.getKey()];
        }
        getUrlState() {
          if (this._sceneObject.state.skipUrlSync) return {};
          let e = null,
            t = this._sceneObject.state.value;
          return (
            (e = Array.isArray(t)
              ? t.map(String)
              : this._sceneObject.state.isMulti
                ? [String(t)]
                : String(t)),
            { [this.getKey()]: e }
          );
        }
        updateFromUrl(e) {
          let t = e[this.getKey()];
          null != t &&
            (this._sceneObject.state.includeAll &&
              (t = (function (e) {
                if ((0, V.isArray)(e) && e[0] === ze) return [$e];
                if (e === ze) return $e;
                return e;
              })(t)),
            this._sceneObject.state.allValue && this._sceneObject.state.allValue === t && (t = $e),
            this._sceneObject.isActive || (this._sceneObject.skipNextValidation = !0),
            this._sceneObject.changeValueTo(t));
        }
        performBrowserHistoryAction(e) {
          ((this._nextChangeShouldAddHistoryStep = !0),
            e(),
            (this._nextChangeShouldAddHistoryStep = !1));
        }
        shouldCreateHistoryStep(e) {
          return this._nextChangeShouldAddHistoryStep;
        }
      }
      class tt {
        constructor(e, t) {
          ((this._value = e), (this._variable = t));
        }
        formatter(e) {
          return e === re.$m.Text
            ? ze
            : e === re.$m.PercentEncode
              ? Ae.get(re.$m.PercentEncode).formatter(this._value, [], this._variable)
              : e === re.$m.QueryParam
                ? Ae.get(re.$m.QueryParam).formatter(ze, [], this._variable)
                : this._value;
        }
      }
      function nt(e, t = {}) {
        if (e.state.$variables)
          for (const n of e.state.$variables.state.variables)
            n.state.skipUrlSync || t[n.state.name] || (t[n.state.name] = n);
        return (e.parent && nt(e.parent, t), t);
      }
      const rt = (0, s.getDisplayProcessor)();
      class at {
        constructor(e) {
          this._urlQueryParams = e;
        }
        formatter(e) {
          if (!e) return this._urlQueryParams;
          const t = e.split(":");
          if ("exclude" === t[0] && t.length > 1) {
            const e = new URLSearchParams(this._urlQueryParams);
            for (const n of t[1].split(",")) e.delete(n);
            return `?${e}`;
          }
          if ("include" === t[0] && t.length > 1) {
            const e = new URLSearchParams(this._urlQueryParams),
              n = t[1].split(",");
            for (const t of e.keys()) n.includes(t) || e.delete(t);
            return `?${e}`;
          }
          return this._urlQueryParams;
        }
      }
      const it = new Map([
        [
          s.DataLinkBuiltInVars.includeVars,
          class {
            constructor(e, t) {
              ((this.state = { name: e, type: "url_variable" }), (this._sceneObject = t));
            }
            getValue() {
              const e = nt(this._sceneObject),
                t = Ae.get(re.$m.QueryParam),
                n = [];
              for (const r of Object.keys(e)) {
                const a = e[r];
                if (a instanceof Je && a.hasAllValue() && !a.state.allValue) {
                  n.push(t.formatter($e, [], a));
                  continue;
                }
                const i = a.getValue();
                i &&
                  (Re(i) ? n.push(i.formatter(re.$m.QueryParam)) : n.push(t.formatter(i, [], a)));
              }
              return new Ge(n.join("&"));
            }
            getValueText() {
              return "";
            }
          },
        ],
        [
          s.DataLinkBuiltInVars.keepTime,
          class {
            constructor(e, t) {
              ((this.state = { name: e, type: "url_variable" }), (this._sceneObject = t));
            }
            getValue() {
              var e;
              const t = null == (e = Ce(this._sceneObject).urlSync) ? void 0 : e.getUrlState();
              return new Ge(s.urlUtil.toUrlParams(t));
            }
            getValueText() {
              return "";
            }
          },
        ],
        [
          "__value",
          class {
            constructor(e, t, n, r) {
              ((this._match = n),
                (this._scopedVars = r),
                (this.state = { name: e, type: "__value" }));
            }
            getValue(e) {
              var t, n;
              const r = null == (t = this._scopedVars) ? void 0 : t.__dataContext;
              if (!r) return this._match;
              const { frame: a, rowIndex: i, field: o, calculatedValue: l } = r.value;
              if (l)
                switch (e) {
                  case "numeric":
                  case "raw":
                    return l.numeric;
                  case "time":
                    return "";
                  default:
                    return (0, s.formattedValueToString)(l);
                }
              if (null == i) return this._match;
              if ("time" === e) {
                const e = a.fields.find((e) => e.type === s.FieldType.time);
                return e ? e.values.get(i) : void 0;
              }
              if (!o) return this._match;
              const u = o.values.get(i);
              if ("raw" === e) return u;
              const c = (null != (n = o.display) ? n : rt)(u);
              return "numeric" === e ? c.numeric : (0, s.formattedValueToString)(c);
            }
            getValueText() {
              return "";
            }
          },
        ],
        [
          "__data",
          class {
            constructor(e, t, n, r) {
              ((this._match = n),
                (this._scopedVars = r),
                (this.state = { name: e, type: "__data" }));
            }
            getValue(e) {
              var t, n;
              const r = null == (t = this._scopedVars) ? void 0 : t.__dataContext;
              if (!r || !e) return this._match;
              const { frame: a, rowIndex: i } = r.value;
              if (void 0 === i || void 0 === e) return this._match;
              const o = {
                name: a.name,
                refId: a.refId,
                fields: (0, s.getFieldDisplayValuesProxy)({ frame: a, rowIndex: i }),
              };
              return null != (n = Te(e)(o)) ? n : "";
            }
            getValueText() {
              return "";
            }
          },
        ],
        [
          "__series",
          class {
            constructor(e, t, n, r) {
              ((this._match = n),
                (this._scopedVars = r),
                (this.state = { name: e, type: "__series" }));
            }
            getValue(e) {
              var t;
              const n = null == (t = this._scopedVars) ? void 0 : t.__dataContext;
              if (!n || !e) return this._match;
              if ("name" !== e) return this._match;
              const { frame: r, frameIndex: a } = n.value;
              return (0, s.getFrameDisplayName)(r, a);
            }
            getValueText() {
              return "";
            }
          },
        ],
        [
          "__field",
          class {
            constructor(e, t, n, r) {
              ((this._match = n),
                (this._scopedVars = r),
                (this.state = { name: e, type: "__field" }));
            }
            getValue(e) {
              var t, n;
              const r = null == (t = this._scopedVars) ? void 0 : t.__dataContext;
              if (!r || !e) return this._match;
              if (void 0 === e || "" === e) return this._match;
              const { frame: a, field: i, data: o } = r.value,
                l = (function (e, t, n) {
                  return new Proxy(
                    {},
                    {
                      get: (r, a) =>
                        "name" === a
                          ? e.name
                          : "displayName" === a
                            ? (0, s.getFieldDisplayName)(e, t, n)
                            : "labels" === a || "formattedLabels" === a
                              ? e.labels
                                ? {
                                    ...e.labels,
                                    __values: Object.values(e.labels).sort().join(", "),
                                    toString: () => (0, s.formatLabels)(e.labels, "", !0),
                                  }
                                : ""
                              : void 0,
                    },
                  );
                })(i, a, o);
              return null != (n = Te(e)(l)) ? n : "";
            }
            getValueText() {
              return "";
            }
          },
        ],
        [
          "__url",
          class {
            constructor(e, t) {
              this.state = { name: e, type: "url_macro" };
            }
            getValue(e) {
              var t;
              const n = l.locationService.getLocation(),
                r = null != (t = l.config.appSubUrl) ? t : "";
              switch (null != e ? e : "") {
                case "params":
                  return new at(n.search);
                case "path":
                  return r + n.pathname;
                default:
                  return r + n.pathname + n.search;
              }
            }
            getValueText() {
              return "";
            }
          },
        ],
        ["__from", Qe],
        ["__to", Qe],
        [
          "__timezone",
          class {
            constructor(e, t) {
              ((this.state = { name: e, type: "time_macro" }), (this._sceneObject = t));
            }
            getValue() {
              const e = Ce(this._sceneObject).getTimeZone();
              return "browser" === e ? Intl.DateTimeFormat().resolvedOptions().timeZone : e;
            }
            getValueText() {
              return this.getValue();
            }
          },
        ],
        [
          "__user",
          class {
            constructor(e, t) {
              this.state = { name: e, type: "user_macro" };
            }
            getValue(e) {
              const t = l.config.bootData.user;
              switch (e) {
                case "login":
                  return t.login;
                case "email":
                  return t.email;
                default:
                  return String(t.id);
              }
            }
            getValueText() {
              return "";
            }
          },
        ],
        [
          "__org",
          class {
            constructor(e, t) {
              this.state = { name: e, type: "org_macro" };
            }
            getValue(e) {
              const t = l.config.bootData.user;
              return "name" === e ? t.orgName : String(t.orgId);
            }
            getValueText() {
              return "";
            }
          },
        ],
        ["__interval", Ke],
        ["__interval_ms", Ke],
      ]);
      function ot(e, t, n, r, a) {
        return t && "string" == typeof t
          ? ((He.lastIndex = 0),
            t.replace(He, (t, i, o, s, l, u, c) => {
              const d = i || o || l,
                p = s || c || r,
                h = (function (e, t, n, r) {
                  if (n && n.hasOwnProperty(e)) {
                    const t = n[e];
                    if (t)
                      return (function (e, t) {
                        return (
                          ke ? ((ke.state.name = e), (ke.state.value = t)) : (ke = new De(e, t)),
                          ke
                        );
                      })(e, t);
                  }
                  const a = q(e, r);
                  if (a) return a;
                  const i = it.get(e);
                  if (i) return new i(e, r, t, n);
                  return null;
                })(d, t, n, e);
              if (!h)
                return (
                  a &&
                    a.push({
                      match: t,
                      variableName: d,
                      fieldPath: u,
                      format: p,
                      value: t,
                      found: !1,
                    }),
                  t
                );
              const f = (function (e, t, n, r) {
                if (null == n) return "";
                if (Re(n)) return ot(e, n.formatter(r));
                Array.isArray(n) || "object" != typeof n || (n = `${n}`);
                if ("function" == typeof r)
                  return r(n, {
                    name: t.state.name,
                    type: t.state.type,
                    multi: t.state.isMulti,
                    includeAll: t.state.includeAll,
                  });
                let a = [];
                r
                  ? ((a = r.split(":")), a.length > 1 ? ((r = a[0]), (a = a.slice(1))) : (a = []))
                  : (r = re.$m.Glob);
                let i = Ae.getIfExists(r);
                i ||
                  (console.error(`Variable format ${r} not found. Using glob format as fallback.`),
                  (i = Ae.get(re.$m.Glob)));
                return i.formatter(n, a, t);
              })(e, h, h.getValue(u), p);
              return (
                a &&
                  a.push({
                    match: t,
                    variableName: d,
                    fieldPath: u,
                    format: p,
                    value: f,
                    found: f !== t,
                  }),
                f
              );
            }))
          : null != t
            ? t
            : "";
      }
      function st(e) {
        return void 0 !== e.useState;
      }
      function lt(e) {
        return "enrichDataRequest" in e;
      }
      function ut(e) {
        return "enrichFiltersRequest" in e;
      }
      function ct(e) {
        return "isDataLayer" in e;
      }
      function dt(e = "op") {
        if ("undefined" != typeof crypto && crypto.randomUUID) {
          return `${e}-${crypto.randomUUID()}`;
        }
        return `${e}-${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
      }
      const pt = class e {
        constructor() {
          this.observers = [];
        }
        static getInstance() {
          return (e.instance || (e.instance = new e()), e.instance);
        }
        addObserver(e) {
          return (
            this.observers.push(e),
            () => {
              const t = this.observers.indexOf(e);
              t > -1 && this.observers.splice(t, 1);
            }
          );
        }
        clearObservers() {
          this.observers = [];
        }
        getObserverCount() {
          return this.observers.length;
        }
        notifyObservers(e, t, n) {
          this.observers.forEach((r) => {
            try {
              const n = r[e];
              null == n || n(t);
            } catch (e) {
              console.warn(`Error in ${n} observer:`, e);
            }
          });
        }
        notifyDashboardInteractionStart(e) {
          this.notifyObservers("onDashboardInteractionStart", e, "dashboard interaction start");
        }
        notifyDashboardInteractionMilestone(e) {
          this.notifyObservers(
            "onDashboardInteractionMilestone",
            e,
            "dashboard interaction milestone",
          );
        }
        notifyDashboardInteractionComplete(e) {
          this.notifyObservers(
            "onDashboardInteractionComplete",
            e,
            "dashboard interaction complete",
          );
        }
        notifyPanelOperationStart(e) {
          this.notifyObservers("onPanelOperationStart", e, "panel operation start");
        }
        notifyPanelOperationComplete(e) {
          this.notifyObservers("onPanelOperationComplete", e, "panel operation complete");
        }
        notifyQueryStart(e) {
          this.notifyObservers("onQueryStart", e, "query start");
        }
        notifyQueryComplete(e) {
          this.notifyObservers("onQueryComplete", e, "query complete");
        }
      };
      pt.instance = null;
      let ht = pt;
      function ft() {
        return ht.getInstance();
      }
      function mt(e, t) {
        return (n) => {
          const r = ru.getQueryController(e.origin);
          return r
            ? new m.Observable((a) => {
                var i;
                e.cancel || (e.cancel = () => a.complete());
                const o =
                    (null == (i = e.request) ? void 0 : i.requestId) ||
                    `${e.type}-${Math.floor(performance.now()).toString(36)}`,
                  s = performance.now();
                let l = null;
                if (t) l = t.onQueryStarted(s, e, o);
                else {
                  const t = dt("query");
                  (ft().notifyQueryStart({
                    operationId: t,
                    queryId: o,
                    queryType: e.type,
                    origin: e.origin.constructor.name,
                    timestamp: s,
                  }),
                    (l = (n, r) => {
                      ft().notifyQueryComplete({
                        operationId: t,
                        queryId: o,
                        queryType: e.type,
                        origin: e.origin.constructor.name,
                        timestamp: n,
                        duration: n - s,
                        error: r
                          ? (null == r ? void 0 : r.message) || String(r) || "Unknown error"
                          : void 0,
                      });
                    }));
                }
                r.queryStarted(e);
                let u = !1;
                const c = n.subscribe({
                  next: (t) => {
                    (u ||
                      t.state === ae.Loading ||
                      ((u = !0), r.queryCompleted(e), null == l || l(performance.now())),
                      a.next(t));
                  },
                  error: (t) => {
                    (u || ((u = !0), r.queryCompleted(e), null == l || l(performance.now(), t)),
                      a.error(t));
                  },
                  complete: () => {
                    a.complete();
                  },
                });
                return () => {
                  (c.unsubscribe(), u || (r.queryCompleted(e), null == l || l(performance.now())));
                };
              })
            : n;
        };
      }
      function gt(e) {
        return new m.Observable((t) => {
          t.next({ state: ae.Loading });
          (0, m.from)(e)
            .pipe(
              (0, m.map)(() => ({ state: ae.Done })),
              (0, m.catchError)(() => (t.next({ state: ae.Error }), [])),
            )
            .subscribe({ next: (e) => t.next(e), complete: () => t.complete() });
        });
      }
      async function vt(e, t) {
        var n;
        if (null == e ? void 0 : e.uid) {
          const t = F.get(e.uid);
          if (t) return t;
        }
        if (e && e.query) return e;
        const r = (0, l.getDataSourceSrv)().get(e, t);
        if (t.__sceneObject && t.__sceneObject.value.valueOf()) {
          const a = ru.getQueryController(t.__sceneObject.value.valueOf());
          a &&
            a.state.enableProfiling &&
            gt(r)
              .pipe(
                mt({
                  type: `getDataSource/${null != (n = null == e ? void 0 : e.type) ? n : "unknown"}`,
                  origin: t.__sceneObject.value.valueOf(),
                }),
              )
              .subscribe(() => {});
        }
        return await r;
      }
      class bt {
        constructor() {
          this._values = new Map();
        }
        recordCurrentDependencyValuesForSceneObject(e) {
          if ((this.clearValues(), e.variableDependency))
            for (const t of e.variableDependency.getNames()) {
              const n = ru.lookupVariable(t, e);
              n && this._values.set(n.state.name, n.getValue());
            }
        }
        cloneAndRecordCurrentValuesForSceneObject(e) {
          const t = new bt();
          return (t.recordCurrentDependencyValuesForSceneObject(e), t);
        }
        clearValues() {
          this._values.clear();
        }
        hasValues() {
          return !!this._values;
        }
        recordCurrentValue(e) {
          this._values.set(e.state.name, e.getValue());
        }
        hasRecordedValue(e) {
          return this._values.has(e.state.name);
        }
        hasValueChanged(e) {
          if (this._values.has(e.state.name)) {
            if (!fl(this._values.get(e.state.name), e.getValue())) return !0;
          }
          return !1;
        }
        hasDependenciesChanged(e) {
          if (!this._values) return !1;
          if (!e.variableDependency) return !1;
          for (const t of e.variableDependency.getNames()) {
            const n = ru.lookupVariable(t, e);
            if (!n) continue;
            const r = n.state.name;
            if (n && this._values.has(r)) {
              if (!fl(this._values.get(r), n.getValue())) return !0;
            }
          }
          return !1;
        }
      }
      function yt(e) {
        return "object" == typeof e && "getExtraQueries" in e;
      }
      const wt = (e, t) => (0, m.of)(t),
        St = 0;
      function xt(e) {
        const t = e.getRoot();
        return lt(t) ? t.enrichDataRequest(e) : null;
      }
      const _t = new Set();
      var Ct = n(2007),
        Ot = n(8449);
      function Rt(e, t = "latest") {
        return kt(e, t.replace(/\-.*/, ""));
      }
      function kt(e, t) {
        const n = {};
        for (const [r, a] of Object.entries(e))
          Et(a) ? (n[r] = kt(a, t)) : (Dt(a, r), (n[r] = Tt(a, t)));
        return n;
      }
      function Et(e) {
        if ("object" == typeof e) {
          const [t] = Object.keys(e);
          return !(0, Ot.valid)(t);
        }
        return !1;
      }
      function Tt(e, t) {
        let n,
          r = Object.keys(e).sort(Ot.compare);
        if ("latest" === t) return e[r[r.length - 1]];
        for (const e of r) (0, Ot.gte)(t, e) && (n = e);
        return (n || (n = r[r.length - 1]), e[n]);
      }
      function Dt(e, t) {
        if (!Object.keys(e).every((e) => (0, Ot.valid)(e)))
          throw new Error(`Invalid semver version: '${t}'`);
      }
      const Pt = "8.5.0",
        At = {
          RadioButton: { container: { "10.2.3": "data-testid radio-button" } },
          Breadcrumbs: { breadcrumb: { "9.4.0": (e) => `data-testid ${e} breadcrumb` } },
          CanvasGridAddActions: {
            addPanel: { "12.1.0": "data-testid CanvasGridAddActions add-panel" },
            groupPanels: { "12.1.0": "data-testid CanvasGridAddActions group-panels" },
            ungroup: { "12.1.0": "data-testid CanvasGridAddActions ungroup" },
            ungroupRows: { "12.1.0": "data-testid CanvasGridAddActions ungroup-rows" },
            addRow: { "12.1.0": "data-testid CanvasGridAddActions add-row" },
            pasteRow: { "12.1.0": "data-testid CanvasGridAddActions paste-row" },
            addTab: { "12.1.0": "data-testid CanvasGridAddActions add-tab" },
            pasteTab: { "12.1.0": "data-testid CanvasGridAddActions paste-tab" },
            pastePanel: { "12.1.0": "data-testid CanvasGridAddActions paste-panel" },
          },
          DashboardEditPaneSplitter: {
            primaryBody: { "12.1.0": "data-testid DashboardEditPaneSplitter primary body" },
          },
          EditPaneHeader: {
            deleteButton: { "12.1.0": "data-testid EditPaneHeader delete panel" },
            copyDropdown: { "12.1.0": "data-testid EditPaneHeader copy dropdown" },
            copy: { "12.1.0": "data-testid EditPaneHeader copy" },
            duplicate: { "12.1.0": "data-testid EditPaneHeader duplicate" },
            backButton: { "12.1.0": "data-testid EditPaneHeader back" },
          },
          TimePicker: {
            openButton: { [Pt]: "data-testid TimePicker Open Button" },
            overlayContent: { "10.2.3": "data-testid TimePicker Overlay Content" },
            fromField: {
              "10.2.3": "data-testid Time Range from field",
              [Pt]: "Time Range from field",
            },
            toField: { "10.2.3": "data-testid Time Range to field", [Pt]: "Time Range to field" },
            applyTimeRange: { [Pt]: "data-testid TimePicker submit button" },
            copyTimeRange: { "10.4.0": "data-testid TimePicker copy button" },
            pasteTimeRange: { "10.4.0": "data-testid TimePicker paste button" },
            calendar: {
              label: { "10.2.3": "data-testid Time Range calendar", [Pt]: "Time Range calendar" },
              openButton: {
                "10.2.3": "data-testid Open time range calendar",
                [Pt]: "Open time range calendar",
              },
              closeButton: {
                "10.2.3": "data-testid Close time range Calendar",
                [Pt]: "Close time range Calendar",
              },
            },
            absoluteTimeRangeTitle: { [Pt]: "data-testid-absolute-time-range-narrow" },
          },
          DataSourcePermissions: {
            form: { "9.5.0": () => 'form[name="addPermission"]' },
            roleType: { "9.5.0": "Role to add new permission to" },
            rolePicker: { "9.5.0": "Built-in role picker" },
            permissionLevel: { "12.0.0": "Permission level", "9.5.0": "Permission Level" },
          },
          DateTimePicker: { input: { "10.2.3": "data-testid date-time-input" } },
          DataSource: {
            TestData: {
              QueryTab: {
                scenarioSelectContainer: { [Pt]: "Test Data Query scenario select container" },
                scenarioSelect: { [Pt]: "Test Data Query scenario select" },
                max: { [Pt]: "TestData max" },
                min: { [Pt]: "TestData min" },
                noise: { [Pt]: "TestData noise" },
                seriesCount: { [Pt]: "TestData series count" },
                spread: { [Pt]: "TestData spread" },
                startValue: { [Pt]: "TestData start value" },
                drop: { [Pt]: "TestData drop values" },
              },
            },
            DataSourceHttpSettings: {
              urlInput: {
                "10.4.0": "data-testid Datasource HTTP settings url",
                [Pt]: "Datasource HTTP settings url",
              },
            },
            Jaeger: { traceIDInput: { [Pt]: "Trace ID" } },
            Prometheus: {
              configPage: {
                connectionSettings: { [Pt]: "Data source connection URL" },
                manageAlerts: { "10.4.0": "prometheus-alerts-manager" },
                allowAsRecordingRulesTarget: { "12.1.0": "prometheus-recording-rules-target" },
                scrapeInterval: { "10.4.0": "data-testid scrape interval" },
                queryTimeout: { "10.4.0": "data-testid query timeout" },
                defaultEditor: { "10.4.0": "data-testid default editor" },
                disableMetricLookup: { "10.4.0": "disable-metric-lookup" },
                prometheusType: { "10.4.0": "data-testid prometheus type" },
                prometheusVersion: { "10.4.0": "data-testid prometheus version" },
                cacheLevel: { "10.4.0": "data-testid cache level" },
                incrementalQuerying: { "10.4.0": "prometheus-incremental-querying" },
                queryOverlapWindow: { "10.4.0": "data-testid query overlap window" },
                disableRecordingRules: { "10.4.0": "disable-recording-rules" },
                customQueryParameters: { "10.4.0": "data-testid custom query parameters" },
                httpMethod: { "10.4.0": "data-testid http method" },
                exemplarsAddButton: {
                  "10.3.0": "data-testid Add exemplar config button",
                  [Pt]: "Add exemplar config button",
                },
                internalLinkSwitch: {
                  "10.3.0": "data-testid Internal link switch",
                  [Pt]: "Internal link switch",
                },
                codeModeMetricNamesSuggestionLimit: {
                  "11.1.0": "data-testid code mode metric names suggestion limit",
                },
                seriesLimit: { "12.0.2": "data-testid maximum series limit" },
              },
              queryEditor: {
                explain: { "10.4.0": "data-testid prometheus explain switch wrapper" },
                editorToggle: { "10.4.0": "data-testid QueryEditorModeToggle" },
                options: { "10.4.0": "data-testid prometheus options" },
                legend: { "10.4.0": "data-testid prometheus legend wrapper" },
                format: { "10.4.0": "data-testid prometheus format" },
                step: { "10.4.0": "data-testid prometheus-step" },
                type: { "10.4.0": "data-testid prometheus type" },
                exemplars: { "10.4.0": "data-testid prometheus-exemplars" },
                builder: {
                  metricSelect: { "10.4.0": "data-testid metric select" },
                  hints: { "10.4.0": "data-testid prometheus hints" },
                  metricsExplorer: { "10.4.0": "data-testid metrics explorer" },
                  queryAdvisor: { "10.4.0": "data-testid query advisor" },
                },
                code: {
                  queryField: { "10.4.0": "data-testid prometheus query field" },
                  metricsCountInfo: { "11.1.0": "data-testid metrics count disclaimer" },
                  metricsBrowser: {
                    openButton: { "10.4.0": "data-testid open metrics browser" },
                    selectMetric: { "10.4.0": "data-testid select a metric" },
                    seriesLimit: { "10.3.1": "data-testid series limit" },
                    metricList: { "10.4.0": "data-testid metric list" },
                    labelNamesFilter: { "10.4.0": "data-testid label names filter" },
                    labelValuesFilter: { "10.4.0": "data-testid label values filter" },
                    useQuery: { "10.4.0": "data-testid use query" },
                    useAsRateQuery: { "10.4.0": "data-testid use as rate query" },
                    validateSelector: { "10.4.0": "data-testid validate selector" },
                    clear: { "10.4.0": "data-testid clear" },
                  },
                },
              },
              exemplarMarker: { "10.3.0": "data-testid Exemplar marker", [Pt]: "Exemplar marker" },
              variableQueryEditor: {
                queryType: { "10.4.0": "data-testid query type" },
                labelnames: { metricRegex: { "10.4.0": "data-testid label names metric regex" } },
                labelValues: { labelSelect: { "10.4.0": "data-testid label values label select" } },
                metricNames: { metricRegex: { "10.4.0": "data-testid metric names metric regex" } },
                varQueryResult: { "10.4.0": "data-testid variable query result" },
                seriesQuery: { "10.4.0": "data-testid prometheus series query" },
                classicQuery: { "10.4.0": "data-testid prometheus classic query" },
              },
              annotations: {
                minStep: { "10.4.0": "data-testid prometheus-annotation-min-step" },
                title: { "10.4.0": "data-testid prometheus annotation title" },
                tags: { "10.4.0": "data-testid prometheus annotation tags" },
                text: { "10.4.0": "data-testid prometheus annotation text" },
                seriesValueAsTimestamp: {
                  "10.4.0": "data-testid prometheus annotation series value as timestamp",
                },
              },
            },
          },
          Menu: {
            MenuComponent: { [Pt]: (e) => `${e} menu` },
            MenuGroup: { [Pt]: (e) => `${e} menu group` },
            MenuItem: { [Pt]: (e) => `${e} menu item` },
            SubMenu: {
              container: { "10.3.0": "data-testid SubMenu container", [Pt]: "SubMenu container" },
              icon: { "10.3.0": "data-testid SubMenu icon", [Pt]: "SubMenu icon" },
            },
          },
          Panels: {
            Panel: {
              title: { [Pt]: (e) => `data-testid Panel header ${e}` },
              content: { "11.1.0": "data-testid panel content" },
              headerContainer: { "9.5.0": "data-testid header-container" },
              headerItems: { "10.2.0": (e) => `data-testid Panel header item ${e}` },
              menuItems: { "9.5.0": (e) => `data-testid Panel menu item ${e}` },
              menu: { "9.5.0": (e) => `data-testid Panel menu ${e}` },
              containerByTitle: { [Pt]: (e) => `${e} panel` },
              headerCornerInfo: { [Pt]: (e) => `Panel header ${e}` },
              status: {
                "10.2.0": (e) => `data-testid Panel status ${e}`,
                [Pt]: (e) => "Panel status",
              },
              loadingBar: { "10.0.0": () => "Panel loading bar" },
              HoverWidget: {
                container: {
                  "10.1.0": "data-testid hover-header-container",
                  [Pt]: "hover-header-container",
                },
                dragIcon: { "10.0.0": "data-testid drag-icon" },
              },
              PanelDataErrorMessage: { "10.4.0": "data-testid Panel data error message" },
            },
            Visualization: {
              Graph: {
                container: { "9.5.0": "Graph container" },
                VisualizationTab: { legendSection: { [Pt]: "Legend section" } },
                Legend: {
                  legendItemAlias: { [Pt]: (e) => `gpl alias ${e}` },
                  showLegendSwitch: { [Pt]: "gpl show legend" },
                },
                xAxis: { labels: { [Pt]: () => "div.flot-x-axis > div.flot-tick-label" } },
              },
              BarGauge: { valueV2: { [Pt]: "data-testid Bar gauge value" } },
              PieChart: { svgSlice: { "10.3.0": "data testid Pie Chart Slice" } },
              Text: { container: { [Pt]: () => ".markdown-html" } },
              Table: {
                header: { [Pt]: "table header" },
                footer: { [Pt]: "table-footer" },
                body: { "10.2.0": "data-testid table body" },
              },
              TableNG: {
                Filters: {
                  HeaderButton: { "12.1.0": "data-testid tableng header filter" },
                  Container: { "12.1.0": "data-testid tablenf filter container" },
                  SelectAll: { "12.1.0": "data-testid tableng filter select-all" },
                },
                Tooltip: {
                  Wrapper: { "12.2.0": "data-testid tableng tooltip wrapper" },
                  Caret: { "12.2.0": "data-testid tableng tooltip caret" },
                },
                Footer: {
                  ReducerLabel: { "12.2.0": "data-testid tableng footer reducer-label" },
                  Value: { "12.2.0": "data-testid tableng footer value" },
                },
              },
              Tooltip: { Wrapper: { "12.3.0": "data-testid viz-tooltip-wrapper" } },
            },
          },
          VizLegend: { seriesName: { "10.3.0": (e) => `data-testid VizLegend series ${e}` } },
          Drawer: {
            General: {
              title: { [Pt]: (e) => `Drawer title ${e}` },
              expand: { [Pt]: "Drawer expand" },
              contract: { [Pt]: "Drawer contract" },
              close: { "10.3.0": "data-testid Drawer close", [Pt]: "Drawer close" },
              rcContentWrapper: { "9.4.0": () => ".rc-drawer-content-wrapper" },
              subtitle: { "10.4.0": "data-testid drawer subtitle" },
            },
            DashboardSaveDrawer: {
              saveButton: { "11.1.0": "data-testid Save dashboard drawer button" },
              saveAsButton: { "11.1.0": "data-testid Save as dashboard drawer button" },
              saveAsTitleInput: { "11.1.0": "Save dashboard title field" },
            },
          },
          PanelEditor: {
            General: {
              content: {
                "11.1.0": "data-testid Panel editor content",
                "8.0.0": "Panel editor content",
              },
            },
            OptionsPane: {
              content: {
                "11.1.0": "data-testid Panel editor option pane content",
                [Pt]: "Panel editor option pane content",
              },
              select: { [Pt]: "Panel editor option pane select" },
              fieldLabel: { [Pt]: (e) => `${e} field property editor` },
              fieldInput: {
                "11.0.0": (e) => `data-testid Panel editor option pane field input ${e}`,
              },
            },
            DataPane: {
              content: {
                "11.1.0": "data-testid Panel editor data pane content",
                [Pt]: "Panel editor data pane content",
              },
            },
            applyButton: {
              "9.2.0": "data-testid Apply changes and go back to dashboard",
              "9.1.0": "Apply changes and go back to dashboard",
              "8.0.0": "panel editor apply",
            },
            toggleVizPicker: {
              "10.0.0": "data-testid toggle-viz-picker",
              "8.0.0": "toggle-viz-picker",
            },
            toggleVizOptions: {
              "10.1.0": "data-testid toggle-viz-options",
              [Pt]: "toggle-viz-options",
            },
            toggleTableView: {
              "11.1.0": "data-testid toggle-table-view",
              [Pt]: "toggle-table-view",
            },
            showZoomField: { "10.2.0": "Map controls Show zoom control field property editor" },
            showAttributionField: {
              "10.2.0": "Map controls Show attribution field property editor",
            },
            showScaleField: { "10.2.0": "Map controls Show scale field property editor" },
            showMeasureField: { "10.2.0": "Map controls Show measure tools field property editor" },
            showDebugField: { "10.2.0": "Map controls Show debug field property editor" },
            measureButton: {
              "12.1.0": "data-testid panel-editor-measure-button",
              "9.2.0": "show measure tools",
            },
            Outline: {
              section: { "12.0.0": "data-testid Outline section" },
              node: { "12.0.0": (e) => `data-testid outline node ${e}` },
              item: { "12.0.0": (e) => `data-testid outline item ${e}` },
            },
            ElementEditPane: {
              variableType: { "12.0.0": (e) => `data-testid variable type ${e}` },
              addVariableButton: { "12.0.0": "data-testid add variable button" },
              variableNameInput: { "12.0.0": "data-testid variable name input" },
              variableLabelInput: { "12.0.0": "data-testid variable label input" },
              AutoGridLayout: {
                minColumnWidth: { "12.1.0": "data-testid min column width selector" },
                customMinColumnWidth: { "12.1.0": "data-testid custom min column width input" },
                clearCustomMinColumnWidth: {
                  "12.1.0": "data-testid clear custom min column width input",
                },
                maxColumns: { "12.1.0": "data-testid max columns selector" },
                rowHeight: { "12.1.0": "data-testid row height selector" },
                customRowHeight: { "12.1.0": "data-testid custom row height input" },
                clearCustomRowHeight: { "12.1.0": "data-testid clear custom row height input" },
                fillScreen: { "12.1.0": "data-testid fill screen switch" },
              },
              TabsLayout: { titleInput: { "12.2.0": "data-testid tab title input" } },
            },
          },
          PanelInspector: {
            Data: { content: { [Pt]: "Panel inspector Data content" } },
            Stats: { content: { [Pt]: "Panel inspector Stats content" } },
            Json: {
              content: {
                "11.1.0": "data-testid Panel inspector Json content",
                [Pt]: "Panel inspector Json content",
              },
            },
            Query: {
              content: { [Pt]: "Panel inspector Query content" },
              refreshButton: { [Pt]: "Panel inspector Query refresh button" },
              jsonObjectKeys: { [Pt]: () => ".json-formatter-key" },
            },
          },
          Tab: {
            title: { "11.2.0": (e) => `data-testid Tab ${e}` },
            active: { [Pt]: () => '[class*="-activeTabStyle"]' },
          },
          RefreshPicker: {
            runButtonV2: { [Pt]: "data-testid RefreshPicker run button" },
            intervalButtonV2: { [Pt]: "data-testid RefreshPicker interval button" },
          },
          QueryTab: {
            content: { [Pt]: "Query editor tab content" },
            queryInspectorButton: { [Pt]: "Query inspector button" },
            queryHistoryButton: {
              "10.2.0": "data-testid query-history-button",
              [Pt]: "query-history-button",
            },
            addQuery: {
              "10.2.0": "data-testid query-tab-add-query",
              [Pt]: "Query editor add query button",
            },
            addQueryFromLibrary: { "11.5.0": "data-testid query-tab-add-query-from-library" },
            queryGroupTopSection: { "11.2.0": "data-testid query group top section" },
            addExpression: { "11.2.0": "data-testid query-tab-add-expression" },
          },
          QueryHistory: { queryText: { "9.0.0": "Query text" } },
          QueryEditorRows: { rows: { [Pt]: "Query editor row" } },
          QueryEditorRow: {
            actionButton: { "10.4.0": (e) => `data-testid ${e}` },
            title: { [Pt]: (e) => `Query editor row title ${e}` },
            container: { [Pt]: (e) => `Query editor row ${e}` },
          },
          AlertTab: {
            content: {
              "10.2.3": "data-testid Alert editor tab content",
              [Pt]: "Alert editor tab content",
            },
          },
          AlertRules: {
            groupToggle: { "11.0.0": "data-testid group-collapse-toggle" },
            toggle: { "11.0.0": "data-testid collapse-toggle" },
            expandedContent: { "11.0.0": "data-testid expanded-content" },
            previewButton: { "11.1.0": "data-testid alert-rule preview-button" },
            ruleNameField: { "11.1.0": "data-testid alert-rule name-field" },
            newFolderButton: { "11.1.0": "data-testid alert-rule new-folder-button" },
            newFolderNameField: { "11.1.0": "data-testid alert-rule name-folder-name-field" },
            newFolderNameCreateButton: {
              "11.1.0": "data-testid alert-rule name-folder-name-create-button",
            },
            newEvaluationGroupButton: {
              "11.1.0": "data-testid alert-rule new-evaluation-group-button",
            },
            newEvaluationGroupName: {
              "11.1.0": "data-testid alert-rule new-evaluation-group-name",
            },
            newEvaluationGroupInterval: {
              "11.1.0": "data-testid alert-rule new-evaluation-group-interval",
            },
            newEvaluationGroupCreate: {
              "11.1.0": "data-testid alert-rule new-evaluation-group-create-button",
            },
            step: { "11.5.0": (e) => `data-testid alert-rule step-${e}` },
            stepAdvancedModeSwitch: {
              "11.5.0": (e) => `data-testid advanced-mode-switch step-${e}`,
            },
          },
          Alert: { alertV2: { [Pt]: (e) => `data-testid Alert ${e}` } },
          TransformTab: {
            content: {
              "10.1.0": "data-testid Transform editor tab content",
              [Pt]: "Transform editor tab content",
            },
            newTransform: { "10.1.0": (e) => `data-testid New transform ${e}` },
            transformationEditor: { "10.1.0": (e) => `data-testid Transformation editor ${e}` },
            transformationEditorDebugger: {
              "10.1.0": (e) => `data-testid Transformation editor debugger ${e}`,
            },
          },
          Transforms: {
            card: { "10.1.0": (e) => `data-testid New transform ${e}` },
            disableTransformationButton: { "10.4.0": "data-testid Disable transformation button" },
            Reduce: {
              modeLabel: {
                "10.2.3": "data-testid Transform mode label",
                [Pt]: "Transform mode label",
              },
              calculationsLabel: {
                "10.2.3": "data-testid Transform calculations label",
                [Pt]: "Transform calculations label",
              },
            },
            SpatialOperations: {
              actionLabel: { "9.1.2": "root Action field property editor" },
              locationLabel: { "10.2.0": "root Location Mode field property editor" },
              location: {
                autoOption: { "9.1.2": "Auto location option" },
                coords: {
                  option: { "9.1.2": "Coords location option" },
                  latitudeFieldLabel: { "9.1.2": "root Latitude field field property editor" },
                  longitudeFieldLabel: { "9.1.2": "root Longitude field field property editor" },
                },
                geohash: {
                  option: { "9.1.2": "Geohash location option" },
                  geohashFieldLabel: { "9.1.2": "root Geohash field field property editor" },
                },
                lookup: {
                  option: { "9.1.2": "Lookup location option" },
                  lookupFieldLabel: { "9.1.2": "root Lookup field field property editor" },
                  gazetteerFieldLabel: { "9.1.2": "root Gazetteer field property editor" },
                },
              },
            },
            searchInput: {
              "10.2.3": "data-testid search transformations",
              [Pt]: "search transformations",
            },
            noTransformationsMessage: { "10.2.3": "data-testid no transformations message" },
            addTransformationButton: {
              "10.1.0": "data-testid add transformation button",
              [Pt]: "add transformation button",
            },
            removeAllTransformationsButton: {
              "10.4.0": "data-testid remove all transformations button",
            },
          },
          NavBar: {
            Configuration: { button: { "9.5.0": "Configuration" } },
            Toggle: { button: { "10.2.3": "data-testid Toggle menu", [Pt]: "Toggle menu" } },
            Reporting: { button: { "9.5.0": "Reporting" } },
          },
          NavMenu: {
            Menu: { "10.2.3": "data-testid navigation mega-menu" },
            item: { "9.5.0": "data-testid Nav menu item" },
          },
          NavToolbar: {
            container: { "9.4.0": "data-testid Nav toolbar" },
            commandPaletteTrigger: { "11.5.0": "data-testid Command palette trigger" },
            shareDashboard: { "11.1.0": "data-testid Share dashboard" },
            markAsFavorite: { "11.1.0": "data-testid Mark as favorite" },
            editDashboard: {
              editButton: { "11.1.0": "data-testid Edit dashboard button" },
              saveButton: { "11.1.0": "data-testid Save dashboard button" },
              exitButton: { "11.1.0": "data-testid Exit edit mode button" },
              settingsButton: { "11.1.0": "data-testid Dashboard settings" },
              addRowButton: { "11.1.0": "data-testid Add row button" },
              addLibraryPanelButton: {
                "11.1.0": "data-testid Add a panel from the panel library button",
              },
              addVisualizationButton: { "11.1.0": "data-testid Add new visualization menu item" },
              pastePanelButton: { "11.1.0": "data-testid Paste panel button" },
              discardChangesButton: { "11.1.0": "data-testid Discard changes button" },
              discardLibraryPanelButton: { "11.1.0": "data-testid Discard library panel button" },
              unlinkLibraryPanelButton: { "11.1.0": "data-testid Unlink library panel button" },
              saveLibraryPanelButton: { "11.1.0": "data-testid Save library panel button" },
              backToDashboardButton: { "11.1.0": "data-testid Back to dashboard button" },
            },
          },
          PageToolbar: {
            container: { [Pt]: () => ".page-toolbar" },
            item: { [Pt]: (e) => `${e}` },
            itemButton: { "9.5.0": (e) => `data-testid ${e}` },
          },
          QueryEditorToolbarItem: {
            button: { [Pt]: (e) => `QueryEditor toolbar item button ${e}` },
          },
          BackButton: { backArrow: { "10.3.0": "data-testid Go Back", [Pt]: "Go Back" } },
          OptionsGroup: {
            group: {
              "11.1.0": (e) => (e ? `data-testid Options group ${e}` : "data-testid Options group"),
              [Pt]: (e) => (e ? `Options group ${e}` : "Options group"),
            },
            toggle: {
              "11.1.0": (e) =>
                e ? `data-testid Options group ${e} toggle` : "data-testid Options group toggle",
              [Pt]: (e) => (e ? `Options group ${e} toggle` : "Options group toggle"),
            },
          },
          PluginVisualization: {
            item: { [Pt]: (e) => `Plugin visualization item ${e}` },
            current: { [Pt]: () => '[class*="-currentVisualizationItem"]' },
          },
          Select: {
            menu: { "11.5.0": "data-testid Select menu", [Pt]: "Select options menu" },
            option: { "11.1.0": "data-testid Select option", [Pt]: "Select option" },
            toggleAllOptions: { "11.3.0": "data-testid toggle all options" },
            input: { [Pt]: () => 'input[id*="time-options-input"]' },
            singleValue: { [Pt]: () => 'div[class*="-singleValue"]' },
          },
          FieldConfigEditor: { content: { [Pt]: "Field config editor content" } },
          OverridesConfigEditor: { content: { [Pt]: "Field overrides editor content" } },
          FolderPicker: {
            containerV2: { [Pt]: "data-testid Folder picker select container" },
            input: { "10.4.0": "data-testid folder-picker-input" },
          },
          ReadonlyFolderPicker: {
            container: { [Pt]: "data-testid Readonly folder picker select container" },
          },
          DataSourcePicker: {
            container: {
              "10.0.0": "data-testid Data source picker select container",
              "8.0.0": "Data source picker select container",
            },
            inputV2: { "10.1.0": "data-testid Select a data source", [Pt]: "Select a data source" },
            dataSourceList: { "10.4.0": "data-testid Data source list dropdown" },
            advancedModal: {
              dataSourceList: { "10.4.0": "data-testid Data source list" },
              builtInDataSourceList: { "10.4.0": "data-testid Built in data source list" },
            },
          },
          TimeZonePicker: {
            containerV2: { [Pt]: "data-testid Time zone picker select container" },
            changeTimeSettingsButton: {
              "11.0.0": "data-testid Time zone picker Change time settings button",
            },
          },
          WeekStartPicker: {
            containerV2: { [Pt]: "data-testid Choose starting day of the week" },
            placeholder: { [Pt]: "Choose starting day of the week" },
          },
          TraceViewer: { spanBar: { "9.0.0": "data-testid SpanBar--wrapper" } },
          QueryField: { container: { "10.3.0": "data-testid Query field", [Pt]: "Query field" } },
          QueryBuilder: {
            queryPatterns: { "10.3.0": "data-testid Query patterns", [Pt]: "Query patterns" },
            labelSelect: { "10.3.0": "data-testid Select label", [Pt]: "Select label" },
            inputSelect: { "11.1.0": "data-testid Select label-input" },
            valueSelect: { "10.3.0": "data-testid Select value", [Pt]: "Select value" },
            matchOperatorSelect: {
              "10.3.0": "data-testid Select match operator",
              [Pt]: "Select match operator",
            },
          },
          ValuePicker: {
            button: { "10.3.0": (e) => `data-testid Value picker button ${e}` },
            select: { "10.3.0": (e) => `data-testid Value picker select ${e}` },
          },
          Search: {
            sectionV2: { [Pt]: "data-testid Search section" },
            itemsV2: { [Pt]: "data-testid Search items" },
            cards: { [Pt]: "data-testid Search cards" },
            collapseFolder: { [Pt]: (e) => `data-testid Collapse folder ${e}` },
            expandFolder: { [Pt]: (e) => `data-testid Expand folder ${e}` },
            dashboardItem: { [Pt]: (e) => `data-testid Dashboard search item ${e}` },
            dashboardCard: { [Pt]: (e) => `data-testid Search card ${e}` },
            folderHeader: { "9.3.0": (e) => `data-testid Folder header ${e}` },
            folderContent: { "9.3.0": (e) => `data-testid Folder content ${e}` },
            dashboardItems: { [Pt]: "data-testid Dashboard search item" },
          },
          DashboardLinks: {
            container: { [Pt]: "data-testid Dashboard link container" },
            dropDown: { [Pt]: "data-testid Dashboard link dropdown" },
            link: { [Pt]: "data-testid Dashboard link" },
          },
          LoadingIndicator: {
            icon: { "10.4.0": "data-testid Loading indicator", [Pt]: "Loading indicator" },
          },
          CallToActionCard: { buttonV2: { [Pt]: (e) => `data-testid Call to action button ${e}` } },
          DataLinksContextMenu: {
            singleLink: { "10.3.0": "data-testid Data link", [Pt]: "Data link" },
          },
          DataLinksActionsTooltip: {
            tooltipWrapper: { "12.1.0": "data-testid Data links actions tooltip wrapper" },
          },
          CodeEditor: {
            container: {
              "10.2.3": "data-testid Code editor container",
              [Pt]: "Code editor container",
            },
          },
          ReactMonacoEditor: {
            editorLazy: { "11.1.0": "data-testid ReactMonacoEditor editorLazy" },
          },
          DashboardImportPage: {
            textarea: { [Pt]: "data-testid-import-dashboard-textarea" },
            submit: { [Pt]: "data-testid-load-dashboard" },
          },
          ImportDashboardForm: {
            name: { [Pt]: "data-testid-import-dashboard-title" },
            submit: { [Pt]: "data-testid-import-dashboard-submit" },
          },
          PanelAlertTabContent: {
            content: {
              "10.2.3": "data-testid Unified alert editor tab content",
              [Pt]: "Unified alert editor tab content",
            },
          },
          VisualizationPreview: { card: { [Pt]: (e) => `data-testid suggestion-${e}` } },
          ColorSwatch: { name: { [Pt]: "data-testid-colorswatch" } },
          DashboardRow: {
            title: { [Pt]: (e) => `data-testid dashboard-row-title-${e}` },
            wrapper: { "12.1.0": (e) => `data-testid dashboard-row-wrapper-for-${e}` },
          },
          UserProfile: {
            profileSaveButton: { [Pt]: "data-testid-user-profile-save" },
            preferencesSaveButton: { [Pt]: "data-testid-shared-prefs-save" },
            orgsTable: { [Pt]: "data-testid-user-orgs-table" },
            sessionsTable: { [Pt]: "data-testid-user-sessions-table" },
            extensionPointTabs: { "10.2.3": "data-testid-extension-point-tabs" },
            extensionPointTab: { "10.2.3": (e) => `data-testid-extension-point-tab-${e}` },
          },
          FileUpload: {
            inputField: { "9.0.0": "data-testid-file-upload-input-field" },
            fileNameSpan: { "9.0.0": "data-testid-file-upload-file-name" },
          },
          DebugOverlay: { wrapper: { "9.2.0": "debug-overlay" } },
          OrgRolePicker: { input: { "9.5.0": "Role" } },
          AnalyticsToolbarButton: { button: { "9.5.0": "Dashboard insights" } },
          Variables: {
            variableOption: { "9.5.0": "data-testid variable-option" },
            variableLinkWrapper: { "11.1.1": "data-testid variable-link-wrapper" },
          },
          Annotations: {
            annotationsTypeInput: {
              "11.1.0": "data-testid annotations-type-input",
              [Pt]: "annotations-type-input",
            },
            annotationsChoosePanelInput: {
              "11.1.0": "data-testid choose-panels-input",
              [Pt]: "choose-panels-input",
            },
            editor: {
              testButton: { "11.0.0": "data-testid annotations-test-button" },
              resultContainer: { "11.0.0": "data-testid annotations-query-result-container" },
            },
          },
          Tooltip: { container: { "10.2.0": "data-testid tooltip" } },
          ReturnToPrevious: {
            buttonGroup: { "11.0.0": "data-testid dismissable button group" },
            backButton: { "11.0.0": "data-testid back" },
            dismissButton: { "11.0.0": "data-testid dismiss" },
          },
          SQLQueryEditor: {
            selectColumn: { "11.0.0": "data-testid select-column" },
            selectColumnInput: { "11.0.0": "data-testid select-column-input" },
            selectFunctionParameter: {
              "11.0.0": (e) => `data-testid select-function-parameter-${e}`,
            },
            selectAggregation: { "11.0.0": "data-testid select-aggregation" },
            selectAggregationInput: { "11.0.0": "data-testid select-aggregation-input" },
            selectAlias: { "11.0.0": "data-testid select-alias" },
            selectAliasInput: { "11.0.0": "data-testid select-alias-input" },
            selectInputParameter: { "11.0.0": "data-testid select-input-parameter" },
            filterConjunction: { "11.0.0": "data-testid filter-conjunction" },
            filterField: { "11.0.0": "data-testid filter-field" },
            filterOperator: { "11.0.0": "data-testid filter-operator" },
            headerTableSelector: { "11.0.0": "data-testid header-table-selector" },
            headerFilterSwitch: { "11.0.0": "data-testid header-filter-switch" },
            headerGroupSwitch: { "11.0.0": "data-testid header-group-switch" },
            headerOrderSwitch: { "11.0.0": "data-testid header-order-switch" },
            headerPreviewSwitch: { "11.0.0": "data-testid header-preview-switch" },
          },
          EntityNotFound: { container: { "11.2.0": "data-testid entity-not-found" } },
          Portal: { container: { "11.5.0": "data-testid portal-container" } },
          ExportImage: {
            formatOptions: {
              container: { "12.1.0": "data-testid export-image-format-options" },
              png: { "12.1.0": "data-testid export-image-format-png" },
              jpg: { "12.1.0": "data-testid export-image-format-jpg" },
            },
            rendererAlert: {
              container: { "12.1.0": "data-testid export-image-renderer-alert" },
              title: { "12.1.0": "data-testid export-image-renderer-alert-title" },
              description: { "12.1.0": "data-testid export-image-renderer-alert-description" },
            },
            buttons: {
              generate: { "12.1.0": "data-testid export-image-generate-button" },
              download: { "12.1.0": "data-testid export-image-download-button" },
              cancel: { "12.1.0": "data-testid export-image-cancel-button" },
            },
            preview: {
              container: { "12.1.0": "data-testid export-image-preview-container" },
              loading: { "12.1.0": "data-testid export-image-preview-loading" },
              image: { "12.1.0": "data-testid export-image-preview" },
              error: {
                container: { "12.1.0": "data-testid export-image-error" },
                title: { "12.1.0": "data-testid export-image-error-title" },
                message: { "12.1.0": "data-testid export-image-error-message" },
              },
            },
          },
        },
        It = {
          pages: Rt({
            Alerting: {
              AddAlertRule: { url: { "10.1.0": "/alerting/new/alerting", [Pt]: "/alerting/new" } },
              EditAlertRule: { url: { [Pt]: (e) => `alerting/${e}/edit` } },
            },
            Login: {
              url: { [Pt]: "/login" },
              username: {
                "10.2.3": "data-testid Username input field",
                [Pt]: "Username input field",
              },
              password: {
                "10.2.3": "data-testid Password input field",
                [Pt]: "Password input field",
              },
              submit: { "10.2.3": "data-testid Login button", [Pt]: "Login button" },
              skip: { "10.2.3": "data-testid Skip change password button" },
            },
            PasswordlessLogin: {
              url: { [Pt]: "/login/passwordless/authenticate" },
              email: { "10.2.3": "data-testid Email input field", [Pt]: "Email input field" },
              submit: {
                "10.2.3": "data-testid PasswordlessLogin button",
                [Pt]: "PasswordlessLogin button",
              },
            },
            Home: { url: { [Pt]: "/" } },
            DataSource: {
              name: {
                "10.3.0": "data-testid Data source settings page name input field",
                [Pt]: "Data source settings page name input field",
              },
              delete: { [Pt]: "Data source settings page Delete button" },
              readOnly: {
                "10.3.0": "data-testid Data source settings page read only message",
                [Pt]: "Data source settings page read only message",
              },
              saveAndTest: {
                "10.0.0": "data-testid Data source settings page Save and Test button",
                [Pt]: "Data source settings page Save and Test button",
              },
              alert: {
                "10.3.0": "data-testid Data source settings page Alert",
                [Pt]: "Data source settings page Alert",
              },
            },
            DataSources: {
              url: { [Pt]: "/datasources" },
              dataSources: { [Pt]: (e) => `Data source list item ${e}` },
            },
            EditDataSource: {
              url: { "9.5.0": (e) => `/datasources/edit/${e}` },
              settings: { "9.5.0": "Datasource settings page basic settings" },
            },
            AddDataSource: {
              url: { [Pt]: "/datasources/new" },
              dataSourcePluginsV2: {
                "9.3.1": (e) => `Add new data source ${e}`,
                [Pt]: (e) => `Data source plugin item ${e}`,
              },
            },
            ConfirmModal: {
              delete: {
                "10.0.0": "data-testid Confirm Modal Danger Button",
                [Pt]: "Confirm Modal Danger Button",
              },
              input: { "12.2.0": "data-testid Confirm Modal Input" },
            },
            SecretsManagement: { SecretForm: { "12.2.0": "data-testid Secret Form" } },
            AddDashboard: {
              url: { [Pt]: "/dashboard/new" },
              itemButton: { "9.5.0": (e) => `data-testid ${e}` },
              addNewPanel: {
                "11.1.0": "data-testid Add new panel",
                "8.0.0": "Add new panel",
                [Pt]: "Add new panel",
              },
              itemButtonAddViz: { [Pt]: "Add new visualization menu item" },
              addNewRow: { "11.1.0": "data-testid Add new row", [Pt]: "Add new row" },
              addNewPanelLibrary: {
                "11.1.0": "data-testid Add new panel from panel library",
                [Pt]: "Add new panel from panel library",
              },
              Settings: {
                Annotations: {
                  List: { url: { [Pt]: "/dashboard/new?orgId=1&editview=annotations" } },
                  Edit: {
                    url: { [Pt]: (e) => `/dashboard/new?editview=annotations&editIndex=${e}` },
                  },
                },
                Variables: {
                  List: {
                    url: {
                      "11.3.0": "/dashboard/new?orgId=1&editview=variables",
                      [Pt]: "/dashboard/new?orgId=1&editview=templating",
                    },
                  },
                  Edit: {
                    url: {
                      "11.3.0": (e) => `/dashboard/new?orgId=1&editview=variables&editIndex=${e}`,
                      [Pt]: (e) => `/dashboard/new?orgId=1&editview=templating&editIndex=${e}`,
                    },
                  },
                },
              },
            },
            ImportDashboard: { url: { [Pt]: "/dashboard/import" } },
            Dashboard: {
              url: { [Pt]: (e) => `/d/${e}` },
              DashNav: {
                nav: { [Pt]: "Dashboard navigation" },
                navV2: { [Pt]: "data-testid Dashboard navigation" },
                publicDashboardTag: { "9.1.0": "data-testid public dashboard tag" },
                shareButton: { "10.4.0": "data-testid share-button" },
                scrollContainer: { "11.1.0": "data-testid Dashboard canvas scroll container" },
                newShareButton: {
                  container: { "11.1.0": "data-testid new share button" },
                  shareLink: { "11.1.0": "data-testid new share link-button" },
                  arrowMenu: { "11.1.0": "data-testid new share button arrow menu" },
                  menu: {
                    container: { "11.1.0": "data-testid new share button menu" },
                    shareInternally: { "11.1.0": "data-testid new share button share internally" },
                    shareExternally: { "11.1.1": "data-testid new share button share externally" },
                    shareSnapshot: { "11.2.0": "data-testid new share button share snapshot" },
                  },
                },
                NewExportButton: {
                  container: { "11.2.0": "data-testid new export button" },
                  arrowMenu: { "11.2.0": "data-testid new export button arrow menu" },
                  Menu: {
                    container: { "11.2.0": "data-testid new export button menu" },
                    exportAsJson: { "11.2.0": "data-testid new export button export as json" },
                    exportAsImage: { "12.1.0": "data-testid new export button export as image" },
                  },
                },
                playlistControls: {
                  prev: { "11.0.0": "data-testid playlist previous dashboard button" },
                  stop: { "11.0.0": "data-testid playlist stop dashboard button" },
                  next: { "11.0.0": "data-testid playlist next dashboard button" },
                },
              },
              Controls: { "11.1.0": "data-testid dashboard controls" },
              SubMenu: {
                submenu: { [Pt]: "Dashboard submenu" },
                submenuItem: { [Pt]: "data-testid template variable" },
                submenuItemLabels: {
                  [Pt]: (e) => `data-testid Dashboard template variables submenu Label ${e}`,
                },
                submenuItemValueDropDownValueLinkTexts: {
                  [Pt]: (e) =>
                    `data-testid Dashboard template variables Variable Value DropDown value link text ${e}`,
                },
                submenuItemValueDropDownDropDown: { [Pt]: "Variable options" },
                submenuItemValueDropDownOptionTexts: {
                  [Pt]: (e) =>
                    `data-testid Dashboard template variables Variable Value DropDown option text ${e}`,
                },
                Annotations: {
                  annotationsWrapper: { "10.0.0": "data-testid annotation-wrapper" },
                  annotationLabel: {
                    "10.0.0": (e) => `data-testid Dashboard annotations submenu Label ${e}`,
                  },
                  annotationToggle: {
                    "10.0.0": (e) => `data-testid Dashboard annotations submenu Toggle ${e}`,
                  },
                },
              },
              Settings: {
                Actions: { close: { "9.5.0": "data-testid dashboard-settings-close" } },
                General: {
                  deleteDashBoard: {
                    "11.1.0": "data-testid Dashboard settings page delete dashboard button",
                  },
                  sectionItems: { [Pt]: (e) => `Dashboard settings section item ${e}` },
                  saveDashBoard: { [Pt]: "Dashboard settings aside actions Save button" },
                  saveAsDashBoard: { [Pt]: "Dashboard settings aside actions Save As button" },
                  title: { "11.2.0": "General" },
                },
                Annotations: {
                  Edit: { urlParams: { [Pt]: (e) => `editview=annotations&editIndex=${e}` } },
                  List: {
                    url: { [Pt]: (e) => `/d/${e}?editview=annotations` },
                    addAnnotationCTAV2: {
                      [Pt]: "data-testid Call to action button Add annotation query",
                    },
                    annotations: { "10.4.0": "data-testid list-annotations" },
                  },
                  Settings: {
                    name: {
                      "11.1.0": "data-testid Annotations settings name input",
                      [Pt]: "Annotations settings name input",
                    },
                  },
                  NewAnnotation: {
                    panelFilterSelect: { "10.0.0": "data-testid annotations-panel-filter" },
                    showInLabel: { "11.1.0": "data-testid show-in-label" },
                    previewInDashboard: { "10.0.0": "data-testid annotations-preview" },
                    delete: { "10.4.0": "data-testid annotations-delete" },
                    apply: { "10.4.0": "data-testid annotations-apply" },
                    enable: { "10.4.0": "data-testid annotation-enable" },
                    hide: { "10.4.0": "data-testid annotation-hide" },
                  },
                },
                Variables: {
                  List: {
                    url: {
                      "11.3.0": (e) => `/d/${e}?editview=variables`,
                      [Pt]: (e) => `/d/${e}?editview=templating`,
                    },
                    addVariableCTAV2: { [Pt]: "data-testid Call to action button Add variable" },
                    newButton: { [Pt]: "Variable editor New variable button" },
                    table: { [Pt]: "Variable editor Table" },
                    tableRowNameFields: { [Pt]: (e) => `Variable editor Table Name field ${e}` },
                    tableRowDefinitionFields: {
                      "10.1.0": (e) => `Variable editor Table Definition field ${e}`,
                    },
                    tableRowArrowUpButtons: {
                      [Pt]: (e) => `Variable editor Table ArrowUp button ${e}`,
                    },
                    tableRowArrowDownButtons: {
                      [Pt]: (e) => `Variable editor Table ArrowDown button ${e}`,
                    },
                    tableRowDuplicateButtons: {
                      [Pt]: (e) => `Variable editor Table Duplicate button ${e}`,
                    },
                    tableRowRemoveButtons: {
                      [Pt]: (e) => `Variable editor Table Remove button ${e}`,
                    },
                  },
                  Edit: {
                    urlParams: {
                      "11.3.0": (e) => `editview=variables&editIndex=${e}`,
                      [Pt]: (e) => `editview=templating&editIndex=${e}`,
                    },
                    General: {
                      headerLink: { [Pt]: "Variable editor Header link" },
                      modeLabelNew: { [Pt]: "Variable editor Header mode New" },
                      modeLabelEdit: { [Pt]: "Variable editor Header mode Edit" },
                      generalNameInput: { [Pt]: "Variable editor Form Name field" },
                      generalNameInputV2: { [Pt]: "data-testid Variable editor Form Name field" },
                      generalTypeSelect: { [Pt]: "Variable editor Form Type select" },
                      generalTypeSelectV2: { [Pt]: "data-testid Variable editor Form Type select" },
                      generalLabelInput: { [Pt]: "Variable editor Form Label field" },
                      generalLabelInputV2: { [Pt]: "data-testid Variable editor Form Label field" },
                      generalHideSelect: { [Pt]: "Variable editor Form Hide select" },
                      generalHideSelectV2: { [Pt]: "data-testid Variable editor Form Hide select" },
                      selectionOptionsAllowCustomValueSwitch: {
                        [Pt]: "data-testid Variable editor Form Allow Custom Value switch",
                      },
                      selectionOptionsMultiSwitch: {
                        "10.4.0": "data-testid Variable editor Form Multi switch",
                        [Pt]: "Variable editor Form Multi switch",
                      },
                      selectionOptionsIncludeAllSwitch: {
                        "10.4.0": "data-testid Variable editor Form IncludeAll switch",
                        [Pt]: "Variable editor Form IncludeAll switch",
                      },
                      selectionOptionsCustomAllInput: {
                        "10.4.0": "data-testid Variable editor Form IncludeAll field",
                        [Pt]: "Variable editor Form IncludeAll field",
                      },
                      previewOfValuesOption: {
                        "10.4.0": "data-testid Variable editor Preview of Values option",
                        [Pt]: "Variable editor Preview of Values option",
                      },
                      submitButton: {
                        "10.4.0": "data-testid Variable editor Run Query button",
                        [Pt]: "Variable editor Submit button",
                      },
                      applyButton: { "9.3.0": "data-testid Variable editor Apply button" },
                    },
                    QueryVariable: {
                      closeButton: { [Pt]: "data-testid Query Variable editor close button" },
                      editor: { [Pt]: "data-testid Query Variable editor" },
                      previewButton: { [Pt]: "data-testid Query Variable editor preview button" },
                      queryOptionsDataSourceSelect: {
                        "10.4.0": "data-testid Select a data source",
                        "10.0.0": "data-testid Data source picker select container",
                        [Pt]: "Data source picker select container",
                      },
                      queryOptionsOpenButton: {
                        [Pt]: "data-testid Query Variable editor open button",
                      },
                      queryOptionsRefreshSelect: {
                        [Pt]: "Variable editor Form Query Refresh select",
                      },
                      queryOptionsRefreshSelectV2: {
                        [Pt]: "data-testid Variable editor Form Query Refresh select",
                      },
                      queryOptionsRegExInput: { [Pt]: "Variable editor Form Query RegEx field" },
                      queryOptionsRegExInputV2: {
                        [Pt]: "data-testid Variable editor Form Query RegEx field",
                      },
                      queryOptionsSortSelect: { [Pt]: "Variable editor Form Query Sort select" },
                      queryOptionsSortSelectV2: {
                        [Pt]: "data-testid Variable editor Form Query Sort select",
                      },
                      queryOptionsQueryInput: {
                        "10.4.0":
                          "data-testid Variable editor Form Default Variable Query Editor textarea",
                      },
                      queryOptionsStaticOptionsToggle: {
                        [Pt]: "Variable editor Form Query Static Options toggle",
                      },
                      queryOptionsStaticOptionsOrderDropdown: {
                        [Pt]: "Variable editor Form Query Static Options Order dropdown",
                      },
                      valueGroupsTagsEnabledSwitch: {
                        [Pt]: "Variable editor Form Query UseTags switch",
                      },
                      valueGroupsTagsTagsQueryInput: {
                        [Pt]: "Variable editor Form Query TagsQuery field",
                      },
                      valueGroupsTagsTagsValuesQueryInput: {
                        [Pt]: "Variable editor Form Query TagsValuesQuery field",
                      },
                    },
                    ConstantVariable: {
                      constantOptionsQueryInput: {
                        [Pt]: "Variable editor Form Constant Query field",
                      },
                      constantOptionsQueryInputV2: {
                        [Pt]: "data-testid Variable editor Form Constant Query field",
                      },
                    },
                    DatasourceVariable: {
                      datasourceSelect: { [Pt]: "data-testid datasource variable datasource type" },
                      nameFilter: {
                        [Pt]: "data-testid datasource variable datasource name filter",
                      },
                    },
                    TextBoxVariable: {
                      textBoxOptionsQueryInput: {
                        [Pt]: "Variable editor Form TextBox Query field",
                      },
                      textBoxOptionsQueryInputV2: {
                        [Pt]: "data-testid Variable editor Form TextBox Query field",
                      },
                    },
                    CustomVariable: {
                      customValueInput: { [Pt]: "data-testid custom-variable-input" },
                      optionsOpenButton: {
                        [Pt]: "data-testid custom-variable-options-open-button",
                      },
                      closeButton: { [Pt]: "data-testid custom-variable-close-button" },
                    },
                    IntervalVariable: {
                      intervalsValueInput: {
                        [Pt]: "data-testid interval variable intervals input",
                      },
                      autoEnabledCheckbox: {
                        "10.4.0": "data-testid interval variable auto value checkbox",
                      },
                      stepCountIntervalSelect: {
                        "10.4.0": "data-testid interval variable step count input",
                      },
                      minIntervalInput: {
                        "10.4.0": "data-testid interval variable mininum interval input",
                      },
                    },
                    GroupByVariable: {
                      dataSourceSelect: { "10.4.0": "data-testid Select a data source" },
                      infoText: { "10.4.0": "data-testid group by variable info text" },
                      modeToggle: { "10.4.0": "data-testid group by variable mode toggle" },
                    },
                    AdHocFiltersVariable: {
                      datasourceSelect: { "10.4.0": "data-testid Select a data source" },
                      infoText: { "10.4.0": "data-testid ad-hoc filters variable info text" },
                      modeToggle: { "11.0.0": "data-testid ad-hoc filters variable mode toggle" },
                    },
                    SwitchVariable: {
                      valuePairTypeSelect: {
                        "12.3.0": "data-testid switch variable value pair type select",
                      },
                      enabledValueInput: {
                        "12.3.0": "data-testid switch variable enabled value input",
                      },
                      disabledValueInput: {
                        "12.3.0": "data-testid switch variable disabled value input",
                      },
                    },
                    StaticOptionsEditor: {
                      addButton: {
                        [Pt]: "data-testid Variable editor Form Static Options Add button",
                      },
                      labelInput: {
                        [Pt]: "data-testid Variable editor Form Static Options Label input",
                      },
                      valueInput: {
                        [Pt]: "data-testid Variable editor Form Static Options Value input",
                      },
                      moveButton: {
                        [Pt]: "data-testid Variable editor Form Static Options Move button",
                      },
                      deleteButton: {
                        [Pt]: "data-testid Variable editor Form Static Options Delete button",
                      },
                      row: { [Pt]: "data-testid Variable editor Form Static Options Row" },
                    },
                  },
                },
              },
              Annotations: { marker: { "10.0.0": "data-testid annotation-marker" } },
              Rows: {
                Repeated: {
                  ConfigSection: {
                    warningMessage: { "10.2.0": "data-testid Repeated rows warning message" },
                  },
                },
              },
            },
            Dashboards: {
              url: { [Pt]: "/dashboards" },
              dashboards: { "10.2.0": (e) => `Dashboard search item ${e}` },
              toggleView: { [Pt]: "data-testid radio-button" },
            },
            SaveDashboardAsModal: {
              newName: { "10.2.0": "Save dashboard title field" },
              save: { "10.2.0": "Save dashboard button" },
            },
            SaveDashboardModal: {
              save: { "10.2.0": "Dashboard settings Save Dashboard Modal Save button" },
              saveVariables: {
                "10.2.0": "Dashboard settings Save Dashboard Modal Save variables checkbox",
              },
              saveTimerange: {
                "10.2.0": "Dashboard settings Save Dashboard Modal Save timerange checkbox",
              },
              saveRefresh: {
                "11.1.0": "Dashboard settings Save Dashboard Modal Save refresh checkbox",
              },
              variablesWarningAlert: {
                "12.2.0":
                  "Dashboard settings Save Dashboard Modal Save variables Variables With Errors Warning Alert",
              },
            },
            SharePanelModal: { linkToRenderedImage: { [Pt]: "Link to rendered image" } },
            ShareDashboardModal: {
              PublicDashboard: {
                WillBePublicCheckbox: {
                  "9.1.0": "data-testid public dashboard will be public checkbox",
                },
                LimitedDSCheckbox: {
                  "9.1.0": "data-testid public dashboard limited datasources checkbox",
                },
                CostIncreaseCheckbox: {
                  "9.1.0": "data-testid public dashboard cost may increase checkbox",
                },
                PauseSwitch: { "9.5.0": "data-testid public dashboard pause switch" },
                EnableAnnotationsSwitch: {
                  "9.3.0": "data-testid public dashboard on off switch for annotations",
                },
                CreateButton: { "9.5.0": "data-testid public dashboard create button" },
                DeleteButton: { "9.3.0": "data-testid public dashboard delete button" },
                CopyUrlInput: { "9.1.0": "data-testid public dashboard copy url input" },
                CopyUrlButton: { "9.1.0": "data-testid public dashboard copy url button" },
                SettingsDropdown: { "10.1.0": "data-testid public dashboard settings dropdown" },
                TemplateVariablesWarningAlert: {
                  "9.1.0": "data-testid public dashboard disabled template variables alert",
                },
                UnsupportedDataSourcesWarningAlert: {
                  "9.5.0": "data-testid public dashboard unsupported data sources alert",
                },
                NoUpsertPermissionsWarningAlert: {
                  "9.5.0": "data-testid public dashboard no upsert permissions alert",
                },
                EnableTimeRangeSwitch: {
                  "9.4.0": "data-testid public dashboard on off switch for time range",
                },
                EmailSharingConfiguration: {
                  Container: { "9.5.0": "data-testid email sharing config container" },
                  ShareType: { "9.5.0": "data-testid public dashboard share type" },
                  EmailSharingInput: {
                    "9.5.0": "data-testid public dashboard email sharing input",
                  },
                  EmailSharingInviteButton: {
                    "9.5.0": "data-testid public dashboard email sharing invite button",
                  },
                  EmailSharingList: { "9.5.0": "data-testid public dashboard email sharing list" },
                  DeleteEmail: { "9.5.0": "data-testid public dashboard delete email button" },
                  ReshareLink: { "9.5.0": "data-testid public dashboard reshare link button" },
                },
              },
              SnapshotScene: {
                url: { "11.1.0": (e) => `/dashboard/snapshot/${e}` },
                PublishSnapshot: { "11.1.0": "data-testid publish snapshot button" },
                CopyUrlButton: { "11.1.0": "data-testid snapshot copy url button" },
                CopyUrlInput: { "11.1.0": "data-testid snapshot copy url input" },
              },
            },
            ShareDashboardDrawer: {
              ShareInternally: {
                container: { "11.3.0": "data-testid share internally drawer container" },
                lockTimeRangeSwitch: {
                  "11.3.0": "data-testid share internally lock time range switch",
                },
                shortenUrlSwitch: { "11.3.0": "data-testid share internally shorten url switch" },
                copyUrlButton: { "11.3.0": "data-testid share internally copy url button" },
                SharePanel: {
                  preview: {
                    "11.5.0": "data-testid share panel internally image generation preview",
                  },
                  widthInput: { "11.5.0": "data-testid share panel internally width input" },
                  heightInput: { "11.5.0": "data-testid share panel internally height input" },
                  scaleFactorInput: {
                    "11.5.0": "data-testid share panel internally scale factor input",
                  },
                  generateImageButton: {
                    "11.5.0": "data-testid share panel internally generate image button",
                  },
                  downloadImageButton: {
                    "11.5.0": "data-testid share panel internally download image button",
                  },
                },
              },
              ShareExternally: {
                container: { "11.3.0": "data-testid share externally drawer container" },
                publicAlert: { "11.3.0": "data-testid public share alert" },
                emailSharingAlert: { "11.3.0": "data-testid email share alert" },
                shareTypeSelect: { "11.3.0": "data-testid share externally share type select" },
                Creation: {
                  PublicShare: {
                    createButton: { "11.3.0": "data-testid public share dashboard create button" },
                    cancelButton: { "11.3.0": "data-testid public share dashboard cancel button" },
                  },
                  EmailShare: {
                    createButton: { "11.3.0": "data-testid email share dashboard create button" },
                    cancelButton: { "11.3.0": "data-testid email share dashboard cancel button" },
                  },
                  willBePublicCheckbox: {
                    "11.3.0": "data-testid share dashboard will be public checkbox",
                  },
                },
                Configuration: {
                  enableTimeRangeSwitch: {
                    "11.3.0": "data-testid share externally enable time range switch",
                  },
                  enableAnnotationsSwitch: {
                    "11.3.0": "data-testid share externally enable annotations switch",
                  },
                  copyUrlButton: { "11.3.0": "data-testid share externally copy url button" },
                  revokeAccessButton: {
                    "11.3.0": "data-testid share externally revoke access button",
                  },
                  toggleAccessButton: {
                    "11.3.0": "data-testid share externally pause or resume access button",
                  },
                },
              },
              ShareSnapshot: {
                url: { "11.3.0": (e) => `/dashboard/snapshot/${e}` },
                container: { "11.3.0": "data-testid share snapshot drawer container" },
                publishSnapshot: { "11.3.0": "data-testid share snapshot publish button" },
                copyUrlButton: { "11.3.0": "data-testid share snapshot copy url button" },
              },
            },
            ExportDashboardDrawer: {
              ExportAsJson: {
                container: { "11.3.0": "data-testid export as json drawer container" },
                codeEditor: { "11.3.0": "data-testid export as json code editor" },
                exportExternallyToggle: {
                  "11.3.0": "data-testid export as json externally switch",
                },
                saveToFileButton: { "11.3.0": "data-testid export as json save to file button" },
                copyToClipboardButton: {
                  "11.3.0": "data-testid export as json copy to clipboard button",
                },
                cancelButton: { "11.3.0": "data-testid export as json cancel button" },
              },
            },
            PublicDashboard: {
              page: { "9.5.0": "public-dashboard-page" },
              NotAvailable: {
                container: { "9.5.0": "public-dashboard-not-available" },
                title: { "9.5.0": "public-dashboard-title" },
                pausedDescription: { "9.5.0": "public-dashboard-paused-description" },
              },
              footer: { "11.0.0": "public-dashboard-footer" },
            },
            PublicDashboardScene: {
              loadingPage: { "11.0.0": "public-dashboard-scene-loading-page" },
              page: { "11.0.0": "public-dashboard-scene-page" },
              controls: { "11.0.0": "public-dashboard-controls" },
            },
            RequestViewAccess: {
              form: { "9.5.0": "request-view-access-form" },
              recipientInput: { "9.5.0": "request-view-access-recipient-input" },
              submitButton: { "9.5.0": "request-view-access-submit-button" },
            },
            PublicDashboardConfirmAccess: {
              submitButton: { "10.2.0": "data-testid confirm-access-submit-button" },
            },
            Explore: {
              url: { [Pt]: "/explore" },
              General: {
                container: { [Pt]: "data-testid Explore" },
                graph: { [Pt]: "Explore Graph" },
                table: { [Pt]: "Explore Table" },
                scrollView: { "9.0.0": "data-testid explorer scroll view" },
                addFromQueryLibrary: {
                  "11.5.0": "data-testid explore add from query library button",
                },
              },
              QueryHistory: { container: { "11.1.0": "data-testid QueryHistory" } },
            },
            SoloPanel: { url: { [Pt]: (e) => `/d-solo/${e}` } },
            PluginsList: {
              page: { [Pt]: "Plugins list page" },
              list: { [Pt]: "Plugins list" },
              listItem: { [Pt]: "Plugins list item" },
              signatureErrorNotice: {
                "10.3.0": "data-testid Unsigned plugins notice",
                [Pt]: "Unsigned plugins notice",
              },
            },
            PluginPage: {
              page: { [Pt]: "Plugin page" },
              signatureInfo: {
                "10.3.0": "data-testid Plugin signature info",
                [Pt]: "Plugin signature info",
              },
              disabledInfo: {
                "10.3.0": "data-testid Plugin disabled info",
                [Pt]: "Plugin disabled info",
              },
            },
            PlaylistForm: {
              name: { [Pt]: "Playlist name" },
              interval: { [Pt]: "Playlist interval" },
              itemDelete: { "10.2.0": "data-testid playlist-form-delete-item" },
            },
            BrowseDashboards: {
              table: {
                body: { "10.2.0": "data-testid browse-dashboards-table" },
                row: { "10.2.0": (e) => `data-testid browse dashboards row ${e}` },
                checkbox: { "10.0.0": (e) => `data-testid ${e} checkbox` },
              },
              NewFolderForm: {
                form: { "10.2.0": "data-testid new folder form" },
                nameInput: { "10.2.0": "data-testid new-folder-name-input" },
                createButton: { "10.2.0": "data-testid new-folder-create-button" },
              },
            },
            SearchDashboards: { table: { "10.2.0": "Search results table" } },
            Search: {
              url: { "9.3.0": "/?search=openn" },
              FolderView: { url: { "9.3.0": "/?search=open&layout=folders" } },
            },
            PublicDashboards: {
              ListItem: {
                linkButton: { "9.3.0": "public-dashboard-link-button" },
                configButton: { "9.3.0": "public-dashboard-configuration-button" },
                trashcanButton: { "9.3.0": "public-dashboard-remove-button" },
                pauseSwitch: { "10.1.0": "data-testid public dashboard pause switch" },
              },
            },
            UserListPage: {
              tabs: {
                allUsers: { "10.0.0": "data-testid all-users-tab" },
                orgUsers: { "10.0.0": "data-testid org-users-tab" },
                anonUserDevices: { "10.2.3": "data-testid anon-user-devices-tab" },
                publicDashboardsUsers: { "10.0.0": "data-testid public-dashboards-users-tab" },
                users: { "10.0.0": "data-testid users-tab" },
              },
              org: { url: { "10.2.0": "/admin/users", "9.5.0": "/org/users" } },
              admin: { url: { "9.5.0": "/admin/users" } },
              publicDashboards: {
                container: { "11.1.0": "data-testid public-dashboards-users-list" },
              },
              UserListAdminPage: { container: { "10.0.0": "data-testid user-list-admin-page" } },
              UsersListPage: { container: { "10.0.0": "data-testid users-list-page" } },
              UserAnonListPage: { container: { "10.4.0": "data-testid user-anon-list-page" } },
              UsersListPublicDashboardsPage: {
                container: { "10.0.0": "data-testid users-list-public-dashboards-page" },
                DashboardsListModal: {
                  listItem: { "10.0.0": (e) => `data-testid dashboards-list-item-${e}` },
                },
              },
            },
            ProfilePage: { url: { "10.2.0": "/profile" } },
            Plugin: { url: { [Pt]: (e) => `/plugins/${e}` } },
            MigrateToCloud: { url: { "11.2.0": "/admin/migrate-to-cloud" } },
          }),
          components: Rt(At),
        };
      var Vt = n(6089);
      const Mt = (e, t) => (e > t ? 1 : e < t ? -1 : 0),
        Lt = 1 / 0,
        Ft = (e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        jt = "eexxaacctt",
        Nt = /\p{P}/gu,
        Bt = ["en", { numeric: !0, sensitivity: "base" }],
        zt = (e, t, n) => e.replace("A-Z", t).replace("a-z", n),
        $t = {
          unicode: !1,
          alpha: null,
          interSplit: "[^A-Za-z\\d']+",
          intraSplit: "[a-z][A-Z]",
          interBound: "[^A-Za-z\\d]",
          intraBound: "[A-Za-z]\\d|\\d[A-Za-z]|[a-z][A-Z]",
          interLft: 0,
          interRgt: 0,
          interChars: ".",
          interIns: Lt,
          intraChars: "[a-z\\d']",
          intraIns: null,
          intraContr: "'[a-z]{1,2}\\b",
          intraMode: 0,
          intraSlice: [1, Lt],
          intraSub: null,
          intraTrn: null,
          intraDel: null,
          intraFilt: (e, t, n) => !0,
          toUpper: (e) => e.toLocaleUpperCase(),
          toLower: (e) => e.toLocaleLowerCase(),
          compare: null,
          sort: (e, t, n, r = Mt) => {
            let {
              idx: a,
              chars: i,
              terms: o,
              interLft2: s,
              interLft1: l,
              start: u,
              intraIns: c,
              interIns: d,
              cases: p,
            } = e;
            return a
              .map((e, t) => t)
              .sort(
                (e, n) =>
                  i[n] - i[e] ||
                  c[e] - c[n] ||
                  o[n] + s[n] + 0.5 * l[n] - (o[e] + s[e] + 0.5 * l[e]) ||
                  d[e] - d[n] ||
                  u[e] - u[n] ||
                  p[n] - p[e] ||
                  r(t[a[e]], t[a[n]]),
              );
          },
        },
        Wt = (e, t) => (0 == t ? "" : 1 == t ? e + "??" : t == Lt ? e + "*?" : e + `{0,${t}}?`),
        Ht = "(?:\\b|_)";
      function Ut(e) {
        e = Object.assign({}, $t, e);
        let {
          unicode: t,
          interLft: n,
          interRgt: r,
          intraMode: a,
          intraSlice: i,
          intraIns: o,
          intraSub: s,
          intraTrn: l,
          intraDel: u,
          intraContr: c,
          intraSplit: d,
          interSplit: p,
          intraBound: h,
          interBound: f,
          intraChars: m,
          toUpper: g,
          toLower: v,
          compare: b,
        } = e;
        ((o ??= a),
          (s ??= a),
          (l ??= a),
          (u ??= a),
          (b ??= "undefined" == typeof Intl ? Mt : new Intl.Collator(...Bt).compare));
        let y = e.letters ?? e.alpha;
        if (null != y) {
          let e = g(y),
            t = v(y);
          ((p = zt(p, e, t)),
            (d = zt(d, e, t)),
            (f = zt(f, e, t)),
            (h = zt(h, e, t)),
            (m = zt(m, e, t)),
            (c = zt(c, e, t)));
        }
        let w = t ? "u" : "";
        const S = '".+?"',
          x = new RegExp(S, "gi" + w),
          _ = new RegExp(`(?:\\s+|^)-(?:${m}+|${S})`, "gi" + w);
        let { intraRules: C } = e;
        null == C &&
          (C = (e) => {
            let t = $t.intraSlice,
              n = 0,
              r = 0,
              a = 0,
              c = 0;
            if (/[^\d]/.test(e)) {
              let d = e.length;
              d <= 4
                ? d >= 3 && ((a = Math.min(l, 1)), 4 == d && (n = Math.min(o, 1)))
                : ((t = i), (n = o), (r = s), (a = l), (c = u));
            }
            return { intraSlice: t, intraIns: n, intraSub: r, intraTrn: a, intraDel: c };
          });
        let O = !!d,
          R = new RegExp(d, "g" + w),
          k = new RegExp(p, "g" + w),
          E = new RegExp("^" + p + "|" + p + "$", "g" + w),
          T = new RegExp(c, "gi" + w);
        const D = (e, t = !1) => {
            let n = [];
            ((e = (e = e.replace(x, (e) => (n.push(e), jt))).replace(E, "")),
              t || (e = v(e)),
              O && (e = e.replace(R, (e) => e[0] + " " + e[1])));
            let r = 0;
            return e
              .split(k)
              .filter((e) => "" != e)
              .map((e) => (e === jt ? n[r++] : e));
          },
          P = /[^\d]+|\d+/g,
          A = (t, i = 0, s = !1) => {
            let l = D(t);
            if (0 == l.length) return [];
            let u,
              c = Array(l.length).fill("");
            if (((l = l.map((e, t) => e.replace(T, (e) => ((c[t] = e), "")))), 1 == a))
              u = l.map((e, t) => {
                if ('"' === e[0]) return Ft(e.slice(1, -1));
                let n = "";
                for (let r of e.matchAll(P)) {
                  let e = r[0],
                    { intraSlice: a, intraIns: i, intraSub: o, intraTrn: s, intraDel: l } = C(e);
                  if (i + o + s + l == 0) n += e + c[t];
                  else {
                    let [r, u] = a,
                      d = e.slice(0, r),
                      p = e.slice(u),
                      h = e.slice(r, u);
                    1 == i && 1 == d.length && d != h[0] && (d += "(?!" + d + ")");
                    let f = h.length,
                      g = [e];
                    if (o)
                      for (let e = 0; e < f; e++)
                        g.push(d + h.slice(0, e) + m + h.slice(e + 1) + p);
                    if (s)
                      for (let e = 0; e < f - 1; e++)
                        h[e] != h[e + 1] &&
                          g.push(d + h.slice(0, e) + h[e + 1] + h[e] + h.slice(e + 2) + p);
                    if (l)
                      for (let e = 0; e < f; e++)
                        g.push(d + h.slice(0, e + 1) + "?" + h.slice(e + 1) + p);
                    if (i) {
                      let e = Wt(m, 1);
                      for (let t = 0; t < f; t++) g.push(d + h.slice(0, t) + e + h.slice(t) + p);
                    }
                    n += "(?:" + g.join("|") + ")" + c[t];
                  }
                }
                return n;
              });
            else {
              let e = Wt(m, o);
              (2 == i && o > 0 && (e = ")(" + e + ")("),
                (u = l.map((t, n) =>
                  '"' === t[0]
                    ? Ft(t.slice(1, -1))
                    : t
                        .split("")
                        .map(
                          (e, t, n) => (
                            1 == o &&
                              0 == t &&
                              n.length > 1 &&
                              e != n[t + 1] &&
                              (e += "(?!" + e + ")"),
                            e
                          ),
                        )
                        .join(e) + c[n],
                )));
            }
            let d = 2 == n ? Ht : "",
              p = 2 == r ? Ht : "",
              h = p + Wt(e.interChars, e.interIns) + d;
            return (
              i > 0
                ? s
                  ? (u = d + "(" + u.join(")" + p + "|" + d + "(") + ")" + p)
                  : ((u = "(" + u.join(")(" + h + ")(") + ")"),
                    (u = "(.??" + d + ")" + u + "(" + p + ".*)"))
                : ((u = u.join(h)), (u = d + u + p)),
              [new RegExp(u, "i" + w), l, c]
            );
          },
          I = (e, t, n) => {
            let [r] = A(t);
            if (null == r) return null;
            let a = [];
            if (null != n)
              for (let t = 0; t < n.length; t++) {
                let i = n[t];
                r.test(e[i]) && a.push(i);
              }
            else for (let t = 0; t < e.length; t++) r.test(e[t]) && a.push(t);
            return a;
          };
        let V = !!h,
          M = new RegExp(f, w),
          L = new RegExp(h, w);
        const F = (t, a, i) => {
            let [o, s, l] = A(i, 1),
              u = D(i, !0),
              [c] = A(i, 2),
              d = s.length,
              p = Array(d),
              h = Array(d);
            for (let e = 0; e < d; e++) {
              let t = s[e],
                n = u[e],
                r = '"' == t[0] ? t.slice(1, -1) : t + l[e],
                a = '"' == n[0] ? n.slice(1, -1) : n + l[e];
              ((p[e] = r), (h[e] = a));
            }
            let f = t.length,
              m = Array(f).fill(0),
              g = {
                idx: Array(f),
                start: m.slice(),
                chars: m.slice(),
                cases: m.slice(),
                terms: m.slice(),
                interIns: m.slice(),
                intraIns: m.slice(),
                interLft2: m.slice(),
                interRgt2: m.slice(),
                interLft1: m.slice(),
                interRgt1: m.slice(),
                ranges: Array(f),
              },
              b = 1 == n || 1 == r,
              y = 0;
            for (let i = 0; i < t.length; i++) {
              let s = a[t[i]],
                l = s.match(o),
                u = l.index + l[1].length,
                f = u,
                m = !1,
                S = 0,
                x = 0,
                _ = 0,
                C = 0,
                O = 0,
                R = 0,
                k = 0,
                E = 0,
                T = 0,
                D = [];
              for (let t = 0, a = 2; t < d; t++, a += 2) {
                let i = v(l[a]),
                  o = p[t],
                  c = h[t],
                  g = o.length,
                  y = i.length,
                  P = i == o;
                if ((l[a] == c && k++, !P && l[a + 1].length >= g)) {
                  let e = v(l[a + 1]).indexOf(o);
                  e > -1 &&
                    (D.push(f, y, e, g),
                    (f += j(l, a, e, g)),
                    (i = o),
                    (y = g),
                    (P = !0),
                    0 == t && (u = f));
                }
                if (b || P) {
                  let e = f - 1,
                    c = f + y,
                    d = !1,
                    p = !1;
                  if (-1 == e || M.test(s[e])) (P && S++, (d = !0));
                  else {
                    if (2 == n) {
                      m = !0;
                      break;
                    }
                    if (V && L.test(s[e] + s[e + 1])) (P && x++, (d = !0));
                    else if (1 == n) {
                      let e = l[a + 1],
                        n = f + y;
                      if (e.length >= g) {
                        let r,
                          c = 0,
                          p = !1,
                          h = new RegExp(o, "ig" + w);
                        for (; (r = h.exec(e)); ) {
                          c = r.index;
                          let e = n + c,
                            t = e - 1;
                          if (-1 == t || M.test(s[t])) {
                            (S++, (p = !0));
                            break;
                          }
                          if (L.test(s[t] + s[e])) {
                            (x++, (p = !0));
                            break;
                          }
                        }
                        p &&
                          ((d = !0),
                          D.push(f, y, c, g),
                          (f += j(l, a, c, g)),
                          (i = o),
                          (y = g),
                          (P = !0),
                          0 == t && (u = f));
                      }
                      if (!d) {
                        m = !0;
                        break;
                      }
                    }
                  }
                  if (c == s.length || M.test(s[c])) (P && _++, (p = !0));
                  else {
                    if (2 == r) {
                      m = !0;
                      break;
                    }
                    if (V && L.test(s[c - 1] + s[c])) (P && C++, (p = !0));
                    else if (1 == r) {
                      m = !0;
                      break;
                    }
                  }
                  P && ((O += g), d && p && R++);
                }
                if (
                  (y > g && (T += y - g), t > 0 && (E += l[a - 1].length), !e.intraFilt(o, i, f))
                ) {
                  m = !0;
                  break;
                }
                t < d - 1 && (f += y + l[a + 1].length);
              }
              if (!m) {
                ((g.idx[y] = t[i]),
                  (g.interLft2[y] = S),
                  (g.interLft1[y] = x),
                  (g.interRgt2[y] = _),
                  (g.interRgt1[y] = C),
                  (g.chars[y] = O),
                  (g.terms[y] = R),
                  (g.cases[y] = k),
                  (g.interIns[y] = E),
                  (g.intraIns[y] = T),
                  (g.start[y] = u));
                let e = s.match(c),
                  n = e.index + e[1].length,
                  r = D.length,
                  a = r > 0 ? 0 : 1 / 0,
                  o = r - 4;
                for (let t = 2; t < e.length; ) {
                  let r = e[t].length;
                  if (a <= o && D[a] == n) {
                    let r = D[a + 1],
                      i = D[a + 2],
                      o = D[a + 3],
                      s = t,
                      l = "";
                    for (let t = 0; t < r; s++) ((l += e[s]), (t += e[s].length));
                    (e.splice(t, s - t, l), (n += j(e, t, i, o)), (a += 4));
                  } else ((n += r), t++);
                }
                n = e.index + e[1].length;
                let l = (g.ranges[y] = []),
                  d = n,
                  p = n;
                for (let t = 2; t < e.length; t++) {
                  let r = e[t].length;
                  ((n += r), t % 2 == 0 ? (p = n) : r > 0 && (l.push(d, p), (d = p = n)));
                }
                (p > d && l.push(d, p), y++);
              }
            }
            if (y < t.length) for (let e in g) g[e] = g[e].slice(0, y);
            return g;
          },
          j = (e, t, n, r) => {
            let a = e[t] + e[t + 1].slice(0, n);
            return (
              (e[t - 1] += a),
              (e[t] = e[t + 1].slice(n, n + r)),
              (e[t + 1] = e[t + 1].slice(n + r)),
              a.length
            );
          };
        return {
          search: (...t) => {
            let n = ((t, n, r, a = 1e3, i) => {
              r = r ? (!0 === r ? 5 : r) : 0;
              let o = null,
                s = null,
                l = [];
              n = n.replace(_, (e) => {
                let t = e.trim().slice(1);
                return (
                  (t = '"' === t[0] ? Ft(t.slice(1, -1)) : t.replace(Nt, "")),
                  "" != t && l.push(t),
                  ""
                );
              });
              let u,
                c = D(n);
              if (l.length > 0) {
                if (((u = new RegExp(l.join("|"), "i" + w)), 0 == c.length)) {
                  let e = [];
                  for (let n = 0; n < t.length; n++) u.test(t[n]) || e.push(n);
                  return [e, null, null];
                }
              } else if (0 == c.length) return [null, null, null];
              if (r > 0) {
                let e = D(n);
                if (e.length > 1) {
                  let n = e.slice().sort((e, t) => t.length - e.length);
                  for (let e = 0; e < n.length; e++) {
                    if (0 == i?.length) return [[], null, null];
                    i = I(t, n[e], i);
                  }
                  if (e.length > r) return [i, null, null];
                  ((o = Gt(e).map((e) => e.join(" "))), (s = []));
                  let a = new Set();
                  for (let e = 0; e < o.length; e++)
                    if (a.size < i.length) {
                      let n = i.filter((e) => !a.has(e)),
                        r = I(t, o[e], n);
                      for (let e = 0; e < r.length; e++) a.add(r[e]);
                      s.push(r);
                    } else s.push([]);
                }
              }
              null == o && ((o = [n]), (s = [i?.length > 0 ? i : I(t, n)]));
              let d = null,
                p = null;
              if (
                (l.length > 0 && (s = s.map((e) => e.filter((e) => !u.test(t[e])))),
                s.reduce((e, t) => e + t.length, 0) <= a)
              ) {
                ((d = {}), (p = []));
                for (let n = 0; n < s.length; n++) {
                  let r = s[n];
                  if (null == r || 0 == r.length) continue;
                  let a = o[n],
                    i = F(r, t, a),
                    l = e.sort(i, t, a, b);
                  if (n > 0) for (let e = 0; e < l.length; e++) l[e] += p.length;
                  for (let e in i) d[e] = (d[e] ?? []).concat(i[e]);
                  p = p.concat(l);
                }
              }
              return [[].concat(...s), d, p];
            })(...t);
            return n;
          },
          split: D,
          filter: I,
          info: F,
          sort: e.sort,
        };
      }
      const qt = (() => {
        let e = {
            A: "ÁÀÃÂÄĄĂÅ",
            a: "áàãâäąăå",
            E: "ÉÈÊËĖĚ",
            e: "éèêëęě",
            I: "ÍÌÎÏĮİ",
            i: "íìîïįı",
            O: "ÓÒÔÕÖ",
            o: "óòôõö",
            U: "ÚÙÛÜŪŲŮŰ",
            u: "úùûüūųůű",
            C: "ÇČĆ",
            c: "çčć",
            D: "Ď",
            d: "ď",
            G: "Ğ",
            g: "ğ",
            L: "Ł",
            l: "ł",
            N: "ÑŃŇ",
            n: "ñńň",
            S: "ŠŚȘŞ",
            s: "šśșş",
            T: "ŢȚŤ",
            t: "ţțť",
            Y: "Ý",
            y: "ý",
            Z: "ŻŹŽ",
            z: "żźž",
          },
          t = {},
          n = "";
        for (let r in e)
          e[r].split("").forEach((e) => {
            ((n += e), (t[e] = r));
          });
        let r = new RegExp(`[${n}]`, "g"),
          a = (e) => t[e];
        return (e) => {
          if ("string" == typeof e) return e.replace(r, a);
          let t = Array(e.length);
          for (let n = 0; n < e.length; n++) t[n] = e[n].replace(r, a);
          return t;
        };
      })();
      function Gt(e) {
        let t,
          n,
          r = (e = e.slice()).length,
          a = [e.slice()],
          i = new Array(r).fill(0),
          o = 1;
        for (; o < r; )
          i[o] < o
            ? ((t = o % 2 && i[o]),
              (n = e[o]),
              (e[o] = e[t]),
              (e[t] = n),
              ++i[o],
              (o = 1),
              a.push(e.slice()))
            : ((i[o] = 0), ++o);
        return a;
      }
      const Qt = (e, t) => (t ? `<mark>${e}</mark>` : e),
        Kt = (e, t) => e + t;
      ((Ut.latinize = qt),
        (Ut.permute = (e) =>
          Gt([...Array(e.length).keys()])
            .sort((e, t) => {
              for (let n = 0; n < e.length; n++) if (e[n] != t[n]) return e[n] - t[n];
              return 0;
            })
            .map((t) => t.map((t) => e[t]))),
        (Ut.highlight = function (e, t, n = Qt, r = "", a = Kt) {
          r = a(r, n(e.substring(0, t[0]), !1)) ?? r;
          for (let i = 0; i < t.length; i += 2) {
            let o = t[i],
              s = t[i + 1];
            ((r = a(r, n(e.substring(o, s), !0)) ?? r),
              i < t.length - 3 && (r = a(r, n(e.substring(t[i + 1], t[i + 2]), !1)) ?? r));
          }
          return (r = a(r, n(e.substring(t[t.length - 1]), !1)) ?? r);
        }));
      const Yt = /[^ -~]/m,
        Zt = /^[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]+$/m,
        Xt = 5,
        Jt = 25,
        en = 5,
        tn = 1e4,
        nn = new Ut({ intraMode: 1 });
      function rn(e, t, n) {
        let r = [];
        if ("" === n) r = e;
        else if (Yt.test(n) || Zt.test(n) || n.length > Jt || nn.split(n).length > en)
          for (let a = 0; a < t.length; a++) {
            t[a].includes(n) && r.push(e[a]);
          }
        else {
          const [a, i, o] = nn.search(t, n, Xt, tn);
          (null == a ? void 0 : a.length) &&
            (r = i && o ? o.map((t) => e[i.idx[t]]) : a.map((t) => e[t]));
        }
        return r;
      }
      function an(e, t = !1) {
        let n = e;
        t && (n = [{ value: $e, label: ze }, ...n]);
        const r = n.map((e) => e.label);
        return (e) => rn(n, r, e);
      }
      const on = () => !0,
        sn = (e) => "$__all" !== e.value,
        ln = (e, t) =>
          e.length === t.filter(sn).length
            ? Ct.ToggleAllState.allSelected
            : 0 === e.length || (1 === e.length && e[0] && "$__all" === e[0].value)
              ? Ct.ToggleAllState.noneSelected
              : Ct.ToggleAllState.indeterminate;
      function un({ model: e, state: t }) {
        const {
            value: n,
            text: r,
            key: a,
            options: i,
            includeAll: o,
            isReadOnly: s,
            allowCustomValue: l = !0,
          } = t,
          [u, c] = (0, p.useState)(""),
          [d, h] = (0, p.useState)(!1),
          m = (function (e, t) {
            return { value: e, label: null != t ? t : String(e) };
          })(n, String(r)),
          g = ru.getQueryController(e),
          v = (0, p.useMemo)(() => an(i, o), [i, o])(u);
        return f().createElement(Ct.Select, {
          id: a,
          isValidNewOption: (e) => e.trim().length > 0,
          placeholder: (0, Pe.t)(
            "grafana-scenes.variables.variable-value-select.placeholder-select-value",
            "Select value",
          ),
          width: "auto",
          disabled: s,
          value: m,
          inputValue: u,
          allowCustomValue: l,
          virtualized: !0,
          filterOption: on,
          tabSelectsValue: !1,
          onInputChange: (t, { action: n }) =>
            "input-change" === n ? (c(t), e.onSearchChange && e.onSearchChange(t), t) : t,
          onOpenMenu: () => {
            d && c(String(r));
          },
          onCloseMenu: () => {
            c("");
          },
          options: v,
          "data-testid": It.pages.Dashboard.SubMenu.submenuItemValueDropDownValueLinkTexts(`${n}`),
          onChange: (t) => {
            (e.changeValueTo(t.value, t.label, !0),
              null == g || g.startProfile(ve),
              d !== t.__isNew__ && h(t.__isNew__));
          },
        });
      }
      function cn({ model: e, state: t }) {
        const {
            value: n,
            options: r,
            key: a,
            maxVisibleValues: i,
            noValueOnClear: o,
            includeAll: s,
            isReadOnly: l,
            allowCustomValue: u = !0,
          } = t,
          c = (0, p.useMemo)(() => ((0, V.isArray)(n) ? n : [n]), [n]),
          [d, h] = (0, p.useState)(c),
          [m, g] = (0, p.useState)(""),
          v = (0, p.useMemo)(() => an(r, s), [r, s]);
        (0, p.useEffect)(() => {
          h(c);
        }, [c]);
        const b = r.length > 0 ? "Select value" : "",
          y = v(m);
        return f().createElement(Ct.MultiSelect, {
          id: a,
          placeholder: b,
          width: "auto",
          inputValue: m,
          disabled: l,
          value: d,
          noMultiValueWrap: !0,
          maxVisibleValues: null != i ? i : 5,
          tabSelectsValue: !1,
          virtualized: !0,
          allowCustomValue: u,
          toggleAllOptions: { enabled: !0, optionsFilter: sn, determineToggleAllState: ln },
          options: y,
          closeMenuOnSelect: !1,
          components: { Option: dn },
          isClearable: !0,
          hideSelectedOptions: !1,
          onInputChange: (t, { action: n }) =>
            "input-change" === n
              ? (g(t), e.onSearchChange && e.onSearchChange(t), t)
              : "input-blur" === n
                ? (g(""), "")
                : m,
          onBlur: () => {
            e.changeValueTo(d, void 0, !0);
          },
          filterOption: on,
          "data-testid": It.pages.Dashboard.SubMenu.submenuItemValueDropDownValueLinkTexts(`${d}`),
          onChange: (t, n) => {
            ("clear" === n.action && o && e.changeValueTo([], void 0, !0),
              h(t.map((e) => e.value)));
          },
        });
      }
      const dn = ({
        children: e,
        data: t,
        innerProps: n,
        innerRef: r,
        isFocused: a,
        isSelected: i,
        indeterminate: o,
        renderOptionLabel: s,
      }) => {
        var l;
        const { onMouseMove: u, onMouseOver: c, ...d } = n,
          p = (0, Ct.useTheme2)(),
          h = (0, Ct.getSelectStyles)(p),
          m = (0, Ct.useStyles2)(pn);
        return f().createElement(
          "div",
          {
            ref: r,
            className: (0, Vt.cx)(h.option, a && h.optionFocused),
            ...d,
            "data-testid": "data-testid Select option",
            title: t.title,
          },
          f().createElement(
            "div",
            { className: m.checkbox },
            f().createElement(Ct.Checkbox, { indeterminate: o, value: i }),
          ),
          f().createElement(
            "div",
            {
              className: h.optionBody,
              "data-testid": It.pages.Dashboard.SubMenu.submenuItemValueDropDownOptionTexts(
                null != (l = t.label) ? l : String(t.value),
              ),
            },
            f().createElement("span", null, e),
          ),
        );
      };
      dn.displayName = "SelectMenuOptions";
      const pn = (e) => ({ checkbox: (0, Vt.css)({ marginRight: e.spacing(2) }) });
      function hn({ model: e }) {
        const t = e.useState();
        return t.isMulti
          ? f().createElement(cn, { model: e, state: t })
          : f().createElement(un, { model: e, state: t });
      }
      class fn {
        constructor(e) {
          ((this._sceneObject = e), (this._nextChangeShouldAddHistoryStep = !1));
        }
        getRestorableKey() {
          return `restorable-var-${this._sceneObject.state.name}`;
        }
        getKey() {
          return `var-${this._sceneObject.state.name}`;
        }
        getKeys() {
          return this._sceneObject.state.skipUrlSync
            ? []
            : [this.getKey(), this.getRestorableKey()];
        }
        getUrlState() {
          return this._sceneObject.state.skipUrlSync
            ? {}
            : {
                [this.getKey()]:
                  this._sceneObject.state.defaultValue && !this._sceneObject.state.restorable
                    ? [""]
                    : mn(this._sceneObject.state.value, this._sceneObject.state.text),
                [this.getRestorableKey()]: this._sceneObject.state.defaultValue
                  ? this._sceneObject.state.restorable
                    ? "true"
                    : "false"
                  : null,
              };
        }
        updateFromUrl(e) {
          let t = e[this.getKey()],
            n = e[this.getRestorableKey()];
          if (null != t) {
            this._sceneObject.isActive || (this._sceneObject.skipNextValidation = !0);
            const { values: e, texts: a } =
              ((r = t),
              (r = Array.isArray(r) ? r : [r]).reduce(
                (e, t) => {
                  const [n, r] = (null != t ? t : "").split(",");
                  return (e.values.push(Cl(n)), e.texts.push(Cl(null != r ? r : n)), e);
                },
                { values: [], texts: [] },
              ));
            if (this._sceneObject.state.defaultValue && ("false" === n || void 0 === n)) return;
            if ("false" === n) return void this._sceneObject.changeValueTo([], [], !1);
            this._sceneObject.changeValueTo(e, a);
          }
          var r;
        }
        performBrowserHistoryAction(e) {
          ((this._nextChangeShouldAddHistoryStep = !0),
            e(),
            (this._nextChangeShouldAddHistoryStep = !1));
        }
        shouldCreateHistoryStep(e) {
          return this._nextChangeShouldAddHistoryStep;
        }
      }
      function mn(e, t) {
        return (
          (e = Array.isArray(e) ? e : [e]),
          (t = Array.isArray(t) ? t : [t]),
          e.map((e, n) => {
            if (null == e) return "";
            e = String(e);
            let r = t[n];
            return ((r = null == r ? e : String(r)), Ol(e, r));
          })
        );
      }
      function gn(e) {
        const t = e.getRoot();
        return ut(t) ? t.enrichFiltersRequest(e) : null;
      }
      var vn,
        bn = (e) => {
          throw TypeError(e);
        },
        yn = (e, t, n) => t.has(e) || bn("Cannot " + n);
      class wn {
        constructor(e) {
          (((e, t, n) => {
            t.has(e)
              ? bn("Cannot add the same private member more than once")
              : t instanceof WeakSet
                ? t.add(e)
                : t.set(e, n);
          })(this, vn),
            (this.text = "__sceneObject"),
            (this.valueOf = () => {
              return (
                yn((e = this), (t = vn), "read from private field"),
                n ? n.call(e) : t.get(e)
              );
              var e, t, n;
            }),
            ((e, t, n) => {
              (yn(e, t, "write to private field"), t.set(e, n));
            })(this, vn, e));
        }
        toString() {}
        get value() {
          return this;
        }
      }
      function Sn(e) {
        return (function (e) {
          const t = e.match(/^(\d+)\.(\d+)\.(\d+)/);
          if (!t) return !1;
          const n = parseInt(t[1], 10),
            r = parseInt(t[2], 10),
            a = parseInt(t[3], 10);
          return 11 === n
            ? (0 === r && a >= 4) || (1 === r && a >= 2) || r > 1
            : 10 === n
              ? (4 === r && a >= 8) || r >= 5
              : n > 11;
        })(l.config.buildInfo.version)
          ? new wn(e)
          : { value: e, text: "__sceneObject" };
      }
      function xn(e) {
        const { model: t } = e,
          n = (0, Ct.useTheme2)(),
          r = _n(n),
          a = (0, Ct.getInputStyles)({ theme: n, invalid: !1 }),
          i = (0, V.isArray)(t.state.value) ? t.state.value : t.state.value ? [t.state.value] : [];
        let o = [];
        return (
          i &&
            i.length &&
            o.push(
              f().createElement(Ct.IconButton, {
                "aria-label": (0, Pe.t)(
                  "grafana-scenes.variables.default-group-by-custom-indicator-container.aria-label-clear",
                  "clear",
                ),
                key: "clear",
                name: "times",
                size: "md",
                className: r.clearIcon,
                onClick: (e) => {
                  (t.changeValueTo([], void 0, !0),
                    t.checkIfRestorable([]) && t.setState({ restorable: !0 }));
                },
              }),
            ),
          t.state.restorable &&
            o.push(
              f().createElement(Ct.IconButton, {
                onClick: (t) => {
                  e.model.restoreDefaultValues();
                },
                onKeyDownCapture: (t) => {
                  "Enter" === t.key && e.model.restoreDefaultValues();
                },
                key: "restore",
                name: "history",
                size: "md",
                className: r.clearIcon,
                tooltip: (0, Pe.t)(
                  "grafana-scenes.variables.default-group-by-custom-indicator-container.tooltip-restore-groupby-set-by-this-dashboard",
                  "Restore groupby set by this dashboard.",
                ),
              }),
            ),
          t.state.restorable ||
            o.push(
              f().createElement(
                Ct.Tooltip,
                {
                  key: "tooltip",
                  content: (0, Pe.t)(
                    "grafana-scenes.variables.default-group-by-custom-indicator-container.tooltip",
                    "Applied by default in this dashboard. If edited, it carries over to other dashboards.",
                  ),
                  placement: "bottom",
                },
                f().createElement(Ct.Icon, { name: "info-circle", size: "md" }),
              ),
            ),
          f().createElement(
            "div",
            {
              onMouseDown: (e) => {
                (e.preventDefault(), e.stopPropagation());
              },
              className: (0, Vt.cx)(a.suffix, (0, Vt.css)({ position: "relative" })),
            },
            o,
          )
        );
      }
      vn = new WeakMap();
      const _n = (e) => ({
          clearIcon: (0, Vt.css)({
            color: e.colors.action.disabledText,
            cursor: "pointer",
            "&:hover:before": { backgroundColor: "transparent" },
            "&:hover": { color: e.colors.text.primary },
          }),
        }),
        Cn = ({ keysApplicability: e, children: t }) => {
          var n, r;
          const a = (0, Ct.useTheme2)(),
            i = (0, Ct.getSelectStyles)(a),
            { disabledPill: o, strikethrough: s } = Tl(a),
            l = f().Children.toArray(t)[0];
          let u = !0;
          if (
            f().isValidElement(l) &&
            (null == (r = null == (n = l.props) ? void 0 : n.data) ? void 0 : r.value)
          ) {
            const t = l.props.data.value,
              n = null == e ? void 0 : e.find((e) => e.key === t);
            n && !n.applicable && (u = !1);
          }
          return f().createElement(
            "div",
            { className: (0, Vt.cx)(i.multiValueContainer, !u && (0, Vt.cx)(o, s)) },
            t,
          );
        };
      function On(e) {
        return "isInteractionTracker" in e;
      }
      class Rn extends P {
        constructor(e = {}, t) {
          (super(e),
            (this.renderProfiler = t),
            (this.isInteractionTracker = !0),
            t &&
              ((this.renderProfiler = t),
              this.renderProfiler.setInteractionCompleteHandler(e.onInteractionComplete)));
        }
        startInteraction(e) {
          var t;
          this.state.enableInteractionTracking &&
            (null == (t = this.renderProfiler) || t.startInteraction(e));
        }
        stopInteraction() {
          var e;
          null == (e = this.renderProfiler) || e.stopInteraction();
        }
      }
      function kn(e) {
        let t = e;
        for (; t; ) {
          if (t.state.$behaviors) for (const e of t.state.$behaviors) if (On(e)) return e;
          t = t.parent;
        }
      }
      class En extends Je {
        constructor(e) {
          (super({
            isMulti: !0,
            name: "",
            value: [],
            text: [],
            options: [],
            datasource: null,
            baseFilters: [],
            applyMode: "auto",
            layout: "horizontal",
            type: "groupby",
            ...e,
            noValueOnClear: !0,
          }),
            (this.isLazy = !0),
            (this._urlSync = new fn(this)),
            (this._activationHandler = () => (
              this._verifyApplicability(),
              this.state.defaultValue &&
                this.checkIfRestorable(this.state.value) &&
                this.setState({ restorable: !0 }),
              () => {
                this.state.defaultValue && this.restoreDefaultValues();
              }
            )),
            (this._getKeys = async (e) => {
              var t, n, r;
              const a = await (null == (n = (t = this.state).getTagKeysProvider)
                ? void 0
                : n.call(t, this, null));
              if (a && a.replace) return a.values;
              if (this.state.defaultOptions)
                return this.state.defaultOptions.concat(
                  Rl(null != (r = null == a ? void 0 : a.values) ? r : []),
                );
              if (!e.getTagKeys) return [];
              const i = wl(this),
                o = this.state.baseFilters || [],
                s = ru.getTimeRange(this).state.value,
                l = await e.getTagKeys({
                  filters: o,
                  queries: i,
                  timeRange: s,
                  scopes: ru.getScopes(this),
                  ...gn(this),
                });
              kl(l) && this.setState({ error: l.error.message });
              let u = Rl(l);
              a && (u = u.concat(Rl(a.values)));
              const c = this.state.tagKeyRegexFilter;
              return (c && (u = u.filter((e) => e.text.match(c))), u);
            }),
            this.state.defaultValue &&
              this.changeValueTo(this.state.defaultValue.value, this.state.defaultValue.text, !1),
            "auto" === this.state.applyMode &&
              this.addActivationHandler(() => (_t.add(this), () => _t.delete(this))),
            this.addActivationHandler(this._activationHandler));
        }
        validateAndUpdate() {
          return this.getValueOptions({}).pipe(
            (0, m.map)((e) => (this._updateValueGivenNewOptions(e), {})),
          );
        }
        _updateValueGivenNewOptions(e) {
          const { value: t, text: n } = this.state,
            r = { options: e, loading: !1, value: null != t ? t : [], text: null != n ? n : [] };
          this.setState(r);
        }
        getValueOptions(e) {
          return this.state.defaultOptions
            ? (0, m.of)(
                this.state.defaultOptions.map((e) => ({
                  label: e.text,
                  value: String(e.value),
                  group: e.group,
                })),
              )
            : (this.setState({ loading: !0, error: null }),
              (0, m.from)(vt(this.state.datasource, { __sceneObject: Sn(this) })).pipe(
                (0, m.mergeMap)((e) =>
                  (0, m.from)(this._getKeys(e)).pipe(
                    (0, m.tap)((e) => {
                      kl(e) && this.setState({ error: e.error.message });
                    }),
                    (0, m.map)((e) => Rl(e)),
                    (0, m.take)(1),
                    (0, m.mergeMap)((e) => {
                      const t = e.map((e) => ({
                        label: e.text,
                        value: e.value ? String(e.value) : e.text,
                        group: e.group,
                      }));
                      return (0, m.of)(t);
                    }),
                  ),
                ),
              ));
        }
        getApplicableKeys() {
          const { value: e, keysApplicability: t } = this.state,
            n = (0, V.isArray)(e) ? e : e ? [e] : [];
          if (!t || 0 === t.length) return n;
          return n.filter((e) => {
            const n = t.find((t) => t.key === e);
            return !n || !1 !== n.applicable;
          });
        }
        async _verifyApplicability() {
          const e = await vt(this.state.datasource, { __sceneObject: Sn(this) });
          if (!e.getDrilldownsApplicability) return;
          const t = wl(this),
            n = ru.getTimeRange(this).state.value,
            r = this.state.value,
            a = await e.getDrilldownsApplicability({
              groupByKeys: Array.isArray(r) ? r.map((e) => String(e)) : r ? [String(r)] : [],
              queries: t,
              timeRange: n,
              scopes: ru.getScopes(this),
              ...gn(this),
            });
          (0, V.isEqual)(a, this.state.keysApplicability) ||
            (this.setState({ keysApplicability: null != a ? a : void 0 }),
            this.publishEvent(new Oe(this), !0));
        }
        checkIfRestorable(e) {
          var t, n, r, a;
          const i = (0, V.isArray)(null == (t = this.state.defaultValue) ? void 0 : t.value)
              ? null == (n = this.state.defaultValue)
                ? void 0
                : n.value
              : (null == (r = this.state.defaultValue) ? void 0 : r.value)
                ? [null == (a = this.state.defaultValue) ? void 0 : a.value]
                : [],
            o = (0, V.isArray)(e) ? e : [e];
          return o.length !== i.length || !(0, V.isEqual)(o, i);
        }
        restoreDefaultValues() {
          (this.setState({ restorable: !1 }),
            this.state.defaultValue &&
              this.changeValueTo(this.state.defaultValue.value, this.state.defaultValue.text, !0));
        }
        getDefaultMultiState(e) {
          return { value: [], text: [] };
        }
      }
      En.Component = function ({ model: e }) {
        const {
            value: t,
            text: n,
            key: r,
            isMulti: a = !0,
            maxVisibleValues: i,
            noValueOnClear: o,
            options: s,
            includeAll: l,
            allowCustomValue: u = !0,
            defaultValue: c,
            keysApplicability: d,
          } = e.useState(),
          h = (0, p.useMemo)(() => {
            const e = (0, V.isArray)(t) ? t : [t],
              r = (0, V.isArray)(n) ? n : [n];
            return e.map((e, t) => {
              var n;
              return { value: e, label: String(null != (n = r[t]) ? n : e) };
            });
          }, [t, n]),
          [g, v] = (0, p.useState)(!1),
          [b, y] = (0, p.useState)(!1),
          [w, S] = (0, p.useState)(""),
          [x, _] = (0, p.useState)(h),
          C = (0, p.useMemo)(() => an(s, l), [s, l]),
          O = void 0 !== c;
        (0, p.useEffect)(() => {
          _(h);
        }, [h]);
        const R = (t, { action: n }) =>
            "input-change" === n
              ? (S(t), e.onSearchChange && e.onSearchChange(t), t)
              : "input-blur" === n
                ? (S(""), "")
                : w,
          k = (0, p.useMemo)(() => El(C(w).map(Dn)), [C, w]);
        return a
          ? f().createElement(Ct.MultiSelect, {
              "aria-label": (0, Pe.t)(
                "grafana-scenes.variables.group-by-variable-renderer.aria-label-group-by-selector",
                "Group by selector",
              ),
              "data-testid": `GroupBySelect-${r}`,
              id: r,
              placeholder: (0, Pe.t)(
                "grafana-scenes.variables.group-by-variable-renderer.placeholder-group-by-label",
                "Group by label",
              ),
              width: "auto",
              allowCustomValue: u,
              inputValue: w,
              value: x,
              noMultiValueWrap: !0,
              maxVisibleValues: null != i ? i : 5,
              tabSelectsValue: !1,
              virtualized: !0,
              options: k,
              filterOption: Tn,
              closeMenuOnSelect: !1,
              isOpen: b,
              isClearable: !0,
              hideSelectedOptions: !1,
              isLoading: g,
              components: {
                Option: dn,
                ...(O ? { IndicatorsContainer: () => f().createElement(xn, { model: e }) } : {}),
                MultiValueContainer: ({ innerProps: e, children: t }) =>
                  f().createElement(Cn, { innerProps: e, keysApplicability: d }, t),
              },
              onInputChange: R,
              onBlur: () => {
                e.changeValueTo(
                  x.map((e) => e.value),
                  x.map((e) => e.label),
                  !0,
                );
                const t = e.checkIfRestorable(x.map((e) => e.value));
                (t !== e.state.restorable && e.setState({ restorable: t }),
                  e._verifyApplicability());
              },
              onChange: (t, n) => {
                ("clear" === n.action && o && e.changeValueTo([], void 0, !0), _(t));
              },
              onOpenMenu: async () => {
                const t = kn(e);
                (null == t || t.startInteraction(be),
                  v(!0),
                  await (0, m.lastValueFrom)(e.validateAndUpdate()),
                  v(!1),
                  y(!0),
                  null == t || t.stopInteraction());
              },
              onCloseMenu: () => {
                y(!1);
              },
            })
          : f().createElement(Ct.Select, {
              "aria-label": (0, Pe.t)(
                "grafana-scenes.variables.group-by-variable-renderer.aria-label-group-by-selector",
                "Group by selector",
              ),
              "data-testid": `GroupBySelect-${r}`,
              id: r,
              placeholder: (0, Pe.t)(
                "grafana-scenes.variables.group-by-variable-renderer.placeholder-group-by-label",
                "Group by label",
              ),
              width: "auto",
              inputValue: w,
              value: x && x.length > 0 ? x : null,
              allowCustomValue: u,
              noMultiValueWrap: !0,
              maxVisibleValues: null != i ? i : 5,
              tabSelectsValue: !1,
              virtualized: !0,
              options: k,
              filterOption: Tn,
              closeMenuOnSelect: !0,
              isOpen: b,
              isClearable: !0,
              hideSelectedOptions: !1,
              noValueOnClear: !0,
              isLoading: g,
              onInputChange: R,
              onChange: (t, n) => {
                if ("clear" === n.action) return (_([]), void (o && e.changeValueTo([])));
                (null == t ? void 0 : t.value) &&
                  (_([t]), e.changeValueTo([t.value], t.label ? [t.label] : void 0));
              },
              onOpenMenu: async () => {
                const t = kn(e);
                (null == t || t.startInteraction(be),
                  v(!0),
                  await (0, m.lastValueFrom)(e.validateAndUpdate()),
                  v(!1),
                  y(!0),
                  null == t || t.stopInteraction());
              },
              onCloseMenu: () => {
                y(!1);
              },
            });
      };
      const Tn = () => !0;
      function Dn(e) {
        const { label: t, value: n, group: r } = e,
          a = { label: t, value: n };
        return (r && (a.group = r), a);
      }
      var Pn = function () {};
      var An = "undefined" != typeof window;
      const In = An ? p.useLayoutEffect : p.useEffect;
      var Vn = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 };
      const Mn =
        An && void 0 !== window.ResizeObserver
          ? function () {
              var e = (0, p.useState)(null),
                t = e[0],
                n = e[1],
                r = (0, p.useState)(Vn),
                a = r[0],
                i = r[1],
                o = (0, p.useMemo)(function () {
                  return new window.ResizeObserver(function (e) {
                    if (e[0]) {
                      var t = e[0].contentRect,
                        n = t.x,
                        r = t.y,
                        a = t.width,
                        o = t.height,
                        s = t.top,
                        l = t.left,
                        u = t.bottom,
                        c = t.right;
                      i({ x: n, y: r, width: a, height: o, top: s, left: l, bottom: u, right: c });
                    }
                  });
                }, []);
              return (
                In(
                  function () {
                    if (t)
                      return (
                        o.observe(t),
                        function () {
                          o.disconnect();
                        }
                      );
                  },
                  [t],
                ),
                [n, a]
              );
            }
          : function () {
              return [Pn, Vn];
            };
      function Ln({ data: e, showAll: t, seriesLimit: n, onShowAllSeries: r }) {
        const a = (0, Ct.useStyles2)(Fn),
          i = null == e ? void 0 : e.series.length;
        if (void 0 === i || i < n) return null;
        const o = t ? "Restore limit" : `Show all ${i}`;
        return f().createElement(
          "div",
          { className: a.timeSeriesDisclaimer },
          !t &&
            f().createElement(
              "span",
              { className: a.warningMessage },
              f().createElement(Ct.Icon, {
                title: (0, Pe.t)(
                  "grafana-scenes.components.viz-panel-series-limit.warning-message",
                  "Showing only {{seriesLimit}} series",
                  { seriesLimit: n },
                ),
                name: "exclamation-triangle",
                "aria-hidden": "true",
              }),
            ),
          f().createElement(
            Ct.Tooltip,
            {
              content: (0, Pe.t)(
                "grafana-scenes.components.viz-panel-series-limit.content-rendering-series-single-panel-impact-performance",
                "Rendering too many series in a single panel may impact performance and make data harder to read.",
              ),
            },
            f().createElement(Ct.Button, { variant: "secondary", size: "sm", onClick: r }, o),
          ),
        );
      }
      const Fn = (e) => ({
        timeSeriesDisclaimer: (0, Vt.css)({
          label: "time-series-disclaimer",
          display: "flex",
          alignItems: "center",
          gap: e.spacing(1),
        }),
        warningMessage: (0, Vt.css)({
          display: "flex",
          alignItems: "center",
          gap: e.spacing(0.5),
          color: e.colors.warning.main,
          fontSize: e.typography.bodySmall.fontSize,
        }),
      });
      const jn = function (e) {
        (0, p.useEffect)(e, []);
      };
      function Nn() {
        const e = (0, p.useRef)(void 0);
        return (null != e.current || (e.current = (0, V.uniqueId)()), e.current);
      }
      const Bn = f().forwardRef(
        ({ children: e, onLoad: t, onChange: n, className: r, ...a }, i) => {
          const o = Nn(),
            { hideEmpty: s } = (0, Ct.useStyles2)(zn),
            [l, u] = (0, p.useState)(!1),
            [c, d] = (0, p.useState)(!1),
            h = (0, p.useRef)(null);
          return (
            (0, p.useImperativeHandle)(i, () => h.current),
            jn(() => {
              Bn.addCallback(o, (e) => {
                (!l && e.isIntersecting && (u(!0), null == t || t()),
                  d(e.isIntersecting),
                  null == n || n(e.isIntersecting));
              });
              const e = h.current;
              return (
                e && Bn.observer.observe(e),
                () => {
                  (e && Bn.observer.unobserve(e),
                    delete Bn.callbacks[o],
                    0 === Object.keys(Bn.callbacks).length && Bn.observer.disconnect());
                }
              );
            }),
            f().createElement(
              "div",
              { id: o, ref: h, className: `${s} ${r}`, ...a },
              l
                ? f().createElement($n.Provider, { value: c }, e)
                : (0, Pe.t)("grafana-scenes.components.lazy-loader.placeholder", " "),
            )
          );
        },
      );
      function zn() {
        return { hideEmpty: (0, Vt.css)({ "&:empty": { display: "none" } }) };
      }
      ((Bn.displayName = "LazyLoader"),
        (Bn.callbacks = {}),
        (Bn.addCallback = (e, t) => (Bn.callbacks[e] = t)),
        (Bn.observer = new IntersectionObserver(
          (e) => {
            for (const t of e)
              "function" == typeof Bn.callbacks[t.target.id] && Bn.callbacks[t.target.id](t);
          },
          { rootMargin: "100px" },
        )));
      const $n = f().createContext(!0);
      function Wn(e, t) {
        if (t) return t;
        let n = e.error ? e.error.message : void 0;
        return (e.errors && (n = e.errors.map((e) => e.message).join(", ")), n);
      }
      const Hn = (0, Vt.css)({ position: "relative", width: "100%", height: "100%" }),
        Un = (0, Vt.css)({ position: "absolute", width: "100%", height: "100%" }),
        qn = (e) => ({
          ok: (0, Vt.css)({ color: e.colors.success.text }),
          pending: (0, Vt.css)({ color: e.colors.warning.text }),
          alerting: (0, Vt.css)({ color: e.colors.error.text }),
        }),
        Gn = "hideSeriesFrom",
        Qn = (0, s.isSystemOverrideWithRef)(Gn);
      function Kn(e, t = s.ByNamesMatcherMode.exclude, n) {
        return (
          (n =
            null != n ? n : { id: "custom.hideFrom", value: { viz: !0, legend: !1, tooltip: !0 } }),
          {
            __systemRef: Gn,
            matcher: {
              id: s.FieldMatcherID.byNames,
              options: {
                mode: t,
                names: e,
                prefix: t === s.ByNamesMatcherMode.exclude ? "All except:" : void 0,
                readOnly: !0,
              },
            },
            properties: [{ ...n, value: { viz: !0, legend: !1, tooltip: !0 } }],
          }
        );
      }
      const Yn = (e, t, n = s.ByNamesMatcherMode.exclude) => {
          const r = e.properties.find((e) => "custom.hideFrom" === e.id),
            a = Zn(e),
            i = a.findIndex((e) => e === t);
          return (i < 0 ? a.push(t) : a.splice(i, 1), Kn(a, n, r));
        },
        Zn = (e) => {
          var t;
          const n = null == (t = e.matcher.options) ? void 0 : t.names;
          return Array.isArray(n) ? [...n] : [];
        },
        Xn = (e, t) => Zn(e).length === Jn(t).length,
        Jn = (e, t) => {
          const n = new Set();
          for (const r of e)
            for (const a of r.fields) {
              if (a.type !== s.FieldType.number) continue;
              const i = (0, s.getFieldDisplayName)(a, r, e);
              i !== t && n.add(i);
            }
          return Array.from(n);
        },
        er = (e, t) => {
          var n;
          let r = [];
          for (const a of e) {
            const e = a.properties.find((e) => "custom.hideFrom" === e.id);
            if (void 0 !== e && !0 === (null == (n = e.value) ? void 0 : n.legend)) {
              const e = s.fieldMatchers.get(a.matcher.id).get(a.matcher.options);
              for (const n of t)
                for (const a of n.fields) {
                  if (a.type !== s.FieldType.number) continue;
                  const i = (0, s.getFieldDisplayName)(a, n, t);
                  e(a, n, t) && r.push(i);
                }
            }
          }
          return r;
        },
        tr = (e, t) => ({
          matcher: { id: s.FieldMatcherID.byName, options: e },
          properties: [nr(t)],
        }),
        nr = (e) => ({ id: "color", value: { mode: s.FieldColorModeId.Fixed, fixedColor: e } });
      var rr = n(6145);
      class ar extends P {
        constructor(e) {
          (super({ ...e, sync: e.sync || rr.yV.Off }),
            (this.getEventsBus = (e) => {
              if (!this.parent)
                throw new Error("EnableCursorSync cannot be used as a standalone scene object");
              return new ir(this.parent, e);
            }));
        }
        getEventsScope() {
          if (!this.parent)
            throw new Error("EnableCursorSync cannot be used as a standalone scene object");
          return this.state.key;
        }
      }
      class ir {
        constructor(e, t) {
          ((this._source = e), (this._eventsOrigin = t));
        }
        publish(e) {
          ((e.origin = this), this._eventsOrigin.publishEvent(e, !0));
        }
        getStream(e) {
          return new m.Observable((t) => {
            const n = this._source.subscribeToEvent(e, (e) => {
              t.next(e);
            });
            return () => n.unsubscribe();
          });
        }
        subscribe(e, t) {
          return this.getStream(e).pipe().subscribe(t);
        }
        removeAllListeners() {}
        newScopedBus(e, t) {
          throw new Error("For internal use only");
        }
      }
      const or = class e extends P {
        constructor({ enabled: e = !1 }) {
          (super({ enabled: e }),
            (this.timerId = void 0),
            (this._activationHandler = () => (
              this.state.enabled && this.enable(),
              () => {
                (window.clearInterval(this.timerId), (this.timerId = void 0));
              }
            )),
            this.addActivationHandler(this._activationHandler));
        }
        enable() {
          (window.clearInterval(this.timerId),
            (this.timerId = void 0),
            (this.timerId = window.setInterval(() => {
              const e = ru.findAllObjects(this.getRoot(), (e) => e instanceof fr);
              for (const t of e) t.forceRender();
            }, e.REFRESH_RATE)),
            this.setState({ enabled: !0 }));
        }
        disable() {
          (window.clearInterval(this.timerId),
            (this.timerId = void 0),
            this.setState({ enabled: !1 }));
        }
        get isEnabled() {
          return this.state.enabled;
        }
      };
      or.REFRESH_RATE = 100;
      let sr,
        lr = or;
      class ur extends P {
        constructor(e = {}) {
          (super({ ...e }),
            (this._isTracking = !1),
            (this._activeQueries = new Map()),
            this.addActivationHandler(() => this._onActivate()));
        }
        _onActivate() {
          var e, t;
          let n;
          try {
            n = ru.getAncestor(this, fr);
          } catch (e) {
            return void G(0, 0);
          }
          if (!n) return void G();
          if (!n.state.key) return void G();
          ((this._panelKey = n.state.key),
            (this._panelId = String(n.getLegacyPanelId())),
            (this._pluginId = n.state.pluginId));
          const r = n.getPlugin();
          return (
            (this._pluginVersion =
              null == (t = null == (e = null == r ? void 0 : r.meta) ? void 0 : e.info)
                ? void 0
                : t.version),
            this._subs.add(
              n.subscribeToState((e, t) => {
                this._handlePanelStateChange(n, e, t);
              }),
            ),
            () => {
              this._cleanup();
            }
          );
        }
        _handlePanelStateChange(e, t, n) {
          t.pluginId !== n.pluginId && this._onPluginChange(e, t.pluginId);
        }
        onQueryStarted(e, t, n) {
          if (!this._panelKey) return null;
          this._activeQueries.set(n, { entry: t, startTime: e });
          const r = dt("query");
          return (
            ft().notifyPanelOperationStart({
              operationId: r,
              panelId: this._panelId,
              panelKey: this._panelKey,
              pluginId: this._pluginId,
              pluginVersion: this._pluginVersion,
              operation: "query",
              timestamp: e,
              metadata: { queryId: n, queryType: t.type },
            }),
            (e, a) => {
              if (!this._panelKey) return;
              const i = this._activeQueries.get(n);
              if (!i) return;
              const o = e - i.startTime;
              (this._activeQueries.delete(n),
                ft().notifyPanelOperationComplete({
                  operationId: r,
                  panelId: this._panelId,
                  panelKey: this._panelKey,
                  pluginId: this._pluginId,
                  pluginVersion: this._pluginVersion,
                  operation: "query",
                  timestamp: e,
                  duration: o,
                  metadata: { queryId: n, queryType: t.type },
                  error: a
                    ? (null == a ? void 0 : a.message) || String(a) || "Unknown error"
                    : void 0,
                }));
            }
          );
        }
        onPluginLoadStart(e) {
          if (!this._panelKey) {
            let t;
            try {
              t = ru.getAncestor(this, fr);
            } catch (e) {
              return null;
            }
            t &&
              !this._panelKey &&
              t.state.key &&
              ((this._panelKey = t.state.key),
              (this._panelId = String(t.getLegacyPanelId())),
              (this._pluginId = e));
          }
          if (!this._panelKey) return null;
          (this._isTracking || this._startTracking(),
            (this._loadPluginStartTime = performance.now()));
          const t = dt("pluginLoad");
          return (
            ft().notifyPanelOperationStart({
              operationId: t,
              panelId: this._panelId,
              panelKey: this._panelKey,
              pluginId: this._pluginId,
              operation: "plugin-load",
              timestamp: this._loadPluginStartTime,
              metadata: { pluginId: e },
            }),
            (e, n = !1) => {
              if (!this._panelKey || !this._loadPluginStartTime) return;
              const r = performance.now() - this._loadPluginStartTime;
              (ft().notifyPanelOperationComplete({
                operationId: t,
                panelId: this._panelId,
                panelKey: this._panelKey,
                pluginId: this._pluginId,
                operation: "plugin-load",
                timestamp: performance.now(),
                duration: r,
                metadata: { pluginId: this._pluginId, fromCache: n, pluginLoadTime: r },
              }),
                (this._loadPluginStartTime = void 0));
            }
          );
        }
        onFieldConfigStart(e) {
          if (!this._panelKey) return null;
          this._applyFieldConfigStartTime = e;
          const t = dt("fieldConfig");
          return (
            ft().notifyPanelOperationStart({
              operationId: t,
              panelId: this._panelId,
              panelKey: this._panelKey,
              pluginId: this._pluginId,
              operation: "fieldConfig",
              timestamp: this._applyFieldConfigStartTime,
              metadata: {},
            }),
            (e, n, r) => {
              if (!this._panelKey || !this._applyFieldConfigStartTime) return;
              const a = e - this._applyFieldConfigStartTime;
              (ft().notifyPanelOperationComplete({
                operationId: t,
                panelId: this._panelId,
                panelKey: this._panelKey,
                pluginId: this._pluginId,
                operation: "fieldConfig",
                timestamp: e,
                duration: a,
                metadata: {},
              }),
                (this._applyFieldConfigStartTime = void 0));
            }
          );
        }
        _getPanelInfo() {
          let e;
          try {
            e = ru.getAncestor(this, fr);
          } catch (e) {}
          let t = (null == e ? void 0 : e.state.title) || this._panelKey || "No-key panel";
          return (
            t.length > 30 && (t = t.substring(0, 27) + "..."),
            `VizPanelRenderProfiler [${t}]`
          );
        }
        onSimpleRenderStart(e) {
          if (!this._panelKey) return;
          const t = dt("render");
          return (
            ft().notifyPanelOperationStart({
              operationId: t,
              panelId: this._panelId || "unknown",
              panelKey: this._panelKey,
              pluginId: this._pluginId || "unknown",
              pluginVersion: this._pluginVersion,
              operation: "render",
              timestamp: e,
              metadata: {},
            }),
            (e, n) => {
              this._panelKey &&
                ft().notifyPanelOperationComplete({
                  operationId: t,
                  panelId: this._panelId || "unknown",
                  panelKey: this._panelKey,
                  pluginId: this._pluginId || "unknown",
                  pluginVersion: this._pluginVersion,
                  operation: "render",
                  duration: n,
                  timestamp: e,
                  metadata: {},
                });
            }
          );
        }
        _onPluginChange(e, t) {
          var n, r;
          this._pluginId = t;
          const a = e.getPlugin();
          ((this._pluginVersion =
            null == (r = null == (n = null == a ? void 0 : a.meta) ? void 0 : n.info)
              ? void 0
              : r.version),
            G(this._getPanelInfo()));
        }
        _startTracking() {
          this._panelKey && this._pluginId && !this._isTracking && (this._isTracking = !0);
        }
        _cleanup() {
          (this._activeQueries.clear(), (this._isTracking = !1), G(this._getPanelInfo()));
        }
        onDataTransformStart(e, t, n) {
          if (!this._panelKey) return null;
          const r = dt("transform");
          return (
            ft().notifyPanelOperationStart({
              operationId: r,
              panelId: this._panelId,
              panelKey: this._panelKey,
              pluginId: this._pluginId,
              operation: "transform",
              timestamp: e,
              metadata: {
                transformationId: t,
                transformationCount: n.transformationCount,
                seriesTransformationCount: n.seriesTransformationCount,
                annotationTransformationCount: n.annotationTransformationCount,
              },
            }),
            (e, a, i, o) => {
              this._panelKey &&
                ft().notifyPanelOperationComplete({
                  operationId: r,
                  panelId: this._panelId,
                  panelKey: this._panelKey,
                  pluginId: this._pluginId,
                  operation: "transform",
                  timestamp: e,
                  duration: a,
                  metadata: {
                    transformationId: t,
                    transformationCount: n.transformationCount,
                    seriesTransformationCount: n.seriesTransformationCount,
                    annotationTransformationCount: n.annotationTransformationCount,
                    success: i,
                    error:
                      (null == o ? void 0 : o.error) || (i ? void 0 : "Transform operation failed"),
                  },
                });
            }
          );
        }
      }
      class cr {
        constructor() {
          ((this._resultsMap = new Map()), (this._prevLayers = []));
        }
        getMergedStream(e) {
          (function (e, t) {
            if (e.length !== t.length) return !0;
            for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !0;
            return !1;
          })(e, this._prevLayers) && ((this._resultsMap = new Map()), (this._prevLayers = e));
          const t = e.map((e) => e.getResultsStream()),
            n = [];
          for (const t of e) n.push(t.activate());
          return (0, m.merge)(t).pipe(
            (0, m.mergeAll)(),
            (0, m.filter)((e) => this._resultsMap.get(e.origin.state.key) !== e),
            (0, m.map)(
              (e) => (this._resultsMap.set(e.origin.state.key, e), this._resultsMap.values()),
            ),
            (0, m.finalize)(() => {
              n.forEach((e) => e());
            }),
          );
        }
      }
      class dr extends P {
        constructor() {
          (super(...arguments),
            (this.isDataLayer = !0),
            (this._results = new m.ReplaySubject(1)),
            (this._dataLayersMerger = new cr()));
        }
        subscribeToAllLayers(e) {
          e.length > 0
            ? (this.querySub = this._dataLayersMerger
                .getMergedStream(e)
                .subscribe(this._onLayerUpdateReceived.bind(this)))
            : (this._results.next({ origin: this, data: oe }), this.setStateHelper({ data: oe }));
        }
        _onLayerUpdateReceived(e) {
          var t;
          let n = [];
          for (const r of e)
            (null == (t = r.data) ? void 0 : t.series) && (n = n.concat(r.data.series));
          const r = { ...oe, series: n };
          (this._results.next({ origin: this, data: r }), this.setStateHelper({ data: r }));
        }
        getResultsStream() {
          return this._results;
        }
        cancelQuery() {
          var e;
          null == (e = this.querySub) || e.unsubscribe();
        }
        setStateHelper(e) {
          Ye(this, e);
        }
      }
      class pr extends dr {
        constructor(e) {
          var t, n;
          (super({
            name: null != (t = e.name) ? t : "Data layers",
            layers: null != (n = e.layers) ? n : [],
          }),
            this.addActivationHandler(() => this._onActivate()));
        }
        _onActivate() {
          return (
            this._subs.add(
              this.subscribeToState((e, t) => {
                var n;
                e.layers !== t.layers &&
                  (null == (n = this.querySub) || n.unsubscribe(),
                  this.subscribeToAllLayers(e.layers));
              }),
            ),
            this.subscribeToAllLayers(this.state.layers),
            () => {
              var e;
              null == (e = this.querySub) || e.unsubscribe();
            }
          );
        }
      }
      pr.Component = ({ model: e }) => {
        const { layers: t } = e.useState();
        return f().createElement(
          f().Fragment,
          null,
          t.map((e) => f().createElement(e.Component, { model: e, key: e.state.key })),
        );
      };
      class hr extends P {
        constructor(e) {
          (super(e),
            (this._results = new m.ReplaySubject(1)),
            (this._variableDependency = new Pl(this, {
              statePaths: ["transformations"],
              onReferencedVariableValueChanged: () => this.reprocessTransformations(),
            })),
            this.addActivationHandler(() => this.activationHandler()));
        }
        activationHandler() {
          const e = this.getSourceData();
          return (
            this._subs.add(e.subscribeToState((e) => this.transform(e.data))),
            e.state.data && this.transform(e.state.data),
            () => {
              this._transformSub && this._transformSub.unsubscribe();
            }
          );
        }
        getSourceData() {
          if (this.state.$data) {
            if (this.state.$data instanceof pr)
              throw new Error(
                "SceneDataLayerSet can not be used as data provider for SceneDataTransformer.",
              );
            return this.state.$data;
          }
          if (!this.parent || !this.parent.parent)
            throw new Error(
              "SceneDataTransformer must either have $data set on it or have a parent.parent with $data",
            );
          return ru.getData(this.parent.parent);
        }
        setContainerWidth(e) {
          this.state.$data &&
            this.state.$data.setContainerWidth &&
            this.state.$data.setContainerWidth(e);
        }
        isDataReadyToDisplay() {
          const e = this.getSourceData();
          return !e.isDataReadyToDisplay || e.isDataReadyToDisplay();
        }
        reprocessTransformations() {
          this.transform(this.getSourceData().state.data, !0);
        }
        _calculateTransformationMetrics(e, t) {
          return {
            transformationCount: t.length,
            seriesTransformationCount: t.filter(
              (e) =>
                (!("options" in e) && !("topic" in e)) ||
                null == e.topic ||
                e.topic === s.DataTopic.Series,
            ).length,
            annotationTransformationCount: t.filter(
              (e) => ("options" in e || "topic" in e) && e.topic === s.DataTopic.Annotations,
            ).length,
          };
        }
        cancelQuery() {
          var e, t;
          null == (t = (e = this.getSourceData()).cancelQuery) || t.call(e);
        }
        getResultsStream() {
          return this._results;
        }
        clone(e) {
          const t = super.clone(e);
          return (
            this._prevDataFromSource && (t._prevDataFromSource = this._prevDataFromSource),
            t
          );
        }
        isInViewChanged(e) {
          var t, n;
          null == (n = null == (t = this.state.$data) ? void 0 : t.isInViewChanged) || n.call(t, e);
        }
        bypassIsInViewChanged(e) {
          var t, n;
          null == (n = null == (t = this.state.$data) ? void 0 : t.bypassIsInViewChanged) ||
            n.call(t, e);
        }
        haveAlreadyTransformedData(e) {
          if (!this._prevDataFromSource) return !1;
          if (e === this._prevDataFromSource) return !0;
          const { series: t, annotations: n } = this._prevDataFromSource;
          return (
            e.series === t &&
            e.annotations === n &&
            (this.state.data &&
              e.state !== this.state.data.state &&
              this.setState({ data: { ...this.state.data, state: e.state } }),
            !0)
          );
        }
        transform(e, t = !1) {
          var n;
          const r = performance.now(),
            a = mr(this),
            i = performance.now();
          let o,
            u = null;
          if (0 === this.state.transformations.length || !e)
            return (
              (this._prevDataFromSource = e),
              this.setState({ data: e }),
              void (e && this._results.next({ origin: this, data: e }))
            );
          if (!t && this.haveAlreadyTransformedData(e)) return;
          if (a) {
            o =
              this.state.transformations
                .map((e) => ("id" in e ? e.id : "customTransformation"))
                .join("+") || "no-transforms";
            const t = this._calculateTransformationMetrics(e, this.state.transformations);
            u = a.onDataTransformStart(r, o, t);
          }
          const c = this._interpolateVariablesInTransformationConfigs(e),
            d = this._filterAndPrepareTransformationsByTopic(
              c,
              (e) =>
                (!("options" in e) && !("topic" in e)) ||
                null == e.topic ||
                e.topic === s.DataTopic.Series,
            ),
            p = this._filterAndPrepareTransformationsByTopic(
              c,
              (e) => ("options" in e || "topic" in e) && e.topic === s.DataTopic.Annotations,
            );
          this._transformSub && this._transformSub.unsubscribe();
          const h = {
              interpolate: (t, n) => {
                var r;
                return ru.interpolate(this, t, {
                  ...(null == (r = e.request) ? void 0 : r.scopedVars),
                  ...n,
                });
              },
            },
            f = (0, s.transformDataFrame)(d, e.series, h),
            g = (0, s.transformDataFrame)(p, null != (n = e.annotations) ? n : []);
          let v = [],
            b = [];
          this._transformSub = (0, m.forkJoin)([f, g])
            .pipe(
              (0, m.map)(
                (t) => (
                  t.forEach((e) => {
                    var t;
                    for (const n of e)
                      (null == (t = n.meta) ? void 0 : t.dataTopic) === s.DataTopic.Annotations
                        ? b.push(n)
                        : v.push(n);
                  }),
                  { ...e, series: v, annotations: b }
                ),
              ),
              (0, m.catchError)((t) => {
                var n;
                const r = performance.now();
                (u && u(r, r - i, !1, { error: t.message || t }),
                  console.error("Error transforming data: ", t));
                const a = (null == (n = this.getSourceData().state.data) ? void 0 : n.errors) || [],
                  o = (0, l.toDataQueryError)(t);
                o.message = `Error transforming data: ${o.message}`;
                const c = { ...e, state: s.LoadingState.Error, errors: [...a, o] };
                return (0, m.of)(c);
              }),
            )
            .subscribe((t) => {
              var n;
              const r = performance.now();
              (u &&
                u(r, r - i, !0, {
                  outputSeriesCount: t.series.length,
                  outputAnnotationsCount: (null == (n = t.annotations) ? void 0 : n.length) || 0,
                }),
                this.setState({ data: t }),
                this._results.next({ origin: this, data: t }),
                (this._prevDataFromSource = e));
            });
        }
        _interpolateVariablesInTransformationConfigs(e) {
          var t;
          const n = this.state.transformations;
          if (0 === this._variableDependency.getNames().size) return n;
          return n.every((e) => "object" == typeof e)
            ? JSON.parse(
                ru.interpolate(
                  this,
                  JSON.stringify(n),
                  null == (t = e.request) ? void 0 : t.scopedVars,
                ),
              )
            : n.map((t) => {
                var n;
                return "object" == typeof t
                  ? JSON.parse(
                      ru.interpolate(
                        this,
                        JSON.stringify(t),
                        null == (n = e.request) ? void 0 : n.scopedVars,
                      ),
                    )
                  : t;
              });
        }
        _filterAndPrepareTransformationsByTopic(e, t) {
          return e.filter(t).map((e) => ("operator" in e ? e.operator : e));
        }
      }
      class fr extends P {
        constructor(e) {
          var t;
          (super({
            options: {},
            fieldConfig: { defaults: {}, overrides: [] },
            title: (0, Pe.t)("grafana-scenes.components.viz-panel.title.title", "Title"),
            pluginId: "timeseries",
            _renderCounter: 0,
            ...e,
          }),
            (this._variableDependency = new Pl(this, {
              statePaths: ["title", "options", "fieldConfig"],
            })),
            (this._structureRev = 0),
            (this.onTimeRangeChange = (e) => {
              ru.getTimeRange(this).onTimeRangeChange({
                raw: { from: (0, s.toUtc)(e.from), to: (0, s.toUtc)(e.to) },
                from: (0, s.toUtc)(e.from),
                to: (0, s.toUtc)(e.to),
              });
            }),
            (this.getTimeRange = (e) => {
              const t = ru.findObject(this, (e) => e instanceof lr),
                n = ru.getTimeRange(this);
              if (t instanceof lr && t.isEnabled)
                return de(
                  n.state.from,
                  n.state.to,
                  n.getTimeZone(),
                  n.state.fiscalYearStartMonth,
                  n.state.UNSAFE_nowDelay,
                  n.state.weekStart,
                );
              const r = this.getPlugin();
              return r && !r.meta.skipDataQuery && e && e.timeRange ? e.timeRange : n.state.value;
            }),
            (this.onTitleChange = (e) => {
              this.setState({ title: e });
            }),
            (this.onDescriptionChange = (e) => {
              this.setState({ description: e });
            }),
            (this.onDisplayModeChange = (e) => {
              this.setState({ displayMode: e });
            }),
            (this.onToggleCollapse = (e) => {
              this.setState({ collapsed: e });
            }),
            (this.onOptionsChange = (e, t = !1, n = !1) => {
              var r;
              const { fieldConfig: a, options: i } = this.state,
                o = t
                  ? e
                  : (0, V.mergeWith)((0, V.cloneDeep)(i), e, (e, t, n, r) => {
                      if ((0, V.isArray)(t)) return t;
                      e === t || void 0 !== t || (r[n] = t);
                    }),
                l = (0, s.getPanelOptionsWithDefaults)({
                  plugin: this._plugin,
                  currentOptions: o,
                  currentFieldConfig: a,
                  isAfterPluginChange: n,
                });
              this.setState({
                options: l.options,
                _renderCounter: (null != (r = this.state._renderCounter) ? r : 0) + 1,
              });
            }),
            (this.onFieldConfigChange = (e, t) => {
              const { fieldConfig: n, options: r } = this.state,
                a = t ? e : (0, V.merge)((0, V.cloneDeep)(n), e),
                i = (0, s.getPanelOptionsWithDefaults)({
                  plugin: this._plugin,
                  currentOptions: r,
                  currentFieldConfig: a,
                  isAfterPluginChange: !1,
                });
              ((this._dataWithFieldConfig = void 0), this.setState({ fieldConfig: i.fieldConfig }));
            }),
            (this.interpolate = (e, t, n) => ru.interpolate(this, e, t, n)),
            (this.getDescription = () => {
              this.publishEvent(
                new R({ origin: this, interaction: "panel-description-shown" }),
                !0,
              );
              const { description: e } = this.state;
              if (e) {
                const t = this.interpolate(e);
                return (0, s.renderMarkdown)(t);
              }
              return "";
            }),
            (this.onCancelQuery = () => {
              var e;
              this.publishEvent(
                new R({ origin: this, interaction: "panel-cancel-query-clicked" }),
                !0,
              );
              const t = ru.getData(this);
              null == (e = t.cancelQuery) || e.call(t);
            }),
            (this.onStatusMessageClick = () => {
              this.publishEvent(
                new R({ origin: this, interaction: "panel-status-message-clicked" }),
                !0,
              );
            }),
            (this._onSeriesColorChange = (e, t) => {
              this.onFieldConfigChange(
                ((e, t, n) => {
                  const { overrides: r } = n,
                    a = n.overrides.findIndex(
                      (t) => t.matcher.id === s.FieldMatcherID.byName && t.matcher.options === e,
                    );
                  if (a < 0) return { ...n, overrides: [...n.overrides, tr(e, t)] };
                  const i = Array.from(r),
                    o = i[a],
                    l = o.properties.findIndex((e) => "color" === e.id);
                  if (l < 0)
                    return (
                      (i[a] = { ...o, properties: [...o.properties, nr(t)] }),
                      { ...n, overrides: i }
                    );
                  const u = Array.from(o.properties);
                  return ((u[l] = nr(t)), (i[a] = { ...o, properties: u }), { ...n, overrides: i });
                })(e, t, this.state.fieldConfig),
              );
            }),
            (this._onSeriesVisibilityChange = (e, t) => {
              this._dataWithFieldConfig &&
                this.onFieldConfigChange(
                  (function (e, t, n, r) {
                    const { overrides: a } = n,
                      i = e,
                      o = a.findIndex(Qn);
                    if (o < 0) {
                      if (t === Ct.SeriesVisibilityChangeMode.ToggleSelection) {
                        const e = Kn([i, ...er(a, r)]);
                        return { ...n, overrides: [...n.overrides, e] };
                      }
                      const e = Kn(Jn(r, i));
                      return { ...n, overrides: [...n.overrides, e] };
                    }
                    const s = Array.from(a),
                      [l] = s.splice(o, 1);
                    if (t === Ct.SeriesVisibilityChangeMode.ToggleSelection) {
                      let e = Zn(l);
                      const t = er(s, r);
                      if (
                        (t.length > 0 && (e = e.filter((e) => t.indexOf(e) < 0)),
                        e[0] === i && 1 === e.length)
                      )
                        return { ...n, overrides: s };
                      const a = Kn([i, ...t]);
                      return { ...n, overrides: [...s, a] };
                    }
                    const u = Yn(l, i);
                    return Xn(u, r) ? { ...n, overrides: s } : { ...n, overrides: [...s, u] };
                  })(e, t, this.state.fieldConfig, this._dataWithFieldConfig.series),
                  !0,
                );
            }),
            (this._onInstanceStateChange = (e) => {
              (this._panelContext &&
                (this._panelContext = { ...this._panelContext, instanceState: e }),
                this.setState({ _pluginInstanceState: e }));
            }),
            (this._onToggleLegendSort = (e) => {
              const t = this.state.options.legend;
              if (!t) return;
              let n = t.sortDesc,
                r = t.sortBy;
              (e !== r && (n = void 0),
                !1 === n ? ((r = void 0), (n = void 0)) : ((n = !n), (r = e)),
                this.onOptionsChange(
                  { ...this.state.options, legend: { ...t, sortBy: r, sortDesc: n } },
                  !0,
                ));
            }),
            this.addActivationHandler(() => {
              this._onActivate();
            }),
            null == (t = e.menu) ||
              t.addActivationHandler(() => {
                this.publishEvent(new R({ origin: this, interaction: "panel-menu-shown" }), !0);
              }));
        }
        getProfiler() {
          if (this.state.$behaviors)
            for (const e of this.state.$behaviors) if (e instanceof ur) return e;
        }
        _onActivate() {
          this._plugin || this._loadPlugin(this.state.pluginId);
        }
        forceRender() {
          var e;
          this.setState({ _renderCounter: (null != (e = this.state._renderCounter) ? e : 0) + 1 });
        }
        async _loadPlugin(e, t, n, r) {
          const a = this.getProfiler(),
            i = (function (e) {
              var t;
              const { getPanelPluginFromCache: n } = (0, l.getPluginImportUtils)();
              return null != (t = n(e)) ? t : d.get(e);
            })(e);
          if (i) {
            const o = null == a ? void 0 : a.onPluginLoadStart(e);
            (null == o || o(i, !0), this._pluginLoaded(i, t, n, r));
          } else {
            const { importPanelPlugin: i } = (0, l.getPluginImportUtils)();
            try {
              const o = null == a ? void 0 : a.onPluginLoadStart(e),
                s = i(e),
                l = ru.getQueryController(this);
              l &&
                l.state.enableProfiling &&
                gt(s)
                  .pipe(mt({ type: `VizPanel/loadPlugin/${e}`, origin: this }))
                  .subscribe(() => {});
              const u = await s;
              (null == o || o(u, !1), this._pluginLoaded(u, t, n, r));
            } catch (t) {
              (this._pluginLoaded(
                (function (e) {
                  const t = new s.PanelPlugin(() => null);
                  return (
                    (t.meta = {
                      id: e,
                      name: e,
                      sort: 100,
                      type: s.PluginType.panel,
                      module: "",
                      baseUrl: "",
                      info: {
                        author: { name: "" },
                        description: "",
                        links: [],
                        logos: { large: "", small: "public/img/grafana_icon.svg" },
                        screenshots: [],
                        updated: "",
                        version: "",
                      },
                    }),
                    t
                  );
                })(e),
              ),
                t instanceof Error && this.setState({ _pluginLoadError: t.message }));
            }
          }
        }
        getLegacyPanelId() {
          var e, t;
          const n = null != (t = null == (e = this.state.key) ? void 0 : e.split("/")) ? t : [];
          if (0 === n.length) return 0;
          const r = n[n.length - 1],
            a = parseInt(r.replace("panel-", ""), 10);
          return isNaN(a) ? 0 : a;
        }
        getPathId() {
          return ou(this);
        }
        async _pluginLoaded(e, t, n, r) {
          var a;
          const {
              options: i,
              fieldConfig: o,
              title: l,
              pluginVersion: u,
              _UNSAFE_customMigrationHandler: c,
            } = this.state,
            d = {
              title: l,
              options: i,
              fieldConfig: o,
              id: this.getLegacyPanelId(),
              type: e.meta.id,
              pluginVersion: u,
            };
          (t && (d.options = t), n && (d.fieldConfig = n));
          const p = this._getPluginVersion(e);
          null == c || c(d, e);
          const h = p !== u || (null == (a = e.shouldMigrate) ? void 0 : a.call(e, d));
          e.onPanelMigration && h && !r && (d.options = await e.onPanelMigration(d));
          let f = this.state.$data;
          d.transformations &&
            f &&
            (f instanceof hr
              ? f.setState({ transformations: d.transformations })
              : f instanceof dl &&
                (f.clearParent(), (f = new hr({ transformations: d.transformations, $data: f }))));
          const m = (0, s.getPanelOptionsWithDefaults)({
            plugin: e,
            currentOptions: d.options,
            currentFieldConfig: d.fieldConfig,
            isAfterPluginChange: null != r && r,
          });
          if (
            ((this._plugin = e),
            this.setState({
              $data: f,
              options: m.options,
              fieldConfig: m.fieldConfig,
              pluginVersion: p,
              pluginId: e.meta.id,
            }),
            e.meta.skipDataQuery)
          ) {
            const e = ru.getTimeRange(this);
            this._subs.add(e.subscribeToState(() => this.forceRender()));
          }
        }
        _getPluginVersion(e) {
          return e && e.meta.info.version ? e.meta.info.version : l.config.buildInfo.version;
        }
        getPlugin() {
          return this._plugin;
        }
        getPanelContext() {
          return (
            null != this._panelContext || (this._panelContext = this.buildPanelContext()),
            this._panelContext
          );
        }
        async changePluginType(e, t, n) {
          var r, a;
          const { options: i, fieldConfig: o, pluginId: s } = this.state;
          this._dataWithFieldConfig = void 0;
          const l = this.state.pluginId !== e;
          await this._loadPlugin(e, null != t ? t : {}, n, l);
          const u = {
              title: this.state.title,
              options: this.state.options,
              fieldConfig: this.state.fieldConfig,
              id: 1,
              type: e,
            },
            c =
              null == (a = null == (r = this._plugin) ? void 0 : r.onPanelTypeChanged)
                ? void 0
                : a.call(r, u, s, i, o);
          c && !(0, V.isEmpty)(c) && this.onOptionsChange(c, !0, !0);
        }
        clearFieldConfigCache() {
          this._dataWithFieldConfig = void 0;
        }
        applyFieldConfig(e) {
          var t, n, r, a;
          const i = performance.now(),
            o = this._plugin,
            u = this.getProfiler();
          if (!o || o.meta.skipDataQuery || !e) return oe;
          if (this._prevData === e && this._dataWithFieldConfig) return this._dataWithFieldConfig;
          const c = null == u ? void 0 : u.onFieldConfigStart(i),
            d = o.dataSupport || { alertStates: !1, annotations: !1 },
            p = o.fieldConfigRegistry,
            h = null != (n = null == (t = this._dataWithFieldConfig) ? void 0 : t.series) ? n : [],
            f = (0, s.applyFieldOverrides)({
              data: e.series,
              fieldConfig: this.state.fieldConfig,
              fieldConfigRegistry: p,
              replaceVariables: this.interpolate,
              theme: l.config.theme2,
              timeZone: null == (r = e.request) ? void 0 : r.timezone,
            });
          return (
            (0, s.compareArrayValues)(f, h, s.compareDataFrameStructures) || this._structureRev++,
            (this._dataWithFieldConfig = { ...e, structureRev: this._structureRev, series: f }),
            this._dataWithFieldConfig.annotations &&
              (this._dataWithFieldConfig.annotations = (0, s.applyFieldOverrides)({
                data: this._dataWithFieldConfig.annotations,
                fieldConfig: { defaults: {}, overrides: [] },
                fieldConfigRegistry: p,
                replaceVariables: this.interpolate,
                theme: l.config.theme2,
                timeZone: null == (a = e.request) ? void 0 : a.timezone,
              })),
            d.alertStates || (this._dataWithFieldConfig.alertState = void 0),
            d.annotations || (this._dataWithFieldConfig.annotations = void 0),
            (this._prevData = e),
            u && (null == c || c(performance.now())),
            this._dataWithFieldConfig
          );
        }
        clone(e) {
          return super.clone({ _pluginInstanceState: void 0, _pluginLoadError: void 0, ...e });
        }
        buildPanelContext() {
          const e = ((t = this), ru.findObject(t, (e) => e instanceof ar));
          var t;
          const n = {
            eventsScope: e ? e.getEventsScope() : "__global_",
            eventBus: e ? e.getEventsBus(this) : (0, l.getAppEvents)(),
            app: s.CoreApp.Unknown,
            sync: () => (e ? e.state.sync : s.DashboardCursorSync.Off),
            onSeriesColorChange: this._onSeriesColorChange,
            onToggleSeriesVisibility: this._onSeriesVisibilityChange,
            onToggleLegendSort: this._onToggleLegendSort,
            onInstanceStateChange: this._onInstanceStateChange,
          };
          return (this.state.extendPanelContext && this.state.extendPanelContext(this, n), n);
        }
      }
      function mr(e) {
        try {
          const t = ru.getAncestor(e, fr);
          if (t) {
            return (t.state.$behaviors || []).find((e) => e instanceof ur);
          }
        } catch (e) {}
      }
      fr.Component = function ({ model: e }) {
        var t;
        const {
            title: n,
            options: r,
            fieldConfig: a,
            _pluginLoadError: i,
            displayMode: o,
            hoverHeader: u,
            showMenuAlways: c,
            hoverHeaderOffset: d,
            menu: h,
            headerActions: m,
            titleItems: g,
            seriesLimit: v,
            seriesLimitShowAll: b,
            description: y,
            collapsible: w,
            collapsed: S,
            _renderCounter: x = 0,
          } = e.useState(),
          [_, { width: C, height: O }] = Mn(),
          R = (0, p.useMemo)(() => (0, l.getAppEvents)(), []),
          k = (0, p.useCallback)(() => {
            e.state.key && R.publish(new s.SetPanelAttentionEvent({ panelId: e.getPathId() }));
          }, [e, R]),
          E = (0, p.useMemo)(() => (0, V.debounce)(k, 100, { leading: !0, trailing: !1 }), [k]),
          T = (0, p.useMemo)(() => e.getProfiler(), [e]),
          D = performance.now(),
          P = f().useRef(null);
        ((0, p.useLayoutEffect)(() => {
          if (T) {
            const e = T.onSimpleRenderStart(D);
            P.current = e || null;
          }
        }),
          (0, p.useEffect)(() => {
            if (P.current) {
              const e = performance.now(),
                t = e - D;
              (P.current(e, t), (P.current = null));
            }
          }));
        const A = e.getPlugin(),
          { dragClass: I, dragClassCancel: M } = (function (e) {
            var t, n;
            const r = ru.getLayout(e),
              a = null == r ? void 0 : r.isDraggable();
            if (
              !r ||
              !a ||
              (function (e, t) {
                let n = e;
                for (; n && n !== t; ) {
                  if ("isDraggable" in n.state && !1 === n.state.isDraggable) return !0;
                  if ("repeatSourceKey" in n.state && n.state.repeatSourceKey) return !0;
                  n = n.parent;
                }
                return !1;
              })(e, r)
            )
              return { dragClass: "", dragClassCancel: "" };
            return {
              dragClass: null == (t = r.getDragClass) ? void 0 : t.call(r),
              dragClassCancel:
                null == (n = null == r ? void 0 : r.getDragClassCancel) ? void 0 : n.call(r),
            };
          })(e),
          L = (function (e) {
            var t, n;
            const r = ru.getLayout(e);
            return null !=
              (n = null == (t = null == r ? void 0 : r.getDragHooks) ? void 0 : t.call(r))
              ? n
              : {};
          })(e),
          F = ru.getData(e),
          j = F.useState(),
          N = (function (e, t, n) {
            return (0, p.useMemo)(
              () =>
                (null == e ? void 0 : e.series) && t && !n
                  ? { ...e, series: e.series.slice(0, t) }
                  : e,
              [e, t, n],
            );
          })(j.data, v, b),
          B = e.applyFieldConfig(N),
          z = ru.getTimeRange(e).getTimeZone(),
          $ = e.getTimeRange(B),
          W = f().useContext($n);
        (0, p.useEffect)(() => {
          F.isInViewChanged && F.isInViewChanged(W);
        }, [W, F]);
        const H = e.interpolate(n, void 0, "text"),
          U = (0, Ct.useStyles2)(qn);
        if (!A)
          return f().createElement(
            "div",
            null,
            f().createElement(
              Pe.x6,
              { i18nKey: "grafana-scenes.components.viz-panel-renderer.loading-plugin-panel" },
              "Loading plugin panel...",
            ),
          );
        if (!A.panel)
          return f().createElement(
            "div",
            null,
            f().createElement(
              Pe.x6,
              {
                i18nKey:
                  "grafana-scenes.components.viz-panel-renderer.panel-plugin-has-no-panel-component",
              },
              "Panel plugin has no panel component",
            ),
          );
        const q = A.panel;
        F && F.setContainerWidth && F.setContainerWidth(Math.round(C));
        let G,
          Q,
          K = [];
        (g &&
          (Array.isArray(g)
            ? (K = K.concat(
                g.map((e) => f().createElement(e.Component, { model: e, key: `${e.state.key}` })),
              ))
            : st(g)
              ? K.push(f().createElement(g.Component, { model: g }))
              : K.push(g)),
          v &&
            K.push(
              f().createElement(Ln, {
                key: "series-limit",
                data: j.data,
                seriesLimit: v,
                showAll: b,
                onShowAllSeries: () => e.setState({ seriesLimitShowAll: !b }),
              }),
            ),
          e.state.$timeRange &&
            K.push(
              f().createElement(e.state.$timeRange.Component, {
                model: e.state.$timeRange,
                key: e.state.key,
              }),
            ),
          B.alertState &&
            K.push(
              f().createElement(
                Ct.Tooltip,
                {
                  content: null != (t = B.alertState.state) ? t : "unknown",
                  key: `alert-states-icon-${e.state.key}`,
                },
                f().createElement(
                  Ct.PanelChrome.TitleItem,
                  {
                    className: (0, Vt.cx)({
                      [U.ok]: B.alertState.state === s.AlertState.OK,
                      [U.pending]: B.alertState.state === s.AlertState.Pending,
                      [U.alerting]: B.alertState.state === s.AlertState.Alerting,
                    }),
                  },
                  f().createElement(Ct.Icon, {
                    name: "alerting" === B.alertState.state ? "heart-break" : "heart",
                    className: "panel-alert-icon",
                    size: "md",
                  }),
                ),
              ),
            ),
          h && (G = f().createElement(h.Component, { model: h })),
          m &&
            (Q = Array.isArray(m)
              ? f().createElement(
                  f().Fragment,
                  null,
                  m.map((e) => f().createElement(e.Component, { model: e, key: `${e.state.key}` })),
                )
              : st(m)
                ? f().createElement(m.Component, { model: m })
                : m));
        const Y = B,
          Z = !F.isDataReadyToDisplay || F.isDataReadyToDisplay(),
          X = e.getPanelContext(),
          J = e.getLegacyPanelId();
        return f().createElement(
          "div",
          { className: Hn },
          f().createElement(
            "div",
            { ref: _, className: Un, "data-viz-panel-key": e.state.key },
            C > 0 &&
              O > 0 &&
              f().createElement(
                Ct.PanelChrome,
                {
                  title: H,
                  description: (null == y ? void 0 : y.trim()) ? e.getDescription : void 0,
                  loadingState: Y.state,
                  statusMessage: Wn(Y, i),
                  statusMessageOnClick: e.onStatusMessageClick,
                  width: C,
                  height: O,
                  selectionId: e.state.key,
                  displayMode: o,
                  titleItems: K,
                  dragClass: I,
                  actions: Q,
                  dragClassCancel: M,
                  padding: A.noPadding ? "none" : "md",
                  menu: G,
                  onCancelQuery: e.onCancelQuery,
                  onFocus: k,
                  onMouseEnter: k,
                  onMouseMove: E,
                  onDragStart: (t) => {
                    var n;
                    null == (n = L.onDragStart) || n.call(L, t, e);
                  },
                  showMenuAlways: c,
                  ...(w
                    ? {
                        collapsible: Boolean(w),
                        collapsed: S,
                        onToggleCollapse: e.onToggleCollapse,
                      }
                    : { hoverHeader: u, hoverHeaderOffset: d }),
                },
                (t, i) =>
                  f().createElement(
                    f().Fragment,
                    null,
                    f().createElement(
                      Ct.ErrorBoundaryAlert,
                      { dependencies: [A, Y] },
                      f().createElement(
                        s.PluginContextProvider,
                        { meta: A.meta },
                        f().createElement(
                          Ct.PanelContextProvider,
                          { value: X },
                          Z &&
                            f().createElement(q, {
                              id: J,
                              data: Y,
                              title: n,
                              timeRange: $,
                              timeZone: z,
                              options: r,
                              fieldConfig: a,
                              transparent: "transparent" === o,
                              width: t,
                              height: i,
                              renderCounter: x,
                              replaceVariables: e.interpolate,
                              onOptionsChange: e.onOptionsChange,
                              onFieldConfigChange: e.onFieldConfigChange,
                              onChangeTimeRange: e.onTimeRangeChange,
                              eventBus: X.eventBus,
                            }),
                        ),
                      ),
                    ),
                  ),
              ),
          ),
        );
      };
      const gr = new Set();
      function vr(e) {
        return f().createElement(
          Ct.Tooltip,
          {
            content: (0, Pe.t)(
              "grafana-scenes.utils.loading-indicator.content-cancel-query",
              "Cancel query",
            ),
          },
          f().createElement(Ct.Icon, {
            className: "spin-clockwise",
            name: "sync",
            size: "xs",
            role: "button",
            onMouseDown: (t) => {
              e.onCancel(t);
            },
          }),
        );
      }
      function br(e) {
        const t = (0, Ct.useStyles2)(yr),
          n = (0, Ct.useTheme2)(),
          r = "vertical" === e.layout,
          a = Boolean(e.isLoading)
            ? f().createElement(
                "div",
                {
                  style: { marginLeft: n.spacing(1), marginTop: "-1px" },
                  "aria-label": It.components.LoadingIndicator.icon,
                },
                f().createElement(vr, {
                  onCancel: (t) => {
                    var n;
                    (t.preventDefault(),
                      t.stopPropagation(),
                      null == (n = e.onCancel) || n.call(e));
                  },
                }),
              )
            : null;
        let i = null;
        e.error &&
          (i = f().createElement(
            Ct.Tooltip,
            { content: e.error, placement: "bottom" },
            f().createElement(Ct.Icon, { className: t.errorIcon, name: "exclamation-triangle" }),
          ));
        let o = null;
        e.description &&
          (o = f().createElement(
            Ct.Tooltip,
            { content: e.description, placement: r ? "top" : "bottom" },
            f().createElement(Ct.Icon, { className: t.normalIcon, name: "info-circle" }),
          ));
        const s =
          "string" == typeof e.label ? It.pages.Dashboard.SubMenu.submenuItemLabels(e.label) : "";
        let l;
        return (
          (l = r
            ? f().createElement(
                "label",
                {
                  className: (0, Vt.cx)(t.verticalLabel, e.className),
                  "data-testid": s,
                  htmlFor: e.htmlFor,
                },
                e.prefix,
                e.label,
                o,
                i,
                e.icon && f().createElement(Ct.Icon, { name: e.icon, className: t.normalIcon }),
                a,
                e.onRemove &&
                  f().createElement(Ct.IconButton, {
                    variant: "secondary",
                    size: "xs",
                    name: "times",
                    onClick: e.onRemove,
                    tooltip: (0, Pe.t)(
                      "grafana-scenes.utils.controls-label.tooltip-remove",
                      "Remove",
                    ),
                  }),
                e.suffix,
              )
            : f().createElement(
                "label",
                {
                  className: (0, Vt.cx)(t.horizontalLabel, e.className),
                  "data-testid": s,
                  htmlFor: e.htmlFor,
                },
                e.prefix,
                i,
                e.icon && f().createElement(Ct.Icon, { name: e.icon, className: t.normalIcon }),
                e.label,
                o,
                a,
                e.suffix,
              )),
          l
        );
      }
      const yr = (e) => ({
        horizontalLabel: (0, Vt.css)({
          background: e.isDark ? e.colors.background.primary : e.colors.background.secondary,
          display: "flex",
          alignItems: "center",
          padding: e.spacing(0, 1),
          fontWeight: e.typography.fontWeightMedium,
          fontSize: e.typography.bodySmall.fontSize,
          height: e.spacing(e.components.height.md),
          lineHeight: e.spacing(e.components.height.md),
          borderRadius: `${e.shape.radius.default} 0 0 ${e.shape.radius.default}`,
          border: `1px solid ${e.components.input.borderColor}`,
          position: "relative",
          right: -1,
          whiteSpace: "nowrap",
          gap: e.spacing(0.5),
        }),
        verticalLabel: (0, Vt.css)({
          display: "flex",
          alignItems: "center",
          fontWeight: e.typography.fontWeightMedium,
          fontSize: e.typography.bodySmall.fontSize,
          lineHeight: e.typography.bodySmall.lineHeight,
          whiteSpace: "nowrap",
          marginBottom: e.spacing(0.5),
          gap: e.spacing(1),
        }),
        errorIcon: (0, Vt.css)({ color: e.colors.error.text }),
        normalIcon: (0, Vt.css)({ color: e.colors.text.secondary }),
      });
      function wr(e) {
        const t = e.map((e) => {
          var t;
          return null != (t = e.label) ? t : String(e.value);
        });
        return (n) => rn(e, t, n);
      }
      function Sr(e, t) {
        return "" !== e ? { value: e, label: t || e } : null;
      }
      const xr = () => !0;
      function _r({ filter: e, model: t }) {
        var n, r, a, i, o;
        const s = (0, Ct.useStyles2)(Cr),
          [l, u] = (0, p.useState)([]),
          [c, d] = (0, p.useState)([]),
          [h, m] = (0, p.useState)(!1),
          [g, v] = (0, p.useState)(!1),
          [b, y] = (0, p.useState)(!1),
          [w, S] = (0, p.useState)(!1),
          [x, _] = (0, p.useState)(!1),
          [C, O] = (0, p.useState)(""),
          [R, k] = (0, p.useState)(!1),
          [E, T] = (0, p.useState)(
            e.values
              ? e.values.map((t, n) => {
                  var r;
                  return Sr(t, null == (r = e.valueLabels) ? void 0 : r[n]);
                })
              : [],
          ),
          D = sl(e.operator),
          P = Sr(e.key, e.keyLabel),
          A = Sr(e.value, null == (n = e.valueLabels) ? void 0 : n[0]),
          I = (0, p.useMemo)(() => wr(c), [c]),
          V = t.state.onAddCustomValue,
          M = (0, p.useMemo)(() => El(I(C)), [I, C]),
          L = {
            isMulti: !0,
            value: E,
            components: { Option: dn },
            hideSelectedOptions: !1,
            closeMenuOnSelect: !1,
            openMenuOnFocus: !1,
            onChange: (e) => {
              (T(e), e.some((e) => e.__isNew__) && O(""));
            },
            onBlur: () => {
              var n, r;
              t._updateFilter(e, {
                value: null != (r = null == (n = E[0]) ? void 0 : n.value) ? r : "",
                values: E.map((e) => e.value),
                valueLabels: E.map((e) => e.label),
              });
            },
          },
          F = Js.find((t) => e.operator === t.value),
          j = f().createElement(Ct.Select, {
            virtualized: !0,
            allowCustomValue: null == (r = t.state.allowCustomValue) || r,
            createOptionPosition: (null == F ? void 0 : F.isRegex) ? "first" : "last",
            isValidNewOption: (e) => e.trim().length > 0,
            allowCreateWhileLoading: !0,
            formatCreateLabel: (e) => `Use custom value: ${e}`,
            disabled: t.state.readOnly,
            className: (0, Vt.cx)(s.value, w ? s.widthWhenOpen : void 0),
            width: "auto",
            value: A,
            filterOption: xr,
            placeholder: (0, Pe.t)(
              "grafana-scenes.variables.ad-hoc-filter-renderer.value-select.placeholder-select-value",
              "Select value",
            ),
            options: M,
            inputValue: C,
            onInputChange: (e, { action: t }) => ("input-change" === t && O(e), e),
            onChange: (n) => {
              (V && n.__isNew__
                ? t._updateFilter(e, V(n, e))
                : t._updateFilter(e, {
                    value: n.value,
                    valueLabels: n.label ? [n.label] : [n.value],
                  }),
                R !== n.__isNew__ && k(n.__isNew__));
            },
            isOpen: w && !g,
            isLoading: g,
            openMenuOnFocus: !0,
            onOpenMenu: async () => {
              var n;
              (v(!0), S(!0));
              const r = await t._getValuesFor(e);
              (v(!1), d(r), R && O(null != (n = null == A ? void 0 : A.label) ? n : ""));
            },
            onCloseMenu: () => {
              (S(!1), O(""));
            },
            ...(D && L),
          }),
          N = f().createElement(Ct.Select, {
            key: "" + (g ? "loading" : "loaded"),
            disabled: t.state.readOnly,
            className: (0, Vt.cx)(s.key, b ? s.widthWhenOpen : void 0),
            width: "auto",
            allowCustomValue: null == (a = t.state.allowCustomValue) || a,
            createOptionPosition: (null == F ? void 0 : F.isRegex) ? "first" : "last",
            value: P,
            placeholder: (0, Pe.t)(
              "grafana-scenes.variables.ad-hoc-filter-renderer.key-select.placeholder-select-label",
              "Select label",
            ),
            options: El(l),
            onChange: (n) => {
              (t._updateFilter(e, {
                key: n.value,
                keyLabel: n.label,
                value: "",
                valueLabels: [""],
                values: void 0,
              }),
                T([]));
            },
            autoFocus: "" === e.key,
            isOpen: b && !h,
            isLoading: h,
            onOpenMenu: async () => {
              (y(!0), m(!0));
              const n = await t._getKeys(e.key);
              (m(!1), u(n));
            },
            onCloseMenu: () => {
              y(!1);
            },
            onBlur: () => {
              "" === e.key && t._removeFilter(e);
            },
            openMenuOnFocus: !0,
          }),
          B = f().createElement(Ct.Select, {
            className: (0, Vt.cx)(s.operator, { [s.widthWhenOpen]: x }),
            value: e.operator,
            disabled: t.state.readOnly,
            options: t._getOperators(),
            onChange: (n) => {
              var r, a;
              const i = e.operator,
                o = n.value,
                s = { operator: o };
              (sl(i) && !sl(o)
                ? ((s.value = ""), (s.valueLabels = [""]), (s.values = void 0), T([]))
                : !sl(i) &&
                  sl(o) &&
                  e.value &&
                  ((s.values = [e.value]),
                  T([
                    {
                      value: e.value,
                      label:
                        null != (a = null == (r = e.valueLabels) ? void 0 : r[0]) ? a : e.value,
                    },
                  ])),
                t._updateFilter(e, s));
            },
            onOpenMenu: () => {
              _(!0);
            },
            onCloseMenu: () => {
              _(!1);
            },
          });
        if ("vertical" === t.state.layout) {
          if (e.key) {
            const n = f().createElement(br, {
              layout: "vertical",
              label: null != (i = e.key) ? i : "",
              onRemove: () => t._removeFilter(e),
            });
            return f().createElement(
              Ct.Field,
              { label: n, "data-testid": `AdHocFilter-${e.key}`, className: s.field },
              f().createElement("div", { className: s.wrapper }, B, j),
            );
          }
          return f().createElement(
            Ct.Field,
            {
              label: (0, Pe.t)(
                "grafana-scenes.variables.ad-hoc-filter-renderer.label-select-label",
                "Select label",
              ),
              "data-testid": `AdHocFilter-${e.key}`,
              className: s.field,
            },
            N,
          );
        }
        return f().createElement(
          "div",
          { className: s.wrapper, "data-testid": `AdHocFilter-${e.key}` },
          N,
          B,
          j,
          f().createElement(Ct.Button, {
            variant: "secondary",
            "aria-label": (0, Pe.t)(
              "grafana-scenes.variables.ad-hoc-filter-renderer.aria-label-remove-filter",
              "Remove filter",
            ),
            title: (0, Pe.t)(
              "grafana-scenes.variables.ad-hoc-filter-renderer.title-remove-filter",
              "Remove filter",
            ),
            className: s.removeButton,
            icon: "times",
            "data-testid": `AdHocFilter-remove-${null != (o = e.key) ? o : ""}`,
            onClick: () => t._removeFilter(e),
          }),
        );
      }
      const Cr = (e) => ({
        field: (0, Vt.css)({ marginBottom: 0 }),
        wrapper: (0, Vt.css)({
          display: "flex",
          "&:first-child": {
            "> :first-child": { borderBottomLeftRadius: 0, borderTopLeftRadius: 0 },
          },
          "> *": {
            "&:not(:first-child)": { marginLeft: -1 },
            "&:first-child": { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
            "&:last-child": { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
            "&:not(:first-child):not(:last-child)": { borderRadius: 0 },
            position: "relative",
            zIndex: 0,
            "&:hover": { zIndex: 1 },
            "&:focus-within": { zIndex: 2 },
          },
        }),
        widthWhenOpen: (0, Vt.css)({ minWidth: e.spacing(16) }),
        value: (0, Vt.css)({ flexBasis: "content", flexShrink: 1, minWidth: "90px" }),
        key: (0, Vt.css)({ flexBasis: "content", minWidth: "90px", flexShrink: 1 }),
        operator: (0, Vt.css)({ flexShrink: 0, flexBasis: "content" }),
        removeButton: (0, Vt.css)({
          paddingLeft: e.spacing(1.5),
          paddingRight: e.spacing(1.5),
          borderLeft: "none",
          width: e.spacing(3),
          marginRight: e.spacing(1),
          boxSizing: "border-box",
          position: "relative",
          left: "1px",
        }),
      });
      function Or({ model: e, addFilterButtonText: t }) {
        const { _wip: n } = e.useState(),
          r = (0, Ct.useStyles2)(Rr);
        return n
          ? f().createElement(_r, { filter: n, model: e })
          : f().createElement(
              Ct.Button,
              {
                variant: "secondary",
                icon: "plus",
                title: (0, Pe.t)(
                  "grafana-scenes.variables.ad-hoc-filter-builder.title-add-filter",
                  "Add filter",
                ),
                "aria-label": (0, Pe.t)(
                  "grafana-scenes.variables.ad-hoc-filter-builder.aria-label-add-filter",
                  "Add filter",
                ),
                "data-testid": "AdHocFilter-add",
                onClick: () => e._addWip(),
                className: r.addButton,
              },
              t,
            );
      }
      const Rr = (e) => ({
        addButton: (0, Vt.css)({
          "&:first-child": { borderBottomLeftRadius: 0, borderTopLeftRadius: 0 },
        }),
      });
      class kr {
        constructor(e) {
          this._variable = e;
        }
        getKey() {
          return `var-${this._variable.state.name}`;
        }
        getKeys() {
          return [this.getKey()];
        }
        getUrlState() {
          const e = this._variable.state.filters,
            t = this._variable.state.originFilters;
          let n = [];
          return 0 === e.length && 0 === (null == t ? void 0 : t.length)
            ? { [this.getKey()]: [""] }
            : (e.length &&
                n.push(
                  ...e
                    .filter(il)
                    .filter((e) => !e.hidden)
                    .map((e) => Er(e).map(_l).join("|")),
                ),
              (null == t ? void 0 : t.length) &&
                n.push(
                  ...(null == t
                    ? void 0
                    : t
                        .filter(il)
                        .filter((e) => !e.hidden && e.origin && e.restorable)
                        .map((e) => Er(e).map(_l).join("|").concat(`#${e.origin}#restorable`))),
                ),
              { [this.getKey()]: n.length ? n : [""] });
        }
        updateFromUrl(e) {
          const t = e[this.getKey()];
          if (null == t) return;
          const n = (function (e) {
              if (Array.isArray(e)) {
                return e.map(Tr).filter(Dr);
              }
              const t = Tr(e);
              return null === t ? [] : [t];
            })(t),
            r = (function (e, t) {
              const n = [...e];
              for (let r = 0; r < t.length; r++) {
                const a = e.findIndex((e) => e.key === t[r].key);
                a > -1 && t[r].origin === e[a].origin
                  ? (al(t[r]) && (t[r].matchAllFilter = !0), (n[a] = t[r]))
                  : "dashboard" === t[r].origin
                    ? (delete t[r].origin, delete t[r].restorable)
                    : -1 === a && "scope" === t[r].origin && t[r].restorable && n.push(t[r]);
              }
              return n;
            })([...(this._variable.state.originFilters || [])], n);
          this._variable.setState({ filters: n.filter((e) => !e.origin), originFilters: r });
        }
      }
      function Er(e) {
        var t;
        const n = [Ol(e.key, e.keyLabel), e.operator];
        return (
          sl(e.operator)
            ? e.values.forEach((t, r) => {
                var a;
                n.push(Ol(t, null == (a = e.valueLabels) ? void 0 : a[r]));
              })
            : n.push(Ol(e.value, null == (t = e.valueLabels) ? void 0 : t[0])),
          n
        );
      }
      function Tr(e) {
        if ("string" != typeof e || 0 === e.length) return null;
        const [t, n, r] = e.split("#"),
          [a, i, o, s, ...l] = t
            .split("|")
            .reduce((e, t) => {
              const [n, r] = t.split(",");
              return (e.push(n, null != r ? r : n), e);
            }, [])
            .map(Cl);
        return {
          key: a,
          keyLabel: i,
          operator: o,
          value: l[0],
          values: sl(o) ? l.filter((e, t) => t % 2 == 0) : void 0,
          valueLabels: l.filter((e, t) => t % 2 == 1),
          condition: "",
          ...((u = n), ("scope" === u || "dashboard" === u) && { origin: n }),
          ...(!!r && { restorable: !0 }),
        };
        var u;
      }
      function Dr(e) {
        return null !== e && "string" == typeof e.key && "string" == typeof e.value;
      }
      function Pr() {
        return "undefined" != typeof window;
      }
      function Ar(e) {
        return Mr(e) ? (e.nodeName || "").toLowerCase() : "#document";
      }
      function Ir(e) {
        var t;
        return (null == e || null == (t = e.ownerDocument) ? void 0 : t.defaultView) || window;
      }
      function Vr(e) {
        var t;
        return null == (t = (Mr(e) ? e.ownerDocument : e.document) || window.document)
          ? void 0
          : t.documentElement;
      }
      function Mr(e) {
        return !!Pr() && (e instanceof Node || e instanceof Ir(e).Node);
      }
      function Lr(e) {
        return !!Pr() && (e instanceof Element || e instanceof Ir(e).Element);
      }
      function Fr(e) {
        return !!Pr() && (e instanceof HTMLElement || e instanceof Ir(e).HTMLElement);
      }
      function jr(e) {
        return (
          !(!Pr() || "undefined" == typeof ShadowRoot) &&
          (e instanceof ShadowRoot || e instanceof Ir(e).ShadowRoot)
        );
      }
      const Nr = new Set(["inline", "contents"]);
      function Br(e) {
        const { overflow: t, overflowX: n, overflowY: r, display: a } = Xr(e);
        return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !Nr.has(a);
      }
      const zr = new Set(["table", "td", "th"]);
      function $r(e) {
        return zr.has(Ar(e));
      }
      const Wr = [":popover-open", ":modal"];
      function Hr(e) {
        return Wr.some((t) => {
          try {
            return e.matches(t);
          } catch (e) {
            return !1;
          }
        });
      }
      const Ur = ["transform", "translate", "scale", "rotate", "perspective"],
        qr = ["transform", "translate", "scale", "rotate", "perspective", "filter"],
        Gr = ["paint", "layout", "strict", "content"];
      function Qr(e) {
        const t = Kr(),
          n = Lr(e) ? Xr(e) : e;
        return (
          Ur.some((e) => !!n[e] && "none" !== n[e]) ||
          (!!n.containerType && "normal" !== n.containerType) ||
          (!t && !!n.backdropFilter && "none" !== n.backdropFilter) ||
          (!t && !!n.filter && "none" !== n.filter) ||
          qr.some((e) => (n.willChange || "").includes(e)) ||
          Gr.some((e) => (n.contain || "").includes(e))
        );
      }
      function Kr() {
        return (
          !("undefined" == typeof CSS || !CSS.supports) &&
          CSS.supports("-webkit-backdrop-filter", "none")
        );
      }
      const Yr = new Set(["html", "body", "#document"]);
      function Zr(e) {
        return Yr.has(Ar(e));
      }
      function Xr(e) {
        return Ir(e).getComputedStyle(e);
      }
      function Jr(e) {
        return Lr(e)
          ? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
          : { scrollLeft: e.scrollX, scrollTop: e.scrollY };
      }
      function ea(e) {
        if ("html" === Ar(e)) return e;
        const t = e.assignedSlot || e.parentNode || (jr(e) && e.host) || Vr(e);
        return jr(t) ? t.host : t;
      }
      function ta(e) {
        const t = ea(e);
        return Zr(t)
          ? e.ownerDocument
            ? e.ownerDocument.body
            : e.body
          : Fr(t) && Br(t)
            ? t
            : ta(t);
      }
      function na(e, t, n) {
        var r;
        (void 0 === t && (t = []), void 0 === n && (n = !0));
        const a = ta(e),
          i = a === (null == (r = e.ownerDocument) ? void 0 : r.body),
          o = Ir(a);
        if (i) {
          const e = ra(o);
          return t.concat(o, o.visualViewport || [], Br(a) ? a : [], e && n ? na(e) : []);
        }
        return t.concat(a, na(a, [], n));
      }
      function ra(e) {
        return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
      }
      function aa(e) {
        let t = e.activeElement;
        for (
          ;
          null != (null == (n = t) || null == (n = n.shadowRoot) ? void 0 : n.activeElement);

        ) {
          var n;
          t = t.shadowRoot.activeElement;
        }
        return t;
      }
      function ia(e, t) {
        if (!e || !t) return !1;
        const n = null == t.getRootNode ? void 0 : t.getRootNode();
        if (e.contains(t)) return !0;
        if (n && jr(n)) {
          let n = t;
          for (; n; ) {
            if (e === n) return !0;
            n = n.parentNode || n.host;
          }
        }
        return !1;
      }
      function oa() {
        const e = navigator.userAgentData;
        return null != e && e.platform ? e.platform : navigator.platform;
      }
      function sa() {
        const e = navigator.userAgentData;
        return e && Array.isArray(e.brands)
          ? e.brands
              .map((e) => {
                let { brand: t, version: n } = e;
                return t + "/" + n;
              })
              .join(" ")
          : navigator.userAgent;
      }
      function la(e) {
        return (
          !(0 !== e.mozInputSource || !e.isTrusted) ||
          (da() && e.pointerType
            ? "click" === e.type && 1 === e.buttons
            : 0 === e.detail && !e.pointerType)
        );
      }
      function ua(e) {
        return (
          !sa().includes("jsdom/") &&
          ((!da() && 0 === e.width && 0 === e.height) ||
            (da() &&
              1 === e.width &&
              1 === e.height &&
              0 === e.pressure &&
              0 === e.detail &&
              "mouse" === e.pointerType) ||
            (e.width < 1 &&
              e.height < 1 &&
              0 === e.pressure &&
              0 === e.detail &&
              "touch" === e.pointerType))
        );
      }
      function ca() {
        return /apple/i.test(navigator.vendor);
      }
      function da() {
        const e = /android/i;
        return e.test(oa()) || e.test(sa());
      }
      function pa(e) {
        return (null == e ? void 0 : e.ownerDocument) || document;
      }
      function ha(e, t) {
        if (null == t) return !1;
        if ("composedPath" in e) return e.composedPath().includes(t);
        const n = e;
        return null != n.target && t.contains(n.target);
      }
      function fa(e) {
        return "composedPath" in e ? e.composedPath()[0] : e.target;
      }
      function ma(e) {
        (e.preventDefault(), e.stopPropagation());
      }
      function ga(e) {
        return (
          !!e &&
          "combobox" === e.getAttribute("role") &&
          (function (e) {
            return (
              Fr(e) &&
              e.matches(
                "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])",
              )
            );
          })(e)
        );
      }
      const va = Math.min,
        ba = Math.max,
        ya = Math.round,
        wa = Math.floor,
        Sa = (e) => ({ x: e, y: e }),
        xa = { left: "right", right: "left", bottom: "top", top: "bottom" },
        _a = { start: "end", end: "start" };
      function Ca(e, t) {
        return "function" == typeof e ? e(t) : e;
      }
      function Oa(e) {
        return e.split("-")[0];
      }
      function Ra(e) {
        return e.split("-")[1];
      }
      function ka(e) {
        return "y" === e ? "height" : "width";
      }
      const Ea = new Set(["top", "bottom"]);
      function Ta(e) {
        return Ea.has(Oa(e)) ? "y" : "x";
      }
      function Da(e) {
        return "x" === Ta(e) ? "y" : "x";
      }
      function Pa(e) {
        return e.replace(/start|end/g, (e) => _a[e]);
      }
      const Aa = ["left", "right"],
        Ia = ["right", "left"],
        Va = ["top", "bottom"],
        Ma = ["bottom", "top"];
      function La(e, t, n, r) {
        const a = Ra(e);
        let i = (function (e, t, n) {
          switch (e) {
            case "top":
            case "bottom":
              return n ? (t ? Ia : Aa) : t ? Aa : Ia;
            case "left":
            case "right":
              return t ? Va : Ma;
            default:
              return [];
          }
        })(Oa(e), "start" === n, r);
        return (a && ((i = i.map((e) => e + "-" + a)), t && (i = i.concat(i.map(Pa)))), i);
      }
      function Fa(e) {
        return e.replace(/left|right|bottom|top/g, (e) => xa[e]);
      }
      function ja(e) {
        const { x: t, y: n, width: r, height: a } = e;
        return { width: r, height: a, top: n, left: t, right: t + r, bottom: n + a, x: t, y: n };
      }
      var Na = [
          "input:not([inert])",
          "select:not([inert])",
          "textarea:not([inert])",
          "a[href]:not([inert])",
          "button:not([inert])",
          "[tabindex]:not(slot):not([inert])",
          "audio[controls]:not([inert])",
          "video[controls]:not([inert])",
          '[contenteditable]:not([contenteditable="false"]):not([inert])',
          "details>summary:first-of-type:not([inert])",
          "details:not([inert])",
        ],
        Ba = Na.join(","),
        za = "undefined" == typeof Element,
        $a = za
          ? function () {}
          : Element.prototype.matches ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector,
        Wa =
          !za && Element.prototype.getRootNode
            ? function (e) {
                var t;
                return null == e || null === (t = e.getRootNode) || void 0 === t
                  ? void 0
                  : t.call(e);
              }
            : function (e) {
                return null == e ? void 0 : e.ownerDocument;
              },
        Ha = function e(t, n) {
          var r;
          void 0 === n && (n = !0);
          var a =
            null == t || null === (r = t.getAttribute) || void 0 === r
              ? void 0
              : r.call(t, "inert");
          return "" === a || "true" === a || (n && t && e(t.parentNode));
        },
        Ua = function (e, t, n) {
          if (Ha(e)) return [];
          var r = Array.prototype.slice.apply(e.querySelectorAll(Ba));
          return (t && $a.call(e, Ba) && r.unshift(e), (r = r.filter(n)));
        },
        qa = function e(t, n, r) {
          for (var a = [], i = Array.from(t); i.length; ) {
            var o = i.shift();
            if (!Ha(o, !1))
              if ("SLOT" === o.tagName) {
                var s = o.assignedElements(),
                  l = e(s.length ? s : o.children, !0, r);
                r.flatten ? a.push.apply(a, l) : a.push({ scopeParent: o, candidates: l });
              } else {
                $a.call(o, Ba) && r.filter(o) && (n || !t.includes(o)) && a.push(o);
                var u =
                    o.shadowRoot || ("function" == typeof r.getShadowRoot && r.getShadowRoot(o)),
                  c = !Ha(u, !1) && (!r.shadowRootFilter || r.shadowRootFilter(o));
                if (u && c) {
                  var d = e(!0 === u ? o.children : u.children, !0, r);
                  r.flatten ? a.push.apply(a, d) : a.push({ scopeParent: o, candidates: d });
                } else i.unshift.apply(i, o.children);
              }
          }
          return a;
        },
        Ga = function (e) {
          return !isNaN(parseInt(e.getAttribute("tabindex"), 10));
        },
        Qa = function (e) {
          if (!e) throw new Error("No node provided");
          return e.tabIndex < 0 &&
            (/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName) ||
              (function (e) {
                var t,
                  n =
                    null == e || null === (t = e.getAttribute) || void 0 === t
                      ? void 0
                      : t.call(e, "contenteditable");
                return "" === n || "true" === n;
              })(e)) &&
            !Ga(e)
            ? 0
            : e.tabIndex;
        },
        Ka = function (e, t) {
          return e.tabIndex === t.tabIndex
            ? e.documentOrder - t.documentOrder
            : e.tabIndex - t.tabIndex;
        },
        Ya = function (e) {
          return "INPUT" === e.tagName;
        },
        Za = function (e) {
          return (
            (function (e) {
              return Ya(e) && "radio" === e.type;
            })(e) &&
            !(function (e) {
              if (!e.name) return !0;
              var t,
                n = e.form || Wa(e),
                r = function (e) {
                  return n.querySelectorAll('input[type="radio"][name="' + e + '"]');
                };
              if (
                "undefined" != typeof window &&
                void 0 !== window.CSS &&
                "function" == typeof window.CSS.escape
              )
                t = r(window.CSS.escape(e.name));
              else
                try {
                  t = r(e.name);
                } catch (e) {
                  return (
                    console.error(
                      "Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s",
                      e.message,
                    ),
                    !1
                  );
                }
              var a = (function (e, t) {
                for (var n = 0; n < e.length; n++) if (e[n].checked && e[n].form === t) return e[n];
              })(t, e.form);
              return !a || a === e;
            })(e)
          );
        },
        Xa = function (e) {
          var t = e.getBoundingClientRect(),
            n = t.width,
            r = t.height;
          return 0 === n && 0 === r;
        },
        Ja = function (e, t) {
          var n = t.displayCheck,
            r = t.getShadowRoot;
          if ("hidden" === getComputedStyle(e).visibility) return !0;
          var a = $a.call(e, "details>summary:first-of-type") ? e.parentElement : e;
          if ($a.call(a, "details:not([open]) *")) return !0;
          if (n && "full" !== n && "legacy-full" !== n) {
            if ("non-zero-area" === n) return Xa(e);
          } else {
            if ("function" == typeof r) {
              for (var i = e; e; ) {
                var o = e.parentElement,
                  s = Wa(e);
                if (o && !o.shadowRoot && !0 === r(o)) return Xa(e);
                e = e.assignedSlot ? e.assignedSlot : o || s === e.ownerDocument ? o : s.host;
              }
              e = i;
            }
            if (
              (function (e) {
                var t,
                  n,
                  r,
                  a,
                  i = e && Wa(e),
                  o = null === (t = i) || void 0 === t ? void 0 : t.host,
                  s = !1;
                if (i && i !== e)
                  for (
                    s = !!(
                      (null !== (n = o) &&
                        void 0 !== n &&
                        null !== (r = n.ownerDocument) &&
                        void 0 !== r &&
                        r.contains(o)) ||
                      (null != e && null !== (a = e.ownerDocument) && void 0 !== a && a.contains(e))
                    );
                    !s && o;

                  ) {
                    var l, u, c;
                    s = !(
                      null ===
                        (u = o = null === (l = i = Wa(o)) || void 0 === l ? void 0 : l.host) ||
                      void 0 === u ||
                      null === (c = u.ownerDocument) ||
                      void 0 === c ||
                      !c.contains(o)
                    );
                  }
                return s;
              })(e)
            )
              return !e.getClientRects().length;
            if ("legacy-full" !== n) return !0;
          }
          return !1;
        },
        ei = function (e, t) {
          return !(
            t.disabled ||
            Ha(t) ||
            (function (e) {
              return Ya(e) && "hidden" === e.type;
            })(t) ||
            Ja(t, e) ||
            (function (e) {
              return (
                "DETAILS" === e.tagName &&
                Array.prototype.slice.apply(e.children).some(function (e) {
                  return "SUMMARY" === e.tagName;
                })
              );
            })(t) ||
            (function (e) {
              if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))
                for (var t = e.parentElement; t; ) {
                  if ("FIELDSET" === t.tagName && t.disabled) {
                    for (var n = 0; n < t.children.length; n++) {
                      var r = t.children.item(n);
                      if ("LEGEND" === r.tagName)
                        return !!$a.call(t, "fieldset[disabled] *") || !r.contains(e);
                    }
                    return !0;
                  }
                  t = t.parentElement;
                }
              return !1;
            })(t)
          );
        },
        ti = function (e, t) {
          return !(Za(t) || Qa(t) < 0 || !ei(e, t));
        },
        ni = function (e) {
          var t = parseInt(e.getAttribute("tabindex"), 10);
          return !!(isNaN(t) || t >= 0);
        },
        ri = function e(t) {
          var n = [],
            r = [];
          return (
            t.forEach(function (t, a) {
              var i = !!t.scopeParent,
                o = i ? t.scopeParent : t,
                s = (function (e, t) {
                  var n = Qa(e);
                  return n < 0 && t && !Ga(e) ? 0 : n;
                })(o, i),
                l = i ? e(t.candidates) : o;
              0 === s
                ? i
                  ? n.push.apply(n, l)
                  : n.push(o)
                : r.push({ documentOrder: a, tabIndex: s, item: t, isScope: i, content: l });
            }),
            r
              .sort(Ka)
              .reduce(function (e, t) {
                return (t.isScope ? e.push.apply(e, t.content) : e.push(t.content), e);
              }, [])
              .concat(n)
          );
        },
        ai = function (e, t) {
          var n;
          return (
            (n = (t = t || {}).getShadowRoot
              ? qa([e], t.includeContainer, {
                  filter: ti.bind(null, t),
                  flatten: !1,
                  getShadowRoot: t.getShadowRoot,
                  shadowRootFilter: ni,
                })
              : Ua(e, t.includeContainer, ti.bind(null, t))),
            ri(n)
          );
        },
        ii = n(8398);
      function oi(e, t, n) {
        let { reference: r, floating: a } = e;
        const i = Ta(t),
          o = Da(t),
          s = ka(o),
          l = Oa(t),
          u = "y" === i,
          c = r.x + r.width / 2 - a.width / 2,
          d = r.y + r.height / 2 - a.height / 2,
          p = r[s] / 2 - a[s] / 2;
        let h;
        switch (l) {
          case "top":
            h = { x: c, y: r.y - a.height };
            break;
          case "bottom":
            h = { x: c, y: r.y + r.height };
            break;
          case "right":
            h = { x: r.x + r.width, y: d };
            break;
          case "left":
            h = { x: r.x - a.width, y: d };
            break;
          default:
            h = { x: r.x, y: r.y };
        }
        switch (Ra(t)) {
          case "start":
            h[o] -= p * (n && u ? -1 : 1);
            break;
          case "end":
            h[o] += p * (n && u ? -1 : 1);
        }
        return h;
      }
      async function si(e, t) {
        var n;
        void 0 === t && (t = {});
        const { x: r, y: a, platform: i, rects: o, elements: s, strategy: l } = e,
          {
            boundary: u = "clippingAncestors",
            rootBoundary: c = "viewport",
            elementContext: d = "floating",
            altBoundary: p = !1,
            padding: h = 0,
          } = Ca(t, e),
          f = (function (e) {
            return "number" != typeof e
              ? (function (e) {
                  return { top: 0, right: 0, bottom: 0, left: 0, ...e };
                })(e)
              : { top: e, right: e, bottom: e, left: e };
          })(h),
          m = s[p ? ("floating" === d ? "reference" : "floating") : d],
          g = ja(
            await i.getClippingRect({
              element:
                null == (n = await (null == i.isElement ? void 0 : i.isElement(m))) || n
                  ? m
                  : m.contextElement ||
                    (await (null == i.getDocumentElement
                      ? void 0
                      : i.getDocumentElement(s.floating))),
              boundary: u,
              rootBoundary: c,
              strategy: l,
            }),
          ),
          v =
            "floating" === d
              ? { x: r, y: a, width: o.floating.width, height: o.floating.height }
              : o.reference,
          b = await (null == i.getOffsetParent ? void 0 : i.getOffsetParent(s.floating)),
          y = ((await (null == i.isElement ? void 0 : i.isElement(b))) &&
            (await (null == i.getScale ? void 0 : i.getScale(b)))) || { x: 1, y: 1 },
          w = ja(
            i.convertOffsetParentRelativeRectToViewportRelativeRect
              ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
                  elements: s,
                  rect: v,
                  offsetParent: b,
                  strategy: l,
                })
              : v,
          );
        return {
          top: (g.top - w.top + f.top) / y.y,
          bottom: (w.bottom - g.bottom + f.bottom) / y.y,
          left: (g.left - w.left + f.left) / y.x,
          right: (w.right - g.right + f.right) / y.x,
        };
      }
      const li = new Set(["left", "top"]);
      function ui(e) {
        const t = Xr(e);
        let n = parseFloat(t.width) || 0,
          r = parseFloat(t.height) || 0;
        const a = Fr(e),
          i = a ? e.offsetWidth : n,
          o = a ? e.offsetHeight : r,
          s = ya(n) !== i || ya(r) !== o;
        return (s && ((n = i), (r = o)), { width: n, height: r, $: s });
      }
      function ci(e) {
        return Lr(e) ? e : e.contextElement;
      }
      function di(e) {
        const t = ci(e);
        if (!Fr(t)) return Sa(1);
        const n = t.getBoundingClientRect(),
          { width: r, height: a, $: i } = ui(t);
        let o = (i ? ya(n.width) : n.width) / r,
          s = (i ? ya(n.height) : n.height) / a;
        return (
          (o && Number.isFinite(o)) || (o = 1),
          (s && Number.isFinite(s)) || (s = 1),
          { x: o, y: s }
        );
      }
      const pi = Sa(0);
      function hi(e) {
        const t = Ir(e);
        return Kr() && t.visualViewport
          ? { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop }
          : pi;
      }
      function fi(e, t, n, r) {
        (void 0 === t && (t = !1), void 0 === n && (n = !1));
        const a = e.getBoundingClientRect(),
          i = ci(e);
        let o = Sa(1);
        t && (r ? Lr(r) && (o = di(r)) : (o = di(e)));
        const s = (function (e, t, n) {
          return (void 0 === t && (t = !1), !(!n || (t && n !== Ir(e))) && t);
        })(i, n, r)
          ? hi(i)
          : Sa(0);
        let l = (a.left + s.x) / o.x,
          u = (a.top + s.y) / o.y,
          c = a.width / o.x,
          d = a.height / o.y;
        if (i) {
          const e = Ir(i),
            t = r && Lr(r) ? Ir(r) : r;
          let n = e,
            a = ra(n);
          for (; a && r && t !== n; ) {
            const e = di(a),
              t = a.getBoundingClientRect(),
              r = Xr(a),
              i = t.left + (a.clientLeft + parseFloat(r.paddingLeft)) * e.x,
              o = t.top + (a.clientTop + parseFloat(r.paddingTop)) * e.y;
            ((l *= e.x),
              (u *= e.y),
              (c *= e.x),
              (d *= e.y),
              (l += i),
              (u += o),
              (n = Ir(a)),
              (a = ra(n)));
          }
        }
        return ja({ width: c, height: d, x: l, y: u });
      }
      function mi(e, t) {
        const n = Jr(e).scrollLeft;
        return t ? t.left + n : fi(Vr(e)).left + n;
      }
      function gi(e, t) {
        const n = e.getBoundingClientRect();
        return { x: n.left + t.scrollLeft - mi(e, n), y: n.top + t.scrollTop };
      }
      const vi = new Set(["absolute", "fixed"]);
      function bi(e, t, n) {
        let r;
        if ("viewport" === t)
          r = (function (e, t) {
            const n = Ir(e),
              r = Vr(e),
              a = n.visualViewport;
            let i = r.clientWidth,
              o = r.clientHeight,
              s = 0,
              l = 0;
            if (a) {
              ((i = a.width), (o = a.height));
              const e = Kr();
              (!e || (e && "fixed" === t)) && ((s = a.offsetLeft), (l = a.offsetTop));
            }
            const u = mi(r);
            if (u <= 0) {
              const e = r.ownerDocument,
                t = e.body,
                n = getComputedStyle(t),
                a =
                  ("CSS1Compat" === e.compatMode &&
                    parseFloat(n.marginLeft) + parseFloat(n.marginRight)) ||
                  0,
                o = Math.abs(r.clientWidth - t.clientWidth - a);
              o <= 25 && (i -= o);
            } else u <= 25 && (i += u);
            return { width: i, height: o, x: s, y: l };
          })(e, n);
        else if ("document" === t)
          r = (function (e) {
            const t = Vr(e),
              n = Jr(e),
              r = e.ownerDocument.body,
              a = ba(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth),
              i = ba(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
            let o = -n.scrollLeft + mi(e);
            const s = -n.scrollTop;
            return (
              "rtl" === Xr(r).direction && (o += ba(t.clientWidth, r.clientWidth) - a),
              { width: a, height: i, x: o, y: s }
            );
          })(Vr(e));
        else if (Lr(t))
          r = (function (e, t) {
            const n = fi(e, !0, "fixed" === t),
              r = n.top + e.clientTop,
              a = n.left + e.clientLeft,
              i = Fr(e) ? di(e) : Sa(1);
            return {
              width: e.clientWidth * i.x,
              height: e.clientHeight * i.y,
              x: a * i.x,
              y: r * i.y,
            };
          })(t, n);
        else {
          const n = hi(e);
          r = { x: t.x - n.x, y: t.y - n.y, width: t.width, height: t.height };
        }
        return ja(r);
      }
      function yi(e, t) {
        const n = ea(e);
        return !(n === t || !Lr(n) || Zr(n)) && ("fixed" === Xr(n).position || yi(n, t));
      }
      function wi(e, t, n) {
        const r = Fr(t),
          a = Vr(t),
          i = "fixed" === n,
          o = fi(e, !0, i, t);
        let s = { scrollLeft: 0, scrollTop: 0 };
        const l = Sa(0);
        function u() {
          l.x = mi(a);
        }
        if (r || (!r && !i))
          if ((("body" !== Ar(t) || Br(a)) && (s = Jr(t)), r)) {
            const e = fi(t, !0, i, t);
            ((l.x = e.x + t.clientLeft), (l.y = e.y + t.clientTop));
          } else a && u();
        i && !r && a && u();
        const c = !a || r || i ? Sa(0) : gi(a, s);
        return {
          x: o.left + s.scrollLeft - l.x - c.x,
          y: o.top + s.scrollTop - l.y - c.y,
          width: o.width,
          height: o.height,
        };
      }
      function Si(e) {
        return "static" === Xr(e).position;
      }
      function xi(e, t) {
        if (!Fr(e) || "fixed" === Xr(e).position) return null;
        if (t) return t(e);
        let n = e.offsetParent;
        return (Vr(e) === n && (n = n.ownerDocument.body), n);
      }
      function _i(e, t) {
        const n = Ir(e);
        if (Hr(e)) return n;
        if (!Fr(e)) {
          let t = ea(e);
          for (; t && !Zr(t); ) {
            if (Lr(t) && !Si(t)) return t;
            t = ea(t);
          }
          return n;
        }
        let r = xi(e, t);
        for (; r && $r(r) && Si(r); ) r = xi(r, t);
        return r && Zr(r) && Si(r) && !Qr(r)
          ? n
          : r ||
              (function (e) {
                let t = ea(e);
                for (; Fr(t) && !Zr(t); ) {
                  if (Qr(t)) return t;
                  if (Hr(t)) return null;
                  t = ea(t);
                }
                return null;
              })(e) ||
              n;
      }
      const Ci = {
        convertOffsetParentRelativeRectToViewportRelativeRect: function (e) {
          let { elements: t, rect: n, offsetParent: r, strategy: a } = e;
          const i = "fixed" === a,
            o = Vr(r),
            s = !!t && Hr(t.floating);
          if (r === o || (s && i)) return n;
          let l = { scrollLeft: 0, scrollTop: 0 },
            u = Sa(1);
          const c = Sa(0),
            d = Fr(r);
          if ((d || (!d && !i)) && (("body" !== Ar(r) || Br(o)) && (l = Jr(r)), Fr(r))) {
            const e = fi(r);
            ((u = di(r)), (c.x = e.x + r.clientLeft), (c.y = e.y + r.clientTop));
          }
          const p = !o || d || i ? Sa(0) : gi(o, l);
          return {
            width: n.width * u.x,
            height: n.height * u.y,
            x: n.x * u.x - l.scrollLeft * u.x + c.x + p.x,
            y: n.y * u.y - l.scrollTop * u.y + c.y + p.y,
          };
        },
        getDocumentElement: Vr,
        getClippingRect: function (e) {
          let { element: t, boundary: n, rootBoundary: r, strategy: a } = e;
          const i = [
              ...("clippingAncestors" === n
                ? Hr(t)
                  ? []
                  : (function (e, t) {
                      const n = t.get(e);
                      if (n) return n;
                      let r = na(e, [], !1).filter((e) => Lr(e) && "body" !== Ar(e)),
                        a = null;
                      const i = "fixed" === Xr(e).position;
                      let o = i ? ea(e) : e;
                      for (; Lr(o) && !Zr(o); ) {
                        const t = Xr(o),
                          n = Qr(o);
                        (n || "fixed" !== t.position || (a = null),
                          (
                            i
                              ? !n && !a
                              : (!n && "static" === t.position && a && vi.has(a.position)) ||
                                (Br(o) && !n && yi(e, o))
                          )
                            ? (r = r.filter((e) => e !== o))
                            : (a = t),
                          (o = ea(o)));
                      }
                      return (t.set(e, r), r);
                    })(t, this._c)
                : [].concat(n)),
              r,
            ],
            o = i[0],
            s = i.reduce(
              (e, n) => {
                const r = bi(t, n, a);
                return (
                  (e.top = ba(r.top, e.top)),
                  (e.right = va(r.right, e.right)),
                  (e.bottom = va(r.bottom, e.bottom)),
                  (e.left = ba(r.left, e.left)),
                  e
                );
              },
              bi(t, o, a),
            );
          return { width: s.right - s.left, height: s.bottom - s.top, x: s.left, y: s.top };
        },
        getOffsetParent: _i,
        getElementRects: async function (e) {
          const t = this.getOffsetParent || _i,
            n = this.getDimensions,
            r = await n(e.floating);
          return {
            reference: wi(e.reference, await t(e.floating), e.strategy),
            floating: { x: 0, y: 0, width: r.width, height: r.height },
          };
        },
        getClientRects: function (e) {
          return Array.from(e.getClientRects());
        },
        getDimensions: function (e) {
          const { width: t, height: n } = ui(e);
          return { width: t, height: n };
        },
        getScale: di,
        isElement: Lr,
        isRTL: function (e) {
          return "rtl" === Xr(e).direction;
        },
      };
      function Oi(e, t) {
        return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
      }
      function Ri(e, t, n, r) {
        void 0 === r && (r = {});
        const {
            ancestorScroll: a = !0,
            ancestorResize: i = !0,
            elementResize: o = "function" == typeof ResizeObserver,
            layoutShift: s = "function" == typeof IntersectionObserver,
            animationFrame: l = !1,
          } = r,
          u = ci(e),
          c = a || i ? [...(u ? na(u) : []), ...na(t)] : [];
        c.forEach((e) => {
          (a && e.addEventListener("scroll", n, { passive: !0 }),
            i && e.addEventListener("resize", n));
        });
        const d =
          u && s
            ? (function (e, t) {
                let n,
                  r = null;
                const a = Vr(e);
                function i() {
                  var e;
                  (clearTimeout(n), null == (e = r) || e.disconnect(), (r = null));
                }
                return (
                  (function o(s, l) {
                    (void 0 === s && (s = !1), void 0 === l && (l = 1), i());
                    const u = e.getBoundingClientRect(),
                      { left: c, top: d, width: p, height: h } = u;
                    if ((s || t(), !p || !h)) return;
                    const f = {
                      rootMargin:
                        -wa(d) +
                        "px " +
                        -wa(a.clientWidth - (c + p)) +
                        "px " +
                        -wa(a.clientHeight - (d + h)) +
                        "px " +
                        -wa(c) +
                        "px",
                      threshold: ba(0, va(1, l)) || 1,
                    };
                    let m = !0;
                    function g(t) {
                      const r = t[0].intersectionRatio;
                      if (r !== l) {
                        if (!m) return o();
                        r
                          ? o(!1, r)
                          : (n = setTimeout(() => {
                              o(!1, 1e-7);
                            }, 1e3));
                      }
                      (1 !== r || Oi(u, e.getBoundingClientRect()) || o(), (m = !1));
                    }
                    try {
                      r = new IntersectionObserver(g, { ...f, root: a.ownerDocument });
                    } catch (e) {
                      r = new IntersectionObserver(g, f);
                    }
                    r.observe(e);
                  })(!0),
                  i
                );
              })(u, n)
            : null;
        let p,
          h = -1,
          f = null;
        o &&
          ((f = new ResizeObserver((e) => {
            let [r] = e;
            (r &&
              r.target === u &&
              f &&
              (f.unobserve(t),
              cancelAnimationFrame(h),
              (h = requestAnimationFrame(() => {
                var e;
                null == (e = f) || e.observe(t);
              }))),
              n());
          })),
          u && !l && f.observe(u),
          f.observe(t));
        let m = l ? fi(e) : null;
        return (
          l &&
            (function t() {
              const r = fi(e);
              m && !Oi(m, r) && n();
              ((m = r), (p = requestAnimationFrame(t)));
            })(),
          n(),
          () => {
            var e;
            (c.forEach((e) => {
              (a && e.removeEventListener("scroll", n), i && e.removeEventListener("resize", n));
            }),
              null == d || d(),
              null == (e = f) || e.disconnect(),
              (f = null),
              l && cancelAnimationFrame(p));
          }
        );
      }
      const ki = function (e) {
          return (
            void 0 === e && (e = 0),
            {
              name: "offset",
              options: e,
              async fn(t) {
                var n, r;
                const { x: a, y: i, placement: o, middlewareData: s } = t,
                  l = await (async function (e, t) {
                    const { placement: n, platform: r, elements: a } = e,
                      i = await (null == r.isRTL ? void 0 : r.isRTL(a.floating)),
                      o = Oa(n),
                      s = Ra(n),
                      l = "y" === Ta(n),
                      u = li.has(o) ? -1 : 1,
                      c = i && l ? -1 : 1,
                      d = Ca(t, e);
                    let {
                      mainAxis: p,
                      crossAxis: h,
                      alignmentAxis: f,
                    } = "number" == typeof d
                      ? { mainAxis: d, crossAxis: 0, alignmentAxis: null }
                      : {
                          mainAxis: d.mainAxis || 0,
                          crossAxis: d.crossAxis || 0,
                          alignmentAxis: d.alignmentAxis,
                        };
                    return (
                      s && "number" == typeof f && (h = "end" === s ? -1 * f : f),
                      l ? { x: h * c, y: p * u } : { x: p * u, y: h * c }
                    );
                  })(t, e);
                return o === (null == (n = s.offset) ? void 0 : n.placement) &&
                  null != (r = s.arrow) &&
                  r.alignmentOffset
                  ? {}
                  : { x: a + l.x, y: i + l.y, data: { ...l, placement: o } };
              },
            }
          );
        },
        Ei = function (e) {
          return (
            void 0 === e && (e = {}),
            {
              name: "flip",
              options: e,
              async fn(t) {
                var n, r;
                const {
                    placement: a,
                    middlewareData: i,
                    rects: o,
                    initialPlacement: s,
                    platform: l,
                    elements: u,
                  } = t,
                  {
                    mainAxis: c = !0,
                    crossAxis: d = !0,
                    fallbackPlacements: p,
                    fallbackStrategy: h = "bestFit",
                    fallbackAxisSideDirection: f = "none",
                    flipAlignment: m = !0,
                    ...g
                  } = Ca(e, t);
                if (null != (n = i.arrow) && n.alignmentOffset) return {};
                const v = Oa(a),
                  b = Ta(s),
                  y = Oa(s) === s,
                  w = await (null == l.isRTL ? void 0 : l.isRTL(u.floating)),
                  S =
                    p ||
                    (y || !m
                      ? [Fa(s)]
                      : (function (e) {
                          const t = Fa(e);
                          return [Pa(e), t, Pa(t)];
                        })(s)),
                  x = "none" !== f;
                !p && x && S.push(...La(s, m, f, w));
                const _ = [s, ...S],
                  C = await si(t, g),
                  O = [];
                let R = (null == (r = i.flip) ? void 0 : r.overflows) || [];
                if ((c && O.push(C[v]), d)) {
                  const e = (function (e, t, n) {
                    void 0 === n && (n = !1);
                    const r = Ra(e),
                      a = Da(e),
                      i = ka(a);
                    let o =
                      "x" === a
                        ? r === (n ? "end" : "start")
                          ? "right"
                          : "left"
                        : "start" === r
                          ? "bottom"
                          : "top";
                    return (t.reference[i] > t.floating[i] && (o = Fa(o)), [o, Fa(o)]);
                  })(a, o, w);
                  O.push(C[e[0]], C[e[1]]);
                }
                if (((R = [...R, { placement: a, overflows: O }]), !O.every((e) => e <= 0))) {
                  var k, E;
                  const e = ((null == (k = i.flip) ? void 0 : k.index) || 0) + 1,
                    t = _[e];
                  if (t) {
                    if (
                      !("alignment" === d && b !== Ta(t)) ||
                      R.every((e) => Ta(e.placement) !== b || e.overflows[0] > 0)
                    )
                      return { data: { index: e, overflows: R }, reset: { placement: t } };
                  }
                  let n =
                    null ==
                    (E = R.filter((e) => e.overflows[0] <= 0).sort(
                      (e, t) => e.overflows[1] - t.overflows[1],
                    )[0])
                      ? void 0
                      : E.placement;
                  if (!n)
                    switch (h) {
                      case "bestFit": {
                        var T;
                        const e =
                          null ==
                          (T = R.filter((e) => {
                            if (x) {
                              const t = Ta(e.placement);
                              return t === b || "y" === t;
                            }
                            return !0;
                          })
                            .map((e) => [
                              e.placement,
                              e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0),
                            ])
                            .sort((e, t) => e[1] - t[1])[0])
                            ? void 0
                            : T[0];
                        e && (n = e);
                        break;
                      }
                      case "initialPlacement":
                        n = s;
                    }
                  if (a !== n) return { reset: { placement: n } };
                }
                return {};
              },
            }
          );
        },
        Ti = function (e) {
          return (
            void 0 === e && (e = {}),
            {
              name: "size",
              options: e,
              async fn(t) {
                var n, r;
                const { placement: a, rects: i, platform: o, elements: s } = t,
                  { apply: l = () => {}, ...u } = Ca(e, t),
                  c = await si(t, u),
                  d = Oa(a),
                  p = Ra(a),
                  h = "y" === Ta(a),
                  { width: f, height: m } = i.floating;
                let g, v;
                "top" === d || "bottom" === d
                  ? ((g = d),
                    (v =
                      p ===
                      ((await (null == o.isRTL ? void 0 : o.isRTL(s.floating))) ? "start" : "end")
                        ? "left"
                        : "right"))
                  : ((v = d), (g = "end" === p ? "top" : "bottom"));
                const b = m - c.top - c.bottom,
                  y = f - c.left - c.right,
                  w = va(m - c[g], b),
                  S = va(f - c[v], y),
                  x = !t.middlewareData.shift;
                let _ = w,
                  C = S;
                if (
                  (null != (n = t.middlewareData.shift) && n.enabled.x && (C = y),
                  null != (r = t.middlewareData.shift) && r.enabled.y && (_ = b),
                  x && !p)
                ) {
                  const e = ba(c.left, 0),
                    t = ba(c.right, 0),
                    n = ba(c.top, 0),
                    r = ba(c.bottom, 0);
                  h
                    ? (C = f - 2 * (0 !== e || 0 !== t ? e + t : ba(c.left, c.right)))
                    : (_ = m - 2 * (0 !== n || 0 !== r ? n + r : ba(c.top, c.bottom)));
                }
                await l({ ...t, availableWidth: C, availableHeight: _ });
                const O = await o.getDimensions(s.floating);
                return f !== O.width || m !== O.height ? { reset: { rects: !0 } } : {};
              },
            }
          );
        },
        Di = (e, t, n) => {
          const r = new Map(),
            a = { platform: Ci, ...n },
            i = { ...a.platform, _c: r };
          return (async (e, t, n) => {
            const {
                placement: r = "bottom",
                strategy: a = "absolute",
                middleware: i = [],
                platform: o,
              } = n,
              s = i.filter(Boolean),
              l = await (null == o.isRTL ? void 0 : o.isRTL(t));
            let u = await o.getElementRects({ reference: e, floating: t, strategy: a }),
              { x: c, y: d } = oi(u, r, l),
              p = r,
              h = {},
              f = 0;
            for (let n = 0; n < s.length; n++) {
              const { name: i, fn: m } = s[n],
                {
                  x: g,
                  y: v,
                  data: b,
                  reset: y,
                } = await m({
                  x: c,
                  y: d,
                  initialPlacement: r,
                  placement: p,
                  strategy: a,
                  middlewareData: h,
                  rects: u,
                  platform: o,
                  elements: { reference: e, floating: t },
                });
              ((c = null != g ? g : c),
                (d = null != v ? v : d),
                (h = { ...h, [i]: { ...h[i], ...b } }),
                y &&
                  f <= 50 &&
                  (f++,
                  "object" == typeof y &&
                    (y.placement && (p = y.placement),
                    y.rects &&
                      (u =
                        !0 === y.rects
                          ? await o.getElementRects({ reference: e, floating: t, strategy: a })
                          : y.rects),
                    ({ x: c, y: d } = oi(u, p, l))),
                  (n = -1)));
            }
            return { x: c, y: d, placement: p, strategy: a, middlewareData: h };
          })(e, t, { ...a, platform: i });
        };
      var Pi = "undefined" != typeof document ? p.useLayoutEffect : function () {};
      function Ai(e, t) {
        if (e === t) return !0;
        if (typeof e != typeof t) return !1;
        if ("function" == typeof e && e.toString() === t.toString()) return !0;
        let n, r, a;
        if (e && t && "object" == typeof e) {
          if (Array.isArray(e)) {
            if (((n = e.length), n !== t.length)) return !1;
            for (r = n; 0 !== r--; ) if (!Ai(e[r], t[r])) return !1;
            return !0;
          }
          if (((a = Object.keys(e)), (n = a.length), n !== Object.keys(t).length)) return !1;
          for (r = n; 0 !== r--; ) if (!{}.hasOwnProperty.call(t, a[r])) return !1;
          for (r = n; 0 !== r--; ) {
            const n = a[r];
            if (("_owner" !== n || !e.$$typeof) && !Ai(e[n], t[n])) return !1;
          }
          return !0;
        }
        return e != e && t != t;
      }
      function Ii(e) {
        if ("undefined" == typeof window) return 1;
        return (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
      }
      function Vi(e, t) {
        const n = Ii(e);
        return Math.round(t * n) / n;
      }
      function Mi(e) {
        const t = p.useRef(e);
        return (
          Pi(() => {
            t.current = e;
          }),
          t
        );
      }
      const Li = (e, t) => ({ ...Ei(e), options: [e, t] }),
        Fi = (e, t) => ({ ...Ti(e), options: [e, t] });
      const ji = { ...h },
        Ni = ji.useInsertionEffect || ((e) => e());
      function Bi(e) {
        const t = p.useRef(() => {
          0;
        });
        return (
          Ni(() => {
            t.current = e;
          }),
          p.useCallback(function () {
            for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++) n[r] = arguments[r];
            return null == t.current ? void 0 : t.current(...n);
          }, [])
        );
      }
      const zi = "ArrowUp",
        $i = "ArrowDown",
        Wi = "ArrowLeft",
        Hi = "ArrowRight";
      function Ui(e, t, n) {
        return Math.floor(e / t) !== n;
      }
      function qi(e, t) {
        return t < 0 || t >= e.current.length;
      }
      function Gi(e, t) {
        return Ki(e, { disabledIndices: t });
      }
      function Qi(e, t) {
        return Ki(e, { decrement: !0, startingIndex: e.current.length, disabledIndices: t });
      }
      function Ki(e, t) {
        let {
          startingIndex: n = -1,
          decrement: r = !1,
          disabledIndices: a,
          amount: i = 1,
        } = void 0 === t ? {} : t;
        const o = e.current;
        let s = n;
        do {
          s += r ? -i : i;
        } while (s >= 0 && s <= o.length - 1 && eo(o, s, a));
        return s;
      }
      function Yi(e, t) {
        let {
            event: n,
            orientation: r,
            loop: a,
            rtl: i,
            cols: o,
            disabledIndices: s,
            minIndex: l,
            maxIndex: u,
            prevIndex: c,
            stopEvent: d = !1,
          } = t,
          p = c;
        if (n.key === zi) {
          if ((d && ma(n), -1 === c)) p = u;
          else if (
            ((p = Ki(e, { startingIndex: p, amount: o, decrement: !0, disabledIndices: s })),
            a && (c - o < l || p < 0))
          ) {
            const e = c % o,
              t = u % o,
              n = u - (t - e);
            p = t === e ? u : t > e ? n : n - o;
          }
          qi(e, p) && (p = c);
        }
        if (
          (n.key === $i &&
            (d && ma(n),
            -1 === c
              ? (p = l)
              : ((p = Ki(e, { startingIndex: c, amount: o, disabledIndices: s })),
                a &&
                  c + o > u &&
                  (p = Ki(e, { startingIndex: (c % o) - o, amount: o, disabledIndices: s }))),
            qi(e, p) && (p = c)),
          "both" === r)
        ) {
          const t = wa(c / o);
          (n.key === (i ? Wi : Hi) &&
            (d && ma(n),
            c % o !== o - 1
              ? ((p = Ki(e, { startingIndex: c, disabledIndices: s })),
                a &&
                  Ui(p, o, t) &&
                  (p = Ki(e, { startingIndex: c - (c % o) - 1, disabledIndices: s })))
              : a && (p = Ki(e, { startingIndex: c - (c % o) - 1, disabledIndices: s })),
            Ui(p, o, t) && (p = c)),
            n.key === (i ? Hi : Wi) &&
              (d && ma(n),
              c % o !== 0
                ? ((p = Ki(e, { startingIndex: c, decrement: !0, disabledIndices: s })),
                  a &&
                    Ui(p, o, t) &&
                    (p = Ki(e, {
                      startingIndex: c + (o - (c % o)),
                      decrement: !0,
                      disabledIndices: s,
                    })))
                : a &&
                  (p = Ki(e, {
                    startingIndex: c + (o - (c % o)),
                    decrement: !0,
                    disabledIndices: s,
                  })),
              Ui(p, o, t) && (p = c)));
          const r = wa(u / o) === t;
          qi(e, p) &&
            (p =
              a && r
                ? n.key === (i ? Hi : Wi)
                  ? u
                  : Ki(e, { startingIndex: c - (c % o) - 1, disabledIndices: s })
                : c);
        }
        return p;
      }
      function Zi(e, t, n) {
        const r = [];
        let a = 0;
        return (
          e.forEach((e, i) => {
            let { width: o, height: s } = e,
              l = !1;
            for (n && (a = 0); !l; ) {
              const e = [];
              for (let n = 0; n < o; n++) for (let r = 0; r < s; r++) e.push(a + n + r * t);
              (a % t) + o <= t && e.every((e) => null == r[e])
                ? (e.forEach((e) => {
                    r[e] = i;
                  }),
                  (l = !0))
                : a++;
            }
          }),
          [...r]
        );
      }
      function Xi(e, t, n, r, a) {
        if (-1 === e) return -1;
        const i = n.indexOf(e),
          o = t[e];
        switch (a) {
          case "tl":
            return i;
          case "tr":
            return o ? i + o.width - 1 : i;
          case "bl":
            return o ? i + (o.height - 1) * r : i;
          case "br":
            return n.lastIndexOf(e);
        }
      }
      function Ji(e, t) {
        return t.flatMap((t, n) => (e.includes(t) ? [n] : []));
      }
      function eo(e, t, n) {
        if (n) return n.includes(t);
        const r = e[t];
        return (
          null == r || r.hasAttribute("disabled") || "true" === r.getAttribute("aria-disabled")
        );
      }
      var to = "undefined" != typeof document ? p.useLayoutEffect : p.useEffect;
      const no = [Wi, Hi],
        ro = [zi, $i];
      function ao() {
        return (
          (ao = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
              }),
          ao.apply(this, arguments)
        );
      }
      let io = !1,
        oo = 0;
      const so = () => "floating-ui-" + Math.random().toString(36).slice(2, 6) + oo++;
      const lo =
        ji.useId ||
        function () {
          const [e, t] = p.useState(() => (io ? so() : void 0));
          return (
            to(() => {
              null == e && t(so());
            }, []),
            p.useEffect(() => {
              io = !0;
            }, []),
            e
          );
        };
      function uo() {
        const e = new Map();
        return {
          emit(t, n) {
            var r;
            null == (r = e.get(t)) || r.forEach((e) => e(n));
          },
          on(t, n) {
            e.set(t, [...(e.get(t) || []), n]);
          },
          off(t, n) {
            var r;
            e.set(t, (null == (r = e.get(t)) ? void 0 : r.filter((e) => e !== n)) || []);
          },
        };
      }
      const co = p.createContext(null),
        po = p.createContext(null),
        ho = () => {
          var e;
          return (null == (e = p.useContext(co)) ? void 0 : e.id) || null;
        },
        fo = () => p.useContext(po);
      function mo(e) {
        return "data-floating-ui-" + e;
      }
      function go(e) {
        const t = (0, p.useRef)(e);
        return (
          to(() => {
            t.current = e;
          }),
          t
        );
      }
      let vo = 0;
      function bo(e, t) {
        void 0 === t && (t = {});
        const { preventScroll: n = !1, cancelPrevious: r = !0, sync: a = !1 } = t;
        r && cancelAnimationFrame(vo);
        const i = () => (null == e ? void 0 : e.focus({ preventScroll: n }));
        a ? i() : (vo = requestAnimationFrame(i));
      }
      function yo(e, t) {
        let n = e.filter((e) => {
            var n;
            return e.parentId === t && (null == (n = e.context) ? void 0 : n.open);
          }),
          r = n;
        for (; r.length; )
          ((r = e.filter((e) => {
            var t;
            return null == (t = r)
              ? void 0
              : t.some((t) => {
                  var n;
                  return e.parentId === t.id && (null == (n = e.context) ? void 0 : n.open);
                });
          })),
            (n = n.concat(r)));
        return n;
      }
      let wo = new WeakMap(),
        So = new WeakSet(),
        xo = {},
        _o = 0;
      const Co = (e) => e && (e.host || Co(e.parentNode));
      function Oo(e, t, n, r) {
        const a = "data-floating-ui-inert",
          i = r ? "inert" : n ? "aria-hidden" : null,
          o =
            ((s = t),
            e
              .map((e) => {
                if (s.contains(e)) return e;
                const t = Co(e);
                return s.contains(t) ? t : null;
              })
              .filter((e) => null != e));
        var s;
        const l = new Set(),
          u = new Set(o),
          c = [];
        xo[a] || (xo[a] = new WeakMap());
        const d = xo[a];
        return (
          o.forEach(function e(t) {
            if (!t || l.has(t)) return;
            (l.add(t), t.parentNode && e(t.parentNode));
          }),
          (function e(t) {
            if (!t || u.has(t)) return;
            [].forEach.call(t.children, (t) => {
              if ("script" !== Ar(t))
                if (l.has(t)) e(t);
                else {
                  const e = i ? t.getAttribute(i) : null,
                    n = null !== e && "false" !== e,
                    r = (wo.get(t) || 0) + 1,
                    o = (d.get(t) || 0) + 1;
                  (wo.set(t, r),
                    d.set(t, o),
                    c.push(t),
                    1 === r && n && So.add(t),
                    1 === o && t.setAttribute(a, ""),
                    !n && i && t.setAttribute(i, "true"));
                }
            });
          })(t),
          l.clear(),
          _o++,
          () => {
            (c.forEach((e) => {
              const t = (wo.get(e) || 0) - 1,
                n = (d.get(e) || 0) - 1;
              (wo.set(e, t),
                d.set(e, n),
                t || (!So.has(e) && i && e.removeAttribute(i), So.delete(e)),
                n || e.removeAttribute(a));
            }),
              _o--,
              _o || ((wo = new WeakMap()), (wo = new WeakMap()), (So = new WeakSet()), (xo = {})));
          }
        );
      }
      function Ro(e, t, n) {
        (void 0 === t && (t = !1), void 0 === n && (n = !1));
        const r = pa(e[0]).body;
        return Oo(e.concat(Array.from(r.querySelectorAll("[aria-live]"))), r, t, n);
      }
      const ko = () => ({
        getShadowRoot: !0,
        displayCheck:
          "function" == typeof ResizeObserver && ResizeObserver.toString().includes("[native code]")
            ? "full"
            : "none",
      });
      function Eo(e, t) {
        const n = ai(e, ko());
        "prev" === t && n.reverse();
        const r = n.indexOf(aa(pa(e)));
        return n.slice(r + 1)[0];
      }
      function To() {
        return Eo(document.body, "next");
      }
      function Do() {
        return Eo(document.body, "prev");
      }
      function Po(e, t) {
        const n = t || e.currentTarget,
          r = e.relatedTarget;
        return !r || !ia(n, r);
      }
      function Ao(e) {
        ai(e, ko()).forEach((e) => {
          ((e.dataset.tabindex = e.getAttribute("tabindex") || ""),
            e.setAttribute("tabindex", "-1"));
        });
      }
      function Io(e) {
        e.querySelectorAll("[data-tabindex]").forEach((e) => {
          const t = e.dataset.tabindex;
          (delete e.dataset.tabindex,
            t ? e.setAttribute("tabindex", t) : e.removeAttribute("tabindex"));
        });
      }
      const Vo = {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "fixed",
        whiteSpace: "nowrap",
        width: "1px",
        top: 0,
        left: 0,
      };
      function Mo(e) {
        "Tab" === e.key && (e.target, clearTimeout(undefined));
      }
      const Lo = p.forwardRef(function (e, t) {
          const [n, r] = p.useState();
          to(
            () => (
              ca() && r("button"),
              document.addEventListener("keydown", Mo),
              () => {
                document.removeEventListener("keydown", Mo);
              }
            ),
            [],
          );
          const a = {
            ref: t,
            tabIndex: 0,
            role: n,
            "aria-hidden": !n || void 0,
            [mo("focus-guard")]: "",
            style: Vo,
          };
          return p.createElement("span", ao({}, e, a));
        }),
        Fo = p.createContext(null),
        jo = mo("portal");
      function No(e) {
        const { children: t, id: n, root: r, preserveTabOrder: a = !0 } = e,
          i = (function (e) {
            void 0 === e && (e = {});
            const { id: t, root: n } = e,
              r = lo(),
              a = Bo(),
              [i, o] = p.useState(null),
              s = p.useRef(null);
            return (
              to(
                () => () => {
                  (null == i || i.remove(),
                    queueMicrotask(() => {
                      s.current = null;
                    }));
                },
                [i],
              ),
              to(() => {
                if (!r) return;
                if (s.current) return;
                const e = t ? document.getElementById(t) : null;
                if (!e) return;
                const n = document.createElement("div");
                ((n.id = r), n.setAttribute(jo, ""), e.appendChild(n), (s.current = n), o(n));
              }, [t, r]),
              to(() => {
                if (null === n) return;
                if (!r) return;
                if (s.current) return;
                let e = n || (null == a ? void 0 : a.portalNode);
                (e && !Lr(e) && (e = e.current), (e = e || document.body));
                let i = null;
                t && ((i = document.createElement("div")), (i.id = t), e.appendChild(i));
                const l = document.createElement("div");
                ((l.id = r),
                  l.setAttribute(jo, ""),
                  (e = i || e),
                  e.appendChild(l),
                  (s.current = l),
                  o(l));
              }, [t, n, r, a]),
              i
            );
          })({ id: n, root: r }),
          [o, s] = p.useState(null),
          l = p.useRef(null),
          u = p.useRef(null),
          c = p.useRef(null),
          d = p.useRef(null),
          h = null == o ? void 0 : o.modal,
          f = null == o ? void 0 : o.open,
          m = !!o && !o.modal && o.open && a && !(!r && !i);
        return (
          p.useEffect(() => {
            if (i && a && !h)
              return (
                i.addEventListener("focusin", e, !0),
                i.addEventListener("focusout", e, !0),
                () => {
                  (i.removeEventListener("focusin", e, !0),
                    i.removeEventListener("focusout", e, !0));
                }
              );
            function e(e) {
              if (i && Po(e)) {
                ("focusin" === e.type ? Io : Ao)(i);
              }
            }
          }, [i, a, h]),
          p.useEffect(() => {
            i && (f || Io(i));
          }, [f, i]),
          p.createElement(
            Fo.Provider,
            {
              value: p.useMemo(
                () => ({
                  preserveTabOrder: a,
                  beforeOutsideRef: l,
                  afterOutsideRef: u,
                  beforeInsideRef: c,
                  afterInsideRef: d,
                  portalNode: i,
                  setFocusManagerState: s,
                }),
                [a, i],
              ),
            },
            m &&
              i &&
              p.createElement(Lo, {
                "data-type": "outside",
                ref: l,
                onFocus: (e) => {
                  if (Po(e, i)) {
                    var t;
                    null == (t = c.current) || t.focus();
                  } else {
                    const e = Do() || (null == o ? void 0 : o.refs.domReference.current);
                    null == e || e.focus();
                  }
                },
              }),
            m && i && p.createElement("span", { "aria-owns": i.id, style: Vo }),
            i && ii.createPortal(t, i),
            m &&
              i &&
              p.createElement(Lo, {
                "data-type": "outside",
                ref: u,
                onFocus: (e) => {
                  if (Po(e, i)) {
                    var t;
                    null == (t = d.current) || t.focus();
                  } else {
                    const t = To() || (null == o ? void 0 : o.refs.domReference.current);
                    (null == t || t.focus(),
                      (null == o ? void 0 : o.closeOnFocusOut) &&
                        (null == o || o.onOpenChange(!1, e.nativeEvent, "focus-out")));
                  }
                },
              }),
          )
        );
      }
      const Bo = () => p.useContext(Fo),
        zo = "data-floating-ui-focusable";
      function $o(e) {
        return e ? (e.hasAttribute(zo) ? e : e.querySelector("[" + zo + "]") || e) : null;
      }
      let Wo = [];
      function Ho(e) {
        Wo = Wo.filter((e) => e.isConnected);
        let t = e;
        if (t && "body" !== Ar(t)) {
          if (
            !(function (e, t) {
              if (((t = t || {}), !e)) throw new Error("No node provided");
              return !1 !== $a.call(e, Ba) && ti(t, e);
            })(t, ko())
          ) {
            const e = ai(t, ko())[0];
            e && (t = e);
          }
          (Wo.push(t), Wo.length > 20 && (Wo = Wo.slice(-20)));
        }
      }
      function Uo() {
        return Wo.slice()
          .reverse()
          .find((e) => e.isConnected);
      }
      const qo = p.forwardRef(function (e, t) {
        return p.createElement(
          "button",
          ao({}, e, { type: "button", ref: t, tabIndex: -1, style: Vo }),
        );
      });
      function Go(e) {
        const {
            context: t,
            children: n,
            disabled: r = !1,
            order: a = ["content"],
            guards: i = !0,
            initialFocus: o = 0,
            returnFocus: s = !0,
            restoreFocus: l = !1,
            modal: u = !0,
            visuallyHiddenDismiss: c = !1,
            closeOnFocusOut: d = !0,
          } = e,
          {
            open: h,
            refs: f,
            nodeId: m,
            onOpenChange: g,
            events: v,
            dataRef: b,
            floatingId: y,
            elements: { domReference: w, floating: S },
          } = t,
          x = "number" == typeof o && o < 0,
          _ = ga(w) && x,
          C = "undefined" == typeof HTMLElement || !("inert" in HTMLElement.prototype) || i,
          O = go(a),
          R = go(o),
          k = go(s),
          E = fo(),
          T = Bo(),
          D = p.useRef(null),
          P = p.useRef(null),
          A = p.useRef(!1),
          I = p.useRef(!1),
          V = p.useRef(-1),
          M = null != T,
          L = $o(S),
          F = Bi(function (e) {
            return (void 0 === e && (e = L), e ? ai(e, ko()) : []);
          }),
          j = Bi((e) => {
            const t = F(e);
            return O.current
              .map((e) => (w && "reference" === e ? w : L && "floating" === e ? L : t))
              .filter(Boolean)
              .flat();
          });
        function N(e) {
          return !r && c && u
            ? p.createElement(
                qo,
                { ref: "start" === e ? D : P, onClick: (e) => g(!1, e.nativeEvent) },
                "string" == typeof c ? c : "Dismiss",
              )
            : null;
        }
        (p.useEffect(() => {
          if (r) return;
          if (!u) return;
          function e(e) {
            if ("Tab" === e.key) {
              ia(L, aa(pa(L))) && 0 === F().length && !_ && ma(e);
              const t = j(),
                n = fa(e);
              ("reference" === O.current[0] &&
                n === w &&
                (ma(e), e.shiftKey ? bo(t[t.length - 1]) : bo(t[1])),
                "floating" === O.current[1] && n === L && e.shiftKey && (ma(e), bo(t[0])));
            }
          }
          const t = pa(L);
          return (
            t.addEventListener("keydown", e),
            () => {
              t.removeEventListener("keydown", e);
            }
          );
        }, [r, w, L, u, O, _, F, j]),
          p.useEffect(() => {
            if (!r && S)
              return (
                S.addEventListener("focusin", e),
                () => {
                  S.removeEventListener("focusin", e);
                }
              );
            function e(e) {
              const t = fa(e),
                n = F().indexOf(t);
              -1 !== n && (V.current = n);
            }
          }, [r, S, F]),
          p.useEffect(() => {
            if (!r && d)
              return S && Fr(w)
                ? (w.addEventListener("focusout", t),
                  w.addEventListener("pointerdown", e),
                  S.addEventListener("focusout", t),
                  () => {
                    (w.removeEventListener("focusout", t),
                      w.removeEventListener("pointerdown", e),
                      S.removeEventListener("focusout", t));
                  })
                : void 0;
            function e() {
              ((I.current = !0),
                setTimeout(() => {
                  I.current = !1;
                }));
            }
            function t(e) {
              const t = e.relatedTarget;
              queueMicrotask(() => {
                const n = !(
                  ia(w, t) ||
                  ia(S, t) ||
                  ia(t, S) ||
                  ia(null == T ? void 0 : T.portalNode, t) ||
                  (null != t && t.hasAttribute(mo("focus-guard"))) ||
                  (E &&
                    (yo(E.nodesRef.current, m).find((e) => {
                      var n, r;
                      return (
                        ia(null == (n = e.context) ? void 0 : n.elements.floating, t) ||
                        ia(null == (r = e.context) ? void 0 : r.elements.domReference, t)
                      );
                    }) ||
                      (function (e, t) {
                        var n;
                        let r = [],
                          a = null == (n = e.find((e) => e.id === t)) ? void 0 : n.parentId;
                        for (; a; ) {
                          const t = e.find((e) => e.id === a);
                          ((a = null == t ? void 0 : t.parentId), t && (r = r.concat(t)));
                        }
                        return r;
                      })(E.nodesRef.current, m).find((e) => {
                        var n, r;
                        return (
                          (null == (n = e.context) ? void 0 : n.elements.floating) === t ||
                          (null == (r = e.context) ? void 0 : r.elements.domReference) === t
                        );
                      })))
                );
                if (l && n && aa(pa(L)) === pa(L).body) {
                  Fr(L) && L.focus();
                  const e = V.current,
                    t = F(),
                    n = t[e] || t[t.length - 1] || L;
                  Fr(n) && n.focus();
                }
                (!_ && u) ||
                  !t ||
                  !n ||
                  I.current ||
                  t === Uo() ||
                  ((A.current = !0), g(!1, e, "focus-out"));
              });
            }
          }, [r, w, S, L, u, m, E, T, g, d, l, F, _]),
          p.useEffect(() => {
            var e;
            if (r) return;
            const t = Array.from(
              (null == T || null == (e = T.portalNode)
                ? void 0
                : e.querySelectorAll("[" + mo("portal") + "]")) || [],
            );
            if (S) {
              const e = [
                  S,
                  ...t,
                  D.current,
                  P.current,
                  O.current.includes("reference") || _ ? w : null,
                ].filter((e) => null != e),
                n = u || _ ? Ro(e, C, !C) : Ro(e);
              return () => {
                n();
              };
            }
          }, [r, w, S, u, O, T, _, C]),
          to(() => {
            if (r || !Fr(L)) return;
            const e = aa(pa(L));
            queueMicrotask(() => {
              const t = j(L),
                n = R.current,
                r = ("number" == typeof n ? t[n] : n.current) || L,
                a = ia(L, e);
              x || a || !h || bo(r, { preventScroll: r === L });
            });
          }, [r, h, L, x, j, R]),
          to(() => {
            if (r || !L) return;
            let e = !1;
            const t = pa(L),
              n = aa(t);
            let a = b.current.openEvent;
            function i(t) {
              let { open: n, reason: r, event: i, nested: o } = t;
              (n && (a = i),
                "escape-key" === r && f.domReference.current && Ho(f.domReference.current),
                "hover" === r && "mouseleave" === i.type && (A.current = !0),
                "outside-press" === r &&
                  (o ? ((A.current = !1), (e = !0)) : (A.current = !(la(i) || ua(i)))));
            }
            (Ho(n), v.on("openchange", i));
            const o = t.createElement("span");
            return (
              o.setAttribute("tabindex", "-1"),
              o.setAttribute("aria-hidden", "true"),
              Object.assign(o.style, Vo),
              M && w && w.insertAdjacentElement("afterend", o),
              () => {
                v.off("openchange", i);
                const n = aa(t),
                  r =
                    ia(S, n) ||
                    (E &&
                      yo(E.nodesRef.current, m).some((e) => {
                        var t;
                        return ia(null == (t = e.context) ? void 0 : t.elements.floating, n);
                      }));
                (r || (a && ["click", "mousedown"].includes(a.type))) &&
                  f.domReference.current &&
                  Ho(f.domReference.current);
                const s = "boolean" == typeof k.current ? Uo() || o : k.current.current || o;
                queueMicrotask(() => {
                  (k.current &&
                    !A.current &&
                    Fr(s) &&
                    (s === n || n === t.body || r) &&
                    s.focus({ preventScroll: e }),
                    o.remove());
                });
              }
            );
          }, [r, S, L, k, b, f, v, E, m, M, w]),
          p.useEffect(() => {
            queueMicrotask(() => {
              A.current = !1;
            });
          }, [r]),
          to(() => {
            if (!r && T)
              return (
                T.setFocusManagerState({
                  modal: u,
                  closeOnFocusOut: d,
                  open: h,
                  onOpenChange: g,
                  refs: f,
                }),
                () => {
                  T.setFocusManagerState(null);
                }
              );
          }, [r, T, u, h, g, f, d]),
          to(() => {
            if (r) return;
            if (!L) return;
            if ("function" != typeof MutationObserver) return;
            if (x) return;
            const e = () => {
              const e = L.getAttribute("tabindex"),
                t = F(),
                n = aa(pa(S)),
                r = t.indexOf(n);
              (-1 !== r && (V.current = r),
                O.current.includes("floating") || (n !== f.domReference.current && 0 === t.length)
                  ? "0" !== e && L.setAttribute("tabindex", "0")
                  : "-1" !== e && L.setAttribute("tabindex", "-1"));
            };
            e();
            const t = new MutationObserver(e);
            return (
              t.observe(L, { childList: !0, subtree: !0, attributes: !0 }),
              () => {
                t.disconnect();
              }
            );
          }, [r, S, L, f, O, F, x]));
        const B = !r && C && (!u || !_) && (M || u);
        return p.createElement(
          p.Fragment,
          null,
          B &&
            p.createElement(Lo, {
              "data-type": "inside",
              ref: null == T ? void 0 : T.beforeInsideRef,
              onFocus: (e) => {
                if (u) {
                  const e = j();
                  bo("reference" === a[0] ? e[0] : e[e.length - 1]);
                } else if (null != T && T.preserveTabOrder && T.portalNode)
                  if (((A.current = !1), Po(e, T.portalNode))) {
                    const e = To() || w;
                    null == e || e.focus();
                  } else {
                    var t;
                    null == (t = T.beforeOutsideRef.current) || t.focus();
                  }
              },
            }),
          !_ && N("start"),
          n,
          N("end"),
          B &&
            p.createElement(Lo, {
              "data-type": "inside",
              ref: null == T ? void 0 : T.afterInsideRef,
              onFocus: (e) => {
                if (u) bo(j()[0]);
                else if (null != T && T.preserveTabOrder && T.portalNode)
                  if ((d && (A.current = !0), Po(e, T.portalNode))) {
                    const e = Do() || w;
                    null == e || e.focus();
                  } else {
                    var t;
                    null == (t = T.afterOutsideRef.current) || t.focus();
                  }
              },
            }),
        );
      }
      const Qo = { pointerdown: "onPointerDown", mousedown: "onMouseDown", click: "onClick" },
        Ko = {
          pointerdown: "onPointerDownCapture",
          mousedown: "onMouseDownCapture",
          click: "onClickCapture",
        },
        Yo = (e) => {
          var t, n;
          return {
            escapeKey:
              "boolean" == typeof e ? e : null != (t = null == e ? void 0 : e.escapeKey) && t,
            outsidePress:
              "boolean" == typeof e ? e : null == (n = null == e ? void 0 : e.outsidePress) || n,
          };
        };
      function Zo(e) {
        void 0 === e && (e = {});
        const { nodeId: t } = e,
          n = (function (e) {
            const { open: t = !1, onOpenChange: n, elements: r } = e,
              a = lo(),
              i = p.useRef({}),
              [o] = p.useState(() => uo()),
              s = null != ho(),
              [l, u] = p.useState(r.reference),
              c = Bi((e, t, r) => {
                ((i.current.openEvent = e ? t : void 0),
                  o.emit("openchange", { open: e, event: t, reason: r, nested: s }),
                  null == n || n(e, t, r));
              }),
              d = p.useMemo(() => ({ setPositionReference: u }), []),
              h = p.useMemo(
                () => ({
                  reference: l || r.reference || null,
                  floating: r.floating || null,
                  domReference: r.reference,
                }),
                [l, r.reference, r.floating],
              );
            return p.useMemo(
              () => ({
                dataRef: i,
                open: t,
                onOpenChange: c,
                elements: h,
                events: o,
                floatingId: a,
                refs: d,
              }),
              [t, c, h, o, a, d],
            );
          })({ ...e, elements: { reference: null, floating: null, ...e.elements } }),
          r = e.rootContext || n,
          a = r.elements,
          [i, o] = p.useState(null),
          [s, l] = p.useState(null),
          u = (null == a ? void 0 : a.domReference) || i,
          c = p.useRef(null),
          d = fo();
        to(() => {
          u && (c.current = u);
        }, [u]);
        const h = (function (e) {
            void 0 === e && (e = {});
            const {
                placement: t = "bottom",
                strategy: n = "absolute",
                middleware: r = [],
                platform: a,
                elements: { reference: i, floating: o } = {},
                transform: s = !0,
                whileElementsMounted: l,
                open: u,
              } = e,
              [c, d] = p.useState({
                x: 0,
                y: 0,
                strategy: n,
                placement: t,
                middlewareData: {},
                isPositioned: !1,
              }),
              [h, f] = p.useState(r);
            Ai(h, r) || f(r);
            const [m, g] = p.useState(null),
              [v, b] = p.useState(null),
              y = p.useCallback((e) => {
                e !== _.current && ((_.current = e), g(e));
              }, []),
              w = p.useCallback((e) => {
                e !== C.current && ((C.current = e), b(e));
              }, []),
              S = i || m,
              x = o || v,
              _ = p.useRef(null),
              C = p.useRef(null),
              O = p.useRef(c),
              R = null != l,
              k = Mi(l),
              E = Mi(a),
              T = Mi(u),
              D = p.useCallback(() => {
                if (!_.current || !C.current) return;
                const e = { placement: t, strategy: n, middleware: h };
                (E.current && (e.platform = E.current),
                  Di(_.current, C.current, e).then((e) => {
                    const t = { ...e, isPositioned: !1 !== T.current };
                    P.current &&
                      !Ai(O.current, t) &&
                      ((O.current = t),
                      ii.flushSync(() => {
                        d(t);
                      }));
                  }));
              }, [h, t, n, E, T]);
            Pi(() => {
              !1 === u &&
                O.current.isPositioned &&
                ((O.current.isPositioned = !1), d((e) => ({ ...e, isPositioned: !1 })));
            }, [u]);
            const P = p.useRef(!1);
            (Pi(
              () => (
                (P.current = !0),
                () => {
                  P.current = !1;
                }
              ),
              [],
            ),
              Pi(() => {
                if ((S && (_.current = S), x && (C.current = x), S && x)) {
                  if (k.current) return k.current(S, x, D);
                  D();
                }
              }, [S, x, D, k, R]));
            const A = p.useMemo(
                () => ({ reference: _, floating: C, setReference: y, setFloating: w }),
                [y, w],
              ),
              I = p.useMemo(() => ({ reference: S, floating: x }), [S, x]),
              V = p.useMemo(() => {
                const e = { position: n, left: 0, top: 0 };
                if (!I.floating) return e;
                const t = Vi(I.floating, c.x),
                  r = Vi(I.floating, c.y);
                return s
                  ? {
                      ...e,
                      transform: "translate(" + t + "px, " + r + "px)",
                      ...(Ii(I.floating) >= 1.5 && { willChange: "transform" }),
                    }
                  : { position: n, left: t, top: r };
              }, [n, s, I.floating, c.x, c.y]);
            return p.useMemo(
              () => ({ ...c, update: D, refs: A, elements: I, floatingStyles: V }),
              [c, D, A, I, V],
            );
          })({ ...e, elements: { ...a, ...(s && { reference: s }) } }),
          f = p.useCallback(
            (e) => {
              const t = Lr(e)
                ? { getBoundingClientRect: () => e.getBoundingClientRect(), contextElement: e }
                : e;
              (l(t), h.refs.setReference(t));
            },
            [h.refs],
          ),
          m = p.useCallback(
            (e) => {
              ((Lr(e) || null === e) && ((c.current = e), o(e)),
                (Lr(h.refs.reference.current) ||
                  null === h.refs.reference.current ||
                  (null !== e && !Lr(e))) &&
                  h.refs.setReference(e));
            },
            [h.refs],
          ),
          g = p.useMemo(
            () => ({ ...h.refs, setReference: m, setPositionReference: f, domReference: c }),
            [h.refs, m, f],
          ),
          v = p.useMemo(() => ({ ...h.elements, domReference: u }), [h.elements, u]),
          b = p.useMemo(() => ({ ...h, ...r, refs: g, elements: v, nodeId: t }), [h, g, v, t, r]);
        return (
          to(() => {
            r.dataRef.current.floatingContext = b;
            const e = null == d ? void 0 : d.nodesRef.current.find((e) => e.id === t);
            e && (e.context = b);
          }),
          p.useMemo(() => ({ ...h, context: b, refs: g, elements: v }), [h, g, v, b])
        );
      }
      const Xo = "active",
        Jo = "selected";
      function es(e, t, n) {
        const r = new Map(),
          a = "item" === n;
        let i = e;
        if (a && e) {
          const { [Xo]: t, [Jo]: n, ...r } = e;
          i = r;
        }
        return {
          ...("floating" === n && { tabIndex: -1, [zo]: "" }),
          ...i,
          ...t
            .map((t) => {
              const r = t ? t[n] : null;
              return "function" == typeof r ? (e ? r(e) : null) : r;
            })
            .concat(e)
            .reduce(
              (e, t) =>
                t
                  ? (Object.entries(t).forEach((t) => {
                      let [n, i] = t;
                      var o;
                      (a && [Xo, Jo].includes(n)) ||
                        (0 === n.indexOf("on")
                          ? (r.has(n) || r.set(n, []),
                            "function" == typeof i &&
                              (null == (o = r.get(n)) || o.push(i),
                              (e[n] = function () {
                                for (
                                  var e, t = arguments.length, a = new Array(t), i = 0;
                                  i < t;
                                  i++
                                )
                                  a[i] = arguments[i];
                                return null == (e = r.get(n))
                                  ? void 0
                                  : e.map((e) => e(...a)).find((e) => void 0 !== e);
                              })))
                          : (e[n] = i));
                    }),
                    e)
                  : e,
              {},
            ),
        };
      }
      let ts = !1;
      function ns(e, t, n) {
        switch (e) {
          case "vertical":
            return t;
          case "horizontal":
            return n;
          default:
            return t || n;
        }
      }
      function rs(e, t) {
        return ns(t, e === zi || e === $i, e === Wi || e === Hi);
      }
      function as(e, t, n) {
        return ns(t, e === $i, n ? e === Wi : e === Hi) || "Enter" === e || " " === e || "" === e;
      }
      function is(e, t, n) {
        return ns(t, n ? e === Hi : e === Wi, e === zi);
      }
      function os(e, t) {
        const { open: n, onOpenChange: r, elements: a } = e,
          {
            listRef: i,
            activeIndex: o,
            onNavigate: s = () => {},
            enabled: l = !0,
            selectedIndex: u = null,
            allowEscape: c = !1,
            loop: d = !1,
            nested: h = !1,
            rtl: f = !1,
            virtual: m = !1,
            focusItemOnOpen: g = "auto",
            focusItemOnHover: v = !0,
            openOnArrowKeyDown: b = !0,
            disabledIndices: y,
            orientation: w = "vertical",
            cols: S = 1,
            scrollItemIntoView: x = !0,
            virtualItemRef: _,
            itemSizes: C,
            dense: O = !1,
          } = t;
        const R = go($o(a.floating)),
          k = ho(),
          E = fo(),
          T = Bi(s),
          D = ga(a.domReference),
          P = p.useRef(g),
          A = p.useRef(null != u ? u : -1),
          I = p.useRef(null),
          V = p.useRef(!0),
          M = p.useRef(T),
          L = p.useRef(!!a.floating),
          F = p.useRef(n),
          j = p.useRef(!1),
          N = p.useRef(!1),
          B = go(y),
          z = go(n),
          $ = go(x),
          W = go(u),
          [H, U] = p.useState(),
          [q, G] = p.useState(),
          Q = Bi(function (e, t, n) {
            function r(e) {
              m
                ? (U(e.id), null == E || E.events.emit("virtualfocus", e), _ && (_.current = e))
                : bo(e, {
                    preventScroll: !0,
                    sync:
                      !(
                        !oa().toLowerCase().startsWith("mac") ||
                        navigator.maxTouchPoints ||
                        !ca()
                      ) &&
                      (ts || j.current),
                  });
            }
            void 0 === n && (n = !1);
            const a = e.current[t.current];
            (a && r(a),
              requestAnimationFrame(() => {
                const i = e.current[t.current] || a;
                if (!i) return;
                a || r(i);
                const o = $.current;
                o &&
                  Y &&
                  (n || !V.current) &&
                  (null == i.scrollIntoView ||
                    i.scrollIntoView(
                      "boolean" == typeof o ? { block: "nearest", inline: "nearest" } : o,
                    ));
              }));
          });
        (to(() => {
          document.createElement("div").focus({
            get preventScroll() {
              return ((ts = !0), !1);
            },
          });
        }, []),
          to(() => {
            l &&
              (n && a.floating
                ? P.current && null != u && ((N.current = !0), (A.current = u), T(u))
                : L.current && ((A.current = -1), M.current(null)));
          }, [l, n, a.floating, u, T]),
          to(() => {
            if (l && n && a.floating)
              if (null == o) {
                if (((j.current = !1), null != W.current)) return;
                if (
                  (L.current && ((A.current = -1), Q(i, A)),
                  (!F.current || !L.current) &&
                    P.current &&
                    (null != I.current || (!0 === P.current && null == I.current)))
                ) {
                  let e = 0;
                  const t = () => {
                    if (null == i.current[0]) {
                      if (e < 2) {
                        (e ? requestAnimationFrame : queueMicrotask)(t);
                      }
                      e++;
                    } else
                      ((A.current =
                        null == I.current || as(I.current, w, f) || h
                          ? Gi(i, B.current)
                          : Qi(i, B.current)),
                        (I.current = null),
                        T(A.current));
                  };
                  t();
                }
              } else qi(i, o) || ((A.current = o), Q(i, A, N.current), (N.current = !1));
          }, [l, n, a.floating, o, W, h, i, w, f, T, Q, B]),
          to(() => {
            var e;
            if (!l || a.floating || !E || m || !L.current) return;
            const t = E.nodesRef.current,
              n =
                null == (e = t.find((e) => e.id === k)) || null == (e = e.context)
                  ? void 0
                  : e.elements.floating,
              r = aa(pa(a.floating)),
              i = t.some((e) => e.context && ia(e.context.elements.floating, r));
            n && !i && V.current && n.focus({ preventScroll: !0 });
          }, [l, a.floating, E, k, m]),
          to(() => {
            if (l && E && m && !k)
              return (
                E.events.on("virtualfocus", e),
                () => {
                  E.events.off("virtualfocus", e);
                }
              );
            function e(e) {
              (G(e.id), _ && (_.current = e));
            }
          }, [l, E, m, k, _]),
          to(() => {
            ((M.current = T), (L.current = !!a.floating));
          }),
          to(() => {
            n || (I.current = null);
          }, [n]),
          to(() => {
            F.current = n;
          }, [n]));
        const K = null != o,
          Y = p.useMemo(() => {
            function e(e) {
              if (!n) return;
              const t = i.current.indexOf(e);
              -1 !== t && T(t);
            }
            const t = {
              onFocus(t) {
                let { currentTarget: n } = t;
                e(n);
              },
              onClick: (e) => {
                let { currentTarget: t } = e;
                return t.focus({ preventScroll: !0 });
              },
              ...(v && {
                onMouseMove(t) {
                  let { currentTarget: n } = t;
                  e(n);
                },
                onPointerLeave(e) {
                  let { pointerType: t } = e;
                  V.current &&
                    "touch" !== t &&
                    ((A.current = -1), Q(i, A), T(null), m || bo(R.current, { preventScroll: !0 }));
                },
              }),
            };
            return t;
          }, [n, R, Q, v, i, T, m]),
          Z = Bi((e) => {
            if (((V.current = !1), (j.current = !0), 229 === e.which)) return;
            if (!z.current && e.currentTarget === R.current) return;
            if (h && is(e.key, w, f))
              return (
                ma(e),
                r(!1, e.nativeEvent, "list-navigation"),
                void (
                  Fr(a.domReference) &&
                  (m
                    ? null == E || E.events.emit("virtualfocus", a.domReference)
                    : a.domReference.focus())
                )
              );
            const t = A.current,
              o = Gi(i, y),
              s = Qi(i, y);
            if (
              (D ||
                ("Home" === e.key && (ma(e), (A.current = o), T(A.current)),
                "End" === e.key && (ma(e), (A.current = s), T(A.current))),
              S > 1)
            ) {
              const t =
                  C || Array.from({ length: i.current.length }, () => ({ width: 1, height: 1 })),
                n = Zi(t, S, O),
                r = n.findIndex((e) => null != e && !eo(i.current, e, y)),
                a = n.reduce((e, t, n) => (null == t || eo(i.current, t, y) ? e : n), -1),
                l =
                  n[
                    Yi(
                      { current: n.map((e) => (null != e ? i.current[e] : null)) },
                      {
                        event: e,
                        orientation: w,
                        loop: d,
                        rtl: f,
                        cols: S,
                        disabledIndices: Ji(
                          [
                            ...(y || i.current.map((e, t) => (eo(i.current, t) ? t : void 0))),
                            void 0,
                          ],
                          n,
                        ),
                        minIndex: r,
                        maxIndex: a,
                        prevIndex: Xi(
                          A.current > s ? o : A.current,
                          t,
                          n,
                          S,
                          e.key === $i ? "bl" : e.key === (f ? Wi : Hi) ? "tr" : "tl",
                        ),
                        stopEvent: !0,
                      },
                    )
                  ];
              if ((null != l && ((A.current = l), T(A.current)), "both" === w)) return;
            }
            if (rs(e.key, w)) {
              if ((ma(e), n && !m && aa(e.currentTarget.ownerDocument) === e.currentTarget))
                return ((A.current = as(e.key, w, f) ? o : s), void T(A.current));
              (as(e.key, w, f)
                ? (A.current = d
                    ? t >= s
                      ? c && t !== i.current.length
                        ? -1
                        : o
                      : Ki(i, { startingIndex: t, disabledIndices: y })
                    : Math.min(s, Ki(i, { startingIndex: t, disabledIndices: y })))
                : (A.current = d
                    ? t <= o
                      ? c && -1 !== t
                        ? i.current.length
                        : s
                      : Ki(i, { startingIndex: t, decrement: !0, disabledIndices: y })
                    : Math.max(o, Ki(i, { startingIndex: t, decrement: !0, disabledIndices: y }))),
                qi(i, A.current) ? T(null) : T(A.current));
            }
          }),
          X = p.useMemo(() => m && n && K && { "aria-activedescendant": q || H }, [m, n, K, q, H]),
          J = p.useMemo(
            () => ({
              "aria-orientation": "both" === w ? void 0 : w,
              ...(!ga(a.domReference) && X),
              onKeyDown: Z,
              onPointerMove() {
                V.current = !0;
              },
            }),
            [X, Z, a.domReference, w],
          ),
          ee = p.useMemo(() => {
            function e(e) {
              "auto" === g && la(e.nativeEvent) && (P.current = !0);
            }
            return {
              ...X,
              onKeyDown(e) {
                V.current = !1;
                const t = e.key.startsWith("Arrow"),
                  a = ["Home", "End"].includes(e.key),
                  o = t || a,
                  s = (function (e, t, n) {
                    return ns(t, n ? e === Wi : e === Hi, e === $i);
                  })(e.key, w, f),
                  l = is(e.key, w, f),
                  c = rs(e.key, w),
                  d = (h ? s : c) || "Enter" === e.key || "" === e.key.trim();
                if (m && n) {
                  const t = null == E ? void 0 : E.nodesRef.current.find((e) => null == e.parentId),
                    n =
                      E && t
                        ? (function (e, t) {
                            let n,
                              r = -1;
                            return (
                              (function t(a, i) {
                                (i > r && ((n = a), (r = i)),
                                  yo(e, a).forEach((e) => {
                                    t(e.id, i + 1);
                                  }));
                              })(t, 0),
                              e.find((e) => e.id === n)
                            );
                          })(E.nodesRef.current, t.id)
                        : null;
                  if (o && n && _) {
                    const t = new KeyboardEvent("keydown", { key: e.key, bubbles: !0 });
                    if (s || l) {
                      var p, g;
                      const r =
                          (null == (p = n.context) ? void 0 : p.elements.domReference) ===
                          e.currentTarget,
                        a =
                          l && !r
                            ? null == (g = n.context)
                              ? void 0
                              : g.elements.domReference
                            : s
                              ? i.current.find((e) => (null == e ? void 0 : e.id) === H)
                              : null;
                      a && (ma(e), a.dispatchEvent(t), G(void 0));
                    }
                    var v;
                    if ((c || a) && n.context)
                      if (
                        n.context.open &&
                        n.parentId &&
                        e.currentTarget !== n.context.elements.domReference
                      )
                        return (
                          ma(e),
                          void (null == (v = n.context.elements.domReference) || v.dispatchEvent(t))
                        );
                  }
                  return Z(e);
                }
                (n || b || !t) &&
                  (d && (I.current = h && c ? null : e.key),
                  h
                    ? s &&
                      (ma(e),
                      n
                        ? ((A.current = Gi(i, B.current)), T(A.current))
                        : r(!0, e.nativeEvent, "list-navigation"))
                    : c &&
                      (null != u && (A.current = u),
                      ma(e),
                      !n && b ? r(!0, e.nativeEvent, "list-navigation") : Z(e),
                      n && T(A.current)));
              },
              onFocus() {
                n && !m && T(null);
              },
              onPointerDown: function (e) {
                ((P.current = g), "auto" === g && ua(e.nativeEvent) && (P.current = !0));
              },
              onMouseDown: e,
              onClick: e,
            };
          }, [H, X, Z, B, g, i, h, T, r, n, b, w, f, u, E, m, _]);
        return p.useMemo(() => (l ? { reference: ee, floating: J, item: Y } : {}), [l, ee, J, Y]);
      }
      const ss = new Map([
        ["select", "listbox"],
        ["combobox", "listbox"],
        ["label", !1],
      ]);
      function ls(e, t, n) {
        let r,
          a = n.initialDeps ?? [];
        function i() {
          var i, o, s, l;
          let u;
          n.key && (null == (i = n.debug) ? void 0 : i.call(n)) && (u = Date.now());
          const c = e(),
            d = c.length !== a.length || c.some((e, t) => a[t] !== e);
          if (!d) return r;
          let p;
          if (
            ((a = c),
            n.key && (null == (o = n.debug) ? void 0 : o.call(n)) && (p = Date.now()),
            (r = t(...c)),
            n.key && (null == (s = n.debug) ? void 0 : s.call(n)))
          ) {
            (Math.round(100 * (Date.now() - u)), Math.round(100 * (Date.now() - p)));
          }
          return (null == (l = null == n ? void 0 : n.onChange) || l.call(n, r), r);
        }
        return (
          (i.updateDeps = (e) => {
            a = e;
          }),
          i
        );
      }
      function us(e, t) {
        if (void 0 === e) throw new Error("Unexpected undefined" + (t ? `: ${t}` : ""));
        return e;
      }
      const cs = (e, t, n) => {
          let r;
          return function (...a) {
            (e.clearTimeout(r), (r = e.setTimeout(() => t.apply(this, a), n)));
          };
        },
        ds = (e) => {
          const { offsetWidth: t, offsetHeight: n } = e;
          return { width: t, height: n };
        },
        ps = (e) => e,
        hs = (e) => {
          const t = Math.max(e.startIndex - e.overscan, 0),
            n = Math.min(e.endIndex + e.overscan, e.count - 1),
            r = [];
          for (let e = t; e <= n; e++) r.push(e);
          return r;
        },
        fs = (e, t) => {
          const n = e.scrollElement;
          if (!n) return;
          const r = e.targetWindow;
          if (!r) return;
          const a = (e) => {
            const { width: n, height: r } = e;
            t({ width: Math.round(n), height: Math.round(r) });
          };
          if ((a(ds(n)), !r.ResizeObserver)) return () => {};
          const i = new r.ResizeObserver((t) => {
            const r = () => {
              const e = t[0];
              if (null == e ? void 0 : e.borderBoxSize) {
                const t = e.borderBoxSize[0];
                if (t) return void a({ width: t.inlineSize, height: t.blockSize });
              }
              a(ds(n));
            };
            e.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(r) : r();
          });
          return (
            i.observe(n, { box: "border-box" }),
            () => {
              i.unobserve(n);
            }
          );
        },
        ms = { passive: !0 },
        gs = "undefined" == typeof window || "onscrollend" in window,
        vs = (e, t) => {
          const n = e.scrollElement;
          if (!n) return;
          const r = e.targetWindow;
          if (!r) return;
          let a = 0;
          const i =
              e.options.useScrollendEvent && gs
                ? () => {}
                : cs(
                    r,
                    () => {
                      t(a, !1);
                    },
                    e.options.isScrollingResetDelay,
                  ),
            o = (r) => () => {
              const { horizontal: o, isRtl: s } = e.options;
              ((a = o ? n.scrollLeft * (s ? -1 : 1) : n.scrollTop), i(), t(a, r));
            },
            s = o(!0),
            l = o(!1);
          (l(), n.addEventListener("scroll", s, ms));
          const u = e.options.useScrollendEvent && gs;
          return (
            u && n.addEventListener("scrollend", l, ms),
            () => {
              (n.removeEventListener("scroll", s), u && n.removeEventListener("scrollend", l));
            }
          );
        },
        bs = (e, t, n) => {
          if (null == t ? void 0 : t.borderBoxSize) {
            const e = t.borderBoxSize[0];
            if (e) {
              return Math.round(e[n.options.horizontal ? "inlineSize" : "blockSize"]);
            }
          }
          return e[n.options.horizontal ? "offsetWidth" : "offsetHeight"];
        },
        ys = (e, { adjustments: t = 0, behavior: n }, r) => {
          var a, i;
          const o = e + t;
          null == (i = null == (a = r.scrollElement) ? void 0 : a.scrollTo) ||
            i.call(a, { [r.options.horizontal ? "left" : "top"]: o, behavior: n });
        };
      class ws {
        constructor(e) {
          ((this.unsubs = []),
            (this.scrollElement = null),
            (this.targetWindow = null),
            (this.isScrolling = !1),
            (this.measurementsCache = []),
            (this.itemSizeCache = new Map()),
            (this.pendingMeasuredCacheIndexes = []),
            (this.scrollRect = null),
            (this.scrollOffset = null),
            (this.scrollDirection = null),
            (this.scrollAdjustments = 0),
            (this.elementsCache = new Map()),
            (this.observer = (() => {
              let e = null;
              const t = () =>
                e ||
                (this.targetWindow && this.targetWindow.ResizeObserver
                  ? (e = new this.targetWindow.ResizeObserver((e) => {
                      e.forEach((e) => {
                        const t = () => {
                          this._measureElement(e.target, e);
                        };
                        this.options.useAnimationFrameWithResizeObserver
                          ? requestAnimationFrame(t)
                          : t();
                      });
                    }))
                  : null);
              return {
                disconnect: () => {
                  var n;
                  (null == (n = t()) || n.disconnect(), (e = null));
                },
                observe: (e) => {
                  var n;
                  return null == (n = t()) ? void 0 : n.observe(e, { box: "border-box" });
                },
                unobserve: (e) => {
                  var n;
                  return null == (n = t()) ? void 0 : n.unobserve(e);
                },
              };
            })()),
            (this.range = null),
            (this.setOptions = (e) => {
              (Object.entries(e).forEach(([t, n]) => {
                void 0 === n && delete e[t];
              }),
                (this.options = {
                  debug: !1,
                  initialOffset: 0,
                  overscan: 1,
                  paddingStart: 0,
                  paddingEnd: 0,
                  scrollPaddingStart: 0,
                  scrollPaddingEnd: 0,
                  horizontal: !1,
                  getItemKey: ps,
                  rangeExtractor: hs,
                  onChange: () => {},
                  measureElement: bs,
                  initialRect: { width: 0, height: 0 },
                  scrollMargin: 0,
                  gap: 0,
                  indexAttribute: "data-index",
                  initialMeasurementsCache: [],
                  lanes: 1,
                  isScrollingResetDelay: 150,
                  enabled: !0,
                  isRtl: !1,
                  useScrollendEvent: !1,
                  useAnimationFrameWithResizeObserver: !1,
                  ...e,
                }));
            }),
            (this.notify = (e) => {
              var t, n;
              null == (n = (t = this.options).onChange) || n.call(t, this, e);
            }),
            (this.maybeNotify = ls(
              () => (
                this.calculateRange(),
                [
                  this.isScrolling,
                  this.range ? this.range.startIndex : null,
                  this.range ? this.range.endIndex : null,
                ]
              ),
              (e) => {
                this.notify(e);
              },
              {
                key: !1,
                debug: () => this.options.debug,
                initialDeps: [
                  this.isScrolling,
                  this.range ? this.range.startIndex : null,
                  this.range ? this.range.endIndex : null,
                ],
              },
            )),
            (this.cleanup = () => {
              (this.unsubs.filter(Boolean).forEach((e) => e()),
                (this.unsubs = []),
                this.observer.disconnect(),
                (this.scrollElement = null),
                (this.targetWindow = null));
            }),
            (this._didMount = () => () => {
              this.cleanup();
            }),
            (this._willUpdate = () => {
              var e;
              const t = this.options.enabled ? this.options.getScrollElement() : null;
              if (this.scrollElement !== t) {
                if ((this.cleanup(), !t)) return void this.maybeNotify();
                ((this.scrollElement = t),
                  this.scrollElement && "ownerDocument" in this.scrollElement
                    ? (this.targetWindow = this.scrollElement.ownerDocument.defaultView)
                    : (this.targetWindow =
                        (null == (e = this.scrollElement) ? void 0 : e.window) ?? null),
                  this.elementsCache.forEach((e) => {
                    this.observer.observe(e);
                  }),
                  this._scrollToOffset(this.getScrollOffset(), {
                    adjustments: void 0,
                    behavior: void 0,
                  }),
                  this.unsubs.push(
                    this.options.observeElementRect(this, (e) => {
                      ((this.scrollRect = e), this.maybeNotify());
                    }),
                  ),
                  this.unsubs.push(
                    this.options.observeElementOffset(this, (e, t) => {
                      ((this.scrollAdjustments = 0),
                        (this.scrollDirection = t
                          ? this.getScrollOffset() < e
                            ? "forward"
                            : "backward"
                          : null),
                        (this.scrollOffset = e),
                        (this.isScrolling = t),
                        this.maybeNotify());
                    }),
                  ));
              }
            }),
            (this.getSize = () =>
              this.options.enabled
                ? ((this.scrollRect = this.scrollRect ?? this.options.initialRect),
                  this.scrollRect[this.options.horizontal ? "width" : "height"])
                : ((this.scrollRect = null), 0)),
            (this.getScrollOffset = () =>
              this.options.enabled
                ? ((this.scrollOffset =
                    this.scrollOffset ??
                    ("function" == typeof this.options.initialOffset
                      ? this.options.initialOffset()
                      : this.options.initialOffset)),
                  this.scrollOffset)
                : ((this.scrollOffset = null), 0)),
            (this.getFurthestMeasurement = (e, t) => {
              const n = new Map(),
                r = new Map();
              for (let a = t - 1; a >= 0; a--) {
                const t = e[a];
                if (n.has(t.lane)) continue;
                const i = r.get(t.lane);
                if (
                  (null == i || t.end > i.end
                    ? r.set(t.lane, t)
                    : t.end < i.end && n.set(t.lane, !0),
                  n.size === this.options.lanes)
                )
                  break;
              }
              return r.size === this.options.lanes
                ? Array.from(r.values()).sort((e, t) =>
                    e.end === t.end ? e.index - t.index : e.end - t.end,
                  )[0]
                : void 0;
            }),
            (this.getMeasurementOptions = ls(
              () => [
                this.options.count,
                this.options.paddingStart,
                this.options.scrollMargin,
                this.options.getItemKey,
                this.options.enabled,
              ],
              (e, t, n, r, a) => (
                (this.pendingMeasuredCacheIndexes = []),
                { count: e, paddingStart: t, scrollMargin: n, getItemKey: r, enabled: a }
              ),
              { key: !1 },
            )),
            (this.getMeasurements = ls(
              () => [this.getMeasurementOptions(), this.itemSizeCache],
              ({ count: e, paddingStart: t, scrollMargin: n, getItemKey: r, enabled: a }, i) => {
                if (!a) return ((this.measurementsCache = []), this.itemSizeCache.clear(), []);
                0 === this.measurementsCache.length &&
                  ((this.measurementsCache = this.options.initialMeasurementsCache),
                  this.measurementsCache.forEach((e) => {
                    this.itemSizeCache.set(e.key, e.size);
                  }));
                const o =
                  this.pendingMeasuredCacheIndexes.length > 0
                    ? Math.min(...this.pendingMeasuredCacheIndexes)
                    : 0;
                this.pendingMeasuredCacheIndexes = [];
                const s = this.measurementsCache.slice(0, o);
                for (let a = o; a < e; a++) {
                  const e = r(a),
                    o = 1 === this.options.lanes ? s[a - 1] : this.getFurthestMeasurement(s, a),
                    l = o ? o.end + this.options.gap : t + n,
                    u = i.get(e),
                    c = "number" == typeof u ? u : this.options.estimateSize(a),
                    d = l + c,
                    p = o ? o.lane : a % this.options.lanes;
                  s[a] = { index: a, start: l, size: c, end: d, key: e, lane: p };
                }
                return ((this.measurementsCache = s), s);
              },
              { key: !1, debug: () => this.options.debug },
            )),
            (this.calculateRange = ls(
              () => [
                this.getMeasurements(),
                this.getSize(),
                this.getScrollOffset(),
                this.options.lanes,
              ],
              (e, t, n, r) =>
                (this.range =
                  e.length > 0 && t > 0
                    ? (function ({ measurements: e, outerSize: t, scrollOffset: n, lanes: r }) {
                        const a = e.length - 1,
                          i = (t) => e[t].start;
                        if (e.length <= r) return { startIndex: 0, endIndex: a };
                        let o = Ss(0, a, i, n),
                          s = o;
                        if (1 === r) for (; s < a && e[s].end < n + t; ) s++;
                        else if (r > 1) {
                          const i = Array(r).fill(0);
                          for (; s < a && i.some((e) => e < n + t); ) {
                            const t = e[s];
                            ((i[t.lane] = t.end), s++);
                          }
                          const l = Array(r).fill(n + t);
                          for (; o >= 0 && l.some((e) => e >= n); ) {
                            const t = e[o];
                            ((l[t.lane] = t.start), o--);
                          }
                          ((o = Math.max(0, o - (o % r))),
                            (s = Math.min(a, s + (r - 1 - (s % r)))));
                        }
                        return { startIndex: o, endIndex: s };
                      })({ measurements: e, outerSize: t, scrollOffset: n, lanes: r })
                    : null),
              { key: !1, debug: () => this.options.debug },
            )),
            (this.getVirtualIndexes = ls(
              () => {
                let e = null,
                  t = null;
                const n = this.calculateRange();
                return (
                  n && ((e = n.startIndex), (t = n.endIndex)),
                  this.maybeNotify.updateDeps([this.isScrolling, e, t]),
                  [this.options.rangeExtractor, this.options.overscan, this.options.count, e, t]
                );
              },
              (e, t, n, r, a) =>
                null === r || null === a
                  ? []
                  : e({ startIndex: r, endIndex: a, overscan: t, count: n }),
              { key: !1, debug: () => this.options.debug },
            )),
            (this.indexFromElement = (e) => {
              const t = this.options.indexAttribute,
                n = e.getAttribute(t);
              return n
                ? parseInt(n, 10)
                : (console.warn(`Missing attribute name '${t}={index}' on measured element.`), -1);
            }),
            (this._measureElement = (e, t) => {
              const n = this.indexFromElement(e),
                r = this.measurementsCache[n];
              if (!r) return;
              const a = r.key,
                i = this.elementsCache.get(a);
              (i !== e &&
                (i && this.observer.unobserve(i),
                this.observer.observe(e),
                this.elementsCache.set(a, e)),
                e.isConnected && this.resizeItem(n, this.options.measureElement(e, t, this)));
            }),
            (this.resizeItem = (e, t) => {
              const n = this.measurementsCache[e];
              if (!n) return;
              const r = t - (this.itemSizeCache.get(n.key) ?? n.size);
              0 !== r &&
                ((void 0 !== this.shouldAdjustScrollPositionOnItemSizeChange
                  ? this.shouldAdjustScrollPositionOnItemSizeChange(n, r, this)
                  : n.start < this.getScrollOffset() + this.scrollAdjustments) &&
                  this._scrollToOffset(this.getScrollOffset(), {
                    adjustments: (this.scrollAdjustments += r),
                    behavior: void 0,
                  }),
                this.pendingMeasuredCacheIndexes.push(n.index),
                (this.itemSizeCache = new Map(this.itemSizeCache.set(n.key, t))),
                this.notify(!1));
            }),
            (this.measureElement = (e) => {
              e
                ? this._measureElement(e, void 0)
                : this.elementsCache.forEach((e, t) => {
                    e.isConnected || (this.observer.unobserve(e), this.elementsCache.delete(t));
                  });
            }),
            (this.getVirtualItems = ls(
              () => [this.getVirtualIndexes(), this.getMeasurements()],
              (e, t) => {
                const n = [];
                for (let r = 0, a = e.length; r < a; r++) {
                  const a = t[e[r]];
                  n.push(a);
                }
                return n;
              },
              { key: !1, debug: () => this.options.debug },
            )),
            (this.getVirtualItemForOffset = (e) => {
              const t = this.getMeasurements();
              if (0 !== t.length) return us(t[Ss(0, t.length - 1, (e) => us(t[e]).start, e)]);
            }),
            (this.getOffsetForAlignment = (e, t, n = 0) => {
              const r = this.getSize(),
                a = this.getScrollOffset();
              ("auto" === t && (t = e >= a + r ? "end" : "start"),
                "center" === t ? (e += (n - r) / 2) : "end" === t && (e -= r));
              const i = this.getTotalSize() + this.options.scrollMargin - r;
              return Math.max(Math.min(i, e), 0);
            }),
            (this.getOffsetForIndex = (e, t = "auto") => {
              e = Math.max(0, Math.min(e, this.options.count - 1));
              const n = this.measurementsCache[e];
              if (!n) return;
              const r = this.getSize(),
                a = this.getScrollOffset();
              if ("auto" === t)
                if (n.end >= a + r - this.options.scrollPaddingEnd) t = "end";
                else {
                  if (!(n.start <= a + this.options.scrollPaddingStart)) return [a, t];
                  t = "start";
                }
              const i =
                "end" === t
                  ? n.end + this.options.scrollPaddingEnd
                  : n.start - this.options.scrollPaddingStart;
              return [this.getOffsetForAlignment(i, t, n.size), t];
            }),
            (this.isDynamicMode = () => this.elementsCache.size > 0),
            (this.scrollToOffset = (e, { align: t = "start", behavior: n } = {}) => {
              ("smooth" === n &&
                this.isDynamicMode() &&
                console.warn(
                  "The `smooth` scroll behavior is not fully supported with dynamic size.",
                ),
                this._scrollToOffset(this.getOffsetForAlignment(e, t), {
                  adjustments: void 0,
                  behavior: n,
                }));
            }),
            (this.scrollToIndex = (e, { align: t = "auto", behavior: n } = {}) => {
              ("smooth" === n &&
                this.isDynamicMode() &&
                console.warn(
                  "The `smooth` scroll behavior is not fully supported with dynamic size.",
                ),
                (e = Math.max(0, Math.min(e, this.options.count - 1))));
              let r = 0;
              const a = (t) => {
                  if (!this.targetWindow) return;
                  const r = this.getOffsetForIndex(e, t);
                  if (!r) return void console.warn("Failed to get offset for index:", e);
                  const [a, o] = r;
                  (this._scrollToOffset(a, { adjustments: void 0, behavior: n }),
                    this.targetWindow.requestAnimationFrame(() => {
                      const t = this.getScrollOffset(),
                        n = this.getOffsetForIndex(e, o);
                      var r, a;
                      n
                        ? ((r = n[0]), (a = t), Math.abs(r - a) < 1.01 || i(o))
                        : console.warn("Failed to get offset for index:", e);
                    }));
                },
                i = (t) => {
                  this.targetWindow &&
                    (r++,
                    r < 10
                      ? this.targetWindow.requestAnimationFrame(() => a(t))
                      : console.warn(`Failed to scroll to index ${e} after 10 attempts.`));
                };
              a(t);
            }),
            (this.scrollBy = (e, { behavior: t } = {}) => {
              ("smooth" === t &&
                this.isDynamicMode() &&
                console.warn(
                  "The `smooth` scroll behavior is not fully supported with dynamic size.",
                ),
                this._scrollToOffset(this.getScrollOffset() + e, {
                  adjustments: void 0,
                  behavior: t,
                }));
            }),
            (this.getTotalSize = () => {
              var e;
              const t = this.getMeasurements();
              let n;
              if (0 === t.length) n = this.options.paddingStart;
              else if (1 === this.options.lanes)
                n = (null == (e = t[t.length - 1]) ? void 0 : e.end) ?? 0;
              else {
                const e = Array(this.options.lanes).fill(null);
                let r = t.length - 1;
                for (; r >= 0 && e.some((e) => null === e); ) {
                  const n = t[r];
                  (null === e[n.lane] && (e[n.lane] = n.end), r--);
                }
                n = Math.max(...e.filter((e) => null !== e));
              }
              return Math.max(n - this.options.scrollMargin + this.options.paddingEnd, 0);
            }),
            (this._scrollToOffset = (e, { adjustments: t, behavior: n }) => {
              this.options.scrollToFn(e, { behavior: n, adjustments: t }, this);
            }),
            (this.measure = () => {
              ((this.itemSizeCache = new Map()), this.notify(!1));
            }),
            this.setOptions(e));
        }
      }
      const Ss = (e, t, n, r) => {
        for (; e <= t; ) {
          const a = ((e + t) / 2) | 0,
            i = n(a);
          if (i < r) e = a + 1;
          else {
            if (!(i > r)) return a;
            t = a - 1;
          }
        }
        return e > 0 ? e - 1 : 0;
      };
      const xs = "undefined" != typeof document ? p.useLayoutEffect : p.useEffect;
      function _s(e) {
        const t = p.useReducer(() => ({}), {})[1],
          n = {
            ...e,
            onChange: (n, r) => {
              var a;
              (r ? (0, ii.flushSync)(t) : t(), null == (a = e.onChange) || a.call(e, n, r));
            },
          },
          [r] = p.useState(() => new ws(n));
        return (r.setOptions(n), xs(() => r._didMount(), []), xs(() => r._willUpdate()), r);
      }
      const Cs = (0, p.forwardRef)(function (
          {
            children: e,
            active: t,
            addGroupBottomBorder: n,
            isMultiValueEdit: r,
            checked: a,
            ...i
          },
          o,
        ) {
          const s = (0, Ct.useStyles2)(Os),
            l = (0, p.useId)();
          return f().createElement(
            "div",
            {
              ref: o,
              role: "option",
              id: l,
              "aria-selected": t,
              className: (0, Vt.cx)(s.option, t && s.optionFocused, n && s.groupBottomBorder),
              ...i,
            },
            f().createElement(
              "div",
              {
                className: s.optionBody,
                "data-testid": `data-testid ad hoc filter option value ${e}`,
              },
              f().createElement(
                "span",
                null,
                r
                  ? f().createElement(Ct.Checkbox, {
                      tabIndex: -1,
                      checked: a,
                      className: s.checkbox,
                    })
                  : null,
                e,
              ),
            ),
          );
        }),
        Os = (e) => ({
          option: (0, Vt.css)({
            label: "grafana-select-option",
            top: 0,
            left: 0,
            width: "100%",
            position: "absolute",
            padding: e.spacing(1),
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            flexShrink: 0,
            whiteSpace: "nowrap",
            cursor: "pointer",
            "&:hover": {
              background: e.colors.action.hover,
              "@media (forced-colors: active), (prefers-contrast: more)": {
                border: `1px solid ${e.colors.primary.border}`,
              },
            },
          }),
          optionFocused: (0, Vt.css)({
            label: "grafana-select-option-focused",
            background: e.colors.action.focus,
            "@media (forced-colors: active), (prefers-contrast: more)": {
              border: `1px solid ${e.colors.primary.border}`,
            },
          }),
          optionBody: (0, Vt.css)({
            label: "grafana-select-option-body",
            display: "flex",
            fontWeight: e.typography.fontWeightMedium,
            flexDirection: "column",
            flexGrow: 1,
          }),
          groupBottomBorder: (0, Vt.css)({ borderBottom: `1px solid ${e.colors.border.weak}` }),
          checkbox: (0, Vt.css)({ paddingRight: e.spacing(0.5) }),
          multiValueApplyWrapper: (0, Vt.css)({
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            backgroundColor: e.colors.background.primary,
            color: e.colors.text.primary,
            boxShadow: e.shadows.z2,
            overflowY: "auto",
            zIndex: e.zIndex.dropdown,
            gap: e.spacing(1.5),
            padding: `${e.spacing(1.5)} ${e.spacing(1)}`,
          }),
        }),
        Rs = () =>
          f().createElement(
            Cs,
            { onClick: (e) => e.stopPropagation() },
            f().createElement(
              Pe.x6,
              { i18nKey: "grafana-scenes.variables.loading-options-placeholder.loading-options" },
              "Loading options...",
            ),
          ),
        ks = () =>
          f().createElement(
            Cs,
            { onClick: (e) => e.stopPropagation() },
            f().createElement(
              Pe.x6,
              { i18nKey: "grafana-scenes.variables.no-options-placeholder.no-options-found" },
              "No options found",
            ),
          ),
        Es = ({ handleFetchOptions: e }) =>
          f().createElement(
            Cs,
            { onClick: e },
            f().createElement(
              Pe.x6,
              {
                i18nKey:
                  "grafana-scenes.variables.options-error-placeholder.error-occurred-fetching-labels-click-retry",
              },
              "An error has occurred fetching labels. Click to retry",
            ),
          ),
        Ts = ({ onApply: e, floatingElement: t, maxOptionWidth: n, menuHeight: r }) => {
          const a = (0, Ct.useStyles2)(Os),
            i = null == t ? void 0 : t.getBoundingClientRect();
          return f().createElement(
            "div",
            {
              className: a.multiValueApplyWrapper,
              style: {
                width: `${n}px`,
                transform: `translate(${null == i ? void 0 : i.left}px,${i ? i.top + r : 0}px)`,
              },
            },
            f().createElement(
              Ct.Button,
              { onClick: e, size: "sm", tabIndex: -1 },
              f().createElement(
                Pe.x6,
                { i18nKey: "grafana-scenes.variables.multi-value-apply-button.apply" },
                "Apply",
              ),
            ),
          );
        },
        Ds = { key: "operator", operator: "value", value: "key" },
        Ps = (e, t, n, r, a) => As(Ds[e], t, "value" === e ? n : void 0, r, a),
        As = (e, t, n, r, a) => {
          (t(e), null == n || n(void 0, a), setTimeout(() => (null == r ? void 0 : r.focus())));
        },
        Is = ({
          filterInputType: e,
          item: t,
          filter: n,
          setFilterMultiValues: r,
          onAddCustomValue: a,
        }) => {
          var i, o, s, l, u;
          if ("key" === e)
            return {
              key: t.value,
              keyLabel: t.label ? t.label : t.value,
              meta: null == t ? void 0 : t.meta,
            };
          if ("value" === e)
            return t.isCustom && a
              ? a(t, n)
              : { value: t.value, valueLabels: [t.label ? t.label : t.value] };
          if ("operator" === e) {
            if (sl(n.operator) && !sl(t.value))
              return (
                r([]),
                {
                  operator: t.value,
                  valueLabels: [
                    (null == (i = n.valueLabels) ? void 0 : i[0]) ||
                      (null == (o = n.values) ? void 0 : o[0]) ||
                      n.value,
                  ],
                  values: void 0,
                }
              );
            if (sl(t.value) && !sl(n.operator)) {
              const e = [
                  (null == (s = n.valueLabels) ? void 0 : s[0]) ||
                    (null == (l = n.values) ? void 0 : l[0]) ||
                    n.value,
                ],
                a = [n.value];
              return (
                a[0] &&
                  r([{ value: a[0], label: null != (u = null == e ? void 0 : e[0]) ? u : a[0] }]),
                { operator: t.value, valueLabels: e, values: a }
              );
            }
          }
          return { [e]: t.value };
        },
        Vs = "Filter by label values",
        Ms = (e, t, n, r, a) => {
          var i;
          return "key" === t
            ? a || Vs
            : "value" === t
              ? n
                ? "Edit values"
                : (null == (i = e.valueLabels) ? void 0 : i[0]) || ""
              : e[t] && !r
                ? `${e[t]}`
                : a || Vs;
        },
        Ls = ({
          populateInputOnEdit: e,
          item: t,
          filterInputType: n,
          setInputValue: r,
          filter: a,
        }) => {
          var i, o, s;
          e && !sl(t.value || "") && "value" === Ds[n]
            ? r(
                null !=
                  (s =
                    null != (o = null == (i = null == a ? void 0 : a.valueLabels) ? void 0 : i[0])
                      ? o
                      : null == a
                        ? void 0
                        : a.value)
                  ? s
                  : "",
              )
            : r("");
        },
        Fs = ({
          open: e,
          onOpenChange: t,
          activeIndex: n,
          setActiveIndex: r,
          outsidePressIdsToIgnore: a,
          listRef: i,
          disabledIndicesRef: o,
        }) => {
          const {
            refs: s,
            floatingStyles: l,
            context: u,
          } = Zo({
            whileElementsMounted: Ri,
            open: e,
            onOpenChange: t,
            placement: "bottom-start",
            middleware: [
              ((c = 10), { ...ki(c), options: [c, d] }),
              Li({ padding: 10 }),
              Fi({
                apply({ availableHeight: e, availableWidth: t, elements: n }) {
                  ((n.floating.style.maxHeight = `${Math.min(300, e)}px`),
                    (n.floating.style.maxWidth = `${t}px`));
                },
                padding: 10,
              }),
            ],
            strategy: "fixed",
          });
          var c, d;
          const h = (function (e, t) {
              var n;
              void 0 === t && (t = {});
              const { open: r, floatingId: a } = e,
                { enabled: i = !0, role: o = "dialog" } = t,
                s = null != (n = ss.get(o)) ? n : o,
                l = lo(),
                u = null != ho(),
                c = p.useMemo(
                  () =>
                    "tooltip" === s || "label" === o
                      ? {
                          ["aria-" + ("label" === o ? "labelledby" : "describedby")]: r
                            ? a
                            : void 0,
                        }
                      : {
                          "aria-expanded": r ? "true" : "false",
                          "aria-haspopup": "alertdialog" === s ? "dialog" : s,
                          "aria-controls": r ? a : void 0,
                          ...("listbox" === s && { role: "combobox" }),
                          ...("menu" === s && { id: l }),
                          ...("menu" === s && u && { role: "menuitem" }),
                          ...("select" === o && { "aria-autocomplete": "none" }),
                          ...("combobox" === o && { "aria-autocomplete": "list" }),
                        },
                  [s, a, u, r, l, o],
                ),
                d = p.useMemo(() => {
                  const e = { id: a, ...(s && { role: s }) };
                  return "tooltip" === s || "label" === o
                    ? e
                    : { ...e, ...("menu" === s && { "aria-labelledby": l }) };
                }, [s, a, l, o]),
                h = p.useCallback(
                  (e) => {
                    let { active: t, selected: n } = e;
                    const r = { role: "option", ...(t && { id: a + "-option" }) };
                    switch (o) {
                      case "select":
                        return { ...r, "aria-selected": t && n };
                      case "combobox":
                        return { ...r, ...(t && { "aria-selected": !0 }) };
                    }
                    return {};
                  },
                  [a, o],
                );
              return p.useMemo(
                () => (i ? { reference: c, floating: d, item: h } : {}),
                [i, c, d, h],
              );
            })(u, { role: "listbox" }),
            f = (function (e, t) {
              void 0 === t && (t = {});
              const { open: n, onOpenChange: r, elements: a, dataRef: i } = e,
                {
                  enabled: o = !0,
                  escapeKey: s = !0,
                  outsidePress: l = !0,
                  outsidePressEvent: u = "pointerdown",
                  referencePress: c = !1,
                  referencePressEvent: d = "pointerdown",
                  ancestorScroll: h = !1,
                  bubbles: f,
                  capture: m,
                } = t,
                g = fo(),
                v = Bi("function" == typeof l ? l : () => !1),
                b = "function" == typeof l ? v : l,
                y = p.useRef(!1),
                w = p.useRef(!1),
                { escapeKey: S, outsidePress: x } = Yo(f),
                { escapeKey: _, outsidePress: C } = Yo(m),
                O = p.useRef(!1),
                R = Bi((e) => {
                  var t;
                  if (!n || !o || !s || "Escape" !== e.key) return;
                  if (O.current) return;
                  const a = null == (t = i.current.floatingContext) ? void 0 : t.nodeId,
                    l = g ? yo(g.nodesRef.current, a) : [];
                  if (!S && (e.stopPropagation(), l.length > 0)) {
                    let e = !0;
                    if (
                      (l.forEach((t) => {
                        var n;
                        null == (n = t.context) ||
                          !n.open ||
                          t.context.dataRef.current.__escapeKeyBubbles ||
                          (e = !1);
                      }),
                      !e)
                    )
                      return;
                  }
                  r(
                    !1,
                    (function (e) {
                      return "nativeEvent" in e;
                    })(e)
                      ? e.nativeEvent
                      : e,
                    "escape-key",
                  );
                }),
                k = Bi((e) => {
                  var t;
                  const n = () => {
                    var t;
                    (R(e), null == (t = fa(e)) || t.removeEventListener("keydown", n));
                  };
                  null == (t = fa(e)) || t.addEventListener("keydown", n);
                }),
                E = Bi((e) => {
                  var t;
                  const n = y.current;
                  y.current = !1;
                  const o = w.current;
                  if (((w.current = !1), "click" === u && o)) return;
                  if (n) return;
                  if ("function" == typeof b && !b(e)) return;
                  const s = fa(e),
                    l = "[" + mo("inert") + "]",
                    c = pa(a.floating).querySelectorAll(l);
                  let d = Lr(s) ? s : null;
                  for (; d && !Zr(d); ) {
                    const e = ea(d);
                    if (Zr(e) || !Lr(e)) break;
                    d = e;
                  }
                  if (
                    c.length &&
                    Lr(s) &&
                    !s.matches("html,body") &&
                    !ia(s, a.floating) &&
                    Array.from(c).every((e) => !ia(d, e))
                  )
                    return;
                  if (Fr(s) && P) {
                    const t = s.clientWidth > 0 && s.scrollWidth > s.clientWidth,
                      n = s.clientHeight > 0 && s.scrollHeight > s.clientHeight;
                    let r = n && e.offsetX > s.clientWidth;
                    if (
                      (n &&
                        "rtl" === Xr(s).direction &&
                        (r = e.offsetX <= s.offsetWidth - s.clientWidth),
                      r || (t && e.offsetY > s.clientHeight))
                    )
                      return;
                  }
                  const p = null == (t = i.current.floatingContext) ? void 0 : t.nodeId,
                    h =
                      g &&
                      yo(g.nodesRef.current, p).some((t) => {
                        var n;
                        return ha(e, null == (n = t.context) ? void 0 : n.elements.floating);
                      });
                  if (ha(e, a.floating) || ha(e, a.domReference) || h) return;
                  const f = g ? yo(g.nodesRef.current, p) : [];
                  if (f.length > 0) {
                    let e = !0;
                    if (
                      (f.forEach((t) => {
                        var n;
                        null == (n = t.context) ||
                          !n.open ||
                          t.context.dataRef.current.__outsidePressBubbles ||
                          (e = !1);
                      }),
                      !e)
                    )
                      return;
                  }
                  r(!1, e, "outside-press");
                }),
                T = Bi((e) => {
                  var t;
                  const n = () => {
                    var t;
                    (E(e), null == (t = fa(e)) || t.removeEventListener(u, n));
                  };
                  null == (t = fa(e)) || t.addEventListener(u, n);
                });
              (p.useEffect(() => {
                if (!n || !o) return;
                ((i.current.__escapeKeyBubbles = S), (i.current.__outsidePressBubbles = x));
                let e = -1;
                function t(e) {
                  r(!1, e, "ancestor-scroll");
                }
                function l() {
                  (window.clearTimeout(e), (O.current = !0));
                }
                function c() {
                  e = window.setTimeout(
                    () => {
                      O.current = !1;
                    },
                    Kr() ? 5 : 0,
                  );
                }
                const d = pa(a.floating);
                (s &&
                  (d.addEventListener("keydown", _ ? k : R, _),
                  d.addEventListener("compositionstart", l),
                  d.addEventListener("compositionend", c)),
                  b && d.addEventListener(u, C ? T : E, C));
                let p = [];
                return (
                  h &&
                    (Lr(a.domReference) && (p = na(a.domReference)),
                    Lr(a.floating) && (p = p.concat(na(a.floating))),
                    !Lr(a.reference) &&
                      a.reference &&
                      a.reference.contextElement &&
                      (p = p.concat(na(a.reference.contextElement)))),
                  (p = p.filter((e) => {
                    var t;
                    return e !== (null == (t = d.defaultView) ? void 0 : t.visualViewport);
                  })),
                  p.forEach((e) => {
                    e.addEventListener("scroll", t, { passive: !0 });
                  }),
                  () => {
                    (s &&
                      (d.removeEventListener("keydown", _ ? k : R, _),
                      d.removeEventListener("compositionstart", l),
                      d.removeEventListener("compositionend", c)),
                      b && d.removeEventListener(u, C ? T : E, C),
                      p.forEach((e) => {
                        e.removeEventListener("scroll", t);
                      }),
                      window.clearTimeout(e));
                  }
                );
              }, [i, a, s, b, u, n, r, h, o, S, x, R, _, k, E, C, T]),
                p.useEffect(() => {
                  y.current = !1;
                }, [b, u]));
              const D = p.useMemo(
                  () => ({
                    onKeyDown: R,
                    [Qo[d]]: (e) => {
                      c && r(!1, e.nativeEvent, "reference-press");
                    },
                  }),
                  [R, r, c, d],
                ),
                P = p.useMemo(
                  () => ({
                    onKeyDown: R,
                    onMouseDown() {
                      w.current = !0;
                    },
                    onMouseUp() {
                      w.current = !0;
                    },
                    [Ko[u]]: () => {
                      y.current = !0;
                    },
                  }),
                  [R, u],
                );
              return p.useMemo(() => (o ? { reference: D, floating: P } : {}), [o, D, P]);
            })(u, {
              outsidePress: (e) => {
                var t;
                if (e.currentTarget instanceof Element) {
                  const n = e.currentTarget;
                  let r = n.id;
                  if (
                    ("path" === n.nodeName &&
                      (r = (null == (t = n.parentElement) ? void 0 : t.id) || ""),
                    a.includes(r))
                  )
                    return !1;
                }
                return !0;
              },
            }),
            m = os(u, {
              listRef: i,
              activeIndex: n,
              onNavigate: r,
              virtual: !0,
              loop: !0,
              disabledIndices: o.current,
            }),
            {
              getReferenceProps: g,
              getFloatingProps: v,
              getItemProps: b,
            } = (function (e) {
              void 0 === e && (e = []);
              const t = e.map((e) => (null == e ? void 0 : e.reference)),
                n = e.map((e) => (null == e ? void 0 : e.floating)),
                r = e.map((e) => (null == e ? void 0 : e.item)),
                a = p.useCallback((t) => es(t, e, "reference"), t),
                i = p.useCallback((t) => es(t, e, "floating"), n),
                o = p.useCallback((t) => es(t, e, "item"), r);
              return p.useMemo(
                () => ({ getReferenceProps: a, getFloatingProps: i, getItemProps: o }),
                [a, i, o],
              );
            })([h, f, m]);
          return {
            refs: s,
            floatingStyles: l,
            context: u,
            getReferenceProps: g,
            getFloatingProps: v,
            getItemProps: b,
          };
        },
        js = ({ item: e, handleRemoveMultiValue: t, index: n, handleEditMultiValuePill: r }) => {
          var a, i;
          const o = (0, Ct.useStyles2)(Ns),
            s = (0, p.useCallback)(
              (t) => {
                (t.stopPropagation(), t.preventDefault(), r(e));
              },
              [r, e],
            ),
            l = (0, p.useCallback)(
              (e) => {
                "Enter" === e.key && s(e);
              },
              [s],
            ),
            u = (0, p.useCallback)(
              (n) => {
                (n.stopPropagation(), n.preventDefault(), t(e));
              },
              [t, e],
            ),
            c = (0, p.useCallback)(
              (e) => {
                "Enter" === e.key && u(e);
              },
              [u],
            );
          return f().createElement(
            "div",
            {
              className: (0, Vt.cx)(o.basePill, o.valuePill),
              onClick: s,
              onKeyDown: l,
              tabIndex: 0,
              id: `${e.value}-${n}`,
            },
            null != (a = e.label) ? a : e.value,
            f().createElement(
              Ct.Button,
              {
                onClick: u,
                onKeyDownCapture: c,
                fill: "text",
                size: "sm",
                variant: "secondary",
                className: o.removeButton,
                tooltip: (0, Pe.t)(
                  "grafana-scenes.components.adhoc-filters-combobox.remove-filter-value",
                  "Remove filter value - {{itemLabel}}",
                  { itemLabel: null != (i = e.label) ? i : e.value },
                ),
              },
              f().createElement(Ct.Icon, {
                name: "times",
                size: "md",
                id: `${e.value}-${n}-close-icon`,
              }),
            ),
          );
        },
        Ns = (e) => ({
          basePill: (0, Vt.css)({
            display: "flex",
            alignItems: "center",
            background: e.colors.action.disabledBackground,
            border: `1px solid ${e.colors.border.weak}`,
            padding: e.spacing(0.125, 1, 0.125, 1),
            color: e.colors.text.primary,
            overflow: "hidden",
            whiteSpace: "nowrap",
            minHeight: e.spacing(2.75),
            ...e.typography.bodySmall,
            cursor: "pointer",
          }),
          valuePill: (0, Vt.css)({
            background: e.colors.action.selected,
            padding: e.spacing(0.125, 0, 0.125, 1),
          }),
          removeButton: (0, Vt.css)({
            marginInline: e.spacing(0.5),
            height: "100%",
            padding: 0,
            cursor: "pointer",
            "&:hover": { color: e.colors.text.primary },
          }),
        }),
        Bs = (0, p.forwardRef)(function (
          {
            filter: e,
            controller: t,
            isAlwaysWip: n,
            handleChangeViewMode: r,
            focusOnWipInputRef: a,
            populateInputOnEdit: i,
          },
          o,
        ) {
          var s, l, u;
          const [c, d] = (0, p.useState)(!1),
            [h, m] = (0, p.useState)([]),
            [g, v] = (0, p.useState)(!1),
            [b, y] = (0, p.useState)(!1),
            [w, S] = (0, p.useState)(""),
            [x, _] = (0, p.useState)(null),
            [C, O] = (0, p.useState)(n ? "key" : "value"),
            [R, k] = (0, p.useState)(!n && "value" === C),
            E = (0, Ct.useStyles2)(zs),
            [T, D] = (0, p.useState)([]),
            [P, A] = (0, p.useState)({}),
            {
              allowCustomValue: I = !0,
              onAddCustomValue: V,
              filters: M,
              inputPlaceholder: L,
            } = t.useState(),
            F = (0, p.useRef)(null),
            j = sl((null == e ? void 0 : e.operator) || ""),
            N = j && "value" === C,
            B = (0, p.useId)(),
            z = (0, p.useRef)([]),
            $ = (0, p.useRef)([]),
            W = (0, p.useRef)(n ? "key" : "value"),
            H = (0, p.useMemo)(() => wr(h), [h]),
            U = (0, p.useMemo)(() => !n && M.at(-1) === e, [e, n, M]),
            q = (0, p.useCallback)(() => {
              n && (t.addWip(), O("key"), S(""));
            }, [t, n]),
            G = (0, p.useCallback)((e, t, n, r) => {
              var a;
              if ((!n.length && t.origin && e.updateToMatchAll(t), n.length)) {
                const r = [],
                  i = [];
                n.forEach((e) => {
                  var t;
                  (r.push(null != (t = e.label) ? t : e.value), i.push(e.value));
                });
                let o = !0;
                (Array.isArray(t.values) &&
                  t.values.length === i.length &&
                  (o = !t.values.every((e, t) => e === i[t])),
                  o && (null == (a = e.startProfile) || a.call(e, ge)),
                  e.updateFilter(t, { valueLabels: r, values: i, value: i[0] }),
                  D([]));
              }
              r ||
                setTimeout(() => {
                  var e;
                  return null == (e = Z.domReference.current) ? void 0 : e.focus();
                });
            }, []),
            Q = (0, p.useCallback)((e) => {
              D((t) =>
                t.some((t) => t.value === e.value)
                  ? t.filter((t) => t.value !== e.value)
                  : [...t, e],
              );
            }, []),
            K = (0, p.useCallback)(
              (n, a, i) => {
                (d(n),
                  i &&
                    ["outside-press", "escape-key"].includes(i) &&
                    (N ? G(t, e, T) : e && e.origin && "" === w && t.updateToMatchAll(e),
                    q(),
                    null == r || r()));
              },
              [e, T, r, G, q, w, N, t],
            ),
            Y = (0, p.useMemo)(
              () => [
                B,
                ...T.reduce(
                  (e, t, n) => [...e, `${t.value}-${n}`, `${t.value}-${n}-close-icon`],
                  [],
                ),
              ],
              [B, T],
            ),
            {
              refs: Z,
              floatingStyles: X,
              context: J,
              getReferenceProps: ee,
              getFloatingProps: te,
              getItemProps: ne,
            } = Fs({
              open: c,
              onOpenChange: K,
              activeIndex: x,
              setActiveIndex: _,
              outsidePressIdsToIgnore: Y,
              listRef: z,
              disabledIndicesRef: $,
            });
          (0, p.useImperativeHandle)(
            o,
            () => () => {
              var e;
              return null == (e = Z.domReference.current) ? void 0 : e.focus();
            },
            [Z.domReference],
          );
          const re = (0, p.useCallback)(
              (e) => {
                (D((t) => t.filter((t) => t.value !== e.value)),
                  setTimeout(() => {
                    var e;
                    return null == (e = Z.domReference.current) ? void 0 : e.focus();
                  }));
              },
              [Z.domReference],
            ),
            ae = ((e) => e.flatMap((e) => (e.options ? [e, ...e.options] : [e])))(
              El(H(R ? "" : w)),
            );
          if (I && "operator" !== C && w) {
            const t = Js.find((t) => (null == e ? void 0 : e.operator) === t.value),
              n = { value: w.trim(), label: w.trim(), isCustom: !0 };
            (null == t ? void 0 : t.isRegex) ? ae.unshift(n) : ae.push(n);
          }
          const ie = ((e, t, n) => {
              var r, a, i, o;
              let s = 182;
              const l = [],
                u = [];
              for (let t = 0; t < e.length; t++) {
                (l.push(null), (null == (r = e[t]) ? void 0 : r.options) && u.push(t));
                let n = null != (i = null != (a = e[t].label) ? a : e[t].value) ? i : "",
                  c = 8;
                8 * n.length < 6 * ((null == (o = e[t].description) ? void 0 : o.length) || 0) &&
                  ((n = e[t].description), (c = 6));
                const d = (e[t].isCustom ? n.length + 18 : n.length) * c + 16;
                d > s && (s = d);
              }
              return ((t.current = [...l]), (n.current = [...u]), s);
            })(ae, z, $),
            oe = (0, p.useCallback)(
              async (n) => {
                var r, a, i, o;
                const s = "key" === n ? "adhoc_keys_dropdown" : "adhoc_values_dropdown";
                ("operator" !== n && (null == (r = t.startInteraction) || r.call(t, s)),
                  y(!1),
                  v(!0),
                  m([]));
                let l = [];
                try {
                  if (
                    ("key" === n
                      ? (l = await t.getKeys(null))
                      : "operator" === n
                        ? (l = t.getOperators())
                        : "value" === n && (l = await t.getValuesFor(e)),
                    W.current !== n)
                  )
                    return void (null == (a = t.stopInteraction) || a.call(t));
                  (m(l), (null == (i = l[0]) ? void 0 : i.group) ? _(1) : _(0));
                } catch (e) {
                  y(!0);
                }
                (v(!1), null == (o = t.stopInteraction) || o.call(t));
              },
              [e, t],
            ),
            se = (function (e) {
              return _s({ observeElementRect: fs, observeElementOffset: vs, scrollToFn: ys, ...e });
            })({
              count: ae.length,
              getScrollElement: () => Z.floating.current,
              estimateSize: (e) => (ae[e].description ? 60 : 38),
              overscan: 5,
            }),
            le = (0, p.useCallback)(
              (r, i) => {
                var o;
                if ("Backspace" === r.key && !w) {
                  if ("value" === C) {
                    if (i && T.length)
                      return void D((e) => {
                        const t = [...e];
                        return (t.splice(-1, 1), t);
                      });
                    if (null == e ? void 0 : e.origin) return;
                    return void O("operator");
                  }
                  (null == a || a(),
                    il(e) && (null == (o = t.startProfile) || o.call(t, me)),
                    t.handleComboboxBackspace(e),
                    n && q());
                }
              },
              [w, C, t, e, n, T.length, q, a],
            ),
            ue = (0, p.useCallback)(
              (n, a) => {
                var i;
                "Tab" !== n.key ||
                  n.shiftKey ||
                  (a &&
                    (n.preventDefault(),
                    G(t, e, T),
                    null == (i = Z.domReference.current) || i.focus()),
                  null == r || r(),
                  q());
              },
              [e, T, r, G, q, t, Z.domReference],
            ),
            ce = (0, p.useCallback)(
              (n, a) => {
                "Tab" === n.key &&
                  n.shiftKey &&
                  (a && (n.preventDefault(), G(t, e, T, !0)), null == r || r(), q());
              },
              [e, T, r, G, q, t],
            ),
            de = (0, p.useCallback)(
              (n, o) => {
                var s;
                if ("Enter" === n.key && null != x) {
                  if (!ae[x]) return;
                  const n = ae[x];
                  if (o) (Q(n), S(""));
                  else {
                    const o = Is({
                      filterInputType: C,
                      item: n,
                      filter: e,
                      setFilterMultiValues: D,
                      onAddCustomValue: V,
                    });
                    ("value" === C &&
                      o.value !== (null == e ? void 0 : e.value) &&
                      (null == (s = t.startProfile) || s.call(t, ge)),
                      t.updateFilter(e, o),
                      Ls({
                        populateInputOnEdit: i,
                        item: n,
                        filterInputType: C,
                        setInputValue: S,
                        filter: e,
                      }),
                      Ps(C, O, r, Z.domReference.current, !U && void 0),
                      _(null),
                      U && (null == a || a()));
                  }
                }
              },
              [x, ae, Q, t, e, C, i, r, Z.domReference, U, a, V],
            ),
            pe = (0, p.useCallback)(
              (e) => {
                var t;
                const n = e.label || e.value;
                (D((t) => t.filter((t) => t.value !== e.value)),
                  k(!0),
                  S(n),
                  null == (t = Z.domReference.current) || t.focus(),
                  setTimeout(() => {
                    var e;
                    null == (e = Z.domReference.current) || e.select();
                  }));
              },
              [Z.domReference],
            );
          ((0, p.useEffect)(() => {
            c && oe(C);
          }, [c, C]),
            (0, p.useEffect)(() => {
              var t, r, a, o;
              if (!n) {
                if (j && (null == (t = null == e ? void 0 : e.values) ? void 0 : t.length)) {
                  const t = e.values.reduce((t, n, r) => {
                    var a;
                    return [
                      ...t,
                      { label: (null == (a = e.valueLabels) ? void 0 : a[r]) || n, value: n },
                    ];
                  }, []);
                  D(t);
                }
                (!j &&
                  i &&
                  (S(
                    null != (a = null == (r = null == e ? void 0 : e.valueLabels) ? void 0 : r[0])
                      ? a
                      : (null == e ? void 0 : e.value) || "",
                  ),
                  setTimeout(() => {
                    var e;
                    null == (e = Z.domReference.current) || e.select();
                  })),
                  null == (o = Z.domReference.current) || o.focus());
              }
            }, []),
            (0, p.useEffect)(() => {
              N && T && setTimeout(() => A({}));
            }, [T, N]),
            (0, p.useLayoutEffect)(() => {
              W.current && (W.current = C);
            }, [C]),
            (0, p.useLayoutEffect)(() => {
              var e, t;
              null !== x &&
                se.range &&
                (x > (null == (e = se.range) ? void 0 : e.endIndex) ||
                  x < (null == (t = se.range) ? void 0 : t.startIndex)) &&
                se.scrollToIndex(x);
            }, [x, se]));
          const he = null != (s = null == e ? void 0 : e.keyLabel) ? s : null == e ? void 0 : e.key;
          return f().createElement(
            "div",
            { className: E.comboboxWrapper },
            e
              ? f().createElement(
                  "div",
                  { className: E.pillWrapper },
                  (null == e ? void 0 : e.key)
                    ? f().createElement("div", { className: (0, Vt.cx)(E.basePill, E.keyPill) }, he)
                    : null,
                  (null == e ? void 0 : e.key) &&
                    (null == e ? void 0 : e.operator) &&
                    "operator" !== C
                    ? f().createElement(
                        "div",
                        {
                          id: B,
                          className: (0, Vt.cx)(
                            E.basePill,
                            !e.origin && E.operatorPill,
                            e.origin && E.keyPill,
                            B,
                          ),
                          "aria-label": (0, Pe.t)(
                            "grafana-scenes.variables.ad-hoc-combobox.aria-label-edit-filter-operator",
                            "Edit filter operator",
                          ),
                          tabIndex: e.origin ? -1 : 0,
                          onClick: (t) => {
                            e.origin
                              ? null == r || r()
                              : (t.stopPropagation(),
                                S(""),
                                As("operator", O, void 0, Z.domReference.current));
                          },
                          onKeyDown: (t) => {
                            e.origin ||
                              (ce(t, j),
                              "Enter" === t.key &&
                                (S(""), As("operator", O, void 0, Z.domReference.current)));
                          },
                          ...(!e.origin && { role: "button" }),
                        },
                        e.operator,
                      )
                    : null,
                  f().createElement("div", { ref: F }),
                  N
                    ? T.map((e, t) =>
                        f().createElement(js, {
                          key: `${e.value}-${t}`,
                          item: e,
                          index: t,
                          handleRemoveMultiValue: re,
                          handleEditMultiValuePill: pe,
                        }),
                      )
                    : null,
                )
              : null,
            f().createElement("input", {
              ...ee({
                ref: Z.setReference,
                onChange: function (e) {
                  const t = e.target.value;
                  (S(t), _(0), R && k(!1));
                },
                value: w,
                placeholder: Ms(e, C, N, n, L),
                "aria-autocomplete": "list",
                onKeyDown(e) {
                  c ? ("operator" === C && ce(e), le(e, N), ue(e, N), de(e, N)) : d(!0);
                },
              }),
              className: (0, Vt.cx)(E.inputStyle, { [E.loadingInputPadding]: !g }),
              onClick: (e) => {
                (e.stopPropagation(), d(!0));
              },
              onFocus: () => {
                d(!0);
              },
            }),
            g ? f().createElement(Ct.Spinner, { className: E.loadingIndicator, inline: !0 }) : null,
            f().createElement(
              No,
              null,
              c &&
                f().createElement(
                  Go,
                  { context: J, initialFocus: -1, visuallyHiddenDismiss: !0, modal: !0 },
                  f().createElement(
                    f().Fragment,
                    null,
                    f().createElement(
                      "div",
                      {
                        style: {
                          ...X,
                          width: `${b ? 366 : ie}px`,
                          transform: N
                            ? `translate(${(null == (l = F.current) ? void 0 : l.getBoundingClientRect().left) || 0}px, ${((null == (u = Z.domReference.current) ? void 0 : u.getBoundingClientRect().bottom) || 0) + 10}px )`
                            : X.transform,
                        },
                        ref: Z.setFloating,
                        className: E.dropdownWrapper,
                        tabIndex: -1,
                      },
                      f().createElement(
                        "div",
                        {
                          style: { height: `${se.getTotalSize() || 38}px` },
                          ...te(),
                          tabIndex: -1,
                        },
                        g
                          ? f().createElement(Rs, null)
                          : b
                            ? f().createElement(Es, { handleFetchOptions: () => oe(C) })
                            : ae.length || (I && "operator" !== C && w)
                              ? se.getVirtualItems().map((n) => {
                                  var a;
                                  const o = ae[n.index],
                                    s = n.index;
                                  if (o.options)
                                    return f().createElement(
                                      "div",
                                      {
                                        key: `${o.label}+${s}`,
                                        className: (0, Vt.cx)(E.optionGroupLabel, E.groupTopBorder),
                                        style: {
                                          height: `${n.size}px`,
                                          transform: `translateY(${n.start}px)`,
                                        },
                                      },
                                      f().createElement(
                                        Ct.Text,
                                        {
                                          weight: "bold",
                                          variant: "bodySmall",
                                          color: "secondary",
                                        },
                                        o.label,
                                      ),
                                    );
                                  const l = ae[n.index + 1],
                                    u = l && !l.group && !l.options && o.group,
                                    c = null != (a = o.label) ? a : o.value;
                                  return f().createElement(
                                    Cs,
                                    {
                                      ...ne({
                                        key: `${o.value}-${s}`,
                                        ref(e) {
                                          z.current[s] = e;
                                        },
                                        onClick(n) {
                                          var a, s;
                                          if (("value" !== C && n.stopPropagation(), N))
                                            (n.preventDefault(),
                                              n.stopPropagation(),
                                              Q(o),
                                              S(""),
                                              null == (a = Z.domReference.current) || a.focus());
                                          else {
                                            const n = Is({
                                              filterInputType: C,
                                              item: o,
                                              filter: e,
                                              setFilterMultiValues: D,
                                              onAddCustomValue: V,
                                            });
                                            ("value" === C &&
                                              n.value !== (null == e ? void 0 : e.value) &&
                                              (null == (s = t.startProfile) || s.call(t, ge)),
                                              t.updateFilter(e, n),
                                              Ls({
                                                populateInputOnEdit: i,
                                                item: o,
                                                filterInputType: C,
                                                setInputValue: S,
                                                filter: e,
                                              }),
                                              Ps(C, O, r, Z.domReference.current, !1));
                                          }
                                        },
                                      }),
                                      active: x === s,
                                      addGroupBottomBorder: u,
                                      style: {
                                        height: `${n.size}px`,
                                        transform: `translateY(${n.start}px)`,
                                      },
                                      "aria-setsize": ae.length,
                                      "aria-posinset": n.index + 1,
                                      isMultiValueEdit: N,
                                      checked: T.some((e) => e.value === o.value),
                                    },
                                    f().createElement(
                                      "span",
                                      null,
                                      o.isCustom
                                        ? (0, Pe.t)(
                                            "grafana-scenes.components.adhoc-filters-combobox.use-custom-value",
                                            "Use custom value: {{itemLabel}}",
                                            { itemLabel: c },
                                          )
                                        : c,
                                    ),
                                    o.description
                                      ? f().createElement(
                                          "div",
                                          { className: E.descriptionText },
                                          o.description,
                                        )
                                      : null,
                                  );
                                })
                              : f().createElement(ks, null),
                      ),
                    ),
                    N && !g && !b && ae.length
                      ? f().createElement(Ts, {
                          onApply: () => {
                            G(t, e, T);
                          },
                          floatingElement: Z.floating.current,
                          maxOptionWidth: ie,
                          menuHeight: Math.min(se.getTotalSize(), 300),
                        })
                      : null,
                  ),
                ),
            ),
          );
        }),
        zs = (e) => ({
          comboboxWrapper: (0, Vt.css)({ display: "flex", flexWrap: "wrap" }),
          pillWrapper: (0, Vt.css)({ display: "flex", alignItems: "center", flexWrap: "wrap" }),
          basePill: (0, Vt.css)({
            display: "flex",
            alignItems: "center",
            background: e.colors.action.disabledBackground,
            border: `1px solid ${e.colors.border.weak}`,
            padding: e.spacing(0.125, 1, 0.125, 1),
            color: e.colors.text.primary,
            overflow: "hidden",
            whiteSpace: "nowrap",
            minHeight: e.spacing(2.75),
            ...e.typography.bodySmall,
            cursor: "pointer",
          }),
          keyPill: (0, Vt.css)({ fontWeight: e.typography.fontWeightBold, cursor: "default" }),
          operatorPill: (0, Vt.css)({ "&:hover": { background: e.colors.action.hover } }),
          dropdownWrapper: (0, Vt.css)({
            backgroundColor: e.colors.background.primary,
            color: e.colors.text.primary,
            boxShadow: e.shadows.z2,
            overflowY: "auto",
            zIndex: e.zIndex.portal,
          }),
          inputStyle: (0, Vt.css)({ paddingBlock: 0, "&:focus": { outline: "none" } }),
          loadingIndicator: (0, Vt.css)({
            color: e.colors.text.secondary,
            marginLeft: e.spacing(0.5),
          }),
          loadingInputPadding: (0, Vt.css)({ paddingRight: e.spacing(2.5) }),
          optionGroupLabel: (0, Vt.css)({
            padding: e.spacing(1),
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }),
          groupTopBorder: (0, Vt.css)({
            "&:not(:first-child)": { borderTop: `1px solid ${e.colors.border.weak}` },
          }),
          descriptionText: (0, Vt.css)({
            ...e.typography.bodySmall,
            color: e.colors.text.secondary,
            paddingTop: e.spacing(0.5),
          }),
        });
      function $s({ filter: e, controller: t, readOnly: n, focusOnWipInputRef: r }) {
        var a, i, o, s;
        const l = (0, Ct.useStyles2)(Ws),
          [u, c] = (0, p.useState)(!0),
          [d, h] = (0, p.useState)(!1),
          m = (0, p.useRef)(null),
          [g, v] = (0, p.useState)(!1),
          b = null != (a = e.keyLabel) ? a : e.key,
          y =
            (null == (i = e.valueLabels) ? void 0 : i.join(", ")) ||
            (null == (o = e.values) ? void 0 : o.join(", ")) ||
            e.value,
          w = (0, p.useCallback)(
            (e, t) => {
              (null == e || e.stopPropagation(), n || (h(null != t ? t : !u), c(!u)));
            },
            [n, u],
          );
        ((0, p.useEffect)(() => {
          var e;
          d && (null == (e = m.current) || e.focus(), h(!1));
        }, [d]),
          (0, p.useEffect)(() => {
            e.forceEdit && u && (c(!1), t.updateFilter(e, { forceEdit: void 0 }));
          }, [e, t, u]),
          (0, p.useEffect)(() => {
            u && v((e) => !e && e);
          }, [u]));
        const S = (e) =>
            "dashboard" === e
              ? {
                  info: "Applied by default in this dashboard. If edited, it carries over to other dashboards.",
                  restore: "Restore the value set by this dashboard.",
                }
              : "scope" === e
                ? {
                    info: "Applied automatically from your selected scope.",
                    restore: "Restore the value set by your selected scope.",
                  }
                : {
                    info: `This is a ${e} injected filter.`,
                    restore: "Restore filter to its original value.",
                  },
          x = !e.restorable && !e.readOnly && !e.nonApplicable;
        if (u) {
          const a = `${b} ${e.operator} ${y}`,
            i = f().createElement(
              "span",
              { className: (0, Vt.cx)(l.pillText, e.nonApplicable && l.strikethrough) },
              a,
            );
          return f().createElement(
            "div",
            {
              className: (0, Vt.cx)(
                l.combinedFilterPill,
                n && l.readOnlyCombinedFilter,
                (al(e) || e.nonApplicable) && l.disabledPill,
                e.readOnly && l.filterReadOnly,
              ),
              onClick: (e) => {
                (e.stopPropagation(), v(!0), w());
              },
              onKeyDown: (e) => {
                "Enter" === e.key && (v(!0), w());
              },
              role: n ? void 0 : "button",
              "aria-label": (0, Pe.t)(
                "grafana-scenes.components.adhoc-filter-pill.edit-filter-with-key",
                "Edit filter with key {{keyLabel}}",
                { keyLabel: b },
              ),
              tabIndex: 0,
              ref: m,
            },
            a.length < 20
              ? i
              : f().createElement(
                  Ct.Tooltip,
                  {
                    content: f().createElement("div", { className: l.tooltipText }, a),
                    placement: "top",
                  },
                  i,
                ),
            n || e.matchAllFilter || (e.origin && "dashboard" !== e.origin)
              ? null
              : f().createElement(Ct.IconButton, {
                  onClick: (n) => {
                    (n.stopPropagation(),
                      e.origin && "dashboard" === e.origin
                        ? t.updateToMatchAll(e)
                        : t.removeFilter(e),
                      setTimeout(() => (null == r ? void 0 : r())));
                  },
                  onKeyDownCapture: (n) => {
                    "Enter" === n.key &&
                      (n.preventDefault(),
                      n.stopPropagation(),
                      e.origin && "dashboard" === e.origin
                        ? t.updateToMatchAll(e)
                        : t.removeFilter(e),
                      setTimeout(() => (null == r ? void 0 : r())));
                  },
                  name: "times",
                  size: "md",
                  className: (0, Vt.cx)(l.pillIcon, e.nonApplicable && l.disabledPillIcon),
                  tooltip: (0, Pe.t)(
                    "grafana-scenes.components.adhoc-filter-pill.remove-filter-with-key",
                    "Remove filter with key {{keyLabel}}",
                    { keyLabel: b },
                  ),
                }),
            e.origin &&
              e.readOnly &&
              f().createElement(
                Ct.Tooltip,
                {
                  content: (0, Pe.t)(
                    "grafana-scenes.components.adhoc-filter-pill.managed-filter",
                    "{{origin}} managed filter",
                    { origin: e.origin },
                  ),
                  placement: "bottom",
                },
                f().createElement(Ct.Icon, {
                  name: "lock",
                  size: "md",
                  className: l.readOnlyPillIcon,
                }),
              ),
            e.origin &&
              x &&
              f().createElement(
                Ct.Tooltip,
                { content: S(e.origin).info, placement: "bottom" },
                f().createElement(Ct.Icon, {
                  name: "info-circle",
                  size: "md",
                  className: l.infoPillIcon,
                }),
              ),
            e.origin &&
              e.restorable &&
              !e.readOnly &&
              f().createElement(Ct.IconButton, {
                onClick: (n) => {
                  (n.stopPropagation(), t.restoreOriginalFilter(e));
                },
                onKeyDownCapture: (n) => {
                  "Enter" === n.key &&
                    (n.preventDefault(), n.stopPropagation(), t.restoreOriginalFilter(e));
                },
                name: "history",
                size: "md",
                className: al(e) ? l.matchAllPillIcon : l.pillIcon,
                tooltip: S(e.origin).restore,
              }),
            e.nonApplicable &&
              f().createElement(
                Ct.Tooltip,
                {
                  content:
                    null != (s = e.nonApplicableReason)
                      ? s
                      : (0, Pe.t)(
                          "grafana-scenes.components.adhoc-filter-pill.non-applicable",
                          "Filter is not applicable",
                        ),
                  placement: "bottom",
                },
                f().createElement(Ct.Icon, {
                  name: "info-circle",
                  size: "md",
                  className: l.infoPillIcon,
                }),
              ),
          );
        }
        return f().createElement(Bs, {
          filter: e,
          controller: t,
          handleChangeViewMode: w,
          focusOnWipInputRef: r,
          populateInputOnEdit: g,
        });
      }
      const Ws = (e) => ({
          combinedFilterPill: (0, Vt.css)({
            display: "flex",
            alignItems: "center",
            background: e.colors.action.selected,
            borderRadius: e.shape.radius.default,
            border: `1px solid ${e.colors.border.weak}`,
            padding: e.spacing(0.125, 0, 0.125, 1),
            color: e.colors.text.primary,
            overflow: "hidden",
            whiteSpace: "nowrap",
            minHeight: e.spacing(2.75),
            ...e.typography.bodySmall,
            fontWeight: e.typography.fontWeightBold,
            cursor: "pointer",
            "&:hover": { background: e.colors.action.hover },
          }),
          readOnlyCombinedFilter: (0, Vt.css)({
            paddingRight: e.spacing(1),
            cursor: "text",
            "&:hover": { background: e.colors.action.selected },
          }),
          filterReadOnly: (0, Vt.css)({
            background: e.colors.background.canvas,
            cursor: "text",
            "&:hover": { background: e.colors.background.canvas },
          }),
          pillIcon: (0, Vt.css)({
            marginInline: e.spacing(0.5),
            cursor: "pointer",
            "&:hover": { color: e.colors.text.primary },
          }),
          pillText: (0, Vt.css)({
            maxWidth: "200px",
            width: "100%",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }),
          tooltipText: (0, Vt.css)({ textAlign: "center" }),
          infoPillIcon: (0, Vt.css)({ marginInline: e.spacing(0.5), cursor: "pointer" }),
          readOnlyPillIcon: (0, Vt.css)({ marginInline: e.spacing(0.5) }),
          matchAllPillIcon: (0, Vt.css)({
            marginInline: e.spacing(0.5),
            cursor: "pointer",
            color: e.colors.text.disabled,
          }),
          disabledPillIcon: (0, Vt.css)({
            marginInline: e.spacing(0.5),
            cursor: "pointer",
            color: e.colors.text.disabled,
            "&:hover": { color: e.colors.text.disabled },
          }),
          ...Tl(e),
        }),
        Hs = (0, p.forwardRef)(function ({ controller: e }, t) {
          const { wip: n } = e.useState();
          return (
            (0, p.useLayoutEffect)(() => {
              n || e.addWip();
            }, [n]),
            f().createElement(Bs, { controller: e, filter: n, isAlwaysWip: !0, ref: t })
          );
        }),
        Us = (0, p.memo)(function ({ controller: e }) {
          const { originFilters: t, filters: n, readOnly: r } = e.useState(),
            a = (0, Ct.useStyles2)(qs),
            i = (0, p.useRef)();
          return f().createElement(
            "div",
            {
              className: (0, Vt.cx)(a.comboboxWrapper, { [a.comboboxFocusOutline]: !r }),
              onClick: () => {
                var e;
                null == (e = i.current) || e.call(i);
              },
            },
            f().createElement(Ct.Icon, { name: "filter", className: a.filterIcon, size: "lg" }),
            null == t
              ? void 0
              : t.map((t, n) =>
                  t.origin
                    ? f().createElement($s, {
                        key: `${n}-${t.key}`,
                        filter: t,
                        controller: e,
                        focusOnWipInputRef: i.current,
                      })
                    : null,
                ),
            n
              .filter((e) => !e.hidden)
              .map((t, n) =>
                f().createElement($s, {
                  key: `${n}-${t.key}`,
                  filter: t,
                  controller: e,
                  readOnly: r || t.readOnly,
                  focusOnWipInputRef: i.current,
                }),
              ),
            r ? null : f().createElement(Hs, { controller: e, ref: i }),
          );
        }),
        qs = (e) => ({
          comboboxWrapper: (0, Vt.css)({
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: e.spacing(1),
            rowGap: e.spacing(0.5),
            minHeight: e.spacing(4),
            backgroundColor: e.components.input.background,
            border: `1px solid ${e.colors.border.strong}`,
            borderRadius: e.shape.radius.default,
            paddingInline: e.spacing(1),
            paddingBlock: e.spacing(0.5),
            flexGrow: 1,
          }),
          comboboxFocusOutline: (0, Vt.css)({
            "&:focus-within": {
              outline: "2px dotted transparent",
              outlineOffset: "2px",
              boxShadow: `0 0 0 2px ${e.colors.background.canvas}, 0 0 0px 4px ${e.colors.primary.main}`,
              transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
              transitionDuration: "0.2s",
              transitionProperty: "outline, outline-offset, box-shadow",
              zIndex: 2,
            },
          }),
          filterIcon: (0, Vt.css)({ color: e.colors.text.secondary, alignSelf: "center" }),
        }),
        Gs = Object.fromEntries(Object.entries(s.scopeFilterOperatorMap).map(([e, t]) => [t, e]));
      function Qs(e) {
        return new Set(["equals", "not-equals", "one-of", "not-one-of"]).has(e);
      }
      function Ks(e) {
        return new Set(["regex-match", "regex-not-match"]).has(e);
      }
      function Ys(e, t, n) {
        var r, a;
        if (!n) return;
        const i = e.get(n.key);
        i &&
        (function (e, t) {
          const n = s.scopeFilterOperatorMap[e];
          if (!Qs(n) || !Qs(t)) return !1;
          return Zs(n, t);
        })(i.operator, n.operator)
          ? (function (e, t) {
              var n, r, a, i;
              const o = null != (n = t.values) ? n : [t.value];
              for (const t of o)
                (null == (r = e.values) ? void 0 : r.includes(t)) ||
                  null == (a = e.values) ||
                  a.push(t);
              if (1 === (null == (i = e.values) ? void 0 : i.length)) return;
              "equals" === t.operator && e.operator === Gs.equals
                ? (e.operator = Gs["one-of"])
                : "not-equals" === t.operator &&
                  e.operator === Gs["not-equals"] &&
                  (e.operator = Gs["not-one-of"]);
            })(i, n)
          : i &&
              (function (e, t) {
                const n = s.scopeFilterOperatorMap[e];
                if (!Ks(n) || !Ks(t)) return !1;
                return Zs(n, t);
              })(i.operator, n.operator)
            ? ((i.value += `|${n.value}`), (i.values = [i.value]))
            : i
              ? t.push({
                  key: n.key,
                  operator: Gs[n.operator],
                  value: n.value,
                  values: null != (a = n.values) ? a : [n.value],
                  origin: "scope",
                })
              : e.set(n.key, {
                  key: n.key,
                  operator: Gs[n.operator],
                  value: n.value,
                  values: null != (r = n.values) ? r : [n.value],
                  origin: "scope",
                });
      }
      function Zs(e, t) {
        return !(
          (e.includes("not") && !t.includes("not")) ||
          (!e.includes("not") && t.includes("not"))
        );
      }
      class Xs {
        constructor(e) {
          this.model = e;
        }
        useState() {
          const e = this.model.useState();
          return {
            filters: e.filters,
            originFilters: e.originFilters,
            readOnly: e.readOnly,
            allowCustomValue: e.allowCustomValue,
            supportsMultiValueOperators: e.supportsMultiValueOperators,
            onAddCustomValue: e.onAddCustomValue,
            wip: e._wip,
          };
        }
        async getKeys(e) {
          return this.model._getKeys(e);
        }
        async getValuesFor(e) {
          return this.model._getValuesFor(e);
        }
        getOperators() {
          return this.model._getOperators();
        }
        updateFilter(e, t) {
          this.model._updateFilter(e, t);
        }
        updateToMatchAll(e) {
          this.model.updateToMatchAll(e);
        }
        removeFilter(e) {
          this.model._removeFilter(e);
        }
        removeLastFilter() {
          this.model._removeLastFilter();
        }
        handleComboboxBackspace(e) {
          this.model._handleComboboxBackspace(e);
        }
        addWip() {
          this.model._addWip();
        }
        restoreOriginalFilter(e) {
          this.model.restoreOriginalFilter(e);
        }
        startProfile(e) {
          const t = ne(this.model);
          null == t || t.startProfile(e);
        }
        startInteraction(e) {
          const t = kn(this.model);
          null == t || t.startInteraction(e);
        }
        stopInteraction() {
          const e = kn(this.model);
          null == e || e.stopInteraction();
        }
      }
      const Js = [
        { value: "=", description: "Equals" },
        { value: "!=", description: "Not equal" },
        { value: "=|", description: "One of. Use to filter on multiple values.", isMulti: !0 },
        { value: "!=|", description: "Not one of. Use to exclude multiple values.", isMulti: !0 },
        { value: "=~", description: "Matches regex", isRegex: !0 },
        { value: "!~", description: "Does not match regex", isRegex: !0 },
        { value: "<", description: "Less than" },
        { value: "<=", description: "Less than or equal to" },
        { value: ">", description: "Greater than" },
        { value: ">=", description: "Greater than or equal to" },
      ];
      class el extends P {
        constructor(e) {
          var t, n, r, a, i;
          (super({
            type: "adhoc",
            name: null != (t = e.name) ? t : "Filters",
            filters: [],
            datasource: null,
            applyMode: "auto",
            filterExpression:
              null != (a = e.filterExpression)
                ? a
                : tl(e.expressionBuilder, [
                    ...(null != (n = e.originFilters) ? n : []),
                    ...(null != (r = e.filters) ? r : []),
                  ]),
            ...e,
          }),
            (this._scopedVars = { __sceneObject: Sn(this) }),
            (this._dataSourceSrv = (0, l.getDataSourceSrv)()),
            (this._originalValues = new Map()),
            (this._prevScopes = []),
            (this._variableDependency = new Pl(this, {
              dependsOnScopes: !0,
              onReferencedVariableValueChanged: () => this._updateScopesFilters(),
            })),
            (this._urlSync = new kr(this)),
            (this._debouncedVerifyApplicability = (0, V.debounce)(this._verifyApplicability, 100)),
            (this._activationHandler = () => (
              this._debouncedVerifyApplicability(),
              () => {
                var e;
                null == (e = this.state.originFilters) ||
                  e.forEach((e) => {
                    e.restorable && this.restoreOriginalFilter(e);
                  });
              }
            )),
            "auto" === this.state.applyMode &&
              (function (e) {
                if ((e.addActivationHandler(() => (gr.add(e), () => gr.delete(e))), sr)) return;
                const t = (0, l.getTemplateSrv)();
                (null == t ? void 0 : t.getAdhocFilters) &&
                  ((sr = t.getAdhocFilters),
                  (t.getAdhocFilters = function (e) {
                    var n;
                    if (0 === gr.size) return sr.call(t, e);
                    const r = (0, l.getDataSourceSrv)().getInstanceSettings(e);
                    if (!r) return [];
                    for (const e of gr.values())
                      if ((null == (n = e.state.datasource) ? void 0 : n.uid) === r.uid)
                        return e.state.filters;
                    return [];
                  }.bind(t)));
              })(this),
            null == (i = this.state.originFilters) ||
              i.forEach((e) => {
                var t;
                this._originalValues.set(`${e.key}-${e.origin}`, {
                  operator: e.operator,
                  value: null != (t = e.values) ? t : [e.value],
                });
              }),
            this.addActivationHandler(this._activationHandler));
        }
        _updateScopesFilters() {
          var e, t;
          const n = ru.getScopes(this);
          if (!n || !n.length)
            return void this.setState({
              originFilters:
                null == (e = this.state.originFilters)
                  ? void 0
                  : e.filter((e) => "scope" !== e.origin),
            });
          const r = (function (e) {
            const t = new Map(),
              n = [],
              r = e.flatMap((e) => e.spec.filters);
            for (const e of r) Ys(t, n, e);
            return [...t.values(), ...n];
          })(n);
          if (!r.length) return;
          let a = r;
          const i = [],
            o = [];
          if (
            (a.forEach((e) => {
              var t;
              this._originalValues.set(`${e.key}-${e.origin}`, {
                value: null != (t = e.values) ? t : [e.value],
                operator: e.operator,
              });
            }),
            null == (t = this.state.originFilters) ||
              t.forEach((e) => {
                "scope" === e.origin ? i.push(e) : o.push(e);
              }),
            this._prevScopes.length)
          )
            return (
              this.setState({ originFilters: [...a, ...o] }),
              (this._prevScopes = n),
              void this._debouncedVerifyApplicability()
            );
          const s = i.filter((e) => e.restorable),
            l = s.map((e) => e.key),
            u = r.map((e) => e.key);
          ((a = [...s.filter((e) => u.includes(e.key)), ...r.filter((e) => !l.includes(e.key))]),
            this.setState({ originFilters: [...a, ...o] }),
            (this._prevScopes = n),
            this._debouncedVerifyApplicability());
        }
        setState(e) {
          var t, n;
          let r = !1;
          if (
            ((e.filters && e.filters !== this.state.filters) ||
              (e.originFilters && e.originFilters !== this.state.originFilters)) &&
            !e.filterExpression
          ) {
            const a = null != (t = e.filters) ? t : this.state.filters,
              i = null != (n = e.originFilters) ? n : this.state.originFilters;
            ((e.filterExpression = tl(this.state.expressionBuilder, [
              ...(null != i ? i : []),
              ...a,
            ])),
              (r = e.filterExpression !== this.state.filterExpression));
          }
          (super.setState(e), r && this.publishEvent(new Oe(this), !0));
        }
        updateFilters(e, t) {
          var n;
          let r,
            a = !1;
          (e &&
            e !== this.state.filters &&
            ((r = tl(this.state.expressionBuilder, [
              ...(null != (n = this.state.originFilters) ? n : []),
              ...e,
            ])),
            (a = r !== this.state.filterExpression)),
            super.setState({ filters: e, filterExpression: r }),
            ((a && !0 !== (null == t ? void 0 : t.skipPublish)) ||
              (null == t ? void 0 : t.forcePublish)) &&
              this.publishEvent(new Oe(this), !0));
        }
        restoreOriginalFilter(e) {
          const t = { matchAllFilter: !1, restorable: !1 };
          if (e.restorable) {
            const n = this._originalValues.get(`${e.key}-${e.origin}`);
            if (!n) return;
            ((t.value = null == n ? void 0 : n.value[0]),
              (t.values = null == n ? void 0 : n.value),
              (t.valueLabels = null == n ? void 0 : n.value),
              (t.operator = null == n ? void 0 : n.operator),
              (t.nonApplicable = null == n ? void 0 : n.nonApplicable));
            const r = ne(this);
            (null == r || r.startProfile("filter_restored"), this._updateFilter(e, t));
          }
        }
        getValue() {
          return this.state.filterExpression;
        }
        _updateFilter(e, t) {
          var n;
          const { originFilters: r, filters: a, _wip: i } = this.state;
          if (e.origin) {
            const a = this._originalValues.get(`${e.key}-${e.origin}`),
              i = t.values || (t.value ? [t.value] : void 0);
            (i && !(0, V.isEqual)(i, null == a ? void 0 : a.value)) ||
            (t.operator && t.operator !== (null == a ? void 0 : a.operator))
              ? (t.restorable = !0)
              : i && (0, V.isEqual)(i, null == a ? void 0 : a.value) && (t.restorable = !1);
            const o =
              null != (n = null == r ? void 0 : r.map((n) => (n === e ? { ...n, ...t } : n)))
                ? n
                : [];
            return void this.setState({ originFilters: o });
          }
          if (e === i)
            return void ("value" in t && "" !== t.value
              ? (this.setState({ filters: [...a, { ...i, ...t }], _wip: void 0 }),
                this._debouncedVerifyApplicability())
              : this.setState({ _wip: { ...e, ...t } }));
          const o = this.state.filters.map((n) => (n === e ? { ...n, ...t } : n));
          this.setState({ filters: o });
        }
        updateToMatchAll(e) {
          this._updateFilter(e, {
            operator: "=~",
            value: ".*",
            values: [".*"],
            valueLabels: ["All"],
            matchAllFilter: !0,
            nonApplicable: !1,
            restorable: !0,
          });
        }
        _removeFilter(e) {
          if (e === this.state._wip) return void this.setState({ _wip: void 0 });
          const t = ne(this);
          (null == t || t.startProfile(me),
            this.setState({ filters: this.state.filters.filter((t) => t !== e) }),
            this._debouncedVerifyApplicability());
        }
        _removeLastFilter() {
          const e = this.state.filters.at(-1);
          e && this._removeFilter(e);
        }
        _handleComboboxBackspace(e) {
          var t;
          if (this.state.filters.length) {
            let t = this.state.filters.length - 1;
            (e !== this.state._wip && (t = -1),
              this.setState({
                filters: this.state.filters.reduce(
                  (n, r, a) =>
                    a !== t || r.readOnly
                      ? r === e
                        ? n
                        : [...n, r]
                      : [...n, { ...r, forceEdit: !0 }],
                  [],
                ),
              }));
          } else if (null == (t = this.state.originFilters) ? void 0 : t.length) {
            let t = this.state.originFilters.length - 1;
            (e !== this.state._wip && (t = -1),
              this.setState({
                originFilters: this.state.originFilters.reduce(
                  (n, r, a) =>
                    a !== t || r.readOnly
                      ? r === e
                        ? n
                        : [...n, r]
                      : [...n, { ...r, forceEdit: !0 }],
                  [],
                ),
              }));
          }
        }
        async _verifyApplicability() {
          var e, t, n;
          const r = [...this.state.filters, ...(null != (e = this.state.originFilters) ? e : [])],
            a = await this._dataSourceSrv.get(this.state.datasource, this._scopedVars);
          if (!a || !a.getDrilldownsApplicability) return;
          if (!r) return;
          const i = ru.getTimeRange(this).state.value,
            o = this.state.useQueriesAsFilterForOptions ? wl(this) : void 0,
            s = await a.getDrilldownsApplicability({
              filters: r,
              queries: o,
              timeRange: i,
              scopes: ru.getScopes(this),
              ...gn(this),
            }),
            l = new Map();
          s.forEach((e) => {
            l.set(`${e.key}${e.origin ? `-${e.origin}` : ""}`, e);
          });
          const u = {
            filters: [...this.state.filters],
            originFilters: [...(null != (t = this.state.originFilters) ? t : [])],
          };
          (u.filters.forEach((e) => {
            const t = l.get(e.key);
            t && ((e.nonApplicable = !t.applicable), (e.nonApplicableReason = t.reason));
          }),
            null == (n = u.originFilters) ||
              n.forEach((e) => {
                const t = l.get(`${e.key}-${e.origin}`);
                if (t) {
                  e.matchAllFilter ||
                    ((e.nonApplicable = !t.applicable), (e.nonApplicableReason = t.reason));
                  const n = this._originalValues.get(`${e.key}-${e.origin}`);
                  n &&
                    ((n.nonApplicable = !t.applicable),
                    (n.nonApplicableReason = null == t ? void 0 : t.reason));
                }
              }),
            this.setState(u));
        }
        async _getKeys(e) {
          var t, n, r, a, i;
          const o = await (null == (n = (t = this.state).getTagKeysProvider)
            ? void 0
            : n.call(t, this, e));
          if (o && o.replace) return Rl(o.values).map(rl);
          if (this.state.defaultKeys) return this.state.defaultKeys.map(rl);
          const s = await this._dataSourceSrv.get(this.state.datasource, this._scopedVars);
          if (!s || !s.getTagKeys) return [];
          const l =
              null !=
              (a =
                null == (r = this.state.originFilters) ? void 0 : r.filter((e) => !e.nonApplicable))
                ? a
                : [],
            u = this.state.filters
              .filter((t) => t.key !== e && !t.nonApplicable)
              .concat(null != (i = this.state.baseFilters) ? i : [])
              .concat(l),
            c = ru.getTimeRange(this).state.value,
            d = this.state.useQueriesAsFilterForOptions ? wl(this) : void 0,
            p = await s.getTagKeys({
              filters: u,
              queries: d,
              timeRange: c,
              scopes: ru.getScopes(this),
              ...gn(this),
            });
          kl(p) && this.setState({ error: p.error.message });
          let h = Rl(p);
          o && (h = h.concat(Rl(o.values)));
          const f = this.state.tagKeyRegexFilter;
          return (f && (h = h.filter((e) => e.text.match(f))), h.map(rl));
        }
        async _getValuesFor(e) {
          var t, n, r, a;
          const i = await (null == (n = (t = this.state).getTagValuesProvider)
            ? void 0
            : n.call(t, this, e));
          if (i && i.replace) return Rl(i.values).map(rl);
          const o = await this._dataSourceSrv.get(this.state.datasource, this._scopedVars);
          if (!o || !o.getTagValues) return [];
          const s =
              null !=
              (a =
                null == (r = this.state.originFilters) ? void 0 : r.filter((t) => t.key !== e.key))
                ? a
                : [],
            l = this.state.filters.filter((t) => t.key !== e.key).concat(s),
            u = ru.getTimeRange(this).state.value,
            c = this.state.useQueriesAsFilterForOptions ? wl(this) : void 0;
          let d = ru.getScopes(this);
          "scope" === e.origin &&
            (d =
              null == d
                ? void 0
                : d.map((t) => ({
                    ...t,
                    spec: { ...t.spec, filters: t.spec.filters.filter((t) => t.key !== e.key) },
                  })));
          const p = await o.getTagValues({
            key: e.key,
            filters: l,
            timeRange: u,
            queries: c,
            scopes: d,
            ...gn(this),
          });
          kl(p) && this.setState({ error: p.error.message });
          let h = Rl(p);
          return (i && (h = h.concat(Rl(i.values))), h.map(rl));
        }
        _addWip() {
          this.setState({ _wip: { key: "", value: "", operator: "=", condition: "" } });
        }
        _getOperators() {
          const { supportsMultiValueOperators: e, allowCustomValue: t = !0 } = this.state;
          return Js.filter(({ isMulti: n, isRegex: r }) => !(!e && n) && !(!t && r)).map(
            ({ value: e, description: t }) => ({ label: e, value: e, description: t }),
          );
        }
      }
      function tl(e, t) {
        var n;
        return (null != e ? e : gl)(
          null != (n = null == t ? void 0 : t.filter((e) => ol(e))) ? n : [],
        );
      }
      el.Component = function ({ model: e }) {
        const { filters: t, readOnly: n, addFilterButtonText: r } = e.useState(),
          a = (0, Ct.useStyles2)(nl),
          i = (0, p.useMemo)(() => ("combobox" === e.state.layout ? new Xs(e) : void 0), [e]);
        if (i) return f().createElement(Us, { controller: i });
        return f().createElement(
          "div",
          { className: a.wrapper },
          t
            .filter((e) => !e.hidden)
            .map((t, n) =>
              f().createElement(
                f().Fragment,
                { key: n },
                f().createElement(_r, { filter: t, model: e }),
              ),
            ),
          !n && f().createElement(Or, { model: e, key: "'builder", addFilterButtonText: r }),
        );
      };
      const nl = (e) => ({
        wrapper: (0, Vt.css)({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          columnGap: e.spacing(2),
          rowGap: e.spacing(1),
        }),
      });
      function rl(e) {
        const { text: t, value: n } = e,
          r = { label: String(t), value: String(null != n ? n : t) };
        return ("group" in e && (r.group = e.group), "meta" in e && (r.meta = e.meta), r);
      }
      function al(e) {
        return "=~" === e.operator && ".*" === e.value;
      }
      function il(e) {
        return "" !== e.key && "" !== e.operator && "" !== e.value;
      }
      function ol(e) {
        return !e.nonApplicable;
      }
      function sl(e) {
        const t = Js.find((t) => t.value === e);
        return !!t && Boolean(t.isMulti);
      }
      class ll {
        constructor(e) {
          this._variableDependency = e;
        }
        findAndSubscribeToDrilldowns(e) {
          const t = (function (e) {
              var t;
              for (const n of gr.values())
                if (Jl(n, null == (t = n.state.datasource) ? void 0 : t.uid) === e) return n;
            })(e),
            n = (function (e) {
              var t;
              for (const n of _t.values())
                if (Jl(n, null == (t = n.state.datasource) ? void 0 : t.uid) === e) return n;
            })(e);
          let r = !1;
          (this._adhocFiltersVar !== t && ((this._adhocFiltersVar = t), (r = !0)),
            this._groupByVar !== n && ((this._groupByVar = n), (r = !0)),
            r && this._updateExplicitDrilldownVariableDependencies());
        }
        _updateExplicitDrilldownVariableDependencies() {
          const e = [];
          (this._adhocFiltersVar && e.push(this._adhocFiltersVar.state.name),
            this._groupByVar && e.push(this._groupByVar.state.name),
            this._variableDependency.setVariableNames(e));
        }
        get adHocFiltersVar() {
          return this._adhocFiltersVar;
        }
        get groupByVar() {
          return this._groupByVar;
        }
        getFilters() {
          var e;
          return this._adhocFiltersVar
            ? [
                ...(null != (e = this._adhocFiltersVar.state.originFilters) ? e : []),
                ...this._adhocFiltersVar.state.filters,
              ].filter((e) => il(e) && ol(e))
            : void 0;
        }
        getGroupByKeys() {
          return this._groupByVar ? this._groupByVar.getApplicableKeys() : void 0;
        }
        cleanup() {
          ((this._adhocFiltersVar = void 0), (this._groupByVar = void 0));
        }
      }
      let ul = 100;
      function cl() {
        return "SQR" + ul++;
      }
      class dl extends P {
        constructor(e) {
          (super(e),
            (this._dataLayersMerger = new cr()),
            (this._variableValueRecorder = new bt()),
            (this._results = new m.ReplaySubject(1)),
            (this._scopedVars = { __sceneObject: Sn(this) }),
            (this._isInView = !0),
            (this._bypassIsInView = !1),
            (this._queryNotExecutedWhenOutOfView = !1),
            (this._variableDependency = new Pl(this, {
              statePaths: ["queries", "datasource", "minInterval"],
              onVariableUpdateCompleted: this.onVariableUpdatesCompleted.bind(this),
              onAnyVariableChanged: this.onAnyVariableChanged.bind(this),
              dependsOnScopes: !0,
            })),
            (this._drilldownDependenciesManager = new ll(this._variableDependency)),
            (this.onDataReceived = (e) => {
              const t = (0, s.preProcessPanelData)(e, this.state.data);
              this._resultAnnotations = e.annotations;
              const n = this._combineDataLayers(t);
              let r = this.state._hasFetchedData;
              (r || t.state === ae.Loading || (r = !0),
                this.setState({ data: n, _hasFetchedData: r }),
                this._results.next({ origin: this, data: n }));
            }),
            this.addActivationHandler(() => this._onActivate()));
        }
        getResultsStream() {
          return this._results;
        }
        _onActivate() {
          if (this.isQueryModeAuto()) {
            const e = ru.getTimeRange(this),
              t = this.getClosestExtraQueryProviders();
            for (const e of t)
              this._subs.add(
                e.subscribeToState((t, n) => {
                  e.shouldRerun(n, t, this.state.queries) && this.runQueries();
                }),
              );
            (this.subscribeToTimeRangeChanges(e),
              this.shouldRunQueriesOnActivate() && this.runQueries());
          }
          return (this._dataLayersSub || this._handleDataLayers(), () => this._onDeactivate());
        }
        _handleDataLayers() {
          const e = ru.getDataLayers(this);
          0 !== e.length &&
            (this._dataLayersSub = this._dataLayersMerger
              .getMergedStream(e)
              .subscribe(this._onLayersReceived.bind(this)));
        }
        _onLayersReceived(e) {
          var t, n, r, a, i;
          const o = ru.getTimeRange(this),
            { dataLayerFilter: l } = this.state;
          let u,
            c = [],
            d = [];
          for (const r of e)
            for (let e of r.data.series)
              ((null == (t = e.meta) ? void 0 : t.dataTopic) === s.DataTopic.Annotations &&
                (c = c.concat(e)),
                (null == (n = e.meta) ? void 0 : n.dataTopic) === s.DataTopic.AlertStates &&
                  (d = d.concat(e)));
          if (
            (null == l ? void 0 : l.panelId) &&
            (c.length > 0 &&
              (c = (function (e, t) {
                var n;
                if (!Array.isArray(e) || 0 === e.length) return e;
                const r = Array.from({ length: e.length }, () => new Set());
                let a = 0;
                for (const i of e) {
                  for (let e = 0; e < i.length; e++) {
                    if (r[a].has(e)) continue;
                    let o = !0;
                    const s = i.fields.find((e) => "panelId" === e.name),
                      l = i.fields.find((e) => "source" === e.name);
                    if (l) {
                      s &&
                        "dashboard" === l.values[e].type &&
                        (o = [t.panelId, St].includes(s.values[e]));
                      const r = l.values[e].filter;
                      if (r) {
                        const e = [...(null != (n = r.ids) ? n : []), St].includes(t.panelId);
                        r.exclude ? e && (o = !1) : e || (o = !1);
                      }
                    }
                    o && r[a].add(e);
                  }
                  a++;
                }
                const i = [];
                a = 0;
                for (const t of e) {
                  const e = r[a].size,
                    n = [];
                  for (const e of t.fields) {
                    const i = [];
                    for (let n = 0; n < t.length; n++) r[a].has(n) && i.push(e.values[n]);
                    n.push({ ...e, values: i });
                  }
                  (i.push({ ...t, fields: n, length: e }), a++);
                }
                return i;
              })(c, l)),
            d.length > 0)
          )
            for (const e of d) {
              const t = new s.DataFrameView(e);
              for (const e of t)
                if (e.panelId === l.panelId) {
                  u = e;
                  break;
                }
            }
          if (
            hl(c) &&
            hl(this._layerAnnotations) &&
            (0, V.isEqual)(u, null == (r = this.state.data) ? void 0 : r.alertState)
          )
            return;
          this._layerAnnotations = c;
          const p = this.state.data ? this.state.data : { ...oe, timeRange: o.state.value };
          this.setState({
            data: {
              ...p,
              annotations: [...(null != (a = this._resultAnnotations) ? a : []), ...c],
              alertState: null != u ? u : null == (i = this.state.data) ? void 0 : i.alertState,
            },
          });
        }
        onVariableUpdatesCompleted() {
          this.isQueryModeAuto() && this.runQueries();
        }
        onAnyVariableChanged(e) {
          this._drilldownDependenciesManager.adHocFiltersVar !== e &&
            this._drilldownDependenciesManager.groupByVar !== e &&
            this.isQueryModeAuto() &&
            (e instanceof el && this._isRelevantAutoVariable(e) && this.runQueries(),
            e instanceof En && this._isRelevantAutoVariable(e) && this.runQueries());
        }
        _isRelevantAutoVariable(e) {
          var t, n;
          const r = null != (t = this.state.datasource) ? t : pl(this.state.queries);
          return (
            "auto" === e.state.applyMode &&
            (null == r ? void 0 : r.uid) === (null == (n = e.state.datasource) ? void 0 : n.uid)
          );
        }
        shouldRunQueriesOnActivate() {
          return this._variableValueRecorder.hasDependenciesChanged(this)
            ? (G(), !0)
            : !this.state.data || !!this._isDataTimeRangeStale(this.state.data);
        }
        _isDataTimeRangeStale(e) {
          const t = ru.getTimeRange(this).state.value,
            n = e.timeRange;
          return (t.from.unix() !== n.from.unix() || t.to.unix() !== n.to.unix()) && (G(), !0);
        }
        _onDeactivate() {
          var e;
          (this._querySub && (this._querySub.unsubscribe(), (this._querySub = void 0)),
            this._dataLayersSub &&
              (this._dataLayersSub.unsubscribe(), (this._dataLayersSub = void 0)),
            null == (e = this._timeSub) || e.unsubscribe(),
            (this._timeSub = void 0),
            (this._timeSubRange = void 0),
            this._drilldownDependenciesManager.cleanup());
        }
        setContainerWidth(e) {
          !this._containerWidth && e > 0
            ? ((this._containerWidth = e),
              this.state.maxDataPointsFromWidth &&
                !this.state.maxDataPoints &&
                setTimeout(() => {
                  this.isActive && !this.state._hasFetchedData && this.runQueries();
                }, 0))
            : e > 0 && (this._containerWidth = e);
        }
        isDataReadyToDisplay() {
          return Boolean(this.state._hasFetchedData);
        }
        subscribeToTimeRangeChanges(e) {
          this._timeSubRange !== e &&
            (this._timeSub && this._timeSub.unsubscribe(),
            (this._timeSubRange = e),
            (this._timeSub = e.subscribeToState(() => {
              this.runWithTimeRange(e);
            })));
        }
        runQueries() {
          const e = ru.getTimeRange(this);
          (this.isQueryModeAuto() && this.subscribeToTimeRangeChanges(e), this.runWithTimeRange(e));
        }
        getMaxDataPoints() {
          var e;
          return this.state.maxDataPoints
            ? this.state.maxDataPoints
            : this.state.maxDataPointsFromWidth && null != (e = this._containerWidth)
              ? e
              : 500;
        }
        cancelQuery() {
          var e;
          (null == (e = this._querySub) || e.unsubscribe(),
            this._dataLayersSub &&
              (this._dataLayersSub.unsubscribe(), (this._dataLayersSub = void 0)),
            this.setState({ data: { ...this.state.data, state: ae.Done } }));
        }
        async runWithTimeRange(e) {
          var t, n, r;
          if (
            !this.state.maxDataPoints &&
            this.state.maxDataPointsFromWidth &&
            !this._containerWidth
          )
            return;
          if (this.isQueryModeAuto() && !this._isInView && !this._bypassIsInView)
            return void (this._queryNotExecutedWhenOutOfView = !0);
          if (
            ((this._queryNotExecutedWhenOutOfView = !1),
            this._dataLayersSub || this._handleDataLayers(),
            null == (t = this._querySub) || t.unsubscribe(),
            this._variableDependency.hasDependencyInLoadingState())
          )
            return (
              G(),
              void this.setState({
                data: { ...(null != (n = this.state.data) ? n : oe), state: ae.Loading },
              })
            );
          this._variableValueRecorder.recordCurrentDependencyValuesForSceneObject(this);
          const { queries: a } = this.state;
          if (null == a ? void 0 : a.length)
            try {
              const t = null != (r = this.state.datasource) ? r : pl(a),
                n = await vt(t, this._scopedVars);
              this._drilldownDependenciesManager.findAndSubscribeToDrilldowns(n.uid);
              const i = (0, l.getRunRequest)(),
                { primary: o, secondaries: s, processors: u } = this.prepareRequests(e, n);
              G(0, 0, this.state.key);
              let c = i(n, o);
              if (s.length > 0) {
                const e = s.map((e) => i(n, e)),
                  t = (
                    (e) => (t) =>
                      t.pipe(
                        (0, m.mergeMap)(([t, ...n]) => {
                          const r = n.flatMap((n) => {
                            var r, a;
                            return null !=
                              (a = null == (r = e.get(n.request.requestId)) ? void 0 : r(t, n))
                              ? a
                              : (0, m.of)(n);
                          });
                          return (0, m.forkJoin)([(0, m.of)(t), ...r]);
                        }),
                        (0, m.map)(([e, ...t]) => {
                          var n;
                          return {
                            ...e,
                            series: [...e.series, ...t.flatMap((e) => e.series)],
                            annotations: [
                              ...(null != (n = e.annotations) ? n : []),
                              ...t.flatMap((e) => {
                                var t;
                                return null != (t = e.annotations) ? t : [];
                              }),
                            ],
                          };
                        }),
                      )
                  )(u);
                c = (0, m.forkJoin)([c, ...e]).pipe(t);
              }
              const d = mr(this);
              ((c = c.pipe(
                mt(
                  {
                    type: "SceneQueryRunner/runQueries",
                    request: o,
                    origin: this,
                    cancel: () => this.cancelQuery(),
                  },
                  d,
                ),
              )),
                (this._querySub = c.subscribe(this.onDataReceived)));
            } catch (e) {
              (console.error("PanelQueryRunner Error", e),
                this.onDataReceived({
                  ...oe,
                  ...this.state.data,
                  state: ae.Error,
                  errors: [(0, l.toDataQueryError)(e)],
                }));
            }
          else this._setNoDataState();
        }
        clone(e) {
          var t;
          const n = super.clone(e);
          return (
            this._resultAnnotations &&
              (n._resultAnnotations = this._resultAnnotations.map((e) => ({ ...e }))),
            this._layerAnnotations &&
              (n._layerAnnotations = this._layerAnnotations.map((e) => ({ ...e }))),
            (n._variableValueRecorder =
              this._variableValueRecorder.cloneAndRecordCurrentValuesForSceneObject(this)),
            (n._containerWidth = this._containerWidth),
            n._results.next({ origin: this, data: null != (t = this.state.data) ? t : oe }),
            n
          );
        }
        prepareRequests(e, t) {
          var n;
          const { minInterval: r, queries: a } = this.state;
          let i = {
            app: "scenes",
            requestId: cl(),
            timezone: e.getTimeZone(),
            range: e.state.value,
            interval: "1s",
            intervalMs: 1e3,
            targets: (0, V.cloneDeep)(a),
            maxDataPoints: this.getMaxDataPoints(),
            scopedVars: this._scopedVars,
            startTime: Date.now(),
            liveStreaming: this.state.liveStreaming,
            rangeRaw: { from: e.state.from, to: e.state.to },
            cacheTimeout: this.state.cacheTimeout,
            queryCachingTTL: this.state.queryCachingTTL,
            scopes: ru.getScopes(this),
            ...xt(this),
          };
          const o = this._drilldownDependenciesManager.getFilters(),
            u = this._drilldownDependenciesManager.getGroupByKeys();
          (o && (i.filters = o),
            u && (i.groupByKeys = u),
            (i.targets = i.targets.map((e) => {
              var n;
              return (
                (e.datasource &&
                  (e.datasource.uid === t.uid ||
                    (null == (n = t.meta) ? void 0 : n.mixed) ||
                    !l.isExpressionReference ||
                    (0, l.isExpressionReference)(e.datasource))) ||
                  (e.datasource = t.getRef()),
                e
              );
            })));
          const c = r ? Jl(this, r) : t.interval,
            d = s.rangeUtil.calculateInterval(e.state.value, i.maxDataPoints, c);
          ((i.scopedVars = Object.assign({}, i.scopedVars, {
            __interval: { text: d.interval, value: d.interval },
            __interval_ms: { text: d.intervalMs.toString(), value: d.intervalMs },
          })),
            (i.interval = d.interval),
            (i.intervalMs = d.intervalMs));
          const p = e.state.value;
          let h = [],
            f = new Map();
          for (const e of null != (n = this.getClosestExtraQueryProviders()) ? n : [])
            for (const { req: t, processor: n } of e.getExtraQueries(i)) {
              const e = cl();
              (h.push({ ...t, requestId: e }), f.set(e, null != n ? n : wt));
            }
          return ((i.range = p), { primary: i, secondaries: h, processors: f });
        }
        _combineDataLayers(e) {
          return (
            this._layerAnnotations &&
              this._layerAnnotations.length > 0 &&
              (e.annotations = (e.annotations || []).concat(this._layerAnnotations)),
            this.state.data &&
              this.state.data.alertState &&
              (e.alertState = this.state.data.alertState),
            e
          );
        }
        _setNoDataState() {
          this.state.data !== oe && this.setState({ data: oe });
        }
        getClosestExtraQueryProviders() {
          const e = new Map();
          return this.parent
            ? (le(
                this.parent,
                (t) => (
                  yt(t) && !e.has(t.constructor) && e.set(t.constructor, t),
                  t.forEachChild((t) => {
                    yt(t) && !e.has(t.constructor) && e.set(t.constructor, t);
                  }),
                  null
                ),
              ),
              Array.from(e.values()))
            : [];
        }
        isQueryModeAuto() {
          var e;
          return "auto" === (null != (e = this.state.runQueriesMode) ? e : "auto");
        }
        isInViewChanged(e) {
          (G(0, 0, this.state.key),
            (this._isInView = e),
            e && this._queryNotExecutedWhenOutOfView && this.runQueries());
        }
        bypassIsInViewChanged(e) {
          (G(0, 0, this.state.key),
            (this._bypassIsInView = e),
            e && this._queryNotExecutedWhenOutOfView && this.runQueries());
        }
      }
      function pl(e) {
        var t, n;
        return null !=
          (n = null == (t = e.find((e) => null !== e.datasource)) ? void 0 : t.datasource)
          ? n
          : void 0;
      }
      function hl(e) {
        if (!e) return !0;
        for (let t = 0; t < e.length; t++) if (e[t].length > 0) return !1;
        return !0;
      }
      function fl(e, t) {
        return e === t || (0, V.isEqual)(e, t);
      }
      function ml(e) {
        try {
          return JSON.stringify(
            e,
            (() => {
              const e = new WeakSet();
              return (t, n) => {
                if ("object" == typeof n && null !== n) {
                  if (e.has(n)) return;
                  e.add(n);
                }
                return n;
              };
            })(),
          );
        } catch (e) {
          console.error(e);
        }
        return "";
      }
      function gl(e) {
        return e
          .map((e) =>
            (function (e) {
              var t, n;
              let r = "",
                a = e.operator;
              "=|" === a
                ? ((a = "=~"), (r = null == (t = e.values) ? void 0 : t.map(bl).join("|")))
                : "!=|" === a
                  ? ((a = "!~"), (r = null == (n = e.values) ? void 0 : n.map(bl).join("|")))
                  : (r = "=~" === a || "!~" === a ? bl(e.value) : vl(e.value));
              return `${e.key}${a}"${r}"`;
            })(e),
          )
          .join(",");
      }
      function vl(e) {
        return e.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"');
      }
      function bl(e) {
        return vl(e.replace(yl, "\\$&"));
      }
      const yl = /[*+?()|\\.\[\]{}^$]/g;
      function wl(e) {
        var t;
        const n = ru.findAllObjects(e.getRoot(), (e) => e instanceof dl),
          r = ru.interpolate(e, null == (t = e.state.datasource) ? void 0 : t.uid),
          a = (function (e) {
            const t = {};
            for (const n of e)
              n.state.key && (n.state.key in t || (t[n.state.key] = []), t[n.state.key].push(n));
            return Object.values(t).flatMap((e) => {
              const t = e.filter((e) => e.isActive);
              return 0 === t.length && 1 === e.length ? e : t;
            });
          })(n).filter((t) => {
            var n;
            return ru.interpolate(e, null == (n = t.state.datasource) ? void 0 : n.uid) === r;
          });
        if (0 === a.length) return [];
        const i = [];
        return (
          a.forEach((t) => {
            i.push(
              ...t.state.queries.filter((t) => {
                if (!t.datasource || !t.datasource.uid) return !0;
                return ru.interpolate(e, t.datasource.uid) === r;
              }),
            );
          }),
          i
        );
      }
      function Sl(e) {
        return null == e ? "" : /\|/g[Symbol.replace](e, "__gfp__");
      }
      function xl(e) {
        return null == e ? "" : /,/g[Symbol.replace](e, "__gfc__");
      }
      function _l(e) {
        return (function (e) {
          return null == e ? "" : /#/g[Symbol.replace](e, "__gfh__");
        })(Sl(e));
      }
      function Cl(e) {
        return null == e
          ? ""
          : ((e = /__gfp__/g[Symbol.replace](e, "|")),
            (e = /__gfc__/g[Symbol.replace](e, ",")),
            (e = /__gfh__/g[Symbol.replace](e, "#")));
      }
      function Ol(e, t) {
        return t && e !== t ? [e, t].map(xl).join(",") : xl(e);
      }
      function Rl(e) {
        return Array.isArray(e) ? e : e.data;
      }
      function kl(e) {
        return !Array.isArray(e) && Boolean(e.error);
      }
      function El(e) {
        const t = [],
          n = new Map();
        for (const r of e) {
          const e = r.group;
          if (e) {
            let a = n.get(e);
            (a || ((a = []), n.set(e, a), t.push({ label: e, options: a })), a.push(r));
          } else t.push(r);
        }
        return t;
      }
      function Tl(e) {
        return {
          disabledPill: (0, Vt.css)({
            background: e.colors.action.selected,
            color: e.colors.text.disabled,
            border: 0,
            "&:hover": { background: e.colors.action.selected },
          }),
          strikethrough: (0, Vt.css)({ textDecoration: "line-through" }),
        };
      }
      class Dl extends P {
        constructor(e) {
          (super({ type: "constant", value: "", name: "", ...e, skipUrlSync: !0 }),
            (this._variableDependency = new Pl(this, { statePaths: ["value"] })),
            (this._prevValue = ""));
        }
        validateAndUpdate() {
          const e = this.getValue();
          return (
            this._prevValue !== e && ((this._prevValue = e), this.publishEvent(new Oe(this), !0)),
            (0, m.of)({})
          );
        }
        getValue() {
          return "string" == typeof this.state.value
            ? ru.interpolate(this, this.state.value)
            : this.state.value;
        }
      }
      class Pl {
        constructor(e, t) {
          ((this._sceneObject = e),
            (this._options = t),
            (this._dependencies = new Set()),
            (this._isWaitingForVariables = !1),
            (this.scanCount = 0),
            (this._statePaths = t.statePaths),
            this._options.handleTimeMacros && this.handleTimeMacros());
        }
        hasDependencyOn(e) {
          return this.getNames().has(e);
        }
        variableUpdateCompleted(e, t) {
          var n, r, a, i;
          const o = this.getNames(),
            l = (o.has(e.state.name) || o.has(s.DataLinkBuiltInVars.includeVars)) && t;
          (G(0, 0, e.state.name, this._isWaitingForVariables),
            null == (r = (n = this._options).onAnyVariableChanged) || r.call(n, e),
            this._options.onVariableUpdateCompleted &&
              (this._isWaitingForVariables || l) &&
              this._options.onVariableUpdateCompleted(),
            l &&
              (null == (i = (a = this._options).onReferencedVariableValueChanged) || i.call(a, e),
              this._options.onReferencedVariableValueChanged ||
                this._options.onVariableUpdateCompleted ||
                this._sceneObject.forceRender()));
        }
        hasDependencyInLoadingState() {
          return (
            (this._isWaitingForVariables = ru.hasVariableDependencyInLoadingState(
              this._sceneObject,
            )),
            this._isWaitingForVariables
          );
        }
        getNames() {
          const e = this._state,
            t = (this._state = this._sceneObject.state);
          return (
            (!e ||
              (t !== e &&
                (!this._statePaths || this._statePaths.some((n) => "*" === n || t[n] !== e[n])))) &&
              this.scanStateForDependencies(t),
            this._dependencies
          );
        }
        setVariableNames(e) {
          ((this._options.variableNames = e), this.scanStateForDependencies(this._state));
        }
        setPaths(e) {
          this._statePaths = e;
        }
        scanStateForDependencies(e) {
          if ((this._dependencies.clear(), this.scanCount++, this._options.variableNames))
            for (const e of this._options.variableNames) this._dependencies.add(e);
          if ((this._options.dependsOnScopes && this._dependencies.add(qe), this._statePaths))
            for (const t of this._statePaths) {
              if ("*" === t) {
                this.extractVariablesFrom(e);
                break;
              }
              {
                const n = e[t];
                n && this.extractVariablesFrom(n);
              }
            }
        }
        extractVariablesFrom(e) {
          He.lastIndex = 0;
          const t = ("string" != typeof e ? ml(e) : e).matchAll(He);
          if (t)
            for (const e of t) {
              const [, t, n, , r] = e,
                a = t || n || r;
              this._dependencies.add(a);
            }
        }
        handleTimeMacros() {
          this._sceneObject.addActivationHandler(() => {
            const e = ru.getTimeRange(this._sceneObject).subscribeToState((e, t) => {
              const n = this.getNames(),
                r = n.has("__from"),
                a = n.has("__to"),
                i = n.has("__timezone");
              if (e.value !== t.value)
                if (r) {
                  const t = new Dl({ name: "__from", value: e.from });
                  this.variableUpdateCompleted(t, !0);
                } else if (a) {
                  const t = new Dl({ name: "__to", value: e.to });
                  this.variableUpdateCompleted(t, !0);
                }
              if (e.timeZone !== t.timeZone && i) {
                const t = new Dl({ name: "__timezone", value: e.timeZone });
                this.variableUpdateCompleted(t, !0);
              }
            });
            return () => e.unsubscribe();
          });
        }
      }
      const Al = (e) => Boolean(e.metricFindQuery) && !Boolean(e.variables),
        Il = (e) => {
          if (!e.variables) return !1;
          if (e.variables.getType() !== s.VariableSupportType.Standard) return !1;
          const t = e.variables;
          return "toDataQuery" in t && Boolean(t.toDataQuery);
        },
        Vl = (e) => {
          if (!e.variables) return !1;
          if (e.variables.getType() !== s.VariableSupportType.Custom) return !1;
          const t = e.variables;
          return "query" in t && "editor" in t && Boolean(t.query) && Boolean(t.editor);
        },
        Ml = (e) => !!e.variables && e.variables.getType() === s.VariableSupportType.Datasource;
      class Ll {
        constructor(e, t = (0, l.getRunRequest)()) {
          ((this.datasource = e), (this._runRequest = t));
        }
        getTarget(e) {
          if (Il(this.datasource))
            return this.datasource.variables.toDataQuery(
              (function (e) {
                var t;
                const n = null != (t = e.state.query) ? t : "";
                if ("string" == typeof n) return { query: n, refId: `variable-${e.state.name}` };
                if (null == n.refId) return { ...n, refId: `variable-${e.state.name}` };
                return e.state.query;
              })(e),
            );
          throw new Error("Couldn't create a target with supplied arguments.");
        }
        runRequest(e, t) {
          return Il(this.datasource)
            ? this.datasource.variables.query
              ? this._runRequest(
                  this.datasource,
                  t,
                  this.datasource.variables.query.bind(this.datasource.variables),
                )
              : this._runRequest(this.datasource, t)
            : Bl();
        }
      }
      class Fl {
        constructor(e) {
          this.datasource = e;
        }
        getTarget(e) {
          if (Al(this.datasource)) return e.state.query;
          throw new Error("Couldn't create a target with supplied arguments.");
        }
        runRequest({ variable: e, searchFilter: t }, n) {
          return Al(this.datasource)
            ? (0, m.from)(
                this.datasource.metricFindQuery(e.state.query, {
                  ...n,
                  variable: { name: e.state.name, type: e.state.type },
                  searchFilter: t,
                }),
              ).pipe(
                (0, m.mergeMap)((e) => {
                  if (!e || !e.length) return Bl();
                  const t = e;
                  return (0, m.of)({ series: t, state: s.LoadingState.Done, timeRange: n.range });
                }),
              )
            : Bl();
        }
      }
      class jl {
        constructor(e, t = (0, l.getRunRequest)()) {
          ((this.datasource = e), (this._runRequest = t));
        }
        getTarget(e) {
          if (Vl(this.datasource)) return e.state.query;
          throw new Error("Couldn't create a target with supplied arguments.");
        }
        runRequest(e, t) {
          return Vl(this.datasource)
            ? this.datasource.variables.query
              ? this._runRequest(
                  this.datasource,
                  t,
                  this.datasource.variables.query.bind(this.datasource.variables),
                )
              : this._runRequest(this.datasource, t)
            : Bl();
        }
      }
      class Nl {
        constructor(e, t = (0, l.getRunRequest)()) {
          ((this.datasource = e), (this._runRequest = t));
        }
        getTarget(e) {
          var t;
          if (Ml(this.datasource))
            return "string" == typeof e.state.query
              ? e.state.query
              : {
                  ...e.state.query,
                  refId: null != (t = e.state.query.refId) ? t : "variable-query",
                };
          throw new Error("Couldn't create a target with supplied arguments.");
        }
        runRequest(e, t) {
          return Ml(this.datasource) ? this._runRequest(this.datasource, t) : Bl();
        }
      }
      function Bl() {
        return (0, m.of)({
          state: s.LoadingState.Done,
          series: [],
          timeRange: (0, s.getDefaultTimeRange)(),
        });
      }
      let zl = function (e) {
        if (Il(e)) return new Ll(e, (0, l.getRunRequest)());
        if (Al(e)) return new Fl(e);
        if (Vl(e)) return new jl(e);
        if (Ml(e)) return new Nl(e);
        throw new Error(`Couldn't create a query runner for datasource ${e.type}`);
      };
      const $l = (e, t) => {
          const n = [];
          let r = null;
          t.lastIndex = 0;
          do {
            ((r = t.exec(e)), r && n.push(r));
          } while (t.global && r && "" !== r[0] && void 0 !== r[0]);
          return n;
        },
        Wl = (e, t) => {
          if (t === s.VariableSort.disabled) return e;
          switch (t) {
            case s.VariableSort.alphabeticalAsc:
              e = (0, V.sortBy)(e, "label");
              break;
            case s.VariableSort.alphabeticalDesc:
              e = (0, V.sortBy)(e, "label").reverse();
              break;
            case s.VariableSort.numericalAsc:
              e = (0, V.sortBy)(e, Hl);
              break;
            case s.VariableSort.numericalDesc:
              e = (e = (0, V.sortBy)(e, Hl)).reverse();
              break;
            case s.VariableSort.alphabeticalCaseInsensitiveAsc:
              e = (0, V.sortBy)(e, (e) => (0, V.toLower)(e.label));
              break;
            case s.VariableSort.alphabeticalCaseInsensitiveDesc:
              e = (e = (0, V.sortBy)(e, (e) => (0, V.toLower)(e.label))).reverse();
              break;
            case s.VariableSort.naturalAsc || 7:
              e = ql(e);
              break;
            case s.VariableSort.naturalDesc || 8:
              e = (e = ql(e)).reverse();
          }
          return e;
        };
      function Hl(e) {
        if (!e.label) return -1;
        const t = e.label.match(/.*?(\d+).*/);
        return !t || t.length < 2 ? -1 : parseInt(t[1], 10);
      }
      const Ul = new Intl.Collator(void 0, { sensitivity: "accent", numeric: !0 });
      function ql(e) {
        return e.slice().sort((e, t) => Ul.compare(e.label, t.label));
      }
      function Gl() {
        return (e) =>
          e.pipe(
            (0, m.map)((e) => {
              const t = e.series;
              if (!t || !t.length) return [];
              if (
                (function (e) {
                  if (!e) return !1;
                  if (!e.length) return !0;
                  const t = e[0];
                  if ((0, s.isDataFrame)(t)) return !1;
                  for (const e in t) {
                    if (!t.hasOwnProperty(e)) continue;
                    if (null !== t[e] && "string" != typeof t[e] && "number" != typeof t[e])
                      continue;
                    const n = e.toLowerCase();
                    if ("text" === n || "value" === n) return !0;
                  }
                  return !1;
                })(t)
              )
                return t;
              if (0 === t[0].fields.length) return [];
              const n = (0, s.getProcessedDataFrames)(t),
                r = [];
              let a = -1,
                i = -1,
                o = -1,
                l = -1;
              for (const e of n)
                for (let n = 0; n < e.fields.length; n++) {
                  const r = e.fields[n],
                    u = (0, s.getFieldDisplayName)(r, e, t).toLowerCase();
                  (r.type === s.FieldType.string && -1 === o && (o = n),
                    "text" === u && r.type === s.FieldType.string && -1 === i && (i = n),
                    "value" === u && r.type === s.FieldType.string && -1 === a && (a = n),
                    "expandable" !== u ||
                      (r.type !== s.FieldType.boolean && r.type !== s.FieldType.number) ||
                      -1 !== l ||
                      (l = n));
                }
              if (-1 === o)
                throw new Error("Couldn't find any field of type string in the results.");
              for (const e of t)
                for (let t = 0; t < e.length; t++) {
                  const n = -1 !== l ? e.fields[l].values.get(t) : void 0,
                    s = e.fields[o].values.get(t),
                    u = -1 !== i ? e.fields[i].values.get(t) : "",
                    c = -1 !== a ? e.fields[a].values.get(t) : "";
                  -1 !== a || -1 !== i
                    ? -1 !== a || -1 === i
                      ? -1 === a || -1 !== i
                        ? r.push({ text: u, value: c, expandable: n })
                        : r.push({ text: c, value: c, expandable: n })
                      : r.push({ text: u, value: u, expandable: n })
                    : r.push({ text: s, value: s, expandable: n });
                }
              return r;
            }),
          );
      }
      class Ql extends Je {
        constructor(e) {
          (super({
            type: "query",
            name: "",
            value: "",
            text: "",
            options: [],
            datasource: null,
            regex: "",
            query: "",
            refresh: s.VariableRefresh.onDashboardLoad,
            sort: s.VariableSort.disabled,
            ...e,
          }),
            (this._variableDependency = new Pl(this, {
              statePaths: ["regex", "query", "datasource"],
            })),
            (this.onSearchChange = (e) => {
              ml(this.state.query).indexOf(Ue) > -1 && this._updateOptionsBasedOnSearchFilter(e);
            }),
            (this._updateOptionsBasedOnSearchFilter = (0, V.debounce)(async (e) => {
              const t = await (0, m.lastValueFrom)(this.getValueOptions({ searchFilter: e }));
              this.setState({ options: t, loading: !1 });
            }, 400)));
        }
        getValueOptions(e) {
          return this.state.query
            ? (this.setState({ loading: !0, error: null }),
              (0, m.from)(vt(this.state.datasource, { __sceneObject: Sn(this) })).pipe(
                (0, m.mergeMap)((t) => {
                  const n = zl(t),
                    r = n.getTarget(this),
                    a = this.getRequest(r, e.searchFilter);
                  return n.runRequest({ variable: this, searchFilter: e.searchFilter }, a).pipe(
                    mt({ type: "QueryVariable/getValueOptions", request: a, origin: this }),
                    (0, m.filter)(
                      (e) => e.state === s.LoadingState.Done || e.state === s.LoadingState.Error,
                    ),
                    (0, m.take)(1),
                    (0, m.mergeMap)((e) =>
                      e.state === s.LoadingState.Error
                        ? (0, m.throwError)(() => e.error)
                        : (0, m.of)(e),
                    ),
                    Gl(),
                    (0, m.mergeMap)((e) => {
                      let t = "";
                      this.state.regex &&
                        (t = ru.interpolate(this, this.state.regex, void 0, "regex"));
                      let n = (function (e, t, n) {
                        var r, a, i, o, l, u, c, d, p, h;
                        let f,
                          m = [];
                        e && (f = (0, s.stringToJsRegex)(e));
                        for (let e = 0; e < n.length; e++) {
                          const t = n[e];
                          let s = null != (a = null != (r = t.text) ? r : t.value) ? a : "",
                            g = null != (o = null != (i = t.value) ? i : t.text) ? o : "";
                          if (
                            ((0, V.isNumber)(g) && (g = g.toString()),
                            (0, V.isNumber)(s) && (s = s.toString()),
                            f)
                          ) {
                            const e = $l(g, f);
                            if (!e.length) continue;
                            const t = e.find((e) => e.groups && e.groups.value),
                              n = e.find((e) => e.groups && e.groups.text),
                              r = e.find((e) => e.length > 1),
                              a = e.length > 1 && r;
                            if (t || n)
                              ((g =
                                null !=
                                (c = null == (l = null == t ? void 0 : t.groups) ? void 0 : l.value)
                                  ? c
                                  : null == (u = null == n ? void 0 : n.groups)
                                    ? void 0
                                    : u.text),
                                (s =
                                  null !=
                                  (h =
                                    null == (d = null == n ? void 0 : n.groups) ? void 0 : d.text)
                                    ? h
                                    : null == (p = null == t ? void 0 : t.groups)
                                      ? void 0
                                      : p.value));
                            else {
                              if (a) {
                                for (let t = 0; t < e.length; t++) {
                                  const n = e[t];
                                  m.push({ label: n[1], value: n[1] });
                                }
                                continue;
                              }
                              r && ((s = r[1]), (g = r[1]));
                            }
                          }
                          m.push({ label: s, value: g });
                        }
                        return ((m = (0, V.uniqBy)(m, "value")), Wl(m, t));
                      })(t, this.state.sort, e);
                      if (this.state.staticOptions) {
                        const e = this.state.staticOptions;
                        ((n = n.filter((t) => !e.find((e) => e.value === t.value))),
                          "after" === this.state.staticOptionsOrder
                            ? n.push(...e)
                            : "sorted" === this.state.staticOptionsOrder
                              ? (n = Wl(n.concat(e), this.state.sort))
                              : n.unshift(...e));
                      }
                      return (0, m.of)(n);
                    }),
                    (0, m.catchError)((e) =>
                      e.cancelled ? (0, m.of)([]) : (0, m.throwError)(() => e),
                    ),
                  );
                }),
              ))
            : (0, m.of)([]);
        }
        getRequest(e, t) {
          const n = { __sceneObject: Sn(this) };
          t && (n.__searchFilter = { value: t, text: t });
          const r = ru.getTimeRange(this).state.value;
          return {
            app: s.CoreApp.Dashboard,
            requestId: x(),
            timezone: "",
            range: r,
            interval: "",
            intervalMs: 0,
            targets: [e],
            scopedVars: n,
            startTime: Date.now(),
          };
        }
      }
      Ql.Component = ({ model: e }) => f().createElement(hn, { model: e });
      var Kl = n(2245);
      class Yl extends P {
        constructor(e) {
          (super({
            skipUrlSync: !0,
            loading: !0,
            scopes: [],
            ...e,
            type: "system",
            name: qe,
            hide: Kl.zL.hideVariable,
          }),
            (this._renderBeforeActivation = !0),
            (this.UNSAFE_renderAsHidden = !0));
        }
        getValue() {
          var e;
          const t = null != (e = this.state.scopes) ? e : [];
          return new Zl(t.map((e) => e.metadata.name));
        }
        getScopes() {
          return this.state.scopes;
        }
        setContext(e) {
          if (!e) return;
          this._context = e;
          const t = e.state;
          null != this.state.enable && e.setEnabled(this.state.enable);
          const n = e.stateObservable.subscribe((e) => {
            this.updateStateFromContext(e);
          });
          return () => {
            (n.unsubscribe(), null != this.state.enable && e.setEnabled(t.enabled));
          };
        }
        updateStateFromContext(e) {
          const t = 0 !== e.value.length && e.loading,
            n = this.state.scopes.map((e) => e.metadata.name),
            r = e.value.map((e) => e.metadata.name),
            a = !(0, V.isEqual)(n, r);
          if (t || (!a && 0 !== r.length)) this.setState({ loading: t });
          else {
            const n = ne(this);
            (null == n || n.startProfile("scopes_changed"),
              this.setState({ scopes: e.value, loading: t }),
              this.publishEvent(new Oe(this), !0));
          }
        }
      }
      Yl.Component = function ({ model: e }) {
        const t = (0, p.useContext)(l.ScopesContext);
        return ((0, p.useEffect)(() => e.setContext(t), [t, e]), null);
      };
      class Zl {
        constructor(e) {
          this._value = e;
        }
        formatter(e) {
          return e === re.$m.QueryParam
            ? this._value.map((e) => `scope=${encodeURIComponent(e)}`).join("&")
            : this._value.join(", ");
        }
      }
      function Xl(e) {
        var t;
        return null != (t = le(e, (e) => e.state.$data)) ? t : Se;
      }
      function Jl(e, t, n, r, a) {
        return "" === t || null == t ? "" : ot(e, t, n, r, a);
      }
      function eu(e, t, n, r) {
        if (t(e)) return e;
        let a = null;
        return (
          e.forEachChild((e) => {
            if (e === n) return;
            let r = eu(e, t);
            return r ? ((a = r), !1) : void 0;
          }),
          a || (r && e.parent ? eu(e.parent, t, e, !0) : null)
        );
      }
      function tu(e, t) {
        return eu(e, t, void 0, !0);
      }
      function nu(e, t) {
        const n = [];
        return (
          e.forEachChild((e) => {
            (t(e) && n.push(e), n.push(...nu(e, t)));
          }),
          n
        );
      }
      const ru = {
        getVariables: function (e) {
          var t;
          return null != (t = le(e, (e) => e.state.$variables)) ? t : _e;
        },
        getData: Xl,
        getTimeRange: Ce,
        getLayout: function (e) {
          const t = le(e, (e) =>
            (function (e) {
              return "isDraggable" in e;
            })(e)
              ? e
              : void 0,
          );
          return t || null;
        },
        getDataLayers: function (e, t = !1) {
          let n = e,
            r = [];
          for (; n; ) {
            const e = n.state.$data;
            if (e) {
              if (
                (ct(e)
                  ? (r = r.concat(e))
                  : e.state.$data && ct(e.state.$data) && (r = r.concat(e.state.$data)),
                t && r.length > 0)
              )
                break;
              n = n.parent;
            } else n = n.parent;
          }
          return r;
        },
        interpolate: Jl,
        lookupVariable: q,
        hasVariableDependencyInLoadingState: function (e) {
          if (!e.variableDependency) return !1;
          for (const t of e.variableDependency.getNames()) {
            if (e instanceof Ql && e.state.name === t) {
              console.warn("Query variable is referencing itself");
              continue;
            }
            const n = q(t, e);
            if (!n) continue;
            if (n.parent.isVariableLoadingOrWaitingToUpdate(n)) return !0;
          }
          return !1;
        },
        findByKey: function (e, t) {
          const n = tu(e, (e) => e.state.key === t);
          if (!n) throw new Error("Unable to find scene with key " + t);
          return n;
        },
        findByKeyAndType: function (e, t, n) {
          const r = tu(e, (e) => e.state.key === t);
          if (!r) throw new Error("Unable to find scene with key " + t);
          if (!(r instanceof n))
            throw new Error(`Found scene object with key ${t} does not match type ${n.name}`);
          return r;
        },
        findObject: tu,
        findAllObjects: nu,
        getAncestor: function (e, t) {
          let n = e;
          for (; n; ) {
            if (n instanceof t) return n;
            n = n.parent;
          }
          if (!n) throw new Error("Unable to find parent of type " + t.name);
          return n;
        },
        getQueryController: ne,
        findDescendents: function (e, t) {
          function n(e) {
            return e instanceof t;
          }
          return nu(e, n).filter(n);
        },
        getScopes: function (e) {
          const t = q(qe, e);
          if (t instanceof Yl) return t.state.scopes;
        },
      };
      class au extends P {
        constructor(e) {
          super({ type: "system", value: "", text: "", name: "", ...e, skipUrlSync: !0 });
        }
        getValue() {
          return this.state.value;
        }
        getValueText() {
          return this.state.text.toString();
        }
        isAncestorLoading() {
          var e, t;
          const n = null == (t = null == (e = this.parent) ? void 0 : e.parent) ? void 0 : t.parent;
          if (!n)
            throw new Error(
              "LocalValueVariable requires a parent SceneVariableSet that has an ancestor SceneVariableSet",
            );
          const r = ru.getVariables(n),
            a = ru.lookupVariable(this.state.name, n);
          return !(!r || !a) && r.isVariableLoadingOrWaitingToUpdate(a);
        }
      }
      const iu = "$";
      function ou(e) {
        let t,
          n = `panel-${e.getLegacyPanelId()}`,
          r = e;
        for (; r; ) {
          const e = r.state.$variables;
          (e &&
            e.state.variables.forEach((e) => {
              e.state.name !== t &&
                e instanceof au &&
                ((n = `${e.state.value}${iu}${n}`), (t = e.state.name));
            }),
            (r = r.parent));
        }
        return n;
      }
      class su extends P {
        constructor() {
          (super(...arguments),
            (this._runningEffect = null),
            (this._variableDependency = new Pl(this, {
              variableNames: [this.state.variableName],
              onReferencedVariableValueChanged: this._onVariableChanged.bind(this),
            })));
        }
        _onVariableChanged(e) {
          const t = this.state.onChange;
          this._runningEffect && (this._runningEffect(), (this._runningEffect = null));
          const n = t(e, this);
          n && (this._runningEffect = n);
        }
      }
      function lu(e, t, ...n) {
        let r = !1;
        "undefined" != typeof window &&
          (r = "true" === localStorage.getItem("grafana.debug.sceneProfiling"));
      }
      class uu {
        constructor(e) {
          ((this._config = e), (this._subscriptions = []));
        }
        attachToScene(e) {
          this._sceneObject = e;
          const t = e.subscribeToState((e, t) => {
            this._config.watchStateKey
              ? e[this._config.watchStateKey] !== t[this._config.watchStateKey] &&
                this._attachProfilersToPanels()
              : this._attachProfilersToPanels();
          });
          (this._subscriptions.push(t), this._attachProfilersToPanels());
        }
        attachProfilerToPanel(e) {
          var t;
          if (null == (t = e.state.$behaviors) ? void 0 : t.find((e) => e instanceof ur)) return;
          const n = new ur();
          e.setState({ $behaviors: [...(e.state.$behaviors || []), n] });
        }
        _attachProfilersToPanels() {
          if (!this._sceneObject) return;
          ru.findAllObjects(this._sceneObject, (e) => e instanceof fr).forEach((e) => {
            this.attachProfilerToPanel(e);
          });
        }
        cleanup() {
          (this._subscriptions.forEach((e) => e.unsubscribe()),
            (this._subscriptions = []),
            (this._sceneObject = void 0));
        }
      }
      var cu,
        du,
        pu,
        hu,
        fu,
        mu = (e) => {
          throw TypeError(e);
        },
        gu = (e, t, n) => t.has(e) || mu("Cannot " + n),
        vu = (e, t, n) => (gu(e, t, "read from private field"), n ? n.call(e) : t.get(e)),
        bu = (e, t, n) =>
          t.has(e)
            ? mu("Cannot add the same private member more than once")
            : t instanceof WeakSet
              ? t.add(e)
              : t.set(e, n),
        yu = (e, t, n, r) => (gu(e, t, "write to private field"), t.set(e, n), n);
      class wu {
        constructor() {
          (bu(this, cu, !1),
            bu(this, du, null),
            bu(this, pu, null),
            bu(this, hu, 0),
            bu(this, fu, null),
            (this.measureFrames = () => {
              if (!vu(this, cu)) return;
              const e = performance.now(),
                t = e - vu(this, hu);
              if (t > 50) {
                const n = { duration: t, timestamp: e, method: "manual" };
                if (
                  (vu(this, du) && vu(this, du).call(this, n),
                  "undefined" != typeof performance && performance.mark && performance.measure)
                ) {
                  const n = `long-frame-manual-${e.toFixed(0)}`,
                    r = `${n}-start`,
                    a = `${n}-end`,
                    i = `Long Frame (Manual): ${t.toFixed(1)}ms`;
                  try {
                    (performance.mark(r, { startTime: e - t }),
                      performance.mark(a, { startTime: e }),
                      performance.measure(i, r, a));
                  } catch (e) {
                    performance.mark(i);
                  }
                }
                lu();
              }
              (yu(this, hu, e),
                vu(this, cu) && yu(this, pu, requestAnimationFrame(this.measureFrames)));
            }));
        }
        isLoAFAvailable() {
          return (
            "undefined" != typeof PerformanceObserver &&
            PerformanceObserver.supportedEntryTypes &&
            PerformanceObserver.supportedEntryTypes.includes("long-animation-frame")
          );
        }
        start(e) {
          (vu(this, cu) && (lu(), this.stop()),
            yu(this, du, e),
            yu(this, cu, !0),
            this.isLoAFAvailable() ? this.startLoAFTracking() : this.startManualFrameTracking(),
            lu(0, this.isLoAFAvailable()));
        }
        stop() {
          vu(this, cu) &&
            (yu(this, cu, !1),
            yu(this, du, null),
            this.stopLoAFTracking(),
            this.stopManualFrameTracking());
        }
        isTracking() {
          return vu(this, cu);
        }
        startLoAFTracking() {
          if (!this.isLoAFAvailable()) return (lu(), void this.startManualFrameTracking());
          try {
            (yu(
              this,
              fu,
              new PerformanceObserver((e) => {
                for (const t of e.getEntries()) {
                  const e = { duration: t.duration, timestamp: t.startTime, method: "loaf" };
                  if (
                    (vu(this, du) && vu(this, du).call(this, e),
                    "undefined" != typeof performance && performance.mark && performance.measure)
                  ) {
                    const e = `long-frame-${t.startTime.toFixed(0)}`,
                      n = `${e}-start`,
                      r = `${e}-end`,
                      a = `Long Frame (LoAF): ${t.duration.toFixed(1)}ms`;
                    try {
                      (performance.mark(n, { startTime: t.startTime }),
                        performance.mark(r, { startTime: t.startTime + t.duration }),
                        performance.measure(a, n, r));
                    } catch (e) {
                      performance.mark(a);
                    }
                  }
                  lu(0, (t.duration, t.startTime));
                }
              }),
            ),
              vu(this, fu).observe({ type: "long-animation-frame", buffered: !1 }));
          } catch (e) {
            (lu(0, 0), this.startManualFrameTracking());
          }
        }
        stopLoAFTracking() {
          vu(this, fu) && (vu(this, fu).disconnect(), yu(this, fu, null), lu());
        }
        startManualFrameTracking() {
          (yu(this, hu, performance.now()),
            yu(
              this,
              pu,
              requestAnimationFrame(() => this.measureFrames()),
            ));
        }
        stopManualFrameTracking() {
          vu(this, pu) && (cancelAnimationFrame(vu(this, pu)), yu(this, pu, null), lu());
        }
      }
      ((cu = new WeakMap()),
        (du = new WeakMap()),
        (pu = new WeakMap()),
        (hu = new WeakMap()),
        (fu = new WeakMap()));
      var Su,
        xu,
        _u,
        Cu,
        Ou,
        Ru,
        ku,
        Eu,
        Tu,
        Du,
        Pu,
        Au = (e) => {
          throw TypeError(e);
        },
        Iu = (e, t, n) => t.has(e) || Au("Cannot " + n),
        Vu = (e, t, n) => (Iu(e, t, "read from private field"), n ? n.call(e) : t.get(e)),
        Mu = (e, t, n) =>
          t.has(e)
            ? Au("Cannot add the same private member more than once")
            : t instanceof WeakSet
              ? t.add(e)
              : t.set(e, n),
        Lu = (e, t, n, r) => (Iu(e, t, "write to private field"), t.set(e, n), n);
      class Fu {
        constructor(e) {
          (Mu(this, Su, null),
            Mu(this, xu, null),
            Mu(this, _u, null),
            Mu(this, Cu, null),
            (this.metadata = {}),
            Mu(this, Ou),
            Mu(this, Ru, []),
            Mu(this, ku),
            Mu(this, Eu, 0),
            Mu(this, Tu, 0),
            Mu(this, Du, null),
            Mu(this, Pu, null),
            (this.measureTrailingFrames = (e, t, n) => {
              const r = performance.now(),
                a = r - t;
              if ((Vu(this, Ru).push(a), r - e < 2e3))
                Vu(this, Su) &&
                  Lu(
                    this,
                    Cu,
                    requestAnimationFrame(() => this.measureTrailingFrames(e, r, n)),
                  );
              else {
                const t = (function (e) {
                    for (let t = e.length - 1; t >= 0; t--) if (e[t] > 30) return e.slice(0, t + 1);
                    return [e[0]];
                  })(Vu(this, Ru)),
                  r = t.reduce((e, t) => e + t, 0);
                (lu(0, 0, Vu(this, Su)), Lu(this, Ru, []));
                const a = e - n;
                (t.length > 0 ? (r.toFixed(1), t.length) : (r.toFixed(1), t.length),
                  Vu(this, Eu) > 0
                    ? (Vu(this, Tu).toFixed(1), Vu(this, Eu))
                    : (Vu(this, Tu).toFixed(1), Vu(this, Eu)));
                (lu(0, (a + r).toFixed(1)), Vu(this, ku).stop(), Lu(this, Cu, null));
                const i = n + a + r;
                if (!Vu(this, Su)) return;
                const o = ju(n, i);
                if (Vu(this, Su)) {
                  const e = {
                    operationId: Vu(this, Ou) || dt("dashboard-fallback"),
                    interactionType: Vu(this, Su).origin,
                    timestamp: i,
                    duration: a + r,
                    networkDuration: o,
                    longFramesCount: Vu(this, Eu),
                    longFramesTotalTime: Vu(this, Tu),
                    metadata: this.metadata,
                  };
                  (ft().notifyDashboardInteractionComplete(e),
                    Lu(this, Su, null),
                    Lu(this, Cu, null));
                }
              }
            }),
            Lu(this, ku, new wu()),
            this.setupVisibilityChangeHandler(),
            Lu(this, xu, null),
            e && (this._panelProfilingManager = new uu(e)));
        }
        setMetadata(e) {
          this.metadata = { ...e };
        }
        setQueryController(e) {
          this.queryController = e;
        }
        attachPanelProfiling(e) {
          var t;
          null == (t = this._panelProfilingManager) || t.attachToScene(e);
        }
        attachProfilerToPanel(e) {
          var t;
          (lu(0, 0, e.state.key),
            null == (t = this._panelProfilingManager) || t.attachProfilerToPanel(e));
        }
        setInteractionCompleteHandler(e) {
          Lu(this, Pu, null != e ? e : null);
        }
        setupVisibilityChangeHandler() {
          Vu(this, Du) ||
            (Lu(this, Du, () => {
              document.hidden && Vu(this, Su) && (lu(), this.cancelProfile());
            }),
            "undefined" != typeof document &&
              document.addEventListener("visibilitychange", Vu(this, Du)));
        }
        cleanup() {
          var e;
          (Vu(this, Du) &&
            "undefined" != typeof document &&
            (document.removeEventListener("visibilitychange", Vu(this, Du)), Lu(this, Du, null)),
            Vu(this, ku).stop(),
            this.cancelProfile(),
            null == (e = this._panelProfilingManager) || e.cleanup());
        }
        startProfile(e) {
          document.hidden
            ? lu(0, 0)
            : Vu(this, Su)
              ? Vu(this, Cu)
                ? (this.cancelProfile(), this._startNewProfile(e, !0))
                : this.addCrumb(e)
              : this._startNewProfile(e);
        }
        startInteraction(e) {
          (Vu(this, xu) && (lu(0, 0, Vu(this, xu)), Lu(this, xu, null)),
            Lu(this, xu, { interaction: e, startTs: performance.now() }),
            lu(0, 0));
        }
        stopInteraction() {
          if (!Vu(this, xu)) return;
          const e = performance.now(),
            t = e - Vu(this, xu).startTs,
            n = ju(Vu(this, xu).startTs, e);
          (lu(0, (t.toFixed(1), n.toFixed(1))),
            Vu(this, Pu) &&
              Vu(this, Su) &&
              Vu(this, Pu).call(this, {
                origin: Vu(this, xu).interaction,
                duration: t,
                networkDuration: n,
                startTs: Vu(this, xu).startTs,
                endTs: e,
              }),
            performance.mark(`${Vu(this, xu).interaction}_start`, {
              startTime: Vu(this, xu).startTs,
            }),
            performance.mark(`${Vu(this, xu).interaction}_end`, { startTime: e }),
            performance.measure(
              `Interaction_${Vu(this, xu).interaction}`,
              `${Vu(this, xu).interaction}_start`,
              `${Vu(this, xu).interaction}_end`,
            ),
            Lu(this, xu, null));
        }
        getCurrentInteraction() {
          var e, t;
          return null != (t = null == (e = Vu(this, xu)) ? void 0 : e.interaction) ? t : null;
        }
        _startNewProfile(e, t = !1) {
          (lu(),
            Lu(this, Su, { origin: e, crumbs: [] }),
            Lu(this, _u, performance.now()),
            Lu(this, Eu, 0),
            Lu(this, Tu, 0),
            Lu(this, Ou, dt("dashboard")),
            ft().notifyDashboardInteractionStart({
              operationId: Vu(this, Ou),
              interactionType: e,
              timestamp: Vu(this, _u),
              metadata: this.metadata,
            }),
            Vu(this, ku).start((e) => {
              var t, n, r;
              Vu(this, Su) &&
                Vu(this, _u) &&
                (e.timestamp < Vu(this, _u) ||
                  (((t = this),
                  (n = Eu),
                  {
                    set _(e) {
                      Lu(t, n, e);
                    },
                    get _() {
                      return Vu(t, n, r);
                    },
                  })._++,
                  Lu(this, Tu, Vu(this, Tu) + e.duration)));
            }));
        }
        recordProfileTail(e, t) {
          Lu(
            this,
            Cu,
            requestAnimationFrame(() => this.measureTrailingFrames(e, e, t)),
          );
        }
        tryCompletingProfile() {
          var e;
          (lu(0, 0, Vu(this, Su)),
            0 === (null == (e = this.queryController) ? void 0 : e.runningQueriesCount()) &&
              Vu(this, Su) &&
              (lu(), this.recordProfileTail(performance.now(), Vu(this, _u))));
        }
        isTailRecording() {
          return Boolean(Vu(this, Cu));
        }
        cancelTailRecording() {
          Vu(this, Cu) && (cancelAnimationFrame(Vu(this, Cu)), Lu(this, Cu, null), lu());
        }
        cancelProfile() {
          Vu(this, Su) &&
            (lu(0, 0, Vu(this, Su)),
            Lu(this, Su, null),
            Vu(this, Cu) && (cancelAnimationFrame(Vu(this, Cu)), Lu(this, Cu, null)),
            Vu(this, ku).stop(),
            lu(),
            Lu(this, Ru, []),
            Lu(this, Eu, 0),
            Lu(this, Tu, 0));
        }
        addCrumb(e) {
          Vu(this, Su) &&
            (ft().notifyDashboardInteractionMilestone({
              operationId: dt("dashboard-milestone"),
              interactionType: Vu(this, Su).origin,
              timestamp: performance.now(),
              milestone: e,
              metadata: this.metadata,
            }),
            Vu(this, Su).crumbs.push(e));
        }
      }
      function ju(e, t) {
        const n = performance.getEntriesByType("resource");
        performance.clearResourceTimings();
        const r = n.filter(
          (n) => n.startTime >= e && n.startTime <= t && n.responseEnd >= e && n.responseEnd <= t,
        );
        for (const e of r)
          performance.measure("Network entry " + e.name, {
            start: e.startTime,
            end: e.responseEnd,
          });
        return (function (e) {
          if (0 === e.length) return 0;
          e.sort((e, t) => e.startTime - t.startTime);
          let t = 0,
            n = e[0].startTime,
            r = e[0].responseEnd;
          for (let a = 1; a < e.length; a++)
            e[a].startTime <= r
              ? (r = Math.max(r, e[a].responseEnd))
              : ((t += r - n), (n = e[a].startTime), (r = e[a].responseEnd));
          return ((t += r - n), t);
        })(r);
      }
      function Nu(e) {
        if ("string" == typeof e) return e;
        if (e) {
          if (e instanceof Error) return e.message;
          if ((0, l.isFetchError)(e)) {
            if (e.data && e.data.message) return e.data.message;
            if (e.statusText) return e.statusText;
          } else if (e.hasOwnProperty("message")) return e.message;
        }
        return JSON.stringify(e);
      }
      ((Su = new WeakMap()),
        (xu = new WeakMap()),
        (_u = new WeakMap()),
        (Cu = new WeakMap()),
        (Ou = new WeakMap()),
        (Ru = new WeakMap()),
        (ku = new WeakMap()),
        (Eu = new WeakMap()),
        (Tu = new WeakMap()),
        (Du = new WeakMap()),
        (Pu = new WeakMap()));
      class Bu extends P {
        constructor(e, t = []) {
          (super({ isEnabled: !0, ...e }),
            (this._results = new m.ReplaySubject(1)),
            (this.isDataLayer = !0),
            (this._variableValueRecorder = new bt()),
            (this._variableDependency = new Pl(this, {
              onVariableUpdateCompleted: this.onVariableUpdateCompleted.bind(this),
              dependsOnScopes: !0,
            })),
            this._variableDependency.setPaths(t),
            this.addActivationHandler(() => this.onActivate()));
        }
        onActivate() {
          return (
            this.state.isEnabled && this.onEnable(),
            this.shouldRunLayerOnActivate() && this.runLayer(),
            this.subscribeToState((e, t) => {
              (!e.isEnabled &&
                this.querySub &&
                (this.querySub.unsubscribe(),
                (this.querySub = void 0),
                this.onDisable(),
                this._results.next({ origin: this, data: oe }),
                this.setStateHelper({ data: oe })),
                e.isEnabled && !t.isEnabled && (this.onEnable(), this.runLayer()));
            }),
            () => {
              this.onDeactivate();
            }
          );
        }
        onDeactivate() {
          (this.querySub && (this.querySub.unsubscribe(), (this.querySub = void 0)),
            this.onDisable(),
            this._variableValueRecorder.recordCurrentDependencyValuesForSceneObject(this));
        }
        onVariableUpdateCompleted() {
          this.runLayer();
        }
        cancelQuery() {
          this.querySub &&
            (this.querySub.unsubscribe(), (this.querySub = void 0), this.publishResults(oe));
        }
        publishResults(e) {
          this.state.isEnabled &&
            (this._results.next({ origin: this, data: e }), this.setStateHelper({ data: e }));
        }
        getResultsStream() {
          return this._results;
        }
        shouldRunLayerOnActivate() {
          return (
            !!this.state.isEnabled &&
            (this._variableValueRecorder.hasDependenciesChanged(this)
              ? (G(), !0)
              : !this.state.data)
          );
        }
        setStateHelper(e) {
          Ye(this, e);
        }
      }
      function zu(e) {
        return "function" == typeof e;
      }
      function $u(e) {
        return function (t) {
          if (
            (function (e) {
              return zu(null == e ? void 0 : e.lift);
            })(t)
          )
            return t.lift(function (t) {
              try {
                return e(t, this);
              } catch (e) {
                this.error(e);
              }
            });
          throw new TypeError("Unable to lift unknown Observable type");
        };
      }
      var Wu = function (e, t) {
        return (
          (Wu =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
              function (e, t) {
                e.__proto__ = t;
              }) ||
            function (e, t) {
              for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
            }),
          Wu(e, t)
        );
      };
      function Hu(e, t) {
        if ("function" != typeof t && null !== t)
          throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
        function n() {
          this.constructor = e;
        }
        (Wu(e, t),
          (e.prototype = null === t ? Object.create(t) : ((n.prototype = t.prototype), new n())));
      }
      var Uu = function () {
        return (
          (Uu =
            Object.assign ||
            function (e) {
              for (var t, n = 1, r = arguments.length; n < r; n++)
                for (var a in (t = arguments[n]))
                  Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
              return e;
            }),
          Uu.apply(this, arguments)
        );
      };
      function qu(e, t, n, r) {
        return new (n || (n = Promise))(function (a, i) {
          function o(e) {
            try {
              l(r.next(e));
            } catch (e) {
              i(e);
            }
          }
          function s(e) {
            try {
              l(r.throw(e));
            } catch (e) {
              i(e);
            }
          }
          function l(e) {
            var t;
            e.done
              ? a(e.value)
              : ((t = e.value),
                t instanceof n
                  ? t
                  : new n(function (e) {
                      e(t);
                    })).then(o, s);
          }
          l((r = r.apply(e, t || [])).next());
        });
      }
      function Gu(e, t) {
        var n,
          r,
          a,
          i = {
            label: 0,
            sent: function () {
              if (1 & a[0]) throw a[1];
              return a[1];
            },
            trys: [],
            ops: [],
          },
          o = Object.create(("function" == typeof Iterator ? Iterator : Object).prototype);
        return (
          (o.next = s(0)),
          (o.throw = s(1)),
          (o.return = s(2)),
          "function" == typeof Symbol &&
            (o[Symbol.iterator] = function () {
              return this;
            }),
          o
        );
        function s(s) {
          return function (l) {
            return (function (s) {
              if (n) throw new TypeError("Generator is already executing.");
              for (; o && ((o = 0), s[0] && (i = 0)), i; )
                try {
                  if (
                    ((n = 1),
                    r &&
                      (a =
                        2 & s[0]
                          ? r.return
                          : s[0]
                            ? r.throw || ((a = r.return) && a.call(r), 0)
                            : r.next) &&
                      !(a = a.call(r, s[1])).done)
                  )
                    return a;
                  switch (((r = 0), a && (s = [2 & s[0], a.value]), s[0])) {
                    case 0:
                    case 1:
                      a = s;
                      break;
                    case 4:
                      return (i.label++, { value: s[1], done: !1 });
                    case 5:
                      (i.label++, (r = s[1]), (s = [0]));
                      continue;
                    case 7:
                      ((s = i.ops.pop()), i.trys.pop());
                      continue;
                    default:
                      if (
                        !((a = i.trys),
                        (a = a.length > 0 && a[a.length - 1]) || (6 !== s[0] && 2 !== s[0]))
                      ) {
                        i = 0;
                        continue;
                      }
                      if (3 === s[0] && (!a || (s[1] > a[0] && s[1] < a[3]))) {
                        i.label = s[1];
                        break;
                      }
                      if (6 === s[0] && i.label < a[1]) {
                        ((i.label = a[1]), (a = s));
                        break;
                      }
                      if (a && i.label < a[2]) {
                        ((i.label = a[2]), i.ops.push(s));
                        break;
                      }
                      (a[2] && i.ops.pop(), i.trys.pop());
                      continue;
                  }
                  s = t.call(e, i);
                } catch (e) {
                  ((s = [6, e]), (r = 0));
                } finally {
                  n = a = 0;
                }
              if (5 & s[0]) throw s[1];
              return { value: s[0] ? s[1] : void 0, done: !0 };
            })([s, l]);
          };
        }
      }
      Object.create;
      function Qu(e) {
        var t = "function" == typeof Symbol && Symbol.iterator,
          n = t && e[t],
          r = 0;
        if (n) return n.call(e);
        if (e && "number" == typeof e.length)
          return {
            next: function () {
              return (e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e });
            },
          };
        throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }
      function Ku(e, t) {
        var n = "function" == typeof Symbol && e[Symbol.iterator];
        if (!n) return e;
        var r,
          a,
          i = n.call(e),
          o = [];
        try {
          for (; (void 0 === t || t-- > 0) && !(r = i.next()).done; ) o.push(r.value);
        } catch (e) {
          a = { error: e };
        } finally {
          try {
            r && !r.done && (n = i.return) && n.call(i);
          } finally {
            if (a) throw a.error;
          }
        }
        return o;
      }
      function Yu(e, t, n) {
        if (n || 2 === arguments.length)
          for (var r, a = 0, i = t.length; a < i; a++)
            (!r && a in t) || (r || (r = Array.prototype.slice.call(t, 0, a)), (r[a] = t[a]));
        return e.concat(r || Array.prototype.slice.call(t));
      }
      function Zu(e) {
        return this instanceof Zu ? ((this.v = e), this) : new Zu(e);
      }
      function Xu(e, t, n) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var r,
          a = n.apply(e, t || []),
          i = [];
        return (
          (r = Object.create(
            ("function" == typeof AsyncIterator ? AsyncIterator : Object).prototype,
          )),
          o("next"),
          o("throw"),
          o("return", function (e) {
            return function (t) {
              return Promise.resolve(t).then(e, u);
            };
          }),
          (r[Symbol.asyncIterator] = function () {
            return this;
          }),
          r
        );
        function o(e, t) {
          a[e] &&
            ((r[e] = function (t) {
              return new Promise(function (n, r) {
                i.push([e, t, n, r]) > 1 || s(e, t);
              });
            }),
            t && (r[e] = t(r[e])));
        }
        function s(e, t) {
          try {
            (n = a[e](t)).value instanceof Zu
              ? Promise.resolve(n.value.v).then(l, u)
              : c(i[0][2], n);
          } catch (e) {
            c(i[0][3], e);
          }
          var n;
        }
        function l(e) {
          s("next", e);
        }
        function u(e) {
          s("throw", e);
        }
        function c(e, t) {
          (e(t), i.shift(), i.length && s(i[0][0], i[0][1]));
        }
      }
      function Ju(e) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var t,
          n = e[Symbol.asyncIterator];
        return n
          ? n.call(e)
          : ((e = Qu(e)),
            (t = {}),
            r("next"),
            r("throw"),
            r("return"),
            (t[Symbol.asyncIterator] = function () {
              return this;
            }),
            t);
        function r(n) {
          t[n] =
            e[n] &&
            function (t) {
              return new Promise(function (r, a) {
                (function (e, t, n, r) {
                  Promise.resolve(r).then(function (t) {
                    e({ value: t, done: n });
                  }, t);
                })(r, a, (t = e[n](t)).done, t.value);
              });
            };
        }
      }
      Object.create;
      "function" == typeof SuppressedError && SuppressedError;
      var ec,
        tc =
          (((ec = (function (e) {
            return function (t) {
              (e(this),
                (this.message = t
                  ? t.length +
                    " errors occurred during unsubscription:\n" +
                    t
                      .map(function (e, t) {
                        return t + 1 + ") " + e.toString();
                      })
                      .join("\n  ")
                  : ""),
                (this.name = "UnsubscriptionError"),
                (this.errors = t));
            };
          })(function (e) {
            (Error.call(e), (e.stack = new Error().stack));
          })).prototype = Object.create(Error.prototype)),
          (ec.prototype.constructor = ec),
          ec);
      function nc(e, t) {
        if (e) {
          var n = e.indexOf(t);
          0 <= n && e.splice(n, 1);
        }
      }
      var rc = (function () {
        function e(e) {
          ((this.initialTeardown = e),
            (this.closed = !1),
            (this._parentage = null),
            (this._finalizers = null));
        }
        var t;
        return (
          (e.prototype.unsubscribe = function () {
            var e, t, n, r, a;
            if (!this.closed) {
              this.closed = !0;
              var i = this._parentage;
              if (i)
                if (((this._parentage = null), Array.isArray(i)))
                  try {
                    for (var o = Qu(i), s = o.next(); !s.done; s = o.next()) {
                      s.value.remove(this);
                    }
                  } catch (t) {
                    e = { error: t };
                  } finally {
                    try {
                      s && !s.done && (t = o.return) && t.call(o);
                    } finally {
                      if (e) throw e.error;
                    }
                  }
                else i.remove(this);
              var l = this.initialTeardown;
              if (zu(l))
                try {
                  l();
                } catch (e) {
                  a = e instanceof tc ? e.errors : [e];
                }
              var u = this._finalizers;
              if (u) {
                this._finalizers = null;
                try {
                  for (var c = Qu(u), d = c.next(); !d.done; d = c.next()) {
                    var p = d.value;
                    try {
                      ic(p);
                    } catch (e) {
                      ((a = null != a ? a : []),
                        e instanceof tc ? (a = Yu(Yu([], Ku(a)), Ku(e.errors))) : a.push(e));
                    }
                  }
                } catch (e) {
                  n = { error: e };
                } finally {
                  try {
                    d && !d.done && (r = c.return) && r.call(c);
                  } finally {
                    if (n) throw n.error;
                  }
                }
              }
              if (a) throw new tc(a);
            }
          }),
          (e.prototype.add = function (t) {
            var n;
            if (t && t !== this)
              if (this.closed) ic(t);
              else {
                if (t instanceof e) {
                  if (t.closed || t._hasParent(this)) return;
                  t._addParent(this);
                }
                (this._finalizers = null !== (n = this._finalizers) && void 0 !== n ? n : []).push(
                  t,
                );
              }
          }),
          (e.prototype._hasParent = function (e) {
            var t = this._parentage;
            return t === e || (Array.isArray(t) && t.includes(e));
          }),
          (e.prototype._addParent = function (e) {
            var t = this._parentage;
            this._parentage = Array.isArray(t) ? (t.push(e), t) : t ? [t, e] : e;
          }),
          (e.prototype._removeParent = function (e) {
            var t = this._parentage;
            t === e ? (this._parentage = null) : Array.isArray(t) && nc(t, e);
          }),
          (e.prototype.remove = function (t) {
            var n = this._finalizers;
            (n && nc(n, t), t instanceof e && t._removeParent(this));
          }),
          (e.EMPTY = (((t = new e()).closed = !0), t)),
          e
        );
      })();
      rc.EMPTY;
      function ac(e) {
        return (
          e instanceof rc || (e && "closed" in e && zu(e.remove) && zu(e.add) && zu(e.unsubscribe))
        );
      }
      function ic(e) {
        zu(e) ? e() : e.unsubscribe();
      }
      var oc = {
          onUnhandledError: null,
          onStoppedNotification: null,
          Promise: void 0,
          useDeprecatedSynchronousErrorHandling: !1,
          useDeprecatedNextContext: !1,
        },
        sc = {
          setTimeout: function (e, t) {
            for (var n = [], r = 2; r < arguments.length; r++) n[r - 2] = arguments[r];
            var a = sc.delegate;
            return (null == a ? void 0 : a.setTimeout)
              ? a.setTimeout.apply(a, Yu([e, t], Ku(n)))
              : setTimeout.apply(void 0, Yu([e, t], Ku(n)));
          },
          clearTimeout: function (e) {
            var t = sc.delegate;
            return ((null == t ? void 0 : t.clearTimeout) || clearTimeout)(e);
          },
          delegate: void 0,
        };
      function lc(e) {
        sc.setTimeout(function () {
          var t = oc.onUnhandledError;
          if (!t) throw e;
          t(e);
        });
      }
      function uc() {}
      var cc = dc("C", void 0, void 0);
      function dc(e, t, n) {
        return { kind: e, value: t, error: n };
      }
      var pc = null;
      var hc = (function (e) {
          function t(t) {
            var n = e.call(this) || this;
            return (
              (n.isStopped = !1),
              t ? ((n.destination = t), ac(t) && t.add(n)) : (n.destination = wc),
              n
            );
          }
          return (
            Hu(t, e),
            (t.create = function (e, t, n) {
              return new vc(e, t, n);
            }),
            (t.prototype.next = function (e) {
              this.isStopped
                ? yc(
                    (function (e) {
                      return dc("N", e, void 0);
                    })(e),
                    this,
                  )
                : this._next(e);
            }),
            (t.prototype.error = function (e) {
              this.isStopped
                ? yc(
                    (function (e) {
                      return dc("E", void 0, e);
                    })(e),
                    this,
                  )
                : ((this.isStopped = !0), this._error(e));
            }),
            (t.prototype.complete = function () {
              this.isStopped ? yc(cc, this) : ((this.isStopped = !0), this._complete());
            }),
            (t.prototype.unsubscribe = function () {
              this.closed ||
                ((this.isStopped = !0),
                e.prototype.unsubscribe.call(this),
                (this.destination = null));
            }),
            (t.prototype._next = function (e) {
              this.destination.next(e);
            }),
            (t.prototype._error = function (e) {
              try {
                this.destination.error(e);
              } finally {
                this.unsubscribe();
              }
            }),
            (t.prototype._complete = function () {
              try {
                this.destination.complete();
              } finally {
                this.unsubscribe();
              }
            }),
            t
          );
        })(rc),
        fc = Function.prototype.bind;
      function mc(e, t) {
        return fc.call(e, t);
      }
      var gc = (function () {
          function e(e) {
            this.partialObserver = e;
          }
          return (
            (e.prototype.next = function (e) {
              var t = this.partialObserver;
              if (t.next)
                try {
                  t.next(e);
                } catch (e) {
                  bc(e);
                }
            }),
            (e.prototype.error = function (e) {
              var t = this.partialObserver;
              if (t.error)
                try {
                  t.error(e);
                } catch (e) {
                  bc(e);
                }
              else bc(e);
            }),
            (e.prototype.complete = function () {
              var e = this.partialObserver;
              if (e.complete)
                try {
                  e.complete();
                } catch (e) {
                  bc(e);
                }
            }),
            e
          );
        })(),
        vc = (function (e) {
          function t(t, n, r) {
            var a,
              i,
              o = e.call(this) || this;
            zu(t) || !t
              ? (a = {
                  next: null != t ? t : void 0,
                  error: null != n ? n : void 0,
                  complete: null != r ? r : void 0,
                })
              : o && oc.useDeprecatedNextContext
                ? (((i = Object.create(t)).unsubscribe = function () {
                    return o.unsubscribe();
                  }),
                  (a = {
                    next: t.next && mc(t.next, i),
                    error: t.error && mc(t.error, i),
                    complete: t.complete && mc(t.complete, i),
                  }))
                : (a = t);
            return ((o.destination = new gc(a)), o);
          }
          return (Hu(t, e), t);
        })(hc);
      function bc(e) {
        var t;
        oc.useDeprecatedSynchronousErrorHandling
          ? ((t = e),
            oc.useDeprecatedSynchronousErrorHandling &&
              pc &&
              ((pc.errorThrown = !0), (pc.error = t)))
          : lc(e);
      }
      function yc(e, t) {
        var n = oc.onStoppedNotification;
        n &&
          sc.setTimeout(function () {
            return n(e, t);
          });
      }
      var wc = {
        closed: !0,
        next: uc,
        error: function (e) {
          throw e;
        },
        complete: uc,
      };
      function Sc(e, t, n, r, a) {
        return new xc(e, t, n, r, a);
      }
      var xc = (function (e) {
        function t(t, n, r, a, i, o) {
          var s = e.call(this, t) || this;
          return (
            (s.onFinalize = i),
            (s.shouldUnsubscribe = o),
            (s._next = n
              ? function (e) {
                  try {
                    n(e);
                  } catch (e) {
                    t.error(e);
                  }
                }
              : e.prototype._next),
            (s._error = a
              ? function (e) {
                  try {
                    a(e);
                  } catch (e) {
                    t.error(e);
                  } finally {
                    this.unsubscribe();
                  }
                }
              : e.prototype._error),
            (s._complete = r
              ? function () {
                  try {
                    r();
                  } catch (e) {
                    t.error(e);
                  } finally {
                    this.unsubscribe();
                  }
                }
              : e.prototype._complete),
            s
          );
        }
        return (
          Hu(t, e),
          (t.prototype.unsubscribe = function () {
            var t;
            if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
              var n = this.closed;
              (e.prototype.unsubscribe.call(this),
                !n && (null === (t = this.onFinalize) || void 0 === t || t.call(this)));
            }
          }),
          t
        );
      })(hc);
      function _c(e, t) {
        return $u(function (n, r) {
          var a = 0;
          n.subscribe(
            Sc(r, function (n) {
              r.next(e.call(t, n, a++));
            }),
          );
        });
      }
      var Cc = ("function" == typeof Symbol && Symbol.observable) || "@@observable";
      function Oc(e) {
        return e;
      }
      function Rc(e) {
        return 0 === e.length
          ? Oc
          : 1 === e.length
            ? e[0]
            : function (t) {
                return e.reduce(function (e, t) {
                  return t(e);
                }, t);
              };
      }
      var kc = (function () {
        function e(e) {
          e && (this._subscribe = e);
        }
        return (
          (e.prototype.lift = function (t) {
            var n = new e();
            return ((n.source = this), (n.operator = t), n);
          }),
          (e.prototype.subscribe = function (e, t, n) {
            var r,
              a = this,
              i =
                ((r = e) && r instanceof hc) ||
                ((function (e) {
                  return e && zu(e.next) && zu(e.error) && zu(e.complete);
                })(r) &&
                  ac(r))
                  ? e
                  : new vc(e, t, n);
            return (
              (function (e) {
                if (oc.useDeprecatedSynchronousErrorHandling) {
                  var t = !pc;
                  if ((t && (pc = { errorThrown: !1, error: null }), e(), t)) {
                    var n = pc,
                      r = n.errorThrown,
                      a = n.error;
                    if (((pc = null), r)) throw a;
                  }
                } else e();
              })(function () {
                var e = a,
                  t = e.operator,
                  n = e.source;
                i.add(t ? t.call(i, n) : n ? a._subscribe(i) : a._trySubscribe(i));
              }),
              i
            );
          }),
          (e.prototype._trySubscribe = function (e) {
            try {
              return this._subscribe(e);
            } catch (t) {
              e.error(t);
            }
          }),
          (e.prototype.forEach = function (e, t) {
            var n = this;
            return new (t = Ec(t))(function (t, r) {
              var a = new vc({
                next: function (t) {
                  try {
                    e(t);
                  } catch (e) {
                    (r(e), a.unsubscribe());
                  }
                },
                error: r,
                complete: t,
              });
              n.subscribe(a);
            });
          }),
          (e.prototype._subscribe = function (e) {
            var t;
            return null === (t = this.source) || void 0 === t ? void 0 : t.subscribe(e);
          }),
          (e.prototype[Cc] = function () {
            return this;
          }),
          (e.prototype.pipe = function () {
            for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
            return Rc(e)(this);
          }),
          (e.prototype.toPromise = function (e) {
            var t = this;
            return new (e = Ec(e))(function (e, n) {
              var r;
              t.subscribe(
                function (e) {
                  return (r = e);
                },
                function (e) {
                  return n(e);
                },
                function () {
                  return e(r);
                },
              );
            });
          }),
          (e.create = function (t) {
            return new e(t);
          }),
          e
        );
      })();
      function Ec(e) {
        var t;
        return null !== (t = null != e ? e : oc.Promise) && void 0 !== t ? t : Promise;
      }
      var Tc = "function" == typeof Symbol && Symbol.iterator ? Symbol.iterator : "@@iterator";
      function Dc(e) {
        if (e instanceof kc) return e;
        if (null != e) {
          if (
            (function (e) {
              return zu(e[Cc]);
            })(e)
          )
            return (
              (o = e),
              new kc(function (e) {
                var t = o[Cc]();
                if (zu(t.subscribe)) return t.subscribe(e);
                throw new TypeError(
                  "Provided object does not correctly implement Symbol.observable",
                );
              })
            );
          if ((i = e) && "number" == typeof i.length && "function" != typeof i)
            return (
              (a = e),
              new kc(function (e) {
                for (var t = 0; t < a.length && !e.closed; t++) e.next(a[t]);
                e.complete();
              })
            );
          if (zu(null == (r = e) ? void 0 : r.then))
            return (
              (n = e),
              new kc(function (e) {
                n.then(
                  function (t) {
                    e.closed || (e.next(t), e.complete());
                  },
                  function (t) {
                    return e.error(t);
                  },
                ).then(null, lc);
              })
            );
          if (
            (function (e) {
              return Symbol.asyncIterator && zu(null == e ? void 0 : e[Symbol.asyncIterator]);
            })(e)
          )
            return Pc(e);
          if (
            (function (e) {
              return zu(null == e ? void 0 : e[Tc]);
            })(e)
          )
            return (
              (t = e),
              new kc(function (e) {
                var n, r;
                try {
                  for (var a = Qu(t), i = a.next(); !i.done; i = a.next()) {
                    var o = i.value;
                    if ((e.next(o), e.closed)) return;
                  }
                } catch (e) {
                  n = { error: e };
                } finally {
                  try {
                    i && !i.done && (r = a.return) && r.call(a);
                  } finally {
                    if (n) throw n.error;
                  }
                }
                e.complete();
              })
            );
          if (
            (function (e) {
              return zu(null == e ? void 0 : e.getReader);
            })(e)
          )
            return Pc(
              (function (e) {
                return Xu(this, arguments, function () {
                  var t, n, r;
                  return Gu(this, function (a) {
                    switch (a.label) {
                      case 0:
                        ((t = e.getReader()), (a.label = 1));
                      case 1:
                        (a.trys.push([1, , 9, 10]), (a.label = 2));
                      case 2:
                        return [4, Zu(t.read())];
                      case 3:
                        return ((n = a.sent()), (r = n.value), n.done ? [4, Zu(void 0)] : [3, 5]);
                      case 4:
                        return [2, a.sent()];
                      case 5:
                        return [4, Zu(r)];
                      case 6:
                        return [4, a.sent()];
                      case 7:
                        return (a.sent(), [3, 2]);
                      case 8:
                        return [3, 10];
                      case 9:
                        return (t.releaseLock(), [7]);
                      case 10:
                        return [2];
                    }
                  });
                });
              })(e),
            );
        }
        var t, n, r, a, i, o;
        throw (function (e) {
          return new TypeError(
            "You provided " +
              (null !== e && "object" == typeof e ? "an invalid object" : "'" + e + "'") +
              " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.",
          );
        })(e);
      }
      function Pc(e) {
        return new kc(function (t) {
          (function (e, t) {
            var n, r, a, i;
            return qu(this, void 0, void 0, function () {
              var o, s;
              return Gu(this, function (l) {
                switch (l.label) {
                  case 0:
                    (l.trys.push([0, 5, 6, 11]), (n = Ju(e)), (l.label = 1));
                  case 1:
                    return [4, n.next()];
                  case 2:
                    if ((r = l.sent()).done) return [3, 4];
                    if (((o = r.value), t.next(o), t.closed)) return [2];
                    l.label = 3;
                  case 3:
                    return [3, 1];
                  case 4:
                    return [3, 11];
                  case 5:
                    return ((s = l.sent()), (a = { error: s }), [3, 11]);
                  case 6:
                    return (
                      l.trys.push([6, , 9, 10]),
                      r && !r.done && (i = n.return) ? [4, i.call(n)] : [3, 8]
                    );
                  case 7:
                    (l.sent(), (l.label = 8));
                  case 8:
                    return [3, 10];
                  case 9:
                    if (a) throw a.error;
                    return [7];
                  case 10:
                    return [7];
                  case 11:
                    return (t.complete(), [2]);
                }
              });
            });
          })(e, t).catch(function (e) {
            return t.error(e);
          });
        });
      }
      function Ac(e, t, n) {
        return (
          void 0 === n && (n = 1 / 0),
          zu(t)
            ? Ac(function (n, r) {
                return _c(function (e, a) {
                  return t(n, e, r, a);
                })(Dc(e(n, r)));
              }, n)
            : ("number" == typeof t && (n = t),
              $u(function (t, r) {
                return (function (e, t, n, r, a, i, o, s) {
                  var l = [],
                    u = 0,
                    c = 0,
                    d = !1,
                    p = function () {
                      !d || l.length || u || t.complete();
                    },
                    h = function (e) {
                      return u < r ? f(e) : l.push(e);
                    },
                    f = function (e) {
                      (i && t.next(e), u++);
                      var s = !1;
                      Dc(n(e, c++)).subscribe(
                        Sc(
                          t,
                          function (e) {
                            (null == a || a(e), i ? h(e) : t.next(e));
                          },
                          function () {
                            s = !0;
                          },
                          void 0,
                          function () {
                            if (s)
                              try {
                                u--;
                                for (
                                  var e = function () {
                                    var e = l.shift();
                                    o
                                      ? (function (e, t, n, r, a) {
                                          (void 0 === r && (r = 0), void 0 === a && (a = !1));
                                          var i = t.schedule(function () {
                                            (n(),
                                              a
                                                ? e.add(this.schedule(null, r))
                                                : this.unsubscribe());
                                          }, r);
                                          e.add(i);
                                        })(t, o, function () {
                                          return f(e);
                                        })
                                      : f(e);
                                  };
                                  l.length && u < r;

                                )
                                  e();
                                p();
                              } catch (e) {
                                t.error(e);
                              }
                          },
                        ),
                      );
                    };
                  return (
                    e.subscribe(
                      Sc(t, h, function () {
                        ((d = !0), p());
                      }),
                    ),
                    function () {
                      null == s || s();
                    }
                  );
                })(t, r, e, n);
              }))
        );
      }
      const Ic = {
        prepareAnnotation: (e) => {
          if ((0, V.isString)(null == e ? void 0 : e.query)) {
            const { query: t, ...n } = e;
            return { ...n, target: { refId: "annotation_query", query: t }, mappings: {} };
          }
          return e;
        },
        prepareQuery: (e) => e.target,
        processEvents: (e, t) =>
          (function (e, t) {
            return (0, m.of)(e).pipe(
              (e) =>
                e.pipe(
                  Ac((e) => {
                    if (!(null == e ? void 0 : e.length)) return (0, m.of)(void 0);
                    if (1 === e.length) return (0, m.of)(e[0]);
                    const t = { interpolate: (e) => e };
                    return (0, m.of)(e).pipe(
                      s.standardTransformers.mergeTransformer.operator({}, t),
                      _c((e) => e[0]),
                    );
                  }),
                ),
              _c((e) => {
                if (!(null == e ? void 0 : e.length)) return [];
                let n = !1,
                  r = !1;
                const a = {};
                for (const t of e.fields) {
                  a[(0, s.getFieldDisplayName)(t, e).toLowerCase()] = t;
                }
                t || (t = {});
                const i = [];
                for (const o of Mc) {
                  const l = t[o.key] || {};
                  if (l.source === s.AnnotationEventFieldSource.Skip) continue;
                  const u = { key: o.key, split: o.split };
                  if (l.source === s.AnnotationEventFieldSource.Text) u.text = l.value;
                  else {
                    const t = (l.value || o.key).toLowerCase();
                    ((u.field = a[t]), !u.field && o.field && (u.field = o.field(e)));
                  }
                  (u.field || u.text) &&
                    (i.push(u), "time" === u.key ? (n = !0) : "text" === u.key && (r = !0));
                }
                if (!n || !r)
                  return (
                    console.error("Cannot process annotation fields. No time or text present."),
                    []
                  );
                const o = [];
                for (let t = 0; t < e.length; t++) {
                  const e = { type: "default", color: "red" };
                  for (const n of i) {
                    let r;
                    if (n.text) r = n.text;
                    else if (n.field && ((r = n.field.values.get(t)), void 0 !== r && n.regex)) {
                      const e = n.regex.exec(r);
                      e && (r = e[1] ? e[1] : e[0]);
                    }
                    null != r &&
                      (n.split && "string" == typeof r && (r = r.split(",")), (e[n.key] = r));
                  }
                  o.push(e);
                }
                return o;
              }),
            );
          })(t, e.mappings),
      };
      const Vc = [
          {
            key: "time",
            field: (e) => e.fields.find((e) => e.type === s.FieldType.time),
            placeholder: "time, or the first time field",
          },
          {
            key: "timeEnd",
            help: "When this field is defined, the annotation will be treated as a range",
          },
          { key: "title" },
          {
            key: "text",
            field: (e) => e.fields.find((e) => e.type === s.FieldType.string),
            placeholder: "text, or the first text field",
          },
          { key: "tags", split: ",", help: "The results will be split on comma (,)" },
          { key: "id" },
        ],
        Mc = [
          ...(l.config.publicDashboardAccessToken
            ? [{ key: "color" }, { key: "isRegion" }, { key: "source" }]
            : []),
          ...Vc,
          { key: "userId" },
          { key: "login" },
          { key: "email" },
          { key: "prevState" },
          { key: "newState" },
          { key: "data" },
          { key: "panelId" },
          { key: "alertId" },
          { key: "dashboardId" },
          { key: "dashboardUID" },
        ];
      const Lc = ["prometheus", "loki", "elasticsearch", "grafana-opensearch-datasource"];
      let Fc = 100;
      function jc(e, t, n, r, a, i) {
        var o;
        if (
          e.annotationQuery &&
          (function (e) {
            const { type: t } = e;
            return !e.annotations || Lc.includes(t);
          })(e)
        )
          return (
            console.warn("Using deprecated annotationQuery method, please upgrade your datasource"),
            (0, m.from)(
              e.annotationQuery({
                range: t.state.value,
                rangeRaw: t.state.value.raw,
                annotation: n,
                dashboard: { getVariables: (0, l.getTemplateSrv)().getVariables },
              }),
            ).pipe(_c((e) => ({ state: ae.Done, events: e })))
          );
        const u = { ...Ic, ...e.annotations },
          c = { ...(null == (o = u.getDefaultQuery) ? void 0 : o.call(u)), ...n },
          d = u.prepareAnnotation(c);
        if (!d) return (0, m.of)({ state: ae.Done, events: [] });
        const p = u.prepareQuery(d);
        if (!p) return (0, m.of)({ state: ae.Done, events: [] });
        const h =
            window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
          f = s.rangeUtil.calculateInterval(t.state.value, h, e.interval),
          g = {
            __interval: { text: f.interval, value: f.interval },
            __interval_ms: { text: f.intervalMs.toString(), value: f.intervalMs },
            __annotation: { text: d.name, value: d },
            __sceneObject: Sn(r),
          },
          v = {
            startTime: Date.now(),
            requestId: "AQ" + Fc++,
            range: t.state.value,
            maxDataPoints: h,
            scopedVars: g,
            ...f,
            app: s.CoreApp.Dashboard,
            timezone: t.getTimeZone(),
            targets: [{ ...p, refId: "Anno" }],
            scopes: ru.getScopes(r),
            filters: a,
            groupByKeys: i,
            ...xt(r),
          };
        return (0, l.getRunRequest)()(e, v).pipe(
          Ac((e) => {
            const t = (null == e ? void 0 : e.series.length) ? e.series : e.annotations;
            return (null == t ? void 0 : t.length)
              ? (t.forEach((e) => {
                  var t;
                  (null == (t = e.meta) ? void 0 : t.dataTopic) ||
                    (e.meta = { ...(e.meta || {}), dataTopic: s.DataTopic.Annotations });
                }),
                u.processEvents(d, t).pipe(_c((t) => ({ state: e.state, events: t || [] }))))
              : (0, m.of)({ state: e.state, events: [] });
          }),
        );
      }
      function Nc(e) {
        return "panel-alert" === e.eventType;
      }
      class Bc extends Bu {
        constructor(e) {
          (super({ isEnabled: !0, ...e }, ["query"]),
            (this._scopedVars = { __sceneObject: Sn(this) }),
            (this._drilldownDependenciesManager = new ll(this._variableDependency)));
        }
        onEnable() {
          this.publishEvent(new l.RefreshEvent(), !0);
          const e = ru.getTimeRange(this);
          (this.setState({ query: { ...this.state.query, enable: !0 } }),
            (this._timeRangeSub = e.subscribeToState(() => {
              this.runWithTimeRange(e);
            })));
        }
        onDisable() {
          var e;
          (this.publishEvent(new l.RefreshEvent(), !0),
            this.setState({ query: { ...this.state.query, enable: !1 } }),
            null == (e = this._timeRangeSub) || e.unsubscribe());
        }
        runLayer() {
          G();
          const e = ru.getTimeRange(this);
          this.runWithTimeRange(e);
        }
        async runWithTimeRange(e) {
          var t;
          const { query: n } = this.state;
          if (n.enable)
            if (
              (this._drilldownDependenciesManager.findAndSubscribeToDrilldowns(
                null == (t = n.datasource) ? void 0 : t.uid,
              ),
              this.querySub && this.querySub.unsubscribe(),
              this._variableDependency.hasDependencyInLoadingState())
            )
              G();
            else
              try {
                let t = jc(
                  await this.resolveDataSource(n),
                  e,
                  n,
                  this,
                  this._drilldownDependenciesManager.getFilters(),
                  this._drilldownDependenciesManager.getGroupByKeys(),
                ).pipe(
                  mt({
                    type: "AnnotationsDataLayer/annotationsLoading",
                    origin: this,
                    cancel: () => this.cancelQuery(),
                  }),
                  (0, m.map)((e) => this.processEvents(n, e)),
                );
                this.querySub = t.subscribe((e) => {
                  this.publishResults(e);
                });
              } catch (e) {
                (this.publishResults({ ...oe, state: ae.Error, errors: [{ message: Nu(e) }] }),
                  console.error("AnnotationsDataLayer error", e));
              }
        }
        async resolveDataSource(e) {
          return await vt(e.datasource || void 0, this._scopedVars);
        }
        processEvents(e, t) {
          let n =
            ((r = e),
            (a = t.events || []),
            r.snapshotData && delete (r = (0, V.cloneDeep)(r)).snapshotData,
            a.map((e) => {
              var t;
              const n = { ...e };
              switch (
                ((n.source = r),
                (n.color = l.config.theme2.visualization.getColorByName(r.iconColor)),
                (n.type = r.name),
                (n.isRegion = Boolean(n.timeEnd && n.time !== n.timeEnd)),
                null == (t = n.newState) ? void 0 : t.toLowerCase())
              ) {
                case "pending":
                  n.color = "yellow";
                  break;
                case "alerting":
                  n.color = "red";
                  break;
                case "ok":
                case "normal":
                  n.color = "green";
                  break;
                case "no_data":
                case "nodata":
                  n.color = "gray";
              }
              return n;
            }));
          var r, a;
          n = (function (e) {
            let t = [];
            const n = (0, V.partition)(e, "id"),
              r = (0, V.groupBy)(n[0], "id");
            return (
              (t = (0, V.map)(r, (e) =>
                e.length > 1 && !(0, V.every)(e, Nc)
                  ? (0, V.find)(e, (e) => "panel-alert" !== e.eventType)
                  : (0, V.head)(e),
              )),
              (t = (0, V.concat)(t, n[1])),
              t
            );
          })(n);
          const i = { ...oe, state: t.state },
            o = (0, s.arrayToDataFrame)(n);
          return (
            (o.meta = { ...o.meta, dataTopic: s.DataTopic.Annotations }),
            (i.series = [o]),
            i
          );
        }
      }
      Bc.Component = function ({ model: e }) {
        const { isEnabled: t, isHidden: n } = e.useState(),
          r = `data-layer-${e.state.key}`;
        if (n) return null;
        return f().createElement(Ct.InlineSwitch, {
          className: zc,
          id: r,
          value: t,
          onChange: () => e.setState({ isEnabled: !t }),
        });
      };
      const zc = (0, Vt.css)({ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 });
      class $c extends P {
        constructor(e) {
          (super(e),
            (this._activationHandler = () => {
              const e = this.getAncestorTimeRange();
              (this.ancestorTimeRangeChanged(e.state),
                this._subs.add(e.subscribeToState((e) => this.ancestorTimeRangeChanged(e))));
            }),
            this.addActivationHandler(this._activationHandler));
        }
        getAncestorTimeRange() {
          if (!this.parent || !this.parent.parent)
            throw new Error(typeof this + " must be used within $timeRange scope");
          return ru.getTimeRange(this.parent.parent);
        }
        getTimeZone() {
          return this.getAncestorTimeRange().getTimeZone();
        }
        onTimeRangeChange(e) {
          this.getAncestorTimeRange().onTimeRangeChange(e);
        }
        onTimeZoneChange(e) {
          this.getAncestorTimeRange().onTimeZoneChange(e);
        }
        onRefresh() {
          this.getAncestorTimeRange().onRefresh();
        }
      }
      class Wc extends $c {
        constructor(e) {
          super({
            ...e,
            timeZone: e.timeZone,
            from: "now-6h",
            to: "now",
            value: (0, s.getDefaultTimeRange)(),
          });
        }
        ancestorTimeRangeChanged(e) {
          this.setState({
            ...e,
            timeZone: this.state.timeZone,
            value: de(
              e.from,
              e.to,
              this.state.timeZone,
              e.fiscalYearStartMonth,
              e.UNSAFE_nowDelay,
              e.weekStart,
            ),
          });
        }
        getTimeZone() {
          return this.state.timeZone;
        }
        onTimeZoneChange(e) {
          const t = this.getAncestorTimeRange();
          this.setState({
            timeZone: e,
            value: de(
              t.state.from,
              t.state.to,
              e,
              t.state.fiscalYearStartMonth,
              t.state.UNSAFE_nowDelay,
              t.state.weekStart,
            ),
          });
        }
      }
      class Hc extends P {
        constructor(e) {
          (super({ source: e.source, data: e.source.resolve().state.data }),
            this.addActivationHandler(() => {
              this._subs.add(
                this.state.source.resolve().subscribeToState((e, t) => {
                  e.data !== t.data && this.setState({ data: e.data });
                }),
              );
            }));
        }
        setContainerWidth(e) {
          var t, n;
          null == (n = (t = this.state.source.resolve()).setContainerWidth) || n.call(t, e);
        }
        isDataReadyToDisplay() {
          var e, t, n;
          return (
            null ==
              (n =
                null == (t = (e = this.state.source.resolve()).isDataReadyToDisplay)
                  ? void 0
                  : t.call(e)) || n
          );
        }
        cancelQuery() {
          var e, t;
          null == (t = (e = this.state.source.resolve()).cancelQuery) || t.call(e);
        }
        getResultsStream() {
          return this.state.source.resolve().getResultsStream();
        }
      }
      class Uc extends P {
        constructor() {
          super({});
        }
      }
      function qc({ layer: e }) {
        var t, n;
        const r = `data-layer-${e.state.key}`,
          { data: a, isHidden: i } = e.useState(),
          o = Boolean(a && a.state === ae.Loading);
        return i
          ? null
          : f().createElement(
              "div",
              { className: Gc },
              f().createElement(br, {
                htmlFor: r,
                isLoading: o,
                onCancel: () => {
                  var t;
                  return null == (t = e.cancelQuery) ? void 0 : t.call(e);
                },
                label: e.state.name,
                description: e.state.description,
                error:
                  null == (n = null == (t = e.state.data) ? void 0 : t.errors)
                    ? void 0
                    : n[0].message,
              }),
              f().createElement(e.Component, { model: e }),
            );
      }
      Uc.Component = function ({ model: e }) {
        const t = ru.getDataLayers(e, !0);
        if (0 === t.length) return null;
        return f().createElement(
          f().Fragment,
          null,
          t.map((e) => f().createElement(qc, { layer: e, key: e.state.key })),
        );
      };
      const Gc = (0, Vt.css)({ display: "flex" });
      class Qc extends P {}
      function Kc({ variable: e, layout: t, showAlways: n, hideLabel: r }) {
        return A(e, { shouldActivateOrKeepAlive: !0 }).hide !== s.VariableHide.hideVariable || n
          ? "vertical" === t
            ? f().createElement(
                "div",
                { className: Xc, "data-testid": It.pages.Dashboard.SubMenu.submenuItem },
                f().createElement(Yc, { variable: e, layout: t, hideLabel: r }),
                f().createElement(e.Component, { model: e }),
              )
            : f().createElement(
                "div",
                { className: Zc, "data-testid": It.pages.Dashboard.SubMenu.submenuItem },
                f().createElement(Yc, { variable: e, hideLabel: r }),
                f().createElement(e.Component, { model: e }),
              )
          : e.UNSAFE_renderAsHidden
            ? f().createElement(e.Component, { model: e })
            : null;
      }
      function Yc({ variable: e, layout: t, hideLabel: n }) {
        var r;
        const { state: a } = e;
        if (e.state.hide === s.VariableHide.hideLabel || n) return null;
        const i = `var-${a.key}`,
          o = a.label || a.name;
        return f().createElement(br, {
          htmlFor: i,
          isLoading: a.loading,
          onCancel: () => {
            var t;
            return null == (t = e.onCancel) ? void 0 : t.call(e);
          },
          label: o,
          error: a.error,
          layout: t,
          description: null != (r = a.description) ? r : void 0,
        });
      }
      Qc.Component = function ({ model: e }) {
        const t = ru.getVariables(e).useState();
        return f().createElement(
          f().Fragment,
          null,
          t.variables.map((t) =>
            f().createElement(Kc, { key: t.state.key, variable: t, layout: e.state.layout }),
          ),
        );
      };
      const Zc = (0, Vt.css)({
          display: "flex",
          "> :nth-child(2)": (0, Vt.css)({ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }),
        }),
        Xc = (0, Vt.css)({ display: "flex", flexDirection: "column" });
      class Jc extends P {}
      Jc.Component = function ({ model: e }) {
        const t = ru.lookupVariable(e.state.variableName, e);
        if (!t) return null;
        return f().createElement(Kc, {
          key: t.state.key,
          variable: t,
          layout: e.state.layout,
          showAlways: !0,
        });
      };
      class ed extends P {
        constructor(e) {
          (super(e),
            (this._variablesToUpdate = new Set()),
            (this._updating = new Map()),
            (this._variableValueRecorder = new bt()),
            (this._variableDependency = new nd(
              this._handleParentVariableUpdatesCompleted.bind(this),
            )),
            (this._onActivate = () => {
              const e = ru.getTimeRange(this);
              (this._subs.add(
                this.subscribeToEvent(Oe, (e) => this._handleVariableValueChanged(e.payload)),
              ),
                this._subs.add(
                  e.subscribeToState(() => {
                    this._refreshTimeRangeBasedVariables();
                  }),
                ),
                this._subs.add(this.subscribeToState(this._onStateChanged)),
                this._checkForVariablesThatChangedWhileInactive());
              for (const e of this.state.variables)
                this._variableNeedsUpdate(e) && this._variablesToUpdate.add(e);
              return (this._updateNextBatch(), this._onDeactivate);
            }),
            (this._onDeactivate = () => {
              var e;
              for (const t of this._updating.values())
                null == (e = t.subscription) || e.unsubscribe();
              for (const e of this.state.variables)
                this._variablesToUpdate.has(e) ||
                  this._updating.has(e) ||
                  this._variableValueRecorder.recordCurrentValue(e);
              (this._variablesToUpdate.clear(), this._updating.clear());
            }),
            (this._onStateChanged = (e, t) => {
              const n = this._variablesToUpdate.size;
              for (const n of t.variables)
                if (!e.variables.includes(n)) {
                  const e = this._updating.get(n);
                  ((null == e ? void 0 : e.subscription) && e.subscription.unsubscribe(),
                    this._updating.delete(n),
                    this._variablesToUpdate.delete(n));
                }
              for (const n of e.variables)
                t.variables.includes(n) ||
                  (this._variableNeedsUpdate(n) && this._variablesToUpdate.add(n));
              0 === n && this._variablesToUpdate.size > 0 && this._updateNextBatch();
            }),
            this.addActivationHandler(this._onActivate));
        }
        getByName(e) {
          return this.state.variables.find((t) => t.state.name === e);
        }
        _refreshTimeRangeBasedVariables() {
          for (const e of this.state.variables)
            "refresh" in e.state &&
              e.state.refresh === s.VariableRefresh.onTimeRangeChanged &&
              this._variablesToUpdate.add(e);
          this._updateNextBatch();
        }
        _checkForVariablesThatChangedWhileInactive() {
          if (this._variableValueRecorder.hasValues())
            for (const e of this.state.variables)
              this._variableValueRecorder.hasValueChanged(e) &&
                (td(e, "Changed while in-active"), this._addDependentVariablesToUpdateQueue(e));
        }
        _variableNeedsUpdate(e) {
          return (
            !e.isLazy &&
            !!e.validateAndUpdate &&
            (!this._variableValueRecorder.hasRecordedValue(e) ||
              (td(e, "Skipping updateAndValidate current value valid"), !1))
          );
        }
        _updateNextBatch() {
          for (const e of this._variablesToUpdate) {
            if (!e.validateAndUpdate) {
              console.error(
                "Variable added to variablesToUpdate but does not have validateAndUpdate",
              );
              continue;
            }
            if (this._updating.has(e)) continue;
            if (ru.hasVariableDependencyInLoadingState(e)) continue;
            const t = { variable: e };
            (this._updating.set(e, t),
              td(e, "updateAndValidate started"),
              (t.subscription = e.validateAndUpdate().subscribe({
                next: () => this._validateAndUpdateCompleted(e),
                complete: () => this._validateAndUpdateCompleted(e),
                error: (t) => this._handleVariableError(e, t),
              })));
          }
        }
        _validateAndUpdateCompleted(e) {
          var t;
          if (!this._updating.has(e)) return;
          const n = this._updating.get(e);
          (null == (t = null == n ? void 0 : n.subscription) || t.unsubscribe(),
            this._updating.delete(e),
            this._variablesToUpdate.delete(e),
            td(e, "updateAndValidate completed"),
            this._notifyDependentSceneObjects(e),
            this._updateNextBatch());
        }
        cancel(e) {
          var t;
          const n = this._updating.get(e);
          (null == (t = null == n ? void 0 : n.subscription) || t.unsubscribe(),
            this._updating.delete(e),
            this._variablesToUpdate.delete(e));
        }
        _handleVariableError(e, t) {
          var n;
          const r = this._updating.get(e);
          (null == (n = null == r ? void 0 : r.subscription) || n.unsubscribe(),
            this._updating.delete(e),
            this._variablesToUpdate.delete(e),
            e.setState({ loading: !1, error: t.message }),
            console.error("SceneVariableSet updateAndValidate error", t),
            td(e, "updateAndValidate error", t),
            this._notifyDependentSceneObjects(e),
            this._updateNextBatch());
        }
        _handleVariableValueChanged(e) {
          (this._addDependentVariablesToUpdateQueue(e),
            this._updating.has(e) ||
              (this._updateNextBatch(), this._notifyDependentSceneObjects(e)));
        }
        _handleParentVariableUpdatesCompleted(e, t) {
          (t && this._addDependentVariablesToUpdateQueue(e),
            this._variablesToUpdate.size > 0 &&
              0 === this._updating.size &&
              this._updateNextBatch());
        }
        _addDependentVariablesToUpdateQueue(e) {
          for (const t of this.state.variables)
            t.variableDependency &&
              t.variableDependency.hasDependencyOn(e.state.name) &&
              (td(t, "Added to update queue, dependant variable value changed"),
              this._updating.has(t) && t.onCancel && t.onCancel(),
              t.validateAndUpdate && this._variablesToUpdate.add(t),
              t.variableDependency.variableUpdateCompleted(e, !0));
        }
        _notifyDependentSceneObjects(e) {
          this.parent && this._traverseSceneAndNotify(this.parent, e, !0);
        }
        _traverseSceneAndNotify(e, t, n) {
          if (this !== e && e.isActive) {
            if (e.state.$variables && e.state.$variables !== this) {
              const n = e.state.$variables.getByName(t.state.name);
              if (null == n ? void 0 : n.isAncestorLoading) t = n;
              else if (n) return;
            }
            (e.variableDependency && e.variableDependency.variableUpdateCompleted(t, n),
              e.forEachChild((e) => this._traverseSceneAndNotify(e, t, n)));
          }
        }
        isVariableLoadingOrWaitingToUpdate(e) {
          return (
            !!e.state.loading ||
            !(!e.isAncestorLoading || !e.isAncestorLoading()) ||
            !(!this._variablesToUpdate.has(e) && !this._updating.has(e)) ||
            ru.hasVariableDependencyInLoadingState(e)
          );
        }
      }
      function td(e, t, n) {
        G(0, e.state.name);
      }
      class nd {
        constructor(e) {
          ((this._variableUpdatesCompleted = e), (this._emptySet = new Set()));
        }
        getNames() {
          return this._emptySet;
        }
        hasDependencyOn(e) {
          return !1;
        }
        variableUpdateCompleted(e, t) {
          this._variableUpdatesCompleted(e, t);
        }
      }
      class rd extends Je {
        constructor(e) {
          (super({ type: "custom", query: "", value: "", text: "", options: [], name: "", ...e }),
            (this._variableDependency = new Pl(this, { statePaths: ["query"] })));
        }
        transformCsvStringToOptions(e, t = !0) {
          var n;
          return (
            null != (n = (e = t ? ru.interpolate(this, e) : e).match(/(?:\\,|[^,])+/g)) ? n : []
          ).map((e) => {
            var t;
            e = e.replace(/\\,/g, ",");
            const n = null != (t = /^\s*(.+)\s:\s(.+)$/g.exec(e)) ? t : [];
            if (3 === n.length) {
              const [, e, t] = n;
              return { label: e.trim(), value: t.trim() };
            }
            return { label: e.trim(), value: e.trim() };
          });
        }
        getValueOptions(e) {
          const t = this.transformCsvStringToOptions(this.state.query);
          return (t.length || (this.skipNextValidation = !0), (0, m.of)(t));
        }
      }
      rd.Component = ({ model: e }) => f().createElement(hn, { model: e });
      class ad extends P {
        constructor(e) {
          (super({
            type: "switch",
            value: "false",
            enabledValue: "true",
            disabledValue: "false",
            name: "",
            ...e,
          }),
            (this._prevValue = ""),
            (this._urlSync = new se(this, { keys: () => this.getKeys() })));
        }
        validateAndUpdate() {
          const e = this.getValue();
          return (
            this._prevValue !== e && ((this._prevValue = e), this.publishEvent(new Oe(this), !0)),
            (0, m.of)({})
          );
        }
        setValue(e) {
          this.getValue() !== e &&
            ([this.state.enabledValue, this.state.disabledValue].includes(e)
              ? (this.setState({ value: e }), this.publishEvent(new Oe(this), !0))
              : console.error(
                  `Invalid value for switch variable: "${e}". Valid values are: "${this.state.enabledValue}" and "${this.state.disabledValue}".`,
                ));
        }
        getValue() {
          return this.state.value;
        }
        isEnabled() {
          return this.state.value === this.state.enabledValue;
        }
        isDisabled() {
          return this.state.value === this.state.disabledValue;
        }
        getKey() {
          return `var-${this.state.name}`;
        }
        getKeys() {
          return this.state.skipUrlSync ? [] : [this.getKey()];
        }
        getUrlState() {
          return this.state.skipUrlSync ? {} : { [this.getKey()]: this.state.value };
        }
        updateFromUrl(e) {
          const t = e[this.getKey()];
          "string" == typeof t && this.setValue(t);
        }
      }
      function id(e) {
        return {
          container: (0, Vt.css)({
            display: "flex",
            alignItems: "center",
            padding: e.spacing(0, 1),
            height: e.spacing(e.components.height.md),
            borderRadius: e.shape.radius.default,
            border: `1px solid ${e.components.input.borderColor}`,
            background: e.colors.background.primary,
          }),
        };
      }
      ad.Component = function ({ model: e }) {
        const t = e.useState(),
          n = (0, Ct.useStyles2)(id);
        return f().createElement(
          "div",
          { className: n.container },
          f().createElement(Ct.Switch, {
            value: t.value === t.enabledValue,
            onChange: (n) => {
              e.setValue(n.currentTarget.checked ? t.enabledValue : t.disabledValue);
            },
          }),
        );
      };
      class od extends Je {
        constructor(e) {
          (super({
            type: "datasource",
            value: "",
            text: "",
            options: [],
            name: "",
            regex: "",
            pluginId: "",
            ...e,
          }),
            (this._variableDependency = new Pl(this, { statePaths: ["regex"] })));
        }
        getValueOptions(e) {
          if (!this.state.pluginId) return (0, m.of)([]);
          const t = (0, l.getDataSourceSrv)().getList({
            metrics: !0,
            variables: !1,
            pluginId: this.state.pluginId,
          });
          let n;
          if (this.state.regex) {
            const e = ru.interpolate(this, this.state.regex, void 0, "regex");
            n = (0, s.stringToJsRegex)(e);
          }
          const r = [];
          for (let e = 0; e < t.length; e++) {
            const a = t[e];
            (sd(a, n) && r.push({ label: a.name, value: a.uid }),
              this.state.defaultOptionEnabled &&
                ld(a, n) &&
                r.push({
                  label: (0, Pe.t)(
                    "grafana-scenes.variables.data-source-variable.label.default",
                    "default",
                  ),
                  value: "default",
                }));
          }
          return (
            0 === r.length
              ? this.setState({ error: "No data sources found" })
              : this.state.error && this.setState({ error: null }),
            (0, m.of)(r)
          );
        }
      }
      function sd(e, t) {
        return !t || t.exec(e.name);
      }
      function ld(e, t) {
        return !!e.isDefault && (!t || t.exec("default"));
      }
      function ud(e, t) {
        const n = ["A", "B", "C", "D", "E", "F", "G", "H"],
          r = [];
        if (t > 5) return [];
        for (const a of n) {
          const n = `${e}${a}`;
          r.push({ name: n, children: ud(n, t + 1) });
        }
        return r;
      }
      function cd(e, t, n) {
        if (n >= t.length) return e;
        if ("*" === t[n]) return e;
        const r = t[n];
        let a = [],
          i = [r];
        r.startsWith("{") && (i = r.replace(/\{|\}/g, "").split(","));
        for (const r of e)
          for (const e of i)
            if (-1 !== e.indexOf("*")) {
              const i = e.replace("*", "");
              new RegExp(`^${i}.*`, "gi").test(r.name) && (a = a.concat(cd([r], t, n + 1)));
            } else r.name === e && (a = a.concat(cd(r.children, t, n + 1)));
        return a;
      }
      function dd(e) {
        if (0 === e.indexOf("value")) return [{ name: e, children: [] }];
        return cd(ud("", 0), e.split("."), 0);
      }
      od.Component = ({ model: e }) => f().createElement(hn, { model: e });
      class pd extends Je {
        constructor(e, t = !1) {
          (super({
            type: "custom",
            name: "Test",
            value: "Value",
            text: (0, Pe.t)("grafana-scenes.variables.test-variable.text.text", "Text"),
            query: "Query",
            options: [],
            refresh: s.VariableRefresh.onDashboardLoad,
            updateOptions: !0,
            ...e,
          }),
            (this.completeUpdate = new m.Subject()),
            (this.isGettingValues = !0),
            (this.getValueOptionsCount = 0),
            (this.isLazy = !1),
            (this._variableDependency = new Pl(this, { statePaths: ["query"] })),
            (this.isLazy = t));
        }
        getValueOptions(e) {
          const { delayMs: t } = this.state;
          this.getValueOptionsCount += 1;
          const n = ru.getQueryController(this);
          return new m.Observable((e) => {
            const r = { type: "variable", origin: this, cancel: () => e.complete() };
            if ((n && n.queryStarted(r), this.setState({ loading: !0 }), this.state.throwError))
              throw new Error(this.state.throwError);
            const a = ru.interpolate(this, this.state.query),
              i = this.getOptions(a),
              o = this.completeUpdate.subscribe({
                next: () => {
                  const t = { issuedQuery: a, loading: !1 };
                  (this.state.updateOptions && (t.options = i),
                    this.setState(t),
                    e.next(i),
                    e.complete());
                },
              });
            let s;
            return (
              t
                ? (s = window.setTimeout(() => this.signalUpdateCompleted(), t))
                : 0 === t && this.signalUpdateCompleted(),
              (this.isGettingValues = !0),
              () => {
                (o.unsubscribe(),
                  window.clearTimeout(s),
                  (this.isGettingValues = !1),
                  this.state.loading && this.setState({ loading: !1 }),
                  n && n.queryCompleted(r));
              }
            );
          });
        }
        cancel() {
          const e = le(this, (e) => (e instanceof ed ? e : void 0));
          null == e || e.cancel(this);
        }
        getOptions(e) {
          return this.state.optionsToReturn
            ? this.state.optionsToReturn
            : dd(e).map((e) => ({ label: e.name, value: e.name }));
        }
        signalUpdateCompleted() {
          this.completeUpdate.next(1);
        }
      }
      function hd({ model: e }) {
        const { value: t, key: n, loading: r } = e.useState(),
          a = (0, p.useCallback)(
            (t) => {
              e.setValue(t.currentTarget.value);
            },
            [e],
          ),
          i = (0, p.useCallback)(
            (t) => {
              "Enter" === t.key && e.setValue(t.currentTarget.value);
            },
            [e],
          );
        return f().createElement(Ct.AutoSizeInput, {
          id: n,
          placeholder: (0, Pe.t)(
            "grafana-scenes.variables.variable-value-input.placeholder-enter-value",
            "Enter value",
          ),
          minWidth: 15,
          maxWidth: 30,
          value: t,
          loading: r,
          onBlur: a,
          onKeyDown: i,
        });
      }
      pd.Component = ({ model: e }) => f().createElement(hn, { model: e });
      class fd extends P {
        constructor(e) {
          (super({ type: "textbox", value: "", name: "", ...e }),
            (this._urlSync = new se(this, { keys: () => this.getKeys() })));
        }
        getValue() {
          return this.state.value;
        }
        setValue(e) {
          e !== this.state.value &&
            (this.setState({ value: e }), this.publishEvent(new Oe(this), !0));
        }
        getKey() {
          return `var-${this.state.name}`;
        }
        getKeys() {
          return this.state.skipUrlSync ? [] : [this.getKey()];
        }
        getUrlState() {
          return this.state.skipUrlSync ? {} : { [this.getKey()]: this.state.value };
        }
        updateFromUrl(e) {
          const t = e[this.getKey()];
          "string" == typeof t && this.setValue(t);
        }
      }
      fd.Component = ({ model: e }) => f().createElement(hd, { model: e });
      class md extends P {
        constructor(e) {
          (super({
            type: "interval",
            value: "",
            intervals: ["1m", "10m", "30m", "1h", "6h", "12h", "1d", "7d", "14d", "30d"],
            name: "",
            autoStepCount: 30,
            autoMinInterval: "10s",
            autoEnabled: !1,
            refresh: rr.CO.onTimeRangeChanged,
            ...e,
          }),
            (this._onChange = (e) => {
              (this.setState({ value: e.value }), this.publishEvent(new Oe(this), !0));
            }),
            (this._urlSync = new se(this, { keys: () => [this.getKey()] })));
        }
        getKey() {
          return `var-${this.state.name}`;
        }
        getUrlState() {
          return { [this.getKey()]: this.state.value };
        }
        updateFromUrl(e) {
          const t = {},
            n = e[this.getKey()];
          ("string" == typeof n &&
            (n.startsWith("$__auto_interval_") ? (t.value = We) : (t.value = n)),
            this.setState(t));
        }
        getOptionsForSelect() {
          const { value: e, intervals: t, autoEnabled: n } = this.state;
          let r = t.map((e) => ({ value: e, label: e }));
          return (
            n && (r = [{ value: We, label: "Auto" }, ...r]),
            e && !r.some((t) => t.value === e) && r.push({ value: e, label: e }),
            r
          );
        }
        getValue() {
          const { value: e, autoStepCount: t, autoMinInterval: n } = this.state;
          return e === We ? this.getAutoRefreshInteval(t, n) : e;
        }
        getAutoRefreshInteval(e, t) {
          const n = ru.getTimeRange(this).state.value;
          return s.rangeUtil.calculateInterval(n, e, t).interval;
        }
        validateAndUpdate() {
          const { value: e, intervals: t } = this.state;
          let n = !1;
          if (e === We) n = !0;
          else if (!e && t.length > 0) {
            const e = t[0];
            (this.setState({ value: e }), (n = !0));
          }
          return (n && this.publishEvent(new Oe(this), !0), (0, m.of)({}));
        }
      }
      md.Component = ({ model: e }) => {
        const { key: t, value: n } = e.useState();
        return f().createElement(Ct.Select, {
          id: t,
          placeholder: (0, Pe.t)(
            "grafana-scenes.variables.interval-variable.placeholder-select-value",
            "Select value",
          ),
          width: "auto",
          value: n,
          tabSelectsValue: !1,
          options: e.getOptionsForSelect(),
          onChange: e._onChange,
        });
      };
      var gd,
        vd,
        bd = (e) => {
          throw TypeError(e);
        },
        yd = (e, t, n) => t.has(e) || bd("Cannot " + n),
        wd = (e, t, n) => (yd(e, t, "read from private field"), n ? n.call(e) : t.get(e)),
        Sd = (e, t, n) =>
          t.has(e)
            ? bd("Cannot add the same private member more than once")
            : t instanceof WeakSet
              ? t.add(e)
              : t.set(e, n),
        xd = (e, t, n, r) => (yd(e, t, "write to private field"), t.set(e, n), n);
      class _d extends s.BusEventWithPayload {}
      _d.type = "new-scene-object-added";
      class Cd {
        constructor(e = {}, t = l.locationService) {
          ((this._options = e),
            (this._locationService = t),
            (this._paramsCache = new Od(t)),
            (this._urlKeyMapper = new B({
              namespace: e.namespace,
              excludeFromNamespace: e.excludeFromNamespace,
            })));
        }
        initSync(e) {
          var t;
          if (
            (this._subs &&
              (G(0, 0, null == (t = this._sceneRoot) || t.state.key), this._subs.unsubscribe()),
            G(0, 0, e.state.key),
            (this._sceneRoot = e),
            (this._subs = new m.Subscription()),
            this._subs.add(
              e.subscribeToEvent(O, (e) => {
                this.handleSceneObjectStateChanged(e.payload.changedObject);
              }),
            ),
            this._subs.add(
              e.subscribeToEvent(_d, (e) => {
                this.handleNewObject(e.payload);
              }),
            ),
            this._urlKeyMapper.clear(),
            (this._lastLocation = this._locationService.getLocation()),
            this.handleNewObject(this._sceneRoot),
            this._options.updateUrlOnInit)
          ) {
            const t = $(e, this._urlKeyMapper.getOptions());
            (function (e, t) {
              for (let n in e) if (!U(t.getAll(n), e[n])) return !0;
              return !1;
            })(t, this._paramsCache.getParams()) && this._locationService.partial(t, !0);
          }
        }
        cleanUp(e) {
          this._sceneRoot === e &&
            (G(),
            this._subs &&
              (this._subs.unsubscribe(),
              (this._subs = void 0),
              G(0, 0, (this._sceneRoot.state.key, e.state.key))),
            (this._sceneRoot = void 0),
            (this._lastLocation = void 0));
        }
        handleNewLocation(e) {
          this._sceneRoot &&
            this._lastLocation !== e &&
            (G(),
            (this._lastLocation = e),
            W(this._sceneRoot, this._paramsCache.getParams(), this._urlKeyMapper));
        }
        handleNewObject(e) {
          this._sceneRoot && W(e, this._paramsCache.getParams(), this._urlKeyMapper);
        }
        handleSceneObjectStateChanged(e) {
          var t, n;
          if (!e.urlSync) return;
          const r = e.urlSync.getUrlState(),
            a = this._locationService.getSearch(),
            i = {};
          for (const [t, n] of Object.entries(r)) {
            const r = this._urlKeyMapper.getUniqueKey(t, e);
            U(a.getAll(r), n) || (i[r] = n);
          }
          if (Object.keys(i).length > 0) {
            const a =
              !0 !==
              (null == (n = (t = e.urlSync).shouldCreateHistoryStep) ? void 0 : n.call(t, r));
            (G(),
              this._locationService.partial(i, a),
              (this._lastLocation = this._locationService.getLocation()));
          }
        }
        getUrlState(e) {
          return $(e, this._urlKeyMapper.getOptions());
        }
      }
      class Od {
        constructor(e) {
          ((this.locationService = e), Sd(this, gd), Sd(this, vd));
        }
        getParams() {
          const e = this.locationService.getLocation();
          return (
            wd(this, vd) === e || (xd(this, vd, e), xd(this, gd, new URLSearchParams(e.search))),
            wd(this, gd)
          );
        }
      }
      function Rd(e, t = {}) {
        const n = (0, o.useLocation)(),
          r = Ze(),
          [a, i] = (0, p.useState)(!1),
          s = (function (e, t) {
            return (0, p.useMemo)(
              () =>
                new Cd(
                  {
                    updateUrlOnInit: e.updateUrlOnInit,
                    createBrowserHistorySteps: e.createBrowserHistorySteps,
                    namespace: e.namespace,
                    excludeFromNamespace: e.excludeFromNamespace,
                  },
                  t,
                ),
              [
                e.updateUrlOnInit,
                e.createBrowserHistorySteps,
                e.namespace,
                e.excludeFromNamespace,
                t,
              ],
            );
          })(t, r);
        return (
          (0, p.useEffect)(() => (s.initSync(e), i(!0), () => s.cleanUp(e)), [e, s]),
          (0, p.useEffect)(() => {
            const e = r.getLocation(),
              t = e !== n ? e : n;
            (e !== n && G(), s.handleNewLocation(t));
          }, [e, s, n, r]),
          a
        );
      }
      function kd({
        children: e,
        scene: t,
        updateUrlOnInit: n,
        createBrowserHistorySteps: r,
        namespace: a,
        excludeFromNamespace: i,
      }) {
        return Rd(t, {
          updateUrlOnInit: n,
          createBrowserHistorySteps: r,
          namespace: a,
          excludeFromNamespace: i,
        })
          ? e
          : null;
      }
      ((gd = new WeakMap()), (vd = new WeakMap()));
      class Ed extends P {
        constructor(e) {
          (super(e),
            this.addActivationHandler(() => {
              const e = (function (e) {
                const t = window.__grafanaSceneContext;
                return (
                  G(),
                  (window.__grafanaSceneContext = e),
                  () => {
                    window.__grafanaSceneContext === e && (G(), (window.__grafanaSceneContext = t));
                  }
                );
              })(this);
              return () => {
                e();
              };
            }));
        }
      }
      Ed.Component = function ({ model: e }) {
        const { body: t, controls: n } = e.useState(),
          r = (0, Ct.useStyles2)(Td);
        return f().createElement(
          "div",
          { className: r.container },
          n &&
            f().createElement(
              "div",
              { className: r.controls },
              n.map((e) => f().createElement(e.Component, { key: e.state.key, model: e })),
            ),
          f().createElement(
            "div",
            { className: r.body },
            f().createElement(t.Component, { model: t }),
          ),
        );
      };
      const Td = (e) => ({
        container: (0, Vt.css)({
          flexGrow: 1,
          display: "flex",
          gap: e.spacing(2),
          minHeight: "100%",
          flexDirection: "column",
        }),
        body: (0, Vt.css)({ flexGrow: 1, display: "flex", gap: e.spacing(1) }),
        controls: (0, Vt.css)({
          display: "flex",
          gap: e.spacing(2),
          alignItems: "flex-end",
          flexWrap: "wrap",
        }),
      });
      class Dd extends P {
        addItem(e) {
          this.setState({ items: this.state.items ? [...this.state.items, e] : [e] });
        }
        setItems(e) {
          this.setState({ items: e });
        }
      }
      function Pd(e, t, n) {
        (void 0 === t && (t = []), void 0 === n && (n = { loading: !1 }));
        var r,
          a,
          i = (0, p.useRef)(0),
          o =
            ((r = (0, p.useRef)(!1)),
            (a = (0, p.useCallback)(function () {
              return r.current;
            }, [])),
            (0, p.useEffect)(function () {
              return (
                (r.current = !0),
                function () {
                  r.current = !1;
                }
              );
            }, []),
            a),
          s = (0, p.useState)(n),
          l = s[0],
          u = s[1],
          c = (0, p.useCallback)(function () {
            for (var t = [], n = 0; n < arguments.length; n++) t[n] = arguments[n];
            var r = ++i.current;
            return (
              l.loading ||
                u(function (e) {
                  return Uu(Uu({}, e), { loading: !0 });
                }),
              e.apply(void 0, t).then(
                function (e) {
                  return (o() && r === i.current && u({ value: e, loading: !1 }), e);
                },
                function (e) {
                  return (o() && r === i.current && u({ error: e, loading: !1 }), e);
                },
              )
            );
          }, t);
        return [l, c];
      }
      async function Ad(e, t, n, r) {
        var a, i, o, s;
        const u = null == (a = e.request) ? void 0 : a.targets;
        if (!u) return "";
        const { from: c, to: d } = n,
          p = null == (i = e.request) ? void 0 : i.filters,
          h = { __sceneObject: Sn(t) },
          f = (
            await Promise.allSettled(
              u.map(async (e) => {
                var t;
                const n = await (0, l.getDataSourceSrv)().get(e.datasource);
                return (
                  (null == (t = n.interpolateVariablesInQueries)
                    ? void 0
                    : t.call(n, [e], null != h ? h : {}, p)[0]) || e
                );
              }),
            )
          )
            .filter((e) => "fulfilled" === e.status)
            .map((e) => e.value)
            .map((e) => {
              var t;
              return null != (t = null == r ? void 0 : r(e)) ? t : e;
            }),
          m = null != f ? f : [];
        let g =
          new Set(
            m.map((e) => {
              var t;
              return null == (t = e.datasource) ? void 0 : t.uid;
            }),
          ).size > 1
            ? "-- Mixed --"
            : null ==
                (s =
                  null ==
                  (o = m.find((e) => {
                    var t;
                    return !!(null == (t = e.datasource) ? void 0 : t.uid);
                  }))
                    ? void 0
                    : o.datasource)
              ? void 0
              : s.uid;
        if ((null == m ? void 0 : m.length) && g && c && d) {
          return `/explore?left=${encodeURIComponent(JSON.stringify({ datasource: g, queries: m, range: { from: c, to: d } }))}`;
        }
        return "";
      }
      Dd.Component = function ({ model: e }) {
        const { items: t = [] } = e.useState(),
          n = f().useRef(null);
        (0, p.useEffect)(() => {
          n.current && n.current.focus();
        }, []);
        const r = (e) =>
          e.map((e) => {
            switch (e.type) {
              case "divider":
                return f().createElement(Ct.Menu.Divider, { key: e.text });
              case "group":
                return f().createElement(
                  Ct.Menu.Group,
                  { key: e.text, label: e.text },
                  e.subMenu ? r(e.subMenu) : void 0,
                );
              default:
                return f().createElement(Ct.Menu.Item, {
                  key: e.text,
                  role: "menuitem",
                  label: e.text,
                  icon: e.iconClassName,
                  childItems: e.subMenu ? r(e.subMenu) : void 0,
                  url: e.href,
                  onClick: e.onClick,
                  shortcut: e.shortcut,
                  testId: It.components.Panels.Panel.menuItems(e.text),
                });
            }
          });
        return f().createElement(Ct.Menu, { ref: n }, r(t));
      };
      class Id extends P {
        constructor(e = {}) {
          super({ options: e });
        }
      }
      Id.Component = function ({ model: e }) {
        const { options: t } = e.useState(),
          { data: n } = ru.getData(e).useState(),
          { from: r, to: a } = ru.getTimeRange(e).useState(),
          { value: i } = (function (e, t) {
            void 0 === t && (t = []);
            var n = Pd(e, t, { loading: !0 }),
              r = n[0],
              a = n[1];
            return (
              (0, p.useEffect)(
                function () {
                  a();
                },
                [a],
              ),
              r
            );
          })(async () => (n ? Ad(n, e, { from: r, to: a }, t.transform) : ""), [n, e, r, a]),
          o = (0, l.useReturnToPrevious)();
        if (i)
          return f().createElement(
            Ct.LinkButton,
            {
              key: "explore",
              icon: "compass",
              size: "sm",
              variant: "secondary",
              href: i,
              onClick: () => {
                var e;
                (t.returnToPrevious && o(t.returnToPrevious.title, t.returnToPrevious.href),
                  null == (e = t.onClick) || e.call(t));
              },
            },
            f().createElement(
              Pe.x6,
              { i18nKey: "grafana-scenes.components.viz-panel-explore-button.explore" },
              "Explore",
            ),
          );
        return null;
      };
      class Vd extends P {}
      function Md(e) {
        return e instanceof Kd;
      }
      Vd.Component = function ({ model: e }) {
        const { body: t } = e.useState(),
          n = e.parent;
        if (n && ((r = n), !(r instanceof Ud)) && !Md(n))
          throw new Error("SceneGridItem must be a child of SceneGridLayout or SceneGridRow");
        var r;
        if (!t) return null;
        return f().createElement(t.Component, { model: t });
      };
      var Ld = n(2548),
        Fd = n.n(Ld);
      const jd = (0, Vt.css)({ flex: "1 1 auto", position: "relative", zIndex: 1, width: "100%" }),
        Nd = f().forwardRef((e, t) => {
          var n;
          const {
              grid: r,
              layoutItem: a,
              index: i,
              totalCount: o,
              isLazy: s,
              style: l,
              onLoad: u,
              onChange: c,
              children: d,
              ...p
            } = e,
            h = r.getSceneLayoutChild(a.i),
            m = null == (n = h.getClassName) ? void 0 : n.call(h),
            g = f().createElement(h.Component, { model: h, key: h.state.key });
          return s
            ? f().createElement(
                Bn,
                {
                  ...p,
                  key: h.state.key,
                  "data-griditem-key": h.state.key,
                  className: (0, Vt.cx)(m, e.className),
                  style: l,
                  ref: t,
                },
                g,
                d,
              )
            : f().createElement(
                "div",
                {
                  ...p,
                  ref: t,
                  key: h.state.key,
                  "data-griditem-key": h.state.key,
                  className: (0, Vt.cx)(m, e.className),
                  style: l,
                },
                g,
                d,
              );
        });
      function Bd(e, t, n) {
        e.current
          ? t
            ? e.current.classList.add("react-grid-layout--enable-move-animations")
            : e.current.classList.remove("react-grid-layout--enable-move-animations")
          : n || setTimeout(() => Bd(e, t, !0), 50);
      }
      Nd.displayName = "GridItemWrapper";
      const zd = f().forwardRef(({ handleAxis: e, ...t }, n) => {
        const r = (0, Ct.useStyles2)($d);
        return f().createElement(
          "div",
          { ref: n, ...t, className: `${r} scene-resize-handle` },
          f().createElement(
            "svg",
            {
              width: "16px",
              height: "16px",
              viewBox: "0 0 24 24",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
            },
            f().createElement("path", {
              d: "M21 15L15 21M21 8L8 21",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }),
          ),
        );
      });
      function $d(e) {
        return (0, Vt.css)({
          position: "absolute",
          bottom: 0,
          right: 0,
          zIndex: 999,
          padding: e.spacing(1.5, 0, 0, 1.5),
          color: e.colors.border.strong,
          cursor: "se-resize",
          "&:hover": { color: e.colors.text.link },
          svg: { display: "block" },
          ".react-resizable-hide &": { display: "none" },
        });
      }
      zd.displayName = "ResizeHandle";
      class Wd extends s.BusEventWithPayload {}
      Wd.type = "scene-grid-layout-drag-start";
      const Hd = class e extends P {
        constructor(e) {
          (super({ ...e, children: Gd(e.children) }),
            (this._skipOnLayoutChange = !1),
            (this._oldLayout = []),
            (this._loadOldLayout = !1),
            (this.onLayoutChange = (e) => {
              if (this._skipOnLayoutChange) this._skipOnLayoutChange = !1;
              else {
                this._loadOldLayout && ((e = [...this._oldLayout]), (this._loadOldLayout = !1));
                for (const t of e) {
                  const e = this.getSceneLayoutChild(t.i),
                    n = { x: t.x, y: t.y, width: t.w, height: t.h };
                  qd(e.state, n) || e.setState({ ...n });
                }
                this.setState({ children: Gd(this.state.children) });
              }
            }),
            (this.onResizeStop = (e, t, n) => {
              this.getSceneLayoutChild(n.i).setState({ width: n.w, height: n.h });
            }),
            (this.onDragStart = (e) => {
              this._oldLayout = [...e];
            }),
            (this.onDragStop = (e, t, n) => {
              const r = this.getSceneLayoutChild(n.i),
                a = (e = Qd(e)).findIndex((e) => e.i === n.i);
              let i = this.findGridItemSceneParent(e, a - 1),
                o = this.state.children;
              for (let t = 0; t < e.length; t++) {
                const n = e[t],
                  r = this.getSceneLayoutChild(n.i),
                  a = r.state;
                ((null == a ? void 0 : a.x) === n.x && (null == a ? void 0 : a.y) === n.y) ||
                  r.setState({ x: n.x, y: n.y });
              }
              (i instanceof Kd && Xe(i) && (this._loadOldLayout = !0),
                r instanceof Kd &&
                  i instanceof Kd &&
                  (this.isRowDropValid(e, n, a) || (this._loadOldLayout = !0), (i = this)),
                i === r.parent || this._loadOldLayout || (o = this.moveChildTo(r, i)),
                this.setState({ children: Gd(o) }),
                (this._skipOnLayoutChange = !0));
            }));
        }
        isDraggable() {
          var e;
          return null != (e = this.state.isDraggable) && e;
        }
        getDragClass() {
          return `grid-drag-handle-${this.state.key}`;
        }
        getDragClassCancel() {
          return "grid-drag-cancel";
        }
        getDragHooks() {
          return {
            onDragStart: (e, t) => {
              this.publishEvent(new Wd({ evt: e, panel: t }), !0);
            },
          };
        }
        adjustYPositions(e, t) {
          for (const n of this.state.children)
            if ((n.state.y > e && n.setState({ y: n.state.y + t }), n instanceof Kd))
              for (const r of n.state.children) r.state.y > e && r.setState({ y: r.state.y + t });
        }
        toggleRow(e) {
          var t, n;
          if (!e.state.isCollapsed)
            return (e.setState({ isCollapsed: !0 }), void this.setState({}));
          const r = e.state.children;
          if (0 === r.length) return (e.setState({ isCollapsed: !1 }), void this.setState({}));
          const a = e.state.y,
            i = (null != (t = r[0].state.y) ? t : a) - (a + 1);
          let o = a;
          for (const e of r) {
            const t = { ...e.state };
            ((t.y = null != (n = t.y) ? n : a),
              (t.y -= i),
              t.y !== e.state.y && e.setState(t),
              (o = Math.max(o, Number(t.y) + Number(t.height))));
          }
          const s = o - a - 1;
          for (const t of this.state.children)
            if ((t.state.y > a && this.pushChildDown(t, s), Md(t) && t !== e))
              for (const e of t.state.children) e.state.y > a && this.pushChildDown(e, s);
          (e.setState({ isCollapsed: !1 }), this.setState({}));
        }
        ignoreLayoutChange(e) {
          this._skipOnLayoutChange = e;
        }
        getSceneLayoutChild(e) {
          for (const t of this.state.children) {
            if (t.state.key === e) return t;
            if (t instanceof Kd) for (const n of t.state.children) if (n.state.key === e) return n;
          }
          throw new Error("Scene layout child not found for GridItem");
        }
        pushChildDown(e, t) {
          e.setState({ y: e.state.y + t });
        }
        findGridItemSceneParent(e, t) {
          for (let n = t; n >= 0; n--) {
            const t = e[n],
              r = this.getSceneLayoutChild(t.i);
            if (r instanceof Kd) return r.state.isCollapsed ? this : r;
          }
          return this;
        }
        isRowDropValid(t, n, r) {
          if (t[t.length - 1].i === n.i) return !0;
          const a = this.getSceneLayoutChild(t[r + 1].i);
          return a instanceof Kd || a.parent instanceof e;
        }
        moveChildTo(t, n) {
          const r = t.parent;
          let a = this.state.children;
          const i = t.clone({ key: t.state.key });
          if (r instanceof Kd) {
            const e = r.clone();
            if (
              (e.setState({
                children: e.state.children.filter((e) => e.state.key !== t.state.key),
              }),
              (a = a.map((t) => (t === r ? e : t))),
              n instanceof Kd)
            ) {
              const e = n.clone();
              (e.setState({ children: [...e.state.children, i] }),
                (a = a.map((t) => (t === n ? e : t))));
            } else a = [...a, i];
          } else if (!(n instanceof e)) {
            a = a.filter((e) => e.state.key !== t.state.key);
            const e = n.clone();
            (e.setState({ children: [...e.state.children, i] }),
              (a = a.map((t) => (t === n ? e : t))));
          }
          return a;
        }
        toGridCell(e) {
          const t = e.state;
          let n = Number.isFinite(Number(t.x)) ? Number(t.x) : 0,
            r = Number.isFinite(Number(t.y)) ? Number(t.y) : 0;
          const a = Number.isFinite(Number(t.width)) ? Number(t.width) : 4,
            i = Number.isFinite(Number(t.height)) ? Number(t.height) : 4;
          let o = e.state.isDraggable,
            s = e.state.isResizable;
          return (
            e instanceof Kd && ((o = !!e.state.isCollapsed), (s = !1)),
            Xe(e) && ((o = !1), (s = !1)),
            { i: e.state.key, x: n, y: r, h: i, w: a, isResizable: s, isDraggable: o }
          );
        }
        buildGridLayout(e, t) {
          let n = [];
          for (const e of this.state.children)
            if ((n.push(this.toGridCell(e)), e instanceof Kd && !e.state.isCollapsed))
              for (const t of e.state.children) n.push(this.toGridCell(t));
          return (
            (n = Qd(n)),
            this.state.UNSAFE_fitPanels &&
              (n = (function (e, t) {
                const n = t - 32,
                  r = Math.max(...e.map((e) => e.h + e.y)) / Math.floor(n / 38);
                return e.map((e) => ({
                  ...e,
                  y: Math.round(e.y / r) || 0,
                  h: Math.round(e.h / r) || 1,
                }));
              })(n, t)),
            e < 768
              ? ((this._skipOnLayoutChange = !0), n.map((e) => ({ ...e, w: 24 })))
              : ((this._skipOnLayoutChange = !1), n)
          );
        }
      };
      Hd.Component = function ({ model: e }) {
        const { children: t, isLazy: n, isDraggable: r, isResizable: a } = e.useState(),
          [i, { width: o, height: s }] = Mn(),
          l = (0, p.useRef)(null);
        return (
          (0, p.useEffect)(() => {
            Bd(l, !!r);
          }, [r]),
          (function (e) {
            if (
              e.some(
                (e) =>
                  void 0 === e.state.height ||
                  void 0 === e.state.width ||
                  void 0 === e.state.x ||
                  void 0 === e.state.y,
              )
            )
              throw new Error("All children must have a size specified");
          })(t),
          f().createElement(
            "div",
            { ref: i, className: jd },
            ((t, i) => {
              if (!t || !i) return null;
              const o = e.buildGridLayout(t, i);
              return f().createElement(
                "div",
                {
                  ref: l,
                  style: { width: `${t}px`, height: "100%" },
                  className: "react-grid-layout",
                },
                f().createElement(
                  Fd(),
                  {
                    width: t,
                    isDraggable: r && t > 768,
                    isResizable: null != a && a,
                    containerPadding: [0, 0],
                    useCSSTransforms: !0,
                    margin: [8, 8],
                    cols: 24,
                    rowHeight: 30,
                    draggableHandle: `.grid-drag-handle-${e.state.key}`,
                    draggableCancel: ".grid-drag-cancel",
                    layout: o,
                    onDragStart: e.onDragStart,
                    onDragStop: e.onDragStop,
                    onResizeStop: e.onResizeStop,
                    onLayoutChange: e.onLayoutChange,
                    isBounded: !1,
                    resizeHandle: f().createElement(zd, null),
                  },
                  o.map((t, r) =>
                    f().createElement(Nd, {
                      key: t.i,
                      grid: e,
                      layoutItem: t,
                      index: r,
                      isLazy: n,
                      totalCount: o.length,
                    }),
                  ),
                ),
              );
            })(o, s),
          )
        );
      };
      let Ud = Hd;
      function qd(e, t) {
        return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
      }
      function Gd(e) {
        return (
          e.forEach((e) => {
            e instanceof Kd && e.setState({ children: Gd(e.state.children) });
          }),
          [...e].sort((e, t) => e.state.y - t.state.y || e.state.x - t.state.x)
        );
      }
      function Qd(e) {
        return [...e].sort((e, t) => e.y - t.y || e.x - t.x);
      }
      class Kd extends P {
        constructor(e) {
          (super({
            children: e.children || [],
            isCollapsible: e.isCollapsible || !0,
            title: e.title || "",
            ...e,
            x: 0,
            height: 1,
            width: 24,
          }),
            (this._variableDependency = new Pl(this, {
              statePaths: ["title"],
              handleTimeMacros: !0,
            })),
            (this.onCollapseToggle = () => {
              this.state.isCollapsible && this.getGridLayout().toggleRow(this);
            }));
        }
        getGridLayout() {
          const e = this.parent;
          if (!(e && e instanceof Ud))
            throw new Error("SceneGridRow must be a child of SceneGridLayout");
          return e;
        }
        getUrlState() {
          return { rowc: this.state.isCollapsed ? "1" : "0" };
        }
        updateFromUrl(e) {
          null != e.rowc && e.rowc !== this.getUrlState().rowc && this.onCollapseToggle();
        }
        getPanelCount(e) {
          var t;
          let n = 0;
          for (const r of e) n += (null == (t = r.getChildCount) ? void 0 : t.call(r)) || 1;
          return n;
        }
      }
      Kd.Component = function ({ model: e }) {
        const t = (0, Ct.useStyles2)(Yd),
          { isCollapsible: n, isCollapsed: r, title: a, actions: i, children: o } = e.useState(),
          s = e.getGridLayout(),
          l = s.getDragClass(),
          u = s.isDraggable() && !Xe(e),
          c = e.getPanelCount(o),
          d = 1 === c ? "panel" : "panels";
        return f().createElement(
          "div",
          { className: (0, Vt.cx)(t.row, r && t.rowCollapsed) },
          f().createElement(
            "div",
            { className: t.rowTitleAndActionsGroup },
            f().createElement(
              "button",
              {
                onClick: e.onCollapseToggle,
                className: t.rowTitleButton,
                "aria-label": r
                  ? (0, Pe.t)("grafana-scenes.components.scene-grid-row.expand-row", "Expand row")
                  : (0, Pe.t)(
                      "grafana-scenes.components.scene-grid-row.collapse-row",
                      "Collapse row",
                    ),
                "data-testid": It.components.DashboardRow.title(
                  ru.interpolate(e, a, void 0, "text"),
                ),
              },
              n && f().createElement(Ct.Icon, { name: r ? "angle-right" : "angle-down" }),
              f().createElement(
                "span",
                { className: t.rowTitle, role: "heading" },
                ru.interpolate(e, a, void 0, "text"),
              ),
            ),
            f().createElement(
              "span",
              { className: (0, Vt.cx)(t.panelCount, r && t.panelCountCollapsed) },
              "(",
              c,
              " ",
              d,
              ")",
            ),
            i &&
              f().createElement(
                "div",
                { className: t.rowActions },
                f().createElement(i.Component, { model: i }),
              ),
          ),
          u &&
            r &&
            f().createElement(
              "div",
              { className: (0, Vt.cx)(t.dragHandle, l) },
              f().createElement(Ct.Icon, { name: "draggabledots" }),
            ),
        );
      };
      const Yd = (e) => ({
        row: (0, Vt.css)({
          width: "100%",
          height: "30px",
          display: "flex",
          justifyContent: "space-between",
          gap: e.spacing(1),
        }),
        rowTitleButton: (0, Vt.css)({
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          background: "transparent",
          border: "none",
          minWidth: 0,
          gap: e.spacing(1),
        }),
        rowCollapsed: (0, Vt.css)({ borderBottom: `1px solid ${e.colors.border.weak}` }),
        rowTitle: (0, Vt.css)({
          fontSize: e.typography.h5.fontSize,
          fontWeight: e.typography.fontWeightMedium,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          flexGrow: 1,
          minWidth: 0,
        }),
        collapsedInfo: (0, Vt.css)({
          fontSize: e.typography.bodySmall.fontSize,
          color: e.colors.text.secondary,
          display: "flex",
          alignItems: "center",
          flexGrow: 1,
        }),
        rowTitleAndActionsGroup: (0, Vt.css)({
          display: "flex",
          minWidth: 0,
          "&:hover, &:focus-within": { "& > div": { opacity: 1 } },
        }),
        rowActions: (0, Vt.css)({
          display: "flex",
          whiteSpace: "nowrap",
          opacity: 0,
          transition: "200ms opacity ease-in 200ms",
          "&:hover, &:focus-within": { opacity: 1 },
        }),
        dragHandle: (0, Vt.css)({
          display: "flex",
          padding: e.spacing(0, 1),
          alignItems: "center",
          justifyContent: "flex-end",
          cursor: "move",
          color: e.colors.text.secondary,
          "&:hover": { color: e.colors.text.primary },
        }),
        panelCount: (0, Vt.css)({
          whiteSpace: "nowrap",
          paddingLeft: e.spacing(2),
          color: e.colors.text.secondary,
          fontStyle: "italic",
          fontSize: e.typography.size.sm,
          fontWeight: "normal",
          display: "none",
          lineHeight: "30px",
        }),
        panelCountCollapsed: (0, Vt.css)({ display: "inline-block" }),
      });
      class Zd extends P {
        constructor() {
          (super(...arguments),
            (this.onToggle = () => {
              this.setState({ isCollapsed: !this.state.isCollapsed });
            }),
            (this.onRemove = () => {
              const e = this.parent;
              "body" in e.state && e.setState({ body: void 0 });
            }));
        }
      }
      Zd.Component = function ({ model: e }) {
        const {
            title: t,
            isCollapsed: n,
            canCollapse: r,
            canRemove: a,
            body: i,
            controls: o,
          } = e.useState(),
          s = (0, Ct.useStyles2)(Yd),
          l = (0, Ct.useStyles2)(Xd),
          u = (null != o ? o : []).map((e) =>
            f().createElement(e.Component, { key: e.state.key, model: e }),
          );
        a &&
          u.push(
            f().createElement(Ct.ToolbarButton, {
              icon: "times",
              variant: "default",
              onClick: e.onRemove,
              key: "remove-button",
              "aria-label": (0, Pe.t)(
                "grafana-scenes.components.nested-scene-renderer.remove-button-label",
                "Remove scene",
              ),
            }),
          );
        return f().createElement(
          "div",
          { className: l.wrapper },
          f().createElement(
            "div",
            { className: (0, Vt.cx)(l.row, n && l.rowCollapsed) },
            f().createElement(
              "button",
              {
                onClick: e.onToggle,
                className: s.rowTitleButton,
                "aria-label": n
                  ? (0, Pe.t)(
                      "grafana-scenes.components.nested-scene-renderer.expand-button-label",
                      "Expand scene",
                    )
                  : (0, Pe.t)(
                      "grafana-scenes.components.nested-scene-renderer.collapse-button-label",
                      "Collapse scene",
                    ),
              },
              r && f().createElement(Ct.Icon, { name: n ? "angle-right" : "angle-down" }),
              f().createElement(
                "span",
                { className: s.rowTitle, role: "heading" },
                ru.interpolate(e, t, void 0, "text"),
              ),
            ),
            f().createElement("div", { className: l.actions }, u),
          ),
          !n && f().createElement(i.Component, { model: i }),
        );
      };
      const Xd = (e) => ({
        wrapper: (0, Vt.css)({
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          gap: e.spacing(1),
        }),
        row: (0, Vt.css)({
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          gap: e.spacing(1),
        }),
        rowCollapsed: (0, Vt.css)({
          borderBottom: `1px solid ${e.colors.border.weak}`,
          paddingBottom: e.spacing(1),
        }),
        actions: (0, Vt.css)({
          display: "flex",
          alignItems: "center",
          gap: e.spacing(1),
          justifyContent: "flex-end",
          flexGrow: 1,
        }),
      });
      class Jd extends P {
        constructor() {
          (super(...arguments),
            (this._variableDependency = new Pl(this, { statePaths: ["text"] })));
        }
      }
      Jd.Component = function ({ model: e }) {
        const { text: t, fontSize: n = 20, align: r = "left", key: a, spacing: i } = e.useState(),
          o = (0, Ct.useTheme2)(),
          s = (0, Vt.css)({
            fontSize: n,
            display: "flex",
            flexGrow: 1,
            alignItems: "center",
            padding: i ? o.spacing(i, 0) : void 0,
            justifyContent: r,
          });
        return f().createElement("div", { className: s, "data-testid": a }, ru.interpolate(e, t));
      };
      class ep extends P {}
      ep.Component = ({ model: e }) => {
        const t = e.useState();
        return f().createElement(Ct.ToolbarButton, { onClick: t.onClick, icon: t.icon });
      };
      class tp extends P {}
      tp.Component = ({ model: e }) => {
        const t = e.useState();
        return f().createElement(
          "div",
          { style: { display: "flex" } },
          t.label && f().createElement(br, { label: t.label }),
          f().createElement(Ct.Input, {
            defaultValue: t.value,
            width: 8,
            onBlur: (t) => {
              e.state.onChange(parseInt(t.currentTarget.value, 10));
            },
          }),
        );
      };
      const np = function (e, t, n) {
        if (!An) return [t, Pn, Pn];
        if (!e) throw new Error("useLocalStorage key may not be falsy");
        var r = n
            ? n.raw
              ? function (e) {
                  return e;
                }
              : n.deserializer
            : JSON.parse,
          a = (0, p.useRef)(function (e) {
            try {
              var a = n ? (n.raw ? String : n.serializer) : JSON.stringify,
                i = localStorage.getItem(e);
              return null !== i ? r(i) : (t && localStorage.setItem(e, a(t)), t);
            } catch (e) {
              return t;
            }
          }),
          i = (0, p.useState)(function () {
            return a.current(e);
          }),
          o = i[0],
          s = i[1];
        (0, p.useLayoutEffect)(
          function () {
            return s(a.current(e));
          },
          [e],
        );
        var l = (0, p.useCallback)(
            function (t) {
              try {
                var a = "function" == typeof t ? t(o) : t;
                if (void 0 === a) return;
                var i = void 0;
                ((i = n
                  ? n.raw
                    ? "string" == typeof a
                      ? a
                      : JSON.stringify(a)
                    : n.serializer
                      ? n.serializer(a)
                      : JSON.stringify(a)
                  : JSON.stringify(a)),
                  localStorage.setItem(e, i),
                  s(r(i)));
              } catch (e) {}
            },
            [e, s],
          ),
          u = (0, p.useCallback)(
            function () {
              try {
                (localStorage.removeItem(e), s(void 0));
              } catch (e) {}
            },
            [e, s],
          );
        return [o, l, u];
      };
      class rp extends P {
        constructor() {
          (super(...arguments),
            (this.onZoom = () => {
              const e = ru.getTimeRange(this),
                t = (function (e, t) {
                  const n = e.to.valueOf() - e.from.valueOf(),
                    r = e.to.valueOf() - n / 2,
                    a = 0 === n ? 3e4 : n * t,
                    i = r + a / 2,
                    o = r - a / 2;
                  return {
                    from: (0, s.toUtc)(o),
                    to: (0, s.toUtc)(i),
                    raw: { from: (0, s.toUtc)(o), to: (0, s.toUtc)(i) },
                  };
                })(e.state.value, 2);
              e.onTimeRangeChange(t);
            }),
            (this.onChangeFiscalYearStartMonth = (e) => {
              ru.getTimeRange(this).setState({ fiscalYearStartMonth: e });
            }),
            (this.toAbsolute = () => {
              const e = ru.getTimeRange(this),
                t = e.state.value,
                n = (0, s.toUtc)(t.from),
                r = (0, s.toUtc)(t.to);
              e.onTimeRangeChange({ from: n, to: r, raw: { from: n, to: r } });
            }),
            (this.onMoveBackward = () => {
              const e = ru.getTimeRange(this),
                {
                  state: { value: t },
                } = e;
              e.onTimeRangeChange(ap(0, t));
            }),
            (this.onMoveForward = () => {
              const e = ru.getTimeRange(this),
                {
                  state: { value: t },
                } = e;
              e.onTimeRangeChange(ap(1, t, Date.now()));
            }));
        }
      }
      function ap(e, t, n) {
        const r = t.to.valueOf(),
          a = t.from.valueOf(),
          i = (r - a) / 2;
        let o, l;
        0 === e
          ? ((o = a - i), (l = r - i))
          : ((o = a + i), (l = r + i), void 0 !== n && l > n && r < n && ((l = n), (o = a)));
        const u = (0, s.toUtc)(o),
          c = (0, s.toUtc)(l);
        return { from: u, to: c, raw: { from: u, to: c } };
      }
      rp.Component = function ({ model: e }) {
        const {
            hidePicker: t,
            isOnCanvas: n,
            quickRanges: r,
            defaultQuickRanges: a,
          } = e.useState(),
          i = ru.getTimeRange(e),
          o = i.getTimeZone(),
          l = i.useState(),
          [u, c] = np(ip, [], { raw: !1, serializer: sp, deserializer: op });
        if (t) return null;
        const d = r || a,
          p = (l.value.to.valueOf() - l.value.from.valueOf()) / 2,
          h = (0, s.intervalToAbbreviatedDurationString)({
            start: new Date(l.value.from.valueOf()),
            end: new Date(l.value.from.valueOf() + p),
          }),
          m = l.value.to.valueOf() + p <= Date.now() ? h : void 0;
        return f().createElement(Ct.TimeRangePicker, {
          isOnCanvas: null == n || n,
          value: l.value,
          onChange: (e) => {
            var t;
            ((t = e),
              ((0, s.isDateTime)(t.raw.from) || (0, s.isDateTime)(t.raw.to)) &&
                c([e, ...(null != u ? u : [])]),
              i.onTimeRangeChange(e));
          },
          timeZone: o,
          fiscalYearStartMonth: l.fiscalYearStartMonth,
          onMoveBackward: e.onMoveBackward,
          onMoveForward: e.onMoveForward,
          moveForwardTooltip: m
            ? (0, Pe.t)(
                "grafana-scenes.components.time-picker.move-forward-tooltip",
                "Move {{moveForwardDuration}} forward",
                { moveForwardDuration: m },
              )
            : void 0,
          moveBackwardTooltip: (0, Pe.t)(
            "grafana-scenes.components.time-picker.move-backward-tooltip",
            "Move {{moveBackwardDuration}} backward",
            { moveBackwardDuration: h },
          ),
          onZoom: e.onZoom,
          onChangeTimeZone: i.onTimeZoneChange,
          onChangeFiscalYearStartMonth: e.onChangeFiscalYearStartMonth,
          weekStart: l.weekStart,
          history: u,
          quickRanges: d,
        });
      };
      const ip = "grafana.dashboard.timepicker.history";
      function op(e) {
        return JSON.parse(e).map((e) =>
          s.rangeUtil.convertRawToRange(e, "utc", void 0, "YYYY-MM-DD HH:mm:ss"),
        );
      }
      function sp(e) {
        return JSON.stringify(
          ((t = e.map((e) => ({
            from: "string" == typeof e.raw.from ? e.raw.from : e.raw.from.toISOString(),
            to: "string" == typeof e.raw.to ? e.raw.to : e.raw.to.toISOString(),
          }))),
          (0, V.uniqBy)(t, (e) => e.from + e.to).slice(0, 4)),
        );
        var t;
      }
      const lp = ["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h", "2h", "1d"];
      class up extends P {
        constructor(e) {
          var t, n, r;
          (super({
            refresh: "",
            ...e,
            autoValue: void 0,
            autoEnabled: null == (t = e.autoEnabled) || t,
            autoMinInterval: null != (n = e.autoMinInterval) ? n : l.config.minRefreshInterval,
            intervals: (null != (r = e.intervals) ? r : lp).filter((t) => {
              var n;
              const r = null != (n = e.minRefreshInterval) ? n : l.config.minRefreshInterval;
              try {
                return !r || s.rangeUtil.intervalToMs(t) >= s.rangeUtil.intervalToMs(r);
              } catch (e) {
                return !1;
              }
            }),
          }),
            (this._urlSync = new se(this, { keys: ["refresh"] })),
            (this._autoRefreshBlocked = !1),
            (this.onRefresh = () => {
              const e = ru.getQueryController(this);
              if (null == e ? void 0 : e.state.isRunning)
                return (e.cancelAll(), void e.cancelProfile());
              null == e || e.startProfile(fe);
              const t = ru.getTimeRange(this);
              (this._intervalTimer && clearInterval(this._intervalTimer),
                t.onRefresh(),
                this.setupIntervalTimer());
            }),
            (this.onIntervalChanged = (e) => {
              (this.setState({ refresh: e }), this.setupIntervalTimer());
            }),
            (this.setupAutoTimeRangeListener = () =>
              ru.getTimeRange(this).subscribeToState((e, t) => {
                (e.from === t.from && e.to === t.to) || this.setupIntervalTimer();
              })),
            (this.calculateAutoRefreshInterval = () => {
              var e;
              const t = ru.getTimeRange(this),
                n = null != (e = null == window ? void 0 : window.innerWidth) ? e : 2e3;
              return s.rangeUtil.calculateInterval(t.state.value, n, this.state.autoMinInterval);
            }),
            (this.setupIntervalTimer = () => {
              var e;
              const t = ru.getTimeRange(this),
                { refresh: n, intervals: r } = this.state;
              if (
                ((this._intervalTimer || "" === n) && clearInterval(this._intervalTimer), "" === n)
              )
                return;
              if (n !== Ct.RefreshPicker.autoOption.value && r && !r.includes(n)) return;
              let a;
              if (
                (null == (e = this._autoTimeRangeListener) || e.unsubscribe(),
                n === Ct.RefreshPicker.autoOption.value)
              ) {
                const e = this.calculateAutoRefreshInterval();
                ((a = e.intervalMs),
                  (this._autoTimeRangeListener = this.setupAutoTimeRangeListener()),
                  e.interval !== this.state.autoValue && this.setState({ autoValue: e.interval }));
              } else a = s.rangeUtil.intervalToMs(n);
              this._intervalTimer = setInterval(() => {
                if (this.isTabVisible()) {
                  const e = ru.getQueryController(this);
                  ((null == e ? void 0 : e.state.isRunning) && e.cancelProfile(),
                    null == e || e.startProfile(fe),
                    t.onRefresh());
                } else this._autoRefreshBlocked = !0;
              }, a);
            }),
            this.addActivationHandler(() => {
              this.setupIntervalTimer();
              const e = () => {
                this._autoRefreshBlocked &&
                  "visible" === document.visibilityState &&
                  ((this._autoRefreshBlocked = !1), this.onRefresh());
              };
              return (
                document.addEventListener("visibilitychange", e),
                () => {
                  var t;
                  (this._intervalTimer && clearInterval(this._intervalTimer),
                    document.removeEventListener("visibilitychange", e),
                    null == (t = this._autoTimeRangeListener) || t.unsubscribe());
                }
              );
            }));
        }
        getUrlState() {
          let e = this.state.refresh;
          return (("string" == typeof e && 0 !== e.length) || (e = void 0), { refresh: e });
        }
        updateFromUrl(e) {
          const { intervals: t } = this.state;
          let n = e.refresh;
          "string" == typeof n &&
            (function (e) {
              try {
                return s.rangeUtil.describeInterval(e).count > 0;
              } catch (e) {
                return !1;
              }
            })(n) &&
            ((null == t ? void 0 : t.includes(n))
              ? this.setState({ refresh: n })
              : this.setState({ refresh: t ? t[0] : void 0 }));
        }
        isTabVisible() {
          return void 0 === document.visibilityState || "visible" === document.visibilityState;
        }
      }
      up.Component = function ({ model: e }) {
        var t;
        const {
            refresh: n,
            intervals: r,
            autoEnabled: a,
            autoValue: i,
            isOnCanvas: o,
            primary: s,
            withText: l,
          } = e.useState(),
          u = (function (e) {
            const t = ru.getQueryController(e);
            if (!t) return !1;
            return t.useState().isRunning;
          })(e);
        let c,
          d,
          p =
            n === (null == (t = Ct.RefreshPicker.autoOption) ? void 0 : t.value)
              ? i
              : l
                ? (0, Pe.t)(
                    "grafana-scenes.components.scene-refresh-picker.text-refresh",
                    "Refresh",
                  )
                : void 0;
        u &&
          ((c = (0, Pe.t)(
            "grafana-scenes.components.scene-refresh-picker.tooltip-cancel",
            "Cancel all queries",
          )),
          l &&
            (p = (0, Pe.t)(
              "grafana-scenes.components.scene-refresh-picker.text-cancel",
              "Cancel",
            )));
        l && (d = "96px");
        return f().createElement(Ct.RefreshPicker, {
          showAutoInterval: a,
          value: n,
          intervals: r,
          tooltip: c,
          width: d,
          text: p,
          onRefresh: () => {
            e.onRefresh();
          },
          primary: s,
          onIntervalChanged: e.onIntervalChanged,
          isLoading: u,
          isOnCanvas: null == o || o,
        });
      };
      const cp = (e) => `${e}-compare`,
        dp = "__previousPeriod",
        pp = "__noPeriod",
        hp = { label: "Previous period", value: dp },
        fp = { label: "None", value: pp },
        mp = [
          { label: "Day before", value: "24h" },
          { label: "Week before", value: "1w" },
          { label: "Month before", value: "1M" },
        ];
      class gp extends P {
        constructor(e) {
          (super({ compareOptions: mp, ...e }),
            (this._urlSync = new se(this, { keys: ["compareWith"] })),
            (this._onActivate = () => {
              const e = ru.getTimeRange(this);
              (this.setState({ compareOptions: this.getCompareOptions(e.state.value) }),
                this._subs.add(
                  e.subscribeToState((e) => {
                    const t = this.getCompareOptions(e.value),
                      n = { compareOptions: t };
                    (Boolean(this.state.compareWith) &&
                      !t.find(({ value: e }) => e === this.state.compareWith) &&
                      (n.compareWith = dp),
                      this.setState(n));
                  }),
                ));
            }),
            (this.getCompareOptions = (e) => {
              const t = Math.ceil(e.to.diff(e.from)),
                n = mp.findIndex(({ value: e }) => s.rangeUtil.intervalToMs(e) >= t);
              return [
                fp,
                hp,
                ...mp.slice(n).map(({ label: e, value: t }) => ({ label: e, value: t })),
              ];
            }),
            (this.onCompareWithChanged = (e) => {
              e === pp ? this.onClearCompare() : this.setState({ compareWith: e });
            }),
            (this.onClearCompare = () => {
              this.setState({ compareWith: void 0 });
            }),
            this.addActivationHandler(this._onActivate));
        }
        getExtraQueries(e) {
          const t = [],
            n = this.getCompareTimeRange(e.range);
          if (!n) return t;
          const r = e.targets.filter((e) => !1 !== e.timeRangeCompare);
          return (r.length && t.push({ req: { ...e, targets: r, range: n }, processor: vp }), t);
        }
        shouldRerun(e, t, n) {
          return (
            e.compareWith !== t.compareWith && void 0 !== n.find((e) => !1 !== e.timeRangeCompare)
          );
        }
        getCompareTimeRange(e) {
          let t, n;
          if (this.state.compareWith) {
            if (this.state.compareWith === dp) {
              const r = e.to.diff(e.from);
              ((t = (0, s.dateTime)(e.from).subtract(r)), (n = (0, s.dateTime)(e.to).subtract(r)));
            } else
              ((t = (0, s.dateTime)(e.from).subtract(
                s.rangeUtil.intervalToMs(this.state.compareWith),
              )),
                (n = (0, s.dateTime)(e.to).subtract(
                  s.rangeUtil.intervalToMs(this.state.compareWith),
                )));
            return { from: t, to: n, raw: { from: t, to: n } };
          }
        }
        getUrlState() {
          return { compareWith: this.state.compareWith };
        }
        updateFromUrl(e) {
          if (!e.compareWith) return;
          const t = ce(e.compareWith);
          if (t) {
            this.getCompareOptions(ru.getTimeRange(this).state.value).find(
              ({ value: e }) => e === t,
            )
              ? this.setState({ compareWith: t })
              : this.setState({ compareWith: "__previousPeriod" });
          }
        }
      }
      gp.Component = function ({ model: e }) {
        var t;
        const n = (0, Ct.useStyles2)(bp),
          { compareWith: r, compareOptions: a, hideCheckbox: i } = e.useState(),
          [o, s] = f().useState(r),
          l = null != (t = a.find(({ value: e }) => e === o)) ? t : hp,
          u = a.find(({ value: e }) => e === r),
          c = Boolean(u),
          d = () => {
            c ? (s(r), e.onClearCompare()) : c || e.onCompareWithChanged(l.value);
          },
          p = i && !r ? fp : u,
          h = i || c,
          m = i && p ? { ...p, label: `Comparison: ${p.label}` } : p;
        return f().createElement(
          Ct.ButtonGroup,
          null,
          !i &&
            f().createElement(
              Ct.ToolbarButton,
              {
                variant: "canvas",
                tooltip: (0, Pe.t)(
                  "grafana-scenes.components.scene-time-range-compare-renderer.button-tooltip",
                  "Enable time frame comparison",
                ),
                onClick: (e) => {
                  (e.stopPropagation(), e.preventDefault(), d());
                },
              },
              f().createElement(Ct.Checkbox, { label: " ", value: c, onClick: d }),
              f().createElement(
                Pe.x6,
                {
                  i18nKey:
                    "grafana-scenes.components.scene-time-range-compare-renderer.button-label",
                },
                "Comparison",
              ),
            ),
          h
            ? f().createElement(Ct.ButtonSelect, {
                variant: "canvas",
                value: m,
                options: a,
                onChange: (t) => {
                  e.onCompareWithChanged(t.value);
                },
              })
            : f().createElement(
                Ct.ToolbarButton,
                { className: n.previewButton, disabled: !0, variant: "canvas", isOpen: !1 },
                l.label,
              ),
        );
      };
      const vp = (e, t) => {
        const n = t.timeRange.from.diff(e.timeRange.from);
        return (
          t.series.forEach((e) => {
            ((e.refId = cp(e.refId || "")),
              (e.meta = { ...e.meta, timeCompare: { diffMs: n, isTimeShiftQuery: !0 } }));
          }),
          (0, m.of)(t)
        );
      };
      function bp(e) {
        return {
          previewButton: (0, Vt.css)({
            "&:disabled": {
              border: `1px solid ${e.colors.secondary.border}`,
              color: e.colors.text.disabled,
              opacity: 1,
            },
          }),
        };
      }
      class yp extends P {
        constructor(e) {
          (super(e),
            this.addActivationHandler(() => {
              const e = ru.getData(this);
              (this._subs.add(
                e.subscribeToState((e) => {
                  var t;
                  (null == (t = e.data) ? void 0 : t.state) === s.LoadingState.Done &&
                    this.performRepeat(e.data);
                }),
              ),
                e.state.data && this.performRepeat(e.state.data));
            }));
        }
        performRepeat(e) {
          const t = [];
          for (let n = 0; n < e.series.length; n++) {
            const r = this.state.getLayoutChild(e, e.series[n], n);
            t.push(r);
          }
          this.state.body.setState({ children: t });
        }
      }
      yp.Component = ({ model: e }) => {
        const { body: t } = e.useState();
        return f().createElement(t.Component, { model: t });
      };
      class wp extends P {
        constructor(e) {
          (super(e),
            (this._variableDependency = new Pl(this, {
              variableNames: [this.state.variableName],
              onVariableUpdateCompleted: () => this.performRepeat(),
            })),
            this.addActivationHandler(() => this.performRepeat()));
        }
        performRepeat() {
          if (this._variableDependency.hasDependencyInLoadingState()) return;
          const e = ru.lookupVariable(this.state.variableName, this);
          if (!(e instanceof Je))
            return void console.error(
              "SceneByVariableRepeater: variable is not a MultiValueVariable",
            );
          const t = (function (e) {
              const { value: t, text: n, options: r } = e.state;
              if (e.hasAllValue()) return r;
              if (Array.isArray(t) && Array.isArray(n))
                return t.map((e, t) => ({ value: e, label: n[t] }));
              return [{ value: t, label: n }];
            })(e),
            n = [];
          for (const e of t) {
            const t = this.state.getLayoutChild(e);
            n.push(t);
          }
          this.state.body.setState({ children: n });
        }
      }
      wp.Component = ({ model: e }) => {
        const { body: t } = e.useState();
        return f().createElement(t.Component, { model: t });
      };
      class Sp extends P {
        constructor() {
          (super({}), (this._renderBeforeActivation = !0));
        }
      }
      Sp.Component = (e) => f().createElement("div", { style: { flexGrow: 1 } });
      class xp extends P {
        toggleDirection() {
          this.setState({ direction: "row" === this.state.direction ? "column" : "row" });
        }
        isDraggable() {
          return !1;
        }
      }
      xp.Component = function ({ model: e, parentState: t }) {
        const { children: n, isHidden: r } = e.useState(),
          a = (function (e, t) {
            return (0, p.useMemo)(() => {
              var n, r, a, i, o, s, u, c, d, p;
              const { direction: h = "row", wrap: f } = e,
                m = l.config.theme2,
                g = {};
              return (
                t
                  ? Cp(g, e, t)
                  : ((g.display = "flex"),
                    (g.flexGrow = 1),
                    (g.minWidth = e.minWidth),
                    (g.minHeight = e.minHeight)),
                (g.flexDirection = h),
                (g.gap = "8px"),
                (g.flexWrap = f || "nowrap"),
                (g.alignContent = "baseline"),
                (g.minWidth = g.minWidth || 0),
                (g.minHeight = g.minHeight || 0),
                (g[m.breakpoints.down("md")] = {
                  flexDirection:
                    null != (r = null == (n = e.md) ? void 0 : n.direction) ? r : "column",
                  maxWidth: null != (i = null == (a = e.md) ? void 0 : a.maxWidth) ? i : "unset",
                  maxHeight: null != (s = null == (o = e.md) ? void 0 : o.maxHeight) ? s : "unset",
                  height: null != (c = null == (u = e.md) ? void 0 : u.height) ? c : "unset",
                  width: null != (p = null == (d = e.md) ? void 0 : d.width) ? p : "unset",
                }),
                (0, Vt.css)(g)
              );
            }, [t, e]);
          })(e.state, t);
        if (r) return null;
        return f().createElement(
          "div",
          { className: a },
          n.map((t) => {
            const n = t.Component;
            return f().createElement(n, { key: t.state.key, model: t, parentState: e.state });
          }),
        );
      };
      class _p extends P {}
      function Cp(e, t, n) {
        var r, a, i;
        const o = null != (r = n.direction) ? r : "row",
          { xSizing: s = "fill", ySizing: l = "fill" } = t;
        return (
          (e.display = "flex"),
          (e.position = "relative"),
          (e.flexDirection = o),
          "column" === o
            ? (t.height ? (e.height = t.height) : (e.flexGrow = "fill" === l ? 1 : 0),
              t.width
                ? (e.width = t.width)
                : (e.alignSelf = "fill" === s ? "stretch" : "flex-start"))
            : (t.height
                ? (e.height = t.height)
                : (e.alignSelf = "fill" === l ? "stretch" : "flex-start"),
              t.width ? (e.width = t.width) : (e.flexGrow = "fill" === s ? 1 : 0),
              t.wrap &&
                ((e.flexWrap = t.wrap),
                "nowrap" !== t.wrap && ("row" === o ? (e.rowGap = "8px") : (e.columnGap = "8px")))),
          (e.minWidth = t.minWidth),
          (e.maxWidth = t.maxWidth),
          (e.maxHeight = t.maxHeight),
          (e.minHeight = null != (a = t.minHeight) ? a : n.minHeight),
          (e.height = null != (i = t.height) ? i : n.height),
          e
        );
      }
      _p.Component = function ({ model: e, parentState: t }) {
        if (!t) throw new Error("SceneFlexItem must be a child of SceneFlexLayout");
        const { body: n, isHidden: r } = e.useState(),
          a = (function (e, t) {
            return (0, p.useMemo)(() => {
              var n, r, a, i, o, s, u, c, d, p;
              const h = l.config.theme2,
                f = Cp({}, e, t);
              return (
                (f[h.breakpoints.down("md")] = {
                  maxWidth: null != (r = null == (n = e.md) ? void 0 : n.maxWidth) ? r : "unset",
                  maxHeight: null != (i = null == (a = e.md) ? void 0 : a.maxHeight) ? i : "unset",
                  height:
                    null != (u = null == (o = e.md) ? void 0 : o.height)
                      ? u
                      : null == (s = t.md)
                        ? void 0
                        : s.height,
                  width:
                    null != (p = null == (c = e.md) ? void 0 : c.width)
                      ? p
                      : null == (d = t.md)
                        ? void 0
                        : d.width,
                }),
                (0, Vt.css)(f)
              );
            }, [e, t]);
          })(e.state, t);
        if (!n || r) return null;
        return f().createElement(
          "div",
          { className: a },
          f().createElement(n.Component, { model: n }),
        );
      };
      class Op extends P {
        constructor(e) {
          var t, n;
          super({
            rowGap: 1,
            columnGap: 1,
            templateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            autoRows: null != (t = e.autoRows) ? t : "320px",
            children: null != (n = e.children) ? n : [],
            ...e,
          });
        }
        isDraggable() {
          return !1;
        }
      }
      Op.Component = function ({ model: e }) {
        const { children: t, isHidden: n, isLazy: r } = e.useState(),
          a =
            ((i = e.state),
            (0, p.useMemo)(() => {
              var e, t, n, r, a, o, s, u, c, d, p;
              const h = {},
                f = l.config.theme2;
              return (
                (h.display = "grid"),
                (h.gridTemplateColumns = i.templateColumns),
                (h.gridTemplateRows = i.templateRows || "unset"),
                (h.gridAutoRows = i.autoRows || "unset"),
                (h.rowGap = f.spacing(null != (e = i.rowGap) ? e : 1)),
                (h.columnGap = f.spacing(null != (t = i.columnGap) ? t : 1)),
                (h.justifyItems = i.justifyItems || "unset"),
                (h.alignItems = i.alignItems || "unset"),
                (h.justifyContent = i.justifyContent || "unset"),
                (h.flexGrow = 1),
                i.md &&
                  (h[f.breakpoints.down("md")] = {
                    gridTemplateRows: null == (n = i.md) ? void 0 : n.templateRows,
                    gridTemplateColumns: null == (r = i.md) ? void 0 : r.templateColumns,
                    rowGap: i.md.rowGap
                      ? f.spacing(null != (o = null == (a = i.md) ? void 0 : a.rowGap) ? o : 1)
                      : void 0,
                    columnGap: i.md.columnGap
                      ? f.spacing(null != (u = null == (s = i.md) ? void 0 : s.rowGap) ? u : 1)
                      : void 0,
                    justifyItems: null == (c = i.md) ? void 0 : c.justifyItems,
                    alignItems: null == (d = i.md) ? void 0 : d.alignItems,
                    justifyContent: null == (p = i.md) ? void 0 : p.justifyContent,
                  }),
                (0, Vt.css)(h)
              );
            }, [i]));
        var i;
        if (n) return null;
        return f().createElement(
          "div",
          { className: a },
          t.map((t) => {
            const n = t.Component;
            return r
              ? f().createElement(
                  Bn,
                  { key: t.state.key, className: a },
                  f().createElement(n, { key: t.state.key, model: t, parentState: e.state }),
                )
              : f().createElement(n, { key: t.state.key, model: t, parentState: e.state });
          }),
        );
      };
      class Rp extends P {}
      Rp.Component = function ({ model: e, parentState: t }) {
        if (!t) throw new Error("SceneCSSGridItem must be a child of SceneCSSGridLayout");
        const { body: n, isHidden: r } = e.useState(),
          a =
            ((i = e.state),
            (0, p.useMemo)(() => {
              const e = {};
              return (
                (e.gridColumn = i.gridColumn || "unset"),
                (e.gridRow = i.gridRow || "unset"),
                (e.position = "relative"),
                (0, Vt.css)(e)
              );
            }, [i]));
        var i;
        if (!n || r) return null;
        return f().createElement(
          "div",
          { className: a },
          f().createElement(n.Component, { model: n }),
        );
      };
      const kp = new Set(["ArrowUp", "ArrowDown"]),
        Ep = new Set(["ArrowLeft", "ArrowRight"]),
        Tp = {
          row: { dim: "width", axis: "clientX", min: "minWidth", max: "maxWidth" },
          column: { dim: "height", axis: "clientY", min: "minHeight", max: "maxHeight" },
        };
      function Dp({
        direction: e = "row",
        handleSize: t = 32,
        initialSize: n = "auto",
        primaryPaneStyles: r,
        secondaryPaneStyles: a,
        onDragFinished: i,
        children: o,
      }) {
        const s = f().Children.toArray(o),
          l = (0, p.useRef)(null),
          u = (0, p.useRef)(null),
          c = (0, p.useRef)(null),
          d = (0, p.useRef)(null),
          h = (0, p.useRef)(null),
          m = (0, p.useRef)("1fr"),
          g = (0, p.useRef)(void 0),
          v = (0, p.useRef)(void 0),
          b = Tp[e].dim,
          y = Tp[e].axis,
          w = Tp[e].min,
          S = Tp[e].max;
        !(function (e, t, n = 0, r) {
          const a = (0, V.throttle)(t, n);
          (0, p.useLayoutEffect)(() => {
            if (!e) return;
            const t = new ResizeObserver(a);
            return (t.observe(e, { box: "device-pixel-content-box" }), () => t.disconnect());
          }, r);
        })(
          d.current,
          (e) => {
            for (const t of e) {
              if (!t.target.isSameNode(d.current)) return;
              const e = u.current.getBoundingClientRect()[b],
                n = Ap(u.current);
              l.current.ariaValueNow = `${(0, V.clamp)(((e - n[w]) / (n[S] - n[w])) * 100, 0, 100)}`;
            }
          },
          500,
          [S, w, e, b],
        );
        const x = (0, p.useRef)(null),
          _ = (0, p.useCallback)(
            (e) => {
              ((m.current = u.current.getBoundingClientRect()[b]),
                (h.current = d.current.getBoundingClientRect()[b]),
                (x.current = e[y]),
                l.current.setPointerCapture(e.pointerId),
                (g.current = Ap(u.current)),
                (v.current = void 0));
            },
            [b, y],
          ),
          C = (0, p.useCallback)(
            (e) => {
              if (null !== x.current && "1fr" !== m.current) {
                const n = e[y] - x.current,
                  r = g.current,
                  a = (0, V.clamp)(m.current + n, r[w], r[S]),
                  i = a / (h.current - t);
                ((u.current.style.flexGrow = `${i}`), (c.current.style.flexGrow = "" + (1 - i)));
                const o = (0, V.clamp)(((a - r[w]) / (r[S] - r[w])) * 100, 0, 100);
                l.current.ariaValueNow = `${o}`;
              }
            },
            [t, y, w, S],
          ),
          O = (0, p.useCallback)(
            (e) => {
              (e.preventDefault(),
                e.stopPropagation(),
                l.current.releasePointerCapture(e.pointerId),
                (x.current = null),
                null == i || i(parseFloat(u.current.style.flexGrow)));
            },
            [i],
          ),
          R = (0, p.useRef)(new Set()),
          k = (0, p.useRef)(null),
          E = (0, p.useCallback)(
            (n) => {
              var r;
              if (0 === R.current.size) return void (k.current = null);
              if ("1fr" === m.current) return;
              const a = 0.3 * (n - (null != (r = k.current) ? r : n));
              let i = 0;
              "row" === e
                ? (R.current.has("ArrowLeft") && (i -= a), R.current.has("ArrowRight") && (i += a))
                : (R.current.has("ArrowUp") && (i -= a), R.current.has("ArrowDown") && (i += a));
              const o = g.current,
                s = u.current.getBoundingClientRect()[b],
                d = (0, V.clamp)(s + i, o[w], o[S]),
                p = d / (h.current - t);
              ((u.current.style.flexGrow = `${p}`), (c.current.style.flexGrow = "" + (1 - p)));
              const f = ((d - o[w]) / (o[S] - o[w])) * 100;
              ((l.current.ariaValueNow = `${(0, V.clamp)(f, 0, 100)}`),
                (k.current = n),
                window.requestAnimationFrame(E));
            },
            [e, t, w, S, b],
          ),
          T = (0, p.useCallback)(
            (n) => {
              if ("Enter" === n.key)
                return void (void 0 === v.current
                  ? ((v.current = u.current.style.flexGrow),
                    (u.current.style.flexGrow = "0"),
                    (c.current.style.flexGrow = "1"))
                  : ((u.current.style.flexGrow = v.current),
                    (c.current.style.flexGrow = "" + (1 - parseFloat(v.current))),
                    (v.current = void 0)));
              if ("Home" === n.key) {
                ((g.current = Ap(u.current)), (h.current = d.current.getBoundingClientRect()[b]));
                const e = g.current[w] / (h.current - t);
                return (
                  (u.current.style.flexGrow = `${e}`),
                  (c.current.style.flexGrow = "" + (1 - e)),
                  void (l.current.ariaValueNow = "0")
                );
              }
              if ("End" === n.key) {
                ((g.current = Ap(u.current)), (h.current = d.current.getBoundingClientRect()[b]));
                const e = g.current[S] / (h.current - t);
                return (
                  (u.current.style.flexGrow = `${e}`),
                  (c.current.style.flexGrow = "" + (1 - e)),
                  void (l.current.ariaValueNow = "100")
                );
              }
              if (
                !(("column" === e && kp.has(n.key)) || ("row" === e && Ep.has(n.key))) ||
                R.current.has(n.key)
              )
                return;
              ((v.current = void 0),
                n.preventDefault(),
                n.stopPropagation(),
                (m.current = u.current.getBoundingClientRect()[b]),
                (h.current = d.current.getBoundingClientRect()[b]),
                (g.current = Ap(u.current)));
              if (!R.current.has(n.key)) {
                const e = 0 === R.current.size;
                (R.current.add(n.key), e && window.requestAnimationFrame(E));
              }
            },
            [e, E, t, S, b, w],
          ),
          D = (0, p.useCallback)(
            (t) => {
              ("row" === e && !Ep.has(t.key)) ||
                ("column" === e && !kp.has(t.key)) ||
                (R.current.delete(t.key), null == i || i(parseFloat(u.current.style.flexGrow)));
            },
            [e, i],
          ),
          P = (0, p.useCallback)(() => {
            ((u.current.style.flexGrow = "0.5"), (c.current.style.flexGrow = "0.5"));
            const e = Ap(u.current);
            ((g.current = e),
              (m.current = u.current.getBoundingClientRect()[b]),
              (l.current.ariaValueNow = "" + ((m.current - e[w]) / (e[S] - e[w])) * 100));
          }, [S, b, w]),
          A = (0, p.useCallback)(() => {
            R.current.size > 0 &&
              (R.current.clear(),
              (x.current = null),
              null == i || i(parseFloat(u.current.style.flexGrow)));
          }, [i]),
          I = (0, Ct.useStyles2)(Pp),
          M = Nn(),
          L = 2 === s.length ? "visible" : "hidden";
        return f().createElement(
          "div",
          { ref: d, className: I.container, style: { flexDirection: e } },
          f().createElement(
            "div",
            {
              ref: u,
              className: I.panel,
              style: {
                flexGrow: "auto" === n ? 0.5 : (0, V.clamp)(n, 0, 1),
                [w]: "min-content",
                ...r,
              },
              id: `start-panel-${M}`,
            },
            s[0],
          ),
          s[1] &&
            f().createElement(
              f().Fragment,
              null,
              f().createElement("div", {
                ref: l,
                style: { [b]: `${t}px` },
                className: (0, Vt.cx)(I.handle, { [I.handleHorizontal]: "column" === e }),
                onPointerUp: O,
                onPointerDown: _,
                onPointerMove: C,
                onKeyDown: T,
                onKeyUp: D,
                onDoubleClick: P,
                onBlur: A,
                role: "separator",
                "aria-valuemin": 0,
                "aria-valuemax": 100,
                "aria-valuenow": 50,
                "aria-controls": `start-panel-${M}`,
                "aria-label": (0, Pe.t)(
                  "grafana-scenes.components.splitter.aria-label-pane-resize-widget",
                  "Pane resize widget",
                ),
                tabIndex: 0,
              }),
              f().createElement(
                "div",
                {
                  ref: c,
                  className: I.panel,
                  style: {
                    flexGrow: "auto" === n ? 0.5 : (0, V.clamp)(1 - n, 0, 1),
                    [w]: "min-content",
                    visibility: `${L}`,
                    ...a,
                  },
                  id: `end-panel-${M}`,
                },
                s[1],
              ),
            ),
        );
      }
      function Pp(e) {
        return {
          handle: (0, Vt.css)({
            cursor: "col-resize",
            position: "relative",
            flexShrink: 0,
            userSelect: "none",
            "&::before": {
              content: '""',
              position: "absolute",
              backgroundColor: e.colors.primary.main,
              left: "50%",
              transform: "translate(-50%)",
              top: 0,
              height: "100%",
              width: "1px",
              opacity: 0,
              transition: "opacity ease-in-out 0.2s",
            },
            "&::after": {
              content: '""',
              width: "4px",
              borderRadius: "4px",
              backgroundColor: e.colors.border.weak,
              transition: "background-color ease-in-out 0.2s",
              height: "50%",
              top: "calc(50% - (50%) / 2)",
              transform: "translateX(-50%)",
              position: "absolute",
              left: "50%",
            },
            "&:hover, &:focus-visible": {
              outline: "none",
              "&::before": { opacity: 1 },
              "&::after": { backgroundColor: e.colors.primary.main },
            },
          }),
          handleHorizontal: (0, Vt.css)({
            cursor: "row-resize",
            "&::before": {
              left: "inherit",
              transform: "translateY(-50%)",
              top: "50%",
              height: "1px",
              width: "100%",
            },
            "&::after": {
              width: "50%",
              height: "4px",
              top: "50%",
              transform: "translateY(-50%)",
              left: "calc(50% - (50%) / 2)",
            },
          }),
          container: (0, Vt.css)({
            display: "flex",
            width: "100%",
            flexGrow: 1,
            overflow: "hidden",
          }),
          panel: (0, Vt.css)({ display: "flex", position: "relative", flexBasis: 0 }),
        };
      }
      function Ap(e) {
        if (null === e) return;
        const t = document.body.style.overflow,
          n = e.style.width,
          r = e.style.height,
          a = e.style.flexGrow;
        ((document.body.style.overflow = "hidden"), (e.style.flexGrow = "0"));
        const { width: i, height: o } = e.getBoundingClientRect();
        e.style.flexGrow = "100";
        const { width: s, height: l } = e.getBoundingClientRect();
        return (
          (document.body.style.overflow = t),
          (e.style.width = n),
          (e.style.height = r),
          (e.style.flexGrow = a),
          { minWidth: i, maxWidth: s, minHeight: o, maxHeight: l }
        );
      }
      class Ip extends P {
        toggleDirection() {
          this.setState({ direction: "row" === this.state.direction ? "column" : "row" });
        }
        isDraggable() {
          return !1;
        }
      }
      Ip.Component = function ({ model: e }) {
        const {
          primary: t,
          secondary: n,
          direction: r,
          isHidden: a,
          initialSize: i,
          primaryPaneStyles: o,
          secondaryPaneStyles: s,
        } = e.useState();
        if (a) return null;
        const l = t.Component,
          u = null == n ? void 0 : n.Component;
        let c = n ? i : 1;
        return f().createElement(
          Dp,
          {
            direction: r,
            initialSize: null != c ? c : 0.5,
            primaryPaneStyles: o,
            secondaryPaneStyles: s,
          },
          f().createElement(l, { key: t.state.key, model: t, parentState: e.state }),
          u && n && f().createElement(u, { key: n.state.key, model: n, parentState: e.state }),
        );
      };
      class Vp extends P {
        constructor() {
          (super(...arguments), (this._renderBeforeActivation = !0));
        }
        enrichDataRequest() {
          return { app: this.state.name || "app" };
        }
      }
      Vp.Component = ({ model: e }) => {
        const { pages: t } = e.useState();
        return f().createElement(
          f().Fragment,
          null,
          f().createElement(
            Mp.Provider,
            { value: e },
            f().createElement(
              o.Routes,
              null,
              t.map((e) =>
                f().createElement(o.Route, {
                  key: e.state.url,
                  path: e.state.routePath,
                  element: f().createElement(e.Component, { model: e }),
                }),
              ),
            ),
          ),
        );
      };
      const Mp = (0, p.createContext)(null),
        Lp = new Map();
      function Fp(e) {
        const t = Lp.get(e);
        if (t) return t;
        const n = e();
        return (Lp.set(e, n), n);
      }
      class jp extends P {}
      function Np({ node: e }) {
        const t = e.useState(),
          n = (0, Ct.useStyles2)(Bp);
        return f().createElement(
          "div",
          { className: n.container },
          Object.keys(t).map((r) =>
            f().createElement(
              "div",
              { className: n.row, key: r },
              f().createElement("div", { className: n.keyName }, r),
              f().createElement(
                "div",
                { className: n.value },
                (function (e, t, n) {
                  if (null === t) return "null";
                  switch (typeof t) {
                    case "number":
                      return f().createElement(Ct.Input, {
                        type: "number",
                        defaultValue: t,
                        onBlur: (t) => n.setState({ [e]: t.currentTarget.valueAsNumber }),
                      });
                    case "string":
                      return f().createElement(Ct.Input, {
                        type: "text",
                        defaultValue: t,
                        onBlur: (t) => n.setState({ [e]: t.currentTarget.value }),
                      });
                    case "object":
                      return st(t)
                        ? t.constructor.name
                        : (0, V.isPlainObject)(t) || (0, V.isArray)(t)
                          ? f().createElement(Ct.JSONFormatter, { json: t, open: 0 })
                          : String(t);
                    default:
                      return typeof t;
                  }
                })(r, t[r], e),
              ),
            ),
          ),
        );
      }
      function Bp(e) {
        return {
          container: (0, Vt.css)({
            flexGrow: 1,
            display: "flex",
            gap: e.spacing(0.5),
            flexDirection: "column",
          }),
          row: (0, Vt.css)({ display: "flex", gap: e.spacing(2) }),
          keyName: (0, Vt.css)({
            display: "flex",
            flexGrow: "0",
            width: 120,
            alignItems: "center",
            height: e.spacing(e.components.height.md),
          }),
          value: (0, Vt.css)({
            flexGrow: 1,
            minHeight: e.spacing(e.components.height.md),
            display: "flex",
            alignItems: "center",
          }),
        };
      }
      function zp({ node: e, selectedObject: t, onSelect: n }) {
        const r = (0, Ct.useStyles2)($p),
          a = [],
          i = e === t;
        return (
          e.forEachChild((e) => {
            a.push(
              f().createElement(zp, { node: e, key: e.state.key, selectedObject: t, onSelect: n }),
            );
          }),
          f().createElement(
            "div",
            { className: r.container },
            f().createElement(
              "div",
              { className: (0, Vt.cx)(r.name, i && r.selected), onClick: () => n(e) },
              e.constructor.name,
            ),
            f().createElement("div", { className: r.children }, a),
          )
        );
      }
      function $p(e) {
        return {
          container: (0, Vt.css)({
            flexGrow: 1,
            display: "flex",
            gap: e.spacing(0.5),
            flexDirection: "column",
          }),
          name: (0, Vt.css)({
            flexGrow: 1,
            display: "flex",
            gap: e.spacing(1),
            fontSize: e.typography.bodySmall.fontSize,
            cursor: "pointer",
            padding: e.spacing(0, 1),
            borderRadius: e.shape.borderRadius(2),
            position: "relative",
            "&:hover": { background: e.colors.background.secondary },
          }),
          selected: (0, Vt.css)({
            "&::before": {
              display: "block",
              content: "' '",
              position: "absolute",
              left: 0,
              width: 4,
              bottom: 2,
              top: 2,
              borderRadius: e.shape.radius.default,
              backgroundImage: e.colors.gradients.brandVertical,
            },
          }),
          children: (0, Vt.css)({
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            paddingLeft: e.spacing(1),
          }),
        };
      }
      function Wp({ scene: e }) {
        const t = (0, Ct.useStyles2)(Hp),
          [n, r] = (0, p.useState)(!1),
          [a, i] = (0, p.useState)();
        return f().createElement(
          f().Fragment,
          null,
          f().createElement(Ct.ToolbarButton, {
            variant: "canvas",
            icon: "bug",
            onClick: () => r(!0),
          }),
          n &&
            f().createElement(
              Ct.Drawer,
              {
                title: (0, Pe.t)(
                  "grafana-scenes.components.scene-debugger.title-scene-debugger",
                  "Scene debugger",
                ),
                onClose: () => r(!1),
                size: "lg",
              },
              f().createElement(
                "div",
                { className: t.panes },
                f().createElement(
                  "div",
                  { className: t.pane1 },
                  f().createElement(
                    "div",
                    { className: t.paneHeading },
                    f().createElement(
                      Pe.x6,
                      { i18nKey: "grafana-scenes.components.scene-debugger.scene-graph" },
                      "Scene graph",
                    ),
                  ),
                  f().createElement(
                    Ct.CustomScrollbar,
                    { autoHeightMin: "100%" },
                    f().createElement(
                      "div",
                      { className: t.treeWrapper },
                      f().createElement(zp, { node: e, selectedObject: a, onSelect: i }),
                    ),
                  ),
                ),
                f().createElement(
                  "div",
                  { className: t.pane2 },
                  f().createElement(
                    "div",
                    { className: t.paneHeading },
                    f().createElement(
                      Pe.x6,
                      { i18nKey: "grafana-scenes.components.scene-debugger.object-details" },
                      "Object details",
                    ),
                  ),
                  a && f().createElement(Np, { node: a }),
                ),
              ),
            ),
        );
      }
      function Hp(e) {
        return {
          panes: (0, Vt.css)({
            flexGrow: 1,
            display: "flex",
            height: "100%",
            flexDirection: "row",
            marginTop: e.spacing(-2),
          }),
          pane1: (0, Vt.css)({
            flexGrow: 0,
            display: "flex",
            height: "100%",
            flexDirection: "column",
            borderRight: `1px solid ${e.colors.border.weak}`,
          }),
          pane2: (0, Vt.css)({
            flexGrow: 1,
            display: "flex",
            minHeight: "100%",
            flexDirection: "column",
            paddingLeft: e.spacing(2),
          }),
          treeWrapper: (0, Vt.css)({
            paddingRight: e.spacing(2),
            height: "100%",
            marginLeft: e.spacing(-1),
          }),
          paneHeading: (0, Vt.css)({
            padding: e.spacing(1, 0),
            fontWeight: e.typography.fontWeightMedium,
          }),
        };
      }
      function Up({ page: e }) {
        const t = c(e.state.url),
          n = (function (e) {
            if (e.parent instanceof Qp) return e.parent;
            return e;
          })(e),
          r = n.useState(),
          a = (function () {
            const e = (0, o.useLocation)();
            return (0, l.locationSearchToObject)(e.search || "");
          })(),
          i = e.getScene(t),
          s = (0, p.useContext)(Mp),
          d = r.initializedScene === i,
          { layout: h } = e.state,
          m = Ze();
        ((0, p.useLayoutEffect)(() => {
          d || n.initializeScene(i);
        }, [i, n, d]),
          (0, p.useEffect)(() => () => n.setState({ initializedScene: void 0 }), [n]));
        const g = Rd(n, null == s ? void 0 : s.state.urlSyncOptions);
        if (!d && !g) return null;
        const v = {
          text: r.title,
          img: r.titleImg,
          icon: r.titleIcon,
          url: u(r.url, m.getSearchObject(), r.preserveUrlKeys),
          hideFromBreadcrumbs: r.hideFromBreadcrumbs,
          parentItem: qp(r.getParentPage ? r.getParentPage() : n.parent, a, m.getSearchObject()),
        };
        r.tabs &&
          (v.children = r.tabs.map((t) => ({
            text: t.state.title,
            icon: t.state.titleIcon,
            tabSuffix: t.state.tabSuffix,
            active: e === t,
            url: u(t.state.url, m.getSearchObject(), t.state.preserveUrlKeys),
            parentItem: v,
          })));
        let b = [];
        return (
          r.controls &&
            (b = r.controls.map((e) =>
              f().createElement(e.Component, { model: e, key: e.state.key }),
            )),
          a["scene-debugger"] && b.push(f().createElement(Wp, { scene: n, key: "scene-debugger" })),
          f().createElement(
            l.PluginPage,
            { layout: h, pageNav: v, actions: b, renderTitle: r.renderTitle, subTitle: r.subTitle },
            f().createElement(i.Component, { model: i }),
          )
        );
      }
      function qp(e, t, n) {
        if (e instanceof Qp)
          return {
            text: e.state.title,
            url: u(e.state.url, n, e.state.preserveUrlKeys),
            hideFromBreadcrumbs: e.state.hideFromBreadcrumbs,
            parentItem: qp(e.state.getParentPage ? e.state.getParentPage() : e.parent, t, n),
          };
      }
      function Gp({ drilldown: e, parent: t }) {
        const n = c(e.routePath),
          r = t.getDrilldownPage(e, n);
        return f().createElement(r.Component, { model: r });
      }
      jp.Component = ({ model: e }) => {
        const { component: t, props: n, reactNode: r } = e.useState();
        return t ? f().createElement(t, { ...n }) : r || null;
      };
      class Qp extends P {
        constructor() {
          (super(...arguments), (this._sceneCache = new Map()), (this._drilldownCache = new Map()));
        }
        initializeScene(e) {
          this.setState({ initializedScene: e });
        }
        getScene(e) {
          let t = this._sceneCache.get(e.url);
          if (t) return t;
          if (!this.state.getScene)
            throw new Error("Missing getScene on SceneAppPage " + this.state.title);
          return ((t = this.state.getScene(e)), this._sceneCache.set(e.url, t), t);
        }
        getDrilldownPage(e, t) {
          let n = this._drilldownCache.get(t.url);
          return n || ((n = e.getPage(t, this)), this._drilldownCache.set(t.url, n), n);
        }
        enrichDataRequest(e) {
          if (this.state.getParentPage) return this.state.getParentPage().enrichDataRequest(e);
          if (!this.parent) return null;
          const t = this.getRoot();
          return lt(t) ? t.enrichDataRequest(e) : null;
        }
      }
      Qp.Component = function ({ model: e }) {
        const { tabs: t, drilldowns: n } = e.useState(),
          r = [];
        if (
          (r.push(
            (function (e) {
              var t, n, r;
              return f().createElement(o.Route, {
                key: "fallback route",
                path: "*",
                element: f().createElement(Up, {
                  page:
                    null != (r = null == (n = (t = e.state).getFallbackPage) ? void 0 : n.call(t))
                      ? r
                      : new Qp({
                          url: "",
                          title: (0, Pe.t)(
                            "grafana-scenes.components.fallback-page.title",
                            "Not found",
                          ),
                          subTitle: (0, Pe.t)(
                            "grafana-scenes.components.fallback-page.subTitle",
                            "The url did not match any page",
                          ),
                          routePath: "*",
                          getScene: () =>
                            new Ed({
                              body: new xp({
                                direction: "column",
                                children: [
                                  new _p({
                                    body: new jp({
                                      component: () =>
                                        f().createElement(
                                          "div",
                                          { "data-testid": "default-fallback-content" },
                                          f().createElement(
                                            Pe.x6,
                                            {
                                              i18nKey:
                                                "grafana-scenes.components.fallback-page.content",
                                            },
                                            "If you found your way here using a link then there might be a bug in this application.",
                                          ),
                                        ),
                                    }),
                                  }),
                                ],
                              }),
                            }),
                        }),
                }),
              });
            })(e),
          ),
          t && t.length > 0)
        )
          for (let n = 0; n < t.length; n++) {
            const a = t[n];
            if (
              (0 === n &&
                r.push(
                  f().createElement(o.Route, {
                    key: e.state.routePath,
                    path: "",
                    element: f().createElement(a.Component, { model: a }),
                  }),
                ),
              r.push(
                f().createElement(o.Route, {
                  key: a.state.url,
                  path: a.state.routePath,
                  element: f().createElement(a.Component, { model: a }),
                }),
              ),
              a.state.drilldowns)
            )
              for (const e of a.state.drilldowns)
                r.push(
                  f().createElement(o.Route, {
                    key: e.routePath,
                    path: e.routePath,
                    element: f().createElement(Gp, { drilldown: e, parent: a }),
                  }),
                );
          }
        if (n)
          for (const t of n)
            r.push(
              f().createElement(o.Route, {
                key: t.routePath,
                path: t.routePath,
                Component: () => f().createElement(Gp, { drilldown: t, parent: e }),
              }),
            );
        t ||
          r.push(
            f().createElement(o.Route, {
              key: "home route",
              path: "/",
              element: f().createElement(Up, { page: e }),
            }),
          );
        return f().createElement(o.Routes, null, r);
      };
      var Kp = n(5569);
      const Yp = {
          barRadius: 0,
          barWidth: 0.97,
          fullHighlight: !1,
          groupWidth: 0.7,
          orientation: Kp.i.Auto,
          showValue: Kp.V.Auto,
          stacking: Kp.S.None,
          xTickLabelRotation: 0,
          xTickLabelSpacing: 0,
        },
        Zp = { fillOpacity: 80, gradientMode: Kp.G.None, lineWidth: 1 },
        Xp = {
          displayMode: Kp.h.Gradient,
          maxVizHeight: 300,
          minVizHeight: 16,
          minVizWidth: 8,
          namePlacement: Kp.g.Auto,
          showUnfilled: !0,
          sizing: Kp.e.Auto,
          valueMode: Kp.f.Color,
        },
        Jp = { selectedSeries: 0 },
        eh = {
          minVizHeight: 75,
          minVizWidth: 75,
          showThresholdLabels: !1,
          showThresholdMarkers: !0,
          sizing: Kp.e.Auto,
        },
        th = { layers: [] };
      var nh = n(5938);
      const rh = { bucketCount: 30, bucketOffset: 0 },
        ah = { fillOpacity: 80, gradientMode: Kp.G.None, lineWidth: 1 },
        ih = { showImage: !0 };
      const oh = { displayLabels: [] },
        sh = {
          colorMode: Kp.c.Value,
          graphMode: Kp.b.Area,
          justifyMode: Kp.a.Auto,
          percentChangeColorMode: Kp.P.Standard,
          showPercentChange: !1,
          textMode: Kp.B.Auto,
          wideLayout: !0,
        },
        lh = {
          alignValue: "left",
          mergeValues: !0,
          perPage: 20,
          rowHeight: 0.9,
          showValue: Kp.V.Auto,
        },
        uh = { fillOpacity: 70, lineWidth: 0 },
        ch = { colWidth: 0.9, perPage: 20, rowHeight: 0.9, showValue: Kp.V.Auto },
        dh = { fillOpacity: 70, lineWidth: 1 },
        ph = { cellHeight: Kp.T.Sm, frameIndex: 0, showHeader: !0, showTypeIcons: !1, sortBy: [] };
      const hh = {
        content:
          "# Title\n\nFor markdown syntax help: [commonmark.org/help](https://commonmark.org/help/)",
        mode: "markdown",
      };
      const fh = { fillOpacity: 50, show: "points" },
        mh = { series: [] };
      class gh {
        constructor() {
          this._overrides = [];
        }
        overrideColor(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({ id: "color", value: e }),
            this
          );
        }
        overrideDecimals(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({
              id: "decimals",
              value: e,
            }),
            this
          );
        }
        overrideDisplayName(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({
              id: "displayName",
              value: e,
            }),
            this
          );
        }
        overrideFilterable(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({
              id: "filterable",
              value: e,
            }),
            this
          );
        }
        overrideLinks(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({ id: "links", value: e }),
            this
          );
        }
        overrideMappings(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({
              id: "mappings",
              value: e,
            }),
            this
          );
        }
        overrideMax(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({ id: "max", value: e }),
            this
          );
        }
        overrideMin(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({ id: "min", value: e }),
            this
          );
        }
        overrideNoValue(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({
              id: "noValue",
              value: e,
            }),
            this
          );
        }
        overrideThresholds(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({
              id: "thresholds",
              value: e,
            }),
            this
          );
        }
        overrideUnit(e) {
          return (
            this._overrides[this._overrides.length - 1].properties.push({ id: "unit", value: e }),
            this
          );
        }
      }
      class vh extends gh {
        match(e) {
          return (this._overrides.push({ matcher: e, properties: [] }), this);
        }
        matchFieldsWithName(e) {
          return (
            this._overrides.push({
              matcher: { id: s.FieldMatcherID.byName, options: e },
              properties: [],
            }),
            this
          );
        }
        matchFieldsWithNameByRegex(e) {
          return (
            this._overrides.push({
              matcher: { id: s.FieldMatcherID.byRegexp, options: e },
              properties: [],
            }),
            this
          );
        }
        matchFieldsByType(e) {
          return (
            this._overrides.push({
              matcher: { id: s.FieldMatcherID.byType, options: e },
              properties: [],
            }),
            this
          );
        }
        matchFieldsByQuery(e) {
          return (
            this._overrides.push({
              matcher: { id: s.FieldMatcherID.byFrameRefID, options: e },
              properties: [],
            }),
            this
          );
        }
        matchFieldsByValue(e) {
          return (
            this._overrides.push({
              matcher: { id: s.FieldMatcherID.byValue, options: e },
              properties: [],
            }),
            this
          );
        }
        matchComparisonQuery(e) {
          return this.matchFieldsByQuery(cp(e));
        }
        overrideCustomFieldConfig(e, t) {
          const n = `custom.${String(e)}`;
          return (
            this._overrides[this._overrides.length - 1].properties.push({ id: n, value: t }),
            this
          );
        }
        build() {
          return this._overrides;
        }
      }
      class bh {
        constructor(e) {
          ((this.defaultFieldConfig = e),
            (this._fieldConfig = { defaults: {}, overrides: [] }),
            (this._overridesBuilder = new vh()),
            this.setDefaults());
        }
        setDefaults() {
          const e = {
            defaults: {
              custom: this.defaultFieldConfig ? (0, V.cloneDeep)(this.defaultFieldConfig()) : {},
            },
            overrides: [],
          };
          this._fieldConfig = e;
        }
        setColor(e) {
          return this.setFieldConfigDefaults("color", e);
        }
        setDecimals(e) {
          return this.setFieldConfigDefaults("decimals", e);
        }
        setDisplayName(e) {
          return this.setFieldConfigDefaults("displayName", e);
        }
        setFilterable(e) {
          return this.setFieldConfigDefaults("filterable", e);
        }
        setLinks(e) {
          return this.setFieldConfigDefaults("links", e);
        }
        setMappings(e) {
          return this.setFieldConfigDefaults("mappings", e);
        }
        setMax(e) {
          return this.setFieldConfigDefaults("max", e);
        }
        setMin(e) {
          return this.setFieldConfigDefaults("min", e);
        }
        setNoValue(e) {
          return this.setFieldConfigDefaults("noValue", e);
        }
        setThresholds(e) {
          return this.setFieldConfigDefaults("thresholds", e);
        }
        setUnit(e) {
          return this.setFieldConfigDefaults("unit", e);
        }
        setCustomFieldConfig(e, t) {
          return (
            (this._fieldConfig.defaults = {
              ...this._fieldConfig.defaults,
              custom: (0, V.merge)(this._fieldConfig.defaults.custom, { [e]: t }),
            }),
            this
          );
        }
        setOverrides(e) {
          return (e(this._overridesBuilder), this);
        }
        setFieldConfigDefaults(e, t) {
          return ((this._fieldConfig.defaults = { ...this._fieldConfig.defaults, [e]: t }), this);
        }
        build() {
          return {
            defaults: this._fieldConfig.defaults,
            overrides: this._overridesBuilder.build(),
          };
        }
      }
      class yh {
        constructor(e) {
          ((this.defaultOptions = e), (this._options = {}), this.setDefaults());
        }
        setDefaults() {
          this._options = this.defaultOptions ? (0, V.cloneDeep)(this.defaultOptions()) : {};
        }
        setOption(e, t) {
          return ((this._options = (0, V.merge)(this._options, { [e]: t })), this);
        }
        build() {
          return this._options;
        }
      }
      class wh {
        constructor(e, t, n, r) {
          ((this._state = {}),
            (this._state.title = ""),
            (this._state.description = ""),
            (this._state.displayMode = "default"),
            (this._state.hoverHeader = !1),
            (this._state.pluginId = e),
            (this._state.pluginVersion = t),
            (this._fieldConfigBuilder = new bh(r)),
            (this._panelOptionsBuilder = new yh(n)));
        }
        setTitle(e) {
          return ((this._state.title = e), this);
        }
        setDescription(e) {
          return ((this._state.description = e), this);
        }
        setDisplayMode(e) {
          return ((this._state.displayMode = e), this);
        }
        setHoverHeader(e) {
          return ((this._state.hoverHeader = e), this);
        }
        setShowMenuAlways(e) {
          return ((this._state.showMenuAlways = e), this);
        }
        setMenu(e) {
          return ((this._state.menu = e), this);
        }
        setHeaderActions(e) {
          return ((this._state.headerActions = e), this);
        }
        setCollapsible(e) {
          return ((this._state.collapsible = e), this);
        }
        setCollapsed(e) {
          return ((this._state.collapsed = e), this);
        }
        setColor(e) {
          return (this._fieldConfigBuilder.setColor(e), this);
        }
        setDecimals(e) {
          return (this._fieldConfigBuilder.setDecimals(e), this);
        }
        setDisplayName(e) {
          return (this._fieldConfigBuilder.setDisplayName(e), this);
        }
        setFilterable(e) {
          return (this._fieldConfigBuilder.setFilterable(e), this);
        }
        setLinks(e) {
          return (this._fieldConfigBuilder.setLinks(e), this);
        }
        setMappings(e) {
          return (this._fieldConfigBuilder.setMappings(e), this);
        }
        setMax(e) {
          return (this._fieldConfigBuilder.setMax(e), this);
        }
        setMin(e) {
          return (this._fieldConfigBuilder.setMin(e), this);
        }
        setNoValue(e) {
          return (this._fieldConfigBuilder.setNoValue(e), this);
        }
        setThresholds(e) {
          return (this._fieldConfigBuilder.setThresholds(e), this);
        }
        setUnit(e) {
          return (this._fieldConfigBuilder.setUnit(e), this);
        }
        setCustomFieldConfig(e, t) {
          return (this._fieldConfigBuilder.setCustomFieldConfig(e, t), this);
        }
        setOverrides(e) {
          return (this._fieldConfigBuilder.setOverrides(e), this);
        }
        setOption(e, t) {
          return (this._panelOptionsBuilder.setOption(e, t), this);
        }
        setData(e) {
          return ((this._state.$data = e), this);
        }
        setTimeRange(e) {
          return ((this._state.$timeRange = e), this);
        }
        setVariables(e) {
          return ((this._state.$variables = e), this);
        }
        setBehaviors(e) {
          return ((this._state.$behaviors = e), this);
        }
        setSeriesLimit(e) {
          return ((this._state.seriesLimit = e), this);
        }
        applyMixin(e) {
          return (e(this), this);
        }
        build() {
          return new fr({
            ...this._state,
            options: this._panelOptionsBuilder.build(),
            fieldConfig: this._fieldConfigBuilder.build(),
          });
        }
      }
      const Sh = {
        barchart: () =>
          new wh(
            "barchart",
            "10.0.0",
            () => Yp,
            () => Zp,
          ),
        bargauge: () => new wh("bargauge", "10.0.0", () => Xp),
        datagrid: () => new wh("datagrid", "10.0.0", () => Jp),
        flamegraph: () => new wh("flamegraph", "10.0.0"),
        gauge: () => new wh("gauge", "10.0.0", () => eh),
        geomap: () => new wh("geomap", "10.0.0", () => th),
        heatmap: () => new wh("heatmap", "10.0.0", () => nh.KQ),
        histogram: () =>
          new wh(
            "histogram",
            "10.0.0",
            () => rh,
            () => ah,
          ),
        logs: () => new wh("logs", "10.0.0"),
        news: () => new wh("news", "10.0.0", () => ih),
        nodegraph: () => new wh("nodeGraph", "10.0.0"),
        piechart: () => new wh("piechart", "10.0.0", () => oh),
        stat: () => new wh("stat", "10.0.0", () => sh),
        statetimeline: () =>
          new wh(
            "state-timeline",
            "10.0.0",
            () => lh,
            () => uh,
          ),
        statushistory: () =>
          new wh(
            "status-history",
            "10.0.0",
            () => ch,
            () => dh,
          ),
        table: () => new wh("table", "10.0.0", () => ph),
        text: () => new wh("text", "10.0.0", () => hh),
        timeseries: () => new wh("timeseries", "10.0.0"),
        trend: () => new wh("trend", "10.0.0"),
        traces: () => new wh("traces", "10.0.0"),
        xychart: () =>
          new wh(
            "xychart",
            "10.0.0",
            () => mh,
            () => fh,
          ),
      };
      class xh {
        constructor(e, t, n, r) {
          ((this._pluginId = e),
            (this._pluginVersion = t),
            (this._fieldConfigBuilder = new bh(r)),
            (this._panelOptionsBuilder = new yh(n)));
        }
        setColor(e) {
          return (this._fieldConfigBuilder.setColor(e), this);
        }
        setDecimals(e) {
          return (this._fieldConfigBuilder.setDecimals(e), this);
        }
        setDisplayName(e) {
          return (this._fieldConfigBuilder.setDisplayName(e), this);
        }
        setFilterable(e) {
          return (this._fieldConfigBuilder.setFilterable(e), this);
        }
        setLinks(e) {
          return (this._fieldConfigBuilder.setLinks(e), this);
        }
        setMappings(e) {
          return (this._fieldConfigBuilder.setMappings(e), this);
        }
        setMax(e) {
          return (this._fieldConfigBuilder.setMax(e), this);
        }
        setMin(e) {
          return (this._fieldConfigBuilder.setMin(e), this);
        }
        setNoValue(e) {
          return (this._fieldConfigBuilder.setNoValue(e), this);
        }
        setThresholds(e) {
          return (this._fieldConfigBuilder.setThresholds(e), this);
        }
        setUnit(e) {
          return (this._fieldConfigBuilder.setUnit(e), this);
        }
        setCustomFieldConfig(e, t) {
          return (this._fieldConfigBuilder.setCustomFieldConfig(e, t), this);
        }
        setOverrides(e) {
          return (this._fieldConfigBuilder.setOverrides(e), this);
        }
        setOption(e, t) {
          return (this._panelOptionsBuilder.setOption(e, t), this);
        }
        build() {
          return {
            pluginId: this._pluginId,
            pluginVersion: this._pluginVersion,
            options: this._panelOptionsBuilder.build(),
            fieldConfig: this._fieldConfigBuilder.build(),
          };
        }
      }
      const _h = {
        barchart: () =>
          new xh(
            "barchart",
            "10.0.0",
            () => Yp,
            () => Zp,
          ),
        bargauge: () => new xh("bargauge", "10.0.0", () => Xp),
        datagrid: () => new xh("datagrid", "10.0.0", () => Jp),
        flamegraph: () => new xh("flamegraph", "10.0.0"),
        gauge: () => new xh("gauge", "10.0.0", () => eh),
        geomap: () => new xh("geomap", "10.0.0", () => th),
        heatmap: () => new xh("heatmap", "10.0.0", () => nh.KQ),
        histogram: () =>
          new xh(
            "histogram",
            "10.0.0",
            () => rh,
            () => ah,
          ),
        logs: () => new xh("logs", "10.0.0"),
        news: () => new xh("news", "10.0.0", () => ih),
        nodegraph: () => new xh("nodeGraph", "10.0.0"),
        piechart: () => new xh("piechart", "10.0.0", () => oh),
        stat: () => new xh("stat", "10.0.0", () => sh),
        statetimeline: () =>
          new xh(
            "state-timeline",
            "10.0.0",
            () => lh,
            () => uh,
          ),
        statushistory: () =>
          new xh(
            "status-history",
            "10.0.0",
            () => ch,
            () => dh,
          ),
        table: () => new xh("table", "10.0.0", () => ph),
        text: () => new xh("text", "10.0.0", () => hh),
        timeseries: () => new xh("timeseries", "10.0.0"),
        trend: () => new xh("trend", "10.0.0"),
        traces: () => new xh("traces", "10.0.0"),
        xychart: () =>
          new xh(
            "xychart",
            "10.0.0",
            () => mh,
            () => fh,
          ),
      };
      const Ch = n(5730).Y.reduce(
          (e, t) => (
            (e[t.code] = async () =>
              await (function (e) {
                switch (e) {
                  case "../locales/cs-CZ/grafana-scenes.json":
                    return n.e(549).then(n.bind(n, 4549));
                  case "../locales/de-DE/grafana-scenes.json":
                    return n.e(876).then(n.bind(n, 876));
                  case "../locales/en-US/grafana-scenes.json":
                    return n.e(767).then(n.bind(n, 4767));
                  case "../locales/es-ES/grafana-scenes.json":
                    return n.e(190).then(n.bind(n, 2190));
                  case "../locales/fr-FR/grafana-scenes.json":
                    return n.e(2).then(n.bind(n, 6002));
                  case "../locales/hu-HU/grafana-scenes.json":
                    return n.e(220).then(n.bind(n, 8220));
                  case "../locales/id-ID/grafana-scenes.json":
                    return n.e(980).then(n.bind(n, 7980));
                  case "../locales/it-IT/grafana-scenes.json":
                    return n.e(644).then(n.bind(n, 5644));
                  case "../locales/ja-JP/grafana-scenes.json":
                    return n.e(327).then(n.bind(n, 4327));
                  case "../locales/ko-KR/grafana-scenes.json":
                    return n.e(353).then(n.bind(n, 7353));
                  case "../locales/nl-NL/grafana-scenes.json":
                    return n.e(74).then(n.bind(n, 6074));
                  case "../locales/pl-PL/grafana-scenes.json":
                    return n.e(582).then(n.bind(n, 3582));
                  case "../locales/pt-BR/grafana-scenes.json":
                    return n.e(150).then(n.bind(n, 5150));
                  case "../locales/pt-PT/grafana-scenes.json":
                    return n.e(206).then(n.bind(n, 6206));
                  case "../locales/ru-RU/grafana-scenes.json":
                    return n.e(64).then(n.bind(n, 6064));
                  case "../locales/sv-SE/grafana-scenes.json":
                    return n.e(697).then(n.bind(n, 5697));
                  case "../locales/tr-TR/grafana-scenes.json":
                    return n.e(70).then(n.bind(n, 5070));
                  case "../locales/zh-Hans/grafana-scenes.json":
                    return n.e(660).then(n.bind(n, 4279));
                  case "../locales/zh-Hant/grafana-scenes.json":
                    return n.e(341).then(n.bind(n, 9341));
                  default:
                    return new Promise(function (t, n) {
                      ("function" == typeof queueMicrotask ? queueMicrotask : setTimeout)(
                        n.bind(null, new Error("Unknown variable dynamic import: " + e)),
                      );
                    });
                }
              })(`../locales/${t.code}/grafana-scenes.json`)),
            e
          ),
          {},
        ),
        Oh = async (e) => (await Ch[e]()).default,
        Rh = {
          barchart: () => new yh(() => Yp),
          bargauge: () => new yh(() => Xp),
          datagrid: () => new yh(() => Jp),
          flamegraph: () => new yh(),
          gauge: () => new yh(() => eh),
          geomap: () => new yh(() => th),
          heatmap: () => new yh(() => nh.KQ),
          histogram: () => new yh(() => rh),
          logs: () => new yh(),
          news: () => new yh(() => ih),
          nodegraph: () => new yh(),
          piechart: () => new yh(() => oh),
          stat: () => new yh(() => sh),
          statetimeline: () => new yh(() => lh),
          statushistory: () => new yh(() => ch),
          table: () => new yh(() => ph),
          text: () => new yh(() => hh),
          timeseries: () => new yh(),
          trend: () => new yh(),
          traces: () => new yh(),
          xychart: () => new yh(() => mh),
        },
        kh = {
          barchart: () => new bh(() => Zp),
          bargauge: () => new bh(),
          datagrid: () => new bh(),
          flamegraph: () => new bh(),
          gauge: () => new bh(),
          geomap: () => new bh(),
          heatmap: () => new bh(),
          histogram: () => new bh(() => ah),
          logs: () => new bh(),
          news: () => new bh(),
          nodegraph: () => new bh(),
          piechart: () => new bh(),
          stat: () => new bh(),
          statetimeline: () => new bh(() => uh),
          statushistory: () => new bh(() => dh),
          table: () => new bh(),
          text: () => new bh(),
          timeseries: () => new bh(),
          trend: () => new bh(),
          traces: () => new bh(),
          xychart: () => new bh(() => fh),
        },
        Eh = {
          getUrlWithAppState: u,
          registerRuntimePanelPlugin: function ({ pluginId: e, plugin: t }) {
            if (d.has(e))
              throw new Error(`A runtime panel plugin with id ${e} has already been registered`);
            ((t.meta = {
              ...t.meta,
              id: e,
              name: e,
              module: "runtime plugin",
              baseUrl: "runtime plugin",
              info: {
                author: { name: "Runtime plugin " + e },
                description: "",
                links: [],
                logos: { large: "", small: "" },
                screenshots: [],
                updated: "",
                version: "",
              },
            }),
              d.set(e, t));
          },
          registerRuntimeDataSource: j,
          registerVariableMacro: function (e, t, n = !1) {
            if (!n && it.get(e)) throw new Error(`Macro already registered ${e}`);
            return (
              it.set(e, t),
              () => {
                if (n)
                  throw new Error(
                    "Replaced macros can not be unregistered. They need to be restored manually.",
                  );
                it.delete(e);
              }
            );
          },
          cloneSceneObjectState: M,
          syncStateFromSearchParams: function (e, t, n) {
            W(e, t, new B(n));
          },
          getUrlState: $,
          renderPrometheusLabelFilters: gl,
          escapeLabelValueInRegexSelector: bl,
          escapeLabelValueInExactSelector: vl,
          escapeURLDelimiters: function (e) {
            return xl(Sl(e));
          },
          isAdHocVariable: function (e) {
            return "adhoc" === e.state.type;
          },
          isConstantVariable: function (e) {
            return "constant" === e.state.type;
          },
          isCustomVariable: function (e) {
            return "custom" === e.state.type;
          },
          isDataSourceVariable: function (e) {
            return "datasource" === e.state.type;
          },
          isIntervalVariable: function (e) {
            return "interval" === e.state.type;
          },
          isQueryVariable: function (e) {
            return "query" === e.state.type;
          },
          isTextBoxVariable: function (e) {
            return "textbox" === e.state.type;
          },
          isGroupByVariable: function (e) {
            return "groupby" === e.state.type;
          },
          isSwitchVariable: function (e) {
            return "switch" === e.state.type;
          },
          isRepeatCloneOrChildOf: Xe,
          buildPathIdFor: ou,
        };
    },
    4636: (e, t, n) => {
      "use strict";
      function r(e) {
        return (
          (r =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          r(e)
        );
      }
      t.default = void 0;
      var a = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" !== r(e) && "function" != typeof e)) return { default: e };
          var n = p(t);
          if (n && n.has(e)) return n.get(e);
          var a = {},
            i = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var o in e)
            if ("default" !== o && Object.prototype.hasOwnProperty.call(e, o)) {
              var s = i ? Object.getOwnPropertyDescriptor(e, o) : null;
              s && (s.get || s.set) ? Object.defineProperty(a, o, s) : (a[o] = e[o]);
            }
          ((a.default = e), n && n.set(e, a));
          return a;
        })(n(5959)),
        i = d(n(2688)),
        o = d(n(7842)),
        s = n(414),
        l = n(544),
        u = d(n(9482)),
        c = [
          "breakpoint",
          "breakpoints",
          "cols",
          "layouts",
          "margin",
          "containerPadding",
          "onBreakpointChange",
          "onLayoutChange",
          "onWidthChange",
        ];
      function d(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function p(e) {
        if ("function" != typeof WeakMap) return null;
        var t = new WeakMap(),
          n = new WeakMap();
        return (p = function (e) {
          return e ? n : t;
        })(e);
      }
      function h() {
        return (
          (h =
            Object.assign ||
            function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var n = arguments[t];
                for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
              }
              return e;
            }),
          h.apply(this, arguments)
        );
      }
      function f(e, t) {
        if (null == e) return {};
        var n,
          r,
          a = (function (e, t) {
            if (null == e) return {};
            var n,
              r,
              a = {},
              i = Object.keys(e);
            for (r = 0; r < i.length; r++) ((n = i[r]), t.indexOf(n) >= 0 || (a[n] = e[n]));
            return a;
          })(e, t);
        if (Object.getOwnPropertySymbols) {
          var i = Object.getOwnPropertySymbols(e);
          for (r = 0; r < i.length; r++)
            ((n = i[r]),
              t.indexOf(n) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, n) && (a[n] = e[n])));
        }
        return a;
      }
      function m(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          (t &&
            (r = r.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, r));
        }
        return n;
      }
      function g(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? m(Object(n), !0).forEach(function (t) {
                x(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : m(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function v(e, t) {
        for (var n = 0; n < t.length; n++) {
          var r = t[n];
          ((r.enumerable = r.enumerable || !1),
            (r.configurable = !0),
            "value" in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r));
        }
      }
      function b(e, t) {
        return (
          (b =
            Object.setPrototypeOf ||
            function (e, t) {
              return ((e.__proto__ = t), e);
            }),
          b(e, t)
        );
      }
      function y(e) {
        var t = (function () {
          if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
          if (Reflect.construct.sham) return !1;
          if ("function" == typeof Proxy) return !0;
          try {
            return (
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})),
              !0
            );
          } catch (e) {
            return !1;
          }
        })();
        return function () {
          var n,
            a = S(e);
          if (t) {
            var i = S(this).constructor;
            n = Reflect.construct(a, arguments, i);
          } else n = a.apply(this, arguments);
          return (function (e, t) {
            if (t && ("object" === r(t) || "function" == typeof t)) return t;
            if (void 0 !== t)
              throw new TypeError("Derived constructors may only return object or undefined");
            return w(e);
          })(this, n);
        };
      }
      function w(e) {
        if (void 0 === e)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e;
      }
      function S(e) {
        return (
          (S = Object.setPrototypeOf
            ? Object.getPrototypeOf
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              }),
          S(e)
        );
      }
      function x(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
      var _ = function (e) {
        return Object.prototype.toString.call(e);
      };
      function C(e, t) {
        return null == e ? null : Array.isArray(e) ? e : e[t];
      }
      var O = (function (e) {
        !(function (e, t) {
          if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function");
          ((e.prototype = Object.create(t && t.prototype, {
            constructor: { value: e, writable: !0, configurable: !0 },
          })),
            Object.defineProperty(e, "prototype", { writable: !1 }),
            t && b(e, t));
        })(d, e);
        var t,
          n,
          r,
          i = y(d);
        function d() {
          var e;
          !(function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          })(this, d);
          for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++) n[r] = arguments[r];
          return (
            x(w((e = i.call.apply(i, [this].concat(n)))), "state", e.generateInitialState()),
            x(w(e), "onLayoutChange", function (t) {
              e.props.onLayoutChange(
                t,
                g(g({}, e.props.layouts), {}, x({}, e.state.breakpoint, t)),
              );
            }),
            e
          );
        }
        return (
          (t = d),
          (r = [
            {
              key: "getDerivedStateFromProps",
              value: function (e, t) {
                if (!(0, o.default)(e.layouts, t.layouts)) {
                  var n = t.breakpoint,
                    r = t.cols;
                  return {
                    layout: (0, l.findOrGenerateResponsiveLayout)(
                      e.layouts,
                      e.breakpoints,
                      n,
                      n,
                      r,
                      e.compactType,
                    ),
                    layouts: e.layouts,
                  };
                }
                return null;
              },
            },
          ]),
          (n = [
            {
              key: "generateInitialState",
              value: function () {
                var e = this.props,
                  t = e.width,
                  n = e.breakpoints,
                  r = e.layouts,
                  a = e.cols,
                  i = (0, l.getBreakpointFromWidth)(n, t),
                  o = (0, l.getColsFromBreakpoint)(i, a),
                  s = !1 === this.props.verticalCompact ? null : this.props.compactType;
                return {
                  layout: (0, l.findOrGenerateResponsiveLayout)(r, n, i, i, o, s),
                  breakpoint: i,
                  cols: o,
                };
              },
            },
            {
              key: "componentDidUpdate",
              value: function (e) {
                (this.props.width == e.width &&
                  this.props.breakpoint === e.breakpoint &&
                  (0, o.default)(this.props.breakpoints, e.breakpoints) &&
                  (0, o.default)(this.props.cols, e.cols)) ||
                  this.onWidthChange(e);
              },
            },
            {
              key: "onWidthChange",
              value: function (e) {
                var t = this.props,
                  n = t.breakpoints,
                  r = t.cols,
                  a = t.layouts,
                  i = t.compactType,
                  o =
                    this.props.breakpoint ||
                    (0, l.getBreakpointFromWidth)(this.props.breakpoints, this.props.width),
                  u = this.state.breakpoint,
                  c = (0, l.getColsFromBreakpoint)(o, r),
                  d = g({}, a);
                if (u !== o || e.breakpoints !== n || e.cols !== r) {
                  u in d || (d[u] = (0, s.cloneLayout)(this.state.layout));
                  var p = (0, l.findOrGenerateResponsiveLayout)(d, n, o, u, c, i);
                  ((p = (0, s.synchronizeLayoutWithChildren)(
                    p,
                    this.props.children,
                    c,
                    i,
                    this.props.allowOverlap,
                  )),
                    (d[o] = p),
                    this.props.onLayoutChange(p, d),
                    this.props.onBreakpointChange(o, c),
                    this.setState({ breakpoint: o, layout: p, cols: c }));
                }
                var h = C(this.props.margin, o),
                  f = C(this.props.containerPadding, o);
                this.props.onWidthChange(this.props.width, h, c, f);
              },
            },
            {
              key: "render",
              value: function () {
                var e = this.props,
                  t = (e.breakpoint, e.breakpoints, e.cols, e.layouts, e.margin),
                  n = e.containerPadding,
                  r = (e.onBreakpointChange, e.onLayoutChange, e.onWidthChange, f(e, c));
                return a.createElement(
                  u.default,
                  h({}, r, {
                    margin: C(t, this.state.breakpoint),
                    containerPadding: C(n, this.state.breakpoint),
                    onLayoutChange: this.onLayoutChange,
                    layout: this.state.layout,
                    cols: this.state.cols,
                  }),
                );
              },
            },
          ]) && v(t.prototype, n),
          r && v(t, r),
          Object.defineProperty(t, "prototype", { writable: !1 }),
          d
        );
      })(a.Component);
      ((t.default = O),
        x(O, "propTypes", {
          breakpoint: i.default.string,
          breakpoints: i.default.object,
          allowOverlap: i.default.bool,
          cols: i.default.object,
          margin: i.default.oneOfType([i.default.array, i.default.object]),
          containerPadding: i.default.oneOfType([i.default.array, i.default.object]),
          layouts: function (e, t) {
            if ("[object Object]" !== _(e[t]))
              throw new Error("Layout property must be an object. Received: " + _(e[t]));
            Object.keys(e[t]).forEach(function (t) {
              if (!(t in e.breakpoints))
                throw new Error("Each key in layouts must align with a key in breakpoints.");
              (0, s.validateLayout)(e.layouts[t], "layouts." + t);
            });
          },
          width: i.default.number.isRequired,
          onBreakpointChange: i.default.func,
          onLayoutChange: i.default.func,
          onWidthChange: i.default.func,
        }),
        x(O, "defaultProps", {
          breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
          cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
          containerPadding: { lg: null, md: null, sm: null, xs: null, xxs: null },
          layouts: {},
          margin: [10, 10],
          allowOverlap: !1,
          onBreakpointChange: s.noop,
          onLayoutChange: s.noop,
          onWidthChange: s.noop,
        }));
    },
    5569: (e, t, n) => {
      "use strict";
      n.d(t, {
        B: () => c,
        G: () => a,
        P: () => d,
        S: () => i,
        T: () => b,
        V: () => r,
        a: () => u,
        b: () => l,
        c: () => s,
        d: () => p,
        e: () => g,
        f: () => f,
        g: () => m,
        h: () => h,
        i: () => o,
      });
      var r = ((e) => ((e.Always = "always"), (e.Auto = "auto"), (e.Never = "never"), e))(r || {}),
        a = ((e) => (
          (e.Hue = "hue"),
          (e.None = "none"),
          (e.Opacity = "opacity"),
          (e.Scheme = "scheme"),
          e
        ))(a || {}),
        i = ((e) => ((e.None = "none"), (e.Normal = "normal"), (e.Percent = "percent"), e))(
          i || {},
        );
      var o = ((e) => (
        (e.Auto = "auto"),
        (e.Horizontal = "horizontal"),
        (e.Vertical = "vertical"),
        e
      ))(o || {});
      var s = ((e) => (
          (e.Background = "background"),
          (e.BackgroundSolid = "background_solid"),
          (e.None = "none"),
          (e.Value = "value"),
          e
        ))(s || {}),
        l = ((e) => ((e.Area = "area"), (e.Line = "line"), (e.None = "none"), e))(l || {}),
        u = ((e) => ((e.Auto = "auto"), (e.Center = "center"), e))(u || {}),
        c = ((e) => (
          (e.Auto = "auto"),
          (e.Name = "name"),
          (e.None = "none"),
          (e.Value = "value"),
          (e.ValueAndName = "value_and_name"),
          e
        ))(c || {}),
        d = ((e) => (
          (e.Inverted = "inverted"),
          (e.SameAsValue = "same_as_value"),
          (e.Standard = "standard"),
          e
        ))(d || {}),
        p = ((e) => ((e.Multi = "multi"), (e.None = "none"), (e.Single = "single"), e))(p || {});
      var h = ((e) => ((e.Basic = "basic"), (e.Gradient = "gradient"), (e.Lcd = "lcd"), e))(
          h || {},
        ),
        f = ((e) => ((e.Color = "color"), (e.Hidden = "hidden"), (e.Text = "text"), e))(f || {}),
        m = ((e) => (
          (e.Auto = "auto"),
          (e.Hidden = "hidden"),
          (e.Left = "left"),
          (e.Top = "top"),
          e
        ))(m || {}),
        g = ((e) => ((e.Auto = "auto"), (e.Manual = "manual"), e))(g || {}),
        v = ((e) => (
          (e.Actions = "actions"),
          (e.Auto = "auto"),
          (e.BasicGauge = "basic"),
          (e.ColorBackground = "color-background"),
          (e.ColorBackgroundSolid = "color-background-solid"),
          (e.ColorText = "color-text"),
          (e.Custom = "custom"),
          (e.DataLinks = "data-links"),
          (e.Gauge = "gauge"),
          (e.Geo = "geo"),
          (e.GradientGauge = "gradient-gauge"),
          (e.Image = "image"),
          (e.JSONView = "json-view"),
          (e.LcdGauge = "lcd-gauge"),
          (e.Markdown = "markdown"),
          (e.Pill = "pill"),
          (e.Sparkline = "sparkline"),
          e
        ))(v || {}),
        b = ((e) => ((e.Auto = "auto"), (e.Lg = "lg"), (e.Md = "md"), (e.Sm = "sm"), e))(b || {});
      v.Auto;
    },
    5938: (e, t, n) => {
      "use strict";
      n.d(t, { KQ: () => i, P7: () => a });
      var r = n(5569);
      var a = ((e) => ((e.Opacity = "opacity"), (e.Scheme = "scheme"), e))(a || {});
      const i = {
        calculate: !1,
        cellGap: 1,
        cellValues: {},
        color: { scheme: "Oranges", fill: "dark-orange", reverse: !1, exponent: 0.5, steps: 64 },
        exemplars: { color: "rgba(255,0,255,0.7)" },
        filterValues: { le: 1e-9 },
        legend: { show: !0 },
        selectionMode: "x",
        showValue: r.V.Auto,
        tooltip: { mode: r.d.Single, yHistogram: !1, showColorScale: !1 },
      };
    },
    6145: (e, t, n) => {
      "use strict";
      n.d(t, { CO: () => a, dM: () => i, rw: () => r, yV: () => o });
      const r = {
        allowCustomValue: !0,
        includeAll: !1,
        multi: !1,
        options: [],
        skipUrlSync: !1,
        staticOptions: [],
      };
      var a = ((e) => (
        (e[(e.never = 0)] = "never"),
        (e[(e.onDashboardLoad = 1)] = "onDashboardLoad"),
        (e[(e.onTimeRangeChanged = 2)] = "onTimeRangeChanged"),
        e
      ))(a || {});
      var i = ((e) => (
        (e.RangeToText = "range"),
        (e.RegexToText = "regex"),
        (e.SpecialValue = "special"),
        (e.ValueToText = "value"),
        e
      ))(i || {});
      var o = ((e) => (
        (e[(e.Crosshair = 1)] = "Crosshair"),
        (e[(e.Off = 0)] = "Off"),
        (e[(e.Tooltip = 2)] = "Tooltip"),
        e
      ))(o || {});
    },
    6333: (e, t, n) => {
      "use strict";
      ((t.__esModule = !0), (t.resizableProps = void 0));
      var r,
        a = (r = n(2688)) && r.__esModule ? r : { default: r };
      n(8230);
      var i = {
        axis: a.default.oneOf(["both", "x", "y", "none"]),
        className: a.default.string,
        children: a.default.element.isRequired,
        draggableOpts: a.default.shape({
          allowAnyClick: a.default.bool,
          cancel: a.default.string,
          children: a.default.node,
          disabled: a.default.bool,
          enableUserSelectHack: a.default.bool,
          offsetParent: a.default.node,
          grid: a.default.arrayOf(a.default.number),
          handle: a.default.string,
          nodeRef: a.default.object,
          onStart: a.default.func,
          onDrag: a.default.func,
          onStop: a.default.func,
          onMouseDown: a.default.func,
          scale: a.default.number,
        }),
        height: function () {
          for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
          var r,
            i = t[0];
          return "both" === i.axis || "y" === i.axis
            ? (r = a.default.number).isRequired.apply(r, t)
            : a.default.number.apply(a.default, t);
        },
        handle: a.default.oneOfType([a.default.node, a.default.func]),
        handleSize: a.default.arrayOf(a.default.number),
        lockAspectRatio: a.default.bool,
        maxConstraints: a.default.arrayOf(a.default.number),
        minConstraints: a.default.arrayOf(a.default.number),
        onResizeStop: a.default.func,
        onResizeStart: a.default.func,
        onResize: a.default.func,
        resizeHandles: a.default.arrayOf(
          a.default.oneOf(["s", "w", "e", "n", "sw", "nw", "se", "ne"]),
        ),
        transformScale: a.default.number,
        width: function () {
          for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
          var r,
            i = t[0];
          return "both" === i.axis || "x" === i.axis
            ? (r = a.default.number).isRequired.apply(r, t)
            : a.default.number.apply(a.default, t);
        },
      };
      t.resizableProps = i;
    },
    6441: (e) => {
      "use strict";
      e.exports = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
    },
    6609: (e, t, n) => {
      "use strict";
      t.default = void 0;
      var r = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e)) return { default: e };
          var n = u(t);
          if (n && n.has(e)) return n.get(e);
          var r = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var i in e)
            if ("default" !== i && Object.prototype.hasOwnProperty.call(e, i)) {
              var o = a ? Object.getOwnPropertyDescriptor(e, i) : null;
              o && (o.get || o.set) ? Object.defineProperty(r, i, o) : (r[i] = e[i]);
            }
          ((r.default = e), n && n.set(e, r));
          return r;
        })(n(5959)),
        a = l(n(2688)),
        i = l(n(1794)),
        o = n(6333),
        s = [
          "handle",
          "handleSize",
          "onResize",
          "onResizeStart",
          "onResizeStop",
          "draggableOpts",
          "minConstraints",
          "maxConstraints",
          "lockAspectRatio",
          "axis",
          "width",
          "height",
          "resizeHandles",
          "style",
          "transformScale",
        ];
      function l(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function u(e) {
        if ("function" != typeof WeakMap) return null;
        var t = new WeakMap(),
          n = new WeakMap();
        return (u = function (e) {
          return e ? n : t;
        })(e);
      }
      function c() {
        return (
          (c = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
              }),
          c.apply(this, arguments)
        );
      }
      function d(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          (t &&
            (r = r.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, r));
        }
        return n;
      }
      function p(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? d(Object(n), !0).forEach(function (t) {
                h(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : d(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function h(e, t, n) {
        return (
          (t = (function (e) {
            var t = (function (e, t) {
              if ("object" != typeof e || null === e) return e;
              var n = e[Symbol.toPrimitive];
              if (void 0 !== n) {
                var r = n.call(e, t || "default");
                if ("object" != typeof r) return r;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return ("string" === t ? String : Number)(e);
            })(e, "string");
            return "symbol" == typeof t ? t : String(t);
          })(t)) in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
      function f(e, t) {
        return (
          (f = Object.setPrototypeOf
            ? Object.setPrototypeOf.bind()
            : function (e, t) {
                return ((e.__proto__ = t), e);
              }),
          f(e, t)
        );
      }
      var m = (function (e) {
        var t, n;
        function a() {
          for (var t, n = arguments.length, r = new Array(n), a = 0; a < n; a++)
            r[a] = arguments[a];
          return (
            ((t = e.call.apply(e, [this].concat(r)) || this).state = {
              width: t.props.width,
              height: t.props.height,
              propsWidth: t.props.width,
              propsHeight: t.props.height,
            }),
            (t.onResize = function (e, n) {
              var r = n.size;
              t.props.onResize
                ? (null == e.persist || e.persist(),
                  t.setState(r, function () {
                    return t.props.onResize && t.props.onResize(e, n);
                  }))
                : t.setState(r);
            }),
            t
          );
        }
        return (
          (n = e),
          ((t = a).prototype = Object.create(n.prototype)),
          (t.prototype.constructor = t),
          f(t, n),
          (a.getDerivedStateFromProps = function (e, t) {
            return t.propsWidth !== e.width || t.propsHeight !== e.height
              ? { width: e.width, height: e.height, propsWidth: e.width, propsHeight: e.height }
              : null;
          }),
          (a.prototype.render = function () {
            var e = this.props,
              t = e.handle,
              n = e.handleSize,
              a = (e.onResize, e.onResizeStart),
              o = e.onResizeStop,
              l = e.draggableOpts,
              u = e.minConstraints,
              d = e.maxConstraints,
              h = e.lockAspectRatio,
              f = e.axis,
              m = (e.width, e.height, e.resizeHandles),
              g = e.style,
              v = e.transformScale,
              b = (function (e, t) {
                if (null == e) return {};
                var n,
                  r,
                  a = {},
                  i = Object.keys(e);
                for (r = 0; r < i.length; r++) ((n = i[r]), t.indexOf(n) >= 0 || (a[n] = e[n]));
                return a;
              })(e, s);
            return r.createElement(
              i.default,
              {
                axis: f,
                draggableOpts: l,
                handle: t,
                handleSize: n,
                height: this.state.height,
                lockAspectRatio: h,
                maxConstraints: d,
                minConstraints: u,
                onResizeStart: a,
                onResize: this.onResize,
                onResizeStop: o,
                resizeHandles: m,
                transformScale: v,
                width: this.state.width,
              },
              r.createElement(
                "div",
                c({}, b, {
                  style: p(
                    p({}, g),
                    {},
                    { width: this.state.width + "px", height: this.state.height + "px" },
                  ),
                }),
              ),
            );
          }),
          a
        );
      })(r.Component);
      ((t.default = m),
        (m.propTypes = p(p({}, o.resizableProps), {}, { children: a.default.element })));
    },
    6732: (e, t) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.dontSetMe = function (e, t, n) {
          if (e[t])
            return new Error(
              `Invalid prop ${t} passed to ${n} - do not set this, set it on the child.`,
            );
        }),
        (t.findInArray = function (e, t) {
          for (let n = 0, r = e.length; n < r; n++) if (t.apply(t, [e[n], n, e])) return e[n];
        }),
        (t.int = function (e) {
          return parseInt(e, 10);
        }),
        (t.isFunction = function (e) {
          return (
            "function" == typeof e || "[object Function]" === Object.prototype.toString.call(e)
          );
        }),
        (t.isNum = function (e) {
          return "number" == typeof e && !isNaN(e);
        }));
    },
    6805: (e, t, n) => {
      "use strict";
      function r(e) {
        return (
          (r =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          r(e)
        );
      }
      t.default = function (e) {
        var t;
        return (
          (t = (function (t) {
            !(function (e, t) {
              if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function");
              ((e.prototype = Object.create(t && t.prototype, {
                constructor: { value: e, writable: !0, configurable: !0 },
              })),
                Object.defineProperty(e, "prototype", { writable: !1 }),
                t && p(e, t));
            })(u, t);
            var n,
              i,
              l =
                ((n = u),
                (i = (function () {
                  if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                  if (Reflect.construct.sham) return !1;
                  if ("function" == typeof Proxy) return !0;
                  try {
                    return (
                      Boolean.prototype.valueOf.call(
                        Reflect.construct(Boolean, [], function () {}),
                      ),
                      !0
                    );
                  } catch (e) {
                    return !1;
                  }
                })()),
                function () {
                  var e,
                    t = f(n);
                  if (i) {
                    var a = f(this).constructor;
                    e = Reflect.construct(t, arguments, a);
                  } else e = t.apply(this, arguments);
                  return (function (e, t) {
                    if (t && ("object" === r(t) || "function" == typeof t)) return t;
                    if (void 0 !== t)
                      throw new TypeError(
                        "Derived constructors may only return object or undefined",
                      );
                    return h(e);
                  })(this, e);
                });
            function u() {
              var e;
              !(function (e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
              })(this, u);
              for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
                n[r] = arguments[r];
              return (
                m(h((e = l.call.apply(l, [this].concat(n)))), "state", { width: 1280 }),
                m(h(e), "elementRef", a.createRef()),
                m(h(e), "mounted", !1),
                m(h(e), "onWindowResize", function () {
                  if (e.mounted) {
                    var t = e.elementRef.current;
                    t instanceof HTMLElement &&
                      t.offsetWidth &&
                      e.setState({ width: t.offsetWidth });
                  }
                }),
                e
              );
            }
            return (
              (function (e, t, n) {
                t && d(e.prototype, t);
                n && d(e, n);
                Object.defineProperty(e, "prototype", { writable: !1 });
              })(u, [
                {
                  key: "componentDidMount",
                  value: function () {
                    ((this.mounted = !0),
                      window.addEventListener("resize", this.onWindowResize),
                      this.onWindowResize());
                  },
                },
                {
                  key: "componentWillUnmount",
                  value: function () {
                    ((this.mounted = !1),
                      window.removeEventListener("resize", this.onWindowResize));
                  },
                },
                {
                  key: "render",
                  value: function () {
                    var t = this.props,
                      n = t.measureBeforeMount,
                      r = (function (e, t) {
                        if (null == e) return {};
                        var n,
                          r,
                          a = (function (e, t) {
                            if (null == e) return {};
                            var n,
                              r,
                              a = {},
                              i = Object.keys(e);
                            for (r = 0; r < i.length; r++)
                              ((n = i[r]), t.indexOf(n) >= 0 || (a[n] = e[n]));
                            return a;
                          })(e, t);
                        if (Object.getOwnPropertySymbols) {
                          var i = Object.getOwnPropertySymbols(e);
                          for (r = 0; r < i.length; r++)
                            ((n = i[r]),
                              t.indexOf(n) >= 0 ||
                                (Object.prototype.propertyIsEnumerable.call(e, n) &&
                                  (a[n] = e[n])));
                        }
                        return a;
                      })(t, s);
                    return n && !this.mounted
                      ? a.createElement("div", {
                          className: (0, o.default)(this.props.className, g),
                          style: this.props.style,
                          ref: this.elementRef,
                        })
                      : a.createElement(e, c({ innerRef: this.elementRef }, r, this.state));
                  },
                },
              ]),
              u
            );
          })(a.Component)),
          m(t, "defaultProps", { measureBeforeMount: !1 }),
          m(t, "propTypes", { measureBeforeMount: i.default.bool }),
          t
        );
      };
      var a = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" !== r(e) && "function" != typeof e)) return { default: e };
          var n = u(t);
          if (n && n.has(e)) return n.get(e);
          var a = {},
            i = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var o in e)
            if ("default" !== o && Object.prototype.hasOwnProperty.call(e, o)) {
              var s = i ? Object.getOwnPropertyDescriptor(e, o) : null;
              s && (s.get || s.set) ? Object.defineProperty(a, o, s) : (a[o] = e[o]);
            }
          ((a.default = e), n && n.set(e, a));
          return a;
        })(n(5959)),
        i = l(n(2688)),
        o = l(n(7256)),
        s = ["measureBeforeMount"];
      function l(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function u(e) {
        if ("function" != typeof WeakMap) return null;
        var t = new WeakMap(),
          n = new WeakMap();
        return (u = function (e) {
          return e ? n : t;
        })(e);
      }
      function c() {
        return (
          (c =
            Object.assign ||
            function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var n = arguments[t];
                for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
              }
              return e;
            }),
          c.apply(this, arguments)
        );
      }
      function d(e, t) {
        for (var n = 0; n < t.length; n++) {
          var r = t[n];
          ((r.enumerable = r.enumerable || !1),
            (r.configurable = !0),
            "value" in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r));
        }
      }
      function p(e, t) {
        return (
          (p =
            Object.setPrototypeOf ||
            function (e, t) {
              return ((e.__proto__ = t), e);
            }),
          p(e, t)
        );
      }
      function h(e) {
        if (void 0 === e)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e;
      }
      function f(e) {
        return (
          (f = Object.setPrototypeOf
            ? Object.getPrototypeOf
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              }),
          f(e)
        );
      }
      function m(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
      var g = "react-grid-layout";
    },
    7222: (e, t, n) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.resizeHandleType = t.resizeHandleAxesType = t.default = void 0));
      var r = i(n(2688)),
        a = i(n(5959));
      function i(e) {
        return e && e.__esModule ? e : { default: e };
      }
      var o = r.default.arrayOf(r.default.oneOf(["s", "w", "e", "n", "sw", "nw", "se", "ne"]));
      t.resizeHandleAxesType = o;
      var s = r.default.oneOfType([r.default.node, r.default.func]);
      t.resizeHandleType = s;
      var l = {
        className: r.default.string,
        style: r.default.object,
        width: r.default.number,
        autoSize: r.default.bool,
        cols: r.default.number,
        draggableCancel: r.default.string,
        draggableHandle: r.default.string,
        verticalCompact: function (e) {
          (e.verticalCompact, 0);
        },
        compactType: r.default.oneOf(["vertical", "horizontal"]),
        layout: function (e) {
          var t = e.layout;
          void 0 !== t && n(414).validateLayout(t, "layout");
        },
        margin: r.default.arrayOf(r.default.number),
        containerPadding: r.default.arrayOf(r.default.number),
        rowHeight: r.default.number,
        maxRows: r.default.number,
        isBounded: r.default.bool,
        isDraggable: r.default.bool,
        isResizable: r.default.bool,
        allowOverlap: r.default.bool,
        preventCollision: r.default.bool,
        useCSSTransforms: r.default.bool,
        transformScale: r.default.number,
        isDroppable: r.default.bool,
        resizeHandles: o,
        resizeHandle: s,
        onLayoutChange: r.default.func,
        onDragStart: r.default.func,
        onDrag: r.default.func,
        onDragStop: r.default.func,
        onResizeStart: r.default.func,
        onResize: r.default.func,
        onResizeStop: r.default.func,
        onDrop: r.default.func,
        droppingItem: r.default.shape({
          i: r.default.string.isRequired,
          w: r.default.number.isRequired,
          h: r.default.number.isRequired,
        }),
        children: function (e, t) {
          var n = e[t],
            r = {};
          a.default.Children.forEach(n, function (e) {
            if (null != (null == e ? void 0 : e.key)) {
              if (r[e.key])
                throw new Error(
                  'Duplicate child key "' +
                    e.key +
                    '" found! This will cause problems in ReactGridLayout.',
                );
              r[e.key] = !0;
            }
          });
        },
        innerRef: r.default.any,
      };
      t.default = l;
    },
    7256: (e, t, n) => {
      "use strict";
      function r(e) {
        var t,
          n,
          a = "";
        if ("string" == typeof e || "number" == typeof e) a += e;
        else if ("object" == typeof e)
          if (Array.isArray(e))
            for (t = 0; t < e.length; t++) e[t] && (n = r(e[t])) && (a && (a += " "), (a += n));
          else for (t in e) e[t] && (a && (a += " "), (a += t));
        return a;
      }
      function a() {
        for (var e, t, n = 0, a = ""; n < arguments.length; )
          (e = arguments[n++]) && (t = r(e)) && (a && (a += " "), (a += t));
        return a;
      }
      (n.r(t), n.d(t, { clsx: () => a, default: () => i }));
      const i = a;
    },
    7350: (e, t) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.browserPrefixToKey = a),
        (t.browserPrefixToStyle = function (e, t) {
          return t ? `-${t.toLowerCase()}-${e}` : e;
        }),
        (t.default = void 0),
        (t.getPrefix = r));
      const n = ["Moz", "Webkit", "O", "ms"];
      function r() {
        let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "transform";
        if ("undefined" == typeof window) return "";
        const t = window.document?.documentElement?.style;
        if (!t) return "";
        if (e in t) return "";
        for (let r = 0; r < n.length; r++) if (a(e, n[r]) in t) return n[r];
        return "";
      }
      function a(e, t) {
        return t
          ? `${t}${(function (e) {
              let t = "",
                n = !0;
              for (let r = 0; r < e.length; r++)
                n ? ((t += e[r].toUpperCase()), (n = !1)) : "-" === e[r] ? (n = !0) : (t += e[r]);
              return t;
            })(e)}`
          : e;
      }
      t.default = r();
    },
    7434: (e) => {
      e.exports = function (e, t, n) {
        return (
          e === t ||
          (e.className === t.className &&
            n(e.style, t.style) &&
            e.width === t.width &&
            e.autoSize === t.autoSize &&
            e.cols === t.cols &&
            e.draggableCancel === t.draggableCancel &&
            e.draggableHandle === t.draggableHandle &&
            n(e.verticalCompact, t.verticalCompact) &&
            n(e.compactType, t.compactType) &&
            n(e.layout, t.layout) &&
            n(e.margin, t.margin) &&
            n(e.containerPadding, t.containerPadding) &&
            e.rowHeight === t.rowHeight &&
            e.maxRows === t.maxRows &&
            e.isBounded === t.isBounded &&
            e.isDraggable === t.isDraggable &&
            e.isResizable === t.isResizable &&
            e.allowOverlap === t.allowOverlap &&
            e.preventCollision === t.preventCollision &&
            e.useCSSTransforms === t.useCSSTransforms &&
            e.transformScale === t.transformScale &&
            e.isDroppable === t.isDroppable &&
            n(e.resizeHandles, t.resizeHandles) &&
            n(e.resizeHandle, t.resizeHandle) &&
            e.onLayoutChange === t.onLayoutChange &&
            e.onDragStart === t.onDragStart &&
            e.onDrag === t.onDrag &&
            e.onDragStop === t.onDragStop &&
            e.onResizeStart === t.onResizeStart &&
            e.onResize === t.onResize &&
            e.onResizeStop === t.onResizeStop &&
            e.onDrop === t.onDrop &&
            n(e.droppingItem, t.droppingItem) &&
            n(e.innerRef, t.innerRef))
        );
      };
    },
    7842: (e, t, n) => {
      e = n.nmd(e);
      var r = "__lodash_hash_undefined__",
        a = 9007199254740991,
        i = "[object Arguments]",
        o = "[object Array]",
        s = "[object Boolean]",
        l = "[object Date]",
        u = "[object Error]",
        c = "[object Function]",
        d = "[object Map]",
        p = "[object Number]",
        h = "[object Object]",
        f = "[object Promise]",
        m = "[object RegExp]",
        g = "[object Set]",
        v = "[object String]",
        b = "[object Symbol]",
        y = "[object WeakMap]",
        w = "[object ArrayBuffer]",
        S = "[object DataView]",
        x = /^\[object .+?Constructor\]$/,
        _ = /^(?:0|[1-9]\d*)$/,
        C = {};
      ((C["[object Float32Array]"] =
        C["[object Float64Array]"] =
        C["[object Int8Array]"] =
        C["[object Int16Array]"] =
        C["[object Int32Array]"] =
        C["[object Uint8Array]"] =
        C["[object Uint8ClampedArray]"] =
        C["[object Uint16Array]"] =
        C["[object Uint32Array]"] =
          !0),
        (C[i] =
          C[o] =
          C[w] =
          C[s] =
          C[S] =
          C[l] =
          C[u] =
          C[c] =
          C[d] =
          C[p] =
          C[h] =
          C[m] =
          C[g] =
          C[v] =
          C[y] =
            !1));
      var O = "object" == typeof n.g && n.g && n.g.Object === Object && n.g,
        R = "object" == typeof self && self && self.Object === Object && self,
        k = O || R || Function("return this")(),
        E = t && !t.nodeType && t,
        T = E && e && !e.nodeType && e,
        D = T && T.exports === E,
        P = D && O.process,
        A = (function () {
          try {
            return P && P.binding && P.binding("util");
          } catch (e) {}
        })(),
        I = A && A.isTypedArray;
      function V(e, t) {
        for (var n = -1, r = null == e ? 0 : e.length; ++n < r; ) if (t(e[n], n, e)) return !0;
        return !1;
      }
      function M(e) {
        var t = -1,
          n = Array(e.size);
        return (
          e.forEach(function (e, r) {
            n[++t] = [r, e];
          }),
          n
        );
      }
      function L(e) {
        var t = -1,
          n = Array(e.size);
        return (
          e.forEach(function (e) {
            n[++t] = e;
          }),
          n
        );
      }
      var F,
        j,
        N,
        B = Array.prototype,
        z = Function.prototype,
        $ = Object.prototype,
        W = k["__core-js_shared__"],
        H = z.toString,
        U = $.hasOwnProperty,
        q = (F = /[^.]+$/.exec((W && W.keys && W.keys.IE_PROTO) || "")) ? "Symbol(src)_1." + F : "",
        G = $.toString,
        Q = RegExp(
          "^" +
            H.call(U)
              .replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
              .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") +
            "$",
        ),
        K = D ? k.Buffer : void 0,
        Y = k.Symbol,
        Z = k.Uint8Array,
        X = $.propertyIsEnumerable,
        J = B.splice,
        ee = Y ? Y.toStringTag : void 0,
        te = Object.getOwnPropertySymbols,
        ne = K ? K.isBuffer : void 0,
        re =
          ((j = Object.keys),
          (N = Object),
          function (e) {
            return j(N(e));
          }),
        ae = Ae(k, "DataView"),
        ie = Ae(k, "Map"),
        oe = Ae(k, "Promise"),
        se = Ae(k, "Set"),
        le = Ae(k, "WeakMap"),
        ue = Ae(Object, "create"),
        ce = Le(ae),
        de = Le(ie),
        pe = Le(oe),
        he = Le(se),
        fe = Le(le),
        me = Y ? Y.prototype : void 0,
        ge = me ? me.valueOf : void 0;
      function ve(e) {
        var t = -1,
          n = null == e ? 0 : e.length;
        for (this.clear(); ++t < n; ) {
          var r = e[t];
          this.set(r[0], r[1]);
        }
      }
      function be(e) {
        var t = -1,
          n = null == e ? 0 : e.length;
        for (this.clear(); ++t < n; ) {
          var r = e[t];
          this.set(r[0], r[1]);
        }
      }
      function ye(e) {
        var t = -1,
          n = null == e ? 0 : e.length;
        for (this.clear(); ++t < n; ) {
          var r = e[t];
          this.set(r[0], r[1]);
        }
      }
      function we(e) {
        var t = -1,
          n = null == e ? 0 : e.length;
        for (this.__data__ = new ye(); ++t < n; ) this.add(e[t]);
      }
      function Se(e) {
        var t = (this.__data__ = new be(e));
        this.size = t.size;
      }
      function xe(e, t) {
        var n = Ne(e),
          r = !n && je(e),
          a = !n && !r && Be(e),
          i = !n && !r && !a && Ue(e),
          o = n || r || a || i,
          s = o
            ? (function (e, t) {
                for (var n = -1, r = Array(e); ++n < e; ) r[n] = t(n);
                return r;
              })(e.length, String)
            : [],
          l = s.length;
        for (var u in e)
          (!t && !U.call(e, u)) ||
            (o &&
              ("length" == u ||
                (a && ("offset" == u || "parent" == u)) ||
                (i && ("buffer" == u || "byteLength" == u || "byteOffset" == u)) ||
                Me(u, l))) ||
            s.push(u);
        return s;
      }
      function _e(e, t) {
        for (var n = e.length; n--; ) if (Fe(e[n][0], t)) return n;
        return -1;
      }
      function Ce(e) {
        return null == e
          ? void 0 === e
            ? "[object Undefined]"
            : "[object Null]"
          : ee && ee in Object(e)
            ? (function (e) {
                var t = U.call(e, ee),
                  n = e[ee];
                try {
                  e[ee] = void 0;
                  var r = !0;
                } catch (e) {}
                var a = G.call(e);
                r && (t ? (e[ee] = n) : delete e[ee]);
                return a;
              })(e)
            : (function (e) {
                return G.call(e);
              })(e);
      }
      function Oe(e) {
        return He(e) && Ce(e) == i;
      }
      function Re(e, t, n, r, a) {
        return (
          e === t ||
          (null == e || null == t || (!He(e) && !He(t))
            ? e != e && t != t
            : (function (e, t, n, r, a, c) {
                var f = Ne(e),
                  y = Ne(t),
                  x = f ? o : Ve(e),
                  _ = y ? o : Ve(t),
                  C = (x = x == i ? h : x) == h,
                  O = (_ = _ == i ? h : _) == h,
                  R = x == _;
                if (R && Be(e)) {
                  if (!Be(t)) return !1;
                  ((f = !0), (C = !1));
                }
                if (R && !C)
                  return (
                    c || (c = new Se()),
                    f || Ue(e)
                      ? Te(e, t, n, r, a, c)
                      : (function (e, t, n, r, a, i, o) {
                          switch (n) {
                            case S:
                              if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset)
                                return !1;
                              ((e = e.buffer), (t = t.buffer));
                            case w:
                              return !(e.byteLength != t.byteLength || !i(new Z(e), new Z(t)));
                            case s:
                            case l:
                            case p:
                              return Fe(+e, +t);
                            case u:
                              return e.name == t.name && e.message == t.message;
                            case m:
                            case v:
                              return e == t + "";
                            case d:
                              var c = M;
                            case g:
                              var h = 1 & r;
                              if ((c || (c = L), e.size != t.size && !h)) return !1;
                              var f = o.get(e);
                              if (f) return f == t;
                              ((r |= 2), o.set(e, t));
                              var y = Te(c(e), c(t), r, a, i, o);
                              return (o.delete(e), y);
                            case b:
                              if (ge) return ge.call(e) == ge.call(t);
                          }
                          return !1;
                        })(e, t, x, n, r, a, c)
                  );
                if (!(1 & n)) {
                  var k = C && U.call(e, "__wrapped__"),
                    E = O && U.call(t, "__wrapped__");
                  if (k || E) {
                    var T = k ? e.value() : e,
                      D = E ? t.value() : t;
                    return (c || (c = new Se()), a(T, D, n, r, c));
                  }
                }
                if (!R) return !1;
                return (
                  c || (c = new Se()),
                  (function (e, t, n, r, a, i) {
                    var o = 1 & n,
                      s = De(e),
                      l = s.length,
                      u = De(t),
                      c = u.length;
                    if (l != c && !o) return !1;
                    var d = l;
                    for (; d--; ) {
                      var p = s[d];
                      if (!(o ? p in t : U.call(t, p))) return !1;
                    }
                    var h = i.get(e);
                    if (h && i.get(t)) return h == t;
                    var f = !0;
                    (i.set(e, t), i.set(t, e));
                    var m = o;
                    for (; ++d < l; ) {
                      var g = e[(p = s[d])],
                        v = t[p];
                      if (r) var b = o ? r(v, g, p, t, e, i) : r(g, v, p, e, t, i);
                      if (!(void 0 === b ? g === v || a(g, v, n, r, i) : b)) {
                        f = !1;
                        break;
                      }
                      m || (m = "constructor" == p);
                    }
                    if (f && !m) {
                      var y = e.constructor,
                        w = t.constructor;
                      y == w ||
                        !("constructor" in e) ||
                        !("constructor" in t) ||
                        ("function" == typeof y &&
                          y instanceof y &&
                          "function" == typeof w &&
                          w instanceof w) ||
                        (f = !1);
                    }
                    return (i.delete(e), i.delete(t), f);
                  })(e, t, n, r, a, c)
                );
              })(e, t, n, r, Re, a))
        );
      }
      function ke(e) {
        return (
          !(
            !We(e) ||
            (function (e) {
              return !!q && q in e;
            })(e)
          ) && (ze(e) ? Q : x).test(Le(e))
        );
      }
      function Ee(e) {
        if (
          ((n = (t = e) && t.constructor),
          (r = ("function" == typeof n && n.prototype) || $),
          t !== r)
        )
          return re(e);
        var t,
          n,
          r,
          a = [];
        for (var i in Object(e)) U.call(e, i) && "constructor" != i && a.push(i);
        return a;
      }
      function Te(e, t, n, r, a, i) {
        var o = 1 & n,
          s = e.length,
          l = t.length;
        if (s != l && !(o && l > s)) return !1;
        var u = i.get(e);
        if (u && i.get(t)) return u == t;
        var c = -1,
          d = !0,
          p = 2 & n ? new we() : void 0;
        for (i.set(e, t), i.set(t, e); ++c < s; ) {
          var h = e[c],
            f = t[c];
          if (r) var m = o ? r(f, h, c, t, e, i) : r(h, f, c, e, t, i);
          if (void 0 !== m) {
            if (m) continue;
            d = !1;
            break;
          }
          if (p) {
            if (
              !V(t, function (e, t) {
                if (((o = t), !p.has(o) && (h === e || a(h, e, n, r, i)))) return p.push(t);
                var o;
              })
            ) {
              d = !1;
              break;
            }
          } else if (h !== f && !a(h, f, n, r, i)) {
            d = !1;
            break;
          }
        }
        return (i.delete(e), i.delete(t), d);
      }
      function De(e) {
        return (function (e, t, n) {
          var r = t(e);
          return Ne(e)
            ? r
            : (function (e, t) {
                for (var n = -1, r = t.length, a = e.length; ++n < r; ) e[a + n] = t[n];
                return e;
              })(r, n(e));
        })(e, qe, Ie);
      }
      function Pe(e, t) {
        var n,
          r,
          a = e.__data__;
        return (
          "string" == (r = typeof (n = t)) || "number" == r || "symbol" == r || "boolean" == r
            ? "__proto__" !== n
            : null === n
        )
          ? a["string" == typeof t ? "string" : "hash"]
          : a.map;
      }
      function Ae(e, t) {
        var n = (function (e, t) {
          return null == e ? void 0 : e[t];
        })(e, t);
        return ke(n) ? n : void 0;
      }
      ((ve.prototype.clear = function () {
        ((this.__data__ = ue ? ue(null) : {}), (this.size = 0));
      }),
        (ve.prototype.delete = function (e) {
          var t = this.has(e) && delete this.__data__[e];
          return ((this.size -= t ? 1 : 0), t);
        }),
        (ve.prototype.get = function (e) {
          var t = this.__data__;
          if (ue) {
            var n = t[e];
            return n === r ? void 0 : n;
          }
          return U.call(t, e) ? t[e] : void 0;
        }),
        (ve.prototype.has = function (e) {
          var t = this.__data__;
          return ue ? void 0 !== t[e] : U.call(t, e);
        }),
        (ve.prototype.set = function (e, t) {
          var n = this.__data__;
          return ((this.size += this.has(e) ? 0 : 1), (n[e] = ue && void 0 === t ? r : t), this);
        }),
        (be.prototype.clear = function () {
          ((this.__data__ = []), (this.size = 0));
        }),
        (be.prototype.delete = function (e) {
          var t = this.__data__,
            n = _e(t, e);
          return !(n < 0) && (n == t.length - 1 ? t.pop() : J.call(t, n, 1), --this.size, !0);
        }),
        (be.prototype.get = function (e) {
          var t = this.__data__,
            n = _e(t, e);
          return n < 0 ? void 0 : t[n][1];
        }),
        (be.prototype.has = function (e) {
          return _e(this.__data__, e) > -1;
        }),
        (be.prototype.set = function (e, t) {
          var n = this.__data__,
            r = _e(n, e);
          return (r < 0 ? (++this.size, n.push([e, t])) : (n[r][1] = t), this);
        }),
        (ye.prototype.clear = function () {
          ((this.size = 0),
            (this.__data__ = { hash: new ve(), map: new (ie || be)(), string: new ve() }));
        }),
        (ye.prototype.delete = function (e) {
          var t = Pe(this, e).delete(e);
          return ((this.size -= t ? 1 : 0), t);
        }),
        (ye.prototype.get = function (e) {
          return Pe(this, e).get(e);
        }),
        (ye.prototype.has = function (e) {
          return Pe(this, e).has(e);
        }),
        (ye.prototype.set = function (e, t) {
          var n = Pe(this, e),
            r = n.size;
          return (n.set(e, t), (this.size += n.size == r ? 0 : 1), this);
        }),
        (we.prototype.add = we.prototype.push =
          function (e) {
            return (this.__data__.set(e, r), this);
          }),
        (we.prototype.has = function (e) {
          return this.__data__.has(e);
        }),
        (Se.prototype.clear = function () {
          ((this.__data__ = new be()), (this.size = 0));
        }),
        (Se.prototype.delete = function (e) {
          var t = this.__data__,
            n = t.delete(e);
          return ((this.size = t.size), n);
        }),
        (Se.prototype.get = function (e) {
          return this.__data__.get(e);
        }),
        (Se.prototype.has = function (e) {
          return this.__data__.has(e);
        }),
        (Se.prototype.set = function (e, t) {
          var n = this.__data__;
          if (n instanceof be) {
            var r = n.__data__;
            if (!ie || r.length < 199) return (r.push([e, t]), (this.size = ++n.size), this);
            n = this.__data__ = new ye(r);
          }
          return (n.set(e, t), (this.size = n.size), this);
        }));
      var Ie = te
          ? function (e) {
              return null == e
                ? []
                : ((e = Object(e)),
                  (function (e, t) {
                    for (var n = -1, r = null == e ? 0 : e.length, a = 0, i = []; ++n < r; ) {
                      var o = e[n];
                      t(o, n, e) && (i[a++] = o);
                    }
                    return i;
                  })(te(e), function (t) {
                    return X.call(e, t);
                  }));
            }
          : function () {
              return [];
            },
        Ve = Ce;
      function Me(e, t) {
        return (
          !!(t = null == t ? a : t) &&
          ("number" == typeof e || _.test(e)) &&
          e > -1 &&
          e % 1 == 0 &&
          e < t
        );
      }
      function Le(e) {
        if (null != e) {
          try {
            return H.call(e);
          } catch (e) {}
          try {
            return e + "";
          } catch (e) {}
        }
        return "";
      }
      function Fe(e, t) {
        return e === t || (e != e && t != t);
      }
      ((ae && Ve(new ae(new ArrayBuffer(1))) != S) ||
        (ie && Ve(new ie()) != d) ||
        (oe && Ve(oe.resolve()) != f) ||
        (se && Ve(new se()) != g) ||
        (le && Ve(new le()) != y)) &&
        (Ve = function (e) {
          var t = Ce(e),
            n = t == h ? e.constructor : void 0,
            r = n ? Le(n) : "";
          if (r)
            switch (r) {
              case ce:
                return S;
              case de:
                return d;
              case pe:
                return f;
              case he:
                return g;
              case fe:
                return y;
            }
          return t;
        });
      var je = Oe(
          (function () {
            return arguments;
          })(),
        )
          ? Oe
          : function (e) {
              return He(e) && U.call(e, "callee") && !X.call(e, "callee");
            },
        Ne = Array.isArray;
      var Be =
        ne ||
        function () {
          return !1;
        };
      function ze(e) {
        if (!We(e)) return !1;
        var t = Ce(e);
        return (
          t == c ||
          "[object GeneratorFunction]" == t ||
          "[object AsyncFunction]" == t ||
          "[object Proxy]" == t
        );
      }
      function $e(e) {
        return "number" == typeof e && e > -1 && e % 1 == 0 && e <= a;
      }
      function We(e) {
        var t = typeof e;
        return null != e && ("object" == t || "function" == t);
      }
      function He(e) {
        return null != e && "object" == typeof e;
      }
      var Ue = I
        ? (function (e) {
            return function (t) {
              return e(t);
            };
          })(I)
        : function (e) {
            return He(e) && $e(e.length) && !!C[Ce(e)];
          };
      function qe(e) {
        return null != (t = e) && $e(t.length) && !ze(t) ? xe(e) : Ee(e);
        var t;
      }
      e.exports = function (e, t) {
        return Re(e, t);
      };
    },
    7988: (e, t) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        (t.default = function () {
          0;
        }));
    },
    8100: (e, t, n) => {
      "use strict";
      function r(e) {
        return (
          (r =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          r(e)
        );
      }
      (Object.defineProperty(t, "__esModule", { value: !0 }), (t.default = void 0));
      var a = p(n(5959)),
        i = p(n(2688)),
        o = n(8230),
        s = n(936),
        l = n(414),
        u = n(906),
        c = n(7222),
        d = p(n(7256));
      function p(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function h(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          (t &&
            (r = r.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, r));
        }
        return n;
      }
      function f(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? h(Object(n), !0).forEach(function (t) {
                w(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : h(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function m(e, t) {
        for (var n = 0; n < t.length; n++) {
          var r = t[n];
          ((r.enumerable = r.enumerable || !1),
            (r.configurable = !0),
            "value" in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r));
        }
      }
      function g(e, t) {
        return (
          (g =
            Object.setPrototypeOf ||
            function (e, t) {
              return ((e.__proto__ = t), e);
            }),
          g(e, t)
        );
      }
      function v(e) {
        var t = (function () {
          if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
          if (Reflect.construct.sham) return !1;
          if ("function" == typeof Proxy) return !0;
          try {
            return (
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})),
              !0
            );
          } catch (e) {
            return !1;
          }
        })();
        return function () {
          var n,
            a = y(e);
          if (t) {
            var i = y(this).constructor;
            n = Reflect.construct(a, arguments, i);
          } else n = a.apply(this, arguments);
          return (function (e, t) {
            if (t && ("object" === r(t) || "function" == typeof t)) return t;
            if (void 0 !== t)
              throw new TypeError("Derived constructors may only return object or undefined");
            return b(e);
          })(this, n);
        };
      }
      function b(e) {
        if (void 0 === e)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e;
      }
      function y(e) {
        return (
          (y = Object.setPrototypeOf
            ? Object.getPrototypeOf
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              }),
          y(e)
        );
      }
      function w(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
      var S = (function (e) {
        !(function (e, t) {
          if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function");
          ((e.prototype = Object.create(t && t.prototype, {
            constructor: { value: e, writable: !0, configurable: !0 },
          })),
            Object.defineProperty(e, "prototype", { writable: !1 }),
            t && g(e, t));
        })(c, e);
        var t,
          n,
          r,
          i = v(c);
        function c() {
          var e;
          !(function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          })(this, c);
          for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++) n[r] = arguments[r];
          return (
            w(b((e = i.call.apply(i, [this].concat(n)))), "state", {
              resizing: null,
              dragging: null,
              className: "",
            }),
            w(b(e), "elementRef", a.default.createRef()),
            w(b(e), "onDragStart", function (t, n) {
              var r = n.node,
                a = e.props,
                i = a.onDragStart,
                o = a.transformScale;
              if (i) {
                var s = { top: 0, left: 0 },
                  l = r.offsetParent;
                if (l) {
                  var c = l.getBoundingClientRect(),
                    d = r.getBoundingClientRect(),
                    p = d.left / o,
                    h = c.left / o,
                    f = d.top / o,
                    m = c.top / o;
                  ((s.left = p - h + l.scrollLeft),
                    (s.top = f - m + l.scrollTop),
                    e.setState({ dragging: s }));
                  var g = (0, u.calcXY)(e.getPositionParams(), s.top, s.left, e.props.w, e.props.h),
                    v = g.x,
                    y = g.y;
                  return i.call(b(e), e.props.i, v, y, { e: t, node: r, newPosition: s });
                }
              }
            }),
            w(b(e), "onDrag", function (t, n) {
              var r = n.node,
                a = n.deltaX,
                i = n.deltaY,
                o = e.props.onDrag;
              if (o) {
                if (!e.state.dragging) throw new Error("onDrag called before onDragStart.");
                var s = e.state.dragging.top + i,
                  l = e.state.dragging.left + a,
                  c = e.props,
                  d = c.isBounded,
                  p = c.i,
                  h = c.w,
                  f = c.h,
                  m = c.containerWidth,
                  g = e.getPositionParams();
                if (d) {
                  var v = r.offsetParent;
                  if (v) {
                    var y = e.props,
                      w = y.margin,
                      S = y.rowHeight,
                      x = v.clientHeight - (0, u.calcGridItemWHPx)(f, S, w[1]);
                    s = (0, u.clamp)(s, 0, x);
                    var _ = (0, u.calcGridColWidth)(g),
                      C = m - (0, u.calcGridItemWHPx)(h, _, w[0]);
                    l = (0, u.clamp)(l, 0, C);
                  }
                }
                var O = { top: s, left: l };
                e.setState({ dragging: O });
                var R = (0, u.calcXY)(g, s, l, h, f),
                  k = R.x,
                  E = R.y;
                return o.call(b(e), p, k, E, { e: t, node: r, newPosition: O });
              }
            }),
            w(b(e), "onDragStop", function (t, n) {
              var r = n.node,
                a = e.props.onDragStop;
              if (a) {
                if (!e.state.dragging) throw new Error("onDragEnd called before onDragStart.");
                var i = e.props,
                  o = i.w,
                  s = i.h,
                  l = i.i,
                  c = e.state.dragging,
                  d = c.left,
                  p = c.top,
                  h = { top: p, left: d };
                e.setState({ dragging: null });
                var f = (0, u.calcXY)(e.getPositionParams(), p, d, o, s),
                  m = f.x,
                  g = f.y;
                return a.call(b(e), l, m, g, { e: t, node: r, newPosition: h });
              }
            }),
            w(b(e), "onResizeStop", function (t, n) {
              e.onResizeHandler(t, n, "onResizeStop");
            }),
            w(b(e), "onResizeStart", function (t, n) {
              e.onResizeHandler(t, n, "onResizeStart");
            }),
            w(b(e), "onResize", function (t, n) {
              e.onResizeHandler(t, n, "onResize");
            }),
            e
          );
        }
        return (
          (t = c),
          (n = [
            {
              key: "shouldComponentUpdate",
              value: function (e, t) {
                if (this.props.children !== e.children) return !0;
                if (this.props.droppingPosition !== e.droppingPosition) return !0;
                var n = (0, u.calcGridItemPosition)(
                    this.getPositionParams(this.props),
                    this.props.x,
                    this.props.y,
                    this.props.w,
                    this.props.h,
                    this.state,
                  ),
                  r = (0, u.calcGridItemPosition)(this.getPositionParams(e), e.x, e.y, e.w, e.h, t);
                return (
                  !(0, l.fastPositionEqual)(n, r) ||
                  this.props.useCSSTransforms !== e.useCSSTransforms
                );
              },
            },
            {
              key: "componentDidMount",
              value: function () {
                this.moveDroppingItem({});
              },
            },
            {
              key: "componentDidUpdate",
              value: function (e) {
                this.moveDroppingItem(e);
              },
            },
            {
              key: "moveDroppingItem",
              value: function (e) {
                var t = this.props.droppingPosition;
                if (t) {
                  var n = this.elementRef.current;
                  if (n) {
                    var r = e.droppingPosition || { left: 0, top: 0 },
                      a = this.state.dragging,
                      i = (a && t.left !== r.left) || t.top !== r.top;
                    if (a) {
                      if (i) {
                        var o = t.left - a.left,
                          s = t.top - a.top;
                        this.onDrag(t.e, { node: n, deltaX: o, deltaY: s });
                      }
                    } else this.onDragStart(t.e, { node: n, deltaX: t.left, deltaY: t.top });
                  }
                }
              },
            },
            {
              key: "getPositionParams",
              value: function () {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.props;
                return {
                  cols: e.cols,
                  containerPadding: e.containerPadding,
                  containerWidth: e.containerWidth,
                  margin: e.margin,
                  maxRows: e.maxRows,
                  rowHeight: e.rowHeight,
                };
              },
            },
            {
              key: "createStyle",
              value: function (e) {
                var t,
                  n = this.props,
                  r = n.usePercentages,
                  a = n.containerWidth;
                return (
                  n.useCSSTransforms
                    ? (t = (0, l.setTransform)(e))
                    : ((t = (0, l.setTopLeft)(e)),
                      r &&
                        ((t.left = (0, l.perc)(e.left / a)), (t.width = (0, l.perc)(e.width / a)))),
                  t
                );
              },
            },
            {
              key: "mixinDraggable",
              value: function (e, t) {
                return a.default.createElement(
                  o.DraggableCore,
                  {
                    disabled: !t,
                    onStart: this.onDragStart,
                    onDrag: this.onDrag,
                    onStop: this.onDragStop,
                    handle: this.props.handle,
                    cancel:
                      ".react-resizable-handle" +
                      (this.props.cancel ? "," + this.props.cancel : ""),
                    scale: this.props.transformScale,
                    nodeRef: this.elementRef,
                  },
                  e,
                );
              },
            },
            {
              key: "mixinResizable",
              value: function (e, t, n) {
                var r = this.props,
                  i = r.cols,
                  o = r.x,
                  l = r.minW,
                  c = r.minH,
                  d = r.maxW,
                  p = r.maxH,
                  h = r.transformScale,
                  f = r.resizeHandles,
                  m = r.resizeHandle,
                  g = this.getPositionParams(),
                  v = (0, u.calcGridItemPosition)(g, 0, 0, i - o, 0).width,
                  b = (0, u.calcGridItemPosition)(g, 0, 0, l, c),
                  y = (0, u.calcGridItemPosition)(g, 0, 0, d, p),
                  w = [b.width, b.height],
                  S = [Math.min(y.width, v), Math.min(y.height, 1 / 0)];
                return a.default.createElement(
                  s.Resizable,
                  {
                    draggableOpts: { disabled: !n },
                    className: n ? void 0 : "react-resizable-hide",
                    width: t.width,
                    height: t.height,
                    minConstraints: w,
                    maxConstraints: S,
                    onResizeStop: this.onResizeStop,
                    onResizeStart: this.onResizeStart,
                    onResize: this.onResize,
                    transformScale: h,
                    resizeHandles: f,
                    handle: m,
                  },
                  e,
                );
              },
            },
            {
              key: "onResizeHandler",
              value: function (e, t, n) {
                var r = t.node,
                  a = t.size,
                  i = this.props[n];
                if (i) {
                  var o = this.props,
                    s = o.cols,
                    l = o.x,
                    c = o.y,
                    d = o.i,
                    p = o.maxH,
                    h = o.minH,
                    f = this.props,
                    m = f.minW,
                    g = f.maxW,
                    v = (0, u.calcWH)(this.getPositionParams(), a.width, a.height, l, c),
                    b = v.w,
                    y = v.h;
                  ((m = Math.max(m, 1)),
                    (g = Math.min(g, s - l)),
                    (b = (0, u.clamp)(b, m, g)),
                    (y = (0, u.clamp)(y, h, p)),
                    this.setState({ resizing: "onResizeStop" === n ? null : a }),
                    i.call(this, d, b, y, { e, node: r, size: a }));
                }
              },
            },
            {
              key: "render",
              value: function () {
                var e = this.props,
                  t = e.x,
                  n = e.y,
                  r = e.w,
                  i = e.h,
                  o = e.isDraggable,
                  s = e.isResizable,
                  l = e.droppingPosition,
                  c = e.useCSSTransforms,
                  p = (0, u.calcGridItemPosition)(this.getPositionParams(), t, n, r, i, this.state),
                  h = a.default.Children.only(this.props.children),
                  m = a.default.cloneElement(h, {
                    ref: this.elementRef,
                    className: (0, d.default)(
                      "react-grid-item",
                      h.props.className,
                      this.props.className,
                      {
                        static: this.props.static,
                        resizing: Boolean(this.state.resizing),
                        "react-draggable": o,
                        "react-draggable-dragging": Boolean(this.state.dragging),
                        dropping: Boolean(l),
                        cssTransforms: c,
                      },
                    ),
                    style: f(f(f({}, this.props.style), h.props.style), this.createStyle(p)),
                  });
                return ((m = this.mixinResizable(m, p, s)), (m = this.mixinDraggable(m, o)));
              },
            },
          ]),
          n && m(t.prototype, n),
          r && m(t, r),
          Object.defineProperty(t, "prototype", { writable: !1 }),
          c
        );
      })(a.default.Component);
      ((t.default = S),
        w(S, "propTypes", {
          children: i.default.element,
          cols: i.default.number.isRequired,
          containerWidth: i.default.number.isRequired,
          rowHeight: i.default.number.isRequired,
          margin: i.default.array.isRequired,
          maxRows: i.default.number.isRequired,
          containerPadding: i.default.array.isRequired,
          x: i.default.number.isRequired,
          y: i.default.number.isRequired,
          w: i.default.number.isRequired,
          h: i.default.number.isRequired,
          minW: function (e, t) {
            var n = e[t];
            return "number" != typeof n
              ? new Error("minWidth not Number")
              : n > e.w || n > e.maxW
                ? new Error("minWidth larger than item width/maxWidth")
                : void 0;
          },
          maxW: function (e, t) {
            var n = e[t];
            return "number" != typeof n
              ? new Error("maxWidth not Number")
              : n < e.w || n < e.minW
                ? new Error("maxWidth smaller than item width/minWidth")
                : void 0;
          },
          minH: function (e, t) {
            var n = e[t];
            return "number" != typeof n
              ? new Error("minHeight not Number")
              : n > e.h || n > e.maxH
                ? new Error("minHeight larger than item height/maxHeight")
                : void 0;
          },
          maxH: function (e, t) {
            var n = e[t];
            return "number" != typeof n
              ? new Error("maxHeight not Number")
              : n < e.h || n < e.minH
                ? new Error("maxHeight smaller than item height/minHeight")
                : void 0;
          },
          i: i.default.string.isRequired,
          resizeHandles: c.resizeHandleAxesType,
          resizeHandle: c.resizeHandleType,
          onDragStop: i.default.func,
          onDragStart: i.default.func,
          onDrag: i.default.func,
          onResizeStop: i.default.func,
          onResizeStart: i.default.func,
          onResize: i.default.func,
          isDraggable: i.default.bool.isRequired,
          isResizable: i.default.bool.isRequired,
          isBounded: i.default.bool.isRequired,
          static: i.default.bool,
          useCSSTransforms: i.default.bool.isRequired,
          transformScale: i.default.number,
          className: i.default.string,
          handle: i.default.string,
          cancel: i.default.string,
          droppingPosition: i.default.shape({
            e: i.default.object.isRequired,
            left: i.default.number.isRequired,
            top: i.default.number.isRequired,
          }),
        }),
        w(S, "defaultProps", {
          className: "",
          cancel: "",
          handle: "",
          minH: 1,
          minW: 1,
          maxH: 1 / 0,
          maxW: 1 / 0,
          transformScale: 1,
        }));
    },
    8230: (e, t, n) => {
      "use strict";
      const { default: r, DraggableCore: a } = n(9111);
      ((e.exports = r), (e.exports.default = r), (e.exports.DraggableCore = a));
    },
    8784: (e) => {
      function t(e) {
        var n,
          r,
          a = "";
        if ("string" == typeof e || "number" == typeof e) a += e;
        else if ("object" == typeof e)
          if (Array.isArray(e)) {
            var i = e.length;
            for (n = 0; n < i; n++) e[n] && (r = t(e[n])) && (a && (a += " "), (a += r));
          } else for (r in e) e[r] && (a && (a += " "), (a += r));
        return a;
      }
      function n() {
        for (var e, n, r = 0, a = "", i = arguments.length; r < i; r++)
          (e = arguments[r]) && (n = t(e)) && (a && (a += " "), (a += n));
        return a;
      }
      ((e.exports = n), (e.exports.clsx = n));
    },
    9111: (e, t, n) => {
      "use strict";
      (Object.defineProperty(t, "__esModule", { value: !0 }),
        Object.defineProperty(t, "DraggableCore", {
          enumerable: !0,
          get: function () {
            return c.default;
          },
        }),
        (t.default = void 0));
      var r = (function (e, t) {
          if ("function" == typeof WeakMap)
            var n = new WeakMap(),
              r = new WeakMap();
          return (function (e, t) {
            if (!t && e && e.__esModule) return e;
            var a,
              i,
              o = { __proto__: null, default: e };
            if (null === e || ("object" != typeof e && "function" != typeof e)) return o;
            if ((a = t ? r : n)) {
              if (a.has(e)) return a.get(e);
              a.set(e, o);
            }
            for (const t in e)
              "default" !== t &&
                {}.hasOwnProperty.call(e, t) &&
                ((i = (a = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) &&
                (i.get || i.set)
                  ? a(o, t, i)
                  : (o[t] = e[t]));
            return o;
          })(e, t);
        })(n(5959)),
        a = p(n(2688)),
        i = p(n(8398)),
        o = n(8784),
        s = n(2837),
        l = n(402),
        u = n(6732),
        c = p(n(1060)),
        d = p(n(7988));
      function p(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function h() {
        return (
          (h = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
              }),
          h.apply(null, arguments)
        );
      }
      function f(e, t, n) {
        return (
          (t = (function (e) {
            var t = (function (e, t) {
              if ("object" != typeof e || !e) return e;
              var n = e[Symbol.toPrimitive];
              if (void 0 !== n) {
                var r = n.call(e, t || "default");
                if ("object" != typeof r) return r;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return ("string" === t ? String : Number)(e);
            })(e, "string");
            return "symbol" == typeof t ? t : t + "";
          })(t)) in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
      class m extends r.Component {
        static getDerivedStateFromProps(e, t) {
          let { position: n } = e,
            { prevPropsPosition: r } = t;
          return !n || (r && n.x === r.x && n.y === r.y)
            ? null
            : ((0, d.default)("Draggable: getDerivedStateFromProps %j", {
                position: n,
                prevPropsPosition: r,
              }),
              { x: n.x, y: n.y, prevPropsPosition: { ...n } });
        }
        constructor(e) {
          (super(e),
            f(this, "onDragStart", (e, t) => {
              (0, d.default)("Draggable: onDragStart: %j", t);
              if (!1 === this.props.onStart(e, (0, l.createDraggableData)(this, t))) return !1;
              this.setState({ dragging: !0, dragged: !0 });
            }),
            f(this, "onDrag", (e, t) => {
              if (!this.state.dragging) return !1;
              (0, d.default)("Draggable: onDrag: %j", t);
              const n = (0, l.createDraggableData)(this, t),
                r = { x: n.x, y: n.y, slackX: 0, slackY: 0 };
              if (this.props.bounds) {
                const { x: e, y: t } = r;
                ((r.x += this.state.slackX), (r.y += this.state.slackY));
                const [a, i] = (0, l.getBoundPosition)(this, r.x, r.y);
                ((r.x = a),
                  (r.y = i),
                  (r.slackX = this.state.slackX + (e - r.x)),
                  (r.slackY = this.state.slackY + (t - r.y)),
                  (n.x = r.x),
                  (n.y = r.y),
                  (n.deltaX = r.x - this.state.x),
                  (n.deltaY = r.y - this.state.y));
              }
              if (!1 === this.props.onDrag(e, n)) return !1;
              this.setState(r);
            }),
            f(this, "onDragStop", (e, t) => {
              if (!this.state.dragging) return !1;
              if (!1 === this.props.onStop(e, (0, l.createDraggableData)(this, t))) return !1;
              (0, d.default)("Draggable: onDragStop: %j", t);
              const n = { dragging: !1, slackX: 0, slackY: 0 };
              if (Boolean(this.props.position)) {
                const { x: e, y: t } = this.props.position;
                ((n.x = e), (n.y = t));
              }
              this.setState(n);
            }),
            (this.state = {
              dragging: !1,
              dragged: !1,
              x: e.position ? e.position.x : e.defaultPosition.x,
              y: e.position ? e.position.y : e.defaultPosition.y,
              prevPropsPosition: { ...e.position },
              slackX: 0,
              slackY: 0,
              isElementSVG: !1,
            }),
            !e.position ||
              e.onDrag ||
              e.onStop ||
              console.warn(
                "A `position` was applied to this <Draggable>, without drag handlers. This will make this component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the `position` of this element.",
              ));
        }
        componentDidMount() {
          void 0 !== window.SVGElement &&
            this.findDOMNode() instanceof window.SVGElement &&
            this.setState({ isElementSVG: !0 });
        }
        componentWillUnmount() {
          this.state.dragging && this.setState({ dragging: !1 });
        }
        findDOMNode() {
          return this.props?.nodeRef?.current ?? i.default.findDOMNode(this);
        }
        render() {
          const {
            axis: e,
            bounds: t,
            children: n,
            defaultPosition: a,
            defaultClassName: i,
            defaultClassNameDragging: u,
            defaultClassNameDragged: d,
            position: p,
            positionOffset: f,
            scale: m,
            ...g
          } = this.props;
          let v = {},
            b = null;
          const y = !Boolean(p) || this.state.dragging,
            w = p || a,
            S = {
              x: (0, l.canDragX)(this) && y ? this.state.x : w.x,
              y: (0, l.canDragY)(this) && y ? this.state.y : w.y,
            };
          this.state.isElementSVG
            ? (b = (0, s.createSVGTransform)(S, f))
            : (v = (0, s.createCSSTransform)(S, f));
          const x = (0, o.clsx)(n.props.className || "", i, {
            [u]: this.state.dragging,
            [d]: this.state.dragged,
          });
          return r.createElement(
            c.default,
            h({}, g, { onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop }),
            r.cloneElement(r.Children.only(n), {
              className: x,
              style: { ...n.props.style, ...v },
              transform: b,
            }),
          );
        }
      }
      ((t.default = m),
        f(m, "displayName", "Draggable"),
        f(m, "propTypes", {
          ...c.default.propTypes,
          axis: a.default.oneOf(["both", "x", "y", "none"]),
          bounds: a.default.oneOfType([
            a.default.shape({
              left: a.default.number,
              right: a.default.number,
              top: a.default.number,
              bottom: a.default.number,
            }),
            a.default.string,
            a.default.oneOf([!1]),
          ]),
          defaultClassName: a.default.string,
          defaultClassNameDragging: a.default.string,
          defaultClassNameDragged: a.default.string,
          defaultPosition: a.default.shape({ x: a.default.number, y: a.default.number }),
          positionOffset: a.default.shape({
            x: a.default.oneOfType([a.default.number, a.default.string]),
            y: a.default.oneOfType([a.default.number, a.default.string]),
          }),
          position: a.default.shape({ x: a.default.number, y: a.default.number }),
          className: u.dontSetMe,
          style: u.dontSetMe,
          transform: u.dontSetMe,
        }),
        f(m, "defaultProps", {
          ...c.default.defaultProps,
          axis: "both",
          bounds: !1,
          defaultClassName: "react-draggable",
          defaultClassNameDragging: "react-draggable-dragging",
          defaultClassNameDragged: "react-draggable-dragged",
          defaultPosition: { x: 0, y: 0 },
          scale: 1,
        }));
    },
    9482: (e, t, n) => {
      "use strict";
      function r(e) {
        return (
          (r =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          r(e)
        );
      }
      (Object.defineProperty(t, "__esModule", { value: !0 }), (t.default = void 0));
      var a = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" !== r(e) && "function" != typeof e)) return { default: e };
          var n = p(t);
          if (n && n.has(e)) return n.get(e);
          var a = {},
            i = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var o in e)
            if ("default" !== o && Object.prototype.hasOwnProperty.call(e, o)) {
              var s = i ? Object.getOwnPropertyDescriptor(e, o) : null;
              s && (s.get || s.set) ? Object.defineProperty(a, o, s) : (a[o] = e[o]);
            }
          ((a.default = e), n && n.set(e, a));
          return a;
        })(n(5959)),
        i = d(n(7842)),
        o = d(n(7256)),
        s = n(414),
        l = n(906),
        u = d(n(8100)),
        c = d(n(7222));
      function d(e) {
        return e && e.__esModule ? e : { default: e };
      }
      function p(e) {
        if ("function" != typeof WeakMap) return null;
        var t = new WeakMap(),
          n = new WeakMap();
        return (p = function (e) {
          return e ? n : t;
        })(e);
      }
      function h(e) {
        return (
          (function (e) {
            if (Array.isArray(e)) return b(e);
          })(e) ||
          (function (e) {
            if (
              ("undefined" != typeof Symbol && null != e[Symbol.iterator]) ||
              null != e["@@iterator"]
            )
              return Array.from(e);
          })(e) ||
          v(e) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          })()
        );
      }
      function f(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          (t &&
            (r = r.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, r));
        }
        return n;
      }
      function m(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? f(Object(n), !0).forEach(function (t) {
                C(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : f(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function g(e, t) {
        return (
          (function (e) {
            if (Array.isArray(e)) return e;
          })(e) ||
          (function (e, t) {
            var n =
              null == e
                ? null
                : ("undefined" != typeof Symbol && e[Symbol.iterator]) || e["@@iterator"];
            if (null == n) return;
            var r,
              a,
              i = [],
              o = !0,
              s = !1;
            try {
              for (
                n = n.call(e);
                !(o = (r = n.next()).done) && (i.push(r.value), !t || i.length !== t);
                o = !0
              );
            } catch (e) {
              ((s = !0), (a = e));
            } finally {
              try {
                o || null == n.return || n.return();
              } finally {
                if (s) throw a;
              }
            }
            return i;
          })(e, t) ||
          v(e, t) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          })()
        );
      }
      function v(e, t) {
        if (e) {
          if ("string" == typeof e) return b(e, t);
          var n = Object.prototype.toString.call(e).slice(8, -1);
          return (
            "Object" === n && e.constructor && (n = e.constructor.name),
            "Map" === n || "Set" === n
              ? Array.from(e)
              : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                ? b(e, t)
                : void 0
          );
        }
      }
      function b(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r;
      }
      function y(e, t) {
        for (var n = 0; n < t.length; n++) {
          var r = t[n];
          ((r.enumerable = r.enumerable || !1),
            (r.configurable = !0),
            "value" in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r));
        }
      }
      function w(e, t) {
        return (
          (w =
            Object.setPrototypeOf ||
            function (e, t) {
              return ((e.__proto__ = t), e);
            }),
          w(e, t)
        );
      }
      function S(e) {
        var t = (function () {
          if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
          if (Reflect.construct.sham) return !1;
          if ("function" == typeof Proxy) return !0;
          try {
            return (
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})),
              !0
            );
          } catch (e) {
            return !1;
          }
        })();
        return function () {
          var n,
            a = _(e);
          if (t) {
            var i = _(this).constructor;
            n = Reflect.construct(a, arguments, i);
          } else n = a.apply(this, arguments);
          return (function (e, t) {
            if (t && ("object" === r(t) || "function" == typeof t)) return t;
            if (void 0 !== t)
              throw new TypeError("Derived constructors may only return object or undefined");
            return x(e);
          })(this, n);
        };
      }
      function x(e) {
        if (void 0 === e)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e;
      }
      function _(e) {
        return (
          (_ = Object.setPrototypeOf
            ? Object.getPrototypeOf
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              }),
          _(e)
        );
      }
      function C(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
      var O = "react-grid-layout",
        R = !1;
      try {
        R = /firefox/i.test(navigator.userAgent);
      } catch (e) {}
      var k = (function (e) {
        !(function (e, t) {
          if ("function" != typeof t && null !== t)
            throw new TypeError("Super expression must either be null or a function");
          ((e.prototype = Object.create(t && t.prototype, {
            constructor: { value: e, writable: !0, configurable: !0 },
          })),
            Object.defineProperty(e, "prototype", { writable: !1 }),
            t && w(e, t));
        })(d, e);
        var t,
          n,
          r,
          c = S(d);
        function d() {
          var e;
          !(function (e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
          })(this, d);
          for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++) n[r] = arguments[r];
          return (
            C(x((e = c.call.apply(c, [this].concat(n)))), "state", {
              activeDrag: null,
              layout: (0, s.synchronizeLayoutWithChildren)(
                e.props.layout,
                e.props.children,
                e.props.cols,
                (0, s.compactType)(e.props),
                e.props.allowOverlap,
              ),
              mounted: !1,
              oldDragItem: null,
              oldLayout: null,
              oldResizeItem: null,
              droppingDOMNode: null,
              children: [],
            }),
            C(x(e), "dragEnterCounter", 0),
            C(x(e), "onDragStart", function (t, n, r, a) {
              var i = a.e,
                o = a.node,
                l = e.state.layout,
                u = (0, s.getLayoutItem)(l, t);
              if (u)
                return (
                  e.setState({ oldDragItem: (0, s.cloneLayoutItem)(u), oldLayout: l }),
                  e.props.onDragStart(l, u, u, null, i, o)
                );
            }),
            C(x(e), "onDrag", function (t, n, r, a) {
              var i = a.e,
                o = a.node,
                l = e.state.oldDragItem,
                u = e.state.layout,
                c = e.props,
                d = c.cols,
                p = c.allowOverlap,
                h = c.preventCollision,
                f = (0, s.getLayoutItem)(u, t);
              if (f) {
                var m = { w: f.w, h: f.h, x: f.x, y: f.y, placeholder: !0, i: t };
                ((u = (0, s.moveElement)(u, f, n, r, !0, h, (0, s.compactType)(e.props), d, p)),
                  e.props.onDrag(u, l, f, m, i, o),
                  e.setState({
                    layout: p ? u : (0, s.compact)(u, (0, s.compactType)(e.props), d),
                    activeDrag: m,
                  }));
              }
            }),
            C(x(e), "onDragStop", function (t, n, r, a) {
              var i = a.e,
                o = a.node;
              if (e.state.activeDrag) {
                var l = e.state.oldDragItem,
                  u = e.state.layout,
                  c = e.props,
                  d = c.cols,
                  p = c.preventCollision,
                  h = c.allowOverlap,
                  f = (0, s.getLayoutItem)(u, t);
                if (f) {
                  ((u = (0, s.moveElement)(u, f, n, r, !0, p, (0, s.compactType)(e.props), d, h)),
                    e.props.onDragStop(u, l, f, null, i, o));
                  var m = h ? u : (0, s.compact)(u, (0, s.compactType)(e.props), d),
                    g = e.state.oldLayout;
                  (e.setState({ activeDrag: null, layout: m, oldDragItem: null, oldLayout: null }),
                    e.onLayoutMaybeChanged(m, g));
                }
              }
            }),
            C(x(e), "onResizeStart", function (t, n, r, a) {
              var i = a.e,
                o = a.node,
                l = e.state.layout,
                u = (0, s.getLayoutItem)(l, t);
              u &&
                (e.setState({
                  oldResizeItem: (0, s.cloneLayoutItem)(u),
                  oldLayout: e.state.layout,
                }),
                e.props.onResizeStart(l, u, u, null, i, o));
            }),
            C(x(e), "onResize", function (t, n, r, a) {
              var i = a.e,
                o = a.node,
                l = e.state,
                u = l.layout,
                c = l.oldResizeItem,
                d = e.props,
                p = d.cols,
                h = d.preventCollision,
                f = d.allowOverlap,
                v = (0, s.withLayoutItem)(u, t, function (e) {
                  var t;
                  if (h && !f) {
                    var a = (0, s.getAllCollisions)(u, m(m({}, e), {}, { w: n, h: r })).filter(
                      function (t) {
                        return t.i !== e.i;
                      },
                    );
                    if ((t = a.length > 0)) {
                      var i = 1 / 0,
                        o = 1 / 0;
                      (a.forEach(function (t) {
                        (t.x > e.x && (i = Math.min(i, t.x)), t.y > e.y && (o = Math.min(o, t.y)));
                      }),
                        Number.isFinite(i) && (e.w = i - e.x),
                        Number.isFinite(o) && (e.h = o - e.y));
                    }
                  }
                  return (t || ((e.w = n), (e.h = r)), e);
                }),
                b = g(v, 2),
                y = b[0],
                w = b[1];
              if (w) {
                var S = { w: w.w, h: w.h, x: w.x, y: w.y, static: !0, i: t };
                (e.props.onResize(y, c, w, S, i, o),
                  e.setState({
                    layout: f ? y : (0, s.compact)(y, (0, s.compactType)(e.props), p),
                    activeDrag: S,
                  }));
              }
            }),
            C(x(e), "onResizeStop", function (t, n, r, a) {
              var i = a.e,
                o = a.node,
                l = e.state,
                u = l.layout,
                c = l.oldResizeItem,
                d = e.props,
                p = d.cols,
                h = d.allowOverlap,
                f = (0, s.getLayoutItem)(u, t);
              e.props.onResizeStop(u, c, f, null, i, o);
              var m = h ? u : (0, s.compact)(u, (0, s.compactType)(e.props), p),
                g = e.state.oldLayout;
              (e.setState({ activeDrag: null, layout: m, oldResizeItem: null, oldLayout: null }),
                e.onLayoutMaybeChanged(m, g));
            }),
            C(x(e), "onDragOver", function (t) {
              var n;
              if (
                (t.preventDefault(),
                t.stopPropagation(),
                R &&
                  (null === (n = t.nativeEvent.target) || void 0 === n || !n.classList.contains(O)))
              )
                return !1;
              var r = e.props,
                i = r.droppingItem,
                o = r.onDropDragOver,
                s = r.margin,
                u = r.cols,
                c = r.rowHeight,
                d = r.maxRows,
                p = r.width,
                f = r.containerPadding,
                g = r.transformScale,
                v = null == o ? void 0 : o(t);
              if (!1 === v) return (e.state.droppingDOMNode && e.removeDroppingPlaceholder(), !1);
              var b = m(m({}, i), v),
                y = e.state.layout,
                w = t.nativeEvent,
                S = w.layerX,
                x = w.layerY,
                _ = { left: S / g, top: x / g, e: t };
              if (e.state.droppingDOMNode) {
                if (e.state.droppingPosition) {
                  var C = e.state.droppingPosition,
                    k = C.left,
                    E = C.top;
                  (k != S || E != x) && e.setState({ droppingPosition: _ });
                }
              } else {
                var T = {
                    cols: u,
                    margin: s,
                    maxRows: d,
                    rowHeight: c,
                    containerWidth: p,
                    containerPadding: f || s,
                  },
                  D = (0, l.calcXY)(T, x, S, b.w, b.h);
                e.setState({
                  droppingDOMNode: a.createElement("div", { key: b.i }),
                  droppingPosition: _,
                  layout: [].concat(h(y), [
                    m(m({}, b), {}, { x: D.x, y: D.y, static: !1, isDraggable: !0 }),
                  ]),
                });
              }
            }),
            C(x(e), "removeDroppingPlaceholder", function () {
              var t = e.props,
                n = t.droppingItem,
                r = t.cols,
                a = e.state.layout,
                i = (0, s.compact)(
                  a.filter(function (e) {
                    return e.i !== n.i;
                  }),
                  (0, s.compactType)(e.props),
                  r,
                );
              e.setState({
                layout: i,
                droppingDOMNode: null,
                activeDrag: null,
                droppingPosition: void 0,
              });
            }),
            C(x(e), "onDragLeave", function (t) {
              (t.preventDefault(),
                t.stopPropagation(),
                e.dragEnterCounter--,
                0 === e.dragEnterCounter && e.removeDroppingPlaceholder());
            }),
            C(x(e), "onDragEnter", function (t) {
              (t.preventDefault(), t.stopPropagation(), e.dragEnterCounter++);
            }),
            C(x(e), "onDrop", function (t) {
              (t.preventDefault(), t.stopPropagation());
              var n = e.props.droppingItem,
                r = e.state.layout,
                a = r.find(function (e) {
                  return e.i === n.i;
                });
              ((e.dragEnterCounter = 0), e.removeDroppingPlaceholder(), e.props.onDrop(r, a, t));
            }),
            e
          );
        }
        return (
          (t = d),
          (r = [
            {
              key: "getDerivedStateFromProps",
              value: function (e, t) {
                var n;
                return t.activeDrag
                  ? null
                  : ((0, i.default)(e.layout, t.propsLayout) && e.compactType === t.compactType
                      ? (0, s.childrenEqual)(e.children, t.children) || (n = t.layout)
                      : (n = e.layout),
                    n
                      ? {
                          layout: (0, s.synchronizeLayoutWithChildren)(
                            n,
                            e.children,
                            e.cols,
                            (0, s.compactType)(e),
                            e.allowOverlap,
                          ),
                          compactType: e.compactType,
                          children: e.children,
                          propsLayout: e.layout,
                        }
                      : null);
              },
            },
          ]),
          (n = [
            {
              key: "componentDidMount",
              value: function () {
                (this.setState({ mounted: !0 }),
                  this.onLayoutMaybeChanged(this.state.layout, this.props.layout));
              },
            },
            {
              key: "shouldComponentUpdate",
              value: function (e, t) {
                return (
                  this.props.children !== e.children ||
                  !(0, s.fastRGLPropsEqual)(this.props, e, i.default) ||
                  this.state.activeDrag !== t.activeDrag ||
                  this.state.mounted !== t.mounted ||
                  this.state.droppingPosition !== t.droppingPosition
                );
              },
            },
            {
              key: "componentDidUpdate",
              value: function (e, t) {
                if (!this.state.activeDrag) {
                  var n = this.state.layout,
                    r = t.layout;
                  this.onLayoutMaybeChanged(n, r);
                }
              },
            },
            {
              key: "containerHeight",
              value: function () {
                if (this.props.autoSize) {
                  var e = (0, s.bottom)(this.state.layout),
                    t = this.props.containerPadding
                      ? this.props.containerPadding[1]
                      : this.props.margin[1];
                  return e * this.props.rowHeight + (e - 1) * this.props.margin[1] + 2 * t + "px";
                }
              },
            },
            {
              key: "onLayoutMaybeChanged",
              value: function (e, t) {
                (t || (t = this.state.layout),
                  (0, i.default)(t, e) || this.props.onLayoutChange(e));
              },
            },
            {
              key: "placeholder",
              value: function () {
                var e = this.state.activeDrag;
                if (!e) return null;
                var t = this.props,
                  n = t.width,
                  r = t.cols,
                  i = t.margin,
                  o = t.containerPadding,
                  s = t.rowHeight,
                  l = t.maxRows,
                  c = t.useCSSTransforms,
                  d = t.transformScale;
                return a.createElement(
                  u.default,
                  {
                    w: e.w,
                    h: e.h,
                    x: e.x,
                    y: e.y,
                    i: e.i,
                    className: "react-grid-placeholder",
                    containerWidth: n,
                    cols: r,
                    margin: i,
                    containerPadding: o || i,
                    maxRows: l,
                    rowHeight: s,
                    isDraggable: !1,
                    isResizable: !1,
                    isBounded: !1,
                    useCSSTransforms: c,
                    transformScale: d,
                  },
                  a.createElement("div", null),
                );
              },
            },
            {
              key: "processGridItem",
              value: function (e, t) {
                if (e && e.key) {
                  var n = (0, s.getLayoutItem)(this.state.layout, String(e.key));
                  if (!n) return null;
                  var r = this.props,
                    i = r.width,
                    o = r.cols,
                    l = r.margin,
                    c = r.containerPadding,
                    d = r.rowHeight,
                    p = r.maxRows,
                    h = r.isDraggable,
                    f = r.isResizable,
                    m = r.isBounded,
                    g = r.useCSSTransforms,
                    v = r.transformScale,
                    b = r.draggableCancel,
                    y = r.draggableHandle,
                    w = r.resizeHandles,
                    S = r.resizeHandle,
                    x = this.state,
                    _ = x.mounted,
                    C = x.droppingPosition,
                    O = "boolean" == typeof n.isDraggable ? n.isDraggable : !n.static && h,
                    R = "boolean" == typeof n.isResizable ? n.isResizable : !n.static && f,
                    k = n.resizeHandles || w,
                    E = O && m && !1 !== n.isBounded;
                  return a.createElement(
                    u.default,
                    {
                      containerWidth: i,
                      cols: o,
                      margin: l,
                      containerPadding: c || l,
                      maxRows: p,
                      rowHeight: d,
                      cancel: b,
                      handle: y,
                      onDragStop: this.onDragStop,
                      onDragStart: this.onDragStart,
                      onDrag: this.onDrag,
                      onResizeStart: this.onResizeStart,
                      onResize: this.onResize,
                      onResizeStop: this.onResizeStop,
                      isDraggable: O,
                      isResizable: R,
                      isBounded: E,
                      useCSSTransforms: g && _,
                      usePercentages: !_,
                      transformScale: v,
                      w: n.w,
                      h: n.h,
                      x: n.x,
                      y: n.y,
                      i: n.i,
                      minH: n.minH,
                      minW: n.minW,
                      maxH: n.maxH,
                      maxW: n.maxW,
                      static: n.static,
                      droppingPosition: t ? C : void 0,
                      resizeHandles: k,
                      resizeHandle: S,
                    },
                    e,
                  );
                }
              },
            },
            {
              key: "render",
              value: function () {
                var e = this,
                  t = this.props,
                  n = t.className,
                  r = t.style,
                  i = t.isDroppable,
                  l = t.innerRef,
                  u = (0, o.default)(O, n),
                  c = m({ height: this.containerHeight() }, r);
                return a.createElement(
                  "div",
                  {
                    ref: l,
                    className: u,
                    style: c,
                    onDrop: i ? this.onDrop : s.noop,
                    onDragLeave: i ? this.onDragLeave : s.noop,
                    onDragEnter: i ? this.onDragEnter : s.noop,
                    onDragOver: i ? this.onDragOver : s.noop,
                  },
                  a.Children.map(this.props.children, function (t) {
                    return e.processGridItem(t);
                  }),
                  i &&
                    this.state.droppingDOMNode &&
                    this.processGridItem(this.state.droppingDOMNode, !0),
                  this.placeholder(),
                );
              },
            },
          ]) && y(t.prototype, n),
          r && y(t, r),
          Object.defineProperty(t, "prototype", { writable: !1 }),
          d
        );
      })(a.Component);
      ((t.default = k),
        C(k, "displayName", "ReactGridLayout"),
        C(k, "propTypes", c.default),
        C(k, "defaultProps", {
          autoSize: !0,
          cols: 12,
          className: "",
          style: {},
          draggableHandle: "",
          draggableCancel: "",
          containerPadding: null,
          rowHeight: 150,
          maxRows: 1 / 0,
          layout: [],
          margin: [10, 10],
          isBounded: !1,
          isDraggable: !0,
          isResizable: !0,
          allowOverlap: !1,
          isDroppable: !1,
          useCSSTransforms: !0,
          transformScale: 1,
          verticalCompact: !0,
          compactType: "vertical",
          preventCollision: !1,
          droppingItem: { i: "__dropping-elem__", h: 1, w: 1 },
          resizeHandles: ["se"],
          onLayoutChange: s.noop,
          onDragStart: s.noop,
          onDrag: s.noop,
          onDragStop: s.noop,
          onResizeStart: s.noop,
          onResize: s.noop,
          onResizeStop: s.noop,
          onDrop: s.noop,
          onDropDragOver: s.noop,
        }));
    },
    9954: (e, t, n) => {
      "use strict";
      ((t.__esModule = !0),
        (t.cloneElement = function (e, t) {
          t.style && e.props.style && (t.style = o(o({}, e.props.style), t.style));
          t.className && e.props.className && (t.className = e.props.className + " " + t.className);
          return a.default.cloneElement(e, t);
        }));
      var r,
        a = (r = n(5959)) && r.__esModule ? r : { default: r };
      function i(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(e);
          (t &&
            (r = r.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, r));
        }
        return n;
      }
      function o(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? i(Object(n), !0).forEach(function (t) {
                s(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : i(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function s(e, t, n) {
        return (
          (t = (function (e) {
            var t = (function (e, t) {
              if ("object" != typeof e || null === e) return e;
              var n = e[Symbol.toPrimitive];
              if (void 0 !== n) {
                var r = n.call(e, t || "default");
                if ("object" != typeof r) return r;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return ("string" === t ? String : Number)(e);
            })(e, "string");
            return "symbol" == typeof t ? t : String(t);
          })(t)) in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = n),
          e
        );
      }
    },
  },
]);
//# sourceMappingURL=14.js.map?_cache=78d2cf82b9223fc7c83b
