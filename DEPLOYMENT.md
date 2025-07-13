# Heroku Deployment Guide

This guide will help you deploy your video chat application to Heroku.

## Prerequisites

1. **Heroku CLI**: Install the Heroku CLI from https://devcenter.heroku.com/articles/heroku-cli
2. **Git**: Make sure Git is installed and configured
3. **Heroku Account**: Sign up for a free Heroku account at https://heroku.com

## Deployment Steps

### 1. Login to Heroku
```bash
heroku login
```

### 2. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 3. Create Heroku App
```bash
heroku create your-app-name
```
Replace `your-app-name` with your desired app name. If you don't specify a name, Heroku will generate one.

### 4. Set up Environment Variables (Optional)
If you have any environment variables, set them:
```bash
heroku config:set NODE_ENV=production
```

### 5. Deploy to Heroku
```bash
git push heroku main
```
(If your default branch is `master`, use `git push heroku master`)

### 6. Open Your App
```bash
heroku open
```

## Troubleshooting

### Check Logs
```bash
heroku logs --tail
```

### Scale Dynos
```bash
heroku ps:scale web=1
```

### Restart App
```bash
heroku restart
```

## Configuration Files

- **Procfile**: Tells Heroku how to run your app
- **package.json**: Contains Node.js version and dependencies
- **.gitignore**: Excludes unnecessary files from deployment

## Important Notes

1. The app is configured to use `process.env.PORT` which Heroku provides automatically
2. Make sure all dependencies are listed in `package.json`
3. The app will be accessible at `https://your-app-name.herokuapp.com`

## Live Demo

Your app will be similar to: https://video-chat-app-v1.herokuapp.com/
