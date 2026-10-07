import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // 🚀 Supabase ఇంపోర్ట్

const AnalysisDashboard = () => {
  const [stats, setStats] = useState({
    overallHighest: 0, overallLowest: 0,
    mathHigh: 0, mathLow: 0,
    phyHigh: 0, phyLow: 0,
    chemHigh: 0, chemLow: 0,
    totalStudents: 0,
    // కౌంట్స్ మరియు పర్సంటేజీలు రెండు స్టోర్ చేసుకోవడానికి
    m: { c: 0, w: 0, u: 0, cP: 0, wP: 0, uP: 100 },
    p: { c: 0, w: 0, u: 0, cP: 0, wP: 0, uP: 100 },
    ch: { c: 0, w: 0, u: 0, cP: 0, wP: 0, uP: 100 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.from('jee_results').select('*');
        
        if (error) {
          console.error("Error fetching data:", error);
          return;
        }

        if (data && data.length > 0) {
          const totals = data.map(d => d.total_marks || 0);
          const maths = data.map(d => d.math_marks || 0);
          const phys = data.map(d => d.phy_marks || 0);
          const chems = data.map(d => d.chem_marks || 0);

          const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
          
          const calcStats = (cArr, wArr, uArr) => {
            const avgC = Math.round(avg(cArr));
            const avgW = Math.round(avg(wArr));
            const avgU = Math.round(avg(uArr));
            const total = (avgC + avgW + avgU) || 1;
            const cP = Math.round((avgC / total) * 100);
            const wP = Math.round((avgW / total) * 100);
            // కౌంట్స్ (కింద చూపించడానికి), పర్సంటేజీలు (చార్ట్ లో చూపించడానికి)
            return { c: avgC, w: avgW, u: avgU, cP, wP, uP: Math.max(0, 100 - cP - wP) };
          };

          setStats({
            overallHighest: Math.max(...totals),
            overallLowest: Math.min(...totals),
            mathHigh: Math.max(...maths),
            mathLow: Math.min(...maths),
            phyHigh: Math.max(...phys),
            phyLow: Math.min(...phys),
            chemHigh: Math.max(...chems),
            chemLow: Math.min(...chems),
            totalStudents: data.length,
            m: calcStats(data.map(d => d.math_c || 0), data.map(d => d.math_w || 0), data.map(d => d.math_u || 0)),
            p: calcStats(data.map(d => d.phy_c || 0), data.map(d => d.phy_w || 0), data.map(d => d.phy_u || 0)),
            ch: calcStats(data.map(d => d.chem_c || 0), data.map(d => d.chem_w || 0), data.map(d => d.chem_u || 0))
          });
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    fetchStats();
  }, []);

  const renderChartLabels = (c, w, u) => {
    const slices = [
        { val: c, color: '#10b981' }, 
        { val: w, color: '#ef4444' }, 
        { val: u, color: '#94a3b8' }  
    ];
    let currentPercent = 0;
    
    return slices.map((slice, i) => {
        if(slice.val === 0) return null;
        
        const mid = currentPercent + (slice.val / 2);
        currentPercent += slice.val;
        
        const angleRad = (mid / 100) * 2 * Math.PI - (Math.PI / 2);
        
        const inX = 75 + 45 * Math.cos(angleRad);
        const inY = 75 + 45 * Math.sin(angleRad);
        const outX = 75 + 73 * Math.cos(angleRad);
        const outY = 75 + 73 * Math.sin(angleRad);
        
        const dirX = Math.cos(angleRad) >= 0 ? 1 : -1;
        const dirY = Math.sin(angleRad) >= 0 ? 1 : -1;
        
        const midX = outX + 15 * dirX;
        const midY = outY + 15 * dirY;
        const endX = midX + 20 * dirX;
        
        const textX = endX + 5 * dirX;
        const textY = midY + 4; 
        const textAnchor = dirX > 0 ? "start" : "end";

        return (
            <React.Fragment key={i}>
                <span className="inner-label" style={{ left: `${inX}px`, top: `${inY}px` }}>{slice.val}</span>
                <path d={`M ${outX} ${outY} L ${midX} ${midY} L ${endX} ${midY}`} fill="none" stroke={slice.color} strokeWidth="1.5" />
                <text x={textX} y={textY} fill={slice.color} fontSize="12" fontWeight="bold" textAnchor={textAnchor}>{slice.val}%</text>
            </React.Fragment>
        );
    });
  };

  return (
    <section className="w-full pt-6 pb-16 px-4 border-t border-slate-800/60" style={{ 
      background: 'radial-gradient(ellipse at top, #162846 0%, #020617 80%)', 
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh'
    }}>
      
      <style>{`
        .donut-chart { width: 150px; height: 150px; border-radius: 50%; position: relative; display: flex; align-items: center; justify-content: center; }
        .donut-inner { width: 100px; height: 100px; background-color: #1e293b; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10; }
        
        .glass-card { background: #1e293b; border: 1px solid #334155; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
        .glass-card:hover { transform: translateY(-8px); border-color: #38bdf8; box-shadow: 0 15px 35px -5px rgba(56, 189, 248, 0.2); }
        
        .text-glow { text-shadow: 0 0 20px rgba(56, 189, 248, 0.5); }
        .icon-box-math { border-color: #06b6d4; box-shadow: 0 0 15px rgba(6, 182, 212, 0.4); }
        .icon-box-phy { border-color: #22c55e; box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
        .icon-box-chem { border-color: #f97316; box-shadow: 0 0 15px rgba(249, 115, 22, 0.4); }
        
        .inner-label { position: absolute; transform: translate(-50%, -50%); font-weight: bold; font-size: 0.8rem; color: white; z-index: 20; }
      `}</style>

      <header className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-white">JEE Main</span>{' '}
          <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            Exam Analysis Dashboard
          </span>
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Based on <span className="text-cyan-400 font-bold">{stats.totalStudents}</span> students evaluated so far
        </p>
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-7 flex justify-between items-center relative overflow-hidden border-cyan-400/40 shadow-[inset_0_0_20px_rgba(34,211,238,0.05),0_10px_25px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent left-0"></div>
            <div className="flex items-center gap-4">
              <div className="text-3xl bg-white/5 p-3 rounded-xl flex items-center justify-center border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">🏆</div>
              <h2 className="text-slate-300 text-sm md:text-base font-extrabold uppercase tracking-widest whitespace-nowrap">Overall Highest Score</h2>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] leading-none">{stats.overallHighest}</div>
              <p className="text-slate-400 mt-1.5 text-xs md:text-sm font-semibold">out of 300</p>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-7 flex justify-between items-center relative overflow-hidden border-orange-400/30 shadow-[inset_0_0_20px_rgba(251,146,60,0.05),0_10px_25px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent left-0"></div>
            <div className="flex items-center gap-4">
              <div className="text-3xl bg-white/5 p-3 rounded-xl flex items-center justify-center border border-orange-400/20 shadow-[0_0_15px_rgba(251,146,60,0.2)]">📉</div>
              <h2 className="text-slate-300 text-sm md:text-base font-extrabold uppercase tracking-widest whitespace-nowrap">Overall Lowest Score</h2>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.5)] leading-none">{stats.overallLowest}</div>
              <p className="text-slate-400 mt-1.5 text-xs md:text-sm font-semibold">out of 300</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Mathematics Card */}
          <div className="glass-card rounded-2xl p-0 flex flex-col h-full overflow-hidden border-cyan-900/50">
            <div className="bg-slate-800/80 p-5 flex items-center border-b border-gray-700/50">
              <div className="w-10 h-10 rounded-xl border-2 icon-box-math flex items-center justify-center mr-4 bg-slate-900/50 text-cyan-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="12 7 17 7 17 12"></polyline><circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none"></circle><circle cx="15" cy="15" r="1.5" fill="currentColor" stroke="none"></circle></svg>
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">Mathematics</h3>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between mb-8 px-2">
                <div className="text-center"><p className="text-gray-400 text-sm mb-1">Highest Mark</p><p className="text-3xl font-bold text-white">{stats.mathHigh}</p></div>
                <div className="text-center"><p className="text-gray-400 text-sm mb-1">Lowest Mark</p><p className="text-3xl font-bold text-white">{stats.mathLow}</p></div>
              </div>

              <div className="flex flex-col items-center flex-grow">
                <div className="relative mb-6 mt-2 w-[150px] h-[150px]">
                  <div className="donut-chart shadow-[0_0_30px_rgba(16,185,129,0.15)]" style={{ background: `conic-gradient(#10b981 0% ${stats.m.cP}%, #ef4444 ${stats.m.cP}% ${stats.m.cP + stats.m.wP}%, #64748b ${stats.m.cP + stats.m.wP}% 100%)` }}>
                    <div className="donut-inner text-cyan-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="12 7 17 7 17 12"></polyline><circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none"></circle><circle cx="15" cy="15" r="1.5" fill="currentColor" stroke="none"></circle></svg>
                    </div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible', zIndex: 5 }}>
                    {renderChartLabels(stats.m.cP, stats.m.wP, stats.m.uP)}
                  </svg>
                </div>
                
                <div className="flex justify-center space-x-4 text-xs font-medium w-full mb-6 mt-2">
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-emerald-500 mr-2"></div><span className="text-white">Correct</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-red-500 mr-2"></div><span className="text-white">Wrong</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-slate-300 mr-2"></div><span className="text-white">Unattempted</span></div>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-700 pt-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xs text-gray-400 mb-1">Correct</p><p className="text-xl font-bold text-emerald-500">{stats.m.c}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Wrong</p><p className="text-xl font-bold text-red-500">{stats.m.w}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Unattempted</p><p className="text-xl font-bold text-slate-300">{stats.m.u}</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Physics Card */}
          <div className="glass-card rounded-2xl p-0 flex flex-col h-full overflow-hidden border-green-900/50">
            <div className="bg-slate-800/80 p-5 flex items-center border-b border-gray-700/50">
              <div className="w-10 h-10 rounded-xl border-2 icon-box-phy flex items-center justify-center mr-4 bg-slate-900/50 text-green-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"></ellipse></svg>
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">Physics</h3>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between mb-8 px-2">
                <div className="text-center"><p className="text-gray-400 text-sm mb-1">Highest Mark</p><p className="text-3xl font-bold text-white">{stats.phyHigh}</p></div>
                <div className="text-center"><p className="text-gray-400 text-sm mb-1">Lowest Mark</p><p className="text-3xl font-bold text-white">{stats.phyLow}</p></div>
              </div>

              <div className="flex flex-col items-center flex-grow">
                <div className="relative mb-6 mt-2 w-[150px] h-[150px]">
                  <div className="donut-chart shadow-[0_0_30px_rgba(16,185,129,0.15)]" style={{ background: `conic-gradient(#10b981 0% ${stats.p.cP}%, #ef4444 ${stats.p.cP}% ${stats.p.cP + stats.p.wP}%, #64748b ${stats.p.cP + stats.p.wP}% 100%)` }}>
                    <div className="donut-inner text-white">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"></ellipse></svg>
                    </div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible', zIndex: 5 }}>
                    {renderChartLabels(stats.p.cP, stats.p.wP, stats.p.uP)}
                  </svg>
                </div>
                
                <div className="flex justify-center space-x-4 text-xs font-medium w-full mb-6 mt-2">
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-emerald-500 mr-2"></div><span className="text-white">Correct</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-red-500 mr-2"></div><span className="text-white">Wrong</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-slate-300 mr-2"></div><span className="text-white">Unattempted</span></div>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-700 pt-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xs text-gray-400 mb-1">Correct</p><p className="text-xl font-bold text-emerald-500">{stats.p.c}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Wrong</p><p className="text-xl font-bold text-red-500">{stats.p.w}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Unattempted</p><p className="text-xl font-bold text-slate-300">{stats.p.u}</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chemistry Card */}
          <div className="glass-card rounded-2xl p-0 flex flex-col h-full overflow-hidden border-orange-900/50">
            <div className="bg-slate-800/80 p-5 flex items-center border-b border-gray-700/50">
              <div className="w-10 h-10 rounded-xl border-2 icon-box-chem flex items-center justify-center mr-4 bg-slate-900/50 text-orange-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 3h6"></path><path d="M10 3v5l-6 10a2 2 0 001.7 3h12.6a2 2 0 001.7-3l-6-10V3"></path><path d="M6 16h12"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">Chemistry</h3>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between mb-8 px-2">
                <div className="text-center"><p className="text-gray-400 text-sm mb-1">Highest Mark</p><p className="text-3xl font-bold text-white">{stats.chemHigh}</p></div>
                <div className="text-center"><p className="text-gray-400 text-sm mb-1">Lowest Mark</p><p className="text-3xl font-bold text-white">{stats.chemLow}</p></div>
              </div>

              <div className="flex flex-col items-center flex-grow">
                <div className="relative mb-6 mt-2 w-[150px] h-[150px]">
                  <div className="donut-chart shadow-[0_0_30px_rgba(16,185,129,0.15)]" style={{ background: `conic-gradient(#10b981 0% ${stats.ch.cP}%, #ef4444 ${stats.ch.cP}% ${stats.ch.cP + stats.ch.wP}%, #64748b ${stats.ch.cP + stats.ch.wP}% 100%)` }}>
                    <div className="donut-inner text-orange-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M9 3h6"></path><path d="M10 3v5l-6 10a2 2 0 001.7 3h12.6a2 2 0 001.7-3l-6-10V3"></path><path d="M6 16h12"></path></svg>
                    </div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible', zIndex: 5 }}>
                    {renderChartLabels(stats.ch.cP, stats.ch.wP, stats.ch.uP)}
                  </svg>
                </div>
                
                <div className="flex justify-center space-x-4 text-xs font-medium w-full mb-6 mt-2">
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-emerald-500 mr-2"></div><span className="text-white">Correct</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-red-500 mr-2"></div><span className="text-white">Wrong</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-slate-300 mr-2"></div><span className="text-white">Unattempted</span></div>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-700 pt-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xs text-gray-400 mb-1">Correct</p><p className="text-xl font-bold text-emerald-500">{stats.ch.c}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Wrong</p><p className="text-xl font-bold text-red-500">{stats.ch.w}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Unattempted</p><p className="text-xl font-bold text-slate-300">{stats.ch.u}</p></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AnalysisDashboard;