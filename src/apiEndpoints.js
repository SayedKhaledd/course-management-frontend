const BASE_URL = 'http://localhost:8090/api';

const API_ENDPOINTS = {
    clients: `${BASE_URL}/client/all`,
    client: (clientId) => `${BASE_URL}/client/${clientId}`,
    createClient: `${BASE_URL}/client`,
    updateClientStatus: (clientId, statusId) => `${BASE_URL}/client/${clientId}/status/${statusId}`,
    updateClientReferralSource: (clientId, referralId) => `${BASE_URL}/client/${clientId}/referral-source/${referralId}`,
    updateClientField: (clientId, field) => `${BASE_URL}/client/${clientId}/${field}`,
    statuses: `${BASE_URL}/client-status/all`,
    referralSources: `${BASE_URL}/referral-source/all`,
    enrollmentsByClientId: (clientId) => `${BASE_URL}/enrollment/client/${clientId}`,
    courses: `${BASE_URL}/course/all`,
    getClientUpdateEndpoint: (clientId, column, updateId) => {
        switch (column) {
            case 'clientStatus':
                return API_ENDPOINTS.updateClientStatus(clientId, updateId);
            case 'referralSource':
                return API_ENDPOINTS.updateClientReferralSource(clientId, updateId);
            default:
                return API_ENDPOINTS.updateClientField(clientId, column.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
        }

    },
    createEnrollment: `${BASE_URL}/enrollment`,
    clientHistoryByField: (field, fieldName) => `${BASE_URL}/client-history/${field}/${fieldName}`,
    updateEnrollmentCourse: (enrollmentId, courseId) => `${BASE_URL}/enrollment/${enrollmentId}/course/${courseId}`,
    paymentMethods: `${BASE_URL}/payment-method/all`,
    paymentStatuses: `${BASE_URL}/payment-status/all`,
    actionTaken: `${BASE_URL}/action-taken/all`,
};
export default API_ENDPOINTS;