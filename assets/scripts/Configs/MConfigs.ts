import { _decorator, Component, director, Node, SpriteFrame, Vec3, randomRangeInt, path, Sprite, screen, UITransform, Size, Color, Material, Label, Prefab } from 'cc';
import { Utils } from '../Utils/Utils';
import { MConsolLog } from '../Common/MConsolLog';
import { DayDailyInfo } from '../SerilazationData/DayDailyInfo';
import { MConfigFacebook } from './MConfigFacebook';
import { randomListIntWithSeedSpecial, shuffleArrayWithSeed, randomWithSeed } from '../framework/randomSeed';
import { IDataPlayer_LEADERBOARD } from '../Utils/server/ServerPegasus';
import { JsonPassenger, TYPE_LEVEL_NORMAL } from '../Utils/Types';
const { ccclass, property } = _decorator;

export enum TYPE_GAME {
    TUTORIAL,
    NORMAL,
    DAILY_CHALLENGE,
    TOURNAMENT,
    WITH_FRIEND,
    CHRISTMAS
}

export enum TYPE_TUT {
    TUTORIAL_1,             // lv1
    TUTORIAL_2              // lv2
}

class MConfigs {
    public static LEVEL_FRENZY_NOW = 21;

    // #region game
    public static readonly angleCarMove: number = 40;
    public static readonly SCALE_SPECIAL_CAR: Vec3 = new Vec3(1, 1, 1);
    public static readonly DEFAULT_BLOCK_RECEIVE_EACH_PASS_LEVEL = 20;
    public static readonly VERSION_GAME_NOW: string = "1.5.2";


    public static timeClickNextLevel: number = -1;  // param này chỉ dùng để log
    public static timeStartNewLevel: number = -1;   // param này chỉ dùng để log
    public static numIAPTicketHave: number = 0;

    // building
    public static readonly DISTANCE_HIGHER_CAM_WHEN_BUILD: Vec3 = new Vec3(0, 50, 0);
    public static readonly NUM_SCALE_WHEN_BUILD: number = 3;

    public static readonly STEP_SPAWN_NEXT_ITEM_BUILD: number = 10;
    public static readonly MAX_TIME_NEXT_SPAWN_ITEM_BUILD: number = 0.5;
    public static readonly TIME_ANIM_MOVE_ITEM_BUILDING: number = 1; //0.7
    public static TIME_INCREASE_SPEED_UP: number = 1;
    public static STEP_INCREASE_SPEED_UP: number = 0.5;
    public static LIMIT_TIME_INCREASE_SPEED_UP: number = 0.5;

    public static readonly SCALE_CONSTRUCTOR_WHEN_BUILDING: Vec3 = new Vec3(1.1, 1.1, 1.1);
    public static readonly TIME_SCALE_CONSTRUCTOR_WHEN_BUILDING: number = 0.1;

    public static readonly MAX_LEVEL_MAP: number = 3;

    // level
    public static readonly LEVEL_CAN_SHOW_UI: number = 3;
    public static readonly LEVEL_CAN_CHANGE_SCENE_TO_LOBBY: number = 5;
    public static readonly MAX_LEVEL_NORMAL: number = 258;    // 258
    public static readonly MIN_LEVEL_LOOP: number = 20;
    public static readonly TIME_LEVEL_HARD: number = 60 * 10;

    public static GetLevelGame(level: number): number {
        let levelRead = level;
        if (levelRead > MConfigs.MAX_LEVEL_NORMAL) {
            const numLoop = Math.floor((levelRead - MConfigs.MAX_LEVEL_NORMAL) / (MConfigs.MAX_LEVEL_NORMAL - MConfigs.MIN_LEVEL_LOOP));
            const listLevelRandom: number[] = this.randomListLevelWithSeed(numLoop, this.MIN_LEVEL_LOOP);
            const indexRead = (levelRead - 1 - MConfigs.MAX_LEVEL_NORMAL) % (MConfigs.MAX_LEVEL_NORMAL - MConfigs.MIN_LEVEL_LOOP)
            // console.log("🚀 ", levelRead);
            levelRead = listLevelRandom[indexRead];

            // console.log("🚀 ", levelRead);
            // console.log("🚀 ", indexRead);
            // console.log("🚀 ", listLevelRandom);
            // console.log("🚀 ", numLoop);
            // console.log("🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀");


            // levelRead = this.MIN_LEVEL_LOOP + levelRead % (MConfigs.MAX_LEVEL_NORMAL - this.MIN_LEVEL_LOOP);
        }


        return levelRead;
    }

    public static GetTypeLevel(level: number): TYPE_LEVEL_NORMAL {
        switch (true) {
            case level % 10 == 0: return TYPE_LEVEL_NORMAL.SUPER_HARD;
            case level % 5 == 0: return TYPE_LEVEL_NORMAL.HARD;
            default: return TYPE_LEVEL_NORMAL.NORMAL;
        }
    }

