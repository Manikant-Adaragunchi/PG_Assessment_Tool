const User = require('../models/User');
const SurgeryEvaluation = require('../models/SurgeryEvaluation');
const OpdCompetency = require('../models/OpdCompetency');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('batchId');

        // Fetch Pending Acknowledgements Count
        // Simplified: just return user for now

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

};

exports.validateIntern = async (req, res) => {
    try {
        const { identifier } = req.params;
        // Search by mongo _id OR registrationNumber (exact match)
        let user;
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(identifier).populate('batchId', 'name');
        } else {
            user = await User.findOne({ regNo: identifier }).populate('batchId', 'name');
        }

        if (!user || user.role !== 'INTERN') {
            return res.status(404).json({ success: false, error: 'Intern not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.fullName,
                regNo: user.regNo,
                batch: user.batchId ? user.batchId.name : 'Unassigned'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
