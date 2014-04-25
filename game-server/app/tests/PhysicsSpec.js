var physicsSuite = require('./physics');

describe('Physics engine', function() {

    it('Rotations in the ship FOR should not change the axis of rotation', function() {
        expect(function() {
                physicsSuite.testRotationInShipFOR();
            })
            .not.toThrow();
    });

});
