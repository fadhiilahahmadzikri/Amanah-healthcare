'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import {
  ModernStyledQRCode,
  useQRStyleStore,
  type QRDotType,
  type QRCornerSquareType,
  type QRCornerDotType,
  type QRErrorCorrection
} from '@/features/kehadiran-pegawai';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DOT_PATTERN_OPTIONS: { value: QRDotType; label: string; desc: string }[] = [
  {
    value: 'rounded',
    label: 'Rounded Modern (Rekomendasi)',
    desc: 'Titik membulat halus & futuristik'
  },
  { value: 'dots', label: 'Bintik Bulat (Dots)', desc: 'Titik lingkaran simetris' },
  { value: 'classy', label: 'Classy Minimalis', desc: 'Bentuk dinamis elegan' },
  { value: 'classy-rounded', label: 'Classy Rounded', desc: 'Lengkungan modern lembut' },
  { value: 'extra-rounded', label: 'Extra Rounded', desc: 'Sangat melengkung & organik' },
  { value: 'square', label: 'Klasik Matrix (Square)', desc: 'Format kotak standar industri' }
];

const CORNER_SQUARE_OPTIONS: { value: QRCornerSquareType; label: string }[] = [
  { value: 'extra-rounded', label: 'Sudut Membulat Halus (Extra Rounded)' },
  { value: 'dot', label: 'Sudut Lingkaran (Dot)' },
  { value: 'square', label: 'Sudut Kotak Tegas (Square)' }
];

const CORNER_DOT_OPTIONS: { value: QRCornerDotType; label: string }[] = [
  { value: 'dot', label: 'Titik Bulat (Dot)' },
  { value: 'square', label: 'Titik Kotak (Square)' }
];

const COLOR_PRESETS = [
  { name: 'Slate Dark', hex: '#0f172a' },
  { name: 'Amanah Navy', hex: '#1e3a8a' },
  { name: 'Medical Emerald', hex: '#047857' },
  { name: 'Deep Indigo', hex: '#4338ca' },
  { name: 'Dark Teal', hex: '#0f766e' },
  { name: 'Midnight Black', hex: '#000000' }
];

function handleSave() {
  toast.success('Konfigurasi gaya & rotasi QR Code berhasil disimpan.');
}

