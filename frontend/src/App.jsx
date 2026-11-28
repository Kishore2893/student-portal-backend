import React, { useState, useEffect, useRef } from 'react';
import ExamConsole from './ExamConsole.jsx';
import Modals from './Modals';
import AnalysisDashboard from './AnalysisDashboard'; 
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
        .popup-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); z-index: 999999; justify-content: center; align-items: flex-start; overflow-y: auto; -webkit-overflow-scrolling: touch; font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px 15px; box-sizing: border-box; backdrop-filter: blur(5px); }
        .popup-overlay.active { display: flex; }
        .popup-container-box { margin: auto; background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%); padding: 20px; border-radius: 12px; width: 100%; max-width: 950px; position: relative; box-sizing: border-box; }
        .popup-content-box { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); }
        .popup-header-box { position: relative; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px 30px; text-align: center; }
        .popup-close-btn { position: absolute; top: 14px; right: 16px; width: 34px; height: 34px; border-radius: 50%; background-color: #ffffff; color: #1e293b; border: none; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); transition: all 0.2s ease; z-index: 20; }
        .popup-close-btn:hover { transform: scale(1.08); background-color: #f8fafc; color: #0f172a; }
        .popup-badges { display: flex; justify-content: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        .popup-badge { background: rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .popup-header-box h2 { color: #ffffff; font-size: 22px; margin: 0; line-height: 1.3; }
        .popup-grid-body { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 25px 30px 15px 30px; }
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

        @media (max-width: 768px) {
          .popup-overlay { padding: 12px 8px; }
          .popup-container-box { padding: 10px; border-radius: 14px; }
          .popup-content-box { border-radius: 14px; }
          .popup-header-box { padding: 16px 14px; }
          .popup-header-box h2 { font-size: 17px; }
          .popup-close-btn { top: 10px; right: 10px; width: 30px; height: 30px; font-size: 14px; }
          .popup-badges { gap: 6px; margin-bottom: 8px; }
          .popup-badge { font-size: 11px; padding: 4px 8px; }
          .popup-grid-body { grid-template-columns: 1fr; gap: 12px; padding: 14px 12px 10px 12px; }
          .popup-box-blue, .popup-box-green { padding: 14px 12px; border-radius: 12px; }
          .popup-box-blue h3, .popup-box-green h3 { font-size: 14.5px; margin-bottom: 10px; }
          .popup-item-text { font-size: 13px; }
          .popup-footer-box { padding: 10px 14px 18px 14px; }
          .popup-start-btn { width: 100%; padding: 12px 20px; font-size: 15px; }
        }
      `}</style>
      <div 
        className="popup-overlay active"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsOpen(false);
          }
        }}
      >
        <div className="popup-container-box">
          <div className="popup-content-box">
            <div className="popup-header-box">
              <button 
                className="popup-close-btn" 
                onClick={() => setIsOpen(false)} 
                aria-label="Close"
              >
                ✕
              </button>
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

const QuickGuideSection = () => {
  return (
    <div style={{ width: '100%', maxWidth: '1020px', padding: '0 20px 25px 20px', margin: '0 auto', boxSizing: 'border-box' }}>
      <style>{`
        .guide-divider {
          display: flex;
          align-items: center;
          margin: 10px 0 24px;
        }
        .guide-divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .guide-divider-badge {
          padding: 6px 18px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 11.5px;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          margin: 0 14px;
        }
        .guide-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .guide-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 18px;
          padding: 22px 20px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .guide-card:hover {
          transform: translateY(-6px);
          border-color: #3b82f6;
          box-shadow: 0 14px 28px -4px rgba(59, 130, 246, 0.18);
        }
        .guide-card-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .guide-ico-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .guide-card-title {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
        }
        .guide-card-sub {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }
        .guide-step-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
        }
        .guide-step-badge {
          background: #2563eb;
          color: #ffffff;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .guide-step-text {
          font-size: 12px;
          color: #334155;
          line-height: 1.5;
        }
        .guide-feat-pill {
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          font-size: 12px;
          color: #1e293b;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        @media (max-width: 900px) {
          .guide-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>

      <div className="guide-divider">
        <div className="guide-divider-line"></div>
        <div className="guide-divider-badge">💡 Quick Guide & Exam Pattern</div>
        <div className="guide-divider-line"></div>
      </div>

      <div className="guide-grid">
        {/* Card 1: How to Calculate */}
        <div className="guide-card">
          <div className="guide-card-head">
            <div className="guide-ico-wrap" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>📋</div>
            <div>
              <div className="guide-card-title">How to Calculate?</div>
              <div className="guide-card-sub">Simple 3-step evaluation</div>
            </div>
          </div>
          <div className="guide-step-row">
            <div className="guide-step-badge">1</div>
            <div className="guide-step-text"><b>Copy URL:</b> Copy your official response sheet link.</div>
          </div>
          <div className="guide-step-row">
            <div className="guide-step-badge">2</div>
            <div className="guide-step-text"><b>Paste in Box:</b> Paste link into input field above.</div>
          </div>
          <div className="guide-step-row" style={{ marginBottom: 0 }}>
            <div className="guide-step-badge">3</div>
            <div className="guide-step-text"><b>View Result:</b> Click "View Result" to see & download scorecard.</div>
          </div>
        </div>

        {/* Card 2: Marking & Exam Pattern */}
        <div className="guide-card">
          <div className="guide-card-head">
            <div className="guide-ico-wrap" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>⚖️</div>
            <div>
              <div className="guide-card-title">Marking & Exam Pattern</div>
              <div className="guide-card-sub">Official NTA JEE Pattern</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#166534', fontWeight: 700, fontSize: '11.5px' }}>✓ Correct</span>
              <span style={{ background: '#22c55e', color: 'white', borderRadius: '4px', padding: '1px 6px', fontSize: '11px', fontWeight: 800 }}>+4</span>
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#991b1b', fontWeight: 700, fontSize: '11.5px' }}>✗ Wrong</span>
              <span style={{ background: '#ef4444', color: 'white', borderRadius: '4px', padding: '1px 6px', fontSize: '11px', fontWeight: 800 }}>-1</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📚</div>
              <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.4 }}><b>Subjects:</b> Physics, Chemistry, Mathematics</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📝</div>
              <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.4 }}><b>75 Questions:</b> 20 MCQs + 5 NV per Subject</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#faf5ff', color: '#7c3aed', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>⏱️</div>
              <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.4 }}><b>Exam Specs:</b> 300 Max Marks • 3 Hours Duration</div>
            </div>
          </div>
        </div>

        {/* Card 3: Key Features */}
        <div className="guide-card">
          <div className="guide-card-head">
            <div className="guide-ico-wrap" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>🚀</div>
            <div>
              <div className="guide-card-title">Key Features</div>
              <div className="guide-card-sub">Fast, Safe & Accurate</div>
            </div>
          </div>
          <div className="guide-feat-pill">
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
            <span><b>No Login Required:</b> 100% free instant evaluation.</span>
          </div>
          <div className="guide-feat-pill">
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
            <span><b>Section A & B Matrix:</b> Deep subject-wise analysis.</span>
          </div>
          <div className="guide-feat-pill" style={{ marginBottom: 0 }}>
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
            <span><b>Downloadable Card:</b> High-res JPG export in 1 click.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FaqAccordion = () => {
  const [openIdx, setOpenIdx] = useState(-1);

  const faqs = [
    {
      q: "Is JEE Main score calculator accurate?",
      a: "Yes, it is 100% accurate! The evaluation is calculated strictly based on the official answer keys and marking scheme released by NTA."
    },
    {
      q: "Is there negative marking in JEE Main?",
      a: "Yes. For each correct response, +4 marks are awarded. For each incorrect response in both Section A (MCQs) and Section B (Numerical Value Questions), -1 mark is deducted. Unattempted questions receive 0 marks."
    },
    {
      q: "Do I need login details to calculate score?",
      a: "No login is required! You only need your official candidate response sheet URL (digialm.com) to instantly view your complete score and question breakdown."
    },
    {
      q: "Why You Should Use This Tool?",
      a: "Our tool provides instant, comprehensive subject-wise breakdown, Section A and Section B performance analysis, downloadable high-res scorecards, and live comparison with peer students across all shifts."
    }
  ];

  return (
    <section style={{ width: '100%', padding: '20px 20px 45px 20px', maxWidth: '1020px', margin: '0 auto', boxSizing: 'border-box' }}>
      <style>{`
        .faq-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          margin-bottom: 12px;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .faq-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.08);
          border-color: #93c5fd;
        }
        .faq-item.active {
          border-color: #3b82f6;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
        }
        .faq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          cursor: pointer;
          user-select: none;
        }
        .faq-title {
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .faq-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .faq-answer {
          padding: 0 20px 18px 20px;
          font-size: 13.5px;
          line-height: 1.6;
          color: #475569;
          border-top: 1px solid #f1f5f9;
          padding-top: 14px;
        }
        @media (max-width: 640px) {
          .faq-title { font-size: 13.5px; }
          .faq-answer { font-size: 12.5px; padding: 0 16px 14px 16px; padding-top: 10px; }
          .faq-header { padding: 14px 16px; }
        }
      `}</style>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.4px', margin: 0 }}>
          Frequently Asked Questions (FAQs)
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          const icons = ['🎯', '⚖️', '🔒', '🌟'];
          return (
            <div key={idx} className={`faq-item ${isOpen ? 'active' : ''}`}>
              <div 
                className="faq-header" 
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
              >
                <div className="faq-title" style={{ color: isOpen ? '#1d4ed8' : '#1e293b' }}>
                  <span>{icons[idx]}</span>
                  <span>{faq.q}</span>
                </div>
                <div 
                  className="faq-icon-btn" 
                  style={{ 
                    backgroundColor: isOpen ? '#2563eb' : '#f1f5f9',
                    color: isOpen ? '#ffffff' : '#64748b'
                  }}
                >
                  {isOpen ? '▲' : '▼'}
                </div>
              </div>
              {isOpen && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const renderExamIcon = (exam, isActive) => {
  const iconColor = isActive ? '#ffffff' : '#64748b';
  switch (exam) {
    case 'JEE Main':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1"/>
          <path d="M4.5 12a7.5 7.5 0 0 1 15 0c0-1.5-3.5-3.5-7.5-1.5s-7.5 1.5-7.5 1.5z" fill="#f97316"/>
          <path d="M4.5 12a7.5 7.5 0 0 0 15 0c0 1.5-3.5 3.5-7.5 1.5s-7.5-1.5-7.5-1.5z" fill="#16a34a"/>
          <circle cx="12" cy="12" r="3.2" fill="#ffffff"/>
          <path d="M10.5 12l1.2 1.2 2.3-2.3" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'JEE Advanced':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      );
    case 'BITSAT':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" fill="#6b21a8" stroke="#f59e0b" strokeWidth="1.2"/>
          <circle cx="12" cy="12" r="7" fill="#ffffff"/>
          <path d="M12 7v5m-2-3l2-2 2 2m-2.5 5h3m-1.5 0v2.5" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );
    case 'TG EAPCET':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" fill="#15803d" stroke="#facc15" strokeWidth="1.2"/>
          <circle cx="12" cy="7.5" fill="#ffffff"/>
          <path d="M8 14.5V11a4 4 0 0 1 8 0v3.5M10 14.5v-3a2 2 0 0 1 4 0v3" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="12" cy="9" r="1" fill="#dc2626"/>
        </svg>
      );
    case 'AP EAPCET':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" fill="#047857" stroke="#fbbf24" strokeWidth="1.2"/>
          <circle cx="12" cy="7.5" fill="#f0fdf4"/>
          <circle cx="12" cy="12" r="4.5" fill="#ffffff" stroke="#047857" strokeWidth="1"/>
          <path d="M12 8v2m-2-1h4m-3 3h2v3h-2z" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case 'IPE-2027':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M15 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-5-5z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.4"/>
          <path d="M14 2v4a1 1 0 0 0 1 1h4" stroke="#d97706" strokeWidth="1.4"/>
          <line x1="8" y1="11" x2="16" y2="11" stroke="#92400e" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="8" y1="15" x2="13" y2="15" stroke="#92400e" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="15.5" cy="17.5" r="2.5" fill="#dc2626"/>
        </svg>
      );
    case 'Photo & Sign':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return <span style={{ fontSize: '16px', flexShrink: 0 }}>📄</span>;
  }
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
  const [showServerBusyModal, setShowServerBusyModal] = useState(false);
  const localEvalCache = useRef(new Map());
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [showNotAvailableModal, setShowNotAvailableModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [visitorCount, setVisitorCount] = useState(() => {
    const saved = localStorage.getItem('portal_visitor_count');
    const parsed = saved ? parseInt(saved, 10) : 0;
    return (parsed >= 111 && parsed < 1000000) ? parsed : 111;
  });

  useEffect(() => {
    fetch('https://student-portal-backend-vo2b.onrender.com/api/visitor-count')
      .then(res => res.json())
      .then(data => {
        if (data && data.count) {
          setVisitorCount(data.count);
          localStorage.setItem('portal_visitor_count', data.count.toString());
        }
      })
      .catch(async () => {
        // ☁️ Direct Cloud KV Fallback if backend is asleep or restarting (Zero DB rows!)
        try {
          const kvRes = await fetch('https://keyvalue.immanuel.co/api/KeyVal/GetValue/cehdzg7o/visitor_count');
          const kvText = await kvRes.text();
          const rawVal = kvText ? kvText.replace(/["']/g, '') : '';
          const kvCount = parseInt(rawVal, 10);
          if (!isNaN(kvCount) && kvCount >= 111) {
            setVisitorCount(prev => {
              const next = Math.max(kvCount, prev || 0);
              localStorage.setItem('portal_visitor_count', next.toString());
              return next;
            });
            return;
          }
        } catch (e) {}

        // Local fallback increment
        setVisitorCount(prev => {
          const next = prev + 1;
          localStorage.setItem('portal_visitor_count', next.toString());
          return next;
        });
      });
  }, []);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('examUser');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Photo & Signature State & Availability Check
  const [photoSrc, setPhotoSrc] = useState('');
  const [signSrc, setSignSrc] = useState('');
  const [photoAvailable, setPhotoAvailable] = useState(true);
  const [signAvailable, setSignAvailable] = useState(true);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [isMobileScorecard, setIsMobileScorecard] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScorecard(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getStudentInitials = (name) => {
    if (!name) return 'ST';
    const clean = name.trim().replace(/[^a-zA-Z\s]/g, '');
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'ST';
  };

  useEffect(() => {
    if (user?.admissionNumber) {
      setPhotoAvailable(true);
      setSignAvailable(true);
      setAvatarImgError(false);
      const backendBase = 'https://student-portal-backend-vo2b.onrender.com';
      const pUrl = user?.photoUrl || user?.photo || (backendBase + '/photos/' + user.admissionNumber + '_Photo.jpg');
      const sUrl = user?.signatureUrl || user?.signUrl || user?.sign || (backendBase + '/Signatures/' + user.admissionNumber + '_Sign.jpg');
      setPhotoSrc(pUrl.startsWith('http') ? pUrl : (backendBase + pUrl));
      setSignSrc(sUrl.startsWith('http') ? sUrl : (backendBase + sUrl));
    } else {
      setPhotoSrc('');
      setSignSrc('');
      setPhotoAvailable(false);
      setSignAvailable(false);
      setAvatarImgError(false);
    }
  }, [user]);

  useEffect(() => {
    if (!document.getElementById('html-to-image-script')) {
      const script = document.createElement('script');
      script.id = 'html-to-image-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }
    if (!document.getElementById('html2canvas-script')) {
      const script2 = document.createElement('script');
      script2.id = 'html2canvas-script';
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script2.crossOrigin = 'anonymous';
      document.body.appendChild(script2);
    }
  }, []);

  const handleDownloadJPG = async () => {
    const element = document.getElementById('scorecard-download-canvas') || document.getElementById('scorecard-modal-content');
    if (!element) return;

    setDownloading(true);

    try {
      if (!window.htmlToImage) {
        await new Promise((resolve) => {
          let count = 0;
          const check = setInterval(() => {
            count++;
            if (window.htmlToImage) {
              clearInterval(check);
              resolve();
            } else if (count > 40) {
              clearInterval(check);
              resolve();
            }
          }, 100);
        });
      }

      if (document.fonts) {
        await document.fonts.ready;
      }

      const fullWidth = 980;
      const fullHeight = element.scrollHeight;

      let imgData;
      if (window.htmlToImage) {
        imgData = await window.htmlToImage.toJpeg(element, {
          quality: 0.98,
          pixelRatio: 2,
          width: fullWidth,
          height: fullHeight,
          canvasWidth: fullWidth,
          canvasHeight: fullHeight,
          backgroundColor: '#071022',
          filter: (node) => node.id !== 'modal-action-buttons',
        });
      } else if (window.html2canvas) {
        const actionBtns = document.getElementById('modal-action-buttons');
        if (actionBtns) actionBtns.style.visibility = 'hidden';

        const canvas = await window.html2canvas(element, {
          scale: 2,
          width: fullWidth,
          height: fullHeight,
          windowWidth: fullWidth,
          windowHeight: fullHeight,
          backgroundColor: '#071022',
          useCORS: true,
          allowTaint: true,
          logging: false,
          scrollY: 0,
          scrollX: 0
        });

        if (actionBtns) actionBtns.style.visibility = 'visible';
        imgData = canvas.toDataURL('image/jpeg', 0.95);
      } else {
        throw new Error("Image generation library not available");
      }

      const link = document.createElement('a');
      const studentName = (scoreData?.studentInfo?.name || 'STUDENT')
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_');
      link.download = `JEE_Report_${studentName}.jpg`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("JPG Download Error:", err);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

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

    const cleanInputUrl = responseUrl.trim();

    // 0-second instant local cache check (Same device / session)
    if (localEvalCache.current.has(cleanInputUrl)) {
      setScoreData(localEvalCache.current.get(cleanInputUrl));
      return;
    }

    setEvaluatorLoading(true); 
    setScoreData(null);

    const abortController = new AbortController();
    const timeoutTimer = setTimeout(() => abortController.abort(), 6000);

    try {
      const response = await fetch(`https://student-portal-backend-vo2b.onrender.com/api/evaluate-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanInputUrl }),
        signal: abortController.signal
      });
      clearTimeout(timeoutTimer);

      if (!response.ok) {
        setShowServerBusyModal(true);
        return;
      }

      const data = await response.json(); 
      
      if (data.success) {
        // Cache locally for 0s instant output on repeated checks
        localEvalCache.current.set(cleanInputUrl, data);

        const getCounts = (sub) => {
          const pos = (sub?.secAPositive || 0) + (sub?.secBPositive || 0);
          const neg = Math.abs(sub?.secANegative || 0) + Math.abs(sub?.secBNegative || 0);
          const c = sub?.correct ?? (pos / 4);
          const w = sub?.wrong ?? neg;
          const u = Math.max(0, 25 - (c + w));
          return { c, w, u };
        };
        
        const m = getCounts(data.subjects?.Mathematics);
        const p = getCounts(data.subjects?.Physics);
        const ch = getCounts(data.subjects?.Chemistry);

        try {
          const { error: sbError } = await supabase
            .from('jee_results')
            .upsert({
              url: cleanInputUrl,
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
        setShowServerBusyModal(true);
      }
    } catch (err) {
      clearTimeout(timeoutTimer);
      console.error("Server Error:", err);
      setShowServerBusyModal(true);
    } finally {
      setEvaluatorLoading(false);
    }
  };



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
    }, 420000); 

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

  const [tickerTextList, setTickerTextList] = useState([
    "📝 Application Form for JEE(Main)-2027 [Session-I] (B.E. / B.Tech) is Available Now!",
    "🖼️ Candidate Photo & Signature are Available Now!"  
  ]);

  const examThemes = {
    'JEE Main': 'linear-gradient(135deg, #0d47a1, #1976d2)',        
    'JEE Advanced': 'linear-gradient(135deg, #2d5a27, #4caf50)',
    'BITSAT': 'linear-gradient(135deg, #e65100, #ff8f00)',    
    'TG EAPCET': 'linear-gradient(135deg, #880e4f, #ad1457)',       
    'AP EAPCET': 'linear-gradient(135deg, #004d40, #00695c)',       
    'IPE-2027': 'linear-gradient(135deg, #be8160, #512da8)',
    'Photo & Sign': 'linear-gradient(135deg, #1d4ed8, #2563eb)'
  };

  const currentThemeColor = activeExam === 'JEE Main' ? '#0043a4' : activeExam === 'JEE Advanced' ? '#2d5a27' : activeExam === 'BITSAT' ? '#e65100' : activeExam === 'TG EAPCET' ? '#880e4f' : activeExam === 'AP EAPCET' ? '#00695c' : activeExam === 'Photo & Sign' ? '#1d4ed8' : '#512da8';

  useEffect(() => { 
    document.title = "JEE Main 2027 Score Calculator"; 
    generateCaptcha();
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // 📡 Fetch live ticker news from Supabase
    const fetchTickerNews = async () => {
      try {
        const { data, error } = await supabase
          .from('ticker_news')
          .select('news_text')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (!error && data && data.length > 0) {
          setTickerTextList(data.map(item => item.news_text));
        }
      } catch (err) {
        console.error("Ticker fetch error:", err);
      }
    };
    fetchTickerNews();
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
    setPhotoSrc('');
    setSignSrc('');
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

  // 📷 ✍️ Download Photo & Signature Handler (Names: Photo.jpg & Signature.jpg)
  const handleDownloadJpgDoc = async (type) => {
    try {
      const isPhoto = type === 'Photo';
      const initialUrl = isPhoto ? photoSrc : signSrc;
      const downloadFileName = isPhoto ? 'Photo.jpg' : 'Signature.jpg';

      let response;
      try {
        response = await fetch(initialUrl);
      } catch (e) {
        // network / CORS error
      }

      if (!response || !response.ok) {
        const fallbackUrls = isPhoto 
          ? [
              `https://student-portal-backend-vo2b.onrender.com/photos/${user?.admissionNumber}_Photo.jpg`,
              `https://student-portal-backend-vo2b.onrender.com/photos/${user?.admissionNumber}.jpg`,
              `https://student-portal-backend-vo2b.onrender.com/photo/${user?.admissionNumber}_Photo.jpg`,
              `https://student-portal-backend-vo2b.onrender.com/photos/${user?.admissionNumber}_photo.jpg`
            ]
          : [
              `https://student-portal-backend-vo2b.onrender.com/photos/${user?.admissionNumber}_Sign.jpg`,
              `https://student-portal-backend-vo2b.onrender.com/signatures/${user?.admissionNumber}_Sign.jpg`,
              `https://student-portal-backend-vo2b.onrender.com/photos/${user?.admissionNumber}_sign.jpg`,
              `https://student-portal-backend-vo2b.onrender.com/signatures/${user?.admissionNumber}.jpg`,
              `https://student-portal-backend-vo2b.onrender.com/signatures/${user?.admissionNumber}_sign.jpg`
            ];

        for (const url of fallbackUrls) {
          try {
            response = await fetch(url);
            if (response && response.ok) break;
          } catch (e) {}
        }
      }

      if (!response || !response.ok) {
        setShowNotAvailableModal(true);
        return;
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Image Download Error:", err);
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
        
        .student-profile-banner {
          position: relative;
          overflow: hidden;
          background-color: #0b1d3a;
          color: white;
          padding: 24px 30px;
          border-radius: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 25px;
          box-shadow: 0 12px 30px -8px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .student-profile-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.35) 1.5px, transparent 1.6px);
          background-size: 18px 18px;
          background-repeat: repeat;
          pointer-events: none;
          z-index: 1;
        }
        .student-profile-banner > * {
          position: relative;
          z-index: 2;
        }

        /* ─── Photo & Sign Clean Compact Design (Dual-Tone & No Redundant Bar) ─── */
        .card-d1 {
          background: #ffffff;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
        }
        .card-d1::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
        }
        .card-d1.photo::before { background: linear-gradient(90deg, #2563eb, #38bdf8); }
        .card-d1.sign::before { background: linear-gradient(90deg, #7c3aed, #c084fc); }

        .box-clean-photo {
          border: 1.5px solid #dbeafe;
          border-radius: 14px;
          background: linear-gradient(180deg, #f0f7ff 0%, #f8fafc 100%);
          height: 195px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          box-shadow: inset 0 2px 6px rgba(37, 99, 235, 0.03);
          box-sizing: border-box;
        }

        .box-clean-sign {
          border: 1.5px solid #f3e8ff;
          border-radius: 14px;
          background: linear-gradient(180deg, #faf5ff 0%, #f8fafc 100%);
          height: 195px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
          box-shadow: inset 0 2px 6px rgba(124, 58, 237, 0.03);
          box-sizing: border-box;
        }
        .sign-plate-clean {
          background: #ffffff;
          border: 1.5px solid #f1f5f9;
          border-radius: 10px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
          width: 88%;
          height: 120px;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .evaluator-card { flex-direction: column; }
          .evaluator-left { border-right: none; border-bottom: 3px solid #3b82f6; }
          .login-btn-top { position: relative; right: auto; top: auto; transform: none; margin: 15px auto 0 auto; display: flex; justify-content: center; width: max-content; }
        }
      `}</style>

      <header style={{ backgroundColor: '#ffffff', padding: '18px 20px', width: '100%', boxSizing: 'border-box', position: 'relative', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div className="header-content-wrapper" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>JEE MAIN 2027 SCORE CALCULATOR</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b', fontWeight: '600', letterSpacing: '0.2px' }}>Don’t wait for results — know your score in seconds!</p>
          </div>

        </div>

        {!user && (
          <button 
            onClick={() => setShowLoginModal(true)} 
            className="login-btn-top"
            style={{ 
              background: 'radial-gradient(rgba(255, 255, 255, 0.25) 1.2px, transparent 1.2px), linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
              backgroundSize: '12px 12px, 100% 100%',
              color: '#ffffff', 
              padding: '9px 24px', 
              borderRadius: '9999px', 
              fontWeight: '700', 
              border: '1.5px solid rgba(255, 255, 255, 0.3)', 
              cursor: 'pointer', 
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '14px', 
              letterSpacing: '0.2px',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Candidate Login</span>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>🔐</span>
          </button>
        )}
      </header>

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
          <>
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
                    style={evaluatorLoading ? { opacity: 0.65, cursor: 'not-allowed' } : {}}
                  >
                    📊 View Result
                  </button>
                </div>
              </div>

            </div>

          </div>

          <QuickGuideSection />
        </>
        ) : (
          <div style={{ maxWidth: '1020px', width: '100%', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box' }}>
            <div 
              className="student-profile-banner"
              style={{ background: `linear-gradient(135deg, #0b1d3a 0%, ${currentThemeColor} 100%)` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {photoSrc && !avatarImgError ? (
                    <img 
                      src={photoSrc} 
                      alt={user?.studentName || 'Student'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setAvatarImgError(true)}
                    />
                  ) : (
                    <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '20px', letterSpacing: '0.5px' }}>
                      {getStudentInitials(user?.studentName)}
                    </span>
                  )}
                </div>

                <div>
                  <h2 style={{ margin: 0, fontSize: '21px', fontWeight: '800', letterSpacing: '-0.2px', color: '#ffffff' }}>
                    {user?.studentName}
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#93c5fd', fontWeight: '600', letterSpacing: '0.2px' }}>
                    Admission ID: <span style={{ color: '#ffffff', fontWeight: '700' }}>{user.admissionNumber}</span>
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout} 
                style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1.5px solid #a84a58', 
                  color: '#a84a58',
                  borderRadius: '9999px', 
                  cursor: 'pointer', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  padding: '9px 24px', 
                  fontSize: '14px',
                  fontWeight: '700',
                  lineHeight: '1',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff0f2';
                  e.currentTarget.style.borderColor = '#933c49';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#a84a58';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a84a58" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>

            <div style={{ 
              width: '100%', 
              backgroundColor: '#e5e9f0', 
              padding: '6px', 
              borderRadius: '50px', 
              border: '1.5px solid #d8dfeb', 
              boxSizing: 'border-box', 
              marginBottom: '25px', 
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}>
              {['JEE Main', 'JEE Advanced', 'BITSAT', 'TG EAPCET', 'AP EAPCET', 'IPE-2027', 'Photo & Sign'].map((exam, idx, arr) => {
                const isActive = activeExam === exam;
                const nextIsActive = arr[idx + 1] === activeExam;
                const showDivider = idx < arr.length - 1 && !isActive && !nextIsActive;

                return (
                  <div key={exam} style={{ flex: 1, minWidth: 'max-content', display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <button
                      onClick={() => setActiveExam(exam)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '11px 18px',
                        background: isActive ? examThemes[exam] : 'transparent',
                        color: isActive ? '#ffffff' : '#475569',
                        border: 'none',
                        borderRadius: '40px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '13.5px',
                        boxShadow: isActive ? '0 6px 18px rgba(0,0,0,0.2)' : 'none',
                        transform: isActive ? 'scale(1.02)' : 'none',
                        transition: 'all 0.22s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {renderExamIcon(exam, isActive)}
                      <span>{exam}</span>
                    </button>
                    {showDivider && (
                      <div style={{ position: 'absolute', right: 0, height: '22px', width: '1px', backgroundColor: '#cbd5e1' }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 📸 ✍️ Photo & Sign Content Area */}
            {activeExam === 'Photo & Sign' ? (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '28px 32px 34px 32px',
                boxSizing: 'border-box',
                width: '100%',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -2px rgba(0, 0, 0, 0.02)'
              }}>
                {/* ─── Top Header Section (Single Clean Title + Stacked Badge) ─── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '22px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '1.5px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#2563eb',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
                    marginTop: '2px'
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                      Photo & Signature
                    </h2>

                    {/* 🌟 Dynamic Status Badge (Directly below Title) */}
                    {photoAvailable && signAvailable ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '4px 12px', borderRadius: '20px', color: '#15803d', fontSize: '12px', fontWeight: '700', letterSpacing: '0.2px', width: 'max-content', boxShadow: '0 1px 3px rgba(34, 197, 94, 0.08)' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }}></span>
                        <span>Both Records Active</span>
                      </div>
                    ) : photoAvailable && !signAvailable ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: '20px', color: '#1d4ed8', fontSize: '12px', fontWeight: '700', letterSpacing: '0.2px', width: 'max-content' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }}></span>
                        <span>Photo Available Only</span>
                      </div>
                    ) : !photoAvailable && signAvailable ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', padding: '4px 12px', borderRadius: '20px', color: '#7e22ce', fontSize: '12px', fontWeight: '700', letterSpacing: '0.2px', width: 'max-content' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#a855f7', boxShadow: '0 0 6px #a855f7' }}></span>
                        <span>Signature Available Only</span>
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '20px', color: '#dc2626', fontSize: '12px', fontWeight: '700', letterSpacing: '0.2px', width: 'max-content' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                        <span>No Records Available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Compact Cards Grid (Photo & Signature) ─── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 360px))', justifyContent: 'center', gap: '28px', width: '100%', boxSizing: 'border-box' }}>
                  
                  {/* ─── Card 1: Passport Size Photo (Clean Compact) ─── */}
                  <div className="card-d1 photo">
                    <div>
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <polyline points="16 11 18 13 22 9" />
                            </svg>
                          </div>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Photo</span>
                        </div>
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontSize: '11px', fontWeight: '800', padding: '3px 9px', borderRadius: '6px' }}>
                          .JPG
                        </span>
                      </div>

                      {/* Photo Frame (Clean Compact, No Name Bar) */}
                      <div className="box-clean-photo">
                        {photoAvailable ? (
                          <img 
                            src={photoSrc} 
                            alt="Candidate Photo" 
                            onLoad={() => setPhotoAvailable(true)}
                            onError={() => {
                              const adm = user?.admissionNumber;
                              if (!adm) { setPhotoAvailable(false); return; }
                              if (photoSrc.includes('/photos/' + adm + '_Photo.jpg')) {
                                setPhotoSrc('https://student-portal-backend-vo2b.onrender.com/Photos/' + adm + '_Photo.jpg');
                              } else if (photoSrc.includes('/Photos/' + adm + '_Photo.jpg')) {
                                setPhotoSrc('https://student-portal-backend-vo2b.onrender.com/photos/' + adm + '.jpg');
                              } else if (photoSrc.includes('/photos/' + adm + '.jpg')) {
                                setPhotoSrc('https://student-portal-backend-vo2b.onrender.com/photos/' + adm + '_Photo.jpeg');
                              } else if (photoSrc.includes(adm + '_Photo.jpeg')) {
                                setPhotoSrc('https://student-portal-backend-vo2b.onrender.com/photos/' + adm + '_Photo.png');
                              } else {
                                setPhotoAvailable(false);
                              }
                            }}
                            style={{
                              width: '122px',
                              height: '152px',
                              objectFit: 'cover',
                              borderRadius: '9px',
                              border: '2.5px solid #ffffff',
                              boxShadow: '0 6px 18px rgba(37, 99, 235, 0.16)',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', border: '1px solid #e2e8f0' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Photo Not Available</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>No Attachment</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Download Button (Moved Up) */}
                    <button
                      onClick={() => {
                        if (!photoAvailable) {
                          setShowNotAvailableModal(true);
                          return;
                        }
                        handleDownloadJpgDoc('Photo');
                      }}
                      disabled={!photoAvailable}
                      style={{
                        marginTop: '15px',
                        width: '100%',
                        padding: '11.5px 18px',
                        background: !photoAvailable ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        cursor: !photoAvailable ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: !photoAvailable ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.28)',
                        opacity: !photoAvailable ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {!photoAvailable ? 'Photo Not Available' : 'Download Photo'}
                    </button>
                  </div>

                  {/* ─── Card 2: Specimen Signature (Clean Compact) ─── */}
                  <div className="card-d1 sign">
                    <div>
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m18 2 4 4-12 12H6v-4L18 2z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </div>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Signature</span>
                        </div>
                        <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', fontSize: '11px', fontWeight: '800', padding: '3px 9px', borderRadius: '6px' }}>
                          .JPG
                        </span>
                      </div>

                      {/* Signature Frame (Clean Compact, No Specimen Bar) */}
                      <div className="box-clean-sign">
                        {signAvailable ? (
                          <div className="sign-plate-clean">
                            <img 
                              src={signSrc} 
                              alt="Candidate Signature" 
                              onLoad={() => setSignAvailable(true)}
                              onError={() => {
                                const adm = user?.admissionNumber;
                                if (!adm) { setSignAvailable(false); return; }
                                const base = 'https://student-portal-backend-vo2b.onrender.com';
                                if (signSrc.includes('/Signatures/' + adm + '_Sign.jpg')) {
                                  setSignSrc(base + '/signatures/' + adm + '_Sign.jpg');
                                } else if (signSrc.includes('/signatures/' + adm + '_Sign.jpg')) {
                                  setSignSrc(base + '/Signature/' + adm + '_Sign.jpg');
                                } else if (signSrc.includes('/Signature/' + adm + '_Sign.jpg')) {
                                  setSignSrc(base + '/photos/' + adm + '_Sign.jpg');
                                } else if (signSrc.includes('/photos/' + adm + '_Sign.jpg')) {
                                  setSignSrc(base + '/Photos/' + adm + '_Sign.jpg');
                                } else if (signSrc.includes('/Photos/' + adm + '_Sign.jpg')) {
                                  setSignSrc(base + '/Signatures/' + adm + '.jpg');
                                } else {
                                  setSignAvailable(false);
                                }
                              }}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '90px',
                                objectFit: 'contain',
                                filter: 'contrast(1.15)',
                                display: 'block'
                              }}
                            />
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', border: '1px solid #e2e8f0' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4-14 14H4v-4L18 2z"/><path d="m14.5 5.5 4 4"/></svg>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Signature Not Available</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>No Attachment</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Download Button (Moved Up) */}
                    <button
                      onClick={() => {
                        if (!signAvailable) {
                          setShowNotAvailableModal(true);
                          return;
                        }
                        handleDownloadJpgDoc('Sign');
                      }}
                      disabled={!signAvailable}
                      style={{
                        marginTop: '15px',
                        width: '100%',
                        padding: '11.5px 18px',
                        background: !signAvailable ? '#94a3b8' : 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        cursor: !signAvailable ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: !signAvailable ? 'none' : '0 4px 14px rgba(124, 58, 237, 0.28)',
                        opacity: !signAvailable ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {!signAvailable ? 'Signature Not Available' : 'Download Signature'}
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              <>
                <ExamConsole user={user} activeExam={activeExam} setActiveExam={setActiveExam} examThemes={examThemes} currentThemeColor={currentThemeColor} handleDocClick={handleDocClick} />
                <Modals showSessionModal={showSessionModal} setShowSessionModal={setShowSessionModal} showYearModal={showYearModal} setShowYearModal={setShowYearModal} selectedDocType={selectedDocType} selectedDocLabel={selectedDocLabel} downloadDocument={downloadDocument} />
              </>
            )}
          </div>
        )}
      </div>

      {scoreData && (() => {
        const renderMobileScorecard = () => {
          return (
            <div 
              id="scorecard-modal-content"
              style={{
                width: '100%',
                maxWidth: '430px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                boxSizing: 'border-box'
              }}
            >
              <style>{`
                #scorecard-modal-content, #scorecard-modal-content *,
                #scorecard-download-canvas, #scorecard-download-canvas * {
                  -webkit-user-select: none !important;
                  -moz-user-select: none !important;
                  -ms-user-select: none !important;
                  user-select: none !important;
                }
              `}</style>

              {/* Top Action Bar (Buttons equal size: Download on left, Close on right) */}
              <div id="modal-action-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', width: '100%' }}>
                <button 
                  onClick={handleDownloadJPG}
                  disabled={downloading}
                  style={{
                    flex: 1,
                    background: downloading ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: '1px solid #3b82f6',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                    cursor: downloading ? 'not-allowed' : 'pointer'
                  }}
                  title="Download JPG"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  {downloading ? 'Downloading...' : 'Download JPG'}
                </button>
                <button 
                  onClick={() => setScoreData(null)}
                  style={{
                    flex: 1,
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: '1px solid #b91c1c',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Close Report ✕
                </button>
              </div>

              {/* Main Scorecard Card */}
              <div 
                style={{
                  width: '100%',
                  backgroundColor: '#071022',
                  border: '1px solid #1e3a8a',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 0 35px rgba(13, 71, 161, 0.4)'
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid #1e293b',
                  background: 'linear-gradient(90deg, #071022 0%, #0d234a 50%, #071022 100%)'
                }}>
                  <div style={{ background: '#ffffff', borderRadius: '50%', padding: '2px', display: 'flex', flexShrink: 0 }}>
                    <div style={{ width: '24px', height: '24px', background: 'linear-gradient(45deg, #3b82f6, #ef4444, #eab308, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '9px', height: '9px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.3px' }}>JEE-Main Response Report</div>
                    <div style={{ color: '#94a3b8', fontSize: '9.5px', fontWeight: '500' }}>Subject-Wise Performance Analysis</div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Student Info: 2 columns, Name spans 2 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
                    <div style={{ gridColumn: 'span 2', backgroundColor: '#334155', borderRadius: '6px', padding: '5px 7px', border: '1px solid #475569' }}>
                      <div style={{ color: '#cbd5e1', fontSize: '8.5px', marginBottom: '2px', whiteSpace: 'nowrap' }}>Student Name:</div>
                      <div style={{ color: '#ffffff', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scoreData.studentInfo?.name || "N/A"}</div>
                    </div>
                    <div style={{ backgroundColor: '#334155', borderRadius: '6px', padding: '5px 7px', border: '1px solid #475569' }}>
                      <div style={{ color: '#cbd5e1', fontSize: '8.5px', marginBottom: '2px', whiteSpace: 'nowrap' }}>Application No:</div>
                      <div style={{ color: '#ffffff', fontSize: '10.5px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scoreData.studentInfo?.appNo || "N/A"}</div>
                    </div>
                    <div style={{ backgroundColor: '#334155', borderRadius: '6px', padding: '5px 7px', border: '1px solid #475569' }}>
                      <div style={{ color: '#cbd5e1', fontSize: '8.5px', marginBottom: '2px', whiteSpace: 'nowrap' }}>Roll Number:</div>
                      <div style={{ color: '#ffffff', fontSize: '10.5px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scoreData.studentInfo?.rollNo || "N/A"}</div>
                    </div>
                    <div style={{ backgroundColor: '#334155', borderRadius: '6px', padding: '5px 7px', border: '1px solid #475569' }}>
                      <div style={{ color: '#cbd5e1', fontSize: '8.5px', marginBottom: '2px', whiteSpace: 'nowrap' }}>Test Date:</div>
                      <div style={{ color: '#ffffff', fontSize: '10.5px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scoreData.studentInfo?.examDate || "N/A"}</div>
                    </div>
                    <div style={{ backgroundColor: '#334155', borderRadius: '6px', padding: '5px 7px', border: '1px solid #475569' }}>
                      <div style={{ color: '#cbd5e1', fontSize: '8.5px', marginBottom: '2px', whiteSpace: 'nowrap' }}>Test Time:</div>
                      <div style={{ color: '#ffffff', fontSize: '10.5px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scoreData.studentInfo?.examShift === 'Shift2' ? '3:00 PM - 6:00 PM' : '9:00 AM - 12:00 PM'}</div>
                    </div>
                  </div>

                  {/* User-Suggested Subject Score Matrix Table: Rows = Maths, Physics, Chem; Cols = Sec A, Sec B */}
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '8px 6px' }}>
                    <div style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#0f172a', fontWeight: '800' }}>Subject Score Matrix Table</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '82px 1fr 1fr', gap: '4px', alignItems: 'center' }}>
                      <div></div>
                      <div style={{ backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '6px', padding: '5px 2px', textAlign: 'center', fontWeight: '800', fontSize: '10.5px' }}>Section A</div>
                      <div style={{ backgroundColor: '#bae6fd', color: '#0369a1', borderRadius: '6px', padding: '5px 2px', textAlign: 'center', fontWeight: '800', fontSize: '10.5px' }}>Section B</div>

                      {[
                        { name: 'Mathematics', key: 'Mathematics', grad: 'linear-gradient(90deg, #1e3a8a, #3b82f6)' },
                        { name: 'Physics', key: 'Physics', grad: 'linear-gradient(90deg, #14532d, #22c55e)' },
                        { name: 'Chemistry', key: 'Chemistry', grad: 'linear-gradient(90deg, #b45309, #eab308)' }
                      ].map((s, idx) => (
                        <React.Fragment key={idx}>
                          <div style={{ background: s.grad, color: 'white', textAlign: 'center', padding: '5px 2px', borderRadius: '20px', fontWeight: 'bold', fontSize: '9.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                            {s.name}
                          </div>
                          {/* Section A */}
                          <div style={{ backgroundColor: '#eef2ff', border: '1px solid #a5b4fc', borderRadius: '6px', padding: '4px 6px', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '1.5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#4f46e5' }}>Positive (+)</span>
                              <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{scoreData.subjects?.[s.key]?.secAPositive ?? 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#4f46e5' }}>Negative (-)</span>
                              <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{scoreData.subjects?.[s.key]?.secANegative ?? 0}</span>
                            </div>
                            <div style={{ borderTop: '1px solid #a5b4fc', margin: '2px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', color: '#312e81', fontSize: '10px' }}>
                              <span>Total</span>
                              <span>{scoreData.subjects?.[s.key]?.secATotal ?? 0}</span>
                            </div>
                          </div>
                          {/* Section B */}
                          <div style={{ backgroundColor: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '6px', padding: '4px 6px', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '1.5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#0369a1' }}>Positive (+)</span>
                              <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{scoreData.subjects?.[s.key]?.secBPositive ?? 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#0369a1' }}>Negative (-)</span>
                              <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{scoreData.subjects?.[s.key]?.secBNegative ?? 0}</span>
                            </div>
                            <div style={{ borderTop: '1px solid #7dd3fc', margin: '2px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', color: '#0c4a6e', fontSize: '10px' }}>
                              <span>Total</span>
                              <span>{scoreData.subjects?.[s.key]?.secBTotal ?? 0}</span>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Subject Wise Marks */}
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '7px 6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>Subject Wise Marks</div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                      <div style={{ flex: 1, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '7px', padding: '5px 2px', textAlign: 'center' }}>
                        <div style={{ color: '#1e3a8a', fontSize: '9px', fontWeight: '700' }}>Mathematics</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#1d4ed8', lineHeight: 1.1 }}>{scoreData.subjects?.Mathematics?.totalMarks ?? 0}</div>
                      </div>
                      <div style={{ flex: 1, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', padding: '5px 2px', textAlign: 'center' }}>
                        <div style={{ color: '#14532d', fontSize: '9px', fontWeight: '700' }}>Physics</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#15803d', lineHeight: 1.1 }}>{scoreData.subjects?.Physics?.totalMarks ?? 0}</div>
                      </div>
                      <div style={{ flex: 1, backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '7px', padding: '5px 2px', textAlign: 'center' }}>
                        <div style={{ color: '#78350f', fontSize: '9px', fontWeight: '700' }}>Chemistry</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#b45309', lineHeight: 1.1 }}>{scoreData.subjects?.Chemistry?.totalMarks ?? 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Grand Total Card */}
                  <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', borderRadius: '10px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#bfdbfe', fontWeight: '800', textTransform: 'uppercase' }}>🏆 Grand Total Score</div>
                      <div style={{ fontSize: '9px', color: '#93c5fd', fontWeight: '500' }}>Maximum Marks: 300</div>
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff' }}>
                      {scoreData.totalMarks ?? 0} <span style={{ fontSize: '12px', fontWeight: '700', color: '#93c5fd' }}>/ 300</span>
                    </div>
                  </div>

                  {/* Detailed Question Analysis Section Header */}
                  <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 6px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#cbd5e0' }}></div>
                    <div style={{ padding: '3px 10px', background: '#f0f2f5', border: '1px solid #cbd5e0', borderRadius: '12px', fontWeight: '800', fontSize: '9.5px', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                      Detailed Question Analysis
                    </div>
                    <div style={{ flex: 1, height: '1px', background: '#cbd5e0' }}></div>
                  </div>

                  {/* 3 COLUMNS SIDE-BY-SIDE: MATHEMATICS, PHYSICS, CHEMISTRY */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', width: '100%' }}>
                    {[
                      { name: 'Mathematics', fullName: 'Mathematics', pill_col: '#3a6fc5' },
                      { name: 'Physics', fullName: 'Physics', pill_col: '#32a852' },
                      { name: 'Chemistry', fullName: 'Chemistry', pill_col: '#dca826' }
                    ].map((sub, sIdx) => {
                      const questions = scoreData.subjects?.[sub.fullName]?.questions || [];
                      const secAPos = scoreData.subjects?.[sub.fullName]?.secAPositive || 0;
                      const secBPos = scoreData.subjects?.[sub.fullName]?.secBPositive || 0;
                      const secANeg = scoreData.subjects?.[sub.fullName]?.secANegative || 0;
                      const secBNeg = scoreData.subjects?.[sub.fullName]?.secBNegative || 0;
                      
                      const cCount = scoreData.subjects?.[sub.fullName]?.correct ?? ((secAPos + secBPos) / 4);
                      const wCount = scoreData.subjects?.[sub.fullName]?.wrong ?? (Math.abs(secANeg) + Math.abs(secBNeg));
                      const uCount = Math.max(0, 25 - (cCount + wCount));
                      
                      const totalQ = 25;
                      const c_percent = Math.round((cCount / totalQ) * 100) || 0;
                      const w_percent = Math.round((wCount / totalQ) * 100) || 0;
                      const u_percent = Math.max(0, 100 - (c_percent + w_percent));

                      return (
                        <div key={sIdx} style={{ position: 'relative', minWidth: 0 }}>
                          <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', color: 'white', fontWeight: 'bold', padding: '2px 6px', borderRadius: '8px', fontSize: '8px', whiteSpace: 'nowrap', zIndex: 5, background: sub.pill_col }}>
                            {sub.name}
                          </div>
                          <div style={{ borderRadius: '7px', overflow: 'hidden', paddingTop: '9px', background: 'white', border: `1.5px solid ${sub.pill_col}`, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '4px 2px 3px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                              <div style={{ height: '13px', background: '#e2e8f0', borderRadius: '6px', margin: '2px 0 3px 0', display: 'flex', overflow: 'hidden', fontSize: '7.5px', fontWeight: '800', lineHeight: 1 }}>
                                <div style={{ width: `${c_percent}%`, minWidth: c_percent > 0 ? '16px' : '0', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#064e3b' }}>{c_percent > 0 ? `${c_percent}%` : ''}</div>
                                <div style={{ width: `${w_percent}%`, minWidth: w_percent > 0 ? '16px' : '0', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7f1d1d' }}>{w_percent > 0 ? `${w_percent}%` : ''}</div>
                                <div style={{ width: `${u_percent}%`, minWidth: u_percent > 0 ? '16px' : '0', background: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>{u_percent > 0 ? `${u_percent}%` : ''}</div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '8px', fontWeight: '700', color: '#475569' }}>
                                <span><b style={{ color: '#16a34a' }}>✓</b>{cCount}</span>
                                <span><b style={{ color: '#dc2626' }}>✗</b>{wCount}</span>
                                <span><b style={{ color: '#64748b' }}>○</b>{uCount}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 2px', borderBottom: '1px solid #e2e8f0', borderTop: '1px solid #e2e8f0', fontSize: '8.5px', fontWeight: '700', color: '#475569', background: '#f8fafc' }}>
                              <span style={{ width: '22px', textAlign: 'center', flexShrink: 0 }}>Q.No</span>
                              <span style={{ flex: 1, textAlign: 'center' }}>Q.ID</span>
                              <span style={{ width: '32px', textAlign: 'center', flexShrink: 0, fontSize: '8px' }}>Status</span>
                            </div>
                            <div style={{ padding: '0 1px 3px' }}>
                              {Array.from({ length: 25 }).map((_, i) => {
                                const qNum = i + 1;
                                const rowBg = qNum <= 20 ? (qNum % 2 !== 0 ? '#f8fafc' : '#ffffff') : (qNum % 2 !== 0 ? '#f0fafe' : '#ffffff');
                                const questionData = questions[i] || {};
                                const status = questionData.status || 'Unattempted';
                                const isCorrect = status.toLowerCase() === 'correct';
                                const isWrong = status.toLowerCase() === 'wrong';
                                const icon = isCorrect ? '✓' : isWrong ? '✗' : '○';
                                const statusColor = isCorrect ? '#16a34a' : isWrong ? '#dc2626' : '#94a3b8';
                                const qId = questionData.questionId || '-';

                                return (
                                  <div key={qNum} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 1px', borderBottom: '1px solid #edf2f7', fontSize: '8.5px', background: rowBg }}>
                                    <span style={{ width: '22px', textAlign: 'center', fontWeight: '600', color: '#64748b', flexShrink: 0 }}>{qNum}.</span>
                                    <span style={{ flex: 1, textAlign: 'center', color: '#1e293b', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden' }}>{qId}</span>
                                    <span style={{ width: '32px', textAlign: 'center', color: statusColor, fontWeight: 'bold', fontSize: '10px', flexShrink: 0 }}>{icon}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div style={{ marginTop: '4px', padding: '6px', background: '#edf2f7', borderRadius: '6px', textAlign: 'center', fontWeight: '700', color: '#2d3748', fontSize: '9.5px' }}>
                    <span style={{ color: '#16a34a', margin: '0 5px' }}>✓ Correct</span>
                    <span style={{ color: '#dc2626', margin: '0 5px' }}>✗ Wrong</span>
                    <span style={{ color: '#64748b', margin: '0 5px' }}>○ Unattempted</span>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        const renderDesktopScorecard = (isDownload = false) => {
          return (
            <div 
              id={isDownload ? "scorecard-download-canvas" : "scorecard-modal-content"} 
              style={{ 
                backgroundColor: '#071022', 
                width: isDownload ? '980px' : '100%', 
                minWidth: isDownload ? '980px' : undefined, 
                border: '1px solid #1e3a8a', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                fontFamily: '"Segoe UI", sans-serif', 
                userSelect: 'none', 
                WebkitUserSelect: 'none', 
                boxSizing: 'border-box' 
              }}
            >
              <style>{`
                #scorecard-modal-content, #scorecard-modal-content *,
                #scorecard-download-canvas, #scorecard-download-canvas * {
                  -webkit-user-select: none !important;
                  -moz-user-select: none !important;
                  -ms-user-select: none !important;
                  user-select: none !important;
                }
              `}</style>
            
              {/* Header */}
              <div style={{ 
                padding: isDownload ? '16px 25px' : '12px 18px', 
                display: 'flex', 
                flexWrap: isDownload ? 'nowrap' : 'wrap', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: '10px', 
                borderBottom: '1px solid #1e293b', 
                background: 'linear-gradient(90deg, #071022 0%, #0d234a 50%, #071022 100%)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '50%', padding: '3px', display: 'flex' }}>
                     <div style={{ width: '36px', height: '36px', background: 'linear-gradient(45deg, #3b82f6, #ef4444, #eab308, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                     </div>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: isDownload ? '20px' : '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>JEE-Main Response Report</h2>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginTop: '2px' }}>Subject-Wise Performance Analysis</div>
                  </div>
                </div>
                
                {!isDownload && (
                  <div id="modal-action-buttons" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleDownloadJPG} 
                      disabled={downloading}
                      style={{ 
                        backgroundColor: downloading ? '#1d4ed8' : '#2563eb', 
                        color: '#ffffff', 
                        border: '1px solid #1d4ed8', 
                        padding: '6px 14px', 
                        borderRadius: '6px', 
                        cursor: downloading ? 'not-allowed' : 'pointer', 
                        fontWeight: '600', 
                        fontSize: '13px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }} 
                      title="Download as JPG"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      {downloading ? 'Downloading...' : 'Download'}
                    </button>
                    <button onClick={() => setScoreData(null)} style={{ backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      Close Report ✕
                    </button>
                  </div>
                )}
              </div>

              <div style={{ padding: isDownload ? '15px 25px' : '15px 16px', flex: 1 }}>
                {/* Student Info */}
                <div style={{ 
                  display: isDownload ? 'flex' : 'grid', 
                  gridTemplateColumns: isDownload ? undefined : 'repeat(auto-fit, minmax(130px, 1fr))',
                  flexWrap: isDownload ? 'nowrap' : undefined, 
                  gap: '8px', 
                  marginBottom: '15px', 
                  width: '100%' 
                }}>
                  {[
                    { label: "Student Name:", value: scoreData.studentInfo?.name || "N/A", flex: '2' },
                    { label: "Application No:", value: scoreData.studentInfo?.appNo || "N/A", flex: '1' },
                    { label: "Roll Number:", value: scoreData.studentInfo?.rollNo || "N/A", flex: '1' },
                    { label: "Test Date:", value: scoreData.studentInfo?.examDate || "N/A", flex: '1' },
                    { label: "Test Time:", value: scoreData.studentInfo?.examShift === 'Shift2' ? '3:00 PM - 6:00 PM' : '9:00 AM - 12:00 PM', flex: '1.2' }
                  ].map((info, idx) => (
                    <div key={idx} style={{ backgroundColor: '#475569', borderRadius: '8px', padding: '8px 10px', flex: isDownload ? info.flex : undefined, minWidth: '0', border: '1px solid #64748b' }}>
                      <div style={{ color: '#cbd5e1', fontSize: '10px', marginBottom: '3px', whiteSpace: 'nowrap', lineHeight: '1.2' }}>{info.label}</div>
                      <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', lineHeight: '1.4' }}>{info.value}</div>
                    </div>
                  ))}
                </div>

                {/* Subject Score Matrix Table */}
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a' }}>Subject Score Matrix Table</h3>
                  <div style={{ overflowX: isDownload ? 'visible' : 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 1fr', gap: '10px', minWidth: isDownload ? undefined : '420px' }}>
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
                </div>

                {/* Marks and Grand Total */}
                <div style={{ display: 'flex', flexWrap: isDownload ? 'nowrap' : 'wrap', gap: '15px' }}>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '12px 15px', flex: isDownload ? '1.2' : '1.2 1 280px', display: 'flex', flexDirection: 'column' }}>
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

                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '12px', flex: isDownload ? '0.8' : '0.8 1 200px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', border: 'none', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)', flex: 1 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: '800' }}>🏆 Grand Total Score</div>
                        <div style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', lineHeight: '1.2' }}>
                          {scoreData.totalMarks ?? 0} <span style={{ fontSize: '18px', fontWeight: '600', color: '#93c5fd', lineHeight: '1.2' }}>/ 300</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section title */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0 20px' }}>
                  <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, #cbd5e0)' }}></div>
                  <div style={{ padding: '10px 25px', background: '#f0f2f5', border: '1px solid #cbd5e0', borderRadius: '20px', fontWeight: 'bold', fontSize: '15px', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>Detailed Question-Wise Analysis</div>
                  <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, transparent, #cbd5e0)' }}></div>
                </div>

                {/* Question-Wise Analysis Grid: 3 columns for download/desktop, responsive auto-fit for mobile */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '15px', 
                  marginTop: '25px' 
                }}>
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
                    const uCount = Math.max(0, 25 - (cCount + wCount));
                    
                    const totalQ = 25;
                    const c_percent = Math.round((cCount / totalQ) * 100) || 0;
                    const w_percent = Math.round((wCount / totalQ) * 100) || 0;
                    const u_percent = Math.max(0, 100 - (c_percent + w_percent));

                    return (
                      <div key={sIdx} style={{ position: 'relative', minWidth: 0, marginBottom: '20px' }}>
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

                {/* Legend */}
                <div style={{ marginTop: '15px', padding: '12px', background: '#edf2f7', borderRadius: '8px', textAlign: 'center', fontWeight: '500', color: '#2d3748', fontSize: '13px' }}>
                  <span style={{ color: '#38a169', margin: '0 15px', fontWeight: 'bold' }}>✓ Correct</span>
                  <span style={{ color: '#e53e3e', margin: '0 15px', fontWeight: 'bold' }}>✗ Wrong</span>
                  <span style={{ color: '#718096', margin: '0 15px', fontWeight: 'bold' }}>○ Unattempted</span>
                </div>
              </div>
            </div>
          );
        };

        const renderScorecardContent = (isDownload = false) => {
          if (!isDownload && isMobileScorecard) {
            return renderMobileScorecard();
          }
          return renderDesktopScorecard(isDownload);
        };

        return (
          <>
            {/* 1. Visible Modal for Screen (Mobile & Desktop) */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: isMobileScorecard ? '8px 6px' : '10px', boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: isMobileScorecard ? '430px' : '1000px', maxHeight: '96vh', overflowY: 'auto', overflowX: 'hidden', borderRadius: isMobileScorecard ? '14px' : '16px', boxShadow: isMobileScorecard ? 'none' : '0 0 40px rgba(13, 71, 161, 0.4)', WebkitOverflowScrolling: 'touch' }}>
                {renderScorecardContent(false)}
              </div>
            </div>

            {/* 2. Dedicated High-Res 980px Export Canvas (Hidden zero-size container, never shows on screen, used strictly by handleDownloadJPG) */}
            <div style={{ position: 'fixed', left: 0, top: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -9999 }}>
              {renderScorecardContent(true)}
            </div>
          </>
        );
      })()}

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
            <p style={{ color: '#475569', fontSize: '12px', lineHeight: '1.6', margin: '0 0 24px 0', fontWeight: '500' }}>
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

      {/* 🫧 Small & Minimal Full-Screen Bubble Loading Overlay */}
      {evaluatorLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <style>{`
            @keyframes miniBubbleRipple {
              0% { width: 26px; height: 26px; opacity: 0.95; transform: scale(0.6); border-color: rgba(96, 165, 250, 0.95); }
              50% { opacity: 0.6; }
              100% { width: 115px; height: 115px; opacity: 0; transform: scale(1.15); border-color: rgba(37, 99, 235, 0); }
            }
            .mini-ripple-bubble {
              position: absolute;
              border-radius: 50%;
              border: 2px solid rgba(56, 189, 248, 0.8);
              box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
              animation: miniBubbleRipple 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
            }
            .mb-1 { animation-delay: 0s; }
            .mb-2 { animation-delay: 0.65s; }
            .mb-3 { animation-delay: 1.3s; }
          `}</style>
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="mini-ripple-bubble mb-1"></div>
            <div className="mini-ripple-bubble mb-2"></div>
            <div className="mini-ripple-bubble mb-3"></div>
            
            <div style={{
              position: 'absolute',
              width: '65px',
              height: '65px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(56, 189, 248, 0.1) 70%, transparent 100%)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
            }} />

            <div style={{
              position: 'relative',
              zIndex: 10,
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '700',
              letterSpacing: '1px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 15px rgba(56, 189, 248, 0.8)'
            }}>
              Loading...
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Server Busy Error Modal Popup */}
      {showServerBusyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999999,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '28px 24px',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '360px',
            position: 'relative',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.6)'
          }}>
            <button 
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#f8fafc',
                border: 'none',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                cursor: 'pointer',
                color: '#64748b'
              }} 
              onClick={() => setShowServerBusyModal(false)}
            >
              &#10005;
            </button>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 0 6px #fff1f2'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style={{
              margin: '0 0 16px 0',
              color: '#0f172a',
              fontSize: '19px',
              fontWeight: '800',
              letterSpacing: '-0.3px'
            }}>
              Server busy. Please try again.
            </h3>
            <button 
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 6px 16px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => setShowServerBusyModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

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

      {!showLoginModal && !user && (
        <>
          <AnalysisDashboard />
          <FaqAccordion />
        </>
      )}
      
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
              Please try again later.
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
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)' }}></div>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px' 
        }}>
          {/* Left: Last Updated Date */}
          <div style={{ 
            fontSize: '13.5px', 
            color: '#94a3b8', 
            letterSpacing: '0.4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>Last Updated:</span>
            <span style={{ color: '#e2e8f0', fontWeight: '600' }}>27-Nov-2026</span>
          </div>

          {/* Center: Copyright */}
          <div style={{ 
            fontSize: '14px', 
            color: '#cbd5e1', 
            letterSpacing: '0.5px',
            textAlign: 'center'
          }}>
            Copyright © 2026 KIT. All rights reserved | Designed for fast & accurate student score evaluation.
          </div>

          {/* Right: No. of Visitors Digital Counter */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '13.5px', 
            color: '#94a3b8' 
          }}>
            <span style={{ color: '#e2e8f0', fontWeight: '600' }}>No. of Visitors:</span>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '3px', 
              backgroundColor: '#1d4ed8', 
              padding: '3px 4px', 
              borderRadius: '6px', 
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)' 
            }}>
              {String(visitorCount).padStart(6, '0').split('').map((digit, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '18px', 
                    height: '24px', 
                    backgroundColor: '#60a5fa', 
                    color: '#ffffff', 
                    fontWeight: '800', 
                    fontSize: '15px', 
                    borderRadius: '3px', 
                    boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
                    fontFamily: '"Courier New", Courier, monospace, sans-serif'
                  }}
                >
                  {digit}
                </span>
              ))}
            </div>
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
