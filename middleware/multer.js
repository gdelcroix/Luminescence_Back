const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour stocker les fichiers dans le dossier 'uploads'
const storage = multer.memoryStorage();

const convertAndSaveImg = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const avifFileName = `${Date.now()}-${path.parse(req.file.originalname).name}.avif`;
  const avifFilePath = path.join('images', avifFileName);

  sharp(req.file.buffer)
    .toFormat('avif')
    .toFile(avifFilePath, (err, info) => {
      if (err) {
        return next(err);
      }
      req.file.filename = avifFileName;
      req.file.path = avifFilePath;
      next();
    });
};

const upload = multer({ storage: storage });

module.exports = { upload, convertAndSaveImg };
