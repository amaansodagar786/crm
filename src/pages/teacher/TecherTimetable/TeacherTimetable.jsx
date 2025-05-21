import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../../components/Sidebar';
import './TeacherTimetable.scss';

const TeacherTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchTeacherTimetables = async () => {
      try {
        setLoading(true);
        
        // Get teacher data from localStorage
        const teacherData = JSON.parse(localStorage.getItem('user'));
        if (!teacherData || teacherData.role !== 'teacher') {
          throw new Error('Teacher data not found');
        }

        // Fetch teacher's timetables using the new endpoint
        const response = await axios.get(
          `http://localhost:5000/timetable/teacher-timetable/${teacherData.instituteId}/${teacherData.teacherId}`
        );
        
        setTimetables(response.data);
      } catch (error) {
        console.error('Error fetching timetables:', error);
        toast.error('Failed to fetch timetables');
        setTimetables([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherTimetables();
  }, []);

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="teacher-timetable-loading">
          Loading timetables...
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="teacher-timetable-container">
        <ToastContainer />
        <h1>My Timetables</h1>
        
        {timetables.length === 0 ? (
          <div className="no-timetables">
            <p>No timetables available for your assigned classes.</p>
            <p>Please contact your institution if you believe this is an error.</p>
          </div>
        ) : (
          <div className="timetables-grid">
            {timetables.map((timetable, index) => (
              <div key={index} className="timetable-card">
                <div className="timetable-header">
                  <h2>{timetable.className} - {timetable.divisionName}</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Time/Day</th>
                        {daysOfWeek.map((day) => (
                          <th key={day}>{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getAllTimeSlots(timetable).map((timeSlot, idx) => (
                        <tr key={idx}>
                          <td className="time-slot">
                            {timeSlot}
                          </td>
                          {daysOfWeek.map((dayName) => {
                            const dayData = timetable.days.find(d => 
                              d.day.toLowerCase() === dayName.toLowerCase()
                            ) || { day: dayName, type: 'none', subjects: [] };
                            
                            // Find subject for this time slot
                            const subject = dayData.type === 'regular' 
                              ? dayData.subjects.find(sub => 
                                  `${sub.startTime} - ${sub.endTime}` === timeSlot
                                )
                              : null;

                            return (
                              <td 
                                key={dayName} 
                                className={`day-cell ${dayData.type} ${subject?.isBreak ? 'break' : ''} ${subject?.isTeacherLecture ? 'teacher-lecture' : ''}`}
                              >
                                {dayData.type === 'holiday' ? (
                                  <span className="holiday">Holiday</span>
                                ) : dayData.type === 'none' ? (
                                  <span className="no-class">No Class</span>
                                ) : subject ? (
                                  <div className="subject-info">
                                    <div className="subject-name">
                                      {subject.isBreak ? 'BREAK' : subject.subjectName}
                                    </div>
                                    {!subject.isBreak && (
                                      <div className="teacher">
                                        {subject.teacherName}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="free">Free</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// Helper function to get all unique time slots from a timetable
const getAllTimeSlots = (timetable) => {
  const timeSlots = new Set();
  
  timetable.days.forEach(day => {
    if (day.type === 'regular' && day.subjects) {
      day.subjects.forEach(subject => {
        const slot = `${subject.startTime} - ${subject.endTime}`;
        timeSlots.add(slot);
      });
    }
  });

  // Convert to array and sort by start time
  return Array.from(timeSlots).sort((a, b) => {
    const [aStart] = a.split(' - ');
    const [bStart] = b.split(' - ');
    return aStart.localeCompare(bStart);
  });
};

export default TeacherTimetable;