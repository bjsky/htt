
export default class NetConst{
    public static NET_ConnectTimeOut:string = "-3";
    public static NET_CLOSE:string = "-2";
    public static NET_ERROR:string = "-4";
    public static ExceptionCmd :string = "-1";  
    public static NET_Connected:string = "0";
    public static NET_Connecting:string = "1";

    
    /**心跳 */
    public static Heart:number = 108;
    //登录
    public static Login:number = 10001;

    //抽奖
    public static Slot:number = 22001;
    //中奖
    public static SlotWin:number = 22002;
    //种植
    public static Plant:number = 22003;
    //收集
    public static Pick:number = 22004;
    //分享增加
    public static Share:number = 22005;

    //更新地块解锁
    public static UpdateUnlock:number = 22006;
    //浇水
    public static WaterTree:number = 22007;
    //分享加水
    public static AddRes:number = 22008;

    //采摘农田
    public static PickFarm:number = 100001;
    //升级农田
    public static UpdateFarm:number = 100001;

}
