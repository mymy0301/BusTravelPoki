import { _decorator, Component, Label, Node, Size, SpriteFrame, Vec3, find, UITransform } from 'cc';
import { SubDashRush_player } from './SubDashRush_player';
import { DataDashRush } from '../../DataDashRush';
import { EVENT_CLOCK_ON_TICK } from '../../../Const/MConst';
import { clientEvent } from '../../../framework/clientEvent';
import * as I18n from 'db://i18n/LanguageData';
import { Utils } from '../../../Utils/Utils';
import { InfoBot_DashRush, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { ListSubDashRush } from './ListSubDashRush';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { DataEventsSys } from '../../DataEventsSys';
const { ccclass, property } = _decorator;

@ccclass('SubDashRush_UIDetail')
export class SubDashRush_UIDetail extends Component {
    @property([SpriteFrame]) listSfBg_player: SpriteFrame[] = [];
    @property([SpriteFrame]) listSfRank: SpriteFrame[] = [];
    @property(ListSubDashRush) listSubDashRush: ListSubDashRush;
    @property(Label) lbTime: Label;

    private _cbShowBlock: CallableFunction;
    private _cbHideBlock: CallableFunction;

    private _needPlayAnimUpdateInfoBot: boolean = false;

    private _sizeItem: Size = null;

    protected onDisable(): void {
        this.UnRegisterClock();
    }

    public InitCb(cbShowBlock: CallableFunction, cbHideBlock: CallableFunction) {
        this._cbShowBlock = cbShowBlock;
        this._cbHideBlock = cbHideBlock;
    }

    public SetUpData(oldDataDashRush: InfoBot_DashRush[]) {
        const dataBotNow: InfoBot_DashRush[] = DataDashRush.Instance.GetDataBot();
        const dataBotCache: InfoBot_DashRush[] = Utils.CloneListDeep(dataBotNow);
        dataBotCache.every(bot => {
            if (bot.id == MConfigFacebook.Instance.playerID) {
                const oldProgressPlayer = oldDataDashRush.find(bot => bot.id == MConfigFacebook.Instance.playerID)?.progress;
                if (oldProgressPlayer != null && !Number.isNaN(oldDataDashRush)) {
                    bot.progress = oldProgressPlayer;
                }
            }
        })


        function NeedPlayAnim(dataBotNow, dataBotOld): boolean {
            let indexBotDiff = dataBotNow.findIndex(botNow => {
                const botCache = dataBotOld.find(botCache => botCache.bot.id == botNow.bot.id)
                return botCache.rank != botNow.rank;
            })
            return indexBotDiff != -1;
        }

        function SortData(data: InfoBot_DashRush[]): any[] {
            return data
                .map((bot) => ({ bot, progress: bot.progress }))
                .sort((a, b) => b.progress - a.progress)
                .map((item, rank) => ({ ...item, rank: rank + 1 }));
        }

        // set can play anim bot
        const listNBot: Node[] = this.listSubDashRush.GetListN()

        // save size item
        this._sizeItem = listNBot[0].getComponent(UITransform).contentSize.clone();

        // check valid1
        if (dataBotNow == null || dataBotNow.length == 0) { return; }

        // sort data to set up
        const listRankBot = SortData(dataBotNow);

        // check valid2
        if (dataBotCache == null || dataBotCache.length == 0) {
            this._needPlayAnimUpdateInfoBot = false;
            // setUp data
            for (let indexBot = 0; indexBot < listRankBot.length; indexBot++) {
                const infoBotReal = listRankBot[indexBot];

                const nBot = listNBot[indexBot].getComponent(SubDashRush_player);
                nBot.InitCb(this.GetListImgRank.bind(this), this.GetListImgBg.bind(this), this.GetPosSuitRank.bind(this));
                const isPlayer: boolean = infoBotReal.bot.id == MConfigFacebook.Instance.playerID;
                if (isPlayer) {
                    this.listSubDashRush.SortIndexPlayer(indexBot);
                }
                nBot.SetUp(infoBotReal.bot, null, infoBotReal.rank, -1, isPlayer);
            }
            return;
        }

        // sort data to set up
        const listRankOldBotCache = SortData(dataBotCache);
        this._needPlayAnimUpdateInfoBot = NeedPlayAnim(listRankBot, listRankOldBotCache);
        // console.log("🚀 ~ SubDashRush_UIDetail ~ SetUpData ~ _needPlayAnimUpdateInfoBot:", this._needPlayAnimUpdateInfoBot)

        // in case need cache
        if (this._needPlayAnimUpdateInfoBot) {
            // setUp data
            for (let indexBot = 0; indexBot < listRankOldBotCache.length; indexBot++) {
                const infoBotOld = listRankOldBotCache[indexBot];
                const rankBotOld = infoBotOld.rank;
                const infoBotReal = listRankBot.find(bot => {
                    return bot.bot.id == infoBotOld.bot.id
                });
                //=====================================================
                //===============WARNGING==============================
                //=============CHECK VALID WILL RETURN=================
                //=====================================================
                if (infoBotReal == null) { return; }
                const rankBotReal = infoBotReal.rank;

                const isPlayer: boolean = infoBotReal.bot.id == MConfigFacebook.Instance.playerID;
                if (isPlayer) {
                    this.listSubDashRush.SortIndexPlayer(indexBot);
                }

                const nBot = listNBot[indexBot].getComponent(SubDashRush_player);
                nBot.InitCb(this.GetListImgRank.bind(this), this.GetListImgBg.bind(this), this.GetPosSuitRank.bind(this));
                nBot.SetUp(infoBotReal.bot, infoBotOld.bot, rankBotReal, rankBotOld, isPlayer);
            }
        } else {
            // setUp data
            for (let indexBot = 0; indexBot < listRankBot.length; indexBot++) {
                const infoBotReal = listRankBot[indexBot];

                const nBot = listNBot[indexBot].getComponent(SubDashRush_player);
                nBot.InitCb(this.GetListImgRank.bind(this), this.GetListImgBg.bind(this), this.GetPosSuitRank.bind(this));
                const isPlayer: boolean = infoBotReal.bot.id == MConfigFacebook.Instance.playerID;
                if (isPlayer) {
                    this.listSubDashRush.SortIndexPlayer(indexBot);
                }
                nBot.SetUp(infoBotReal.bot, null, infoBotReal.rank, -1, isPlayer);
            }
        }



        this.RegisterClock();
    }

    public async ShowUI() {
        try {
            this._cbShowBlock();
            this.node.active = true;
            this._cbHideBlock && this._cbHideBlock();
        } catch (e) {

        }
    }

    public HideUI() {
        this.node.active = false;
    }

    //===========================
    //#region anim
    public async AnimIncreaseScore() {
        const listNPlayer = this.listSubDashRush.GetListN();
        if (this._needPlayAnimUpdateInfoBot) {
            // play anim move the bot to the right place
            let listMoving: Promise<void>[] = [];
            for (let i = 0; i < listNPlayer.length; i++) {
                const player = listNPlayer[i].getComponent(SubDashRush_player);
                listMoving.push(player.AnimMoveToRightPlace());
            }

            await Promise.all(listMoving);
        }
    }

    public async ShowUI_WithAnim() {
        try {
            this._cbShowBlock();
            const listNPlayer = this.listSubDashRush.GetListN();
            // prepare anim
            listNPlayer.forEach(bot => bot.getComponent(SubDashRush_player).PrepareAnimShow());

            this.node.active = true;

            // hiển thị lần lượt từng đối tượng
            const timeDelayEachPlayer = 0.1;
            for (let i = 0; i < listNPlayer.length; i++) {
                const player = listNPlayer[i].getComponent(SubDashRush_player);
                player.AnimShow();
                if (i == listNPlayer.length - 1) {
                    await Utils.delay(player.TIME_ANIM_SHOW * 1000);
                } else {
                    await Utils.delay(timeDelayEachPlayer * 1000);
                }
            }

            this._cbHideBlock && this._cbHideBlock();
        } catch (e) {

        }
    }
    //#endregion anim
    //===========================

    //===========================
    //#region self
    private GetListImgRank() {
        return this.listSfRank;
    }

    private GetListImgBg() {
        return this.listSfBg_player;
    }

    private GetPosSuitRank(rank: number) {
        if (rank == -1) { return Vec3.ZERO; }
        const posResult = this.listSubDashRush.GetPosSuitRank(rank);
        return posResult;
    }

    private RegisterClock() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }
    }

    private UnRegisterClock() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private UpdateTime() {
        const time = DataDashRush.Instance.GetTimeDisplay();
        // const time = DataEventsSys.Instance.GetTimeGroupEventRemain(TYPE_EVENT_GAME.DASH_RUSH, 1);
        if (time <= 0) {
            this.UnRegisterClock();
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = resultTime;
        }
    }
    //#endregion self
    //===========================
}