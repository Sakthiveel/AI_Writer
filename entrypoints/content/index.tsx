import "./style.css";
import aiIcon from "@/assets/aiIcon.svg";
import ReactDOM from "react-dom/client";
import ChatModal from "@/components/ChatModal";
import { ShadowRootContentScriptUi } from "wxt/client";
import "~/assets/tailwind.css";

const AIIconElement = ({ ctx, handleMount }) => {
  const clickHandler = async () => {
    console.log("Trigger opening modal", { ctx });
    await handleMount();
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
    const handleMount = async (curChatInput: Element) => {
      console.log("handle Mount", { curChatInput });
      await moundChatModal({ ctx, curChatInput });
    };
    const mountStateMap = new Map<Element, string>();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          const { pathname } = window.location;
          const activeScreen = pathname.split("/")[1];
          if (activeScreen === "feed") {
            const nodeList: NodeListOf<Element> = document.querySelectorAll(
              '[role="dialog"][aria-label="Messaging"][data-view-name="message-overlay-conversation-bubble-item"]'
            );
            handleSelectInputBox({
              nodeList,
              mountStateMap,
              ctx,
              handleMount,
            });
          } else if (activeScreen === "messaging") {
            const nodeList: NodeListOf<Element> = document.querySelectorAll(
              '[role="dialog"][aria-label="Messaging"][data-view-name="message-overlay-conversation-bubble-item"]'
            );
            handleSelectInputBox({
              nodeList,
              mountStateMap,
              ctx,
              handleMount,
            });
            const pageChatEle: Element | null =
              document.querySelector(".msg-convo-wrapper");
            handleSelectInputBox({
              element: pageChatEle,
              mountStateMap,
              ctx,
              handleMount,
            });
          }
        });
        mutation.removedNodes.forEach((node) => {});
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});

const handleSelectInputBox = (props: {
  nodeList?: NodeListOf<Element>;
  element?: Element | null;
  mountStateMap: Map<Element, string>;
  ctx: any;
  handleMount: any;
}) => {
  const { ctx, mountStateMap, handleMount, nodeList, element } = props;
  let elementsList: Array<Element> = [];
  if (element) {
    elementsList = [element];
  } else if (nodeList) {
    elementsList = Array.from(nodeList);
  }
  elementsList.forEach((node) => {
    const chatInput = node?.querySelector(
      'div[aria-label="Write a message…"][role="textbox"]'
    );
    if (!chatInput || mountStateMap.has(node)) {
      return;
    }
    mountStateMap.set(node, node.id);
    handleMountAIBtn(ctx, chatInput, handleMount);
  });
};

async function handleMountAIBtn(ctx, anchorElement: Element, handleMount) {
  console.log("me", { anchorElement, ctx });
  const ui: ShadowRootContentScriptUi<ReactDOM.Root> = await createShadowRootUi(
    ctx,
    {
      name: "ai-btn",
      position: "inline",
      anchor: anchorElement,
      append: "after",
      onMount: (container) => {
        const wrapper = document.createElement("div");
        wrapper.style.width = "32px";
        Object.assign(wrapper.style, {
          position: "absolute",
          right: "2px",
          bottom: 0,
        });
        container.append(wrapper);
        const root = ReactDOM.createRoot(wrapper);
        root.render(
          <AIIconElement
            ctx={ctx}
            handleMount={async () => await handleMount(anchorElement)}
          />
        );
        return root;
      },
      onRemove: (elements) => {
        elements?.unmount();
      },
    }
  );
  if (document.activeElement === anchorElement) {
    ui.mount();
  }
  const focusListener = anchorElement.addEventListener("focus", () => {
    console.log("mount now");
    ui.mount();
  });

  let blurTimeout: NodeJS.Timeout | null = null;

  anchorElement.addEventListener("blur", () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
    }

    blurTimeout = setTimeout(() => {
      if (ui && typeof ui.remove === "function") {
        ui.remove();
      }
    }, 500);
  });
  ctx.onInvalidated(() => {
    console.log("ctx invalidated");
    // anchorElement.removeEventListener("focus", focusListener);
    // anchorElement.removeEventListener("blur", blurListener);
  });
}

async function moundChatModal(props: { ctx: any; curChatInput: Element }) {
  console.log("start modal mount");
  const { ctx, curChatInput } = props;
  const mainApp = document.body as HTMLBodyElement;
  const ui = await createShadowRootUi(ctx, {
    name: "ai-chat-modal",
    position: "overlay",
    anchor: document.body,
    append: "before",
    onMount: (container) => {
      console.log("modal", { container });
      Object.assign(mainApp.style, {
        pointerEvents: "none",
        opacity: 0.3,
      });
      const wrapper: HTMLDivElement = document.createElement("div");
      Object.assign(wrapper.style, {
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      });
      wrapper.addEventListener("click", (ev) => {
        if (ev.target === ev.currentTarget) {
          ui.remove();
        }
      });
      container.append(wrapper);
      const root = ReactDOM.createRoot(wrapper);
      root.render(<ChatModal ui={ui} curChatInput={curChatInput} />);
      return root;
    },
    onRemove: (element) => {
      Object.assign(mainApp.style, {
        pointerEvents: "initial",
        opacity: "initial",
      });
      element?.unmount();
    },
  });
  ui.mount();
}
