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
        console.log(`ఎవాల్యుయేషన్ పూర్తయింది! మొత్తం మార్కులు: ${data.totalMarks}`);
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

  // 📆 లైవ్ అప్‌డేట్ డేట్
  const [footerUpdatedDate] = useState(() => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  });

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

  // 🛡️ 🌟 స్మార్ట్ ఇన్యాక్టివిటీ ట్రాకర్ (ఆటో-రీఫ్రెష్ అవ్వకుండా యూజర్ యాక్టివిటీ ఉంటే రీసెట్ అవుతుంది) 🌟
  const timerRef = useRef(null);

  useEffect(() => {
    // విద్యార్థి లాగిన్ అయినప్పుడు మాత్రమే టైమర్ పనిచేస్తుంది
    if (!user) return;

    const resetInactivityTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // 15 నిమిషాలు ఏ పనీ చేయకపోతేనే టైమ్-అవుట్ చూపిస్తుంది (15 * 60 * 1000)
      timerRef.current = setTimeout(() => {
        setShowTimeoutModal(true);
      }, 900000); 
    };

    // యూజర్ యాక్టివిటీ ఈవెంట్స్
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer(); // స్టార్ట్ టైమర్

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [user]);

  // సెక్యూరిటీ లాజిక్ (రైట్ క్లిక్ & F12 డిసేబుల్)
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
                    placeholder="Enter 9-Digit ID (e.g. 260310027)"
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
                  <div style={{ background: 'linear-gradient(45deg, #e2e8f0, #cbd5e1)', color: '#1e3a8a', padding: '6px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '19px', letterSpacing: '4px', textDecoration: 'line-through', userSelect: 'none', border: '1px dashed #94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    {captchaText}
                  </div>
                  <button type="button" onClick={generateCaptcha} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', transition: 'all 0.2s' }} title="Refresh Security PIN">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="#2563eb" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
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
          <div style={{ maxWidth: '950px', width: '100%', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box' }}>
            
            {/* వెల్కమ్ బ్యానర్ */}
            <div style={{ background: `linear-gradient(135deg, #1e88e5, ${currentThemeColor})`, color: 'white', padding: '25px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Welcome, {user.studentName}! 👋</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>Admission ID: <strong>{user.admissionNumber}</strong></p>
              </div>
              <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 10px rgba(220,38,38,0.3)' }}>LOGOUT</button>
            </div>

            {/* Exam Selector Tabs */}
            <div style={{ width: '100%', backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxSizing: 'border-box', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {['JEE Main', 'JEE Advanced', 'TG EAPCET', 'AP EAPCET', 'IPE-2027'].map((exam) => (
                  <button
                    key={exam}
                    onClick={() => setActiveExam(exam)}
                    style={{
                      padding: '12px 24px',
                      background: activeExam === exam ? examThemes[exam] : '#f8fafc',
                      color: activeExam === exam ? '#ffffff' : '#475569',
                      border: activeExam === exam ? 'none' : '1px solid #cbd5e1',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      boxShadow: activeExam === exam ? '0 8px 20px rgba(0,0,0,0.15)' : 'none',
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

      {/* 🎯 🌟 JEE Response Report Modal 🌟 🎯 */}
      {scoreData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '1180px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
            
            <style>{`
              .result-table th { padding: 12px 10px !important; border: 1px solid #334155 !important; font-size: 13px; font-weight: 700 !important; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; }
              .result-table td { padding: 12px 10px !important; border: 1px solid #cbd5e1 !important; font-size: 14px; font-weight: 600; color: #1e293b; text-align: center; }
            `}</style>

            {/* 1. టాప్ హెడర్ సెక్షన్ */}
            <div style={{ background: 'linear-gradient(135deg, #0b1d3a, #1a365d)', color: '#ffffff', padding: '20px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #2563eb' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🎯 JEE-MAIN Response Report
                </h2>
                <small style={{ color: '#93c5fd', fontWeight: '600', fontSize: '13px' }}>Official Subject-Wise Performance Analysis</small>
              </div>
              <button onClick={() => setScoreData(null)} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(220,38,38,0.35)', transition: 'all 0.2s' }}>
                Close Report ✕
              </button>
            </div>

            {/* 2. మెయిన్ కంటెంట్ ఏరియా */}
            <div style={{ padding: '30px 35px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
              
              <table className="result-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', borderRadius: '10px', overflow: 'hidden', marginBottom: '30px' }}>
                <thead>
                  <tr>
                    <th style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Student Name:</th>
                    <td style={{ backgroundColor: '#ffffff', fontWeight: '800', color: '#1e3a8a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.name || "N/A"}</td>
                    <th style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Application No:</th>
                    <td style={{ backgroundColor: '#ffffff', fontWeight: '800', color: '#0f172a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.appNo || "N/A"}</td>
                    <th style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Roll Number:</th>
                    <td style={{ backgroundColor: '#ffffff', fontWeight: '800', color: '#0f172a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.rollNo || "N/A"}</td>
                    <th style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Test Date:</th>
                    <td style={{ backgroundColor: '#ffffff', fontWeight: '800', color: '#0f172a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.examDate || "N/A"}</td>
                    <th style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Test Time:</th>
                    <td style={{ backgroundColor: '#ffffff', fontWeight: '800', color: '#0f172a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.examShift === 'Shift2' ? '3:00 PM - 6:00 PM' : '9:00 AM - 12:00 PM'}</td>
                  </tr>

                  <tr>
                    <th style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}></th>
                    <th colSpan="3" style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: '#ffffff', fontSize: '15px', letterSpacing: '1px' }}>📘 MATHEMATICS</th>
                    <th colSpan="3" style={{ background: 'linear-gradient(135deg, #065f46, #059669)', color: '#ffffff', fontSize: '15px', letterSpacing: '1px' }}>📗 PHYSICS</th>
                    <th colSpan="3" style={{ background: 'linear-gradient(135deg, #92400e, #d97706)', color: '#ffffff', fontSize: '15px', letterSpacing: '1px' }}>📙 CHEMISTRY</th>
                  </tr>

                  <tr>
                    <th style={{ backgroundColor: '#334155', color: '#ffffff' }}>Section</th>
                    <th style={{ backgroundColor: '#10b981', color: '#ffffff' }}>Positive</th>
                    <th style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>Negative</th>
                    <th style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>Total</th>
                    <th style={{ backgroundColor: '#10b981', color: '#ffffff' }}>Positive</th>
                    <th style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>Negative</th>
                    <th style={{ backgroundColor: '#059669', color: '#ffffff' }}>Total</th>
                    <th style={{ backgroundColor: '#10b981', color: '#ffffff' }}>Positive</th>
                    <th style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>Negative</th>
                    <th style={{ backgroundColor: '#d97706', color: '#ffffff' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ backgroundColor: '#f1f5f9', fontWeight: '800', color: '#0f172a' }}>A</td>
                    <td style={{ fontWeight: '700' }}>{scoreData.subjects?.Mathematics?.secAPositive ?? 0}</td>
                    <td style={{ color: '#ef4444', fontWeight: '700' }}>{scoreData.subjects?.Mathematics?.secANegative ?? 0}</td>
                    <td style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '15px' }}>{scoreData.subjects?.Mathematics?.secATotal ?? 0}</td>
                    
                    <td style={{ fontWeight: '700' }}>{scoreData.subjects?.Physics?.secAPositive ?? 0}</td>
                    <td style={{ color: '#ef4444', fontWeight: '700' }}>{scoreData.subjects?.Physics?.secANegative ?? 0}</td>
                    <td style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: '800', fontSize: '15px' }}>{scoreData.subjects?.Physics?.secATotal ?? 0}</td>
                    
                    <td style={{ fontWeight: '700' }}>{scoreData.subjects?.Chemistry?.secAPositive ?? 0}</td>
                    <td style={{ color: '#ef4444', fontWeight: '700' }}>{scoreData.subjects?.Chemistry?.secANegative ?? 0}</td>
                    <td style={{ backgroundColor: '#fff7ed', color: '#b45309', fontWeight: '800', fontSize: '15px' }}>{scoreData.subjects?.Chemistry?.secATotal ?? 0}</td>
                  </tr>

                  <tr>
                    <td style={{ backgroundColor: '#f1f5f9', fontWeight: '800', color: '#0f172a' }}>B</td>
                    <td style={{ fontWeight: '700' }}>{scoreData.subjects?.Mathematics?.secBPositive ?? 0}</td>
                    <td style={{ color: '#ef4444', fontWeight: '700' }}>{scoreData.subjects?.Mathematics?.secBNegative ?? 0}</td>
                    <td style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '15px' }}>{scoreData.subjects?.Mathematics?.secBTotal ?? 0}</td>
                    
                    <td style={{ fontWeight: '700' }}>{scoreData.subjects?.Physics?.secBPositive ?? 0}</td>
                    <td style={{ color: '#ef4444', fontWeight: '700' }}>{scoreData.subjects?.Physics?.secBNegative ?? 0}</td>
                    <td style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: '800', fontSize: '15px' }}>{scoreData.subjects?.Physics?.secBTotal ?? 0}</td>
                    
                    <td style={{ fontWeight: '700' }}>{scoreData.subjects?.Chemistry?.secBPositive ?? 0}</td>
                    <td style={{ color: '#ef4444', fontWeight: '700' }}>{scoreData.subjects?.Chemistry?.secBNegative ?? 0}</td>
                    <td style={{ backgroundColor: '#fff7ed', color: '#b45309', fontWeight: '800', fontSize: '15px' }}>{scoreData.subjects?.Chemistry?.secBTotal ?? 0}</td>
                  </tr>
                </tbody>
              </table>

              {/* 3. సమ్మరీ టేబుల్స్ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                <div>
                  <table className="result-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <thead>
                      <tr>
                        <th colSpan="4" style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', color: '#ffffff', fontSize: '14px' }}>📊 SUBJECT WISE SUMMARY</th>
                      </tr>
                      <tr>
                        <th style={{ backgroundColor: '#475569', color: '#ffffff' }}>Subject</th>
                        <th style={{ backgroundColor: '#10b981', color: '#ffffff' }}>Positive</th>
                        <th style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>Negative</th>
                        <th style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: '800', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px', color: '#1e40af' }}>Maths</td>
                        <td style={{ fontWeight: '700' }}>{(scoreData.subjects?.Mathematics?.secAPositive ?? 0) + (scoreData.subjects?.Mathematics?.secBPositive ?? 0)}</td>
                        <td style={{ color: '#ef4444', fontWeight: '700' }}>{(scoreData.subjects?.Mathematics?.secANegative ?? 0) + (scoreData.subjects?.Mathematics?.secBNegative ?? 0)}</td>
                        <td style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '15px' }}>{scoreData.subjects?.Mathematics?.totalMarks ?? 0}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: '800', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px', color: '#047857' }}>Physics</td>
                        <td style={{ fontWeight: '700' }}>{(scoreData.subjects?.Physics?.secAPositive ?? 0) + (scoreData.subjects?.Physics?.secBPositive ?? 0)}</td>
                        <td style={{ color: '#ef4444', fontWeight: '700' }}>{(scoreData.subjects?.Physics?.secANegative ?? 0) + (scoreData.subjects?.Physics?.secBNegative ?? 0)}</td>
                        <td style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: '800', fontSize: '15px' }}>{scoreData.subjects?.Physics?.totalMarks ?? 0}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: '800', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px', color: '#b45309' }}>Chemistry</td>
                        <td style={{ fontWeight: '700' }}>{(scoreData.subjects?.Chemistry?.secAPositive ?? 0) + (scoreData.subjects?.Chemistry?.secBPositive ?? 0)}</td>
                        <td style={{ color: '#ef4444', fontWeight: '700' }}>{(scoreData.subjects?.Chemistry?.secANegative ?? 0) + (scoreData.subjects?.Chemistry?.secBNegative ?? 0)}</td>
                        <td style={{ backgroundColor: '#fff7ed', color: '#b45309', fontWeight: '800', fontSize: '15px' }}>{scoreData.subjects?.Chemistry?.totalMarks ?? 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <table className="result-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <thead>
                      <tr>
                        <th colSpan="2" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', fontSize: '14px' }}>🎯 TOTAL MARKS</th>
                      </tr>
                      <tr>
                        <th style={{ backgroundColor: '#475569', color: '#ffffff' }}>Subject</th>
                        <th style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: '800', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px', color: '#1e40af' }}>Maths</td>
                        <td style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '15px' }}>{scoreData.subjects?.Mathematics?.totalMarks ?? 0}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: '800', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px', color: '#047857' }}>Physics</td>
                        <td style={{ fontWeight: '800', color: '#047857', fontSize: '15px' }}>{scoreData.subjects?.Physics?.totalMarks ?? 0}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: '800', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px', color: '#b45309' }}>Chemistry</td>
                        <td style={{ fontWeight: '800', color: '#b45309', fontSize: '15px' }}>{scoreData.subjects?.Chemistry?.totalMarks ?? 0}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <td style={{ fontWeight: '900', color: '#0f172a', textAlign: 'left', paddingLeft: '20px', fontSize: '15px' }}>GRAND TOTAL</td>
                        <td style={{ fontWeight: '900', color: '#ffffff', backgroundColor: '#1e3a8a', fontSize: '19px', letterSpacing: '0.5px' }}>
                          {scoreData.totalMarks ?? 0} / 300
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------- 🌟 క్లీన్ ఫుటర్ డిజైన్ (No Top Policy Bar) ----------------- */}
      <footer style={{ width: '100%', marginTop: '55px', backgroundColor: '#0f172a', borderTop: '3px solid #2563eb', color: '#ffffff', fontFamily: '"Segoe UI", sans-serif', padding: '28px 20px 22px 20px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          
          {/* Main Credits */}
          <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.9' }}>
            Content Owned and Maintained by <span style={{ fontWeight: '700', color: '#60a5fa' }}>Kk Information Technology</span><br />
            Designed, Developed and Hosted by <span style={{ fontWeight: '700', color: '#60a5fa' }}>IT Sector</span>
          </div>

          {/* Copyright Text */}
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
            © All Rights Reserved.
          </div>

          {/* Bottom Row: Last Updated & Visitors Count */}
          <div style={{ width: '100%', maxWidth: '650px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '8px', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
            <div>
              🕒 Last Updated: <span style={{ fontWeight: '700', color: '#ffffff' }}>{footerUpdatedDate}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span>👥 Site Visitors:</span>
              <span style={{ fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>1,84,392</span>
            </div>
          </div>

        </div>

        {/* 🚨 Session Timeout Modal */}
        {showTimeoutModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}>
            <div style={{ backgroundColor: '#fff', padding: '30px 40px', borderRadius: '12px', textAlign: 'center', width: '420px', maxWidth: '90%' }}>
              <h2 style={{ color: '#000', margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>Session Timeout</h2>
              <p style={{ color: '#555', marginBottom: '25px', fontSize: '15px' }}>Please login again</p>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.replace(window.location.origin);
                }}
                style={{ backgroundColor: '#c84313', color: '#fff', border: 'none', padding: '12px 0', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
              >
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
