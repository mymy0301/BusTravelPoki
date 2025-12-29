import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to a 32-bit integer
    }
    return hash;
}

export function randomWithSeed(seed: string, min: number, max: number): number {
    const seedNumber = hashString(seed);
    let x = Math.sin(seedNumber);
    return Math.floor(x * (max - min)) + min;
}

export function randomWithSeed_2(seed: string, min: number, max: number): number {
    const seedNumber = hashString(seed);
    let x = Math.sin(seedNumber) * 10000;
    const r = x - Math.floor(x);
    return Math.floor(r * (max - min + 1)) + min
}

export function randomListIntWithSeedSpecial(seed: string, length: number, distance: number, star: number, rateToIncrease: number): number[] {
    let result = [];
    for (let i = 0; i < length; i++) {
        const randDistance = Math.abs(randomWithSeed(seed + i, 0, distance));
        // bot chỉ có 80% khả năng được tăng điểm
        const rateIncreaseScore = Math.abs(randomWithSeed(seed + (i * -1).toString(), 0, 100));
        if (i == 0) {
            result.push(star + randDistance);
        } else {
            if (rateIncreaseScore > (100 - rateToIncrease)) {
                result.push(result[i - 1] + randDistance);
            } else {
                result.push(result[i - 1]);
            }
        }
    }
    return result;
}

export function randomListScoreForTileRace(seed: string, length: number, distance: number, start: number, rateToIncrease: number, maxScoreLimit: number): number[] {

    /**
     * logic khi sinh số ngẫu nhiên ở đây đó là 
     * Khi ở lượt random thứ x của bot đạt đc A mà A ko đạt được số điểm đạt maxScoreLimit <= A + (length - x - 1);
     * => A bắt buộc phải = maxScoreLimit - (length - x + 1)
     * => còn lại thì cứ thuận nước đẩy thuyền theo random
     */

    let result = [];
    for (let i = 0; i < length; i++) {
        // in case the old progress is max limit => just add max limit to the next progress to reduce time random
        if (i > 0 && result[i - 1] >= maxScoreLimit) {
            result.push(maxScoreLimit);
            continue;
        }

        // in case the old progress is not max limit => random
        const randDistance = Math.abs(randomWithSeed(seed + i, 0, distance));
        // bot chỉ có 80% khả năng được tăng điểm
        const rateIncreaseScore = Math.abs(randomWithSeed(seed + (i * -1).toString(), 0, 100));
        if (i == 0) {
            result.push(start);
        } else {
            let newScore = 0;
            if (rateIncreaseScore > (100 - rateToIncrease)) {
                newScore = result[i - 1] + randDistance;
                // in case max score limit
                if (newScore > maxScoreLimit) {
                    newScore = maxScoreLimit;
                }
            } else {
                newScore = result[i - 1];
            }
            result.push(newScore);
        }
    }

    // choice random 1 player win 1-4 not 0
    const indexBotWin = Math.abs(randomWithSeed(seed, 1, 4));
    // use logic to make bot win can win
    let listScore = result[indexBotWin];
    for (let i = length - 1; i >= 10; i--) {
        if (listScore[i] < maxScoreLimit - (length - i - 1)) {
            listScore[i] = maxScoreLimit - (length - i - 1);
        }
    }
    result[indexBotWin] = listScore;

    return result;
}

/**
 * this func will return index pass 0 because index 0 is player
 * @param seed 
 * @param maxNumBot 
 * @returns 
 */
export function randomIndexBotWin(seed: string, maxNumBot: number): number {
    return Math.abs(randomWithSeed(`${seed}_index_bot_win`, 1, maxNumBot));
}

/**
 * this func use for random bot auto win not stop any time
 * @param seed 
 * @param numTimeEachBotHave 
 * @param timeMin 
 * @param timeMax 
 * @returns 
 */
