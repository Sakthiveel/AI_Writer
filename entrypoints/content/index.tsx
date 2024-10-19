import "./style.css";
import aiIcon from "@/assets/aiIcon.svg";
import ReactDOM from "react-dom/client";

const AIIconElement = () => (
  <img
    src={aiIcon}
    id="aiIcon"
    alt="ai_Icon"
    style={{ width: 32, height: 32 }}
  />
);

export default defineContentScript({
  matches: ["*://*/*"], // todo: match only linkedin
  cssInjectionMode: "ui",

  async main(ctx) {
    const elements = new Map();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          const nodeList = document.querySelectorAll(
            '[role="dialog"][aria-label="Messaging"][data-view-name="message-overlay-conversation-bubble-item"]'
          );

          Array.from(nodeList).forEach((node) => {
            const chatInput = node?.querySelector(
              'div[aria-label="Write a message…"][role="textbox"]'
            );
            if (!chatInput || elements.has(node)) {
              return;
            }
            elements.set(node, node.id);
            handleMountAIBtn(ctx, chatInput);
          });
        });
        mutation.removedNodes.forEach((node) => {});
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});

async function handleMountAIBtn(ctx, anchorElement) {
  console.log("me", { anchorElement });
  const ui = await createShadowRootUi(ctx, {
    name: "wxt-react-example",
    position: "overlay",
    anchor: anchorElement,
    append: "last",
    onMount: (container) => {
      const wrapper = document.createElement("div");
      container.append(wrapper);

      const root = ReactDOM.createRoot(wrapper);
      root.render(<AIIconElement />);
      return root;
    },
    onRemove: (elements) => {
      elements?.unmount();
      // elements?.root.unmount();
      ui.mounted?.unmount();
      // elements?.wrapper.remove();
    },
  });
  ui.mount();
  const focusListener = anchorElement.addEventListener("focus", () => {
    console.log("mount now");
    if (!ui.mounted?._internalRoot) {
      console.log("only", ui.mounted);
      ui.mount();
    }
  });
  const blurListener = anchorElement.addEventListener("blur", () => {
    console.log("remove now");
    console.log("type", ui.mounted?._internalRoot);
    ui.remove();
  });

  ctx.onInvalidated(() => {
    console.log("ctx invalidated");
    // anchorElement.removeEventListener("focus", focusListener);
    // anchorElement.removeEventListener("blur", blurListener);
  });
}
