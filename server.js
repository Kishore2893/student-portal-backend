const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const xlsx = require('xlsx');
const axios = require('axios'); // రెస్పాన్స్ షీట్ డౌన్‌లోడ్ కోసం
const cheerio = require('cheerio'); // HTML డేటా స్క్రాపింగ్ కోసం

const app = express();

// 1. ఎక్స్‌ప్రెస్ బాడీ పార్సర్ మరియు CORS సెట్టింగ్స్ అన్నింటికంటే ముందే ఉండాలి
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// 2. ఆ తర్వాతే మిగిలిన స్టాటిక్ ఫోల్డర్ రూట్స్ ఉండాలి
app.use('/jee-main', express.static(path.join(__dirname, 'jee-main')));
app.use('/jee-advanced', express.static(path.join(__dirname, 'jee-advanced')));
app.use('/tg-eapcet', express.static(path.join(__dirname, 'tg-eapcet')));
app.use('/ap-eapcet', express.static(path.join(__dirname, 'ap-eapcet')));
app.use('/ipe-2027', express.static(path.join(__dirname, 'ipe-2027')));

// Render Disk లో ఉన్న ఫైల్స్‌ను లింక్ చేయడం
app.use('/public-docs', express.static(path.join(__dirname)));

// డైనమిక్ పిడిఎఫ్ డౌన్‌లోడ్ రూట్
app.get('/:filename', (req, res, next) => {
    if (!req.params.filename.endsWith('.pdf')) return next();

    const pdfName = req.params.filename;
    
    // 1. మీ మెయిన్ కేటగిరీ ఫోల్డర్లు అన్నింటినీ ఇక్కడ యాడ్ చేసాం
    const categories = ['jee-main', 'jee-advanced', 'tg-eapcet', 'ap-eapcet', 'ipe-2027'];
    
    // 2. అప్లికేషన్ ఫామ్స్, హాల్ టికెట్లు, 1st year, 2nd year తో సహా అన్ని సబ్-పాత్‌లు
    const subPaths = [
        '',
        'admit-cards',
        'application-forms',
        path.join('application-forms', 'session-1'),
        path.join('application-forms', 'session-2'),
        'city-intimations',
        'rank-cards',
        '1st-year',                    // IPE 1st Year కోసం
        '2nd-year',                    // IPE 2nd Year కోసం
        path.join('1st-year', 'application-forms'),
        path.join('2nd-year', 'application-forms')
    ];

    // అన్ని ఫోల్డర్లలో ఒకదాని తర్వాత ఒకటి వెతికే లూప్
    for (let category of categories) {
        for (let subPath of subPaths) {
            const filePath = path.join(__dirname, category, subPath, pdfName);

            // ఏదైనా ఒక ఫోల్డర్ లోపల ఫైల్ దొరికితే వెంటనే డౌన్‌లోడ్ అవుతుంది
            if (fs.existsSync(filePath)) {
                return res.download(filePath);
            }
        }
    }

    // ఏ ఫోల్డర్ లోనూ ఫైల్ దొరక్కపోతే ఇది రన్ అవుతుంది
    res.status(404).send(`Cannot find file ${pdfName} in any folder or subfolder.`);
});

app.use(express.json());

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

app.use('/public-docs', express.static(path.join(__dirname)));
// Function to load and clean student data from Excel
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

// 🛠️ 1. పబ్లిక్ నోటీసుల PDF ఫైల్స్ డౌน์โหลด చేయడానికి సరికొత్త పవర్ ఫుల్ రూట్
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

// 📢 2. Public Notices డేటాను ఫ్రంటెండ్‌కు పంపే డైనమిక్ API రూట్
app.get('/{user.admissionNumber}.pdf', (req, res) => {
    const fileName = req.query.file || "notice1.pdf"; 
    const filePath = path.join(__dirname, 'public-docs', fileName);
    res.download(filePath, fileName);
});
// 1. Student Login Route
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

