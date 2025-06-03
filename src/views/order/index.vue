<template>
  <n-card :bordered="false">
    <BasicForm @register="register" @submit="handleSubmit" @reset="handleReset">
      <template #statusSlot="{ model, field }">
        <n-select
          v-model:value="model[field]"
          placeholder="请选择订单状态"
          :options="statusOptions"
          clearable
        />
      </template>
    </BasicForm>
  </n-card>
  
  <n-card :bordered="false" class="mt-3">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row: OrderData) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      @update:checked-row-keys="onCheckedRow"
      :scroll-x="1400"
      :striped="false"
    >
      <template #tableTitle>
        <n-space>
          <n-button type="primary" @click="handleAdd">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新建订单
          </n-button>
          <n-button
            type="error"
            :disabled="checkedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
            <template #icon>
              <n-icon>
                <DeleteOutlined />
              </n-icon>
            </template>
            批量删除
          </n-button>
        </n-space>
      </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { getOrderList, deleteOrder, batchDeleteOrder } from '@/api/order/index';
  import { columns, OrderData } from './columns';
  import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@vicons/antd';
  import { useRouter } from 'vue-router';
  import { useDialog, useMessage } from 'naive-ui';

  const router = useRouter();
  const dialog = useDialog();
  const message = useMessage();
  const actionRef = ref();
  const checkedRowKeys = ref<string[]>([]);

  // 订单状态选项
  const statusOptions = [
    { label: '待确认', value: 'pending' },
    { label: '已确认', value: 'confirmed' },
    { label: '已发货', value: 'shipped' },
    { label: '已送达', value: 'delivered' },
    { label: '已取消', value: 'cancelled' },
  ];

  // 搜索表单配置
  const schemas: FormSchema[] = [
    {
      field: 'orderNo',
      component: 'NInput',
      label: '订单编号',
      componentProps: {
        placeholder: '请输入订单编号',
      },
    },
    {
      field: 'customerName',
      component: 'NInput',
      label: '客户姓名',
      componentProps: {
        placeholder: '请输入客户姓名',
      },
    },
    {
      field: 'status',
      label: '订单状态',
      slot: 'statusSlot',
    },
    {
      field: 'createTimeRange',
      component: 'NDatePicker',
      label: '创建时间',
      componentProps: {
        type: 'daterange',
        clearable: true,
        placeholder: ['开始日期', '结束日期'],
      },
    },
  ];

  // 操作列配置
  const actionColumn = reactive({
    width: 200,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record: OrderData) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '查看',
            icon: EyeOutlined,
            onClick: handleView.bind(null, record),
            ifShow: () => {
              return true;
            },
            auth: ['basic_list'],
          },
          {
            label: '编辑',
            icon: EditOutlined,
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return true;
            },
            auth: ['basic_list'],
          },
          {
            label: '删除',
            icon: DeleteOutlined,
            onClick: handleDelete.bind(null, record),
            ifShow: () => {
              return true;
            },
            auth: ['basic_list'],
          },
        ],
      });
    },
  });

  const [register, { getFieldsValue }] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  // 加载表格数据
  const loadDataTable = async (res) => {
    const params = { ...getFieldsValue(), ...res };
    
    // 处理日期范围
    if (params.createTimeRange && params.createTimeRange.length === 2) {
      params.startTime = new Date(params.createTimeRange[0]).toISOString();
      params.endTime = new Date(params.createTimeRange[1]).toISOString();
      delete params.createTimeRange;
    }
    
    return await getOrderList(params);
  };

  // 新建订单
  function handleAdd() {
    router.push({ name: 'order-form' });
  }

  // 查看订单详情
  function handleView(record: OrderData) {
    router.push({ name: 'order-detail', params: { id: record.id } });
  }

  // 编辑订单
  function handleEdit(record: OrderData) {
    router.push({ name: 'order-form', params: { id: record.id } });
  }

  // 删除订单
  function handleDelete(record: OrderData) {
    dialog.warning({
      title: '确认删除',
      content: `确定要删除订单 ${record.orderNo} 吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await deleteOrder(record.id);
          message.success('删除成功');
          reloadTable();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  }

  // 批量删除
  function handleBatchDelete() {
    if (checkedRowKeys.value.length === 0) {
      message.warning('请选择要删除的订单');
      return;
    }

    dialog.warning({
      title: '确认批量删除',
      content: `确定要删除选中的 ${checkedRowKeys.value.length} 个订单吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await batchDeleteOrder(checkedRowKeys.value);
          message.success(`成功删除 ${checkedRowKeys.value.length} 个订单`);
          checkedRowKeys.value = [];
          reloadTable();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  }

  // 选中行变化
  function onCheckedRow(rowKeys: string[]) {
    checkedRowKeys.value = rowKeys;
  }

  // 重新加载表格
  function reloadTable() {
    actionRef.value.reload();
  }

  // 搜索提交
  function handleSubmit(values: Recordable) {
    reloadTable();
  }

  // 重置搜索
  function handleReset(values: Recordable) {
    reloadTable();
  }
</script>

<style lang="less" scoped></style> 