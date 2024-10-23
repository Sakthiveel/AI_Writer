const ChatPreview = () => {
  return (
    <div className="min-w-[870px] flex flex-col gap-5 mb-5">
      <div className="self-end bg-chat-sender p-4 rounded-lg max-w-[70%]">
        <div className="text-2xl leading-9 font-normal text-primary-default">
          Reply thanking for the opportunity
        </div>
      </div>
      <div className="self-start bg-chat-receiver p-4 rounded-lg max-w-[70%]">
        <div className="text-2xl text-primary-default leading-9 font-normal">
          Thank you for the opportunity! If you have any more questions or if
          there's anything else I can help you with, feel free to ask.
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;
