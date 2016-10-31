/**
 * 主程序文件
 * @author bigfact
 */
!function () {

  /**
   * 接口域名
   */
  var baseUrl = 'https://meican.com/';

  /**
   * 测试用 DOM 元素
   */
  var doms = {
    addDishOnce: getDom('.add-dish-once'),
  }

  doms.addDishOnce.addEventListener('click', getBasic, false);

  /**
   * 获取基础信息
   */
  function getBasic(cb) {
    var data = {
      noHttpGetCache: Date.now(),
    }
    ajax.get(baseUrl + 'preorder/basic', data)
      .then(function (xhr, res) {
        var date = new Date(res.serverTime);
        var date2 = new Date(res.serverTime + 7 * 24 * 60 * 60 * 1000);
        var beginDate = formatDate(date);
        var endDate = formatDate(date2);

        getTime(beginDate, endDate);

      });
  }

  /**
   * 获取时间
   */
  function getTime(beginDate, endDate) {
    var data = {
      beginDate: beginDate,
      endDate: endDate,
      noHttpGetCache: Date.now(),
      withOrderDetail: false,
    }
    ajax.get(baseUrl + 'preorder/api/v2.1/calendarItems/list', data)
      .then(function (xhr, res) {
        var list = res.dateList;
        var tmp = '';
        for (var i = 0; i < list.length; i++) {
          if (list[i].calendarItemList[0].status == 'AVAILABLE') {
            tmp = list[i].calendarItemList[0];
            var date = new Date(tmp.targetTime);
            var tabUniqueId = tmp.userTab.uniqueId;
            var targetTime = formatDateTime(date);
            var corpAddressUniqueId = tmp.userTab.corp.addressList[0].uniqueId;
            var userAddressUniqueId = tmp.userTab.corp.addressList[0].uniqueId;
            var message = '点餐时间：' + targetTime + ' 周' + date.getDay() + '\n';

            getRestaurant(corpAddressUniqueId, tabUniqueId, targetTime, userAddressUniqueId, message);

          }
        }
      });
  }

  /**
   * 获取餐厅列表
   */
  function getRestaurant(corpAddressUniqueId, tabUniqueId, targetTime, userAddressUniqueId, message) {
    var data = {
      noHttpGetCache: Date.now(),
      tabUniqueId: tabUniqueId,
      targetTime: targetTime,
    }
    ajax.get(baseUrl + 'preorder/api/v2.1/restaurants/list', data)
      .then(function (xhr, res) {
        var index = getRandomInt(0, res.restaurantList.length - 1);
        var restaurantUniqueId = res.restaurantList[index].uniqueId;
        message += '餐厅：' + res.restaurantList[index].name + '\n';

        getDish(corpAddressUniqueId, restaurantUniqueId, tabUniqueId, targetTime, userAddressUniqueId, message);

      });
  }

  /**
   * 获取菜品列表
   */
  function getDish(corpAddressUniqueId, restaurantUniqueId, tabUniqueId, targetTime, userAddressUniqueId, message) {
    var data = {
      noHttpGetCache: Date.now(),
      restaurantUniqueId: restaurantUniqueId,
      tabUniqueId: tabUniqueId,
      targetTime: targetTime,
    }
    ajax.get(baseUrl + 'preorder/api/v2.1/restaurants/show', data)
      .then(function (xhr, res) {
        var list = [];
        // 在这里做菜品过滤
        for (var i = 0; i < res.dishList.length; i++) {
          if (!res.dishList[i].isSection) list.push(res.dishList[i]);
        }
        var index = getRandomInt(0, list.length - 1);
        var order = encodeURI('[{"count": 1, "dishId": ' + list[index].id + '}]');
        message += '菜名：' + list[index].name + '\n';

        addDish(corpAddressUniqueId, order, tabUniqueId, targetTime, userAddressUniqueId, message);

      });
  }

  /**
   * 下单
   */
  function addDish(corpAddressUniqueId, order, tabUniqueId, targetTime, userAddressUniqueId, message) {
    var tmp = 'corpAddressUniqueId=' + corpAddressUniqueId;
    tmp += '&' + 'order=' + order;
    tmp += '&' + 'tabUniqueId=' + tabUniqueId;
    tmp += '&' + 'targetTime=' + targetTime;
    tmp += '&' + 'userAddressUniqueId=' + userAddressUniqueId;
    ajax.post(baseUrl + 'preorder/api/v2.1/orders/add?' + tmp)
      .then(function (xhr, res) {
        createNotice(message);
      });
  }

  /**
   * 创建一个简单的文字通知
   */
  function createNotice(msg) {
    var notification = chrome.notifications.create({

      type: "basic",
      title: "提示 ",
      message: msg,
      iconUrl: "./img/logo.png",

      // type: "list",
      // title: "Primary Title",
      // message: "Primary message to display",
      // iconUrl: "./img/logo.png",
      // items: [{ title: "Item1", message: "This is item 1." },
      //   { title: "Item2", message: "This is item 2." },
      //   { title: "Item3", message: "This is item 3." }]

      // type: "progress",
      // title: "Primary Title",
      // message: "Primary message to display",
      // iconUrl: "./img/logo.png",
      // progress: 42

    });

    // chrome.notifications.onClosed.addListener(function () {
    //   chrome.windows.getCurrent(function (w) {
    //     chrome.tabs.getAllInWindow(w.id, function (t) {
    //       chrome.windows.create({
    //         url: 'http://www.baidu.com',
    //         tabId: t[0].id,
    //         type: 'detached_panel', // "normal", "popup", "panel", or "detached_panel"
    //       });
    //     })
    //   })
    // });

  }

  /**
   * 获取一个 DOM 元素
   */
  function getDom(name) {
    return document.querySelector(name);
  }

  /**
   * JSON 转换为字符串
   */
  function toString(obj) {
    try {
      return JSON.stringify(obj);
    }
    catch (err) {
      return '';
    }
  }

  /**
   * 格式化日期
   */
  function formatDate(date) {
    try {
      var tmp = date.getFullYear() + '-';
      tmp += (date.getMonth() + 1) + '-';
      tmp += date.getDate();
      return tmp;
    }
    catch (err) {
      return '';
    }
  }

  /**
   * 格式化时间
   */
  function formatDateTime(date) {
    try {
      var tmp = formatDate(date);
      tmp += ' ' + date.getHours() + ':';
      tmp += date.getMinutes();
      return tmp;
    }
    catch (err) {
      return '';
    }
  }

  /**
   * 返回一个介于 min 和 max 之间的整型随机数
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

} ()
