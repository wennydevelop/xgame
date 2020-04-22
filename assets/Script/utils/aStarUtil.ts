export class AStarNode {
    public x: number;    //列
    public y: number;    //行
    public f: number;    //代价 f = g+h
    public g: number;    //起点到当前点代价
    public h: number;    //当前点到终点估计代价
    public walkable: boolean = true;
    public parent: AStarNode;
    public costMultiplier: number = 1.0;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class AStarGird {
    protected _startNode: AStarNode;
    protected _endNode: AStarNode;
    protected _nodes: AStarNode[][];
    protected _numCols: number;
    protected _numRows: number;

    constructor(numCols: number, numRows: number) {
        this._numCols = numCols;
        this._numRows = numRows;
        this._nodes = [];

        for (let i = 0; i < numCols; i++) {
            this._nodes.push([]);
            for (let j = 0; j < numRows; j++) {
                this._nodes[i].push(new AStarNode(i, j));
            }
        }
    }

    getNode(x: number, y: number): AStarNode {
        return this._nodes[x][y];
    }

    setStartNode(x: number, y: number) {
        this._startNode = this._nodes[x][y];
    }

    setEndNode(x: number, y: number) {
        this._endNode = this._nodes[x][y];
    }

    setWalkable(x: number, y: number, value: boolean) {
        this._nodes[x][y].walkable = value;
    }

    get startNode(): AStarNode {
        return this._startNode;
    }

    get endNode(): AStarNode {
        return this._endNode;
    }

    get numCols(): number {
        return this._numCols;
    }

    get numRows(): number {
        return this._numRows;
    }
}

export class AStar {
    protected _open: AStarNode[] = [];
    protected _closed: AStarNode[] = [];
    protected _grid: AStarGird = null;
    protected _endNode: AStarNode = null;
    protected _startNode: AStarNode = null;
    protected _path: AStarNode[] = [];
    protected _heuristic: Function;
    protected _straightCost: number = 1.0;
    protected _diagCost: number = Math.SQRT2;

    constructor() {
        this._heuristic = this.diagonal;
    }

    findPath(grid: AStarGird): boolean {
        this._grid = grid;
        this._open = [];
        this._closed = [];

        this._startNode = this._grid.startNode;
        this._endNode = this._grid.endNode;

        this._startNode.g = 0;
        this._startNode.h = this._heuristic(this._startNode);
        this._startNode.f = this._startNode.g + this._startNode.h;

        return this.search();
    }

    search(): boolean {
        let node = this._startNode;
        while (node != this._endNode) {
            let startX = Math.max(0, node.x - 1);
            let endX = Math.min(this._grid.numCols - 1, node.x + 1);
            let startY = Math.max(0, node.y - 1);
            let endY = Math.min(this._grid.numRows - 1, node.y + 1);

            for (let i = startX; i <= endX; i++) {
                for (let j = startY; j <= endY; j++) {
                    // //不让斜着走
                    // if (i != node.x && j != node.y) {
                    //     continue;
                    // }

                    let test = this._grid.getNode(i, j);
                    if (test == node
                        || !test.walkable
                        || !this._grid.getNode(node.x, test.y).walkable
                        || !this._grid.getNode(test.x, node.y).walkable) {
                        continue;
                    }

                    let cost = this._straightCost;
                    if (!((node.x == test.x) || (node.y == test.y))) {
                        cost = this._diagCost;
                    }
                    let g = node.g + cost * test.costMultiplier;
                    let h = this._heuristic(test);
                    let f = g + h;
                    if (this.isOpen(test) || this.isClosed(test)) {
                        if (test.f > f) {
                            test.f = f;
                            test.g = g;
                            test.h = h;
                            test.parent = node;
                        }
                    }
                    else {
                        test.f = f;
                        test.g = g;
                        test.h = h;
                        test.parent = node;
                        this._open.push(test);
                    }
                }
            }

            this._closed.push(node);
            if (this._open.length == 0) {
                console.log("AStar >> no path found");
                return false;
            }

            let openLen = this._open.length;
            for (let m = 0; m < openLen; m++) {
                for (let n = m + 1; n < openLen; n++) {
                    if (this._open[m].f > this._open[n].f) {
                        let temp = this._open[m];
                        this._open[m] = this._open[n];
                        this._open[n] = temp;
                    }
                }
            }

            node = this._open.shift();
        }

        this.buildPath();
        return true;
    }

    //获取路径
    private buildPath(): void {
        this._path = []
        let node = this._endNode;
        this._path.push(node);
        while (node != this._startNode) {
            node = node.parent;
            this._path.unshift(node);
        }
    }

    get path(): AStarNode[] {
        return this._path;
    }

    //是否待检查
    private isOpen(node: AStarNode): boolean {
        for (let i = 0; i < this._open.length; i++) {
            if (this._open[i] == node) {
                return true;
            }
        }
        return false;
    }

    //是否已检查
    private isClosed(node: AStarNode): boolean {
        for (var i = 0; i < this._closed.length; i++) {
            if (this._closed[i] == node) {
                return true;
            }
        }
        return false;
    }

    private diagonal(node: AStarNode) {
        var dx = Math.abs(node.x - this._endNode.x);
        var dy = Math.abs(node.y - this._endNode.y);
        var diag = Math.min(dx, dy);
        var straight = dx + dy;
        return this._diagCost * diag + this._straightCost * (straight - 2 * diag);
    }
}