var Ship = require('../model/Ship');
var sylvester = require('sylvester');
var assert = require('assert');

suite("Ship model", function() {

    test("Constructor", function() {
        var ship = new Ship('HMS Foo');
        assert(ship.getName() == 'HMS Foo');
    });

    test("Starts at position 0", function() {
        var ship = new Ship('HMS Foo');
        var pos = sylvester.Vector.create([0, 0, 0]);
        assert(ship.getPosition().x == pos.x);
        assert(ship.getPosition().y == pos.y);
        assert(ship.getPosition().z == pos.z);
    });

    test("Starts without speed", function() {
        var ship = new Ship('HMS Foo');
        assert(ship.getVelocity() == 0);
    });

    test("Has a default heading", function() {
        var ship = new Ship('HMS Foo');
        var heading = sylvester.Vector.create([0, 0, 1]);
        assert(ship.getHeading().x == heading.x);
        assert(ship.getHeading().y == heading.y);
        assert(ship.getHeading().z == heading.z);
    });

    test("ID property", function() {
        var ship = new Ship('HMS Foo');
        ship.setId(23);
        assert(ship.getId() == 23);
    });

    test("Velocity property", function() {
        var ship = new Ship('HMS Foo');
        ship.setVelocity('foo');
        assert(ship.getVelocity() == 'foo');
    });

    test("Position property", function() {
        var ship = new Ship('HMS Foo');
        ship.setPosition('foo');
        assert(ship.getPosition() == 'foo');
    });

    test("LastMove property", function() {
        var ship = new Ship('HMS Foo');
        ship.setLastMove(18);
        assert(ship.getLastMove() == 18);
    });

    test("Creator property", function() {
        var ship = new Ship('HMS Foo');
        ship.setCreator('foo');
        assert(ship.getCreator() == 'foo');
    });

});
