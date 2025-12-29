import { _decorator, Component, instantiate, Node, Prefab, Rect, ScrollView, Sprite, SpriteFrame, UITransform, Widget, path, Layout, Vec3, UIOpacity, tween, Vec2, Size } from 'cc';
import { Utils } from '../../../Utils/Utils';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect, InfoPrizePass } from '../../../Utils/Types';
import { ItemPrizeLevelPass, STATE_ITEM_PRIZE_LEVEL_PASS } from './ItemPrizeLevelPass';
import { ItemScrollViewBase } from '../../../Common/ItemScrollViewBase';
import { DataLevelPassSys } from '../../../DataBase/DataLevelPassSys';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
const { ccclass, property } = _decorator;

@ccclass('ListPrizeLevelPass')
export class ListPrizeLevelPass extends Component {
    @property({ group: 'ScrollView', type: Node }) contentSV: Node;
    @property({ group: 'ScrollView', type: Node }) viewSV: Node;
    @property({ group: 'ScrollView', type: ScrollView }) scrollView: ScrollView;
    @property({ group: 'ScrollView', type: Prefab }) itemPrefab: Prefab;
    @property({ group: 'ScrollView', type: Node }) nUIReceivePrize: Node;
    @property({ group: 'ScrollView' }) typeScrollViewVertical: Boolean = true;

    @property(Prefab) itemPrize: Prefab;
    // @property(Prefab) itemLastPrefab: Prefab;
    @property(SpriteFrame) sfChestFree: SpriteFrame;
    @property([SpriteFrame]) listSfChestPremium: SpriteFrame[] = [];
    @property(SpriteFrame) sfBgLvLock: SpriteFrame;
    @property(SpriteFrame) sfBgLvUnlock: SpriteFrame;
    @property(SpriteFrame) sfBgLvIndex0: SpriteFrame;
    // @property(Node) nPrizeSpecial: Node;

    private _listItemPrize: Node[] = [];
    private _info: InfoPrizePass[] = [];
    private _sizeItem: Size = null;

    public async SetUp(data: InfoPrizePass[]) {
        if (this._info.length > 0) {
            // you must return the base State to this
            this.scrollView.scrollToTop();
            this.OptimizeScrollView();
            return;
        } else {
            // set up new Data
            this._info = Array.from(data);
            this.contentSV.getComponent(Layout).enabled = true;
            await this.InitItem(this._info);
            this.scrollView.node.on("scrolling", this.OptimizeScrollView, this);
            this.contentSV.getComponent(Layout).updateLayout(true);
            this.OptimizeScrollView();
            this.contentSV.getComponent(Layout).enabled = false;
        }

        // this.UpdateLocLockPrize();
    }

    private async InitItem(info: InfoPrizePass[]) {
        for (let i = 0; i < info.length; i++) {
            let item = instantiate(this.itemPrefab);
            item.parent = this.contentSV;
            if (i == 0) {
                this._sizeItem = item.getComponent(UITransform).contentSize.clone();
            }
            this._listItemPrize.push(item);
            await this.SetItem(item, info[i], i);
        }
        // // init last item
        // let lastItem = instantiate(this.itemLastPrefab);
        // lastItem.parent = this.contentSV;
        // lastItem.getComponent(ItemPrizeLevelPassLast).SetUp(DataTilePassSys.Instance.GetLastPrize());
    }

    private async SetItem(item: Node, info: InfoPrizePass, index: number) {
        const itemCom = item.getComponent(ItemPrizeLevelPass);
        itemCom.SetUpCallbackReceivePrizeNormal(this.PlayAnimReceivePrizeNormal.bind(this));
        if (info.index == 0) {
            // await itemCom.SetUpUIIndex0(info, this.itemPrize, this.sfBgLvLock, this.sfBgLvUnlock, this.sfBgLvIndex0);
            itemCom.SetBgLevelIndex0(this.sfBgLvIndex0);
            itemCom.SetProgressIndex0();
            await itemCom.SetUpUINormal(info, this.itemPrize, this.sfBgLvLock, this.sfBgLvUnlock);
        } else if (info.index == 4 || info.index == 9 || info.index == 19 || info.index == 29) {
            await itemCom.SetUpUIChest(info, this.itemPrize, this.sfChestFree, this.listSfChestPremium, this.sfBgLvLock, this.sfBgLvUnlock);
        } else {
            await itemCom.SetUpUINormal(info, this.itemPrize, this.sfBgLvLock, this.sfBgLvUnlock);
        }
    }

    public OptimizeScrollView() {
        let view = this.viewSV.getComponent(UITransform);
        var viewRect;
        if (this.typeScrollViewVertical) {
            // vertical
            viewRect = new Rect(- view.width / 2, -this.contentSV.position.y - view.height / 2, view.width, view.height);
        } else {
            viewRect = new Rect(- this.contentSV.position.x - view.width / 2, - view.height / 2, view.width, view.height);
        }

        this.MCustomOptimizeScrollView(viewRect);
    }

    /**
     * if you want add anchor view you can modify this func to show anchor view
     * @param viewRect 
     */
    MCustomOptimizeScrollView(viewRect: Rect): void {
        for (let i = 0; i < this.contentSV.children.length; i++) {
            const node = this.contentSV.children[i];
            if (!node.active) { continue; }
            const itemScrollViewBase = node.getComponent(ItemScrollViewBase);
            if (itemScrollViewBase == null) { continue; }
            if (viewRect.intersects(node.getComponent(UITransform).getBoundingBox())) {
                itemScrollViewBase.Show();
            }
            else {
                itemScrollViewBase.Hide();
            }
        }
    }

