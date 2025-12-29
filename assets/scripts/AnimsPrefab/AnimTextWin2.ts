import { _decorator, Component, Node, UIOpacity } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('AnimTextWin2')
export class AnimTextWin2 extends AnimPrefabsBase {
    private readonly nameAnim = "text_phase2"

    public async PlayAnimTextWin(timeDelayToPlay: number = 0) {
        await Utils.delay(timeDelayToPlay * 1000);
        this.PlayAnim(this.nameAnim);
        this.node.getComponent(UIOpacity).opacity = 255;
    }

    public PrepareAnimTextWin() {
        this.PlayAnim(this.nameAnim, false, this.GetTimeAnimText())
        this.node.getComponent(UIOpacity).opacity = 0;
    }

    public GetTimeAnimText() {
        const timeAnim = this.GetTimeAnim(this.nameAnim);
        return timeAnim;
    }
}


