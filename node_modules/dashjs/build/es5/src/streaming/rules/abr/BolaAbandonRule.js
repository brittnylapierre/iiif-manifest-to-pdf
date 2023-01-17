/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2016, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _SwitchRequest = require('../SwitchRequest');

var _SwitchRequest2 = _interopRequireDefault(_SwitchRequest);

var _modelsMediaPlayerModel = require('../../models/MediaPlayerModel');

var _modelsMediaPlayerModel2 = _interopRequireDefault(_modelsMediaPlayerModel);

var _coreFactoryMaker = require('../../../core/FactoryMaker');

var _coreFactoryMaker2 = _interopRequireDefault(_coreFactoryMaker);

var _coreDebug = require('../../../core/Debug');

var _coreDebug2 = _interopRequireDefault(_coreDebug);

var _BolaRule = require('./BolaRule');

var _BolaRule2 = _interopRequireDefault(_BolaRule);

function BolaAbandonRule(config) {

    // do not abandon during the grace period
    var GRACE_PERIOD_MS = 500;
    var POOR_LATENCY_MS = 200;

    var context = this.context;
    var log = (0, _coreDebug2['default'])(context).getInstance().log;
    var dashMetrics = config.dashMetrics;
    var metricsModel = config.metricsModel;

    var instance = undefined,
        abandonDict = undefined,
        mediaPlayerModel = undefined;

    function setup() {
        abandonDict = {};
        mediaPlayerModel = (0, _modelsMediaPlayerModel2['default'])(context).getInstance();
    }

    function rememberAbandon(mediaType, index, quality) {
        // if this is called, then canStillAbandon(mediaType, index, quality) should have returned true
        abandonDict[mediaType] = { index: index, quality: quality };
    }

    function canAbandon(mediaType, index, quality) {
        var a = abandonDict[mediaType];
        if (!a) return true;
        return index !== a.index || quality < a.quality;
    }

    function shouldAbandon(rulesContext) {
        var mediaInfo = rulesContext.getMediaInfo();
        var mediaType = mediaInfo.type;
        var metrics = metricsModel.getReadOnlyMetricsFor(mediaType);
        var request = rulesContext.getCurrentRequest();
        var switchRequest = (0, _SwitchRequest2['default'])(context).create(_SwitchRequest2['default'].NO_CHANGE, { name: BolaAbandonRule.__dashjs_factory_name });

        if (metrics.BolaState.length === 0) {
            // should not arrive here - we shouldn't be downloading a fragment before BOLA is initialized
            log('WARNING: executing BolaAbandonRule before initializing BolaRule');
            abandonDict[mediaType] = null;
            return switchRequest;
        }

        var bolaState = metrics.BolaState[0]._s;
        // TODO: does changing bolaState conform to coding style, or should we clone?

        var index = request.index;
        var quality = request.quality;

        if (isNaN(index) || quality === 0 || !canAbandon(mediaType, index, quality) || !request.firstByteDate) {
            return switchRequest;
        }

        var nowMs = Date.now();
        var elapsedTimeMs = nowMs - request.firstByteDate.getTime();

        var bytesLoaded = request.bytesLoaded;
        var bytesTotal = request.bytesTotal;
        var bytesRemaining = bytesTotal - bytesLoaded;
        var durationS = request.duration;

        var bufferLevel = dashMetrics.getCurrentBufferLevel(metrics) ? dashMetrics.getCurrentBufferLevel(metrics) : 0.0;
        var effectiveBufferLevel = bufferLevel + bolaState.placeholderBuffer;

        var estimateThroughput = 8 * bytesLoaded / (0.001 * elapsedTimeMs); // throughput in bits per second
        var estimateThroughputBSF = bolaState.bandwidthSafetyFactor * estimateThroughput;
        var latencyS = 0.001 * (request.firstByteDate.getTime() - request.requestStartDate.getTime());
        if (latencyS < 0.001 * POOR_LATENCY_MS) {
            latencyS = 0.001 * POOR_LATENCY_MS;
        }
        var estimateTotalTimeS = latencyS + 8 * bytesTotal / estimateThroughputBSF;

        var diagnosticMessage = '';
        if (_BolaRule2['default'].BOLA_DEBUG) diagnosticMessage = 'index=' + index + ' quality=' + quality + ' bytesLoaded/bytesTotal=' + bytesLoaded + '/' + bytesTotal + ' bufferLevel=' + bufferLevel + ' timeSince1stByte=' + (elapsedTimeMs / 1000).toFixed(3) + ' estThroughput=' + (estimateThroughputBSF / 1000000).toFixed(3) + ' latency=' + latencyS.toFixed(3);

        var estimateOtherBytesTotal = bytesTotal * bolaState.bitrates[0] / bolaState.bitrates[quality];
        var estimateBytesRemainingAfterLatency = bytesRemaining - latencyS * estimateThroughputBSF / 8;
        if (estimateBytesRemainingAfterLatency < 1) {
            estimateBytesRemainingAfterLatency = 1;
        }

        if (elapsedTimeMs < GRACE_PERIOD_MS || bytesRemaining <= estimateOtherBytesTotal || bufferLevel > bolaState.bufferTarget || estimateBytesRemainingAfterLatency <= estimateOtherBytesTotal || estimateTotalTimeS <= durationS) {
            // Do not abandon during first GRACE_PERIOD_MS.
            // Do not abandon if we need to download less bytes than the size of the lowest quality fragment.
            // Do not abandon if buffer level is above bufferTarget because the schedule controller will not download anything anyway.
            // Do not abandon if after latencyS bytesRemaining is estimated to drop below size of lowest quality fragment.
            // Do not abandon if fragment takes less than 1 fragment duration to download.
            return switchRequest;
        }

        // If we abandon, there will be latencyS time before we get first byte at lower quality.
        // By that time, the no-abandon option would have downloaded some more, and the buffer level would have depleted some more.
        // Introducing this latencyS cushion also helps avoid extra abandonment, especially with close bitrates.

        var effectiveBufferAfterLatency = effectiveBufferLevel - latencyS;
        if (effectiveBufferAfterLatency < 0) {
            effectiveBufferAfterLatency = 0;
        }

        // if we end up abandoning, we should not consider starting a download that would require more bytes than the remaining bytes in currently downloading fragment
        var maxDroppedQuality = 0;
        while (maxDroppedQuality + 1 < quality && bytesTotal * bolaState.bitrates[maxDroppedQuality + 1] / bolaState.bitrates[quality] < estimateBytesRemainingAfterLatency) {

            ++maxDroppedQuality;
        }

        var newQuality = quality;

        if (bolaState.state === _BolaRule2['default'].BOLA_STATE_STARTUP) {
            // We are not yet using the BOLA buffer rules - use different abandonment logic.

            // if we are here then we failed the test that estimateTotalTimeS <= durationS, so we abandon

            // search for quality that matches the throughput
            newQuality = 0;
            for (var i = 0; i <= maxDroppedQuality; ++i) {
                estimateOtherBytesTotal = bytesTotal * bolaState.bitrates[i] / bolaState.bitrates[quality];
                if (8 * estimateOtherBytesTotal / durationS > estimateThroughputBSF) {
                    // chunks at quality i or higher need a greater throughput
                    break;
                }
                newQuality = i;
            }
        } else {
            // bolaState.state === BolaRule.BOLA_STATE_STEADY
            // check if we should abandon using BOLA utility criteria

            var score = (bolaState.Vp * (bolaState.utilities[quality] + bolaState.gp) - effectiveBufferAfterLatency) / estimateBytesRemainingAfterLatency;

            for (var i = 0; i <= maxDroppedQuality; ++i) {
                estimateOtherBytesTotal = bytesTotal * bolaState.bitrates[i] / bolaState.bitrates[quality];
                var s = (bolaState.Vp * (bolaState.utilities[i] + bolaState.gp) - effectiveBufferAfterLatency) / estimateOtherBytesTotal;
                if (s > score) {
                    newQuality = i;
                    score = s;
                }
            }
        }

        // Perform check for rebuffer avoidance - now use real buffer level as opposed to effective buffer level.
        var safeByteSize = bolaState.rebufferSafetyFactor * estimateThroughput * (bufferLevel - latencyS) / 8;

        if (newQuality === quality && estimateBytesRemainingAfterLatency > safeByteSize) {
            newQuality = maxDroppedQuality;
        }

        if (newQuality === quality) {
            // no change
            return switchRequest;
        }

        // newQuality < quality, we are abandoning
        while (newQuality > 0) {
            estimateOtherBytesTotal = bytesTotal * bolaState.bitrates[newQuality] / bolaState.bitrates[quality];
            if (estimateOtherBytesTotal <= safeByteSize) {
                break;
            }
            --newQuality;
        }

        // deflate placeholder buffer - we want to be conservative after abandoning
        var wantBufferLevel = NaN;
        if (newQuality > 0) {
            // deflate to point where score for newQuality is just getting better than for (newQuality - 1)
            var u = bolaState.utilities[newQuality];
            var u1 = bolaState.utilities[newQuality - 1];
            var s = bolaState.bitrates[newQuality];
            var s1 = bolaState.bitrates[newQuality - 1];
            wantBufferLevel = bolaState.Vp * ((s * u1 - s1 * u) / (s - s1) + bolaState.gp);
        } else {
            // deflate to point where score for (newQuality + 1) is just getting better than for newQuality
            var u = bolaState.utilities[0];
            var u1 = bolaState.utilities[1];
            var s = bolaState.bitrates[0];
            var s1 = bolaState.bitrates[1];
            wantBufferLevel = bolaState.Vp * ((s * u1 - s1 * u) / (s - s1) + bolaState.gp);
            // then reduce one fragment duration to be conservative
            wantBufferLevel -= durationS;
        }
        if (effectiveBufferLevel > wantBufferLevel) {
            bolaState.placeholderBuffer = wantBufferLevel - bufferLevel;
            if (bolaState.placeholderBuffer < 0) bolaState.placeholderBuffer = 0;
        }

        bolaState.lastQuality = newQuality;
        metricsModel.updateBolaState(mediaType, bolaState);

        if (_BolaRule2['default'].BOLA_DEBUG) log('BolaDebug ' + mediaType + ' BolaAbandonRule abandon to ' + newQuality + ' - ' + diagnosticMessage);

        rememberAbandon(mediaType, index, quality);
        switchRequest.value = newQuality;
        switchRequest.reason.state = bolaState.state;
        switchRequest.reason.throughput = estimateThroughput;
        switchRequest.reason.bufferLevel = bufferLevel;
        // following entries used for tuning algorithm
        switchRequest.reason.bytesLoaded = request.bytesLoaded;
        switchRequest.reason.bytesTotal = request.bytesTotal;
        switchRequest.reason.elapsedTimeMs = elapsedTimeMs;

        return switchRequest;
    }

    function reset() {
        abandonDict = {};
    }

    instance = {
        shouldAbandon: shouldAbandon,
        reset: reset
    };

    setup();

    return instance;
}

BolaAbandonRule.__dashjs_factory_name = 'BolaAbandonRule';
exports['default'] = _coreFactoryMaker2['default'].getClassFactory(BolaAbandonRule);
module.exports = exports['default'];
//# sourceMappingURL=BolaAbandonRule.js.map
