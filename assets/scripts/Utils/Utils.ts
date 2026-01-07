import { _decorator, Component, EPhysics2DDrawFlags, error, Node, PhysicsSystem2D, randomRange, randomRangeInt, Rect, screen, UITransform, Vec2, Vec3, Enum, Size, find, Graphics, Color, macro } from 'cc';
import { lodash } from '../framework/lodash';
import { TYPE_ITEM, TYPE_PRIZE } from './Types';
import { MConfigs } from '../Configs/MConfigs';
import { MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('Utils')
export class Utils {

    public static DrawPhysicsDebugging() {
        const system = PhysicsSystem2D.instance;

        // Physics timestep, default fixedTimeStep is 1/60
        system.fixedTimeStep = 1 / 30;

        // The number of iterations per update of the Physics System processing speed is 10 by default
        system.velocityIterations = 8;

        // The number of iterations per update of the Physics processing location is 10 by default
        system.positionIterations = 8;

        let nodePhysicDebug = find('Canvas/PHYSICS_2D_DEBUG_DRAW');
        if (nodePhysicDebug != null) {
            nodePhysicDebug.active = true;
        }

        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;


        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
        //     EPhysics2DDrawFlags.Pair |
        //     EPhysics2DDrawFlags.CenterOfMass |
        //     EPhysics2DDrawFlags.Joint |
        //     EPhysics2DDrawFlags.Shape;

    }

    public static UnDrawPhysicsDebugging() {
        let nodePhysicDebug = find('Canvas/PHYSICS_2D_DEBUG_DRAW');
        if (nodePhysicDebug != null) {
            nodePhysicDebug.active = false;
        }
    }

    public static DrawALine(graphics: Graphics, posStart: Vec2, listNextPos: Vec2[], color: Color) {
        const g = graphics;
        // draw by graphics
        g.lineWidth = 2;
        g.fillColor = color;
        g.moveTo(posStart.x, posStart.y);
        for (const point of listNextPos) {
            g.lineTo(point.x, point.y);
        }
        g.close();
        g.stroke();
        g.fill();
    }

    /**
     * @param map 
     * @returns 
     */
    public static SortMapByKey(map: Map<any, any>): Map<any, any> {
        // Convert Map to an array of key-value pairs, then sort the array by key
        const sortedEntries = [...map.entries()].sort(([keyA], [keyB]) => {
            // Sorting by key
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });

        // Create a new Map from the sorted array of entries
        return new Map(sortedEntries);
    }

    public static GetPointBetweenTwoPointsVec2(p1: Vec2, p2: Vec2): Vec2 {
        return new Vec2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    }

    public static GetPointBetweenTwoPointsVec3(p1: Vec3, p2: Vec3): Vec3 {
        return new Vec3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
    }

    public static ConvertPosToWorldOfANode(wPosOrigin: Vec3, pos: Vec3, ratioConvert: number): Vec3 {
        const wPosConvert: Vec3 = wPosOrigin.clone().add3f(pos.x * ratioConvert, pos.y * ratioConvert, 0);
        return wPosConvert
    }

    public static ConvertWPosToPosOfANode(wPosStart: Vec3, wPosEnd: Vec3) {
        // caculate distance between wPosConvert and nNode
        const newPos = new Vec3(wPosEnd.x - wPosStart.x, wPosEnd.y - wPosStart.y, 0);
        return newPos;
    }

    public static ConvertVec2ToVec3(vec2: Vec2): Vec3 {
        return new Vec3(vec2.x, vec2.y, 0);
    }

    public static ConvertVec3ToVec2(vec3: Vec3): Vec2 {
        return new Vec2(vec3.x, vec3.y);
    }

    public static GetDistanceTwoRect(rect1: Rect, rect2: Rect): number {
        return Math.sqrt(Math.pow(rect1.x - rect2.x, 2) + Math.pow(rect1.y - rect2.y, 2));
    }

    public static RandomPosInARound(wLoc: Vec3, radius?: number): Vec2 {
        let random = randomRange(0, 2);

        let r = (radius == null ? 30 : radius) * Math.sqrt(random);
        let theta = random * 2 * Math.PI;
        let x = wLoc.x + r * Math.cos(theta);
        let y = wLoc.y + r * Math.sin(theta);

        return new Vec2(x, y);
    }

    public static RandomPosInAroundHalfUp(wLoc: Vec3, radius?: number): Vec2 {
        let random = randomRange(0, 2);

        let r = (radius == null ? 30 : radius) * Math.sqrt(random);
        let theta = random / 2 * Math.PI;
        let x = wLoc.x + r * Math.cos(theta);
        let y = wLoc.y + r * Math.sin(theta);

        return new Vec2(x, y);
    }

    /**ms: miliseconds */
    public static delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

    public static delay1Frame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }

    public static getLengthOfEnum(tEnum): number {
        return Object.keys(tEnum).length / 2;
    }

    /**
     * Lưu ý func này chỉ phù hợp vs enum có value là number
     * @param tEmun 
     * @returns 
     */
    public static getMapEnum(tEmun) {
        return Object.keys(tEmun)
            .filter(key => isNaN(Number(key))) // Lọc ra các keys (không phải chỉ số)
            .reduce((acc, key) => {
                const value = tEmun[key as keyof typeof tEmun];
                acc[value] = key;
                return acc;
            }, {} as { [key: number]: string });
    }

    /**
     * Lưu ý func này chỉ phù hợp vs enum có value là number
     * @param tEnum Enum
     * @param valueCheck Ex: TEnum.A
     * @returns 
     */
    public static getIndexOfEnum(tEnum, valueCheck): number {
        const listNameKeys = this.getMapEnum(tEnum);
        const listKeys = Object.keys(tEnum).filter(key => isNaN(Number(key)));
        return listKeys.indexOf(listNameKeys[valueCheck]);
    }

    public static GetListValueEnum(tEnum): any[] {
        return Object.keys(tEnum)
            .map(key => tEnum[key]);
    }

    //#region COMMON
    public static randomValueOfList(list: any) {
        const randomValue = list[Math.floor(Math.random() * list.length)];
        return randomValue;
    }

    public static getRandomPointOnCircle(center: Vec2, radius: number = 80): { x: number, y: number; } {
        const angle = Math.random() * 2 * Math.PI;
        const x = radius * Math.cos(angle) + center.x;
        const y = radius * Math.sin(angle) + center.y;
        return { x, y };
    }

    public static shuffleList(inputList: any[]): any[] {
        const indexes: any[] = [];
        for (let i = 0; i < inputList.length; i++) {
            indexes.push(i);
        }
        for (let i = inputList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
        }
        let result = [];
        indexes.forEach(index => result.push(inputList[index]));
        return result;
    }

    public static shuffleListWithCoupleValue(inputList: any[]): any[] {
        // ở đây chúng ta sẽ chia nhỏ tiếp ra thành những nhóm cứ 2 đối tượng gộp vào 1 để khi shuffle xong ta luôn shuffle dc 2 đối tượng liền nhau ko bị lẻ.
        // Sau đó chúng ta sẽ flat map ra để ko bị lỗi
        const couples: any[][] = [];
        for (let i = 0; i < inputList.length; i += 2) {
            if (i + 1 < inputList.length) {
                couples.push([inputList[i], inputList[i + 1]]);
            } else {
                couples.push([inputList[i]]);
            }
        }
        for (let i = couples.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [couples[i], couples[j]] = [couples[j], couples[i]];
        }
        const result = couples.flat();
        return result;
    }

    public static shuffleListForced(inputList: any[]): any[] {
        if (inputList.length <= 1) return [...inputList];

        let result = [...inputList];  // Clone
        let attempts = 0;
        const maxAttempts = 50;

        do {
            // Reset về bản gốc mỗi lần thử
            result = [...inputList];

            // Fisher-Yates shuffle
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }
            attempts++;
        } while (this.arraysEqual(inputList, result) && attempts < maxAttempts);

        // Nếu vẫn giống sau maxAttempts, force swap 2 phần tử
        if (this.arraysEqual(inputList, result) && result.length >= 2) {
            [result[0], result[1]] = [result[1], result[0]];
        }

        return result;
    }

    private static arraysEqual(a: any[], b: any[]): boolean {
        return a.length === b.length && a.every((val, index) => val === b[index]);
    }

    public static randomListOfTheRangeWithNotSameValue(length: number, start: number, distance: number) {
        let result = [];
        for (let i = 0; i < length; i++) {
            result.push(start + i * distance);
        }
        result.sort(() => Math.random() - 0.5);
        // tron mang ngau nhien
        return result;
    }

    public static randomListValueOfList(numberItem: number, list: any[]) {
        if (numberItem > list.length || numberItem == 0) { return []; }

        let indexList = [];
        for (let i = 0; i < list.length; i++) {
            indexList.push(i);
        }

        // sort theo thu tu ngau nhien
        indexList.sort(() => Math.random() - 0.5);

        let result = [];
        for (let i = 0; i < numberItem; i++) {
            result.push(list[indexList[i]]);
        }
        return result;
    }

    public static randomWithRate(rate: number): boolean {
        return Math.random() < rate / 100;
    }

    public static randomInRangeRate(minRate: number, maxRate: number, rangeMin: number, rangeMax: number): boolean {
        const randomValue = Math.random();
        const result = (rangeMax - rangeMin) * randomValue + rangeMin;
        return minRate <= result && result <= maxRate
    }

    public static mapOfListNumber(tList: number[]): Map<number, number> {
        let countMap = new Map<number, number>();
        for (let i = 0; i < tList.length; i++) {
            countMap.set(tList[i], (countMap.get(tList[i]) || 0) + 1);
        }
        return countMap;
    }

    public static compare2Array(arr1: any[], arr2: any[]) {
        if (arr1.length !== arr2.length) {
            return false;
        }

        return arr1.every(element => arr2.indexOf(element) != -1);
    }

    public static GetNumericalOrder(number: number): string {
        let j = number % 10;
        let k = number % 100;
        if (j == 1 && k != 11) {
            return number + "st";
        }
        if (j == 2 && k != 12) {
            return number + "nd";
        }
        if (j == 3 && k != 13) {
            return number + "rd";
        }
        return number + "th";
    }

    public static CompareTwoSet(setA: Set<any>, setB: Set<any>): boolean {
        return setA.size === setB.size &&
            [...setA].every((x) => setB.has(x));
    }

    public static CheckMapHasValue(map: Map<any, any>, value: any): boolean {
        return Array.from(map.values()).some((x) => x === value);
    }

    /**
     * Hàm này sẽ resolve khi function truyền vào trả về true
     * @param cbDone
     * @param timeRepeatCheck : milisecond
     * @returns 
     */
    public static WaitReceivingDone(cbDone: CallableFunction, timeRepeatCheck: number = 0.5) {
        return new Promise<void>((resolve) => {
            let ttId = setInterval(() => {
                if (cbDone()) {
                    clearInterval(ttId);
                    resolve();
                }
            }, timeRepeatCheck, macro.REPEAT_FOREVER, 0)
        })
    }

    /**
     * if not valid return -1 
     * @param ratio 
     * @param min 
     * @param max 
     * @returns min + (max - min) * ratio
     */
    public static GetValueFromToRangeWithRatio(ratio: number, min: number, max: number) {
        if (max <= min) return -1;
        return min + (max - min) * ratio;
    }
    //#endregion

    //#region SIZE WINDOW
    public static getSizeWindow(): Size {
        console.log("isMobile", MConfigs.isMobile);
        console.log("screen.windowSize", screen.windowSize);
        if (!MConfigs.isMobile) return Utils.getSizeDefault();
        let newH: number = 0;
        let newW: number = 0;
        let scaleW = screen.windowSize.width / 720;
        let scaleH = screen.windowSize.height / 1280;
        if (scaleW > scaleH) {
            newW = screen.windowSize.width / scaleH;
            newH = 1280;
        }
        else {
            newH = screen.windowSize.height / scaleW;
            newW = 720;
        }

        return new Size(newW, newH);
    }

    public static checkIsDesktopSize(): boolean {
        if (screen.windowSize.width / screen.windowSize.height < MConst.DEFAULT_DESKTOP_WIDTH / MConst.DEFAULT_DESKTOP_HEIGHT) return false;
        return true;
    }

    public static getRightScaleSizeWindow(): number {
        if (!MConfigs.isMobile) return 1;
        let sizeCacul = Utils.getSizeWindow();
        let scaleH = sizeCacul.height / 1280;
        return scaleH;
    }

    public static getMiddleWPosWindow(): Vec3 {
        const sizeWindow = Utils.getSizeWindow();
        return new Vec3(sizeWindow.width / 2, sizeWindow.height / 2, 0);
    }

    public static getMiddleWPosWindowWithRealScale(): Vec3 {
        const sizeWindow = screen.windowSize;
        return new Vec3(sizeWindow.width / 2, sizeWindow.height / 2, 0);
    }

    public static ratioScene() {
        return (screen.windowSize.width / screen.windowSize.height) / (720 / 1280);
    }

    public static isSceneScaleWidth(): boolean {
        let scaleW = screen.windowSize.width / 720;
        let scaleH = screen.windowSize.height / 1280;
        return scaleW > scaleH ? false : true;
    }

    public static isFitHeight(): boolean {
        if (!MConfigs.isMobile) return false;
        if (screen.windowSize.width / screen.windowSize.height > 720 / 1280) {
            return true;
        }
        return false;
    }

    public static getScaleWindow(): number {
        if (!MConfigs.isMobile) return 1;
        // console.log("getScaleWindow", screen.windowSize.width, screen.windowSize.height);
        if (screen.windowSize.width / screen.windowSize.height < 720 / 1280) {
            return (720 / 1280) / (screen.windowSize.width / screen.windowSize.height);
        } else {
            return (screen.windowSize.width / screen.windowSize.height) / (720 / 1280);
        }
    }

    public static getSizeDefault(): Size {
        if (!MConfigs.isMobile) return new Size(MConst.DEFAULT_DESKTOP_WIDTH, MConst.DEFAULT_DESKTOP_HEIGHT);
        return new Size(720, 1280);
    }

    public static getScreenWindowSize() {
        return screen.windowSize.clone();
    }
    //#endregion SIZE WINDOW

    //#region TIME
    /**
     * this.func will return a array [mm:ss] 
     */
    public static FormatTimeToString(time: number): { minute: string, second: string; } {
        if (time <= 0) { return { minute: "00", second: "00" }; }

        let minute = 0; let minuteResult = null;
        let second = 0; let secondResult = null;

        minute = Math.floor(time / 60);
        second = Math.floor(time % 60);

        if (minute < 10) minuteResult = "0" + minute; else minuteResult = minute.toString();
        if (second < 10) secondResult = "0" + second; else secondResult = second.toString();

        // return {minute: "00", second: "00"};
        return { minute: minuteResult, second: secondResult };
    }

    /**
     * convert time to format hh:mm
     * ```
     * hh == 0 => mm
     * @param timeDistance second
     */
    public static convertTimeToStringFormat(timeLength: number) {
        const days = Math.floor(timeLength / (60 * 60 * 24));
        const hours = Math.floor((timeLength % (60 * 60 * 24)) / (60 * 60)) + Math.floor(timeLength / (60 * 60 * 24)) * 24;
        const minutes = Math.floor((timeLength % (60 * 60)) / 60);
        const second = Math.floor(timeLength % 60);

        // const resultDays = days >= 10 ? days : "0" + days;
        const resultDays = days;
        const resultHours = hours >= 10 ? hours : "0" + hours;
        const resultMinutes = minutes >= 10 ? minutes : "0" + minutes;
        const resultSeconds = second >= 10 ? second : "0" + second;

        let formattedTime;
        if (hours > 0) {
            formattedTime = `${resultHours}:${resultMinutes}:${resultSeconds}`;
        } else if (minutes > 0) {
            formattedTime = `${resultMinutes}:${resultSeconds}`;
        } else {
            formattedTime = `00:${resultSeconds}`;
        }

        // MConsolLog.Log("Remaining time for the tournament: " + formattedTime);
        return formattedTime;
    }

    /**
     * convert to second time
     * @param timeInput must has formal hh:mm:ss
     */
    public static convertFormatStringToTime(timeInput: string): number {
        if (!timeInput) return -1;
        try {
            const parts = timeInput.split(':').map(Number);
            if (parts.length === 3) {
                // hh:mm:ss
                return parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                // mm:ss
                return parts[0] * 60 + parts[1];
            } else if (parts.length === 1) {
                // ss
                return parts[0];
            }
            return -1;
        } catch (e) {
            console.error("can not convert time right");
            return -1;
        }
    }

    public static getSecondNow() {
        return Math.floor(Date.now() / 1000);
    }

    public static getCurrDate() {
        let date = new Date();
        let currDay = date.getUTCDate();
        return currDay;
    }

    public static getCurrMonth() {
        let date = new Date();
        let currMonth = date.getUTCMonth();
        return currMonth;
    }

    public static getCurrYear() {
        let date = new Date();
        let currYear = date.getUTCFullYear();
        return currYear;
    }

    public static getCurrTime() {
        let date = new Date();
        return Math.floor(date.getTime() / 1000);
    }

    public static getTimeByData(day: number, month: number, year: number) {
        let date = new Date();
        date.setFullYear(year, month - 1, day);
        date.setHours(0, 0, 0);
        return Math.floor(date.getTime() / 1000);
    }

    public static getCurrTimeUTC2() {
        let date = new Date();
        return date.getTime();
    }

    public static getCurrDayOfMonth() {
        let date = new Date();
        let currDayOfMonth = date.getDate();
        return currDayOfMonth;
    }

    public static getNumberDaysOfMonth(month: number, year: number) {
        const daysInMonth: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month < 0 || month > 11) {
            if (month < 1) {
                month = 12 - Math.abs(month % 12);
            } else {
                month = Math.abs(month % 12);
            }
        }

        if (month === 1 && (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0))) {
            return 29;
        }

        return daysInMonth[month];
    }

    public static getMonthString(month: number): string {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        if (month < 0 || month > 11) {
            if (month < 1) {
                month = 12 - Math.abs(month % 12);
            } else {
                month = Math.abs(month % 12);
            }
        }

        return monthNames[month];
    }

    public static checkSameTimeMonth(dateCheck: Date): boolean {
        let dateNow = new Date();
        return dateCheck.getFullYear() == dateNow.getFullYear() && dateCheck.getMonth() == dateNow.getMonth();
    }

    public static CheckTimeIsInToday(timeCheck: number): boolean {
        let fTimeToday = this.getTimeToDayUTC() / 1000;
        let lTimeToday = this.getTimeLastDayUTC() / 1000;
        // console.log("Check time today and time lastDay", fTimeToday, lTimeToday, timeCheck);
        return timeCheck >= fTimeToday && timeCheck <= lTimeToday;
    }

    public static CheckTimeIsInTodayNoUTC(timeCheck: number): boolean {
        let fTimeToday = this.getTimeFirstToday() / 1000;
        let lTimeToday = this.getTimeLastDay() / 1000;
        // console.log("Check time today and time lastDay", fTimeToday, lTimeToday, timeCheck);
        return timeCheck >= fTimeToday && timeCheck <= lTimeToday;
    }

    public static getDate() { return new Date(); }

    public static convertStringTime(day: number, month: number, year: number): string {
        return `${day}/${month + 1}/${year}`;
    }

    public static getTimeToDayUTC(): number {
        const myDate = new Date(); myDate.setUTCHours(0, 0, 0, 0);
        const nowDate = new Date(Date.UTC(myDate.getUTCFullYear(), myDate.getUTCMonth(), myDate.getUTCDate()));
        // console.warn(nowDate.getTime());
        return nowDate.getTime();
    }

    public static getTimeToDayLocal(): number {
        let myDate = new Date();
        const nowDate = new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate());
        nowDate.setHours(0, 0, 0, 0);
        return nowDate.getTime();
    }

    public static getTimeFirstToday(): number {
        let myDate = new Date();
        myDate.setHours(0, 0, 0, 0);
        return myDate.getTime();
    }

    public static getTimeLastDay(): number {
        let myDate = new Date();
        myDate.setHours(23, 59, 59);
        return myDate.getTime();
    }

    public static getTimeLastDayUTC(): number {
        let myDate = new Date();
        const nowDate = new Date(Date.UTC(myDate.getUTCFullYear(), myDate.getUTCMonth(), myDate.getUTCDate()));
        nowDate.setHours(23, 59, 59, 0);
        return nowDate.getTime();
    }

    public static getTimeLastDayUTCWithTime(time: number): number {
        let myDate = new Date(time);
        myDate.setHours(23, 59, 59, 999);
        return myDate.getTime();
    }

    public static getTimeFirstWeekNow() {
        const dateNow = new Date();
        const firstDayOfWeek = dateNow.getUTCDay();
        const monthNow = dateNow.getUTCMonth();
        const yearNow = dateNow.getUTCFullYear();
        return new Date(Date.UTC(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate())).getTime();
    }

    public static getFirstTimeToday(): number {
        let dataNow = new Date();
        dataNow.setUTCHours(0, 0, 0, 0);
        return dataNow.getTime();
    }

    public static compareDateIsNextDay(dateCompare: number) {
        const myDate = new Date(); myDate.setUTCHours(0, 0, 0, 0);
        const nowDate = new Date(Date.UTC(myDate.getUTCFullYear(), myDate.getUTCMonth(), myDate.getUTCDate()));
        // const playerDate = new Date(Date.UTC(dateCompare.getUTCFullYear(), dateCompare.getUTCMonth(), dateCompare.getUTCDate()));
        // console.log(("Check time to new day"), (nowDate.getTime() - dateCompare) / 1000 / 60 / 60 /24 , dateCompare , nowDate.getTime());

        return dateCompare == 0 || (nowDate.getTime() - dateCompare) / 1000 / 60 / 60 / 24 >= 1;
    }

    public static compareDateIsNextOfOtherDate(dateCompare: number, dateRoot: number) {
        const diffTime = dateCompare - dateRoot;
        return diffTime > 1000 * 60 * 60 * 24;
    }

    public static compareDateIsNextDayLocal(dateCompare: number) {
        const myDate = new Date(); myDate.setUTCHours(0, 0, 0, 0);
        const nowDate = new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate());
        return dateCompare == 0 || (nowDate.getTime() - dateCompare) / 1000 / 60 / 60 / 24 >= 1;
    }

    public static compareDateIsPassWeek(dateCompare: number) {
        const date_Compare = new Date(dateCompare);
        const date_Now = new Date();
        const diffDay = Math.ceil(Math.abs(date_Now.getTime() - date_Compare.getTime()) / (1000 * 60 * 60 * 24));

        // so sánh khoảng cách giữa hai ngày nữa vì có thể người chơi lâu rùi không đăng nhập vẫn được tính
        // so sánh ngày trong tuần với nhau nếu ngày so sánh lơn hơn ngày hiện tại thì chắc 100% là của tuần trước rùi
        if (date_Compare.getUTCDay() > date_Now.getUTCDay() || diffDay > 7) {
            return true;
        }
        return false;
    }

    public static getTimeRemainingFromNowToEndWeek() {
        const endWeek = new Date();
        const currentDay = endWeek.getUTCDay();  // Get current day of the week (0 = Sunday, 6 = Saturday)
        const daysUntilSunday = (7 - currentDay) % 7;  // Calculate days remaining until Sunday

        // Set the date to the end of the current week (Sunday at 23:59:59.999)
        endWeek.setUTCDate(endWeek.getUTCDate() + daysUntilSunday);
        endWeek.setUTCHours(23, 59, 59, 999);  // Set time to 23:59:59.999 on Sunday

        // Return the time difference in milliseconds
        return endWeek.getTime() - Date.now();
    }

    public static getTimeRemainingFromNowToEndDay() {
        const endDay = new Date();
        endDay.setUTCHours(23, 59, 59, 999);
        return endDay.getTime() / 1000 - Utils.getCurrTime();
    }

    public static getDayOfYearUTC(day: number, month: number, year: number): number {
        let myDate = new Date(Date.UTC(year, month, day));
        myDate.setHours(0, 0, 0, 0);
        const start = new Date(myDate.getUTCFullYear(), 0, 0, 0);
        const diff = myDate.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        // console.warn("check day of year:", dayOfYear, `day: ${day}, month: ${month}, year: ${year}`);
        return dayOfYear;
    }

    public static getStartTimeOfDay(): number {
        const myDate = new Date();
        myDate.setHours(0, 0, 0, 0);
        return myDate.getTime();
    }

    public static getDaysOfMonth(year: number, month: number): number {
        console.log(month, year);
        const myDate = new Date(Date.UTC(year, month, 0));
        return myDate.getUTCDate();
    }

    public static getTimeSecondPass(time: number): number {
        return time - Utils.getCurrTime();
    }

    public static getTimeToNextDay() {
        let currDate = new Date();
        let lastDate = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
        return Math.floor((lastDate.getTime() - currDate.getTime()) / 1000) + 86400;
    }

    public static async copyData(inputCopy: string): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(inputCopy);
            return true;
        } catch (error) {
            console.error("Không thể sao chép dữ liệu:", error);
            return false;
        }
    }

    //#endregion

    //==============================================
    //#region version
    public static isLowerVersion(versionCheck: string, versionTarget: string) {
        if (versionCheck == null || versionTarget == null) { return false; }

        const listCodeVersionCheck = versionCheck.split(".");
        const listCodeVersionTarget = versionTarget.split(".");

        if (listCodeVersionCheck.length != 3 || listCodeVersionTarget.length != 3) {
            return false;
        }

        return listCodeVersionCheck[0] < listCodeVersionTarget[0]
            || listCodeVersionCheck[1] < listCodeVersionTarget[1]
            || listCodeVersionCheck[2] < listCodeVersionTarget[2];
    }
    //#endregion version
    //==============================================

    //#region COUNTRY CODES
    public static arrDefault_CountryCodes: string[] = ["ad", "ae", "af", "ag", "al", "am", "ao", "ar", "at", "au", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bn", "bo", "br", "bs", "bt", "bw", "by", "bz", "ca", "cd", "cf", "cg", "ci", "cl", "cm", "cn", "co", "cr", "cu", "cv", "cy", "cz", "ch", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "fi", "fj", "fm", "fr", "ga", "gb", "gd", "ge", "gh", "gm", "gn", "gq", "gr", "gt", "gw", "gy", "hk", "hn", "hr", "ht", "hu"
        , "id", "ie", "in", "iq", "ir", "is", "it", "jm", "jo", "jp", "ke", "kg", "ki", "km", "kp", "kr", "ks", "kw", "kz", "kg",
        "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mm", "mn", "mr", "mt", "mu", "mv", "mw", "mx", "my", "mz",
        "na", "ne", "ni", "nl", "no", "np", "nr", "nz", "ng", "om", "pa", "pe", "pg", "pk", "pl", "pt", "pw", "py", "ph", "qa", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sr", "st", "sv", "sy", "sz",
        "td", "tg", "tj", "tl", "tm", "tn", "to", "tt", "tv", "tw", "tz", "th", "tr", "ua", "ug", "us", "uy", "uz", "va", "vc", "ve", "vn", "vu", "ws", "ye", "za", "zm", "zw"];

    public static getRandomCountryCode() {
        return this.arrDefault_CountryCodes[lodash.random(0, this.arrDefault_CountryCodes.length)];
    }
    //#endregion

    //#region Color
    public static mixHexColors(color1: string, color2: string) {
        const valuesColor1 = color1.replace('#', '').match(/.{2}/g).map((value) =>
            parseInt(value, 16)
        );
        const valuesColor2 = color2.replace('#', '').match(/.{2}/g).map((value) =>
            parseInt(value, 16)
        );
        const mixedValues = valuesColor1.map((value, index) =>
            '' + ((value + valuesColor2[index]) / 2).toString(16)
        );
        return `#${mixedValues.join('')}`;
    }

    public static getRandomColor(): string {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    public static getRandomColorFromPallet(): string {
        const colorPalette = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#A633FF"];
        const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        return randomColor;
    }
    //#endregion

    //#region Convert time
    /**
     * format example 9day 12h
     * if day == 0 => hh:mm:ss
     * @param timeLength : time by timeEnd - timeStart 
     */
    public static convertTimeLengthToFormat(timeLength: number): string {
        const days = Math.floor(timeLength / (60 * 60 * 24));
        const hours = Math.floor((timeLength % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((timeLength % (60 * 60)) / 60);
        const second = Math.floor(timeLength % 60);

        // const resultDays = days >= 10 ? days : "0" + days;
        const resultDays = days;
        const resultHours = hours >= 10 ? hours : "0" + hours;
        const resultMinutes = minutes >= 10 ? minutes : "0" + minutes;
        const resultSeconds = second >= 10 ? second : "0" + second;

        let formattedTime = '';
        if (days > 0) {
            formattedTime = `${resultDays}d ${resultHours}h`;
        } else {
            formattedTime = `${resultHours}:${resultMinutes}:${resultSeconds}`;
        }

        // MConsolLog.Log("Remaining time for the tournament: " + formattedTime);
        return formattedTime;
    }

    /**
     * format example 9day 12h
     * if day == 0 => hh:mm:ss
     * @param timeLength : time by timeEnd - timeStart 
     */
    public static convertTimeLengthToFormat_ForEvent(timeLength: number): string {
        const days = Math.floor(timeLength / (60 * 60 * 24));
        const hours = Math.floor((timeLength % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((timeLength % (60 * 60)) / 60);
        const second = Math.floor(timeLength % 60);

        // const resultDays = days >= 10 ? days : "0" + days;
        const resultDays = days;
        const resultHours = hours >= 10 ? hours : "0" + hours;
        const resultMinutes = minutes >= 10 ? minutes : "0" + minutes;
        const resultSeconds = second >= 10 ? second : "0" + second;

        let formattedTime = '';
        if (days > 0 && hours >= 0) {
            formattedTime = `${resultDays}d ${resultHours}h`;
        } else if (hours > 0) {
            formattedTime = `${hours}h ${resultMinutes}m`;
        } else {
            formattedTime = `${minutes}m ${resultSeconds}s`;
        }

        // MConsolLog.Log("Remaining time for the tournament: " + formattedTime);
        return formattedTime;
    }

    /**
     * this func will return time to minute like (0-59s) => 1 
     * @param time 
     */
    public static convertTimeTourToMinute(time: number): string {
        let minute = time / 60;
        return Math.trunc(minute + 1).toString();
    }

    /**
     * this func will return time to mm:ss
     * @param time 
     */
    public static convertTimeToFormat(time: number): string {
        if (time <= 0) { return "00:00"; }
        const minutes = Math.floor((time % (60 * 60)) / 60);
        const second = Math.floor(time % 60);
        const resultMinutes = minutes >= 10 ? minutes : "0" + minutes;
        const resultSeconds = second >= 10 ? second : "0" + second;
        let formattedTime = `${resultMinutes}:${resultSeconds}`;
        return formattedTime;
    }
    //#endregion

    /**
     * you can use this func to wait a job until it done
     * @param logicResolve function logic check to return boolean
     * @param cb function call after done
     * @param time each time to call again function second
     */
    public static async MInterval(logicResolve: () => boolean, cb: CallableFunction, time: number) {
        await new Promise<void>((resolve) => {
            const interval = setInterval(() => {
                // MConsolLog.Log("check in interval", logicResolve(), time);
                if (logicResolve()) {
                    clearInterval(interval);
                    resolve();
                }
            }, time * 1000);
        });

        cb();
    }

    /**
     * this func will return string format "60,513"
     * @param score score
     */
    public static formatScore(score: number): string {
        return score.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    /**
     * 
     * @param lbScore lb score
     */
    public static convertLbScoreToScore(lbScore: string): number {
        // Remove commas from the string and parse it as a number
        try {
            return parseInt(lbScore.replace(/,/g, ''));
        } catch (e) {
            return -1;
        }
    }

    //#region Clone List
    public static CloneListDeep(data: any[]) {
        if (data == null) { return [] }
        return data.map(item => Object.create(
            Object.getPrototypeOf(item),
            Object.getOwnPropertyDescriptors(item)
        ));
    }
}

export namespace MMathUtil {
    export function getPointsOnArc(pos: Vec3, r: number, maxArc: number, pointCount: number, startAngle: number = 0): Vec3[] {
        const points: Vec3[] = [];

        if (pointCount < 0) { return null; }

        // chuyển góc => radian
        const startRad = (startAngle * Math.PI) / 180;
        const maxArcRad = (maxArc * Math.PI) / 180;
        const middleAngle = startRad + maxArcRad / 2;

        // Tính khoảng cách góc giữa các điểm
        const angleStep = pointCount === 1 ? 0 : maxArcRad / (pointCount - 1);

        let x, y;
        switch (true) {
            case pointCount == 1:
                x = pos.x;
                y = pos.y + r;
                points.push(new Vec3(x, y, pos.z));
                break;
            default:
                for (let i = 0; i < pointCount; i++) {
                    const currentAngle = startRad + (i * angleStep);

                    // Tính tọa độ điểm trên cung tròn
                    x = r * Math.cos(currentAngle);
                    y = r * Math.sin(currentAngle);

                    const wPosRight = pos.clone().add3f(x, y, 0);

                    points.push(wPosRight);
                }
                break;
        }

        return points.reverse();
    }
}


