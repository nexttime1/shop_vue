<template> 
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div style="margin-bottom:25px">
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          @click="handleSearchList()"
          type="primary"
          size="small">
          查询结果
        </el-button>
        <el-button
          style="float: right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="goodsParams" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input style="width: 203px" v-model="goodsParams.q" placeholder="商品名称"></el-input>
          </el-form-item>
          <el-form-item label="商品分类：">
            <el-cascader
              clearable
              v-model="goodsParams.c"
              @change="getBrand"
              :props="{value:'id',label:'name',children:'sub_category'}"
              :options="productCateOptions">
            </el-cascader>
          </el-form-item>
          <el-form-item label="商品品牌：">
            <el-select v-model="goodsParams.b" placeholder="请选择品牌" clearable>
              <el-option
                v-for="item in brandOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button
        class="btn-add"
        @click="handleAddProduct()"
        size="mini">
        添加
      </el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="productTable"
                :data="list"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                v-loading="listLoading"
                border>
        <!-- <el-table-column type="selection" align="center"></el-table-column> -->
        <el-table-column label="编号" align="center" width="80">
          <template #default="scope">{{scope.$index+1}}</template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template #default="scope">
            <p>{{scope.row.name}}</p>
          </template>
        </el-table-column>
        <el-table-column label="商品品牌" align="center">
          <template #default="scope">
            <p>{{scope.row.brand.name}}</p>
          </template>
        </el-table-column>
        <el-table-column label="商品分类" align="center">
          <template #default="scope">
            <p>{{scope.row.category.name}}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="120" align="center">
          <template #default="scope">
            <p>价格：￥{{scope.row.shop_price}}</p>
            <!-- <p>货号：{{scope.row.goods_brief}}</p> -->
          </template>
        </el-table-column>
        <el-table-column label="标签" align="center">
          <template #default="scope">
            <p>上架：
              <el-switch
                @change="handlePublishStatusChange(scope.row)"
                :active-value="true"
                :inactive-value="false"
                v-model="scope.row.on_sale">
              </el-switch>
            </p>
            <p>新品：
              <el-switch
                @change="handlePublishStatusChange(scope.row)"
                :active-value="true"
                :inactive-value="false"
                v-model="scope.row.is_new">
              </el-switch>
            </p>
            <p>推荐：
              <el-switch
                @change="handlePublishStatusChange(scope.row)"
                :active-value="true"
                :inactive-value="false"
                v-model="scope.row.is_hot">
              </el-switch>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <p>
              <el-button
                size="small"
                @click="handleShowProduct(scope.$index, scope.row)">查看详情
              </el-button>
            </p>
            <p>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)">删除
              </el-button>
            </p>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :page-size="goodsParams.pnum"
        v-model:current-page="goodsParams.pn"
        :total="total">
        <!-- :page-sizes="[5,10,15]" -->
      </el-pagination>
    </div>

  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getGoods, deleteGoods, getBrands, getCategorys, putGoodsStatus, getBrandsByCate } from '@/apis/goods'

const router = useRouter()

const defaultListQuery = {
  keyword: null,
  pageNum: 1,
  pageSize: 5,
  publishStatus: null,
  verifyStatus: null,
  productSn: null,
  productCategoryId: null,
  brandId: null
}

const goodsParams = reactive({
  pn: 1,
  pnum: 20,
  q: '',
  c: '',
  b: ''
})

const operates = [
  { label: '商品上架', value: 'publishOn' },
  { label: '新品', value: 'publishOn' },
  { label: '推荐', value: 'publishOn' },
  { label: '删除', value: 'delete' }
]

const listQuery = reactive({ ...defaultListQuery })
const list = ref([])
const total = ref(0)
const listLoading = ref(true)
const selectProductCateValue = ref(null)
const multipleSelection = ref([])
const productCateOptions = ref([])
const brandOptions = ref([])

const getBrand = (id) => {
  goodsParams.c = id[2]
  getBrandsByCate(id[2]).then(res => {
    brandOptions.value = res
  })
}

const getList = () => {
  listLoading.value = true
  getGoods(goodsParams).then(response => {
    listLoading.value = false
    list.value = response.data
    total.value = response.total
  })
}

const getBrandList = () => {
  getBrands().then(response => {
    brandOptions.value = response
  })
}

const getProductCateList = () => {
  getCategorys().then(response => {
    productCateOptions.value = response
  })
}

const handleSearchList = () => {
  goodsParams.pn = 1
  getList()
}

const handleAddProduct = () => {
  router.push({ path: '/addProduct' })
}

const handleBatchOperate = () => {
  if (!multipleSelection.value || multipleSelection.value.length < 1) {
    ElMessage({
      message: '请选择要操作的商品',
      type: 'warning',
      duration: 1000
    })
    return
  }
  ElMessageBox.confirm('是否要进行该批量操作?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = multipleSelection.value.map(item => item.id)
    // 目前批量接口未对接后端，保留占位
    updateDeleteStatus(1, ids)
    getList()
  })
}

const handleSizeChange = (val) => {
  goodsParams.pn = 1
  goodsParams.pnum = val
  getList()
}

const handleCurrentChange = (val) => {
  goodsParams.pn = val
  getList()
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const handlePublishStatusChange = (row) => {
  updatePublishStatus(row)
}

const handleResetSearch = () => {
  selectProductCateValue.value = []
  Object.assign(listQuery, defaultListQuery)
  goodsParams.q = ''
  goodsParams.c = ''
  goodsParams.b = ''
  getList()
}

const handleDelete = (index, row) => {
  ElMessageBox.confirm('是否要进行删除商品?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteGoods(row.id).then(() => {
      ElMessage({
        message: '删除成功',
        type: 'success',
        duration: 1000
      })
      list.value.splice(index, 1)
    })
  })
}

const handleUpdateProduct = (index, row) => {
  router.push({ path: '/updateProduct', query: { id: row.id } })
}

const handleShowProduct = (index, row) => {
  router.push({ path: '/updateProduct', query: { id: row.id } })
}

const updatePublishStatus = (row) => {
  const params = {
    on_sale: row.on_sale,
    is_hot: row.is_hot,
    is_new: row.is_new
  }
  putGoodsStatus(row.id, params).then(() => {
    ElMessage({
      message: '修改成功',
      type: 'success',
      duration: 1000
    })
  }).catch(err => {
    ElMessage({
      message: err?.msg || '修改失败',
      type: 'error',
      duration: 1000
    })
  })
}

const updateNewStatus = (newStatus, ids) => {
  console.warn('批量新品状态待后端补充接口', newStatus, ids)
}

const updateRecommendStatus = (recommendStatus, ids) => {
  console.warn('批量推荐状态待后端补充接口', recommendStatus, ids)
}

const updateDeleteStatus = (deleteStatus, ids) => {
  console.warn('批量删除待后端补充接口', deleteStatus, ids)
}

onMounted(() => {
  getList()
  getBrandList()
  getProductCateList()
})
</script>
<style></style>


