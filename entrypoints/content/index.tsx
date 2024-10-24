import "./style.css";
import aiIcon from "@/assets/aiIcon.svg";
import ReactDOM from "react-dom/client";
import ChatModal from "@/components/ChatModal";
import { ShadowRootContentScriptUi } from "wxt/client";
import "~/assets/tailwind.css";

export default defineContentScript({
  matches: ["*://*/*"], // todo: match only linkedin
  cssInjectionMode: "ui",

  async main(ctx) {
    const handleModalMount = async (curChatInput: Element) => {
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
            handlePreProcessMountAIBtn({
              nodeList,
              mountStateMap,
              ctx,
              handleModalMount,
            });
          } else if (activeScreen === "messaging") {
            const nodeList: NodeListOf<Element> = document.querySelectorAll(
              '[role="dialog"][aria-label="Messaging"][data-view-name="message-overlay-conversation-bubble-item"]'
            );
            handlePreProcessMountAIBtn({
              nodeList,
              mountStateMap,
              ctx,
              handleModalMount,
            });
            const pageChatEle: Element | null =
              document.querySelector(".msg-convo-wrapper");
            handlePreProcessMountAIBtn({
              element: pageChatEle,
              mountStateMap,
              ctx,
              handleModalMount,
            });
          }
        });
        mutation.removedNodes.forEach((node) => {
          //todo: handle 'mountStateMap' cleanup
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});

const handlePreProcessMountAIBtn = (props: {
  nodeList?: NodeListOf<Element>;
  element?: Element | null;
  mountStateMap: Map<Element, string>;
  ctx: any;
  handleModalMount: any;
}) => {
  const { ctx, mountStateMap, handleModalMount, nodeList, element } = props;
  let elementsList: Array<Element> = [];
  if (element) {
    elementsList = [element];
  } else if (nodeList) {
    elementsList = Array.from(nodeList);
  }
  elementsList.forEach((node) => {
    const chatInput: HTMLDivElement | null = node?.querySelector(
      'div[aria-label="Write a message…"][role="textbox"]'
    );
    if (!chatInput || mountStateMap.has(node)) {
      return;
    }
    mountStateMap.set(node, node.id);
    mountAIBtn({ ctx, anchorElement: chatInput, handleModalMount });
  });
};

async function mountAIBtn(props: {
  ctx: any;
  anchorElement: HTMLDivElement;
  handleModalMount: (curChatInput: Element) => void;
}) {
  const { anchorElement, ctx, handleModalMount } = props;
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
            handleModalMount={() => handleModalMount(anchorElement)}
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
    }, 200); // todo: verify this behaviour
  });
  ctx.onInvalidated(() => {
    console.log("ctx invalidated");
    //todo: handle cleanup here
  });
}

async function moundChatModal(props: { ctx: any; curChatInput: Element }) {
  const { ctx, curChatInput } = props;
  const mainApp = document.body as HTMLBodyElement;
  const ui = await createShadowRootUi(ctx, {
    name: "ai-chat-modal",
    position: "overlay",
    anchor: document.body,
    append: "before",
    onMount: (container) => {
      const wrapper: HTMLDivElement = document.createElement("div");
      wrapper.classList.add(
        "h-[100vh]",
        "w-[100vw]",
        "flex",
        "items-center",
        "justify-center",
        "fixed",
        "z-[9999]",
        "backdrop-blur-sm",
        "bg-blue-300"
      );
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
      element?.unmount();
    },
  });
  ui.mount();
  ctx.onInvalidated(() => {
    console.log("ctx invalidated");
    //todo: handle cleanup here
  });
}

function AIIconElement(props: { handleModalMount: any }) {
  const { handleModalMount } = props;
  const clickHandler = async () => {
    await handleModalMount();
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
}
