import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { RAW_DATA, YEARS, ALL_MONTHS } from "./data";

const C = {
  bg: "#0B0F1A", card: "#111827", cardBorder: "#1E293B",
  accent: "#F97316", accentSoft: "rgba(249,115,22,0.12)",
  teal: "#14B8A6", yellow: "#FBBF24", text: "#F1F5F9",
  muted: "#64748B", grid: "#1E293B", green: "#4ADE80",
  red: "#F87171", blue: "#60A5FA", purple: "#A78BFA",
};

const fmtShort = n => n==null?"—":n>=1e9?"Rp "+(n/1e9).toFixed(1)+"M":n>=1e6?"Rp "+(n/1e6).toFixed(1)+"jt":n>=1e3?"Rp "+(n/1e3).toFixed(0)+"rb":"Rp "+n;
const fmtFull  = n => n==null?"—":"Rp "+n.toLocaleString("id-ID");
const fmtNum   = n => n==null?"—":n.toLocaleString("id-ID");
const fmtPct   = n => n==null?"—":n.toFixed(2)+"%";
const fmtRoi   = n => n==null?"—":n.toFixed(2)+"x";

const METRICS = [
  { key:"revenue",      label:"Revenue",        fmt:fmtShort, fmtFull:fmtFull,  color:C.accent,   isAvg:false },
  { key:"traffic",      label:"Traffic",        fmt:fmtNum,   fmtFull:fmtNum,   color:C.teal,     isAvg:false },
  { key:"productViews", label:"Produk Dilihat", fmt:fmtNum,   fmtFull:fmtNum,   color:"#818CF8",  isAvg:false },
  { key:"cvrToko",      label:"CVR Toko",       fmt:fmtPct,   fmtFull:fmtPct,   color:C.yellow,   isAvg:true  },
  { key:"aov",          label:"AOV",            fmt:fmtShort, fmtFull:fmtFull,  color:"#F472B6",  isAvg:true  },
  { key:"budgetAds",    label:"Budget Ads",     fmt:fmtShort, fmtFull:fmtFull,  color:"#34D399",  isAvg:false },
  { key:"crAds",        label:"C/R Ads",        fmt:fmtPct,   fmtFull:fmtPct,   color:C.blue,     isAvg:true  },
  { key:"roi",          label:"ROI Ads",        fmt:fmtRoi,   fmtFull:fmtRoi,   color:C.purple,   isAvg:true  },
];

const agg = (arr, isAvg) => {
  const v = arr.filter(x => x != null);
  if (!v.length) return null;
  return isAvg ? v.reduce((a,b)=>a+b,0)/v.length : v.reduce((a,b)=>a+b,0);
};

const availableIdxs = year => ALL_MONTHS.map((_,i)=>i).filter(i => RAW_DATA[year]?.revenue[i] != null);

function resolveComparePeriod(mode, curYear, startIdx, endIdx) {
  if (mode === "yoy") {
    const prevYear = curYear - 1;
    if (!RAW_DATA[prevYear]) return null;
    return { year: prevYear, startIdx, endIdx };
  }
  const len = endIdx - startIdx + 1;
  const newEnd   = startIdx - 1;
  const newStart = newEnd - len + 1;
  if (newStart < 0) {
    const prevYear = curYear - 1;
    if (!RAW_DATA[prevYear]) return null;
    return { year: prevYear, startIdx: 12 + newStart, endIdx: 11 };
  }
  return { year: curYear, startIdx: newStart, endIdx: newEnd };
}

function periodLabel(year, s, e) {
  if (s === e) return `${ALL_MONTHS[s]} ${year}`;
  return `${ALL_MONTHS[s]}–${ALL_MONTHS[e]} ${year}`;
}

