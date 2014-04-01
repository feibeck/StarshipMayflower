define(['three', 'Constants'], function (THREE, Constants) {
    'use strict';

    var Grid = function() {

        THREE.Object3D.call(this);

        var axisHelper = new THREE.AxisHelper(Constants.AU * 2);
        this.add(axisHelper);

        var material = new THREE.LineBasicMaterial({
            color: 0xc0c0c0
        });

        // Grid X-Z
        this.add(line(Constants.AU, 0, 0, Constants.AU, 0, Constants.AU * 2));
        this.add(line(Constants.AU * 2, 0, 0, Constants.AU * 2, 0, Constants.AU * 2));

        this.add(line(0, 0, Constants.AU, Constants.AU * 2, 0, Constants.AU));
        this.add(line(0, 0, Constants.AU * 2, Constants.AU * 2, 0, Constants.AU * 2));

        // Grid Z-Y
        this.add(line(0, Constants.AU, 0, 0, Constants.AU, Constants.AU * 2));
        this.add(line(0, Constants.AU * 2, 0, 0, Constants.AU * 2, Constants.AU * 2));

        this.add(line(0, 0, Constants.AU, 0, Constants.AU * 2, Constants.AU));
        this.add(line(0, 0, Constants.AU * 2, 0, Constants.AU * 2, Constants.AU * 2));

        // Grid X-Y
        this.add(line(Constants.AU, 0, 0, Constants.AU, Constants.AU * 2, 0));
        this.add(line(Constants.AU * 2, 0, 0, Constants.AU * 2, Constants.AU * 2, 0));

        this.add(line(0, Constants.AU, 0, Constants.AU * 2, Constants.AU, 0));
        this.add(line(0, Constants.AU * 2, 0, Constants.AU * 2, Constants.AU * 2, 0));

        function line(x1, y1, z1, x2, y2, z2)
        {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
            geometry.vertices.push(new THREE.Vector3(x2, y2, z2));
            return new THREE.Line(geometry, material);
        }

    };

    Grid.prototype = Object.create(THREE.Object3D.prototype);

    return Grid;

});