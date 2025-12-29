import { _decorator, Component, Node } from 'cc';
import { LANGUAGE } from '../Utils/Types';
import * as i18n from 'db://i18n/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('LanguageManager_i18n')
export class LanguageManager_i18n {
    private static _instance: LanguageManager_i18n;
    public static get Instance(): LanguageManager_i18n {
        if (!this._instance) {
            this._instance = new LanguageManager_i18n();
        }
        return this._instance;
    }

    private _languageChoice: LANGUAGE = LANGUAGE.EN;

    /**
     * You can use this func when init game or change the language
     * @param langue 
     */
    public setLanguage(langue: LANGUAGE) {
        //save data
        this._languageChoice = langue;
        // init data
        i18n.init(langue);
        //update data
        i18n.updateSceneRenderers();
    }

    public getTextFromResource(key: string): string {
        return i18n.t(key);
    }
}


