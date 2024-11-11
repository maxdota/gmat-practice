import logo from './logo.svg';
import './css/App.css.scss';
import React, { useState, useEffect } from 'react';
import { Routes, Route} from "react-router-dom";
import About from "./routes/About";
import Home from "./routes/Home";
import Navbar from './elements/Navbar';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue  } from "firebase/database";

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

function App() {
  const [count, setCount] = useState(0);
  const [list, setList] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      setupFirebase();
    }
  });

  function setupFirebase() {
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    const examRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA + '/exam_list');

    onValue(examRef, (snapshot) => {
      document.getElementById("list").replaceChildren();

      const textN = document.createTextNode(snapshot.val().length);
      document.getElementById("list").prepend(textN);

      setList(snapshot.val());

      // const date = new Date();
      // let day = date.getDate();
      // let month = date.getMonth();
      // let year = date.getFullYear();
      // snapshot.forEach((childSnapshot) => {
      //   const childKey = childSnapshot.key;
      //   const childData = childSnapshot.val();
      //   const packageName = childData["packageName"];
      //   const content = childData["content"];
      //   const displayTime = childData["displayTime"];
      //   const title = childData["title"];
      //   const dividerDiv = document.createElement("div");
      //   dividerDiv.className = "divider";
      //   const divider = document.createTextNode("-----------------------------------------------------------------------------------------");
      //   dividerDiv.appendChild(divider);
      //
      //   const newDiv = document.createElement("div");
      //   newDiv.className = "row";
      //   [displayTime, title, content].forEach((text, index) => {
      //     const nodeText = document.createTextNode(text);
      //     const nodeDiv = document.createElement("div");
      //     if (index === 1) {
      //       nodeDiv.className = "bold"
      //     }
      //     nodeDiv.className = nodeDiv.className + " row-text";
      //     nodeDiv.appendChild(nodeText);
      //     newDiv.appendChild(nodeDiv);
      //   });
      //
      //   document.getElementById("list").prepend(dividerDiv);
      //   document.getElementById("list").prepend(newDiv);
      // });
    });
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <p>Count: {count}</p>
      <p>List: {list}</p>
      <div id="list" ></div>
    </>
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}


export default App;
