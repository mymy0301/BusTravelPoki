import { _decorator, Component, Node, randomRange, randomRangeInt } from 'cc';
import { B_ScrollViewSys, IScrollAnchor, IScrollAnim, IScrollViewSys, paramAnimScroll_1, TYPE_ANIM_SCROLL_SPECIAL } from 'db://assets/scripts/Common/UltimateScrollView/B_ScrollViewSys';
import { ItemBotHR } from './ItemBotHR';
import { InfoBot_HatRace } from './TypeHatRace';
import { MConfigFacebook } from 'db://assets/scripts/Configs/MConfigFacebook';
import { GetTimeScrollFromXToY } from 'db://assets/scripts/Common/UltimateScrollView/Type_B_ScrollViewSys';
import { DataHatRace_christ } from 'db://assets/scripts/DataBase/DataHatRace_christ';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UIHRListBot')
export class UIHRListBot extends B_ScrollViewSys implements IScrollViewSys, IScrollAnchor, IScrollAnim {

    private _indexPlayer: number = -1;

    //=======================================
    //#region ScrollView
    protected onLoad(): void {
        super.onLoad();
        this.SetUp_interface(this, this, this);
    }

    // protected onEnable(): void {
    //     super.onEnable();
    //     if (!this.IsInitFirstTime) {
    //         this.UpdateDataAnchor();
    //     }
    // }

    SetUpItemData(nItem: Node, data: any, index: number, cbShowAnchor: CallableFunction, cbHideAnchor: CallableFunction, isUseAnim: boolean = true): void {
        nItem.getComponent(ItemBotHR).SetUpData_ItemUltimateSV(data, false, this.CheckIsPlayer, cbShowAnchor, cbHideAnchor);
        nItem.getComponent(ItemBotHR).SetUp(data, isUseAnim);
    }

    SetAnchorData(nAnchor: Node, dataAll: any): void {
        // hide the anchor if not found player
        if (this._indexPlayer == -1) {
            nAnchor.active = false;
            return;
        }
        // show anchor if found player
        const dataCheck = dataAll[this._indexPlayer];

        nAnchor.getComponent(ItemBotHR).SetUpData_ItemUltimateSV(dataCheck, true, this.CheckIsPlayer, null, null);
        nAnchor.getComponent(ItemBotHR).SetUp(dataCheck);
    }
    GetIndexDataAnchor(dataShowing: any): number {
        if (this._indexPlayer < 0) { return -1; }

        // check in data has player show
        const dataCheck = dataShowing as InfoBot_HatRace[];
        let indexPlayer = dataCheck.findIndex(obj => obj.id == MConfigFacebook.Instance.playerID);
        return indexPlayer;
    }

    UpdateItemWhileScroll(nItemFake: Node, dataFake: any, dataReal: any, ratio: number): void {
        const newRank = Math.floor(dataFake.rank + (dataReal.rank - dataFake.rank) * ratio) + 1;
        nItemFake.getComponent(ItemBotHR).SetRank(newRank);
    }
    ScrollAnimDone(): void {
        // throw new Error('Method not implemented.');
    }
    //#endregion ScrollView
    //=======================================


    //=======================================
    //#region self
    private CheckIsPlayer(info: InfoBot_HatRace): boolean {
        if (info == null) return false;
        return info.id == MConfigFacebook.Instance.playerID;
    }

    public async ScrollToPlayer() {
        // scroll to player
        const timeScroll = GetTimeScrollFromXToY(this.GetMiddleVisibleIndex(), DataHatRace_christ.Instance.GetRankPlayerNow());
        const indexMid = this.GetIndexScrollToMidder(DataHatRace_christ.Instance.GetRankPlayerNow());
        this.ScrollToIndex(indexMid, false, true, timeScroll);
        await Utils.delay(timeScroll);
    }
    //#endregion self
    //=======================================

    //=======================================
    //#region SetUpData
    public InitData() {
        const dataBot = DataHatRace_christ.Instance.GetListBotBeforeAnimUI();
        this._indexPlayer = dataBot.findIndex(bot => bot.id == MConfigFacebook.Instance.playerID);
        if (!this.IsInitFirstTime) {
            this.SetUp_data(dataBot);
            this.InitItemsFirstTime(DataHatRace_christ.Instance.GetRankPlayerNow());
        } else {
            this.UpdateData(dataBot);
            this.ScrollToPlayer();
        }
    }
    //#endregion SetUpData
    //=======================================

    public async AnimScroll(progressOld: number): Promise<boolean> {
        if (progressOld == -1) { this.SetCanShowAnchor(true); return false; }

        const dataNow = this.GetData;
        let dataFake = this.GetData;
        const indexPlayer = dataFake.findIndex(bot => bot.id == MConfigFacebook.Instance.playerID);
        let indexFake = dataFake.findIndex((bot: InfoBot_HatRace) => bot.progress <= progressOld && bot.id != MConfigFacebook.Instance.playerID);
        if (indexFake == -1) { indexFake = dataFake.length - 1; }
        else { indexFake -= 1; }
        // console.log("F", indexFake, "|R", indexPlayer, progressOld);
        // indexFake = indexFake == -1 ? dataFake.length - 1 : indexFake;

        // trong trường hợp rank ko đổi thì chỉ update như bình thường
        if (indexFake < 0 || indexFake == indexPlayer) { this.SetCanShowAnchor(true); return false; }
        // let indexFake = indexPlayer + 5;
        // swap 2 dữ liệu cho nhau
        let dataPlayer = dataFake.splice(indexPlayer, 1)[0];
        dataFake.splice(indexFake, 0, dataPlayer);
        dataFake.forEach((item, index) => {
            item.rank = index;
        });
        const dataFakeItem = dataFake[indexFake];
        this.UpdateData(dataFake, false);

        let dataCustom: paramAnimScroll_1 = {
            dataOld: dataFake,
            dataReal: dataNow,
            indexItemReal: indexPlayer,
            indexItemOld: indexFake,
            dataItemOld: dataFakeItem,
            dataItemReal: dataNow[indexPlayer]
        }
        // console.log(indexPlayer, indexFake);
        await this.PlayAnimSpecial(TYPE_ANIM_SCROLL_SPECIAL.SPE_1, dataCustom);

        return true;
    }

    public async Test() {
        const dataNow = this.GetData;
        let dataFake = this.GetData;
        let indexPlayer = dataFake.findIndex(bot => bot.id == MConfigFacebook.Instance.playerID);
        let indexFake = randomRangeInt(indexPlayer, dataFake.length - 1);
        // let indexFake = indexPlayer + 5;
        // swap 2 dữ liệu cho nhau
        let dataPlayer = dataFake.splice(indexPlayer, 1)[0];
        dataFake.splice(indexFake, 0, dataPlayer);
        dataFake.forEach((item, index) => {
            item.rank = index;
        });
        const dataFakeItem = dataFake[indexFake];
        this.UpdateData(dataFake, false);


        let dataCustom: paramAnimScroll_1 = {
            dataOld: dataFake,
            dataReal: dataNow,
            indexItemReal: indexPlayer,
            indexItemOld: indexFake,
            dataItemOld: dataFakeItem,
            dataItemReal: dataNow[indexPlayer]
        }
        console.log(indexPlayer, indexFake);
        this.PlayAnimSpecial(TYPE_ANIM_SCROLL_SPECIAL.SPE_1, dataCustom);
    }
}


