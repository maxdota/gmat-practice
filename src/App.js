import logo from './logo.svg';
import './App.css';
import React from 'react';
import { Routes, Route } from "react-router-dom";
import About from "./routes/About";
import Home from "./routes/Home";
import SelectOrder from "./routes/SelectOrder";
import Navbar from './elements/Navbar';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={ <Home/> }/>
        <Route path="/select-order" element={ <SelectOrder/> }/>
        <Route path="/about" element={ <About/> }/>
      </Routes>
    </>
  );
}


export default App;
