module.exports = app => {
    const {router, controller} = app;
    console.log(JSON.stringify(controller));
    router.get('/',controller.home.index);
}