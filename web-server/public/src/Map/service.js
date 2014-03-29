(function() {
    'use strict';

    var MapService = angular.module('MapService', ['ThreeService']);

    /**
     * Defines the length of an astronomical unit
     */
    MapService.factory('MapConstants', [
        function()
        {
            return {
                AU: 149597870.7
            };
        }
    ]);

    MapService.directive('ssmMapLabel', ['THREE',

        function(THREE) {

            function toScreenXY(position, element, camera)
            {
                var pos = position.clone();
                var projScreenMat = new THREE.Matrix4();
                projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                pos.applyProjection(projScreenMat);

                return {
                    x: (pos.x + 1) * element.width() / 2,
                    y: (-pos.y + 1) * element.height() / 2
                };
            }

            return {

                template: '<div class="map-ship-label">{{mapobject.name}}</div>',

                replace: true,

                scope: {
                    mapobject: '=mapobject',
                    camera: '=camera'
                },

                link: function($scope, element, attrs) {

                    var map = angular.element(element).parent().parent();

                    $scope.$watch('mapobject', function() {

                        var mapobject = $scope.mapobject;

                        if (!mapobject) {
                            return;
                        }

                        var pos = toScreenXY(
                            new THREE.Vector3(
                                mapobject.position.x,
                                mapobject.position.y,
                                mapobject.position.z
                            ),
                            map,
                            $scope.camera
                        );

                        var label = element;

                        label.css('top', pos.y - (label.height() / 2));
                        label.css('left', pos.x + 3);

                    });

                }

            };

        }]

    );

    MapService.directive('ssmMap', ['THREE', 'MapConstants', 'MapGrid', '$window', 'MapObject', 'MapObjectTable',

        function(THREE, MapConstants, MapGrid, $window, MapObject, MapObjectTable) {

            var scene = new THREE.Scene();

            var renderer = new THREE.WebGLRenderer({antialias: false});

            var camera = new THREE.PerspectiveCamera(
                60,
                1,
                1,
                1000000000
            );

            var pickingScene = new THREE.Scene();
            var pickingRenderer = new THREE.WebGLRenderer({antialias: false});
            var pickingRenderTarget;

            var objectTable = new MapObjectTable();

            camera.position.z = MapConstants.AU * 2;
            camera.position.x = MapConstants.AU * 2;
            camera.position.y = MapConstants.AU * 2;

            camera.lookAt(
                new THREE.Vector3(
                    MapConstants.AU,
                    MapConstants.AU,
                    MapConstants.AU
                )
            );

            var controls = new THREE.OrbitControls(camera);
            controls.target = new THREE.Vector3(
                MapConstants.AU,
                MapConstants.AU,
                MapConstants.AU
            );
            controls.addEventListener('change', cameraMove);

            MapGrid.render(scene);

            var shipMapObject;
            var otherShipMapObjects = [];
            var objectToShip = {};

            function render() {
                renderer.render(scene, camera);

                if (pickingRenderTarget) {
                    pickingRenderer.render(pickingScene, camera);
                }
            }

            function cameraMove()
            {
                scaleModels();
                render();
            }

            function createPickingRenderTarget(width, height)
            {
                if (pickingRenderTarget) {
                    pickingRenderTarget.dispose();
                }

                pickingRenderTarget = new THREE.WebGLRenderTarget(width, height, {
                    depthBuffer: false,
                    stencilBuffer: false,
                    generateMipmaps: false,
                    format: THREE.RGBAFormat,
                    type: THREE.UnsignedByteType
                });

                pickingRenderer.setRenderTarget(pickingRenderTarget);
            }

            function setSize(element)
            {
                width = element.width();
                height = element.height();

                renderer.setSize(width, height);
                pickingRenderer.setSize(width, height);

                createPickingRenderTarget(width, height);

                camera.aspect = width / height;
                camera.updateProjectionMatrix();

                render();
            }

            function scaleModels()
            {
                var point1 = camera.position;
                var point2 = new THREE.Vector3(0, 0, 0);
                var distance = point1.distanceTo(point2);

                var shipSize = distance * 0.004;

                if (shipMapObject) {
                    shipMapObject.scale(shipSize);
                }

                angular.forEach(otherShipMapObjects, function(othership) {
                    othership.scale(shipSize);
                });
            }

            function attachMouseListeners(elt) {
                elt.addEventListener('mousemove', function(e) {
                    var rect = elt.getBoundingClientRect();
                    var mouseX = e.clientX - rect.left;
                    var mouseY = e.clientY - rect.top;
                    var selectedObject = getObjectAt(mouseX, mouseY);

                    if (selectedObject) {
                        console.log('mouseover ship ' + objectToShip[selectedObject.getId()].name);
                    }
                });
            }

            function getObjectAt(x, y) {
                if (!pickingRenderTarget) {
                    return undefined;
                }

                var gl = pickingRenderer.getContext();
                var pixelBuffer = new Uint8Array(4);
                gl.readPixels(x, pickingRenderTarget.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer);

                var id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

                return objectTable.get(id);
            }

            var width;
            var height;

            return {

                templateUrl: '/src/Map/view/map.html',

                scope: {
                    ship: '=ship',
                    otherships: '=otherships'
                },

                link: function($scope, element, attrs) {

                    $scope.camera = camera;

                    element.append(renderer.domElement);
                    attachMouseListeners(renderer.domElement);

                    setSize(element);

                    var w = angular.element($window);
                    w.bind('resize', function() {
                        setSize(element);
                    });

                    scaleModels();

                    $scope.$parent.$on('selected', function() {
                        setSize(element);
                    });

                    $scope.$watch('ship', function() {

                        var ship = $scope.ship;

                        if (!ship) {
                            return;
                        }

                        if (!shipMapObject) {
                            var objectId = objectTable.getId();

                            shipMapObject = new MapObject('lime', objectId, {orientation: true});
                            shipMapObject.setRenderScene(scene);
                            shipMapObject.setPickingScene(pickingScene);

                            objectTable.set(objectId, shipMapObject);
                            objectToShip[objectId] = ship;
                        }

                        shipMapObject.setPosition(ship.position.x, ship.position.y, ship.position.z);
                        shipMapObject.setHeading(ship.heading.x, ship.heading.y, ship.heading.z);
                        shipMapObject.setShipX(ship.shipX.x, ship.shipX.y, ship.shipX.z);
                        shipMapObject.setShipY(ship.shipY.x, ship.shipY.y, ship.shipY.z);

                        scaleModels();

                        render();
                    });

                    $scope.$watch('otherships', function() {

                        var ships = $scope.otherships;

                        angular.forEach(ships, function(ship) {

                            if (!otherShipMapObjects[ship.id]) {
                                var objectId = objectTable.getId();

                                otherShipMapObjects[ship.id] = new MapObject('grey', objectId);
                                otherShipMapObjects[ship.id].setRenderScene(scene);
                                otherShipMapObjects[ship.id].setPickingScene(pickingScene);

                                objectTable.set(objectId, otherShipMapObjects[ship.id]);
                                objectToShip[objectId] = ship;
                            }

                            otherShipMapObjects[ship.id].setPosition(ship.position.x, ship.position.y, ship.position.z);
                            otherShipMapObjects[ship.id].setHeading(ship.heading.x, ship.heading.y, ship.heading.z);

                        });

                        scaleModels();
                        render();
                    });

                }

            };

        }
    ]);

    /**
     * Simple mapping class for mapping objects to selection buffer ids.
     */
    MapService.factory('MapObjectTable', [
        function() {
            function MapObjectTable() {
                this._hashtable = {};
                this._id = 1;
            }

            MapObjectTable.prototype.getId = function() {
                return this._id++;
            };

            MapObjectTable.prototype.set = function(id, object) {
                this._hashtable[id] = object;
                return this;
            };

            MapObjectTable.prototype.add = function(object) {
                var id = this.getId();

                this.set(id, object);
                return id;
            };

            MapObjectTable.prototype.get = function(id) {
                return this._hashtable[id];
            };

            return MapObjectTable;
        }
    ]);

    /**
     * Base class to represent an object on the map
     */
    MapService.factory('MapObjectBase', ['THREE',
        function(THREE)
        {
            function MapObjectBase(color, options)
            {
                this.options = options || {};

                this.mesh = null;
            }

            MapObjectBase.prototype.setPosition = function(x, y, z)
            {
                this.mesh.position.set(x, y, z);
            };

            MapObjectBase.prototype.scale = function(size)
            {
                this.mesh.scale.x = size;
                this.mesh.scale.y = size;
                this.mesh.scale.z = size;
            };

            MapObjectBase.prototype.setScene = function(scene)
            {
                scene.add(this.mesh);
            };

            return MapObjectBase;
        }
    ]);

    /**
     * Picker object for the selection map.
     */
    MapService.factory('MapObjectPicker', ['THREE', 'MapObjectBase',
        function(THREE, MapObjectBase)
        {
            var parent = MapObjectBase.prototype;

            function MapObjectPicker(id, options)
            {
                parent.constructor.apply(this, arguments);

                if (!this.options.orientation) {
                    this.options.orientation = false;
                }

                this.mesh = new THREE.Mesh(
                    new THREE.CubeGeometry(5, 5, 5),
                    new THREE.MeshBasicMaterial({color: new THREE.Color(id)})
                );
            }

            MapObjectPicker.prototype = Object.create(parent);
            MapObjectPicker.prototype.constructor = MapObjectPicker;

            return MapObjectPicker;
        }
    ]);

    /**
     * The visible object in the scene.
     */
    MapService.factory('MapObjectActor', ['THREE', 'MapObjectBase',
        function(THREE, MapObjectBase)
        {
            var parent = MapObjectBase.prototype;

            function MapObjectActor(color, options)
            {
                parent.constructor.apply(this, arguments);

                if (!this.options.orientation) {
                    this.options.orientation = false;
                }

                if (!color) {
                    color = 'lime';
                }

                this.mesh = new THREE.Mesh(
                    new THREE.CubeGeometry(5, 5, 5),
                    new THREE.MeshBasicMaterial({color: color})
                );

                if (this.options.orientation) {

                    this.headingArrow = new THREE.ArrowHelper(
                        new THREE.Vector3(0, 0, 1),
                        new THREE.Vector3(0, 0, 0),
                        10,
                        'blue'
                    );

                    this.shipArrowX = new THREE.ArrowHelper(
                        new THREE.Vector3(1, 0, 0),
                        new THREE.Vector3(0, 0, 0),
                        10,
                        'red'
                    );

                    this.shipArrowY = new THREE.ArrowHelper(
                        new THREE.Vector3(0, 1, 0),
                        new THREE.Vector3(0, 0, 0),
                        10,
                        'green'
                    );

                }

                var geometry = new THREE.Geometry();
                geometry.vertices.push(new THREE.Vector3(0, 0, 0));
                geometry.vertices.push(new THREE.Vector3(0, 0, 0));
                this.objectProjectionLine = new THREE.Line(
                    geometry,
                    new THREE.LineBasicMaterial({
                        color: color
                    })
                );
                this.objectProjectionLine.geometry.dynamic = true;
            }

            MapObjectActor.prototype = Object.create(parent);
            MapObjectActor.prototype.constructor = MapObjectActor;

            MapObjectActor.prototype.setPosition = function(x, y, z)
            {
                parent.setPosition.apply(this, arguments);

                if (this.options.orientation) {
                    this.headingArrow.position.set(x, y, z);
                    this.shipArrowX.position.set(x, y, z);
                    this.shipArrowY.position.set(x, y, z);
                }

                this.objectProjectionLine.geometry.vertices[0].x = x;
                this.objectProjectionLine.geometry.vertices[0].y = 0;
                this.objectProjectionLine.geometry.vertices[0].z = z;

                this.objectProjectionLine.geometry.vertices[1].x = x;
                this.objectProjectionLine.geometry.vertices[1].y = y;
                this.objectProjectionLine.geometry.vertices[1].z = z;

                this.objectProjectionLine.geometry.verticesNeedUpdate = true;
            };

            MapObjectActor.prototype.setHeading = function(x, y, z)
            {
                if (this.options.orientation) {
                    this.headingArrow.setDirection(new THREE.Vector3(x, y, z));
                }
            };

            MapObjectActor.prototype.setShipX= function(x, y, z)
            {
                if (this.options.orientation) {
                    this.shipArrowX.setDirection(new THREE.Vector3(x, y, z));
                }
            };

            MapObjectActor.prototype.setShipY= function(x, y, z)
            {
                if (this.options.orientation) {
                    this.shipArrowY.setDirection(new THREE.Vector3(x, y, z));
                }
            };

            MapObjectActor.prototype.scale = function(size)
            {
                parent.scale.apply(this, arguments);

                if (this.options.orientation) {
                    this.headingArrow.scale.x = this.shipArrowX.scale.x = this.shipArrowY.scale.x = size;
                    this.headingArrow.scale.y = this.shipArrowX.scale.y = this.shipArrowY.scale.y = size;
                    this.headingArrow.scale.z = this.shipArrowX.scale.y = this.shipArrowY.scale.y = size;
                }
            };

            MapObjectActor.prototype.setScene = function(scene)
            {
                parent.setScene.apply(this, arguments);

                scene.add(this.objectProjectionLine);
                if (this.options.orientation) {
                    scene.add(this.headingArrow);
                    scene.add(this.shipArrowX);
                    scene.add(this.shipArrowY);
                }
            };

            return MapObjectActor;
        }
    ]);

    /**
     * Proxy for combining Picker and Actor into a single class.
     */
    MapService.factory('MapObject', ['THREE', 'MapObjectActor', 'MapObjectPicker',
        function(THREE, MapObjectActor, MapObjectPicker)
        {
            function MapObject(color, id, options)
            {
                this.options = options;
                this._id = id;
                this.actor = new MapObjectActor(color, options);
                this.picker = new MapObjectPicker(id, options);
            }

            ['setPosition', 'scale'].forEach(function(method) {
                MapObject.prototype[method] = function() {
                    this.actor[method].apply(this.actor, arguments);
                    this.picker[method].apply(this.picker, arguments);
                };
            });

            ['setHeading', 'setShipX', 'setShipY'].forEach(function(method) {
                MapObject.prototype[method] = function() {
                    this.actor[method].apply(this.actor, arguments);
                };
            });

            MapObject.prototype.setRenderScene = function(scene) {
                this.actor.setScene(scene);
            };

            MapObject.prototype.setPickingScene = function(scene) {
                this.picker.setScene(scene);
            };

            MapObject.prototype.getId = function(id) {
                return this._id;
            };

            return MapObject;
        }
    ]);

    /**
     * Renders grid lines for the map display
     */
    MapService.factory('MapGrid', ['THREE', 'MapConstants',
        function(THREE, MapConstants)
        {

            function renderGrid(scene)
            {
                var axisHelper = new THREE.AxisHelper( MapConstants.AU * 2 );
                scene.add( axisHelper );


                var material = new THREE.LineBasicMaterial({
                    color: 0xc0c0c0
                });

                // Grid X-Z
                scene.add(line(MapConstants.AU, 0, 0, MapConstants.AU, 0, MapConstants.AU * 2, material));
                scene.add(line(MapConstants.AU * 2, 0, 0, MapConstants.AU * 2, 0, MapConstants.AU * 2, material));

                scene.add(line(0, 0, MapConstants.AU, MapConstants.AU * 2, 0, MapConstants.AU, material));
                scene.add(line(0, 0, MapConstants.AU * 2, MapConstants.AU * 2, 0, MapConstants.AU * 2, material));

                // Grid Z-Y
                scene.add(line(0, MapConstants.AU, 0, 0, MapConstants.AU, MapConstants.AU * 2, material));
                scene.add(line(0, MapConstants.AU * 2, 0, 0, MapConstants.AU * 2, MapConstants.AU * 2, material));

                scene.add(line(0, 0, MapConstants.AU, 0, MapConstants.AU * 2, MapConstants.AU, material));
                scene.add(line(0, 0, MapConstants.AU * 2, 0, MapConstants.AU * 2, MapConstants.AU * 2, material));


                // Grid X-Y
                scene.add(line(MapConstants.AU, 0, 0, MapConstants.AU, MapConstants.AU * 2, 0, material));
                scene.add(line(MapConstants.AU * 2, 0, 0, MapConstants.AU * 2, MapConstants.AU * 2, 0, material));

                scene.add(line(0, MapConstants.AU, 0, MapConstants.AU * 2, MapConstants.AU, 0, material));
                scene.add(line(0, MapConstants.AU * 2, 0, MapConstants.AU * 2, MapConstants.AU * 2, 0, material));

            }

            function line(x1, y1, z1, x2, y2, z2, material)
            {
                var geometry = new THREE.Geometry();
                geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
                geometry.vertices.push(new THREE.Vector3(x2, y2, z2));
                return new THREE.Line(geometry, material);
            }

            return {
                render: renderGrid
            };

        }
    ]);

})();
