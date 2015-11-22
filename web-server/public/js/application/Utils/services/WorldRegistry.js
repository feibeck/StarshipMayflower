define([
    '../module',
    'shared',
    'lodash'
], function (module, shared, _) {
    'use strict';

    module.factory('WorldRegistry', ['Pomelo',
        function(Pomelo) {

            var worldRegistry = new shared.model.ObjectInSpaceRegistry();
            var ownShip = null;

            Pomelo.on('WorldUpdate', function(world) {

                if (!ownShip) {
                    ownShip = new shared.model.ObjectInSpace();
                    ownShip.setId(world.ship.id);
                }

                ownShip.fromJson(world.ship);

                var allShips = world.ships;
                allShips.push(world.ship);

                _.forEach(allShips, function(ship) {
                    var object = worldRegistry.getObject(ship.id);

                    if (!object) {
                        object = new shared.model.ObjectInSpace();
                        object.setId(ship.id);
                        worldRegistry.push(object);
                    }

                    object.fromJson(ship);
                });
            });

            return {
                registry: worldRegistry,
                ship: ownShip
            };
        }
    ]);
});
