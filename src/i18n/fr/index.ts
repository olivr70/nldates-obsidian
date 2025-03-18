import type { Translation } from '../i18n-types'

const fr: Translation = {
	// TODO: your translations go here
	HI: "Bonjour {name}",
	utils: {
		intl: {
			localeDescriptionWithRegion: "{language} - {region}",
			localeDescriptionWithScript: "{language} avec le script {script}",
			localeDescriptionWithRegionAndScript: "{language} - {region}, avec le script {script}"
		}
	},
	commands: {
		INSERT_CURRENT_DATE : "Insérer la date du jour",
		INSERT_CURRENT_DATE_AND_TIME : "Insérer la date et l'heure",
		DATE_PICKER: "Sélectionner une date...",
		SELECT_DATE	: "Sélectionner la date sous le curseur",
		PARSE_DATE : "Convertir selon les préférences",		
		PARSE_DATE_AS_LINK: "Convertir et générer un lien",
		LINK_TO_DAILY_NOTE : "Convertir en lien vers la note quotidienne",
		PARSE_DATE_AS_TEXT : "Convertir en texte",
		PARSE_AND_FORMAT_USER : "Convertir avec un format utilisateur",
		PARSE_AND_FORMAT_LOCALE : "Convertir avec une locale",
		PARSE_AND_FORMAT_DIALOG : "Convertir avec le dialogue de mise en forme...",
		PARSE_ALL_DATES : "Convertir toutes les dates"
	},
	notifications: {
		UI_LOCALE_CHANGED: "International Dates : Utilisation de la locale **{{locale}}** pour l'interface",
		SETTINGS_LOADED: "International Dates : les préférences ont été lues",
		NOT_A_DATE : "Le texte '{text}' n'est pas reconnu comme une date",
		UNABLE_TO_FORMAT_DATE :  "Une erreur s'est produite lors de la mise en forme de la date '{text}'",
		UNABLE_TO_PROCESS_SELECTION :  "Une erreur s'est produite lors du traitement de la sélection"
	},
	modals: {
		date_format: {
			TITLE_PERSONNALIZED_DATE_FORMAT: 'Personnalized date format',
			TITLE_DATE_OPTIONS: 'Options pour la date',
			SETTING_DATE_STYLE_NAME : "Style de date",
			SETTING_DATE_STYLE_DESC : "Choix de la représentation",
			SETTING_YEAR_PART_NAME : "Année",
			SETTING_YEAR_PART_DESC : "Représentation de l'année",
			SETTING_MONTH_PART_NAME : "Mois",
			SETTING_MONTH_PART_DESC : "Choisir la mise en forme",
			SETTING_DAY_IN_MONTH_PART_NAME : "Jour du mois",
			SETTING_DAY_IN_MONTH_PART_DESC : "Choisir la mise en forme",
			SETTING_DAY_OF_WEEK_PART_NAME : "Jour de la semaine",
			SETTING_DAY_OF_WEEK_PART_DESC : "Choisir la mise en forme ",
			SETTING_DESCRIPTION_NAME : "Description",
			SETTING_DESCRIPTION_DESC : "Description du format",
			SETTING_DESCRIPTION_PLACEHOLDER : "Saisir un texte court de distinctif...",
			SETTING_LOCALE_NAME : "Locale",
			SETTING_LOCALE_DESC : "Utilisée pour formater le résultat ",
			SETTING_LOCALE_PLACEHOLDER : "Saisir un code de locale (comme 'en' ou 'en-GB')...",
			SETTING_NAME_NAME : "Nom du format",
			SETTING_NAME_DESC : "Utilisé pour y faire le sélectionner",
			SETTING_NAME_PLACEHOLDER : "Fourni un nom distinctif...",
			MSG_NOT_A_VALID_LOCALE_CODE : "La valeur n'est pas reconnue comme un code de locale",
			MSG_DATE_EXAMPLE : "Exemple de date : {date}",
			MSG_MARKDWON_EXAMPLE : "Résultat en Markdown : {date}"
		},
		suggestModal: {
			TITLE : "Choix du format de la date",
			BUTTON_INSERT_LABEL : "Date à insérer",
			BUTTON_INSERT : "Insérer",
			BUTTON_INSERT_TOOLTIP : "Ferme le dialogue et insère la date formatée",
			SETTING_DAILY_DESC : "Cocher pour insérer la date comme un lien vers la note quotidienne",
			SETTING_FORMAT_NAME: "Format",
			SETTING_FORMAT_DESC: "Format de date personnalisé à utiliser",
			SETTING_LOCALE_NAME: "Locale",
			SETTING_LOCALE_DESC: "Utilisée uniquement avec les formats génériques (@short, @long...)"
		}
	}
}

export default fr
