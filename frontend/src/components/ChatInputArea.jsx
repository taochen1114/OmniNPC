import { clsx } from 'clsx';
import { useChat } from '../context/useChat';
import { StartRecordingIcon, StopRecordingIcon, SendIcon } from './IconSet';

export const ChatInputArea = ({
  isTranscribing,
  isRecording,
  toggleRecording,
  chatTextInput,
  setChatTextInput,
  sendMessage,
  isInConversation,
  syncIsInConversationRefAndState,
}) => {
  const { loading } = useChat();
  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-full bg-[#252525]/70 px-4 py-5'
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
                name="search"
                id="search"
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
              <div className="flex place-items-center gap-5">
                <button
                  type="button"
                  className={clsx(
                    'pointer-events-auto flex size-[48px] items-center justify-center rounded-full border-2 border-white bg-gray-900/50 p-2 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600',
                    isRecording ? 'bg-red-600' : ''
                  )}
                  onClick={toggleRecording}
                >
                  {isRecording ? <StopRecordingIcon /> : <StartRecordingIcon />}
                </button>
                <button
                  onClick={() => sendMessage(chatTextInput.trim())}
                  className={clsx(
                    'flex size-[48px] items-center justify-center rounded-full border-2 bg-[#3B5FFF] text-white'
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
  );
};
