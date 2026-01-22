"use strict";
(self.webpackChunkgrafana_metricsdrilldown_app =
  self.webpackChunkgrafana_metricsdrilldown_app || []).push([
  [509],
  {
    2993: (e, t, a) => {
      a.d(t, { E: () => o });
      var n = a(6089),
        r = a(2007),
        l = a(5959),
        c = a.n(l),
        s = a(1159),
        i = a(6503);
      function o({ error: e }) {
        const t = (0, r.useStyles2)(m),
          a = (0, s.useNavigate)(),
          { pathname: n, search: o } = (0, s.useLocation)(),
          u = (0, l.useCallback)(() => {
            const e = new URLSearchParams(o),
              t = new URLSearchParams();
            (["from", "to", "timezone"].filter((t) => e.has(t)).forEach((a) => t.set(a, e.get(a))),
              a({ pathname: n, search: t.toString() }),
              window.location.reload());
          }, [a, n, o]),
          [d, p] = (0, l.useState)(!1);
        return c().createElement(
          "div",
          { className: t.container },
          c().createElement(i._, {
            severity: "error",
            title: "Fatal error!",
            error: e,
            errorContext: { handheldBy: "React error boundary" },
            message: c().createElement(
              c().Fragment,
              null,
              c().createElement(
                "p",
                { className: t.message },
                "Please",
                " ",
                c().createElement(r.TextLink, { href: "#", onClick: u }, "try reloading the page"),
                " ",
                "or, if the problem persists, contact your organization admin. Sorry for the inconvenience.",
              ),
              c().createElement(
                "p",
                null,
                c().createElement(
                  r.Collapse,
                  {
                    className: t.callStack,
                    label: "View stack trace",
                    isOpen: d,
                    onToggle: () => p(!d),
                  },
                  c().createElement("pre", null, c().createElement("code", null, e.stack)),
                ),
              ),
            ),
          }),
        );
      }
      function m(e) {
        return {
          container: (0, n.css)({ margin: e.spacing(2) }),
          message: (0, n.css)({ margin: e.spacing(2, 0, 1, 0) }),
          callStack: (0, n.css)({
            backgroundColor: "transparent",
            border: "0 none",
            "& button": (0, n.css)({ paddingLeft: e.spacing(1.5) }),
            "& button:focus": (0, n.css)({ outline: "none", boxShadow: "none" }),
            "& button > svg": (0, n.css)({
              marginLeft: e.spacing(-2),
              marginRight: e.spacing(0.5),
            }),
            '& [class$="collapse__loader"]': (0, n.css)({ display: "none" }),
          }),
        };
      }
    },
    4509: (e, t, a) => {
      (a.r(t), a.d(t, { default: () => k }));
      var n = a(6089),
        r = a(8531),
        l = a(2007),
        c = a(5959),
        s = a.n(c),
        i = a(8092),
        o = a(2993),
        m = a(7781),
        u = a(1792);
      function d() {
        const e = (0, l.useStyles2)(p),
          t = (0, l.useTheme2)();
        return s().createElement(
          "div",
          { className: e.wrap },
          s().createElement(
            "div",
            { className: e.graphicContainer },
            s().createElement(u.A, {
              src: (t.isDark, "/public/plugins/grafana-metricsdrilldown-app/img/logo.svg"),
            }),
          ),
          s().createElement(
            "div",
            { className: e.text },
            s().createElement("h3", { className: e.title }, "Welcome to Grafana Metrics Drilldown"),
            s().createElement(
              "p",
              null,
              "We noticed there is no Prometheus datasource configured.",
              s().createElement("br", null),
              "Add a",
              " ",
              s().createElement(
                "a",
                {
                  className: "external-link",
                  href: m.locationUtil.assureBaseUrl("/connections/datasources/new"),
                },
                "Prometheus datasource",
              ),
              " ",
              "to view metrics.",
            ),
            s().createElement("br", null),
            s().createElement(
              "p",
              null,
              "Check",
              " ",
              s().createElement(
                "a",
                {
                  href: "https://grafana.com/docs/grafana/latest/explore/simplified-exploration/metrics/",
                  target: "_blank",
                  className: "external-link",
                  rel: "noreferrer",
                },
                "our docs",
              ),
              " ",
              "to learn more or",
              s().createElement("br", null),
              s().createElement(
                "a",
                {
                  href: "https://play.grafana.org/a/grafana-metricsdrilldown-app/drilldown",
                  target: "_blank",
                  className: "external-link",
                  rel: "noreferrer",
                },
                "try it online",
              ),
              " ",
              "in Grafana Play!",
            ),
          ),
        );
      }
      const p = (e) => ({
        graphicContainer: (0, n.css)({
          [e.breakpoints.up("md")]: {
            alignSelf: "flex-end",
            height: "auto",
            padding: e.spacing(1),
            width: "300px",
          },
          [e.breakpoints.up("lg")]: {
            alignSelf: "flex-end",
            height: "auto",
            padding: e.spacing(1),
            width: "400px",
          },
          display: "flex",
          height: "250px",
          justifyContent: "center",
          margin: "0 auto",
          padding: e.spacing(1),
          width: "200px",
        }),
        text: (0, n.css)({
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }),
        title: (0, n.css)({ marginBottom: "1.5rem" }),
        wrap: (0, n.css)({
          [e.breakpoints.up("md")]: { flexDirection: "row", margin: "4rem auto auto auto" },
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          margin: "0 auto auto auto",
          padding: "2rem",
          textAlign: "center",
        }),
      });
      var g = a(8732),
        f = a(1522),
        h = a(5935);
      var E = a(1026),
        w = a(9914),
        b = a(4440);
      const v = (0, c.createContext)(null);
      ((0, w.Js)(), (0, E.g)());
      const x = Object.values(r.config.datasources).filter(b.aQ);
      function k(e) {
        const t = (0, l.useStyles2)(y),
          [a] = (0, f.n)();
        return (
          (function () {
            const e = (0, c.useRef)(!1);
            (0, c.useEffect)(() => {
              if (!e.current) {
                e.current = !0;
                const a = new URL(window.location.href),
                  n = a.searchParams.get("metric") ? "metric-details" : "metrics-reducer";
                var t;
                const r = null !== (t = a.searchParams.get("uel_epid")) && void 0 !== t ? t : "";
                (0, h.z)("app_initialized", { view: n, uel_epid: r });
              }
            }, []);
          })(),
          a
            ? s().createElement(
                "div",
                { className: t.appContainer, "data-testid": "metrics-drilldown-app" },
                s().createElement(o.E, { error: a }),
              )
            : x.length
              ? s().createElement(
                  "div",
                  { className: t.appContainer, "data-testid": "metrics-drilldown-app" },
                  s().createElement(
                    v.Provider,
                    { value: e },
                    s().createElement(
                      i.BR.Provider,
                      { value: { trail: i.KF } },
                      s().createElement(g.S, null),
                    ),
                  ),
                )
              : s().createElement(d, null)
        );
      }
      function y(e) {
        return {
          appContainer: (0, n.css)({
            display: "flex",
            flexDirection: "column",
            height: "100%",
            backgroundColor: e.colors.background.primary,
          }),
        };
      }
    },
    8092: (e, t, a) => {
      a.d(t, { BR: () => l, Hi: () => c, KF: () => r });
      var n = a(5959);
      const r = (0, a(7616).ef)(),
        l = (0, n.createContext)({ trail: r });
      function c() {
        return (0, n.useContext)(l);
      }
    },
    8732: (e, t, a) => {
      a.d(t, { S: () => m, X: () => i });
      var n = a(5959),
        r = a.n(n),
        l = a(1159),
        c = a(3498),
        s = a(8092);
      const i = (0, n.lazy)(() => a.e(494).then(a.bind(a, 8494))),
        o = () => {
          const e = (0, l.useLocation)();
          return r().createElement(l.Navigate, { to: `${c.b.Drilldown}${e.search}`, replace: !0 });
        },
        m = () => {
          const { trail: e } = (0, s.Hi)();
          return r().createElement(
            l.Routes,
            null,
            r().createElement(l.Route, {
              path: c.b.Drilldown,
              element: r().createElement(i, { trail: e }),
            }),
            r().createElement(l.Route, { path: c.b.Trail, element: r().createElement(o, null) }),
            r().createElement(l.Route, {
              path: "*",
              element: r().createElement(l.Navigate, { to: c.b.Drilldown, replace: !0 }),
            }),
          );
        };
    },
  },
]);
//# sourceMappingURL=509.js.map?_cache=00e2bf5c44d39ba55b70
