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
 */'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{'default':obj};}var _IsoFile=require('./IsoFile');var _IsoFile2=_interopRequireDefault(_IsoFile);var _coreFactoryMaker=require('../../core/FactoryMaker');var _coreFactoryMaker2=_interopRequireDefault(_coreFactoryMaker);var _codemIsoboxer=require('codem-isoboxer');var _codemIsoboxer2=_interopRequireDefault(_codemIsoboxer);function BoxParser() /*config*/{var instance=undefined;var context=this.context; /**
     * @param {ArrayBuffer} data
     * @returns {IsoFile|null}
     * @memberof BoxParser#
     */function parse(data){if(!data)return null;if(data.fileStart === undefined){data.fileStart = 0;}var parsedFile=_codemIsoboxer2['default'].parseBuffer(data);var dashIsoFile=(0,_IsoFile2['default'])(context).create();dashIsoFile.setData(parsedFile);return dashIsoFile;}instance = {parse:parse};return instance;}BoxParser.__dashjs_factory_name = 'BoxParser';exports['default'] = _coreFactoryMaker2['default'].getSingletonFactory(BoxParser);module.exports = exports['default'];
//# sourceMappingURL=BoxParser.js.map
