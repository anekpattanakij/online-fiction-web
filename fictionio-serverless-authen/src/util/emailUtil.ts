import axios from 'axios';
import { Config } from '../config';

export const sendingEmail = async (
  emailTemplateId: string,
  toAddress: string,
  content: any,
) => {
  return new Promise(async (resolve, reject) => {
    const emailOption = {
      personalizations: [
        {
          to: [{ email: toAddress }],
          dynamic_template_data: content,
        },
      ],
      from: { email: Config.FICTION_EMAIL, name: 'Fictionio No-Reply' },
      reply_to: { email: Config.FICTION_EMAIL, name: 'Fictionio No-Reply' },
      template_id: emailTemplateId,
    };

    await axios
      .post('https://api.sendgrid.com/v3/mail/send', emailOption, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          authorization: 'Bearer ' + Config.SEND_GRID_API_KEY,
        },
      })
      .then(response => {
        resolve(true);
      })
      .catch(error => {
        resolve(false);
      });
  });
};
