import { _decorator, Component, Node, tween, Tween, UIOpacity } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ShadowInGame')
export class ShadowInGame extends Component {
    @property(Node) visual: Node;
    @property(Node) nPopUpVipSpace: Node;
    @property(Node) nUIGame: Node;

    private comOpa: UIOpacity = null;
    protected onLoad(): void {
        this.comOpa = this.visual.getComponent(UIOpacity);
        this.comOpa.opacity = 0;
        this.visual.active = false;

        this.ResetUI();
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_SHADOW_IN_GAME.SHOW, this.ShowShadow, this);
        clientEvent.on(MConst.EVENT_SHADOW_IN_GAME.HIDE, this.HideShadow, this);
        clientEvent.on(MConst.EVENT_SHADOW_IN_GAME.SHOW_UI_GAME, this.ShowUIGame, this);
        clientEvent.on(MConst.EVENT_SHADOW_IN_GAME.HIDE_UI_GAME, this.HideUIGame, this);
        clientEvent.on(MConst.EVENT_SHADOW_IN_GAME.SHOW_POP_UP_VIP_SPACE, this.ShowPopUpVipSpace, this);
        clientEvent.on(MConst.EVENT_SHADOW_IN_GAME.HIDE_POP_UP_VIP_SPACE, this.HidePopUpVipSpace, this);
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetUI, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_SHADOW_IN_GAME.SHOW, this.ShowShadow, this);
        clientEvent.off(MConst.EVENT_SHADOW_IN_GAME.HIDE, this.HideShadow, this);
        clientEvent.off(MConst.EVENT_SHADOW_IN_GAME.SHOW_UI_GAME, this.ShowUIGame, this);
        clientEvent.off(MConst.EVENT_SHADOW_IN_GAME.HIDE_UI_GAME, this.HideUIGame, this);
        clientEvent.off(MConst.EVENT_SHADOW_IN_GAME.SHOW_POP_UP_VIP_SPACE, this.ShowPopUpVipSpace, this);
        clientEvent.off(MConst.EVENT_SHADOW_IN_GAME.HIDE_POP_UP_VIP_SPACE, this.HidePopUpVipSpace, this);
        clientEvent.off(MConst.EVENT.RESET_GAME, this.ResetUI, this);
    }

    public ShowShadow(isUseOpacity = false) {
        if (isUseOpacity) {
            this.comOpa.opacity = 0;
            this.visual.active = true;
            Tween.stopAllByTarget(this.comOpa);
            tween(this.comOpa)
                .to(MConst.EVENT_SHADOW_IN_GAME.TIME_SHADOW, { opacity: 255 })
                .start();
        } else {
            this.comOpa.opacity = 255;
            this.visual.active = true;
        }
    }

    public HideShadow() {
        this.comOpa.opacity = 255;
        Tween.stopAllByTarget(this.comOpa);
        tween(this.comOpa)
            .to(MConst.EVENT_SHADOW_IN_GAME.TIME_SHADOW, { opacity: 0 })
            .call(() => {
                this.visual.active = false;
            })
            .start();
    }

    private ShowPopUpVipSpace() {
        this.nPopUpVipSpace.active = true;
    }

    private HidePopUpVipSpace() {
        this.nPopUpVipSpace.active = false;
    }

    private ResetUI() {
        this.visual.active = false;
        this.nPopUpVipSpace.active = false;
    }

    public ShowUIGame() {
        this.nUIGame.active = true;
    }

    public HideUIGame() {
        this.nUIGame.active = false;
    }
}