    /**
     * Randomizes the level order with a seed.
     * - Levels ending with 5 are shuffled among themselves.
     * - Levels ending with 0 are shuffled among themselves.
     * - All other levels are shuffled freely among themselves.
     * @param seed number
     * @returns number[] shuffled level list
     */
    public static randomListLevelWithSeed(seed: number, minLevelStart: number): number[] {
        const maxLevel = MConfigs.MAX_LEVEL_NORMAL - minLevelStart;
        const levels = Array.from({ length: maxLevel }, (_, i) => i + 1 + (minLevelStart - 1));

        // Separate levels by unit digit
        const levels0: number[] = [];
        const levels5: number[] = [];
        const levelsOther: number[] = [];

        for (let i = 0; i < levels.length; i++) {
            const lv = levels[i];
            if (lv % 10 === 0) {
                levels0.push(lv);
            } else if (lv % 10 === 5) {
                levels5.push(lv);
            } else {
                levelsOther.push(lv);
            }
        }

        // Shuffle each group with different seeds
        const shuffled0 = shuffleArrayWithSeed(seed + '_0', levels0);
        const shuffled5 = shuffleArrayWithSeed(seed + '_5', levels5);
        const shuffledOther = shuffleArrayWithSeed(seed + '_other', levelsOther);

        // Reconstruct the level list
        let idx0 = 0, idx5 = 0, idxOther = 0;
        const result: number[] = [];
        for (let i = 0; i < levels.length; i++) {
            const lv = levels[i];
            if (lv % 10 === 0) {
                result.push(shuffled0[idx0++]);
            } else if (lv % 10 === 5) {
                result.push(shuffled5[idx5++]);
            } else {
                result.push(shuffledOther[idxOther++]);
            }
        }
        return result;
    }

    //pack
    public static readonly UNLOCK_PACK_STARTER: number = 9;                    // bởi vì khi trở về màn home đã được +1 level do đó ta sẽ tăng 1 level khi lưu configs
    public static readonly UNLOCK_PACK_GREATE_DEALS_1: number = 30; //30          // bởi vì khi trở về màn home đã được +1 level do đó ta sẽ tăng 1 level khi lưu configs
    public static readonly UNLOCK_PACK_GREATE_DEALS_2: number = 51; //50          // bởi vì khi trở về màn home đã được +1 level do đó ta sẽ tăng 1 level khi lưu configs
    public static readonly Price_pack_starter: number = 2.99;
    public static readonly Price_pack_greate_deals: number = 2.99;
    public static readonly Price_pack_greate_deals_2: number = 9.99;
    public static WasShowUIStaterPack: boolean = false;
    public static WasShowUIGreatDeal_1: boolean = false;
    public static WasShowUIGreatDeal_2: boolean = false;

    // emotions
    public static readonly TIME_SHOW_EMOTIONS: number = 5;
    public static readonly MAX_EMOTION_SHOW: number = 1;
    public static readonly TIME_APPEAR_EMOTIONS: number = 0.3;
    public static readonly TIME_EACH_ANGER_EMOTION: number = 0.4;
    public static readonly NUM_REPEAT_EMOTION: number = 4;
    public static readonly DISTANCE_EMOTION_Y: number = 90;

    // passenger
    private static VEC_PASSENGER: number = 500;
    public static readonly DEFAULT_VEC_PASSENGER: number = 400 * 1.25;
    public static readonly SPEED_UP_VEC_PASSENGER: number = 560 * 1.25;
    public static get GET_VEC_PASSENGER(): number { return MConfigs.VEC_PASSENGER; }
    public static set SET_VEC_PASSENGER(value: number) { MConfigs.VEC_PASSENGER = value; }
    public static readonly DISTANCE_UP_MOVE_TO_CAR: number = 40;
    public static readonly DISTANCE_PASS_WAIT_TO_MOVE_ON_CAR: number = 60 / 1.3;
    public static readonly MaxTimeDoubleSpeedPass: number = 0.5;
    public static readonly stepIncreaseSpeed: number = 0.1;
    public static readonly speedPassMoveByBooster: number = 0.12 / 3;                 // something wrong in here => it look like time move than speed move => so remmeber it
    public static readonly speedPassMoveWhenInitGame: number = 0.11 / 1.25 / 1.3;     // something wrong in here => it look like time move than speed move => so remmeber it

    // car
    public static readonly SPEED_MOVE_CAR: number = 31.2;
    public static readonly SPEED_MOVE_CAR_TO_GATE: number = 35;
    public static readonly IS_WAIT_MOVE_CAR_SAME_TIME: boolean = false;
    public static readonly TIME_WAIT_TO_MOVE_TO_THE_GATE: number = 0;
    public static readonly TIME_SCHEDULE_AUTO_MOVE_TO_GATE: number = 5;
    public static readonly MAX_FRAME_ARROW_FLIPPER: number = 7;
    public static readonly MAX_FRAME_LIGHT_POLICE: number = 2;

