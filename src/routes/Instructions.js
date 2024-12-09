import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/Instructions.css.scss';
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
const Instructions = () => {
  Modal.appElement = "#root";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const [firstLoad, setFirstLoad] = useState(true);
  const [questionReady, setQuestionReady] = useState(false);
  const [timeReady, setTimeReady] = useState(false);
  const [toNextPage, setToNextPage] = useState(false);
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const isPreview = params.get("preview");
  const navigate = useNavigate();
  const progress = JSON.parse(localStorage.getItem('progress'));

  useEffect(() => {
    console.log("questionReady=" + questionReady + ", timeReady=" + timeReady + ", toNextPage=" + toNextPage);
    if (questionReady && timeReady && toNextPage) {
      processToNextPage();
    }
  }, [questionReady, timeReady, toNextPage]);

  useEffect(() => {
    if (isPreview) {
      document.getElementById("ins_desc").innerHTML = localStorage.getItem('preview_instruction');
    } else {
      if (firstLoad) {
        setFirstLoad(false);
        if (validateProgress()) {
          readFirebaseData();
        }
      }
    }
  });
  const processToNextPage = () => {
    if (isPreview) return
    progress.question = 1;
    progress.startTime = Date.now();
    localStorage.removeItem('remaining_time');
    localStorage.removeItem('remaining_answer');
    localStorage.setItem('progress', JSON.stringify(progress));
    navigate("/question", { replace: true });
  };
  const onNext = () => {
    setToNextPage(true);
  };

  function validateProgress() {
    return true;
  }

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function readFirebaseData() {
    const path = process.env.REACT_APP_FB_ROOT_DATA + '/instructions/' + progress[progress.step];
    onValue(ref(database, path), (snapshot) => {
      const raw = snapshot.val();
      document.getElementById("ins_desc").innerHTML = raw ? raw : '';
    }, { onlyOnce: true });
    const questionPath = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + progress.ecode + "/" + progress[progress.step] + "/questions/1";
    onValue(ref(database, questionPath), (snapshot) => {
      const raw = snapshot.val();
      const questionData = {
        number: 1,
        arrangement: raw['arrangement'],
        center: raw['center'],
        left: raw['left'],
        right: raw['right'],
      }
      localStorage.setItem('question', JSON.stringify(questionData));
      setQuestionReady(true);
    }, { onlyOnce: true });
    onValue(ref(database, process.env.REACT_APP_FB_ROOT_DATA + '/time_multiplier'), (snapshot) => {
      const raw = snapshot.val();
      const time = parseFloat(raw);
      if (isNaN(time)) {
        localStorage.removeItem('time_multiplier');
      } else {
        localStorage.setItem('time_multiplier', raw);
      }
      setTimeReady(true);
    }, { onlyOnce: true });
  }

  return <div className="instructions">
    <Navbar/>
    <div className="mid-cont">
      <div className="instruction-cont ck-content">
        <div id="ins_desc" className="instruction-desc"/>
      </div>
      <button className="but-next-bottom" onClick={ onNext }>NEXT</button>
    </div>
  </div>;
};
export default Instructions;