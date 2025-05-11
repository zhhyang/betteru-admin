import { defineStore } from 'pinia'
import router from '../router'

// 菜单和权限管理
export const useMenuStore = defineStore('menu', {
  state: () => ({
    // 菜单列表
    menuList: [],
    // 权限列表
    permissionList: [],
    // 是否已加载菜单
    menuLoaded: false
  }),
  
  getters: {
    // 获取有权限的菜单
    getMenuList: (state) => {
      return state.menuList
    },
    // 判断是否有某个权限
    hasPermission: (state) => (permission) => {
      return state.permissionList.includes(permission)
    }
  },
  
  actions: {
    // 设置菜单
    setMenuList(menuList) {
      this.menuList = menuList
      this.menuLoaded = true
    },
    
    // 设置权限
    setPermissionList(permissionList) {
      this.permissionList = permissionList
    },
    
    // 从后端获取菜单和权限
    async getMenuAndPermissions() {
      try {
        // 实际项目中应该从后端API获取
        // const { data } = await axios.get('/api/menu/list')
        
        // 模拟后端返回的菜单数据
        const menuData = [
          {
            path: '/dashboard',
            name: 'Dashboard',
            meta: { title: '首页', icon: 'HomeFilled' }
          },
          {
            path: '/user',
            name: 'User',
            meta: { title: '用户管理', icon: 'User' }
          },
          {
            path: '/survey',
            name: 'Survey',
            meta: { title: '问卷管理', icon: 'Document' }
          },
          {
            path: '/survey-category',
            name: 'SurveyCategory',
            meta: { title: '问卷分类', icon: 'Folder' }
          }
        ]
        
        // 模拟后端返回的权限数据
        const permissionData = [
          'user:view',
          'user:add',
          'user:edit',
          'user:delete',
          'survey:view',
          'survey:add',
          'survey:edit',
          'survey:delete',
          'survey-category:view',
          'survey-category:add',
          'survey-category:edit',
          'survey-category:delete'
        ]
        
        this.setMenuList(menuData)
        this.setPermissionList(permissionData)
        
        return { menuData, permissionData }
      } catch (error) {
        console.error('获取菜单和权限失败:', error)
        return { menuData: [], permissionData: [] }
      }
    },
    
    // 重置状态
    resetState() {
      this.menuList = []
      this.permissionList = []
      this.menuLoaded = false
    }
  }
})