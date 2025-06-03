import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { ShoppingCartOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/order',
    name: 'Order',
    redirect: '/order/list',
    component: Layout,
    meta: {
      title: '订单管理',
      icon: renderIcon(ShoppingCartOutlined),
      sort: 4,
    },
    children: [
      {
        path: 'list',
        name: 'order-list',
        meta: {
          title: '订单列表',
        },
        component: () => import('@/views/order/index.vue'),
      },
      {
        path: 'form/:id?',
        name: 'order-form',
        meta: {
          title: '订单表单',
          hidden: true,
          activeMenu: 'order-list',
        },
        component: () => import('@/views/order/form.vue'),
      },
      {
        path: 'detail/:id',
        name: 'order-detail',
        meta: {
          title: '订单详情',
          hidden: true,
          activeMenu: 'order-list',
        },
        component: () => import('@/views/order/detail.vue'),
      },
    ],
  },
];

export default routes; 