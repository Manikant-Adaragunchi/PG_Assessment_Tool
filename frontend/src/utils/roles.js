export const ROLES = {
    HOD: 'HOD',
    FACULTY: 'FACULTY',
    INTERN: 'INTERN'
};

export const getDashboardPath = (role) => {
    switch (role) {
        case ROLES.HOD: return '/admin/dashboard';
        case ROLES.FACULTY: return '/faculty/dashboard';
        case ROLES.INTERN: return '/pg/dashboard';
        default: return '/login';
    }
};

export const getRoleLinks = (role) => {
    switch (role) {
        case ROLES.HOD:
            return [
                { label: 'Dashboard', path: '/admin/dashboard' },
                { label: 'Manage Batches', path: '/admin/batches' },
                { label: 'Manage Faculty', path: '/admin/faculty' },
                { label: 'PG List', path: '/admin/interns' }
            ];
        case ROLES.FACULTY:
            return [
                { label: 'Dashboard', path: '/faculty/dashboard' },
                { label: 'PG List', path: '/faculty/interns' },
                // Ideally this would be "My Interns" -> then click "Evaluate"
                // For demo/simplicity we show direct modules
                { label: 'Surgery', path: '/faculty/assessments/surgery' },
                { label: 'OPD', path: '/faculty/assessments/opd' },
                { label: 'Academic', path: '/faculty/assessments/academic' },
                { label: 'Wet Lab', path: '/faculty/assessments/wetlab' }
            ];
        case ROLES.INTERN:
            return [
                { label: 'Dashboard', path: '/pg/dashboard' },
                { label: 'My Evaluations', path: '/pg/my-evaluations' }
            ];
        default:
            return [];
    }
};
