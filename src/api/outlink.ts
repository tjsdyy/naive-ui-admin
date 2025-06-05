import { createAlova } from 'alova';
import VueHook from 'alova/vue';
import adapterFetch from 'alova/fetch';
import { Alova } from '@/utils/http/alova';

export interface OutlinkItem {
  id: number;
  href: string;
  name: string;
  siteDesc: string;
  dr: number;
  operDesc: string;
  addTime: string;
  enable: number;
}

export interface OutlinkListResponse {
  tableData: OutlinkItem[];
  pageInfo: {
    page: number;
    prePage: number;
    nextPage: number;
    limit: number;
    totalPage: number;
    total: number;
  };
  sum: Record<string, any>;
  lastSync: any;
}

export interface OutlinkDetailResponse {
  error: number;
  data: {
    data: OutlinkItem;
  };
}

export interface OutlinkModifyResponse {
  error: number;
  data: any;
}

// 创建专门用于外链API的Alova实例
const OutlinkAlova = createAlova({
  baseURL: 'https://oms8082.fnji.com',
  statesHook: VueHook,
  requestAdapter: adapterFetch(),
  beforeRequest(method) {
    // 设置跨域请求头
    method.config.headers = {
      ...method.config.headers,
      'Content-Type': 'application/json',
    };
  },
  responded: {
    onSuccess: async (response: any, method) => {
      const res = await response.json();

      // 直接返回响应数据，不进行额外处理
      if (method.meta?.isTransformResponse === false) {
        return res;
      }

      // 检查响应状态
      if (res.error === 0) {
        return res;
      } else {
        // @ts-ignore
        const Message = window.$message;
        Message?.error(res.message || '请求失败');
        throw new Error(res.message || '请求失败');
      }
    },
    onError: (error, method) => {
      // @ts-ignore
      const Message = window.$message;
      Message?.error('网络请求失败');
      throw error;
    },
  },
});

// 获取外链列表
export const getOutlinkList = (params: {
  page: number;
  limit: number;
  filter?: string;
  orderBy?: string;
}) => {
  const newRequestParams = { data: JSON.stringify(params) };
  return Alova.Post<OutlinkListResponse>(
    'https://oms8082.fnji.com/mt/s/OutlinkDirModel/getListPageQ',
    newRequestParams,
    {
      meta: {
        isTransformResponse: false,
        cache: false,
      },
    }
  );
};

// 获取外链详情
export const getOutlinkDetail = (id: number) => {
  return OutlinkAlova.Get<OutlinkDetailResponse>('/mt/s/OutlinkDirModel/get', {
    params: { id },
    cacheFor: 0, // 禁用缓存
    meta: {
      isTransformResponse: false,
    },
  });
};

// 修改外链
export const modifyOutlink = (data: Partial<OutlinkItem>) => {
  return OutlinkAlova.Get<OutlinkModifyResponse>('/mt/s/OutlinkDirModel/mod', {
    params: {
      data: JSON.stringify({ data }),
    },
    cacheFor: 0, // 禁用缓存
    meta: {
      isTransformResponse: false,
    },
  });
};

// 删除外链
export const deleteOutlink = (id: number) => {
  return OutlinkAlova.Get<OutlinkModifyResponse>('/mt/s/OutlinkDirModel/del', {
    params: { id },
    cacheFor: 0, // 禁用缓存
    meta: {
      isTransformResponse: false,
    },
  });
};

// 新增外链
export const addOutlink = (data: Omit<OutlinkItem, 'id' | 'addTime'>) => {
  return OutlinkAlova.Post<OutlinkModifyResponse>('/mt/s/OutlinkDirModel/add', {
    data: { data },
    cacheFor: 0, // 禁用缓存
    meta: {
      isTransformResponse: false,
    },
  });
};
