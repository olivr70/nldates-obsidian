import { App, FuzzySuggestModal, Notice } from 'obsidian'; 
import { IInternationalDatesPlugin, UserDateFormat } from '../types';
import { LocaleInfo, makeDescriptionForLocale, parseLocale, SUPPORTED_LANGUAGE_CODES, SUPPORTED_LOCALES } from '../utils/intl';
import { getObsidianLanguage } from '../utils/osbidian';


/** the menu items are the supported languages and language codes */
const ITEMS = [...SUPPORTED_LOCALES, ...SUPPORTED_LANGUAGE_CODES].sort().map(parseLocale)

/** displays a fuzzy selector */
export function pickLocale(plugin:IInternationalDatesPlugin,callback:(locale:string) => void ) {
    const modal = new LocaleFuzzySuggestModal(plugin, callback)
    modal.open()
}

export class LocaleFuzzySuggestModal extends FuzzySuggestModal<LocaleInfo> {
    private plugin:IInternationalDatesPlugin;
    private callback:(locale:string) => void;
    private _displayLocale:string;

    constructor(plugin: IInternationalDatesPlugin, callback:(locale:string) => void) { 
        super(plugin.app);
        this.plugin = plugin;
        this.callback = callback;
        this._displayLocale = getObsidianLanguage()
    } 

    get displayLocale():string { return this._displayLocale }
    set displayLocale(value:string) { this._displayLocale = value }
    
    getItems(): LocaleInfo[] { 
        // Return the list of locales an most country codes

        return ITEMS; 
    }
    getItemText(item: LocaleInfo): string { 
        // Return the text to be displayed for each item
        const localeDesc = makeDescriptionForLocale(item, this.displayLocale)
        return `${item.locale} (${localeDesc})`
    }

    
    onChooseItem(item: LocaleInfo, evt: MouseEvent | KeyboardEvent): void { 
        // Define what happens when an item is selected
        new Notice(`You selected locale: ${item.locale}`)
        if (this.callback) {
            this.callback(item.locale)
        }
    }
}