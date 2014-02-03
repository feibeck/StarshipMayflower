'use strict';

var StarshipMayflowerServices = angular.module('StarshipMayflowerServices', []);

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
                        deferred.resolve(data);
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