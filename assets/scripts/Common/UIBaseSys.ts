import { _decorator, CCBoolean, Component, director, Node, tween, UIOpacity, Vec3 } from 'cc';
import { AniTweenSys } from '../Utils/AniTweenSys';
import { MConst } from '../Const/MConst';
import { Utils } from '../Utils/Utils';
import { MConfigs } from '../Configs/MConfigs';
import { LogEventManager } from '../LogEvent/LogEventManager';
import { ShadowGameUI } from '../Scene/GameScene/OtherUI/ShadowGameUI';
const { ccclass, requireComponent, property } = _decorator;

enum STATE_UI_BASE_SYS {
    OPENING,
    OPEN_DONE,
    CLOSING,
    CLOSE_DONE
}

@ccclass('UIBaseSys')
@requireComponent(UIOpacity)
export class UIBaseSys extends Component {
    @property(CCBoolean) useCustomShow = false;
    @property(CCBoolean) useCustomClose = false;
    @property(CCBoolean) autoSetSibblingToLastParentWhenEnable = true;
    @property(CCBoolean) autoShadow = true;
    @property(ShadowGameUI) nShadowSelf: ShadowGameUI;
    @property(Node) nVisual: Node;

    protected _dataCustom: any = null;

    private _stateUIBaseSys: STATE_UI_BASE_SYS = STATE_UI_BASE_SYS.CLOSE_DONE;
    public animShowAndMove: AnimShowAndMove = new AnimShowAndMove();

    public async PrepareDataShow() { }
    public async PrepareDataClose() { }
    public async UIShowDone() { }
    public async UICloseDone() { }

    public async UICustomShow(typeShow: number) { }
    public async UICustomClose(typeClose: number) { }

    /**
     * 
     * @param needPlaySound 
     * @param typeClose 0: BubbleShow | 1: ComeUpWithOpacity | 2: normal
     */
    public async Close(typeClose: number = 0) {
        LogEventManager.Instance.logPopupClose(`close`, this.node.name);

        if (this.autoShadow) {
            this.HideShadow();
        }

        this.ChangeStateUIBaseSys(STATE_UI_BASE_SYS.CLOSING);

        await this.PrepareDataClose();

        if (this.useCustomClose) {
            await this.UICustomClose(typeClose);
        } else {
            switch (typeClose) {
                case 0: await this.animShowAndMove.BubbleClose(this.nVisual); break;
                case 1: await this.animShowAndMove.ComeDownWithOpacityClose(this.nVisual); break;
                case 2: await this.animShowAndMove.NormalClose(this.nVisual); break;
                default: await this.animShowAndMove.BubbleClose(this.nVisual); break;
            }

            this.node.active = false;
        }
        this.ChangeStateUIBaseSys(STATE_UI_BASE_SYS.CLOSE_DONE);

        this.UICloseDone();
    }

    /**
     * This func will call auto when you call Show , if you not call show just set it in start game => you just need call this func in the func start
     * @param typeShow 0: BubbleShow | 1: ComeUpWithOpacity | 2: normal | 3: ComeUpWithOpacity2
     */
    public async Show(typeShow: number = 0) {
        LogEventManager.Instance.logPopupShow(`show`, this.node.name);

        if (this.autoShadow) {
            this.ShowShadow();
        }

        this.ChangeStateUIBaseSys(STATE_UI_BASE_SYS.OPENING);

        director.emit(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING);
        await this.PrepareDataShow();
        director.emit(MConst.EVENT.BLOCK_UI.HIDE_UI_LOADING);

        if (this.useCustomShow) {
            this.node.active = true;
            this.node.scale = Vec3.ONE;
            await this.UICustomShow(typeShow);
        } else {
            this.node.active = true;
            switch (typeShow) {
                case 0: await this.animShowAndMove.BubbleShow(this.nVisual); break;
                case 1: await this.animShowAndMove.ComeUpWithOpacityShow(this.nVisual); break;
                case 2: await this.animShowAndMove.NormalShow(this.nVisual); break;
                case 3: await this.animShowAndMove.ComeUpWithOpacityShow2(this.nVisual); break;
                default: await this.animShowAndMove.BubbleShow(this.nVisual); break;
            }
        }

        this.ChangeStateUIBaseSys(STATE_UI_BASE_SYS.OPEN_DONE);

        this.UIShowDone();
    }

    public SetCustomData(data: any = null) {
        this._dataCustom = data;
    }

    //#region common func shadow
    public ShowShadow(isUseOpa: boolean = true, timeShadow: number = -1) {
        if (this.nShadowSelf != null && this.nShadowSelf.isValid) {
            if (timeShadow > 0) {
                this.nShadowSelf.Show(isUseOpa, timeShadow);
            } else {
                this.nShadowSelf.Show(isUseOpa);
            }
        }
    }

    public HideShadow(isUseOpa: boolean = true, timeShadow: number = -1) {
        if (this.nShadowSelf != null && this.nShadowSelf.isValid) {
            if (timeShadow > 0) {
                this.nShadowSelf.Hide(isUseOpa, timeShadow);
            } else {
                this.nShadowSelf.Hide(isUseOpa);
            }
        }
    }
    //#endregion common func shadow

