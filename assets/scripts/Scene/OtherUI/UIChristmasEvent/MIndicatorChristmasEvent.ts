import { _decorator, Component, Label, Layout, Node, screen, Size, Sprite, SpriteFrame, Tween, tween, UITransform, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CHRISTMAS_EVENT, PAGE_VIEW_CHRISTMAS_EVENT } from './TypeChristmasEvent';
const { ccclass, property } = _decorator;

@ccclass('MIndicatorChristmasEvent')
export class MIndicatorChristmasEvent extends Component {
    @property(Node) listNBgTab: Node[] = [];
    @property(SpriteFrame) sfTabChoice: SpriteFrame;
    @property(SpriteFrame) sfTabUnChoice: SpriteFrame;

    public SetStart(indexPage: number) {
        this.listNBgTab.forEach((item, index) => {
            item.getComponent(Sprite).spriteFrame = this.sfTabUnChoice;
        })

        this.listNBgTab[indexPage].getComponent(Sprite).spriteFrame = this.sfTabChoice;
    }

    ChangeIndicator(indexNewPage: number, indexOldPage: number, timeScale: number) {
        this.listNBgTab.forEach((item, index) => {
            item.getComponent(Sprite).spriteFrame = this.sfTabUnChoice;
        })
        this.listNBgTab[indexNewPage].getComponent(Sprite).spriteFrame = this.sfTabChoice;
    }

    private OnClickLightRoad() {
        clientEvent.dispatchEvent(EVENT_CHRISTMAS_EVENT.CHANGE_PAGE, PAGE_VIEW_CHRISTMAS_EVENT.LIGHT_ROAD);
    }

    private OnClickHatRace() {
        clientEvent.dispatchEvent(EVENT_CHRISTMAS_EVENT.CHANGE_PAGE, PAGE_VIEW_CHRISTMAS_EVENT.HAT_RACE);
    }
}


