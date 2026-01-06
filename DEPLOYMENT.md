# Deployment Guide for Sonic RPG V4

## GitHub Setup

1. **Initialize Git Repository** (if not already done):
   ```bash
   cd sonic-rpg-v4
   git init
   git add .
   git commit -m "Initial commit - Sonic RPG V4"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/willialso
   - Click "New repository"
   - Name it: `sonic_rpg`
   - Don't initialize with README (we already have files)
   - Click "Create repository"

3. **Connect and Push**:
   ```bash
   git remote add origin https://github.com/willialso/sonic_rpg.git
   git branch -M main
   git push -u origin main
   ```

## Render Deployment

1. **Sign up/Login to Render**:
   - Go to https://render.com
   - Sign up or login with your GitHub account

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select repository: `willialso/sonic_rpg`

3. **Configure Settings**:
   - **Name**: `sonic-rpg` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `sonic-rpg-v4` if you want to deploy from subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

4. **Advanced Settings** (optional):
   - **Auto-Deploy**: Yes (deploys on every push to main)
   - **Health Check Path**: `/`

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically install dependencies and start the server
   - Your site will be live at: `https://sonic-rpg.onrender.com` (or your custom domain)

## Important Notes

- **Port**: The server uses `process.env.PORT` which Render provides automatically
- **Static Files**: All files in the directory are served statically
- **Updates**: Every push to main branch will automatically redeploy
- **Custom Domain**: You can add a custom domain in Render dashboard under your service settings

## Troubleshooting

- If deployment fails, check the logs in Render dashboard
- Make sure `package.json` and `server.js` are in the root directory
- Ensure all image files are committed to git
- Check that `node_modules` is in `.gitignore` (it should be)

