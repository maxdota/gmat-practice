import React, { useState, useEffect, useRef } from 'react';

import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/InputMath.css.scss';
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


const Iframe = (src) => {
  return <div>
    <iframe src={ "http://localhost:3000/gmat-practice/html/input-math.html" }/>
  </div>;
}

const InputMath = () => {

  Modal.appElement = "#root";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const list = [
    { value: 'quan', label: 'Quantitative Reasoning' },
    { value: 'verb', label: 'Verbal Reasoning' },
    { value: 'data', label: 'Data Insights' }
  ];
  const DESC_LIST = [
    { value: 'left', label: 'Left Description' },
    { value: 'right', label: 'Right Description' },
  ];
  const navigate = useNavigate();
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [inputEditor, setInputEditor] = useState(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [additionalMainDivClass, setAdditionalMainDivClass] = useState("");
  const [instructionData, setInstructionData] = useState({ editorReady: false, firebaseData: "" });
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const ecode = params.get("ecode");
  const section = params.get("section");
  const question = params.get("question");
  const arrangement = params.get("arrangement");
  const descType = params.get("desc_type");
  const sectionName = list.filter(item => item.value === section)[0].label;
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);
  useEffect(() => {
    if (firstLoad) {
      setAdditionalMainDivClass(localStorage.getItem("additional_main_div_class"));
      localStorage.removeItem("additional_main_div_class");
      setFirstLoad(false);

      window.addEventListener("message", receiveMessage, false);

      function receiveMessage(event) {
        if (event.data != null && event.data["ck-content"] !== undefined) {
          console.log("PARENT RECEIVING MESSAGE");
          console.log(event.data["ck-content"]);
        }
      }
    }
  }, [firstLoad]);

  const onCloseWarnModal = () => {
    setDisplayWarnModal({ display: false });
  };
  const onBack = () => {
    navigate(-1);
  };
  const onSave = () => {
    document.getElementById("math-iframe").contentWindow.postMessage({ "on-need": "ck-content" });
    // if (inputEditor === undefined || inputEditor === null) return;
    // writeFirebaseData(inputEditor.getData());
  };
  const onPreview = () => {
    // if (inputEditor === undefined || inputEditor === null) return;
    // let data = inputEditor.getData();
    // writeFirebaseData(data);
    // localStorage.setItem('review_question', data);
    // navigate('/question?preview=true');
  };

  function getLabelFromList(list, value) {
    return list.filter(item => item.value === value)[0].label;
  }

  const descriptionHeader = () => {
    if (descType === 'left' || descType === 'right') {
      return getLabelFromList(DESC_LIST, descType);
    } else if (descType === "path_from_question") {
      return localStorage.getItem("input_description_header");
    }
    return "Description Header";
  }

  const pathToQuestion = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + ecode + "/" + section + "/questions/" + question + "/";
  const firebasePath = () => {
    if (descType === 'left' || descType === 'right') {
      return pathToQuestion + descType;
    } else if (descType === "path_from_question") {
      return pathToQuestion + localStorage.getItem("input_description_data");
    }
    return pathToQuestion + descType;
  }

  function readFirebaseData(e) {
    const path = firebasePath() + "/content";
    const dataRef = ref(database, path);
    onValue(dataRef, (snapshot) => {
      let rawData = snapshot.val();
      e.setData((rawData === null || rawData === undefined) ? "" : rawData);
    }, {
      onlyOnce: true
    });
  }

  const writeFirebaseData = (data) => {
    const updates = {};
    updates['content'] = data;
    const exRef = ref(database, firebasePath());
    update(exRef, updates).then(() => {
      setDisplayWarnModal({
        display: true,
        title: "Complete",
        description: "Content is saved"
      });
    });
  };
  const mainDivClass = () => {
    if (additionalMainDivClass === undefined || additionalMainDivClass === null) {
      return "input-math-container";
    }
    return "input-math-container" + additionalMainDivClass;
  }
  return (
    <div className="input-math">
      <Navbar/>
      <div className="mid-cont">
        <h1>Question Number [{ question }], { sectionName }, Exam [{ ecode }]</h1>
        <h3>Edit { descriptionHeader() }</h3>
        <div className={ mainDivClass() }>
          <div className="sample-cont">
            <b>Example LaTeX</b>
            <div>{ "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}" }</div>
          </div>
          <iframe id="math-iframe" src={ "http://localhost:3000/gmat-practice/html/input-math.html" } />
        </div>
      </div>
      <button className="but-back-bottom" onClick={ onBack }>BACK</button>
      <button className="but-next-bottom" onClick={ onSave }>SAVE</button>
      <Modal
        className="warn-modal"
        isOpen={ displayWarnModal.display }
        contentLabel="Example Modal">
        <div className="modal-nav-top">{ displayWarnModal.title }</div>
        <div className="description-text">{ displayWarnModal.description }</div>
        <button className="but-ok" onClick={ onCloseWarnModal }>OK</button>
      </Modal>
    </div>
  );
}
export default InputMath;