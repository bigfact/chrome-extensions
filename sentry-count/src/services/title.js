/**
 * 设置页面 title
 * @param {String} title
 * @example 
 * import title from './services/title'
 * title('首页');
 */

export default function (title) {
  document.title = title;
  // hack 在 IOS webview 中修改 document.title 页头显示并没有改变的情况
  if(!sysinfo.isIOS) return;
  var iframe = document.createElement('iframe');
  iframe.src = './static/kong.html';
  iframe.style.display = 'none';
  iframe.onload = function () {
    var tid = setTimeout(function () {
      iframe.remove();
      clearTimeout(tid);
    }, 0);
  }
  document.body.appendChild(iframe);
}
