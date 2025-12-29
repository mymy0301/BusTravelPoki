import { _decorator, Component, Node } from 'cc';
import { AnimPrefabsBase } from '../../AnimsPrefab/AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('TextAnimSys')
export class TextAnimSys extends AnimPrefabsBase {
    public NAME_ANIM_WIN = {
        'animOpen': 'congratulations',
        'idle_default': 'congratulations_2',
        'idle': 'congratulations_idle'
    }

    public NAME_ANIM_OUT_OF_LIVES = {
        'animOpen': 'out_of_lives',
        'idle_default': 'out_of_lives2',
        'idle': 'out_of_lives_idle'
    }

    public NAME_ANIM_TIME_UP = {
        'animOpen': 'time_is_up',
        'idle_default': 'time_is_up_2',
        'idle': 'time_is_up_idle'
    }

    public NAME_ANIM_OUT_OF_SPACE = {
        'animOpen': 'out_of_space',
        'idle_default': 'out_of_space2',
        'idle': 'out_of_space_idle'
    }
}


