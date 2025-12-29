import { _decorator, Color, Component, easing, ITweenOption, Label, Node, random, randomRangeInt, Sprite, tween, Tween, TweenEasing, Vec3 } from 'cc';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('SRProgressSys')
export class SRProgressSys extends Component {
    @property(Node) nBig: Node;
    @property(Label) lbBig: Label;
    @property(Node) nBaseNode: Node[] = [];

    private readonly _speedMove: number = 300;
    private readonly _maxScale: Vec3 = new Vec3(1.2, 1.2, 1.2);
    private readonly _baseScale: Vec3 = new Vec3(1, 1, 1);
    private readonly _maxFontScale: number = 45;
    private readonly _baseFontScale: number = 42;
    private readonly TIME_DELAY_WARNING_CHANGE_COLOR: number = 0.3
    private _indexNow: number = 0;

    private _colorWarning: Color = new Color().fromHEX("#FF5C5C");

    public SetBig(index: number, needTween: boolean = true) {
        if (index < 0 || index > this.nBaseNode.length - 1) return;

        this._indexNow = index;
        const basePosX = this.nBaseNode[index].position.x;
        this.nBig.position = new Vec3(basePosX, this.nBig.position.y);

        this.SetLbIndex(index, needTween);

        this.SetBaseUI()
    }

    public MoveToIndex(indexMoveTo: number) {
        const listTween = this.GetListTweenAnimMoveToIndex(indexMoveTo);
        if (listTween == null) { return; }

        // save
        this._indexNow = indexMoveTo;

        // anim
        tween(this.nBig)
            .sequence(...listTween)
            .start();
    }

    public StopAnim() {
        Tween.stopAllByTarget(this.nBig);
        Tween.stopAllByTarget(this.lbBig.node);
    }

    public MoveToIndexWithPromise(indexMoveTo: number) {
        const listTween = this.GetListTweenAnimMoveToIndex(indexMoveTo);
        if (listTween == null) { return; }

        // save
        this._indexNow = indexMoveTo;

        // anim
        return new Promise<void>(resolve => {
            tween(this.nBig)
                .sequence(...listTween)
                .call(() => { resolve() })
                .start();
        })
    }

    public async AnimWarning() {
        // B1 nháy màu sắc
        // đổi màu đỏ => đổi màu trắng => đổi màu đỏ
        // chỉ đổi đối vs những frame index < index now thôi
        this.nBaseNode.forEach((item, index) => { if (index < this._indexNow) item.getComponent(Sprite).color = this._colorWarning; });
        await Utils.delay(this.TIME_DELAY_WARNING_CHANGE_COLOR * 1000);
        this.nBaseNode.forEach((item, index) => { if (index < this._indexNow) item.getComponent(Sprite).color = Color.WHITE; });
        await Utils.delay(this.TIME_DELAY_WARNING_CHANGE_COLOR * 1000);
        this.nBaseNode.forEach((item, index) => { if (index < this._indexNow) item.getComponent(Sprite).color = this._colorWarning; });
    }

    public GetTimeAnimWarning(): number {
        return this.TIME_DELAY_WARNING_CHANGE_COLOR * 2;
    }

    //==================================
    //#region self func
    private SetBaseUI(index: number = -1) {
        if (index < 0 || index >= this.nBaseNode.length) {
            this.nBaseNode.forEach(item => item.getComponent(Sprite).color = Color.WHITE);
        } else {
            this.nBaseNode[index].getComponent(Sprite).color = Color.WHITE;
        }
    }

    private GetListTweenAnimMoveToIndex(indexMoveTo: number) {
        // cách thức di chuyển đó là :  Có 3 giai đoạn
        // 1 : di chuyển từ điểm đầu đến mốc trung gian scale max
        // 2 : di chuyển đến mốc trung gian 
        // 3 : di chuyển đến điểm cuối từ mốc gần nhất scale về base

        if (indexMoveTo < 0 || indexMoveTo > this.nBaseNode.length - 1 || this._indexNow == indexMoveTo) return;

        let dataMove = this.GetAllPosBetween2Index(this._indexNow, indexMoveTo);
        if (dataMove == null) { console.error('somethingwrong'); return; }

        this.StopAnim();

        // prepare anim
        const self = this;
        let listIndexProgress: number[] = new Array(Math.abs(indexMoveTo - this._indexNow));
        for (let index = 0; index < listIndexProgress.length; index++) {
            listIndexProgress[index] = indexMoveTo > this._indexNow ? this._indexNow + index : this._indexNow - index - 1;
        }

        // list tween
        let listTween = []
        dataMove.listMidPos.forEach((pos, index) => {
            let tweenMove = tween(this.nBig)
                .call(() => {
                    self.SetLbIndex(listIndexProgress[index]);
                })
                .parallel(
                    tween().to(dataMove.listTimeMid[index], { position: pos, scale: this._maxScale }),
                    tween().delay(dataMove.listTimeMid[index] / 2).call(() => { self.SetBaseUI(listIndexProgress[index] + 1) }),
                )
            listTween.push(tweenMove);
        })

        // add move to end
        listTween.push(tween(this.nBig)
            .call(() => {
                self.SetLbIndex(indexMoveTo);
            })
            .parallel(
                tween().delay(dataMove.timeMoveEnd / 2).call(() => { self.SetBaseUI(indexMoveTo + 1) }),
                tween().to(dataMove.timeMoveEnd, { position: dataMove.ePos, scale: this._maxScale })
            )
            .call(() => { self.SetBaseUI(indexMoveTo) })
        );

        return listTween;
    }

