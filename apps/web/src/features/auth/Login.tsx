import{useEffect,useRef,useState}from"react";import{login}from"../../lib/store";import{Card}from"../../ui";
declare global{interface Window{google?:any}}
export function Login(){
 const ref=useRef<HTMLDivElement>(null),[err,setErr]=useState("");
 useEffect(()=>{const id=import.meta.env.VITE_GOOGLE_CLIENT_ID as string|undefined;if(!id){setErr("Falta VITE_GOOGLE_CLIENT_ID.");return}
  const init=()=>{window.google.accounts.id.initialize({client_id:id,callback:(r:{credential:string})=>login(r.credential).catch(e=>setErr((e as Error).message))});window.google.accounts.id.renderButton(ref.current,{theme:"outline",size:"large",shape:"pill"})};
  if(window.google?.accounts){init();return}
  let s=document.querySelector<HTMLScriptElement>("script[data-gis]");if(!s){s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;s.dataset.gis="1";document.head.appendChild(s)}
  s.addEventListener("load",init);return()=>s!.removeEventListener("load",init)},[]);
 return<div className="grid min-h-screen place-items-center px-4"><Card className="rise w-full max-w-sm space-y-5 p-8 text-center"><h1 className="text-4xl font-bold">Homy</h1>
  <p className="text-sm text-slate">Entra con la misma cuenta de Google que usas en personal-finance.</p><div ref={ref} className="flex justify-center"/>{err&&<p role="alert" className="text-sm text-clay">{err}</p>}</Card></div>}
