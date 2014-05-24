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
    _accelerateSpeed: 7500,

    /**
     * Accelerate a ship. Updates the length of the Velocity vector until
     * the desired speed is reached.
     */
    update: function()
    {
        var seconds = (Date.now() - this.time) / 1000;

        if (!this.ship.getWarp()) {
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
        var maxVelocity;
        if (this.ship.getSlowImpulse()) {
            maxVelocity = world.SLOW_IMPULSE;
        } else {
            maxVelocity = world.IMPULSE;
        }

        var targetVelocity = (this.targetSpeed / 100) * maxVelocity;
        var currentVelocity = this.ship.getVelocity();

        if (targetVelocity > currentVelocity) {

            currentVelocity += this._accelerateSpeed * seconds;
            if (currentVelocity > targetVelocity) {
                currentVelocity = targetVelocity
                this.finished = true;
            }

        } else if (targetVelocity < currentVelocity) {

            currentVelocity -= this._accelerateSpeed * seconds;
            if (currentVelocity < targetVelocity) {
                currentVelocity = targetVelocity
                this.finished = true;
            }

        } else {
            this.finished = true;
        }

        var currentImpulse = (currentVelocity / maxVelocity) * 100;

        this.ship.setVelocity(currentVelocity);
        this.ship.setCurrentImpulse(currentImpulse);
    }

});

module.exports = Accelerate;