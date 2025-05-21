import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ShowClasses.scss';

const ShowClasses = () => {
  const { instituteId } = useParams();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    console.log(instituteId);
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/crmclass/get-classes/${instituteId}`);
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [instituteId]);

  return (
    <div className="show-classes-container">
      <h1>All Classes for Institute</h1>
      {classes.length === 0 ? (
        <p>No classes available.</p>
      ) : (
        <div className="class-list">
          {classes.map((classItem) => (
            <div key={classItem.classId} className="class-card">
              <h2>{classItem.className}</h2>

              <h3>Divisions</h3>
              <ul>
                {classItem.divisions.map((division) => (
                  <li key={division.divisionId}>{division.divisionName}</li>
                ))}
              </ul>

              <h3>Subjects</h3>
              <ul>
                {classItem.subjects.map((subject) => (
                  <li key={subject.subjectId}>{subject.subjectName}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowClasses;
