import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import Select, { OnChangeValue, ActionMeta } from 'react-select';
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/SelectOrder.css.scss';
import Modal from 'react-modal';

const list = [
  { value: 'quan', label: 'Quantitative Reasoning' },
  { value: 'verb', label: 'Verbal Reasoning' },
  { value: 'data', label: 'Data Insights' }
];
const SelectOrder = () => {
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
  function ListOption() {
    return <>
      <Select
        className="order-select"
        onChange={ onChange1 }
        options={ list }
        placeholder="Select 1st section"
        value={ list.filter(option => option.value === first) }/>
      <Select
        className="order-select"
        onChange={ onChange2 }
        options={ list.filter(option => option.value !== first) }
        placeholder="Select 2nd section"
        isDisabled={ first === "" }
        value={ list.filter(option => option.value === second) }/>
      <Select
        className="order-select"
        onChange={ onChange3 }
        options={ list.filter(option => option.value !== first && option.value !== second) }
        placeholder=""
        isDisabled={true}
        value={ second === "" ? "" : list.filter(option => option.value !== first && option.value !== second) }/>
    </>;
  }
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

  return <div className="select-order">
    <Navbar/>
    <div className="mid-cont">
      <h2>Select Section Order</h2>
      <p>Select the order in which the exam sections are to be administered</p>
      <ListOption/>
      <button className="but-next" onClick={ onNext }>NEXT</button>
    </div>
    <Modal
      className="warn-modal"
      isOpen={displayModal}
      // onAfterOpen={afterOpenModal}
      // onRequestClose={closeModal}
      contentLabel="Example Modal"
    >
      <div className="modal-nav-top">Cannot Continue</div>
      <div className="description-text">Please select the order in which the exam sections are to be administered</div>
      <button className="but-ok" onClick={ onCloseModal }>OK</button>
    </Modal>
  </div>;
};
export default SelectOrder;