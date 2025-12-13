const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');

exports.generateBatchExcel = async (batchData, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Batch Report');

    // Headers
    worksheet.columns = [
        { header: 'Intern Name', key: 'name', width: 30 },
        { header: 'Reg No', key: 'regNo', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Role', key: 'role', width: 15 },
        // Add more summary cols if needed
    ];

    // Data
    batchData.forEach(intern => {
        worksheet.addRow({
            name: intern.fullName,
            regNo: intern.regNumber || 'N/A',
            email: intern.email,
            role: intern.role
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Batch_Report.xlsx');

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
