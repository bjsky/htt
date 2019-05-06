import FarmlandInfo from "../../FarmlandInfo";
import { SFarmlandInfo } from "../../message/MsgLogin";
import { NET } from "../../core/net/NetController";
import MsgPlant from "../../message/MsgPlant";
import { Common } from "../../CommonData";
import { EVENT } from "../../core/EventController";
import GameEvent from "../../GameEvent";
import { CFG } from "../../core/ConfigManager";
import { ConfigConst } from "../../GlobalData";
import MsgPickFarm from "../../message/MsgPickFarm";
import MsgUpdateFarm from "../../message/MsgUpdateFarm";

export class FarmLandUnlockInfo extends FarmlandInfo{
    public flowerId:number = 0;
    public flowerName:string = "";
    public curCount:number = 0;
    public totalCount:number = 0;
}
export default class Farm2Controller {
    private static _instance: Farm2Controller = null;
    public static getInstance(): Farm2Controller {
        if (Farm2Controller._instance == null) {
            Farm2Controller._instance = new Farm2Controller();
            
        }
        return Farm2Controller._instance;
    }
    public Farmland_Count:number = 9;
    public Growth_Max_Count:number = 50;

    private _farmlandMap:any =  {};
    private _lockMap:any =null;

    private initLockMap(){
        var lockCfg:any = CFG.getCfgByKey(ConfigConst.Constant,"key","farmlandlock")[0].value;
        var arr = lockCfg.split("|");
        this._lockMap = {};
        arr.forEach((lockstr:string) => {
            var index:number = Number(lockstr.split(";")[0]);
            var flower:number = Number(lockstr.split(";")[1]);
            this._lockMap[index] = flower;
        });
    }
    public initFromServer(farmlands:SFarmlandInfo[]){
        if(this._lockMap == null){
            this.initLockMap();
        }
        this._farmlandMap = {};
        farmlands.forEach((tr:SFarmlandInfo)=>{
            var farmland:FarmlandInfo = new FarmlandInfo();
            farmland.initFromServer(tr);
            this._farmlandMap[farmland.index] = farmland;
        });

        var unlockFarmland:FarmlandInfo = null;
        for(var i:number=0 ;i<this.Farmland_Count;i++){
            if(this._farmlandMap[i]== undefined){
                unlockFarmland = new FarmlandInfo();
                unlockFarmland.index = i;
                this._farmlandMap[i] = unlockFarmland;
            }
        }
    }
    /**
     * 农田数量
     */
    public getFarmlandCount():number{
        var i:number = 0;
        for(var key in this._farmlandMap){
            i++;
        }
        return i;
    }

    public getUnlockFarmlandIndex():number{
        var index:number = -1;
        for(var key in this._lockMap){
            var needFlower:number = this._lockMap[key];
            if(Common.resInfo.flower < needFlower){
                index = Number(key);
                break;
            }
        }
        return index;
    }
    public getUnlockNeedFlower(index){
        return Number(this._lockMap[index]);
    }

    public getFarmlandAtIndex(index:number):FarmlandInfo{
        if(this._farmlandMap[index]!=undefined ||this._farmlandMap[index]!=null){
            return this._farmlandMap[index];
        }else{
            return null;
        }
    }

    public unlockFarmland(treeType:number,index:number,cost:number){
        var startTime:number = 0;
        var stageGold:number = 0;
        if(treeType== 1){
            stageGold = 0;
            startTime = Common.getServerTime();
        }else{
            var info:FarmlandInfo = this.stageFarmland(index);
            stageGold = info.stageGold;
            startTime = info.growthStartTime;
        }
        var cfg:any = CFG.getCfgDataById(ConfigConst.Flower,treeType);
        var addFlower:number = 0;
        if(cfg){
            addFlower = Number(cfg.addFlower);
        }
        NET.send(MsgUpdateFarm.create(index,treeType,1,startTime,stageGold,cost,addFlower),(msg:MsgPlant)=>{
            if(msg && msg.resp){
                var preIndex:number = this.getUnlockFarmlandIndex();
                Common.resInfo.updateInfo(msg.resp.resInfo);
                this.updateFarmland(msg.resp.farmland);
                EVENT.emit(GameEvent.Plant_Tree,{index:index,seedId:msg.resp.farmland.treeType,preIndex:preIndex});
            }
        },this);
    }

    public stageFarmland(index:number){
        var info:FarmlandInfo = this.getFarmlandAtIndex(index);
        if(info && info.treeType>0){
            var cfg:any = CFG.getCfgDataById(ConfigConst.Flower,info.treeType);
            var growthOnceTime:number = Number(cfg.baseTime)-info.level * Number(cfg.speedUp);
            var growthOnceGold:number = Number(cfg.goldOnce)+ info.level * Number(cfg.goldUp);
            var serverTime = Common.getServerTime();
            var growthTime = (serverTime-info.growthStartTime)/1000;
            var growthCount:number = Math.floor( growthTime / growthOnceTime);
            var curTime = growthTime - growthOnceTime * growthCount;
            var startTime = serverTime - curTime*1000;
            if(growthCount>this.Growth_Max_Count){
                growthCount = this.Growth_Max_Count;
            }
            var growthGold = growthCount * growthOnceGold;
            info.stageGold += growthGold;
            info.growthStartTime = startTime;
        }
        return info;
    }

    public updateFarmland(sFarmland:SFarmlandInfo){
        var farmland:FarmlandInfo = new FarmlandInfo();
        farmland.initFromServer(sFarmland);
        this._farmlandMap[sFarmland.index] = farmland;
    }

    public pickOnce(index:number){
        var farmland:FarmlandInfo = this.stageFarmland(index);
        if(farmland){
            var cfg:any = CFG.getCfgDataById(ConfigConst.Flower,farmland.treeType);
            // var addFlower:number = 0; //Number(cfg.flowerOnce);
            // var addExp:number = 0;//Number(cfg.expOnce);
            console.log("addGold,",farmland.stageGold);
            NET.send(MsgPickFarm.create(index,farmland.growthStartTime,farmland.stageGold)
                ,(msg:MsgPickFarm)=>{
                    if(msg && msg.resp){
                        Common.resInfo.updateInfo(msg.resp.resInfo);
                        this.updateFarmland(msg.resp.farmland);
                        EVENT.emit(GameEvent.Pick_Tree,{index:msg.resp.farmland.index});
                    }
            },this)
        }
    }

    public upLevelFarmland(index:number,cost:number){
        var farmland:FarmlandInfo = this.stageFarmland(index);
        if(farmland){
            NET.send(MsgUpdateFarm.create(index,farmland.treeType,farmland.level+1
                ,farmland.growthStartTime,farmland.stageGold,cost,0),(msg:MsgPlant)=>{
                if(msg && msg.resp){
                    Common.resInfo.updateInfo(msg.resp.resInfo);
                    var sfarm:SFarmlandInfo = msg.resp.farmland;
                    this.updateFarmland(sfarm);
                    EVENT.emit(GameEvent.Up_Level_Tree,{index:msg.resp.farmland.index});
                }
            },this);
        }
    }
}

export var Farm2:Farm2Controller = Farm2Controller.getInstance();
