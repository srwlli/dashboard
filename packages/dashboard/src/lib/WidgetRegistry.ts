import { WidgetConfig } from '@coderef-dashboard/core';

/**
 * Widget registry that reads from config and manages widget discovery
 */
export class WidgetRegistry {
  private config: { widgets: WidgetConfig[] } = { widgets: [] };
  private listeners: Set<() => void> = new Set();

  constructor(config?: { widgets: WidgetConfig[] }) {
    if (config) {
      this.config = config;
    }
  }

  /**
   * Initialize registry from a config object
   */
  public initialize(config: { widgets: WidgetConfig[] }): void {
    this.config = config;
    this.notifyListeners();
  }

  /**
   * Get all enabled widgets
   */
  public getWidgets(): WidgetConfig[] {
    return this.config.widgets.filter((w) => w.enabled !== false);
  }

  /**
   * Get a specific widget by ID
   */
  public getWidget(id: string): WidgetConfig | undefined {
    return this.config.widgets.find((w) => w.id === id);
  }

  /**
   * Get all widgets (including disabled)
   */
  public getAllWidgets(): WidgetConfig[] {
    return this.config.widgets;
  }

  /**
   * Enable a widget
   */
  public enableWidget(id: string): void {
    const widget = this.getWidget(id);
    if (widget) {
      widget.enabled = true;
      this.notifyListeners();
    }
  }

  /**
   * Disable a widget
   */
  public disableWidget(id: string): void {
    const widget = this.getWidget(id);
    if (widget) {
      widget.enabled = false;
      this.notifyListeners();
    }
  }

  /**
   * Update widget settings
   */
  public updateWidgetSettings(id: string, settings: Record<string, any>): void {
    const widget = this.getWidget(id);
    if (widget) {
      widget.settings = { ...widget.settings, ...settings };
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to registry changes
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}

/**
 * Global registry instance
 */
export const globalRegistry = new WidgetRegistry();
