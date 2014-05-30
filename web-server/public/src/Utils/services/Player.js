define(['../module'], function (module) {
    'use strict';

    module.factory('Player', [
        function()
        {
            var player = {
                id: null,
                name: null,
                stations: null
            };

            return {

                getId: function()
                {
                    return player.id;
                },

                setId: function(id)
                {
                    player.id = id;
                },

                getName: function()
                {
                    return player.name;
                },

                setName: function(name)
                {
                    player.name = name;
                },

                setStations: function(stations)
                {
                    player.stations = stations;
                },

                getStations: function()
                {
                    return player.stations;
                }

            };
        }
    ]);

});