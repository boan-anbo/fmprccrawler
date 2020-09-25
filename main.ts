import puppeteer from 'puppeteer';
import * as fs from "fs";
import Element = cheerio.Element;
const cheerio = require('cheerio')


const delay = (ms: number) => new Promise(res => {
    console.log("Pausing for " + ms + " ms")
    setTimeout(res, ms)
})

/**
 * Crawl from the starting id to 0.
 * @param baseUrl  The category path. Do NOT include 't*.shtml'. Put the id (the * part into the startingId parameter). e.g. For an article, https://www.fmprc.gov.cn/web/zyxw/t1638506.shtml, the base url is https://www.fmprc.gov.cn/web/zyxw/; the starting id is 1638506.
 * @param startingId starting page id
 * @param folderName where to put the htmls
 */
async function crawlToTheEnd(baseUrl: string, startingId: number, folderName: string) {
    // how long to pause between pages, in ms.
    const delayTime = 1000;
    const browser = await puppeteer.launch({headless: false});
    let url = ''
    for (let id = startingId; id > 0; id--) {
        url = `${baseUrl}t${id}.shtml`
        const page = await browser.newPage();
        // wait for the page to load for a maxmum number of milleseconds
        await page.setDefaultNavigationTimeout(180000);
        await page.goto(url, {waitUntil: 'domcontentloaded'});
        console.log('Opened ', url)
        const redirectedUrl = await page.url()
        let fileName = ''

        if (redirectedUrl === "https://www.fmprc.gov.cn/error.htm") {
            console.log("PAGE NOT FOUND")
            await delay(delayTime)
        } else {
            const title = await page.evaluate(() => {
                return document.getElementById("News_Body_Title")?.innerText
            })
            const date = await page.evaluate(() => {
                return document.getElementById("News_Body_Time")?.innerText
            });

            if (title !== undefined) {

                console.log("Page Found: ", title, date);
                const html = await page.content(); // serialized HTML of page DOM.
                if (!fs.existsSync(folderName)) {
                    fs.mkdirSync(folderName);
                }
                fileName = `${folderName}\\${date} - ${id} - ${title}.html`
                console.log("Writing to File: ", fileName)
                fs.writeFileSync(fileName, html);
                await delay(delayTime)
            }
        }
        page.close()
    }
    await browser.close();
    return;
}


/**
 *
 * @param baseUrl The category path. Do NOT include 'default.shtml' e.g. https://www.fmprc.gov.cn/web/zwbd_673032/fnhd_673048/
 * @param folderName Where to put the htmls.
 */
async function crawlAllUnderCategory(baseUrl: string, folderName: string) {
    // how long to pause between pages, in ms. Adjust if getting blocked.
    const delayTime = 1000;
    const browser = await puppeteer.launch({headless: false});
    let categoryUrl = ''
    let pageUrl = ''
    let currentPageEntries: string[] = [];
    // fetch all entries on the current page
    let page = await browser.newPage();
    categoryUrl = baseUrl + 'default.shtml';
    await page.setDefaultNavigationTimeout(120000);
    await page.goto(categoryUrl, {waitUntil: 'domcontentloaded'});
    let html = await page.content()
    let $ = cheerio.load(html)
    let totalPage = parseInt(/countPage = (\d*)\/\/共多少页/.exec(html)[1])
    let currentPage = 0
    console.log('Total Pages ', totalPage)
    let list: string[] = $('.rebox_news li a')?.map((i: number, element: Element) => {
        return parseInt(element.attribs.href.split('/t')[1].split('.')[0]);
    })
    do {
        console.log('Current Page', currentPage)
        if (currentPage > 0) {
        categoryUrl = baseUrl + 'default' + '_' + currentPage + '.shtml'

        await page.setDefaultNavigationTimeout(120000);
        await page.goto(categoryUrl, {waitUntil: 'domcontentloaded'});
        html = await page.content()
        $ = cheerio.load(html)

        list = $('.rebox_news li a')?.map((i: number, element: Element) => {
            return parseInt(element.attribs.href.split('/t')[1].split('.')[0]);
        })
        }
        for (let index = 0; index < list.length; index++) {
            pageUrl = `${baseUrl}t${list[index]}.shtml`
            const page = await browser.newPage();
            // wait for the page to load for a maxmum number of milleseconds
            await page.setDefaultNavigationTimeout(120000);
            await page.goto(pageUrl, {waitUntil: 'domcontentloaded'});
            console.log('Opened ', pageUrl)
            const redirectedUrl = await page.url()
            let fileName = ''

            if (redirectedUrl === "https://www.fmprc.gov.cn/error.htm") {
                console.log("PAGE NOT FOUND")
                await delay(delayTime)
            } else {
                const title = await page.evaluate(() => {
                    return document.getElementById("News_Body_Title")?.innerText
                })
                const date = await page.evaluate(() => {
                    return document.getElementById("News_Body_Time")?.innerText
                });

                if (title !== undefined) {

                    console.log("Page Found: ", title, date);
                    const html = await page.content(); // serialized HTML of page DOM.
                    if (!fs.existsSync(folderName)) {
                        fs.mkdirSync(folderName);
                    }
                    fileName = `${folderName}\\${date} - ${list[index]} - ${title}.html`
                    console.log("Writing to File: ", fileName)
                    fs.writeFileSync(fileName, html);
                    await delay(delayTime)
                }
            }
            page.close()
        }
        currentPage++
    } while (currentPage < totalPage);
    await browser.close();
    return;
}



// Example crawling to the last
const baseUrl = "https://www.fmprc.gov.cn/web/zyxw/"
crawlToTheEnd(baseUrl, 1638506, "zyxw").catch((err) => {
    throw err;
})


// Example crawl all pages under the category
// const baseUrl = "https://www.fmprc.gov.cn/web/zwbd_673032/fnhd_673048/"
// crawlAllUnderCategory(baseUrl, "frhd").catch((err) => {throw err})

