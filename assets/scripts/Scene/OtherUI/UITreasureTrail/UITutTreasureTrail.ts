/**
 * 
 * anhngoxitin01
 * Tue Aug 19 2025 17:47:19 GMT+0700 (Indochina Time)
 * UITutTreasureTrail
 * db://assets/scripts/Scene/OtherUI/UITreasureTrail/UITutTreasureTrail.ts
*
*/
import { _decorator, CCFloat, CCInteger, Component, Node, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { Utils } from '../../../Utils/Utils';
import { CONFIG_TT, InfoTut } from './TypeTreasureTrail';
import { NotiTT } from './NotiTT';
const { ccclass, property } = _decorator;



@ccclass('UITutTreasureTrail')
export class UITutTreasureTrail extends Component {
    @property(Node) nListPlayer: Node;
    @property(Node) nPlarformTemplate: Node;
    @property(Node) nPrize: Node;
    @property(UIOpacity) opaBlack: UIOpacity;
    @property(Node) nTapToContinue: Node;
    @property(Node) nItemFocus: Node;
    @property([InfoTut]) listInfoTut: InfoTut[] = [];
    @property(NotiTT) nTut: NotiTT;
    @property(SpriteFrame) listSFNoti: SpriteFrame[] = [];

    private _isWaitToContinue: boolean = false;
    private readonly TIME_DELAY_NEXT_STEP = 0.1;
    private readonly TIME_DELAY_SHOW_UI = 0.5;

    //==========================================
    //#region base
    protected onLoad(): void {
        // this.opaBlack.opacity = 0;
        // this.node.active = false;
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private ResetTut() {
        this._isWaitToContinue = false;
        this.nTapToContinue.active = false;

        this.nTut.Hide();
    }

    private ShowTut(step: number) {
        const infoTut: InfoTut = this.listInfoTut[step];
        this.nTut.Hide();
        this.nTut.SetUp(this.listSFNoti[infoTut.typeImg], CONFIG_TT.TUT[step], infoTut)
        this.nTut.ShowAnim();
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public async PlayeSeriTut() {
        this.ResetTut();

        // show UI
        this.node.active = true;
        tween(this.opaBlack)
            .to(this.TIME_DELAY_SHOW_UI, { opacity: 255 })
            .start();

        // =============== step 1 =================
        // set the nListBotTo this.node than set it back with right siblingIndex
        const oldSiblingIndex_nListBot = this.nListPlayer.getSiblingIndex();
        const oldParent_nListBot = this.nListPlayer.parent;
        this.nListPlayer.setParent(this.nItemFocus);
        this.ShowTut(0);

        await Utils.delay(this.TIME_DELAY_SHOW_UI * 1000);

        this._isWaitToContinue = true;
        this.nTapToContinue.active = true;

        await Utils.WaitReceivingDone(() => !this._isWaitToContinue);

        // set back
        this.nListPlayer.setParent(oldParent_nListBot);
        this.nListPlayer.setSiblingIndex(oldSiblingIndex_nListBot);

        //================= step 2 =================
        // set the platform to this node than set it back with right siblingIndex
        const oldSiblingIndex_nPlatform = this.nPlarformTemplate.getSiblingIndex();
        const oldParent_nPlatform = this.nPlarformTemplate.parent;
        this.nPlarformTemplate.setParent(this.nItemFocus);
        this.ShowTut(1);

        await Utils.delay(this.TIME_DELAY_NEXT_STEP * 1000);

        this._isWaitToContinue = true;
        this.nTapToContinue.active = true;

        await Utils.WaitReceivingDone(() => !this._isWaitToContinue);

        // set back
        this.nPlarformTemplate.setParent(oldParent_nPlatform);
        this.nPlarformTemplate.setSiblingIndex(oldSiblingIndex_nPlatform);

        //================= step 3 =================
        // set the prize to this node than set it back with right siblingIndex
        const oldSiblingIndex_nPrize = this.nPrize.getSiblingIndex();
        const oldParent_nPrize = this.nPrize.parent;
        this.nPrize.setParent(this.nItemFocus);
        this.ShowTut(2);

        await Utils.delay(this.TIME_DELAY_NEXT_STEP * 1000);

        this._isWaitToContinue = true;
        this.nTapToContinue.active = true;

        await Utils.WaitReceivingDone(() => !this._isWaitToContinue);

        // set back
        this.nPrize.setParent(oldParent_nPrize);
        this.nPrize.setSiblingIndex(oldSiblingIndex_nPrize);


        //==============================================
        // hide UI
        this.opaBlack.opacity = 0;
        this.node.active = false;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    private OnBtnTapToContinue() {
        this._isWaitToContinue = false;
        this.nTapToContinue.active = false;
    }
    //#endregion btn
    //==========================================
}