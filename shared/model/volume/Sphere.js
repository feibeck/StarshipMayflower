/* jshint node:true */

var _ = require('lodash');

/**
 * Describes a bounding sphere.
 * 
 * @param {number} radius Sphere radius
 */
function Sphere(radius) {
    this.setRadius(radius);
}

_.extend(Sphere, {
    type: 'SPHERE'
});

_.extend(Sphere.prototype, {
    type: Sphere.type,
    
    _radius: null,
    
    /**
     * @return number
     */
    getRadius: function() {
        return this._radius;
    },
    
    /**
     * @param {number} radius
     * 
     * @return Sphere
     */
    setRadius: function(radius) {
        this._radius = radius;
        
        return this;
    }
});

module.exports = Sphere;