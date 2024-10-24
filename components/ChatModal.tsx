import React from "react";
import ReactDOM from "react-dom/client";
import GenerateIcon from "~/assets/generateIcon.svg";
import DownArrowIcon from "~/assets/downArrow.svg";
import ChatPreview from "@/components/ChatPreview";
import SendIcon from "~/assets/sendIcon.svg";
import "~/assets/tailwind.css";
import { ShadowRootContentScriptUi } from "wxt/client";

interface BasicButton {
  text: string;
  img?: string;
  handler?: () => void;
  className?: string;
}
interface ChatModalWrapperProps {
  children?: React.ReactNode;
  wrapperclassName?: string;
  primaryBtn: BasicButton;
  secondaryBtn?: BasicButton;
}

const BaseButton = (props: BasicButton) => {
  console.log({ props });
  return (
    <button
      className={`flex gap-3 items-center  py-3 px-6 rounded-lg font-semibold text-2xl leading-7  ${
        props.className || ""
      }`}
      onClick={props.handler}
    >
      <img src={props.img} className="size-[80%]" />
      <span>{props.text}</span>
    </button>
  );
};

const ChatModalWrapper = React.forwardRef<
  HTMLDivElement,
  ChatModalWrapperProps
>((props, ref) => {
  const { children, primaryBtn, secondaryBtn, wrapperclassName } = props;
  console.log("modal", { primaryBtn });

  return (
    <div
      ref={ref} // Attach the ref to the div
      className={`w-fit relative z-[99999] p-[26px] rounded-2xl shadow-md ${wrapperclassName}`}
      style={{ backgroundColor: "white" }}
    >
      <div className="">{children}</div>
      <div className="mt-6 flex justify-end gap-3">
        {secondaryBtn && <BaseButton {...secondaryBtn} />}
        {primaryBtn && <BaseButton {...primaryBtn} />}
      </div>
    </div>
  );
});

interface BaseInputProps {
  name: string;
  value: string | null;
  inputHandler: (value: string) => void;
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
      className={`border rounded-md p-3 w-[870px] font-medium text-2xl leading-7 border-primary-border active:outline-none  focus:outline-none ${className}`}
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
  const [promptInput, setPromptInput] = React.useState<string | null>(null);
  const toggleChatPreview = () => setChatPreviewOpen((prevSt) => !prevSt);

  const insertHandler = () => {
    console.log({ curChatInput });
    const paraElement: HTMLParagraphElement = curChatInput
      ?.children[0] as HTMLDivElement;

    const placeholdeEle: HTMLDivElement | null | undefined =
      curChatInput?.parentElement?.querySelector(".msg-form__placeholder");
    placeholdeEle?.classList.remove("msg-form__placeholder");
    paraElement.innerText =
      "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.";
    ui.remove();
    setPromptInput(null);
    return;
  };
  const getModalProps = (): ChatModalWrapperProps => {
    if (isChatPreviewOpen) {
      return {
        primaryBtn: {
          text: "Regenerate",
          img: GenerateIcon,
          className: "border-none bg-primary-blue text-white",
        },
        secondaryBtn: {
          text: "Insert",
          handler: insertHandler,
          img: DownArrowIcon,
          className: "border border-primary-default text-primary-default",
        },
      };
    }

    return {
      primaryBtn: {
        text: "Generate",
        handler: () => {
          toggleChatPreview();
          setPromptInput(null);
        },
        className: "border-none bg-primary-blue text-white",
        img: SendIcon,
      },
    };
  };
  const getBaseInputProps = (): BaseInputProps => {
    return {
      value: promptInput,
      inputHandler: (text: string) => setPromptInput(text),
      name: "chat-input",
      className: "",
      placeholder: "Your prompt",
    };
  };
  return (
    <ChatModalWrapper {...getModalProps()}>
      {isChatPreviewOpen && <ChatPreview prompt={promptInput} />}
      <BasiInput {...getBaseInputProps()} />
    </ChatModalWrapper>
  );
};

export default ChatModal;
