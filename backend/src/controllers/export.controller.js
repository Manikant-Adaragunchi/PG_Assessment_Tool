const User = require('../models/User');
const SurgeryEvaluation = require('../models/SurgeryEvaluation');
const OpdEvaluation = require('../models/OpdEvaluation');
const WetlabEvaluation = require('../models/WetlabEvaluation');
const AcademicEvaluation = require('../models/AcademicEvaluation');
const exportService = require('../services/export.service');

exports.exportBatchExcel = async (req, res) => {
    try {
        const { batchId } = req.params;

        // 1. Fetch Interns in Batch
        // Handle 'all' or specific batch logic if needed, but assuming valid batchId
        // If batchId is provided, filter by it. If mocking or simplified, just find all interns.
        // Assuming strict batch filtering:
        const interns = await User.find({ role: 'INTERN', batchId: batchId })
            .select('fullName regNo email batchId')
            .populate('batchId', 'name');

        if (interns.length === 0) {
            return res.status(404).json({ error: 'No interns found in this batch' });
        }

        const internIds = interns.map(i => i._id);

        // 2. Fetch All Evaluations for these Interns
        const [opdEvals, surgeryEvals, wetlabEvals, academicEvals] = await Promise.all([
            OpdEvaluation.find({ internId: { $in: internIds } }),
            SurgeryEvaluation.find({ internId: { $in: internIds } }),
            WetlabEvaluation.find({ internId: { $in: internIds } }),
            AcademicEvaluation.find({ internId: { $in: internIds } })
        ]);

        // 3. Map Evaluations by InternId for easier access (optional) or just pass arrays
        // Actually, passing arrays is fine, service can iterate or we pass mapped data.
        // Let's pass the raw arrays to service and let it flatten them for the report.
        // But we need to link intern names to attempts.
        // Helper to map internId -> Intern details
        const internMap = {};
        interns.forEach(i => internMap[i._id.toString()] = i);

        await exportService.generateBatchExcel({ interns, internMap, opdEvals, surgeryEvals, wetlabEvals, academicEvals }, res);

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: 'Export failed: ' + error.message });
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
