// controllers/service.controller.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { serviceModel } from '../models/service.model.js';

const config = {
    birth: 'Birth Certificate Application',
    death: 'Death Certificate Application',
    dues: 'View and Clear Outstanding Dues',
    'election-updates': 'Get Latest Election Updates',
    grievance: 'Submit a Public Grievance',
    'health-checkup': 'Book a Health Checkup Appointment',
    jobs: 'Explore Local Job Opportunities',
    land: 'Land Records and Information',
    mgnrega: 'MGNREGA Job Card Inquiry',
    'property-tax': 'Property Tax Payment',
    property: 'Property Registration and Records',
    'public-notices': 'View Public Notices',
    'public-works': 'Public Works Project Status',
    rti: 'Right to Information (RTI) Application',
    sanitation: 'Sanitation and Waste Management Request',
    'skill-training': 'Skill Development Training Registration',
    subsidies: 'Apply for Government Subsidies',
    tenders: 'View and Participate in Tenders',
    'voter-id': 'Voter ID Registration and Services',
    'voter-list': 'Search Your Name in Electoral Voter List',
    'water-tax': 'Water Tax Payment',
    'welfare-schemes': 'Apply for Welfare Schemes'
};

async function findUser(req) {
    const TOKEN = req.cookies.sessionToken;

    // Validate token & user, else return error:
    return new Promise((resolve, reject) => {
        jwt.verify(TOKEN, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return reject(new Error('Unable to validate session token 😕'));
            const _user = await User.findById(decoded.id).populate('areaRef');
            _user ? resolve(_user) : reject(new Error('User not found'));
        });
    });
}

async function findApplicant(userId, serviceId, $in = []) { // Validate:
    // User
    const _applicant = await User.findById(userId).populate('areaRef');
    if (!_applicant) throw new Error('User not found 😕');

    // Service
    const _service = await serviceModel(serviceId).findOne({ applicant: userId, status: { $in } });
    if (!_service) throw new Error('Application not found 😕');

    return { _applicant, _service };
}

// Check: user is validated & service is present in the system
async function verifyService(req) {
    const { id } = req.params, _user = await findUser(req);
    if (_user.areaRef.activeServices.includes(id) || _user.areaRef.inactiveServices.includes(id)) return true;
    throw new Error('Service not found 😕');
}

// Fetch applications & render applications page
async function renderApplications(res, id, _applications, _page) {
    const _applicants = [];
    for (const _application of _applications) {
        const _applicant = await User.findById(_application.applicant),
            reviewedBy = _application.reviewedBy ? await User.findById(_application.reviewedBy) : null,
            approvedBy = _application.approvedBy ? await User.findById(_application.approvedBy) : null,
            rejectedBy = _application.rejectedBy ? await User.findById(_application.rejectedBy) : null;

        _applicants.push({
            id: _applicant.id,
            name: _applicant.profile.name,
            pic: _applicant.profile.photoUrl,
            reviewedBy: reviewedBy ? reviewedBy.profile.name : null,
            approvedBy: approvedBy ? approvedBy.profile.name : null,
            rejectedBy: rejectedBy ? rejectedBy.profile.name : null,
            reviewedAt: _application.reviewedAt,
            approvedAt: _application.approvedAt,
            rejectedAt: _application.rejectedAt
        });
    }
    return res.render('services/applications', {
        _page, _form: { id },
        _applicants,
        _css: ['services/applications']
    });
}


// Render pages from dashboard
export const
    renderStatus = (req, res) => res.render('services/status', {
        _page: 'services/status',
        _css: ['services/menu', 'services/status'],
        config
    }),
    renderApply = (req, res) => res.render('services/apply', {
        _page: 'services/apply',
        _css: ['services/menu'],
        config
    }),
    renderMenu = (req, res, _page) => res.render('services/menu', {
        _page, config,
        _css: ['services/menu'],
        _form: { id: null }
    }),
    renderUpdate = (req, res) => res.render('services/update', {
        _page: 'services/update',
        _css: ['services/menu'],
        config
    });

export const renderCreate = async (req, res) => {
    try {
        // Fetch user & _form(config + link)
        const { id } = req.params,
            _form = { name: config[id], id },
            _user = await findUser(req, id);

        // Validate service is active in that area & it's submitted/rejected
        for (const _service of _user.areaRef.activeServices) {
            if (_service === id) {
                const _services = _user.services;
                if (_services.rejected.includes(id)) break;
                if (_services.pending.includes(id)) throw new Error("You've already submitted that form 😊");
                if (_services.reviewed.includes(id)) throw new Error('That form has been reviewed 😮‍💨');
                if (_services.approved.includes(id)) throw new Error('That form is already approved 🥳');
            }
        }

        // If service exist load existing data, then render page
        const _service = await serviceModel(id).findOne({ applicant: _user.id });
        if (_service) {
            const { applicant, reviewedBy, approvedBy, createdAt, updatedAt, __v, ...formData } = _service.toObject();
            _form.data = formData;
        }
        res.render('services/create', { _page: 'service', _css: ['services/service'], _form });
    } catch (err) {
        console.error(err);
        res.status(401).json({ errors: err.message });
    }
};

