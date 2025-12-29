import { _decorator, CCInteger, Component, director, game, instantiate, Layout, LOD, Node, Prefab, Size, Tween, tween, UITransform, Vec2, Vec3 } from 'cc';
import { JsonCar } from 'db://assets/scripts/Utils/Types';
import { ItemConveyorBeltSys } from './ItemConveyorBeltSys';
import { MConfigs } from 'db://assets/scripts/Configs/MConfigs';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
const { ccclass, property } = _decorator;

@ccclass('VisualConveyorBelt')
export class VisualConveyorBelt {
    @property(Node) nBlockConveyorBelt: Node;
    @property(Node) nParentInitCars: Node;
    @property(Node) nTempCar: Node;
    @property(Prefab) pfItemConveyorPlace: Prefab;
    @property(Node) nWPosEnd1: Node;

    public readonly contentSizeItemConveyorBelt: Size = new Size(55, 100);

    private _posMoveStart: Vec3 = Vec3.ZERO;
    private _posMoveEnd2: Vec3 = Vec3.ZERO;

    private _cbGetNItemCar: CallableFunction = null;

    private _isHasEventFocus: boolean = false;
    private _onVisibilityChange: () => void;
    public async Init(cbGetNItemCar: CallableFunction, maxItemDisplay: number) {
        this.StopConveyorBelt();

        //you need to set the visual in here
        this.nParentInitCars.getComponent(Layout).updateLayout(true);
        this.nParentInitCars.getComponent(Layout).enabled = false;
        this._cbGetNItemCar = cbGetNItemCar;
        this._posMoveStart = Vec3.ZERO;
        this._posMoveEnd2 = this._posMoveStart.clone()
            .add3f(maxItemDisplay * this.contentSizeItemConveyorBelt.x + (maxItemDisplay - 1) * this.nParentInitCars.getComponent(Layout).spacingX, 0, 0);

        // listenEvent
        if (!this._isHasEventFocus) {
            this._isHasEventFocus = true;
            // window.addEventListener('blur', this.onBlur.bind(this));
            // window.addEventListener('focus', this.onFocus.bind(this));
            this._onVisibilityChange = this.onVisibilityChange.bind(this);
            document.addEventListener('visibilitychange', this._onVisibilityChange);
        }
    }

    public RemoveListen() {
        this._isHasEventFocus = false;
        // window.removeEventListener('blur', this.onBlur.bind(this));
        // window.removeEventListener('focus', this.onFocus.bind(this));
        document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }

    private onFocus() {
        try {
            this.ResumeConveyorBelt();
        } catch (e) {

        }
    }

    private onBlur() {
        this.StopConveyorBelt();
    }

    private onVisibilityChange() {
        console.log('onVisibilityChange', document.hidden);
        if (document.hidden) {
            this.StopConveyorBelt();
        } else {
            this.ResumeConveyorBelt();
        }
    }

    public async Clear() {
        //NOTE Remove all the Car in the transmission and destroy or ReUse them
    }

    public StopConveyorBelt() {
        // this.nBlockConveyorBelt.active = true;
        // stop old tween
        try {
            if (this._cbGetNItemCar == null) { return; }
            this._cbGetNItemCar().forEach(nItem => Tween.stopAllByTarget(nItem));
        } catch (e) {
            console.error(e);
        }
    }

    public ResumeConveyorBelt() {
        // this.nBlockConveyorBelt.active = false;
        try {
            this.MoveConveyorBelt();
        } catch (e) {
            console.error(e);
        }
    }


