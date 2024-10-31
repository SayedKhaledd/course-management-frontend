import Enrollment from "../components/Enrollment.jsx";
import {useParams} from "react-router-dom";
import React from "react";
import CourseDetailsCard from "../components/CourseDetailsCard.jsx";
import CourseLecturers from "../components/CourseLecturers.jsx";

const CourseDetails = () => {
    const {id} = useParams();
    return (
        <>
            <CourseDetailsCard/>
            <Enrollment courseId={id}/>
            <div style={{margin: '10px'}}></div>
            <CourseLecturers/>
        </>
    );
}
export default CourseDetails;