import { _decorator, Component, Node } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
import { TYPE_EMOTIONS_ANIM } from '../Utils/Types';
import { Utils } from '../Utils/Utils';
import { M_ERROR } from '../Configs/MConfigError';
const { ccclass, property } = _decorator;

@ccclass('AnimEmojiSys')
export class AnimEmojiSys extends AnimPrefabsBase {
    public async PlayAnimEmoji(typeEmoji: TYPE_EMOTIONS_ANIM) {
        try {
            this.PlayAnim(typeEmoji, false);
            await Utils.delay(this.GetTimeAnim(typeEmoji) * 1000);
            this.node.active = false;
        } catch (e) {
            console.error(`#${M_ERROR.ERROR_EMOJI}`);
        }
    }
}


