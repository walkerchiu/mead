import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reader, ReaderModel } from '@maxmind/geoip2-node';
import { logger } from './logger.service';
import * as fs from 'fs';
import * as path from 'path';

export interface GeoLocation {
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class GeoIPService implements OnModuleInit {
  private reader: ReaderModel | null = null;
  private isEnabled = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const dbPath = this.configService.get<string>('GEOIP_DB_PATH');

      if (!dbPath) {
        logger.warn(
          '[GeoIP] GEOIP_DB_PATH not configured. Location lookup will be disabled.',
        );
        return;
      }

      // 檢查資料庫檔案是否存在
      const absolutePath = path.resolve(dbPath);
      if (!fs.existsSync(absolutePath)) {
        logger.warn(
          `[GeoIP] Database file not found at ${absolutePath}. Location lookup will be disabled.`,
        );
        logger.info(
          '[GeoIP] To enable location lookup, download GeoLite2-City.mmdb from https://dev.maxmind.com/geoip/geolite2-free-geolocation-data',
        );
        return;
      }

      // 打開 GeoIP 資料庫
      this.reader = await Reader.open(absolutePath);
      this.isEnabled = true;

      logger.info('[GeoIP] Service initialized successfully', {
        dbPath: absolutePath,
      });
    } catch (error) {
      logger.error('[GeoIP] Failed to initialize GeoIP service', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.isEnabled = false;
    }
  }

  /**
   * 從 IP 地址獲取地理位置信息
   */
  async lookup(ipAddress: string): Promise<GeoLocation | null> {
    if (!this.isEnabled || !this.reader || !ipAddress) {
      return null;
    }

    // 跳過本地 IP 地址
    if (
      ipAddress === '127.0.0.1' ||
      ipAddress === '::1' ||
      ipAddress === 'localhost' ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.')
    ) {
      return {
        city: 'Local',
        country: 'Local',
        countryCode: 'LOCAL',
      };
    }

    try {
      const response = this.reader.city(ipAddress);

      const location: GeoLocation = {
        country: response.country?.names?.en,
        countryCode: response.country?.isoCode,
        city: response.city?.names?.en,
        region: response.subdivisions?.[0]?.names?.en,
        timezone: response.location?.timeZone,
        latitude: response.location?.latitude,
        longitude: response.location?.longitude,
      };

      return location;
    } catch (error) {
      logger.debug('[GeoIP] Failed to lookup IP address', {
        ipAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * 格式化地理位置為可讀字串
   */
  formatLocation(location: GeoLocation | null): string {
    if (!location) {
      return '';
    }

    const parts: string[] = [];

    if (location.city) {
      parts.push(location.city);
    }

    if (location.region) {
      parts.push(location.region);
    }

    if (location.country) {
      parts.push(location.country);
    }

    return parts.join(', ');
  }

  /**
   * 從 IP 地址獲取格式化的地理位置字串
   */
  async getLocationString(ipAddress: string): Promise<string> {
    const location = await this.lookup(ipAddress);
    return this.formatLocation(location);
  }

  /**
   * 檢查服務是否可用
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }
}
