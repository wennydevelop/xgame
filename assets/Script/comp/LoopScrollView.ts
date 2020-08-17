const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("view/component/LoopScrollView")
export default class LoopScrollView extends cc.Component {
    @property(cc.Node)
    itemTemplete: cc.Node = null;

    @property({
        displayName: "是否横向"
    })
    horizontal: boolean = true;

    @property({
        displayName: "item间隔距离"
    })
    itemDis: number = 0;

    protected _loopLayer: cc.Node = null;
    protected _loopButtons: cc.Node[] = [];
    protected _selectButton: cc.Node = null;

    protected _freshCall: Function = null;
    protected _selectCall: Function = null;

    protected _nowIndex: number = 0;
    protected _maxIndex: number = 0;
    protected _loopPos: number[] = [];

    protected _moveDis: number = 0;     // 移动的距离
    protected _dragDis: number = 60;    // 拖拽的判定距离
    protected _moveSec: number = 0.2;   // 移动的时间间隔
    protected _moving: boolean = false;
    protected _ignoreScroll: boolean = false;

    protected _circle: { [key: string]: { btnIndex: number, preIndex: number, nextIndex: number } } = {};

    protected _touchEnable: boolean = true;
    protected _inited: boolean = false;
    onLoad() {
        this._loopLayer = this.node;
    }

