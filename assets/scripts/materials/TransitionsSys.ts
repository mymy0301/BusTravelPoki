import { _decorator, AnimationComponent, CCFloat, Color, Component, director, Label, Material, Node, Size, Sprite, SpriteFrame, Tween, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { BlockLoading } from '../Scene/TransitionsScene/BlockLoading';
import { QuoteUI } from '../Scene/TransitionsScene/QuoteUI';
import { ShowNodeWithOpacity } from '../Common/ShowNodeWithOpacity';
import { Utils } from '../Utils/Utils';
import { MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

enum NAME_ANIM_LOAD {
    IDLE = "idle",
    OPEN = "open",
    CLOSE = "close"
}

enum NAME_ANIM_DECORATE {
    IDLE = "idle_decorate",
    IDLE_2 = "idle_decorate_2",
    OPEN = "show_decorate",
    CLOSE = "close_decorate",
}

@ccclass('TransitionsSys')
export class TransitionsSys extends Component {
    // @property(Node) nTitle: Node;
    @property(Sprite) sp: Sprite;
    // @property(Node) nQuote: Node;
    @property(Node) nBlockInput: Node;

    @property(CCFloat)
    speed: number = 0.5;
    @property(CCFloat)
    delayEachFrame: number = 0.1;
    @property(Node) nParentNBlack: Node;

    @property(AnimationComponent) animCom: AnimationComponent;
    @property(AnimationComponent) animCom_decorate: AnimationComponent;


    private readonly timeTransitionDefault = 0.3;
    private readonly timeScaleDefault = 0.4;
    private readonly timeDelayDefault = 0.25;
    private _isLoading: boolean = false;
    private scaleSize = 0;
    private readonly timeLoopDefault = 1;



    private _numCaseCanShowIconLoading: number = 3;

    @property(UIOpacity) uiOpacity: UIOpacity = null;
    @property(Node) title: Node = null;
    tweenOpacity: Tween<{}> = null;
    tweenTitle: Tween<{}> = null;
    tweenTitleLoop: Tween<{}> = null;

    protected onLoad(): void {
        director.on(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_ON, this.changeMat, this);
        director.on(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_ON_NOW, this.changeMatNow, this);
        director.on(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_OFF, this.changeMatReverse, this);

        director.on(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_ON_WITH_OUT_CHANGE_SCENE, this.changeMat_2, this);
        director.on(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_OFF_WITH_OUT_CHANGE_SCENE, this.changeMatReverse_2, this);

        this.stopTweenBlockLoading();
    }

    protected onDestroy(): void {
        director.off(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_ON, this.changeMat, this);
        director.off(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_ON_NOW, this.changeMatNow, this);
        director.off(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_OFF, this.changeMatReverse, this);

        director.off(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_ON_WITH_OUT_CHANGE_SCENE, this.changeMat_2, this);
        director.off(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_OFF_WITH_OUT_CHANGE_SCENE, this.changeMatReverse_2, this);
    }

    private async tweenBlockLoading() {
        // just can show icon loading in 3 time because the case long guest to load all scene is play tutorial
        // => show game scene => show game scene => show lobby scene
        this._numCaseCanShowIconLoading -= 1;
        if (this._numCaseCanShowIconLoading < 0) {
            return;
        }

        // this.nQuote.getComponent(QuoteUI).Show();

        // this.nBlockLoading.getComponent(BlockLoading).Show();

        // // opacity for title 
        // tween(this.nTitle)
        //     .call(() => {
        //         this.nTitle.getComponent(UIOpacity).opacity = 0;
        //         this.nTitle.active = true;
        //     })
        //     .to(0.5, {}, {
        //         onUpdate: (target: Node, ratio) => {
        //             target.getComponent(UIOpacity).opacity = (255 * ratio);
        //         }
        //     })
        //     .start();
    }

    private stopTweenBlockLoading() {
        // this.nQuote.getComponent(QuoteUI).Hide();

        // this.nBlockLoading.getComponent(BlockLoading).Hide();

        // // opacity for title
        // Tween.stopAllByTarget(this.nTitle);
        // this.nTitle.getComponent(UIOpacity).opacity = 0;
        // this.nTitle.active = false;
    }

    async changeMat(index) {
        // prepare anim
        this.nBlockInput.active = true;

        //======================================= WAY 1 ==========================================
        // //anim
        // this._isLoading = true;
        // for (let i = 0; i < this.nParentNBlack.children.length; i++) {
        //     const nBlack: Sprite = this.nParentNBlack.children[i].getComponent(Sprite);
        //     tween(nBlack)
        //         .to(this.speed, { fillRange: 1 }, { easing: 'smooth' })
        //         .start();
        //     await Utils.delay(this.delayEachFrame * 1000);
        // }

        // await Utils.delay(this.speed * 1000);

        // // after anim done
        // this.tweenBlockLoading();
        // director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TRANSITIONS_TURN_ON);

        //======================================= WAY 2 ==========================================
        // use shader
        // material
        // this._isLoading = true;
        // let start = { num: 255 };
        // let end = { num: 0 };
        // const sp = this.sp;
        // const color = new Color(255, 0, 0);
        // sp.color = color;
        // tween(start)
        //     .delay(0.0016)
        //     .to(this.timeTransitionDefault, end, {
        //         onUpdate(target: any, ratio: number) {
        //             color.r = target.num;
        //             sp.color = color;
        //         },
        //     })
        //     .call(() => {
        //         this.tweenBlockLoading();
        //         director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TRANSITIONS_TURN_ON);
        //     })
        //     .start();

        //========================================== WAY 3 =====================================

        // this.uiOpacity.opacity = 0;
        // if (this.tweenOpacity) this.tweenOpacity.stop();
        // this.tweenOpacity = tween(this.uiOpacity).to(this.timeTransitionDefault, { opacity: 255 }, { easing: 'smooth' }).call(() => {
        //     this.tweenBlockLoading();
        // }).start();

        // this.title.scale = new Vec3(0, 0, 0);
        // if (this.tweenTitle) this.tweenTitle.stop();
        // if (this.tweenTitleLoop) this.tweenTitleLoop.stop();
        // this.tweenTitle = tween(this.title).to(this.timeScaleDefault, { scale: Vec3.ONE }, { easing: 'backOut' }).delay(this.timeDelayDefault).call(() => {
        //     this.showTitleLoop();
        //     //block UI
        //     director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TRANSITIONS_TURN_ON);
        // }).start();

        //======================================= WAY 4 ========================
        this.animCom.play(NAME_ANIM_LOAD.OPEN);
        (async () => {
            this.animCom_decorate.play(NAME_ANIM_DECORATE.OPEN);
            await Utils.delay(this.animCom_decorate.clips.find(anim => anim.name == NAME_ANIM_DECORATE.OPEN).duration * 1000);
            this.animCom_decorate.crossFade(NAME_ANIM_DECORATE.IDLE_2);
        })();
        await Utils.delay(this.animCom.clips.find(anim => anim.name == NAME_ANIM_LOAD.OPEN).duration * 1000);
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TRANSITIONS_TURN_ON);
    }

    showTitleLoop() {
        if (this.tweenTitleLoop) this.tweenTitleLoop.stop();
        this.tweenTitleLoop = tween(this.title).to(this.timeLoopDefault, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: 'linear' })
            .to(this.timeLoopDefault, { scale: Vec3.ONE }, { easing: 'linear' })
            .union().repeatForever().start();
    }

    async changeMatNow() {
        //======================================= WAY 1 ========================
        // if (this.tweenOpacity) this.tweenOpacity.stop();
        // if (this.tweenTitle) this.tweenTitle.stop();
        // if (this.tweenTitleLoop) this.tweenTitleLoop.stop();
        // this.uiOpacity.opacity = 255;
        // this.title.scale = new Vec3(1, 1, 1);
        // // this.tweenBlockLoading();
        // this.showTitleLoop();

        //======================================= WAY 2 ========================
        this.animCom.play(NAME_ANIM_LOAD.OPEN);
        (async () => {
            this.animCom_decorate.play(NAME_ANIM_DECORATE.OPEN);
            await Utils.delay(this.animCom_decorate.clips.find(anim => anim.name == NAME_ANIM_DECORATE.OPEN).duration * 1000);
            this.animCom_decorate.crossFade(NAME_ANIM_DECORATE.IDLE_2);
        })();
        await Utils.delay(this.animCom.clips.find(anim => anim.name == NAME_ANIM_LOAD.OPEN).duration * 1000);
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TRANSITIONS_TURN_ON);
    }

    async changeMat_2(index) {
        // prepare anim
        this.nBlockInput.active = true;

        // //======================================= WAY 1 ==========================================
        // //anim
        // this._isLoading = true;
        // for (let i = 0; i < this.nParentNBlack.children.length; i++) {
        //     const nBlack: Sprite = this.nParentNBlack.children[i].getComponent(Sprite);
        //     tween(nBlack)
        //         .to(this.speed, { fillRange: 1 }, { easing: 'smooth' })
        //         .start();
        //     await Utils.delay(this.delayEachFrame * 1000);
        // }

        // await Utils.delay(this.speed * 1000);

        // // after anim done
        // this.tweenBlockLoading();
        // director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_ON_WITH_OUT_CHANGE_SCENE);


        //======================================= WAY 2 ==========================================
        // use shader
        // material
        // this._isLoading = true;
        // let start = { num: 255 };
        // let end = { num: 0 };
        // const sp = this.sp;
        // const color = new Color(255, 0, 0);
        // sp.color = color;
        // tween(start)
        //     .delay(0.0016)
        //     .to(this.timeTransitionDefault, end, {
        //         onUpdate(target: any, ratio: number) {
        //             color.r = target.num;
        //             sp.color = color;
        //         },
        //     })
        //     .call(() => {
        //         this.tweenBlockLoading();
        //         director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_ON_WITH_OUT_CHANGE_SCENE);
        //     })
        //     .start();

        //======================================= WAY 3 ==========================================
        // this.uiOpacity.opacity = 0;
        // if (this.tweenOpacity) this.tweenOpacity.stop();
        // this.tweenOpacity = tween(this.uiOpacity).to(this.timeTransitionDefault, { opacity: 255 }, { easing: 'smooth' }).call(() => {
        //     this.tweenBlockLoading();
        // }).start();

        // this.title.scale = new Vec3(0, 0, 0);
        // if (this.tweenTitle) this.tweenTitle.stop();
        // if (this.tweenTitleLoop) this.tweenTitleLoop.stop();
        // this.tweenTitle = tween(this.title).to(this.timeScaleDefault, { scale: Vec3.ONE }, { easing: 'backOut' }).delay(this.timeDelayDefault).call(() => {
        //     this.showTitleLoop();
        //     //block UI
        //     director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_ON_WITH_OUT_CHANGE_SCENE);
        // }).start();

        //======================================= WAY 4 ==========================================
        this.animCom.play(NAME_ANIM_LOAD.OPEN);
        (async () => {
            this.animCom_decorate.play(NAME_ANIM_DECORATE.OPEN);
            await Utils.delay(this.animCom_decorate.clips.find(anim => anim.name == NAME_ANIM_DECORATE.OPEN).duration * 1000);
            this.animCom_decorate.crossFade(NAME_ANIM_DECORATE.IDLE_2);
        })();
        await Utils.delay(this.animCom.clips.find(anim => anim.name == NAME_ANIM_LOAD.OPEN).duration * 1000);
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_ON_WITH_OUT_CHANGE_SCENE);
    }

    async changeMatReverse(index) {
        // prepare anim
        this._isLoading = false;
        this.stopTweenBlockLoading();

        // //===================================================== Way 1 =====================================================
        // // anim
        // for (let i = this.nParentNBlack.children.length - 1; i >= 0; i--) {
        //     const nBlack: Sprite = this.nParentNBlack.children[i].getComponent(Sprite);
        //     tween(nBlack)
        //         .to(this.speed, { fillRange: 0 }, { easing: 'smooth' })
        //         .start();
        //     await Utils.delay(this.delayEachFrame * 1000);
        // }
        // await Utils.delay(this.speed * 1000);

        // // after anim done
        // this.nBlockInput.active = false;
        // this._isLoading = false;
        // director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TRANSITIONS_TURN_OFF);

        //===================================================== Way 2 =====================================================
        // let start = { num: 0 };
        // let end = { num: 255 };
        // const sp = this.sp;
        // const color = new Color(0, 0, 0);
        // sp.color = color;
        // // const mat = Utils.randomValueOfList(this.mats);
        // // sp.material = mat;
        // tween(start)
        //     .delay(0.0016)
        //     .to(this.timeTransitionDefault, end, {
        //         onUpdate(target: any, ratio: number) {
        //             color.r = target.num;
        //             color.a = (255 * (1 - ratio));
        //             sp.color = color;
        //         },
        //     })
        //     .call(() => {
        //         // block UI
        //         this.nBlockInput.active = false;
        //         director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TRANSITIONS_TURN_OFF);
        //         this._isLoading = false;
        //     })
        //     .start();

        //====================================== WAY 3 ===========================================
        // if (this.tweenOpacity) this.tweenOpacity.stop();
        // this.tweenOpacity = tween(this.uiOpacity).to(this.timeTransitionDefault, { opacity: 0 }, { easing: 'smooth' }).call(() => {
        //     //block UI
        //     this.nBlockInput.active = false;
        //     director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TRANSITIONS_TURN_OFF);
        //     this._isLoading = false;
        // }).start();


        //======================================= WAY 4 ==========================================
        (async () => {
            this.animCom.play(NAME_ANIM_LOAD.CLOSE);
            await Utils.delay(this.animCom.clips.find(anim => anim.name == NAME_ANIM_LOAD.CLOSE).duration * 1000);
            this.animCom.play(NAME_ANIM_LOAD.IDLE);
        })();
        (async () => {
            this.animCom_decorate.play(NAME_ANIM_DECORATE.CLOSE);
            await Utils.delay(this.animCom_decorate.clips.find(anim => anim.name == NAME_ANIM_DECORATE.CLOSE).duration * 1000);
            this.animCom_decorate.play(NAME_ANIM_DECORATE.IDLE);
        })();
        await Utils.delay(this.animCom.clips.find(anim => anim.name == NAME_ANIM_LOAD.CLOSE).duration * 1000);
        this.nBlockInput.active = false;
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TRANSITIONS_TURN_OFF);
        this._isLoading = false;
    }


    async changeMatReverse_2(index) {
        // prepare anim
        this._isLoading = false;
        this.stopTweenBlockLoading();

        // //===================================================== Way 1 =====================================================
        // // anim
        // for (let i = this.nParentNBlack.children.length - 1; i >= 0; i--) {
        //     const nBlack: Sprite = this.nParentNBlack.children[i].getComponent(Sprite);
        //     tween(nBlack)
        //         .to(this.speed, { fillRange: 0 }, { easing: 'smooth' })
        //         .start();
        //     await Utils.delay(this.delayEachFrame * 1000);
        // }
        // await Utils.delay(this.speed * 1000);

        // // after anim done
        // this.nBlockInput.active = false;
        // this._isLoading = false;
        // director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_OFF_WITH_OUT_CHANGE_SCENE);

        //===================================================== Way 2 =====================================================
        // let start = { num: 0 };
        // let end = { num: 255 };
        // const sp = this.sp;
        // const color = new Color(0, 0, 0);
        // sp.color = color;
        // // const mat = Utils.randomValueOfList(this.mats);
        // // sp.material = mat;
        // tween(start)
        //     .delay(0.0016)
        //     .to(this.timeTransitionDefault, end, {
        //         onUpdate(target: any, ratio: number) {
        //             color.r = target.num;
        //             color.a = (255 * (1 - ratio));
        //             sp.color = color;
        //         },
        //     })
        //     .call(() => {
        //         // block UI
        //         this.nBlockInput.active = false;
        //         director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_OFF_WITH_OUT_CHANGE_SCENE);
        //         this._isLoading = false;
        //     })
        //     .start();

        //===================================================== Way 3 =====================================================
        // if (this.tweenOpacity) this.tweenOpacity.stop();
        // this.tweenOpacity = tween(this.uiOpacity).to(this.timeTransitionDefault, { opacity: 0 }, { easing: 'smooth' }).call(() => {
        //     //block UI
        //     this.nBlockInput.active = false;
        //     director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_OFF_WITH_OUT_CHANGE_SCENE);
        //     this._isLoading = false;
        // }).start();

        //======================================= WAY 4 ==========================================
        (async () => {
            this.animCom.play(NAME_ANIM_LOAD.CLOSE);
            await Utils.delay(this.animCom.clips.find(anim => anim.name == NAME_ANIM_LOAD.CLOSE).duration * 1000);
            this.animCom.play(NAME_ANIM_LOAD.IDLE);
        })();
        (async () => {
            this.animCom_decorate.play(NAME_ANIM_DECORATE.CLOSE);
            await Utils.delay(this.animCom_decorate.clips.find(anim => anim.name == NAME_ANIM_DECORATE.CLOSE).duration * 1000);
            this.animCom_decorate.play(NAME_ANIM_DECORATE.IDLE);
        })();
        await Utils.delay(this.animCom.clips.find(anim => anim.name == NAME_ANIM_LOAD.CLOSE).duration * 1000);
        this.nBlockInput.active = false;
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_OFF_WITH_OUT_CHANGE_SCENE);
        this._isLoading = false;
    }

    private indexTest = 0;
    public TestTurnOn() {
        // if (this.indexTest == this.mats.length) {
        //     this.indexTest = 0;
        // }
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_ON);
        // this.indexTest++;
        // this.changeMat(0);
    }

    public TestTurnOff() {
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_OFF, this.indexTest);
    }


}


