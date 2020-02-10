import { Injectable, Logger } from '@nestjs/common';
import { createTransport, SendMailOptions } from 'nodemailer';
import { User } from '../entities/user';
import { getConnection } from 'typeorm';
import { config } from '../config';
import uuidv4 from 'uuid/v4';

@Injectable()
export class EmailService {

  constructor() {}

  sendMail(options: SendMailOptions) {
    const transporter = createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: true,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    return transporter.sendMail({ ...options, from: config.smtp.mail });
  }

  async sendVerificationCode(user: User) {
    const emailToken = uuidv4();
    // Save email token
    await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({ activationCode: emailToken })
      .where('userId = :userId', { userId: user.userId })
      .execute();
    // Send email
    await this.sendMail({
      to: user.email,
      subject: 'Welcome!',
      text: `Your toke is: ${emailToken}`,
    });
    Logger.log(`User token is: ${emailToken}`);
  }
}
