module.exports = app => {
    const {router, controller} = app;
    router.post('/data',controller.home.index);
}