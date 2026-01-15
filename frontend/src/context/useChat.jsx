import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { notifyPageCreated, notifyPageRemoved, generatePageId } from '../utils';
import { useUnlockAudio } from '../hooks/useUnlockAudio.js';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const ChatContext = createContext();

/**
 * 提供聊天狀態與邏輯給子元件使用的 React Provider，
 * 包含發送訊息、載入狀態管理、訊息佇列處理等。
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - 被包覆的子元件
 * @returns {JSX.Element}
 */
export const ChatProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const currentMessage = messages[0] ?? null;
  const pageIdRef = useRef(null);

  // 創建 pageId，並通知後端
  const createPageIdAndNotifyBackend = () => {
    if (pageIdRef.current) {
      return;
    }
    const pid = generatePageId();
    pageIdRef.current = pid;
    notifyPageCreated(pid);
  };

  // 移除 pageId，並通知後端
  const removePageIdAndNotifyBackend = () => {
    const pid = pageIdRef.current;
    if (!pid) {
      return;
    }
    notifyPageRemoved(pid);
    pageIdRef.current = null;
  };

  // 解鎖 Safari 音訊播放限制
  const audioRef = useUnlockAudio();

  /**
   * 核心函式： 發送訊息至後端，並更新 messages 狀態
   *
   * @param {string} inputMessage  - 使用者輸入的訊息
   * @returns {Promise<object>} 從後端回傳的資料
   */
  const chat = async (inputMessage) => {
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          pageId: pageIdRef.current,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, ...data.messages]);
      return data;
    } catch (error) {
      console.error('chat() error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 播放完一則訊息後的處理邏輯：
   * - 從訊息佇列中移除最前面的一則訊息
   * - 重置 audioRef，停止播放並清除資源
   */
  const onMessagePlayed = () => {
    setMessages((prev) => prev.slice(1));
    resetAudio();
  };

  /**
   * 重置 audioRef
   * - 不要將 audioRef 設為 null，這樣會導致被授權的 audioRef 被清掉，進而導致被靜音
   */
  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
  };

  // 頁面初始化、離開頁面與元件卸載時通知後端
  useEffect(() => {
    createPageIdAndNotifyBackend();
    window.addEventListener('beforeunload', removePageIdAndNotifyBackend);

    return () => {
      removePageIdAndNotifyBackend();
      window.removeEventListener('beforeunload', removePageIdAndNotifyBackend);
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chat,
        currentMessage,
        setMessages,
        onMessagePlayed,
        loading,
        setLoading,
        audioRef,
        resetAudio,
        createPageIdAndNotifyBackend,
        removePageIdAndNotifyBackend,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

/**
 * 使用聊天 context，必須在 `<ChatProvider>` 中使用。
 * 提供簡易 hook 使用方式，並加入錯誤防呆
 *
 * @throws {Error} 若未包在 Provider 中，會丟出錯誤
 * @returns {object} 提供聊天邏輯與狀態的物件
 */
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
