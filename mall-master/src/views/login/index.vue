<template>
  <div>
    <el-card class="login-form-layout">
      <el-form
        auto-complete="on"
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-position="left"
      >
        <div style="text-align: center">
          <svg-icon icon-class="login-mall" style="width: 56px;height: 56px;color: #409EFF"></svg-icon>
        </div>
        <h2 class="login-title color-main">慕学生鲜-后台管理系统</h2>
        <el-form-item prop="mobile">
          <el-input
            name="mobile"
            type="text"
            v-model="loginForm.mobile"
            auto-complete="on"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <svg-icon icon-class="user" class="color-main"></svg-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            name="password"
            :type="pwdType"
            v-model="loginForm.password"
            auto-complete="on"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <svg-icon icon-class="password" class="color-main"></svg-icon>
            </template>
            <template #suffix>
              <span @click="showPwd" style="cursor: pointer">
                <svg-icon icon-class="eye" class="color-main"></svg-icon>
              </span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 60px;text-align: center">
          <el-input
            name="answer"
            type="text"
            v-model="loginForm.answer"
            auto-complete="on"
            placeholder="请输入验证码"
            @keyup.enter="handleLogin"
          >
            <template #suffix>
              <img
                :src="captcha.captcha_base64"
                alt=""
                v-if="captcha.captcha_base64"
                @click="changeCaptcha"
                class="captcha-img"
                style="cursor: pointer"
              >
              <span v-else @click="changeCaptcha" style="cursor: pointer">换一张</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 60px;text-align: center">
          <el-button style="width: 100%" type="primary" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <img :src="login_center_bg" class="login-center-layout">
    <el-dialog
      title="公众号二维码"
      v-model="dialogVisible"
      :show-close="false"
      :center="true"
      width="30%"
    >
      <div style="text-align: center">
        <span class="font-title-large">
          <span class="color-main font-extra-large">关注公众号</span>回复<span class="color-main font-extra-large">体验</span>获取体验账号
        </span>
        <br>
        <img src="" width="160" height="160" style="margin-top: 10px">
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCaptcha } from '@/apis/goods'
import { getCookie } from '@/utils/support'
import { setToken } from '@/utils/auth'
import Cookies from 'js-cookie'
import login_center_bg from '@/assets/images/login_center_bg.png'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)

const loginForm = reactive({
  mobile: getCookie("mobile") || 'admin',
  password: getCookie("password") || '',
  answer: '',
  captcha_id: ''
})

const loginRules = {
  mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, message: '密码不能小于3位', trigger: 'blur' }
  ],
  answer: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const loading = ref(false)
const pwdType = ref('password')
const dialogVisible = ref(false)
const captcha = ref({})

const showPwd = () => {
  pwdType.value = pwdType.value === 'password' ? '' : 'password'
}

const getCaptchas = async () => {
  try {
    const res = await getCaptcha()
    captcha.value = res
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

const changeCaptcha = () => {
  getCaptchas()
}

const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      loginForm.captcha_id = captcha.value.captcha_id
      console.log('开始登录，表单数据：', loginForm)
      try {
        const result = await userStore.login(loginForm)
        console.log('登录成功，返回结果：', result)

        // 登录成功后立即获取用户信息，确保路由守卫能正常工作
        await userStore.getInfo()
        console.log('用户信息获取成功')

        loading.value = false
        router.push({ path: '/' })
      } catch (error) {
        console.error('登录失败：', error)
        loading.value = false
        getCaptchas() // 登录失败刷新验证码
      }
    } else {
      console.log('表单验证失败')
    }
  })
}

onMounted(() => {
  getCaptchas()
})
</script>

<style scoped>
.login-form-layout {
  position: absolute;
  left: 0;
  right: 0;
  width: 360px;
  margin: 140px auto;
  border-top: 10px solid #409EFF;
}

.login-title {
  text-align: center;
}

.login-center-layout {
  background: #409EFF;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  margin-top: 200px;
}

.captcha-img {
  width: 110px;
}

:deep(.el-form-item__content) {
  display: flex;
}
</style>
