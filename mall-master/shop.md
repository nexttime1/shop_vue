

首先我先给你我后端封装的返回：

```GO
package res

import (
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"user_web/global"
	"user_web/utils/validate"
)

type BaseResponse struct {
	Code Code   `json:"code"`
	Data any    `json:"data"`
	Msg  string `json:"msg"`
}

type DataListResponse struct {
	List  any   `json:"list"`
	Count int32 `json:"count"`
}
type Code int

const (
	SuccessCode      Code = 0    //成功
	FailLoginCode    Code = 1001 //登录错误
	FailServiceCode  Code = 1002 //服务异常
	FailArgumentCode Code = 1003
	NotFoundCode     Code = 1004
)

var empty = map[string]interface{}{}

func RPCErrorToHttp(err error) (Code, string) {
	if e, ok := status.FromError(err); ok {
		switch e.Code() {
		case codes.NotFound:
			return NotFoundCode, e.Message()
		case codes.InvalidArgument:
			return FailArgumentCode, e.Message()
		case codes.AlreadyExists:
			return FailArgumentCode, e.Message()
		case codes.Internal:
			return FailServiceCode, e.Message()
		case codes.Unavailable:
			return FailServiceCode, "服务不可用"
		default:
			return FailServiceCode, e.Message()
		}
	}
	return FailServiceCode, err.Error()
}

func Response(c *gin.Context, code Code, data interface{}, msg string) {
	c.JSON(200, BaseResponse{
		Code: code,
		Data: data,
		Msg:  msg,
	})
}

func OK(c *gin.Context, code Code, data interface{}, msg string) {
	Response(c, code, data, msg)
}

func OkWithMessage(c *gin.Context, msg string) {
	Response(c, SuccessCode, empty, msg)
}

func OkWithData(c *gin.Context, data interface{}) {
	Response(c, SuccessCode, data, "成功")
}

func OkWithList(c *gin.Context, list interface{}, count int32) {
	Response(c, SuccessCode, DataListResponse{
		List:  list,
		Count: count,
	}, "成功")

}

func Fail(c *gin.Context, code Code, data interface{}, msg string) {
	global.LevelFlag = true
	Response(c, code, data, msg)
}

func FailWithServiceMsg(c *gin.Context, err error) { //错误填在err里面
	code, msg := RPCErrorToHttp(err)
	global.LevelFlag = true
	Response(c, code, empty, msg)
}

func FailWithMsg(c *gin.Context, code Code, msg string) {
	global.LevelFlag = true
	Response(c, code, empty, msg)
}

func FailWithData(c *gin.Context, data interface{}) {
	global.LevelFlag = true
	Response(c, FailServiceCode, data, "失败")
}
func FailWithErr(c *gin.Context, code Code, err error) {
	data, _ := validate.ValidateErr(err)
	Fail(c, code, data, "失败")
}

```

**你根据这个 去修改前端会好点**

> v1.0.0

Base URLs:

* <a href="http://192.168.163.1:8080/">开发环境: http://192.168.163.1:8080/</a>

# 用户服务/验证码

## POST 验证码发送 阿里云用于注册

POST /u/v1/base/send_sms

> **请求参数  (因为我后端用go写的，所以我直接给你接收的 ShouldBindJson) 后面的我接收和返回都给你结构体 这样你家可以修改前端了**

```go
type SendSmsRequest struct {
	Mobile string `json:"mobile" binding:"required,mobile"`
	Role   string `json:"role" binding:"required,oneof=1 2 3"`  // 1 代表 管理员 2代表普通用户 3代表游客
}
```

### 返回结果

```
错误： res.FailWithErr(c, res.FailServiceCode, err)
成功： res.OkWithMessage(c, "发送成功")
```

## GET 图形验证码发送

GET /u/v1/base/captcha

### 请求参数

```go
无
```

### 返回结果

```go
type CaptchaResponse struct {
	CaptchaId     string `json:"captcha_id"`
	CaptchaBase64 string `json:"captcha_base64"`
}

失败： res.FailWithMsg(c, res.FailServiceCode, "生成验证码错误")
成功： res.OkWithData(c, CaptchaResponse{
		CaptchaId:     captchaId,
		CaptchaBase64: base64s,
	})
```



# 用户服务/用户接口

## POST 用户登录

POST /u/v1/user/login

### 请求参数（ShouldBindJson）

```go
type UserLoginRequest struct {
	Mobile    string `json:"mobile" binding:"required,mobile" ` 
	Password  string `json:"password" binding:"required"`
	CaptchaId string `json:"captcha_id" binding:"required"` //验证码的id
	Answer    string `json:"answer" binding:"required"`  //验证码的答案
}
```

### 返回结果

```go
失败： res.FailWithMsg(c, res.FailArgumentCode, "验证码错误")
成功： res.OkWithData(c, token)
```



## POST 用户注册

POST /u/v1/user/register

（逻辑要搞清楚，一定是先阿里云发验证码，那边通过了，再次请求这个，Code就是阿里云给发的验证码）

### 请求参数（ShouldBindJson）

```go
type UserRegisterRequest struct {
	Mobile   string `json:"mobile" binding:"required,mobile" `
	Password string `json:"password" binding:"required"`
	Code     string `json:"code" binding:"required"`
	Role     int32  `json:"role" binding:"required"`
}
```

### 返回结果

