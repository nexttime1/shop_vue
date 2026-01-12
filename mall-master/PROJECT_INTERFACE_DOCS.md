# Project Interface Documentation (Routes & APIs)

This document maps all frontend routes to their respective functionalities and backend API endpoints.

---

## 🛣 Frontend Routes (Vue Router)

### 1. Public Routes
| Path | Name | Component | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `login` | `views/login/index` | Admin login page |
| `/404` | `NotFound` | `views/404` | Error 404 page |

### 2. Main Layout (Authenticated)
| Path | Name | Component | Description |
| :--- | :--- | :--- | :--- |
| `/home` | `home` | `views/home/index` | Dashboard (Statistics Overview) |
| `/pms/product` | `product` | `views/pms/product/index` | Product Management List |
| `/pms/addProduct`| `addProduct`| `views/pms/product/add` | Create new product |
| `/pms/productCate`| `productCate`| `views/pms/productCate/index` | Product Category management |
| `/pms/brand` | `brand` | `views/pms/brand/index` | Brand management |
| `/oms/order` | `order` | `views/oms/order/index` | Order Management List |
| `/user/user` | `user` | `views/user/userList` | User Account List |
| `/user/address` | `address` | `views/user/address/addressList`| User shipping addresses |
| `/user/rotation` | `rotation` | `views/user/rotation/index` | Home Banner/Slider management |
| `/user/machine` | `machine` | `views/user/machine/index` | User feedback/messages |

---

## 📡 Backend API Endpoints (Axios)

All requests use a base Axios instance with Token authentication.

### 1. Authentication (`src/apis/login.js`)
- **Login**
  - **URL**: `POST /u/v1/user/pwd_login`
  - **Request**: `{ mobile, password, captcha, captcha_id }`
  - **Response**: `{ data: { token } }`
- **Captcha**
  - **URL**: `GET /u/v1/base/captcha`
  - **Response**: `{ captchaId, picPath }`

### 2. Goods & Catalog (`src/apis/goods.js`)
- **Products**
  - **URL**: `GET /g/v1/goods` (List), `POST /g/v1/goods` (Create), `PATCH /g/v1/goods/{id}` (Status update)
  - **Params**: `pn` (page), `pnum` (size), `q` (query), `c` (category)
- **Categories**
  - **URL**: `GET /g/v1/categorys`
  - **Function**: Fetches nested category tree for selection.
- **Brands**
  - **URL**: `GET /g/v1/brands`
- **Banners**
  - **URL**: `GET /g/v1/banners`

### 3. Orders (`src/apis/goods.js`)
- **Order List**
  - **URL**: `GET /o/v1/orders`
  - **Params**: `pn`, `pnum`
- **Order Detail**
  - **URL**: `GET /o/v1/orders/{id}`

### 4. User Operations (`src/apis/goods.js`)
- **Addresses**
  - **URL**: `GET /up/v1/address`
- **Messages**
  - **URL**: `GET /up/v1/message`
- **User List**
  - **URL**: `GET /u/v1/user`
