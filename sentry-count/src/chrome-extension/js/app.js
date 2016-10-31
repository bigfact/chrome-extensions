/**
 * 主程序文件
 * @author bigfact
 */

!function () {

  /**
   * 测试用 DOM 元素
   */
  var doms = {
    countBtn: getDom('.count-btn'),
  }

  var countBaseUrl = 'http://sentry.fond.io/api/0/projects/q/dsq/issues/'

  doms.countBtn.addEventListener('click', count, false)

  /**
   * 最大查询数
   */
  var MAX = 100000

  /**
   * 数据记录对象
   */
  var outObj = {}
  var date = (new Date()).toLocaleString()
  outObj[date] = {}

  /**
   * 错误类型
   */
  var errorTypes = [
    'PDL_COS_ERR',
    'Connection aborted',
    'Timeout',
    'Bad Request',
    'ERROR_PROXY_AUTH_EXPIRED',
    'ERROR_CMD_COS_ERROR',
    'ErrHttpSvr',
    'ERROR_CGI_PARAM_MISSING_OP',
    'ERROR_PROXY_AUTH_SIGN_EMPTY',
  ]

  /**
   * 错误类型对应关系
   */
  var errorTypesRelations = {
    'PDL_COS_ERR': '',
    'Connection aborted': 'PDL_COS_ERR',
    'Timeout': 'PDL_COS_ERR',
    'Bad Request': 'PDL_COS_ERR',
    'ERROR_PROXY_AUTH_EXPIRED': 'Bad Request',
    'ERROR_CMD_COS_ERROR': 'Bad Request',
    'ErrHttpSvr': 'Bad Request',
    'ERROR_CGI_PARAM_MISSING_OP': 'Bad Request',
    'ERROR_PROXY_AUTH_SIGN_EMPTY': 'Bad Request',
  }

  /**
   * 机型
   */
  var deviceTypes = []

  /**
   * 总计发起的 ajax 请求数
   */
  var ajaxCount = 0;

  /**
   * 已经请求完成的 ajax 数
   */
  var ajaxCompleteCount = 0;

  /**
   * 统计发起函数
   */
  function count() {
    countWithErrorType(errorTypes)
    countWithDeviceType(errorTypes, deviceTypes)
  }

  /**
   * 按错误类型统计
   * @param errorTypesArray 错误类型数组
   */
  function countWithErrorType(errorTypesArray) {
    for (var i = 0; i < errorTypesArray.length; i++) {
      queryError('', errorTypesArray[i])
    }
  }

  /**
   * 获取机型并按机型统计错误
   * @param deviceTypesArray 机型数组
   * @param errorTypesArray 错误类型数组
   */
  function countWithDeviceType(errorTypesArray, deviceTypesArray) {
    ajax.get('http://sentry.fond.io/api/0/projects/q/dsq/tags/device/values/')
      .then(function (xhr, res) {
        for (var i = 0; i < res.length; i++) {
          deviceTypesArray.push(res[i].value)
        }
        for (var j = 0; j < errorTypesArray.length; j++) {
          for (var k = 0; k < deviceTypesArray.length; k++) {
            queryError(deviceTypesArray[k], errorTypesArray[j])
          }
        }
      });
  }

  /**
   * 查询并统计错误
   * @param device 查询条件
   * @param errorType 查询条件
   */
  function queryError(device, errorType) {
    ajaxCount++
    // var tmp = 'is:unresolved' + (device ? ' device:"' + device + '"' : '') + (errorType ? ' ' + errorType : '')
    var tmp = (device ? 'device:"' + device + '" ' : '') + (errorType ? errorType : '')
    ajax.get(countBaseUrl, {
      query: tmp,
      limit: MAX,
      // sort: 'date',
      // shortIdLookup: 1,
      // statsPeriod: '24h',
    })
      .then(function (xhr, res) {
        var key = (errorTypesRelations[errorType] ? errorTypesRelations[errorType] + '||' : '') + errorType + (device ? '||' + device : '')
        res.length > 0 && (outObj[date][key] = res.length)
      })
      .complete(ajaxComplete)
  }

  /**
   * ajax 处理完成统一处理函数
   */
  function ajaxComplete() {
    if (++ajaxCompleteCount >= ajaxCount) {
      console.log(JSON.stringify(outObj))
      console.log(outObj)
    }
  }

  /**
   * 获取一个 DOM 元素
   */
  function getDom(name) {
    return document.querySelector(name)
  }

  // 按浏览器统计
  // http://sentry.fond.io/api/0/projects/q/dsq/tags/browser/values/

  // /**
  //  * 整理出来的机型
  //  */
  // var deviceTypes = {
  //   'ERROR_PROXY_AUTH_SIGN_EMPTY': [
  //     'device:"Oppo R7sm"',
  //   ],
  //   'ERROR_PROXY_AUTH_EXPIRED': [
  //     'device:"Samsung GT-I9168"',
  //     'device:"XiaoMi Redmi Note 3"',
  //     'device:"XiaoMi MI NOTE LTE"',
  //   ],
  //   'ERROR_CGI_PARAM_MISSING_OP': [
  //     'device:"Samsung SM-J5108"',
  //     'device:"PRO 5"',
  //     'device:"XiaoMi Redmi 3S"',
  //     'device:"HUAWEI GRA-CL10"',
  //     'device:"vivo X6Plus D"',
  //   ],
  //   'ErrHttpSvr': [
  //     'device:"iOS 10.0.2"',
  //     'device:"vivo X6Plus D"',
  //   ],
  // }

} ()