export function randomListTimeForTileRaceWin(seed: string, numTimeEachBotHave: number, timeMin: number, timeMax: number): number[] {
    /**
     * logic khi sinh số ngẫu nhiên ở đây đó là 
     * Khi ở lượt random thứ x của bot thì ta sẽ random bằng 1/10 - 1/9 max thời gian mà bot sẽ win 
     */
    let result: number[] = [];
    for (let i = 0; i < numTimeEachBotHave; i++) {
        const randDistance = Math.abs(randomWithSeed(seed + i, timeMin, timeMax));
        if (i == 0) {
            result.push(randDistance);
        } else {
            result.push(result[i - 1] + randDistance);
        }
    }

    return result;
}

/**
 * this func use for random bot auto win stop some time
 * @param seed 
 * @param numTimeEachBotHave 
 * @param timeMin 
 * @param timeMax 
 * @returns 
 */
export function randomListTimeForTileRaceWin2(seed: string, numTimeEachBotHave: number, timeMin: number, timeMax: number, rateCanIncrease: number): number[] {
    /**
     * logic khi sinh số ngẫu nhiên ở đây đó là 
     * Khi ở lượt random thứ x của bot thì ta sẽ random khoảng thời gian mà bot có thể win
     * và bot có tỉ lệ tăng điểm 
     */

    let result: number[] = [];
    for (let i = 0; i < numTimeEachBotHave; i++) {
        let canPass: boolean = false;
        let timeAddMore: number = 0;
        let numTimeAddMore: number = 0;  // just can add more time 3 times; to force out of while loop
        while (!canPass) {
            const randDistance = Math.abs(randomWithSeed(seed + i, timeMin, timeMax));
            const rateIncrease = Math.abs(randomWithSeed(`${seed}_${i}_rate`, 0, 100));
            if (rateIncrease > (100 - rateCanIncrease) || numTimeAddMore == 3) {
                if (i == 0) {
                    result.push(randDistance);
                } else {
                    result.push(result[i - 1] + randDistance + timeAddMore);
                }

                // pass the while
                canPass = true;
                timeAddMore += randDistance;
            } else {
                timeAddMore += randDistance;
                numTimeAddMore += 1;
            }
        }
    }

    return result;
}

export function shuffleArrayWithSeed(seed: string, array: any): any[] {
    let result = [...array];
    const hashKey = hashString(seed);
    const resultLength = result.length;
    for (let i = 0; i < resultLength; i++) {
        let j = (hashKey % (i + 1) + i) % resultLength;
        let temp = result[i];;
        result[i] = result[j];
        result[j] = temp;
    }
    return result;
}

export function randomListOfListWithSeed<T>(seed: string, length: number, listRandom: T[]): T[] {
    if (length > listRandom.length) { return null; }

    let result: T[] = [];

    for (let i = 0; i < length; i++) {
        let newSeed = seed + i;
        let indexRandom = Math.abs(randomWithSeed(newSeed, 0, listRandom.length - 1));
        result.push(listRandom[indexRandom]);
    }

    return result;
}

export function randomValueOfList<T>(seed: string, listRandom: T[]): T {
    let indexRandom = Math.abs(randomWithSeed(seed, 0, listRandom.length - 1));
    return listRandom[indexRandom];
}

export function randomListOfTheRangeWithNotSameValue<T>(seed: string, length: number, listRandom: T[]): T[] {
    if (length > listRandom.length) { return null; }

    let result: T[] = [];

    // creat 2 set used and remain index
    let usedIndices = new Set<number>();
    let remainIndices: number[] = [];
    for (let i = 0; i < listRandom.length; i++) {
        remainIndices.push(i);
    }

    // loop and random in the list remain to add to used Indices
    for (let i = 0; i < length; i++) {
        let indexRandom: number;

        switch (true) {
            case remainIndices.length > 1:
                // random the value of the listRemain
                const newSeed = `${seed}_${i}}`;
                indexRandom = randomValueOfList(newSeed, remainIndices);

                usedIndices.add(indexRandom);
                remainIndices.splice(remainIndices.findIndex(value => value == indexRandom), 1);
                result.push(listRandom[indexRandom]);
                break;
            case remainIndices.length == 1:
                indexRandom = remainIndices[0];
                usedIndices.add(indexRandom);
                remainIndices.splice(remainIndices.findIndex(value => value == indexRandom), 1);
                result.push(listRandom[indexRandom]);
                break;
        }
    }
    return result;
}