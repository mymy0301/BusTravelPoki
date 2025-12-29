import { _decorator, Component, Node, Size, Vec2 } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { MConst } from '../Const/MConst';
import { TYPE_ITEM } from '../Utils/Types';
const { ccclass, property } = _decorator;

export enum STATE_TUTORIAL_NORMAL {
    STATE_1, // tut merge
    STATE_2, // tut time
    STATE_3, // tut star, magic
    STATE_4, // tut no more slot
    STATE_5, // tut back
    STATE_6, // tut swap
    STATE_7, // tut roll back
    NOTHING
}

export enum STATE_TUTORIAL_DAILY {
    STATE_1, // tut question mark
    NOTHING
}

@ccclass('TutorialSys')
export class TutorialSys {
    public static Instance: TutorialSys = null;

    private _state_normal: STATE_TUTORIAL_NORMAL = STATE_TUTORIAL_NORMAL.NOTHING;
    private _state_daily: STATE_TUTORIAL_DAILY = STATE_TUTORIAL_DAILY.NOTHING;

    private readonly wOutline = 3;
    private readonly colorOutline = '#38508A';
    private readonly colorYellow = '#f9d12a';

    private JsonTut = [
        [
            {
                content: `<color=${this.colorOutline}>Tap ${this.GetRichTextImpress('3')} identical items\nto collect them</color>`,
                contentSizeBg: new Size(420, 150)
            },
            {
                content: `<color=${this.colorOutline}>Collect ${this.GetRichTextImpress('all items')}\nto finish the level</color>`,
                contentSizeBg: new Size(380, 150)
            }
        ],
        [
            {
                content: `<color=${this.colorOutline}>Collect all items\nbefore time is over!</color>`,
                contentSizeBg: new Size(380, 150)
            }
        ],
        [
            {
                content: `<color=${this.colorOutline}>Item ${this.GetRichTextImpress('Magic')} collects\nup to ${this.GetRichTextImpress('3')} items</color>`,
                contentSizeBg: new Size(380, 150)
            }
        ],
        [
            {},
            {
                content: `<color=${this.colorOutline}>Item ${this.GetRichTextImpress('Add 1 Stack')} can\nadd ${this.GetRichTextImpress('1')} more stack</color>`,
                contentSizeBg: new Size(420, 150)
            }
        ],
        [
            {},
            {
                content: `<color=${this.colorOutline}>Tapped the ${this.GetRichTextImpress('wrong')} tile?\nTry the ${this.GetRichTextImpress('Recaller')}!\nIt ${this.GetRichTextImpress('cancels the previous')} tap</color>`,
                contentSizeBg: new Size(500, 150)
            }
        ],
        [
            {
                content: `<color=${this.colorOutline}>${this.GetRichTextImpress('Shuffler')} can help you to\nshuffle all tiles' positions </color>`,
                contentSizeBg: new Size(470, 150)
            }
        ],
        [
            {
                content: `<color=${this.colorOutline}>Recaller is not enough?\nTry ${this.GetRichTextImpress('TripleRecaller')}</color>`,
                contentSizeBg: new Size(450, 150)
            }
        ]
    ]

    private SiblingsTutorial = [
        [
            { nameParent: "canvas", siblingIndex: 4 },
        ],
        [
            { nameParent: "NOT CHANGE", siblingIndex: 0 },
        ],
        [
            { nameParent: "NOT CHANGE", siblingIndex: 0 },
        ]
    ];

    constructor() {
        if (TutorialSys.Instance == null) {
            TutorialSys.Instance = this;
            this.ChangeStateNormal(STATE_TUTORIAL_NORMAL.NOTHING);
        }
    }

    public SetStateNormal(state: STATE_TUTORIAL_NORMAL) {
        //may be you can do any thing in here
        // example: tracking, change data , save any thing 
        this.ChangeStateNormal(state);
    }

    public SetStateDaily(state: STATE_TUTORIAL_DAILY) {
        //may be you can do any thing in here
        // example: tracking, change data , save any thing 
        this.ChangeStateDaily(state);
    }

    private ChangeStateNormal(state: STATE_TUTORIAL_NORMAL) {
        this._state_normal = state;
        switch (state) {
            case STATE_TUTORIAL_NORMAL.STATE_1:
                break;
            case STATE_TUTORIAL_NORMAL.STATE_2:
                break;
            case STATE_TUTORIAL_NORMAL.STATE_3:
                break;
            case STATE_TUTORIAL_NORMAL.STATE_4:
                break;
            case STATE_TUTORIAL_NORMAL.STATE_5:
                break;
            case STATE_TUTORIAL_NORMAL.STATE_6:
                break;
            case STATE_TUTORIAL_NORMAL.STATE_7:
                break;
            case STATE_TUTORIAL_NORMAL.NOTHING:
                break;
            default: break;
        }
    }

    private ChangeStateDaily(state: STATE_TUTORIAL_DAILY) {
        this._state_daily = state;
        switch (state) {
            case STATE_TUTORIAL_DAILY.STATE_1:
                break;
            case STATE_TUTORIAL_DAILY.NOTHING:
                break;
            default: break;
        }
    }

    public GetDialog(step: number): IDialogTutorial {
        if (this._state_normal == STATE_TUTORIAL_NORMAL.NOTHING) { return; }
        return this.JsonTut[this._state_normal][step] as IDialogTutorial;
    }

    public GetSiblingShadowIndex(step): any {
        if (this._state_normal == STATE_TUTORIAL_NORMAL.NOTHING) { return; }
        return this.SiblingsTutorial[this._state_normal][step];
    }

    public GetStateNormal() {
        return this._state_normal;
    }

    public GetStateDaily() {
        return this._state_daily;
    }

    public CheckCanReceivePrizeAtLobby() {
        /*sample code*/
        // if ((PlayerData.Instance._levelPlayer == MConst.LEVEL_TUTORIAL_ITEM.MAGIC && !PlayerData.Instance._isReceiveItemTut[TYPE_ITEM.STAR])
        //     || (PlayerData.Instance._levelPlayer == MConst.LEVEL_TUTORIAL_ITEM.BACK && !PlayerData.Instance._isReceiveItemTut[TYPE_ITEM.BACK])
        //     || (PlayerData.Instance._levelPlayer == MConst.LEVEL_TUTORIAL_ITEM.SWAP && !PlayerData.Instance._isReceiveItemTut[TYPE_ITEM.SWAP])
        //     || (PlayerData.Instance._levelPlayer == MConst.LEVEL_TUTORIAL_ITEM.ROLL_BACK && !PlayerData.Instance._isReceiveItemTut[TYPE_ITEM.ROLL_BACK])
        //     || (PlayerData.Instance._levelPlayer == MConst.LEVEL_TUTORIAL_ITEM.BOOSTER_ROCKET && !PlayerData.Instance._isReceiveItemTut[TYPE_ITEM.ROCKET])
        //     || (PlayerData.Instance._levelPlayer == MConst.LEVEL_TUTORIAL_ITEM.BOOSTER_TIME && !PlayerData.Instance._isReceiveItemTut[TYPE_ITEM.TIME])) {
        //     return true;
        // }

        return false;
    }

    private GetRichTextImpress(content: string): string {
        return `<outline color=${this.colorOutline} width=${this.wOutline}><color=${this.colorYellow}>${content}</color></outline>`
    }
}

export interface IDialogTutorial {
    content: string,
    contentSizeBg: Size
}


