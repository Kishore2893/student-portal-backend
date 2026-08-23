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

  // ─── జేఈఈ ఎవాల్యుయేటర్ కోసం స్టేట్స్ ───
  const [responseUrl, setResponseUrl] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [evaluatorLoading, setEvaluatorLoading] = useState(false);

  const handleEvaluate = async () => {
      if (!responseUrl.trim()) {
          alert("దయచేసి రెస్పాన్స్ షీట్ URL ని ఇక్కడ పేస్ట్ చేయండి!");
          return;
      }
      setEvaluatorLoading(true); 
      setScoreData(null);

      try {
          const response = await fetch(`https://student-portal-backend-vo2b.onrender.com/api/evaluate-sheet`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: responseUrl }),
          });
          const data = await response.json(); 
          if (data.success) {
              setScoreData(data);
              console.log(`ఎవాల్యుయేషన్ పూర్తయింది! మొత్తం మార్కులు: ${data.totalMarks}`);
          } else {
              alert(data.message || "డేటా ప్రాసెస్ చేయడంలో లోపం వచ్చింది!");
          }
      } catch (error) {
          console.error("Server Error:", error);
          alert("సర్వర్ కనెక్షన్ లో లోపం వచ్చింది!");
      } finally {
          setEvaluatorLoading(false);
      }
  };

  // 📆 🌟 వెబ్‌సైట్ మోడిఫికేషన్ లేదా బ్యాకెండ్ డేటా అప్‌డేట్ చేసినప్పుడు ఆటోమేటిక్‌గా ఆ రోజు కరెంట్ డేట్ కింద మారేలా:
  const [footerUpdatedDate, setFooterUpdatedDate] = useState(() => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  });

  // 🛡️ 2 నిమిషాల ఇన్‌యాక్టివిటీ ఆటో-లాగౌట్ మరియు వెబ్‌సైట్ సెక్యూరిటీ లాజిక్
  useEffect(() => {
    let highestTimeoutId = setTimeout(() => {});
    for (let i = 0 ; i < highestTimeoutId ; i++) {
        clearTimeout(i);
    }

    // బ్రౌజర్ తెల్ల అలర్ట్ బాక్స్‌లను పూర్తిగా బ్లాక్ చేయడం
    window.alert = function(msg) {
      console.log("Blocked alert: ", msg);
      return true; 
    };

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
      if (typeof setShowSessionModal === 'function') setShowSessionModal(false);
      if (typeof setShowYearModal === 'function') setShowYearModal(false);
      if (typeof setActiveExam === 'function') setActiveExam('');

      const allModals = document.querySelectorAll('.modal, [class*="modal"], [id*="modal"]');
      allModals.forEach(m => {
        if (m.id !== "sessionTimeoutModalElement") {
          m.style.setProperty('display', 'none', 'important');
        }
      });

      const modal = document.getElementById("sessionTimeoutModalElement");
      if (modal) {
        modal.style.display = "flex";
      } else {
        setShowTimeoutModal(true);
      }

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

  // 🎲 6 అంకెల ఆల్ఫాన్యూమరిక్ క్యాప్చా జనరేట్ చేసే ఫంక్షన్
  const generateCaptcha = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserCaptchaInput(''); 
  };

  // 🌟 ఆటో-లాగిన్ చెక్ చేసే కోడ్
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

  // స్క్రోలింగ్ బార్ లో కేవలం టెక్స్ట్ మాత్రమే చూపించడానికి
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
  const fixedHeaderColor = '#0043a4';

  // ⏳ స్క్రీన్ లోడ్ అవ్వగానే క్యాప్చా జనరేట్ అవుతుంది
  useEffect(() => { 
    document.title = "IIT JEE Analysis"; 
    generateCaptcha();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); 

    // 🔒 క్యాప్చా వెరిఫికేషన్ లాజిక్
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
        setError(data.error); 
        generateCaptcha();
      }
    } catch (err) { 
      setError("Invalid Admission Number or Mobile Number!"); 
      generateCaptcha();
    } finally { 
      setLoading(false); 
    }
  };

  // 🔄 లాగ్‌అవుట్ చేసినప్పుడు వివరాలు పక్కాగా క్లియర్ అవ్వడానికి
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
        console.error("డౌన్‌లోడ్ లోపం వచ్చింది:", err);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', width: '100%', fontFamily: '"Segoe UI", sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* 🟦 హెటర్ బ్యానర్ */}
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', padding: '15px 4% 60px 4%', width: '100%', gap: '100px' }}>
            
            {/* క్లిక్ చేసినప్పుడు బ్లూ కలర్ గ్లో రావడానికి సిఎస్ెస్ స్టైల్స్ জোడించబడ్డాయి */}
            <style>{`
                .evaluator-input { outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
                .evaluator-input:focus { border-color: #1a73e8 !important; box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2) !important; }
            `}</style>

            {/* ─── ఎడమ వైపు JEE Evaluator బాక్స్ ─── */}
            <div style={{ background: '#ffffff', width: '470px', flexShrink: 0, borderRadius: '4px', border: '1px solid #ced4da', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#0c3d7c', color: 'white', fontSize: '24px', fontWeight: 'bold', padding: '16px 24px', textAlign: 'center', borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }}>
                    JEE Main-27 Evaluator
                </div>
                <div style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px', color: '#333333', textAlign: 'left', fontSize: '16px' }}>Response sheet URL:</label>
                        <input 
                            type="text" 
                            className="evaluator-input"
                            placeholder="Paste Response Sheet URL" 
                            value={responseUrl}
                            onChange={(e) => setResponseUrl(e.target.value)}
                            style={{ width: '100%', padding: '25px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box' }} 
                        />
                    </div>
                    <button 
                        onClick={handleEvaluate}
                        disabled={evaluatorLoading}
                        style={{ width: '100%', padding: '14px', backgroundColor: evaluatorLoading ? '#cccccc' : '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: evaluatorLoading ? 'not-allowed' : 'pointer', marginTop: 'auto' }}
                    >
                        {evaluatorLoading ? 'Evaluating...' : 'Evaluate'}
                    </button>
                </div>
            </div>

            {scoreData && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px', boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '1150px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh', animation: 'scaleUp 0.3s ease-out' }}>
                  
                  <style>{`
                    @keyframes scaleUp { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
                    .result-table th { background-color: #0c3d7c !important; color: #ffffff !important; font-weight: 700 !important; text-transform: uppercase; letter-spacing: 0.5px; font-size: 12px; padding: 12px 10px !important; border: 1px solid #334155 !important; }
                    .result-table td { padding: 12px 10px !important; border: 1px solid #e2e8f0 !important; font-size: 14px; font-weight: 600; color: #334155; text-align: center; }
                    .sub-header-row { background-color: #1e293b !important; color: #ffffff !important; font-size: 14px !important; font-weight: bold !important; letter-spacing: 1px; }
                  `}</style>

                  {/* 1. హెడర్ సెక్షన్ */}
                  <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: '#ffffff', padding: '20px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #3b82f6' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '0.5px' }}>🎯 JEE-MAIN Response Report</h2>
                      <small style={{ color: '#93c5fd', fontWeight: '600' }}>Subject Wise Evaluation</small>
                    </div>
                    <button onClick={() => setScoreData(null)} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(220,38,38,0.3)' }}>
                      Close Report ✕
                    </button>
                  </div>

                  {/* 2. మెయిన్ టేబుల్ కంటెంట్ ఏరియా */}
                  <div style={{ padding: '35px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
                    
                    <table className="result-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderRadius: '8px', overflow: 'hidden', marginBottom: '35px' }}>
                      <thead>
                        {/* ROW 1: స్టూడెంట్ వివరాలు */}
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
                        {/* ROW 2: సబ్జెక్ట్ హెడర్స్ */}
                        <tr>
                          <th style={{ background: '#f1f5f9', border: 'none' }}></th>
                          <th colSpan="3" className="sub-header-row" style={{ background: '#2563eb' }}>Mathematics</th>
                          <th colSpan="3" className="sub-header-row" style={{ background: '#059669' }}>Physics</th>
                          <th colSpan="3" className="sub-header-row" style={{ background: '#d97706' }}>Chemistry</th>
                        </tr>

                        {/* ROW 3: సబ్-కాలమ్స్ */}
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
                        {/* ROW 4: Section A మార్కులు */}
                        <tr>
                          <td style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>A</td>
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

                        {/* ROW 5: Section B మార్కులు */}
                        <tr>
                          <td style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>B</td>
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

                    {/* కింద వచ్చే రెండు సమ్మరీ టేబుల్స్ (Subject Wise & Total Marks) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px' }}>
                      
                      {/* ఎడమ వైపు: Subject Wise Table */}
                      <div>
                        <table className="result-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th colSpan="4" style={{ background: '#1e293b', fontSize: '13px' }}>Subject Wise</th>
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

                      {/* కుడి వైపు: Total Marks Table */}
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

            {/* కుడి వైపు లాగిన్ ఫారమ్ బాక్స్ */}
            <div style={{ background: '#ffffff', width: '420px', flexShrink: 0, borderRadius: '4px', border: '1px solid #ced4da', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ backgroundColor: '#0043a4', color: 'white', fontSize: '18px', fontWeight: 'bold', padding: '16px 20px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }}>
                Only Registered Candidates Sign-In
              </div>

              <form onSubmit={handleLogin} style={{ padding: '30px 25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333333', textAlign: 'left', fontSize: '14px' }}>Admission Number:</label>
                  <input type="text" value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333333', textAlign: 'left', fontSize: '14px' }}>Mobile Number:</label>
                  <input type="password" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                {/* 🔒 సెక్యూరిటీ క్యాప్చా బాక్స్ */}
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333333', textAlign: 'left', fontSize: '14px' }}>Enter Security Pin:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ backgroundColor: '#eaeff5', letterSpacing: '5px', color: '#000000', fontWeight: 'bold', fontSize: '20px', padding: '8px 15px', borderRadius: '4px', border: '1px solid #a6b9d0', userSelect: 'none', fontFamily: 'monospace', fontStyle: 'italic', backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05) 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}>
                      {captchaText}
                    </div>
                    <button type="button" onClick={generateCaptcha} title="Refresh Captcha" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#0043a4' }}>
                      🔄
                    </button>
                  </div>
                  <input type="text" value={userCaptchaInput} onChange={(e) => setUserCaptchaInput(e.target.value)} required placeholder="Enter the code shown above" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#0043a4', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            </div>

          </div>
        ) : (
          <ExamConsole 
            user={user} 
            activeExam={activeExam} 
            setActiveExam={setActiveExam} 
            handleLogout={handleLogout} 
            handleDocClick={handleDocClick}
            examThemes={examThemes}
          />
        )}
      </div>

      {/* మోడల్ కాంపోనెంట్ */}
      <Modals 
        showSessionModal={showSessionModal}
        setShowSessionModal={setShowSessionModal}
        showYearModal={showYearModal}
        setShowYearModal={setShowYearModal}
        showTimeoutModal={showTimeoutModal}
        setShowTimeoutModal={setShowTimeoutModal}
        selectedDocLabel={selectedDocLabel}
        selectedDocType={selectedDocType}
        downloadDocument={downloadDocument}
      />

      {/* 🔻 ఫుటర్ సెక్షన్ */}
      <footer style={{ backgroundColor: '#ffffff', width: '100%', borderTop: '1px solid #dcdcdc', padding: '10px 0 25px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', boxSizing: 'border-box' }}>
        
        {/* వెబ్‌సైట్ విజిటర్స్ మరియు డిజైనింగ్ టీమ్ వివరాలు */}
        <div style={{ width: '100%', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 0', marginBottom: '15px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'center', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
            <div>
              <span style={{ color: '#0043a4', fontWeight: 'bold' }}>Website Last Updated:</span> {footerUpdatedDate}
            </div>
            <div>
              <span style={{ color: '#0043a4', fontWeight: 'bold' }}>Visitors Count:</span> <span style={{ backgroundColor: '#0043a4', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>1,248,930</span>
            </div>
            <div>
              <span style={{ color: '#0043a4', fontWeight: 'bold' }}>Designed & Developed By:</span> <span style={{ color: '#000000', fontWeight: 'bold' }}>NTA IT Cell</span>
            </div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '12px', color: '#666666' }}>Copyright © 2027 National Entrance Exams. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default App;
