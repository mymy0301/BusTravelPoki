import { _decorator, Component, Node } from 'cc';
import { ParamNextStepTut } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('BaseLogicTut')
export abstract class BaseLogicTut {
    private _step: number = 0;
    private _maxStep: number = 0;
    private _argBeforeNextStep: any[] = [];
    private _argDoStep: any[] = [];

    constructor() {
        this.RegisterEvents();
    }

    //#region public func
    public ResetStep() {
        this._step = 0;
    }

    /**
     * 1: call DoBeforeNextStep
     * 2: increase step
     * 3: call DoStep
     */
    public async NextStep(info: ParamNextStepTut) {
        // this param used for return if it can not do any more
        let stepDoing = this._step;

        this._argBeforeNextStep = info.argBeforeNextStep;
        this._argDoStep = info.argDoStep;

        // no more step
        if (this._step >= this._maxStep) { return; }

        await this.DoBeforeNextStep(this._step, ...info.argBeforeNextStep);
        if (this == null || stepDoing != this._step) return;
        this._step += 1;
        await this.DoStep(this._step, this._step - 1, ...info.argDoStep);
    }

    public async StepAgain() {
        let stepDoing = this._step;
        await this.DoBeforeStepAgain(this._step, ...this._argBeforeNextStep);
        if (this == null || stepDoing != this._step) { return; }
        await this.DoStep(this._step, this._step, ...this._argDoStep);
    }

    public get Step() {
        return this._step;
    }

    public set Step(indexStep: number) {
        this._step = indexStep;
    }

    public SetMaxStep(maxStep: number) {
        this._maxStep = maxStep;
    }

    public GetMaxStep(): number {
        return this._maxStep;
    }

    public async Reset() {
        this.UnRegisterEvents();
        this.ResetStep();
        this._maxStep = 0;
        this._argBeforeNextStep = [];
        this._argDoStep = [];
    }
    //#endregion public func

    //#region abstract func
    /**
     * This will be call in before increase step
     * @param step step before increase
     * @param args 
     */
    protected abstract DoBeforeNextStep(step: number, ...args: any): Promise<void>;
    /**
     * This will be call in before do step again
     * @param step step before increase
     * @param args 
     */
    protected abstract DoBeforeStepAgain(step: number, ...args: any): Promise<void>;
    /**
     * This will be call in after increase step
     * @param step step after increase
     * @param args 
     */
    protected abstract DoStep(step: number, stepBefore: number, ...args: any): Promise<void>;
    /**
     * This func will be auto call in constructor
     */
    protected abstract RegisterEvents(): void;
    /**
     * This func will be auto call in reset
     */
    protected abstract UnRegisterEvents(): void;
    protected abstract Init(...args: any): void;
    //#endregion abstract func
}


