import { useRef, useState } from 'react';
import { Loader } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { ANIMATION_CONFIG } from './config/animation';

function App() {
  const [isInConversation, setIsInConversation] = useState(false);
  const isInConversationRef = useRef(false);
  const syncIsInConversationRefAndState = (val) => {
    isInConversationRef.current = val;
    setIsInConversation(val);
  };

  const transitionConfig = {
    delay: isInConversation ? 0 : 0.75,
    duration: ANIMATION_CONFIG.duration,
  };

  return (
    <div id="app" className="h-dvh overflow-hidden">
      <Loader />
      <Leva hidden />
      <div
        className={clsx(
          'flex h-full w-full items-center',
          // isInConversation ? 'pr-[4%]' : 'justify-center'
          isInConversation ? 'pr-[4%]' : 'pr-[4%]'
        )}
      >
        {/* 人物 */}
        <motion.div
          className="h-full w-[480px]"
          layout
          transition={transitionConfig}
        >
          <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
            <Experience isInConversation={isInConversation} />
          </Canvas>
        </motion.div>

        {/* 對話框 */}
        <motion.div
          className={clsx(
            'absolute bottom-[40px] w-[calc(100dvw-480px-40px)]',
            // isInConversation ? 'left-[480px]' : ''
            isInConversation ? 'left-[480px]' : 'left-[480px]'
          )}
          layout
          transition={transitionConfig}
        >
          <UI
            isInConversation={isInConversation}
            isInConversationRef={isInConversationRef}
            syncIsInConversationRefAndState={syncIsInConversationRefAndState}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default App;
