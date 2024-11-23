import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import Select, { OnChangeValue, ActionMeta } from 'react-select';
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/SecQuestion.css.scss';
import Modal from 'react-modal';

const SecQuestion = () => {
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const isPreview = params.get("preview");
  Modal.appElement = "#root";
  const navigate = useNavigate();
  const [displayModal, setDisplayModal] = useState(false);

  useEffect(() => {
    if (isPreview) {
      document.getElementById("ins_desc").innerHTML = localStorage.getItem('review_question');
    }
  });
  const onNext = () => {
    if (isPreview) return
    const value1 = document.getElementById("cars").value;
    console.log("value 1: " + value1);
  };
  const onCloseModal = () => {
    setDisplayModal(false);
  };

  console.log(localStorage.getItem('ecode'));

  return <div className="sec-question">
    <Navbar/>
    <div className="mid-cont">
      <div className="instruction-cont ck-content">
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
export default SecQuestion;