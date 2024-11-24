import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import Select, { OnChangeValue, ActionMeta } from 'react-select';
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/Question.css.scss';
import Modal from 'react-modal';
import CalculatorView from "../elements/CalculatorView";
import ReactModal from "react-modal-resizable-draggable";

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
const SECTION_LIST = [
  { value: 'quan', label: 'Quantitative Reasoning' },
  { value: 'verb', label: 'Verbal Reasoning' },
  { value: 'data', label: 'Data Insights' }
];
const Question = () => {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const isPreview = params.get("preview");
  Modal.appElement = "#root";
  const navigate = useNavigate();
  const [firstLoad, setFirstLoad] = useState(true);
  const [displayConfirmModal, setDisplayConfirmModal] = useState({ display: false });
  const [displayCalculatorModal, setDisplayCalculatorModal] = useState({ display: false });
  const [timer, setTimer] = useState(
    localStorage.getItem('remaining_time') === null ? (45 * 60) : parseInt(localStorage.getItem('remaining_time'))
  ); //in seconds
  const [questionNumber, setQuestionNumber] = useState(0);
  const [questionData, setQuestionData] = useState(JSON.parse(localStorage.getItem('question')));
  const [endSection, setEndSection] = useState(false);
  // const [loadingQuestionNumber, setQuestionData] = useState(0);
  const timerToString = () => {
    let hours = ('0' + Math.floor(timer / 3600)).slice(-2);
    let minutes = ('0' + Math.floor(timer / 60)).slice(-2);
    let seconds = ('0' + timer % 60).slice(-2);
    return hours + ":" + minutes + ":" + seconds;
  }
  const progress = JSON.parse(localStorage.getItem('progress'));
  const exam = JSON.parse(localStorage.getItem('exam'));
  const section = progress[progress.step];
  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => {
        setTimer(timer - 1);
        localStorage.setItem('remaining_time', (timer - 1).toString());
      }, 1000)
    }
  }, [timer]);
  useEffect(() => {
    if (endSection) {
      navigate("/", { replace: true });
    }
  }, [endSection]);
  useEffect(() => {
    if (questionNumber === questionData.number) {
      displayQuestionContent();
      loadNextQuestion();
    }
  }, [questionNumber, questionData]);
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      if (isPreview) {
        document.getElementById("ins_desc").innerHTML = localStorage.getItem('review_question');
      } else {
        if (validateProgress()) {
          setQuestionNumber(1);
        }
      }
    }
  });
  const onCloseConfirmModal = () => {
    setDisplayConfirmModal({ display: false });
  };
  const onCloseCalculatorModal = () => {
    setDisplayCalculatorModal({ display: false });
  };
  const onConfirmConfirmModal = () => {
    if (displayConfirmModal.action === "continue") {
      confirmNext();
    }
    onCloseConfirmModal();
  };

  function validateProgress() {
    return true;
  }

  function displayQuestionContent() {
    document.getElementById("ins_desc").innerHTML = questionData['center']['content'];
  }

  function loadNextQuestion() {
    if (exam[section].totalQuestion === questionNumber) {
      return;
    }
    const questionPath = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + progress.ecode + "/" + section + "/questions/" + (questionNumber + 1);
    onValue(ref(database, questionPath), (snapshot) => {
      const raw = snapshot.val();
      const questionData = {
        number: questionNumber + 1,
        arrangement: raw['arrangement'],
        center: raw['center'],
      }
      setQuestionData(questionData);
    }, {
      onlyOnce: true
    });
  }

  const onNext = () => {
    setDisplayConfirmModal({
      display: true,
      title: "Response Confirmation",
      description: `Have you completed your response?`,
      action: "continue",
    });
  };
  const confirmNext = () => {
    if (isPreview) return;
    if (exam[section].totalQuestion === questionNumber) {
      setEndSection(true);
      return;
    }
    setQuestionNumber(questionNumber + 1);
  };
  return <div className="question">
    <Navbar/>
    <div className="data-top">
      Exam { progress.ecode } - { SECTION_LIST.filter(option => option.value === section)[0].label } -
      Question <b>{ questionNumber }/{ exam[section].totalQuestion }</b>
      <img className="calculator-image" src={ process.env.PUBLIC_URL + "/icon_calculator.png" }
           onClick={ () => setDisplayCalculatorModal({ display: true }) }/>
      <div className="remaining-time">
        <img className="clock-image" src={ process.env.PUBLIC_URL + "/icon_clock.png" }/>
        Remaining Time:&nbsp;<b>{ timerToString() }</b>
      </div>
    </div>
    <div className="mid-cont">
      <div className="instruction-cont ck-content">
        <div id="ins_desc" className="instruction-desc"/>
      </div>
      <button className="but-next-bottom" onClick={ onNext }>NEXT</button>
    </div>
    <ReactModal
      left={ 900 }
      top={ 70 }
      initWidth={ 260 }
      initHeight={ 450 }
      className={ "calculator-modal" }
      isOpen={ displayCalculatorModal.display }>
      <div className="inline">
        <img className="calculator-close-icon" src={ process.env.PUBLIC_URL + "/icon_close.png" }
             onClick={ onCloseCalculatorModal }/>
        <h3 className={ "calculator-label" }>Calculator</h3>
      </div>
      <CalculatorView/>
    </ReactModal>
    <Modal
      className="confirm-modal"
      isOpen={ displayConfirmModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayConfirmModal.title }</div>
      <div className="description-text">{ displayConfirmModal.description }</div>
      <div className="container-but">
        <button className="but-cancel" onClick={ onCloseConfirmModal }>Cancel</button>
        <button className="but-ok" onClick={ onConfirmConfirmModal }>Next Question</button>
      </div>
    </Modal>
  </div>;
};
export default Question;