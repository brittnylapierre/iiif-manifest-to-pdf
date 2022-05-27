/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
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

var _RulesContext = require('./RulesContext');

var _RulesContext2 = _interopRequireDefault(_RulesContext);

var _SwitchRequest = require('./SwitchRequest');

var _SwitchRequest2 = _interopRequireDefault(_SwitchRequest);

var _abrABRRulesCollection = require('./abr/ABRRulesCollection');

var _abrABRRulesCollection2 = _interopRequireDefault(_abrABRRulesCollection);

var _coreFactoryMaker = require('../../core/FactoryMaker');

var _coreFactoryMaker2 = _interopRequireDefault(_coreFactoryMaker);

var ABR_RULE = 0;

function RulesController() {

    var context = this.context;

    var instance = undefined,
        rules = undefined;

    function initialize() {
        rules = {};
    }

    function setConfig(config) {
        if (!config) return;

        if (config.abrRulesCollection) {
            rules[ABR_RULE] = config.abrRulesCollection;
        }
    }

    function applyRules(rulesArr, streamProcessor, callback, current, playbackQuality, overrideFunc) {
        var values = {};
        var reasons = {};
        var rule, i;

        var rulesCount = rulesArr.length;
        var ln = rulesCount;
        var rulesContext = getRulesContext(streamProcessor, current);

        var callbackFunc = function callbackFunc(result) {
            var value, reason, confidence;

            if (result.value !== _SwitchRequest2['default'].NO_CHANGE) {
                var newValue = overrideFunc(values[result.priority], result.value);
                if (newValue !== values[result.priority]) {
                    // change in value
                    values[result.priority] = newValue; // === result.value
                    reasons[result.priority] = result.reason;
                }
            }

            if (--rulesCount) return;

            if (values[_SwitchRequest2['default'].WEAK] !== _SwitchRequest2['default'].NO_CHANGE) {
                confidence = _SwitchRequest2['default'].WEAK;
                value = values[_SwitchRequest2['default'].WEAK];
                reason = reasons[_SwitchRequest2['default'].WEAK];
            }

            if (values[_SwitchRequest2['default'].DEFAULT] !== _SwitchRequest2['default'].NO_CHANGE) {
                confidence = _SwitchRequest2['default'].DEFAULT;
                value = values[_SwitchRequest2['default'].DEFAULT];
                reason = reasons[_SwitchRequest2['default'].DEFAULT];
            }

            if (values[_SwitchRequest2['default'].STRONG] !== _SwitchRequest2['default'].NO_CHANGE) {
                confidence = _SwitchRequest2['default'].STRONG;
                value = values[_SwitchRequest2['default'].STRONG];
                reason = reasons[_SwitchRequest2['default'].STRONG];
            }

            if (confidence != _SwitchRequest2['default'].STRONG && confidence != _SwitchRequest2['default'].WEAK) {
                confidence = _SwitchRequest2['default'].DEFAULT;
            }

            if (value !== undefined) {
                callback({ value: value, confidence: confidence, reason: reason });
            } else {
                callback({ value: current, confidence: confidence, reason: { name: 'NO_CHANGE' } });
            }
        };

        values[_SwitchRequest2['default'].STRONG] = _SwitchRequest2['default'].NO_CHANGE;
        values[_SwitchRequest2['default'].WEAK] = _SwitchRequest2['default'].NO_CHANGE;
        values[_SwitchRequest2['default'].DEFAULT] = _SwitchRequest2['default'].NO_CHANGE;

        for (i = 0; i < ln; i++) {
            rule = rulesArr[i];
            rule.execute(rulesContext, callbackFunc);
        }
    }

    function reset() {
        var abrRules = rules[ABR_RULE];
        var allRules = (abrRules.getRules(_abrABRRulesCollection2['default'].QUALITY_SWITCH_RULES) || []).concat(abrRules.getRules(_abrABRRulesCollection2['default'].ABANDON_FRAGMENT_RULES) || []);
        var ln = allRules.length;

        var rule, i;

        for (i = 0; i < ln; i++) {
            rule = allRules[i];

            if (typeof rule.reset !== 'function') continue;

            rule.reset();
        }

        rules = {};
    }

    function getRulesContext(streamProcessor, currentValue) {
        return (0, _RulesContext2['default'])(context).create({ streamProcessor: streamProcessor, currentValue: currentValue });
    }

    instance = {
        initialize: initialize,
        setConfig: setConfig,
        applyRules: applyRules,
        reset: reset
    };

    return instance;
}

RulesController.__dashjs_factory_name = 'RulesController';
var factory = _coreFactoryMaker2['default'].getSingletonFactory(RulesController);
factory.ABR_RULE = ABR_RULE;
exports['default'] = factory;
module.exports = exports['default'];
//# sourceMappingURL=RulesController.js.map
