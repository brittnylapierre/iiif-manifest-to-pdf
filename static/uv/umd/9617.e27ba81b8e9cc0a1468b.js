"use strict";(self.webpackChunkUV=self.webpackChunkUV||[]).push([[9617],{7943:(n,i,e)=>{e.d(i,{s:()=>t});var t=function(n){try{if("string"!=typeof n||""===n)return n;var i=document.createDocumentFragment(),e=document.createElement("div");i.appendChild(e),e.innerHTML=n,s.forEach((function(n){for(var e=i.querySelectorAll(n),t=e.length-1;t>=0;t--){var l=e[t];l.parentNode?l.parentNode.removeChild(l):i.removeChild(l);for(var s=o(l),a=0;a<s.length;a++)r(s[a])}}));for(var t=o(i),l=0;l<t.length;l++)r(t[l]);var a=document.createElement("div");a.appendChild(i);var c=a.querySelector("div");return null!==c?c.innerHTML:a.innerHTML}catch(n){return console.error(n),""}},r=function(n){if(!n.nodeType||1===n.nodeType){for(var i=n.attributes.length-1;i>=0;i--){var e=n.attributes.item(i),t=e.name;if(l.includes(t.toLowerCase())){var s=e.value;null!=s&&s.toLowerCase().includes("javascript:")&&n.removeAttribute(t)}else n.removeAttribute(t)}var a=o(n);for(i=0;i<a.length;i++)r(a[i])}},o=function(n){return null!=n.children?n.children:n.childNodes},l=["class","id","href","src","name","slot"],s=["script","style","iframe","meta","link","object","embed"]},9617:(n,i,e)=>{e.r(i),e.d(i,{ion_infinite_scroll_content:()=>o});var t=e(2085),r=e(7943),o=function(){function n(n){(0,t.r)(this,n)}return n.prototype.componentDidLoad=function(){if(void 0===this.loadingSpinner){var n=(0,t.f)(this);this.loadingSpinner=t.i.get("infiniteLoadingSpinner",t.i.get("spinner","ios"===n?"lines":"crescent"))}},n.prototype.render=function(){var n,i=(0,t.f)(this);return(0,t.h)(t.H,{class:(n={},n[i]=!0,n["infinite-scroll-content-"+i]=!0,n)},(0,t.h)("div",{class:"infinite-loading"},this.loadingSpinner&&(0,t.h)("div",{class:"infinite-loading-spinner"},(0,t.h)("ion-spinner",{name:this.loadingSpinner})),this.loadingText&&(0,t.h)("div",{class:"infinite-loading-text",innerHTML:(0,r.s)(this.loadingText)})))},Object.defineProperty(n,"style",{get:function(){return"ion-infinite-scroll-content{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center;min-height:84px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.infinite-loading{margin-left:0;margin-right:0;margin-top:0;margin-bottom:32px;display:none;width:100%}.infinite-loading-text{margin-left:32px;margin-right:32px;margin-top:4px;margin-bottom:0}@supports ((-webkit-margin-start:0) or (margin-inline-start:0)) or (-webkit-margin-start:0){.infinite-loading-text{margin-left:unset;margin-right:unset;-webkit-margin-start:32px;margin-inline-start:32px;-webkit-margin-end:32px;margin-inline-end:32px}}.infinite-scroll-loading ion-infinite-scroll-content>.infinite-loading{display:block}.infinite-scroll-content-md .infinite-loading-text{color:var(--ion-color-step-600,#666)}.infinite-scroll-content-md .infinite-loading-spinner .spinner-crescent circle,.infinite-scroll-content-md .infinite-loading-spinner .spinner-lines-md line,.infinite-scroll-content-md .infinite-loading-spinner .spinner-lines-small-md line{stroke:var(--ion-color-step-600,#666)}.infinite-scroll-content-md .infinite-loading-spinner .spinner-bubbles circle,.infinite-scroll-content-md .infinite-loading-spinner .spinner-circles circle,.infinite-scroll-content-md .infinite-loading-spinner .spinner-dots circle{fill:var(--ion-color-step-600,#666)}"},enumerable:!0,configurable:!0}),n}()}}]);