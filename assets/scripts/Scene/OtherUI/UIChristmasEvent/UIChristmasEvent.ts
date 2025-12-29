/**
 * 
 * anhngoxitin01
 * Thu Nov 06 2025 15:42:58 GMT+0700 (Indochina Time)
 * UIChristmasEvent
 * db://assets/scripts/Scene/OtherUI/UIChristmasEvent/UIChristmasEvent.ts
*
*/
import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CHRISTMAS_EVENT, IDataUIEventChristmas, IsIDataUIEventChristmas, IsIDataUIEventReceiveHatRaceFromHome, PAGE_VIEW_CHRISTMAS_EVENT } from './TypeChristmasEvent';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { Bezier } from '../../../framework/Bezier';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { STATE_HAT_RACE } from './HatRace/TypeHatRace';
import { PageHatRace_UIChristmasEvent } from './PageHatRace_UIChristmasEvent';
import { PageView_UIChristmasEvent } from './PageView_UIChristmasEvent';
import { PageLightRoad_UIChristmasEvent } from './PageLightRoad_UIChristmasEvent';
import { GameMusicDisplay, instanceOfIUIKeepTutAndReceiveLobby, IUIKeepTutAndReceiveLobby } from '../../../Utils/Types';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { DataLightRoad_christ } from '../../../DataBase/DataLightRoad_christ';
import { SoundSys } from '../../../Common/SoundSys';
const { ccclass, property } = _decorator;

@ccclass('UIChristmasEvent')
export class UIChristmasEvent extends UIBaseSys {
    @property(Node) nBlock: Node;
    @property(Node) nLayoutPrize: Node;
    @property(Node) nPageLR: Node;
    @property(Node) nPageHR: Node;
    @property(PageHatRace_UIChristmasEvent) pageHatRaceChrist: PageHatRace_UIChristmasEvent;
    @property(PageLightRoad_UIChristmasEvent) pageLRChrist: PageLightRoad_UIChristmasEvent;
    @property(PageView_UIChristmasEvent) pvUIChristmasEvents: PageView_UIChristmasEvent;
    @property(Node) nCoin: Node;
    @property(Node) nTicket: Node;

    private _listPrize: Node[] = [];
    //==========================================
    //#region base
    protected onLoad(): void {
        this.pvUIChristmasEvents.RegisterCb(this.CBShowSelf.bind(this), this.CbHideSelf.bind(this), this.CbShowBlock.bind(this), this.CbHideBlock.bind(this));
    }

