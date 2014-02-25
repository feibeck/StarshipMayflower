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

    /**
     * Service holding instances of the Three.js scene, renderer and camera
     * for the map display
     */
    MapService.factory('MapScene', ['THREE', 'MapConstants', '$window',
	function(THREE, MapConstants, $window)
	{

	    var scene = new THREE.Scene();

	    var renderer = new THREE.WebGLRenderer({antialias: false});
	    renderer.setSize($window.innerWidth, $window.innerHeight);

	    var camera = new THREE.PerspectiveCamera(
		60,
		$window.innerWidth / $window.innerHeight,
		1,
		1000000000
	    );
	    camera.position.z = MapConstants.AU * 2;
	    camera.position.x = MapConstants.AU * 2;
	    camera.position.y = MapConstants.AU * 2;

	    camera.lookAt(new THREE.Vector3(0, 0, 0));

	    return {

		scene: scene,
		renderer: renderer,
		camera: camera,

		render: function()
		{
		    renderer.render(scene, camera);
		}

	    }

	}
    ]);

    /**
     * A class to represent an object on the map
     */
    MapService.factory('MapObject', ['THREE', 'MapScene',
	function(THREE, MapScene)
	{
	    function MapObject()
	    {
		var geometry = new THREE.CubeGeometry(5, 5, 5);
		var material = new THREE.MeshBasicMaterial({color: "lime"});
		this.mesh = new THREE.Mesh(geometry, material);

		var dir = new THREE.Vector3(0, 0, 1);
		var origin = new THREE.Vector3(0, 0, 0);
		var length = 10;
		var hex = "yellow";

		this.headingArrow = new THREE.ArrowHelper(dir, origin, length, hex);

		var material = new THREE.LineBasicMaterial({
		    color: "lime"
		});
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(0, 0, 0));
		geometry.vertices.push(new THREE.Vector3(0, 0, 0));
		this.objectProjectionLine = new THREE.Line(geometry, material);
		this.objectProjectionLine.geometry.dynamic = true;

		MapScene.scene.add(this.mesh);
		MapScene.scene.add(this.headingArrow);
		MapScene.scene.add(this.objectProjectionLine);
	    };

	    MapObject.prototype.setPosition = function(x, y, z)
	    {
		this.mesh.position.set(x, y, z);
		this.headingArrow.position.set(x, y, z);

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

	    MapObject.prototype.scale = function(size)
	    {
		this.mesh.scale.x = size;
		this.mesh.scale.y = size;
		this.mesh.scale.z = size;
	    }

	    return MapObject;
	}
    ]);

    /**
     * Renders grid lines for the map display
     */
    MapService.factory('MapGrid', ['THREE', 'MapConstants', 'MapScene',
	function(THREE, MapConstants, MapScene)
	{

	    function renderGrid()
	    {

		var axisHelper = new THREE.AxisHelper( MapConstants.AU * 2 );
		MapScene.scene.add( axisHelper );


		var material = new THREE.LineBasicMaterial({
		    color: 0xc0c0c0
		});

		// Grid X-Z
		MapScene.scene.add(line(MapConstants.AU, 0, 0, MapConstants.AU, 0, MapConstants.AU * 2, material));
		MapScene.scene.add(line(MapConstants.AU * 2, 0, 0, MapConstants.AU * 2, 0, MapConstants.AU * 2, material));

		MapScene.scene.add(line(0, 0, MapConstants.AU, MapConstants.AU * 2, 0, MapConstants.AU, material));
		MapScene.scene.add(line(0, 0, MapConstants.AU * 2, MapConstants.AU * 2, 0, MapConstants.AU * 2, material));

		// Grid Z-Y
		MapScene.scene.add(line(0, MapConstants.AU, 0, 0, MapConstants.AU, MapConstants.AU * 2, material));
		MapScene.scene.add(line(0, MapConstants.AU * 2, 0, 0, MapConstants.AU * 2, MapConstants.AU * 2, material));

		MapScene.scene.add(line(0, 0, MapConstants.AU, 0, MapConstants.AU * 2, MapConstants.AU, material));
		MapScene.scene.add(line(0, 0, MapConstants.AU * 2, 0, MapConstants.AU * 2, MapConstants.AU * 2, material));


		// Grid X-Y
		MapScene.scene.add(line(MapConstants.AU, 0, 0, MapConstants.AU, MapConstants.AU * 2, 0, material));
		MapScene.scene.add(line(MapConstants.AU * 2, 0, 0, MapConstants.AU * 2, MapConstants.AU * 2, 0, material));

		MapScene.scene.add(line(0, MapConstants.AU, 0, MapConstants.AU * 2, MapConstants.AU, 0, material));
		MapScene.scene.add(line(0, MapConstants.AU * 2, 0, MapConstants.AU * 2, MapConstants.AU * 2, 0, material));

	    };

	    function line(x1, y1, z1, x2, y2, z2, material)
	    {
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
		geometry.vertices.push(new THREE.Vector3(x2, y2, z2));
		var line = new THREE.Line( geometry, material );
		return line;
	    };

	    return {
		render: renderGrid
	    };

	}
    ]);

    /**
     * Service to handle the map
     */
    MapService.factory('Map', ['THREE', 'MapConstants', 'MapScene', 'MapObject', 'MapGrid', '$window',
	function(THREE, MapConstants, MapScene, MapObject, MapGrid, $window)
	{

	    var shipMapObject;

	    function cameraMove()
	    {
		scaleModels();
		MapScene.render();
	    };

	    function scaleModels()
	    {
		var point1 = MapScene.camera.position;
		var point2 = new THREE.Vector3(0, 0, 0);
		var distance = point1.distanceTo(point2);

		var shipSize = distance * 0.002;

		shipMapObject.scale(shipSize);
	    };

	    function onWindowResize()
	    {
		MapScene.camera.aspect = $window.innerWidth / $window.innerHeight;
		MapScene.camera.updateProjectionMatrix();
		MapScene.renderer.setSize($window.innerWidth, $window.innerHeight);
		MapScene.render();
	    };

	    return {

		init: function(selector)
		{
		    var controls = new THREE.OrbitControls(MapScene.camera);
		    controls.addEventListener('change', cameraMove);

		    MapGrid.render();

		    shipMapObject = new MapObject();

		    scaleModels();

		    var container = document.getElementById(selector);
		    container.appendChild(MapScene.renderer.domElement);

		    angular.element($window).bind('resize', onWindowResize);
		},

		update: function(ship)
		{
		    shipMapObject.setPosition(ship.position.x, ship.position.y, ship.position.z);
		    shipMapObject.setHeading(ship.heading.x, ship.heading.y, ship.heading.z);
		    MapScene.render();
		}

	    };

	}
    ]);

})();