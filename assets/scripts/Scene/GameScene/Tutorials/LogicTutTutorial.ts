import { _decorator, Component, Node } from 'cc';
import { BaseLogicTut } from './BaseLogicTut';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('LogicTutTutorial')
export class LogicTutTutorial extends BaseLogicTut {

    public Init(...args: any): void {

    }
    protected RegisterEvents(): void {
        clientEvent.on(MConst.EVENT_TUTORIAL_GAME.TUTORIAL.NEXT_STEP, this.NextStep, this);
        clientEvent.on(MConst.EVENT_TUTORIAL_GAME.TUTORIAL.RE_STEP, this.StepAgain, this);
    }
    protected UnRegisterEvents(): void {
        clientEvent.off(MConst.EVENT_TUTORIAL_GAME.TUTORIAL.NEXT_STEP, this.NextStep, this);
        clientEvent.off(MConst.EVENT_TUTORIAL_GAME.TUTORIAL.RE_STEP, this.StepAgain, this);
    }
    protected async DoBeforeStepAgain(step: number, ...args: any): Promise<void> {
    }
    protected async DoBeforeNextStep(step: number, ...args: any): Promise<void> {
    }
    protected async DoStep(step: number, stepBefore: number, ...args: any): Promise<void> {
        //=========================================================
        if (args == null || args.length == 0) {
            // not do anything
            return;
        }

        //=========================================================
        // do step
        // point hand to the car
        // the first param args is the node car that hand point to
        let nCarPointTo: Node = args[0];
        if (step == 1 && step != stepBefore) {
            clientEvent.dispatchEvent(MConst.EVENT_HAND.POINT_HAND_TO, nCarPointTo.worldPosition.clone(), 0.8, true);
        } else if (step != stepBefore) {
            clientEvent.dispatchEvent(MConst.EVENT_HAND.POINT_HAND_TO, nCarPointTo.worldPosition.clone());
        } else {

        }
    }
}


