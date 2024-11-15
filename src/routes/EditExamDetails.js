import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/EditExamDetails.css.scss';
import Select, { OnChangeValue, ActionMeta } from 'react-select';
import Modal from "react-modal";

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
const EditExamDetails = () => {
  Modal.appElement = "#root";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const navigate = useNavigate()
  const [list, setList] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [ecode, setEcode] = useState("");
  const [question, setQuestion] = useState("");
  const [questionInfo, setQuestionInfo] = useState("");
  const [questionData, setQuestionData] = useState({});
  const [section, setSection] = useState("");
  const [questionAddData, setQuestionAddData] = useState({ questionNumber: 0 });
  const SECTION_LIST = [
    { value: 'quan', label: 'Quantitative Reasoning' },
    { value: 'verb', label: 'Verbal Reasoning' },
    { value: 'data', label: 'Data Insights' }
  ];
  const ARRANGEMENT_LIST = [
    { value: 'center', label: 'Center' },
    { value: 'left_right', label: 'Left Right' },
  ];
  const CENTER_TYPE_LIST = [
    { value: 'inline_option', label: 'Inline Option' },
  ];
  const LEFT_TYPE_LIST = [
    { value: 'normal', label: 'Normal Text/Image' },
    { value: 'sort_table', label: 'Sort Table' },
    { value: 'reuse', label: 'Reuse Previous Question Data' },
  ];
  const RIGHT_TYPE_LIST = [
    { value: 'single_choice', label: 'Single Choice' },
    { value: '2_choice_table', label: '2 Choices Table' },
  ];
  const [displayInputModal, setDisplayInputModal] = useState({ display: false });
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });
  const [displayConfirmModal, setDisplayConfirmModal] = useState({ display: false });
  const [displayAddQuestionModal, setDisplayAddQuestionModal] = useState({ display: false });
  const onCloseInputModal = () => {
    setDisplayInputModal({ display: false });
  };
  const onCloseWarnModal = () => {
    setDisplayWarnModal({ display: false });
  };
  const onCloseConfirmModal = () => {
    setDisplayConfirmModal({ display: false });
  };
  const onCloseAddQuestionModal = () => {
    setDisplayAddQuestionModal({ display: false });
  };
  const onConfirmConfirmModal = () => {
    if (displayConfirmModal.action === "delete_exam") {
      deleteExam(displayConfirmModal.data);
    } else if (displayConfirmModal.action === "delete_question") {
      deleteQuestion(displayConfirmModal.data);
    }
    onCloseConfirmModal();
  };
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      // app = initializeApp(firebaseConfig);
      // database = getDatabase(app);
      readFirebaseData();
    }
  });

  function ListOptionExam() {
    return list.map(item => {
        return <div key={ item }>
          <label className={ "ecode radio-label" + (item === ecode ? " radio-check-bg" : "") }>
            <input
              className="radio-input"
              type="radio"
              name="ecode"
              value={ item }
              checked={ item === ecode }
              onChange={ (e) => {
                setEcode(e.currentTarget.value)
                setSection("");
                setQuestion("");
                setQuestionList([]);
              } }
            />
            <div className="radio-text">{ item }</div>
            <img className="delete-image" src={ process.env.PUBLIC_URL + "/icon_delete.png" }
                 onClick={ () => onDeleteExam(item) }/>
          </label>
          <div className="hor-line"/>
        </div>
      }
    );
  }

  function ListOptionSection() {
    let sectionList = ecode === "" ? [] : SECTION_LIST
    return sectionList.map(item => {
        return <div key={ item.value }>
          <label className={ "section section-label" + (item.value === section ? " radio-check-bg" : "") }>
            <input
              className="radio-input"
              type="radio"
              name="section"
              value={ item.value }
              checked={ item.value === section }
              onChange={ (e) => {
                let sec = e.currentTarget.value;
                readQuestionFirebaseData(sec);
                setSection(sec);
                setQuestion("");
              } }
            />
            <div className="radio-text">{ item.label }</div>
          </label>
          <div className="hor-line"/>
        </div>
      }
    );
  }

  function ListOptionQuestion() {
    return questionList.map(item => {
        return <div key={ item }>
          <label className={ "question radio-label" + (item === question ? " radio-check-bg" : "") }>
            <input
              className="radio-input"
              type="radio"
              name="question"
              value={ item }
              checked={ item === question }
              onChange={ (e) => {
                let q = e.currentTarget.value;
                setQuestion(q)
                readQuestionInfoFirebaseData(q)
              } }
            />
            <div className="radio-text">{ item }</div>
            <img className="delete-image" src={ process.env.PUBLIC_URL + "/icon_delete.png" }
                 onClick={ () => onDeleteQuestion(item) }/>
          </label>
          <div className="hor-line"/>
        </div>
      }
    );
  }

  const onNext = () => {
    // localStorage.setItem('ecode', ecode);
    // navigate("/select-order");
  };

  const onDeleteExam = (data) => {
    setDisplayConfirmModal({
      display: true,
      title: "Delete Exam Confirmation",
      description: `Do you want to delete exam ${ data }? All questions belong to this exam will be lost forever.`,
      action: "delete_exam",
      data: data
    });
  };
  const onDeleteQuestion = (data) => {
    setDisplayConfirmModal({
      display: true,
      title: "Delete Question Confirmation",
      description: `Do you want to delete question number ${ data }? All data of this question will be lost forever.`,
      action: "delete_question",
      data: data
    });
  };

  const onAddExam = () => {
    setDisplayInputModal({ display: true, title: "Input Exam Code", placeholder: "001, 002, 003..." });
  };
  const onAddQuestion = () => {
    if (ecode === "" || section === "") {
      setDisplayWarnModal({
        display: true,
        title: "Cannot add question",
        description: "Please choose an exam & section to add question"
      });
      return;
    }
    let missingNumber = getMissingNumber(questionList);
    setQuestionAddData({ questionNumber: missingNumber });
    setDisplayAddQuestionModal({ display: true, title: "Add Question Number " + missingNumber });
  };

  const getMissingNumber = (numberList) => {
    let questionNumber = 0;
    numberList.some(q => {
      if ((questionNumber + 1).toString() !== q) {
        return true;
      }
      questionNumber += 1;
      return false;
    });
    return questionNumber + 1;
  }

  function readFirebaseData() {
    const examRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA + '/exam_list');
    onValue(examRef, (snapshot) => {
      let rawList = snapshot.val();
      setList((rawList === "" || rawList === null) ? [] : rawList.split(","));
    }, {
      onlyOnce: true
    });
  }

  function readQuestionFirebaseData(sec) {
    const path = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + ecode + "/" + sec + "/question_list";
    const questionRef = ref(database, path);
    onValue(questionRef, (snapshot) => {
      let rawList = snapshot.val();
      setQuestionList((rawList === "" || rawList === null) ? [] : rawList.split(","));
    }, {
      onlyOnce: true
    });
  }
  function getLabelFromList(list, value) {
    return list.filter(item => item.value === value)[0].label;
  }
  function readQuestionInfoFirebaseData(q) {
    const path = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + ecode + "/" + section + "/questions/" + q;
    console.log("path: " + path);
    const questionRef = ref(database, path);
    onValue(questionRef, (snapshot) => {
      let rawData = snapshot.val();
      if (rawData === "" || rawData === null) {
        setQuestionInfo("");
        setQuestionData({});
      } else {
        let data = {
          arrangement: rawData["arrangement"],
          centerType: rawData["arrangement"] === "center" ? rawData["center"]["type"] : null,
          leftType: rawData["arrangement"] === "left_right" ? rawData["left"]["type"] : null,
          rightType: rawData["arrangement"] === "left_right" ? rawData["right"]["type"] : null,
        };
        let info = `Arrangement: ${ getLabelFromList(ARRANGEMENT_LIST, data.arrangement) }`;
        if (data.centerType != null) { info += `<br/>Center Type: ${ getLabelFromList(CENTER_TYPE_LIST, data.centerType) }`; }
        if (data.leftType != null) { info += `<br/>Left Type: ${ getLabelFromList(LEFT_TYPE_LIST, data.leftType) }`; }
        if (data.rightType != null) { info += `<br/>Right Type: ${ getLabelFromList(RIGHT_TYPE_LIST, data.rightType) }`; }
        setQuestionInfo(info);
        setQuestionData(data);
      }
    }, {
      onlyOnce: true
    });
  }

  const onQuestionArrangementChange = (e) => {
    let arrangement = e.value;
    setQuestionAddData({
      questionNumber: questionAddData.questionNumber,
      arrangement: arrangement,
    });
  };
  const onQuestionCenterTypeChange = (e) => {
    let type = e.value;
    setQuestionAddData({
      questionNumber: questionAddData.questionNumber,
      arrangement: questionAddData.arrangement,
      centerType: type
    });
  };
  const onQuestionLeftTypeChange = (e) => {
    let type = e.value;
    setQuestionAddData({
      questionNumber: questionAddData.questionNumber,
      arrangement: questionAddData.arrangement,
      leftType: type,
      rightType: questionAddData.rightType
    });
  };
  const onQuestionRightTypeChange = (e) => {
    let type = e.value;
    setQuestionAddData({
      questionNumber: questionAddData.questionNumber,
      arrangement: questionAddData.arrangement,
      leftType: questionAddData.leftType,
      rightType: type
    });
  };
  const deleteExam = (examCode) => {
    if (examCode === ecode) {
      setEcode("");
      setSection("");
      setQuestion("");
      setQuestionList([]);
    }

    const updates = {};
    list.splice(list.indexOf(examCode), 1);
    let newList = list.sort();
    setList(newList);
    updates[`exam_list`] = newList.join(",");
    updates[`exams/${ examCode }`] = null;
    const exRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA);
    update(exRef, updates).then(() => {
      // readFirebaseData();
    });
  };
  const deleteQuestion = (questionNumber) => {
    if (questionNumber === question) {
      setQuestion("");
    }
    const updates = {};
    questionList.splice(questionList.indexOf(questionNumber), 1);
    let newList = questionList.sort();
    setQuestionList(newList);
    updates[`exams/${ ecode }/${ section }/question_list`] = newList.join(",");
    updates[`exams/${ ecode }/${ section }/questions/${ questionNumber }`] = null;
    const exRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA);
    update(exRef, updates).then();
  };
  const writeNewExam = (examCode) => {
    const updates = {};
    const examData = {
      data: {
        question_list: "",
        description: ""
      },
      quan: {
        question_list: "",
        description: ""
      },
      verb: {
        question_list: "",
        description: ""
      },
    };
    list.push(examCode);
    let newList = list.sort();
    setList(newList);
    updates[`exam_list`] = newList.join(",");
    updates[`exams/${ examCode }`] = examData;
    const exRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA);
    update(exRef, updates).then(() => {
      // readFirebaseData();
    });
  };
  const writeNewQuestion = () => {
    const updates = {};
    const data = {
      arrangement: questionAddData.arrangement,
      center: questionAddData.centerType === undefined ? null : {
        type: questionAddData.centerType
      },
      left: questionAddData.leftType === undefined ? null : {
        type: questionAddData.leftType
      },
      right: questionAddData.rightType === undefined ? null : {
        type: questionAddData.rightType
      },
    };
    questionList.push(questionAddData.questionNumber.toString());
    let newList = questionList.sort();
    setQuestionList(newList);
    updates[`exams/${ ecode }/${ section }/question_list`] = newList.join(",");
    updates[`exams/${ ecode }/${ section }/questions/${ questionAddData.questionNumber }`] = data;
    const exRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA);
    update(exRef, updates).then();
  };
  const onSubmitExamCode = () => {
    const code = document.getElementById("modal-input-value").value;
    if (list.includes(code)) {
      onCloseInputModal();
      setDisplayWarnModal({ display: true, title: "Duplicated Exam code", description: "Please choose another code" });
    } else {
      writeNewExam(code);
      onCloseInputModal();
    }
  };
  const onSubmitNewQuestion = () => {
    if (questionAddData.arrangement === undefined) {
      onCloseAddQuestionModal();
      setDisplayWarnModal({ display: true, title: "Cannot add question", description: "Please choose arrangement" });
    } else if (questionAddData.arrangement === "center" && questionAddData.centerType === undefined) {
      onCloseAddQuestionModal();
      setDisplayWarnModal({ display: true, title: "Cannot add question", description: "Please choose center type" });
    } else if (questionAddData.arrangement === "left_right" && (questionAddData.leftType === undefined || questionAddData.rightType === undefined)) {
      onCloseAddQuestionModal();
      setDisplayWarnModal({
        display: true,
        title: "Cannot add question",
        description: "Please choose left/right type"
      });
    } else {
      writeNewQuestion();
      onCloseAddQuestionModal();
    }
  };

  return <div className="edit-exam-details">
    <Navbar/>
    <div className="mid-cont">
      <h1>Edit Exam Details</h1>
      <div className="edit-cont">
        <div className="edit-exam-cont">
          <h2 className="edit-label">Exam</h2>
          <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddExam }/>
          <div className="ecode-opt-cont">
            <ListOptionExam/>
          </div>
        </div>
        <div className="section-cont">
          <h2 className="edit-label">Section</h2>
          <div className="section-opt-cont">
            <ListOptionSection/>
          </div>
        </div>
        <div className="edit-question-cont">
          <h2 className="edit-label">Question</h2>
          <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddQuestion }/>
          <div className="ecode-opt-cont">
            <ListOptionQuestion/>
          </div>
        </div>
        <div className={ "question-info-cont" + (question === "" ? " hidden" : "") }>
          <h2 className="edit-label">Question Info</h2>
          <div className="info-cont" dangerouslySetInnerHTML={ { __html: questionInfo } }/>
        </div>
      </div>
      <button className="but-next" onClick={ onNext }>NEXT</button>
    </div>

    <Modal
      className="text-input-modal"
      isOpen={ displayInputModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayInputModal.title }</div>
      <input type="text" className="modal-text-input" id="modal-input-value"
             placeholder={ displayInputModal.placeholder }/>
      <div className="container-but">
        <button className="but-cancel" onClick={ onCloseInputModal }>Cancel</button>
        <button className="but-ok" onClick={ onSubmitExamCode }>Add</button>
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

    <Modal
      className="confirm-modal"
      isOpen={ displayConfirmModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayConfirmModal.title }</div>
      <div className="description-text">{ displayConfirmModal.description }</div>
      <div className="container-but">
        <button className="but-cancel" onClick={ onCloseConfirmModal }>Cancel</button>
        <button className="but-ok" onClick={ onConfirmConfirmModal }>Confirm</button>
      </div>
    </Modal>

    <Modal
      className="add-question-modal"
      isOpen={ displayAddQuestionModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayAddQuestionModal.title }</div>
      <Select
        className="add-question-select"
        onChange={ onQuestionArrangementChange }
        options={ ARRANGEMENT_LIST }
        placeholder="Select arrangement (Center: 1 column, Left Right: 2 columns)"
        value={ ARRANGEMENT_LIST.filter(option => option.value === questionAddData.arrangement) }/>
      <Select
        className={ "add-question-select" + (questionAddData.arrangement === "center" ? "" : " hidden") }
        onChange={ onQuestionCenterTypeChange }
        options={ CENTER_TYPE_LIST }
        placeholder="Select type at the center"
        value={ CENTER_TYPE_LIST.filter(option => option.value === questionAddData.centerType) }/>
      <Select
        className={ "add-question-select" + (questionAddData.arrangement === "left_right" ? "" : " hidden") }
        onChange={ onQuestionLeftTypeChange }
        options={ LEFT_TYPE_LIST }
        placeholder="Select type at the left"
        value={ LEFT_TYPE_LIST.filter(option => option.value === questionAddData.leftType) }/>
      <Select
        className={ "add-question-select" + (questionAddData.arrangement === "left_right" ? "" : " hidden") }
        onChange={ onQuestionRightTypeChange }
        options={ RIGHT_TYPE_LIST }
        placeholder="Select type at the right"
        value={ RIGHT_TYPE_LIST.filter(option => option.value === questionAddData.rightType) }/>
      <div className="container-but">
        <button className="but-cancel" onClick={ onCloseAddQuestionModal }>Cancel</button>
        <button className="but-ok" onClick={ onSubmitNewQuestion }>Add</button>
      </div>
    </Modal>
  </div>;
};
export default EditExamDetails;