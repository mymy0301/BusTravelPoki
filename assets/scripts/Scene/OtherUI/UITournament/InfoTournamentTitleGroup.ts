import { _decorator, Component, easing, Label, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { GameSoundEffect } from '../../../Utils/Types';
import { SoundSys } from '../../../Common/SoundSys';
const { ccclass, property } = _decorator;

@ccclass('InfoTournamentTitleGroup')
export class InfoTournamentTitleGroup extends Component {
    @property(Label)
    txtTitle: Label = null;

    @property(UIOpacity)
    groupOpacity: UIOpacity = null; 

    @property(Node)
    group: Node = null;
    
    tweenMove: Tween<{}> = null;
    tweenOpacity: Tween<{}> = null;

    _callBack:any = null;

    showTitle(title: string,callBack?:any) {
        // SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_DIALOG_OPEN);
        this._callBack = callBack;
        this.node.active = true;
        this.txtTitle.string = title;
        this.group.active = true;
        this.groupOpacity.opacity = 0;
        this.group.setPosition( new Vec3(0,300,0));
        if(this.tweenMove != null) this.tweenMove.stop();
        if(this.tweenOpacity != null) this.tweenOpacity.stop();
        this.tweenMove = tween(this.group).to(0.8, { position: new Vec3(0, 150, 0) },{easing:'backOut',onComplete:()=>{
            this.hideTitle(callBack);
        }}).start();
        this.tweenOpacity = tween(this.groupOpacity).to(0.3, { opacity: 255 },{easing:'linear'}).start();
    }

    hideTitle(callBack?:any) {
        // SoundSys.Instance.playSoundEffectOneShotDelayTime(GameSoundEffect.SOUND_DIALOG_CLOSE,1,1);
        this.tweenMove = tween(this.group).delay(0.8).to(1, { position: new Vec3(0, -800, 0) },{easing:'backInOut',onComplete:()=>{
            
        }}).start();
        this.tweenOpacity = tween(this.groupOpacity).delay(1).to(0.4, { opacity: 0 },{easing:'smooth',onComplete:()=>{
            this.group.active = false;
            this.node.active = false;
           callBack && callBack();
        }}).start();
    }
}


