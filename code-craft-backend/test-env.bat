@echo off
echo Testing environment variables...
echo.
echo MONGODB_URI: %MONGODB_URI%
echo JWT_SECRET: %JWT_SECRET%
echo PORT: %PORT%
echo NODE_ENV: %NODE_ENV%
echo.
echo Starting server with detailed logging...
npm run dev