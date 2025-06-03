import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER, IS_SCREENLOCKED } from '@/store/mutation-types';
import { ResultEnum } from '@/enums/httpEnum';

import { getUserInfo as getUserInfoApi, login } from '@/api/system/user';
import { storage } from '@/utils/Storage';

export type UserInfoType = {
  // TODO: add your own data
  username: string;
  email: string;
};

export interface IUserState {
  token: string;
  username: string;
  welcome: string;
  avatar: string;
  permissions: any[];
  info: UserInfoType;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: storage.get(ACCESS_TOKEN, ''),
    username: '',
    welcome: '',
    avatar: '',
    permissions: [],
    info: storage.get(CURRENT_USER, {}),
  }),
  getters: {
    getToken(): string {
      return this.token;
    },
    getAvatar(): string {
      return this.avatar;
    },
    getNickname(): string {
      return this.username;
    },
    getPermissions(): [any][] {
      return this.permissions;
    },
    getUserInfo(): UserInfoType {
		console.log('this.info', this.info);
      return this.info;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setPermissions(permissions) {
      this.permissions = permissions;
    },
    setUserInfo(info: UserInfoType) {
      this.info = info;
    },
    // 登录
    async login(params: any) {
      // 先清除之前的用户信息缓存
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
      storage.remove(IS_SCREENLOCKED);
      this.setToken('');
      this.setUserInfo({ username: '', email: '' });

      // 写死的用户账号验证
      const hardcodedUsers = {
        admin: 'admin@345',
        test: '123123',
      };

      const { username, password } = params;

      // 检查用户名和密码是否匹配
      if (hardcodedUsers[username] && hardcodedUsers[username] === password) {
        // 模拟成功的登录响应
        const mockResult = {
          token: `mock_token_${username}_${Date.now()}`,
          username: username,
          email: `${username}@example.com`,
          avatar: '',
          permissions: [
            {
              label: '主控台',
              value: 'dashboard_console',
            },
            {
              label: '监控页',
              value: 'dashboard_monitor',
            },
            {
              label: '工作台',
              value: 'dashboard_workplace',
            },
            {
              label: '基础列表',
              value: 'basic_list',
            },
            {
              label: '基础列表删除',
              value: 'basic_list_delete',
            },
          ],
        };

        const ex = 7 * 24 * 60 * 60;
        storage.set(ACCESS_TOKEN, mockResult.token, ex);
        storage.set(CURRENT_USER, mockResult, ex);
        storage.set(IS_SCREENLOCKED, false);
        this.setToken(mockResult.token);
        this.setUserInfo(mockResult);
    // 尝试多种方式获取用户名

        console.log('mockResult', mockResult);
        console.log('mockResult', this.getUserInfo);

        return {
          code: ResultEnum.SUCCESS,
          result: mockResult,
          message: '登录成功',
        };
      } else {
        return {
          code: ResultEnum.ERROR,
          result: null,
          message: '用户名或密码错误',
        };
      }

      // 原来的API调用代码（已注释）
      // const response = await login(params);
      // const { result, code } = response;
      // if (code === ResultEnum.SUCCESS) {
      //   const ex = 7 * 24 * 60 * 60;
      //   storage.set(ACCESS_TOKEN, result.token, ex);
      //   storage.set(CURRENT_USER, result, ex);
      //   storage.set(IS_SCREENLOCKED, false);
      //   this.setToken(result.token);
      //   this.setUserInfo(result);
      // }
      // return response;
    },

    // 获取用户信息
    async getInfo() {
    //   const data = await getUserInfoApi();
    //   const { result } = data;
    //   if (result.permissions && result.permissions.length) {
    //     const permissionsList = result.permissions;
    //     this.setPermissions(permissionsList);
    //     this.setUserInfo(result);
    //   } else {
    //     throw new Error('getInfo: permissionsList must be a non-null array !');
    //   }
    //   this.setAvatar(result.avatar);
      return this.getUserInfo;
    },

    // 登出
    async logout() {
      this.setPermissions([]);
      this.setUserInfo({ username: '', email: '' });
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
    },
  },
});

// Need to be used outside the setup
export function useUser() {
  return useUserStore(store);
}
