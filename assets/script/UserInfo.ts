import { SUserInfo } from "./message/MsgLogin";
import { ConfigConst } from "./GlobalData";
import { CFG } from "./core/ConfigManager";

/**
 * 用户数据
 */
export default class UserInfo {
    //用户名
    private _name:string = "";
    public get name(){
        if(this._name=="default"){
            return "游客";
        }
        return this._name;
    }
    //头像url
    private _icon:string = "";

    public get icon(){
        if(this._icon=="default"){
            return "";
        }
        return this._icon;
    }
    //性别
    public gender:number = 0;
    //当前经验
    public exp:number = 0;
    //当前等级总经验
    public levelExp:number = 0;
    //总经验
    public totalExp:number = 0;
    //当前等级
    public level:number = 1;
    //称号
    public title:string = "";
    

    public initFromServer(data:SUserInfo){
        this._name = data.name;
        this._icon = data.icon;
        this.gender = data.gender;
        this.exp = data.exp;
        this.level = data.level;
        
        var levelCfg = CFG.getCfgDataById(ConfigConst.Level,this.level);
        this.levelExp = levelCfg.exp;
        this.title = levelCfg.title;
        this.totalExp = Number(levelCfg.totalExp)+this.exp;
    }
    public updateInfo(data:SUserInfo){
        this.initFromServer(data);
    }
    public cloneServerInfo():SUserInfo{
        var clone:SUserInfo = new SUserInfo();
        clone.name = this.name;
        clone.icon = this.icon;
        clone.gender = this.gender;
        clone.exp = this.exp;
        clone.level = this.level;
        return clone;
    }
    /**
     * 获得增加经验后的经验和等级
     * @param exp 增加的经验
     */
    public cloneAddExpServerInfo(exp:number):SUserInfo{
        var curExp:number = this.exp + Number(exp);
        var curLevel:number = this.level;
        var total:number = Number(CFG.getCfgDataById(ConfigConst.Level,curLevel).exp);
        while(total!=-1 && curExp>=total){
            curLevel += 1;
            curExp -= total;
            total = Number(CFG.getCfgDataById(ConfigConst.Level,curLevel).exp);
        }
        var clone:SUserInfo = this.cloneServerInfo();
        clone.exp = curExp;
        clone.level = curLevel;
        return clone;
    }
}