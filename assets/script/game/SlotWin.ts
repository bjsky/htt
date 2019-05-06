


export enum SlotWinEnum{
    Normal = 1,       //普通
    Repeat = 2,     //再来一次
    BigWin,          //中大奖了
    Share,          //分享
    Plant,          //种植
    Pick,           //采摘
    GetRes,         //获得资源
}
export default class SlotWin{
    constructor(type:SlotWinEnum){
        this.type = type;
    }
    public type:SlotWinEnum = 0;
    public slotArr:Array<number> = [];
    public cost:number = 0;
    public bigwinSlotWin:Array<SlotWin> =[];
    public repeatSlotWin:SlotWin = null;
}