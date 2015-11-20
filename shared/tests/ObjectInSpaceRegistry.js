/* global suite, test */
/* jshint node: true */

var sylvester = require('sylvester'),
    ObjectInSpaceRegistry = require('../model/ObjectInSpaceRegistry'),
    ObjectInSpace = require('../model/ObjectInSpace'),
    assert = require('assert');

function sortObjects(o) {
    function comparator(o1, o2) {
        var i1 = o1.getId(),
            i2 = o2.getId();
        
        if (i1 === i2) {
            return 0;
        }
        
        return i1 < i2 ? -1 : 1;
    }
    
    return o.sort(comparator);
}

function assertObjectListIdentity(o1, o2) {
    o1 = sortObjects(o1);
    o2 = sortObjects(o2);
    
    assert.strictEqual(o1.length, o2.length);
    
    var i = 0;
    
    for (i = 0; i < o1.length; i++) {
        assert.strictEqual(o1[i].getId(), o2[i].getId());
    }
}

suite('Object registry', function() {

    test('registering objects', function() {
        var o1 = new ObjectInSpace()
                     .setId('ding1'),
            o2 = new ObjectInSpace()
                     .setId('ding2'),
            registry = new ObjectInSpaceRegistry();
        
        registry
            .push(o1)
            .push(o2);
        
        assert.strictEqual(registry.getObject('ding1'), o1);
        assert.strictEqual(registry.getObject('ding2'), o2);
        assert(!registry.getObject('dingsbums'));
    });
    
    test('determining the surroundings', function() {
        var objects = [
                {
                    id: 'a',
                    pos: [0, 0, 0]
                }, {
                    id: 'b',
                    pos: [0, 1, 0]
                }, {
                    id: 'c',
                    pos: [0, 2, 0]
                }, {
                    id: 'd',
                    pos: [0, 3, 0]
                }, {
                    id: 'e',
                    pos: [0, 4, 0]
                }
            ].map(function(def) {
                return new ObjectInSpace()
                    .setId(def.id)
                    .setPosition(sylvester.Vector.create(def.pos));
            }),
            registry = new ObjectInSpaceRegistry();
            
        objects.forEach(function(o) {
            registry.push(o);
        });
        
        assertObjectListIdentity(
            registry.getSurroundings(sylvester.Vector.create([0, 0, 0]), 1),
            [registry.getObject('a')]
        );
        
        assertObjectListIdentity(
            registry.getSurroundings(sylvester.Vector.create([0, 0, 0]), 2.5),
            [registry.getObject('a'), registry.getObject('b'), registry.getObject('c')]
        );
        
        assertObjectListIdentity(
            registry.getSurroundings(sylvester.Vector.create([0, 2, 0]), 1.5),
            [registry.getObject('c'), registry.getObject('b'), registry.getObject('d')]
        );
        
        assertObjectListIdentity(
            registry.getSurroundings(sylvester.Vector.create([0, 2.5, 0]), 0.25),
            []
        );
    });

});