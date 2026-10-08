import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 

const AnalysisDashboard = () => {
  const [stats, setStats] = useState({
    overallHighest: 0, overallLowest: 0,
    mathHigh: 0, mathLow: 0,
    phyHigh: 0, phyLow: 0,
    chemHigh: 0, chemLow: 0,
    totalStudents: 0,
    m: { c: 0, w: 0, u: 0, cP: 0, wP: 0, uP: 100 },
    p: { c: 0, w: 0, u: 0, cP: 0, wP: 0, uP: 100 },
    ch: { c: 0, w: 0, u: 0, cP: 0, wP: 0, uP: 100 }
  });

  const [animProgress, setAnimProgress] = useState(0);

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

  // 🚀 డేటా లోడ్ అయ్యాక యానిమేషన్ స్టార్ట్ చేసే కోడ్ (1.5 సెకండ్స్ Delay తో)
  useEffect(() => {
    if (stats.totalStudents > 0) {
      
      // పాపప్ క్లోజ్ చేయడానికి టైమ్ కోసం 1.5 సెకండ్స్ లేట్ గా స్టార్ట్ చేస్తున్నాం
      const delayTimer = setTimeout(() => {
        let start = null;
        const duration = 2500; // యానిమేషన్ టైమ్ 2.5 సెకండ్స్ (మరింత స్మూత్‌గా)
        
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          // Smooth ease-out effect
          const easeProgress = 1 - Math.pow(1 - progress, 4);
          setAnimProgress(easeProgress);
          
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      }, 1500); // ఇక్కడ 1500 అంటే 1.5 సెకండ్స్.

      return () => clearTimeout(delayTimer);
    }
  }, [stats.totalStudents]);

  // యానిమేటెడ్ పర్సంటేజీలు క్యాలిక్యులేట్ చేయడం
  const animMathC = stats.m.cP * animProgress;
  const animMathW = stats.m.wP * animProgress;
  const animMathU = Math.max(0, 100 - animMathC - animMathW);

  const animPhyC = stats.p.cP * animProgress;
  const animPhyW = stats.p.wP * animProgress;
  const animPhyU = Math.max(0, 100 - animPhyC - animPhyW);

  const animChemC = stats.ch.cP * animProgress;
  const animChemW = stats.ch.wP * animProgress;
  const animChemU = Math.max(0, 100 - animChemC - animChemW);

  const renderChartLabels = (c, w, u) => {
    const slices = [
        { val: c, color: '#10b981' }, 
        { val: w, color: '#ef4444' }, 
        { val: u, color: '#94a3b8' }  
    ];
    let currentPercent = 0;
    
    return slices.map((slice, i) => {
        // యానిమేషన్ లో మరీ చిన్నగా ఉన్నప్పుడు లైన్స్ హైడ్ చేయడానికి
        if(slice.val < 0.5) {
            currentPercent += slice.val;
            return null;
        }
        
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
        
        const displayVal = Math.round(slice.val);
        if (displayVal === 0) return null;

        return (
            <React.Fragment key={i}>
                <span className="inner-label" style={{ left: `${inX}px`, top: `${inY}px`, opacity: animProgress }}>{displayVal}</span>
                <path d={`M ${outX} ${outY} L ${midX} ${midY} L ${endX} ${midY}`} fill="none" stroke={slice.color} strokeWidth="1.5" style={{ opacity: animProgress }} />
                <text x={textX} y={textY} fill={slice.color} fontSize="12" fontWeight="bold" textAnchor={textAnchor} style={{ opacity: animProgress }}>{displayVal}%</text>
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
        
        .inner-label { position: absolute; transform: translate(-50%, -50%); font-weight: bold; font-size: 0.8rem; color: white; z-index: 20; transition: opacity 0.5s ease; }
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
          <div className="glass-card rounded-full px-10 py-5 flex justify-between items-center relative overflow-hidden border-cyan-400/40 shadow-[inset_0_0_20px_rgba(34,211,238,0.05),0_10px_25px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent left-0"></div>
            <div className="flex items-center gap-4">
              <div className="text-3xl bg-white/5 p-3 rounded-full flex items-center justify-center border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">🏆</div>
              <h2 className="text-slate-300 text-sm md:text-base font-extrabold uppercase tracking-widest whitespace-nowrap">Overall Highest Score</h2>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] leading-none">
                {Math.round(stats.overallHighest * animProgress)}
              </div>
              <p className="text-slate-400 mt-1.5 text-xs md:text-sm font-semibold">out of 300</p>
            </div>
          </div>
          
          <div className="glass-card rounded-full px-10 py-5 flex justify-between items-center relative overflow-hidden border-orange-400/30 shadow-[inset_0_0_20px_rgba(251,146,60,0.05),0_10px_25px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent left-0"></div>
            <div className="flex items-center gap-4">
              <div className="text-3xl bg-white/5 p-3 rounded-full flex items-center justify-center border border-orange-400/20 shadow-[0_0_15px_rgba(251,146,60,0.2)]">📉</div>
              <h2 className="text-slate-300 text-sm md:text-base font-extrabold uppercase tracking-widest whitespace-nowrap">Overall Lowest Score</h2>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.5)] leading-none">
                {Math.round(stats.overallLowest * animProgress)}
              </div>
              <p className="text-slate-400 mt-1.5 text-xs md:text-sm font-semibold">out of 300</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Mathematics Card */}
          <div className="glass-card rounded-3xl p-0 flex flex-col h-full overflow-hidden border-slate-700/50 pb-6">
            <div className="bg-[#c8e1f5] mx-4 mt-4 p-3 rounded-full flex items-center justify-center shadow-md">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 overflow-hidden border border-slate-700/50">
                <img src="/math-symbol.jpg" alt="Math" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-wide">Mathematics</h3>
            </div>
            
            <div className="px-6 pt-8 flex flex-col flex-grow">
              <div className="flex justify-between mb-8 px-2">
                <div className="text-center">
                  <p className="text-white text-sm mb-2 font-medium">Highest Mark</p>
                  <div className="bg-white rounded-full px-5 py-1.5 shadow-lg inline-block">
                    <p className="text-2xl font-black text-green-700">{Math.round(stats.mathHigh * animProgress)}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white text-sm mb-2 font-medium">Lowest Mark</p>
                  <div className="bg-white rounded-full px-5 py-1.5 shadow-lg inline-block">
                    <p className="text-2xl font-black text-red-700">{Math.round(stats.mathLow * animProgress)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center flex-grow">
                <div className="relative mb-6 mt-2 w-[150px] h-[150px]">
                  <div className="donut-chart shadow-[0_0_30px_rgba(16,185,129,0.15)]" style={{ background: `conic-gradient(#10b981 0% ${animMathC}%, #ef4444 ${animMathC}% ${animMathC + animMathW}%, #64748b ${animMathC + animMathW}% 100%)` }}>
                    <div className="donut-inner">
                      <img src="/math-symbol.jpg" alt="Math" className="w-[60px] h-[60px] object-cover rounded-full border border-slate-700/50" style={{opacity: animProgress}} />
                    </div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible', zIndex: 5 }}>
                    {renderChartLabels(animMathC, animMathW, animMathU)}
                  </svg>
                </div>
                
                <div className="flex justify-center space-x-4 text-xs font-medium w-full mb-6 mt-2">
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-emerald-500 mr-2"></div><span className="text-white">Correct</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-red-500 mr-2"></div><span className="text-white">Wrong</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-slate-300 mr-2"></div><span className="text-white">Unattempted</span></div>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <div className="bg-white rounded-full py-3 px-4 grid grid-cols-3 gap-2 text-center shadow-lg">
                  <div><p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Correct</p><p className="text-xl font-black text-emerald-500">{Math.round(stats.m.c * animProgress)}</p></div>
                  <div><p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Wrong</p><p className="text-xl font-black text-red-500">{Math.round(stats.m.w * animProgress)}</p></div>
                  <div><p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Unattempted</p><p className="text-xl font-black text-slate-500">{Math.round(stats.m.u * animProgress)}</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Physics Card */}
          <div className="glass-card rounded-3xl p-0 flex flex-col h-full overflow-hidden border-slate-700/50 pb-6">
            <div className="bg-[#bbf7d0] mx-4 mt-4 p-3 rounded-full flex items-center justify-center shadow-md">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 text-green-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"></ellipse></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-wide">Physics</h3>
            </div>
            
            <div className="px-6 pt-8 flex flex-col flex-grow">
              <div className="flex justify-between mb-8 px-2">
                <div className="text-center">
                  <p className="text-white text-sm mb-2 font-medium">Highest Mark</p>
                  <div className="bg-white rounded-full px-5 py-1.5 shadow-lg inline-block">
                    <p className="text-2xl font-black text-green-700">{Math.round(stats.phyHigh * animProgress)}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white text-sm mb-2 font-medium">Lowest Mark</p>
                  <div className="bg-white rounded-full px-5 py-1.5 shadow-lg inline-block">
                    <p className="text-2xl font-black text-red-700">{Math.round(stats.phyLow * animProgress)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center flex-grow">
                <div className="relative mb-6 mt-2 w-[150px] h-[150px]">
                  <div className="donut-chart shadow-[0_0_30px_rgba(16,185,129,0.15)]" style={{ background: `conic-gradient(#10b981 0% ${animPhyC}%, #ef4444 ${animPhyC}% ${animPhyC + animPhyW}%, #64748b ${animPhyC + animPhyW}% 100%)` }}>
                    <div className="donut-inner text-white">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12" style={{opacity: animProgress}}><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"></ellipse></svg>
                    </div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible', zIndex: 5 }}>
                    {renderChartLabels(animPhyC, animPhyW, animPhyU)}
                  </svg>
                </div>
                
                <div className="flex justify-center space-x-4 text-xs font-medium w-full mb-6 mt-2">
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-emerald-500 mr-2"></div><span className="text-white">Correct</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-red-500 mr-2"></div><span className="text-white">Wrong</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-slate-300 mr-2"></div><span className="text-white">Unattempted</span></div>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <div className="bg-white rounded-full py-3 px-4 grid grid-cols-3 gap-2 text-center shadow-lg">
                  <div><p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Correct</p><p className="text-xl font-black text-emerald-500">{Math.round(stats.p.c * animProgress)}</p></div>
                  <div><p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Wrong</p><p className="text-xl font-black text-red-500">{Math.round(stats.p.w * animProgress)}</p></div>
                  <div><p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Unattempted</p><p className="text-xl font-black text-slate-500">{Math.round(stats.p.u * animProgress)}</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chemistry Card */}
          <div className="glass-card rounded-3xl p-0 flex flex-col h-full overflow-hidden border-slate-700/50 pb-6">
            <div className="bg-[#ffe0b2] mx-4 mt-4 p-3 rounded-full flex items-center justify-center shadow-md">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 text-orange-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 3h6"></path><path d="M10 3v5l-6 10a2 2 0 001.7 3h12.6a2 2 0 001.7-3l-6-10V3"></path><path d="M6 16h12"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-wide">Chemistry</h3>
            </div>
            
            <div className="px-6 pt-8 flex flex-col flex-grow">
              <div className="flex justify-between mb-8 px-2">
                <div className="text-center">
                  <p className="text-white text-sm mb-2 font-medium">Highest Mark</p>
                  <div className="bg-white rounded-full px-5 py-1.5 shadow-lg inline-block">
                    <p className="text-2xl font-black text-green-700">{Math.round(stats.chemHigh * animProgress)}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white text-sm mb-2 font-medium">Lowest Mark</p>
                  <div className="bg-white rounded-full px-5 py-1.5 shadow-lg inline-block">
                    <p className="text-2xl font-black text-red-700">{Math.round(stats.chemLow * animProgress)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center flex-grow">
                <div className="relative mb-6 mt-2 w-[150px] h-[150px]">
                  <div className="donut-chart shadow-[0_0_30px_rgba(16,185,129,0.15)]" style={{ background: `conic-gradient(#10b981 0% ${animChemC}%, #ef4444 ${animChemC}% ${animChemC + animChemW}%, #64748b ${animChemC + animChemW}% 100%)` }}>
                    <div className="donut-inner text-orange-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12" style={{opacity: animProgress}}><path d="M9 3h6"></path><path d="M10 3v5l-6 10a2 2 0 001.7 3h12.6a2 2 0 001.7-3l-6-10V3"></path><path d="M6 16h12"></path></svg>
                    </div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible', zIndex: 5 }}>
                    {renderChartLabels(animChemC, animChemW, animChemU)}
                  </svg>
                </div>
                
                <div className="flex justify-center space-x-4 text-xs font-medium w-full mb-6 mt-2">
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-emerald-500 mr-2"></div><span className="text-white">Correct</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-red-500 mr-2"></div><span className="text-white">Wrong</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded bg-slate-300 mr-2"></div><span className="text-white">Unattempted</span></div>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <div className="bg-white rounded-full py-3 px-4 grid grid-cols-3 gap-2 text-center shadow-lg">
                  <div><p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Correct</p><p className="text-xl font-black text-emerald-500">{Math.round(stats.ch.c * animProgress)}</p></div>
                  <div><p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Wrong</p><p className="text-xl font-black text-red-500">{Math.round(stats.ch.w * animProgress)}</p></div>
                  <div><p className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Unattempted</p><p className="text-xl font-black text-slate-500">{Math.round(stats.ch.u * animProgress)}</p></div>
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
