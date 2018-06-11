module.exports = app => {
    const {router, controller} = app;
    router.post('/data',controller.home.index);
    router.get('/huobi',controller.huobi.getInfo);
    router.post('/setInfo',controller.huobi.setInfo);
}