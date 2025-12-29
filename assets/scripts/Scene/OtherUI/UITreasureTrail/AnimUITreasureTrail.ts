/**
 * 
 * anhngoxitin01
 * Mon Aug 18 2025 08:56:33 GMT+0700 (Indochina Time)
 * AnimUITreasureTrail
 * db://assets/scripts/Scene/OtherUI/UITreasureTrail/AnimUITreasureTrail.ts
*
*/
import { _decorator, AnimationComponent, Component, Label, Node, randomRangeInt, tween, UIOpacity, Vec3 } from 'cc';
import { ListBotUITreasureTrail } from './ListBotUITreasureTrail';
import { CONFIG_TT } from './TypeTreasureTrail';
import { AvatarTT } from '../UITreasureTrailPrepare/AvatarTT';
import { Utils } from '../../../Utils/Utils';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
const { ccclass, property } = _decorator;

@ccclass('AnimUITreasureTrail')
export class AnimUITreasureTrail extends Component {
    @property(Node) nUITop_Normal: Node;
    @property(Node) nUITop_Failed: Node;
    @property(Node) nUIBottom_Failed: Node;
    @property(Node) nPosStone: Node;
    @property(Node) nPosWin: Node;
    @property(Node) nClickContinue: Node;
    @property(Label) lbLevel: Label;
    @property(Label) lbNumPlayerRemaining: Label;
    @property(Label) lbContentLose: Label;
    @property({ type: Node, tooltip: "hãy nhớ platform đc xếp ngược" }) listNPlatform: Node[] = [];
    @property(ListBotUITreasureTrail) listBotUITreasureTrail: ListBotUITreasureTrail;

    private _listPosBase: Vec3[] = [];

    private readonly CONTENT_LOSE_END_TIME: string = "The challenge is over.\nBetter luck next time.";
    private readonly CONTENT_LOSE_NORMAL: string = "You have failed the challenge.\nBetter luck next time."

