# GitHub Actions Deployment Workflow

This workflow automates the deployment of both the backend and frontend services to Render when code is pushed to the main/master branch.

## Features

- **Parallel Deployment**: Both services deploy simultaneously for faster deployments
- **Error Handling**: Comprehensive error handling with detailed status reporting
- **Deployment Summary**: Clear summary of deployment results in GitHub Actions
- **Optional Health Checks**: Post-deployment health checks for both services
- **Manual Trigger**: Can be triggered manually via GitHub Actions UI

## Setup Instructions

### 1. Get Render Deploy Hooks

1. Log in to your [Render Dashboard](https://dashboard.render.com)
2. For each service (backend and frontend):
   - Navigate to your service
   - Go to Settings → Deploy Hook
   - Copy the deploy hook URL

### 2. Add GitHub Secrets

In your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add the following repository secrets:
   - `RENDER_BACKEND_DEPLOY_HOOK`: Your backend service deploy hook URL
   - `RENDER_FRONTEND_DEPLOY_HOOK`: Your frontend service deploy hook URL

### 3. (Optional) Add GitHub Variables

For health checks, you can add these repository variables:
- `BACKEND_URL`: Your backend service URL (e.g., https://your-backend.onrender.com)
- `FRONTEND_URL`: Your frontend service URL (e.g., https://your-frontend.onrender.com)

## Workflow Triggers

The workflow triggers on:
- Push to `main` branch
- Push to `master` branch
- Manual trigger via GitHub Actions UI (workflow_dispatch)

## Workflow Structure

```yaml
┌─────────────────┐
│  Trigger Event  │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Deploy  │──── Parallel Matrix Strategy
    └────┬────┘     ├── Backend Deployment
         │          └── Frontend Deployment
         │
┌────────▼──────────┐
│ Deployment Summary│
└────────┬──────────┘
         │
┌────────▼──────────┐
│ Health Check      │ (Optional)
└───────────────────┘
```

## Customization Options

### Modify Deployment Branches
Edit the `on.push.branches` section to deploy from different branches:
```yaml
on:
  push:
    branches:
      - main
      - production
      - staging
```

### Add Sequential Deployment
If frontend depends on backend being deployed first, modify the strategy:
```yaml
jobs:
  deploy-backend:
    # Backend deployment steps
  
  deploy-frontend:
    needs: deploy-backend  # Wait for backend
    # Frontend deployment steps
```

### Add Environment-Specific Deployments
You can extend the workflow to support multiple environments:
```yaml
on:
  push:
    branches:
      - main        # Production
      - staging     # Staging
      - develop     # Development
```

## Monitoring Deployments

1. **GitHub Actions UI**: View real-time logs and deployment status
2. **GitHub Step Summary**: See deployment results summary after completion
3. **Render Dashboard**: Monitor actual deployment progress and logs

## Troubleshooting

### Deploy Hook Not Found
- Ensure secrets are correctly named and contain the full URL
- Check that the deploy hook URLs are valid and not expired

### Deployment Triggered but Service Not Updated
- Check Render dashboard for deployment logs
- Ensure your Render service is configured to auto-deploy

### Health Checks Failing
- Services may take longer to deploy; adjust the wait time
- Ensure health check endpoints are correctly configured
- Add appropriate health endpoints to your services

## Security Notes

- Deploy hooks are stored as encrypted GitHub secrets
- Never commit deploy hook URLs directly to the repository
- Rotate deploy hooks periodically for security

## Support

For issues with:
- **GitHub Actions**: Check [GitHub Actions documentation](https://docs.github.com/actions)
- **Render Deployments**: Refer to [Render documentation](https://render.com/docs)
