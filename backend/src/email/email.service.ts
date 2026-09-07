import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly from = process.env.RESEND_FROM_EMAIL ?? 'Post-It <onboarding@resend.dev>';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined');
    }

    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail(
    email: string,
    code: string,
  ): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: 'Verify your Post-It email address',
      html: `
        <p>Welcome to PostIt.</p>
        <p>Enter this verification code on the PostIt verification page:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${code}</p>
        <p>This code expires in 24 hours.</p>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      throw new Error('Verification email could not be sent');
    }
  }
}
