const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wrneiatbhnbxoswzrxea.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_qbKANnxOuYauUT3vW7Pu6Q_9qHLa8vw';

let supabase = null;
if (SUPABASE_URL && !SUPABASE_URL.includes('YOUR_SUPABASE')) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function sendTelegramAlert(htmlMessage) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: htmlMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        }, { timeout: 8000 });
        console.log('[Telegram Alert] Success');
    } catch (err) {
        console.error('[Telegram Alert Error]:', err.response?.data || err.message);
    }
}

async function handleLoginAlert(student) {
    try {
        const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });

        if (supabase) {
            try {
                const { error } = await supabase.from('portal_activity_logs').insert([{
                    action_type: 'STUDENT_LOGIN',
                    candidate_name: student.studentName || 'Student',
                    app_no: String(student.admissionNumber || '')
                }]);
                if (error) {
                    console.error('[Supabase Insert Error]:', error.message);
                } else {
                    console.log('[Supabase Login Log] Saved');
                }
            } catch (sbErr) {
                console.error('[Supabase Login Error]:', sbErr.message);
            }
        }

        const msg = 
`🔐 <b>Student Portal Login Alert!</b>

👤 <b>Student:</b> ${student.studentName || 'Student'}
🆔 <b>Admission No:</b> <code>${student.admissionNumber || ''}</code>
⏰ <b>Time:</b> ${istTime}`;

        await sendTelegramAlert(msg);
    } catch (e) {
        console.error('[Tracker Login Error]:', e.message);
    }
}

async function handleScoreEvaluationAlert(responseUrl, studentInfo, totalMarks) {
    try {
        const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
        let checkCount = 1;

        if (supabase) {
            try {
                const { data: existing } = await supabase
                    .from('portal_activity_logs')
                    .select('check_count')
                    .eq('response_url', responseUrl)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (existing && existing.length > 0 && existing[0].check_count) {
                    checkCount = existing[0].check_count + 1;
                }

                await supabase.from('portal_activity_logs').insert([{
                    action_type: 'SCORE_CHECK',
                    candidate_name: studentInfo.name || 'Candidate',
                    app_no: studentInfo.appNo || 'N/A',
                    exam_date: studentInfo.examDate || 'N/A',
                    shift: studentInfo.examShift || 'N/A',
                    total_marks: totalMarks,
                    response_url: responseUrl,
                    check_count: checkCount
                }]);
                console.log('[Supabase Score Log] Saved Count:', checkCount);
            } catch (sbErr) {
                console.error('[Supabase Score Error]:', sbErr.message);
            }
        }

        const countBadge = checkCount === 1 
            ? '1️⃣ 1st Time' 
            : `🔁 <b>${checkCount}th Time</b>`;

        const msg = 
`🚨 <b>JEE Score Evaluator Alert!</b>

👤 <b>Candidate:</b> ${studentInfo.name || 'Candidate'}
🆔 <b>App No:</b> <code>${studentInfo.appNo || 'N/A'}</code>
🎯 <b>Marks:</b> <b>${totalMarks} / 300</b>
📅 <b>Date:</b> ${studentInfo.examDate || 'N/A'} (${studentInfo.examShift || 'N/A'})
🔄 <b>Check Count:</b> ${countBadge}
⏰ <b>Time:</b> ${istTime}

🔗 <b>URL:</b> <a href="${responseUrl}">Response Sheet Link</a>`;

        await sendTelegramAlert(msg);
    } catch (e) {
        console.error('[Tracker Score Error]:', e.message);
    }
}

module.exports = {
    handleLoginAlert,
    handleScoreEvaluationAlert
};
