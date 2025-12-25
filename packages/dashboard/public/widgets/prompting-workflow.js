
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
var CodeRefWidget_prompting_workflow = (() => {
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

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    AttachmentDropZone: () => AttachmentDropZone,
    AttachmentManager: () => AttachmentManager,
    ExportMenu: () => ExportMenu,
    PRELOADED_PROMPTS: () => PRELOADED_PROMPTS,
    PasteFinalResultModal: () => PasteFinalResultModal,
    PasteTextModal: () => PasteTextModal,
    PromptSelector: () => PromptSelector,
    PromptingWorkflow: () => PromptingWorkflow,
    WorkflowMeta: () => WorkflowMeta,
    calculateTotalTokens: () => calculateTotalTokens,
    default: () => src_default,
    estimatePromptTokens: () => estimatePromptTokens,
    estimateTokens: () => estimateTokens,
    formatTokenCount: () => formatTokenCount,
    generateClipboardFilename: () => generateClipboardFilename,
    generateJSON: () => generateJSON,
    generateMarkdown: () => generateMarkdown,
    generateUniqueFilename: () => generateUniqueFilename,
    getAllPrompts: () => getAllPrompts,
    getLanguage: () => getLanguage,
    getNextClipboardNumber: () => getNextClipboardNumber,
    getPrompt: () => getPrompt,
    getTokenWarning: () => getTokenWarning,
    languageMap: () => languageMap,
    readFileContent: () => readFileContent,
    shouldWarnTokens: () => shouldWarnTokens,
    useClipboard: () => useClipboard,
    useFileHandlers: () => useFileHandlers,
    useWorkflow: () => useWorkflow
  });
  var import_react11 = __toESM(__require("react"));

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PromptingWorkflow.tsx
  var import_react10 = __require("react");

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/utils/tokenEstimator.ts
  function estimateTokens(content) {
    if (!content)
      return 0;
    return Math.ceil(content.length / 4);
  }
  function estimatePromptTokens(promptText) {
    return estimateTokens(promptText);
  }
  function calculateTotalTokens(promptTokens, attachmentTokens) {
    const attachmentTotal = attachmentTokens.reduce((sum, tokens) => sum + tokens, 0);
    return promptTokens + attachmentTotal;
  }
  function formatTokenCount(tokens) {
    if (tokens < 1e3) {
      return `~${tokens}`;
    } else if (tokens < 1e6) {
      return `~${(tokens / 1e3).toFixed(1)}K`;
    } else {
      return `~${(tokens / 1e6).toFixed(1)}M`;
    }
  }
  function shouldWarnTokens(tokens) {
    return tokens > 1e5;
  }
  function getTokenWarning(tokens) {
    if (tokens > 15e4) {
      return `\u26A0\uFE0F Token count ${formatTokenCount(tokens)} exceeds recommended limit (100K). LLM may struggle with this context.`;
    }
    if (tokens > 1e5) {
      return `\u26A0\uFE0F Token count ${formatTokenCount(tokens)} exceeds recommended limit (100K). Consider splitting attachments.`;
    }
    return null;
  }

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PromptSelector.module.css
  var PromptSelector_default = {
    container: "PromptSelector_container",
    title: "PromptSelector_title",
    subtitle: "PromptSelector_subtitle",
    promptGrid: "PromptSelector_promptGrid",
    promptCard: "PromptSelector_promptCard",
    selected: "PromptSelector_selected",
    promptHeader: "PromptSelector_promptHeader",
    promptName: "PromptSelector_promptName",
    tokenBadge: "PromptSelector_tokenBadge",
    promptDescription: "PromptSelector_promptDescription",
    promptMeta: "PromptSelector_promptMeta",
    promptKey: "PromptSelector_promptKey",
    tokenCount: "PromptSelector_tokenCount",
    selectedInfo: "PromptSelector_selectedInfo",
    selectedText: "PromptSelector_selectedText"
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PromptSelector.tsx
  var import_jsx_runtime = __require("react/jsx-runtime");
  var PromptSelector = ({
    prompts,
    selectedPromptKey,
    onSelectPrompt
  }) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: PromptSelector_default.container, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: PromptSelector_default.title, children: "Select Prompt" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: PromptSelector_default.subtitle, children: "Choose an analysis workflow" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: PromptSelector_default.promptGrid, children: prompts.map((prompt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          className: `${PromptSelector_default.promptCard} ${selectedPromptKey === prompt.key ? PromptSelector_default.selected : ""}`,
          onClick: () => onSelectPrompt(prompt),
          type: "button",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: PromptSelector_default.promptHeader, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: PromptSelector_default.promptName, children: prompt.label }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: PromptSelector_default.tokenBadge, children: formatTokenCount(prompt.estimatedTokens) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: PromptSelector_default.promptDescription, children: prompt.description }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: PromptSelector_default.promptMeta, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: PromptSelector_default.promptKey, children: [
                "Prompt ",
                prompt.key
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: PromptSelector_default.tokenCount, children: [
                "~",
                prompt.estimatedTokens.toLocaleString(),
                " tokens"
              ] })
            ] })
          ]
        },
        prompt.key
      )) }),
      selectedPromptKey && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: PromptSelector_default.selectedInfo, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: PromptSelector_default.selectedText, children: [
        "Selected: ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: prompts.find((p) => p.key === selectedPromptKey)?.label })
      ] }) })
    ] });
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/AttachmentManager.tsx
  var import_react4 = __require("react");

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/AttachmentDropZone.tsx
  var import_react = __require("react");

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/utils/languageMap.ts
  var languageMap = {
    // Web & TypeScript
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".less": "less",
    // Python
    ".py": "python",
    // Go
    ".go": "go",
    // Java & JVM
    ".java": "java",
    ".kotlin": "kotlin",
    ".scala": "scala",
    // C/C++/Rust
    ".cpp": "cpp",
    ".cc": "cpp",
    ".cxx": "cpp",
    ".c": "c",
    ".h": "c",
    ".hpp": "cpp",
    ".rs": "rust",
    // Ruby & PHP
    ".rb": "ruby",
    ".php": "php",
    // Data & Config
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".xml": "xml",
    ".csv": "csv",
    ".toml": "toml",
    // Database
    ".sql": "sql",
    // Markdown & Text
    ".md": "markdown",
    ".txt": "text",
    // Shell & Scripts
    ".sh": "bash",
    ".bash": "bash",
    ".zsh": "bash",
    // Build & Config
    ".gradle": "gradle",
    ".maven": "maven",
    ".docker": "dockerfile",
    // Default fallback
    "default": "plaintext"
  };
  function getLanguage(extension) {
    return languageMap[extension] || languageMap["default"];
  }

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/utils/fileContentExtractor.ts
  async function readFileContent(file) {
    const id = Math.random().toString(36).substring(2, 11);
    const filename = file.name;
    const extension = getFileExtension(filename);
    const language = languageMap[extension] || "plaintext";
    const isText = isTextFile(extension);
    const isBinary = !isText;
    let content;
    let preview;
    if (isText) {
      try {
        content = await file.text();
        preview = content.substring(0, 200);
      } catch (error) {
        console.error(`Failed to read text from file: ${filename}`, error);
      }
    }
    return {
      id,
      filename,
      type: isImage(extension) ? "IMAGE" : "FILE",
      extension,
      mimeType: file.type || getMimeType(extension),
      size: file.size,
      content,
      preview,
      language,
      isText,
      isBinary,
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  function getFileExtension(filename) {
    const parts = filename.split(".");
    if (parts.length > 1) {
      return "." + parts[parts.length - 1].toLowerCase();
    }
    return "";
  }
  function isTextFile(extension) {
    const textExtensions = [
      ".txt",
      ".md",
      ".json",
      ".js",
      ".ts",
      ".tsx",
      ".jsx",
      ".py",
      ".go",
      ".java",
      ".cpp",
      ".c",
      ".h",
      ".rs",
      ".rb",
      ".php",
      ".html",
      ".css",
      ".scss",
      ".yaml",
      ".yml",
      ".xml",
      ".csv",
      ".sql",
      ".sh",
      ".bash",
      ".gradle",
      ".maven"
    ];
    return textExtensions.includes(extension);
  }
  function isImage(extension) {
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".webp"];
    return imageExtensions.includes(extension);
  }
  function getMimeType(extension) {
    const mimeTypes = {
      ".txt": "text/plain",
      ".md": "text/markdown",
      ".json": "application/json",
      ".js": "text/javascript",
      ".ts": "text/typescript",
      ".tsx": "text/typescript",
      ".jsx": "text/javascript",
      ".py": "text/x-python",
      ".go": "text/x-go",
      ".java": "text/x-java",
      ".cpp": "text/x-cpp",
      ".c": "text/x-c",
      ".rs": "text/x-rust",
      ".rb": "text/x-ruby",
      ".html": "text/html",
      ".css": "text/css",
      ".xml": "application/xml",
      ".csv": "text/csv",
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".webp": "image/webp"
    };
    return mimeTypes[extension] || "application/octet-stream";
  }

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/AttachmentDropZone.module.css
  var AttachmentDropZone_default = {
    dropZone: "AttachmentDropZone_dropZone",
    drag: "AttachmentDropZone_drag",
    loading: "AttachmentDropZone_loading",
    success: "AttachmentDropZone_success",
    error: "AttachmentDropZone_error",
    disabled: "AttachmentDropZone_disabled",
    content: "AttachmentDropZone_content",
    icon: "AttachmentDropZone_icon",
    spinner: "AttachmentDropZone_spinner",
    spin: "AttachmentDropZone_spin",
    message: "AttachmentDropZone_message",
    hint: "AttachmentDropZone_hint"
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/AttachmentDropZone.tsx
  var import_jsx_runtime2 = __require("react/jsx-runtime");
  var AttachmentDropZone = ({
    onFilesAdded,
    disabled = false
  }) => {
    const [state, setState] = (0, import_react.useState)("idle");
    const [errorMessage, setErrorMessage] = (0, import_react.useState)(null);
    const handleDragOver = (0, import_react.useCallback)((e) => {
      if (disabled)
        return;
      e.preventDefault();
      e.stopPropagation();
      setState("drag");
    }, [disabled]);
    const handleDragLeave = (0, import_react.useCallback)((e) => {
      if (disabled)
        return;
      e.preventDefault();
      e.stopPropagation();
      setState("idle");
    }, [disabled]);
    const handleDrop = (0, import_react.useCallback)(
      async (e) => {
        if (disabled)
          return;
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) {
          setState("idle");
          return;
        }
        setState("loading");
        setErrorMessage(null);
        try {
          const attachments = await Promise.all(files.map((file) => readFileContent(file)));
          onFilesAdded(attachments);
          setState("success");
          setTimeout(() => setState("idle"), 2e3);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to process files";
          setErrorMessage(message);
          setState("error");
          setTimeout(() => setState("idle"), 3e3);
        }
      },
      [disabled, onFilesAdded]
    );
    const handleFileInput = (0, import_react.useCallback)(
      async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0)
          return;
        setState("loading");
        setErrorMessage(null);
        try {
          const attachments = await Promise.all(files.map((file) => readFileContent(file)));
          onFilesAdded(attachments);
          setState("success");
          setTimeout(() => setState("idle"), 2e3);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to process files";
          setErrorMessage(message);
          setState("error");
          setTimeout(() => setState("idle"), 3e3);
        }
      },
      [onFilesAdded]
    );
    const stateMessage = {
      idle: "Drag files here or click to browse",
      drag: "Drop files to attach",
      loading: "Processing files...",
      success: "\u2713 Files added successfully",
      error: "\u2717 Error processing files"
    };
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "div",
      {
        className: `${AttachmentDropZone_default.dropZone} ${AttachmentDropZone_default[state]} ${disabled ? AttachmentDropZone_default.disabled : ""}`,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              type: "file",
              multiple: true,
              onChange: handleFileInput,
              disabled: disabled || state === "loading",
              style: { display: "none" },
              id: "file-input"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { htmlFor: "file-input", className: AttachmentDropZone_default.content, children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: AttachmentDropZone_default.icon, children: [
              state === "loading" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: AttachmentDropZone_default.spinner, children: "\u27F3" }),
              state === "success" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u2713" }),
              state === "error" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u26A0" }),
              ["idle", "drag"].includes(state) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u{1F4CE}" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: AttachmentDropZone_default.message, children: stateMessage[state] }),
            errorMessage && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: AttachmentDropZone_default.error, children: errorMessage }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: AttachmentDropZone_default.hint, children: "Supports code, text, markdown, JSON, and other text files" })
          ] })
        ]
      }
    );
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PasteTextModal.tsx
  var import_react3 = __require("react");

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/utils/filenameGenerator.ts
  function generateClipboardFilename(existingFiles) {
    const clipboardPattern = /^clipboard_(\d+)\.txt$/;
    const usedNumbers = /* @__PURE__ */ new Set();
    for (const file of existingFiles) {
      const match = file.match(clipboardPattern);
      if (match) {
        usedNumbers.add(parseInt(match[1], 10));
      }
    }
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
      nextNumber++;
    }
    return `clipboard_${String(nextNumber).padStart(3, "0")}.txt`;
  }
  function generateUniqueFilename(originalName, existingFiles) {
    if (!existingFiles.includes(originalName)) {
      return originalName;
    }
    const lastDot = originalName.lastIndexOf(".");
    const baseName = lastDot > 0 ? originalName.substring(0, lastDot) : originalName;
    const extension = lastDot > 0 ? originalName.substring(lastDot) : "";
    for (let i = 1; i <= 1e3; i++) {
      const newName = `${baseName}_${i}${extension}`;
      if (!existingFiles.includes(newName)) {
        return newName;
      }
    }
    const timestamp = Date.now();
    return `${baseName}_${timestamp}${extension}`;
  }
  function getNextClipboardNumber(existingFiles) {
    const clipboardPattern = /^clipboard_(\d+)\.txt$/;
    let maxNumber = 0;
    for (const file of existingFiles) {
      const match = file.match(clipboardPattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }
    return maxNumber + 1;
  }

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/hooks/useClipboard.ts
  var import_react2 = __require("react");
  function useClipboard() {
    const [status, setStatus] = (0, import_react2.useState)({
      loading: false,
      error: null,
      success: false
    });
    const write = (0, import_react2.useCallback)(async (text) => {
      setStatus({ loading: true, error: null, success: false });
      try {
        if (window.CodeRefCore?.utils?.clipboard?.write) {
          await window.CodeRefCore.utils.clipboard.write(text);
          setStatus({ loading: false, error: null, success: true });
          return true;
        }
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          setStatus({ loading: false, error: null, success: true });
          return true;
        }
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (success) {
          setStatus({ loading: false, error: null, success: true });
          return true;
        }
        throw new Error("Clipboard write failed - all methods exhausted");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to write to clipboard";
        setStatus({ loading: false, error: errorMessage, success: false });
        return false;
      }
    }, []);
    const read = (0, import_react2.useCallback)(async () => {
      setStatus({ loading: true, error: null, success: false });
      try {
        if (window.CodeRefCore?.utils?.clipboard?.read) {
          const text = await window.CodeRefCore.utils.clipboard.read();
          setStatus({ loading: false, error: null, success: true });
          return text;
        }
        if (navigator.clipboard?.readText) {
          const text = await navigator.clipboard.readText();
          setStatus({ loading: false, error: null, success: true });
          return text;
        }
        throw new Error("Clipboard read failed - method not available");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to read from clipboard";
        setStatus({ loading: false, error: errorMessage, success: false });
        return null;
      }
    }, []);
    const clearStatus = (0, import_react2.useCallback)(() => {
      setStatus({ loading: false, error: null, success: false });
    }, []);
    return {
      write,
      read,
      status,
      clearStatus
    };
  }

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PasteTextModal.module.css
  var PasteTextModal_default = {
    overlay: "PasteTextModal_overlay",
    modal: "PasteTextModal_modal",
    header: "PasteTextModal_header",
    title: "PasteTextModal_title",
    closeButton: "PasteTextModal_closeButton",
    body: "PasteTextModal_body",
    formGroup: "PasteTextModal_formGroup",
    label: "PasteTextModal_label",
    input: "PasteTextModal_input",
    textarea: "PasteTextModal_textarea",
    hint: "PasteTextModal_hint",
    footer: "PasteTextModal_footer",
    cancelButton: "PasteTextModal_cancelButton",
    submitButton: "PasteTextModal_submitButton"
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PasteTextModal.tsx
  var import_jsx_runtime3 = __require("react/jsx-runtime");
  var PasteTextModal = ({
    isOpen,
    existingFilenames,
    onTextAdded,
    onClose
  }) => {
    const [text, setText] = (0, import_react3.useState)("");
    const [filename, setFilename] = (0, import_react3.useState)("");
    const [isLoading, setIsLoading] = (0, import_react3.useState)(false);
    const { read: readClipboard } = useClipboard();
    (0, import_react3.useEffect)(() => {
      if (isOpen) {
        setIsLoading(true);
        readClipboard().then((clipboardText) => {
          if (clipboardText) {
            setText(clipboardText);
            const generatedFilename = generateClipboardFilename(existingFilenames);
            setFilename(generatedFilename);
          }
          setIsLoading(false);
        });
      }
    }, [isOpen, readClipboard, existingFilenames]);
    const handleSubmit = (0, import_react3.useCallback)(() => {
      if (!text.trim()) {
        alert("Please enter text to paste");
        return;
      }
      if (!filename.trim()) {
        alert("Please enter a filename");
        return;
      }
      const attachment = {
        id: Math.random().toString(36).substring(2, 11),
        filename: filename.trim(),
        type: "PASTED_TEXT",
        extension: ".txt",
        mimeType: "text/plain",
        size: text.length,
        content: text,
        preview: text.substring(0, 200),
        language: "text",
        isText: true,
        isBinary: false,
        createdAt: /* @__PURE__ */ new Date()
      };
      onTextAdded(attachment);
      setText("");
      setFilename("");
      onClose();
    }, [text, filename, onTextAdded, onClose]);
    const handleClose = (0, import_react3.useCallback)(() => {
      setText("");
      setFilename("");
      onClose();
    }, [onClose]);
    if (!isOpen)
      return null;
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: PasteTextModal_default.overlay, onClick: handleClose, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: PasteTextModal_default.modal, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: PasteTextModal_default.header, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: PasteTextModal_default.title, children: "Paste Text as Attachment" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: PasteTextModal_default.closeButton, onClick: handleClose, children: "\u2715" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: PasteTextModal_default.body, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: PasteTextModal_default.formGroup, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: PasteTextModal_default.label, children: "Filename" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "input",
            {
              type: "text",
              className: PasteTextModal_default.input,
              value: filename,
              onChange: (e) => setFilename(e.target.value),
              placeholder: "clipboard_001.txt"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: PasteTextModal_default.hint, children: [
            "Auto-generated: ",
            generateClipboardFilename(existingFilenames)
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: PasteTextModal_default.formGroup, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: PasteTextModal_default.label, children: "Text Content" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "textarea",
            {
              className: PasteTextModal_default.textarea,
              value: text,
              onChange: (e) => setText(e.target.value),
              placeholder: "Paste text here...",
              disabled: isLoading
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: PasteTextModal_default.hint, children: text.length > 0 ? `${text.length} characters (~${Math.ceil(text.length / 4)} tokens)` : "Paste or type text here" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: PasteTextModal_default.footer, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: PasteTextModal_default.cancelButton, onClick: handleClose, children: "Cancel" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            className: PasteTextModal_default.submitButton,
            onClick: handleSubmit,
            disabled: isLoading || !text.trim(),
            children: isLoading ? "Loading..." : "Add Text as Attachment"
          }
        )
      ] })
    ] }) });
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/AttachmentManager.module.css
  var AttachmentManager_default = {
    container: "AttachmentManager_container",
    title: "AttachmentManager_title",
    actions: "AttachmentManager_actions",
    pasteButton: "AttachmentManager_pasteButton",
    clearButton: "AttachmentManager_clearButton",
    summary: "AttachmentManager_summary",
    summaryItem: "AttachmentManager_summaryItem",
    summaryLabel: "AttachmentManager_summaryLabel",
    summaryValue: "AttachmentManager_summaryValue",
    attachmentList: "AttachmentManager_attachmentList",
    listTitle: "AttachmentManager_listTitle",
    attachmentItem: "AttachmentManager_attachmentItem",
    attachmentHeader: "AttachmentManager_attachmentHeader",
    attachmentIcon: "AttachmentManager_attachmentIcon",
    attachmentInfo: "AttachmentManager_attachmentInfo",
    attachmentName: "AttachmentManager_attachmentName",
    attachmentMeta: "AttachmentManager_attachmentMeta",
    removeButton: "AttachmentManager_removeButton",
    attachmentPreview: "AttachmentManager_attachmentPreview"
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/AttachmentManager.tsx
  var import_jsx_runtime4 = __require("react/jsx-runtime");
  var AttachmentManager = ({
    attachments,
    onAddAttachments,
    onRemoveAttachment,
    onClearAll
  }) => {
    const [showPasteModal, setShowPasteModal] = (0, import_react4.useState)(false);
    const existingFilenames = attachments.map((a) => a.filename);
    const handleTextAdded = (0, import_react4.useCallback)(
      (attachment) => {
        onAddAttachments([attachment]);
      },
      [onAddAttachments]
    );
    const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);
    const totalTokens = Math.ceil(
      attachments.reduce((sum, a) => sum + (a.content?.length || 0), 0) / 4
    );
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.container, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: AttachmentManager_default.title, children: "Attachments" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(AttachmentDropZone, { onFilesAdded: onAddAttachments, disabled: false }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.actions, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            className: AttachmentManager_default.pasteButton,
            onClick: () => setShowPasteModal(true),
            type: "button",
            children: "+ Paste Text"
          }
        ),
        attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { className: AttachmentManager_default.clearButton, onClick: onClearAll, type: "button", children: "Clear All" })
      ] }),
      attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.summary, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.summaryItem, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: AttachmentManager_default.summaryLabel, children: "Files:" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: AttachmentManager_default.summaryValue, children: attachments.length })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.summaryItem, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: AttachmentManager_default.summaryLabel, children: "Size:" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: AttachmentManager_default.summaryValue, children: [
            (totalSize / 1024).toFixed(1),
            " KB"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.summaryItem, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: AttachmentManager_default.summaryLabel, children: "Tokens:" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: AttachmentManager_default.summaryValue, children: formatTokenCount(totalTokens) })
        ] })
      ] }),
      attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.attachmentList, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: AttachmentManager_default.listTitle, children: "Attached Files" }),
        attachments.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.attachmentItem, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.attachmentHeader, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: AttachmentManager_default.attachmentIcon, children: attachment.type === "IMAGE" ? "\u{1F5BC}\uFE0F" : "\u{1F4C4}" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: AttachmentManager_default.attachmentInfo, children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: AttachmentManager_default.attachmentName, children: attachment.filename }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { className: AttachmentManager_default.attachmentMeta, children: [
                (attachment.size / 1024).toFixed(1),
                " KB",
                attachment.language && ` \u2022 ${attachment.language}`
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              "button",
              {
                className: AttachmentManager_default.removeButton,
                onClick: () => onRemoveAttachment(attachment.id),
                title: "Remove attachment",
                children: "\u2715"
              }
            )
          ] }),
          attachment.preview && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: AttachmentManager_default.attachmentPreview, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { children: [
            attachment.preview,
            "..."
          ] }) })
        ] }, attachment.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        PasteTextModal,
        {
          isOpen: showPasteModal,
          existingFilenames,
          onTextAdded: handleTextAdded,
          onClose: () => setShowPasteModal(false)
        }
      )
    ] });
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/WorkflowMeta.tsx
  var import_react5 = __require("react");

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/WorkflowMeta.module.css
  var WorkflowMeta_default = {
    container: "WorkflowMeta_container",
    title: "WorkflowMeta_title",
    grid: "WorkflowMeta_grid",
    card: "WorkflowMeta_card",
    cardTitle: "WorkflowMeta_cardTitle",
    promptInfo: "WorkflowMeta_promptInfo",
    promptLabel: "WorkflowMeta_promptLabel",
    promptTokens: "WorkflowMeta_promptTokens",
    empty: "WorkflowMeta_empty",
    stats: "WorkflowMeta_stats",
    stat: "WorkflowMeta_stat",
    statLabel: "WorkflowMeta_statLabel",
    statValue: "WorkflowMeta_statValue",
    tokenCount: "WorkflowMeta_tokenCount",
    warning: "WorkflowMeta_warning",
    tokenBreakdown: "WorkflowMeta_tokenBreakdown",
    sectionTitle: "WorkflowMeta_sectionTitle",
    languages: "WorkflowMeta_languages",
    fileTypes: "WorkflowMeta_fileTypes",
    languageBadges: "WorkflowMeta_languageBadges",
    fileTypeBadges: "WorkflowMeta_fileTypeBadges",
    languageBadge: "WorkflowMeta_languageBadge",
    fileTypeBadge: "WorkflowMeta_fileTypeBadge",
    warningBox: "WorkflowMeta_warningBox",
    warningText: "WorkflowMeta_warningText",
    warningHint: "WorkflowMeta_warningHint",
    emptyState: "WorkflowMeta_emptyState",
    emptyText: "WorkflowMeta_emptyText"
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/WorkflowMeta.tsx
  var import_jsx_runtime5 = __require("react/jsx-runtime");
  var WorkflowMeta = ({ prompt, attachments }) => {
    const metadata = (0, import_react5.useMemo)(() => {
      const promptTokens = prompt ? estimatePromptTokens(prompt.text) : 0;
      const attachmentTokens = attachments.map((a) => estimateTokens(a.content || ""));
      const totalTokens = calculateTotalTokens(promptTokens, attachmentTokens);
      const languages = /* @__PURE__ */ new Set();
      attachments.forEach((a) => {
        if (a.language)
          languages.add(a.language);
      });
      const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);
      const fileTypes = /* @__PURE__ */ new Set();
      attachments.forEach((a) => {
        fileTypes.add(a.type);
      });
      return {
        promptTokens,
        attachmentTokens,
        totalTokens,
        languages: Array.from(languages),
        totalSize,
        fileTypes: Array.from(fileTypes),
        warning: getTokenWarning(totalTokens)
      };
    }, [prompt, attachments]);
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.container, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: WorkflowMeta_default.title, children: "Workflow Summary" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.grid, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.card, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: WorkflowMeta_default.cardTitle, children: "Prompt" }),
          prompt ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.promptInfo, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: WorkflowMeta_default.promptLabel, children: prompt.label }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: WorkflowMeta_default.promptTokens, children: [
              formatTokenCount(metadata.promptTokens),
              " tokens"
            ] })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: WorkflowMeta_default.empty, children: "No prompt selected" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.card, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: WorkflowMeta_default.cardTitle, children: "Attachments" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.stats, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.stat, children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: WorkflowMeta_default.statLabel, children: "Files:" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: WorkflowMeta_default.statValue, children: attachments.length })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.stat, children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: WorkflowMeta_default.statLabel, children: "Size:" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: WorkflowMeta_default.statValue, children: metadata.totalSize > 0 ? (metadata.totalSize / 1024).toFixed(1) + " KB" : "0 KB" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.card, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: WorkflowMeta_default.cardTitle, children: "Total Tokens" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: `${WorkflowMeta_default.tokenCount} ${metadata.warning ? WorkflowMeta_default.warning : ""}`, children: formatTokenCount(metadata.totalTokens) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: WorkflowMeta_default.tokenBreakdown, children: [
            "Prompt: ",
            formatTokenCount(metadata.promptTokens),
            " + Attachments:",
            " ",
            formatTokenCount(
              metadata.attachmentTokens.reduce((sum, t) => sum + t, 0)
            )
          ] })
        ] })
      ] }),
      metadata.languages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.languages, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: WorkflowMeta_default.sectionTitle, children: "Languages Detected" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: WorkflowMeta_default.languageBadges, children: metadata.languages.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: WorkflowMeta_default.languageBadge, children: lang }, lang)) })
      ] }),
      metadata.fileTypes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.fileTypes, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: WorkflowMeta_default.sectionTitle, children: "File Types" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: WorkflowMeta_default.fileTypeBadges, children: metadata.fileTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: WorkflowMeta_default.fileTypeBadge, children: type }, type)) })
      ] }),
      metadata.warning && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: WorkflowMeta_default.warningBox, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: WorkflowMeta_default.warningText, children: [
          "\u26A0\uFE0F ",
          metadata.warning
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: WorkflowMeta_default.warningHint, children: "Consider splitting large files or removing some attachments" })
      ] }),
      attachments.length === 0 && !prompt && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: WorkflowMeta_default.emptyState, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: WorkflowMeta_default.emptyText, children: "Select a prompt and add attachments to see metadata" }) })
    ] });
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/ExportMenu.tsx
  var import_react6 = __require("react");

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/ExportMenu.module.css
  var ExportMenu_default = {
    container: "ExportMenu_container",
    button: "ExportMenu_button",
    primary: "ExportMenu_primary",
    secondary: "ExportMenu_secondary",
    menuWrapper: "ExportMenu_menuWrapper",
    menu: "ExportMenu_menu",
    menuItem: "ExportMenu_menuItem",
    icon: "ExportMenu_icon",
    message: "ExportMenu_message"
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/ExportMenu.tsx
  var import_jsx_runtime6 = __require("react/jsx-runtime");
  var ExportMenu = ({
    onCopyJSON,
    onExportJSON,
    onExportMarkdown,
    disabled = false
  }) => {
    const [isOpen, setIsOpen] = (0, import_react6.useState)(false);
    const [isLoading, setIsLoading] = (0, import_react6.useState)(false);
    const [message, setMessage] = (0, import_react6.useState)(null);
    const menuRef = (0, import_react6.useRef)(null);
    (0, import_react6.useEffect)(() => {
      function handleClickOutside(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleCopyJSON = async () => {
      setIsLoading(true);
      try {
        await onCopyJSON();
        setMessage("\u2713 Copied to clipboard");
        setTimeout(() => setMessage(null), 2e3);
        setIsOpen(false);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to copy";
        setMessage(`\u2717 ${msg}`);
        setTimeout(() => setMessage(null), 3e3);
      } finally {
        setIsLoading(false);
      }
    };
    const handleExportJSON = async () => {
      setIsLoading(true);
      try {
        await onExportJSON();
        setMessage("\u2713 Exported as JSON");
        setTimeout(() => setMessage(null), 2e3);
        setIsOpen(false);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to export";
        setMessage(`\u2717 ${msg}`);
        setTimeout(() => setMessage(null), 3e3);
      } finally {
        setIsLoading(false);
      }
    };
    const handleExportMarkdown = async () => {
      setIsLoading(true);
      try {
        await onExportMarkdown();
        setMessage("\u2713 Exported as Markdown");
        setTimeout(() => setMessage(null), 2e3);
        setIsOpen(false);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to export";
        setMessage(`\u2717 ${msg}`);
        setTimeout(() => setMessage(null), 3e3);
      } finally {
        setIsLoading(false);
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { ref: menuRef, className: ExportMenu_default.container, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          className: `${ExportMenu_default.button} ${ExportMenu_default.primary}`,
          onClick: handleCopyJSON,
          disabled: disabled || isLoading,
          type: "button",
          title: "Copy workflow as JSON to clipboard",
          children: isLoading ? "\u27F3 Exporting..." : "\u{1F4CB} COPY ALL TO CLIPBOARD"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: ExportMenu_default.menuWrapper, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
          "button",
          {
            className: `${ExportMenu_default.button} ${ExportMenu_default.secondary}`,
            onClick: () => setIsOpen(!isOpen),
            disabled,
            type: "button",
            title: "Export workflow to file",
            children: [
              "\u2193 EXPORT ",
              isOpen ? "\u25B2" : "\u25BC"
            ]
          }
        ),
        isOpen && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: ExportMenu_default.menu, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
            "button",
            {
              className: ExportMenu_default.menuItem,
              onClick: handleExportJSON,
              disabled: isLoading,
              type: "button",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: ExportMenu_default.icon, children: "\u{1F4C4}" }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: "Export as .json" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
            "button",
            {
              className: ExportMenu_default.menuItem,
              onClick: handleExportMarkdown,
              disabled: isLoading,
              type: "button",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: ExportMenu_default.icon, children: "\u{1F4DD}" }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: "Export as .md" })
              ]
            }
          )
        ] })
      ] }),
      message && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: ExportMenu_default.message, children: message })
    ] });
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PasteFinalResultModal.tsx
  var import_react7 = __require("react");

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PasteFinalResultModal.module.css
  var PasteFinalResultModal_default = {
    overlay: "PasteFinalResultModal_overlay",
    modal: "PasteFinalResultModal_modal",
    header: "PasteFinalResultModal_header",
    title: "PasteFinalResultModal_title",
    closeButton: "PasteFinalResultModal_closeButton",
    body: "PasteFinalResultModal_body",
    description: "PasteFinalResultModal_description",
    formGroup: "PasteFinalResultModal_formGroup",
    label: "PasteFinalResultModal_label",
    textarea: "PasteFinalResultModal_textarea",
    hint: "PasteFinalResultModal_hint",
    footer: "PasteFinalResultModal_footer",
    cancelButton: "PasteFinalResultModal_cancelButton",
    saveButton: "PasteFinalResultModal_saveButton"
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PasteFinalResultModal.tsx
  var import_jsx_runtime7 = __require("react/jsx-runtime");
  var PasteFinalResultModal = ({
    isOpen,
    onResultSaved,
    onClose
  }) => {
    const [result, setResult] = (0, import_react7.useState)("");
    const [isLoading, setIsLoading] = (0, import_react7.useState)(false);
    const { read: readClipboard } = useClipboard();
    (0, import_react7.useEffect)(() => {
      if (isOpen) {
        setIsLoading(true);
        readClipboard().then((clipboardText) => {
          if (clipboardText) {
            setResult(clipboardText);
          }
          setIsLoading(false);
        });
      }
    }, [isOpen, readClipboard]);
    const handleSave = (0, import_react7.useCallback)(() => {
      if (!result.trim()) {
        alert("Please paste or enter the LLM result");
        return;
      }
      onResultSaved(result);
      setResult("");
      onClose();
    }, [result, onResultSaved, onClose]);
    const handleClose = (0, import_react7.useCallback)(() => {
      setResult("");
      onClose();
    }, [onClose]);
    const tokenCount = estimateTokens(result);
    if (!isOpen)
      return null;
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: PasteFinalResultModal_default.overlay, onClick: handleClose, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: PasteFinalResultModal_default.modal, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: PasteFinalResultModal_default.header, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: PasteFinalResultModal_default.title, children: "Paste Final LLM Result" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { className: PasteFinalResultModal_default.closeButton, onClick: handleClose, children: "\u2715" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: PasteFinalResultModal_default.body, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: PasteFinalResultModal_default.description, children: "Paste the LLM response below to complete your workflow. This will be saved with all attachments and prompts." }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: PasteFinalResultModal_default.formGroup, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: PasteFinalResultModal_default.label, children: "LLM Response" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "textarea",
            {
              className: PasteFinalResultModal_default.textarea,
              value: result,
              onChange: (e) => setResult(e.target.value),
              placeholder: "Paste the LLM response here...",
              disabled: isLoading
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: PasteFinalResultModal_default.hint, children: result.length > 0 ? `${result.length} characters (~${formatTokenCount(tokenCount)} tokens)` : "Paste the LLM response here" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: PasteFinalResultModal_default.footer, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { className: PasteFinalResultModal_default.cancelButton, onClick: handleClose, children: "Cancel" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            className: PasteFinalResultModal_default.saveButton,
            onClick: handleSave,
            disabled: isLoading || !result.trim(),
            children: isLoading ? "Loading..." : "Save Workflow"
          }
        )
      ] })
    ] }) });
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/hooks/useWorkflow.ts
  var import_react8 = __require("react");
  function useWorkflow(initialPrompt) {
    const [workflow, setWorkflow] = (0, import_react8.useState)({
      id: Math.random().toString(36).substring(2, 11),
      selectedPrompt: initialPrompt,
      attachments: [],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    const setSelectedPrompt = (0, import_react8.useCallback)((prompt) => {
      setWorkflow((prev) => ({
        ...prev,
        selectedPrompt: prompt,
        updatedAt: /* @__PURE__ */ new Date()
      }));
    }, []);
    const addAttachments = (0, import_react8.useCallback)((attachments) => {
      setWorkflow((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...attachments],
        updatedAt: /* @__PURE__ */ new Date()
      }));
    }, []);
    const removeAttachment = (0, import_react8.useCallback)((attachmentId) => {
      setWorkflow((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((a) => a.id !== attachmentId),
        updatedAt: /* @__PURE__ */ new Date()
      }));
    }, []);
    const clearAttachments = (0, import_react8.useCallback)(() => {
      setWorkflow((prev) => ({
        ...prev,
        attachments: [],
        updatedAt: /* @__PURE__ */ new Date()
      }));
    }, []);
    const setFinalResult = (0, import_react8.useCallback)((result) => {
      setWorkflow((prev) => ({
        ...prev,
        finalResult: result,
        updatedAt: /* @__PURE__ */ new Date()
      }));
    }, []);
    const clearFinalResult = (0, import_react8.useCallback)(() => {
      setWorkflow((prev) => ({
        ...prev,
        finalResult: void 0,
        updatedAt: /* @__PURE__ */ new Date()
      }));
    }, []);
    const resetWorkflow = (0, import_react8.useCallback)(() => {
      setWorkflow({
        id: Math.random().toString(36).substring(2, 11),
        selectedPrompt: void 0,
        attachments: [],
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
    }, []);
    return {
      workflow,
      setSelectedPrompt,
      addAttachments,
      removeAttachment,
      clearAttachments,
      setFinalResult,
      clearFinalResult,
      resetWorkflow
    };
  }

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/hooks/useFileHandlers.ts
  var import_react9 = __require("react");
  function useFileHandlers() {
    const [status, setStatus] = (0, import_react9.useState)({
      loading: false,
      error: null
    });
    const selectFiles = (0, import_react9.useCallback)(
      async (options) => {
        setStatus({ loading: true, error: null });
        try {
          if (window.CodeRefCore?.utils?.fileHandlers?.selectFiles) {
            const files = await window.CodeRefCore.utils.fileHandlers.selectFiles(options);
            setStatus({ loading: false, error: null });
            return files || null;
          }
          return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = options?.multiple ?? false;
            if (options?.accept) {
              input.accept = options.accept;
            }
            input.onchange = (e) => {
              const target = e.target;
              const files = target.files ? Array.from(target.files) : null;
              setStatus({ loading: false, error: null });
              resolve(files);
            };
            input.onclick = () => {
              setStatus({ loading: false, error: null });
            };
            input.click();
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to select files";
          setStatus({ loading: false, error: errorMessage });
          return null;
        }
      },
      []
    );
    const selectDirectory = (0, import_react9.useCallback)(async () => {
      setStatus({ loading: true, error: null });
      try {
        if (window.CodeRefCore?.utils?.fileHandlers?.selectDirectory) {
          const directory = await window.CodeRefCore.utils.fileHandlers.selectDirectory();
          setStatus({ loading: false, error: null });
          return directory || null;
        }
        if ("showDirectoryPicker" in window) {
          try {
            const dirHandle = await window.showDirectoryPicker();
            setStatus({ loading: false, error: null });
            return dirHandle.name;
          } catch (err) {
            throw new Error("Directory selection not supported in this browser");
          }
        }
        throw new Error("Directory selection not available - use Electron or Chrome/Edge browser");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to select directory";
        setStatus({ loading: false, error: errorMessage });
        return null;
      }
    }, []);
    const isElectron = (0, import_react9.useCallback)(() => {
      return window.CodeRefCore?.utils?.fileHandlers?.isElectron?.() ?? false;
    }, []);
    const clearStatus = (0, import_react9.useCallback)(() => {
      setStatus({ loading: false, error: null });
    }, []);
    return {
      selectFiles,
      selectDirectory,
      isElectron,
      status,
      clearStatus
    };
  }

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/utils/prompts.ts
  var CODE_REVIEW_PROMPT = `CODE REVIEW TASK
Review the attached code and any provided context for a comprehensive feature review.
Output standard Markdown (.md) inside a SINGLE code block.

**AGENT IDENTIFICATION REQUIRED**
Start your response with a metadata header identifying yourself:

---
**Agent:** [Your model name and version]
**Date:** [Current date]
**Task:** CODE_REVIEW
---

## PART 1: EXISTING FEATURES
1. Create an ORDERED LIST of existing features found in the code, ranked by Rating (1-10) from highest to lowest.
2. Follow the list with a TABLE summarizing these features with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
3. Include ALL existing features identified in the list in this table.

## PART 2: SUGGESTIONS FOR IMPROVEMENT
4. Create an ORDERED LIST of suggested improvements/enhancements, ranked by Rating (1-10) from highest to lowest.
5. Follow the list with a TABLE summarizing these suggestions with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
6. Include ALL suggestions identified in the list in this table.`;
  var SYNTHESIZE_PROMPT = `SYNTHESIS TASK
I have conducted multiple Code Reviews using different LLMs. Below are the Code Review responses.
Please SYNTHESIZE these responses into a single, authoritative Code Review.
Output format: Standard Markdown (.md) inside a SINGLE code block.

**AGENT IDENTIFICATION REQUIRED**
Start your response with a metadata header identifying yourself:

---
**Agent:** [Your model name and version]
**Date:** [Current date]
**Task:** SYNTHESIZE
---

## PART 1: SYNTHESIZED EXISTING FEATURES
1. Review all PART 1 (EXISTING FEATURES) sections from the provided Code Reviews.
2. Create a consolidated ORDERED LIST of all unique existing features, ranked by Rating (1-10) from highest to lowest.
   - Merge duplicate features, keeping the highest rating and best description
   - Resolve conflicts by prioritizing the most detailed/accurate description
3. Follow the list with a TABLE summarizing these synthesized features with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
4. Include ALL unique features identified across all reviews in this table.

## PART 2: SYNTHESIZED SUGGESTIONS FOR IMPROVEMENT
5. Review all PART 2 (SUGGESTIONS FOR IMPROVEMENT) sections from the provided Code Reviews.
6. Create a consolidated ORDERED LIST of all unique suggestions, ranked by Rating (1-10) from highest to lowest.
   - Merge duplicate suggestions, keeping the highest rating and most comprehensive description
   - Resolve conflicts by prioritizing the most actionable/valuable suggestion
7. Follow the list with a TABLE summarizing these synthesized suggestions with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
8. Include ALL unique suggestions identified across all reviews in this table.

## CONCLUSION
9. Provide a brief summary highlighting:
   - The most important features identified
   - The highest-priority suggestions for improvement
   - Any consensus or disagreements across the reviews`;
  var CONSOLIDATE_PROMPT = `CONSOLIDATION TASK
I have multiple Synthesized Code Reviews from different synthesis runs. Below are the Synthesize outputs.
Please create a FINAL MASTER CONSOLIDATION that combines all of these into one authoritative document.
Output format: Standard Markdown (.md) inside a SINGLE code block.

**AGENT IDENTIFICATION REQUIRED**
Start your response with a metadata header identifying yourself:

---
**Agent:** [Your model name and version]
**Date:** [Current date]
**Task:** CONSOLIDATE
---

## PART 1: MASTER EXISTING FEATURES
1. Review all PART 1 (SYNTHESIZED EXISTING FEATURES) sections from all Synthesize outputs.
2. Create a FINAL consolidated ORDERED LIST of all unique features, ranked by Rating (1-10) from highest to lowest.
   - Merge all features, keeping the highest rating and most comprehensive description
   - Remove true duplicates (same feature, same description)
   - Resolve conflicts by prioritizing the most detailed/accurate description
   - Focus on the most important/valuable features
3. Follow the list with a MASTER TABLE summarizing these final features with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
4. Include ALL unique features in this master table.

## PART 2: MASTER SUGGESTIONS FOR IMPROVEMENT
5. Review all PART 2 (SYNTHESIZED SUGGESTIONS FOR IMPROVEMENT) sections from all Synthesize outputs.
6. Create a FINAL consolidated ORDERED LIST of all unique suggestions, ranked by Rating (1-10) from highest to lowest.
   - Merge all suggestions, keeping the highest rating and most actionable description
   - Remove true duplicates
   - Resolve conflicts by prioritizing the most valuable/actionable suggestion
   - Focus on high-impact, implementable improvements
7. Follow the list with a MASTER TABLE summarizing these final suggestions with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
8. Include ALL unique suggestions in this master table.

## MASTER CONCLUSION
9. Provide an executive summary that:
   - Highlights the top 5 most important features
   - Highlights the top 5 highest-priority suggestions
   - Identifies patterns and consensus across all synthesis runs
   - Provides actionable next steps for implementation`;
  var PRELOADED_PROMPTS = {
    "0001": {
      key: "0001",
      name: "CODE_REVIEW",
      label: "Code Review",
      text: CODE_REVIEW_PROMPT,
      estimatedTokens: 950,
      description: "Analyzes single code file \u2192 features + suggestions"
    },
    "0002": {
      key: "0002",
      name: "SYNTHESIZE",
      label: "Synthesize",
      text: SYNTHESIZE_PROMPT,
      estimatedTokens: 1300,
      description: "Merges multiple reviews \u2192 authoritative review"
    },
    "0003": {
      key: "0003",
      name: "CONSOLIDATE",
      label: "Consolidate",
      text: CONSOLIDATE_PROMPT,
      estimatedTokens: 1300,
      description: "Creates final master review from multiple syntheses"
    }
  };
  function getPrompt(key) {
    return PRELOADED_PROMPTS[key];
  }
  function getAllPrompts() {
    return Object.values(PRELOADED_PROMPTS);
  }

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/utils/exportFormatter.ts
  function generateJSON(workflow) {
    if (!workflow.selectedPrompt || workflow.attachments.length === 0) {
      throw new Error("Cannot export: missing prompt or attachments");
    }
    const promptTokens = estimateTokens(workflow.selectedPrompt.text);
    const attachmentTokensPerFile = {};
    let totalAttachmentTokens = 0;
    const exportAttachments = workflow.attachments.map((attachment) => {
      const tokens = estimateTokens(attachment.content || "");
      attachmentTokensPerFile[attachment.filename] = tokens;
      totalAttachmentTokens += tokens;
      return {
        id: attachment.id,
        filename: attachment.filename,
        type: attachment.type,
        extension: attachment.extension,
        language: attachment.language,
        size: attachment.size,
        content: attachment.content || ""
      };
    });
    const totalTokens = promptTokens + totalAttachmentTokens;
    const exportData = {
      session_id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      generated_at: (/* @__PURE__ */ new Date()).toISOString(),
      prompt: workflow.selectedPrompt,
      attachments: exportAttachments,
      metadata: {
        total_tokens: totalTokens,
        estimated_tokens_per_file: attachmentTokensPerFile,
        file_count: workflow.attachments.length,
        attachment_types: Array.from(new Set(workflow.attachments.map((a) => a.type))),
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        user_instructions: "Add your analysis and suggestions below this prompt and attachments"
      }
    };
    return JSON.stringify(exportData, null, 2);
  }
  function generateMarkdown(workflow) {
    if (!workflow.selectedPrompt || workflow.attachments.length === 0) {
      throw new Error("Cannot export: missing prompt or attachments");
    }
    let markdown = `# ${workflow.selectedPrompt.label} Workflow

`;
    markdown += `## Prompt

`;
    markdown += `**Task:** ${workflow.selectedPrompt.name}
`;
    markdown += `**Estimated Tokens:** ~${estimateTokens(workflow.selectedPrompt.text).toLocaleString()}

`;
    markdown += `${workflow.selectedPrompt.text}

`;
    markdown += `## Attachments

`;
    workflow.attachments.forEach((attachment) => {
      const sizeKB = (attachment.size / 1024).toFixed(1);
      markdown += `### ${attachment.filename} (${sizeKB}KB)

`;
      if (attachment.isBinary) {
        markdown += `> Binary file - content cannot be embedded in markdown

`;
      } else if (attachment.content) {
        const language = attachment.language || "plaintext";
        markdown += `\`\`\`${language}
`;
        markdown += `${attachment.content}
`;
        markdown += `\`\`\`

`;
      } else {
        markdown += `> [File content not extracted]

`;
      }
    });
    const totalTokens = workflow.attachments.reduce((sum, a) => sum + estimateTokens(a.content || ""), 0) + estimateTokens(workflow.selectedPrompt.text);
    markdown += `## Metadata

`;
    markdown += `- **Task:** ${workflow.selectedPrompt.name}
`;
    markdown += `- **Files:** ${workflow.attachments.length}
`;
    markdown += `- **Total Tokens:** ~${totalTokens.toLocaleString()}
`;
    markdown += `- **Created:** ${(/* @__PURE__ */ new Date()).toLocaleString()}
`;
    markdown += `- **Languages:** ${Array.from(new Set(workflow.attachments.map((a) => a.language).filter(Boolean))).join(", ") || "N/A"}

`;
    markdown += `## Instructions for LLM

`;
    markdown += `1. Review the prompt above to understand the task
`;
    markdown += `2. Analyze the attached files in the Attachments section
`;
    markdown += `3. Provide your analysis below

`;
    markdown += `---

`;
    markdown += `## Your Analysis

`;
    markdown += `[Add your analysis and suggestions here]
`;
    return markdown;
  }

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PromptingWorkflow.module.css
  var PromptingWorkflow_default = {
    container: "PromptingWorkflow_container",
    header: "PromptingWorkflow_header",
    title: "PromptingWorkflow_title",
    subtitle: "PromptingWorkflow_subtitle",
    content: "PromptingWorkflow_content",
    exportSection: "PromptingWorkflow_exportSection",
    sectionTitle: "PromptingWorkflow_sectionTitle",
    warningText: "PromptingWorkflow_warningText",
    pasteResultButton: "PromptingWorkflow_pasteResultButton"
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/components/PromptingWorkflow.tsx
  var import_jsx_runtime8 = __require("react/jsx-runtime");
  var PromptingWorkflow = () => {
    const prompts = getAllPrompts();
    const {
      workflow,
      setSelectedPrompt,
      addAttachments,
      removeAttachment,
      clearAttachments,
      setFinalResult
    } = useWorkflow();
    const { write: copyToClipboard } = useClipboard();
    const { selectDirectory } = useFileHandlers();
    const [showPasteFinalResult, setShowPasteFinalResult] = (0, import_react10.useState)(false);
    const isReadyForExport = workflow.selectedPrompt && workflow.attachments.length > 0;
    const handleCopyJSON = (0, import_react10.useCallback)(async () => {
      if (!isReadyForExport) {
        alert("Please select a prompt and add attachments");
        return;
      }
      const json = generateJSON(workflow);
      const success = await copyToClipboard(json);
      if (!success) {
        throw new Error("Failed to copy to clipboard");
      }
    }, [workflow, isReadyForExport, copyToClipboard]);
    const handleExportJSON = (0, import_react10.useCallback)(async () => {
      if (!isReadyForExport) {
        alert("Please select a prompt and add attachments");
        return;
      }
      const directory = await selectDirectory();
      if (!directory)
        return;
      const json = generateJSON(workflow);
      const filename = `workflow_${workflow.selectedPrompt?.name}_${Date.now()}.json`;
      console.log(`Would save to: ${directory}/${filename}`);
      console.log("JSON:", json);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, [workflow, isReadyForExport, selectDirectory]);
    const handleExportMarkdown = (0, import_react10.useCallback)(async () => {
      if (!isReadyForExport) {
        alert("Please select a prompt and add attachments");
        return;
      }
      const directory = await selectDirectory();
      if (!directory)
        return;
      const markdown = generateMarkdown(workflow);
      const filename = `workflow_${workflow.selectedPrompt?.name}_${Date.now()}.md`;
      console.log(`Would save to: ${directory}/${filename}`);
      console.log("Markdown:", markdown);
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, [workflow, isReadyForExport, selectDirectory]);
    const handleFinalResultSaved = (0, import_react10.useCallback)(
      async (result) => {
        setFinalResult(result);
        const shouldSaveWorkflow = confirm(
          "Save this workflow to local storage for later retrieval?"
        );
        if (shouldSaveWorkflow) {
          const directory = await selectDirectory();
          if (directory) {
            const json = generateJSON({ ...workflow, finalResult: result });
            const filename = `session_${Date.now()}.json`;
            console.log(`Would save to: ${directory}/${filename}`);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }
      },
      [workflow, setFinalResult, selectDirectory]
    );
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: PromptingWorkflow_default.container, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: PromptingWorkflow_default.header, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h1", { className: PromptingWorkflow_default.title, children: "Prompting Workflow" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: PromptingWorkflow_default.subtitle, children: "Select a prompt, attach files, review metadata, and export for LLM analysis" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: PromptingWorkflow_default.content, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          PromptSelector,
          {
            prompts,
            selectedPromptKey: workflow.selectedPrompt?.key,
            onSelectPrompt: setSelectedPrompt
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          AttachmentManager,
          {
            attachments: workflow.attachments,
            onAddAttachments: addAttachments,
            onRemoveAttachment: removeAttachment,
            onClearAll: clearAttachments
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(WorkflowMeta, { prompt: workflow.selectedPrompt, attachments: workflow.attachments }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: PromptingWorkflow_default.exportSection, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h2", { className: PromptingWorkflow_default.sectionTitle, children: "Export" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            ExportMenu,
            {
              onCopyJSON: handleCopyJSON,
              onExportJSON: handleExportJSON,
              onExportMarkdown: handleExportMarkdown,
              disabled: !isReadyForExport
            }
          ),
          !isReadyForExport && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: PromptingWorkflow_default.warningText, children: "\u26A0\uFE0F Select a prompt and add at least one attachment to enable export" }),
          isReadyForExport && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "button",
            {
              className: PromptingWorkflow_default.pasteResultButton,
              onClick: () => setShowPasteFinalResult(true),
              children: "\u{1F4DD} Paste Final LLM Result"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        PasteFinalResultModal,
        {
          isOpen: showPasteFinalResult,
          onResultSaved: handleFinalResultSaved,
          onClose: () => setShowPasteFinalResult(false)
        }
      )
    ] });
  };

  // packages/widgets/@coderef-dashboard/widget-prompting-workflow/src/index.ts
  var PromptingWorkflowWidget = {
    id: "prompting-workflow",
    name: "Prompting Workflow",
    version: "1.0.0",
    description: "LLM prompting workflow with file attachments, metadata display, and export functionality",
    render() {
      return import_react11.default.createElement(PromptingWorkflow);
    },
    async onEnable() {
      console.log("Prompting Workflow Widget enabled");
    },
    async onDisable() {
      console.log("Prompting Workflow Widget disabled");
    },
    onError(error) {
      console.error("Prompting Workflow Widget error:", error);
      return true;
    }
  };
  var src_default = PromptingWorkflowWidget;
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=prompting-workflow.js.map
