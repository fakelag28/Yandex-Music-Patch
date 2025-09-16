const { BrowserWindow } = require("electron");
const { Client } = require("@xhayper/discord-rpc");

async function getStorageSetting(key, defaultValue) {
  try {
    const [win] = BrowserWindow.getAllWindows();
    if (win && !win.isDestroyed()) {
      const result = await win.webContents.executeJavaScript(`
        (async () => {
          return await window.yandexMusicMod.getStorageValue("${key}");
        })()
      `);
      return result !== null ? result : defaultValue;
    }
    return defaultValue;
  } catch (e) {
    console.error("[DISCORD RPC] Error getting storage setting:", e);
    return defaultValue;
  }
}

const CLIENT_ID = "1283109459463377011";
const ACTIVITY_COOLDOWN = 10 * 1000;

let lastActivityChanged = Date.now();
let client;

function initRpc() {
  client = new Client({ clientId: CLIENT_ID });

  client.login().catch((e) => {
    console.error("[DISCORD RPC]", e);
    setTimeout(initRpc, 3000);
  });

  client.on("ready", () => {
    console.log("[DISCORD RPC] Hooked!");
    console.log("client.user", client.user?.username);
  });

  client.on("disconnected", () => {
    console.log("[DISCORD RPC] Disconnected");
    setTimeout(initRpc, 3000);
  });

  client.on("error", () => {
    console.log("[DISCORD RPC] Error");
    setTimeout(initRpc, 3000);
  });
  client.on("close", () => {
    console.log("[DISCORD RPC] Closed");
    setTimeout(initRpc, 3000);
  });
}

async function updateActivity() {
  setTimeout(updateActivity, 500);
  if (lastActivityChanged + ACTIVITY_COOLDOWN > Date.now()) return;
  if (!client.user) return;

  try {
    const playerState = await GetAppPlayerState();

    if (!playerState.enabled) {
      client.user.clearActivity();
      return;
    }

    const playerStateData = playerState.data;

    const showOnPause = await getStorageSetting("discordRPC/showOnPause", false);
    const showButton = await getStorageSetting("discordRPC/showButton", true);

    if (!playerStateData.isPlaying && !showOnPause) {
      client.user.clearActivity();
      return;
    }

    let rpcRequest = {
      type: 2,
      details: playerStateData.trackMeta.version
        ? `${playerStateData.trackMeta.title} ${playerStateData.trackMeta.version}`
        : playerStateData.trackMeta.title,
      largeImageKey: playerStateData.trackMeta.coverUri
        ? `https://${playerStateData.trackMeta.coverUri.replaceAll("%%", "300x300")}`
        : undefined,
      state: playerStateData.trackMeta.artists.map((a) => a.name).join(", "),
      instance: false,
    };

    if (playerStateData.isPlaying) {
      const startTimestamp = Math.round(Date.now() - playerStateData.playback.position * 1000);
      const endTimestamp = Math.round(
        Date.now() + (playerStateData.playback.duration - playerStateData.playback.position) * 1000,
      );
      rpcRequest.startTimestamp = startTimestamp;
      rpcRequest.endTimestamp = endTimestamp;
    } else {
      rpcRequest.state = `На паузе • ${playerStateData.trackMeta.artists.map((a) => a.name).join(", ")}`;
    }

    if (showButton) {
      rpcRequest.buttons = [
        {
          label: "Открыть",
          url: `https://music.yandex.ru/track/${playerStateData.trackMeta.id}`,
        },
      ];
    }

    client.user.setActivity(rpcRequest);
    lastActivityChanged = Date.now();
  } catch (ex) {
    console.log("[DISCORD RPC]", ex);
  }
}

initRpc();
updateActivity();

async function GetAppPlayerState() {
  const [win] = BrowserWindow.getAllWindows();
  if (win && !win.isDestroyed()) {
    return win.webContents.executeJavaScript(`
        (()=>{
            return window.__getPlayerState();
        })()
       `);
  }
}
