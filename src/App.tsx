import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import {
  Activity, MapPin, Users, Trophy, Play, Pause, Square, Heart, Zap, TrendingUp,
  Plus, X, Flame, Bluetooth, BluetoothOff, Navigation, Search, Link2, QrCode,
  Phone, Radar, Copy, Check, Share2, ScanLine, MessageCircle, ThumbsUp, Award,
  Mountain, Target, Compass, Sparkles, ChevronRight, Send, Lock, Rss, UserPlus,
  Star, Crown, Calendar, MapPinned, User as UserIcon, ArrowLeft
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const HR_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
const HR_CHAR    = "00002a37-0000-1000-8000-00805f9b34fb";
const GPS_OPTIONS = { enableHighAccuracy:true, maximumAge:2000, timeout:10000 };

const INITIAL_FRIENDS = [
  { id:1, name:"Ahmad Razif",    avatar:"AR", color:"#FF6B6B", runs:{day:5.2,week:28.4,month:112.0,year:1340,all:4820} },
  { id:2, name:"Siti Nurhaliza", avatar:"SN", color:"#4ECDC4", runs:{day:3.8,week:22.1,month:89.5, year:980, all:3210} },
  { id:3, name:"Wei Liang",      avatar:"WL", color:"#45B7D1", runs:{day:7.1,week:35.6,month:140.2,year:1680,all:6540} },
  { id:4, name:"Priya Devi",     avatar:"PD", color:"#96CEB4", runs:{day:2.5,week:18.3,month:75.0, year:780, all:2100} },
  { id:5, name:"Haziq Amin",     avatar:"HA", color:"#FFEAA7", runs:{day:9.3,week:48.0,month:190.5,year:2100,all:8900} },
];

const FEED_DATA = [
  { id:1, user:"Haziq Amin", avatar:"HA", color:"#FFEAA7", time:"2h ago",
    title:"Morning Tempo Run 🌅", dist:10.2, dur:"48:20", pace:"4:44", elev:65,
    kudos:42, comments:8, isPR:true, prType:"5K PR" },
  { id:2, user:"Siti Nurhaliza", avatar:"SN", color:"#4ECDC4", time:"5h ago",
    title:"Hill Repeats 🔥", dist:6.5, dur:"42:10", pace:"6:29", elev:215,
    kudos:24, comments:5, isPR:false },
  { id:3, user:"Wei Liang", avatar:"WL", color:"#45B7D1", time:"Yesterday",
    title:"Sunday Long Run", dist:18.0, dur:"1:42:30", pace:"5:42", elev:120,
    kudos:67, comments:14, isPR:true, prType:"Longest run" },
  { id:4, user:"Ahmad Razif", avatar:"AR", color:"#FF6B6B", time:"Yesterday",
    title:"Easy recovery jog", dist:4.0, dur:"25:00", pace:"6:15", elev:30,
    kudos:11, comments:2, isPR:false },
  { id:5, user:"Priya Devi", avatar:"PD", color:"#96CEB4", time:"2 days ago",
    title:"Track Workout: 8x400m", dist:5.5, dur:"32:18", pace:"5:52", elev:5,
    kudos:18, comments:4, isPR:false },
];

const SEGMENTS = [
  { id:1, name:"Bukit Tabur East Ridge", dist:3.2, elev:180, location:"Selangor",
    yourPR:"18:45", yourRank:24, attempts:5832,
    leaders:[{n:"Asyraf Hassan",t:"12:18"},{n:"Mei Ling",t:"12:45"},{n:"Daniel Wong",t:"13:02"}] },
  { id:2, name:"KLCC Park Mile", dist:1.6, elev:8, location:"KL",
    yourPR:"7:08", yourRank:142, attempts:12480,
    leaders:[{n:"Iskandar Ali",t:"4:32"},{n:"Faridah K.",t:"4:48"},{n:"Tan Wei",t:"4:55"}] },
  { id:3, name:"Lake Gardens Loop", dist:5.8, elev:42, location:"KL",
    yourPR:"28:32", yourRank:67, attempts:8240,
    leaders:[{n:"Marcus Lee",t:"19:42"},{n:"Aiko Sato",t:"20:15"},{n:"Ramesh K.",t:"20:48"}] },
];

const ACHIEVEMENTS = [
  { id:1, name:"First 5K", icon:"🏃", earned:true, date:"Jan 12", color:"#4ECDC4" },
  { id:2, name:"10K Club", icon:"🏅", earned:true, date:"Feb 28", color:"#FFEAA7" },
  { id:3, name:"Half Marathon", icon:"🥇", earned:true, date:"Apr 15", color:"#FF6B6B" },
  { id:4, name:"Sub-5 Pace", icon:"⚡", earned:true, date:"Apr 22", color:"#a78bfa" },
  { id:5, name:"100km Month", icon:"💯", earned:true, date:"Apr 30", color:"#fd79a8" },
  { id:6, name:"Early Bird", icon:"🌅", earned:true, date:"May 5", color:"#fdcb6e" },
  { id:7, name:"Streak Master", icon:"🔥", earned:true, date:"May 18", color:"#FF6B6B" },
  { id:8, name:"Hill Crusher", icon:"⛰️", earned:false, color:"#96CEB4" },
  { id:9, name:"Marathon", icon:"🏆", earned:false, color:"#FFEAA7" },
  { id:10, name:"Sub-4 Pace", icon:"💨", earned:false, color:"#00d4ff" },
  { id:11, name:"Night Owl", icon:"🌙", earned:false, color:"#6c5ce7" },
  { id:12, name:"Globe Trotter", icon:"🌍", earned:false, color:"#4ECDC4" },
];

const CHALLENGES = [
  { id:1, name:"May 100K", desc:"Run 100km this month", goal:100, current:58.2,
    unit:"km", endDays:4, participants:1240, badge:"🏅", joined:true },
  { id:2, name:"10x10 Challenge", desc:"Run 10 times in 10 days", goal:10, current:7,
    unit:"runs", endDays:3, participants:520, badge:"🔟", joined:true },
  { id:3, name:"Elevation Hunter", desc:"Climb 1000m total this month", goal:1000, current:340,
    unit:"m", endDays:4, participants:340, badge:"⛰️", joined:false },
];

const CLUBS = [
  { id:1, name:"KL Runners", members:1240, color:"#FF6B6B", desc:"Largest running community in KL", joined:true },
  { id:2, name:"PJ Trail Squad", members:320, color:"#4ECDC4", desc:"Weekend trail runs around PJ", joined:false },
  { id:3, name:"Sub-5 Pace Club", members:84, color:"#a78bfa", desc:"For runners chasing sub-5min/km pace", joined:false },
  { id:4, name:"Bukit Tabur Hikers", members:560, color:"#96CEB4", desc:"Sunrise summit runs every weekend", joined:false },
];

const ROUTES = [
  { id:1, name:"KLCC Park Loop", dist:1.3, type:"Urban Park", uses:4520, rating:4.7, elev:8 },
  { id:2, name:"Lake Gardens Trail", dist:5.8, type:"Park", uses:3210, rating:4.8, elev:42 },
  { id:3, name:"Bukit Tabur Summit", dist:6.2, type:"Trail", uses:1840, rating:4.9, elev:380 },
  { id:4, name:"Putrajaya Lakeside", dist:8.5, type:"Lakeside", uses:2680, rating:4.6, elev:15 },
];

const MATCHES = [
  { id:1, name:"Sarah", age:27, avatar:"S", color:"#fd79a8",
    bio:"Half-marathon training. Love sunrise runs ☀️ Looking for weekend buddies & maybe more 😊",
    pace:"5:30", dist:8, area:"Bukit Tabur Area", away:1.2, compat:92,
    openTo:"Buddies & dating", goal:"Sub-2hr half marathon" },
  { id:2, name:"James", age:31, avatar:"J", color:"#74b9ff",
    bio:"Trail runner, coffee enthusiast ☕ Just enjoying the runs",
    pace:"4:45", dist:12, area:"PJ Trails", away:2.8, compat:78,
    openTo:"Running buddies only", goal:"First marathon" },
  { id:3, name:"Aisha", age:29, avatar:"A", color:"#a29bfe",
    bio:"Beginner runner, just did my first 5K 🎉 Slow & steady wins",
    pace:"7:15", dist:4, area:"KLCC Park", away:0.8, compat:85,
    openTo:"Buddies & dating", goal:"Run 10K by end of year" },
  { id:4, name:"Marcus", age:33, avatar:"M", color:"#55efc4",
    bio:"Sub-3 marathoner. Always looking for tempo partners 🔥",
    pace:"4:12", dist:15, area:"Lake Gardens", away:3.4, compat:88,
    openTo:"Running buddies & dating", goal:"Boston qualifier" },
];

const PRS = [
  { label:"Fastest 1K", val:"3:42", date:"Apr 12" },
  { label:"Fastest 5K", val:"22:15", date:"Mar 28" },
  { label:"Fastest 10K", val:"47:08", date:"Apr 22" },
  { label:"Longest Run", val:"18.0 km", date:"Apr 15" },
  { label:"Most Elevation", val:"380 m", date:"Mar 10" },
  { label:"Highest HR", val:"187 bpm", date:"Apr 22" },
];

const GOALS = [
  { id:1, label:"Weekly Distance", current:14.2, goal:25, unit:"km", color:"#a78bfa" },
  { id:2, label:"Monthly Runs", current:8, goal:15, unit:"runs", color:"#00d4ff" },
  { id:3, label:"Yearly Goal", current:650, goal:1500, unit:"km", color:"#FFEAA7" },
];

const TRAINING_PLAN = [
  { day:"Mon", workout:"Easy 5K", target:"6:00-6:30 pace", done:true },
  { day:"Tue", workout:"Rest", done:true },
  { day:"Wed", workout:"Intervals 6x400m", target:"@ 5K pace", done:true },
  { day:"Thu", workout:"Easy 6K", target:"6:00-6:30 pace", done:false, today:true },
  { day:"Fri", workout:"Rest", done:false },
  { day:"Sat", workout:"Long Run 12K", target:"6:30-7:00 pace", done:false },
  { day:"Sun", workout:"Tempo 8K", target:"5:30 pace", done:false },
];

const CHEER_MESSAGES = [
  "Crushing it! 🔥","Looking strong! 💪","You got this! 🚀","Keep that pace! ⚡",
  "Almost there! 👏","Pace looking 🔥","Beast mode! 🦁","Don't stop now! ✨",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = (n,d=2) => Number(n).toFixed(d);
const pad  = n => String(Math.floor(n)).padStart(2,"0");
const fmtT = s => `${pad(s/3600)}:${pad((s%3600)/60)}:${pad(s%60)}`;
const fmtP = s => (!s||!isFinite(s)) ? "--:--" : `${pad(s/60)}:${pad(s%60)}`;

function haversine([la1,ln1],[la2,ln2]){
  const R=6371, dLa=(la2-la1)*Math.PI/180, dLn=(ln2-ln1)*Math.PI/180;
  const a=Math.sin(dLa/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLn/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function parseHR(value){
  const flags=value.getUint8(0);
  return (flags&0x01)?value.getUint16(1,true):value.getUint8(1);
}

// ─── Reusable UI ──────────────────────────────────────────────────────────────
function Avatar({initials,color,size=40}){
  return(<div style={{width:size,height:size,borderRadius:"50%",background:color,
    display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,
    fontSize:size*0.33,color:"#1a1a2e",flexShrink:0}}>{initials}</div>);
}

function Card({children,style={}}){
  return(<div style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:"14px 16px",
    border:"1px solid rgba(255,255,255,0.08)",...style}}>{children}</div>);
}

function ProgressBar({pct,color="#a78bfa",height=6}){
  return(<div style={{width:"100%",height,borderRadius:height/2,
    background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
    <div style={{width:`${Math.min(100,pct)}%`,height:"100%",borderRadius:height/2,
      background:color,transition:"width 0.5s"}}/>
  </div>);
}

function SectionHeader({title,subtitle,action}){
  return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
    <div>
      <div style={{fontWeight:800,fontSize:16,color:"#fff"}}>{title}</div>
      {subtitle&&<div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>{subtitle}</div>}
    </div>
    {action}
  </div>);
}

function StatCard({icon,label,value,unit,color,badge}){
  return(<div style={{background:"rgba(255,255,255,0.06)",borderRadius:16,padding:"14px 16px",
    flex:1,minWidth:0,border:"1px solid rgba(255,255,255,0.1)",position:"relative"}}>
    {badge&&<div style={{position:"absolute",top:8,right:10,fontSize:9,
      background:badge.bg,color:badge.fg,borderRadius:8,padding:"2px 6px",fontWeight:700}}>{badge.text}</div>}
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,color}}>
      {icon}<span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{label}</span>
    </div>
    <div style={{display:"flex",alignItems:"baseline",gap:4}}>
      <span style={{fontSize:26,fontWeight:900,color:"#fff"}}>{value}</span>
      <span style={{fontSize:12,color:"rgba(255,255,255,0.45)"}}>{unit}</span>
    </div>
  </div>);
}

// ─── Map / HR Graph ───────────────────────────────────────────────────────────
function RunMap({points,running,noGPS}){
  const W=380,H=220,P=28;
  if(points.length<2) return(<div style={{width:"100%",height:H,borderRadius:16,
    background:"linear-gradient(135deg,#0f3460,#16213e)",display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",gap:8,color:"rgba(255,255,255,0.35)",
    border:"1px solid rgba(255,255,255,0.08)"}}>
    <MapPin size={28}/>
    <span style={{fontSize:13}}>{noGPS?"GPS unavailable – using simulation":"Waiting for GPS…"}</span>
  </div>);
  const lats=points.map(p=>p[0]),lngs=points.map(p=>p[1]);
  const [la0,la1]=[Math.min(...lats),Math.max(...lats)];
  const [ln0,ln1]=[Math.min(...lngs),Math.max(...lngs)];
  const range=Math.max(la1-la0,ln1-ln0)||0.001;
  const tx=lng=>P+((lng-ln0)/range)*(W-P*2);
  const ty=lat=>H-P-((lat-la0)/range)*(H-P*2);
  const d=points.map((p,i)=>`${i?"L":"M"}${tx(p[1]).toFixed(1)} ${ty(p[0]).toFixed(1)}`).join(" ");
  const last=points[points.length-1];
  const [lx,ly]=[tx(last[1]),ty(last[0])];
  return(<div style={{width:"100%",borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)"}}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block",background:"linear-gradient(135deg,#0f3460,#16213e)"}}>
      {[0,1,2,3].map(i=><g key={i}>
        <line x1={P} y1={P+i*(H-P*2)/3} x2={W-P} y2={P+i*(H-P*2)/3} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        <line x1={P+i*(W-P*2)/3} y1={P} x2={P+i*(W-P*2)/3} y2={H-P} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      </g>)}
      <path d={d} fill="none" stroke="#00d4ff" strokeWidth="5" strokeOpacity="0.15" strokeLinecap="round"/>
      <path d={d} fill="none" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx={tx(points[0][1])} cy={ty(points[0][0])} r={5} fill="#4ECDC4"/>
      <text x={tx(points[0][1])+8} y={ty(points[0][0])+4} fill="#4ECDC4" fontSize={9} fontWeight="bold">START</text>
      {running&&<circle cx={lx} cy={ly} r={10} fill="#FF6B6B" fillOpacity="0.2">
        <animate attributeName="r" values="7;18;7" dur="1.4s" repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" values="0.35;0;0.35" dur="1.4s" repeatCount="indefinite"/>
      </circle>}
      <circle cx={lx} cy={ly} r={6} fill={running?"#FF6B6B":"#fff"} stroke="#1a1a2e" strokeWidth={2.5}/>
    </svg>
  </div>);
}

