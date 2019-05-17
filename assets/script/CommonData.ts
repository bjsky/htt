import { SCLoginData, SUserInfo } from "./message/MsgLogin";
import UserInfo from "./UserInfo";
import { CFG } from "./core/ConfigManager";
import { ConfigConst, ResConst } from "./GlobalData";
import { EVENT } from "./core/EventController";
import GameEvent from "./GameEvent";
import { UI } from "./core/UIManager";
import ResInfo from "./ResInfo";
import { Farm } from "./game/farm/FarmController";
import { Wechat } from "./WeChatInterface";
import { Farm2 } from "./game/farm2/Farm2Controller";
import { Guide } from "./GuideController";

export default class CommonData {
    private static _instance: CommonData = null;
    public static getInstance(): CommonData {
        if (CommonData._instance == null) {
            CommonData._instance = new CommonData();
            
        }
        return CommonData._instance;
    }

    public isFristLogin:boolean  = false;
    public newUser:number = 0;

    public accountId:string ="";
    //用户数据
    public userInfo:UserInfo = new UserInfo();
    //资源
    public resInfo:ResInfo = new ResInfo();
    //分享好友数
    public shareFriendNum:number = 0;

    private _serverTime: number = 0;
    //获取服务器时间
    public getServerTime(){
        var offset:number = new Date().getTime() - this._loginTime;
        return this._serverTime + offset;
    }

    private _loginTime:number = 0;
    public initFromServer(data:SCLoginData){

        this._loginTime = new Date().getTime();

        this.accountId = data.accountId;
        this.isFristLogin = data.firstLogin;
        this.newUser = data.newUser;
        this._serverTime = data.serverTime;
        this.userInfo.initFromServer(data.userInfo);
        this.resInfo.initFormServer(data.resInfo);

        Wechat.setUserCloudStorage("flower",this.resInfo.flower.toString());
        // Farm.initFromServer(data.farmlands);
        Farm.initUnlock(data.unlockFarmland);

        Farm2.initFromServer(data.farmlands);

        Guide.initGuide();
    }

    public getCostArr():Array<number>{
        var retArr:Array<number> = [];
        var coststr:string = CFG.getCfgByKey(ConfigConst.Constant,"key","coinCost")[0].value;
        coststr.split("|").forEach((str)=>{
            var level:number = Number(str.split(";")[0]);
            var cost:number = Number(str.split(";")[1]);
            if(this.userInfo.level>=level){
                retArr.push(cost);
            }
        });
        return retArr;
    }

    public getMutiArr():Array<number>{
        var retArr:Array<number> = [];
        var mutiStr:string = CFG.getCfgByKey(ConfigConst.Constant,"key","coinMutiple")[0].value;
        mutiStr.split(";").forEach((str)=>{
            var num:number = Number(str);
            if(this.shareFriendNum>=num-1){
                retArr.push(num);
            }
        })
        return retArr;
    }
    

    public updateUserInfo(data:SUserInfo){
        var levelPrev = this.userInfo.level;
        this.userInfo.updateInfo(data);
        // Wechat.setUserCloudStorage("level",this.userInfo.level.toString());
        // Wechat.setUserCloudStorage("duty",this.userInfo.title.toString());
        var levelup = this.userInfo.level - levelPrev>0;
        if(levelup){
            this.onUserLevelUp();
            //升级
            EVENT.emit(GameEvent.User_Level_UP,{});
        }
    }

    private _levelUpChange:boolean = false;
    private onUserLevelUp(){
        this._levelUpChange = true;
    }

    public checkShowLevelup(){
        if(this._levelUpChange){
            this._levelUpChange = false;
            UI.createPopUp(ResConst.UpgradeUI,{});
        }
    }

    //鲜花倍数
    public getSlotMuti():number{
        // var flowerMuti:number = Number(CFG.getCfgByKey(ConfigConst.Constant,"key","flowerSlotUp")[0].value);
        // return Math.floor((1+ Common.resInfo.flower * flowerMuti)*100)/100;
        var lastUnlockFarmlandId:number = 0;
        var lockedIndex:number = Farm2.getFarmlandLockedIndex();
        if(lockedIndex >-1){
            lastUnlockFarmlandId = lockedIndex;
        }else{
            lastUnlockFarmlandId = 9;
        }
        var muti:number = Number(CFG.getCfgDataById(ConfigConst.Farmland,lastUnlockFarmlandId).slotMuti);
        return muti;
    }
}

export var Common:CommonData = CommonData.getInstance();