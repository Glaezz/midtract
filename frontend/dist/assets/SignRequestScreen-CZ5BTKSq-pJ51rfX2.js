import{o as e}from"./rolldown-runtime-C_s2cVnS.js";import{n as t,t as n}from"./jsx-runtime-CMaQg7dW.js";import{Mt as r,T as i,V as a,Vt as o,W as s,j as c,un as l}from"./useActiveWallet-VjArgHtb-CPBl4WmZ.js";import{b as u,l as d}from"./context-B7KCkUC--BM-2QSP-.js";import{In as f,wn as p}from"./localBatchGatewayRequest-DTVhgVjy.js";import{i as m}from"./dist-B4Etsije.js";import{t as h}from"./modal-context-NUXgh9GW-eQlrrOOV.js";import{t as g}from"./createLucideIcon-DmNNZQFn.js";import{t as _}from"./ScreenLayout-rsaLrlHW-BxjuAXF-.js";import{t as v}from"./Layouts-BlFm53ED-BxgOrCTx.js";import{t as y}from"./CopyToClipboard-DSTf_eKU-By8KEayN.js";import{n as b,t as x}from"./JsonTree-aPaJmPx7-C6a88vEq.js";var S=g(`square-pen`,[[`path`,{d:`M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7`,key:`1m0v6g`}],[`path`,{d:`M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z`,key:`ohrbg2`}]]),C=n(),w=e(t(),1);c();var T=i.img`
  && {
    height: ${e=>e.size===`sm`?`65px`:`140px`};
    width: ${e=>e.size===`sm`?`65px`:`140px`};
    border-radius: 16px;
    margin-bottom: 12px;
  }
`,E=e=>{if(!f(e))return e;try{let t=p(e);return t.includes(`�`)?e:t}catch{return e}},D=e=>{try{let t=m.decode(e),n=new TextDecoder().decode(t);return n.includes(`�`)?e:n}catch{return e}},O=e=>{let{types:t,primaryType:n,...r}=e.typedData;return(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(N,{data:r}),(0,C.jsx)(y,{text:(i=e.typedData,JSON.stringify(i,null,2)),itemName:`full payload to clipboard`}),` `]});var i},k=({method:e,messageData:t,copy:n,iconUrl:r,isLoading:i,success:a,walletProxyIsLoading:o,errorMessage:s,isCancellable:c,onSign:l,onCancel:u,onClose:d})=>(0,C.jsx)(_,{title:n.title,subtitle:n.description,showClose:!0,onClose:d,icon:S,iconVariant:`subtle`,helpText:s?(0,C.jsx)(M,{children:s}):void 0,primaryCta:{label:n.buttonText,onClick:l,disabled:i||a||o,loading:i},secondaryCta:c?{label:`Not now`,onClick:u,disabled:i||a||o}:void 0,watermark:!0,children:(0,C.jsxs)(v,{children:[r?(0,C.jsx)(T,{style:{alignSelf:`center`},size:`sm`,src:r,alt:`app image`}):null,(0,C.jsxs)(j,{children:[e===`personal_sign`&&(0,C.jsx)(P,{children:E(t)}),e===`eth_signTypedData_v4`&&(0,C.jsx)(O,{typedData:t}),e===`solana_signMessage`&&(0,C.jsx)(P,{children:D(t)})]})]})}),A={component:()=>{let{authenticated:e}=r(),{initializeWalletProxy:t,closePrivyModal:n}=o(),{navigate:i,data:c,onUserCloseViaDialogOrKeybindRef:f}=h(),[p,m]=(0,w.useState)(!0),[g,_]=(0,w.useState)(``),[v,y]=(0,w.useState)(),[b,x]=(0,w.useState)(null),[S,T]=(0,w.useState)(!1);(0,w.useEffect)((()=>{e||i(`LandingScreen`)}),[e]),(0,w.useEffect)((()=>{t(d).then((e=>{m(!1),e||(_(`An error has occurred, please try again.`),y(new s(new a(g,l.E32603_DEFAULT_INTERNAL_ERROR.eipCode))))}))}),[]);let{method:E,data:D,confirmAndSign:O,onSuccess:A,onFailure:j,uiOptions:M}=c.signMessage,N={title:M?.title||`Sign message`,description:M?.description||`Signing this message will not cost you any fees.`,buttonText:M?.buttonText||`Sign and continue`},P=e=>{e?A(e):j(v||new s(new a(`The user rejected the request.`,l.E4001_USER_REJECTED_REQUEST.eipCode))),n({shouldCallAuthOnSuccess:!1}),setTimeout((()=>{x(null),_(``),y(void 0)}),200)};return f.current=()=>{P(b)},(0,C.jsx)(k,{method:E,messageData:D,copy:N,iconUrl:M?.iconUrl&&typeof M.iconUrl==`string`?M.iconUrl:void 0,isLoading:S,success:b!==null,walletProxyIsLoading:p,errorMessage:g,isCancellable:M?.isCancellable,onSign:async()=>{T(!0),_(``);try{let e=await O();x(e),T(!1),setTimeout((()=>{P(e)}),u)}catch(e){console.error(e),_(`An error has occurred, please try again.`),y(new s(new a(g,l.E32603_DEFAULT_INTERNAL_ERROR.eipCode))),T(!1)}},onCancel:()=>P(null),onClose:()=>P(b)})}},j=i.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,M=i.p`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-error-dark);
    font-size: 14px;
    line-height: 22px;
  }
`,N=i(x)`
  margin-top: 0;
`,P=i(b)`
  margin-top: 0;
`;export{A as SignRequestScreen,A as default,k as SignRequestView};