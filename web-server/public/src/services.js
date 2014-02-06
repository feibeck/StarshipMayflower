(function() {
    'use strict';

    var StarshipMayflowerServices = angular.module('StarshipMayflowerServices', []);

    var myApp = angular.module('myApp',[]);
    myApp.factory('UserService', function() {
        return {
            name : 'anonymous'
        };
    });

    StarshipMayflowerServices.factory('Player', [
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

    StarshipMayflowerServices.factory('Pomelo', ['$rootScope', '$q',
        function($rootScope, $q){

            var initPomelo = function(host, port) {

                var pomelo = window.pomelo;
                var deferred = $q.defer();

                pomelo.init({
                    host: host,
                    port: port,
                    log: true
                }, function() {
                    deferred.resolve();
                });

                return deferred.promise;
            };

            var pomeloInitialized = initPomelo("127.0.0.1", "3010");

            return {
                request: function(route, routeArguments) {
                    var deferred = $q.defer();
                    pomeloInitialized.then(function() {
                        pomelo.request(route, routeArguments, function(data) {
                            if (data.code == 'OK') {
                                deferred.resolve(data.payload);
                            } else {
                                deferred.reject(data.payload);
                            }
                        });
                    });
                    return deferred.promise;
                },
                on: function(route, callback) {
                    pomeloInitialized.then(function() {
                        pomelo.on(route, callback);
                    });
                }
            };

        }]);

})();