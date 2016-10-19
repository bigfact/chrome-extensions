<template>
	<section id="c-pie">
		<div class="row select tac">
			{{ now }}
			<div class="sheet">
				<p class="row" v-for="i in allDate" v-bind:class="now == i && 'active'" @click="choose(i)">{{ i }}</p>
			</div>
		</div>
    <br>
    <br>
		<div id="pie-with-error" class="echarts"></div>
    <div v-for="i in errType" id="{{ i }}" class="echarts"></div>
	</section>
</template>

<script>

  import allData from '../assets/PDL_COS_ERR'

  // 引入 ECharts 主模块
  import echarts from 'echarts/lib/echarts'
  // 引入饼图
  import EPie from 'echarts/lib/chart/pie'
  // 引入提示框、标题、图例组件
  import EToolTip from 'echarts/lib/component/tooltip'
  import ETitle from 'echarts/lib/component/title'
  import ELegend from 'echarts/lib/component/legend'

  var $data = {
    allDate: [],
    now: '',
    errType: [
      'PDL_COS_ERR||Timeout',
      'PDL_COS_ERR||Bad Request',
      'PDL_COS_ERR||Connection aborted',
    ],
  }

  export default {
    data() {
      // 日期处理
      $data.allDate = []
      for(var i in allData) {
        $data.allDate.push(i.replace(/\//g, '-'))
      }
      $data.now = $data.allDate[0]
      return $data
    },
    ready() {
      this.init()
    },
    methods: {
      // 日期选择
      choose(i) {
        $data.now = i
        this.init()
      },
      // 初始化
      init() {
        this.draw_PDL_COS_ERR_with_error()
        this.draw_PDL_COS_ERR_with_device()
      },
      // 根据错误类型画图
      draw_PDL_COS_ERR_with_error() {
        // 变量声明
        var data = [],
            title = [],
            now = $data.now.replace(/-/g, '/'),
            i = '',
            tmp = 'PDL_COS_ERR'
        // 总数据
        data.push({
          value: allData[now][tmp],
          name: tmp,
        })
        title.push(tmp)
        // 过滤数据
        for(i in allData[now]) {
          if(i.indexOf('PDL_COS_ERR||') > -1 && i.split('||').length < 3) {
            if(!(i.indexOf('Bad Request') < 0 && i.indexOf('Timeout') < 0 && i.indexOf('Connection aborted') < 0)) {
              tmp = i.replace('PDL_COS_ERR||', '')
              data.push({
                value: allData[now][i],
                name: tmp,
              })
              title.push(tmp)
            }
          }
        }
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('pie-with-error'))
        // 配置信息
        var option = {
          title: {
            text: '根据错误类型统计 - PDL_COS_ERR',
            subtext: '错误统计',
            x: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          roseType: 'angle',
          legend: {
            orient: 'vertical',
            left: 'left',
            data: title
          },
          series: [
            {
              name: 'PDL_COS_ERR',
              type: 'pie',
              radius: '55%',
              center: ['50%', '35%'],
              data: data,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        }
        // 绘制图表
        myChart.setOption(option)
      },
      // 根据设备类型画图
      draw_PDL_COS_ERR_with_device() {
        var now = $data.now.replace(/-/g, '/')  
        for(var i = 0; i < $data.errType.length; i++) {
          // 变量声明
          var data = [],
              title = [],
              j = '',
              type = $data.errType[i],
              tmp = type
          // 总数据
          data.push({
            value: allData[now][tmp],
            name: tmp,
          })
          title.push(tmp)
          // 过滤数据
          for(j in allData[now]) {
            if(j.indexOf(type + '||') > -1) {
              tmp = j.replace(type + '||', '')
              data.push({
                value: allData[now][j],
                name: tmp,
              })
              title.push(tmp)
            }
          }
          // 基于准备好的dom，初始化echarts实例
          var myChart = echarts.init(document.getElementById(type))
          // 配置信息
          var option = {
            title: {
              text: '根据设备类型统计 - ' + type,
              subtext: '错误统计',
              x: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            // roseType: 'angle',
            legend: {
              orient: 'vertical',
              left: 'left',
              data: title
            },
            series: [
              {
                name: 'device type',
                type: 'pie',
                radius: '55%',
                center: ['50%', '35%'],
                data: data,
                itemStyle: {
                  emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }
            ]
          }
          // 绘制图表
          myChart.setOption(option)
        }
      }
    },
    components: { },
  }

</script>

<style lang="scss">
	@import '../sass/_globals.scss';
	#c-pie {
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
			height: 1000px;
		}
	}
</style>