```go
失败： res.FailWithMsg(c, res.FailArgumentCode, "验证码错误")
成功（创建过就相当于改密码了）：res.OkWithMessage(c, "您已经注册，密码更新成功")
成功： res.OkWithMessage(c, "创建成功")
```



## PUT 用户修改

POST /u/v1/user/update

### 请求参数（ShouldBindJson）

```
type UserUpdateRequest struct {
	Id       int32  `json:"id,omitempty"`
	Password string `json:"password,omitempty"`
	NickName string `json:"nick_name,omitempty"`
	BirthDay uint64 `json:"birth_day,omitempty"`
	Gender   string `json:"gender,omitempty"`
	Role     int32  `json:"role,omitempty"`
}
```

### 返回结果

```go
失败： res.FailWithMsg(c, res.FailArgumentCode, "权限不够")
成功： res.OkWithMessage(c, "更新成功")
```

## POST 用户列表（admin才行）

GET /u/v1/user/list

### 请求参数

```go
无
```

### 返回结果

```go
type UserListResponse struct {
	Id       int32  `json:"id"`
	Password string `json:"password"`
	Mobile   string `json:"mobile"`
	NickName string `json:"nick_name"`
	BirthDay string `json:"birth_day"`
	Gender   string `json:"gender"`
	Role     int    `json:"role"`
}

var response []user_service.UserListResponse
成功： res.OkWithList(c, response, userListResponse.Total)
```



# 商品服务/商品接口

Base URLs:

* <a href="http://192.168.163.1:8081/">开发环境: http://192.168.163.1:8081/</a>

## GET 商品列表

GET /g/v1/good/list    

### 请求参数（Query）

```
type PageInfo struct {
	Limit int32  `form:"limit"`
	Page  int32  `form:"page"`
	Key   string `form:"key"`
	Sort  string `form:"sort"` //前端可以覆盖 如果想有顺序可以 不想可以不加
}

type GoodListRequest struct {
    common.PageInfo
    IsHot         bool  `form:"is_hot"`
    IsNew         bool  `form:"is_new"`
    PriceMax      int32 `form:"price_max"`
    PriceMin      int32 `form:"price_min"`
    BrandID       int32 `form:"brand_id"`
    TopCategoryID int32 `form:"top_category_id"`
}
```

### 返回结果

```go
type GoodsInfoResponse struct {
	ID              int32                     `json:"id"`                  // 商品ID
	CategoryID      int32                     `json:"category_id"`         // 分类ID
	Name            string                    `json:"name"`                // 商品名称
	GoodsSn         string                    `json:"goods_sn"`            // 商品编号
	ClickNum        int32                     `json:"click_num"`           // 点击数
	SoldNum         int32                     `json:"sold_num"`            // 销量
	FavNum          int32                     `json:"fav_num"`             // 收藏数
	Stocks          int32                     `json:"stocks"`              // 库存
	MarketPrice     float32                   `json:"market_price"`        // 市场价
	ShopPrice       float32                   `json:"shop_price"`          // 店铺价
	GoodsBrief      string                    `json:"goods_brief"`         // 商品简介
	GoodsDesc       string                    `json:"goods_desc"`          // 商品详情
	ShipFree        *bool                     `json:"ship_free,omitempty"` // 是否包邮（optional，指针表示可选）
	Images          []string                  `json:"images"`              // 商品图片（repeated）
	DescImages      []string                  `json:"desc_images"`         // 详情图片（repeated）
	GoodsFrontImage string                    `json:"goods_front_image"`   // 商品封面图
	IsNew           *bool                     `json:"is_new,omitempty"`    // 是否新品（optional）
	IsHot           *bool                     `json:"is_hot,omitempty"`    // 是否热门（optional）
	OnSale          *bool                     `json:"on_sale,omitempty"`   // 是否上架（optional）
	AddTime         int64                     `json:"add_time"`            // 添加时间
	Category        CategoryBriefInfoResponse `json:"category"`            // 分类信息
	Brand           BrandInfoResponse         `json:"brand"`               // 品牌信息
}

var response []good_srv.GoodsInfoResponse

成功： res.OkWithList(c, response, list.Total)
```



## POST 创建商品 (商品的图片是先oss上传图片返回url之后的)

### 请求参数（ShouldBindJson）

```
type GoodCreateRequest struct {
	Name        string   `form:"name" json:"name" binding:"required,min=2,max=100"`
	GoodsSn     string   `form:"goods_sn" json:"goods_sn" binding:"required,min=2,lt=20"`
	Stocks      int32    `form:"stocks" json:"stocks" binding:"required,min=1"`
	CategoryId  int32    `form:"category" json:"category" binding:"required"`
	MarketPrice float32  `form:"market_price" json:"market_price" binding:"required"`
	ShopPrice   float32  `form:"shop_price" json:"shop_price" binding:"required,min=0"`
	GoodsBrief  string   `form:"goods_brief" json:"goods_brief" binding:"required,min=3"`
	Images      []string `form:"images" json:"images" binding:"required,min=1"`
	DescImages  []string `form:"desc_images" json:"desc_images" binding:"required"`
	ShipFree    *bool    `form:"ship_free" json:"ship_free" binding:"required"`
	FrontImage  string   `form:"front_image" json:"front_image" binding:"required,url"`
	Brand       int32    `form:"brand" json:"brand" binding:"required"`
}
```

### 返回结果

