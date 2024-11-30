import { Plugin, toWidget, viewToModelPositionOutsideModelElement, Widget } from 'ckeditor5';
import TwoPartCommand from "./twopartcommand";
import './twopart.css';

export default class TwoPartEditing extends Plugin {
  static get requires() {                                                    // ADDED
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add('twoPart', new TwoPartCommand(this.editor));
    this.editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass('twoPart'))
    );
    const op1Data = JSON.parse(localStorage.getItem('op1_data'));
    const op2Data = JSON.parse(localStorage.getItem('op2_data'));
    const options1 = op1Data.optionList.map((value) => {
      return { label: op1Data.options[value], value: value }
    });
    const options2 = op2Data.optionList.map((value) => {
      return { label: op2Data.options[value], value: value }
    });
    this.editor.config.define('twoPartConfig', {
      types: ['Option 1', 'Option 2'],
      data: [options1, options2],
      indexLabel: ["1", "2"],
    });
  }

  _defineSchema() {                                                          // ADDED
    const schema = this.editor.model.schema;

    schema.register('twoPart', {
      inheritAllFrom: '$inlineObject',
      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ['id', 'name', 'options', 'indexLabel']
    });
  }

  _defineConverters() {                                                      // ADDED
    const conversion = this.editor.conversion;

    conversion.for('upcast').elementToElement({
      view: {
        name: 'span',
        classes: ['twoPart']
      },
      model: (viewElement, { writer: modelWriter }) => {
        const indexLabel = viewElement.getAttribute('index_label');
        return modelWriter.createElement('twoPart', { indexLabel: indexLabel });
      }
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'twoPart',
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);
        return toWidget(widgetElement, viewWriter);
      }
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'twoPart',
      view: (modelItem, { writer: viewWriter }) => createPlaceholderView(modelItem, viewWriter)
    });

    // Helper method for both downcast converters.
    function createPlaceholderView(modelItem, viewWriter) {
      const indexLabel = modelItem.getAttribute('indexLabel');
      const finalView = viewWriter.createContainerElement('span', {
        class: 'twoPart',
        index_label: indexLabel
      });
      const innerText = viewWriter.createText(indexLabel);
      if (indexLabel !== undefined) {
        viewWriter.insert(viewWriter.createPositionAt(finalView, 0), innerText);
      }
      return finalView;
    }
  }
}