    // converyor belt
    public static readonly SPEED_CONVEYOR_BELT: number = 60;

    //fx
    public static readonly FX_NEW_CUSTOM: Vec3 = new Vec3(50, 50, 50);
    public static readonly FX_BTN_LEVEL: Vec3 = new Vec3(80, 80, 80);
    public static readonly FX_BOOSTER: Vec3 = new Vec3(50, 50, 50);
    public static readonly FX_DEFAULT: Vec3 = new Vec3(40, 40, 40);

    //UI
    private static readonly scalePrize_4: Vec3 = new Vec3(0.5, 0.5, 0.5);
    private static readonly scalePrize_3: Vec3 = new Vec3(0.65, 0.65, 0.65);
    private static readonly scalePrize_2: Vec3 = new Vec3(0.8, 0.8, 0.8);
    private static readonly scalePrize_1: Vec3 = new Vec3(1.15, 1.15, 1.15);

    public static readonly UIReceivePrize_fontSizeLb_min_1_item: number = 55;
    public static readonly UIReceivePrize_fontSizeLb_max_4_item: number = 80;
    public static readonly UIReceivePrize_fontSizeDistance: number = (80 - 55) / (1 - 0.5); // lấy (max - min)/ (scale tương ứng item vs số lượng phần tử đó)
    public static GetFontSizeSuit(sizeNew: number): number {
        return 55 + MConfigs.UIReceivePrize_fontSizeDistance * (1 - sizeNew);
    }
    public static GetScaleItem(numPrize: number): Vec3 {
        switch (numPrize) {
            case 1:
                return MConfigs.scalePrize_1;
            case 2:
                return MConfigs.scalePrize_2;
            case 3:
                return MConfigs.scalePrize_3;
            case 4: case 5:
                return MConfigs.scalePrize_4;
            default:
                return MConfigs.scalePrize_1;
        }
    }

    public static readonly LocLbDefault: Vec3 = new Vec3(0, -55, 0);
    public static DistanceLocLabel(numPrize: number): Vec3 {
        switch (numPrize) {
            case 1:
                return MConfigs.LocLbDefault.clone().add3f(0, -25, 0);
            default:
                return MConfigs.LocLbDefault;
        }
    }

    public static wasPreloadUIGame: boolean = false;
    public static wasPreloadUIHome: boolean = false;
    public static list_prefab_preloal: Prefab[] = [];

    // ====================================================================================
    // =============================== event in game ======================================
    // ====================================================================================
    // season pass
    public static readonly MAX_PRIZE_SEASON_PASS: number = 30;   // not include last prize
    public static readonly MAX_TYPE_UI_SEASON_PASS: number = 1;

    // level pass
    public static readonly MAX_PRIZE_LEVEL_PASS: number = 10;   // not include last prize

    //spin
    public static readonly MAX_PROGRESS_SPIN_EACH_WEEK: number = 30;
    public static readonly MAX_PRIZE_SPIN: number = 5;
    public static readonly MAX_SPIN_ADS_PER_DAY: number = 5;
    public static readonly TIME_COOLDOWN_SPIN_ADS: number = 0; // 60 *5

    // LoginReward
    public static readonly MAX_PRIZE_PROGRESS_LOGIN_REWARD: number = 4;
    public static readonly MAX_PRIZE_LOGIN_REWARD: number = 30;

    // dailyQuest
    public static readonly MAX_DAILY_QUEST_PER_DAY: number = 5;

    // shop 
    public static readonly TIME_COOLDOWN_COIN_ADS: number = 60 * 5;
    public static readonly LIMIT_COIN_ADS_FREE_EACH_DAY: number = 5;
    public static readonly LIMIT_ITEM_COIN_EMPTY: number = 6;
    public static readonly NUM_COIN_FREE_EACH_DAY: number = 200;
    public static readonly NUM_COIN_ADS_EACH_DAY: number = 250;

    // invite friend
    public static CAN_SHOW_INVITE_AT_LOBBY: boolean = true;

    // dashRush
    public static DR_CAN_NOTI_START: boolean = true;

    // speedRace
    public static SR_CAN_NOTI_START: boolean = true;

    //treasure trail
    public static TT_CAN_NOTI_START: boolean = true;

    //sky lift
    public static SL_CAN_NOTI_START: boolean = true;

    // levelProgress
    public static IsTryShowPopUpStartEventLP: boolean = false;
    // ====================================================================================
    // =============================== event in game ======================================
    // ====================================================================================
    // #endregion game

    //#region anim receive prize at lobby
    public static readonly timeWaitToMoveItems = 0.67;
    public static readonly timeRaiseShadow = 0.5;
    //#endregion anim receive prize at lobby

