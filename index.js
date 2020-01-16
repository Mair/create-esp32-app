#!/usr/bin/env node
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const UnderscoreTemplate = require("underscore.template");

inquirer.registerPrompt("fuzzypath", require("inquirer-fuzzy-path"));

const CURR_DIR = process.cwd();

const rootPath = process.platform === "win32" ? "c:\\" : require("os").homedir();

let defaultIDFPath;
if (!!process.env.IDF_PATH) {
  console.log(chalk.magenta("IDF_PATH env var set! using " + process.env.IDF_PATH));
  defaultIDFPath = process.env.IDF_PATH;
} else {
  console.log(chalk.magenta("IDF_PATH env var not set"));
  defaultIDFPath = path.join(rootPath, "esp", "esp-idf");
}

let defaultExtensiaToolsPath;
if (!!process.env.IDF_TOOLS_PATH) {
  console.log(chalk.magenta("IDF_TOOLS_PATH env var set! using " + process.env.IDF_TOOLS_PATH));
  defaultExtensiaToolsPath = process.env.IDF_TOOLS_PATH;
} else {
  console.log(chalk.magenta("IDF_TOOLS_PATH env var not set"));
  defaultExtensiaToolsPath = path.join(rootPath, "esp", "tools", ".espressif");
}

const questions = [
  {
    name: "projectName",
    type: "input",
    message: "Project Name",
    validate: function(input) {
      const folderName = `${CURR_DIR}/${input}`;
      if (fs.existsSync(folderName)) {
        return "Project name directory already exists. Please use another name";
      }
      if (/^([A-Za-z\_][A-Za-z\-\_\d])/.test(input)) return true;
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
    message: "Select directory to espressif Tools (Xtensa tools[.espressif] directory])",
    default: defaultExtensiaToolsPath,
    suggestOnly: true,
    depthLimit: 1
  },
  {
    name: "Additions",
    type: "checkbox",
    message: "Select additional sample code",
    choices: [
      { name: "debug [debug cfg files]", value: "debug" },
      { name: "blinky [example: blink led]", value: "blinky" },
      { name: "menuconfig [example: config menu with idf.py menuconfig]", value: "menuconfig" },
      { name: "example connect [example: connect to internet]", value: "example_connect" }
      // {name:"SPIFS [files]", value:"SPIFS"},
    ]
  }
];

async function generate() {
  const answers = await inquirer.prompt(questions);
  console.log("answers", answers);

  fs.mkdirSync(path.join(CURR_DIR, answers.projectName));
  const templatePath = path.join(__dirname, "esp-idf-template");
  console.log(chalk.cyan(`Generating Template with name"${answers.projectName}"`));
  var templateModel = generateTemplateModel(answers);
  createDirectoryContents(templatePath, answers.projectName, templateModel);
  //additions
  answers.Additions.forEach(addition => {
    const additionsPath = path.resolve(__dirname, "additions", addition, "files");
    createDirectoryContents(additionsPath, answers.projectName, templateModel);
  });

  console.log(chalk.green("Success"));
  console.log(chalk.green("see read me for more information or visit us on"));
  console.log(chalk.greenBright.bold.underline("https://learnesp32.com"));
  console.log(chalk.green("please navigate to your new project and open it in vscode"));
  console.log(chalk.cyan(`cd ${answers.projectName}`));
  console.log(chalk.cyan("code ."));
}

function createDirectoryContents(templatePath, newProjectPath, templateModel) {
  const filesToCreate = fs.readdirSync(templatePath);
  filesToCreate.forEach(file => {
    const origFilePath = path.resolve(templatePath, file);
    const stats = fs.statSync(origFilePath);
    const newPath = path.resolve(CURR_DIR, newProjectPath, file);
    if (stats.isFile()) {
      const contents = fs.readFileSync(origFilePath, "utf8");
      const updatedContents = applyTemplate(contents, templateModel);
      if (file === ".npmignore") file = ".gitignore";
      fs.writeFileSync(newPath, updatedContents, "utf8");
    } else if (stats.isDirectory()) {
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath);
      }
      createDirectoryContents(path.join(templatePath, file), path.join(newProjectPath, file), templateModel);
    }
  });
}

function generateTemplateModel(answers) {
  const { iDFPath, toolsPath, projectName } = answers;
  const forwardSlash_idfPath = iDFPath.replace(/\\/g, "/");
  const forwardSlash_toolsPath = toolsPath.replace(/\\/g, "/");
  const forwardSlash_elf_Path = `${CURR_DIR.replace(/\\/g, "/")}/${projectName}/build/${projectName}.elf`;
  const backSlash_idf_path_escaped = forwardSlash_idfPath.replace(/\//g, "\\\\");

  const mainModel = getAddition(answers.Additions);

  const model = {
    IDF_TOOLS_PATH: forwardSlash_toolsPath,
    IDF_PATH: forwardSlash_idfPath,
    ELF_PATH: forwardSlash_elf_Path,
    PROJECT_NAME: projectName,
    IDF_PATH_BACKSLASH_ESCAPED: backSlash_idf_path_escaped,
    headers: mainModel.headers,
    tasks: mainModel.tasks,
    functions: mainModel.functions,
    globals: mainModel.globals,
    extraComponents: mainModel.extraComponents
  };
  return model;
}

function applyTemplate(contents, model) {
  const template = UnderscoreTemplate(contents);
  const complied = template(model);
  return complied;
}

function getAddition(additionalSelections) {
  const mainModel = {
    headers: [],
    globals: [],
    tasks: [],
    functions: [],
    extraComponents: []
  };

  additionalSelections.forEach(addition => {
    const templateJson = require(path.join(__dirname, "additions", addition, "template.json"));
    if (!!templateJson.headers) {
      const newHeaders = templateJson.headers.filter(header => !mainModel.headers.includes(header));
      mainModel.headers = [...mainModel.headers, ...newHeaders];
    }
    if (!!templateJson.tasks) {
      mainModel.tasks = [...mainModel.tasks, ...templateJson.tasks];
    }
    if (!!templateJson.function) {
      mainModel.functions = [...mainModel.functions, ...templateJson.function];
    }
    if (!!templateJson.globals) {
      mainModel.globals = [...mainModel.globals, ...templateJson.globals];
    }
    if (!!templateJson.extraComponents) {
      mainModel.extraComponents = [...mainModel.extraComponents, ...templateJson.extraComponents];
    }
  });
  return mainModel;
}

generate();
