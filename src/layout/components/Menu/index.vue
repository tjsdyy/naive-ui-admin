<template>

  <div>
	<NMenu
    :options="menus"
    :inverted="inverted"
    :mode="mode"
    :collapsed="collapsed"
    :collapsed-icon-size="20"
    :indent="24"
    :render-icon="customRenderIcon"
    :expanded-keys="openKeys"
    :value="getSelectedKeys"
    @update:value="clickMenuItem"
    @update:expanded-keys="menuExpanded"
  />
	<div class="layout-header-trigger bottomout layout-header-trigger-min">
        <n-dropdown trigger="hover" @select="avatarSelect" :options="avatarOptions">
          <div class="avatar">
            <span>退出登录</span>
          </div>
        </n-dropdown>
      </div>
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
    ref,
    onMounted,
    reactive,
    computed,
    watch,
    toRefs,
    unref,
    h,
  } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { useAsyncRouteStore } from '@/store/modules/asyncRoute';
  import { generatorMenu, generatorMenuMix } from '@/utils';
  import { useProjectSettingStore } from '@/store/modules/projectSetting';
  import { useProjectSetting } from '@/hooks/setting/useProjectSetting';
  import { useDialog, useMessage } from 'naive-ui';
  import { useUserStore } from '@/store/modules/user';
  export default defineComponent({
    name: 'AppMenu',
    components: {},
    props: {
      mode: {
        // 菜单模式
        type: String,
        default: 'vertical',
      },
      collapsed: {
        // 侧边栏菜单是否收起
        type: Boolean,
      },
      //位置
      location: {
        type: String,
        default: 'left',
      },
    },
    emits: ['update:collapsed', 'clickMenuItem'],
    setup(props, { emit }) {
      // 当前路由
      const currentRoute = useRoute();
      const router = useRouter();
      const userStore = useUserStore();

      const asyncRouteStore = useAsyncRouteStore();
      const settingStore = useProjectSettingStore();
      const menus = ref<any[]>([]);
      const selectedKeys = ref<string>(currentRoute.name as string);
      const headerMenuSelectKey = ref<string>('');
		const message = useMessage();
		const dialog = useDialog();
      const { navMode } = useProjectSetting();

      // 获取当前打开的子菜单
      const matched = currentRoute.matched;

      const getOpenKeys = matched && matched.length ? matched.map((item) => item.name) : [];

      const state = reactive({
        openKeys: getOpenKeys,
      });


      const inverted = computed(() => {
        return ['dark', 'header-dark'].includes(settingStore.navTheme);
      });

      const getSelectedKeys = computed(() => {
        let location = props.location;
        return location === 'left' || (location === 'header' && unref(navMode) === 'horizontal')
          ? unref(selectedKeys)
          : unref(headerMenuSelectKey);
      });

      // 自定义图标渲染函数
      function customRenderIcon(option: any) {
        // 检查是否为一级菜单（有children的菜单项）
        if (option.children && option.children.length > 0) {
          // 检查当前菜单是否展开
          return null;
        }
        // 对于没有子菜单的项目，返回原始图标或null
        return option.icon ? null : null;
      }

      // 监听分割菜单
      watch(
        () => settingStore.menuSetting.mixMenu,
        () => {
          updateMenu();
          if (props.collapsed) {
            emit('update:collapsed', !props.collapsed);
          }
        }
      );

      // 监听菜单收缩状态
      // watch(
      //   () => props.collapsed,
      //   (newVal) => {
      //   }
      // );

      // 跟随页面路由变化，切换菜单选中状态
      watch(
        () => currentRoute.fullPath,
        () => {
          updateMenu();
        }
      );
        const avatarOptions = [
        {
          label: '个人设置',
          key: 1,
        },
        {
          label: '退出登录',
          key: 2,
        },
      ];
      // 退出登录
      const doLogout = () => {
        dialog.info({
          title: '提示',
          content: '您确定要退出登录吗',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: () => {
            userStore.logout().then(() => {
              message.success('成功退出登录');
              // 移除标签页
              router
                .replace({
                  name: 'Login'
                })
                .finally(() => location.reload());
            });
          },
          onNegativeClick: () => {},
        });
      };
      //头像下拉菜单
      const avatarSelect = (key) => {
        switch (key) {
          case 1:
            router.push({ name: 'Setting' });
            break;
          case 2:
            doLogout();
            break;
        }
      };

      function updateSelectedKeys() {
        const matched = currentRoute.matched;
        state.openKeys = matched.map((item) => item.name);
        const activeMenu: string = (currentRoute.meta?.activeMenu as string) || '';
        selectedKeys.value = activeMenu ? (activeMenu as string) : (currentRoute.name as string);
      }

      function updateMenu() {
        if (!settingStore.menuSetting.mixMenu) {
          menus.value = generatorMenu(asyncRouteStore.getMenus);
        } else {
          //混合菜单
          const firstRouteName: string = (currentRoute.matched[0].name as string) || '';
          menus.value = generatorMenuMix(asyncRouteStore.getMenus, firstRouteName, props.location);
          const activeMenu: string = currentRoute?.matched[0].meta?.activeMenu as string;
          headerMenuSelectKey.value = (activeMenu ? activeMenu : firstRouteName) || '';
        }
        updateSelectedKeys();
      }

      // 点击菜单
      function clickMenuItem(key: string) {
        if (/http(s)?:/.test(key)) {
          window.open(key);
        } else {
          router.push({ name: key });
        }
        emit('clickMenuItem' as any, key);
      }

      //展开菜单
      function menuExpanded(openKeys: string[]) {
        if (!openKeys) return;
        const latestOpenKey = openKeys.find((key) => state.openKeys.indexOf(key) === -1);
        const isExistChildren = findChildrenLen(latestOpenKey as string);
        state.openKeys = isExistChildren ? (latestOpenKey ? [latestOpenKey] : []) : openKeys;
      }

      //查找是否存在子路由
      function findChildrenLen(key: string) {
        if (!key) return false;
        const subRouteChildren: string[] = [];
        for (const { children, key } of unref(menus)) {
          if (children && children.length) {
            subRouteChildren.push(key as string);
          }
        }
        return subRouteChildren.includes(key);
      }

      onMounted(() => {
        updateMenu();
      });

      return {
        ...toRefs(state),
        inverted,
        avatarSelect,
        avatarOptions,
        menus,
        selectedKeys,
        headerMenuSelectKey,
        getSelectedKeys,
        customRenderIcon,
        clickMenuItem,
        menuExpanded,
      };
    },
  });
</script>

<style lang="less" scoped>
.bottomout {
  position: absolute;
  bottom: 10px;
  left:  10px;
}
</style>
