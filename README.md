# IWAS Frontend

Frontend cho hệ thống IWAS, xây dựng bằng React, TypeScript và Vite. Ứng dụng cung cấp các màn hình đăng nhập, dashboard, quản lý dự án, nhiệm vụ, thành viên, kỹ năng, thông báo realtime và workload.

## Mã nguồn

Repository này bao gồm toàn bộ mã nguồn frontend của đồ án:

- `src/`: mã nguồn ứng dụng React.
- `src/pages/`: các trang chính như dashboard, projects, tasks, workforce, members, settings.
- `src/features/`: logic theo domain, gồm auth, projects, tasks, workforce, members, skills, notifications, search.
- `src/components/`: component UI dùng chung.
- `src/layouts/`: layout xác thực và layout chính của ứng dụng.
- `src/lib/`: cấu hình thư viện dùng chung, gồm Axios và React Query.
- `src/store/`: global state dùng Zustand.
- `src/types/`: định nghĩa type TypeScript.
- `src/constants/`: enum và hằng số dùng chung.
- `src/styles/`: CSS toàn cục và override editor.

## Yêu cầu hệ thống

- Node.js 18 trở lên.
- npm 9 trở lên.
- Backend IWAS đang chạy và cung cấp REST API/WebSocket tương ứng.

## Cài đặt

```bash
npm install
```

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Trên Windows PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env
```

## Cấu hình môi trường

Các biến môi trường đang dùng:

| Biến | Mặc định | Mô tả |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:9090/api` | Base URL của backend REST API. |
| `VITE_WS_URL` | `ws://localhost:9090/ws` | WebSocket endpoint cho thông báo realtime. |

Frontend không kết nối trực tiếp đến cơ sở dữ liệu. Cấu hình database nằm ở backend. Để chạy đầy đủ hệ thống, cần khởi động backend trước và bảo đảm `VITE_API_BASE_URL` trỏ đúng đến API backend.

Nếu backend có tài khoản thử nghiệm, cấu hình hoặc seed data riêng, hãy dùng theo tài liệu/backend tương ứng. Repository frontend hiện không chứa thông tin tài khoản thử nghiệm cố định.

## Chạy hệ thống

Chạy môi trường phát triển:

```bash
npm run dev
```

Vite được cấu hình chạy ở:

```text
http://localhost:3000
```

Build production:

```bash
npm run build
```

Xem thử bản production build:

```bash
npm run preview
```

## Script

| Script | Lệnh | Mục đích |
| --- | --- | --- |
| `dev` | `vite` | Chạy dev server. |
| `build` | `vite build` | Build ứng dụng production. |
| `preview` | `vite preview` | Preview bản build production. |
| `lint` | `eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0` | Kiểm tra lint cho mã nguồn TypeScript/React. |
| `typecheck` | `tsc --noEmit` | Kiểm tra type TypeScript. |
| `check:no-js-source` | `node -e ...` | Đảm bảo không có file `.js` hoặc `.jsx` trong `src`. |

## Công nghệ và thư viện

### Core

| Công nghệ/thư viện | Phiên bản |
| --- | --- |
| React | `^18.2.0` |
| React DOM | `^18.2.0` |
| TypeScript | `^6.0.3` |
| Vite | `^5.0.11` |
| Tailwind CSS | `^3.4.1` |
| ESLint | `^8.56.0` |

### Runtime dependencies

| Thư viện | Phiên bản |
| --- | --- |
| `@blocknote/ariakit` | `^0.51.0` |
| `@blocknote/core` | `^0.51.0` |
| `@blocknote/react` | `^0.51.0` |
| `@dnd-kit/core` | `^6.1.0` |
| `@dnd-kit/sortable` | `^8.0.0` |
| `@dnd-kit/utilities` | `^3.2.2` |
| `@hookform/resolvers` | `^3.3.4` |
| `@stomp/stompjs` | `^7.3.0` |
| `@tanstack/react-query` | `^5.17.19` |
| `axios` | `^1.6.5` |
| `clsx` | `^2.1.0` |
| `dayjs` | `^1.11.10` |
| `fast-deep-equal` | `^3.1.3` |
| `lucide-react` | `^0.309.0` |
| `react-hook-form` | `^7.49.3` |
| `react-hot-toast` | `^2.4.1` |
| `react-router-dom` | `^6.20.1` |
| `recharts` | `^2.10.4` |
| `tailwind-merge` | `^2.2.0` |
| `use-sync-external-store` | `^1.6.0` |
| `zod` | `^3.22.4` |
| `zustand` | `^4.4.7` |

### Dev dependencies

| Thư viện | Phiên bản |
| --- | --- |
| `@types/node` | `^25.9.0` |
| `@types/react` | `^18.2.48` |
| `@types/react-dom` | `^18.2.18` |
| `@typescript-eslint/eslint-plugin` | `^8.59.4` |
| `@typescript-eslint/parser` | `^8.59.4` |
| `@vitejs/plugin-react` | `^4.2.1` |
| `autoprefixer` | `^10.4.17` |
| `eslint-plugin-react` | `^7.33.2` |
| `eslint-plugin-react-hooks` | `^4.6.0` |
| `eslint-plugin-react-refresh` | `^0.4.5` |
| `postcss` | `^8.4.33` |
| `ts-node` | `^10.9.2` |
