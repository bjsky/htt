import MessageBase from "../core/net/MessageBase";
import NetConst from "../NetConst";
import { SUserInfo } from "./MsgLogin";
import { Common } from "../CommonData";

export class CSPick{
    //采摘的地格索引 如 1;2;4;5,移除该地格数据
    public indexStr:string = "";
    //增加的总经验
    public addExp:number = 0;
}

export class SCPick{
    //用户信息更新
    public userInfo:SUserInfo = null;

    public static parse(obj:any):SCPick{
        var info:SCPick = new SCPick();
        info.userInfo = SUserInfo.parse(obj);
        return info;
    }
}

export default class MsgPick extends MessageBase {
    public param:CSPick;
    public resp:SCPick;

    constructor(){
        super(NetConst.Pick);
        // this.isLocal = true;
    }

    public static create(ids:string,addExp:number){
        var msg = new MsgPick();
        msg.param = new CSPick();
        msg.param.indexStr = ids;
        msg.param.addExp = addExp;
        return msg;
    }

    public respFromLocal(){
        var userInfo:SUserInfo = Common.userInfo.cloneAddExpServerInfo(this.param.addExp);
        var json:any = userInfo;
        return this.parse(json);
    }


    private parse(obj:any):MessageBase{
        this.resp = SCPick.parse(obj);
        return this;
    }

    public respFromServer(obj:any):MessageBase{
        return this.parse(obj);
    }
}
