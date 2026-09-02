const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "dist");

function run(cmd) {
  console.log("\n>>> " + cmd);
  execSync(cmd, { stdio: "inherit" });
}

// 1. 检查 dist
if (!fs.existsSync(DIST)) {
  console.log("❌ dist 不存在，开始 build...");
  run("npm run build");
}

// 2. 再检查
if (!fs.existsSync(DIST)) {
  console.log("❌ build 失败，没有 dist 文件夹");
  process.exit(1);
}

console.log("✅ dist 已生成");

// 3. 部署
run("npx wrangler pages deploy dist --project-name ai-wego-v3");

console.log("\n🚀 部署完成！");