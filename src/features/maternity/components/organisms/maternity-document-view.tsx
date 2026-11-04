'use client';

import * as React from 'react';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGenderLabel } from '@/constants/gender.constants';
import { maternityDocxService } from '../../services/maternity-docx.service';
import type { MaternityIntake } from '../../types/maternity.types';

export interface MaternityDocumentViewProps {
  intake: MaternityIntake;
}

export function MaternityDocumentView({ intake }: MaternityDocumentViewProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      await maternityDocxService.generateAndDownload(intake);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Formulir Rekam Medis Praktik Mandiri Bidan
          </h4>
          <p className="text-xs text-muted-foreground">
            Dokumen klinis resmi PMB Nur Hidayatun, S.ST, BDN.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs gap-1 cursor-pointer"
          >
            <Printer className="size-3.5" />
            Cetak
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDownloadDocx}
            disabled={isExporting}
            className="h-8 text-xs gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="size-3.5" />
            {isExporting ? 'Mengunduh...' : 'Download DOCX (Word)'}
          </Button>
        </div>
      </div>

      {/* Visual Paper Layout */}
      <div className="rounded-lg border border-border/80 bg-card p-6 shadow-sm font-serif text-foreground text-xs leading-relaxed space-y-4 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-foreground/80 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold tracking-tight uppercase">
              PRAKTIK MANDIRI BIDAN NUR HIDAYATUN, S.ST, BDN.
            </h2>
            <p className="text-[11px] text-muted-foreground">
              SIPB: 503/000058.05.22/0053/K18/B/2022 | WA. 081 392 45 6064
            </p>
            <p className="text-[11px] text-muted-foreground">
              Jl. Anyelir I No. 243 Perumnas Condongcatur, Depok, Sleman, DIY 55283
            </p>
          </div>
          <div className="border border-foreground/60 p-2 rounded text-right space-y-1">
            <span className="font-bold block text-[11px]">RM ANC : K1 / K4</span>
            <span className="italic text-[10px] text-muted-foreground block">
              Alergi: {intake.allergyInfo || 'Tidak ada'}
            </span>
          </div>
        </div>

        {/* Section 1: Identitas */}
        <div className="space-y-2">
          <h3 className="font-bold text-[12px] uppercase border-b border-border/60 pb-1">
            I. Identitas Pasien & Suami
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div>
                <span className="text-muted-foreground">Nama Ibu:</span>{' '}
                <span className="font-semibold">{intake.motherName || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">NIK:</span> {intake.motherNik || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Tgl Lahir / Umur:</span>{' '}
                {intake.motherBirthDate || '-'} ({intake.motherAge ? `${intake.motherAge} th` : '-'})
              </div>
              <div>
                <span className="text-muted-foreground">Pekerjaan:</span> {intake.motherJob || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Pendidikan:</span>{' '}
                {intake.motherEducation || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Agama:</span> {intake.religion || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">No. Telp / WA:</span>{' '}
                {intake.phoneNumber || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Alamat Domisili:</span>{' '}
                {intake.domicileAddress || '-'}
              </div>
            </div>

            <div className="space-y-1">
              <div>
                <span className="text-muted-foreground">Nama Suami:</span>{' '}
                <span className="font-semibold">
                  {intake.husbandProfile?.fullName || intake.partnerName || '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">NIK Suami:</span>{' '}
                {intake.husbandProfile?.nik || intake.partnerNik || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Umur Suami:</span>{' '}
                {intake.husbandProfile?.age || intake.partnerAge || '-'} th
              </div>
              <div>
                <span className="text-muted-foreground">Pekerjaan Suami:</span>{' '}
                {intake.husbandProfile?.job || intake.partnerJob || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Pendidikan Suami:</span>{' '}
                {intake.husbandProfile?.education || intake.partnerEducation || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Gol. Darah Suami:</span>{' '}
                {intake.husbandProfile?.bloodType || intake.partnerBloodType || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Pernikahan Ke:</span>{' '}
                {intake.marriageOrder || 1} (Tgl: {intake.marriageDate || '-'})
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Obstetri & Fisik */}
        <div className="space-y-2">
          <h3 className="font-bold text-[12px] uppercase border-b border-border/60 pb-1">
            II. Data Obstetri & Baseline Fisik
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div>
                <span className="text-muted-foreground">HPHT:</span>{' '}
                <span className="font-semibold">{intake.hpht || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">HPL (Taksiran Persalinan):</span>{' '}
                <span className="font-semibold text-primary">{intake.estimatedDueDate || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Usia Kehamilan:</span>{' '}
                <span className="font-semibold">{intake.gestationalAgeFormatted || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status Paritas:</span> G{intake.gravidaCount || 1} P{intake.parityCount || 0} Ab{intake.abortionCount || 0} Ah{intake.livingChildrenCount || 0}
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-muted-foreground">TB / BB Awal:</span>{' '}
                {intake.heightCm || '-'} cm / {intake.prePregnancyWeightKg || '-'} kg (IMT: {intake.initialBmi || '-'})
              </div>
              <div>
                <span className="text-muted-foreground">LiLA (Lingkar Lengan):</span>{' '}
                {intake.upperArmCircumferenceCm || '-'} cm
              </div>
              <div>
                <span className="text-muted-foreground">Gol. Darah Ibu:</span>{' '}
                {intake.motherBloodType || '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Status Imunisasi TT:</span>{' '}
                {intake.tetanusStatus || '-'}
              </div>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Keluhan Saat Ini:</span>{' '}
            <span className="italic">{intake.currentComplaints || '-'}</span>
          </div>
        </div>

        {/* Section 3: Riwayat Kehamilan Lalu */}
        <div className="space-y-2">
          <h3 className="font-bold text-[12px] uppercase border-b border-border/60 pb-1">
            III. Riwayat Kehamilan & Persalinan Lalu
          </h3>
          {intake.previousPregnancies && intake.previousPregnancies.length > 0 ? (
            <div className="border border-border/60 rounded overflow-hidden">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-muted/40 border-b border-border/60">
                  <tr>
                    <th className="p-1.5 text-center">No</th>
                    <th className="p-1.5">Tahun</th>
                    <th className="p-1.5">BB/PB</th>
                    <th className="p-1.5">JK</th>
                    <th className="p-1.5">UK</th>
                    <th className="p-1.5">Penolong</th>
                    <th className="p-1.5">Cara Lahir</th>
                    <th className="p-1.5">Tempat</th>
                    <th className="p-1.5">Komplikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {intake.previousPregnancies.map((p, idx) => (
                    <tr key={idx}>
                      <td className="p-1.5 text-center">{p.orderNumber || idx + 1}</td>
                      <td className="p-1.5">{p.birthYear || '-'}</td>
                      <td className="p-1.5">{p.birthWeightGrams || '-'}gr / {p.birthLengthCm || '-'}cm</td>
                      <td className="p-1.5">{getGenderLabel(p.childSex)}</td>
                      <td className="p-1.5">{p.gestationalAgeAtBirth || '-'}</td>
                      <td className="p-1.5">{p.birthAttendant || '-'}</td>
                      <td className="p-1.5">{p.deliveryMethod || '-'}</td>
                      <td className="p-1.5">{p.deliveryPlace || '-'}</td>
                      <td className="p-1.5">{p.complications || 'Tidak ada'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="italic text-muted-foreground text-[11px]">
              Tidak ada riwayat kehamilan dan persalinan sebelumnya (Primigravida).
            </p>
          )}
        </div>

        {/* Section 4: Skrining Penyakit & KB */}
        <div className="space-y-2">
          <h3 className="font-bold text-[12px] uppercase border-b border-border/60 pb-1">
            IV. Skrining Penyakit & Riwayat KB
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold block mb-1">Penyakit Terkonfirmasi:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {intake.conditionResponses &&
                intake.conditionResponses.filter((c) => c.hasCondition).length > 0 ? (
                  intake.conditionResponses
                    .filter((c) => c.hasCondition)
                    .map((c, idx) => (
                      <li key={idx}>
                        {c.conditionCode.replace(/_/g, ' ')}
                        {c.diagnosisYear ? ` (Tahun ${c.diagnosisYear})` : ''}
                        {c.notes ? `: ${c.notes}` : ''}
                      </li>
                    ))
                ) : (
                  <li className="italic text-muted-foreground">
                    Tidak ada riwayat penyakit sistemik yang terkonfirmasi.
                  </li>
                )}
              </ul>
            </div>
            <div>
              <span className="font-semibold block mb-1">Riwayat Kontrasepsi (KB):</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {intake.contraceptiveHistories && intake.contraceptiveHistories.length > 0 ? (
                  intake.contraceptiveHistories.map((k, idx) => (
                    <li key={idx}>
                      {k.contraceptiveType || '-'} - {k.durationText || '-'}
                      {k.problems ? ` (${k.problems})` : ''}
                    </li>
                  ))
                ) : (
                  <li className="italic text-muted-foreground">
                    Belum pernah menggunakan alat kontrasepsi.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
