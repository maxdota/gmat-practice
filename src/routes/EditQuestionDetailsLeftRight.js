import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/EditQuestionDetailsLeftRight.css.scss';
import Modal from "react-modal";

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
const EditQuestionDetailsLeftRight = () => {
  Modal.appElement = "#root";
  const LIST_SEP = ",_";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const navigate = useNavigate()
  const [firstLoad, setFirstLoad] = useState(true);
  const [sortData, setSortData] = useState({});
  const [tabData, setTabData] = useState({});
  const [singleChoiceData, setSingleChoiceData] = useState({});
  const [yesNoData, setYesNoData] = useState({});
  const [questionContent, setQuestionContent] = useState("");
  const [sortContent, setSortContent] = useState("");
  const [tabContent, setTabContent] = useState("");
  const [normalContent, setNormalContent] = useState("");
  const [leftContent, setLeftContent] = useState("");
  const [rightContent, setRightContent] = useState("");
  const SECTION_LIST = [
    { value: 'quan', label: 'Quantitative Reasoning' },
    { value: 'verb', label: 'Verbal Reasoning' },
    { value: 'data', label: 'Data Insights' }
  ];
  const ARRANGEMENT_LIST = [
    { value: 'center', label: 'Center' },
    { value: 'left_right', label: 'Left Right' },
  ];
  const CENTER_TYPE_LIST = [
    { value: 'inline_option', label: 'Inline Option' },
    { value: 'two_part', label: '2-part Analysis' },
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'math', label: 'Single Choice (Mathematics)' },
  ];
  const LEFT_TYPE_LIST = [
    { value: 'normal', label: 'Normal Text/Image' },
    { value: 'sort_table', label: 'Sort Table' },
    { value: 'multi_tabs', label: 'Multi-source' },
    { value: 'reuse', label: 'Reuse Previous Question Data' },
  ];
  const RIGHT_TYPE_LIST = [
    { value: 'yes_no', label: 'Yes/No Statement' },
    { value: 'single_choice', label: 'Single Choice' },
  ];
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const ecode = params.get("ecode");
  const section = params.get("section");
  const question = params.get("question");
  const arrangement = params.get("arrangement");
  const centerType = params.get("center_type");
  const leftType = params.get("left_type");
  const rightType = params.get("right_type");
  const sectionName = SECTION_LIST.filter(item => item.value === section)[0].label;
  const questionPath = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + ecode + "/" + section + "/questions/" + question;
  const [displayInputModal, setDisplayInputModal] = useState({ display: false });
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });
  const [displayConfirmModal, setDisplayConfirmModal] = useState({ display: false });
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedTab, setSelectedTab] = useState("");
  const onCloseInputModal = () => {
    setDisplayInputModal({ display: false });
  };
  const onSubmitInputModal = () => {
    const input = document.getElementById("modal-input-value").value;
    if (displayInputModal.action === "add_sort") {
      writeNewSortOption(input)
    } else if (displayInputModal.action === "add_tab") {
      writeNewTabOption(input)
    } else if (displayInputModal.action === "add_single_choice") {
      writeNewSingleChoiceData(input)
    } else if (displayInputModal.action === "add_yes_no") {
      writeNewYesNoData(input)
    }
    onCloseInputModal();
  };
  const onCloseWarnModal = () => {
    setDisplayWarnModal({ display: false });
  };
  const onCloseConfirmModal = () => {
    setDisplayConfirmModal({ display: false });
  };
  const onConfirmConfirmModal = () => {
    if (displayConfirmModal.action === "delete_sort") {
      deleteSortOption(displayConfirmModal.data);
    } else if (displayConfirmModal.action === "delete_tab") {
      deleteTabOption(displayConfirmModal.data);
    } else if (displayConfirmModal.action === "delete_single_choice") {
      deleteSingleChoiceOption(displayConfirmModal.data);
    } else if (displayConfirmModal.action === "delete_yes_no") {
      deleteYesNoOption(displayConfirmModal.data);
    }
    onCloseConfirmModal();
  };
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      readFirebaseData();
    }
  });

  function getLabelFromList(list, value) {
    return list.filter(item => item.value === value)[0].label;
  }

  function ListSortOption() {
    const list = sortData.optionList === undefined ? [] : sortData.optionList
    return list.map(item => {
        return <div key={ item } className="container-op-and-hor-line">
          <label className={ "option-cell" + (item === selectedSort ? " radio-check-bg" : "") }>
            <input
              className="radio-input"
              type="radio"
              name="ecode"
              value={ item }
              checked={ item === selectedSort }
              onChange={ (e) => {
                const sort = e.currentTarget.value;
                setSelectedSort(sort);
                setSortContent(sortData.options[sort].content);
              } }
            />
            <img className="delete-image" src={ process.env.PUBLIC_URL + "/icon_delete.png" }
                 onClick={ () => onDeleteSort(item) }/>
            <div className="option-text radio-text">{ item }</div>
          </label>
          <div className="op-hor-line"/>
        </div>
      }
    );
  }

  function ListTabOption() {
    const list = tabData.optionList === undefined ? [] : tabData.optionList
    return list.map(item => {
        return <div key={ item } className="container-op-and-hor-line">
          <label className={ "option-cell" + (item === selectedTab ? " radio-check-bg" : "") }>
            <input
              className="radio-input"
              type="radio"
              name="ecode"
              value={ item }
              checked={ item === selectedTab }
              onChange={ (e) => {
                const tab = e.currentTarget.value;
                setSelectedTab(tab);
                setTabContent(tabData.options[tab].content);
              } }
            />
            <img className="delete-image" src={ process.env.PUBLIC_URL + "/icon_delete.png" }
                 onClick={ () => onDeleteTab(item) }/>
            <div className="option-text radio-text">{ item }</div>
          </label>
          <div className="op-hor-line"/>
        </div>
      }
    );
  }

  function ListSingleChoiceOption() {
    const list = singleChoiceData.optionList === undefined ? [] : singleChoiceData.optionList
    return list.map(item => {
        return <div key={ item }>
          <label className="option-cell radio-label">
            <img className="delete-image" src={ process.env.PUBLIC_URL + "/icon_delete.png" }
                 onClick={ () => onDeleteSingleChoice(item) }/>
            <img className="check-image"
                 src={ process.env.PUBLIC_URL + (item === singleChoiceData.correctOp ? "/icon_check_enabled.png" : "/icon_check_disabled.png") }
                 onClick={ () => writeCheckSingleChoiceData(item) }/>
            <input
              className="radio-input"
              type="radio"
              name="ecode"
              value={ item }
            />
            <div className="option-text radio-text">{ `(${ item }) ${ singleChoiceData.options[item] }` }</div>
          </label>
          <div className="op-hor-line"/>
        </div>
      }
    );
  }

  function ListYesNoOption() {
    const list = yesNoData.optionList === undefined ? [] : yesNoData.optionList
    return list.map(item => {
        return <div key={ item }>
          <label className="option-cell radio-label">
            <img className="delete-image" src={ process.env.PUBLIC_URL + "/icon_delete.png" }
                 onClick={ () => onDeleteYesNo(item) }/>
            <img className="check-image"
                 src={ process.env.PUBLIC_URL + (yesNoData.options[item]['is_correct'] === 'true' ? "/icon_check_enabled.png" : "/icon_check_disabled.png") }
                 onClick={ () => writeCheckYesNoData(item) }/>
            <input
              className="radio-input"
              type="radio"
              name={ "yes-no-option-" + item }
              value={ item }
            />
            <div className="option-text radio-text">{ yesNoData.options[item].content }</div>
          </label>
          <div className="op-hor-line"/>
        </div>
      }
    );
  }

  const onBack = () => {
    navigate(-1);
  };
  const onEditLeftDesc = () => {
    navigate(`/input-description?ecode=${ ecode }&section=${ section }&question=${ question }&desc_type=left`);
  }
  const onEditRightDesc = () => {
    navigate(`/input-description?ecode=${ ecode }&section=${ section }&question=${ question }&desc_type=right`);
  }
  const onEditSortContent = () => {
    if (selectedSort === "") return;
    localStorage.setItem("input_description_data", "left/options/" + selectedSort);
    localStorage.setItem("input_description_header", "Sort Option " + selectedSort);
    navigate(`/input-description?ecode=${ ecode }&section=${ section }&question=${ question }&desc_type=path_from_question`);
  }
  const onEditTabContent = () => {
    if (selectedTab === "") return;
    localStorage.setItem("input_description_data", "left/options/" + selectedTab);
    localStorage.setItem("input_description_header", "Tab Option " + selectedTab);
    localStorage.setItem("additional_main_div_class", " indent-text");
    navigate(`/input-description?ecode=${ ecode }&section=${ section }&question=${ question }&desc_type=path_from_question`);
  }
  const onEditNormalContent = () => {
    localStorage.setItem("input_description_data", "left/normal_data");
    localStorage.setItem("input_description_header", "Question Content");
    localStorage.setItem("additional_main_div_class", " indent-text");
    navigate(`/input-description?ecode=${ ecode }&section=${ section }&question=${ question }&desc_type=path_from_question`);
  }
  const onAddSortOption = () => {
    setDisplayInputModal({
      display: true,
      title: "Add Sort Option",
      placeholder: 'Input sort label',
      action: "add_sort"
    });
  };
  const onAddTabOption = () => {
    setDisplayInputModal({
      display: true,
      title: "Add Tab Data",
      placeholder: 'Input tab label',
      action: "add_tab"
    });
  };
  const onAddSingleChoiceOption = () => {
    let missingNumber = getMissingNumber(singleChoiceData.optionList);
    setDisplayInputModal({
      display: true,
      title: "Add Single Choice Number " + missingNumber,
      placeholder: 'Input content',
      data: missingNumber,
      action: "add_single_choice"
    });
  };
  const onAddYesNoOption = () => {
    setDisplayInputModal({
      display: true,
      title: "Add Yes/No Statement",
      placeholder: 'Input content',
      action: "add_yes_no"
    });
  };
  const getMissingNumber = (numberList) => {
    let number = 0;
    numberList.some(q => {
      if ((number + 1).toString() !== q) {
        return true;
      }
      number += 1;
      return false;
    });
    return number + 1;
  }
  const onDeleteSort = (data) => {
    setDisplayConfirmModal({
      display: true,
      title: "Delete Sort Confirmation",
      description: `Do you want to delete sort option ${ data }?`,
      action: "delete_sort",
      data: data
    });
  };
  const onDeleteTab = (data) => {
    setDisplayConfirmModal({
      display: true,
      title: "Delete Tab Confirmation",
      description: `Do you want to delete tab ${ data }?`,
      action: "delete_tab",
      data: data
    });
  };
  const onDeleteSingleChoice = (data) => {
    setDisplayConfirmModal({
      display: true,
      title: "Delete Single Choice Confirmation",
      description: `Do you want to delete single choice option ${ data }?`,
      action: "delete_single_choice",
      data: data
    });
  };
  const onDeleteYesNo = (data) => {
    setDisplayConfirmModal({
      display: true,
      title: "Delete Option Confirmation",
      description: `Do you want to delete yes/no option ${ yesNoData.options[data].content }?`,
      action: "delete_yes_no",
      data: data
    });
  };
  const showCont = (contClass) => {
    document.getElementsByClassName(contClass)[0].className = contClass;
  }
  const showContCk = (contClass) => {
    document.getElementsByClassName(contClass)[0].className = contClass + " ck-content";
  }
  const hideCont = (contClass) => {
    document.getElementsByClassName(contClass)[0].className = contClass + " hidden";
  }
  const updateLeftDataAndUi = (rawData, rawList) => {
    const leftType = rawData['type'];
    if (leftType === 'sort_table') {
      setSortData({
        optionList: (rawList === "" || rawList === null || rawList === undefined) ? [] : rawList.split(LIST_SEP),
        options: rawData === null || rawData['options'] === undefined ? {} : rawData['options']
      })
      showCont("left-desc-cont");
      showCont("sort-by-cont");
      showContCk("sort-content-cont");
      hideCont("tab-cont");
      hideCont("tab-content-cont");
      hideCont("normal-content-cont");
    } else if (leftType === 'multi_tabs') {
      setTabData({
        optionList: (rawList === "" || rawList === null || rawList === undefined) ? [] : rawList.split(LIST_SEP),
        options: rawData === null || rawData['options'] === undefined ? {} : rawData['options']
      })
      hideCont("left-desc-cont");
      hideCont("sort-by-cont");
      hideCont("sort-content-cont");
      showCont("tab-cont");
      showContCk("tab-content-cont");
      hideCont("normal-content-cont");
    } else if (leftType === 'normal') {
      const data = rawData['normal_data'];
      setNormalContent((data === "" || data === null || data === undefined) ? "" : data['content']);
      hideCont("left-desc-cont");
      hideCont("sort-by-cont");
      hideCont("sort-content-cont");
      hideCont("tab-cont");
      hideCont("tab-content-cont");
      showContCk("normal-content-cont");
    }
  }
  const updateRightDataAndUi = (rawData, rawList) => {
    if (rawData['type'] === 'yes_no') {
      setYesNoData({
        optionList: (rawList === "" || rawList === null || rawList === undefined) ? [] : rawList.split(LIST_SEP),
        options: rawData === null || rawData['options'] === undefined ? {} : rawData['options']
      })
      showCont("yes-no-cont");
      hideCont("single-choice-cont");
    } else if (rawData['type'] === 'single_choice') {
      setSingleChoiceData({
        correctOp: rawData === null ? "" : rawData['correct_option'],
        optionList: (rawList === "" || rawList === null || rawList === undefined) ? [] : rawList.split(LIST_SEP),
        options: rawData === null || rawData['options'] === undefined ? {} : rawData['options']
      })
      hideCont("yes-no-cont");
      showCont("single-choice-cont");
    }
  }

  function readFirebaseData() {
    onValue(ref(database, questionPath + "/right"), (snapshot) => {
      const rawData = snapshot.val();
      updateRightDataAndUi(rawData, rawData === null ? "" : rawData['option_list']);
    }, { onlyOnce: true });
    onValue(ref(database, questionPath + "/left"), (snapshot) => {
      const rawData = snapshot.val();
      updateLeftDataAndUi(rawData, rawData === null ? "" : rawData['option_list']);
    }, { onlyOnce: true });
    onValue(ref(database, questionPath + "/left/content"), (snapshot) => {
      const rawData = snapshot.val();
      setLeftContent(rawData)
    }, { onlyOnce: true });
    onValue(ref(database, questionPath + "/right/content"), (snapshot) => {
      const rawData = snapshot.val();
      setRightContent(rawData)
    }, { onlyOnce: true });
  }

  const writeCheckSingleChoiceData = (data) => {
    const updates = {};
    updates[`correct_option`] = data;
    update(ref(database, questionPath + "/right"), updates).then(() => {
      setSingleChoiceData({
        correctOp: data,
        options: singleChoiceData.options,
        optionList: singleChoiceData.optionList
      })
    });
  };

  const writeCheckYesNoData = (data) => {
    const yesNo = yesNoData.options[data];
    const newIsCorrect = yesNo['is_correct'] === 'true' ? 'false' : 'true';
    const updates = {};
    updates[`is_correct`] = newIsCorrect;
    update(ref(database, questionPath + "/right/options/" + data), updates).then(() => {
      yesNo['is_correct'] = newIsCorrect;
      setYesNoData({ options: yesNoData.options, optionList: yesNoData.optionList })
    });
  };
  const deleteSortOption = (data) => {
    const updates = {};
    sortData.optionList.splice(sortData.optionList.indexOf(data), 1);
    delete sortData.options[data];
    setSortData({ options: sortData.options, optionList: sortData.optionList })
    updates[`option_list`] = sortData.optionList.join(LIST_SEP);
    updates[`options/${ data }`] = null;
    update(ref(database, questionPath + "/left"), updates).then();
  };
  const deleteTabOption = (data) => {
    const updates = {};
    tabData.optionList.splice(tabData.optionList.indexOf(data), 1);
    delete tabData.options[data];
    setTabData({ options: tabData.options, optionList: tabData.optionList })
    updates[`option_list`] = tabData.optionList.join(LIST_SEP);
    updates[`options/${ data }`] = null;
    update(ref(database, questionPath + "/left"), updates).then();
  };
  const deleteSingleChoiceOption = (data) => {
    const updates = {};
    singleChoiceData.optionList.splice(singleChoiceData.optionList.indexOf(data), 1);
    let newList = singleChoiceData.optionList.sort();
    delete singleChoiceData.options[data];
    setSingleChoiceData({
      correctOp: singleChoiceData.correctOp,
      options: singleChoiceData.options,
      optionList: newList
    })
    updates[`option_list`] = newList.join(LIST_SEP);
    updates[`options/${ data }`] = null;
    update(ref(database, questionPath + "/right"), updates).then();
  };
  const deleteYesNoOption = (data) => {
    const updates = {};
    yesNoData.optionList.splice(yesNoData.optionList.indexOf(data), 1);
    delete yesNoData.options[data];
    setYesNoData({ options: yesNoData.options, optionList: yesNoData.optionList })
    updates[`option_list`] = yesNoData.optionList.join(LIST_SEP);
    updates[`options/${ data }`] = null;
    update(ref(database, questionPath + "/right"), updates).then();
  };
  const writeNewSortOption = (data) => {
    const updates = {};
    sortData.optionList.push(data);
    sortData.options[data] = { content: '' };
    setSortData({ options: sortData.options, optionList: sortData.optionList })
    updates[`option_list`] = sortData.optionList.join(LIST_SEP);
    updates[`options/${ data }/content`] = '';
    update(ref(database, questionPath + "/left"), updates).then();
  };
  const writeNewTabOption = (data) => {
    const updates = {};
    tabData.optionList.push(data);
    tabData.options[data] = { content: '' };
    setTabData({ options: tabData.options, optionList: tabData.optionList })
    updates[`option_list`] = tabData.optionList.join(LIST_SEP);
    updates[`options/${ data }/content`] = '';
    update(ref(database, questionPath + "/left"), updates).then();
  };
  const writeNewSingleChoiceData = (data) => {
    const number = displayInputModal.data;
    const updates = {};
    singleChoiceData.optionList.push(number.toString());
    let newList = singleChoiceData.optionList.sort();
    singleChoiceData.options[number.toString()] = data;
    setSingleChoiceData({
      correctOp: singleChoiceData.correctOp,
      options: singleChoiceData.options,
      optionList: newList
    })
    updates[`option_list`] = newList.join(LIST_SEP);
    updates[`options/${ number }`] = data;
    update(ref(database, questionPath + "/right"), updates).then();
  };
  const writeNewYesNoData = (data) => {
    const key = Date.now().toString();
    const updates = {};
    yesNoData.optionList.push(key);
    yesNoData.options[key] = { 'is_correct': 'true', content: data };
    setYesNoData({ options: yesNoData.options, optionList: yesNoData.optionList })
    updates[`option_list`] = yesNoData.optionList.join(LIST_SEP);
    updates[`options/${ key }`] = { 'is_correct': 'true', 'content': data };
    update(ref(database, questionPath + "/right"), updates).then();
  };
  return <div className="edit-question-details-left-right">
    <Navbar/>
    <div className="mid-cont">
      <h1>Edit Question [{ question }], { sectionName }, Exam [{ ecode }]</h1>
      <p>Type: { arrangement === 'center' ? getLabelFromList(CENTER_TYPE_LIST, centerType) : `${ getLabelFromList(LEFT_TYPE_LIST, leftType) } - ${ getLabelFromList(RIGHT_TYPE_LIST, rightType) }` }</p>
      <div className="edit-cont">
        <div className="left-cont">
          <div className="left-desc-cont ck-content hidden">
            <h2 className="edit-label">Left Description</h2>
            <button className="but-inline-right" onClick={ onEditLeftDesc }>EDIT</button>
            <div className="lr-info-cont" dangerouslySetInnerHTML={ { __html: leftContent } }/>
          </div>
          <div className="sort-by-cont hidden">
            <h2 className="edit-label">Sort By</h2>
            <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddSortOption }/>
            <div className="sort-op-cont">
              <div className="op-cont-inner">
                <ListSortOption/>
              </div>
            </div>
          </div>
          <div className="tab-cont hidden">
            <h2 className="edit-label">Tab</h2>
            <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddTabOption }/>
            <div className="sort-op-cont">
              <div className="op-cont-inner">
                <ListTabOption/>
              </div>
            </div>
          </div>
          <div className="sort-content-cont ck-content hidden">
            <h2 className="edit-label">Content</h2>
            <button className="but-inline-right" onClick={ onEditSortContent }>EDIT</button>
            <div className="sort-info-cont" dangerouslySetInnerHTML={ { __html: sortContent } }/>
          </div>
          <div className="tab-content-cont ck-content hidden">
            <h2 className="edit-label">Content</h2>
            <button className="but-inline-right" onClick={ onEditTabContent }>EDIT</button>
            <div className="tab-info-cont indent-text" dangerouslySetInnerHTML={ { __html: tabContent } }/>
          </div>
          <div className="normal-content-cont ck-content hidden">
            <h2 className="edit-label">Content</h2>
            <button className="but-inline-right" onClick={ onEditNormalContent }>EDIT</button>
            <div className="tab-info-cont indent-text" dangerouslySetInnerHTML={ { __html: normalContent } }/>
          </div>
        </div>
        <div className="right-cont">
          <div className="right-desc-cont ck-content">
            <h2 className="edit-label">Right Description</h2>
            <button className="but-inline-right" onClick={ onEditRightDesc }>EDIT</button>
            <div className="lr-info-cont" dangerouslySetInnerHTML={ { __html: rightContent } }/>
          </div>
          <div className="single-choice-cont hidden">
            <h2 className="edit-label">Single Choice Option</h2>
            <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" }
                 onClick={ onAddSingleChoiceOption }/>
            <div className="single-choice-op-cont">
              <ListSingleChoiceOption/>
            </div>
          </div>
          <div className="yes-no-cont hidden">
            <h2 className="edit-label">Yes/No Statements</h2>
            <img className="add-image" src={ process.env.PUBLIC_URL + "/icon_add.png" } onClick={ onAddYesNoOption }/>
            <div className="yes-no-op-cont">
              <div>
                <ListYesNoOption/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button className="but-back-bottom" onClick={ onBack }>BACK</button>
    </div>

    <Modal
      className="text-input-modal"
      isOpen={ displayInputModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayInputModal.title }</div>
      <input type="text" className="modal-text-input" id="modal-input-value" autoFocus="true"
             placeholder={ displayInputModal.placeholder }/>
      <div className="container-but">
        <button className="but-cancel" onClick={ onCloseInputModal }>Cancel</button>
        <button className="but-ok" onClick={ onSubmitInputModal }>Add</button>
      </div>
    </Modal>

    <Modal
      className="warn-modal"
      isOpen={ displayWarnModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayWarnModal.title }</div>
      <div className="description-text">{ displayWarnModal.description }</div>
      <button className="but-ok" onClick={ onCloseWarnModal }>OK</button>
    </Modal>

    <Modal
      className="confirm-modal"
      isOpen={ displayConfirmModal.display }
      contentLabel="Example Modal">
      <div className="modal-nav-top">{ displayConfirmModal.title }</div>
      <div className="description-text">{ displayConfirmModal.description }</div>
      <div className="container-but">
        <button className="but-cancel" onClick={ onCloseConfirmModal }>Cancel</button>
        <button className="but-ok" onClick={ onConfirmConfirmModal }>Confirm</button>
      </div>
    </Modal>
  </div>;
};
export default EditQuestionDetailsLeftRight;