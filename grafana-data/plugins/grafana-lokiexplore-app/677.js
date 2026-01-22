"use strict";
(self.webpackChunkgrafana_lokiexplore_app = self.webpackChunkgrafana_lokiexplore_app || []).push([
  [677],
  {
    677: (e, r, t) => {
      (t.r(r),
        t.d(r, {
          VARIABLE_NAMESPACE: () => v,
          buildLogsExplorationFromState: () => O,
          default: () => g,
        }));
      var n = t(5959),
        a = t.n(n),
        o = t(4423),
        l = t(4509),
        i = t(708),
        u = t(8469),
        s = t(5252),
        c = t(1296),
        p = t(3257),
        b = t(2152),
        f = t(20);
      function d(e, r, t) {
        return (
          r in e
            ? Object.defineProperty(e, r, {
                value: t,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[r] = t),
          e
        );
      }
      function m(e, r) {
        return (
          (r = null != r ? r : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
            : (function (e, r) {
                var t = Object.keys(e);
                if (Object.getOwnPropertySymbols) {
                  var n = Object.getOwnPropertySymbols(e);
                  (r &&
                    (n = n.filter(function (r) {
                      return Object.getOwnPropertyDescriptor(e, r).enumerable;
                    })),
                    t.push.apply(t, n));
                }
                return t;
              })(Object(r)).forEach(function (t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
              }),
          e
        );
      }
      function y(e, r) {
        if (null == e) return {};
        var t,
          n,
          a = (function (e, r) {
            if (null == e) return {};
            var t,
              n,
              a = {},
              o = Object.keys(e);
            for (n = 0; n < o.length; n++) ((t = o[n]), r.indexOf(t) >= 0 || (a[t] = e[t]));
            return a;
          })(e, r);
        if (Object.getOwnPropertySymbols) {
          var o = Object.getOwnPropertySymbols(e);
          for (n = 0; n < o.length; n++)
            ((t = o[n]),
              r.indexOf(t) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(e, t) && (a[t] = e[t])));
        }
        return a;
      }
      function O(e) {
        var {
            onTimeRangeChange: r,
            query: t,
            referenceQuery: n,
            timeRangeState: a,
            options: u,
            hideTimePicker: b,
          } = e,
          O = y(e, [
            "onTimeRangeChange",
            "query",
            "referenceQuery",
            "timeRangeState",
            "options",
            "hideTimePicker",
          ]);
        const v = new o.JZ(a);
        if (
          (v.subscribeToState((e) => {
            r && r(e.value);
          }),
          !t)
        )
          return (
            console.error(
              "No query parameter found! Please pass in a valid logQL query string when embedding Logs Drilldown.",
            ),
            (0, l.EE)(l.NO.service_details, l.ir.service_details.embedded_error),
            null
          );
        (0, c.default)();
        const { labelFilters: g, lineFilters: P, fields: j } = (0, p.BW)(t),
          w = (0, p.BW)(null != n ? n : ""),
          k = g.map((e) => ({
            key: e.key,
            operator: e.operator,
            value: (0, i.SM)(e.operator) ? (0, f.OQ)(e.value) : e.value,
            valueLabels: [e.value],
          })),
          S = w.labelFilters.map((e) => ({
            key: e.key,
            operator: e.operator,
            value: (0, i.SM)(e.operator) ? (0, f.OQ)(e.value) : e.value,
            valueLabels: [e.value],
          })),
          h =
            null == j
              ? void 0
              : j.map((e) => {
                  const r = e.value;
                  var t;
                  const n = {
                      parser: null !== (t = e.parser) && void 0 !== t ? t : "mixed",
                      value: r,
                    },
                    a = "structuredMetadata" === e.parser ? r : JSON.stringify(n);
                  return {
                    key: e.key,
                    operator: e.operator,
                    valueLabels: [e.value],
                    value: (0, i.SM)(e.operator) ? (0, f.OQ)(a) : a,
                    meta: { parser: e.parser },
                  };
                });
        return (
          (0, l.EE)(l.NO.service_details, l.ir.service_details.embedded_init),
          new s.P(
            m(
              (function (e) {
                for (var r = 1; r < arguments.length; r++) {
                  var t = null != arguments[r] ? arguments[r] : {},
                    n = Object.keys(t);
                  ("function" == typeof Object.getOwnPropertySymbols &&
                    (n = n.concat(
                      Object.getOwnPropertySymbols(t).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(t, e).enumerable;
                      }),
                    )),
                    n.forEach(function (r) {
                      d(e, r, t[r]);
                    }));
                }
                return e;
              })({}, O),
              {
                $timeRange: v,
                defaultLineFilters: P,
                embedded: !0,
                embeddedOptions: u,
                initialFields: h,
                initialLabels: k,
                referenceLabels: S,
                hideTimePicker: b,
              },
            ),
          )
        );
      }
      const v = "ld";
      function g(e) {
        const [r, t] = (0, n.useState)(null);
        return (
          (0, n.useEffect)(() => {
            r || ((0, b.rX)(!0), t(O(e)));
          }, [r, e]),
          r
            ? a().createElement(
                o.$L,
                {
                  scene: r,
                  updateUrlOnInit: !1,
                  createBrowserHistorySteps: !0,
                  namespace: null !== (l = e.namespace) && void 0 !== l ? l : v,
                  excludeFromNamespace: ["from", "to", "timezone", u.o, u.Z],
                },
                a().createElement(r.Component, { model: r }),
              )
            : null
        );
        var l;
      }
    },
  },
]);
//# sourceMappingURL=677.js.map?_cache=74af5d2635589561e2ee
