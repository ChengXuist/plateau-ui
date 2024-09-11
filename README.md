# plateau-ui

## Project setup
```
set npm_config_arch=arm64
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```
```
npm install -g @vue/cli
npm install bootstrap
npm install --save-dev electron
npm install @popperjs/core@^2.11.8
npm install --save-dev electron
vue add electron-builder
npm run electron:serve
npm run electron:build
# or
npm run electron:build -- --linux --armv7l --dir
```
### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Touch screen rotation issue
The Rasbien system doesn't calibrate the screen rotation automatically, instead, the user is requested to calibrate themself the screen.
*** The default screen is landscape. The user shouldn't rotate the screen by the ui system configuration. ***
#### To rotate the display
```
sudo vim /boot/config.txt
```
Find "HDMI_mode=xx", on the following line, add
```
display_hdmi_rotate=3
```
for a 270 degree rotation.
The reboot the system.
One the system is rebooted, the user should visualize a protrait screen, with wrong touchscreen coordinate.

#### To rotate the touchscreen
```
sudo vim /usr/share/X11/xorg.conf.d/40-libinput.conf
```

Look for the keyword "touchscreen" in one of the  InputClass section, in the same section, add the following code for 270 degree of rotation.
```
Option "TransformationMatrix" "0 -1 1 1 0 0 0 0 1"
```
If the user was having 90 degree of rotation
```
Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1"
```
If the user was having 180 degree of rotation
```
Option "TransformationMatrix" "-1 0 1 0 -1 1 0 0 1"
```
