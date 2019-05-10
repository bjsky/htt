import { NET } from "../../core/net/NetController";
import MsgPlant from "../../message/MsgPlant";
import { Common } from "../../CommonData";
import { EVENT } from "../../core/EventController";
import GameEvent from "../../GameEvent";
import { SFarmlandInfo, SUnlockFarmland } from "../../message/MsgLogin";
import FarmlandInfo from "../../FarmlandInfo";
import MsgPick from "../../message/MsgPick";
import { CFG } from "../../core/ConfigManager";
import { ConfigConst } from "../../GlobalData";
import MsgUpdateUnlock from "../../message/MsgUpdateUnlock";
import MsgWaterTree from "../../message/MsgWaterTree";
import MsgUpdateFarm from "../../message/MsgUpdateFarm";

export class UnlockFarmlandInfo extends FarmlandInfo{
    //下一个解锁
    public nextUnlock:boolean = false;
    public treeName:string ="";
    public treeCount:number = 0;
    public treeTotalCount:number = 0;
}
export default class FarmController{

    private static _instance: FarmController = null;
    public static getInstance(): FarmController {
        if (FarmController._instance == null) {
            FarmController._instance = new FarmController();
            
        }
        return FarmController._instance;
    }
    public _farmlandCount:number = 9;


    private _farmlandsDic:any = {};
    public initFromServer(farmlands:SFarmlandInfo[]){
        this._farmlandsDic = {};
        farmlands.forEach((tr:SFarmlandInfo)=>{
            var farmland:FarmlandInfo = new FarmlandInfo();
            farmland.initFromServer(tr);
            this._farmlandsDic[farmland.index] = farmland;
        });
    }

    public getIdleFarmlandIndex():number{
        for(var i:number = 0;i<this._farmlandCount;i++){
            if(this._farmlandsDic[i]==undefined &&
                this.getUnlockFarmlandInfo(i)== null){
                return i;
            }
        }
        return -1;
    }
    public getPlantFarmlandCount():number{
        var count:number = 0;
        for(var i:number = 0;i<this._farmlandCount;i++){
            if(this._farmlandsDic[i]!=undefined){
                count++;
            }
        }
        return count;
    }
    //成熟的田个数
    public getPlantedFarmlandCount(levalTime:number = 0):number{
        var count:number = 0;
        for(var index in this._farmlandsDic){
            var farmland:FarmlandInfo = this._farmlandsDic[index];
            var cfg:any = CFG.getCfgDataById(ConfigConst.Plant,farmland.treeType);
            var growthTime:number = (Common.getServerTime() - farmland.growthStartTime)/1000;
            if(growthTime+levalTime>=Number(cfg.growthTime)){
                count++;
            } 
        }
        return count;
    }
    //未成熟田个数
    public getPlantingFarmlandCount(levalTime:number = 0):number{
        var count:number = 0;
        for(var index in this._farmlandsDic){
            var farmland:FarmlandInfo = this._farmlandsDic[index];
            var cfg:any = CFG.getCfgDataById(ConfigConst.Plant,farmland.treeType);
            var growthTime:number = (Common.getServerTime() - farmland.growthStartTime)/1000;
            if(growthTime+levalTime<Number(cfg.growthTime)){
                count++;
            } 
        }
        return count;
    }

    public getFarmlandAtIndex(index:number):FarmlandInfo{
        if(this._farmlandsDic[index]!=undefined ||this._farmlandsDic[index]!=null){
            return this._farmlandsDic[index];
        }else{
            return null;
        }
    }

    public plantOnce(seedId:number,index:number,isFree:boolean = false){
        var seedCfg:any = CFG.getCfgDataById(ConfigConst.Plant,seedId);
        var costGold:number = Number(seedCfg.plantcost);
        if(isFree){
            costGold = 0;
        }
        // NET.send(MsgUpdateFarm.create(index,seedId,1,Common.getServerTime(),0, costGold),(msg:MsgUpdateFarm)=>{
        //     if(msg && msg.resp){
        //         Common.resInfo.updateInfo(msg.resp.resInfo);
        //         var farmland = new FarmlandInfo();
        //         farmland.initFromServer(msg.resp.farmland);
        //         this._farmlandsDic[index] = farmland;
        //         EVENT.emit(GameEvent.Plant_Tree,{index:index,seedId:seedId});
        //     }
        // },this)
        // this.updateUnlockFarmland(seedId);
    }

    private updateFarmland(index:number,farmland:FarmlandInfo){
        this._farmlandsDic[index] = farmland;
        EVENT.emit(GameEvent.Update_Tree,{index:index});
    }

    private removeFarmland(index:number){
        delete this._farmlandsDic[index];
        EVENT.emit(GameEvent.Remove_Tree,{index:index});
    }


    private _pickIndex:Array<number> = [];
    private _addExp:number = 0;
    public pickOnce(index:number,addExp:number){
        if(this._pickIndex.indexOf(index)<0){
            this._pickIndex.push(index);
            this._addExp += addExp;
            this.removeFarmland(index);
        }
    }

