import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import './StuProfile.scss';

const StuProfile = () => {
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/student/${studentId}`);
        setStudent(response.data);
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    phoneNo: Yup.string().required('Phone number is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    address: Yup.string().nullable(),
    fatherName: Yup.string().nullable(),
    fatherNo: Yup.string().nullable(),
    fatherEmail: Yup.string().email('Invalid email').nullable(),
    fatherOccupation: Yup.string().nullable(),
    motherName: Yup.string().nullable(),
    motherNo: Yup.string().nullable(),
    motherEmail: Yup.string().email('Invalid email').nullable(),
    motherOccupation: Yup.string().nullable(),
  });

  const handleSubmit = async (values) => {
    try {
      const { fatherName, fatherNo, fatherEmail, fatherOccupation, motherName, motherNo, motherEmail, motherOccupation, ...studentData } = values;

      const updatedData = {
        ...studentData,
        parentDetails: {
          fatherName,
          fatherNo,
          fatherEmail,
          fatherOccupation,
          motherName,
          motherNo,
          motherEmail,
          motherOccupation,
        },
      };

      console.log("Payload being sent:", updatedData); // Log the payload

      const response = await axios.put(`http://localhost:5000/student/${studentId}`, updatedData);
      setStudent(response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating student details:', error);
      alert('Failed to update profile.');
    }
  };

  if (!student) {
    return <div className="loading">Loading...</div>;
  }

  // Extract parent details safely
  const parentDetails = student.parentDetails || {};

  return (
    <div className="profile-container">
      <h1 className="profile-title">Student Profile</h1>

      {isEditing ? (
        <Formik
          initialValues={{
            name: student.name || '',
            phoneNo: student.phoneNo || '',
            email: student.email || '',
            address: student.address || '',
            classId: student.classId || '',
            divId: student.divId || '',
            rollNo: student.rollNo || '',
            fatherName: parentDetails.fatherName || '',
            fatherNo: parentDetails.fatherNo || '',
            fatherEmail: parentDetails.fatherEmail || '',
            fatherOccupation: parentDetails.fatherOccupation || '',
            motherName: parentDetails.motherName || '',
            motherNo: parentDetails.motherNo || '',
            motherEmail: parentDetails.motherEmail || '',
            motherOccupation: parentDetails.motherOccupation || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="profile-form">
              {/* Student Details */}
              <div className="form-group">
                <label>Name</label>
                <Field type="text" name="name" />
                <ErrorMessage name="name" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <Field type="text" name="phoneNo" />
                <ErrorMessage name="phoneNo" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <Field type="email" name="email" />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Address</label>
                <Field type="text" name="address" />
                <ErrorMessage name="address" component="div" className="error-message" />
              </div>

              {/* Non-Editable Fields */}
              <div className="form-group">
                <label>Class ID</label>
                <Field type="text" name="classId" disabled />
              </div>

              <div className="form-group">
                <label>Division ID</label>
                <Field type="text" name="divId" disabled />
              </div>

              <div className="form-group">
                <label>Roll Number</label>
                <Field type="text" name="rollNo" disabled />
              </div>

              {/* Parent Details */}
              <h2>Parent Details</h2>
              <div className="form-group">
                <label>Father's Name</label>
                <Field type="text" name="fatherName" />
                <ErrorMessage name="fatherName" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Father's Phone Number</label>
                <Field type="text" name="fatherNo" />
                <ErrorMessage name="fatherNo" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Father's Email</label>
                <Field type="email" name="fatherEmail" />
                <ErrorMessage name="fatherEmail" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Father's Occupation</label>
                <Field type="text" name="fatherOccupation" />
                <ErrorMessage name="fatherOccupation" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Mother's Name</label>
                <Field type="text" name="motherName" />
                <ErrorMessage name="motherName" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Mother's Phone Number</label>
                <Field type="text" name="motherNo" />
                <ErrorMessage name="motherNo" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Mother's Email</label>
                <Field type="email" name="motherEmail" />
                <ErrorMessage name="motherEmail" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Mother's Occupation</label>
                <Field type="text" name="motherOccupation" />
                <ErrorMessage name="motherOccupation" component="div" className="error-message" />
              </div>

              <button type="submit" className="save-button">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="profile-details">
          {/* Student Details */}
          <div className="detail-group">
            <label>Name:</label>
            <p>{student.name || 'N/A'}</p>
          </div>
          <div className="detail-group">
            <label>Phone Number:</label>
            <p>{student.phoneNo || 'N/A'}</p>
          </div>
          <div className="detail-group">
            <label>Email:</label>
            <p>{student.email || 'N/A'}</p>
          </div>
          <div className="detail-group">
            <label>Address:</label>
            <p>{student.address || 'N/A'}</p>
          </div>

          {/* Non-Editable Fields */}
          <div className="detail-group">
            <label>Class ID:</label>
            <p>{student.classId || 'N/A'}</p>
          </div>
          <div className="detail-group">
            <label>Division ID:</label>
            <p>{student.divId || 'N/A'}</p>
          </div>
          <div className="detail-group">
            <label>Roll Number:</label>
            <p>{student.rollNo || 'N/A'}</p>
          </div>

          {/* Parent Details */}
          <h2>Parent Details</h2>
          {Object.entries(parentDetails).map(([key, value]) => (
            <div key={key} className="detail-group">
              <label>{key.replace(/([A-Z])/g, ' $1')}:</label>
              <p>{value || 'N/A'}</p>
            </div>
          ))}

          <button onClick={() => setIsEditing(true)} className="edit-button">Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default StuProfile;