import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./style.css";

const hitmarkerSoundUrl = new URL("../hitmarker_2.mp3", import.meta.url).href;
const ak47ModelUrl = new URL("./assets/models/ak47.glb", import.meta.url).href;
const app = document.querySelector("#app");

app.innerHTML = `
  <div class="hud">
    <div class="topbar">
      <div class="stat-row">
        <div class="pill">生命<strong id="health">100</strong></div>
        <div class="pill">護甲<strong id="armor">50</strong></div>
        <div class="pill">金幣<strong id="coins">0</strong></div>
        <div class="pill">等級<strong id="level">1</strong></div>
        <div class="pill">手雷<strong id="grenades">0</strong></div>
      </div>
      <div class="stat-row">
        <div class="pill">波次<strong id="wave">1</strong></div>
        <div class="pill">擊殺<strong id="kills">0</strong></div>
        <div class="pill">殭屍<strong id="remaining">0</strong></div>
      </div>
    </div>
    <div class="sidepanel">
      <div class="objective">
        <h2>Zombie Mode</h2>
        <p id="objective">在廢棄工廠生存，擊退感染波次。按 B 使用金幣購買補給。</p>
      </div>
      <div class="objective">
        <h2>任務</h2>
        <p id="mission">連續擊殺 5 隻殭屍可獲得額外金幣。</p>
      </div>
    </div>
    <div class="notice" id="notice"></div>
    <form class="dev-console" id="devConsole">
      <label for="consoleInput">Console</label>
      <input id="consoleInput" autocomplete="off" spellcheck="false" placeholder="kill / money" />
      <small id="consoleOutput">按 Enter 執行，按波浪鍵關閉。</small>
    </form>
    <div class="crosshair"></div>
    <svg class="reload-ring" id="reloadRing" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="reload-ring-bg" cx="50" cy="50" r="42"></circle>
      <circle class="reload-ring-progress" id="reloadProgress" cx="50" cy="50" r="42"></circle>
    </svg>
    <div class="scope-overlay" id="scopeOverlay"></div>
    <div class="hitmarker" id="hitmarker"></div>
    <div class="damage" id="damage"></div>
    <div class="shop" id="shop">
      <div class="shop-header">
        <strong>戰地補給站</strong>
        <small id="shopInflation">危機蔓延中，物資價格每 3 波上漲。</small>
        <button id="continueButton">繼續作戰</button>
      </div>
      <div class="shop-item">
        <h3>醫療包 · <span data-price="medkit">75</span></h3>
        <p>立即恢復 45 生命，最高 100。</p>
        <button data-buy="medkit">購買</button>
      </div>
      <div class="shop-item">
        <h3>護甲板 · <span data-price="armor">90</span></h3>
        <p>補充 40 護甲，最高 100。</p>
        <button data-buy="armor">購買</button>
      </div>
      <div class="shop-item">
        <h3>彈藥箱 · <span data-price="ammo">110</span></h3>
        <p>補滿目前武器的備用彈藥。</p>
        <button data-buy="ammo">購買</button>
      </div>
      <div class="shop-item">
        <h3>AK-47 · <span data-price="weapon-ak">900</span></h3>
        <p>解鎖步槍，穩定連射與中距離壓制。</p>
        <button data-buy="weapon-ak">購買</button>
      </div>
      <div class="shop-item">
        <h3>AWP · <span data-price="weapon-awp">1600</span></h3>
        <p>解鎖狙擊槍，高傷害並可右鍵開鏡。</p>
        <button data-buy="weapon-awp">購買</button>
      </div>
      <div class="shop-item">
        <h3>M249 · <span data-price="weapon-m249">2400</span></h3>
        <p>解鎖機槍，高彈量但裝填較慢。</p>
        <button data-buy="weapon-m249">購買</button>
      </div>
      <div class="shop-item">
        <h3>手榴彈 · <span data-price="grenade">300</span></h3>
        <p>最多持有 3 顆。按 G 投擲，爆炸會傷到自己。</p>
        <button data-buy="grenade">購買</button>
      </div>
    </div>
    <div class="boss-health" id="bossHealth">
      <strong id="bossName">BOSS</strong>
      <div><span id="bossHealthFill"></span></div>
    </div>
    <div class="bottombar">
      <div class="weapon-stack" id="weapons"></div>
      <div class="ammo"><span id="mag">30</span><small>/</small><span id="reserve">120</span></div>
    </div>
    <div class="start-screen" id="startScreen">
      <div class="start-card">
        <h1>Zombie Warfare FPS</h1>
        <p>感染從工廠實驗區爆發後，補給線正在一波一波斷裂。你只有小刀與手槍起手，必須守住廢棄工廠、擊退殭屍波次、賺取金幣並在商城買下更重的火力。</p>
        <div class="briefing-grid">
          <div>
            <h2>殭屍種類</h2>
            <p>Walker 是標準感染體；Runner 血少但會快速貼近；Brute 行動較慢、血量厚，紅色皮膚更耐爆炸。</p>
          </div>
          <div>
            <h2>Boss 機制</h2>
            <p>每 5 波出現白色紅眼 Boss。牠會發射可見能量彈、破甲重創玩家，也會機率性突進造成近戰傷害。</p>
          </div>
          <div>
            <h2>商城系統</h2>
            <p>按 B 暫停並打開補給站。殭屍危機不斷蔓延，裝備物資每 3 波結束會跟著漲價。</p>
          </div>
        </div>
        <div class="controls-grid">
          <div class="control">WASD 移動</div>
          <div class="control">滑鼠瞄準 / 左鍵射擊</div>
          <div class="control">Shift 衝刺 / Space 跳躍</div>
          <div class="control">1-5 切換武器 / G 手榴彈 / B 商店</div>
        </div>
        <button id="startButton">開始作戰</button>
      </div>
    </div>
    <div class="game-over" id="gameOver">
      <div class="start-card">
        <h1>任務失敗</h1>
        <p id="summary"></p>
        <button id="restartButton">重新部署</button>
      </div>
    </div>
  </div>
`;

const ui = {
  health: document.querySelector("#health"),
  armor: document.querySelector("#armor"),
  coins: document.querySelector("#coins"),
  level: document.querySelector("#level"),
  grenades: document.querySelector("#grenades"),
  wave: document.querySelector("#wave"),
  kills: document.querySelector("#kills"),
  remaining: document.querySelector("#remaining"),
  weapons: document.querySelector("#weapons"),
  mag: document.querySelector("#mag"),
  reserve: document.querySelector("#reserve"),
  reloadRing: document.querySelector("#reloadRing"),
  reloadProgress: document.querySelector("#reloadProgress"),
  scopeOverlay: document.querySelector("#scopeOverlay"),
  notice: document.querySelector("#notice"),
  devConsole: document.querySelector("#devConsole"),
  consoleInput: document.querySelector("#consoleInput"),
  consoleOutput: document.querySelector("#consoleOutput"),
  hitmarker: document.querySelector("#hitmarker"),
  damage: document.querySelector("#damage"),
  shop: document.querySelector("#shop"),
  shopInflation: document.querySelector("#shopInflation"),
  continueButton: document.querySelector("#continueButton"),
  bossHealth: document.querySelector("#bossHealth"),
  bossName: document.querySelector("#bossName"),
  bossHealthFill: document.querySelector("#bossHealthFill"),
  startScreen: document.querySelector("#startScreen"),
  startButton: document.querySelector("#startButton"),
  gameOver: document.querySelector("#gameOver"),
  restartButton: document.querySelector("#restartButton"),
  summary: document.querySelector("#summary"),
};

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d0d);
scene.fog = new THREE.FogExp2(0x0b0d0d, 0.028);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  220,
);
camera.rotation.order = "YXZ";

const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();
const keys = new Set();
const mouse = { locked: false, shooting: false };
const player = {
  position: new THREE.Vector3(0, 1.72, 11),
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  health: 100,
  armor: 50,
  coins: 120,
  grenades: 0,
  xp: 0,
  level: 1,
  kills: 0,
  streak: 0,
  grounded: false,
  crouch: false,
  active: false,
  dead: false,
};

const weapons = [
  {
    key: "1",
    name: "Knife",
    role: "Melee",
    damage: 90,
    headshot: 1,
    fireRate: 0.42,
    spread: 0,
    recoil: 0.005,
    magSize: Infinity,
    reserveMax: Infinity,
    reload: 0,
    range: 2.3,
    automatic: false,
    owned: true,
    mag: Infinity,
    reserve: Infinity,
  },
  {
    key: "2",
    name: "Pistol",
    role: "Sidearm",
    damage: 22,
    headshot: 1.75,
    fireRate: 0.22,
    spread: 0.014,
    recoil: 0.011,
    magSize: 12,
    reserveMax: Infinity,
    reload: 1.25,
    range: 55,
    automatic: false,
    owned: true,
    mag: 12,
    reserve: Infinity,
  },
  {
    key: "3",
    name: "AK-47",
    role: "Balanced",
    price: 900,
    damage: 28,
    headshot: 1.8,
    fireRate: 0.105,
    spread: 0.018,
    recoil: 0.016,
    magSize: 30,
    reserveMax: 150,
    reload: 1.5,
    range: 80,
    automatic: true,
    owned: false,
    mag: 30,
    reserve: 120,
  },
  {
    key: "4",
    name: "AWP",
    role: "Sniper",
    price: 1600,
    damage: 105,
    headshot: 2.5,
    fireRate: 0.9,
    spread: 0.004,
    recoil: 0.048,
    magSize: 5,
    reserveMax: 35,
    reload: 2.1,
    range: 130,
    automatic: false,
    owned: false,
    mag: 5,
    reserve: 25,
  },
  {
    key: "5",
    name: "M249",
    role: "High ammo",
    price: 2400,
    damage: 20,
    headshot: 1.45,
    fireRate: 0.075,
    spread: 0.03,
    recoil: 0.021,
    magSize: 80,
    reserveMax: 240,
    reload: 2.6,
    range: 70,
    automatic: true,
    owned: false,
    mag: 80,
    reserve: 160,
  },
];

