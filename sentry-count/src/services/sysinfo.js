/**
 * 运行系统信息判断
 */

var userAgent = window.navigator.userAgent.toLowerCase()

export default {
  /**
   * 判断是否在微信中运行
   */
  isWeiXin: userAgent.match(/MicroMessenger/i) == 'micromessenger',
  /**
    * 判断运行设备是否是安卓
    */
  isAndroid: userAgent.indexOf('android') > -1 || userAgent.indexOf('linux') > -1,
  /**
   * 判断运行设备是否是 IOS
   */
  isIOS: userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1,
}
