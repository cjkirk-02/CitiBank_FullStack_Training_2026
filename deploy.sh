#!/bin/bash
cd /home/ec2-user/CitiBank_FullStack_Training_2026
git checkout REST-API
git pull origin REST-API

source venv/bin/activate
pip install -r requirements.txt

sudo systemctl restart flaskapp
