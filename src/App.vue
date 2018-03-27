<template>
    <div id="page">
        <header class="header">
            <span class="title">DNF火眼</span>
        </header>
        <main>
            <el-form ref="form" :model="form" class="bb" label-width="80px">
                <el-form-item label="网站名称">
                    <el-checkbox-group v-model="form.checkedNet" :min="1">
                      <el-checkbox v-for="item in netList" :label="item.value" :key="item.value">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="跨区">
                    <el-checkbox-group v-model="form.checkedK" :min="1">
                      <el-checkbox v-for="item in kList" :label="item.value" :key="item.value">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="getData">查询</el-button>
                </el-form-item>
            </el-form>
            <div id="stage"></div>
        </main>
    </div>
</template>
<script>
var echarts = require('echarts');
export default {
  data() {
    return {
      netList : [
        {name : "uu898",value : "uu898"}
      ],
      kList : [
        {name : "跨1",value : "k1"},
        {name : "跨2",value : "k2"},
        {name : "跨3A",value : "k3a"},
        {name : "跨3B",value : "k3b"},
        {name : "跨4",value : "k4"},
        {name : "跨5",value : "k5"},
        {name : "跨6",value : "k6"}
      ],
      form: {
        checkedNet : ['uu898'],
        checkedK : ['k3a','k5']
      },
      dataDict : {},
      myChart : ''
    };
  },
  created() {
    this.getData();
  },
  mounted(){
    this.myChart = echarts.init(document.getElementById('stage'));
  },
  methods : {
    getData(){
      let data = this.form;
      data.checkedK = data.checkedK.sort();
      fetch("http://127.0.0.1:7001/data", {
        protocol: "http:",
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body : JSON.stringify(data)
      })
      .then(res => {
        console.log(res.body);
        return res.json();
      })
      .then(data => {
        this.dataDict = data;
        this.drawGraph();
      });
    },
    serializeData(){
      let legendData = [];
      let xData = [];
      let seriesInfo = [];
      for(let key in this.dataDict){
        let kInfo = this.dataDict[key]
        if(xData.length == 0) xData = Object.keys(kInfo);
        legendData.push(key);
        let data = [];
        for(let k in kInfo){
          data.push(kInfo[k].max);
        }
        seriesInfo.push({
          name : key,
          data : data
        })
      }
      return {
        legendData,
        xData,
        seriesInfo
      }
    },
    getChartOpts(){
      let data = this.serializeData();
      let options = {
        backgroundColor:'#FFFFFF',
        tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        toolbox: {
            feature: {
                dataView: {show: true, readOnly: false},
                //magicType: {show: true, type: ['stack', 'tiled']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        legend: {
            data: data.legendData || []
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            data: data.xData
        }],
         yAxis: [{
            type: 'value',
            axisLabel: {
                formatter: '{value}'
            }
        }],
        series: []
      };
      for(let i in data.seriesInfo){
        let serie = data.seriesInfo[i];
        options.series.push({
            name: serie.name,
            type: 'bar',
            itemStyle:{
                normal:{color:'#01949B'},
            },
            markPoint : {
                    data : [
                        {type : 'max', name : '最大值'},
                        {type : 'min', name : '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name : '平均值'}
                    ]
                },
            data: serie.data
        })
      }
      return options;
    },
    drawGraph(){
      var options = this.getChartOpts();
      this.myChart.setOption(options);
    }
  }
};
</script>
<style lang="less">
.header {
  width: 100%; 
  height: 50px;
  line-height: 50px;
  background: #1d1f21;
  .title {
    padding-left: 20px;
    font-size: 25px;
    color: white;
  }
}
main {
  width: 70%;
  max-width: 1000px;
  margin: auto;
  padding-top: 20px;
}
.bb{
  border-bottom: 1px solid #e6dfdf;
}
#stage{
  width: 100%;
  height: 500px;
}
</style> 