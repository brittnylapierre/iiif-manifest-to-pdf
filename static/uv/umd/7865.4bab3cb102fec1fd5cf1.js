"use strict";(self.webpackChunkUV=self.webpackChunkUV||[]).push([[7865],{7865:(e,t,i)=>{i.r(t),i.d(t,{default:()=>a});var o,n=i(8673),r=i(2518),u=(o=function(e,t){return o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i])},o(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function i(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(i.prototype=t.prototype,new i)});const a=function(e){function t(t){var i=e.call(this,t)||this;return i._init(i.options.data),i}return u(t,e),t.prototype._getYouTubeVideoId=function(e){return e.indexOf("v=")&&(e=e.split("v=")[1]),e},t.prototype._init=function(e){var t=this;if(window.youTubePlayers||(window.youTubePlayers=[]),this._id="YTPlayer-"+(new Date).getTime(),window.youTubePlayers.push({id:this._id,data:e,ref:this}),this._playerDiv||(this._playerDiv=document.createElement("div"),this._playerDiv.id=this._id,this._el.id="test_"+this._id,this._el.append(this._playerDiv)),!document.getElementById("youtube-iframe-api")){var i=document.createElement("script");i.id="youtube-iframe-api",i.src="//www.youtube.com/iframe_api";var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(i,o)}window.onYouTubeIframeAPIReady?window.onYouTubeIframeAPIReady():window.onYouTubeIframeAPIReady=function(){for(var e=function(e){window[e.id]=new YT.Player(e.id,{height:"100%",width:"100%",videoId:t._getYouTubeVideoId(e.data.youTubeVideoId),playerVars:{playsinline:1,enablejsapi:1,controls:e.data.controls?1:0,showInfo:0,modestbranding:1},events:{onReady:function(t){var i=t.target,o=i.getIframe().id,n=i.getDuration(),u=window.youTubePlayers.find((function(e){return e.id===o}));u&&(u.ref.set(e.data),u.ref.fire(r.z.CREATED),u.ref.fire(r.z.LOAD,{duration:n}))},onStateChange:function(e){}}})},i=0,o=window.youTubePlayers;i<o.length;i++)e(o[i])}},t.prototype.set=function(e){var t=window[this._id];if(e.youTubeVideoId){var i=this._getYouTubeVideoId(e.youTubeVideoId);e.autoPlay?t.loadVideoById(i):t.cueVideoById(i)}e.currentTime&&t.seekTo(e.currentTime,!0)},t.prototype.exitFullScreen=function(){},t.prototype.resize=function(){var e=this._el.clientWidth+"px",t=this._el.clientHeight+"px";this._playerDiv.style.width=e,this._playerDiv.style.height=t},t.prototype.dispose=function(){var t=this;e.prototype.dispose.call(this),window.youTubePlayers=window.youTubePlayers.filter((function(e){return e.id!==t._id}))},t}(n.Z)}}]);