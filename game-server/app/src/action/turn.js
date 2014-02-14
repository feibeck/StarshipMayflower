var Action = require('./action');
var util = require('util');
var game = require('../game');
var sylvester = require('sylvester');

var Turn = function(opts) {
	opts.type = 'turn';
	opts.id = opts.ship.getId();
	opts.singleton = true;

	Action.call(this, opts);
	this.time = Date.now();
	this.ship = opts.ship;
    this.arc = opts.arc;
};

util.inherits(Turn, Action);

Turn.prototype.update = function() {

    if (this.arc === 0) {
        console.log("Finished turning");
        this.finished = true;
        return;
    }

    console.log("Turning ", this.arc);

    var seconds = (Date.now() - this.time) / 1000;

    var velocity = this.ship.getVelocity();
    var direction = this.ship.getHeading();
    var position = this.ship.getPosition();

    var turnDegrees = this.arc * seconds;

    var axis = sylvester.Line.create(position, sylvester.Vector.create([0, 1, 0]));
    var newDirection = direction.rotate(this.radians(turnDegrees), axis);

    newDirection = newDirection.toUnitVector();
    this.ship.setHeading(newDirection);

    var speed = velocity.modulus();

    var newVelocity = newDirection.multiply(speed);
    this.ship.setVelocity(newVelocity);

    this.time = Date.now();

};

Turn.prototype.degrees = function(rad)
{
    return rad*(180/Math.PI);
};

Turn.prototype.radians = function(deg)
{
    return deg * (Math.PI/180);
};

module.exports = Turn;
