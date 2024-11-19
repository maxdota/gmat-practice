import SimpleBoxEditing from './simpleboxediting';
import SimpleBoxUI from './simpleboxui';
import { Plugin } from 'ckeditor5';

export default class SimpleBox extends Plugin {
  static get requires() {
    return [ SimpleBoxEditing, SimpleBoxUI ];
  }
}