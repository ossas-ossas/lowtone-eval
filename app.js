// app.js
App({
// app.js
App({
  globalData: {
    userInfo: null,
    openId: null,
    userRole: 'parent', // parent | staff
    orgId: null,
    apiBaseUrl: 'https://express-494j-194862-5-1383882885.sh.run.tcloudbase.com', // 云托管API地址
    useCloudHosting: true // 是否使用云托管
  },

  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-cloud-env-id', // 替换为你的云开发环境ID
        traceUser: true,
      })
    }

    // 检查登录状态
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const openId = wx.getStorageSync('openId')
    if (openId) {
      this.globalData.openId = openId
      this.getUserRole()
    }
  },

  // 获取用户角色
  async getUserRole() {
    try {
      const db = wx.cloud.database()
      const result = await db.collection('users').where({
        openId: this.globalData.openId
      }).get()

      if (result.data.length > 0) {
        this.globalData.userRole = result.data[0].role
        this.globalData.orgId = result.data[0].orgId
      }
    } catch (error) {
      console.error('获取用户角色失败:', error)
    }
  },

  // 微信登录
  async wxLogin() {
    try {
      const loginResult = await wx.login()
      const { code } = loginResult

      // 调用云函数获取openId
      const result = await wx.cloud.callFunction({
        name: 'getOpenId',
        data: { code }
      })

      const { openId } = result.result
      this.globalData.openId = openId
      wx.setStorageSync('openId', openId)

      // 获取用户信息
      const userInfoResult = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      this.globalData.userInfo = userInfoResult.userInfo

      // 保存用户信息到数据库
      await this.saveUserInfo(userInfoResult.userInfo)

      return openId
    } catch (error) {
      console.error('登录失败:', error)
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      })
    }
  },

  // 保存用户信息
  async saveUserInfo(userInfo) {
    try {
      if (this.globalData.useCloudHosting) {
        // 使用云托管API
        const response = await wx.request({
          url: `${this.globalData.apiBaseUrl}/api/users`,
          method: 'POST',
          data: {
            openId: this.globalData.openId,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            role: 'parent',
            createdAt: new Date().toISOString()
          }
        })
        
        if (!response.data.success) {
          throw new Error(response.data.message)
        }
      } else {
        // 使用云开发
        const db = wx.cloud.database()
        await db.collection('users').add({
          data: {
            openId: this.globalData.openId,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            role: 'parent', // 默认为家长
            createdAt: new Date()
          }
        })
      }
    } catch (error) {
      console.error('保存用户信息失败:', error)
    }
  },

  // 云托管API调用方法
  async apiRequest(options) {
    const { url, method = 'GET', data = null, headers = {} } = options
    
    try {
      const response = await wx.request({
        url: `${this.globalData.apiBaseUrl}${url}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...headers
        }
      })
      
      return response.data
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
    }
  }
})
