import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ANIMATION_CONFIG } from '../config/animation';

export const ChatWindow = ({ chatHistory, onClickImage, isInConversation }) => {
  const scrollRef = useRef(null);

  // 滾動到底部
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <AnimatePresence>
      {isInConversation && (
        <motion.div
          className={clsx(
            'overflow-y-auto pr-6 leading-[1.28]',
            'flex flex-col space-y-4',
            '[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#252525]/30',
            '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/30',
            '[&::-webkit-scrollbar]:w-2'
          )}
          onWheel={(e) => e.stopPropagation()}
          initial={{
            height: 0,
            opacity: 0,
            margin: 0,
          }}
          exit={{
            height: 0,
            opacity: 0,
            margin: 0,
            transition: {
              duration: ANIMATION_CONFIG.duration,
              delay: 0,
            },
          }}
          animate={{
            height:
              'calc(100dvh - (40px * 2 + 48px + 20px + 72px + 24px + 20px))',
            // 40px * 2: 上下; 48px: leaveChatButton; 20px: margin; 72px: inputArea; 24px: ChatWindow margin-top; 20px: ChatWindow margin-bottom;
            opacity: 1,
            margin: '24px 24px 20px 24px',
            transition: {
              duration: ANIMATION_CONFIG.duration,
              delay: 0.6,
            },
          }}
        >
          {chatHistory.map((entry, index) => (
            <ChatMessageBubble
              key={index}
              sender={entry.sender}
              text={entry.text}
              image={entry.image}
              onClickImage={onClickImage}
            />
          ))}
          <div ref={scrollRef} className="!mt-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
