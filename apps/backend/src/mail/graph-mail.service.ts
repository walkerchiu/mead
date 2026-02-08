import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GraphMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class GraphMailService {
  private readonly logger = new Logger(GraphMailService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  private readonly tenantId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly mailFrom: string;

  constructor(private readonly config: ConfigService) {
    this.tenantId = this.config.get<string>('GRAPH_TENANT_ID', '');
    this.clientId = this.config.get<string>('GRAPH_CLIENT_ID', '');
    this.clientSecret = this.config.get<string>('GRAPH_CLIENT_SECRET', '');
    this.mailFrom = this.config.get<string>(
      'GRAPH_MAIL_FROM',
      this.config.get<string>('MAIL_FROM', ''),
    );
  }

  /**
   * 檢查 Graph API 是否已配置
   */
  isConfigured(): boolean {
    return !!(
      this.tenantId &&
      this.clientId &&
      this.clientSecret &&
      this.mailFrom
    );
  }

  /**
   * 取得 OAuth2 Access Token（Client Credentials Flow）
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      this.logger.error(
        `Failed to get Graph API token: ${res.status} ${errText}`,
      );
      throw new Error(`Graph API token request failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = now + data.expires_in * 1000;

    this.logger.log('Graph API access token acquired');
    return this.accessToken;
  }

  /**
   * 透過 Microsoft Graph API 發送郵件
   */
  async sendMail(options: GraphMailOptions): Promise<void> {
    const token = await this.getAccessToken();

    const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${this.mailFrom}/sendMail`;

    const payload = {
      message: {
        subject: options.subject,
        body: {
          contentType: 'HTML',
          content: options.html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: options.to,
            },
          },
        ],
      },
      saveToSentItems: false,
    };

    const res = await fetch(sendMailUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      this.logger.error(`Graph API sendMail failed: ${res.status} ${errText}`);
      throw new Error(`Graph API sendMail failed: ${res.status} - ${errText}`);
    }

    this.logger.log(`Email sent via Graph API to ${options.to}`);
  }
}
