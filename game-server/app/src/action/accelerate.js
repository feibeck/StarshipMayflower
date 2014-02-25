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

	var impulse = this.ship.getCurrentImpulse();
        var accelSpeed = 10;

	if (this.targetSpeed > impulse) {

	    impulse = (accelSpeed * seconds) + impulse;
	    if (impulse > this.targetSpeed) {
		impulse = this.targetSpeed;
                this.finished = true;
            }

	} else if (this.targetSpeed < impulse) {

	    impulse = impulse - (accelSpeed * seconds);
	    if (impulse < this.targetSpeed) {
		impulse = this.targetSpeed;
                this.finished = true;
            }

        }

	var speed = (impulse / 100) * world.IMPULSE;

        var newVelocity = direction.multiply(speed);
        this.ship.setVelocity(newVelocity);
	this.ship.setCurrentImpulse(impulse);

        this.time = Date.now();
    }

});

module.exports = Accelerate;