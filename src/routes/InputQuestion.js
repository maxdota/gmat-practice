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
  Undo, Base64UploadAdapter, ImageResizeHandles, ImageResizeEditing, Image
} from 'ckeditor5';
import SimpleBox from "../elements/ckeditor/simplebox";

import 'ckeditor5/ckeditor5.css';
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../elements/Navbar";
import '../css/InputQuestion.css.scss';
import Modal from "react-modal";
import InlineOption from "../elements/ckeditor/inlineoption";

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
  const arrangement = params.get("arrangement");
  const sectionName = list.filter(item => item.value === section)[0].label;
  const [displayWarnModal, setDisplayWarnModal] = useState({ display: false });

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  let editor;
  const editorConfig = {
    toolbar: {
      items: [
        'simpleBox',
        'inlineOption',
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
        'outdent',
        'indent'
      ],
      shouldNotGroupWhenFull: false
    },
    plugins: [
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
      SimpleBox,
      InlineOption
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
    if (inputEditor === undefined || inputEditor === null) return;
    writeFirebaseData(inputEditor.getData());
  };
  const onPreview = () => {
    if (inputEditor === undefined || inputEditor === null) return;
    let data = inputEditor.getData();
    writeFirebaseData(data);
    localStorage.setItem('review_question', data);
    navigate('/sec-question?preview=true');
  };

  function readFirebaseData(e) {
    const path = process.env.REACT_APP_FB_ROOT_DATA + '/exams/' + ecode + "/" + section + "/questions/" + question + "/" + arrangement + "/content";
    const dataRef = ref(database, path);
    onValue(dataRef, (snapshot) => {
      let rawData = snapshot.val();
      e.setData((rawData === null || rawData === undefined) ? "" : rawData);
    }, {
      onlyOnce: true
    });
  }

  const writeFirebaseData = (data) => {
    const path = 'exams/' + ecode + "/" + section + "/questions/" + question + "/" + arrangement + "/content";
    const updates = {};
    updates[path] = data;
    const exRef = ref(database, process.env.REACT_APP_FB_ROOT_DATA);
    update(exRef, updates).then(() => {
      setDisplayWarnModal({
        display: true,
        title: "Complete",
        description: "Content is saved"
      });
    });
  };
  return (
    <div className="input-question">
      <Navbar/>
      <div className="mid-cont">
        <h1>Edit Question Number [{ question }], { sectionName }, Exam [{ ecode }]</h1>
        <div className="main-container">
          <div className="editor-container editor-container_classic-editor" ref={ editorContainerRef }>
            <div className="editor-container__editor">
              <div ref={ editorRef }>{ isLayoutReady && <CKEditor
                editor={ ClassicEditor }
                config={ editorConfig }
                onReady={ (e) => {
                  editor = e;
                  setInputEditor(e);
                  // if (localStorage.getItem("test_input_question") === null) {
                  //   editor.setData("");
                  // } else {
                  //   editor.setData(localStorage.getItem("test_input_question"));
                  // }
                  readFirebaseData(editor);
                } }
              /> }</div>
            </div>
          </div>
        </div>
      </div>
      <button className="but-back-bottom" onClick={ onBack }>BACK</button>
      <button className="but-next-bottom" onClick={ onPreview }>SAVE & PREVIEW</button>
      <button className="but-next-bottom-2" onClick={ onSave }>SAVE</button>
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
export default InputQuestion;