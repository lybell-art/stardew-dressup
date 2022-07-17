import { createElement, createContext } from "react";
import { makeObservable, observable, computed, action } from "mobx";
import { parseStyledText } from "./langs/StyledTextParser.js";
import i18n_en from "../i18n/default.json";
import i18n_ko from "../i18n/ko-KR.json";

class Langs
{
	static langData = {
		en:i18n_en,
		ko:i18n_ko
	};
	static getAllLanguageList()
	{
		return Object.keys(this.langData);
	}

	currentLanguage = "en";

	constructor()
	{
		makeObservable(this, {
			currentLanguage: observable,
			changeLanguage: action,
			getText: computed
		});
	}
	changeLanguage(lang)
	{
		this.currentLanguage = lang;
	}
	get getText()
	{
		return (key)=>{
			let langDict = Langs.langData[this.currentLanguage]
			if(langDict === undefined || langDict[key] === undefined) langDict = Langs.langData.en;
			
			if(langDict[key] === undefined) return key;
			return langDict[key];
		}
	}
	get getTextHTML()
	{
		return (key)=>{
			const rawText = this.getText(key);
			const result = parseStyledText(rawText);
			return result;
		}
	}
}
Object.freeze(Langs.langData);

const lang = new Langs();
const getText = lang.getText.bind(lang);
const LangsContext = createContext({});

const LangsProvider = ({children})=>createElement(
	LangsContext.Provider, 
	{value: lang},
	children
);

export {LangsContext, LangsProvider, getText};
export default Langs;
