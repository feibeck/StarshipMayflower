import React, { useRef, useEffect, useState, FC } from 'react';

import { Compass as CompassLib } from './lib/Compass';

export interface CompassProps {
  pitch: number;
  yaw: number;
}

export const Compass: FC<CompassProps> = ({ pitch, yaw }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [compass] = useState(new CompassLib());

  useEffect(() => {
    if (!mountRef.current) {
      return;
    }
    mountRef.current.appendChild(compass.getDomElement());
    compass.draw();
  }, [compass]);

  useEffect(() => {
    compass.pitch(pitch);
    compass.yaw(yaw);
    compass.draw();
  }, [compass, pitch, yaw]);

  return <div ref={mountRef}></div>;
};

export default Compass;
