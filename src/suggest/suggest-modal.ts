import { Modal, Setting, TextComponent, MarkdownRenderer } from "obsidian";
import { DateStyle, IInternationalDatesPlugin, isDateStyle, IMarkdownFlags, InternationalDateSettings, IDateSuggestion, MarkdownDateParts } from "../types";
import { makeDescriptionForLocale, mayBeLocale, parseLocale } from "../utils/intl";
import { suggestionWithDefaults } from "./suggest-utils";
import { LLL } from "../i18n/localize";


const DATE_STYLE_OPTIONS:Record<DateStyle|"none", string> = { "full": "Full", "long": 'Long',  'medium': 'Medium', 'short': 'Short', 'none':"Default"}



export function showSuggestModal(suggestion:IDateSuggestion, plugin:IInternationalDatesPlugin):SuggestModal {
    console.log("ShowSuggestModal", suggestion, plugin)
    // format date from suggestion
    const markdownDate = plugin.suggestionToMarkdown(suggestionWithDefaults(suggestion, plugin))
    const modal = new SuggestModal(plugin, markdownDate)
    modal.open()
    console.log("showSuggestModal exit")
    return modal
  }

// preserve the last settings used in this dialog
let PREFERED_USER_SETTINGS:IMarkdownFlags = {}

export class SuggestModal extends Modal {
    _plugin: IInternationalDatesPlugin
    _dateOnOpen:MarkdownDateParts = undefined
    _date:MarkdownDateParts = undefined
    _insertWanted = false
    _markdownToInsert:string;

    // settings controls
    _root:HTMLElement;
    _insertButton:Setting;
    _dateMarkdown:HTMLElement;
    _locale:Setting;
    _dateFormat:Setting;
    _daily:Setting;

    // properties
    get dateOnOpen():IMarkdownFlags { return this._dateOnOpen }
    get date():MarkdownDateParts { return this._date }
    get insertWanted():boolean { return this._insertWanted }
    get markdown():string { return this._markdownToInsert }

    // callbacks
    private _onInsertWantedCallback: (modal:SuggestModal) => void
    private _onCanceledCallback: (modal:SuggestModal) => void

    constructor(plugin: IInternationalDatesPlugin, date:MarkdownDateParts) {
        super(plugin.app);
        this._plugin = plugin;
        this._dateOnOpen = { ...PREFERED_USER_SETTINGS, ...date};
        this._date = { ...this.getMarkdownFlagsFromSettings(this._plugin.settings), ...date }
        console.log("Suggest Modal construction")
        console.log(this._date)
    }

    private validateSettings() {
    }

    getMarkdownFlagsFromSettings(settings:InternationalDateSettings):IMarkdownFlags {
        const result:IMarkdownFlags = {}
        result.format = settings.selectedFormat
        result.locale = settings.locale
        result.asLink = settings.autosuggestToggleLink
        result.linkToDailyNotes = settings.linkToDailyNotes
        return result;
    }

    // events
    onInsertWanted(callback:(modal:SuggestModal) => void):SuggestModal { this._onInsertWantedCallback = callback; return this; }
    onCanceled(callback:(modal:SuggestModal) => void):SuggestModal { this._onCanceledCallback = callback; return this; }
    private emitInsert() { 
        console.log("emitInsert")
        if (this._insertWanted) {
            this._insertWanted = true;
            if (this._onInsertWantedCallback) { 
                this._onInsertWantedCallback(this)
            }
        }
    }
    private emitCanceled() { if (this._onCanceledCallback) { this._onCanceledCallback(this)}}


    onOpen() {
        const { contentEl } = this;
        // Ajouter des écouteurs d'événements pour Esc et Return
        window.addEventListener('keydown',this.handleKeydown);
        this.createControls(contentEl)
        this.updateUI()

        // Ajoutez d'autres réglages ici
    }

