
export default function appGlobal(n, x, w, d, r, h) {(function(Context, resourcesUrl){export default()=>{Context.store=(()=>{let t;return{getStore:()=>t,setStore:e=>{t=e},getState:()=>t&&t.getState(),mapDispatchToProps:(e,r)=>{Object.keys(r).forEach(o=>{const a=r[o];Object.defineProperty(e,o,{get:()=>(...e)=>t.dispatch(a(...e)),configurable:!0,enumerable:!0})})},mapStateToProps:(e,r)=>{const o=(o,a)=>{const s=r(t.getState());Object.keys(s).forEach(t=>{e[t]=s[t]})},a=t.subscribe(()=>o());return o(),a}}})()};
})(x,r);
}