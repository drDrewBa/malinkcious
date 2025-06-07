import { createRoot } from "react-dom/client";
import { LinkTooltip } from "./components/link-tooltip";
import { sharedStyles } from "./styles";

interface HighlighterState {
  container: HTMLElement | null;
  reactRoot: ReturnType<typeof createRoot> | null;
}

export const initHighlighter = () => {
  const state: HighlighterState = {
    container: null,
    reactRoot: null,
  };

  const handleMouseUp = async () => {
    // First check if highlighter is active
    const result = await chrome.storage.local.get(["isHighlighterActive"]);
    const isHighlighterActive = result.isHighlighterActive ?? false;

    if (!isHighlighterActive) {
      return;
    }

    const selection = window.getSelection();
    const text = selection?.toString();

    if (!text || text.trim() === "") {
      // Remove if no text selected
      state.reactRoot?.unmount();
      state.container?.remove();
      state.container = null;
      return;
    }

    console.log("Selected text:", text);

    const range = selection?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();

    // Create container
    state.container = document.createElement("div");
    state.container.style.position = "absolute";
    state.container.style.top = `${rect?.bottom! + window.scrollY + 10}px`;
    state.container.style.left = `${rect?.left! + window.scrollX}px`;
    state.container.style.zIndex = "999999";
    document.body.appendChild(state.container);

    const shadow = state.container.attachShadow({ mode: "open" });

    // Add styles
    const style = document.createElement("style");
    style.textContent = sharedStyles;

    const container = document.createElement("div");
    shadow.appendChild(style);
    shadow.appendChild(container);
    state.reactRoot = createRoot(container);

    // Render the popup
    state.reactRoot.render(<LinkTooltip text={text} />);
  };

  // Add event listeners
  document.addEventListener("mouseup", handleMouseUp);

  // Return cleanup function
  return () => {
    document.removeEventListener("mouseup", handleMouseUp);
    state.reactRoot?.unmount();
    state.container?.remove();
  };
};
