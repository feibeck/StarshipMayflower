
angular.module('StarshipMayflower')
    .controller('ShipListCtrl', function ($scope) {
        "use strict";

        $scope.list = [
            {
                "name": "Mayflower 1",
                "helm": "Torben",
                "science": "Michael",
                "weapons": "Flo",
                "engineering": null,
                "comm": "Björn",
                "captain": "Alex",
                "mainScreen": null
            }
        ];

        $scope.create = function () {

            $scope.list.push({
                "name": $scope.shipName,
                "helm": null,
                "science": null,
                "weapons": null,
                "engineering": null,
                "comm": null,
                "captain": null,
                "mainScreen": null
            });

            $('#createShipModal').modal('hide');

            $scope.shipName = "";
        }


    }).$inject = ['$scope'];
