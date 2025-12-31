/**
 * Type declarations for @testing-library/jest-dom
 *
 * This file adds TypeScript type definitions for jest-dom custom matchers
 * such as toBeInTheDocument, toHaveTextContent, etc.
 */

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toHaveValue(value: string | string[] | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveDescription(text: string | RegExp): R;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
      toHaveFocus(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toBeRequired(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveAccessibleDescription(description: string | RegExp): R;
      toHaveAccessibleName(name: string | RegExp): R;
      toHaveErrorMessage(message: string | RegExp): R;
    }
  }
}
