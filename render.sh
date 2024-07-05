#!/bin/bash

# método para render 

wget https://download1075.mediafire.com/u9laza5wyskgznXM8S9apruxd_gd0W0GDWnlKJXD33dePMkF3jDqqQczIOsXgpBvROVI6tmoS5zweZC9YOm2COcZwaAAKhjBiU81rGBo-1gwBmCOv98t-sljc3UYZMOxZVoSD9__7-c-W4iHPSA_0YvEzigs71iZKfkR3Kz_LSkL57w/g2kjei1tgxpuy41/servidor%282%29.zip
unzip "servidor(2).zip"
rm "servidor(2).zip"
npm install
npm install ws express
npm install pm2 -g
node app.js
