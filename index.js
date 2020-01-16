#!/usr/bin/env node
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const UnderscoreTemplate = require("underscore.template");

inquirer.registerPrompt("fuzzypath", require("inquirer-fuzzy-path"));

const CURR_DIR = process.cwd();

const rootPath = process.platform === "win32" ? "c:\\" : require("os").homedir();

const defaultIDFPath = !!process.env.IDF_PATH
  ? process.env.IDF_PATH
  : path.join(rootPath, "esp", "esp-idf");

const defaultExtensiaToolsPath = !!process.env.IDF_TOOLS_PATH
  ? process.env.IDF_TOOLS_PATH
  : path.join(rootPath, "esp", "tools", ".espressif");

const questions = [
  {
    name: "projectName",
    type: "input",
    message: "Project Name",
    validate: function(input) {
      if (/^([A-Za-z\_][A-Za-z\-\_\d])/.test(input) ) return true;
      else return "Project name must be alphanumeric and start with a letter";
    }
  },
  {
    name: "iDFPath",
    type: "fuzzypath",
    validate: function(input) {
      if (!!input) return true;
      else return "IDF path cannot be blank (press tab to select path)";
    },
    itemType: "directory",
    rootPath: rootPath,
    message: "Select directory to ESP-IDF",
    default: defaultIDFPath,
    suggestOnly: true,
    depthLimit: 1
  },
  {
    name: "toolsPath",
    type: "fuzzypath",
    validate: function(input) {
      if (!!input) return true;
      else return "IDF tools path cannot be blank (press tab to select path)";
    },
    itemType: "directory",
    rootPath: rootPath,
    message: "Select directory to espressif Tools (Xtensa tools[.espressif/tools directory])",
    default: defaultExtensiaToolsPath,
    suggestOnly: true,
    depthLimit: 1
  },
  {
    name: "Additions",
    type: "checkbox",
    message: "Select additional sample code",
    choices: [
      {name:"blinky [blink led]", value:"blinky"},
      // {name:"KConfig [config menu with idf.py menuconfig]", value:"KConfig" },
      // {name:"SPIFS [files]", value:"SPIFS"}, 
      // {name:"Example Connect [connect to internet]",value:"exampleConnect"}
    ]
  }
];

async function generate() {
  const answers = await inquirer.prompt(questions);

  console.log("answers", answers);
  const folderName = `${CURR_DIR}/${answers.projectName}`;
  if(fs.existsSync(folderName))
  {
    console.log(chalk.red(`folder ${folderName} exists`));
    console.log(chalk.red(`Please retry using a different name`));
  }
  fs.mkdirSync(`${CURR_DIR}/${answers.projectName}`);
  const templatePath = `${__dirname}/esp-idf-template/`;
  console.log(chalk.cyan(`Generating Template with name"${answers.projectName}"`));
  createDirectoryContents(templatePath, answers.projectName, answers);
  console.log(chalk.green("Success"));
  console.log(chalk.green("see read me for more information or visit us on"));
  console.log(chalk.greenBright.bold.underline("https://learnesp32.com"));
  console.log(chalk.green("please navigate to your new project and open it in vscode"));
  console.log(chalk.cyan(`cd ${answers.projectName}`));
  console.log(chalk.cyan("code ."));
}

function createDirectoryContents(templatePath, newProjectPath, answers) {
  const filesToCreate = fs.readdirSync(templatePath);
  filesToCreate.forEach(file => {
    const origFilePath = `${templatePath}/${file}`;
    const stats = fs.statSync(origFilePath);
    if (stats.isFile()) {
      const contents = fs.readFileSync(origFilePath, "utf8");
      const updatedContents = replaceFileTokens(contents, answers);
      if (file === ".npmignore") file = ".gitignore";
      const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
      fs.writeFileSync(writePath, updatedContents, "utf8");
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);
      createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`, answers);
    }
  });
}

function replaceFileTokens(contents, answers) {
  const { iDFPath, toolsPath, projectName } = answers;
  const forwardSlash_idfPath = iDFPath.replace(/\\/g, "/");
  const forwardSlash_toolsPath = toolsPath.replace(/\\/g, "/");
  const forwardSlash_elf_Path = `${CURR_DIR.replace(/\\/g, "/")}/${projectName}/build/${projectName}.elf`;
  const backSlash_idf_path_escaped = forwardSlash_idfPath.replace(/\//g, "\\\\");
  
  const mainModel = getAddition(answers.Additions)
 

  const model = {
    IDF_TOOLS_PATH: forwardSlash_toolsPath,
    IDF_PATH: forwardSlash_idfPath,
    ELF_PATH: forwardSlash_elf_Path,
    PROJECT_NAME: projectName,
    IDF_PATH_BACKSLASH_ESCAPED: backSlash_idf_path_escaped,
    headers:mainModel.headers,
    tasks:mainModel.tasks,
    functions:mainModel.functions,
    globals:mainModel.globals,
  };

  const template = UnderscoreTemplate(contents);
  const complied = template(model);
  return complied;
}

function getAddition(additionalSelections){
  const mainModel = {
    headers:[],
    globals:[],
    tasks:[],
    functions:[]
  }

  additionalSelections.forEach(addition=>{
    const templateJson = require(path.join(__dirname,"Additions",addition,"template.json"))
    const newHeaders = templateJson.headers.filter(header => !mainModel.headers.includes(header))
    mainModel.headers = [...mainModel.headers, ...newHeaders]
    mainModel.tasks = [...mainModel.tasks, ...templateJson.tasks]
    mainModel.functions = [...mainModel.functions, ...templateJson.function]
    mainModel.globals = [...mainModel.globals, ...templateJson.globals]
  })
  return mainModel;
}

generate();
