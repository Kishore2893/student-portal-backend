import React, { useState, useEffect, useRef } from 'react';
import ExamConsole from './ExamConsole.jsx';
import Modals from './Modals';
import AnalysisDashboard from './AnalysisDashboard'; 
// 🚀 Supabase కనెక్షన్ ఇక్కడ ఇంపోర్ట్ చేసాము
import { supabase } from './supabaseClient';

const AutoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .popup-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); z-index: 999999; justify-content: center; align-items: center; font-family: 'Segoe UI', system-ui, sans-serif; padding: 15px; box-sizing: border-box; backdrop-filter: blur(5px); }
        .popup-overlay.active { display: flex; }
        .popup-container-box { background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%); padding: 20px; border-radius: 12px; width: 100%; max-width: 950px; position: relative; box-sizing: border-box; }
        .popup-content-box { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); }
        .popup-header-box { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px 30px; text-align: center; }
        .popup-badges { display: flex; justify-content: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        .popup-badge { background: rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .popup-header-box h2 { color: #ffffff; font-size: 22px; margin: 0; line-height: 1.3; }
        .popup-grid-body { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 25px 30px 15px 30px; }
        @media (max-width: 768px) { .popup-grid-body { grid-template-columns: 1fr; } }
        .popup-box-blue { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
        .popup-box-green { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px; }
        .popup-box-blue h3 { margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #0f172a; text-align: left;}
        .popup-box-green h3 { margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #166534; text-align: left; }
        .popup-list-item { display: flex; margin-bottom: 12px; align-items: flex-start; }
        .popup-list-item:last-child { margin-bottom: 0; }
        .popup-step-num { background: #eff6ff; color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0; border: 2px solid #bfdbfe; }
        .popup-check-icon { color: #22c55e; margin-right: 10px; font-size: 16px; font-weight: bold; flex-shrink: 0; }
        .popup-item-text { color: #334155; font-size: 14px; line-height: 1.5; font-weight: 500; text-align: left; }
        .popup-link-text { color: #2563eb; text-decoration: underline; font-weight: 600; }
        .popup-footer-box { text-align: center; padding: 0 30px 25px 30px; }
        .popup-start-btn { background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%); color: white; border: none; padding: 14px 40px; font-size: 16px; font-weight: 700; border-radius: 30px; cursor: pointer; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
      `}</style>
      <div className="popup-overlay active">
        <div className="popup-container-box">
          <div className="popup-content-box">
            <div className="popup-header-box">
              <div className="popup-badges">
                <span className="popup-badge">⚡ Instant Result</span>
                <span className="popup-badge">🎯 Accurate</span>
                <span className="popup-badge">🔍 Based on NTA Key</span>
              </div>
              <h2>Don’t wait for results — know your score in seconds!</h2>
            </div>
            <div className="popup-grid-body">
              <div className="popup-box-blue">
                <h3>How to get your response sheet URL?</h3>
                <div className="popup-list-item"><div className="popup-step-num">1</div><div className="popup-item-text">Open your response sheet on the JEE Main website (<a href="https://jeemain.nta.nic.in/" target="_blank" rel="noreferrer" className="popup-link-text">jeemain.nta.nic.in</a>).</div></div>
                <div className="popup-list-item"><div className="popup-step-num">2</div><div className="popup-item-text">Copy the response sheet URL from your browser’s address bar.</div></div>
                <div className="popup-list-item"><div className="popup-step-num">3</div><div className="popup-item-text">Paste it into the required field in the calculator.</div></div>
              </div>
              <div className="popup-box-green">
                <h3>Why use the JEE Main Score Calculator?</h3>
                <div className="popup-list-item"><div className="popup-check-icon">✓</div><div className="popup-item-text">Instantly know your JEE Main score (based on the NTA answer key).</div></div>
                <div className="popup-list-item"><div className="popup-check-icon">✓</div><div className="popup-item-text">Get a quick and clear overview of your overall JEE Main exam performance.</div></div>
                <div className="popup-list-item"><div className="popup-check-icon">✓</div><div className="popup-item-text">Analyze subject-wise scores to identify your strengths.</div></div>
              </div>
            </div>
            <div className="popup-footer-box">
              <button className="popup-start-btn" onClick={() => setIsOpen(false)}>Calculate Score Now 🚀</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function App() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [captchaText, setCaptchaText] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');

  const [responseUrl, setResponseUrl] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [evaluatorLoading, setEvaluatorLoading] = useState(false);
  const [evaluatorError, setEvaluatorError] = useState('');

  const [showUrlError, setShowUrlError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // 🚀 కొత్తగా యాడ్ చేసిన Not Available పాప్-అప్ స్టేట్
  const [showNotAvailableModal, setShowNotAvailableModal] = useState(false);

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setResponseUrl(inputUrl);
    if (inputUrl.trim().length > 15 && (!inputUrl.startsWith("https://cdn3.digialm.com") || !inputUrl.includes("touchstone/AssessmentQPHTMLMode1") || !inputUrl.endsWith(".html"))) {
      setShowUrlError(true);
      setResponseUrl('');
    }
  };

    const handleEvaluate = async () => {
    setEvaluatorError('');
    if (!responseUrl.trim()) {
      setEvaluatorError("Please paste the official Response Sheet URL to proceed!");
      return;
    }
    if (!responseUrl.startsWith("https://cdn3.digialm.com") || !responseUrl.includes("touchstone/AssessmentQPHTMLMode1") || !responseUrl.endsWith(".html")) {
      setShowUrlError(true);
      setResponseUrl('');
      return;
    }

    setEvaluatorLoading(true); 
    setScoreData(null);

    try {
      const response = await fetch(`https://student-portal-backend-vo2b.onrender.com/api/evaluate-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: responseUrl.trim() }),
      });
      const data = await response.json(); 
      
      if (data.success) {
        const getCounts = (sub) => {
          const pos = (sub?.secAPositive || 0) + (sub?.secBPositive || 0);
          const neg = Math.abs(sub?.secANegative || 0) + Math.abs(sub?.secBNegative || 0);
          const c = sub?.correct ?? (pos / 4);
          const w = sub?.wrong ?? neg;
          const u = sub?.unattempted ?? Math.max(0, 25 - (c + w));
          return { c, w, u };
        };
        
        const m = getCounts(data.subjects?.Mathematics);
        const p = getCounts(data.subjects?.Physics);
        const ch = getCounts(data.subjects?.Chemistry);

        try {
          const { error: sbError } = await supabase
            .from('jee_results')
            .upsert({
              url: responseUrl.trim(),
              candidate_name: data.studentInfo?.name || 'Unknown',
              app_no: data.studentInfo?.appNo || 'Unknown',
              exam_date: data.studentInfo?.examDate || 'Unknown',
              shift: data.studentInfo?.examShift || 'Unknown',
              math_marks: data.subjects?.Mathematics?.totalMarks || 0,
              phy_marks: data.subjects?.Physics?.totalMarks || 0,
              chem_marks: data.subjects?.Chemistry?.totalMarks || 0,
              total_marks: data.totalMarks || 0,
              math_c: m.c, math_w: m.w, math_u: m.u,
              phy_c: p.c, phy_w: p.w, phy_u: p.u,
              chem_c: ch.c, chem_w: ch.w, chem_u: ch.u
            }, { onConflict: 'url' });
            
          if (sbError) console.error("Supabase Save Error:", sbError);
        } catch (e) {
          console.error("Supabase Try-Catch Error:", e);
        }

        setScoreData(data);
      } else {
        setEvaluatorError(data.message || "Data processing failed!");
      }
    } catch (err) {
      console.error("Server Error:", err);
      setEvaluatorError("Server connection error! Please try again.");
    } finally {
      setEvaluatorLoading(false);
    }
  };

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('examUser');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeExam, setActiveExam] = useState('JEE Main');
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedDocLabel, setSelectedDocLabel] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    timerRef.current = setTimeout(() => {
      handleLogout(); 
      setShowTimeoutModal(true); 
    }, 240000); 

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const generateCaptcha = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserCaptchaInput(''); 
  };

  const tickerTextList = [
    "🚀 JEE Main 2027 Score Evaluator is LIVE Now!",    
  ];

  const examThemes = {
    'JEE Main': 'linear-gradient(135deg, #0d47a1, #1976d2)',        
    'JEE Advanced': 'linear-gradient(135deg, #2d5a27, #4caf50)',
    'BITSAT': 'linear-gradient(135deg, #e65100, #ff8f00)',    
    'TG EAPCET': 'linear-gradient(135deg, #880e4f, #ad1457)',       
    'AP EAPCET': 'linear-gradient(135deg, #004d40, #00695c)',       
    'IPE-2027': 'linear-gradient(135deg, #be8160, #512da8)' 
  };

  const currentThemeColor = activeExam === 'JEE Main' ? '#0043a4' : activeExam === 'JEE Advanced' ? '#2d5a27' : activeExam === 'BITSAT' ? '#e65100' : activeExam === 'TG EAPCET' ? '#880e4f' : activeExam === 'AP EAPCET' ? '#00695c' : '#512da8';

  useEffect(() => { 
    document.title = "JEE Main 2027 Score Calculator"; 
    generateCaptcha();
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); 

    if (userCaptchaInput !== captchaText) {
      setError("Invalid Captcha! Please try again.");
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://student-portal-backend-vo2b.onrender.com/api/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionNumber, mobileNumber })
      });
      const data = await response.json();
      if (response.ok) { 
        setUser(data); 
        localStorage.setItem('examUser', JSON.stringify(data));
        setShowLoginModal(false); 
      } else { 
        setError(data.error || "Invalid Credentials"); 
        generateCaptcha();
      }
    } catch (err) { 
      setError("Invalid Admission Number or Mobile Number!"); 
      generateCaptcha();
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogout = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    localStorage.removeItem('examUser');
    sessionStorage.clear();
    setUser(null);
    setAdmissionNumber('');
    setMobileNumber('');
    setUserCaptchaInput('');
    setTimeout(() => generateCaptcha(), 100);
  };

  const handleDocClick = (docType, docLabel, session = null) => {
    setSelectedDocType(docType); 
    setSelectedDocLabel(docLabel);
    
    if (activeExam === 'JEE Main') { 
      if (session) {
        downloadDocument(docType, session);
      } else {
        setShowSessionModal(true); 
      }
    } else if (activeExam === 'IPE-2027') {
      const ipeYearOption = docType === 'form' ? '1st Year' : '2nd Year';
      downloadDocument(docType, ipeYearOption); 
    } else { 
      downloadDocument(docType, null); 
    }
  };

  // 🚀 కొత్తగా మార్చిన డౌన్లోడ్ ఫంక్షన్
  const downloadDocument = async (docType, subOption = null) => {
    setShowSessionModal(false); 
    setShowYearModal(false);
  
    try {
      const examFolder = activeExam.toLowerCase().replace(/\s+/g, '-');
      let docFolder = '';
      if (activeExam !== 'IPE-2027') {
        if (docType === 'form') docFolder = '/application-forms';
        else if (docType === 'admit' || docType === 'hall') docFolder = '/admit-cards';
        else if (docType === 'score') docFolder = '/rank-cards';
        else docFolder = '/' + String(docType).toLowerCase().replace(/\s+/g, '-');
      }

      let subFolder = '';
      if (subOption) {
         subFolder = '/' + String(subOption).toLowerCase().replace(/\s+/g, '-'); 
      }

      const fileUrl = `https://student-portal-backend-vo2b.onrender.com/${examFolder}${docFolder}${subFolder}/${user?.admissionNumber}.pdf`;
      
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        setShowNotAvailableModal(true);
        return;
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${user.admissionNumber}.pdf`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (err) {
      console.error("డౌన్లోడ్ లోపం వచ్చింది:", err);
      setShowNotAvailableModal(true);
    }
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', width: '100%', fontFamily: '"Segoe UI", Roboto, sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      <AutoPopup />

      <style>{`
        .modern-card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04); overflow: hidden; transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .modern-card:hover { transform: translateY(-3px); box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.12); }
        .modern-input { width: 100%; padding: 13px 16px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 15px; color: #1e293b; background-color: #f8fafc; outline: none; transition: all 0.2s ease; box-sizing: border-box; }
        .modern-input:focus { border-color: #2563eb !important; background-color: #ffffff !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important; }
        .btn-primary { padding: 14px; background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #ffffff; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); }
        .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #1e40af, #1d4ed8); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45); }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        
        .evaluator-card { display: flex; flex-direction: row; width: 100%; max-width: 1200px; margin: 0 auto; }
        
        .evaluator-left { flex: 1.1; border-right: 3px solid #3b82f6; }
        .evaluator-right { flex: 1; }
        
        .evaluator-input-group { display: flex; flex-direction: column; gap: 12px; }
        .evaluator-btn { width: 100%; }
        
        .login-btn-top { position: absolute; right: 30px; top: 65%; transform: translateY(-50%); }
        
        @media (max-width: 768px) {
          .evaluator-card { flex-direction: column; }
          .evaluator-left { border-right: none; border-bottom: 3px solid #3b82f6; }
          .login-btn-top { position: relative; right: auto; top: auto; transform: none; margin: 15px auto 0 auto; display: flex; justify-content: center; width: max-content; }
        }
      `}</style>

      {/* 🟦 హెడర్ బ్యానర్ */}
      <header style={{ backgroundColor: '#ffffff', padding: '18px 20px', width: '100%', boxSizing: 'border-box', position: 'relative', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div className="header-content-wrapper" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>JEE MAIN 2027 SCORE EVALUATOR</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b', fontWeight: '600', letterSpacing: '0.2px' }}>Don’t wait for results — know your score in seconds!</p>
          </div>

        </div>

        {!user && (
          <button 
            onClick={() => setShowLoginModal(true)} 
            className="login-btn-top"
            style={{ backgroundColor: '#1e293b', color: 'white', padding: '10px 22px', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'all 0.2s' }}
          >
            Candidate Login 🔐
          </button>
        )}
      </header>

      {/* 📢 Ticker Bar */}
      <div style={{ width: '100%', backgroundColor: '#0b2d5c', borderBottom: '1px solid #082145', padding: '8px 0', overflow: 'hidden', display: 'flex', alignItems: 'center', boxSizing: 'border-box', height: '46px' }}>
        <div style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '4px 16px', fontSize: '12px', fontWeight: '800', marginLeft: '20px', borderRadius: '20px', zIndex: 10, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(220,38,38,0.4)' }}>
          ⚡ LATEST UPDATES
        </div>
        <marquee scrollamount="6" style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', cursor: 'pointer', paddingLeft: '15px' }} onMouseOver={(e) => e.target.stop()} onMouseOut={(e) => e.target.start()}>
          {tickerTextList.join('   ✦   ')}
        </marquee>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!user ? (
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', padding: '25px 4% 15px 4%', width: '100%', boxSizing: 'border-box' }}>
            
            <div className="modern-card evaluator-card">
              <div className="evaluator-left" style={{ background: 'linear-gradient(135deg, #0b1d3a, #1e3a8a)', color: '#ffffff', padding: '35px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  ✨ Instant Score
                </div>
                
                <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', lineHeight: '1.2' }}>
                  JEE Main-2027 Evaluator
                </h3>

                <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  Check your Subject-wise & Total Marks instantly <br />
                  based on the official NTA Answer Key.
                </p>
              </div>

              <div className="evaluator-right" style={{ padding: '35px 35px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#ffffff' }}>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px', color: '#1e293b', fontSize: '15px' }}>
                  🔗 Candidate Response Sheet URL:
                </label>
                
                <div className="evaluator-input-group">
                  <input 
                    type="text" 
                    className="modern-input"
                    placeholder="Paste official response sheet url here..." 
                    value={responseUrl}
                    onChange={handleUrlChange}
                  />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginLeft: '4px' }}>
                    <span>ℹ️ Supports official NTA candidate response sheet url's.</span>
                  </div>

                  {evaluatorError && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>
                      ⚠️ {evaluatorError}
                    </div>
                  )}

                  <button 
                    onClick={handleEvaluate}
                    disabled={evaluatorLoading}
                    className="btn-primary evaluator-btn"
                  >
                    {evaluatorLoading ? '⏳ Please Wait...' : '📊 View Result'}
                  </button>
                </div>
              </div>

            </div>

          </div>

        ) : (
          <div style={{ maxWidth: '1020px', width: '100%', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box' }}>
            <div style={{ background: `linear-gradient(135deg, #0b1d3a, ${currentThemeColor})`, color: 'white', padding: '26px 30px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', boxShadow: '0 12px 30px -8px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                  🎓 Verified Candidate Profile
                </div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.3px' }}>Welcome, {user.studentName}! 👋</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#cbd5e1' }}>Admission ID: <strong style={{ color: '#ffffff' }}>{user.admissionNumber}</strong></p>
              </div>
              <button onClick={handleLogout} style={{ padding: '11px 22px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px', boxShadow: '0 4px 14px rgba(220,38,38,0.4)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>LOGOUT</span> 🚪
              </button>
            </div>

            <div style={{ width: '100%', backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '16px', border: '1px solid #e2e8f0', boxSizing: 'border-box', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['JEE Main', 'JEE Advanced', 'BITSAT', 'TG EAPCET', 'AP EAPCET', 'IPE-2027'].map((exam) => (
                  <button
                    key={exam}
                    onClick={() => setActiveExam(exam)}
                    style={{
                      padding: '12px 22px',
                      background: activeExam === exam ? examThemes[exam] : '#f8fafc',
                      color: activeExam === exam ? '#ffffff' : '#475569',
                      border: activeExam === exam ? 'none' : '1.5px solid #e2e8f0',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '13.5px',
                      boxShadow: activeExam === exam ? '0 8px 20px rgba(0,0,0,0.18)' : 'none',
                      transform: activeExam === exam ? 'scale(1.02)' : 'none',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>

            <ExamConsole user={user} activeExam={activeExam} setActiveExam={setActiveExam} examThemes={examThemes} currentThemeColor={currentThemeColor} handleDocClick={handleDocClick} />
            <Modals showSessionModal={showSessionModal} setShowSessionModal={setShowSessionModal} showYearModal={showYearModal} setShowYearModal={setShowYearModal} selectedDocType={selectedDocType} selectedDocLabel={selectedDocLabel} downloadDocument={downloadDocument} />
          </div>
        )}
      </div>

      {scoreData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
          
          <div style={{ width: '100%', maxWidth: '1000px', maxHeight: '92vh', overflowY: 'auto', overflowX: 'hidden', borderRadius: '16px', boxShadow: '0 0 40px rgba(13, 71, 161, 0.4)' }}>
            <div id="scorecard-modal-content" style={{ backgroundColor: '#071022', width: '100%', border: '1px solid #1e3a8a', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", sans-serif' }}>
            
            <div style={{ padding: '12px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', background: 'linear-gradient(90deg, #071022 0%, #0d234a 50%, #071022 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#ffffff', borderRadius: '50%', padding: '3px', display: 'flex' }}>
                   <div style={{ width: '36px', height: '36px', background: 'linear-gradient(45deg, #3b82f6, #ef4444, #eab308, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                   </div>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>JEE-Main Response Report</h2>
                  <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginTop: '2px' }}>Subject-Wise Performance Analysis</div>
                </div>
              </div>
              
              <div id="modal-action-buttons" style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setScoreData(null)} style={{ backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                  Close Report ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '15px 25px', flex: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '10px', marginBottom: '15px', width: '100%' }}>
                {[
                  { label: "Student Name:", value: scoreData.studentInfo?.name || "N/A", flex: '2' },
                  { label: "Application No:", value: scoreData.studentInfo?.appNo || "N/A", flex: '1' },
                  { label: "Roll Number:", value: scoreData.studentInfo?.rollNo || "N/A", flex: '1' },
                  { label: "Test Date:", value: scoreData.studentInfo?.examDate || "N/A", flex: '1' },
                  { label: "Test Time:", value: scoreData.studentInfo?.examShift === 'Shift2' ? '3:00 PM - 6:00 PM' : '9:00 AM - 12:00 PM', flex: '1.2' }
                ].map((info, idx) => (
                  <div key={idx} style={{ backgroundColor: '#475569', borderRadius: '8px', padding: '6px 10px', flex: info.flex, minWidth: '0', border: '1px solid #64748b' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '10px', marginBottom: '2px', whiteSpace: 'nowrap' }}>{info.label}</div>
                    <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a' }}>Subject Score Matrix Table</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 1fr', gap: '10px' }}>
                  <div></div>
                  <div style={{ background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)', color: 'white', textAlign: 'center', padding: '8px', borderRadius: '25px', fontWeight: 'bold', fontSize: '13px' }}>Mathematics</div>
                  <div style={{ background: 'linear-gradient(90deg, #14532d, #22c55e)', color: 'white', textAlign: 'center', padding: '8px', borderRadius: '25px', fontWeight: 'bold', fontSize: '13px' }}>Physics</div>
                  <div style={{ background: 'linear-gradient(90deg, #b45309, #eab308)', color: 'white', textAlign: 'center', padding: '8px', borderRadius: '25px', fontWeight: 'bold', fontSize: '13px' }}>Chemistry</div>

                  <div style={{ backgroundColor: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4338ca', padding: '10px', fontSize: '13px' }}>Section A</div>
                  {[
                    { subj: 'Mathematics', sec: 'A' },
                    { subj: 'Physics', sec: 'A' },
                    { subj: 'Chemistry', sec: 'A' }
                  ].map((item, idx) => (
                    <div key={`A-${idx}`} style={{ backgroundColor: '#eef2ff', borderRadius: '12px', padding: '10px', border: '1px solid #a5b4fc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span style={{color: '#4f46e5'}}>Positive (+)</span> <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Positive`] ?? 0}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span style={{color: '#4f46e5'}}>Negative (-)</span> <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Negative`] ?? 0}</span></div>
                      <div style={{ borderTop: '1px solid #a5b4fc', margin: '6px 0' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#312e81', fontWeight: 'bold', fontSize: '14px' }}><span>Total</span> <span>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Total`] ?? 0}</span></div>
                    </div>
                  ))}

                  <div style={{ backgroundColor: '#bae6fd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0369a1', padding: '10px', fontSize: '13px' }}>Section B</div>
                  {[
                    { subj: 'Mathematics', sec: 'B' },
                    { subj: 'Physics', sec: 'B' },
                    { subj: 'Chemistry', sec: 'B' }
                  ].map((item, idx) => (
                    <div key={`B-${idx}`} style={{ backgroundColor: '#e0f2fe', borderRadius: '12px', padding: '10px', border: '1px solid #7dd3fc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span style={{color: '#0369a1'}}>Positive (+)</span> <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Positive`] ?? 0}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span style={{color: '#0369a1'}}>Negative (-)</span> <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Negative`] ?? 0}</span></div>
                      <div style={{ borderTop: '1px solid #7dd3fc', margin: '6px 0' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0c4a6e', fontWeight: 'bold', fontSize: '14px' }}><span>Total</span> <span>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Total`] ?? 0}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '12px 15px', flex: '1.2', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0f172a', textTransform: 'uppercase' }}>Subject Wise Marks</h3>
                  <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                    <div style={{ flex: 1, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ color: '#1e3a8a', fontSize: '13px', marginBottom: '2px', fontWeight: '600' }}>Maths</div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#1d4ed8', lineHeight: 1 }}>{scoreData.subjects?.Mathematics?.totalMarks ?? 0}</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ color: '#14532d', fontSize: '13px', marginBottom: '2px', fontWeight: '600' }}>Physics</div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#15803d', lineHeight: 1 }}>{scoreData.subjects?.Physics?.totalMarks ?? 0}</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ color: '#78350f', fontSize: '13px', marginBottom: '2px', fontWeight: '600' }}>Chemistry</div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309', lineHeight: 1 }}>{scoreData.subjects?.Chemistry?.totalMarks ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '12px', flex: '0.8', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', border: 'none', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)', flex: 1 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '800' }}>🏆 Grand Total Score</div>
                      <div style={{ fontSize: '46px', fontWeight: '900', color: '#ffffff', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', lineHeight: 1 }}>
                        {scoreData.totalMarks ?? 0} <span style={{ fontSize: '22px', fontWeight: '600', color: '#93c5fd' }}>/ 300</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0 20px' }}>
                <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, #cbd5e0)' }}></div>
                <div style={{ padding: '10px 25px', background: '#f0f2f5', border: '1px solid #cbd5e0', borderRadius: '20px', fontWeight: 'bold', fontSize: '15px', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Detailed Question-Wise Analysis</div>
                <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, transparent, #cbd5e0)' }}></div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '25px', flexWrap: 'wrap' }}>
                {[
                  { name: 'Mathematics', pill_col: '#3a6fc5', bg: '#fdfdfd' },
                  { name: 'Physics', pill_col: '#32a852', bg: '#fdfdfd' },
                  { name: 'Chemistry', pill_col: '#dca826', bg: '#fdfdfd' }
                ].map((sub, sIdx) => {
                  const questions = scoreData.subjects?.[sub.name]?.questions || [];
                  const secAPos = scoreData.subjects?.[sub.name]?.secAPositive || 0;
                  const secBPos = scoreData.subjects?.[sub.name]?.secBPositive || 0;
                  const secANeg = scoreData.subjects?.[sub.name]?.secANegative || 0;
                  const secBNeg = scoreData.subjects?.[sub.name]?.secBNegative || 0;
                  
                  const cCount = scoreData.subjects?.[sub.name]?.correct ?? ((secAPos + secBPos) / 4);
                  const wCount = scoreData.subjects?.[sub.name]?.wrong ?? (Math.abs(secANeg) + Math.abs(secBNeg));
                  const uCount = scoreData.subjects?.[sub.name]?.unattempted ?? Math.max(0, 25 - (cCount + wCount));
                  
                  const totalQ = 25;
                  const c_percent = Math.round((cCount / totalQ) * 100) || 0;
                  const w_percent = Math.round((wCount / totalQ) * 100) || 0;
                  const u_percent = Math.round((uCount / totalQ) * 100) || 0;

                  return (
                    <div key={sIdx} style={{ position: 'relative', flex: '1 1 300px', marginBottom: '20px' }}>
                      <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', color: 'white', fontWeight: 'bold', padding: '4px 30px', borderRadius: '20px', zIndex: 10, fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', letterSpacing: '0.5px', background: sub.pill_col }}>
                        {sub.name}
                      </div>
                      <div style={{ borderRadius: '12px', overflow: 'hidden', paddingTop: '15px', background: 'white', border: `2px solid ${sub.pill_col}`, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ background: '#ffffff', padding: '15px 12px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                          <div style={{ height: '22px', background: '#e2e8f0', borderRadius: '20px', margin: '8px 0 12px 0', display: 'flex', overflow: 'hidden', fontSize: '12px', fontWeight: '800', color: 'white', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                            <div style={{ width: `${c_percent}%`, minWidth: c_percent > 0 ? '38px' : '0', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#064e3b' }}>{c_percent > 0 ? `${c_percent}%` : ''}</div>
                            <div style={{ width: `${w_percent}%`, minWidth: w_percent > 0 ? '38px' : '0', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7f1d1d' }}>{w_percent > 0 ? `${w_percent}%` : ''}</div>
                            <div style={{ width: `${u_percent}%`, minWidth: u_percent > 0 ? '38px' : '0', background: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>{u_percent > 0 ? `${u_percent}%` : ''}</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                            <span><span style={{ color: '#16a34a' }}>Correct:</span> {cCount}</span>
                            <span><span style={{ color: '#dc2626' }}>Wrong:</span> {wCount}</span>
                            <span><span style={{ color: '#64748b' }}>Unattempted:</span> {uCount}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 5px', borderBottom: '2px solid #e2e8f0', borderTop: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '700', color: '#475569', background: '#f8fafc' }}>
                          <span style={{ width: '50px', textAlign: 'center' }}>Q.No</span>
                          <span style={{ flex: 1, textAlign: 'center' }}>Q.ID</span>
                          <span style={{ width: '50px', textAlign: 'center' }}>Status</span>
                        </div>
                        <div style={{ padding: '0 8px 8px' }}>
                          {Array.from({ length: 25 }).map((_, i) => {
                            const qNum = i + 1;
                            const rowBg = qNum <= 20 ? (qNum % 2 !== 0 ? '#f9f9fd' : 'transparent') : (qNum % 2 !== 0 ? '#f0fafe' : 'transparent');
                            const questionData = questions[i] || {};
                            const status = questionData.status || 'Unattempted';
                            const isCorrect = status.toLowerCase() === 'correct';
                            const isWrong = status.toLowerCase() === 'wrong';
                            const icon = isCorrect ? '✓' : isWrong ? '✗' : '○';
                            const statusColor = isCorrect ? '#38a169' : isWrong ? '#e53e3e' : '#718096';
                            const qId = questionData.questionId || '-';

                            return (
                              <div key={qNum} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 5px', borderBottom: '1px solid #edf2f7', fontSize: '13px', borderRadius: '4px', marginBottom: '2px', background: rowBg }}>
                                <span style={{ width: '50px', textAlign: 'center' }}>{qNum}.</span>
                                <span style={{ flex: 1, textAlign: 'center' }}>{qId}</span>
                                <span style={{ width: '50px', textAlign: 'center', color: statusColor, fontWeight: 'bold', fontSize: '14px' }}>{icon}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '15px', padding: '12px', background: '#edf2f7', borderRadius: '8px', textAlign: 'center', fontWeight: '500', color: '#2d3748', fontSize: '13px' }}>
                <span style={{ color: '#38a169', margin: '0 15px', fontWeight: 'bold' }}>✓ Correct</span>
                <span style={{ color: '#e53e3e', margin: '0 15px', fontWeight: 'bold' }}>✗ Wrong</span>
                <span style={{ color: '#718096', margin: '0 15px', fontWeight: 'bold' }}>○ Unattempted</span>
              </div>
            </div>

          </div>
          </div>
        </div>
      )}

      {showUrlError && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px 25px', borderRadius: '24px', width: '90%', maxWidth: '380px', position: 'relative', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.25), 0 10px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)' }}>
            <button 
              style={{ position: 'absolute', top: '15px', right: '15px', background: '#f8fafc', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s ease' }} 
              onClick={() => setShowUrlError(false)}
            >
              &#10005;
            </button>
            <div style={{ width: '65px', height: '65px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto', boxShadow: '0 0 0 6px #fff1f2' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '25px', fontWeight: '800', letterSpacing: '-0.5px' }}>Invalid URL Format!</h3>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0', fontWeight: '500' }}>
              Please paste a valid response sheet url that starts with
              <span style={{ display: 'block', margin: '12px auto 0 auto', padding: '8px 14px', backgroundColor: '#f8fafc', color: '#1d4ed8', borderRadius: '10px', fontWeight: '700', fontSize: '13px', border: '1px solid #e2e8f0', wordBreak: 'break-word' }}>
                https://cdn3.digialm.com
              </span>
            </p>
            <button 
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)', transition: 'all 0.2s ease' }} 
              onClick={() => setShowUrlError(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 🚀 CANDIDATE LOGIN MODAL 🚀 */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
          
          <div className="modern-card" style={{ maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', color: '#0f172a', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
            >
              ✕
            </button>

            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', padding: '24px 28px', textAlign: 'left', borderBottom: '3px solid #2563eb' }}>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(37, 99, 235, 0.25)', color: '#93c5fd', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                🔒 Student Portal
              </div>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Candidate Login
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>Access applications, admit cards & rank cards</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', padding: '28px 30px', boxSizing: 'border-box' }}>
              
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>
                  🆔 Admn Number:
                </label>
                <input 
                  type="text" 
                  className="modern-input"
                  value={admissionNumber} 
                  onChange={(e) => setAdmissionNumber(e.target.value)} 
                  required 
                  placeholder="Enter 9-Digit ID"
                  maxLength={9} 
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>
                  📱 Registered Mobile Number:
                </label>
                <input 
                  type="password" 
                  className="modern-input"
                  value={mobileNumber} 
                  onChange={(e) => setMobileNumber(e.target.value)} 
                  required 
                  placeholder="Enter 10-Digit Mobile Number" 
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>
                  🔐 Enter Security Pin:
                </label>
                <input 
                  type="text" 
                  className="modern-input"
                  value={userCaptchaInput} 
                  onChange={(e) => setUserCaptchaInput(e.target.value)} 
                  required 
                  placeholder="Type the 6-character PIN shown below" 
                  maxLength={6} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '22px', gap: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>Security PIN:</span>
                <div style={{ background: 'linear-gradient(45deg, #e2e8f0, #cbd5e1)', color: '#1e3a8a', padding: '6px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '19px', letterSpacing: '4px', textDecoration: 'line-through', userSelect: 'none', fontStyle: 'italic', display: 'flex', flex: 1, justifyContent: 'center' }}>
                  {captchaText}
                </div>
                <button type="button" onClick={generateCaptcha} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', padding: '8px' }} title="Refresh Security PIN">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#2563eb" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            {error && <p style={{ color: '#dc2626', margin: '0 0 20px 0', textAlign: 'center', fontWeight: '700', fontSize: '13px' }}>❌ {error}</p>}
          </div>
        </div>
      )}

      {/* 🚀 లాగిన్ మోడల్ ఓపెన్ కానప్పుడు, మరియు యూజర్ లాగిన్ అవ్వనప్పుడు మాత్రమే డాష్బోర్డ్ కనిపిస్తుంది */}
      {!showLoginModal && !user && (
        <AnalysisDashboard />
      )}
      
      {/* 🚀 కొత్తగా యాడ్ చేసిన Not Available పాప్-అప్ (OK బటన్ లేకుండా) */}
      {showNotAvailableModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px 25px 25px 25px', borderRadius: '16px', width: '90%', maxWidth: '320px', position: 'relative', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.25), 0 10px 25px rgba(0,0,0,0.15)' }}>
            
            <button 
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s ease', padding: '5px' }} 
              onClick={() => setShowNotAvailableModal(false)}
            >
              &#10005;
            </button>
            
            <div style={{ width: '60px', height: '60px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', color: 'white', fontSize: '32px', fontWeight: 'bold' }}>
              ✕
            </div>
            
            <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '22px', fontWeight: '800' }}>Not Available</h3>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', margin: '0', fontWeight: '500' }}>
              We're sorry, this resource is currently unavailable. Please try again later.
            </p>
          </div>
        </div>
      )}
      
      <footer style={{ 
        width: '100%', 
        backgroundColor: '#05080f', 
        position: 'relative',
        color: '#ffffff', 
        fontFamily: '"Segoe UI", sans-serif', 
        padding: '30px 20px', 
        boxSizing: 'border-box'
      }}>
        {/* ఎట్రాక్టివ్ గ్రేడియంట్ బార్డర్ */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)' }}></div>

        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ fontSize: '14.5px', color: '#cbd5e1', letterSpacing: '0.5px' }}>
            Copyright © KIT 2026. All Rights Reserved.
          </div>
          
        </div>

        {showTimeoutModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}>
            <div style={{ backgroundColor: '#fff', padding: '30px 40px', borderRadius: '16px', textAlign: 'center', width: '420px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
              <h2 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '24px', fontWeight: '800' }}>Session Timeout</h2>
              <p style={{ color: '#475569', marginBottom: '25px', fontSize: '15px', fontWeight: '500' }}>Your session has expired. Please login again.</p>
              <button onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.replace(window.location.origin); }} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px 0', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                Close
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;
