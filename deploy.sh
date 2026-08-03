#!/bin/bash
# 1. Ensure we are pulling from the specific backend branch
# (Replace 'backend' with your exact branch name if different)
git checkout REST-API
git pull origin REST-API

# 2. Activate Python virtual environment & install dependencies
source /home/ec2-user/Citi_RestAPI/venv/bin/activate
pip install -r requirements.txt

# 3. Restart the background service
sudo systemctl restart flaskapp
