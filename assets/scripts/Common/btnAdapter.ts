
import { _decorator, Component, Button, Node, Enum, log } from 'cc';
import { GameSoundEffect } from "../Utils/Types";
import { SoundSys } from './SoundSys';
const { ccclass, property, menu, requireComponent, disallowMultiple } = _decorator;


@ccclass("btnAdapter")
@menu('COMMON/btnAdapter')
@requireComponent(Button)
@disallowMultiple
export class btnAdapter extends Component {

    /**
     * 点击后是否播放点击音效
     * @property isPlaySound
     * @type {Boolean}
     * @default true
     */
    @property({ tooltip: '点击后是否播放点击音效' })
    isPlaySound = true;

    /**
     * 点击音效名
     * @property clickSoundName
     * @type {String}
     * @default true
     */
    @property({ tooltip: '点击音效名' })
    clickSoundName = 'CLICK';

    /**
     * 是否禁止快速二次点击
     * @property isPreventSecondClick
     * @type {Boolean}
     * @default true
     */
    @property({ tooltip: '是否禁止快速二次点击' })
    isPreventSecondClick = true;

    /**
     * 点击后多久才能再次点击,仅isPreventSecondClick为true生效
     * @property preventTime
     * @type {number}
     * @default true
     */
    @property({ tooltip: '点击后多久才能再次点击,仅isPreventSecondClick为true生效' })
    preventTime = 0.2;

    start() {
        const button = this.node.getComponent(Button)!;
        const self = this;
        this.node.on('click', () => {
            if (this.isPreventSecondClick) {
                button.interactable = false;
                this.scheduleOnce(() => {
                    if (button.node) button.interactable = true;
                }, this.preventTime);
            }

            const enumValue = GameSoundEffect[this.clickSoundName];

            if (enumValue !== undefined && SoundSys.Instance.getSoundEffStatus && this.isPlaySound) {
                SoundSys.Instance.playSoundEffectOneShot(enumValue as GameSoundEffect);
            }
        });
    }

    // update (dt) {},
};
