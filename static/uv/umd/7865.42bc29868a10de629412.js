"use strict";(self.webpackChunkUV=self.webpackChunkUV||[]).push([[7865],{7865:(e,t,n)=>{n.r(t),n.d(t,{default:()=>d});var o,r=n(8673),i=n(2518),a=n(6505),u=(o=function(e,t){return o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},o(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});const d=function(e){function t(t,n,o){var r=e.call(this,t,n,o)||this;return r.options=t,r.adapter=n,r._init(r.options.data),r}return u(t,e),t.prototype._getYouTubeVideoId=function(e){return e.indexOf("v=")&&(e=e.split("v=")[1]),e},t.prototype._init=function(e){return t=this,n=void 0,r=function(){var t,n,o=this;return function(e,t){var n,o,r,i,a={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,o&&(r=2&i[0]?o.return:i[0]?o.throw||((r=o.return)&&r.call(o),0):o.next)&&!(r=r.call(o,i[1])).done)return r;switch(o=0,r&&(i=[2&i[0],r.value]),i[0]){case 0:case 1:r=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,o=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!((r=(r=a.trys).length>0&&r[r.length-1])||6!==i[0]&&2!==i[0])){a=0;continue}if(3===i[0]&&(!r||i[1]>r[0]&&i[1]<r[3])){a.label=i[1];break}if(6===i[0]&&a.label<r[1]){a.label=r[1],r=i;break}if(r&&a.label<r[2]){a.label=r[2],a.ops.push(i);break}r[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a)}catch(e){i=[6,e],o=0}finally{n=r=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}}(this,(function(r){return window.youTubePlayers||(window.youTubePlayers=[]),this._id="YTPlayer-"+(new Date).getTime(),window.youTubePlayers.push({id:this._id,data:e,ref:this}),this._playerDiv||(this._playerDiv=document.createElement("div"),this._playerDiv.id=this._id,this._el.append(this._playerDiv)),document.getElementById("youtube-iframe-api")||((t=document.createElement("script")).id="youtube-iframe-api",t.src="//www.youtube.com/iframe_api",(n=document.getElementsByTagName("script")[0]).parentNode.insertBefore(t,n)),window.onYouTubeIframeAPIReady?window.onYouTubeIframeAPIReady():window.onYouTubeIframeAPIReady=function(){for(var e=function(e){e.ref.configure({controls:!0}).then((function(t){window[e.id]=new YT.Player(e.id,{height:"100%",width:"100%",videoId:o._getYouTubeVideoId(e.data.youTubeVideoId),playerVars:{playsinline:1,enablejsapi:1,controls:t.controls?1:0,showInfo:0,rel:0,modestbranding:1},events:{onReady:function(n){var o=n.target.getIframe().id,r=window.youTubePlayers.find((function(e){return e.id===o}));r&&(r.ref.config=t,r.ref.set(e.data),r.ref.fire(i.z.CREATED))},onStateChange:function(e){var t=e.target,n=t.getIframe().id,o=t.getDuration(),r=window.youTubePlayers.find((function(e){return e.id===n}));if(r)switch(e.data){case-1:r.ref.fire(a.R.UNSTARTED),r.ref.fire(i.z.LOAD,{player:t,duration:o});break;case 0:r.ref.fire(a.R.ENDED);break;case 1:r.ref.fire(a.R.PLAYING);break;case 2:r.ref.fire(a.R.PAUSED);break;case 3:r.ref.fire(a.R.BUFFERING);break;case 5:r.ref.fire(a.R.CUED)}}}})}))},t=0,n=window.youTubePlayers;t<n.length;t++)e(n[t])},[2]}))},new((o=void 0)||(o=Promise))((function(e,i){function a(e){try{d(r.next(e))}catch(e){i(e)}}function u(e){try{d(r.throw(e))}catch(e){i(e)}}function d(t){var n;t.done?e(t.value):(n=t.value,n instanceof o?n:new o((function(e){e(n)}))).then(a,u)}d((r=r.apply(t,n||[])).next())}));var t,n,o,r},t.prototype.set=function(e){var t=window[this._id];if(e.muted?t.mute():t.unMute(),e.youTubeVideoId){var n=this._getYouTubeVideoId(e.youTubeVideoId);e.autoPlay?e.duration?t.loadVideoById({videoId:n,startSeconds:e.duration[0],endSeconds:e.duration[1]}):t.loadVideoById(n):e.duration?t.cueVideoById({videoId:n,startSeconds:e.duration[0],endSeconds:e.duration[1]}):t.cueVideoById(n)}e.currentTime&&t.seekTo(e.currentTime,!0)},t.prototype.exitFullScreen=function(){},t.prototype.resize=function(){var e=this._el.clientWidth+"px",t=this._el.clientHeight+"px";this._playerDiv.style.width=e,this._playerDiv.style.height=t},t.prototype.dispose=function(){var t=this;e.prototype.dispose.call(this),window.youTubePlayers=window.youTubePlayers.filter((function(e){return e.id!==t._id}))},t}(r.Z)}}]);