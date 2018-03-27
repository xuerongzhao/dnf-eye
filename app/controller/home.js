const Controller = require('egg').Controller;
const cheerio = require('cheerio');
const config = require('../common/NetConfig');
var netList = ['uu898'];
var kList = ['k3a','k5'];
var dict = {};
class HomeController extends Controller{
    getUrlParameter(url,sParam) {
        var sPageURL = url.split('?')[1].substr(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };
    getRequestList(netInfo, netName){
        let urlList = [];
        for(let i in kList){
            let _k = kList[i];
            urlList.push( this.packageUrl( netInfo[_k].url, netInfo[_k].opt, netName ) );
        }
        return urlList;
    }
    packageUrl(baseUrl,opt = {},netName = ""){
        baseUrl.indexOf('?') == -1 ? baseUrl += '?' : '';
        for(let key in opt){
            baseUrl += `&${key}=${opt[key]}`;
        }
        baseUrl += "&netName=" + netName;
        return encodeURI(baseUrl);
    }
    serializedData(results){
        let resultDict = {};
        for(let index in results){
            let result = results[index];
            
            let areaName = this.getUrlParameter(decodeURI(result.res.requestUrls[0]),'name');
            let netName = this.getUrlParameter(decodeURI(result.res.requestUrls[0]),'netName');
            resultDict[netName] = resultDict[netName] || {};
            let priceList = this.getPrice(netName, result);
            resultDict[netName][areaName] = this.analysisData(priceList);
        }
        return resultDict;
    }
    getPrice(netName,result){
        let priceList = [];
        let $ = cheerio.load(result.data);             
        if(netName == 'uu898'){
            let items = $("#divCommodityLst ul");
            for(let i = 0; i < items.length; ++i){
                let temp = $("li.sp_li1 h6>span:first-child",items[i]).text();
                let price = parseFloat(temp.split('=')[1]);
                priceList.push(price);
            }
        }else if(netName == '5173'){
            let items = $(".pdlist_unitprice b");
            for(let i = 0; i < items.length; ++i){
                let temp = $(items[i]).text();
                let price = parseFloat(temp.split('=')[1]);
                priceList.push(price);
            }
        }else if(netName == 'dd373'){
            let items = $(".dan.left .txt p:first-child");
            for(let i = 0; i < items.length; ++i){
                console.log("阿斯顿发",$(items[i]).text());
                let temp = $(items[i]).text();
                let price = parseFloat(temp.split('=')[1]);
                priceList.push(price);
            }
        }
        return priceList;
    }
    analysisData(arrayData){
        let max = Math.max.apply(Math,arrayData);
        let min = Math.min.apply(Math,arrayData);
        return {
            max : max,
            min : min
        }
    }
    async index(){
        let requestQueue = [];
        netList = this.ctx.request.body.checkedNet || netList;
        kList = this.ctx.request.body.checkedK || kList;
        for(let i in netList){
            let _net = netList[i];
            let _config = config[_net];
            if(!_config){
                console.log('传入了没有支持的网站类型');
            }else{
                let _queue = this.getRequestList(_config,_net);
                if(_queue) requestQueue = requestQueue.concat(_queue);
            }
        }
        // console.log(requestQueue)
        let promises = requestQueue.map((url) => {
            return this.app.curl(url, {
                method: 'GET',
                dataType: 'text',
            }); 
        });
        let results = await Promise.all(promises);
       
        this.ctx.body = this.serializedData(results);
    }
}

module.exports = HomeController;