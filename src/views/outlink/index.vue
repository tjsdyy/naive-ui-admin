<template>
  <div>
    <n-card :bordered="false" class="proCard">
      <BasicForm
        @register="register"
        @submit="handleSubmit"
        @reset="handleReset"
        @keyup.enter="handleSubmit"
        ref="searchFormRef"
      >
        <template #statusSlot="{ model, field }">
          <n-input v-model:value="model[field]" />
        </template>
      </BasicForm>

      <BasicTable
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row) => row.id"
        ref="actionRef"
        :actionColumn="actionColumn"
        @update:checked-row-keys="onCheckedRow"
        :scroll-x="1090"
        :resizeHeightOffset="-10000"
        :default-sort="{ columnKey: 'id', order: 'descend' }"
      >
        <template #tableTitle>
          <n-button v-if="!isTestUser" type="primary" @click="addTable">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新增外链
          </n-button>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enable'">
            <n-tag :type="record.enable ? 'success' : 'error'">
              {{ record.enable ? '启用' : '禁用' }}
            </n-tag>
          </template>
        </template>
      </BasicTable>
    </n-card>

    <n-modal v-model:show="showModal" :style="bodyStyle" transform-origin="center">
      <n-card
        style="width: 800px"
        :title="modalTitle"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-icon size="16" @click="() => (showModal = false)">
            <CloseOutlined />
          </n-icon>
        </template>
        <n-form
          :model="formParams"
          :rules="rules"
          ref="formRef"
          label-placement="left"
          :label-width="80"
          class="py-4"
        >
          <n-form-item v-if="!isTestUser" label="链接地址" path="href">
            <n-input placeholder="请输入链接地址" v-model:value="formParams.href" />
          </n-form-item>
          <n-form-item v-if="!isTestUser" label="名称" path="name">
            <n-input placeholder="请输入名称" v-model:value="formParams.name" />
          </n-form-item>
          <n-form-item v-if="!isTestUser" label="站点描述" path="siteDesc">
            <n-input
              placeholder="请输入站点描述"
              v-model:value="formParams.siteDesc"
              type="textarea"
              :rows="5"
            />
          </n-form-item>
          <n-form-item label="操作描述" path="operDesc">
            <n-input
              placeholder="请输入操作结果，操作url地址，以及注册的用户名和账号密码"
              type="textarea"
              :rows="10"
              v-model:value="formParams.operDesc"
            />
          </n-form-item>
          <n-form-item label="是否完成" path="enable">
            <n-switch v-model:value="formParams.enable" :checked-value="1" :unchecked-value="0">
              <template #checked>完成</template>
              <template #unchecked>未完成</template>
            </n-switch>
          </n-form-item>
        </n-form>

        <template #footer>
          <n-space>
            <n-button @click="() => (showModal = false)">取消</n-button>
            <n-button type="primary" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, unref, h, nextTick, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useDialog, useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { PlusOutlined, CloseOutlined } from '@vicons/antd';
  import { columns } from './columns';
  import { useUserStore } from '@/store/modules/user';
  import {
    getOutlinkList,
    getOutlinkDetail,
    modifyOutlink,
    addOutlink,
    deleteOutlink,
    type OutlinkItem,
  } from '@/api/outlink';

  const userStore = useUserStore();
  
  // 判断是否为test用户
  const isTestUser = computed(() => {
    console.log('当前用户信息:', userStore.getUserInfo);
    console.log('用户名:', userStore.getUserInfo?.username);
    console.log('store.username:', userStore.username);
    console.log('store.info:', userStore.info);
    console.log('是否为test用户:', userStore.getUserInfo?.username === 'test');
    
    // 尝试多种方式获取用户名
    const username = userStore.getUserInfo?.username || userStore.username || userStore.info?.username;
    console.log('最终获取的用户名:', username);
    
    return username === 'test';
  });

  const schemas: FormSchema[] = [
    {
      field: 'name',
      component: 'NInput',
      label: '名称',
      componentProps: {
        placeholder: '请输入名称',
        onUpdateValue: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'href',
      component: 'NInput',
      label: '链接地址',
      componentProps: {
        placeholder: '请输入链接地址',
      },
    },
    {
      field: 'enable',
      component: 'NSelect',
      label: '是否完成',
      componentProps: {
        placeholder: '请选择完成状态',
        options: [
          {
            label: '全部',
            value: '',
          },
          {
            label: '已完成',
            value: 1,
          },
          {
            label: '未完成',
            value: 0,
          },
        ],
        clearable: true,
      },
    },
  ];

  const router = useRouter();
  const dialog = useDialog();
  const message = useMessage();
  const actionRef = ref();
  const searchFormRef = ref<any>({});
  const formRef = ref<any>({});
  const showModal = ref(false);
  const formBtnLoading = ref(false);
  const formParams = ref<Partial<OutlinkItem>>({});
  const modalTitle = ref('');

  const bodyStyle = {
    width: '600px',
  };

  const [register, { getFieldsValue }] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    schemas,
  });

  const loadDataTable = async (res: any) => {
    // 获取筛选表单的值
    const formValues = getFieldsValue();
    
    // 构建SQL筛选条件
    const filterConditions: string[] = [];
    
    if (formValues.name && formValues.name.trim()) {
      filterConditions.push(`name LIKE '%${formValues.name.trim()}%'`);
    }
    
    if (formValues.href && formValues.href.trim()) {
      filterConditions.push(`href LIKE '%${formValues.href.trim()}%'`);
    }
    
    if (formValues.enable !== undefined && formValues.enable !== '') {
      filterConditions.push(`enable = ${formValues.enable}`);
    }
    
    // 拼接SQL条件
    const filter = filterConditions.length > 0 ? filterConditions.join(' AND ') : '';
    
    // 处理排序参数，默认按id倒序
    let orderBy = 'id DESC';
    if (res.sorter && res.sorter.columnKey) {
      const order = res.sorter.order === 'ascend' ? 'ASC' : 'DESC';
      orderBy = `${res.sorter.columnKey} ${order}`;
    }

    const response = await getOutlinkList({ 
      page: res.page, 
      limit: res.pageSize,
      filter: filter,
      orderBy: orderBy,
    });
    console.log('response', response);
    return {
      list: response.tableData,
      page: response.pageInfo.page,
      pageSize: response.pageInfo.limit,
      pageCount: response.pageInfo.totalPage,
      itemCount: response.pageInfo.total,
      total: response.pageInfo.total,
    };
  };

  const actionColumn = reactive({
    width: 220,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record: OutlinkItem) {
      const actions = [
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
        },
      ];
      
      // 如果不是test用户，显示删除按钮
      if (!isTestUser.value) {
        actions.push({
          label: '删除',
          onClick: () => handleDelete(record),
        });
      }

      return h(TableAction as any, {
        style: 'button',
        actions: actions,
      });
    },
  });

  const rules = computed(() => {
    if (isTestUser.value) {
      // test用户只需要验证operDesc字段
      return {
        operDesc: {
          required: false,
          trigger: ['blur', 'input'],
          message: '请输入操作描述',
        },
      };
    } else {
      // 管理员用户需要验证所有必填字段
      return {
        href: {
          required: true,
          trigger: ['blur', 'input'],
          message: '请输入链接地址',
        },
        name: {
          required: true,
          trigger: ['blur', 'input'],
          message: '请输入名称',
        },
        siteDesc: {
          required: true,
          trigger: ['blur', 'input'],
          message: '请输入站点描述',
        },
      };
    }
  });

  function addTable() {
    if (isTestUser.value) {
      message.warning('test用户无权限新增');
      return;
    }
    showModal.value = true;
    modalTitle.value = '新增外链';
    formParams.value = {
      href: '',
      name: '',
      siteDesc: '',
      operDesc: '',
      enable: 1,
      dr: 0,
    };
  }

  function onCheckedRow(rowKeys: string[]) {
    console.log(rowKeys);
  }

  function reloadTable() {
    actionRef.value?.reload();
  }

  function handleSubmit(values: Recordable) {
    console.log('筛选条件:', values);
    
    // 构建SQL筛选条件
    const filterConditions: string[] = [];
    
    if (values.name && values.name.trim()) {
      filterConditions.push(`name LIKE '%${values.name.trim()}%'`);
    }
    
    if (values.href && values.href.trim()) {
      filterConditions.push(`href LIKE '%${values.href.trim()}%'`);
    }
    
    if (values.enable !== undefined && values.enable !== '') {
      filterConditions.push(`enable = ${values.enable}`);
    }
    
    const filter = filterConditions.length > 0 ? filterConditions.join(' AND ') : '';
    console.log('生成的SQL筛选条件:', filter);
    
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log('重置筛选条件:', values);
    reloadTable();
  }

  async function handleEdit(record: Recordable) {
    showModal.value = true;
    modalTitle.value = isTestUser.value ? '编辑操作描述' : '编辑外链';
    try {
      const response = await getOutlinkDetail(record.id);
      formParams.value = { ...response.data.data };
    } catch (error) {
      message.error('获取详情失败');
    }
  }

  async function handleDelete(record: Recordable) {
    if (isTestUser.value) {
      message.warning('test用户无权限删除');
      return;
    }
    dialog.warning({
      title: '警告',
      content: '你确定要删除吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await deleteOutlink(record.id);
          message.success('删除成功');
          await nextTick();
          reloadTable();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  }

  function confirmForm(e: MouseEvent) {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate(async (errors: any) => {
      if (!errors) {
        try {
          if (formParams.value.id) {
            if (isTestUser.value) {
              // test用户只能修改operDesc字段
              const updateData = {
                id: formParams.value.id,
                operDesc: formParams.value.operDesc,
                enable: formParams.value.enable,
              };
              await modifyOutlink(updateData);
              message.success('修改操作描述成功');
            } else {
              await modifyOutlink(formParams.value);
              message.success('修改成功');
            }
          } else {
            if (isTestUser.value) {
              message.warning('test用户无权限新增');
              formBtnLoading.value = false;
              return;
            }
            await addOutlink(formParams.value as any);
            message.success('新增成功');
          }
          showModal.value = false;
          reloadTable();
        } catch (error) {
          message.error(formParams.value.id ? '修改失败' : '新增失败');
        }
      } else {
        message.error('请填写完整信息');
      }
      formBtnLoading.value = false;
    });
  }
</script>

<style lang="less" scoped></style> 