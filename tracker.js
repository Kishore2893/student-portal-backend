const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// 1. Telegram వివరాలు
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9236306983:AAH0C96LdloGux1HOq82o154P_WGmEOFsmw';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '9142748389';

// 2. Supabase వివరాలు (ఇక్కడ మీ URL & Key ఉంచండి)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wrneiatbhnbxoswzrxea.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_qbKANnxOuYauUT3vW7Pu6Q_9qHLa8vw';

let supabase = null;
if (SUPABASE_URL && !SUPABASE_URL.includes('మీ_SUPABASE')) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

// 📲 Telegram కి మెసేజ్ పంపడం
async function sendTelegramAlert(htmlMessage) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: htmlMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        }, { timeout: 8000 });
        console.log('[Telegram Alert] ✅ మెసేజ్ సక్సెస్ ఫుల్ గా వెళ్ళింది!');
    } catch (err) {
        console.error('[Telegram Alert Error]:', err.response?.data || err.message);
    }
}

// 🔐 A. విద్యార్థి లాగిన్ అయినప్పుడు
async function handleLoginAlert(student, mobileNumber) {
    try {
        const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });

        // Supabase లో సేవ్ చేయడం (ఫిక్స్ చేసిన కోడ్)
        if (supabase) {
            try {
                const { error } = await supabase.from('portal_activity_logs').insert([{
                    action_type: 'STUDENT_LOGIN',
                    candidate_name: student.studentName || 'Student',
                    app_no: String(student.admissionNumber || ''),
                    mobile_number: String(mobileNumber || '')
                }]);
                if (error) {
                    console.error('[Supabase Insert Error]:', error.message);
                } else {
                    console.log('[Supabase Login Log] ✅ సక్సెస్ ఫుల్ గా సేవ్ అయింది!');
                }
            } catch (sbErr) {
                console.error('[Supabase Login Error]:', sbErr.message);
            }
        }

        // Telegram మెసేజ్
        const msg = 
`🔐 <b>Student Portal Login Alert!</b>

👤 <b>విద్యార్థి:</b> ${student.studentName || 'Student'}
🆔 <b>అడ్మిషన్ నం:</b> <code>${student.admissionNumber || ''}</code>
📱 <b>మొబైల్:</b> <code>${mobileNumber || ''}</code>
⏰ <b>సమయం:</b> ${istTime}`;

        await sendTelegramAlert(msg);
    } catch (e) {
        console.error('[Tracker Login Error]:', e.message);
    }
}

// 📊 B. రెస్పాన్స్ షీట్ URL ఎంటర్ చేసినప్పుడు
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
                console.log('[Supabase Score Log] ✅ స్కోర్ సేవ్ అయింది! Count:', checkCount);
            } catch (sbErr) {
                console.error('[Supabase Score Error]:', sbErr.message);
            }
        }

        const countBadge = checkCount === 1 
            ? '1️⃣ 1st Time (మొదటిసారి)' 
            : `🔁 <b>${checkCount}th Time (ఇప్పటికి ${checkCount} సార్లు చూశారు)</b>`;

        const msg = 
`🚨 <b>JEE Score Evaluator Alert!</b>

👤 <b>అభ్యర్థి:</b> ${studentInfo.name || 'Candidate'}
🆔 <b>App No:</b> <code>${studentInfo.appNo || 'N/A'}</code>
🎯 <b>మార్కులు:</b> <b>${totalMarks} / 300</b>
📅 <b>తేదీ:</b> ${studentInfo.examDate || 'N/A'} (${studentInfo.examShift || 'N/A'})
🔄 <b>చెక్ చేసిన సంఖ్య:</b> ${countBadge}
⏰ <b>సమయం:</b> ${istTime}

🔗 <b>URL:</b> <a href="${responseUrl}">రెస్పాన్స్ షీట్ లింక్</a>`;

        await sendTelegramAlert(msg);
    } catch (e) {
        console.error('[Tracker Score Error]:', e.message);
    }
}

module.exports = {
    handleLoginAlert,
    handleScoreEvaluationAlert
};
