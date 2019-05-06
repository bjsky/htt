import SlotState from "./SlotState";
import NormalState from "./states/NormalState";
import SlotInput from "./SlotInput";

export enum SlotMachineState{
    normal = 1,         //正常抽奖
    bumper = 2,         //丰收抽奖
    bigWinReday =3 ,       //大奖锁定
    bigWin = 4,             //大奖播放
}

export default class SlotMachine{

    constructor(stateName:SlotMachineState){
        this._stateMap = {};
        this._stateMap[SlotMachineState.normal] = new NormalState(SlotMachineState.normal,this);
        this.setState(stateName);
    }

    private _stateMap:any = {};

    private _curState:SlotState = null;

    public setState(stateName:SlotMachineState){
        this._curState = this.getState(stateName);
    }

    public getState(stateName:SlotMachineState){
        return this._stateMap[stateName];
    }

    public excute(input:SlotInput){
        this._curState.excute(input);
    }
}