    //#region IAP
    public static readonly IAP_LEVEL_PASS = 'level_pass';
    public static readonly IAP_SEASON_PASS = 'season_pass';
    public static readonly IAP_NO_ADS = 'no_ads';
    public static readonly IAP_PIGGY_BANK_1 = 'pb_1';
    public static readonly IAP_PIGGY_BANK_2 = 'pb_2';
    public static readonly IAP_PIGGY_BANK_3 = 'pb_3';
    //#endregion IAP

    //#region TUT
    //================================= REMEMBER NOT OPEN EVENT BEFORE PLAY ALL TUT ITEMS BECAUSE MAY BE IT WILL CONFIG UI OR GAME_PLAY <PRIZE, EVENT,...> ================== 
    //================================= THEREFOR IF YOU CHANGE YOU MUST CHECK CAREFULLY ==================
    public static readonly LEVEL_TUTORIAL_EVENT = {
        Building: 5,
        LoginReward: 5,
        Spin: 8,
        LevelPass: 28,
        InviteFriend: 1,
        SeasonPass: 40,
        Tournament: 1,
        PVP: 1,
        PiggyBank: 40,
        DashRush: 20,
        SpeedRace: 35,
        EndlessTreasure: 50,
        LevelProgression: 10,
        TreasureTrail: 20,
        SkyLift: 15,
        ChristmasEvent: 25,
        Pack_christmasEvent: 25
    };

    public static readonly LEVEL_TUTORIAL_ITEM = {
        TIME: 0,
        MAGIC: 1,
        NO_MORE_SLOT: 2,
        BACK: 3,
        SWAP: 5,
        ROLL_BACK: 7,
        BOOSTER_ROCKET: 9,
        BOOSTER_TIME: 11,
    };

    public static readonly NUM_ITEM_TUT_RECEIVE = 1;
    //#endregion TUT

    public static readonly LEVEL_CAN_RECEIVE_PRIZE_WEEKLY = 8;

    public static readonly LEVEL_CAN_SHOW_INTER = 3;
    public static readonly LEVEL_CAN_SHOW_INTER_PC = 10;


    //#region FUNC shader
    public static GrayAllNode(listNode: Node[], shaderGray: Material) {
        // nếu node là Sprite => gray 
        // nếu node là label => add shader gray vào
        listNode.forEach((node: Node) => {
            const spCom = node.getComponent(Sprite);
            const lbCom = node.getComponent(Label);
            if (spCom != null) {
                spCom.grayscale = true;
            } else if (lbCom != null && shaderGray != null && lbCom.customMaterial != shaderGray) {
                lbCom.customMaterial = shaderGray;
            }
        })
    }

    public static UnGrayAllNode(listNode: Node[]) {
        // nếu node là Sprite => un Gray
        // nếu node là label => remove shader < sau này cần kiểm tra xem shader có phải gray hay không hẵng remove nhwung hiện tại chưa có nhiều shader nên skip đoạn này>
        listNode.forEach((node: Node) => {
            const spCom = node.getComponent(Sprite);
            const lbCom = node.getComponent(Label);
            if (spCom != null) {
                spCom.grayscale = false;
            } else if (lbCom != null && lbCom.customMaterial != null) {
                lbCom.customMaterial = null
            }
        })
    }

    public static CloneMat(mat: Material) {
        let nMat = new Material();
        nMat.copy(mat);
        return nMat;
    }
    //#endregion FUNC shader

    //TOURNAMENT 
    public static readonly TIME_DEFAULT_PLAY_TOURNAMENT: number = 60 * 5; // 5'

    public static nameFriend: string = null;

    /**
     * this func will return the number item you receive suit with your indexRank
     * @param indexRank index player
     * @param typePrize type prize
     */
    public static GetNumberItemsPlayerGet(typePrize: number, indexRank: number): number {
        let numberItem = -1;
        if (indexRank == 0) { numberItem = 15; }
        else if (indexRank == 1) { numberItem = 10; }
        else if (indexRank == 2) { numberItem = 8; }
        else if (indexRank >= 3 && indexRank < 10) { numberItem = 4; }
        else if (indexRank >= 10 && indexRank < 24) { numberItem = 2; }
        else if (indexRank >= 24 && indexRank < 49) { numberItem = 1; }

        // console.log(indexRank, numberItem);

        return numberItem;
    }

    //#region data save for tournament
    public static getDataPlayerEmpty(): IDataPlayer_LEADERBOARD {
        let info: IDataPlayer_LEADERBOARD = {
            rank: 9999,
            score: -1,
            avatar: MConfigFacebook.Instance.playerPhotoURL,
            name: MConfigFacebook.Instance.playerName,
            playerId: MConfigFacebook.Instance.playerID

        }
        return info;
    }
    //#endregion

