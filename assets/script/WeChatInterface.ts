import { EVENT } from "./core/EventController";
import GameEvent from "./GameEvent";
import { ServerType, Global } from "./GlobalData";
import { Share } from "./ShareController";
import { NET } from "./core/net/NetController";
import { Game } from "./GameController";
import { SeeVideoType } from "./view/SharePanel";

export default class WeChatInterface{
    private static _instance: WeChatInterface = null;
    public static getInstance(): WeChatInterface {
        if (WeChatInterface._instance == null) {
            WeChatInterface._instance = new WeChatInterface();
            
        }
        return WeChatInterface._instance;
    }
    constructor(){
        if(CC_WECHATGAME){
            window["wx"].onShow(function(res)
            {
                EVENT.emit(GameEvent.Weixin_onShow);
                try {
                    if(Share.isShareOnHide){    //分享中
                        Share.shareOnShow();
                    }
                    if(!NET.isNetUseable){
                        Game.reLogin();
                    }
                }catch (error) {
                    console.log(error)
                }
            })
            window["wx"].onHide(function(res)
            {
                try {
                    EVENT.emit(GameEvent.Weixin_onHide);
                    console.log("wxOnHide emit");
                } catch (error) {
                    console.log(error)
                }
            })
        }
    }
    
    //获取配置信息
    public getGameConfigData():any{
        var config = {
            serverUrl:window["login_server_url"],
        }
        return config;
    }

    public wxLogin(loginCallback:Function){
        var loginFunc = window["wxlogin"];
        loginFunc(loginCallback);
    }

    public createUserInfoButton(left,top,width,height,cb){
        var func = window["createUserInfoButton"];
        func(left,top,width,height,cb);
    }

    public createGameClubButton(){
        if(Global.serverType == ServerType.Publish){
            var func = window["createGameClubButton"];
            func()
        }
    }

    public getSystemInfo(){
        return window["systemInfo"];
    }

    public getUserInfo(cb){
        var func = window["getUserInfo"];
        func(cb)
    }

    public shareAppMessage(title,imgUrl,query){
        var func = window["shareAppMessage"];
        func(title,imgUrl,query);
    }

    public showVideoAd(cb:Function,type:SeeVideoType){
        console.log("观看视频开始："+type);
        if(Global.serverType == ServerType.Publish){
            var func = window["showVideoAd"];
            func(cb,type);
        }else{
            cb && cb();
        }
    }

    public showBannerAd(adId:string){
        if(Global.serverType == ServerType.Publish){
            var func= window["showBannerAd"];
            func(adId);
        }
    }

    public get opendata(){
        return window["wx"].getOpenDataContext();
    }

    private _kvMap:any ={};
    public setUserCloudStorage(key:string,val:string){
        if(Global.serverType != ServerType.Publish)
            return;
        this._kvMap[key] = val;
        var _kvList:Array<any> = [];
        for(var key in this._kvMap){
            _kvList.push({key:key,value:this._kvMap[key]})
        }
        console.log("serUserCloudStorage:",_kvList);
        //托管游戏数据
        window["wx"].setUserCloudStorage({
            KVDataList:_kvList,
            success:function(res){
                console.log("wx.setUserCloudStorage success");
                console.log(res);
            },
            fail:function(res){
                console.log("wx.setUserCloudStorage fail");
                console.log(res);
            }
        })
    }
}

export var Wechat:WeChatInterface = WeChatInterface.getInstance();