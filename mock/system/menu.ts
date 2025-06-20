import { defineMock } from '@alova/mock';
import { resultSuccess } from '../_util';
import type { ListDate } from '@/api/system/menu';

const menuList = () => {
  const result: ListDate[] = [
    {
      label: '首页',
      key: 'dashboard',
      type: 1,
      subtitle: '首页',
      openType: 1,
      auth: 'dashboard',
      path: '/dashboard',
      children: [
        {
          label: '首页',
          key: 'console',
          type: 1,
          subtitle: '首页',
          openType: 1,
          auth: 'console',
          path: '/dashboard/console',
        },
        // {
        //   label: '工作台',
        //   key: 'workplace',
        //   type: 1,
        //   subtitle: 'workplace',
        //   openType: 1,
        //   auth: 'workplace',
        //   path: '/dashboard/workplace',
        // },
      ],
    },
    {
      label: '表单管理',
      key: 'form',
      type: 1,
      subtitle: 'form',
      openType: 1,
      auth: 'form',
      path: '/form',
      children: [
        {
          label: '基础表单',
          key: 'basic-form',
          type: 1,
          subtitle: 'basic-form',
          openType: 1,
          auth: 'basic-form',
          path: '/form/basic-form',
        },
        {
          label: '分步表单',
          key: 'step-form',
          type: 1,
          subtitle: 'step-form',
          openType: 1,
          auth: 'step-form',
          path: '/form/step-form',
        },
        {
          label: '表单详情',
          key: 'detail',
          type: 1,
          subtitle: 'detail',
          openType: 1,
          auth: 'detail',
          path: '/form/detail',
        },
      ],
    },
  ];

  return result;
};

export default defineMock({
  '/api/menu/list': () => {
    const list = menuList();
    return resultSuccess({
      list,
    });
  },
});
