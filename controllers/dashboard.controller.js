
import User from '../models/user.model.js';

// Render dashboard & profile
export const
    renderDashboard = (req, res, ROLE) => res.render('dashboard', {
        _page: 'dashboard'
    }),
    renderProfile = (req, res) => res.render('profile', {
        _page: 'profile',
        _form: { id: null, ROLE: null }
    });

// Render user profiles for staff
export const renderProfileForStaff = async (req, res) => {
    try {
        // Fetch service Id & validate user
        const { serviceId, userId } = req.params,
            _user = await User.findById(userId).populate('areaRef');
        if (!_user) throw new Error('User not found 😕');

        // Verify service
        const _services = _user.services;
        if (!_services.pending.includes(serviceId) && !_services.rejected.includes(serviceId)) {
            if (_services.reviewed.includes(serviceId)) throw new Error('That application has already been reviewed 🤗');
            if (_services.approved.includes(serviceId)) throw new Error('That application has already been approved 🤗');
            throw new Error('Service application not found 🙂');
        }

        // If validated render profile, else error
        res.render('profile', {
            _page: 'profile', _user,
            _form: { id: serviceId, ROLE: 'staff' }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

// Render user profiles for admin
export const renderProfileForAdmin = async (req, res) => {
    try {
        // Fetch service Id & validate user
        const { serviceId, userId } = req.params,
            _user = await User.findById(userId).populate('areaRef');
        if (!_user) throw new Error('User not found 😕');

        // Verify service
        const _services = _user.services; let ROLE = 'admin';
        if (!_services.reviewed.includes(serviceId) && !_services.rejected.includes(serviceId)) {
            if (_services.pending.includes(serviceId)) throw new Error("That application hasn't been reviewed yet 🤗");
            if (_services.approved.includes(serviceId)) ROLE = null;
            else throw new Error('Service application not found 🙂');
        }

        // Attach service id for frontend rendering
        _user.serviceId = serviceId;

        // If validated render profile, else error
        res.render('profile', {
            _page: 'profile', _user,
            _form: { id: serviceId, ROLE }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};