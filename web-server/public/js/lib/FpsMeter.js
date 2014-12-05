/* global define */
define(['lodash'], function(_) {
    'use strict';

    function FpsMeter(sampleDepth) {
        if (typeof(sampleDepth) !== 'undefined') {
            this._sampleDepth = sampleDepth;
        }

        this._sampleQueue = new Array(this._sampleDepth);
    }

    _.extend(FpsMeter.prototype, {
        _sampleQueue: null,
        _nextSampleIndex: 0,
        _sampleDepth: 100,
        _sampleCount: 0,

        tick: function() {
            this._sampleQueue[this._nextSampleIndex] = Date.now();
            this._nextSampleIndex = (this._nextSampleIndex + 1) % this._sampleDepth;

            if (this._sampleCount < this._sampleDepth) {
                this._sampleCount++;
            }
        },

        getFps: function() {
            if (this._sampleCount === 0) {
                return -1;
            }

            var oldest = this._sampleQueue[(this._nextSampleIndex - this._sampleCount + this._sampleDepth) % this._sampleDepth],
                newest = this._sampleQueue[(this._nextSampleIndex + this._sampleDepth - 1) % this._sampleDepth];

            return this._sampleCount / (newest - oldest) * 1000;
        }
    });

    return FpsMeter;
});
