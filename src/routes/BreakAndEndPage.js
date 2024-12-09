import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/BreakAndEndPage.css.scss';
import Modal from 'react-modal';
import async from "async";

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
const BreakAndEndPage = () => {
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
  const [pageType, setPageType] = useState(localStorage.getItem('break_and_end_page_type'));
  const [hasBreak, setHasBreak] = useState(localStorage.getItem('has_break'));

  useEffect(() => {
    if (isPreview) {
      document.getElementById("ins_desc").innerHTML = localStorage.getItem('preview_instruction');
    } else {
      console.log("firstLoad: " + firstLoad);
      console.log("type: " + pageType);
      if (firstLoad) {
        setFirstLoad(false);
        if (validateProgress()) {
          readFirebaseData();
        }
      }
    }
  });
  useEffect(() => {
    console.log("read Firebase");
    readFirebaseData();
  }, [pageType]);
  const onCloseWarnModal = () => {
    setDisplayWarnModal({ display: false });
  };
  const onBeginBreak = () => {
    if (hasBreak === 'true') {
      setDisplayWarnModal({
        display: true,
        title: "Cannot begin break",
        description: "You already took a break in the last section"
      });
      return;
    }
    localStorage.setItem('has_break', 'true');
    localStorage.setItem('break_and_end_page_type', 'break_standby');
    setHasBreak('true');
    setPageType('break_standby')
  };
  const onContinueExam = () => {
    navigate("/instructions", { replace: true });
  };
  const onDone = () => {
    navigate("/", { replace: true });
  };

  function validateProgress() {
    return true;
  }

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function continueExamClass() {
    return pageType === "break_instructions" ? "" : "hidden";
  }

  function beginBreakClass() {
    return pageType === "break_instructions" ? "" : "hidden";
  }

  function endBreakClass() {
    return pageType === "break_standby" ? "" : "hidden";
  }

  function doneClass() {
    return pageType === "whiteboard_confirm" ? "" : "hidden";
  }

  function readFirebaseData() {
    onValue(ref(database, process.env.REACT_APP_FB_ROOT_DATA + '/instructions/' + pageType), (snapshot) => {
      const raw = snapshot.val();
      document.getElementById("ins_desc").innerHTML = raw ? raw : '';
    }, { onlyOnce: true });
  }

  return <div className="break-and-end-page">
    <Navbar/>
    <div className="mid-cont">
      <div className="instruction-cont ck-content">
        <div id="ins_desc" className="instruction-desc"/>
      </div>
      <div className="but-bottom-cont">
        <button onClick={ onContinueExam } className={ continueExamClass() }>Continue Exam</button>
        <button onClick={ onBeginBreak } className={ beginBreakClass() }>Begin Break</button>
        <button onClick={ onContinueExam } className={ endBreakClass() }>End Break</button>
        <button onClick={ onDone } className={ doneClass() }>Done</button>
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
export default BreakAndEndPage;