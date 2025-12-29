import { _decorator, CCInteger, Component, director, macro, Node, Prefab, resources } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('PreloadUILobby')
export class PreloadUILobby extends Component {
    private _pauseLoadUI: boolean = false;
    private _idInterval: number = -1;
    protected onLoad(): void {
        director.addPersistRootNode(this.node);
        clientEvent.on(MConst.EVENT.PAUSE_LOAD_UI_RESOURCE, this.PausePreloadUI, this);
        clientEvent.on(MConst.EVENT.RESUME_LOAD_UI_RESOURCE, this.ResumePreloadUI, this);
        clientEvent.on(MConst.EVENT.START_LOAD_UI_RESOURCE, this.LoadUI, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT.PAUSE_LOAD_UI_RESOURCE, this.PausePreloadUI, this);
        clientEvent.off(MConst.EVENT.RESUME_LOAD_UI_RESOURCE, this.ResumePreloadUI, this);
        clientEvent.off(MConst.EVENT.START_LOAD_UI_RESOURCE, this.LoadUI, this);
        if (this._idInterval != -1) {
            clearInterval(this._idInterval);
        }
    }

    private async LoadUI() {
        // const self = this;
        // for (let i = 0; i < MConst.PATH.DIRECT_UI.length; i++) {
        //     let typeUI = MConst.PATH.DIRECT_UI[i];
        //     // console.log(MConst.PATH.DIRECT_UI[i].toString());
        //     if (this._pauseLoadUI) {
        //         // wait until pauseLoadUI is false
        //         await new Promise<void>(resolve => {
        //             self._idInterval = setInterval(() => {
        //                 if (!self._pauseLoadUI) {
        //                     if (self._idInterval != -1) {
        //                         clearInterval(self._idInterval);
        //                     }
        //                     resolve();
        //                 }
        //             }, 500, macro.REPEAT_FOREVER, 0)
        //         })
        //     }

        //     if (!this._pauseLoadUI) {
        //         /**Sample**/
        //         // you can await in here => it default about you choice in game
        //         new Promise<void>(resolve => {
        //             resources.load(MConst.PATH.ROOT_PATH_UI + typeUI, Prefab, async (err, prefab) => {
        //                 resolve();
        //                 // console.log(typeUI.toString());
        //             });
        //         })
        //     }
        // }

        // this.node.destroy();
    }

    private PausePreloadUI() {
        this._pauseLoadUI = true;
    }

    private ResumePreloadUI() {
        this._pauseLoadUI = false;
    }
}


