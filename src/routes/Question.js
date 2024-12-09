import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import Select from 'react-select';
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
  const isReviewAndEdit = params.get("is_review_and_edit");
  const reviewQuestionNumber = params.get("question_number");
  Modal.appElement = "#root";
  const navigate = useNavigate();
  const [firstLoad, setFirstLoad] = useState(true);
  const [displayConfirmModal, setDisplayConfirmModal] = useState({ display: false });
  const [displayCalculatorModal, setDisplayCalculatorModal] = useState({ display: false });
  const [questionNumber, setQuestionNumber] = useState(0);
  const [sortData, setSortData] = useState({ list: [], currentSort: "" });
  const [tabData, setTabData] = useState({ list: [], currentTab: "" });
  const [yesNoData, setYesNoData] = useState({ optionList: [], options: [], userOptions: {} });
  const [singleChoiceCenterData, setSingleChoiceCenterData] = useState({ optionList: [], options: [] });
  const [singleChoiceData, setSingleChoiceData] = useState({ optionList: [], options: [] });
  const [twoPartData, setTwoPartData] = useState({ optionList: [], options: [] });
  // this questionData is always data of the next question after loading next
  const [questionData, setQuestionData] = useState(JSON.parse(localStorage.getItem('question')));
  const [currentData, setCurrentData] = useState({});
  const [parentQuestions, setParentQuestions] = useState({});
  const [currentParentNumber, setCurrentParentNumber] = useState('1');
  const progress = JSON.parse(localStorage.getItem('progress'));
  const exam = JSON.parse(localStorage.getItem('exam'));
  const section = progress[progress.step];
  const [sectionProgress, setSectionProgress] = useState(isReviewAndEdit ? JSON.parse(localStorage.getItem("section_progress_" + section)) : []);
  const timerToString = () => {
    const h = Math.floor(timer / (3600 * 1000));
    const m = Math.floor((timer - h * 3600 * 1000) / (60 * 1000));
    const s = Math.floor((timer - h * 3600 * 1000 - m * 60 * 1000) / 1000);
    // console.log("h: " + h + ", m: " + m + ", s: " + s);
    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
  }
  const timeMultiplier = parseFloat(localStorage.getItem('time_multiplier'));
  const timeInterval = isNaN(timeMultiplier) ? 1000 : (1000 / timeMultiplier);
  // let timer = localStorage.getItem('remaining_time') === null ? (45 * 60 * 1000) : parseInt(localStorage.getItem('remaining_time'));
  let timer = localStorage.getItem('remaining_time') === null ? (45 * 60 * 1000) : parseInt(localStorage.getItem('remaining_time'));

  function myConfirmation() {
    // not work on browser default refresh/exit
    return 'Please complete the exam.';
  }

  window.onbeforeunload = myConfirmation;
  useEffect(() => {
    if (questionNumber === questionData.number) {
      displayQuestionContent();
      loadQuestionData(questionNumber + 1);
    } else if (isReviewAndEdit && reviewQuestionNumber === questionData.number) {
      displayQuestionContent();
    }
  }, [questionNumber, questionData]);
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      if (isPreview) {
        document.getElementsByClassName("center-cont")[0].innerHTML = localStorage.getItem('review_question');
        return;
      }
      const parentQ = JSON.parse(localStorage.getItem("parent_questions"));
      if (isReviewAndEdit) {
        console.log("review question: " + reviewQuestionNumber);
        console.log('reading parent q');
        console.log(parentQ);
        setParentQuestions(parentQ === null ? {} : parentQ);
        loadQuestionData(reviewQuestionNumber);
        // runTimer();
      } else {
        if (validateProgress()) {
          setQuestionNumber(1);
          setParentQuestions(parentQ === null ? {} : parentQ);
          runTimer();
        }
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

  function ListTabOption() {
    const list = tabData.list
    return list.map(item => {
        return <li key={ item.value } className={ "tab-cell" + (item.value === tabData.currentTab ? " tab-active" : "") }
                   onClick={ () => onChangeTab(item.value) }>{ item.label }</li>
      }
    );
  }

  function ListTwoPartOption() {
    const list = twoPartData.optionList === undefined ? [] : twoPartData.optionList
    return list.map(item => {
        return <div key={ item } className="two-part-row">
          <label className="two-part-radio">
            <input type="radio" name={ "two-part-option-1" } value={ item + "-yes-1" }
                   checked={ twoPartData.userOption1 === item } onChange={ () => "" }
                   onClick={ () => onSelectTwoPart(item, '1') }/>
          </label>
          <label className="two-part-radio-2">
            <input type="radio" name={ "two-part-option-2" } value={ item + "-yes-2" }
                   checked={ twoPartData.userOption2 === item } onChange={ () => "" }
                   onClick={ () => onSelectTwoPart(item, '2') }/>
          </label>
          <div className="two-part-text">{ twoPartData.options[item] }</div>
        </div>
      }
    );
  }

  function ListSingleChoiceCenterOption() {
    const list = singleChoiceCenterData.optionList === undefined ? [] : singleChoiceCenterData.optionList
    return list.map(item => {
        return <div key={ item } className={ SingleChoiceClass() }>
          <label className="single-choice-radio">
            <input type="radio" name="single-choice-option-center"
                   value={ item + "-single-choice-center" }
                   checked={ singleChoiceCenterData.userOption === item } onChange={ () => "" }
                   onClick={ () => onSelectSingleChoiceCenter(item) }/>
            <div className="single-choice-text">{ SingleChoiceText(singleChoiceCenterData.options[item]) }</div>
          </label>
        </div>
      }
    );
  }

  function CenterContentClass() {
    return "center-content" + (singleChoiceCenterData.centerType === "math" ? ' math-font-size' : '');
  }

  function SingleChoiceClass() {
    return "single-choice-row" + (singleChoiceCenterData.centerType === "math" ? ' math-font-size' : '');
  }

  function SingleChoiceText(text) {
    return singleChoiceCenterData.centerType === "math" ? `\\(${ text }\\)` : text;
  }

  function ListSingleChoiceOption() {
    const list = singleChoiceData.optionList === undefined ? [] : singleChoiceData.optionList
    return list.map(item => {
        return <div key={ item } className="single-choice-row">
          <label className="single-choice-radio">
            <input type="radio" name={ "single-choice-option" }
                   value={ item + "-single-choice" }
                   checked={ singleChoiceData.userOption === item } onChange={ () => "" }
                   onClick={ () => onSelectSingleChoice(item) }/>
            <div className="single-choice-text">{ singleChoiceData.options[item] }</div>
          </label>
        </div>
      }
    );
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

  function loadParentQuestionLeftData(parentNumber) {
    console.log("loadParentQuestionLeftData " + parentNumber);
    const questionPath = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + progress.ecode + "/" + section + "/questions/" + parentNumber;
    onValue(ref(database, questionPath), (snapshot) => {
      const raw = snapshot.val();
      displayLeftData(raw['left'], raw['left']['type'])
    }, { onlyOnce: true });
  }

  function loadQuestionData(number) {
    if (exam[section].totalQuestion < number) {
      return;
    }
    const questionPath = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + progress.ecode + "/" + section + "/questions/" + number;
    onValue(ref(database, questionPath), (snapshot) => {
      const raw = snapshot.val();
      const newQuestionData = {
        number: number,
        arrangement: raw['arrangement'],
        center: raw['center'],
        left: raw['left'],
        right: raw['right'],
      }
      console.log("newQuestionData");
      console.log(newQuestionData);
      setQuestionData(newQuestionData);
    }, { onlyOnce: true });
  }

  function getLabelFromList(list, value) {
    return list.filter(item => item.value === value)[0].label;
  }

  const onChangeSort = (e) => {
    setSortData({ list: sortData.list, currentSort: e.value, options: sortData.options })
    document.getElementsByClassName("sort-content")[0].innerHTML =
      sortData.options[getLabelFromList(sortData.list, e.value)]['content'];
  };
  const onChangeTab = (value) => {
    setTabData({ list: tabData.list, currentTab: value, options: tabData.options })
    document.getElementsByClassName("tab-content")[0].innerHTML =
      tabData.options[getLabelFromList(tabData.list, value)]['content'];
  };
  const onSelectYesNo = (key, value) => {
    yesNoData.userOptions[key] = value;
    setYesNoData({ optionList: yesNoData.optionList, options: yesNoData.options, userOptions: yesNoData.userOptions });
  };
  const onSelectSingleChoiceCenter = (key) => {
    singleChoiceCenterData.userOption = key;
    setSingleChoiceCenterData({
      centerType: singleChoiceCenterData.centerType,
      optionList: singleChoiceCenterData.optionList,
      options: singleChoiceCenterData.options,
      userOption: singleChoiceCenterData.userOption,
    });
  };
  const onSelectSingleChoice = (key) => {
    singleChoiceData.userOption = key;
    setSingleChoiceData({
      optionList: singleChoiceData.optionList,
      options: singleChoiceData.options,
      userOption: singleChoiceData.userOption,
    });
  };
  const onSelectTwoPart = (key, optionIndex) => {
    if (optionIndex === "1") {
      twoPartData.userOption1 = key;
    } else {
      twoPartData.userOption2 = key;
    }
    setTwoPartData({
      optionList: twoPartData.optionList,
      options: twoPartData.options,
      userOption1: twoPartData.userOption1,
      userOption2: twoPartData.userOption2
    });
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
      } else if (centerType === "two_part") {
        userQuestion.correct_option_1 = currentData['center']['answer_data_1']['correct_option'];
        userQuestion.correct_option_2 = currentData['center']['answer_data_2']['correct_option'];
        userAnswer.option_1 = twoPartData.userOption1;
        userAnswer.option_2 = twoPartData.userOption2;
      } else if (centerType === "single_choice" || centerType === "math") {
        userQuestion.correct_option = currentData['center']['answer_data']['correct_option'];
        userAnswer.option = singleChoiceCenterData.userOption;
      }
    } else {
      const rightType = currentData['right']['type'];
      userQuestion.type = rightType;
      userQuestion.options = {};
      userAnswer.options = {};
      if (rightType === "yes_no") {
        currentData['right']['option_list'].split(LIST_SEP).forEach(key => {
          userQuestion.options[key] = currentData['right']['options'][key]['is_correct'];
          userAnswer.options[key] = yesNoData.userOptions[key];
        });
      } else if (rightType === "single_choice") {
        userQuestion.correct_option = currentData['right']['correct_option'];
        userAnswer.option = singleChoiceData.userOption;
      }
    }
    if (isReviewAndEdit) {
      sectionProgress[reviewQuestionNumber - 1] = { userQuestion: userQuestion, userAnswer: userAnswer };
    } else {
      sectionProgress.push({ userQuestion: userQuestion, userAnswer: userAnswer });
    }
    setSectionProgress(sectionProgress);
    console.log(sectionProgress);
  }
  const confirmNext = () => {
    if (isPreview) return;
    updateUserAnswer();
    if (exam[section].totalQuestion === questionNumber || isReviewAndEdit) {
      localStorage.setItem("section_progress_" + section, JSON.stringify(sectionProgress));
      navigate("/section-review", { replace: true });
      return;
    }
    setQuestionNumber(questionNumber + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const showCont = (contClass) => {
    document.getElementsByClassName(contClass)[0].className = contClass;
  }
  const showContIndent = (contClass) => {
    document.getElementsByClassName(contClass)[0].className = contClass + " indent-text";
  }
  const hideCont = (contClass) => {
    document.getElementsByClassName(contClass)[0].className = contClass + " hidden";
  }

  function buttonNextText() {
    return isReviewAndEdit ? "Return to Review Center" : "NEXT";
  }

  function displayLeftData(leftData, leftType) {
    if (leftType === "sort_table") {
      const list = [];
      leftData['option_list'].split(LIST_SEP).forEach((key, index) => {
        list.push({ value: index.toString(), label: key })
      })
      showCont("left-description");
      document.getElementsByClassName("left-description")[0].innerHTML = leftData['content'];
      showCont("sort-cont");
      hideCont("tab-cont");
      hideCont("normal-cont");
      setSortData({ list: list, currentSort: "0", options: leftData['options'] });
      document.getElementsByClassName("sort-content")[0].innerHTML = leftData['options'][list[0].label]['content'];
    } else if (leftType === "multi_tabs") {
      const list = [];
      leftData['option_list'].split(LIST_SEP).forEach((key, index) => {
        list.push({ value: index.toString(), label: key })
      })
      hideCont("left-description");
      hideCont("sort-cont");
      showContIndent("tab-cont");
      hideCont("normal-cont");
      setTabData({ list: list, currentTab: "0", options: leftData['options'] });
      document.getElementsByClassName("tab-content")[0].innerHTML = leftData['options'][list[0].label]['content'];
    } else if (leftType === "normal") {
      hideCont("left-description");
      hideCont("sort-cont");
      hideCont("tab-cont");
      showContIndent("normal-cont");
      document.getElementsByClassName("normal-content")[0].innerHTML = leftData['normal_data']['content'];
    }
  }

  function displayQuestionContent() {
    let isChild = false;
    if (questionData['arrangement'] === 'center') {
      showCont("center-cont");
      hideCont("left-right-cont");
      document.getElementsByClassName("center-content")[0].innerHTML = questionData['center']['content'];
      const centerType = questionData['center']['type'];
      if (centerType === "inline_option") {
        hideCont("two-part-cont");
        hideCont("single-choice-center-cont");
      } else if (centerType === "two_part") {
        showCont("two-part-cont");
        hideCont("single-choice-center-cont");
        const centerData = questionData['center'];
        setTwoPartData({
          optionList: centerData['answer_data_1']['option_list'].split(LIST_SEP),
          options: centerData['answer_data_1']['options'],
        })
      } else if (centerType === "single_choice" || centerType === "math") {
        hideCont("two-part-cont");
        showCont("single-choice-center-cont");
        const centerData = questionData['center'];
        setSingleChoiceCenterData({
          centerType: centerType,
          optionList: centerData['answer_data']['option_list'].split(LIST_SEP),
          options: centerData['answer_data']['options'],
        })
      }
    } else {
      const leftData = questionData['left'];
      const rightData = questionData['right'];
      hideCont("center-cont");
      showCont("left-right-cont");
      document.getElementsByClassName("right-description")[0].innerHTML = rightData['content'];
      const leftType = questionData['left']['type'];
      if (leftType === 'reuse') {
        isChild = true;
      }
      displayLeftData(leftData, leftType);
      const rightType = questionData['right']['type'];
      if (rightType === "yes_no") {
        showCont("yes-no-cont");
        hideCont("single-choice-cont");
        setYesNoData({
          optionList: rightData['option_list'].split(LIST_SEP),
          options: rightData['options'],
          userOptions: {}
        })
      } else if (rightType === "single_choice") {
        hideCont("yes-no-cont");
        showCont("single-choice-cont");
        setSingleChoiceData({
          optionList: rightData['option_list'].split(LIST_SEP),
          options: rightData['options'],
        })
      }
    }
    console.log("parentQ before");
    console.log(parentQuestions);
    if (isChild) {
      if (isReviewAndEdit) {
        loadParentQuestionLeftData(parentQuestions[section + '_' + questionData.number]);
      } else {
        parentQuestions[section + '_' + questionData.number] = currentParentNumber;
        setParentQuestions(parentQuestions);
        console.log("parentQ after");
        console.log(parentQuestions);
        localStorage.setItem('parent_questions', JSON.stringify(parentQuestions));
      }
    } else {
      setCurrentParentNumber(questionData.number);
    }
    console.log("currentParentNumber=" + currentParentNumber);
    setCurrentData({
      number: questionData.number,
      arrangement: questionData.arrangement,
      center: questionData.center,
      left: questionData.left,
      right: questionData.right
    });
  }

  return <div className="question">
    <Navbar/>
    <div className="data-top">
      <div className="data-top-text">
        Exam { progress.ecode } - { getLabelFromList(SECTION_LIST, section) } -
        Question <b>{ (isReviewAndEdit ? reviewQuestionNumber : questionNumber) }/{ exam[section].totalQuestion }</b>
      </div>
      <img className={ `calculator-image` + (section === 'data' ? '' : ' hidden') }
           src={ process.env.PUBLIC_URL + "/icon_calculator.png" }
           onClick={ () => setDisplayCalculatorModal({ display: true }) }/>
      <div className="remaining-time">
        <div className="data-top-text">Remaining Time:&nbsp;<b id="timer">00:45:00</b></div>
        <img className="clock-image" src={ process.env.PUBLIC_URL + "/icon_clock.png" }/>
      </div>
    </div>
    <div className="mid-cont">
      <div className="ck-content mid-inner-cont">
        <div className="center-cont hidden">
          <div className={ CenterContentClass() }/>
          <div className="two-part-cont hidden">
            <div className="two-part-label-row">
              <label className="two-part-radio">1</label>
              <label className="two-part-radio-2">2</label>
            </div>
            <ListTwoPartOption/>
          </div>
          <div className="single-choice-center-cont hidden">
            <ListSingleChoiceCenterOption/>
          </div>
        </div>
        <div className="left-right-cont hidden">
          <div className="left-cont">
            <div className="left-description"/>
            <div className="sort-cont hidden">
              <b>Sort By</b>
              <Select
                className="sort-select"
                onChange={ onChangeSort }
                options={ sortData.list }
                value={ sortData.list.filter(option => option.value === sortData.currentSort) }/>
              <div className="sort-content"/>
            </div>
            <div className="tab-cont hidden">
              <ul className="tab-ul">
                <ListTabOption/>
                <li className="tab-cell-space"/>
              </ul>
              <div className="tab-content"/>
            </div>
            <div className="normal-cont hidden">
              <div className="normal-content"/>
            </div>
          </div>
          <div className="ver-line"/>
          <div className="right-cont">
            <div className="right-description"/>
            <div className="yes-no-cont hidden">
              <div className="yes-no-label-row">
                <label className="yes-no-radio">Yes</label>
                <label className="yes-no-radio-2">No</label>
              </div>
              <ListYesNoOption/>
            </div>
            <div className="single-choice-cont hidden">
              <ListSingleChoiceOption/>
            </div>
          </div>
        </div>
      </div>
      <button className="but-next-bottom" onClick={ onNext }>{ buttonNextText() }</button>
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
        <button className="but-ok" onClick={ onConfirmConfirmModal }>{ buttonNextText() }</button>
      </div>
    </Modal>
  </div>;
};
export default Question;