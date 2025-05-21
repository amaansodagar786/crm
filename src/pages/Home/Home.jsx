import React from "react";
import "./home.scss"; // Import global SCSS file

const Home = () => {
  return (
    <div className="home-container">
      <div className="content">
        <h1>Welcome to Our CRM</h1>
        <p>Manage your institute efficiently with our powerful CRM solution.</p>
        <button className="get-started-btn">Get Started</button>
      </div>
    </div>
  );
};

export default Home;
