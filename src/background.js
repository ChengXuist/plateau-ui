'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'

import fs from 'fs'; // Import fs for file operations
import path from 'path';
import os from 'os';


ipcMain.on('load-json-file', (event, fileName) => {
  // Read the JSON file
  const dirPath = path.join(app.getPath('documents'), 'map'); // Adjust the path as needed
  const filePath = path.join(dirPath, fileName);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the JSON file:', err);
      event.reply('json-file-data', { success: false, error: err.message });
    } else {
      try {
        // Parse JSON data
        const jsonData = JSON.parse(data);
        event.reply('json-file-data', { success: true, data: jsonData });
      } catch (parseError) {
        console.error('Error parsing the JSON file:', parseError);
        event.reply('json-file-data', { success: false, error: parseError.message });
      }
    }
  });
});

ipcMain.on('save-json-file', (event, { fileName, jsonData }) => {
  // Convert JSON object to string
  const jsonString = JSON.stringify(jsonData, null, 2);
  const dirPath = path.join(app.getPath('documents'), 'map'); // Adjust the path as needed
  const filePath = path.join(dirPath, fileName);

  // Save the file
  fs.writeFile(filePath, jsonString, 'utf8', (err) => {
    if (err) {
      console.error('Error saving the JSON file:', err);
      event.reply('save-status', { success: false, error: err.message });
    } else {
      event.reply('save-status', { success: true });
    }
  });
});

ipcMain.on('save-png-file', (event, { fileName, data }) => {
  // Define the directory where you want to save the PNG file
  const dirPath = path.join(app.getPath('documents'), 'map'); // Adjust the path as needed
  const filePath = path.join(dirPath, fileName);

  // Create the directory if it doesn't exist
  fs.mkdir(dirPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating directory:', err);
      event.reply('save-status', { success: false, error: err.message });
      return;
    }

    // If data is a base64 string, convert it to a Buffer
    const buffer = Buffer.from(data, 'base64'); // Use 'base64' encoding if data is in base64 format

    // Write the file
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error('Error saving the file:', err);
        event.reply('save-status', { success: false, error: err.message });
      } else {
        event.reply('save-status', { success: true });
      }
    });
  });
});

// Handle request to read a PNG file
ipcMain.on('load-image-file', (event, filePath) => {
  const fullPath = path.join(app.getPath('documents'), 'map', filePath); // Ensure you use the correct path

  // Read the image file as a binary Buffer
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      console.error('Error reading the image file:', err);
      event.reply('image-file-data', { success: false, error: err.message });
    } else {
      // Convert Buffer to base64 so it can be used in the renderer process
      const base64Image = data.toString('base64');
      event.reply('image-file-data', { success: true, data: base64Image });
    }
  });
});

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 1280,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
