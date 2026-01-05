/**
 * 
 * dinhquangvinhdevF
 * Tue Aug 19 2025 09:55:03 GMT+0700 (Indochina Time)
 * UIResultTreasureTrail
 * db://assets/scripts/Scene/OtherUI/UITreasureTrail/UIResultTreasureTrail.ts
*
*/
import { _decorator, Component, Label, Node, Sprite, SpriteFrame, tween, Tween, UIOpacity } from 'cc';
import { InfoBot_TreasureTrail, IPrize, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
import { CONFIG_TT } from './TypeTreasureTrail';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { ListBotResultTT } from './ListBotResultTT';
import { Utils } from '../../../Utils/Utils';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('UIResultTreasureTrail')
export class UIResultTreasureTrail extends Component {
    @property(UIOpacity) nFxGlow: UIOpacity;
    @property(UIOpacity) nFxGlow2: UIOpacity;
    @property(Label) lbContent: Label;
    @property(Label) lbReward: Label;
    @property(Sprite) spAvatarPlayer: Sprite;
    @property(Node) nTapToContinue: Node;
    @property(Node) nBlockUI: Node;
    @property(ListBotResultTT) listBotResultTT: ListBotResultTT;
    @property(Node) nWPosPrize: Node;

    private tweenGlow: Tween<UIOpacity>;
    private _cbCloseUI: CallableFunction = null;
    private _numCoin: number = 0;


    //==========================================
    //#region base
    protected onEnable(): void {
        this.AnimGlow();
    }

    public SetUpCb(cbCloseUI: CallableFunction) {
        this._cbCloseUI = cbCloseUI;
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private TweenGlow(): Tween<UIOpacity> {
        const timeGlowUp: number = 2;
        const timeGlowDown: number = 2;

        // set prepare tween
        this.nFxGlow.getComponent(UIOpacity).opacity = 0;
        this.nFxGlow2.getComponent(UIOpacity).opacity = 0;

        let tweenGlow = tween(this.nFxGlow)
            .to(timeGlowUp, { opacity: 255 }, { easing: 'quintOut' })
            .to(timeGlowDown, { opacity: 0 }, { easing: 'quintIn' })
            .call(() => {
                tween(this.nFxGlow2)
                    .to(timeGlowUp, { opacity: 255 }, { easing: 'quintOut' })
                    .to(timeGlowDown, { opacity: 0 }, { easing: 'quintIn' })
                    .start()
            })
            .delay(timeGlowUp + timeGlowDown)
            .union()
            .repeatForever()

        return tweenGlow;
    }

    private AnimGlow() {
        if (this.tweenGlow != null) { this.tweenGlow.stop() }
        this.tweenGlow = this.TweenGlow();
        this.tweenGlow.start();
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public Hide() { this.node.active = false; this.nBlockUI.active = false; }
    public async Show() {
        this.nBlockUI.active = true;

        this.node.active = true;
        const opaUI = this.node.getComponent(UIOpacity);
        opaUI.opacity = 0;

        const timeShowUI = 0.8;
        tween(opaUI)
            .to(timeShowUI, { opacity: 255 })
            .start();

        await Utils.delay(timeShowUI * 1000);

        // ================== hiển thị lần lượt từng đối tượng  ================    
        await this.listBotResultTT.ShowListPlayer();

        // ================== hiển thị tap to continue =========================
        this.nTapToContinue.active = true;

        this.nBlockUI.active = false;
    }
    /**
     * 
     * @param listBotRemain include the info player
     */
    public SetUp(listBotRemain: InfoBot_TreasureTrail[]) {
        const self = this;
        // tìm info player
        const infoPlayer: InfoBot_TreasureTrail = listBotRemain.find(infoCheck => infoCheck.id == CONFIG_TT.ID_PLAYER);

        // set ảnh + content
        const totalPrizePlayerReceive: number = Math.floor(CONFIG_TT.PRIZE_WIN / listBotRemain.length);
        this._numCoin = totalPrizePlayerReceive;
        this.lbContent.string = `You are sharing the grand prize\nwith ${listBotRemain.length - 1} other winners!`;
        this.lbReward.string = `x${totalPrizePlayerReceive}`;
        ResourceUtils.TryLoadImageAvatar(infoPlayer.avatar, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (infoPlayer.avatar == pathAvatar && self.node != null && self.node.isValid) {
                self.spAvatarPlayer.spriteFrame = spriteFrame;
            }
        });

        // init ảnh bot hiển thị trong list
        const listBotExcludePlayer = listBotRemain.filter(infoCheck => infoCheck.id != CONFIG_TT.ID_PLAYER);
        this.listBotResultTT.InitBot(listBotExcludePlayer);
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
        LogEventManager.Instance.logButtonClick(`tap_to_continue`, "UICongratulationTT");
        const wPosPrize = this.nWPosPrize.worldPosition.clone();
        this._cbCloseUI != null && this._cbCloseUI(wPosPrize, [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, this._numCoin)]);
    }
    //#endregion btn
    //==========================================
}