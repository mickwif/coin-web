import { useChat } from 'ai/react';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const Chat = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      initialMessages: [
        {
          id: '1',
          role: 'assistant',
          content: 'THIS IS YZY AI.',
        },
        {
          id: '2',
          role: 'assistant',
          content: 'WHAT DO YOU WANNA BUY?',
        },
      ],
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      chatContainer?.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
    scrollToTopOfWindow();
  };

  const scrollToTopOfWindow = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full bg-white text-black font-mono w-full mx-auto">
      <main className="overflow-y-auto p-4 space-y-2 max-h-[54svh]  ">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`py-2 px-4 rounded-[20px] ${
              message.role === 'user'
                ? 'bg-black text-white ml-auto'
                : 'bg-[#EFEFEF]'
            } max-w-[80%] break-words`}
          >
            <p className="whitespace-pre-wrap message-text uppercase">
              {message.content}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 bg-[#EFEFEF] rounded-[20px] h-10 px-4 py-2 w-fit">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-black/50 rounded-full"
                initial={{ opacity: 0.5, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: 'reverse',
                  duration: 0.6,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      <footer className="p-4">
        <div className="rounded-full border border-black pl-2 pr-4">
          <form onSubmit={onSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="ENTER MESSAGE"
              className="flex-1 p-2 border-none focus:outline-none bg-transparent uppercase"
              onBlur={scrollToTopOfWindow}
            />
            <button type="submit" className=" ">
              SEND
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};
