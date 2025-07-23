import EnrollmentDetailsCard from "../components/cards/EnrollmentDetailsCard.jsx";
import {useParams} from "react-router-dom";
import useAxios from "../hooks/useAxios.js";
import React, {useEffect, useState} from "react";
import apiEndpoints from "../apiEndpoints.js";
import Notification from "../components/Notification.jsx";
import Installments from "../components/Installments.jsx";
import Refunds from "./Refunds.jsx";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import Evaluations from "./Evaluations.jsx";
import {Dropdown} from "primereact/dropdown";

const EnrollmentDetails = () => {
    const {clientId, courseId} = useParams();
    const axios = useAxios();
    const [enrollment, setEnrollment] = useState(null);
    const [referralSourceOptions, setReferralSourceOptions] = useState([]);
    const [notification, setNotification] = useState({message: '', type: ''});
    const [actionOptions, setActionOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);
    const [evaluationStatusOptions, setEvaluationStatusOptions] = useState([]);
    const [installmentDisplayDialog, setInstallmentDisplayDialog] = useState(false);
    const [refundDisplayDialog, setRefundDisplayDialog] = useState(false);
    const [evaluationDisplayDialog, setEvaluationDisplayDialog] = useState(false);
    const [newInstallment, setNewInstallment] = useState({});
    const [newRefund, setNewRefund] = useState({});
    const [newEvaluation, setNewEvaluation] = useState({});
    const [refresh, setRefresh] = useState(false);


    const fetchEnrollment = () => {
        axios.get(apiEndpoints.enrollmentByClientIdAndCourseId(clientId, courseId))
            .then(response => setEnrollment(response.data.response))
            .catch(error => console.error(error));
    }
    const fetchReferralSourceOptions = () => {
        axios.get(apiEndpoints.referralSources)
            .then(response => {
                setReferralSourceOptions(response.data.response);
            }).catch(error => {
            setNotification({message: 'Failed to fetch referral source options' + error, type: 'error'});
        });
    }
    const fetchActionOptions = () => {
        axios.get(apiEndpoints.actionTaken)
            .then(response => {
                setActionOptions(response.data.response);
            }).catch(error => {
            setNotification({message: 'Failed to fetch action options' + error, type: 'error'});
        });
    }
    const fetchEvaluationStatusOptions = () => {
        axios.get(apiEndpoints.evaluationStatuses)
            .then(response => {
                setEvaluationStatusOptions(response.data.response);
            }).catch(error => {
            setNotification({message: 'Failed to fetch evaluation status options' + error, type: 'error'});
        });
    }

    const fetchPaymentMethodOptions = () => {
        axios.get(apiEndpoints.paymentMethods)
            .then(response => {
                setPaymentMethodOptions(response.data.response);
            }).catch(error => {
            setNotification({message: 'Failed to fetch payment method options' + error, type: 'error'});
        });
    }
    const fetchPaymentStatusOptions = () => {
        axios.get(apiEndpoints.paymentStatuses)
            .then(response => {
                setPaymentStatusOptions(response.data.response);
            }).catch(error => {
            setNotification({message: 'Failed to fetch payment status options' + error, type: 'error'});
        });
    }

    const createInstallment = () => {
        if (newInstallment.dueDate !== '') {
            newInstallment.dueDate = new Date(newInstallment.dueDate).toISOString();
        }
        axios.post(apiEndpoints.createInstallment, {
            ...newInstallment,
            enrollmentId: enrollment.id
        }).then(response => {
            setNotification({message: 'Installment created successfully', type: 'success'});
            fetchEnrollment();
            setInstallmentDisplayDialog(false);
            setRefresh(prev => !prev);
        }).catch(error => {
            setNotification({message: 'Failed to create installment' + error, type: 'error'});
        });
    }

    const createRefund = () => {
        axios.post(apiEndpoints.createRefund, {
            ...newRefund,
            enrollmentId: enrollment.id
        }).then(response => {
            setNotification({message: 'Refund created successfully', type: 'success'});
            fetchEnrollment();
            setRefundDisplayDialog(false);
            setRefresh(prev => !prev);
        }).catch(error => {
            setNotification({message: 'Failed to create refund' + error, type: 'error'});
        });
    }

    const createEvaluation = () => {
        axios.post(apiEndpoints.createEvaluation, {
            ...newEvaluation,
            enrollmentId: enrollment.id
        }).then(response => {
            setNotification({message: 'Evaluation created successfully', type: 'success'});
            fetchEnrollment();
            setEvaluationDisplayDialog(false);
            setRefresh(prev => !prev);
        }).catch(error => {
            setNotification({message: 'Failed to create evaluation' + error, type: 'error'});
        });
    }


    useEffect(() => {
        fetchEnrollment();
        fetchReferralSourceOptions();
        fetchActionOptions();
        fetchPaymentMethodOptions();
        fetchPaymentStatusOptions();
        fetchEvaluationStatusOptions();

    }, [clientId, courseId]);


    if (!enrollment) return <p>Loading...</p>;

    //TODO: ADD SECURITY HERE
    //TODO: ADD CREATE BUTTON FOR INSTALLMENTS AND REFUNDS
    return (
        <>
            <EnrollmentDetailsCard
                enrollment={enrollment}
                setEnrollment={setEnrollment}
                fetchEnrollment={fetchEnrollment}
                referralSourceOptions={referralSourceOptions}
                notification={notification}
                setNotification={setNotification}
                actionOptions={actionOptions}
                paymentMethodOptions={paymentMethodOptions}
                paymentStatusOptions={paymentStatusOptions}
            />

            <Installments enrollmentId={enrollment.id} refresh={refresh}/>
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{
                    position: 'fixed',
                    marginTop: '200px',
                    bottom: '16px',
                    right: '16px',
                    zIndex: 1000
                }}
                onClick={() => {
                    setInstallmentDisplayDialog(true);
                }}
                label="New Installment"
            />
            <div style={{margin: '10px'}}></div>
            <Dialog
                header="Create New installment"
                visible={installmentDisplayDialog}
                style={{width: '50vw'}}
                modal
                onHide={() => {
                    setNewInstallment({});
                    setInstallmentDisplayDialog(false);
                }}
            >
                <Card title="Installment Details">
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="amount">amount</label>
                            <InputText id="amount"
                                       onInput={(e) => setNewInstallment({...newInstallment, amount: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="dueDate">Due Date</label>
                            <InputText id="dueDate"
                                       onInput={(e) => setNewInstallment({
                                           ...newInstallment,
                                           dueDate: e.target.value
                                       })}/>
                        </div>
                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createInstallment} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={() => {
                                setNewInstallment({});
                                setInstallmentDisplayDialog(false);
                            }}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>


            <Refunds enrollmentId={enrollment.id} refresh={refresh}/>
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{
                    position: 'fixed',
                    marginRight: '200px',
                    marginTop: '200px',
                    bottom: '16px',
                    right: '16px',
                    zIndex: 1000
                }}
                onClick={() => {
                    setRefundDisplayDialog(true);
                }}
                label="New Refund"
            />
            <Dialog
                header="Create New Refund"
                visible={refundDisplayDialog}
                style={{width: '50vw'}}
                modal
                onHide={() => {
                    setNewRefund({});
                    setRefundDisplayDialog(false);
                }}
            >
                <Card title="Refund Details">
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="refundedAmount">Refunded Amount</label>
                            <InputText id="refundedAmount"
                                       onInput={(e) => setNewRefund({...newRefund, refundedAmount: e.target.value})}/>
                        </div>

                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createRefund} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={() => {
                                setNewRefund({});
                                setRefundDisplayDialog(false);
                            }}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>
            <div style={{margin: '10px'}}></div>
            <Evaluations enrollmentId={enrollment.id} fetchEnrollment={fetchEnrollment} notification={notification}
                         setNotification={setNotification}/>

            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{
                    position: 'fixed',
                    marginRight: '400px',
                    marginTop: '200px',
                    bottom: '16px',
                    right: '16px',
                    zIndex: 1000
                }}
                onClick={() => {
                    setEvaluationDisplayDialog(true);
                }}
                label="New Evaluation"
            />
            <Dialog
                header="Create New Evaluation"
                visible={evaluationDisplayDialog}
                style={{width: '50vw'}}
                modal
                onHide={() => {
                    setNewEvaluation({});
                    setEvaluationDisplayDialog(false);
                }}
            >
                <Card title="Evaluation Details">
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="examName">Exam Name</label>
                            <InputText id="examName"
                                       onInput={(e) => setNewEvaluation({...newEvaluation, examName: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="evaluationStatus">Evaluation Status</label>
                            <Dropdown id="evaluationStatus"
                                      value={newEvaluation?.evaluationStatus?.status}
                                      options={evaluationStatusOptions.map(status => status.status)}
                                      placeholder="Select a course"
                                      onChange={(e) => {
                                          setNewEvaluation({
                                              ...newEvaluation,
                                                evaluationStatus: evaluationStatusOptions.find(status => status.status === e.target.value),
                                                evaluationStatusId: evaluationStatusOptions.find(status => status.status === e.target.value).id
                                          })

                                      }}
                            />
                        </div>

                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createEvaluation} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={() => {
                                setNewEvaluation({});
                                setEvaluationDisplayDialog(false);
                            }}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>

            <Notification status={notification.type} message={notification.message}/>
        </>

    )

}
export default EnrollmentDetails;