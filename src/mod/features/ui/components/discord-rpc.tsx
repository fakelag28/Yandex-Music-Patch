import { useEffect, useState } from "react";
import { ExpandableCard } from "@ui/components/ui/expandable-card";
import { Label } from "@ui/components/ui/label";
import { Switch } from "@ui/components/ui/switch";
import { Alert, AlertDescription } from "@ui/components/ui/alert";
import { Info } from "lucide-react";

function DiscordRPCPreview({ enabled, showButton, showOnPause }) {
  if (!enabled) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Discord RPC отключен
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          🎵
        </div>
        <div>
          <p className="font-semibold text-sm">Название трека</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Исполнитель</p>
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {showOnPause ? "На паузе" : "Слушает Яндекс Музыка"}
      </div>
      {showButton && (
        <button 
          className="text-xs bg-blue-500 text-white px-3 py-1 rounded disabled"
          disabled
        >
          Открыть
        </button>
      )}
    </div>
  );
}

export function DiscordRPC() {
  const [discordRPCEnabled, setDiscordRPCEnabled] = useState(true);
  const [showOpenButton, setShowOpenButton] = useState(true);
  const [showOnPause, setShowOnPause] = useState(false);

  useEffect(() => {
    (async () => {
      setDiscordRPCEnabled(
        (await window.yandexMusicMod.getStorageValue("discordRPC/enabled")) === false ? false : true,
      );
      setShowOpenButton(
        (await window.yandexMusicMod.getStorageValue("discordRPC/showButton")) !== false,
      );
      setShowOnPause(
        (await window.yandexMusicMod.getStorageValue("discordRPC/showOnPause")) === true,
      );
    })();
  }, []);

  return (
    <ExpandableCard title="Discord RPC">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="discord-rpc">Включить Discord RPC</Label>
          <Switch
            id="discord-rpc"
            checked={discordRPCEnabled}
            onCheckedChange={(enabled) => {
              setDiscordRPCEnabled(enabled);
              window.yandexMusicMod.setStorageValue("discordRPC/enabled", enabled);
            }}
          />
        </div>

        {discordRPCEnabled && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="discord-rpc-button">Показывать кнопку "Открыть"</Label>
              <Switch
                id="discord-rpc-button"
                checked={showOpenButton}
                onCheckedChange={(enabled) => {
                  setShowOpenButton(enabled);
                  window.yandexMusicMod.setStorageValue("discordRPC/showButton", enabled);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="discord-rpc-pause">Показывать RPC на паузе</Label>
              <Switch
                id="discord-rpc-pause"
                checked={showOnPause}
                onCheckedChange={(enabled) => {
                  setShowOnPause(enabled);
                  window.yandexMusicMod.setStorageValue("discordRPC/showOnPause", enabled);
                }}
              />
            </div>
              <div className="w-full my-2 border-b border-border" />
            <div>
              <Label className="block">Предпросмотр:</Label>
              <DiscordRPCPreview 
                enabled={discordRPCEnabled} 
                showButton={showOpenButton}
                showOnPause={showOnPause}
              />
            </div>
          </>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Если у вас не отображается RPC - требуется полный перезапуск приложения Discord
          </AlertDescription>
        </Alert>
      </div>
    </ExpandableCard>
  );
}