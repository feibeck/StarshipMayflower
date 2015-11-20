/* global suite, test */
/* jshin node: true */

var assert = require('assert'),
    sylvester = require('sylvester'),
    volume = require('../model/volume'),
    collision = require('../geometry/collision'),
    ObjectInSpace = require('../model/ObjectInSpace');

suite("Collision detection", function() {
    
    suite('Collisions between objects', function() {
    
        test("Points never collide", function() {
            var o1 = new ObjectInSpace()
                    .setVolume(new volume.Point())
                    .setPosition(sylvester.Vector.create([0, 0, 0])),
                o2 = new ObjectInSpace()
                    .setVolume(new volume.Point())
                    .setPosition(sylvester.Vector.create([0, 0, 0]));
            
            assert(!collision.collides(o1, o2));
            
            o1.setPosition(sylvester.Vector.create([1, 1, 2]));
            
            assert(!collision.collides(o1, o2));
       });
       
       test("point - sphere, point inside sphere", function() {
            var o1 = new ObjectInSpace()
                    .setVolume(new volume.Point())
                    .setPosition(sylvester.Vector.create([0, 0, 0])),
                o2 = new ObjectInSpace()
                    .setVolume(new volume.Sphere(1))
                    .setPosition(sylvester.Vector.create([0, 0, 0]));
            
            assert(collision.collides(o1, o2));
            
            o1.setPosition(sylvester.Vector.create([0.5, 0, 0]));
            
            assert(collision.collides(o1, o2));
        });
       
       test('point - sphere, point outside sphere', function() {
            var o1 = new ObjectInSpace()
                    .setVolume(new volume.Point())
                    .setPosition(sylvester.Vector.create([1, 1, 0])),
                o2 = new ObjectInSpace()
                    .setVolume(new volume.Sphere(1))
                    .setPosition(sylvester.Vector.create([0, 0, 0]));
           
            assert(!collision.collides(o1, o2));
        });
        
        test('sphere - sphere, no intersection', function() {
            var o1 = new ObjectInSpace()
                    .setVolume(new volume.Sphere(1))
                    .setPosition(sylvester.Vector.create([2, 2, 2])),
                o2 = new ObjectInSpace()
                    .setVolume(new volume.Sphere(1))
                    .setPosition(sylvester.Vector.create([0, 0, 0]));
           
            assert(!collision.collides(o1, o2));
        });
        
        test('sphere - sphere, intersection', function() {
            var o1 = new ObjectInSpace()
                    .setVolume(new volume.Sphere(1))
                    .setPosition(sylvester.Vector.create([2, 2, 2])),
                o2 = new ObjectInSpace()
                    .setVolume(new volume.Sphere(5))
                    .setPosition(sylvester.Vector.create([1, 1, 1]));
           
            assert(collision.collides(o1, o2));
        });
            
    });
    
    suite('Collisions with lines', function() {
        
        test('Points should never collide with lines', function() {
            var o = new ObjectInSpace()
                    .setVolume(new volume.Point())
                    .setPosition(sylvester.Vector.create([0, 0, 0]));
            
            assert(!collision.collidesWithLine(
                o,
                sylvester.Vector.create([1, 0, 0]),
                sylvester.Vector.create([0, 0, 0])
            ));
            
            assert(!collision.collidesWithLine(
                o,
                sylvester.Vector.create([1, 0, 0]),
                sylvester.Vector.create([0, 1, 0])
            ));
        });
        
        test('point - sphere, no intersection', function() {
            
            function collisionTest(delta) {
                
                var sqrt2 = Math.sqrt(2),
                    o = new ObjectInSpace()
                        .setVolume(new volume.Sphere(1))
                        .setPosition(sylvester.Vector.create([0, 0, 0]).add(delta));
                
                assert(!collision.collidesWithLine(
                    o,
                    sylvester.Vector.create([2, 0, 0]).add(delta),
                    sylvester.Vector.create([0, 1, 0])
                ));
                
                assert(!collision.collidesWithLine(
                    o,
                    sylvester.Vector.create([2, 0, 0]).add(delta),
                    sylvester.Vector.create([1/sqrt2, 1/sqrt2, 0])
                ));    
            }
            
            collisionTest(sylvester.Vector.create([0, 0, 0]));
            collisionTest(sylvester.Vector.create([0, 0, 1]));
            collisionTest(sylvester.Vector.create([0, 1, 0]));
            collisionTest(sylvester.Vector.create([1, 0, 0]));
            
        });
        
        test('point - sphere, intersection', function() {
            
            function collisionTest(delta) {
                
                var sqrt2 = Math.sqrt(2),
                    o = new ObjectInSpace()
                        .setVolume(new volume.Sphere(1))
                        .setPosition(sylvester.Vector.create([0, 0, 0]).add(delta));
                
                assert(collision.collidesWithLine(
                    o,
                    sylvester.Vector.create([0.5, 0, 0]).add(delta),
                    sylvester.Vector.create([0, 1, 0])
                ));
                
                
                assert(collision.collidesWithLine(
                    o,
                    sylvester.Vector.create([0.5, 0, 0]).add(delta),
                    sylvester.Vector.create([1/sqrt2, 0, 1/sqrt2])
                ));    
            }
            
            collisionTest(sylvester.Vector.create([0, 0, 0]));
            collisionTest(sylvester.Vector.create([0, 0, 1]));
            collisionTest(sylvester.Vector.create([0, 1, 0]));
            collisionTest(sylvester.Vector.create([1, 0, 0]));
        });
        
    });
    
});