function HRGraph({hist}){
  const W=320,H=56;
  if(hist.length<2) return null;
  const v=hist.slice(-60);
  const [mn,mx]=[Math.min(...v)-5,Math.max(...v)+5];
  const tx=i=>(i/(v.length-1))*W;
  const ty=val=>H-((val-mn)/(mx-mn))*H;
  const d=v.map((val,i)=>`${i?"L":"M"}${tx(i).toFixed(1)} ${ty(val).toFixed(1)}`).join(" ");
  return(<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block"}}>
    <defs><linearGradient id="hrG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0"/>
    </linearGradient></defs>
    <path d={`${d} L${tx(v.length-1)} ${H} L0 ${H}Z`} fill="url(#hrG)"/>
    <path d={d} fill="none" stroke="#FF6B6B" strokeWidth="1.8"/>
  </svg>);
}

// ─── Mini route preview (for feed posts) ──────────────────────────────────────
function MiniRoute({seed=0}){
  const W=320,H=80;
  const pts=[];
  for(let i=0;i<20;i++){
    const x=15+(i/19)*(W-30);
    const y=H/2 + Math.sin(i*0.6+seed)*15 + Math.cos(i*0.3+seed*2)*10;
    pts.push([x,y]);
  }
  const d=pts.map((p,i)=>`${i?"L":"M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return(<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block",
    background:"linear-gradient(135deg,#0f3460,#16213e)",borderRadius:10}}>
    <path d={d} fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round"/>
    <circle cx={pts[0][0]} cy={pts[0][1]} r={3} fill="#4ECDC4"/>
    <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r={3} fill="#FF6B6B"/>
  </svg>);
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function Leaderboard({friends,myData,period,setPeriod}){
  const labels={day:"Today",week:"This Week",month:"This Month",year:"This Year",all:"All Time"};
  const all=[{id:0,name:"You",avatar:"ME",color:"#a78bfa",runs:myData},...friends]
    .sort((a,b)=>(b.runs[period]||0)-(a.runs[period]||0));
  const top=Math.max(all[0].runs[period]||1,0.1);
  const medals=["🥇","🥈","🥉"];
  return(<div>
    <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
      {Object.entries(labels).map(([p,l])=>(
        <button key={p} onClick={()=>setPeriod(p)} style={{padding:"7px 12px",borderRadius:18,border:"none",
          cursor:"pointer",whiteSpace:"nowrap",background:period===p?"#a78bfa":"rgba(255,255,255,0.08)",
          color:period===p?"#1a1a2e":"rgba(255,255,255,0.6)",fontWeight:period===p?700:500,fontSize:11}}>
          {l}
        </button>))}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {all.map((r,idx)=>{
        const isMe=r.id===0;
        const km=+(r.runs[period]||0).toFixed(1);
        return(<div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:14,
          background:isMe?"linear-gradient(135deg,rgba(167,139,250,0.18),rgba(167,139,250,0.06))":"rgba(255,255,255,0.04)",
          border:isMe?"1px solid rgba(167,139,250,0.35)":"1px solid rgba(255,255,255,0.07)"}}>
          <span style={{fontSize:18,width:24,textAlign:"center"}}>
            {idx<3?medals[idx]:<span style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>#{idx+1}</span>}
          </span>
          <Avatar initials={r.avatar} color={r.color} size={36}/>
          <div style={{flex:1,fontWeight:700,color:isMe?"#a78bfa":"#fff",fontSize:13}}>
            {r.name}{isMe&&<span style={{fontSize:10,opacity:0.6}}> (You)</span>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:17,fontWeight:800,color:"#fff"}}>{km}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>km</div>
          </div>
          <div style={{width:3,height:36,borderRadius:2,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
            <div style={{width:"100%",borderRadius:2,height:`${Math.min(100,(km/top)*100)}%`,
              background:r.color,transition:"height 0.5s"}}/>
          </div>
        </div>);
      })}
    </div>
  </div>);
}

// ─── Feed Post ────────────────────────────────────────────────────────────────
function FeedPost({post,onKudos,onOpenComments,kudosGiven,kudosCount}){
  return(<Card style={{padding:0,marginBottom:12,overflow:"hidden"}}>
    <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",gap:10}}>
      <Avatar initials={post.avatar} color={post.color} size={42}/>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{post.user}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>{post.time}</div>
      </div>
      {post.isPR&&<div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:14,
        background:"linear-gradient(135deg,rgba(255,234,167,0.25),rgba(253,203,110,0.15))",
        border:"1px solid rgba(255,234,167,0.4)"}}>
        <Crown size={12} color="#FFEAA7"/>
        <span style={{fontSize:10,fontWeight:700,color:"#FFEAA7"}}>{post.prType||"PR"}</span>
      </div>}
    </div>
    <div style={{padding:"0 16px 12px",fontWeight:700,fontSize:15,color:"#fff"}}>{post.title}</div>
    <div style={{padding:"0 16px 12px",display:"flex",gap:14}}>
      <div><div style={{fontSize:18,fontWeight:800,color:"#00d4ff"}}>{post.dist}<span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:400}}> km</span></div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Distance</div></div>
      <div><div style={{fontSize:18,fontWeight:800,color:"#a78bfa"}}>{post.pace}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Pace</div></div>
      <div><div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{post.dur}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Time</div></div>
      <div><div style={{fontSize:18,fontWeight:800,color:"#FFEAA7"}}>{post.elev}<span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:400}}>m</span></div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Elev</div></div>
    </div>
    <div style={{padding:"0 16px 12px"}}><MiniRoute seed={post.id}/></div>
    <div style={{display:"flex",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
      <button onClick={onKudos} style={{flex:1,padding:"12px",background:"none",border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        color:kudosGiven?"#a78bfa":"rgba(255,255,255,0.6)"}}>
        <ThumbsUp size={16} fill={kudosGiven?"#a78bfa":"none"}/>
        <span style={{fontSize:13,fontWeight:600}}>{kudosCount}</span>
      </button>
      <div style={{width:1,background:"rgba(255,255,255,0.06)"}}/>
      <button onClick={onOpenComments} style={{flex:1,padding:"12px",background:"none",border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"rgba(255,255,255,0.6)"}}>
        <MessageCircle size={16}/>
        <span style={{fontSize:13,fontWeight:600}}>{post.comments}</span>
      </button>
    </div>
  </Card>);
}

// ─── Comments Modal ───────────────────────────────────────────────────────────
function CommentsModal({post,onClose}){
  const [comments,setComments]=useState([
    {user:"Wei Liang",avatar:"WL",color:"#45B7D1",text:"Nice pace! 🔥",time:"1h"},
    {user:"Priya Devi",avatar:"PD",color:"#96CEB4",text:"Crushing it! What route?",time:"45m"},
  ]);
  const [text,setText]=useState("");
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,
    display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#16213e",borderRadius:"24px 24px 0 0",
      width:"100%",maxWidth:480,maxHeight:"70vh",display:"flex",flexDirection:"column",
      border:"1px solid rgba(255,255,255,0.1)"}}>
      <div style={{padding:"18px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",
        borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{fontWeight:800,color:"#fff",fontSize:16}}>{comments.length} Comments</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#fff",cursor:"pointer"}}><X size={20}/></button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
        {comments.map((c,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:14}}>
          <Avatar initials={c.avatar} color={c.color} size={34}/>
          <div style={{flex:1}}>
            <div style={{background:"rgba(255,255,255,0.06)",borderRadius:14,padding:"8px 12px"}}>
              <div style={{fontWeight:700,fontSize:12,color:"#fff",marginBottom:2}}>{c.user}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.85)"}}>{c.text}</div>
            </div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:3,paddingLeft:10}}>{c.time}</div>
          </div>
        </div>))}
      </div>
      <div style={{padding:"12px 20px",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",gap:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a comment…"
          style={{flex:1,padding:"10px 14px",borderRadius:20,background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.1)",color:"#fff",fontSize:13,outline:"none"}}/>
        <button onClick={()=>{
          if(!text.trim())return;
          setComments(p=>[...p,{user:"You",avatar:"ME",color:"#a78bfa",text,time:"now"}]);
          setText("");
        }} style={{padding:"10px 14px",borderRadius:20,border:"none",
          background:"linear-gradient(135deg,#a78bfa,#6d28d9)",color:"#fff",cursor:"pointer"}}>
          <Send size={14}/>
        </button>
      </div>
    </div>
  </div>);
}

// ─── Segment Card ─────────────────────────────────────────────────────────────
function SegmentCard({seg}){
  return(<Card style={{marginBottom:10,padding:0,overflow:"hidden"}}>
    <div style={{padding:"14px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#96CEB4,#10b981)",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Mountain size={18} color="#fff"/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,color:"#fff",fontSize:14}}>{seg.name}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>
            {seg.location} · {seg.dist}km · ↑{seg.elev}m
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#00d4ff"}}>{seg.yourPR}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Your PR · #{seg.yourRank}</div>
        </div>
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 12px"}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontWeight:600}}>
          Top 3 · {seg.attempts.toLocaleString()} attempts
        </div>
        {seg.leaders.map((l,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<2?6:0}}>
          <span style={{fontSize:14,width:18}}>{["🥇","🥈","🥉"][i]}</span>
          <span style={{flex:1,fontSize:12,color:"#fff",fontWeight:600}}>{l.n}</span>
          <span style={{fontSize:12,color:"#FFEAA7",fontWeight:700,fontFamily:"monospace"}}>{l.t}</span>
        </div>))}
      </div>
    </div>
  </Card>);
}

// ─── Achievement Badge ────────────────────────────────────────────────────────
function AchievementBadge({a}){
  return(<div style={{aspectRatio:"1",borderRadius:14,padding:10,display:"flex",
    flexDirection:"column",alignItems:"center",justifyContent:"center",
    background:a.earned?`linear-gradient(135deg,${a.color}33,${a.color}11)`:"rgba(255,255,255,0.04)",
    border:`1px solid ${a.earned?a.color+"66":"rgba(255,255,255,0.08)"}`,opacity:a.earned?1:0.5}}>
    <div style={{fontSize:26,marginBottom:4,filter:a.earned?"none":"grayscale(1)"}}>{a.earned?a.icon:"🔒"}</div>
    <div style={{fontSize:10,fontWeight:700,color:"#fff",textAlign:"center",lineHeight:1.2}}>{a.name}</div>
    {a.earned&&<div style={{fontSize:9,color:a.color,marginTop:2,fontWeight:600}}>{a.date}</div>}
  </div>);
}

// ─── Challenge Card ───────────────────────────────────────────────────────────
function ChallengeCard({ch,onJoin}){
  const pct=(ch.current/ch.goal)*100;
  return(<Card style={{marginBottom:10}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
      <div style={{width:46,height:46,borderRadius:12,background:"linear-gradient(135deg,#a78bfa22,#6d28d922)",
        border:"1px solid rgba(167,139,250,0.3)",display:"flex",alignItems:"center",
        justifyContent:"center",fontSize:24}}>{ch.badge}</div>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,color:"#fff",fontSize:14}}>{ch.name}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>
          {ch.desc} · {ch.participants.toLocaleString()} joined
        </div>
      </div>
      {ch.joined?<div style={{padding:"5px 10px",borderRadius:12,
        background:"rgba(78,205,196,0.2)",color:"#4ECDC4",fontSize:10,fontWeight:700}}>JOINED</div>
        :<button onClick={onJoin} style={{padding:"6px 14px",borderRadius:14,border:"none",
          background:"#a78bfa",color:"#1a1a2e",fontSize:11,fontWeight:700,cursor:"pointer"}}>Join</button>}
    </div>
    {ch.joined&&<>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
        <span style={{fontSize:18,fontWeight:800,color:"#fff"}}>
          {ch.current}<span style={{fontSize:13,color:"rgba(255,255,255,0.4)",fontWeight:600}}>/{ch.goal} {ch.unit}</span>
        </span>
        <span style={{fontSize:11,color:"#FFEAA7",fontWeight:700}}>{ch.endDays} days left</span>
      </div>
      <ProgressBar pct={pct} color={pct>=100?"#4ECDC4":"#a78bfa"}/>
    </>}
  </Card>);
}

// ─── Club Card ────────────────────────────────────────────────────────────────
function ClubCard({club,onToggle}){
  return(<Card style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
    <div style={{width:48,height:48,borderRadius:12,background:club.color,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Users size={22} color="#1a1a2e"/>
    </div>
    <div style={{flex:1}}>
      <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{club.name}</div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:2}}>
        {club.members.toLocaleString()} members · {club.desc}
      </div>
    </div>
    <button onClick={onToggle} style={{padding:"7px 14px",borderRadius:14,border:"none",cursor:"pointer",
      background:club.joined?"rgba(78,205,196,0.2)":"#a78bfa",
      color:club.joined?"#4ECDC4":"#1a1a2e",fontSize:11,fontWeight:700}}>
      {club.joined?"Joined":"Join"}
    </button>
  </Card>);
}

// ─── Route Card ───────────────────────────────────────────────────────────────
function RouteCard({route}){
  return(<Card style={{marginBottom:8}}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:46,height:46,borderRadius:12,background:"linear-gradient(135deg,#0f3460,#16213e)",
        border:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <MapPinned size={20} color="#00d4ff"/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{route.name}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:2,display:"flex",gap:8,flexWrap:"wrap"}}>
          <span>{route.dist}km</span>
          <span>·</span>
          <span>{route.type}</span>
          <span>·</span>
          <span>↑{route.elev}m</span>
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:13,color:"#FFEAA7",fontWeight:700,display:"flex",alignItems:"center",gap:3}}>
          <Star size={12} fill="#FFEAA7"/>{route.rating}
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2}}>{route.uses.toLocaleString()} used</div>
      </div>
    </div>
  </Card>);
}

// ─── Match Card (running buddies + dating) ────────────────────────────────────
function MatchCard({m,onSkip,onConnect}){
  return(<Card style={{marginBottom:12,padding:0,overflow:"hidden"}}>
    <div style={{height:140,background:`linear-gradient(135deg,${m.color},${m.color}aa)`,
      display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.2)",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:900,color:"#fff",
        border:"3px solid rgba(255,255,255,0.4)"}}>{m.avatar}</div>
      <div style={{position:"absolute",top:12,right:12,padding:"5px 10px",borderRadius:12,
        background:"rgba(0,0,0,0.4)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",gap:4}}>
        <Sparkles size={11} color="#FFEAA7"/>
        <span style={{fontSize:11,fontWeight:700,color:"#FFEAA7"}}>{m.compat}% match</span>
      </div>
    </div>
    <div style={{padding:14}}>
      <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:6}}>
        <span style={{fontSize:18,fontWeight:800,color:"#fff"}}>{m.name}, {m.age}</span>
      </div>
      <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.4,marginBottom:12}}>{m.bio}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <div style={{padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.05)"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Pace</div>
          <div style={{fontSize:14,fontWeight:700,color:"#a78bfa"}}>{m.pace}/km</div>
        </div>
        <div style={{padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.05)"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Typical</div>
          <div style={{fontSize:14,fontWeight:700,color:"#00d4ff"}}>{m.dist} km</div>
        </div>
        <div style={{padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.05)"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Area</div>
          <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{m.area}</div>
        </div>
        <div style={{padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.05)"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Distance</div>
          <div style={{fontSize:14,fontWeight:700,color:"#FFEAA7"}}>{m.away} km away</div>
        </div>
      </div>
      <div style={{padding:"8px 10px",borderRadius:10,background:"rgba(167,139,250,0.1)",
        border:"1px solid rgba(167,139,250,0.2)",marginBottom:12}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:2}}>Open to: {m.openTo}</div>
        <div style={{fontSize:12,color:"#fff",fontWeight:600}}>🎯 {m.goal}</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onSkip} style={{flex:1,padding:"11px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",
          background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13,fontWeight:600}}>
          Skip
        </button>
        <button onClick={onConnect} style={{flex:2,padding:"11px",borderRadius:12,border:"none",
          background:"linear-gradient(135deg,#a78bfa,#6d28d9)",color:"#fff",
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",fontSize:13,fontWeight:700}}>
          <UserPlus size={15}/> Connect
        </button>
      </div>
    </div>
  </Card>);
}

// ─── Live Cheer Toast ─────────────────────────────────────────────────────────
function LiveCheer({cheer}){
  return(<div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",
    zIndex:999,background:"linear-gradient(135deg,rgba(167,139,250,0.95),rgba(109,40,217,0.95))",
    backdropFilter:"blur(12px)",padding:"10px 16px",borderRadius:18,
    border:"1px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",gap:10,
    boxShadow:"0 8px 24px rgba(167,139,250,0.4)",animation:"cheerSlide 0.4s ease-out",maxWidth:340}}>
    <style>{`@keyframes cheerSlide{0%{transform:translate(-50%,-20px);opacity:0}100%{transform:translate(-50%,0);opacity:1}}`}</style>
    <Avatar initials={cheer.avatar} color={cheer.color} size={36}/>
    <div style={{flex:1}}>
      <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{cheer.user} cheered you!</div>
      <div style={{fontSize:13,color:"#fff",marginTop:1}}>{cheer.message}</div>
    </div>
    <Sparkles size={18} color="#FFEAA7"/>
  </div>);
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({g}){
  const pct=(g.current/g.goal)*100;
  return(<Card style={{marginBottom:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
      <span style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>{g.label}</span>
      <span style={{fontSize:11,color:g.color,fontWeight:700}}>{Math.round(pct)}%</span>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
      <span style={{fontSize:22,fontWeight:900,color:"#fff"}}>
        {g.current}<span style={{fontSize:14,color:"rgba(255,255,255,0.4)",fontWeight:600}}> / {g.goal} {g.unit}</span>
      </span>
    </div>
    <ProgressBar pct={pct} color={g.color}/>
  </Card>);
}

// ─── Add Friend Modal (unchanged from before) ─────────────────────────────────
function AddFriendModal({onClose,onAdd}){
  const [method,setMethod]=useState("search");
  const [search,setSearch]=useState("");
  const [qrDataUrl,setQrDataUrl]=useState(null);
  const [nearby,setNearby]=useState([]);
  const [scanning,setScanning]=useState(false);
  const [linkCopied,setLinkCopied]=useState(false);
  const [scannerActive,setScannerActive]=useState(false);
  const [scanError,setScanError]=useState(null);
  const videoRef=useRef(null);
  const streamRef=useRef(null);
  const scanLoopRef=useRef(null);
  const scanningRef=useRef(false);
  const myCode="JOG-ME-7K9X4P";
  const inviteUrl=`https://jogtracker.app/invite/${myCode}`;
  const suggestions=[
    {name:"Azhar Ibrahim",avatar:"AI",color:"#fd79a8"},
    {name:"Mei Ling",avatar:"ML",color:"#fdcb6e"},
    {name:"Rajan Nair",avatar:"RN",color:"#6c5ce7"},
    {name:"Fatimah Zahra",avatar:"FZ",color:"#00b894"},
    {name:"Darren Tan",avatar:"DT",color:"#e17055"},
  ];
  const COLORS=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#fd79a8","#fdcb6e","#74b9ff"];
  useEffect(()=>{if(method==="qr"){QRCode.toDataURL(inviteUrl,{width:220,margin:1,color:{dark:"#0a0e27",light:"#ffffff"}}).then(setQrDataUrl).catch(console.error);}},[method]);
  useEffect(()=>{
    if(method!=="nearby"){setNearby([]);setScanning(false);return;}
    setScanning(true);setNearby([]);
    const sim=[
      {name:"Kavi Selvam",avatar:"KS",color:"#74b9ff",distance:12,delay:900},
      {name:"Aisyah Rahman",avatar:"AR",color:"#a29bfe",distance:24,delay:1800},
      {name:"Ben Lim",avatar:"BL",color:"#55efc4",distance:38,delay:2700},
    ];
    const ts=sim.map(p=>setTimeout(()=>setNearby(pr=>[...pr,p]),p.delay));
    const e=setTimeout(()=>setScanning(false),3500);
    return()=>{ts.forEach(clearTimeout);clearTimeout(e);};
  },[method]);
  const pickContact=async()=>{
    if(!("contacts" in navigator)){alert("Contact Picker only works in Chrome on Android.");return;}
    try{
      const contacts=await navigator.contacts.select(["name"],{multiple:true});
      contacts.forEach(c=>{
        const name=c.name?.[0]||"Unknown";
        const parts=name.trim().split(" ");
        const initials=((parts[0]?.[0]||"?")+(parts[1]?.[0]||"")).toUpperCase();
        onAdd({name,avatar:initials,color:COLORS[Math.floor(Math.random()*COLORS.length)]});
      });
    }catch(err){console.error(err);}
  };
  const shareLink=async()=>{
    if(navigator.share){try{await navigator.share({title:"Join me on JogTracker",text:"Race me 🏃",url:inviteUrl});}catch(e){}}
    else copyLink();
  };
  const copyLink=async()=>{
    try{await navigator.clipboard.writeText(inviteUrl);setLinkCopied(true);setTimeout(()=>setLinkCopied(false),2000);}catch(e){}
  };
  const stopScanner=()=>{
    scanningRef.current=false;
    if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;}
    if(scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    setScannerActive(false);
  };
  const startScanner=async()=>{
    setScanError(null);
    if(!("BarcodeDetector" in window)){setScanError("QR scanning needs Chrome on Android or desktop.");return;}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      scanningRef.current=true;setScannerActive(true);
      const detector=new window.BarcodeDetector({formats:["qr_code"]});
      const tick=async()=>{
        if(!scanningRef.current||!videoRef.current)return;
        try{
          const codes=await detector.detect(videoRef.current);
          if(codes.length>0){stopScanner();onAdd({name:"Scanned Friend",avatar:"QR",color:COLORS[Math.floor(Math.random()*COLORS.length)]});return;}
        }catch(e){}
        scanLoopRef.current=requestAnimationFrame(tick);
      };
      scanLoopRef.current=requestAnimationFrame(tick);
    }catch(e){setScanError("Camera permission denied.");}
  };
  useEffect(()=>()=>stopScanner(),[]);
  const filtered=suggestions.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));
  const methods=[
    {id:"search",icon:<Search size={13}/>,label:"Search"},
    {id:"link",icon:<Link2 size={13}/>,label:"Link"},
    {id:"qr",icon:<QrCode size={13}/>,label:"QR"},
    {id:"contacts",icon:<Phone size={13}/>,label:"Contacts"},
    {id:"nearby",icon:<Radar size={13}/>,label:"Nearby"},
  ];
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",
    justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)"}} onClick={()=>{stopScanner();onClose();}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#16213e",borderRadius:"24px 24px 0 0",padding:24,
      width:"100%",maxWidth:480,border:"1px solid rgba(255,255,255,0.1)",maxHeight:"85vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h3 style={{margin:0,color:"#fff",fontSize:18}}>Add Friends</h3>
        <button onClick={()=>{stopScanner();onClose();}} style={{background:"none",border:"none",color:"#fff",cursor:"pointer"}}><X size={22}/></button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
        {methods.map(m=>(<button key={m.id} onClick={()=>{stopScanner();setMethod(m.id);}} style={{
          display:"flex",alignItems:"center",gap:5,padding:"8px 12px",borderRadius:14,border:"none",whiteSpace:"nowrap",
          background:method===m.id?"#a78bfa":"rgba(255,255,255,0.06)",
          color:method===m.id?"#1a1a2e":"rgba(255,255,255,0.7)",
          fontSize:12,fontWeight:method===m.id?700:500,cursor:"pointer"}}>{m.icon}{m.label}</button>))}
      </div>
      {method==="search"&&(<div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name…"
          style={{width:"100%",padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:14}}/>
        {filtered.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",
          borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <Avatar initials={s.avatar} color={s.color} size={44}/>
          <div style={{flex:1,color:"#fff",fontWeight:600}}>{s.name}</div>
          <button onClick={()=>onAdd(s)} style={{padding:"8px 18px",borderRadius:20,border:"none",
            background:"#a78bfa",color:"#1a1a2e",fontWeight:700,cursor:"pointer",fontSize:13}}>Add</button>
        </div>))}
      </div>)}
      {method==="link"&&(<div>
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{width:80,height:80,borderRadius:20,margin:"0 auto 16px",
            background:"linear-gradient(135deg,#a78bfa,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Share2 size={36} color="#fff"/>
          </div>
          <h4 style={{margin:"0 0 6px",color:"#fff",fontSize:17}}>Your Invite Link</h4>
          <p style={{margin:"0 0 18px",color:"rgba(255,255,255,0.5)",fontSize:13}}>Share with anyone — they'll be added when they sign up.</p>
        </div>
        <div style={{padding:"14px 16px",borderRadius:12,background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.1)",fontSize:13,color:"#fff",wordBreak:"break-all",marginBottom:14,fontFamily:"monospace"}}>
          {inviteUrl}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={copyLink} style={{flex:1,padding:"12px",borderRadius:12,
            border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"#fff",
            display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",fontSize:14,fontWeight:600}}>
            {linkCopied?<><Check size={16} color="#4ECDC4"/>Copied!</>:<><Copy size={16}/>Copy</>}
          </button>
          <button onClick={shareLink} style={{flex:1,padding:"12px",borderRadius:12,border:"none",
            background:"linear-gradient(135deg,#a78bfa,#6d28d9)",color:"#fff",
            display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",fontSize:14,fontWeight:700}}>
            <Share2 size={16}/>Share
          </button>
        </div>
      </div>)}
      {method==="qr"&&(<div>{!scannerActive&&(<div style={{textAlign:"center"}}>
        <div style={{display:"inline-block",padding:14,borderRadius:16,background:"#fff",marginBottom:16}}>
          {qrDataUrl?<img src={qrDataUrl} alt="QR" style={{display:"block",width:200,height:200}}/>
            :<div style={{width:200,height:200,display:"flex",alignItems:"center",justifyContent:"center",color:"#999"}}>Generating…</div>}
        </div>
        <h4 style={{margin:"0 0 6px",color:"#fff",fontSize:16}}>Your QR Code</h4>
        <p style={{margin:"0 0 18px",color:"rgba(255,255,255,0.5)",fontSize:13}}>Friends scan with their phone camera.</p>
        <button onClick={startScanner} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
          background:"linear-gradient(135deg,#a78bfa,#6d28d9)",color:"#fff",display:"flex",alignItems:"center",
          justifyContent:"center",gap:6,cursor:"pointer",fontSize:14,fontWeight:700}}>
          <ScanLine size={16}/>Scan Friend's QR
        </button>
        {scanError&&<p style={{color:"#FF6B6B",fontSize:12,marginTop:10}}>{scanError}</p>}
      </div>)}{scannerActive&&(<div>
        <div style={{position:"relative",width:"100%",aspectRatio:"1",borderRadius:16,overflow:"hidden",background:"#000",marginBottom:14}}>
          <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{width:"70%",aspectRatio:"1",border:"3px solid #a78bfa",borderRadius:20,
              boxShadow:"0 0 0 9999px rgba(0,0,0,0.4)"}}/>
          </div>
        </div>
        <button onClick={stopScanner} style={{width:"100%",padding:"12px",borderRadius:12,
          border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600}}>
          Cancel Scan
        </button>
      </div>)}</div>)}
      {method==="contacts"&&(<div style={{textAlign:"center",padding:"10px 0"}}>
        <div style={{width:80,height:80,borderRadius:20,margin:"0 auto 16px",
          background:"linear-gradient(135deg,#4ECDC4,#0f766e)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Phone size={36} color="#fff"/>
        </div>
        <h4 style={{margin:"0 0 6px",color:"#fff",fontSize:17}}>Import from Contacts</h4>
        <p style={{margin:"0 0 22px",color:"rgba(255,255,255,0.5)",fontSize:13,lineHeight:1.5}}>
          We'll match your address book against JogTracker users.
        </p>
        <button onClick={pickContact} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",
          background:"linear-gradient(135deg,#4ECDC4,#0f766e)",color:"#fff",display:"flex",alignItems:"center",
          justifyContent:"center",gap:8,cursor:"pointer",fontSize:15,fontWeight:700}}>
          <Phone size={16}/>Open Contact Picker
        </button>
      </div>)}
      {method==="nearby"&&(<div>
        <style>{`@keyframes radarPulse{0%{transform:scale(0.95);opacity:1}100%{transform:scale(1.4);opacity:0}}`}</style>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{position:"relative",width:120,height:120,margin:"0 auto 16px"}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(167,139,250,0.4)",
              animation:scanning?"radarPulse 2s ease-out infinite":"none"}}/>
            <div style={{position:"absolute",inset:20,borderRadius:"50%",border:"2px solid rgba(167,139,250,0.6)",
              animation:scanning?"radarPulse 2s ease-out infinite 0.5s":"none"}}/>
            <div style={{position:"absolute",inset:40,borderRadius:"50%",
              background:"linear-gradient(135deg,#a78bfa,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Radar size={24} color="#fff"/>
            </div>
          </div>
          <h4 style={{margin:"0 0 6px",color:"#fff",fontSize:17}}>{scanning?"Scanning Nearby…":"Runners Near You"}</h4>
          <p style={{margin:0,color:"rgba(255,255,255,0.5)",fontSize:13}}>{scanning?"Looking within 100m":`Found ${nearby.length} runners`}</p>
        </div>
        {nearby.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,
          padding:"12px 14px",borderRadius:14,marginBottom:8,background:"rgba(255,255,255,0.05)",
          border:"1px solid rgba(255,255,255,0.08)"}}>
          <Avatar initials={p.avatar} color={p.color} size={42}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:"#fff",fontSize:14}}>{p.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:2}}>{p.distance}m away</div>
          </div>
          <button onClick={()=>onAdd(p)} style={{padding:"7px 14px",borderRadius:18,border:"none",
            background:"#a78bfa",color:"#1a1a2e",fontWeight:700,cursor:"pointer",fontSize:12}}>Add</button>
        </div>))}
      </div>)}
    </div>
  </div>);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function JogTracker(){
  const [tab,setTab]=useState("run");
  const [exploreTab,setExploreTab]=useState("segments");
  const [meTab,setMeTab]=useState("achievements");

  const [status,setStatus]=useState("idle");
  const [elapsed,setElapsed]=useState(0);
  const [distance,setDistance]=useState(0);
  const [hr,setHr]=useState(null);
  const [hrHist,setHrHist]=useState([]);
  const [points,setPoints]=useState([]);
  const [gpsOk,setGpsOk]=useState(null);
  const [gpsAccuracy,setGpsAccuracy]=useState(null);
  const lastPointRef=useRef(null);
  const [btDevice,setBtDevice]=useState(null);
  const [btStatus,setBtStatus]=useState("disconnected");
  const btCharRef=useRef(null);
  const timerRef=useRef();
  const gpsWatchRef=useRef();
  const simRef=useRef();
  const statusRef=useRef("idle");
  const simRoute=useRef([
    [3.1390,101.6869],[3.1398,101.6880],[3.1410,101.6895],[3.1425,101.6905],
    [3.1440,101.6900],[3.1452,101.6888],[3.1458,101.6872],[3.1450,101.6858],
    [3.1435,101.6848],[3.1418,101.6845],[3.1404,101.6852],[3.1393,101.6862],
  ]);
  const simIdxRef=useRef(0);
  const [friends,setFriends]=useState(INITIAL_FRIENDS);
  const [showAdd,setShowAdd]=useState(false);
  const [period,setPeriod]=useState("week");
  const [sessions,setSessions]=useState([
    {date:"May 26",km:"5.8",pace:"5:42",hr:148,dur:"33:05"},
    {date:"May 24",km:"8.2",pace:"5:30",hr:152,dur:"45:06"},
    {date:"May 22",km:"4.5",pace:"6:10",hr:140,dur:"27:45"},
  ]);
  const [kudos,setKudos]=useState(()=>FEED_DATA.reduce((a,p)=>({...a,[p.id]:{count:p.kudos,given:false}}),{}));
  const [openComments,setOpenComments]=useState(null);
  const [challenges,setChallenges]=useState(CHALLENGES);
  const [clubs,setClubs]=useState(CLUBS);
  const [matchIdx,setMatchIdx]=useState(0);
  const [connectedMatches,setConnectedMatches]=useState([]);
  const [activeCheer,setActiveCheer]=useState(null);
  const cheerTimerRef=useRef();

  useEffect(()=>{statusRef.current=status;},[status]);

  const pace=elapsed>0&&distance>0?elapsed/distance:0;
  const hrZone=!hr?"--":hr<100?"Rest":hr<140?"Fat Burn":hr<160?"Cardio":"Peak";
  const hrColor=!hr?"#aaa":hr<100?"#4ECDC4":hr<140?"#96CEB4":hr<160?"#FFEAA7":"#FF6B6B";

  // Live cheers during run
  useEffect(()=>{
    if(status!=="running") return;
    const fireCheer=()=>{
      const f=INITIAL_FRIENDS[Math.floor(Math.random()*INITIAL_FRIENDS.length)];
      const msg=CHEER_MESSAGES[Math.floor(Math.random()*CHEER_MESSAGES.length)];
      setActiveCheer({user:f.name,avatar:f.avatar,color:f.color,message:msg});
      setTimeout(()=>setActiveCheer(null),3500);
    };
    cheerTimerRef.current=setInterval(fireCheer, 15000);
    setTimeout(fireCheer, 4000);
    return()=>clearInterval(cheerTimerRef.current);
  },[status]);

  const connectBluetooth=useCallback(async()=>{
    if(!navigator.bluetooth){alert("Web Bluetooth not supported.");return;}
    try{
      setBtStatus("connecting");
      const device=await navigator.bluetooth.requestDevice({filters:[{services:[HR_SERVICE]}],optionalServices:[HR_SERVICE]});
      setBtDevice(device);
      device.addEventListener("gattserverdisconnected",()=>{setBtStatus("disconnected");setBtDevice(null);});
      const server=await device.gatt.connect();
      const service=await server.getPrimaryService(HR_SERVICE);
      const char=await service.getCharacteristic(HR_CHAR);
      btCharRef.current=char;
      await char.startNotifications();
      char.addEventListener("characteristicvaluechanged",e=>{
        const bpm=parseHR(e.target.value);
        setHr(bpm);setHrHist(h=>[...h.slice(-80),bpm]);
      });
      setBtStatus("connected");
    }catch(err){setBtStatus(err.name==="NotFoundError"?"disconnected":"error");}
  },[]);

  const disconnectBluetooth=useCallback(async()=>{
    if(btDevice?.gatt?.connected) await btDevice.gatt.disconnect();
    setBtDevice(null);setBtStatus("disconnected");
  },[btDevice]);

  const startSimGPS=useCallback(()=>{
    const route=simRoute.current;
    setPoints([route[0]]);
    simRef.current=setInterval(()=>{
      if(statusRef.current!=="running") return;
      simIdxRef.current=(simIdxRef.current+1)%route.length;
      const newPt=route[simIdxRef.current];
      setPoints(prev=>{
        if(prev.length>0){const dist=haversine(prev[prev.length-1],newPt);setDistance(d=>d+dist);}
        const next=[...prev,newPt];return next.length>300?next.slice(-300):next;
      });
    },900);
  },[]);

  const startGPS=useCallback(()=>{
    if(!navigator.geolocation){setGpsOk(false);startSimGPS();return;}
    gpsWatchRef.current=navigator.geolocation.watchPosition(
      pos=>{
        const newPt=[pos.coords.latitude,pos.coords.longitude];
        if(statusRef.current!=="running"){lastPointRef.current=newPt;return;}
        setGpsOk(true);setGpsAccuracy(Math.round(pos.coords.accuracy));
        setPoints(prev=>{
          if(prev.length===0){lastPointRef.current=newPt;return[newPt];}
          const dist=haversine(lastPointRef.current,newPt);
          if(dist<0.003) return prev;
          setDistance(d=>d+dist);lastPointRef.current=newPt;
          const next=[...prev,newPt];return next.length>500?next.slice(-500):next;
        });
      },
      ()=>{setGpsOk(false);startSimGPS();},
      GPS_OPTIONS
    );
  },[startSimGPS]);

  const stopGPS=useCallback(()=>{
    if(gpsWatchRef.current!=null){navigator.geolocation?.clearWatch(gpsWatchRef.current);gpsWatchRef.current=null;}
    clearInterval(simRef.current);
  },[]);

  useEffect(()=>{
    if(status!=="running"||btStatus==="connected") return;
    const iv=setInterval(()=>{
      setHr(h=>{
        const base=h??142;
        const nh=Math.min(185,Math.max(120,base+(Math.random()>.5?1:-1)*Math.ceil(Math.random()*3)));
        setHrHist(arr=>[...arr.slice(-80),nh]);
        return nh;
      });
    },1000);
    return()=>clearInterval(iv);
  },[status,btStatus]);

  const startRun=useCallback(()=>{setStatus("running");startGPS();},[startGPS]);
  const stopRun=useCallback(()=>{
    setStatus("idle");stopGPS();
    if(distance>0.05){
      setSessions(prev=>[{date:"Just now",km:fmt(distance),pace:fmtP(Math.round(pace)),
        hr:hrHist.length?Math.round(hrHist.reduce((a,b)=>a+b,0)/hrHist.length):0,dur:fmtT(elapsed)},...prev]);
    }
    setElapsed(0);setDistance(0);setHr(null);setHrHist([]);setPoints([]);
    lastPointRef.current=null;simIdxRef.current=0;setGpsOk(null);setGpsAccuracy(null);
  },[stopGPS,distance,pace,hrHist,elapsed]);

  useEffect(()=>{
    if(status==="running") timerRef.current=setInterval(()=>setElapsed(e=>e+1),1000);
    else clearInterval(timerRef.current);
    return()=>clearInterval(timerRef.current);
  },[status]);
  useEffect(()=>()=>{stopGPS();clearInterval(timerRef.current);},[stopGPS]);

  const myRuns={day:+distance.toFixed(1),week:14.2,month:58.0,year:650,all:1820};
  const BtnBase={width:70,height:70,borderRadius:"50%",border:"none",cursor:"pointer",
    display:"flex",alignItems:"center",justifyContent:"center"};
  const btLabel={disconnected:"Connect HR Monitor",connecting:"Connecting…",
    connected:`♥ ${btDevice?.name||"HR Monitor"}`,error:"BT Error – Retry"}[btStatus];
  const btBg={disconnected:"rgba(255,255,255,0.08)",connecting:"rgba(167,139,250,0.25)",
    connected:"rgba(255,107,107,0.2)",error:"rgba(255,107,107,0.15)"}[btStatus];

  const titles={run:"Track Run",feed:"Activity Feed",explore:"Explore",match:"Running Match",me:"Profile"};

  const toggleKudos=id=>setKudos(p=>({...p,[id]:{count:p[id].given?p[id].count-1:p[id].count+1,given:!p[id].given}}));
  const joinChallenge=id=>setChallenges(p=>p.map(c=>c.id===id?{...c,joined:true}:c));
  const toggleClub=id=>setClubs(p=>p.map(c=>c.id===id?{...c,joined:!c.joined}:c));

  return(<div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0e27 0%,#16213e 50%,#0f3460 100%)",
    fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#fff",display:"flex",flexDirection:"column",
    maxWidth:480,margin:"0 auto",position:"relative"}}>

    {activeCheer&&<LiveCheer cheer={activeCheer}/>}

    {/* Header */}
    <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:3,textTransform:"uppercase",marginBottom:2}}>JogTracker</div>
        <div style={{fontSize:22,fontWeight:900}}>{titles[tab]}</div>
      </div>
      <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#a78bfa,#6d28d9)",
        display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14}}>ME</div>
    </div>

    <div style={{flex:1,padding:"14px 20px 88px",overflowY:"auto"}}>

      {/* ═══ RUN TAB ═══ */}
      {tab==="run"&&(<div>
        <button onClick={btStatus==="connected"?disconnectBluetooth:connectBluetooth} disabled={btStatus==="connecting"}
          style={{width:"100%",padding:"10px 16px",borderRadius:14,border:"1px solid rgba(255,255,255,0.1)",
            background:btBg,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            cursor:"pointer",marginBottom:14,fontSize:13,fontWeight:600}}>
          {btStatus==="connected"?<><Bluetooth size={15} color="#FF6B6B"/>{btLabel}</>:<><BluetoothOff size={15} color="rgba(255,255,255,0.5)"/>{btLabel}</>}
        </button>
        {gpsOk!==null&&(<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12,padding:"6px 12px",
          borderRadius:20,width:"fit-content",background:gpsOk?"rgba(78,205,196,0.15)":"rgba(255,107,107,0.15)",
          border:`1px solid ${gpsOk?"rgba(78,205,196,0.3)":"rgba(255,107,107,0.3)"}`}}>
          <Navigation size={12} color={gpsOk?"#4ECDC4":"#FF6B6B"}/>
          <span style={{fontSize:11,fontWeight:600,color:gpsOk?"#4ECDC4":"#FF6B6B"}}>
            {gpsOk?`GPS · ±${gpsAccuracy}m`:"Simulation mode"}
          </span>
        </div>)}
        <div style={{textAlign:"center",margin:"4px 0 18px"}}>
          <div style={{fontSize:58,fontWeight:900,fontVariantNumeric:"tabular-nums",letterSpacing:-2,lineHeight:1,
            background:status==="running"?"linear-gradient(90deg,#a78bfa,#00d4ff)":"rgba(255,255,255,0.88)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fmtT(elapsed)}</div>
          <div style={{marginTop:6,fontSize:13,color:"rgba(255,255,255,0.4)"}}>
            {status==="idle"?"Tap play to start":status==="paused"?"⏸ Paused":"🔴 Live tracking"}
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:10}}>
          <StatCard icon={<MapPin size={13}/>} label="Distance" value={fmt(distance)} unit="km" color="#00d4ff"/>
          <StatCard icon={<Zap size={13}/>} label="Pace" value={fmtP(Math.round(pace))} unit="min/km" color="#a78bfa"/>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:18}}>
          <StatCard icon={<Heart size={13}/>} label={`HR · ${hrZone}`} value={hr??"--"} unit="bpm" color={hrColor}
            badge={btStatus==="connected"?{text:"BLE",bg:"rgba(255,107,107,0.3)",fg:"#FF6B6B"}:null}/>
          <StatCard icon={<Flame size={13}/>} label="Calories" value={Math.round(distance*60)} unit="kcal" color="#FFEAA7"/>
        </div>
        {hrHist.length>3&&(<div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"12px 14px",
          marginBottom:16,border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:8,fontWeight:700,
            textTransform:"uppercase",letterSpacing:1,display:"flex",justifyContent:"space-between"}}>
            <span>Heart Rate</span><span style={{color:hrColor}}>{hr} bpm · {hrZone}</span>
          </div>
          <HRGraph hist={hrHist}/>
        </div>)}
        <div style={{marginBottom:22}}><RunMap points={points} running={status==="running"} noGPS={gpsOk===false}/></div>
        <div style={{display:"flex",gap:20,justifyContent:"center",alignItems:"center"}}>
          {status==="idle"&&(<button onClick={startRun} style={{...BtnBase,width:80,height:80,
            background:"linear-gradient(135deg,#a78bfa,#6d28d9)",boxShadow:"0 0 32px rgba(167,139,250,0.55)"}}>
            <Play size={30} fill="#fff" color="#fff"/></button>)}
          {status==="running"&&(<><button onClick={()=>setStatus("paused")} style={{...BtnBase,background:"rgba(255,255,255,0.1)"}}>
            <Pause size={26} color="#fff"/></button>
            <button onClick={stopRun} style={{...BtnBase,background:"linear-gradient(135deg,#FF6B6B,#c0392b)",
              boxShadow:"0 0 20px rgba(255,107,107,0.45)"}}><Square size={26} fill="#fff" color="#fff"/></button></>)}
          {status==="paused"&&(<><button onClick={()=>setStatus("running")} style={{...BtnBase,
            background:"linear-gradient(135deg,#a78bfa,#6d28d9)",boxShadow:"0 0 24px rgba(167,139,250,0.5)"}}>
            <Play size={26} fill="#fff" color="#fff"/></button>
            <button onClick={stopRun} style={{...BtnBase,background:"linear-gradient(135deg,#FF6B6B,#c0392b)"}}>
              <Square size={26} fill="#fff" color="#fff"/></button></>)}
        </div>
      </div>)}

      {/* ═══ FEED TAB ═══ */}
      {tab==="feed"&&(<div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:14}}>
          Latest from you and {friends.length} friends
        </div>
        {FEED_DATA.map(post=>(<FeedPost key={post.id} post={post}
          kudosGiven={kudos[post.id]?.given} kudosCount={kudos[post.id]?.count||post.kudos}
          onKudos={()=>toggleKudos(post.id)} onOpenComments={()=>setOpenComments(post)}/>))}
      </div>)}

      {/* ═══ EXPLORE TAB ═══ */}
      {tab==="explore"&&(<div>
        <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
          {[
            {id:"segments",label:"Segments",icon:<Mountain size={12}/>},
            {id:"routes",label:"Routes",icon:<MapPinned size={12}/>},
            {id:"clubs",label:"Clubs",icon:<Users size={12}/>},
            {id:"challenges",label:"Challenges",icon:<Trophy size={12}/>},
          ].map(t=>(<button key={t.id} onClick={()=>setExploreTab(t.id)} style={{
            display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:18,border:"none",whiteSpace:"nowrap",
            background:exploreTab===t.id?"#a78bfa":"rgba(255,255,255,0.06)",
            color:exploreTab===t.id?"#1a1a2e":"rgba(255,255,255,0.7)",
            fontSize:12,fontWeight:exploreTab===t.id?700:500,cursor:"pointer"}}>{t.icon}{t.label}</button>))}
        </div>

        {exploreTab==="segments"&&(<div>
          <SectionHeader title="Popular Segments" subtitle="Race against the community on these routes"/>
          {SEGMENTS.map(s=><SegmentCard key={s.id} seg={s}/>)}
        </div>)}

        {exploreTab==="routes"&&(<div>
          <SectionHeader title="Popular Routes" subtitle="Discover where the community runs"/>
          {ROUTES.map(r=><RouteCard key={r.id} route={r}/>)}
        </div>)}

        {exploreTab==="clubs"&&(<div>
          <SectionHeader title="Running Clubs" subtitle="Join groups and run together"/>
          {clubs.map(c=><ClubCard key={c.id} club={c} onToggle={()=>toggleClub(c.id)}/>)}
        </div>)}

        {exploreTab==="challenges"&&(<div>
          <SectionHeader title="Active Challenges" subtitle="Push your limits with the community"/>
          {challenges.map(c=><ChallengeCard key={c.id} ch={c} onJoin={()=>joinChallenge(c.id)}/>)}
        </div>)}
      </div>)}

      {/* ═══ MATCH TAB ═══ */}
      {tab==="match"&&(<div>
        <div style={{padding:"12px 14px",borderRadius:14,marginBottom:18,
          background:"linear-gradient(135deg,rgba(253,121,168,0.15),rgba(167,139,250,0.1))",
          border:"1px solid rgba(253,121,168,0.25)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <Heart size={14} color="#fd79a8" fill="#fd79a8"/>
            <span style={{fontWeight:700,fontSize:13,color:"#fff"}}>Find Your Running Match</span>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>
            Running buddies, friends, or maybe more — connect with runners in your area who match your pace & vibe.
          </div>
        </div>
        {matchIdx<MATCHES.length?(
          <MatchCard m={MATCHES[matchIdx]}
            onSkip={()=>setMatchIdx(i=>i+1)}
            onConnect={()=>{
              setConnectedMatches(p=>[...p,MATCHES[matchIdx]]);
              setMatchIdx(i=>i+1);
            }}/>
        ):(
          <Card style={{textAlign:"center",padding:"30px 16px"}}>
            <div style={{fontSize:40,marginBottom:10}}>🎉</div>
            <div style={{fontWeight:800,color:"#fff",fontSize:16,marginBottom:6}}>You're all caught up!</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Check back later for new matches in your area.</div>
            <button onClick={()=>setMatchIdx(0)} style={{marginTop:14,padding:"10px 20px",borderRadius:20,border:"none",
              background:"#a78bfa",color:"#1a1a2e",fontWeight:700,cursor:"pointer",fontSize:13}}>Start Over</button>
          </Card>
        )}
        {connectedMatches.length>0&&(<div style={{marginTop:20}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:700,
            textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Connection requests sent</div>
          {connectedMatches.map((m,i)=>(<Card key={i} style={{marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <Avatar initials={m.avatar} color={m.color} size={36}/>
            <div style={{flex:1,fontSize:13,color:"#fff",fontWeight:600}}>{m.name}, {m.age}</div>
            <div style={{fontSize:11,color:"#FFEAA7"}}>⏳ Pending</div>
          </Card>))}
        </div>)}
      </div>)}

      {/* ═══ ME TAB ═══ */}
      {tab==="me"&&(<div>
        <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
          {[
            {id:"achievements",label:"Badges",icon:<Award size={12}/>},
            {id:"goals",label:"Goals",icon:<Target size={12}/>},
            {id:"prs",label:"Records",icon:<Crown size={12}/>},
            {id:"friends",label:"Friends",icon:<Users size={12}/>},
            {id:"history",label:"History",icon:<TrendingUp size={12}/>},
          ].map(t=>(<button key={t.id} onClick={()=>setMeTab(t.id)} style={{
            display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:18,border:"none",whiteSpace:"nowrap",
            background:meTab===t.id?"#a78bfa":"rgba(255,255,255,0.06)",
            color:meTab===t.id?"#1a1a2e":"rgba(255,255,255,0.7)",
            fontSize:12,fontWeight:meTab===t.id?700:500,cursor:"pointer"}}>{t.icon}{t.label}</button>))}
        </div>

        {meTab==="achievements"&&(<div>
          <SectionHeader title="Achievements" subtitle={`${ACHIEVEMENTS.filter(a=>a.earned).length} of ${ACHIEVEMENTS.length} earned`}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {ACHIEVEMENTS.map(a=><AchievementBadge key={a.id} a={a}/>)}
          </div>
        </div>)}

        {meTab==="goals"&&(<div>
          <SectionHeader title="Your Goals" subtitle="Track your progress"/>
          {GOALS.map(g=><GoalCard key={g.id} g={g}/>)}
          <div style={{marginTop:18}}>
            <SectionHeader title="This Week's Training Plan"/>
            <Card>
              {TRAINING_PLAN.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,
                padding:"10px 0",borderBottom:i<TRAINING_PLAN.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
                <div style={{width:36,textAlign:"center"}}>
                  <div style={{fontSize:11,color:d.today?"#a78bfa":"rgba(255,255,255,0.4)",fontWeight:700,textTransform:"uppercase"}}>{d.day}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,color:d.done?"rgba(255,255,255,0.4)":"#fff",fontSize:13,
                    textDecoration:d.done?"line-through":"none"}}>{d.workout}</div>
                  {d.target&&<div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>{d.target}</div>}
                </div>
                {d.done?<Check size={16} color="#4ECDC4"/>:d.today?<div style={{fontSize:10,color:"#a78bfa",fontWeight:700}}>TODAY</div>:null}
              </div>))}
            </Card>
          </div>
        </div>)}

        {meTab==="prs"&&(<div>
          <SectionHeader title="Personal Records" subtitle="Your fastest & furthest"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {PRS.map((p,i)=>(<Card key={i}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <Crown size={12} color="#FFEAA7"/>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{p.label}</span>
              </div>
              <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{p.val}</div>
              <div style={{fontSize:10,color:"#FFEAA7",marginTop:3,fontWeight:600}}>Set {p.date}</div>
            </Card>))}
          </div>
        </div>)}

        {meTab==="friends"&&(<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>{friends.length+1} runners</span>
            <button onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:6,
              padding:"8px 14px",borderRadius:18,border:"none",background:"linear-gradient(135deg,#a78bfa,#6d28d9)",
              color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12}}>
              <Plus size={14}/>Add Friend
            </button>
          </div>
          <Card style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <Trophy size={15} color="#FFEAA7"/>
              <span style={{fontWeight:800,fontSize:15}}>Leaderboard</span>
            </div>
            <Leaderboard friends={friends} myData={myRuns} period={period} setPeriod={setPeriod}/>
          </Card>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:700,
            textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Your Friends</div>
          {friends.map(f=>(<Card key={f.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
            <Avatar initials={f.avatar} color={f.color} size={44}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>{f.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{f.runs.week.toFixed(1)}km this week</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:16,fontWeight:800}}>{f.runs.day}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>km today</div>
            </div>
          </Card>))}
        </div>)}

        {meTab==="history"&&(<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            {[
              {label:"This Week",val:"14.2 km",sub:"3 runs",c:"#a78bfa"},
              {label:"This Month",val:"58.0 km",sub:"12 runs",c:"#00d4ff"},
              {label:"This Year",val:"650 km",sub:"~52 runs",c:"#4ECDC4"},
              {label:"All Time",val:"1,820 km",sub:"Since 2022",c:"#FFEAA7"},
            ].map(c=>(<Card key={c.label}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:6}}>{c.label}</div>
              <div style={{fontSize:20,fontWeight:900}}>{c.val}</div>
              <div style={{fontSize:11,color:c.c,marginTop:4,fontWeight:600}}>{c.sub}</div>
            </Card>))}
          </div>
          <SectionHeader title="Recent Runs"/>
          {sessions.map((s,i)=>(<Card key={i} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,borderRadius:12,
              background:"linear-gradient(135deg,rgba(167,139,250,0.15),rgba(109,40,217,0.15))",
              border:"1px solid rgba(167,139,250,0.25)",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Activity size={18} color="#a78bfa"/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15}}>{s.km} km</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>{s.date} · {s.dur}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#00d4ff"}}>{s.pace}/km</div>
              <div style={{fontSize:11,color:"#FF6B6B",marginTop:2}}>♥ {s.hr}</div>
            </div>
          </Card>))}
        </div>)}
      </div>)}

      {showAdd&&<AddFriendModal onClose={()=>setShowAdd(false)} onAdd={s=>{
        setFriends(p=>[...p,{id:Date.now(),...s,runs:{
          day:+(Math.random()*8).toFixed(1),week:+(Math.random()*40).toFixed(1),
          month:+(Math.random()*150).toFixed(1),year:+(Math.random()*1500).toFixed(0),
          all:+(Math.random()*5000).toFixed(0)}}]);
        setShowAdd(false);
      }}/>}
      {openComments&&<CommentsModal post={openComments} onClose={()=>setOpenComments(null)}/>}
    </div>

    {/* Bottom Nav - 5 tabs */}
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,
      background:"rgba(8,12,35,0.97)",backdropFilter:"blur(20px)",
      borderTop:"1px solid rgba(255,255,255,0.09)",display:"flex",padding:"10px 0 14px"}}>
      {[
        {id:"run",icon:<Activity size={20}/>,label:"Run"},
        {id:"feed",icon:<Rss size={20}/>,label:"Feed"},
        {id:"explore",icon:<Compass size={20}/>,label:"Explore"},
        {id:"match",icon:<Heart size={20}/>,label:"Match"},
        {id:"me",icon:<UserIcon size={20}/>,label:"Me"},
      ].map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{
        flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",
        alignItems:"center",gap:3,color:tab===t.id?"#a78bfa":"rgba(255,255,255,0.3)",transition:"color 0.2s"}}>
        {t.icon}
        <span style={{fontSize:10,fontWeight:tab===t.id?700:400}}>{t.label}</span>
        {tab===t.id&&<div style={{width:4,height:4,borderRadius:"50%",background:"#a78bfa",marginTop:1}}/>}
      </button>))}
    </div>
  </div>);
}