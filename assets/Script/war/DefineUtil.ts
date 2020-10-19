

export enum CmdType {
    default = 0,
    move = 1,
}

export interface WarCmd {
    t: number,
    p1: number,
    p2: number,
}

export let FullAngle = 360; // 360度
export let HalfAngle = 180; // 180度
export let RightAngle = 90; // 90度