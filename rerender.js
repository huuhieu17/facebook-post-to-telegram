const puppeteer = require('puppeteer');

async function autoLogin() {
    console.log("login")
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto('https://mbasic.facebook.com');
        // Replace 'your_email' and 'your_password' with your actual credentials
        await page.type('#email', 'sharpesakikolouise4ibyorkiq@hotmail.com');
        await page.type('#pass', 'Oocahj590o');

        await Promise.all([
            page.waitForNavigation(),
            page.click('.bp.bq.br.bs.bt.bu'),
        ]);

        console.log('Successfully logged in!');
    } catch (error) {
        console.error('Login failed:', error);
    } finally {
        await browser.close();
    }
}