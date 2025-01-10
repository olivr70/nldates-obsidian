import { App, Modal, Setting, TextComponent } from 'obsidian';
import { DateStyle, IntlDayFormat, FieldType, IInternationalDatesPlugin, IntlMonthFormat, UserDateFormat, IntlWeekDayFormat, IntlYearFormat } from './types';
import { mayBeLocale } from './utils/intl';


import { LLL } from "./i18n/localize";
import { debug } from './utils/debug';

const DATE_STYLE_OPTIONS:Record<DateStyle|"none", string> = { "full": "Full", "long": 'Long',  'medium': 'Medium', 'short': 'Short', "none":'User defined' }

const YEAR_OPTIONS:Record<IntlYearFormat|"none",string> = { "none":"None", "numeric":"Variable","2-digit" : "On 2 digits"}

const MONTH_OPTIONS:Record<IntlMonthFormat|"none", string> =  { "none":"None", "numeric": "Variable","2-digit":"On 2 digits", "long":"Long", "short":"Short", "narrow" : "Narrow" }

const DAY_OPTIONS:Record<IntlDayFormat|"none",string> = { "none":"None", "numeric":"Variable","2-digit" : "On 2 digits"}

const WEEKDAY_OPTIONS:Record<IntlWeekDayFormat|"none", string> = { "none":"None","long": "Long", "short" : "Short", "narrow": "Narrow", }

export class SettingsDateFormatModal extends Modal {
    _plugin: IInternationalDatesPlugin
    _format:UserDateFormat;
    _oldName?:string

    // settings
    _dateExample:HTMLElement;
    _dateMarkdown:HTMLElement;
    _yearSetting:Setting;
    _monthSetting:Setting;
    _daySetting:Setting;
    _weekDaySetting:Setting;

    // properties
    get namedHasChanged():boolean { return this._oldName != this._format.name }
    get oldName():string | undefined { return this._oldName }

    // callbacks
    private _onClosedCallback: (modal:SettingsDateFormatModal) => void

    constructor(plugin: IInternationalDatesPlugin, format:UserDateFormat) {
        super(plugin.app);
        this._plugin = plugin;
        this._format = format;
        this._oldName = format.name

        //loadAllLocales();

    }

    private validateSettings() {
        if (this._format.name.trim() == "") {
            this._format.name = this._oldName ?? "untitled";
        }     
    }

    // events
    onClosed(callback:(modal:SettingsDateFormatModal) => void):SettingsDateFormatModal { this._onClosedCallback = callback; return this; }
    private emitClose() { if (this._onClosedCallback) { this._onClosedCallback(this)}}


    onOpen() {
        debug("SettingsDateFormatModal.onOpen")
        debug("LLL", LLL)
        debug(LLL.modals.date_format.MSG_MARKDWON_EXAMPLE)
        const { contentEl } = this;
        contentEl.createEl('h2', { text: LLL.modals.date_format.TITLE_PERSONNALIZED_DATE_FORMAT() });

        new Setting(contentEl)
            .setName(LLL.modals.date_format.SETTING_NAME_NAME())
            .setDesc(LLL.modals.date_format.SETTING_NAME_DESC())
            .addText(text => 
                text.setPlaceholder(LLL.modals.date_format.SETTING_NAME_PLACEHOLDER())
                    .setValue(this._format.name.trim())
                    .onChange(value => {
                        let candidate = value.trim();
                        let unique = this._plugin.findUniqueFormatName(candidate)
                        this._format.name = unique
                    })
            );

        new Setting(contentEl)
            .setName(LLL.modals.date_format.SETTING_DESCRIPTION_NAME())
            .setDesc(LLL.modals.date_format.SETTING_DESCRIPTION_DESC())
            .addText(text => 
                text.setPlaceholder(LLL.modals.date_format.SETTING_DESCRIPTION_PLACEHOLDER())
            
                .setValue(this._format.desc)
                .onChange(value => { this._format.desc = value; })
            );

            
        new Setting(contentEl) 
            .setName(LLL.modals.date_format.SETTING_LOCALE_NAME()) 
            .setDesc(LLL.modals.date_format.SETTING_LOCALE_DESC())
            .addText(text => {
                text.setPlaceholder(LLL.modals.date_format.SETTING_LOCALE_PLACEHOLDER())
                    .setValue(this._format.locale)
                    .onChange(value => this.validateLocale(value, text, localeError))
            });
        const localeError = contentEl.createEl('div', { cls: 'error-message'}, (el) => el.toggleVisibility(false));

        this.createDateSettings(contentEl)
        
            
        this.updateUI()

        // Ajoutez d'autres réglages ici
    }

    validateLocale(locale:string, text:TextComponent, localeError:HTMLDivElement) {
        if (!mayBeLocale(locale)) {
            text.inputEl.classList.add("invalid")
            localeError.setText(LLL.modals.date_format.MSG_NOT_A_VALID_LOCALE_CODE())
            localeError.toggleVisibility(true)
        } else {
            text.inputEl.classList.remove("invalid")
            localeError.toggleVisibility(false)
            this._format.locale = locale;
            this.updateUI()
        }
    }

