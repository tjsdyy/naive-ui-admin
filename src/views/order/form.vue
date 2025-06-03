<template>
  <div class="order-form-container">
    <n-card :bordered="false">
      <template #header>
        <n-space align="center">
          <n-button text @click="handleBack">
            <template #icon>
              <n-icon>
                <ArrowLeftOutlined />
              </n-icon>
            </template>
          </n-button>
          <span class="text-lg font-medium">{{ isEdit ? '编辑订单' : '新建订单' }}</span>
        </n-space>
      </template>

      <n-spin :show="loading">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          :label-width="120"
          require-mark-placement="right-hanging"
        >
          <!-- 客户信息 -->
          <n-card title="客户信息" class="mb-4">
            <n-grid :cols="2" :x-gap="24">
              <n-form-item-gi label="选择客户" path="customerId">
                <n-select
                  v-model:value="formData.customerId"
                  placeholder="请选择客户"
                  :options="customerOptions"
                  filterable
                  clearable
                  @update:value="handleCustomerChange"
                />
              </n-form-item-gi>
              <n-form-item-gi label="客户姓名" path="customerName">
                <n-input v-model:value="formData.customerName" placeholder="请输入客户姓名" />
              </n-form-item-gi>
              <n-form-item-gi label="客户电话" path="customerPhone">
                <n-input v-model:value="formData.customerPhone" placeholder="请输入客户电话" />
              </n-form-item-gi>
              <n-form-item-gi label="客户邮箱" path="customerEmail">
                <n-input v-model:value="formData.customerEmail" placeholder="请输入客户邮箱" />
              </n-form-item-gi>
            </n-grid>
          </n-card>

          <!-- 订单商品 -->
          <n-card title="订单商品" class="mb-4">
            <n-space vertical>
              <n-button type="primary" dashed @click="handleAddProduct">
                <template #icon>
                  <n-icon>
                    <PlusOutlined />
                  </n-icon>
                </template>
                添加商品
              </n-button>
              
              <n-table v-if="formData.items.length > 0" :bordered="false" :single-line="false">
                <thead>
                  <tr>
                    <th>商品名称</th>
                    <th>单价</th>
                    <th>数量</th>
                    <th>小计</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in formData.items" :key="index">
                    <td>
                      <n-select
                        v-model:value="item.productId"
                        placeholder="请选择商品"
                        :options="productOptions"
                        filterable
                        @update:value="(value) => handleProductChange(index, value)"
                      />
                    </td>
                    <td>
                      <n-input-number
                        v-model:value="item.price"
                        placeholder="单价"
                        :precision="2"
                        :min="0"
                        @update:value="() => calculateSubtotal(index)"
                      />
                    </td>
                    <td>
                      <n-input-number
                        v-model:value="item.quantity"
                        placeholder="数量"
                        :min="1"
                        @update:value="() => calculateSubtotal(index)"
                      />
                    </td>
                    <td>¥{{ item.subtotal.toFixed(2) }}</td>
                    <td>
                      <n-button type="error" size="small" @click="handleRemoveProduct(index)">
                        删除
                      </n-button>
                    </td>
                  </tr>
                </tbody>
              </n-table>
              
              <n-empty v-else description="暂无商品，请添加商品" />
            </n-space>
          </n-card>

          <!-- 订单信息 -->
          <n-card title="订单信息" class="mb-4">
            <n-grid :cols="2" :x-gap="24">
              <n-form-item-gi label="订单金额">
                <n-input-number
                  :value="totalAmount"
                  placeholder="订单金额"
                  :precision="2"
                  readonly
                />
              </n-form-item-gi>
              <n-form-item-gi label="订单状态" path="status">
                <n-select
                  v-model:value="formData.status"
                  placeholder="请选择订单状态"
                  :options="statusOptions"
                />
              </n-form-item-gi>
              <n-form-item-gi label="支付方式" path="paymentMethod">
                <n-select
                  v-model:value="formData.paymentMethod"
                  placeholder="请选择支付方式"
                  :options="paymentMethodOptions"
                />
              </n-form-item-gi>
              <n-form-item-gi label="收货地址" path="shippingAddress">
                <n-input
                  v-model:value="formData.shippingAddress"
                  placeholder="请输入收货地址"
                  type="textarea"
                  :rows="2"
                />
              </n-form-item-gi>
            </n-grid>
            <n-form-item label="备注" path="remark">
              <n-input
                v-model:value="formData.remark"
                placeholder="请输入备注信息"
                type="textarea"
                :rows="3"
              />
            </n-form-item>
          </n-card>

          <!-- 操作按钮 -->
          <n-space justify="center">
            <n-button @click="handleBack">取消</n-button>
            <n-button type="primary" :loading="submitLoading" @click="handleSubmit">
              {{ isEdit ? '更新订单' : '创建订单' }}
            </n-button>
          </n-space>
        </n-form>
      </n-spin>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useMessage } from 'naive-ui';
  import { ArrowLeftOutlined, PlusOutlined } from '@vicons/antd';
  import {
    getOrderDetail,
    createOrder,
    updateOrder,
    getCustomerList,
    getProductList,
  } from '@/api/order/index';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();

  const formRef = ref();
  const loading = ref(false);
  const submitLoading = ref(false);
  const customerOptions = ref([]);
  const productOptions = ref([]);

  // 判断是否为编辑模式
  const isEdit = computed(() => !!route.params.id);

  // 表单数据
  const formData = reactive({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [],
    status: 'pending',
    paymentMethod: '',
    shippingAddress: '',
    remark: '',
  });

  // 订单状态选项
  const statusOptions = [
    { label: '待确认', value: 'pending' },
    { label: '已确认', value: 'confirmed' },
    { label: '已发货', value: 'shipped' },
    { label: '已送达', value: 'delivered' },
    { label: '已取消', value: 'cancelled' },
  ];

  // 支付方式选项
  const paymentMethodOptions = [
    { label: '支付宝', value: 'alipay' },
    { label: '微信支付', value: 'wechat' },
    { label: '银行转账', value: 'bank' },
    { label: '现金支付', value: 'cash' },
  ];

  // 表单验证规则
  const rules = {
    customerName: {
      required: true,
      message: '请输入客户姓名',
      trigger: ['blur', 'input'],
    },
    customerPhone: {
      required: true,
      message: '请输入客户电话',
      trigger: ['blur', 'input'],
    },
    status: {
      required: true,
      message: '请选择订单状态',
      trigger: ['blur', 'change'],
    },
    paymentMethod: {
      required: true,
      message: '请选择支付方式',
      trigger: ['blur', 'change'],
    },
    shippingAddress: {
      required: true,
      message: '请输入收货地址',
      trigger: ['blur', 'input'],
    },
  };

  // 计算订单总金额
  const totalAmount = computed(() => {
    return formData.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  });

  // 初始化数据
  onMounted(async () => {
    await loadOptions();
    if (isEdit.value) {
      await loadOrderDetail();
    }
  });

  // 加载选项数据
  async function loadOptions() {
    try {
      const [customerRes, productRes] = await Promise.all([
        getCustomerList(),
        getProductList(),
      ]);

      customerOptions.value = customerRes.map(item => ({
        label: `${item.name} (${item.phone})`,
        value: item.id,
        ...item,
      }));

      productOptions.value = productRes.map(item => ({
        label: `${item.name} - ¥${item.price}`,
        value: item.id,
        ...item,
      }));
    } catch (error) {
      message.error('加载数据失败');
    }
  }

  // 加载订单详情
  async function loadOrderDetail() {
    loading.value = true;
    try {
      const detail = await getOrderDetail(route.params.id as string);
      
      // 填充表单数据
      Object.assign(formData, {
        customerId: detail.customerInfo.id,
        customerName: detail.customerInfo.name,
        customerPhone: detail.customerInfo.phone,
        customerEmail: detail.customerInfo.email,
        items: detail.items.map(item => ({
          productId: item.id,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        status: detail.status,
        paymentMethod: detail.paymentMethod,
        shippingAddress: detail.shippingAddress,
        remark: detail.remark,
      });
    } catch (error) {
      message.error('加载订单详情失败');
    } finally {
      loading.value = false;
    }
  }

  // 客户选择变化
  function handleCustomerChange(value: string) {
    const customer = customerOptions.value.find(item => item.value === value);
    if (customer) {
      formData.customerName = customer.name;
      formData.customerPhone = customer.phone;
      formData.customerEmail = customer.email;
    }
  }

  // 添加商品
  function handleAddProduct() {
    formData.items.push({
      productId: '',
      productName: '',
      price: 0,
      quantity: 1,
      subtotal: 0,
    });
  }

  // 移除商品
  function handleRemoveProduct(index: number) {
    formData.items.splice(index, 1);
  }

  // 商品选择变化
  function handleProductChange(index: number, value: string) {
    const product = productOptions.value.find(item => item.value === value);
    if (product) {
      formData.items[index].productName = product.name;
      formData.items[index].price = product.price;
      calculateSubtotal(index);
    }
  }

  // 计算小计
  function calculateSubtotal(index: number) {
    const item = formData.items[index];
    item.subtotal = (item.price || 0) * (item.quantity || 0);
  }

  // 返回列表
  function handleBack() {
    router.push({ name: 'order-list' });
  }

  // 提交表单
  async function handleSubmit() {
    try {
      await formRef.value?.validate();
      
      if (formData.items.length === 0) {
        message.warning('请至少添加一个商品');
        return;
      }

      submitLoading.value = true;

      const submitData = {
        ...formData,
        totalAmount: totalAmount.value,
      };

      if (isEdit.value) {
        await updateOrder(route.params.id as string, submitData);
        message.success('订单更新成功');
      } else {
        await createOrder(submitData);
        message.success('订单创建成功');
      }

      handleBack();
    } catch (error) {
      if (error?.message) {
        message.error(error.message);
      }
    } finally {
      submitLoading.value = false;
    }
  }
</script>

<style lang="less" scoped>
  .order-form-container {
    padding: 0;
  }
</style> 