import {BASE_URL} from "./constants.js";


const API_ENDPOINTS = {
    clients: `${BASE_URL}/client/all`,
    client: (clientId) => `${BASE_URL}/client/${clientId}`,
    course: (courseId) => `${BASE_URL}/course/${courseId}`,
    createClient: `${BASE_URL}/client`,
    updateClientStatus: (clientId, statusId) => `${BASE_URL}/client/${clientId}/status/${statusId}`,
    updateCourseStatus: (courseId, statusId) => `${BASE_URL}/course/${courseId}/status/${statusId}`,
    updateClientReferralSource: (clientId, referralId) => `${BASE_URL}/client/${clientId}/referral-source/${referralId}`,
    updateClientInitialCourse: (clientId, courseId) => `${BASE_URL}/client/${clientId}/initial-course/${courseId}`,
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
    updateRefundMethod: (refundId, updateId) => `${BASE_URL}/refund/${refundId}/refund-method/${updateId}`,
    updateRefundStatus: (refundId, updateId) => `${BASE_URL}/refund/${refundId}/refund-status/${updateId}`,
    clientStatuses: `${BASE_URL}/client-status/all`,
    referralSources: `${BASE_URL}/referral-source/all`,
    enrollmentsByClientId: (clientId) => `${BASE_URL}/enrollment/client/${clientId}`,
    enrollmentsByCourseId: (courseId) => `${BASE_URL}/enrollment/course/${courseId}`,
    courses: `${BASE_URL}/course/all`,
    initialCourses: `${BASE_URL}/course/all-initial-courses`,
    getClientUpdateEndpoint: (clientId, column, updateId) => {
        switch (column) {
            case 'clientStatus':
                return API_ENDPOINTS.updateClientStatus(clientId, updateId);
            case 'referralSource':
                return API_ENDPOINTS.updateClientReferralSource(clientId, updateId);
            case 'initialCourse':
                return API_ENDPOINTS.updateClientInitialCourse(clientId, updateId);
            default:
                return API_ENDPOINTS.updateClientField(clientId, column.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
        }

    },
    createEnrollment: `${BASE_URL}/enrollment`,
    historyByEntityIdAndEntityTypeAndField: (entityId, entityType, fieldName) => `${BASE_URL}/history/entity/${entityId}/entity-type/${entityType}/field-name/${fieldName}`,
    updateEnrollmentCourse: (enrollmentId, courseId) => `${BASE_URL}/enrollment/${enrollmentId}/course/${courseId}`,
    paymentMethods: `${BASE_URL}/payment-method/all`,
    refundMethods: `${BASE_URL}/refund-method/all`,
    paymentStatuses: `${BASE_URL}/payment-status/all`,
    actionTaken: `${BASE_URL}/action-taken/all`,
    createCourse: `${BASE_URL}/course`,
    createInitialCourse: `${BASE_URL}/course/initial`,
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
            case 'refundStatus':
                return API_ENDPOINTS.updateRefundStatus(refundId, updateId);
            case 'refundMethod':
                return API_ENDPOINTS.updateRefundMethod(refundId, updateId);

            default:
                return API_ENDPOINTS.updateRefundField(refundId, column.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());

        }


    },
    sales: `${BASE_URL}/sales/all`,

    getClientDeleteEndpoint: (clientId) => `${BASE_URL}/client/${clientId}`,
    getEnrollmentDeleteEndpoint: (enrollmentId) => `${BASE_URL}/enrollment/${enrollmentId}`,
    getRefundDeleteEndpoint: (refundId) => `${BASE_URL}/refund/${refundId}`,
    getCourseDeleteEndpoint: (courseId) => `${BASE_URL}/course/${courseId}`,
    getInstallmentDeleteEndpoint: (installmentId) => `${BASE_URL}/installment/${installmentId}`,
    getCourseLecturerDeleteEndpoint: (courseLecturerId) => `${BASE_URL}/course-lecturer/${courseLecturerId}`,
    users: `${BASE_URL}/user/all`,
    roles: `${BASE_URL}/roles/all`,
    getUserUpdate: (userId, columnField) => `${BASE_URL}/user/${userId}/${columnField.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`,
    getDeleteUser: (userId) => `${BASE_URL}/user/${userId}`,
    createUser: `${BASE_URL}/user`,
    refundStatuses: `${BASE_URL}/refund-status/all`,

    getUpdateIsReceived: (id, paymentType, isReceived) => `${BASE_URL}/sales/${id}/payment-type/${paymentType}/is-received/${isReceived}`,
    getUpdatePaymentStatus: (id, paymentType, paymentStatus) => `${BASE_URL}/sales/${id}/payment-type/${paymentType}/payment-status/${paymentStatus}`,
    getPaginatedClients: `${BASE_URL}/client/find-paginated-and-filtered`,
    getPaginatedCourses: `${BASE_URL}/course/find-paginated-and-filtered`,
    getPaginatedRefunds: `${BASE_URL}/refund/find-paginated-and-filtered`,
    getPaginatedEnrollments: `${BASE_URL}/enrollment/find-paginated-and-filtered`,
    getPaginatedInstallments: `${BASE_URL}/installment/find-paginated-and-filtered`,
    getPaginatedCourseLecturers: `${BASE_URL}/course-lecturer/find-paginated-and-filtered`,
    getPaginatedUsers: `${BASE_URL}/user/find-paginated-and-filtered`,
    enrollment: (enrollmentId) => `${BASE_URL}/enrollment/${enrollmentId}`,
    enrollmentByClientIdAndCourseId: (clientId, courseId) => `${BASE_URL}/enrollment/client/${clientId}/course/${courseId}`,
    getPaginatedSales: `${BASE_URL}/sales/find-paginated-and-filtered`,
    getSalesUpdateEndpoint: (saleId, column, paymentType, updateId) => {
        switch (column) {
            case 'isReceived':
                updateId = updateId === 'Yes';
                return API_ENDPOINTS.getUpdateIsReceived(saleId, paymentType, updateId);
            case 'paymentStatus':
                return API_ENDPOINTS.getUpdatePaymentStatus(saleId, paymentType, updateId.id);

        }
    },
    evaluationStatuses: `${BASE_URL}/evaluation-status/all`,
    getPaginatedEvaluations: `${BASE_URL}/evaluation/find-paginated-and-filtered`,
    getEvaluationDeleteEndpoint: (evaluationId) => `${BASE_URL}/evaluation/${evaluationId}`,
    createEvaluation: `${BASE_URL}/evaluation`,
    updateEvaluationStatus: (evaluationId, statusId) => `${BASE_URL}/evaluation/${evaluationId}/evaluation-status/${statusId}`,
    updateEvaluationField: (evaluationId, field) => `${BASE_URL}/evaluation/${evaluationId}/${field}`,
    getEvaluationUpdateEndpoint: (evaluationId, column, updateId) => {
        switch (column) {
            case 'evaluationStatus':
                return API_ENDPOINTS.updateEvaluationStatus(evaluationId, updateId.id);
            default:
                return API_ENDPOINTS.updateEvaluationField(evaluationId, column.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
        }
    },
    parseClientCsv: `${BASE_URL}/client-csv/parse`,
    saveParsedClients: `${BASE_URL}/client-csv/save`,

};
export default API_ENDPOINTS;