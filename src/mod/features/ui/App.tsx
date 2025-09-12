import { ThemeProvider } from "./contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";

import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@ui/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";
import { ScrollArea } from "@ui/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "@ui/components/ui/sonner";

import { Playground } from "@ui/components/playground";
import { IPChecker } from "@ui/components/ip-checker";
import { FontChanger } from "@ui/components/font-changer";
import { Devtools } from "@ui/components/devtools";
import { Downloader } from "@ui/components/downloader";
import { AutoBestQuality } from "@ui/components/auto-best-quality";
import { DiscordRPC } from "@ui/components/discord-rpc";
import { Settings } from "@ui/components/settings";
import { AutoLiker } from "@ui/components/auto-liker";

import { Button } from "./components/ui/button";

import { FaDiscord, FaGithub } from "react-icons/fa";
import { RxUpdate } from "react-icons/rx";

declare global {
  interface Window {
    yandexMusicMod: {
      setStorageValue: (key: string, value: any) => void | Promise<void>;
    };
  }
}

const IS_DEV = false;

export default function App() {
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(IS_DEV);
  const [devtoolsEnabled, setDevtoolsEnabled] = useState(false);

  const appMetaQuery = useQuery({
    queryKey: ["appMeta"],
    queryFn: async () => {
      const data = await fetch(
        "https://raw.githubusercontent.com/Stephanzion/YandexMusicBetaMod/refs/heads/master/.meta/meta.json",
      );
      if (data.status !== 200) {
        throw new Error("Failed to fetch app meta");
      }
      return data.json();
    },
    enabled: true,
    retry: true,
  });

  useEffect(() => {
    (async () => {
      setDevtoolsEnabled((await window.yandexMusicMod.getStorageValue("devtools/enabled")) || false);
    })();

    window.yandexMusicMod.onStorageChanged((key: string, value: any) => {
      if (key.includes("devtools/enabled")) setDevtoolsEnabled(value);
    });
  }, []);

  useEffect(() => {
    const targetSelector = 'div[class*="NavbarDesktopUserWidget_userProfileContainer"]';
    const containerId = "mod-sheet-container";

    const checkAndPlaceButton = () => {
      const targetElement = IS_DEV ? document.body : document.querySelector(targetSelector);
      let container = document.getElementById(containerId) as HTMLDivElement | null;

      if (targetElement) {
        if (!container) {
          container = document.createElement("div");
          container.id = containerId;
          container.style.display = "flex";
          container.style.justifyContent = "center";

          targetElement.parentNode?.insertBefore(container, targetElement);
        }
        setMountNode(container);
      } else {
        if (container) {
          container.remove();
        }
        setMountNode(null);
      }
    };

    checkAndPlaceButton();

    const observer = new MutationObserver(checkAndPlaceButton);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      const container = document.getElementById(containerId);
      if (container) {
        container.remove();
      }
    };
  }, []);

  const sheetTrigger = (
    <SheetTrigger className="flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-[var(--ym-outline-color-primary-disabled)] p-[5px] text-[var(--ym-controls-color-primary-text-enabled_variant)] transition-colors duration-100 ease-in-out hover:bg-[var(--ym-surface-color-primary-enabled-list)] px-6">
      <span className="flex h-[25px] w-[25px] items-center justify-center text-lg font-semibold lg:hidden">
        P
      </span>
      <span className="hidden lg:inline">Patch</span>
    </SheetTrigger>
  );

  return (
    <ThemeProvider>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {mountNode && createPortal(sheetTrigger, mountNode)}
        <SheetContent side="left" className="w-full" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div
            id="header"
            className="flex items-center justify-between px-4"
            style={{
              height: "var(--ym-spacer-size-xxxl)",
              backgroundColor: "var(--ym-background-color-primary-enabled-basic)",
            }}
          ></div>

          <div className="bg-secondary/20 m-3 mb-0 flex justify-between rounded-md border px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-foreground text-base font-semibold">Яндекс Музыка Patch</span>
              <span className="text-muted-foreground text-sm font-semibold">v{import.meta.env.VITE_MOD_VERSION}</span>
            </div>
          </div>

          <ScrollArea className="flex h-full flex-col gap-4 overflow-hidden overflow-x-auto overflow-y-auto rounded-md">
            {devtoolsEnabled && <IPChecker />}

            <Downloader />
            <DiscordRPC />
            <AutoLiker />
            <AutoBestQuality />
            <FontChanger />
            <Settings />
            <Devtools />

            {devtoolsEnabled && <Playground />}

          </ScrollArea>

          <div className="m-4 flex flex-row">
            <Button
              variant="outline"
              className="text-foreground flex-1"
              onClick={() => window.yandexMusicMod.setStorageValue("fullscreen/toggle", Date.now())}
            >
              Полный экран (F11)
            </Button>
            <Button variant="outline" className="text-foreground flex-1" onClick={() => setIsSheetOpen(false)}>
              Назад
            </Button>
          </div>

          <Toaster position="bottom-right" />
        </SheetContent>
      </Sheet>
    </ThemeProvider>
  );
}
