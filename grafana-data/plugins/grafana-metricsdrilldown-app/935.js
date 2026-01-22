"use strict";
(self.webpackChunkgrafana_metricsdrilldown_app =
  self.webpackChunkgrafana_metricsdrilldown_app || []).push([
  [935],
  {
    297: (e, t, n) => {
      n.d(t, { w: () => i });
      var r = n(6024);
      const a = "<none>";
      function i(e) {
        const t = new Map();
        for (const r of e) {
          const e = r.value.split(/[^a-z0-9]/i),
            i = e.length <= 1 ? r.value : e[0];
          var n;
          const o = null !== (n = t.get(i)) && void 0 !== n ? n : [];
          (o.push(r.value), t.set(i || a, o));
        }
        const i = new Map();
        for (const [e, n] of t) i.set(e, n.length);
        return Array.from(i.entries())
          .sort((e, t) => (e[1] !== t[1] ? t[1] - e[1] : (0, r._)(e[0], t[0])))
          .map(([e, t]) => ({ value: e, count: t, label: e }));
      }
    },
    300: (e, t, n) => {
      n.d(t, { U: () => l, b: () => p });
      var r = n(3014),
        a = n(3241),
        i = n(3139),
        o = n(8316),
        s = n(8238);
      function l() {
        const e = (e) => {
          let t = Number.NEGATIVE_INFINITY,
            n = Number.POSITIVE_INFINITY;
          const a = r.sceneGraph.getTimeRange(e).subscribeToState(() => {
              ((t = Number.NEGATIVE_INFINITY), (n = Number.POSITIVE_INFINITY));
            }),
            l = e.subscribeToEvent(o.H, () => {
              ((t = Number.NEGATIVE_INFINITY), (n = Number.POSITIVE_INFINITY));
            }),
            p = e.subscribeToEvent(i.N, () => {
              let [r, a] = [t, n];
              const i = u(e).filter((e) => {
                var t;
                const { fieldConfig: n, $data: i } = e.state;
                return (
                  (!("min" in n.defaults) || !("max" in n.defaults)) &&
                  (([r, a] = c(
                    (null == i || null === (t = i.state.data) || void 0 === t
                      ? void 0
                      : t.series) || [],
                    r,
                    a,
                  )),
                  !0)
                );
              });
              r === t && a === n ? d(e, t, n, i) : (([t, n] = [r, a]), d(e, r, a));
            }),
            m = e.subscribeToEvent(s.s, (a) => {
              const { panelKey: i, series: o } = a.payload,
                [s, l] = c(o, t, n);
              s !== l &&
                s !== Number.NEGATIVE_INFINITY &&
                l !== Number.POSITIVE_INFINITY &&
                (s !== t || l !== n
                  ? (([t, n] = [s, l]), d(e, s, l))
                  : d(e, t, n, [r.sceneGraph.findByKeyAndType(e, i, r.VizPanel)]));
            });
          return () => {
            (m.unsubscribe(), p.unsubscribe(), l.unsubscribe(), a.unsubscribe());
          };
        };
        return (
          Object.defineProperty(e, "__name__", {
            value: "syncYAxis",
            configurable: !1,
            enumerable: !0,
            writable: !1,
          }),
          e
        );
      }
      function c(e, t, n) {
        let [r, a] = [t, n];
        for (const t of e || []) {
          var i;
          const e = null === (i = t.fields[1]) || void 0 === i ? void 0 : i.values.filter(Boolean);
          e && ((r = Math.max(r, ...e)), (a = Math.min(a, ...e)));
        }
        return [r, a];
      }
      function u(e) {
        return r.sceneGraph.findAllObjects(
          e,
          (e) => e instanceof r.VizPanel && "timeseries" === e.state.pluginId,
        );
      }
      function d(e, t, n, r) {
        for (const i of r || u(e))
          (i.clearFieldConfigCache(),
            i.setState({
              fieldConfig: (0, a.merge)((0, a.cloneDeep)(i.state.fieldConfig), {
                defaults: { min: n, max: t },
              }),
            }));
      }
      function p(e) {
        const t = r.sceneGraph.findAllObjects(e, (e) => {
          var t;
          return Boolean(
            null === (t = e.state.$behaviors) || void 0 === t
              ? void 0
              : t.some((e) => "syncYAxis" === e.__name__),
          );
        });
        for (const e of t) e.publishEvent(new o.H({}), !0);
      }
    },
    337: (e, t, n) => {
      n.d(t, { $: () => i });
      var r = n(3014),
        a = n(495);
      function i(e, t) {
        const n = r.sceneGraph.getQueryController(e);
        if (!n) return void e.publishEvent(new a.N({ currentActionView: t }), !0);
        const i = n.subscribeToState((n, r) => {
          r.isRunning &&
            !n.isRunning &&
            (i.unsubscribe(), e.publishEvent(new a.N({ currentActionView: t }), !0));
        });
      }
    },
    381: (e, t, n) => {
      n.d(t, { H: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "panel-type-changed"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    392: (e, t, n) => {
      n.d(t, { I: () => b });
      var r = n(6089),
        a = n(3014),
        i = n(2007),
        o = n(3241),
        s = n(5959),
        l = n.n(s),
        c = n(1419),
        u = n(5935),
        d = n(4293),
        p = n(219),
        m = n(396);
      function h(e, t) {
        if (!t.trim()) return;
        const n = [],
          r = a.sceneGraph.findByKey(e, c.EY);
        var i;
        const o = null !== (i = null == r ? void 0 : r.state.value) && void 0 !== i ? i : "";
        o && n.push((0, p.createAssistantContextItem)("datasource", { datasourceUid: o }));
        const s = a.sceneGraph.lookupVariable(c.Ao, e);
        (0, m.BE)(s) &&
          s.state.filters.length > 0 &&
          n.push(
            (0, p.createAssistantContextItem)("structured", {
              title: "Current label filters",
              data: {
                filters: s.state.filters.map((e) => ({
                  key: e.key,
                  operator: e.operator,
                  value: e.value,
                })),
              },
            }),
          );
        const l = a.sceneGraph.getTimeRange(e).state;
        (n.push(
          (0, p.createAssistantContextItem)("structured", {
            title: "Time range",
            data: { from: l.from, to: l.to },
          }),
        ),
          (0, u.z)("quick_search_assistant_question_asked", { question: t }),
          (0, p.openAssistant)({
            origin: "grafana-metricsdrilldown-app/quick-search",
            prompt: t,
            context: n,
          }));
      }
      function f(e, t, n) {
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
      class b extends a.SceneObjectBase {
        getUrlState() {
          return { [this.state.urlSearchParamName]: this.state.value };
        }
        updateFromUrl(e) {
          const t = e[this.state.urlSearchParamName] || "";
          t !== this.state.value && this.setState({ value: t });
        }
        toggleCountsDisplay(e) {
          this.setState({ displayCounts: e });
        }
        updateValue(e) {
          ("" === this.state.value &&
            "" !== e &&
            !this.state.isQuestionMode &&
            (0, u.z)("quick_search_used", {}),
            this.setState({ value: e }),
            this.state.isQuestionMode || this.notifyValueChange(e));
        }
        useHumanFriendlyCountsMessage() {
          const { targetName: e, countsProvider: t, displayCounts: n } = this.state,
            r = t.useCounts();
          return n
            ? r.current === r.total
              ? {
                  tagName: `${r.current}`,
                  tooltipContent:
                    1 !== r.current ? `${r.current} ${e}s in total` : `1 ${e} in total`,
                }
              : {
                  tagName: `${r.current}/${r.total}`,
                  tooltipContent:
                    1 !== r.current
                      ? `${r.current} out of ${r.total} ${e}s in total`
                      : `1 out of ${r.total} ${e}s in total`,
                }
            : { tagName: "", tooltipContent: "" };
        }
        constructor({ urlSearchParamName: e, targetName: t, countsProvider: n, displayCounts: r }) {
          (super({
            key: "quick-search",
            urlSearchParamName: e,
            targetName: t,
            countsProvider: n,
            displayCounts: Boolean(r),
            value: "",
            isQuestionMode: !1,
          }),
            f(
              this,
              "_variableDependency",
              new a.VariableDependencyConfig(this, {
                variableNames: [c.EY],
                onReferencedVariableValueChanged: () => {
                  this.setState({ value: "", isQuestionMode: !1 });
                },
              }),
            ),
            f(
              this,
              "_urlSync",
              new a.SceneObjectUrlSyncConfig(this, { keys: [this.state.urlSearchParamName] }),
            ),
            f(
              this,
              "notifyValueChange",
              (0, o.debounce)((e) => {
                this.publishEvent(new d.W({ searchText: e }), !0);
              }, 250),
            ),
            f(this, "onChange", (e) => {
              const t = e.currentTarget.value;
              "?" !== t || "" !== this.state.value || this.state.isQuestionMode
                ? this.updateValue(t)
                : this.setState({ isQuestionMode: !0 });
            }),
            f(this, "clear", () => {
              this.resetToQuickSearch();
            }),
            f(this, "resetToQuickSearch", () => {
              (this.setState({ isQuestionMode: !1 }), this.updateValue(""));
            }),
            f(this, "onKeyDown", (e) => {
              ("Escape" === e.key && (e.preventDefault(), this.clear()),
                "Enter" === e.key &&
                  this.state.isQuestionMode &&
                  this.state.value.trim() &&
                  (e.preventDefault(), h(this, this.state.value), this.resetToQuickSearch()));
            }));
        }
      }
      f(b, "Component", ({ model: e }) => {
        const t = (0, i.useStyles2)(g),
          { targetName: n, value: r, countsProvider: a, isQuestionMode: o } = e.useState(),
          { tagName: c, tooltipContent: u } = e.useHumanFriendlyCountsMessage(),
          d = (function () {
            const [e, t] = (0, s.useState)(!1);
            return (
              (0, s.useEffect)(() => {
                const e = (0, p.isAssistantAvailable)().subscribe((e) => {
                  t(e);
                });
                return () => e.unsubscribe();
              }, []),
              e
            );
          })();
        let m = `Quick search ${n}s`;
        return (
          o
            ? (m = "Ask the Grafana Assistant a question and press enter")
            : d && (m = `Quick search ${n}s or type ? to ask the Grafana Assistant`),
          l().createElement(i.Input, {
            value: r,
            onChange: e.onChange,
            onKeyDown: e.onKeyDown,
            placeholder: m,
            prefix: l().createElement("i", { className: "fa fa-search" }),
            suffix: l().createElement(
              l().Fragment,
              null,
              l().createElement(a.Component, { model: a }),
              !o &&
                c &&
                l().createElement(
                  i.Tooltip,
                  { content: u, placement: "top" },
                  l().createElement(i.Tag, { className: t.counts, name: c, colorIndex: 9 }),
                ),
              o &&
                d &&
                l().createElement(i.IconButton, {
                  name: "ai-sparkle",
                  variant: "primary",
                  tooltip: "Ask the Grafana Assistant",
                  "aria-label": "Ask the Grafana Assistant",
                  onClick: () => {
                    r && (h(e, r), e.resetToQuickSearch());
                  },
                }),
              l().createElement(i.IconButton, {
                name: "times",
                variant: "secondary",
                tooltip: "Clear search",
                onClick: e.clear,
                disabled: !r && !o,
              }),
            ),
          })
        );
      });
      const g = (e) => ({
        counts: r.css`
    margin-right: ${e.spacing(1)};
    border-radius: 11px;
    padding: 2px ${e.spacing(1)};
    color: ${e.colors.text.primary};
    background-color: ${e.colors.background.secondary};
  `,
      });
    },
    396: (e, t, n) => {
      function r(e) {
        return null !== e && "adhoc" === (null == e ? void 0 : e.state.type);
      }
      function a(e) {
        return null !== e && "custom" === (null == e ? void 0 : e.state.type);
      }
      function i(e) {
        return null !== e && "query" === (null == e ? void 0 : e.state.type);
      }
      function o(e) {
        return { key: e.label, operator: e.op, value: e.value };
      }
      n.d(t, { BE: () => r, Do: () => o, UG: () => a, bA: () => i });
    },
    477: (e, t, n) => {
      n.d(t, { b: () => r, w: () => a });
      const r = { metrics: "Non-rules metrics", rules: "Recording rules" },
        a = { "^(?!.*:.*)": r.metrics, ":": r.rules };
    },
    495: (e, t, n) => {
      n.d(t, { N: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "action-view-data-load-complete"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    578: (e, t, n) => {
      n.d(t, { m: () => Z });
      var r = n(6089),
        a = n(8531),
        i = n(3014),
        o = n(2007),
        s = n(5959),
        l = n.n(s),
        c = n(5935),
        u = n(9564),
        d = n(1571),
        p = n(2457),
        m = n(5333),
        h = n(9331),
        f = n(392);
      function b(e, t, n) {
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
      function g(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class y extends i.EmbeddedScene {
        constructor(e) {
          super(
            g(
              (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {},
                    r = Object.keys(n);
                  ("function" == typeof Object.getOwnPropertySymbols &&
                    (r = r.concat(
                      Object.getOwnPropertySymbols(n).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(n, e).enumerable;
                      }),
                    )),
                    r.forEach(function (t) {
                      b(e, t, n[t]);
                    }));
                }
                return e;
              })({}, e),
              {
                key: "list-controls",
                body: new i.SceneFlexLayout({
                  direction: "row",
                  width: "100%",
                  maxHeight: "32px",
                  children: [
                    new i.SceneFlexItem({
                      body: new f.I({
                        urlSearchParamName: "search_txt",
                        targetName: "metric",
                        countsProvider: new h.s(),
                      }),
                    }),
                    new i.SceneFlexItem({ width: "auto", body: new m.fD({}) }),
                    new i.SceneFlexItem({ width: "auto", body: new p.U({}) }),
                  ],
                }),
              },
            ),
          );
        }
      }
      b(y, "Component", ({ model: e }) => {
        const { body: t } = e.useState();
        return l().createElement(
          o.Stack,
          { direction: "row", alignItems: "center" },
          l().createElement(t.Component, { model: t }),
        );
      });
      var v,
        S,
        w,
        O = n(5272),
        E = n(4293),
        x = n(5732),
        k = n(9365),
        C = n(9194),
        P = n(3916),
        j = n(7145),
        _ = n(9512),
        T = n(5190),
        I = n(2413),
        A = n(7781),
        D = n(5665),
        B = n(7957),
        M = n(8819),
        N = n(6773),
        L = n(1031),
        R = n(4758),
        $ = n(1419),
        V = n(2639),
        F = n(6503);
      class G extends i.SceneObjectBase {
        onActivate() {
          this.subscribeToLayoutChange();
        }
        subscribeToLayoutChange() {
          const e = i.sceneGraph.findByKeyAndType(this, "layout-switcher", p.U),
            t = this.state.body.state.body,
            n = (e, n) => {
              e.layout !== (null == n ? void 0 : n.layout) &&
                t.setState({ templateColumns: e.layout === p.p.ROWS ? V._O : V.MV });
            };
          (n(e.state), this._subs.add(e.subscribeToState(n)));
        }
        constructor({ index: e, labelName: t, labelValue: n, labelCardinality: r }) {
          const a = `var-metrics-${t}-${n}`;
          (super({
            index: e,
            labelName: t,
            labelValue: n,
            labelCardinality: r,
            key: `${t}-${n}`,
            $variables: new i.SceneVariableSet({
              variables: [
                new D.s({
                  key: a,
                  name: a,
                  labelMatcher: { key: t, operator: "=", value: n },
                  addLifeCycleEvents: !0,
                }),
              ],
            }),
            body: new T.k({
              variableName: a,
              initialPageSize: 3,
              body: new i.SceneCSSGridLayout({
                children: [],
                isLazy: !0,
                templateColumns: V.MV,
                autoRows: B.On,
                $behaviors: [
                  new i.behaviors.CursorSync({
                    key: "metricCrosshairSync",
                    sync: A.DashboardCursorSync.Crosshair,
                  }),
                ],
              }),
              getLayoutLoading: () =>
                new i.SceneReactObject({ reactNode: l().createElement(o.Spinner, { inline: !0 }) }),
              getLayoutEmpty: () =>
                new i.SceneReactObject({
                  reactNode: l().createElement(
                    F._,
                    { title: "", severity: "info" },
                    "No metrics found for the current filters and time range.",
                  ),
                }),
              getLayoutError: (e) =>
                new i.SceneReactObject({
                  reactNode: l().createElement(F._, {
                    severity: "error",
                    title: "Error while loading metrics!",
                    error: e,
                  }),
                }),
              getLayoutChild: (e, r) =>
                new i.SceneCSSGridItem({
                  body: new B.c0({
                    metric: e.value,
                    vizPanelInGridItem: new R.m({
                      metric: e.value,
                      panelOptions: {
                        fixedColorIndex: r,
                        headerActions: ({ metric: e }) => [
                          new L.B({ metric: e.name }),
                          new N.F({ metric: e }),
                        ],
                      },
                      queryOptions: { labelMatchers: [{ key: t, operator: "=", value: n }] },
                    }),
                  }),
                }),
            }),
          }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function q(e) {
        return {
          container: (0, r.css)({
            background: e.colors.background.canvas,
            margin: e.spacing(1, 0, 0, 0),
            "& div:focus-within": { boxShadow: "none !important" },
          }),
          containerHeader: (0, r.css)({
            marginBottom: "-36px",
            paddingBottom: e.spacing(1.5),
            borderBottom: `1px solid ${e.colors.border.medium}`,
          }),
          headerButtons: (0, r.css)({
            position: "relative",
            top: "3px",
            marginLeft: "auto",
            marginRight: "30px",
            zIndex: 100,
          }),
          selectButton: (0, r.css)({ height: "28px" }),
          collapsableSectionBody: (0, r.css)({ padding: e.spacing(1) }),
          groupName: (0, r.css)({ fontSize: "1.3rem", lineHeight: "1.3rem" }),
          labelValue: (0, r.css)({ fontSize: "16px", marginLeft: "8px" }),
          index: (0, r.css)({
            fontSize: "12px",
            color: e.colors.text.secondary,
            marginLeft: "8px",
          }),
          footer: (0, r.css)({ marginTop: e.spacing(1), "& button": { height: "40px" } }),
          variable: (0, r.css)({ display: "none" }),
        };
      }
      ((w = ({ model: e }) => {
        const [t, n] = (0, s.useState)(!1),
          r = (0, o.useStyles2)(q),
          {
            index: a,
            labelName: c,
            labelValue: p,
            labelCardinality: m,
            $variables: h,
            body: f,
          } = e.useState(),
          b = h.state.variables[0],
          { loading: g, error: y } = b.useState(),
          v = f.useSizes(),
          S = !g && !y && v.total > 0 && v.current < v.total;
        return l().createElement(
          "div",
          { className: r.container, "data-testid": `${c}-${p}-metrics-group` },
          l().createElement(
            "div",
            { className: r.containerHeader },
            l().createElement(
              o.Stack,
              { direction: "row", alignItems: "center", gap: 1 },
              l().createElement(
                "div",
                { className: r.headerButtons },
                l().createElement(
                  o.Button,
                  {
                    className: r.selectButton,
                    variant: "secondary",
                    onClick: () => {
                      var t;
                      const n = i.sceneGraph.lookupVariable($.Ao, e);
                      (n.setState({
                        filters: [...n.state.filters, { key: c, operator: "=", value: p }],
                      }),
                        null === (t = i.sceneGraph.lookupVariable(d.G, e)) ||
                          void 0 === t ||
                          t.changeValueTo(u.c));
                    },
                    tooltip: `See metrics with ${c}=${p}`,
                    tooltipPlacement: "top",
                  },
                  "Select",
                ),
              ),
            ),
          ),
          l().createElement(
            o.CollapsableSection,
            {
              isOpen: !t,
              onToggle: () => n(!t),
              label: l().createElement(
                "div",
                { className: r.groupName },
                l().createElement(
                  o.Stack,
                  { direction: "row", alignItems: "center" },
                  l().createElement(M.Y, null),
                  l().createElement("div", { className: r.labelValue }, p),
                  m > 1 &&
                    l().createElement("div", { className: r.index }, "(", a + 1, "/", m, ")"),
                ),
              ),
            },
            l().createElement(
              "div",
              { className: r.collapsableSectionBody },
              l().createElement(
                o.Stack,
                { direction: "column", gap: 3 },
                l().createElement(f.Component, { model: f }),
              ),
            ),
            S &&
              l().createElement(
                "div",
                { className: r.footer },
                l().createElement(
                  o.Stack,
                  { direction: "row", justifyContent: "center", alignItems: "center" },
                  l().createElement(I.d, {
                    label: "metric",
                    batchSizes: v,
                    onClick: () => {
                      f.increaseBatchSize();
                    },
                    tooltip: `Show more metrics for ${c}="${p}"`,
                  }),
                ),
              ),
          ),
          l().createElement(
            "div",
            { className: r.variable },
            l().createElement(b.Component, { key: b.state.name, model: b }),
          ),
        );
      }),
        (S = "Component") in (v = G)
          ? Object.defineProperty(v, S, {
              value: w,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (v[S] = w));
      const U = "wingmanLabelValues";
      class H extends i.QueryVariable {
        constructor({ labelName: e }) {
          super({
            name: U,
            datasource: { uid: u.J.uid },
            query: `valuesOf(${e})`,
            isMulti: !1,
            allowCustomValue: !1,
            refresh: A.VariableRefresh.onTimeRangeChanged,
            hide: A.VariableHide.hideVariable,
            value: "$__all",
            includeAll: !0,
          });
        }
      }
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })(H, "Component", () => l().createElement(l().Fragment, null));
      class z extends i.SceneObjectBase {
        constructor({ labelName: e }) {
          super({
            key: "metrics-group-list",
            labelName: e,
            $variables: new i.SceneVariableSet({ variables: [new H({ labelName: e })] }),
            body: new T.k({
              variableName: U,
              initialPageSize: 20,
              pageSizeIncrement: 10,
              body: new i.SceneCSSGridLayout({
                children: [],
                isLazy: !0,
                templateColumns: "1fr",
                autoRows: "auto",
                rowGap: 1,
              }),
              getLayoutLoading: () =>
                new i.SceneReactObject({ reactNode: l().createElement(o.Spinner, { inline: !0 }) }),
              getLayoutEmpty: () =>
                new i.SceneReactObject({
                  reactNode: l().createElement(
                    F._,
                    { title: "", severity: "info" },
                    'No label values found for label "',
                    e,
                    '".',
                  ),
                }),
              getLayoutError: (t) =>
                new i.SceneReactObject({
                  reactNode: l().createElement(F._, {
                    severity: "error",
                    title: `Error while loading label "${e}" values!`,
                    error: t,
                  }),
                }),
              getLayoutChild: (t, n, r) =>
                new i.SceneCSSGridItem({
                  body: new G({
                    index: n,
                    labelName: e,
                    labelValue: t.value,
                    labelCardinality: r.length,
                  }),
                }),
            }),
          });
        }
      }
      function K(e) {
        return {
          footer: (0, r.css)({
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: e.spacing(3, 0, 1, 0),
            "& button": { height: "40px" },
          }),
          variable: (0, r.css)({ display: "none" }),
        };
      }
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })(z, "Component", ({ model: e }) => {
        const t = (0, o.useStyles2)(K),
          { body: n, $variables: r, labelName: a } = e.useState(),
          i = r.state.variables[0],
          { loading: s, error: c } = i.useState(),
          u = n.useSizes(),
          d = !s && !c && u.total > 0 && u.current < u.total;
        return l().createElement(
          "div",
          { "data-testid": "metrics-groupby-list" },
          l().createElement(n.Component, { model: n }),
          d &&
            l().createElement(
              "div",
              { className: t.footer },
              l().createElement(I.d, {
                label: `"${a}" value`,
                batchSizes: u,
                onClick: () => {
                  n.increaseBatchSize();
                },
              }),
            ),
          l().createElement(
            "div",
            { className: t.variable },
            l().createElement(i.Component, { key: i.state.name, model: i }),
          ),
        );
      });
      var W = n(3424),
        Q = n(5405),
        Y = n(4757);
      function X(e, t, n) {
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
      class Z extends i.SceneObjectBase {
        onActivate() {
          const e = i.sceneGraph.lookupVariable(d.G, this).state.value;
          (this.updateBasedOnGroupBy(e), this.subscribeToEvents());
        }
        updateBasedOnGroupBy(e) {
          const t = Boolean(e && e !== u.c);
          (i.sceneGraph.findByKeyAndType(this, "quick-search", f.I).toggleCountsDisplay(!t),
            (!t && this.state.body instanceof V.Qs) ||
              (t && this.state.body instanceof z && this.state.body.state.labelName === e) ||
              this.setState({
                body: t ? new z({ labelName: e }) : new V.Qs({ variableName: P.h }),
              }));
        }
        subscribeToEvents() {
          this.initVariablesFilteringAndSorting();
        }
        initVariablesFilteringAndSorting() {
          (this.subscribeToEvent(x.x, (e) => {
            const { key: t } = e.payload,
              n = i.sceneGraph.findByKey(this, t);
            this.state.enginesMap.set(t, { filterEngine: new j.k(n), sortEngine: new _.c(n) });
          }),
            this.subscribeToEvent(k.e, (e) => {
              this.state.enginesMap.delete(e.payload.key);
            }));
          const e = i.sceneGraph.findByKeyAndType(this, "quick-search", f.I),
            t = i.sceneGraph.findAllObjects(this, (e) => e instanceof Q.r),
            n = i.sceneGraph
              .findByKeyAndType(this, "metrics-sorter", m.fD)
              .state.$variables.getByName(m.NJ);
          (this.subscribeToEvent(C.x, (r) => {
            const { key: a, options: i } = r.payload,
              { filterEngine: o, sortEngine: s } = this.state.enginesMap.get(a);
            o.setInitOptions(i);
            const l = { names: e.state.value ? [e.state.value] : [] };
            for (const e of t) l[e.state.type] = e.state.selectedGroups.map((e) => e.value);
            (o.applyFilters(l, { forceUpdate: !0, notify: !1 }), s.sort(n.state.value));
          }),
            this.subscribeToEvent(E.W, (e) => {
              const { searchText: t } = e.payload;
              for (const [, { filterEngine: e, sortEngine: r }] of this.state.enginesMap)
                (e.applyFilters({ names: t ? [t] : [] }), r.sort(n.state.value));
            }),
            this.subscribeToEvent(W.Y, (e) => {
              const { type: t, filters: r } = e.payload;
              for (const [, { filterEngine: e, sortEngine: a }] of this.state.enginesMap)
                (e.applyFilters({ [t]: r }), a.sort(n.state.value));
            }),
            this.subscribeToEvent(O.S, (e) => {
              const { sortBy: t } = e.payload;
              (0, c.z)("sorting_changed", { from: "metrics-reducer", sortBy: t });
              for (const [, { sortEngine: e }] of this.state.enginesMap) e.sort(t);
            }));
        }
        constructor() {
          (super({
            $variables: new i.SceneVariableSet({ variables: [new P.V()] }),
            listControls: new y({}),
            sidebar: new Y.z({}),
            body: void 0,
            enginesMap: new Map(),
          }),
            X(
              this,
              "_variableDependency",
              new i.VariableDependencyConfig(this, {
                variableNames: [d.G],
                onReferencedVariableValueChanged: (e) => {
                  this.updateBasedOnGroupBy(e.state.value);
                },
              }),
            ),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      X(Z, "Component", ({ model: e }) => {
        var t;
        const n = null !== (t = (0, a.useChromeHeaderHeight)()) && void 0 !== t ? t : 0,
          r = (0, o.useStyles2)(ee),
          { $variables: i, body: s, listControls: c, sidebar: u } = e.useState();
        return l().createElement(
          l().Fragment,
          null,
          l().createElement(
            "div",
            { className: r.listControls, "data-testid": "list-controls" },
            l().createElement(c.Component, { model: c }),
          ),
          l().createElement(
            o.Stack,
            { direction: "row", gap: 1, height: `calc(100vh - ${n + J}px)` },
            l().createElement(
              "div",
              { className: r.sidebar, "data-testid": "sidebar" },
              l().createElement(u.Component, { model: u }),
            ),
            l().createElement(
              "div",
              { className: r.list },
              s && l().createElement(s.Component, { model: s }),
            ),
          ),
          l().createElement(
            "div",
            { className: r.variables },
            null == i
              ? void 0
              : i.state.variables.map((e) =>
                  l().createElement(e.Component, { key: e.state.name, model: e }),
                ),
          ),
        );
      });
      const J = 144;
      function ee(e) {
        return {
          listControls: (0, r.css)({ marginBottom: e.spacing(1.5) }),
          list: (0, r.css)({ width: "100%", overflowY: "auto" }),
          sidebar: (0, r.css)({ flex: "0 0 auto", overflowY: "auto" }),
          variables: (0, r.css)({ display: "none" }),
        };
      }
    },
    656: (e, t, n) => {
      n.d(t, { B: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "section-value-changed"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    845: (e, t, n) => {
      function r(e) {
        return null != e && "state" in e && "runQueries" in e;
      }
      function a(e) {
        return e.includes("__ignore_usage__") ? e.replace(/,?__ignore_usage__="",?/, "") : e;
      }
      n.d(t, { C: () => a, x: () => r });
    },
    917: (e, t, n) => {
      n.d(t, { N: () => r });
      var r = (function (e) {
        return (
          (e[(e.XS = 100)] = "XS"),
          (e[(e.S = 180)] = "S"),
          (e[(e.M = 220)] = "M"),
          (e[(e.L = 260)] = "L"),
          (e[(e.XL = 280)] = "XL"),
          e
        );
      })({});
    },
    1026: (e, t, n) => {
      n.d(t, { O7: () => m, g: () => f, gs: () => b });
      var r = n(8531),
        a = n(7909),
        i = n(5561),
        o = n(2559),
        s = n(7616),
        l = n(8705);
      function c(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function u(e, t, n) {
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
      const d = {
          "drilldown.metrics.default_open_sidebar": {
            valueType: "string",
            values: ["treatment", "control", "excluded"],
            defaultValue: "excluded",
            trackingKey: "experiment_default_open_sidebar",
          },
          "drilldown.metrics.hierarchical_prefix_filtering": {
            valueType: "string",
            values: ["treatment", "control", "excluded"],
            defaultValue: "excluded",
            trackingKey: "experiment_hierarchical_prefix_filtering",
          },
        },
        p = (0, s.Co)(d),
        m = Object.fromEntries(
          p.reduce((e, t) => {
            const n = d[t];
            return ("trackingKey" in n && e.push([t, n.trackingKey]), e);
          }, []),
        ),
        h = "metrics-drilldown";
      function f() {
        return i.B0.setProviderAndWait(
          h,
          new a.S({
            baseUrl: `/apis/features.grafana.app/v0alpha1/namespaces/${r.config.namespace}`,
            pollInterval: -1,
            timeoutMs: 1e4,
          }),
          (function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = null != arguments[t] ? arguments[t] : {},
                r = Object.keys(n);
              ("function" == typeof Object.getOwnPropertySymbols &&
                (r = r.concat(
                  Object.getOwnPropertySymbols(n).filter(function (e) {
                    return Object.getOwnPropertyDescriptor(n, e).enumerable;
                  }),
                )),
                r.forEach(function (t) {
                  u(e, t, n[t]);
                }));
            }
            return e;
          })(
            { targetingKey: r.config.namespace, namespace: r.config.namespace },
            r.config.openFeatureContext,
          ),
        ).catch((e) => {
          l.v.warn("OpenFeature provider initialization failed, using default flag values", e);
        });
      }
      function b(e) {
        return ((t = function* () {
          try {
            const t = i.B0.getClient(h);
            (yield (function (e) {
              return e.providerStatus === i.$l.READY
                ? Promise.resolve()
                : new Promise((t) => {
                    e.addHandler(i.Nm.Ready, () => t());
                  });
            })(t),
              t.addHooks(new o.rW()));
            const n = d[e];
            switch (n.valueType) {
              case "boolean":
                return t.getBooleanValue(e, n.defaultValue);
              case "number":
                return t.getNumberValue(e, n.defaultValue);
              case "object":
                return t.getObjectValue(e, n.defaultValue);
              case "string":
                return t.getStringValue(e, n.defaultValue);
              default:
                throw new Error(`Invalid flag value type for flag ${e}`);
            }
          } catch (t) {
            return (
              l.v.error(new Error(`Error evaluating ${e} flag.`, { cause: t })),
              d[e].defaultValue
            );
          }
        }),
        function () {
          var e = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = t.apply(e, n);
            function o(e) {
              c(i, r, a, o, s, "next", e);
            }
            function s(e) {
              c(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        })();
        var t;
      }
    },
    1031: (e, t, n) => {
      n.d(t, { B: () => c });
      var r = n(3014),
        a = n(2007),
        i = n(5959),
        o = n.n(i),
        s = n(1419);
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
      class c extends r.SceneObjectBase {
        constructor({ metric: e, variant: t, fill: n }) {
          (super({
            key: `select-action-${e}`,
            metric: e,
            variant: t || "primary",
            fill: n || "outline",
          }),
            l(this, "onClick", () => {
              this.publishEvent(new s.OO({ metric: this.state.metric }), !0);
            }));
        }
      }
      l(c, "Component", ({ model: e }) => {
        const { variant: t, fill: n } = e.useState();
        return o().createElement(
          a.Button,
          {
            variant: t,
            fill: n,
            size: "sm",
            onClick: e.onClick,
            "data-testid": `select-action-${e.state.metric}`,
          },
          "Select",
        );
      });
    },
    1089: (e, t, n) => {
      n.d(t, { I: () => o });
      var r = n(5732),
        a = n(9365),
        i = n(9194);
      function o(e) {
        const t = e.state.key;
        if (!t)
          throw new TypeError(
            `Variable "${e.state.name}" has no key. Please provide a key in order to publish its lifecycle events.`,
          );
        return (
          e.addActivationHandler(() => {
            (e.publishEvent(new r.x({ key: t }), !0),
              !e.state.loading &&
                e.state.options.length &&
                e.publishEvent(new i.x({ key: t, options: e.state.options }), !0));
            const n = e.subscribeToState((n, r) => {
              !n.loading &&
                r.loading &&
                e.publishEvent(new i.x({ key: t, options: n.options }), !0);
            });
            return () => {
              (n.unsubscribe(), e.publishEvent(new a.e({ key: t }), !0));
            };
          }),
          e
        );
      }
    },
    1100: (e, t, n) => {
      n.d(t, { b: () => o });
      var r = n(1269);
      function a(e, t, n) {
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
      function i(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      const o = (e) => () => (t) =>
        t.pipe(
          (0, r.map)((t) =>
            null == t
              ? void 0
              : t.map((t) => {
                  var n;
                  return (null == t ? void 0 : t.fields[1])
                    ? ((null === (n = t.fields[1].labels) || void 0 === n ? void 0 : n[e]) ||
                        (t.fields[1].labels = i(
                          (function (e) {
                            for (var t = 1; t < arguments.length; t++) {
                              var n = null != arguments[t] ? arguments[t] : {},
                                r = Object.keys(n);
                              ("function" == typeof Object.getOwnPropertySymbols &&
                                (r = r.concat(
                                  Object.getOwnPropertySymbols(n).filter(function (e) {
                                    return Object.getOwnPropertyDescriptor(n, e).enumerable;
                                  }),
                                )),
                                r.forEach(function (t) {
                                  a(e, t, n[t]);
                                }));
                            }
                            return e;
                          })({}, t.fields[1].labels),
                          { [e]: `<unspecified ${e}>` },
                        )),
                      t)
                    : t;
                }),
          ),
        );
    },
    1140: (e, t, n) => {
      n.d(t, { j: () => J, k: () => Z });
      var r = n(6089),
        a = n(7781),
        i = n(8531),
        o = n(3014),
        s = n(2007),
        l = n(5540),
        c = n(5959),
        u = n.n(c),
        d = n(7401),
        p = n(7616),
        m = n(845);
      function h(e, t, n) {
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
      function f(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              h(e, t, n[t]);
            }));
        }
        return e;
      }
      function b(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      function g(e) {
        const t = o.sceneGraph.getData(e),
          n = o.sceneGraph.findObject(t, m.x),
          r = o.sceneGraph.getTimeRange(e).state.value;
        let a,
          i,
          s = [];
        var l;
        (0, m.x)(n) &&
          ((s =
            (null === (l = n.state.queries) || void 0 === l
              ? void 0
              : l.map((t) =>
                  b(f({}, t), {
                    expr: t.expr ? (0, m.C)(o.sceneGraph.interpolate(e, t.expr)) : t.expr,
                    legendFormat: t.legendFormat
                      ? o.sceneGraph.interpolate(e, t.legendFormat)
                      : t.legendFormat,
                    fromExploreMetrics: !1,
                  }),
                )) || []),
          (a = n.state.datasource
            ? b(f({}, n.state.datasource), {
                uid: n.state.datasource.uid
                  ? o.sceneGraph.interpolate(e, n.state.datasource.uid)
                  : n.state.datasource.uid,
              })
            : n.state.datasource),
          (i = n.state.maxDataPoints));
        return {
          panel: f(
            {
              type: e.state.pluginId,
              title: e.state.title ? o.sceneGraph.interpolate(e, e.state.title) : e.state.title,
              targets: s,
              datasource: a,
              options: e.state.options,
              fieldConfig: e.state.fieldConfig,
            },
            e.state.description && { description: e.state.description },
            i && { maxDataPoints: i },
          ),
          range: r,
        };
      }
      var y,
        v,
        S,
        w = n(7291),
        O = n(3740);
      class E extends o.SceneObjectBase {
        constructor() {
          super({});
        }
      }
      ((S = ({ model: e }) => {
        const t = (0, s.useStyles2)(x),
          n = (0, p.kj)(e),
          a = o.sceneGraph.findObject(e, (e) => e instanceof o.VizPanel);
        return n.state.isAddToDashboardAvailable && a
          ? u().createElement(s.Button, {
              id: "add-to-dashboard-action",
              className: (0, r.cx)(t.button),
              "aria-label": w.E,
              variant: "secondary",
              size: "sm",
              fill: "text",
              onClick: () => {
                const t = g(a);
                e.publishEvent(new O.Z({ panelData: t }), !0);
              },
              icon: "apps",
              tooltip: w.E,
              tooltipPlacement: "top",
              "data-testid": "add-to-dashboard-action",
            })
          : null;
      }),
        (v = "Component") in (y = E)
          ? Object.defineProperty(y, v, {
              value: S,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (y[v] = S));
      const x = (e) => ({
        button: r.css`
    margin: 0;
    padding: 0;
    margin-left: ${e.spacing(1)};
  `,
      });
      var k = n(1437),
        C = n(5935),
        P = n(1233),
        j = n(5693);
      function _(e, t, n) {
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
      class T extends o.SceneObjectBase {
        isCurrentStateBookmarked() {
          try {
            const e = (0, p.kj)(this),
              t = o.sceneUtils.getUrlState(e),
              n = (0, k.o)(t);
            return (j.x.getItem(P.V.BOOKMARKS) || []).some((e) => (0, k.o)(e.urlValues) === n);
          } catch (e) {
            return !1;
          }
        }
        constructor() {
          (super({ isBookmarked: !1 }),
            _(this, "onClick", () => {
              const e = o.sceneUtils.getUrlState((0, p.kj)(this)),
                t = (0, k.o)(e),
                n = j.x.getItem(P.V.BOOKMARKS) || [],
                r = this.state.isBookmarked;
              if (r) {
                (0, C.z)("bookmark_changed", { action: "toggled_off" });
                const e = n.filter((e) => (0, k.o)(e.urlValues) !== t);
                j.x.setItem(P.V.BOOKMARKS, e);
              } else {
                (0, C.z)("bookmark_changed", { action: "toggled_on" });
                const t = { urlValues: e, createdAt: Date.now() };
                j.x.setItem(P.V.BOOKMARKS, [...n, t]);
              }
              this.setState({ isBookmarked: !r });
            }),
            this.addActivationHandler(() => {
              const e = this.isCurrentStateBookmarked();
              this.setState({ isBookmarked: e });
            }));
        }
      }
      _(T, "Component", ({ model: e }) => {
        const t = (0, s.useStyles2)(I),
          { isBookmarked: n } = e.useState(),
          a = n ? "Remove bookmark" : "Add bookmark";
        return u().createElement(s.Button, {
          className: (0, r.cx)(t.bookmarkButton, n && t.active),
          "aria-label": a,
          variant: "secondary",
          size: "sm",
          fill: "text",
          onClick: e.onClick,
          icon: n
            ? u().createElement(s.Icon, { name: "favorite", type: "mono", size: "lg" })
            : u().createElement(s.Icon, { name: "star", type: "default", size: "lg" }),
          tooltip: a,
          tooltipPlacement: "top",
          "data-testid": "bookmark-header-action",
        });
      });
      const I = (e) => ({
        bookmarkButton: r.css`
    padding: 0;
    margin-left: ${e.spacing(1)};
  `,
        active: r.css`
    color: ${e.colors.text.maxContrast};
  `,
      });
      var A = n(6773),
        D = n(4758),
        B = n(381);
      function M(e, t, n) {
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
      class N extends o.SceneObjectBase {
        onActivate() {
          const e = o.sceneGraph.getAncestor(this, D.m);
          (this.setState({ currentPanelType: e.state.panelConfig.type }),
            this._subs.add(
              e.subscribeToState((e, t) => {
                e.panelConfig.type !== t.panelConfig.type &&
                  this.setState({ currentPanelType: e.panelConfig.type });
              }),
            ));
        }
        constructor() {
          (super({
            options: [
              { value: "percentiles", label: "percentiles" },
              { value: "heatmap", label: "heatmap" },
            ],
            currentPanelType: void 0,
          }),
            M(this, "onChange", (e) => {
              ((0, C.z)("histogram_panel_type_changed", { panelType: e }),
                this.publishEvent(new B.H({ panelType: e }), !0));
            }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      M(N, "Component", ({ model: e }) => {
        const { options: t, currentPanelType: n } = e.useState();
        return t.length
          ? u().createElement(s.RadioButtonGroup, {
              size: "sm",
              options: t,
              value: n,
              onChange: e.onChange,
            })
          : null;
      });
      var L = n(219);
      function R(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      const $ = "Explain in Assistant";
      class V extends o.SceneObjectBase {
        constructor() {
          super({});
        }
      }
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })(V, "Component", ({ model: e }) => {
        const t = (0, s.useStyles2)(F),
          [n, a] = (0, c.useState)(!1),
          i = o.sceneGraph.findObject(e, (e) => e instanceof o.VizPanel);
        if (
          ((0, c.useEffect)(() => {
            const e = (0, L.isAssistantAvailable)().subscribe((e) => {
              a(e);
            });
            return () => e.unsubscribe();
          }, []),
          !n || !i)
        )
          return null;
        return u().createElement(s.Button, {
          id: "open-assistant-action",
          className: (0, r.cx)(t.button),
          "aria-label": $,
          variant: "secondary",
          size: "sm",
          fill: "text",
          onClick: () => {
            return ((t = function* () {
              var t, n, r;
              const { panel: a } = g(i),
                o = a.title || "unknown",
                s =
                  null === (n = a.targets) || void 0 === n || null === (t = n[0]) || void 0 === t
                    ? void 0
                    : t.expr,
                l = (0, m.C)("string" == typeof s ? s : ""),
                c = l ? ` The current metrics drilldown query is: \`${l}\`.` : "",
                u = null === (r = a.datasource) || void 0 === r ? void 0 : r.uid,
                d = u
                  ? [
                      (0, L.createAssistantContextItem)("datasource", { datasourceUid: u }),
                      (0, L.createAssistantContextItem)("label_value", {
                        datasourceUid: u,
                        labelName: "__name__",
                        labelValue: o,
                      }),
                    ]
                  : [];
              try {
                const t = (0, p.kj)(e),
                  n = yield t.getMetadataForMetric(o);
                n &&
                  d.push(
                    (0, L.createAssistantContextItem)("structured", {
                      title: "Prometheus metric metadata",
                      data: { type: n.type, description: n.help, unit: n.unit },
                    }),
                  );
              } catch (e) {}
              (0, L.openAssistant)({
                origin: "grafana-metricsdrilldown-app/metric-panel",
                prompt: `Help me understand the metric "${o}" and explain what it measures.${c}`,
                context: d,
              });
            }),
            function () {
              var e = this,
                n = arguments;
              return new Promise(function (r, a) {
                var i = t.apply(e, n);
                function o(e) {
                  R(i, r, a, o, s, "next", e);
                }
                function s(e) {
                  R(i, r, a, o, s, "throw", e);
                }
                o(void 0);
              });
            })();
            var t;
          },
          icon: "ai-sparkle",
          tooltip: $,
          tooltipPlacement: "top",
          "data-testid": "open-assistant-action",
        });
      });
      const F = (e) => ({
        button: r.css`
    margin: 0;
    padding: 0;
    margin-left: ${e.spacing(1)};
  `,
      });
      var G = n(917),
        q = n(4299),
        U = n(4924),
        H = n(9762),
        z = n(4179),
        K = n(9207),
        W = n(7791);
      function Q(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function Y(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              Q(i, r, a, o, s, "next", e);
            }
            function s(e) {
              Q(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
      }
      const X = G.N.XL,
        Z = "topview-panel-menu";
      class J extends o.SceneObjectBase {
        onActivate() {
          return Y(function* () {
            const { metric: e } = this.state,
              t = (0, p.kj)(this);
            if (t.state.embeddedMini) {
              const [n] = o.sceneGraph.findDescendents(this, o.SceneFlexItem);
              n.setState({ minHeight: G.N.S, maxHeight: G.N.S });
              const [r] = o.sceneGraph.findDescendents(this, D.m);
              r.update({ headerActions: () => [], menu: void 0, height: G.N.S }, {});
              const a = o.sceneGraph.getTimeRange(t),
                s = (0, K.y)({
                  metric: t.state.metric,
                  labels: (t.state.initialFilters || []).map((e) => ({
                    label: e.key,
                    op: e.operator,
                    value: e.value,
                  })),
                  dataSource: t.state.initialDS,
                  from: String(a.state.from),
                  to: String(a.state.to),
                });
              return void r.setState({
                onClick: () => i.locationService.push(s),
                clickTitle: `Open Metrics Drilldown for ${e}`,
              });
            }
            const n = yield t.getMetadataForMetric(e),
              [r] = o.sceneGraph.findDescendents(this, D.m),
              { metricType: a } = r.state;
            if ((n && r.update({ description: (0, d.R)(n) }, {}), "classic-histogram" === a))
              return;
            const s = r.subscribeToState((t) =>
              Y(function* () {
                "native-histogram" !== a &&
                  "native-histogram" === t.metricType &&
                  (s.unsubscribe(),
                  r.update(
                    {
                      headerActions: () => [
                        new N(),
                        new A.F({ metric: { name: e, type: t.metricType } }),
                        new V(),
                        new E(),
                        new T(),
                      ],
                    },
                    {},
                  ));
              })(),
            );
            this._subs.add(s);
          }).call(this);
        }
        constructor({ metric: e }) {
          (super({
            metric: e,
            topView: new o.SceneFlexLayout({
              direction: "column",
              $behaviors: [
                new o.behaviors.CursorSync({
                  key: "metricCrosshairSync",
                  sync: a.DashboardCursorSync.Crosshair,
                }),
              ],
              children: [
                new o.SceneFlexItem({
                  minHeight: X,
                  maxHeight: "40%",
                  body: new D.m({
                    metric: e,
                    panelOptions: {
                      height: G.N.XL,
                      headerActions: (0, U.D)(e)
                        ? ({ metric: e }) => [
                            new N(),
                            new A.F({ metric: e }),
                            new V(),
                            new E(),
                            new T(),
                          ]
                        : ({ metric: e }) => [new A.F({ metric: e }), new V(), new E(), new T()],
                      menu: () => new z.G({ key: Z, labelName: e }),
                    },
                    queryOptions: { resolution: q.I.HIGH },
                  }),
                }),
              ],
            }),
            selectedTab: void 0,
            actionBar: new H.k3({}),
          }),
            this.addActivationHandler(() => {
              this.onActivate();
            }));
        }
      }
      function ee(e, t, n) {
        return {
          container: (0, r.css)({
            display: "flex",
            flexDirection: "column",
            position: "relative",
            flexGrow: 1,
          }),
          tabContent: (0, r.css)({ height: "100%" }),
          stickyTop: (0, r.css)({
            display: "flex",
            flexDirection: "row",
            background: (0, W.T)(e, n),
            position: "sticky",
            paddingTop: e.spacing(1),
            zIndex: 10,
            top: `calc(var(--app-controls-height, 0px) + ${t}px)`,
          }),
          nonSticky: (0, r.css)({ display: "flex", flexDirection: "row" }),
        };
      }
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })(J, "Component", ({ model: e }) => {
        const { topView: t, selectedTab: n, actionBar: r } = e.useState(),
          a = (0, i.useChromeHeaderHeight)(),
          o = (0, p.kj)(e),
          { embeddedMini: d } = o.state,
          m = (0, s.useStyles2)(ee, o.state.embedded ? 0 : null != a ? a : 0, o),
          h = (0, c.useRef)(null);
        return (
          (0, l.w)({
            ref: h,
            onResize: () => {
              h.current &&
                requestAnimationFrame(() => {
                  !(function (e) {
                    const t = e.current;
                    if (!t) return;
                    const { height: n } = t.getBoundingClientRect();
                    document.documentElement.style.setProperty("--action-bar-height", `${n}px`);
                  })(h);
                });
            },
          }),
          u().createElement(
            "div",
            { className: m.container },
            u().createElement(
              "div",
              { className: m.nonSticky, "data-testid": "top-view" },
              u().createElement(t.Component, { model: t }),
            ),
            !d &&
              u().createElement(
                "div",
                { className: m.stickyTop, id: "action-bar-container", ref: h },
                u().createElement(r.Component, { model: r }),
              ),
            n &&
              u().createElement(
                "div",
                { "data-testid": "tab-content", className: m.tabContent },
                u().createElement(n.Component, { model: n }),
              ),
          )
        );
      });
    },
    1233: (e, t, n) => {
      n.d(t, { V: () => r });
      const r = {
        DATASOURCE: "datasource",
        RECENT_METRICS: "recent-metrics",
        BOOKMARKS: "bookmarks",
        METRIC_PREFS: "metric-prefs",
        BREAKDOWN_SORTBY: "breakdown.sortby",
        SIDEBAR_SECTION: "sidebar.section",
      };
    },
    1251: (e, t, n) => {
      n.d(t, { M: () => o, _: () => i });
      var r = n(6024);
      const a = /[^a-zA-Z0-9]/,
        i = ":";
      function o(e, t) {
        const n = new Map();
        for (const r of e) {
          const e = r.value.split(a);
          if (e[0] === t && e.length > 1) {
            const t = e[1];
            n.set(t, (n.get(t) || 0) + 1);
          }
        }
        return Array.from(n.entries())
          .sort((e, t) => (e[1] !== t[1] ? t[1] - e[1] : (0, r._)(e[0], t[0])))
          .map(([e, n]) => ({ value: `${t}:${e}`, count: n, label: e }));
      }
    },
    1419: (e, t, n) => {
      n.d(t, {
        Ao: () => i,
        Az: () => p,
        EY: () => u,
        GH: () => b,
        H0: () => y,
        Kf: () => m,
        OO: () => g,
        PU: () => s,
        Rp: () => l,
        gR: () => d,
        hc: () => h,
        td: () => f,
        ui: () => o,
        yr: () => c,
      });
      var r = n(7781);
      function a(e, t, n) {
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
      const i = "filters",
        o = "${filters}",
        s = "metric",
        l = "${metric}",
        c = "groupby",
        u = "ds",
        d = "${ds}",
        p = "logsDs",
        m = "${logsDs}",
        h = "other_metric_filters",
        f = "$__logs__",
        b = { uid: d };
      class g extends r.BusEventWithPayload {}
      a(g, "type", "metric-selected-event");
      class y extends r.BusEventBase {}
      a(y, "type", "refresh-metrics-event");
    },
    1437: (e, t, n) => {
      function r(e) {
        return JSON.stringify(
          (function (e) {
            return (
              delete e.actionView,
              delete e.layout,
              delete e.refresh,
              Array.isArray(e["var-filters"]) &&
                (e["var-filters"] = e["var-filters"].filter(Boolean)),
              e
            );
          })(e),
        );
      }
      n.d(t, { o: () => r });
    },
    1522: (e, t, n) => {
      n.d(t, { U: () => l, n: () => c });
      var r = n(7781),
        a = n(5959),
        i = n(9914),
        o = n(8705);
      function s(e, t) {
        return (0, r.isObject)(e) && t in e && "string" == typeof e[t];
      }
      function l(e, t) {
        return e instanceof Error
          ? e
          : "string" == typeof e
            ? new Error(e)
            : s(e, "message")
              ? new Error(e.message)
              : new Error(t);
      }
      function c() {
        const [e, t] = (0, a.useState)();
        return (
          (0, a.useEffect)(() => {
            const e = (e) => {
                var n;
                (function (e) {
                  if ((0, i.gu)(e.message)) return !1;
                  if (e.filename) {
                    const r = new URL(e.filename);
                    var t, n;
                    if (r.protocol.endsWith("extension:"))
                      return (
                        o.v.error(
                          new Error(`Browser extension error: ${e.message}`, {
                            cause: "browser-extension",
                          }),
                          {
                            extensionName: r.hostname,
                            filename: e.filename,
                            lineno: null === (t = e.lineno) || void 0 === t ? void 0 : t.toString(),
                            colno: null === (n = e.colno) || void 0 === n ? void 0 : n.toString(),
                          },
                        ),
                        !1
                      );
                  }
                  var r, a;
                  return (
                    null !== e.error ||
                    !e.message ||
                    (o.v.error(new Error(`Non-critical error: ${e.message}`), {
                      filename: e.filename,
                      lineno: null === (r = e.lineno) || void 0 === r ? void 0 : r.toString(),
                      colno: null === (a = e.colno) || void 0 === a ? void 0 : a.toString(),
                    }),
                    !1)
                  );
                })(e) &&
                  t(l(null !== (n = e.error) && void 0 !== n ? n : e, "Uncaught exception!"));
              },
              n = (e) => {
                s(e.reason, "type") && "cancelled" === e.reason.type
                  ? t(void 0)
                  : t(l(e.reason, "Unhandled rejection!"));
              };
            return (
              window.addEventListener("error", e),
              window.addEventListener("unhandledrejection", n),
              () => {
                (window.removeEventListener("unhandledrejection", n),
                  window.removeEventListener("error", e));
              }
            );
          }, []),
          [e, t]
        );
      }
    },
    1571: (e, t, n) => {
      n.d(t, { G: () => p, O: () => m });
      var r = n(6089),
        a = n(7781),
        i = n(3014),
        o = n(2007),
        s = n(5959),
        l = n.n(s),
        c = n(6024),
        u = n(1419),
        d = n(9564);
      const p = "labelsWingman";
      class m extends i.QueryVariable {
        onActivate() {
          (this.subscribeToState((e, t) => {
            if (
              (e.query !== t.query &&
                (this.setState({ staticOptions: [{ value: e.value, label: e.value }] }),
                this.refreshOptions()),
              e.options !== t.options)
            ) {
              const { value: t } = this.state;
              e.options.some((e) => e.value === t) &&
                this.setState({
                  staticOptions: [],
                  options: e.options.sort((e, t) => (0, c._)(e.label, t.label)),
                });
            }
          }),
            this._subs.add(
              i.sceneGraph
                .findByKeyAndType(this, u.EY, i.DataSourceVariable)
                .subscribeToState((e, t) => {
                  e.value !== t.value && (this.setState({ value: d.c }), this.refreshOptions());
                }),
            ),
            this._subs.add(
              i.sceneGraph
                .findByKeyAndType(this, u.Ao, i.AdHocFiltersVariable)
                .subscribeToState((e, t) => {
                  e.filterExpression !== t.filterExpression && this.updateQuery();
                }),
            ),
            this.updateQuery());
        }
        updateQuery() {
          const e = i.sceneGraph.interpolate(this, u.ui, {});
          this.setState({ query: `{__name__=~".+",${e}}` });
        }
        constructor() {
          (super({
            key: p,
            name: p,
            label: "Group by label",
            placeholder: "Group by label...",
            datasource: { uid: d.J.uid },
            query: "",
            includeAll: !1,
            isMulti: !1,
            allowCustomValue: !1,
            refresh: a.VariableRefresh.onTimeRangeChanged,
            hide: a.VariableHide.hideVariable,
          }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      var h, f, b;
      ((b = ({ model: e }) => {
        const t = (0, o.useStyles2)(g),
          { label: n } = e.useState();
        return l().createElement(
          "div",
          { className: t.container },
          l().createElement(o.Label, { className: t.label }, n),
          l().createElement(i.QueryVariable.Component, { model: e }),
        );
      }),
        (f = "Component") in (h = m)
          ? Object.defineProperty(h, f, {
              value: b,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (h[f] = b));
      const g = (e) => ({
        container: r.css`
    display: flex;
    align-items: center;
    gap: 0;

    [class*='input-wrapper'] {
      width: 240px;
    }
  `,
        label: r.css`
    height: 32px;
    white-space: nowrap;
    margin: 0;
    background-color: ${e.colors.background.primary};
    padding: ${e.spacing(1)};
    border-radius: ${e.shape.radius.default};
    border: 1px solid ${e.colors.border.weak};
    border-right: none;
  `,
      });
    },
    2290: (e, t, n) => {
      (n.r(t), n.d(t, { sortSeries: () => h, wasmSupported: () => b }));
      var r = n(6944),
        a = n(7781),
        i = n(3241),
        o = n(2388),
        s = n(6024);
      function l(e) {
        var t;
        const n = null === (t = e.fields[1]) || void 0 === t ? void 0 : t.labels;
        if (!n) return null;
        const r = Object.keys(n);
        return 0 === r.length ? null : n[r[0]];
      }
      var c = n(5935);
      const u = (e, t = "asc") => {
          const n = "asc" === t ? (e, t) => (0, s._)(e, t) : (e, t) => (0, s._)(t, e);
          return e.sort((e, t) => {
            const r = l(e);
            if (!r) return 0;
            const a = l(t);
            return a ? n(r, a) : 0;
          });
        },
        d = (e, t, n = "asc") => {
          const r = a.fieldReducers.get(t),
            i = e.map((e) => {
              var n;
              const i = e.fields[1];
              if (!i) return { value: 0, dataFrame: e };
              var o;
              var s;
              return {
                value:
                  null !==
                    (s = (
                      null !==
                        (o =
                          null === (n = r.reduce) || void 0 === n
                            ? void 0
                            : n.call(r, i, !0, !0)) && void 0 !== o
                        ? o
                        : (0, a.doStandardCalcs)(i, !0, !0)
                    )[t]) && void 0 !== s
                    ? s
                    : 0,
                dataFrame: e,
              };
            });
          return (
            i.sort("asc" === n ? (e, t) => e.value - t.value : (e, t) => t.value - e.value),
            i.map(({ dataFrame: e }) => e)
          );
        },
        p = (e) => {
          const t = (0, a.outerJoinDataFrames)({ frames: e });
          if (!t) throw new Error("Error while joining frames into a single one");
          const n = t.fields
            .filter((e) => e.type === a.FieldType.number)
            .map((e) => new Float64Array(e.values));
          return r.OutlierDetector.dbscan({ sensitivity: 0.9 }).detect(n);
        },
        m = (e, t) =>
          e.seriesResults[t].isOutlier ? -e.seriesResults[t].outlierIntervals.length : 0,
        h = (0, i.memoize)(
          (e, t, n = "asc") => {
            if (!e.length) return [];
            const r = [...e];
            if ("alphabetical" === t) return u(r, "asc");
            if ("alphabetical-reversed" === t) return u(r, "desc");
            if ("outliers" === t)
              try {
                return ((e, t = "asc") => {
                  if (!b()) throw new Error("WASM not supported");
                  const n = p(e),
                    r = e.map((e, t) => ({ value: m(n, t), dataFrame: e }));
                  return (
                    r.sort("asc" === t ? (e, t) => e.value - t.value : (e, t) => t.value - e.value),
                    r.map(({ dataFrame: e }) => e)
                  );
                })(r, n);
              } catch (e) {
                const t = `Error while sorting by outlying series: "${e.toString()}"!`;
                return (
                  (0, o.HA)([
                    t,
                    "Falling back to standard deviation to identify the most variable series.",
                  ]),
                  d(r, a.ReducerID.stdDev, n)
                );
              }
            return d(r, t, n);
          },
          (e, t, n = "asc") => {
            const r = f(e) ? e[0].fields[0].values[0] : 0,
              a = f(e)
                ? e[e.length - 1].fields[0].values[e[e.length - 1].fields[0].values.length - 1]
                : 0;
            return `${e.length > 0 ? l(e[0]) : ""}_${e.length > 0 ? l(e[e.length - 1]) : ""}_${r}_${a}_${e.length}_${t}_${n}`;
          },
        );
      function f(e) {
        return e.length > 0 && e[0].fields.length > 0 && e[0].fields[0].values.length > 0;
      }
      const b = () => {
        const e = "object" == typeof WebAssembly;
        return (e || (0, c.z)("wasm_not_supported", {}), e);
      };
    },
    2388: (e, t, n) => {
      n.d(t, { HA: () => c, jx: () => l, qq: () => u });
      var r = n(7781),
        a = n(8531),
        i = n(8705);
      function o(e, t, n) {
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
      function s(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      function l(e, t) {
        const n = t.reduce(
          (e, t, n) =>
            s(
              (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {},
                    r = Object.keys(n);
                  ("function" == typeof Object.getOwnPropertySymbols &&
                    (r = r.concat(
                      Object.getOwnPropertySymbols(n).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(n, e).enumerable;
                      }),
                    )),
                    r.forEach(function (t) {
                      o(e, t, n[t]);
                    }));
                }
                return e;
              })({}, e),
              { [`info${n + 1}`]: t },
            ),
          { handheldBy: "displayError" },
        );
        i.v.error(e, n);
        const l = (0, a.getAppEvents)();
        l && l.publish({ type: r.AppEvents.alertError.name, payload: t });
      }
      function c(e) {
        i.v.warn(e);
        const t = (0, a.getAppEvents)();
        t && t.publish({ type: r.AppEvents.alertWarning.name, payload: e });
      }
      function u(e) {
        const t = (0, a.getAppEvents)();
        t && t.publish({ type: r.AppEvents.alertSuccess.name, payload: e });
      }
    },
    2413: (e, t, n) => {
      n.d(t, { d: () => o });
      var r = n(2007),
        a = n(5959),
        i = n.n(a);
      function o({ label: e, batchSizes: t, onClick: n, tooltip: a }) {
        return i().createElement(
          r.Button,
          {
            variant: "secondary",
            fill: "outline",
            onClick: n,
            tooltip: a,
            tooltipPlacement: "top",
          },
          "Show ",
          t.increment,
          " more ",
          1 === t.increment ? e : `${e}s`,
          " (",
          t.current,
          "/",
          t.total,
          ")",
        );
      }
    },
    2457: (e, t, n) => {
      n.d(t, { U: () => u, p: () => c });
      var r = n(3014),
        a = n(2007),
        i = n(5959),
        o = n.n(i),
        s = n(5935);
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
      var c = (function (e) {
        return ((e.GRID = "grid"), (e.ROWS = "rows"), (e.SINGLE = "single"), e);
      })({});
      class u extends r.SceneObjectBase {
        getUrlState() {
          return { [this.state.urlSearchParamName]: this.state.layout };
        }
        updateFromUrl(e) {
          const t = {},
            n = e[this.state.urlSearchParamName];
          (n !== this.state.layout &&
            (t.layout = this.state.options.find((e) => e.value === n) ? n : u.DEFAULT_LAYOUT),
            this.setState(t));
        }
        constructor({ urlSearchParamName: e, options: t }) {
          (super({
            key: "layout-switcher",
            urlSearchParamName: e || "layout",
            options: t || u.DEFAULT_OPTIONS,
            layout: u.DEFAULT_LAYOUT,
          }),
            l(
              this,
              "_urlSync",
              new r.SceneObjectUrlSyncConfig(this, { keys: [this.state.urlSearchParamName] }),
            ),
            l(this, "onChange", (e) => {
              ((0, s.z)("layout_changed", { layout: e }), this.setState({ layout: e }));
            }));
        }
      }
      (l(u, "DEFAULT_OPTIONS", [
        { label: "Grid", value: "grid" },
        { label: "Rows", value: "rows" },
      ]),
        l(u, "DEFAULT_LAYOUT", "grid"),
        l(u, "Component", ({ model: e }) => {
          const { options: t, layout: n } = e.useState();
          return o().createElement(a.RadioButtonGroup, {
            "aria-label": "Layout switcher",
            options: t,
            value: n,
            onChange: e.onChange,
            fullWidth: !1,
          });
        }));
    },
    2559: (e, t, n) => {
      n.d(t, { rW: () => s, rp: () => l });
      var r = n(8531),
        a = n(1026);
      function i(e, t, n) {
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
      const o = {
        experiment_default_open_sidebar: null,
        experiment_hierarchical_prefix_filtering: null,
      };
      class s {
        after(e, t) {
          a.O7[e.flagKey] && (o[a.O7[e.flagKey]] = t.value);
        }
        constructor() {}
      }
      function l(e, t = !1) {
        const n = o[e];
        return n
          ? (function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {},
                  r = Object.keys(n);
                ("function" == typeof Object.getOwnPropertySymbols &&
                  (r = r.concat(
                    Object.getOwnPropertySymbols(n).filter(function (e) {
                      return Object.getOwnPropertyDescriptor(n, e).enumerable;
                    }),
                  )),
                  r.forEach(function (t) {
                    i(e, t, n[t]);
                  }));
              }
              return e;
            })({ [e]: n }, t ? r.config.openFeatureContext : {})
          : null;
      }
    },
    2639: (e, t, n) => {
      n.d(t, { MV: () => b, Qs: () => y, _O: () => g });
      var r = n(6089),
        a = n(3014),
        i = n(6145),
        o = n(2007),
        s = n(5959),
        l = n.n(s),
        c = n(6503),
        u = n(5190),
        d = n(2413),
        p = n(2457),
        m = n(1031),
        h = n(4758),
        f = n(7957);
      const b = "repeat(auto-fit, minmax(400px, 1fr))",
        g = "1fr";
      class y extends a.SceneObjectBase {
        onActivate() {
          this.subscribeToLayoutChange();
        }
        subscribeToLayoutChange() {
          const e = a.sceneGraph.findByKeyAndType(this, "layout-switcher", p.U),
            t = this.state.body.state.body,
            n = (e, n) => {
              e.layout !== (null == n ? void 0 : n.layout) &&
                t.setState({ templateColumns: e.layout === p.p.ROWS ? g : b });
            };
          (n(e.state), this._subs.add(e.subscribeToState(n)));
        }
        constructor({ variableName: e }) {
          (super({
            key: "metrics-list",
            variableName: e,
            body: new u.k({
              variableName: e,
              initialPageSize: 120,
              pageSizeIncrement: 9,
              body: new a.SceneCSSGridLayout({
                children: [],
                isLazy: !0,
                templateColumns: b,
                autoRows: f.fe,
                $behaviors: [
                  new a.behaviors.CursorSync({ key: "metricCrosshairSync", sync: i.yV.Crosshair }),
                ],
              }),
              getLayoutLoading: () =>
                new a.SceneReactObject({ reactNode: l().createElement(o.Spinner, { inline: !0 }) }),
              getLayoutEmpty: () =>
                new a.SceneReactObject({
                  reactNode: l().createElement(
                    c._,
                    { title: "", severity: "info" },
                    "No metrics found for the current filters and time range.",
                  ),
                }),
              getLayoutError: (e) =>
                new a.SceneReactObject({
                  reactNode: l().createElement(c._, {
                    severity: "error",
                    title: "Error while loading metrics!",
                    error: e,
                  }),
                }),
              getLayoutChild: (e, t) =>
                new a.SceneCSSGridItem({
                  body: new f.c0({
                    metric: e.value,
                    vizPanelInGridItem: new h.m({
                      metric: e.value,
                      panelOptions: {
                        fixedColorIndex: t,
                        headerActions: ({ metric: e }) => [new m.B({ metric: e.name })],
                      },
                    }),
                  }),
                }),
            }),
          }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      var v, S, w;
      function O(e) {
        return {
          footer: (0, r.css)({
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: e.spacing(4),
            "& button": { height: "40px", borderRadius: "8px" },
          }),
        };
      }
      ((w = ({ model: e }) => {
        const { variableName: t, body: n } = e.useState(),
          r = (0, o.useStyles2)(O),
          i = a.sceneGraph.lookupVariable(t, e),
          { loading: s, error: c } = i.useState(),
          u = n.useSizes(),
          p = !s && !c && u.total > 0 && u.current < u.total;
        return l().createElement(
          "div",
          { "data-testid": "metrics-list" },
          l().createElement("div", null, l().createElement(n.Component, { model: n })),
          p &&
            l().createElement(
              "div",
              { className: r.footer },
              l().createElement(d.d, {
                label: "metric",
                batchSizes: u,
                onClick: () => {
                  n.increaseBatchSize();
                },
              }),
            ),
        );
      }),
        (S = "Component") in (v = y)
          ? Object.defineProperty(v, S, {
              value: w,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (v[S] = w));
    },
    3139: (e, t, n) => {
      n.d(t, { N: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "force-sync-y-axis"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    3424: (e, t, n) => {
      n.d(t, { Y: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "filters-changed"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    3632: (e, t, n) => {
      n.d(t, { i: () => r });
      const r = {
        TIMESERIES_AVG: "timeseries-avg",
        TIMESERIES_SUM: "timeseries-sum",
        TIMESERIES_STDDEV: "timeseries-stddev",
        TIMESERIES_PERCENTILES: "timeseries-percentiles",
        TIMESERIES_MIN_MAX: "timeseries-minmax",
        TIMESERIES_COUNT: "timeseries-count",
        TIMESERIES_AGE_TIME_MINUS_AVG: "timeseries-age-time-minus-avg",
        TIMESERIES_AGE_TIME_MINUS_MIN_MAX: "timeseries-age-time-minus-min-max",
        HISTOGRAM_HEATMAP: "histogram-heatmap",
        HISTOGRAM_PERCENTILES: "histogram-percentiles",
        STATUS_UPDOWN_HISTORY: "status-updown-history",
        STATUS_UPDOWN_STAT: "status-updown-stat",
      };
    },
    3740: (e, t, n) => {
      n.d(t, { Z: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "open-add-to-dashboard"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    3916: (e, t, n) => {
      n.d(t, { V: () => l, h: () => s });
      var r = n(3014),
        a = n(5665),
        i = n(1089);
      function o(e, t, n) {
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
      const s = "filtered-metrics-wingman";
      class l extends r.CustomVariable {
        onActivate() {
          const e = r.sceneGraph.findByKeyAndType(this, a.$, a.s),
            { loading: t, error: n, options: i } = e.state;
          (this.setState({ loading: t, error: n, options: i }),
            this._subs.add(
              e.subscribeToState((e, t) => {
                const n = t.loading && !e.loading;
                this.setState(
                  (function (e) {
                    for (var t = 1; t < arguments.length; t++) {
                      var n = null != arguments[t] ? arguments[t] : {},
                        r = Object.keys(n);
                      ("function" == typeof Object.getOwnPropertySymbols &&
                        (r = r.concat(
                          Object.getOwnPropertySymbols(n).filter(function (e) {
                            return Object.getOwnPropertyDescriptor(n, e).enumerable;
                          }),
                        )),
                        r.forEach(function (t) {
                          o(e, t, n[t]);
                        }));
                    }
                    return e;
                  })({ loading: e.loading, error: e.error }, n && { options: e.options }),
                );
              }),
            ));
        }
        constructor() {
          return (
            super({
              key: s,
              name: s,
              label: "Filtered Metrics",
              loading: !1,
              error: null,
              options: [],
              includeAll: !0,
              value: "$__all",
              skipUrlSync: !0,
            }),
            this.addActivationHandler(this.onActivate.bind(this)),
            (0, i.I)(this)
          );
        }
      }
    },
    4160: (e, t, n) => {
      n.d(t, { o: () => T, B: () => _ });
      var r = n(3014),
        a = n(1625),
        i = n(6089),
        o = n(7781),
        s = n(2007),
        l = n(5959),
        c = n.n(l),
        u = n(4758),
        d = n(7561),
        p = n(5935);
      function m(e) {
        const t = e.fields.find((e) => "Value" === e.name);
        return (
          !!(
            t &&
            ((n = t),
            "entities" in n &&
              Array.isArray(null === (r = n.entities) || void 0 === r ? void 0 : r.NaN))
          ) && t.entities.NaN.length === e.length
        );
        var n, r;
      }
      function h(e, t, n) {
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
      function f(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              h(e, t, n[t]);
            }));
        }
        return e;
      }
      function b(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      function g(e) {
        if ("timeseries" !== e.state.pluginId) return;
        const [t] = r.sceneGraph.findDescendents(e, r.SceneQueryRunner);
        if (!t) return;
        const { queries: n } = t.state;
        if (!(null == n ? void 0 : n.length)) return;
        const { metric: a, metricType: i, queryConfig: s } = r.sceneGraph.getAncestor(e, u.m).state;
        if ("counter" === i) return;
        const l = t.subscribeToState((n, l) => {
          var u, h, g, v;
          if (
            (null === (u = n.data) || void 0 === u ? void 0 : u.state) !== o.LoadingState.Done ||
            !(null === (h = n.data.series) || void 0 === h ? void 0 : h.length) ||
            n.data.series === (null === (g = l.data) || void 0 === g ? void 0 : g.series)
          )
            return;
          const S = null === (v = n.data.series[0].meta) || void 0 === v ? void 0 : v.type;
          if (S && !S.startsWith("timeseries")) return;
          if (!n.data.series.every(m)) return;
          const w = (0, d.H)({
            metric: { name: a, type: i },
            queryConfig: b(f({}, s), { addExtremeValuesFiltering: !0 }),
          });
          (t.setState({ queries: w.queries }),
            t.runQueries(),
            e.setState({
              titleItems: c().createElement(y, {
                level: "info",
                message:
                  "Panel data was re-fetched with a more complex query to handle extremely small values in the series",
              }),
            }),
            (0, p.z)("extreme_value_filter_behavior_triggered", {
              expression: r.sceneGraph.interpolate(t, t.state.queries[0].expr),
            }));
        });
        return () => {
          l.unsubscribe();
        };
      }
      function y({ message: e, level: t }) {
        const n = (0, s.useStyles2)(v, t);
        return c().createElement(
          "div",
          { className: n.extremeValuedisclaimer },
          c().createElement(
            s.Tooltip,
            { content: e },
            c().createElement(
              "span",
              { className: n.warningMessage },
              c().createElement(s.Icon, {
                name: "warning" === t ? "exclamation-triangle" : "info-circle",
                "aria-hidden": "true",
              }),
            ),
          ),
        );
      }
      const v = (e, t) => ({
        extremeValuedisclaimer: (0, i.css)({
          label: "extreme-value-disclaimer",
          display: "flex",
          alignItems: "center",
          gap: e.spacing(1),
        }),
        warningMessage: (0, i.css)({
          display: "flex",
          alignItems: "center",
          gap: e.spacing(0.5),
          color: "warning" === t ? e.colors.warning.main : e.colors.info.main,
          fontSize: e.typography.bodySmall.fontSize,
        }),
      });
      var S = n(1419),
        w = n(7616),
        O = n(5276),
        E = n(4810),
        x = n(1269);
      const k = () => (e) =>
        e.pipe(
          (0, x.map)((e) =>
            null == e ? void 0 : e.map((e, t) => ((e.refId = `${e.refId}-${t}`), e)),
          ),
        );
      var C = n(1100);
      function P(e, t, n) {
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
      const j = (e, t) => () => (n) =>
        n.pipe(
          (0, x.map)((n) =>
            null == n
              ? void 0
              : n.slice(e, t).map((e) => {
                  var t;
                  return (
                    (e.meta = (function (e) {
                      for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {},
                          r = Object.keys(n);
                        ("function" == typeof Object.getOwnPropertySymbols &&
                          (r = r.concat(
                            Object.getOwnPropertySymbols(n).filter(function (e) {
                              return Object.getOwnPropertyDescriptor(n, e).enumerable;
                            }),
                          )),
                          r.forEach(function (t) {
                            P(e, t, n[t]);
                          }));
                      }
                      return e;
                    })({}, e.meta)),
                    (t = e.meta).stats || (t.stats = []),
                    e.meta.stats.unshift({ displayName: "seriesCount", value: n.length }),
                    e
                  );
                }),
          ),
        );
      function _(e) {
        var t;
        if (e.queryConfig.groupBy)
          return (function (e) {
            var t;
            const { metric: n, panelConfig: i, queryConfig: o } = e,
              s = (0, d.H)({ metric: n, queryConfig: o }),
              l = s.isRateQuery ? (0, O.MM)(n.name) : (0, O.l_)(n.name),
              c = new r.SceneDataTransformer({
                $data: new r.SceneQueryRunner({
                  datasource: S.GH,
                  maxDataPoints: s.maxDataPoints,
                  queries: s.queries,
                }),
                transformations: [j(0, T), (0, C.b)(o.groupBy), k],
              }),
              { refId: u } = s.queries[0],
              p = i.fixedColorIndex || 0,
              m = r.PanelBuilders.timeseries()
                .setTitle(i.title)
                .setDescription(i.description)
                .setHeaderActions(i.headerActions({ metric: n, panelConfig: i }))
                .setMenu(
                  null === (t = i.menu) || void 0 === t
                    ? void 0
                    : t.call(i, { metric: n, panelConfig: i }),
                )
                .setShowMenuAlways(Boolean(i.menu))
                .setData(c)
                .setUnit(l)
                .setOption("legend", i.legend || { showLegend: !0, placement: "right" })
                .setOption("tooltip", { mode: a.$N.Multi, sort: a.xB.Descending })
                .setOverrides((e) => {
                  for (let t = 0; t < T; t++)
                    e.matchFieldsByQuery(`${u}-${t}`).overrideColor({
                      mode: "fixed",
                      fixedColor: (0, w.Vy)(p + t),
                    });
                })
                .setBehaviors(i.behaviors)
                .build();
            return m;
          })(e);
        const { metric: n, panelConfig: i, queryConfig: o } = e,
          s = (0, d.H)({ metric: n, queryConfig: o }),
          l = s.isRateQuery ? (0, O.MM)(n.name) : (0, O.l_)(n.name),
          c =
            o.data ||
            new r.SceneQueryRunner({
              datasource: S.GH,
              maxDataPoints: s.maxDataPoints,
              queries: s.queries,
            }),
          u = r.PanelBuilders.timeseries()
            .setTitle(i.title)
            .setDescription(i.description)
            .setHeaderActions(i.headerActions({ metric: n, panelConfig: i }))
            .setMenu(
              null === (t = i.menu) || void 0 === t
                ? void 0
                : t.call(i, { metric: n, panelConfig: i }),
            )
            .setShowMenuAlways(Boolean(i.menu))
            .setData(c)
            .setUnit(l)
            .setOption("legend", i.legend || { showLegend: !0, placement: "bottom" })
            .setCustomFieldConfig("fillOpacity", 9)
            .setBehaviors([g, (0, E.o)(i.fixedColorIndex), ...(i.behaviors || [])]);
        if (1 === s.queries.length)
          u.setColor(
            i.fixedColorIndex
              ? { mode: "fixed", fixedColor: (0, w.Vy)(i.fixedColorIndex) }
              : void 0,
          );
        else {
          const e = i.fixedColorIndex || 0;
          u.setOverrides((t) => {
            s.queries.forEach((n, r) => {
              t.matchFieldsByQuery(n.refId).overrideColor({
                mode: "fixed",
                fixedColor: (0, w.Vy)(e + r),
              });
            });
          });
        }
        return u.build();
      }
      const T = 20;
    },
    4179: (e, t, n) => {
      n.d(t, { G: () => v });
      var r = n(3014),
        a = n(5959),
        i = n.n(a),
        o = n(7616),
        s = n(1140),
        l = n(8531),
        c = n(8943),
        u = n(2388),
        d = n(5935);
      class p {
        static create(e) {
          return {
            text: "Copy URL",
            iconClassName: "copy",
            onClick: () => {
              if (navigator.clipboard) {
                (0, d.z)("selected_metric_action_clicked", { action: "share_url" });
                const t = `${l.config.appUrl.endsWith("/") ? l.config.appUrl.slice(0, -1) : l.config.appUrl}${c.G}/${(0, o.xi)(e)}`;
                (navigator.clipboard.writeText(t), (0, u.qq)(["URL copied to clipboard"]));
              }
            },
          };
        }
      }
      var m = n(845);
      function h(e, t, n) {
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
      function f(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class b {
        static create(e) {
          let t;
          try {
            const n = r.sceneGraph.getAncestor(e, r.VizPanel),
              a = r.sceneGraph.getData(n).state.data;
            if (!a) throw new Error("Cannot get link to explore, no panel data found");
            t = (0, r.getExploreURL)(a, e, a.timeRange, (e) =>
              "expr" in e && "string" == typeof e.expr
                ? f(
                    (function (e) {
                      for (var t = 1; t < arguments.length; t++) {
                        var n = null != arguments[t] ? arguments[t] : {},
                          r = Object.keys(n);
                        ("function" == typeof Object.getOwnPropertySymbols &&
                          (r = r.concat(
                            Object.getOwnPropertySymbols(n).filter(function (e) {
                              return Object.getOwnPropertyDescriptor(n, e).enumerable;
                            }),
                          )),
                          r.forEach(function (t) {
                            h(e, t, n[t]);
                          }));
                      }
                      return e;
                    })({}, e),
                    { expr: (0, m.C)(e.expr) },
                  )
                : e,
            );
          } catch (e) {}
          return {
            text: "Explore",
            iconClassName: "compass",
            onClick: () =>
              null == t
                ? void 0
                : t.then((e) => {
                    e && window.open(`${l.config.appSubUrl}${e}`, "_blank");
                  }),
            shortcut: "p x",
          };
        }
      }
      function g(e, t, n) {
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
      function y(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class v extends r.SceneObjectBase {
        addItem(e) {
          var t;
          null === (t = this.state.body) || void 0 === t || t.addItem(e);
        }
        setItems(e) {
          var t;
          null === (t = this.state.body) || void 0 === t || t.setItems(e);
        }
        constructor(e) {
          (super(
            y(
              (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {},
                    r = Object.keys(n);
                  ("function" == typeof Object.getOwnPropertySymbols &&
                    (r = r.concat(
                      Object.getOwnPropertySymbols(n).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(n, e).enumerable;
                      }),
                    )),
                    r.forEach(function (t) {
                      g(e, t, n[t]);
                    }));
                }
                return e;
              })({}, e),
              { body: new r.VizPanelMenu({}) },
            ),
          ),
            this.addActivationHandler(() => {
              var e;
              const t = [{ text: "Navigation", type: "group" }, b.create(this)];
              (this.state.key === s.k &&
                t.push({ text: "Actions", type: "group" }, p.create((0, o.kj)(this))),
                null === (e = this.state.body) || void 0 === e || e.setState({ items: t }));
            }));
        }
      }
      g(v, "Component", ({ model: e }) => {
        const { body: t } = e.useState();
        return i().createElement(
          "div",
          { "data-testid": "panel-menu" },
          t && i().createElement(t.Component, { model: t }),
        );
      });
    },
    4293: (e, t, n) => {
      n.d(t, { W: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "quick-search-changed"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    4299: (e, t, n) => {
      n.d(t, { I: () => r });
      var r = (function (e) {
        return ((e.HIGH = "HIGH"), (e.MEDIUM = "MEDIUM"), e);
      })({});
    },
    4757: (e, t, n) => {
      n.d(t, { z: () => le, G: () => oe });
      var r = n(6089),
        a = n(7781),
        i = n(3014),
        o = n(2007),
        s = n(5959),
        l = n.n(s),
        c = n(9564),
        u = n(1571),
        d = n(297),
        p = n(6024);
      function m(e) {
        const t = new Map();
        for (const r of e) {
          const e = r.value.split(/[^a-z0-9]/i),
            a = e.length <= 1 ? r.value : e[e.length - 1];
          var n;
          const i = null !== (n = t.get(a)) && void 0 !== n ? n : [];
          (i.push(r.value), t.set(a || "<none>", i));
        }
        const r = new Map();
        for (const [e, n] of t) r.set(e, n.length);
        return Array.from(r.entries())
          .sort((e, t) => (e[1] !== t[1] ? t[1] - e[1] : (0, p._)(e[0], t[0])))
          .map(([e, t]) => ({ value: e, count: t, label: e }));
      }
      var h = n(477);
      function f(e) {
        return /^\w*:.*?(?::\w+)?$/.test(e);
      }
      function b(e) {
        const t = new Map([
          ["metrics", []],
          ["rules", []],
        ]);
        for (const r of e) {
          const { value: e } = r,
            a = f(e) ? "rules" : "metrics";
          var n;
          const i = null !== (n = t.get(a)) && void 0 !== n ? n : [];
          (i.push(e), t.set(a, i));
        }
        return [
          { value: "^(?!.*:.*)", label: h.b.metrics, count: t.get("metrics").length },
          { value: ":", label: h.b.rules, count: t.get("rules").length },
        ];
      }
      var g = n(1026),
        y = n(1419),
        v = n(1233),
        S = n(5693),
        w = n(7616),
        O = n(396),
        E = n(9697),
        x = n(2388),
        k = n(1437);
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
      function P(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              C(e, t, n[t]);
            }));
        }
        return e;
      }
      function j(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      const _ = (e, t, n) =>
        e.length + 2 + t.length > n ? t.substring(0, n - e.length - 5) + "..." : t;
      function T(e) {
        const t = (0, o.useStyles2)(I),
          { onSelect: n, onDelete: r, bookmark: i } = e,
          { createdAt: s, urlValues: c } = i,
          u = c.metric || "?",
          d = ((e) => {
            const t = e[`var-${y.Ao}`];
            return t.length ? t.map((e) => e.split("|")) : [];
          })(c),
          p = _("", (0, w.aO)(u), 27),
          m = `${e.compactHeight && d.length > 0 ? t.cardTall : ""}`,
          h = `${t.card} ${e.wide ? t.cardWide : ""} ${m}`;
        return l().createElement(
          "article",
          { "data-testid": `data-trail-card ${u}` },
          l().createElement(
            o.Card,
            { onClick: n, className: h },
            l().createElement(o.Card.Heading, null, l().createElement("div", null, p)),
            l().createElement(
              o.Card.Meta,
              { className: t.meta },
              d.map(([e, n, r], a) =>
                l().createElement(
                  "div",
                  { key: a, className: t.filter },
                  l().createElement(
                    o.Text,
                    { variant: "bodySmall", color: "secondary" },
                    e,
                    " ",
                    n,
                  ),
                  l().createElement(
                    o.Text,
                    { variant: "bodySmall", color: "primary", weight: "medium" },
                    " ",
                    _(e, r, 44),
                  ),
                ),
              ),
            ),
            l().createElement(
              "div",
              { className: t.deleteButton },
              l().createElement(
                o.Card.SecondaryActions,
                null,
                l().createElement(o.IconButton, {
                  key: "delete",
                  name: "trash-alt",
                  className: t.secondary,
                  tooltip: "Remove bookmark",
                  tooltipPlacement: "top",
                  onClick: r,
                }),
              ),
            ),
          ),
          l().createElement(
            "div",
            { className: t.date },
            l().createElement(
              o.Text,
              { variant: "bodySmall", color: "secondary" },
              "Date created:",
              " ",
            ),
            l().createElement(
              o.Text,
              { variant: "bodySmall", color: "primary", weight: "medium" },
              s > 0 && (0, a.dateTimeFormat)(s, { format: "YYYY-MM-DD" }),
            ),
          ),
        );
      }
      function I(e) {
        return {
          card: (0, r.css)({
            padding: `12px ${e.spacing(2)} ${e.spacing(1)} ${e.spacing(2)}`,
            alignItems: "start",
            marginBottom: 0,
            borderTop: `1px solid ${e.colors.border.weak}`,
            borderRight: `1px solid ${e.colors.border.weak}`,
            borderLeft: `1px solid ${e.colors.border.weak}`,
            borderBottom: "none",
            borderRadius: "2px 2px 0 0",
          }),
          cardWide: (0, r.css)({ width: "100%" }),
          cardTall: (0, r.css)({ height: "110px" }),
          secondary: (0, r.css)({ color: e.colors.text.secondary, fontSize: "12px" }),
          date: (0, r.css)({
            border: `1px solid ${e.colors.border.weak}`,
            borderRadius: "0 0 2px 2px",
            padding: `${e.spacing(1)} ${e.spacing(2)}`,
            backgroundColor: e.colors.background.primary,
          }),
          meta: (0, r.css)({
            flexWrap: "wrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxHeight: "36px",
            gridArea: "Meta",
            color: e.colors.text.secondary,
            whiteSpace: "nowrap",
          }),
          filter: (0, r.css)({
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }),
          deleteButton: (0, r.css)({
            position: "absolute",
            bottom: e.spacing(1.5),
            right: e.spacing(0.5),
          }),
        };
      }
      var A,
        D,
        B,
        M = n(5935),
        N = n(9985);
      class L extends i.SceneObjectBase {
        constructor({ key: e, title: t, description: n, icon: r, disabled: a }) {
          super({
            key: e,
            title: t,
            description: n,
            icon: r,
            disabled: null != a && a,
            active: !1,
          });
        }
      }
      function R(e) {
        return {
          bookmarksList: (0, r.css)({ overflowY: "auto", paddingRight: e.spacing(1) }),
          emptyState: (0, r.css)({ height: "100px" }),
        };
      }
      ((B = ({ model: e }) => {
        const t = (0, o.useStyles2)(R),
          { title: n, description: r } = e.useState(),
          {
            bookmarks: a,
            gotoBookmark: c,
            removeBookmark: u,
          } = (function (e) {
            const [t, n] = (0, s.useState)({}),
              r = (0, w.kj)(e);
            (0, s.useEffect)(() => {
              const e = S.x.getItem(v.V.BOOKMARKS) || [],
                t = {};
              for (const n of e) {
                const e = (0, k.o)(n.urlValues);
                t[e] = j(P({}, n), { key: e });
              }
              n(t);
            }, []);
            const { value: a } = i.sceneGraph.findByKeyAndType(r, y.EY, E.i).useState();
            return {
              bookmarks: (0, s.useMemo)(
                () => Object.values(t).filter((e) => e.urlValues[`var-${y.EY}`] === a),
                [t, a],
              ),
              addBookmark: () => {
                const e = { urlValues: i.sceneUtils.getUrlState(r), createdAt: Date.now() },
                  a = Object.values(t).map((e) => j(P({}, e), { key: void 0 }));
                S.x.setItem(v.V.BOOKMARKS, [...a, e]);
                const o = (0, k.o)(e.urlValues);
                n(j(P({}, t), { [o]: j(P({}, e), { key: o }) }));
              },
              removeBookmark: (e) => {
                delete t[e];
                const r = Object.values(t).map((e) => j(P({}, e), { key: void 0 }));
                (S.x.setItem(v.V.BOOKMARKS, r), n(P({}, t)));
              },
              gotoBookmark: (e) => {
                const n = t[e];
                if (!n) {
                  const e = new Error("Bookmark not found!");
                  return void (0, x.jx)(e, [e.toString()]);
                }
                r.publishEvent(
                  new y.OO({ metric: n.urlValues.metric, urlValues: n.urlValues }),
                  !0,
                );
              },
            };
          })(e);
        return l().createElement(
          o.Stack,
          { direction: "column", gap: 1, height: "100%" },
          l().createElement(N._, {
            title: n,
            description: r,
            "data-testid": "bookmarks-list-sidebar",
          }),
          a.length > 0
            ? l().createElement(
                "div",
                { className: t.bookmarksList },
                l().createElement(
                  o.Stack,
                  { direction: "column", gap: 1.5 },
                  a.map((e) =>
                    l().createElement(T, {
                      key: e.key,
                      bookmark: e,
                      onSelect: () => {
                        return (
                          (t = e.key),
                          (0, M.z)("exploration_started", { cause: "bookmark_clicked" }),
                          void c(t)
                        );
                        var t;
                      },
                      onDelete: () => {
                        return (
                          (t = e.key),
                          (0, M.z)("bookmark_changed", { action: "deleted" }),
                          void u(t)
                        );
                        var t;
                      },
                      wide: !0,
                      compactHeight: !0,
                    }),
                  ),
                ),
              )
            : l().createElement(
                "div",
                { className: t.emptyState },
                l().createElement(
                  o.Stack,
                  { direction: "column", alignItems: "center" },
                  l().createElement(
                    o.Text,
                    { color: "secondary", italic: !0 },
                    "No bookmarks yet for the",
                  ),
                  l().createElement(
                    o.Text,
                    { color: "secondary", italic: !0 },
                    "current data source.",
                  ),
                ),
              ),
        );
      }),
        (D = "Component") in (A = L)
          ? Object.defineProperty(A, D, {
              value: B,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (A[D] = B));
      var $ = n(656);
      function V({ labels: e, selectedLabel: t, onSelectLabel: n, onClearSelection: r }) {
        const a = (0, o.useStyles2)(F);
        return l().createElement(
          l().Fragment,
          null,
          l().createElement(
            "div",
            { className: a.listHeader },
            l().createElement(
              "div",
              { className: a.selected },
              t === c.c ? "No selection" : `Selected: "${t}"`,
            ),
            l().createElement(
              o.Button,
              { variant: "secondary", fill: "text", onClick: r, disabled: t === c.c },
              "clear",
            ),
          ),
          !e.length && l().createElement("div", { className: a.noResults }, "No results."),
          e.length > 0 &&
            l().createElement(
              "div",
              { className: a.list, "data-testid": "labels-list" },
              l().createElement(o.RadioButtonList, {
                name: "labels-list",
                options: e,
                onChange: n,
                value: t,
              }),
            ),
        );
      }
      function F(e) {
        return {
          listHeader: (0, r.css)({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: e.colors.text.secondary,
            margin: e.spacing(0),
            padding: e.spacing(0, 0, 0, 1),
          }),
          selected: (0, r.css)({
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }),
          list: (0, r.css)({
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: 0,
            overflowY: "auto",
            '& [role="radiogroup"]': { gap: 0 },
            "& label": {
              cursor: "pointer",
              padding: e.spacing(0.5, 1),
              "&:hover": { background: e.colors.background.secondary },
            },
            "& label div": { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
          }),
          noResults: (0, r.css)({ fontStyle: "italic", padding: e.spacing(0, 1, 1, 1) }),
        };
      }
      function G(e, t, n) {
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
      class q extends i.SceneObjectBase {
        selectLabel(e) {
          i.sceneGraph.lookupVariable(this.state.variableName, this).changeValueTo(e);
          const t = Boolean(e && e !== c.c);
          this.setState({ active: t });
        }
        constructor({
          key: e,
          variableName: t,
          title: n,
          description: r,
          icon: a,
          disabled: o,
          active: l,
        }) {
          (super({
            key: e,
            variableName: t,
            title: n,
            description: r,
            icon: a,
            disabled: null != o && o,
            active: null != l && l,
          }),
            G(this, "onSelectLabel", (e) => {
              ((0, M.z)("sidebar_group_by_label_filter_applied", { label: e }),
                this.selectLabel(e));
            }),
            G(this, "onClearSelection", () => {
              this.selectLabel(c.c);
            }),
            G(this, "useLabelsBrowser", () => {
              const { variableName: e, title: t, description: n } = this.useState(),
                r = i.sceneGraph.lookupVariable(e, this),
                { loading: a, options: o, value: l } = r.useState(),
                [u, d] = (0, s.useState)("");
              return {
                title: t,
                description: n,
                loading: a,
                selectedLabel: l,
                labelsList: (0, s.useMemo)(() => {
                  const e = [(e) => e !== c.c, (e) => e.toLowerCase().includes(u.toLowerCase())];
                  return o.filter((t) => e.every((e) => e(t.value)));
                }, [o, u]),
                searchValue: u,
                onInputChange: (e) => {
                  d(e.currentTarget.value);
                },
                onInputKeyDown: (e) => {
                  "Escape" === e.key && (e.preventDefault(), d(""));
                },
                onInputClear: () => {
                  d("");
                },
              };
            }));
        }
      }
      function U(e) {
        return {
          container: (0, r.css)({
            display: "flex",
            flexDirection: "column",
            gap: e.spacing(1),
            height: "100%",
            overflowY: "hidden",
          }),
          search: (0, r.css)({ marginBottom: e.spacing(1), padding: e.spacing(0, 0.5) }),
        };
      }
      G(q, "Component", ({ model: e }) => {
        const t = (0, o.useStyles2)(U),
          {
            title: n,
            description: r,
            loading: a,
            labelsList: i,
            selectedLabel: s,
            searchValue: c,
            onInputChange: u,
            onInputKeyDown: d,
            onInputClear: p,
          } = e.useLabelsBrowser();
        return l().createElement(
          "div",
          { className: t.container, "data-testid": "labels-browser" },
          l().createElement(N._, { title: n, description: r }),
          l().createElement(o.Input, {
            className: t.search,
            prefix: l().createElement(o.Icon, { name: "search" }),
            placeholder: "Search...",
            value: c,
            onChange: u,
            onKeyDown: d,
            suffix: l().createElement(o.IconButton, {
              name: "times",
              variant: "secondary",
              tooltip: "Clear search",
              onClick: p,
            }),
          }),
          a && l().createElement(o.Spinner, { inline: !0 }),
          !a &&
            l().createElement(V, {
              labels: i,
              selectedLabel: s,
              onSelectLabel: e.onSelectLabel,
              onClearSelection: e.onClearSelection,
            }),
        );
      });
      var H = n(5405),
        z = n(5665),
        K = n(578);
      function W(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function Q(e, t, n) {
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
      const Y = [
        { value: "all", label: "All time" },
        ...["1m", "3m", "5m", "15m", "30m", "1h", "3h", "6h", "12h", "24h"].map((e) => ({
          value: e,
          label: `Past ${e}`,
        })),
      ];
      class X extends i.SceneObjectBase {
        getUrlState() {
          const e = "all" === this.state.currentInterval ? "" : this.state.currentInterval;
          return { [this.state.key]: e };
        }
        updateFromUrl(e) {
          const t = e[this.state.key] || "all";
          t !== this.state.currentInterval &&
            Y.some((e) => e.value === t) &&
            this.setState({ currentInterval: t });
        }
        onActivate() {
          this.subscribeToState((e, t) => {
            return ((n = function* () {
              e.currentInterval !== t.currentInterval &&
                (this.setState({ active: Boolean("all" !== e.currentInterval) }),
                this.publishEvent(
                  new $.B({
                    key: this.state.key,
                    values: "all" !== e.currentInterval ? [e.currentInterval] : [],
                  }),
                  !0,
                ));
            }),
            function () {
              var e = this,
                t = arguments;
              return new Promise(function (r, a) {
                var i = n.apply(e, t);
                function o(e) {
                  W(i, r, a, o, s, "next", e);
                }
                function s(e) {
                  W(i, r, a, o, s, "throw", e);
                }
                o(void 0);
              });
            }).call(this);
            var n;
          });
        }
        update(e) {
          this.setState({ currentInterval: e });
          const t = [
            ...i.sceneGraph.findAllObjects(
              i.sceneGraph.getAncestor(this, K.m),
              (e) => e instanceof z.s,
            ),
            i.sceneGraph.findByKeyAndType(this, z.$, z.s),
          ];
          "all" === e
            ? t.forEach((e) => e.fetchAllMetrics())
            : t.forEach((t) => t.fetchRecentMetrics(e));
        }
        constructor({ key: e, title: t, description: n, icon: r, active: a, disabled: o }) {
          (super({
            key: e,
            title: t,
            description: n,
            icon: r,
            active: null != a && a,
            disabled: null != o && o,
            intervalOptions: Y,
            currentInterval: "all",
          }),
            Q(this, "_urlSync", new i.SceneObjectUrlSyncConfig(this, { keys: [this.state.key] })),
            Q(this, "onChangeInterval", (e) => {
              ((0, M.z)("sidebar_recent_filter_selected", { interval: e }), this.update(e));
            }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function Z(e) {
        return {
          container: (0, r.css)({
            display: "flex",
            flexDirection: "column",
            gap: e.spacing(1),
            height: "100%",
            overflowY: "hidden",
          }),
          list: (0, r.css)({ height: "100%", padding: e.spacing(0, 1, 1, 1), overflowY: "auto" }),
        };
      }
      Q(X, "Component", ({ model: e }) => {
        const t = (0, o.useStyles2)(Z),
          { title: n, description: r, intervalOptions: a, currentInterval: i } = e.useState();
        return l().createElement(
          "div",
          { className: t.container, "data-testid": "new-metrics" },
          l().createElement(N._, { title: n, description: r }),
          l().createElement(
            "div",
            { className: t.list },
            l().createElement(o.RadioButtonList, {
              name: "offsets",
              value: i,
              options: a,
              onChange: e.onChangeInterval,
            }),
          ),
        );
      });
      class J extends i.SceneObjectBase {
        onActivate() {}
        constructor({ key: e, title: t, description: n, icon: r, disabled: a }) {
          (super({
            key: e,
            title: t,
            description: n,
            icon: r,
            disabled: null != a && a,
            active: !1,
          }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function ee(e) {
        return {
          container: (0, r.css)({
            display: "flex",
            flexDirection: "column",
            gap: e.spacing(1),
            height: "100%",
            overflowY: "hidden",
          }),
        };
      }
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })(J, "Component", ({ model: e }) => {
        const t = (0, o.useStyles2)(ee),
          { title: n, description: r } = e.useState();
        return l().createElement(
          "div",
          { className: t.container },
          l().createElement(N._, { title: n, description: r }),
        );
      });
      var te = n(8819);
      const ne = new Map([
        [
          "rules",
          function () {
            return l().createElement(
              "svg",
              {
                stroke: "currentColor",
                width: "16",
                height: "16",
                viewBox: "0 0 16 16",
                fill: "none",
              },
              l().createElement("rect", {
                x: "1.25",
                y: "1.625",
                width: "5.25",
                height: "5.25",
                rx: "1",
                strokeWidth: "1.5",
              }),
              l().createElement("circle", {
                cx: "12.25",
                cy: "4.25",
                r: "2.75",
                strokeWidth: "1.5",
              }),
              l().createElement("circle", {
                cx: "3.75",
                cy: "11.75",
                r: "2.75",
                strokeWidth: "1.5",
              }),
              l().createElement("rect", {
                x: "9.5",
                y: "9.125",
                width: "5.25",
                height: "5.25",
                rx: "1",
                strokeWidth: "1.5",
              }),
            );
          },
        ],
        ["groups", te.Y],
      ]);
      function re({
        ariaLabel: e,
        disabled: t,
        visible: n,
        active: i,
        tooltip: s,
        iconOrText: c,
        onClick: u,
      }) {
        const d = (0, o.useStyles2)(ae);
        let p, m;
        return (
          c in a.availableIconsIndex
            ? (p = c)
            : (m = ne.has(c)
                ? ne.get(c)
                : function () {
                    return l().createElement(l().Fragment, null, c);
                  }),
          l().createElement(
            o.Button,
            {
              className: (0, r.cx)(d.button, t && "disabled", n && "visible", i && "active"),
              size: "md",
              variant: "secondary",
              fill: "text",
              icon: p,
              "aria-label": e,
              tooltip: s,
              tooltipPlacement: "right",
              onClick: u,
              disabled: t,
            },
            m && l().createElement(m, null),
          )
        );
      }
      function ae(e) {
        return {
          button: (0, r.css)({
            color: e.colors.text.secondary,
            "&:hover": { color: e.colors.text.maxContrast, background: "transparent" },
            "&.disabled": { opacity: 0.5 },
            "&.disabled:hover": { color: e.colors.text.secondary },
            "&.visible": { color: e.colors.text.maxContrast },
            "&.active": { color: e.colors.text.maxContrast },
          }),
        };
      }
      function ie(e, t, n) {
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
      const oe = {
          rule: "filters-rule",
          prefix: "filters-prefix",
          suffix: "filters-suffix",
          recent: "filters-recent",
        },
        se = (0, w.Ui)(oe);
      class le extends i.SceneObjectBase {
        onActivate() {
          var e;
          const t = this.initOtherMetricsVar();
          return (
            this.subscribeToEvent($.B, (e) => {
              const { key: t, values: n } = e.payload,
                { sectionValues: r } = this.state,
                a = new Map(r).set(t, n);
              (this.setOtherMetricFilters(a), this.setState({ sectionValues: a }));
            }),
            (null === (e = this.state.visibleSection) || void 0 === e ? void 0 : e.state.key) ||
              (0, g.gs)("drilldown.metrics.default_open_sidebar").then((e) => {
                var t;
                "treatment" !== e ||
                  (null === (t = this.state.visibleSection) || void 0 === t
                    ? void 0
                    : t.state.key) ||
                  this.setActiveSection(S.x.getItem(v.V.SIDEBAR_SECTION) || "filters-prefix");
              }),
            (0, g.gs)("drilldown.metrics.hierarchical_prefix_filtering").then((e) => {
              if ("treatment" === e) {
                const e = this.state.sections.find((e) => "filters-prefix" === e.state.key);
                e instanceof H.r && e.setState({ hierarchical: !0 });
              }
            }),
            () => {
              t();
            }
          );
        }
        setOtherMetricFilters(e) {
          const t = i.sceneGraph.lookupVariable(y.hc, this);
          if (!(0, O.BE)(t)) return;
          const n = {
              "filters-rule": "rule group",
              "filters-prefix": "prefix",
              "filters-suffix": "suffix",
              "filters-recent": "recent",
            },
            r = Array.from(e.entries()).reduce(
              (e, [t, r]) => (
                r.length &&
                  se.includes(t) &&
                  e.push({ key: t, operator: "=", value: r.join(", "), keyLabel: n[t] }),
                e
              ),
              [],
            );
          t.setState({
            filters: r,
            hide: r.length ? a.VariableHide.hideLabel : a.VariableHide.hideVariable,
          });
        }
        initOtherMetricsVar() {
          const e = (0, w.kj)(this).state.$variables;
          if (!e) return () => {};
          const t = new i.AdHocFiltersVariable({
            name: y.hc,
            readOnly: !0,
            skipUrlSync: !0,
            datasource: null,
            hide: a.VariableHide.hideVariable,
            layout: "combobox",
            applyMode: "manual",
            allowCustomValue: !0,
          });
          return (
            e.setState({ variables: [...e.state.variables, t] }),
            this.setOtherMetricFilters(this.state.sectionValues),
            () => {
              e.setState({ variables: [...e.state.variables.filter((e) => e !== t)] });
            }
          );
        }
        static getSectionValuesFromUrl() {
          const e = new URLSearchParams(window.location.search),
            t = new Map();
          for (const n of se) {
            const r = `${w.mc}-${n}`,
              a = e.get(r) || e.get(n);
            t.set(n, a ? a.split(",").map((e) => e.trim()) : []);
          }
          return t;
        }
        setActiveSection(e) {
          const { visibleSection: t, sections: n } = this.state;
          if (!e || e === (null == t ? void 0 : t.state.key))
            return (
              (0, M.z)("metrics_sidebar_toggled", {
                action: "closed",
                section: null == t ? void 0 : t.state.key,
              }),
              void this.setState({ visibleSection: null })
            );
          var r;
          (S.x.setItem(v.V.SIDEBAR_SECTION, e),
            (0, M.z)("metrics_sidebar_toggled", { action: "opened", section: e }),
            "filters-prefix" === e
              ? (0, M.z)("sidebar_prefix_filter_section_clicked", {})
              : "filters-suffix" === e
                ? (0, M.z)("sidebar_suffix_filter_section_clicked", {})
                : "filters-recent" === e && (0, M.z)("sidebar_recent_filter_section_clicked", {}),
            this.setState({
              visibleSection:
                null !== (r = n.find((t) => t.state.key === e)) && void 0 !== r ? r : null,
            }));
        }
        constructor(e) {
          var t, n, r, a;
          const i = le.getSectionValuesFromUrl();
          (super(
            (function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {},
                  r = Object.keys(n);
                ("function" == typeof Object.getOwnPropertySymbols &&
                  (r = r.concat(
                    Object.getOwnPropertySymbols(n).filter(function (e) {
                      return Object.getOwnPropertyDescriptor(n, e).enumerable;
                    }),
                  )),
                  r.forEach(function (t) {
                    ie(e, t, n[t]);
                  }));
              }
              return e;
            })(
              {
                key: "sidebar",
                visibleSection: null,
                sections: [
                  new H.r({
                    key: "filters-rule",
                    type: "categories",
                    title: "Rules filters",
                    description: "Filter metrics and recording rules",
                    icon: "rules",
                    computeGroups: b,
                    showHideEmpty: !1,
                    showSearch: !1,
                    active: Boolean(
                      null === (t = i.get("filters-rule")) || void 0 === t ? void 0 : t.length,
                    ),
                  }),
                  new H.r({
                    key: "filters-prefix",
                    type: "prefixes",
                    title: "Prefix filters",
                    description: "Filter metrics based on their name prefix (Prometheus namespace)",
                    icon: "A_",
                    computeGroups: d.w,
                    active: Boolean(
                      null === (n = i.get("filters-prefix")) || void 0 === n ? void 0 : n.length,
                    ),
                  }),
                  new H.r({
                    key: "filters-suffix",
                    type: "suffixes",
                    title: "Suffix filters",
                    description: "Filter metrics based on their name suffix",
                    icon: "_Z",
                    computeGroups: m,
                    active: Boolean(
                      null === (r = i.get("filters-suffix")) || void 0 === r ? void 0 : r.length,
                    ),
                  }),
                  new X({
                    key: "filters-recent",
                    title: "Recent metrics filters",
                    description: "Filter metrics based on when they started being ingested",
                    icon: "clock-nine",
                    active: Boolean(
                      null === (a = i.get("filters-recent")) || void 0 === a ? void 0 : a.length,
                    ),
                  }),
                  new q({
                    key: "groupby-labels",
                    variableName: u.G,
                    title: "Group by labels",
                    description: "Group metrics by their label values",
                    icon: "groups",
                  }),
                  new L({
                    key: "bookmarks",
                    title: "Bookmarks",
                    description: "Access your saved metrics for quick reference",
                    icon: "star",
                  }),
                  new J({
                    key: "settings",
                    title: "Settings",
                    description: "Settings",
                    icon: "cog",
                    disabled: !0,
                  }),
                ],
                sectionValues: i,
              },
              e,
            ),
          ),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function ce(e) {
        return {
          container: (0, r.css)({ position: "relative", height: "100%", overflow: "hidden" }),
          buttonsBar: (0, r.css)({
            width: "42px",
            border: `1px solid ${e.colors.border.weak}`,
            borderRadius: e.shape.radius.default,
            backgroundColor: e.colors.background.primary,
            position: "relative",
          }),
          buttonContainer: (0, r.css)({
            marginTop: e.spacing(1),
            "&::before": {
              transition: "0.5s ease",
              content: '""',
              position: "absolute",
              left: 0,
              height: "32px",
              borderLeft: `2px solid ${e.colors.action.selectedBorder}`,
              boxSizing: "border-box",
              opacity: 0,
              visibility: "hidden",
            },
            "&:hover::before": { opacity: 1, visibility: "visible" },
            "&.visible::before": { opacity: 1, visibility: "visible" },
            "&.disabled::before": { opacity: 0, visibility: "hidden" },
            "&.active::after": {
              content: '""',
              position: "absolute",
              right: 0,
              width: "8px",
              height: "8px",
              backgroundColor: e.colors.action.selectedBorder,
              borderRadius: "50%",
              margin: "2px 4px 0 0",
            },
          }),
          content: (0, r.css)({
            width: "calc(300px - 42px)",
            boxSizing: "border-box",
            border: `1px solid ${e.colors.border.weak}`,
            borderLeft: "none",
            borderRadius: e.shape.radius.default,
            backgroundColor: e.colors.background.canvas,
            padding: e.spacing(1.5),
          }),
          closeButton: (0, r.css)({
            position: "absolute",
            top: e.spacing(1.5),
            right: e.spacing(1),
          }),
        };
      }
      ie(le, "Component", ({ model: e }) => {
        const t = (0, o.useStyles2)(ce),
          { sections: n, visibleSection: a, sectionValues: s } = e.useState(),
          d = i.sceneGraph.findByKeyAndType(e, u.G, u.O).useState().value;
        return l().createElement(
          "div",
          { className: t.container },
          l().createElement(
            o.Stack,
            { direction: "row", height: "100%", gap: 0 },
            l().createElement(
              "div",
              { className: t.buttonsBar, "data-testid": "sidebar-buttons" },
              l().createElement(
                o.Stack,
                { direction: "column", alignItems: "center", gap: 0 },
                n.map((n) => {
                  const { key: i, title: o, icon: u, disabled: p, active: m } = n.state,
                    h = (null == a ? void 0 : a.state.key) === i;
                  let f, b;
                  var g, y;
                  "groupby-labels" === i
                    ? ((f = Boolean(d && d !== c.c)), (b = `${o}: ${d}`))
                    : ((f = m),
                      (b = (null === (g = s.get(i)) || void 0 === g ? void 0 : g.length)
                        ? `${o}: ${null === (y = s.get(i)) || void 0 === y ? void 0 : y.join(", ")}`
                        : o));
                  return l().createElement(
                    "div",
                    {
                      key: i,
                      className: (0, r.cx)(
                        t.buttonContainer,
                        h && "visible",
                        f && "active",
                        p && "disabled",
                      ),
                    },
                    l().createElement(re, {
                      key: i,
                      ariaLabel: o,
                      disabled: p,
                      visible: h,
                      active: f,
                      tooltip: b,
                      onClick: () => e.setActiveSection(i),
                      iconOrText: u,
                    }),
                  );
                }),
              ),
            ),
            a &&
              l().createElement(
                "div",
                { className: t.content, "data-testid": "sidebar-content" },
                l().createElement(o.IconButton, {
                  className: t.closeButton,
                  name: "times",
                  "aria-label": "Close",
                  tooltip: "Close",
                  tooltipPlacement: "top",
                  onClick: () => e.setActiveSection(""),
                }),
                a instanceof H.r && l().createElement(a.Component, { model: a }),
                a instanceof X && l().createElement(a.Component, { model: a }),
                a instanceof q && l().createElement(a.Component, { model: a }),
                a instanceof L && l().createElement(a.Component, { model: a }),
                a instanceof J && l().createElement(a.Component, { model: a }),
              ),
          ),
        );
      });
    },
    4758: (e, t, n) => {
      n.d(t, { m: () => U });
      var r = n(6089),
        a = n(7781),
        i = n(3014),
        o = n(2007),
        s = n(3241),
        l = n(5959),
        c = n.n(l),
        u = n(7616),
        d = n(7791),
        p = n(381),
        m = n(1031),
        h = n(9226),
        f = n(917),
        b = n(4299),
        g = n(5114);
      function y(e) {
        switch ((0, g.K)(e)) {
          case "classic-histogram":
            return "heatmap";
          case "status-updown":
            return "statushistory";
          default:
            return "timeseries";
        }
      }
      var v = n(5938),
        S = n(1419),
        w = n(8162),
        O = n(7042);
      function E(e) {
        const { metric: t, queryConfig: n } = e,
          r = (0, O.d)({
            metric: t,
            labelMatchers: n.labelMatchers,
            addIgnoreUsageFilter: n.addIgnoreUsageFilter,
            addExtremeValuesFiltering: n.addExtremeValuesFiltering,
          }),
          a =
            "native-histogram" === t.type
              ? w.GH.sum({ expr: w.GH.rate({ expr: r }) })
              : w.GH.sum({ expr: w.GH.rate({ expr: r }), by: ["le"] });
        return {
          maxDataPoints: n.resolution === b.I.HIGH ? 500 : 250,
          queries: [
            { refId: `${t.name}-heatmap`, expr: a, format: "heatmap", fromExploreMetrics: !0 },
          ],
        };
      }
      var x = n(5276);
      var k = n(1625),
        C = n(7014);
      const P = [99, 90, 50];
      function j(e) {
        const { metric: t, queryConfig: n } = e,
          r = (0, O.d)({
            metric: t,
            labelMatchers: n.labelMatchers,
            addIgnoreUsageFilter: n.addIgnoreUsageFilter,
            addExtremeValuesFiltering: n.addExtremeValuesFiltering,
          }),
          a = ["classic-histogram", "native-histogram"].includes(t.type),
          i = a
            ? (function ({ metric: e, queryConfig: t, expr: n }) {
                var r;
                const a = (null === (r = t.queries) || void 0 === r ? void 0 : r.length)
                    ? t.queries
                    : [{ fn: "histogram_quantile", params: { percentiles: P } }],
                  i = [],
                  o =
                    "native-histogram" === e.type
                      ? w.GH.sum({ expr: w.GH.rate({ expr: n }) })
                      : w.GH.sum({ expr: w.GH.rate({ expr: n }), by: ["le"] });
                for (const { fn: t, params: n } of a) {
                  const r = C.q.get(t),
                    a = r.name,
                    s = (null == n ? void 0 : n.percentiles) || P;
                  for (const t of s) {
                    const n = t / 100,
                      s = r.fn({ expr: o, parameter: n });
                    i.push({
                      refId: `${e.name}-p${t}-${a}`,
                      expr: s,
                      legendFormat: `${t}th Percentile`,
                      fromExploreMetrics: !0,
                    });
                  }
                }
                return i;
              })({ metric: t, queryConfig: n, expr: r })
            : (function ({ metric: e, queryConfig: t, expr: n }) {
                var r;
                const a = "counter" === e.type,
                  i = (null === (r = t.queries) || void 0 === r ? void 0 : r.length)
                    ? t.queries
                    : [{ fn: "quantile", params: { percentiles: [99, 90, 50] } }],
                  o = [],
                  s = a ? w.GH.rate({ expr: n }) : n;
                for (const { fn: t, params: n } of i) {
                  const r = C.q.get(t),
                    i = a ? `${r.name}(rate)` : r.name;
                  for (const t of n.percentiles) {
                    const n = t / 100,
                      a = r.fn({ expr: s, parameter: n });
                    o.push({
                      refId: `${e.name}-p${t}-${i}`,
                      expr: a,
                      legendFormat: `${t}th Percentile`,
                      fromExploreMetrics: !0,
                    });
                  }
                }
                return o;
              })({ metric: t, queryConfig: n, expr: r });
        return {
          isRateQuery: !!a || "counter" === t.type,
          maxDataPoints: n.resolution === b.I.HIGH ? 500 : 250,
          queries: i,
        };
      }
      var _ = n(4810);
      function T(e) {
        const { metric: t, queryConfig: n } = e,
          r = "counter" === t.type,
          a = (0, O.d)({
            metric: t,
            labelMatchers: n.labelMatchers,
            addIgnoreUsageFilter: n.addIgnoreUsageFilter,
            addExtremeValuesFiltering: n.addExtremeValuesFiltering,
          }),
          i = r ? w.GH.rate({ expr: a, interval: "$__rate_interval" }) : a;
        return {
          isRateQuery: r,
          maxDataPoints: n.resolution === b.I.HIGH ? 500 : 250,
          queries: I({ metric: t, queryConfig: n, isRateQuery: r, expr: i }),
        };
      }
      function I({ metric: e, queryConfig: t, isRateQuery: n, expr: r }) {
        var a;
        const i = n ? "sum" : "avg",
          o = (null === (a = t.queries) || void 0 === a ? void 0 : a.length)
            ? t.queries
            : [{ fn: i }],
          s = [];
        for (const { fn: t } of o) {
          const a = C.q.get(t),
            i = a.fn({ expr: r }),
            o = n ? `${a.name}(rate)` : a.name;
          s.push({ refId: `${e.name}-${o}`, expr: i, legendFormat: o, fromExploreMetrics: !0 });
        }
        return s;
      }
      const A = [
        {
          type: n(6145).dM.ValueToText,
          options: { 0: { color: "red", text: "down" }, 1: { color: "green", text: "up" } },
        },
      ];
      function D(e) {
        const { metric: t, queryConfig: n } = e,
          r = (0, O.d)({
            metric: t,
            labelMatchers: n.labelMatchers,
            addIgnoreUsageFilter: n.addIgnoreUsageFilter,
            addExtremeValuesFiltering: n.addExtremeValuesFiltering,
          }),
          a = w.GH.min({ expr: r });
        return {
          maxDataPoints: n.resolution === b.I.HIGH ? 200 : 100,
          queries: [
            { refId: `${t.name}-status`, expr: a, legendFormat: "status", fromExploreMetrics: !0 },
          ],
        };
      }
      var B = n(4160),
        M = n(7561);
      const N = new Map([
        ["timeseries", { buildVizPanel: B.B, getQueryRunnerParams: M.H }],
        [
          "heatmap",
          {
            buildVizPanel: function (e) {
              var t;
              const { metric: n, panelConfig: r, queryConfig: a } = e,
                o = E({ metric: n, queryConfig: a }),
                s = (0, x.l_)(n.name),
                l =
                  a.data ||
                  new i.SceneQueryRunner({
                    datasource: S.GH,
                    maxDataPoints: o.maxDataPoints,
                    queries: o.queries,
                  });
              return i.PanelBuilders.heatmap()
                .setTitle(r.title)
                .setDescription(r.description)
                .setHeaderActions(r.headerActions({ metric: n, panelConfig: r }))
                .setMenu(
                  null === (t = r.menu) || void 0 === t
                    ? void 0
                    : t.call(r, { metric: n, panelConfig: r }),
                )
                .setShowMenuAlways(Boolean(r.menu))
                .setData(l)
                .setUnit(s)
                .setOption("calculate", !1)
                .setOption("color", {
                  mode: v.P7.Scheme,
                  exponent: 0.5,
                  scheme: "Spectral",
                  steps: 32,
                  reverse: !1,
                })
                .setOption("legend", r.legend)
                .build();
            },
            getQueryRunnerParams: E,
          },
        ],
        [
          "percentiles",
          {
            buildVizPanel: function (e) {
              var t;
              const { metric: n, panelConfig: r, queryConfig: a } = e,
                o = j({ metric: n, queryConfig: a }),
                s = o.isRateQuery ? (0, x.MM)(n.name) : (0, x.l_)(n.name),
                l =
                  a.data ||
                  new i.SceneQueryRunner({
                    datasource: S.GH,
                    maxDataPoints: o.maxDataPoints,
                    queries: o.queries,
                  }),
                c = r.fixedColorIndex || 0;
              return i.PanelBuilders.timeseries()
                .setTitle(r.title)
                .setDescription(r.description)
                .setHeaderActions(r.headerActions({ metric: n, panelConfig: r }))
                .setMenu(
                  null === (t = r.menu) || void 0 === t
                    ? void 0
                    : t.call(r, { metric: n, panelConfig: r }),
                )
                .setShowMenuAlways(Boolean(r.menu))
                .setData(l)
                .setUnit(s)
                .setOption("legend", r.legend || { showLegend: !0, placement: "bottom" })
                .setOption("tooltip", { mode: k.$N.Multi, sort: k.xB.Descending })
                .setCustomFieldConfig("fillOpacity", 9)
                .setOverrides((e) => {
                  o.queries.forEach((t, n) => {
                    e.matchFieldsByQuery(t.refId).overrideColor({
                      mode: "fixed",
                      fixedColor: (0, u.Vy)(c + n),
                    });
                  });
                })
                .setBehaviors([(0, _.o)(c), ...(r.behaviors || [])])
                .build();
            },
            getQueryRunnerParams: j,
          },
        ],
        [
          "statushistory",
          {
            buildVizPanel: function (e) {
              var t;
              const { metric: n, panelConfig: r, queryConfig: a } = e,
                o = D({ metric: n, queryConfig: a }),
                s =
                  a.data ||
                  new i.SceneQueryRunner({
                    datasource: S.GH,
                    maxDataPoints: o.maxDataPoints,
                    queries: o.queries,
                  });
              return i.PanelBuilders.statushistory()
                .setTitle(r.title)
                .setDescription(r.description)
                .setHeaderActions(r.headerActions({ metric: n, panelConfig: r }))
                .setMenu(
                  null === (t = r.menu) || void 0 === t
                    ? void 0
                    : t.call(r, { metric: n, panelConfig: r }),
                )
                .setShowMenuAlways(Boolean(r.menu))
                .setData(s)
                .setUnit("none")
                .setColor({ mode: "palette-classic" })
                .setOption("showValue", k.yL.Never)
                .setOption("legend", r.legend || { showLegend: !0, placement: "bottom" })
                .setOption("perPage", 0)
                .setMappings(A)
                .build();
            },
            getQueryRunnerParams: D,
          },
        ],
        [
          "stat",
          {
            buildVizPanel: function (e) {
              var t;
              const { metric: n, panelConfig: r, queryConfig: a } = e,
                o = T({ metric: n, queryConfig: a }),
                s =
                  a.data ||
                  new i.SceneQueryRunner({
                    datasource: S.GH,
                    maxDataPoints: o.maxDataPoints,
                    queries: o.queries,
                  });
              return i.PanelBuilders.stat()
                .setTitle(r.title)
                .setDescription(r.description)
                .setHeaderActions(r.headerActions({ metric: n, panelConfig: r }))
                .setMenu(
                  null === (t = r.menu) || void 0 === t
                    ? void 0
                    : t.call(r, { metric: n, panelConfig: r }),
                )
                .setShowMenuAlways(Boolean(r.menu))
                .setData(s)
                .setUnit("none")
                .setColor({ mode: "fixed", fixedColor: (0, u.Vy)(r.fixedColorIndex || 0) })
                .setMappings(A)
                .build();
            },
            getQueryRunnerParams: T,
          },
        ],
      ]);
      function L(e) {
        const t = N.get(e);
        if (!t) throw new TypeError(`Unsupported panel type "${e}"!`);
        return t;
      }
      const R = {
        buildVizPanel: (e) => L(e.panelConfig.type).buildVizPanel(e),
        getQueryRunnerParams(e) {
          const { metric: t, queryConfig: n, panelType: r } = e;
          return L(r).getQueryRunnerParams({ metric: t, queryConfig: n });
        },
      };
      function $(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function V(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              $(i, r, a, o, s, "next", e);
            }
            function s(e) {
              $(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
      }
      function F(e, t, n) {
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
      function G(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              F(e, t, n[t]);
            }));
        }
        return e;
      }
      function q(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class U extends i.SceneObjectBase {
        onActivate(e) {
          return V(function* () {
            (this.buildVizPanel(),
              this.subscribeToStateChanges(e),
              this.subscribeToEvents(),
              this.checkMetricMetadata(e));
          }).call(this);
        }
        checkMetricMetadata(e) {
          return V(function* () {
            const { metric: t, metricType: n, panelConfig: r } = this.state,
              a = yield (0, g.B)(t, (0, u.kj)(this));
            if (n === a) return;
            const i = {},
              o = {};
            var s;
            "native-histogram" === a &&
              ((i.metricType = "native-histogram"),
              (o.description =
                null !== (s = r.description) && void 0 !== s ? s : "Native Histogram"),
              e || (o.type = "heatmap"));
            ("gauge" === a && "counter" === n && (i.metricType = "gauge"),
              "counter" === a && "gauge" === n && (i.metricType = "counter"),
              (Object.keys(i).length || Object.keys(o).length) &&
                this.setState(q(G({}, i), { panelConfig: G({}, r, o) })));
          }).call(this);
        }
        subscribeToStateChanges(e) {
          const { metricType: t, body: n, panelConfig: r } = this.state;
          if (!e && !["classic-histogram", "native-histogram"].includes(t)) {
            var i;
            const e =
              null == n || null === (i = n.state.$data) || void 0 === i
                ? void 0
                : i.subscribeToState((t) => {
                    var n, i, o, s;
                    if (
                      (null === (n = t.data) || void 0 === n ? void 0 : n.state) !==
                      a.LoadingState.Done
                    )
                      return;
                    const l =
                      null === (s = t.data.series) ||
                      void 0 === s ||
                      null === (o = s[0]) ||
                      void 0 === o ||
                      null === (i = o.meta) ||
                      void 0 === i
                        ? void 0
                        : i.type;
                    l &&
                      (l === a.DataFrameType.HeatmapCells &&
                        this.setState({
                          panelConfig: q(G({ description: "Native Histogram " }, r), {
                            type: "heatmap",
                          }),
                        }),
                      e.unsubscribe());
                  });
            this._subs.add(e);
          }
          this.subscribeToState((e, t) => {
            if (e.panelConfig.type === t.panelConfig.type) {
              if (!(0, s.isEqual)(e.panelConfig, t.panelConfig)) {
                const n = (0, s.omitBy)(e.panelConfig, (e, n) => e === t.panelConfig[n]);
                this.updatePanelOptions(n);
              }
              (e.metricType === t.metricType && (0, s.isEqual)(e.queryConfig, t.queryConfig)) ||
                (this.updatePanelQueries(),
                this.updatePanelOptions({
                  headerActions: e.panelConfig.headerActions,
                  menu: e.panelConfig.menu,
                }));
            } else this.buildVizPanel();
          });
        }
        subscribeToEvents() {
          this.subscribeToEvent(p.H, (e) => {
            this.setState({
              panelConfig: q(G({}, this.state.panelConfig), { type: e.payload.panelType }),
            });
          });
        }
        buildVizPanel() {
          const { metric: e, metricType: t, panelConfig: n, queryConfig: r } = this.state;
          this.setState({
            body: R.buildVizPanel({ metric: { name: e, type: t }, panelConfig: n, queryConfig: r }),
          });
        }
        updatePanelOptions(e) {
          const { metric: t, metricType: n, body: r, panelConfig: a } = this.state;
          if (!r) return;
          const i = { name: t, type: n };
          (e.description && r.setState({ description: e.description }),
            e.headerActions &&
              r.setState({ headerActions: e.headerActions({ metric: i, panelConfig: a }) }),
            e.menu && r.setState({ menu: e.menu({ metric: i, panelConfig: a }) }));
        }
        updatePanelQueries() {
          const { body: e, metric: t, metricType: n, panelConfig: r, queryConfig: a } = this.state;
          if (!e) return;
          const [o] = i.sceneGraph.findDescendents(e, i.SceneQueryRunner);
          if (!o) return;
          const s = R.getQueryRunnerParams({
            panelType: r.type,
            metric: { name: t, type: n },
            queryConfig: a,
          });
          (o.setState({ queries: s.queries }), o.runQueries());
        }
        update(e, t) {
          const { panelConfig: n, queryConfig: r } = this.state;
          this.setState({ panelConfig: G({}, n, e), queryConfig: G({}, r, t) });
        }
        constructor({ key: e, metric: t, panelOptions: n, queryOptions: r, discardUserPrefs: a }) {
          const i = (0, g.K)(t),
            o = a ? void 0 : (0, h.N)(t);
          (super({
            key: e,
            metric: t,
            metricType: i,
            panelConfig: G(
              {
                type: (null == n ? void 0 : n.type) || y(t),
                title: t,
                height: f.N.M,
                headerActions: ({ metric: e }) => [new m.B({ metric: e.name })],
              },
              n,
              null == o ? void 0 : o.panelOptions,
            ),
            queryConfig: G(
              { resolution: b.I.MEDIUM, labelMatchers: [], addIgnoreUsageFilter: !0 },
              r,
              null == o ? void 0 : o.queryOptions,
            ),
            body: void 0,
          }),
            this.addActivationHandler(() => {
              this.onActivate(
                Boolean(
                  (null == n ? void 0 : n.type) || (null == o ? void 0 : o.panelOptions.type),
                ),
              );
            }));
        }
      }
      function H(e, t, n) {
        return {
          container: r.css`
      width: 100%;
      height: ${t}px;
      ${n ? (0, d.v)(e) : ""}
    `,
        };
      }
      F(U, "Component", ({ model: e }) => {
        const { body: t, panelConfig: n, onClick: r, clickTitle: a } = e.useState(),
          i = (0, o.useStyles2)(H, n.height, Boolean(r)),
          s = r
            ? (e) => {
                ("Enter" !== e.key && " " !== e.key) || (e.preventDefault(), r());
              }
            : void 0;
        return c().createElement(
          "div",
          {
            className: i.container,
            "data-testid": "gmd-vizpanel",
            onClick: r,
            onKeyDown: s,
            role: r ? "button" : void 0,
            tabIndex: r ? 0 : void 0,
            title: a,
          },
          t && c().createElement(t.Component, { model: t }),
        );
      });
    },
    4810: (e, t, n) => {
      n.d(t, { o: () => o });
      var r = n(3014),
        a = n(7616);
      function i(e, t, n) {
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
      const o =
        (e = 0) =>
        (t) => {
          const [n] = r.sceneGraph.findDescendents(t, r.SceneQueryRunner);
          if (!n) return;
          const o = n.subscribeToState((n, r) => {
            if (n.queries !== r.queries) {
              const r = (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {},
                    r = Object.keys(n);
                  ("function" == typeof Object.getOwnPropertySymbols &&
                    (r = r.concat(
                      Object.getOwnPropertySymbols(n).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(n, e).enumerable;
                      }),
                    )),
                    r.forEach(function (t) {
                      i(e, t, n[t]);
                    }));
                }
                return e;
              })({}, t.state.fieldConfig);
              ((r.defaults.color = void 0),
                (r.overrides = n.queries.map((t, n) => ({
                  matcher: { id: "byFrameRefID", options: t.refId },
                  properties: [
                    { id: "color", value: { mode: "fixed", fixedColor: (0, a.Vy)(e + n) } },
                  ],
                }))),
                t.setState({ fieldConfig: r }));
            }
          });
          return () => {
            o.unsubscribe();
          };
        };
    },
    4924: (e, t, n) => {
      n.d(t, { D: () => r });
      const r = (e) => e.endsWith("_bucket");
    },
    5060: (e, t, n) => {
      n.d(t, { B: () => a });
      var r = n(3241);
      const a = (e, t) => e.length === t.length && (0, r.isEqual)(e, t);
    },
    5114: (e, t, n) => {
      n.d(t, { B: () => d, K: () => p });
      const r = (e) => e.endsWith("_timestamp_seconds");
      var a = n(4924);
      const i = /_(count|total|sum)$/,
        o = (e) => i.test(e),
        s = (e) => e.endsWith("_info"),
        l = /_up$/,
        c = (e) => "up" === e || l.test(e);
      function u(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function d(e, t) {
        return ((n = function* () {
          const n = p(e);
          if ("gauge" === n) {
            const n = yield t.getMetadataForMetric(e);
            if ("histogram" === (null == n ? void 0 : n.type)) return "native-histogram";
            if ("counter" === (null == n ? void 0 : n.type)) return "counter";
          }
          if ("counter" === n) {
            const n = yield t.getMetadataForMetric(e);
            if ("gauge" === (null == n ? void 0 : n.type)) return "gauge";
          }
          return n;
        }),
        function () {
          var e = this,
            t = arguments;
          return new Promise(function (r, a) {
            var i = n.apply(e, t);
            function o(e) {
              u(i, r, a, o, s, "next", e);
            }
            function s(e) {
              u(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        })();
        var n;
      }
      function p(e) {
        return o(e)
          ? "counter"
          : (0, a.D)(e)
            ? "classic-histogram"
            : r(e)
              ? "age"
              : c(e)
                ? "status-updown"
                : s(e)
                  ? "info"
                  : "gauge";
      }
    },
    5190: (e, t, n) => {
      n.d(t, { a: () => p, k: () => l });
      var r = n(3014),
        a = n(5959),
        i = n.n(a),
        o = n(5060),
        s = n(8705);
      class l extends r.SceneObjectBase {
        performRepeat(e) {
          var t, n, r, a;
          if (e.state.error)
            return void this.setState({
              errorLayout:
                null === (t = (n = this.state).getLayoutError) || void 0 === t
                  ? void 0
                  : t.call(n, e.state.error),
              loadingLayout: void 0,
              emptyLayout: void 0,
              currentBatchSize: 0,
            });
          if (e.state.loading)
            return void this.setState({
              loadingLayout:
                null === (r = (a = this.state).getLayoutLoading) || void 0 === r
                  ? void 0
                  : r.call(a),
              errorLayout: void 0,
              emptyLayout: void 0,
              currentBatchSize: 0,
            });
          const i = p(e);
          var o, s;
          if (!i.length)
            return void this.setState({
              emptyLayout:
                null === (o = (s = this.state).getLayoutEmpty) || void 0 === o ? void 0 : o.call(s),
              errorLayout: void 0,
              loadingLayout: void 0,
              currentBatchSize: 0,
            });
          this.setState({
            loadingLayout: void 0,
            errorLayout: void 0,
            emptyLayout: void 0,
            currentBatchSize: this.state.initialPageSize,
          });
          const l = i
            .slice(0, this.state.initialPageSize)
            .map((e, t) => this.state.getLayoutChild(e, t, i))
            .filter(Boolean);
          this.state.body.setState({ children: l });
        }
        increaseBatchSize() {
          const e = p(r.sceneGraph.lookupVariable(this.state.variableName, this)),
            t = this.state.currentBatchSize + this.state.pageSizeIncrement,
            n = e
              .slice(this.state.currentBatchSize, t)
              .map((t, n) => this.state.getLayoutChild(t, this.state.currentBatchSize + n, e))
              .filter(Boolean);
          (this.state.body.setState({ children: [...this.state.body.state.children, ...n] }),
            this.setState({ currentBatchSize: t }));
        }
        useSizes() {
          const { currentBatchSize: e, pageSizeIncrement: t } = this.useState(),
            n = r.sceneGraph.lookupVariable(this.state.variableName, this).state.options.length,
            a = n - e;
          return { increment: a < t ? a : t, current: e, total: n };
        }
        constructor({
          variableName: e,
          body: t,
          getLayoutChild: n,
          getLayoutLoading: a,
          getLayoutError: i,
          getLayoutEmpty: l,
          initialPageSize: c,
          pageSizeIncrement: u,
        }) {
          (super({
            variableName: e,
            body: t,
            getLayoutChild: n,
            getLayoutLoading: a,
            getLayoutError: i,
            getLayoutEmpty: l,
            currentBatchSize: 0,
            initialPageSize: c || 6,
            pageSizeIncrement: u || 9,
            loadingLayout: void 0,
            errorLayout: void 0,
            emptyLayout: void 0,
          }),
            this.addActivationHandler(() => {
              const e = r.sceneGraph.lookupVariable(this.state.variableName, this);
              if (!(e instanceof r.MultiValueVariable)) {
                const e = new Error(
                  "SceneByVariableRepeater: variable is not a MultiValueVariable!",
                );
                return void s.v.error(e);
              }
              (this.performRepeat(e),
                this._subs.add(
                  e.subscribeToState((t, n) => {
                    (t.loading === n.loading && (0, o.B)(t.options, n.options)) ||
                      this.performRepeat(e);
                  }),
                ));
            }));
        }
      }
      var c, u, d;
      function p(e) {
        const { value: t, text: n, options: r } = e.state;
        return e.hasAllValue()
          ? r
          : Array.isArray(t) && Array.isArray(n)
            ? t.map((e, t) => ({ value: e, label: n[t] }))
            : [{ value: t, label: n }];
      }
      ((d = ({ model: e }) => {
        const { body: t, loadingLayout: n, errorLayout: r, emptyLayout: a } = e.useState();
        return r
          ? i().createElement(r.Component, { model: r })
          : n
            ? i().createElement(n.Component, { model: n })
            : a
              ? i().createElement(a.Component, { model: a })
              : i().createElement(t.Component, { model: t });
      }),
        (u = "Component") in (c = l)
          ? Object.defineProperty(c, u, {
              value: d,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (c[u] = d));
    },
    5272: (e, t, n) => {
      n.d(t, { S: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "sort-by-changed"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    5276: (e, t, n) => {
      n.d(t, { MM: () => h, l_: () => m });
      const r = "none",
        a = "cps",
        i = "bytes",
        o = "seconds",
        s = "percent",
        l = "count",
        c = { [i]: i, [o]: "s", [s]: s, [l]: r },
        u = Object.keys(c),
        d = { [i]: "Bps", [o]: r, [l]: a, [s]: s };
      function p(e) {
        const t = e.toLowerCase().split("_").slice(-2);
        for (let e = t.length - 1; e >= Math.max(0, t.length - 2); e--) {
          const n = t[e];
          if (u.includes(n)) return n;
        }
        return null;
      }
      function m(e) {
        const t = p(e);
        return (t && c[t.toLowerCase()]) || r;
      }
      function h(e) {
        const t = p(e);
        return (t && d[t]) || a;
      }
    },
    5333: (e, t, n) => {
      n.d(t, { NJ: () => S, Rm: () => x, VN: () => g, bG: () => E, fD: () => w, yH: () => O });
      var r = n(3014),
        a = n(5959),
        i = n.n(a),
        o = n(6024),
        s = n(8705),
        l = n(1233),
        c = n(5693),
        u = n(5272),
        d = n(6367);
      function p(e, t, n) {
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
      function m(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              p(e, t, n[t]);
            }));
        }
        return e;
      }
      function h(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      const f = 6,
        b = 30;
      function g(e) {
        try {
          const t = y(),
            n = Date.now(),
            r = t.filter((t) => t.name !== e);
          r.unshift({ name: e, timestamp: n });
          const a = r.slice(0, f);
          c.x.setItem(l.V.RECENT_METRICS, a);
        } catch (t) {
          const n = t instanceof Error ? t : new Error(String(t));
          s.v.error(n, h(m({}, n.cause || {}), { metricName: e }));
        }
      }
      function y() {
        try {
          const e = c.x.getItem(l.V.RECENT_METRICS) || [];
          if (!e.length) return [];
          const t = Date.now() - 24 * b * 60 * 60 * 1e3,
            n = e.filter((e) => e.timestamp > t);
          return (n.length !== e.length && c.x.setItem(l.V.RECENT_METRICS, n), n);
        } catch (e) {
          return (s.v.error(e, { message: "Failed to get recent metrics:" }), []);
        }
      }
      const v = [
          { label: "Default", value: "default" },
          { label: "Alphabetical [A-Z]", value: "alphabetical" },
          { label: "Alphabetical [Z-A]", value: "alphabetical-reversed" },
          { label: "Dashboard Usage", value: "dashboard-usage" },
          { label: "Alerting Usage", value: "alerting-usage" },
        ],
        S = "metrics-reducer-sort-by";
      class w extends r.SceneObjectBase {
        activationHandler() {
          const e = r.sceneGraph.getVariables(this).getByName(S);
          (this.supportedSortByOptions.has(e.getValue()) || e.changeValueTo("default"),
            this._subs.add(
              e.subscribeToState((e, t) => {
                e.value !== t.value && this.publishEvent(new u.S({ sortBy: e.value }), !0);
              }),
            ));
        }
        getUsageDetailsForMetric(e, t) {
          return this.usageFetcher.getUsageDetailsForMetric(e, t);
        }
        getUsageMetrics(e) {
          return this.usageFetcher.getUsageMetrics(e).then((e) => {
            const t = {};
            for (const n in e) t[n] = e[n].count;
            return t;
          });
        }
        constructor(e) {
          (super(
            h(m({}, e), {
              key: "metrics-sorter",
              $variables: new r.SceneVariableSet({
                variables: [
                  new r.CustomVariable({
                    name: S,
                    label: "Sort by",
                    value: "default",
                    query: v.map((e) => `${e.label} : ${e.value}`).join(","),
                    description:
                      "Default metric sorting is alphabetical with recently-selected metrics first. Metrics can also be sorted purely alphabetically, by prevalence in dashboard panel queries, or by prevalence in alerting rules",
                  }),
                ],
              }),
              inputControls: new r.VariableValueSelectors({ layout: "horizontal" }),
            }),
          ),
            p(this, "initialized", !1),
            p(
              this,
              "supportedSortByOptions",
              new Set([
                "alerting-usage",
                "alphabetical",
                "alphabetical-reversed",
                "dashboard-usage",
                "default",
              ]),
            ),
            p(this, "usageFetcher", new d.d()),
            this.addActivationHandler(() => this.activationHandler()));
        }
      }
      function O(e, t) {
        return [...e].sort((e, n) => {
          const r = t[e] || 0,
            a = t[n] || 0;
          return a !== r ? a - r : (0, o._)(e, n);
        });
      }
      function E(e, t = "asc") {
        const n = "asc" === t ? (e, t) => (0, o._)(e, t) : (e, t) => (0, o._)(t, e);
        return [...e].sort((e, t) => n(e, t));
      }
      function x(e) {
        const t = y().map((e) => e.name),
          n = new Set(t),
          [r, a] = e.reduce(([e, t], r) => (n.has(r) ? e.push(r) : t.push(r), [e, t]), [[], []]),
          i = E(a);
        return [...t.filter((e) => r.includes(e)), ...i];
      }
      p(w, "Component", ({ model: e }) => {
        const { inputControls: t } = e.useState();
        return i().createElement(
          "div",
          { "data-testid": "sort-by-select" },
          i().createElement(t.Component, { model: t }),
        );
      });
    },
    5405: (e, t, n) => {
      n.d(t, { r: () => j });
      var r = n(6089),
        a = n(3014),
        i = n(2007),
        o = n(5959),
        s = n.n(o),
        l = n(1251),
        c = n(3916),
        u = n(5665),
        d = n(7145),
        p = n(578),
        m = n(477),
        h = n(8705),
        f = n(5935),
        b = n(656),
        g = n(9985);
      function y(e) {
        return {
          listHeader: (0, r.css)({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: e.colors.text.secondary,
            padding: e.spacing(0, 0, 0, 1),
          }),
          list: (0, r.css)({
            height: "100%",
            padding: e.spacing(0, 1, 1, 1),
            overflowY: "auto",
            listStyle: "none",
            margin: 0,
            "&::-webkit-scrollbar": { WebkitAppearance: "none", width: "7px" },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "4px",
              backgroundColor: e.colors.secondary.main,
              WebkitBoxShadow: `0 0 1px ${e.colors.secondary.shade}`,
            },
          }),
          listItem: (0, r.css)({
            display: "flex",
            alignItems: "center",
            padding: e.spacing(0.5, 0),
          }),
          noResults: (0, r.css)({ fontStyle: "italic", padding: e.spacing(0, 1, 1, 1) }),
        };
      }
      const v = ({ label: e, count: t, checked: n, onChange: r }) => {
        const a = (0, i.useStyles2)(S);
        return s().createElement(
          "div",
          { className: a.checkboxWrapper, title: e },
          s().createElement(i.Checkbox, { label: e, checked: n, onChange: r }),
          s().createElement("span", { className: a.count }, "(", t, ")"),
        );
      };
      function S(e) {
        return {
          checkboxWrapper: (0, r.css)({
            display: "flex",
            alignItems: "center",
            width: "100%",
            "& label *": {
              fontSize: "14px !important",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }),
          count: (0, r.css)({
            color: e.colors.text.secondary,
            marginLeft: e.spacing(0.5),
            display: "inline-block",
          }),
        };
      }
      function w({ groups: e, selectedGroups: t, onSelectionChange: n }) {
        const r = (0, i.useStyles2)(y);
        return s().createElement(
          s().Fragment,
          null,
          s().createElement(
            "div",
            { className: r.listHeader },
            s().createElement("div", null, t.length, " selected"),
            s().createElement(
              i.Button,
              { variant: "secondary", fill: "text", onClick: () => n([]), disabled: !t.length },
              "clear",
            ),
          ),
          !e.length && s().createElement("div", { className: r.noResults }, "No results."),
          e.length > 0 &&
            s().createElement(
              "ul",
              { className: r.list, "data-testid": "checkbox-filters-list" },
              e.map((e) =>
                s().createElement(
                  "li",
                  { key: e.value, className: r.listItem },
                  s().createElement(v, {
                    label: e.label,
                    count: e.count,
                    checked: t.some((t) => t.value === e.value),
                    onChange: (r) => {
                      const a = r.currentTarget.checked
                        ? [...t, { label: e.label, value: e.value }]
                        : t.filter((t) => t.value !== e.value);
                      n(a);
                    },
                  }),
                ),
              ),
            ),
        );
      }
      var O = n(3424);
      function E({
        groups: e,
        selectedGroups: t,
        expandedPrefixes: n,
        computedSublevels: a,
        onSelectionChange: o,
        onExpandToggle: c,
      }) {
        const u = (0, i.useStyles2)(y),
          d = (0, i.useStyles2)(x);
        return s().createElement(
          s().Fragment,
          null,
          s().createElement(
            "div",
            { className: u.listHeader },
            s().createElement("div", null, t.length, " selected"),
            s().createElement(
              i.Button,
              { variant: "secondary", fill: "text", onClick: () => o([]), disabled: !t.length },
              "clear",
            ),
          ),
          !e.length && s().createElement("div", { className: u.noResults }, "No results."),
          e.length > 0 &&
            s().createElement(
              "ul",
              { className: u.list, "data-testid": "checkbox-filters-tree" },
              e.map((p) => {
                const m = n.has(p.value),
                  h = ((b = p.value), a.get(b) || []);
                var b;
                const g = ((e) => t.some((t) => t.value === e || t.value.startsWith(e + l._)))(
                  p.value,
                );
                return s().createElement(
                  s().Fragment,
                  { key: p.value },
                  s().createElement(
                    "li",
                    { className: (0, r.cx)(u.listItem, m && d.stickyParent) },
                    s().createElement(
                      "div",
                      { className: d.parentRow },
                      s().createElement(
                        "button",
                        {
                          className: d.expandButton,
                          onClick: () => c(p.value),
                          "aria-label": m ? "Collapse" : "Expand",
                          "data-testid": `expand-${p.value}`,
                        },
                        s().createElement(i.Icon, { name: m ? "angle-down" : "angle-right" }),
                      ),
                      s().createElement(v, {
                        label: p.label,
                        count: p.count,
                        checked: g,
                        onChange: (e) =>
                          e.currentTarget.checked
                            ? ((e) => {
                                const n = [
                                  ...t.filter((t) => !t.value.startsWith(e.value + l._)),
                                  { label: e.label, value: e.value },
                                ];
                                o(n);
                              })(p)
                            : ((e) => {
                                const n = t.filter(
                                  (t) => t.value !== e && !t.value.startsWith(e + l._),
                                );
                                o(n);
                              })(p.value),
                      }),
                    ),
                  ),
                  m &&
                    h.length > 0 &&
                    s().createElement(
                      "ul",
                      { className: d.childrenList },
                      h.map((n) =>
                        s().createElement(
                          "li",
                          { key: n.value, className: d.childItem },
                          s().createElement(v, {
                            label: n.label,
                            count: n.count,
                            checked: t.some((e) => e.value === n.value),
                            onChange: (r) =>
                              ((n, r) => {
                                const [a, i] = n.value.split(l._);
                                if (r) {
                                  const e = `${a} > ${i}`,
                                    r = [
                                      ...t.filter((e) => e.value !== a),
                                      { label: e, value: n.value },
                                    ];
                                  (o(r),
                                    (0, f.z)("sidebar_hierarchical_child_filter_applied", {
                                      prefix: a,
                                      child: i,
                                    }));
                                } else if (
                                  0 ===
                                  t.filter(
                                    (e) => e.value.startsWith(a + l._) && e.value !== n.value,
                                  ).length
                                ) {
                                  const r = e.find((e) => e.value === a);
                                  if (r) {
                                    const e = [
                                      ...t.filter((e) => !e.value.startsWith(a + l._)),
                                      { label: r.label, value: r.value },
                                    ];
                                    o(e);
                                  } else {
                                    const e = t.filter((e) => e.value !== n.value);
                                    o(e);
                                  }
                                } else {
                                  const e = t.filter((e) => e.value !== n.value);
                                  o(e);
                                }
                              })(n, r.currentTarget.checked),
                          }),
                        ),
                      ),
                    ),
                );
              }),
            ),
        );
      }
      function x(e) {
        return {
          stickyParent: (0, r.css)({
            position: "sticky",
            top: 0,
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: e.colors.background.canvas,
              zIndex: -1,
            },
            backgroundColor: e.colors.background.canvas,
            zIndex: 10,
            borderBottom: `1px solid ${e.colors.border.weak}`,
            marginLeft: e.spacing(-1),
            marginRight: e.spacing(-1),
            paddingLeft: e.spacing(1),
            paddingRight: e.spacing(1),
            paddingTop: e.spacing(0.5),
            paddingBottom: e.spacing(0.5),
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }),
          parentRow: (0, r.css)({
            display: "flex",
            alignItems: "center",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }),
          expandButton: (0, r.css)({
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: e.spacing(0.5),
            display: "flex",
            alignItems: "center",
            color: e.colors.text.primary,
            minWidth: "24px",
            justifyContent: "center",
            "&:hover": { color: e.colors.text.maxContrast },
          }),
          childrenList: (0, r.css)({ listStyle: "none", paddingLeft: e.spacing(4), margin: 0 }),
          childItem: (0, r.css)({
            display: "flex",
            alignItems: "center",
            padding: e.spacing(0.5, 0),
          }),
        };
      }
      function k(e, t, n) {
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
      function C(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              k(e, t, n[t]);
            }));
        }
        return e;
      }
      function P(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class j extends a.SceneObjectBase {
        getUrlState() {
          return { [this.state.key]: this.state.selectedGroups.map((e) => e.value).join(",") };
        }
        updateFromUrl(e) {
          const t = {};
          ("string" == typeof e[this.state.key] &&
            e[this.state.key] !== this.state.selectedGroups.map((e) => e.value).join(",") &&
            (t.selectedGroups = e[this.state.key]
              .split(",")
              .map((e) => e.trim())
              .filter((e) => e)
              .map((e) => ({ label: this.parseLabel(e), value: e }))),
            this.setState(t));
        }
        onActivate() {
          const e = a.sceneGraph.lookupVariable(u.$, this),
            t = a.sceneGraph.lookupVariable(c.h, this);
          (this.updateLists(e.state.options), this.updateCounts());
          const { selectedGroups: n, hierarchical: r } = this.state;
          if ((this.setState({ loading: t.state.loading, active: n.length > 0 }), r)) {
            const t = new Set();
            if (
              (n.forEach((e) => {
                if (e.value.includes(l._)) {
                  const [n] = e.value.split(l._);
                  t.add(n);
                }
              }),
              t.size > 0)
            ) {
              const n = e.state.options,
                r = new Map(this.state.computedSublevels);
              (t.forEach((e) => {
                if (!r.has(e)) {
                  const t = (0, l.M)(n, e);
                  r.set(e, t);
                }
              }),
                this.setState({ expandedPrefixes: t, computedSublevels: r }));
            }
          }
        }
        updateLists(e) {
          this.setState({ groups: this.state.computeGroups(e), loading: !1 });
        }
        updateCounts() {
          var e;
          const { groups: t, computeGroups: n, type: r } = this.state,
            i = a.sceneGraph.lookupVariable(u.$, this).state.options,
            o =
              null === (e = a.sceneGraph.getAncestor(this, p.m).state.enginesMap.get(c.h)) ||
              void 0 === e
                ? void 0
                : e.filterEngine;
          if (!o) return void h.v.warn("MetricsFilterSection: No filter engine found");
          const s = P(C({}, o.getFilters()), { [r]: [] }),
            l = d.k.getFilteredOptions(i, s),
            m = new Map(n(l).map((e) => [e.label, e.count])),
            f = t.map((e) => {
              var t;
              return P(C({}, e), { count: null !== (t = m.get(e.label)) && void 0 !== t ? t : 0 });
            });
          (this.setState({ groups: f, loading: !1 }),
            this.state.hierarchical && this.updateSublevelCounts(l));
        }
        updateSublevelCounts(e) {
          const { computedSublevels: t } = this.state,
            n = new Map(t);
          for (const [r, a] of t.entries()) {
            const t = (0, l.M)(e, r),
              i = new Map(t.map((e) => [e.label, e.count])),
              o = a.map((e) => {
                var t;
                return P(C({}, e), {
                  count: null !== (t = i.get(e.label)) && void 0 !== t ? t : 0,
                });
              });
            n.set(r, o);
          }
          this.setState({ computedSublevels: n });
        }
        parseLabel(e) {
          if (e in m.w) return m.w[e];
          if (e.includes(l._)) {
            const [t, n] = e.split(l._);
            return `${t} > ${n}`;
          }
          return e;
        }
        constructor({
          key: e,
          type: t,
          title: n,
          description: r,
          icon: i,
          computeGroups: o,
          showHideEmpty: s,
          showSearch: d,
          disabled: p,
          active: h,
          hierarchical: g,
        }) {
          (super({
            key: e,
            type: t,
            title: n,
            description: r,
            icon: i,
            groups: [],
            computeGroups: o,
            selectedGroups: [],
            loading: !0,
            showHideEmpty: null == s || s,
            showSearch: null == d || d,
            disabled: null != p && p,
            active: null != h && h,
            hierarchical: null != g && g,
            expandedPrefixes: new Set(),
            computedSublevels: new Map(),
          }),
            k(
              this,
              "_variableDependency",
              new a.VariableDependencyConfig(this, {
                variableNames: [u.$, c.h],
                onReferencedVariableValueChanged: (e) => {
                  const { name: t, options: n } = e.state;
                  t !== u.$ ? t === c.h && this.updateCounts() : this.updateLists(n);
                },
              }),
            ),
            k(this, "_urlSync", new a.SceneObjectUrlSyncConfig(this, { keys: [this.state.key] })),
            k(this, "onExpandToggle", (e) => {
              const { expandedPrefixes: t, computedSublevels: n } = this.state,
                r = new Set(t);
              let i = n;
              if (r.has(e)) r.delete(e);
              else {
                if ((r.add(e), !n.has(e))) {
                  const t = a.sceneGraph.lookupVariable(u.$, this).state.options,
                    r = (0, l.M)(t, e);
                  ((i = new Map(n)), i.set(e, r));
                }
                (0, f.z)("sidebar_hierarchical_prefix_opened", { prefix: e });
              }
              this.setState({ expandedPrefixes: r, computedSublevels: i });
            }),
            k(this, "onSelectionChange", (e) => {
              (this.setState({ selectedGroups: e, active: e.length > 0 }),
                this.publishEvent(
                  new O.Y({ type: this.state.type, filters: e.map((e) => e.value) }),
                  !0,
                ),
                this.publishEvent(
                  new b.B({ key: this.state.key, values: e.map((e) => e.label) }),
                  !0,
                ),
                "prefixes" === this.state.type
                  ? (0, f.z)("sidebar_prefix_filter_applied", { filter_count: e.length })
                  : "suffixes" === this.state.type &&
                    (0, f.z)("sidebar_suffix_filter_applied", { filter_count: e.length }),
                "filters-rule" === this.state.key &&
                  e.length > 0 &&
                  e.forEach((e) => {
                    let t;
                    switch (e.label) {
                      case m.b.metrics:
                        t = "non_rules_metrics";
                        break;
                      case m.b.rules:
                        t = "recording_rules";
                        break;
                      default:
                        return;
                    }
                    (0, f.z)("sidebar_rules_filter_selected", { filter_type: t });
                  }));
            }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function _(e) {
        return {
          container: (0, r.css)({
            display: "flex",
            flexDirection: "column",
            gap: e.spacing(1),
            height: "100%",
            overflowY: "hidden",
          }),
          switchContainer: (0, r.css)({
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: e.spacing(1),
          }),
          switchLabel: (0, r.css)({ fontSize: "12px", color: e.colors.text.primary }),
          searchInput: (0, r.css)({
            flexBasis: "32px",
            flexShrink: 0,
            marginBottom: e.spacing(1),
            padding: e.spacing(0, 0.5),
          }),
        };
      }
      k(j, "Component", ({ model: e }) => {
        const t = (0, i.useStyles2)(_),
          {
            groups: n,
            selectedGroups: r,
            loading: a,
            title: l,
            description: c,
            showHideEmpty: u,
            showSearch: d,
            hierarchical: p,
            expandedPrefixes: m,
            computedSublevels: h,
          } = e.useState(),
          [f, b] = (0, o.useState)(!1),
          [y, v] = (0, o.useState)(""),
          S = (0, o.useMemo)(() => {
            const e = [];
            return (
              f && e.push((e) => e.count > 0),
              e.push((e) => e.label.toLowerCase().includes(y.toLowerCase())),
              n.filter((t) => e.every((e) => e(t)))
            );
          }, [f, n, y]);
        return s().createElement(
          "div",
          { className: t.container },
          s().createElement(g._, { title: l, description: c }),
          u &&
            s().createElement(
              "div",
              { className: t.switchContainer },
              s().createElement("span", { className: t.switchLabel }, "Hide empty"),
              s().createElement(i.Switch, {
                value: f,
                onChange: (e) => b(e.currentTarget.checked),
              }),
            ),
          d &&
            s().createElement(i.Input, {
              className: t.searchInput,
              prefix: s().createElement(i.Icon, { name: "search" }),
              placeholder: "Search...",
              value: y,
              onChange: (e) => v(e.currentTarget.value),
              onKeyDown: (e) => {
                "Escape" === e.key && (e.preventDefault(), v(""));
              },
              suffix: s().createElement(i.IconButton, {
                name: "times",
                variant: "secondary",
                tooltip: "Clear search",
                onClick: () => v(""),
              }),
            }),
          a && s().createElement(i.Spinner, { inline: !0 }),
          !a &&
            p &&
            s().createElement(E, {
              groups: S,
              selectedGroups: r,
              expandedPrefixes: m,
              computedSublevels: h,
              onSelectionChange: e.onSelectionChange,
              onExpandToggle: e.onExpandToggle,
            }),
          !a &&
            !p &&
            s().createElement(w, {
              groups: S,
              selectedGroups: r,
              onSelectionChange: e.onSelectionChange,
            }),
        );
      });
    },
    5622: (e, t, n) => {
      n.d(t, { H: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "configure-panel"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    5665: (e, t, n) => {
      n.d(t, { $: () => u, s: () => d });
      var r = n(7781),
        a = n(3014),
        i = n(1419),
        o = n(7616),
        s = n(9694),
        l = n(1089);
      function c(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      const u = "metrics-wingman";
      class d extends a.QueryVariable {
        onActivate() {
          (this.fetchAllOrRecentMetrics(),
            this._subs.add(
              a.sceneGraph
                .findByKeyAndType(this, i.EY, a.DataSourceVariable)
                .subscribeToState((e, t) => {
                  this.state.query || e.value === t.value || this.fetchAllOrRecentMetrics();
                }),
            ),
            this._subs.add(
              a.sceneGraph
                .findByKeyAndType(this, s.U, a.AdHocFiltersVariable)
                .subscribeToState((e, t) => {
                  this.state.query ||
                    e.filterExpression === t.filterExpression ||
                    this.fetchAllOrRecentMetrics();
                }),
            ));
        }
        fetchAllOrRecentMetrics() {
          const e = new URLSearchParams(window.location.search).get("filters-recent");
          e ? this.fetchRecentMetrics(e) : this.fetchAllMetrics();
        }
        fetchAllMetrics() {
          (this.setState({
            query: this.extraFilter
              ? `label_values({${this.extraFilter},$${s.U}}, __name__)`
              : `label_values({$${s.U}}, __name__)`,
            refresh: r.VariableRefresh.onTimeRangeChanged,
          }),
            this.refreshOptions());
        }
        fetchRecentMetrics(e) {
          return ((t = function* () {
            this.setState({
              query: "",
              refresh: r.VariableRefresh.never,
              options: [],
              loading: !0,
              error: null,
            });
            try {
              const t = yield (0, o.kj)(this).fetchRecentMetrics({
                interval: e,
                extraFilter: this.extraFilter,
              });
              this.setState({ loading: !1, options: t.map((e) => ({ value: e, label: e })) });
            } catch (e) {
              this.setState({ loading: !1, error: e });
            }
          }),
          function () {
            var e = this,
              n = arguments;
            return new Promise(function (r, a) {
              var i = t.apply(e, n);
              function o(e) {
                c(i, r, a, o, s, "next", e);
              }
              function s(e) {
                c(i, r, a, o, s, "throw", e);
              }
              o(void 0);
            });
          }).call(this);
          var t;
        }
        constructor({ key: e, name: t, labelMatcher: n, addLifeCycleEvents: a } = {}) {
          if (
            (super({
              key: e || u,
              name: t || u,
              label: "Metrics",
              datasource: i.GH,
              query: "",
              refresh: r.VariableRefresh.never,
              includeAll: !0,
              value: "$__all",
              skipUrlSync: !0,
              sort: r.VariableSort.alphabeticalAsc,
              hide: r.VariableHide.hideVariable,
            }),
            (function (e, t, n) {
              t in e
                ? Object.defineProperty(e, t, {
                    value: n,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  })
                : (e[t] = n);
            })(this, "extraFilter", void 0),
            (this.extraFilter = n ? `${n.key}${n.operator}"${n.value}"` : void 0),
            this.addActivationHandler(this.onActivate.bind(this)),
            a)
          )
            return (0, l.I)(this);
        }
      }
    },
    5693: (e, t, n) => {
      n.d(t, { x: () => a });
      var r = n(2533);
      const a = new (class {
        buildStorageKey(e) {
          return `${this.service}.${e}`;
        }
        getItem(e) {
          const t = this.buildStorageKey(e),
            n = localStorage.getItem(t);
          return null === n ? null : JSON.parse(n);
        }
        setItem(e, t) {
          const n = this.buildStorageKey(e);
          localStorage.setItem(n, JSON.stringify(t));
        }
        removeItem(e) {
          const t = this.buildStorageKey(e);
          localStorage.removeItem(t);
        }
        clear() {
          localStorage.clear();
        }
        constructor(e) {
          var t, n, r;
          ((r = void 0),
            (n = "service") in (t = this)
              ? Object.defineProperty(t, n, {
                  value: r,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                })
              : (t[n] = r),
            (this.service = e));
        }
      })(r.id);
    },
    5732: (e, t, n) => {
      n.d(t, { x: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "metrics-variable-activated"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    5843: (e, t, n) => {
      n.d(t, { I: () => o });
      var r = n(3014);
      function a(e, t, n) {
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
      function i(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class o extends r.SceneObjectBase {
        useCounts() {
          return this.useState().counts;
        }
        constructor(e) {
          super(
            i(
              (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {},
                    r = Object.keys(n);
                  ("function" == typeof Object.getOwnPropertySymbols &&
                    (r = r.concat(
                      Object.getOwnPropertySymbols(n).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(n, e).enumerable;
                      }),
                    )),
                    r.forEach(function (t) {
                      a(e, t, n[t]);
                    }));
                }
                return e;
              })({}, e),
              { counts: { current: 0, total: 0 } },
            ),
          );
        }
      }
    },
    5935: (e, t, n) => {
      n.d(t, { h: () => m, z: () => d });
      var r = n(8531),
        a = n(2559),
        i = n(5176),
        o = n(8943);
      function s(e, t, n) {
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
      function l(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      const c = "grafana_explore_metrics_";
      function u(e, t) {
        return l(
          (function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = null != arguments[t] ? arguments[t] : {},
                r = Object.keys(n);
              ("function" == typeof Object.getOwnPropertySymbols &&
                (r = r.concat(
                  Object.getOwnPropertySymbols(n).filter(function (e) {
                    return Object.getOwnPropertyDescriptor(n, e).enumerable;
                  }),
                )),
                r.forEach(function (t) {
                  s(e, t, n[t]);
                }));
            }
            return e;
          })(
            {},
            t,
            (function (e) {
              const t = {};
              return (
                e.includes("sidebar") &&
                  Object.assign(t, (0, a.rp)("experiment_default_open_sidebar", !0)),
                "metric_selected" === e &&
                  Object.assign(t, (0, a.rp)("experiment_hierarchical_prefix_filtering", !0)),
                t
              );
            })(e),
          ),
          { meta: { appRelease: r.config.apps[o.s].version, appVersion: i.t } },
        );
      }
      function d(e, t) {
        (0, r.reportInteraction)(`${c}${e}`, u(e, t));
      }
      function p(e, t) {
        d("label_filter_changed", { label: e, action: t, cause: "adhoc_filter" });
      }
      function m(e, t) {
        e.length === t.length
          ? (function (e, t) {
              for (const n of t)
                for (const t of e) n.key === t.key && n.value !== t.value && p(n.key, "changed");
            })(e, t)
          : e.length < t.length
            ? (function (e, t) {
                for (const n of t) e.some((e) => e.key === n.key) || p(n.key, "removed");
              })(e, t)
            : (function (e, t) {
                for (const n of e) !t.some((e) => e.key === n.key) && p(n.key, "added");
              })(e, t);
      }
    },
    6024: (e, t, n) => {
      n.d(t, { _: () => r });
      const r = new Intl.Collator("en", { sensitivity: "base" }).compare;
    },
    6359: (e, t, n) => {
      n.d(t, { R: () => ne });
      var r = n(6089),
        a = n(8531),
        i = n(3014),
        o = n(2245),
        s = n(2007),
        l = n(5959),
        c = n.n(l),
        u = n(1419),
        d = n(5935),
        p = n(396),
        m = n(7616);
      const h = { label: "All", value: "$__all" },
        f = "Select a label to group by";
      function b(e) {
        const t = (0, s.useStyles2)(g),
          { loading: n, options: r, value: a, onChange: i } = e,
          o = (0, l.useMemo)(() => [h, ...r], [r]);
        if (n)
          return c().createElement(s.Combobox, { options: [], placeholder: f, onChange: m.fZ });
        return o.length <= 4
          ? c().createElement(s.RadioButtonGroup, {
              "data-testid": "group-by-selector-radio-group",
              options: o,
              value: a,
              onChange: i,
            })
          : c().createElement(
              "div",
              { className: t.combobox },
              c().createElement(s.Combobox, {
                "data-testid": "group-by-selector-combobox",
                options: o,
                value: a,
                placeholder: f,
                onChange: (e) => {
                  i(e ? e.value : h.value);
                },
                isClearable: !0,
              }),
            );
      }
      function g() {
        return { combobox: (0, r.css)({ marginLeft: "4px" }) };
      }
      class y extends i.QueryVariable {
        onActivate() {
          (this.filterOptions(),
            this.subscribeToState((e, t) => {
              (e.value &&
                e.value !== t.value &&
                (0, d.z)("groupby_label_changed", { label: String(e.value) }),
                e.options !== t.options &&
                  e.options.find((e) => "le" === e.value) &&
                  this.filterOptions(e.options));
            }));
          const e = i.sceneGraph.lookupVariable(u.Ao, this);
          (0, p.BE)(e) &&
            e.subscribeToState((e, t) => {
              e.filterExpression !== t.filterExpression && this.changeValueTo("$__all");
            });
        }
        filterOptions(e = this.state.options) {
          this.setState({ options: e.filter((e) => "le" !== e.value) });
        }
        constructor() {
          (super({
            name: u.yr,
            label: "Group by",
            datasource: u.GH,
            includeAll: !0,
            defaultToAll: !0,
            query: `label_names(${u.Rp})`,
            value: "",
            text: "",
          }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      var v, S, w;
      function O() {
        return { field: (0, r.css)({ marginBottom: 0 }) };
      }
      ((w = ({ model: e }) => {
        const t = (0, s.useStyles2)(O),
          { options: n, value: r, loading: a } = e.useState(),
          i = (0, l.useCallback)(
            (t, n) => {
              const r = "All" === t ? "$__all" : t;
              e.changeValueTo(r, void 0, !n);
            },
            [e],
          );
        return c().createElement(
          s.Field,
          { label: "By label", "data-testid": "breakdown-label-selector", className: t.field },
          c().createElement(b, { options: n, value: r, onChange: i, loading: a }),
        );
      }),
        (S = "Component") in (v = y)
          ? Object.defineProperty(v, S, {
              value: w,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (v[S] = w));
      var E = n(495),
        x = n(9762),
        k = n(1140),
        C = n(7781);
      var P = n(4440);
      function j(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function _(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              j(i, r, a, o, s, "next", e);
            }
            function s(e) {
              j(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
      }
      const T = { job: "service_name", instance: "service_instance_id" };
      function I(e) {
        return e in T ? T[e] : e;
      }
      const A = (e) => {
        let t = !1;
        return {
          name: "labelsCrossReference",
          checkConditionsMetForRelatedLogs: () => t,
          getDataSources: () =>
            _(function* () {
              var n;
              const r = (0, m.kj)(e),
                o = i.sceneGraph.lookupVariable(u.Ao, r);
              if (!(0, p.BE)(o) || !o.state.filters.length) return ((t = !1), []);
              t = !0;
              const s = o.state.filters.map(({ key: e, operator: t, value: n }) => ({
                  key: e,
                  operator: t,
                  value: n,
                })),
                l = null === (n = e.state.$timeRange) || void 0 === n ? void 0 : n.state.value,
                c = yield (0, P.tS)().getHealthyDataSources("loki"),
                d = yield Promise.all(
                  c.map(({ uid: e, name: t }) =>
                    _(function* () {
                      const n = yield (function (e, t, n) {
                        return _(function* () {
                          var r;
                          const i = yield (0, a.getDataSourceSrv)().get(e),
                            o = yield null === (r = i.getTagKeys) || void 0 === r
                              ? void 0
                              : r.call(i, {
                                  timeRange: n,
                                  filters: t.map(({ key: e, operator: t, value: n }) => ({
                                    key: I(e),
                                    operator: t,
                                    value: n,
                                  })),
                                });
                          if (!Array.isArray(o)) return !1;
                          const s = new Set(o.map((e) => e.text));
                          return (
                            !!t.map((e) => I(e.key)).every((e) => s.has(e)) &&
                            (yield Promise.all(
                              t.map((e) =>
                                _(function* () {
                                  var r;
                                  const a = I(e.key),
                                    o = yield null === (r = i.getTagValues) || void 0 === r
                                      ? void 0
                                      : r.call(i, { key: a, timeRange: n, filters: t });
                                  return !!Array.isArray(o) && o.some((t) => t.text === e.value);
                                })(),
                              ),
                            )).every(Boolean)
                          );
                        })();
                      })(e, s, l);
                      return n ? { uid: e, name: t } : null;
                    })(),
                  ),
                );
              return d.filter((e) => null !== e);
            })(),
          getLokiQueryExpr() {
            const t = (0, m.kj)(e),
              n = i.sceneGraph.lookupVariable(u.Ao, t);
            if (!(0, p.BE)(n) || !n.state.filters.length) return "";
            return `{${n.state.filters.map((e) => `${I(e.key)}${e.operator}"${e.value}"`).join(",")}}`;
          },
        };
      };
      var D = n(6365),
        B = n(1269),
        M = n(8705);
      function N(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function L(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              N(i, r, a, o, s, "next", e);
            }
            function s(e) {
              N(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
      }
      function R(e, t, n) {
        if (!t || !n[t]) return "";
        const r = n[t].find((t) => t.name === e);
        if (!r) return "";
        return (function (e) {
          if (
            (function (e) {
              if (e.trim().length <= 2) return !1;
              let t = !1;
              const n = D.K3.parse(e);
              return (
                n.iterate({
                  enter: ({ type: e }) => {
                    if (e.id === D.Yw) return ((t = !0), !1);
                  },
                }),
                !t
              );
            })(e)
          )
            return e;
          const t = F(e, D.MD);
          if (!t) return "";
          const n = e.substring(t.from, t.to),
            r = F(e, D.AL),
            a = r ? e.substring(r.from, r.to) : "";
          return `${n} ${a}`.trim();
        })(r.query);
      }
      function $() {
        return L(function* () {
          const e = yield (0, P.tS)().getHealthyDataSources("loki"),
            t = {};
          return (
            yield Promise.all(
              e.map((e) =>
                L(function* () {
                  try {
                    const r = (function (e, t) {
                      if (0 === e.length) return [];
                      const n = new Map();
                      return (
                        e.forEach((e) => {
                          e.rules
                            .filter((e) => "recording" === e.type)
                            .forEach(({ type: e, name: r, query: a }) => {
                              if (n.has(r)) {
                                const e = n.get(r);
                                e && ((e.hasMultipleOccurrences = !0), n.set(r, e));
                              } else
                                n.set(r, {
                                  type: e,
                                  name: r,
                                  query: a,
                                  datasource: { name: t.name, uid: t.uid },
                                  hasMultipleOccurrences: !1,
                                });
                            });
                        }),
                        Array.from(n.values())
                      );
                    })(
                      yield ((n = e),
                      L(function* () {
                        const e = {
                            url: `api/prometheus/${n.uid}/api/v1/rules`,
                            showErrorAlert: !1,
                            showSuccessAlert: !1,
                          },
                          t = yield (0, B.lastValueFrom)((0, a.getBackendSrv)().fetch(e));
                        return t.ok
                          ? t.data.data.groups
                          : (M.v.warn(
                              `Failed to fetch recording rules from Loki data source: ${n.name}`,
                            ),
                            []);
                      })()),
                      e,
                    );
                    t[e.uid] = r;
                  } catch (e) {
                    M.v.warn(e);
                  }
                  var n;
                })(),
              ),
            ),
            t
          );
        })();
      }
      const V = () => {
        let e = {},
          t = !1;
        return {
          name: "lokiRecordingRules",
          checkConditionsMetForRelatedLogs: () => t,
          getDataSources: (n) =>
            L(function* () {
              e = yield $();
              const r = (function (e, t) {
                const n = [];
                return (
                  Object.values(t).forEach((t) => {
                    t.filter((t) => t.name === e).forEach((e) => {
                      n.push(e.datasource);
                    });
                  }),
                  n
                );
              })(n, e);
              return ((t = Boolean(r.length)), r);
            })(),
          getLokiQueryExpr: (t, n) => R(t, n, e),
        };
      };
      function F(e, t) {
        let n;
        return (
          D.K3.parse(e).iterate({
            enter: (e) => {
              if (e.type.id === t) return ((n = e.node), !1);
            },
          }),
          n
        );
      }
      var G = n(2533);
      function q(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function U(e, t, n) {
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
      class H {
        get lokiDataSources() {
          return this._internalState.lokiDataSources;
        }
        set lokiDataSources(e) {
          const t = this._internalState.lokiDataSources.map((e) => e.uid).join(","),
            n = e.map((e) => e.uid).join(",");
          (t && t === n) ||
            ((this._internalState.lokiDataSources = e),
            this._changeHandlers.lokiDataSources.forEach((e) =>
              e(this._internalState.lokiDataSources),
            ));
        }
        set relatedLogsCount(e) {
          ((this._internalState.relatedLogsCount = e),
            this._changeHandlers.relatedLogsCount.forEach((e) =>
              e(this._internalState.relatedLogsCount),
            ));
        }
        addLokiDataSourcesChangeHandler(e) {
          this._changeHandlers.lokiDataSources.push(e);
        }
        addRelatedLogsCountChangeHandler(e) {
          this._changeHandlers.relatedLogsCount.push(e);
        }
        handleFiltersChange() {
          this.lokiDataSources &&
            ((this.lokiDataSources = []),
            (this.relatedLogsCount = 0),
            this.findAndCheckAllDatasources());
        }
        findAndCheckAllDatasources() {
          return ((e = function* () {
            const e = (yield this._dataSourceFetcher.getHealthyDataSources("loki")).slice(0, 5);
            e.length > 0
              ? this.checkLogsInDataSources(e)
              : ((this.lokiDataSources = []), (this.relatedLogsCount = 0));
          }),
          function () {
            var t = this,
              n = arguments;
            return new Promise(function (r, a) {
              var i = e.apply(t, n);
              function o(e) {
                q(i, r, a, o, s, "next", e);
              }
              function s(e) {
                q(i, r, a, o, s, "throw", e);
              }
              o(void 0);
            });
          }).call(this);
          var e;
        }
        getLokiQueries(e, t = 100) {
          const { metric: n } = this._metricScene.state,
            r = this._logsConnectors.reduce((t, r, a) => {
              const i = r.getLokiQueryExpr(n, e);
              var o;
              i && (t[null !== (o = r.name) && void 0 !== o ? o : `connector-${a}`] = i);
              return t;
            }, {});
          return Object.keys(r).map((e) => ({
            refId: `RelatedLogs-${e}`,
            expr: r[e],
            maxLines: t,
            supportingQueryType: G.id,
          }));
        }
        checkLogsInDataSources(e) {
          const t = [];
          let n = 0,
            r = 0;
          if (0 === e.length)
            return ((this.lokiDataSources = []), void (this.relatedLogsCount = 0));
          e.forEach((a) => {
            const o = new i.SceneQueryRunner({
              datasource: { uid: a.uid },
              queries: this.getLokiQueries(a.uid),
              key: `related_logs_check_${a.uid}`,
              $timeRange: this._metricScene.state.$timeRange,
            });
            (o.subscribeToState((i) => {
              var o;
              if (
                (null === (o = i.data) || void 0 === o ? void 0 : o.state) === C.LoadingState.Done
              ) {
                var s;
                if ((r++, null === (s = i.data) || void 0 === s ? void 0 : s.series)) {
                  const e = this.countLogsLines(i);
                  e > 0 && (t.push(a), (n += e));
                }
                r === e.length && ((this.lokiDataSources = t), (this.relatedLogsCount = n));
              }
            }),
              o.activate());
          });
        }
        checkConditionsMetForRelatedLogs() {
          return this._logsConnectors.some((e) => e.checkConditionsMetForRelatedLogs());
        }
        countLogsLines(e) {
          var t, n;
          return null !==
            (n =
              null === (t = e.data) || void 0 === t
                ? void 0
                : t.series.reduce((e, t) => e + t.length, 0)) && void 0 !== n
            ? n
            : 0;
        }
        constructor(e) {
          (U(this, "_logsConnectors", void 0),
            U(this, "_metricScene", void 0),
            U(this, "_dataSourceFetcher", (0, P.tS)()),
            U(this, "_changeHandlers", { lokiDataSources: [], relatedLogsCount: [] }),
            U(this, "_internalState", { relatedLogsCount: 0, lokiDataSources: [] }),
            (this._metricScene = e),
            (this._logsConnectors = [V(), A(e)]));
        }
      }
      function z() {
        const e = (0, s.useStyles2)(K);
        return c().createElement(
          s.Stack,
          { direction: "column", gap: 2 },
          c().createElement(
            s.Alert,
            { title: "No related logs found", severity: "info" },
            "We couldn't find any logs related to the current metric with your selected filters.",
          ),
          c().createElement(
            s.Text,
            null,
            "To find related logs, try the following:",
            c().createElement(
              "ul",
              { className: e.list },
              c().createElement(
                "li",
                null,
                "Adjust your label filters to include labels that exist in both the current metric and your logs",
              ),
              c().createElement(
                "li",
                null,
                "Select a metric created by a",
                " ",
                c().createElement(
                  s.TextLink,
                  {
                    external: !0,
                    href: "https://grafana.com/docs/loki/latest/alert/#recording-rules",
                  },
                  "Loki Recording Rule",
                ),
              ),
              c().createElement("li", null, "Broaden the time range to include more data"),
            ),
          ),
          c().createElement(
            s.Text,
            { variant: "bodySmall", color: "secondary" },
            "Note: Related logs is an experimental feature.",
          ),
        );
      }
      function K(e) {
        return { list: (0, r.css)({ paddingLeft: e.spacing(2), marginTop: e.spacing(1) }) };
      }
      function W({ context: e }) {
        const t = (0, l.useMemo)(() => e, [e]),
          { links: n, isLoading: r } = (0, a.usePluginLinks)({
            extensionPointId: "grafana-metricsdrilldown-app/open-in-logs-drilldown/v1",
            limitPerPlugin: 1,
            context: t,
          }),
          i = (0, l.useMemo)(
            () => n.find(({ pluginId: e }) => "grafana-lokiexplore-app" === e),
            [n],
          );
        if (r)
          return c().createElement(
            s.LinkButton,
            { variant: "secondary", size: "sm", disabled: !0 },
            "Loading...",
          );
        const o = void 0 !== i;
        return c().createElement(
          s.LinkButton,
          {
            href: o
              ? `${a.config.appSubUrl}${i.path}`
              : `${a.config.appSubUrl}/a/grafana-lokiexplore-app`,
            target: "_blank",
            tooltip: o
              ? "Use the Logs Drilldown app to explore these logs"
              : "Navigate to the Logs Drilldown app",
            variant: "secondary",
            size: "sm",
            onClick: () =>
              (0, d.z)("related_logs_action_clicked", { action: "open_logs_drilldown" }),
          },
          o ? "Open in Logs Drilldown" : "Open Logs Drilldown",
        );
      }
      var Q = n(337);
      function Y(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function X(e, t, n) {
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
      function Z(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class J extends i.SceneObjectBase {
        _onActivate() {
          return ((e = function* () {
            (this.state.orchestrator.addLokiDataSourcesChangeHandler(() => this.setupLogsPanel()),
              this.state.orchestrator.lokiDataSources.length
                ? this.setupLogsPanel()
                : (this.setState({ loading: !0 }),
                  yield this.state.orchestrator.findAndCheckAllDatasources(),
                  this.setState({ loading: !1 })),
              (0, Q.$)(this, x.x3.relatedLogs));
          }),
          function () {
            var t = this,
              n = arguments;
            return new Promise(function (r, a) {
              var i = e.apply(t, n);
              function o(e) {
                Y(i, r, a, o, s, "next", e);
              }
              function s(e) {
                Y(i, r, a, o, s, "throw", e);
              }
              o(void 0);
            });
          }).call(this);
          var e;
        }
        showNoLogsFound() {
          (this.setState({ body: new i.SceneReactObject({ component: z }), controls: void 0 }),
            (this.state.orchestrator.relatedLogsCount = 0));
        }
        _buildQueryRunner() {
          ((this._queryRunner = new i.SceneQueryRunner({
            datasource: { uid: u.Kf },
            queries: [],
            key: "related_logs/logs_query",
          })),
            this._constructLogsDrilldownLinkContext(this._queryRunner.state),
            this._subs.add(
              this._queryRunner.subscribeToState((e) => {
                var t;
                if (
                  (null === (t = e.data) || void 0 === t ? void 0 : t.state) !== C.LoadingState.Done
                )
                  return;
                (0 === this.state.orchestrator.countLogsLines(e) && this.showNoLogsFound(),
                  this._constructLogsDrilldownLinkContext(e));
              }),
            ));
        }
        setupLogsPanel() {
          if ((this._buildQueryRunner(), !this.state.orchestrator.lokiDataSources.length))
            return void this.showNoLogsFound();
          this.setState({
            body: i.PanelBuilders.logs()
              .setTitle("Logs")
              .setOption("showLogContextToggle", !0)
              .setOption("showTime", !0)
              .setOption("showControls", !0)
              .setOption("controlsStorageKey", "grafana.explore.logs")
              .setData(this._queryRunner)
              .build(),
          });
          const e = new i.CustomVariable({
            name: u.Az,
            label: "Logs data source",
            query: this.state.orchestrator.lokiDataSources
              .map((e) => `${e.name} : ${e.uid}`)
              .join(","),
            description: `Some Loki data sources might be missing from the dropdown if they took longer than ${P.UO} seconds to respond. To view logs for all Loki data sources, try using Logs Drilldown.`,
          });
          (this.setState({
            $variables: new i.SceneVariableSet({ variables: [e] }),
            controls: [new i.VariableValueSelectors({ layout: "vertical" })],
          }),
            this._subs.add(
              e.subscribeToState((e, t) => {
                e.value !== t.value &&
                  (0, d.z)("related_logs_action_clicked", { action: "logs_data_source_changed" });
              }),
            ),
            this.updateLokiQuery());
        }
        _constructLogsDrilldownLinkContext(e) {
          var t, n;
          const r =
              null !==
                (n =
                  null === (t = i.sceneGraph.lookupVariable(u.Az, this)) || void 0 === t
                    ? void 0
                    : t.getValue()) && void 0 !== n
                ? n
                : "",
            a = e.queries,
            o = [];
          (r &&
            a.length &&
            a.forEach((e) => {
              o.push(
                Z(
                  (function (e) {
                    for (var t = 1; t < arguments.length; t++) {
                      var n = null != arguments[t] ? arguments[t] : {},
                        r = Object.keys(n);
                      ("function" == typeof Object.getOwnPropertySymbols &&
                        (r = r.concat(
                          Object.getOwnPropertySymbols(n).filter(function (e) {
                            return Object.getOwnPropertyDescriptor(n, e).enumerable;
                          }),
                        )),
                        r.forEach(function (t) {
                          X(e, t, n[t]);
                        }));
                    }
                    return e;
                  })({}, e),
                  { datasource: { uid: r, type: "loki" } },
                ),
              );
            }),
            this.setState({
              logsDrilldownLinkContext: {
                targets: o,
                timeRange: i.sceneGraph.getTimeRange(this).state,
              },
            }));
        }
        updateLokiQuery() {
          if (!this._queryRunner) return;
          const e = i.sceneGraph.lookupVariable(u.Az, this);
          let t;
          if (((0, p.UG)(e) && (t = e.getValue()), !t)) return;
          const n = this.state.orchestrator.getLokiQueries(t);
          0 !== n.length ? this._queryRunner.setState({ queries: n }) : this.showNoLogsFound();
        }
        constructor(e) {
          (super({
            loading: !1,
            controls: [],
            body: new i.SceneReactObject({ component: () => c().createElement(s.Spinner, null) }),
            orchestrator: e.orchestrator,
            logsDrilldownLinkContext: { targets: [] },
          }),
            X(this, "_queryRunner", void 0),
            X(
              this,
              "_variableDependency",
              new i.VariableDependencyConfig(this, {
                variableNames: [u.Az, u.Ao],
                onReferencedVariableValueChanged: (e) => {
                  e.state.name === u.Ao
                    ? this.state.orchestrator.handleFiltersChange()
                    : e.state.name === u.Az && this.updateLokiQuery();
                },
              }),
            ),
            this.addActivationHandler(() => {
              this._onActivate();
            }));
        }
      }
      function ee() {
        return {
          bodyContainer: (0, r.css)({ flexGrow: 1, minHeight: 500, position: "relative" }),
          bodyContent: (0, r.css)({ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }),
        };
      }
      function te(e, t, n) {
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
      X(J, "Component", ({ model: e }) => {
        const { controls: t, body: n, logsDrilldownLinkContext: r, loading: a } = e.useState(),
          i = (0, s.useStyles2)(ee);
        return a
          ? c().createElement(s.Spinner, null)
          : c().createElement(
              s.Stack,
              { gap: 1, direction: "column", grow: 1, height: "100%" },
              c().createElement(
                s.Stack,
                { gap: 1, direction: "row", justifyContent: "space-between", alignItems: "start" },
                c().createElement(
                  s.Stack,
                  { gap: 1 },
                  null == t
                    ? void 0
                    : t.map((e) => c().createElement(e.Component, { key: e.state.key, model: e })),
                ),
                c().createElement(W, { context: r }),
              ),
              c().createElement(
                "div",
                { className: i.bodyContainer },
                c().createElement(
                  "div",
                  { className: i.bodyContent },
                  c().createElement(n.Component, { model: n }),
                ),
              ),
            );
      });
      class ne extends i.SceneObjectBase {
        _onActivate() {
          (void 0 === this.state.actionView && this.setActionView(x.nh),
            this.relatedLogsOrchestrator.addRelatedLogsCountChangeHandler((e) => {
              this.setState({ relatedLogsCount: e });
            }),
            this.subscribeToEvents());
        }
        subscribeToEvents() {
          (a.config.featureToggles.enableScopesInMetricsExplore &&
            this.subscribeToEvent(u.H0, (e) => {
              var t;
              null === (t = this.state.body.state.selectedTab) || void 0 === t || t.publishEvent(e);
            }),
            this.subscribeToEvent(E.N, (e) => {
              x.fe
                .filter((t) => t.value !== e.payload.currentActionView)
                .forEach(({ backgroundTask: e, value: t }) => {
                  this.backgroundTaskHasRun[t] || (e(this), (this.backgroundTaskHasRun[t] = !0));
                });
            }));
        }
        getUrlState() {
          return { actionView: this.state.actionView };
        }
        updateFromUrl(e) {
          if ("string" == typeof e.actionView) {
            if (this.state.actionView !== e.actionView) {
              const t = x.fe.find((t) => t.value === e.actionView);
              t && this.setActionView(t.value);
            }
          } else null === e.actionView && this.setActionView(null);
        }
        setActionView(e) {
          const { body: t } = this.state,
            n = e ? x.fe.find((t) => t.value === e) : null;
          n && n.value !== this.state.actionView
            ? (t.setState({ selectedTab: n.getScene(this) }),
              this.setState({ actionView: n.value }))
            : (t.setState({ selectedTab: void 0 }), this.setState({ actionView: void 0 }));
        }
        getActionViewName() {
          var e, t;
          return this.state.actionView &&
            null !==
              (t =
                null === (e = x.fe.find((e) => e.value === this.state.actionView)) || void 0 === e
                  ? void 0
                  : e.displayName) &&
            void 0 !== t
            ? t
            : "";
        }
        createRelatedLogsScene() {
          return new J({ orchestrator: this.relatedLogsOrchestrator });
        }
        constructor(e) {
          var t, n, r;
          (super(
            (function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {},
                  r = Object.keys(n);
                ("function" == typeof Object.getOwnPropertySymbols &&
                  (r = r.concat(
                    Object.getOwnPropertySymbols(n).filter(function (e) {
                      return Object.getOwnPropertyDescriptor(n, e).enumerable;
                    }),
                  )),
                  r.forEach(function (t) {
                    te(e, t, n[t]);
                  }));
              }
              return e;
            })(
              {
                $variables:
                  null !== (t = e.$variables) && void 0 !== t
                    ? t
                    : ((r = e.metric),
                      new i.SceneVariableSet({
                        variables: [
                          new i.ConstantVariable({ name: u.PU, value: r, hide: o.zL.hideVariable }),
                          new y(),
                        ],
                      })),
                body: null !== (n = e.body) && void 0 !== n ? n : new k.j({ metric: e.metric }),
              },
              e,
            ),
          ),
            te(this, "relatedLogsOrchestrator", new H(this)),
            te(this, "_urlSync", new i.SceneObjectUrlSyncConfig(this, { keys: ["actionView"] })),
            te(
              this,
              "_variableDependency",
              new i.VariableDependencyConfig(this, {
                variableNames: [u.Ao],
                onReferencedVariableValueChanged: () => {
                  this.relatedLogsOrchestrator.handleFiltersChange();
                },
              }),
            ),
            te(this, "backgroundTaskHasRun", {
              [x.x3.breakdown]: !1,
              [x.x3.related]: !1,
              [x.x3.relatedLogs]: !1,
            }),
            this.addActivationHandler(this._onActivate.bind(this)));
        }
      }
      te(ne, "Component", ({ model: e }) => {
        const { body: t } = e.useState(),
          n = (0, s.useStyles2)(re);
        return c().createElement(
          "div",
          { className: n.container, "data-testid": "metric-scene" },
          c().createElement(t.Component, { model: t }),
        );
      });
      const re = () => ({
        container: (0, r.css)({
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }),
      });
    },
    6367: (e, t, n) => {
      n.d(t, { d: () => x, a: () => E });
      var r = n(8531),
        a = n(8705),
        i = n(6538);
      function o(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      const s = { showSuccessAlert: !1, showErrorAlert: !1 };
      function l() {
        return ((e = function* () {
          try {
            return (function (e) {
              const t = {};
              for (const n in e) t[n] = { usageType: "alerting-usage", count: e[n] };
              return t;
            })(
              (function (e) {
                const t = {},
                  n = e.filter((e) => (null == e ? void 0 : e.data.length) > 0);
                for (const e of n) {
                  const n = e.data.filter((e) => {
                    var t;
                    return (
                      "string" ==
                        typeof (null === (t = e.model) || void 0 === t ? void 0 : t.expr) &&
                      "__expr__" !== e.datasourceUid
                    );
                  });
                  for (const r of n)
                    try {
                      const e = (0, i.M)(r.model.expr);
                      for (const n of e) t[n] = (t[n] || 0) + 1;
                    } catch (t) {
                      a.v.warn(t, {
                        message: `Failed to parse PromQL expression in alert rule ${e.title}`,
                      });
                    }
                }
                return t;
              })(
                yield (0, r.getBackendSrv)().get(
                  "/api/v1/provisioning/alert-rules",
                  void 0,
                  "grafana-metricsdrilldown-app-alert-rule-metric-usage",
                  s,
                ),
              ),
            );
          } catch (e) {
            const t = "string" == typeof e ? new Error(e) : e;
            return (a.v.error(t, { message: "Failed to fetch alerting rules" }), {});
          }
        }),
        function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function s(e) {
              o(i, r, a, s, l, "next", e);
            }
            function l(e) {
              o(i, r, a, s, l, "throw", e);
            }
            s(void 0);
          });
        })();
        var e;
      }
      var c = n(7348),
        u = n(4440);
      function d(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function p(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              d(i, r, a, o, s, "next", e);
            }
            function s(e) {
              d(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
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
      function h(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      const f = { showSuccessAlert: !1, showErrorAlert: !1 },
        b = new Map(),
        g = (0, c.g)(
          (e, t, n) =>
            p(function* () {
              let i = b.get(e);
              return (
                i ||
                  ((i = (0, r.getBackendSrv)()
                    .get(
                      `/api/dashboards/uid/${e}`,
                      void 0,
                      `grafana-metricsdrilldown-app-dashboard-metric-usage-${e}`,
                      f,
                    )
                    .then(({ dashboard: e }) =>
                      h(
                        (function (e) {
                          for (var t = 1; t < arguments.length; t++) {
                            var n = null != arguments[t] ? arguments[t] : {},
                              r = Object.keys(n);
                            ("function" == typeof Object.getOwnPropertySymbols &&
                              (r = r.concat(
                                Object.getOwnPropertySymbols(n).filter(function (e) {
                                  return Object.getOwnPropertyDescriptor(n, e).enumerable;
                                }),
                              )),
                              r.forEach(function (t) {
                                m(e, t, n[t]);
                              }));
                          }
                          return e;
                        })({}, e),
                        { url: t },
                      ),
                    )
                    .catch(
                      (t) => (
                        n <= 5 && a.v.error(t, { dashboardUid: e }),
                        n++,
                        Promise.resolve(null)
                      ),
                    )
                    .finally(() => {
                      b.delete(e);
                    })),
                  b.set(e, i)),
                i
              );
            })(),
          { concurrency: 50 },
        );
      function y() {
        return p(function* () {
          try {
            const e = yield (0, r.getBackendSrv)().get(
              "/api/search",
              { type: "dash-db", limit: 500 },
              "grafana-metricsdrilldown-app-dashboard-search",
              f,
            );
            let t = 0;
            return yield Promise.all(e.map(({ uid: e, url: n }) => g(e, n, t))).then((e) =>
              p(function* () {
                return yield ((t = e),
                p(function* () {
                  const e = {};
                  for (const n of (function (e) {
                    return e.filter((e) => {
                      var t;
                      return (
                        e &&
                        (null == e || null === (t = e.panels) || void 0 === t ? void 0 : t.length)
                      );
                    });
                  })(t))
                    for (const t of v(n.panels))
                      yield S(
                        t.targets,
                        n.title || `Dashboard ${n.uid}`,
                        n.uid || "unknown",
                        n.url,
                        e,
                      );
                  return e;
                })());
                var t;
              })(),
            );
          } catch (e) {
            const t = "string" == typeof e ? new Error(e) : e;
            return (a.v.error(t, { message: "Failed to fetch dashboard metrics" }), {});
          }
        })();
      }
      function v(e) {
        return e.filter((e) => {
          var t;
          return (
            (0, u.aQ)(e.datasource) &&
            "targets" in e &&
            (null === (t = e.targets) || void 0 === t ? void 0 : t.length)
          );
        });
      }
      function S(e, t, n, r, a) {
        for (const o of e) {
          const e = "string" == typeof o.expr ? o.expr : "",
            s = (0, i.M)(e);
          for (const e of s) w(e, t, n, r, a);
        }
      }
      function w(e, t, n, r, a) {
        var i;
        (a[e] || (a[e] = { usageType: "dashboard-usage", count: 0, dashboards: {} }),
        a[e].count++,
        "dashboard-usage" === a[e].usageType) &&
          (a[e].dashboards[t] = {
            count:
              ((null === (i = a[e].dashboards[t]) || void 0 === i ? void 0 : i.count) || 0) + 1,
            uid: n || "unknown",
            url: r,
          });
      }
      const O = new Set(["dashboard-usage", "alerting-usage"]),
        E = (e) => O.has(e);
      class x {
        getUsageMetrics(e) {
          return this._usageState[e].metrics && Object.keys(this._usageState[e].metrics).length > 0
            ? Promise.resolve(this._usageState[e].metrics)
            : (this._usageState[e].metricsPromise ||
                (this._usageState[e].metricsPromise = this._usageState[e]
                  .fetcher()
                  .then(
                    (t) => (
                      (this._usageState[e].metrics = t),
                      (this._usageState[e].metricsPromise = void 0),
                      t
                    ),
                  )),
              this._usageState[e].metricsPromise);
        }
        getUsageForMetric(e, t) {
          return this.getUsageMetrics(t).then((t) => {
            var n, r;
            return null !== (r = null === (n = t[e]) || void 0 === n ? void 0 : n.count) &&
              void 0 !== r
              ? r
              : 0;
          });
        }
        getUsageDetailsForMetric(e, t) {
          return this.getUsageMetrics(t).then((n) => {
            var r;
            return null !== (r = n[e]) && void 0 !== r
              ? r
              : "dashboard-usage" === t
                ? { usageType: "dashboard-usage", count: 0, dashboards: {} }
                : { usageType: "alerting-usage", count: 0 };
          });
        }
        constructor() {
          var e, t, n;
          ((n = {
            "dashboard-usage": { metrics: {}, metricsPromise: void 0, fetcher: y },
            "alerting-usage": { metrics: {}, metricsPromise: void 0, fetcher: l },
          }),
            (t = "_usageState") in (e = this)
              ? Object.defineProperty(e, t, {
                  value: n,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                })
              : (e[t] = n));
        }
      }
    },
    6503: (e, t, n) => {
      n.d(t, { _: () => u });
      var r = n(2007),
        a = n(5959),
        i = n.n(a),
        o = n(1522),
        s = n(8705);
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
      function c(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      function u({ severity: e, title: t, message: n, error: a, errorContext: u, children: d }) {
        let p;
        return (
          a &&
            ((p = (0, o.U)(a, "Unknown error!")),
            s.v.error(
              p,
              c(
                (function (e) {
                  for (var t = 1; t < arguments.length; t++) {
                    var n = null != arguments[t] ? arguments[t] : {},
                      r = Object.keys(n);
                    ("function" == typeof Object.getOwnPropertySymbols &&
                      (r = r.concat(
                        Object.getOwnPropertySymbols(n).filter(function (e) {
                          return Object.getOwnPropertyDescriptor(n, e).enumerable;
                        }),
                      )),
                      r.forEach(function (t) {
                        l(e, t, n[t]);
                      }));
                  }
                  return e;
                })({}, p.cause || {}, u),
                { bannerTitle: t },
              ),
            )),
          i().createElement(
            r.Alert,
            { title: t, severity: e },
            p &&
              i().createElement(
                i().Fragment,
                null,
                (function (e) {
                  const t = e.message || e.toString(),
                    n = [];
                  return (
                    e.statusText && n.push(e.statusText),
                    e.status && n.push(`HTTP ${e.status}`),
                    n.length ? `${t} (${n.join(" - ")})` : t
                  );
                })(p),
                i().createElement("br", null),
              ),
            n,
            d,
          )
        );
      }
    },
    6773: (e, t, n) => {
      n.d(t, { F: () => p });
      var r = n(6089),
        a = n(3014),
        i = n(2007),
        o = n(5959),
        s = n.n(o),
        l = n(1233),
        c = n(5693),
        u = n(5622);
      function d(e, t, n) {
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
      class p extends a.SceneObjectBase {
        constructor({ metric: e, disabled: t }) {
          var n;
          const r = c.x.getItem(l.V.METRIC_PREFS) || {};
          (super({
            metric: e,
            disabled: void 0 !== t && t,
            isAlreadyConfigured: Boolean(
              null === (n = r[e.name]) || void 0 === n ? void 0 : n.config,
            ),
          }),
            d(this, "onClick", () => {
              this.publishEvent(new u.H({ metric: this.state.metric }), !0);
            }));
        }
      }
      d(p, "Component", ({ model: e }) => {
        const t = (0, i.useStyles2)(m),
          { isAlreadyConfigured: n, disabled: a } = e.useState(),
          o = n ? "Reconfigure Prometheus function" : "Configure Prometheus function";
        return s().createElement(i.Button, {
          className: (0, r.cx)(t.selectButton, n && t.active),
          "aria-label": o,
          variant: "secondary",
          size: "sm",
          fill: "text",
          onClick: e.onClick,
          icon: "cog",
          tooltip: o,
          tooltipPlacement: "top",
          disabled: a,
          "data-testid": "configure-panel",
        });
      });
      const m = (e) => ({
        selectButton: r.css`
    padding: 0;
  `,
        active: r.css`
    color: ${e.colors.text.maxContrast};
  `,
      });
    },
    7014: (e, t, n) => {
      n.d(t, { q: () => a });
      var r = n(8162);
      const a = new Map([
        ...["avg", "sum", "stddev", "quantile", "min", "max", "count"].map((e) => [
          e,
          { name: e, fn: (t) => r.GH[e](t) },
        ]),
        [
          "histogram_quantile",
          {
            name: "histogram_quantile",
            fn: ({ expr: e, parameter: t }) => `histogram_quantile(${t},${e})`,
          },
        ],
        ["time-avg(metric)", { name: "time-avg(metric)", fn: ({ expr: e }) => `time()-avg(${e})` }],
        ["time-min(metric)", { name: "time-min(metric)", fn: ({ expr: e }) => `time()-min(${e})` }],
        ["time-max(metric)", { name: "time-max(metric)", fn: ({ expr: e }) => `time()-max(${e})` }],
      ]);
    },
    7042: (e, t, n) => {
      n.d(t, { d: () => o });
      var r = n(1932),
        a = n(8162),
        i = n(1419);
      function o(e) {
        const {
            metric: t,
            labelMatchers: n = [],
            addIgnoreUsageFilter: o = !0,
            addExtremeValuesFiltering: s = !1,
          } = e,
          l = n.map((e) => ({ label: (0, r.Nc)(e.key), operator: e.operator, value: e.value }));
        o && l.push({ label: "__ignore_usage__", operator: a.md.equal, value: "" });
        const c = !(0, r.Rq)(t.name);
        (c && l.push({ label: (0, r.Nc)(t.name), operator: a.md.equal, value: "__REMOVE__" }),
          l.push({ label: `\${${i.Ao}:raw}`, operator: a.md.equal, value: "__REMOVE__" }));
        const u = (function (e) {
          return e.toString().replaceAll('="__REMOVE__"', "");
        })(
          new a.r4({
            metric: c ? "" : t.name,
            values: {},
            defaultOperator: a.md.equal,
            defaultSelectors: l,
          }),
        );
        return s ? a.GH.and({ left: u, right: `${u} > -Inf` }) : u;
      }
    },
    7145: (e, t, n) => {
      n.d(t, { k: () => s });
      var r = n(3014),
        a = n(3241),
        i = n(1251);
      function o(e, t, n) {
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
      class s {
        setInitOptions(e) {
          this.initOptions = (0, a.cloneDeep)(e);
        }
        getFilters() {
          return this.filters;
        }
        static getFilteredOptions(e, t) {
          let n = e;
          return (
            t.categories.length > 0 && (n = s.applyCategoryFilters(n, t.categories)),
            t.prefixes.length > 0 && (n = s.applyPrefixFilters(n, t.prefixes)),
            t.suffixes.length > 0 && (n = s.applySuffixFilters(n, t.suffixes)),
            t.names.length > 0 && (n = s.applyNameFilters(n, t.names)),
            n
          );
        }
        applyFilters(e = this.filters, t = { forceUpdate: !1, notify: !0 }) {
          const n = (function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = null != arguments[t] ? arguments[t] : {},
                r = Object.keys(n);
              ("function" == typeof Object.getOwnPropertySymbols &&
                (r = r.concat(
                  Object.getOwnPropertySymbols(n).filter(function (e) {
                    return Object.getOwnPropertyDescriptor(n, e).enumerable;
                  }),
                )),
                r.forEach(function (t) {
                  o(e, t, n[t]);
                }));
            }
            return e;
          })({}, this.filters, e);
          if (!t.forceUpdate && (0, a.isEqual)(this.filters, n)) return;
          if (!(n.categories.length || n.prefixes.length || n.suffixes.length || n.names.length))
            return (
              (this.filters = n),
              this.variable.setState({ options: this.initOptions }),
              void (t.notify && this.notifyUpdate())
            );
          this.filters = n;
          const r = s.getFilteredOptions(this.initOptions, this.filters);
          (this.variable.setState({ options: r }), t.notify && this.notifyUpdate());
        }
        static applyCategoryFilters(e, t) {
          let n = [];
          for (const r of t) {
            const t = s.buildRegex(r, "i");
            n = n.concat(e.filter((e) => t.test(e.value)));
          }
          return n;
        }
        static applyPrefixFilters(e, t) {
          const n = t
              .map((e) => {
                if (e.includes(i._)) {
                  const [t, n] = e.split(i._);
                  return `^${t}[^a-z0-9]${n}([^a-z0-9]|$)`;
                }
                return e.includes("|")
                  ? `${e
                      .split("|")
                      .map((e) => `^${e}([^a-z0-9]|$)`)
                      .join("|")}`
                  : `^${e}([^a-z0-9]|$)`;
              })
              .join("|"),
            r = s.buildRegex(`(${n})`);
          return e.filter((e) => r.test(e.value));
        }
        static applySuffixFilters(e, t) {
          const n = t
              .map((e) =>
                e.includes("|")
                  ? `${e
                      .split("|")
                      .map((e) => `(^|[^a-z0-9])${e}$`)
                      .join("|")}`
                  : `(^|[^a-z0-9])${e}$`,
              )
              .join("|"),
            r = s.buildRegex(`(${n})`);
          return e.filter((e) => r.test(e.value));
        }
        static applyNameFilters(e, t) {
          const [n] = t,
            r = n
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
              .map((e) => {
                try {
                  return new RegExp(e);
                } catch (e) {
                  return null;
                }
              })
              .filter(Boolean);
          return e.filter((e) => r.some((t) => t.test(e.value)));
        }
        static buildRegex(e, t) {
          try {
            return new RegExp(e, t);
          } catch (e) {
            return new RegExp(".*");
          }
        }
        notifyUpdate() {
          this.variable.publishEvent(new r.SceneVariableValueChangedEvent(this.variable), !0);
        }
        constructor(e) {
          (o(this, "variable", void 0),
            o(this, "initOptions", []),
            o(this, "filters", { categories: [], prefixes: [], suffixes: [], names: [] }),
            (this.variable = e));
        }
      }
    },
    7291: (e, t, n) => {
      n.d(t, { E: () => i, N: () => a });
      var r = n(7781);
      const a =
          (null === r.PluginExtensionExposedComponents ||
          void 0 === r.PluginExtensionExposedComponents
            ? void 0
            : r.PluginExtensionExposedComponents.AddToDashboardFormV1) ||
          "grafana/add-to-dashboard-form/v1",
        i = "Add to dashboard";
    },
    7401: (e, t, n) => {
      n.d(t, { q: () => p, R: () => m });
      var r = n(8531),
        a = n(3014),
        i = n(2388),
        o = n(4440),
        s = n(1419);
      const l = {
        "11.6.x": function (e) {
          const t = e.languageProvider;
          return "function" == typeof t.fetchLabelValues && 1 === t.fetchLabelValues.length;
        },
        "12.0.0": function (e) {
          const t = e.languageProvider;
          return "function" == typeof t.fetchLabelValues && t.fetchLabelValues.length > 1;
        },
        "12.1.0-plus": function (e) {
          return "function" == typeof e.languageProvider.queryLabelKeys;
        },
      };
      function c(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function u(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              c(i, r, a, o, s, "next", e);
            }
            function s(e) {
              c(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
      }
      function d(e, t, n) {
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
      class p {
        getRuntimeDatasource() {
          return u(function* () {
            if (!this.datasource) {
              const e = yield (0, r.getDataSourceSrv)().get(s.gR, {
                __sceneObject: { value: this.trail },
              });
              this.datasource = (0, o.aQ)(e) ? e : void 0;
            }
            return this.datasource;
          }).call(this);
        }
        init() {
          ((this.initialized = !0), this.reset());
        }
        reset() {
          this.initialized &&
            ((this.datasource = void 0),
            (this.cache = { metadata: new Map() }),
            this.fetchMetricsMetadata().catch(() => {}));
        }
        getMetadataForMetric(e) {
          return u(function* () {
            if (this.cache.metadata.has(e)) return this.cache.metadata.get(e);
            const t = yield this.getRuntimeDatasource();
            if (!t) return;
            let n;
            try {
              const a = yield t.languageProvider.request(`/api/v1/metadata?metric=${e}`);
              var r;
              if (a && "object" == typeof a)
                n = null === (r = a[e]) || void 0 === r ? void 0 : r[0];
            } catch (t) {
              (0, i.HA)([`Error while fetching ${e} metadata!`, t.toString()]);
            }
            return (n && this.cache.metadata.set(e, n), n);
          }).call(this);
        }
        fetchMetricsMetadata() {
          return u(function* () {
            const e = yield this.getRuntimeDatasource();
            if (!e) return;
            const t = (function (e) {
              if (l["12.1.0-plus"](e)) return e.languageProvider.queryMetricsMetadata;
              if (l["12.0.0"](e) || l["11.6.x"](e))
                return () => Promise.resolve(e.languageProvider.metricsMetadata);
              throw new Error("Unsupported language provider version");
            })(e);
            let n = yield t();
            if (!n) {
              const r = (function (e, t) {
                if (l["12.1.0-plus"](e)) return e.languageProvider.retrieveMetricsMetadata;
                if (l["12.0.0"](e) || l["11.6.x"](e))
                  return () => {
                    var n, r, a;
                    return (
                      null !==
                        (a =
                          null === (n = (r = e.languageProvider).loadMetricsMetadata) ||
                          void 0 === n
                            ? void 0
                            : n.call(r)) && void 0 !== a
                        ? a
                        : Promise.resolve()
                    ).then(() => t());
                  };
                throw new Error("Unsupported language provider version");
              })(e, t);
              n = yield r();
            }
            if (n) for (const [e, t] of Object.entries(n)) this.cache.metadata.set(e, t);
          }).call(this);
        }
        fetchRecentMetrics(e) {
          return u(function* ({ interval: e, extraFilter: t }) {
            const n = yield this.getRuntimeDatasource();
            if (!n) return [];
            const r = ['__name__!=""', t, a.sceneGraph.interpolate(this.trail, s.ui)]
                .filter(Boolean)
                .join(","),
              i = `group by (__name__) ({${r}}) unless (group by (__name__) ({${r}} offset ${e}))`,
              o = yield n.languageProvider.request(`/api/v1/query?query=${i}`);
            if (!Array.isArray(null == o ? void 0 : o.result))
              throw new Error(
                "The query to search for recent metrics timed out or failed. Try a shorter time interval and/or add label filters to narrow the search.",
              );
            return o.result.map(({ metric: e }) => e.__name__);
          }).apply(this, arguments);
        }
        getTagKeys(e) {
          return u(function* () {
            const t = yield this.getRuntimeDatasource();
            if (!t) return [];
            return yield t.getTagKeys(e);
          }).call(this);
        }
        getTagValues(e) {
          return u(function* () {
            const t = yield this.getRuntimeDatasource();
            if (!t) return [];
            e.key = (function (e) {
              if (
                "" === e ||
                !(function (e) {
                  return /^".*"$/.test(e);
                })(e)
              )
                return e;
              return e.slice(1, -1);
            })(e.key);
            return yield t.getTagValues(e);
          }).call(this);
        }
        static fetchLabels(e) {
          const { timeRange: t, matcher: n } = e,
            r = e.ds;
          if (l["12.1.0-plus"](r)) return r.languageProvider.queryLabelKeys(t, n);
          if (l["12.0.0"](r))
            return r.languageProvider.fetchLabelsWithMatch(t, n).then((e) => Object.keys(e));
          if (l["11.6.x"](r))
            return r.languageProvider.fetchLabelsWithMatch(n).then((e) => Object.keys(e));
          throw new Error("Unsupported language provider version");
        }
        static fetchLabelValues(e) {
          const { labelName: t, timeRange: n, matcher: r = "" } = e,
            a = e.ds;
          if (l["12.1.0-plus"](a)) return a.languageProvider.queryLabelValues(n, t, r);
          if (l["12.0.0"](a)) {
            return (
              r
                ? a.languageProvider.fetchSeriesValuesWithMatch
                : a.languageProvider.fetchLabelValues
            )(n, t, r);
          }
          if (l["11.6.x"](a)) {
            return (
              r
                ? a.languageProvider.fetchSeriesValuesWithMatch
                : a.languageProvider.fetchLabelValues
            )(t, r);
          }
          throw new Error("Unsupported language provider version");
        }
        static getPrometheusDataSourceForScene(e) {
          return u(function* () {
            try {
              const n = a.sceneGraph.findByKey(e, s.EY);
              var t;
              const i = null !== (t = null == n ? void 0 : n.state.value) && void 0 !== t ? t : "";
              return yield (0, r.getDataSourceSrv)().get({ uid: i });
            } catch (e) {
              return void (0, i.jx)(e, ["Error while getting the Prometheus data source!"]);
            }
          })();
        }
        getPrometheusBuildInfo() {
          return u(function* () {
            const e = yield this.getRuntimeDatasource();
            if (!e) return;
            const t = yield e.languageProvider.request("/api/v1/status/buildinfo");
            return (
              t.application ||
                ((t.application = "Prometheus"),
                (t.repository = "https://github.com/prometheus/prometheus")),
              t.buildDate &&
                (t.buildDate = t.buildDate.replace(/(\d{4})(\d{2})(\d{2})(.+)/, "$1-$2-$3")),
              t
            );
          }).call(this);
        }
        constructor(e) {
          (d(this, "initialized", !1),
            d(this, "trail", void 0),
            d(this, "datasource", void 0),
            d(this, "cache", { metadata: new Map() }),
            (this.trail = e));
        }
      }
      function m(e) {
        if (!e) return;
        const { type: t, help: n, unit: r } = e;
        return [n, t && `**Type:** *${t}*`, r && `**Unit:** ${r}`].join("\n\n");
      }
    },
    7561: (e, t, n) => {
      n.d(t, { H: () => l });
      var r = n(1932),
        a = n(8162),
        i = n(7042),
        o = n(7014),
        s = n(4299);
      function l(e) {
        const { metric: t, queryConfig: n } = e,
          r = (0, i.d)({
            metric: t,
            labelMatchers: n.labelMatchers,
            addIgnoreUsageFilter: n.addIgnoreUsageFilter,
            addExtremeValuesFiltering: n.addExtremeValuesFiltering,
          }),
          o = "counter" === t.type,
          l = o ? a.GH.rate({ expr: r, interval: "$__rate_interval" }) : r;
        return {
          isRateQuery: o,
          maxDataPoints: n.resolution === s.I.HIGH ? 500 : 250,
          queries: n.groupBy
            ? c({ metric: t, queryConfig: n, expr: l })
            : u({ metric: t, queryConfig: n, expr: l }),
        };
      }
      function c({ metric: e, queryConfig: t, expr: n }) {
        let i = "avg";
        "counter" === e.type ? (i = "sum") : "info" === e.type && (i = "count");
        const o = (0, r.Nc)(t.groupBy);
        return [
          {
            refId: `${e.name}-by-${t.groupBy}`,
            expr: a.GH[i]({ expr: n, by: [o] }),
            legendFormat: `{{${o}}}`,
            fromExploreMetrics: !0,
          },
        ];
      }
      function u({ metric: e, queryConfig: t, expr: n }) {
        var r;
        let a = "avg";
        "counter" === e.type ? (a = "sum") : "info" === e.type && (a = "count");
        const i = (null === (r = t.queries) || void 0 === r ? void 0 : r.length)
            ? t.queries
            : [{ fn: a }],
          s = [];
        for (const { fn: t } of i) {
          const r = o.q.get(t),
            a = r.fn({ expr: n }),
            i = "counter" === e.type ? `${r.name}(rate)` : r.name;
          s.push({ refId: `${e.name}-${i}`, expr: a, legendFormat: i, fromExploreMetrics: !0 });
        }
        return s;
      }
    },
    7616: (e, t, n) => {
      n.d(t, {
        mc: () => Ze,
        Vy: () => at,
        aO: () => rt,
        Co: () => st,
        Ui: () => ot,
        kj: () => Xe,
        xi: () => et,
        ef: () => Je,
        fZ: () => it,
      });
      var r = n(8531),
        a = n(3014),
        i = n(8705),
        o = n(1419),
        s = n(7781),
        l = n(6089),
        c = n(1932),
        u = n(2007),
        d = n(5959),
        p = n.n(d),
        m = n(5935);
      function h() {
        (0, m.z)("give_feedback_clicked", {});
      }
      const f = () => {
          const e = (0, u.useStyles2)(b);
          return p().createElement(
            "div",
            { className: e.wrapper },
            p().createElement(
              "a",
              {
                href: "https://forms.gle/dKHDM4GDXVYPny3L6",
                className: e.feedback,
                title: "Share your thoughts about Metrics in Grafana.",
                target: "_blank",
                rel: "noreferrer noopener",
                onClick: h,
              },
              p().createElement(u.Icon, { name: "comment-alt-message" }),
              " Give feedback",
            ),
          );
        },
        b = (e) => ({
          wrapper: (0, l.css)({ position: "absolute", top: 0, right: 0 }),
          feedback: (0, l.css)({
            color: e.colors.text.secondary,
            fontSize: e.typography.bodySmall.fontSize,
            "&:hover": { color: e.colors.text.link },
          }),
        });
      function g(e, t, n) {
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
      function y(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              g(e, t, n[t]);
            }));
        }
        return e;
      }
      function v(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class S extends a.SceneObjectBase {
        constructor(e) {
          (super(y({ key: "drawer", isOpen: !1 }, e)),
            g(this, "open", ({ title: e, subTitle: t, body: n }) => {
              this.setState(v(y({}, this.state), { isOpen: !0, title: e, subTitle: t, body: n }));
            }),
            g(this, "close", () => {
              this.setState({ isOpen: !1 });
            }));
        }
      }
      g(S, "Component", ({ model: e }) => {
        const { isOpen: t, title: n, subTitle: r, body: a } = e.useState();
        return p().createElement(
          p().Fragment,
          null,
          a &&
            t &&
            p().createElement(
              u.Drawer,
              { size: "lg", title: n, subtitle: r, closeOnMaskClick: !0, onClose: e.close },
              p().createElement(a.Component, { model: a }),
            ),
        );
      });
      var w = n(2388);
      var O = n(9564),
        E = n(1571),
        x = n(5333),
        k = n(9694),
        C = n(5665),
        P = n(578),
        j = n(7291),
        _ = n(3740),
        T = n(3241),
        I = n(2639),
        A = n(9226),
        D = n(917),
        B = n(5114),
        M = n(3632);
      const N = {
          [M.i.TIMESERIES_AGE_TIME_MINUS_AVG]: {
            id: M.i.TIMESERIES_AGE_TIME_MINUS_AVG,
            name: "Average age",
            panelOptions: {
              type: "timeseries",
              description:
                'Suitable only for metrics that store unix timestamps (usually containing "timestamp_seconds" in their name) to calculate an average age. Calculates the age by subtracting the average timestamp value from current time.',
            },
            queryOptions: { queries: [{ fn: "time-avg(metric)" }] },
          },
          [M.i.TIMESERIES_AGE_TIME_MINUS_MIN_MAX]: {
            id: M.i.TIMESERIES_AGE_TIME_MINUS_MIN_MAX,
            name: "Minimum and maximum ages",
            panelOptions: {
              type: "timeseries",
              description:
                'Suitable only for metrics that store unix timestamps (usually containing "timestamp_seconds" in their name) to calculate a minimum and a maximum age. Calculates the ages by subtracting the min and the max timestamp values from current time.',
            },
            queryOptions: { queries: [{ fn: "time-min(metric)" }, { fn: "time-max(metric)" }] },
          },
        },
        L = {
          [M.i.HISTOGRAM_HEATMAP]: {
            id: M.i.HISTOGRAM_HEATMAP,
            name: "Heatmap (default)",
            panelOptions: {
              type: "heatmap",
              description:
                "Visualizes the full distribution of histogram data over time using color intensity. Perfect for spotting patterns, identifying performance degradation, and understanding latency distribution changes. Shows density of values across different buckets.",
            },
            queryOptions: { queries: [] },
          },
          [M.i.HISTOGRAM_PERCENTILES]: {
            id: M.i.HISTOGRAM_PERCENTILES,
            name: "Percentiles",
            panelOptions: {
              type: "percentiles",
              description:
                "Extracts specific percentile values from histogram data. Essential for SLA monitoring and performance analysis, showing how response times or other metrics behave for different user experience tiers.",
            },
            queryOptions: {
              queries: [{ fn: "histogram_quantile", params: { percentiles: [99, 90, 50] } }],
            },
          },
        },
        R = {
          [M.i.TIMESERIES_COUNT]: {
            id: M.i.TIMESERIES_COUNT,
            name: "Count",
            panelOptions: {
              type: "timeseries",
              description:
                "Counts how many time series emit this info metric. Useful for validating presence of instances and tracking metadata changes (e.g. version rollouts). Combine with a group by label (such as version or instance) to see the breakdown.",
            },
            queryOptions: { queries: [{ fn: "count" }] },
          },
        },
        $ = {
          [M.i.STATUS_UPDOWN_HISTORY]: {
            id: M.i.STATUS_UPDOWN_HISTORY,
            name: "Status History (default)",
            panelOptions: {
              type: "statushistory",
              description:
                "Displays binary status changes over time as colored bars (green=up, red=down). Perfect for monitoring service availability, health checks, or any binary state metrics. Shows patterns in uptime/downtime and helps identify recurring issues.",
            },
            queryOptions: { queries: [{ fn: "min" }] },
          },
          [M.i.STATUS_UPDOWN_STAT]: {
            id: M.i.STATUS_UPDOWN_STAT,
            name: "Stat with latest value",
            panelOptions: {
              type: "stat",
              description:
                'Shows the current status as a single value display with color coding (green=up, red=down). Ideal for dashboards where you need an at-a-glance view of service health or binary state. Uses minimum value to ensure any "down" status is highlighted.',
            },
            queryOptions: { queries: [{ fn: "min" }] },
          },
        };
      function V(e, t, n) {
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
      function F(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              V(e, t, n[t]);
            }));
        }
        return e;
      }
      function G(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      const q = {
          [M.i.TIMESERIES_AVG]: {
            id: M.i.TIMESERIES_AVG,
            name: "Average (default)",
            panelOptions: {
              type: "timeseries",
              description:
                "Shows the average value across all time series. Ideal for understanding typical behavior and smoothing out variations between different targets. For rate queries, displays average throughput per target.",
            },
            queryOptions: { queries: [{ fn: "avg" }] },
          },
          [M.i.TIMESERIES_SUM]: {
            id: M.i.TIMESERIES_SUM,
            name: "Sum",
            panelOptions: {
              type: "timeseries",
              description:
                "Aggregates total values across all time series. Perfect for measuring overall system throughput, total resource consumption, or fleet-wide capacity. Essential for rate queries showing total request rates.",
            },
            queryOptions: { queries: [{ fn: "sum" }] },
          },
          [M.i.TIMESERIES_STDDEV]: {
            id: M.i.TIMESERIES_STDDEV,
            name: "Standard deviation",
            panelOptions: {
              type: "timeseries",
              description:
                "Measures variability and consistency across time series. High values indicate uneven load distribution or inconsistent behavior. Useful for detecting load balancing issues or identifying when some targets behave differently.",
            },
            queryOptions: { queries: [{ fn: "stddev" }] },
          },
          [M.i.TIMESERIES_PERCENTILES]: {
            id: M.i.TIMESERIES_PERCENTILES,
            name: "Percentiles",
            panelOptions: {
              type: "percentiles",
              description:
                "Displays percentiles to show value distribution. Excellent for SLA monitoring and understanding outlier behavior without being skewed by extreme values. Critical for performance analysis.",
            },
            queryOptions: { queries: [{ fn: "quantile", params: { percentiles: [99, 90, 50] } }] },
          },
          [M.i.TIMESERIES_MIN_MAX]: {
            id: M.i.TIMESERIES_MIN_MAX,
            name: "Minimum and maximum",
            panelOptions: {
              type: "timeseries",
              description:
                "Shows the range between lowest and highest values across time series. Useful for capacity planning, identifying idle resources (min), and spotting overloaded targets (max). Helps detect outliers and resource utilization patterns.",
            },
            queryOptions: { queries: [{ fn: "min" }, { fn: "max" }] },
          },
        },
        U = {
          [M.i.TIMESERIES_SUM]: G(F({}, q[M.i.TIMESERIES_SUM]), {
            name: "Sum (default)",
            id: M.i.TIMESERIES_SUM,
          }),
          [M.i.TIMESERIES_AVG]: G(F({}, q[M.i.TIMESERIES_AVG]), { name: "Average" }),
          [M.i.TIMESERIES_STDDEV]: q[M.i.TIMESERIES_STDDEV],
          [M.i.TIMESERIES_PERCENTILES]: q[M.i.TIMESERIES_PERCENTILES],
          [M.i.TIMESERIES_MIN_MAX]: q[M.i.TIMESERIES_MIN_MAX],
        };
      function H(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function z(e, t) {
        return ((n = function* () {
          switch (yield (0, B.B)(e, t)) {
            case "counter":
              return Object.values(U);
            case "classic-histogram":
            case "native-histogram":
              return Object.values(L);
            case "age":
              return [Object.values(q)[0], ...Object.values(N)];
            case "status-updown":
              return Object.values($);
            case "info":
              return Object.values(R);
            default:
              return Object.values(q);
          }
        }),
        function () {
          var e = this,
            t = arguments;
          return new Promise(function (r, a) {
            var i = n.apply(e, t);
            function o(e) {
              H(i, r, a, o, s, "next", e);
            }
            function s(e) {
              H(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        })();
        var n;
      }
      var K,
        W,
        Q,
        Y = n(4758),
        X = n(1233),
        Z = n(5693);
      class J extends s.BusEventWithPayload {}
      ((Q = "apply-panel-config"),
        (W = "type") in (K = J)
          ? Object.defineProperty(K, W, {
              value: Q,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (K[W] = Q));
      class ee extends s.BusEventWithPayload {}
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })(ee, "type", "cancel-configure-panel");
      const te = [
        { value: 99, label: "P99" },
        { value: 95, label: "P95" },
        { value: 90, label: "P90" },
        { value: 75, label: "P75" },
        { value: 50, label: "P50" },
      ];
      function ne(e, t, n) {
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
      function re(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class ae extends a.SceneObjectBase {
        onActivate() {
          this.initPercentilesParams();
        }
        initPercentilesParams() {
          var e, t, n;
          const r = this.state.body.state.queryConfig,
            a = new Set(
              (null === (n = r.queries) ||
              void 0 === n ||
              null ===
                (t = n.find((e) => {
                  var t;
                  return null === (t = e.params) || void 0 === t ? void 0 : t.percentiles;
                })) ||
              void 0 === t ||
              null === (e = t.params) ||
              void 0 === e
                ? void 0
                : e.percentiles) || [],
            ),
            i =
              a.size > 0
                ? te.map((e) =>
                    re(
                      (function (e) {
                        for (var t = 1; t < arguments.length; t++) {
                          var n = null != arguments[t] ? arguments[t] : {},
                            r = Object.keys(n);
                          ("function" == typeof Object.getOwnPropertySymbols &&
                            (r = r.concat(
                              Object.getOwnPropertySymbols(n).filter(function (e) {
                                return Object.getOwnPropertyDescriptor(n, e).enumerable;
                              }),
                            )),
                            r.forEach(function (t) {
                              ne(e, t, n[t]);
                            }));
                        }
                        return e;
                      })({}, e),
                      { checked: a.has(e.value) },
                    ),
                  )
                : [];
          this.setState({ queryParams: { show: i.length > 0, options: i } });
        }
        constructor({ body: e, presetId: t, isSelected: n, onSelect: r }) {
          (super({
            presetId: t,
            body: e,
            isSelected: n,
            onSelect: r,
            queryParams: { show: !1, options: [] },
          }),
            ne(this, "onTogglePercentile", (e) => {
              var t;
              const { queryParams: n, body: r } = this.state,
                a = Number(e.target.value),
                i = n.options.find((e) => e.value === a);
              if (!i) return;
              i.checked = !i.checked;
              const o = n.options.filter((e) => e.checked);
              if (!o.length) return;
              const s = (0, T.cloneDeep)(r.state.queryConfig);
              (null === (t = s.queries) ||
                void 0 === t ||
                t.some((e) => {
                  var t;
                  return (
                    !!(null === (t = e.params) || void 0 === t ? void 0 : t.percentiles) &&
                    ((e.params.percentiles = o.map((e) => e.value)), !0)
                  );
                }),
                r.update({}, s),
                this.setState({ queryParams: n }));
            }),
            ne(this, "onClickPreset", () => {
              this.state.onSelect(this.state.presetId);
            }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function ie(e) {
        return {
          container: l.css`
      display: flex;
      flex-direction: column;
      gap: ${e.spacing(1)};
      padding: ${e.spacing(1, 1, 1.25, 1)};
      border: 1px solid transparent;
      transition: all 0.2s ease-in-out;

      &:hover {
        border: 1px solid ${e.colors.border.weak};
        border-color: ${e.colors.primary.border};
      }
      &:focus {
        border: 1px solid ${e.colors.border.weak};
        outline: 1px solid ${e.colors.primary.main};
        outline-offset: 1px;
      }
    `,
          selected: l.css`
      cursor: default;
      border: 1px solid ${e.colors.border.weak};
      border-color: ${e.colors.primary.border};
    `,
          bodyAndParams: l.css`
      display: flex;
      flex-direction: row;
      gap: ${e.spacing(1.25)};
      width: 100%;
    `,
          paramsContainer: l.css`
      margin-top: ${e.spacing(1)};
    `,
          param: l.css`
      display: flex;
      align-items: center;
      gap: ${e.spacing(0.5)};
      margin-bottom: ${e.spacing(0.5)};
      font-size: 12px;
      cursor: pointer;

      & [type='checkbox'] {
        cursor: pointer;
      }
    `,
          radioContainer: l.css`
      display: flex;
      align-items: center;
      justify-content: center;

      & [type='radio'] {
        cursor: pointer;
      }
    `,
        };
      }
      function oe(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function se(e, t, n) {
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
      function le(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              se(e, t, n[t]);
            }));
        }
        return e;
      }
      function ce(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      ne(ae, "Component", ({ model: e }) => {
        const t = (0, u.useStyles2)(ie),
          { body: n, isSelected: r, queryParams: a } = e.useState(),
          i = !r,
          o = i
            ? (t) => {
                ("Enter" !== t.key && " " !== t.key) || (t.preventDefault(), e.onClickPreset());
              }
            : void 0;
        return p().createElement(
          "div",
          {
            className: (0, l.cx)(t.container, r && t.selected),
            onClick: i ? e.onClickPreset : void 0,
            onKeyDown: o,
            role: i ? "button" : void 0,
            tabIndex: i ? 0 : void 0,
          },
          p().createElement(
            "div",
            { className: (0, l.cx)(t.bodyAndParams) },
            p().createElement(n.Component, { model: n }),
            a.show &&
              p().createElement(
                "div",
                { className: t.paramsContainer },
                a.options.map((n) =>
                  p().createElement(
                    "label",
                    {
                      key: n.value,
                      className: (0, l.cx)("param", t.param),
                      htmlFor: `checkbox-${n.value}`,
                    },
                    p().createElement("input", {
                      id: `checkbox-${n.value}`,
                      type: "checkbox",
                      value: n.value,
                      checked: n.checked,
                      onChange: e.onTogglePercentile,
                    }),
                    p().createElement("span", null, n.label),
                  ),
                ),
              ),
          ),
          p().createElement(
            "div",
            { className: t.radioContainer },
            p().createElement(
              u.Tooltip,
              {
                content: r ? "Current configuration" : "Click to select this configuration",
                placement: "top",
              },
              p().createElement("input", { type: "radio", name: "select-config", checked: r }),
            ),
          ),
        );
      });
      class ue extends a.SceneObjectBase {
        onActivate() {
          (this.syncTimeRange(), this.buildBody(), this.subscribeToEvents());
        }
        syncTimeRange() {
          const e = a.sceneGraph.getAncestor(this, Ne),
            { from: t, to: n, timeZone: r, value: i } = a.sceneGraph.getTimeRange(e).state;
          a.sceneGraph.getTimeRange(this).setState({ from: t, to: n, timeZone: r, value: i });
        }
        buildBody() {
          return ((e = function* () {
            const { metric: e } = this.state,
              t = (0, A.N)(e.name),
              n = yield z(e.name, Xe(this)),
              r = (t || n[0]).id,
              i = new a.SceneCSSGridLayout({
                templateColumns: I.MV,
                autoRows: D.N.M + 46,
                isLazy: !0,
                $behaviors: [
                  new a.behaviors.CursorSync({
                    key: "metricCrosshairSync",
                    sync: s.DashboardCursorSync.Crosshair,
                  }),
                ],
                children: n.map(
                  (n, i) =>
                    new a.SceneCSSGridItem({
                      body: new ae({
                        presetId: n.id,
                        isSelected: r === n.id,
                        onSelect: (e) => this.onSelectPreset(e),
                        body: new Y.m({
                          key: `panel-${n.id}`,
                          discardUserPrefs: n.id !== (null == t ? void 0 : t.id),
                          metric: e.name,
                          panelOptions: ce(le({}, n.panelOptions), {
                            title: n.name,
                            fixedColorIndex: i,
                            headerActions: () => [],
                          }),
                          queryOptions: n.queryOptions,
                        }),
                      }),
                    }),
                ),
              });
            this.setState({ presets: n, selectedPresetId: r, body: i });
          }),
          function () {
            var t = this,
              n = arguments;
            return new Promise(function (r, a) {
              var i = e.apply(t, n);
              function o(e) {
                oe(i, r, a, o, s, "next", e);
              }
              function s(e) {
                oe(i, r, a, o, s, "throw", e);
              }
              o(void 0);
            });
          }).call(this);
          var e;
        }
        subscribeToEvents() {
          const { metric: e } = this.state;
          this.subscribeToEvent(J, (t) => {
            const { config: n, restoreDefault: r } = t.payload,
              a = Z.x.getItem(X.V.METRIC_PREFS) || {},
              i = a[e.name];
            (r && i ? delete a[e.name].config : (a[e.name] = ce(le({}, i), { config: n })),
              Z.x.setItem(X.V.METRIC_PREFS, a));
          });
        }
        static getPanelConfigFromPreset(e) {
          return (0, T.omit)(e, ["name", "panelOptions.description"]);
        }
        constructor({ metric: e }) {
          (super({
            metric: e,
            $timeRange: new a.SceneTimeRange({}),
            controls: [new a.SceneTimePicker({}), new a.SceneRefreshPicker({})],
            isConfirmModalOpen: !1,
            presets: [],
            selectedPresetId: void 0,
            body: void 0,
          }),
            se(this, "onSelectPreset", (e) => {
              for (const t of a.sceneGraph.findDescendents(this, ae))
                t.setState({ isSelected: t.state.presetId === e });
              this.setState({ selectedPresetId: e });
            }),
            se(this, "onClickRestoreDefault", () => {
              this.setState({ isConfirmModalOpen: !0 });
            }),
            se(this, "onClickConfirmRestoreDefault", () => {
              const { metric: e, presets: t } = this.state,
                [n] = t;
              n
                ? (this.publishEvent(
                    new J({
                      metric: e,
                      config: ue.getPanelConfigFromPreset(n),
                      restoreDefault: !0,
                    }),
                    !0,
                  ),
                  this.closeConfirmModal())
                : (0, w.jx)(new Error(`No default config found for metric ${e}!`), [
                    "Cannot restore default configuration.",
                  ]);
            }),
            se(this, "closeConfirmModal", () => {
              this.setState({ isConfirmModalOpen: !1 });
            }),
            se(this, "onClickCancel", () => {
              this.publishEvent(new ee({ metric: this.state.metric }), !0);
            }),
            se(this, "onClickApplyConfig", () => {
              const { metric: e, presets: t, selectedPresetId: n } = this.state,
                r = a.sceneGraph.findByKeyAndType(this, `panel-${n}`, Y.m);
              if (!r) throw new Error(`Panel not found for preset id="${n}"!`);
              const i = t.find((e) => e.id === n);
              if (!i) throw new Error(`Preset with id="${n}" not found!`);
              const o = (0, T.cloneDeep)(i);
              ((o.queryOptions.queries = r.state.queryConfig.queries),
                this.publishEvent(
                  new J({ metric: e, config: ue.getPanelConfigFromPreset(o) }),
                  !0,
                ));
            }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function de(e) {
        return {
          controlsContainer: l.css`
      display: flex;
      justify-content: flex-end;
      gap: ${e.spacing(1)};
      margin-bottom: ${e.spacing(2)};
    `,
          messageContainer: l.css`
      margin: ${e.spacing(2.5, 0, 1, 0)};
    `,
          controls: l.css`
      display: flex;
    `,
          formButtonsContainer: l.css`
      display: flex;
      justify-content: center;
      gap: ${e.spacing(2)};
      position: sticky;
      bottom: 0;
      background: ${e.colors.background.primary};
      padding: ${e.spacing(2, 0)};
      border-top: 1px solid ${e.colors.border.weak};
    `,
        };
      }
      se(ue, "Component", ({ model: e }) => {
        const t = (0, u.useStyles2)(de),
          { metric: n, body: r, controls: a, isConfirmModalOpen: i } = e.useState();
        return p().createElement(
          "div",
          null,
          p().createElement(
            "div",
            { className: t.controlsContainer },
            p().createElement(
              u.Button,
              { variant: "secondary", size: "md", onClick: e.onClickRestoreDefault },
              "Restore default config",
            ),
            p().createElement(
              "div",
              { className: t.controls },
              a.map((e) => p().createElement(e.Component, { key: e.state.key, model: e })),
            ),
          ),
          p().createElement(
            "div",
            { className: t.messageContainer },
            p().createElement(
              "p",
              null,
              "Select a Prometheus function that will be used by default to display the ",
              n.name,
              " metric.",
            ),
          ),
          r && p().createElement(r.Component, { model: r }),
          p().createElement(
            "div",
            { className: t.formButtonsContainer },
            p().createElement(
              u.Button,
              { variant: "primary", size: "md", onClick: e.onClickApplyConfig },
              "Apply",
            ),
            p().createElement(
              u.Button,
              { variant: "secondary", size: "md", onClick: e.onClickCancel },
              "Cancel",
            ),
          ),
          p().createElement(u.ConfirmModal, {
            isOpen: i,
            title: "Restore default configuration",
            body: `Are you sure you want to restore the default configuration for the ${n} metric?`,
            confirmText: "Restore",
            onConfirm: e.onClickConfirmRestoreDefault,
            onDismiss: e.closeConfirmModal,
          }),
        );
      });
      var pe = n(5622),
        me = n(300),
        he = n(6359),
        fe = n(7791),
        be = n(396),
        ge = n(5176);
      const ye = (0, d.memo)(function ({ size: e }) {
          const t = (0, u.useStyles2)(ve);
          return p().createElement("img", {
            className: (0, l.cx)(t.logo, e),
            src: "public/plugins/grafana-metricsdrilldown-app/img/logo.svg",
            alt: "Metrics Drilldown Logo",
          });
        }),
        ve = () => ({
          logo: l.css`
    &.small {
      width: 24px;
      height: 24px;
      margin-right: 4px;
      position: relative;
      top: -2px;
    }

    &.large {
      width: 40px;
      height: 40px;
    }
  `,
        }),
        Se = ge.t,
        we = `https://github.com/grafana/metrics-drilldown/commit/${Se}`,
        { buildInfo: Oe } = r.config;
      function Ee() {
        const e = (0, u.useStyles2)(Ce),
          {
            meta: {
              info: { version: t, updated: n },
            },
          } = (0, s.usePluginContext)() || { meta: { info: { version: "?.?.?", updated: "?" } } };
        return p().createElement(
          "div",
          { className: e.menuHeader },
          p().createElement(
            "h5",
            null,
            p().createElement(ye, { size: "small" }),
            "Grafana Metrics Drilldown v",
            t,
          ),
          p().createElement("div", { className: e.subTitle }, "Last update: ", n),
        );
      }
      function xe({ getPrometheusBuildInfo: e }) {
        const t = (0, u.useStyles2)(Ce),
          n = "dev" === Se,
          r = n ? Se : Se.slice(0, 8),
          [a, o] = (0, d.useState)();
        return (
          (0, d.useEffect)(() => {
            e()
              .then((e) => o(e))
              .catch((e) => {
                (i.v.warn("Error while fetching Prometheus build info!"), i.v.warn(e), o(void 0));
              });
          }, [e]),
          p().createElement(
            u.Menu,
            { header: p().createElement(Ee, null) },
            p().createElement(u.Menu.Item, {
              label: `Commit SHA: ${r}`,
              icon: "github",
              onClick: () => window.open(we),
              disabled: n,
            }),
            p().createElement(u.Menu.Item, {
              label: "Changelog",
              icon: "list-ul",
              onClick: () =>
                window.open(
                  "https://github.com/grafana/metrics-drilldown/blob/main/CHANGELOG.md",
                  "_blank",
                  "noopener,noreferrer",
                ),
            }),
            p().createElement(u.Menu.Item, {
              label: "Contribute",
              icon: "external-link-alt",
              onClick: () =>
                window.open(
                  "https://github.com/grafana/metrics-drilldown/blob/main/docs/contributing.md",
                  "_blank",
                  "noopener,noreferrer",
                ),
            }),
            p().createElement(u.Menu.Item, {
              label: "Documentation",
              icon: "document-info",
              onClick: () =>
                window.open(
                  "https://grafana.com/docs/grafana/latest/explore/simplified-exploration/metrics",
                  "_blank",
                  "noopener,noreferrer",
                ),
            }),
            p().createElement(u.Menu.Item, {
              label: "Report an issue",
              icon: "bug",
              onClick: () =>
                window.open(
                  "https://github.com/grafana/metrics-drilldown/issues/new?template=bug_report.md",
                  "_blank",
                  "noopener,noreferrer",
                ),
            }),
            p().createElement(u.Menu.Divider, null),
            p().createElement(u.Menu.Item, {
              label: `Grafana ${Oe.edition} v${Oe.version} (${Oe.env})`,
              icon: "grafana",
              onClick: () =>
                window.open(
                  `https://github.com/grafana/grafana/commit/${Oe.commit}`,
                  "_blank",
                  "noopener,noreferrer",
                ),
            }),
            a &&
              p().createElement(u.Menu.Item, {
                className: t.promBuildInfo,
                label: `${a.application || "?"} ${a.version} ${a.buildDate ? `(${a.buildDate})` : ""}`,
                icon: "gf-prometheus",
                onClick: () =>
                  window.open(
                    `${a.repository}/commit/${a.revision}`,
                    "_blank",
                    "noopener,noreferrer",
                  ),
              }),
          )
        );
      }
      function ke({ getPrometheusBuildInfo: e }) {
        return p().createElement(
          u.Dropdown,
          {
            overlay: () => p().createElement(xe, { getPrometheusBuildInfo: e }),
            placement: "bottom-end",
          },
          p().createElement(u.Button, {
            icon: "info-circle",
            variant: "secondary",
            tooltip: "Plugin info",
            tooltipPlacement: "top",
            title: "Plugin info",
            "data-testid": "plugin-info-button",
          }),
        );
      }
      const Ce = (e) => ({
        button: l.css`
    position: relative;
    display: flex;
    align-items: center;
    width: 32px;
    height: 32px;
    line-height: 30px;
    border: 1px solid ${e.colors.border.weak};
    border-radius: 2px;
    border-left: 0;
    color: ${e.colors.text.primary};
    background: ${e.colors.background.secondary};

    &:hover {
      border-color: ${e.colors.border.medium};
      background-color: ${e.colors.background.canvas};
    }
  `,
        menuHeader: l.css`
    padding: ${e.spacing(0.5, 1)};
    white-space: nowrap;
  `,
        subTitle: l.css`
    color: ${e.colors.text.secondary};
    font-size: ${e.typography.bodySmall.fontSize};
  `,
        promBuildInfo: l.css`
    & svg {
      color: #e5502a;
    }
  `,
      });
      var Pe = n(3781);
      const je = {
        OPEN_EXPLORE_LABEL: "Open in explore",
        COPY_URL_LABEL: "Copy url",
        BOOKMARK_LABEL: "Bookmark",
        SELECT_NEW_METRIC_TOOLTIP: "Remove existing metric and choose a new metric",
      };
      function _e(e, t, n) {
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
      class Te extends a.SceneObjectBase {
        constructor(e = {}) {
          (super(
            (function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {},
                  r = Object.keys(n);
                ("function" == typeof Object.getOwnPropertySymbols &&
                  (r = r.concat(
                    Object.getOwnPropertySymbols(n).filter(function (e) {
                      return Object.getOwnPropertyDescriptor(n, e).enumerable;
                    }),
                  )),
                  r.forEach(function (t) {
                    _e(e, t, n[t]);
                  }));
              }
              return e;
            })({}, e),
          ),
            _e(this, "onSelectNewMetric", () => {
              const e = Xe(this);
              ((0, m.z)("selected_metric_action_clicked", { action: "unselect" }),
                e.publishEvent(new o.OO({})));
            }));
        }
      }
      _e(Te, "Component", ({ model: e }) => {
        const t = Xe(e),
          { embedded: n } = t.useState();
        return n
          ? p().createElement(
              u.LinkButton,
              {
                href: (0, Pe.Rk)(et(t)),
                variant: "secondary",
                icon: "arrow-right",
                tooltip: "Open in Metrics Drilldown",
                onClick: () =>
                  (0, m.z)("selected_metric_action_clicked", { action: "open_from_embedded" }),
                "data-testid": "open-metrics-drilldown-button",
              },
              "Metrics Drilldown",
            )
          : p().createElement(
              u.ToolbarButton,
              {
                variant: "canvas",
                tooltip: je.SELECT_NEW_METRIC_TOOLTIP,
                onClick: e.onSelectNewMetric,
                "data-testid": "select-new-metric-button",
              },
              "Select new metric",
            );
      });
      var Ie = n(7401),
        Ae = n(9697);
      function De(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function Be(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              De(i, r, a, o, s, "next", e);
            }
            function s(e) {
              De(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
      }
      function Me(e, t, n) {
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
      class Ne extends a.SceneObjectBase {
        getUrlState() {
          return { metric: this.state.metric };
        }
        updateFromUrl(e) {
          this.state.embedded || this.updateStateForNewMetric(e.metric || void 0);
        }
        onActivate() {
          (!(function (e) {
            try {
              for (const t of e) (0, a.registerRuntimeDataSource)({ dataSource: t });
            } catch (e) {
              const { message: t } = e;
              /A runtime data source with uid (.+) has already been registered/.test(t) ||
                (0, w.jx)(e, [
                  "Fail to register all the runtime data sources!",
                  "The application cannot work as expected, please try reloading the page or if the problem persists, contact your organization admin.",
                ]);
            }
          })([new O.J()]),
            setTimeout(() => {
              this.datasourceHelper.init();
            }, 0),
            this.updateStateForNewMetric(this.state.metric),
            this.subscribeToEvent(o.OO, (e) => this.handleMetricSelectedEvent(e)),
            this.subscribeToEvent(_.Z, (e) => {
              this.openAddToDashboardModal(e.payload.panelData);
            }),
            this.initFilters(),
            this.initConfigPrometheusFunction());
        }
        updateStateForNewMetric(e) {
          if (!this.state.topScene || e !== this.state.metric) {
            const t = [
                new a.VariableValueSelectors({ layout: "vertical" }),
                new a.SceneControlsSpacer(),
              ],
              n = e
                ? [...t, new Te(), new a.SceneTimePicker({}), new a.SceneRefreshPicker({})]
                : [...t, new a.SceneTimePicker({}), new a.SceneRefreshPicker({})];
            this.setState({
              metric: e,
              topScene: e ? new he.R({ metric: e }) : new P.m(),
              controls: n,
            });
          }
        }
        initFilters() {
          const e = a.sceneGraph.lookupVariable(o.Ao, this);
          (0, be.BE)(e) &&
            (!(function (e, t, n) {
              if (!(0, be.BE)(t)) return;
              t.setState({
                getTagKeysProvider: () =>
                  Ke(function* () {
                    var r;
                    const a = {
                      filters: t.state.filters,
                      scopes: null === (r = qe()) || void 0 === r ? void 0 : r.value,
                      queries: t.state.useQueriesAsFilterForOptions ? tt(e) : [],
                    };
                    return (
                      a.queries.length > 20 && (a.queries = []),
                      { replace: !0, values: (yield n.getTagKeys(a)).slice(0, nt) }
                    );
                  })(),
                getTagValuesProvider: (r, a) =>
                  Ke(function* () {
                    var r;
                    const i = t.state.filters.filter((e) => e.key !== a.key),
                      o = {
                        key: a.key,
                        filters: i,
                        scopes: null === (r = qe()) || void 0 === r ? void 0 : r.value,
                        queries: t.state.useQueriesAsFilterForOptions ? tt(e) : [],
                      };
                    o.queries.length > 20 && (o.queries = []);
                    return { replace: !0, values: (yield n.getTagValues(o)).slice(0, nt) };
                  })(),
              });
            })(this, e, this.datasourceHelper),
            null == e || e.setState({ useQueriesAsFilterForOptions: Boolean(this.state.metric) }),
            this.subscribeToState((e, t) => {
              if (e.metric !== t.metric) {
                const t = a.sceneGraph.lookupVariable(o.Ao, this);
                (0, be.BE)(t) && t.setState({ useQueriesAsFilterForOptions: Boolean(e.metric) });
              }
            }),
            this._subs.add(
              null == e
                ? void 0
                : e.subscribeToState((e, t) => {
                    this.disableReportFiltersInteraction ||
                      e.filters === t.filters ||
                      (0, m.h)(e.filters, t.filters);
                  }),
            ));
        }
        initConfigPrometheusFunction() {
          (this.subscribeToState((e, t) => {
            e.metric !== t.metric && this.state.drawer.close();
          }),
            this.subscribeToEvent(pe.H, (e) =>
              Be(function* () {
                const { metric: t } = e.payload;
                ((0, m.z)("configure_panel_opened", { metricType: t.type }),
                  this.state.drawer.open({
                    title: "Configure the Prometheus function",
                    subTitle: `${t.name} (${t.type})`,
                    body: new ue({ metric: t }),
                  }));
              }).call(this),
            ),
            this.subscribeToEvent(ee, () => {
              this.state.drawer.close();
            }),
            this.subscribeToEvent(J, (e) =>
              Be(function* () {
                const { metric: t, config: n, restoreDefault: r } = e.payload;
                (r
                  ? (0, m.z)("default_panel_config_restored", { metricType: t.type })
                  : (0, m.z)("panel_config_applied", { metricType: t.type, configId: n.id }),
                  this.state.drawer.close(),
                  (0, me.b)(this.state.topScene || this));
                const i = a.sceneGraph.findAllObjects(
                  this.state.topScene || this,
                  (e) =>
                    e instanceof Y.m && e.state.metric === t.name && !e.state.queryConfig.groupBy,
                );
                for (const e of i) e.update(n.panelOptions, n.queryOptions);
                (0, w.qq)([
                  `Configuration successfully ${r ? "restored" : "applied"} for metric ${t.name}!`,
                ]);
              }).call(this),
            ));
        }
        handleMetricSelectedEvent(e) {
          return Be(function* () {
            const { metric: t, urlValues: n } = e.payload;
            if (t) {
              var r;
              (0, x.VN)(t);
              const e = (
                (null === (r = new URLSearchParams(window.location.search).get("filters-prefix")) ||
                void 0 === r
                  ? void 0
                  : r.split(",").filter((e) => e)) || []
              ).filter((e) => e.includes(":"));
              (0, m.z)("metric_selected", {
                from: "metric_list",
                searchTermCount: null,
                has_hierarchical_filter: e.length > 0,
                hierarchical_filter_count: e.length,
              });
            } else a.sceneGraph.findByKeyAndType(this, C.$, C.s).fetchAllOrRecentMetrics();
            const i = a.sceneGraph.lookupVariable(o.Ao, this);
            ((0, be.BE)(i) && i.setState({ baseFilters: $e(t) }),
              this._urlSync.performBrowserHistoryAction(() => {
                if ((this.updateStateForNewMetric(t), n)) {
                  var e;
                  (null === (e = n[`var-${o.Ao}`]) || void 0 === e ? void 0 : e.length) ||
                    (n[`var-${o.Ao}`] = [""]);
                  const t = s.urlUtil.renderUrl("", n);
                  a.sceneUtils.syncStateFromSearchParams(this, new URLSearchParams(t));
                }
              }));
          }).call(this);
        }
        addFilterWithoutReportingInteraction(e) {
          const t = a.sceneGraph.lookupVariable(o.Ao, this);
          (0, be.BE)(t) &&
            ((this.disableReportFiltersInteraction = !0),
            t.setState({ filters: [...t.state.filters, e] }),
            (this.disableReportFiltersInteraction = !1));
        }
        getMetadataForMetric(e) {
          return Be(function* () {
            return this.datasourceHelper.getMetadataForMetric(e);
          }).call(this);
        }
        fetchRecentMetrics(e) {
          return Be(function* ({ interval: e, extraFilter: t }) {
            return this.datasourceHelper.fetchRecentMetrics({ interval: e, extraFilter: t });
          }).apply(this, arguments);
        }
        openAddToDashboardModal(e) {
          ((0, m.z)("add_to_dashboard_modal_opened", {}),
            this.setState({ isAddToDashboardModalOpen: !0, addToDashboardPanelData: e }));
        }
        constructor(e) {
          var t, n, r, i, s;
          (super(
            (function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {},
                  r = Object.keys(n);
                ("function" == typeof Object.getOwnPropertySymbols &&
                  (r = r.concat(
                    Object.getOwnPropertySymbols(n).filter(function (e) {
                      return Object.getOwnPropertyDescriptor(n, e).enumerable;
                    }),
                  )),
                  r.forEach(function (t) {
                    Me(e, t, n[t]);
                  }));
              }
              return e;
            })(
              {
                $timeRange:
                  null !== (n = e.$timeRange) && void 0 !== n ? n : new a.SceneTimeRange({}),
                $variables:
                  null !== (r = e.$variables) && void 0 !== r
                    ? r
                    : Le(e.initialDS, e.metric, e.initialFilters),
                controls:
                  null !== (i = e.controls) && void 0 !== i
                    ? i
                    : [
                        new a.VariableValueSelectors({ layout: "vertical" }),
                        new a.SceneControlsSpacer(),
                        new a.SceneTimePicker({}),
                        new a.SceneRefreshPicker({}),
                      ],
                createdAt: null !== (s = e.createdAt) && void 0 !== s ? s : new Date().getTime(),
                dashboardMetrics: {},
                alertingMetrics: {},
                drawer: new S({}),
                isAddToDashboardAvailable: !1,
                isAddToDashboardModalOpen: !1,
              },
              e,
            ),
          ),
            Me((t = this), "disableReportFiltersInteraction", !1),
            Me(t, "datasourceHelper", new Ie.q(t)),
            Me(
              t,
              "_variableDependency",
              new a.VariableDependencyConfig(t, {
                variableNames: [o.EY],
                onReferencedVariableValueChanged: () => {
                  t.datasourceHelper.reset();
                },
              }),
            ),
            Me(t, "_urlSync", new a.SceneObjectUrlSyncConfig(t, { keys: ["metric"] })),
            Me(t, "getPrometheusBuildInfo", () =>
              Be(function* () {
                return t.datasourceHelper.getPrometheusBuildInfo();
              })(),
            ),
            Me(t, "closeAddToDashboardModal", () => {
              t.setState({ isAddToDashboardModalOpen: !1, addToDashboardPanelData: void 0 });
            }),
            t.addActivationHandler(t.onActivate.bind(t)));
        }
      }
      function Le(e, t, n) {
        let i = [
          new Ae.i({ initialDS: e }),
          new C.s(),
          new k.P(),
          new a.AdHocFiltersVariable({
            key: o.Ao,
            name: o.Ao,
            label: "Filters",
            addFilterButtonText: "Add label",
            datasource: o.GH,
            hide: s.VariableHide.dontHide,
            layout: "combobox",
            filters: null != n ? n : [],
            baseFilters: $e(t),
            applyMode: "manual",
            allowCustomValue: !0,
            useQueriesAsFilterForOptions: !1,
            expressionBuilder: (e) =>
              e
                .filter((e) => "__name__" !== e.key)
                .map((e) => `${(0, c.Nc)(e.key)}${e.operator}"${e.value}"`)
                .join(","),
          }),
          new E.O(),
        ];
        return (
          Boolean(
            r.config.featureToggles.scopeFilters &&
              r.config.featureToggles.enableScopesInMetricsExplore &&
              !r.config.buildInfo.version.startsWith("11."),
          ) && i.unshift(new a.ScopesVariable({ enable: !0 })),
          new a.SceneVariableSet({ variables: i })
        );
      }
      function Re(e, t, n) {
        const r = (0, fe.T)(e, n);
        return {
          container: (0, l.css)({
            flexGrow: 1,
            padding: e.spacing(1, 2),
            position: "relative",
            background: r,
          }),
          body: (0, l.css)({ flexGrow: 1, minHeight: 0 }),
          controls: (0, l.css)({
            padding: e.spacing(1, 0),
            position: "sticky",
            background: r,
            zIndex: e.zIndex.navbarFixed,
            top: t,
            borderBottom: `1px solid ${e.colors.border.weak}`,
          }),
        };
      }
      function $e(e) {
        return e ? [{ key: "__name__", operator: "=", value: e }] : [];
      }
      function Ve() {
        const e = document.querySelector('[data-testid="app-controls"]');
        if (!e) return;
        const { height: t } = e.getBoundingClientRect();
        document.documentElement.style.setProperty("--app-controls-height", `${t}px`);
      }
      Me(Ne, "Component", ({ model: e }) => {
        const {
          controls: t,
          topScene: n,
          embedded: o,
          embeddedMini: s,
          drawer: l,
          isAddToDashboardModalOpen: c,
          addToDashboardPanelData: h,
        } = e.useState();
        var b;
        const g = null !== (b = (0, r.useChromeHeaderHeight)()) && void 0 !== b ? b : 0,
          y = o ? 0 : g,
          v = (0, u.useStyles2)(Re, y, e),
          { component: S, isLoading: w } = (0, r.usePluginComponent)(j.N);
        return (
          (0, d.useEffect)(() => {
            const t = !w && Boolean(S);
            (w || S || i.v.warn(`Failed to load add to dashboard component: ${j.N}`),
              e.state.isAddToDashboardAvailable !== t &&
                e.setState({ isAddToDashboardAvailable: t }));
          }, [w, S, e]),
          (0, d.useEffect)(() => {
            Ve();
            const e = document.querySelector('[data-testid="app-controls"]');
            if (!e) return;
            const t = new ResizeObserver(Ve);
            return (
              t.observe(e),
              () => {
                (t.disconnect(),
                  document.documentElement.style.removeProperty("--app-controls-height"));
              }
            );
          }, [o, t]),
          p().createElement(
            p().Fragment,
            null,
            p().createElement(
              "div",
              { className: v.container },
              p().createElement(
                u.Stack,
                { direction: "column", gap: 1, grow: 1 },
                t &&
                  !s &&
                  p().createElement(
                    "div",
                    { className: v.controls, "data-testid": "app-controls" },
                    p().createElement(
                      u.Stack,
                      { direction: "row", gap: 1, alignItems: "flex-end", wrap: "wrap" },
                      p().createElement(f, null),
                      t.map((e) => p().createElement(e.Component, { key: e.state.key, model: e })),
                      p().createElement(
                        u.Stack,
                        { direction: "row", gap: 0.5 },
                        p().createElement(ke, { getPrometheusBuildInfo: e.getPrometheusBuildInfo }),
                      ),
                    ),
                  ),
                n &&
                  (s
                    ? p().createElement(
                        "div",
                        { className: v.body },
                        p().createElement(n.Component, { model: n }),
                      )
                    : p().createElement(
                        a.UrlSyncContextProvider,
                        {
                          scene: n,
                          createBrowserHistorySteps: !0,
                          updateUrlOnInit: !0,
                          namespace: e.state.urlNamespace,
                        },
                        p().createElement(
                          "div",
                          { className: v.body },
                          p().createElement(
                            u.Stack,
                            { direction: "column", grow: 1 },
                            p().createElement(n.Component, { model: n }),
                          ),
                        ),
                      )),
              ),
            ),
            p().createElement(l.Component, { model: l }),
            c &&
              S &&
              h &&
              p().createElement(
                u.Modal,
                { title: j.E, isOpen: !0, onDismiss: e.closeAddToDashboardModal },
                (0, d.createElement)(S, {
                  onClose: e.closeAddToDashboardModal,
                  buildPanel: () => {
                    var e, t, n, r;
                    const a =
                      null !==
                        (r = String(
                          null == h ||
                            null === (n = h.panel) ||
                            void 0 === n ||
                            null === (t = n.targets) ||
                            void 0 === t ||
                            null === (e = t[0]) ||
                            void 0 === e
                            ? void 0
                            : e.expr,
                        )) && void 0 !== r
                        ? r
                        : "";
                    return ((0, m.z)("add_to_dashboard_build_panel", { expr: a }), h.panel);
                  },
                  timeRange: h.range,
                  options: { useAbsolutePath: !0 },
                }),
              ),
          )
        );
      });
      var Fe = n(845);
      function Ge(e, t, n) {
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
      function qe() {
        return new Ue();
      }
      class Ue extends a.SceneObjectBase {
        getSelectedScopes() {
          return this.selectedScopes;
        }
        getSelectedScopesNames() {
          return this.selectedScopes.map(({ scope: e }) => e.metadata.name);
        }
        setSelectedScopes(e) {
          ((this.selectedScopes = e), this.notifySubscribers());
        }
        onScopesChange(e) {
          return (
            this.onScopesChangeCallbacks.push(e),
            () => {
              this.onScopesChangeCallbacks = this.onScopesChangeCallbacks.filter((t) => t !== e);
            }
          );
        }
        notifySubscribers() {
          for (const e of this.onScopesChangeCallbacks) e(this.selectedScopes);
        }
        get value() {
          return [];
        }
        constructor() {
          (super({}), Ge(this, "selectedScopes", []), Ge(this, "onScopesChangeCallbacks", []));
        }
      }
      var He = n(3498);
      function ze(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function Ke(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              ze(i, r, a, o, s, "next", e);
            }
            function s(e) {
              ze(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
      }
      function We(e, t, n) {
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
      function Qe(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              We(e, t, n[t]);
            }));
        }
        return e;
      }
      function Ye(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      function Xe(e) {
        return a.sceneGraph.getAncestor(e, Ne);
      }
      const Ze = "gmd";
      function Je(e) {
        var t, n, r;
        return new Ne(
          Qe(
            {
              initialDS: null == e ? void 0 : e.initialDS,
              $timeRange:
                null !== (t = null == e ? void 0 : e.$timeRange) && void 0 !== t
                  ? t
                  : new a.SceneTimeRange({ from: "now-1h", to: "now" }),
              embedded: null !== (n = null == e ? void 0 : e.embedded) && void 0 !== n && n,
              embeddedMini: null !== (r = null == e ? void 0 : e.embeddedMini) && void 0 !== r && r,
              urlNamespace:
                (null == e ? void 0 : e.embedded) && !(null == e ? void 0 : e.embeddedMini)
                  ? Ze
                  : void 0,
            },
            e,
          ),
        );
      }
      function et(e) {
        const t = a.sceneUtils.getUrlState(e);
        return s.urlUtil.renderUrl(He.b.Drilldown, t);
      }
      function tt(e) {
        return a.sceneGraph
          .findAllObjects(e, Fe.x)
          .flatMap((e) =>
            e.state.queries.map((t) =>
              Ye(Qe({}, t), { expr: a.sceneGraph.interpolate(e, t.expr) }),
            ),
          );
      }
      const nt = 1e4;
      function rt(e) {
        return e ? (e === o.td ? "Logs" : e) : "All metrics";
      }
      function at(e) {
        const t = r.config.theme2.visualization;
        return t.getColorByName(t.palette[e % 8]);
      }
      function it() {}
      function ot(e) {
        return Object.values(e);
      }
      function st(e) {
        return Object.keys(e);
      }
    },
    7791: (e, t, n) => {
      function r(e, t) {
        return (null == t ? void 0 : t.state.embedded) || e.isLight
          ? e.colors.background.primary
          : e.colors.background.canvas;
      }
      function a(e) {
        return `\n    position: relative;\n    cursor: pointer;\n    &:hover {\n      background: ${e.colors.background.secondary};\n    }\n    /* Invisible overlay covering entire panel - z-index ensures it's above panel content */\n    &::after {\n      content: '';\n      position: absolute;\n      inset: 0;\n      cursor: inherit;\n      z-index: 1;\n    }\n  `;
      }
      n.d(t, { T: () => r, v: () => a });
    },
    7957: (e, t, n) => {
      n.d(t, { fe: () => v, On: () => S, c0: () => w });
      var r = n(3014),
        a = n(5959),
        i = n.n(a),
        o = n(5333),
        s = n(6367),
        l = n(3916),
        c = n(578),
        u = n(8705),
        d = n(396),
        p = n(6089),
        m = n(2007);
      function h({
        usageType: e,
        usageCount: t,
        singularUsageType: n,
        pluralUsageType: r,
        icon: a,
        dashboardItems: o,
      }) {
        const s = (0, m.useStyles2)(f);
        return i().createElement(
          "div",
          { className: s.usageContainer, "data-testid": "usage-data-panel" },
          i().createElement(
            m.Stack,
            { direction: "row", justifyContent: "flex-start", alignItems: "center", gap: 2 },
            "dashboard-usage" === e
              ? i().createElement(
                  m.Dropdown,
                  {
                    placement: "right-start",
                    overlay: i().createElement(
                      m.Menu,
                      { style: { maxWidth: "240px", maxHeight: "245px", overflowY: "auto" } },
                      o.map((e) =>
                        i().createElement(m.Menu.Item, {
                          key: e.id,
                          label: "",
                          url: e.url,
                          target: "_blank",
                          className: s.menuItem,
                          component: () =>
                            i().createElement(
                              m.Tooltip,
                              {
                                content: `Used ${e.count} ${1 === e.count ? "time" : "times"} in ${e.label}`,
                                placement: "right",
                              },
                              i().createElement(
                                "div",
                                { className: s.menuItemContent },
                                i().createElement(m.Icon, { name: "external-link-alt" }),
                                " ",
                                e.label,
                                " (",
                                e.count,
                                ")",
                              ),
                            ),
                        }),
                      ),
                    ),
                  },
                  i().createElement(
                    m.Button,
                    {
                      variant: "secondary",
                      size: "sm",
                      tooltip: `Metric used ${t} ${1 === t ? "time" : "times"} in dashboard queries. Click to view the dashboards.`,
                      className: (0, p.cx)(s.usageItem, s.clickableUsageItem),
                    },
                    i().createElement(
                      m.Stack,
                      { direction: "row", alignItems: "center", gap: 0.5, "data-testid": e },
                      i().createElement(m.Icon, { name: a }),
                      i().createElement("span", null, t),
                    ),
                  ),
                )
              : i().createElement(
                  m.Tooltip,
                  { content: `Metric is used in ${t} ${1 === t ? n : r}`, placement: "top" },
                  i().createElement(
                    "span",
                    { className: s.usageItem, "data-testid": e },
                    i().createElement(
                      m.Stack,
                      { direction: "row", alignItems: "center", gap: 0.5 },
                      i().createElement(m.Icon, { name: a }),
                      i().createElement("span", null, t),
                    ),
                  ),
                ),
          ),
        );
      }
      function f(e) {
        return {
          usageContainer: (0, p.css)({
            padding: "8px 12px",
            border: `1px solid ${e.colors.border.weak}`,
            borderTopWidth: 0,
            backgroundColor: e.colors.background.primary,
          }),
          usageItem: (0, p.css)({ color: e.colors.text.secondary, opacity: "65%" }),
          clickableUsageItem: (0, p.css)({ backgroundColor: "transparent", border: "none" }),
          menuItem: (0, p.css)({
            color: e.colors.text.primary,
            textDecoration: "none",
            "&:hover": { color: e.colors.text.link },
          }),
          menuItemContent: (0, p.css)({
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: e.colors.text.primary,
            "&:hover": { color: e.colors.text.link },
          }),
        };
      }
      function b(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function g(e, t, n) {
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
      function y(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      const v = "220px",
        S = "260px";
      class w extends r.SceneObjectBase {
        _onActivate() {
          let e;
          try {
            e = r.sceneGraph.getAncestor(this, c.m);
          } catch (e) {
            return;
          }
          if (!e.state.enginesMap.get(l.h)) return;
          const t = r.sceneGraph.findByKeyAndType(this, "metrics-sorter", o.fD),
            n = r.sceneGraph.getVariables(t).getByName(o.NJ);
          (0, d.UG)(n) &&
            (this.updateSortBy(t, n.getValue()),
            this._subs.add(
              n.subscribeToState(({ value: e }) => {
                this.updateSortBy(t, e);
              }),
            ));
        }
        updateSortBy(e, t) {
          return ((n = function* () {
            if ((this.setState({ sortBy: t }), this.updateLayout(t), !(0, s.a)(t))) return;
            const n = yield e.getUsageDetailsForMetric(this.state.metric, t);
            switch (n.usageType) {
              case "dashboard-usage":
                this.setState({
                  usageCount: n.count,
                  singularUsageType: "dashboard panel query",
                  pluralUsageType: "dashboard panel queries",
                  icon: "apps",
                  dashboardItems: Object.entries(n.dashboards)
                    .map(([e, t]) => ({ id: t.uid, label: e, count: t.count, url: t.url }))
                    .sort((e, t) => t.count - e.count),
                });
                break;
              case "alerting-usage":
                this.setState({
                  usageCount: n.count,
                  singularUsageType: "alert rule",
                  pluralUsageType: "alert rules",
                  icon: "bell",
                });
            }
          }),
          function () {
            var e = this,
              t = arguments;
            return new Promise(function (r, a) {
              var i = n.apply(e, t);
              function o(e) {
                b(i, r, a, o, s, "next", e);
              }
              function s(e) {
                b(i, r, a, o, s, "throw", e);
              }
              o(void 0);
            });
          }).call(this);
          var n;
        }
        updateLayout(e) {
          const t = r.sceneGraph.getAncestor(this, r.SceneCSSGridLayout),
            n = null == t ? void 0 : t.state.autoRows,
            a = (0, s.a)(e) ? S : v;
          n !== a && t.setState({ autoRows: a });
        }
        constructor(e) {
          (super(
            y(
              (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {},
                    r = Object.keys(n);
                  ("function" == typeof Object.getOwnPropertySymbols &&
                    (r = r.concat(
                      Object.getOwnPropertySymbols(n).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(n, e).enumerable;
                      }),
                    )),
                    r.forEach(function (t) {
                      g(e, t, n[t]);
                    }));
                }
                return e;
              })({}, e),
              {
                sortBy: "default",
                usageCount: 0,
                singularUsageType: "",
                pluralUsageType: "",
                icon: "",
                dashboardItems: [],
              },
            ),
          ),
            this.addActivationHandler(this._onActivate.bind(this)));
        }
      }
      g(w, "Component", ({ model: e }) => {
        const {
          vizPanelInGridItem: t,
          sortBy: n,
          usageCount: r,
          singularUsageType: a,
          pluralUsageType: o,
          icon: l,
          dashboardItems: c,
        } = e.useState();
        if (t)
          return i().createElement(
            "div",
            { "data-testid": "with-usage-data-preview-panel" },
            i().createElement(t.Component, { model: t }),
            (0, s.a)(n) &&
              i().createElement(h, {
                usageType: n,
                usageCount: r,
                singularUsageType: a,
                pluralUsageType: o,
                icon: l,
                dashboardItems: c,
              }),
          );
        u.v.log("no viz panel");
      });
    },
    8238: (e, t, n) => {
      n.d(t, { s: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "timeseries-data-received"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    8316: (e, t, n) => {
      n.d(t, { H: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "reset-sync-y-axis"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    8819: (e, t, n) => {
      n.d(t, { Y: () => i });
      var r = n(5959),
        a = n.n(r);
      function i() {
        return a().createElement(
          "svg",
          { stroke: "currentColor", width: "17", height: "16", viewBox: "0 0 17 16", fill: "none" },
          a().createElement("circle", {
            cx: "8.92688",
            cy: "3.63132",
            r: "2.375",
            strokeWidth: "1.5",
          }),
          a().createElement("path", {
            d: "M13.6469 4.37965C14.6813 4.76699 15.3235 7.03139 14.9362 8.06582",
            strokeWidth: "1.5",
          }),
          a().createElement("path", {
            d: "M4.35309 4.37965C3.31866 4.76699 2.67651 7.03139 3.06384 8.06582",
            strokeWidth: "1.5",
          }),
          a().createElement("path", {
            d: "M10.3408 14.2531C9.75237 14.8415 8.11813 14.7799 7.50903 14.1708",
            strokeWidth: "1.5",
          }),
          a().createElement("circle", {
            cx: "4.00195",
            cy: "12.251",
            r: "2.375",
            strokeWidth: "1.5",
          }),
          a().createElement("circle", {
            cx: "13.8478",
            cy: "12.251",
            r: "2.375",
            strokeWidth: "1.5",
          }),
        );
      }
    },
    9194: (e, t, n) => {
      n.d(t, { x: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "metrics-variable-loaded"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    9207: (e, t, n) => {
      n.d(t, { y: () => i });
      n(8531);
      var r = n(3781),
        a = n(3498);
      function i({ metric: e, labels: t, dataSource: n, from: i, to: o, groupBy: s }) {
        const l = (0, r.PQ)(n, t, e, i, o),
          c = (0, r.e6)(l);
        return (
          c.append("actionView", "breakdown"),
          c.append("var-groupby", null != s ? s : "$__all"),
          (0, r.Rk)(a.b.Drilldown, c)
        );
      }
    },
    9226: (e, t, n) => {
      n.d(t, { N: () => d });
      var r = n(2388),
        a = n(5935),
        i = n(1233),
        o = n(5693),
        s = n(3632),
        l = n(7014);
      const c = new Set(Object.values(s.i)),
        u = new Set(["heatmap", "percentiles", "stat", "statushistory", "timeseries"]);
      function d(e) {
        var t;
        const n = o.x.getItem(i.V.METRIC_PREFS) || {},
          s = null === (t = n[e]) || void 0 === t ? void 0 : t.config;
        var d;
        if (s)
          return (function (e) {
            if (!["id", "panelOptions", "queryOptions"].every((t) => t in e)) return !1;
            if ("string" != typeof e.id || !c.has(e.id)) return !1;
            if ("string" != typeof e.panelOptions.type || !u.has(e.panelOptions.type)) return !1;
            if (!Array.isArray(e.queryOptions.queries)) return !1;
            if (
              !e.queryOptions.queries.every((e) => {
                var t;
                return (
                  !!l.q.has(e.fn) &&
                  (!["quantile", "histogram_quantile"].includes(e.fn) ||
                    (!(
                      !Array.isArray(
                        null === (t = e.params) || void 0 === t ? void 0 : t.percentiles,
                      ) || !e.params.percentiles.length
                    ) &&
                      e.params.percentiles.every((e) => e >= 1 && e <= 99)))
                );
              })
            )
              return !1;
            return !0;
          })(s)
            ? s
            : ((0, a.z)("invalid_metric_config", { metricConfig: s }),
              null === (d = n[e]) || void 0 === d || delete d.config,
              o.x.setItem(i.V.METRIC_PREFS, n),
              void (0, r.HA)([
                `Invalid configuration found for metric ${e}!`,
                "The configuration has been deleted and will not be applied.",
              ]));
      }
    },
    9331: (e, t, n) => {
      n.d(t, { s: () => l });
      var r = n(3014),
        a = n(3916),
        i = n(5060),
        o = n(5665),
        s = n(5843);
      class l extends s.I {
        onActivate() {
          const e = r.sceneGraph.lookupVariable(o.$, this),
            t = r.sceneGraph.lookupVariable(a.h, this);
          (this.setInitCounts(e, t),
            this._subs.add(
              e.subscribeToState((e, n) => {
                (0, i.B)(e.options, n.options) ||
                  this.setState({
                    counts: { current: t.state.options.length, total: e.options.length },
                  });
              }),
            ),
            this._subs.add(
              t.subscribeToState((t, n) => {
                t.loading ||
                  n.loading ||
                  (0, i.B)(t.options, n.options) ||
                  this.setState({
                    counts: { current: t.options.length, total: e.state.options.length },
                  });
              }),
            ));
        }
        setInitCounts(e, t) {
          const n = { current: 0, total: 0 };
          (!e.state.loading && e.state.options.length && (n.total = e.state.options.length),
            !t.state.loading && t.state.options.length && (n.current = t.state.options.length),
            this.setState({ counts: n }));
        }
        constructor() {
          (super({ key: "MetricVariableCountsProvider" }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
    },
    9365: (e, t, n) => {
      n.d(t, { e: () => s });
      var r,
        a,
        i,
        o = n(7781);
      class s extends o.BusEventWithPayload {}
      ((i = "metrics-variable-deactivated"),
        (a = "type") in (r = s)
          ? Object.defineProperty(r, a, {
              value: i,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (r[a] = i));
    },
    9512: (e, t, n) => {
      n.d(t, { c: () => m });
      var r = n(3014),
        a = n(902);
      const i = new Map();
      function o(e, t) {
        let n = i.get(e);
        n || ((n = new Map()), i.set(e, n));
        let r = n.get(t);
        if (!r) {
          const i = e.split("_"),
            o = i.slice(0, i.length / 2).join("_");
          ((r = { halfLeven: (0, a.A)(o, t) || 0, wholeLeven: (0, a.A)(e, t) || 0 }), n.set(t, r));
        }
        return r;
      }
      var s = n(5333),
        l = n(8705),
        c = n(5060);
      function u(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function d(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              u(i, r, a, o, s, "next", e);
            }
            function s(e) {
              u(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
      }
      function p(e, t, n) {
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
      class m {
        sort() {
          return d(function* (e = this.sortBy, t = {}) {
            const n = this.variable.state.options.map((e) => e.value);
            if (e === this.sortBy && (0, c.B)(n, this.lastMetrics)) return;
            let r;
            switch (e) {
              case "alphabetical":
                r = (0, s.bG)(n, "asc");
                break;
              case "alphabetical-reversed":
                r = (0, s.bG)(n, "desc");
                break;
              case "dashboard-usage":
              case "alerting-usage":
                r = yield this.sortByUsage(n, e);
                break;
              case "related":
                ((a = n),
                  (i = t.metric),
                  (r = a.sort((e, t) => {
                    const n = o(e, i),
                      r = o(t, i);
                    return n.halfLeven + n.wholeLeven - (r.halfLeven + r.wholeLeven);
                  })));
                break;
              default:
                r = (0, s.Rm)(n);
            }
            var a, i;
            ((this.sortBy = e),
              (this.lastMetrics = r),
              this.variable.setState({ options: r.map((e) => ({ label: e, value: e })) }),
              this.notifyUpdate());
          }).apply(this, arguments);
        }
        sortByUsage(e, t) {
          return d(function* () {
            try {
              const n = r.sceneGraph.findByKeyAndType(this.variable, "metrics-sorter", s.fD);
              if (!n)
                return (
                  l.v.warn("Metrics sorter not found. Returning unsorted metrics.", {
                    usageType: t,
                  }),
                  e
                );
              const a = yield n.getUsageMetrics(t);
              return (0, s.yH)(e, a);
            } catch (n) {
              const r = "string" == typeof n ? new Error(n) : n;
              return (l.v.error(r, { usageType: t }), e);
            }
          }).call(this);
        }
        notifyUpdate() {
          this.variable.publishEvent(new r.SceneVariableValueChangedEvent(this.variable), !0);
        }
        constructor(e) {
          (p(this, "variable", void 0),
            p(this, "lastMetrics", void 0),
            p(this, "sortBy", void 0),
            (this.variable = e),
            (this.sortBy = void 0),
            (this.lastMetrics = []));
        }
      }
    },
    9564: (e, t, n) => {
      n.d(t, { J: () => m, c: () => p });
      var r = n(7781),
        a = n(3014),
        i = n(7401),
        o = n(1419),
        s = n(396),
        l = n(2388),
        c = n(6024);
      function u(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      function d(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, a) {
            var i = e.apply(t, n);
            function o(e) {
              u(i, r, a, o, s, "next", e);
            }
            function s(e) {
              u(i, r, a, o, s, "throw", e);
            }
            o(void 0);
          });
        };
      }
      const p = "(none)";
      class m extends a.RuntimeDataSource {
        query() {
          return d(function* () {
            return {
              state: r.LoadingState.Done,
              data: [
                {
                  name: "Labels",
                  fields: [{ name: null, type: r.FieldType.other, values: [], config: {} }],
                  length: 0,
                },
              ],
            };
          })();
        }
        metricFindQuery(e, t) {
          return d(function* () {
            var n, r;
            const a =
                null === (r = t.scopedVars) ||
                void 0 === r ||
                null === (n = r.__sceneObject) ||
                void 0 === n
                  ? void 0
                  : n.valueOf(),
              o = yield i.q.getPrometheusDataSourceForScene(a);
            if (!o) return [];
            var s;
            const [, c] = null !== (s = e.match(/valuesOf\((.+)\)/)) && void 0 !== s ? s : [];
            if (c) {
              return (yield m.fetchLabelValues(c, a)).map((e) => ({ value: e, text: e }));
            }
            let u = [];
            try {
              u = yield this.fetchLabels(o, a, e);
            } catch (e) {
              (0, l.HA)([
                "Error while fetching labels! Defaulting to an empty array.",
                e.toString(),
              ]);
            }
            return [{ value: p, text: "(none)" }, ...u];
          }).call(this);
        }
        fetchLabels(e, t, n) {
          return d(function* () {
            if (!m.getLabelsMatchAPISupport(e)) {
              const n = m.getFiltersFromVariable(t),
                r = yield e.getTagKeys(n);
              return this.processLabelOptions(r.map(({ text: e }) => ({ value: e, text: e })));
            }
            const r = yield i.q.fetchLabels({
              ds: e,
              timeRange: a.sceneGraph.getTimeRange(t).state.value,
              matcher: n,
            });
            return this.processLabelOptions(r.map((e) => ({ value: e, text: e })));
          }).call(this);
        }
        static getLabelsMatchAPISupport(e) {
          try {
            return e.hasLabelsMatchAPISupport();
          } catch (e) {
            return (
              (0, l.HA)([
                "Error while checking if the current data source supports the labels match API! Defaulting to false.",
                e.toString(),
              ]),
              !1
            );
          }
        }
        static getFiltersFromVariable(e) {
          const t = a.sceneGraph.lookupVariable(o.Ao, e);
          return (0, s.BE)(t) ? { filters: t.state.filters } : { filters: [] };
        }
        processLabelOptions(e) {
          return e
            .filter(({ value: e }) => !e.startsWith("__"))
            .sort((e, t) => (0, c._)(e.value, t.value));
        }
        static fetchLabelValues(e, t) {
          return d(function* () {
            const n = yield i.q.getPrometheusDataSourceForScene(t);
            if (!n) return [];
            try {
              return yield i.q.fetchLabelValues({
                ds: n,
                labelName: e,
                timeRange: a.sceneGraph.getTimeRange(t).state.value,
              });
            } catch (t) {
              return (
                (0, l.HA)([
                  `Error while retrieving label "${e}" values! Defaulting to an empty array.`,
                  t.toString(),
                ]),
                []
              );
            }
          })();
        }
        testDatasource() {
          return d(function* () {
            return { status: "success", message: "OK" };
          })();
        }
        constructor() {
          super(m.uid, m.uid);
        }
      }
      var h, f, b;
      ((b = "grafana-prometheus-labels-datasource"),
        (f = "uid") in (h = m)
          ? Object.defineProperty(h, f, {
              value: b,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (h[f] = b));
    },
    9694: (e, t, n) => {
      n.d(t, { P: () => l, U: () => s });
      var r = n(7781),
        a = n(1932),
        i = n(3014),
        o = n(1419);
      const s = "metrics_filters";
      class l extends i.AdHocFiltersVariable {
        constructor() {
          (super({
            key: s,
            name: s,
            hide: r.VariableHide.hideVariable,
            allowCustomValue: !0,
            applyMode: "manual",
            expressionBuilder: (e) =>
              e.map((e) => `${(0, a.Nc)(e.key)}${e.operator}"${e.value}"`).join(","),
            skipUrlSync: !0,
          }),
            this.addActivationHandler(() => {
              const e = i.sceneGraph.findByKeyAndType(this, o.Ao, i.AdHocFiltersVariable),
                t = (e) => {
                  this.setState({ baseFilters: e.baseFilters, filters: e.filters });
                };
              t(e.state);
              const n = e.subscribeToState((e, n) => {
                (e.baseFilters === n.baseFilters && e.filters === n.filters) || t(e);
              });
              return () => {
                n.unsubscribe();
              };
            }));
        }
      }
    },
    9697: (e, t, n) => {
      n.d(t, { i: () => u });
      var r = n(8531),
        a = n(3014),
        i = n(8705),
        o = n(1419),
        s = n(1233),
        l = n(5693),
        c = n(4440);
      class u extends a.DataSourceVariable {
        onActivate() {
          (this.setState({ skipUrlSync: !1 }),
            this.subscribeToState((e, t) => {
              e.value && e.value !== t.value && l.x.setItem(s.V.DATASOURCE, e.value);
            }));
        }
        static getCurrentDataSource() {
          const e = Object.values(r.config.datasources).filter((e) => (0, c.aQ)(e)),
            t = new URL(window.location.href).searchParams.get(`var-${o.EY}`),
            n = l.x.getItem(s.V.DATASOURCE),
            a =
              e.find((e) => e.uid === t) ||
              e.find((e) => e.uid === n) ||
              e.find((e) => e.isDefault) ||
              e[0];
          return a
            ? a.uid
            : (i.v.warn("Cannot find any Prometheus data source!"), "no-data-source-configured");
        }
        constructor({ initialDS: e }) {
          (super({
            key: o.EY,
            name: o.EY,
            pluginId: "prometheus",
            label: "Data source",
            description: "Only prometheus data sources are supported",
            skipUrlSync: !e,
            value: e || u.getCurrentDataSource(),
          }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
    },
    9762: (e, t, n) => {
      n.d(t, { k3: () => Ge, x3: () => $e, fe: () => Fe, nh: () => Ve });
      var r = n(6089),
        a = n(3014),
        i = n(2007),
        o = n(5959),
        s = n.n(o),
        l = n(5935),
        c = n(8531),
        u = n(5114),
        d = n(7616),
        p = n(7791),
        m = n(7781),
        h = n(6503),
        f = n(5190),
        b = n(2413),
        g = n(2457),
        y = n(2639),
        v = n(917),
        S = n(4299),
        w = n(4160);
      const O =
        (e = {}) =>
        (t) => {
          const [n] = a.sceneGraph.findDescendents(t, a.SceneQueryRunner);
          if (!n) return;
          const r = t.state.title,
            i = n.subscribeToState((n) => {
              var a;
              if (
                (null === (a = n.data) || void 0 === a ? void 0 : a.state) !== m.LoadingState.Done
              )
                return;
              const { series: i } = n.data;
              if (!(null == i ? void 0 : i.length)) return;
              const o = { title: `${r} (${i.length})` };
              var s, l;
              i.length > w.o &&
                ((o.description = `Showing only ${w.o} series out of ${i.length} to keep the data easy to read.`),
                (o.description +=
                  "string" ==
                  typeof (null === (s = e.description) || void 0 === s ? void 0 : s.ctaText)
                    ? ` ${null === (l = e.description) || void 0 === l ? void 0 : l.ctaText}`
                    : ' Click on "Select" on this panel to view a breakdown of all the label\'s values.'));
              t.setState(o);
            });
          return () => {
            i.unsubscribe();
          };
        };
      var E = n(1419),
        x = n(8238);
      function k() {
        return (e) => {
          var t;
          if ("timeseries" !== e.state.pluginId) return;
          let n = a.sceneGraph.getData(e);
          n instanceof a.SceneDataTransformer && (n = n.state.$data);
          const { data: r } = n.state;
          (null == r ? void 0 : r.state) === m.LoadingState.Done &&
            (null === (t = r.series) || void 0 === t ? void 0 : t.length) &&
            e.publishEvent(new x.s({ panelKey: e.state.key, series: r.series }), !0);
          const i = n.subscribeToState((t, n) => {
            var r, a, i;
            if (
              (null === (r = t.data) || void 0 === r ? void 0 : r.state) === m.LoadingState.Done &&
              (null === (a = t.data.series) || void 0 === a ? void 0 : a.length) &&
              t.data.series !== (null === (i = n.data) || void 0 === i ? void 0 : i.series)
            ) {
              var o;
              const n = null === (o = t.data.series[0].meta) || void 0 === o ? void 0 : o.type;
              if (n && !n.startsWith("timeseries")) return;
              e.publishEvent(new x.s({ panelKey: e.state.key, series: t.data.series }), !0);
            }
          });
          return () => {
            i.unsubscribe();
          };
        };
      }
      var C,
        P,
        j,
        _ = n(300);
      class T extends a.SceneObjectBase {}
      function I(e) {
        return {
          container: r.css`
      width: 100%;
      height: 100%;
      ${(0, p.v)(e)}
    `,
        };
      }
      ((j = ({ model: e }) => {
        const { panel: t, navigationUrl: n, title: r } = e.useState(),
          a = (0, i.useStyles2)(I),
          o = () => {
            c.locationService.push(n);
          };
        return s().createElement(
          "div",
          {
            className: a.container,
            onClick: o,
            onKeyDown: (e) => {
              ("Enter" !== e.key && " " !== e.key) || (e.preventDefault(), o());
            },
            role: "button",
            tabIndex: 0,
            title: r,
          },
          s().createElement(t.Component, { model: t }),
        );
      }),
        (P = "Component") in (C = T)
          ? Object.defineProperty(C, P, {
              value: j,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (C[P] = j));
      var A = n(396);
      function D(e, t, n) {
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
      class B extends a.SceneObjectBase {
        constructor(...e) {
          (super(...e),
            D(this, "onClick", () => {
              const { label: e } = this.state;
              (0, l.z)("breakdown_panel_selected", { label: e });
              const t = a.sceneGraph.lookupVariable(E.yr, this);
              if (!(0, A.bA)(t)) throw new Error("Group by variable not found");
              t.changeValueTo(e);
            }));
        }
      }
      D(B, "Component", ({ model: e }) =>
        s().createElement(
          i.Button,
          { variant: "secondary", size: "sm", fill: "outline", onClick: e.onClick },
          "Select",
        ),
      );
      var M = n(9207),
        N = n(4179);
      function L(e, t) {
        const n = a.sceneGraph.getTimeRange(e);
        return (0, M.y)({
          metric: e.state.metric,
          labels: (e.state.initialFilters || []).map((e) => ({
            label: e.key,
            op: e.operator,
            value: e.value,
          })),
          dataSource: e.state.initialDS,
          from: String(n.state.from),
          to: String(n.state.to),
          groupBy: t,
        });
      }
      function R(e, t, n) {
        return {
          type: "timeseries",
          height: n ? v.N.XS : v.N.M,
          title: e,
          fixedColorIndex: t,
          behaviors: n ? [O({ description: { ctaText: "" } })] : [k(), O()],
          headerActions: n ? () => [] : () => [new B({ label: e })],
          menu: n ? void 0 : () => new N.G({ labelName: e }),
          legend: n ? { showLegend: !1 } : { placement: "bottom" },
        };
      }
      class $ extends a.SceneObjectBase {
        onActivate() {
          ((0, d.kj)(this).state.embeddedMini &&
            (this.state.body.setState({ initialPageSize: 3, pageSizeIncrement: 0 }),
            this.state.body.state.body.setState({ autoRows: v.N.XS, templateColumns: y._O })),
            this.subscribeToLayoutChange(),
            this.subscribeToEvents());
        }
        subscribeToEvents() {
          const e = new Map();
          this.subscribeToEvent(x.s, (t) => {
            const { panelKey: n, series: r } = t.payload,
              i = a.sceneGraph.findByKeyAndType(this, n, a.VizPanel);
            if (1 === r.length)
              return (
                e.has(n) || e.set(n, i.state.headerActions || []),
                void i.setState({ headerActions: [] })
              );
            e.has(n) && i.setState({ headerActions: e.get(n) });
          });
        }
        subscribeToLayoutChange() {
          if ((0, d.kj)(this).state.embeddedMini) return;
          const e = a.sceneGraph.findByKeyAndType(this, "layout-switcher", g.U),
            t = (e, t) => {
              e.layout !== (null == t ? void 0 : t.layout) &&
                this.state.body.state.body.setState({
                  templateColumns: e.layout === g.p.ROWS ? y._O : y.MV,
                });
            };
          (a.sceneUtils.syncStateFromSearchParams(e, new URLSearchParams(window.location.search)),
            t(e.state),
            this._subs.add(e.subscribeToState(t)));
        }
        Controls({ model: e }) {
          const t = (0, i.useStyles2)(V),
            { layoutSwitcher: n } = e.useState();
          return s().createElement(
            i.Field,
            { label: "View", className: t.field },
            s().createElement(n.Component, { model: n }),
          );
        }
        constructor({ metric: e }) {
          (super({
            key: "metric-labels-list",
            metric: e,
            layoutSwitcher: new g.U({}),
            body: new f.k({
              variableName: E.yr,
              initialPageSize: 60,
              pageSizeIncrement: 9,
              body: new a.SceneCSSGridLayout({
                children: [],
                isLazy: !0,
                templateColumns: y.MV,
                autoRows: v.N.M,
                $behaviors: [
                  new a.behaviors.CursorSync({
                    key: "metricCrosshairSync",
                    sync: m.DashboardCursorSync.Crosshair,
                  }),
                  (0, _.U)(),
                ],
              }),
              getLayoutLoading: () =>
                new a.SceneReactObject({ reactNode: s().createElement(i.Spinner, { inline: !0 }) }),
              getLayoutEmpty: () =>
                new a.SceneReactObject({
                  reactNode: s().createElement(
                    h._,
                    { title: "", severity: "info" },
                    "No labels found for the current filters and time range.",
                  ),
                }),
              getLayoutError: (e) =>
                new a.SceneReactObject({
                  reactNode: s().createElement(h._, {
                    severity: "error",
                    title: "Error while loading labels!",
                    error: e,
                  }),
                }),
              getLayoutChild: (t, n) => {
                const r = t.value;
                let i,
                  o = !1;
                try {
                  var s;
                  ((i = (0, d.kj)(this)),
                    (o = null !== (s = i.state.embeddedMini) && void 0 !== s && s));
                } catch (e) {}
                const l = (0, w.B)({
                  metric: e,
                  panelConfig: R(r, n, o),
                  queryConfig: {
                    resolution: S.I.MEDIUM,
                    groupBy: r,
                    labelMatchers: [],
                    addIgnoreUsageFilter: !0,
                  },
                });
                return o && i
                  ? new a.SceneCSSGridItem({
                      body: new T({ panel: l, navigationUrl: L(i, r), title: `Breakdown by ${r}` }),
                    })
                  : new a.SceneCSSGridItem({ body: l });
              },
            }),
          }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function V(e) {
        return {
          field: (0, r.css)({ marginBottom: 0 }),
          footer: (0, r.css)({
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: e.spacing(4),
            "& button": { height: "40px", borderRadius: "8px" },
          }),
        };
      }
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })($, "Component", ({ model: e }) => {
        const t = (0, i.useStyles2)(V),
          { body: n } = e.useState(),
          r = (0, d.kj)(e),
          { embeddedMini: o } = r.state,
          l = a.sceneGraph.lookupVariable(E.yr, e),
          { loading: c, error: u } = l.useState(),
          p = n.useSizes(),
          m = !o && !c && !u && p.total > 0 && p.current < p.total;
        return s().createElement(
          "div",
          { "data-testid": "labels-list" },
          s().createElement(n.Component, { model: n }),
          m &&
            s().createElement(
              "div",
              { className: t.footer },
              s().createElement(b.d, {
                label: "label",
                batchSizes: p,
                onClick: () => {
                  n.increaseBatchSize();
                },
              }),
            ),
        );
      });
      var F = n(4293),
        G = n(392),
        q = n(9226),
        U = n(4758),
        H = n(7561),
        z = n(1100);
      function K(e, t, n) {
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
      class W extends a.SceneObjectBase {
        constructor(...e) {
          (super(...e),
            K(this, "onClick", () => {
              const { labelName: e, labelValue: t } = this.state;
              ((0, l.z)("label_filter_changed", { label: e, action: "added", cause: "breakdown" }),
                (0, d.kj)(this).addFilterWithoutReportingInteraction({
                  key: e,
                  operator: "=",
                  value: t,
                }));
            }));
        }
      }
      function Q(e) {
        var t;
        const n = (null === (t = e.fields[1]) || void 0 === t ? void 0 : t.labels) || {},
          r = Object.keys(n);
        return 0 === r.length ? "<unspecified>" : n[r[0]];
      }
      K(W, "Component", ({ model: e }) =>
        s().createElement(
          i.Button,
          { variant: "secondary", size: "sm", fill: "outline", onClick: e.onClick },
          "Add to filters",
        ),
      );
      var Y = n(5843),
        X = n(2290),
        Z = n(1233),
        J = n(5693);
      function ee(e, t, n) {
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
      class te extends a.SceneObjectBase {
        constructor(e) {
          const t = J.x.getItem(Z.V.BREAKDOWN_SORTBY);
          (super({
            key: "breakdown-sort-by",
            target: e.target,
            options: te.DEFAULT_OPTIONS,
            value: (t && te.DEFAULT_OPTIONS.find((e) => e.value === t)) || te.DEFAULT_OPTIONS[0],
          }),
            ee(this, "onChange", (e) => {
              (this.setState({ value: e }), J.x.setItem(Z.V.BREAKDOWN_SORTBY, e.value));
            }));
        }
      }
      function ne(e) {
        return {
          sortByTooltip: (0, r.css)({ display: "flex", gap: e.spacing(1) }),
          field: (0, r.css)({ marginBottom: 0 }),
        };
      }
      (ee(te, "DEFAULT_OPTIONS", [
        {
          value: "outliers",
          label: "Outlying series",
          description:
            "Prioritizes values that show distinct behavior from others within the same label",
        },
        { value: "alphabetical", label: "Name [A-Z]", description: "Alphabetical order" },
        {
          value: "alphabetical-reversed",
          label: "Name [Z-A]",
          description: "Reversed alphabetical order",
        },
      ]),
        ee(te, "Component", ({ model: e }) => {
          const t = (0, i.useStyles2)(ne),
            { value: n, options: r } = e.useState();
          return s().createElement(
            i.Field,
            {
              className: t.field,
              "data-testid": "sort-by-select",
              htmlFor: "sort-by-criteria",
              label: s().createElement(
                "div",
                { className: t.sortByTooltip },
                "Sort by",
                s().createElement(i.IconButton, {
                  name: "info-circle",
                  size: "sm",
                  variant: "secondary",
                  tooltip: "Sorts values using standard or smart time series calculations.",
                }),
              ),
            },
            s().createElement(i.Combobox, {
              id: "sort-by-criteria",
              placeholder: "Choose criteria",
              width: 20,
              options: r,
              value: n,
              onChange: e.onChange,
              isClearable: !1,
            }),
          );
        }));
      var re = n(3139),
        ae = n(8316);
      function ie(e, t, n) {
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
      class oe extends a.SceneObjectBase {
        performRepeat(e) {
          var t, n, r, a;
          if (e.state === m.LoadingState.Loading)
            return void this.setState({
              loadingLayout:
                null === (t = (n = this.state).getLayoutLoading) || void 0 === t
                  ? void 0
                  : t.call(n),
              errorLayout: void 0,
              emptyLayout: void 0,
              currentBatchSize: 0,
            });
          if (e.state === m.LoadingState.Error)
            return void this.setState({
              errorLayout:
                null === (r = (a = this.state).getLayoutError) || void 0 === r
                  ? void 0
                  : r.call(a, e),
              loadingLayout: void 0,
              emptyLayout: void 0,
              currentBatchSize: 0,
            });
          const i = this.filterAndSort(e.series);
          var o, s;
          if (!i.length)
            return void this.setState({
              emptyLayout:
                null === (o = (s = this.state).getLayoutEmpty) || void 0 === o ? void 0 : o.call(s),
              errorLayout: void 0,
              loadingLayout: void 0,
              currentBatchSize: 0,
              counts: { current: 0, total: e.series.length },
            });
          this.setState({
            loadingLayout: void 0,
            errorLayout: void 0,
            emptyLayout: void 0,
            currentBatchSize: this.state.initialPageSize,
            counts: { current: i.length, total: e.series.length },
          });
          const l = i
            .slice(0, this.state.initialPageSize)
            .map((t, n) => this.state.getLayoutChild(e, t, n))
            .filter(Boolean);
          this.state.body.setState({ children: l });
        }
        initFilterAndSort() {
          ((this.searchText = a.sceneGraph.findByKeyAndType(this, "quick-search", G.I).state.value),
            (this.sortBy = a.sceneGraph.findByKeyAndType(
              this,
              "breakdown-sort-by",
              te,
            ).state.value.value));
        }
        filterAndSort(e) {
          let t = [];
          if (this.searchText) {
            const n = this.searchText
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
              .map((e) => {
                try {
                  return new RegExp(e);
                } catch (e) {
                  return null;
                }
              })
              .filter(Boolean);
            for (let r = 0; r < e.length; r += 1) {
              const a = e[r];
              n.some((e) => e.test(Q(a))) && t.push(a);
            }
          } else t = e;
          return (this.sortBy && (t = (0, X.sortSeries)(t, this.sortBy)), t);
        }
        filter(e) {
          this.searchText = e;
          const { data: t } = a.sceneGraph.getData(this).state;
          t && (this.publishEvent(new ae.H({}), !0), this.performRepeat(t));
        }
        sort(e) {
          this.sortBy = e;
          const { data: t } = a.sceneGraph.getData(this).state;
          t && (this.publishEvent(new ae.H({}), !0), this.performRepeat(t));
        }
        increaseBatchSize() {
          const { data: e } = a.sceneGraph.getData(this).state;
          if (!e) return;
          const t = this.state.currentBatchSize + this.state.pageSizeIncrement,
            n = this.filterAndSort(e.series)
              .slice(this.state.currentBatchSize, t)
              .map((t, n) => this.state.getLayoutChild(e, t, n))
              .filter(Boolean);
          (this.state.body.setState({ children: [...this.state.body.state.children, ...n] }),
            this.setState({ currentBatchSize: t }),
            this.publishEvent(new re.N({}), !0));
        }
        useSizes() {
          const { currentBatchSize: e, pageSizeIncrement: t } = this.useState(),
            { data: n } = a.sceneGraph.getData(this).state,
            r = n ? this.filterAndSort(n.series).length : 0,
            i = r - e;
          return { increment: i < t ? i : t, current: e, total: r };
        }
        getCounts() {
          const { data: e } = a.sceneGraph.getData(this).state;
          return { current: 0, total: e ? e.series.length : 0 };
        }
        constructor({
          $behaviors: e,
          body: t,
          getLayoutChild: n,
          getLayoutLoading: r,
          getLayoutError: i,
          getLayoutEmpty: o,
          initialPageSize: s,
          pageSizeIncrement: l,
          $data: c,
        }) {
          (super({
            key: "breakdown-by-frame-repeater",
            $behaviors: e,
            body: t,
            getLayoutChild: n,
            getLayoutLoading: r,
            getLayoutError: i,
            getLayoutEmpty: o,
            currentBatchSize: 0,
            initialPageSize: s || 120,
            pageSizeIncrement: l || 9,
            loadingLayout: void 0,
            errorLayout: void 0,
            emptyLayout: void 0,
            counts: { current: 0, total: 0 },
            $data: c,
          }),
            ie(this, "searchText", ""),
            ie(this, "sortBy", void 0),
            this.addActivationHandler(() => {
              const e = a.sceneGraph.getData(this);
              if (!e) throw new Error("No data provider found!");
              (this.initFilterAndSort(),
                this._subs.add(
                  e.subscribeToState((e) => {
                    e.data && this.performRepeat(e.data);
                  }),
                ),
                e.state.data && this.performRepeat(e.state.data));
            }));
        }
      }
      ie(oe, "Component", ({ model: e }) => {
        const { body: t, loadingLayout: n, errorLayout: r, emptyLayout: a } = e.useState();
        return n
          ? s().createElement(n.Component, { model: n })
          : r
            ? s().createElement(r.Component, { model: r })
            : a
              ? s().createElement(a.Component, { model: a })
              : s().createElement(t.Component, { model: t });
      });
      class se extends Y.I {
        constructor() {
          (super({ key: "LabelValuesCountsProvider" }),
            this.addActivationHandler(() => {
              const e = a.sceneGraph.findByKeyAndType(this, "breakdown-by-frame-repeater", oe);
              this._subs.add(
                e.subscribeToState((e, t) => {
                  e.counts !== t.counts && this.setState({ counts: e.counts });
                }),
              );
            }));
        }
      }
      function le(e, t, n) {
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
      function ce(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {},
            r = Object.keys(n);
          ("function" == typeof Object.getOwnPropertySymbols &&
            (r = r.concat(
              Object.getOwnPropertySymbols(n).filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable;
              }),
            )),
            r.forEach(function (t) {
              le(e, t, n[t]);
            }));
        }
        return e;
      }
      function ue(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      class de extends a.SceneObjectBase {
        onActivate() {
          this.subscribeToLayoutChange();
        }
        subscribeToQuickSearchChange() {
          (a.sceneUtils.syncStateFromSearchParams(
            this.state.quickSearch,
            new URLSearchParams(window.location.search),
          ),
            this._subs.add(
              this.subscribeToEvent(F.W, (e) => {
                const t = a.sceneGraph.findDescendents(this, oe)[0];
                t && t.filter(e.payload.searchText);
              }),
            ));
        }
        subscribeToSortByChange() {
          const { sortBySelector: e } = this.state;
          this._subs.add(
            e.subscribeToState((e, t) => {
              if (e.value.value !== (null == t ? void 0 : t.value.value)) {
                const t = a.sceneGraph.findDescendents(this, oe)[0];
                t && t.sort(e.value.value);
              }
            }),
          );
        }
        subscribeToLayoutChange() {
          const { layoutSwitcher: e } = this.state;
          a.sceneUtils.syncStateFromSearchParams(e, new URLSearchParams(window.location.search));
          const t = (e, t) => {
            e.layout !== (null == t ? void 0 : t.layout) && this.updateBody(e.layout);
          };
          (t(e.state), this._subs.add(e.subscribeToState(t)));
        }
        updateBody(e) {
          if (e === g.p.SINGLE) return void this.setState({ body: this.buildSinglePanel() });
          const t = a.sceneGraph.findDescendents(this, oe)[0],
            n = t || this.buildByFrameRepeater();
          (n.state.body.setState({ templateColumns: e === g.p.ROWS ? y._O : y.MV }),
            this.setState({ body: n }),
            t || (this.subscribeToQuickSearchChange(), this.subscribeToSortByChange()));
        }
        buildSinglePanel() {
          const { metric: e, label: t } = this.state;
          return new U.m({
            metric: e.name,
            discardUserPrefs: !0,
            panelOptions: {
              type: "timeseries",
              height: v.N.XL,
              headerActions: () => [],
              behaviors: [O({ description: { ctaText: "" } })],
            },
            queryOptions: { groupBy: t, data: a.sceneGraph.getData(this) },
          });
        }
        buildByFrameRepeater() {
          const { metric: e, label: t } = this.state,
            n = (0, q.N)(e.name);
          return new oe({
            $behaviors: [
              (0, _.U)(),
              new a.behaviors.CursorSync({
                key: "metricCrosshairSync",
                sync: m.DashboardCursorSync.Crosshair,
              }),
            ],
            body: new a.SceneCSSGridLayout({
              children: [],
              isLazy: !0,
              templateColumns: y.MV,
              autoRows: v.N.M,
            }),
            getLayoutLoading: () =>
              new a.SceneReactObject({ reactNode: s().createElement(i.Spinner, { inline: !0 }) }),
            getLayoutEmpty: () =>
              new a.SceneReactObject({
                reactNode: s().createElement(
                  h._,
                  { title: "", severity: "info" },
                  "No label values found for the current filters and time range.",
                ),
              }),
            getLayoutError: (e) =>
              new a.SceneReactObject({
                reactNode: s().createElement(h._, {
                  severity: "error",
                  title: "Error while loading metrics!",
                  error: e.errors[0],
                }),
              }),
            getLayoutChild: (r, i, o) => {
              if (i.length < 2) return null;
              const s = Q(i),
                l = s.startsWith("<unspecified"),
                c = l ? "" : s,
                u = new U.m({
                  metric: e.name,
                  discardUserPrefs: !0,
                  panelOptions: ue(ce({}, null == n ? void 0 : n.panelOptions), {
                    title: s,
                    fixedColorIndex: o,
                    description: "",
                    headerActions: l ? () => [] : () => [new W({ labelName: t, labelValue: c })],
                    menu: () => new N.G({ labelName: t }),
                    behaviors: [k()],
                  }),
                  queryOptions: ue(ce({}, null == n ? void 0 : n.queryOptions), {
                    labelMatchers: [{ key: t, operator: "=", value: c }],
                  }),
                });
              return new a.SceneCSSGridItem({ body: u });
            },
          });
        }
        Controls({ model: e }) {
          const t = (0, i.useStyles2)(pe),
            { body: n, quickSearch: a, layoutSwitcher: o, sortBySelector: l } = e.useState();
          return s().createElement(
            s().Fragment,
            null,
            n instanceof oe &&
              s().createElement(
                s().Fragment,
                null,
                s().createElement(
                  i.Field,
                  { className: (0, r.cx)(t.field, t.quickSearchField), label: "Search" },
                  s().createElement(a.Component, { model: a }),
                ),
                s().createElement(l.Component, { model: l }),
              ),
            s().createElement(
              i.Field,
              { label: "View", className: t.field },
              s().createElement(o.Component, { model: o }),
            ),
          );
        }
        constructor({ metric: e, label: t }) {
          const n = (0, H.H)({
            metric: e,
            queryConfig: {
              resolution: S.I.MEDIUM,
              labelMatchers: [],
              addIgnoreUsageFilter: !1,
              groupBy: t,
            },
          });
          (super({
            key: "metric-label-values-list",
            metric: e,
            label: t,
            layoutSwitcher: new g.U({
              urlSearchParamName: "breakdownLayout",
              options: [
                { label: "Single", value: g.p.SINGLE },
                { label: "Grid", value: g.p.GRID },
                { label: "Rows", value: g.p.ROWS },
              ],
            }),
            quickSearch: new G.I({
              urlSearchParamName: "breakdownSearchText",
              targetName: "label value",
              countsProvider: new se(),
              displayCounts: !0,
            }),
            sortBySelector: new te({ target: "labels" }),
            $data: new a.SceneDataTransformer({
              $data: new a.SceneQueryRunner({
                datasource: E.GH,
                maxDataPoints: n.maxDataPoints,
                queries: n.queries,
              }),
              transformations: [(0, z.b)(t)],
            }),
            body: void 0,
          }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function pe(e) {
        return {
          singlePanelContainer: (0, r.css)({ width: "100%", height: "300px" }),
          listContainer: (0, r.css)({ width: "100%" }),
          listFooter: (0, r.css)({
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: e.spacing(4),
            "& button": { height: "40px", borderRadius: "8px" },
          }),
          quickSearchField: (0, r.css)({ flexGrow: 1 }),
          field: (0, r.css)({ marginBottom: 0 }),
        };
      }
      (le(de, "Component", ({ model: e }) => {
        const { body: t } = e.useState();
        return s().createElement(
          s().Fragment,
          null,
          t instanceof U.m && s().createElement(de.SingleMetricPanelComponent, { model: e }),
          t instanceof oe && s().createElement(de.ByFrameRepeaterComponent, { model: e }),
        );
      }),
        le(de, "SingleMetricPanelComponent", ({ model: e }) => {
          const t = (0, i.useStyles2)(pe),
            { body: n } = e.useState();
          return s().createElement(
            "div",
            { "data-testid": "single-metric-panel" },
            s().createElement(
              "div",
              { className: t.singlePanelContainer },
              n instanceof U.m && s().createElement(n.Component, { model: n }),
            ),
          );
        }),
        le(de, "ByFrameRepeaterComponent", ({ model: e }) => {
          const t = (0, i.useStyles2)(pe),
            { body: n } = e.useState(),
            r = a.sceneGraph.getData(e),
            { state: o, errors: l } = r.useState().data || {},
            c = n,
            u = c.useSizes(),
            d =
              o !== m.LoadingState.Loading &&
              !(null == l ? void 0 : l.length) &&
              u.total > 0 &&
              u.current < u.total;
          return s().createElement(
            "div",
            { "data-testid": "label-values-list" },
            s().createElement(
              "div",
              { className: t.listContainer },
              n instanceof oe && s().createElement(n.Component, { model: n }),
            ),
            d &&
              s().createElement(
                "div",
                { className: t.listFooter },
                s().createElement(b.d, {
                  label: "label value",
                  batchSizes: u,
                  onClick: () => {
                    c.increaseBatchSize();
                  },
                }),
              ),
          );
        }));
      var me = n(337);
      function he(e, t, n, r, a, i, o) {
        try {
          var s = e[i](o),
            l = s.value;
        } catch (e) {
          return void n(e);
        }
        s.done ? t(l) : Promise.resolve(l).then(r, a);
      }
      class fe extends a.SceneObjectBase {
        onActivate() {
          const e = this.getVariable();
          (e.subscribeToState((t, n) => {
            t.value !== n.value && this.updateBody(e);
          }),
            c.config.featureToggles.enableScopesInMetricsExplore &&
              this.subscribeToEvent(E.H0, () => {
                this.updateBody(e);
              }),
            this.updateBody(e));
        }
        getVariable() {
          const e = a.sceneGraph.lookupVariable(E.yr, this);
          if (!(0, A.bA)(e)) throw new Error("Group by variable not found");
          return e;
        }
        updateBody(e) {
          return ((t = function* () {
            const { metric: t } = this.state,
              n = { name: t, type: yield (0, u.B)(t, (0, d.kj)(this)) },
              r = e.hasAllValue()
                ? new $({ metric: n })
                : new de({ metric: n, label: e.state.value });
            (this.setState({ body: r }),
              r.isActive
                ? (0, me.$)(this, $e.breakdown)
                : r.addActivationHandler(() => {
                    (0, me.$)(this, $e.breakdown);
                  }));
          }),
          function () {
            var e = this,
              n = arguments;
            return new Promise(function (r, a) {
              var i = t.apply(e, n);
              function o(e) {
                he(i, r, a, o, s, "next", e);
              }
              function s(e) {
                he(i, r, a, o, s, "throw", e);
              }
              o(void 0);
            });
          }).call(this);
          var t;
        }
        constructor({ metric: e }) {
          (super({ metric: e, body: void 0, $behaviors: [new a.behaviors.SceneQueryController()] }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function be(e, t, n) {
        return {
          container: (0, r.css)({
            flexGrow: 1,
            display: "flex",
            minHeight: "100%",
            flexDirection: "column",
          }),
          stickyControls: (0, r.css)({
            margin: e.spacing(1, 0, 1.5, 0),
            position: "sticky",
            top: `calc(var(--app-controls-height, 0px) + ${t}px + var(--action-bar-height, 0px))`,
            zIndex: 10,
            background: (0, p.T)(e, n),
            paddingBottom: e.spacing(1),
          }),
          controls: (0, r.css)({
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "end",
            flexWrap: "wrap",
            gap: e.spacing(1),
          }),
          searchField: (0, r.css)({ flexGrow: 1 }),
          miniSectionLabel: (0, r.css)({
            marginTop: e.spacing(2),
            marginBottom: e.spacing(1),
            fontSize: e.typography.bodySmall.fontSize,
            fontWeight: e.typography.fontWeightMedium,
            color: e.colors.text.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }),
        };
      }
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })(fe, "Component", ({ model: e }) => {
        const t = (0, c.useChromeHeaderHeight)(),
          n = (0, d.kj)(e),
          { embeddedMini: r } = n.state,
          a = (0, i.useStyles2)(be, n.state.embedded ? 0 : null != t ? t : 0, n),
          { body: o } = e.useState(),
          l = e.getVariable();
        return s().createElement(
          "div",
          { className: a.container },
          !r &&
            s().createElement(
              "div",
              { className: a.stickyControls, "data-testid": "breakdown-controls" },
              s().createElement(
                "div",
                { className: a.controls },
                s().createElement(l.Component, { model: l }),
                o instanceof $ && s().createElement(o.Controls, { model: o }),
                o instanceof de && s().createElement(o.Controls, { model: o }),
              ),
            ),
          r && s().createElement("div", { className: a.miniSectionLabel }, "Breakdown"),
          s().createElement(
            "div",
            { "data-testid": "panels-list" },
            o instanceof $ && s().createElement(o.Component, { model: o }),
            o instanceof de && s().createElement(o.Component, { model: o }),
          ),
        );
      });
      var ge = n(6359),
        ye = n(5732),
        ve = n(9365),
        Se = n(9194),
        we = n(3916),
        Oe = n(5665),
        Ee = n(7145),
        xe = n(9512),
        ke = n(3424),
        Ce = n(9331),
        Pe = n(297);
      function je(e, t, n) {
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
      function _e(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      const Te = { label: "All metric names", value: "all" };
      class Ie extends a.SceneObjectBase {
        getUrlState() {
          return { metricPrefix: this.state.value };
        }
        updateFromUrl(e) {
          "string" != typeof e.metricPrefix
            ? this.setState({ value: Te.value })
            : this.state.value !== e.metricPrefix && this.setState({ value: e.metricPrefix });
        }
        onActivate() {
          this.parseMetricPrefixes();
        }
        parseMetricPrefixes() {
          if (this._variableDependency.hasDependencyInLoadingState())
            return void this.setState({ error: void 0, loading: !0 });
          const e = a.sceneGraph.lookupVariable(Oe.$, this);
          if (e.state.error)
            return void this.setState({ error: e.state.error, loading: !1, options: [] });
          const t = (0, Pe.w)((0, f.a)(e)),
            n = [Te, ...t.map((e) => ({ value: e.value, label: `${e.label} (${e.count})` }))],
            { value: r } = this.state,
            i = n.find((e) => e.value === r) ? r : Te.value;
          (this.setState({ error: null, loading: !1, options: n }),
            this.selectOption({ value: i, label: i }));
        }
        constructor(e) {
          (super(
            _e(
              (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {},
                    r = Object.keys(n);
                  ("function" == typeof Object.getOwnPropertySymbols &&
                    (r = r.concat(
                      Object.getOwnPropertySymbols(n).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(n, e).enumerable;
                      }),
                    )),
                    r.forEach(function (t) {
                      je(e, t, n[t]);
                    }));
                }
                return e;
              })({}, e),
              {
                key: "related-prefix-filter",
                loading: !0,
                error: null,
                options: [Te],
                value: Te.value,
              },
            ),
          ),
            je(
              this,
              "_variableDependency",
              new a.VariableDependencyConfig(this, {
                variableNames: [Oe.$],
                onVariableUpdateCompleted: () => this.parseMetricPrefixes(),
              }),
            ),
            je(this, "_urlSync", new a.SceneObjectUrlSyncConfig(this, { keys: ["metricPrefix"] })),
            je(this, "selectOption", (e) => {
              const t = null === e ? Te.value : e.value;
              (this.setState({ value: t }),
                this.publishEvent(
                  new ke.Y({ type: "prefixes", filters: t === Te.value ? [] : [t] }),
                  !0,
                ));
            }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function Ae(e) {
        return {
          container: r.css`
      display: flex;

      & > div {
        margin: 0;
      }
    `,
          label: r.css`
      margin-right: 0;
      background-color: ${e.colors.background.primary};
      border: 1px solid ${e.colors.border.medium};
      border-right: 0 none;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    `,
          tooltipIcon: r.css`
      margin-left: ${e.spacing(0.5)};
    `,
        };
      }
      function De(e, t, n) {
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
      function Be(e, t) {
        return (
          (t = null != t ? t : {}),
          Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
            : (function (e, t) {
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
              })(Object(t)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
              }),
          e
        );
      }
      je(Ie, "Component", ({ model: e }) => {
        const t = (0, i.useStyles2)(Ae),
          { loading: n, options: r, value: a, error: o } = e.useState();
        return s().createElement(
          "div",
          { className: t.container, "data-testid": "prefix-filter-selector" },
          s().createElement(
            i.InlineField,
            {
              disabled: n,
              error: o && o.toString(),
              label: s().createElement(
                i.InlineLabel,
                { width: "auto", className: t.label },
                s().createElement("span", null, "View by"),
                s().createElement(
                  i.Tooltip,
                  {
                    content:
                      "View by the metric prefix. A metric prefix is a single word at the beginning of the metric name, relevant to the domain the metric belongs to.",
                    placement: "top",
                  },
                  s().createElement(i.Icon, {
                    className: t.tooltipIcon,
                    name: "info-circle",
                    size: "sm",
                  }),
                ),
              ),
            },
            s().createElement(i.Combobox, { value: a, onChange: e.selectOption, options: r }),
          ),
        );
      });
      class Me extends a.EmbeddedScene {
        constructor(e) {
          super(
            Be(
              (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {},
                    r = Object.keys(n);
                  ("function" == typeof Object.getOwnPropertySymbols &&
                    (r = r.concat(
                      Object.getOwnPropertySymbols(n).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(n, e).enumerable;
                      }),
                    )),
                    r.forEach(function (t) {
                      De(e, t, n[t]);
                    }));
                }
                return e;
              })({}, e),
              {
                key: "related-list-controls",
                body: new a.SceneFlexLayout({
                  direction: "row",
                  width: "100%",
                  maxHeight: "32px",
                  children: [
                    new a.SceneFlexItem({ width: "auto", body: new Ie({}) }),
                    new a.SceneFlexItem({
                      body: new G.I({
                        urlSearchParamName: "gmd-relatedSearchText",
                        targetName: "related metric",
                        countsProvider: new Ce.s(),
                        displayCounts: !0,
                      }),
                    }),
                    new a.SceneFlexItem({ width: "auto", body: new g.U({}) }),
                  ],
                }),
              },
            ),
          );
        }
      }
      function Ne() {
        return { controls: (0, r.css)({ display: "flex", alignItems: "end" }) };
      }
      De(Me, "Component", ({ model: e }) => {
        const t = (0, i.useStyles2)(Ne),
          { body: n } = e.useState();
        return s().createElement(
          "div",
          { className: t.controls, "data-testid": "related-list-controls" },
          s().createElement(n.Component, { model: n }),
        );
      });
      class Le extends a.SceneObjectBase {
        onActivate() {
          const e = a.sceneGraph.findByKeyAndType(this, Oe.$, Oe.s);
          (e.fetchAllMetrics(), this.subscribeToEvents(e));
        }
        subscribeToEvents(e) {
          this.initVariablesFilteringAndSorting();
          const t = e.subscribeToState((e) => {
            !1 === e.loading &&
              (t.unsubscribe(),
              this.state.body.isActive
                ? (0, me.$)(this, $e.related)
                : this.state.body.addActivationHandler(() => {
                    (0, me.$)(this, $e.related);
                  }));
          });
        }
        initVariablesFilteringAndSorting() {
          const { metric: e } = this.state,
            t = new Map();
          (this.subscribeToEvent(ye.x, (e) => {
            const { key: n } = e.payload,
              r = a.sceneGraph.findByKey(this, n);
            t.set(n, { filterEngine: new Ee.k(r), sortEngine: new xe.c(r) });
          }),
            this.subscribeToEvent(ve.e, (e) => {
              t.delete(e.payload.key);
            }));
          const n = a.sceneGraph.findByKeyAndType(this, "quick-search", G.I);
          (this.subscribeToEvent(Se.x, (r) => {
            const { key: a, options: i } = r.payload,
              { filterEngine: o, sortEngine: s } = t.get(a);
            o.setInitOptions(i);
            const l = { names: n.state.value ? [n.state.value] : [] };
            (o.applyFilters(l, { forceUpdate: !0, notify: !1 }), s.sort("related", { metric: e }));
          }),
            this.subscribeToEvent(F.W, (n) => {
              const { searchText: r } = n.payload;
              for (const [, { filterEngine: n, sortEngine: a }] of t)
                (n.applyFilters({ names: r ? [r] : [] }), a.sort("related", { metric: e }));
            }),
            this.subscribeToEvent(ke.Y, (n) => {
              const { type: r, filters: a } = n.payload;
              for (const [, { filterEngine: n, sortEngine: i }] of t)
                (n.applyFilters({ [r]: a }), i.sort("related", { metric: e }));
            }));
        }
        constructor({ metric: e }) {
          (super({
            metric: e,
            $variables: new a.SceneVariableSet({ variables: [new we.V()] }),
            $behaviors: [new a.behaviors.SceneQueryController()],
            key: "RelatedMetricsScene",
            body: new y.Qs({ variableName: we.h }),
            listControls: new Me({}),
          }),
            this.addActivationHandler(this.onActivate.bind(this)));
        }
      }
      function Re(e, t, n) {
        return {
          variables: (0, r.css)({ display: "none" }),
          searchSticky: (0, r.css)({
            margin: e.spacing(1, 0, 1.5, 0),
            position: "sticky",
            top: `calc(var(--app-controls-height, 0px) + ${t}px + var(--action-bar-height, 0px))`,
            zIndex: 10,
            background: (0, p.T)(e, n),
            paddingBottom: e.spacing(1),
          }),
        };
      }
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })(Le, "Component", ({ model: e }) => {
        const t = (0, c.useChromeHeaderHeight)(),
          n = (0, d.kj)(e),
          r = (0, i.useStyles2)(Re, n.state.embedded ? 0 : null != t ? t : 0, n),
          { $variables: a, body: o, listControls: l } = e.useState();
        return s().createElement(
          s().Fragment,
          null,
          s().createElement(
            "div",
            { className: r.searchSticky },
            s().createElement(l.Component, { model: l }),
          ),
          s().createElement(
            "div",
            { "data-testid": "panels-list" },
            s().createElement(o.Component, { model: o }),
          ),
          s().createElement(
            "div",
            { className: r.variables },
            null == a
              ? void 0
              : a.state.variables.map((e) =>
                  s().createElement(e.Component, { key: e.state.name, model: e }),
                ),
          ),
        );
      });
      const $e = { breakdown: "breakdown", related: "related", relatedLogs: "logs" },
        Ve = $e.breakdown,
        Fe = [
          {
            displayName: "Breakdown",
            value: $e.breakdown,
            getScene: (e) => new fe({ metric: e.state.metric }),
            backgroundTask: () => {},
          },
          {
            displayName: "Related metrics",
            value: $e.related,
            getScene: (e) => new Le({ metric: e.state.metric }),
            description: "Relevant metrics based on current label filters",
            backgroundTask: () => {},
          },
          {
            displayName: "Related logs",
            value: $e.relatedLogs,
            getScene: (e) => e.createRelatedLogsScene(),
            description: "Relevant logs based on current label filters and time range",
            backgroundTask: (e) => e.relatedLogsOrchestrator.findAndCheckAllDatasources(),
          },
        ];
      class Ge extends a.SceneObjectBase {}
      function qe(e) {
        return {
          actions: (0, r.css)({
            [e.breakpoints.up(e.breakpoints.values.md)]: {
              position: "absolute",
              right: 0,
              top: 16,
              zIndex: 2,
            },
          }),
          customTabsBar: (0, r.css)({ paddingBottom: e.spacing(1) }),
        };
      }
      !(function (e, t, n) {
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n);
      })(Ge, "Component", ({ model: e }) => {
        const t = a.sceneGraph.getAncestor(e, ge.R),
          n = (0, i.useStyles2)(qe),
          { actionView: r } = t.useState();
        return s().createElement(
          i.Box,
          { paddingY: 1, "data-testid": "action-bar", width: "100%" },
          s().createElement(
            "div",
            { className: n.actions },
            s().createElement(i.Stack, { gap: 1 }),
          ),
          s().createElement(
            i.TabsBar,
            { className: n.customTabsBar },
            Fe.map((e, n) => {
              const a = e.displayName,
                o = r === e.value,
                c = e.value === $e.relatedLogs ? t.state.relatedLogsCount : void 0,
                u = s().createElement(i.Tab, {
                  key: n,
                  label: a,
                  counter: c,
                  active: o,
                  onChangeTab: () => {
                    o ||
                      ((0, l.z)("metric_action_view_changed", {
                        view: e.value,
                        related_logs_count:
                          t.relatedLogsOrchestrator.checkConditionsMetForRelatedLogs() ? c : void 0,
                      }),
                      t.setActionView(e.value));
                  },
                });
              return e.description
                ? s().createElement(
                    i.Tooltip,
                    { key: n, content: e.description, placement: "top", theme: "info" },
                    u,
                  )
                : u;
            }),
          ),
        );
      });
    },
    9985: (e, t, n) => {
      n.d(t, { _: () => s });
      var r = n(6089),
        a = n(2007),
        i = n(5959),
        o = n.n(i);
      function s({ title: e, description: t }) {
        const n = (0, a.useStyles2)(l);
        return o().createElement(
          "h6",
          { className: n.title },
          o().createElement("span", null, e),
          o().createElement(
            a.Tooltip,
            { content: t, placement: "top" },
            o().createElement(a.Icon, { name: "info-circle", size: "sm", className: n.infoIcon }),
          ),
        );
      }
      function l(e) {
        return {
          title: (0, r.css)({
            fontSize: "15px",
            fontWeight: e.typography.fontWeightLight,
            borderBottom: `1px solid ${e.colors.border.weak}`,
            paddingBottom: e.spacing(0.5),
          }),
          infoIcon: (0, r.css)({
            marginLeft: e.spacing(1),
            cursor: "pointer",
            color: e.colors.text.secondary,
            position: "relative",
            top: "-4px",
          }),
        };
      }
    },
  },
]);
//# sourceMappingURL=935.js.map?_cache=fd2b5fa0f235da53b5b0
