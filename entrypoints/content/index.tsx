import React from "react";
import "./style.css";
import aiIcon from "@/assets/aiIcon.svg";
import { ReactElement } from "react";
import ReactDOM from "react-dom/client";
import "~/assets/tailwind.css";
import SendIcon from "~/assets/sendIcon.svg";
import GenerateIcon from "~/assets/generateIcon.svg";
import DownArrowIcon from "~/assets/downArrow.svg";
import ChatPreview from "@/components/ChatPreview";

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

interface ChatModalWrapperProps {
  // children: ReactElement; // todo : should I  remove it ?
  wrapperclassNamees?: string;
  primaryBtn: {
    // todo: code redunancy
    text: string;
    img: string;
    handler: any; // todo : type should be function
    classNamees?: string;
  };
  secondaryBtn?: {
    text: string;
    img: string;
    handler: any;
    classNamees?: string;
  };
}

const ChatModalWrapper = (props: ChatModalWrapperProps) => {
  const { children, primaryBtn, secondaryBtn, wrapperclassNamees } = props;
  console.log("modal", { primaryBtn });
  return (
    <div
      className={`w-[870px] border-2 border-red-500  relative z-[9999] top-[50vh] left-[0px] p-4 rounded-md  ${wrapperclassNamees}`}
      style={{ backgroundColor: "white" }}
    >
      <div className="">{children}</div>
      <div className="mt-4 flex justify-end gap-3">
        {secondaryBtn && (
          <button
            className={`flex gap-2 items-center bg-white border-2 border-primary-default py-1 px-2 rounded text-primary-default ${
              secondaryBtn.classNamees || ""
            }`}
            style={{ color: "white" }} // todo: why this instead of tailwind classese
            onClick={secondaryBtn.handler}
          >
            <img src={secondaryBtn.img} className="size-4" />
            <span className="text-inherit text-primary-default">
              {secondaryBtn.text}
            </span>
          </button>
        )}
        {primaryBtn && (
          <button
            className={`flex gap-2 items-center bg-primary-blue border-none py-1 px-2 rounded ${
              primaryBtn.classNamees || ""
            }`}
            style={{ color: "white" }} // todo: why this instead of tailwind classese
            onClick={primaryBtn.handler}
          >
            <img src={primaryBtn.img} className="size-4" />
            <span className="">{primaryBtn.text}</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface BaseInputProps {
  name: string;
  value: string | null;
  inputHandler(value: string): any;
  placeholder: string;
  type?: string;
  classNamees?: string;
}

const BasiInput = (props: BaseInputProps) => {
  const {
    name,
    value,
    inputHandler,
    placeholder,
    type = "text",
    classNamees = "",
  } = props;
  return (
    <input
      className={`border rounded-md border-red-400 p-2 w-full  ${classNamees}`}
      name={name}
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(ev) => inputHandler(ev.target.value)}
    />
  );
};
const ChatModal = () => {
  const [isChatPreviewOpen, setChatPreviewOpen] =
    React.useState<boolean>(false);
  // todo: create use memo for getting the props and dependency as isChatPrivewOPen
  const toggleChatPreview = () => setChatPreviewOpen((prevSt) => !prevSt);

  // const propsToSet: ChatModalWrapperProps = {
  //   // children: <Demo />,
  //   primaryBtn: {
  //     text: "Generate",
  //     handler: setChatPreviewOpen(),
  //     img: SendIcon,
  //   },
  // };
  const getModalProps = (): ChatModalWrapperProps => {
    if (isChatPreviewOpen) {
      return {
        primaryBtn: {
          text: "Regenerate",
          handler: toggleChatPreview,
          img: GenerateIcon,
        },
        secondaryBtn: {
          text: "Insert",
          handler: () => {},
          img: DownArrowIcon,
          classNamees: "border border-primary-default",
        },
      };
    }

    return {
      primaryBtn: {
        text: "Genearte",
        handler: toggleChatPreview,
        img: SendIcon,
      },
    };
  };

  const getBaseInputProps = (): BaseInputProps => {
    if (isChatPreviewOpen) {
      return {
        inputHandler: () => {},
        name: "chat-input",
        placeholder: "Your prompt",
        value: null,
      };
    }
    return {
      inputHandler: () => {},
      name: "chat-input",
      placeholder: "Reply thanking for the opportunity",
      value: null,
    };
  };
  return (
    <ChatModalWrapper {...getModalProps()}>
      {isChatPreviewOpen && <ChatPreview />}
      <BasiInput {...getBaseInputProps()} />
    </ChatModalWrapper>
  );
};

export default defineContentScript({
  matches: ["*://*/*"], // todo: match only linkedin
  cssInjectionMode: "ui",

  async main(ctx) {
    setTimeout(() => {
      moundChatModal(ctx);
    }, 500);
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

async function moundChatModal(ctx) {
  const ui = await createShadowRootUi(ctx, {
    name: "ai-chat-modal",
    position: "overlay",
    anchor: document.body,
    append: "before",
    onMount: (container) => {
      console.log("modal", { container });
      const wrapper = document.createElement("div");
      // wrapper.classNameList.add("border-4 border-red-400");
      container.append(wrapper);

      const root = ReactDOM.createRoot(wrapper);
      root.render(<ChatModal />);
      return root;
    },
    onRemove: (element) => {
      element?.unmount();
    },
  });
  ui.mount();
}