// 2. Document Fetch Route
app.post('/api/download-doc', (req, res) => {
    const { admissionNumber, examType, docType, subOption } = req.body;
    const reqAdmissionNum = String(admissionNumber || '').replace(/[^0-9]/g, '').trim();

    let filePath = "";

    if (examType === 'IPE-2027' || examType === 'IPE Hall Tickets') {
        let targetFolder = "";

        if (docType === 'form') {
            targetFolder = 'E:\\2026-27\\C Exams\\student-portal\\applications\\ipe-2027\\1st Year';
        } else if (docType === 'admit') {
            targetFolder = 'E:\\2026-27\\C Exams\\student-portal\\applications\\ipe-2027\\2nd Year';
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
// =========================================================================
// ─── 🚀 కొత్తగా జోడించిన JEE EVALUATOR API లాజిక్ (పాత కోడ్ అస్సలు మారలేదు) ───
// =========================================================================
function loadExcelAnswerKey(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`[Evaluator Error] Answer key file not found: ${filePath}`);
            return {};
        }
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const keyMap = {};

        sheetData.forEach(row => {
            const qId = row['Question ID']?.toString().trim();
            const dateKey = row['DATE']?.toString().trim();
            const shiftKey = row['SHIFT']?.toString().trim();

            if (qId && dateKey && shiftKey) {
                const uniqueKeys = [
                    row['OptionID1']?.toString().trim(),
                    row['OptionID2']?.toString().trim(),
                    row['OptionID3']?.toString().trim(),
                    row['OptionID4']?.toString().trim()
                ].filter(Boolean);

                const finalUniqueKeys = [...new Set(uniqueKeys)];
                const compositeKey = `${dateKey}_${shiftKey}_${qId}`;
                
                keyMap[compositeKey] = {
                    keys: finalUniqueKeys,
                    isDrop: finalUniqueKeys.some(k => k.toUpperCase() === 'DROP')
                };
            }
        });
        return keyMap;
    } catch (error) {
        console.error("Answer Key Excel లోడ్ చేయడంలో లోపం:", error);
        return {};
    }
}

// స్వతంత్ర ఎవాల్యుయేటర్ మెయిన్ API (టెక్స్ట్ బేస్డ్ సెక్షన్ ట్రాకర్ ఇంజిన్ - సబ్జెక్ట్ వైస్ మ్యాచింగ్ పక్కా ఫిక్స్)
app.post('/api/evaluate-sheet', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "రెస్పాన్స్ షీట్ URL అవసరం!" });

    try {
        // 1. రెస్పాన్స్ షీట్ HTML డౌన్‌లోడ్ చేయడం
        const response = await axios.get(url, { timeout: 15000 });
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
        
                // 🔄 [ఎక్సెల్ షీట్ నేమ్ బగ్ ఫిక్స్] - మీ పాత 3 లైన్ల స్థానంలో దీన్ని రీప్లేస్ చేయండి:
        const workbook = xlsx.readFile(excelPath);
        
        // ఎక్సెల్ లో ఏ పేరుతో ట్యాబ్ ఉన్నా (Sheet1 లేదా JEE Main), డేటా ఉన్న మొదటి షీట్ ని కరెక్ట్ గా పిక్ చేస్తుంది
        const targetSheetName = workbook.SheetNames.find(name => {
            const rows = xlsx.utils.sheet_to_json(workbook.Sheets[name]);
            return rows.length > 0; // డేటా ఖాళీగా లేని షీట్ ని వెతుకుతుంది
        }) || workbook.SheetNames[0];

        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[targetSheetName]);

        
        const MASTER_KEY_MAP = {};
        sheetData.forEach(row => {
            // మీ ఎక్సెల్ హెడర్ 'Question ID' ని పక్కాగా రీడ్ చేస్తుంది
            const rawQId = row['Question ID']?.toString().trim();
            if (rawQId) {
                // 🚨 మీ కొత్త ఎక్సెల్ హెడర్స్ (OptionID1, OptionID2...) లోపలి వాల్యూస్ ని పక్కాగా బైండ్ చేస్తుంది
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

        // సబ్జెక్ట్ వైస్ డేటా స్ట్రక్చర్
        let subjects = {
            Mathematics: { secAPositive: 0, secANegative: 0, secATotal: 0, secBPositive: 0, secBNegative: 0, secBTotal: 0, totalMarks: 0 },
            Physics: { secAPositive: 0, secANegative: 0, secATotal: 0, secBPositive: 0, secBNegative: 0, secBTotal: 0, totalMarks: 0 },
            Chemistry: { secAPositive: 0, secANegative: 0, secATotal: 0, secBPositive: 0, secBNegative: 0, secBTotal: 0, totalMarks: 0 }
        };

        let currentSub = "Mathematics";
        let isSectionB = false;

        // HTML లోపల ఉండే ప్రతి క్వశ్చన్ బాక్స్ లేదా హెడర్ టెక్స్ట్ బ్లాక్ ని లూప్ చేస్తాము
        $(".main-info-pnl, .section-start, .section-cnt, table, div").each((idx, el) => {
            const blockText = $(el).text() || "";
            // 🔍 రెస్పాన్స్ షీట్ టెక్స్ట్ ప్రవాహంలో సెక్షన్ హెడర్లు మారినప్పుడల్లా మన గ్లోబల్ స్టేట్ మారుతుంది!
            if (/Mathematics\s*Section\s*A/i.test(blockText)) {
                currentSub = "Mathematics";
                isSectionB = false;
            } else if (/Mathematics\s*Section\s*B/i.test(blockText)) {
                currentSub = "Mathematics";
                isSectionB = true;
            } else if (/Physics\s*Section\s*A/i.test(blockText)) {
                currentSub = "Physics";
                isSectionB = false;
            } else if (/Physics\s*Section\s*B/i.test(blockText)) {
                currentSub = "Physics";
                isSectionB = true;
            } else if (/Chemistry\s*Section\s*A/i.test(blockText)) {
                currentSub = "Chemistry";
                isSectionB = false;
            } else if (/Chemistry\s*Section\s*B/i.test(blockText)) {
                currentSub = "Chemistry";
                isSectionB = true;
            }

            // ఒకవేళ ఈ కరెంట్ ఎలిమెంట్ ఒక క్వశ్చన్ టేబుల్ అయితేనే లోపలి లాజిక్ రన్ అవుతుంది
            if ($(el).is('table') && blockText.includes("Question ID")) {
                let qId = "";
                let chosenOptionNum = "";
                let statusStr = "";
                let givenAnswerVal = "";
                let optionIdMap = {};

                $(el).find("tr").each((rIdx, rowEl) => {
                    const rowText = $(rowEl).text() || "";
                    
                    // 🚨 మీ server.js లో ఉన్న ఈ లైన్లని ఇలా మార్చండి:

if (rowText.includes("Question ID")) {
    const match = rowText.match(/Question\s*ID\s*:?\s*(\d+)/i); // 👈 : పక్కన ? పెట్టాము (కాలన్ ఉన్నా లేకున్నా రీడ్ చేస్తుంది)
    if (match && match[1]) qId = match[1].trim();
}
if (rowText.includes("Status")) {
    const match = rowText.match(/Status\s*:?\s*([^\n\r]+)/i); // 👈 :? పెట్టాము
    if (match && match[1]) statusStr = match[1].trim();
}
if (rowText.includes("Chosen Option")) {
    const match = rowText.match(/Chosen\s*Option\s*:?\s*(\d+)/i); // 👈 :? పెట్టాము
    if (match && match[1]) chosenOptionNum = match[1].trim();
}
if (rowText.includes("Given Answer")) {
    const match = rowText.match(/Given\s*Answer\s*:?\s*([^\n\r]+)/i); // 👈 :? పెట్టాము
    if (match && match[1]) givenAnswerVal = match[1].trim();
}
for (let i = 1; i <= 4; i++) {
    if (rowText.includes(`Option ${i} ID`)) {
        const regex = new RegExp(`Option\\s*${i}\\s*ID\\s*:?\\s*(\\d+)`, 'i'); // 👈 :? పెట్టాము
        const match = rowText.match(regex);
        if (match && match[1]) optionIdMap[i.toString()] = match[1].trim();
    }
}

                });

                if (!qId) return;

                let chosenAnswer = '--';
                let studentChosenNum = '--';
                let studentOptionId = '--';

                // 🚨 పక్కా రూల్: కేవలం 'Answered' స్టేటస్ ఉన్న ప్రశ్నలనే లెక్కించాలి, Marked For Review ని పూర్తిగా వదిలేయాలి!
                if (/^Answered$/i.test(statusStr)) {
                    if (isSectionB) {
                        chosenAnswer = givenAnswerVal;
                    } else if (chosenOptionNum) {
                        studentChosenNum = chosenOptionNum; 
                        if (optionIdMap[chosenOptionNum]) {
                            studentOptionId = optionIdMap[chosenOptionNum]; 
                        }
                    }
                }

                // 4. ఎక్సెల్ మాస్టర్ కీ లోని ఐడీలతో డైనమిక్ స్ట్రింగ్ మ్యాచింగ్
                let keyInfo = null;
                for (const excelQId in MASTER_KEY_MAP) {
                    if (qId === excelQId || qId.includes(excelQId) || excelQId.includes(qId)) {
                        keyInfo = MASTER_KEY_MAP[excelQId];
                        break;
                    }
                }

                if (!keyInfo) return; // మ్యాచ్ దొరక్కపోతే ప్రశ్నను వదిలేస్తుంది

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
                    subjects[currentSub].totalMarks += 4;
                    return;
                }

                // రూల్ B: అటెంప్ట్ చేయని ప్రశ్నలు (Unattempted)
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

                // రూల్ C: Numerical ప్రశ్నల కోసం ANY NON NEGATIVE INTEGER (0-9 range) లేదా డైరెక్ట్ మ్యాచ్ చెక్
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
                // రూల్ D: MCQ ప్రశ్నల కోసం Option ID వెరిఫికేషన్
                else {
                    isCorrect = keyInfo.keys.some(key => {
                        const cleanKey = key.toString().trim();
                        return cleanKey === studentOptionId || studentOptionId.includes(cleanKey);
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

        // ఫైనల్ సక్సెస్ రెస్పాన్స్ ఫ్రంటెండ్‌కు పంపడం
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
        res.status(500).json({ success: false, message: "రెస్పాన్స్ షీట్ లోపల డేటాను ఎవాల్యుయేట్ చేయడంలో లోపం వచ్చింది!" });
    }
});

// Start backend on safe local fallback address
app.listen(5000, () => console.log("Server is running perfectly on port 5000... KEEP THIS WINDOW OPEN"));
