import{N as F,b as q,d as G,a as j,e as J,c as U}from"./mock-dicts-Do2PBsdN.js";import{m as Q,n as _,p as w,q as b,s as W,v as X,x as C,y as g,d as B,l as h,z as Y,A as Z,C as E,D as ee,E as oe,g as H,F as re,G as le,k as te,H as se,f as y,c as M,a as i,w as a,u as l,i as ie,b as u,N as x,j as S,B as P,t as k,e as L,I as ae,J as ne,K as de,o as z}from"./index-CuDnTDmo.js";import{u as ce}from"./use-message-kY66ze3r.js";function ue(o){const{textColor2:e,cardColor:s,modalColor:d,popoverColor:c,dividerColor:v,borderRadius:p,fontSize:t,hoverColor:f}=o;return{textColor:e,color:s,colorHover:f,colorModal:d,colorHoverModal:_(d,f),colorPopover:c,colorHoverPopover:_(c,f),borderColor:v,borderColorModal:_(d,v),borderColorPopover:_(c,v),borderRadius:p,fontSize:t}}const ve={common:Q,self:ue},pe=w([b("list",`
 --n-merged-border-color: var(--n-border-color);
 --n-merged-color: var(--n-color);
 --n-merged-color-hover: var(--n-color-hover);
 margin: 0;
 font-size: var(--n-font-size);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 padding: 0;
 list-style-type: none;
 color: var(--n-text-color);
 background-color: var(--n-merged-color);
 `,[C("show-divider",[b("list-item",[w("&:not(:last-child)",[g("divider",`
 background-color: var(--n-merged-border-color);
 `)])])]),C("clickable",[b("list-item",`
 cursor: pointer;
 `)]),C("bordered",`
 border: 1px solid var(--n-merged-border-color);
 border-radius: var(--n-border-radius);
 `),C("hoverable",[b("list-item",`
 border-radius: var(--n-border-radius);
 `,[w("&:hover",`
 background-color: var(--n-merged-color-hover);
 `,[g("divider",`
 background-color: transparent;
 `)])])]),C("bordered, hoverable",[b("list-item",`
 padding: 12px 20px;
 `),g("header, footer",`
 padding: 12px 20px;
 `)]),g("header, footer",`
 padding: 12px 0;
 box-sizing: border-box;
 transition: border-color .3s var(--n-bezier);
 `,[w("&:not(:last-child)",`
 border-bottom: 1px solid var(--n-merged-border-color);
 `)]),b("list-item",`
 position: relative;
 padding: 12px 0; 
 box-sizing: border-box;
 display: flex;
 flex-wrap: nowrap;
 align-items: center;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[g("prefix",`
 margin-right: 20px;
 flex: 0;
 `),g("suffix",`
 margin-left: 20px;
 flex: 0;
 `),g("main",`
 flex: 1;
 `),g("divider",`
 height: 1px;
 position: absolute;
 bottom: 0;
 left: 0;
 right: 0;
 background-color: transparent;
 transition: background-color .3s var(--n-bezier);
 pointer-events: none;
 `)])]),W(b("list",`
 --n-merged-color-hover: var(--n-color-hover-modal);
 --n-merged-color: var(--n-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `)),X(b("list",`
 --n-merged-color-hover: var(--n-color-hover-popover);
 --n-merged-color: var(--n-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `))]),fe=Object.assign(Object.assign({},E.props),{size:{type:String,default:"medium"},bordered:Boolean,clickable:Boolean,hoverable:Boolean,showDivider:{type:Boolean,default:!0}}),I=le("n-list"),me=B({name:"List",props:fe,slots:Object,setup(o){const{mergedClsPrefixRef:e,inlineThemeDisabled:s,mergedRtlRef:d}=Y(o),c=Z("List",d,e),v=E("List","-list",pe,ve,o,e);ee(I,{showDividerRef:oe(o,"showDivider"),mergedClsPrefixRef:e});const p=H(()=>{const{common:{cubicBezierEaseInOut:f},self:{fontSize:$,textColor:D,color:R,colorModal:N,colorPopover:n,borderColor:r,borderColorModal:m,borderColorPopover:V,borderRadius:A,colorHover:O,colorHoverModal:T,colorHoverPopover:K}}=v.value;return{"--n-font-size":$,"--n-bezier":f,"--n-text-color":D,"--n-color":R,"--n-border-radius":A,"--n-border-color":r,"--n-border-color-modal":m,"--n-border-color-popover":V,"--n-color-modal":N,"--n-color-popover":n,"--n-color-hover":O,"--n-color-hover-modal":T,"--n-color-hover-popover":K}}),t=s?re("list",void 0,p,o):void 0;return{mergedClsPrefix:e,rtlEnabled:c,cssVars:s?void 0:p,themeClass:t==null?void 0:t.themeClass,onRender:t==null?void 0:t.onRender}},render(){var o;const{$slots:e,mergedClsPrefix:s,onRender:d}=this;return d==null||d(),h("ul",{class:[`${s}-list`,this.rtlEnabled&&`${s}-list--rtl`,this.bordered&&`${s}-list--bordered`,this.showDivider&&`${s}-list--show-divider`,this.hoverable&&`${s}-list--hoverable`,this.clickable&&`${s}-list--clickable`,this.themeClass],style:this.cssVars},e.header?h("div",{class:`${s}-list__header`},e.header()):null,(o=e.default)===null||o===void 0?void 0:o.call(e),e.footer?h("div",{class:`${s}-list__footer`},e.footer()):null)}}),be=B({name:"ListItem",slots:Object,setup(){const o=te(I,null);return o||se("list-item","`n-list-item` must be placed in `n-list`."),{showDivider:o.showDividerRef,mergedClsPrefix:o.mergedClsPrefixRef}},render(){const{$slots:o,mergedClsPrefix:e}=this;return h("li",{class:`${e}-list-item`},o.prefix?h("div",{class:`${e}-list-item__prefix`},o.prefix()):null,o.default?h("div",{class:`${e}-list-item__main`},o):null,o.suffix?h("div",{class:`${e}-list-item__suffix`},o.suffix()):null,this.showDivider&&h("div",{class:`${e}-list-item__divider`}))}}),ge={style:{display:"flex","flex-direction":"column",gap:"12px"}},he={style:{display:"grid","grid-template-columns":"1fr",gap:"8px"}},xe={style:{display:"flex","justify-content":"space-between",gap:"12px",width:"100%"}},_e=B({__name:"dict-center-page",setup(o){const e=ce(),s=U(),d=J(s),c=y("status"),v=y([]),p=y(!1),t=y(null),f=y(null),$=H(()=>{const n=f.value;return n?new Date(n).toLocaleTimeString():"未加载"});async function D(){p.value=!0,t.value=null;try{const n=await d.load(c.value);v.value=n.options.value,t.value=n.error.value,f.value=Date.now(),t.value?e.warning("字典加载完成，但有错误（见下方 error）"):e.success(`已加载：${c.value}`)}catch(n){t.value=n,e.error(String((n==null?void 0:n.message)??n))}finally{p.value=!1}}function R(){d.invalidate(c.value),v.value=[],f.value=null,e.info(`已失效缓存：${c.value}`)}function N(){d.invalidate(),v.value=[],f.value=null,e.info("已清空全部缓存")}return(n,r)=>(z(),M("div",ge,[i(l(F),{type:"info",bordered:!1},{default:a(()=>[r[2]||(r[2]=u(" 这个页面直接演示 ",-1)),i(l(x),{code:""},{default:a(()=>[...r[1]||(r[1]=[u("createDictCenter",-1)])]),_:1}),r[3]||(r[3]=u(" 的缓存与失效能力（并发去重、按 key 缓存、invalidate）。 ",-1))]),_:1}),i(l(ie),null,{default:a(()=>[i(l(q),{size:8,align:"center"},{default:a(()=>[i(l(x),{depth:"3"},{default:a(()=>[...r[4]||(r[4]=[u("dictKey",-1)])]),_:1}),i(l(G),{value:c.value,"onUpdate:value":r[0]||(r[0]=m=>c.value=m),placeholder:"例如：status / category / role",style:{width:"260px"}},null,8,["value"]),i(l(P),{loading:p.value,type:"primary",onClick:D},{default:a(()=>[...r[5]||(r[5]=[u("加载",-1)])]),_:1},8,["loading"]),i(l(P),{disabled:p.value,onClick:R},{default:a(()=>[...r[6]||(r[6]=[u("失效当前 key",-1)])]),_:1},8,["disabled"]),i(l(P),{disabled:p.value,onClick:N},{default:a(()=>[...r[7]||(r[7]=[u("清空全部缓存",-1)])]),_:1},8,["disabled"]),i(l(j),{vertical:""}),i(l(x),{depth:"3"},{default:a(()=>[u("最近加载："+k($.value),1)]),_:1})]),_:1}),i(l(j),{style:{margin:"12px 0"}}),S("div",he,[t.value?(z(),L(l(x),{key:0,type:"error"},{default:a(()=>{var m;return[u("error: "+k(String(((m=t.value)==null?void 0:m.message)??t.value)),1)]}),_:1})):ae("",!0),i(l(me),{bordered:""},{header:a(()=>[u(" options（"+k(v.value.length)+"） ",1)]),default:a(()=>[(z(!0),M(ne,null,de(v.value,m=>(z(),L(l(be),{key:String(m.value)},{default:a(()=>[S("div",xe,[i(l(x),null,{default:a(()=>[u(k(m.label),1)]),_:2},1024),i(l(x),{depth:"3"},{default:a(()=>[u(k(String(m.value)),1)]),_:2},1024)])]),_:2},1024))),128))]),_:1})])]),_:1})]))}});export{_e as default};
