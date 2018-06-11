const Controller = require('egg').Controller;
const cheerio = require('cheerio');

class HuobiController extends Controller{
  async getInfo(){
    // let result = await this.app.curl('https://www.huobi.br.com/zh-cn/btc_usdt/depth/?trade=exchange',{
    //   method: 'GET',
    //   dataType: 'text'
    // });
    // let el = cheerio.load(result.data);

    // console.log(el);

    this.ctx.body = {
      data : this.app.huobiCache,
      success: true
    };
  }

  async setInfo(){
    let params = this.ctx.request.body;
    this.app.huobiCache = params;
    this.ctx.body = 'OK'
  }
}
module.exports = HuobiController;