
import { _decorator, Component, Node, game, TextAsset, Enum, director, resources } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { PlayerData } from '../Utils/PlayerData';
import { MConst } from '../Const/MConst';
import { LANGUAGE } from '../Utils/Types';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = LanguageManager
 * DateTime = Thu Mar 03 2022 18:09:56 GMT+0700 (Indochina Time)
 * Author = tuzkekizer
 * FileBasename = LanguageManager.ts
 * FileBasenameNoExtension = LanguageManager
 * URL = db://assets/scripts/language/LanguageManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('LanguageManager')
export class LanguageManager extends Component {
    public static Instance: LanguageManager;
    languages: LanguageInfo[] = [];
    bInit: boolean = false;
    curLanguageInfo: LanguageInfo;
    onLoad() {
        if (LanguageManager.Instance == null) {
            LanguageManager.Instance = this;
            director.addPersistRootNode(this.node);
        }
    }

    protected onDestroy(): void {
        LanguageManager.Instance = null;
    }
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    async readConfig(filepath: string, c: any) {
        return new Promise((resolve, reject) => {
            type kv = { key: string, value: string; };
            resources.load("configs/" + filepath, TextAsset, (err, conf: TextAsset) => {
                if (err) {
                    reject();
                    return;
                }

                var arr = conf.text.split("\r\n");//sys.os == sys.OS_OSX ? "\n" :
                //console.log(arr);

                var items = [];
                for (var i = 1; i < arr.length; ++i) {
                    if (arr[i] != "") {
                        var datas = arr[i].split(",");
                        if (datas.length > 0) {
                            var item = new c();
                            item["id"] = datas[0];
                            for (var j = 1; j < datas.length; j++) {
                                var value: any = datas[j];
                                item["arrKeys"].push(value);
                            }
                        }
                        items.push(item);
                    }
                }
                resolve(items);
            });
        });
    }
    curLanguage: LANGUAGE = LANGUAGE.EN;

    initLanguage(_initLanguage: LANGUAGE) {
        // console.log("initLanguage: " + _initLanguage);

        this.curLanguage = _initLanguage;
        PlayerData.Instance.setGlobalData_CurrLanguage(_initLanguage);
        this.curLanguageInfo = this.languages.find(element => element.id === _initLanguage);

        clientEvent.dispatchEvent(MConst.EVENT.LANGUAGE_UPDATE);
    }

    async loadConfig() {
        if (this.bInit) return;

        this.languages = await this.readConfig("language", LanguageInfo) as LanguageInfo[];

        // console.log(this.languages);
        this.bInit = true;
        return new Promise((resolve, reject) => {
            //console.log("load Language success");
            let curLanguage: LANGUAGE = PlayerData.Instance.getGlobalData_CurrLanguage();
            // console.log(curLanguage);
            this.curLanguageInfo = this.languages.find(element => element.id === curLanguage);
            // this.testLanguage();
            resolve(null);
        });
    }

    async loadConfig2(callback: CallableFunction) {
        if (this.bInit) return;

        this.languages = await this.readConfig("language", LanguageInfo) as LanguageInfo[];

        // console.log(this.languages);
        this.bInit = true;
        await new Promise((resolve, reject) => {
            //console.log("load Language success");
            let curLanguage: LANGUAGE = PlayerData.Instance.getGlobalData_CurrLanguage();
            // console.log(curLanguage);
            this.curLanguageInfo = this.languages.find(element => element.id === curLanguage);
            // this.testLanguage();
            resolve(null);
        });

        callback();
    }

    getText_byKey(indexKey: number) {
        return this.curLanguageInfo.arrKeys[indexKey];
    }

    testLanguage() {
        // console.log("testLanguagetestLanguagetestLanguage");
        // console.log(this.curLanguageInfo);

        // console.log(this.getText_byKey(ITEM_LANGUAGE_KEY_TYPE.play));
        // console.log(this.getText_byKey(ITEM_LANGUAGE_KEY_TYPE.shop));
        // console.log(this.getText_byKey(ITEM_LANGUAGE_KEY_TYPE.shop));
    }

    getTempLanguageInfo(_tempSelect: LANGUAGE) {
        return this.languages.find(element => element.id === _tempSelect);
    }

    setSelectLanguge(_selectLanguage: LANGUAGE, needSaveData: boolean = true) {
        this.curLanguage = _selectLanguage;
        if (needSaveData)
            PlayerData.Instance.setGlobalData_CurrLanguage(_selectLanguage);
        this.curLanguageInfo = this.languages.find(element => element.id === _selectLanguage);

        clientEvent.dispatchEvent(MConst.EVENT.LANGUAGE_UPDATE);
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */



export class LanguageInfo {
    id: string;
    arrKeys: string[] = [];
}
