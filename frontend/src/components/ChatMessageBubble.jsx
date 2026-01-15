import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { CHAT_BG_CLASSNAMES } from '../config/colorPalette';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export const ChatMessageBubble = memo(
  ({ sender, text, image, onClickImage }) => {
    // image 之前只支援一張圖片，所以命名為 image，後續擴充為陣列，以利向使用者展示多張圖片

    const isUser = sender === 'user';

    // 兼容：image 可能是字串或陣列，轉成陣列統一處理
    const imageSrcList = useMemo(() => {
      if (!image) {
        return [];
      }

      if (Array.isArray(image)) {
        return image.map((img) => `/assets/${img}`);
      }

      return [`/assets/${image}`];
    }, [image]);

    const handleClick = (targetSrc) => {
      if (typeof onClickImage === 'function') {
        onClickImage(targetSrc);
      }
    };

    const renderSingleImage = (src, type = 'single') => (
      <div className={clsx('flex items-center justify-center', 'h-full')}>
        <img
          src={src}
          className={clsx(
            'rounded-3xl hover:cursor-pointer',
            type === 'single' ? 'w-full' : 'w-[80%]'
          )}
          onClick={() => handleClick(src)}
        />
      </div>
    );

    return (
      <div className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
        <div
          className={clsx(
            'max-w-[80%] whitespace-pre-line rounded-3xl px-6 py-5',
            isUser ? CHAT_BG_CLASSNAMES.user : CHAT_BG_CLASSNAMES.bot,
            isUser
              ? '[border-bottom-right-radius:0]'
              : '[border-bottom-left-radius:0]'
          )}
        >
          {text}

          {imageSrcList.length > 0 && (
            <div className="mt-5">
              {imageSrcList.length === 1 ? (
                // 只有一張就直接顯示圖片，不用滑動
                renderSingleImage(imageSrcList[0])
              ) : (
                // 多張圖片，使用 Swiper
                <Swiper
                  modules={[Pagination, Navigation]}
                  pagination={{ clickable: true }}
                  navigation
                  spaceBetween={16}
                  slidesPerView={1}
                  className="rounded-3xl"
                  loop
                >
                  {imageSrcList.map((src, idx) => (
                    <SwiperSlide key={idx}>
                      {renderSingleImage(src, 'multiple')}
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
