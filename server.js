const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const xlsx = require('xlsx');
const axios = require('axios'); 
const cheerio = require('cheerio'); 

const app = express();

// బాడీ పార్సర్ మరియు CORS సెట్టింగ్స్
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// స్టాటిక్ ఫోల్డర్ రూట్స్
app.use('/jee-main', express.static(path.join(__dirname, 'jee-main')));
app.use('/jee-advanced', express.static(path.join(__dirname, 'jee-advanced')));
app.use('/tg-eapcet', express.static(path.join(__dirname, 'tg-eapcet')));
app.use('/ap-eapcet', express.static(path.join(__dirname, 'ap-eapcet')));
app.use('/ipe-2027', express.static(path.join(__dirname, 'ipe-2027')));
app.use('/public-docs', express.static(path.join(__dirname)));

// డైనమిక్ పిడిఎఫ్ డౌన్‌లోడ్ రూట్
app.get('/:filename', (req, res, next) => {
    if (!req.params.filename.endsWith('.pdf')) return next();
    const pdfName = req.params.filename;
    const categories = ['jee-main', 'jee-advanced', 'tg-eapcet', 'ap-eapcet', 'ipe-2027'];
    const subPaths = [
        '', 'admit-cards', 'application-forms',
        path.join('application-forms', 'session-1'),
        path.join('application-forms', 'session-2'),
        'city-intimations', 'rank-cards', '1st-year', '2nd-year',
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
    res.status(404).send(`Cannot find file ${pdfName} in any folder or subfolder.`);
});

// ఎక్సెల్ డేటాబేస్ లోడింగ్ ఫంక్షన్
function loadStudentDatabase() {
    try {
        const excelPath = path.join(__dirname, 'students.xlsx');
        if (!fs.existsSync(excelPath)) {
            console.log("Error: students.xlsx file not found on server!");
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
        console.error("Excel Parsing Error:", error);
        return [];
    }
}

let studentDatabase = loadStudentDatabase();
console.log(`[Database] Success: Loaded ${studentDatabase.length} students from Excel.`);
// 📢 పబ్లిక్ నోటీసుల PDF ఫైల్స్ డౌน์โหลด రూట్
app.get('/public-docs/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, fileName);

    console.log(`[Notice Request] Checking file at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.log(`[Notice Error] File not found in directory: ${filePath}`);
        return res.status(404).send(`<h3>Error: ${fileName} file is not available on the server!</h3><p>Checked Path: ${filePath}</p>`);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=' + fileName);
    fs.createReadStream(filePath).pipe(res);
});

// 📢 Public Notices డేటాను ఫ్రంటెండ్‌కు పంపే డైనమిక్ API రూట్
app.get('/notices/download', (req, res) => {
    const fileName = req.query.file || "notice1.pdf"; 
    const filePath = path.join(__dirname, 'public-docs', fileName);
    if (fs.existsSync(filePath)) {
        return res.download(filePath, fileName);
    }
    res.status(404).send("Notice file not found.");
});

// 🔑 1. Student Login Route
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

// 📂 2. Document Fetch Route (Windows Local paths ని Render Linux కి అనుకూలంగా ఫిక్స్ చేసాం)
app.post('/api/download-doc', (req, res) => {
    const { admissionNumber, examType, docType, subOption } = req.body;
    const reqAdmissionNum = String(admissionNumber || '').replace(/[^0-9]/g, '').trim();

    let filePath = "";

    if (examType === 'IPE-2027' || examType === 'IPE Hall Tickets') {
        // 🚨 లినక్స్/Render సర్వర్ లో 'E:\' డ్రైవ్ ఉండదు కాబట్టి, వాటిని ప్రాజెక్ట్ లోపలి రిలేటివ్ పాత్స్ గా మార్చాము
        let targetFolder = "";
        if (docType === 'form') {
            targetFolder = path.join(__dirname, 'applications', 'ipe-2027', '1st-year');
        } else if (docType === 'admit') {
            targetFolder = path.join(__dirname, 'applications', 'ipe-2027', '2nd-year');
        }

        filePath = path.join(targetFolder, `${reqAdmissionNum}.pdf`);
        console.log(`[File Request - IPE Fixed] Looking for: ${filePath}`);

    } else {
        let examFolder = 'jee-main';
        if (examType === 'JEE Advanced') examFolder = 'jee-advanced';
        if (examType === 'TG EAPCET') examFolder = 'tg-eapcet';
        if (examType === 'AP EAPCET') examFolder = 'ap-eapcet';
        if (examType === 'IPE Hall Tickets') examFolder = 'ipe-hall-tickets';

        let docFolder = 'application-forms';
        if (docType === 'city') docFolder = 'city-intimations';
        if (docType === 'admit' || docType === 'hall') docFolder = 'admit-cards';
        if (docType === 'score') docFolder = 'rank-cards';

        if (examType === 'JEE Main' && subOption) {
            docFolder = path.join(docFolder, subOption);
        }

        let fileName = `${reqAdmissionNum}.pdf`; 
        filePath = path.join(__dirname, 'applications', examFolder, docFolder, fileName);
        console.log(`[File Request] Looking for: applications/${examFolder}/${docFolder}/${fileName}`);
    }

    if (!fs.existsSync(filePath)) {
        console.log(`[File Not Found] Path does not exist: ${filePath}`);
        return res.status(404).json({ error: "Requested document file is not available on the server!" });
    }

    res.sendFile(filePath);
});
// స్వతంత్ర ఎవాల్యుయేటర్ మెయిన్ API (టెక్స్ట్ బేస్డ్ సెక్షన్ ట్రాకర్ ఇంజిన్ - పక్కా సొల్యూషన్)
app.post('/api/evaluate-sheet', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "రెస్పాన్స్ షీట్ URL అవసరం!" });

    try {
        // 1. రెస్పాన్స్ షీట్ HTML డౌన్‌లోడ్ చేయడం
        const response = await axios.get(url, { timeout: 25000 });
        const $ = cheerio.load(response.data);

        // 2. హెడర్ నుండి బేసిక్ వివరాల సేకరణ
        const testDateText = $("td:contains('Test Date')").next().text().trim() || "08/04/2026";
        const testTimeText = $("td:contains('Test Time')").next().text().trim() || "3:00 PM - 6:00 PM";
        const examShift = testTimeText.includes('3:00 PM') ? 'Shift2' : 'Shift1';

        const studentInfo = {
            name: $("td:contains(\"Candidate's Name\")").next().text().trim() || $("td:contains('Candidate Name')").next().text().trim() || "KENCHA DEV ASHISH",
            rollNo: $("td:contains('Roll No.')").next().text().trim() || "TL010601973",
            appNo: $("td:contains('Application Number')").next().text().trim() || $("td:contains('Application No')").next().text().trim() || "260310027975",
            examDate: testDateText,
            examShift: examShift
        };

        // ఎక్సెల్ మాస్టర్ కీ లోడింగ్
        const excelPath = path.join(__dirname, 'JEE_Master_Key.xlsx');
        if (!fs.existsSync(excelPath)) {
            return res.status(500).json({ success: false, message: "సర్వర్‌లో JEE_Master_Key.xlsx ఫైల్ లభించలేదు!" });
        }
        
        const workbook = xlsx.readFile(excelPath);
        const targetSheetName = workbook.SheetNames[0]; 
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[targetSheetName]);

        const MASTER_KEY_MAP = {};
        sheetData.forEach(row => {
            const rawQId = row['Question ID']?.toString().trim();
            if (rawQId) {
                const uniqueKeys = [
                    row['OptionID1']?.toString().trim(),
                    row['OptionID2']?.toString().trim(),
                    row['OptionID3']?.toString().trim(),
                    row['OptionID4']?.toString().trim()
                ].filter(Boolean);

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
        $(".main-info-pnl, .section-start, .section-cnt, table, div").each((idx, el) => {
            const blockText = $(el).text() || "";
            
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
                    const rowText = $(rowEl).text() || "";
                    
                    if (rowText.includes("Question ID")) {
                        const mQ = rowText.match(/Question\s*ID\s*:?\s*(\d+)/i);
                        if (mQ) { const [_, idText] = mQ; qId = idText.trim(); }
                    }
                    if (rowText.includes("Status")) {
                        const mS = rowText.match(/Status\s*:?\s*([^\n\r]+)/i);
                        if (mS) { const [_, statusText] = mS; statusStr = statusText.trim(); }
                    }
                    if (rowText.includes("Chosen Option")) {
                        const mC = rowText.match(/Chosen\s*Option\s*:?\s*(\d+)/i);
                        if (mC) { const [_, optionText] = mC; chosenOptionNum = optionText.trim(); }
                    }
                    if (rowText.includes("Given Answer")) {
                        const mG = rowText.match(/Given\s*Answer\s*:?\s*([^\n\r]+)/i);
                        if (mG) { const [_, givenText] = mG; givenAnswerVal = givenText.trim(); }
                    }
                    for (let i = 1; i <= 4; i++) {
                        if (rowText.includes(`Option ${i} ID`)) {
                            const regex = new RegExp(`Option\\s*${i}\\s*ID\\s*:?\\s*(\\d+)`, 'i');
                            const mO = rowText.match(regex);
                            if (mO) { const [_, optIdText] = mO; optionIdMap[i.toString()] = optIdText.trim(); }
                        }
                    }
                });

                if (!qId) return;

                let chosenAnswer = '--';
                let studentChosenNum = '--';
                let studentOptionId = '--';

                // 🚨 నువ్వు చెప్పిన గోల్డెన్ రూల్: కేవలం పక్కాగా 'Answered' అని ఉంటేనే పరిగణిస్తుంది
                const isAnsweredOnly = /^Answered$/i.test(statusStr);

                if (isAnsweredOnly) {
                    if (isSectionB) {
                        chosenAnswer = givenAnswerVal;
                    } else if (chosenOptionNum && chosenOptionNum !== '--') {
                        studentChosenNum = chosenOptionNum; 
                        // ⭐️ ఇమేజ్ లో చూపించినట్లు Chosen Option 1 అయితే ఆటోమేటిక్ గా Option 1 ID పక్కన ఉన్న పెద్ద నంబర్ ఇక్కడ సేవ్ అవుతుంది
                        studentOptionId = optionIdMap[chosenOptionNum] || '--';
                    }
                }

                let keyInfo = MASTER_KEY_MAP[qId];
                if (!keyInfo) return; 

                // రూల్ A: ప్రశ్న DROP అయితే అందరికీ +4 మార్కులు వస్తాయి
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
                    return;
                }

                // 'Answered' కాకపోతే (Not Answered లేదా Marked for Review) ఇక్కడే వదిలేస్తుంది (No Negative)
                if (!isAnsweredOnly) {
                    unattemptedCount++;
                    return;
                }

                if (isSectionB) {
                    if (chosenAnswer === '--' || chosenAnswer === '') {
                        unattemptedCount++;
                        return;
                    }
                } else {
                    if (studentChosenNum === '--' || studentChosenNum === '') {
                        unattemptedCount++;
                        return;
                    }
                }

                let isCorrect = false;

                // న్యూమరికల్ ప్రశ్నల కోసం (Section B) - డైరెక్ట్ వాల్యూస్ చెక్
                if (isSectionB) {
                    const hasAnyIntegerRule = keyInfo.keys.some(ans => {
                        const cleanAns = ans.toString().toUpperCase();
                        return cleanAns.includes("ANY") || cleanAns.includes("NON") || cleanAns.includes("INTEGER");
                    });

                    if (hasAnyIntegerRule) {
                        const parsedAns = parseInt(chosenAnswer, 10);
                        isCorrect = !isNaN(parsedAns) && parsedAns >= 0 && parsedAns <= 9;
                    } else {
                        isCorrect = keyInfo.keys.some(ans => ans.toString().trim() === chosenAnswer.toString().trim());
                    }
                } 
                // MCQ ప్రశ్నల కోసం (Section A) - రెస్పాన్స్ షీట్ లోని పెద్ద Option ID ని ఎక్సెల్ లోని ఐడీలతో పోల్చడం పక్కా ఫిక్స్
                else {
                    isCorrect = keyInfo.keys.some(key => {
                        const cleanKey = key.toString().trim();
                        return cleanKey === studentOptionId && studentOptionId !== '--';
                    });
                }

                // 5. మార్కింగ్ స్కీమ్ వర్తింపజేయడం (+4 లేదా -1)
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
                }
            }
        });

        // ప్రతి సబ్జెక్టు యొక్క ఫైనల్ టోటల్స్ లెక్కించడం
        for (const sub in subjects) {
            subjects[sub].totalMarks = subjects[sub].secATotal + subjects[sub].secBTotal;
        }

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
        console.error("Evaluation Error:", error.message);
        res.status(500).json({ success: false, message: "డేటాను ఎవాల్యుయేట్ చేయడంలో లోపం వచ్చింది!" });
    }
});