    private createDateSettings(contentEl:HTMLElement) {

        
        const cols = contentEl.createDiv({ cls:"flex" });
        const dateCol = cols.createDiv({ cls:"box", attr: { style: "// background-color:yellow"} })
        const timeCol = cols.createDiv({ cls:"box", attr: { style: "// background-color:#606060"} })

        const dateContainer = dateCol
        dateContainer.createEl('h2', { text: LLL.modals.date_format.TITLE_DATE_OPTIONS() });
        this._dateExample = dateContainer.createEl('div', { cls: 'nld-example'});
        this._dateMarkdown = dateContainer.createEl('div', { cls: 'nld-example'});
        new Setting(dateContainer)
            .setName(LLL.modals.date_format.SETTING_DATE_STYLE_NAME())
            .setDesc(LLL.modals.date_format.SETTING_DATE_STYLE_DESC())
            .addDropdown((dropdown => {
                dropdown.addOptions(DATE_STYLE_OPTIONS)
                dropdown.setValue(this._format.dateStyle ?? "none")
                dropdown.onChange(value => {
                    this._format.dateStyle = value != "none" ? <DateStyle>value: undefined;
                    this.updateUI()
                })
            }))

        this._yearSetting = new Setting(dateContainer) 
            .setName(LLL.modals.date_format.SETTING_YEAR_PART_NAME()) 
            .setDesc(LLL.modals.date_format.SETTING_YEAR_PART_DESC())
        
        this._monthSetting = new Setting(dateContainer) 
            .setName(LLL.modals.date_format.SETTING_MONTH_PART_NAME()) 
            .setDesc(LLL.modals.date_format.SETTING_MONTH_PART_DESC())
        this._daySetting = new Setting(dateContainer) 
            .setName(LLL.modals.date_format.SETTING_DAY_IN_MONTH_PART_NAME()) 
            .setDesc(LLL.modals.date_format.SETTING_DAY_IN_MONTH_PART_DESC())
        this._weekDaySetting = new Setting(dateContainer) 
            .setName(LLL.modals.date_format.SETTING_DAY_OF_WEEK_PART_NAME()) 
            .setDesc(LLL.modals.date_format.SETTING_DAY_OF_WEEK_PART_DESC())
        
            const f = this._format
        
        this._yearSetting.addDropdown(dd => {
                dd.addOptions(YEAR_OPTIONS)
                    .setValue(this._format.year ?? "none") 
                    .onChange(value => { this._format.year = (value != "none" ? <IntlYearFormat>value : undefined ); this.updateUI()})
        })
        this._monthSetting.addDropdown(dd => 
                dd.addOptions(MONTH_OPTIONS)
                    .setValue(this._format.month ?? "none")
                    .onChange(value => { this._format.month = (value != "none" ? <IntlMonthFormat>value : undefined); this.updateUI()})); 
        this._daySetting.addDropdown(dd => {
                dd.addOptions(DAY_OPTIONS)
                    .setValue(this._format.day ?? "none")
                    .onChange(value => { this._format.day = ((value != "none" ? <IntlDayFormat>value : undefined )); this.updateUI() })
            }); 
        this._weekDaySetting.addDropdown(dd => {
                dd.addOptions(WEEKDAY_OPTIONS)
                    .setValue(this._format.weekday ?? "none")
                    .onChange(value => { this._format.weekday = ((value != "none" ? <IntlWeekDayFormat>value : undefined )); this.updateUI() })
            }); 
    }
    
    updateUI() {
        const f= this._format;
        // enable/disable
        const disabled = f.dateStyle != undefined
        this._yearSetting.setDisabled(disabled)
        this._monthSetting.setDisabled(disabled)
        this._daySetting.setDisabled(disabled); 
        this._weekDaySetting.setDisabled(disabled); 
        // only keep date element
        const dateSettings = f.dateStyle ? { dateStyle: f.dateStyle} : { year: f.year, month:f.month, day:f.day, weekday:f.weekday }
       const now = new Date();
        const nowForMarkdown = this._plugin.dateToMarkdown(now, this._format)
        const markdown = this._plugin.generateMarkdownToInsert(nowForMarkdown)
        this._dateExample.setText(LLL.modals.date_format.MSG_DATE_EXAMPLE({ date: nowForMarkdown.dateStr }))
        this._dateMarkdown.setText(LLL.modals.date_format.MSG_MARKDWON_EXAMPLE({date:markdown}))
        console.log(`Now : ${now}`)
    }

    onClose() {
        this.emitClose()
        const { contentEl } = this;
        contentEl.empty();
        this._dateExample = undefined
        this._daySetting = undefined
        this._monthSetting = undefined
        this._yearSetting = undefined
    }
}
