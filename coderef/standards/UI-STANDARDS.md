# UI Standards

**Purpose:** Documented UI patterns extracted from codebase

---

## Color Patterns

Extracted from Tailwind classes:

- `
                          w-full px-3 py-2 text-left text-sm
                          text-ind-text hover:bg-ind-bg
                          transition-colors duration-150
                          flex items-center gap-2
                        `
- `
                          w-full px-3 py-2 text-left text-sm
                          text-red-500 hover:bg-red-500/10
                          transition-colors duration-150
                          flex items-center gap-2 font-medium
                        `
- `
                  px-3 sm:px-4 py-2 rounded
                  bg-ind-bg border border-ind-border
                  text-ind-text hover:text-ind-accent hover:border-ind-accent
                  transition-colors duration-200
                  text-xs sm:text-sm font-medium
                `
- `
              flex items-center gap-2 px-3 py-1.5 rounded text-sm
              bg-yellow-500/20 hover:bg-yellow-500/30
              text-yellow-500
              border border-yellow-500/30
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `
- `
              p-1.5 rounded flex-shrink-0
              bg-red-500/10 text-red-500 border border-red-500/30
              hover:bg-red-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              flex items-center justify-center
            `
- `
              px-3 py-1.5 rounded text-xs
              bg-ind-bg border border-ind-border
              text-ind-text-muted hover:text-ind-text
              hover:border-ind-accent/50
              transition-colors duration-200
              flex items-center gap-2
            `
- `
              w-full px-2 py-1.5 pl-7 pr-6 rounded text-sm
              bg-ind-bg border border-ind-border
              text-ind-text
              focus:outline-none focus:border-ind-accent focus:ring-1 focus:ring-ind-accent/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              appearance-none
              truncate
            `
- `
              w-full px-3 py-2 rounded
              bg-ind-bg border border-ind-border
              text-ind-text placeholder-ind-text-muted
              focus:outline-none focus:border-ind-accent focus:ring-1 focus:ring-ind-accent/30
              transition-colors duration-200
            `
- `
            p-1.5 rounded flex-shrink-0
            bg-ind-accent text-ind-panel
            hover:bg-ind-accent/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            flex items-center justify-center
          `
- `
            w-full text-xs py-2 rounded
            text-ind-text-muted hover:text-ind-text
            border border-ind-border/50 hover:border-ind-border
            transition-colors duration-200
          `
- `
          flex items-center justify-center
          w-5 h-5 rounded-full
          border border-ind-accent
          bg-ind-bg
          text-ind-accent
          hover:scale-110 hover:shadow-lg
          transition-all duration-200
        `
- `
          flex items-center justify-center h-16
          border-b border-ind-border
          hover:bg-ind-bg/50
          transition-colors duration-200
          text-ind-text-muted hover:text-ind-text
        `
- `
        sticky top-0 z-40
        bg-ind-panel border-b border-ind-border
        flex items-center justify-between
        px-2 sm:px-6 py-4
        h-12 sm:h-16
      `
- `absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent`
- `absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent`
- `absolute inset-0 flex items-center justify-center text-2xl text-white drop-shadow-lg`
- `absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ind-text-muted pointer-events-none`
- `absolute left-full top-0 ml-1 bg-ind-panel border border-ind-border rounded shadow-lg py-1 min-w-[180px]`
- `absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-ind-panel border border-ind-border z-20`
- `absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent`


---

## Button Patterns

*No button variants detected*


---

## Typography

Font patterns:

- `
                          w-full px-3 py-2 text-left text-sm
                          text-ind-text hover:bg-ind-bg
                          transition-colors duration-150
                          flex items-center gap-2
                        `
- `
                          w-full px-3 py-2 text-left text-sm
                          text-red-500 hover:bg-red-500/10
                          transition-colors duration-150
                          flex items-center gap-2 font-medium
                        `
- `
                  px-3 sm:px-4 py-2 rounded
                  bg-ind-bg border border-ind-border
                  text-ind-text hover:text-ind-accent hover:border-ind-accent
                  transition-colors duration-200
                  text-xs sm:text-sm font-medium
                `
- `
              flex items-center gap-2 px-3 py-1.5 rounded text-sm
              bg-yellow-500/20 hover:bg-yellow-500/30
              text-yellow-500
              border border-yellow-500/30
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `
- `
              p-1.5 rounded flex-shrink-0
              bg-red-500/10 text-red-500 border border-red-500/30
              hover:bg-red-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              flex items-center justify-center
            `
- `
              px-3 py-1.5 rounded text-xs
              bg-ind-bg border border-ind-border
              text-ind-text-muted hover:text-ind-text
              hover:border-ind-accent/50
              transition-colors duration-200
              flex items-center gap-2
            `
- `
              w-full px-2 py-1.5 pl-7 pr-6 rounded text-sm
              bg-ind-bg border border-ind-border
              text-ind-text
              focus:outline-none focus:border-ind-accent focus:ring-1 focus:ring-ind-accent/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              appearance-none
              truncate
            `
- `
              w-full px-3 py-2 rounded
              bg-ind-bg border border-ind-border
              text-ind-text placeholder-ind-text-muted
              focus:outline-none focus:border-ind-accent focus:ring-1 focus:ring-ind-accent/30
              transition-colors duration-200
            `
- `
            p-1.5 rounded flex-shrink-0
            bg-ind-accent text-ind-panel
            hover:bg-ind-accent/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            flex items-center justify-center
          `
- `
            w-full text-xs py-2 rounded
            text-ind-text-muted hover:text-ind-text
            border border-ind-border/50 hover:border-ind-border
            transition-colors duration-200
          `
- `
          flex items-center justify-center
          w-5 h-5 rounded-full
          border border-ind-accent
          bg-ind-bg
          text-ind-accent
          hover:scale-110 hover:shadow-lg
          transition-all duration-200
        `
- `
          flex items-center justify-center h-16
          border-b border-ind-border
          hover:bg-ind-bg/50
          transition-colors duration-200
          text-ind-text-muted hover:text-ind-text
        `
- `absolute inset-0 flex items-center justify-center text-2xl text-white drop-shadow-lg`
- `absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ind-text-muted pointer-events-none`
- `block text-ind-text-muted text-xs font-mono`


---

*Generated by enhance-standards.py using .coderef/ data*
