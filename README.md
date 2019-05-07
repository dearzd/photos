# Photos
## 如何安装Photos
### 准备工作
1. 下载Photos源代码；
2. 安装NodeJS，GraphicsMagick及其插件jpegsrc.v9c.tar.gz。

### 编译代码
1. 在源代码根目录运行`npm install` (大概会花几分钟)；
2. 在源代码根目录运行`npm run build`，完成会生成/dist目录，/dist目录下的文件则是最终编译生成好的所有代码。

### 产品环境
1. 如需本地运行：在/dist/server目录下面运行`node server.js`，然后浏览器访问localhost:3000即可。
2. 如需放到服务器真实上线：则需将/dist整个目录的文件上传到服务器的www文件夹，然后将域名解析到该目录，并且在服务器重复上述准备工作的第2步，然后在/server目录下运行`node server.js` （防止关掉shell过后服务就断掉，最好使用forever等方式来永久运行server.js文件）。

### 开发环境
如果需要修改代码，则在做完 准备工作 过后：
1. 在/src/server目录下运行`node server.js`
2. 在根目录下运行`npm start`
