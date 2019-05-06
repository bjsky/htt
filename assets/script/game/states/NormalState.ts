import SlotState from "../SlotState";
import SlotMachine, { SlotMachineState } from "../SlotMachine";
import { CFG } from "../../core/ConfigManager";
import { ConfigConst, Global } from "../../GlobalData";
import NumUtil from "../../utils/NumUtil";
import { EVENT } from "../../core/EventController";
import GameEvent from "../../GameEvent";
import { SlotFruit, Slot } from "../SlotController";
import SlotInput, { SlotInputStart, SlotInputEnum } from "../SlotInput";
import { NET } from "../../core/net/NetController";
import MsgSlot from "../../message/MsgSlot";
import { Common } from "../../CommonData";
import SlotWin, { SlotWinEnum } from "../SlotWin";
import { SResInfo } from "../../message/MsgLogin";
import { Farm } from "../farm/FarmController";

export default class NormalState extends SlotState{

    constructor(state:SlotMachineState, machine:SlotMachine){
        super(state,machine);

        this._normalFruitArr = [];
        this._bigwinFruitArr = [];
        var fruitCfg:any = CFG.getCfgGroup(ConfigConst.Fruit);
        for(var key in fruitCfg){
            var fruit:any = fruitCfg[key];
            if(fruit.use == "1"){
                if(fruit.isNormal == "1"){
                    this._normalFruitArr.push(fruit);
                }
                if(fruit.isBig == "1"){
                    this._bigwinFruitArr.push(fruit);
                }
                if(Number(fruit.getResCount)>0){
                    this._getResFruitArr.push(fruit);
                }
                if(fruit.id == SlotFruit.share){
                    this._shareFruit = fruit;
                }else if(fruit.id == SlotFruit.plant){
                    this._plantFruit = fruit;
                }else if(fruit.id == SlotFruit.pick){
                    this._pickFruit = fruit;
                }else if(fruit.id == SlotFruit.repeat){
                    this._repeatFruit = fruit;
                }
            }
        }
    }

    private _normalFruitArr:Array<any> = [];
    private _bigwinFruitArr:Array<any> = [];
    private _shareFruit:any = null;
    private _plantFruit:any = null;
    private _pickFruit:any = null;
    private _repeatFruit:any = null;
    private _getResFruitArr:Array<any> = [];

    public excute(input:SlotInput){
        if(input.type == SlotInputEnum.startPlay){
            var startIn:SlotInputStart = input as SlotInputStart;

            // var result = this.getNormalResult(this._normalFruitArr);
            // result.cost = startIn.cost;

            var result:SlotWin;
            if(Common.newUser == 1){    //新用户
                if(Slot.excuteCount == 1){
                    result = this.getWinResult(SlotFruit.xigua,startIn.cost);
                }else if(Slot.excuteCount == 2){
                    result = this.getBigWinResult(startIn.cost);
                }
                // else if(Slot.excuteCount == 3){
                //     result = this.getPlantResult();
                // }
                else if(Slot.excuteCount == 3){
                    result = this.getShareResult(startIn.cost);
                }else{
                    result = this.getConditionResult(startIn.cost);
                }
            }else{
                result = this.getConditionResult(startIn.cost);
            }


            EVENT.emit(GameEvent.Play_Slot,result);
    

            NET.send(MsgSlot.create(startIn.cost,startIn.cost),(msg:MsgSlot)=>{
                if(msg && msg.resp){
                    Common.updateUserInfo(msg.resp.userInfo);
                    EVENT.emit(GameEvent.Show_Exp_Fly);
                }
            },this);
        }
    }

    private getWinResult(fruitId:number,cost:number):SlotWin{
        var reslut:SlotWin = new SlotWin(SlotWinEnum.Normal);
        reslut.cost = cost;
        reslut.slotArr = [fruitId,fruitId,fruitId];
        return reslut;
    }

    private getBigWinResult(cost:number):SlotWin{
        var result:SlotWin = new SlotWin(SlotWinEnum.BigWin);
        result.slotArr = [SlotFruit.guolan,SlotFruit.guolan,SlotFruit.guolan];
        result.bigwinSlotWin =[];
        var turn:number = Number(CFG.getCfgByKey(ConfigConst.Constant,"key","bigWinRound")[0].value);
        var bigwin:SlotWin;
        for(var i:number = 0;i<turn;i++){
            var bigwinFruitId :number = NumUtil.getRandomFruit(this._bigwinFruitArr);
            var bigwin:SlotWin = this.getWinResult(bigwinFruitId,cost);
            result.bigwinSlotWin.push(bigwin);
        }
        return result;
    }

