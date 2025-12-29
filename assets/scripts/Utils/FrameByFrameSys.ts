import { _decorator, CCBoolean, CCFloat, CCInteger, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

enum StateFrameByFrame {
    NONE,
    PLAYING
}

@ccclass('FrameByFrameSys')
@executeInEditMode
export class FrameByFrameSys extends Component {
    @property(Sprite) spImg: Sprite = null;
    @property([SpriteFrame]) listSf: SpriteFrame[] = [];
    @property(CCFloat) timeDelay: number = 0.5;
    @property(CCBoolean) IN_EDITOR: boolean = false;

    private _stateAnim: StateFrameByFrame = StateFrameByFrame.NONE;

    //=================================================
    //#region state
    public ChangeStatePlaying() { this._stateAnim = StateFrameByFrame.PLAYING; }
    public ChangeStateNone() { this._stateAnim = StateFrameByFrame.NONE; }
    //#endregion state
    //=================================================

    //=================================================
    //#region base
    protected onLoad(): void {
        // == preview ==
        this.onLoadPreview();
    }

    protected update(dt: number): void {
        // check valid
        if (this.listSf.length == 0 || this.spImg == null) return;
        switch (true) {
            case this.IN_EDITOR:
                // == preview ==
                this.onUpdatePreview(dt);
                break;
            case !this.IN_EDITOR && this._stateAnim == StateFrameByFrame.PLAYING:
                this.onUpdatePreview(dt);
                break;
        }
    }
    //#endregion base
    //=================================================

    public ResetFrame() {
        this.listSf = [];
        this.spImg.spriteFrame = null;
    }


    //========================= PREVIEW ==============================
    //#region PREVIEW
    private _timeInEditorMode: number = 0;
    private _indexLoop: number = 0;

    private onLoadPreview() {
        this._timeInEditorMode = 0;
        this._indexLoop = 0;
    }

    private onUpdatePreview(dt: number) {
        try {
            this._timeInEditorMode += dt;

            if (this._timeInEditorMode >= this.timeDelay) {
                this._timeInEditorMode = 0;
                this._indexLoop += 1;
                if (this._indexLoop == this.listSf.length) { this._indexLoop = 0 }
                this.spImg.spriteFrame = this.listSf[this._indexLoop];
            }
        } catch (e) {
            this.spImg.spriteFrame = null;
            console.error(e);
        }
    }
    //#endregion PREVIEW
    //========================= PREVIEW ==============================

}