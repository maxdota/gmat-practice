import logo from './logo.svg';
import './css/App.css.scss';
import React from 'react';
import { Routes, Route } from "react-router-dom";
import About from "./routes/About";
import Home from "./routes/Home";
import SelectOrder from "./routes/SelectOrder";
import Navbar from './elements/Navbar';
import Select from "react-select";
import SelectExamCode from "./routes/SelectExamCode";
import SecData from "./routes/SecData";
import InputDescription from "./routes/InputDescription";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={ <InputDescription/> }/>
        <Route path="/select-exam-code" element={ <SelectExamCode/> }/>
        <Route path="/select-order" element={ <SelectOrder/> }/>
        <Route path="/sec-data" element={ <SecData/> }/>
        <Route path="/input-description" element={ <InputDescription/> }/>
        <Route path="/about" element={ <About/> }/>
      </Routes>
    </>
  );
}


export default App;
