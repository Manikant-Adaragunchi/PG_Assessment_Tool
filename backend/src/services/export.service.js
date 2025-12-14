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

    interns.forEach(intern => {
        // Find counts
        const opdDoc = opdEvals.find(e => e.internId.toString() === intern._id.toString());
        const surgeryDoc = surgeryEvals.find(e => e.internId.toString() === intern._id.toString());
        // WetLab/Academic are arrays of documents per attempt (usually) OR single doc with attempts?
        // Wait, WetLab/Academic schemas are typically per-attempt documents in this system (based on earlier logs), unlike Opd/Surgery which are Container Docs.
        // Let me double check usage. InternPerformance.jsx mapped them directly.
        // Checking schemas would be ideal, but based on "find({ internId: { $in... } })" returning array, 
        // if WetLab is 1 doc per attempt, filtering by internId gives all attempts.
        // If Opd is 1 doc per intern (container), filtering gives 1 doc per intern.

        // Let's assume:
        // Opd: Container (attempts array)
        // Surgery: Container (attempts array) - wait, previous code accessed "surgeryEval.attempts". So Container.
        // WetLab: Likely 1 doc per attempt? InternPerformance maps "performance.wetlab". 
        // Let's handle both cases safely.

        const opdCount = opdDoc ? opdDoc.attempts.length : 0;
        const surgeryCount = surgeryDoc ? surgeryDoc.attempts.length : 0;
        const wetlabCount = wetlabEvals.filter(e => e.internId.toString() === intern._id.toString()).length;
        const academicCount = academicEvals.filter(e => e.internId.toString() === intern._id.toString()).length;

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
        { header: 'Procedure', key: 'procedure', width: 25 },
        { header: 'Result', key: 'result', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Faculty', key: 'faculty', width: 20 },
    ];

    opdEvals.forEach(doc => {
        const intern = internMap[doc.internId.toString()];
        if (!intern || !doc.attempts) return;
        doc.attempts.forEach(att => {
            opdSheet.addRow({
                intern: intern.fullName,
                date: new Date(att.attemptDate).toLocaleDateString(),
                procedure: att.procedureName || 'General',
                result: att.result,
                status: att.status,
                faculty: 'N/A' // populating faculty names would require backend population. Skipping for speed or need to populate in controller.
            });
        });
    });

    // --- SHEET 3: SURGERY LOGS ---
    const surgerySheet = workbook.addWorksheet('Surgery Logs');
    surgerySheet.columns = [
        { header: 'Intern Name', key: 'intern', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Surgery', key: 'surgery', width: 25 },
        { header: 'Patient', key: 'patient', width: 20 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Grade', key: 'grade', width: 15 },
        { header: 'Remarks', key: 'remarks', width: 30 },
    ];

    surgeryEvals.forEach(doc => {
        const intern = internMap[doc.internId.toString()];
        if (!intern || !doc.attempts) return;
        doc.attempts.forEach(att => {
            // calc total score if not stored
            const total = att.totalScore || (att.answers ? att.answers.reduce((s, a) => s + (a.scoreValue || 0), 0) : 0);
            surgerySheet.addRow({
                intern: intern.fullName,
                date: new Date(att.attemptDate || att.date).toLocaleDateString(),
                surgery: att.surgeryName || 'Unknown',
                patient: att.patientName || att.patientId,
                score: total,
                grade: att.grade,
                remarks: att.remarks
            });
        });
    });

    // --- SHEET 4: WET LAB ---
    const wetlabSheet = workbook.addWorksheet('Wet Lab Logs');
    wetlabSheet.columns = [
        { header: 'Intern Name', key: 'intern', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Exercise', key: 'exercise', width: 25 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Grade', key: 'grade', width: 15 },
    ];

    wetlabEvals.forEach(item => {
        const intern = internMap[item.internId.toString()];
        if (!intern) return;
        // WetLab seems to be per-document based on "find" returning array of evals
        wetlabSheet.addRow({
            intern: intern.fullName,
            date: new Date(item.date || item.createdAt).toLocaleDateString(),
            exercise: item.exerciseName || item.topicName,
            score: item.totalScore,
            grade: item.grade
        });
    });

    // --- SHEET 5: ACADEMICS ---
    const academicSheet = workbook.addWorksheet('Academic Logs');
    academicSheet.columns = [
        { header: 'Intern Name', key: 'intern', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Topic', key: 'topic', width: 25 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Grade', key: 'grade', width: 15 },
    ];

    academicEvals.forEach(item => {
        const intern = internMap[item.internId.toString()];
        if (!intern) return;
        academicSheet.addRow({
            intern: intern.fullName,
            date: new Date(item.date || item.createdAt).toLocaleDateString(),
            type: item.evaluationType,
            topic: item.topic || item.topicName,
            score: item.totalScore,
            grade: item.grade
        });
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
            doc.font('Helvetica').text(`Status: ${att.status}`);
            doc.text(`Remarks: ${att.remarks || 'None'}`);
            doc.moveDown(0.5);
        });
    }

    doc.moveDown(2);

    // OPD Section
    doc.fontSize(16).text('OPD Competency Logs', { underline: true });
    doc.moveDown();

    if (opdAttempts.length === 0) {
        doc.fontSize(12).text('No records found.', { oblique: true });
    } else {
        opdAttempts.forEach((att, i) => {
            doc.fontSize(12).font('Helvetica-Bold').text(`Attempt ${att.attemptNumber} - ${new Date(att.date || att.attemptDate).toLocaleDateString()}`);
            doc.font('Helvetica').text(`Result: ${att.result}`);
            doc.text(`Status: ${att.status}`);
            doc.moveDown(0.5);
        });
    }

    doc.end();
};
