<img src="https://raw.githubusercontent.com/friend1019/moneyway-react/master/public/images/moneyway.png" height="100" width="100"/>

# ✈️예산 기반 AI 여행 플랫폼 "MONEYWAY"
### 🏆**2025 관광 데이터 활용 공모전(한국관광공사 X 카카오 공동주관) [우수상] 수상**

![alt text](/image/main/main.png)

<br>

## 프로젝트 소개

- **MoneyWay**는 예산 기반 AI 추천을 통해 효율적으로 **제주 여행을 계획하고 시뮬레이션**할 수 있는 플랫폼입니다.
- **사용자가 여행 예산과 기간을 입력**하면 **AI가 자동으로 일정**을 추천합니다
- 마음에 드는 맛집·명소·숙소 카드를 **장바구니에 담아 드래그 앤 드롭으로 시간표를 완성**할 수 있습니다. 완성된 계획은 지도 위에 최적의 동선으로 시각화되어 한눈에 확인할 수 있습니다.
- **MoneyWay 커뮤니티에서 다른 여행자의 생생한 경험담과 유용한 팁을 참고**할 수 있습니다.
- 최종 완성된 일정은 **'내 계획' 페이지에 저장하여 언제든지 확인**하고 수정할 수 있습니다

<br>

## 팀원 구성

<div align="left">

