import { _decorator, Component, Node, Vec2, Vec3, Vec4, Widget, log, director } from 'cc';
import { DIRECT_CAR, GetNameDirectionCar, M_COLOR, TYPE_CAR_SIZE } from '../../../Utils/Types';
import { Utils } from '../../../Utils/Utils';
import { MConfigs } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

enum INDEX_COLLIDER {
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_RIGHT,
    BOTTOM_LEFT
}
@ccclass('InfoCustomForColliderCar')
export class InfoCustomForColliderCar {
    public static readonly ROTATE_ANGLE = {
        Top: 0,
        TopLeft: 50,
        Left: 90,
        BottomLeft: 130,
        Down: 180,
        BottomRight: 230,
        Right: 270,
        TopRight: 310,
    }

    // // top left , top right , bottom right , bottom left
    // public static readonly CAR_4_CHO = {
    //     Top: [new Vec2(-18, 25), new Vec2(18, 25), new Vec2(18, -25), new Vec2(-18, -25)],
    //     TopLeft: [new Vec2(-30, 15), new Vec2(-10, 35), new Vec2(30, -5), new Vec2(10, -25)],
    //     Left: [new Vec2(-30, -15), new Vec2(-30, 15), new Vec2(30, 15), new Vec2(30, -15)],
    //     BottomLeft: [new Vec2(-15, -25), new Vec2(-35, -5), new Vec2(5, 35), new Vec2(25, 15)],
    //     Down: [new Vec2(20, -18), new Vec2(-20, -18), new Vec2(-20, 35), new Vec2(20, 35),],
    //     BottomRight: [new Vec2(30, -5), new Vec2(10, -25), new Vec2(-30, 15), new Vec2(-10, 35)],
    //     Right: [new Vec2(30, 15), new Vec2(30, -15), new Vec2(-30, -15), new Vec2(-30, 15)],
    //     TopRight: [new Vec2(15, 35), new Vec2(35, 15), new Vec2(-5, -25), new Vec2(-25, -5)],
    // }

    // public static readonly CAR_6_CHO = {
    //     Top: [new Vec2(-18, 30), new Vec2(18, 30), new Vec2(18, -30), new Vec2(-18, -30)],
    //     TopLeft: [new Vec2(-30, 10), new Vec2(-10, 30), new Vec2(35, -15), new Vec2(15, -35)],
    //     Left: [new Vec2(-30, -15), new Vec2(-30, 15), new Vec2(35, 15), new Vec2(35, -15)],
    //     BottomLeft: [new Vec2(-10, -35), new Vec2(-30, -15), new Vec2(15, 30), new Vec2(35, 10)],
    //     Down: [new Vec2(15, -30), new Vec2(-15, -30), new Vec2(-15, 35), new Vec2(15, 35),],
    //     BottomRight: [new Vec2(35, -15), new Vec2(15, -35), new Vec2(-30, 10), new Vec2(-10, 30)],
    //     Right: [new Vec2(35, 15), new Vec2(35, -15), new Vec2(-30, -15), new Vec2(-30, 15)],
    //     TopRight: [new Vec2(10, 35), new Vec2(30, 15), new Vec2(-15, -30), new Vec2(-35, -10)],
    // }

    // private static readonly CAR_10_CHO = {
    //     Top: [new Vec2(-18, 50), new Vec2(18, 50), new Vec2(18, -50), new Vec2(-18, -50)],
    //     TopLeft: [new Vec2(-50, 30), new Vec2(-25, 55), new Vec2(55, -25), new Vec2(30, -50)],
    //     Left: [new Vec2(-55, -20), new Vec2(-55, 15), new Vec2(60, 15), new Vec2(60, -20)],
    //     BottomLeft: [new Vec2(-30, -50), new Vec2(-55, -25), new Vec2(25, 55), new Vec2(50, 30)],
    //     Down: [new Vec2(15, -50), new Vec2(-15, -50), new Vec2(-15, 55), new Vec2(15, 55)],
    //     BottomRight: [new Vec2(55, -30), new Vec2(35, -50), new Vec2(-45, 30), new Vec2(-25, 50)],
    //     Right: [new Vec2(60, 15), new Vec2(60, -20), new Vec2(-55, -20), new Vec2(-55, 15)],
    //     TopRight: [new Vec2(25, 55), new Vec2(50, 30), new Vec2(-30, -50), new Vec2(-55, -25)],
    // }