let currentWeapon = 1;
let canShootAt = 0;
let reloadingUntil = 0;
let reloadStartedAt = 0;
let reloadGlowUntil = 0;
let wave = 1;
let betweenWaves = 0;
let noticeUntil = 0;
let gameMode = "start";
let scoped = false;
let scopeAmount = 0;
let sprintUntil = 0;
let consolePreviousMode = "start";
const lastMoveTap = { KeyW: -Infinity, KeyS: -Infinity };
const zombies = [];
const colliders = [];
const bullets = [];
const grenades = [];
const explosions = [];
const bossProjectiles = [];
let audioContext;
let hitmarkerBuffer = null;
let hitmarkerLoading = null;
const gltfLoader = new GLTFLoader();
const ak47Asset = {
  loaded: false,
  mixer: null,
  actions: {},
  activeAction: null,
  fallback: null,
  glbRoot: null,
  restoreTimer: null,
};
const baseShopPrices = {
  medkit: 75,
  armor: 90,
  ammo: 110,
  "weapon-ak": 900,
  "weapon-awp": 1600,
  "weapon-m249": 2400,
  grenade: 300,
};

function shopInflationTier() {
  return Math.floor(Math.max(0, wave - 1) / 3);
}

function shopPrice(item) {
  const base = baseShopPrices[item];
  if (!base) return 0;
  return Math.ceil(base * (1 + shopInflationTier() * 0.18));
}

const materials = {
  floor: new THREE.MeshStandardMaterial({ color: 0x2b302d, roughness: 0.86 }),
  wall: new THREE.MeshStandardMaterial({ color: 0x555d55, roughness: 0.78 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x626b66, roughness: 0.5, metalness: 0.2 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x1b2020, roughness: 0.52, metalness: 0.28 }),
  barrel: new THREE.MeshStandardMaterial({ color: 0x111414, roughness: 0.42, metalness: 0.38 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x7a4c2c, roughness: 0.78 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.86 }),
  blade: new THREE.MeshStandardMaterial({ color: 0xd2d8d2, roughness: 0.24, metalness: 0.65 }),
  glove: new THREE.MeshStandardMaterial({ color: 0x29231d, roughness: 0.88 }),
  sleeve: new THREE.MeshStandardMaterial({ color: 0x344039, roughness: 0.86 }),
  hazard: new THREE.MeshStandardMaterial({ color: 0xc08f2b, roughness: 0.64 }),
  zombie: new THREE.MeshStandardMaterial({ color: 0x587f4a, roughness: 0.92 }),
  zombieHead: new THREE.MeshStandardMaterial({ color: 0x78a85f, roughness: 0.92 }),
  runnerSkin: new THREE.MeshStandardMaterial({ color: 0x6aa35b, roughness: 0.92 }),
  bruteSkin: new THREE.MeshStandardMaterial({ color: 0x654844, roughness: 0.96 }),
  bossSkin: new THREE.MeshStandardMaterial({ color: 0xe8e6dc, roughness: 0.88 }),
  bossCloth: new THREE.MeshStandardMaterial({ color: 0xebe4d6, roughness: 0.92 }),
  tornCloth: new THREE.MeshStandardMaterial({ color: 0x343a44, roughness: 0.96 }),
  bruteCloth: new THREE.MeshStandardMaterial({ color: 0x4a332b, roughness: 0.96 }),
  eye: new THREE.MeshBasicMaterial({ color: 0xd8ff72 }),
  bossEye: new THREE.MeshBasicMaterial({ color: 0xff1717 }),
  blood: new THREE.MeshStandardMaterial({ color: 0x7d1716, roughness: 0.85 }),
  muzzle: new THREE.MeshBasicMaterial({ color: 0xffd575 }),
  energy: new THREE.MeshBasicMaterial({ color: 0xff342a, transparent: true, opacity: 0.96 }),
  smoke: new THREE.MeshBasicMaterial({ color: 0x6a6256, transparent: true, opacity: 0.42 }),
  spark: new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 1 }),
};

function ensureAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) audioContext = new AudioCtx();
  if (audioContext.state === "suspended") audioContext.resume();
  loadHitmarkerSound();
  return audioContext;
}

function loadHitmarkerSound() {
  const ctx = audioContext;
  if (!ctx || hitmarkerBuffer || hitmarkerLoading) return;
  hitmarkerLoading = fetch(hitmarkerSoundUrl)
    .then((response) => response.arrayBuffer())
    .then((buffer) => ctx.decodeAudioData(buffer))
    .then((decoded) => {
      hitmarkerBuffer = decoded;
    })
    .catch(() => {
      hitmarkerBuffer = null;
    });
}

function noiseBuffer(duration = 0.08) {
  const ctx = ensureAudio();
  if (!ctx) return null;
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function playTone({ frequency, endFrequency, duration, gain = 0.18, type = "square" }) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency || frequency), now + duration);
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playNoise(duration, gain = 0.12, filterFrequency = 1800) {
  const ctx = ensureAudio();
  const buffer = noiseBuffer(duration);
  if (!ctx || !buffer) return;
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFrequency, now);
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
  source.connect(filter).connect(amp).connect(ctx.destination);
  source.start(now);
}

function playWeaponSound(weaponName) {
  if (weaponName === "AK-47") {
    playTone({ frequency: 170, endFrequency: 62, duration: 0.09, gain: 0.19, type: "sawtooth" });
    playNoise(0.075, 0.16, 1900);
  } else if (weaponName === "M249") {
    playTone({ frequency: 135, endFrequency: 48, duration: 0.065, gain: 0.17, type: "sawtooth" });
    playNoise(0.055, 0.15, 1500);
  } else if (weaponName === "AWP") {
    playTone({ frequency: 92, endFrequency: 28, duration: 0.22, gain: 0.24, type: "triangle" });
    playNoise(0.16, 0.19, 950);
  } else {
    playTone({ frequency: 640, endFrequency: 210, duration: 0.12, gain: 0.12, type: "triangle" });
    playNoise(0.05, 0.08, 2600);
  }
}

function playUiSound(kind) {
  if (kind === "reload") playTone({ frequency: 420, endFrequency: 160, duration: 0.18, gain: 0.08, type: "triangle" });
  if (kind === "buy") playTone({ frequency: 520, endFrequency: 820, duration: 0.12, gain: 0.1, type: "sine" });
  if (kind === "fail") playTone({ frequency: 150, endFrequency: 95, duration: 0.18, gain: 0.11, type: "sawtooth" });
  if (kind === "hurt") playTone({ frequency: 85, endFrequency: 42, duration: 0.16, gain: 0.14, type: "sawtooth" });
  if (kind === "kill") playTone({ frequency: 240, endFrequency: 520, duration: 0.1, gain: 0.08, type: "triangle" });
}

function playHitSound(headshot = false) {
  const ctx = ensureAudio();
  if (!ctx) return;
  if (hitmarkerBuffer) {
    const source = ctx.createBufferSource();
    const amp = ctx.createGain();
    source.buffer = hitmarkerBuffer;
    source.playbackRate.value = headshot ? 1.08 : 1;
    amp.gain.value = headshot ? 0.95 : 0.82;
    source.connect(amp).connect(ctx.destination);
    source.start();
    return;
  }
  const now = ctx.currentTime;
  const click = ctx.createOscillator();
  const body = ctx.createOscillator();
  const clickGain = ctx.createGain();
  const bodyGain = ctx.createGain();
  click.type = "square";
  body.type = "triangle";
  click.frequency.setValueAtTime(headshot ? 1320 : 980, now);
  click.frequency.exponentialRampToValueAtTime(headshot ? 820 : 620, now + 0.042);
  body.frequency.setValueAtTime(headshot ? 125 : 96, now);
  body.frequency.exponentialRampToValueAtTime(headshot ? 62 : 44, now + 0.095);
  clickGain.gain.setValueAtTime(headshot ? 0.16 : 0.12, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  bodyGain.gain.setValueAtTime(headshot ? 0.28 : 0.23, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  click.connect(clickGain).connect(ctx.destination);
  body.connect(bodyGain).connect(ctx.destination);
  click.start(now);
  body.start(now);
  click.stop(now + 0.06);
  body.stop(now + 0.11);
  playNoise(0.024, headshot ? 0.085 : 0.065, headshot ? 2400 : 1700);
}

function playLegacyHitSound(headshot = false) {
  playTone({
    frequency: headshot ? 140 : 92,
    endFrequency: headshot ? 55 : 34,
    duration: headshot ? 0.14 : 0.11,
    gain: headshot ? 0.17 : 0.13,
    type: "triangle",
  });
  playNoise(0.035, headshot ? 0.08 : 0.055, headshot ? 1200 : 640);
}

function addLights() {
  const ambient = new THREE.HemisphereLight(0xc6d4c7, 0x1a1b18, 0.72);
  scene.add(ambient);

  const moon = new THREE.DirectionalLight(0xe2f1ff, 1.55);
  moon.position.set(-18, 24, 8);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.near = 1;
  moon.shadow.camera.far = 70;
  moon.shadow.camera.left = -35;
  moon.shadow.camera.right = 35;
  moon.shadow.camera.top = 35;
  moon.shadow.camera.bottom = -35;
  scene.add(moon);

  const redAlarm = new THREE.PointLight(0xe23a2e, 1.8, 24);
  redAlarm.position.set(-11, 4, -12);
  scene.add(redAlarm);

  const labGlow = new THREE.PointLight(0x62d4b1, 1.4, 18);
  labGlow.position.set(13, 3.8, -15);
  scene.add(labGlow);
}

function box(size, position, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addCollider(mesh) {
  mesh.updateMatrixWorld();
  colliders.push(new THREE.Box3().setFromObject(mesh));
}

function actorBoxAt(position, radius, height = 1.8) {
  return new THREE.Box3(
    new THREE.Vector3(position.x - radius, 0, position.z - radius),
    new THREE.Vector3(position.x + radius, height, position.z + radius),
  );
}

function intersectsWorld(position, radius, height = 1.8) {
  const box = actorBoxAt(position, radius, height);
  return colliders.some((collider) => box.intersectsBox(collider));
}

function segmentBlocked(from, to) {
  const delta = to.clone().sub(from);
  const distance = delta.length();
  if (distance <= 0.001) return false;
  const ray = new THREE.Ray(from, delta.normalize());
  const hitPoint = new THREE.Vector3();
  return colliders.some((collider) => {
    const hit = ray.intersectBox(collider, hitPoint);
    return Boolean(hit) && hit.distanceTo(from) < distance - 0.08;
  });
}

function hasLineOfSight(from, to) {
  return !segmentBlocked(from, to);
}

function buildMap() {
  box([72, 1, 72], [0, -0.5, 0], materials.floor, false);

  [
    [[72, 6, 1.2], [0, 2.5, -36]],
    [[72, 6, 1.2], [0, 2.5, 36]],
    [[1.2, 6, 72], [-36, 2.5, 0]],
    [[1.2, 6, 72], [36, 2.5, 0]],
    [[16, 5, 2], [-12, 2, -9]],
    [[13, 5, 2], [16, 2, 7]],
    [[2, 5, 17], [2, 2, -20]],
    [[2, 5, 14], [-21, 2, 14]],
  ].forEach(([size, pos]) => addCollider(box(size, pos, materials.wall)));

  const cratePositions = [
    [-25, 0.8, -18],
    [-22, 0.8, -15],
    [-14, 0.8, 18],
    [19, 0.8, -22],
    [23, 0.8, 18],
    [6, 0.8, 19],
  ];
  cratePositions.forEach((pos, i) => {
    const crate = box([2.6, 1.6 + (i % 2) * 0.8, 2.6], pos, materials.metal);
    addCollider(crate);
  });

  for (let i = 0; i < 9; i += 1) {
    const x = -30 + i * 7.5;
    box([0.35, 5.6, 0.35], [x, 2.3, -30], materials.hazard);
    box([0.35, 5.6, 0.35], [x, 2.3, 30], materials.hazard);
  }

  const vatGeo = new THREE.CylinderGeometry(1.2, 1.2, 4.5, 24);
  for (let i = 0; i < 5; i += 1) {
    const vat = new THREE.Mesh(vatGeo, materials.metal);
    vat.position.set(18 + (i % 2) * 4, 2.25, -24 + Math.floor(i / 2) * 4);
    vat.castShadow = true;
    vat.receiveShadow = true;
    scene.add(vat);
  }

  const sign = box([8, 0.2, 2.2], [0, 4.1, -35.2], materials.hazard, false);
  sign.rotation.x = Math.PI * 0.5;
}

function weaponBox(size, position, material, parent) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function weaponTexturedBox(size, position, sideMaterial, capMaterial, parent) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    [sideMaterial, sideMaterial, capMaterial, capMaterial, sideMaterial, sideMaterial],
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function weaponAngledBox(size, position, rotation, material, parent) {
  const mesh = weaponBox(size, position, material, parent);
  mesh.rotation.set(...rotation);
  return mesh;
}

function weaponAngledTexturedBox(size, position, rotation, sideMaterial, capMaterial, parent) {
  const mesh = weaponTexturedBox(size, position, sideMaterial, capMaterial, parent);
  mesh.rotation.set(...rotation);
  return mesh;
}

function weaponCylinder(radius, length, position, material, parent, segments = 16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, segments), material);
  mesh.rotation.x = Math.PI * 0.5;
  mesh.position.set(...position);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function weaponDetailCylinder(radius, length, position, rotation, material, parent, segments = 16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, segments), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeMuzzle(position, parent) {
  const flash = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), materials.muzzle);
  flash.position.set(...position);
  flash.visible = false;
  parent.add(flash);
  return flash;
}