    public static ConvertDataToJsonPassenger(data: any): JsonPassenger {
        let result: JsonPassenger = {
            color: data as number
        };
        return result;
    }

    //#region set type anim or activity of the game
    public static readonly TYPE_ANIM_MOVE_OUT_STACK: number = 1;
    public static readonly TYPE_ANIM_OPENING_LAYER: number = 2;
    //#endregion set type anim or activity of the game

    //#region temp data
    // ====================================================================  temp data player ====================================================
    public static NameBot = ["Adrian", "Isabella", "Maxwell", "Emily", "Ava", "Ethan", "Olivia", "Lucas", "Sophia", "Noah",
        "Mia", "Benjamin", "Abigail", "William", "Charlotte", "James", "Elizabeth", "David", "Jennifer", "Robert",
        "Sarah", "John", "Hannah", "Henry", "Lily", "Michael", "Alexander", "Christopher", "Brianna", "Daniel",
        "Matthew", "Samantha", "Logan", "Ashley", "Evan", "Sofia", "Oliver", "Chloe", "Lisa", "Nico", "Liam",
        "Emma", "Harper", "Mason", "Abigail", "Henry", "Emily", "Michael", "Ella", "Alexander", "Elizabeth", "Ethan",
        "Avery", "Daniel", "Sofia", "Matthew", "Evelyn", "Aiden", "Madison", "Joseph", "Scarlett", "Samuel", "Victoria",
        "David", "Aria", "Anthony", "Grace", "Jacob", "Chloe", "Andrew", "Camila", "Dylan", "Penelope", "Christopher",
        "Layla", "Isaac", "Riley", "Wyatt", "Lillian", "Joshua", "Nora", "Sebastian", "Zoey", "Carter", "Mila", "Jayden",
        "Aubrey", "Luke", "Lila", "Alina", "Caleb", "Leah", "Ryan", "Savannah", "Adam", "Aaliyah", "Tyler", "Natalie",
        "Cooper", "Ariana", "Miles", "Cora", "Jaxon", "Ellie", "Isaiah", "Alexa", "Grayson", "Jone", "Leonardo", "Brooklyn",
        "Levi", "Eliana", "Mateo", "Kylie", "Jordan", "Khloe", "Asher", "Samantha", "Zayden", "Madelyn", "Parker", "Taylor",
        "Blake", "Bailey", "Xavier", "Kinsley", "Jonathan", "Sydney"];

