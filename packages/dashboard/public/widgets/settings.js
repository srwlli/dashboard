
var require = (function() {
  const modules = {
    'react': window.React,
    'react-dom': window.ReactDOM,
  };
  return function(id) {
    if (id in modules) return modules[id];
    throw new Error('[WidgetLoader] Cannot find module: ' + id);
  };
})();
"use strict";
var CodeRefWidget_settings = (() => {
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

  // packages/widgets/@coderef-dashboard/widget-settings/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    SettingsWidgetExport: () => SettingsWidgetExport,
    default: () => src_default
  });
  var import_react4 = __toESM(__require("react"), 1);

  // packages/widgets/@coderef-dashboard/widget-settings/src/SettingsWidget.tsx
  var import_react3 = __toESM(__require("react"), 1);

  // packages/widgets/@coderef-dashboard/widget-settings/src/ThemeToggle.tsx
  var import_react2 = __toESM(__require("react"), 1);

  // packages/widgets/@coderef-dashboard/widget-settings/src/ThemeContext.tsx
  var import_react = __toESM(__require("react"), 1);
  var ThemeContext = (0, import_react.createContext)(void 0);
  function ThemeProvider({ children }) {
    const [theme, setThemeState] = (0, import_react.useState)("dark");
    const [mounted, setMounted] = (0, import_react.useState)(false);
    (0, import_react.useEffect)(() => {
      if (typeof window === "undefined")
        return;
      const savedTheme = localStorage.getItem("coderef-dashboard-theme");
      if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        setThemeState("dark");
        applyTheme("dark");
      }
      setMounted(true);
    }, []);
    const setTheme = (newTheme) => {
      setThemeState(newTheme);
      localStorage.setItem("coderef-dashboard-theme", newTheme);
      applyTheme(newTheme);
    };
    const applyTheme = (theme2) => {
      if (typeof window === "undefined")
        return;
      const htmlElement = document.documentElement;
      if (theme2 === "dark") {
        htmlElement.classList.add("dark");
        htmlElement.classList.remove("light");
      } else {
        htmlElement.classList.add("light");
        htmlElement.classList.remove("dark");
      }
    };
    if (!mounted) {
      return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, children);
    }
    return /* @__PURE__ */ import_react.default.createElement(ThemeContext.Provider, { value: { theme, setTheme } }, children);
  }
  function useTheme() {
    const context = (0, import_react.useContext)(ThemeContext);
    if (context === void 0) {
      throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
  }

  // packages/widgets/@coderef-dashboard/widget-settings/src/ThemeToggle.tsx
  function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const handleToggle = () => {
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    };
    return /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        onClick: handleToggle,
        className: "flex items-center justify-center gap-3 w-full px-4 py-3 bg-ind-panel border-2 border-ind-border hover:border-ind-accent transition-colors active:translate-y-0.5",
        "aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`
      },
      /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-xl" }, theme === "dark" ? "\u2600\uFE0F" : "\u{1F319}"),
      /* @__PURE__ */ import_react2.default.createElement("span", { className: "flex-1 text-left" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-ind-text font-bold uppercase tracking-wider text-sm" }, "Theme"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "block text-ind-text-muted text-xs font-mono" }, theme === "dark" ? "Dark Mode" : "Light Mode")),
      /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-2 h-2 bg-ind-accent rounded-full" })
    );
  }

  // packages/widgets/@coderef-dashboard/widget-settings/src/SettingsWidget.tsx
  function SettingsWidget() {
    return /* @__PURE__ */ import_react3.default.createElement("div", { className: "w-full space-y-6" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-ind-panel border-2 border-ind-border p-8 relative" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent" }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent" }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent" }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent" }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mb-8 border-b-2 border-ind-border pb-6" }, /* @__PURE__ */ import_react3.default.createElement("h2", { className: "text-2xl font-bold uppercase tracking-wider text-ind-text mb-2" }, "Dashboard Settings"), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-ind-text-muted text-sm font-mono" }, "Configure your dashboard preferences")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("h3", { className: "text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-3 font-bold" }, "Display"), /* @__PURE__ */ import_react3.default.createElement(ThemeToggle, null)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "pt-4 border-t border-ind-border border-dashed" }, /* @__PURE__ */ import_react3.default.createElement("h3", { className: "text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-3 font-bold" }, "Layout"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "px-4 py-3 bg-ind-bg border border-ind-border border-dashed rounded" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-ind-text-muted text-xs" }, "Layout options coming soon..."))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "pt-4 border-t border-ind-border border-dashed" }, /* @__PURE__ */ import_react3.default.createElement("h3", { className: "text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-3 font-bold" }, "Widgets"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "px-4 py-3 bg-ind-bg border border-ind-border border-dashed rounded" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-ind-text-muted text-xs" }, "Widget management coming soon..."))))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "text-center" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-ind-text-muted text-xs font-mono" }, "Version 0.1.0 \u2022 CodeRef Dashboard Settings")));
  }

  // packages/widgets/@coderef-dashboard/widget-settings/src/index.ts
  var SettingsWidgetExport = {
    id: "settings",
    name: "Settings",
    version: "0.1.0",
    description: "Dashboard settings and preferences",
    settings: {
      // Settings can be expanded in the future
    },
    render() {
      return import_react4.default.createElement(
        ThemeProvider,
        {},
        import_react4.default.createElement(SettingsWidget)
      );
    },
    async onEnable() {
      console.log("[SettingsWidget] Initialized");
    },
    async onDisable() {
      console.log("[SettingsWidget] Disabled");
    },
    async onSettingsChange(payload) {
      console.log("[SettingsWidget] Settings changed:", payload);
    },
    onError(error) {
      console.error("[SettingsWidget] Error:", error.message);
      return false;
    }
  };
  var src_default = SettingsWidgetExport;
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=settings.js.map
