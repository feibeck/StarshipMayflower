var Player = require('../../src/models/Player');

describe("Player model", function() {

    it("Constructor", function() {

        var player = new Player(5, 'Foo', 'server1');

        expect(player.getId()).toBe(5);
        expect(player.getName()).toBe('Foo');
        expect(player.getServerId()).toBe('server1');

    });

    it("A player has a ship", function() {
        var player = new Player(5, 'Foo', 'server1');
        var ship = {foo: 'bar'};
        player.setShip(ship);

        expect(player.getShip()).toBe(ship);
    });

    it('Can be serialized', function() {
        var player = new Player(5, 'Foo', 'server1');

        expect(player.serialize()).toEqual({id: 5, name: 'Foo'});
    });

});