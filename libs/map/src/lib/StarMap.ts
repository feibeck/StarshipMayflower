import { MapObjectTable } from './MapObjectTable';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { MapObject } from './MapObject';
import { drawGrid } from './Grid';

const AU = 149597870.7;

export interface PointInSpace {
  x: number;
  y: number;
  z: number;
}

export interface Ship {
  id: number;
  name: string;
  position: PointInSpace;
  heading: PointInSpace;
  shipX?: PointInSpace;
  shipY?: PointInSpace;
}

export class StarMap {
  private width = 0;
  private height = 0;
  private scene: THREE.Scene = new THREE.Scene();
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: false,
  });
  private pickingScene = new THREE.Scene();
  private pickingTexture = new THREE.WebGLRenderTarget(this.width, this.height);

  private objectTable = new MapObjectTable();
  private camera = new THREE.PerspectiveCamera(60, 1, 1, 1000000000);

  private shipMapObject: MapObject | null = null;
  private otherShipMapObjects: MapObject[] = [];
  private objectToShip: Record<string, Ship> = {};

  private objectUnderMouse: MapObject | null = null;
  private selectedObject: MapObject | null = null;

  private selectionSphere = this.createSphere(0x00ff00);
  private hoverSphere = this.createSphere(0xffff00);

  constructor() {
    this.pickingTexture.generateMipmaps = false;

    this.attachMouseListeners(this.getDomElement());

    this.camera.position.set(AU * 2, AU * 2, AU * 2);

    const controls = new OrbitControls(this.camera, this.getDomElement());
    controls.target.set(AU, AU, AU);

    controls.addEventListener('change', () => {
      this.scaleModels();
      this.render();
    });

    this.scene.add(drawGrid());

    this.scene.add(this.selectionSphere);

    this.scene.add(this.hoverSphere);
  }

  attachMouseListeners(element: HTMLElement) {
    element.addEventListener('mousemove', (e) => {
      /*const rect = element.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const selectedObject = this.getObjectAt(mouseX, mouseY);

      return;
      if (selectedObject) {
        this.hoverObject(this.objectToShip[selectedObject.getId()]);
      } else {
        this.hoverSphere.visible = false;
      }

      this.objectUnderMouse = selectedObject;*/
    });

    element.addEventListener('click', (e) => {
      if (this.objectUnderMouse) {
        this.selectObject(this.objectToShip[this.objectUnderMouse.getId()]);
      } else {
        // TODO: Prevent collision with click for map control
        //scope.unselectObject();
      }
    });
  }

  createSphere(color: number): THREE.Mesh {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(8, 100, 100),
      new THREE.MeshBasicMaterial({
        color: color,
        opacity: 0.4,
        transparent: true,
      }),
    );
    sphere.position.set(149597870, 149597870, 149597870);

    sphere.visible = false;

    return sphere;
  }

  hoverObject(hoveredObject: any) {
    this.hoverSphere.position.set(
      hoveredObject.position.x,
      hoveredObject.position.y,
      hoveredObject.position.z,
    );

    this.hoverSphere.visible = true;

    console.error('Should dispatch Event');
    //this.dispatchEvent(this.getHoverEvent(hoveredObject));
  }

  unselectObject() {
    if (!this.selectedObject) {
      return;
    }
    this.selectedObject = null;
    this.selectionSphere.visible = false;

    console.error('Should dispatch Event');
    //this.dispatchEvent(this.getUnselectEvent());
  }

  selectObject(selectedObject: any) {
    this.selectedObject = selectedObject;

    this.selectionSphere.position.set(
      selectedObject.position.x,
      selectedObject.position.y,
      selectedObject.position.z,
    );

    this.selectionSphere.visible = true;

    console.error('Should dispatch Event');
    //this.dispatchEvent(this.getSelectEvent(selectedObject));
  }

  getHoverEvent(mapObject: MapObject) {
    return {
      type: 'hover',
      mapObject: mapObject,
    };
  }

  getSelectEvent(mapObject: MapObject) {
    return {
      type: 'select',
      mapObject: mapObject,
    };
  }

  getUnselectEvent() {
    return {
      type: 'unselect',
    };
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getDomElement() {
    return this.renderer.domElement;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  scaleModels() {
    const point1 = this.camera.position;
    const point2 = new THREE.Vector3(0, 0, 0);
    const distance = point1.distanceTo(point2);
    const shipSize = distance * 0.004;

    if (this.shipMapObject) {
      this.shipMapObject.scale(shipSize);
    }

    this.scaleSphere(this.selectionSphere, shipSize);
    this.scaleSphere(this.hoverSphere, shipSize);

    this.otherShipMapObjects.forEach((ship) => {
      if (ship) {
        ship.scale(shipSize);
      }
    });
  }

  scaleSphere(sphere: THREE.Mesh, shipSize: number) {
    const shipOriginalSize = 5;
    const factor = shipSize / shipOriginalSize;

    sphere.scale.x = factor * 3;
    sphere.scale.y = factor * 3;
    sphere.scale.z = factor * 3;
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.renderer.setSize(width, height);

    this.pickingTexture.height = height;
    this.pickingTexture.width = width;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.render();
  }

  getObjectAt(x: number, y: number): MapObject | null {
    //this.renderer.render(this.pickingScene, this.camera, this.pickingTexture);
    this.renderer.render(this.pickingScene, this.camera);

    const gl = this.renderer.getContext();
    const pixelBuffer = new Uint8Array(4);

    gl.readPixels(
      x,
      this.pickingTexture.height - y,
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixelBuffer,
    );

    const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

    if (id == 0) {
      return null;
    } else {
      return this.objectTable.get(id);
    }
  }

  updateShip(ship: Ship) {
    if (!ship) {
      return;
    }

    if (!this.shipMapObject) {
      const objectId = this.objectTable.getId();

      this.shipMapObject = new MapObject('lime', objectId, {
        orientation: true,
      });
      this.shipMapObject.setRenderScene(this.scene);
      this.shipMapObject.setPickingScene(this.pickingScene);

      this.objectTable.set(objectId, this.shipMapObject);
      this.objectToShip[objectId] = ship;
    } else {
      this.objectToShip[this.shipMapObject.getId()] = ship;
    }

    this.shipMapObject.setPosition(
      ship.position.x,
      ship.position.y,
      ship.position.z,
    );
    this.shipMapObject.setHeading(
      ship.heading.x,
      ship.heading.y,
      ship.heading.z,
    );
    ship.shipX &&
      this.shipMapObject.setShipX(ship.shipX.x, ship.shipX.y, ship.shipX.z);
    ship.shipY &&
      this.shipMapObject.setShipY(ship.shipY.x, ship.shipY.y, ship.shipY.z);
  }

  updateOtherships(ships: Ship[]) {
    if (!ships) {
      return;
    }
    ships.forEach((ship) => {
      if (!this.otherShipMapObjects[ship.id]) {
        const objectId = this.objectTable.getId();

        this.otherShipMapObjects[ship.id] = new MapObject('grey', objectId, {});
        this.otherShipMapObjects[ship.id].setRenderScene(this.scene);
        this.otherShipMapObjects[ship.id].setPickingScene(this.pickingScene);

        this.objectTable.set(objectId, this.otherShipMapObjects[ship.id]);
        this.objectToShip[objectId] = ship;
      } else {
        this.objectToShip[this.otherShipMapObjects[ship.id].getId()] = ship;
      }

      this.otherShipMapObjects[ship.id].setPosition(
        ship.position.x,
        ship.position.y,
        ship.position.z,
      );
      this.otherShipMapObjects[ship.id].setHeading(
        ship.heading.x,
        ship.heading.y,
        ship.heading.z,
      );
    });
  }
}
