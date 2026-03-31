# 🎮 Real-time Leaderboard

## 📌 Giới thiệu

**Real-time Leaderboard** là một nền tảng quản lý bảng xếp hạng theo thời gian thực cho web game dinosaur tích hợp sẵn, cho phép người chơi đăng ký, đăng nhập, chơi game và xem điểm số của mình cũng như của những người chơi khác trên bảng xếp hạng.

---

## ✨ Tính năng nổi bật

✅ **Xác thực an toàn**
   - JWT token-based authentication
   - BCrypt hashing cho mật khẩu
   - CORS policy tùy chỉnh

✅ **Leaderboard Real-time**
   - Redis sorted set cho tốc độ O(log N)
   - Phân trang hỗ trợ (skip/take)
   - Tự động sync SQL → Redis khi khởi động

✅ **Game T-Rex tích hợp**
   - Trò chơi dinosaur interactive từ Chromium
   - Submit score tự động sau khi game kết thúc

✅ **Full-stack UI**
   - React 19 frontend
   - Material-UI components
   - Responsive design

✅ **Containerized & Production-ready**
   - Docker Compose orchestration
   - Health checks cho tất cả services
   - Automatic database migration & seeding
   - Environment-driven configuration

---

## 🚀 Hướng dẫn cài đặt

### ✋ Yêu cầu hệ thống

- **Docker** ≥ 20.10 & **Docker Compose** ≥ 1.29+
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Git** (để clone repo)

### 📥 Bước 1: Clone & Chuẩn bị

```bash
git clone https://github.com/yourusername/Real-time-Leaderboard.git
```

### 🐳 Bước 2: Khởi chạy với Docker Compose

Từ thư mục gốc Real-time-Leaderboard (chứa `docker-compose.yml`), chạy:

```bash
docker compose up --build
```

**Lần đầu sẽ tốn thời gian** (pull images, build, restore NuGet packages, npm install, etc.)

### ✅ Bước 3: Truy cập ứng dụng
- UI: http://localhost:3000
