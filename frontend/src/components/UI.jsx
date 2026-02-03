import { useCallback, useEffect, useRef, useState } from 'react';
import OpenAI from 'openai';
import { clsx } from 'clsx';
import RecordRTC from 'recordrtc';
import { useChat } from '../context/useChat';
import { ImageModal } from './ImageModal';
import { LeaveChatButton } from './LeaveChatButton';
import { ChatWindow } from './ChatWindow';
import { StartRecordingIcon, StopRecordingIcon, SendIcon } from './IconSet';
import {
  genMsgId,
  clearStream,
  isAudioPlaying,
  filterTranscribedText,
} from '../utils';
import { useAutoLeaveChat } from '../hooks/useAutoLeaveChat';
import {
  askUserToRetryVoiceInputResponse,
  chatbotSelfIntroductionResponse,
} from '../utils/chatbotStaticResponses';
import { ANIMATION_CONFIG } from '../config/animation';
import { BUTTON_CLASSNAMES, CHAT_BG_CLASSNAMES } from '../config/colorPalette';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const UI = ({ hidden, ...props }) => {
  const {
    isInConversation,
    isInConversationRef,
    syncIsInConversationRefAndState,
  } = props;
  const {
    chat,
    loading,
    setLoading,
    setMessages,
    audioRef,
    resetAudio,
    createPageIdAndNotifyBackend,
    removePageIdAndNotifyBackend,
  } = useChat();
  const [chatHistory, setChatHistory] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [chatTextInput, setChatTextInput] = useState('');

  const clearInput = () => setChatTextInput('');

  //#region 送出使用者訊息，並據此顯示打字機效果以及播放音效、Avatar 動畫
  // (音效以及動畫的部分，經由 currentMessage 變動，觸發在 Avatar.jsx 內的 useEffect，進而控制相關的效果)

  /** 把使用者的 input text 轉換成另一個物件，然後 set 進 chatHistory */
  const addUserMessage = (text) => {
    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'user',
        text: text,
      },
    ]);
  };

  /** 獲取 BOT 回應 */
  const fetchBotResponse = async (text) => {
    const response = await chat(text);
    if (!response.messages || !Array.isArray(response.messages)) {
      throw new Error('Invalid response format');
    }
    return {
      text: response.messages[0]?.text || 'Error: Missing text.',
      summary: response.messages[0]?.summary || '',
      image: response.messages[0]?.images,
    };
  };

  /** 打字機效果 */
  const animateBotTyping = async ({
    msgId,
    text,
    summary,
    isSelfIntroduction = false,
  }) => {
    const DETAIL_SEPARATOR = `\n\n\n------------------\n以下為詳細資訊：\n\n`;
    const DETAIL_SEPARATOR_ONLY_LINE = `\n\n------------------\n`;

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const segmentText = (input) => {
      // 建議用 'und'，避免中文/混合語系時用 'en' 造成不必要的分段差異
      const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(input ?? ''), (s) => s.segment);
    };

    let summaryPart = summary ?? '';
    let textPart;

    if (isSelfIntroduction) {
      textPart = `${DETAIL_SEPARATOR_ONLY_LINE}${text}`;
    } else if (summary) {
      textPart = `${DETAIL_SEPARATOR}${text}`;
    } else {
      textPart = text;
    }

    const batchSize = 1;

    // 打字機速度設定
    const fastTextSpeed = 60;
    const slowTextSpeed = 15;
    let summaryDelay = slowTextSpeed;
    let textDelay = fastTextSpeed;
    if (summary) {
      summaryDelay = fastTextSpeed;
      textDelay = slowTextSpeed;
    }

    // 建立一則 bot 訊息，先從空字串開始打
    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'bot',
        msgId,
        text: '',
        image: null,
        complete: false,
      },
    ]);

    let displayedText = '';
    const typeAppendEfficient = async (appendText, perCharDelay) => {
      const segments = segmentText(appendText);

      for (let i = 0; i < segments.length; i++) {
        const delay = i === 0 ? 0 : perCharDelay;
        displayedText += segments[i];

        if (i % batchSize === 0 || i === segments.length - 1) {
          setChatHistory((prev) =>
            prev.map((m) =>
              m.msgId === msgId ? { ...m, text: displayedText } : m
            )
          );
        }

        await sleep(delay);
      }
    };

    // 先快打 summary + separator (如果有傳入 summary)，再慢打 text
    if (summary) {
      await typeAppendEfficient(summaryPart, summaryDelay);
    }
    await typeAppendEfficient(textPart, textDelay);
  };

  const finalizeBotMessage = ({ msgId, image }) => {
    setChatHistory((prev) => {
      const index = prev.findIndex(
        (msg) => msg.msgId === msgId && msg.sender === 'bot' && !msg.complete
      );
      if (index === -1) {
        return prev;
      }
      const nextHistory = [...prev];
      nextHistory[index].complete = true;
      nextHistory[index].image = image || null;
      return nextHistory;
    });
  };

  const chatbotSelfIntroduction = async () => {
    // 透過 setMessages 觸發 Avatar.jsx 內的 useEffect，進而觸發語音播放以及動畫效果
    setMessages((prev) => [...prev, chatbotSelfIntroductionResponse]);

    const msgId = genMsgId();
    // await animateBotTyping({
    //   msgId,
    //   text: chatbotSelfIntroductionResponse.text,
    //   summary: chatbotSelfIntroductionResponse.summary,
    //   isSelfIntroduction: true,
    // });
    await animateBotTyping({
      msgId,
      text: chatbotSelfIntroductionResponse.text,
    });
    finalizeBotMessage({
      msgId,
      image: chatbotSelfIntroductionResponse.images,
    });
  };

  const askUserToRetryVoiceInput = async () => {
    // 透過 setMessages 觸發 Avatar.jsx 內的 useEffect，進而觸發語音播放以及動畫效果
    setMessages((prev) => [...prev, askUserToRetryVoiceInputResponse]);

    const msgId = genMsgId();
    await animateBotTyping({
      msgId,
      text: askUserToRetryVoiceInputResponse.text,
    });
    finalizeBotMessage({
      msgId,
      image: askUserToRetryVoiceInputResponse.images,
    });
  };

  const handleSendError = (error) => {
    console.error(error);
    const msgId = genMsgId();
    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'bot',
        msgId,
        text: 'Error: Unable to fetch response.',
      },
    ]);
  };

  const sendMessage = async (text) => {
    if (isAudioPlaying(audioRef)) {
      alert('目前小幫手還沒回覆完畢哦');
      return;
    }

    const trimmedText = text.trim();

    if (!trimmedText || loading) {
      return;
    }

    setLoading(true);
    clearInput();

    try {
      addUserMessage(trimmedText);
      const response = await fetchBotResponse(trimmedText);
      const msgId = genMsgId();
      if (response.summary) {
        await animateBotTyping({
          msgId,
          summary: response.summary,
          text: response.text,
        });
      } else {
        await animateBotTyping({
          msgId,
          text: response.text,
        });
      }
      finalizeBotMessage({
        msgId,
        image: response.image,
      });
    } catch (error) {
      handleSendError(error);
    } finally {
      setLoading(false);
    }
  };

  //#endregion

  //#region 語音轉文字相關功能

  const isPreparingRecorderRef = useRef(false);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isTranscribingRef = useRef(false);

  const VOICE_MIME_TYPE = 'audio/mp4';
  const DEFAULT_VOICE_FILE_NAME = 'audio.mp4';

  const syncRecordingRefAndState = (val) => {
    isRecordingRef.current = val;
    setIsRecording(val);
  };

  const syncIsTranscribingRefAndState = (val) => {
    isTranscribingRef.current = val;
    setIsTranscribing(val);
  };

  const resetRecording = () => {
    const cleanup = () => {
      clearStream(streamRef);
      syncRecordingRefAndState(false);
    };

    if (!mediaRecorderRef.current) {
      cleanup();
      return;
    }

    try {
      mediaRecorderRef.current?.stopRecording(() => {
        try {
          mediaRecorderRef.current?.destroy();
        } catch (e) {
          console.error('RecordRTC destroy error:', e);
        }
        mediaRecorderRef.current = null;
        cleanup();
      });
    } catch (error) {
      console.error(error);
      cleanup();
    }
  };

  /** 處理錄音結束後的事情，包含語音轉文字、釋放各種資源 */
  const handleRecordingStop = async (audioBlob) => {
    const file = new File([audioBlob], DEFAULT_VOICE_FILE_NAME, {
      type: VOICE_MIME_TYPE,
    });

    console.log(
      `recording stopped, created audio file size = ${file.size} as ${file.name}`
    );

    // 檢查 blob 是否為空檔（有 chunk 但無實際資料）
    if (audioBlob.size === 0) {
      console.warn('⚠️ 音訊為空，請重新錄音');
      askUserToRetryVoiceInput();
      resetRecording();
      return;
    }

    try {
      syncIsTranscribingRefAndState(true);

      // 使用 OpenAI API 將音檔轉為文字
      const payload = {
        file,
        model: 'whisper-1',
        response_format: 'verbose_json',
        language: 'zh',
        prompt: '你必須以繁體中文結果輸出，必須採用台灣地區常用的說法',
      };
      console.log(payload.file);

      const transcription = await openai.audio.transcriptions.create(payload);
      console.log('ok. returned transcription.text:', transcription.text);

      // 避免已經離開對話了，但殘留的語音轉文字的內容卻顯示在畫面上
      if (isInConversationRef.current) {
        const filteredText = filterTranscribedText(transcription.text);
        if (filteredText === '') {
          console.warn('音檔轉換文字成功，但內容為空');
          askUserToRetryVoiceInput();
          return;
        }
        setChatTextInput((prev) => prev + (filteredText || ''));
      }
    } catch (error) {
      console.error(
        'Error transcribing audio: ' + (error?.message || JSON.stringify(error))
      );
      askUserToRetryVoiceInput();
    } finally {
      resetRecording();
      syncIsTranscribingRefAndState(false);
    }
  };

  const startRecording = async () => {
    // 開始錄音
    try {
      if (!MediaRecorder.isTypeSupported(VOICE_MIME_TYPE)) {
        alert('MIME type not supported:' + VOICE_MIME_TYPE);
        resetRecording();
        return;
      }

      isPreparingRecorderRef.current = true;

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new RecordRTC(streamRef.current, {
        // disableLogs: true,
        type: 'audio',
        mimeType: VOICE_MIME_TYPE,
        timeSlice: 200,
        ondataavailable: async (blob) => {
          console.log('blob.size', blob.size);
          if (blob.size === 0) {
            // 停止錄音並重設
            try {
              mediaRecorderRef.current?.stopRecording(() => {
                mediaRecorderRef.current.destroy();
                mediaRecorderRef.current = null;
              });
            } catch (error) {
              console.error('Reset recorder failed:', error);
            }
            askUserToRetryVoiceInput();
            resetRecording();
            return;
          }
        },
      });

      mediaRecorderRef.current = recorder;
      recorder.startRecording();
      console.log('record starting');
    } catch (error) {
      console.error(
        'Error accessing microphone: ' +
          (error?.message || JSON.stringify(error))
      );
      askUserToRetryVoiceInput();
      resetRecording();
    } finally {
      isPreparingRecorderRef.current = false;
    }
  };

  const stopRecording = async () => {
    try {
      if (!mediaRecorderRef.current) {
        return;
      }

      mediaRecorderRef.current.stopRecording(async () => {
        const audioBlob = mediaRecorderRef.current.getBlob();
        console.log('audioBlob.size', audioBlob.size);
        await handleRecordingStop(audioBlob);

        // 釋放 RecordRTC 相關資源
        mediaRecorderRef.current.destroy();
        mediaRecorderRef.current = null;
      });
    } catch (error) {
      console.error(
        'Error when stopRecording: ' + (error?.message || JSON.stringify(error))
      );
    }
  };

  const toggleRecording = () => {
    if (!isInConversationRef.current) {
      return;
    }

    if (isAudioPlaying(audioRef)) {
      alert('目前小幫手還沒回覆完畢哦');
      return;
    }

    if (isTranscribingRef.current) {
      alert('語音轉文字中，請於稍後再錄下一段');
      return;
    }

    if (isRecordingRef.current) {
      syncRecordingRefAndState(false);
      stopRecording();
    } else {
      if (isPreparingRecorderRef.current) {
        console.warn('準備 recorder 中');
        return;
      }
      syncRecordingRefAndState(true);
      startRecording();
    }
  };

  //#endregion

  const onClickImage = useCallback((src) => {
    setZoomedImage(src);
  }, []);

  const onClickClose = () => {
    setZoomedImage(null);
  };

  const leaveChatHandler = () => {
    syncIsInConversationRefAndState(false);
    clearInput();
    resetRecording();
    resetAudio();
    syncIsTranscribingRefAndState(false);
    /** FIXME: 以下為暫時性的 workaround，後續可考慮重構
     * 由於 setMessages 會造成 messages 的變化，進而造成 currentMessage 的變化，
     * 這會觸發 Avatar.jsx 元件中對應 useEffect 內的邏輯，
     * 如此即能達成終止對話時，也結束嘴型動畫、播放中語音的效果
     *
     * TODO: 待未來有時間時，應重新檢視 Avatar 與 currentMessage 狀態的耦合問題，進行重構
     */
    setMessages([]);
    setChatHistory([]);
    removePageIdAndNotifyBackend();
  };

  // 是否有未完成的 bot 回覆
  const hasIncompleteBotMsg = () => {
    const n = chatHistory.length;
    // 目前應該只會有最後兩則訊息有機會是 incomplete，所以只檢查最後兩項
    for (let i = n - 1; i >= 0 && i >= n - 2; i--) {
      const m = chatHistory[i];
      if (m?.sender === 'bot' && !m.complete) {
        console.warn(`hasIncompleteBotMsg boolean: true`);
        return true;
      }
    }
    console.warn(`hasIncompleteBotMsg boolean: false`);
    return false;
  };

  useAutoLeaveChat({
    enabled: isInConversation,
    timeoutMs: 3 * 60 * 1000, // 3 分鐘
    busyRecheckMs: 10 * 1000, // 10 秒
    // timeoutMs: 15 * 1000, // 測試用 - 15 秒
    // busyRecheckMs: 2 * 1000, // 測試用 - 2 秒
    // timeoutMs: 50 * 60 * 1000, // 開發用 - 50 分鐘
    // busyRecheckMs: 50 * 60 * 1000, // 開發用 - 50 分鐘
    onTimeout: leaveChatHandler,
    isBusy: () =>
      loading ||
      isRecordingRef.current ||
      isTranscribingRef.current ||
      isAudioPlaying(audioRef) ||
      hasIncompleteBotMsg(), // Chat BOT 回應中，也要視為 busy
  });

  useEffect(() => {
    return () => {
      leaveChatHandler();
    };
  }, []);

  // Chatbot 初始化自介
  useEffect(() => {
    if (isInConversation && chatHistory.length === 0) {
      setTimeout(() => {
        setMessages([]);
        chatbotSelfIntroduction();
        createPageIdAndNotifyBackend();
      }, ANIMATION_CONFIG.duration * 1000); // 等待對話紀錄框的動畫展開
    }
  }, [isInConversation]);

  if (hidden) {
    return null;
  }

  return (
    <>
      <div
        className={clsx(
          'flex flex-col',
          // isInConversation ? 'justify-between' : 'justify-end'
          isInConversation ? 'justify-end' : 'justify-end'
        )}
        style={{
          minHeight: 140, // 140 = 48 + 20 + 72
        }}
      >
        <div
          className={clsx(
            'flex justify-end',
            isInConversation ? '' : 'opacity-0'
          )}
        >
          <LeaveChatButton onLeave={leaveChatHandler} loading={loading} />
        </div>
        <div
          className={clsx(
            'rounded-[36px] text-2xl text-white',
            CHAT_BG_CLASSNAMES.chatWindow,
            isInConversation && 'mt-5'
          )}
        >
          {/* 對話內容 */}
          <ChatWindow
            chatHistory={chatHistory}
            isInConversation={isInConversation}
            onClickImage={onClickImage}
          />

          {/* 輸入框 + 錄音按鈕 + 送出按鈕 */}
          <div
            className={clsx(
              'flex items-center gap-2 rounded-full p-3 text-white',
              CHAT_BG_CLASSNAMES.inputArea
            )}
            onClick={() => syncIsInConversationRefAndState(true)}
          >
            <div className="flex w-full">
              {(() => {
                if (isTranscribing) {
                  return (
                    <div className="my-3 ml-5 hover:cursor-default">
                      語音轉文字中 ...
                    </div>
                  );
                }
                if (loading) {
                  return (
                    <div className="my-3 ml-5 hover:cursor-default">
                      小幫手思考中，請稍候 ...
                    </div>
                  );
                }
                return (
                  <>
                    <input
                      type="text"
                      value={chatTextInput}
                      className={clsx(
                        'my-2 ml-5 block grow bg-transparent placeholder-white placeholder-opacity-50 focus:outline focus:outline-0',
                        isInConversation ? '' : 'pointer-events-none'
                      )}
                      placeholder="Hi 我是你的櫃檯小幫手！快告訴我，你想問什麼？"
                      autoComplete="off"
                      onChange={(e) => setChatTextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          sendMessage(chatTextInput.trim());
                        }
                      }}
                    />
                    <div className="flex items-center gap-5">
                      <button
                        type="button"
                        className={clsx(
                          'pointer-events-auto flex size-[48px] items-center justify-center rounded-full border-2 border-white p-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600',
                          BUTTON_CLASSNAMES.record,
                          isRecording ? 'bg-red-600' : ''
                        )}
                        onClick={toggleRecording}
                      >
                        {isRecording ? (
                          <StopRecordingIcon />
                        ) : (
                          <StartRecordingIcon />
                        )}
                      </button>
                      <button
                        onClick={() => sendMessage(chatTextInput.trim())}
                        className={clsx(
                          'flex size-[48px] items-center justify-center rounded-full border-2',
                          BUTTON_CLASSNAMES.send
                        )}
                      >
                        <SendIcon />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <ImageModal
        isOpen={!!zoomedImage}
        imageUrl={zoomedImage}
        onClose={onClickClose}
      />
    </>
  );
};