    //#region state UI Base
    public IsUIOpening() { return this._stateUIBaseSys == STATE_UI_BASE_SYS.OPENING; }
    public IsUIOpenDone() { return this._stateUIBaseSys == STATE_UI_BASE_SYS.OPEN_DONE; }
    public IsUIClosing() { return this._stateUIBaseSys == STATE_UI_BASE_SYS.CLOSING; }
    public IsUICloseDone() { return this._stateUIBaseSys == STATE_UI_BASE_SYS.CLOSE_DONE; }

    /** state Ui base */
    private ChangeStateUIBaseSys(state: STATE_UI_BASE_SYS) {
        this._stateUIBaseSys = state;
        switch (state) {
            // you can add specific state here
        }
    }
    //#endregion state UI Base

    //#region component Base
    protected onEnable(): void {
        if (this.autoSetSibblingToLastParentWhenEnable && this.node.parent != null) {
            this.node.setSiblingIndex(this.node.parent.children.length);
        }
    }
    //#endregion component Base

}

class AnimShowAndMove {
    //#region func close
    public BubbleClose(target: Node) {
        return new Promise<void>(async (resolve) => {
            await AniTweenSys.scaleBubble(target, 0.3, 0, Vec3.ZERO, Vec3.ZERO, true, false);
            target.active = false;
            resolve();
        });
    }


    public ComeUpWithOpacityClose(target: Node) {
        const mOpacity = target.getComponent(UIOpacity);
        mOpacity.opacity = 0;
        return new Promise<void>((resolve) => {
            tween(target)
                .to(0.2, {}, {
                    onUpdate(target, ratio) {
                        mOpacity.opacity = 255 * (1 - ratio);
                    },
                })
                .call(() => { target.active = false; resolve(); })
                .start();
        })

    }


    public ComeDownWithOpacityClose(target: Node) {
        const mOpacity = target.getComponent(UIOpacity);
        let midWPosScene = Utils.getMiddleWPosWindow();
        // const distanceDown: number = -Utils.getSizeWindow().height;
        const distanceDown: number = -200;

        midWPosScene.add3f(0, distanceDown, 0);
        return new Promise<void>((resolve) => {
            tween(target)
                .to(0.2, { worldPosition: midWPosScene }, {
                    onUpdate(target, ratio) {
                        mOpacity.opacity = 255 * (1 - ratio);
                    },
                })
                .call(() => { target.active = false; resolve(); })
                .start();
        });

    }


    public NormalClose(target: Node) {
        target.active = false;
    }
    //#endregion func close

    //#region func show
    public BubbleShow(target: Node) {
        return new Promise<void>(async (resolve) => {
            target.scale = Vec3.ZERO;
            target.active = true;
            target.position = Vec3.ZERO;
            await AniTweenSys.scaleBubble(target, 0.3, 0.2, new Vec3(1.1, 1.1, 1.1), Vec3.ONE, true, true);
            resolve();
        })
    }


    public ComeUpWithOpacityShow(target: Node) {
        target.scale = Vec3.ONE;
        // this.node.setWorldPosition(underMidWPosScene);
        // const distancePopUp = -Utils.getSizeWindow().height / 2;
        const distancePopUp = -50;
        target.position = Vec3.ZERO.clone().add3f(0, distancePopUp, 0);
        const mOpacity = target.getComponent(UIOpacity);
        mOpacity.opacity = 255 * 0.2;
        target.active = true;
        const time = 0.2;
        const distanceRatio = 255 * 0.8;

        return new Promise<void>((resolve) => {
            tween(target)
                // .to(0.2, { worldPosition: midWPosScene }, {
                .to(time, { position: Vec3.ZERO }, {
                    easing: 'sineIn', onUpdate(target, ratio) {
                        mOpacity.opacity = 255 * 0.4 + distanceRatio * ratio;
                    },
                })
                .call(resolve)
                .start();
        })
    }


    public ComeUpWithOpacityShow2(target: Node) {
        target.scale = Vec3.ONE;
        // target.setWorldPosition(underMidWPosScene);
        target.position = Vec3.ZERO.clone().add3f(0, -Utils.getSizeWindow().height / 2, 0);
        const mOpacity = target.getComponent(UIOpacity);
        mOpacity.opacity = 0;
        target.active = true;
        const time = 0.5;
        return new Promise<void>((resolve) => {
            tween(target)
                // .to(time, { worldPosition: midWPosScene }, {
                .to(time, { position: Vec3.ZERO }, {
                    easing: 'sineIn', onUpdate(target, ratio) {
                        mOpacity.opacity = 255 * ratio;
                    },
                })
                .call(resolve)
                .start();
        })
    }


    public NormalShow(target: Node) {
        return new Promise<void>((resolve) => {
            target.active = true;
            target.position = Vec3.ZERO;
            const comOpacity = target.getComponent(UIOpacity);
            if (comOpacity != null) {
                comOpacity.opacity = 255;
            }
            resolve();
        })
    }
    //#endregion func show
}


