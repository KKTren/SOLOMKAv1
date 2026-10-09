import React, {useMemo, useRef, useState} from "react";

// Orthographic 3D projection in metres; no network or graphics driver required.
export default function Preview3D({objects,zones,field,bale}) {
  const [yaw,setYaw]=useState(-35),[tilt,setTilt]=useState(35),[zoom,setZoom]=useState(1);
  const [person,setPerson]=useState({x:field.w/2,y:field.h/2});
  const [focus,setFocus]=useState(null);
  const drag=useRef(null);
  const width=900,height=520;
  const scale=Math.min(760/Math.max(field.w,5),400/Math.max(field.h,5))*zoom;
  const a=yaw*Math.PI/180,e=tilt*Math.PI/180;
  const project=([x,y,z])=>{
    x-=focus?.x ?? field.w/2;y-=focus?.y ?? field.h/2;
    const u=x*Math.cos(a)-y*Math.sin(a),v=x*Math.sin(a)+y*Math.cos(a);
    return [width/2+u*scale,height/2+(v*Math.sin(e)-z*Math.cos(e))*scale,v*Math.cos(e)+z*Math.sin(e)];
  };
  const scene=useMemo(()=>{
    const faces=[];
    const face=(points,color)=>faces.push({points,color});
    const box=(x,y,z,w,d,h,rot=0,color="#e9d593")=>{
      const r=rot*Math.PI/180;
      const points=[[0,0,0],[w,0,0],[w,d,0],[0,d,0],[0,0,h],[w,0,h],[w,d,h],[0,d,h]].map(([u,v,t])=>[x+u*Math.cos(r)-v*Math.sin(r),y+u*Math.sin(r)+v*Math.cos(r),z+t]);
      [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].forEach((ids,i)=>face(ids.map(n=>points[n]),i===4?color:i%2?"#b09a62":color));
    };
    for(const o of Object.values(objects)) {
      const rot=o.rot||0,r=rot*Math.PI/180;
      const at=(u,v)=>[o.x+u*Math.cos(r)-v*Math.sin(r),o.y+u*Math.sin(r)+v*Math.cos(r)];
      if(o.t==="wallH"||o.t==="wallV") {
        // Bound geometry on very large maps without changing the wall footprint.
        const count=Math.ceil(o.l/bale.l-1e-9),detail=count*(o.tiers||1)<=400;
        const n=detail?count:1,levels=detail?(o.tiers||1):1;
        for(let k=0;k<levels;k++) for(let i=0;i<n;i++) {
          const along=detail?i*bale.l:0,len=detail?Math.min(bale.l,o.l-along):o.l;
          const [x,y]=at(o.t==="wallH"?along:0,o.t==="wallH"?0:along);
          box(x,y,k*bale.h,o.t==="wallH"?len:bale.t,o.t==="wallH"?bale.t:len,detail?bale.h:bale.h*(o.tiers||1),rot);
        }
      } else if(o.t==="column"||o.t==="stack") {
        for(let k=0;k<(o.tiers||1);k++) for(let j=0;j<(o.t==="stack"?2:1);j++) {
          const [x,y]=at(0,j*bale.t);box(x,y,k*bale.h,bale.l,bale.t,bale.h,rot);
        }
      } else if(o.t==="figA"||o.t==="figB") human(o.x,o.y,o.t==="figA"?"#2d5aa8":"#b03434");
      else if(o.t==="crate") box(o.x,o.y,0,1.2,0.8,0.3,rot,"#c99a5b");
      else if(o.t==="barrel") box(o.x,o.y,0,0.6,0.6,0.9,rot,"#657986");
      else if(o.t==="tire") box(o.x,o.y,0,0.7,0.7,0.25,rot,"#45454b");
      else if(o.t==="roll") box(o.x,o.y,0,1.6,1.6,1.6,rot);
      else if(o.t==="flag"||o.t==="light"||o.t==="bomb"||o.t==="skull") box(o.x,o.y,0,0.3,0.3,0.6,rot,"#db9f29");
    }
    function human(x,y,col) {
      // Feet at zero, top of head at exactly 1.80 m.
      box(x-0.21,y-0.12,0,0.16,0.24,0.85,0,col);
      box(x+0.05,y-0.12,0,0.16,0.24,0.85,0,col);
      box(x-0.24,y-0.14,0.85,0.48,0.28,0.6,0,col);
      box(x-0.37,y-0.1,0.85,0.13,0.2,0.58,0,col);
      box(x+0.24,y-0.1,0.85,0.13,0.2,0.58,0,col);
      box(x-0.15,y-0.15,1.45,0.3,0.3,0.35,0,"#edb996");
    }
    human(person.x,person.y,"#e36530");
    return faces;
  },[objects,bale.l,bale.t,bale.h,person]);
  const faces=scene.map(f=>{const ps=f.points.map(project);return {...f,poly:ps.map(p=>p.slice(0,2).join(",")).join(" "),depth:ps.reduce((s,p)=>s+p[2],0)/ps.length};}).sort((a,b)=>a.depth-b.depth);
  const polygon=points=>points.map(project).map(p=>p.slice(0,2).join(",")).join(" ");
  const range=(label,value,min,max,onChange)=><label style={{display:"flex",alignItems:"center",gap:6}}>{label}<input aria-label={label} type="range" value={value} min={min} max={max} step={0.1} onChange={e=>onChange(+e.target.value)}/></label>;
  return <div style={{display:"grid",gap:10}}>
    <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
      {range("Поворот",yaw,-180,180,setYaw)}{range("Наклон",tilt,5,85,setTilt)}{range("Приближение",zoom,0.3,12,setZoom)}
      <button onClick={()=>{setYaw(-35);setTilt(35);setZoom(1);setFocus(null);}}>Всё поле</button>
      <button onClick={()=>{setFocus({...person});setZoom(6);}}>К человеку</button>
    </div>
    <svg aria-label="Объёмная модель поля" viewBox={`0 0 ${width} ${height}`} style={{width:"100%",maxHeight:"58vh",background:"#dce7ed",touchAction:"none",cursor:"grab"}}
      onPointerDown={ev=>{ev.currentTarget.setPointerCapture(ev.pointerId);drag.current={x:ev.clientX,y:ev.clientY,yaw,tilt};}}
      onPointerMove={ev=>{if(drag.current){setYaw(drag.current.yaw+(ev.clientX-drag.current.x)*0.4);setTilt(Math.max(5,Math.min(85,drag.current.tilt+(ev.clientY-drag.current.y)*0.3)));}}}
      onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
      <polygon points={polygon([[0,0,0],[field.w,0,0],[field.w,field.h,0],[0,field.h,0]])} fill="#b8c8a0" stroke="#79876b"/>
      {Object.values(zones).map(z=><polygon key={z.id} points={polygon([[z.x,z.y,0],[z.x+z.w,z.y,0],[z.x+z.w,z.y+z.h,0],[z.x,z.y+z.h,0]])} fill={z.fill||"#c9d3b6"} opacity={0.4}/>)}
      {faces.map((f,i)=><polygon key={i} points={f.poly} fill={f.color} stroke="#514a36" strokeWidth={0.55}/>)}
      <text x={project([person.x,person.y,2.2])[0]} y={project([person.x,person.y,2.2])[1]} textAnchor="middle" fill="#9b350d" fontSize={14} stroke="white" strokeWidth={3} paintOrder="stroke">1,80 м</text>
    </svg>
    <div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"center"}}>
      <b>Человек для масштаба</b>
      {["x","y"].map(k=><label key={k}>{k.toUpperCase()}, м <input aria-label={`Человек ${k.toUpperCase()}`} type="number" step={0.5} value={person[k]} style={{width:80}} onChange={e=>{if(e.target.value!=="" && Number.isFinite(+e.target.value))setPerson(p=>({...p,[k]:+e.target.value}));}}/></label>)}
    </div>
    <div style={{fontSize:12}}>Вращайте мышью или пальцем. Тюк: {bale.l} × {bale.t} × {bale.h} м. Подложка остаётся в плане. Прочие предметы показаны условно; тюки и человек — в масштабе.</div>
  </div>;
}