```go
失败： res.FailWithServiceMsg(c, err)

成功：	res.OkWithMessage(c, "创建成功")
```



## GET 商品详情

GET /g/v1/good/:id

### 请求参数（uri）

```
type GoodDetailRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
type GoodsInfoResponse struct {
	ID              int32                     `json:"id"`                  // 商品ID
	CategoryID      int32                     `json:"category_id"`         // 分类ID
	Name            string                    `json:"name"`                // 商品名称
	GoodsSn         string                    `json:"goods_sn"`            // 商品编号
	ClickNum        int32                     `json:"click_num"`           // 点击数
	SoldNum         int32                     `json:"sold_num"`            // 销量
	FavNum          int32                     `json:"fav_num"`             // 收藏数
	Stocks          int32                     `json:"stocks"`              // 库存
	MarketPrice     float32                   `json:"market_price"`        // 市场价
	ShopPrice       float32                   `json:"shop_price"`          // 店铺价
	GoodsBrief      string                    `json:"goods_brief"`         // 商品简介
	GoodsDesc       string                    `json:"goods_desc"`          // 商品详情
	ShipFree        *bool                     `json:"ship_free,omitempty"` // 是否包邮（optional，指针表示可选）
	Images          []string                  `json:"images"`              // 商品图片（repeated）
	DescImages      []string                  `json:"desc_images"`         // 详情图片（repeated）
	GoodsFrontImage string                    `json:"goods_front_image"`   // 商品封面图
	IsNew           *bool                     `json:"is_new,omitempty"`    // 是否新品（optional）
	IsHot           *bool                     `json:"is_hot,omitempty"`    // 是否热门（optional）
	OnSale          *bool                     `json:"on_sale,omitempty"`   // 是否上架（optional）
	AddTime         int64                     `json:"add_time"`            // 添加时间
	Category        CategoryBriefInfoResponse `json:"category"`            // 分类信息
	Brand           BrandInfoResponse         `json:"brand"`               // 品牌信息
}
var response good_srv.GoodsInfoResponse
成功： res.OkWithData(c, response)
失败： res.FailWithServiceMsg(c, err)
```



## PUT 更新商品（除了那几个）

PUT /g/v1/good/:id

### 请求参数（uri 和 ShouldBindJSON）

```go
type GoodDetailRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
type GoodUpdateRequest struct {
	Name        string   `form:"name" json:"name" binding:"omitempty,min=2,max=100"`       // 有值时校验长度 2-100，
	GoodsSn     string   `form:"goods_sn" json:"goods_sn" binding:"omitempty,min=2,lt=20"` // 有值时校验长度 2-19，
	Stocks      int32    `form:"stocks" json:"stocks" binding:"omitempty,min=1"`           // 有值时校验 ≥1
	CategoryId  int32    `form:"category" json:"category"`
	MarketPrice float32  `form:"market_price" json:"market_price"`
	ShopPrice   float32  `form:"shop_price" json:"shop_price" binding:"omitempty,min=0"`
	GoodsBrief  string   `form:"goods_brief" json:"goods_brief" binding:"omitempty,min=3"`
	Images      []string `form:"images" json:"images" binding:"omitempty,min=1"`
	DescImages  []string `form:"desc_images" json:"desc_images"`
	ShipFree    *bool    `form:"ship_free" json:"ship_free"`
	FrontImage  string   `form:"front_image" json:"front_image"`
	Brand       int32    `form:"brand" json:"brand"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "更新成功")
失败： res.FailWithServiceMsg(c, err)
```

## PATCH 更新商品的部分

PATCH /g/v1/good/:id

### 请求参数（uri 和 ShouldBindJSON）

```go
type GoodDetailRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
type GoodPatchUpdateRequest struct {
	IsNew  *bool `form:"is_new" json:"is_new"`
	IsHot  *bool `form:"is_hot" json:"is_hot"`
	OnSale *bool `form:"on_sale" json:"on_sale"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "更新成功")
失败： res.FailWithServiceMsg(c, err)
```

## DELETE 删除商品

DELETE /g/v1/good/:id

### 请求参数（uri 和 ShouldBindJSON）

```go
type GoodDetailRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
type GoodPatchUpdateRequest struct {
	IsNew  *bool `form:"is_new" json:"is_new"`
	IsHot  *bool `form:"is_hot" json:"is_hot"`
	OnSale *bool `form:"on_sale" json:"on_sale"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "更新成功")
