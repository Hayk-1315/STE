"use strict";
(self.webpackChunkgrafana_metricsdrilldown_app =
  self.webpackChunkgrafana_metricsdrilldown_app || []).push([
  [728],
  {
    2993: (e, t, n) => {
      n.d(t, { E: () => l });
      var a = n(6089),
        r = n(2007),
        o = n(5959),
        s = n.n(o),
        c = n(1159),
        i = n(6503);
      function l({ error: e }) {
        const t = (0, r.useStyles2)(m),
          n = (0, c.useNavigate)(),
          { pathname: a, search: l } = (0, c.useLocation)(),
          d = (0, o.useCallback)(() => {
            const e = new URLSearchParams(l),
              t = new URLSearchParams();
            (["from", "to", "timezone"].filter((t) => e.has(t)).forEach((n) => t.set(n, e.get(n))),
              n({ pathname: a, search: t.toString() }),
              window.location.reload());
          }, [n, a, l]),
          [u, p] = (0, o.useState)(!1);
        return s().createElement(
          "div",
          { className: t.container },
          s().createElement(i._, {
            severity: "error",
            title: "Fatal error!",
            error: e,
            errorContext: { handheldBy: "React error boundary" },
            message: s().createElement(
              s().Fragment,
              null,
              s().createElement(
                "p",
                { className: t.message },
                "Please",
                " ",
                s().createElement(r.TextLink, { href: "#", onClick: d }, "try reloading the page"),
                " ",
                "or, if the problem persists, contact your organization admin. Sorry for the inconvenience.",
              ),
              s().createElement(
                "p",
                null,
                s().createElement(
                  r.Collapse,
                  {
                    className: t.callStack,
                    label: "View stack trace",
                    isOpen: u,
                    onToggle: () => p(!u),
                  },
                  s().createElement("pre", null, s().createElement("code", null, e.stack)),
                ),
              ),
            ),
          }),
        );
      }
      function m(e) {
        return {
          container: (0, a.css)({ margin: e.spacing(2) }),
          message: (0, a.css)({ margin: e.spacing(2, 0, 1, 0) }),
          callStack: (0, a.css)({
            backgroundColor: "transparent",
            border: "0 none",
            "& button": (0, a.css)({ paddingLeft: e.spacing(1.5) }),
            "& button:focus": (0, a.css)({ outline: "none", boxShadow: "none" }),
            "& button > svg": (0, a.css)({
              marginLeft: e.spacing(-2),
              marginRight: e.spacing(0.5),
            }),
            '& [class$="collapse__loader"]': (0, a.css)({ display: "none" }),
          }),
        };
      }
    },
    3728: (e, t, n) => {
      (n.r(t), n.d(t, { MiniBreakdown: () => p, default: () => f }));
      var a = n(6089),
        r = n(2007),
        o = n(5959),
        s = n.n(o),
        c = n(2993),
        i = n(1522),
        l = n(5935),
        m = n(7616),
        d = n(3781),
        u = n(4787);
      const p = ({ query: e, initialStart: t, initialEnd: n, dataSource: a }) => {
        const [p] = (0, i.n)(),
          f = (0, r.useStyles2)(g),
          h = (0, o.useRef)(!1);
        (0, o.useEffect)(() => {
          h.current ||
            ((h.current = !0),
            (0, l.z)("exposed_component_viewed", { component: "mini_breakdown" }));
        }, []);
        const { metric: b, labels: w } = (0, d.$9)(e),
          E = (0, o.useMemo)(
            () =>
              (0, m.ef)({
                metric: b,
                initialDS: a,
                initialFilters: w.map(({ label: e, op: t, value: n }) => ({
                  key: e,
                  operator: t,
                  value: n,
                })),
                $timeRange: (0, u._)(t, n),
                embedded: !0,
                embeddedMini: !0,
              }),
            [b, a, w, t, n],
          );
        return s().createElement(
          "div",
          { "data-testid": "metrics-drilldown-mini-breakdown", className: f.container },
          p ? s().createElement(c.E, { error: p }) : s().createElement(E.Component, { model: E }),
        );
      };
      function g() {
        return { container: (0, a.css)({ width: "300px" }) };
      }
      const f = p;
    },
    4787: (e, t, n) => {
      n.d(t, { _: () => s });
      var a = n(7781),
        r = n(3014);
      function o(e) {
        return "string" == typeof e && a.dateMath.isMathString(e)
          ? e
          : a.dateMath.toDateTime(new Date(e), { roundUp: !1 }).toISOString();
      }
      function s(e, t) {
        return new r.SceneTimeRange({ from: o(e), to: o(t) });
      }
    },
  },
]);
//# sourceMappingURL=728.js.map?_cache=14a7052bbaac81bc3b4d
