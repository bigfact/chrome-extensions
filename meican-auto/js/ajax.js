/**
 * 封装 Ajax 服务
 * @author bigfact
 */

!function (w) {

  var qwestAjax = w.qwest;

  function setOptions(options) {
    qwestAjax.setDefaultOptions({
      responseType: 'json',
      timeout: 60000,
      headers: {},
    });
  }

  var ajax = {
    /**
     * ajax get 请求
     * @param {String} url 数据请求地址
     * @param {Object} datas 参数
     * @returns ajax 请求对象
     * @example
     * ajax.get(url).then(function (xhr, res) {
     *   console.log(res);
     * })
     * .catch(function(err, xhr) { });
     */
    get: function (url, datas, options) {
      setOptions();
      var tmp = qwestAjax.get(url, datas, options);
      tmp.catch(function (err, xhr) {
        console.log(err, xhr);
      });
      return tmp;
    },
    /**
     * ajax post 请求
     * @param {String} url 数据请求地址
     * @param {Object} datas 参数
     * @returns ajax 请求对象
     * @example
     * ajax.post(url, {a:1}).then(function (xhr, res) {
     *   console.log(res);
     * })
     * .catch(function(err, xhr) { });
     */
    post: function (url, datas, options) {
      setOptions();
      var tmp = qwestAjax.post(url, datas, options);
      tmp.catch(function (err, xhr) {
        console.log(err, xhr);
      });
      return tmp;
    },
  }

  w.ajax = ajax;

} (window)
