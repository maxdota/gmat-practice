import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/AdminDashboard.css.scss';

const AdminDashboard = () => {
  const navigate = useNavigate();
  return <div className="admin-dashboard">
    <Navbar/>
    <div className="mid-cont">
      <h1>Hello, Admin</h1>
      <div className="description-text">Please choose what you want to do today</div>
      <button className="but-option" onClick={ () => navigate("/edit-exam-details") }>Edit Exam Details</button>
      <button className="but-option" onClick={ () => navigate("/edit-exam-instructions") }>Edit Exam Instructions
      </button>
    </div>
  </div>;
};
export default AdminDashboard;