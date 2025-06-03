import { h } from 'vue';
import { NTag, NButton } from 'naive-ui';

export const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    sorter: true,
  },

  {
    title: '链接地址',
    key: 'href',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    render(row: any) {
      return h(
        NButton,
        {
          text: true,
          type: 'primary',
          onClick: () => {
            window.open(row.href, '_blank');
          },
        },
        {
          default: () => row.href,
        }
      );
    },
  },
  {
    title: '名称',
    key: 'name',
    width: 150,
    sorter: true,
  },
  {
    title: '站点描述',
    key: 'siteDesc',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '操作描述',
    key: 'operDesc',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '添加时间',
    key: 'addTime',
    width: 180,
    sorter: true,
  },
  {
    title: '是否完成',
    key: 'enable',
    width: 100,
    sorter: true,
    render(row: any) {
      return h(
        NTag,
        {
          type: row.enable ? 'success' : 'error',
        },
        {
          default: () => (row.enable === 1 ? '完成' : '未完成'),
        }
      );
    },
  },
]; 