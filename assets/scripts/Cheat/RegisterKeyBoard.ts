/**
 * 
 * dinhquangvinhdev
 * Mon Sep 15 2025 14:56:53 GMT+0700 (Indochina Time)
 * RegisterKeyBoard
 * db://assets/scripts/Cheat/RegisterKeyBoard.ts
*
*/
import { _decorator, Component, EventKeyboard, input, Input, KeyCode, misc, Node } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('RegisterKeyBoard')
export class RegisterKeyBoard {
    public static Instance: RegisterKeyBoard = null;
    private _listKeyRegister: Map<KeyCode, CallableFunction> = new Map();

    constructor() {
        if (RegisterKeyBoard.Instance == null) {
            RegisterKeyBoard.Instance = this;
            input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        }
    }

    private onKeyUp(event: EventKeyboard) {
        // console.log(event.keyCode);
        // console.log(this._listKeyRegister);

        const dataAction = this._listKeyRegister.get(event.keyCode);
        if (dataAction != null) {
            dataAction();
        }
    }

    public RegisterClick(inputEventKey: KeyCode, cb: CallableFunction) {
        // console.log("register click");
        if (this._listKeyRegister.get(inputEventKey) == null) {
            this._listKeyRegister.set(inputEventKey, cb);
        }
    }

    public UnRegisterClick(inputEventKey: KeyCode) {
        // console.log("unRegister click");
        const dataInBlackBoard = this._listKeyRegister.get(inputEventKey);
        if (dataInBlackBoard != null) {
            this._listKeyRegister.set(inputEventKey, null);
        }
    }

    public RegisterForCheat() {
        // show cheat event
        this.RegisterClick(KeyCode.DIGIT_1, () => {
            clientEvent.dispatchEvent(MConst.EVENT_CHEAT.SHOW_UI_CHEAT_EVENTS);
        })

        // show cheat building
        this.RegisterClick(KeyCode.DIGIT_2, () => {
            clientEvent.dispatchEvent(MConst.EVENT_CHEAT.SHOW_UI_CHEAT_BUILDING);
        })

        // show cheat loginfo
        this.RegisterClick(KeyCode.DIGIT_3, () => {
            clientEvent.dispatchEvent(MConst.EVENT_CHEAT.SHOW_UI_CHEAT_INFO);
        })
    }
}