    public static readonly CAR_4_CHO = {
        Top: [new Vec2(-20, 25), new Vec2(20, 25), new Vec2(20, -25), new Vec2(-20, -25)],
        TopLeft: [new Vec2(-32, 13), new Vec2(-8, 37), new Vec2(32, -3), new Vec2(8, -27)],
        Left: [new Vec2(-30, -17), new Vec2(-30, 17), new Vec2(30, 17), new Vec2(30, -17)],
        BottomLeft: [new Vec2(-13, -27), new Vec2(-37, -3), new Vec2(3, 37), new Vec2(27, 13)],
        Down: [new Vec2(22, -18), new Vec2(-22, -18), new Vec2(-22, 35), new Vec2(22, 35)],
        BottomRight: [new Vec2(32, -3), new Vec2(8, -27), new Vec2(-32, 13), new Vec2(-8, 37)],
        Right: [new Vec2(30, 17), new Vec2(30, -17), new Vec2(-30, -17), new Vec2(-30, 17)],
        TopRight: [new Vec2(17, 37), new Vec2(37, 17), new Vec2(-3, -27), new Vec2(-27, -3)],
    }

    public static readonly CAR_6_CHO = {
        Top: [new Vec2(-20, 30), new Vec2(20, 30), new Vec2(20, -30), new Vec2(-20, -30)],
        TopLeft: [new Vec2(-32, 8), new Vec2(-8, 32), new Vec2(37, -13), new Vec2(13, -37)],
        Left: [new Vec2(-30, -17), new Vec2(-30, 17), new Vec2(35, 17), new Vec2(35, -17)],
        BottomLeft: [new Vec2(-8, -37), new Vec2(-32, -13), new Vec2(13, 32), new Vec2(37, 8)],
        Down: [new Vec2(17, -30), new Vec2(-17, -30), new Vec2(-17, 35), new Vec2(17, 35)],
        BottomRight: [new Vec2(37, -13), new Vec2(13, -37), new Vec2(-32, 8), new Vec2(-8, 32)],
        Right: [new Vec2(35, 17), new Vec2(35, -17), new Vec2(-30, -17), new Vec2(-30, 17)],
        TopRight: [new Vec2(12, 37), new Vec2(32, 17), new Vec2(-13, -32), new Vec2(-37, -8)],
    }

    private static readonly CAR_10_CHO = {
        Top: [new Vec2(-20, 50), new Vec2(20, 50), new Vec2(20, -50), new Vec2(-20, -50)],
        TopLeft: [new Vec2(-52, 28), new Vec2(-23, 58), new Vec2(58, -23), new Vec2(28, -52)],
        Left: [new Vec2(-55, -22), new Vec2(-55, 18), new Vec2(60, 18), new Vec2(60, -22)],
        BottomLeft: [new Vec2(-28, -52), new Vec2(-58, -23), new Vec2(23, 58), new Vec2(52, 28)],
        Down: [new Vec2(17, -50), new Vec2(-17, -50), new Vec2(-17, 55), new Vec2(17, 55)],
        BottomRight: [new Vec2(58, -28), new Vec2(32, -52), new Vec2(-48, 28), new Vec2(-23, 52)],
        Right: [new Vec2(60, 18), new Vec2(60, -22), new Vec2(-55, -22), new Vec2(-55, 18)],
        TopRight: [new Vec2(28, 58), new Vec2(52, 32), new Vec2(-28, -52), new Vec2(-58, -23)],
    }

    public static readonly deepDistance = 20;
    public static readonly rangeDistance = 2;

