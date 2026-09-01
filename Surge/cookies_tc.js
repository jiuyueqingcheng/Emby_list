const cookie = $input.text();

if (!cookie || !cookie.trim()) {
    $notification.post("Cookie 保存", "取消", "没有输入 Cookie");
    $done();
    return;
}

// 自动清理 Cookie 前面的 "Cookie:"
const cleanCookie = cookie
    .trim()
    .replace(/^Cookie\s*:\s*/i, "")
    .trim();

$persistentStore.write(cleanCookie, "sgcc_cookie");

$notification.post(
    "Cookie 保存成功",
    "SGCC Cookie 已保存",
    "变量名：sgcc_cookie"
);

$done();