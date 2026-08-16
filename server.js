const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); 
const app = express();
app.use('/jee-main', express.static(path.join(__dirname, 'jee-main')));
app.use('/jee-advanced', express.static(path.join(__dirname, 'jee-advanced')));
app.use('/tg-eapcet', express.static(path.join(__dirname, 'tg-eapcet')));
app.use('/ap-eapcet', express.static(path.join(__dirname, 'ap-eapcet')));
app.use('/ipe-2027', express.static(path.join(__dirname, 'ipe-2027')));
// 👇 ఇక్కడి నుండి కోడ్‌ను కాపీ చేసి మీ server.js లో యాడ్ చేయండి
app.get('/:filename.pdf', (req, res) => {
    const filename = req.params.filename; // ఇందులో అడ్మిషన్ ఐడీ (ఉదా: 257000063) వస్తుంది
    const pdfName = `${filename}.pdf`;

    // మనం వెతకాల్సిన ఫోల్డర్ల లిస్ట్
    const categories = ['jee-main', 'jee-advanced', 'tg-eapcet', 'ap-eapcet', 'ipe-2027'];

    // ప్రతి ఫోల్డర్ లోనూ ఆ ఫైల్ ఉందేమో సర్వర్ వెతుకుతుంది
    for (let category of categories) {
        const filePath = path.join(__dirname, category, pdfName);
        
        if (fs.existsSync(filePath)) {
            // ఫైల్ దొరికితే ఇక్కడి నుండే డౌన్‌లోడ్ అవుతుంది
            return res.download(filePath); 
        }
    }

    // ఏ ఫోల్డర్ లోనూ ఫైల్ దొరకకపోతే ఈ ఎర్రర్ చూపిస్తుంది
    res.status(404).send(`Cannot find file ${pdfName} in any department folder.`);
});
// 👆 ఇక్కడి వరకూ యాడ్ చేయండి
app.use(express.json());

// Enable CORS for frontend connectivity
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept']
}));
// Render Disk లో ఉన్న ఫైల్స్‌ను లింక్ చేయడం
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
        const sheetName = workbook.SheetNames[0]; // Selects the first sheet
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        // Sanitize data by converting numbers to clean string formats
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
// 🛠️ 1. పబ్లిక్ నోటీసుల PDF ఫైల్స్ డౌน์โหลด చేయడానికి సరికొత్త పవర్ ఫుల్ రూట్ (Cannot GET ఎర్రర్ కి శాశ్వత పరిష్కారం)
app.get('/public-docs/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    // మీ సిస్టమ్ పాత్ ఇక్కడ పక్కాగా సెట్ చేయబడింది
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
// ఫ్రంటెండ్‌లో తప్పుడు లింక్ ఉన్నా సరే, దీన్ని కరెక్ట్ చేసి డౌన్‌లోడ్ చేసే కొత్త కోడ్
app.get('/{user.admissionNumber}.pdf', (req, res) => {
    // లాగిన్ అయిన యూజర్ అడ్మిషన్ నెంబర్‌ను మీ ఎక్సెల్ లేదా రిక్వెస్ట్ నుండి వెతకడం
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
// 2. Document Fetch Route (Both IPE-2027 and JEE Main suboptions fixed for Admission Number format)
app.post('/api/download-doc', (req, res) => {
    const { admissionNumber, examType, docType, subOption } = req.body;
    const reqAdmissionNum = String(admissionNumber || '').replace(/[^0-9]/g, '').trim();
    
    let filePath = "";

    // 🟦 A. కేవలం IPE-2027 లేదా IPE Hall Tickets కోసం మీ క్లీన్ లాజిక్
    if (examType === 'IPE-2027' || examType === 'IPE Hall Tickets') {
        let targetFolder = "";

        if (docType === 'form') {
            targetFolder = 'E:\\2026-27\\C Exams\\student-portal\\applications\\ipe-2027\\1st Year';
        } else if (docType === 'admit') {
            targetFolder = 'E:\\2026-27\\C Exams\\student-portal\\applications\\ipe-2027\\2nd Year';
        }

        // కేవలం అడ్మిషన్ నంబర్ పిడిఎఫ్ ని మాత్రమే తీసుకుంటుంది (ఉదాహరణ: 257000063.pdf)
        filePath = path.join(targetFolder, `${reqAdmissionNum}.pdf`);
        console.log(`[File Request - IPE Fixed] Looking for: ${filePath}`);

    } else {
        // 🟩 B. మీ పాత ఒరిజినల్ కోడ్ (JEE Main లో కూడా కేవలం అడ్మిషన్ నంబర్ ఉండేలా అప్‌డేట్ చేయబడింది)
        let examFolder = 'jee-main';
        if (examType === 'JEE Advanced') examFolder = 'jee-advanced';
        if (examType === 'TG EAPCET') examFolder = 'tg-eapcet';
        if (examType === 'AP EAPCET') examFolder = 'ap-eapcet';
        if (examType === 'IPE Hall Tickets') examFolder = 'ipe-hall-tickets';

        let docFolder = 'application-forms';
        if (docType === 'city') docFolder = 'city-intimations';
        if (docType === 'admit' || docType === 'hall') docFolder = 'admit-cards';
        if (docType === 'score') docFolder = 'rank-cards';

            // 🌟 JEE Main లోని అన్ని డాక్యుమెంట్లకూ (Form, City, Admit, Score) సెషన్ ఫోల్డర్ పక్కాగా లింక్ అవుతుంది
    if (examType === 'JEE Main' && subOption) {
        docFolder = path.join(docFolder, subOption);
    }


        // 🌟 JEE Main లో పాత సఫిక్స్ తీసేసి కేవలం అడ్మిషన్ నంబర్ ఫార్మాట్ మాత్రమే వెతికేలా చేసాము (ఉదాహరణ: 257000063.pdf)
        let fileName = `${reqAdmissionNum}.pdf`; 

        // ఒకవేళ మీ JEE Main ఫోల్డర్ స్ట్రక్చర్ లో కూడా సెషన్స్ కి విడివిడి సబ్-ఫోల్డర్స్ ఉంటే, 
        // వాటిని మీ ప్రాజెక్ట్ అవసరానికి తగినట్లుగా 'docFolder' కింద మేనేజ్ చేసుకోవచ్చు.
        filePath = path.join(__dirname, 'applications', examFolder, docFolder, fileName);
        console.log(`[File Request] Looking for: applications/${examFolder}/${docFolder}/${fileName}`);
    }

    // 🔍 మీ పాత ఫైల్ వెరిఫికేషన్ మరియు సెండింగ్ లాజిక్ అలాగే ఉంది
    if (!fs.existsSync(filePath)) {
        console.log(`[File Not Found] Path does not exist: ${filePath}`);
        return res.status(404).json({ error: "Requested document file is not available on the server!" });
    }

    res.sendFile(filePath);
});

// Start backend on safe local fallback address
app.listen(5000, () => console.log("Server is running perfectly on port 5000... KEEP THIS WINDOW OPEN"));
