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
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url); // Go to url and wait for 60s for the page to load

  await page.waitForSelector(".default");

  const results = [];

  try {
    while (true) {
      const rows = await page.$x(
        '//*[@id="default"]/div/div/div/div/section/div[2]/ol/li[1]/article'
      );
      console.log("Printing Rows", rows);

      const nextButton = await page.$("li.next a");
      const isDisabled = await page.evaluate(
        (button) => button.disabled || button.style.display === "none",
        nextButton
      );

      if (isDisabled) {
        break;
      } else {
        await nextButton.click();
        await page.waitForNavigation();
      }
    }
  } catch (e) {
    console.log("Checking Error ", e);
  }

  console.log(results);

  if (browser.isConnected()) {
    await browser.close();
  }

  // await csvWriter.writeRecords(results);
}

scrapeData("https://books.toscrape.com/");
