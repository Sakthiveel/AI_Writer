import "./style.css";
import aiIcon from "@/assets/aiIcon.svg";
import ReactDOM from "react-dom/client";

const AIIconElement = () => {
  const clickHandler = () => {
    console.log("Trigger opening modal");
  };
  return (
    <img
      src={aiIcon}
      id="aiIcon"
      alt="ai_Icon"
      onClick={clickHandler}
      style={{ width: 32, height: 32 }}
    />
  );
};

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
            handleMountAIBtn(ctx, chatInput, node);
          });
        });
        mutation.removedNodes.forEach((node) => {});
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});
console.log("cool");

async function handleMountAIBtn(ctx, anchorElement, chatBoxContainer) {
  console.log("me", { anchorElement });
  let focusListener = () => {};
  let blurListener = () => {};
  // let focusOutListener = () => {};
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
      // todo: need to make sure whether completey recreatign the shadow dom is ok or not
      elements?.unmount();
      // elements?.root.unmount();
      ui.mounted?.unmount();
      // anchorElement.removeEventListener("focusout", focusOutListener);
      // elements?.wrapper.remove();
    },
  });
  if (document.activeElement === anchorElement) {
    ui.mount();
  }
  focusListener = anchorElement.addEventListener("focus", () => {
    console.log("mount now", chatBoxContainer.id);
    ui.mount();
  });

  blurListener = anchorElement.addEventListener("blur", () => {
    console.log("remove now", chatBoxContainer.id);
    console.log("type", ui.mounted?._internalRoot);
    ui.remove();
  });
  ctx.onInvalidated(() => {
    console.log("ctx invalidated");
    // anchorElement.removeEventListener("focus", focusListener);
    // anchorElement.removeEventListener("blur", blurListener);
  });
}
