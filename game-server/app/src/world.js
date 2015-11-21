var _ = require('lodash');
var sylvester = require('sylvester');

module.exports = {

    ShipRegistry: require('./world/ShipRegistry'),
    ObjectRegistry: require('../../../shared/model/ObjectInSpaceRegistry'),

    // Speed of light in km/s
    C: 299792.458,

    // Normal impulse speed (0.25c) at 100%, in km/s
    IMPULSE: 74948.1145,
    SLOW_IMPULSE: 100,

    // Astronomical unit in km
    AU: 149597870.7,

    // playing field length in au
    PlayingFieldLength: 2 * 149597870.7,

    TURN_YAW: 'yaw',

    TURN_PITCH: 'pitch',

    TURN_ROLL: 'roll',

    getRandomPosition: function()
    {
        return sylvester.Vector.create([
            _.random(this.PlayingFieldLength),
            _.random(this.PlayingFieldLength),
            _.random(this.PlayingFieldLength)]
        );
    }

};
