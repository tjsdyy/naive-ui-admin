import { h } from 'vue';
import { NTag, NButton } from 'naive-ui';

// 客户信息接口
export interface CustomerInfo {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

// 订单商品接口
export interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// 订单状态历史接口
export interface StatusHistory {
  status: string;
  statusText: string;
  time: string;
  operator: string;
}

export interface OrderData {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  statusText: string;
  paymentMethod: string;
  paymentMethodText: string;
  shippingAddress: string;
  remark: string;
  createTime: string;
  updateTime: string;
  // 订单详情页面额外字段
  customerInfo?: CustomerInfo;
  items?: OrderItem[];
  statusHistory?: StatusHistory[];
}

export const columns = [
  {
    title: '订单编号',
    key: 'orderNo',
    width: 180,
    fixed: 'left',
    render(row: OrderData) {
      return h(
        NButton,
        {
          text: true,
          type: 'primary',
          onClick: () => {
            // 这里会在组件中处理
          },
        },
        { default: () => row.orderNo }
      );
    },
  },
  {
    title: '客户姓名',
    key: 'customerName',
    width: 120,
  },
  {
    title: '客户电话',
    key: 'customerPhone',
    width: 140,
  },
  {
    title: '订单金额',
    key: 'totalAmount',
    width: 120,
    render(row: OrderData) {
      return `¥${row.totalAmount.toFixed(2)}`;
    },
  },
  {
    title: '订单状态',
    key: 'status',
    width: 100,
    render(row: OrderData) {
      const statusMap = {
        pending: { type: 'warning', text: '待确认' },
        confirmed: { type: 'info', text: '已确认' },
        shipped: { type: 'primary', text: '已发货' },
        delivered: { type: 'success', text: '已送达' },
        cancelled: { type: 'error', text: '已取消' },
      };
      const config = statusMap[row.status] || { type: 'default', text: row.statusText };
      return h(NTag, { type: config.type }, { default: () => config.text });
    },
  },
  {
    title: '支付方式',
    key: 'paymentMethodText',
    width: 100,
  },
  {
    title: '收货地址',
    key: 'shippingAddress',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 160,
  },
  {
    title: '更新时间',
    key: 'updateTime',
    width: 160,
  },
]; 