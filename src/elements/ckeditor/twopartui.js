import { addListToDropdown, Collection, createDropdown, Plugin, ViewModel } from 'ckeditor5';

export default class TwoPartUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;
    const placeholderNames = editor.config.get('twoPartConfig.types');
    const data = editor.config.get('twoPartConfig.data');

    // The "placeholder" dropdown must be registered among the UI components of the editor
    // to be displayed in the toolbar.
    editor.ui.componentFactory.add('twoPart', locale => {
      const dropdownView = createDropdown(locale);

      // Populate the list in the dropdown with items.
      addListToDropdown(dropdownView, getDropdownItemsDefinitions(placeholderNames, data));

      dropdownView.buttonView.set({
        // The t() function helps localize the editor. All strings enclosed in t() can be
        // translated and change when the language of the editor changes.
        label: t('2-part Option'),
        tooltip: true,
        withText: true
      });

      // Disable the placeholder button when the command is disabled.
      const command = editor.commands.get('twoPart');
      dropdownView.bind('isEnabled').to(command);

      // Execute the command when the dropdown item is clicked (executed).
      this.listenTo(dropdownView, 'execute', evt => {
        editor.execute('twoPart', {
          value: {
            name: evt.source.name,
            id: evt.source.id,
            options: evt.source.options,
            indexLabel: evt.source.indexLabel,
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
        indexLabel: (index + 1).toString(),
        label: name,
        withText: true
      })
    };

    // Add the item definition to the collection.
    itemDefinitions.add(definition);
  });

  return itemDefinitions;
}