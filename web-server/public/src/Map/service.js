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

    MapService.directive('ssmMapLabel', ['THREE', 'MapConstants', 'MapGrid', '$window', 'MapObject',

        function(THREE, MapConstants, MapGrid, $window, MapObject) {

            function toScreenXY(position, element, camera)
            {
                var pos = position.clone();
                var projScreenMat = new THREE.Matrix4();
                projScreenMat.multiply(camera.projectionMatrix, camera.matrixWorldInverse);
                projScreenMat.multiplyVector3(pos);

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

            }

        }]

    );

    MapService.directive('ssmMap', ['THREE', 'MapConstants', 'MapGrid', '$window', 'MapObject',

        function(THREE, MapConstants, MapGrid, $window, MapObject) {

            var scene = new THREE.Scene();

            var renderer = new THREE.WebGLRenderer({antialias: false});

            var camera = new THREE.PerspectiveCamera(
                60,
                1,
                1,
                1000000000
            );

            camera.position.z = MapConstants.AU * 2;
            camera.position.x = MapConstants.AU * 2;
            camera.position.y = MapConstants.AU * 2;

            camera.lookAt(new THREE.Vector3(0, 0, 0));

            var controls = new THREE.OrbitControls(camera);
            controls.addEventListener('change', cameraMove);

            MapGrid.render(scene);

            var shipMapObject;
            var otherShipMapObjects = [];

            function cameraMove()
            {
                scaleModels();
                renderer.render(scene, camera);
            }

            function setSize(element)
            {
                width = element.width();
                height = element.height();

                renderer.setSize(
                    width,
                    height
                );

                camera.aspect = width / height;
                camera.updateProjectionMatrix();

                renderer.render(scene, camera);
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

                    setSize(element);

                    var w = angular.element($window);
                    w.bind('resize', function() {
                        setSize(element);
                    });

                    scaleModels();

                    $scope.$watch('ship', function() {

                        var ship = $scope.ship;

                        if (!ship) {
                            return;
                        }

                        if (!shipMapObject) {
                            shipMapObject = new MapObject();
                            shipMapObject.setScene(scene);
                        }

                        shipMapObject.setPosition(ship.position.x, ship.position.y, ship.position.z);
                        shipMapObject.setHeading(ship.heading.x, ship.heading.y, ship.heading.z);
                        shipMapObject.setShipX(ship.shipX.x, ship.shipX.y, ship.shipX.z);
                        shipMapObject.setShipY(ship.shipY.x, ship.shipY.y, ship.shipY.z);

                        scaleModels();

                        renderer.render(scene, camera);
                    });

                    $scope.$watch('otherships', function() {

                        var ships = $scope.otherships;

                        angular.forEach(ships, function(ship) {

                            if (!otherShipMapObjects[ship.id]) {

                                otherShipMapObjects[ship.id] = new MapObject('grey');
                                otherShipMapObjects[ship.id].setScene(scene);
                            }

                            otherShipMapObjects[ship.id].setPosition(ship.position.x, ship.position.y, ship.position.z);
                            otherShipMapObjects[ship.id].setHeading(ship.heading.x, ship.heading.y, ship.heading.z);

                        });

                        scaleModels();
                        renderer.render(scene, camera);
                    });

                }

            };

        }
    ]);

    /**
     * A class to represent an object on the map
     */
    MapService.factory('MapObject', ['THREE',
        function(THREE)
        {
            function MapObject(color)
            {
                if (!color) {
                    color = 'lime';
                }

                this.mesh = new THREE.Mesh(
                    new THREE.CubeGeometry(5, 5, 5),
                    new THREE.MeshBasicMaterial({color: color})
                );

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

            MapObject.prototype.setPosition = function(x, y, z)
            {
                this.mesh.position.set(x, y, z);
                this.headingArrow.position.set(x, y, z);
                this.shipArrowX.position.set(x, y, z);
                this.shipArrowY.position.set(x, y, z);

                this.objectProjectionLine.geometry.vertices[0].x = x;
                this.objectProjectionLine.geometry.vertices[0].y = 0;
                this.objectProjectionLine.geometry.vertices[0].z = z;

                this.objectProjectionLine.geometry.vertices[1].x = x;
                this.objectProjectionLine.geometry.vertices[1].y = y;
                this.objectProjectionLine.geometry.vertices[1].z = z;

                this.objectProjectionLine.geometry.verticesNeedUpdate = true;
            };

            MapObject.prototype.setHeading = function(x, y, z)
            {
                this.headingArrow.setDirection(new THREE.Vector3(x, y, z));
            };

            MapObject.prototype.setShipX= function(x, y, z)
            {
                this.shipArrowX.setDirection(new THREE.Vector3(x, y, z));
            };

            MapObject.prototype.setShipY= function(x, y, z)
            {
                this.shipArrowY.setDirection(new THREE.Vector3(x, y, z));
            };

            MapObject.prototype.scale = function(size)
            {
                this.mesh.scale.x = this.headingArrow.scale.x = this.shipArrowX.scale.x = this.shipArrowY.scale.x = size;
                this.mesh.scale.y = this.headingArrow.scale.y = this.shipArrowX.scale.y = this.shipArrowY.scale.y = size;
                this.mesh.scale.z = this.headingArrow.scale.z = this.shipArrowX.scale.y = this.shipArrowY.scale.y = size;
            };

            MapObject.prototype.setScene = function(scene)
            {
                scene.add(this.mesh);
                scene.add(this.headingArrow);
                scene.add(this.shipArrowX);
                scene.add(this.shipArrowY);
                scene.add(this.objectProjectionLine);
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
