# 위싱 찬양팀 로테이션

위싱 찬양팀 예배 로테이션을 공유하고 관리하는 웹앱입니다.

## 스택

- **Next.js 16** (App Router + Server Actions)
- **TypeScript**
- **Tailwind CSS**
- **Drizzle ORM** (Neon PostgreSQL)
- **Better Auth** (인증)

## 로컬 개발

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에서 비밀번호 및 시크릿 수정

# 3. 데이터베이스 초기화
npm run db:push

# 4. 샘플 데이터 삽입 (3월 로테이션표)
npm run db:seed

# 5. 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 관리자 접속

- URL: `/admin`
- 비밀번호: `.env`의 `ADMIN_PASSWORD` 값

## Vercel 배포

1. [Neon](https://neon.tech) 또는 [Supabase](https://supabase.com)에서 무료 PostgreSQL 데이터베이스 생성

2. Vercel 환경 변수 설정:
   - `DATABASE_URL` - PostgreSQL 연결 문자열
   - `BETTER_AUTH_SECRET` - 랜덤 시크릿 (`openssl rand -base64 32`)
   - `BETTER_AUTH_URL` - 배포 URL (예: `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` - 배포 URL
   - `ADMIN_EMAIL` - 관리자 이메일
   - `ADMIN_PASSWORD` - 강력한 비밀번호

## 역할 구성

| 섹션 | 역할 |
|------|------|
| 악기 | Lead Synth, Aux Synth, Bass G., Electric G., Acoustic G., Worship Leader |
| 리듬/지원 | Drum, Sound Engineer, Singers |