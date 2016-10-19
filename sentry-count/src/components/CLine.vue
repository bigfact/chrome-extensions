<template>
	<section id="c-line">
		<div id="line-with-error" class="echarts h500"></div>
    <br>
    <br>
    <br>
    <div id="line-with-device" class="echarts h1000"></div>
    <br>
    <br>
    <br>
    <!--<div v-for="i in errType" id="{{ i }}" class="echarts"></div>-->
	</section>
</template>

<script>

  import allData from '../assets/PDL_COS_ERR'

  // 引入 ECharts 主模块
  import echarts from 'echarts/lib/echarts'
  // 引入折线图
  import ELine from 'echarts/lib/chart/line'
  // 引入提示框、标题、图例组件
  import EToolTip from 'echarts/lib/component/tooltip'
  import ETitle from 'echarts/lib/component/title'
  import ELegend from 'echarts/lib/component/legend'

  var $data = {
    allDate: [],
    errType: [
      'PDL_COS_ERR||Timeout',
      'PDL_COS_ERR||Bad Request',
      'PDL_COS_ERR||Connection aborted',
    ],
  }

  export default {
    data() {
      return $data
    },
    ready() {
      this.init()
    },
    methods: {
      // 初始化
      init() {
        this.draw_PDL_COS_ERR_with_error()
        this.draw_PDL_COS_ERR_with_device()
      },
      // 根据错误类型画图
      draw_PDL_COS_ERR_with_error() {
        // 变量声明
        var series = [],
            xAxis = [],
            type = ['PDL_COS_ERR', 'PDL_COS_ERR||Bad Request', 'PDL_COS_ERR||Timeout', 'PDL_COS_ERR||Connection aborted'],
            legend = ['PDL_COS_ERR', 'Bad Request', 'Timeout', 'Connection aborted']
        // 过滤日期
        for(var i in allData) {
          xAxis.push(i)
        }
        // 过滤数据
        for(var j in type) {
          var tmpArr = []
          for(var i in allData) {
            tmpArr.push(allData[i][type[j]])
          }
          series.push({
            name: legend[j],
            type: 'line',
            // stack: '总量',
            smooth: true,
            areaStyle: { normal: {} },
            data: tmpArr,
          })
        }
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('line-with-error'))
        // 配置信息
        var option = {
          title: {
            text: 'PDL_COS_ERR - 按错误类型统计',
            left: 'center',
            top: 30,
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: legend,
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: xAxis
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: series,
        }
        // 绘制图表
        myChart.setOption(option)
      },
      // 根据设备类型画图
      draw_PDL_COS_ERR_with_device() {
        // 变量声明
        var series = [],
            xAxis = [],
            device = [],
            legend = []
        // 过滤日期
        for(var i in allData) {
          xAxis.push(i)
          // 过滤 device
          for(var j in allData[i]) {
            if(
              j.indexOf('PDL_COS_ERR||') > -1 && 
              j.indexOf('Bad Request') < 0 && 
              j.indexOf('Timeout') < 0 &&
              j.indexOf('Connection aborted') < 0 && 
              device.indexOf(j) < 0
            ) {
              device.push(j)
              legend.push(j.replace('PDL_COS_ERR||', ''))
            }
          }
        }
        // 过滤数据
        var counAll = 0,
            countI = 0
        for(var j in device) {
          var tmpArr = []
          for(var i in allData) {
            tmpArr.push(allData[i][device[j]] || 0)
            counAll += (allData[i][device[j]] || 0)
            countI++
          }
          series.push({
            name: legend[j],
            type: 'line',
            // stack: '总量',
            smooth: true,
            areaStyle: { normal: {} },
            data: tmpArr,
          })
        }
        // // 由于设备较多，按平均值过滤
        // var avg = counAll / countI
        // for(var i = 0; i < series.length; i++) {
        //   var k = 0
        //   for(var j = 0; j < series[i].data.length; j++) {
        //     k += series[i].data[j]
        //   }
        //   if(k / series[i].data.length < avg) {
        //     legend.shift(series[i].name)
        //     series.shift(series[i])
        //   }
        // }
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('line-with-device'))
        // 配置信息
        var option = {
          title: {
            text: 'PDL_COS_ERR - 按设备类型统计',
            left: 'center',
            top: '0',
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: legend,
            padding: [40, 0, 50, 0],
            // selectedMode: 'single',
            selected: (function() {
              var tmp = {}
              for(var i = 0; i < legend.length; i++) {
                tmp[legend[i]] = false
              }
              return tmp
            })(),
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            height: '800',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: xAxis
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: series,
        }
        // 绘制图表
        myChart.setOption(option)
      },
    },
    components: { },
  }

</script>

<style lang="scss">
	@import '../sass/_globals.scss';
	#c-line {
		position: relative;
		.select {
			&:hover {
				.sheet {
					display: block;
				}
			}
		}
		.sheet {
			display: none;
			background: #FFF;
			position: absolute;
			top: px2rem(38);
			right: 0;
			width: 75%;
			max-height: px2rem(150);
			overflow-y: scroll;
			box-shadow: 0 3px 6px rgba(0, 0, 0, .2), 0 3px 6px rgba(0, 0, 0, .3);
			border-top: 3px solid $red;
			text-align: center;
			z-index: 1000;
			.active {
				color: $red;
			}
		}
		.echarts {
			width: 100%;
		}
    .h500 {
      height: 500px;
    }
    .h750 {
      height: 750px;
    }
    .h1000 {
      height: 1000px;
    }
    .h1250 {
      height: 1250px;
    }
    .h1500 {
      height: 1500px;
    }
    .h2000 {
      height: 2000px;
    }
	}
</style>