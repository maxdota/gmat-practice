import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/EditQuestionDetailsMath.css.scss';
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
const EditQuestionDetailsMath = () => {
  const LIST_SEP = ",_";
  Modal.appElement = "#root";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const navigate = useNavigate()
  const [firstLoad, setFirstLoad] = useState(true);
  const [opData, setOpData] = useState({});
  const [questionContent, setQuestionContent] = useState("");
  const SECTION_LIST = [
    { value: 'quan', label: 'Quantitative Reasoning' },
    { value: 'verb', label: 'Verbal Reasoning' },
    { value: 'data', label: 'Data Insights' }
  ];
  const CENTER_TYPE_LIST = [
    { value: 'inline_option', label: 'Inline Option' },
    { value: 'two_part', label: '2-part Analysis' },
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'math', label: 'Single Choice (Mathematics)' },
  ];
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const ecode = params.get("ecode");
  const section = params.get("section");
  const question = params.get("question");
  const arrangement = params.get("arrangement");
  const centerType = params.get("center_type");
  const sectionName = SECTION_LIST.filter(item => item.value === section)[0].label;
  const questionPath = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + ecode + "/" + section + "/questions/" + question;
  const [displayInputModal, setDisplayInputModal] = useState({ display: false });
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });
  const [displayConfirmModal, setDisplayConfirmModal] = useState({ display: false });
  const onCloseInputModal = () => {
    setDisplayInputModal({ display: false });
  };
  const onSubmitInputModal = () => {
    let input = document.getElementById("modal-input-value").value;
    if (displayInputModal.action === "add_option") {
      if (input.startsWith('\\(') && input.endsWith('\\)')) {
        input = input.substring(2, input.length - 2);
      }
      writeNewOption(input)
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
    }
    onCloseConfirmModal();
  };
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      readFirebaseData();
    }
    if (typeof window?.MathJax !== "undefined") {
      window.MathJax.typesetClear();
      window.MathJax.typeset();
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
            <div className="option-text radio-text">{ `(${ item }) ` + `\\(${ opData.options[item] }\\)` }
              {/*<div id={"math-item-" + item}>{`\\(${ opData.options[item] }\\)`}</div>*/ }
            </div>
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
    // const htmlOps = opData.optionList.map((item) => {
    //   // return document.getElementById('math-item-' + item).childNodes[0];
    //   return document.getElementById('math-item-' + item).innerHTML;
    // });
    // opData.options = htmlOps;
    // localStorage.setItem('op1_data', JSON.stringify(opData));
    // localStorage.setItem('op2_data', JSON.stringify(opData));
    navigate(`/input-question-math?ecode=${ ecode }&section=${ section }&question=${ question }&arrangement=${ arrangement }&center_type=${ centerType }`);
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
    onValue(ref(database, questionPath + "/center/answer_data"), (snapshot) => {
      const rawData = snapshot.val();
      const rawList = rawData === null ? "" : rawData['option_list'];
      setOpData({
        correctOp: rawData === null ? "" : rawData['correct_option'],
        optionList: (rawList === "" || rawList === null || rawList === undefined) ? [] : rawList.split(LIST_SEP),
        options: rawData === null ? {} : rawData['options']
      })
    }, { onlyOnce: true });
    onValue(ref(database, questionPath + "/" + arrangement + "/content"), (snapshot) => {
      const rawData = snapshot.val();
      setQuestionContent(rawData)
    }, { onlyOnce: true });
  }

  const writeCheckOpData = (data) => {
    const path = questionPath + "/center/answer_data";
    const updates = {};
    updates[`correct_option`] = data;
    const exRef = ref(database, path);
    update(exRef, updates).then(() => {
      setOpData({ correctOp: data, options: opData.options, optionList: opData.optionList })
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
  return <div className="edit-question-details-math">
    <Navbar/>
    <div className="mid-cont">
      <h1>Edit Question [{ question }], { sectionName }, Exam [{ ecode }]</h1>
      <p>Type: { getLabelFromList(CENTER_TYPE_LIST, centerType) }</p>
      <div className="edit-cont">
        <div className="left-cont">
          <div className="edit-op-cont">
            <h4 className="edit-label">Option</h4>
            <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddOption }/>
            <div className="op-cont">
              <ListOption/>
            </div>
          </div>
        </div>
        <div className="content-cont ck-content">
          <h4 className="edit-label">Question Content</h4>
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
export default EditQuestionDetailsMath;