    protected onEnable() {
        super.onEnable();
        // trigger bật sound christmas
        SoundSys.Instance.playMusic(GameMusicDisplay.MUSIC_BACKGROUND_LOOBY_CHRIST);

        clientEvent.on(EVENT_CHRISTMAS_EVENT.BLOCK_UI, this.ChangeStateBlock, this);
        clientEvent.on(EVENT_CHRISTMAS_EVENT.SHOW_NCOIN_TICKET, this.ShowCoinTicket, this);
        clientEvent.on(EVENT_CHRISTMAS_EVENT.HIDE_NCOIN_TICKET, this.HideCoinTicket, this);
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_CHRISTMAS_EVENT.BLOCK_UI, this.ChangeStateBlock, this);
        clientEvent.off(EVENT_CHRISTMAS_EVENT.SHOW_NCOIN_TICKET, this.ShowCoinTicket, this);
        clientEvent.off(EVENT_CHRISTMAS_EVENT.HIDE_NCOIN_TICKET, this.HideCoinTicket, this);
    }

    public async PrepareDataShow(): Promise<void> {
        // check nếu như có dataCutom là IDataChristmasEvent => thực hiện anim nhận thưởng
        if (this._dataCustom != null && this._dataCustom.length > 0) {
            const dataFromUIWin = this._dataCustom.find(dataAny => IsIDataUIEventChristmas(dataAny))
            if (dataFromUIWin != null) {
                // set layout cho itemPrize
                this._listPrize = dataFromUIWin.nPrizes;
                this._listPrize.forEach(prize => prize.setParent(this.nLayoutPrize, true))
            } else {
                this._listPrize = [];
            }
        } else {
            this._listPrize = [];
        }

        // kiểm tra nếu event đã kết thúc => init event HatRace
        if (DataHatRace_christ.Instance.State == STATE_HAT_RACE.END_EVENT) {
            DataHatRace_christ.Instance.InitNewRound(true, DataLightRoad_christ.Instance.GetTimeEndEvent());
            this.pageHatRaceChrist.TryRegisterTime();
        }

        // kiểm tra để preload UI
        const hasCustomReceivePrizeHatRaceFromPageHome = this._dataCustom != null && this._dataCustom.find(dataAny => IsIDataUIEventReceiveHatRaceFromHome(dataAny)) != null;
        let pageForce: PAGE_VIEW_CHRISTMAS_EVENT = null

        switch (true) {
            case hasCustomReceivePrizeHatRaceFromPageHome != null && hasCustomReceivePrizeHatRaceFromPageHome:
                this.pvUIChristmasEvents.PreloadUI(PAGE_VIEW_CHRISTMAS_EVENT.HAT_RACE);
                pageForce = PAGE_VIEW_CHRISTMAS_EVENT.HAT_RACE;
                break;
            default:
                this.pvUIChristmasEvents.PreloadUI(PAGE_VIEW_CHRISTMAS_EVENT.LIGHT_ROAD);
                pageForce = PAGE_VIEW_CHRISTMAS_EVENT.LIGHT_ROAD;
                break;
        }

        // show tab hợp lý ở đây
        this.pvUIChristmasEvents.ActivePageWhenStart(pageForce);

        // ẩn coin và ticket
        this.HideCoinTicket();
    }

    public async UIShowDone(): Promise<void> {
        // kiểm tra xem có list prize ko? nếu có => chạy anim
        if (this._listPrize.length > 0) {
            try {
                let allAnim: Promise<void>[] = [];
                this.nBlock.active = true;
                const timeMove = 1;

                // đối tượng đầu tiên chắc chắn sẽ là lightBulb , hatRace
                const nLightBulb = this._listPrize[0];
                const sWPosLB = nLightBulb.worldPosition.clone();
                const eWPosLB = this.pageLRChrist.nIcBulbEndAnim.worldPosition.clone();
                const mWPosLB = new Vec3(eWPosLB.x, sWPosLB.y, 0);
                let listVecMoveLB = Bezier.GetListPointsToTween3(10, sWPosLB, mWPosLB, eWPosLB);
                allAnim.push(AniTweenSys.TweenToListVec3_8(nLightBulb, listVecMoveLB, timeMove, Vec3.ONE, Vec3.ONE.clone().multiplyScalar(0.2)));


                const nHatRace = this._listPrize[1];
                if (this._listPrize[1] != null) {
                    const sWPosHR = nHatRace.worldPosition.clone();
                    const eWPosHR = this.nPageHR.worldPosition.clone();
                    const mWPosHR = new Vec3(eWPosHR.x, sWPosHR.y, 0);
                    let listVecMoveHR = Bezier.GetListPointsToTween3(10, sWPosHR, mWPosHR, eWPosHR);
                    allAnim.push(AniTweenSys.TweenToListVec3_8(nHatRace, listVecMoveHR, timeMove, Vec3.ONE, Vec3.ONE.clone().multiplyScalar(0.2)));
                }


                // =========== play anim
                await Promise.all(allAnim);
                if (nLightBulb != null) nLightBulb.destroy();
                if (nHatRace != null) nHatRace.destroy();

                this._listPrize = [];

                this.nBlock.active = false;
                await this.pageLRChrist.PlayAnimReceiveNewLight();
            } catch (e) {
                console.error(e);
            }
        }
    }

    public async UICloseDone(): Promise<void> {
        // emit keep continue tut
        if (this._dataCustom != null) {
            const dataKeepTutAndReceive: IUIKeepTutAndReceiveLobby = this._dataCustom.find(data => instanceOfIUIKeepTutAndReceiveLobby(data));
            if (dataKeepTutAndReceive != null && dataKeepTutAndReceive.canKeepTutAndReceiveLobby) {
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            }
        }
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
        SoundSys.Instance.playMusic(GameMusicDisplay.MUSIC_BACKGROUND_LOOBY);
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private ChangeStateBlock(newState: boolean) {
        this.nBlock.active = newState;
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region callback
    private CbHideSelf() {
        const timeOpa = 0.2;
        tween(this.node.getComponent(UIOpacity))
            .to(timeOpa, { opacity: 0 })
            .call(() => {
                this.node.active = false;
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            })
            .start();
    }
    private CBShowSelf() {
        this.node.active = true;
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        const timeOpa = 0.2;
        tween(this.node.getComponent(UIOpacity))
            .to(timeOpa, { opacity: 255 })
            .call(() => { clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY); })
            .start();
    }

    private CbShowBlock() { this.nBlock.active = true; }
    private CbHideBlock() { this.nBlock.active = false; }

    private ShowCoinTicket() {
        const timeShow: number = 0.5;
        tween(this.nCoin.getComponent(UIOpacity))
            .to(timeShow, { opacity: 255 })
            .start();
        tween(this.nTicket.getComponent(UIOpacity))
            .to(timeShow, { opacity: 255 })
            .start();
    }

    private HideCoinTicket() {
        const timeHide: number = 0.5;
        tween(this.nCoin.getComponent(UIOpacity))
            .to(timeHide, { opacity: 0 })
            .start();
        tween(this.nTicket.getComponent(UIOpacity))
            .to(timeHide, { opacity: 0 })
            .start();
    }
    //#endregion callback
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIChristmasEvent");
        // check which scene display
        const sceneDisplay = ChangeSceneSys.Instance.GetTypeSceneUsing();
        switch (sceneDisplay) {
            case TYPE_SCENE_USING.GAME:
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
                ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.LOBBY);
                break;
            case TYPE_SCENE_USING.LOBBY:
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_CHRISTMAS_EVENT, 1);
                break;
        }
    }
    //#endregion btn
    //==========================================
}