import { Utils } from "db://assets/scripts/Utils/Utils";

const enum STATE_HAT_RACE {
    JOINING,
    WAIT_RECEIVE,
    END_EVENT
}

export type T_HR_BOT = 'A' | 'B' | 'C' | 'None';
export type T_LEVEL_XMAX = 'NORMAL' | 'HARD'

const EVENT_HAT_RACE = {
    UPDATE_UI_WHEN_END_TIME: "EVENT_HAT_RACE_UPDATE_UI_WHEN_END_TIME",
    UPDATE_TIME: "EVENT_HAT_RACE_UPDATE_TIME",
    TRY_CHANGE_TITLE: "EVENT_HAT_RACE_TRY_CHANGE_TITLE",
    NOTIFICATION_ITEMS: "EVENT_HAT_RACE_NOTIFICATION_ITEMS",
    UPDATE_TEXT_BTN_SR: "EVENT_HAT_RACE_UPDATE_TEXT_BTN_SR",
}

const CONFIG_HAT_RACE = {
    MAX_TIME_EVENT: 60 * 60 * 24 * 7,
    TIME_SHOW_RESULT: 60 * 10,
    MAX_PLAYER_JOIN: 100,
    MULTIPLIER: [1, 2, 3, 4, 5],
    // config for bot
    NUM_BOT_TYPE_A: 10,
    NUM_BOT_TYPE_B: 20,
    NUM_BOT_TYPE_C: 69,
    TIME_INCREASE_BOT_A: 60 * 6 + 30,
    TIME_INCREASE_BOT_B: 60 * 8 + 30,
    TIME_INCREASE_BOT_C: 60 * 10,
    TOP_BOT_RANK: 15
}

class InfoBot_HatRace {
    public id: string = '';
    public name: string = "";
    public avatar: string = '';
    public progress: number = 0;
    public rank: number = 0;
    public type: T_HR_BOT = 'A';
    public streak: number = 0;
    public levelReach: number = 0;

    public SetData(id: string, name: string, avatar: string, progress: number, type: T_HR_BOT, streak: number, levelReach: number, rank: number = null) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.progress = progress;
        this.type = type;
        this.streak = streak;
        this.levelReach = levelReach;
        if (rank != null) this.rank = rank;
    }

    public EncodeData(): string {
        return `${this.id}_${this.name}_${this.avatar}_${this.type}_${this.streak}_${this.levelReach}_${this.progress}`;
    }

    public EncodeDataPlayer(): string {
        return `______${this.progress}`;
    }

    public DecodeData(data: string) {
        if (data == '' || data == null) { return; }

        const infoDecode = data.split('_');
        if (infoDecode == null) { return; }
        this.id = infoDecode[0];
        this.name = infoDecode[1];
        this.avatar = infoDecode[2];
        this.type = infoDecode[3] as T_HR_BOT;
        if (infoDecode[4] != null && infoDecode[4] != "NaN") try { this.streak = Number.parseInt(infoDecode[4]); } catch (e) { this.streak = 0; }
        if (infoDecode[5] != null && infoDecode[5] != "NaN") try { this.levelReach = Number.parseInt(infoDecode[5]); } catch (e) { this.levelReach = 0; }
        if (infoDecode[6] != null && infoDecode[6] != "NaN") try { this.progress = Number.parseInt(infoDecode[6]); } catch (e) { this.progress = 0; }
    }
}

function DecodeInfoBot_HatRace(dataJson: string): InfoBot_HatRace[] {
    if (dataJson == null) { return []; }

    // split data
    let listBot = dataJson.split('*');
    if (listBot.length == 0) { return [] }

    let result: InfoBot_HatRace[] = [];
    listBot.forEach(dataBot => {
        let newBot = new InfoBot_HatRace();
        newBot.DecodeData(dataBot);
        result.push(newBot);
    })

    return result;
}

function EncodeInfoBot_HatRace(data: InfoBot_HatRace[], idPlayer: string[]): string {
    if (data == null || data.length == 0 || data.find(item => item.id == null || item.id == '')) { return ''; }

    let result: string = '';

    let dataSave = Utils.CloneListDeep(data); // sort data
    // sort data
    dataSave.sort((a, b) => b.progress - a.progress);

    for (let index = 0; index < dataSave.length; index++) {
        let jsonPlayer = ""
        const player = dataSave[index];
        if (!idPlayer.includes(player.id)) {
            jsonPlayer = `${player.EncodeData()}*`;
        }

        result += jsonPlayer;
    }

    // Remove trailing '*' if present
    if (result.endsWith('*')) {
        result = result.slice(0, -1);
    }

    return result;
}

function GetTypeLevel_XMAX(level: number): T_LEVEL_XMAX {
    if ((level + 1) % 5 == 0) { return "HARD"; }
    else return "NORMAL";
}

export {
    CONFIG_HAT_RACE,
    EVENT_HAT_RACE,

    STATE_HAT_RACE,
    InfoBot_HatRace,
    DecodeInfoBot_HatRace,
    EncodeInfoBot_HatRace,

    GetTypeLevel_XMAX
}