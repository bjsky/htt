import { Global, ServerType, ConfigConst } from "./GlobalData";
import { Common } from "./CommonData";
import { Wechat } from "./WeChatInterface";
import { NET } from "./core/net/NetController";
import MsgShare from "./message/MsgShare";
import { EVENT } from "./core/EventController";
import GameEvent from "./GameEvent";
import MsgAddRes, { ResType } from "./message/MsgAddRes";
import { UI } from "./core/UIManager";
import { SlotResultAnim, SlotResultAniEnum } from "./view/AnimUi";
import { CFG } from "./core/ConfigManager";
import { SlotFruit } from "./game/SlotController";

export default class ShareController{

    private static _instance: ShareController = null;
    public static getInstance(): ShareController {
        if (ShareController._instance == null) {
            ShareController._instance = new ShareController();
            
        }
        return ShareController._instance;
    }
    private _shareSuccessCB:Function = null;
    private _shareFailCb:Function = null;
    private _shareOnHideTime:number = 0;
    public get isShareOnHide(){
        return this._shareOnHideTime>0;
    }
    //分享链接
    public shareAppMessage(success:Function,fail:Function){
        this._shareSuccessCB = success;
        this._shareFailCb =fail;
        if(Global.serverType == ServerType.Publish){
            var title:string ="点一点，摇金币，水果大王就是你";
            var imgUrl:string ="https://s.1233k.com/resShare/share_2.jpg";
            var query:string ="";
            
            this._shareOnHideTime = Common.getServerTime();
            console.log("share on hide:",this._shareOnHideTime);
            Wechat.shareAppMessage(title,imgUrl,query);
        }else if(Global.serverType == ServerType.Debug||
            Global.serverType == ServerType.Client){
            this.onShareFinish(true);
        }
    }

    private onShareFinish(success:boolean ){
        if(success){
            this._shareSuccessCB && this._shareSuccessCB();
        }else{
            this._shareFailCb && this._shareFailCb();
        }
        
        this._shareSuccessCB = null;
        this._shareFailCb = null;
        this._shareOnHideTime =0;
    }

    public shareOnShow(){
        var time :number = Common.getServerTime();
        console.log("share on show:",time);
        if(time - this._shareOnHideTime>3000){
            this.onShareFinish(true);
        }else{
            this.onShareFinish(false);
        }
    }

    public shareGetGold(addGold:number){
        Common.resInfo.updateEnergy();
        NET.send(MsgShare.create(addGold,Common.resInfo.energy,Common.resInfo.energyStartTime),(msg:MsgShare)=>{
            if(msg && msg.resp){
                Common.resInfo.updateInfo(msg.resp.resInfo);
                var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.GoldFly);
                var fruitCfg:any = CFG.getCfgDataById(ConfigConst.Fruit,SlotFruit.share);
                // anim.muti = Number(fruitCfg.winMuti);
                anim.flyCoin = Number(fruitCfg.flyCoin);
                // anim.addGold = anim.muti * result.cost;
                anim.coinTo = UI.main.coinIcon.parent.convertToWorldSpaceAR(UI.main.coinIcon.position);
                UI.showWinAnim(anim);
            }
        },this)
    }
    public shareGetEnergy(addEnergy:number,from:cc.Vec2,to:cc.Vec2){
        Common.resInfo.energy+= addEnergy;
        Common.resInfo.updateEnergy();
        NET.send(MsgShare.create(0,Common.resInfo.energy,Common.resInfo.energyStartTime),(msg:MsgShare)=>{
            if(msg && msg.resp){
                Common.resInfo.updateInfo(msg.resp.resInfo);
                var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.GetResFly);
                anim.resType = ResType.Energy;
                anim.addResCount = addEnergy;
                anim.starFrom = from;
                anim.starTo = to;
                UI.showWinAnim(anim);
            }
        },this)
    }
    public shareGetWater(addWater:number,from:cc.Vec2,to:cc.Vec2){
        NET.send(MsgAddRes.create(ResType.Water, addWater),(msg:MsgAddRes)=>{
            if(msg && msg.resp){
                Common.resInfo.updateInfo(msg.resp.resInfo);
                var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.GetResFly);
                anim.resType = ResType.Water;
                anim.addResCount = addWater;
                anim.starFrom = from;
                anim.starTo = to;
                UI.showWinAnim(anim);
            }
        },this)
    }

    public seeVideoGetWater(addWater:number,from:cc.Vec2,to:cc.Vec2){
        NET.send(MsgAddRes.create(ResType.Water, addWater),(msg:MsgAddRes)=>{
            if(msg && msg.resp){
                Common.resInfo.updateInfo(msg.resp.resInfo);
                var anim:SlotResultAnim = new SlotResultAnim(SlotResultAniEnum.GetResFly);
                anim.resType = ResType.Water;
                anim.addResCount = addWater;
                anim.starFrom = from;
                anim.starTo = to;
                UI.showWinAnim(anim);
            }
        },this)
    }
}

export var Share :ShareController = ShareController.getInstance();
