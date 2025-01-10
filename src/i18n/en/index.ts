import type { BaseTranslation } from '../i18n-types'

const en: BaseTranslation = {
	// TODO: your translations go here
	HI: 'Hi {name:string}! Please leave a star if you like this project: https://github.com/ivanhofer/typesafe-i18n',
	utils: {
		intl: {
			localeDescriptionWithRegion: "{language:string} in {region:string}",
			localeDescriptionWithScript: "{language:string} using script {script:string}",
			localeDescriptionWithRegionAndScript: "{language:string} in {region:string} using script {script:string}"
		}
	},
	commands: {
		INSERT_CURRENT_DATE : "Insert the current date",
		PARSE_DATE	: "Parse and format with settings",
		PARSE_DATE_AS_LINK : "Parse and format as link",
		PARSE_DATE_AS_TEXT : "Parse and format as plain text",
		PARSE_AND_FORMAT_USER : "Parse and format with user format",
		PARSE_AND_FORMAT_LOCALE : "Parse and format with locale",
		PARSE_AND_FORMAT_DIALOG : "Parse and show format dialog..."
	},
	notifications: {
		UI_LOCALE_CHANGED: "International Dates : user interface language changed to **{locale}**",
		SETTINGS_LOADED: "Settings loaded"
	},
	modals: {
		date_format: {
			TITLE_PERSONNALIZED_DATE_FORMAT: 'Personnalized date format',
			TITLE_DATE_OPTIONS: 'Date options',
			SETTING_DATE_STYLE_NAME : "Date style",
			SETTING_DATE_STYLE_DESC : "Date style",
			SETTING_YEAR_PART_NAME : "Year part",
			SETTING_YEAR_PART_DESC : "Width of year part",
			SETTING_MONTH_PART_NAME : "Month part",
			SETTING_MONTH_PART_DESC : "Width of month part",
			SETTING_DAY_IN_MONTH_PART_NAME : "Day in month part",
			SETTING_DAY_IN_MONTH_PART_DESC : "Width of day in month part",
			SETTING_DAY_OF_WEEK_PART_NAME : "Weekday",
			SETTING_DAY_OF_WEEK_PART_DESC : "Style of weekday",
			SETTING_DESCRIPTION_NAME : "Description",
			SETTING_DESCRIPTION_DESC : "Description of user format",
			SETTING_DESCRIPTION_PLACEHOLDER : "Enter description...",
			SETTING_LOCALE_NAME : "Locale",
			SETTING_LOCALE_DESC : "Locale used for formatting",
			SETTING_LOCALE_PLACEHOLDER : "Enter code of locale (like en or en-GB)...",
			SETTING_NAME_NAME : "Name",
			SETTING_NAME_DESC : "Used to select the format",
			SETTING_NAME_PLACEHOLDER : "Enter format name...",
			MSG_NOT_A_VALID_LOCALE_CODE : "Value is not a valid locale code",
			MSG_DATE_EXAMPLE : "Date example : {date:string}",
			MSG_MARKDWON_EXAMPLE : "Markdown : {date:string}"
		},
		suggestModal: {
			TITLE : "Select date format",
			BUTTON_INSERT_LABEL : "Date to insert",
			BUTTON_INSERT : "Insert",
			BUTTON_INSERT_TOOLTIP : "Close dialog and insert date",
			SETTING_DAILY_DESC : "Check to insert date as link to the daily note",
			SETTING_FORMAT_NAME: "Date format",
			SETTING_FORMAT_DESC: "User date format to use",
			SETTING_LOCALE_NAME: "Locale",
			SETTING_LOCALE_DESC: "Used for generic date formats (@short, @long..)"
		}
	}
}

export default en
