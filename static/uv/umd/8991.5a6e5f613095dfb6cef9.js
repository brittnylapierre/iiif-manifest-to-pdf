"use strict";(self.webpackChunkUV=self.webpackChunkUV||[]).push([[8991],{8991:(t,o,r)=>{r.r(o),r.d(o,{ion_fab_button:()=>a});var n=r(2085),i=r(9114),a=function(){function t(t){var o=this;(0,n.r)(this,t),this.activated=!1,this.disabled=!1,this.routerDirection="forward",this.show=!1,this.translucent=!1,this.type="button",this.onFocus=function(){o.ionFocus.emit()},this.onBlur=function(){o.ionBlur.emit()},this.ionFocus=(0,n.c)(this,"ionFocus",7),this.ionBlur=(0,n.c)(this,"ionBlur",7)}return t.prototype.render=function(){var t,o=this,r=this,a=r.el,e=r.disabled,s=r.color,c=r.href,l=r.activated,b=r.show,u=r.translucent,d=r.size,f=(0,i.h)("ion-fab-list",a),p=(0,n.f)(this),h=void 0===c?"button":"a",g="button"===h?{type:this.type}:{download:this.download,href:c,rel:this.rel,target:this.target};return(0,n.h)(n.H,{"aria-disabled":e?"true":null,class:Object.assign(Object.assign({},(0,i.c)(s)),(t={},t[p]=!0,t["fab-button-in-list"]=f,t["fab-button-translucent-in-list"]=f&&u,t["fab-button-close-active"]=l,t["fab-button-show"]=b,t["fab-button-disabled"]=e,t["fab-button-translucent"]=u,t["ion-activatable"]=!0,t["ion-focusable"]=!0,t["fab-button-"+d]=void 0!==d,t))},(0,n.h)(h,Object.assign({},g,{class:"button-native",disabled:e,onFocus:this.onFocus,onBlur:this.onBlur,onClick:function(t){return(0,i.o)(c,t,o.routerDirection)}}),(0,n.h)("span",{class:"close-icon"},(0,n.h)("ion-icon",{name:"close",lazy:!1})),(0,n.h)("span",{class:"button-inner"},(0,n.h)("slot",null)),"md"===p&&(0,n.h)("ion-ripple-effect",null)))},Object.defineProperty(t.prototype,"el",{get:function(){return(0,n.d)(this)},enumerable:!0,configurable:!0}),Object.defineProperty(t,"style",{get:function(){return":host{--color-hover:var(--color);--background-hover:var(--ion-color-primary-tint,#4c8dff);--transition:background-color,opacity 100ms linear;--ripple-color:currentColor;--border-radius:50%;--border-width:0;--border-style:none;--border-color:initial;--padding-top:0;--padding-end:0;--padding-bottom:0;--padding-start:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;display:block;width:56px;height:56px;font-size:14px;text-align:center;text-overflow:ellipsis;text-transform:none;white-space:nowrap;-webkit-font-kerning:none;font-kerning:none}.button-native{border-radius:var(--border-radius);padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:block;position:relative;width:100%;height:100%;-webkit-transform:var(--transform);transform:var(--transform);-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);background-clip:padding-box;color:var(--color);-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);contain:strict;cursor:pointer;overflow:hidden;z-index:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;-webkit-box-sizing:border-box;box-sizing:border-box}@supports ((-webkit-margin-start:0) or (margin-inline-start:0)) or (-webkit-margin-start:0){.button-native{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.button-inner{left:0;right:0;top:0;display:-ms-flexbox;display:flex;position:absolute;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;height:100%;-webkit-transition:all .3s ease-in-out;transition:all .3s ease-in-out;-webkit-transition-property:opacity,-webkit-transform;transition-property:opacity,-webkit-transform;transition-property:transform,opacity;transition-property:transform,opacity,-webkit-transform}:host(.ion-color) .button-native{background:var(--ion-color-base);color:var(--ion-color-contrast)}:host(.fab-button-disabled){opacity:.5;pointer-events:none}:host(.fab-button-disabled) .button-native{cursor:default;pointer-events:none}@media (any-hover:hover){:host(:hover) .button-native{background:var(--background-hover);color:var(--color-hover)}:host(.ion-color:hover) .button-native{background:var(--ion-color-tint);color:var(--ion-color-contrast)}}:host(.ion-focused) .button-native{background:var(--background-focused);color:var(--color-focused)}:host(.ion-color.ion-focused) .button-native{background:var(--ion-color-shade)}:host(.activated) .button-native{background:var(--background-activated);color:var(--color-activated)}:host(.ion-color.activated) .button-native,:host(.ion-color.ion-focused) .button-native{background:var(--ion-color-shade);color:var(--ion-color-contrast)}::slotted(ion-icon){line-height:1}:host(.fab-button-small){margin-left:8px;margin-right:8px;margin-top:8px;margin-bottom:8px;width:40px;height:40px}@supports ((-webkit-margin-start:0) or (margin-inline-start:0)) or (-webkit-margin-start:0){:host(.fab-button-small){margin-left:unset;margin-right:unset;-webkit-margin-start:8px;margin-inline-start:8px;-webkit-margin-end:8px;margin-inline-end:8px}}.close-icon{left:0;right:0;top:0;display:-ms-flexbox;display:flex;position:absolute;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;height:100%;-webkit-transform:scale(.4) rotate(-45deg);transform:scale(.4) rotate(-45deg);-webkit-transition:all .3s ease-in-out;transition:all .3s ease-in-out;-webkit-transition-property:opacity,-webkit-transform;transition-property:opacity,-webkit-transform;transition-property:transform,opacity;transition-property:transform,opacity,-webkit-transform;opacity:0}:host(.fab-button-close-active) .close-icon{-webkit-transform:scale(1) rotate(0deg);transform:scale(1) rotate(0deg);opacity:1}:host(.fab-button-close-active) .button-inner{-webkit-transform:scale(.4) rotate(45deg);transform:scale(.4) rotate(45deg);opacity:0}ion-ripple-effect{color:var(--ripple-color)}@supports ((-webkit-backdrop-filter:blur(0)) or (backdrop-filter:blur(0))){:host(.fab-button-translucent) .button-native{-webkit-backdrop-filter:var(--backdrop-filter);backdrop-filter:var(--backdrop-filter)}}:host{--background:var(--ion-color-primary,#3880ff);--background-activated:var(--ion-color-primary-shade,#3171e0);--background-focused:var(--background-activated);--color:var(--ion-color-primary-contrast,#fff);--color-activated:var(--ion-color-primary-contrast,#fff);--color-focused:var(--color-activated);--transition:0.2s transform cubic-bezier(0.25,1.11,0.78,1.59)}:host,:host(.activated){--box-shadow:0 4px 16px rgba(0,0,0,0.12)}:host(.activated){--transform:scale(1.1);--transition:0.2s transform ease-out}.close-icon,::slotted(ion-icon){font-size:28px}:host(.fab-button-in-list){--background:var(--ion-color-light,#f4f5f8);--background-activated:var(--ion-color-light-shade,#d7d8da);--background-focused:var(--background-activated);--background-hover:var(--ion-color-light-tint,#f5f6f9);--color:var(--ion-color-light-contrast,#000);--color-activated:var(--ion-color-light-contrast,#000);--color-focused:var(--color-activated);--transition:transform 200ms ease 10ms,opacity 200ms ease 10ms}:host(.fab-button-in-list) ::slotted(ion-icon){font-size:18px}@supports ((-webkit-backdrop-filter:blur(0)) or (backdrop-filter:blur(0))){:host(.fab-button-translucent){--background:rgba(var(--ion-color-primary-rgb,56,128,255),0.9);--background-hover:rgba(var(--ion-color-primary-rgb,56,128,255),0.8);--background-focused:rgba(var(--ion-color-primary-rgb,56,128,255),0.82);--backdrop-filter:saturate(180%) blur(20px)}:host(.fab-button-translucent-in-list){--background:rgba(var(--ion-color-light-rgb,244,245,248),0.9);--background-hover:rgba(var(--ion-color-light-rgb,244,245,248),0.8);--background-focused:rgba(var(--ion-color-light-rgb,244,245,248),0.82)}}@supports ((-webkit-backdrop-filter:blur(0)) or (backdrop-filter:blur(0))){@media (any-hover:hover){:host(.fab-button-translucent.ion-color:hover) .button-native{background:rgba(var(--ion-color-base-rgb),.8)}}:host(.ion-color.fab-button-translucent) .button-native{background:rgba(var(--ion-color-base-rgb),.9)}:host(.ion-color.activated.fab-button-translucent) .button-native,:host(.ion-color.ion-focused.fab-button-translucent) .button-native{background:var(--ion-color-base)}}"},enumerable:!0,configurable:!0}),t}()},9114:(t,o,r)=>{r.d(o,{c:()=>i,g:()=>a,h:()=>n,o:()=>s});var n=function(t,o){return null!==o.closest(t)},i=function(t){var o;return"string"==typeof t&&t.length>0?((o={"ion-color":!0})["ion-color-"+t]=!0,o):void 0},a=function(t){var o={};return function(t){return void 0!==t?(Array.isArray(t)?t:t.split(" ")).filter((function(t){return null!=t})).map((function(t){return t.trim()})).filter((function(t){return""!==t})):[]}(t).forEach((function(t){return o[t]=!0})),o},e=/^[a-z][a-z0-9+\-.]*:/,s=function(t,o,r){return n=void 0,i=void 0,s=function(){var n;return function(t,o){var r,n,i,a,e={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return a={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function s(a){return function(s){return function(a){if(r)throw new TypeError("Generator is already executing.");for(;e;)try{if(r=1,n&&(i=2&a[0]?n.return:a[0]?n.throw||((i=n.return)&&i.call(n),0):n.next)&&!(i=i.call(n,a[1])).done)return i;switch(n=0,i&&(a=[2&a[0],i.value]),a[0]){case 0:case 1:i=a;break;case 4:return e.label++,{value:a[1],done:!1};case 5:e.label++,n=a[1],a=[0];continue;case 7:a=e.ops.pop(),e.trys.pop();continue;default:if(!((i=(i=e.trys).length>0&&i[i.length-1])||6!==a[0]&&2!==a[0])){e=0;continue}if(3===a[0]&&(!i||a[1]>i[0]&&a[1]<i[3])){e.label=a[1];break}if(6===a[0]&&e.label<i[1]){e.label=i[1],i=a;break}if(i&&e.label<i[2]){e.label=i[2],e.ops.push(a);break}i[2]&&e.ops.pop(),e.trys.pop();continue}a=o.call(t,e)}catch(t){a=[6,t],n=0}finally{r=i=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,s])}}}(this,(function(i){return null!=t&&"#"!==t[0]&&!e.test(t)&&(n=document.querySelector("ion-router"))?(null!=o&&o.preventDefault(),[2,n.push(t,r)]):[2,!1]}))},new((a=void 0)||(a=Promise))((function(t,o){function r(t){try{c(s.next(t))}catch(t){o(t)}}function e(t){try{c(s.throw(t))}catch(t){o(t)}}function c(o){o.done?t(o.value):new a((function(t){t(o.value)})).then(r,e)}c((s=s.apply(n,i||[])).next())}));var n,i,a,s}}}]);