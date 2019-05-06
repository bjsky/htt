import SlotMachine, { SlotMachineState } from "./SlotMachine";
import SlotInput from "./SlotInput";

export default class SlotState{

    private _machine:SlotMachine = null;
    private _state:SlotMachineState = SlotMachineState.normal;
    constructor(state:SlotMachineState, machine:SlotMachine){
        this._state = state;
        this._machine = machine;
    }

    //执行输入 
    public excute(input:SlotInput){

    }
}
