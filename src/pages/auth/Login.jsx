import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await fetch('http://localhost:5000/auth/mainlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        // Maintain your existing localStorage format
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('adminId', data.user.adminId || '');
        localStorage.setItem('instituteId', data.user.instituteId || 'N/A');

        // Store teacherId if role is teacher (added this line)
        if (data.user.role === 'teacher') {
          localStorage.setItem('teacherId', data.user.teacherId || '');
        }

        if (data.user.role === 'student') {
          localStorage.setItem('studentId', data.user.studentId || '');
          localStorage.setItem('classId', data.user.classId || '');
          localStorage.setItem('divId', data.user.divId || '');
        }

        // Also store complete user data as you were doing before
        localStorage.setItem('user', JSON.stringify({
          role: data.user.role,
          instituteId: data.user.instituteId || 'N/A',
          userId: data.user.id,
          name: data.user.name,
          email: data.user.email,
          ...(data.user.role === 'student' && {
            studentId: data.user.studentId || '',
            classId: data.user.classId || '',
            divId: data.user.divId || ''
          }),
          ...(data.user.role === 'teacher' && {
            teacherId: data.user.teacherId || ''
          })
        }));
        toast.success('Login successful! Redirecting...');

        switch (data.user.role) {
          case 'mainadmin': navigate('/mainadmin'); break;
          case 'admin': navigate('/admin'); break;
          case 'teacher': navigate('/teacher'); break;
          case 'student': navigate('/student'); break;
          default: navigate('/');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Login</h1>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label>Email:</label>
                <Field type="email" name="email" />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <Field type="password" name="password" />
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <div className="spinner"></div> : 'Login'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="additional-links">
          <Link to="/forgotpass">Forgot Password?</Link>
          <Link to="/register">New User? Register Here</Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;