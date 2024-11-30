import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/SelectOrder.css.scss';
import Modal from 'react-modal';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_DOMAIN,
  databaseURL: process.env.REACT_APP_DB_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_ST_BUC,
  messagingSenderId: process.env.REACT_APP_MESS_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASURE_ID,
};
const list = [
  { value: 'quan', label: 'Quantitative Reasoning' },
  { value: 'verb', label: 'Verbal Reasoning' },
  { value: 'data', label: 'Data Insights' }
];
const SelectOrder = () => {
  const LIST_SEP = ",_";
  Modal.appElement = "#root";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const [firstLoad, setFirstLoad] = useState(true);
  const navigate = useNavigate()
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");
  const [doneLoadingFbData, setDoneLoadingFbData] = useState(false);
  const [waitingToNextPage, setWaitingToNextPage] = useState(false);
  const [displayModal, setDisplayModal] = useState(false);
  const [displayLoadingModal, setDisplayLoadingModal] = useState({ display: false });
  const ecode = localStorage.getItem('ecode');
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      readFirebaseData();
    }
    if (waitingToNextPage && doneLoadingFbData) {
      navigateToNextPage()
    }
  });
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
  function readFirebaseData() {
    const examPath = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + ecode;
    onValue(ref(database, examPath), (snapshot) => {
      const raw = snapshot.val();
      const examData = {};
      ["data", "quan", "verb"].forEach((section) => {
        const rawSection = raw ? raw[section] : '';
        const questionList = rawSection ? rawSection['question_list'] : '';
        examData[section] = { questionList: questionList, totalQuestion: questionList.split(LIST_SEP).length }
      });
      console.log(examData);
      localStorage.setItem('exam', JSON.stringify(examData));
      setDoneLoadingFbData(true);
    }, {
      onlyOnce: true
    });
  }

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
        isDisabled={ true }
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
    setWaitingToNextPage(true);
    setDisplayLoadingModal({ display: true, description: "Loading exam data..." });
  };
  const navigateToNextPage = () => {
    const progress = { step: "first", first: first, second: second, third: third, ecode: ecode}
    localStorage.setItem('progress', JSON.stringify(progress));
    navigate("/instructions", { replace: true });
  }
  const onCloseModal = () => {
    setDisplayModal(false);
  };
  const onCloseLoadingModal = () => {
    setWaitingToNextPage(false);
    setDisplayLoadingModal({ display: false });
  };
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
      isOpen={ displayModal }
      // onAfterOpen={afterOpenModal}
      // onRequestClose={closeModal}
      contentLabel="Warn Modal"
    >
      <div className="modal-nav-top">Cannot Continue</div>
      <div className="description-text">Please select the order in which the exam sections are to be administered</div>
      <button className="but-ok" onClick={ onCloseModal }>OK</button>
    </Modal>

    <Modal
      className="loading-modal"
      isOpen={ displayLoadingModal.display }
      contentLabel="Loading Modal">
      <img className="loading-image" src={ process.env.PUBLIC_URL + "/loading.gif" }/>
      <div className="description-text">{ displayLoadingModal.description }</div>
      <button className="but-ok" onClick={ onCloseLoadingModal }>Cancel</button>
    </Modal>
  </div>;
};
export default SelectOrder;