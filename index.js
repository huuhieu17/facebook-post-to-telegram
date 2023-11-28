require("dotenv").config();

const { app, BrowserWindow, ipcMain } = require('electron');
const { clearCookies } = require('./utils/cookies');
var path = require('path');
const { listGroups, sendUrl, timeRefresh } = require('./utils/config');
const { default: axios } = require("axios");
let mainWindow;


let tabs = []; // store tab open

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600, 
        webPreferences: {
            // preload: path.join(__dirname, 'preload.js'), // Set the preload script
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    // Load the Facebook website
    mainWindow.loadURL('https://mbasic.facebook.com/?_rdr');

    // Open the DevTools (remove this line for production)
    mainWindow.webContents.openDevTools();
    clearCookies();
    // Event when the window is closed
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

}

// Create the main window when the app is ready
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// Create a new window when the app is activated (on macOS)
app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

ipcMain.on('send-message', (e, data) => {
    console.log(data);
    axios(`${sendUrl}`, {
        method: 'post',
        data: JSON.stringify(data),
        headers: {
            "Content-Type": 'application/json',
            dataType: 'json'
        }
    }).then(res=>{
    }).catch(e=>{
        console.log(e)
    })
})

// open group tab
function openTab(url) {
    // Create a new tab window
    const tabWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            // preload: path.join(__dirname, 'preload.js'), // Set the preload script
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: true,
        },
    });

    // Load the URL into the tab window
    tabWindow.loadURL(url);

    // Open the DevTools for the tab window (remove this line for production)
    tabWindow.webContents.openDevTools();
    // call event get post
    fire()
    // fake scroll every 2 second
    scrollWindow()


    // Event when the tab window is closed
    tabWindow.on('closed', function () {
        // Remove the tab window from the array when closed
        tabs = tabs.filter(tab => tab !== tabWindow);
    });

    // Add the tab window to the array
    tabs.push(tabWindow);

    // setInterval(async () => {
    //     await tabWindow.reload();
    //     fire();
    //     scrollWindow()
    // }, timeRefresh)

    function scrollWindow() {
        tabWindow.webContents.executeJavaScript(`
        setInterval(() => {
            window.scrollTo(1000, Math.floor(Math.random() * 5001))
        }, 2000)
        `)
    }

    function fire() {
        const websource = {
            code: `
            const listObj = [];
            const ipcRenderer = require('electron').ipcRenderer;
            const { listKeyword } = require('./utils/config');
            const feed = document.querySelector("[role='feed']");
            setTimeout(() => {
                const posts = document.querySelectorAll('.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z');
                posts.forEach(post => {
                    const postElement = post.querySelector('.x1n2onr6.x1ja2u2z');
                    if(postElement){
                        const contentElementWithoutImg = postElement.querySelector('.x5yr21d.xyqdw3p');
                        const contentElementWithImg = postElement.querySelector('[data-ad-comet-preview="message"]')
                        const contentText = contentElementWithoutImg ? contentElementWithoutImg.innerText : contentElementWithImg ? contentElementWithImg.innerText : ''
                        const matchPost = listKeyword.reduce((count, item) => {
                            if (contentText.includes(item)) {
                                return count + 1;
                            }
                            return count;
                        }, 0);
                        console.log(matchPost, contentText, listKeyword)
                        if(matchPost < 2) return;
                       

                        const currentLink = document.location.href;
                        const splitLink = currentLink.split('/');

                        const headerLinkElement = postElement.querySelector('a[href*="/user/"]');
                        const headerContent = headerLinkElement && headerLinkElement.querySelector('a[href*="/user/"]');
                        const groupNameElement = document.querySelector('.x1i10hfl.xjbqb8w.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.xt0b8zv.x1xlr1w8')
                        let headerObj = {
                            senderName: headerContent ? headerContent.getAttribute('aria-label') : headerLinkElement ?  headerLinkElement.innerText : 'Người tham gia ẩn danh',
                            groupName: groupNameElement?.innerText ?? ''
                        }
                        let ownerLink = headerLinkElement && headerLinkElement.href;
                        const postLink = postElement.querySelector('a[href*="/posts/"]');
                        if(!postLink) return;

                        const listImg = [];
                        const listMedia = postElement.querySelectorAll(".xqtp20y.x6ikm8r.x10wlt62.x1n2onr6");
                        if(listMedia.length > 0){
                            listMedia.forEach(qrl => {
                                    const img = qrl.querySelector('img');
                                    if(img){
                                        listImg.push(img.src)
                                    }
                            })
                        }
                        const obj = {
                            ...headerObj,
                            contentPost: contentText,
                            groupId: splitLink[splitLink.length - 1].replace('?sorting_setting=CHRONOLOGICAL', ''),
                            ownerId: ownerLink && ownerLink.split('/')[6],
                            postId: postLink && postLink.href.split('/')[6],
                            listImg,
                        }

                        listObj.push(obj);
                    }
                })
                if(listObj.length <= 0) return;
                ipcRenderer.send('send-message', listObj)
            }, 5000)
        `
        }
        tabWindow.webContents.executeJavaScriptInIsolatedWorld(999, [websource] , true );
    }
}


function startApp() {

    mainWindow.webContents.executeJavaScript(`
        // 
        const body = document.body;
        if(body.innerHTML.includes('Allow the use of cookies from Facebook on this browser?')){
            const btn = document.querySelector('[name="accept_only_essential"][class="bs"]');
            btn && btn.click();
        }else{
            alert('Lỗi rồi Hiếu ơi')
        }
     
        // require('electron').ipcRenderer.send('test', 123)
    `
    );

    mainWindow.webContents.on('did-navigate', (event, url) => {
        console.log('event', event, 'url', url)
        if (url.includes('https://mbasic.facebook.com/login/save-device')) {
            handleSaveInfoDataPage();
        }
        if (url.includes('https://mbasic.facebook.com/?_rdr')){
                mainWindow.webContents.executeJavaScript(`
                //  ************ FUNCTION REGION
                function calm(callBack, time) {
                    if(!callBack || !time) return;
                    setTimeout(() => {
                        callBack && callBack();
                    }, time)
                }
                const { facebookEmail, facebookPassword } = require('./utils/config');
        
                if(!facebookEmail || !facebookPassword) {
                    alert('Chưa có thông tin đăng nhập facebook');
                }else{
                    const inputEmail = document.querySelector("#m_login_email");
                    const inputPassword = document.querySelector('[name="pass"]')
                    const buttonLogin = document.querySelector('[name="login"]')
                    inputEmail.value = facebookEmail
                    inputPassword.value = facebookPassword
                    calm(() => {
                        
                        buttonLogin.click()
                    }, 100)
                }`)
        }
        if (url.includes('https://mbasic.facebook.com/?paipv')) {
            listGroups.forEach(item => {
                openTab(item);
            })
        }
    })


    function handleSaveInfoDataPage() {
        mainWindow.webContents.executeJavaScript(`
            const body = document.body.innerHTML;
            console.log(body.includes('Đăng nhập bằng một lần nhấn'))
            if(body.includes('Đăng nhập bằng một lần nhấn')){
                const okButton = document.querySelector('input[value="OK"]');
                setTimeout(() => {
                    okButton && okButton.click();
                    console.log(okButton, 'button clicked')
                }, 500)
            }
        `)

    }

}

// Call the function to click the button after a delay (you can call it when needed)
setTimeout(startApp, 1000); // Click the button after 5 seconds (adjust the delay as needed)
