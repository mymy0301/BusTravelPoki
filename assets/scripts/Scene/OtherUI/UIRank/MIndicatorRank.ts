import { _decorator, Component, Label, Layout, Node, screen, Size, Sprite, SpriteFrame, Tween, tween, UITransform, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_RANK_CHANGE_PAGE, PAGE_VIEW_RANK } from './TypeRank';
const { ccclass, property } = _decorator;

@ccclass('MIndicatorRank')
export class MIndicatorRank extends Component {
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

    private OnClickGlobal() {
        clientEvent.dispatchEvent(EVENT_RANK_CHANGE_PAGE, PAGE_VIEW_RANK.GLOBAL);
    }

    private OnClickWeekly() {
        clientEvent.dispatchEvent(EVENT_RANK_CHANGE_PAGE, PAGE_VIEW_RANK.WEEKLY);
    }

    private OnClickFriend() {
        clientEvent.dispatchEvent(EVENT_RANK_CHANGE_PAGE, PAGE_VIEW_RANK.FRIEND);
    }
}


