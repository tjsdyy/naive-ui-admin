import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { CodeOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/htmlpage',
    name: 'HtmlPage',
    redirect: '/htmlpage/content',
    component: Layout,
    meta: {
      title: '操作指导',
      icon: renderIcon(CodeOutlined),
      sort: 6,
    },
    children: [
      {
        path: 'content',
        name: 'htmlpage_content',
        meta: {
          title: '操作指导',
        },
        component: () => import('@/views/htmlpage/index.vue'),
      },
    ],
  },
];

export default routes; 