function addWeaponHands(group, leftPosition = [0.08, -0.58, -0.88], rightPosition = [0.5, -0.48, -0.4]) {
  const leftHand = new THREE.Group();
  const rightHand = new THREE.Group();
  weaponBox([0.24, 0.16, 0.28], [0, 0, 0], materials.glove, leftHand);
  weaponBox([0.2, 0.18, 0.34], [0, 0.05, 0.2], materials.sleeve, leftHand);
  weaponBox([0.22, 0.16, 0.24], [0, 0, 0], materials.glove, rightHand);
  weaponBox([0.18, 0.18, 0.3], [0.02, 0.04, 0.2], materials.sleeve, rightHand);
  leftHand.position.set(...leftPosition);
  rightHand.position.set(...rightPosition);
  group.add(leftHand, rightHand);
  group.leftHand = leftHand;
  group.rightHand = rightHand;
  group.leftHandBase = leftHand.position.clone();
  group.rightHandBase = rightHand.position.clone();
}

function createAkModel() {
  const slot = new THREE.Group();
  slot.position.set(0, 0, 0);
  const group = new THREE.Group();
  group.position.set(0.2, -0.1, 0);
  slot.add(group);
  slot.fallback = group;
  slot.userData.usesExternalAnimation = false;

  weaponAngledBox([0.52, 0.18, 0.66], [0.31, -0.33, -0.78], [0, 0, 0.01], materials.darkMetal, group);
  weaponAngledBox([0.48, 0.12, 0.5], [0.29, -0.19, -0.72], [-0.08, 0, 0], materials.metal, group);
  weaponAngledBox([0.11, 0.08, 0.22], [0.06, -0.27, -0.46], [0.12, 0, 0.1], materials.darkMetal, group);
  weaponAngledBox([0.11, 0.08, 0.2], [0.56, -0.27, -0.47], [0.12, 0, -0.1], materials.darkMetal, group);

  weaponCylinder(0.026, 1.12, [0.36, -0.3, -1.62], materials.barrel, group, 20);
  weaponCylinder(0.02, 0.95, [0.31, -0.17, -1.47], materials.barrel, group, 16);
  weaponCylinder(0.046, 0.13, [0.36, -0.3, -2.22], materials.barrel, group, 18);
  weaponBox([0.2, 0.08, 0.1], [0.36, -0.12, -1.95], materials.darkMetal, group);
  weaponBox([0.04, 0.24, 0.04], [0.36, 0.02, -1.97], materials.darkMetal, group);
  weaponBox([0.13, 0.055, 0.08], [0.34, -0.09, -0.85], materials.darkMetal, group);
  weaponBox([0.035, 0.11, 0.035], [0.34, -0.02, -0.86], materials.darkMetal, group);

  weaponAngledBox([0.38, 0.15, 0.52], [0.37, -0.31, -1.2], [0.03, 0, 0], materials.darkMetal, group);
  weaponBox([0.42, 0.035, 0.58], [0.37, -0.18, -1.21], materials.darkMetal, group);
  for (let i = 0; i < 7; i += 1) {
    weaponBox([0.035, 0.035, 0.05], [0.2 + i * 0.055, -0.13, -1.48], materials.darkMetal, group);
  }

  const grip = weaponAngledBox([0.18, 0.52, 0.2], [0.2, -0.61, -0.56], [-0.22, 0, -0.03], materials.wood, group);
  grip.rotation.x = -0.28;
  weaponAngledBox([0.2, 0.16, 0.56], [0.16, -0.36, -0.08], [-0.06, 0, 0.02], materials.wood, group);
  weaponAngledBox([0.24, 0.2, 0.58], [0.11, -0.34, 0.28], [0.02, 0, -0.04], materials.wood, group);

  const mag = new THREE.Group();
  mag.position.set(0.29, -0.68, -0.78);
  for (let i = 0; i < 6; i += 1) {
    const segment = weaponBox([0.2 - i * 0.008, 0.14, 0.28], [0, -i * 0.105, -i * 0.045], materials.darkMetal, mag);
    segment.rotation.x = -0.24 - i * 0.055;
  }
  weaponBox([0.22, 0.055, 0.3], [0, 0.08, 0.02], materials.darkMetal, mag);
  group.add(mag);
  group.mag = mag;
  group.magBase = mag.position.clone();

  for (const screw of [
    [0.1, -0.22, -0.72],
    [0.5, -0.22, -0.72],
    [0.16, -0.39, -0.58],
    [0.46, -0.39, -0.58],
  ]) {
    weaponDetailCylinder(0.025, 0.012, screw, [Math.PI * 0.5, 0, 0], materials.metal, group, 12);
  }
  weaponBox([0.08, 0.035, 0.24], [0.58, -0.22, -0.63], materials.darkMetal, group);
  weaponCylinder(0.012, 0.22, [0.63, -0.22, -0.68], materials.metal, group, 10);

  addWeaponHands(group, [0.12, -0.62, -0.9], [0.5, -0.45, -0.36]);
  slot.flash = makeMuzzle([0.56, -0.41, -2.02], slot);
  return slot;
}

function createPistolModel() {
  const group = new THREE.Group();
  group.position.set(0.24, -0.08, -0.08);
  weaponBox([0.48, 0.16, 0.74], [0.34, -0.3, -0.86], materials.darkMetal, group);
  weaponBox([0.42, 0.11, 0.64], [0.34, -0.2, -0.88], materials.metal, group);
  weaponCylinder(0.032, 0.38, [0.34, -0.22, -1.28], materials.barrel, group, 18);
  weaponBox([0.1, 0.035, 0.06], [0.34, -0.12, -1.18], materials.darkMetal, group);
  weaponBox([0.12, 0.035, 0.06], [0.34, -0.12, -0.58], materials.darkMetal, group);
  weaponBox([0.18, 0.035, 0.16], [0.49, -0.17, -0.82], materials.barrel, group);
  weaponAngledBox([0.16, 0.5, 0.2], [0.26, -0.57, -0.64], [-0.22, 0, -0.02], materials.rubber, group);
  const triggerGuard = new THREE.TorusGeometry(0.11, 0.012, 8, 18, Math.PI);
  const guard = new THREE.Mesh(triggerGuard, materials.darkMetal);
  guard.position.set(0.34, -0.48, -0.82);
  guard.rotation.set(Math.PI * 0.5, 0, Math.PI);
  guard.castShadow = true;
  group.add(guard);
  const mag = weaponAngledBox([0.14, 0.42, 0.18], [0.25, -0.7, -0.63], [-0.18, 0, 0], materials.darkMetal, group);
  group.mag = mag;
  group.magBase = mag.position.clone();
  addWeaponHands(group, [0.16, -0.58, -0.76], [0.48, -0.45, -0.44]);
  group.flash = makeMuzzle([0.34, -0.22, -1.54], group);
  return group;
}

