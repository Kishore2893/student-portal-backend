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

 // 2️⃣ లాస్ట్ అప్డేట్ డేట్
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

  // 3️⃣ ఇమేజ్ డౌన్లోడ్ చేయడానికి html2canvas స్క్రిప్ట్ ఆటోమేటిక్ గా లోడ్ అవుతుంది
  useEffect(() => {
    if (!document.getElementById('html2canvas-script')) {
      const script = document.createElement('script');
      script.id = 'html2canvas-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.body.appendChild(script);
    }
  }, []);

  // ఇమేజ్ డౌన్లోడ్ ఫంక్షన్
  const handleDownloadJPG = () => {
    if (window.html2canvas) {
      const element = document.getElementById('scorecard-modal-content');
      const actionBtns = document.getElementById('modal-action-buttons');
      if (actionBtns) actionBtns.style.display = 'none';

      window.html2canvas(element, { scale: 2, backgroundColor: '#071022', useCORS: true }).then(canvas => {
        if (actionBtns) actionBtns.style.display = 'flex';
        const data = canvas.toDataURL('image/jpeg', 1.0);
        const link = document.createElement('a');
        link.href = data;
        link.download = `JEE_Report_${scoreData?.studentInfo?.appNo || 'Student'}.jpg`;
        link.click();
      });
    } else {
      alert("Loading Please Wait .");
    }
  };

  const handleEvaluate = async () => {
    setEvaluatorError('');
    if (!responseUrl.trim()) {
      setEvaluatorError("An error occurred while processing the response sheet.!");
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
        setEvaluatorError(data.message || "An Error While Data Processing!");
      }
    } catch (err) {
      console.error("Server Error:", err);
      setEvaluatorError("Server Connection Failed. Please try again.");
    } finally {
      setEvaluatorLoading(false);
    }
  };

  // 🌟 ఆటో-లాగిన్ చెక్
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

  // 🛡️ 5 నిమిషాల ఇన్యాక్టివిటీ స్మార్ట్ టైమర్
  const timerRef = useRef(null);

  useEffect(() => {
    const triggerTimeout = () => {
      setShowTimeoutModal(true);
    };

    const resetInactivityTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(triggerTimeout, 300000); // 5 నిమిషాలు
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
    };
  }, []);

  // 🔒 సెక్యూరిటీ: రైట్ క్లిక్ బ్లాక్ & డెవ్టూల్స్ షార్ట్కట్ ప్రొటెక్షన్
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

  // 🎲 6 అంకెల ఆల్ఫాన్యూమరిక్ క్యాప్చా
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
      
      {/* 🟦 హెడర్ బ్యానర్ */}
      <header style={{ backgroundColor: '#ffffff', padding: '22px 20px', textAlign: 'center', width: '100%', boxSizing: 'border-box', position: 'relative', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>NATIONAL ENTRANCE EXAMS</h1>
        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '600', letterSpacing: '0.3px' }}>JEE Main • JEE Advanced • TG EAPCET • AP EAPCET • IPE-2027</p>
      </header>

      {/* 📢 Ticker Bar */}
      <div style={{ width: '100%', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', padding: '8px 0', overflow: 'hidden', display: 'flex', alignItems: 'center', boxSizing: 'border-box', height: '46px' }}>
        <div style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '4px 16px', fontSize: '12px', fontWeight: '800', marginLeft: '20px', borderRadius: '20px', zIndex: 10, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(220,38,38,0.4)' }}>
          ⚡ LATEST UPDATES
        </div>
        <marquee scrollamount="6" style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', cursor: 'pointer', paddingLeft: '15px' }} onMouseOver={(e) => e.target.stop()} onMouseOut={(e) => e.target.start()}>
          {tickerTextList.join('   ✦   ')}
        </marquee>
      </div>

      <div style={{ flex: '1', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!user ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', padding: '45px 4% 60px 4%', width: '100%', gap: '40px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
            
            <style>{`
              .modern-card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04); overflow: hidden; transition: transform 0.25s ease, box-shadow 0.25s ease; }
              .modern-card:hover { transform: translateY(-3px); box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.12); }
              .modern-input { width: 100%; padding: 13px 16px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 15px; color: #1e293b; background-color: #f8fafc; outline: none; transition: all 0.2s ease; box-sizing: border-box; }
              .modern-input:focus { border-color: #2563eb !important; background-color: #ffffff !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important; }
              .btn-primary { width: 100%; padding: 14px; background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #ffffff; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); }
              .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #1e40af, #1d4ed8); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45); }
              .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
            `}</style>

            {/* ─── 🎯 JEE Evaluator Card ─── */}
            <div className="modern-card" style={{ width: '480px', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'linear-gradient(135deg, #0b1d3a, #1e3a8a)', color: '#ffffff', padding: '24px 28px', textAlign: 'left', borderBottom: '3px solid #3b82f6' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  ✨ Instant Score Engine
                </div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎯 JEE Main-2027 Evaluator
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>Calculate subject-wise marks & grand total instantly</p>
              </div>

              <div style={{ padding: '32px 30px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#1e293b', fontSize: '14px' }}>
                    🔗 Candidate Response Sheet URL:
                  </label>
                  <input 
                    type="text" 
                    className="modern-input"
                    placeholder="Paste official response sheet link here..." 
                    value={responseUrl}
                    onChange={(e) => setResponseUrl(e.target.value)}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#64748b', fontSize: '12px' }}>
                    <span>ℹ️ Supports official NTA candidate response sheet links.</span>
                  </div>
                  {evaluatorError && (
                    <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>
                      ⚠️ {evaluatorError}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '30px' }}>
                  <button 
                    onClick={handleEvaluate}
                    disabled={evaluatorLoading}
                    className="btn-primary"
                  >
                    {evaluatorLoading ? '⏳ Evaluating Response Sheet...' : '⚡ Calculate Score'}
                  </button>
                </div>
              </div>
            </div>

            {/* ─── 🔐 Candidate Login Card ─── */}
            <div className="modern-card" style={{ maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', padding: '24px 28px', textAlign: 'left', borderBottom: '3px solid #2563eb' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(37, 99, 235, 0.25)', color: '#93c5fd', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  🔒 Student Services Portal
                </div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Candidate Login
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>Access admit cards, rank cards & applications</p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', padding: '28px 30px', boxSizing: 'border-box' }}>
                
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>
                    🆔 Admission Number:
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

                {/* 🔒 స్టైలిష్ క్యాప్చా బాక్స్ */}
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
                  {loading ? 'Verifying Credentials...' : 'Sign In'}
                </button>
              </form>
              {error && <p style={{ color: '#dc2626', margin: '0 0 20px 0', textAlign: 'center', fontWeight: '700', fontSize: '13px' }}>❌ {error}</p>}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '1020px', width: '100%', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box' }}>            {/* వెల్కమ్ ప్రొఫైల్ బ్యానర్ */}
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

            {/* ✅ మళ్లీ యాడ్ చేసిన 5 Exam Selector Tabs */}
            <div style={{ width: '100%', backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '16px', border: '1px solid #e2e8f0', boxSizing: 'border-box', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['JEE Main', 'JEE Advanced', 'TG EAPCET', 'AP EAPCET', 'IPE-2027'].map((exam) => (
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

      {/* 🎯 🌟 Scorecard Modal (FIXED SCROLL, JPG FIX, CHEMKIS, FULL NAME & SEC-A COLOR) 🌟 🎯 */}
      {scoreData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '15px', boxSizing: 'border-box' }}>
          
          <div id="scorecard-modal-content" style={{ backgroundColor: '#071022', width: '100%', maxWidth: '1000px', borderRadius: '16px', boxShadow: '0 0 40px rgba(13, 71, 161, 0.4)', border: '1px solid #1e3a8a', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", sans-serif' }}>
            
            <div style={{ padding: '12px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', background: 'linear-gradient(90deg, #071022 0%, #0d234a 50%, #071022 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#ffffff', borderRadius: '50%', padding: '3px', display: 'flex' }}>
                   <div style={{ width: '36px', height: '36px', background: 'linear-gradient(45deg, #3b82f6, #ef4444, #eab308, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                   </div>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>JEE-Main Response Report</h2>
                  <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginTop: '2px' }}>Official Subject-Wise Performance Analysis</div>
                </div>
              </div>
              
              <div id="modal-action-buttons" style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleDownloadJPG} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #1d4ed8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} title="Download as JPG">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download
                </button>
                <button onClick={() => setScoreData(null)} style={{ backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                  Close Report ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '15px 25px', flex: 1 }}>
              {/* స్టూడెంట్ నేమ్ కట్ అవ్వకుండా ఫుల్ గా రావడానికి flex: '2' వాడాను */}
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

                  {/* Section A - Light Indigo కలర్ */}
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

                  {/* Section B - Light Blue కలర్ */}
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
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '15px', flex: '1.2' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a' }}>Subject Wise Summary</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ color: '#1e3a8a', fontSize: '13px', marginBottom: '2px', fontWeight: '600' }}>Maths</div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#1d4ed8' }}>{scoreData.subjects?.Mathematics?.totalMarks ?? 0}</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ color: '#14532d', fontSize: '13px', marginBottom: '2px', fontWeight: '600' }}>Physics</div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#15803d' }}>{scoreData.subjects?.Physics?.totalMarks ?? 0}</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ color: '#78350f', fontSize: '13px', marginBottom: '2px', fontWeight: '600' }}>Chemistry</div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309' }}>{scoreData.subjects?.Chemistry?.totalMarks ?? 0}</div>
                    </div>
                  </div>
                </div>

                {/* ✨ టోటల్ మార్క్స్ (కుడి వైపు Congratulations & Chemki) ✨ */}
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '15px', flex: '0.8' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a' }}>Total Marks</h3>
                  <div style={{ background: '#1e293b', borderRadius: '10px', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', border: '2px solid #334155', position: 'relative', overflow: 'hidden' }}>
                    
                    <div style={{ zIndex: 2 }}>
                      <div style={{ fontSize: '12px', marginBottom: '4px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Grand Total</div>
                      <div style={{ fontSize: '36px', fontWeight: '900', color: '#fbbf24' }}>
                        {scoreData.totalMarks ?? 0} <span style={{ fontSize: '20px', fontWeight: '600', color: '#64748b' }}>/ 300</span>
                      </div>
                    </div>
                    
                    {/* రైట్ సైడ్ సింబల్ + Congratulations + Chemki (Sparkles) */}
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px dashed #475569', paddingLeft: '20px', minWidth: '110px' }}>
                      <div style={{ position: 'absolute', top: '-5px', left: '10px', fontSize: '14px' }}>✨</div>
                      <div style={{ position: 'absolute', bottom: '15px', right: '-5px', fontSize: '16px' }}>🌟</div>
                      <div style={{ position: 'absolute', top: '15px', right: '0px', fontSize: '12px' }}>✨</div>
                      
                      <div style={{ fontSize: '32px', filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))', marginBottom: '4px' }}>🎯</div>
                      <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Congratulations!</div>
                    </div>

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
            Content Owned and Maintained by <span style={{ fontWeight: '700', color: '#60a5fa' }}>KK Information Technology</span><br />
            Designed, Developed and Hosted by <span style={{ fontWeight: '700', color: '#60a5fa' }}>KKIT</span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>© All Rights Reserved.</div>

          <div style={{ width: '100%', maxWidth: '650px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '8px', paddingTop: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
            <div>🕒 Last Updated: <span style={{ fontWeight: '700', color: '#ffffff' }}>{footerUpdatedDate}</span></div>
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
