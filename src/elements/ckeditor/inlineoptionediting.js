import { Plugin, toWidget, viewToModelPositionOutsideModelElement, Widget } from 'ckeditor5';

import InlineOptionCommand from "./inlineoptioncommand";

export default class InlineOptionEditing extends Plugin {
  static get requires() {                                                    // ADDED
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add('inlineOption', new InlineOptionCommand(this.editor));
    this.editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass('inlineOption'))
    );
    const op1Data = JSON.parse(localStorage.getItem('op1_data'));
    const op2Data = JSON.parse(localStorage.getItem('op2_data'));
    const options1 = op1Data.optionList.map((value) => {
      return { label: op1Data.options[value], value: value }
    });
    const options2 = op2Data.optionList.map((value) => {
      return { label: op2Data.options[value], value: value }
    });
    this.editor.config.define('placeholderConfig', {                           // ADDED
      types: ['Option 1', 'Option 2'],
      data: [options1, options2]
      // data: [
      //   [{ label: 'So Mot', value: 'opt_1' }, { label: 'So Hai', value: 'opt_2' }, {
      //     label: 'So Ba',
      //     value: 'opt_3'
      //   }, { label: 'So Bon', value: 'opt_4' }],
      //   [{ label: 'So Mot 2', value: 'opt_1' }, { label: 'So Hai 2', value: 'opt_2' }, {
      //     label: 'So Ba 2',
      //     value: 'opt_3'
      //   }, { label: 'So Bon 2', value: 'opt_4' }]
      // ]
    });
  }

  _defineSchema() {                                                          // ADDED
    const schema = this.editor.model.schema;

    schema.register('inlineOption', {
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
        classes: ['inlineOption']
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
        return modelWriter.createElement('inlineOption', { name: name, id: id, options: options });
      }
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'inlineOption',
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);

        // Enable widget handling on a placeholder element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      }
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'inlineOption',
      view: (modelItem, { writer: viewWriter }) => createPlaceholderView(modelItem, viewWriter)
    });

    // Helper method for both downcast converters.
    function createPlaceholderView(modelItem, viewWriter) {
      const name = modelItem.getAttribute('name');
      const id = modelItem.getAttribute('id');
      const options = modelItem.getAttribute('options');

      const selectView = viewWriter.createContainerElement('select', {
        class: 'inlineOption',
        name: name,
        id: id
      });
      const defaultView = viewWriter.createContainerElement('option', {
        class: 'option-default',
        value: '',
        selected: true
      });
      viewWriter.insert(viewWriter.createPositionAt(defaultView, 0), viewWriter.createText('Select...'));
      viewWriter.insert(viewWriter.createPositionAt(selectView, 0), defaultView);

      if (options === undefined) return selectView;
      options.forEach((opt, index) => {
        const view = viewWriter.createContainerElement('option', {
          class: 'option-label',
          value: opt.value,
          label: opt.label
        });
        viewWriter.insert(viewWriter.createPositionAt(view, 0), viewWriter.createText(opt.label));
        viewWriter.insert(viewWriter.createPositionAt(selectView, index + 1), view);
      });
      return selectView;
    }
  }
}