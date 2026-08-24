import React, { useState } from 'react';

export default function ExamConsole({ activeExam, currentThemeColor, handleDocClick }) {
  // 🌟 పాపప్ ఓపెన్/క్లోజ్ కంట్రోల్ చేయడం కోసం స్టేట్
  const [showJeePopup, setShowJeePopup] = useState(false);
  
  // 🌟 యూజర్ ఏ కార్డ్ క్లిక్ చేశారో ట్రాక్ చేయడానికి స్టేట్
  const [pendingDocType, setPendingDocType] = useState('');
  const [pendingDocLabel, setPendingDocLabel] = useState('');

  // 🎨 మీ ఒరిజినల్ ప్రీమియం కలర్స్
  const docColors = {
    form: '#0043a4',        
    city: '#00695c',        
    admitStandard: '#1565c0', 
    admitIpe: '#512da8',      
    score: '#512da8',
    cancel: '#c2410c'
  };

  // 🌟 JEE Main కార్డ్స్ క్లిక్ చేసినప్పుడు సెషన్ పాపప్ ఓపెన్ చేసే ఫంక్షన్
  const handleJeeCardClick = (docType, docLabel) => {
    setPendingDocType(docType);
    setPendingDocLabel(docLabel);
    setShowJeePopup(true);
  };

  return (
    <div style={{ background: '#ffffff', padding: '35px 25px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box' }}>
      
      <style>{`
        .modern-doc-card {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px 20px;
          width: 220px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }
        .modern-doc-card:hover {
          transform: translateY(-5px);
          background: #ffffff;
          border-color: #cbd5e1;
          box-shadow: 0 14px 28px -6px rgba(0, 0, 0, 0.09);
        }
        .modern-action-btn {
          width: 100%;
          padding: 11px 20px;
          color: #ffffff;
          border: none;
          border-radius: 25px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.3px;
        }
        .modern-action-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
        .session-btn {
          width: 100%;
          padding: 14px;
          background-color: #0043a4;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-left: 20px;
          padding-right: 20px;
          box-sizing: border-box;
        }
        .session-btn:hover {
          background-color: #0b3780;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 67, 164, 0.3);
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
        
        {/* ----------------- మోడ్రన్ కార్డ్స్ లేఅవుట్ ----------------- */}
        <div style={{ display: 'flex', gap: '22px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          
          {/* 1. First Card (Application Form / 1st Year) */}
          <div className="modern-doc-card">
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
              📄
            </div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
              {activeExam === 'IPE-2027' ? '1st Year' : 'Application Form'}
            </h4>
            <button 
              onClick={() => {
                if (activeExam === 'JEE Main') {
                  handleJeeCardClick('form', 'Application Form');
                } else {
                  handleDocClick('form', 'Application Form');
                }
              }} 
              className="modern-action-btn"
              style={{ 
                backgroundColor: activeExam === 'IPE-2027' ? docColors.admitIpe : docColors.form,
                boxShadow: `0 4px 12px ${activeExam === 'IPE-2027' ? 'rgba(81, 45, 168, 0.25)' : 'rgba(0, 67, 164, 0.25)'}`
              }}
            >
              View & Print
            </button>
          </div>

          {/* 2. City Intimation Slip (JEE Main Only) */}
          {activeExam === 'JEE Main' && (
            <div className="modern-doc-card">
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
                🗺️
              </div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                City Intimation Slip
              </h4>
              <button 
                onClick={() => handleJeeCardClick('city', 'City Intimation Slip')}
                className="modern-action-btn"
                style={{ 
                  backgroundColor: docColors.city,
                  boxShadow: '0 4px 12px rgba(0, 105, 92, 0.25)'
                }}
              >
                View & Print
              </button>
            </div>
          )}

          {/* 3. Second Card (Admit Card / 2nd Year) */}
          <div className="modern-doc-card">
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
              🪪
            </div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
              {activeExam === 'IPE-2027' ? '2nd Year' : 'Admit Card / Hall Ticket'}
            </h4>
            <button 
              onClick={() => {
                if (activeExam === 'JEE Main') {
                  handleJeeCardClick('admit', 'Admit Card');
                } else {
                  handleDocClick('admit', 'Admit Card');
                }
              }} 
              className="modern-action-btn"
              style={{ 
                backgroundColor: activeExam === 'IPE-2027' ? docColors.admitIpe : docColors.admitStandard,
                boxShadow: `0 4px 12px ${activeExam === 'IPE-2027' ? 'rgba(81, 45, 168, 0.25)' : 'rgba(21, 101, 192, 0.25)'}`
              }}
            >
              View & Print
            </button>
          </div>

          {/* 4. Score Card / Rank Card (JEE Main Only) */}
          {activeExam === 'JEE Main' && (
            <div className="modern-doc-card">
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
                🏆
              </div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                Score Card / Rank Card
              </h4>
              <button 
                onClick={() => handleJeeCardClick('score', 'Score Card')}
                className="modern-action-btn"
                style={{ 
                  backgroundColor: docColors.score,
                  boxShadow: '0 4px 12px rgba(81, 45, 168, 0.25)'
                }}
              >
                View & Print
              </button>
            </div>
          )}

        </div>

      </div>

      {/* ----------------- 🌟 మీ ఒరిజినల్ బిగ్ సైజ్ సెలెక్ట్ సెషన్ పాపప్ విండో (Modern Upgraded) ----------------- */}
      {showJeePopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999,
          padding: '20px', boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '460px', maxWidth: '100%',
            border: '1px solid #e2e8f0', overflow: 'hidden', boxSizing: 'border-box',
            animation: 'modalSlideUp 0.25s ease-out'
          }}>
            
            {/* మోడల్ హెడర్ */}
            <div style={{ background: 'linear-gradient(135deg, #0b1d3a, #1e3a8a)', padding: '24px 28px', color: '#ffffff', textAlign: 'left', borderBottom: '3px solid #3b82f6' }}>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                🗓️ JEE Main Selection
              </div>
              <h3 style={{ margin: 0, fontSize: '21px', fontWeight: '800', color: '#ffffff' }}>
                Select JEE Main Session
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>
                Please choose a session to view your <strong style={{ color: '#ffffff' }}>{pendingDocLabel}</strong>
              </p>
            </div>
            
            {/* మోడల్ బాడీ బటన్స్ */}
            <div style={{ padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f8fafc' }}>
              
              {/* Session - 1 బటన్ */}
              <button 
                onClick={() => {
                  handleDocClick(pendingDocType, pendingDocLabel, 'session-1');
                  setShowJeePopup(false);
                }}
                className="session-btn"
              >
                <span>📘 Session - 1 (January)</span>
                <span style={{ fontSize: '16px' }}>➔</span>
              </button>

              {/* Session - 2 బటన్ */}
              <button 
                onClick={() => {
                  handleDocClick(pendingDocType, pendingDocLabel, 'session-2');
                  setShowJeePopup(false);
                }}
                className="session-btn"
              >
                <span>📙 Session - 2 (April)</span>
                <span style={{ fontSize: '16px' }}>➔</span>
              </button>

              {/* Cancel బటన్ */}
              <button 
                onClick={() => setShowJeePopup(false)}
                style={{
                  width: '100%',
                  padding: '13px', backgroundColor: docColors.cancel, color: 'white',
                  border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px',
                  cursor: 'pointer', transition: 'all 0.2s ease', marginTop: '6px',
                  boxShadow: '0 4px 12px rgba(194, 65, 12, 0.3)'
                }}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
