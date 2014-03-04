var Action = require('./action'),
    util = require('util'),
    game = require('../game'),
    sylvester = require('sylvester'),
    physics = require('../physics'),
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

    this._burnRate = 2;

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
        var turnDegrees = this.arc * seconds;

        this.burnFuel(seconds);

        if (this.ship.getEnergy() > 0) {
            physics.turn(this.ship, turnDegrees, this.axis);
        }

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