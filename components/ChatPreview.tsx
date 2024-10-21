const ChatPreview = () => {
  return (
    <div className="border w-full">
      <div className="flex items-center justify-start">
        <div className="w-3 overflow-hidden">
          <div className="h-4 bg-green-400 rotate-45 transform origin-bottom-right rounded-sm"></div>
        </div>
        <div className="bg-chat-sender text-default p-2 mb-6 rounded-lg flex-1">
          Reply thanking for the opportunity
        </div>
      </div>
      <div className="flex items-center justify-end">
        <div className="bg-chat-receiver text-default p-2 mb-6 rounded-lg flex-1">
          Thank you for the opportunity! If you have any more questions or if
          there's anything else I can help you with, feel free to ask.
        </div>
        <div className="w-3 overflow-hidden ">
          <div className="h-4 bg-blue-200 rotate-45 transform origin-top-left rounded-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;
