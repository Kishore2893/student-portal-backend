import React, { useState, useEffect } from 'react';

export default function ExamConsole({ activeExam, currentThemeColor, handleDocClick }) {
  
  // 🌟 పాపప్ ఓపెన్/క్లోజ్ కంట్రోల్ చేయడం కోసం స్టేట్
  const [showJeePopup, setShowJeePopup] = useState(false);
  
  // 🌟 యూజర్ ఏ కార్డ్ క్లిక్ చేశారో ట్రాక్ చేయడానికి స్టేట్
  const [pendingDocType, setPendingDocType] = useState('');
  const [pendingDocLabel, setPendingDocLabel] = useState('');

  // 🎨 ప్రీమియం పర్మనెంట్ కలర్స్
  const docColors = {
    form: '#0043a4',        
    city: '#00695c',        
    admitStandard: '#1565c0', 
    admitIpe: '#512da8',      
    score: '#512da8'        
  };

  // 🌟 JEE Main కార్డ్స్ క్లిక్ చేసినప్పుడు సెషన్ పాపప్ ఓపెన్ చేసే ఫంక్షన్
  const handleJeeCardClick = (docType, docLabel) => {
    setPendingDocType(docType);
    setPendingDocLabel(docLabel);
    setShowJeePopup(true);
  };

  return (
    <div style={{ background: '#ffffff', padding: '35px 25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', width: '100%', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
        
        {/* ----------------- మోడరన్ గ్రిడ్ లేఅవుట్ ----------------- */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          
          {/* 1. First Card (Application Form / 1st Year) */}
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', width: '220px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01)', transition: 'transform 0.2s' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#334155' }}>
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
              style={{ padding: '10px 22px', backgroundColor: activeExam === 'IPE-2027' ? docColors.admitIpe : docColors.form, color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 10px rgba(0, 67, 164, 0.2)', transition: 'all 0.2s' }}
            >
              View & Print
            </button>
          </div>

          {/* 2. City Intimation Slip */}
          {activeExam === 'JEE Main' && (
            <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', width: '220px', textAlign: 'center', transition: 'transform 0.2s' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#334155' }}>City Intimation Slip</h4>
              <button 
                onClick={() => handleJeeCardClick('city', 'City Intimation Slip')}
                style={{ padding: '10px 22px', backgroundColor: docColors.city, color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 10px rgba(0, 105, 92, 0.2)', transition: 'all 0.2s' }}
              >
                View & Print
              </button>
            </div>
          )}

          {/* 3. Second Card (Admit Card / 2nd Year) */}
          <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #f1f5f9', 
            borderRadius: '16px', 
            padding: '24px', 
            width: '220px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#334155' }}>
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
              style={{ 
                padding: '11px 26px', 
                backgroundColor: activeExam === 'IPE-2027' ? docColors.admitIpe : docColors.admitStandard, 
                color: 'white', 
                border: 'none', 
                borderRadius: '25px', 
                cursor: 'pointer', 
                fontWeight: '700', 
                fontSize: '13px', 
                boxShadow: activeExam === 'IPE-2027' ? '0 5px 12px rgba(81, 45, 168, 0.25)' : '0 5px 12px rgba(21, 101, 192, 0.25)', 
                transition: 'all 0.2s',
                letterSpacing: '0.3px'
              }}
            >
              View & Print
            </button>
          </div>

          {/* 4. Score Card / Rank Card */}
          {activeExam === 'JEE Main' && (
            <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', width: '220px', textAlign: 'center', transition: 'transform 0.2s' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#334155' }}>Score Card / Rank Card</h4>
              <button 
                onClick={() => handleJeeCardClick('score', 'Score Card')}
                style={{ padding: '10px 22px', backgroundColor: docColors.score, color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 10px rgba(81, 45, 168, 0.2)', transition: 'all 0.2s' }}
              >
                View & Print
              </button>
            </div>
          )}

        </div>

      </div>

      {/* ----------------- 🌟 మీ ఒరిజినల్ బిగ్ సైజ్ సెలెక్ట్ సెషన్ పాపప్ విండో ----------------- */}
      {showJeePopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff', padding: '40px 35px', borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '460px', textAlign: 'center',
            border: '1px solid #e2e8f0', boxSizing: 'border-box'
          }}>
            
            <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '700', color: '#000000', fontFamily: 'sans-serif' }}>
              Select JEE Main Session
            </h3>
            
            <p style={{ margin: '0 0 30px 0', fontSize: '14px', color: '#64748b', fontFamily: 'sans-serif' }}>
              Please choose a session to view your <span style={{ fontWeight: '600' }}>{pendingDocLabel}</span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Session - 1 బటన్ */}
              <button 
                onClick={() => {
                  handleDocClick(pendingDocType, pendingDocLabel, 'session-1');
                  setShowJeePopup(false);
                }}
                style={{
                  padding: '14px', backgroundColor: '#0043a4', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '15px',
                  cursor: 'pointer', transition: 'background-color 0.2s'
                }}
              >
                Session - 1
              </button>

              {/* Session - 2 బటన్ */}
              <button 
                onClick={() => {
                  handleDocClick(pendingDocType, pendingDocLabel, 'session-2');
                  setShowJeePopup(false);
                }}
                style={{
                  padding: '14px', backgroundColor: '#0043a4', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '15px',
                  cursor: 'pointer', transition: 'background-color 0.2s'
                }}
              >
                Session - 2
              </button>

              {/* Cancel బటన్ */}
              <button 
                onClick={() => setShowJeePopup(false)}
                style={{
                  padding: '14px', backgroundColor: '#c2410c', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '15px',
                  cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '6px'
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
