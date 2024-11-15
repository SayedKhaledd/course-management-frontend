import React from 'react';
import 'primeicons/primeicons.css'; // For using icons
import GenericCourses from "../components/GenericCourses.jsx";

function Courses() {


    return (
        <>
            <GenericCourses header={"Courses"}></GenericCourses>
            <div style={{margin: '10px'}}></div>

            <GenericCourses header={"Initial Courses"} isInitial={true}></GenericCourses>
        </>
    );
}

export default Courses;