| **최지인** | **김연희** | 
| :------: |  :------: | 
| [<img src="https://avatars.githubusercontent.com/u/181731484?v=4" height=150 width=150> <br/> @friend1019](https://github.com/friend1019) | [<img src="https://avatars.githubusercontent.com/u/133519559?v=4" height=150 width=150> <br/> @yonheeee](https://github.com/yonheeee) 

</div>

<br>

## 1. 개발 환경

- Front : React
- Back-end : 제공된 API 활용
- 버전 및 이슈관리 : Github, Github Issues, Github Project
- 협업 툴 : Discord, Notion
- 디자인 : [Figma](https://www.figma.com/design/VtuG71ZL7hq6lxzYBZKkow/MONEYWAY?node-id=2485-1308&t=V8CmYF5isiFx8UGO-0)
<br>

## 2. 채택한 개발 기술과 브랜치 전략

### React, styled-component

- React
    - 컴포넌트화를 통해 추후 유지보수와 재사용성을 고려했습니다.
    - 유저 배너, 상단과 하단 배너 등 중복되어 사용되는 부분이 많아 컴포넌트화를 통해 리소스 절약이 가능했습니다.
- styled-component
    - props를 이용한 조건부 스타일링을 활용하여 상황에 알맞은 스타일을 적용시킬 수 있었습니다.
    - 빌드될 때 고유한 클래스 이름이 부여되어 네이밍 컨벤션을 정하는 비용을 절약할 수 있었습니다.
    - S dot naming을 통해 일반 컴포넌트와 스타일드 컴포넌트를 쉽게 구별하도록 했습니다.
    
### Recoil

- 최상위 컴포넌트를 만들어 props로 유저 정보를 내려주는 방식의 경우 불필요한 props 전달이 발생합니다. 따라서, 필요한 컴포넌트 내부에서만 상태 값을 가져다 사용하기 위해 상태 관리 라이브러리를 사용하기로 했습니다.
- Redux가 아닌 Recoil을 채택한 이유
    - Recoil은 React만을 위한 라이브러리로, 사용법도 기존의 useState 훅을 사용하는 방식과 유사해 학습비용을 낮출 수 있었습니다.
    - 또한 Redux보다 훨씬 적은 코드라인으로 작동 가능하다는 장점이 있었습니다.


### 브랜치 전략

- GitHub Flow 기반의 브랜치 전략을 사용했습니다.
- 각 작업은 기능 단위로 브랜치를 생성하여 개발을 진행하고, Pull Request를 통해 코드 리뷰 후 main(master) 브랜치에 병합했습니다.
- PR 과정에서 팀원 간 피드백을 반영하여 코드 품질을 개선했습니다.

  - **main(master)** 브랜치: 최종 코드가 반영되는 브랜치
  - **feature 브랜치**: 기능 단위 개발 브랜치 (작업 후 삭제)

<br>

## 3. 프로젝트 구조

```
├── README.md
├── .firecaserc
├── .gitgnore
├── firebase.jsom
├── package-lock.json
├── package.json
├── pglite-debug.log
|
├── public
│    └── images
|         └── moneyway.png
|    
|
└── src
    ├── api
    │   ├── authStore.js        # 인증 상태 관리
    │   ├── axios.js            # Axios 인스턴스 설정
    │   ├── tourApi.js          # 여행 관련 API
    │   └── userStore.js        # 사용자 상태 관리
    │
    ├── component
    │   ├── aiplan             # AI 여행 계획 관련 컴포넌트
    │   ├── common             # 공통 레이아웃 및 UI 컴포넌트
    │   ├── community          # 커뮤니티 기능 관련 컴포넌트
    │   ├── login              # 로그인/회원가입 관련 컴포넌트
    │   ├── main               # 메인 화면 관련 컴포넌트
    │   ├── mypage             # 마이페이지 관련 컴포넌트
    │   ├── myplan             # 내 여행 계획 관련 컴포넌트
    │   ├── search             # 검색 관련 컴포넌트
    │   └── shopping           # 장바구니/쇼핑 관련 컴포넌트
    │
    ├── css                   # 스타일 파일
    |   ├── aiplan            
    │   ├── common            
    │   ├── community         
    │   ├── login              
    │   ├── main              
    │   ├── mypage             
    │   ├── myplan            
    │   ├── search           
    │   └── shopping   
    |       
    ├── images                # 이미지 리소스
    ├── App.js                # 메인 App 컴포넌트
    ├── Router.jsx            # 라우터 설정
    ├── ProtectedRoute.jsx    # 인증 기반 라우트 보호
    ├── index.js              # 앱 실행 진입점
    └── setupProxy.js         # 프록시 설정
```

<br>

## 4. 개발 기간 및 작업 관리

### 개발 기간

- 전체 개발 기간 : 2025-04 ~ 2025-09
- UI 구현 : 2025-04 ~ 2025-09
- 기능 구현 : 2025-04 ~ 2025-09

<br>

### 작업 관리

- Figma와  Notion를 사용하여 진행 상황을 공유했습니다.
- 주간회의를 진행하며 작업 순서와 방향성에 대한 고민을 나누고 Notion에 회의 내용을 기록했습니다.

<br>

## 5. 페이지별 기능

### [초기화면]
- 카트 채우기 클릭 시, 계획 추가 페이지로 이동합니다.
- 플랜 만들기 클릭 시, 시간표 페이지로 이동합니다.
- 게시판의 글을 카드 형태로 볼 수 있습니다
  - 카드를 클릭 시, 해당 게시물로 이동합니다.

| 초기화면 |
|----------|
![alt text](/image/main/mainpage1.png)
![alt text](/image/main/mainpage2.png)
![alt text](/image/main/mainpage3.png)
![alt text](/image/main/mainpage4.png)

<br>

### [사용자 로그인 전]
- 카카오톡 아이콘을 클릭 시, 카카오톡으로 회원가입 가능합니다.
- 이메일로 가입하기를 클릭 시, 이메일로 회원가입이 가능합니다.
- 로그인 버튼을 클릭 시, 로그인으로 이동합니다.

| 사용자 로그인 전 |
|----------|
|![join](/image/login/kakaologin.png)|

<br>

### [회원가입]
- **실시간 유효성 검사**
  - 이메일 주소와 비밀번호 입력 시, 별도의 확인 버튼 없이 입력창에서 즉시 유효성 검사가 진행됩니다.
  - 검사 결과에 따라 통과하지 못한 경우, 각 입력창 하단에 즉각적인 경고 문구가 표시되어 빠른 수정을 유도합니다.
- **예외 처리**
  - 이메일: 형식이 올바르지 않거나 이미 등록된(중복된) 이메일일 경우 경고 문구가 나타납니다.
  - 비밀번호: 보안 기준(6자 미만 등)에 미달할 경우 하단에 안내 메시지가 표시됩니다.
- **버튼 활성화 및 완료**
  - 모든 필드의 작성이 완료되고 유효성 검사를 최종 통과하면, 비활성화되어 있던 하단 가입하기(다음) 버튼이 활성화됩니다.
  - 활성화된 버튼을 클릭하면 가입 처리가 완료되며 즉시 메인 화면으로 진입합니다.

| 회원가입 |
|----------|
|![join](/image/login/loginfirst.png)|
|![join](/image/login/logining.png)|
|![join](/image/login/wronglogin.png)|


<br>

### [로그인]
- **사용자 인증**
  - 등록된 이메일과 비밀번호를 입력하여 로그인을 시도합니다.
- **실시간 유효성 검사 및 에러 피드백**
  - 로그인 시도 시 서버 데이터와 대조하여 일치하는 계정이 없는 경우, 즉시 피드백을 제공합니다.
  - 계정 확인: 존재하지 않는 이메일이거나 정보가 일치하지 않을 경우, 입력창 하단에 빨간색 경고 문구(존재하지 않는 계정입니다.)와 함께 입력창 테두리를 강조하여 가시성을 높였습니다.
- **로그인 완료**
  - 인증에 성공하면 사용자 세션 또는 토큰을 저장하고 서비스의 메인 화면으로 이동합니다.
- **추가 내비게이션**
  - 비밀번호를 잊어버린 사용자를 위해 하단에 '비밀번호 찾기' 링크를 배치하여 접근성을 높였습니다.

| 로그인 |
|----------|
|![login](/image/login/mainlogin.png)|
|![login](/image/login/errorlogin.png)|

<br>

### [비밀번호 찾기, 비밀번호 재설정]
- 인증 코드 발송
  - 가입 시 사용한 이메일 주소를 입력하면, 해당 메일로 5자리 재설정 코드가 발송됩니다.

- 코드 확인 
  - 메일로 받은 인증 코드를 5개의 입력 칸에 정확히 입력하여 본인 인증을 완료합니다.

- 새 비밀번호 설정
  - 인증 성공 시 새 비밀번호 입력 창으로 전환되며, 비밀번호 확인 과정을 거쳐 최종적으로 재설정을 완료합니다.

| 비밀번호 찾기 |
|----------|
|![findpassword](/image/login/forgetmain.png)|
|![findpassword](/image/login/forgetwrite.png)|
|![findpassword](/image/login/forgetcode.png)|
|![findpassword](/image/login/changepassword.png)|

<br>

### [계획 추가]
- 스마트 검색 및 필터링
  - 카테고리별 탐색
    - 식당, 카페, 관광지, 액티비티, 숙소 등 카테고리 버튼을 통해 원하는 유형의 장소를 빠르게 분류할 수 있습니다.
  - 정렬 필터
    - 추천순, 거리순, 별점순, 리뷰순 등 다양한 정렬 기준을 적용하여 최적의 장소를 선택할 수 있습니다.

- 장소 상세 정보 제공
  - 특정 장소를 선택하면 해당 장소의 주소, 영업시간, 상세 소개를 확인할 수 있습니다.
  - 리뷰 확인
    - 다른 사용자들이 남긴 별점과 리뷰를 참고하여 장소의 분위기와 품질을 미리 파악합니다.

- 길찾기 및 공유
  - 선택한 장소로 이동하기 위한 경로 찾기 기능을 지원합니다.
  - 마음에 드는 장소는 하트 아이콘을 눌러 저장하거나, 외부로 공유할 수 있습니다.

- 지도 연동
  - 검색 결과와 장소 위치가 우측 지도 인터페이스에 실시간 마커로 표시됩니다.
  - 지도를 통해 주변 지형과 다른 장소와의 거리를 직관적으로 확인하며 동선을 계획할 수 있습니다.

| 계획 추가 |
|----------|
|![plan](/image/map/map.png)|
|![plan](/image/map/addplan.png)|
|![plan](/image/map/detailmap.png)|

<br>

### [계획 장바구니]
- 자신이 팔로우 한 유저의 게시글이 최신순으로 보여집니다.
- 팔로우 한 유저가 없거나, 팔로워의 게시글이 없을 경우 검색 버튼이 표시됩니다.
- 게시글의 상단 유저 배너 클릭 시 게시글을 작성한 유저의 프로필 페이지로, 본문 클릭 시 게시글 상세 페이지로 이동합니다.

| 계획 장바구니 | 
|----------|
|![cart](/image/cart/cartdefault.png)|
|![cart](/image/cart/cartadd.png)|

<br>

### [시간표]
- 사용자 이름 혹은 계정 ID로 유저를 검색할 수 있습니다.
- 검색어와 일치하는 단어는 파란색 글씨로 표시됩니다.
- 클릭 시 해당 유저의 프로필 페이지로 진입합니다.

| 시간표 |
|----------|
|![schedule](/image/schedule/scheduledefault.png)|
|![schedule](/image/schedule/scheduletime.png)|
|![schedule](/image/schedule/schedule.png)|
|![schedule](/image/schedule/overmoney.png)|
|![schedule](/image/schedule/deleteschedule.png)|

<br>

### [시간표 목록]
- 사용자 이름 혹은 계정 ID로 유저를 검색할 수 있습니다.
- 검색어와 일치하는 단어는 파란색 글씨로 표시됩니다.
- 클릭 시 해당 유저의 프로필 페이지로 진입합니다.

| 시간표 목록 |
|----------|
|![schedule list](/image/schedule/emptyschedule.png)|
|![schedule list](/image/schedule/schedulelist.png)|
|![schedule list](/image/schedule/deletelist.png)|


<br>

### [AI 시간표]
- 사용자 이름 혹은 계정 ID로 유저를 검색할 수 있습니다.
- 검색어와 일치하는 단어는 파란색 글씨로 표시됩니다.
- 클릭 시 해당 유저의 프로필 페이지로 진입합니다.

| AI 시간표 |
|----------|
|![aiplan](/image/AIplan/aimoney.png)|
|![aiplan](/image/AIplan/aiperiod.png)|
|![aiplan](/image/AIplan/ainame.png)|

<br>

### [게시판]
- 사용자 이름 혹은 계정 ID로 유저를 검색할 수 있습니다.
- 검색어와 일치하는 단어는 파란색 글씨로 표시됩니다.
- 클릭 시 해당 유저의 프로필 페이지로 진입합니다.

| 게시판 |
|----------|
|![community](/image/community/communitydefault.png)|
|![community](/image/community/communitywrite.png)|
|![community](/image/community/writecommunity.png)|


<br>

### [마이페이지]
- 사용자 이름 혹은 계정 ID로 유저를 검색할 수 있습니다.
- 검색어와 일치하는 단어는 파란색 글씨로 표시됩니다.
- 클릭 시 해당 유저의 프로필 페이지로 진입합니다.

| 마이페이지 |
|----------|
|![mypage](/image/mypage/mypagedefault.png)|
|![mypage](/image/mypage/scrapt.png)|
|![mypage](/image/mypage/scrapt.png)|
|![mypage](/image/mypage/edit.png)|


<br>

### [튜토리얼]
- 사용자 이름 혹은 계정 ID로 유저를 검색할 수 있습니다.
- 검색어와 일치하는 단어는 파란색 글씨로 표시됩니다.
- 클릭 시 해당 유저의 프로필 페이지로 진입합니다.

| 튜토리얼 |
|----------|
|![tutorial](/image/tutorial/tutorial1.png)|
|![tutorial](/image/tutorial/tutorial2.png)|
|![tutorial](/image/tutorial/tutorial3.png)|
|![tutorial](/image/tutorial/tutorial4.png)|
|![tutorial](/image/tutorial/tutorial5.png)|

<br>

### [상단 및 배너]
- 사용자 이름 혹은 계정 ID로 유저를 검색할 수 있습니다.
- 검색어와 일치하는 단어는 파란색 글씨로 표시됩니다.
- 클릭 시 해당 유저의 프로필 페이지로 진입합니다.

| 상단 및 배너 |
|----------|
|![header](/image/template/header.png)|
|![header](/image/template/side.png)|


<br>





