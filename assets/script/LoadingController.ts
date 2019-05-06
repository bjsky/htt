import { Global, ServerType, ConfigConst } from "./GlobalData";
import { RES } from "./core/ResourceManager";
import { CFG } from "./core/ConfigManager";
import { NET } from "./core/net/NetController";
import MsgLogin from "./message/MsgLogin";
import { Common } from "./CommonData";
import { Wechat } from "./WeChatInterface";
import { Game } from "./GameController";

export default class LoadingController {
    private static _instance: LoadingController = null;
    public static getInstance(): LoadingController {
        if (LoadingController._instance == null) {
            LoadingController._instance = new LoadingController();
            
        }
        return LoadingController._instance;
    }
    

    private _onComplteCb:Function = null;
    public startLoading(onCompleteCb:Function){
        this._onComplteCb = onCompleteCb;

        new ConfigLoading().start(this._onComplteCb);
    }

    private _reConnectComplete:Function = null;
    public startReConnect(complete:Function){
        this._reConnectComplete = complete;
        new GameConnect().start(this._reConnectComplete);
    }
}

export class ConfigLoading{

    private _cfgArr:string[];
    private _completeCb:Function = null;
    public start(completeCb:Function){
        this._completeCb = completeCb;
        this._cfgArr = [];
        for(var key in ConfigConst){
            this._cfgArr.push(ConfigConst[key]);
        }

        RES.load(this._cfgArr,this.loadConfigComplete.bind(this),this.loadConfigProgress.bind(this),this.loadConfigFailed.bind(this));   
    }
    private loadConfigComplete(resArr:any){
        resArr.forEach(res => {
            CFG.parseCfg(res,RES.get(res));
        });

        console.log("Config loaded!");
        new GameConnect().start(this._completeCb);
    }
    private loadConfigProgress(pro:number){

    }
    private loadConfigFailed(msg:string){
        console.log("config load failed!",msg);
    }
}

export class GameConnect{
    private _completeCb:Function = null;
    public start(completeCb:Function){
        this._completeCb = completeCb;
        switch(Global.serverType){
            case ServerType.Client:{
                new ServerLogin().start(this._completeCb);
            }
            break;
            case ServerType.Debug:{
                new ServerConnect().start(this._completeCb);
            }break
            case ServerType.Publish:{
                new WechatLogin().start(this._completeCb);
            }
            break;
        }
    }
}

export class WechatLogin{
    private _completeCb:Function = null;
    public start(completeCb:Function){
        this._completeCb = completeCb;
        //微信登录
        Wechat.wxLogin(this.loginCb.bind(this));
    }

    public loginCb(res){
        console.log("LoadingStepLogin:wxLogin,",JSON.stringify(res));
        Global.code = res.code;
        new ServerConnect().start(this._completeCb);
    }
}

export class ServerConnect{
    private _completeCb:Function = null;
    public start(completeCb:Function){
        this._completeCb = completeCb;
        if(Game.isReLogin){
            NET.reConnect(()=>{
                new ServerLogin().start(this._completeCb);
            })
        }else{
            NET.connect(Global.serverUrl,(resp)=>{
                console.log("LoadingStepServerConn:Connected")
                new ServerLogin().start(this._completeCb);
            },this)

        }
    }
}

export class ServerLogin{
    private _completeCb:Function = null;
    public start(completeCb:Function){
        this._completeCb = completeCb;
        
        switch(Global.serverType){
            case ServerType.Client:{
                NET.send(MsgLogin.create("",""),(msg:MsgLogin)=>{
                    if(msg && msg.resp){
                        console.log(msg.resp);
                    }
                    Common.initFromServer(msg.resp);
                    this._completeCb && this._completeCb();
                },this)
            }
            break;
            case ServerType.Debug:{
                NET.send(MsgLogin.create(Global.testAccount,"",{name:"测试1"}),(msg:MsgLogin)=>{
                    if(msg && msg.resp){
                        console.log(msg.resp);
                    }
                    Common.initFromServer(msg.resp);
                    this._completeCb && this._completeCb();
                },this)
            }break;
            case ServerType.Publish:{
                NET.send(MsgLogin.create("",Global.code,Global.loginUserInfo),(msg:MsgLogin)=>{
                    if(msg && msg.resp){
                        console.log(msg.resp);
                    }
                    Common.initFromServer(msg.resp);
                    this._completeCb && this._completeCb();
                },this)
            }break;
        }
        
    }
}

export var Loading:LoadingController = LoadingController.getInstance();