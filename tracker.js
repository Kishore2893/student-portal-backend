const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// 1. మీ Telegram బాట్ వివరాలు (ఆల్రెడీ సెట్ చేశాను)
const TELEGRAM_BOT_TOKEN = '9236306983:AAH0C96LdloGux1HOq82o154P_WGmEOFsmw';
const TELEGRAM_CHAT_ID = '9142748389';

// 2. మీ Supabase వివరాలు (ఇక్కడ మీ URL & Key పేస్ట్ చేయండి)
const SUPABASE_URL = 'https://wrneiatbhnbxoswzrxea.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_secret_1M-fkMFfjJiSeP4-7Rfb4A_DttM63bS';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🚀 Telegram కి అలర్ట్ మెసేజ్ పంపే ఫంక్షన్
async function sendTelegramAlert(htmlMessage) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: htmlMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        }, { timeout: 8000 });
        console.log('[Telegram Alert] ✅ మెసేజ్ విజయవంతంగా పంపబడింది!');
    } catch (err) {
        console.error('[Telegram Alert Error]:', err.response?.data || err.message);
    }
}

// 🔐 A. క్యాండిడేట్ లాగిన్ అయినప్పుడు లాగ్ & అలర్ట్
async function handleLoginAlert(student, mobileNumber) {
    try {
        const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });

        // Supabase లో రికార్డ్
        await supabase.from('portal_activity_logs').insert([{
            action_type: 'STUDENT_LOGIN',
            candidate_name: student.studentName,
            app_no: student.admissionNumber,
            mobile_number: mobileNumber
        }]).catch(e => console.error('[Supabase Login Log Error]', e.message));

        // Telegram అలర్ట్ మెసేజ్
        const msg = 
`🔐 <b>Student Portal Login Alert!</b>

👤 <b>విద్యార్థి:</b> ${student.studentName}
🆔 <b>అడ్మిషన్ నం:</b> <code>${student.admissionNumber}</code>
📱 <b>మొబైల్ నం:</b> <code>${mobileNumber}</code>
⏰ <b>సమయం:</b> ${istTime}`;

        await sendTelegramAlert(msg);
    } catch (e) {
        console.error('[Tracker Login Error]', e.message);
    }
}

// 📊 B. రెస్పాన్స్ షీట్ URL ఎంటర్ చేసినప్పుడు కౌంట్ + అలర్ట్
async function handleScoreEvaluationAlert(responseUrl, studentInfo, totalMarks) {
    try {
        const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
        let checkCount = 1;

        try {
            // 1. ఈ URL గతంలో వచ్చిందో లేదో Supabase లో చెక్ చేయడం:
            const { data: existing } = await supabase
                .from('portal_activity_logs')
                .select('check_count')
                .eq('response_url', responseUrl)
                .order('created_at', { ascending: false })
                .limit(1);

            if (existing && existing.length > 0 && existing[0].check_count) {
                checkCount = existing[0].check_count + 1;
            }

            // 2. Supabase లో సేవ్ చేయడం:
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
        } catch (sbErr) {
            console.error('[Supabase Score Log Error]', sbErr.message);
        }

        // కౌంట్ ని బట్టి బ్యాడ్జ్
        const countBadge = checkCount === 1 
            ? '1️⃣ 1st Time (మొదటిసారి)' 
            : `🔁 <b>${checkCount}th Time (ఇప్పటికి ${checkCount} సార్లు చూశారు)</b>`;

        // 3. Telegram అలర్ట్ మెసేజ్
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
        console.error('[Tracker Score Error]', e.message);
    }
}

module.exports = {
    handleLoginAlert,
    handleScoreEvaluationAlert
};