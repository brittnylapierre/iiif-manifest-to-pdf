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
 */'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{'default':obj};}var _coreDebug=require('../core/Debug');var _coreDebug2=_interopRequireDefault(_coreDebug);var _voDashJSError=require('./vo/DashJSError');var _voDashJSError2=_interopRequireDefault(_voDashJSError);var _coreEventBus=require('../core/EventBus');var _coreEventBus2=_interopRequireDefault(_coreEventBus);var _coreEventsEvents=require('../core/events/Events');var _coreEventsEvents2=_interopRequireDefault(_coreEventsEvents);var _coreFactoryMaker=require('../core/FactoryMaker');var _coreFactoryMaker2=_interopRequireDefault(_coreFactoryMaker);var _textTextController=require('./text/TextController');var _textTextController2=_interopRequireDefault(_textTextController); /**
 * @class SourceBufferSink
 * @implements FragmentSink
 */function SourceBufferSink(mediaSource,mediaInfo,onAppendedCallback){var context=this.context;var log=(0,_coreDebug2['default'])(context).getInstance().log;var eventBus=(0,_coreEventBus2['default'])(context).getInstance();var buffer=undefined,isAppendingInProgress=undefined;var appendQueue=[];var onAppended=onAppendedCallback;function setup(){isAppendingInProgress = false;var codec=mediaInfo.codec;try{ // Safari claims to support anything starting 'application/mp4'.
// it definitely doesn't understand 'application/mp4;codecs="stpp"'
// - currently no browser does, so check for it and use our own
// implementation. The same is true for codecs="wvtt".
if(codec.match(/application\/mp4;\s*codecs="(stpp|wvtt).*"/i)){throw new Error('not really supported');}buffer = mediaSource.addSourceBuffer(codec);}catch(ex) { // Note that in the following, the quotes are open to allow for extra text after stpp and wvtt
if(mediaInfo.isText || codec.indexOf('codecs="stpp') !== -1 || codec.indexOf('codecs="wvtt') !== -1){var textController=(0,_textTextController2['default'])(context).getInstance();buffer = textController.getTextSourceBuffer();}else {throw ex;}}}function reset(){if(buffer){try{mediaSource.removeSourceBuffer(buffer);}catch(e) {log('Failed to remove source buffer from media source.');}isAppendingInProgress = false;buffer = null;}appendQueue = [];onAppended = null;}function getBuffer(){return buffer;}function getAllBufferRanges(){return buffer.buffered;}function append(chunk){appendQueue.push(chunk);if(!isAppendingInProgress){waitForUpdateEnd(buffer,appendNextInQueue.bind(this));}}function remove(start,end,forceRemoval){var sourceBufferSink=this; // make sure that the given time range is correct. Otherwise we will get InvalidAccessError
waitForUpdateEnd(buffer,function(){try{if(start >= 0 && end > start && (forceRemoval || mediaSource.readyState !== 'ended')){buffer.remove(start,end);} // updating is in progress, we should wait for it to complete before signaling that this operation is done
waitForUpdateEnd(buffer,function(){eventBus.trigger(_coreEventsEvents2['default'].SOURCEBUFFER_REMOVE_COMPLETED,{buffer:sourceBufferSink,from:start,to:end});});}catch(err) {eventBus.trigger(_coreEventsEvents2['default'].SOURCEBUFFER_REMOVE_COMPLETED,{buffer:sourceBufferSink,from:start,to:end,error:new _voDashJSError2['default'](err.code,err.message,null)});}});}function appendNextInQueue(){var _this=this;if(appendQueue.length > 0){(function(){isAppendingInProgress = true;var nextChunk=appendQueue[0];appendQueue.splice(0,1);var afterSuccess=function afterSuccess(){if(appendQueue.length > 0){appendNextInQueue.call(this);}else {isAppendingInProgress = false;if(onAppended){onAppended({chunk:nextChunk});}}};try{if(buffer.appendBuffer){buffer.appendBuffer(nextChunk.bytes);}else {buffer.append(nextChunk.bytes,nextChunk);} // updating is in progress, we should wait for it to complete before signaling that this operation is done
waitForUpdateEnd(buffer,afterSuccess.bind(_this));}catch(err) {log('SourceBuffer append failed "' + err + '"');if(appendQueue.length > 0){appendNextInQueue();}else {isAppendingInProgress = false;}if(onAppended){onAppended({chunk:nextChunk,error:new _voDashJSError2['default'](err.code,err.message,null)});}}})();}}function abort(){try{if(mediaSource.readyState === 'open'){buffer.abort();}else if(buffer.setTextTrack && mediaSource.readyState === 'ended'){buffer.abort(); //The cues need to be removed from the TextSourceBuffer via a call to abort()
}}catch(ex) {log('SourceBuffer append abort failed: "' + ex + '"');}appendQueue = [];}function waitForUpdateEnd(buffer,callback){var intervalId=undefined;var CHECK_INTERVAL=50;var checkIsUpdateEnded=function checkIsUpdateEnded(){ // if updating is still in progress do nothing and wait for the next check again.
if(buffer.updating)return; // updating is completed, now we can stop checking and resolve the promise
clearInterval(intervalId);callback();};var updateEndHandler=function updateEndHandler(){if(buffer.updating)return;buffer.removeEventListener('updateend',updateEndHandler,false);callback();};if(!buffer.updating){callback();return;} // use updateend event if possible
if(typeof buffer.addEventListener === 'function'){try{buffer.addEventListener('updateend',updateEndHandler,false);}catch(err) { // use setInterval to periodically check if updating has been completed
intervalId = setInterval(checkIsUpdateEnded,CHECK_INTERVAL);}}else { // use setInterval to periodically check if updating has been completed
intervalId = setInterval(checkIsUpdateEnded,CHECK_INTERVAL);}}var instance={getAllBufferRanges:getAllBufferRanges,getBuffer:getBuffer,append:append,remove:remove,abort:abort,reset:reset};setup();return instance;}SourceBufferSink.__dashjs_factory_name = 'SourceBufferSink';var factory=_coreFactoryMaker2['default'].getClassFactory(SourceBufferSink);exports['default'] = factory;module.exports = exports['default'];
//# sourceMappingURL=SourceBufferSink.js.map
