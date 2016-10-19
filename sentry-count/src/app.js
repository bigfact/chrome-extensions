/**
 * 主程序文件
 */

import Vue from 'vue'

import VueRouter from 'vue-router'

import commonStyle from './sass/common.scss'

import title from './services/title'

import sysinfo from './services/sysinfo'

var App = Vue.use(VueRouter).extend({})

var router = new VueRouter()

/**
 * 全局方法
 */
window.sysinfo = sysinfo

/**
 * 路由定义
 */
router.map({
  // 主页
  '/': {
    title: '主页',
    component(resolve) {
      require(['./components/CApp.vue'], resolve)
    },
  },
  // 饼图
  '/pie': {
    title: '饼图',
    component(resolve) {
      require(['./components/CPie.vue'], resolve)
    },
  },
  // 折线图
  '/line': {
    title: '折线图',
    component(resolve) {
      require(['./components/CLine.vue'], resolve)
    },
  },
})

/**
 * 记录已经加载过的页面名称，用于判断是否在页面切换时显示 loading
 */
var $to = []

/**
 * 页面 loading 元素
 */
var switchLoading = document.querySelector('.switch-loading') || document.createElement('div')

/**
 * 路由切换开始时调用
 */
router.beforeEach(function (transition) {

  // 未加载过的页面显示 loading
  if ($to.indexOf(transition.to.title) < 0) {
    switchLoading.style.display = "block"
    $to.push(transition.to.title)
  }

  // 继续切换页面
  transition.next()

  // // 停止切换页面
  // transition.abort()

})

/**
 * 路由切换成功进入激活阶段时调用
 */
router.afterEach(function (transition) {

  // 修改页面标题，标题名在路由中定义
  title(transition.to.title)

  // 隐藏 loading
  switchLoading.style.display = "none"

})


router.start(App, '#app')
