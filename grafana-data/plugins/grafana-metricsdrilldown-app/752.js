(self.webpackChunkgrafana_metricsdrilldown_app =
  self.webpackChunkgrafana_metricsdrilldown_app || []).push([
  [752],
  {
    2087: (r, n, e) => {
      var t = {
        "./en-US/grafana-metricsdrilldown-app.json": [7826, 826],
        "./es-ES/grafana-metricsdrilldown-app.json": [5497, 497],
      };
      function a(r) {
        if (!e.o(t, r))
          return Promise.resolve().then(() => {
            var n = new Error("Cannot find module '" + r + "'");
            throw ((n.code = "MODULE_NOT_FOUND"), n);
          });
        var n = t[r],
          a = n[0];
        return e.e(n[1]).then(() => e.t(a, 19));
      }
      ((a.keys = () => Object.keys(t)), (a.id = 2087), (r.exports = a));
    },
    7752: (r, n, e) => {
      "use strict";
      function t(r, n, e, t, a, o, i) {
        try {
          var s = r[o](i),
            c = s.value;
        } catch (r) {
          return void e(r);
        }
        s.done ? n(c) : Promise.resolve(c).then(t, a);
      }
      (e.r(n), e.d(n, { loadResources: () => a }));
      const a = (r) => {
        return ((n = function* () {
          const n = "en-US",
            t = r || n;
          try {
            return yield e(2087)(`./${t}/grafana-metricsdrilldown-app.json`);
          } catch (r) {
            if (t !== n) return yield e(2087)(`./${n}/grafana-metricsdrilldown-app.json`);
            throw r;
          }
        }),
        function () {
          var r = this,
            e = arguments;
          return new Promise(function (a, o) {
            var i = n.apply(r, e);
            function s(r) {
              t(i, a, o, s, c, "next", r);
            }
            function c(r) {
              t(i, a, o, s, c, "throw", r);
            }
            s(void 0);
          });
        })();
        var n;
      };
    },
  },
]);
//# sourceMappingURL=752.js.map?_cache=0b264ba916a1692ed22a
