const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const surgeryController = require('../controllers/surgery.controller');
const opdController = require('../controllers/opd.controller');
const internController = require('../controllers/intern.controller'); // For acknowledge

router.use(protect);

// Surgery Routes
router.post('/surgery/:internId/attempts', authorize('FACULTY', 'HOD'), surgeryController.addAttempt);
router.put('/surgery/:internId/attempts/:attemptNumber', authorize('FACULTY', 'HOD'), surgeryController.editAttempt);
router.get('/surgery/:internId', surgeryController.getAttempts); // Intern can access too

// OPD Routes
router.post('/opd/:moduleCode/:internId/attempts', authorize('FACULTY', 'HOD'), opdController.addAttempt);
router.post('/opd/:moduleCode/:internId/attempts/:attemptNumber/acknowledge', authorize('INTERN'), opdController.acknowledgeAttempt);
router.get('/opd/:moduleCode/:internId', opdController.getAttempts);

// Academic Routes
const academicController = require('../controllers/academic.controller');
router.post('/academic/:internId/attempts', authorize('FACULTY', 'HOD'), academicController.addAttempt);
router.get('/academic/:internId', academicController.getAttempts);

// WetLab Routes
const wetlabController = require('../controllers/wetlab.controller');
router.post('/wetlab/:internId/attempts', authorize('FACULTY', 'HOD'), wetlabController.addAttempt);
router.get('/wetlab/:internId', wetlabController.getAttempts);

module.exports = router;
