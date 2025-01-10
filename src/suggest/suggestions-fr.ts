import { EditorSuggestContext } from "obsidian";
import { IDateSuggestion, ISuggestionMaker } from "../types";


export class SuggestionsMakerFrOld implements ISuggestionMaker {

    getDateSuggestions(context: EditorSuggestContext): IDateSuggestion[] {
        if (context.query.match(/^heure/)) {
          return ["maintenant", "dans 15 minutes", "dans 1 heure", "il y a 15 minutes", "il y a 1 heure"]
            .map((val) => ({ label: `time:${val}` }))
            .filter((item) => item.label.toLowerCase().startsWith(context.query));
        }
        if (context.query.match(/(prochaine?|précédente?|ce(tte)?)/i)) {
          const reference = context.query.match(/(next|last|this)/i)[1];
          return [
            "semaine",
            "mois",
            "année",
            "Lundi",
            "Mardi",
            "Mercredi",
            "Jeudi",
            "Vendredi",
            "Samedi",
            "Dimanche",
            "FR"
          ]
            .map((val) => ({ label: `${reference} ${val}` }))
            .filter((items) => items.label.toLowerCase().startsWith(context.query));
        }
    
        const relativeDate =
          context.query.match(/^dans ([+-]?\d+)/i) || context.query.match(/^([+-]?\d+)/i);
        if (relativeDate) {
          const timeDelta = relativeDate[1];
          return [
            { label: `dans ${timeDelta} minutes` },
            { label: `dans ${timeDelta} heures` },
            { label: `dans ${timeDelta} jours` },
            { label: `dans ${timeDelta} semaines` },
            { label: `dans ${timeDelta} mois` },
            { label: `${timeDelta} days ago` },
            { label: `${timeDelta} weeks ago` },
            { label: `${timeDelta} months ago` },
          ].filter((items) => items.label.toLowerCase().startsWith(context.query));
        }
        
        const relativeDatePast =
          context.query.match(/^il y a (\d+)/i) || context.query.match(/^[-](\d+)/i);
        if (relativeDatePast) {
          const timeDelta = relativeDatePast[1];
          return [
            { label: `il y a ${timeDelta} jours` },
            { label: `il y a ${timeDelta} semaine` },
            { label: `il y a ${timeDelta} mois` },
          ].filter((items) => items.label.toLowerCase().startsWith(context.query));
        }
    
        return [{ label: "Aujourd'hui" }, { label: "Hier" }, { label: "Demain" }].filter(
          (items) => items.label.toLowerCase().startsWith(context.query)
        );
        
    }

    getNoSuggestPreceedingRange():number {
        return 1;
    }
    getNoSuggestPreceedingChars():RegExp {
        return /[`a-zA-Z0-9]/;
    }
}