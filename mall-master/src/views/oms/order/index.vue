<template> 
  <div class="app-container">
    
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
    </el-card>
    <div class="table-container">
      <el-table ref="orderTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <!-- <el-table-column type="selection" width="60" align="center"></el-table-column> -->
        <el-table-column label="编号" width="80" align="center">
          <template #default="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="收货地址" width="180" align="center">
          <template #default="scope">{{scope.row.address}}</template>
        </el-table-column>
        <el-table-column label="联系电话" width="180" align="center">
          <template #default="scope">{{scope.row.mobile}}</template>
        </el-table-column>
        <el-table-column label="联系人" align="center">
          <template #default="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="订单金额" width="120" align="center">
          <template #default="scope">￥{{scope.row.total}}</template>
        </el-table-column>
        <el-table-column label="支付方式" width="120" align="center">
          <template #default="scope">{{formatPayType(scope.row.post)}}</template>
        </el-table-column>
        <!-- <el-table-column label="订单来源" width="120" align="center">
          <template slot-scope="scope">{{scope.row.sourceType | formatSourceType}}</template>
        </el-table-column> -->
        <el-table-column label="订单状态" width="120" align="center">
          <template #default="scope">{{formatStatus(scope.row.status)}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button
              size="mini"
              @click="handleViewOrder(scope.$index, scope.row)"
            >查看订单</el-button>
            <!-- <el-button
              size="mini"
              @click="handleCloseOrder(scope.$index, scope.row)"
              v-show="scope.row.status===0">关闭订单</el-button>
            <el-button
              size="mini"
              @click="handleDeliveryOrder(scope.$index, scope.row)"
              v-show="scope.row.status===1">订单发货</el-button>
            <el-button
              size="mini"
              @click="handleViewLogistics(scope.$index, scope.row)"
              v-show="scope.row.status===2||scope.row.status===3">订单跟踪</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDeleteOrder(scope.$index, scope.row)"
              v-show="scope.row.status===4">删除订单</el-button> -->
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
        v-model:current-page="pageNum"
        :page-size="listQuery.pnum"
        :page-sizes="[5,10,15]"
        :total="total">
      </el-pagination>
    </div>
    <el-dialog
      title="关闭订单"
      v-model="closeOrder.dialogVisible" width="30%">
      <span style="vertical-align: top">操作备注：</span>
      <el-input
        style="width: 80%"
        type="textarea"
        :rows="5"
        placeholder="请输入内容"
        v-model="closeOrder.content">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeOrder.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCloseOrderConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <logistics-dialog v-model="logisticsDialogVisible"></logistics-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrder } from '@/apis/goods'
import LogisticsDialog from '@/views/oms/order/components/logisticsDialog'

const router = useRouter()

const defaultListQuery = {
  pn: 1,
  pnum: 10,
  orderSn: null,
  receiverKeyword: null,
  status: null,
  orderType: null,
  sourceType: null,
  createTime: null
}

const listQuery = reactive({ ...defaultListQuery })
const listLoading = ref(true)
const list = ref([])
const total = ref(0)
const operateType = ref(null)
const pageNum = ref(1)
const multipleSelection = ref([])
const closeOrder = reactive({
  dialogVisible: false,
  content: null,
  orderIds: []
})
const operateOptions = [
  { label: '批量发货', value: 1 },
  { label: '关闭订单', value: 2 },
  { label: '删除订单', value: 3 }
]
const logisticsDialogVisible = ref(false)

const formatPayType = (value) => {
  if (value === 1) return '支付宝'
  if (value === 2) return '微信'
  return '未支付'
}

const formatStatus = (value) => {
  if (value === 1) return '待发货'
  if (value === 2) return '已发货'
  if (value === 3) return '已完成'
  if (value === 4) return '已关闭'
  if (value === 5) return '无效订单'
  return '待付款'
}

const handleResetSearch = () => {
  Object.assign(listQuery, defaultListQuery)
  getList()
}

const handleSearchList = () => {
  listQuery.pn = 1
  getList()
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const handleViewOrder = (index, row) => {
  router.push({ path: '/oms/orderDetail', query: { id: row.id } })
}

const handleCloseOrder = (index, row) => {
  closeOrder.dialogVisible = true
  closeOrder.orderIds = [row.id]
}

const handleDeliveryOrder = (index, row) => {
  const listItem = covertOrder(row)
  router.push({ path: '/oms/deliverOrderList', query: { list: [listItem] } })
}

const handleViewLogistics = () => {
  logisticsDialogVisible.value = true
}

const handleDeleteOrder = (index, row) => {
  deleteOrderAction([row.id])
}

const handleBatchOperate = () => {
  if (!multipleSelection.value || multipleSelection.value.length < 1) {
    ElMessage({
      message: '请选择要操作的订单',
      type: 'warning',
      duration: 1000
    })
    return
  }
  if (operateType.value === 1) {
    const listItems = multipleSelection.value.filter(item => item.status === 1).map(item => covertOrder(item))
    if (!listItems.length) {
      ElMessage({
        message: '选中订单中没有可以发货的订单',
        type: 'warning',
        duration: 1000
      })
      return
    }
    router.push({ path: '/oms/deliverOrderList', query: { list: listItems } })
  } else if (operateType.value === 2) {
    closeOrder.orderIds = multipleSelection.value.map(item => item.id)
    closeOrder.dialogVisible = true
  } else if (operateType.value === 3) {
    const ids = multipleSelection.value.map(item => item.id)
    deleteOrderAction(ids)
  }
}

const handleSizeChange = (val) => {
  listQuery.pn = 1
  listQuery.pnum = val
  getList()
}

const handleCurrentChange = (val) => {
  listQuery.pn = val
  getList()
}

const handleCloseOrderConfirm = () => {
  if (!closeOrder.content) {
    ElMessage({
      message: '操作备注不能为空',
      type: 'warning',
      duration: 1000
    })
    return
  }
  ElMessage.error('该功能暂未上线，后端待补充接口')
  closeOrder.dialogVisible = false
  closeOrder.orderIds = []
}

const getList = () => {
  listLoading.value = true
  getOrder(listQuery).then(response => {
    listLoading.value = false
    list.value = response.data
    total.value = response.total
    pageNum.value = listQuery.pn
  })
}

const deleteOrderAction = (ids) => {
  ElMessageBox.confirm('是否要进行该删除操作?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.error('该功能暂未上线，后端待补充接口')
  })
}

const covertOrder = (order) => {
  const address = `${order.receiverProvince || ''}${order.receiverCity || ''}${order.receiverRegion || ''}${order.receiverDetailAddress || ''}`
  return {
    orderId: order.id,
    orderSn: order.orderSn,
    receiverName: order.receiverName,
    receiverPhone: order.receiverPhone,
    receiverPostCode: order.receiverPostCode,
    address: address,
    deliveryCompany: null,
    deliverySn: null
  }
}

onMounted(() => {
  getList()
})
</script>
<style scoped>
  .input-width {
    width: 203px;
  }
</style>


