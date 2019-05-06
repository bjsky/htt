import { EVENT } from "../core/EventController";
import { NET } from "../core/net/NetController";
import NetConst from "../NetConst";
import MessageBase from "../core/net/MessageBase";
import { Game } from "../GameController";
import { UI } from "../core/UIManager";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NetHandler extends cc.Component {

    start () {

    }
    onEnable() {
        EVENT.on(NET.NET_MESSAGE, this.onNetMessage, this);
    }

    onDisable() {
        EVENT.off(NET.NET_MESSAGE, this.onNetMessage, this);
    }
    private onNetMessage(e:any)
    {
        let msgid = e.id+"";
        
        switch(msgid)
        {
            case NetConst.NET_Connecting:
            {
                UI.addLoadingLayer();
            }   
            break;
            case NetConst.NET_Connected:
            {
                UI.removeLoadingLayer();
            }                
            break;
            case NetConst.ExceptionCmd:{
                let msg = e.data.errorCode+","+e.data.errorMsg;
                if(CC_DEBUG) {
                    msg = JSON.stringify(e.data);
                }
                // altp = AlertPanel.showAlert("",msg);
            }break;
            case NetConst.NET_CLOSE:{
                // this.forceReConnect();
                this.retryConnect("网络异常","链接已断开，请检查网络状态后重试",NetConst.NET_CLOSE);
            }break;
            case NetConst.NET_ERROR:{
                this.retryConnect("网络异常","链接错误，请检查网络后重试",NetConst.NET_ERROR);
            }break;
            case NetConst.NET_ConnectTimeOut:
            {
                this.retryConnect("超时警告","链接超时，请检查网络后重试",NetConst.NET_ConnectTimeOut);
            }                
            break;
            default:{
                this.MsgPushParser(Number(msgid),e.data);
            }
            break;
        }
    }

    private MsgPushParser(id:number,data:any)
    {
        console.log("推通消息处理：",id,JSON.stringify(data));
        var message:MessageBase;
        switch(id)
        {
        }

    }
    private retryConnect(tittle:string,content:string,src:string)
    {
        console.log("Retry Connect:",",type:",src);
        Game.reLogin();
        if(CC_DEBUG)
        {
            console.log(src);
        }
    }

}
