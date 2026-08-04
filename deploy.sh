#!/bin/bash
# 1. Move into the repo directory
cd /home/ec2-user/CitiBank_FullStack_Training_2026

# 2. Pull latest code
git checkout REST-API
git pull origin REST-API

# 3. Activate the virtual environment inside THIS directory
source /home/ec2-user/CitiBank_FullStack_Training_2026/venv/bin/activate

# 4. Install requirements (If requirements.txt is in a subfolder, update path e.g. pip install -r backend/requirements.txt)
if [ -f "Citi_RestAPI/requirements.txt" ]; then
    pip install -r requirements.txt
fi

# 5. Restart background service
sudo systemctl restart flaskapp
