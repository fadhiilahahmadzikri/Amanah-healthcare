import { fakerID_ID as faker } from '@faker-js/faker';
import type { GeneratedAddress } from './types';

export class IndonesianIdentityGenerator {
  private static readonly REGIONAL_POOLS = [
    {
      provinceName: 'DAERAH ISTIMEWA YOGYAKARTA',
      provinceCode: '34',
      regencyName: 'KABUPATEN SLEMAN',
      regencyCode: '3404',
      districtName: 'KECAMATAN DEPOK',
      districtCode: '340407',
      villageName: 'CATURTUNGGAL',
      villageCode: '3404072001'
    },
    {
      provinceName: 'DAERAH ISTIMEWA YOGYAKARTA',
      provinceCode: '34',
      regencyName: 'KOTA YOGYAKARTA',
      regencyCode: '3471',
      districtName: 'KECAMATAN GONDOMANAN',
      districtCode: '347103',
      villageName: 'PRAWINDIRAN',
      villageCode: '3471031002'
    },
    {
      provinceName: 'JAWA BARAT',
      provinceCode: '32',
      regencyName: 'KABUPATEN BOGOR',
      regencyCode: '3201',
      districtName: 'KECAMATAN CIBINONG',
      districtCode: '320101',
      villageName: 'CIRIMEUH',
      villageCode: '3201011005'
    },
    {
      provinceName: 'DKI JAKARTA',
      provinceCode: '31',
      regencyName: 'KOTA ADM. JAKARTA SELATAN',
      regencyCode: '3174',
      districtName: 'KECAMATAN TEBET',
      districtCode: '317401',
      villageName: 'TEBET BARAT',
      villageCode: '3174011001'
    }
  ];

  private static readonly PHONE_PREFIXES = [
    '0812', '0813', '0821', '0822', '0852', '0853',
    '0877', '0878', '0895', '0896', '0857', '0858'
  ];

  private constructor() {}

  public static generateNik(
    birthDateStr: string,
    isFemale: boolean = false,
    regionPrefix: string = '320101'
  ): string {
    const parts = birthDateStr.split('-');
    const year = parts[0] || '1995';
    const month = parts[1] || '06';
    const day = parseInt(parts[2] || '15', 10);
    const adjustedDay = isFemale ? String(day + 40).padStart(2, '0') : String(day).padStart(2, '0');
    const shortYear = year.slice(2);
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    return `${regionPrefix}${adjustedDay}${month}${shortYear}${randomSuffix}`;
  }

  public static generatePhone(): string {
    const prefix = this.PHONE_PREFIXES[Math.floor(Math.random() * this.PHONE_PREFIXES.length)];
    const randomDigits = String(Math.floor(10000000 + Math.random() * 90000000));
    return `${prefix}${randomDigits}`;
  }

  public static generateAddress(_cityHint?: string): GeneratedAddress {
    const pool = this.REGIONAL_POOLS[Math.floor(Math.random() * this.REGIONAL_POOLS.length)];
    const street = faker.location.streetAddress();
    const rt = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
    const rw = String(faker.number.int({ min: 1, max: 10 })).padStart(2, '0');
    const line1 = `${street}, RT ${rt}/RW ${rw}`;
    const fullAddress = `${line1}, ${pool.villageName}, ${pool.districtName}, ${pool.regencyName}, ${pool.provinceName}`;

    return {
      provinceName: pool.provinceName,
      provinceCode: pool.provinceCode,
      regencyName: pool.regencyName,
      regencyCode: pool.regencyCode,
      districtName: pool.districtName,
      districtCode: pool.districtCode,
      villageName: pool.villageName,
      villageCode: pool.villageCode,
      line1,
      fullAddress
    };
  }
}
