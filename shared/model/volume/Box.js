/* jshint node:true */

var _ = require('lodash');

/**
 * Describes a bounding box.
 * 
 * @param {Sylvester.Vector} extend Corner vector, relative to object position.
 */
function Box(extend) {
   this.setExtend(extend); 
}

_.extend(Box, {
    type: 'BOX'
});

_.extend(Box.prototype, {
    type: Box.type,
    
    _extend: null,
    
    /**
     * @return {Sylvester.Vector}
     */
    getExtend: function() {
        return this._extend;
    },
    
    /**
     * @param {Sylvester.Vector} extend
     * 
     * @return Box
     */
    setExtend(extend) {
        this._extend = extend;
    }
});

module.exports = Box;