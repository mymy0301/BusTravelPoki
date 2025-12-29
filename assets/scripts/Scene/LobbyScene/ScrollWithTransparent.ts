import { _decorator, CCFloat, CCInteger, Component, instantiate, Layout, Node, ScrollView, UIOpacity, UITransform, Vec3, Vec2 } from 'cc';
import { Utils } from '../../Utils/Utils';
import { SoundSys } from '../../Common/SoundSys';
import { GameSoundEffect } from '../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('ScrollWithTransparent')
export class ScrollWithTransparent extends Component {
    @property(Node) nView: Node;
    // @property(Node) itemNode: Node;
    // @property(CCInteger) private numberNodeGen: number = 10;
    @property(Node) nLayoutNode: Node;
    @property(CCInteger) private distanceTopToShow: number = 150;
    @property(CCInteger) private distanceBottomToHide: number = 50;
    @property(CCFloat) scaleShow: number = 0.2;
    @property(CCFloat) scaleWhenReachChoice: number = 1.2;
    @property(CCFloat) scaleHide: number = 0.8;

    private _wPosTop: Vec3;
    private _wPosBottom: Vec3;


    public SetUp(): void {
        // set the default value 
        const wPosView = this.nView.worldPosition.clone();
        const heighView = this.nView.getComponent(UITransform).height;
        this._wPosTop = wPosView.clone().add3f(0, heighView / 2, 0);
        this._wPosBottom = wPosView.clone().add3f(0, -heighView / 2, 0);
    }

    public registerEventListenScroll() {
        this.UpdateVisual();
        this.node.on("scrolling", this.UpdateVisual, this);
    }

    public reverseAllItems() {
        const comLayout = this.nLayoutNode.getComponent(Layout);
        comLayout.updateLayout(true);
        comLayout.enabled = false;

        // set again sibling for them 
        let listItems: Node[] = Array.from(this.nLayoutNode.children).reverse();

        for (let i = 0; i < listItems.length; i++) {
            listItems[i].setSiblingIndex(i);
        }
    }

    public UpdateVisual() {
        // logic in here that check 
        // if loc item is higher than the top node  + 150=> just transparent it and scale to 0.2
        // if loc item is lower than the bottom node => just transparent it and scale to 1.2
        // if loc item is higher than the top node from 150 - 0 top node => transparent with same ratio => scale 0.2 - 1
        // if loc item is higher than the bottom node from 50 - 0 bottom node => transparent with same ratio => scale 1.2 - 1
        // if loc from top to bottom + 50 => scale 1 - 1.2
        const posTop = this._wPosTop.y;
        const posBottom = this._wPosBottom.y;

        this.nLayoutNode.children.forEach((item, index) => {
            const posItem = item.worldPosition.y;
            const comOpa = item.getComponent(UIOpacity);
            if (posItem > posTop + this.distanceTopToShow || posItem < posBottom) {             // Case 1 + 2
                comOpa.opacity = 0;
            } else if (posItem >= posTop && posItem <= posTop + this.distanceTopToShow) {        // case 3
                let ratioOpacity = 1 - ((posItem - posTop) % this.distanceTopToShow / this.distanceTopToShow);
                comOpa.opacity = ratioOpacity * 255;
            } else if (posItem >= posBottom && posItem <= posBottom + this.distanceBottomToHide) {    // case 4
                let ratio = ((posItem - posBottom) % this.distanceBottomToHide / this.distanceBottomToHide);
                comOpa.opacity = ratio * 255;
            } else if (posItem <= posTop && posItem >= posBottom + this.distanceBottomToHide) {                                                        // case 5
                comOpa.opacity = 255;
            } else {
                comOpa.opacity = 0;
            }

            // set scale
            const scaleItem = this.getScale(posItem, posTop + this.distanceTopToShow, posBottom + this.distanceBottomToHide, posBottom);
            if (!scaleItem.equals3f(-1, -1, -1)) {
                item.scale = scaleItem;
            }
            item.setWorldPosition(item.worldPosition);

        })
    }

    private getScale(wPosItem: number, wStartScale: number, wPosReachMaxScale: number, wPosHide: number): Vec3 {
        // 2 case
        // 1 : wPosItem >= wPosReachMaxScale
        let ratio = -1;
        if (wPosItem >= wPosReachMaxScale && wPosItem < wStartScale) {
            const distance = wStartScale - wPosReachMaxScale;
            ratio = (wPosItem - wPosReachMaxScale) % distance / distance;
            const scaleItem = (1 - ratio) * (this.scaleWhenReachChoice - this.scaleShow) + this.scaleShow;
            return new Vec3(scaleItem, scaleItem, scaleItem);
        } else if (wPosItem < wPosReachMaxScale && wPosItem > wPosHide) {
            const distance = wPosReachMaxScale - wPosHide;
            ratio = (wPosItem - wPosHide) % distance / distance;
            const scaleItem = ratio * (this.scaleWhenReachChoice - this.scaleHide) + this.scaleHide;
            return new Vec3(scaleItem, scaleItem, scaleItem);
        } else {
            return new Vec3(-1, -1, -1);
        }
    }

    public getMaxScaleReachChoice() { return new Vec3(this.scaleWhenReachChoice, this.scaleWhenReachChoice, this.scaleWhenReachChoice) }

    public UpdateLayout() {
        // cacul the size of item than decrease the size of layout equal of that
        const firstItem = this.nLayoutNode.children[0];
        const heightItem = firstItem.getComponent(UITransform).contentSize.height;
        const baseSizeLayout = this.nLayoutNode.getComponent(UITransform).contentSize;
        this.nLayoutNode.getComponent(UITransform).setContentSize(baseSizeLayout.width, baseSizeLayout.height - heightItem - this.distanceBottomToHide - this.distanceTopToShow);
        this.UpdateVisual()
    }

    //#region scroll view
    public async ScrollToIndexLevelNow() {
        const comScroll = this.node.getComponent(ScrollView);

        const timeScrollDown = 1;
        comScroll.scrollToPercentVertical(0.15, timeScrollDown);
        await Utils.delay(timeScrollDown * 1000);
    }

    public async ScrollToTheBottom() {
        const comScroll = this.node.getComponent(ScrollView);
        comScroll.scrollToPercentVertical(0);
        this.UpdateVisual();
    }

    public removeLevel(indexLevel: number) {
        const nOldLevel: Node = this.nLayoutNode.children[indexLevel];
        nOldLevel.destroy();
    }

    //#endregion scroll view
}


