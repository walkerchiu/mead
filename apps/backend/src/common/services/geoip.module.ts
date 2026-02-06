import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeoIPService } from './geoip.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [GeoIPService],
  exports: [GeoIPService],
})
export class GeoIPModule {}
