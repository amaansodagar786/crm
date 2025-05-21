import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddStuDetails.scss';
import { useParams } from 'react-router-dom';

const AddStuDetails = () => {
  const { instituteId } = useParams();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDivId, setSelectedDivId] = useState('');
  const [newRollNo, setNewRollNo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchRollNo, setSearchRollNo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Component mounted with instituteId:', instituteId);
    fetchStudents();
  }, [instituteId]);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Fetching students for institute:', instituteId);
    
    try {
      const response = await axios.get(`http://localhost:5000/crmclass/students/${instituteId}`);
      console.log('Students API response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        // Sort students by createdAt in descending order (newest first)
        const sortedStudents = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log('Sorted students:', sortedStudents);
        
        setStudents(sortedStudents);
        
        if (sortedStudents.length === 0) {
          console.warn('No students found for this institute');
          toast.info('No students found for this institute');
        }
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid data format received from server');
        toast.error('Failed to load student data');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
      toast.error('Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = async (student) => {
    console.log('Edit clicked for student:', student);
    setSelectedStudent(student);
    setNewRollNo(student.rollNo || '');
    setIsEditing(true);

    try {
      console.log('Fetching classes for institute:', student.instituteId);
      const classResponse = await axios.get(`http://localhost:5000/crmclass/classes/${student.instituteId}`);
      console.log('Classes API response:', classResponse.data);
      
      setClasses(classResponse.data);
      
      if (student.classId) {
        console.log('Student has existing classId, fetching divisions:', student.classId);
        const divResponse = await axios.get(`http://localhost:5000/crmclass/divisions/${student.classId}`);
        console.log('Divisions API response:', divResponse.data);
        setDivisions(divResponse.data);
      }
    } catch (error) {
      console.error('Error in edit process:', error);
      toast.error('Failed to fetch class/division data');
    }
  };

  const handleClassChange = async (classId) => {
    console.log('Class changed to:', classId);
    setSelectedClassId(classId);
    try {
      const divResponse = await axios.get(`http://localhost:5000/crmclass/divisions/${classId}`);
      console.log('Divisions fetched:', divResponse.data);
      setDivisions(divResponse.data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      toast.error('Failed to fetch divisions');
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedStudent) {
      console.error('No student selected for update');
      return;
    }

    console.log('Saving changes for student:', selectedStudent.studentId, {
      classId: selectedClassId || selectedStudent.classId,
      divId: selectedDivId || selectedStudent.divId,
      rollNo: newRollNo,
    });

    const updatedData = {
      classId: selectedClassId || selectedStudent.classId,
      divId: selectedDivId || selectedStudent.divId,
      rollNo: newRollNo,
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/crmclass/students/${selectedStudent.studentId}`,
        updatedData
      );
      console.log('Update successful:', response.data);
      toast.success('Student details updated successfully');
      fetchStudents();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student details');
    }
  };

  // Filter students by name and roll number
  const filteredStudents = students.filter((student) => {
    const matchesName = student.name.toLowerCase().includes(searchName.toLowerCase());
    // const matchesRollNo = student.rollNo?.toString().includes(searchRollNo);
    // return matchesName && matchesRollNo;
    return matchesName ;
  });

  console.log('Current filtered students:', filteredStudents);

  return (
    <div className="student-details-container">
      <h1>Manage Student Details</h1>

      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <p>Institute ID: {instituteId}</p>
          <p>Total Students: {students.length}</p>
          <p>Filtered Students: {filteredStudents.length}</p>
          <p>Status: {isLoading ? 'Loading...' : error ? `Error: ${error}` : 'Ready'}</p>
        </div>
      )}

      {/* Search Filters */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by roll number"
          value={searchRollNo}
          onChange={(e) => setSearchRollNo(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="loading-message">Loading students...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredStudents.length === 0 ? (
        <div className="no-results-message">
          {students.length === 0
            ? 'No students found for this institute'
            : 'No students match your search criteria'}
        </div>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Institute</th>
              <th>Roll No</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <React.Fragment key={student.studentId}>
                <tr>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.phoneNo}</td>
                  <td>{student.instituteName}</td>
                  <td>{student.rollNo || 'N/A'}</td>
                  <td>
                    <button className="edit-button" onClick={() => handleEditClick(student)}>
                      Edit
                    </button>
                  </td>
                </tr>
                {isEditing && selectedStudent?.studentId === student.studentId && (
                  <tr className="editable-row">
                    <td colSpan="6">
                      <div className="student-edit-section">
                        <label>Class</label>
                        <select
                          onChange={(e) => handleClassChange(e.target.value)}
                          value={selectedClassId || selectedStudent.classId || ''}
                        >
                          <option value="">Select Class</option>
                          {classes.map((cls) => (
                            <option key={cls.classId} value={cls.classId}>
                              {cls.className}
                            </option>
                          ))}
                        </select>

                        <label>Division</label>
                        <select
                          onChange={(e) => setSelectedDivId(e.target.value)}
                          value={selectedDivId || selectedStudent.divId || ''}
                        >
                          <option value="">Select Division</option>
                          {divisions.map((div) => (
                            <option key={div.divisionId} value={div.divisionId}>
                              {div.divisionName}
                            </option>
                          ))}
                        </select>

                        <label>Roll Number</label>
                        <input
                          type="text"
                          value={newRollNo}
                          onChange={(e) => setNewRollNo(e.target.value)}
                          placeholder="Enter Roll Number"
                        />

                        <div className="edit-buttons">
                          <button onClick={handleSaveChanges}>Save Changes</button>
                          <button onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
      <ToastContainer
        position="top-center"
        autoClose={3000}
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

export default AddStuDetails;