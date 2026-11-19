
// ===================================
// FIND SIMON - 游戏基础逻辑
// ===================================

const STORAGE_KEY = "findSimonGame";

// 五种拼图类型
const PIECES = ["A", "B", "C", "D", "E"];

// 生成游客编号
function createPlayerId() {
  return "SIMON-" + Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}

// 读取本地游戏记录
function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    return JSON.parse(saved);
  }

  return {
    playerId: createPlayerId(),
    collected: [],
    completedAt: null
  };
}

let game = loadGame();

// 保存游戏记录
function saveGame() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(game)
  );
}

// 显示提示
let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// 更新页面
function updatePage() {

  // 游客编号
  document.getElementById("playerId").textContent =
    game.playerId;

  // 收集数量
  const count = game.collected.length;

  document.getElementById("progressText").textContent =
    count + " / 5";

  // 进度条
  document.getElementById("progressFill").style.width =
    (count / 5 * 100) + "%";

  // 更新五块拼图状态
  PIECES.forEach(piece => {

    const element = document.querySelector(
      `[data-piece="${piece}"]`
    );

    const collected = game.collected.includes(piece);

    if (collected) {
      element.classList.remove("locked");
      element.classList.add("unlocked");

      element.querySelector(".piece-icon").textContent = "✓";
      element.querySelector("small").textContent = "FOUND";
    } else {
      element.classList.add("locked");
      element.classList.remove("unlocked");

      element.querySelector(".piece-icon").textContent = "?";
      element.querySelector("small").textContent = "LOCKED";
    }
  });

  // 完成状态
  const successCard = document.getElementById("successCard");

  if (count === 5) {
    successCard.classList.remove("hidden");

    document.getElementById("completionId").textContent =
      "PLAYER ID: " + game.playerId;
  } else {
    successCard.classList.add("hidden");
  }
}


// 扫描碎片
function scanPiece(piece) {

  // 检查碎片类型是否合法
  if (!PIECES.includes(piece)) {
    showToast("无效的拼图编号 / Invalid piece");
    return;
  }

  // 已经完成游戏
  if (game.completedAt) {
    showToast("你已经完成游戏！ / Already completed!");
    return;
  }

  // 检查是否已经收集过这种碎片
  if (game.collected.includes(piece)) {
    showToast("这组碎片已经收集过啦！ / Already collected!");
    return;
  }

  // 只添加尚未收集过的碎片类型
  game.collected.push(piece);

  // 判断是否集齐五种不同碎片
  const allCollected = PIECES.every(
    item => game.collected.includes(item)
  );

  // 集齐五种
  if (allCollected) {
    game.completedAt = new Date().toISOString();
    showToast("恭喜！你集齐五种拼图了！ / Simon found!");
  } else {
    showToast(
      "成功获得 " + piece + " 组拼图！ / Piece " + piece + " found!"
    );
  }

  saveGame();
updatePage();
}

// 重置游戏
function resetGame() {

  const confirmed = confirm(
    "确定要重置当前测试进度吗？\nReset your demo progress?"
  );

  if (!confirmed) return;

  game = {
    playerId: createPlayerId(),
    collected: [],
    completedAt: null
  };

  saveGame();
  updatePage();

  showToast("测试进度已重置 / Progress reset");
}

// 读取NFC链接中的碎片信息
function checkNFCLink() {

  const params = new URLSearchParams(window.location.search);

  const piece = params.get("piece");
  const tag = params.get("tag");

  if (piece && tag) {

    // 基础格式检查
    if (
      PIECES.includes(piece) &&
      /^[ABCDE][0-9]{2}$/.test(tag) &&
      tag.startsWith(piece)
    ) {
      scanPiece(piece);
    } else {
      showToast("贴纸信息无效 / Invalid NFC tag");
    }
  }
}

// 初始化
updatePage();
checkNFCLink();
