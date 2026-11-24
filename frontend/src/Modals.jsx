import React from 'react';

export default function Modals({ 
  showSessionModal, 
  showYearModal, 
  currentThemeColor, 
  selectedDocLabel, 
  selectedDocType, 
  downloadDocument, 
  setShowSessionModal, 
  setShowYearModal 
}) {
  return (
    <>
      <style>{`
        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
          padding: 20px;
          box-sizing: border-box;
        }
        .modal-card-custom {
          background: #ffffff;
          border-radius: 18px;
          max-width: 440px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalSlideUp {
          0% { transform: translateY(15px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .modal-action-btn {
          width: 100%;
          padding: 14px 20px;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
        }
        .modal-action-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        .modal-cancel-btn {
          width: 100%;
          padding: 13px;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 4px;
          box-sizing: border-box;
        }
        .modal-cancel-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }
      `}</style>

      {/* 🗓️ 1. JEE Main Session Selection Modal */}
      {showSessionModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-card-custom">
            
            {/* టాప్ హెడర్ */}
            <div style={{ background: 'linear-gradient(135deg, #0b1d3a, #1e3a8a)', padding: '24px 28px', color: '#ffffff', textAlign: 'left', borderBottom: '3px solid #3b82f6' }}>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                🗓️ Session Selector
              </div>
              <h3 style={{ margin: 0, fontSize: '21px', fontWeight: '800', color: '#ffffff' }}>
                Select JEE Main Session
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>
                Please choose a session to view your <strong style={{ color: '#ffffff' }}>{selectedDocLabel}</strong>
              </p>
            </div>

            {/* బటన్స్ ఏరియా */}
            <div style={{ padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f8fafc' }}>
              
              <button 
                onClick={() => downloadDocument(selectedDocType, 'Session-1')} 
                className="modal-action-btn"
                style={{ backgroundColor: '#0043a4', boxShadow: '0 4px 14px rgba(0, 67, 164, 0.3)' }}
              >
                <span>📘 Session - 1 (January)</span>
                <span style={{ fontSize: '16px' }}>➔</span>
              </button>

              <button 
                onClick={() => downloadDocument(selectedDocType, 'Session-2')} 
                className="modal-action-btn"
                style={{ backgroundColor: '#0043a4', boxShadow: '0 4px 14px rgba(0, 67, 164, 0.3)' }}
              >
                <span>📙 Session - 2 (April)</span>
                <span style={{ fontSize: '16px' }}>➔</span>
              </button>

              <button 
                onClick={() => setShowSessionModal(false)} 
                className="modal-cancel-btn"
                style={{ backgroundColor: '#c4402f', boxShadow: '0 4px 12px rgba(196, 64, 47, 0.3)' }}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* 📅 2. IPE Academic Year Selection Modal */}
      {showYearModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-card-custom">
            
            {/* టాప్ హెడర్ */}
            <div style={{ background: 'linear-gradient(135deg, #2e1065, #512da8)', padding: '24px 28px', color: '#ffffff', textAlign: 'left', borderBottom: '3px solid #a855f7' }}>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(168, 85, 247, 0.25)', color: '#e9d5ff', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                📅 Year Selector
              </div>
              <h3 style={{ margin: 0, fontSize: '21px', fontWeight: '800', color: '#ffffff' }}>
                Select IPE Academic Year
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#e9d5ff' }}>
                Please select your Intermediate year for <strong style={{ color: '#ffffff' }}>Hall Ticket</strong>
              </p>
            </div>

            {/* బటన్స్ ఏరియా */}
            <div style={{ padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f8fafc' }}>
              
              <button 
                onClick={() => downloadDocument('admit', '1st-Year')} 
                className="modal-action-btn"
                style={{ backgroundColor: currentThemeColor || '#512da8', boxShadow: '0 4px 14px rgba(81, 45, 168, 0.3)' }}
              >
                <span>🎓 1st Year (Junior Inter)</span>
                <span style={{ fontSize: '16px' }}>➔</span>
              </button>

              <button 
                onClick={() => downloadDocument('admit', '2nd-Year')} 
                className="modal-action-btn"
                style={{ backgroundColor: currentThemeColor || '#512da8', boxShadow: '0 4px 14px rgba(81, 45, 168, 0.3)' }}
              >
                <span>🎓 2nd Year (Senior Inter)</span>
                <span style={{ fontSize: '16px' }}>➔</span>
              </button>

              <button 
                onClick={() => setShowYearModal(false)} 
                className="modal-cancel-btn"
                style={{ backgroundColor: '#c4402f', boxShadow: '0 4px 12px rgba(196, 64, 47, 0.3)' }}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}