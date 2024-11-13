import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import Select, { OnChangeValue, ActionMeta } from 'react-select';
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/SecData.css.scss';
import Modal from 'react-modal';

const list = [
  { value: 'quan', label: 'Quantitative Reasoning' },
  { value: 'verb', label: 'Verbal Reasoning' },
  { value: 'data', label: 'Data Insights' }
];

const SecData = () => {
  console.log("data: " + localStorage.getItem('test_e_data'));

  Modal.appElement = "#root";
  const navigate = useNavigate()
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");
  const [displayModal, setDisplayModal] = useState(false);
  const onChange1 = (e) => {
    setFirst(e.value)
    setSecond("");
    setThird("");
  };
  const onChange2 = (e) => {
    setSecond(e.value);
    setThird(list.filter(option => option.value !== first && option.value !== second)[0].value);
  };
  const onChange3 = (e) => {
    setThird(e.value)
  };

  useEffect(() => {
    document.getElementById("ins_desc").innerHTML = localStorage.getItem('test_e_data');
  });
  const onNext = () => {
    if (first === "" || second === "" || third === "") {
      setDisplayModal(true);
      return;
    }
    localStorage.setItem('first', first);
    localStorage.setItem('second', second);
    localStorage.setItem('third', third);
    navigate("/")
  };
  const onCloseModal = () => {
    setDisplayModal(false);
  };

  console.log(localStorage.getItem('ecode'));

  return <div className="sec-data">
    <Navbar/>
    <div className="mid-cont">
      <div className="instruction-cont">
        <h2>Data Insights Instructions</h2>
        <div id="ins_desc" className="instruction-desc">Select the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administered</div>
        {/*<div className="instruction-desc">Select the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administeredSelect the order <pre>in which the exam</pre> sections are to be administered</div>*/}
      </div>
      <button className="but-next-bottom" onClick={ onNext }>NEXT</button>
    </div>

    <Modal className="warn-modal" isOpen={ displayModal } >
      <div className="modal-nav-top">Cannot Continue</div>
      <div className="description-text">Please select the order in which the exam sections are to be administered</div>
      <button className="but-ok" onClick={ onCloseModal }>OK</button>
    </Modal>
  </div>;
};
export default SecData;