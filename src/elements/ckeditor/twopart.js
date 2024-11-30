import { Plugin } from 'ckeditor5';

import InlineOptionEditing from "./inlineoptionediting";
import InlineOptionUI from "./inlineoptionui";
import TwoPartEditing from "./twopartediting";
import TwoPartUI from "./twopartui";

export default class TwoPart extends Plugin {
  static get requires() {
    return [ TwoPartEditing, TwoPartUI ];
  }
}