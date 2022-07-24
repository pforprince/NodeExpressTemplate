const { readFile, writeFile, promises: fsPromises } = require("fs");

const writeNewToken = (token) => {
  readFile("./shared/Utils.js", "utf-8", function (err, content) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("token", token);
    console.log(content);

    var replaced = `const BASEURL = "https://production.deepvue.tech/v1";\nconst BEARER_TOKEN ="${token}";\nmodule.exports = { BASEURL, BEARER_TOKEN };`;

    writeFile("./shared/Utils.js", replaced, "utf-8", function (err) {
      if (err) console.log(err);
      else console.log("Token Rewritten successfully");
    });
  });
};

module.exports = { writeNewToken };