    public static GetListConner(sizeCar: TYPE_CAR_SIZE, direction: DIRECT_CAR, colorCar: M_COLOR): Vec3[] {
        const nameDirection = GetNameDirectionCar(direction, false);

        // console.log(nameDirection);
        // let result = null;
        let result: Vec3[] = [];
        let resultTops: Vec2[] = [];
        let angle = InfoCustomForColliderCar.ROTATE_ANGLE[nameDirection];

        switch (true) {
            case sizeCar == TYPE_CAR_SIZE['4_CHO'] && colorCar != M_COLOR.REINDEER_CART:
                // result = InfoCustomForColliderCar.CAR_4_CHO[nameDirection].map(vec2 => new Vec3(vec2.x, vec2.y, 0));
                resultTops = InfoCustomForColliderCar.CAR_4_CHO["Top"];
                for (let i = 0; i < resultTops.length; i++) {
                    let pos: Vec3 = GetRotatePoint(resultTops[i].x, resultTops[i].y, 0, 0, angle);
                    result.push(pos);
                }
                // console.log(nameDirection,result);
                break;
            case sizeCar == TYPE_CAR_SIZE['4_CHO'] && colorCar == M_COLOR.REINDEER_CART:
                // result = InfoCustomForColliderCar.CAR_4_CHO[nameDirection].map(vec2 => new Vec3(vec2.x, vec2.y, 0));
                resultTops = InfoCustomForColliderCar.CAR_10_CHO["Top"];
                for (let i = 0; i < resultTops.length; i++) {
                    let pos: Vec3 = GetRotatePoint(resultTops[i].x, resultTops[i].y, 0, 0, angle);
                    result.push(pos);
                }
                // console.log(nameDirection,result);
                break;
            case sizeCar == TYPE_CAR_SIZE['6_CHO']:
                // result = InfoCustomForColliderCar.CAR_6_CHO[nameDirection].map(vec2 => new Vec3(vec2.x, vec2.y, 0));
                resultTops = InfoCustomForColliderCar.CAR_6_CHO["Top"];
                for (let i = 0; i < resultTops.length; i++) {
                    let pos: Vec3 = GetRotatePoint(resultTops[i].x, resultTops[i].y, 0, 0, angle);
                    result.push(pos);
                }
                // console.log(nameDirection,result);
                break;
            case sizeCar == TYPE_CAR_SIZE['10_CHO']:
                // result = InfoCustomForColliderCar.CAR_10_CHO[nameDirection].map(vec2 => new Vec3(vec2.x, vec2.y, 0));
                resultTops = InfoCustomForColliderCar.CAR_10_CHO["Top"];
                for (let i = 0; i < resultTops.length; i++) {
                    let pos: Vec3 = GetRotatePoint(resultTops[i].x, resultTops[i].y, 0, 0, angle);
                    result.push(pos);
                }
                // console.log(nameDirection,result);
                break;
            default:
                throw new Error(`Unsupported car size: ${sizeCar}`);
        }
        return result;
    }

    public static GetTopPointLeft(sizeCar: TYPE_CAR_SIZE, direction: DIRECT_CAR, ratioMap: number, mColorCar: M_COLOR): Vec3 {
        let listPoint: Vec3[] = this.GetListConner(sizeCar, direction, mColorCar);
        let resultP = listPoint[0].multiplyScalar(ratioMap);
        let vecMove = this.GetVec2SuitWithDirectCar(direction).multiplyScalar(this.rangeDistance);
        let deepValue = this.GetVec2SuitWithDirectCar(direction).multiplyScalar(-this.deepDistance);

        resultP = resultP
            .add(new Vec3(vecMove.y, -vecMove.x, 0))
            .add(new Vec3(deepValue.x, deepValue.y, 0));

        return resultP;
        let result: Vec2 = Vec2.ZERO;
        const nameDirection = GetNameDirectionCar(direction, false);
        switch (sizeCar) {
            case TYPE_CAR_SIZE['4_CHO']:
                result = InfoCustomForColliderCar.CAR_4_CHO[nameDirection][INDEX_COLLIDER.TOP_LEFT];
                break;
            case TYPE_CAR_SIZE['6_CHO']:
                result = InfoCustomForColliderCar.CAR_6_CHO[nameDirection][INDEX_COLLIDER.TOP_LEFT];
                break;
            case TYPE_CAR_SIZE['10_CHO']:
                result = InfoCustomForColliderCar.CAR_10_CHO[nameDirection][INDEX_COLLIDER.TOP_LEFT];
                break;
            default:
                throw new Error(`Unsupported car size: ${sizeCar}`);
        }
        return Utils.ConvertVec2ToVec3(result);
    }

    public static GetTopPointRight(sizeCar: TYPE_CAR_SIZE, direction: DIRECT_CAR, ratioMap: number, mColorCar: M_COLOR): Vec3 {
        let listPoint: Vec3[] = this.GetListConner(sizeCar, direction, mColorCar);
        let resultP = listPoint[1].multiplyScalar(ratioMap);
        let vecMove = this.GetVec2SuitWithDirectCar(direction).multiplyScalar(this.rangeDistance);
        let deepValue = this.GetVec2SuitWithDirectCar(direction).multiplyScalar(-this.deepDistance);
        resultP = resultP
            .add(new Vec3(-vecMove.y, vecMove.x, 0))
            .add(new Vec3(deepValue.x, deepValue.y, 0));

        return resultP;
        let result: Vec2 = Vec2.ZERO;
        const nameDirection = GetNameDirectionCar(direction, false);
        switch (sizeCar) {
            case TYPE_CAR_SIZE['4_CHO']:
                result = InfoCustomForColliderCar.CAR_4_CHO[nameDirection][INDEX_COLLIDER.TOP_RIGHT]; // top right
                break;
            case TYPE_CAR_SIZE['6_CHO']:
                result = InfoCustomForColliderCar.CAR_6_CHO[nameDirection][INDEX_COLLIDER.TOP_RIGHT]; // top right
                break;
            case TYPE_CAR_SIZE['10_CHO']:
                result = InfoCustomForColliderCar.CAR_10_CHO[nameDirection][INDEX_COLLIDER.TOP_RIGHT]; // top right
                break;
            default:
                throw new Error(`Unsupported car size: ${sizeCar}`);
        }
        return Utils.ConvertVec2ToVec3(result);
    }

