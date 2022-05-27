"use strict";(self.webpackChunkUV=self.webpackChunkUV||[]).push([[7865],{7865:(e,t,n)=>{n.r(t),n.d(t,{default:()=>s});var r,o=n(8673),i=n(2518),a=n(6505),u=(r=function(e,t){return r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},r(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});const s=function(e){function t(t){var n=e.call(this,t)||this;return n._init(n.options.data),n}return u(t,e),t.prototype._getYouTubeVideoId=function(e){return e.indexOf("v=")&&(e=e.split("v=")[1]),e},t.prototype._init=function(e){return t=this,n=void 0,o=function(){var t,n,r=this;return function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!((o=(o=a.trys).length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}}(this,(function(o){return window.youTubePlayers||(window.youTubePlayers=[]),this._id="YTPlayer-"+(new Date).getTime(),window.youTubePlayers.push({id:this._id,data:e,ref:this}),this._playerDiv||(this._playerDiv=document.createElement("div"),this._playerDiv.id=this._id,this._el.append(this._playerDiv)),document.getElementById("youtube-iframe-api")||((t=document.createElement("script")).id="youtube-iframe-api",t.src="//www.youtube.com/iframe_api",(n=document.getElementsByTagName("script")[0]).parentNode.insertBefore(t,n)),window.onYouTubeIframeAPIReady?window.onYouTubeIframeAPIReady():window.onYouTubeIframeAPIReady=function(){for(var e=function(e){e.ref.configure({controls:!0}).then((function(t){window[e.id]=new YT.Player(e.id,{height:"100%",width:"100%",videoId:r._getYouTubeVideoId(e.data.youTubeVideoId),playerVars:{playsinline:1,enablejsapi:1,controls:t.controls?1:0,showInfo:0,modestbranding:1},events:{onReady:function(n){var r=n.target,o=r.getIframe().id,a=r.getDuration(),u=window.youTubePlayers.find((function(e){return e.id===o}));u&&(u.ref.config=t,u.ref.set(e.data),u.ref.fire(i.z.CREATED),u.ref.fire(i.z.LOAD,{duration:a}))},onStateChange:function(e){var t=e.target.getIframe().id,n=window.youTubePlayers.find((function(e){return e.id===t}));if(n)switch(e.data){case-1:n.ref.fire(a.R.UNSTARTED);break;case 0:n.ref.fire(a.R.ENDED);break;case 1:n.ref.fire(a.R.PLAYING);break;case 2:n.ref.fire(a.R.PAUSED);break;case 3:n.ref.fire(a.R.BUFFERING);break;case 5:n.ref.fire(a.R.CUED)}}}})}))},t=0,n=window.youTubePlayers;t<n.length;t++)e(n[t])},[2]}))},new((r=void 0)||(r=Promise))((function(e,i){function a(e){try{s(o.next(e))}catch(e){i(e)}}function u(e){try{s(o.throw(e))}catch(e){i(e)}}function s(t){var n;t.done?e(t.value):(n=t.value,n instanceof r?n:new r((function(e){e(n)}))).then(a,u)}s((o=o.apply(t,n||[])).next())}));var t,n,r,o},t.prototype.set=function(e){console.log("YT set");var t=window[this._id];if(e.youTubeVideoId){var n=this._getYouTubeVideoId(e.youTubeVideoId);e.autoPlay?e.trim?t.loadVideoById({videoId:n,startSeconds:e.trim[0],endSeconds:e.trim[1]}):t.loadVideoById(n):e.trim?t.cueVideoById({videoId:n,startSeconds:e.trim[0],endSeconds:e.trim[1]}):t.cueVideoById(n)}e.currentTime&&t.seekTo(e.currentTime,!0)},t.prototype.exitFullScreen=function(){},t.prototype.resize=function(){var e=this._el.clientWidth+"px",t=this._el.clientHeight+"px";this._playerDiv.style.width=e,this._playerDiv.style.height=t},t.prototype.dispose=function(){var t=this;e.prototype.dispose.call(this),window.youTubePlayers=window.youTubePlayers.filter((function(e){return e.id!==t._id}))},t}(o.Z)}}]);