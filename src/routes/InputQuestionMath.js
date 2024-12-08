import React, { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  Autoformat,
  AutoImage,
  Autosave,
  Bold,
  CloudServices,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Italic,
  List,
  ListProperties,
  Paragraph,
  RemoveFormat,
  SelectAll,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo, Base64UploadAdapter, ImageResizeHandles, ImageResizeEditing, Image
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/InputQuestionMath.css.scss';
import Modal from "react-modal";
import InlineOption from "../elements/ckeditor/inlineoption";
import TwoPart from "../elements/ckeditor/twopart";
// import InlineMath from "../elements/ckeditor/inlinemath";

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

const InputQuestionMath = () => {
  Modal.appElement = "#root";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const list = [
    { value: 'quan', label: 'Quantitative Reasoning' },
    { value: 'verb', label: 'Verbal Reasoning' },
    { value: 'data', label: 'Data Insights' }
  ];
  const CENTER_TYPE_LIST = [
    { value: 'inline_option', label: 'Inline Option' },
    { value: 'two_part', label: '2-part Analysis' },
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'math', label: 'Single Choice (Mathematics)' },
  ];
  const navigate = useNavigate();
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [inputEditor, setInputEditor] = useState(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [instructionData, setInstructionData] = useState({ editorReady: false, firebaseData: "" });
  const search = useLocation().search;
  let params = new URLSearchParams(search);
  const ecode = params.get("ecode");
  const section = params.get("section");
  const question = params.get("question");
  const arrangement = params.get("arrangement");
  const centerType = params.get("center_type");
  const sectionName = list.filter(item => item.value === section)[0].label;
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const toolbarPlugins = [
    Base64UploadAdapter,
    AccessibilityHelp,
    Alignment,
    Autoformat,
    AutoImage,
    Autosave,
    Bold,
    CloudServices,
    Essentials,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    Heading,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Image, ImageResizeEditing, ImageResizeHandles,
    Italic,
    List,
    ListProperties,
    Paragraph,
    RemoveFormat,
    SelectAll,
    SpecialCharacters,
    SpecialCharactersArrows,
    SpecialCharactersCurrency,
    SpecialCharactersEssentials,
    SpecialCharactersLatin,
    SpecialCharactersMathematical,
    SpecialCharactersText,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    TodoList,
    Underline,
    Undo,
  ];
  const toolbarItems = [
    'undo',
    'redo',
    '|',
    'heading',
    '|',
    'fontSize',
    'fontFamily',
    'fontColor',
    'fontBackgroundColor',
    '|',
    'bold',
    'italic',
    'underline',
    'subscript',
    'superscript',
    'removeFormat',
    '|',
    'specialCharacters',
    'insertImageViaUrl',
    'uploadImage',
    'insertTable',
    '|',
    'alignment',
    '|',
    'bulletedList',
    'numberedList',
    'todoList',
  ];
  if (centerType === 'inline_option') {
    toolbarPlugins.push(InlineOption);
    toolbarItems.unshift("inlineOption");
  } else if (centerType === 'two_part') {
    toolbarPlugins.push(TwoPart);
    toolbarItems.unshift("twoPart");
  // } else if (centerType === 'math') {
  //   toolbarPlugins.push(InlineMath);
  //   toolbarItems.unshift("inlineMath");
  }
  let editor;
  const editorConfig = {
    toolbar: { items: toolbarItems, shouldNotGroupWhenFull: false },
    plugins: toolbarPlugins,
    fontFamily: { supportAllValues: true },
    fontSize: {
      options: [10, 12, 14, 'default', 18, 20, 22],
      supportAllValues: true
    },
    heading: {
      options: [
        {
          model: 'paragraph',
          title: 'Paragraph',
          class: 'ck-heading_paragraph'
        },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1'
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2'
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3'
        },
        {
          model: 'heading4',
          view: 'h4',
          title: 'Heading 4',
          class: 'ck-heading_heading4'
        },
        {
          model: 'heading5',
          view: 'h5',
          title: 'Heading 5',
          class: 'ck-heading_heading5'
        },
        {
          model: 'heading6',
          view: 'h6',
          title: 'Heading 6',
          class: 'ck-heading_heading6'
        }
      ]
    },
    image: {
      toolbar: [
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'imageStyle:inline',
        'imageStyle:wrapText',
        'imageStyle:breakText',
        '|',
        'resizeImage'
      ]
    },
    initialData: "",
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true
      }
    },
    menuBar: {
      isVisible: true
    },
    placeholder: 'Type or paste your content here!',
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
    }
  };
  const onCloseWarnModal = () => {
    setDisplayWarnModal({ display: false });
  };
  const onBack = () => {
    navigate(-1);
  };
  const onSave = () => {
    // insertData("abc ngoc");
    if (inputEditor === undefined || inputEditor === null) return;
    writeFirebaseData(inputEditor.getData());
  };
  // const onPreview = () => {
  //   if (inputEditor === undefined || inputEditor === null) return;
  //   let data = inputEditor.getData();
  //   writeFirebaseData(data);
  //   localStorage.setItem('review_question', data);
  //   navigate('/question?preview=true');
  // };
  const onButtonSquareRoot = () => {
    insertToEditor(`\\(x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\)`);
  }
  const onButtonSub = () => {
    insertToEditor(`\\(a_{12}\\)`);
  }
  const onButtonSquare = () => {
    insertToEditor(`\\(a^{22}\\)`);
  }
  const onButtonSquareAndSquareRoot = () => {
    insertToEditor(`\\(\\sqrt{x^2+1}\\)`);
  }
  const onButtonFractionSimple = () => {
    insertToEditor(`\\(\\frac{2}{3}\\)`);
  }
  const onButtonFractionSquareRoot = () => {
    insertToEditor(`\\(\\sqrt{\\frac{3}{5}}\\)`);
  }
  const onButtonFraction = () => {
    insertToEditor(`\\(\\frac{a^2+b+c}{abc}\\)`);
  }
  const onButtonPercent = () => {
    insertToEditor(`\\(5\\%\\)`);
  }
  const insertToEditor = (content) => {
    const viewFragment = inputEditor.data.processor.toView(content);
    const modelFragment = inputEditor.data.toModel(viewFragment)
    inputEditor.model.insertContent(modelFragment);
  }

  function getLabelFromList(list, value) {
    return list.filter(item => item.value === value)[0].label;
  }

  function readFirebaseData(e) {
    const path = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + ecode + "/" + section + "/questions/" + question + "/" + arrangement + "/content";
    onValue(ref(database, path), (snapshot) => {
      let rawData = snapshot.val();
      e.setData((rawData === null || rawData === undefined) ? "" : rawData);
    }, { onlyOnce: true });
  }

  const writeFirebaseData = (data) => {
    const path = 'exams/' + ecode + "/" + section + "/questions/" + question + "/" + arrangement + "/content";
    const updates = {};
    updates[path] = data;
    update(ref(database, process.env.REACT_APP_FB_ROOT_DATA), updates).then(() => {
      setDisplayWarnModal({
        display: true,
        title: "Complete",
        description: "Content is saved"
      });
    });
  };
  const descriptionHeader = () => {
    return "Question";
    // if (descType === 'left' || descType === 'right') {
    //   return getLabelFromList(DESC_LIST, descType);
    // } else if (descType === "path_from_question") {
    //   return localStorage.getItem("input_description_header");
    // }
    // return "Description Header";
  }


  const insertData = (data) => {
    console.log("inputEditor");
    console.log(inputEditor);
    if (inputEditor) {

      const op1Data = JSON.parse(localStorage.getItem('op1_data'));
      console.log("op1Data.options[1]");
      console.log(op1Data.options[1]);
      // const viewFragment = inputEditor.data.processor.toView(`<mjx-container class=\"MathJax CtxtMenu_Attached_0\" jax=\"CHTML\" tabindex=\"0\" ctxtmenu_counter=\"12\" style=\"font-size: 113.1%;\"></mjx-container>`);
      const viewFragment = inputEditor.data.processor.toView(`<mjx-container>ads</mjx-container>`);
      const modelFragment = inputEditor.data.toModel(viewFragment)

      // inputEditor.model.insertContent(modelFragment);


      inputEditor.model.change(writer => {
        const rawHtml = writer.createElement('rawHtml');
        ;
        inputEditor.model.insertObject(rawHtml, null, null, {
          setSelection: 'after'
        });
      })

      // inputEditor.model.change(writer => {
      //   const insertPosition = inputEditor.model.document.selection.getFirstPosition()
      //   writer.insert(modelFragment, insertPosition)
      // })
    }
  };
  return (
    <div className="input-question-math">
      <Navbar/>
      <div className="mid-cont">
        <h1>Edit Question Number [{ question }], { sectionName }, Exam [{ ecode }]</h1>
        <div>Type: { getLabelFromList(CENTER_TYPE_LIST, centerType) }</div>
        <div className="main-container">
          <div className="button-and-preview-cont">
            <div className="button-cont">
              <button onClick={ onButtonSquare }>{ `\\(a^{22}\\)` }</button>
              <button onClick={ onButtonSub }>{ `\\(a_{12}\\)` }</button>
              <button onClick={ onButtonSquareAndSquareRoot }>{ `\\(\\sqrt{x^2+1}\\)` }</button>
              <button onClick={ onButtonFractionSimple }>{ `\\(\\frac{2}{3}\\)` }</button>
              <button onClick={ onButtonFractionSquareRoot }>{ `\\(\\sqrt{\\frac{3}{5}}\\)` }</button>
              <button onClick={ onButtonFraction }>{ `\\(\\frac{a^2+b+c}{abc}\\)` }</button>
              <button onClick={ onButtonSquareRoot }>{ `\\(x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\)` }</button>
              <button onClick={ onButtonPercent }>{ `\\(5\\%\\)` }</button>
            </div>
            <div className="preview-content ck-content"/>
          </div>
          <div className="math-jax-ignore editor-container editor-container_classic-editor" ref={ editorContainerRef }>
            <div className="editor-container__editor">
              <div ref={ editorRef }>{ isLayoutReady && <CKEditor
                editor={ ClassicEditor }
                config={ editorConfig }
                onChange={ (event, editor) => {
                  console.log("Edit onChange!");
                  document.getElementsByClassName('preview-content')[0].innerHTML = editor.getData();
                  if (typeof window?.MathJax !== "undefined") {
                    window.MathJax.typesetClear();
                    window.MathJax.typeset();
                  }
                } }
                onReady={ (e) => {
                  editor = e;
                  setInputEditor(e);
                  readFirebaseData(editor);
                } }
              /> }</div>
            </div>
          </div>
        </div>
      </div>
      <button className="but-back-bottom" onClick={ onBack }>BACK</button>
      {/*<button className="but-next-bottom" onClick={ onPreview }>SAVE & PREVIEW</button>*/}
      <button className="but-next-bottom" onClick={ onSave }>SAVE</button>
      <Modal
        className="warn-modal"
        isOpen={ displayWarnModal.display }
        contentLabel="Example Modal">
        <div className="modal-nav-top">{ displayWarnModal.title }</div>
        <div className="description-text">{ displayWarnModal.description }</div>
        <button className="but-ok" onClick={ onCloseWarnModal }>OK</button>
      </Modal>
    </div>
  );
}
export default InputQuestionMath;