import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './Showtimetable.scss';

const Showtimetable = () => {
  const { instituteId } = useParams();
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTimetables, setExpandedTimetables] = useState({});
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTimetables();
  }, [instituteId]);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/timetable/showtimetable/${instituteId}`);
      setTimetables(response.data);
      
      // Initialize all timetables as collapsed
      const collapsedState = {};
      response.data.forEach(tt => {
        collapsedState[tt._id] = false;
      });
      setExpandedTimetables(collapsedState);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (timetableId) => {
    navigate(`/timetable/edit/${timetableId}`);
  };

  const handleDelete = async (timetableId) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      try {
        await axios.delete(`http://localhost:5000/timetable/delete/${timetableId}`);
        toast.success('Timetable deleted successfully');
        fetchTimetables();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to delete timetable');
      }
    }
  };

  const toggleExpand = (timetableId) => {
    setExpandedTimetables(prev => ({
      ...prev,
      [timetableId]: !prev[timetableId]
    }));
  };

  if (loading) {
    return <div className="loading">Loading timetables...</div>;
  }

  return (
    <div className="showtimetable-container">
      <ToastContainer />
      <div className="header">
        <h1>Timetables</h1>
        <button 
          className="create-btn"
          onClick={() => navigate(`/mainadmin/timetable/${instituteId}`)}
        >
          Create New Timetable
        </button>
      </div>

      {timetables.length === 0 ? (
        <div className="no-timetables">
          <p>No timetables available.</p>
          <button 
            className="create-btn"
            onClick={() => navigate(`/timetable/create/${instituteId}`)}
          >
            Create New Timetable
          </button>
        </div>
      ) : (
        <div className="timetables-wrapper">
          {timetables.map((timetable) => (
            <div key={timetable._id} className="timetable-table">
              <div className="timetable-header">
                <h2>{timetable.className} - {timetable.divisionName}</h2>
                <div className="actions">
                  {/* <button 
                    className="edit-btn"
                    onClick={() => handleEdit(timetable.timetableId)}
                  >
                    Edit
                  </button> */}
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(timetable.timetableId)}
                  >
                    Delete
                  </button>
                  <button 
                    className="expand-btn"
                    onClick={() => toggleExpand(timetable._id)}
                    aria-label={expandedTimetables[timetable._id] ? 'Collapse' : 'Expand'}
                  >
                    {expandedTimetables[timetable._id] ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
              </div>
              
              {expandedTimetables[timetable._id] && (
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
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

export default Showtimetable;