function createM249Model() {
  const group = new THREE.Group();
  group.position.set(0.18, -0.08, 0);
  weaponAngledBox([0.78, 0.34, 0.96], [0.38, -0.31, -0.76], [0.02, 0, 0], materials.darkMetal, group);
  weaponBox([0.66, 0.12, 0.82], [0.38, -0.08, -0.82], materials.metal, group);
  weaponBox([0.74, 0.065, 0.74], [0.38, -0.02, -0.95], materials.darkMetal, group);
  for (let i = 0; i < 9; i += 1) {
    weaponBox([0.04, 0.045, 0.07], [0.08 + i * 0.075, 0.04, -1.29], materials.darkMetal, group);
  }

  const ammoBox = new THREE.Group();
  ammoBox.position.set(0.16, -0.56, -0.68);
  weaponBox([0.54, 0.42, 0.52], [0, 0, 0], materials.metal, ammoBox);
  weaponBox([0.58, 0.06, 0.56], [0, 0.23, 0], materials.darkMetal, ammoBox);
  for (let i = 0; i < 5; i += 1) {
    weaponBox([0.035, 0.34, 0.02], [-0.19 + i * 0.095, 0, -0.28], materials.darkMetal, ammoBox);
  }
  group.add(ammoBox);

  const feed = new THREE.Group();
  feed.position.set(0.34, -0.47, -0.97);
  for (let i = 0; i < 8; i += 1) {
    const link = weaponBox([0.045, 0.04, 0.075], [-0.26 + i * 0.075, Math.sin(i * 0.7) * 0.025, 0], materials.hazard, feed);
    link.rotation.z = Math.sin(i * 0.8) * 0.18;
  }
  group.add(feed);

  weaponCylinder(0.05, 1.42, [0.42, -0.28, -1.65], materials.barrel, group, 22);
  weaponCylinder(0.072, 0.28, [0.42, -0.28, -2.32], materials.barrel, group, 22);
  weaponCylinder(0.024, 0.76, [0.22, -0.13, -1.62], materials.metal, group, 14);
  weaponCylinder(0.024, 0.76, [0.62, -0.13, -1.62], materials.metal, group, 14);
  weaponDetailCylinder(0.018, 0.64, [0.18, -0.79, -1.45], [0.4, 0, 0.22], materials.darkMetal, group, 10);
  weaponDetailCylinder(0.018, 0.64, [0.66, -0.79, -1.45], [0.4, 0, -0.22], materials.darkMetal, group, 10);
  weaponBox([0.28, 0.035, 0.08], [0.42, -1.06, -1.58], materials.darkMetal, group);
  weaponAngledBox([0.19, 0.46, 0.21], [0.36, -0.63, -0.2], [-0.13, 0, 0], materials.rubber, group);
  weaponBox([0.42, 0.18, 0.48], [0.19, -0.32, -0.12], materials.rubber, group);
  weaponBox([0.2, 0.16, 0.16], [0.7, -0.25, -0.58], materials.darkMetal, group);
  weaponCylinder(0.018, 0.24, [0.79, -0.25, -0.58], materials.metal, group, 12);
  group.mag = ammoBox;
  group.magBase = group.mag.position.clone();
  addWeaponHands(group, [0.02, -0.62, -0.73], [0.56, -0.5, -0.28]);
  group.flash = makeMuzzle([0.42, -0.28, -2.47], group);
  return group;
}

function createAwpModel() {
  const group = new THREE.Group();
  group.position.set(0.18, -0.1, 0);
  weaponAngledBox([0.38, 0.16, 1.48], [0.34, -0.33, -0.98], [0.02, 0, 0], materials.darkMetal, group);
  weaponBox([0.28, 0.11, 0.52], [0.34, -0.21, -0.92], materials.metal, group);
  weaponBox([0.3, 0.055, 0.34], [0.34, -0.14, -0.62], materials.darkMetal, group);
  weaponCylinder(0.023, 1.86, [0.36, -0.3, -1.96], materials.barrel, group, 20);
  weaponCylinder(0.045, 0.32, [0.36, -0.3, -2.85], materials.barrel, group, 18);
  weaponCylinder(0.084, 0.62, [0.34, -0.07, -0.76], materials.rubber, group, 24);
  weaponCylinder(0.066, 0.74, [0.34, -0.07, -0.76], materials.barrel, group, 20);
  weaponDetailCylinder(0.034, 0.22, [0.1, -0.07, -0.76], [0, 0, Math.PI * 0.5], materials.darkMetal, group, 14);
  weaponDetailCylinder(0.034, 0.22, [0.58, -0.07, -0.76], [0, 0, Math.PI * 0.5], materials.darkMetal, group, 14);
  weaponBox([0.14, 0.08, 0.1], [0.34, 0.03, -0.76], materials.darkMetal, group);
  weaponBox([0.12, 0.07, 0.1], [0.34, -0.18, -1.5], materials.darkMetal, group);
  weaponAngledBox([0.2, 0.14, 1.02], [0.13, -0.36, -0.1], [0.08, 0, -0.02], materials.rubber, group);
  weaponAngledBox([0.26, 0.18, 0.46], [0.06, -0.39, 0.43], [-0.12, 0, -0.08], materials.rubber, group);
  weaponBox([0.24, 0.11, 0.09], [0.38, -0.55, -0.33], materials.darkMetal, group);
  const triggerGuard = new THREE.TorusGeometry(0.12, 0.012, 8, 18, Math.PI);
  const guard = new THREE.Mesh(triggerGuard, materials.darkMetal);
  guard.position.set(0.32, -0.52, -0.55);
  guard.rotation.set(Math.PI * 0.5, 0, Math.PI);
  guard.castShadow = true;
  group.add(guard);
  const mag = weaponAngledBox([0.18, 0.46, 0.22], [0.27, -0.6, -0.82], [-0.1, 0, 0], materials.rubber, group);
  group.mag = mag;
  group.magBase = mag.position.clone();
  addWeaponHands(group, [0.1, -0.61, -0.76], [0.48, -0.46, -0.28]);
  group.flash = makeMuzzle([0.36, -0.3, -3.05], group);
  return group;
}

function createKnifeModel() {
  const group = new THREE.Group();
  group.position.set(0.32, -0.05, 0);
  const blade = weaponBox([0.14, 0.045, 0.95], [0.33, -0.3, -1.22], materials.blade, group);
  blade.rotation.z = -0.12;
  weaponBox([0.16, 0.13, 0.48], [0.26, -0.48, -0.5], materials.rubber, group);
  weaponBox([0.32, 0.055, 0.12], [0.27, -0.41, -0.78], materials.darkMetal, group);
  addWeaponHands(group, [0.13, -0.52, -0.46], [0.36, -0.52, -0.4]);
  group.flash = null;
  return group;
}

function createWeaponModel() {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);
  group.models = [createKnifeModel(), createPistolModel(), createAkModel(), createAwpModel(), createM249Model()];
  group.models.forEach((model) => group.add(model));
  group.flash = group.models[0].flash;
  group.swing = 0;
  camera.add(group);
  scene.add(camera);
  return group;
}

const weaponModel = createWeaponModel();
weaponModel.models.forEach((model, index) => {
  model.visible = index === currentWeapon;
});

function configureAk47Glb(root) {
  root.name = "AK47_GLB";
  root.position.set(0.44, -0.42, -1.12);
  root.rotation.set(0, -Math.PI * 0.5, 0);
  root.scale.setScalar(0.22);
  root.traverse((child) => {
    if (child.isMesh || child.isSkinnedMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.side = THREE.FrontSide;
        child.material.needsUpdate = true;
      }
    }
  });
}

function findAkAction(namePart) {
  return Object.entries(ak47Asset.actions).find(([name]) => name.toLowerCase().includes(namePart))?.[1] || null;
}

function playAkAction(namePart, { loop = false, fade = 0.06, timeScale = 1 } = {}) {
  if (!ak47Asset.mixer) return;
  const action = findAkAction(namePart);
  if (!action) return;
  if (ak47Asset.activeAction && ak47Asset.activeAction !== action) ak47Asset.activeAction.fadeOut(fade);
  action.reset();
  action.enabled = true;
  action.timeScale = timeScale;
  action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
  action.clampWhenFinished = !loop;
  action.fadeIn(fade).play();
  ak47Asset.activeAction = action;
  if (!loop) {
    clearTimeout(ak47Asset.restoreTimer);
    ak47Asset.restoreTimer = setTimeout(() => playAkAction("idle", { loop: true, fade: 0.12 }), (action.getClip().duration / timeScale) * 1000);
  }
}

function loadAk47Model() {
  const akSlot = weaponModel.models[2];
  ak47Asset.fallback = akSlot.fallback;
  gltfLoader.load(
    ak47ModelUrl,
    (gltf) => {
      const root = gltf.scene;
      configureAk47Glb(root);
      akSlot.add(root);
      akSlot.fallback.visible = false;
      akSlot.userData.usesExternalAnimation = true;
      ak47Asset.loaded = true;
      ak47Asset.glbRoot = root;
      ak47Asset.mixer = new THREE.AnimationMixer(root);
      ak47Asset.actions = Object.fromEntries(gltf.animations.map((clip) => [clip.name, ak47Asset.mixer.clipAction(clip)]));
      playAkAction("idle", { loop: true, fade: 0 });
      showNotice("AK-47 模型載入完成", 1.4);
    },
    undefined,
    () => {
      akSlot.userData.usesExternalAnimation = false;
      if (akSlot.fallback) akSlot.fallback.visible = true;
      showNotice("AK-47 模型載入失敗，使用原本模型", 2);
    },
  );
}

const zombieTypes = {
  walker: {
    label: "Walker",
    healthScale: 1,
    speedScale: 1.4,
    bodyScale: [1, 1, 1],
    skin: "zombie",
    cloth: "tornCloth",
  },
  runner: {
    label: "Runner",
    healthScale: 0.65,
    speedScale: 3.21,
    bodyScale: [0.76, 1.08, 0.78],
    skin: "runnerSkin",
    cloth: "tornCloth",
  },
  brute: {
    label: "Brute",
    healthScale: 2.8,
    speedScale: 0.68,
    bodyScale: [1.38, 1.16, 1.28],
    skin: "bruteSkin",
    cloth: "bruteCloth",
  },
  boss: {
    label: "Boss",
    healthScale: 15,
    speedScale: 0.78,
    bodyScale: [2.05, 1.8, 1.85],
    skin: "bossSkin",
    cloth: "bossCloth",
  },
};

