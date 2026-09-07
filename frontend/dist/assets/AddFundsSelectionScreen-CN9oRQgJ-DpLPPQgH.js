import{o as e}from"./rolldown-runtime-C_s2cVnS.js";import{n as t,t as n}from"./jsx-runtime-CMaQg7dW.js";import{T as r,j as i}from"./useActiveWallet-VjArgHtb-CPBl4WmZ.js";import{k as a}from"./context-B7KCkUC--BM-2QSP-.js";import{S as o,g as s}from"./index-BgUETTyw-BoPcgnP4.js";import{t as c}from"./modal-context-NUXgh9GW-eQlrrOOV.js";import{t as l}from"./createLucideIcon-DmNNZQFn.js";import{t as u}from"./credit-card-Dc2lSkjL.js";import{c as d,i as f,l as p,v as m}from"./styles-B5IHPi7e-CykbPe5K.js";import{r as h}from"./styles-DVyDvTdj-C2GmDkpk.js";var g=l(`banknote`,[[`rect`,{width:`20`,height:`12`,x:`2`,y:`6`,rx:`2`,key:`9lu3g6`}],[`circle`,{cx:`12`,cy:`12`,r:`2`,key:`1c9p78`}],[`path`,{d:`M6 12h.01M18 12h.01`,key:`113zkx`}]]),_=n(),v=e(t(),1);i();var y={component:()=>{let e=o(),{onUserCloseViaDialogOrKeybindRef:t}=c(),n=a(),r=(0,v.useRef)(!1);(0,v.useEffect)((()=>{e&&(r.current=!1)}),[e]);let i=(0,v.useCallback)((async()=>{!r.current&&e&&(r.current=!0,s(),await e.onCancel())}),[e]);return(0,v.useEffect)((()=>(t.current=i,()=>{t.current===i&&(t.current=null)})),[i,t]),e?e.error?(0,_.jsx)(d,{icon:g,iconVariant:`warning`,title:`Unable to add funds`,subtitle:e.error,showClose:!0,onClose:i,primaryCta:{label:`Close`,onClick:i}}):(0,_.jsx)(d,{icon:g,iconVariant:`subtle`,title:`Select method`,subtitle:`Choose how to fund your wallet`,showClose:!0,onClose:i,children:(0,_.jsxs)(h,{style:{marginTop:`1rem`},$colorScheme:n.appearance.palette.colorScheme,children:[e.startFiat&&(0,_.jsxs)(f,{onClick:async()=>{r.current||(r.current=!0,await e.startFiat?.())},children:[(0,_.jsx)(b,{children:(0,_.jsx)(u,{})}),(0,_.jsxs)(x,{children:[(0,_.jsx)(p,{children:`Pay with fiat`}),(0,_.jsx)(S,{children:`Apple Pay, Google Pay, or debit card`})]})]}),e.startCrypto&&(0,_.jsxs)(f,{onClick:async()=>{r.current||(r.current=!0,await e.startCrypto?.())},children:[(0,_.jsx)(b,{children:(0,_.jsx)(m,{})}),(0,_.jsxs)(x,{children:[(0,_.jsx)(p,{children:`Transfer from wallet`}),(0,_.jsx)(S,{children:`Send crypto from any wallet`})]})]})]})}):null}},b=r.span`
  width: 2rem;
  height: 2rem;
  border-radius: var(--privy-border-radius-full);
  background-color: var(--privy-color-background-2);
  color: var(--color-icon-muted, #64668b);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`,x=r.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`,S=r.span`
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--privy-color-foreground-3);
`;export{y as AddFundsSelectionScreen,y as default};