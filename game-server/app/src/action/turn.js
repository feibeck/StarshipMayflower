var Action = require('./action'),
    util = require('util'),
    game = require('../game'),
    sylvester = require('sylvester'),
    _ = require('lodash');

/**
 * Action to turn a ship around an axis
 *
 * @param {Object} opts
 *
 * @constructor
 */
var Turn = function(opts) {

    opts.type = 'turn';
    opts.id = opts.ship.getId();
    opts.singleton = true;

    Action.call(this, opts);
    this.time = Date.now();
    this.ship = opts.ship;
    this.arc = opts.arc;
    this.axis = opts.axis;

};

util.inherits(Turn, Action);

_.extend(Turn.prototype, {

    /**
     * Turns a ship around an axis. Updates ship velocity and heading
     * vectors to the new direction.
     */
    update: function()
    {

        if (this.arc === 0) {
            this.finished = true;
            return;
        }

        var seconds = (Date.now() - this.time) / 1000;

        var velocity = this.ship.getVelocity();
        var direction = this.ship.getHeading();
        var position = this.ship.getPosition();

        var turnDegrees = this.arc * seconds;

        var axis;

        if (this.axis == 'Y') {
            axis = sylvester.Line.create(position, sylvester.Vector.create([0, 1, 0]));
        } else {
            axis = sylvester.Line.create(position, sylvester.Vector.create([1, 0, 0]));
        }

        var newDirection = direction.rotate(this.toRadians(turnDegrees), axis);

        newDirection = newDirection.toUnitVector();
        this.ship.setHeading(newDirection);

        var speed = velocity.modulus();

        var newVelocity = newDirection.multiply(speed);
        this.ship.setVelocity(newVelocity);

        this.time = Date.now();

    },

    /**
     * Converts an arc from degrees to radians
     *
     * @param {Float} deg
     *
     * @return {Float}
     */
    toRadians: function(deg)
    {
        return deg * (Math.PI/180);
    }

});

module.exports = Turn;