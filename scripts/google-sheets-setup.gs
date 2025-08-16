/**
 * Google Apps Script Backend for EEU Complaint Management System
 * 
 * Deploy this script as a web app with:
 * - Execute as: Me
 * - Who has access: Anyone
 * 
 * Replace YOUR_SPREADSHEET_ID with your actual Google Sheets ID
 */

// Configuration - UPDATE THIS WITH YOUR GOOGLE SHEETS ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

/**
 * Main entry point for POST requests
 */
function doPost(e) {
  try {
    // Log incoming request for debugging
    console.log('Received POST request');
    console.log('Request body:', e.postData.contents);
    
    // Parse the incoming request
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    console.log('Action:', action);
    console.log('Data:', data);
    
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
      case 'health':
        return createResponse(true, { status: 'OK', message: 'Backend is working' });
      default:
        return createResponse(false, null, 'Unknown action: ' + action);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return createResponse(false, null, 'Server error: ' + error.toString());
  }
}

/**
 * Helper function to create standardized responses
 */
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

/**
 * Authentication handler
 */
function handleLogin(data) {
  try {
    const { email, password } = data;
    console.log('Login attempt for:', email);
    
    // Get users from Google Sheets
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
    const users = sheet.getDataRange().getValues();
    
    // Find user (skip header row)
    for (let i = 1; i < users.length; i++) {
      const row = users[i];
      const userEmail = row[1]; // Email in column B
      const userPassword = row[2]; // Password in column C
      
      if (userEmail === email && userPassword === password) {
        const user = {
          id: row[0].toString(),
          email: row[1],
          name: row[3],
          role: row[4],
          region: row[5],
          serviceCenter: row[6] || '',
          phone: row[7] || '',
          isActive: row[8] !== false,
          createdAt: row[9] || new Date().toISOString()
        };
        
        console.log('Login successful for:', email);
        return createResponse(true, { user: user, token: 'session-' + Date.now() });
      }
    }
    
    console.log('Login failed for:', email);
    return createResponse(false, null, 'Invalid email or password');
  } catch (error) {
    console.error('Login error:', error);
    return createResponse(false, null, 'Login failed: ' + error.toString());
  }
}

/**
 * Get all users
 */
function getUsers(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
    const users = sheet.getDataRange().getValues();
    const userList = [];
    
    // Convert rows to user objects (skip header)
    for (let i = 1; i < users.length; i++) {
      const row = users[i];
      userList.push({
        id: row[0].toString(),
        email: row[1],
        name: row[3],
        role: row[4],
        region: row[5],
        serviceCenter: row[6] || '',
        phone: row[7] || '',
        isActive: row[8] !== false,
        createdAt: row[9] || new Date().toISOString()
      });
    }
    
    return createResponse(true, userList);
  } catch (error) {
    console.error('getUsers error:', error);
    return createResponse(false, null, 'Failed to get users: ' + error.toString());
  }
}

/**
 * Create new user
 */
