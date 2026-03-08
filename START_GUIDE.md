# 프로젝트 시작 가이드

이 문서는 **Claude Code가 새 프로젝트를 세팅할 때 읽고 따라야 하는 작업 지침서**입니다.
사용자가 프로젝트 주제를 알려주면, 이 가이드에 따라 문서를 수정/생성하고 초기 세팅을 진행합니다.

---

## 전체 흐름

```
Step 1. 사용자에게 프로젝트 정보 확인
Step 2. docs/prd.md 생성
Step 3. CLAUDE.md 수정
Step 4. docs/ 가이드 문서 프로젝트별 조정 (필요 시)
Step 5. 프로젝트 초기 코드 세팅
```

---

## Step 1. 사용자에게 프로젝트 정보 확인

아래 항목을 사용자에게 질문하여 확인한다. 사용자가 이미 제공한 정보는 다시 묻지 않는다.

### 필수 확인 항목

| 항목 | 질문 예시 |
|------|----------|
| 프로젝트명 | 프로젝트 이름이 무엇인가요? |
| 프로젝트 설명 | 어떤 서비스/앱을 만드나요? 한 줄로 설명해주세요. |
| 핵심 기능 | 주요 기능은 무엇인가요? (3~5개) |
| 목표 사용자 | 누가 사용하나요? |

### 선택 확인 항목 (사용자가 언급한 경우에만)

| 항목 | 기본값 |
|------|--------|
| 프론트엔드 프레임워크 | Vite + React + TypeScript |
| 백엔드(BaaS) | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| CSS 프레임워크 | Tailwind CSS |
| 상태 관리 | 없음 (사용자 지정 시 추가) |
| 배포 플랫폼 | Vercel (프론트엔드) + Supabase (백엔드) |
| 패키지 매니저 | npm |

---

## Step 2. docs/prd.md 생성

수집한 정보를 바탕으로 `docs/prd.md` 파일을 **새로 생성**한다.

### 파일 위치

```
docs/prd.md  (새로 생성)
```

### 작성 구조

```markdown
# PRD - [프로젝트명]

## 1. 프로젝트 개요
- 프로젝트의 목적과 배경
- 해결하려는 문제

## 2. 목표 사용자
- 대상 사용자 정의

## 3. 핵심 기능
- [ ] 기능 1: 설명
- [ ] 기능 2: 설명
- [ ] 기능 3: 설명

## 4. 사용자 스토리
- 사용자로서 ~를 하고 싶다. 그래서 ~할 수 있다.

## 5. 기술 스택
- 프론트엔드: ...
- 백엔드: ...
- 데이터베이스: ...
- 기타: ...

## 6. 비기능 요구사항
- 보안 요구사항
- 접근성 요구사항
- 성능 요구사항

## 7. 마일스톤
- v0.1: MVP (핵심 기능)
- v1.0: 정식 출시
```

### 작성 규칙

- 사용자가 제공한 정보를 기반으로 구체적으로 작성한다.
- 사용자가 언급하지 않은 항목은 합리적으로 추론하되, 추론한 내용임을 표시한다.
- 작성 후 사용자에게 검토를 요청한다.

---

## Step 3. CLAUDE.md 수정

기존 `CLAUDE.md`의 **상단 부분만** 프로젝트 정보에 맞게 수정한다.

### 수정할 항목

#### 3-1. 제목 변경

```markdown
# 변경 전
# CLAUDE.md - 프로젝트 공통 규칙

# 변경 후
# CLAUDE.md - [프로젝트명] 프로젝트 규칙
```

#### 3-2. 프로젝트 개요 추가 (기술 스택 섹션 위에 삽입)

```markdown
## 프로젝트 개요
[PRD에서 작성한 프로젝트 설명 1~2줄]
```

#### 3-3. 기술 스택 업데이트

사용자가 지정한 기술 스택으로 변경한다. 기본 스택(Vite, React, TypeScript, Supabase, Biome, Vitest, Vercel)에서 달라지는 부분만 수정한다.

추가될 수 있는 항목:
- 상태 관리 라이브러리
- CSS 프레임워크
- 기타 주요 라이브러리

#### 3-4. 프로젝트 고유 규칙 추가 (핵심 규칙 섹션 하단에 삽입)

프로젝트 특성에 따라 필요한 규칙을 추가한다. 예시:

```markdown
### 프로젝트 고유 규칙
- API 엔드포인트는 `/api/v1/` 접두사를 사용한다.
- 모든 API 응답은 `{ data, error, meta }` 형식을 따른다.
```

#### 3-5. docs/prd.md 참조 링크 추가

상세 문서 참조 테이블에 PRD 링크를 추가한다.

