import { _decorator, Component, director, instantiate, Node, Prefab, resources } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { CallBackShowSpecialUI, MConst, TYPE_UI } from '../Const/MConst';
import { MConsolLog } from './MConsolLog';
import { GameSoundEffect } from '../Utils/Types';
import { SoundSys } from './SoundSys';
import { UIBaseSys } from './UIBaseSys';
import { MConfigs } from '../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('UISceneSysBase')
export class UISceneSysBase extends Component {
    @property(Node) nOtherUIs: Node;
    private listUI: Node[] = [];

    protected onLoad(): void {
        this.MLoad();
    }

    protected onEnable(): void {
        // listen event
        clientEvent.on(MConst.EVENT.SHOW_UI, this.ShowUI, this);
        clientEvent.on(MConst.EVENT.CLOSE_ALL_UI_SHOWING, this.CloseAllUIShowing, this);
        clientEvent.on(MConst.EVENT.SHOW_UI_SPECIAL, this.ShowUISpecial, this);
        clientEvent.on(MConst.EVENT.CLOSE_UI, this.CloseUI, this);
        clientEvent.on(MConst.EVENT.PRE_INIT_UI, this.PreInitUI, this);
        clientEvent.on(MConst.EVENT.PRELOAD_UI, this.PreloadUI, this);
        clientEvent.on(MConst.EVENT.PRELOAD_UI_QUEUE, this.PreloadUIQueue, this);
        clientEvent.on(MConst.EVENT.SET_INDEX, this.SetSiblingIndex, this);
        clientEvent.on(MConst.EVENT.CLOSE_UI_WITHOUT_TURN_OFF_SHADOW, this.CloseUIWithoutTurnOffShadow, this);
        this.MOnEnable();
    }

