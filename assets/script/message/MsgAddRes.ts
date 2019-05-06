import MessageBase from "../core/net/MessageBase";
import NetConst from "../NetConst";
import { SResInfo } from "./MsgLogin";
import { Common } from "../CommonData";

//资源类型
export enum ResType{
    Gold = 1,       //金币
    Water = 2,      //水滴
    Energy = 3,     //能量，后端不用
}
export class CSAddRes{
    //增加资源
    public addType:ResType = 0;
    //数量
    public addNum:number = 0;
}

//增加资源
export class SCAddRes{
    //资源信息
    public resInfo:SResInfo = null;
    
    public static parse(obj:any):SCAddRes{
        var info:SCAddRes = new SCAddRes();
        info.resInfo = SResInfo.parse(obj);
        return info;
    }
}
export default class MsgAddRes extends MessageBase {
    public param:CSAddRes;
    public resp:SCAddRes;

    constructor(){
        super(NetConst.AddRes);
        // this.isLocal = true;
    }

    public static create(type:ResType, add:number){
        var msg = new MsgAddRes();
        msg.param = new CSAddRes();
        msg.param.addType = type;
        msg.param.addNum = add;
        return msg;
    }

    public respFromLocal(){
        var resInfo:SResInfo = Common.resInfo.cloneServerInfo();
        switch(this.param.addType){
            case ResType.Water:
            resInfo.water+= this.param.addNum;
            break;
        }
        var json:any = resInfo;
        return this.parse(json);
    }


    private parse(obj:any):MessageBase{
        this.resp = SCAddRes.parse(obj);
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}
