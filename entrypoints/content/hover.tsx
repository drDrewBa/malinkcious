import { createRoot } from "react-dom/client";
import { LinkTooltip } from "./components/link-tooltip";
import { sharedStyles } from "./styles";

interface HoverState {
  container: HTMLElement | null;
  reactRoot: ReturnType<typeof createRoot> | null;
  currentHoveredElement: HTMLElement | null;
}

export const initHover = () => {
  const state: HoverState = {
    container: null,
    reactRoot: null,
    currentHoveredElement: null,
  };

  let hoverTimeout: NodeJS.Timeout;

  const createHoverPopup = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    
    // Create container if it doesn't exist
    if (!state.container) {
      state.container = document.createElement("div");
      state.container.style.position = "absolute";
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
    }

    // Position the popup
    state.container.style.top = `${rect.bottom + window.scrollY + 10}px`;
    state.container.style.left = `${rect.left + window.scrollX}px`;

    // Get the URL from the element
    const url = element instanceof HTMLAnchorElement ? element.href : element.getAttribute('href') || '';

    // Render the popup
    state.reactRoot?.render(<LinkTooltip text={url} />);
    state.currentHoveredElement = element;
  };

  const removeHoverPopup = () => {
    state.reactRoot?.unmount();
    state.container?.remove();
    state.container = null;
    state.currentHoveredElement = null;
  };

  const handleMouseEnter = async (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // First check if hover is active
    const result = await chrome.storage.local.get(["isHoverActive"]);
    const isHoverActive = result.isHoverActive ?? false;

    if (!isHoverActive) {
      return;
    }

    // Check if element is a link
    if (target.tagName === 'A' || target.hasAttribute('href')) {
      clearTimeout(hoverTimeout);
      
      // Only create new popup if not already showing for this element
      if (state.currentHoveredElement !== target) {
        removeHoverPopup();
        hoverTimeout = setTimeout(() => createHoverPopup(target), 500);
      }
    }
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(removeHoverPopup, 300);
  };

  // Add event listeners
  document.addEventListener('mouseover', handleMouseEnter);
  document.addEventListener('mouseout', handleMouseLeave);

  // Return cleanup function
  return () => {
    document.removeEventListener('mouseover', handleMouseEnter);
    document.removeEventListener('mouseout', handleMouseLeave);
    removeHoverPopup();
  };
}; 