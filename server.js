'use strict';

const express = require('express');
const fileUpload = require('express-fileupload');
const asyncHandler = require('express-async-handler')
const spawn = require('await-spawn')

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles : true,
  tempFileDir : '/tmp/',
  safeFileNames: true,
  preserveExtension: true
}));

app.post('/qrdecode', asyncHandler(async (req, res) => {
  try{
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const data = req.files.data;
  
  let transformed = data.tempFilePath;
  if(data.name.toUpperCase().endsWith(".PDF")){
    // convert to image
    await spawn('pdftoppm', [data.tempFilePath, '-singlefile', '-png', data.tempFilePath]);
    transformed = data.tempFilePath + ".png";
  }

  const result = (await spawn('zbarimg', ['--raw', '-q', transformed])).toString('utf8').trim();

  let response = {};
  response[data.name] = result;

  // clean up temp files.
  await spawn('rm', [data.tempFilePath]);
  if( transformed !== data.tempFilePath){
    await spawn('rm', [transformed]);
  }
  console.log(response);
  res.json(response);
}
 catch (error) {
  console.log(error);
  console.log(error.stderr.toString());
  res.sendStatus(500);
}
}));

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