function zombiePart(geometry, material, position, parent) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function zombieMesh(typeKey = "walker") {
  const type = zombieTypes[typeKey] || zombieTypes.walker;
  const group = new THREE.Group();
  group.scale.set(...type.bodyScale);
  const skin = materials[type.skin];
  const cloth = materials[type.cloth];
  const body = zombiePart(new THREE.CapsuleGeometry(0.43, 0.92, 5, 12), skin, [0, 1.08, 0], group);
  const shirt = zombiePart(new THREE.BoxGeometry(0.78, 0.5, 0.2), cloth, [0, 1.16, -0.31], group);
  const head = zombiePart(new THREE.SphereGeometry(0.32, 18, 14), skin, [0, 1.88, 0], group);
  const eyeMaterial = typeKey === "boss" ? materials.bossEye : materials.eye;
  const eyeSize = typeKey === "boss" ? 0.048 : 0.035;
  const eyeLeft = zombiePart(new THREE.SphereGeometry(eyeSize, 8, 6), eyeMaterial, [-0.11, 1.92, -0.28], group);
  const eyeRight = zombiePart(new THREE.SphereGeometry(eyeSize, 8, 6), eyeMaterial, [0.11, 1.92, -0.28], group);
  const armLeft = zombiePart(new THREE.CapsuleGeometry(0.11, 0.72, 4, 8), skin, [-0.52, 1.18, -0.18], group);
  const armRight = zombiePart(new THREE.CapsuleGeometry(0.11, 0.72, 4, 8), skin, [0.52, 1.18, -0.18], group);
  armLeft.rotation.z = -0.42;
  armRight.rotation.z = 0.42;
  armLeft.rotation.x = 0.95;
  armRight.rotation.x = 0.95;
  const legLeft = zombiePart(new THREE.CapsuleGeometry(0.13, 0.72, 4, 8), skin, [-0.18, 0.42, 0], group);
  const legRight = zombiePart(new THREE.CapsuleGeometry(0.13, 0.72, 4, 8), skin, [0.18, 0.42, 0], group);
  const wound = zombiePart(new THREE.BoxGeometry(0.35, 0.2, 0.035), materials.blood, [0.18, 1.33, -0.43], group);
  wound.rotation.z = -0.24;
  group.userData.parts = { armLeft, armRight, legLeft, legRight, shirt, eyeLeft, eyeRight };
  group.userData.head = head;
  group.userData.body = body;
  group.userData.type = type.label;
  return group;
}

function spawnZombie(typeKey = "walker") {
  const angle = Math.random() * Math.PI * 2;
  const radius = 22 + Math.random() * 10;
  const type = zombieTypes[typeKey] || zombieTypes.walker;
  const group = zombieMesh(typeKey);
  group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  const baseHealth = 70 * 1.07 ** (wave - 1);
  const baseSpeed = 1.8 + Math.min(wave * 0.08, 0.65) + Math.random() * 0.25;
  group.userData = {
    ...group.userData,
    health: baseHealth * type.healthScale,
    maxHealth: baseHealth * type.healthScale,
    speed: baseSpeed * type.speedScale,
    damage: (10 + wave * 1.8) * (typeKey === "brute" ? 1.35 : typeKey === "boss" ? 2.1 : 1),
    state: "Patrol",
    attackCooldown: 0,
    shotCooldown: typeKey === "boss" ? 1.8 : 0,
    dashCooldown: typeKey === "boss" ? 5 : 0,
    dashTime: 0,
    dashHit: false,
    isBoss: typeKey === "boss",
    wander: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
    dead: false,
  };
  scene.add(group);
  zombies.push(group);
}

function spawnWave() {
  const hasBoss = wave % 5 === 0;
  const count = Math.max(3, Math.floor((5 + wave * 3) * (hasBoss ? 0.6 : 1)));
  for (let i = 0; i < count; i += 1) {
    if (i % 6 === 1) spawnZombie("runner");
    else if (i % 7 === 0) spawnZombie("brute");
    else spawnZombie("walker");
  }
  if (hasBoss) spawnZombie("boss");
  showNotice(`第 ${wave} 波感染體接近`);
}

function showNotice(text, duration = 2.1) {
  ui.notice.textContent = text;
  noticeUntil = clock.elapsedTime + duration;
}

function requestGamePointerLock() {
  const lockRequest = renderer.domElement.requestPointerLock?.();
  if (lockRequest?.catch) lockRequest.catch(() => {});
}

function updateWeaponHud() {
  const w = weapons[currentWeapon];
  ui.weapons.innerHTML = weapons
    .map(
      (weapon, index) => `
      <div class="weapon ${index === currentWeapon ? "active" : ""} ${weapon.owned ? "" : "locked"}">
        <strong>${weapon.key}</strong>
        <span>${weapon.name}<br><small>${weapon.owned ? weapon.role : "Locked"}</small></span>
        <span>${Number.isFinite(weapon.mag) ? weapon.mag : "∞"}</span>
      </div>
    `,
    )
    .join("");
  ui.mag.textContent = Number.isFinite(w.mag) ? w.mag : "∞";
  ui.reserve.textContent = Number.isFinite(w.reserve) ? w.reserve : "∞";
}

function updateHud() {
  ui.health.textContent = Math.max(0, Math.ceil(player.health));
  ui.armor.textContent = Math.ceil(player.armor);
  ui.coins.textContent = player.coins;
  ui.grenades.textContent = player.grenades;
  ui.level.textContent = player.level;
  ui.wave.textContent = wave;
  ui.kills.textContent = player.kills;
  ui.remaining.textContent = zombies.filter((z) => !z.userData.dead).length;
  updateWeaponHud();
  updateShopPrices();
}

function updateShopPrices() {
  document.querySelectorAll("[data-price]").forEach((node) => {
    node.textContent = shopPrice(node.dataset.price);
  });
  const tier = shopInflationTier();
  ui.shopInflation.textContent =
    tier > 0
      ? `殭屍危機不斷蔓延，裝備物資已上漲 ${tier * 18}%。`
      : "殭屍危機不斷蔓延，裝備物資每 3 波結束會跟著漲價。";
}

function switchWeapon(index) {
  if (!weapons[index]) return;
  if (!weapons[index].owned) {
    showNotice("尚未購買");
    playUiSound("fail");
    return;
  }
  currentWeapon = index;
  reloadingUntil = 0;
  reloadStartedAt = 0;
  reloadGlowUntil = 0;
  scoped = false;
  weaponModel.models.forEach((model, modelIndex) => {
    model.visible = modelIndex === currentWeapon;
  });
  weaponModel.flash = weaponModel.models[currentWeapon].flash;
  if (weapons[currentWeapon].name === "AK-47" && ak47Asset.loaded) playAkAction("idle", { loop: true, fade: 0.1 });
  updateWeaponHud();
}

function cycleWeapon(direction) {
  for (let step = 1; step <= weapons.length; step += 1) {
    const next = (currentWeapon + direction * step + weapons.length) % weapons.length;
    if (weapons[next].owned) {
      switchWeapon(next);
      return;
    }
  }
}

function reload() {
  const weapon = weapons[currentWeapon];
  if (!Number.isFinite(weapon.mag) || weapon.mag === weapon.magSize || weapon.reserve <= 0) return;
  if (reloadingUntil > clock.elapsedTime) return;
  scoped = false;
  reloadStartedAt = clock.elapsedTime;
  reloadingUntil = clock.elapsedTime + weapon.reload;
  playUiSound("reload");
  if (weapon.name === "AK-47" && ak47Asset.loaded) playAkAction("reload", { loop: false, timeScale: 2.667 / weapon.reload });
  showNotice(`${weapon.name} 裝填中`, weapon.reload);
}

function finishReloadIfNeeded() {
  if (!reloadingUntil || clock.elapsedTime < reloadingUntil) return;
  const weapon = weapons[currentWeapon];
  const needed = weapon.magSize - weapon.mag;
  const loaded = Math.min(needed, weapon.reserve);
  weapon.mag += loaded;
  weapon.reserve -= loaded;
  reloadingUntil = 0;
  reloadStartedAt = 0;
  reloadGlowUntil = clock.elapsedTime + 0.42;
  updateHud();
}

function reloadProgress() {
  if (!reloadStartedAt || !reloadingUntil) return 0;
  const duration = reloadingUntil - reloadStartedAt;
  if (duration <= 0) return 0;
  return THREE.MathUtils.clamp((clock.elapsedTime - reloadStartedAt) / duration, 0, 1);
}

function updateReloadVisuals() {
  const progress = reloadProgress();
  const isCompleteGlow = clock.elapsedTime < reloadGlowUntil;
  ui.reloadRing.classList.toggle("active", (progress > 0 && progress < 1) || isCompleteGlow);
  ui.reloadRing.classList.toggle("complete", isCompleteGlow);
  ui.reloadProgress.style.strokeDashoffset = `${isCompleteGlow ? 0 : 264 - progress * 264}`;

  weaponModel.models.forEach((model) => {
    if (model.userData.usesExternalAnimation) return;
    if (model.mag && model.magBase) model.mag.position.copy(model.magBase);
    if (model.leftHand && model.leftHandBase) model.leftHand.position.copy(model.leftHandBase);
    if (model.rightHand && model.rightHandBase) model.rightHand.position.copy(model.rightHandBase);
    model.rotation.x = 0;
    model.rotation.z = 0;
    model.position.y = model.userData.baseY ?? model.position.y;
  });

  if (!progress) return;
  const model = weaponModel.models[currentWeapon];
  if (model.userData.usesExternalAnimation) return;
  const reach = Math.sin(progress * Math.PI);
  const pull = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
  model.rotation.x = -0.18 * reach;
  model.rotation.z = 0.08 * Math.sin(progress * Math.PI * 2);
  if (model.mag && model.magBase) {
    model.mag.position.y = model.magBase.y - 0.42 * pull;
    model.mag.position.z = model.magBase.z + 0.16 * Math.sin(progress * Math.PI);
    model.mag.rotation.x += 0.35 * Math.sin(progress * Math.PI * 2);
  }
  if (model.leftHand && model.leftHandBase) {
    model.leftHand.position.y = model.leftHandBase.y - 0.34 * reach;
    model.leftHand.position.z = model.leftHandBase.z - 0.14 * Math.sin(progress * Math.PI);
    model.leftHand.rotation.x = 0.55 * reach;
  }
}

function updateScope(dt) {
  const wantsScope = scoped && weapons[currentWeapon].name === "AWP" && gameMode === "playing" && !reloadingUntil;
  scopeAmount = THREE.MathUtils.damp(scopeAmount, wantsScope ? 1 : 0, 12, dt);
  const nextFov = THREE.MathUtils.lerp(75, 38, scopeAmount);
  if (Math.abs(camera.fov - nextFov) > 0.02) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }
  ui.scopeOverlay.style.opacity = `${scopeAmount}`;
  ui.scopeOverlay.classList.toggle("active", scopeAmount > 0.05);
}

function randomSpread(amount) {
  return new THREE.Vector3(
    (Math.random() - 0.5) * amount,
    (Math.random() - 0.5) * amount,
    (Math.random() - 0.5) * amount,
  );
}