    public pickServer(cb:Function){
        if(this._pickIndex.length>0){
            this._prevPickTime = Common.getServerTime();
            var pickstr:string = this._pickIndex.join(";");
            var addExp:number = this._addExp;
            this._pickIndex= [];
            this._addExp = 0;
            console.log(pickstr);
            NET.send(MsgPick.create(pickstr,addExp),(msg:MsgPick)=>{
                if(msg && msg.resp){
                    Common.updateUserInfo(msg.resp.userInfo);
                    cb && cb();
                }
            },this);
        }
    }
    //免费种植
    public plantFree:boolean = false;
    //立即采摘
    public pickImmediatly:boolean = false;

    private _prevPickTime:number = 0;
    public canPicImmediatly():boolean{
        return Common.getServerTime()-this._prevPickTime >10*1000;
    }
    ////////////////////////////
    //  unlock
    //////////////////////

    private _unlockDic:any = null;
    private _unlockFarmland:SUnlockFarmland = null;
    public initUnlock(unlockFarmland:SUnlockFarmland){
        
        var firstLock:number = 0;
        if(this._unlockDic == null){        //cfg init
            var cfgs:any = CFG.getCfgByKey(ConfigConst.Constant,"key","farmlandlock")
            var unlockcfgArr:Array<string> = cfgs[0].value.split("|");
            this._unlockDic ={};
            for(var i:number =0 ;i<unlockcfgArr.length;i++){
                var unlockTreeId:number = Number(unlockcfgArr[i].split(";")[0]);
                var unlockTreeCount:number = Number(unlockcfgArr[i].split(";")[1]);
                this._unlockDic[i] = {id:unlockTreeId,count:unlockTreeCount}
                if(unlockTreeCount>0 && firstLock ==0){
                    firstLock = i;
                }
            }
        }
        this._unlockFarmland =unlockFarmland;
        if(this._unlockFarmland == null || this._unlockFarmland.index==0){
            this._unlockFarmland = new SUnlockFarmland();
            this._unlockFarmland.index = firstLock;
            this._unlockFarmland.treeCount = 0;
        }
        
    }
    private updateUnlock(unlockFarmland:SUnlockFarmland){
        var preIndex = this._unlockFarmland.index;
        this._unlockFarmland = unlockFarmland;
        var removeIndex = (unlockFarmland.index == preIndex)?-1:preIndex;
        EVENT.emit(GameEvent.Update_Unlock_Farmland,{removeIndex:removeIndex,updateIndex:this._unlockFarmland.index});
    }

    //客户端更新解锁
    public updateUnlockFarmland(seeId:number){
        var curUnlockCfg = this._unlockDic[this._unlockFarmland.index];
        if(curUnlockCfg){
            var unlockSeedId:number = Number(curUnlockCfg.id);
            if(seeId== unlockSeedId){
                var index  = this._unlockFarmland.index;
                var treeCount = this._unlockFarmland.treeCount;
                treeCount+=1;
                if(treeCount>=curUnlockCfg.count){
                    index +=1;
                    treeCount = 0;
                }
                NET.send(MsgUpdateUnlock.create(index,treeCount),(msg:MsgUpdateUnlock)=>{
                    if(msg && msg.resp){
                        this.updateUnlock(msg.resp.unlockFarmland);
                    }
                },this)
            }
        }
    }

    public getCurrentUnlockSeedId(){
        var curUnlockCfg = this._unlockDic[this._unlockFarmland.index];
        return Number(curUnlockCfg.id)
    }


    public getUnlockFarmlandInfo(index:number):UnlockFarmlandInfo{
        var unlock:UnlockFarmlandInfo = null;
        var unlockCfg = this._unlockDic[index];
        if(unlockCfg.count>0 && index>=this._unlockFarmland.index){ //需要解锁未解锁
            unlock = new UnlockFarmlandInfo();
            unlock.index = index;
            unlock.treeName = CFG.getCfgDataById(ConfigConst.Plant,unlockCfg.id).name;
            unlock.treeTotalCount = unlockCfg.count;
            unlock.treeCount = this._unlockFarmland.treeCount;
            if(index == this._unlockFarmland.index){
                unlock.nextUnlock = true;
            } //当前解锁
        }

        return unlock;
    }

    public speedUp(index:number,cost:number,addExp:number,startTime:number){
        NET.send(MsgWaterTree.create(cost,addExp,index,startTime),(msg:MsgWaterTree)=>{
            if(msg && msg.resp){
                Common.updateUserInfo(msg.resp.userInfo);
                Common.resInfo.updateInfo(msg.resp.resInfo);
                var farmland:FarmlandInfo = new FarmlandInfo();
                farmland.initFromServer(msg.resp.farmland);
                this.updateFarmland(farmland.index,farmland);
            }
        },this)
    }
}

export var Farm:FarmController = FarmController.getInstance();
