import { defineStore } from 'pinia'
import router from '../router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 用户状态管理 - 简化版，无角色权限控制
export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || {},
    // 用户token
    token: localStorage.getItem('token') || ''
  }),
  
  getters: {
    // 是否已登录
    isLogin: (state) => {
      return !!state.token
    },
    // 获取用户信息
    getUserInfo: (state) => {
      return state.userInfo
    }
  },
  
  actions: {
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    
    // 设置token
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    
    // 登录 - 简化版，无角色权限控制
    async login(loginForm) {
      try {
        // 实际项目中应该调用后端API
        // const { data } = await axios.post('/api/auth/login', loginForm)
        
        // 模拟登录成功
        const data = {
          token: 'admin-token-' + Date.now(),
          userInfo: {
            id: 1,
            username: loginForm.username,
            name: '管理员',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          }
        }
        
        this.setToken(data.token)
        this.setUserInfo(data.userInfo)
        
        ElMessage.success('登录成功')
        router.push('/')
        
        return data
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败，请检查用户名和密码')
        return Promise.reject(error)
      }
    },
    
    // 退出登录 - 简化版
    logout() {
      // 清除token和用户信息
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      // 跳转到登录页
      router.push('/login')
    },
    
    // 获取用户信息 - 简化版
    async getUserInfoFromServer() {
      try {
        // 实际项目中应该调用后端API
        // const { data } = await axios.get('/api/user/info')
        
        // 模拟获取用户信息
        const data = {
          id: 1,
          username: 'admin',
          name: '管理员',
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        }
        
        this.setUserInfo(data)
        
        return data
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return Promise.reject(error)
      }
    }
  }
})

// 导入菜单store，解决循环引用问题
import { useMenuStore } from './menu'