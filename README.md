# 실시간 협업 칸반 보드

> 다중 사용자 환경에서 실시간 동기화를 지원하는 칸반 보드 웹 애플리케이션


## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [데이터 모델 설계](#데이터-모델-설계)
- [핵심 기술 구현](#핵심-기술-구현)
- [실행 방법](#실행-방법)
- [API 문서](#api-문서)
- [AI 활용 내역](#ai-활용-내역)

---

## 프로젝트 소개

여러 사용자가 동시에 작업할 수 있는 실시간 협업 칸반 보드입니다. 드래그 앤 드롭으로 태스크 상태를 변경하면 다른 사용자 화면에도 즉시 반영되며, 동시 수정으로 인한 데이터 충돌을 방지하는 동시성 제어 기능을 구현했습니다.

---

## 기술 스택

### Frontend
| 기술 | 사용 목적 |
|------|----------|
| React | UI 라이브러리 |
| TypeScript | 타입 안정성 |
| Vite | 빌드 도구 (SWC 컴파일러) |
| TanStack Query | 서버 상태 관리 |
| Zustand | 클라이언트 상태 관리 |
| Tailwind CSS | 스타일링 |
| dnd-kit | 드래그 앤 드롭 |
| Axios | HTTP 클라이언트 |

### Backend
| 기술 | 사용 목적 |
|------|----------|
| NestJS | 백엔드 프레임워크 |
| TypeScript | 타입 안정성 |
| MikroORM | ORM (Optimistic Lock 지원) |
| PostgreSQL | 데이터베이스 |
| Passport | 인증 미들웨어 |
| LexoRank | 순서 정렬 알고리즘 |
| Swagger | API 문서화 |

### DevOps
| 기술 | 사용 목적 |
|------|----------|
| Docker | 컨테이너화 |
| Docker Compose | 멀티 컨테이너 오케스트레이션 |

---

### 데모

| 로그인 | 칸반 보드 |
|--------|----------|
| ![Login](https://via.placeholder.com/400x300?text=Login+Page) | ![Board](https://via.placeholder.com/400x300?text=Kanban+Board) |

---

## 주요 기능

###  사용자 인증
- JWT 기반 회원가입 / 로그인 / 로그아웃
- Passport.js를 활용한 인증 미들웨어
- bcrypt를 이용한 비밀번호 해싱

### 워크스페이스 관리
- 워크스페이스 생성, 수정, 삭제 (CRUD)
- 테스크는 워크스페이스 단위로 관리됩니다.

###  태스크 관리
- 태스크 생성, 수정, 삭제 (CRUD)
- TODO → DOING → DONE 상태 관리
- 제목 및 생성자 기준 실시간 검색 (디바운스 적용)

###  실시간 동기화
- **SSE (Server-Sent Events)** 기반 실시간 업데이트
- 다른 사용자의 변경사항 즉시 반영
- NestJS Event Emitter를 활용한 이벤트 기반 아키텍처

###  드래그 앤 드롭
- dnd-kit 라이브러리 활용
- 컬럼 간 이동 및 컬럼 내 순서 변경
- Optimistic UI 적용으로 즉각적인 피드백

###  동시성 제어
- **Optimistic Locking** (버전 기반 낙관적 잠금)
- **LexoRank** 알고리즘을 활용한 정렬 충돌 최소화

---



## 시스템 아키텍처


---

## 데이터 모델 설계



### 설계 결정 사항

#### User – Task 관계 (비식별 관계)
- User가 삭제되어도 Task는 유지되어야 하는 비즈니스 요구사항
- `deleteRule: 'set null'` 적용으로 User 삭제 시 Task의 user_id만 NULL 처리
- Task는 User의 생명주기에 종속되지 않음

#### 동시성 제어
- `version` 필드를 통한 Optimistic Locking
- 동시 수정 시 버전 불일치로 충돌 감지 → 사용자에게 재시도 안내
- LexoRank를 통한 position 값 관리로 정렬 충돌 최소화

---

## 핵심 기술 구현

### 1. 실시간 동기화 (SSE)

**왜 SSE를 선택했는가?**
- WebSocket 대비 구현 복잡도 낮음
- 서버 → 클라이언트 단방향 통신으로 충분
- HTTP/2 환경에서 효율적인 멀티플렉싱

**구현 방식**
```typescript
// Backend: Event Emitter를 통한 느슨한 결합
@Sse('events')
sse(): Observable<MessageEvent> {
  return fromEvent(this.eventEmitter, 'task.message').pipe(
    map((payload) => ({ data: payload }) as MessageEvent)
  );
}

// Task 변경 시 이벤트 발행
private emitChange(type: string, data: any) {
  this.eventEmitter.emit('task.message', { type, data });
}
```

```typescript
// Frontend: SSE 연결 및 상태 동기화
const handleEvent = (event: TaskSSEEvent) => {
  switch (event.type) {
    case 'create': addTask(event.data); break;
    case 'update':
    case 'move': updateTaskInList(event.data); break;
    case 'delete': removeTask(event.data.id); break;
  }
};
```

### 2. 동시성 제어 (Optimistic Locking + LexoRank)

**문제 상황**
- 여러 사용자가 동시에 같은 태스크를 수정할 때 데이터 일관성 문제
- 드래그 앤 드롭 시 순서 변경에 따른 position 값 충돌

**해결 방안**
```typescript
// MikroORM의 @Property({ version: true })를 활용한 자동 버전 관리
@Property({ version: true })
version!: number;

// 버전 불일치 시 예외 발생
try {
  await this.em.flush();
} catch (e) {
  if (e instanceof OptimisticLockError) {
    throw new ConflictException(
      '이미 다른 사용자에 의해 수정된 태스크입니다. 새로고침 후 다시 시도해주세요.'
    );
  }
}
```

**LexoRank 알고리즘**
```typescript
// 두 태스크 사이에 삽입 시 중간값 계산
if (prevRank && nextRank) {
  newPosition = prevRank.between(nextRank).toString();
} else if (prevRank) {
  newPosition = prevRank.genNext().toString();
} else if (nextRank) {
  newPosition = nextRank.genPrev().toString();
}
```
→ 기존 태스크의 position을 수정하지 않아 충돌 가능성 최소화

### 3. 상태 관리 전략

**서버 상태 (TanStack Query)**
- 태스크 목록 캐싱 및 자동 리페칭
- Mutation 성공/실패 시 캐시 무효화

**클라이언트 상태 (Zustand)**
- 드래그 중인 태스크 ID
- 검색어 상태
- Optimistic UI를 위한 로컬 상태

```typescript
// Optimistic Update 예시
const oldTask = updateTaskTitle(id, title); // 즉시 UI 반영
try {
  await mutateAsync({ id, title });
} catch {
  // 실패 시 롤백
  if (oldTask) updateTaskTitle(id, oldTask.title);
}
```

---

## 실행 방법

### 사전 요구사항
- Docker & Docker Compose
- Node.js 20+ (로컬 개발 시)

### Docker Compose로 실행 (권장)

```bash
# 1. 프로젝트 클론
git clone https://github.com/your-repo/project-kanban.git
cd project-kanban

# 2. 환경 변수 설정 (선택사항 - 기본값 제공)
# backend/.env.example과 frontend/.env.example 참고

# 3. 전체 서비스 실행
docker compose up -d

# 4. 접속
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# API 문서: http://localhost:3000/docs
```


## API 문서

서버 실행 후 Swagger UI에서 확인 가능합니다.

📄 **API 문서 URL**: http://localhost:3000/docs

### 주요 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | /auth/register | 회원가입 | - |
| POST | /auth/login | 로그인 (JWT 발급) | - |
| GET | /tasks | 태스크 목록 조회 (검색 지원) | 필요 |
| POST | /tasks | 태스크 생성 | 필요 |
| PATCH | /tasks/:id | 태스크 수정 | 필요 |
| PATCH | /tasks/:id/move | 태스크 이동 (상태/순서 변경) | 필요 |
| DELETE | /tasks/:id | 태스크 삭제 | 필요 |
| GET | /tasks/events | SSE 이벤트 스트림 | 필요 |

---

## 프로젝트 구조

```
project-kanban/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # 인증 모듈 (JWT, Passport)
│   │   │   ├── user/          # 사용자 모듈
│   │   │   ├── task/          # 태스크 모듈 (CRUD, SSE)
│   │   │   └── health/        # 헬스체크
│   │   ├── main.ts
│   │   └── mikro-orm.config.ts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/               # API 클라이언트
│   │   ├── components/        # UI 컴포넌트
│   │   ├── hooks/             # Custom Hooks
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── stores/            # Zustand 스토어
│   │   └── types/             # TypeScript 타입
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

