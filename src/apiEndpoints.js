const BASE_URL = 'http://localhost:8090/api';

const API_ENDPOINTS = {
    clients: `${BASE_URL}/client/all`,
    client: (clientId) => `${BASE_URL}/client/${clientId}`,
    course: (courseId) => `${BASE_URL}/course/${courseId}`,
    createClient: `${BASE_URL}/client`,
    updateClientStatus: (clientId, statusId) => `${BASE_URL}/client/${clientId}/status/${statusId}`,
    updateCourseStatus: (courseId, statusId) => `${BASE_URL}/course/${courseId}/status/${statusId}`,
    updateClientReferralSource: (clientId, referralId) => `${BASE_URL}/client/${clientId}/referral-source/${referralId}`,
    updateClientField: (clientId, field) => `${BASE_URL}/client/${clientId}/${field}`,
    updateCourseField: (courseId, field) => `${BASE_URL}/course/${courseId}/${field}`,
    updateEnrollmentField: (enrollmentId, field) => `${BASE_URL}/enrollment/${enrollmentId}/${field}`,
    updateInstallmentField: (installmentId, field) => `${BASE_URL}/installment/${installmentId}/${field}`,
    updateRefundField: (refundId, field) => `${BASE_URL}/refund/${refundId}/${field}`,
    updateEnrollmentFieldBoolean: (enrollmentId, field, val) => `${BASE_URL}/enrollment/${enrollmentId}/${field.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}/${val}`,
    updateEnrollmentPaymentMethod: (enrollmentId, updateId) => `${BASE_URL}/enrollment/${enrollmentId}/payment-method/${updateId}`,
    updateInstallmentPaymentMethod: (installmentId, updateId) => `${BASE_URL}/installment/${installmentId}/payment-method/${updateId}`,
    updateEnrollmentPaymentStatus: (enrollmentId, updateId) => `${BASE_URL}/enrollment/${enrollmentId}/payment-status/${updateId}`,
    updateInstallmentPaymentStatus: (installmentId, updateId) => `${BASE_URL}/installment/${installmentId}/payment-status/${updateId}`,
    updateEnrollmentActionTaken: (enrollmentId, updateId) => `${BASE_URL}/enrollment/${enrollmentId}/action-taken/${updateId}`,
    updateEnrollmentReferralSource: (enrollmentId, updateId) => `${BASE_URL}/enrollment/${enrollmentId}/referral-source/${updateId}`,
    updateRefundReason: (refundId, updateId) => `${BASE_URL}/refund/${refundId}/refund-reason/${updateId}`,
    updateRefundPaymentMethod: (refundId, updateId) => `${BASE_URL}/refund/${refundId}/payment-method/${updateId}`,
    statuses: `${BASE_URL}/client-status/all`,
    referralSources: `${BASE_URL}/referral-source/all`,
    enrollmentsByClientId: (clientId) => `${BASE_URL}/enrollment/client/${clientId}`,
    enrollmentsByCourseId: (courseId) => `${BASE_URL}/enrollment/course/${courseId}`,
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
    clientHistoryByClientIdAndField: (clientId, fieldName) => `${BASE_URL}/client-history/client/${clientId}/field/${fieldName}`,
    courseHistoryByCourseIdAndField: (courseId, fieldName) => `${BASE_URL}/course-history/course/${courseId}/field/${fieldName}`,
    updateEnrollmentCourse: (enrollmentId, courseId) => `${BASE_URL}/enrollment/${enrollmentId}/course/${courseId}`,
    paymentMethods: `${BASE_URL}/payment-method/all`,
    paymentStatuses: `${BASE_URL}/payment-status/all`,
    actionTaken: `${BASE_URL}/action-taken/all`,
    createCourse: `${BASE_URL}/course`,
    getCourseUpdateEndpoint: (course, column, updateId) => {
        switch (column) {
            case 'courseStatus':
                return API_ENDPOINTS.updateCourseStatus(course, updateId);

            default:
                return API_ENDPOINTS.updateCourseField(course, column.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
        }

    },
    courseStatuses: `${BASE_URL}/course-status/all`,
    getEnrollmentUpdateEndpoint: (enrollmentId, column, updateId) => {
        switch (column) {
            case 'paymentMethod':
                return API_ENDPOINTS.updateEnrollmentPaymentMethod(enrollmentId, updateId);
            case 'paymentStatus':
                return API_ENDPOINTS.updateEnrollmentPaymentStatus(enrollmentId, updateId);
            case 'actionTaken':
                return API_ENDPOINTS.updateEnrollmentActionTaken(enrollmentId, updateId);
            case 'course':
                return API_ENDPOINTS.updateEnrollmentCourse(enrollmentId, updateId);
            case 'referralSource':
                return API_ENDPOINTS.updateEnrollmentReferralSource(enrollmentId, updateId);
            default:
                return API_ENDPOINTS.updateEnrollmentField(enrollmentId, column.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
        }

    },
    installments: `${BASE_URL}/installment/all`,
    createInstallment: `${BASE_URL}/installment`,
    getInstallmentUpdateEndpoint: (installmentId, column, updateId) => {
        switch (column) {
            case 'paymentMethod':
                return API_ENDPOINTS.updateInstallmentPaymentMethod(installmentId, updateId);
            case 'paymentStatus':
                return API_ENDPOINTS.updateInstallmentPaymentStatus(installmentId, updateId);
            default:
                return API_ENDPOINTS.updateInstallmentField(installmentId, column.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
        }

    },
    courseLecturersByCourseId: (courseId) => `${BASE_URL}/course-lecturer/course/${courseId}`,
    updateCourseLecturerField: (courseLecturerId, columnField) => `${BASE_URL}/course-lecturer/${courseLecturerId}/${columnField.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`,
    createCourseLecturer: `${BASE_URL}/course-lecturer`,
    updateCourseLecturerPaidStatus: (courseLecturerId, paidStatus) => `${BASE_URL}/course-lecturer/${courseLecturerId}/paid-in-percentage/${paidStatus}`,
    refunds: `${BASE_URL}/refund/all`,
    refundReasons: `${BASE_URL}/refund-reason/all`,
    createRefund: `${BASE_URL}/refund`,
    getRefundUpdateEndpoint: (refundId, column, updateId) => {
        switch (column) {
            case 'refundReason':
                return API_ENDPOINTS.updateRefundReason(refundId, updateId);
            case 'paymentMethod':
                return API_ENDPOINTS.updateRefundPaymentMethod(refundId, updateId);

            default:
                return API_ENDPOINTS.updateRefundField(refundId, column.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());

        }


    },
    updateRefundIsConfirmed: (refundId, isConfirmed) => `${BASE_URL}/refund/${refundId}/is-confirmed/${isConfirmed}`,
    sales: `${BASE_URL}/sales/all`,
};
export default API_ENDPOINTS;