    protected start(): void {
        this.MStart();
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.SHOW_UI, this.ShowUI, this);
        clientEvent.off(MConst.EVENT.SHOW_UI_SPECIAL, this.ShowUISpecial, this);
        clientEvent.off(MConst.EVENT.CLOSE_ALL_UI_SHOWING, this.CloseAllUIShowing, this);
        clientEvent.off(MConst.EVENT.CLOSE_UI, this.CloseUI, this);
        clientEvent.off(MConst.EVENT.PRE_INIT_UI, this.PreInitUI, this);
        clientEvent.off(MConst.EVENT.PRELOAD_UI, this.PreloadUI, this);
        clientEvent.off(MConst.EVENT.PRELOAD_UI_QUEUE, this.PreloadUIQueue, this);
        clientEvent.off(MConst.EVENT.SET_INDEX, this.SetSiblingIndex, this);
        clientEvent.off(MConst.EVENT.CLOSE_UI_WITHOUT_TURN_OFF_SHADOW, this.CloseUIWithoutTurnOffShadow, this);
        this.MOnDisable();
    }

    protected onDestroy(): void {
        this.MOnDestroy();
    }

    //#region UI Show
    private async ShowUI(typeUI: TYPE_UI, typeShow: number, useSound: boolean = true, dataCustom: any = null, showShadow: boolean = true) {
        const self = this;
        // MConsolLog.Log("call ShowUI: " + typeUI);
        if (useSound) {
            // SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.POP_DIALOG);
        }

        // this.callbackWhenPrepareShowUI(typeUI, showShadow);

        async function ShowUIInited(nUIShow: Node) {
            const uiBaseShow = nUIShow.getComponent(UIBaseSys);
            uiBaseShow.SetCustomData(dataCustom);
            await uiBaseShow.Show(typeShow);
            self.callbackWhenShowUIDone(typeUI);
        }

        if (this.listUI[typeUI] == null) {
            if (MConfigs.list_prefab_preloal[typeUI] == null) {
                director.emit(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING);

                // load from Ui from resources
                resources.load(MConst.PATH.ROOT_PATH_UI + MConst.PATH.DIRECT_UI[typeUI], Prefab, async (err, prefab) => {
                    try {
                        let UIWantToShow = this.listUI[typeUI];
                        if (UIWantToShow == null) {
                            UIWantToShow = instantiate(prefab);
                            this.nOtherUIs.addChild(UIWantToShow);
                            this.listUI[typeUI] = UIWantToShow;
                            await ShowUIInited(UIWantToShow);
                            // MConsolLog.Log("load here second");
                        } else {
                            await ShowUIInited(UIWantToShow);
                            // MConsolLog.Log("UI was loaded");
                        }
                    } catch (error) {
                        // MConsolLog.Error("Error when show UI: " + typeUI, error);
                    }
                });
            } else {
                let UIWantToShow = instantiate(MConfigs.list_prefab_preloal[typeUI]);
                this.nOtherUIs.addChild(UIWantToShow);
                this.listUI[typeUI] = UIWantToShow;
                await ShowUIInited(UIWantToShow);
            }
        }
        else {
            await ShowUIInited(this.listUI[typeUI]);
        }
    }

    public async ShowUISpecial(typeUI: TYPE_UI, parentNode: Node, dataCustom: any = null, callback: CallBackShowSpecialUI = null) {
        MConsolLog.Log("call ShowUI special: " + typeUI, dataCustom);
        // load Ui from resources
        resources.load(MConst.PATH.ROOT_PATH_UI + MConst.PATH.DIRECT_UI[typeUI], Prefab, async (err, prefab) => {
            let UIWantToShow = instantiate(prefab);
            UIWantToShow.parent = parentNode;
            const uiBaseShow = UIWantToShow.getComponent(UIBaseSys);
            uiBaseShow.SetCustomData(dataCustom);
            uiBaseShow.PrepareDataShow();
            this.callbackWhenShowUIDone(typeUI);
            if (callback != null) {
                callback(UIWantToShow);
            }
        });
    }

    private async CloseUI(typeUI: TYPE_UI, typeClose: number, cbAfterUIClose: CallableFunction = null) {
        if (this.listUI[typeUI] == null) {
            return;
        }
        await this.listUI[typeUI].getComponent(UIBaseSys).Close(typeClose);

        if (cbAfterUIClose != null) {
            cbAfterUIClose();
        }
        this.callbackWhenCloseUIDone(typeUI);
    }

    private async CloseUIWithoutTurnOffShadow(typeUI: TYPE_UI, typeClose: number, cbAfterUIClose: CallableFunction = null) {
        if (this.listUI[typeUI] == null) {
            return;
        }
        await this.listUI[typeUI].getComponent(UIBaseSys).Close(typeClose);
        if (cbAfterUIClose != null) { cbAfterUIClose(); }
        this.callbackWhenCloseUIWithoutTurnOffShadow(typeUI);
    }

    private async CloseAllUIShowing(typeClose: number = 1, cbCallDone: CallableFunction = null) {

        // get the list UI isShowing
        let listUIShowing = Array.from(this.listUI).filter((element: Node) => element != null && element.active == true);
        listUIShowing.forEach(async (UICheck: Node, index: number) => {
            if (UICheck.active) {
                if (index == listUIShowing.length - 1) {
                    await UICheck.getComponent(UIBaseSys).Close(typeClose);
                    this.callbackWhenCloseAllUIDone();
                } else {
                    UICheck.getComponent(UIBaseSys).Close(typeClose);
                }
            }
        });

        if (cbCallDone != null) {
            cbCallDone();
        }
    }

    public CheckHasAnyUIShow(): boolean {
        for (let index = 0; index < this.listUI.length; index++) {
            if (this.listUI[index] != null && this.listUI[index].active == true) {
                // MConsolLog.Log("CheckHasAnyUIShow: " + this.listUI[index].name);
                return true;
            }
        }
        return false;
    }

    protected PreInitUI(typeUI: TYPE_UI) {
        if (this.listUI[typeUI] == null) {
            resources.load(MConst.PATH.ROOT_PATH_UI + MConst.PATH.DIRECT_UI[typeUI], Prefab, (err, prefab) => {
                let UIWantToShow = this.listUI[typeUI];
                if (UIWantToShow == null) {
                    UIWantToShow = instantiate(prefab);
                    UIWantToShow.active = false;
                    this.nOtherUIs.addChild(UIWantToShow);
                    this.listUI[typeUI] = UIWantToShow;
                }
            });
        }
    }

    protected PreloadUI(typeUI: TYPE_UI) {
        if (this.listUI[typeUI] == null) {
            resources.preload(MConst.PATH.ROOT_PATH_UI + MConst.PATH.DIRECT_UI[typeUI], Prefab, (err, prefab) => {
            });
        }
    }

    //#region queue preload UI
    private _queuePreloadUI: TYPE_UI[] = [];
    private _isLoadingQueue: boolean = false;
    protected async PreloadUIQueue(listTypeUI: TYPE_UI[]) {
        const self = this;

        listTypeUI.forEach(uiPreload => {
            // no preload if it already load
            if (this.listUI[uiPreload] == null) {
                this._queuePreloadUI.push(uiPreload);
            }
        })

        // check is loading queue => if not preload => load with the loop
        if (!this._isLoadingQueue) {
            this._isLoadingQueue = true;
            async function preLoadUI(typeUIPreload: TYPE_UI) {
                return new Promise<void>(resolve => {
                    resources.preload(MConst.PATH.ROOT_PATH_UI + MConst.PATH.DIRECT_UI[typeUIPreload], Prefab, (err, prefab) => {
                        resources.load(MConst.PATH.ROOT_PATH_UI + MConst.PATH.DIRECT_UI[typeUIPreload], Prefab, (err, prefab) => {
                            MConfigs.list_prefab_preloal[typeUIPreload] = prefab;
                            // console.log("PreloadUIQueue FINISHED", MConst.PATH.ROOT_PATH_UI + MConst.PATH.DIRECT_UI[typeUIPreload]);
                            resolve();
                        })
                        resolve()
                    });
                })
            }

            // loop until queue is empty or this was destroy
            while (this._queuePreloadUI.length > 0 && this.node != null) {
                let typeUILoad = this._queuePreloadUI.shift();
                await preLoadUI(typeUILoad);
                if (this.node == null || this.node == undefined) {
                    return;
                }
            }

            if (this.node != null) {
                this._isLoadingQueue = false;
            }
        }
    }
    //#endregion queue preload UI

    public getIndexUI(typeUI: TYPE_UI): number {
        if (this.listUI[typeUI] == null) {
            return -1;
        } else {
            return this.listUI[typeUI].getSiblingIndex();
        }
    }

    private SetSiblingIndex(typeUI: TYPE_UI, indexSibling: number) {
        if (this.listUI[typeUI] == null || indexSibling < 0) {
            MConsolLog.Error("the UI not load yet: " + typeUI);
        } else {
            this.listUI[typeUI].setSiblingIndex(indexSibling);
        }
    }
    //#endregion

    //override function
    public MLoad() { };
    public MOnEnable() { };
    public MStart() { };
    public MOnDisable() { };
    public MOnDestroy() { };
    public callbackWhenPrepareShowUI(typeUI: TYPE_UI, showShadow: boolean) { }
    public callbackWhenShowUIDone(typeUI: TYPE_UI) { }
    public callbackWhenCloseUIDone(typeUI: TYPE_UI) { }
    public callbackWhenCloseUIWithoutTurnOffShadow(typeUI: TYPE_UI) { }
    public callbackWhenCloseAllUIDone() { }

    //#endregion
}