function shoot() {
  const now = clock.elapsedTime;
  const weapon = weapons[currentWeapon];
  if (gameMode !== "playing" || now < canShootAt || now < reloadingUntil || player.dead) return;
  if (Number.isFinite(weapon.mag) && weapon.mag <= 0) {
    reload();
    return;
  }

  canShootAt = now + weapon.fireRate;
  if (Number.isFinite(weapon.mag)) weapon.mag -= 1;
  player.pitch = Math.min(1.35, player.pitch + weapon.recoil);
  playWeaponSound(weapon.name);
  if (weapon.name === "AK-47" && ak47Asset.loaded) playAkAction("shooting", { loop: false, fade: 0.02 });
  if (weaponModel.flash) weaponModel.flash.visible = true;
  if (weapon.name === "Knife") weaponModel.swing = 0.22;
  setTimeout(() => {
    if (weaponModel.flash) weaponModel.flash.visible = false;
  }, 45);

  const origin = camera.getWorldPosition(new THREE.Vector3());
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  direction.add(randomSpread(weapon.spread)).normalize();
  raycaster.set(origin, direction);
  raycaster.far = weapon.range;

  let bulletEnd = origin.clone().add(direction.clone().multiplyScalar(Math.min(weapon.range, 38)));
  let wallDistance = Infinity;
  const wallHitPoint = new THREE.Vector3();
  const wallRay = new THREE.Ray(origin, direction.clone());
  colliders.forEach((collider) => {
    const hitPoint = wallRay.intersectBox(collider, new THREE.Vector3());
    if (!hitPoint) return;
    const distance = hitPoint.distanceTo(origin);
    if (distance < wallDistance && distance <= weapon.range) {
      wallDistance = distance;
      wallHitPoint.copy(hitPoint);
    }
  });
  if (Number.isFinite(wallDistance)) bulletEnd = wallHitPoint.clone();

  const targets = [];
  zombies.forEach((zombie) => {
    if (zombie.userData.dead) return;
    targets.push(zombie.userData.head, zombie.userData.body);
  });
  const hits = raycaster.intersectObjects(targets, false);
  if (hits.length) {
    const hit = hits[0];
    if (hit.distance < wallDistance - 0.05) {
      const zombie = zombies.find(
        (z) => z.userData.head === hit.object || z.userData.body === hit.object,
      );
      if (zombie) {
      const isHead = hit.object === zombie.userData.head;
      damageZombie(zombie, weapon.damage * (isHead ? weapon.headshot : 1), isHead);
      }
    }
  }

  bullets.push({
    from: origin.clone(),
    to: bulletEnd,
    life: 0.06,
  });
  updateHud();
}

function damageZombie(zombie, amount, headshot) {
  zombie.userData.health -= amount;
  zombie.userData.state = "Chase";
  playHitSound(headshot);
  ui.hitmarker.classList.remove("show", "headshot");
  void ui.hitmarker.offsetWidth;
  ui.hitmarker.classList.toggle("headshot", Boolean(headshot));
  ui.hitmarker.classList.add("show");
  if (zombie.userData.health <= 0) killZombie(zombie);
}

function killZombie(zombie) {
  zombie.userData.dead = true;
  zombie.userData.state = "Dead";
  player.kills += 1;
  player.streak += 1;
  player.coins += 24 + wave * 3;
  player.xp += 35 + wave * 5;
  zombie.rotation.z = Math.PI * 0.5;
  zombie.position.y = 0.25;
  setTimeout(() => {
    scene.remove(zombie);
    const index = zombies.indexOf(zombie);
    if (index >= 0) zombies.splice(index, 1);
  }, 900);

  if (player.streak > 0 && player.streak % 5 === 0) {
    player.coins += 30;
    showNotice("連續擊殺獎勵 +30 金幣");
  }
  while (player.xp >= player.level * 120) {
    player.xp -= player.level * 120;
    player.level += 1;
    player.health = Math.min(100, player.health + 20);
    player.armor = Math.min(100, player.armor + 15);
    showNotice(`升級到 Lv.${player.level}`);
  }
  updateHud();
}

function bossHealthTarget() {
  return zombies.find((zombie) => zombie.userData.isBoss && !zombie.userData.dead);
}

function fireBossProjectile(boss) {
  const from = boss.position.clone().add(new THREE.Vector3(0, 1.35, 0));
  const toPlayer = player.position.clone().sub(from).normalize();
  const mesh = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 12), materials.energy);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 18, 12),
    new THREE.MeshBasicMaterial({ color: 0xff5a3d, transparent: true, opacity: 0.23 }),
  );
  const light = new THREE.PointLight(0xff3d2d, 1.6, 8);
  mesh.add(core, halo, light);
  mesh.position.copy(from);
  scene.add(mesh);
  bossProjectiles.push({
    position: from,
    velocity: toPlayer.multiplyScalar(12.5),
    life: 3,
    damage: 58,
    mesh,
    trail: [],
  });
}

function createGrenadeMesh() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.32, 12), materials.hazard);
  body.rotation.z = Math.PI * 0.5;
  body.castShadow = true;
  group.add(body);
  for (let i = 0; i < 5; i += 1) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.31, 0.026), materials.darkMetal);
    const angle = (i / 5) * Math.PI * 2;
    rib.position.set(0, Math.cos(angle) * 0.12, Math.sin(angle) * 0.12);
    rib.rotation.x = angle;
    rib.castShadow = true;
    group.add(rib);
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12), materials.darkMetal);
  cap.position.set(0.19, 0, 0);
  cap.rotation.z = Math.PI * 0.5;
  cap.castShadow = true;
  group.add(cap);
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.035, 0.055), materials.metal);
  lever.position.set(0.04, 0.16, 0);
  lever.rotation.z = -0.38;
  lever.castShadow = true;
  group.add(lever);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.008, 8, 16), materials.metal);
  ring.position.set(0.25, 0.03, 0);
  ring.rotation.y = Math.PI * 0.5;
  ring.castShadow = true;
  group.add(ring);
  return group;
}

function throwGrenade() {
  if (gameMode !== "playing" || player.dead) return;
  if (player.grenades <= 0) {
    showNotice("沒有手榴彈");
    playUiSound("fail");
    return;
  }
  player.grenades -= 1;
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
  const position = camera.getWorldPosition(new THREE.Vector3()).add(direction.clone().multiplyScalar(0.7));
  const mesh = createGrenadeMesh();
  mesh.position.copy(position);
  scene.add(mesh);
  grenades.push({
    mesh,
    position,
    velocity: direction.multiplyScalar(13).add(new THREE.Vector3(0, 4.2, 0)),
    fuse: 0.65,
  });
  updateHud();
}

function explodeAt(position) {
  const radius = 6.4;
  const maxDamage = 266;
  zombies.forEach((zombie) => {
    if (zombie.userData.dead) return;
    const distance = zombie.position.distanceTo(position);
    if (distance > radius) return;
    const falloff = 1 - distance / radius;
    let damage = maxDamage * (0.72 + falloff * 0.28);
    if (zombie.userData.type === "Walker") damage = Math.max(damage, zombie.userData.health + 1);
    if (zombie.userData.isBoss) damage *= 0.22;
    if (zombie.userData.type === "Brute") damage *= 0.45;
    damageZombie(zombie, damage, false);
  });
  const playerDistance = player.position.distanceTo(position);
  if (playerDistance < radius) {
    takeDamage(maxDamage * 0.7 * (1 - playerDistance / radius));
  }
  const group = new THREE.Group();
  group.position.copy(position);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.4, radius, 36),
    new THREE.MeshBasicMaterial({ color: 0xf1cf6a, transparent: true, opacity: 0.65, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI * 0.5;
  ring.position.y = 0.04;
  group.add(ring);
  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 18, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff0a3, transparent: true, opacity: 0.95 }),
  );
  flash.position.y = 0.8;
  group.add(flash);
  const light = new THREE.PointLight(0xff9a32, 4, 15);
  light.position.y = 1.1;
  group.add(light);
  for (let i = 0; i < 14; i += 1) {
    const spark = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.58), materials.spark.clone());
    const angle = (i / 14) * Math.PI * 2;
    spark.position.set(Math.cos(angle) * 0.35, 0.35 + Math.random() * 0.8, Math.sin(angle) * 0.35);
    spark.rotation.set(Math.random() * Math.PI, angle, Math.random() * Math.PI);
    spark.userData.velocity = new THREE.Vector3(Math.cos(angle) * (4 + Math.random() * 3), 2 + Math.random() * 2.5, Math.sin(angle) * (4 + Math.random() * 3));
    group.add(spark);
  }
  for (let i = 0; i < 10; i += 1) {
    const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.22 + Math.random() * 0.18, 10, 8), materials.smoke.clone());
    const angle = Math.random() * Math.PI * 2;
    smoke.position.set(Math.cos(angle) * Math.random() * 0.8, 0.25 + Math.random() * 0.5, Math.sin(angle) * Math.random() * 0.8);
    smoke.userData.velocity = new THREE.Vector3(Math.cos(angle) * 0.8, 1.1 + Math.random(), Math.sin(angle) * 0.8);
    group.add(smoke);
  }
  scene.add(group);
  explosions.push({ mesh: group, ring, flash, light, life: 0.75, maxLife: 0.75 });
  playUiSound("hurt");
}

function takeDamage(amount, options = {}) {
  if (gameMode !== "playing") return;
  const pierce = THREE.MathUtils.clamp(options.armorPierce || 0, 0, 1);
  const directHealth = amount * pierce;
  const blockable = amount - directHealth;
  if (options.armorBreak) player.armor = 0;
  const armorHit = Math.min(player.armor, blockable * 0.65);
  player.armor -= armorHit;
  player.health -= blockable - armorHit + directHealth;
  player.streak = 0;
  ui.damage.classList.add("show");
  playUiSound("hurt");
  setTimeout(() => ui.damage.classList.remove("show"), 130);
  updateHud();
  if (player.health <= 0) endGame();
}

function endGame() {
  player.dead = true;
  gameMode = "dead";
  document.exitPointerLock?.();
  ui.summary.textContent = `你撐到第 ${wave} 波，擊殺 ${player.kills} 隻殭屍，達到 Lv.${player.level}。`;
  ui.gameOver.classList.add("show");
}

