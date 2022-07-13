import { createElement, createContext } from "react";
import { makeObservable, observable, computed, action } from "mobx";
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
		return (key)=>Langs.langData[this.currentLanguage][key];
	}
}
Object.freeze(Langs.langData);

const lang = new Langs();
const LangsContext = createContext({});

const LangsProvider = ({children})=>createElement(
	LangsContext.Provider, 
	{value: lang},
	children
);

export {LangsContext, LangsProvider};
export default Langs;
