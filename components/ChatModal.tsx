import React from "react";
import ReactDOM from "react-dom/client";
import GenerateIcon from "~/assets/generateIcon.svg";
import DownArrowIcon from "~/assets/downArrow.svg";
import ChatPreview from "@/components/ChatPreview";
import SendIcon from "~/assets/sendIcon.svg";
import "~/assets/tailwind.css";
import { ShadowRootContentScriptUi } from "wxt/client";
interface ChatModalWrapperProps {
  children?: React.ReactNode; // todo : should I  remove it ?
  wrapperclassName?: string;
  primaryBtn: {
    // todo: code redunancy
    text: string;
    img: string;
    handler: any; // todo : type should be function
    className?: string;
  };
  secondaryBtn?: {
    text: string;
    img: string;
    handler: any;
    className?: string;
  };
}
interface BtnProps {
  handler?: any;
  img?: string;
  text: string;
  className?: string;
}
const BaseButton = (props: BtnProps) => {
  console.log({ props });
  return (
    <button
      className={`flex gap-3 items-center bg-primary-blue border-none py-3 px-4 rounded-lg font-semibold text-2xl leading-7  ${
        props.className || ""
      }`}
      style={{ color: "white" }} // todo: why this instead of tailwind classese
      onClick={props.handler}
    >
      <img src={props.img} className="size-full" />
      <span>{props.text}</span>
    </button>
  );
};

// Use forwardRef to accept a ref
const ChatModalWrapper = React.forwardRef<
  HTMLDivElement,
  ChatModalWrapperProps
>((props, ref) => {
  const { children, primaryBtn, secondaryBtn, wrapperclassName } = props;
  console.log("modal", { primaryBtn });

  return (
    <div
      ref={ref} // Attach the ref to the div
      className={`w-fit relative z-[99999] p-6 rounded-lg shadow-md ${wrapperclassName}`}
      style={{ backgroundColor: "white" }}
    >
      <div className="">{children}</div>
      <div className="mt-4 flex justify-end gap-3">
        {secondaryBtn && <BaseButton {...secondaryBtn} />}
        {primaryBtn && <BaseButton {...primaryBtn} />}
      </div>
    </div>
  );
});

interface BaseInputProps {
  name: string;
  value: string | null;
  inputHandler(value: string): any;
  placeholder: string;
  type?: string;
  className?: string;
  ref?: any; //todo:
}

const BasiInput = (props: BaseInputProps) => {
  const {
    name,
    value,
    inputHandler,
    placeholder,
    type = "text",
    className = "",
    ref,
  } = props;
  return (
    <input
      className={`border rounded-md p-3 w-full font-medium text-2xl leading-7 text-primary-border active:outline-none  focus:outline-none ${className}`}
      name={name}
      type={type}
      // ref={ref}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(ev) => inputHandler(ev.target.value)}
    />
  );
};
const ChatModal = (props: {
  ui: ShadowRootContentScriptUi<ReactDOM.Root>;
  curChatInput: Element;
}) => {
  const { curChatInput, ui } = props;
  const [isChatPreviewOpen, setChatPreviewOpen] =
    React.useState<boolean>(false);
  const modalRef = React.useRef<Element>(null);
  // todo: create use memo for getting the props and dependency as isChatPrivewOPen
  const toggleChatPreview = () => setChatPreviewOpen((prevSt) => !prevSt);

  React.useEffect(() => {
    console.log("modal", modalRef.current);
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // ui.remove();
        console.log("close");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ui]);

  const insertHandler = () => {
    console.log({ curChatInput });
    const paraElement: HTMLParagraphElement = curChatInput
      ?.children[0] as HTMLDivElement;

    const placeholdeEle: HTMLDivElement | null | undefined =
      curChatInput?.parentElement?.querySelector(".msg-form__placeholder");
    placeholdeEle?.classList.remove("msg-form__placeholder");
    paraElement.innerText =
      "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.";
    console.log(
      "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask."
    );
    ui.remove();
    curChatInput.focus();
    return;
  };

  const getModalProps = (): ChatModalWrapperProps => {
    if (isChatPreviewOpen) {
      return {
        wrapperclassName: "w-[870px]",
        primaryBtn: {
          text: "Regenerate",
          handler: toggleChatPreview,
          img: GenerateIcon,
        },
        secondaryBtn: {
          text: "Insert",
          handler: insertHandler,
          img: DownArrowIcon,
          className:
            "border border-primary-default text-primary-default bg-red-300",
        },
      };
    }

    return {
      wrapperclassName: "w-[870px]",
      primaryBtn: {
        text: "Genearte",
        handler: () => {
          // ui.mounted?.unmount();
          // ui.remove();
          toggleChatPreview();
        },
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
        // ref: inputRef,
      };
    }
    return {
      inputHandler: () => {},
      name: "chat-input",
      placeholder: "Reply thanking for the opportunity",
      value: null,
      // ref: inputRef,
    };
  };
  return (
    <ChatModalWrapper {...getModalProps()} ref={modalRef}>
      {isChatPreviewOpen && <ChatPreview />}
      {/* <input ref={inputRef} /> */}
      <BasiInput {...getBaseInputProps()} />
    </ChatModalWrapper>
  );
};

export default ChatModal;
