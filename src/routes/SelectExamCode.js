import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/SelectExamCode.css.scss';

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
const Home = () => {
  const LIST_SEP = ",_";
  const navigate = useNavigate()
  const [list, setList] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const [ecode, setEcode] = useState("001");
  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      setupFirebase();
    }
  });
  function ListOption() {
    return list.split(LIST_SEP).map(item => {
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
          </label>
          <div className="hor-line"/>
        </div>
      }
    );
  }
  function setupFirebase() {
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    const examRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA + '/exam_list');

    onValue(examRef, (snapshot) => {
      setList(snapshot.val());
    }, {
      onlyOnce: true
    });
  }
  const onNext = () => {
    // const dataObject = { key: 'value2' };
    // localStorage.setItem('data', JSON.stringify(dataObject));
    // const storedData = JSON.parse(localStorage.getItem('data'));
    // console.log("store data: " + storedData["key"]);
    localStorage.setItem('ecode', ecode);
    navigate("/select-order");
  };

  return <div className="select-exam-code">
    <Navbar />
    <div className="mid-cont">
      <h2>Choose Exam code</h2>
      <div className="ecode-opt-cont">
        <ListOption/>
      </div>
      <button className="but-next" onClick={ onNext }>NEXT</button>
    </div>
  </div>;
};
export default Home;