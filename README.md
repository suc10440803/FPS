# Zombie Warfare FPS

這是一個根據 `Zombie_Warfare_FPS_Full_GDD.pdf` 製作的 Three.js 瀏覽器 FPS 原型。它聚焦在第一階段可遊玩的核心：FPS 控制、殭屍波次、四種武器、裝填、金幣、XP、升級、商店與 HUD。

## 開始遊玩

```bash
npm install
npm run dev
```

打開終端機顯示的網址，通常是：

```text
http://127.0.0.1:5173
```

進入頁面後按「開始作戰」鎖定滑鼠。

## 操作

- `WASD` 移動
- 滑鼠移動瞄準
- 滑鼠左鍵射擊
- 滑鼠右鍵切換 AWP 開鏡
- `Shift` 衝刺
- `Space` 跳躍
- `C` 蹲下
- `R` 裝填
- `1` Knife
- `2` Pistol
- `3` AK-47（商店解鎖）
- `4` AWP（商店解鎖）
- `5` M249（商店解鎖）
- `G` 投擲手榴彈
- `B` 暫停遊戲並開關商店
- 商店內可點「繼續作戰」回到戰鬥
- `Esc` 釋放滑鼠

## 已實作的 GDD 功能

- 第一人稱控制器
- Abandoned Factory 風格地圖
- Zombie Mode 生存波次
- AK-47、M249、AWP、Knife
- 向上後座力、散射、裝填、爆頭倍率
- 程序化武器聲音、裝填音、購買音、受傷與擊殺音效
- 四把武器各自有不同第一人稱外型
- 手槍與小刀開局可用，其他武器需要在商店購買
- 手榴彈、Boss 波次、Boss 血條與遠程攻擊
- 生命、護甲、金幣、經驗、等級
- HUD、武器選擇、商店、戰鬥提示
- 殭屍 AI 狀態機：Patrol、Detect、Chase、Attack、Dead
- Walker、Runner、Brute 三種殭屍體型與速度/血量差異

多人連線、Socket.io、MongoDB、排行榜與同步造型屬於後續階段，這個版本先把單機核心玩法做成可直接測試的基礎。

## 第三方模型署名

- `src/assets/models/ak47.glb`: `Ak47` by wburton, licensed under CC-BY-4.0. Source: https://sketchfab.com/3d-models/ak47-831519a097d84e079fd8bc4b15e5b57d
- `src/assets/models/awp.glb`: `RIFLE | AWP Weapon Model (CS2)` by 6lucius, licensed under CC-BY-4.0. Source: https://sketchfab.com/3d-models/rifle-awp-weapon-model-cs2-23ad3d7fb46b40e59cab7937654e2691