失败： res.FailWithServiceMsg(c, err)
```



# 商品服务/分类接口

## GET 全部分类列表

GET /g/v1/categorys

### 请求参数

```
无
```

### 返回结果

```
{
    "code": 0,
    "data": {
        "list": [
            {
                "id": 1,
                "is_tab": true,
                "level": 1,
                "name": "智能手机"
            },
            {
                "id": 2,
                "is_tab": true,
                "level": 1,
                "name": "笔记本电脑",
                "sub_category": [
                    {
                        "id": 6,
                        "level": 2,
                        "name": "游戏本",
                        "parent_category_id": 2,
                        "sub_category": [
                            {
                                "id": 9,
                                "level": 3,
                                "name": "高性能游戏本",
                                "parent_category_id": 6
                            },
                            {
                                "id": 10,
                                "level": 3,
                                "name": "轻薄游戏本",
                                "parent_category_id": 6
                            }
                        ]
                    }
                ]
            },
            {
                "id": 3,
                "level": 1,
                "name": "平板电脑"
            },
            {
                "id": 4,
                "is_tab": true,
                "level": 1,
                "name": "智能穿戴",
                "sub_category": [
                    {
                        "id": 7,
                        "level": 2,
                        "name": "智能手表",
                        "parent_category_id": 4,
                        "sub_category": [
                            {
                                "id": 11,
                                "level": 3,
                                "name": "成人智能手表",
                                "parent_category_id": 7
                            },
                            {
                                "id": 12,
                                "level": 3,
                                "name": "儿童智能手表",
                                "parent_category_id": 7
                            }
                        ]
                    }
                ]
            },
            {
                "id": 5,
                "level": 1,
                "name": "耳机音箱",
                "sub_category": [
                    {
                        "id": 8,
                        "level": 2,
                        "name": "无线耳机",
                        "parent_category_id": 5,
                        "sub_category": [
                            {
                                "id": 13,
                                "level": 3,
                                "name": "降噪无线耳机",
                                "parent_category_id": 8
                            },
                            {
                                "id": 14,
                                "level": 3,
                                "name": "运动无线耳机",
                                "parent_category_id": 8
                            }
                        ]
                    }
                ]
            },
            {
                "id": 6,
                "level": 2,
                "name": "游戏本",
                "parent_category_id": 2,
                "sub_category": [
                    {
                        "id": 9,
                        "level": 3,
                        "name": "高性能游戏本",
                        "parent_category_id": 6
                    },
                    {
                        "id": 10,
                        "level": 3,
                        "name": "轻薄游戏本",
                        "parent_category_id": 6
                    }
                ]
            },
            {
                "id": 7,
                "level": 2,
                "name": "智能手表",
                "parent_category_id": 4,
                "sub_category": [
                    {
                        "id": 11,
                        "level": 3,
                        "name": "成人智能手表",
                        "parent_category_id": 7
                    },
                    {
                        "id": 12,
                        "level": 3,
                        "name": "儿童智能手表",
                        "parent_category_id": 7
                    }
                ]
            },
            {
                "id": 8,
                "level": 2,
                "name": "无线耳机",
                "parent_category_id": 5,
                "sub_category": [
                    {
                        "id": 13,
                        "level": 3,
                        "name": "降噪无线耳机",
                        "parent_category_id": 8
                    },
                    {
                        "id": 14,
                        "level": 3,
                        "name": "运动无线耳机",
                        "parent_category_id": 8
                    }
                ]
            },
            {
                "id": 9,
                "level": 3,
                "name": "高性能游戏本",
                "parent_category_id": 6
            },
            {
                "id": 10,
                "level": 3,
                "name": "轻薄游戏本",
                "parent_category_id": 6
            },
            {
                "id": 11,
                "level": 3,
                "name": "成人智能手表",
                "parent_category_id": 7
            },
            {
                "id": 12,
                "level": 3,
                "name": "儿童智能手表",
                "parent_category_id": 7
            },
            {
                "id": 13,
                "level": 3,
                "name": "降噪无线耳机",
                "parent_category_id": 8
            },
            {
                "id": 14,
                "level": 3,
                "name": "运动无线耳机",
                "parent_category_id": 8
            }
        ],
        "count": 14
    },
    "msg": "成功"
}
```

### 代码逻辑

```go
type CategoryModel struct {
	Model
	Name             string `gorm:"type:varchar(20);not null" json:"name,omitempty"`
	ParentCategoryID int32  `gorm:"comment:父分类ID（逻辑外键，关联自身ID）" json:"parent_category_id,omitempty"`
	// 用 constraint 禁用物理外键约束   保留是因为 查询方便
	SubCategory []*CategoryModel `gorm:"foreignKey:ParentCategoryID;references:ID;constraint:<-:false,foreignKey:no action" json:"sub_category,omitempty"`
	Level       int32            `gorm:"type:int;not null;default:1" json:"level,omitempty"`
	IsTab       bool             `gorm:"default:false;not null" json:"is_tab,omitempty"`
}


var categoryModels []models.CategoryModel
global.DB.Debug().Model(&models.CategoryModel{Level: 1}).Preload("SubCategory.SubCategory").Find(&categoryModels)
res.OkWithList(c, response, list.Total)
```

## POST 添加分类

POST /g/v1/categorys

### 请求参数（ShouldBindJSON）

```go
type CategoryCreateRequest struct {
	Name           string `form:"name" json:"name" binding:"required,min=3,max=20"`
	ParentCategory int32  `form:"parent" json:"parent"`
	Level          int32  `form:"level" json:"level" binding:"required,oneof=1 2 3"`
	IsTab          *bool  `form:"is_tab" json:"is_tab" binding:"required"`
}
```

### 返回结果

```go
	RMap := map[string]interface{}{
		"id": category.Id,
	}
	
成功： res.OkWithData(c, RMap)
失败： res.FailWithServiceMsg(c, err)
```

## 

## GET 获得子分类

GET /g/v1/categorys/:id

### 请求参数（uri ）

```go
type CategoryIdRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
type SubCategoryResponse struct {
	Id             int32                  `json:"id"`              // 分类ID
	Name           string                 `json:"name"`            // 分类名称
	ParentCategory int32                  `json:"parent_category"` // 父分类ID
	Level          int32                  `json:"level"`           // 分类层级 1/2/3级
	IsTab          bool                   `json:"is_tab"`          // 是否是导航栏标签
	SubCategories  []*SubCategoryResponse `json:"sub_categories"`  // 子分类列表
}
res.OkWithData(c, response)
```

## 

## PUT 修改分类

PUT /g/v1/categorys/:id

### 请求参数（uri 和 ShouldBindJSON）

```go
	idString := c.Param("id")
	id, err := strconv.Atoi(idString)

