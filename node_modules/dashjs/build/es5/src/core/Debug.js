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
 */'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{'default':obj};}var _EventBus=require('./EventBus');var _EventBus2=_interopRequireDefault(_EventBus);var _eventsEvents=require('./events/Events');var _eventsEvents2=_interopRequireDefault(_eventsEvents);var _FactoryMaker=require('./FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker); /**
 * @module Debug
 */function Debug(){var context=this.context;var eventBus=(0,_EventBus2['default'])(context).getInstance();var instance=undefined,logToBrowserConsole=undefined,showLogTimestamp=undefined,showCalleeName=undefined,startTime=undefined;function setup(){logToBrowserConsole = true;showLogTimestamp = true;showCalleeName = false;startTime = new Date().getTime();} /**
     * Prepends a timestamp in milliseconds to each log message.
     * @param {boolean} value Set to true if you want to see a timestamp in each log message.
     * @default false
     * @memberof module:Debug
     * @instance
     */function setLogTimestampVisible(value){showLogTimestamp = value;} /**
     * Prepends the callee object name, and media type if available, to each log message.
     * @param {boolean} value Set to true if you want to see the callee object name and media type in each log message.
     * @default false
     * @memberof module:Debug
     * @instance
     */function setCalleeNameVisible(value){showCalleeName = value;} /**
     * Toggles logging to the browser's javascript console.  If you set to false you will still receive a log event with the same message.
     * @param {boolean} value Set to false if you want to turn off logging to the browser's console.
     * @default true
     * @memberof module:Debug
     * @instance
     */function setLogToBrowserConsole(value){logToBrowserConsole = value;} /**
     * Use this method to get the state of logToBrowserConsole.
     * @returns {boolean} The current value of logToBrowserConsole
     * @memberof module:Debug
     * @instance
     */function getLogToBrowserConsole(){return logToBrowserConsole;} /**
     * This method will allow you send log messages to either the browser's console and/or dispatch an event to capture at the media player level.
     * @param {...*} arguments The message you want to log. The Arguments object is supported for this method so you can send in comma separated logging items.
     * @memberof module:Debug
     * @instance
     */function log(){var message='';var logTime=null;if(showLogTimestamp){logTime = new Date().getTime();message += '[' + (logTime - startTime) + ']';}if(showCalleeName && this && this.getClassName){message += '[' + this.getClassName() + ']';if(this.getType){message += '[' + this.getType() + ']';}}if(message.length > 0){message += ' ';}Array.apply(null,arguments).forEach(function(item){message += item + ' ';});if(logToBrowserConsole){console.log(message);}eventBus.trigger(_eventsEvents2['default'].LOG,{message:message});}instance = {log:log,setLogTimestampVisible:setLogTimestampVisible,setCalleeNameVisible:setCalleeNameVisible,setLogToBrowserConsole:setLogToBrowserConsole,getLogToBrowserConsole:getLogToBrowserConsole};setup();return instance;}Debug.__dashjs_factory_name = 'Debug';exports['default'] = _FactoryMaker2['default'].getSingletonFactory(Debug);module.exports = exports['default'];
//# sourceMappingURL=Debug.js.map
