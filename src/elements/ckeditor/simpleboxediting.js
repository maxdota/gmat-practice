import { Plugin, toWidget, toWidgetEditable, Widget } from 'ckeditor5';
import SimpleBoxCommand from './simpleBoxCommand';

export default class SimpleBoxEditing extends Plugin {
  static get requires() {                                                    // ADDED
    return [ Widget ];
  }
  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add( 'insertSimpleBox', new SimpleBoxCommand( this.editor ) );
  }

  _defineSchema() {                                                          // ADDED
    const schema = this.editor.model.schema;

    schema.register( 'simpleBox', {
      // Behaves like a self-contained block object (e.g. a block image)
      // allowed in places where other blocks are allowed (e.g. directly in the root).
      inheritAllFrom: '$blockObject'
    } );

    schema.register( 'simpleBoxTitle', {
      // Cannot be split or left by the caret.
      isLimit: true,

      allowIn: 'simpleBox',

      // Allow content which is allowed in blocks (i.e. text with attributes).
      allowContentOf: '$block'
    } );

    schema.register( 'simpleBoxDescription', {
      // Cannot be split or left by the caret.
      isLimit: true,

      allowIn: 'simpleBox',

      // Allow content which is allowed in the root (e.g. paragraphs).
      allowContentOf: '$root'
    } );

    schema.addChildCheck( ( context, childDefinition ) => {
      if ( context.endsWith( 'simpleBoxDescription' ) && childDefinition.name === 'simpleBox' ) {
        return false;
      }
    } );
  }

  _defineConverters() {                                                      // ADDED
    const conversion = this.editor.conversion;

    conversion.for( 'upcast' ).elementToElement( {
      model: 'simpleBox',
      view: {
        name: 'section',
        classes: 'simple-box'
      }
    } );
    conversion.for( 'dataDowncast' ).elementToElement( {
      model: 'simpleBox',
      view: {
        name: 'section',
        classes: 'simple-box'
      }
    } );
    conversion.for( 'editingDowncast' ).elementToElement( {
      model: 'simpleBox',
      view: ( modelElement, { writer: viewWriter } ) => {
        const section = viewWriter.createContainerElement( 'section', { class: 'simple-box' } );
        return toWidget( section, viewWriter, { label: 'simple box widget' } );
      }
    } );
    conversion.for( 'upcast' ).elementToElement( {
      model: 'simpleBoxTitle',
      view: {
        name: 'h1',
        classes: 'simple-box-title'
      }
    } );
    conversion.for( 'dataDowncast' ).elementToElement( {
      model: 'simpleBoxTitle',
      view: {
        name: 'h1',
        classes: 'simple-box-title'
      }
    } );
    conversion.for( 'editingDowncast' ).elementToElement( {
      model: 'simpleBoxTitle',
      view: ( modelElement, { writer: viewWriter } ) => {
        // Note: You use a more specialized createEditableElement() method here.
        const h1 = viewWriter.createEditableElement( 'h1', { class: 'simple-box-title' } );
        return toWidgetEditable( h1, viewWriter );
      }
    } );
    conversion.for( 'upcast' ).elementToElement( {
      model: 'simpleBoxDescription',
      view: {
        name: 'div',
        classes: 'simple-box-description'
      }
    } );
    conversion.for( 'dataDowncast' ).elementToElement( {
      model: 'simpleBoxDescription',
      view: {
        name: 'div',
        classes: 'simple-box-description'
      }
    } );
    conversion.for( 'editingDowncast' ).elementToElement( {
      model: 'simpleBoxDescription',
      view: ( modelElement, { writer: viewWriter } ) => {
        // Note: You use a more specialized createEditableElement() method here.
        const div = viewWriter.createEditableElement( 'div', { class: 'simple-box-description' } );
        return toWidgetEditable( div, viewWriter );
      }
    } );
  }
}