    private GetAllPosBetween2Index(indexStart: number, indexEnd: number): { sPos: Vec3, listMidPos: Vec3[], listTimeMid: number[], timeMoveEnd: number, ePos: Vec3 } {
        let isFromLeftToRight = indexStart < indexEnd;
        const distanceIndex = Math.abs(indexStart - indexEnd);
        let posStart: Vec3 = this.nBaseNode[indexStart].position.clone();
        let posEnd: Vec3 = this.nBaseNode[indexEnd].position.clone();

        switch (true) {
            case distanceIndex == 0:
                return null;
            case distanceIndex >= 1:
                let resultMidPos = [];
                let resultTime = [];

                for (let i = 1; i <= distanceIndex; i++) {
                    let indexNext = (isFromLeftToRight ? indexStart : indexEnd) + i;
                    const NMid_1 = this.nBaseNode[indexNext - 1];
                    const NMid_2 = this.nBaseNode[indexNext];
                    const posMidCheck = NMid_1.position.clone().add(NMid_2.position.clone()).multiply3f(0.5, 1, 1);
                    resultMidPos.push(posMidCheck);

                    let timeMoveTo: number = 0;
                    if (i > 1) {
                        // you need get index - 2 because the start from loop is from 1
                        let distance = Vec3.distance(posMidCheck, resultMidPos[resultMidPos.length - 2])
                        timeMoveTo = distance / this._speedMove / 2;
                        resultTime.push(timeMoveTo);
                    }
                }

                resultMidPos = isFromLeftToRight ? resultMidPos : resultMidPos.reverse();

                // add time move First
                let timeMoveFirst = Vec3.distance(posStart, resultMidPos[0]) / this._speedMove;
                resultTime.unshift(timeMoveFirst);

                // add timeLast
                let timeMoveLast = Vec3.distance(posEnd, resultMidPos[resultMidPos.length - 1]) / this._speedMove;

                return {
                    sPos: posStart.clone(),
                    listMidPos: resultMidPos,
                    listTimeMid: isFromLeftToRight ? resultTime : resultTime.reverse(),
                    timeMoveEnd: timeMoveLast,
                    ePos: posEnd.clone()
                }
        }
    }

    private SetLbIndex(index: number, needTween: boolean = true) {

        if (!needTween) {
            if (DataSpeedRace.Instance != null) {
                this.lbBig.string = `x${DataSpeedRace.Instance.GetMutiplyScoreSuitWithProgress(index)}`;
            } else {
                this.lbBig.string = `x${GetMutiplyScoreSuitWithProgress(index)}`;
            }
            return;
        }

        const timeChangeFont: number = 0.2;
        tween(this.lbBig)
            .to(timeChangeFont / 2, { fontSize: this._maxFontScale })
            .call(() => {
                if (DataSpeedRace.Instance != null) {
                    this.lbBig.string = `x${DataSpeedRace.Instance.GetMutiplyScoreSuitWithProgress(index)}`;
                } else {
                    this.lbBig.string = `x${GetMutiplyScoreSuitWithProgress(index)}`;
                }
            })
            .to(timeChangeFont / 2, { fontSize: this._baseFontScale })
            .start()
    }
    //#endregion self func
    //==================================

    //==================================
    //#region test
    private TestDefault() {
        new DataSpeedRace();
        this.SetBig(0);
    }

    private Test() {
        let randomIndex = randomRangeInt(0, this.nBaseNode.length);
        this.MoveToIndex(randomIndex);
    }
    //#endregion test
    //==================================
}

function GetMutiplyScoreSuitWithProgress(index: number): number {
    switch (index) {
        case 0: return 1;
        case 1: return 5;
        case 2: return 10;
        case 3: return 20;
        case 4: return 100;
    }
    return 0;
}