define(['../module'], function (module) {
    'use strict';

    module.factory('Player', [
        function()
        {
            var player = {
                id: null,
                name: null
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
                }
            };
        }
    ]);

});