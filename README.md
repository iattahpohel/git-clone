# Git Clone - Implementation in TypeScript

Một bản clone của Git được viết bằng TypeScript, giúp hiểu rõ cách Git hoạt động bên trong.

## 📋 Tổng quan

Dự án này triển khai các tính năng cốt lõi của Git:

- Quản lý objects (blob, tree, commit)
- Quản lý refs (branches, tags)
- Index/staging area
- Workspace management
- Các lệnh CLI cơ bản

## 🏗️ Cấu trúc dữ liệu

### 1. Git Objects

Git lưu trữ dữ liệu dưới dạng objects trong `.git/objects/`:

#### **Blob Object**

- Lưu trữ nội dung file
- Hash: SHA-1 của nội dung
- Format: `blob <size>\0<content>`

#### **Tree Object**

- Lưu trữ cấu trúc thư mục
- Mỗi entry chứa: mode, name, hash của object con
- Format: `tree <size>\0<entries>`

#### **Commit Object**

- Lưu trữ metadata của commit
- Chứa: tree hash, parent commits, author, message
- Format: `commit <size>\0tree <hash>\nparent <hash>\n...`

### 2. Refs (References)

Refs là con trỏ đến commits:

- **Branches**: `.git/refs/heads/<branch-name>`
- **Tags**: `.git/refs/tags/<tag-name>`
- **HEAD**: `.git/HEAD` - trỏ đến branch hiện tại

### 3. Index (Staging Area)

File `.git/index` lưu trữ:

- Danh sách files đã staged
- Hash của từng file
- Timestamp và metadata
- Format binary với header và entries

### 4. Workspace

Thư mục làm việc chứa:

- Files thực tế của project
- `.git/` directory với tất cả metadata

## 📁 Cấu trúc thư mục dự án

```
git-clone/
├── src/
│   ├── core/
│   │   ├── object.ts          # Git objects (blob, tree, commit)
│   │   ├── hash.ts             # SHA-1 hashing
│   │   ├── compression.ts      # Zlib compression/decompression
│   │   └── storage.ts          # Object storage trong .git/objects
│   ├── refs/
│   │   ├── refs.ts             # Quản lý branches và tags
│   │   └── head.ts             # HEAD pointer
│   ├── index/
│   │   └── index.ts            # Staging area management
│   ├── workspace/
│   │   └── workspace.ts        # File system operations
│   ├── commands/
│   │   ├── init.ts             # git init
│   │   ├── add.ts              # git add
│   │   ├── commit.ts           # git commit
│   │   ├── status.ts           # git status
│   │   ├── log.ts              # git log
│   │   └── checkout.ts         # git checkout
│   ├── utils/
│   │   ├── path.ts             # Path utilities
│   │   └── config.ts           # Git config
│   └── cli.ts                  # CLI entry point
├── dist/                       # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Quy trình hoạt động

### 1. **git init**

- Tạo `.git/` directory
- Tạo các thư mục: `objects/`, `refs/heads/`, `refs/tags/`
- Khởi tạo `HEAD` trỏ đến `refs/heads/main`
- Tạo file `config` cơ bản

### 2. **git add <file>**

- Đọc file từ workspace
- Tạo blob object từ nội dung
- Nén và lưu vào `.git/objects/`
- Thêm entry vào index với hash và metadata

### 3. **git commit**

- Đọc index để lấy danh sách files
- Tạo tree object từ index
- Tạo commit object với:
  - Tree hash
  - Parent commit (nếu có)
  - Author và timestamp
  - Commit message
- Lưu commit object
- Cập nhật HEAD và branch ref

### 4. **git status**

- So sánh workspace với index
- So sánh index với HEAD commit
- Hiển thị: untracked, modified, staged files

### 5. **git log**

- Đọc HEAD ref
- Traverse commit chain qua parent links
- Hiển thị commit history

## 🚀 Sử dụng

```bash
# Build project
npm install
npm run build

# Run commands
npm run dev init
npm run dev add <file>
npm run dev commit -m "message"
npm run dev status
npm run dev log
```

## 📚 Tài liệu tham khảo

- [Git Internals - Pro Git Book](https://git-scm.com/book/en/v2/Git-Internals)
- [Git from the Bottom Up](https://jwiegley.github.io/git-from-the-bottom-up/)
- [Git Objects Documentation](https://git-scm.com/docs/gitrepository-layout)