    start() {
        this._loopLayer.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this._loopLayer.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this._loopLayer.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    public initLoop(numItems: number) {

        this._nowIndex = 0;
        this.itemTemplete.parent = null;
        this._loopLayer = this.node;
        this._loopLayer.destroyAllChildren();
        this._loopButtons = [];
        this._circle = {};

        this._maxIndex = numItems;
        let minIndex: number = 3;
        if (this.horizontal) {
            this._moveDis = this.itemTemplete.width + this.itemDis;
            //minIndex = Math.floor(this._loopLayer.width / this._moveDis);
            minIndex = Math.floor(this._loopLayer.width / this.itemTemplete.width);
        } else {
            this._moveDis = this.itemTemplete.height + this.itemDis;
            minIndex = Math.floor(this._loopLayer.height / this._moveDis);
        }

        if (numItems <= minIndex) {
            this._ignoreScroll = true;
            let widge = this._loopLayer.getComponent(cc.Widget);
            widge.isAlignLeft = false;
            widge.isAlignRight = false;

            let layout = this._loopLayer.addComponent(cc.Layout);
            layout.type = cc.Layout.Type.HORIZONTAL;
            layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            layout.spacingX = 10;
        }
        let leftSideNum: number = Math.floor(numItems / 2);
        if (this.horizontal) {
            for (let i = 0; i < numItems; i++) {
                let tmp = cc.instantiate(this.itemTemplete);
                tmp.parent = this._loopLayer;
                tmp.y = 0;

                let pos: number = this.itemDis + this.itemTemplete.width;
                if (i < leftSideNum) {
                    tmp.x = -(leftSideNum - i) * pos;
                } else if (i == leftSideNum) {
                    tmp.x = 0;
                    //this._nowIndex = i + 1;
                } else if (i > leftSideNum) {
                    tmp.x = (i - leftSideNum) * pos;
                }
                this._loopPos.push(tmp.x);
                this._loopButtons.push(tmp);

                let pre: number = i == 0 ? numItems - 1 : i - 1;
                let next: number = i == numItems - 1 ? 0 : i + 1;
                this._circle[`${i}`] = { btnIndex: i, preIndex: pre, nextIndex: next };
            }
        } else {
            for (let i = 0; i < numItems; i++) {
                let tmp = cc.instantiate(this.itemTemplete);
                tmp.parent = this._loopLayer;
                tmp.x = 0;

                let pos: number = this.itemDis + this.itemTemplete.height;
                if (i < leftSideNum) {
                    tmp.y = (i + 1) * pos;
                } else if (i == leftSideNum) {
                    tmp.y = 0;
                } else if (i > leftSideNum) {
                    tmp.y = -(i + 1) * pos;
                }
                this._loopPos.push(tmp.y);
                this._loopButtons.push(tmp);

                let pre: number = i == 0 ? numItems - 1 : i - 1;
                let next: number = i == numItems - 1 ? 0 : i + 1;
                this._circle[`${i}`] = { btnIndex: i, preIndex: pre, nextIndex: next };
            }
        }

        for (let i = 0; i < this._loopButtons.length; i++) {
            let index: number = i + 1;
            let btn = this._loopButtons[i].getComponent(cc.Button);
            if (!btn) { console.error('节点未添加按钮组件') };
            this._loopButtons[i].on("click", () => { this.onClickItem(null, `${index}`) });
        }
    }

    onDestroy() {
        this._loopLayer.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this._loopLayer.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this._loopLayer.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

        this.itemTemplete.destroy();
    }

    public setTouchEnable(enable: boolean) { this._touchEnable = enable; }
    public registerRenderItem(callFunc: Function) { this._freshCall = callFunc; }
    public registerSelectIndex(callFunc: Function) { this._selectCall = callFunc; }

    public focusIndex(index: number, callback?: boolean) {
        console.log('focus index: ' + index);
        if (this._nowIndex == index) {
            return;
        }
        this._dragAnimation(index, callback);
    }
    public focusNextIndex(callback?: boolean) {
        let nextIndex: number = this._nowIndex == this._maxIndex ? 1 : (this._nowIndex + 1);
        this.focusIndex(nextIndex, callback);
    }
    public focusPreIndex(callback?: boolean) {
        let preIndex: number = this._nowIndex == 1 ? this._maxIndex : (this._nowIndex - 1);
        this.focusIndex(preIndex, callback);
    }

    onClickItem(sender: cc.Event.EventTouch, custemData: string) {
        if (!this._touchEnable) { return; }
        let index: number = parseInt(custemData);
        //console.log('LoopScrollView onClickItem ' + custemData);
        this._selectIndex(index);
    }

    protected _onTouchStart(e: cc.Event.EventTouch) {
        if (this._ignoreScroll) { return; }
        this._selectButton = null;
        for (let button of this._loopButtons) {
            let position = button.convertToNodeSpace(e.getLocation());
            let rect = cc.rect(0, 0, button.width, button.height);
            if (rect.contains(position)) {
                this._selectButton = button;
                break;
            }
        }
    }

    protected _onTouchEnd(e: cc.Event.EventTouch) {
        if (this._ignoreScroll) { return; }
        let delta = e.getLocation().sub(e.getStartLocation());
        if (Math.abs(delta.x) > this._dragDis) {
            let selectIndex = 0;
            if (delta.x < 0) {
                selectIndex = this._nowIndex % this._maxIndex + 1;
            }
            else {
                selectIndex = (this._nowIndex - 2 + this._maxIndex) % this._maxIndex + 1;
            }
            this._selectIndex(selectIndex);
        }
        else {
            for (let i = 0; i < this._loopButtons.length; i++) {
                let button = this._loopButtons[i];
                let position = button.convertToNodeSpace(e.getLocation());
                let rect = cc.rect(0, 0, button.width, button.height);
                if (rect.contains(position)) {
                    if (this._selectButton == button) {
                        this._selectIndex(i + 1);
                    }
                    break;
                }
            }
        }
    }

    protected _selectIndex(index: number) {
        if (!this._touchEnable) { return; }
        if (index > 0) {
            console.log(`当前项: 第${this._nowIndex}个 选中项: 第${index}个`);
            if (this._nowIndex == index) { return; }

            //this.scheduleOnce(() => { this._dragAnimation(index, true); }, 2 / 30);
            this._dragAnimation(index, true);
        }
    }

    protected _dragAnimation(targeIndex: number, callback?: boolean) {
        if (this.horizontal) {
            this._dragHorAnimation(targeIndex, callback);
        } else {
            console.log('竖向暂未完成');
        }
    }

    // 横向移动动画
    protected _dragHorAnimation(targeIndex: number, callback?: boolean) {
        this._dragHorAnimationEx(targeIndex, callback);
        return;
    }

    protected _dragHorAnimationEx(targeIndex: number, callback?: boolean) {
        if (this._ignoreScroll) { this.noDragHorSelect(targeIndex, callback); return; }
        let isLeft = false;
        let leftSideNum: number = Math.floor((this._maxIndex - 1) / 2);
        if (this._nowIndex > 0) {
            let sIndex: string = `${this._nowIndex - 1}`;
            let rightNum: number = this._maxIndex - leftSideNum - 1;
            for (let i = 0; i < rightNum; i++) {
                if (this._circle[sIndex].nextIndex == targeIndex - 1) {
                    isLeft = true;
                    break;
                }
                sIndex = `${this._circle[sIndex].nextIndex}`;
            }
        }
        console.log(`loopView 是否向左移动:${isLeft}`);

        // 移动前校正一次位置
        let key: string = `${targeIndex - 1}`;
        let indexArr: number[] = [];
        let index = isLeft ? this._circle[key].preIndex : this._circle[key].nextIndex;
        for (let i = 0; i < this._loopButtons.length; i++) {
            indexArr.push(index);
            index = this._circle[`${index}`].nextIndex;
        }
        let moveToPrePos: number = leftSideNum + 1;
        let leftIndexArr: number[] = indexArr.slice(moveToPrePos, this._maxIndex);
        indexArr.splice(moveToPrePos);
        for (let i = leftIndexArr.length; i > 0; i--) {
            let tIndex = i - 1;
            indexArr.unshift(leftIndexArr[tIndex]);
        }
        for (let j = 0; j < indexArr.length; j++) {
            this._loopButtons[indexArr[j]].x = this._loopPos[j];
        }

        // 左移或者右移动画
        let preIndex = this._nowIndex;
        this._nowIndex = targeIndex;
        if (true) {
            let startIndex = this._nowIndex - 1;
            let index = startIndex;
            do {
                let item = this._loopButtons[index];
                let sIndex = indexArr.findIndex((a) => { return a == index; })
                let newPosX: number = isLeft ? this.getPreIndexPosX(sIndex) : this.getNextIndexPosX(sIndex);
                //console.log(`item位置 index: ${index} old_posX:${item.x} new_posX:${newPosX} `);
                if (Math.abs(item.x - newPosX) > this._moveDis) {
                    item.x = isLeft ? newPosX + this._moveDis : newPosX - this._moveDis;
                }
                item.runAction(cc.moveTo(this._moveSec, cc.v2(newPosX, item.y)));

                if (isLeft) {
                    index = (index + 1) % this._loopButtons.length;
                }
                else {
                    index = (index - 1 + this._loopButtons.length) % this._loopButtons.length;
                }
            } while (startIndex != index)
        }

        // item刷新回调,选择item回调
        let len = this._loopButtons.length;
        for (let i = 1; i <= len; i++) {
            if (this._nowIndex == i && callback) {
                if (this._selectCall) { this._selectCall(i, isLeft); }
            }
            // 只刷新前一次选中和当前选中项
            if (this._nowIndex == i || preIndex == i || !this._inited) {
                if (this._freshCall) (this._freshCall(this._loopButtons[i - 1], i, this._nowIndex == i));
            }
        }
    }

    protected getPreIndexPosX(index: number): number {
        if (index == 0) { return this._loopPos[this._loopPos.length - 1]; }
        return this._loopPos[index - 1];
    }
    protected getNextIndexPosX(index: number): number {
        if (index + 1 == this._loopPos.length) { return this._loopPos[0]; }
        return this._loopPos[index + 1];
    }

    // 无移动动画时的选择处理
    protected noDragHorSelect(targeIndex: number, callback?: boolean) {
        let isLeft = this._nowIndex < targeIndex ? true : false;
        this._nowIndex = targeIndex;
        let len = this._loopButtons.length;
        for (let i = 1; i <= len; i++) {
            if (this._nowIndex == i && callback) {
                if (this._selectCall) { this._selectCall(i, isLeft); }
            }
            if (this._freshCall) (this._freshCall(this._loopButtons[i - 1], i, this._nowIndex == i));
        }
    }
}