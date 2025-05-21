import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ForgotPassword.scss"

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Verify OTP, Step 3: Reset password

    const navigate = useNavigate();

    const handleSendOTP = async () => {
        try {
            const response = await fetch("http://localhost:5000/auth/main-forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("OTP sent to your email!", {
                    position: "top-center",
                    autoClose: 3000,
                });
                setStep(2);
            } else {
                toast.error(data.message || "Failed to send OTP", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong. Try again later.", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    };

    const handleVerifyOTP = async () => {
        try {
            const response = await fetch("http://localhost:5000/auth/main-verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("OTP verified successfully!", {
                    position: "top-center",
                    autoClose: 3000,
                });
                setStep(3);
            } else {
                toast.error(data.message || "Invalid OTP", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong. Try again later.", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    };

    const handleResetPassword = async () => {
        try {
            const response = await fetch("http://localhost:5000/auth/main-pass-reset", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Password reset successfully!", {
                    position: "top-center",
                    autoClose: 3000,
                });
                setTimeout(() => navigate("/login"), 2000);
            } else {
                toast.error(data.message || "Failed to reset password", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong. Try again later.", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>

            {step === 1 && (
                <div className="step-container">
                    <p>Enter your email to receive an OTP:</p>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleSendOTP} className="action-button">Send OTP</button>
                </div>
            )}

            {step === 2 && (
                <div className="step-container">
                    <p>Enter the OTP sent to your email:</p>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleVerifyOTP} className="action-button">Verify OTP</button>
                </div>
            )}

            {step === 3 && (
                <div className="step-container">
                    <p>Enter your new password:</p>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleResetPassword} className="action-button">Reset Password</button>
                </div>
            )}

            <ToastContainer 
                position="top-center"
                autoClose={3000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastClassName="custom-toast"
                bodyClassName="toast-body"
            />
        </div>
    );
};

export default ForgotPassword;