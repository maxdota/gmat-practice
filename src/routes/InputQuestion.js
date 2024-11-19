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
  Indent,
  IndentBlock,
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
  Undo
} from 'ckeditor5';
import SimpleBox from "../elements/ckeditor/simplebox";

import 'ckeditor5/ckeditor5.css';
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/InputQuestion.css.scss';
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

const InputQuestion = () => {
  Modal.appElement = "#root";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const list = [
    { value: 'quan', label: 'Quantitative Reasoning' },
    { value: 'verb', label: 'Verbal Reasoning' },
    { value: 'data', label: 'Data Insights' }
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
  const sectionName = list.filter(item => item.value === section)[0].label;

  useEffect(() => {
    // if (firstLoad && instructionData.editorReady) {
    //   setFirstLoad(false);
    //   readFirebaseData();
    // }
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  let editor;
  const editorConfig = {
    toolbar: {
      items: [
        'simpleBox',
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
        'insertTable',
        '|',
        'alignment',
        '|',
        'bulletedList',
        'numberedList',
        'todoList',
        'outdent',
        'indent'
      ],
      shouldNotGroupWhenFull: false
    },
    plugins: [
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
      Indent,
      IndentBlock,
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
      SimpleBox
    ],
    fontFamily: {
      supportAllValues: true
    },
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
    initialData:
      "<h2>Congratulations on setting up CKEditor 5! 🎉</h2>\n<p>\n\tYou've successfully created a CKEditor 5 project. This powerful text editor\n\twill enhance your application, enabling rich text editing capabilities that\n\tare customizable and easy to use.\n</p>\n<h3>What's next?</h3>\n<ol>\n\t<li>\n\t\t<strong>Integrate into your app</strong>: time to bring the editing into\n\t\tyour application. Take the code you created and add to your application.\n\t</li>\n\t<li>\n\t\t<strong>Explore features:</strong> Experiment with different plugins and\n\t\ttoolbar options to discover what works best for your needs.\n\t</li>\n\t<li>\n\t\t<strong>Customize your editor:</strong> Tailor the editor's\n\t\tconfiguration to match your application's style and requirements. Or\n\t\teven write your plugin!\n\t</li>\n</ol>\n<p>\n\tKeep experimenting, and don't hesitate to push the boundaries of what you\n\tcan achieve with CKEditor 5. Your feedback is invaluable to us as we strive\n\tto improve and evolve. Happy editing!\n</p>\n<h3>Helpful resources</h3>\n<p>\n\t<i>An editor without the </i><code>Link</code>\n\t<i>plugin? That's brave! We hope the links below will be useful anyway </i\n\t>😉\n</p>\n<ul>\n\t<li>\n\t\t📝 Trial sign up: https://orders.ckeditor.com/trial/premium-features,\n\t</li>\n\t<li>\n\t\t📕 Documentation:\n\t\thttps://ckeditor.com/docs/ckeditor5/latest/installation/index.html,\n\t</li>\n\t<li>\n\t\t⭐️ GitHub (star us if you can!): https://github.com/ckeditor/ckeditor5,\n\t</li>\n\t<li>🏠 CKEditor Homepage: https://ckeditor.com,</li>\n\t<li>🧑‍💻 CKEditor 5 Demos: https://ckeditor.com/ckeditor-5/demo/</li>\n</ul>\n<h3>Need help?</h3>\n<p>\n\tSee this text, but the editor is not starting up? Check the browser's\n\tconsole for clues and guidance. It may be related to an incorrect license\n\tkey if you use premium features or another feature-related requirement. If\n\tyou cannot make it work, file a GitHub issue, and we will help as soon as\n\tpossible!\n</p>\n",
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
  const onBack = () => {
    navigate(-1);
  };
  const onUpdate = () => {
    console.log("editor = " + inputEditor);
    if (inputEditor === undefined || inputEditor === null) return;
    let data = inputEditor.getData();
    localStorage.setItem('test_input_question', data);
    // writeInstruction(data);
  };

  // function readFirebaseData(e) {
  //   const dataRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA + `/instructions/${ code }`);
  //   onValue(dataRef, (snapshot) => {
  //     let rawData = snapshot.val();
  //     console.log("fb data: " + rawData);
  //     e.setData((rawData === null || rawData === undefined) ? "" : rawData);
  //     setInstructionData({ editorReady: instructionData.editorReady, firebaseData: rawData });
  //   }, {
  //     onlyOnce: true
  //   });
  // }

  // const writeInstruction = (data) => {
  //   const updates = {};
  //   updates[`instructions/${ code }`] = data;
  //   const exRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA);
  //   update(exRef, updates).then(() => {
  //     // readFirebaseData();
  //   });
  // };
  return (
    <div className="input-question">
      <Navbar/>
      <div className="mid-cont">
        <h1>Edit Exam [{ ecode }], { sectionName }, Question Number [{ question }]</h1>
        <div className="main-container">
          <div className="editor-container editor-container_classic-editor" ref={ editorContainerRef }>
            <div className="editor-container__editor">
              <div ref={ editorRef }>{ isLayoutReady && <CKEditor
                editor={ ClassicEditor }
                config={ editorConfig }
                onReady={ (e) => {
                  editor = e;
                  setInputEditor(e);
                  // editor.setData(instructionData.firebaseData);
                  if (localStorage.getItem("test_input_question") === null) {
                    editor.setData("");
                  } else {
                    editor.setData(localStorage.getItem("test_input_question"));
                  }
                  // readFirebaseData(editor);
                } }
              /> }</div>
            </div>
          </div>
        </div>
      </div>
      <button className="but-back-bottom" onClick={ onBack }>BACK</button>
      <button className="but-next-bottom" onClick={ onUpdate }>UPDATE</button>
    </div>
  );
}
export default InputQuestion;