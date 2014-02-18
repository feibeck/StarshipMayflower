var _ = require('lodash'),
    Queue = require('pomelo-collection').queue;

/**
 * ActionManager manages actions
 *
 * @param {Object} opts
 *
 * @constructor
 */
var ActionManager = function(opts)
{
    opts = opts || {};
    this.limit = opts.limit || 10000;
    this.actionMap = {};
    this.actionQueue = new Queue(this.limit);
};

_.extend(ActionManager.prototype, {

    /**
     * Add action
     *
     * @param {Object} action
     *
     * @return {boolean}
     */
    addAction: function(action)
    {
        if (action.singleton) {
            this.abortAction(action.type, action.id);
        }
        this.actionMap[action.type] = this.actionMap[action.type]||{};
        this.actionMap[action.type][action.id] = action;
        return this.actionQueue.push(action);
    },

    /**
     * Abort an action, the action will be canceled and not excuted
     *
     * @param {String} type Given type of the action
     * @param {String} id   The action id
     */
    abortAction: function(type, id)
    {
        if (!this.actionMap[type] || !this.actionMap[type][id]) {
            return;
        }
        this.actionMap[type][id].aborted = true;
        delete this.actionMap[type][id];
    },

    /**
     * Abort all action by given id, it will find all action type
     *
     * @param {Integer}
     */
    abortAllAction: function(id)
    {
        for(var type in this.actionMap) {
            if(!!this.actionMap[type][id]) {
                this.actionMap[type][id].aborted = true;
            }
        }
    },

    /**
     * Update all actions
     */
    update: function()
    {
        var length = this.actionQueue.length;

        for (var i = 0; i < length; i++) {
            var action = this.actionQueue.pop();

            if (action.aborted) {
                continue;
            }

            action.update();
            if (!action.finished) {
                this.actionQueue.push(action);
            } else {
                delete this.actionMap[action.type][action.id];
            }
        }

    }

});

module.exports = ActionManager;
