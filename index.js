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
    mainWindow.loadURL('https://mbasic.facebook.com');

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
        width: 800,
        height: 600,
        webPreferences: {
            // preload: path.join(__dirname, 'preload.js'), // Set the preload script
            nodeIntegration: true,
            contextIsolation: false,
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

    setInterval(async () => {
        await tabWindow.reload();
        fire();
        scrollWindow()
    }, timeRefresh)

    function scrollWindow() {
        tabWindow.webContents.executeJavaScript(`
        setInterval(() => {
            window.scrollTo(0, Math.floor(Math.random() * 1001))
        }, 2000)
        `)
    }

    function fire() {
        tabWindow.webContents.executeJavaScript(`
        const { ipcRenderer } = require('electron');
        const { listKeyword } = require('./utils/config');
        const articles = document.querySelectorAll('article');
        const listObj = [];
        articles.forEach(item => {
            // get content post
            const content = item.querySelector('.ds');
            const contentText = content.innerText;
            // check post match

            const matchPost = listKeyword.reduce((count, item) => {
                if (contentText.includes(item)) {
                  return count + 1;
                }
                return count;
              }, 0);
            
            if(matchPost < 2) return;

            const dataset = item.dataset.ft;
            const parseDataset = JSON.parse(dataset);
            const currentLink = document.location.href;
            const splitLink = currentLink.split('/');
            // get header info
            const header = item.querySelector('.bs.dg.dq.dr');
            const listItemHeader = header ? header.querySelectorAll('strong') : [];
            let headerObj = {}
            if(listItemHeader.length > 0){
                // get name sender and name group
                const sender = listItemHeader[0].querySelector('a');
                const group = listItemHeader[1].querySelector('a');
                headerObj = {
                    senderName: sender && sender.innerText,
                    groupName: group && group.innerText,

                }
            }


            // get image
            const listImg = [];
            const mediaElement = item.querySelector('.dv.dw');
            if(mediaElement){
                    const queryAllLinkTag = mediaElement.querySelectorAll('.dx.dy');
                    console.log(queryAllLinkTag)
                    if(queryAllLinkTag.length > 0){
                        queryAllLinkTag.forEach(qrl => {
                            const img = qrl.querySelector('img');
                            if(img){
                                listImg.push(img.src)
                            }
                        })
                    }
                
            }

            const obj = {
                ...headerObj,
                groupId: splitLink[splitLink.length - 1],
                ownerId: parseDataset.content_owner_id_new,
                postId: parseDataset.top_level_post_id,
                innerText: item.innerText,
                contentPost: content.innerText,
                listImg,
            }
            listObj.push(obj);

            ipcRenderer.send('send-message', listObj)
        })
    `)
    }
}


function startApp() {

    mainWindow.webContents.executeJavaScript(`
        // 
        const { facebookEmail, facebookPassword } = require('./utils/config');
        // require('electron').ipcRenderer.send('test', 123)
       
        //  ************ FUNCTION REGION
        function calm(callBack, time) {
            if(!callBack || !time) return;
            setTimeout(() => {
                callBack && callBack();
            }, time)
        }

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
        }

        
    `
    );

    mainWindow.webContents.on('did-navigate', (event, url) => {
        console.log('event', event, 'url', url)
        if (url.includes('https://mbasic.facebook.com/login/save-device')) {
            handleSaveInfoDataPage();
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
