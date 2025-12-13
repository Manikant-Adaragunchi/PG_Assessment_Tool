const OpdEvaluation = require('../models/OpdEvaluation');
const WetlabEvaluation = require('../models/WetlabEvaluation');
const SurgeryEvaluation = require('../models/SurgeryEvaluation');
const AcademicEvaluation = require('../models/AcademicEvaluation');
const User = require('../models/User');

exports.getInternPerformance = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Verify student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // 1. OPD Evaluations (Aggregate attempts)
        const opdDocs = await OpdEvaluation.find({ internId: studentId })
            .populate('attempts.facultyId', 'firstName lastName')
            .populate('attempts.acknowledgedBy.userId', 'firstName lastName')
            .lean();

        const opdAttempts = [];
        opdDocs.forEach(doc => {
            if (doc.attempts && doc.attempts.length > 0) {
                doc.attempts.forEach(attempt => {
                    // Filter out TEMPORARY if needed, but for admin let's show submitted ones
                    if (attempt.status !== 'TEMPORARY') {
                        opdAttempts.push({
                            _id: attempt._id,
                            moduleCode: doc.moduleCode,
                            attemptDate: attempt.attemptDate,
                            status: attempt.status,
                            result: attempt.result,
                            faculty: attempt.facultyId ? `${attempt.facultyId.firstName} ${attempt.facultyId.lastName}` : 'Unknown',
                            // Add other fields as needed
                            createdAt: attempt.createdAt
                        });
                    }
                });
            }
        });

        // 2. Wetlab Evaluations
        const wetlabDocs = await WetlabEvaluation.find({ internId: studentId })
            .populate('attempts.facultyId', 'firstName lastName')
            .lean();

        const wetlabEvaluations = [];
        wetlabDocs.forEach(doc => {
            if (doc.attempts && doc.attempts.length > 0) {
                doc.attempts.forEach(attempt => {
                    if (attempt.status !== 'TEMPORARY') {
                        wetlabEvaluations.push({
                            _id: attempt._id,
                            moduleCode: 'WETLAB',
                            exerciseName: attempt.exerciseName,
                            totalScore: attempt.totalScore,
                            grade: attempt.grade,
                            status: attempt.status,
                            faculty: attempt.facultyId ? `${attempt.facultyId.firstName} ${attempt.facultyId.lastName}` : 'Unknown',
                            createdAt: attempt.date || attempt.createdAt
                        });
                    }
                });
            }
        });

        // 3. Surgery Evaluations (Aggregate attempts)
        const surgeryDocs = await SurgeryEvaluation.find({ internId: studentId })
            .populate('attempts.facultyId', 'firstName lastName')
            .lean();

        const surgeryAttempts = [];
        surgeryDocs.forEach(doc => {
            if (doc.attempts && doc.attempts.length > 0) {
                doc.attempts.forEach(attempt => {
                    if (attempt.status !== 'TEMPORARY') {
                        surgeryAttempts.push({
                            _id: attempt._id,
                            moduleCode: doc.moduleCode, // SURGERY
                            attemptDate: attempt.attemptDate,
                            surgeryName: attempt.surgeryName,
                            patientName: attempt.patientName,
                            totalScore: attempt.totalScore,
                            grade: attempt.grade,
                            status: attempt.status,
                            faculty: attempt.facultyId ? `${attempt.facultyId.firstName} ${attempt.facultyId.lastName}` : 'Unknown',
                            createdAt: attempt.createdAt
                        });
                    }
                });
            }
        });

        // 4. Academic Evaluations
        const academicDocs = await AcademicEvaluation.find({ internId: studentId })
            .populate('attempts.facultyId', 'firstName lastName')
            .lean();

        const academicEvaluations = [];
        academicDocs.forEach(doc => {
            if (doc.attempts && doc.attempts.length > 0) {
                doc.attempts.forEach(attempt => {
                    if (attempt.status !== 'TEMPORARY') {
                        academicEvaluations.push({
                            _id: attempt._id,
                            moduleCode: 'ACADEMIC',
                            evaluationType: attempt.evaluationType,
                            topic: attempt.topic, // topic is used in new schema
                            status: attempt.status,
                            faculty: attempt.facultyId ? `${attempt.facultyId.firstName} ${attempt.facultyId.lastName}` : 'Unknown',
                            createdAt: attempt.date || attempt.createdAt
                        });
                    }
                });
            }
        });

        res.status(200).json({
            student: {
                _id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                registrationNumber: student.registrationNumber,
                batch: student.batch
            },
            performance: {
                opd: opdAttempts,
                wetlab: wetlabEvaluations,
                surgery: surgeryAttempts,
                academic: academicEvaluations
            }
        });

    } catch (error) {
        console.error('Error fetching student performance:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
