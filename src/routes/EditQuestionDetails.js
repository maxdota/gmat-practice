import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/EditQuestionDetails.css.scss';
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
const EditQuestionDetails = () => {
  const LIST_SEP = ",_";
  Modal.appElement = "#root";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const navigate = useNavigate()
  const [firstLoad, setFirstLoad] = useState(true);
  const [opData, setOpData] = useState({});
  const [op1Data, setOp1Data] = useState({});
  const [op2Data, setOp2Data] = useState({});
  const [questionContent, setQuestionContent] = useState("");
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
    { value: 'two_part', label: '2-part Analysis' },
    { value: 'single_choice', label: 'Single Choice' },
  ];
  const LEFT_TYPE_LIST = [
    { value: 'normal', label: 'Normal Text/Image' },
    { value: 'sort_table', label: 'Sort Table' },
    { value: 'multi_tabs', label: 'Multi-source' },
    { value: 'reuse', label: 'Reuse Previous Question Data' },
  ];
  const RIGHT_TYPE_LIST = [
    { value: 'yes_no', label: 'Yes/No Statement' },
    { value: 'single_choice', label: 'Single Choice' },
  ];
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const ecode = params.get("ecode");
  const section = params.get("section");
  const question = params.get("question");
  const arrangement = params.get("arrangement");
  const centerType = params.get("center_type");
  const leftType = params.get("left_type");
  const rightType = params.get("right_type");
  const sectionName = SECTION_LIST.filter(item => item.value === section)[0].label;
  const questionPath = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + ecode + "/" + section + "/questions/" + question;
  const [displayInputModal, setDisplayInputModal] = useState({ display: false });
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });
  const [displayConfirmModal, setDisplayConfirmModal] = useState({ display: false });
  const onCloseInputModal = () => {
    setDisplayInputModal({ display: false });
  };
  const onSubmitInputModal = () => {
    const input = document.getElementById("modal-input-value").value;
    if (displayInputModal.action === "add_option") {
      writeNewOption(input)
    } else if (displayInputModal.action === "add_option_1") {
      writeNewOption1(input)
    } else if (displayInputModal.action === "add_option_2") {
      writeNewOption2(input)
    }
    onCloseInputModal();
  };
  const onCloseWarnModal = () => {
    setDisplayWarnModal({ display: false });
  };
  const onCloseConfirmModal = () => {
    setDisplayConfirmModal({ display: false });
  };
  const onConfirmConfirmModal = () => {
    if (displayConfirmModal.action === "delete_option") {
      deleteOption(displayConfirmModal.data);
    } else if (displayConfirmModal.action === "delete_option_1") {
      deleteOption1(displayConfirmModal.data);
    } else if (displayConfirmModal.action === "delete_option_2") {
      deleteOption2(displayConfirmModal.data);
    }
    onCloseConfirmModal();
  };
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      readFirebaseData();
    }
  });

  function getLabelFromList(list, value) {
    return list.filter(item => item.value === value)[0].label;
  }

  function ListOption() {
    const list = opData.optionList === undefined ? [] : opData.optionList
    return list.map(item => {
        return <div key={ item }>
          <label className="option-cell radio-label">
            <img className="delete-image" src={ process.env.PUBLIC_URL + "/icon_delete.png" }
                 onClick={ () => onDeleteOp(item) }/>
            <img className="check-image"
                 src={ process.env.PUBLIC_URL + (item === opData.correctOp ? "/icon_check_enabled.png" : "/icon_check_disabled.png") }
                 onClick={ () => writeCheckOpData(item) }/>
            <input
              className="radio-input"
              type="radio"
              name="ecode"
              value={ item }
            />
            <div className="option-text radio-text">{ `(${ item }) ${ opData.options[item] }` }</div>
          </label>
          <div className="op-hor-line"/>
        </div>
      }
    );
  }
  function ListOption1() {
    const list = op1Data.optionList === undefined ? [] : op1Data.optionList
    return list.map(item => {
        return <div key={ item }>
          <label className="option-cell radio-label">
            <img className="delete-image" src={ process.env.PUBLIC_URL + "/icon_delete.png" }
                 onClick={ () => onDeleteOp1(item) }/>
            <img className="check-image"
                 src={ process.env.PUBLIC_URL + (item === op1Data.correctOp ? "/icon_check_enabled.png" : "/icon_check_disabled.png") }
                 onClick={ () => writeCheckOp1Data(item) }/>
            <input
              className="radio-input"
              type="radio"
              name="ecode"
              value={ item }
            />
            <div className="option-text radio-text">{ `(${ item }) ${ op1Data.options[item] }` }</div>
          </label>
          <div className="op-hor-line"/>
        </div>
      }
    );
  }

  function ListOption2() {
    const list = op2Data.optionList === undefined ? [] : op2Data.optionList
    return list.map(item => {
        return <div key={ item }>
          <label className="option-cell radio-label">
            <img className="delete-image" src={ process.env.PUBLIC_URL + "/icon_delete.png" }
                 onClick={ () => onDeleteOp2(item) }/>
            <img className="check-image"
                 src={ process.env.PUBLIC_URL + (item === op2Data.correctOp ? "/icon_check_enabled.png" : "/icon_check_disabled.png") }
                 onClick={ () => writeCheckOp2Data(item) }/>
            <input
              className="radio-input"
              type="radio"
              name="ecode"
              value={ item }
            />
            <div className="option-text radio-text">{ `(${ item }) ${ op2Data.options[item] }` }</div>
          </label>
          <div className="op-hor-line"/>
        </div>
      }
    );
  }

  const onBack = () => {
    navigate(-1);
  };
  const onEditContent = () => {
    if (ecode === "" || section === "" || question === "") {
      setDisplayWarnModal({
        display: true,
        title: "Cannot Continue",
        description: "Please choose a question to edit"
      });
      return;
    }
    if (centerType === 'inline_option' || centerType === 'two_part') {
      localStorage.setItem('op1_data', JSON.stringify(op1Data));
      localStorage.setItem('op2_data', JSON.stringify(op2Data));
    }
    navigate(`/input-question?ecode=${ ecode }&section=${ section }&question=${ question }&arrangement=${ arrangement }&center_type=${ centerType }`);
  };
  const onAddOption = () => {
    let missingNumber = getMissingNumber(opData.optionList);
    setDisplayInputModal({
      display: true,
      title: "Add Option Number " + missingNumber,
      placeholder: 'Input content',
      data: missingNumber,
      action: "add_option"
    });
  };
  const onAddOption1 = () => {
    let missingNumber = getMissingNumber(op1Data.optionList);
    setDisplayInputModal({
      display: true,
      title: "Add Option Number " + missingNumber,
      placeholder: 'Input content',
      data: missingNumber,
      action: "add_option_1"
    });
  };
  const onAddOption2 = () => {
    let missingNumber = getMissingNumber(op2Data.optionList);
    setDisplayInputModal({
      display: true,
      title: "Add Option Number " + missingNumber,
      placeholder: 'Input content',
      data: missingNumber,
      action: "add_option_2"
    });
  };
  const getMissingNumber = (numberList) => {
    let number = 0;
    numberList.some(q => {
      if ((number + 1).toString() !== q) {
        return true;
      }
      number += 1;
      return false;
    });
    return number + 1;
  }
  const onDeleteOp = (data) => {
    setDisplayConfirmModal({
      display: true,
      title: "Delete Option Confirmation",
      description: `Do you want to delete option ${ data }?`,
      action: "delete_option",
      data: data
    });
  };
  const onDeleteOp1 = (data) => {
    setDisplayConfirmModal({
      display: true,
      title: "Delete Option Confirmation",
      description: `Do you want to delete option ${ data }?`,
      action: "delete_option_1",
      data: data
    });
  };
  const onDeleteOp2 = (data) => {
    setDisplayConfirmModal({
      display: true,
      title: "Delete Option Confirmation",
      description: `Do you want to delete option ${ data }?`,
      action: "delete_option_2",
      data: data
    });
  };
  const showCont = (contClass) => {
    document.getElementsByClassName(contClass)[0].className = contClass;
  }
  const showContCk = (contClass) => {
    document.getElementsByClassName(contClass)[0].className = contClass + " ck-content";
  }
  const hideCont = (contClass) => {
    document.getElementsByClassName(contClass)[0].className = contClass + " hidden";
  }

  function readFirebaseData() {
    if (centerType === 'single_choice') {
      showCont("edit-op-cont");
      hideCont("edit-op1-cont");
      hideCont("edit-op2-cont");
      onValue(ref(database, questionPath + "/" + arrangement + "/answer_data"), (snapshot) => {
        const rawData = snapshot.val();
        const rawList = rawData === null ? "" : rawData['option_list'];
        setOpData({
          correctOp: rawData === null ? "" : rawData['correct_option'],
          optionList: (rawList === "" || rawList === null || rawList === undefined) ? [] : rawList.split(LIST_SEP),
          options: rawData === null ? {} : rawData['options']
        })
      }, { onlyOnce: true });
    } else if (centerType === 'inline_option' || centerType === 'two_part') {
      hideCont("edit-op-cont");
      showCont("edit-op1-cont");
      showCont("edit-op2-cont");
      onValue(ref(database, questionPath + "/" + arrangement + "/answer_data_1"), (snapshot) => {
        const rawData = snapshot.val();
        const rawList = rawData === null ? "" : rawData['option_list'];
        setOp1Data({
          correctOp: rawData === null ? "" : rawData['correct_option'],
          optionList: (rawList === "" || rawList === null || rawList === undefined) ? [] : rawList.split(LIST_SEP),
          options: rawData === null ? {} : rawData['options']
        })
      }, { onlyOnce: true });
      onValue(ref(database, questionPath + "/" + arrangement + "/answer_data_2"), (snapshot) => {
        const rawData = snapshot.val();
        const rawList = rawData === null ? "" : rawData['option_list'];
        setOp2Data({
          correctOp: rawData === null ? "" : rawData['correct_option'],
          optionList: (rawList === "" || rawList === null || rawList === undefined) ? [] : rawList.split(LIST_SEP),
          options: rawData === null ? {} : rawData['options']
        })
      }, { onlyOnce: true });
    }
    onValue(ref(database, questionPath + "/" + arrangement + "/content"), (snapshot) => {
      const rawData = snapshot.val();
      setQuestionContent(rawData)
    }, { onlyOnce: true });
  }
  const writeCheckOpData = (data) => {
    const path = questionPath + "/" + arrangement + "/answer_data";
    const updates = {};
    updates[`correct_option`] = data;
    const exRef = ref(database, path);
    update(exRef, updates).then(() => {
      setOpData({ correctOp: data, options: opData.options, optionList: opData.optionList })
    });
  };
  const writeCheckOp1Data = (data) => {
    const path = questionPath + "/" + arrangement + "/answer_data_1";
    const updates = {};
    updates[`correct_option`] = data;
    const exRef = ref(database, path);
    update(exRef, updates).then(() => {
      setOp1Data({ correctOp: data, options: op1Data.options, optionList: op1Data.optionList })
    });
  };
  const writeCheckOp2Data = (data) => {
    const path = questionPath + "/" + arrangement + "/answer_data_2";
    const updates = {};
    updates[`correct_option`] = data;
    const exRef = ref(database, path);
    update(exRef, updates).then(() => {
      setOp2Data({ correctOp: data, options: op2Data.options, optionList: op2Data.optionList })
    });
  };
  const deleteOption = (data) => {
    const path = questionPath + "/" + arrangement + "/answer_data";
    const updates = {};
    opData.optionList.splice(opData.optionList.indexOf(data), 1);
    let newList = opData.optionList.sort();
    delete opData.options[data];
    setOpData({ correctOp: opData.correctOp, options: opData.options, optionList: newList })
    updates[`option_list`] = newList.join(LIST_SEP);
    updates[`options/${ data }`] = null;
    const exRef = ref(database, path);
    update(exRef, updates).then();
  };
  const deleteOption1 = (data) => {
    const path = questionPath + "/" + arrangement + "/answer_data_1";
    const updates = {};
    op1Data.optionList.splice(op1Data.optionList.indexOf(data), 1);
    let newList = op1Data.optionList.sort();
    delete op1Data.options[data];
    setOp1Data({ correctOp: op1Data.correctOp, options: op1Data.options, optionList: newList })
    updates[`option_list`] = newList.join(LIST_SEP);
    updates[`options/${ data }`] = null;
    const exRef = ref(database, path);
    update(exRef, updates).then();
  };
  const deleteOption2 = (data) => {
    const path = questionPath + "/" + arrangement + "/answer_data_2";
    const updates = {};
    op2Data.optionList.splice(op2Data.optionList.indexOf(data), 1);
    let newList = op2Data.optionList.sort();
    delete op2Data.options[data];
    setOp2Data({ correctOp: op2Data.correctOp, options: op2Data.options, optionList: newList })
    updates[`option_list`] = newList.join(LIST_SEP);
    updates[`options/${ data }`] = null;
    const exRef = ref(database, path);
    update(exRef, updates).then();
  };
  const writeNewOption = (data) => {
    const path = questionPath + "/" + arrangement + "/answer_data";
    const number = displayInputModal.data;
    const updates = {};
    opData.optionList.push(number.toString());
    let newList = opData.optionList.sort();
    opData.options[number.toString()] = data;
    setOpData({ correctOp: opData.correctOp, options: opData.options, optionList: newList })
    updates[`option_list`] = newList.join(LIST_SEP);
    updates[`options/${ number }`] = data;
    const exRef = ref(database, path);
    update(exRef, updates).then();
  };
  const writeNewOption1 = (data) => {
    const path = questionPath + "/" + arrangement + "/answer_data_1";
    const number = displayInputModal.data;
    const updates = {};
    op1Data.optionList.push(number.toString());
    let newList = op1Data.optionList.sort();
    op1Data.options[number.toString()] = data;
    setOp1Data({ correctOp: op1Data.correctOp, options: op1Data.options, optionList: newList })
    updates[`option_list`] = newList.join(LIST_SEP);
    updates[`options/${ number }`] = data;
    const exRef = ref(database, path);
    update(exRef, updates).then();
  };
  const writeNewOption2 = (data) => {
    const path = questionPath + "/" + arrangement + "/answer_data_2";
    const number = displayInputModal.data;
    const updates = {};
    op2Data.optionList.push(number.toString());
    let newList = op2Data.optionList.sort();
    op2Data.options[number.toString()] = data;
    setOp2Data({ correctOp: op2Data.correctOp, options: op2Data.options, optionList: newList })
    updates[`option_list`] = newList.join(LIST_SEP);
    updates[`options/${ number }`] = data;
    const exRef = ref(database, path);
    update(exRef, updates).then();
  };
  return <div className="edit-question-details">
    <Navbar/>
    <div className="mid-cont">
      <h1>Edit Question Number [{ question }], { sectionName }, Exam [{ ecode }]</h1>
      <p>Type: { arrangement === 'center' ? getLabelFromList(CENTER_TYPE_LIST, centerType) : `${ getLabelFromList(LEFT_TYPE_LIST, leftType) } - ${ getLabelFromList(RIGHT_TYPE_LIST, rightType) }` }</p>
      <div className="edit-cont">
        <div className="edit-op-cont hidden">
          <h2 className="edit-label">Option</h2>
          <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddOption }/>
          <div className="op-cont">
            <ListOption/>
          </div>
        </div>
        <div className="edit-op1-cont hidden">
          <h2 className="edit-label">Option 1</h2>
          <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddOption1 }/>
          <div className="op-cont">
            <ListOption1/>
          </div>
        </div>
        <div className="edit-op2-cont hidden">
          <h2 className="edit-label">Option 2</h2>
          <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddOption2 }/>
          <div className="op-cont">
            <ListOption2/>
          </div>
        </div>
        <div className="content-cont ck-content">
          <h2 className="edit-label">Question Content</h2>
          <button className="but-inline-right" onClick={ onEditContent }>EDIT</button>
          <div className="info-cont" dangerouslySetInnerHTML={ { __html: questionContent } }/>
        </div>
      </div>
      <button className="but-back-bottom" onClick={ onBack }>BACK</button>
    </div>

    <Modal
      className="text-input-modal"
      isOpen={ displayInputModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayInputModal.title }</div>
      <input type="text" className="modal-text-input" id="modal-input-value" autoFocus="true"
             placeholder={ displayInputModal.placeholder }/>
      <div className="container-but">
        <button className="but-cancel" onClick={ onCloseInputModal }>Cancel</button>
        <button className="but-ok" onClick={ onSubmitInputModal }>Add</button>
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
  </div>;
};
export default EditQuestionDetails;