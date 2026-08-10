# Hướng Dẫn Bảo Trì & Vận Hành Hệ Thống (Gia Phả OS)

Tài liệu này cung cấp toàn bộ hướng dẫn kiến trúc, vận hành, bảo trì, khắc phục lỗi và quản trị cơ sở dữ liệu cho dự án **Gia Phả OS**.

---

## 📋 Mục Lục

1. [Tổng Quan Kiến Trúc Hệ Thống](#1-tổng-quan-kiến-trúc-hệ-thống)
2. [Cấu Hình Môi Trường & Cơ Sở Dữ Liệu](#2-cấu-hình-môi-trường--cơ-sở-dữ-liệu)
3. [Phân Quyền Người Dùng & Quản Trị Hệ Thống](#3-phân-quyền-người-dùng--quản-trị-hệ-thống)
4. [Các Lệnh Bảo Trì & Kiểm Tra Mã Nguồn](#4-các-lệnh-bảo-trì--kiểm-tra-mã-nguồn)
5. [Sao Lưu, Phôi Phục & Di Chuyển Dữ Liệu](#5-sao-lưu-phôi-phục--di-chuyển-dữ-liệu)
6. [Hướng Dẫn Khắc Phục Lỗi Thường Gặp (Troubleshooting)](#6-hướng-dẫn-khắc-phục-lỗi-thường-gặp-troubleshooting)
7. [Quy Trình Triển Khai & Nâng Cấp (Deployment)](#7-quy-trình-triển-khai--nâng-cấp-deployment)

---

## 1. Tổng Quan Kiến Trúc Hệ Thống

| Thành Phần | Công Nghệ / Thư Viện Sử Dụng | Mô Tả Chức Năng |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router + Turbopack) | Server Components, Server Actions & Client Components |
| **Database & Auth** | Supabase (PostgreSQL + GoTrue Auth) | Cơ sở dữ liệu quan hệ, xác thực người dùng & RLS |
| **Storage** | Supabase Storage Buckets | Lưu trữ avatar (`avatars`) và ảnh album (`gallery`) |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Framer Motion | Giao diện chuẩn hóa theo `@DESIGN.md`, hiệu ứng animation |
| **Biểu Đồ & Cây** | D3.js, custom SVG components | Hiển thị sơ đồ phả hệ (Tree View, Mindmap View, Bubble Map) |
| **Package Manager** | `pnpm` (khuyên dùng) hoặc `bun` / `npm` | Quản lý gói phụ thuộc |

### Cấu trúc Thư mục Chính
```text
├── app/
│   ├── actions/          # Server Actions (settings.ts, ...)
│   ├── api/              # API Routes (health, ...)
│   ├── auth/             # Authentication routes (callback, reset-password)
│   ├── dashboard/        # Các trang quản trị (members, stats, kinship, gallery, users, ...)
│   └── login/            # Trang đăng nhập / đăng ký
├── components/           # Các UI component tái sử dụng (FamilyTree, MindmapTree, ...)
├── docs/                 # SQL Schema và các migration script
│   ├── schema.sql                        # Schema hoàn chỉnh của dự án
│   └── migration_family_settings.sql     # Migration bảng cấu hình gốc dòng họ
├── utils/                # Utility helpers (dateHelpers, eventHelpers, supabase)
├── proxy.ts              # Next.js Middleware kiểm tra session & bảo vệ route
└── package.json          # Danh sách dependencies & npm scripts
```

---

## 2. Cấu Hình Môi Trường & Cơ Sở Dữ Liệu

### 2.1 Biến Môi Trường (`.env.local`)
Tạo file `.env.local` ở thư mục gốc của dự án với các thông số sau:

```env
# Tên hiển thị của dự án
SITE_NAME="Gia Phả OS"

# URL của dự án Supabase (Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"

# Key truy cập Public (Settings > API > Project API keys > anon / public)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-anon-key-here"

# (Tùy chọn) Cấu hình domain trang demo
DEMO_DOMAIN="giapha-os.homielab.com"
```

---

### 2.2 Các Bảng Cơ Sở Dữ Liệu Chính

| Bảng (Table) | Mô Tả | Chính Sách RLS |
| :--- | :--- | :--- |
| `profiles` | Hồ sơ người dùng liên kết với `auth.users` | Admin xem tất cả; Member/Editor xem profile cá nhân |
| `persons` | Thông tin thành viên trong dòng họ | Ai đã đăng nhập cũng xem được; Admin & Editor được thêm/sửa/xóa |
| `person_details_private` | Thông tin nhạy cảm (SĐT, nơi ở...) | Chỉ `admin` mới có quyền xem và chỉnh sửa |
| `relationships` | Quan hệ giữa các thành viên (cha con, hôn nhân) | Tất cả xem được; Admin & Editor được thêm/sửa/xóa |
| `custom_events` | Các sự kiện gia đình (ngày giỗ, họp họ) | Tất cả xem được; Người tạo hoặc Admin được sửa/xóa |
| `family_settings` | Cài đặt toàn cục (vd: người gốc mặc định `default_root_id`) | Đăng nhập đều xem được; Admin & Editor được sửa |
| `gallery_items` | Album hình ảnh kỉ niệm dòng họ | Tất cả xem được; Người tạo hoặc Admin được sửa/xóa |

---

### 2.3 Khởi Tạo / Cập Nhật Database (SQL Migrations)

1. **Khởi tạo database mới**:
   Chạy file [docs/schema.sql](file:///home/qd/project/own/giapha-os/docs/schema.sql) trong **Supabase SQL Editor**.
2. **Cập nhật tính năng Cấu hình người gốc dòng họ (`family_settings`)**:
   Chạy file [docs/migration_family_settings.sql](file:///home/qd/project/own/giapha-os/docs/migration_family_settings.sql) trong **Supabase SQL Editor**.

---

## 3. Phân Quyền Người Dùng & Quản Trị Hệ Thống

Hệ thống hỗ trợ 3 cấp độ phân quyền (`user_role_enum`):

1. **`admin` (Quản trị viên)**:
   * Có toàn quyền quản trị hệ thống, quản lý tài khoản người dùng (`/dashboard/users`), phê duyệt/khoá tài khoản.
   * Quản lý dữ liệu riêng tư (`person_details_private`) và cài đặt dòng họ.
2. **`editor` (Biên soạn)**:
   * Được phép thêm, sửa, xóa thông tin thành viên (`persons`), quan hệ (`relationships`), cài đặt gốc phả hệ.
3. **`member` (Thành viên)**:
   * Chỉ có quyền xem sơ đồ cây phả hệ, danh xưng, thống kê và album ảnh.

### Quy trình tự động phân quyền tài khoản đầu tiên
Trigger `on_auth_user_created` trong cơ sở dữ liệu sẽ **tự động gán quyền `admin`** cho tài khoản đăng ký **đầu tiên**. Các tài khoản đăng ký sau sẽ mặc định là `member`.

---

## 4. Các Lệnh Bảo Trì & Kiểm Tra Mã Nguồn

Thực hiện các lệnh sau tại máy cục bộ trước khi đẩy code mới hoặc deploy:

```bash
# 1. Cài đặt phụ thuộc
pnpm install

# 2. Chạy môi trường phát triển (Dev server)
pnpm dev

# 3. Kiểm tra kiểu dữ liệu TypeScript (Type check)
./node_modules/typescript/bin/tsc --noEmit

# 4. Kiểm tra chuẩn mã nguồn (Linting)
./node_modules/.bin/eslint .

# 5. Biên dịch sản phẩm (Production Build Test)
./node_modules/next/dist/bin/next build
```

---

## 5. Sao Lưu, Phôi Phục & Di Chuyển Dữ Liệu

### 5.1 Giao Diện Web (`/dashboard/data`)
* **Xuất dữ liệu (Export)**: Hỗ trợ xuất toàn bộ phả hệ ra các định dạng `JSON`, `CSV` hoặc `GEDCOM` (chuẩn phả hệ quốc tế).
* **Nhập dữ liệu (Import)**: Cho phép tải file JSON/CSV/GEDCOM để nạp nhanh danh sách thành viên và mối quan hệ.

### 5.2 Sao Lưu Database Trên Supabase
Vào **Supabase Dashboard** > **Database** > **Backups** để tải hoặc lên lịch sao lưu tự động cho cơ sở dữ liệu PostgreSQL.

---

## 6. Hướng Dẫn Khắc Phục Lỗi Thường Gặp (Troubleshooting)

### 🔴 Lỗi 1: `Failed to fetch` khi đăng ký hoặc đăng nhập
* **Nguyên nhân**: Supabase từ chối các kết nối đến từ domain chưa đăng ký.
* **Cách khắc phục**:
  1. Truy cập **Supabase Dashboard** > **Authentication** > **URL Configuration**.
  2. Cấu hình **Site URL**: Ví dụ `https://giapha.yourdomain.com` hoặc `http://localhost:3000`.
  3. Thêm vào **Redirect URLs**: `https://giapha.yourdomain.com/**` và `http://localhost:3000/**`.

### 🔴 Lỗi 2: Không lưu được người gốc mặc định hoặc chỉnh sửa bị báo lỗi
* **Nguyên nhân**: Chưa chạy migration script `family_settings` hoặc RLS Policy bị thiếu quyền cho `editor`.
* **Cách khắc phục**: Mở file [docs/migration_family_settings.sql](file:///home/qd/project/own/giapha-os/docs/migration_family_settings.sql) và chạy lại toàn bộ tập lệnh trong Supabase SQL Editor.

### 🔴 Lỗi 3: Người dùng không thể tải lên ảnh đại diện / album
* **Nguyên nhân**: Bucket `avatars` hoặc `gallery` chưa được tạo hoặc RLS Storage chưa bật.
* **Cách khắc phục**: Chạy phần cấu hình STORAGE BUCKETS ở cuối file [docs/schema.sql](file:///home/qd/project/own/giapha-os/docs/schema.sql#L327).

---

## 7. Quy Trình Triển Khai & Nâng Cấp (Deployment)

### Option A: Deploy Vercel (Khuyên dùng)
1. Kết nối kho lưu trữ GitHub chứa nhánh `custom` hoặc `main` với Vercel.
2. Thiết lập Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`).
3. Vercel sẽ tự động trigger build và deploy mỗi khi push commit mới.

### Option B: Standalone Node Server / Docker
Đặt biến `BUILD_STANDALONE=1` trong file `.env` khi chạy `next build`. Thư mục `.next/standalone` sẽ tạo ra ứng dụng độc lập tối ưu dung lượng để chạy trên Server/Docker container.

---

*Tài liệu được cập nhật tự động & bảo trì bởi Antigravity Agent.*
