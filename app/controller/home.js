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
        let baseUrl = netInfo.baseUrl;
        for(let i in kList){
            let _k = kList[i];
            urlList.push(this.packageUrl(baseUrl,netInfo[_k],netName));
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
            let $ = cheerio.load(result.data);
            let items = $("#divCommodityLst ul");
            let areaName = this.getUrlParameter(decodeURI(result.res.requestUrls[0]),'name');
            let netName = this.getUrlParameter(decodeURI(result.res.requestUrls[0]),'netName');
            resultDict[netName] = resultDict[netName] || {};
            let priceList = [];
            for(let i = 0; i < items.length; ++i){
                let temp = $("li.sp_li1 h6>span:first-child",items[i]).text();
                let price = parseFloat(temp.split('=')[1]);
                priceList.push(price);
            }
            resultDict[netName][areaName] = this.analysisData(priceList);
        }
        return resultDict;
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