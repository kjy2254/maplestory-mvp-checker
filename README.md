# Nexon MVP Analyzer

넥슨 결제 사용 내역을 기반으로 메이플스토리 MVP 등급을 분석하고, 다음주 예상 등급과 예상 등급 하락일을 보여주는 Chrome 확장프로그램입니다.

## 개발 실행 방법

1. Chrome에서 `chrome://extensions` 접속
2. 우측 상단 `개발자 모드` 활성화
3. `압축해제된 확장 프로그램을 로드` 클릭
4. 이 프로젝트 폴더 선택
5. `https://payment.nexon.com/` 접속 후 로그인
6. 우측 하단 `MVP 분석` 버튼 클릭

## 파일 구조

```text
nexon-mvp-analyzer/
├─ manifest.json
├─ src/
│  ├─ constants.js   # 상수, 등급 기준
│  ├─ utils.js       # 날짜/금액 유틸
│  ├─ api.js         # 넥슨 GraphQL 요청
│  ├─ mvp.js         # MVP 주차/등급 계산
│  ├─ ui.js          # 패널/템플릿 렌더링
│  ├─ content.js     # 실행 진입점
│  └─ content.css    # 확장프로그램 UI 스타일
└─ README.md
```

## 주의

로그인 쿠키나 세션값을 코드에 저장하지 않습니다. 사용자가 넥슨 결제 페이지에 로그인한 상태에서 브라우저의 기존 세션을 사용해 요청합니다.