    public static AvatarBot = [             // 81
        'https://i.imgur.com/DaoUDiV.png', 'https://i.imgur.com/l7XAYCo.png', 'https://i.imgur.com/DAPpuMB.png', 'https://i.imgur.com/pI51WFd.png', 'https://i.imgur.com/zWCI4NE.png', 'https://i.imgur.com/ewGNnOZ.png', 'https://i.imgur.com/IHSfVIr.png', 'https://i.imgur.com/v9wwng2.png', 'https://i.imgur.com/84AVcrh.png', 'https://i.imgur.com/COHifGy.png', 'https://i.imgur.com/NehNwty.png', 'https://i.imgur.com/zCRw0Fu.png', 'https://i.imgur.com/FHoFZGG.png', 'https://i.imgur.com/2rOCGlj.png', 'https://i.imgur.com/Mftcu1w.png', 'https://i.imgur.com/0Iv054Q.png', 'https://i.imgur.com/4TrMokt.png', 'https://i.imgur.com/GtEIRcu.png', 'https://i.imgur.com/LLFIZAx.png', 'https://i.imgur.com/R8GfMmC.png', 'https://i.imgur.com/tzTYk3e.png', 'https://i.imgur.com/vO9jdca.png', 'https://i.imgur.com/SRo0i0U.png', 'https://i.imgur.com/8uQBLWB.png', 'https://i.imgur.com/a7Ug0Os.png', 'https://i.imgur.com/FX7qyJg.png', 'https://i.imgur.com/DAPpuMB.png', 'https://i.imgur.com/xdaxWyQ.png', 'https://i.imgur.com/pc5xY0N.png', 'https://i.imgur.com/47iiLjT.png', 'https://i.imgur.com/XGpSG4P.png', 'https://i.imgur.com/Oru06uk.png', 'https://i.imgur.com/xUVCTAq.png', 'https://i.imgur.com/zhFN3fo.png', 'https://i.imgur.com/KlaLlni.png', 'https://i.imgur.com/DndFLxB.png', 'https://i.imgur.com/0c4GTQx.png', 'https://i.imgur.com/ANKnbzN.png', 'https://i.imgur.com/m7T555c.png', 'https://i.imgur.com/vr1j9Nz.png', 'https://i.imgur.com/PMGbbRi.png', 'https://i.imgur.com/7ZHan6A.png', 'https://i.imgur.com/e0CZqtB.png', 'https://i.imgur.com/6uKIY1Y.png', 'https://i.imgur.com/pICCa9o.png', 'https://i.imgur.com/wHB7421.png', 'https://i.imgur.com/scDyFcD.png', 'https://i.imgur.com/xNAr6Xc.png', 'https://i.imgur.com/p40WBiJ.png', 'https://i.imgur.com/wf48GLZ.png', 'https://i.imgur.com/G3sI8er.png', 'https://i.imgur.com/UCcnouu.png', 'https://i.imgur.com/Zv2q64a.png', 'https://i.imgur.com/Qlc1nnc.png', 'https://i.imgur.com/5OWiNd3.png', 'https://i.imgur.com/LBTzJRq.png', 'https://i.imgur.com/xnYL0Ov.png', 'https://i.imgur.com/kc2VHEU.png', 'https://i.imgur.com/uIzgJBF.png', 'https://i.imgur.com/DIdMa7U.png', 'https://i.imgur.com/nIxTjTd.png', 'https://i.imgur.com/lmaVJ7V.png', 'https://i.imgur.com/KkCOycR.png', 'https://i.imgur.com/AaWCPgZ.png', 'https://i.imgur.com/H7vlRRh.png', 'https://i.imgur.com/drvnyWY.png', 'https://i.imgur.com/uQiTLJe.png', 'https://i.imgur.com/8NaKbzN.png', 'https://i.imgur.com/8vqpNpj.png', 'https://i.imgur.com/uGRhRhf.png', 'https://i.imgur.com/vdQaW8U.png', 'https://i.imgur.com/fV5hL3p.png', 'https://i.imgur.com/f5VsVqn.png', 'https://i.imgur.com/rYbWDjp.png', 'https://i.imgur.com/1qAFFBO.png', 'https://i.imgur.com/GqgWIAw.png', 'https://i.imgur.com/JtclDv5.png', 'https://i.imgur.com/GU0YzI9.png', 'https://i.imgur.com/VHVcHVj.png', 'https://i.imgur.com/d8ljrMA.png', 'https://i.imgur.com/0ZWL7dV.png', 'https://i.imgur.com/dp7Uff8.png'
    ];
    // 100 score
    public static TEMP_SCORE_TOUR_WEEKLY: number[] = [1405, 1397, 1396, 1367, 1338, 1316, 1311, 1297, 1268, 1245, 1219, 1213, 1213, 1202, 1197, 1184, 1176, 1174, 1154, 1152, 1139, 1138, 1114, 1106, 1104, 1099, 1085, 1066, 1039, 1031, 1030, 1020, 1010, 997, 973, 971, 954, 940, 937, 936, 911, 896, 882, 876, 869, 852, 822, 804, 783, 762, 743, 719, 705, 702, 681, 659, 643, 623, 594, 592, 590, 587, 561, 542, 538, 537, 520, 506, 501, 493, 484, 470, 457, 445, 441, 426, 407, 398, 388, 383, 359, 333, 330, 312, 301, 293, 282, 274, 251, 227, 202, 189, 174, 161, 137, 126, 124, 101, 81, 56];
    public static TEMP_SCORE_TOUR_GLOBAL: number[] = [1475, 1471, 1456, 1451, 1430, 1407, 1396, 1391, 1370, 1350, 1332, 1328, 1303, 1297, 1279, 1253, 1241, 1221, 1211, 1191, 1184, 1176, 1171, 1166, 1166, 1158, 1138, 1122, 1100, 1084, 1071, 1067, 1038, 1011, 981, 959, 953, 941, 932, 918, 912, 883, 877, 873, 873, 848, 835, 826, 799, 792, 768, 738, 729, 704, 696, 693, 678, 668, 649, 631, 616, 600, 587, 561, 549, 539, 532, 527, 506, 503, 501, 501, 471, 468, 446, 443, 428, 417, 396, 380, 352, 352, 341, 320, 290, 273, 263, 243, 231, 227, 205, 201, 186, 176, 146, 128, 115, 107, 99, 85];
    public static TEMP_SCORE_PLAY_1VS1_RANDOM: number[] = [150, 54, 189, 116, 180, 129, 98, 52, 50, 138, 183, 109, 155, 91, 149, 37, 99, 151, 127, 57, 38, 82, 123, 75, 104, 117, 174, 72, 76, 190, 198, 88, 75, 74, 64, 119, 42, 92, 95, 85, 89, 139, 39, 103, 40, 76, 93, 94, 113, 25, 41, 186, 46, 106, 71, 191, 60, 96, 55, 132, 64, 168, 131, 124, 135, 170, 43, 171, 47, 129, 162, 97, 169, 58, 78, 105, 145, 186, 198, 126, 139, 84, 81, 155, 36, 65, 54, 166, 140, 177, 144, 59, 50, 148, 53, 113, 126, 118, 51, 166, 114];
    public static TEMP_SCORE_TOUR_TYPE3: number[] = [4977, 4954, 4936, 4913, 4897, 4876, 4855, 4834, 4813, 4796, 4776, 4757, 4737, 4716, 4699, 4676, 4656, 4636, 4620, 4599, 4580, 4559, 4542, 4521, 4501, 4483, 4460, 4439, 4418, 4396, 4380, 4355, 4335, 4317, 4294, 4277, 4257, 4237, 4218, 4200, 4183, 4163, 4141, 4122, 4101, 4083, 4059, 4041, 4021, 4002, 3980, 3959, 3942, 3922, 3904, 3885, 3867, 3844, 3827, 3811, 3789, 3767, 3751, 3731, 3711, 3688, 3669, 3646, 3622, 3604, 3584, 3564, 3544, 3522, 3499, 3482, 3460, 3440, 3423, 3402, 3383, 3362, 3342, 3321, 3301, 3280, 3260, 3238, 3218, 3202, 3185, 3165, 3146, 3129, 3105, 3088, 3070, 3052, 3030, 3013, 2994, 2974, 2956, 2936, 2916, 2900, 2883, 2861, 2841, 2823, 2799, 2777, 2758, 2734, 2714, 2694, 2671, 2649, 2626, 2606, 2583, 2562, 2540, 2522, 2502, 2482, 2461, 2441, 2422, 2404, 2383, 2363, 2345, 2323, 2300, 2280, 2264, 2242, 2223, 2197, 2179, 2156, 2136, 2118, 2093, 2075, 2051, 2032, 2012, 1987, 1967, 1950, 1933, 1909, 1893, 1870, 1850, 1831, 1811, 1786, 1770, 1751, 1734, 1714, 1698, 1680, 1663, 1641, 1620, 1599, 1584, 1563, 1544, 1520, 1500, 1480, 1461, 1441, 1422, 1400, 1382, 1363, 1356, 1335, 1315, 1294, 1270, 1246, 1220, 1197, 1182, 1157, 1137, 1114, 1091, 1065, 1041, 1019, 1001, 978, 956, 931, 913, 887, 857, 833, 810, 794, 769, 747, 723, 691, 671, 652, 632, 612, 587, 571, 547, 529, 512, 484, 462, 442, 417, 392, 367, 346, 316, 291, 262, 233, 214, 186, 157, 131, 111, 85, 65, 46, 30];
    public static TEMP_SCORE_TOUR_TYPE3_1: number[] = [2441, 2422, 2404, 2383, 2363, 2345, 2323, 2300, 2280, 2264, 2242, 2223, 2197, 2179, 2156, 2136, 2118, 2093, 2075, 2051, 2032, 2012, 1987, 1967, 1950, 1933, 1909, 1893, 1870, 1850, 1831, 1811, 1786, 1770, 1751, 1734, 1714, 1698, 1680, 1663, 1641, 1620, 1599, 1584, 1563, 1544, 1520, 1500, 1480, 1461, 1441, 1422, 1400, 1382, 1363, 1356, 1335, 1315, 1294, 1270, 1246, 1220, 1197, 1182, 1157, 1137, 1114, 1091, 1065, 1041, 1019, 1001, 978, 956, 931, 913, 887, 857, 833, 810, 794, 769, 747, 723, 691, 671, 652, 632, 612, 587, 571, 547, 529, 512, 484, 462, 442, 417, 392, 367, 346, 316, 291, 262, 233, 214, 186, 157, 131, 111, 85, 65, 46, 30];
    public static TEMP_PLAYER_AVATAR = "https://i.imgur.com/DaoUDiV.png";
    public static TEMP_PLAYER_ID = "4077605925698792";

