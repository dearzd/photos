#Photos
##如何安装Photos
###产品环境：
1. 下载Photos源代码；
2. 安装NodeJS，GraphicsMagick及其插件jpegsrc.v9c.tar.gz；
3. 在源代码根目录运行npm install (大概会花几分钟)；
4. 在源代码根目录运行npm run build，完成会生成/dist目录，/dist目录下的文件则是最终编译生成好的所有代码；
5. 如需本地运行：在/dist/server目录下面运行node server.js，然后浏览器访问localhost:3000即可。
6. 如需放到服务器真实上线：则需将/dist整个目录的文件上传到服务器的www文件夹，然后将域名解析到该目录，并且在服务器重复第2步，然后在/server目录下运行node server.js （防止关掉shell过后服务就断掉，最好使用forever等方式来永久运行server.js文件）。

###开发环境
1. 在/src/server目录下运行node server.js
2. 在根目录下运行npm start
