(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[177],{3247:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,44776,23)),Promise.resolve().then(r.t.bind(r,47218,23)),Promise.resolve().then(r.t.bind(r,30347,23)),Promise.resolve().then(r.bind(r,77208))},77208:(e,t,r)=>{"use strict";r.d(t,{ThemeProvider:()=>l});var n=r(95155),a=r(12115),s=r(67113);function l(e){let{children:t,...r}=e,[l,o]=a.useState(!1);return a.useEffect(()=>{o(!0)},[]),(0,n.jsx)(s.N,{...r,children:l?t:null})}},30347:()=>{},44776:e=>{e.exports={style:{fontFamily:"'Geist', 'Geist Fallback'",fontStyle:"normal"},className:"__className_4d318d",variable:"__variable_4d318d"}},47218:e=>{e.exports={style:{fontFamily:"'Geist Mono', 'Geist Mono Fallback'",fontStyle:"normal"},className:"__className_ea5f4b",variable:"__variable_ea5f4b"}},67113:(e,t,r)=>{"use strict";r.d(t,{D:()=>c,N:()=>d});var n=r(12115),a=(e,t,r,n,a,s,l,o)=>{let i=document.documentElement,m=["light","dark"];function c(t){(Array.isArray(e)?e:[e]).forEach(e=>{let r="class"===e,n=r&&s?a.map(e=>s[e]||e):a;r?(i.classList.remove(...n),i.classList.add(t)):i.setAttribute(e,t)}),o&&m.includes(t)&&(i.style.colorScheme=t)}if(n)c(n);else try{let e=localStorage.getItem(t)||r,n=l&&"system"===e?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e;c(n)}catch(e){}},s=["light","dark"],l="(prefers-color-scheme: dark)",o="undefined"==typeof window,i=n.createContext(void 0),m={setTheme:e=>{},themes:[]},c=()=>{var e;return null!=(e=n.useContext(i))?e:m},d=e=>n.useContext(i)?n.createElement(n.Fragment,null,e.children):n.createElement(h,{...e}),u=["light","dark"],h=e=>{let{forcedTheme:t,disableTransitionOnChange:r=!1,enableSystem:a=!0,enableColorScheme:o=!0,storageKey:m="theme",themes:c=u,defaultTheme:d=a?"system":"light",attribute:h="data-theme",value:p,children:g,nonce:w,scriptProps:S}=e,[_,E]=n.useState(()=>y(m,d)),[k,C]=n.useState(()=>y(m)),T=p?Object.values(p):c,N=n.useCallback(e=>{let t=e;if(!t)return;"system"===e&&a&&(t=v());let n=p?p[t]:t,l=r?b(w):null,i=document.documentElement,m=e=>{"class"===e?(i.classList.remove(...T),n&&i.classList.add(n)):e.startsWith("data-")&&(n?i.setAttribute(e,n):i.removeAttribute(e))};if(Array.isArray(h)?h.forEach(m):m(h),o){let e=s.includes(d)?d:null,r=s.includes(t)?t:e;i.style.colorScheme=r}null==l||l()},[w]),L=n.useCallback(e=>{let t="function"==typeof e?e(_):e;E(t);try{localStorage.setItem(m,t)}catch(e){}},[_]),P=n.useCallback(e=>{C(v(e)),"system"===_&&a&&!t&&N("system")},[_,t]);n.useEffect(()=>{let e=window.matchMedia(l);return e.addListener(P),P(e),()=>e.removeListener(P)},[P]),n.useEffect(()=>{let e=e=>{e.key===m&&(e.newValue?E(e.newValue):L(d))};return window.addEventListener("storage",e),()=>window.removeEventListener("storage",e)},[L]),n.useEffect(()=>{N(null!=t?t:_)},[t,_]);let A=n.useMemo(()=>({theme:_,setTheme:L,forcedTheme:t,resolvedTheme:"system"===_?k:_,themes:a?[...c,"system"]:c,systemTheme:a?k:void 0}),[_,L,t,k,a,c]);return n.createElement(i.Provider,{value:A},n.createElement(f,{forcedTheme:t,storageKey:m,attribute:h,enableSystem:a,enableColorScheme:o,defaultTheme:d,value:p,themes:c,nonce:w,scriptProps:S}),g)},f=n.memo(e=>{let{forcedTheme:t,storageKey:r,attribute:s,enableSystem:l,enableColorScheme:o,defaultTheme:i,value:m,themes:c,nonce:d,scriptProps:u}=e,h=JSON.stringify([s,r,i,t,c,m,l,o]).slice(1,-1);return n.createElement("script",{...u,suppressHydrationWarning:!0,nonce:"undefined"==typeof window?d:"",dangerouslySetInnerHTML:{__html:"(".concat(a.toString(),")(").concat(h,")")}})}),y=(e,t)=>{let r;if(!o){try{r=localStorage.getItem(e)||void 0}catch(e){}return r||t}},b=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},v=e=>(e||(e=window.matchMedia(l)),e.matches?"dark":"light")}},e=>{var t=t=>e(e.s=t);e.O(0,[614,441,517,358],()=>t(3247)),_N_E=e.O()}]);