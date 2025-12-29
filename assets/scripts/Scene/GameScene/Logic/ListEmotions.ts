import { _decorator, Component, instantiate, macro, Node, Pool, Prefab, randomRangeInt, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { MConfigs } from '../../../Configs/MConfigs';
import { Utils } from '../../../Utils/Utils';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { TYPE_EMOTIONS, TYPE_EMOTIONS_ANIM } from '../../../Utils/Types';
import { AnimEmojiSys } from '../../../AnimsPrefab/AnimEmojiSys';
import { M_ERROR } from '../../../Configs/MConfigError';
const { ccclass, property } = _decorator;

@ccclass('ListEmotions')
export class ListEmotions extends Component {
    public static Instance: ListEmotions = null;
    @property(Prefab) pfEmotion: Prefab;

    private _mapIdCbShowEmotions: Map<number, CallableFunction> = new Map();
    private _idAuto: number = 0; public GetIdCbAuto(): number { return this._idAuto++; }
    private _poolEmotions: Pool<Node> = null;

    protected onLoad(): void {
        if (ListEmotions.Instance == null) {
            ListEmotions.Instance = this;
            this._poolEmotions = new Pool(() => instantiate(this.pfEmotion), 0);
        }
    }

    protected onDisable(): void {
        ListEmotions.Instance = null;
        this.ResetAllShowEmotions();
    }

    public ResetAllShowEmotions() {
        this._mapIdCbShowEmotions.forEach((value, key) => this.unRegisterShowEmotions(key));
        this._mapIdCbShowEmotions = new Map();
    }

    public registerShowEmotions(cbShowEmotions: CallableFunction, timeShowEmotion: number, ...dataCustom: any): number {
        this.unschedule(cbShowEmotions);
        if (cbShowEmotions != null && !Utils.CheckMapHasValue(this._mapIdCbShowEmotions, cbShowEmotions)) {
            const idCB = this.GetIdCbAuto();
            // because can not send parameter to schedule
            const convertCb = () => { cbShowEmotions(...dataCustom); }
            this._mapIdCbShowEmotions.set(idCB, convertCb)
            this.schedule(convertCb, timeShowEmotion, macro.REPEAT_FOREVER, 0);
            return idCB;
        }

        return -1;
    }

    public unRegisterShowEmotions(idCb: number) {
        this.unschedule(this._mapIdCbShowEmotions.get(idCb));
    }

    private AnimEmotions(nEmotion: Node, path: string) {
        if (path == "") return;
        MConfigResourceUtils.GetImageEmotionsUntilLoad(path, (path: string, sf: SpriteFrame) => {
            try {
                nEmotion.getComponent(Sprite).spriteFrame = sf;
            } catch (e) {

            }
        })
        nEmotion.scale = Vec3.ZERO;
        nEmotion.position = Vec3.ZERO;
        nEmotion.active = true;

        // action for emotions
        tween(nEmotion)
            // anim show emotions
            .to(MConfigs.TIME_APPEAR_EMOTIONS, { scale: Vec3.ONE, position: new Vec3(0, MConfigs.DISTANCE_EMOTION_Y, 0) }, { easing: 'elasticOut' })
            // // anim angle emotions
            // .sequence(...listTween)
            // anime angle emotions
            .to(MConfigs.TIME_EACH_ANGER_EMOTION, { scale: new Vec3(1.2, 1.2, 1.2), angle: -30 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: Vec3.ONE, angle: 30 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: new Vec3(1.1, 1.1, 1.1), angle: -20 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: Vec3.ONE, angle: 20 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: new Vec3(1.1, 1.1, 1.1), angle: -10 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION * 2, { scale: Vec3.ONE, angle: 10 })
            .to(MConfigs.TIME_EACH_ANGER_EMOTION, { scale: Vec3.ZERO, angle: 0 })

            .call(() => {
                if (nEmotion != null && nEmotion.isValid)
                    nEmotion.getComponent(Sprite).spriteFrame = null;
            })
            .start();
    }

    private async AnimEmotions2(nSaveShowEmotion: Node, nameAnim: TYPE_EMOTIONS_ANIM) {
        try {
            // get node from pool
            const nEmotion = this._poolEmotions.alloc();
            // set to parent
            nEmotion.setParent(nSaveShowEmotion);
            nSaveShowEmotion.active = true;
            nEmotion.active = true;
            await nEmotion.getComponent(AnimEmojiSys).PlayAnimEmoji(nameAnim);
            nEmotion.active = false;
            nEmotion.setParent(this.node);
            nSaveShowEmotion.active = false;
            this._poolEmotions.free(nEmotion);
        } catch (e) {
            console.error(`#${M_ERROR.ERROR_EMOJI}`);
        }
    }


    public async ShowEmotionsOnPassenger(listNEmotions: Node[]) {
        // try {
        //     // random list passengers than emit event show emotions
        //     // const listPassenger: Node[] = Array.from(lineUpSys.GetListPassenger()).filter(passenger => !passenger.getComponent(PassengerSys).visualPassengerSys.IsShowVisualEmotion);
        //     let maxEmotions = MConfigs.MAX_EMOTION_SHOW;
        //     if (maxEmotions > listNEmotions.length) maxEmotions = listNEmotions.length;
        //     if (maxEmotions == 0) return;
        //     const listPassengerShowEmotions: Node[] = Utils.randomListValueOfList(MConfigs.MAX_EMOTION_SHOW, listNEmotions);
        //     // emit event
        //     for (let i = 0; i < listPassengerShowEmotions.length; i++) {
        //         const nEmotion = listPassengerShowEmotions[i];
        //         await Utils.delay(randomRangeInt(0, 1000));
        //         if (this == null || nEmotion == null) { return; }
        //         this.AnimEmotions(nEmotion, Utils.randomValueOfList(this.arrPathEmotions));
        //     }

        //     // check in case force change scene or someHow stop the game => not register show emotions
        //     if (this == null) { return; }
        // } catch (e) {
        //     console.log(e);
        // }

        try {
            // const maxEmoEnum = Utils.getLengthOfEnum(TYPE_EMOTIONS_ANIM);
            const maxEmoEnum = MConfigs.MAX_EMOTION_SHOW;
            let maxEmotions = maxEmoEnum
            if (maxEmotions > listNEmotions.length) maxEmotions = listNEmotions.length;
            if (maxEmotions == 0) return;
            const listPassengerShowEmotions: Node[] = Utils.randomListValueOfList(maxEmoEnum, listNEmotions);
            for (let i = 0; i < listPassengerShowEmotions.length; i++) {
                const nEmotion = listPassengerShowEmotions[i];
                await Utils.delay(randomRangeInt(0, 1000));
                if (this == null || nEmotion == null) { return; }
                this.AnimEmotions2(nEmotion, Utils.randomValueOfList(Utils.GetListValueEnum(TYPE_EMOTIONS_ANIM)))
            }

            if (this == null) { return; }
        } catch (e) {
            console.log(e);
        }
    }

    public ShowEmotionsOnCar(nEmotion: Node) {
        // let listEmotionHappyPaths: string[] = [TYPE_EMOTIONS.BIG_SMILE, TYPE_EMOTIONS.KISS];
        // this.AnimEmotions(nEmotion, Utils.randomValueOfList(listEmotionHappyPaths));

        let listTypeEmotionsAnim: TYPE_EMOTIONS_ANIM[] = [TYPE_EMOTIONS_ANIM.BIG_SMILE, TYPE_EMOTIONS_ANIM.KISS];
        this.AnimEmotions(nEmotion, Utils.randomValueOfList(listTypeEmotionsAnim));
    }
}


