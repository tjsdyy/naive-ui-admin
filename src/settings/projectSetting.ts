const setting = {
  //导航模式 vertical 左侧菜单模式 horizontal 顶部菜单模式
  navMode: 'vertical',
  //导航风格 dark 暗色侧边栏 light 白色侧边栏 header-dark 暗色顶栏
  navTheme: 'light',
  // 是否处于移动端模式
  isMobile: true,
  //顶部
  headerSetting: {
    //背景色
    bgColor: '#fff',
    //固定顶部
    fixed: true,
    //显示重载按钮
    isReload: false,
  },
  //页脚
  showFooter: false,
  //多标签
  multiTabsSetting: {
    //背景色
    bgColor: '#fff',
    //是否显示
    show: false,
    //固定多标签
    fixed: false,
  },
  //菜单
  menuSetting: {
    //最小宽度
    minMenuWidth: 44,
    //菜单宽度
    menuWidth: 200,
    //固定菜单
    fixed: true,
    //分割菜单
    mixMenu: false,
    //触发移动端侧边栏的宽度
    mobileWidth: 800,
    // 折叠菜单
    collapsed: false,
  },
  //面包屑
  crumbsSetting: {
    //是否显示
    show: false,
    //显示图标
    showIcon: false,
  },
  //菜单权限模式 FIXED 前端固定路由  BACK 动态获取
  permissionMode: 'FIXED',
  //是否开启路由动画
  isPageAnimate: false,
  //路由动画类型
  pageAnimateType: 'zoom-fade',
};
export default setting;
