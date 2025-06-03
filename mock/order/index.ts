import { defineMock } from '@alova/mock';
import { faker } from '@faker-js/faker';
import { doCustomTimes, resultSuccess } from '../_util';
import dayjs from 'dayjs';

// 订单状态枚举
const ORDER_STATUS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const ORDER_STATUS_TEXT = {
  pending: '待确认',
  confirmed: '已确认',
  shipped: '已发货',
  delivered: '已送达',
  cancelled: '已取消'
};

// 支付方式枚举
const PAYMENT_METHODS = ['alipay', 'wechat', 'bank', 'cash'];
const PAYMENT_METHOD_TEXT = {
  alipay: '支付宝',
  wechat: '微信支付',
  bank: '银行转账',
  cash: '现金支付'
};

// 生成订单列表数据
function orderList(pageSize: number) {
  const result: any[] = [];
  doCustomTimes(pageSize, () => {
    const status = faker.helpers.arrayElement(ORDER_STATUS);
    const paymentMethod = faker.helpers.arrayElement(PAYMENT_METHODS);
    const orderNo = `ORD${dayjs().format('YYYYMMDD')}${faker.string.numeric(6)}`;
    
    result.push({
      id: faker.string.uuid(),
      orderNo,
      customerName: faker.person.fullName(),
      customerPhone: faker.phone.number(),
      customerEmail: faker.internet.email(),
      totalAmount: Number(faker.commerce.price({ min: 100, max: 5000, dec: 2 })),
      status,
      statusText: ORDER_STATUS_TEXT[status],
      paymentMethod,
      paymentMethodText: PAYMENT_METHOD_TEXT[paymentMethod],
      shippingAddress: `${faker.location.city()} ${faker.location.streetAddress()}`,
      remark: faker.lorem.sentence(),
      createTime: dayjs(faker.date.recent({ days: 30 })).format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs(faker.date.recent({ days: 7 })).format('YYYY-MM-DD HH:mm:ss'),
    });
  });
  return result;
}

// 生成订单详情数据
function orderDetail(id: string) {
  const status = faker.helpers.arrayElement(ORDER_STATUS);
  const paymentMethod = faker.helpers.arrayElement(PAYMENT_METHODS);
  const orderNo = `ORD${dayjs().format('YYYYMMDD')}${faker.string.numeric(6)}`;
  
  // 生成订单商品
  const items: any[] = [];
  doCustomTimes(faker.number.int({ min: 1, max: 5 }), () => {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const price = Number(faker.commerce.price({ min: 10, max: 500, dec: 2 }));
    items.push({
      id: faker.string.uuid(),
      productName: faker.commerce.productName(),
      productImage: `https://picsum.photos/100/100?v=${faker.string.numeric(4)}`,
      price,
      quantity,
      subtotal: price * quantity,
    });
  });
  
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  
  return {
    id,
    orderNo,
    customerInfo: {
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: `${faker.location.city()} ${faker.location.streetAddress()}`,
    },
    items,
    totalAmount: Number(totalAmount.toFixed(2)),
    status,
    statusText: ORDER_STATUS_TEXT[status],
    paymentMethod,
    paymentMethodText: PAYMENT_METHOD_TEXT[paymentMethod],
    shippingAddress: `${faker.location.city()} ${faker.location.streetAddress()}`,
    remark: faker.lorem.paragraph(),
    createTime: dayjs(faker.date.recent({ days: 30 })).format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs(faker.date.recent({ days: 7 })).format('YYYY-MM-DD HH:mm:ss'),
    // 订单状态历史
    statusHistory: [
      {
        status: 'pending',
        statusText: '订单创建',
        time: dayjs(faker.date.recent({ days: 30 })).format('YYYY-MM-DD HH:mm:ss'),
        operator: '系统',
      },
      {
        status: 'confirmed',
        statusText: '订单确认',
        time: dayjs(faker.date.recent({ days: 25 })).format('YYYY-MM-DD HH:mm:ss'),
        operator: '客服小王',
      },
    ],
  };
}

// 生成客户列表
function customerList() {
  const result: any[] = [];
  doCustomTimes(20, () => {
    result.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: `${faker.location.city()} ${faker.location.streetAddress()}`,
    });
  });
  return result;
}

// 生成商品列表
function productList() {
  const result: any[] = [];
  doCustomTimes(50, () => {
    result.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      image: `https://picsum.photos/100/100?v=${faker.string.numeric(4)}`,
      price: Number(faker.commerce.price({ min: 10, max: 500, dec: 2 })),
      stock: faker.number.int({ min: 0, max: 1000 }),
      category: faker.commerce.department(),
    });
  });
  return result;
}

export default defineMock({
  // 订单列表
  '/api/order/list': ({ query }) => {
    const { page = 1, pageSize = 10, orderNo, customerName, status } = query;
    let list = orderList(Number(pageSize));
    
    // 模拟搜索过滤
    if (orderNo) {
      list = list.filter(item => item.orderNo.includes(orderNo));
    }
    if (customerName) {
      list = list.filter(item => item.customerName.includes(customerName));
    }
    if (status) {
      list = list.filter(item => item.status === status);
    }
    
    const count = 120; // 模拟总数
    return resultSuccess({
      page: Number(page),
      pageSize: Number(pageSize),
      pageCount: Math.ceil(count / Number(pageSize)),
      itemCount: count,
      list,
    });
  },

  // 订单详情
  '/api/order/detail': ({ query }) => {
    const { id } = query;
    return resultSuccess(orderDetail(id));
  },

  // 创建订单
  '/api/order/create': ({ data }) => {
    return resultSuccess({
      id: faker.string.uuid(),
      message: '订单创建成功',
    });
  },

  // 更新订单
  '/api/order/update': ({ query, data }) => {
    const { id } = query;
    return resultSuccess({
      id,
      message: '订单更新成功',
    });
  },

  // 删除订单
  '/api/order/delete': ({ query }) => {
    const { id } = query;
    return resultSuccess({
      id,
      message: '订单删除成功',
    });
  },

  // 批量删除订单
  '/api/order/batch-delete': ({ data }) => {
    const { ids } = data;
    return resultSuccess({
      count: ids.length,
      message: `成功删除 ${ids.length} 个订单`,
    });
  },

  // 客户列表
  '/api/order/customers': () => {
    return resultSuccess(customerList());
  },

  // 商品列表
  '/api/order/products': () => {
    return resultSuccess(productList());
  },
}); 