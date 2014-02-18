var Action = require('./action'),
    util = require('util'),
    game = require('../game'),
    sylvester = require('sylvester'),
    _ = require('lodash');

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

};

util.inherits(Accelerate, Action);

_.extend(Accelerate.prototype, {

    /**
     * Accelerate a ship. Updates the length of the Velocity vector until
     * the desired speed is reached.
     */
    update: function()
    {
        var seconds = (Date.now() - this.time) / 1000;

        var velocity = this.ship.getVelocity();
        var direction = this.ship.getHeading();

        var speed = velocity.modulus();
        var accelSpeed = 2;

        if (this.targetSpeed > speed) {

            speed = (accelSpeed * seconds) + speed;
            if (speed > this.targetSpeed) {
                speed = this.targetSpeed;
                this.finished = true;
            }

        } else if (this.targetSpeed < speed) {

            speed = speed - (accelSpeed * seconds);
            if (speed < this.targetSpeed) {
                speed = this.targetSpeed;
                this.finished = true;
            }

        }

        var newVelocity = direction.multiply(speed);
        this.ship.setVelocity(newVelocity);

        this.time = Date.now();
    }

});

module.exports = Accelerate;