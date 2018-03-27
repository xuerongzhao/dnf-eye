import Vue from 'vue'
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
Vue.use(Element);
import './css/base.less'
new Vue({
    el: '#app',
    render: h => h(App)
})
