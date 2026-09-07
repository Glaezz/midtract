import{o as e,r as t}from"./rolldown-runtime-C_s2cVnS.js";import{n,t as r}from"./jsx-runtime-CMaQg7dW.js";import{Mt as i,St as a,T as o,Vt as s,_t as c,g as l,j as u,w as d}from"./useActiveWallet-VjArgHtb-CPBl4WmZ.js";import"./context-B7KCkUC--BM-2QSP-.js";import{t as f}from"./modal-context-NUXgh9GW-eQlrrOOV.js";import{o as p}from"./usePrivy-D-9TsA1m-BJaRJyEH.js";import{t as m}from"./createLucideIcon-DmNNZQFn.js";import{t as h}from"./circle-check-big-BR2wXS_n.js";import{t as g}from"./fingerprint-pattern-Cp7j1QKS.js";import{t as _}from"./ScreenLayout-rsaLrlHW-BxjuAXF-.js";import{n as v,t as y}from"./TodoList-CgrU7uwu-CaeZXtMC.js";var b=m(`trash-2`,[[`path`,{d:`M10 11v6`,key:`nco0om`}],[`path`,{d:`M14 11v6`,key:`outv1u`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`,key:`miytrc`}],[`path`,{d:`M3 6h18`,key:`d0wm0j`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`,key:`e791ji`}]]),x=t({DoubleIconWrapper:()=>M,LinkButton:()=>P,LinkPasskeyScreen:()=>j,LinkPasskeyView:()=>w,default:()=>j}),S=r(),C=e(n(),1);u();var w=({passkeys:e,name:t,isLoading:n,errorReason:r,success:i,expanded:a,onLinkPasskey:o,onUnlinkPasskey:s,onExpand:c,onBack:l,onClose:u})=>i?(0,S.jsx)(_,{title:`Passkeys updated`,icon:h,iconVariant:`success`,primaryCta:{label:`Done`,onClick:u},onClose:u,watermark:!0}):a?(0,S.jsx)(_,{icon:g,title:`Your passkeys`,onBack:l,onClose:u,watermark:!0,children:(0,S.jsx)(k,{passkeys:e,expanded:a,onUnlink:s,onExpand:c})}):(0,S.jsxs)(_,{icon:g,title:`Set up passkey verification`,subtitle:`Verify with passkey`,primaryCta:{label:`Add new passkey`,onClick:o,loading:n},onClose:u,watermark:!0,helpText:r||void 0,children:[e.length===0?(0,S.jsx)(A,{}):(0,S.jsx)(T,{children:(0,S.jsx)(k,{passkeys:e,expanded:a,onUnlink:s,onExpand:c})}),t?(0,S.jsxs)(E,{children:[(0,S.jsx)(D,{children:`New Passkey Name`}),(0,S.jsx)(O,{children:t})]}):null]}),T=o.div`
  margin-bottom: 0.75rem;
`,E=o.div`
  margin-top: 0.25rem;
`,D=o.div`
  color: var(--privy-color-foreground-2);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
  margin-bottom: 0.25rem;
`,O=o.div`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  line-height: 1.25rem;
`,k=({passkeys:e,expanded:t,onUnlink:n,onExpand:r})=>{let[i,a]=(0,C.useState)([]),o=t?e.length:2;return(0,S.jsxs)(`div`,{children:[(0,S.jsx)(I,{children:`Your passkeys`}),(0,S.jsxs)(F,{children:[e.slice(0,o).map((e=>{return(0,S.jsxs)(z,{children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(L,{children:(t=e,t.authenticatorName?t.createdWithBrowser?`${t.authenticatorName} on ${t.createdWithBrowser}`:t.authenticatorName:t.createdWithBrowser?t.createdWithOs?`${t.createdWithBrowser} on ${t.createdWithOs}`:`${t.createdWithBrowser}`:`Unknown device`)}),(0,S.jsxs)(R,{children:[`Last used:`,` `,(e.latestVerifiedAt??e.firstVerifiedAt)?.toLocaleString()??`N/A`]})]}),(0,S.jsx)(V,{disabled:i.includes(e.credentialId),onClick:()=>(async e=>{a((t=>t.concat([e]))),await n(e),a((t=>t.filter((t=>t!==e))))})(e.credentialId),children:i.includes(e.credentialId)?(0,S.jsx)(l,{}):(0,S.jsx)(b,{size:16})})]},e.credentialId);var t})),e.length>2&&!t&&(0,S.jsx)(P,{onClick:r,children:`View all`})]})]})},A=()=>(0,S.jsxs)(y,{style:{color:`var(--privy-color-foreground)`},children:[(0,S.jsx)(v,{children:`Verify with Touch ID, Face ID, PIN, or hardware key`}),(0,S.jsx)(v,{children:`Takes seconds to set up and use`}),(0,S.jsx)(v,{children:`Use your passkey to verify transactions and login to your account`})]}),j={component:()=>{let{user:e}=i(),{unlink:t}=p(),{linkWithPasskey:n,closePrivyModal:r}=s(),{data:o}=f(),l=e?.linkedAccounts.filter((e=>e.type===`passkey`)),[u,d]=(0,C.useState)(!1),[m,h]=(0,C.useState)(``),[g,_]=(0,C.useState)(!1),[v,y]=(0,C.useState)(!1);return(0,C.useEffect)((()=>{l.length===0&&y(!1)}),[l.length]),(0,S.jsx)(w,{passkeys:l,name:o?.passkeyAuthModalData?.name,isLoading:u,errorReason:m,success:g,expanded:v,onLinkPasskey:()=>{d(!0),n({name:o?.passkeyAuthModalData?.name}).then((()=>_(!0))).catch((e=>{if(e instanceof a){if(e.privyErrorCode===c.CANNOT_LINK_MORE_OF_TYPE)return void h(`Cannot link more passkeys to account.`);if(e.privyErrorCode===c.PASSKEY_NOT_ALLOWED)return void h(`Passkey request timed out or rejected by user.`)}h(`Unknown error occurred.`)})).finally((()=>{d(!1)}))},onUnlinkPasskey:async e=>(d(!0),await t({credentialId:e}).then((()=>_(!0))).catch((e=>{e instanceof a&&e.privyErrorCode===c.MISSING_MFA_CREDENTIALS?h(`Cannot unlink a passkey enrolled in MFA`):h(`Unknown error occurred.`)})).finally((()=>{d(!1)}))),onExpand:()=>y(!0),onBack:()=>y(!1),onClose:()=>r()})}},M=o.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 90px;
  border-radius: 50%;
  svg + svg {
    margin-left: 12px;
  }
  > svg {
    z-index: 2;
    color: var(--privy-color-accent) !important;
    stroke: var(--privy-color-accent) !important;
    fill: var(--privy-color-accent) !important;
  }
