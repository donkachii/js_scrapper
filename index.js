const puppeteer = require("puppeteer");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function scrapeData(url) {
  const csvWriter = createCsvWriter({
    path: "data.csv",
    header: [
      { id: "col1", title: "S/N" },
      { id: "col2", title: "EMPLOYER CODE" },
      { id: "col3", title: "OLD EMPLOYER CODE" },
      { id: "col4", title: "REGISTRATION" },
      { id: "col5", title: "NAME" },
      { id: "col6", title: "SECTOR" },
    ],
  });

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url);

  const results = [];

  //   let i = 1;
  try {
    while (true) {
      let rows = await page.$x('//*[@id="resId1::db"]/table/tbody/tr');

      for (const row of rows) {
        const cols = await row.$$("td");

        const rowData = {};

        for (const [i, col] of cols.entries()) {
          const value = await page.evaluate((el) => el.textContent, col);
          rowData[`col${i + 1}`] = value;
          // console.log(value);
        }

        results.push(rowData);
      }

      // const isDisabled = await page.evaluate(() => {
      //   const btn = document.querySelector("#resId1\\:\\:nb_nx");
      //   return btn.disabled || btn.style.display === "none" || !btn;
      // });

      // if (isDisabled) {
      //   break;
      // } else {
      //   await page.click("#resId1\\:\\:nb_nx");
      //   await page.waitForTimeout(2000);
      // }

      // Check if the "Next" button is disabled
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
        //   i++;
      }

      // try {
      //   const node = await page.waitForSelector("#resId1\\:\\:nb_nx", {
      //     timeout: 2000,
      //   });
      //   // click the next button and wait for the page to load

      //   await node.click();
      // } catch (error) {
      //   // No more pages left
      //   console.log("No more pages");
      //   break;
      // }
    }
  } catch (e) {
    console.log("Checking Error ", e);
  }

  console.log(results);

  //   const [el] = await page.$x('//*[@id="resId1::db"]/table');
  //   const src = await el.getProperty("textContent");
  //   const srcText = await src.jsonValue();

  //   console.log(srcText);

  await browser.close();
  await csvWriter.writeRecords(results);
}

scrapeData(
  "https://apps.pencom.gov.ng/ecrsexternal/faces/employers.jsf;jsessionid=dytnsDN1Gyi1B-i9FeP712GL5yPbHorgvXNZtk868davrBQiJ2Ns!129555021"
);
