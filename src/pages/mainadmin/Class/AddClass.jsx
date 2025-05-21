import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddClass.scss';

const AddClass = () => {
  const { instituteId } = useParams();
  const navigate = useNavigate();

  const [className, setClassName] = useState('');
  const [divisions, setDivisions] = useState(['']);
  const [subjects, setSubjects] = useState(['']);
  const [isLoading, setIsLoading] = useState(false); // Loading state for submit button

  // Log instituteId to ensure it's correct
  useEffect(() => {
    console.log('Institute ID:', instituteId);
  }, [instituteId]);

  const handleAddDivision = () => setDivisions([...divisions, '']);
  const handleAddSubject = () => setSubjects([...subjects, '']);

  const handleDivisionChange = (index, value) => {
    const updatedDivisions = [...divisions];
    updatedDivisions[index] = value;
    setDivisions(updatedDivisions);
  };

  const handleSubjectChange = (index, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = value;
    setSubjects(updatedSubjects);
  };

  const handleRemoveDivision = (index) => {
    const updatedDivisions = divisions.filter((_, i) => i !== index);
    setDivisions(updatedDivisions);
  };

  const handleRemoveSubject = (index) => {
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading animation

    try {
      const response = await axios.post('http://localhost:5000/crmclass/create-class', {
        className,
        instituteId,
        divisions,
        subjects,
      });

      toast.success(response.data.message); // Show success toast
      // Clear form data
      setClassName('');
      setDivisions(['']);
      setSubjects(['']);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create class'); // Show error toast
    } finally {
      setIsLoading(false); // Stop loading animation
    }
  };

  return (
    <div className="add-class-container">
      <h1>Create Class for Institute</h1>
      <form onSubmit={handleSubmit}>
        <label>Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter Class Name"
          required
        />

        <h2>Divisions</h2>
        {divisions.map((division, index) => (
          <div key={index} className="input-group">
            <input
              type="text"
              value={division}
              onChange={(e) => handleDivisionChange(index, e.target.value)}
              placeholder="Enter Division Name"
              required
            />
            <button type="button" onClick={() => handleRemoveDivision(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={handleAddDivision}>+ Add Division</button>

        <h2>Subjects</h2>
        {subjects.map((subject, index) => (
          <div key={index} className="input-group">
            <input
              type="text"
              value={subject}
              onChange={(e) => handleSubjectChange(index, e.target.value)}
              placeholder="Enter Subject Name"
              required
            />
            <button type="button" onClick={() => handleRemoveSubject(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={handleAddSubject}>+ Add Subject</button>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <span className="loading-spinner"></span> // Show loading spinner
          ) : (
            'Submit'
          )}
        </button>
      </form>

      {/* Toast Container */}
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

export default AddClass;