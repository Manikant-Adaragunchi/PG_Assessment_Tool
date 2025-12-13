const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Route to get full performance history of a student
// Only accessible by admin (HOD)
router.get('/:studentId', protect, authorize('HOD'), performanceController.getInternPerformance);

module.exports = router;
