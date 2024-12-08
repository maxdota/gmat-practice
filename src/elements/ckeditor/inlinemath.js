import { Plugin } from 'ckeditor5';
import InlineMathEditing from "./inlinemathediting";
import InlineMathUI from "./inlinemathui";

export default class InlineMath extends Plugin {
  static get requires() {
    return [ InlineMathEditing, InlineMathUI ];
  }
}