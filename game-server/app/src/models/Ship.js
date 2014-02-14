var _ = require('lodash');
var sylvester = require('sylvester');

var Ship = function(name) {
    var me = this;

    me._name = name;
    me._creator = null;
    me._players = [];

    me._stations = {
        helm: null,
        weapons: null,
        comm: null,
        science: null,
        engineering: null,
        mainscreen: null
    };

    me._position = sylvester.Vector.create([0, 0, 0]);
    me._velocity = sylvester.Vector.create([0, 0, 0]);
    me._heading = sylvester.Vector.create([0, 0, -1]);

    me._lastMove = 0;
};

_.extend(Ship.prototype, {

    _id: null,

    _name: null,

    _creator: null,

    _stations: null,

    _players: null,

    _position: null,

    _velocity: null,

    _heading: null,

    _lastMove: null,

    getName: function()
    {
        return this._name;
    },

    setId: function(id)
    {
        this._id = id;
        return this;
    },

    getId: function() {
        return this._id;
    },

    addPlayer: function(player)
    {
        this._players[player.getId()] = player;
    },

    removePlayer: function(player)
    {
        delete this._players[player.getId()];

        this.releaseStation('helm', player);
        this.releaseStation('weapons', player);
        this.releaseStation('engineering', player);
        this.releaseStation('science', player);
        this.releaseStation('mainscreen', player);
        this.releaseStation('comm', player);
    },

    setVelocity: function(velocity) {
        this._velocity = velocity;
    },

    getVelocity: function() {
        return this._velocity;
    },

    getHeading: function() {
        return this._heading;
    },

    setHeading: function(heading) {
        this._heading = heading;
    },

    setPosition: function(position) {
        this._position = position;
    },

    getPosition: function() {
        return this._position;
    },

    setLastMove: function(lastMove) {
        this._lastMove = lastMove;
    },

    getLastMove: function() {
        return this._lastMove;
    },

    setCreator: function(player)
    {
        this._creator = player;
        return this;
    },

    getCreator: function()
    {
        return this._creator;
    },

    takeStation: function(station, player)
    {
        if (this._stations[station]) {
            return false;
        }
        this._stations[station] = player;
        return true;
    },

    releaseStation: function(station, player)
    {
        if (this._stations[station] != player) {
            return false;
        }
        this._stations[station] = null;
        return true;
    },

    serialize: function() {
        var me = this;

        var creator;
        if (me._creator) {
            creator = me._creator.serialize();
        }

        return {
            name: me.getName(),
            id: me.getId(),
            creator: creator,
            stations: {
                helm: (me._stations.helm ? me._stations.helm.getName() : ''),
                weapons: (me._stations.weapons ? me._stations.weapons.getName() : ''),
                science: (me._stations.science ? me._stations.science.getName() : ''),
                engineering: (me._stations.engineering ? me._stations.engineering.getName() : ''),
                comm: (me._stations.comm ? me._stations.comm.getName() : null),
                mainscreen: (me._stations.mainscreen ? me._stations.mainscreen.getName() : '')
            },
            position: {
                x: me._position.e(1),
                y: me._position.e(2),
                z: me._position.e(3)
            },
            speed: me.getVelocity().modulus(),
            heading: {
                x: me._heading.e(1),
                y: me._heading.e(2),
                z: me._heading.e(3)
            }
        };
    }
});

module.exports = Ship;