function resetGame() {
  clearTimeout(ak47Asset.restoreTimer);
  if (ak47Asset.loaded) playAkAction("idle", { loop: true, fade: 0 });
  zombies.splice(0).forEach((zombie) => scene.remove(zombie));
  grenades.splice(0).forEach((grenade) => scene.remove(grenade.mesh));
  explosions.splice(0).forEach((explosion) => scene.remove(explosion.mesh));
  bossProjectiles.splice(0).forEach((projectile) => {
    if (projectile.mesh) scene.remove(projectile.mesh);
    projectile.trail?.forEach((trail) => scene.remove(trail));
  });
  Object.assign(player, {
    position: new THREE.Vector3(0, 1.72, 11),
    velocity: new THREE.Vector3(),
    yaw: 0,
    pitch: 0,
    health: 100,
    armor: 50,
    coins: 120,
    xp: 0,
    level: 1,
    kills: 0,
    streak: 0,
    grounded: false,
    crouch: false,
    active: true,
    dead: false,
  });
  weapons[0].mag = Infinity;
  weapons[0].reserve = Infinity;
  weapons[1].mag = 12;
  weapons[1].reserve = Infinity;
  weapons[2].mag = 30;
  weapons[2].reserve = 120;
  weapons[3].mag = 5;
  weapons[3].reserve = 25;
  weapons[4].mag = 80;
  weapons[4].reserve = 160;
  weapons.forEach((weapon, index) => {
    weapon.owned = index <= 1;
  });
  player.grenades = 0;
  sprintUntil = 0;
  lastMoveTap.KeyW = -Infinity;
  lastMoveTap.KeyS = -Infinity;
  wave = 1;
  currentWeapon = 1;
  gameMode = "playing";
  ui.shop.classList.remove("open");
  ui.gameOver.classList.remove("show");
  spawnWave();
  switchWeapon(1);
  updateHud();
}

function resolveCollisions(next) {
  const radius = player.crouch ? 0.34 : 0.42;
  const resolved = player.position.clone();
  resolved.y = next.y;
  const xStep = resolved.clone();
  xStep.x = THREE.MathUtils.clamp(next.x, -34, 34);
  if (!intersectsWorld(xStep, radius, player.crouch ? 1.25 : 1.8)) resolved.x = xStep.x;
  else player.velocity.x = 0;

  const zStep = resolved.clone();
  zStep.z = THREE.MathUtils.clamp(next.z, -34, 34);
  if (!intersectsWorld(zStep, radius, player.crouch ? 1.25 : 1.8)) resolved.z = zStep.z;
  else player.velocity.z = 0;
  return resolved;
}

function updatePlayer(dt) {
  const doubleTapSprint = clock.elapsedTime < sprintUntil && (keys.has("KeyW") || keys.has("KeyS"));
  const speed = keys.has("ShiftLeft") || doubleTapSprint ? 8.8 : keys.has("KeyC") ? 3.0 : 5.2;
  player.crouch = keys.has("KeyC");
  const eye = player.crouch ? 1.18 : 1.72;
  const wish = new THREE.Vector3();
  if (keys.has("KeyW")) wish.z -= 1;
  if (keys.has("KeyS")) wish.z += 1;
  if (keys.has("KeyA")) wish.x -= 1;
  if (keys.has("KeyD")) wish.x += 1;
  wish.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);

  player.velocity.x = THREE.MathUtils.damp(player.velocity.x, wish.x * speed, 12, dt);
  player.velocity.z = THREE.MathUtils.damp(player.velocity.z, wish.z * speed, 12, dt);
  player.velocity.y -= 24 * dt;
  if (keys.has("Space") && player.grounded) {
    player.velocity.y = 7.2;
    player.grounded = false;
  }

  const next = player.position.clone().addScaledVector(player.velocity, dt);
  if (next.y <= eye) {
    next.y = eye;
    player.velocity.y = 0;
    player.grounded = true;
  }
  player.position.copy(resolveCollisions(next));
  camera.position.copy(player.position);
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
}

function resolveZombiePosition(zombie, move, dt) {
  const data = zombie.userData;
  const radius = data.isBoss ? 0.9 : data.type === "Brute" ? 0.62 : data.type === "Runner" ? 0.38 : 0.48;
  const speed = data.speed * dt;
  const resolved = zombie.position.clone();
  const xStep = resolved.clone();
  xStep.x = THREE.MathUtils.clamp(resolved.x + move.x * speed, -33, 33);
  if (!intersectsWorld(xStep, radius, data.isBoss ? 3.2 : 2.1)) resolved.x = xStep.x;
  else {
    data.wander.x *= -1;
    if (data.dashTime > 0) data.dashTime = 0;
  }

  const zStep = resolved.clone();
  zStep.z = THREE.MathUtils.clamp(resolved.z + move.z * speed, -33, 33);
  if (!intersectsWorld(zStep, radius, data.isBoss ? 3.2 : 2.1)) resolved.z = zStep.z;
  else {
    data.wander.z *= -1;
    if (data.dashTime > 0) data.dashTime = 0;
  }
  return resolved;
}

function updateZombies(dt) {
  const alive = zombies.filter((z) => !z.userData.dead);
  alive.forEach((zombie) => {
    const data = zombie.userData;
    const toPlayer = player.position.clone().sub(zombie.position);
    toPlayer.y = 0;
    const distance = toPlayer.length();
    const visiblePlayer = hasLineOfSight(
      zombie.position.clone().add(new THREE.Vector3(0, data.isBoss ? 2.25 : 1.45, 0)),
      player.position.clone().add(new THREE.Vector3(0, -0.2, 0)),
    );
    const toPlayerDir = distance > 0.001 ? toPlayer.clone().normalize() : new THREE.Vector3();

    if (visiblePlayer && distance < 2) data.state = "Attack";
    else if (visiblePlayer && distance < 24) data.state = "Chase";
    else if (visiblePlayer && distance < 34) data.state = "Detect";
    else data.state = "Patrol";

    let move = data.wander.clone();
    if (data.state === "Detect") move = toPlayerDir.clone().multiplyScalar(0.45);
    if (data.state === "Chase") move = toPlayerDir.clone();
    if (data.state === "Attack") {
      move.set(0, 0, 0);
      data.attackCooldown -= dt;
      if (data.attackCooldown <= 0) {
        data.attackCooldown = 0.82;
        takeDamage(data.damage);
      }
    }

    if (data.state === "Patrol" && Math.random() < dt * 0.25) {
      data.wander.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    }

    if (data.isBoss) {
      data.shotCooldown -= dt;
      data.dashCooldown -= dt;
      data.dashTime = Math.max(0, data.dashTime - dt);
      if (visiblePlayer && distance > 5 && distance < 28 && data.shotCooldown <= 0) {
        data.shotCooldown = 1.7;
        fireBossProjectile(zombie);
      }
      if (visiblePlayer && distance > 7 && distance < 22 && data.dashCooldown <= 0 && Math.random() < dt * 0.9) {
        data.dashCooldown = 5.2 + Math.random() * 2.4;
        data.dashTime = 0.52;
        data.dashHit = false;
        showNotice("Boss 突進");
      }
      if (data.dashTime > 0) {
        move = toPlayerDir.clone().multiplyScalar(4.6);
        if (!data.dashHit && distance < 2.7) {
          data.dashHit = true;
          takeDamage(data.damage * 2.2, { armorPierce: 0.35 });
        }
      }
    }

    zombie.position.copy(resolveZombiePosition(zombie, move, dt));
    if (move.lengthSq() > 0.001) zombie.rotation.y = Math.atan2(-move.x, -move.z);
    const parts = data.parts;
    if (parts) {
      const stride = Math.sin(clock.elapsedTime * data.speed * 4 + zombie.id);
      parts.armLeft.rotation.x = 0.95 + stride * 0.3;
      parts.armRight.rotation.x = 0.95 - stride * 0.3;
      parts.legLeft.rotation.x = stride * 0.25;
      parts.legRight.rotation.x = -stride * 0.25;
      parts.eyeLeft.scale.setScalar(1 + Math.max(0, stride) * 0.25);
      parts.eyeRight.scale.setScalar(1 + Math.max(0, -stride) * 0.25);
    }
  });

  if (alive.length === 0 && betweenWaves <= 0) {
    betweenWaves = 4;
    showNotice(`第 ${wave} 波清除，下一波即將開始`, 3);
  }
  if (betweenWaves > 0) {
    betweenWaves -= dt;
    if (betweenWaves <= 0) {
      wave += 1;
      spawnWave();
      updateHud();
    }
  }
}

function updateBossProjectiles(dt) {
  bossProjectiles.forEach((projectile) => {
    projectile.life -= dt;
    const previous = projectile.position.clone();
    projectile.position.addScaledVector(projectile.velocity, dt);
    if (segmentBlocked(previous, projectile.position)) {
      projectile.life = 0;
      return;
    }
    if (projectile.mesh) {
      projectile.mesh.position.copy(projectile.position);
      projectile.mesh.scale.setScalar(1 + Math.sin(clock.elapsedTime * 24) * 0.08);
    }
    const trail = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xff6a3d, transparent: true, opacity: 0.34 }),
    );
    trail.position.copy(previous);
    scene.add(trail);
    projectile.trail.push(trail);
    if (projectile.trail.length > 7) scene.remove(projectile.trail.shift());
    if (projectile.position.distanceTo(player.position) < 0.75) {
      takeDamage(projectile.damage, { armorBreak: true, armorPierce: 1 });
      projectile.life = 0;
    }
  });
  for (let i = bossProjectiles.length - 1; i >= 0; i -= 1) {
    if (bossProjectiles[i].life <= 0) {
      if (bossProjectiles[i].mesh) scene.remove(bossProjectiles[i].mesh);
      bossProjectiles[i].trail?.forEach((trail) => scene.remove(trail));
      bossProjectiles.splice(i, 1);
    }
  }
}

function updateGrenades(dt) {
  grenades.forEach((grenade) => {
    grenade.fuse -= dt;
    grenade.velocity.y -= 9.8 * dt;
    const previous = grenade.position.clone();
    grenade.position.addScaledVector(grenade.velocity, dt);
    if (segmentBlocked(previous, grenade.position)) {
      grenade.position.copy(previous);
      grenade.velocity.x *= -0.42;
      grenade.velocity.z *= -0.42;
      grenade.velocity.y *= 0.72;
    }
    if (grenade.position.y < 0.15) {
      grenade.position.y = 0.15;
      grenade.velocity.y *= -0.22;
      grenade.velocity.x *= 0.82;
      grenade.velocity.z *= 0.82;
    }
    grenade.mesh.position.copy(grenade.position);
    grenade.mesh.rotation.x += dt * 8;
    grenade.mesh.rotation.z += dt * 5;
  });
  for (let i = grenades.length - 1; i >= 0; i -= 1) {
    if (grenades[i].fuse <= 0) {
      const position = grenades[i].position.clone();
      scene.remove(grenades[i].mesh);
      grenades.splice(i, 1);
      explodeAt(position);
    }
  }

  explosions.forEach((explosion) => {
    explosion.life -= dt;
    const progress = 1 - explosion.life / explosion.maxLife;
    explosion.ring.scale.setScalar(0.35 + progress * 1.35);
    explosion.ring.material.opacity = Math.max(0, 0.65 * (1 - progress));
    explosion.flash.scale.setScalar(1 + progress * 2.2);
    explosion.flash.material.opacity = Math.max(0, 0.95 * (1 - progress * 1.35));
    explosion.light.intensity = Math.max(0, 4 * (1 - progress));
    explosion.mesh.children.forEach((child) => {
      if (!child.userData.velocity) return;
      child.position.addScaledVector(child.userData.velocity, dt);
      child.userData.velocity.y -= 2.4 * dt;
      if (child.material?.opacity !== undefined) child.material.opacity = Math.max(0, child.material.opacity - dt * 1.15);
    });
  });
  for (let i = explosions.length - 1; i >= 0; i -= 1) {
    if (explosions[i].life <= 0) {
      scene.remove(explosions[i].mesh);
      explosions.splice(i, 1);
    }
  }
}

