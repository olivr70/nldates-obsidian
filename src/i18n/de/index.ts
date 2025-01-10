import type { Translation } from '../i18n-types'

const de: Translation = {
	// this is an example Translation, just rename or delete this folder if you want
	HI: 'Hallo {name}! Bitte hinterlasse einen Stern, wenn dir das Projekt gefällt: https://github.com/ivanhofer/typesafe-i18n',
	utils: {
		intl: {
			localeDescriptionWithRegion: "{language} in {region}",
			localeDescriptionWithScript: "{language} mit der {script}-Schrift",
			localeDescriptionWithRegionAndScript: "{language} in {region} mit def {script}-Schrift"
		}
	},
	commands: {
		INSERT_CURRENT_DATE : "Das aktuelle Datum einfügen",
		PARSE_DATE	: "Parsing natürliches Sprachdatum",
		PARSE_DATE_AS_LINK: "Parsing natürliches Sprachdatum (als Link)",
		PARSE_DATE_AS_TEXT: "Parsing natürliches Sprachdatum (als reiner Text)",
		PARSE_AND_FORMAT_USER : "Parsen und Formatieren mit Benutzerformat",
		PARSE_AND_FORMAT_LOCALE : "Parsen und Formatieren mit Gebietsschema",
		PARSE_AND_FORMAT_DIALOG : "Parsen und Anzeigen des Formatdialogs..."
	},
	notifications: {
		UI_LOCALE_CHANGED: "International Dates : Verwendung von **{locale}** für die Benutzeroberfläche",
		SETTINGS_LOADED: "Einstellungen geladen"
	},
	modals: {
		date_format: {
			TITLE_PERSONNALIZED_DATE_FORMAT: 'Personalisiertes Datumsformat',
			TITLE_DATE_OPTIONS: 'Datumsoptionen',
			SETTING_DATE_STYLE_NAME : "Datum Stil",
			SETTING_DATE_STYLE_DESC : "Datum Stil",
			SETTING_YEAR_PART_NAME : "Jahr Teil",
			SETTING_YEAR_PART_DESC : "Breite des Jahresteils",
			SETTING_MONTH_PART_NAME : "Monatsteil",
			SETTING_MONTH_PART_DESC : "Width of month part",
			SETTING_DAY_IN_MONTH_PART_NAME : "Breite des Monatsteils",
			SETTING_DAY_IN_MONTH_PART_DESC : "Breite des Tages im Monatsteil",
			SETTING_DAY_OF_WEEK_PART_NAME : "Wochentag",
			SETTING_DAY_OF_WEEK_PART_DESC : "Stil des Wochentags",
			SETTING_DESCRIPTION_NAME : "Beschreibung",
			SETTING_DESCRIPTION_DESC : "Beschreibung des Benutzerformats",
			SETTING_DESCRIPTION_PLACEHOLDER : "Beschreibung eingeben...",
			SETTING_LOCALE_NAME : "Sprachgebietsschema",
			SETTING_LOCALE_DESC : "Für die Formatierung verwendetes Gebietsschema",
			SETTING_LOCALE_PLACEHOLDER : "Code des Gebietsschemas eingeben (wie en oder en-GB)...",
			SETTING_NAME_NAME : "Name",
			SETTING_NAME_DESC : "Dient zur Auswahl des Formats",
			SETTING_NAME_PLACEHOLDER : "Formatname eingeben...",
			MSG_NOT_A_VALID_LOCALE_CODE : "Wert ist kein gültiger Gebietsschema-Code",
			MSG_DATE_EXAMPLE : "Datumsbeispiel : {date}",
			MSG_MARKDWON_EXAMPLE : "Markdown : {date}"
		},
		suggestModal: {
			TITLE : "Datumsformat auswählen",
			BUTTON_INSERT_LABEL : "Datum zum Einfügen",
			BUTTON_INSERT : "Einfügen",
			BUTTON_INSERT_TOOLTIP : "Schließt den Dialog und fügt das formatierte Datum ein",
			SETTING_DAILY_DESC : "Prüfen Sie, ob Sie das Datum als Link zur Tagesnotiz einfügen können.",
			SETTING_FORMAT_NAME: "Datumsformat",
			SETTING_FORMAT_DESC: "Zu verwendendes Datumsformat",
			SETTING_LOCALE_NAME: "Lokales",
			SETTING_LOCALE_DESC: "Verwendet für allgemeine Datumsformate (@short, @long..)"
		}
	}
}

export default de
