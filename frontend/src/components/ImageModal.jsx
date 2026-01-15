import { motion, AnimatePresence } from 'motion/react';
import { CrossIcon } from './IconSet';

export const ImageModal = ({ isOpen, imageUrl, onClose }) => {
  const ANIMATION_TIMING = {
    enter: 0.3,
    exit: 0.4,
  };

  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: ANIMATION_TIMING.enter,
            },
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: ANIMATION_TIMING.exit,
            },
          }}
        >
          <motion.div
            className="max-h-[90dvh] rounded-xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: {
                duration: ANIMATION_TIMING.enter,
              },
            }}
            exit={{
              scale: 0.95,
              opacity: 0,
              transition: {
                duration: ANIMATION_TIMING.exit,
              },
            }}
          >
            <div className="flex justify-end" onClick={onClose}>
              <button
                type="button"
                className="flex size-[48px] items-center justify-center rounded-full border-[2px] border-white bg-[#252525] text-white shadow-sm"
              >
                <CrossIcon />
              </button>
            </div>
            <img
              src={imageUrl}
              className="mt-5 h-[80dvh] rounded-3xl object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
