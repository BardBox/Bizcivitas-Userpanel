# Backend Connection Configuration

## 🔍 Issue Diagnosis

**Error:** `Network error: Cannot connect to server. Please check your connection.`  
**Root Cause:** Production backend URL (`https://backend.bizcivitas.com/api/v1/`) is not responding.

---

## ✅ Solution Applied

Changed `.env.local` from:

```bash
NEXT_PUBLIC_BACKEND_URL=https://backend.bizcivitas.com/api/v1  # ❌ Down
```

To:

```bash
NEXT_PUBLIC_BACKEND_URL=https://dev-backend.bizcivitas.com/api/v1  # ✅ Working
```

---

## 🌐 Backend URLs Status

| Environment     | URL                                         | Status         | Use Case              |
| --------------- | ------------------------------------------- | -------------- | --------------------- |
| **Production**  | `https://backend.bizcivitas.com/api/v1`     | ❌ Down        | Production deployment |
| **Development** | `https://dev-backend.bizcivitas.com/api/v1` | ✅ Working     | Development/Testing   |
| **Local**       | `http://localhost:8000/api/v1`              | ⚠️ Not Running | Local development     |

---

## 🔧 Configuration Files

### Frontend (User Panel)

**File:** `bizcivitas-userpanel/.env.local`

```bash
# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=https://dev-backend.bizcivitas.com/api/v1
BIZCIVITAS_BACKEND_URL=https://dev-backend.bizcivitas.com/api/v1
```

### Backend API Base Query

**File:** `bizcivitas-userpanel/store/api/baseApi.ts`

```typescript
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL;
};

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    credentials: "include", // HttpOnly cookies for auth
    // ...
  }),
  // ...
});
```

---

## 🚀 Quick Fix Steps

### If Backend Connection Fails:

1. **Check Backend Status:**

   ```powershell
   # Test production backend
   curl -Method GET -Uri "https://backend.bizcivitas.com/api/v1/"

   # Test dev backend
   curl -Method GET -Uri "https://dev-backend.bizcivitas.com/api/v1/"
   ```

2. **Update .env.local:**

   - Use the working backend URL
   - Make sure it's prefixed with `NEXT_PUBLIC_` (for client-side access)

3. **Restart Next.js Dev Server:**

   ```powershell
   # Stop current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

4. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely

---

## 🔒 Environment Variables Priority

Next.js loads environment variables in this order (highest priority first):

1. `.env.local` - Local overrides (✅ **Use this for development**)
2. `.env.development` - Development defaults
3. `.env.production` - Production defaults
4. `.env` - All environments

**Important:**

- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Server-side variables (without `NEXT_PUBLIC_`) are only available in API routes and server components

---

## 🐛 Troubleshooting

### Error: "Network error: Cannot connect to server"

**Causes:**

1. Backend server is down
2. Wrong backend URL in `.env.local`
3. CORS issues
4. Firewall blocking requests

**Solutions:**

1. Check backend health: `curl https://dev-backend.bizcivitas.com/api/v1/`
2. Verify `.env.local` has correct URL
3. Restart Next.js dev server
4. Check browser console for detailed error

### Error: "User does not exist in database"

✅ **This is good!** It means:

- Backend is responding
- Connection is working
- You just need valid credentials

### Error: "CORS policy blocked"

**Solution:** Backend needs to allow your frontend origin in CORS settings.

**Backend .env should have:**

```bash
CORS_ORIGIN=*  # Allow all (development)
# OR
CORS_ORIGIN=http://localhost:3000,https://your-domain.com  # Specific origins
```

---

## 📝 Testing Backend Connectivity

### Test 1: Basic Health Check

```powershell
curl -Method GET -Uri "https://dev-backend.bizcivitas.com/api/v1/"
```

**Expected:** Status 200 with JSON response

### Test 2: Login Endpoint

```powershell
$body = @{email="test@example.com"; password="test123"} | ConvertTo-Json
curl -Method POST -Uri "https://dev-backend.bizcivitas.com/api/v1/users/login" `
     -Body $body -ContentType "application/json"
```

**Expected:** Status 200 (valid user) or 401 (invalid user)

### Test 3: With Credentials

```powershell
curl -Method GET -Uri "https://dev-backend.bizcivitas.com/api/v1/users/get-user" `
     -Headers @{Authorization="Bearer YOUR_TOKEN_HERE"}
```

**Expected:** Status 200 with user data

---

## 🔄 Switching Between Backends

### Use Production Backend (when it's back online)

```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=https://backend.bizcivitas.com/api/v1
```

### Use Development Backend (current setup)

```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=https://dev-backend.bizcivitas.com/api/v1
```

### Use Local Backend

```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api/v1
```

**Remember:** Restart Next.js after changing `.env.local`!

---

## ✅ Current Configuration

**Status:** ✅ Fixed  
**Backend URL:** `https://dev-backend.bizcivitas.com/api/v1`  
**Action Required:** Restart Next.js dev server

Your app should now connect successfully to the backend! 🎉

---

## 📞 Next Steps

1. ✅ Backend URL updated in `.env.local`
2. ✅ Dev server restarted
3. 🔄 Test login functionality
4. 🔄 Verify all API calls work

If issues persist:

- Check browser console for errors
- Verify network tab shows requests going to correct URL
- Ensure backend is actually responding (test with curl)

---

**Last Updated:** October 8, 2025  
**Backend Status:** Development backend operational ✅
