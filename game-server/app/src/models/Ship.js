var _ = require('lodash');

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
};

_.extend(Ship.prototype, {

    _id: null,
    _name: null,

    _creator: null,

    _stations: null,

    _players: null,

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
            }
        }
    }
});

module.exports = Ship;