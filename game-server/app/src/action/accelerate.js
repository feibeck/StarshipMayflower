var Action = require('./action'),
    util = require('util'),
    game = require('../game'),
    sylvester = require('sylvester'),
    _ = require('lodash'),
    world = require('../world');

/**
 * Accelerates a ship
 */
var Accelerate = function(opts) {

    opts.type = 'accelerate';
    opts.id = opts.ship.getId();
    opts.singleton = true;

    Action.call(this, opts);
    this.time = Date.now();
    this.ship = opts.ship;
    this.targetSpeed = opts.targetSpeed;

    this._burnRate = 3;

};

util.inherits(Accelerate, Action);

_.extend(Accelerate.prototype, {

    /**
     * Accelerate speed
     */
    _accelerateSpeed: 10,

    /**
     * Accelerate a ship. Updates the length of the Velocity vector until
     * the desired speed is reached.
     */
    update: function()
    {
        var seconds = (Date.now() - this.time) / 1000;

        if (this.ship.getWarpLevel() == 0) {
            this.burnFuel(seconds);

            if (this.ship.getEnergy() > 0) {
                this.accelerate(seconds);
            }
        }

        this.time = Date.now();
    },

    /**
     * Accelerate the ship
     *
     * @param {Number} seconds
     */
    accelerate: function(seconds)
    {
        var impulse = this.ship.getCurrentImpulse();

        if (this.targetSpeed > impulse) {

            impulse = (this._accelerateSpeed * seconds) + impulse;
            if (impulse > this.targetSpeed) {
                impulse = this.targetSpeed;
                this.finished = true;
            }

        } else if (this.targetSpeed < impulse) {

            impulse = impulse - (this._accelerateSpeed * seconds);
            if (impulse < this.targetSpeed) {
                impulse = this.targetSpeed;
                this.finished = true;
            }

        }

        var newVelocity = (impulse / 100) * world.IMPULSE;
        this.ship.setVelocity(newVelocity);
        this.ship.setCurrentImpulse(impulse);
    }

});

module.exports = Accelerate;