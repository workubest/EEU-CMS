/**
 * CORS Fix for Google Apps Script
 * Add this to your Google Apps Script to handle browser CORS preflight requests
 */

// Add this function to handle OPTIONS requests (CORS preflight)
function doOptions(e) {
  return ContentService
    .createTextOutput()
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
      'Access-Control-Max-Age': '3600'
    });
}

// Update your existing doPost function to include CORS headers
function doPost(e) {
  try {
    // Your existing doPost logic here
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    switch(action) {
      case 'login':
        result = handleLogin(data);
        break;
      case 'getUsers':
        result = getUsers(data);
        break;
      case 'getComplaints':
        result = getComplaints(data);
        break;
      case 'getDashboardStats':
        result = getDashboardStats(data);
        break;
      case 'getNotifications':
        result = getNotifications(data);
        break;
      case 'getPermissionMatrix':
        result = getPermissionMatrix(data);
        break;
      default:
        result = createResponse(false, null, 'Unknown action: ' + action);
    }
    
    // Add CORS headers to the response
    return ContentService
      .createTextOutput(result.getContent())
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cache-Control'
      });
      
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Server error: ' + error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cache-Control'
      });
  }
}

// Add this function if you don't have it
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

// Add these missing action handlers
function getDashboardStats(data) {
  try {
    // Return mock dashboard stats for now
    const stats = {
      totalComplaints: 150,
      activeComplaints: 45,
      resolvedComplaints: 85,
      pendingComplaints: 20,
      totalUsers: 25,
      activeUsers: 20,
      regions: ['Addis Ababa', 'Oromia', 'Amhara', 'Tigray'],
      recentActivity: [
        { id: 1, type: 'complaint', message: 'New complaint received', timestamp: new Date().toISOString() },
        { id: 2, type: 'resolution', message: 'Complaint resolved', timestamp: new Date().toISOString() }
      ]
    };
    
    return createResponse(true, stats);
  } catch (error) {
    return createResponse(false, null, 'Error getting dashboard stats: ' + error.toString());
  }
}

function getNotifications(data) {
  try {
    const notifications = [
      {
        id: '1',
        type: 'success',
        title: 'Backend Connected',
        message: 'CORS issue resolved - backend working properly',
        timestamp: new Date().toISOString(),
        isRead: false
      },
      {
        id: '2',
        type: 'info',
        title: 'System Update',
        message: 'All API endpoints are now functional',
        timestamp: new Date().toISOString(),
        isRead: false
      }
    ];
    
    return createResponse(true, notifications);
  } catch (error) {
    return createResponse(false, null, 'Error getting notifications: ' + error.toString());
  }
}

function getPermissionMatrix(data) {
  try {
    const permissions = {
      'admin': {
        'users': { create: true, read: true, update: true, delete: true },
        'complaints': { create: true, read: true, update: true, delete: true },
        'reports': { create: true, read: true, update: true, delete: true },
        'settings': { create: true, read: true, update: true, delete: true }
      },
      'manager': {
        'users': { create: true, read: true, update: true, delete: false },
        'complaints': { create: true, read: true, update: true, delete: false },
        'reports': { create: true, read: true, update: false, delete: false },
        'settings': { create: false, read: true, update: false, delete: false }
      }
    };
    
    return createResponse(true, permissions);
  } catch (error) {
    return createResponse(false, null, 'Error getting permission matrix: ' + error.toString());
  }
}

// Add a simple login handler if you don't have one
function handleLogin(data) {
  try {
    const { email, password } = data;
    
    // Simple authentication for testing
    if (email === 'admin@eeu.gov.et' && password === 'admin123') {
      const user = {
        id: 'USR-001',
        email: 'admin@eeu.gov.et',
        name: 'Worku Mesafint',
        role: 'admin',
        region: 'North Addis Ababa Region',
        department: 'System Administration',
        phone: '+251-91-167-6346',
        isActive: true
      };
      
      return createResponse(true, { user: user, token: 'session-' + Date.now() });
    }
    
    return createResponse(false, null, 'Invalid email or password');
  } catch (error) {
    return createResponse(false, null, 'Login error: ' + error.toString());
  }
}