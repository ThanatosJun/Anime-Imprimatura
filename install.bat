@echo off

REM 安裝根目錄的依賴
:install_python
echo Installing root dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 exit /b %errorlevel%

REM 安裝 Node.js 依賴
:install_nodejs
echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 exit /b %errorlevel%

REM 安裝所有依賴
:install_all
call :install_python
call :install_nodejs

echo All installations complete.
exit /b
