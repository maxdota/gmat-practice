import { Command } from 'ckeditor5';

export default class InlineOptionCommand extends Command {
  execute( { value } ) {
    const editor = this.editor;
    const selection = editor.model.document.selection;

    editor.model.change( writer => {
      // Create a <placeholder> element with the "name" attribute (and all the selection attributes)...
      console.log("value.options: " + value.options)
      const placeholder = writer.createElement( 'inlineOption', {
        ...Object.fromEntries( selection.getAttributes() ),
        name: value.name,
        id: value.id,
        options: value.options
      } );

      // ... and insert it into the document. Put the selection on the inserted element.
      editor.model.insertObject( placeholder, null, null, { setSelection: 'on' } );
    } );
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;

    const isAllowed = model.schema.checkChild( selection.focus.parent, 'inlineOption' );

    this.isEnabled = isAllowed;
  }
}
