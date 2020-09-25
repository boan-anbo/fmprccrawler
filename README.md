演示爬取中国外交部网站新闻
---

### 外交部网站
https://www.fmprc.gov.cn/web/
### 安装方法
1. Clone the repo. (`zyxw` & `frhd` are only for demo purpose. You only need the two files: `package.json`, `main.ts`)
2. `npm install`
3. `npm start` 
    - 注意默认开启`crawlAllUnderCategory`.

---
### 使用方法

使用以下两个方法爬取。默认开启`crawlAllUnderCategory`.

### crawlAllUnderCategory (爬取某个栏目新闻)

▸ **crawlAllUnderCategory**(`baseUrl`: string, `folderName`: string): Promise\<void>


#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`baseUrl` | string | The category path. Do NOT include 'default.shtml' part. e.g. https://www.fmprc.gov.cn/web/zwbd_673032/fnhd_673048/ |
`folderName` | string | Where to put the htmls.  |

**Returns:** Promise\<void>

___

#### crawlToTheEnd （从ID开始一直爬到最早）

▸ **crawlToTheEnd**(`baseUrl`: string, `startingId`: number, `folderName`: string): Promise\<void>

Crawl from the starting id to 0.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`baseUrl` | string | The category path. Do NOT include 't*.shtml' part. Put the id (the * part) into the startingId parameter). E.g. For article, https://www.fmprc.gov.cn/web/zyxw/t1638506.shtml, the base url is https://www.fmprc.gov.cn/web/zyxw/; the starting id is 1638506. |
`startingId` | number | starting page id |
`folderName` | string | where to put the htmls.  |

**Returns:** Promise\<void>

___


Bo An, 2020