export function QRConfigSettings() {
  const {
    dotType,
    cornerSquareType,
    cornerDotType,
    fgColor,
    rotationSeconds,
    showCenterLogo,
    errorCorrection,
    setDotType,
    setCornerSquareType,
    setCornerDotType,
    setFgColor,
    setRotationSeconds,
    setShowCenterLogo,
    setErrorCorrection,
    resetDefaults
  } = useQRStyleStore();

  const handleReset = () => {
    resetDefaults();
    toast.info('Konfigurasi QR Code telah dikembalikan ke default.');
  };

  const previewPayload = JSON.stringify({ preview: true });

  return (
    <div className='grid grid-cols-1 xl:grid-cols-12 gap-6 font-sans items-start'>
      {/* Left Form: Configuration Controls */}
      <div className='xl:col-span-7 space-y-6'>
        {/* 1. Pola Titik & Bentuk QR */}
        <Card className='border border-border/60 shadow-xs'>
          <CardHeader className='pb-4 border-b border-border/40'>
            <div className='flex items-center gap-2'>
              <div className='size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center'>
                <Icons.qrCode className='size-4' />
              </div>
              <div>
                <CardTitle className='text-base font-bold text-foreground'>
                  Pola & Bentuk Gaya QR Code
                </CardTitle>
                <CardDescription className='text-xs'>
                  Kustomisasi estetika visual matriks QR presensi dokter & staf.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-4 pt-4'>
            {/* Pola Titik (Dots Pattern) */}
            <div className='space-y-2'>
              <Label className='text-xs font-semibold text-foreground'>
                Pola Titik Matriks (Dots Pattern)
              </Label>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {DOT_PATTERN_OPTIONS.map((opt) => {
                  const isSelected = dotType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type='button'
                      onClick={() => setDotType(opt.value)}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-2xs'
                          : 'border-border/60 hover:bg-muted/30 hover:border-border'
                      )}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-xs font-bold text-foreground'>{opt.label}</span>
                        {isSelected && <Icons.check className='size-3.5 text-primary' />}
                      </div>
                      <p className='text-[11px] text-muted-foreground mt-0.5'>{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bentuk Sudut & Titik Sudut */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-foreground'>
                  Bentuk Sudut (Corner Square)
                </Label>
                <Select
                  value={cornerSquareType}
                  onValueChange={(val) => setCornerSquareType(val as QRCornerSquareType)}
                >
                  <SelectTrigger className='h-9 text-xs bg-background'>
                    <SelectValue placeholder='Pilih bentuk sudut' />
                  </SelectTrigger>
                  <SelectContent>
                    {CORNER_SQUARE_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value} className='text-xs'>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-foreground'>
                  Titik Dalam Sudut (Corner Dot)
                </Label>
                <Select
                  value={cornerDotType}
                  onValueChange={(val) => setCornerDotType(val as QRCornerDotType)}
                >
                  <SelectTrigger className='h-9 text-xs bg-background'>
                    <SelectValue placeholder='Pilih titik sudut' />
                  </SelectTrigger>
                  <SelectContent>
                    {CORNER_DOT_OPTIONS.map((cd) => (
                      <SelectItem key={cd.value} value={cd.value} className='text-xs'>
                        {cd.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Warna & Logo Klinik */}
        <Card className='border border-border/60 shadow-xs'>
          <CardHeader className='pb-4 border-b border-border/40'>
            <div className='flex items-center gap-2'>
              <div className='size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center'>
                <Icons.palette className='size-4' />
              </div>
              <div>
                <CardTitle className='text-base font-bold text-foreground'>
                  Warna & Identitas Brand
                </CardTitle>
                <CardDescription className='text-xs'>
                  Sesuaikan palet warna QR dan penyematan logo klinik di bagian tengah.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-4 pt-4'>
            {/* Color Palette Presets */}
            <div className='space-y-2'>
              <Label className='text-xs font-semibold text-foreground'>Palet Warna Utama QR</Label>
              <div className='flex items-center gap-2 flex-wrap'>
                {COLOR_PRESETS.map((p) => {
                  const isSelected = fgColor.toLowerCase() === p.hex.toLowerCase();
                  return (
                    <button
                      key={p.hex}
                      type='button'
                      onClick={() => setFgColor(p.hex)}
                      className={cn(
                        'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 shadow-2xs'
                          : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                      )}
                    >
                      <span
                        className='size-3 rounded-full shrink-0 border border-black/20'
                        style={{ backgroundColor: p.hex }}
                      />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggle Logo di Tengah */}
            <div className='flex items-center justify-between pt-3 border-t border-border/40'>
              <div className='space-y-0.5'>
                <Label className='text-xs font-semibold text-foreground'>
                  Logo Klinik di Tengah QR
                </Label>
                <p className='text-[11px] text-muted-foreground'>
                  Sematkan logo resmi Amanah Healthcare di pusat matriks QR.
                </p>
              </div>
              <Switch checked={showCenterLogo} onCheckedChange={setShowCenterLogo} />
            </div>
          </CardContent>
        </Card>

        {/* 3. Rotasi & Keamanan Presensi */}
        <Card className='border border-border/60 shadow-xs'>
          <CardHeader className='pb-4 border-b border-border/40'>
            <div className='flex items-center gap-2'>
              <div className='size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center'>
                <Icons.clock className='size-4' />
              </div>
              <div>
                <CardTitle className='text-base font-bold text-foreground'>
                  Rotasi & Keamanan Sesi
                </CardTitle>
                <CardDescription className='text-xs'>
                  Pengaturan interval waktu rotasi dinamis untuk mencegah manipulasi kehadiran.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-4 pt-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {/* Interval Rotasi */}
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-foreground'>
                  Interval Rotasi Kode
                </Label>
                <Select
                  value={`${rotationSeconds}`}
                  onValueChange={(val) => setRotationSeconds(Number(val))}
                >
                  <SelectTrigger className='h-9 text-xs bg-background'>
                    <SelectValue placeholder='Pilih interval' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='15' className='text-xs'>
                      15 Detik (Sangat Ketat)
                    </SelectItem>
                    <SelectItem value='30' className='text-xs'>
                      30 Detik (Standar Rekomendasi)
                    </SelectItem>
                    <SelectItem value='45' className='text-xs'>
                      45 Detik (Fleksibel)
                    </SelectItem>
                    <SelectItem value='60' className='text-xs'>
                      60 Detik (1 Menit)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Correction Level */}
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-foreground'>
                  Tingkat Koreksi Error (ECL)
                </Label>
                <Select
                  value={errorCorrection}
                  onValueChange={(val) => setErrorCorrection(val as QRErrorCorrection)}
                >
                  <SelectTrigger className='h-9 text-xs bg-background'>
                    <SelectValue placeholder='Pilih ECL' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='L' className='text-xs'>
                      Level L (7% Recovery)
                    </SelectItem>
                    <SelectItem value='M' className='text-xs'>
                      Level M (15% Standar Rekomendasi)
                    </SelectItem>
                    <SelectItem value='Q' className='text-xs'>
                      Level Q (25% High Reliability)
                    </SelectItem>
                    <SelectItem value='H' className='text-xs'>
                      Level H (30% Maximum Recovery)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='pt-3 border-t border-border/40 flex items-center justify-between'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleReset}
                className='text-xs font-medium gap-1.5'
              >
                <Icons.refresh className='size-3.5' />
                <span>Reset Default</span>
              </Button>

              <Button
                type='button'
                variant='default'
                size='sm'
                onClick={handleSave}
                className='text-xs font-semibold px-5 gap-1.5'
              >
                <Icons.check className='size-3.5' />
                <span>Simpan Konfigurasi</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Real-Time Live Interactive QR Preview */}
      <div className='xl:col-span-5 sticky top-6 space-y-4'>
        <Card className='border border-border/70 shadow-sm p-4 sm:p-5 bg-card text-card-foreground rounded-2xl'>
          <div className='flex items-center justify-between pb-3 border-b border-border/40'>
            <div className='flex items-center gap-2'>
              <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
              <span className='text-xs font-bold text-foreground'>Live Preview Hasil QR</span>
            </div>
            <span className='px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20'>
              Real-Time
            </span>
          </div>

          {/* QR Canvas Display */}
          <div className='flex flex-col items-center justify-center pt-4 pb-2'>
            <div className='w-full max-w-[260px] aspect-square flex items-center justify-center bg-white p-2.5 rounded-xl border border-border/40 shadow-xs'>
              <ModernStyledQRCode data={previewPayload} size={240} className='w-full h-full' />
            </div>

            {/* Dynamic Details Preview */}
            <div className='w-full text-center mt-4 space-y-1'>
              <div className='flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground'>
                <Icons.clock className='size-3.5 text-primary' />
                <span>Rotasi:</span>
                <span className='font-mono font-bold text-foreground'>{rotationSeconds}s</span>
                <span className='text-muted-foreground/60'>•</span>
                <span className='capitalize font-medium text-foreground'>{dotType}</span>
              </div>

              <div className='pt-1'>
                <div className='text-2xl sm:text-3xl font-black tracking-widest text-foreground font-mono leading-none'>
                  -
                </div>
                <p className='text-[10.5px] text-muted-foreground mt-1'>
                  QR Code otomatis terkonfigurasi ke seluruh panel presensi & kiosk live.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
