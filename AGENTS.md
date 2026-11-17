<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

# Janna Edu

## Sản phẩm
Web luyện thi IELTS cho trung tâm Janna Academy. Người dùng: Học sinh và Phụ huynh, đăng nhập bằng Google.
Module:
1. Tài khoản: Google OAuth, role student | parent, phụ huynh link với học sinh.
2. Phòng thi ảo Reading/Listening: 1–2 đề, đếm giờ, đánh dấu (flag) câu hỏi, autosave, nộp bài rồi chấm theo đáp án, quy ra band.
3. AI giám khảo: chấm Writing; ghi âm và chấm Speaking; báo cáo band score và phân tích lỗi.
4. Lộ trình học: sinh ra từ kết quả thi, có nhận xét AI cho học sinh và phụ huynh.
5. View phụ huynh: xem kết quả và lộ trình của con.
6. Trang tĩnh: giới thiệu Janna Academy, khóa học, sách & tài liệu (có gợi ý từ AI).


## Stack
- Next.js App Router + TypeScript, dùng cho cả FE và BE (route handlers).
- Supabase: Postgres, Auth (Google), Storage (audio Listening, file ghi âm Speaking).
- zod để validate và định nghĩa contract API.
- Deploy: Docker lên VPS.

## Nguyên tắc code
- Contract-first: mọi API có zod schema cho input/output ở file contract dùng chung. FE và BE cùng import file đó. Đổi API thì sửa contract trước.
- Route handler mỏng: parse input → gọi service trong server/ → trả output theo contract.
- Thay đổi DB chỉ qua `supabase migration new`. Sau khi đổi schema, gen lại types. Không sửa tay file types generated.
- Bám theo cấu trúc thư mục hiện có của project. Nếu cần thêm folder mới thì đề xuất trước.

## Bảo mật (bắt buộc)
- Bật RLS cho MỌI bảng. User chỉ truy cập dữ liệu của mình; phụ huynh chỉ đọc dữ liệu của học sinh đã link.
- answer_keys và các dữ liệu nhạy cảm: bật RLS, không tạo policy. Chỉ server đọc bằng service_role.
- service_role key và AI API key chỉ dùng phía server, không bao giờ để prefix NEXT_PUBLIC_.
- API lấy đề không bao giờ trả kèm đáp án.
- Timer do server quyết định (dựa vào started_at). Quá giờ thì server tự khóa bài, không tin thời gian client gửi lên.
