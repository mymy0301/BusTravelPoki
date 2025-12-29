import { _decorator, Component, Label, Node, ParticleSystem, Sprite, tween, UIOpacity } from 'cc';
import { STATE_ITEM_LPr } from './TypeLevelProgress';
import { IPrize } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('ItemPrizeLevelProgression')
export class ItemPrizeLevelProgression extends Component {
    @property(Sprite) spPrize: Sprite;
    @property(Label) lbPrize: Label;
    @property(Node) nFxGlow: Node;
    @property(ParticleSystem) particleStar: ParticleSystem;

    private _statePrize: STATE_ITEM_LPr = STATE_ITEM_LPr.CAN_NOT_CLAIM;
    private _dataPrize: IPrize = null;

    public ChangeState(newState: STATE_ITEM_LPr) {
        this._statePrize = newState;
        switch (this._statePrize) {
            case STATE_ITEM_LPr.CAN_NOT_CLAIM:
                this.nFxGlow.active = false;
                this.particleStar.stop();
                this.particleStar.node.active = false;
                break;
            case STATE_ITEM_LPr.WAIT_TO_CLAIM:
                this.nFxGlow.active = true;
                this.particleStar.node.active = true;
                this.particleStar.play();
                break;
            case STATE_ITEM_LPr.CLAIMED:
                this.nFxGlow.active = false;
                this.particleStar.stop();
                this.particleStar.node.active = false;
                break;
        }
    }

    public Init(dataPrize: IPrize, state: STATE_ITEM_LPr) {
        this._dataPrize = dataPrize;
        this._statePrize = state;
        this.ChangeState(state);
        this.UpdateUIPrize(dataPrize);
    }

    private async UpdateUIPrize(dataPrize: IPrize) {
        this.lbPrize.string = this._dataPrize.GetStringValue_2();
        const sfPrize = await MConfigResourceUtils.getImageItemBig(this._dataPrize.typePrize, this._dataPrize.typeReceivePrize);
        if (this._dataPrize == dataPrize) {
            this.spPrize.spriteFrame = sfPrize;
        }
    }
}


