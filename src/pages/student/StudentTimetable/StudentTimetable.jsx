import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../../components/Sidebar';
import './StudentTimetable.scss';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchStudentTimetable = async () => {
      try {
        setLoading(true);

        // Get student data from localStorage or API
        const studentData = {
          instituteId: localStorage.getItem('instituteId'),
          classId: localStorage.getItem('classId'),
          divId: localStorage.getItem('divId')
        };

        if (!studentData) {
          throw new Error('Student data not found');
        }

        // Check if student has class and division assigned
        if (!studentData.classId || !studentData.divId || studentData.classId === 'null' || studentData.divId === 'null') {
          setTimetable(null);
          setLoading(false);
          return;
        }

        // Fetch timetable for student's class and division
        const response = await axios.get(
          `http://localhost:5000/timetable/student-timetable/${studentData.instituteId}/${studentData.classId}/${studentData.divId}`
        );

        setTimetable(response.data);
      } catch (error) {
        console.error('Error fetching timetable:', error);
        if (error.response?.status !== 404) {
          toast.error('Failed to fetch timetable');
        }
        setTimetable(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentTimetable();
  }, []);

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="student-timetable-loading">
          Loading timetable...
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="student-timetable-container">
        <ToastContainer />
        <h1>My Timetable</h1>

        {!timetable ? (
          <div className="no-timetable">
            <p>No timetable available for your class and division.</p>
            <p>Please contact your institution if you believe this is an error.</p>
          </div>
        ) : (
          <div className="timetable-table">
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
                  {/* Get all unique time slots from the timetable */}
                  {getAllTimeSlots(timetable).map((timeSlot, index) => (
                    <tr key={index}>
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
                            className={`day-cell ${dayData.type} ${subject?.isBreak ? 'break' : ''}`}
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
                                <div className="teacher">
                                  {!subject.isBreak && subject.teacherName}
                                </div>
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

export default StudentTimetable;