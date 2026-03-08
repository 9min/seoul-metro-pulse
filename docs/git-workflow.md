# Git 워크플로우

## 브랜치 전략 (GitHub Flow)

### 메인 브랜치

- `main`: 프로덕션 브랜치. 항상 배포 가능한 상태를 유지한다.

### 작업 브랜치 네이밍

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `feature/` | 새로운 기능 개발 | `feature/user-login` |
| `fix/` | 버그 수정 | `fix/token-expiry-redirect` |
| `hotfix/` | 프로덕션 긴급 수정 | `hotfix/critical-auth-error` |
| `refactor/` | 리팩토링 | `refactor/api-client-structure` |
| `docs/` | 문서 작업 | `docs/api-documentation` |
| `chore/` | 설정, 의존성 등 | `chore/update-dependencies` |

### 브랜치 네이밍 규칙

- 소문자와 하이픈(`-`)만 사용한다.
- 간결하되 작업 내용을 명확히 표현한다.
- 이슈 번호가 있는 경우 포함한다: `feature/123-user-login`

## PR 프로세스

### 1. 브랜치 생성

```bash
git checkout main
git pull origin main
git checkout -b feature/기능명
```

### 2. 작업 및 커밋

- [커밋 컨벤션](commit-convention.md)을 따른다.
- 작업 단위별로 커밋을 분리한다.

### 3. PR 생성

- PR 제목은 작업 내용을 간결하게 요약한다.
- PR 본문에 다음을 포함한다:
  - 변경 사항 요약
  - 테스트 방법
  - 관련 이슈 번호 (있는 경우)
  - 스크린샷 (UI 변경 시)

### 4. 코드 리뷰

- 최소 1명 이상의 승인을 받는다.
- [코드 리뷰 체크리스트](code-review-checklist.md)를 참고한다.
- 리뷰 코멘트에 대해 모두 응답한다.

### 5. 머지

- Squash and Merge를 기본으로 사용한다.
- 머지 후 작업 브랜치를 삭제한다.

## 브랜치 보호 규칙

`main` 브랜치에 다음 보호 규칙을 적용한다:

- 직접 푸시 금지 (PR을 통해서만 머지)
- 최소 1명의 리뷰 승인 필요
- 상태 체크 통과 필수 (CI/CD)
- 리뷰 승인 후 새 커밋 시 재승인 필요

## 관련 문서

- [커밋 컨벤션](commit-convention.md)
- [코드 리뷰 체크리스트](code-review-checklist.md)
- [CI/CD 가이드](cicd-guide.md)
