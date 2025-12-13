const User = require('../models/User');
const SurgeryEvaluation = require('../models/SurgeryEvaluation');
const OpdEvaluation = require('../models/OpdEvaluation');
const exportService = require('../services/export.service');

exports.exportBatchExcel = async (req, res) => {
    try {
        const { batchId } = req.params;
        // In a real scenario, we'd filter by batchId. 
        // For demo, we just get all INTERNS
        const interns = await User.find({ role: 'INTERN' });

        await exportService.generateBatchExcel(interns, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Export failed' });
    }
};

exports.exportInternReport = async (req, res) => {
    try {
        const { internId } = req.params;
        const intern = await User.findById(internId);

        if (!intern) return res.status(404).json({ error: 'Intern not found' });

        // Fetch Data
        const surgeryEval = await SurgeryEvaluation.findOne({ internId });
        const opdEval = await OpdEvaluation.findOne({ internId }); // Assuming generic or specific one

        const surgeryAttempts = surgeryEval ? surgeryEval.attempts : [];
        const opdAttempts = opdEval ? opdEval.attempts : [];

        await exportService.generateInternPDF(intern, surgeryAttempts, opdAttempts, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'PDF Generation failed' });
    }
};
