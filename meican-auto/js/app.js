/**
 * 主程序文件
 * @author bigfact
 */
!function (w) {

  /**
   * 接口域名
   */
  var baseUrl = 'https://meican.com/';

  /**
   * 测试用 DOM 元素
   */
  var doms = {
    addDishOnce: getDom('.add-dish-once'),
    messageWrap: getDom('.message-wrap'),
    wants: getDom('#wants'),
    notWants: getDom('#not-wants'),
  }

  doms.addDishOnce.addEventListener('click', function () {
    // 保存 localStorage 数据
    localStorage.setItem('wants', doms.wants.value);
    localStorage.setItem('notWants', doms.notWants.value);
    // 开始下单
    getBasic();
  }, false);

  /**
   * 全局数据
   */
  var gData = {
    orderCount: 0,
    completeOrder: 0,
    wants: '',
    notWants: '',
    regWants: /./,
    regNotWants: /./,
  }

  /**
   * 初始化
   */
  init();

  /**
   * 初始化
   */
  function init() {

    // 载入 localStorage 数据
    gData.wants = localStorage.getItem('wants');
    gData.notWants = localStorage.getItem('notWants');

    // 将数据转换为正则表达式
    gData.regWants = gData.wants ? new RegExp(gData.wants.split(/,|，/).join('|')) : false;
    gData.regNotWants = gData.notWants ? new RegExp(gData.notWants.split(/,|，/).join('|')) : false;

    // UI 控件显示值
    doms.wants.value = gData.wants;
    doms.notWants.value = gData.notWants;

  }

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

        // 获取时间
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
    // 订单计数初始
    gData.orderCount = 0;
    gData.completeOrder = 0;
    // 获取可下订单日期
    ajax.get(baseUrl + 'preorder/api/v2.1/calendarItems/list', data)
      .then(function (xhr, res) {
        var list = res.dateList;
        // 循环日期点餐
        var flag = 1;
        for (var i = 0; i < list.length; i++) {
          if (list[i].calendarItemList[0].status == 'AVAILABLE') {

            flag && (createNotice('开始下单......'), flag = 0);
            gData.orderCount++;

            var tmp = list[i].calendarItemList[0];
            var date = new Date(tmp.targetTime);
            var tabUniqueId = tmp.userTab.uniqueId;
            var targetTime = formatDateTime(date);
            var corpAddressUniqueId = tmp.userTab.corp.addressList[0].uniqueId;
            var userAddressUniqueId = tmp.userTab.corp.addressList[0].uniqueId;
            var message = '点餐时间：' + targetTime + ' 周' + date.getDay() + '\n';

            // 获取餐厅
            getRestaurant(corpAddressUniqueId, tabUniqueId, targetTime, userAddressUniqueId, message);

          }
        }

        if (gData.orderCount <= 0) {
          createNotice('本周已订餐！');
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

        // 获取菜品
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

        // 过滤菜品

        var list = [];
        var i = 0;

        // 我想吃
        if (gData.regWants) {
          for (i = 0; i < res.dishList.length; i++) {
            if (!res.dishList[i].isSection && gData.regWants.test(res.dishList[i].name)) list.push(res.dishList[i]);
          }
        }

        // 我不想吃
        if (list.length == 0) {
          for (i = 0; i < res.dishList.length; i++) {
            if (!res.dishList[i].isSection) {
              if (!gData.regNotWants) {
                list.push(res.dishList[i]);
              }
              else if (!gData.regNotWants.test(res.dishList[i].name)) {
                list.push(res.dishList[i]);
              }
            }
          }
        }

        // 随机选择一个过滤后的菜品
        var index = getRandomInt(0, list.length - 1);
        var order = encodeURI('[{"count": 1, "dishId": ' + list[index].id + '}]');
        message += '菜名：' + list[index].name + '\n';

        // 下单
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
        if (++gData.completeOrder == gData.orderCount) {
          createNotice('下单完成');
        }
      });
  }

  /**
   * 创建一个简单的文字通知
   */
  function createNotice(msg) {
    // var notification = chrome.notifications.create({

    //   type: "basic",
    //   title: "提示 ",
    //   message: msg,
    //   iconUrl: "./img/logo.png",

    //   // type: "list",
    //   // title: "Primary Title",
    //   // message: "Primary message to display",
    //   // iconUrl: "./img/logo.png",
    //   // items: [{ title: "Item1", message: "This is item 1." },
    //   //   { title: "Item2", message: "This is item 2." },
    //   //   { title: "Item3", message: "This is item 3." }]

    //   // type: "progress",
    //   // title: "Primary Title",
    //   // message: "Primary message to display",
    //   // iconUrl: "./img/logo.png",
    //   // progress: 42

    // });

    var p = createElement('p');
    p.innerText = msg;

    doms.messageWrap.appendChild(p);

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
   * 创建一个元素
   */
  function createElement(el) {
    return document.createElement(el);
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


  // 测试

  w.createNotice = createNotice;

} (window)
