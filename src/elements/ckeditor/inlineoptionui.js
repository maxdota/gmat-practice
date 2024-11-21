import { addListToDropdown, Collection, createDropdown, Plugin, ViewModel } from 'ckeditor5';

export default class InlineOptionUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;
    // const placeholderNames = [ 'date', 'first name', 'surname' ];
    const placeholderNames = editor.config.get('placeholderConfig.types');
    const data = editor.config.get('placeholderConfig.data');
    console.log("data: " + data[0]);

    // The "placeholder" dropdown must be registered among the UI components of the editor
    // to be displayed in the toolbar.
    editor.ui.componentFactory.add('inlineOption', locale => {
      const dropdownView = createDropdown(locale);

      // Populate the list in the dropdown with items.
      addListToDropdown(dropdownView, getDropdownItemsDefinitions(placeholderNames, data));

      dropdownView.buttonView.set({
        // The t() function helps localize the editor. All strings enclosed in t() can be
        // translated and change when the language of the editor changes.
        label: t('Inline Option'),
        tooltip: true,
        withText: true
      });

      // Disable the placeholder button when the command is disabled.
      const command = editor.commands.get('inlineOption');
      dropdownView.bind('isEnabled').to(command);

      // Execute the command when the dropdown item is clicked (executed).
      this.listenTo(dropdownView, 'execute', evt => {
        editor.execute('inlineOption', {
          value: {
            name: evt.source.name,
            id: evt.source.id,
            // options: [{ label: 'Volvo', value: 'vol' }]
            options: evt.source.options
          }
        });
        editor.editing.view.focus();
      });

      return dropdownView;
    });
  }
}

function getDropdownItemsDefinitions(placeholderNames, data) {
  const itemDefinitions = new Collection();

  placeholderNames.forEach((name, index) => {
    const definition = {
      type: 'button',
      model: new ViewModel({
        name: name,
        id: 'option_' + (index + 1),
        options: data[index],
        label: name,
        withText: true
      })
    };

    // Add the item definition to the collection.
    itemDefinitions.add(definition);
  });

  return itemDefinitions;
}