`,N=d`
  && {
    width: 100%;
    font-size: 0.875rem;
    line-height: 1rem;

    /* Tablet and Up */
    @media (min-width: 440px) {
      font-size: 14px;
    }

    display: flex;
    gap: 12px;
    justify-content: center;

    padding: 6px 8px;
    background-color: var(--privy-color-background);
    transition: background-color 200ms ease;
    color: var(--privy-color-accent) !important;

    :focus {
      outline: none;
      box-shadow: none;
    }
  }
`,P=o.button`
  ${N}
`,F=o.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.8rem;
  padding: 0.5rem 0rem 0rem;
  flex-grow: 1;
  width: 100%;
`,I=o.div`
  line-height: 20px;
  height: 20px;
  font-size: 1em;
  font-weight: 450;
  display: flex;
  justify-content: flex-beginning;
  width: 100%;
`,L=o.div`
  font-size: 1em;
  line-height: 1.3em;
  font-weight: 500;
  color: var(--privy-color-foreground-2);
  padding: 0.2em 0;
`,R=o.div`
  font-size: 0.875rem;
  line-height: 1rem;
  color: #64668b;
  padding: 0.2em 0;
`,z=o.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1em;
  gap: 10px;
  font-size: 0.875rem;
  line-height: 1rem;
  text-align: left;
  border-radius: 8px;
  border: 1px solid #e2e3f0 !important;
  width: 100%;
  height: 5em;
`,B=d`
  :focus,
  :hover,
  :active {
    outline: none;
  }
  display: flex;
  width: 2em;
  height: 2em;
  justify-content: center;
  align-items: center;
  svg {
    color: var(--privy-color-error);
  }
  svg:hover {
    color: var(--privy-color-foreground-3);
  }
`,V=o.button`
  ${B}
`;export{P as n,x as r,M as t};