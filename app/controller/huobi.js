const Controller = require('egg').Controller;
const cheerio = require('cheerio');

class HuobiController extends Controller{
  async getInfo(){
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