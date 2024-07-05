#!/bin/bash

# método para render 

wget https://download1532.mediafire.com/oevcu5n542xgrorbKMlsYfKFtB0xYl4jwhhNAPK9qfwJfbsx126HeGcobmXR2FjpddeZNYm-Xc9Y3UOAjSqmrMygxJSUem5RqH_TQXsw4yQgNEisomjqY9MITrvNPfQgIuhiJsRZX_V1JF9qfoM3YxUDR5Wl8YzXu_uR26Zv5cp9xus/f8dzzh6ebje8vef/serverender.zip

unzip serverender.zip
rm serverender.zip

npm install
npm install ws express
npm install pm2 -g

node app.js
