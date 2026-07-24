const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

if (!process.stdin.isTTY) {
  console.error("请在交互式终端中运行此命令。");
  process.exit(1);
}

process.stdout.write("请输入新的管理员密码（输入不会显示）: ");
let password = "";
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", (key) => {
  if (key === "\u0003") process.exit(130);
  if (key === "\r" || key === "\n") {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write("\n");
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, 64);
    password = "";
    const passwordHash = `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
    const sessionSecret = crypto.randomBytes(32).toString("base64url");
    const envPath = path.join(process.cwd(), ".env");
    fs.writeFileSync(envPath, `ADMIN_PASSWORD_HASH=${passwordHash}\nSESSION_SECRET=${sessionSecret}\n`, { encoding: "utf8", mode: 0o600 });
    console.log("管理员密码已安全配置到 .env，请重启服务。");
  } else if (key === "\u007f" || key === "\b") {
    password = password.slice(0, -1);
  } else if (key >= " ") {
    password += key;
  }
});
