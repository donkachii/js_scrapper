const puppeteer = require("puppeteer");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function scrapeData(url) {
  // const csvWriter = createCsvWriter({
  //   path: "data.csv",
  //   header: [
  //     { id: "col1", title: "S/N" },
  //     { id: "col2", title: "EMPLOYER CODE" },
  //     { id: "col3", title: "OLD EMPLOYER CODE" },
  //     { id: "col4", title: "REGISTRATION" },
  //     { id: "col5", title: "NAME" },
  //     { id: "col6", title: "SECTOR" },
  //   ],
  // });

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url);

  // const results = [];

  // while (true) {
  //   const rows = await page.$x('//*[@id="resId1::db"]/table/tbody/tr');

  //   for (const row of rows) {
  //     const cols = await row.$$("td");

  //     const rowData = {};

  //     // Modify this as per your table structure and data requirements
  //     for (const [i, col] of cols.entries()) {
  //       const value = await page.evaluate((el) => el.textContent, col);
  //       rowData[`col${i + 1}`] = value;
  //       console.log(value);
  //     }

  //     results.push(rowData);
  //   }

  //   try {
  //     await page.waitForSelector("#resId1::nb_nx", { timeout: 2000 });
  //     // click the next button and wait for the page to load
  //     await Promise.all([
  //       page.waitForNavigation({ waitUntil: "networkidle0" }),
  //       page.click("#resId1::nb_nx"),
  //     ]);
  //   } catch (error) {
  //     // No more pages left
  //     break;
  //   }
  // }

  // console.log(results);

  //   const [el] = await page.$x('//*[@id="resId1::db"]/table');
  //   const src = await el.getProperty("textContent");
  //   const srcText = await src.jsonValue();

  //   console.log(srcText);

  //   await csvWriter.writeRecords(results);

  // const results = [];

  // while (true) {
  //   await page.evaluate(() =>  {
  //     const data = document.querySelectorAll(".x14b td");
  //     return Array.from(data).map((dat) => {
  //       const bits = dat.querySelectorAll("td");
  //       return Array.from(bits).map((da) => {
  //         const d = da.querySelector("span").innerText;
  //         results.push(d);
  //       });
  //     });
  //   });

  //   try {
  //     const node = await page.waitForSelector("#resId1\\:\\:nb_nx", {
  //       timeout: 5000,
  //     });
  //     await node.click();
  //   } catch (error) {
  //     console.log(error);
  //     break;
  //   }
  // }

  // console.log(results);

  const results = [];

  let i = 0;

  while (i < 5) {
    const data = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".x14b")).map(
        (e) => e.textContent
      );
    });
    results.push(data);

    const nextButton = await page.$("#resId1\\:\\:nb_nx");
    const isDisabled = nextButton
      ? await page.evaluate(
          (btn) => btn.disabled || btn.style.display === "none",
          nextButton
        )
      : true;

    if (isDisabled) {
      // If the "Next" button is disabled, we've reached the last page
      break;
    } else {
      // Otherwise, click the "Next" button and continue scraping
      await nextButton.click();
      // Wait for any JavaScript to run and update the table
      await page.waitForTimeout(2000);
      i++;
    }
  }

  console.log("Checking data out", results);
  await browser.close();
}

scrapeData("https://apps.pencom.gov.ng/ecrsexternal/faces/employers.jsf");
