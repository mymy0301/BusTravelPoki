import { _decorator, Component, Node, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

export function ShowItemAnim(tweenGroup: Tween<{}>, tweenGroupOpacity: Tween<{}>, nodeGroup: Node,
    timeDelayShow: number = 0, timeShow: number = 0.3,
    scaleStart: Vec3 = new Vec3(0.8, 0.8, 1), scaleEnd: Vec3 = new Vec3(1, 1, 1)
): void {
    if (tweenGroup != null) {
        tweenGroup.stop();
        tweenGroup = null;
    }
    if (tweenGroupOpacity != null) {
        tweenGroupOpacity.stop();
        tweenGroupOpacity = null;
    }
    const nodeGroupOpa = nodeGroup.getComponent(UIOpacity);
    nodeGroupOpa.opacity = 0;
    nodeGroup.active = true;
    nodeGroup.setScale(scaleStart);
    tweenGroup = tween(nodeGroup).delay(timeDelayShow).to(timeShow, { scale: scaleEnd }, { easing: 'quadOut', onComplete: () => { } }).start();
    tweenGroupOpacity = tween(nodeGroupOpa).delay(timeDelayShow).to(timeShow, { opacity: 255 }, { easing: 'linear', onComplete: () => { } }).start();
}

export function GetTimeScrollFromXToY(x: number, y: number, speed: number = 10): number {
    const result = Math.abs(x - y) / speed;
    return result;
}

/**
 * Function này sẽ có anim player di chuyển từ vị trí X và đến ví trí Y
 * @param nItemFake là item đại diện sẽ di chuyển < item này đã được set đúng thông tin ngay từ đầu>
 */
export async function AnimSpecial_1(
    nItemFake: Node,
    cbSetDataFakeToFakeData: CallableFunction,
    cbGetShowItemFake: CallableFunction,
    cbGetWPosItemNew: CallableFunction,
    cbHideTheItemOldIndex: CallableFunction,
    cbMoveFake_1: CallableFunction,

    //============ anim ==============
    cbScrollToIndexRight: CallableFunction,
    cbMoveFake_2: CallableFunction,
    cbMoveAllItemShowSuitFake: CallableFunction,

    //============ after anim ==============
    cbUpdateDataToRealData_noAnim: CallableFunction
) {
    //-----------------------
    //-------Config--------
    //-----------------------
    const timeMoveItem_ToRight: number = 0.6;


    //-----------------------
    //-------pre anim--------
    //-----------------------

    // scrolling
    cbSetDataFakeToFakeData();
    await cbGetShowItemFake();
    // nItemFake.active = true;

    // hide item old
    cbHideTheItemOldIndex();

    // move fake to middle of screen
    await cbMoveFake_1();

    // //-----------------------
    // //-------anim--------
    // //-----------------------
    // // B1: Move toàn bộ item BItem cho xuống holder dưới mà không thay đổi vị trí của họ
    // // B2: Set một Bitem vs dữ liệu chính xác vào holder trống
    // // B3: chạy anim di chuyển item fake đến vị trí chính xác của item trống 
    // // B4: khi đến nơi, ẩn item fake , hiện item thật + trượt các item đã cập nhật về đúng vị trí của nó
    // // B5: update lại dữ liệu cho toàn bộ item trong danh sách theo dữ liệu ban đầu đã nhập mà không có anim khởi tạo lại item

    await cbScrollToIndexRight();
    await cbMoveFake_2();
    const wPosItemReal_new: Vec3 = cbGetWPosItemNew();
    tween(nItemFake)
        .call(() => {
            cbMoveAllItemShowSuitFake();
        })
        .to(timeMoveItem_ToRight, { worldPosition: wPosItemReal_new, scale: Vec3.ONE }, { easing: 'smooth' })
        .call(() => {
            // hide the item fake , turn on the item real
            nItemFake.active = false;
            cbUpdateDataToRealData_noAnim();
        })
        .start()

    await Utils.delay(timeMoveItem_ToRight * 1000);

    // //-----------------------
    // //-------After anim--------
    // //-----------------------
    // // update data to real data
    await Utils.delay(0.2 * 1000);
}

/**
 * Function này sẽ có anim player di chuyển từ vị trí X đến vị trí Y nhưng trong cùng 1 khung hình
 */
export async function AnimSpecial_2(
    nItemFake: Node,
    cbSetDataFakeToFakeData: CallableFunction,
    cbGetShowItemFake: CallableFunction,
    cbGetWPosItemReal: CallableFunction,
    cbHideTheItemOldIndex: CallableFunction,
    //============ anim ==============
    cbMoveFake_2: CallableFunction,
    cbMoveAllItemShowSuitFake_InSameView: CallableFunction,
    //============ after anim ==============
    cbUpdateDataToRealData_noAnim: CallableFunction,
) {
    //-----------------------
    //-------Config--------
    //-----------------------
    const timeMoveItem_ToRight: number = 0.6;


    //-----------------------
    //-------pre anim--------
    //-----------------------

    // scrolling
    cbSetDataFakeToFakeData();
    await cbGetShowItemFake();
    // nItemFake.active = true;

    cbHideTheItemOldIndex();
    // //-----------------------
    // //-------anim--------
    // //-----------------------
    // // B1: Move toàn bộ item BItem cho xuống holder dưới mà không thay đổi vị trí của họ
    // // B2: Set một Bitem vs dữ liệu chính xác vào holder trống
    // // B3: chạy anim di chuyển item fake đến vị trí chính xác của item trống 
    // // B4: khi đến nơi, ẩn item fake , hiện item thật + trượt các item đã cập nhật về đúng vị trí của nó
    // // B5: update lại dữ liệu cho toàn bộ item trong danh sách theo dữ liệu ban đầu đã nhập mà không có anim khởi tạo lại item

    // move to the higher than the right wpos
    await cbMoveFake_2();
    const wPosItemReal_new: Vec3 = cbGetWPosItemReal();
    tween(nItemFake)
        .call(() => {
            cbMoveAllItemShowSuitFake_InSameView();
        })
        .to(timeMoveItem_ToRight, { worldPosition: wPosItemReal_new, scale: Vec3.ONE }, { easing: 'smooth' })
        .call(() => {
            // hide the item fake , turn on the item real
            nItemFake.active = false;
            cbUpdateDataToRealData_noAnim();
        })
        .start()

    await Utils.delay(timeMoveItem_ToRight * 1000);

    //-----------------------
    //-------After anim--------
    //-----------------------
    // update data to real data
    await Utils.delay(0.05 * 1000);
}