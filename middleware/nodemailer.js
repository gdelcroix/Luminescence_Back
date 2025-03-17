const nodemailer = require('nodemailer');

const sendMail = async (formulaire) => {
  let transport = nodemailer.createTransport({
    service: 'gmail',
    logger: true,
    debug: true, // options pour avoir un log, TODO: a supprimer en production
    disableFileAccess: true, // pas de pièces jointes, juste du json
    disableUrlAccess: true, // pas d'urls en contenu, pour la sécurité.
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    // tls: {
    //   maxVersion: 'TLSv1.3',
    //   minVersion: 'TLSv1.2',
    //   ciphers: 'TLS_AES_256_GCM_SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305',
    // },
    auth: {
      user: 'luminessencedusavoir@gmail.com',
      pass: process.env.MAIL_PASSWORD,
    },
  });

  let info = await transport.sendMail({
    from: 'Formulaire de contact site luminessencedusavoir',
    to: 'luminessencedusavoir@gmail.com',
    subject: 'demande de contact',
    text: `message de ${formulaire.nom} ${formulaire.prenom} <br/> contact email ${formulaire.Email} et/ou téléphone ${formulaire.telephone} <br/> message : ${formulaire.message}`,
    html: `<b>message de ${formulaire.nom} ${formulaire.prenom} </b><br/> contact email : ${formulaire.Email} et/ou téléphone : ${formulaire.telephone} <br/> message : ${formulaire.message}`,
  });

  console.log('message envoyé : ' + JSON.stringify(info.messageId));
};

module.exports = sendMail;