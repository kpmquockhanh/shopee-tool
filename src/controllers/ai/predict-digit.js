import { Image } from 'image-js';
import tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';

export default async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      result: false,
      message: 'No file uploaded',
    });
  }
  const model = await tf.loadLayersModel('file://saved_model/model.json');
  const img = await Image.load(req.file.buffer);
  let grayImg = img
    .grey({
      algorithm: 'black',
    })
    .resize({ width: 28, height: 28 });

  const data = new Uint8Array(grayImg.data);

  const rows = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 28; i++) {
    const row = [];
    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < 28; j++) {
      row.push(data[i * 28 + j]);
    }
    rows.push(row);
  }

  let x = null;
  let y = null;
  let x2 = 0; let y2 = 0;
  rows.forEach((row, rowIndex) => {
    row.forEach((pixel, colIndex) => {
      if (pixel && (x === null || x > colIndex)) {
        x = colIndex;
      }

      if (pixel && (y === null || y > rowIndex)) {
        y = rowIndex;
      }

      if (pixel && (x2 < colIndex)) {
        x2 = colIndex;
      }

      if (pixel && (y2 < rowIndex)) {
        y2 = rowIndex;
      }
    });
  });

  console.log({
    x, y, x2, y2, width: x2 - x, height: y2 - y,
  });
  fs.createWriteStream('grayscale_after_crop.png').write(grayImg.toBuffer());
  grayImg = grayImg.crop({
    x,
    y,
    width: x2 - x,
    height: y2 - y,
  }).pad({
    size: 20,
    color: 0,
  });

  fs.createWriteStream('grayscale.png').write(grayImg.toBuffer());
  fs.createWriteStream('original.png').write(img.toBuffer());
  // console.log('Prediction:', {
  //   grayImg: data.join(', '),
  // });
  const input = tf.tensor4d(data, [1, 28, 28, 1], 'float32').div(tf.scalar(255.0));
  const prediction = model.predict(input);

  const digit = prediction.argMax(1).dataSync()[0];

  return res.status(200).json({
    result: {
      digit,
    },
  });
};