type UpdateCategoryRequest struct {
	Name  string `form:"name" json:"name" binding:"required,min=3,max=20"`
	IsTab *bool  `form:"is_tab" json:"is_tab"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "更新成功")
失败： res.FailWithServiceMsg(c, err)
```

## DELETE 删除分类

DELETE /g/v1/categorys/:id

### 请求参数（uri ）

```go
type CategoryIdRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "删除成功")
失败： res.FailWithServiceMsg(c, err)
```

## 

# 商品服务/轮播图接口

## GET 轮播图列表

GET /g/v1/banners

### 请求参数

```go
五
```

### 返回结果

```go
type BannerListResponse struct {
	Id    int32  `json:"id"`    // id
	Index int32  `json:"index"` // 排序序号/索引
	Image string `json:"image"` // 图片地址
	Url   string `json:"url"`   // 跳转链接
}
var response []banner_srv.BannerListResponse
res.OkWithList(c, response, list.Total)

```

## POST 创建轮播图

POST /g/v1/banners

### 请求参数（ShouldBindJSON）

```go
type BannerCreateRequest struct {
	Image string `form:"image" json:"image" binding:"url"`
	Index int32  `form:"index" json:"index" binding:"required"`
	Url   string `form:"url" json:"url" binding:"url"`
}

```

### 返回结果

```go
	RMap := map[string]interface{}{
		"id": bannerInfo.Id,
	}
	
成功： res.OkWithData(c, RMap)
失败： res.FailWithServiceMsg(c, err)
```

## PUT 修改轮播图

PUT /g/v1/banners/:id

### 请求参数（uri 和 ShouldBindJSON）

```go
	idString := c.Param("id")
	id, err := strconv.Atoi(idString)

type BannerUpdateRequest struct {
	Image string `form:"image" json:"image"`
	Index int32  `form:"index" json:"index"`
	Url   string `form:"url" json:"url"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "更新成功")
失败： res.FailWithServiceMsg(c, err)
```

## DELETE 删除轮播图

DELETE /g/v1/banners/:id

### 请求参数（uri ）

```go
type BannerIdRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "删除成功")
失败： res.FailWithServiceMsg(c, err)
```

## 

# 商品服务/品牌接口

## GET 所有品牌

GET /g/v1/brands

### 请求参数（Query ）

```go
type PageInfo struct {
	Limit int32  `form:"limit"`
	Page  int32  `form:"page"`
	Key   string `form:"key"`
	Sort  string `form:"sort"` //前端可以覆盖
}

```

### 返回结果

```go
type BrandListResponse struct {
	Id   int32  `json:"id"`
	Name string `json:"name"`
	Logo string `json:"logo"`
}
成功：	res.OkWithList(c, list.Data, list.Total)
```

## 

## POST 创建品牌

POST /g/v1/brands

### 请求参数（ShouldBindJSON）

```go
type BrandCreateRequest struct {
	Name string `form:"name" json:"name" binding:"required,min=3,max=10"`
	Logo string `form:"logo" json:"logo" binding:"url"`
}
```

### 返回结果

```go
	RMap := map[string]interface{}{
		"id": brandInfo.Id,
	}
成功：	res.OkWithData(c, RMap)
失败： res.FailWithServiceMsg(c, err)
```

## PUT 修改品牌

PUT /g/v1/brands/:id

### 请求参数（uri 和 ShouldBindJSON）

```go
	idString := c.Param("id")
	id, err := strconv.Atoi(idString)

type BrandUpdateRequest struct {
	Name string `form:"name" json:"name"`
	Logo string `form:"logo" json:"logo"`
}

```

### 返回结果

```go
成功： res.OkWithMessage(c, "删除成功")
失败： res.FailWithServiceMsg(c, err)
```

## 

## DELETE 删除品牌

DELETE /g/v1/brands/:id

### 请求参数（uri ）

```go
type BrandIdRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "删除成功")
失败： res.FailWithServiceMsg(c, err)
```



# 商品服务/品牌分类接口

## GET 品牌分类所有数据

GET /g/v1/categorybrands

### 请求参数（Query ）

```go
type PageInfo struct {
	Limit int32  `form:"limit"`
	Page  int32  `form:"page"`
	Key   string `form:"key"`
	Sort  string `form:"sort"` //前端可以覆盖
}

```

### 返回结果

```go
type BrandCategoryItem struct {
	Brand    Brand    `json:"brand"`
	Category Category `json:"category"`
}

type Brand struct {
	Id   int32  `json:"id"`
	Name string `json:"name"`
	Logo string `json:"logo"`
}

type Category struct {
	Id               int32  `json:"id"`
	Name             string `json:"name"`
	ParentCategoryID int32  `json:"parent_category_id"`
	Level            int32  `json:"level"`
	IsTab            bool   `json:"is_tab,omitempty"`
}

var response []brand_srv.BrandCategoryItem

