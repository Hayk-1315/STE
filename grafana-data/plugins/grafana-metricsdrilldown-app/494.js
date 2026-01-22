"use strict";
(self.webpackChunkgrafana_metricsdrilldown_app =
  self.webpackChunkgrafana_metricsdrilldown_app || []).push([
  [494],
  {
    8494: (e, t, a) => {
      (a.r(t), a.d(t, { default: () => h, getPageNav: () => w }));
      var r = a(7781),
        i = a(5591),
        n = a(8531),
        s = a(3014),
        o = a(5959),
        l = a.n(o),
        c = a(9762),
        m = a(6359),
        d = a(578),
        u = a(219);
      const p = (0, u.createAssistantContextItem)("structured", {
          hidden: !0,
          title: "Metrics Drilldown Features",
          data: {
            name: "Metrics Drilldown",
            description: "Queryless exploration tool for Prometheus-compatible metrics",
            features: {
              search: "Search metrics by name in the Quick Search input",
              filters: {
                labelFilters: "Apply label name and value filters in the Filters input",
                prefixFilters: "Filter by metric name prefix in the sidebar",
                suffixFilters: "Filter by metric name suffix in the sidebar",
                groupBy: "Group metrics by label using the Group by labels filter in sidebar",
              },
              sorting: "Sort by alphabetical, recently used, dashboard usage, or alerting rules",
              breakdown: "View metric labels in the Breakdown tab when a metric is selected",
              relatedMetrics: "Discover related metrics in the Related Metrics tab",
              relatedLogs: "Discover related logs in the Related Logs tab",
              sharing: "Use Copy URL button in panel menu to share metric views",
            },
            navigation: {
              metricsList: "Main view shows all available metrics",
              metricDetail: "Selecting a metric opens detailed view with tabs",
              tabs: ["Breakdown", "Related Metrics", "Related Logs"],
            },
          },
        }),
        b = [
          { prompt: "How can I find a metric I'm interested in?", context: [p] },
          { prompt: "How can I see a metric's labels?", context: [p] },
          { prompt: "When I find a metric of interest, what can I do next?", context: [p] },
        ];
      function w(e, t, a) {
        if (t && e instanceof m.R) {
          const e = new URLSearchParams(window.location.search),
            r = new URLSearchParams(e);
          r.set("actionView", c.nh);
          return {
            text: a,
            url: `${window.location.pathname}?${e.toString()}`,
            parentItem: {
              text: t,
              url: `${window.location.pathname}?${r.toString()}`,
              parentItem: {
                text: (0, i.t)("trail.breadcrumb.metrics", "Metrics"),
                url: window.location.pathname,
              },
            },
          };
        }
        if (e instanceof d.m)
          return { text: (0, i.t)("trail.breadcrumb.all-metrics", "All metrics") };
      }
      function h({ trail: e }) {
        (0, u.useProvideQuestions)("/a/grafana-metricsdrilldown-app/drilldown*", b);
        const { topScene: t, metric: a } = e.useState(),
          [i, c] = (0, o.useState)("");
        (0, o.useEffect)(() => {
          if (!(t instanceof m.R)) return void c("");
          c(t.getActionViewName());
          const e = t.subscribeToState(() => {
            c(t.getActionViewName());
          });
          return () => {
            e && e.unsubscribe();
          };
        }, [t]);
        const d = (0, o.useMemo)(() => w(t, a, i), [t, a, i]);
        return l().createElement(
          n.PluginPage,
          { pageNav: d, layout: r.PageLayoutType.Custom },
          l().createElement(
            s.UrlSyncContextProvider,
            {
              scene: e,
              createBrowserHistorySteps: !0,
              updateUrlOnInit: !0,
              namespace: e.state.urlNamespace,
            },
            l().createElement(e.Component, { model: e }),
          ),
        );
      }
    },
  },
]);
//# sourceMappingURL=494.js.map?_cache=ff9b6a2075e35a07f4a4
