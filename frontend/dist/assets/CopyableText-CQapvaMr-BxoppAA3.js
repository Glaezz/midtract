import{o as e}from"./rolldown-runtime-C_s2cVnS.js";import{n as t,t as n}from"./jsx-runtime-CMaQg7dW.js";import{T as r}from"./useActiveWallet-VjArgHtb-CPBl4WmZ.js";import{t as i}from"./check-BM01T5vi.js";import{t as a}from"./copy-BkA8KqAF.js";var o=n(),s=e(t(),1),c=r.button`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;

  && {
    color: var(--privy-color-foreground);
    font-weight: 500;
  }

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`,l=r.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--privy-color-foreground-2);
`,u=r(i)`
  color: var(--privy-color-icon-success);
  flex-shrink: 0;
`,d=r(a)`
  color: var(--privy-color-icon-muted);
  flex-shrink: 0;
`;function f({children:e,iconOnly:t,value:n,hideCopyIcon:r,onCopy:i,iconSize:a=14,...f}){let[p,m]=(0,s.useState)(!1);return(0,o.jsxs)(c,{...f,onClick:()=>{navigator.clipboard.writeText(n||(typeof e==`string`?e:``)).then((()=>i?.())).catch(console.error),m(!0),setTimeout((()=>m(!1)),1500)},children:[e,` `,p?(0,o.jsxs)(l,{children:[(0,o.jsx)(u,{size:a}),` `,!t&&`Copied`]}):!r&&(0,o.jsx)(d,{size:a})]})}var p=({value:e,includeChildren:t,children:n,...r})=>{let[i,a]=(0,s.useState)(!1),f=()=>{navigator.clipboard.writeText(e).catch(console.error),a(!0),setTimeout((()=>a(!1)),1500)};return(0,o.jsxs)(o.Fragment,{children:[t?(0,o.jsx)(c,{...r,onClick:f,children:n}):(0,o.jsx)(o.Fragment,{children:n}),(0,o.jsx)(c,{...r,onClick:f,children:i?(0,o.jsx)(l,{children:(0,o.jsx)(u,{})}):(0,o.jsx)(d,{})})]})};export{f as n,p as t};