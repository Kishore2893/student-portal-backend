const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const xlsx = require('xlsx');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// 1. మిడిల్వేర్ మరియు CORS సెట్టింగ్స్
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

// 2. స్టాటిక్ ఫోల్డర్స్ కాన్ఫిగరేషన్
app.use('/jee-main', express.static(path.join(__dirname, 'jee-main')));
app.use('/jee-advanced', express.static(path.join(__dirname, 'jee-advanced')));
app.use('/tg-eapcet', express.static(path.join(__dirname, 'tg-eapcet')));
app.use('/ap-eapcet', express.static(path.join(__dirname, 'ap-eapcet')));
app.use('/ipe-2027', express.static(path.join(__dirname, 'ipe-2027')));
app.use('/public-docs', express.static(path.join(__dirname, 'public-docs')));

// 3. ఎక్సెల్ నుండి విద్యార్థుల డేటాను లోడ్ చేసే ఫంక్షన్
function loadStudentDatabase() {
    try {
        const excelPath = path.join(__dirname, 'students.xlsx');
        if (!fs.existsSync(excelPath)) {
            console.log("[Database Warning] students.xlsx file not found on server!");
            return [];
        }
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        return data.map(student => ({
            admissionNumber: String(student.admissionNumber || '').replace(/[^0-9]/g, '').trim(),
            mobileNumber: String(student.mobileNumber || '').replace(/[^0-9]/g, '').trim(),
            studentName: String(student.studentName || 'Student').trim()
        }));
    } catch (error) {
        console.error("[Database Error] Excel Parsing Error:", error);
        return [];
    }
}

let studentDatabase = loadStudentDatabase();
console.log(`[Database] Success: Loaded ${studentDatabase.length} students from Excel.`);

// 4. విద్యార్థి లాగిన్ API రౌట్
app.post('/api/student-login', (req, res) => {
    const { admissionNumber, mobileNumber } = req.body;

    const reqAdmissionNum = String(admissionNumber || '').replace(/[^0-9]/g, '').trim();
    const reqMobile = String(mobileNumber || '').replace(/[^0-9]/g, '').trim();

    studentDatabase = loadStudentDatabase(); 

    console.log(`[Login Attempt] Admission No: ${reqAdmissionNum}, Mobile: ${reqMobile}`);

    const student = studentDatabase.find(s => s.admissionNumber === reqAdmissionNum && s.mobileNumber === reqMobile);

    if (!student) {
        console.log(`[Login Failed] No match found for ${reqAdmissionNum}`);
        return res.status(400).json({ error: "Invalid Admission Number or Mobile Number! Please try again." });
    }

    console.log(`[Login Success] Verified: ${student.studentName}`);
    res.json({ 
        message: "Login Successful", 
        studentName: student.studentName,
        admissionNumber: student.admissionNumber
    });
});