export const renderView = async (req, res) => {
    try {
        // Fetch user, _form(config + id) & service
        const { id } = req.params, _form = { name: config[id], id },
            _user = await findUser(req),
            _service = await serviceModel(id).findOne({ applicant: _user.id });

        // If service exists send existing data, then render page
        if (_service) {
            const { applicant, reviewedBy, approvedBy, createdAt, updatedAt, __v, ...formData } = _service.toObject();
            _form.data = formData;
        }
        res.render('services/view', { _page: 'view', _css: ['services/service'], _form });
    } catch (err) {
        console.error(err);
        res.status(401).json({ errors: err.message });
    }
}

export const postServiceData = async (req, res) => {
    try {
        // Fetch user, service model 
        const _user = await findUser(req),
            { id } = req.params, Service = serviceModel(id);

        // Check if service already exists
        if (await Service.findOne({ applicant: _user.id, status: { $in: ['pending', 'reviewed', 'approved'] } }))
            throw new Error("You've already submitted that form 🤦‍♀️");

        // POST service data & update user doc
        const _service = await Service.create({ ...req.body, applicant: _user.id });
        _user.services.pending.push(id);
        await _user.save();

        // Respond:
        res.status(200).json({ _service });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};


export const renderRejectedApplications = async (req, res) => {
    try {
        const { id } = req.params;
        await verifyService(req);

        const rejectedApplications = await serviceModel(id)
            .find({ status: 'rejected' })
            .sort({ updatedAt: -1 });

        await renderApplications(res, id, rejectedApplications, 'rejected');
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};


export const renderPendingApplications = async (req, res) => {
    try {
        const { id } = req.params;
        await verifyService(req);

        const pendingApplications = await serviceModel(id)
            .find({ status: 'pending' })
            .sort({ createdAt: 1 })
            .limit(40);

        await renderApplications(res, id, pendingApplications, 'pending');
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
}

export const renderApplicationForStaff = async (req, res) => {
    try {
        // Fetch applicant, service & form(config + id + role)
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['pending', 'rejected']),
            _form = { name: config[serviceId], id: serviceId, ROLE: 'staff' };

        // Send existing data, then render page
        const { applicant, reviewedBy, approvedBy, createdAt, updatedAt, __v, ...formData } = _service.toObject();
        _form.data = formData;

        res.render('services/view', {
            _page: 'view',
            _css: ['services/service'],
            _form, _user: _applicant
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const reviewApplication = async (req, res) => {
    try {
        // Fetch: user, applicant & service
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['pending', 'rejected']);

        // Update Applicant Application Status
        if (_service.remarks.approvedProfile) {
            _applicant.services.reviewed.push(serviceId);
            _applicant.services.reviewed = [...new Set(_applicant.services.reviewed)]; // Remove duplication
            const pendingIdx = _applicant.services.pending.indexOf(serviceId),
                rejectedIdx = _applicant.services.rejected.indexOf(serviceId);
            if (rejectedIdx > -1) _applicant.services.rejected.splice(rejectedIdx, 1);
            if (pendingIdx > -1) _applicant.services.pending.splice(pendingIdx, 1);
            await _applicant.save();

            // Update Service Application Status
            _service.reviewedBy = _user.id;
            _service.reviewedAt = Date.now();
            _service.status = 'reviewed';
            _service.remarks.approvedApplication = _service.remarks.approvedProfile = false;
            await _service.save();
        } else {
            _service.remarks.approvedApplication = true;
            await _service.save();
        }

        // Respond:
        res.status(200).json({ message: 'Reviewed application', _service });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const unreviewApplication = async (req, res) => {
    try {
        // Fetch: user, applicant & service
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['pending', 'rejected']);

        // Update Applicant Application Status
        _applicant.services.rejected.push(serviceId);
        _applicant.services.rejected = [...new Set(_applicant.services.rejected)]; // Remove duplication
        const pendingIdx = _applicant.services.pending.indexOf(serviceId);
        if (pendingIdx > -1) _applicant.services.pending.splice(pendingIdx, 1);
        await _applicant.save();

        // Update Service Application Status
        _service.remarks.approvedApplication = _service.remarks.approvedProfile =  false;
        _service.rejectedBy = _user.id;
        _service.rejectedAt = Date.now();
        _service.status = 'rejected';
        await _service.save();

        // Respond:
        res.status(200).json({ message: 'Unreviewed application', _service });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const reviewProfile = async (req, res) => {
    try {
        // Fetch: user, applicant & service
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['pending', 'rejected']);

        // Update Applicant Application Status
        if (_service.remarks.approvedApplication) {
            _applicant.services.reviewed.push(serviceId);
            _applicant.services.reviewed = [...new Set(_applicant.services.reviewed)]; // Remove duplication
            const pendingIdx = _applicant.services.pending.indexOf(serviceId),
                rejectedIdx = _applicant.services.rejected.indexOf(serviceId);
            if (rejectedIdx > -1) _applicant.services.rejected.splice(rejectedIdx, 1);
            if (pendingIdx > -1) _applicant.services.pending.splice(pendingIdx, 1);
            await _applicant.save();

            // Update Service Application Status
            _service.reviewedBy = _user.id;
            _service.reviewedAt = Date.now();
            _service.status = 'reviewed';
            _service.remarks.approvedApplication = _service.remarks.approvedProfile = false;
            await _service.save();
        } else {
            _service.remarks.approvedProfile = true;
            await _service.save();
        }

        // Respond:
        res.status(200).json({ message: 'Reviewed applicant profile', _service });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const unreviewProfile = async (req, res) => {
    try {
        // Fetch: user, applicant & service
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['pending', 'rejected']);

        // Update Applicant Application Status
        _applicant.services.rejected.push(serviceId);
        _applicant.services.rejected = [...new Set(_applicant.services.rejected)]; // Remove duplication
        const pendingIdx = _applicant.services.pending.indexOf(serviceId);
        if (pendingIdx > -1) _applicant.services.pending.splice(pendingIdx, 1);
        await _applicant.save();

        // Update Service Application Status
        _service.remarks.approvedApplication = _service.remarks.approvedProfile =  false;
        _service.rejectedBy = _user.id;
        _service.rejectedAt = Date.now();
        _service.status = 'rejected';
        await _service.save();

        // Respond:
        res.status(200).json({ message: 'Unreviewed applicant profile', _service });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};


export const renderReviewedApplications = async (req, res) => {
    try {
        const { id } = req.params;
        await verifyService(req);

        const reviewedApplications = await serviceModel(id)
            .find({ status: 'reviewed' })
            .sort({ createdAt: 1 })
            .limit(40);

        await renderApplications(res, id, reviewedApplications, 'reviewed');
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
}

export const renderApprovedApplications = async (req, res) => {
    try {
        const { id } = req.params;
        await verifyService(req);

        const approvedApplications = await serviceModel(id)
            .find({ status: 'approved' })
            .sort({ updatedAt: -1 });

        await renderApplications(res, id, approvedApplications, 'approved');
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const renderApplicationForAdmin = async (req, res) => {
    try {
        // Fetch applicant & service
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['reviewed', 'approved', 'rejected']);

        // Fetch form(config + id + role)
        const ROLE = _service.status === 'approved' ? null : 'admin',
            _form = { name: config[serviceId], id: serviceId, ROLE };

        // Send existing data, then render page
        const { applicant, reviewedBy, approvedBy, createdAt, updatedAt, __v, ...formData } = _service.toObject();
        _form.data = formData;

        res.render('services/view', {
            _page: 'view',
            _css: ['services/service'],
            _form, _user: _applicant
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const approveApplication = async (req, res) => {
    try {
        // Fetch: user, applicant & service
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['reviewed', 'rejected']);

        // Update Applicant Application Status
        if (_service.remarks.approvedProfile) {
            _applicant.services.approved.push(serviceId);
            _applicant.services.approved = [...new Set(_applicant.services.approved)]; // Remove duplication
            const reviewIdx = _applicant.services.reviewed.indexOf(serviceId),
                pendingIdx = _applicant.services.pending.indexOf(serviceId),
                rejectedIdx = _applicant.services.rejected.indexOf(serviceId);
            if (reviewIdx > -1) _applicant.services.reviewed.splice(reviewIdx, 1);
            if (pendingIdx > -1) _applicant.services.pending.splice(pendingIdx, 1);
            if (rejectedIdx > -1) _applicant.services.rejected.splice(rejectedIdx, 1);
            await _applicant.save();

            // Update Service Application Status
            _service.approvedBy = _user.id;
            _service.approvedAt = Date.now();
            _service.status = 'approved';
        }
        _service.remarks.approvedApplication = true;
        await _service.save();

        // Respond:
        res.status(200).json({ message: 'Approved application', _service });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const rejectApplication = async (req, res) => {
    try {
        // Fetch: user, applicant & service
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['reviewed', 'rejected']);

        // Update Applicant Application Status
        _applicant.services.rejected.push(serviceId);
        _applicant.services.rejected = [...new Set(_applicant.services.rejected)]; // Remove duplication
        const reviewIdx = _applicant.services.reviewed.indexOf(serviceId),
            pendingIdx = _applicant.services.pending.indexOf(serviceId);
        if (reviewIdx > -1) _applicant.services.reviewed.splice(reviewIdx, 1);
        if (pendingIdx > -1) _applicant.services.pending.splice(pendingIdx, 1);
        await _applicant.save();

        // Update Service Application Status
        _service.remarks.approvedProfile = _service.remarks.approvedApplication = false;
        _service.rejectedBy = _user.id;
        _service.rejectedAt = Date.now();
        _service.status = 'rejected';
        await _service.save();

        // Respond:
        res.status(200).json({ message: 'Rejected application', _service });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const approveProfile = async (req, res) => {
    try {
        // Fetch: user, applicant & service
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['reviewed', 'rejected']);

        // Update Applicant Application Status
        if (_service.remarks.approvedApplication) {
            _applicant.services.approved.push(serviceId);
            _applicant.services.approved = [...new Set(_applicant.services.approved)]; // Remove duplication
            const reviewIdx = _applicant.services.reviewed.indexOf(serviceId),
                pendingIdx = _applicant.services.pending.indexOf(serviceId),
                rejectedIdx = _applicant.services.rejected.indexOf(serviceId);
            if (reviewIdx > -1) _applicant.services.reviewed.splice(reviewIdx, 1);
            if (pendingIdx > -1) _applicant.services.pending.splice(pendingIdx, 1);
            if (rejectedIdx > -1) _applicant.services.rejected.splice(rejectedIdx, 1);
            await _applicant.save();

            // Update Service Application Status
            _service.approvedBy = _user.id;
            _service.approvedAt = Date.now();
            _service.status = 'approved';
        }
        _service.remarks.approvedProfile = true;
        await _service.save();

        // Respond:
        res.status(200).json({ message: 'Approved applicant profile', _service });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const rejectProfile = async (req, res) => {
    try {
        // Fetch: user, applicant & service
        const { serviceId, userId } = req.params,
            _user = await findUser(req),
            { _applicant, _service } = await findApplicant(userId, serviceId, ['reviewed', 'rejected']);

        // Update Applicant Application Status
        _applicant.services.rejected.push(serviceId);
        _applicant.services.rejected = [...new Set(_applicant.services.rejected)]; // Remove duplication
        const reviewIdx = _applicant.services.reviewed.indexOf(serviceId),
            pendingIdx = _applicant.services.pending.indexOf(serviceId);
        if (reviewIdx > -1) _applicant.services.reviewed.splice(reviewIdx, 1);
        if (pendingIdx > -1) _applicant.services.pending.splice(pendingIdx, 1);
        await _applicant.save();

        // Update Service Application Status
        _service.remarks.approvedProfile = _service.remarks.approvedApplication = false;
        _service.rejectedBy = _user.id;
        _service.rejectedAt = Date.now();
        _service.status = 'rejected';
        await _service.save();

        // Respond:
        res.status(200).json({ message: 'Rejected applicant profile', _service });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const activateService = async (req, res) => {
    try {
        // Fetch service id & user
        const { id } = req.params, _user = await findUser(req);

        // Check if service is inactive, if not init index, else throw error
        if (_user.areaRef.activeServices.includes(id)) throw new Error('Service already active 🙂');
        const idx = _user.areaRef.inactiveServices.indexOf(id);
        if (idx < 0) throw new Error('Service not found 😕');

        // Activate service & update user doc
        _user.areaRef.activeServices.push(id);
        _user.areaRef.activeServices = [...new Set(_user.areaRef.activeServices)] // Remove duplication 
        _user.areaRef.inactiveServices.splice(idx, 1);
        await _user.areaRef.save();

        // Respond:
        res.status(201).json({ message: 'Activated service', service: id });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const deactivateService = async (req, res) => {
    try {
        // Fetch service id & user
        const { id } = req.params, _user = await findUser(req);

        // Check if service is active, if not init index, else throw error
        if (_user.areaRef.inactiveServices.includes(id)) throw new Error('Service already inactive 🙂');
        const idx = _user.areaRef.activeServices.indexOf(id);
        if (idx < 0) throw new Error('Service not found 😕');

        // Deactivate service & update user doc
        _user.areaRef.inactiveServices.push(id);
        _user.areaRef.inactiveServices = [...new Set(_user.areaRef.inactiveServices)] // Remove duplication 
        _user.areaRef.activeServices.splice(idx, 1);
        await _user.areaRef.save();

        // Respond:
        res.status(201).json({ message: 'Deactivated service', service: id });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};