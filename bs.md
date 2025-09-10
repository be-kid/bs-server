# bs-server

Brain Spaghetti

포스팅한 글들을 AI로 연관지어 브레인스토밍, 마인드맵의 형태로 보여주기
포스팅 내용들을 토대로 유저를 나타내는 간략한 문장을 AI로 만들어주기
ex. 사는게 너무 힘든 개발자

NestJS + Supabase + AI 등 사용 예정

기능 / API 목록
USER 관련
[] 회원가입
[] 회원탈퇴
[] 로그인
[] 로그아웃
[] 프로필조회
[] 프로필수정

POST 관련
[] 포스트작성
[] 포스트수정
[] 포스트삭제
[] 포스트조회(리스트)
[] 포스트상세

실행
docker compose up -d --build (watch mode)
-d : 백그라운드 실행, 미포함 시 터미널 실행
