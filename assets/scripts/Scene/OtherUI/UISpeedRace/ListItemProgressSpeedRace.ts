import { _decorator, Component, Node, SpriteFrame, Vec3 } from 'cc';
import { B_ScrollViewSys, IScrollAnchor, IScrollViewSys } from '../../../Common/UltimateScrollView/B_ScrollViewSys';
import { ItemUIInfoProgressSR } from './ItemUIInfoProgressSR';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
const { ccclass, property } = _decorator;

@ccclass('ListItemProgressSpeedRace')
export class ListItemProgressSpeedRace extends B_ScrollViewSys implements IScrollViewSys {

    @property(Node) nUIReceivePrize: Node;
    @property(SpriteFrame) sfItemPrize: SpriteFrame[] = [];

    //=======================================
    //#region ScrollView
    protected onLoad(): void {
        super.onLoad();
        this.SetUp_interface(this);
    }
    SetUpItemData(nItem: Node, data: any, index: number, cbShowAnchor: CallableFunction, cbHideAnchor: CallableFunction, isUseAnim: boolean): void {
        const itemCom = nItem.getComponent(ItemUIInfoProgressSR);
        itemCom.SetUpData_ItemUltimateSV(data, false, () => { return false }, cbShowAnchor, cbHideAnchor);
        itemCom.RegisterCb(this.GetSFItem.bind(this), this.PlayAnimReceivePrizeNormal.bind(this));
        itemCom.SetUp(data);
    }
    //#endregion ScrollView
    //=======================================

    //=======================================
    //#region SetUpData
    public InitData() {
        const dataPrize = DataSpeedRace.Instance.GetAllPrizeProgress();
        this.SetUp_data(dataPrize);
        this.InitItemsFirstTime();
    }

    public UpdateAllItems() {
        if (this.IsInitFirstTime) {
            const listItemShowing: Node[] = this.GetListNItemShowing();
            listItemShowing.forEach(item => item.getComponent(ItemUIInfoProgressSR).TryReUpdateData());
        }
    }
    //#endregion SetUpData
    //=======================================

    //=========================
    //#region cb item
    private async PlayAnimReceivePrizeNormal(visualPrize: Node, wPos: Vec3) {
        await AniTweenSys.playAnimPopUpItemUpper(visualPrize, wPos, this.nUIReceivePrize, () => {
            this.scheduleOnce(() => {
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.EFFECT_LEVEL_DONE_LOBBY);
            }, 0.3);
        });
    }

    private GetSFItem(typePrize: TYPE_PRIZE, typeReceive: TYPE_RECEIVE) {
        return this.sfItemPrize[typePrize];
    }
    //#endregion cb item
    //=========================
}