    //==========================================
    //#region base
    protected onLoad(): void {
        if (this._listPosBase.length == 0) {
            this.listNPlatform.forEach(platform => {
                this._listPosBase.push(platform.position.clone());
            })
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private HidePlatformSuitStage(stage: number) {
        this.listNPlatform.forEach((nPlatform: Node, _index: number) => {
            nPlatform.active = true;
            nPlatform.position = this._listPosBase[_index].clone();
        });

        //hide the platform not use
        for (let i = 0; i < stage; i++) {
            this.listNPlatform[i].active = false;
        }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public GetWPosPlatform(stage: number): Vec3 {
        switch (stage) {
            case 0:
                return this.nPosStone.worldPosition.clone();
            case 1: case 2: case 3: case 4: case 5: case 6:
                return this.listNPlatform[stage].worldPosition.clone().add(CONFIG_TT.DIFF_POS_N_LIST_AND_PLATFORM);
            case 7:
                return this.nPosWin.worldPosition.clone();
        }
    }

    public SetInfoBase(stage: number, numBot: number) {
        // cập nhật lại ví trí của platform


        //hide the platform not use
        this.HidePlatformSuitStage(stage);

        this.lbLevel.string = `${stage}/${CONFIG_TT.LEVEL_PLAY}`;
        this.lbNumPlayerRemaining.string = `${numBot}/${CONFIG_TT.MAX_PLAYER_JOIN}`;
    }

    public PrepareShowUINormal() {
        this.nUITop_Failed.active = false;
        this.nClickContinue.active = false;
        this.nUIBottom_Failed.active = false;

        this.nUITop_Normal.active = true;
    }

    public PrepareShowUILose() {
        //hide the top normal
        this.nUITop_Normal.active = false;
        //show top lose and bottom failed and hide the click continue
        this.nUITop_Failed.active = true;
        this.nUIBottom_Failed.active = true;
        this.nClickContinue.active = false;

        // set content lose
        if (DataTreasureTrailSys.Instance.GetTimeDisplay() <= 0) {
            this.lbContentLose.string = this.CONTENT_LOSE_END_TIME;
        } else {
            this.lbContentLose.string = this.CONTENT_LOSE_NORMAL;
        }
    }

    public ShowUILose() {
        // show nClick continue
        this.nClickContinue.active = true;
    }

    public PrepareShowUIWin() {
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region anim
    public async AnimUINormal(stageBefore: number, stageNow: number, numBotNow: number, numBotAfterRemove: number, diffBotDown: number) {
        const self = this;
        //STUB - anim
        /**
         *  gọi hàm chạy anim của từng bot
        */
        const listNBot: Node[] = this.listBotUITreasureTrail.GetListBotShowing();

        //=============================================
        // init list pos
        const numBotShowing = listNBot.length > CONFIG_TT.NUM_BOT_LIMIT_SHOW_UI ? CONFIG_TT.NUM_BOT_LIMIT_SHOW_UI : listNBot.length;
        let listPosBot: Vec3[] = sunflowerPointsInEllipse(50, 20, numBotShowing);
        listPosBot = listPosBot.sort((a, b) => b.y - a.y);

        //=============================================
        // jump bot
        const totalTimeJump: number = 1.5;
        const timeDelayEachJump: number = totalTimeJump / numBotShowing;
        for (let i = numBotShowing - 1; i >= diffBotDown; i -= 1) {
            const comBotCheck = listNBot[i].getComponent(AvatarTT);
            const wPosToSetListOnPlatform = this.GetWPosPlatform(stageNow);
            const rightWPos = wPosToSetListOnPlatform.add(listPosBot[i])
            if (i == diffBotDown) {
                await comBotCheck.Jump(rightWPos);
            } else {
                comBotCheck.Jump(rightWPos);
                await Utils.delay(timeDelayEachJump * 1000);
            }
        }

        //=============================================
        // bot try jump and drop
        function randomPosDrop(numPos: number): Vec3[] {
            let result: Vec3[] = [];
            for (let i = 0; i < numPos; i++) {
                let x = randomRangeInt(300, 500) * (i % 2 == 0 ? - 1 : 1);
                let y = randomRangeInt(10, 50);
                result.push(new Vec3(x, y, 0));
            }
            return result;
        }
        const diffPosPlatformNowAndNext = this.GetWPosPlatform(stageNow).clone().subtract(this.GetWPosPlatform(stageBefore));
        let listPos: Vec3[] = [
            new Vec3(diffPosPlatformNowAndNext.x / 2, diffPosPlatformNowAndNext.y / 2 + randomRangeInt(0, 10)),
            new Vec3(diffPosPlatformNowAndNext.x / 2, diffPosPlatformNowAndNext.y / 2 + randomRangeInt(0, 10)),
        ]
        listPos.push(...randomPosDrop(diffBotDown - 2));

        const distanceTimeDrop: number = 0.2;
        for (let i = diffBotDown - 1; i >= 0; i--) {
            const comBotCheck = listNBot[i].getComponent(AvatarTT);
            const indexPos = diffBotDown - 1 - i;
            (async () => {
                const posMid = listPos[indexPos];
                await Utils.delay(distanceTimeDrop * indexPos * 1000);
                comBotCheck.Drop(indexPos, posMid);
            })();
        }

        if (diffBotDown >= 2) {
            await Utils.delay((distanceTimeDrop * 2) * 1000);
        }

        //=============================================
        let platformDrop: Node = this.listNPlatform[stageBefore];

        // để có thể để icon rơi cùng với platform ta sẽ cho nPlayer vào cùng với platform
        for (let i = 0; i < diffBotDown; i++) {
            const nBotCheck = listNBot[i];
            nBotCheck.setParent(platformDrop, true);
        }

        const timeAnimDrop = AnimPlatformDrop(platformDrop);
        const numBotReduce = numBotNow - numBotAfterRemove;
        // anim reduce the num player
        tween(this.lbNumPlayerRemaining.node)
            .to(timeAnimDrop, {}, {
                onUpdate(target, ratio) {
                    const numBotRemain = Math.floor(numBotNow - numBotReduce * ratio);
                    self.lbNumPlayerRemaining.string = `${numBotRemain}/100`;
                },
            })
            .call(() => { self.lbNumPlayerRemaining.string = `${numBotAfterRemove}/100`; })
            .start();

        // drop platform
        await Utils.delay(timeAnimDrop * 1000);

        // update the level
        this.lbLevel.string = `${stageNow > CONFIG_TT.LEVEL_PLAY ? CONFIG_TT.LEVEL_PLAY : stageNow}/7`;
    }

    public async AnimLose(stageBefore: number, stageNow: number, numBotNow: number, numBotAfterRemove: number, diffBotDown: number) {
        const self = this;

        /**!SECTION
         * Chúng ta sẽ diễn hoạt anim như sau:
         * diễn hoạt anim nhảy sang platform tiếp theo cho những đối tượng tính từ đối tượng đứng sau người chơi
         * làm rơi platform cũ bao gồm cả người chơi
         */

        const listNBot: Node[] = this.listBotUITreasureTrail.GetListBotShowing();

        //=============================================
        // init list pos
        const numBotShowing = listNBot.length > CONFIG_TT.NUM_BOT_LIMIT_SHOW_UI ? CONFIG_TT.NUM_BOT_LIMIT_SHOW_UI : listNBot.length;
        let listPosBot: Vec3[] = sunflowerPointsInEllipse(50, 20, numBotShowing);
        listPosBot = listPosBot.sort((a, b) => b.y - a.y);

        //=============================================
        // jump bot
        const totalTimeJump: number = 1.5;
        const timeDelayEachJump: number = totalTimeJump / numBotShowing;
        for (let i = numBotShowing - 2; i >= diffBotDown; i -= 1) {
            const comBotCheck = listNBot[i].getComponent(AvatarTT);
            const wPosToSetListOnPlatform = this.GetWPosPlatform(stageNow);
            const rightWPos = wPosToSetListOnPlatform.add(listPosBot[i])
            if (i == diffBotDown) {
                await comBotCheck.Jump(rightWPos);
            } else {
                comBotCheck.Jump(rightWPos);
                await Utils.delay(timeDelayEachJump * 1000);
            }
        }

        //=============================================
        // bot try jump and drop
        function randomPosDrop(numPos: number): Vec3[] {
            let result: Vec3[] = [];
            for (let i = 0; i < numPos; i++) {
                let x = randomRangeInt(300, 500) * (i % 2 == 0 ? - 1 : 1);
                let y = randomRangeInt(10, 50);
                result.push(new Vec3(x, y, 0));
            }
            return result;
        }
        const diffPosPlatformNowAndNext = this.GetWPosPlatform(stageNow).clone().subtract(this.GetWPosPlatform(stageBefore));
        let listPos: Vec3[] = [
            new Vec3(diffPosPlatformNowAndNext.x / 2, diffPosPlatformNowAndNext.y / 2 + randomRangeInt(0, 10)),
            new Vec3(diffPosPlatformNowAndNext.x / 2, diffPosPlatformNowAndNext.y / 2 + randomRangeInt(0, 10)),
        ]
        listPos.push(...randomPosDrop(diffBotDown - 1));

        const distanceTimeDrop: number = 0.2;

        // diễn hoạt player trước => sau đó mới diễn hoạt đến những user khác
        const comPlayer = listNBot[numBotShowing - 1].getComponent(AvatarTT);
        (async () => {
            const posMidPlayer = listPos[0];
            await Utils.delay(distanceTimeDrop * 0 * 1000);
            comPlayer.Drop(0, posMidPlayer);
        })();


        for (let i = diffBotDown - 1; i >= 0; i--) {
            const comBotCheck = listNBot[i].getComponent(AvatarTT);
            const indexPos = diffBotDown - 1 - i + 1;
            if (indexPos < 0 || indexPos == listNBot.length) { continue; }
            (async () => {
                const posMid = listPos[indexPos];
                await Utils.delay(distanceTimeDrop * indexPos * 1000);
                comBotCheck.Drop(indexPos, posMid);
            })();
        }

        if (diffBotDown >= 1) {
            await Utils.delay((distanceTimeDrop * 2) * 1000);
        }

        //=============================================
        let platformDrop: Node = this.listNPlatform[stageBefore];

        // để có thể để icon rơi cùng với platform ta sẽ cho nPlayer vào cùng với platform
        // add thêm cả player vào
        listNBot[numBotShowing - 1].setParent(platformDrop, true);
        for (let i = 0; i < diffBotDown; i++) {
            const nBotCheck = listNBot[i];
            nBotCheck.setParent(platformDrop, true);
        }

        const timeAnimDrop = AnimPlatformDrop(platformDrop);
        const numBotReduce = numBotNow - numBotAfterRemove + 1; // + 1 player
        // anim reduce the num player
        tween(this.lbNumPlayerRemaining.node)
            .to(timeAnimDrop, {}, {
                onUpdate(target, ratio) {
                    const numBotRemain = Math.floor(numBotNow - numBotReduce * ratio);
                    self.lbNumPlayerRemaining.string = `${numBotRemain}/100`;
                },
            })
            .call(() => { self.lbNumPlayerRemaining.string = `${numBotAfterRemove}/100`; })
            .start();

        // drop platform
        await Utils.delay(timeAnimDrop * 1000);
    }
    //#endregion anim
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================
}

const SPEED_DROP_PLATFORM = 300;
const TIME_DROP_PLATFORM = 0.7;
function AnimPlatformDrop(nPlatform: Node): number {
    if (nPlatform == null) { return TIME_DROP_PLATFORM; }
    const diffY = nPlatform.worldPosition.y;
    const wPosResult: Vec3 = new Vec3(nPlatform.worldPosition.x, -500, 0);
    const timeMove = TIME_DROP_PLATFORM;
    tween(nPlatform)
        .to(timeMove, { worldPosition: wPosResult }, {})
        .call(() => { nPlatform.active = false; })
        .start();
    return timeMove;
}

/**
 * Generates N evenly distributed random points within an ellipse using the sunflower algorithm.
 * @param radiusX The horizontal radius of the ellipse.
 * @param radiusY The vertical radius of the ellipse.
 * @param count The number of points to generate.
 * @returns An array of Vec3 positions.
 */
function sunflowerPointsInEllipse(radiusX: number, radiusY: number, count: number): Vec3[] {
    const points: Vec3[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
        const r = Math.sqrt(i + 0.5) / Math.sqrt(count);
        const theta = i * goldenAngle;
        const x = radiusX * r * Math.cos(theta);
        const y = radiusY * r * Math.sin(theta);
        points.push(new Vec3(x, y, 0));
    }
    return points;
}