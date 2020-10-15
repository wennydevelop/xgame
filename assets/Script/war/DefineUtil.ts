

export enum CmdType {
    default = 0,
    move = 1,
}

export interface WarCmd {
    t: number,
    p1: number,
    p2: number,
}