    private _mapTweenLoop: Map<number, Tween<Node>> = new Map();
    private _mapTweenRepeat: Map<number, Tween<Node>> = new Map();
    private MoveConveyorBelt() {
        try {
            const self = this;
            const timeDefault = Vec3.distance(this._posMoveStart.clone(), this._posMoveEnd2.clone()) / MConfigs.SPEED_CONVEYOR_BELT;

            // create new tween
            let listNItem = this._cbGetNItemCar();
            for (let i = 0; i < listNItem.length; i++) {
                const nItem = listNItem[i];
                if (nItem != null) {
                    this._mapTweenLoop.get(i)?.stop();
                    this._mapTweenRepeat.get(i)?.stop();
                    this.Loop(nItem, i);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    private Loop(nItem: Node, index: number) {
        try {
            const posEnd1 = this.GetPosEnd();
            const posItem = nItem.position.clone();
            let time1, time2, t;

            // update again collider car
            if (posItem.x >= posEnd1.x) {
                // console.log("1 -", nItem.name);
                nItem.getComponent(ItemConveyorBeltSys).TryActiveNGoods(false);
                time1 = Vec3.distance(posItem, this._posMoveEnd2.clone()) / MConfigs.SPEED_CONVEYOR_BELT;
                t = tween(nItem)
                    .to(time1, { position: this._posMoveEnd2.clone() })
                    .call(() => { this.LoopRepeat(nItem, index) })
                    .start();
            } else {
                time1 = Vec3.distance(posItem, posEnd1) / MConfigs.SPEED_CONVEYOR_BELT;
                time2 = Vec3.distance(posEnd1.clone(), this._posMoveEnd2.clone()) / MConfigs.SPEED_CONVEYOR_BELT;
                nItem.getComponent(ItemConveyorBeltSys).TryActiveNGoods(true);

                t = tween(nItem)
                    .to(time1, { position: posEnd1 })
                    .call(() => { nItem.getComponent(ItemConveyorBeltSys).TryActiveNGoods(false) })
                    .to(time2, { position: this._posMoveEnd2.clone() })
                    .call(() => { this.LoopRepeat(nItem, index) })
                    .start();
            }


            this._mapTweenLoop.set(index, t);
        } catch (e) {
            console.error(e);
        }
    }

    private LoopRepeat(nItem: Node, index: number) {
        try {

            let posEnd1: Vec3 = this.GetPosEnd();
            const time1 = Vec3.distance(this._posMoveStart.clone(), posEnd1) / MConfigs.SPEED_CONVEYOR_BELT;
            const time2 = Vec3.distance(posEnd1.clone(), this._posMoveEnd2.clone()) / MConfigs.SPEED_CONVEYOR_BELT;

            // const wPosEnd1 = this.nWPosEnd1.worldPosition.clone();
            // const time1 = Vec3.distance(this._wPosMoveStart.clone(), wPosEnd1) / MConfigs.SPEED_CONVEYOR_BELT;
            // const time2 = Vec3.distance(wPosEnd1.clone(), this._wPosMoveEnd.clone()) / MConfigs.SPEED_CONVEYOR_BELT;


            // set the world position to start => then update Data
            nItem.position = this._posMoveStart.clone();
            // this.UpdateNewDataNItem(nItem);

            // update again collider car
            if (nItem.position.clone().x >= posEnd1.x) {
                // console.log("2 -", nItem.name);

                nItem.getComponent(ItemConveyorBeltSys).TryActiveNGoods(false);
            } else {
                nItem.getComponent(ItemConveyorBeltSys).TryActiveNGoods(true);
            }

            let t = tween(nItem)
                .to(time1, { position: posEnd1 })
                .call(() => {
                    // console.log("3", nItem.name);
                    nItem.getComponent(ItemConveyorBeltSys).TryActiveNGoods(false);
                })
                .to(time2, { position: this._posMoveEnd2.clone() })
                .call(() => {
                    this.LoopRepeat(nItem, index);
                    // console.log(" update on repeat");
                })
                .start();

            this._mapTweenRepeat.set(index, t);
        } catch (e) {
            console.error(e);
        }
    }

    private GetPosEnd(): Vec3 {
        let posEnd: Vec3 = Vec3.ZERO.clone();
        posEnd = this.nParentInitCars.inverseTransformPoint(posEnd, this.nWPosEnd1.worldPosition.clone());
        return posEnd;
    }
}