    public static GetTopPointMidCar(sizeCar: TYPE_CAR_SIZE, direction: DIRECT_CAR, mColorCar: M_COLOR): Vec3 {
        let listPoint: Vec3[] = this.GetListConner(sizeCar, direction, mColorCar);
        let deepValue = this.GetVec2SuitWithDirectCar(direction).multiplyScalar(-this.deepDistance);
        // return new Vec3(
        //     (listPoint[0].x + listPoint[1].x) / 2
        //     , (listPoint[0].y + listPoint[1].y) / 2
        //     , 0
        // );
        return new Vec3(
            (listPoint[0].x + listPoint[1].x) / 2 + deepValue.x
            , (listPoint[0].y + listPoint[1].y) / 2 + deepValue.y
            , 0
        );
        // return the mid point between two point bottom
        // and the mid point between two point top  

        let result: Vec2 = Vec2.ZERO;
        const nameDirection = GetNameDirectionCar(direction, false);
        switch (sizeCar) {
            case TYPE_CAR_SIZE['4_CHO']:
                result = Utils.GetPointBetweenTwoPointsVec2(InfoCustomForColliderCar.CAR_4_CHO[nameDirection][INDEX_COLLIDER.TOP_RIGHT], InfoCustomForColliderCar.CAR_4_CHO[nameDirection][INDEX_COLLIDER.TOP_LEFT]); // top right and top left
                break;
            case TYPE_CAR_SIZE['6_CHO']:
                result = Utils.GetPointBetweenTwoPointsVec2(InfoCustomForColliderCar.CAR_6_CHO[nameDirection][INDEX_COLLIDER.TOP_RIGHT], InfoCustomForColliderCar.CAR_6_CHO[nameDirection][INDEX_COLLIDER.TOP_LEFT]); // top right and top left
                break;
            case TYPE_CAR_SIZE['10_CHO']:
                result = Utils.GetPointBetweenTwoPointsVec2(InfoCustomForColliderCar.CAR_10_CHO[nameDirection][INDEX_COLLIDER.TOP_RIGHT], InfoCustomForColliderCar.CAR_10_CHO[nameDirection][INDEX_COLLIDER.TOP_LEFT]); // top right and top left
                break;
            default:
                throw new Error(`Unsupported car size: ${sizeCar}`);
        }
        return Utils.ConvertVec2ToVec3(result);
    }

    private static GetVec2SuitWithDirectCar(directCar: DIRECT_CAR): Vec2 {
        let angle = MConfigs.angleCarMove * Math.PI / 180;

        switch (directCar) {
            case DIRECT_CAR.BOTTOM: return new Vec2(0, -1);
            case DIRECT_CAR.TOP: return new Vec2(0, 1);
            case DIRECT_CAR.LEFT: return new Vec2(-1, 0);
            case DIRECT_CAR.RIGHT: return new Vec2(1, 0);
            case DIRECT_CAR.BOTTOM_LEFT: return new Vec2(-1, - Math.tan(angle));
            case DIRECT_CAR.BOTTOM_RIGHT: return new Vec2(1, - Math.tan(angle));
            case DIRECT_CAR.TOP_LEFT: return new Vec2(-1, Math.tan(angle));
            case DIRECT_CAR.TOP_RIGHT: return new Vec2(1, Math.tan(angle));
        }
    }
}

function GetRotatePoint(x, y, cx, cy, angle) {
    // Chuyển đổi góc từ độ sang radian
    const rad = angle * Math.PI / 180;

    // Tính toán vị trí mới
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const newX = cos * (x - cx) - sin * (y - cy) + cx;
    const newY = sin * (x - cx) + cos * (y - cy) + cy;

    return new Vec3(newX, newY, 0);
}


