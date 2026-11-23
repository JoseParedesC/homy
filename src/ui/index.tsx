import type{ButtonHTMLAttributes,ReactNode}from"react";
export const Card=({children,className=""}:{children:ReactNode;className?:string})=><section className={`rounded-xl2 border border-line bg-surface shadow-soft ${className}`}>{children}</section>;
export const Btn=({tone="moss",className="",...p}:ButtonHTMLAttributes<HTMLButtonElement>&{tone?:"moss"|"ghost"|"clay"})=><button {...p} className={`btn ${tone} ${className}`}/>;
export const Avatar=({name}:{name:string})=><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-moss-light font-display font-bold text-moss">{name.slice(0,1).toUpperCase()}</span>;
export const Field=({label,children}:{label:string;children:ReactNode})=><label className="block space-y-1.5 text-sm font-medium text-slate">{label}{children}</label>;
export const Pts=({n}:{n:number})=><span className={`font-display font-bold tabular-nums ${n<0?"text-clay":"text-moss"}`}>{n>0?"+":""}{n} pts</span>;
export const money=(n:number)=>`$${n.toLocaleString("es-CO")}`;