res.OkWithList(c, response, list.Total)
```



## POST 创建品牌分类数据

POST /g/v1/categorybrands

### 请求参数（ShouldBindJSON）

```go
type CreateCategoryBrandRequest struct {
	CategoryId int32 `json:"category_id" binding:"required"`
	BrandId    int32 `json:"brand_id" binding:"required"`
}
```

### 返回结果

```go
	RMap := map[string]interface{}{
		"id": Info.Id,
	}
成功：	res.OkWithData(c, RMap)
失败： res.FailWithServiceMsg(c, err)
```

## 

## GET 某个分类的所有品牌

GET /g/v1/categorybrands/:id

### 请求参数（uri ）

```go
type IdRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
type BrandListResponse struct {
	Id   int32  `json:"id"`
	Name string `json:"name"`
	Logo string `json:"logo"`
}
var reponse []BrandListResponse
res.OkWithList(c, reponse, list.Total)
```



## PUT  修改品牌分类数据

PUT /g/v1/categorybrands/:id

### 请求参数（uri 和 ShouldBindJSON）

```go
	idString := c.Param("id")
	id, err := strconv.Atoi(idString)

type UpdateCategoryBrandRequest struct {
	CategoryId int32 `json:"category_id" `
	BrandId    int32 `json:"brand_id" `
}

```

### 返回结果

```go
成功： res.OkWithMessage(c, "更新成功")
失败： res.FailWithServiceMsg(c, err)
```



## DELETE 删除品牌分类数据

DELETE /g/v1/categorybrands/:id

### 请求参数（uri ）

```go
type IdRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "删除成功")
失败： res.FailWithServiceMsg(c, err)
```



# 订单服务

Base URLs:

* <a href="http://192.168.163.1:8083/">开发环境: http://192.168.163.1:8083/</a>

# 订单服务/购物车接口

## GET 某人的购物车

GET /o/v1/shopcarts

### 请求参数

```go
无
```

### 返回结果

```go
type CartListResponse struct {
	Id          int32    `json:"id"`
	GoodID      int32    `json:"good_id"`
	Name        string   `form:"name" json:"name"`
	GoodsSn     string   `form:"goods_sn" json:"goods_sn"`
	Stocks      int32    `form:"stocks" json:"stocks"` // 有值时校验 ≥1
	CategoryId  int32    `form:"category"`
	MarketPrice float32  `form:"market_price"`
	GoodPrice   float32  `form:"good_price" json:"good_price"`
	GoodsBrief  string   `form:"goods_brief" json:"goods_brief"`
	Images      []string `form:"images" json:"images"`
	DescImages  []string `form:"desc_images" json:"desc_images"`
	ShipFree    *bool    `form:"ship_free" json:"ship_free"`
	FrontImage  string   `form:"front_image" json:"front_image"`
	Brand       int32    `form:"brand" json:"brand"`
	Chacked     *bool    `form:"chacked" json:"chacked"`
}
var response []cart_srv.CartListResponse
res.OkWithList(c, response, cartList.Total)
```

## 

## POST 加入商品到购物车

POST /o/v1/shopcarts

### 请求参数（ShouldBindJSON）

```go
type CartAddRequest struct {
	GoodID int32 `json:"good_id" binding:"required"`
	Num    int32 `json:"num" binding:"required" min:"1"`
}
```

### 返回结果

```go
	RMap := map[string]interface{}{
		"id": req.Id,
	}
成功：	res.OkWithData(c, RMap)
失败： res.FailWithServiceMsg(c, err)
```

## 

## PATCH 更新购物车中的某个商品

PATCH /o/v1/shopcarts/:id

### 请求参数（uri 和 ShouldBindJSON）

```go
	idString := c.Param("id")
	id, err := strconv.Atoi(idString)

type CartUpdateRequest struct {
	Num     int32 `json:"num" binding:"required" min:"1"`
	Checked *bool `json:"checked"`
}

```

### 返回结果

```go
成功： res.OkWithMessage(c, "更新成功")
失败： res.FailWithServiceMsg(c, err)
```



## DELETE 删除条目

DELETE /o/v1/shopcarts/:id

### 请求参数（uri ）

```go
type CartIdRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "删除成功")
失败： res.FailWithServiceMsg(c, err)
```



# 订单服务/订单接口

## GET 查看所有订单

GET /o/v1/orders

### 请求参数（Query ）

```go
type PageInfo struct {
	Limit int32  `form:"limit"`
	Page  int32  `form:"page"`
	Key   string `form:"key"`
	Sort  string `form:"sort"` //前端可以覆盖
}

```

### 返回结果

```go
type OrderListResponse struct {
	Id      int32   `json:"id"`
	UserId  int32   `json:"user_id"`
	OrderSn string  `json:"order_sn"`
	PayType string  `json:"pay_type"`
	Status  string  `json:"status"`
	Post    string  `json:"post"`
	Total   float32 `json:"total"`
	Address string  `json:"address"`
	Name    string  `json:"name"`
	Mobile  string  `json:"mobile"`
}
	var response []order_srv.OrderListResponse
	res.OkWithList(c, response, list.Total)
```

## 

## POST 创建订单

POST /o/v1/orders

### 请求参数（ShouldBindJSON）

```go
type OrderCreateRequest struct {
	Post    string `json:"post" binding:"required"`
	Address string `json:"address" binding:"required"`
	Name    string `json:"name" binding:"required"`
	Mobile  string `json:"mobile" binding:"required,mobile"`
}
```

### 返回结果

```go
type OrderCreateResponse struct {
	Id        int32  `json:"id"`
	AlipayUrl string `json:"alipay_url"`
}
response := order_srv.OrderCreateResponse{
		Id:        orderModel.Id,
		AlipayUrl: result.String(),
	}
	res.OkWithData(c, response)
