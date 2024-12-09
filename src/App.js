import './css/App.css.scss';
import React from 'react';
import { Route, Routes, useNavigate } from "react-router-dom";
import About from "./routes/About";
import SelectOrder from "./routes/SelectOrder";
import SelectExamCode from "./routes/SelectExamCode";
import SecData from "./routes/SecData";
import AdminDashboard from "./routes/AdminDashboard";
import EditExamDetails from "./routes/EditExamDetails";
import EditExamInstructions from "./routes/EditExamInstructions";
import InputInstruction from "./routes/InputInstruction";
import InputQuestion from "./routes/InputQuestion";
import SecQuestion from "./routes/SecQuestion";
import EditQuestionDetails from "./routes/EditQuestionDetails";
import Instructions from "./routes/Instructions";
import Question from "./routes/Question";
import EditQuestionDetailsLeftRight from "./routes/EditQuestionDetailsLeftRight";
import InputDescription from "./routes/InputDescription";
import InputMath from "./routes/InputMath";
import EditQuestionDetailsMath from "./routes/EditQuestionDetailsMath";
import InputQuestionMath from "./routes/InputQuestionMath";
import SectionReview from "./routes/SectionReview";
import BreakAndEndPage from "./routes/BreakAndEndPage";
import ExamResult from "./routes/ExamResult";

function App() {

  const config = {
    "fast-preview": {
      disabled: true
    },
    tex2jax: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"]
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"]
      ]
    },
    messageStyle: "none"
  };
  return (
    <>
      <Routes>
        <Route path="/" element={ <SelectExamCode/> }/>
        <Route path="/select-exam-code" element={ <SelectExamCode/> }/>
        <Route path="/select-order" element={ <SelectOrder/> }/>
        <Route path="/instructions" element={ <Instructions/> }/>
        <Route path="/break-and-end-page" element={ <BreakAndEndPage/> }/>
        <Route path="/exam-result" element={ <ExamResult/> }/>
        <Route path="/sec-data" element={ <SecData/> }/>
        <Route path="/admin-dashboard" element={ <AdminDashboard/> }/>
        <Route path="/ad" element={ <AdminDashboard/> }/>
        <Route path="/edit-exam-details" element={ <EditExamDetails/> }/>
        <Route path="/edit-exam-instructions" element={ <EditExamInstructions/> }/>
        <Route path="/input-instruction" element={ <InputInstruction/> }/>
        <Route path="/input-question" element={ <InputQuestion/> }/>
        <Route path="/input-question-math" element={ <InputQuestionMath/> }/>
        <Route path="/input-description" element={ <InputDescription/> }/>
        <Route path="/input-math" element={ <InputMath/> }/>
        <Route path="/edit-question-details" element={ <EditQuestionDetails/> }/>
        <Route path="/edit-question-details-math" element={ <EditQuestionDetailsMath/> }/>
        <Route path="/edit-question-details-left-right" element={ <EditQuestionDetailsLeftRight/> }/>
        <Route path="/question" element={ <Question/> }/>
        <Route path="/section-review" element={ <SectionReview/> }/>
        <Route path="/sec-question" element={ <SecQuestion/> }/>
        <Route path="/about" element={ <About/> }/>
      </Routes>
    </>
  );
}


export default App;

export function doSomething() {
  console.log("do something!");
}