// 5. డైనమిక్ డాక్యుమెంట్ డౌన్లోడ్ API రౌట్
app.post('/api/download-doc', (req, res) => {
    const { admissionNumber, examType, docType, subOption } = req.body;
    const reqAdmissionNum = String(admissionNumber || '').replace(/[^0-9]/g, '').trim();

    let targetFolder = "";

    if (examType === 'IPE-2027' || examType === 'IPE Hall Tickets') {
        const yearFolder = docType === 'form' ? '1st Year' : '2nd Year';
        targetFolder = path.join(__dirname, 'applications', 'ipe-2027', yearFolder);
    } else {
        let examFolder = 'jee-main';
        if (examType === 'JEE Advanced') examFolder = 'jee-advanced';
        if (examType === 'TG EAPCET') examFolder = 'tg-eapcet';
        if (examType === 'AP EAPCET') examFolder = 'ap-eapcet';

        let docFolder = 'application-forms';
        if (docType === 'admit' || docType === 'hall') docFolder = 'admit-cards';
        if (docType === 'score') docFolder = 'rank-cards';

        if (examType === 'JEE Main' && subOption) {
            docFolder = path.join(docFolder, subOption);
        }

        targetFolder = path.join(__dirname, 'applications', examFolder, docFolder);
    }

    const filePath = path.join(targetFolder, `${reqAdmissionNum}.pdf`);
    console.log(`[File Request] Looking for: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.log(`[File Not Found] Path does not exist: ${filePath}`);
        return res.status(404).json({ error: "Requested document file is not available on the server!" });
    }

    res.download(filePath, `${reqAdmissionNum}.pdf`);
});

// 6. పబ్లిక్ నోటీసుల PDF ఫైల్స్ డౌన్లోడ్ రౌట్
app.get('/public-docs/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'public-docs', fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send(`<h3>Error: ${fileName} file is not available on the server!</h3>`);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=' + fileName);
    fs.createReadStream(filePath).pipe(res);
});

// 7. డైనమిక్ PDF ఫైల్ డౌన్లోడ్ రౌట్ (అడ్మిషన్ నంబర్ లేదా నేరుగా ఫైల్ పేరుతో)
app.get('/:filename', (req, res, next) => {
    if (!req.params.filename.endsWith('.pdf')) return next();

    const pdfName = req.params.filename;
    const categories = ['', 'applications', 'jee-main', 'jee-advanced', 'tg-eapcet', 'ap-eapcet', 'ipe-2027', 'public-docs'];
    const subPaths = [
        '',
        'admit-cards',
        'application-forms',
        path.join('application-forms', 'session-1'),
        path.join('application-forms', 'session-2'),
        'rank-cards',
        '1st-year',
        '2nd-year',
        path.join('1st-year', 'application-forms'),
        path.join('2nd-year', 'application-forms')
    ];

    for (let category of categories) {
        for (let subPath of subPaths) {
            const filePath = path.join(__dirname, category, subPath, pdfName);
            if (fs.existsSync(filePath)) {
                return res.download(filePath);
            }
        }
    }

    res.status(404).send(`Cannot find file ${pdfName} on the server.`);
});

// =========================================================================
// ─── 8. 🎯 JEE MAIN RESPONSE SHEET EVALUATOR API (100% NTA Accurate) ───
// =========================================================================
app.post('/api/evaluate-sheet', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "రెస్పాన్స్ షీట్ URL అవసరం!" });

    try {
        // A. రెస్పాన్స్ షీట్ HTML డౌన్లోడ్
        const response = await axios.get(url, { 
            timeout: 25000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const $ = cheerio.load(response.data);

        // B. అభ్యర్థి వివరాల సేకరణ
        const testDateText = $("td:contains('Test Date')").next().text().trim() || "N/A";
        const testTimeText = $("td:contains('Test Time')").next().text().trim() || "N/A";
        const examShift = testTimeText.includes('3:00 PM') ? 'Shift2' : 'Shift1';

        const studentInfo = {
            name: $("td:contains(\"Candidate's Name\")").next().text().trim() || $("td:contains('Candidate Name')").next().text().trim() || "Candidate",
            rollNo: $("td:contains('Roll No.')").next().text().trim() || $("td:contains('Roll Number')").next().text().trim() || "N/A",
            appNo: $("td:contains('Application Number')").next().text().trim() || $("td:contains('Application No')").next().text().trim() || "N/A",
            examDate: testDateText,
            examShift: examShift
        };

        // C. ఎక్సెల్ మాస్టర్ కీ లోడింగ్
        const excelPath = path.join(__dirname, 'JEE_Master_Key.xlsx');
        if (!fs.existsSync(excelPath)) {
            return res.status(500).json({ success: false, message: "సర్వర్లో JEE_Master_Key.xlsx ఫైల్ లభించలేదు!" });
        }
        
        const workbook = xlsx.readFile(excelPath);
        const targetSheetName = workbook.SheetNames.find(name => {
            const rows = xlsx.utils.sheet_to_json(workbook.Sheets[name]);
            return rows.length > 0;
        }) || workbook.SheetNames[0];

        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[targetSheetName]);

        const MASTER_KEY_MAP = {};
        sheetData.forEach(row => {
            const rawQId = (row['Question ID'] || row['QuestionID'] || row['QID'])?.toString().trim();
            if (rawQId) {
                const uniqueKeys = [
                    row['OptionID1'] || row['NTA KEY1'] || row['CorrectOptionID'],
                    row['OptionID2'] || row['NTA KEY2'],
                    row['OptionID3'] || row['NTA KEY3'],
                    row['OptionID4'] || row['NTA KEY4']
                ].map(v => v?.toString().trim()).filter(Boolean);

                MASTER_KEY_MAP[rawQId] = {
                    keys: [...new Set(uniqueKeys)],
                    isDrop: uniqueKeys.some(k => k.toUpperCase() === 'DROP')
                };
            }
        });

        let totalMarks = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let unattemptedCount = 0;

        let subjects = {
            Mathematics: { secAPositive: 0, secANegative: 0, secATotal: 0, secBPositive: 0, secBNegative: 0, secBTotal: 0, totalMarks: 0 },
            Physics: { secAPositive: 0, secANegative: 0, secATotal: 0, secBPositive: 0, secBNegative: 0, secBTotal: 0, totalMarks: 0 },
            Chemistry: { secAPositive: 0, secANegative: 0, secATotal: 0, secBPositive: 0, secBNegative: 0, secBTotal: 0, totalMarks: 0 }
        };

        let currentSub = "Mathematics";
        let isSectionB = false;
        const processedQuestions = new Set();

        // D. రెస్పాన్స్ షీట్ స్కాన్ చేయడం
        $(".main-info-pnl, .section-start, .section-cnt, table, div").each((idx, el) => {
            const blockText = $(el).text() || "";

            // సబ్జెక్ట్ & సెక్షన్ ట్రాకింగ్
            if (/Mathematics\s*Section\s*A/i.test(blockText)) { currentSub = "Mathematics"; isSectionB = false; }
            else if (/Mathematics\s*Section\s*B/i.test(blockText)) { currentSub = "Mathematics"; isSectionB = true; }
            else if (/Physics\s*Section\s*A/i.test(blockText)) { currentSub = "Physics"; isSectionB = false; }
            else if (/Physics\s*Section\s*B/i.test(blockText)) { currentSub = "Physics"; isSectionB = true; }
            else if (/Chemistry\s*Section\s*A/i.test(blockText)) { currentSub = "Chemistry"; isSectionB = false; }
            else if (/Chemistry\s*Section\s*B/i.test(blockText)) { currentSub = "Chemistry"; isSectionB = true; }

            if ($(el).is('table') && blockText.includes("Question ID")) {
                let qId = "";
                let chosenOptionNum = "";
                let statusStr = "";
                let givenAnswerVal = "";
                let optionIdMap = {};

                $(el).find("tr").each((rIdx, rowEl) => {
                    const rowText = $(rowEl).text().replace(/\s+/g, ' ').trim();
                    
                    if (/Question\s*ID/i.test(rowText)) {
                        const match = rowText.match(/Question\s*ID\s*:?\s*(\d+)/i);
                        if (match && match[1]) qId = match[1].trim();
                    }
                    if (/Status/i.test(rowText)) {
                        const match = rowText.match(/Status\s*:?\s*([^;]+)/i);
                        if (match && match[1]) statusStr = match[1].trim();
                    }
                    if (/Chosen\s*Option/i.test(rowText)) {
                        const match = rowText.match(/Chosen\s*Option\s*:?\s*(\d+)/i);
                        if (match && match[1]) chosenOptionNum = match[1].trim();
                    }
                    if (/Given\s*Answer/i.test(rowText)) {
                        const match = rowText.match(/Given\s*Answer\s*:?\s*([^\s;]+)/i);
                        if (match && match[1]) givenAnswerVal = match[1].trim();
                    }
                    for (let i = 1; i <= 4; i++) {
                        if (new RegExp(`Option\\s*${i}\\s*ID`, 'i').test(rowText)) {
                            const match = rowText.match(new RegExp(`Option\\s*${i}\\s*ID\\s*:?\\s*(\\d+)`, 'i'));
                            if (match && match[1]) optionIdMap[i.toString()] = match[1].trim();
                        }
                    }
                });

                if (!qId || processedQuestions.has(qId)) return;
                processedQuestions.add(qId);

                // మాస్టర్ కీ మ్యాచింగ్
                let keyInfo = MASTER_KEY_MAP[qId] || Object.entries(MASTER_KEY_MAP).find(([k]) => qId.includes(k) || k.includes(qId))?.[1];
                if (!keyInfo) return;

                // 🌟 1. DROP ప్రశ్న అయితే అందరికీ +4 బోనస్
                if (keyInfo.isDrop) {
                    totalMarks += 4;
                    correctCount++;
                    if (isSectionB) {
                        subjects[currentSub].secBPositive += 4;
                        subjects[currentSub].secBTotal += 4;
                    } else {
                        subjects[currentSub].secAPositive += 4;
                        subjects[currentSub].secATotal += 4;
                    }
                    subjects[currentSub].totalMarks += 4;
                    return;
                }

                // 🌟 2. NTA అటెంప్ట్ రూల్ (Answered లేదా Marked for review with answer రెండూ లెక్కించబడతాయి):
                let isAttempted = false;
                let studentOptionId = '--';
                let chosenAnswer = '--';

                if (isSectionB) {
                    if (givenAnswerVal && givenAnswerVal !== '--' && givenAnswerVal !== '') {
                        isAttempted = true;
                        chosenAnswer = givenAnswerVal;
                    }
                } else {
                    if (chosenOptionNum && chosenOptionNum !== '--' && optionIdMap[chosenOptionNum]) {
                        isAttempted = true;
                        studentOptionId = optionIdMap[chosenOptionNum];
                    }
                }

                // అటెంప్ట్ చేయనివి (0 మార్కులు)
                if (!isAttempted) {
                    unattemptedCount++;
                    return;
                }

                // 3. కరెక్ట్ ఆన్సర్ వెరిఫికేషన్ (డెసిమల్స్ & స్ట్రింగ్స్ సపోర్ట్)
                let isCorrect = false;

                if (isSectionB) {
                    const hasAnyIntegerRule = keyInfo.keys.some(ans => {
                        const clean = ans.toUpperCase();
                        return clean.includes("ANY") || clean.includes("INTEGER");
                    });

                    if (hasAnyIntegerRule) {
                        const parsed = parseInt(chosenAnswer, 10);
                        isCorrect = !isNaN(parsed) && parsed >= 0 && parsed <= 9;
                    } else {
                        const studentNum = parseFloat(chosenAnswer);
                        isCorrect = keyInfo.keys.some(ans => {
                            const keyNum = parseFloat(ans);
                            if (!isNaN(studentNum) && !isNaN(keyNum)) {
                                return Math.abs(studentNum - keyNum) < 0.001; // 15.0 == 15
                            }
                            return ans.trim().toLowerCase() === chosenAnswer.trim().toLowerCase();
                        });
                    }
                } else {
                    isCorrect = keyInfo.keys.some(key => key.trim() === studentOptionId.trim());
                }

                // 4. మార్కింగ్ కేటాయింపు (+4 లేదా -1)
                if (isCorrect) {
                    totalMarks += 4;
                    correctCount++;
                    if (isSectionB) {
                        subjects[currentSub].secBPositive += 4;
                        subjects[currentSub].secBTotal += 4;
                    } else {
                        subjects[currentSub].secAPositive += 4;
                        subjects[currentSub].secATotal += 4;
                    }
                    subjects[currentSub].totalMarks += 4;
                } else {
                    totalMarks -= 1;
                    wrongCount++;
                    if (isSectionB) {
                        subjects[currentSub].secBNegative += 1;
                        subjects[currentSub].secBTotal -= 1;
                    } else {
                        subjects[currentSub].secANegative += 1;
                        subjects[currentSub].secATotal -= 1;
                    }
                    subjects[currentSub].totalMarks -= 1;
                }
            }
        });

        // E. ఫైనల్ రెస్పాన్స్
        res.json({
            success: true,
            studentInfo,
            totalMarks,
            correctCount,
            wrongCount,
            unattemptedCount,
            subjects
        });

    } catch (error) {
        console.error("[Evaluation Error]", error.message);
        res.status(500).json({ success: false, message: "రెస్పాన్స్ షీట్ లోపల డేటాను ఎవాల్యుయేట్ చేయడంలో లోపం వచ్చింది!" });
    }
});

// 9. Render Cloud & Local Dynamic Port Binding
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}...`));
