module.exports = {

    ShipRegistry: require('./world/ShipRegistry'),

    // Speed of light in km/s
    C: 299792.458,

    // Normal impulse speed (0.25c) at 100%, in km/s
    IMPULSE: 74948.1145,

    // Astronomical unit in km
    AU: 149597870.7,

    // playing field length in au
    PlayingFieldLength: 2 * 149597870.7,

    TURN_YAW: 'yaw',

    TURN_PITCH: 'pitch',

    TURN_ROLL: 'roll'

};