    /**
     * 
     * @param index 
     * @param time 
     * @param out return isScrollToTop
     */
    protected async scrollToIndex(index: number, time: number = 0, out?: (isScrollToTop: boolean) => void) {
        const posItem: Vec3 = this.getPosByIndex(index).clone().multiplyScalar(-1);

        let offSetMoveTo = 0;

        if (this.typeScrollViewVertical) {
            // case vertical
            const halfHeightView = this.viewSV.getComponent(UITransform).height / 2.0;
            offSetMoveTo = posItem.y - halfHeightView;
        } else {
            // case horizontal
            const halfWidthView = this.viewSV.getComponent(UITransform).width / 2.0;
            offSetMoveTo = posItem.x - halfWidthView;
        }

        // MConsolLog.Log("posItem : " + posItem + " | offsetMoveTo: " + offSetMoveTo);

        if (offSetMoveTo <= 0) {
            if (this.typeScrollViewVertical) { this.scrollView.scrollToTop(time); }
            else { this.scrollView.scrollToLeft(time); }

            if (out != null) { out(true); }
        } else {
            if (this.typeScrollViewVertical) { this.scrollView.scrollToOffset(new Vec2(0, offSetMoveTo), time); }
            else { this.scrollView.scrollToOffset(new Vec2(offSetMoveTo, 0), time); }

            if (out != null) { out(false); }
        }

        await Utils.delay(time * 1000);
    }

    getPosByIndex(_index: number): Vec3 {
        let result: Vec3 = Vec3.ZERO;
        // (this._sizeItem.height + spacingY) - paddingTop;
        let posY: number = -this._sizeItem.height / 2 - _index * (this._sizeItem.height + 0) - 0;
        result = new Vec3(0, posY, 0);

        // MConsolLog.Log(result);
        return result;
    }

    public async ScrollToTheFirstItemWasUnlock(isFirstInit: boolean = false) {
        /**
         * FIND the first item can receive
         * SCROLL to the item
         */

        // loop each item of the content 
        // check if item can receive free or premium => scroll to the item
        let indexFItemCanReceive = -1;
        let indexLevelUnlockNow = this.contentSV.children.length - 1;
        for (let i = 0; i < this.contentSV.children.length; i++) {
            const itemCom = this.contentSV.children[i].getComponent(ItemPrizeLevelPass);
            // const itemComLast = this.contentSV.children[i].getComponent(ItemPrizeTilePassLast);
            if (itemCom != null && itemCom.CanReceivePrizeFreeOrPremium()) {
                indexFItemCanReceive = i;
                break;
            }
            if (itemCom != null && itemCom.GetStateFree() == STATE_ITEM_PRIZE_LEVEL_PASS.CAN_NOT_CLAIM && indexLevelUnlockNow > i) {
                indexLevelUnlockNow = i;
            }
            // else if (itemComLast != null && itemComLast.CanReceivePrize()) {
            //     indexFItemCanReceive = i;
            //     break;
            // }
        }

        // scroll to the index of item
        if (indexFItemCanReceive != -1) {
            let progressPlayer = indexFItemCanReceive + 1;
            if (isFirstInit) {
                await this.scrollToIndex(progressPlayer, 2);
            } else {
                this.scrollToIndex(progressPlayer, 0);
            }
            this.OptimizeScrollView();
        }
        // scroll đến item tiếp theo có thể được unlock 
        else {
            let progressPlayer = indexLevelUnlockNow + 0.5;
            if (isFirstInit) {
                await this.scrollToIndex(progressPlayer, 2);
            } else {
                this.scrollToIndex(progressPlayer, 0);
            }
            this.OptimizeScrollView();
        }

    }

    public GetListNItemPrize() { return this._listItemPrize; }

    //#region custom for self
    public async unlockAllItemPremium() {
        // check the level of player is reach 
        const levelPlayerNow = DataLevelPassSys.Instance.GetLevelNow().level;

        let listPromise = [];

        for (let i = 0; i < this.contentSV.children.length; i++) {
            const itemCom = this.contentSV.children[i].getComponent(ItemPrizeLevelPass);
            if (itemCom != null) {
                listPromise.push(itemCom.unlockLevelPassPremium(levelPlayerNow));
            }
        }

        await Promise.all(listPromise);
    }

    private async PlayAnimReceivePrizeNormal(visualPrize: Node, wPos: Vec3) {
        await AniTweenSys.playAnimPopUpItemUpper(visualPrize, wPos, this.nUIReceivePrize, () => {
            this.scheduleOnce(() => {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.EFFECT_LEVEL_DONE_LOBBY);
            }, 0.3);
        });
    }

    // private UpdateLocLockPrize() {
    //     // case player unlock the last item => nLockItem = false
    //     // case player unlock until item => find the item index + 1 => loc = height /2

    //     // if (DataLevelPassSys.Instance.CanClaimLastPrize()) {
    //     //     this._nLockPrize.active = false;
    //     //     this._nLockPrize.setParent(this.viewSV);
    //     // } else {

    //     this._nLockPrize.setParent(this.contentSV, false);
    //     // get index level Reach
    //     let levelReach = DataLevelPassSys.Instance.GetLevelNow().level;
    //     let item = this.contentSV.children[levelReach + 1];
    //     let halfHeight = item.getComponent(UITransform).height / 2;
    //     this._nLockPrize.worldPosition = item.worldPosition.clone().add3f(0, halfHeight, 0);
    //     this._nLockPrize.active = true;
    //     // }
    // }
    //#endregion
}


