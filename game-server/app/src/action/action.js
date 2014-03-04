var _ = require('lodash');

var id = 1;

/**
 * Action class, used to excute the action in server
 */
var Action = function(opts) {
    this.data = opts.data;
    this.id = opts.id || id++;
    this.type = opts.type || 'defaultAction';

    this.finished = false;
    this.aborted = false;
    this.singleton = false || opts.singleton;
};

_.extend(Action.prototype, {

    _burnRate: 0,

    /**
     * Update interface, default update will do nothing, every tick the update will be invoked
     */
    update: function()
    {
    },

    /**
     * Updates the ships energy
     *
     * @param {Number} seconds
     */
    burnFuel: function(seconds)
    {
        var energy = this.ship.getEnergy();

        energy = energy - (seconds * this._burnRate);
        if (energy < 0) {
            energy = 0;
        }

        this.ship.setEnergy(energy);
    }

});

module.exports = Action;
