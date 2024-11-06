import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route} from "react-router-dom";
import About from "./routes/About";
import Home from "./routes/Home";
import Navbar from './Navbar';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue  } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyDeKoRSkA8R-8-B1Sl-jeXVnSVfCacWwK4",
  authDomain: "quan-ly-max-do-97cbe.firebaseapp.com",
  databaseURL: "https://quan-ly-max-do-97cbe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quan-ly-max-do-97cbe",
  storageBucket: "quan-ly-max-do-97cbe.appspot.com",
  messagingSenderId: "794748274309",
  appId: "1:794748274309:web:63d7572cbbb53d29878bec",
  measurementId: "G-REKSW7R7H6"
};

function setupFirebase() {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const dbRef = ref(database, 'maxdo/transactions');

  onValue(dbRef, (snapshot) => {
    document.getElementById("list").replaceChildren();
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    snapshot.forEach((childSnapshot) => {
      const childKey = childSnapshot.key;
      const childData = childSnapshot.val();
      const packageName = childData["packageName"];
      const content = childData["content"];
      const displayTime = childData["displayTime"];
      const title = childData["title"];
      const dividerDiv = document.createElement("div");
      dividerDiv.className = "divider";
      const divider = document.createTextNode("-----------------------------------------------------------------------------------------");
      dividerDiv.appendChild(divider);

      const newDiv = document.createElement("div");
      newDiv.className = "row";
      [displayTime, title, content].forEach((text, index) => {
        const nodeText = document.createTextNode(text);
        const nodeDiv = document.createElement("div");
        if (index === 1) {
          nodeDiv.className = "bold"
        }
        nodeDiv.className = nodeDiv.className + " row-text";
        nodeDiv.appendChild(nodeText);
        newDiv.appendChild(nodeDiv);
      });

      document.getElementById("list").prepend(dividerDiv);
      document.getElementById("list").prepend(newDiv);
    });
  });
}
function App() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
  });

  setupFirebase();

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
      <p>List size: {count}</p>
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
