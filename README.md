This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Supabase)

Schema chỉ thay đổi qua migration trong `supabase/migrations/`. Không sửa tay DB trên dashboard, không sửa tay `src/server/supabase/database.types.ts`.

Lần đầu, link project Supabase (cần đăng nhập CLI):

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
```

Thêm thay đổi schema:

```bash
npx supabase migration new <ten_migration>   # tạo file SQL rỗng trong supabase/migrations/
# viết SQL vào file vừa tạo (nhớ bật RLS cho bảng mới)
npx supabase db push --remote --dry-run      # xem migration nào sẽ chạy
npm run db:push                              # áp migration lên project đã link
npm run db:types                             # gen lại types, commit cùng migration
```

Dữ liệu mẫu nằm ở `supabase/seeds/`. Muốn nạp kèm khi push: `npx supabase db push --remote --include-seed`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
