import { _decorator, Component, Node } from 'cc';
import { SoundsComboBase } from './SoundsComboBase';
import { MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('SoundComboPass_move_on_car')
export class SoundComboPass_move_on_car extends SoundsComboBase {
    constructor() {
        super(MConst.DIR_SOUND_COMBO_USE.PASS_MOVE_ON_CAR, 3);
    }
}


