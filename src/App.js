import './css/App.css.scss';
import React from 'react';
import { Route, Routes } from "react-router-dom";
import About from "./routes/About";
import SelectOrder from "./routes/SelectOrder";
import SelectExamCode from "./routes/SelectExamCode";
import SecData from "./routes/SecData";
import AdminDashboard from "./routes/AdminDashboard";
import EditExamDetails from "./routes/EditExamDetails";
import InputDescription from "./routes/InputDescription";
import EditExamInstructions from "./routes/EditExamInstructions";
import InputInstruction from "./routes/InputInstruction";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={ <AdminDashboard/> }/>
        <Route path="/select-exam-code" element={ <SelectExamCode/> }/>
        <Route path="/select-order" element={ <SelectOrder/> }/>
        <Route path="/sec-data" element={ <SecData/> }/>
        <Route path="/input-description" element={ <InputDescription/> }/>
        <Route path="/admin-dashboard" element={ <AdminDashboard/> }/>
        <Route path="/edit-exam-details" element={ <EditExamDetails/> }/>
        <Route path="/edit-exam-instructions" element={ <EditExamInstructions/> }/>
        <Route path="/input-instruction" element={ <InputInstruction/> }/>
        <Route path="/about" element={ <About/> }/>
      </Routes>
    </>
  );
}


export default App;
