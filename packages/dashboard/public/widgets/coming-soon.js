
var process = { env: { NODE_ENV: 'production' } };
var require = (function() {
  const modules = {
    'react': window.React,
    'react-dom': window.ReactDOM,
    'react/jsx-runtime': {
      jsx: window.React.jsx || function(type, props) {
        return window.React.createElement(type, props);
      },
      jsxs: window.React.jsxs || function(type, props) {
        return window.React.createElement(type, props);
      },
      Fragment: window.React.Fragment
    },
    'CodeRefCore': window.CodeRefCore,
  };
  return function(id) {
    if (id in modules) return modules[id];
    throw new Error('[WidgetLoader] Cannot find module: ' + id);
  };
})();
"use strict";
var CodeRefWidget_coming_soon = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/widgets/@coderef-dashboard/widget-coming-soon/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    ComingSoonCard: () => ComingSoonCard,
    ComingSoonWidget: () => ComingSoonWidget,
    default: () => src_default
  });
  var import_react2 = __toESM(__require("react"), 1);

  // packages/widgets/@coderef-dashboard/widget-coming-soon/src/ComingSoonCard.tsx
  var import_react = __toESM(__require("react"), 1);
  function ComingSoonCard({
    title = "More Widgets Coming Soon",
    description = "Additional widgets are being developed. Check back later!",
    eta = "Q1 2025"
  }) {
    const [coreStatus, setCoreStatus] = (0, import_react.useState)("loading");
    (0, import_react.useEffect)(() => {
      if (typeof window !== "undefined" && window.CodeRefCore) {
        setCoreStatus("ready");
      } else {
        setCoreStatus("error");
      }
    }, []);
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "w-full" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "bg-ind-panel border-2 border-ind-border p-8 relative" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent" }), /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent" }), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-center space-y-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-center" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "w-16 h-16 bg-ind-bg border-2 border-ind-accent flex items-center justify-center" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-ind-accent text-3xl" }, "\u{1F527}"))), /* @__PURE__ */ import_react.default.createElement("h1", { className: "text-2xl font-bold uppercase tracking-wider text-ind-text" }, title), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-ind-text-muted font-mono text-sm leading-relaxed" }, description), /* @__PURE__ */ import_react.default.createElement("div", { className: "px-4 py-2 bg-ind-bg border border-ind-border rounded" }, coreStatus === "ready" && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-green-500 text-xs font-mono" }, "\u2713 Core loaded \u2022 Ready for widgets"), coreStatus === "loading" && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-ind-text-muted text-xs font-mono" }, "\u23F3 Initializing core..."), coreStatus === "error" && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-ind-accent text-xs font-mono" }, "\u26A0\uFE0F Core not available")), /* @__PURE__ */ import_react.default.createElement("div", { className: "pt-4 border-t-2 border-ind-border" }, /* @__PURE__ */ import_react.default.createElement("p", { className: "text-ind-text-muted text-xs uppercase tracking-widest font-mono mb-2" }, "Expected Availability"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-ind-accent font-bold text-lg uppercase tracking-wider" }, eta)), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-center gap-2 pt-2" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "w-2 h-2 bg-ind-accent rounded-full animate-pulse" }), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-ind-text-muted text-xs font-mono uppercase tracking-wider" }, "In Development"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent" }), /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent" }), /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-ind-accent to-transparent opacity-30" }), /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute right-0 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-ind-accent to-transparent opacity-30" })), /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-4 text-center" }, /* @__PURE__ */ import_react.default.createElement("p", { className: "text-ind-text-muted text-xs font-mono" }, "Version 0.1.0 \u2022 CodeRef Dashboard")));
  }

  // packages/widgets/@coderef-dashboard/widget-coming-soon/src/index.ts
  var ComingSoonWidget = {
    id: "coming-soon",
    name: "Coming Soon",
    version: "0.1.0",
    description: "Placeholder widget showing coming soon message",
    settings: {
      title: "More Widgets Coming Soon",
      description: "Additional widgets are being developed. Check back later!",
      eta: "Q1 2025"
    },
    render() {
      return import_react2.default.createElement(ComingSoonCard, {
        title: this.settings?.title,
        description: this.settings?.description,
        eta: this.settings?.eta
      });
    },
    async onEnable() {
      console.log("[ComingSoonWidget] Widget enabled");
    },
    async onDisable() {
      console.log("[ComingSoonWidget] Widget disabled");
    },
    async onSettingsChange(payload) {
      console.log("[ComingSoonWidget] Settings changed:", payload);
      if (this.settings) {
        if ("title" in payload)
          this.settings.title = payload.title;
        if ("description" in payload)
          this.settings.description = payload.description;
        if ("eta" in payload)
          this.settings.eta = payload.eta;
      }
    },
    onError(error) {
      console.error("[ComingSoonWidget] Error:", error.message);
      return false;
    }
  };
  var src_default = ComingSoonWidget;
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=coming-soon.js.map
