import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import Select, { OnChangeValue, ActionMeta } from 'react-select';
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/SecData.css.scss';
import Modal from 'react-modal';

const SecData = () => {
  console.log("data: " + localStorage.getItem('test_e_data'));

  Modal.appElement = "#root";
  const navigate = useNavigate();
  const [displayModal, setDisplayModal] = useState(false);

  useEffect(() => {
    document.getElementById("ins_desc").innerHTML = localStorage.getItem('test_e_data');
  });
  const onNext = () => {
  };
  const onCloseModal = () => {
    setDisplayModal(false);
  };

  console.log(localStorage.getItem('ecode'));

  return <div className="sec-data">
    <Navbar/>
    <div className="mid-cont">
      <div className="instruction-cont">
        <div id="ins_desc" className="instruction-desc"/>
      </div>
      <button className="but-next-bottom" onClick={ onNext }>NEXT</button>
    </div>

    <Modal className="warn-modal" isOpen={ displayModal }>
      <div className="modal-nav-top">Cannot Continue</div>
      <div className="description-text">Please select the order in which the exam sections are to be administered</div>
      <button className="but-ok" onClick={ onCloseModal }>OK</button>
    </Modal>
  </div>;
};
export default SecData;