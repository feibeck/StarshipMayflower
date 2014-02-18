var Ship = require('../../src/models/Ship');
var sylvester = require('sylvester');

describe("Ship model", function() {

    it("Constructor", function() {
        var ship = new Ship('HMS Foo');
        expect(ship.getName()).toBe('HMS Foo');
    });

    it("Starts at position 0", function() {
        var ship = new Ship('HMS Foo');
        var pos = sylvester.Vector.create([0, 0, 0]);
        expect(ship.getPosition()).toEqual(pos);
    });

    it("Starts without speed", function() {
        var ship = new Ship('HMS Foo');
        var speed = sylvester.Vector.create([0, 0, 0]);
        expect(ship.getVelocity()).toEqual(speed);
    });

    it("Faces away", function() {
        var ship = new Ship('HMS Foo');
        var heading = sylvester.Vector.create([0, 0, -1]);
        expect(ship.getHeading()).toEqual(heading);
    });

    it("ID property", function() {
        var ship = new Ship('HMS Foo');
        ship.setId(23);
        expect(ship.getId()).toBe(23);
    });

    it("Velocity property", function() {
        var ship = new Ship('HMS Foo');
        ship.setVelocity('foo');
        expect(ship.getVelocity()).toBe('foo');
    });

    it("Heading property", function() {
        var ship = new Ship('HMS Foo');
        ship.setHeading('foo');
        expect(ship.getHeading()).toBe('foo');
    });

    it("Position property", function() {
        var ship = new Ship('HMS Foo');
        ship.setPosition('foo');
        expect(ship.getPosition()).toBe('foo');
    });

    it("LastMove property", function() {
        var ship = new Ship('HMS Foo');
        ship.setLastMove(18);
        expect(ship.getLastMove()).toBe(18);
    });

    it("Creator property", function() {
        var ship = new Ship('HMS Foo');
        ship.setCreator('foo');
        expect(ship.getCreator()).toBe('foo');
    });

});