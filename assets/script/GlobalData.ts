import { UI } from "./core/UIManager";
import { Wechat } from "./WeChatInterface";

export enum ServerType{
    //客户端测试 
    Client = 0,
    //服务器调试
    Debug ,
    //发布环境
    Publish
}
export const ConfigConst = {
    Constant:"configs/constant",
    Level:"configs/level",
    Fruit:"configs/fruit",
    Plant:"configs/plant",
    Flower:"configs/flower",
    Farmland:"configs/farmland"
}
export const ResConst = {
    AlertPanel:"prefabs/alertPanel",
    TipPanel:"prefabs/tipPanel",
    WinAnim:"prefabs/animUi",
    UpgradeUI:"prefabs/upgradeUI",
    MessgaePanel:"prefabs/messagePanel",
    SharePanel:"prefabs/sharePanel",
    FarmlandUI:"prefabs/farmland",
    RankPanel:"prefabs/rankPanel",
    Farmland2:"prefabs/farmlandFlower",
    FlowerDesc:"prefabs/flowerDesc"
}

export const SceneCont ={
    SlotScene:"game",
    FarmScene:"farm",
}
export default class GlobalData{

    private static _instance: GlobalData = null;
    public static getInstance(): GlobalData {
        if (GlobalData._instance == null) {
            GlobalData._instance = new GlobalData();
            
        }
        return GlobalData._instance;
    }

    public serverType:number = ServerType.Client;
    public version:string = "1.0.17";
    
    public testAccount:string ="test004"//"test027";
    public serverUrl:string =  "wss://wz.1233k.com:8580/websocket"//"wss://www.xh52.top:8580/websocket";

    public isIPhoneX:boolean =false;
    public statusBarHeight:number = 0;
    public systemInfo:any =null;
    public initGame(){
        this.systemInfo = Wechat.getSystemInfo(); 
        console.log("initSystemInfo:"+JSON.stringify(this.systemInfo) );
        if(this.systemInfo && this.systemInfo.model.indexOf("iPhone X")>=0 )
        {
            this.isIPhoneX = true;
            this.statusBarHeight = Number(this.systemInfo.statusBarHeight);
            UI.adjustHeight();
        }
        var gameCfg = Wechat.getGameConfigData();
        if(gameCfg.serverUrl!=undefined){
            this.serverUrl = gameCfg.serverUrl;
        }
        console.log("initGameConfig:",this.serverType,this.serverUrl)
    }


    public code:string ="";//微信登录code
    //登录授权userInfo，未授权为空
    public loginUserInfo:any = null;

    public initUserInfo(userInfo){
        this.loginUserInfo = userInfo;
    }
}

export var Global:GlobalData = GlobalData.getInstance();
