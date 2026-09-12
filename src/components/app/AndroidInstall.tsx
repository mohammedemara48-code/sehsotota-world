import { useEffect, useState } from "react";
import { playPop, playSuccess } from "@/lib/audio";
import { getInstallState, promptInstall, subscribeInstall } from "@/lib/pwa";

export function AndroidInstall() {
  const [canPrompt, setCanPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [howto, setHowto] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = (state: { canPrompt: boolean; installed: boolean }) => {
      setCanPrompt(state.canPrompt);
      setInstalled(state.installed);
    };
    sync(getInstallState());
    return subscribeInstall(sync);
  }, []);

  const install = async () => {
    if (busy) return;
    playPop();
    if (canPrompt) {
      setBusy(true);
      const outcome = await promptInstall();
      setBusy(false);
      if (outcome === "accepted") {
        playSuccess();
        setInstalled(true);
        return;
      }
    }
    setHowto((open) => !open);
  };

  if (installed) {
    return (
      <div className="rounded-2xl bg-cream px-4 py-3 text-right shadow-[0_3px_0_#e4d8c8]">
        <p className="font-medium">التطبيق متثبّت على الجهاز</p>
        <p className="text-parent-muted mt-1 text-xs">Installed on this device</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        data-testid="android-install"
        onPointerDown={(e) => {
          e.preventDefault();
          void install();
        }}
        className="rounded-2xl bg-parent-accent px-4 py-3 text-right font-medium text-cream shadow-[0_3px_0_#2c5366]"
      >
        ثبّت على الأندرويد
        <span className="mt-0.5 block text-xs font-normal text-cream/80">Install on Android</span>
      </button>
      {howto ? (
        <ol className="text-parent-muted list-decimal space-y-1 pr-5 text-xs leading-relaxed">
          <li>افتح التطبيق في كروم Chrome (مش من داخل جروك).</li>
          <li>اضغط القائمة ⋮ أعلى اليمين.</li>
          <li>اختار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</li>
          <li>هيظهر أيقونة البيت الأحمر زي أي تطبيق تاني.</li>
        </ol>
      ) : null}
    </div>
  );
}
