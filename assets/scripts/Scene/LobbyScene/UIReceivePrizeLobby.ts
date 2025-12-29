import { _decorator, Component, Enum, instantiate, Node, Prefab, SpriteFrame, Vec3 } from 'cc';
import { GameSoundEffect, IPrize, TYPE_CURRENCY, TYPE_RECEIVE_PRIZE_LOBBY } from '../../Utils/Types';
import { Utils } from '../../Utils/Utils';
import { SuperUIAnimCustom } from '../OtherUI/SuperUIAnimCustom';
import { ResourceUtils } from '../../Utils/ResourceUtils';
import { ActionReceivePrizeClass } from './UIReceivePrizeLobby/TypeUIReceivePrizeLobby';
import { UILoadingSys_2 } from '../OtherUI/UILoadingSys_2';
import { UIReceivePrizeLobbyBase } from './UIReceivePrizeLobby/UIReceivePrizeLobbyBase';
import { SoundSys } from '../../Common/SoundSys';
import { CurrencySys } from '../CurrencySys';
import { clientEvent } from '../../framework/clientEvent';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../OtherUI/Others/AutoScale/TypeAutoScale';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from '../../Configs/MConfigs';
import { MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

Enum(TYPE_RECEIVE_PRIZE_LOBBY);

@ccclass('sfTilePrizeLobby')
export class sfTilePrizeLobby {
    @property({ type: TYPE_RECEIVE_PRIZE_LOBBY }) typeReceive: TYPE_RECEIVE_PRIZE_LOBBY;
    @property(SpriteFrame) sf: SpriteFrame;
}

@ccclass('UIReceivePrizeLobby')
export class UIReceivePrizeLobby extends Component {
    @property(SuperUIAnimCustom) superUIAnimCustom: SuperUIAnimCustom;
    @property(UILoadingSys_2) uiLoadingSys: UILoadingSys_2;
    @property(Node) nParentUI: Node;

    private _queueActionReceivePrize: ActionReceivePrizeClass[] = [];
    private _isPlayingActionReceivePrize: boolean = false; public get IsReceivingAnim() { return this._isPlayingActionReceivePrize; }
    private _actionPlaying: ActionReceivePrizeClass = null;
    private _typeEventPlaying: TYPE_RECEIVE_PRIZE_LOBBY = null;
    private _mapUI: Map<TYPE_RECEIVE_PRIZE_LOBBY, Node> = new Map();

    public static Instance: UIReceivePrizeLobby = null;

    protected onLoad(): void {
        if (UIReceivePrizeLobby.Instance == null) {
            UIReceivePrizeLobby.Instance = this;
        }
    }

    protected onEnable(): void {
        this.uiLoadingSys.Close();
    }

    protected onDestroy(): void {
        UIReceivePrizeLobby.Instance = null;
    }

    //#region self func
    private GetListWPosSuitForNumItems(numItems: number, speDisY: number = 0): Vec3[] {
        const distanceItemY = 130;
        const distanceItemX = 130;
        const diffHigher123 = 300;
        const diffHigherDefault = 100;
        const sizeWindow = Utils.getSizeWindow();
        const halfWidthScreen = sizeWindow.x / 2;
        const halfHeight = sizeWindow.y / 2;
        switch (numItems) {
            case 1:
                return [new Vec3(halfWidthScreen, halfHeight + diffHigher123 + speDisY, 0)];
            case 2:
                return [new Vec3(halfWidthScreen - 80, halfHeight + diffHigher123 + speDisY, 0), new Vec3(halfWidthScreen + 80, halfHeight + diffHigher123 + speDisY, 0)];
            case 3:
                return [new Vec3(halfWidthScreen - 120, halfHeight + diffHigher123 - 50 + speDisY, 0), new Vec3(halfWidthScreen, halfHeight + diffHigher123 + speDisY, 0), new Vec3(halfWidthScreen + 120, halfHeight + diffHigher123 - 50 + speDisY, 0)];
            default:
                let result = [];
                const defaultColumnEachRow = 4;
                const numRow = Math.floor(numItems / defaultColumnEachRow);

                function addWPosToResult(lengthColumn: number, wPosY: number) {
                    let diff = distanceItemX / 2;
                    for (let i = 0; i < lengthColumn; i++) {
                        let wPos = new Vec3(halfWidthScreen + distanceItemX * (i - lengthColumn / 2.0) + diff, wPosY + speDisY, 0);
                        result.push(wPos);
                    }
                }

                for (let indexRow = 0; indexRow < numRow; indexRow++) {
                    const wPosY = halfHeight + diffHigherDefault + (numRow - indexRow) * distanceItemY;
                    // in case normal row just use formula 
                    addWPosToResult(defaultColumnEachRow, wPosY);
                }
                // check is last row
                if (numItems % defaultColumnEachRow != 0) {
                    const wPosY = halfHeight + diffHigherDefault;
                    addWPosToResult(numItems % 4, wPosY);
                }
                return result;
        }
    }

    //#region pf UI
    private async InitUIReceivePrizeLobby(action: ActionReceivePrizeClass): Promise<Node> {
        const typeUI = action.type;
        let urlUI = "";
        switch (typeUI) {
            case TYPE_RECEIVE_PRIZE_LOBBY.WEEKLY:
                urlUI = "/Prefabs/UIReceivePrize/UIReceivePrizeLobby_Weekly";
                break;
            case TYPE_RECEIVE_PRIZE_LOBBY.SEASON_PASS_CHEST: case TYPE_RECEIVE_PRIZE_LOBBY.LEVEL_PASS_CHEST: case TYPE_RECEIVE_PRIZE_LOBBY.FINISH_MAP_LOBBY:
            case TYPE_RECEIVE_PRIZE_LOBBY.TOURNAMENT: case TYPE_RECEIVE_PRIZE_LOBBY.SPEED_RACE: case TYPE_RECEIVE_PRIZE_LOBBY.HAT_RACE: case TYPE_RECEIVE_PRIZE_LOBBY.LIGHT_ROAD:
                // check prize length if it more than 2 => move to chest
                if (action.data.length == 1) {
                    urlUI = "/Prefabs/UIReceivePrize/UIReceivePrizeLobby_NoChest";
                } else {
                    urlUI = "/Prefabs/UIReceivePrize/UIReceivePrizeLobby_Chest";
                }
                break;
            case TYPE_RECEIVE_PRIZE_LOBBY.LOGIN_REWARD: case TYPE_RECEIVE_PRIZE_LOBBY.INVITE_FRIEND: case TYPE_RECEIVE_PRIZE_LOBBY.SPIN:
            case TYPE_RECEIVE_PRIZE_LOBBY.SHOP_PACK: case TYPE_RECEIVE_PRIZE_LOBBY.PACK:
            case TYPE_RECEIVE_PRIZE_LOBBY.ENDLESS_TREASURE: case TYPE_RECEIVE_PRIZE_LOBBY.LEVEL_PASS_LIST_PRIZE:
            case TYPE_RECEIVE_PRIZE_LOBBY.SEASON_PASS_LIST_PRIZE:
            case TYPE_RECEIVE_PRIZE_LOBBY.LEVEL_PROGRESSION_END_TIME:
                urlUI = "/Prefabs/UIReceivePrize/UIReceivePrizeLobby_NoChest";
                break;
            case TYPE_RECEIVE_PRIZE_LOBBY.DASH_RUSH: case TYPE_RECEIVE_PRIZE_LOBBY.FINISH_BUILDING_CONSTRUCTOR_LOBBY:
                urlUI = "/Prefabs/UIReceivePrize/UIReceivePrizeLobby_Chest";
                break;
        }

        let pfResult = await ResourceUtils.loadPrefab(urlUI, (finished: number, total: number) => {
            // console.log(`Load ${urlUI} progress: ${finished}/${total}`);
        })

        let nUI = instantiate(pfResult) as Node;
        nUI.parent = this.nParentUI;
        nUI.active = false;
        nUI.getComponent(UIReceivePrizeLobbyBase).SetUpBase(this.superUIAnimCustom);
        this._mapUI.set(typeUI, nUI);


        return nUI;
    }

    private async GetUIReceivePrizeLobby(action: ActionReceivePrizeClass): Promise<Node> {
        const typeUI = action.type;
        if (this._mapUI.has(typeUI)) {
            return this._mapUI.get(typeUI);
        } else {
            // turn on loading popUp
            this.uiLoadingSys.Show();
            let nResult = await this.InitUIReceivePrizeLobby(action);
            this.uiLoadingSys.Close();
            // turn off loading popUp
            return nResult;
        }
    }
    //#endregion pf UI
    //====================================================

    //====================================================
    //#region queue anim
    /**
     * remember after play anim it automate save items when anim is done
     * @param type 
     * @param data 
     * @param indexUIPrize
     */
    public async AddActionToQueue(type: TYPE_RECEIVE_PRIZE_LOBBY, data: IPrize[], reasonReceivePrize: string, indexUIPrize: number = 0, dataCustom: any = null, nameCustom: any = null) {
        let actionPlayAnim = new ActionReceivePrizeClass(type, data, reasonReceivePrize, indexUIPrize, dataCustom, nameCustom);
        this._queueActionReceivePrize.push(actionPlayAnim);
        // console.log("check _isPlayingActionReceivePrize ", this._isPlayingActionReceivePrize);

        if (!this._isPlayingActionReceivePrize) {
            await this.PlayActionInQueue();
        }
    }

    private async PlayActionInQueue() {
        let action: ActionReceivePrizeClass = this._queueActionReceivePrize.pop();

        while (action != null) {
            // prepare play anim 
            this._actionPlaying = action;
            this._typeEventPlaying = action.type;
            let nUIplay = await this.GetUIReceivePrizeLobby(action);
            const comUIBase = nUIplay.getComponent(UIReceivePrizeLobbyBase);
            comUIBase.SetDataToShow(action);
            nUIplay.active = true;
            await comUIBase.Play();
            nUIplay.active = false;
            action = this._queueActionReceivePrize.pop();
        }
        // in case done all anim 
        this._isPlayingActionReceivePrize = false;
    }

    private IsHaveMoreActionInQueue(): boolean {
        return this._queueActionReceivePrize.length > 0;
    }
    //#endregion queue anim
    //====================================================

    //====================================================
    //#region anim not queue
    public async ReceiveCoin3D_HOME(wPosStart: Vec3, numCoin: number) {
        let canNextLogic = false;
        let wPosEnd: Vec3 = Vec3.ZERO;
        clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_COIN, (wPosUICoin: Vec3) => {
            canNextLogic = true;
            wPosEnd = wPosUICoin;
        })
        await Utils.WaitReceivingDone(() => canNextLogic);

        let listPromise: Promise<void>[] = [];
        SoundSys.Instance.playSoundEffectOneShotDelayTime(GameSoundEffect.SOUND_REWARDS, 1, 0.1);
        listPromise.push(this.superUIAnimCustom.ReceivePrizeCoin(null, numCoin, wPosStart, wPosEnd,
            null,
            (numCoinIncrease: number) => {
                CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numCoinIncrease);
                clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_PAGE_HOME);
                clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_PAGE_HOME, null, null, MConfigs.FX_NEW_CUSTOM);
            }));

        await Promise.all(listPromise);
    }
    //#endregion anim not queue
    //====================================================
}



