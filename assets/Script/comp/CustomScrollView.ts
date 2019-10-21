
const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomScrollView extends cc.Component {
    @property
    useValidCellSize: boolean = true

    @property(cc.Size)
    cellSize: cc.Size = cc.size(100, 100);

    @property(cc.Node)
    cell: cc.Node = null;

    @property(cc.Prefab)
    prefabCell: cc.Prefab = null;

    _lastRefreshTime: number = 100;
    _scrollView: cc.ScrollView = null;
    _nodePool: cc.NodePool = new cc.NodePool();

    _freshFunc: Function = null;
    _data: any[] = null;
    _inited: { [key: number]: boolean } = {}
    _onRender: boolean = false;
    _isLoaded: boolean = false
    onLoad() {
        if (this._isLoaded) {
            return
        }
        this._isLoaded = true

        if (this.cell) {
            this.cellSize = this.cell.getContentSize()
        }

        this._scrollView = this.node.getComponent(cc.ScrollView)
        cc.assert(this._scrollView, "cc.ScrollView组件缺失");

        let scrollHandler = new cc.Component.EventHandler();
        scrollHandler.component = "CustomScrollView";
        scrollHandler.target = this.node;
        scrollHandler.handler = "_onScrollViewEvent";

        this._scrollView.scrollEvents.push(scrollHandler);
        this._scrollView.content.removeAllChildren(true);
    }

    start() {

    }
    /**
     * @param data 数据
     * @param freshFunc 刷新每个节点的方法  freshFunc(node,index,data)
     */
    public setData(data: any[], freshFunc: Function, relocate: boolean = false) {
        if (this._isOnLoadCalled == 0) {
            this.onLoad();
        }
        this._data = data;
        this._freshFunc = freshFunc;
        this._inited = {};
        if (relocate) {
            this._scrollView.stopAutoScroll();
            if (this._scrollView.horizontal) {
                this._scrollView.scrollToPercentHorizontal(1, 0);
            } else {
                this._scrollView.scrollToPercentVertical(1, 0);
            }
        }
        this._refreshContentNodes();
        this._scrollView.content.getComponent(cc.Layout).updateLayout();
        this.scheduleOnce(() => {
            if (this.onLoaded) {
                this.onLoaded()
            }
            this._refreshContent();
        }, 1 / 30);

    }

    onLoaded: () => void

    /**
     * 节点数量不变 单纯刷新的时候用
     * @param index 节点index
     * @param data 新的数据
     */
    public refreshItem(index: number, data: any) {
        if (index >= this._data.length) {
            console.error("Index Out Range")
        }
        this._data[index] = data;
        this._inited[index] = false;
        this._refreshContent();
    }

    /**
     * 创建一个占位的node
     */
    private _createNewNode(newSize?:cc.Size) {
        let node = new cc.Node();
        node.setContentSize(newSize?newSize:this.cellSize);
        return node;
    }

    private _onScrollViewEvent(sender: cc.ScrollView, eventType: cc.ScrollView.EventType) {
        if (eventType === cc.ScrollView.EventType.SCROLLING) {
            // if(Date.now() - this._lastRefreshTime > 100){
            this._refreshContent();
            // this._lastRefreshTime = Date.now();
            // }
        } else if (eventType === cc.ScrollView.EventType.SCROLL_ENDED
            || eventType === cc.ScrollView.EventType.AUTOSCROLL_ENDED_WITH_THRESHOLD) {
            this._refreshContent();
        }
    }
    //占位的node
    private _refreshContentNodes() {
        if (this._scrollView.content.childrenCount < this._data.length) {
            for (let i = 0; i < this._data.length; i++) {
                if (i >= this._scrollView.content.childrenCount) {
                    let node:cc.Node=null;
                    if(this._data[i]&&this._data[i].height){
                        node = this._createNewNode(cc.size(this.cell.width,this._data[i].height));
                    }else{
                        node = this._createNewNode()
                    }
                    this._scrollView.content.addChild(node);

                } else {
                    // this._scrollView.content.children[i].active = true
                }

            }
        } else if (this._scrollView.content.childrenCount > this._data.length) {
            for (let i = this._scrollView.content.childrenCount - 1; i >= this._data.length; i--) {
                let child = this._scrollView.content.children[i];
                if (child.childrenCount > 0) {
                    this._nodePool.put(child.children[0])
                }
                // child.active = false
                child.removeFromParent(true);
                // child.destroy()
            }
        }
    }

    _autoReleasePool: boolean = true
    setOutsidePool(pool: cc.NodePool, autoRelease: boolean = true) {
        this._nodePool = pool
        this._autoReleasePool = autoRelease
    }

    _getCellNode() {
        let node = this._nodePool.get();
        if (!node) {
            node = this.cell ? cc.instantiate(this.cell) : cc.instantiate(this.prefabCell);
        }
        return node;
    }
    _refreshContent() {
        if (this._onRender) return;
        this._onRender = true;
        for (let i = 0; i < this._scrollView.content.childrenCount; i++) {
            let child = this._scrollView.content.children[i];
            let inVisibleArea = false
            if (this._scrollView.horizontal) { //横向滑动
                let tempX = child.x + this._scrollView.content.x;
                inVisibleArea = (tempX > -this._scrollView.node.width && tempX < this._scrollView.node.width)
            } else if (this._scrollView.vertical) {//纵向滑动
                let tempY = child.y + this._scrollView.content.y;
                inVisibleArea = (tempY > -this._scrollView.node.height && tempY < this._scrollView.node.height)
            }

            if (inVisibleArea && !this._inited[i]) {
                if (child.childrenCount == 0) {
                    let node = this._getCellNode()
                    child.addChild(node);
                    node.position = cc.p(0, 0);
                }
                this._freshFunc(child.children[0], i, this._data[i]);
                this._inited[i] = true;

            } else if (!inVisibleArea) {
                this._nodePool.put(child.children[0])
                this._inited[i] = false;
            }
        }
        this._onRender = false;
    }

    recycleForce() {
        for (let child of this._scrollView.content.children) {
            this._nodePool.put(child.children[0])
        }
    }

    onDestroy() {
        if (this._autoReleasePool) {
            this._nodePool.clear();
        }
        this._nodePool = null
    }

    removeItem(index: number) {
        let child = this._scrollView.content.children[index]
        if (child) {
            this._nodePool.put(child.children[0])
            child.destroy()

            for (let i = index; i < this._scrollView.content.childrenCount; i++) {
                this._inited[i] = this._inited[i + 1];
            }
        }
    }
}
