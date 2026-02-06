import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const mailUser = config.get('MAIL_USER');
        const mailPassword = config.get('MAIL_PASSWORD');

        // 只有在提供認證信息時才添加 auth 配置
        const transportConfig: any = {
          host: config.get('MAIL_HOST'),
          port: config.get('MAIL_PORT'),
          secure: false, // true for 465, false for other ports
        };

        // 如果提供了使用者名稱和密碼，則添加認證
        if (mailUser && mailPassword) {
          transportConfig.auth = {
            user: mailUser,
            pass: mailPassword,
          };
        }

        return {
          transport: transportConfig,
          defaults: {
            from: `"${config.get('MAIL_FROM_NAME')}" <${config.get('MAIL_FROM')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(
              {
                eq: (a: any, b: any) => a === b,
              },
              { inlineCssEnabled: false },
            ),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
