const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, MenuItem, ipcMain, globalShortcut} = electron;

// SET ENV (to production)
//process.env.NODE_ENV = 'production';

let mainWindow;
let addPredmetWindow;

// Listen for app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({});
  // Load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Quit app when closed
  mainWindow.on('closed', function(){
    globalShortcut.unregisterAll();
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register('CmdOrCtrl+Shift+H', function(){
    mainWindow.show();
  })
});

// Handle create add window
function createAddPredmet() {
  // Create new window
  addPredmetWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Dodaj novi predmet"
  });
  // Load html into window
  addPredmetWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addPredmetWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Garbage collection handle
  addPredmetWindow.on('close', function(){
    addPredmetWindow = null;
  });
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
  mainWindow.webContents.send('item:add', item);
  addPredmetWindow.close();
});

// Catch item:context
ipcMain.on('item:context', function(e, item){
  const ctxMenu = new Menu();
  ctxMenu.append(new MenuItem({
    label: 'Help'
  }));

  ctxMenu.popup(mainWindow, e.x, e.y);
  ctxMenu.on('close', function(){
    ctxMenu = null;
  });
});


// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu:[
      {
        label: 'Dodaj predmet',
        click() {
          createAddPredmet();
        }
      },
      {
        label: 'Izbrisi predmet',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',//process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
]

// If mac, add empty object to menu(to fix the default "electron" menu option)
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools if not in production
if(process.env.NODE_ENV != 'production') {
  mainMenuTemplate.push({
    label: 'Developer tools',
    submenu:[
      {
        label: 'Toggle developer tools',
        accelerator: 'CmdOrCtrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'Reload'
      }
    ]
  });
}