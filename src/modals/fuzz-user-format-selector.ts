import { App, FuzzySuggestModal, Notice } from 'obsidian'; 
import { setUiLocale } from '../i18n/localize';
import { IInternationalDatesPlugin, UserDateFormat } from 'src/types';
import { makeDescriptionForLocale, MOST_LANGUAGE_CODES, MOST_LOCALES, parseLocale } from 'src/utils/intl';


const ITEMS = [...MOST_LOCALES, ...MOST_LANGUAGE_CODES]

/** displays a fuzzy selector */
export function pickUserFormat(plugin:IInternationalDatesPlugin,callback:(f:UserDateFormat) => void ) {
    setUiLocale(plugin.settings.locale)
    const modal = new UserDateFormatFuzzySuggestModal(plugin, callback)
    modal.open()
}

export class UserDateFormatFuzzySuggestModal extends FuzzySuggestModal<UserDateFormat> {
    private plugin:IInternationalDatesPlugin;
    private callback:(f:UserDateFormat) => void;

    constructor(plugin: IInternationalDatesPlugin, callback:(f:UserDateFormat) => void) { 
        super(plugin.app);
        this.plugin = plugin;
        this.callback = callback;
    } 
    
    getItems(): UserDateFormat[] { 
        // Return the list of items to be displayed
        console.log("getItems", this.plugin.settings.dateFormats)
        return this.plugin.settings.dateFormats; 
    }
    getItemText(item: UserDateFormat): string { 
        // Return the text to be displayed for each item
        const desc=  item.desc || this.makeDescriptionForUserFormat(item)
        return `${item.name} (${item.locale}) - ${desc}`
    }

    makeDescriptionForUserFormat(format:UserDateFormat):string {
        const localDesc = makeDescriptionForLocale(parseLocale(format.locale), "en")
        if (format.dateStyle) {
            return `using style <${format.dateStyle}> for ${localDesc}`
        } else {
            return `using custom style for ${localDesc}`
        }
    }

    
    onChooseItem(item: UserDateFormat, evt: MouseEvent | KeyboardEvent): void { 
        // Define what happens when an item is selected
        new Notice(`You selected: ${item.name}`)
        if (this.callback) {
            this.callback(item)
        }
    }
}