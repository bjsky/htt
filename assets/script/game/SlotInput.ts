export enum SlotInputEnum{
    startPlay = 1,       //开始抽奖
}

export default class SlotInput {

    public type:SlotInputEnum = 0;
    constructor(type:SlotInputEnum){
        this.type = type;
    }
}

export class SlotInputStart extends SlotInput{
    //消耗金币
    public cost:number = 0;

    constructor(type:SlotInputEnum,cost:number){
        super(type);
        this.cost = cost;
    }
}