function updateBossHealthUi() {
  const boss = bossHealthTarget();
  ui.bossHealth.classList.toggle("show", Boolean(boss));
  if (!boss) return;
  ui.bossName.textContent = `BOSS WAVE ${wave}`;
  const ratio = THREE.MathUtils.clamp(boss.userData.health / boss.userData.maxHealth, 0, 1);
  ui.bossHealthFill.style.transform = `scaleX(${ratio})`;
}

function updateBullets(dt) {
  bullets.forEach((bullet) => {
    bullet.life -= dt;
    if (!bullet.line) {
      const geo = new THREE.BufferGeometry().setFromPoints([bullet.from, bullet.to]);
      bullet.line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: 0xf1cf6a, transparent: true, opacity: 0.95 }),
      );
      scene.add(bullet.line);
    }
    bullet.line.material.opacity = Math.max(0, bullet.life / 0.06);
  });
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    if (bullets[i].life <= 0) {
      scene.remove(bullets[i].line);
      bullets.splice(i, 1);
    }
  }
}

function buy(item) {
  const weaponMap = { "weapon-ak": 2, "weapon-awp": 3, "weapon-m249": 4 };
  if (item in weaponMap) {
    const weapon = weapons[weaponMap[item]];
    const price = shopPrice(item);
    if (weapon.owned) {
      showNotice("已經解鎖");
      playUiSound("fail");
      return;
    }
    if (player.coins < price) {
      showNotice("金幣不足");
      playUiSound("fail");
      return;
    }
    player.coins -= price;
    weapon.owned = true;
    playUiSound("buy");
    showNotice(`${weapon.name} 已解鎖`);
    updateHud();
    return;
  }
  if (item === "grenade") {
    if (player.grenades >= 3) {
      showNotice("手榴彈已滿");
      playUiSound("fail");
      return;
    }
    const price = shopPrice("grenade");
    if (player.coins < price) {
      showNotice("金幣不足");
      playUiSound("fail");
      return;
    }
    player.coins -= price;
    player.grenades += 1;
    playUiSound("buy");
    showNotice("手榴彈 +1");
    updateHud();
    return;
  }
  const price = shopPrice(item);
  if (player.coins < price) {
    playUiSound("fail");
    showNotice("金幣不足");
    return;
  }
  player.coins -= price;
  if (item === "medkit") player.health = Math.min(100, player.health + 45);
  if (item === "armor") player.armor = Math.min(100, player.armor + 40);
  if (item === "ammo") {
    const weapon = weapons[currentWeapon];
    if (Number.isFinite(weapon.reserve)) weapon.reserve = weapon.reserveMax;
  }
  playUiSound("buy");
  showNotice("補給購入完成");
  updateHud();
}

function openShop() {
  if (player.dead || gameMode !== "playing") return;
  gameMode = "paused-shop";
  player.active = false;
  mouse.shooting = false;
  ui.shop.classList.add("open");
  document.exitPointerLock?.();
  showNotice("補給站已開啟");
}

function closeShop() {
  if (player.dead || gameMode !== "paused-shop") return;
  ui.shop.classList.remove("open");
  gameMode = "playing";
  player.active = true;
  requestGamePointerLock();
}

function toggleShop() {
  if (gameMode === "playing") openShop();
  else if (gameMode === "paused-shop") closeShop();
}

function openDevConsole() {
  if (player.dead) return;
  consolePreviousMode = gameMode === "paused-console" ? consolePreviousMode : gameMode;
  gameMode = "paused-console";
  player.active = false;
  mouse.shooting = false;
  document.exitPointerLock?.();
  ui.devConsole.classList.add("open");
  ui.consoleInput.focus();
}

function closeDevConsole() {
  if (gameMode !== "paused-console") return;
  ui.devConsole.classList.remove("open");
  ui.consoleInput.blur();
  const shouldResume = consolePreviousMode === "playing";
  gameMode = shouldResume ? "playing" : consolePreviousMode;
  player.active = shouldResume;
  if (shouldResume) requestGamePointerLock();
}

function toggleDevConsole() {
  if (gameMode === "paused-console") closeDevConsole();
  else openDevConsole();
}

function executeConsoleCommand(command) {
  const normalized = command.trim().toLowerCase();
  if (!normalized) return;
  if (normalized === "kill") {
    zombies.filter((zombie) => !zombie.userData.dead).forEach((zombie) => killZombie(zombie));
    ui.consoleOutput.textContent = "所有殭屍已清除。";
    showNotice("Console: kill");
    updateHud();
    return;
  }
  if (normalized === "money") {
    player.coins += 10000;
    ui.consoleOutput.textContent = "金幣 +10000。";
    showNotice("Console: money +10000");
    updateHud();
    return;
  }
  ui.consoleOutput.textContent = `未知指令：${command}`;
  playUiSound("fail");
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);
  if (gameMode === "playing") finishReloadIfNeeded();
  if (!player.dead) {
    if (gameMode === "playing" && player.active) {
      updatePlayer(dt);
      updateZombies(dt);
      updateBossProjectiles(dt);
      updateGrenades(dt);
      if (mouse.shooting && weapons[currentWeapon].automatic) shoot();
    }
  }
  updateBullets(dt);
  if (ak47Asset.mixer) ak47Asset.mixer.update(dt);
  updateBossHealthUi();
  updateReloadVisuals();
  updateScope(dt);
  const aimSettle = weapons[currentWeapon].name === "AWP" ? scopeAmount : 0;
  weaponModel.position.x = Math.sin(clock.elapsedTime * 8) * 0.006 * (1 - aimSettle) - 0.1 * aimSettle;
  weaponModel.position.y = Math.sin(clock.elapsedTime * 5) * 0.004 * (1 - aimSettle) - 0.05 * aimSettle;
  weaponModel.position.z = -0.32 * aimSettle;
  if (weaponModel.swing > 0) {
    weaponModel.swing = Math.max(0, weaponModel.swing - dt * 2.8);
  }
  const knife = weaponModel.models[0];
  knife.rotation.z = -weaponModel.swing * 4;
  knife.rotation.x = weaponModel.swing * 2.2;
  if (clock.elapsedTime > noticeUntil) ui.notice.textContent = "";
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function bindEvents() {
  ui.startButton.addEventListener("click", () => {
    ensureAudio();
    gameMode = "playing";
    player.active = true;
    requestGamePointerLock();
    ui.startScreen.style.display = "none";
  });
  ui.restartButton.addEventListener("click", () => {
    ensureAudio();
    resetGame();
    requestGamePointerLock();
  });
  ui.continueButton.addEventListener("click", closeShop);
  document.addEventListener("pointerlockchange", () => {
    mouse.locked = document.pointerLockElement === renderer.domElement;
    if (!mouse.locked && !player.dead && gameMode !== "paused-shop" && gameMode !== "paused-console") {
      gameMode = "start";
      player.active = false;
      ui.startScreen.style.display = "grid";
    }
    if (mouse.locked && !player.dead && gameMode !== "paused-shop" && gameMode !== "paused-console") {
      gameMode = "playing";
      player.active = true;
      ui.startScreen.style.display = "none";
    }
  });
  document.addEventListener("mousemove", (event) => {
    if (!mouse.locked || player.dead || gameMode !== "playing") return;
    player.yaw -= event.movementX * 0.0022;
    player.pitch -= event.movementY * 0.0022;
    player.pitch = THREE.MathUtils.clamp(player.pitch, -1.42, 1.35);
  });
  document.addEventListener("mousedown", (event) => {
    if (gameMode !== "playing" || event.target.closest("button")) return;
    if (event.button === 2) {
      event.preventDefault();
      scoped = weapons[currentWeapon].name === "AWP" ? !scoped : false;
      return;
    }
    mouse.shooting = true;
    shoot();
  });
  document.addEventListener("mouseup", (event) => {
    if (event.button === 0) mouse.shooting = false;
  });
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("keydown", (event) => {
    if (event.code === "Backquote") {
      event.preventDefault();
      toggleDevConsole();
      return;
    }
    if (gameMode === "paused-console") {
      if (event.code === "Escape") {
        event.preventDefault();
        closeDevConsole();
      }
      return;
    }
    if (event.code === "KeyB") {
      event.preventDefault();
      toggleShop();
      return;
    }
    if (!event.repeat && gameMode === "playing" && (event.code === "KeyW" || event.code === "KeyS")) {
      const now = clock.elapsedTime;
      if (now - lastMoveTap[event.code] < 0.32) sprintUntil = now + 1.2;
      lastMoveTap[event.code] = now;
    }
    keys.add(event.code);
    if (gameMode !== "playing") return;
    if (event.code === "Digit1") switchWeapon(0);
    if (event.code === "Digit2") switchWeapon(1);
    if (event.code === "Digit3") switchWeapon(2);
    if (event.code === "Digit4") switchWeapon(3);
    if (event.code === "Digit5") switchWeapon(4);
    if (event.code === "KeyR") reload();
    if (event.code === "KeyG") throwGrenade();
  });
  document.addEventListener("keyup", (event) => keys.delete(event.code));
  document.addEventListener(
    "wheel",
    (event) => {
      if (gameMode !== "playing" || player.dead) return;
      event.preventDefault();
      cycleWeapon(event.deltaY > 0 ? 1 : -1);
    },
    { passive: false },
  );
  ui.shop.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-buy]");
    if (button) buy(button.dataset.buy);
  });
  ui.devConsole.addEventListener("submit", (event) => {
    event.preventDefault();
    executeConsoleCommand(ui.consoleInput.value);
    ui.consoleInput.value = "";
  });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

addLights();
buildMap();
bindEvents();
loadAk47Model();
spawnWave();
updateHud();
animate();
