
# ESP32 Starter template
>A Simple ESP32 Starter template generator 

from your command line run

```
npx create-esp32-app
```

![create-esp-32.PNG](./misc/create-esp32-app-v1.gif)

You can watch the video by clicking the image link below
[<img src="misc/create-esp-32.PNG">](https://www.learnesp32.com/2_create-esp32-app)

## Quick overview

This template can be used as is but, its intended as a quick start for the students learning the ESP32-IDF through my course [https://learnesp32.com](https://learnesp32.com)

if you want a simple vanilla flavoured template to copy and paste see [esp32-starter](https://github.com/Mair/esp32-starter)



## prerequisites

1. You will need to have [node](https://nodejs.org) installed.
2. The esp-idf must be installed. you can follow the instructions in my course (free of charge) with the "[Setting up Your Environment](https://www.learnesp32.com/2_introduction)" module or follow the [official documentation](https://docs.espressif.com/projects/esp-idf/en/latest/get-started/#step-1-set-up-the-toolchain). The installation will create 2 folders. the esp-idf and the tools folder (usually called .espresif). pay attention to where these folders are as you will need to know there locations

3. this template is for [vscode](https://code.visualstudio.com/download) which will need to be installed
4. In VSCODE add the [c++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)

5. ensure tour ESP32 is plugged in and that a COM PORT is established (You may need a driver for your ESP32 dev board)

## Run command

1. in any directory run
```
npx create-esp32-app
```

2. you will be prompted for the name of your project.
3. you will be prompted for the IDF path (esp-idf folder). select or navigate to the location of the IDF path. If you have an environment variable called **IDF_PATH** the path will default to the environment variable.
3. you will be prompted for the IDF-TOOLS path (.espressif folder). select or navigate to the location of the IDF-TOOLS path. If you have an environment variable called **IDF_TOOLS_PATH** the path will default to the environment variable.
4. You will be asked if you want to create a c or c++ project
5. You will be asked if you like to include additional sample code or other items. Leave blank if you would like a bare-bones project
6. navigate to the directory of the project name you created
```
cd <project name>
```
8. open the project in vscode ```code .```

## vs code intellisense

intellisense should just work so long as you have set up the paths correctly. If you have trouble double check your idf and tools paths and correct them in the **/.vscode/c_cpp_properties.json** file
## flashing the esp32

1. In vs code, open a new terminal by pressing ctrl + \` (or pressing F1 and typing `open new terminal`)
2. The first time you open the terminal. Vscode will ask you to allow permission to run a script. The script in question is the esp-idf import script which imports all the esp-idf environment variables into the shell.
click allow and close the shell by pressing the trash can (not the x) then reopen the terminal again.

3. Type the following command

```bash
idf.py -p [your com port] flash monitor
```

## Additional code samples
* blinky [example: blink led]
* c++ [example: c++ starter]
* debug [debug cfg files]
* example connect [example: connect to internet]
* menuconfig [example: config menu with idf.py menuconfig]

log a request if you would like something else added



## Troubleshooting

### Integrated terminal does not work in vs-code after version 1.15.1

As of vs-code v1.56.1 the terminal does not run the needed scripts to import the IDF environment
see this issue

You will need to add `"terminal.integrated.allowWorkspaceConfiguration":true` to your user settings for the terminal to work.

To get to your user settings, see https://code.visualstudio.com/docs/getstarted/settings#_settings-file-locations
for windows users its usually located at C:\Users\<you user name>\AppData\Roaming\Code\User\settings.json
then add the following entry

"terminal.integrated.allowWorkspaceConfiguration":true

### space in user profiles

you receive an error when running npx-create-esp32-app that looks like

- Error: EPERM: operation not permitted, mkdir
- TypeError: cannot read property '<some value>' of undefined

This can happen on windows if there is a space in your username which means you will have a space in your home directory. You can see your home directory on windows by typing

```
echo %USERPROFILE%
```

if you do have a space

1. create a directory to store your npm (node package manager) cache
2. set the new directory for node cache

```
mkdir c:\node_cache
npm config set cache C:\node_cache --global
```

then try `npx create-esp32` again

As of vs-code v1.56.1 the terminal does not run the needed scripts to import the IDF environment
see this issue

You will need to "terminal.integrated.allowWorkspaceConfiguration":true to your user settings for the terminal to work.

To get to your user settings, see https://code.visualstudio.com/docs/getstarted/settings#_settings-file-locations
for windows users its usually located at C:\Users\<you user name>\AppData\Roaming\Code\User\settings.json
then add the following entry

"terminal.integrated.allowWorkspaceConfiguration":true


### python issues

1. if you use the installed idf console and there is no issues however in the idf terminal you get a python issue, it is recommended that you download and install python from https://www.python.org/downloads/

when going through the wizard pay attention to the options and under advanced option ensure you check the

> Add Python to environment variables

option

### python variables are unsatisfied

have a look at the .vscode/settings.json

check or add that you have the following entries. The one for your OS is the important one

```json
  "terminal.integrated.env.windows": {
    "IDF_PYTHON_ENV_PATH" : "<IDF_TOOLS_PATH>/.espressif/tools/idf-python/3.8.7/Scripts"
  },
  "terminal.integrated.env.osx": {
    "IDF_PYTHON_ENV_PATH" : "<IDF_TOOLS_PATH>/.espressif/tools/idf-python/3.8.7/Scripts"
  },
  "terminal.integrated.env.linux": {
    "IDF_PYTHON_ENV_PATH" : "<IDF_TOOLS_PATH>/.espressif/tools/idf-python/3.8.7/Scripts"
  },

```

ensure the path for your OS is correct

Sometimes on initial configuration or if you are switching IDF version you get an error in the console telling you to run `install.bat`. If you see this simple run it.
`c:\esp\esp-idf\install.bat`
this usually sorts out most other python issues. You normally would only need to run this once

## Create-esp32-app not updating to the new version

the current version of the project can be established by looking at the [package.json](https://github.com/Mair/create-esp32-app/blob/master/package.json) under the version property.
When you run create-esp32-app the first line should print out the version number 
```
Welcome to CREATE-ESP32-APP v0.7.2 🎉
```
If you don't see the version number or it's old, you may have a stale version in cache.
To remedy this
1. ensure its not globaly deployed
```bash
npm uninstall -g create-esp32-app
```
2. find the location of your npx cache
```bash
 npm config get cache
 ```
3. this will print out the cache directory.
navigate to that directory
```
cd <cache dir>
```
4. you should see a _npx dir in there
```
cd _npx
```
5. delete the content
```bash
#for linux or mac
rm -rf *
#for windows
del *
```
## Contribution
Pull requests are both welcome and encouraged 😃