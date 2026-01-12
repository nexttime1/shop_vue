<template> 
  <el-card class="form-container" shadow="never">
    <el-form :model="brand" :rules="rules" ref="brandFrom" label-width="150px">
      <el-form-item label="品牌名称：" prop="name">
        <el-input v-model="brand.name"></el-input>
      </el-form-item>
      <!-- <el-form-item label="品牌首字母：">
        <el-input v-model="brand.letter"></el-input>
      </el-form-item> -->
      <el-form-item label="品牌LOGO：" prop="logo">
        <single-upload v-model="brand.logo"></single-upload>
      </el-form-item>
      <!-- <el-form-item label="品牌专区大图：">
        <single-upload v-model="brand.bigPic"></single-upload>
      </el-form-item>
      <el-form-item label="品牌故事：">
        <el-input
          placeholder="请输入内容"
          type="textarea"
          v-model="brand.brandStory"
          :autosize="true"></el-input>
      </el-form-item> -->
      <!-- <el-form-item label="排序：" prop="sort">
        <el-input v-model.number="brand.sort"></el-input>
      </el-form-item> -->
      <!-- <el-form-item label="是否显示：">
        <el-radio-group v-model="brand.showStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="品牌制造商：">
        <el-radio-group v-model="brand.factoryStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="onSubmit('brandFrom')">提交</el-button>
        <el-button v-if="!isEdit" @click="resetForm('brandFrom')">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createBrand, putBrands, getBrand } from '@/apis/goods'
import SingleUpload from '@/components/Upload/singleUpload'

const defaultBrand = {
  letter: '',
  logo: '',
  name: '',
  sort: 0
}

const route = useRoute()
const router = useRouter()

const brandFrom = ref(null)
const brand = reactive({ ...defaultBrand })
const isEdit = ref(false)
const rules = {
  name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
  logo: [{ required: true, message: '请输入品牌logo', trigger: 'blur' }]
}

const loadDetail = () => {
  const id = route.query.id
  if (!id) {
    Object.assign(brand, { ...defaultBrand })
    return
  }
  isEdit.value = true
  getBrand(id).then(response => {
    Object.assign(brand, response || {})
  }).catch(() => {
    // 待后端补接口：品牌详情
    ElMessage.error('该功能暂未上线，后端待补充接口')
  })
}

const onSubmit = () => {
  if (!brandFrom.value) return
  brandFrom.value.validate((valid) => {
    if (!valid) {
      ElMessage({
        message: '验证失败',
        type: 'error',
        duration: 1000
      })
      return
    }
    ElMessageBox.confirm('是否提交数据', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      if (isEdit.value) {
        putBrands(route.query.id, brand).then(() => {
          brandFrom.value.resetFields()
          ElMessage({
            message: '修改成功',
            type: 'success',
            duration: 1000
          })
          router.back()
        })
      } else {
        createBrand(brand).then(() => {
          ElMessage({
            message: '提交成功',
            type: 'success',
            duration: 1000
          })
          router.push('/brand')
        })
      }
    })
  })
}

const resetForm = () => {
  if (brandFrom.value) {
    brandFrom.value.resetFields()
  }
  Object.assign(brand, { ...defaultBrand })
}

onMounted(() => {
  loadDetail()
})
</script>
<style>
</style>


