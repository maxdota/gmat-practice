import { Plugin, toWidget, viewToModelPositionOutsideModelElement, Widget } from 'ckeditor5';

import InlineMathCommand from "./inlinemathcommand";
// import MathJax from "react-mathjax";

export default class InlineMathEditing extends Plugin {
  static get requires() {                                                    // ADDED
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add('inlineMath', new InlineMathCommand(this.editor));
    this.editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass('inlineMath'))
    );
    const op1Data = JSON.parse(localStorage.getItem('op1_data'));
    console.log("op1Data");
    console.log(op1Data);
    const op2Data = JSON.parse(localStorage.getItem('op2_data'));
    const options = op1Data.optionList.map((value) => {
      return { label: op1Data.options[value], value: value }
    });
    const types = options.map((item) => { return item.label; });
    console.log("types");
    console.log(types);
    const options2 = op2Data.optionList.map((value) => {
      return { label: op2Data.options[value], value: value }
    });
    this.editor.config.define('placeholderConfig', {                           // ADDED
      types: types,
      data: [options, options2]
    });
  }

  _defineSchema() {                                                          // ADDED
    const schema = this.editor.model.schema;

    schema.register('inlineMath', {
      // Behaves like a self-contained inline object (e.g. an inline image)
      // allowed in places where $text is allowed (e.g. in paragraphs).
      // The inline widget can have the same attributes as text (for example linkHref, bold).
      inheritAllFrom: '$inlineObject',

      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ['id', 'name', 'options']
    });
  }

  _defineConverters() {                                                      // ADDED
    const conversion = this.editor.conversion;

    conversion.for('upcast').elementToElement({
      view: {
        name: 'select',
        classes: ['inlineMath']
      },
      model: (viewElement, { writer: modelWriter }) => {
        const name = viewElement.getAttribute('name');
        const id = viewElement.getAttribute('id');
        const options = [];
        viewElement.getChildren().forEach((opt, index) => {
          if (index !== 0) {
            options.push({ label: opt.getAttribute('label'), value: opt.getAttribute('value') })
          }
        });
        return modelWriter.createElement('inlineMath', { name: name, id: id, options: options });
      }
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'inlineMath',
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);

        // Enable widget handling on a placeholder element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      }
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'inlineMath',
      view: (modelItem, { writer: viewWriter }) => createPlaceholderView(modelItem, viewWriter)
    });

    // Helper method for both downcast converters.
    function createPlaceholderView(modelItem, viewWriter) {
      const name = modelItem.getAttribute('name');
      const id = modelItem.getAttribute('id');
      const options = modelItem.getAttribute('options');
      console.log("name");
      console.log(name);

      const selectView = viewWriter.createContainerElement('div', {
        class: 'inlineMath',
        name: name,
        id: id,
      });
      selectView.innerhtml = "<b>Ngoc</b>";

      const tView = viewWriter.createContainerElement('div', {
        class: 'inlineMath',
      });
      tView.innerHTML = "<b>Ngoc</b>";
      // const defaultView = viewWriter.createContainerElement('MathJax.Node', {
      //   class: 'option-default',
      //   formula: name,
      //   value: '',
      //   selected: true
      // });
      // viewWriter.insert(viewWriter.createPositionAt(defaultView, 0), viewWriter.createText(name));
      // viewWriter.insert(viewWriter.createPositionAt(selectView, 0), defaultView);
      // viewWriter.insert(viewWriter.createPositionAt(selectView, 0), viewWriter.html(name));
      // viewWriter.insert(viewWriter.createPositionAt(selectView, 0), viewWriter.createText(`abc`));
      viewWriter.insert(viewWriter.createPositionAt(selectView, 0), tView);
      return selectView;
    }
  }
}