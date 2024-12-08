import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/EditExamInstructions.css.scss';

const EditExamInstructions = () => {
  const navigate = useNavigate();
  const editInstruction = (sectionCode) => {
    navigate("/input-instruction?code=" + sectionCode);
  };
  const onBack = () => {
    navigate(-1);
  };

  return <div className="edit-exam-instructions">
    <Navbar/>
    <div className="mid-cont">
      <h1>Edit Exam Instructions</h1>
      <div className="description-text">Choose the section instruction you want to edit</div>
      <button className="but-option" onClick={ () => editInstruction("data") }>Data Insights</button>
      <button className="but-option" onClick={ () => editInstruction("verb") }>Verbal Reasoning</button>
      <button className="but-option" onClick={ () => editInstruction("quan") }>Quantitative Reasoning</button>
      <button className="but-option" onClick={ () => editInstruction("break_instructions") }>Optional Break Instructions</button>
      <button className="but-option" onClick={ () => editInstruction("break_standby") }>Optional Break Stand-by Screen</button>
      <button className="but-option" onClick={ () => editInstruction("whiteboard_confirm") }>Physical Whiteboard Confirmation</button>
      <button className="but-back-bottom" onClick={ onBack }>BACK</button>
    </div>
  </div>;
};
export default EditExamInstructions;