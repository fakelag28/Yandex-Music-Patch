import { useEffect, useState } from "react";
import { ExpandableCard } from "@ui/components/ui/expandable-card";
import { Label } from "@ui/components/ui/label";
import { Switch } from "@ui/components/ui/switch";
import { Button } from "@ui/components/ui/button";
import { Alert, AlertDescription } from "@ui/components/ui/alert";
import { Info } from "lucide-react";
import { Copy, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";
import { toast } from "sonner";
import axios from "axios";

export function Devtools() {

  const [devtoolsEnabled, setDevtoolsEnabled] = useState(false);

  const [systemToolbarEnabled, setSystemToolbarEnabled] = useState(false);

  async function handleCopyAuthData() {
    const accessToken = localStorage.oauth ? "OAuth " + JSON.parse(localStorage.oauth).value : null;
    const experimentsResponse = await axios.get("https://api.music.yandex.net/account/experiments/details", {
      method: "GET",
      headers: {
        "x-yandex-music-client": "YandexMusicDesktopAppWindows/" + window.VERSION,
        "x-yandex-music-without-invocation-info": "1",
        Authorization: accessToken,
      },
    });

    if (experimentsResponse.status !== 200) {
      console.error("Failed to save experiments", experimentsResponse.status);
      return;
    }

    const data = {
      accessToken: localStorage.oauth ? "OAuth " + JSON.parse(localStorage.oauth).value : null,
      experiments: experimentsResponse.data,
    };

    toast.success("Данные авторизации скопированы");
    return navigator.clipboard.writeText(JSON.stringify(data));
  }

  useEffect(() => {

    (async () => {

      setDevtoolsEnabled((await window.yandexMusicMod.getStorageValue("devtools/enabled")) || false);

      setSystemToolbarEnabled((await window.yandexMusicMod.getStorageValue("devtools/systemToolbar")) || false);

    })();

  }, []);

  const handleRestart = () => {
    window.yandexMusicMod.restartApp();
  };

  return (
    <ExpandableCard title="Инструменты разработчика">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="devtools-enabled">Включить режим разработчика</Label>
          <Switch
            id="devtools-enabled"
            checked={devtoolsEnabled}
            onCheckedChange={(enabled) => {
              setDevtoolsEnabled(enabled);
              window.yandexMusicMod.setStorageValue("devtools/enabled", enabled);
            }}
          />
        </div>


        <Tooltip>
          <TooltipTrigger className="w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor="system-toolbar">Включить системную рамку окна</Label>
              <Switch
                id="system-toolbar"
                checked={systemToolbarEnabled}
                onCheckedChange={(enabled) => {
                  setSystemToolbarEnabled(enabled);
                  window.yandexMusicMod.setStorageValue("devtools/systemToolbar", enabled);
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>После включения потребуется перезапуск.</p>
          </TooltipContent>
        </Tooltip>
       
        <div className="mt-4 space-y-2">
          <Tooltip>
            <TooltipTrigger className="w-full">
              <Button onClick={handleRestart} className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Перезапустить приложение
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Данная кнопка полностью перезапустит приложение.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="w-full">
              <Button onClick={handleCopyAuthData} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Скопировать данные авторизации
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Если разработчик попросит вас дать доступ к своему аккаунту, вы можете поделиться этими данными.</p>
              <p>Не передавайте их кому-либо еще.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </ExpandableCard>
  );
}
