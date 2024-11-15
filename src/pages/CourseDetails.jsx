import Enrollment from "../components/Enrollment.jsx";
import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import CourseDetailsCard from "../components/cards/CourseDetailsCard.jsx";
import CourseLecturers from "../components/CourseLecturers.jsx";
import useAxios from "../hooks/useAxios.js";
import Notification from "../components/Notification.jsx";
import apiEndpoints from "../apiEndpoints.js";

const CourseDetails = () => {
    const {id} = useParams();
    const axios = useAxios();
    const [course, setCourse] = useState(null);
    const [courseStatusOptions, setCourseStatusOptions] = useState([]);
    const [notification, setNotification] = useState({message: '', type: ''});
    const [referralSourceOptions, setReferralSourceOptions] = useState([]);


    const fetchCourse = () => {
        axios.get(apiEndpoints.course(id))
            .then(response => setCourse(response.data.response))
            .catch(error => console.error(error));
    }
    const fetchCourseStatusOptions = () => {
        axios.get(apiEndpoints.courseStatuses)
            .then(response => {
                setCourseStatusOptions(response.data.response);
            })
            .catch(error => console.error(error));
    }
    const fetchReferralSourceOptions = () => {
        axios.get(apiEndpoints.referralSources)
            .then(response => {
                setReferralSourceOptions(response.data.response.map(source => ({
                    source: source.source,
                    id: source.id
                })));
            }).catch(error => {
            setNotification({message: 'Failed to fetch referral source options' + error, type: 'error'});
        });
    }


    useEffect(() => {

        fetchCourse();
        fetchCourseStatusOptions();
        fetchReferralSourceOptions()
    }, []);

    if (!course) return null;


    return (
        <>
            <CourseDetailsCard
                setNotification={setNotification} notification={notification} course={course}
                setCourse={setCourse} courseStatusOptions={courseStatusOptions}
                fetchCourse={fetchCourse}/>
            <Enrollment
                course={course}
                fetchCourse={fetchCourse}
                setNotification={setNotification}
                referralSourceOptions={referralSourceOptions}
            />
            <div style={{margin: '10px'}}></div>
            <CourseLecturers/>
            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}
export default CourseDetails;