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
  const [displayCalculatorModal, setDisplayCalculatorModal] = useState({ display: false });
  const [timer, setTimer] = useState(
    localStorage.getItem('remaining_time') === null ? (45 * 60) : parseInt(localStorage.getItem('remaining_time'))
  ); //in seconds
  const [questionNumber, setQuestionNumber] = useState(0);
  const [sortData, setSortData] = useState({ list: [], currentSort: "" });
  const [yesNoData, setYesNoData] = useState({ optionList: [], options: [], userOptions: {} });
  // this questionData is always data of the next question after loading next
  const [questionData, setQuestionData] = useState(JSON.parse(localStorage.getItem('question')));
  const [currentData, setCurrentData] = useState({});
  const [endSection, setEndSection] = useState(false);
  const [sectionProgress, setSectionProgress] = useState([]);
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
      // }, 100000)
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
        document.getElementsByClassName("center-cont")[0].innerHTML = localStorage.getItem('review_question');
      } else {
        if (validateProgress()) {
          setQuestionNumber(1);
        }
      }
    }
  }, [firstLoad]);
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

  function ListYesNoOption() {
    const list = yesNoData.optionList === undefined ? [] : yesNoData.optionList
    return list.map(item => {
        return <div key={ item } className="yes-no-row">
          <label className="yes-no-radio">
            <input type="radio" name={ "yes-no-option-" + item } value={ item + "-yes" }
                   checked={ yesNoData.userOptions[item] === 'true' } onChange={ () => "" }
                   onClick={ () => onSelectYesNo(item, 'true') }/>
          </label>
          <label className="yes-no-radio-2">
            <input type="radio" name={ "yes-no-option-" + item } value={ item + "-no" }
                   checked={ yesNoData.userOptions[item] === 'false' } onChange={ () => "" }
                   onClick={ () => onSelectYesNo(item, 'false') }/>
          </label>
          <div className="yes-no-text">{ yesNoData.options[item].content }</div>
        </div>
      }
    );
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

  const onChangeSort = (e) => {
    setSortData({ list: sortData.list, currentSort: e.value })
    document.getElementsByClassName("sort-content")[0].innerHTML =
      currentData['left']['options'][getLabelFromList(sortData.list, e.value)]['content'];
  };
  const onSelectYesNo = (key, value) => {
    yesNoData.userOptions[key] = value;
    setYesNoData({ optionList: yesNoData.optionList, options: yesNoData.options, userOptions: yesNoData.userOptions });
  };

  const onNext = () => {
    setDisplayConfirmModal({
      display: true,
      title: "Response Confirmation",
      description: `Have you completed your response?`,
      action: "continue",
    });
  };
  const updateUserAnswer = () => {
    const userQuestion = {};
    const userAnswer = {};
    const arrangement = currentData['arrangement'];
    userQuestion.arrangement = arrangement;
    if (arrangement === 'center') {
      const centerType = currentData['center']['type'];
      userQuestion.type = centerType;
      if (centerType === "inline_option") {
        userQuestion.correct_option_1 = currentData['center']['answer_data_1']['correct_option'];
        userQuestion.correct_option_2 = currentData['center']['answer_data_2']['correct_option'];
        userAnswer.option_1 = document.getElementById("option_1").value;
        userAnswer.option_2 = document.getElementById("option_2").value;
      }
    } else {
      const rightType = currentData['right']['type'];
      userQuestion.type = rightType;
      userQuestion.options = {};
      userAnswer.options = {};
      if (rightType === "yes_no") {
        currentData['right']['option_list'].split(LIST_SEP).forEach((key, index) => {
          console.log("key: " + key);
          console.log("current data");
          console.log(currentData);
          console.log("yesNoData data");
          console.log(yesNoData);
          userQuestion.options[key] = currentData['right']['options'][key]['is_correct'];
          userAnswer.options[key] = yesNoData.userOptions[key];
        });
      }
    }
    sectionProgress.push({ userQuestion: userQuestion, userAnswer: userAnswer });
    setSectionProgress(sectionProgress);
    console.log(sectionProgress);
  }
  const confirmNext = () => {
    if (isPreview) return;
    updateUserAnswer();
    if (exam[section].totalQuestion === questionNumber) {
      setEndSection(true);
      return;
    }
    setQuestionNumber(questionNumber + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function displayQuestionContent() {
    if (questionData['arrangement'] === 'center') {
      document.getElementsByClassName("center-content")[0].innerHTML = questionData['center']['content'];
      document.getElementsByClassName("center-cont")[0].className = "center-cont";
      document.getElementsByClassName("left-right-cont")[0].className = "left-right-cont hidden";
    } else {
      const leftData = questionData['left'];
      const rightData = questionData['right'];
      document.getElementsByClassName("center-cont")[0].className = "center-cont hidden";
      document.getElementsByClassName("left-right-cont")[0].className = "left-right-cont";
      document.getElementsByClassName("left-description")[0].innerHTML = leftData['content'];
      document.getElementsByClassName("right-description")[0].innerHTML = rightData['content'];
      const list = [];
      leftData['option_list'].split(LIST_SEP).forEach((key, index) => {
        list.push({ value: index.toString(), label: key })
      })
      setSortData({ list: list, currentSort: "0" });
      document.getElementsByClassName("sort-content")[0].innerHTML = leftData['options'][list[0].label]['content'];
      setYesNoData({
        optionList: rightData['option_list'].split(LIST_SEP),
        options: rightData['options'],
        userOptions: {}
      })
    }
    setCurrentData({
      number: questionData.number,
      arrangement: questionData.arrangement,
      center: questionData.center,
      left: questionData.left,
      right: questionData.right
    });
    console.log(progress);
  }

  return <div className="question">
    <Navbar/>
    <div className="data-top">
      <div className="data-top-text">
        Exam { progress.ecode } - { SECTION_LIST.filter(option => option.value === section)[0].label } -
        Question <b>{ questionNumber }/{ exam[section].totalQuestion }</b>
      </div>
      <img className="calculator-image" src={ process.env.PUBLIC_URL + "/icon_calculator.png" }
           onClick={ () => setDisplayCalculatorModal({ display: true }) }/>
      <div className="remaining-time">
        <div className="data-top-text">Remaining Time:&nbsp;<b>{ timerToString() }</b></div>
        <img className="clock-image" src={ process.env.PUBLIC_URL + "/icon_clock.png" }/>
      </div>
    </div>
    <div className="mid-cont">
      <div className="ck-content mid-inner-cont">
        <div className="center-cont hidden">
          <div className="center-content"/>
        </div>
        <div className="left-right-cont hidden">
          <div className="left-cont">
            <div className="left-description"/>
            <div className="sort-cont">
              <b>Sort By</b>
              <Select
                className="sort-select"
                onChange={ onChangeSort }
                options={ sortData.list }
                value={ sortData.list.filter(option => option.value === sortData.currentSort) }/>
              <div className="sort-content"/>
            </div>
          </div>
          <div className="ver-line"/>
          <div className="right-cont">
            <div className="right-description"/>
            <div className="yes-no-cont">
              <div className="yes-no-label-row">
                <label className="yes-no-radio">Yes</label>
                <label className="yes-no-radio-2">No</label>
              </div>
              <ListYesNoOption/>
            </div>
          </div>
        </div>
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