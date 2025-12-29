
import { _decorator, Component, Node, Label, Enum } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import { LanguageManager } from './LanguageManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ItemLanguage
 * DateTime = Fri Mar 04 2022 12:00:09 GMT+0700 (Indochina Time)
 * Author = tuzkekizer
 * FileBasename = ItemLanguage.ts
 * FileBasenameNoExtension = ItemLanguage
 * URL = db://assets/scripts/language/ItemLanguage.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
export enum ITEM_LANGUAGE_KEY_TYPE {
    play,
    shop,
    daily,
    reward,
    free,
    gold,
    spin,
    spin2,
    level,
    free_coin,
    reset_in,
    setting,
    bgm,
    sfx,
    vibration,
    daily_reward,
    daily_reward_content,
    day,
    claim,
    claim_in,
    tap_to_open,
    claimx2,
    ok,
    no_ad,
    welcome,
    welcome_content,
    get_started,
    level2,
    with,
    share,
    continue,
    bomb_exploded,
    time_up,
    retry,
    home,
    restart,
    theme,
    pause,
    back,
    tut_level3,
    tut_level5,
    tut_hammer,
    tut_level7,
    tut_bomb,
    tut_level9,
    hammer,
    bomb,
    language,
    scored,
    scored_content,
    reward2,
    water_tutlevel1_1,
    water_tutlevel1_2,
    water_tutlevel2_1,
    water_tutlevel2_2,
    water_tutlevel2_3,
    water_tutlevel2_4,
    water_tutlevel3_1,
    water_tutlevel4_1,
    water_tutlevel5_1,
    Bottle,
    next,
    invite_play,
    share_content,
    btn_leaderboard,
    with_friend,
    leaderboard,
    btn_friend,
    btn_world,
    replay,
    lbAreYouSure,
    yes,
    no,
    best_score,
    congratulations,
    ui_congratulation_name_player,
    ui_gridnf_header,
    choose_your_powerup,
    buy_more,
    level_up,
    buy_success,
    one_more_chance,
    curent_score,
    store,
    invite,
    score,
    SHARE,
    NEW_GAME,
    PLAY,
    FRIENDS,
    RANDOM_MATCHES,
    JOIN_TOURNAMENT,
    CLOSE,
    HOME,
    LANGUAGE,
    REPLAY,
    PAUSE,
    SETTING,
    JOIN_GROUP,
    LIKE_PAGE,
    TOURNAMENT,
}

Enum(ITEM_LANGUAGE_KEY_TYPE);

@ccclass('ItemLanguage')
export class ItemLanguage extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    txtLabel: Label;

    @property({ type: ITEM_LANGUAGE_KEY_TYPE })
    key: ITEM_LANGUAGE_KEY_TYPE = ITEM_LANGUAGE_KEY_TYPE.play;

    onLoad() {
        this.txtLabel = this.node.getComponent(Label);
    }

    onEnable() {
        clientEvent.on(MConst.EVENT.LANGUAGE_UPDATE, this.showText, this);

        this.showText();
    }

    onDisable() {
        clientEvent.off(MConst.EVENT.LANGUAGE_UPDATE, this.showText, this);
    }
    start() {
        // [3]
    }

    showText() {
        this.txtLabel.string = `${LanguageManager.Instance.getText_byKey(this.key)}`;
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */
