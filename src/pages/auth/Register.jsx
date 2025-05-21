import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AiOutlineUser, AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { BiSolidInstitution } from "react-icons/bi";
import { FiPhone } from "react-icons/fi";
import { MdPhotoCamera } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./Register.scss";

const Register = () => {
  const [institutes, setInstitutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/auth/get-inst")
      .then((response) => response.json())
      .then((data) => {
        setInstitutes(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching institutes:", error);
      });
  }, []);

  const initialValues = {
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    instituteId: "",
    photo: null,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Invalid phone number")
      .required("Phone number is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    role: Yup.string().oneOf(["student", "teacher", "admin"], "Invalid role").required("Role is required"),
    instituteId: Yup.string().required("Institute selection is required"),
    photo: Yup.mixed().required("Profile photo is required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setIsLoading(true);
    console.log("Submitted Form Data:", values);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phoneNo", values.phone);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("role", values.role);
      formData.append("instituteId", values.instituteId);
      formData.append("photo", values.photo);

      const response = await fetch("http://localhost:5000/auth/mainregister", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration Successful!");
        resetForm();
      } else {
        toast.error(data.message || "Registration Failed");
        resetForm();
      }
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error("An error occurred during registration");
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register</h2>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ setFieldValue, values }) => (
            <Form className="register-form">
              <div className="input-group">
                <AiOutlineUser className="icon" />
                <Field type="text" name="name" placeholder="Full Name" />
              </div>
              <ErrorMessage name="name" component="div" className="error-message" />

              <div className="input-group">
                <FiPhone className="icon" />
                <Field type="text" name="phone" placeholder="Phone Number" />
              </div>
              <ErrorMessage name="phone" component="div" className="error-message" />

              <div className="input-group">
                <AiOutlineMail className="icon" />
                <Field type="email" name="email" placeholder="Email Address" />
              </div>
              <ErrorMessage name="email" component="div" className="error-message" />

              <div className="input-group">
                <AiOutlineLock className="icon" />
                <Field type="password" name="password" placeholder="Password" />
              </div>
              <ErrorMessage name="password" component="div" className="error-message" />

              <div className="input-group">
                <AiOutlineLock className="icon" />
                <Field type="password" name="confirmPassword" placeholder="Confirm Password" />
              </div>
              <ErrorMessage name="confirmPassword" component="div" className="error-message" />

              <div className="select-group">
                <label>Role:</label>
                <Field as="select" name="role">
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </Field>
              </div>
              <ErrorMessage name="role" component="div" className="error-message" />

              <div className="select-group">
                <label>Institute:</label>
                <Field as="select" name="instituteId">
                  <option value="">Select Institute</option>
                  {Array.isArray(institutes) &&
                    institutes.map((inst) => (
                      <option key={inst.instituteId} value={inst.instituteId}>
                        {inst.instituteName}
                      </option>
                    ))}
                </Field>
              </div>
              <ErrorMessage name="instituteId" component="div" className="error-message" />

              <div className="file-input">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={(event) => setFieldValue("photo", event.currentTarget.files[0])}
                />
                <label htmlFor="photo">
                  <MdPhotoCamera className="icon" />
                  <span>Upload Profile Photo</span>
                </label>
                {values.photo && <span className="file-name">{values.photo.name}</span>}
              </div>
              <ErrorMessage name="photo" component="div" className="error-message" />

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </button>

              {/* Already have an account? Link to Login */}
              <div className="login-link">
                <p>Already have an account? <Link to="/login">Login here</Link></p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
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

export default Register;
