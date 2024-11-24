import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/AdminDashboard.css.scss';
import CalculatorView from "../elements/CalculatorView";
import ReactModal from 'react-modal-resizable-draggable';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  return <div className="admin-dashboard">
    <Navbar/>
    <div className="mid-cont">
      <h1>Hello, Admin</h1>
      <div className="description-text">Please choose what you want to do today</div>
      <button className="but-option" onClick={ () => navigate("/edit-exam-details") }>Edit Exam Details</button>
      {/*<button className="but-option" onClick={ () => navigate("/edit-exam-instructions") }>Edit Exam Instructions*/ }
      <button className="but-option" onClick={ () => openModal() }>Edit Exam Instructions
      </button>

      <ReactModal
        left={ 1000 }
        top={ 70 }
        initWidth={ 260 }
        initHeight={ 450 }
        className={ "calculator-modal" }
        isOpen={ modalIsOpen }>
        <div className="inline">
          <img className="calculator-close-icon" src={ process.env.PUBLIC_URL + "/icon_close.png" }
               onClick={ closeModal }/>
          <h3 className={ "calculator-label" }>Calculator</h3>
        </div>
        <CalculatorView/>
      </ReactModal>
    </div>
  </div>;
};
export default AdminDashboard;