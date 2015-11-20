/* jshint node:true */

var volume = require('../model/volume'),
    ObjectInSpace = require('../model/ObjectInSpace');

/**
 * Check two objects for collision.
 * 
 * @param o2 {ObjectInSpace}
 * @param o2 {ObjectInSpace}
 * 
 * @return {boolean}
 */
function collides(o1, o2) {
    var temp;
    
    if (o2.getVolume().type < o1.getVolume().type) {
        temp = o1;
        o1 = o2;
        o2 = temp;
    }
    
    switch (o1.getVolume().type) {
        case volume.Box.type:
            switch (o2.getVolume().type) {
                case volume.Box.type:
                    return collidesBoxBox(o1, o2);
                
                case volume.Point.type:
                    return collidesBoxPoint(o1, o2);
                
                case volume.Sphere.type:
                    return collidesBoxSphere(o1, o2);
            }
            
        case volume.Point.type:
            switch (o2.getVolume().type) {
                case volume.Point.type:
                    return collidesPointPoint(o1, o2);
                
                case volume.Sphere.type:
                    return collidesPointSphere(o1, o2);
            }
            
        case volume.Sphere.type:
                return collidesSphereSphere(o1, o2);
    }
}

/**
 * Check for intersection between an object and a straight line.
 * 
 * @param {ObjectInSpace} o
 * @param {sylvester.Vector} base Straight line base point
 * @param {sylvester.Vector} direction Straigt line direction vector (must be normalized)
 * 
 * @return {boolean}
 */
function collidesWithLine(o, base, direction) {
    switch (o.getVolume().type) {
        case volume.Point.type:
            return false;
        
        case volume.Sphere.type:
            return sphereCollidesWithLine(o, base, direction);
        
        case volume.Box.type:
            return boxCollidesWithLine(o, base, direction);
    }
}

module.exports = {
    collides: collides,
    collidesWithLine: collidesWithLine
};

function collidesBoxBox(box1, box2) {
    throw new Error('box-box collisions not implemented');
}

function collidesBoxPoint(box, point) {
    throw new Error('box-point collisions not implemented');
}

function collidesBoxSphere(box, sphere) {
    throw new Error('box-sphere collisions not implemented');
}

function collidesPointPoint() {
    return false;
}

function collidesPointSphere(point, sphere) {
    return point.getPosition().subtract(sphere.getPosition()).modulus() < 
        sphere.getVolume().getRadius();
}

function collidesSphereSphere(sphere1, sphere2) {
    return sphere1.getPosition().subtract(sphere2.getPosition()).modulus() <
        (sphere1.getVolume().getRadius() + sphere2.getVolume().getRadius());
}

function sphereCollidesWithLine(sphere, base, direction) {
    var pos = sphere.getPosition(),
        d = pos.subtract(base),
        dproj = d.dot(direction),
        mod2 = d.dot(d) - dproj*dproj;
    
    return mod2 > 0 ? (Math.sqrt(mod2) < sphere.getVolume().getRadius()) : true;
}

function boxCollidesWithLine() {
    throw new Error('collisions line - box not implemented');
}