```

## 

## GET 查看订单细节

GET /o/v1/orders/:id

### 请求参数（Uri）

```go
type OrderIdRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
type OrderDetailResponse struct {
	Id        int32      `json:"id"`
	UserId    int32      `json:"user_id"`
	OrderSn   string     `json:"order_sn"`
	PayType   string     `json:"pay_type"`
	Status    string     `json:"status"`
	Post      string     `json:"post"`
	Total     float32    `json:"total"`
	Address   string     `json:"address"`
	Name      string     `json:"name"`
	Mobile    string     `json:"mobile"`
	GoodInfo  []GoodInfo `json:"goods"`
	AlipayUrl string     `json:"alipay_url"`
}
type GoodInfo struct {
	Id    int32   `json:"id"`
	Name  string  `json:"name"`
	Image string  `json:"image"`
	Price float32 `json:"price"`
	Nums  int32   `json:"nums"`
}
var response order_srv.OrderDetailResponse
res.OkWithData(c, response)
```

## 

# 用户操作服务/地址接口
Base URLs:

* <a href="http://192.168.163.1:8084/">开发环境: http://192.168.163.1:8084/</a>
## GET 查看所有收货地址

GET /up/v1/address

### 请求参数

```go
无
```

### 返回结果

```go
type AddressListResponse struct {
	Id           int32  `json:"id"`
	UserId       int32  `json:"userId"`
	Province     string `json:"province"`
	City         string `json:"city"`
	District     string `json:"district"`
	Address      string `json:"address"`
	SignerName   string `json:"signer_name"`
	SignerMobile string `json:"signer_mobile"`
}
	var response []address_srv.AddressListResponse
	res.OkWithList(c, response, list.Total)
```

## 

## POST 添加收货地址

POST /up/v1/address

### 请求参数（ShouldBindJSON）

```go
type AddressCreateRequest struct {
	Province     string `form:"province" json:"province" binding:"required"`
	City         string `form:"city" json:"city" binding:"required"`
	District     string `form:"district" json:"district" binding:"required"`
	Address      string `form:"address" json:"address" binding:"required"`
	SignerName   string `form:"signer_name" json:"signer_name" binding:"required"`
	SignerMobile string `form:"signer_mobile" json:"signer_mobile" binding:"required"`
}
```

### 返回结果

```go
type AddressCreateResponse struct {
	Id int32 `json:"id"`
    
}
response := address_srv.AddressCreateResponse{
		Id: address.Id,
	}
成功	 res.OkWithData(c, response)
失败： res.FailWithServiceMsg(c, err)
```

## 

## DELETE 删除收货地址

DELETE /up/v1/address/:id

### 请求参数（uri ）

```go
type AddressIdRequest struct {
	Id int32 `uri:"id" binding:"required,min=1"`
}
```

### 返回结果

```go
成功： res.OkWithMessage(c, "删除成功")
失败： res.FailWithServiceMsg(c, err)
```



## PUT 修改收货地址

PUT /up/v1/address/:id

### 请求参数（uri 和 ShouldBindJSON）

```go
	idString := c.Param("id")
	id, err := strconv.Atoi(idString)

type AddressUpdateRequest struct {
	Province     string `json:"province"`
	City         string `json:"city"`
	District     string `json:"district"`
	Address      string `json:"address"`
	SignerName   string `json:"signer_name"`
	SignerMobile string `json:"signer_mobile"`
}


```

### 返回结果

```go
成功： res.OkWithMessage(c, "更新成功")
失败： res.FailWithServiceMsg(c, err)
```

## 

# 用户操作服务/留言接口

## GET 查看所有留言

GET /up/v1/message

### 请求参数

```go
无
```

### 返回结果

```go
type MessageResponse struct {
	Id          int32  `json:"id"`
	UserId      int32  `json:"user_id"`
	MessageType int32  `json:"message_type"`
	Subject     string `json:"subject"`
	Message     string `json:"message"`
	File        string `json:"file"`
}
var response []message_srv.MessageResponse
res.OkWithList(c, response, List.Total)
```

## POST 发送留言

POST /up/v1/message

### 请求参数（ShouldBindJSON）

```go
type MessageRequest struct {
	MessageType int32  `form:"type" json:"type" binding:"required,oneof=1 2 3 4 5"`
	Subject     string `form:"subject" json:"subject" binding:"required"`
	Message     string `form:"message" json:"message" binding:"required"`
	File        string `form:"file" json:"file" binding:"required"`
}
```

### 返回结果

```go
RMap := map[string]interface{}{
		"id": req.Id,
	}
成功：	res.OkWithData(c, RMap)
失败： res.FailWithServiceMsg(c, err)
```

# 用户操作服务/用户收藏接口

## GET 用户收藏列表

GET /up/v1/userfavs

### 请求参数

```go
无
```

### 返回结果

```go
type BrandListResponse struct {
	Id   int32  `json:"id"`
	Name string `json:"name"`
	Logo string `json:"logo"`
}
var response []collection_srv.CollectionListResponse
res.OkWithList(c, response, goodsInfo.Total)
```

## 

## POST 添加收藏

POST /up/v1/userfavs

### 请求参数（ShouldBindJSON）

```go
type CollectionAddRequest struct {
	GoodId int32 `json:"good_id" binding:"required,min=1"`
}
```

### 返回结果

```go
	RMap := map[string]interface{}{
		"id": brandInfo.Id,
	}
