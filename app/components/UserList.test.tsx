/**
 * Tests for app/components/UserList.tsx ("Bad" version from PR).
 *
 * Detected/Assumed framework: Jest + @testing-library/react + jsdom
 * - If the repo uses Vitest, replace jest-specific globals with vitest equivalents.
 *
 * Scenarios:
 *  - Renders list on happy path and lowercases emails
 *  - Renders "No users found." on empty array
 *  - Still renders when HTTP status is non-ok (since code doesn't check response.ok)
 *  - Throws when a user's email is null/undefined (due to .toLowerCase())
 *  - Logs React key warning due to missing `key` on list items
 *  - Uses <a href="/profile"> (internal link) for each user
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";

jest.mock("next/link", () => {
  // Not used by the bad component, but in case Next Link gets auto-mocked elsewhere.
  return ({ children }: any) => children;
});

describe("UserList (bad PR version)", () => {
  const origFetch = global.fetch as any;
  const origError = console.error;

  beforeEach(() => {
    // jsdom environment expected
    jest.resetModules();
    jest.clearAllMocks();
    // Default fetch mock returns two users
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ([
        { id: 1, name: "Alice", email: "ALICE@EXAMPLE.COM" },
        { id: 2, name: "Bob", email: "Bob@Example.Com" },
      ]),
    }) as any;
    // Silence React act/key warnings per-test unless explicitly asserted
    console.error = jest.fn();
  });

  afterEach(() => {
    global.fetch = origFetch;
    console.error = origError;
  });

  async function loadComponent() {
    // Import inside to pick up fresh mocks after jest.resetModules
    const mod = await import("./UserList"); // Prefer app/components/UserList.tsx
    // The default export is an async function returning JSX
    // We call it to obtain the React element.
    const element = await (mod.default as any)();
    return element;
  }

  test("renders the title and user items (happy path) and lowercases emails", async () => {
    const element = await loadComponent();
    render(element);

    // Title
    expect(screen.getByRole("heading", { level: 1, name: "User List" })).toBeInTheDocument();

    // List and items
    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);

    // Names
    expect(within(items[0]).getByText("Alice")).toBeInTheDocument();
    expect(within(items[1]).getByText("Bob")).toBeInTheDocument();

    // Emails are lowercased by the implementation
    expect(within(items[0]).getByText("alice@example.com")).toBeInTheDocument();
    expect(within(items[1]).getByText("bob@example.com")).toBeInTheDocument();

    // Each item includes an internal anchor link to "/profile"
    const anchors = screen.getAllByRole("link", { name: "View Profile" });
    expect(anchors).toHaveLength(2);
    anchors.forEach(a => {
      expect(a).toHaveAttribute("href", "/profile");
    });
  });

  test('renders "No users found." when API returns empty array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([]),
    });

    const element = await loadComponent();
    render(element);

    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  test("still renders list even when HTTP status is non-ok (no ok check in code)", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ([
        { id: 7, name: "Carol", email: "Carol@Example.com" },
      ]),
    });

    const element = await loadComponent();
    render(element);

    // Despite status 500, the component uses response.json() and renders
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(screen.getByText("carol@example.com")).toBeInTheDocument();
  });

  test("throws when a user's email is null (due to .toLowerCase() without a guard)", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        { id: 1, name: "Null Email", email: null },
      ]),
    });

    await expect(loadComponent()).rejects.toThrow();
  });

  test("emits React key warning due to missing `key` on list items", async () => {
    // Arrange: keep two users to trigger map without keys
    const element = await loadComponent();
    render(element);

    // React warns to console.error about missing keys.
    // We check that console.error was called with the key warning substring.
    // Note: The exact message can vary by React version; match on core phrase.
    const errorCalls = (console.error as jest.Mock).mock.calls
      .flat()
      .map(String)
      .join("\n");
    expect(errorCalls).toMatch(/unique "key" prop|unique key/i);
  });

  test('displays "No users found." when API returns non-array JSON (e.g., error object)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal error" }),
    });

    const element = await loadComponent();
    render(element);

    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  test("propagates fetch rejection (no error handling in getUsers)", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network down"));

    await expect(loadComponent()).rejects.toThrow(/network down/i);
  });
});