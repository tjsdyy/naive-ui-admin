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
	  {
        path: 'content',
        name: 'htmlpage_content',
        meta: {
          title: '操作指导',
		  keepAlive: true,
        },
        component: () => import('@/views/htmlpage/index.vue'),
      },
    ],
  },
];

export default routes; 