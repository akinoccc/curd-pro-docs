import{g as w,k as me,O as $e,m as ve,p as O,q as G,x as ne,y as V,d as A,l as m,z as J,f as H,h as pe,P as q,E as W,C as D,F as ge,Q as je,R as Pe,G as ye,S as we,T as se,B as E,U as xe,V as Se,W as ke,X as Ne,Y as ze,Z as ie,D as Te,_ as Be,e as M,w as R,u as k,a as F,j as re,c as K,I as Q,$ as I,a0 as le,K as ae,r as ce,J as Re,i as Oe,o as z,b as _e,a1 as de,a2 as ue}from"./index-CuDnTDmo.js";import{p as Ie,k as Ee,l as Le,u as Me,n as Fe,_ as Ve,e as He,f as We,g as Ae}from"./demo-schema-ee0Otrfg.js";import{u as fe}from"./mock-dicts-Do2PBsdN.js";function De(e,t){const s=me($e,null);return w(()=>e.hljs||(s==null?void 0:s.mergedHljsRef.value))}function Ue(e){const{textColor2:t,fontSize:s,fontWeightStrong:o,textColor3:r}=e;return{textColor:t,fontSize:s,fontWeightStrong:o,"mono-3":"#a0a1a7","hue-1":"#0184bb","hue-2":"#4078f2","hue-3":"#a626a4","hue-4":"#50a14f","hue-5":"#e45649","hue-5-2":"#c91243","hue-6":"#986801","hue-6-2":"#c18401",lineNumberTextColor:r}}const qe={common:ve,self:Ue},Ke=O([G("code",`
 font-size: var(--n-font-size);
 font-family: var(--n-font-family);
 `,[ne("show-line-numbers",`
 display: flex;
 `),V("line-numbers",`
 user-select: none;
 padding-right: 12px;
 text-align: right;
 transition: color .3s var(--n-bezier);
 color: var(--n-line-number-text-color);
 `),ne("word-wrap",[O("pre",`
 white-space: pre-wrap;
 word-break: break-all;
 `)]),O("pre",`
 margin: 0;
 line-height: inherit;
 font-size: inherit;
 font-family: inherit;
 `),O("[class^=hljs]",`
 color: var(--n-text-color);
 transition: 
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `)]),({props:e})=>{const t=`${e.bPrefix}code`;return[`${t} .hljs-comment,
 ${t} .hljs-quote {
 color: var(--n-mono-3);
 font-style: italic;
 }`,`${t} .hljs-doctag,
 ${t} .hljs-keyword,
 ${t} .hljs-formula {
 color: var(--n-hue-3);
 }`,`${t} .hljs-section,
 ${t} .hljs-name,
 ${t} .hljs-selector-tag,
 ${t} .hljs-deletion,
 ${t} .hljs-subst {
 color: var(--n-hue-5);
 }`,`${t} .hljs-literal {
 color: var(--n-hue-1);
 }`,`${t} .hljs-string,
 ${t} .hljs-regexp,
 ${t} .hljs-addition,
 ${t} .hljs-attribute,
 ${t} .hljs-meta-string {
 color: var(--n-hue-4);
 }`,`${t} .hljs-built_in,
 ${t} .hljs-class .hljs-title {
 color: var(--n-hue-6-2);
 }`,`${t} .hljs-attr,
 ${t} .hljs-variable,
 ${t} .hljs-template-variable,
 ${t} .hljs-type,
 ${t} .hljs-selector-class,
 ${t} .hljs-selector-attr,
 ${t} .hljs-selector-pseudo,
 ${t} .hljs-number {
 color: var(--n-hue-6);
 }`,`${t} .hljs-symbol,
 ${t} .hljs-bullet,
 ${t} .hljs-link,
 ${t} .hljs-meta,
 ${t} .hljs-selector-id,
 ${t} .hljs-title {
 color: var(--n-hue-2);
 }`,`${t} .hljs-emphasis {
 font-style: italic;
 }`,`${t} .hljs-strong {
 font-weight: var(--n-font-weight-strong);
 }`,`${t} .hljs-link {
 text-decoration: underline;
 }`]}]),Qe=Object.assign(Object.assign({},D.props),{language:String,code:{type:String,default:""},trim:{type:Boolean,default:!0},hljs:Object,uri:Boolean,inline:Boolean,wordWrap:Boolean,showLineNumbers:Boolean,internalFontSize:Number,internalNoHighlight:Boolean}),ct=A({name:"Code",props:Qe,setup(e,{slots:t}){const{internalNoHighlight:s}=e,{mergedClsPrefixRef:o,inlineThemeDisabled:r}=J(),i=H(null),x=s?{value:void 0}:De(e),c=(a,v,p)=>{const{value:b}=x;return!b||!(a&&b.getLanguage(a))?null:b.highlight(p?v.trim():v,{language:a}).value},l=w(()=>e.inline||e.wordWrap?!1:e.showLineNumbers),d=()=>{if(t.default)return;const{value:a}=i;if(!a)return;const{language:v}=e,p=e.uri?window.decodeURIComponent(e.code):e.code;if(v){const j=c(v,p,e.trim);if(j!==null){if(e.inline)a.innerHTML=j;else{const T=a.querySelector(".__code__");T&&a.removeChild(T);const n=document.createElement("pre");n.className="__code__",n.innerHTML=j,a.appendChild(n)}return}}if(e.inline){a.textContent=p;return}const b=a.querySelector(".__code__");if(b)b.textContent=p;else{const j=document.createElement("pre");j.className="__code__",j.textContent=p,a.innerHTML="",a.appendChild(j)}};pe(d),q(W(e,"language"),d),q(W(e,"code"),d),s||q(x,d);const f=D("Code","-code",Ke,qe,e,o),$=w(()=>{const{common:{cubicBezierEaseInOut:a,fontFamilyMono:v},self:{textColor:p,fontSize:b,fontWeightStrong:j,lineNumberTextColor:T,"mono-3":n,"hue-1":g,"hue-2":C,"hue-3":h,"hue-4":P,"hue-5":S,"hue-5-2":B,"hue-6":N,"hue-6-2":L}}=f.value,{internalFontSize:_}=e;return{"--n-font-size":_?`${_}px`:b,"--n-font-family":v,"--n-font-weight-strong":j,"--n-bezier":a,"--n-text-color":p,"--n-mono-3":n,"--n-hue-1":g,"--n-hue-2":C,"--n-hue-3":h,"--n-hue-4":P,"--n-hue-5":S,"--n-hue-5-2":B,"--n-hue-6":N,"--n-hue-6-2":L,"--n-line-number-text-color":T}}),u=r?ge("code",w(()=>`${e.internalFontSize||"a"}`),$,e):void 0;return{mergedClsPrefix:o,codeRef:i,mergedShowLineNumbers:l,lineNumbers:w(()=>{let a=1;const v=[];let p=!1;for(const b of e.code)b===`
`?(p=!0,v.push(a++)):p=!1;return p||v.push(a++),v.join(`
`)}),cssVars:r?void 0:$,themeClass:u==null?void 0:u.themeClass,onRender:u==null?void 0:u.onRender}},render(){var e,t;const{mergedClsPrefix:s,wordWrap:o,mergedShowLineNumbers:r,onRender:i}=this;return i==null||i(),m("code",{class:[`${s}-code`,this.themeClass,o&&`${s}-code--word-wrap`,r&&`${s}-code--show-line-numbers`],style:this.cssVars,ref:"codeRef"},r?m("pre",{class:`${s}-code__line-numbers`},this.lineNumbers):null,(t=(e=this.$slots).default)===null||t===void 0?void 0:t.call(e))}}),Ge={iconSize:"22px"};function Je(e){const{fontSize:t,warningColor:s}=e;return Object.assign(Object.assign({},Ge),{fontSize:t,iconColor:s})}const Xe=je({name:"Popconfirm",common:ve,peers:{Button:Pe,Popover:Ie},self:Je}),be=ye("n-popconfirm"),Ce={positiveText:String,negativeText:String,showIcon:{type:Boolean,default:!0},onPositiveClick:{type:Function,required:!0},onNegativeClick:{type:Function,required:!0}},he=we(Ce),Ye=A({name:"NPopconfirmPanel",props:Ce,setup(e){const{localeRef:t}=fe("Popconfirm"),{inlineThemeDisabled:s}=J(),{mergedClsPrefixRef:o,mergedThemeRef:r,props:i}=me(be),x=w(()=>{const{common:{cubicBezierEaseInOut:l},self:{fontSize:d,iconSize:f,iconColor:$}}=r.value;return{"--n-bezier":l,"--n-font-size":d,"--n-icon-size":f,"--n-icon-color":$}}),c=s?ge("popconfirm-panel",void 0,x,i):void 0;return Object.assign(Object.assign({},fe("Popconfirm")),{mergedClsPrefix:o,cssVars:s?void 0:x,localizedPositiveText:w(()=>e.positiveText||t.value.positiveText),localizedNegativeText:w(()=>e.negativeText||t.value.negativeText),positiveButtonProps:W(i,"positiveButtonProps"),negativeButtonProps:W(i,"negativeButtonProps"),handlePositiveClick(l){e.onPositiveClick(l)},handleNegativeClick(l){e.onNegativeClick(l)},themeClass:c==null?void 0:c.themeClass,onRender:c==null?void 0:c.onRender})},render(){var e;const{mergedClsPrefix:t,showIcon:s,$slots:o}=this,r=se(o.action,()=>this.negativeText===null&&this.positiveText===null?[]:[this.negativeText!==null&&m(E,Object.assign({size:"small",onClick:this.handleNegativeClick},this.negativeButtonProps),{default:()=>this.localizedNegativeText}),this.positiveText!==null&&m(E,Object.assign({size:"small",type:"primary",onClick:this.handlePositiveClick},this.positiveButtonProps),{default:()=>this.localizedPositiveText})]);return(e=this.onRender)===null||e===void 0||e.call(this),m("div",{class:[`${t}-popconfirm__panel`,this.themeClass],style:this.cssVars},xe(o.default,i=>s||i?m("div",{class:`${t}-popconfirm__body`},s?m("div",{class:`${t}-popconfirm__icon`},se(o.icon,()=>[m(Se,{clsPrefix:t},{default:()=>m(ke,null)})])):null,i):null),r?m("div",{class:[`${t}-popconfirm__action`]},r):null)}}),Ze=G("popconfirm",[V("body",`
 font-size: var(--n-font-size);
 display: flex;
 align-items: center;
 flex-wrap: nowrap;
 position: relative;
 `,[V("icon",`
 display: flex;
 font-size: var(--n-icon-size);
 color: var(--n-icon-color);
 transition: color .3s var(--n-bezier);
 margin: 0 8px 0 0;
 `)]),V("action",`
 display: flex;
 justify-content: flex-end;
 `,[O("&:not(:first-child)","margin-top: 8px"),G("button",[O("&:not(:last-child)","margin-right: 8px;")])])]),et=Object.assign(Object.assign(Object.assign({},D.props),Le),{positiveText:String,negativeText:String,showIcon:{type:Boolean,default:!0},trigger:{type:String,default:"click"},positiveButtonProps:Object,negativeButtonProps:Object,onPositiveClick:Function,onNegativeClick:Function}),tt=A({name:"Popconfirm",props:et,slots:Object,__popover__:!0,setup(e){const{mergedClsPrefixRef:t}=J(),s=D("Popconfirm","-popconfirm",Ze,Xe,e,t),o=H(null);function r(c){var l;if(!(!((l=o.value)===null||l===void 0)&&l.getMergedShow()))return;const{onPositiveClick:d,"onUpdate:show":f}=e;Promise.resolve(d?d(c):!0).then($=>{var u;$!==!1&&((u=o.value)===null||u===void 0||u.setShow(!1),f&&ie(f,!1))})}function i(c){var l;if(!(!((l=o.value)===null||l===void 0)&&l.getMergedShow()))return;const{onNegativeClick:d,"onUpdate:show":f}=e;Promise.resolve(d?d(c):!0).then($=>{var u;$!==!1&&((u=o.value)===null||u===void 0||u.setShow(!1),f&&ie(f,!1))})}return Te(be,{mergedThemeRef:s,mergedClsPrefixRef:t,props:e}),{setShow(c){var l;(l=o.value)===null||l===void 0||l.setShow(c)},syncPosition(){var c;(c=o.value)===null||c===void 0||c.syncPosition()},mergedTheme:s,popoverInstRef:o,handlePositiveClick:r,handleNegativeClick:i}},render(){const{$slots:e,$props:t,mergedTheme:s}=this;return m(Ee,Object.assign({},Ne(t,he),{theme:s.peers.Popover,themeOverrides:s.peerOverrides.Popover,internalExtraClass:["popconfirm"],ref:"popoverInstRef"}),{trigger:e.trigger,default:()=>{const o=ze(t,he);return m(Ye,Object.assign({},o,{onPositiveClick:this.handlePositiveClick,onNegativeClick:this.handleNegativeClick}),e)}})}}),ot={class:"fcurd-page__toolbar"},nt={key:0,class:"fcurd-page__search"},st={key:1,class:"fcurd-page__before-table"},it={class:"fcurd-page__table"},dt=A({__name:"NaiveAutoCrud",props:{adapter:{},fields:{},tableColumns:{},searchFields:{},dictApi:{},disableSearch:{type:Boolean},disableAdd:{type:Boolean},disableEdit:{type:Boolean},disableDelete:{type:Boolean},disableExport:{type:Boolean},formMode:{},showSelection:{type:Boolean,default:!1},showActionsColumn:{type:Boolean,default:!0},ui:{}},emits:["formModelReady","submit","success","error","open","close"],setup(e,{expose:t,emit:s}){const o=e,r=s,i=Me({adapter:o.adapter}),x=Be(),c=w(()=>Object.keys(x).filter(n=>n!=="row-actions")),l=w(()=>Object.keys(x).filter(n=>n.startsWith("field-")||n.startsWith("field_")));pe(()=>{i.refresh()}),t({crud:i,refresh:i.refresh,setQuery:i.setQuery});const d=H(!1),f=H(null);w(()=>f.value?"edit":"create");const $=n=>o.disableEdit?null:m(E,{tertiary:!0,size:"small",onClick:()=>v(n.row)},{default:()=>"编辑"}),u=n=>{if(o.disableDelete||!o.adapter.remove)return null;const C=(o.adapter.getId??(h=>h==null?void 0:h.id))(n.row);return m(tt,{onPositiveClick:()=>{var h,P;(P=(h=o.adapter).remove)==null||P.call(h,C).then(()=>i.refresh()).catch(S=>{r("error",S)})}},{trigger:()=>m(E,{tertiary:!0,type:"error",size:"small"},{default:()=>"删除"}),default:()=>"确定要删除这条记录吗？"})};function a(){f.value=null,d.value=!0}function v(n){f.value=n,d.value=!0}function p(){d.value=!1}async function b(n){const{mode:g,data:C}=n;r("submit",n);try{const h={...C??{}};if(g==="create"&&o.adapter.create){const P=await o.adapter.create(h);r("success",{mode:g,data:P})}if(g==="edit"&&o.adapter.update){const P=o.adapter.getId??(N=>N==null?void 0:N.id),S=f.value?P(f.value):void 0;if(S===void 0)throw new Error("无法获取要更新的记录 ID");const B=await o.adapter.update(S,h);r("success",{mode:g,data:B})}await i.refresh(),d.value=!1}catch(h){r("error",h)}}function j(n){r("open",n.mode,n.row??null)}function T(n,g){r("formModelReady",n,g)}return(n,g)=>(z(),M(k(Ve),{crud:k(i),fields:e.fields,columns:e.tableColumns,"control-map":k(Fe),"dict-api":e.dictApi,"get-id":e.adapter.getId??(C=>C==null?void 0:C.id)},{default:R(()=>[F(k(Oe),null,{default:R(()=>{var C,h,P,S,B,N,L,_,X,Y,Z,ee,te,oe;return[re("section",ot,[I(n.$slots,"toolbar",{crud:k(i),openCreate:a},()=>[e.disableAdd?Q("",!0):(z(),M(k(E),{key:0,type:"primary",onClick:a},{default:R(()=>[...g[1]||(g[1]=[_e(" 新增 ",-1)])]),_:1}))])]),e.disableSearch?Q("",!0):(z(),K("section",nt,[F(He,{fields:e.searchFields||e.fields,"form-props":(h=(C=e.ui)==null?void 0:C.search)==null?void 0:h.formProps},null,8,["fields","form-props"])])),n.$slots.beforeTable?(z(),K("section",st,[I(n.$slots,"beforeTable",{crud:k(i)})])):Q("",!0),re("section",it,[F(We,{columns:e.tableColumns,"show-selection":e.showSelection,"show-actions-column":e.showActionsColumn,"data-table-props":(S=(P=e.ui)==null?void 0:P.table)==null?void 0:S.dataTableProps,"pagination-props":(N=(B=e.ui)==null?void 0:B.table)==null?void 0:N.paginationProps},le({"row-actions":R(({row:y})=>[n.$slots["row-actions"]?I(n.$slots,"row-actions",{key:0,row:y,openEdit:v,defaultActions:{Edit:$,Delete:u},crud:k(i),refresh:k(i).refresh}):(z(),K(Re,{key:1},[(z(),M(ce($),{row:y},null,8,["row"])),(z(),M(ce(u),{row:y},null,8,["row"]))],64))]),_:2},[ae(c.value,y=>({name:y,fn:R(U=>[I(n.$slots,y,de(ue(U)))])}))]),1032,["columns","show-selection","show-actions-column","data-table-props","pagination-props"])]),F(Ae,{modelValue:d.value,"onUpdate:modelValue":g[0]||(g[0]=y=>d.value=y),row:f.value,fields:e.fields,"form-mode":e.formMode,"reset-on-close":!0,"form-props":(_=(L=e.ui)==null?void 0:L.form)==null?void 0:_.formProps,"modal-props":(Y=(X=e.ui)==null?void 0:X.form)==null?void 0:Y.modalProps,"drawer-props":(ee=(Z=e.ui)==null?void 0:Z.form)==null?void 0:ee.drawerProps,"drawer-content-props":(oe=(te=e.ui)==null?void 0:te.form)==null?void 0:oe.drawerContentProps,onSubmit:b,onClose:p,onOpen:j,onFormModelReady:T},le({_:2},[ae(l.value,y=>({name:y,fn:R(U=>[I(n.$slots,y,de(ue(U)))])}))]),1032,["modelValue","row","fields","form-mode","form-props","modal-props","drawer-props","drawer-content-props"])]}),_:3})]),_:3},8,["crud","fields","columns","control-map","dict-api","get-id"]))}});export{ct as N,dt as _};
