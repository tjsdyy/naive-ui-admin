import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { LinkOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/outlink',
    name: 'Outlink',
    redirect: '/outlink/manage',
    component: Layout,
    meta: {
      title: '外链管理',
      icon: renderIcon(LinkOutlined),
      sort: 5,
    },
    children: [
      {
        path: 'manage',
        name: 'outlink_manage',
        meta: {
          title: '外链管理',
        },
        component: () => import('@/views/outlink/index.vue'),
      },
    ],
  },
];

export default routes; 