    createControls(contentEl:HTMLElement) {
        console.log("createControls", "flags=",this.date)
        
        this.setTitle(LLL.modals.suggestModal.TITLE())
        

        this._dateFormat = new Setting(contentEl) 
            .setName(LLL.modals.suggestModal.SETTING_FORMAT_NAME()) 
            .setDesc(LLL.modals.suggestModal.SETTING_FORMAT_DESC())
        
        this._locale = new Setting(contentEl)  
            .setName(LLL.modals.suggestModal.SETTING_LOCALE_NAME()) 
            .setDesc(LLL.modals.suggestModal.SETTING_LOCALE_DESC())
            .addText(text => {
                text.setPlaceholder('Enter locale name...')
                    .setValue(this._date.locale)
                    .onChange(value => {
                        this.validateLocale(value, text, localeError)
                    })
                text.inputEl.tabIndex = 2
            });
        const localeError = contentEl.createEl('div', { cls: 'error-message'}, (el) => el.toggleVisibility(false));
            
        this._daily = new Setting(contentEl) 
            .setName('linkToDailyNote') 
            .setDesc(LLL.modals.suggestModal.SETTING_DAILY_DESC())

        this._daily.addToggle((toggle) => {
            toggle.setValue(this._date.linkToDailyNotes);
            toggle.onChange( val => { this._date.linkToDailyNotes = val; this.updateUI()})
            toggle.toggleEl.tabIndex = 3
        })

        
        this._insertButton = new Setting(contentEl)
            .setName(LLL.modals.suggestModal.BUTTON_INSERT())
            .setDesc("")
            .addButton((btn) => {
                btn.setButtonText(LLL.modals.suggestModal.BUTTON_INSERT())
                btn.setTooltip(LLL.modals.suggestModal.BUTTON_INSERT_TOOLTIP())
                btn.onClick(evt => { this._insertWanted = true; this.close()} ); 
            })
            
        this._dateMarkdown = contentEl.createEl('div', { cls: 'nld-example nld-markdown'});
        // ---------------------------
        const userFormats = this._plugin.settings.dateFormats.map(f => [f.name, f.name]);
        // add Intl format options to the menu
        const intlFormats = ["short","medium","long","full"].map(f => [f, "@" + f]);
        const formatOptions = Object.fromEntries(userFormats.concat(intlFormats, [["none", "Default"]]))

        this._dateFormat.addDropdown(dropdown => { 
            dropdown.addOptions(formatOptions)
            dropdown.setValue(this._date.format ?? "none")
            dropdown.selectEl.tabIndex = 1
            dropdown.selectEl.focus()
            dropdown.onChange(value => {
                console.log(`new DateStyle value ${value}`)
                this._date.format = value != "none" ? value: undefined;
                PREFERED_USER_SETTINGS.format = this._date.format
                this.updateUI()
            })
        })
    }
    

    validateLocale(locale:string, text:TextComponent, localeError:HTMLDivElement) {
        if (!mayBeLocale(locale)) {
            text.inputEl.classList.add("invalid")
            localeError.setText("Value is not a valid locale string")
            localeError.toggleVisibility(true)
        } else {
            text.inputEl.classList.remove("invalid")
            localeError.toggleVisibility(false)
            this._date.locale = locale;
            PREFERED_USER_SETTINGS.locale = locale;
            this.updateUI()
        }
    }
    
    updateUI() {
        const f= this._date;
        console.log("UpdateUI")
        console.log(f)
        // locale 
        const localeDisabled = this._date.format && !["short","medium","long", "full"].contains(this._date.format) 
        this._locale.setDisabled(localeDisabled)
        if (localeDisabled) {
            this._locale.setDesc("Using the locale of the selected format")
        } else {
            this._locale.setDesc(makeDescriptionForLocale(parseLocale(this._date.locale), this._plugin.settings.locale))
        }
        // display the date in the user locale
        const dateInUserLocale = this._plugin.formatDate(this.date.dateValue, "full", this._plugin.settings.locale)
        const sug:IDateSuggestion = { ...this.date, label: this.date.dateStr, value:this.date.dateValue}
        const userDate = this._plugin.suggestionToMarkdown(sug)

    
        console.log("  dateForMarkdown=", userDate)
        this._markdownToInsert = this._plugin.generateMarkdownToInsert(userDate)
        // this._dateMarkdown.setText(`Example : ${markdown}`)
        this._dateMarkdown.empty();
        const html = MarkdownRenderer.render(this.app, this._markdownToInsert, this._dateMarkdown, "/", this._plugin)
        console.log("html=",html)
        console.log(`dateForMarkdown `, this.date)
    }



    handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            this._insertWanted = false;
            this.close();
        } else if (event.key === 'Enter') {
            this._insertWanted = true;
            this.close();
        } else {
            return false
        }
    }

    onClose() {
        console.log("onClose")
        // Supprimer les écouteurs d'événements
        window.removeEventListener('keydown', this.handleKeydown);
        if (this._insertWanted) {
            this.emitInsert()
        } else {
            this.emitCanceled()
        }
        const { contentEl } = this;
        contentEl.empty();
        this._dateFormat = undefined
        this._dateMarkdown = undefined
        this._insertButton = undefined
        this._daily = undefined
    }
}