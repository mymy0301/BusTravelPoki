import { _decorator, AudioSource, Component, Node } from 'cc';
import { ResourceUtils } from '../../Utils/ResourceUtils';
import { MConst } from '../../Const/MConst';
import { SoundsComboBase } from './SoundsComboBase';
const { ccclass, property } = _decorator;

@ccclass('SoundsComboMerge')
export class SoundsComboMerge extends SoundsComboBase {
    constructor() {
        super(MConst.DIR_SOUND_COMBO_USE.MERGE, 4);
    }
}


