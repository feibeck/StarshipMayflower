import { FC, useEffect, useRef, useState } from 'react';
import { MapObject } from './MapObject';
import { Ship, StarMap } from './StarMap';

const AU = 149597870.7;

/* eslint-disable-next-line */
export interface MapProps {
  ship: Ship;
  mapObjects: Ship[];
}

export const Map: FC<MapProps> = ({ ship, mapObjects }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const [starMap, setStarMap] = useState<StarMap>(new StarMap());

  useEffect(() => {
    if (!mountRef.current) {
      return;
    }
    starMap.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(starMap.getDomElement());

    const animate = () => {
      requestAnimationFrame(animate);
      starMap.render();
    };
    /*
    map.addEventListener('hover', function (event) {
      //console.log("hover over ship " + event.mapObject.name);
    });

    map.addEventListener('select', function (event) {
      console.log('Selected ship ' + event.mapObject.name);
      selectedObject = event.mapObject;
    });

    map.addEventListener('unselect', function (event) {
      console.log('Unselected ship');
    });
    */
    return () => {
      //current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    starMap.updateShip(ship);
    starMap.updateOtherships(mapObjects);
    starMap.scaleModels();
  }, [ship, mapObjects]);

  return <div ref={mountRef}></div>;
};

export default Map;
