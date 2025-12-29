/**
 * 
 * anhngoxitin01
 * Tue Nov 25 2025 15:43:06 GMT+0700 (Indochina Time)
 * StupidCode
 * db://assets/scripts/Cheat/StupidCode.ts
*
*/
import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('StupidCode')
export class StupidCode extends Component {
    protected onEnable(): void {
        // gọi reload lại trang
        window.location.reload();
        PlayerData.Instance.ResetData();
    }
}