<template>
  <div>
    <n-card :bordered="false" class="proCard">
      <template #header>
        <div class="flex items-center">
          <span>外链录入指导</span>
        </div>
      </template>
	  <div class="html-content-container">
		操作说明：<br>
		1、点击“外链管理”里面的“网址”链接, 跳转对应网站——注意部分网站需要翻墙 <br>
		2、进入网站后，寻找可以填写内容的，有的是评论，有的是提交一个form表单;如果需要注册的网站，请使用邮箱进行注册 <br>
		3、提交信息后，请在“外链管理”里面点击“完成”按钮(录入最后输入的页面地址：可以看到你录入的内容；提供当时注册的用户名和密码) <br>
	  </div>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useMessage } from 'naive-ui';
  import { CodeOutlined, EditOutlined, EyeOutlined } from '@vicons/antd';

  const message = useMessage();
  
  // 响应式数据
  const htmlContent = ref(`
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #2080f0; border-bottom: 2px solid #2080f0; padding-bottom: 10px;">
        欢迎使用HTML内容页面
      </h1>
      
      <div style="margin: 20px 0;">
        <h2 style="color: #333;">功能特性</h2>
        <ul style="line-height: 1.8;">
          <li>支持完整的HTML内容展示</li>
          <li>内置编辑器，可实时编辑内容</li>
          <li>支持预览模式和编辑模式切换</li>
          <li>响应式设计，适配各种屏幕尺寸</li>
        </ul>
      </div>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #666;">使用说明</h3>
        <p style="margin: 0; color: #666;">
          点击下方的"显示编辑器"按钮可以编辑此页面的HTML内容。
          您可以添加任何HTML标签、样式和内容。
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
          <h3 style="margin: 0;">自定义内容区域</h3>
          <p style="margin: 10px 0 0 0;">您可以在这里添加任何需要的内容</p>
        </div>
      </div>
    </div>
  `);
  
  const showEditor = ref(false);
  const previewMode = ref(true);
  
  // 方法
  function toggleEditor() {
    showEditor.value = !showEditor.value;
  }
  
  function saveContent() {
    // 这里可以添加保存到后端的逻辑
    message.success('内容已保存');
    localStorage.setItem('htmlPageContent', htmlContent.value);
  }
  
  function resetContent() {
    htmlContent.value = `
      <div style="padding: 20px; text-align: center;">
        <h1>重置后的内容</h1>
        <p>内容已重置，您可以重新编辑。</p>
      </div>
    `;
    message.info('内容已重置');
  }
  
  // 生命周期
  onMounted(() => {
    // 从本地存储加载内容
    const savedContent = localStorage.getItem('htmlPageContent');
    if (savedContent) {
      htmlContent.value = savedContent;
    }
  });
</script>

<style lang="less" scoped>
  .html-content-container {
    min-height: 400px;
  }
  
  .content-area {
    min-height: 300px;
    border: 1px solid #e0e0e6;
    border-radius: 6px;
    padding: 16px;
    background: #fff;
    
    :deep(h1), :deep(h2), :deep(h3) {
      margin-top: 0;
    }
    
    :deep(p) {
      line-height: 1.6;
    }
    
    :deep(ul), :deep(ol) {
      padding-left: 20px;
    }
  }
  
  .editor-area {
    border-top: 1px solid #e0e0e6;
    padding-top: 16px;
  }
  
  .toolbar {
    border-top: 1px solid #e0e0e6;
    padding-top: 16px;
  }
  
  @media (max-width: 768px) {
    .html-content-container {
      padding: 0;
    }
    
    .content-area {
      padding: 12px;
    }
  }
</style> 