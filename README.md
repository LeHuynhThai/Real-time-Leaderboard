# Real-time Leaderboard

Hệ thống bảng xếp hạng thời gian thực, cho phép người dùng chơi game, cạnh tranh điểm số và theo dõi bảng xếp hạng trực tiếp.

## Chức năng chính

- Đăng ký và đăng nhập: với hệ thống xác thực JWT an toàn
- Game T-Rex: tích hợp sẵn và ghi điểm số
- Xem bảng xếp hạng thời gian thực: cập nhật real time qua SignalR

## Quick Start

#### 1. Chuẩn bị Database

- Tạo database SQL Server (ví dụ: RealTimeLeaderboard)
- Cập nhật connection string trong API/appsettings.json

#### 2. Chạy Backend API

- cd API
- dotnet restore
- dotnet run

#### 3. Chạy Frontend

- cd UI
- npm install
- npm start

## Demo
![alt text](Real-time-Leaderboard/DemoPhoto/image.png)
![alt text](Real-time-Leaderboard/DemoPhoto/image1.png)
![alt text](Real-time-Leaderboard/DemoPhoto/image2.png)
![alt text](Real-time-Leaderboard/DemoPhoto/image3.png)
![alt text](Real-time-Leaderboard/DemoPhoto/image4.png)
![alt text](Real-time-Leaderboard/DemoPhoto/image5.png)
![alt text](Real-time-Leaderboard/DemoPhoto/image6.png)
![alt text](Real-time-Leaderboard/DemoPhoto/image7.png)
