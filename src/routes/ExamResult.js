import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/ExamResult.css.scss';
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
const ExamResult = () => {
  Modal.appElement = "#root";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const [firstLoad, setFirstLoad] = useState(true);
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const isPreview = params.get("preview");
  const navigate = useNavigate();
  const progress = JSON.parse(localStorage.getItem('progress'));
  const [quanData, setQuanData] = useState({ correct: -1, total: -1 });
  const [dataData, setDataData] = useState({ correct: -1, total: -1 });
  const [verbData, setVerbData] = useState({ correct: -1, total: -1 });

  function isAnswerCorrect(a) {
    const type = a.userQuestion['type'];
    if (type === 'inline_option' || type === 'two_part') {
      return a.userQuestion['correct_option_1'] === a.userAnswer['option_1'] &&
        a.userQuestion['correct_option_2'] === a.userAnswer['option_2'];
    } else if (type === 'single_choice' || type === 'math') {
      return a.userQuestion['correct_option'] === a.userAnswer['option']
    } else if (type === 'yes_no') {
      let isCorrect = true;
      Object.getOwnPropertyNames(a.userQuestion.options).forEach(key => {
        console.log("key=" + key);
        console.log("a.userQuestion.options[key]=" + a.userQuestion.options[key]);
        console.log("a.userAnswer.options[key]=" + a.userAnswer.options[key]);
        if (a.userQuestion.options[key] !== a.userAnswer.options[key]) {
          isCorrect = false;
        }
      })
      return isCorrect;
    }
    return false;
  }

  function calculateCorrectNumber(sectionProgress) {
    let correct = 0;
    sectionProgress.forEach((a, i) => {
      if (isAnswerCorrect(a)) {
        correct += 1;
        console.log("correct index=" + i);
      }
    });
    return correct;
  }

  function processScore() {
    const quanProgress = JSON.parse(localStorage.getItem('section_progress_quan'));
    console.log("quanProgress");
    console.log(quanProgress);
    setQuanData({ correct: calculateCorrectNumber(quanProgress), total: quanProgress.length })

    const dataProgress = JSON.parse(localStorage.getItem('section_progress_data'));
    console.log("dataProgress");
    console.log(dataProgress);
    setDataData({ correct: calculateCorrectNumber(dataProgress), total: dataProgress.length })

    const verbProgress = JSON.parse(localStorage.getItem('section_progress_verb'));
    console.log("verbProgress");
    console.log(verbProgress);
    setVerbData({ correct: calculateCorrectNumber(verbProgress), total: verbProgress.length })
  }

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      if (validateProgress()) {
        processScore();
      }
    }
  });
  const onCloseWarnModal = () => {
    setDisplayWarnModal({ display: false });
  };
  const onNext = () => {
    localStorage.setItem('break_and_end_page_type', 'whiteboard_confirm');
    navigate("/break-and-end-page", { replace: true });
  };

  function validateProgress() {
    return true;
  }

  function totalCorrect() {
    if (quanData.correct === -1) return '';
    if (verbData.correct === -1) return '';
    if (dataData.correct === -1) return '';
    return quanData.correct + verbData.correct + dataData.correct;
  }

  function totalTotal() {
    if (quanData.total === -1) return '';
    if (verbData.total === -1) return '';
    if (dataData.total === -1) return '';
    return quanData.total + verbData.total + dataData.total;
  }

  function hidableNumber(num) {
    return num < 0 ? '' : num.toString();
  }

  return <div className="exam-result">
    <Navbar/>
    <div className="mid-cont">
      <div className="score-cont">
        <div className="inner-score-cont">
          <h2><b>Practice Exam Score</b></h2>
          <div className="score-table">
            <div className="score-row">
              <div className="label-cell"></div>
              <div className="correct-cell"><b>Correct Answer</b></div>
              <div className="question-cell"><b>Number of Question</b></div>
            </div>
            <div className="score-row">
              <div className="label-cell">Quantitative Reasoning</div>
              <div className="correct-cell">{ hidableNumber(quanData.correct) }</div>
              <div className="question-cell">{ hidableNumber(quanData.total) }</div>
            </div>
            <div className="score-row">
              <div className="label-cell">Verbal Reasoning</div>
              <div className="correct-cell">{ hidableNumber(verbData.correct) }</div>
              <div className="question-cell">{ hidableNumber(verbData.total) }</div>
            </div>
            <div className="score-row">
              <div className="label-cell">Data Insights</div>
              <div className="correct-cell">{ hidableNumber(dataData.correct) }</div>
              <div className="question-cell">{ hidableNumber(dataData.total) }</div>
            </div>
            <div className="score-row">
              <div className="label-cell"><b>Total</b></div>
              <div className="correct-cell"><b>{ totalCorrect() }</b></div>
              <div className="question-cell"><b>{ totalTotal() }</b>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="score-description hidden">These are your scores for this Practice Exam. At the very end of this
        Practice Exam, you will be able to view
        the Score Report which provides an extensive overview of this score.</p>
      <div className="but-bottom-cont">
        <button onClick={ onNext }>NEXT</button>
      </div>
    </div>
    <Modal
      className="warn-modal"
      isOpen={ displayWarnModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayWarnModal.title }</div>
      <div className="description-text">{ displayWarnModal.description }</div>
      <button className="but-ok" onClick={ onCloseWarnModal }>OK</button>
    </Modal>
  </div>;
};
export default ExamResult;