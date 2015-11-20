define([
    '../module',
    'shared',
    'lodash'
], function (module, shared, _) {
    'use strict';

    module.factory('WorldRegistry', ['Pomelo',
        function(Pomelo) {

            var worldRegistry = new shared.model.ObjectInSpaceRegistry();

            Pomelo.on('WorldUpdate', function(world) {

                var allShips = world.ships;
                allShips.push(world.ship);

                _.forEach(allShips, function(ship) {
                    var object = worldRegistry.getObject(ship.id);

                    if (!object) {
                        object = new shared.model.ObjectInSpace();
                        object.setId(ship.id);
                        worldRegistry.push(object);
                    }

                    object.setOrientation(shared.sylvester.Matrix.create(ship.orientation));
                    object.setPosition(
                        shared.sylvester.Vector.create([
                            ship.position.x, 
                            ship.position.y, 
                            ship.position.z
                        ])
                    );
                    object.setVelocity(ship.velocity);
                });
            });
            
            return worldRegistry;
        }
    ]);
});
