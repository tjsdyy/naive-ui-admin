<template>
  <div class="order-detail-container">
    <n-card :bordered="false">
      <template #header>
        <n-space align="center" justify="space-between">
          <n-space align="center">
            <n-button text @click="handleBack">
              <template #icon>
                <n-icon>
                  <ArrowLeftOutlined />
                </n-icon>
              </template>
            </n-button>
            <span class="text-lg font-medium">订单详情</span>
          </n-space>
          <n-space>
            <n-button type="primary" @click="handleEdit">
              <template #icon>
                <n-icon>
                  <EditOutlined />
                </n-icon>
              </template>
              编辑订单
            </n-button>
          </n-space>
        </n-space>
      </template>

      <n-spin :show="loading">
        <div v-if="orderDetail">
          <!-- 订单基本信息 -->
          <n-card class="order-basic-info mb-4" :bordered="false">
            <!-- 订单头部信息 -->
            <div class="order-header">
              <div class="order-header-left">
                <div class="order-no">
                  <span class="label">订单编号</span>
                  <span class="value">{{ orderDetail.orderNo }}</span>
                </div>
                <div class="order-status">
                  <n-tag :type="getStatusType(orderDetail.status)" size="large" round>
                    {{ orderDetail.statusText }}
                  </n-tag>
                </div>
              </div>
              <div class="order-header-right">
                <div class="order-amount">
                  <span class="amount-label">订单金额</span>
                  <span class="amount-value">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- 订单详细信息 -->
            <div class="order-details">
              <div class="detail-item">
                <div class="detail-icon">
                  <n-icon size="16" color="#666">
                    <CreditCardOutlined />
                  </n-icon>
                </div>
                <div class="detail-content">
                  <span class="detail-label">支付方式</span>
                  <span class="detail-value">{{ orderDetail.paymentMethodText }}</span>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon">
                  <n-icon size="16" color="#666">
                    <ClockCircleOutlined />
                  </n-icon>
                </div>
                <div class="detail-content">
                  <span class="detail-label">创建时间</span>
                  <span class="detail-value">{{ orderDetail.createTime }}</span>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon">
                  <n-icon size="16" color="#666">
                    <SyncOutlined />
                  </n-icon>
                </div>
                <div class="detail-content">
                  <span class="detail-label">更新时间</span>
                  <span class="detail-value">{{ orderDetail.updateTime }}</span>
                </div>
              </div>
            </div>
          </n-card>

          <!-- 详细信息 Tab页 -->
          <n-card class="mb-4">
            <n-tabs type="line" animated>
              <n-tab-pane name="customer" tab="客户信息">
                <template #tab>
                  <n-space align="center">
                    <n-icon>
                      <UserOutlined />
                    </n-icon>
                    客户信息
                  </n-space>
                </template>
                <n-descriptions :column="2" bordered>
                  <n-descriptions-item label="客户姓名">
                    {{ orderDetail.customerInfo?.name }}
                  </n-descriptions-item>
                  <n-descriptions-item label="客户电话">
                    {{ orderDetail.customerInfo?.phone }}
                  </n-descriptions-item>
                  <n-descriptions-item label="客户邮箱">
                    {{ orderDetail.customerInfo?.email }}
                  </n-descriptions-item>
                  <n-descriptions-item label="客户地址">
                    {{ orderDetail.customerInfo?.address }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-tab-pane>

              <n-tab-pane name="products" tab="商品信息">
                <template #tab>
                  <n-space align="center">
                    <n-icon>
                      <ShoppingCartOutlined />
                    </n-icon>
                    商品信息
                  </n-space>
                </template>
                <n-table :bordered="false" :single-line="false">
                  <thead>
                    <tr>
                      <th>商品图片</th>
                      <th>商品名称</th>
                      <th>单价</th>
                      <th>数量</th>
                      <th>小计</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in orderDetail.items" :key="item.id">
                      <td>
                        <n-avatar
                          :size="60"
                          :src="item.productImage"
                          fallback-src="https://via.placeholder.com/60x60?text=商品"
                          object-fit="cover"
                        />
                      </td>
                      <td>{{ item.productName }}</td>
                      <td>¥{{ item.price.toFixed(2) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td class="font-medium">¥{{ item.subtotal.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4" class="text-right font-medium">订单总金额：</td>
                      <td class="text-lg font-bold text-primary">
                        ¥{{ orderDetail.totalAmount.toFixed(2) }}
                      </td>
                    </tr>
                  </tfoot>
                </n-table>
              </n-tab-pane>

              <n-tab-pane name="shipping" tab="收货信息">
                <template #tab>
                  <n-space align="center">
                    <n-icon>
                      <EnvironmentOutlined />
                    </n-icon>
                    收货信息
                  </n-space>
                </template>
                <n-descriptions :column="1" bordered>
                  <n-descriptions-item label="收货地址">
                    {{ orderDetail.shippingAddress }}
                  </n-descriptions-item>
                  <n-descriptions-item label="备注信息" v-if="orderDetail.remark">
                    {{ orderDetail.remark }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-tab-pane>
            </n-tabs>
          </n-card>

          <!-- 订单状态历史 -->
          <n-card title="订单状态历史" class="mb-4">
            <n-timeline>
              <n-timeline-item
                v-for="(history, index) in orderDetail.statusHistory"
                :key="index"
                :type="getStatusType(history.status)"
              >
                <template #header>
                  <span class="font-medium">{{ history.statusText }}</span>
                </template>
                <template #default>
                  <div class="text-sm text-gray-600">
                    <div>操作人：{{ history.operator }}</div>
                    <div>时间：{{ history.time }}</div>
                  </div>
                </template>
              </n-timeline-item>
            </n-timeline>
          </n-card>
        </div>
      </n-spin>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useMessage } from 'naive-ui';
  import {
    ArrowLeftOutlined,
    EditOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    EnvironmentOutlined,
    CreditCardOutlined,
    ClockCircleOutlined,
    SyncOutlined,
  } from '@vicons/antd';
  import { getOrderDetail } from '@/api/order/index';
  import type { OrderData } from './columns';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();

  const loading = ref(false);
  const orderDetail = ref<OrderData | null>(null);

  // 获取状态对应的标签类型
  function getStatusType(status: string) {
    const statusMap = {
      pending: 'warning',
      confirmed: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error',
    };
    return statusMap[status] || 'default';
  }

  // 加载订单详情
  async function loadOrderDetail() {
    loading.value = true;
    try {
      const detail = await getOrderDetail(route.params.id as string);
      orderDetail.value = detail;
    } catch (error) {
      message.error('加载订单详情失败');
    } finally {
      loading.value = false;
    }
  }

  // 返回列表
  function handleBack() {
    router.push({ name: 'order-list' });
  }

  // 编辑订单
  function handleEdit() {
    router.push({ name: 'order-form', params: { id: route.params.id } });
  }

  // 初始化
  onMounted(() => {
    loadOrderDetail();
  });
</script>

<style lang="less" scoped>
  .order-detail-container {
    padding: 0;
  }

  .text-primary {
    color: #18a058;
  }

  .text-gray-600 {
    color: #6b7280;
  }

  .order-basic-info {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 24px;
    color: white;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .order-header-left {
        display: flex;
        align-items: center;
        gap: 24px;

        .order-no {
          .label {
            display: block;
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 4px;
          }

          .value {
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 1px;
          }
        }
      }

      .order-header-right {
        text-align: right;

        .order-amount {
          .amount-label {
            display: block;
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 4px;
          }

          .amount-value {
            font-size: 28px;
            font-weight: 700;
            color: #ffd700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }

    .order-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);

      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;

        .detail-icon {
          opacity: 0.8;
        }

        .detail-content {
          .detail-label {
            display: block;
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 2px;
          }

          .detail-value {
            font-size: 14px;
            font-weight: 500;
          }
        }
      }
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .order-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;

        .order-header-left {
          flex-direction: column;
          gap: 12px;
        }
      }

      .order-details {
        grid-template-columns: 1fr;
      }
    }
  }
</style> 