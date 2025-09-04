# Hướng dẫn Hệ thống Authentication

## Vấn đề đã được khắc phục

### Vấn đề ban đầu:
- Không thể đăng nhập bằng tài khoản admin
- Vẫn có thể truy cập `localhost:3000/admin` mà không cần đăng nhập
- Không có kiểm tra quyền admin ở frontend

### Nguyên nhân:
1. **Trang `/admin` không được bảo vệ**: Route `/admin` trong `App.js` không được wrap trong `ProtectedRoute`
2. **Không có kiểm tra quyền admin**: Component `Admin.js` chỉ kiểm tra token, không kiểm tra role
3. **Admin login không cập nhật Redux state**: Khi đăng nhập admin thành công, chỉ lưu token vào localStorage

## Giải pháp đã triển khai:

### 1. Tạo AdminProtectedRoute
- **File**: `frontend/src/components/AdminProtectedRoute.js`
- **Chức năng**: 
  - Kiểm tra user đã đăng nhập chưa
  - Kiểm tra user có role "admin" không
  - Redirect về `/admin/login` nếu chưa đăng nhập
  - Hiển thị thông báo lỗi nếu không có quyền admin

### 2. Cập nhật AdminLogin
- **File**: `frontend/src/pages/AdminLogin.js`
- **Thay đổi**:
  - Import `useDispatch` từ Redux
  - Cập nhật Redux state khi đăng nhập thành công
  - Xử lý đúng format response từ backend

### 3. Bảo vệ route /admin
- **File**: `frontend/src/App.js`
- **Thay đổi**: Wrap route `/admin` trong `AdminProtectedRoute`

### 4. Thêm API endpoint /me
- **Backend**: 
  - Thêm function `getMe` trong `userController.js`
  - Thêm route `/api/users/me` trong `userRoutes.js`
- **Chức năng**: Lấy thông tin user hiện tại từ token

## Cách sử dụng:

### 1. Đăng nhập Admin:
```
URL: http://localhost:3000/admin/login
- Nhập email và password của tài khoản admin
- Hệ thống sẽ kiểm tra role và cập nhật Redux state
```

### 2. Truy cập trang Admin:
```
URL: http://localhost:3000/admin
- Tự động kiểm tra authentication và quyền admin
- Redirect về /admin/login nếu chưa đăng nhập
- Hiển thị thông báo lỗi nếu không có quyền admin
```

### 3. Tạo tài khoản Admin:
```javascript
// Trong database, set role = 'admin' cho user
{
  "username": "admin",
  "email": "admin@example.com", 
  "password": "hashed_password",
  "role": "admin"
}
```

## Cấu trúc Authentication:

### Frontend:
- `AdminProtectedRoute`: Bảo vệ trang admin
- `ProtectedRoute`: Bảo vệ trang user thường
- `authSlice`: Quản lý state authentication
- `AdminLogin`: Form đăng nhập admin

### Backend:
- `verifyToken`: Middleware kiểm tra token
- `verifyAdmin`: Middleware kiểm tra quyền admin
- `loginAdmin`: API đăng nhập admin
- `/api/users/me`: API lấy thông tin user hiện tại

## Lưu ý:
- Token được lưu trong localStorage
- Redux state được cập nhật khi đăng nhập thành công
- Tự động logout sau 30 phút không hoạt động
- Kiểm tra quyền admin được thực hiện ở cả frontend và backend 