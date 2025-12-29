const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');

exports.generateBatchExcel = async (payload, res) => {
    const { interns, internMap, opdEvals, surgeryEvals, wetlabEvals, academicEvals } = payload;
    const workbook = new ExcelJS.Workbook();

    // --- SHEET 1: SUMMARY ---
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
        { header: 'Intern Name', key: 'name', width: 25 },
        { header: 'Reg No', key: 'regNo', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Total OPD', key: 'opdCount', width: 15 },
        { header: 'Total Surgery', key: 'surgeryCount', width: 15 },
        { header: 'Total WetLab', key: 'wetlabCount', width: 15 },
        { header: 'Total Academic', key: 'academicCount', width: 15 },
    ];

    // Create Maps for easier lookup by internId
    const opdMap = {};
    opdEvals.forEach(e => opdMap[e.internId.toString()] = e);

    const surgeryMap = {};
    surgeryEvals.forEach(e => surgeryMap[e.internId.toString()] = e);

    const wetlabMap = {};
    wetlabEvals.forEach(e => wetlabMap[e.internId.toString()] = e);

    const academicMap = {};
    academicEvals.forEach(e => academicMap[e.internId.toString()] = e);

    // Iterate Sorted Interns to populate Summary Sheet
    interns.forEach(intern => {
        const opdDoc = opdMap[intern._id.toString()];
        const surgeryDoc = surgeryMap[intern._id.toString()];
        const wetlabDoc = wetlabMap[intern._id.toString()];
        const academicDoc = academicMap[intern._id.toString()];

        const opdCount = opdDoc ? opdDoc.attempts.length : 0;
        const surgeryCount = surgeryDoc ? surgeryDoc.attempts.length : 0;
        const wetlabCount = wetlabDoc ? wetlabDoc.attempts.length : 0;
        const academicCount = academicDoc ? academicDoc.attempts.length : 0;

        summarySheet.addRow({
            name: intern.fullName,
            regNo: intern.regNo || 'N/A',
            email: intern.email,
            opdCount, surgeryCount, wetlabCount, academicCount
        });
    });

    // --- SHEET 2: OPD LOGS ---
    const opdSheet = workbook.addWorksheet('OPD Logs');
    opdSheet.columns = [
        { header: 'Intern Name', key: 'intern', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Module ID', key: 'moduleId', width: 25 }, // Added Module ID
        { header: 'Procedure', key: 'procedure', width: 25 },
        { header: 'Result', key: 'result', width: 10 },
        { header: 'Score/Status', key: 'status', width: 15 },
        { header: 'Faculty', key: 'faculty', width: 20 },
    ];

    interns.forEach(intern => {
        const doc = opdEvals.find(e => e.internId.toString() === intern._id.toString());
        if (!doc || !doc.attempts) return;

        doc.attempts.forEach(att => {
            opdSheet.addRow({
                intern: intern.fullName,
                date: new Date(att.attemptDate).toLocaleDateString(),
                moduleId: doc.moduleCode || 'OPD',
                procedure: att.procedureName || 'General',
                result: att.result,
                status: att.status,
                faculty: att.facultyId ? att.facultyId.fullName : 'N/A'
            });
        });
        // Visual break
        opdSheet.addRow({});
    });

    // --- SHEET 3: SURGERY LOGS ---
    const surgerySheet = workbook.addWorksheet('Surgery Logs');
    surgerySheet.columns = [
        { header: 'Intern Name', key: 'intern', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Module ID', key: 'moduleId', width: 25 }, // Added Module ID
        { header: 'Surgery', key: 'surgery', width: 25 },
        { header: 'Patient', key: 'patient', width: 20 },
        { header: 'Total Marks', key: 'score', width: 15 }, // Renamed to Total Marks
        { header: 'Grade', key: 'grade', width: 15 },
        { header: 'Faculty', key: 'faculty', width: 20 }, // Added Faculty
        { header: 'Remarks', key: 'remarks', width: 30 },
    ];

    interns.forEach(intern => {
        const doc = surgeryEvals.find(e => e.internId.toString() === intern._id.toString());
        if (!doc || !doc.attempts) return;

        doc.attempts.forEach(att => {
            const total = att.totalScore || (att.answers ? att.answers.reduce((s, a) => s + (a.scoreValue || 0), 0) : 0);
            surgerySheet.addRow({
                intern: intern.fullName,
                date: new Date(att.attemptDate || att.date).toLocaleDateString(),
                moduleId: doc.moduleCode || 'SURGERY',
                surgery: att.surgeryName || 'Unknown',
                patient: att.patientName || att.patientId,
                score: total,
                grade: att.grade,
                faculty: att.facultyId ? att.facultyId.fullName : 'N/A',
                remarks: att.remarksOverall || att.remarks
            });
        });
        // Visual break
        surgerySheet.addRow({});
    });

    // --- SHEET 4: WET LAB ---
    const wetlabSheet = workbook.addWorksheet('Wet Lab Logs');
    wetlabSheet.columns = [
        { header: 'Intern Name', key: 'intern', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Module ID', key: 'moduleId', width: 20 }, // Added
        { header: 'Exercise', key: 'exercise', width: 25 },
        { header: 'Total Marks', key: 'score', width: 15 },
        { header: 'Grade', key: 'grade', width: 15 },
    ];

    interns.forEach(intern => {
        const doc = wetlabEvals.find(e => e.internId.toString() === intern._id.toString());
        if (!doc || !doc.attempts) return;

        doc.attempts.forEach(att => {
            wetlabSheet.addRow({
                intern: intern.fullName,
                date: new Date(att.date || doc.createdAt).toLocaleDateString(),
                moduleId: doc.moduleCode || 'WETLAB',
                exercise: att.exerciseName || att.topicName,
                score: att.totalScore,
                grade: att.grade,
                faculty: att.facultyId ? att.facultyId.fullName : 'N/A'
            });
        });
        // Visual break
        wetlabSheet.addRow({});
    });

    // --- SHEET 5: ACADEMICS ---
    const academicSheet = workbook.addWorksheet('Academic Logs');
    academicSheet.columns = [
        { header: 'Intern Name', key: 'intern', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Module ID', key: 'moduleId', width: 20 }, // Added
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Topic', key: 'topic', width: 25 },
        { header: 'Total Marks', key: 'score', width: 15 },
        { header: 'Grade', key: 'grade', width: 15 },
    ];

    interns.forEach(intern => {
        const doc = academicEvals.find(e => e.internId.toString() === intern._id.toString());
        if (!doc || !doc.attempts) return;

        doc.attempts.forEach(att => {
            academicSheet.addRow({
                intern: intern.fullName,
                date: new Date(att.date || doc.createdAt).toLocaleDateString(),
                moduleId: doc.moduleCode || 'ACADEMIC',
                type: att.evaluationType,
                topic: att.topic || att.topicName,
                score: att.scores ? Object.values(att.scores).reduce((a, b) => a + b, 0) : 0,
                grade: att.grade || 'N/A',
                faculty: att.facultyId ? att.facultyId.fullName : 'N/A'
            });
        });
        // Visual break
        academicSheet.addRow({});
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Batch_Comprehensive_Report.xlsx');

    await workbook.xlsx.write(res);
};

exports.generateInternPDF = (internData, surgeryAttempts, opdAttempts, res) => {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${internData.fullName}_Report.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Intern Assessment Record', { align: 'center' });
    doc.moveDown();

    // Info
    doc.fontSize(12).text(`Name: ${internData.fullName}`);
    doc.text(`Email: ${internData.email}`);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown(2);

    // Surgery Section
    doc.fontSize(16).text('Surgery Module Logs', { underline: true });
    doc.moveDown();

    if (surgeryAttempts.length === 0) {
        doc.fontSize(12).text('No records found.', { oblique: true });
    } else {
        surgeryAttempts.forEach((att, i) => {
            doc.fontSize(12).font('Helvetica-Bold').text(`Attempt ${att.attemptNumber} - ${new Date(att.date).toLocaleDateString()}`);
            doc.font('Helvetica').text(`Module: ${att.surgeryName || 'SURGERY'}`); // Added Module ID
            doc.text(`Status: ${att.status}`);

            // Calc Score
            const total = att.totalScore || (att.answers ? att.answers.reduce((s, a) => s + (a.scoreValue || 0), 0) : 0);
            doc.text(`Total Marks: ${total}`, { underline: true }); // Added Total Marks
            doc.text(`Grade: ${att.grade || 'N/A'}`);
            doc.text(`Faculty: ${att.facultyId ? att.facultyId.fullName : 'N/A'}`); // Added Faculty

            doc.text(`Remarks: ${att.remarks || att.remarksOverall || 'None'}`);
            doc.moveDown(0.5);
        });
    }

    doc.moveDown(2);

    // OPD Section
    doc.fontSize(16).text('OPD Competency Logs', { underline: true });
    doc.moveDown();

    // OPD Section (Simplified for PDF)
    // Note: OPD typically doesn't have "marks" but Result/Grade. If requested, we can show Grade.
    if (opdAttempts.length === 0) {
        doc.fontSize(12).text('No records found.', { oblique: true });
    } else {
        opdAttempts.forEach((att, i) => {
            doc.fontSize(12).font('Helvetica-Bold').text(`Attempt ${att.attemptNumber} - ${new Date(att.date || att.attemptDate).toLocaleDateString()}`);
            doc.font('Helvetica').text(`Module: ${att.procedureName || 'OPD'}`);
            doc.text(`Result: ${att.result}`);
            doc.text(`Grade: ${att.grade}`); // Added Grade/Status
            doc.text(`Faculty: ${att.facultyId ? att.facultyId.fullName : 'N/A'}`); // Added Faculty
            doc.moveDown(0.5);
        });
    }

    doc.end();
};
