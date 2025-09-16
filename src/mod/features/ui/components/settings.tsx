import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAccountSettings, updateAccountSettings } from "~/mod/features/utils/downloader";
import { ExpandableCard } from "@ui/components/ui/expandable-card";
import { Label } from "@ui/components/ui/label";
import { Switch } from "@ui/components/ui/switch";
import { toast } from "sonner";
import { If } from "@ui/components/ui/if";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/components/ui/select";
import { AiOutlineExperiment } from "react-icons/ai";

const availableFonts = ["JetBrains Mono", "Lato", "Inter", "Rubik", "Ubuntu", "Roboto Slab", "Quicksand", "Pacifico"];

export function Settings() {
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [customFontEnabled, setCustomFontEnabled] = useState(false);
  const [customFont, setCustomFont] = useState(availableFonts[0]);

  const accountSettingsQuery = useQuery({
    queryKey: ["accountSettings"],
    queryFn: async () => {
      const data = await getAccountSettings();
      if (data.isErr()) {
        throw new Error(data.error);
      }
      return data.value;
    },
    enabled: true,
    retry: true,
  });

  useEffect(() => {
    (async () => {
      setGradientEnabled(
        (await window.yandexMusicMod.getStorageValue("fullscreen/gradientEnabled")) || false
      );
      const savedFont = await window.yandexMusicMod.getStorageValue("font-changer/font");
      if (!savedFont) window.yandexMusicMod.setStorageValue("font-changer/font", availableFonts[0]);

      setCustomFontEnabled((await window.yandexMusicMod.getStorageValue("font-changer/enabled")) || false);
      setCustomFont(savedFont || availableFonts[0]);
    })();

    const unsubscribe = window.yandexMusicMod.onStorageChanged((key: string, value: any) => {
      if (key === "fullscreen/gradientEnabled") {
        setGradientEnabled(value);
      }
    });

    return unsubscribe;
  }, []);



  async function toggleGradient() {
    const newValue = !gradientEnabled;
    await window.yandexMusicMod.setStorageValue("fullscreen/gradientEnabled", newValue);
    setGradientEnabled(newValue);
    toast.success(newValue ? "Градиент включен" : "Градиент выключен");
  }

  return (
    <ExpandableCard title="Визуальные изменения" icon={<AiOutlineExperiment />}>
      <div className="space-y-4">
        <div className="flex flex-col gap-5 pt-2 px-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="font-changer-toggle" className="cursor-pointer">
              Заменить шрифты в приложении
            </Label>
            <Switch
              id="font-changer-toggle"
              checked={customFontEnabled}
              onCheckedChange={(enabled) => {
                setCustomFontEnabled(enabled);
                window.yandexMusicMod.setStorageValue("font-changer/enabled", enabled);
              }}
            />
          </div>

          <If condition={customFontEnabled}>
            <div className="flex gap-4 items-center justify-center">
              <span className="text-sm text-foreground">Шрифт:</span>
              <Select
                value={customFont}
                onValueChange={(value: string) => {
                  setCustomFont(value);
                  window.yandexMusicMod.setStorageValue("font-changer/savedFont", value);
                }}
                disabled={!customFontEnabled}
              >
                <SelectTrigger className="w-full text-foreground">
                  <SelectValue placeholder="Выбрать шрифт" />
                </SelectTrigger>
                <SelectContent>
                  {availableFonts.map((font) => (
                    <SelectItem value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </If>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="gradient-toggle" className="flex flex-col space-y-1">
            <span>Анимированный градиент при треке на весь экран</span>
          </Label>
          <Switch
            id="gradient-toggle"
            checked={gradientEnabled}
            onCheckedChange={toggleGradient}
          />
        </div>
      </div>
    </ExpandableCard>
  );
}