成功：	res.OkWithMessage(c, "收藏成功")
失败： res.FailWithServiceMsg(c, err)
```

## 

## DELETE 删除收藏

DELETE /up/v1/userfavs/:good_id

### 请求参数（uri ）

```go
type CollectionIdRequest struct {
	GoodId int32 `uri:"good_id" binding:"required,min=1"`
}

```

### 返回结果

```go
成功： res.OkWithMessage(c, "删除成功")
失败： res.FailWithServiceMsg(c, err)
```



## GET 查看收藏商品细节

GET /up/v1/userfavs/:good_id

### 请求参数（uri ）

```go
type CollectionIdRequest struct {
	GoodId int32 `uri:"good_id" binding:"required,min=1"`
}
```

### 返回结果

```go
成功：	res.OkWithMessage(c, "存在")
失败： res.FailWithServiceMsg(c, err)
```



# 上传服务/图片上传

Base URLs:

* <a href="http://192.168.163.1:8084/">开发环境: http://192.168.163.1:8084/</a>

## GET 图片上传 （附代码）

GET /oss/v1/token

```go
	r.GET("/token", func(c *gin.Context) {
		filename := c.Query("filename")
		if filename == "" {
			res.FailWithMsg(c, res.FailArgumentCode, "filename不能为空")
			return
		}
		tokenData, err := qiniu.GetUploadTokenForBrowser(global.Config.QiNiu.Prefix, filename)
		if err != nil {
			res.FailWithMsg(c, res.FailServiceCode, err.Error())
			return
		}
		res.OkWithData(c, tokenData)
	})
```

## POST 上传回调 （附代码）

GET /oss/v1/callback

```go
r.POST("/callback", QiNiuCallback)

func QiNiuCallback(c *gin.Context) {
	q := global.Config.QiNiu
	// 1. 读取回调Body（读取后重置，避免后续无法读取）
	callbackBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		zap.S().Errorf("读取回调Body失败：%s", err.Error())
		res.FailWithMsg(c, res.FailServiceCode, "读取回调数据失败")
		return
	}
	// 重置Body，因为gin的Body只能读取一次
	c.Request.Body = io.NopCloser(bytes.NewReader(callbackBody))

	// 2. 解析Authorization头部（格式：QBox <AccessKey>:<Sign>）
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		zap.S().Error("缺少Authorization头部")
		res.FailWithMsg(c, res.FailArgumentCode, "缺少Authorization头部")
		return
	}
	authParts := strings.SplitN(authHeader, " ", 2)
	if len(authParts) != 2 || authParts[0] != "QBox" {
		zap.S().Error("Authorization头部格式错误")
		res.FailWithMsg(c, res.FailArgumentCode, "Authorization头部格式错误")
		return
	}
	authToken := strings.SplitN(authParts[1], ":", 2)
	if len(authToken) != 2 {
		zap.S().Error("Authorization Token格式错误")
		res.FailWithMsg(c, res.FailArgumentCode, "Authorization Token格式错误")
		return
	}
	recvAK := authToken[0] // 回调携带的AccessKey
	//recvSign := authToken[1] // 回调携带的签名

	// 3. 验证AccessKey是否匹配

	if recvAK != q.AccessKey {
		zap.S().Error("AccessKey不匹配")
		res.FailWithMsg(c, res.FailArgumentCode, "AccessKey不匹配")
		return
	}

	// 4. 计算签名（核心：用SecretKey对回调Body做HMAC-SHA1 + Base64编码）
	mac := hmac.New(sha1.New, []byte(q.SecretKey))
	mac.Write(callbackBody)
	// 7. 解析回调数据
	var callbackData struct {
		Key      string  `json:"key"`      // 文件存储Key
		Hash     string  `json:"hash"`     // 文件哈希
		Fname    string  `json:"fname"`    // 原始文件名
		Fsize    float64 `json:"fsize"`    // 文件大小（字节）
		MimeType string  `json:"mimeType"` // 文件类型
	}
	if err := json.Unmarshal(callbackBody, &callbackData); err != nil {
		zap.S().Errorf("解析回调数据失败：%s", err.Error())
		res.FailWithMsg(c, res.FailServiceCode, "回调数据解析失败")
		return
	}

	// 优化：使用 filepath.Join 处理斜杠，再替换为 URL 分隔符
	cdnDomain := strings.TrimSuffix(q.CDN, "/")          // 去除 CDN 域名末尾的 /
	fileKey := strings.TrimPrefix(callbackData.Key, "/") // 去除 Key 开头的 /
	fileUrl := fmt.Sprintf("%s/%s", cdnDomain, fileKey)

	zap.S().Infof("文件上传成功：%s，大小：%.2fMB，类型：%s", fileUrl, callbackData.Fsize/1024/1024, callbackData.MimeType)

	// 9. 响应七牛云（必须返回200，否则七牛会重试回调）
	res.OkWithData(c, map[string]interface{}{
		"code":     res.SuccessCode,
		"msg":      "回调处理成功",
		"file_url": fileUrl,
		"key":      callbackData.Key,
	})
```

