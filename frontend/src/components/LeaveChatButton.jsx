import { clsx } from 'clsx';
import { LeaveChatIcon } from './IconSet';
import { BUTTON_CLASSNAMES } from '../config/colorPalette';

export const LeaveChatButton = ({ loading, onLeave, className = '' }) => {
  return (
    <button
      onClick={onLeave}
      disabled={loading}
      className={clsx(
        'flex size-[48px] items-center justify-center rounded-full border-2',
        BUTTON_CLASSNAMES.leaveChat,
        loading && 'cursor-not-allowed opacity-30',
        className // ← 從父元件接收定位樣式
      )}
    >
      <LeaveChatIcon />
    </button>
  );
};
