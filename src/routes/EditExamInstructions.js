import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/EditExamInstructions.css.scss';

const EditExamInstructions = () => {
  const navigate = useNavigate();
  const editInstruction = (sectionCode) => {
    navigate("/input-instruction?code=" + sectionCode);
  };

  return <div className="edit-exam-instructions">
    <Navbar/>
    <div className="mid-cont">
      <h1>Edit Exam Instructions</h1>
      <div className="description-text">Choose the section instruction you want to edit</div>
      <button className="but-option" onClick={ () => editInstruction("data") }>Data Insights</button>
      <button className="but-option" onClick={ () => editInstruction("verb") }>Verbal Reasoning</button>
      <button className="but-option" onClick={ () => editInstruction("quan") }>Quantitative Reasoning</button>
    </div>
  </div>;
};
export default EditExamInstructions;