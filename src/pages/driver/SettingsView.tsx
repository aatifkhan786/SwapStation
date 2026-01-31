import { useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
// Import Global Context
import { SettingsContext } from './Dashboard'; 
import { 
  Moon, 
  Sun, 
  Languages, 
  Music, 
  BellRing, 
  Image as ImageIcon, 
  MessageSquare, 
  Crown,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsView() {
  const { settings, updateSetting } = useContext(SettingsContext);

  // 1. TRANSLATIONS (Top of function to avoid hoisting errors)
  const t: any = {
    en: {
      title: "Settings",
      subtitle: "Configure your personal driver dashboard experience.",
      appearance: "Appearance",
      darkMode: "Dark Mode",
      darkModeDesc: "Adjust the dashboard brightness.",
      bgImage: "Background Image",
      bgNone: "Default (Deep Space)",
      bgCity: "Jakarta Cityscape",
      bgAbstract: "Abstract Grid",
      bgMinimal: "Minimal Dark",
      audio: "Audio & Alerts",
      bgMusic: "Background Music",
      bgMusicDesc: "Ambient sounds during navigation.",
      volume: "Volume",
      notifSound: "Notification Sound",
      notifSoundDesc: "Alert sound for new station updates.",
      local: "Localization",
      lang: "System Language",
      chatbot: "Support Chatbot",
      chatbotDesc: "Show AI assistant icon in dashboard.",
      pro: "Pro Subscription",
      proDesc: "Unlock premium features and remove ads.",
      ads: "Disable Advertisements",
      adsDesc: "Keep the dashboard clean from ads.",
      upgrade: "Upgrade to Pro - $4.99/mo",
      manage: "Manage Subscription",
      upgradeReq: "UPGRADE NEEDED"
    },
    id: {
      title: "Pengaturan",
      subtitle: "Konfigurasi pengalaman dashboard pengemudi Anda.",
      appearance: "Tampilan",
      darkMode: "Mode Gelap",
      darkModeDesc: "Sesuaikan kecerahan dashboard.",
      bgImage: "Gambar Latar",
      bgNone: "Default (Luar Angkasa)",
      bgCity: "Pemandangan Jakarta",
      bgAbstract: "Grid Abstrak",
      bgMinimal: "Minimalis Gelap",
      audio: "Audio & Peringatan",
      bgMusic: "Musik Latar",
      bgMusicDesc: "Suara ambien selama navigasi.",
      volume: "Volume",
      notifSound: "Suara Notifikasi",
      notifSoundDesc: "Suara peringatan untuk stasiun baru.",
      local: "Lokalisasi",
      lang: "Bahasa Sistem",
      chatbot: "Chatbot Pendukung",
      chatbotDesc: "Tampilkan ikon asisten AI.",
      pro: "Langganan Pro",
      proDesc: "Buka fitur premium dan hapus iklan.",
      ads: "Nonaktifkan Iklan",
      adsDesc: "Jaga dashboard bersih dari iklan.",
      upgrade: "Upgrade ke Pro - Rp75rb/bln",
      manage: "Kelola Langganan",
      upgradeReq: "BUTUH UPGRADE"
    }
  }[settings.language] || {
      title: "Settings",
      subtitle: "Configure your personal driver dashboard experience.",
      appearance: "Appearance",
      darkMode: "Dark Mode",
      darkModeDesc: "Adjust the dashboard brightness.",
      bgImage: "Background Image",
      bgNone: "Default (Deep Space)",
      bgCity: "Jakarta Cityscape",
      bgAbstract: "Abstract Grid",
      bgMinimal: "Minimal Dark",
      audio: "Audio & Alerts",
      bgMusic: "Background Music",
      bgMusicDesc: "Ambient sounds during navigation.",
      volume: "Volume",
      notifSound: "Notification Sound",
      notifSoundDesc: "Alert sound for new station updates.",
      local: "Localization",
      lang: "System Language",
      chatbot: "Support Chatbot",
      chatbotDesc: "Show AI assistant icon in dashboard.",
      pro: "Pro Subscription",
      proDesc: "Unlock premium features and remove ads.",
      ads: "Disable Advertisements",
      adsDesc: "Keep the dashboard clean from ads.",
      upgrade: "Upgrade to Pro - $4.99/mo",
      manage: "Manage Subscription",
      upgradeReq: "UPGRADE NEEDED"
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pt-10 pb-24 px-6 space-y-8">
      {/* HEADER - Border and Save button removed */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">{t.title}</h1>
          <p className="text-muted-foreground mt-1 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- SECTION: APPEARANCE --- */}
        <Card className="bg-secondary/5 border-white/5 shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-bold">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <Sun className="h-5 w-5" />
              </div>
              {t.appearance}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-bold">{t.darkMode}</Label>
                <p className="text-xs text-muted-foreground">{t.darkModeDesc}</p>
              </div>
              <div className="flex items-center gap-3 bg-background/50 p-1.5 rounded-xl border border-white/5">
                <Sun className={cn("h-4 w-4 transition-colors", !settings.darkMode ? "text-primary" : "opacity-20")} />
                <Switch 
                    checked={settings.darkMode} 
                    onCheckedChange={(val) => updateSetting('darkMode', val)} 
                />
                <Moon className={cn("h-4 w-4 transition-colors", settings.darkMode ? "text-primary" : "opacity-20")} />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2 font-bold">
                <ImageIcon className="h-4 w-4 opacity-50" /> {t.bgImage}
              </Label>
              <Select value={settings.bgImage} onValueChange={(val) => updateSetting('bgImage', val)}>
                <SelectTrigger className="h-12 bg-background/50 border-white/10 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0c10] border-white/10">
                  <SelectItem value="none">{t.bgNone}</SelectItem>
                  <SelectItem value="city">{t.bgCity}</SelectItem>
                  <SelectItem value="abstract">{t.bgAbstract}</SelectItem>
                  <SelectItem value="minimal">{t.bgMinimal}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* --- SECTION: AUDIO --- */}
        <Card className="bg-secondary/5 border-white/5 shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-bold">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Volume2 className="h-5 w-5" />
              </div>
              {t.audio}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-bold flex items-center gap-2">
                    <Music className="h-4 w-4 opacity-50" /> {t.bgMusic}
                </Label>
                <p className="text-xs text-muted-foreground">{t.bgMusicDesc}</p>
              </div>
              <Switch 
                checked={settings.bgMusic} 
                onCheckedChange={(val) => updateSetting('bgMusic', val)} 
              />
            </div>

            {settings.bgMusic && (
                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-50">
                        <span>{t.volume}</span>
                        <span>{settings.musicVolume}%</span>
                    </div>
                    <Slider 
                        defaultValue={[settings.musicVolume]} 
                        max={100} 
                        step={1} 
                        onValueChange={(val) => updateSetting('musicVolume', val[0])}
                    />
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="space-y-1">
                <Label className="text-base font-bold flex items-center gap-2">
                    <BellRing className="h-4 w-4 opacity-50" /> {t.notifSound}
                </Label>
                <p className="text-xs text-muted-foreground">{t.notifSoundDesc}</p>
              </div>
              <Switch 
                checked={settings.notifSound} 
                onCheckedChange={(val) => updateSetting('notifSound', val)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* --- SECTION: LOCALIZATION --- */}
        <Card className="bg-secondary/5 border-white/5 shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-bold">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                <Languages className="h-5 w-5" />
              </div>
              {t.local}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="font-bold">{t.lang}</Label>
              <Select value={settings.language} onValueChange={(val) => updateSetting('language', val)}>
                <SelectTrigger className="h-12 bg-background/50 border-white/10 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0c10] border-white/10">
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="space-y-1">
                <Label className="text-base font-bold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 opacity-50" /> {t.chatbot}
                </Label>
                <p className="text-xs text-muted-foreground">{t.chatbotDesc}</p>
              </div>
              <Switch 
                checked={settings.chatBot} 
                onCheckedChange={(val) => updateSetting('chatBot', val)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* --- SECTION: PRO --- */}
        <Card className="border-primary/30 bg-primary/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
            <Crown className="h-16 w-16 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-primary">
               {t.pro}
            </CardTitle>
            <CardDescription className="text-primary/70 font-medium">{t.proDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-bold">{t.ads}</Label>
                <p className="text-xs text-muted-foreground">{t.adsDesc}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <Switch 
                    checked={settings.isPremium} 
                    onCheckedChange={(val) => updateSetting('isPremium', val)} 
                 />
                 {!settings.isPremium && (
                    <Badge variant="outline" className="text-[9px] font-black border-primary text-primary tracking-tighter py-0">
                        {t.upgradeReq}
                    </Badge>
                 )}
              </div>
            </div>

            <Button 
                variant={settings.isPremium ? "outline" : "default"} 
                className={cn(
                    "w-full h-12 font-black uppercase tracking-widest transition-all",
                    !settings.isPremium && "shadow-xl shadow-primary/20 hover:scale-[1.02]"
                )}
            >
               {settings.isPremium ? t.manage : t.upgrade}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}