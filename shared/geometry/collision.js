/* jshint node:true */

var volume = require('../models/volume'),
    ObjectInSpace = require('../ObjectInSpace');

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