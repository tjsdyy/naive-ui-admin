import { Alova } from '@/utils/http/alova';
import type { OrderData } from '@/views/order/columns';

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  orderNo?: string;
  customerName?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

export interface OrderListResult {
  page: number;
  pageSize: number;
  pageCount: number;
  itemCount: number;
  list: OrderData[];
}

// 获取订单列表
export const getOrderList = (params: OrderListParams) => {
  return Alova.Get<OrderListResult>('/order/list', {
    params
  });
};

// 获取订单详情
export const getOrderDetail = (id: string) => {
  return Alova.Get<OrderData>('/order/detail', {
    params: { id }
  });
};

// 创建订单
export const createOrder = (data: Partial<OrderData>) => {
  return Alova.Post('/order/create', data);
};

// 更新订单
export const updateOrder = (id: string, data: Partial<OrderData>) => {
  return Alova.Put('/order/update', data, {
    params: { id }
  });
};

// 删除订单
export const deleteOrder = (id: string) => {
  return Alova.Delete('/order/delete', {
    params: { id }
  });
};

// 批量删除订单
export const batchDeleteOrder = (ids: string[]) => {
  return Alova.Delete('/order/batch-delete', { ids });
};

// 获取客户列表（用于订单表单选择）
export const getCustomerList = () => {
  return Alova.Get('/order/customers');
};

// 获取商品列表（用于订单表单选择）
export const getProductList = () => {
  return Alova.Get('/order/products');
}; 