import { _decorator, Component, instantiate, Node, tween, UITransform, Vec3, Tween, randomRange, UIOpacity, ITweenOption, TweenEasing, Color, Sprite, Label, Size, RealCurve } from 'cc';
import { Utils } from './Utils';
import { Bezier } from '../framework/Bezier';
const { ccclass, property } = _decorator;

@ccclass('AniTweenSys')
export class AniTweenSys extends Component {
    public static async PlaySystemAnimation(funcAnimation: Promise<void>) {
        // show bg block
        // GameUISys.Instance.ShowBgBlockGame();
        // play animation
        await funcAnimation;
        // wait callback to hide bg block
        // GameUISys.Instance.HideBgBlockGame();
    }

    public static baseScale(_target: Node, _scale: Vec3 = new Vec3(1, 1, 1), _timeScale: number = 0.1) {
        _target.active = true;
        return new Promise<void>(resolve => {
            tween(_target)
                .to(_timeScale, { scale: _scale }, { easing: 'circIn' })
                .call(() => { resolve(); })
                .start();
        });
    }

    public static doubleScale(_target: Node, _scale: Vec3 = new Vec3(1.2, 1.2, 1.2), _timeScale: number = 0.5, callbackReachScale: CallableFunction = null) {
        Tween.stopAllByTarget(_target);
        // this.visualStar.scale = Vec3.ONE;
        tween(_target)
            .to(_timeScale / 2, { scale: _scale }, { easing: 'linear' })
            .call(() => {
                if (callbackReachScale != null) {
                    callbackReachScale();
                }
            })
            .to(_timeScale / 2, { scale: new Vec3(1, 1, 1) }, { easing: 'linear' })
            .union()
            .repeat(2)
            .start();
    }

    public static rotateForever(_target: Node, _speed: number, _eulerAngles: Vec3 = new Vec3(0, 0, -90)) {
        this.StopTween(_target);

        tween(_target)
            .by(_speed, { eulerAngles: _eulerAngles }, {
                easing: 'linear', onComplete: () => {

                }
            }).repeatForever().start();
    }

    public static async scaleBubble(_target: Node, _timeScale1: number = 0.25, _timeScale2: number = 0.05,
        _scale1: Vec3 = new Vec3(1.2, 1.2, 1.2), _scale2: Vec3 = Vec3.ONE,
        usingOpacity: boolean = false, increaseOpacity: boolean = true, cbIncreaseMax: CallableFunction = null) {
        if (usingOpacity) { _target.getComponent(UIOpacity).opacity = increaseOpacity ? 0 : 255; }

        await new Promise<void>(resolve => {
            tween(_target)
                .to(_timeScale1, { scale: _scale1 }, {
                    onUpdate(target, ratio) {
                        if (usingOpacity) {
                            _target.getComponent(UIOpacity).opacity = increaseOpacity ? ratio * 255 : (1 - ratio) * 255;
                        }
                    },
                })
                .call(() => { cbIncreaseMax && cbIncreaseMax(); })
                .to(_timeScale2, { scale: _scale2 })
                .call(() => { resolve(); })
                .start();
        });
    }

    public static async moveLoop(_target: Node, _startWPos: Vec3, _endWPos: Vec3, _timeMove1: number, _timeMove2: number) {
        // first set object to position
        _target.setWorldPosition(_startWPos);

        tween(_target)
            .sequence(
                tween().to(_timeMove1, { position: _endWPos }),
                tween().to(_timeMove2, { position: _startWPos })
            )
            .repeatForever()
            .start();
    }

    public static ShowHeader(_target: Node) {
        let sizeHeight = _target.getComponent(UITransform).height;
        let locYTargetBase = _target.position.y;
        _target.position = new Vec3(0, locYTargetBase + sizeHeight);
        _target.active = true;

        tween(_target).to(0.3, { position: new Vec3(0, locYTargetBase) }).start();
    }

