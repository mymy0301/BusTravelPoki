import { _decorator, Component, Label, Node } from 'cc';
import { InfoUIBase } from './InfoUIBase';
const { ccclass, property } = _decorator;

@ccclass('InfoLevelProgress')
export class InfoLevelProgress extends InfoUIBase {
    @property(Label) lbTitle: Label;
    @property(Label) lbShadowTitle: Label;

    public SetTitle(content: string) {
        // this.lbTitle.string = this.lbShadowTitle.string = content;
    }
}


