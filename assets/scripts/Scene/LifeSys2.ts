import { _decorator, Component, macro, Node } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { Utils } from '../Utils/Utils';
import { PlayerData } from '../Utils/PlayerData';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { CheatingSys } from './CheatingSys';
import { TYPE_RECEIVE } from '../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('LifeSys2')
export class LifeSys2 {
    public static Instance: LifeSys2;
    private life: number = 0;
    private lifeSpendTime: number = 0;
    private timePass: number = 0;
    private timeInfinityLife: number = 0; // save in second of the time
    private lastTimeAddInfinityLife: number = 0;

    private maxLife: number = MConst.MAX_LIFE;

    constructor() {
        if (LifeSys2.Instance == null) {
            LifeSys2.Instance = this;
            clientEvent.on(MConst.EVENT_RESOURCES.LIFE.RESET_LIFE_FORCE, this.ResetLife, this);
            clientEvent.on(MConst.EVENT_RESOURCES.LIFE.INCREASE_MAX_LIFE, this.IncreaseMaxLife, this);
        }
    }

    private EmitUpdateLife() {
        clientEvent.dispatchEvent(MConst.LIFE.EVENT_UPDATE_UI_LIFE);
    }

    public SetUp(canIncreasePremium: boolean) {
        // check if player was active pass and receive first prize => just increase the max life
        if (canIncreasePremium) {
            this.IncreaseMaxLife(8, false);
        }
        // set up base
        this.lifeSpendTime = parseInt(PlayerData.Instance._lastTimeSaveLife.toString());
        this.life = PlayerData.Instance._life;
        this.timeInfinityLife = PlayerData.Instance._timeInfinityLife;
        this.lastTimeAddInfinityLife = PlayerData.Instance._lastTimeSaveInfinityLife;
        this.RecoverLifeOnGameLoad();

        //============================================================
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.coroutineLifeRecover, this)
    }

    private IncreaseMaxLife(maxLifeSetTo: number, needEmitUpdateUI: boolean = true) {
        this.maxLife = maxLifeSetTo;
        if (needEmitUpdateUI) {
            PlayerData.Instance._life = this.maxLife;
            this.life = this.maxLife;
            clientEvent.dispatchEvent(MConst.LIFE.EVENT_UPDATE_UI_LIFE);
        }
    }

    private ResetLife() {
        this.maxLife = MConst.MAX_LIFE;
        if (PlayerData.Instance._life > this.maxLife) {
            PlayerData.Instance._life = this.maxLife;
            this.life = this.maxLife;
        }
        clientEvent.dispatchEvent(MConst.LIFE.EVENT_UPDATE_UI_LIFE);
    }

    private coroutineLifeRecover() {
        this.RecoverEnergyWithTime();
        this.ReduceTimeInfinity();
        this.EmitUpdateLife();
    }

    //#region load play game
    private RecoverLifeOnGameLoad() {
        // normal life
        this.timePass = (Utils.getSecondNow() - this.lifeSpendTime);
        if (this.timePass >= MConst.TIME_RE_LIFE) {
            this.life += Math.floor(this.timePass / MConst.TIME_RE_LIFE);
            this.lifeSpendTime = Utils.getSecondNow();
            if (this.life >= this.maxLife) {
                this.life = this.maxLife;
            }
        }

        // infinity life
        let timePass = (Utils.getSecondNow() - this.lastTimeAddInfinityLife);
        if (this.timeInfinityLife > 0 && timePass >= this.timeInfinityLife) {
            this.timeInfinityLife = 0;
        }
    }

    private ReduceTimeInfinity() {
        if (this.timeInfinityLife <= 0) { return; }
        let timePassInfinity = (Utils.getSecondNow() - this.lastTimeAddInfinityLife);
        if (timePassInfinity >= this.timeInfinityLife) {
            this.timeInfinityLife = 0;
            this.SaveData(false);
        }
    }

    //#endregion

    //#region recover time

    private RecoverEnergyWithTime() {
        this.timePass = (Utils.getSecondNow() - this.lifeSpendTime);
        if (this.timePass >= MConst.TIME_RE_LIFE) {
            // check need save data
            let noSaveData = false;
            if (this.life == 5) { noSaveData = true; }

            // logic recover time
            this.life += 1;
            this.lifeSpendTime = Utils.getSecondNow();
            if (this.life >= this.maxLife) {
                this.life = this.maxLife;
            }

            // save data
            if (!noSaveData) {
                this.SaveData();
            }
        }
    }
    //#endregion

    //#region func for others use
    public SpendLife(): boolean {
        // check infinity
        if (this.timeInfinityLife > 0) {
            return true;
        }

        // check life
        if (this.life > 0) {
            if (this.life == this.maxLife) {
                this.lifeSpendTime = Utils.getSecondNow();
                this.timePass = 0;
            }
            this.life -= 1;
            clientEvent.dispatchEvent(MConst.LIFE.EVENT_UPDATE_UI_LIFE);
            this.SaveData();
            return true;
        }

        // check cheating
        return CheatingSys.Instance.isCheatingLife;
    }

    public GetStringNumLife(): string {
        if (this.timeInfinityLife <= 0) {
            return this.life.toString();
        } else {
            return "∞";
        }
    }

    public GetTimeRecover(): string {
        if (this.timeInfinityLife <= 0) {
            // case no time infinity
            if (this.life == this.maxLife) {
                return "FULL";
            }

            if (this.timePass != MConst.TIME_RE_LIFE) {
                return Utils.convertTimeToStringFormat(MConst.TIME_RE_LIFE - (this.timePass % MConst.TIME_RE_LIFE));
            } else {
                return Utils.convertTimeToStringFormat(MConst.TIME_RE_LIFE);
            }
        } else {
            // case time infinity
            return Utils.convertTimeToStringFormat(this.timeInfinityLife - (Utils.getSecondNow() - this.lastTimeAddInfinityLife));
        }
    };
    public isInfinityTime(): boolean { return this.timeInfinityLife > 0; }
    public CheckHasLife(): boolean {
        return this.isInfinityTime() || this.life > 0 || CheatingSys.Instance.isCheatingLife;
    }
    //#endregion

    private SaveData(needSaveLastTimeLife: boolean = true) {
        PlayerData.Instance._life = this.life;
        PlayerData.Instance._lastTimeSaveLife = this.lifeSpendTime;
        PlayerData.Instance._timeInfinityLife = this.timeInfinityLife;
        if (needSaveLastTimeLife) {
            PlayerData.Instance._lastTimeSaveLife = Utils.getSecondNow();
        }
        PlayerData.Instance.SaveResources();
    }

    public AddLife(type: TYPE_RECEIVE, value: number, needSaveLastTimeLife: boolean = true) {
        switch (type) {
            case TYPE_RECEIVE.NUMBER:
                this.life += value;
                if (this.life > this.maxLife) {
                    this.life = this.maxLife;
                }
                this.SaveData(needSaveLastTimeLife);
                this.EmitUpdateLife();
                break;
            case TYPE_RECEIVE.TIME_MINUTE:
                if (this.timeInfinityLife > 0) {
                    this.timeInfinityLife = this.timeInfinityLife - (Utils.getSecondNow() - this.lastTimeAddInfinityLife) + value * 60;
                } else {
                    this.timeInfinityLife = value * 60;
                }
                this.lastTimeAddInfinityLife = Utils.getSecondNow();
                PlayerData.Instance._lastTimeSaveInfinityLife = Utils.getSecondNow();
                this.SaveData(needSaveLastTimeLife);
                this.EmitUpdateLife();
                break;
            case TYPE_RECEIVE.TIME_HOUR:
                if (this.timeInfinityLife > 0) {
                    this.timeInfinityLife = this.timeInfinityLife - (Utils.getSecondNow() - this.lastTimeAddInfinityLife) + value * 60 * 60;
                } else {
                    this.timeInfinityLife = value * 60 * 60;
                }
                this.lastTimeAddInfinityLife = Utils.getSecondNow();
                PlayerData.Instance._lastTimeSaveInfinityLife = Utils.getSecondNow();
                this.SaveData(needSaveLastTimeLife);
                this.EmitUpdateLife();
                break;
            default:
                break;
        }
    }
}


