import React, { useState, useEffect } from 'react';
import ExamConsole from './ExamConsole.jsx';
import Modals from './Modals';

function App() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🔒 క్యాప్చా కోసం స్టేట్స్
  const [captchaText, setCaptchaText] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');

  // ─── JEE ఎవాల్యుయేటర్ కోసం స్టేట్స్ ───
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

  // 📆 వెబ్‌సైట్ ఫుటర్ లైవ్ డేట్
  const [footerUpdatedDate] = useState(() => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  });

  // 🛡️ 5 నిమిషాల ఇన్యాక్టివిటీ ఆటో-లాగౌట్ మరియు సెక్యూరిటీ లాజిక్
  useEffect(() => {
    let mainTimerId;
    let fallbackRedirectId;

    const handleFinalLogout = () => {
      if (mainTimerId) clearTimeout(mainTimerId);
      if (fallbackRedirectId) clearTimeout(fallbackRedirectId);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace(window.location.origin);
    };

    window.closeSessionModalAndLogout = handleFinalLogout;

    const triggerTimeout = () => {
      setShowTimeoutModal(true);
      fallbackRedirectId = setTimeout(handleFinalLogout, 30000);
    };

    mainTimerId = setTimeout(triggerTimeout, 300000); 

    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (mainTimerId) clearTimeout(mainTimerId);
      if (fallbackRedirectId) clearTimeout(fallbackRedirectId);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 🎲 6 అంకెల ఆల్ఫాన్యూమరిక్ క్యాప్చా జనరేటర్
  const generateCaptcha = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserCaptchaInput(''); 
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

    // 🔒 క్యాప్చా వెరిఫికేషన్
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
    localStorage.removeItem('examUser');
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
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', width: '100%', fontFamily: '"Segoe UI", sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* 🟦 హెడర్ బ్యానర్ */}
      <header style={{ backgroundColor: '#ffffff', padding: '25px 20px', textAlign: 'center', width: '100%', boxSizing: 'border-box', position: 'relative', borderBottom: '1px solid #e2e8f0' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#000000' }}>NATIONAL ENTRANCE EXAMS</h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#333333', fontWeight: '500' }}>JEE Main • JEE Advanced • TG EAPCET • AP EAPCET • IPE-2027</p>
      </header>

      {/* 📢 Ticker Bar */}
      <div style={{ width: '100%', backgroundColor: '#0043a4', borderBottom: '1px solid #002244', padding: '8px 0', overflow: 'hidden', display: 'flex', alignItems: 'center', boxSizing: 'border-box', height: '45px' }}>
        <div style={{ backgroundColor: '#d32f2f', color: '#ffffff', padding: '4px 20px', fontSize: '13px', fontWeight: 'bold', marginLeft: '20px', zIndex: 10, whiteSpace: 'nowrap', borderRight: '1px solid rgba(255, 255, 255, 0.4)', height: '100%', display: 'flex', alignItems: 'center' }}>
          LATEST NEWS 
        </div>
        <marquee scrollamount="5" style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', cursor: 'pointer' }} onMouseOver={(e) => e.target.stop()} onMouseOut={(e) => e.target.start()}>
          {tickerTextList.join('   |   ')}
        </marquee>
      </div>

      <div style={{ flex: '1', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!user ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', padding: '30px 4% 60px 4%', width: '100%', gap: '50px', flexWrap: 'wrap' }}>
            
            <style>{`
              .evaluator-input { outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
              .evaluator-input:focus { border-color: #1a73e8 !important; box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2) !important; }
            `}</style>

            {/* ─── ఎడమ వైపు JEE Evaluator బాక్స్ ─── */}
            <div style={{ background: '#ffffff', width: '470px', maxWidth: '100%', borderRadius: '6px', border: '1px solid #ced4da', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ backgroundColor: '#0c3d7c', color: 'white', fontSize: '22px', fontWeight: 'bold', padding: '16px 24px', textAlign: 'center', borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
                JEE Main-2027 Evaluator
              </div>
              <div style={{ padding: '35px 30px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#333333', textAlign: 'left', fontSize: '15px' }}>Response Sheet URL:</label>
                  <input 
                    type="text" 
                    className="evaluator-input"
                    placeholder="Paste Response Sheet URL here" 
                    value={responseUrl}
                    onChange={(e) => setResponseUrl(e.target.value)}
                    style={{ width: '100%', padding: '14px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} 
                  />
                  {evaluatorError && <p style={{ color: '#d32f2f', marginTop: '10px', fontSize: '13px', fontWeight: '600' }}>⚠️ {evaluatorError}</p>}
                </div>
                <button 
                  onClick={handleEvaluate}
                  disabled={evaluatorLoading}
                  style={{ width: '100%', padding: '14px', backgroundColor: evaluatorLoading ? '#cccccc' : '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: evaluatorLoading ? 'not-allowed' : 'pointer', marginTop: 'auto' }}
                >
                  {evaluatorLoading ? 'Evaluating...' : 'Evaluate Score'}
                </button>
              </div>
            </div>

            {/* ─── కుడి వైపు లాగిన్ బాక్స్ ─── */}
            <div style={{ background: '#ffffff', maxWidth: '450px', width: '100%', borderRadius: '6px', border: '1px solid #dcdcdc', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', boxSizing: 'border-box', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#0c3d7c', color: 'white', fontSize: '22px', fontWeight: 'bold', padding: '16px 24px', textAlign: 'center' }}>
                Candidate Login
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '30px 35px', boxSizing: 'border-box' }}>
                
                <div style={{ marginBottom: '20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#000000', fontSize: '14px', textAlign: 'left' }}>
                    Admission Number:
                  </label>
                  <input 
                    type="text" 
                    value={admissionNumber} 
                    onChange={(e) => setAdmissionNumber(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #b0b0b0', boxSizing: 'border-box', fontSize: '15px', color: '#333333', backgroundColor: '#ffffff', outline: 'none' }} 
                    placeholder="Enter 9-Digit ID"
                    maxLength={9} 
                  />
                </div>

                <div style={{ marginBottom: '20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#000000', fontSize: '14px', textAlign: 'left' }}>
                    Registered Mobile Number:
                  </label>
                  <input 
                    type="password" 
                    value={mobileNumber} 
                    onChange={(e) => setMobileNumber(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #b0b0b0', boxSizing: 'border-box', fontSize: '15px', color: '#333333', backgroundColor: '#ffffff', outline: 'none' }} 
                    placeholder="Enter Mobile Number" 
                  />
                </div>

                <div style={{ marginBottom: '20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#000000', fontSize: '14px', textAlign: 'left' }}>
                    Enter Security Pin:
                  </label>
                  <input 
                    type="text" 
                    value={userCaptchaInput} 
                    onChange={(e) => setUserCaptchaInput(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #b0b0b0', boxSizing: 'border-box', fontSize: '15px', color: '#333333', backgroundColor: '#ffffff', outline: 'none' }} 
                    placeholder="Type Security Pin" 
                    maxLength={6} 
                  />
                </div>

                {/* 🔒 క్యాప్చా సెక్షన్ */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', gap: '15px', width: '100%' }}>
                  <span style={{ fontSize: '14px', color: '#000000', fontWeight: 'bold' }}>Security Pin:</span>
                  <div style={{ background: 'linear-gradient(45deg, #e2e8f0, #cbd5e1)', color: '#0001bc', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '20px', letterSpacing: '4px', textDecoration: 'line-through', userSelect: 'none', border: '1px dashed #94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '38px', flexShrink: 0 }}>
                    {captchaText}
                  </div>
                  <button type="button" onClick={generateCaptcha} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0' }} title="Refresh Captcha">
                    <svg viewBox="0 0 24 24" width="26" height="26">
                      <path fill="#39cb1b" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                  </button>
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#1b74ff', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Verifying...' : 'Login'}
                </button>
              </form>
              {error && <p style={{ color: '#d32f2f', margin: '0 0 20px 0', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>❌ {error}</p>}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '950px', width: '100%', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box' }}>
            
            {/* వెల్కమ్ బ్యానర్ */}
            <div style={{ background: `linear-gradient(135deg, #1e88e5, ${currentThemeColor})`, color: 'white', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', transition: 'all 0.3s ease' }}>
              <div>
                <h2 style={{ margin: 0 }}>Welcome, {user.studentName}! 👋</h2>
                <p style={{ margin: '5px 0 0 0' }}>Admission ID: <strong>{user.admissionNumber}</strong></p>
              </div>
              <button onClick={handleLogout} style={{ padding: '10px 18px', backgroundColor: '#c73131', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</button>
            </div>

            {/* Exam Selector Tabs */}
            <div style={{ width: '100%', backgroundColor: '#f1f5f9', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box', marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['JEE Main', 'JEE Advanced', 'TG EAPCET', 'AP EAPCET', 'IPE-2027'].map((exam) => (
                  <button
                    key={exam}
                    onClick={() => setActiveExam(exam)}
                    style={{
                      padding: '12px 24px',
                      background: activeExam === exam ? examThemes[exam] : '#ffffff',
                      color: activeExam === exam ? '#ffffff' : '#475569',
                      border: activeExam === exam ? 'none' : '1px solid #cbd5e1',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      boxShadow: activeExam === exam ? '0 8px 20px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

      {/* 🎯 JEE Response Report Modal (Root Level) */}
      {scoreData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '1150px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
            
            <style>{`
              .result-table th { background-color: #0c3d7c !important; color: #ffffff !important; font-weight: 700 !important; text-transform: uppercase; letter-spacing: 0.5px; font-size: 12px; padding: 12px 10px !important; border: 1px solid #334155 !important; }
              .result-table td { padding: 12px 10px !important; border: 1px solid #e2e8f0 !important; font-size: 14px; font-weight: 600; color: #334155; text-align: center; }
              .sub-header-row { color: #ffffff !important; font-size: 14px !important; font-weight: bold !important; }
            `}</style>

            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: '#ffffff', padding: '20px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #3b82f6' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>🎯 JEE-MAIN Response Report</h2>
                <small style={{ color: '#93c5fd', fontWeight: '600' }}>Subject Wise Evaluation</small>
              </div>
              <button onClick={() => setScoreData(null)} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(220,38,38,0.3)' }}>
                Close Report ✕
              </button>
            </div>

            {/* Modal Table Area */}
            <div style={{ padding: '35px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
              <table className="result-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderRadius: '8px', overflow: 'hidden', marginBottom: '35px' }}>
                <thead>
                  <tr>
                    <th>Student Name:</th>
                    <td style={{ backgroundColor: '#fff', fontWeight: '700', color: '#1e3a8a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.name || "N/A"}</td>
                    <th>Application Number:</th>
                    <td style={{ backgroundColor: '#fff', fontWeight: '700', color: '#0f172a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.appNo || "N/A"}</td>
                    <th>Roll Number:</th>
                    <td style={{ backgroundColor: '#fff', fontWeight: '700', color: '#0f172a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.rollNo || "N/A"}</td>
                    <th>Test Date:</th>
                    <td style={{ backgroundColor: '#fff', fontWeight: '700', color: '#0f172a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.examDate || "N/A"}</td>
                    <th>Test Time:</th>
                    <td style={{ backgroundColor: '#fff', fontWeight: '700', color: '#0f172a', textAlign: 'left', paddingLeft: '15px' }}>{scoreData.studentInfo?.examShift === 'Shift2' ? '3:00 PM - 6:00 PM' : '9:00 AM - 12:00 PM'}</td>
                  </tr>
                  <tr>
                    <th style={{ background: '#f1f5f9', border: 'none' }}></th>
                    <th colSpan="3" className="sub-header-row" style={{ background: '#2563eb' }}>Mathematics</th>
                    <th colSpan="3" className="sub-header-row" style={{ background: '#059669' }}>Physics</th>
                    <th colSpan="3" className="sub-header-row" style={{ background: '#d97706' }}>Chemistry</th>
                  </tr>
                  <tr>
                    <th style={{ backgroundColor: '#475569' }}>Section</th>
                    <th style={{ backgroundColor: '#1e3a8a' }}>Positive</th>
                    <th style={{ backgroundColor: '#1e3a8a' }}>Negative</th>
                    <th style={{ backgroundColor: '#1d4ed8', color: '#fff' }}>Total</th>
                    <th style={{ backgroundColor: '#065f46' }}>Positive</th>
                    <th style={{ backgroundColor: '#065f46' }}>Negative</th>
                    <th style={{ backgroundColor: '#047857', color: '#fff' }}>Total</th>
                    <th style={{ backgroundColor: '#92400e' }}>Positive</th>
                    <th style={{ backgroundColor: '#92400e' }}>Negative</th>
                    <th style={{ backgroundColor: '#b45309', color: '#fff' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>A</td>
                    <td>{scoreData.subjects?.Mathematics?.secAPositive ?? 0}</td>
                    <td style={{ color: '#ef4444' }}>{scoreData.subjects?.Mathematics?.secANegative ?? 0}</td>
                    <td style={{ backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: '700' }}>{scoreData.subjects?.Mathematics?.secATotal ?? 0}</td>
                    <td>{scoreData.subjects?.Physics?.secAPositive ?? 0}</td>
                    <td style={{ color: '#ef4444' }}>{scoreData.subjects?.Physics?.secANegative ?? 0}</td>
                    <td style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: '700' }}>{scoreData.subjects?.Physics?.secATotal ?? 0}</td>
                    <td>{scoreData.subjects?.Chemistry?.secAPositive ?? 0}</td>
                    <td style={{ color: '#ef4444' }}>{scoreData.subjects?.Chemistry?.secANegative ?? 0}</td>
                    <td style={{ backgroundColor: '#fff7ed', color: '#92400e', fontWeight: '700' }}>{scoreData.subjects?.Chemistry?.secATotal ?? 0}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>B</td>
                    <td>{scoreData.subjects?.Mathematics?.secBPositive ?? 0}</td>
                    <td style={{ color: '#ef4444' }}>{scoreData.subjects?.Mathematics?.secBNegative ?? 0}</td>
                    <td style={{ backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: '700' }}>{scoreData.subjects?.Mathematics?.secBTotal ?? 0}</td>
                    <td>{scoreData.subjects?.Physics?.secBPositive ?? 0}</td>
                    <td style={{ color: '#ef4444' }}>{scoreData.subjects?.Physics?.secBNegative ?? 0}</td>
                    <td style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: '700' }}>{scoreData.subjects?.Physics?.secBTotal ?? 0}</td>
                    <td>{scoreData.subjects?.Chemistry?.secBPositive ?? 0}</td>
                    <td style={{ color: '#ef4444' }}>{scoreData.subjects?.Chemistry?.secBNegative ?? 0}</td>
                    <td style={{ backgroundColor: '#fff7ed', color: '#92400e', fontWeight: '700' }}>{scoreData.subjects?.Chemistry?.secBTotal ?? 0}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary Tables */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                <div>
                  <table className="result-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th colSpan="4" style={{ background: '#1e293b', fontSize: '13px' }}>Subject Wise Summary</th>
                      </tr>
                      <tr>
                        <th style={{ backgroundColor: '#475569' }}>Subject</th>
                        <th style={{ backgroundColor: '#10b981' }}>Positive</th>
                        <th style={{ backgroundColor: '#ef4444' }}>Negative</th>
                        <th style={{ backgroundColor: '#3b82f6' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 'bold', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px' }}>Maths</td>
                        <td>{(scoreData.subjects?.Mathematics?.secAPositive ?? 0) + (scoreData.subjects?.Mathematics?.secBPositive ?? 0)}</td>
                        <td style={{ color: '#ef4444' }}>{(scoreData.subjects?.Mathematics?.secANegative ?? 0) + (scoreData.subjects?.Mathematics?.secBNegative ?? 0)}</td>
                        <td style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold' }}>{scoreData.subjects?.Mathematics?.totalMarks ?? 0}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px' }}>Physics</td>
                        <td>{(scoreData.subjects?.Physics?.secAPositive ?? 0) + (scoreData.subjects?.Physics?.secBPositive ?? 0)}</td>
                        <td style={{ color: '#ef4444' }}>{(scoreData.subjects?.Physics?.secANegative ?? 0) + (scoreData.subjects?.Physics?.secBNegative ?? 0)}</td>
                        <td style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 'bold' }}>{scoreData.subjects?.Physics?.totalMarks ?? 0}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px' }}>Chemistry</td>
                        <td>{(scoreData.subjects?.Chemistry?.secAPositive ?? 0) + (scoreData.subjects?.Chemistry?.secBPositive ?? 0)}</td>
                        <td style={{ color: '#ef4444' }}>{(scoreData.subjects?.Chemistry?.secANegative ?? 0) + (scoreData.subjects?.Chemistry?.secBNegative ?? 0)}</td>
                        <td style={{ backgroundColor: '#fff7ed', color: '#b45309', fontWeight: 'bold' }}>{scoreData.subjects?.Chemistry?.totalMarks ?? 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <table className="result-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th colSpan="2" style={{ background: '#0f172a', fontSize: '13px' }}>Total Marks</th>
                      </tr>
                      <tr>
                        <th style={{ backgroundColor: '#475569' }}>Subject</th>
                        <th style={{ backgroundColor: '#2563eb' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 'bold', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px' }}>Maths</td>
                        <td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{scoreData.subjects?.Mathematics?.totalMarks ?? 0}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px' }}>Physics</td>
                        <td style={{ fontWeight: 'bold', color: '#047857' }}>{scoreData.subjects?.Physics?.totalMarks ?? 0}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', backgroundColor: '#fff', textAlign: 'left', paddingLeft: '20px' }}>Chemistry</td>
                        <td style={{ fontWeight: 'bold', color: '#b45309' }}>{scoreData.subjects?.Chemistry?.totalMarks ?? 0}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <td style={{ fontWeight: '800', color: '#0f172a', textAlign: 'left', paddingLeft: '20px', fontSize: '15px' }}>GRAND TOTAL</td>
                        <td style={{ fontWeight: '800', color: '#ffffff', backgroundColor: '#1e3a8a', fontSize: '18px' }}>{scoreData.totalMarks ?? 0} / 300</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* టూ-టోన్ అఫీషియల్ ఫుటర్ */}
      <footer style={{ width: '100%', marginTop: '50px', borderTop: '4px solid #0043a4' }}>
        <div style={{ backgroundColor: '#222222', padding: '16px 20px', borderBottom: '1px solid #333333', display: 'flex', justifyContent: 'center', gap: '15px', color: '#cbd5e1', fontSize: '13px', fontWeight: '500', flexWrap: 'wrap' }}>
          <span>Copyright Policy</span> | 
          <span>Privacy Policy</span> | 
          <span>Hyperlink Policy</span> | 
          <span>Terms and Conditions</span> | 
          <span>Help</span>
        </div>
        
        <div style={{ backgroundColor: '#111111', padding: '25px 20px', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.9' }}>
            Content Owned and Maintained by <span style={{ fontWeight: '600', color: '#7ba8e0' }}>Kk Information Technology</span><br />
            Designed, Developed and hosted by <span style={{ fontWeight: '600', color: '#7ba8e0' }}>IT Sector</span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '15px', borderTop: '1px solid #222222', paddingTop: '10px' }}>
            Last Updated: <span style={{ fontWeight: '600', color: '#ffffff' }}>{footerUpdatedDate}</span>
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
