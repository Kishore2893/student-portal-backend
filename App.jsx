import React, { useState, useEffect, useRef } from 'react';
import ExamConsole from './ExamConsole.jsx';
import Modals from './Modals';

function App() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🔒 క్యాప్చా స్టేట్స్
  const [captchaText, setCaptchaText] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');

  // ─── JEE ఎవాల్యుయేటర్ స్టేట్స్ ───
  const [responseUrl, setResponseUrl] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [evaluatorLoading, setEvaluatorLoading] = useState(false);
  const [evaluatorError, setEvaluatorError] = useState('');

  // 1️⃣ లైవ్ విజిటర్ కౌంటర్ స్టేట్ (ఇది కచ్చితంగా పెరుగుతుంది)
  const [visitorCount, setVisitorCount] = useState("Loading...");

  useEffect(() => {
    fetch("https://api.counterapi.dev/v1/student-jee-portal/visits/up")
      .then(res => res.json())
      .then(data => {
        // బేస్ కౌంట్ 184392 కి, కొత్తగా వచ్చిన కౌంట్ కలుపుతున్నాం
        const totalVisits = 184392 + data.count;
        setVisitorCount(totalVisits.toLocaleString('en-IN'));
      })
      .catch(() => {
        // ఇంటర్నెట్ ప్రాబ్లం వల్ల API ఫెయిల్ అయితే, రాండమ్ గా ఒక నెంబర్ పెరిగేలా చూపిస్తుంది
        const randomIncrease = Math.floor(Math.random() * 10) + 1;
        setVisitorCount((184392 + randomIncrease).toLocaleString('en-IN'));
      });
  }, []);

  // 2️⃣ లాస్ట్ అప్డేట్ డేట్ (ఫైల్ మోడిఫై అయిన డేట్)
  const [footerUpdatedDate, setFooterUpdatedDate] = useState("");
  useEffect(() => {
    try {
      const modifiedDate = new Date(document.lastModified);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      setFooterUpdatedDate(modifiedDate.toLocaleDateString('en-US', options));
    } catch (e) {
      setFooterUpdatedDate("Aug 26, 2026");
    }
  }, []);

  // 3️⃣ డౌన్‌లోడ్ ఫంక్షనాలిటీ కోసం HTML2Canvas స్క్రిప్ట్ 
  useEffect(() => {
    if (!document.getElementById('html2canvas-script')) {
      const script = document.createElement('script');
      script.id = 'html2canvas-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.body.appendChild(script);
    }
  }, []);

  const handleDownloadJPG = () => {
    if (window.html2canvas) {
      const element = document.getElementById('scorecard-modal-content');
      const actionBtns = document.getElementById('modal-action-buttons');
      if (actionBtns) actionBtns.style.display = 'none'; // డౌన్‌లోడ్ అయ్యే ఇమేజ్ లో బటన్స్ పడకుండా దాచుతాం

      window.html2canvas(element, { scale: 2, backgroundColor: '#071022' }).then(canvas => {
        if (actionBtns) actionBtns.style.display = 'flex'; // డౌన్‌లోడ్ అయ్యాక మళ్లీ చూపిస్తాం
        const data = canvas.toDataURL('image/jpeg', 1.0); // JPG ఫార్మాట్
        const link = document.createElement('a');
        link.href = data;
        link.download = `JEE_Report_${scoreData?.studentInfo?.appNo || 'Student'}.jpg`;
        link.click();
      });
    } else {
      alert("డౌన్‌లోడ్ లోడ్ అవుతోంది... ఒక క్షణం ఆగి మళ్లీ క్లిక్ చేయండి.");
    }
  };

  const handleEvaluate = async () => {
    setEvaluatorError('');
    if (!responseUrl.trim()) {
      setEvaluatorError("దయచేసి రెస్పాన్స్ షీట్ URL ని ఇక్కడ పేస్ట్ చేయండి!");
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
        setScoreData(data);
      } else {
        setEvaluatorError(data.message || "డేటా ప్రాసెస్ చేయడంలో లోపం వచ్చింది!");
      }
    } catch (err) {
      console.error("Server Error:", err);
      setEvaluatorError("సర్వర్ కనెక్షన్ లో లోపం వచ్చింది! దయచేసి మళ్ళీ ప్రయత్నించండి.");
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
    const triggerTimeout = () => setShowTimeoutModal(true);
    const resetInactivityTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(triggerTimeout, 300000); 
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
    };
  }, []);

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
    "📝 Application form for JEE(Main)-2027 [Session-I] (B.E. / B.Tech)",
    "⚪ City Intimation Slip is now on live [Session-I] (B.E. / B.Tech)",
    "📌 Admit Card for JEE(Main)-2027 [Session-I] (B.E. / B.Tech)",
    "🎓 Score Card for JEE(Main)-2027 [Session-I] (B.E. / B.Tech)"
  ];

  const examThemes = {
    'JEE Main': 'linear-gradient(135deg, #0d47a1, #1976d2)',        
    'JEE Advanced': 'linear-gradient(135deg, #2d5a27, #4caf50)',    
    'TG EAPCET': 'linear-gradient(135deg, #880e4f, #ad1457)',       
    'AP EAPCET': 'linear-gradient(135deg, #004d40, #00695c)',       
    'IPE-2027': 'linear-gradient(135deg, #be8160, #512da8)' 
  };

  const currentThemeColor = activeExam === 'JEE Main' ? '#0043a4' : activeExam === 'JEE Advanced' ? '#2d5a27' : activeExam === 'TG EAPCET' ? '#880e4f' : activeExam === 'AP EAPCET' ? '#00695c' : '#512da8';

  useEffect(() => { 
    document.title = "IIT JEE Analysis"; 
    generateCaptcha();
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

  const downloadDocument = async (docType, subOption = null) => {
    setShowSessionModal(false); 
    setShowYearModal(false);
    try {
      const fileUrl = `https://student-portal-backend-vo2b.onrender.com/${user.admissionNumber}.pdf`;
      window.open(fileUrl, '_blank');
    } catch (err) {
      console.error("డౌన్లోడ్ లోపం వచ్చింది:", err);
    }
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', width: '100%', fontFamily: '"Segoe UI", Roboto, sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      <header style={{ backgroundColor: '#ffffff', padding: '22px 20px', textAlign: 'center', width: '100%', boxSizing: 'border-box', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>NATIONAL ENTRANCE EXAMS</h1>
        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '600', letterSpacing: '0.3px' }}>JEE Main • JEE Advanced • TG EAPCET • AP EAPCET • IPE-2027</p>
      </header>

      <div style={{ width: '100%', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', padding: '8px 0', display: 'flex', alignItems: 'center', height: '46px' }}>
        <div style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '4px 16px', fontSize: '12px', fontWeight: '800', marginLeft: '20px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
          ⚡ LATEST UPDATES
        </div>
        <marquee scrollamount="6" style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', paddingLeft: '15px' }} onMouseOver={(e) => e.target.stop()} onMouseOut={(e) => e.target.start()}>
          {tickerTextList.join('   ✦   ')}
        </marquee>
      </div>

      <div style={{ flex: '1', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!user ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '45px 4% 60px 4%', width: '100%', gap: '40px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
            <style>{`
              .modern-card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.08); overflow: hidden; transition: transform 0.25s ease; }
              .modern-input { width: 100%; padding: 13px 16px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 15px; background-color: #f8fafc; outline: none; box-sizing: border-box; }
              .modern-input:focus { border-color: #2563eb !important; background-color: #ffffff !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important; }
              .btn-primary { width: 100%; padding: 14px; background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #ffffff; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); }
              .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
            `}</style>

            <div className="modern-card" style={{ width: '480px', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'linear-gradient(135deg, #0b1d3a, #1e3a8a)', color: '#ffffff', padding: '24px 28px', borderBottom: '3px solid #3b82f6' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', marginBottom: '8px' }}>
                  ✨ Instant Score Engine
                </div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎯 JEE Main-2027 Evaluator
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>Calculate subject-wise marks & grand total instantly</p>
              </div>

              <div style={{ padding: '32px 30px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#1e293b', fontSize: '14px' }}>🔗 Candidate Response Sheet URL:</label>
                  <input type="text" className="modern-input" placeholder="Paste official response sheet link here..." value={responseUrl} onChange={(e) => setResponseUrl(e.target.value)} />
                  {evaluatorError && <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>⚠️ {evaluatorError}</div>}
                </div>
                <div style={{ marginTop: '30px' }}>
                  <button onClick={handleEvaluate} disabled={evaluatorLoading} className="btn-primary">
                    {evaluatorLoading ? '⏳ Evaluating Response Sheet...' : '⚡ Calculate Score'}
                  </button>
                </div>
              </div>
            </div>

            <div className="modern-card" style={{ maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', padding: '24px 28px', borderBottom: '3px solid #2563eb' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(37, 99, 235, 0.25)', color: '#93c5fd', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', marginBottom: '8px' }}>
                  🔒 Student Services Portal
                </div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>Candidate Login</h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>Access admit cards, rank cards & applications</p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', padding: '28px 30px', boxSizing: 'border-box' }}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>🆔 Admission Number:</label>
                  <input type="text" className="modern-input" value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)} required placeholder="Enter 9-Digit ID" maxLength={9} />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>📱 Registered Mobile Number:</label>
                  <input type="password" className="modern-input" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required placeholder="Enter 10-Digit Mobile Number" />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>🔐 Enter Security Pin:</label>
                  <input type="text" className="modern-input" value={userCaptchaInput} onChange={(e) => setUserCaptchaInput(e.target.value)} required placeholder="Type the 6-character PIN shown below" maxLength={6} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '22px', gap: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>Security PIN:</span>
                  <div style={{ background: 'linear-gradient(45deg, #e2e8f0, #cbd5e1)', color: '#1e3a8a', padding: '6px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '19px', letterSpacing: '4px', textDecoration: 'line-through', userSelect: 'none', fontStyle: 'italic', display: 'flex', flex: 1, justifyContent: 'center' }}>
                    {captchaText}
                  </div>
                  <button type="button" onClick={generateCaptcha} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', padding: '8px' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#2563eb" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                  </button>
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Verifying Credentials...' : 'Sign In to Portal'}
                </button>
              </form>
              {error && <p style={{ color: '#dc2626', margin: '0 0 20px 0', textAlign: 'center', fontWeight: '700', fontSize: '13px' }}>❌ {error}</p>}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '1020px', width: '100%', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box' }}>
            <div style={{ background: `linear-gradient(135deg, #0b1d3a, ${currentThemeColor})`, color: 'white', padding: '26px 30px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', boxShadow: '0 12px 30px -8px rgba(0,0,0,0.2)' }}>
              <div>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', marginBottom: '6px' }}>🎓 Verified Candidate Profile</div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Welcome, {user.studentName}! 👋</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#cbd5e1' }}>Admission ID: <strong>{user.admissionNumber}</strong></p>
              </div>
              <button onClick={handleLogout} style={{ padding: '11px 22px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>LOGOUT</span> 🚪
              </button>
            </div>
            <ExamConsole user={user} activeExam={activeExam} setActiveExam={setActiveExam} examThemes={examThemes} currentThemeColor={currentThemeColor} handleDocClick={handleDocClick} />
            <Modals showSessionModal={showSessionModal} setShowSessionModal={setShowSessionModal} showYearModal={showYearModal} setShowYearModal={setShowYearModal} selectedDocType={selectedDocType} selectedDocLabel={selectedDocLabel} downloadDocument={downloadDocument} />
          </div>
        )}
      </div>

      {/* 🎯 🌟 Scorecard Modal (JPG Download & Full UI Updates) 🌟 🎯 */}
      {scoreData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          
          {/* ఈ కంటైనర్ ని ఇమేజ్ లా క్యాప్చర్ చేస్తాం */}
          <div id="scorecard-modal-content" style={{ backgroundColor: '#071022', width: '100%', maxWidth: '1050px', borderRadius: '16px', boxShadow: '0 0 40px rgba(13, 71, 161, 0.4)', border: '1px solid #1e3a8a', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh', fontFamily: '"Segoe UI", sans-serif' }}>
            
            {/* టాప్ హెడర్ */}
            <div style={{ padding: '16px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', background: 'linear-gradient(90deg, #071022 0%, #0d234a 50%, #071022 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#ffffff', borderRadius: '50%', padding: '3px', display: 'flex' }}>
                   <div style={{ width: '38px', height: '38px', background: 'conic-gradient(#3b82f6, #ef4444, #eab308, #22c55e, #3b82f6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                   </div>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>
                    JEE-Main Response Report
                  </h2>
                  <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginTop: '2px' }}>Official Subject-Wise Performance Analysis</div>
                </div>
              </div>
              
              {/* యాక్షన్ బటన్స్: డౌన్‌లోడ్ & క్లోజ్ */}
              <div id="modal-action-buttons" style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleDownloadJPG} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #1d4ed8', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }} title="Download as JPG">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download
                </button>
                <button onClick={() => setScoreData(null)} style={{ backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  Close Report ✕
                </button>
              </div>
            </div>

            {/* కంటెంట్ ఏరియా */}
            <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
              
              {/* స్టూడెంట్ ఇన్ఫో కార్డులు (Flex Nowrap ద్వారా అన్నీ ఒకే లైన్ లో) */}
              <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '10px', marginBottom: '25px', overflowX: 'auto', width: '100%' }}>
                {[
                  { label: "Student Name:", value: scoreData.studentInfo?.name || "N/A" },
                  { label: "Application No:", value: scoreData.studentInfo?.appNo || "N/A" },
                  { label: "Roll Number:", value: scoreData.studentInfo?.rollNo || "N/A" },
                  { label: "Test Date:", value: scoreData.studentInfo?.examDate || "N/A" },
                  { label: "Test Time:", value: scoreData.studentInfo?.examShift === 'Shift2' ? '3:00 PM - 6:00 PM' : '9:00 AM - 12:00 PM' }
                ].map((info, idx) => (
                  <div key={idx} style={{ backgroundColor: '#475569', borderRadius: '10px', padding: '8px 12px', flex: '1', minWidth: '0', border: '1px solid #64748b' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '11px', marginBottom: '2px', whiteSpace: 'nowrap' }}>{info.label}</div>
                    <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.value}</div>
                  </div>
                ))}
              </div>

              {/* Subject Score Matrix Table */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#0f172a' }}>Subject Score Matrix Table</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', gap: '15px' }}>
                  {/* Headers */}
                  <div></div>
                  <div style={{ background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)', color: 'white', textAlign: 'center', padding: '10px', borderRadius: '25px', fontWeight: 'bold' }}>Mathematics</div>
                  <div style={{ background: 'linear-gradient(90deg, #14532d, #22c55e)', color: 'white', textAlign: 'center', padding: '10px', borderRadius: '25px', fontWeight: 'bold' }}>Physics</div>
                  <div style={{ background: 'linear-gradient(90deg, #b45309, #eab308)', color: 'white', textAlign: 'center', padding: '10px', borderRadius: '25px', fontWeight: 'bold' }}>Chemistry</div>

                  {/* Section A (Light Gray/Blue Theme) */}
                  <div style={{ backgroundColor: '#e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#334155', padding: '15px' }}>Section A</div>
                  {[
                    { subj: 'Mathematics', sec: 'A' },
                    { subj: 'Physics', sec: 'A' },
                    { subj: 'Chemistry', sec: 'A' }
                  ].map((item, idx) => (
                    <div key={`A-${idx}`} style={{ backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '16px', border: '1px solid #cbd5e1' }}>
                      {/* Positive Green, Negative Red */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}><span style={{color: '#475569'}}>Positive (+)</span> <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Positive`] ?? 0}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}><span style={{color: '#475569'}}>Negative (-)</span> <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Negative`] ?? 0}</span></div>
                      <div style={{ borderTop: '1px solid #cbd5e1', margin: '10px 0' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: 'bold', fontSize: '15px' }}><span>Total</span> <span>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Total`] ?? 0}</span></div>
                    </div>
                  ))}

                  {/* Section B (Light Blue/Cyan Theme) */}
                  <div style={{ backgroundColor: '#bae6fd', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0369a1', padding: '15px' }}>Section B</div>
                  {[
                    { subj: 'Mathematics', sec: 'B' },
                    { subj: 'Physics', sec: 'B' },
                    { subj: 'Chemistry', sec: 'B' }
                  ].map((item, idx) => (
                    <div key={`B-${idx}`} style={{ backgroundColor: '#e0f2fe', borderRadius: '16px', padding: '16px', border: '1px solid #7dd3fc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}><span style={{color: '#0369a1'}}>Positive (+)</span> <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Positive`] ?? 0}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}><span style={{color: '#0369a1'}}>Negative (-)</span> <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Negative`] ?? 0}</span></div>
                      <div style={{ borderTop: '1px solid #7dd3fc', margin: '10px 0' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0c4a6e', fontWeight: 'bold', fontSize: '15px' }}><span>Total</span> <span>{scoreData.subjects?.[item.subj]?.[`sec${item.sec}Total`] ?? 0}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Cards */}
              <div style={{ display: 'flex', gap: '25px' }}>
                
                {/* Subject Wise Summary (Different Colors for Each Subject) */}
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', flex: '1.2' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#0f172a' }}>Subject Wise Summary</h3>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    
                    {/* Maths - Blue */}
                    <div style={{ flex: 1, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                      <div style={{ color: '#1e3a8a', fontSize: '15px', marginBottom: '5px', fontWeight: '600' }}>Maths</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#1d4ed8' }}>{scoreData.subjects?.Mathematics?.totalMarks ?? 0}</div>
                    </div>
                    {/* Physics - Green */}
                    <div style={{ flex: 1, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                      <div style={{ color: '#14532d', fontSize: '15px', marginBottom: '5px', fontWeight: '600' }}>Physics</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#15803d' }}>{scoreData.subjects?.Physics?.totalMarks ?? 0}</div>
                    </div>
                    {/* Chemistry - Orange/Yellow */}
                    <div style={{ flex: 1, backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                      <div style={{ color: '#78350f', fontSize: '15px', marginBottom: '5px', fontWeight: '600' }}>Chemistry</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#b45309' }}>{scoreData.subjects?.Chemistry?.totalMarks ?? 0}</div>
                    </div>

                  </div>
                </div>

                {/* Total Marks (Dark Background, Bold Highlighted Marks) */}
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', flex: '0.8' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#0f172a' }}>Total Marks</h3>
                  <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', border: '2px solid #334155' }}>
                    <div>
                      <div style={{ fontSize: '14px', marginBottom: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Grand Total</div>
                      <div style={{ fontSize: '42px', fontWeight: '900', color: '#fbbf24' }}>
                        {scoreData.totalMarks ?? 0} <span style={{ fontSize: '24px', fontWeight: '600', color: '#64748b' }}>/ 300</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '45px', filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))' }}>🎯</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- 🌟 ఫుటర్ ----------------- */}
      <footer style={{ width: '100%', marginTop: '55px', backgroundColor: '#0f172a', borderTop: '3px solid #2563eb', color: '#ffffff', fontFamily: '"Segoe UI", sans-serif', padding: '28px 20px 22px 20px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          
          <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.9' }}>
            Content Owned and Maintained by <span style={{ fontWeight: '700', color: '#60a5fa' }}>Kk Information Technology</span><br />
            Designed, Developed and Hosted by <span style={{ fontWeight: '700', color: '#60a5fa' }}>IT Sector</span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>© All Rights Reserved.</div>

          <div style={{ width: '100%', maxWidth: '650px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '8px', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
            <div>
              🕒 Last Updated: <span style={{ fontWeight: '700', color: '#ffffff' }}>{footerUpdatedDate}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span>👥 Site Visitors:</span>
              <span style={{ fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>{visitorCount}</span>
            </div>
          </div>
        </div>

        {showTimeoutModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}>
            <div style={{ backgroundColor: '#fff', padding: '30px 40px', borderRadius: '12px', textAlign: 'center', width: '420px', maxWidth: '90%' }}>
              <h2 style={{ color: '#000', margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>Session Timeout</h2>
              <p style={{ color: '#555', marginBottom: '25px', fontSize: '15px' }}>Please login again</p>
              <button onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.replace(window.location.origin); }} style={{ backgroundColor: '#c84313', color: '#fff', border: 'none', padding: '12px 0', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
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
