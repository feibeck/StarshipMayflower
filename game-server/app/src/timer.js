var game = require('./game');

var exp = module.exports;

var gameActionManager;

exp.run = function(actionManager) {
    gameActionManager = actionManager;
    setInterval(tick, 100);
};

function tick() {
    gameActionManager.update();
    game.moveShips();
}

/**
 * Add action for area
 * @param action {Object} The action need to add
 * @return {Boolean}
 */
exp.addAction = function(action) {
    return game.getActionManager().addAction(action);
};

/**
 * Abort action for area
 * @param type {Number} The type of the action
 * @param id {Id} The id of the action
 */
exp.abortAction = function(type, id) {
    return game.getActionManager().abortAction(type, id);
};

/**
 * Abort all action for a given id in area
 * @param id {Number} 
 */
exp.abortAllAction = function(id) {
    game.getActionManager().abortAllAction(id);
};
