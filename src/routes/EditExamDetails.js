import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/EditExamDetails.css.scss';
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
  const [firstLoad, setFirstLoad] = useState(true);
  const [ecode, setEcode] = useState("001");
  const [displayInputModal, setDisplayInputModal] = useState({ display: false });
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });
  const [displayConfirmModal, setDisplayConfirmModal] = useState({ display: false });
  const onCloseInputModal = () => {
    setDisplayInputModal({ display: false });
  };
  const onCloseWarnModal = () => {
    setDisplayWarnModal({ display: false });
  };
  const onCloseConfirmModal = () => {
    setDisplayConfirmModal({ display: false });
  };
  const onConfirmConfirmModal = () => {
    console.log("confirm action: " + displayConfirmModal.action + ", data: " + displayConfirmModal.data);
    if (displayConfirmModal.action === "delete_exam") {
      deleteExam(displayConfirmModal.data);
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

  function ListOption() {
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

  const onNext = () => {
    localStorage.setItem('ecode', ecode);
    navigate("/select-order");
  };

  const onDeleteExam = (ecode) => {
    console.log(`delete exam ${ ecode }`);
    setDisplayConfirmModal({
      display: true,
      title: "Delete Exam Confirmation",
      description: `Do you want to delete exam ${ ecode }? All questions belong to this exam will be lost forever.`,
      action: "delete_exam",
      data: ecode
    });
  };

  const onAddExam = () => {
    setDisplayInputModal({ display: true, title: "Input Exam Code", placeholder: "001, 002, 003..." });
  };

  function readFirebaseData() {
    const examRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA + '/exam_list');
    onValue(examRef, (snapshot) => {
      let rawList = snapshot.val();
      setList(rawList === "" ? [] : rawList.split(","));
    }, {
      onlyOnce: true
    });
  }

  const deleteExam = (examCode) => {
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
  const writeNewExam = (examCode) => {
    const updates = {};
    const examData = {
      section_data: {
        description: ""
      },
      section_quan: {
        description: ""
      },
      section_verb: {
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

  return <div className="edit-exam-details">
    <Navbar/>
    <div className="mid-cont">
      <h1>Edit Exam Details</h1>
      <div className="edit-exam-cont">
        <h2 className="edit-label">Exam code</h2>
        <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddExam }/>
        <div className="ecode-opt-cont">
          <ListOption/>
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
  </div>;
};
export default EditExamDetails;