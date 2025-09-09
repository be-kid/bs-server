# Dockerfile

# 1. 베이스 이미지 설정
FROM node:20 AS development

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. package.json 및 package-lock.json 복사
COPY package*.json ./

# 4. 의존성 설치
RUN npm install

# 5. 소스 코드 복사
COPY . .

# 6. 애플리케이션 빌드
RUN npm run build

# 7. 프로덕션 환경 설정
FROM node:20-slim AS production

# 8. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 9. 빌드된 파일 및 의존성 복사
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/package*.json ./

# 10. 프로덕션 애플리케이션 실행
CMD ["node", "dist/main"]
