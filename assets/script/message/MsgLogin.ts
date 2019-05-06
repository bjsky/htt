
import NetConst from "../NetConst";
import MessageBase from "../core/net/MessageBase";
import StringUtil from "../utils/StringUtil";
import { CFG } from "../core/ConfigManager";
import { ConfigConst } from "../GlobalData";
import { Common } from "../CommonData";

/**
 * 登录客户端数据
 */
export class CSLoginData {
    public accountId:string;   //账号id
    public code:string;  //微信code
    public adId:string;
    public shareId:string;
    public name:string;
    public icon:string;
    public gender:number;   
}

/**
 * 登录服务器数据
 */
export class SCLoginData {
    public accountId:string //账号id
    //新账户
    public newUser:number = 0;
    //每天首次登录
    public firstLogin:boolean  = false;
    //服务器时间
    public serverTime:number = 0;
    //用户信息
    public userInfo:SUserInfo = null;
    //资源信息
    public resInfo:SResInfo = null;
    //地格信息
    public farmlands:SFarmlandInfo[] = null;
    //地格解锁信息
    public unlockFarmland:SUnlockFarmland = null;

    public static parse(obj:any):SCLoginData{
        var data:SCLoginData = new SCLoginData();
        data.accountId = obj.accountId;
        data.newUser = obj.newUser;
        data.firstLogin = obj.firstLogin;
        data.serverTime = obj.serverTime;
        data.userInfo = SUserInfo.parse(obj.userInfo);
        data.resInfo = SResInfo.parse(obj.resInfo);
        data.farmlands = [];
        obj.farmlands.forEach((treeObj) => {
            data.farmlands.push(SFarmlandInfo.parse(treeObj));
        });
        if(obj.unlockFarmland!=undefined){
            data.unlockFarmland = SUnlockFarmland.parse(obj.unlockFarmland);
        }
        return data;
    }
}

export class SUserInfo {
    //用户名
    public name:string = "";
    //头像url
    public icon:string = "";
    //性别
    public gender:number = 0;
    //当前经验
    public exp:number = 0;
    //当前等级
    public level:number = 1;

    public static parse(obj:any):SUserInfo{
        var info:SUserInfo = new SUserInfo();
        info.name = obj.name;
        info.icon = obj.icon;
        info.gender = obj.gender;
        info.exp = obj.exp;
        info.level = obj.level;

        return info;
    }
}

export class SResInfo{
    //金币
    public gold:number = 0;
    //精力
    public energy:number = 0;
    //精力开始时间，首次取服务器时间，之后取存储的时间
    public energyStartTime:number = 0;
    //水滴
    public water:number = 0;
    //鲜花
    public flower:number = 0;

    public static parse(obj:any):SResInfo{
        var info:SResInfo = new SResInfo();
        info.gold = obj.gold;
        info.energy = obj.energy;
        info.energyStartTime = obj.energyStartTime;
        info.water = obj.water;
        info.flower = obj.flower;
        return info;
    }
}

export class SFarmlandInfo{
    
    //地格索引
    public index:number = 0;
    //果树类型
    public treeType:number = 0;
    //开始种植时间
    public growthStartTime:number = 0;
    //等级
    public level:number = 0;
    //积累的金币
    public stageGold:number = 0;

    public static parse(obj:any):SFarmlandInfo{
        var info:SFarmlandInfo = new SFarmlandInfo();
        info.index = obj.index;
        info.treeType = obj.treeType;
        // info.pickTimes = obj.pickTimes;
        info.growthStartTime = obj.growthStartTime;
        info.level = obj.level;
        info.stageGold = obj.stageGold;
        return info;
    }
}

export class SUnlockFarmland{
    //当前解锁index
    public index:number = 0;
    //当前解锁果树数量
    public treeCount:number =0 ;

    public static parse(obj:any):SUnlockFarmland{
        var info:SUnlockFarmland = new SUnlockFarmland();
        info.index = obj.index;
        info.treeCount = obj.treeCount;
        return info;
    }
}
export default class MsgLogin
 extends MessageBase {
    public param:CSLoginData;
    public resp:SCLoginData;

    constructor(){
        super(NetConst.Login);
        // this.isLocal = true;
    }

    public static create(accountId:string,code:string,userInfo:any = null
        ,shareId:string="",adId:string=""){
        var msg = new MsgLogin();
        msg.param = new CSLoginData();
        msg.param.accountId = accountId;
        msg.param.code = code;
        console.log("MsgLogin create:",userInfo)
        if(userInfo!=null){
            msg.param.name = userInfo.nickName;
            msg.param.icon = userInfo.avatarUrl;
            msg.param.gender = userInfo.gender;
        }
        msg.param.shareId = shareId;
        msg.param.adId = adId;
        return msg;
    }

    public respFromLocal(){
        var firstenergy:number = Number(CFG.getCfgByKey(ConfigConst.Constant,"key","firstEnergy")[0].value);
        var firstGold:number = Number(CFG.getCfgByKey(ConfigConst.Constant,"key","firstGold")[0].value)
        var firstWater:number = Number(CFG.getCfgByKey(ConfigConst.Constant,"key","firstWater")[0].value)
        var json:any = {firstLogin:true,
            accountId:StringUtil.getUUidClient(),
            newUser:0,
            serverTime:new Date().getTime(),
            userInfo:{name:"开心农场",icon:"",gender:1,exp:0,totalExp:0,level:1},
            resInfo:{gold:firstGold,energy:firstenergy,energyStartTime:Common.getServerTime(),water:firstWater,flower:1},
            farmlands:[
                {index:0,treeType:1,growthStartTime:Common.getServerTime(),level:1,stageGold:0},
                // {index:1,treeType:1,growthStartTime:0},
                // {index:2,treeType:1,growthStartTime:0},
                // {index:3,treeType:1,growthStartTime:0},
                // {index:4,treeType:1,growthStartTime:0},
                // {index:5,treeType:1,growthStartTime:0},
                // {index:6,treeType:1,growthStartTime:0},
                // {index:7,treeType:1,growthStartTime:0},
                // {index:8,treeType:1,growthStartTime:0},
            ],
            // unlockFarmland:{index:9,treeCount:0}
        };
        return this.parse(json);
    }

    private parse(obj:any):MessageBase{
        var data:SCLoginData = SCLoginData.parse(obj);
        this.resp = data;
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}