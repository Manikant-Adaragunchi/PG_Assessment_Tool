const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const Batch = require('../models/Batch');
const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');
const emailService = require('../services/email.service');

// Helper to generate 8-char random alphanumeric code
const generateCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

exports.createFaculty = async (req, res) => {
    try {
        const { fullName, email } = req.body;

        // Generate unique onboarding code
        const onboardingCode = generateCode();

        // Create with generated code
        const user = await User.create({
            fullName,
            email,
            password: onboardingCode, // Will be hashed by pre-save hook
            role: 'FACULTY'
        });

        // Send Email (Async)
        await emailService.sendOnboardingEmail(email, onboardingCode, 'FACULTY', fullName);

        // Audit Log
        await AuditLog.create({
            userId: req.user._id,
            action: 'CREATE_FACULTY',
            targetType: 'User',
            targetId: user._id,
            meta: { createdEmail: email }
        });

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        logger.error('Create Faculty Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};



exports.createBatch = async (req, res) => {
    try {
        const { name, startDate, interns } = req.body;

        if (!interns || interns.length !== 4) {
            return res.status(400).json({ success: false, error: 'Batch must have exactly 4 interns' });
        }

        // 1. Create Batch first (without interns)
        const batch = new Batch({
            name,
            startDate,
            interns: []
        });
        await batch.save();

        const createdInterns = [];

        try {
            // 2. Create Users linked to Batch
            for (const internData of interns) {
                const { fullName, email, regNo } = internData;

                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    throw new Error(`User with email ${email} already exists`);
                }

                const onboardingCode = generateCode();

                const user = await User.create({
                    fullName,
                    email,
                    role: 'INTERN',
                    regNo,
                    batchId: batch._id,
                    password: onboardingCode
                });

                // Send Email (Non-blocking)
                emailService.sendOnboardingEmail(email, onboardingCode, 'INTERN', fullName).catch(e => logger.error('Email Fail', e));

                createdInterns.push({
                    userId: user._id,
                    fullName,
                    email,
                    regNo
                });
            }

            // 3. Update Batch with created interns
            batch.interns = createdInterns;
            await batch.save();

            await AuditLog.create({
                userId: req.user._id,
                action: 'CREATE_BATCH',
                targetType: 'Batch',
                targetId: batch._id,
                meta: { batchName: name }
            });

            res.status(201).json({ success: true, data: batch });

        } catch (innerError) {
            // Rollback: Delete batch and any created users
            await Batch.findByIdAndDelete(batch._id);
            await User.deleteMany({ batchId: batch._id });
            throw innerError;
        }

    } catch (error) {
        logger.error('Create Batch Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getBatches = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate('interns.userId', 'fullName email regNo isActive') // Populate the userId field within the interns array
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: batches });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await Batch.findById(id);

        if (!batch) {
            return res.status(404).json({ success: false, error: 'Batch not found' });
        }

        // Optional: Remove batchId from users or delete them? 
        // For safety, we keep users but unset their batchId.
        await User.updateMany(
            { batchId: id },
            { $unset: { batchId: "" } }
        );

        await Batch.findByIdAndDelete(id);

        await AuditLog.create({
            userId: req.user._id,
            action: 'DELETE_BATCH',
            targetType: 'Batch',
            targetId: id
        });

        res.status(200).json({ success: true, message: 'Batch deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getFaculty = async (req, res) => {
    try {
        const faculty = await User.find({ role: { $in: ['FACULTY', 'HOD'] } }).select('-password');
        res.status(200).json({ success: true, data: faculty });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const activeBatches = await Batch.countDocuments();
        const registeredFaculty = await User.countDocuments({ role: 'FACULTY' });
        const totalInterns = await User.countDocuments({ role: 'INTERN' });

        res.status(200).json({
            success: true,
            data: {
                activeBatches,
                registeredFaculty,
                totalInterns
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        if (role) user.role = role;

        await user.save();

        await AuditLog.create({
            userId: req.user._id,
            action: 'UPDATE_FACULTY',
            targetType: 'User',
            targetId: id,
            meta: { updatedFields: req.body }
        });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.role === 'HOD') {
            return res.status(403).json({ success: false, error: 'Cannot delete HOD' });
        }

        await User.findByIdAndDelete(id);

        await AuditLog.create({
            userId: req.user._id,
            action: 'DELETE_FACULTY',
            targetType: 'User',
            targetId: id
        });

        res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getInterns = async (req, res) => {
    try {
        const interns = await User.find({ role: { $in: ['INTERN'] } }) // Minor fix: ensure 'INTERN'
            .select('-password')
            .populate('batchId', 'name startDate')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: interns });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
