import{useEffect,useRef,useState}from"react";import{loginGoogle}from"../../lib/finance";
declare global{interface Window{google?:any}}
export function FinanceLink({onLinked}:{onLinked:()=>void}){
 const ref=useRef<HTMLDivElement>(null),[err,setErr]=useState("");
 useEffect(()=>{const id=import.meta.env.VITE_GOOGLE_CLIENT_ID as string|undefined;if(!id){setErr("Falta VITE_GOOGLE_CLIENT_ID.");return}
  const init=()=>{window.google.accounts.id.initialize({client_id:id,callback:async(r:{credential:string})=>{try{await loginGoogle(r.credential);onLinked()}catch(e){setErr((e as Error).message)}}});window.google.accounts.id.renderButton(ref.current,{theme:"outline",size:"large",shape:"pill"})};
  if(window.google?.accounts){init();return}
  let s=document.querySelector<HTMLScriptElement>("script[data-gis]");if(!s){s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;s.dataset.gis="1";document.head.appendChild(s)}
  s.addEventListener("load",init);return()=>s!.removeEventListener("load",init)},[onLinked]);
 return<div className="space-y-2"><div ref={ref}/>{err&&<p role="alert" className="text-sm text-clay">{err}</p>}</div>}