    //fake data user tournament

    public static getFakeDataUserTournament(numberFake: number, startScore: number, minDistance: number, maxDistance: number, seed: string): IDataPlayer_LEADERBOARD[] {

        // ====================== B1: fake index list fake ImageAndName
        let listTemp100Num = Array.from({ length: 100 }, (_, i) => i);
        // shuffle that list
        listTemp100Num = shuffleArrayWithSeed(seed, listTemp100Num);
        // just get the first number bot
        const listFakeImageAndName: number[] = listTemp100Num.slice(0, numberFake);
        // ====================== B2: fake score
        let listFakeScore: number[] = [];
        for (let i = 0; i < numberFake; i++) {
            listFakeScore = randomListIntWithSeedSpecial(seed + i, 1, minDistance, maxDistance, startScore);
        }

        // Set up
        let tempList: IDataPlayer_LEADERBOARD[] = [];
        let oldScore = startScore;
        for (let i = 0; i < numberFake; i++) {
            let score;
            if (i >= listFakeScore.length) {
                let distance = Math.abs(randomWithSeed(seed + i, minDistance, maxDistance));
                score = oldScore + distance;
                // score = Math.floor(Math.random() * (oldScore + distance - oldScore + 1)) + oldScore;
            } else {
                score = listFakeScore[i];
            }

            oldScore = score;

            const indexChoiceAvatarURL = (i >= listFakeImageAndName.length || listFakeImageAndName.length == 0 || listFakeImageAndName[i] >= this.AvatarBot.length)
                ? i % this.AvatarBot.length : listFakeImageAndName[i];
            const indexChoiceCountryCode = (i >= listFakeImageAndName.length || listFakeImageAndName.length == 0 || listFakeImageAndName[i] >= Utils.arrDefault_CountryCodes.length)
                ? i % Utils.arrDefault_CountryCodes.length : listFakeImageAndName[i];
            const indexUserName = (i >= listFakeImageAndName.length || listFakeImageAndName.length == 0 || listFakeImageAndName[i] >= this.NameBot.length)
                ? i % this.NameBot.length : listFakeImageAndName[i];

            let tempJson: IDataPlayer_LEADERBOARD = {
                rank: i + 1,
                avatar: this.AvatarBot[indexChoiceAvatarURL],
                name: this.NameBot[indexUserName],
                score: score,
                playerId: this.NameBot[indexUserName],
            }

            tempList.push(tempJson);
        }

        return tempList;
    }