```markdown
| [docs/prd.md](docs/prd.md) | 제품 요구사항 문서 (PRD) |
```

### 수정하지 않는 항목

다음 항목들은 공통 규칙이므로 그대로 유지한다:

- 핵심 규칙 > 언어 (한국어)
- 핵심 규칙 > 코드 스타일 (네이밍 컨벤션 포함)
- 핵심 규칙 > 브랜치 전략
- 핵심 규칙 > 커밋 컨벤션
- 핵심 규칙 > 테스트
- 핵심 규칙 > 보안
- 핵심 규칙 > 에러 처리
- 상세 문서 참조 테이블 (기존 링크들)

---

## Step 4. docs/ 가이드 문서 프로젝트별 조정

대부분의 `docs/` 문서는 그대로 사용한다. **아래 조건에 해당하는 경우에만** 수정한다.

### 수정이 필요한 경우

| 문서 | 수정 조건 | 수정 내용 |
|------|----------|----------|
| `project-structure.md` | 모노레포가 아닌 경우, 또는 폴더 구조가 다른 경우 | 실제 프로젝트 구조에 맞게 변경 |
| `design-guide.md` | 디자인 시스템이 다른 경우 (색상, 폰트 등) | 프로젝트 브랜드에 맞게 변경 |
| `cicd-guide.md` | Vercel이 아닌 다른 배포 플랫폼 사용 시 | 배포 플랫폼에 맞게 변경 |
| `lint-config.md` | Biome 설정을 변경한 경우 | 변경된 설정 반영 |
| `dev-environment.md` | Node.js 버전, IDE 설정 등이 다른 경우 | 프로젝트 환경에 맞게 변경 |
| `state-management.md` | 상태 관리 라이브러리가 다른 경우 | 선택한 도구에 맞게 변경 |
| `data-modeling.md` | DB 설계 규칙이 다른 경우 | 프로젝트 규칙에 맞게 변경 |

### 수정하지 않는 문서

| 문서 | 이유 |
|------|------|
| `git-workflow.md` | GitHub Flow는 모든 프로젝트 공통 |
| `commit-convention.md` | 커밋 규칙은 모든 프로젝트 공통 |
| `testing-guide.md` | Vitest 전략은 모든 프로젝트 공통 |
| `security-guide.md` | 보안 규칙은 모든 프로젝트 공통 |
| `code-review-checklist.md` | 리뷰 기준은 모든 프로젝트 공통 |
| `error-handling.md` | 에러 처리 패턴은 모든 프로젝트 공통 |
| `performance-guide.md` | 성능 최적화 패턴은 모든 프로젝트 공통 |

---

## Step 5. 프로젝트 초기 코드 세팅

문서 정리가 완료되면, `docs/prd.md`와 `CLAUDE.md`를 기반으로 프로젝트 초기 코드를 세팅한다.

### 세팅 순서

```
1. package.json 생성 (npm init)
2. TypeScript 설정 (tsconfig.json)
3. Biome 설정 (biome.json) — docs/lint-config.md 참조
4. 폴더 구조 생성 — docs/project-structure.md 참조
5. 주요 의존성 설치 (@supabase/supabase-js 포함)
6. Supabase 초기화 (npx supabase init)
7. Supabase 클라이언트 설정 (src/lib/supabase.ts)
8. 환경변수 설정 (.env.example, .env.local) — docs/dev-environment.md 참조
9. 기본 설정 파일 생성 (.gitignore, .vscode/ 등)
10. 상태 관리 설정 (필요 시) — docs/state-management.md 참조
11. lefthook 설정 (pre-commit hook)
12. GitHub Actions CI 워크플로우 — docs/cicd-guide.md 참조
```

### .gitignore 필수 포함 항목

```
node_modules/
dist/
build/
.env
.env.local
.env*.local
coverage/
.next/
```

### .env.example 생성

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

프로젝트에 추가로 필요한 환경변수 키를 빈 값으로 나열한다.

---

## 체크리스트 (모든 단계 완료 후 확인)

- [ ] `docs/prd.md`가 생성되었는가?
- [ ] `CLAUDE.md` 제목에 프로젝트명이 반영되었는가?
- [ ] `CLAUDE.md` 기술 스택이 프로젝트에 맞게 업데이트되었는가?
- [ ] `CLAUDE.md` 상세 문서 참조 테이블에 `docs/prd.md` 링크가 추가되었는가?
- [ ] 수정한 `docs/` 문서가 `CLAUDE.md`와 모순되지 않는가?
- [ ] 개발 환경 셋업이 완료되었는가? (환경변수, IDE 설정)
- [ ] 프로젝트 초기 코드 세팅이 완료되었는가?
- [ ] 모든 문서가 한국어로 작성되었는가?