    private getShareResult(cost:number):SlotWin{
        Slot.prevShareCount = Slot.excuteCount;
        var result:SlotWin = new SlotWin(SlotWinEnum.Share);
        result.slotArr = [SlotFruit.share,SlotFruit.share,SlotFruit.share];
        result.cost = cost;
        return result;
    }

    private getPlantResult():SlotWin{
        var result:SlotWin = new SlotWin(SlotWinEnum.Plant);
        result.slotArr = [SlotFruit.plant,SlotFruit.plant,SlotFruit.plant];
        return result;
    }
    private getPickResult():SlotWin{
        var result:SlotWin = new SlotWin(SlotWinEnum.Pick);
        result.slotArr = [SlotFruit.pick,SlotFruit.pick,SlotFruit.pick];
        return result;
    }
    private getRepeatResult(cost:number):SlotWin{
        var result:SlotWin = new SlotWin(SlotWinEnum.Repeat);
        result.slotArr = [SlotFruit.repeat,SlotFruit.repeat,SlotFruit.repeat];
        var reslut2 = this.getConditionResult(cost,true)
        result.repeatSlotWin = reslut2;
        return result;
    }

    private getResResult(fruitId:number):SlotWin{
        var reslut:SlotWin = new SlotWin(SlotWinEnum.GetRes);
        reslut.slotArr = [fruitId,fruitId,fruitId];
        return reslut;
    }

    private getConditionResult(cost:number,noRepeat:boolean=false):SlotWin{
        var result:SlotWin;
        var randomFruitArr;
        if(Slot.excuteCount-Slot.prevShareCount>20){ //超过20次必定分享
            randomFruitArr = [this._shareFruit];
        }else{
            randomFruitArr = this._normalFruitArr.slice().concat(this._getResFruitArr.slice());
            if(!noRepeat){
                randomFruitArr.push(this._repeatFruit); //先加个重复
            }
            if(Slot.excuteCount-Slot.prevShareCount>5){ //分享间隔不低于5次
                randomFruitArr.push(this._shareFruit);
            }

            // if(this.isGoldMore()){
            //     var idleIndex = Farm.getIdleFarmlandIndex();
            //     if(idleIndex>-1){ //可以种植
            //         randomFruitArr.push(this._plantFruit);
            //     }
            //     if(Farm.canPicImmediatly() && Farm.getPlantFarmlandCount()>0){//可以采摘
            //         randomFruitArr.push(this._pickFruit);
            //     }
            // }
        }
        var winFruitId:number = NumUtil.getRandomFruit(randomFruitArr);
        switch(winFruitId){
            case SlotFruit.guolan:{
                result = this.getBigWinResult(cost);
            }break;
            case SlotFruit.repeat:
            {
                result = this.getRepeatResult(cost);
            }break;
            case SlotFruit.share:{
                result = this.getShareResult(cost);
            }break;
            case SlotFruit.plant:{
                result = this.getPlantResult();
            }break;
            case SlotFruit.pick:{
                result = this.getPickResult();
            }break;
            case SlotFruit.water:{
                result = this.getResResult(winFruitId);
            }break;
            default:{
                result = this.getWinResult(winFruitId,cost);
            }
            break;
        }

        return result;
    }

    private isGoldMore():boolean{
        var maxCost:number=0;
        var plantcfg = CFG.getCfgGroup(ConfigConst.Plant);
        for(var key in plantcfg){
            var plant = plantcfg[key];
            if(Common.userInfo.level>= Number(plant.unlocklv)){
                maxCost = Math.max(maxCost,Number(plant.plantcost));
            }
        }
        return Common.resInfo.gold>3*maxCost;
    }

    private getNoWinResult():SlotWin{
        var fruitArr = this._normalFruitArr.slice();
        var index1:number = NumUtil.randomIndex(fruitArr.length);
        var fruitId1:number = Number(fruitArr[index1].id);
        var fruitId2:number = Number(fruitArr[NumUtil.randomIndex(fruitArr.length)].id);
        var fruitId3:number = 0;
        if(fruitId1!=fruitId2){
            fruitId3 = Number(fruitArr[NumUtil.randomIndex(fruitArr.length)].id);
        }else{
            var arr:Array<any> = fruitArr.slice();
            arr.splice(index1,1);
            var fruitId3:number = Number(arr[NumUtil.randomIndex(arr.length)].id);
        }
        var result = new SlotWin(SlotWinEnum.Normal);
        result.slotArr = [fruitId1,fruitId2,fruitId3];
        return result;
    }
}
