# buffer-to-data-url


<a href="https://raw.githubusercontent.com/jaid/buffer-to-data-url/master/license.txt"><img src="https://img.shields.io/github/license/jaid/buffer-to-data-url?style=flat-square" alt="License"/></a> <a href="https://github.com/sponsors/jaid"><img src="https://img.shields.io/badge/<3-Sponsor-FF45F1?style=flat-square" alt="Sponsor buffer-to-data-url"/></a>  
<a href="https://actions-badge.atrox.dev/jaid/buffer-to-data-url/goto"><img src="https://img.shields.io/endpoint.svg?style=flat-square&url=https%3A%2F%2Factions-badge.atrox.dev%2Fjaid%2Fbuffer-to-data-url%2Fbadge" alt="Build status"/></a> <a href="https://github.com/jaid/buffer-to-data-url/commits"><img src="https://img.shields.io/github/commits-since/jaid/buffer-to-data-url/v1.0.0?style=flat-square&logo=github" alt="Commits since v1.0.0"/></a> <a href="https://github.com/jaid/buffer-to-data-url/commits"><img src="https://img.shields.io/github/last-commit/jaid/buffer-to-data-url?style=flat-square&logo=github" alt="Last commit"/></a> <a href="https://github.com/jaid/buffer-to-data-url/issues"><img src="https://img.shields.io/github/issues/jaid/buffer-to-data-url?style=flat-square&logo=github" alt="Issues"/></a>  
<a href="https://npmjs.com/package/buffer-to-data-url"><img src="https://img.shields.io/npm/v/buffer-to-data-url?style=flat-square&logo=npm&label=latest%20version" alt="Latest version on npm"/></a> <a href="https://github.com/jaid/buffer-to-data-url/network/dependents"><img src="https://img.shields.io/librariesio/dependents/npm/buffer-to-data-url?style=flat-square&logo=npm" alt="Dependents"/></a> <a href="https://npmjs.com/package/buffer-to-data-url"><img src="https://img.shields.io/npm/dm/buffer-to-data-url?style=flat-square&logo=npm" alt="Downloads"/></a>

**Creates a base64-encoded data URL from a Buffer and a mimetype.**





## Installation

<a href="https://npmjs.com/package/buffer-to-data-url"><img src="https://img.shields.io/badge/npm-buffer--to--data--url-C23039?style=flat-square&logo=npm" alt="buffer-to-data-url on npm"/></a>

```bash
npm install --save buffer-to-data-url@^1.0.0
```

<a href="https://yarnpkg.com/package/buffer-to-data-url"><img src="https://img.shields.io/badge/Yarn-buffer--to--data--url-2F8CB7?style=flat-square&logo=yarn&logoColor=white" alt="buffer-to-data-url on Yarn"/></a>

```bash
yarn add buffer-to-data-url@^1.0.0
```

<a href="https://github.com/jaid/buffer-to-data-url/packages"><img src="https://img.shields.io/badge/GitHub Packages-@jaid/buffer--to--data--url-24282e?style=flat-square&logo=github" alt="@jaid/buffer-to-data-url on GitHub Packages"/></a>  
(if [configured properly](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-npm-for-use-with-github-packages))

```bash
npm install --save @jaid/buffer-to-data-url@^1.0.0
```



## Example


```javascript
import bufferToDataUrl from "buffer-to-data-url"

const imageBuffer = fs.readFileSync("pikachu_8x8.png")
const dataUrl = bufferToDataUrl("image/png", imageBuffer)
```

Variable `result` will be:

```javascript
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAARklEQVQoU2P8/Z/hPwMewEiUAhaG/wyMjIwMv6FmIfPBJrAyQuyAKUDmo1iBrhCkifG/oBrY4D/vbqE4lUVIDcwnrICQLwAWoihJ/lJMVwAAAABJRU5ErkJgggAA"
```

















## Development



Setting up:
```bash
git clone git@github.com:jaid/buffer-to-data-url.git
cd buffer-to-data-url
npm install
```
Testing:
```bash
npm run test:dev
```
Testing in production environment:
```bash
npm run test
```


## License
[MIT License](https://raw.githubusercontent.com/jaid/buffer-to-data-url/master/license.txt)  
Copyright © 2020, Jaid \<jaid.jsx@gmail.com> (https://github.com/jaid)
