import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/SectionReview.css.scss';
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
const SECTION_LIST = [
  { value: 'quan', label: 'Quantitative Reasoning' },
  { value: 'verb', label: 'Verbal Reasoning' },
  { value: 'data', label: 'Data Insights' }
];
const SectionReview = () => {
  const LIST_SEP = ",_";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const isPreview = params.get("preview");
  Modal.appElement = "#root";
  const navigate = useNavigate();
  const [firstLoad, setFirstLoad] = useState(true);
  const [displayConfirmModal, setDisplayConfirmModal] = useState({ display: false });
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });
  const [questionNumber, setQuestionNumber] = useState(0);
  const [questionData, setQuestionData] = useState(JSON.parse(localStorage.getItem('question')));
  const [endSection, setEndSection] = useState(false);
  const [sectionProgress, setSectionProgress] = useState([]);
  const [remainingAnswer, setRemainingAnswer] = useState(0);
  const timerToString = () => {
    const h = Math.floor(timer / (3600 * 1000));
    const m = Math.floor((timer - h * 3600 * 1000) / (60 * 1000));
    const s = Math.floor((timer - h * 3600 * 1000 - m * 60 * 1000) / 1000);
    console.log("h: " + h + ", m: " + m + ", s: " + s);
    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
  }
  const progress = JSON.parse(localStorage.getItem('progress'));
  const exam = JSON.parse(localStorage.getItem('exam'));
  const section = progress[progress.step];
  const timeMultiplier = parseFloat(localStorage.getItem('time_multiplier'));
  const timeInterval = isNaN(timeMultiplier) ? 1000 : (1000 / timeMultiplier);
  let timer = localStorage.getItem('remaining_time') === null ? (45 * 60 * 1000) : parseInt(localStorage.getItem('remaining_time'));
  // let timer = localStorage.getItem('remaining_time') === null ? (5 * 60 * 1000) : parseInt(localStorage.getItem('remaining_time'));

  function myConfirmation() {
    // not work on browser default refresh/exit
    return 'Please complete the exam.';
  }

  window.onbeforeunload = myConfirmation;
  useEffect(() => {
    if (endSection) {
      navigate("/", { replace: true });
    }
  }, [endSection]);
  useEffect(() => {
    if (questionNumber === questionData.number) {
      // displayQuestionContent();
      loadNextQuestion();
    }
  }, [questionNumber, questionData]);
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      if (isPreview) {
        document.getElementsByClassName("center-cont")[0].innerHTML = localStorage.getItem('review_question');
      } else {
        const secProgress = JSON.parse(localStorage.getItem("section_progress_" + section));
        console.log("progress");
        console.log(progress);
        console.log("secProgress");
        console.log(secProgress);
        setSectionProgress(secProgress)
        const answer = parseInt(localStorage.getItem('remaining_answer'));
        setRemainingAnswer(isNaN(answer) ? 3 : answer);
        // if (validateProgress()) {
        //   setQuestionNumber(1);
        //   runTimer();
        // }
      }
    }
    if (typeof window?.MathJax !== "undefined") {
      window.MathJax.typesetClear();
      window.MathJax.typeset();
    }
  });
  const onCloseConfirmModal = () => {
    setDisplayConfirmModal({ display: false });
  };
  const onCloseWarnModal = () => {
    setDisplayWarnModal({ display: false });
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

  function runTimer() {
    const timerHtml = document.getElementById("timer");
    if (timer > 0 && timerHtml != null) {
      setTimeout(() => {
        // console.log("current=" + Date.now() + ", timer=" + timer);
        timer = timer - 1000;
        timerHtml.innerHTML = timerToString();
        localStorage.setItem('remaining_time', (timer - 1000).toString());
        runTimer();
      }, timeInterval)
    }
  }

  function onEditAnswer(questionNumber) {
    if (remainingAnswer === 0) {
      setDisplayWarnModal({
        display: true,
        title: "Cannot edit answer",
        description: "You already edited 3 answers. Please continue the exam."
      });
      return;
    }
    localStorage.setItem("remaining_answer", (remainingAnswer - 1).toString());
    setRemainingAnswer(remainingAnswer - 1);
    navigate("/question?is_review_and_edit=true&question_number=" + questionNumber, { replace: true });
  }

  function ListQuestionLabelColumn(props) {
    return <div key={ "label-" + props.columnIndex } className="question-row">
      <div className="cell label-left-cell">Question</div>
      <div className="cell label-right-cell">Bookmarked</div>
    </div>;
  }

  function ListQuestionOptionColumn(props) {
    const columnIndex = props.columnIndex;
    return sectionProgress.slice(10 * columnIndex, Math.min(10 * columnIndex + 10, sectionProgress.length))
      .map((item, index) => {
          const questionNumber = (index + 1) + columnIndex * 10;
          return <div key={ index + "-op-" + columnIndex } className="question-row">
            {/*<div className="cell question-cell"><a href="/">{questionNumber}</a></div>*/ }
            <div className="cell">
              <div className="question-number-text"
                   onClick={ () => onEditAnswer(questionNumber) }> { questionNumber }</div>
            </div>
            <div className="cell"></div>
          </div>;
        }
      );
  }

  function ListQuestionOption() {
    const size = sectionProgress.length;
    console.log("size: " + size);
    if (size === 0) return;
    return Array(Math.ceil(size / 10)).fill(1).map((item, index) => {
      return <div key={ index + "column" } className="question-column">
        <ListQuestionLabelColumn columnIndex={ index }/>
        <ListQuestionOptionColumn columnIndex={ index }/>
      </div>
    });
  }

  function loadNextQuestion() {
    if (exam[section].totalQuestion === questionNumber) {
      return;
    }
    const questionPath = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + progress.ecode + "/" + section + "/questions/" + (questionNumber + 1);
    onValue(ref(database, questionPath), (snapshot) => {
      const raw = snapshot.val();
      const newQuestionData = {
        number: questionNumber + 1,
        arrangement: raw['arrangement'],
        center: raw['center'],
        left: raw['left'],
        right: raw['right'],
      }
      setQuestionData(newQuestionData);
    }, { onlyOnce: true });
  }

  function getLabelFromList(list, value) {
    return list.filter(item => item.value === value)[0].label;
  }

  const onNext = () => {
    setDisplayConfirmModal({
      display: true,
      title: "End Section Review",
      description: `Do you want to end this section's review? If you click Yes, you will NOT be able to return to this section again.`,
      action: "continue",
    });
  };
  const confirmNext = () => {
    if (progress.step === "third") {
      navigate("/exam-result", { replace: true });
    } else {
      progress.step = progress.step === "first" ? "second" : "third";
      localStorage.setItem('progress', JSON.stringify(progress));
      localStorage.setItem('break_and_end_page_type', 'break_instructions');
      console.log(localStorage.getItem("progress"));
      navigate("/break-and-end-page", { replace: true });
    }
  };
  return <div className="section-review">
    <Navbar/>
    <div className="data-top">
      <div className="data-top-text">
        Review Center: { getLabelFromList(SECTION_LIST, section) }
      </div>
      <div className="remaining-cont">
        <div className="remaining-time">
          <div className="data-top-text">Remaining Time:&nbsp;<b id="timer">00:45:00</b></div>
          <img className="clock-image" src={ process.env.PUBLIC_URL + "/icon_clock.png" }/>
        </div>
        <div className="remaining-answer">
          <div className="data-top-text">Remaining Answer Edits:&nbsp;<b>{ remainingAnswer }</b></div>
        </div>
      </div>
    </div>
    <div className="mid-cont">
      <div className="ck-content mid-inner-cont">
        <div className="center-cont">
          <div className="center-content">
            <h3><b>Click on a Question below to Review & Edit</b></h3>
            <p>You can review any question (regardless of bookmark status) and edit up to three (3) answers in this
              section before the section time expires. The section time and number of answer edits remaining are shown
              in the upper right-hand corner.</p>
            <div className="review-table-cont">
              <ListQuestionOption/>
            </div>
          </div>
        </div>
      </div>
      <button className="but-next-bottom" onClick={ onNext }>End Section Review</button>
    </div>
    <Modal
      className="confirm-modal"
      isOpen={ displayConfirmModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayConfirmModal.title }</div>
      <div className="description-text">{ displayConfirmModal.description }</div>
      <div className="container-but">
        <button className="but-cancel" onClick={ onCloseConfirmModal }>No</button>
        <button className="but-ok" onClick={ onConfirmConfirmModal }>Yes</button>
      </div>
    </Modal>
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
export default SectionReview;