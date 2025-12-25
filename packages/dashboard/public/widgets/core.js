
var process = { env: { NODE_ENV: 'production' } };
var require = (function() {
  const modules = {
    'react': window.React,
    'react-dom': window.ReactDOM,
  };
  return function(id) {
    if (id in modules) return modules[id];
    throw new Error('[CodeRefCore] Cannot find module: ' + id);
  };
})();
"use strict";
var CodeRefCore = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // packages/core/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    ErrorBoundary: () => ErrorBoundary,
    api: () => api,
    hooks: () => hooks_exports,
    isScriptboardWidget: () => isScriptboardWidget,
    utils: () => utils_exports,
    version: () => version
  });

  // packages/core/src/api/client.ts
  var BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
  async function apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API error: ${response.status}`);
    }
    return response.json();
  }
  var api = {
    // ============================================
    // Session
    // ============================================
    async getSession() {
      return apiCall("/api/session");
    },
    async setPrompt(content) {
      return apiCall("/api/prompt", {
        method: "POST",
        body: JSON.stringify({ content })
      });
    },
    async clearPrompt() {
      return apiCall("/api/prompt", { method: "DELETE" });
    },
    // ============================================
    // Attachments
    // ============================================
    async listAttachments() {
      return apiCall("/api/attachments");
    },
    async addAttachmentText(content, filename) {
      return apiCall("/api/attachments/text", {
        method: "POST",
        body: JSON.stringify({ content, filename })
      });
    },
    async clearAttachments() {
      return apiCall("/api/attachments", { method: "DELETE" });
    },
    // ============================================
    // Responses
    // ============================================
    async addResponse(content) {
      return apiCall("/api/responses", {
        method: "POST",
        body: JSON.stringify({ content })
      });
    },
    async getResponsesSummary() {
      return apiCall("/api/responses/summary");
    },
    async clearResponses() {
      return apiCall("/api/responses", { method: "DELETE" });
    },
    // ============================================
    // Preloaded Prompts
    // ============================================
    async getPreloadedPrompts() {
      return apiCall("/api/prompts/preloaded");
    },
    async usePreloadedPrompt(key) {
      return apiCall(`/api/prompts/preloaded/${key}`, { method: "POST" });
    },
    async addPreloadedPrompt(label, text) {
      return apiCall("/api/prompts/preloaded", {
        method: "POST",
        body: JSON.stringify({ label, text })
      });
    },
    // ============================================
    // Export
    // ============================================
    async exportLlmFriendly() {
      return apiCall("/api/export/llm-friendly");
    },
    async exportLlmFriendlyPrompt() {
      return apiCall("/api/export/llm-friendly/prompt");
    },
    async exportLlmFriendlyAttachments() {
      return apiCall("/api/export/llm-friendly/attachments");
    },
    async exportLlmFriendlyResponses() {
      return apiCall("/api/export/llm-friendly/responses");
    },
    // ============================================
    // Config
    // ============================================
    async getConfig() {
      return apiCall("/api/config");
    }
  };

  // packages/core/src/hooks/index.ts
  var hooks_exports = {};
  __export(hooks_exports, {
    useSession: () => useSession,
    useSessionRefresh: () => useSessionRefresh
  });

  // packages/core/src/hooks/useSession.ts
  var import_react2 = __require("react");

  // packages/core/src/hooks/useSessionRefresh.ts
  var import_react = __require("react");
  function useSessionRefresh(callback, deps = []) {
    (0, import_react.useEffect)(() => {
      const handler = () => callback();
      if (typeof window !== "undefined") {
        window.addEventListener("session-refresh", handler);
        return () => window.removeEventListener("session-refresh", handler);
      }
      return void 0;
    }, deps);
  }

  // packages/core/src/hooks/useSession.ts
  function useSession() {
    const [session, setSession] = (0, import_react2.useState)(null);
    const [loading, setLoading] = (0, import_react2.useState)(true);
    const [error, setError] = (0, import_react2.useState)(null);
    const refresh = (0, import_react2.useCallback)(async () => {
      try {
        setLoading(true);
        const data = await api.getSession();
        setSession(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load session"));
        if (false) {
          console.error("Session fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    }, []);
    (0, import_react2.useEffect)(() => {
      refresh();
    }, [refresh]);
    useSessionRefresh(refresh);
    return { session, loading, error, refresh };
  }

  // packages/core/src/utils/index.ts
  var utils_exports = {};
  __export(utils_exports, {
    clipboard: () => clipboard,
    fileHandlers: () => fileHandlers
  });

  // packages/core/src/utils/clipboard.ts
  var clipboard = {
    async read() {
      if (typeof window !== "undefined" && document.hasFocus()) {
        window.focus();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      try {
        return await navigator.clipboard.readText();
      } catch (error) {
        if (error instanceof Error && error.name === "NotAllowedError") {
          throw new Error("Clipboard access denied. Please click again to allow access.");
        }
        throw error;
      }
    },
    async write(text) {
      if (typeof window !== "undefined" && document.hasFocus()) {
        window.focus();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        if (error instanceof Error && error.name === "NotAllowedError") {
          throw new Error("Clipboard access denied. Please click again to allow access.");
        }
        throw error;
      }
    }
  };

  // packages/core/src/utils/fileHandlers.ts
  var fileHandlers = {
    isElectron() {
      return typeof window !== "undefined" && !!window.electronAPI;
    },
    async openFile(options = {}) {
      if (this.isElectron()) {
        try {
          const result = await window.electronAPI.openFileDialog({
            title: options.title || "Select file",
            filters: options.filters || [{ name: "All files", extensions: ["*"] }]
          });
          if (result?.filePath && !result.canceled) {
            const fileData = await window.electronAPI.readFile(result.filePath);
            if (fileData.error) {
              throw new Error(fileData.error);
            }
            return { content: fileData.content, filename: fileData.filename || "file.txt" };
          }
          return null;
        } catch (error) {
          console.error("Electron file dialog error:", error);
          throw error;
        }
      } else {
        return new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          if (options.filters?.[0]?.extensions) {
            input.accept = options.filters[0].extensions.map((ext) => `.${ext}`).join(",");
          }
          input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                const content = await file.text();
                resolve({ content, filename: file.name });
              } catch (error) {
                console.error("File read error:", error);
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };
          input.click();
        });
      }
    }
  };

  // packages/core/src/types/widget.ts
  function isScriptboardWidget(obj) {
    return typeof obj === "object" && typeof obj.id === "string" && typeof obj.name === "string" && typeof obj.version === "string" && typeof obj.render === "function";
  }

  // packages/core/src/components/ErrorBoundary.tsx
  var import_react3 = __toESM(__require("react"));
  var ErrorBoundary = class extends import_react3.default.Component {
    constructor(props) {
      super(props);
      __publicField(this, "handleRetry", () => {
        this.setState({ hasError: false, error: null });
      });
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
      console.error(
        `[ErrorBoundary${this.props.widgetId ? ` - ${this.props.widgetId}` : ""}] Error caught:`,
        error,
        errorInfo
      );
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    }
    render() {
      if (this.state.hasError && this.state.error) {
        if (this.props.fallback) {
          return this.props.fallback(this.state.error, this.handleRetry);
        }
        return /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-ind-panel border-2 border-ind-accent p-4 rounded" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "text-ind-accent text-xl" }, "\u26A0\uFE0F"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react3.default.createElement("h3", { className: "text-ind-accent font-bold uppercase tracking-wide mb-1" }, "Widget Error", this.props.widgetId && ` (${this.props.widgetId})`), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-ind-text-muted text-sm font-mono mb-3" }, this.state.error.message), /* @__PURE__ */ import_react3.default.createElement(
          "button",
          {
            onClick: this.handleRetry,
            className: "px-3 py-1 bg-ind-accent text-black text-xs font-bold uppercase tracking-wider hover:bg-ind-accent-hover transition-colors"
          },
          "Retry"
        ))));
      }
      return this.props.children;
    }
  };

  // packages/core/src/index.ts
  var version = "1.0.0";
  if (typeof window !== "undefined") {
    window.CodeRefCore = {
      api,
      hooks: hooks_exports,
      utils: utils_exports,
      version
    };
  }
  return __toCommonJS(src_exports);
})();
