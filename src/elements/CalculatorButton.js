import React from 'react'

function CalculatorButton(props) {
  function insideValue() {
    // if (props.textValue === "1/x") return <div className="zero-padding">1/x</div>;
    // if (props.textValue === "x^2") return <p>x<sup>2</sup></p>;
    if (props.textValue === "x^2" || props.textValue === "1/x") return "";
    if (props.isIcon) return <React.Fragment><i className={ props.isIcon }></i></React.Fragment>
    return props.textValue;
  }

  return (
    <button className={ props.buttonClass + (props.textValue === "1/x" ? " pad-left-5" : "") } onClick={ props.onClick }>
      { insideValue() }
    </button>
  );
}

export default CalculatorButton;