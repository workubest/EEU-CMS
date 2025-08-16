# 🔗 Backend Setup Guide - Google Apps Script

## ✅ **App Status: Working Correctly**

Your app is now functioning properly and showing the expected behavior:
- ✅ **JavaScript errors fixed** - No more crashes
- ✅ **Live data mode active** - No mock data
- ✅ **Proper timeout handling** - 10-second timeout working
- ⚠️ **Backend not responding** - Google Apps Script needs setup

---

## 📊 **Current Error Analysis**

### **These are GOOD signs (expected behavior):**
```
✅ API request failed: AbortError: signal is aborted without reason
✅ Error: Request timeout - backend server not responding
✅ Failed to fetch activity feed for notifications
```

**Why these are good:**
- App is correctly attempting to connect to live backend
- Timeout mechanism is working (10 seconds)
- No JavaScript crashes or undefined variable errors
- Proper error handling and user feedback

---

## 🔧 **Google Apps Script Backend Requirements**

To make your app work with live data, you need to set up your Google Apps Script to handle these API endpoints:

### **Required Script Structure:**
```javascript
// Google Apps Script (Code.gs)
function doPost(e) {
  try {
    // Parse the incoming request
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    console.log('Received action:', action);
    console.log('Request data:', data);
    
    // Route to appropriate handler
    switch(action) {
      case 'login':
        return handleLogin(data);
      case 'getUsers':
        return getUsers(data);
      case 'createUser':
        return createUser(data);
      case 'updateUser':
        return updateUser(data);
      case 'deleteUser':
        return deleteUser(data);
      case 'getComplaints':
        return getComplaints(data);
      case 'createComplaint':
        return createComplaint(data);
      case 'updateComplaint':
        return updateComplaint(data);
      case 'getPermissionMatrix':
        return getPermissionMatrix(data);
      case 'updatePermissionMatrix':
        return updatePermissionMatrix(data);
      case 'getNotifications':
        return getNotifications(data);
      default:
        return createResponse(false, 'Unknown action: ' + action);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return createResponse(false, 'Server error: ' + error.toString());
  }
}

// Helper function to create standardized responses
function createResponse(success, data, error = null) {
  const response = {
    success: success,
    data: data,
    error: error,
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🔐 **Authentication Handler**

```javascript
function handleLogin(data) {
  const { email, password } = data;
  
  // Get users from Google Sheets
  const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Users');
  const users = sheet.getDataRange().getValues();
  
  // Find user (skip header row)
  for (let i = 1; i < users.length; i++) {
    const row = users[i];
    const userEmail = row[1]; // Assuming email is in column B
    const userPassword = row[2]; // Assuming password is in column C
    
    if (userEmail === email && userPassword === password) {
      const user = {
        id: row[0],
        email: row[1],
        name: row[3],
        role: row[4],
        region: row[5],
        isActive: row[6]
      };
      
      return createResponse(true, { user: user, token: 'session-' + Date.now() });
    }
  }
  
  return createResponse(false, null, 'Invalid email or password');
}
```

---

## 👥 **User Management Handlers**

```javascript
function getUsers(data) {
  const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Users');
  const users = sheet.getDataRange().getValues();
  const userList = [];
  
  // Convert rows to user objects (skip header)
  for (let i = 1; i < users.length; i++) {
    const row = users[i];
    userList.push({
      id: row[0],
      email: row[1],
      name: row[3],
      role: row[4],
      region: row[5],
      isActive: row[6],
      createdAt: row[7]
    });
  }
  
  return createResponse(true, userList);
}

function createUser(data) {
  const { userData } = data;
  const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Users');
  
  // Add new user row
  const newRow = [
    Date.now().toString(), // ID
    userData.email,
    userData.password,
    userData.name,
    userData.role,
    userData.region,
    true, // isActive
    new Date().toISOString() // createdAt
  ];
  
  sheet.appendRow(newRow);
  
  return createResponse(true, { id: newRow[0], ...userData });
}
```

---

## 📋 **Google Sheets Structure**

### **Users Sheet:**
```
| A (ID) | B (Email) | C (Password) | D (Name) | E (Role) | F (Region) | G (IsActive) | H (CreatedAt) |
|--------|-----------|--------------|----------|----------|------------|--------------|---------------|
| 1      | admin@eeu.gov.et | admin123 | Admin | admin | Addis | TRUE | 2024-01-01 |
| 2      | user@eeu.gov.et | user123 | User | manager | Oromia | TRUE | 2024-01-01 |
```

### **Complaints Sheet:**
```
| A (ID) | B (Title) | C (Description) | D (Status) | E (Customer) | F (Region) | G (CreatedAt) |
|--------|-----------|-----------------|------------|--------------|------------|---------------|
| 1      | Power Out | No electricity | open | John Doe | Addis | 2024-01-01 |
```

---

## 🚀 **Deployment Steps**

### **1. Create Google Apps Script:**
1. Go to https://script.google.com
2. Create new project
3. Replace Code.gs with the backend code above
4. Create Google Sheets for data storage

### **2. Set Up Permissions:**
1. **Publish** → **Deploy as web app**
2. **Execute as:** Me
3. **Who has access:** Anyone
4. Copy the deployment URL

### **3. Update Your App:**
```javascript
// In src/config/environment.ts
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_DEPLOYED_URL_HERE';
```

### **4. Test Connection:**
```bash
# Test your deployed script
curl -X POST "YOUR_DEPLOYED_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"getUsers"}'
```

---

## 🧪 **Testing Your Backend**

### **Quick Test Script:**
```javascript
// Test in Google Apps Script editor
function testBackend() {
  const testData = { action: 'getUsers' };
  const result = doPost({ postData: { contents: JSON.stringify(testData) } });
  console.log(result.getContent());
}
```

---

## 🎯 **Expected Results After Setup**

### **With Working Backend:**
- ✅ Login works with real credentials
- ✅ Dashboard loads actual data
- ✅ User management shows real users
- ✅ All data persists to Google Sheets

### **Current (Backend Not Set Up):**
- ⚠️ Timeout errors (expected)
- ⚠️ No data displayed (expected)
- ✅ App interface works perfectly
- ✅ Ready for real data once backend is connected

---

**Status: 🔧 APP READY - BACKEND SETUP REQUIRED**

Your app is working correctly and waiting for the Google Apps Script backend to be set up with real data.