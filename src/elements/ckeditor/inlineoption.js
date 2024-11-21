import { Plugin } from 'ckeditor5';

import InlineOptionEditing from "./inlineoptionediting";
import InlineOptionUI from "./inlineoptionui";

export default class InlineOption extends Plugin {
  static get requires() {
    return [ InlineOptionEditing, InlineOptionUI ];
  }
}