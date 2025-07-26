# Render Deployment Configuration

## Current Deployments
- **Frontend**: https://code-editor-j5qq.onrender.com/
- **Backend**: https://code-editor-backend-26a6.onrender.com/

## Required Environment Variable Updates

### Frontend Service (code-editor-j5qq)
In your Render dashboard, update these environment variables:

1. **NEXT_PUBLIC_API_URL**
   - Value: `https://code-editor-backend-26a6.onrender.com/api`
   - This tells your frontend where to find the backend API

### Backend Service (code-editor-backend-26a6)
In your Render dashboard, update these environment variables:

1. **CORS_ORIGIN**
   - Value: `https://code-editor-j5qq.onrender.com`
   - This allows your frontend to make requests to the backend

2. **JWT_COOKIE_DOMAIN** (if using cookies)
   - Value: `.onrender.com`
   - This allows cookies to work across subdomains

## How to Update Environment Variables on Render

1. Log in to your Render dashboard
2. Navigate to your service (frontend or backend)
3. Click on "Environment" in the left sidebar
4. Add or update the environment variables listed above
5. Click "Save Changes"
6. The service will automatically redeploy with the new settings

## Verify the Configuration

After updating both services, test the connection:

1. Visit https://code-editor-j5qq.onrender.com/
2. Try to register or log in
3. Check the browser console for any CORS errors
4. Check the network tab to ensure requests go to the correct backend URL

## Troubleshooting

If you still see errors:

1. **404 Errors**: Ensure all API calls include `/api` prefix
2. **CORS Errors**: Double-check the CORS_ORIGIN value matches exactly (no trailing slash)
3. **Connection Refused**: Ensure the backend is running and healthy

## Backend Health Check
Visit: https://code-editor-backend-26a6.onrender.com/api/health

## API Documentation
Visit: https://code-editor-backend-26a6.onrender.com/api/docs