function createUser(data) {
  try {
    const { userData } = data;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
    
    // Generate new ID
    const newId = Date.now().toString();
    
    // Add new user row
    const newRow = [
      newId,
      userData.email,
      userData.password,
      userData.name,
      userData.role,
      userData.region || '',
      userData.serviceCenter || '',
      userData.phone || '',
      true, // isActive
      new Date().toISOString() // createdAt
    ];
    
    sheet.appendRow(newRow);
    
    const newUser = {
      id: newId,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      region: userData.region || '',
      serviceCenter: userData.serviceCenter || '',
      phone: userData.phone || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    return createResponse(true, newUser);
  } catch (error) {
    console.error('createUser error:', error);
    return createResponse(false, null, 'Failed to create user: ' + error.toString());
  }
}

/**
 * Update user
 */
function updateUser(data) {
  try {
    const { id, userData } = data;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
    const users = sheet.getDataRange().getValues();
    
    // Find and update user
    for (let i = 1; i < users.length; i++) {
      if (users[i][0].toString() === id.toString()) {
        // Update row
        sheet.getRange(i + 1, 2).setValue(userData.email);
        sheet.getRange(i + 1, 4).setValue(userData.name);
        sheet.getRange(i + 1, 5).setValue(userData.role);
        sheet.getRange(i + 1, 6).setValue(userData.region || '');
        sheet.getRange(i + 1, 7).setValue(userData.serviceCenter || '');
        sheet.getRange(i + 1, 8).setValue(userData.phone || '');
        sheet.getRange(i + 1, 9).setValue(userData.isActive !== false);
        
        const updatedUser = {
          id: id.toString(),
          email: userData.email,
          name: userData.name,
          role: userData.role,
          region: userData.region || '',
          serviceCenter: userData.serviceCenter || '',
          phone: userData.phone || '',
          isActive: userData.isActive !== false,
          createdAt: users[i][9] || new Date().toISOString()
        };
        
        return createResponse(true, updatedUser);
      }
    }
    
    return createResponse(false, null, 'User not found');
  } catch (error) {
    console.error('updateUser error:', error);
    return createResponse(false, null, 'Failed to update user: ' + error.toString());
  }
}

/**
 * Delete user
 */
function deleteUser(data) {
  try {
    const { id } = data;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
    const users = sheet.getDataRange().getValues();
    
    // Find and delete user
    for (let i = 1; i < users.length; i++) {
      if (users[i][0].toString() === id.toString()) {
        sheet.deleteRow(i + 1);
        return createResponse(true, { id: id });
      }
    }
    
    return createResponse(false, null, 'User not found');
  } catch (error) {
    console.error('deleteUser error:', error);
    return createResponse(false, null, 'Failed to delete user: ' + error.toString());
  }
}

/**
 * Get all complaints
 */
function getComplaints(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Complaints');
    const complaints = sheet.getDataRange().getValues();
    const complaintList = [];
    
    // Convert rows to complaint objects (skip header)
    for (let i = 1; i < complaints.length; i++) {
      const row = complaints[i];
      complaintList.push({
        id: row[0].toString(),
        title: row[1],
        description: row[2],
        category: row[3],
        priority: row[4],
        status: row[5],
        customerName: row[6],
        customerEmail: row[7],
        customerPhone: row[8],
        region: row[9],
        assignedTo: row[10],
        createdAt: row[11] || new Date().toISOString(),
        updatedAt: row[12] || new Date().toISOString()
      });
    }
    
    return createResponse(true, complaintList);
  } catch (error) {
    console.error('getComplaints error:', error);
    return createResponse(false, null, 'Failed to get complaints: ' + error.toString());
  }
}

/**
 * Create new complaint
 */
function createComplaint(data) {
  try {
    const { complaintData } = data;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Complaints');
    
    // Generate new ID
    const newId = Date.now().toString();
    const now = new Date().toISOString();
    
    // Add new complaint row
    const newRow = [
      newId,
      complaintData.title,
      complaintData.description,
      complaintData.category || 'other',
      complaintData.priority || 'medium',
      complaintData.status || 'open',
      complaintData.customerName,
      complaintData.customerEmail || '',
      complaintData.customerPhone || '',
      complaintData.region || '',
      complaintData.assignedTo || '',
      now, // createdAt
      now  // updatedAt
    ];
    
    sheet.appendRow(newRow);
    
    const newComplaint = {
      id: newId,
      title: complaintData.title,
      description: complaintData.description,
      category: complaintData.category || 'other',
      priority: complaintData.priority || 'medium',
      status: complaintData.status || 'open',
      customerName: complaintData.customerName,
      customerEmail: complaintData.customerEmail || '',
      customerPhone: complaintData.customerPhone || '',
      region: complaintData.region || '',
      assignedTo: complaintData.assignedTo || '',
      createdAt: now,
      updatedAt: now
    };
    
    return createResponse(true, newComplaint);
  } catch (error) {
    console.error('createComplaint error:', error);
    return createResponse(false, null, 'Failed to create complaint: ' + error.toString());
  }
}

/**
 * Update complaint
 */
