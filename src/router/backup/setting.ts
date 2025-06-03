import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { SettingOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/setting',
    name: 'Setting',
    redirect: '/setting/account',
    component: Layout,
    meta: {
      title: '采购管理',
      icon: renderIcon(SettingOutlined),
      sort: 5,
    },
    children: [
      {
        path: 'account',
        name: 'setting-account',
        meta: {
          title: '采购订单',
        },
        component: () => import('@/views/setting/account/account.vue'),
      },
      {
        path: 'system',
        name: 'setting-system',
        meta: {
          title: '采购入库',
        },
        component: () => import('@/views/setting/system/system.vue'),
      },
    ],
  },
];

export default routes;