function KPICard({ metric, curVal, prevVal, prevLbl }) {
  const growth = curVal!=null && prevVal!=null && prevVal!==0
    ? ((curVal - prevVal) / prevVal) * 100 : null;
  return (
    <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"16px 20px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:metric.color, borderRadius:"12px 0 0 12px" }}/>
      <div style={{ fontSize:11, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>{metric.label}</div>
      <div style={{ fontSize:20, fontWeight:700, color:C.text, fontFamily:"'DM Mono',monospace", lineHeight:1.3 }}>
        {metric.fmt(curVal)}
      </div>
      {growth!=null ? (
        <div style={{ fontSize:12, marginTop:5, color:growth>=0?C.green:C.red, fontWeight:600 }}>
          {growth>=0?"▲":"▼"} {Math.abs(growth).toFixed(1)}%
          <span style={{ color:C.muted, fontWeight:400, marginLeft:5, fontSize:11 }}>vs {prevLbl}</span>
        </div>
      ) : (
        <div style={{ fontSize:11, marginTop:5, color:C.muted }}>Tidak ada data pembanding</div>
      )}
      {prevVal!=null && (
        <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>
          Sebelumnya: <span style={{ color:C.text }}>{metric.fmt(prevVal)}</span>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, metricKey }) => {
  if (!active || !payload?.length) return null;
  const m = METRICS.find(x=>x.key===metricKey);
  return (
    <div style={{ background:"#1E293B", border:`1px solid ${C.cardBorder}`, borderRadius:8, padding:"10px 14px", fontSize:13 }}>
      <div style={{ color:C.muted, marginBottom:4 }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {m?.fmtFull(p.value)}</div>
      ))}
    </div>
  );
};

function MonthlyChart({ metricKey, years }) {
  const metric = METRICS.find(m=>m.key===metricKey);
  const yearColors = {2023:"#64748B",2024:C.blue,2025:C.accent,2026:C.green};
  const data = ALL_MONTHS.map((mo,i)=>{
    const row = { month: mo };
    years.forEach(y => { row[y] = RAW_DATA[y]?.[metricKey]?.[i] ?? null; });
    return row;
  });
  return (
    <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:20, marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:16 }}>{metric.label} — Perbandingan Bulanan</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{top:5,right:10,left:0,bottom:5}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
          <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={metric.fmt} width={64}/>
          <Tooltip content={<CustomTooltip metricKey={metricKey}/>}/>
          <Legend wrapperStyle={{fontSize:12}}/>
          {years.map(y=>(
            <Line key={y} type="monotone" dataKey={y} stroke={yearColors[y]} strokeWidth={2}
              dot={{r:3}} connectNulls={false} name={String(y)}/>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function YearlyBarChart({ metricKey }) {
  const metric = METRICS.find(m=>m.key===metricKey);
  const data = YEARS.map(y=>({ year:String(y), value: agg(RAW_DATA[y][metricKey], metric.isAvg) }));
  return (
    <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:20 }}>
      <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:16 }}>
        {metric.label} <span style={{color:C.muted,fontWeight:400,fontSize:11}}>({metric.isAvg?"rata-rata":"total"})</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{top:5,right:10,left:0,bottom:5}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
          <XAxis dataKey="year" tick={{fill:C.muted,fontSize:12}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={metric.fmt} width={64}/>
          <Tooltip content={<CustomTooltip metricKey={metricKey}/>}/>
          <Bar dataKey="value" fill={metric.color} radius={[6,6,0,0]} name={metric.label}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [rangeYear,   setRangeYear]   = useState(2026);
  const [startIdx,    setStartIdx]    = useState(0);
  const [endIdx,      setEndIdx]      = useState(2);
  const [compareMode, setCompareMode] = useState("mom");
  const [activeMetric, setActiveMetric] = useState("revenue");
  const [compareYears, setCompareYears] = useState([2024,2025,2026]);
  const toggleYear = y => setCompareYears(p => p.includes(y)?(p.length>1?p.filter(x=>x!==y):p):[...p,y].sort());

  const avail     = useMemo(() => availableIdxs(rangeYear), [rangeYear]);
  const safeStart = Math.min(startIdx, avail[avail.length-1] ?? 0);
  const safeEnd   = Math.max(Math.min(endIdx, avail[avail.length-1] ?? 0), safeStart);
  const curIdxs   = avail.filter(i => i >= safeStart && i <= safeEnd);

  const compPeriod = useMemo(
    () => resolveComparePeriod(compareMode, rangeYear, safeStart, safeEnd),
    [compareMode, rangeYear, safeStart, safeEnd]
  );
  const prevIdxs = compPeriod
    ? availableIdxs(compPeriod.year).filter(i => i >= compPeriod.startIdx && i <= compPeriod.endIdx)
    : [];

  const curLbl  = periodLabel(rangeYear, safeStart, safeEnd);
  const prevLbl = compPeriod ? periodLabel(compPeriod.year, compPeriod.startIdx, compPeriod.endIdx) : "—";

  const kpiData = METRICS.map(m => ({
    metric: m,
    curVal:  agg(curIdxs.map(i => RAW_DATA[rangeYear][m.key][i]), m.isAvg),
    prevVal: compPeriod ? agg(prevIdxs.map(i => RAW_DATA[compPeriod.year][m.key][i]), m.isAvg) : null,
  }));

  const Btn = (onClick, active, label, color=C.accent) => (
    <button key={label} onClick={onClick} style={{
      padding:"5px 13px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer",
      background: active ? color+"22" : C.card,
      color: active ? color : C.muted,
      border: `1px solid ${active ? color : C.cardBorder}`,
      transition:"all 0.15s",
    }}>{label}</button>
  );

  const TabBtn = (id, label) => (
    <button key={id} onClick={()=>setTab(id)} style={{
      padding:"14px 20px", fontSize:13, fontWeight:600, cursor:"pointer",
      background:"transparent", border:"none",
      color: tab===id ? C.accent : C.muted,
      borderBottom: tab===id ? `2px solid ${C.accent}` : "2px solid transparent",
    }}>{label}</button>
  );

  const applyPreset = (n) => {
    const av = availableIdxs(rangeYear);
    const l  = av.length;
    if (n === "full") { setStartIdx(av[0]); setEndIdx(av[l-1]); }
    else { setStartIdx(av[Math.max(0,l-n)]); setEndIdx(av[l-1]); }
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", color:C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      <div style={{ borderBottom:`1px solid ${C.cardBorder}`, padding:"20px 28px" }}>
        <div style={{ fontSize:11, color:C.accent, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:4 }}>● Shopee Analytics</div>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>Performance Dashboard</div>
      </div>

      <div style={{ padding:"0 28px", borderBottom:`1px solid ${C.cardBorder}`, display:"flex", gap:4 }}>
        {TabBtn("overview","Overview")}
        {TabBtn("monthly","Bulanan")}
        {TabBtn("yearly","Tahunan")}
      </div>

      <div style={{ padding:"24px 28px" }}>

        {tab==="overview" && (<>
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"20px 22px", marginBottom:20 }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:28, marginBottom:18, alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.07em" }}>Tahun Data</div>
                <div style={{ display:"flex", gap:6 }}>
                  {YEARS.map(y => Btn(() => {
                    setRangeYear(y);
                    const av = availableIdxs(y);
                    setStartIdx(av[0] ?? 0);
                    setEndIdx(av[av.length-1] ?? 0);
                  }, rangeYear===y, String(y)))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.07em" }}>Mode Perbandingan</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {Btn(()=>setCompareMode("mom"), compareMode==="mom", "⟳  Periode Sebelumnya", C.purple)}
                  {Btn(()=>setCompareMode("yoy"), compareMode==="yoy", "📅  Tahun Sebelumnya",   C.purple)}
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:7 }}>
                  {compareMode==="mom"
                    ? "Dibandingkan dengan rentang waktu yang sama di periode sebelumnya"
                    : `Dibandingkan dengan bulan yang sama di tahun ${rangeYear-1}`}
                </div>
              </div>
            </div>

            <div style={{ borderTop:`1px solid ${C.cardBorder}`, marginBottom:18 }}/>

            <div>
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:10, flexWrap:"wrap" }}>
                <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Rentang Bulan</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {[{label:"1 Bln Terakhir",n:1},{label:"3 Bln Terakhir",n:3},{label:"6 Bln Terakhir",n:6},{label:"Full Year",n:"full"}].map(({label,n})=>(
                    <button key={label} onClick={()=>applyPreset(n)} style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:500, cursor:"pointer", background:C.bg, color:C.muted, border:`1px solid ${C.cardBorder}` }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {avail.map(i => {
                  const isStart=i===safeStart, isEnd=i===safeEnd, isInRange=i>=safeStart&&i<=safeEnd, isEdge=isStart||isEnd;
                  return (
                    <button key={i} onClick={()=>{
                      if(i<safeStart) setStartIdx(i);
                      else if(i>safeEnd) setEndIdx(i);
                      else if(isStart) setStartIdx(Math.min(i+1,safeEnd));
                      else if(isEnd)   setEndIdx(Math.max(i-1,safeStart));
                      else { setStartIdx(i); setEndIdx(i); }
                    }} style={{
                      padding:"7px 15px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer",
                      background: isEdge?C.teal:isInRange?"rgba(20,184,166,0.13)":C.bg,
                      color: isEdge?"#fff":isInRange?C.teal:C.muted,
                      border:`1px solid ${isInRange?C.teal+"88":C.cardBorder}`,
                      position:"relative",
                    }}>
                      {ALL_MONTHS[i]}
                      {isEdge&&(<span style={{ position:"absolute",top:-6,right:-4,fontSize:9,background:C.teal,color:"#fff",borderRadius:4,padding:"1px 4px" }}>{isStart?"dari":"s/d"}</span>)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:20 }}>
            <div style={{ background:C.accentSoft, border:`1px solid ${C.accent}44`, borderRadius:8, padding:"6px 16px", fontSize:13, fontWeight:700, color:C.accent }}>📌 {curLbl}</div>
            <div style={{ fontSize:12, color:C.muted }}>dibandingkan dengan</div>
            <div style={{ background:"rgba(167,139,250,0.1)", border:`1px solid ${C.purple}44`, borderRadius:8, padding:"6px 16px", fontSize:13, fontWeight:700, color:C.purple }}>{compPeriod?prevLbl:"—"}</div>
            <div style={{ fontSize:11, color:C.muted, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:6, padding:"4px 10px" }}>
              {compareMode==="mom"?"⟳ Periode Sebelumnya":"📅 Tahun Sebelumnya"}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:12, marginBottom:28 }}>
            {kpiData.map(({metric,curVal,prevVal})=>(
              <KPICard key={metric.key} metric={metric} curVal={curVal} prevVal={prevVal} prevLbl={prevLbl}/>
            ))}
          </div>

          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Revenue vs Budget Ads</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>{curLbl}</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={curIdxs.map(i=>({ month:ALL_MONTHS[i], revenue:RAW_DATA[rangeYear].revenue[i], budgetAds:RAW_DATA[rangeYear].budgetAds[i] }))} margin={{top:5,right:10,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
                <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1e6?"Rp "+(v/1e6).toFixed(0)+"jt":v>=1e3?"Rp "+(v/1e3).toFixed(0)+"rb":v} width={72}/>
                <Tooltip content={<CustomTooltip metricKey="revenue"/>}/>
                <Legend wrapperStyle={{fontSize:12}}/>
                <Bar dataKey="revenue"   fill={C.accent} radius={[4,4,0,0]} name="Revenue"/>
                <Bar dataKey="budgetAds" fill={C.teal}   radius={[4,4,0,0]} name="Budget Ads"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>)}

        {tab==="monthly" && (<>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:C.muted }}>Bandingkan tahun:</span>
            {YEARS.map(y=>{ const col={2023:"#64748B",2024:C.blue,2025:C.accent,2026:C.green}[y]; return Btn(()=>toggleYear(y),compareYears.includes(y),String(y),col); })}
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
            {METRICS.map(m=>Btn(()=>setActiveMetric(m.key),activeMetric===m.key,m.label,m.color))}
          </div>
          <MonthlyChart metricKey={activeMetric} years={compareYears}/>
        </>)}

        {tab==="yearly" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))", gap:16 }}>
            {METRICS.map(m=><YearlyBarChart key={m.key} metricKey={m.key}/>)}
          </div>
        )}
      </div>

      <div style={{ padding:"12px 28px 24px", fontSize:11, color:C.muted, borderTop:`1px solid ${C.cardBorder}`, marginTop:8 }}>
        Data: Shopee Seller Center • Update terakhir: Mar 2026 • Dashboard untuk analisis internal
      </div>
    </div>
  );
}