    public static getTempListUserLeaderboard() {
        // set data player
        const dataPlayer: IDataPlayer_LEADERBOARD = {
            rank: 51,
            score: 7,
            avatar: null,
            name: MConfigFacebook.Instance.playerName,
            playerId: MConfigFacebook.Instance.playerID
        }

        let maxPlayer = 20;

        // set data temp
        let tempList = [];
        for (let i = 0; i < maxPlayer; i++) {
            let tempJson: IDataPlayer_LEADERBOARD = {
                rank: i + 1,
                avatar: null,
                name: "No1LeftBehind",
                score: maxPlayer - i,
                playerId: "No1LeftBehind",
            }

            tempList.push(tempJson);
        }

        let indexTruePlayer = randomRangeInt(0, maxPlayer - 2);
        let TrueDataPlayer = dataPlayer;
        TrueDataPlayer.rank = indexTruePlayer + 1;
        tempList[indexTruePlayer] = TrueDataPlayer;
        MConsolLog.Log("true player :" + indexTruePlayer);

        let indexFalsePlayer = randomRangeInt(indexTruePlayer + 2, maxPlayer - 1);
        // let indexFalsePlayer = indexTruePlayer + 3;
        tempList.splice(indexFalsePlayer, 0, TrueDataPlayer);
        // MConsolLog.Log("false player :" + indexFalsePlayer);
        // MConsolLog.Log("tempData: " + tempList);

        return tempList;
    }

    public static dataBotFriend = [];
    public static getTempListFriends() {
        let tempList = [];

        for (let i = 0; i < 100; i++) {
            let tempFriend: IDataPlayer_LEADERBOARD = {
                rank: i + 1,
                avatar: this.AvatarBot[i % 81],
                name: this.NameBot[i],
                playerId: null,
                score: 0
            }
            tempList.push(tempFriend);
        }

        return tempList;
    }

    public static getTempDataLiveTournaments() {
        let tempList = [];

        for (let i = 0; i < 5; i++) {
            let tempJson = {
                idTournament: i,
                titleTournament: 'Tournament ' + (i + 1),
                dateTournament: '06 day 12h',
                typePrize: i,
                players: MConfigs.getTempListUserLeaderboard()
            };
            tempList.push(tempJson);
        }

        return tempList;
    }

    public static getRandomBotFriend(): { data, score; } {
        let index = randomRangeInt(1, 99);
        MConsolLog.Log("number score play random", MConfigs.TEMP_SCORE_PLAY_1VS1_RANDOM.length);
        return { data: MConfigs.dataBotFriend[index], score: MConfigs.TEMP_SCORE_PLAY_1VS1_RANDOM[index] };
    }

    public static getTempDataDaily(numberDay: number, month: number, year: number) {
        let result: DayDailyInfo[] = [];
        for (let i = 0; i < numberDay; i++) {
            let tDayDailyInfor = new DayDailyInfo();
            tDayDailyInfor.day = i + 1;
            tDayDailyInfor.month = month;
            tDayDailyInfor.year = year;
            tDayDailyInfor.isDone = true;
            result.push(tDayDailyInfor);
        }
        return result;
    }

    public static LogScore(t: string, arr: IDataPlayer_LEADERBOARD[]) {
        let listScore = [];
        arr.forEach(item => {
            listScore.push(item.score);
        });
        console.log(t, listScore);
    }
    //#endregion

    //#region playfab
    public static testIdFacebook = null;
    //#endregion

    public static scaleBG: number = 1;

    public static isMobile: boolean = false;


}

export { MConfigs };

