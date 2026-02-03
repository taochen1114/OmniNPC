import { CameraControls, Environment } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { Avatar } from './Avatar';

export const Experience = (props) => {
  const cameraControls = useRef();
  const { isInConversation } = props;

  function setCameraToSeeRight() {
    cameraControls.current.setLookAt(-0.45, 1.7, 2.1, 0.05, 1.4, 0, true);
  }

  function setCameraToSeeFront() {
    cameraControls.current.setLookAt(0, 1.7, 2.1, 0.05, 1.4, 0, true);
  }

  useEffect(() => {
    setCameraToSeeFront();
  }, []);

  useEffect(() => {
    setCameraToSeeRight();
    // if (isInConversation) {
    //   setCameraToSeeRight();
    // } else {
    //   setCameraToSeeFront();
    // }
  }, [isInConversation]);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      <Avatar />
    </>
  );
};
