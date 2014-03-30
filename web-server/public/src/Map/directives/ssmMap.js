define(['../module', 'angular'], function (MapService, angular) {
    'use strict';

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

});