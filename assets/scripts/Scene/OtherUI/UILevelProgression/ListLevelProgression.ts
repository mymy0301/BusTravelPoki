import { _decorator, Component, instantiate, Node, Pool, Prefab, SpriteFrame, Vec3 } from 'cc';
import { B_ScrollViewSys, IScrollViewSys } from '../../../Common/UltimateScrollView/B_ScrollViewSys';
import { ItemLevelProgression } from './ItemLevelProgression';
import { STATE_ITEM_LPr, CONFIG_LPr } from './TypeLevelProgress';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect } from '../../../Utils/Types';
import { ReadDataJson } from '../../../ReadDataJson';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ListLevelProgression')
export class ListLevelProgression extends B_ScrollViewSys implements IScrollViewSys {
    @property(Node) nUIReceivePrize: Node;
    @property(Prefab) pfItemPrize: Prefab;
    @property(Node) nTempPrize: Node;
    @property([SpriteFrame]) listSfBgItem: SpriteFrame[] = [];
    @property([SpriteFrame]) listSfLight: SpriteFrame[] = [];
    @property([SpriteFrame]) listSfBgLevel: SpriteFrame[] = [];
    @property([SpriteFrame]) listSfChest: SpriteFrame[] = [];

    private _poolItem: Pool<Node> = null;

    //=======================================
    //#region ScrollView
    protected onLoad(): void {
        super.onLoad();
        this.SetUp_interface(this);
        this._poolItem = new Pool<Node>(() => instantiate(this.pfItemPrize), 0);
    }
    SetUpItemData(nItem: Node, data: any, index: number, cbShowAnchor: CallableFunction, cbHideAnchor: CallableFunction): void {
        const itemCom = nItem.getComponent(ItemLevelProgression);
        itemCom.SetUpData_ItemUltimateSV(data, false, () => { return false }, cbShowAnchor, cbHideAnchor);
        itemCom.SetUpCB(
            this.GetSfBgItem.bind(this),
            this.GetSfLight.bind(this),
            this.GetSfBgLevel.bind(this),
            this.GetSfChest.bind(this),
            this.PlayAnimReceivePrizeNormal.bind(this),
            this.InitPrize.bind(this),
            this.ReUsePrizes.bind(this)
        );
        itemCom.SetUpData(data);
    }
    //#endregion ScrollView
    //=======================================

    //=======================================
    //#region SetUpData
    public async InitData() {
        const isWaitInit = this.IsInitFirstTime;
        // case not init data first
        const dataPrize = DataLevelProgressionSys.Instance.GetAllDataPrizeJson();
        this.SetUp_data(dataPrize.reverse());
        this.InitItemsFirstTime();

        await Utils.WaitReceivingDone(() => this.IsInitFirstTime)
        //scroll to the index right
        const indexPrizeNotReceiveYet = DataLevelProgressionSys.Instance.GetIndexPrizeNotReceiveYet();
        if (indexPrizeNotReceiveYet == -1) {
            // scroll to the progress now
            const progressNow = DataLevelProgressionSys.Instance.GetProgressNow();
            const infoShow = DataLevelProgressionSys.Instance.GetInfoToShowUI(progressNow);
            if (!isWaitInit) {
                this.ScrollToIndex(CONFIG_LPr.MAX_PRIZE_LEVEL_PROGRESSION - infoShow.levelReach - 1, false);
            } else {
                this.ScrollToIndex(CONFIG_LPr.MAX_PRIZE_LEVEL_PROGRESSION - infoShow.levelReach - 1, true, false, 0);
            }
        } else {
            // scroll to that index
            if (!isWaitInit) {
                this.ScrollToIndex(CONFIG_LPr.MAX_PRIZE_LEVEL_PROGRESSION - indexPrizeNotReceiveYet - 1, false);
            } else {
                this.ScrollToIndex(CONFIG_LPr.MAX_PRIZE_LEVEL_PROGRESSION - indexPrizeNotReceiveYet - 1, true, false, 0);
            }
        }
    }
    //#endregion SetUpData
    //=======================================

    //=========================
    //#region cb item
    private async PlayAnimReceivePrizeNormal(listVisualPrize: Node[], listWPos: Vec3[]) {
        const numItem = listVisualPrize.length;
        for (let i = 0; i < numItem; i++) {
            const visualAnim = listVisualPrize[i];
            const wPosAnim = listWPos[i];
            if (i != numItem - 1) {
                AniTweenSys.playAnimPopUpItemUpper(visualAnim, wPosAnim, this.nUIReceivePrize, () => {
                    this.scheduleOnce(() => {
                        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.EFFECT_LEVEL_DONE_LOBBY);
                    }, 0.3);
                });
            } else {
                await AniTweenSys.playAnimPopUpItemUpper(visualAnim, wPosAnim, this.nUIReceivePrize, () => {
                    this.scheduleOnce(() => {
                        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.EFFECT_LEVEL_DONE_LOBBY);
                    }, 0.3);
                });
            }
        }
    }

    private GetSfBgItem(stateItem: STATE_ITEM_LPr): SpriteFrame {
        return this.listSfBgItem[stateItem];
    }

    private GetSfLight(stateItem: STATE_ITEM_LPr): SpriteFrame {
        if (stateItem === STATE_ITEM_LPr.CAN_NOT_CLAIM) { return this.listSfLight[0] }
        else if (stateItem === STATE_ITEM_LPr.WAIT_TO_CLAIM) { return this.listSfLight[1] }
        else if (stateItem === STATE_ITEM_LPr.CLAIMED) { return null; }

    }

    private GetSfBgLevel(stateItem: STATE_ITEM_LPr): SpriteFrame {
        if (stateItem === STATE_ITEM_LPr.CAN_NOT_CLAIM) { return this.listSfBgLevel[0] }
        else if (stateItem === STATE_ITEM_LPr.WAIT_TO_CLAIM || stateItem === STATE_ITEM_LPr.CLAIMED) { return this.listSfBgLevel[1] }
    }

    private GetSfChest() {
        return this.listSfChest[0];
    }
    //#endregion cb item
    //=========================

    //=========================
    //#region pool Item
    private InitPrize(): Node {
        const nPrize = this._poolItem.alloc();
        return nPrize;
    }

    private ReUsePrizes(listNProze: Node[]) {
        this._poolItem.freeArray(listNProze);
    }
    //#endregion pool Item
    //=========================
}