    public static MoveTo(_target: Node, wLocStart: Vec3, wLocEnd: Vec3, timeMoveTo?: number) {
        _target.worldPosition = wLocStart;
        _target.active = true;

        return new Promise<void>(resolve => {
            tween(_target)
                .to(timeMoveTo == null ? 0.3 : timeMoveTo, { worldPosition: wLocEnd })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    /**
     * this func will tween move to with opacity and set the object to the start pos after tween
     * @param _target 
     * @param wLocStart 
     * @param wLocEnd 
     * @param timeMoveTo 
     * @param inOrDecOpacity true : increase | false : decrease
     * @param resetObjStartPos true : set the object to the start pos after tween
     * @returns 
     */
    public static MoveToWithOpacity(_target: Node, wLocStart: Vec3, wLocEnd: Vec3, timeMoveTo: number = 0.3, inOrDecOpacity: boolean = true, resetObjStartPos: boolean = true) {
        if (_target.getComponent(UIOpacity) == null) { return; }
        _target.worldPosition = wLocStart;
        _target.active = true;
        let opacityComponent = _target.addComponent(UIOpacity);
        opacityComponent.opacity = inOrDecOpacity ? 0 : 255;
        let numberRadio = inOrDecOpacity ? 0 : 1;

        return new Promise<void>(resolve => {
            tween(_target)
                .to(timeMoveTo, { worldPosition: wLocEnd }, {
                    onUpdate(target, ratio) {
                        opacityComponent.opacity = Math.abs(numberRadio - ratio) * 255;
                    }
                })
                .call(() => {
                    // reset the wloc
                    if (resetObjStartPos) {
                        _target.worldPosition = wLocStart;
                    }
                    resolve();
                })
                .start();
        });
    }

    public static ZoomAndShakeItOff(_target: Node, scale: Vec3, timeScale?: number, timeShake?: number) {
        _target.active = true;
        return new Promise<void>(resolve => {
            tween(_target)
                .parallel(
                    tween().to(timeScale == null ? 0.1 : timeScale, { scale: scale }),
                    tween()
                        .to(timeShake == null ? 0.05 : timeShake / 2, { eulerAngles: new Vec3(0, 0, 10) })
                        .to(timeShake == null ? 0.05 : timeShake / 2, { eulerAngles: new Vec3(0, 0, -10) })
                )
                .parallel(
                    tween().to(timeScale == null ? 0.1 : timeShake, { scale: Vec3.ONE }),
                    tween()
                        .to(timeShake == null ? 0.05 : timeShake / 2, { eulerAngles: new Vec3(0, 0, 10) })
                        .to(timeShake == null ? 0.05 : timeShake / 2, { eulerAngles: new Vec3(0, 0, -10) })
                )
                .to(0.05, { eulerAngles: new Vec3(0, 0, 0) })
                .call(() => { resolve(); })
                .start();
        });
    }

    /**
     * remmeber this tween include change color to red
     * @param _target 
     * @param scale 
     * @param timeScale 
     * @returns 
     */
    public static ZoomByHeart(_target: Node, scale: Vec3, changeColor: boolean = true, timeScale?: number) {
        _target.active = true;
        return new Promise<void>(resolve => {
            tween(_target)
                .to(timeScale == null ? 0.75 : timeScale, { scale: new Vec3(1.2, 1.2, 1.2) }, {
                    easing: 'bounceIn', onUpdate(target, ratio) {
                        // if (changeColor)
                        // _target.getComponent(DiceSys).spDice.color = new Color().set(255, (1 - ratio) * 255, (1 - ratio) * 255, 255);
                    },
                })
                .call(() => { resolve(); })
                .start();
        });
    }

    public static ShakeItOff(_target: Node, timeShake?: number) {
        _target.active = true;
        return new Promise<void>(resolve => {
            tween(_target)
                .to(timeShake == null ? 0.05 : timeShake / 4, { eulerAngles: new Vec3(0, 0, 10) })
                .to(timeShake == null ? 0.05 : timeShake / 4, { eulerAngles: new Vec3(0, 0, -10) })
                .to(timeShake == null ? 0.05 : timeShake / 4, { eulerAngles: new Vec3(0, 0, 10) })
                .to(timeShake == null ? 0.05 : timeShake / 4, { eulerAngles: new Vec3(0, 0, -10) })
                .to(0.05, { eulerAngles: new Vec3(0, 0, 0) })
                .call(() => { resolve(); })
                .start();
        });
    }

    public static async SpawnNodeAndMoveTo(_target: Node, parent: Node, wLocEnd?: Vec3, numberSpawn?: number
        , timeDelayAfterSpawn: number = 0.3, speedMoveToEnd: number = 0.5, speedMoveToLocSpawn: number = 0.1, cb: CallableFunction = () => { }) {
        // init more node
        // random loc around the node
        // set all the items to move the loc end one by one

        let listItem = [];
        let locSpawn = _target.getWorldPosition();

        // init more node
        for (let i = 0; i < numberSpawn; i++) {
            let node = instantiate(_target);
            node.setParent(parent);
            node.worldPosition = locSpawn;
            listItem.push(node);
        }

        // first tween to spwan loc
        listItem.forEach(element => {
            let wLoc = Utils.RandomPosInARound(locSpawn);
            tween(element).to(speedMoveToLocSpawn, { worldPosition: new Vec3(wLoc.x, wLoc.y, 0) }).start();
        });



        // tween move to the pos end
        for (let i = 0; i < listItem.length; i++) {
            let child = listItem[i];
            if (i == listItem.length - 1) {
                await new Promise<void>((resolve, reject) => {
                    tween(child)
                        .delay(timeDelayAfterSpawn)
                        .to(speedMoveToEnd, { worldPosition: wLocEnd })
                        .call(() => {
                            child.destroy();
                            cb();
                            resolve();
                        })
                        .start();
                });
            } else {
                tween(child)
                    .delay(timeDelayAfterSpawn)
                    .to(speedMoveToEnd, { worldPosition: wLocEnd })
                    .call(() => {
                        child.destroy();
                    })
                    .start();
            }
        }
    }

    public static async SpawnNodeAndMoveTo2(locSpawn: Vec3, getObjPool: CallableFunction, reUseObj: CallableFunction, wLocEnd?: Vec3, numberSpawn?: number
        , timeDelayAfterSpawn: number = 0.3, speedMoveToEnd: number = 0.5, speedMoveToLocSpawn: number = 0.1, cb: CallableFunction = () => { }) {
        // init more node
        // random loc around the node
        // set all the items to move the loc end one by one

        let listItem = [];

        // init more node
        for (let i = 0; i < numberSpawn; i++) {
            let node: Node = getObjPool();
            node.active = true;
            node.worldPosition = locSpawn;
            listItem.push(node);
        }

        // first tween to spawn loc
        listItem.forEach(element => {
            let wLoc = Utils.RandomPosInARound(locSpawn);
            tween(element).to(speedMoveToLocSpawn, { worldPosition: new Vec3(wLoc.x, wLoc.y, 0) }).start();
        });



        // tween move to the pos end
        for (let i = 0; i < listItem.length; i++) {
            let child = listItem[i];
            if (i == listItem.length - 1) {
                await new Promise<void>((resolve, reject) => {
                    tween(child)
                        .delay(timeDelayAfterSpawn)
                        .to(speedMoveToEnd, { worldPosition: wLocEnd })
                        .call(() => {
                            reUseObj(child);
                            cb();
                            resolve();
                        })
                        .start();
                });
            } else {
                tween(child)
                    .delay(timeDelayAfterSpawn)
                    .to(speedMoveToEnd, { worldPosition: wLocEnd })
                    .call(() => {
                        reUseObj(child);
                    })
                    .start();
            }
        }
    }

    public static ShakeInfinity(_target: Node, speed: number = 0.05, eulerAngles: Vec3 = new Vec3(0, 0, 10)) {
        this.StopTween(_target);
        tween(_target)
            .by(speed, { eulerAngles: eulerAngles.clone() })
            .call(() => {
                tween(_target)
                    .by(0.1, { eulerAngles: eulerAngles.clone().multiplyScalar(-2) })
                    .by(0.1, { eulerAngles: eulerAngles.clone().multiplyScalar(2) })
                    .union()
                    .repeatForever()
                    .start();
            })
            .start();
    }

    public static Apear(_target: Node, easingCustom: TweenEasing = 'smooth') {
        _target.scale = Vec3.ZERO;
        _target.angle = -90;
        _target.active = true;
        return new Promise<void>(resolve => {
            tween(_target)
                .to(0.5, { scale: new Vec3(1.1, 1.1, 1.1), angle: 0 }, { easing: easingCustom })
                .to(0.2, { scale: Vec3.ONE })
                .call(resolve)
                .start();
        });
    }

    public static Scale(_target: Node, scale: Vec3, time?: number, easing?: TweenEasing, cbOnUpdate: CallableFunction = null) {
        // not stop tween here because dice can 'lac dit' when you scale check can merge
        _target.active = true;
        Tween.stopAllByTarget(_target);

        return new Promise<void>(resolve => {
            tween(_target)
                .to(time == null ? 0.3 : time, { scale: scale }, {
                    easing: easing == null ? 'linear' : easing, onUpdate(target, ratio) {
                        cbOnUpdate != null && cbOnUpdate(ratio);
                    },
                })
                .call(resolve)
                .start();
        });
    }

    public static TweenScoreApearAndFlyUp(_target: Node, wPosStart: Vec3) {
        this.StopTween(_target);
        _target.worldPosition = wPosStart.clone();
        _target.scale = Vec3.ZERO;
        _target.active = true;

        return new Promise<void>(resolve => {
            tween(_target)
                .to(0.3, { scale: Vec3.ONE }, { easing: 'smooth' })
                .delay(0.2)
                .to(0.4, { worldPosition: new Vec3(wPosStart.x, wPosStart.y + 100, wPosStart.z) })
                .to(0.1, { scale: new Vec3(0.5, 0.5, 0.5) }, { easing: 'smooth' })
                .call(() => { _target.active = false; resolve(); })
                .start();
        });
    }

    public static TweenShowPopUp(_target: Node, timweTween?: number): Promise<void> {
        this.StopTween(_target);
        const uiOpacity = _target.getComponent(UIOpacity);
        uiOpacity.opacity = 0;
        _target.scale = Vec3.ZERO;
        _target.active = true;
        let time = timweTween == null ? 0.3 : timweTween;

        return new Promise<void>(resolve => {
            tween(_target)
                .to(time, { scale: Vec3.ONE }, {
                    easing: 'backOut',
                    onUpdate(target, ratio) {
                        uiOpacity.opacity = ratio * 255;
                    },
                })
                .call(() => { resolve(); })
                .start();
        });


    }

    public static repeateChangeBetweenTwoColors(_target: Node, colorStart: Color = Color.WHITE, colorEnd: Color = Color.RED, timeRepeatChangeColor: number = 1) {
        _target.active = true;

        _target.getComponent(Sprite).color = colorStart;

        tween(_target)
            .by(timeRepeatChangeColor / 2, {}, { onUpdate: (target, ratio) => { _target.getComponent(Sprite).color = colorStart.clone().lerp(colorEnd, ratio); } })
            .by(timeRepeatChangeColor / 2, {}, { onUpdate: (target, ratio) => { _target.getComponent(Sprite).color = colorEnd.clone().lerp(colorStart, ratio); } })
            .union()
            .repeatForever()
            .start();
    }

    public static scaleBtnToImpress(_target: Node, timeScale: number = 0.75, timeDelay: number = 0.3, scaleStart: Vec3 = Vec3.ONE, scaleEnd: Vec3 = new Vec3(1.1, 1.1, 1.1)) {
        _target.active = true;
        _target.scale = scaleStart;

        tween(_target)
            .to(timeScale, { scale: scaleEnd })
            .to(timeScale, { scale: scaleStart })
            .delay(timeDelay)
            .union()
            .repeatForever()
            .start();
    }

    public static TweenToListVec3(_target: Node, wPos: Vec3[], time: number = 1, scaleStart: Vec3 = Vec3.ZERO, scaleEnd: Vec3 = Vec3.ONE, cbWhenMoveEnd: CallableFunction = null) {
        let listCommandTween: Tween<Node>[] = [];
        for (let i = 0; i < wPos.length; i++) {
            const timePlayerTween = time / wPos.length + 0.01 * (i - wPos.length / 2);
            const scaleEachPhase: Vec3 = scaleStart.clone().lerp(scaleEnd, i / (wPos.length - 1));
            let commandTween = tween(_target)
                .to(timePlayerTween, { worldPosition: wPos[i], scale: scaleEachPhase })
                .call(() => {
                    if (cbWhenMoveEnd != null) cbWhenMoveEnd(i);
                })
            // .delay(0.2);
            listCommandTween.push(commandTween);
        }

        _target.scale = scaleStart;
        return new Promise<void>(resolve => {
            tween(_target)
                .sequence(...listCommandTween)
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    public static TweenToListVec3_2(_target: Node, wPos: Vec3[], time: number = 1) {
        let listCommandTween: Tween<Node>[] = [];
        for (let i = 0; i < wPos.length; i++) {
            const timePlayerTween = time / wPos.length;
            let commandTween = tween(_target)
                .to(timePlayerTween, { worldPosition: wPos[i] })
            listCommandTween.push(commandTween);
        }

        return new Promise<void>(resolve => {
            tween(_target)
                .sequence(...listCommandTween)
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    public static TweenToListVec3_3(_target: Node, lPos: Vec3[], time: number = 1) {
        let listCommandTween: Tween<Node>[] = [];
        for (let i = 0; i < lPos.length; i++) {
            const timePlayerTween = time / lPos.length;
            let commandTween = tween(_target)
                .to(timePlayerTween, { position: lPos[i] })
            listCommandTween.push(commandTween);
        }

        return new Promise<void>(resolve => {
            tween(_target)
                .sequence(...listCommandTween)
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    public static TweenToListVec3_4(_target: Node, wPos: Vec3[], angle: number[], time: number = 1) {
        let listCommandTween: Tween<Node>[] = [];
        for (let i = 0; i < wPos.length; i++) {
            const timePlayerTween = time / wPos.length;
            let commandTween = tween(_target)
                .to(timePlayerTween, { worldPosition: wPos[i], angle: angle[i] })
            listCommandTween.push(commandTween);
        }

        return new Promise<void>(resolve => {
            tween(_target)
                .sequence(...listCommandTween)
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    public static TweenToListVec3_5(_target: Node, lPos: Vec3[], time: number = 1) {
        let listCommandTween: Tween<Node>[] = [];
        for (let i = 0; i < lPos.length; i++) {
            const timePlayerTween = time / lPos.length;
            let commandTween = tween(_target)
                .to(timePlayerTween, { position: lPos[i] })
            listCommandTween.push(commandTween);
        }

        tween(_target)
            .sequence(...listCommandTween)
            .union()
            .repeatForever()
            .start();
    }

    public static TweenToListVec3_6(_target: Node, wPos: Vec3[], angle: number[], listTime: number[],
        cbEachFrame: CallableFunction) {
        let listCommandTween: Tween<Node>[] = [];
        const indexMid: number = Math.round(wPos.length / 2);
        for (let i = 0; i < wPos.length; i++) {

            let timeMove = listTime[i];

            let commandTween: Tween<Node> = null;
            if (i < indexMid) {
                commandTween = tween(_target)
                    .to(timeMove, { worldPosition: wPos[i], angle: angle[i] })
                    .call(() => { cbEachFrame(i) });
            }
            if (i == indexMid) {
                commandTween = tween(_target)
                    .to(timeMove, { worldPosition: wPos[i], angle: angle[i] })
                    .call(() => { cbEachFrame(i) });
            } else {
                commandTween = tween(_target)
                    .to(timeMove, { worldPosition: wPos[i], angle: angle[i] })
                    .call(() => { cbEachFrame(i) });
            }
            // commandTween.delay(1);
            listCommandTween.push(commandTween);
        }

        return new Promise<void>(resolve => {
            tween(_target)
                .sequence(...listCommandTween)
                .call(() => { resolve() })
                .start();
        });
    }

    public static TweenToListVec3_7(_target: Node, pos: Vec3[], angle: number[], listTime: number[],
        cbEachFrame: CallableFunction) {
        let listCommandTween: Tween<Node>[] = [];
        const indexMid: number = Math.round(pos.length / 2);
        for (let i = 0; i < pos.length; i++) {

            let timeMove = listTime[i];

            let commandTween: Tween<Node> = null;
            if (i < indexMid) {
                commandTween = tween(_target)
                    .to(timeMove, { position: pos[i], angle: angle[i] })
                    .call(() => { cbEachFrame(i) });
            }
            if (i == indexMid) {
                commandTween = tween(_target)
                    .to(timeMove, { position: pos[i], angle: angle[i] })
                    .call(() => { cbEachFrame(i) });
            } else {
                commandTween = tween(_target)
                    .to(timeMove, { position: pos[i], angle: angle[i] })
                    .call(() => { cbEachFrame(i) });
            }
            // commandTween.delay(1);
            listCommandTween.push(commandTween);
        }

        return new Promise<void>(resolve => {
            tween(_target)
                .sequence(...listCommandTween)
                .call(() => { resolve() })
                .start();
        });
    }

    public static TweenToListVec3_8(_target: Node, wPos: Vec3[], time: number = 1, scaleStart: Vec3 = Vec3.ZERO, scaleEnd: Vec3 = Vec3.ONE, cbWhenMoveEnd: CallableFunction = null) {
        let listCommandTween: Tween<Node>[] = [];
        for (let i = 0; i < wPos.length; i++) {
            const timePlayerTween = time / wPos.length - 0.01 * (i - wPos.length / 2);
            const scaleEachPhase: Vec3 = scaleStart.clone().lerp(scaleEnd, i / (wPos.length - 1));
            let commandTween = tween(_target)
                .to(timePlayerTween, { worldPosition: wPos[i], scale: scaleEachPhase })
                .call(() => {
                    if (cbWhenMoveEnd != null) cbWhenMoveEnd(i);
                })
            // .delay(0.2);
            listCommandTween.push(commandTween);
        }

        _target.scale = scaleStart;
        return new Promise<void>(resolve => {
            tween(_target)
                .sequence(...listCommandTween)
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    public static async BouncingNodeRandom(_target: Node, distanceWidth: number, distanceHeight: number, totalTimeBouncing,
        wPosStart: Vec3, LeftOrRight: boolean = true,
    ) {
        let wPosMid1 = wPosStart.clone().add3f(distanceWidth * (LeftOrRight ? -1 : 1), distanceHeight, 0);
        let wPosEnd1 = wPosStart.clone().add3f(distanceWidth * 2 * (LeftOrRight ? -1 : 1), 0, 0);
        let wPosMid2 = wPosStart.clone().add3f((distanceWidth * 2 + distanceWidth / 4) * (LeftOrRight ? -1 : 1), distanceHeight * 3 / 5, 0);
        let wPosEnd2 = wPosStart.clone().add3f(distanceWidth * 5 / 2 * (LeftOrRight ? -1 : 1), 0, 0);

        // get all Vec3 bouncing 1
        let listVec3Bouncing1 = Bezier.GetListPointsToTween3(10, wPosStart, wPosMid1, wPosEnd1);
        let listVec3Bouncing2 = Bezier.GetListPointsToTween3(10, wPosEnd1, wPosMid2, wPosEnd2);

        let totalList = [];
        totalList.push(...listVec3Bouncing1);
        totalList.push(...listVec3Bouncing2);
        await AniTweenSys.TweenToListVec3_2(_target, totalList, totalTimeBouncing);
    }

    public static GenListPosNodeForMove(p0: Vec3, p3: Vec3): Vec3[] {
        let result: Vec3[] = [];
        const sizeWindow: Size = Utils.getSizeWindow();

        const trueScale: number = Utils.getRightScaleSizeWindow();
        const widthScreen = Utils.getSizeDefault().width * trueScale;
        let p1 = new Vec3((sizeWindow.width - widthScreen) / 2, sizeWindow.y, 0);
        let p2 = new Vec3((sizeWindow.width - widthScreen) / 2 + widthScreen, sizeWindow.y, 0);
        result.push(p0, p1, p2, p3);
        return result;
    }

    public static StopTween(_target: Node) {
        Tween.stopAllByTarget(_target);
    }

    public static playAnimWarningText(_target: Label, timeAnim: number = 1) {
        // scale a little , and then scale normal
        // change color
        Tween.stopAllByTarget(_target.node);
        const timePhase = (timeAnim - 0.2) / 2;

        tween(_target.node)
            .delay(0.1)
            .to(timePhase, { scale: new Vec3(1.1, 1.1, 1.1) }, {
                onUpdate(target, ratio) {
                    const colorRB = (1 - ratio) * 255;
                    _target.color = new Color(255, colorRB, colorRB);
                },
            })
            .to(timePhase, { scale: Vec3.ONE }, {
                onUpdate(target, ratio) {
                    const colorRB = ratio * 255;
                    _target.color = new Color(255, colorRB, colorRB);
                },
            })
            .delay(0.1)
            .start();
    }

    public static playAnimGreeningText(_target: Label, timeAnim: number = 1) {
        // scale a little , and then scale normal
        // change color
        Tween.stopAllByTarget(_target.node);
        const timePhase = (timeAnim - 0.2) / 2;

        tween(_target.node)
            .delay(0.1)
            .to(timePhase, { scale: new Vec3(1.1, 1.1, 1.1) }, {
                onUpdate(target, ratio) {
                    const colorRB = (1 - ratio) * 255;
                    _target.color = new Color(colorRB, 255, colorRB);
                },
            })
            .to(timePhase, { scale: Vec3.ONE }, {
                onUpdate(target, ratio) {
                    const colorRB = ratio * 255;
                    _target.color = new Color(colorRB, 255, colorRB);
                },
            })
            .delay(0.1)
            .start();
    }


    public static sampleParam_playAnimPopUpItemUpper() {
        return {

        }
    }
    public static playAnimPopUpItemUpper(_target: Node, wPosRoot: Vec3, nParent: Node = null, cbPlaySound?: CallableFunction,
        paramSetUp: param_playAnimPopUpItemUpper = defaultParam_playAnimPopUpItemUpper, cbShowItem: CallableFunction = null) {
        // init temp node
        let tempNode: Node = instantiate(_target);
        tempNode.scale = Vec3.ZERO;
        if (tempNode.getComponent(UIOpacity) == null) tempNode.addComponent(UIOpacity).opacity = 255;
        if (nParent != null) tempNode.parent = nParent;
        tempNode.setWorldPosition(wPosRoot.clone().add3f(0, paramSetUp.distanceStart, 0));
        tempNode.active = true;

        const posTemp = tempNode.position.clone();
        const endPos = posTemp.clone().add(new Vec3(0, paramSetUp.distanceStartToEnd, 0));

        // try play sound
        cbPlaySound != null && cbPlaySound();

        return new Promise<void>((resolve, reject) => {
            tween(tempNode)
                .to(paramSetUp.timeAnimScaleUp, { scale: Vec3.ONE }, { easing: 'bounceOut' })
                .call(cbShowItem && cbShowItem())
                .delay(paramSetUp.timeDelay)
                .to(paramSetUp.timeAnimMoveUp, { position: endPos }
                    , {
                        easing: 'smooth', onUpdate(target, ratio) {
                            tempNode.getComponent(UIOpacity).opacity = (1 - ratio) * 255;
                        },
                    })
                .call(() => {
                    tempNode.destroy();
                    resolve();
                })
                .start();
        })
    }

    public static playAnimPopUpItemUpper_2(_target: Node, posRoot: Vec3, nParent: Node = null, cbPlaySound?: CallableFunction,
        paramSetUp: param_playAnimPopUpItemUpper = defaultParam_playAnimPopUpItemUpper, cbShowItem: CallableFunction = null, scaleEnd: Vec3 = Vec3.ONE) {
        // init temp node
        _target.scale = Vec3.ZERO;
        if (_target.getComponent(UIOpacity) != null) _target.addComponent(UIOpacity).opacity = 255;
        if (nParent != null) _target.parent = nParent;
        _target.setPosition(posRoot.clone().add3f(0, paramSetUp.distanceStart, 0));
        _target.active = true;

        const posTemp = _target.position.clone();
        const endPos = posTemp.clone().add(new Vec3(0, paramSetUp.distanceStartToEnd, 0));
        const opaCom = _target.getComponent(UIOpacity);

        // try play sound
        cbPlaySound != null && cbPlaySound();

        return new Promise<void>((resolve, reject) => {
            tween(_target)
                .to(paramSetUp.timeAnimScaleUp, { scale: scaleEnd }, { easing: 'bounceOut' })
                .call(cbShowItem && cbShowItem())
                .delay(paramSetUp.timeDelay)
                .to(paramSetUp.timeAnimMoveUp, { position: endPos }
                    , {
                        easing: 'smooth', onUpdate(target, ratio) {
                            opaCom.opacity = (1 - ratio) * 255;
                        },
                    })
                .call(() => {
                    _target.active = false;
                    resolve();
                })
                .start();
        })
    }

    public static ShowNodeWithOpacity(_target: Node, timeRaiseShadow: number = 0.5) {
        _target.getComponent(UIOpacity).opacity = 0;
        _target.active = true;
        return new Promise<void>(resolve => {
            tween(_target)
                .to(timeRaiseShadow, {}, {
                    onUpdate(target, ratio) {
                        _target.getComponent(UIOpacity).opacity = 255 * ratio;
                    },
                })
                .call(() => {
                    _target.getComponent(UIOpacity).opacity = 255;
                    resolve();
                })
                .start();
        })
    }

    public HideNodeWithOpacity(_target: Node, timeReduceShadow: number = 0.5) {
        _target.getComponent(UIOpacity).opacity = 255;
        _target.active = true;
        return new Promise<void>(resolve => {
            tween(_target)
                .to(timeReduceShadow, {}, {
                    onUpdate(target, ratio) {
                        _target.getComponent(UIOpacity).opacity = 255 * (1 - ratio);
                    },
                })
                .call(() => {
                    _target.getComponent(UIOpacity).opacity = 0;
                    _target.active = false;
                    resolve();
                })
                .start();
        })

    }

    public static ScaleCoinPoppularUse(_target: Node, time: number = 0.1, maxScale: Vec3 = new Vec3(1.1, 1.1, 1.1), minScale: Vec3 = Vec3.ONE) {
        Tween.stopAllByTarget(_target);
        const halfScale: Vec3 = maxScale.clone().add(minScale.clone()).multiplyScalar(0.5);
        if (_target.scale.x > halfScale.x) {
            _target.scale = halfScale.clone();
        }
        // let distanceScaleX: number = maxScale.x - _target.scale.x;
        // let trueTimeScaleUp: number = time * distanceScaleX / maxScale.x;
        tween(_target)
            .to(time, { scale: maxScale }, { easing: 'linear' })
            .to(time, { scale: minScale }, { easing: 'linear' })
            .union()
            .repeat(2)
            .start();
    }
}

export type param_playAnimPopUpItemUpper = {
    distanceStart: number,
    distanceStartToEnd: number,
    timeAnimScaleUp: number,
    timeDelay: number
    timeAnimMoveUp: number
}
export const defaultParam_playAnimPopUpItemUpper = {
    distanceStart: 80,
    distanceStartToEnd: 50,
    timeAnimScaleUp: 0.5,
    timeDelay: 0.1,
    timeAnimMoveUp: 0.8
}


