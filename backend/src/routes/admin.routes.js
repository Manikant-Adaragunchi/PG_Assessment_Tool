const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createBatch, getBatches, createFaculty, getFaculty, getDashboardStats } = require('../controllers/admin.controller');
const { exportBatchExcel, exportInternReport } = require('../controllers/export.controller');

// Apply protect middleware to all routes
router.use(protect);

// Dashboard Stats - Accessible to HOD and Faculty (if needed, or keep HOD only)
router.get('/stats', authorize('HOD'), getDashboardStats);

// Faculty Management - HOD Only
router.post('/faculty', authorize('HOD'), createFaculty);
router.get('/faculty', authorize('HOD'), getFaculty);
router.put('/faculty/:id', authorize('HOD'), require('../controllers/admin.controller').updateFaculty);
router.delete('/faculty/:id', authorize('HOD'), require('../controllers/admin.controller').deleteFaculty);

// Intern Management
// Get Interns - Accessible to HOD and FACULTY
router.get('/interns', authorize('HOD', 'FACULTY'), require('../controllers/admin.controller').getInterns);

// Batch Management - HOD Only
router.post('/batches', authorize('HOD'), createBatch);
router.get('/batches', authorize('HOD'), getBatches);
router.delete('/batches/:id', authorize('HOD'), require('../controllers/admin.controller').deleteBatch);

// Exports - HOD Only
router.get('/export/batch/:batchId', authorize('HOD'), exportBatchExcel); // Excel
router.get('/export/intern/:internId', authorize('HOD'), exportInternReport); // PDF

module.exports = router;
