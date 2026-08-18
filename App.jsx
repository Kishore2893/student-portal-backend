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

  // 📆 🌟 వెబ్‌సైట్ మోడిఫికేషన్ లేదా బ్యాకెండ్ డేటా అప్‌డేట్ చేసినప్పుడు ఆటోమేటిక్‌గా ఆ రోజు కరెంట్ డేట్ కింద మారేలా:
  const [footerUpdatedDate, setFooterUpdatedDate] = useState(() => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options); // ఇది ఎప్పుడూ ఆ రోజు కరెంట్ డేట్ (Live Date) నే చూపిస్తుంది
  });
    // 🟡 1 నిమిషం ఆటో-లాగౌట్ టైమర్ లాజిక్
    // ⏳ 1 నిమిషం ఆటో-లాగౌట్ టైమర్ మరియు 🛡️ వెబ్‌సైట్ సెక్యూరిటీ లాజిక్
    // 🛡️ 1 నిమిషం ఇన్‌యాక్టివిటీ ఆటో-లాగౌట్ మరియు వెబ్‌సైట్ సెక్యూరిటీ లాజిక్
  useEffect(() => {
    let timeoutId;

    // ఆటోమేటిక్ సైలెంట్ లాగౌట్ ఫంక్షన్
    const logoutUser = () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace(window.location.origin);
    };

    // యూజర్ యాక్టివిటీని బట్టి టైమర్ రీసెట్ చేసే ఫంక్షన్
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutUser, 60000); // 1 నిమిషం
    };

    const savedUser = localStorage.getItem('examUser');
    if (savedUser) {
      // యూజర్ కదలికలను ట్రాక్ చేయడానికి ఈవెంట్స్
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('touchstart', resetTimer);
      resetTimer(); // మొదటిసారి టైమర్ స్టార్ట్ అవ్వడానికి
    }

    // 1. రైట్ క్లిక్ (Right Click) పూర్తిగా బ్లాక్ చేయడం
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    // 2. F12, Ctrl+Shift+I, Ctrl+U వంటి షార్ట్‌కట్స్ బ్లాక్ చేయడం
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'i' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 3. కన్సోల్ నిరంతరం క్లియర్ చేయడం
    const clearConsoleInterval = setInterval(() => {
      console.clear();
    }, 1000);

    // క్లీనప్ ఫంక్షన్ (Memory Leaks రాకుండా ఉండటానికి)
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(clearConsoleInterval);
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

  // 🌟 మీ పాత ఆటో-లాగిన్ కోడ్‌ను ఇక్కడ అలాగే ఉంచేశాను!
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('examUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [activeExam, setActiveExam] = useState('JEE Main');

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedDocLabel, setSelectedDocLabel] = useState('');

  const publicNoticesList = [
    { id: 1, text: "• Declaration of Final NTA Scores for Joint Entrance Examination (Main) - 2026 for Paper 2A (B. Arch) and Paper 2B (B. Planning) - Reg.", pdfUrl: "https://student-portal-backend-vo2b.onrender.com/public-docs/notice1.pdf" },
    { id: 2, text: "• Final Answer Keys for JEE(Main) - 2026 Paper-II [B.Arch / B.Planning]", pdfUrl: "https://student-portal-backend-vo2b.onrender.com/public-docs/notice2.pdf" },
    { id: 3, text: "• Display of Provisional Answer Keys and Recorded Response Sheet for Answer Key Challenge of Joint Entrance Examination (Main) - 2026 Session 2, Paper 2A (B. Arch) & 2B (B. Planning) (April 2026) -", pdfUrl: "https://student-portal-backend-vo2b.onrender.com/public-docs/notice3.pdf" }
  ];

  // స్క్రోలింగ్ బార్ లో కేవలం టెక్స్ట్ మాత్రమే చూపించడానికి
    const tickerTextList = [
    "Application form for JEE(Main)-2027 [Session-I] (B.E. / B.Tech)",
    "City Intimation Slip is now on live [Session-I] (B.E. / B.Tech)",
    "Admit Card for JEE(Main)-2027 [Session-I] (B.E. / B.Tech)",
    "Score Card for JEE(Main)-2027 [Session-I] (B.E. / B.Tech)"
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
    e.preventDefault(); setError(''); 

    // 🔒 క్యాప్చా వెరిఫికేషన్ లాజిక్
    if (userCaptchaInput !== captchaText) {
      setError("Invalid Captcha! Please try again.");
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://student-portal-backend-vo2b.onrender.com/api/student-login', {
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
      setError("Unable to connect to the backend server!"); 
      generateCaptcha();
    }
    finally { setLoading(false); }
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
        window.location.href = fileUrl;
    } catch (err) {
        console.error("డౌన్‌లోడ్ లోపం వచ్చింది:", err);
    }
};
  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', width: '100%', fontFamily: '"Segoe UI", sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* 🟦 ஹெட்டர் பேனர் */}
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 4% 60px 4%', width: '100%', maxWidth: '1350px', boxSizing: 'border-box', flexWrap: 'wrap', gap: '50px' }}>
            
            {/* 👈 పబ్లిక్ నోటీసుల బోర్డు */}
            <div style={{ flex: '1', minWidth: '450px', background: '#ffffff', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', boxSizing: 'border-box', position: 'relative' }}>
              <div style={{ display: 'flex', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ padding: '12px 25px', backgroundColor: '#0043a4', color: '#ffffff', fontWeight: '700', fontSize: '14px', borderTop: '3px solid #0043a4', letterSpacing: '0.3px' }}>
                  Public Notices
                </div>
              </div>
              <ul style={{ listStyleType: 'disc', padding: '25px 25px 25px 40px', margin: 0, display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left', color: '#1e293b' }}>
                {publicNoticesList.map((notice) => (
                  <li key={notice.id} style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6' }}>
                    <a href={notice.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#334155', fontWeight: '500', cursor: 'pointer', display: 'inline', transition: 'color 0.2s' }} onMouseOver={(e) => { e.target.style.color = '#0043a4'; e.target.style.textDecoration = 'underline'; }} onMouseOut={(e) => { e.target.style.color = '#334155'; e.target.style.textDecoration = 'none'; }}>
                      {notice.text.replace('• ', '')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* 👉 1st Image డిజైన్ లాంటి సరికొత్త లాగిన్ బాక్స్ స్ట్రక్చర్ */}
            <div style={{ background: '#ffffff', maxWidth: '450px', width: '100%', borderRadius: '4px', border: '1px solid #dcdcdc', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', boxSizing: 'border-box', overflow: 'hidden' }}>
              
              {/* 🟦 మొదటి ఇమేజ్ లోని డార్క్ బ్లూ ஹெడర్ */}
              <div style={{ backgroundColor: '#0c3d7c', color: 'white', fontSize: '24px', fontWeight: 'bold', padding: '16px 24px', textAlign: 'left', fontFamily: 'sans-serif' }}>
                Candidate Login
              </div>

              {/* 📝 ఫామ్ ఏరియా ప్రారంభం */}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '30px 40px 35px 40px', boxSizing: 'border-box' }}>
                
                {/* 1. Admission Number: ఫీల్డ్ */}
                <div style={{ marginBottom: '24px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#000000', fontSize: '15px', textAlign: 'left', fontFamily: 'sans-serif' }}>
                    Admission Number:
                  </label>
                  <input 
                    type="text" 
                    value={admissionNumber} 
                    onChange={(e) => setAdmissionNumber(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #b0b0b0', boxSizing: 'border-box', fontSize: '16px', color: '#333333', backgroundColor: '#ffffff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }} 
                    onFocus={(e) => { e.target.style.border = '1px solid #a3c7ff'; e.target.style.boxShadow = '0 0 0 4px #d6e6ff'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid #b0b0b0'; e.target.style.boxShadow = 'none'; }}
                    placeholder="Enter 9-Digit ID"
                    maxLength={9} 
                  />
                </div>

                {/* 2. Registered Mobile Number ఫీల్డ్ */}
                <div style={{ marginBottom: '24px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#000000', fontSize: '15px', textAlign: 'left', fontFamily: 'sans-serif' }}>
                    Registered Mobile Number:
                  </label>
                  <input 
                    type="password" 
                    value={mobileNumber} 
                    onChange={(e) => setMobileNumber(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #b0b0b0', boxSizing: 'border-box', fontSize: '16px', color: '#333333', backgroundColor: '#ffffff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }} 
                    onFocus={(e) => { e.target.style.border = '1px solid #a3c7ff'; e.target.style.boxShadow = '0 0 0 4px #d6e6ff'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid #b0b0b0'; e.target.style.boxShadow = 'none'; }}
                    placeholder="Enter Mobile Number" 
                  />
                </div>

                {/* 3. Enter Security Pin ఫీల్డ్ */}
                <div style={{ marginBottom: '24px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#000000', fontSize: '15px', textAlign: 'left', fontFamily: 'sans-serif' }}>
                    Enter Security Pin
                  </label>
                  <input 
                    type="text" 
                    value={userCaptchaInput} 
                    onChange={(e) => setUserCaptchaInput(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #b0b0b0', boxSizing: 'border-box', fontSize: '16px', color: '#333333', backgroundColor: '#ffffff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }} 
                    onFocus={(e) => { e.target.style.border = '1px solid #a3c7ff'; e.target.style.boxShadow = '0 0 0 4px #d6e6ff'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid #b0b0b0'; e.target.style.boxShadow = 'none'; }}
                    placeholder="Type Security Pin" 
                    maxLength={6} 
                  />
                </div>

                {/* 🔒 క్యాప్చా విభాగం - అడ్డంగా లైన్ మరియు పక్కపక్కనే వచ్చేలా */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px', width: '100%', justifyContent: 'flex-start', paddingLeft: '2px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '15px', color: '#000000', fontFamily: 'sans-serif', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Security Pin
                  </span>
                  
                  <div style={{ background: 'linear-gradient(45deg, #e2e8f0, #cbd5e1)', color: '#0001bc', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '20px', letterSpacing: '4px', textDecoration: 'line-through', userSelect: 'none', border: '1px dashed #94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '38px', boxSizing: 'border-box', flexShrink: 0 }}>
                    {captchaText}
                  </div>
                  
                  <button type="button" onClick={generateCaptcha} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0', outline: 'none', flexShrink: 0 }} title="Refresh Captcha">
                    <svg viewBox="0 0 24 24" width="28" height="28">
                      <path fill="#39cb1b" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                  </button>
                </div>

                {/* 🔵 బ్లూ కలర్ లాగిన్ బటన్ */}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#1b74ff', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Verifying...' : 'Login'}
                </button>
              </form>
              {error && <p style={{ color: '#d32f2f', marginTop: '15px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>❌ {error}</p>}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '950px', width: '100%', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box' }}>
            
            {/* వెల్కమ్ ప్రొఫైల్ బ్యానర్ */}
            <div style={{ background: `linear-gradient(135deg, #1e88e5, ${currentThemeColor})`, color: 'white', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', transition: 'all 0.3s ease' }}>
              <div>
                <h2 style={{ margin: 0 }}>Welcome, {user.studentName}! 👋</h2>
                <p style={{ margin: '5px 0 0 0' }}>Admission ID: <strong>{user.admissionNumber}</strong></p>
              </div>
              <button onClick={handleLogout} style={{ padding: '10px 18px', backgroundColor: '#c73131', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</button>
            </div>

            {/* Main Tabs Container */}
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
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      letterSpacing: '0.3px'
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

      {/* ----------------- 🌟 మీ అఫీషియల్ టూ-టోన్ ఫుటర్ డిజైన్ (లైవ్ ఆటోమేటిక్ డేట్ తో) ----------------- */}
      <footer style={{ width: '100%', marginTop: '50px', borderTop: '4px solid #0043a4', fontFamily: 'sans-serif' }}>
        
        {/* 1. Upper Light Grey Section */}
        <div style={{ backgroundColor: '#222222', padding: '16px 20px', borderBottom: '1px solid #333333', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'center', gap: '15px', color: '#cbd5e1', fontSize: '13px', fontWeight: '500', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer' }}>Copyright Policy</span> | 
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span> | 
          <span style={{ cursor: 'pointer' }}>Hyperlink Policy</span> | 
          <span style={{ cursor: 'pointer' }}>Terms and Conditions</span> | 
          <span style={{ cursor: 'pointer' }}>Help</span>
        </div>
        
        {/* 2. Down Pure Black Section */}
        <div style={{ backgroundColor: '#111111', padding: '25px 20px', color: '#ffffff' }}>
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.9', maxWidth: '800px', margin: '0 auto' }}>
            Content Owned and Maintained by <span style={{ fontWeight: '600', color: '#7ba8e0' }}>Kk Information Technology</span><br />
            Designed, Developed and hosted by <span style={{ fontWeight: '600', color: '#7ba8e0' }}>IT Sector</span>
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px', borderTop: '1px solid #222222', paddingTop: '12px' }}>
            Last Updated: <span style={{ fontWeight: '600', color: '#ffffff' }}>{footerUpdatedDate}</span>
          </div>
        </div>

      </footer>

    </div>
  );
}

export default App;
