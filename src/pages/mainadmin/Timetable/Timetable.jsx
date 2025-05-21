import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Timetable.scss';

const Timetable = () => {
  const { instituteId } = useParams();
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDivId, setSelectedDivId] = useState('');
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [breakTimes, setBreakTimes] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/timetable/classes/${instituteId}`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes. Please try again.');
    }
  };

  const fetchDivisions = async (classId) => {
    try {
      const response = await axios.get(`http://localhost:5000/timetable/divisions/${classId}`);
      setDivisions(response.data);
      setSelectedClassId(classId);
      fetchSubjects(classId);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      toast.error('Failed to fetch divisions. Please try again.');
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      const response = await axios.get(`http://localhost:5000/timetable/subjects/${classId}`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects. Please try again.');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/timetable/teachers/${instituteId}`);
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to fetch teachers. Please try again.');
    }
  };

  const handleSelectDay = (day) => {
    const existingDay = days.find(d => d.day === day);
    if (existingDay) {
      setSelectedDay(existingDay);
    } else {
      const newDay = { day, type: 'regular', subjects: [] };
      setSelectedDay(newDay);
    }
  };

  const handleSaveDay = () => {
    if (!selectedDay) return;

    // Remove the day if it's a holiday with no subjects
    if (selectedDay.type === 'holiday') {
      setDays(days.filter(d => d.day !== selectedDay.day).concat(selectedDay));
    } else {
      // Validate subjects (skip validation for breaks)
      for (let subject of selectedDay.subjects) {
        if (!subject.isBreak) { // Only validate non-break subjects
          if (!subject.subjectName || !subject.teacherId) {
            toast.error('Please select a subject and teacher for all non-break periods.');
            return;
          }
        }

        // Validate time slots for all subjects (including breaks)
        if (!subject.startTime || !subject.endTime) {
          toast.error('Please set start and end times for all periods.');
          return;
        }
      }

      setDays([
        ...days.filter(d => d.day !== selectedDay.day),
        selectedDay
      ]);
    }

    toast.success(`Day ${selectedDay.day} saved successfully!`);
  };

  const handleTypeChange = (type) => {
    setSelectedDay({
      ...selectedDay,
      type,
      subjects: type === 'regular' ? [] : null
    });
  };

  const handleAddSubject = () => {
    setSelectedDay({
      ...selectedDay,
      subjects: [
        ...selectedDay.subjects,
        { subjectName: '', startTime: '', endTime: '', teacherId: '' }
      ]
    });
  };

  const handleAddBreak = () => {
    setSelectedDay({
      ...selectedDay,
      subjects: [
        ...selectedDay.subjects,
        { subjectName: 'Break', startTime: '', endTime: '', isBreak: true }
      ]
    });
  };

  const handleSubjectChange = (index, key, value) => {
    const updatedSubjects = [...selectedDay.subjects];
    updatedSubjects[index][key] = value;
    setSelectedDay({
      ...selectedDay,
      subjects: updatedSubjects
    });
  };

  const handleRemoveSubject = (index) => {
    setSelectedDay({
      ...selectedDay,
      subjects: selectedDay.subjects.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!selectedClassId || !selectedDivId) {
      toast.error('Please select class and division');
      return;
    }

    try {
      const data = {
        classId: selectedClassId,
        divisionId: selectedDivId,
        createdBy: 'Admin',
        instituteId,
        days
      };
      await axios.post('http://localhost:5000/timetable/create', data);
      toast.success('Timetable created successfully!');
    } catch (error) {
      console.error('Error creating timetable:', error);
      toast.error('Failed to create timetable. Please try again.');
    }
  };

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="timetable-container">
      <h1>Create Timetable</h1>

      <div className="form-section">
        <label>Select Class:</label>
        <select onChange={(e) => fetchDivisions(e.target.value)}>
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.classId} value={cls.classId}>{cls.className}</option>
          ))}
        </select>

        {divisions.length > 0 && (
          <>
            <label>Select Division:</label>
            <select onChange={(e) => setSelectedDivId(e.target.value)}>
              <option value="">Select Division</option>
              {divisions.map((div) => (
                <option key={div.divisionId} value={div.divisionId}>{div.divisionName}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="days-selection">
        <h2>Select Days</h2>
        <div className="day-buttons">
          {weekDays.map((day) => {
            const isConfigured = days.some(d => d.day === day);
            return (
              <button
                key={day}
                className={`day-button ${isConfigured ? 'configured' : ''} ${selectedDay?.day === day ? 'active' : ''}`}
                onClick={() => handleSelectDay(day)}
              >
                {day}
                {isConfigured && <span className="checkmark">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="day-configuration">
          <h2>Configure {selectedDay.day}</h2>

          <div className="day-type">
            <label>Day Type:</label>
            <select
              value={selectedDay.type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="regular">Regular</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>

          {selectedDay.type === 'regular' && (
            <>
              <div className="subjects-list">
                {selectedDay.subjects.map((subject, index) => (
                  <div key={index} className="subject-item">
                    {subject.isBreak ? (
                      <h4>Break Time</h4>
                    ) : (
                      <>
                        <label>Subject:</label>
                        <select
                          value={subject.subjectName}
                          onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                          disabled={subject.isBreak}
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((sub) => (
                            <option key={sub.subjectId} value={sub.subjectName}>{sub.subjectName}</option>
                          ))}
                        </select>

                        <label>Teacher:</label>
                        <select
                          value={subject.teacherId}
                          onChange={(e) => handleSubjectChange(index, 'teacherId', e.target.value)}
                          disabled={subject.isBreak}
                        >
                          <option value="">Select Teacher</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.teacherId} value={teacher.teacherId}>{teacher.name}</option>
                          ))}
                        </select>
                      </>
                    )}

                    <div className="time-inputs">
                      <label>Start Time:</label>
                      <input
                        type="time"
                        value={subject.startTime}
                        onChange={(e) => handleSubjectChange(index, 'startTime', e.target.value)}
                      />

                      <label>End Time:</label>
                      <input
                        type="time"
                        value={subject.endTime}
                        onChange={(e) => handleSubjectChange(index, 'endTime', e.target.value)}
                      />
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveSubject(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="action-buttons">
                <button onClick={handleAddSubject}>Add Subject</button>
                <button onClick={handleAddBreak}>Add Break</button>
                <button onClick={handleSaveDay}>Save Day</button>
              </div>
            </>
          )}

          {selectedDay.type === 'holiday' && (
            <div className="holiday-message">
              <p>This day is marked as a holiday. No classes will be scheduled.</p>
              <button onClick={handleSaveDay}>Save as Holiday</button>
            </div>
          )}
        </div>
      )}

      {days.length > 0 && (
        <div className="submit-section">
          <button className="submit-btn" onClick={handleSubmit}>
            Create Timetable
          </button>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Timetable;