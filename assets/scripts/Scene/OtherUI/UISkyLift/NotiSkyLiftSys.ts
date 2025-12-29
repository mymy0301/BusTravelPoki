/**
 * 
 * dinhquangvinhdev
 * Wed Aug 27 2025 15:42:23 GMT+0700 (Indochina Time)
 * NotiSkyLiftSys
 * db://assets/scripts/Scene/OtherUI/UISkyLift/NotiSkyLiftSys.ts
*
*/
import { _decorator, Component, instantiate, Node, Pool, Prefab, Size, Tween, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { InfoTut } from '../UITreasureTrail/TypeTreasureTrail';
import { Utils } from '../../../Utils/Utils';
import { IPrize } from '../../../Utils/Types';
import { PoolLobbySys } from '../../LobbyScene/PoolLobbySys';
import { ItemPrizeNotiSkyLift } from './ItemPrizeNotiSkyLift';
import { CONFIG_SL, EVENT_SKY_LIFT } from './TypeSkyLift';
import { clientEvent } from '../../../framework/clientEvent';
import { PoolGameSys } from '../../LobbyScene/PoolGameSys';
const { ccclass, property } = _decorator;

@ccclass('NotiSkyLiftSys')
export class NotiSkyLiftSys extends Component {
    @property([InfoTut]) listInfoTut: InfoTut[] = [];
    @property(Prefab) pfPrizeSkyLift: Prefab;
    @property(Node) nBubble: Node;
    @property(Node) nLayoutPrize: Node;
    @property(Node) nListenClickHideNoti: Node;
    private _listPrize: Node[] = [];
    //==========================================
    //#region base
    protected onEnable(): void {
        this.RegisterNoti();
    }

    protected onDisable(): void {
        this.UnRegisterNoti();
    }

    private RegisterNoti() {
        clientEvent.on(EVENT_SKY_LIFT.NOTIFICATION, this.ShowNoti, this);

        if (this.nListenClickHideNoti != null) {
            this.nListenClickHideNoti.on(Node.EventType.TOUCH_START, this.HideAnim, this, true);
        }
    }

    private UnRegisterNoti() {
        // Need try catch in here because the node is not depend on this node class. So you need try catch if it wrong
        try {
            if (this.nListenClickHideNoti != null) {
                this.nListenClickHideNoti.off(Node.EventType.TOUCH_START, this.HideAnim, this, true);
            }

            clientEvent.off(EVENT_SKY_LIFT.NOTIFICATION, this.ShowNoti, this);
            this.unschedule(this.HideAnim);
        } catch (e) {

        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private SetUpNotiForEachState(numPrize: number) {
        const infoSet = this.listInfoTut[numPrize - 1];
        this.nBubble.getComponent(UITransform).contentSize = new Size(infoSet.transformTut.x, infoSet.transformTut.y);
        this.nBubble.getComponent(UITransform).anchorPoint = Utils.ConvertVec3ToVec2(infoSet.anchorTut);
        this.nBubble.position = Vec3.ZERO;
    }

    private ShowAnim() {
        const timeShow: number = 0.3;
        this.nBubble.scale = Vec3.ZERO;
        this.nBubble.active = true;
        Tween.stopAllByTarget(this.nBubble);
        tween(this.nBubble)
            .to(timeShow, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();
    }

    private HideAnim() {
        const timeShow: number = 0.3;
        this.nBubble.scale = Vec3.ONE;
        Tween.stopAllByTarget(this.nBubble);
        tween(this.nBubble)
            .to(timeShow, { scale: Vec3.ZERO }, { easing: 'backIn' })
            .call(() => { this.nBubble.active = false; })
            .start();
    }

    private TryInitPoolItem() {
        const instanceChoice = this.GetInstanceChoice();
        if (instanceChoice == null) { return; }
        if (!instanceChoice.IsRegisterPool(CONFIG_SL.KEY_POOL_PRIZE)) {
            instanceChoice.RegisterPool(CONFIG_SL.KEY_POOL_PRIZE, new Pool(() => instantiate(this.pfPrizeSkyLift), 0));
        }
    }

    private InitPrize(listPrize: IPrize[]) {
        const instanceChoice = this.GetInstanceChoice();
        if (instanceChoice == null) { return; }
        listPrize.forEach(prizeCheck => {
            let nPrize: Node = instanceChoice.GetItemFromPool(CONFIG_SL.KEY_POOL_PRIZE);
            nPrize.getComponent(UIOpacity).opacity = 255;
            nPrize.position = Vec3.ZERO;
            nPrize.setParent(this.nLayoutPrize);
            nPrize.active = true;
            nPrize.getComponent(ItemPrizeNotiSkyLift).SetUp(prizeCheck);
            this._listPrize.push(nPrize);
        })
    }

    private PoolAllOldPrize() {
        const instanceChoice = this.GetInstanceChoice();
        if (instanceChoice == null) { return; }
        this._listPrize.forEach(prize => { prize.active = false; })
        instanceChoice.PoolListItems(this._listPrize, CONFIG_SL.KEY_POOL_PRIZE);
        this._listPrize = [];
    }

    private GetInstanceChoice() {
        return PoolLobbySys.Instance != null ? PoolLobbySys.Instance : (PoolGameSys.Instance != null ? PoolGameSys.Instance : null);
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public ShowNoti(nParent: Node, listPrize: IPrize[]) {
        // try init pool
        this.TryInitPoolItem();
        // pool all old items
        this.PoolAllOldPrize();
        // set up noti
        this.SetUpNotiForEachState(listPrize.length);
        this.node.setParent(nParent);
        this.node.position = Vec3.ZERO;
        // init prize
        this.InitPrize(listPrize);

        // anim show
        this.ShowAnim();

        // schedule hide anim
        this.unschedule(this.HideAnim);
        this.scheduleOnce(this.HideAnim, CONFIG_SL.TIME_HIDE_NOTI);
    }

    public HideNoti() {
        this.nBubble.active = false;
        this.unschedule(this.HideAnim);
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}