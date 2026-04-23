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
- 서비스 접속 초기화면으로 splash 화면이 잠시 나온 뒤 다음 페이지가 나타납니다.
    - 로그인이 되어 있지 않은 경우 : SNS 로그인 페이지
    - 로그인이 되어 있는 경우 : README 홈 화면
- SNS(카카오톡, 구글, 페이스북) 로그인 기능은 구현되어 있지 않습니다.

| 초기화면 |
|----------|
![alt text](/image/main/mainpage1.png)
![alt text](/image/main/mainpage2.png)
![alt text](/image/main/mainpage3.png)
![alt text](/image/main/mainpage4.png)

<br>

### [사용자 로그인 전]
- 이메일 주소와 비밀번호를 입력하면 입력창에서 바로 유효성 검사가 진행되고 통과하지 못한 경우 각 경고 문구가 입력창 하단에 표시됩니다.
- 이메일 주소의 형식이 유효하지 않거나 이미 가입된 이메일일 경우 또는 비밀번호가 6자 미만일 경우에는 각 입력창 하단에 경구 문구가 나타납니다.
- 작성이 완료된 후, 유효성 검사가 통과된 경우 다음 버튼이 활성화되며, 버튼을 클릭하면 프로필 설정 화면이 나타납니다.

| 사용자 로그인 전 |
|----------|
|![join](/image/login/kakaologin.png)|

<br>

### [회원가입]
- 이메일 주소와 비밀번호를 입력하면 입력창에서 바로 유효성 검사가 진행되고 통과하지 못한 경우 각 경고 문구가 입력창 하단에 표시됩니다.
- 이메일 주소의 형식이 유효하지 않거나 이미 가입된 이메일일 경우 또는 비밀번호가 6자 미만일 경우에는 각 입력창 하단에 경구 문구가 나타납니다.
- 작성이 완료된 후, 유효성 검사가 통과된 경우 다음 버튼이 활성화되며, 버튼을 클릭하면 프로필 설정 화면이 나타납니다.

| 회원가입 |
|----------|
|![join](/image/login/loginfirst.png)|
|![join](/image/login/logining.png)|
|![join](/image/login/wronglogin.png)|


<br>

### [로그인]
- 이메일 주소와 비밀번호를 입력하면 입력창에서 바로 유효성 검사가 진행되고 통과하지 못한 경우 각 경고 문구가 입력창 하단에 표시됩니다.
- 이메일 주소의 형식이 유효하지 않거나 비밀번호가 6자 미만일 경우에는 각 입력창 하단에 경구 문구가 나타납니다.
- 작성이 완료된 후, 유효성 검사가 통과된 경우 로그인 버튼이 활성화됩니다.
- 로그인 버튼 클릭 시 이메일 주소 또는 비밀번호가 일치하지 않을 경우에는 경고 문구가 나타나며, 로그인에 성공하면 홈 피드 화면으로 이동합니다.

| 로그인 |
|----------|
|![login](/image/login/mainlogin.png)|
|![login](/image/login/errorlogin.png)|

<br>

### [비밀번호 찾기, 비밀번호 재설정]
- 상단 의 kebab menu를 클릭 후 나타나는 모달창의 로그아웃 버튼을 클릭하면 확인창이 뜹니다.
- 로그아웃시 로컬 저장소의 토큰 값과 사용자 정보를 삭제하고 초기화면으로 이동합니다.

| 비밀번호 찾기 |
|----------|
|![findpassword](/image/login/forgetmain.png)|
|![findpassword](/image/login/forgetwrite.png)|
|![findpassword](/image/login/forgetcode.png)|
|![findpassword](/image/login/changepassword.png)|

<br>

### [계획 추가]
- 상단 배너 : 각 페이지별로 다른 종류의 버튼을 가지고 있습니다.
    - 뒤로가기 : 브라우저 상에 기록된 이전 페이지로 돌아갑니다.
    - 검색 : 사용자 검색 페이지로 이동합니다.
    - 사용자 이름 : 채팅룸 페이지의 경우 상대방의 사용자 이름을 보여줍니다.
    - kebab menu : 각 페이지 또는 컴포넌트에 따른 하단 모달창을 생성합니다.
        - 상품, 댓글, 게시글 컴포넌트 - 삭제, 수정, 신고하기
        - 사용자 프로필 페이지 - 설정 및 사용자 정보, 로그아웃
- 하단 탭 메뉴 : 홈, 채팅, 게시물 작성, 프로필 아이콘을 클릭하면 각각 홈 피드, 채팅 목록, 게시글 작성 페이지, 내 프로필 페이지로 이동합니다.

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

#### [게시판]
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

#### 3. 좋아요와 댓글
- 좋아요와 댓글 수는 실시간으로 상세 페이지에 반영됩니다.
- 댓글이 몇 분 전에 작성되었는지 표시됩니다.
- 자신의 댓글일 경우 모달 버튼을 통해 삭제가 가능합니다.
- 타 유저의 댓글일 경우 모달 버튼을 통해 신고할 수 있습니다.

| 좋아요 & 댓글 |
|----------|
|![likeComment](https://user-images.githubusercontent.com/112460466/210382217-01d70181-91c3-43db-a1b8-409a612afb1c.gif)|

<br>

### [상품]

#### 1. 상품 등록
- 상품 이미지, 상품명, 가격, 판매 링크를 필수로 입력해야 저장 버튼이 활성화됩니다.
- 상품 가격은 숫자만 입력할 수 있으며, 숫자를 입력하면 자동으로 원 단위로 변환됩니다.
- 상품 가격이 0원일 경우 버튼이 비활성화되며 하단에 경고 문구가 나타납니다.
- 상품명과 판매 링크는 공백으로 시작할 수 없습니다.
- 상품 등록이 완료되면 내 프로필 페이지로 이동합니다.

| 상품 등록 |
|----------|
|![addProduct](https://user-images.githubusercontent.com/112460466/210386068-c6ff2e05-eb64-4abc-b6dc-93bf52b88d3f.gif)|

<br>

#### 2. 상품 수정 및 삭제
- 상품 이미지, 상품명, 가격, 판매 링크 중 한 가지를 수정하면 저장 버튼이 활성화됩니다.
- 상품 수정이 완료되면 내 프로필 페이지로 이동합니다.
- 상품 삭제 버튼 클릭 시, 상품을 삭제하고 페이지를 리렌더링하여 삭제된 내용을 페이지에 반영합니다.

| 상품 수정 & 삭제 |
|----------|
|![editDeleteProduct](https://user-images.githubusercontent.com/112460466/210386311-5fae87a7-745f-47c0-b8e3-fc41c65cb3cb.gif)|

<br>

### [채팅]
- 채팅 목록에서 아직 읽지 않은 채팅에는 좌측 상단의 파란색 알림을 띄워줍니다.
- 채팅방에서 메시지를 입력하거나 파일을 업로드하면 전송 버튼이 활성화됩니다.
- 채팅방에서 우측 상단의 채팅방 나가기 모달 버튼을 통해 채팅 목록 페이지로 이동할 수 있습니다.
- 채팅 메시지 전송 및 수신 기능은 개발 예정입니다.

| 채팅 |
|----------|
|![chat](https://user-images.githubusercontent.com/112460466/210386478-ea4877c5-1728-4872-ab50-a8408ddf6dcd.gif)|

<br>