function updateComplaint(data) {
  try {
    const { id, complaintData } = data;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Complaints');
    const complaints = sheet.getDataRange().getValues();
    
    // Find and update complaint
    for (let i = 1; i < complaints.length; i++) {
      if (complaints[i][0].toString() === id.toString()) {
        const now = new Date().toISOString();
        
        // Update row
        sheet.getRange(i + 1, 2).setValue(complaintData.title);
        sheet.getRange(i + 1, 3).setValue(complaintData.description);
        sheet.getRange(i + 1, 4).setValue(complaintData.category);
        sheet.getRange(i + 1, 5).setValue(complaintData.priority);
        sheet.getRange(i + 1, 6).setValue(complaintData.status);
        sheet.getRange(i + 1, 7).setValue(complaintData.customerName);
        sheet.getRange(i + 1, 8).setValue(complaintData.customerEmail || '');
        sheet.getRange(i + 1, 9).setValue(complaintData.customerPhone || '');
        sheet.getRange(i + 1, 10).setValue(complaintData.region || '');
        sheet.getRange(i + 1, 11).setValue(complaintData.assignedTo || '');
        sheet.getRange(i + 1, 13).setValue(now); // updatedAt
        
        const updatedComplaint = {
          id: id.toString(),
          title: complaintData.title,
          description: complaintData.description,
          category: complaintData.category,
          priority: complaintData.priority,
          status: complaintData.status,
          customerName: complaintData.customerName,
          customerEmail: complaintData.customerEmail || '',
          customerPhone: complaintData.customerPhone || '',
          region: complaintData.region || '',
          assignedTo: complaintData.assignedTo || '',
          createdAt: complaints[i][11] || new Date().toISOString(),
          updatedAt: now
        };
        
        return createResponse(true, updatedComplaint);
      }
    }
    
    return createResponse(false, null, 'Complaint not found');
  } catch (error) {
    console.error('updateComplaint error:', error);
    return createResponse(false, null, 'Failed to update complaint: ' + error.toString());
  }
}

/**
 * Get permission matrix
 */
function getPermissionMatrix(data) {
  try {
    // Return default permission matrix
    const permissions = {
      'admin': {
        'users': { create: true, read: true, update: true, delete: true },
        'complaints': { create: true, read: true, update: true, delete: true },
        'reports': { create: true, read: true, update: true, delete: true },
        'settings': { create: true, read: true, update: true, delete: true },
        'notifications': { create: true, read: true, update: true, delete: true }
      },
      'manager': {
        'users': { create: true, read: true, update: true, delete: false },
        'complaints': { create: true, read: true, update: true, delete: false },
        'reports': { create: true, read: true, update: true, delete: false },
        'settings': { create: false, read: true, update: false, delete: false },
        'notifications': { create: false, read: true, update: false, delete: false }
      },
      'foreman': {
        'users': { create: false, read: true, update: false, delete: false },
        'complaints': { create: true, read: true, update: true, delete: false },
        'reports': { create: true, read: true, update: false, delete: false },
        'settings': { create: false, read: true, update: false, delete: false },
        'notifications': { create: false, read: true, update: false, delete: false }
      },
      'call-attendant': {
        'users': { create: false, read: false, update: false, delete: false },
        'complaints': { create: true, read: true, update: true, delete: false },
        'reports': { create: false, read: true, update: false, delete: false },
        'settings': { create: false, read: false, update: false, delete: false },
        'notifications': { create: false, read: true, update: false, delete: false }
      },
      'technician': {
        'users': { create: false, read: false, update: false, delete: false },
        'complaints': { create: false, read: true, update: true, delete: false },
        'reports': { create: false, read: true, update: false, delete: false },
        'settings': { create: false, read: false, update: false, delete: false },
        'notifications': { create: false, read: true, update: false, delete: false }
      }
    };
    
    return createResponse(true, permissions);
  } catch (error) {
    console.error('getPermissionMatrix error:', error);
    return createResponse(false, null, 'Failed to get permission matrix: ' + error.toString());
  }
}

/**
 * Update permission matrix
 */
function updatePermissionMatrix(data) {
  try {
    const { permissions } = data;
    
    // In a real implementation, you would save this to a sheet
    // For now, just return success
    return createResponse(true, permissions);
  } catch (error) {
    console.error('updatePermissionMatrix error:', error);
    return createResponse(false, null, 'Failed to update permission matrix: ' + error.toString());
  }
}

/**
 * Get notifications
 */
function getNotifications(data) {
  try {
    // Return sample notifications for now
    const notifications = [
      {
        id: '1',
        type: 'info',
        title: 'System Update',
        message: 'Backend connected successfully',
        timestamp: new Date().toISOString(),
        isRead: false
      }
    ];
    
    return createResponse(true, notifications);
  } catch (error) {
    console.error('getNotifications error:', error);
    return createResponse(false, null, 'Failed to get notifications: ' + error.toString());
  }
}

/**
 * Test function for debugging
 */
function testBackend() {
  console.log('Testing backend...');
  
  // Test login
  const loginTest = handleLogin({ email: 'admin@eeu.gov.et', password: 'admin123' });
  console.log('Login test:', loginTest.getContent());
  
  // Test getUsers
  const usersTest = getUsers({});
  console.log('Users test:', usersTest.getContent());
}