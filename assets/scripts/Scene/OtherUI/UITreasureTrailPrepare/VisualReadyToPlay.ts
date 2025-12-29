import { _decorator, Component, Label, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { LayerPlayerTTPrepare } from './LayerPlayerTTPrepare';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { Utils } from '../../../Utils/Utils';
import { CONFIG_TT } from '../UITreasureTrail/TypeTreasureTrail';
import { InfoBot_TreasureTrail } from '../../../Utils/Types';
import { MConsolLog } from '../../../Common/MConsolLog';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Mon Aug 11 2025 14:07:34 GMT+0700 (Indochina Time)
 * VisualReadyToPlay
 * db://assets/scripts/Scene/OtherUI/UITreasureTrailPrepare/VisualReadyToPlay.ts
 *
 */

@ccclass('VisualReadyToPlay')
export class VisualReadyToPlay extends Component {
    @property(UIOpacity) nFxGlow: UIOpacity;
    @property(UIOpacity) nFxGlow2: UIOpacity;
    @property(Label) lbNumPlayer: Label;
    @property(Label) lbShadowNumPlayer: Label;
    @property(LayerPlayerTTPrepare) layerPlayerTTPrepare: LayerPlayerTTPrepare;
    @property(Node) nHeader: Node;
    @property(Node) nLbTapContinue: Node;
    @property(Node) nBlock: Node;

    private tweenGlow: Tween<UIOpacity>;
    private _cbClose: CallableFunction = null;
    //==========================================
    //#region base
    protected onDisable(): void {
        if (this.tweenGlow != null) {
            this.tweenGlow.stop();
        }
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

    private async AnimShowBots() {
        // because this is the first time join event => you just pass the param stage is 0
        const listPathURLBot: InfoBot_TreasureTrail[] = DataTreasureTrailSys.Instance.GetListPathAvaBotShow_uiPrepare(0);
        await this.layerPlayerTTPrepare.PlayAnim(listPathURLBot);
    }

    private AnimIncreaseNumBots() {
        // increase from 0 -> 100
        const timeIncreaseNumBot: number = 2;
        const self = this;
        const maxPlayer = CONFIG_TT.MAX_PLAYER_JOIN;
        tween(this.lbNumPlayer.node)
            .to(timeIncreaseNumBot, {}, {
                onUpdate(target, ratio) {
                    self.lbNumPlayer.string = self.lbShadowNumPlayer.string = `${(ratio * maxPlayer).toFixed(0)}/${maxPlayer}`;
                },
            })
            .call(() => { self.lbNumPlayer.string = self.lbShadowNumPlayer.string = `${maxPlayer}/${maxPlayer}` })
            .start()
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public RegisterCbClose(cbClose: CallableFunction) {
        this._cbClose = cbClose;
    }

    public PrepareShow() {
        this.nBlock.active = false;
        this.lbNumPlayer.string = this.lbShadowNumPlayer.string = `0/${CONFIG_TT.MAX_PLAYER_JOIN}`;
        this.nFxGlow.getComponent(UIOpacity).opacity = 0;
        this.nFxGlow2.getComponent(UIOpacity).opacity = 0;
        this.nHeader.getComponent(UIOpacity).opacity = 0;
        this.nHeader.scale = Vec3.ZERO;
        this.nLbTapContinue.getComponent(UIOpacity).opacity = 0;
        this.tweenGlow != null && this.tweenGlow.stop();
        this.layerPlayerTTPrepare.ReUseAllBots();
    }

    public async ShowUI() {
        const self = this;
        const timeAppear = 0.2;
        const timeScale = 0.3;

        this.node.active = true;

        // UIHeader
        tween(this.nHeader)
            .to(timeScale, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();
        tween(this.nHeader.getComponent(UIOpacity))
            .to(timeAppear, { opacity: 255 })
            .start();
        await Utils.delay(timeAppear * 1000);
        this.AnimGlow();

        // hiển thị bot
        this.AnimIncreaseNumBots();
        await this.AnimShowBots();

        // hiển thị lb tap to continue
        tween(this.nLbTapContinue.getComponent(UIOpacity))
            .to(timeAppear, { opacity: 255 })
            .call(() => { self.nBlock.active = true; })
            .start();
    }

    public Hide() {
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
    private onBtnContinue() {
        this._cbClose && this._cbClose();
    }
    //#endregion btn
    //==========================================
}