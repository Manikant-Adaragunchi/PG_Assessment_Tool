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
