define(['../module'], function (MapService) {
    'use strict';

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

});